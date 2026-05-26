# Soporteingenieraweb (TrackAid)

API FastAPI + SPA React (Vite). Centro de soporte con registro de incidencias, panel por roles y taller en SQLite.

## Arquitectura (MVC)

| Capa | Ubicación | Rol |
|------|-----------|-----|
| **Modelos** | `Backend/models/` | Esquemas Pydantic y DTOs (`auth_schemas`, `caso_soporte`, etc.). |
| **Vistas** | `Backend/views/` | Capa de presentación API (respuestas JSON); en REST suele integrarse en controladores. |
| **Controladores** | `Backend/controllers/` | Rutas HTTP: `auth`, `casos`, `registro`, `health`, `spa`. |
| **Servicios** | `Backend/services/` | Lógica de negocio y acceso a datos: `auth`, `soporte`, `taller` (SQLite/SQLModel). |
| **Fábrica** | `Backend/app_factory.py` | Patrón Fábrica: ensambla middleware, routers y excepciones. |
| **Entrada** | `conection.py` / `Backend/conection.py` | Expone `test` para Gunicorn/Uvicorn (`conection:test`). |

Utilidades: `Backend/core/exceptions.py`, `Backend/dependencies.py`, `Backend/constants.py`, `Backend/utils/email_utils.py`.

## Desarrollo local

```bash
python -m venv .venv && source .venv/bin/activate   # Windows: .venv\Scripts\activate
pip install -r requirements.txt
pip install -r requirements-dev.txt   # opcional: tests

# Backend
uvicorn conection:test --reload --host 127.0.0.1 --port 8000

# Frontend (otra terminal)
cd frontend && npm install && npm run dev
```

- Variable opcional: `DATABASE_PATH` (ruta al archivo SQLite; por defecto `soporte.db` en la raíz del repo).

## Despliegue en Azure App Service (Linux)

Ya tienes referencia en `.azure/config` (grupo, plan, web app). Pasos habituales:

### Si ves `Frontend no construido` en el navegador

Eso significa que en el servidor **no existe** `frontend/dist/index.html`.

**Si usas `az webapp up`:** el CLI arma el zip **saltándose todo lo que está en `.gitignore`**. Como **`frontend/dist/` está ignorado**, **aunque hayas hecho `npm run build` en local, esa carpeta no entra en el zip** y Azure nunca recibe el front. No es que el build falle: simplemente **no se sube**.

**Arreglo inmediato (recomendado con `az webapp up` / zip):**

```bash
bash scripts/azure-deploy-zip.sh
az webapp deploy --resource-group mi-app-fastapi-mateo-v1-rg --name mi-app-fastapi-mateo-v1 --src-path azure-deploy.zip --type zip
```

(Si `az webapp deploy` no existe en tu versión del CLI: `az webapp deployment source config-zip --resource-group ... --name ... --src azure-deploy.zip`.)

El script compila el front y crea **`azure-deploy.zip`** incluyendo `frontend/dist` (ignorado en git pero sí en el paquete).

**Alternativa:** no uses zip local y deja que el servidor compile con **`POST_BUILD_COMMAND`** + **`WEBSITE_NODE_DEFAULT_VERSION`** (tabla siguiente).

**Opción A (recomendada si despliegas desde Git en el portal):** en **Configuration → Application settings** añada:

| Nombre | Valor |
|--------|--------|
| `WEBSITE_NODE_DEFAULT_VERSION` | `~20` |
| `POST_BUILD_COMMAND` | `cd frontend && npm ci && npm run build` |

Así Oryx ejecuta ese comando **al final del build de despliegue** (no en cada arranque) y genera `frontend/dist`. Vuelva a desplegar desde Git tras guardar.

Si `POST_BUILD_COMMAND` no se aplicara en su plan, use **`POST_BUILD_SCRIPT_PATH`** apuntando al script del repo (ruta típica en el sitio: `/home/site/wwwroot/scripts/azure-frontend-build.sh`) y asegúrese de que el archivo sea ejecutable (`chmod +x`).

**Opción B (solo si no usa Azure o controla el tiempo de arranque):** variable `RUN_FRONTEND_BUILD_ON_START=1` hace que `startup.sh` ejecute `npm ci && npm run build` si falta `dist`. **En App Service suele provocar 503** por tiempo de inicio; prefiera la opción A. `SKIP_FRONTEND_BUILD=1` evita cualquier build en arranque.

**Opción C:** en su PC, antes de crear el paquete de despliegue:

```bash
cd frontend && npm ci && npm run build && cd ..
```

Incluya la carpeta **`frontend/dist`** en el zip que sube a App Service (aunque no esté en git).

### Checklist de despliegue

1. **Build del frontend** (obligatorio en algún paso del flujo): los estáticos van a `frontend/dist` y el backend los sirve bajo `/` y `/assets`:
   ```bash
   cd frontend && npm ci && npm run build && cd ..
   ```

2. **Python**: Oryx detecta `requirements.txt` en la raíz e instala dependencias. El archivo `runtime.txt` fija la versión (`python-3.12`); ajústela si su App Service usa otra stack.

3. **Comando de inicio** (Configuration → General settings → Startup Command):
   ```bash
   bash startup.sh
   ```
   O la ruta absoluta bajo `/home/site/wwwroot/startup.sh` según el despliegue.

4. **Variables de aplicación** (recomendadas):
   - `WEBSITES_PORT`: lo define Azure; el script usa `PORT`.
   - `WEB_CONCURRENCY`: número de workers Gunicorn (en plan F1 suele bastar `1` o `2`).
   - `DATABASE_PATH`: si no se define y existe `/home/site`, el script usa **`/home/site/data/soporte.db`** para persistir la base entre reinicios (mejor que solo el directorio desplegado). Puedes fijarla a mano a un recurso compartido o montaje si lo configuráis.
   - `CORS_ORIGINS` (opcional): lista separada por comas, p. ej. `https://tu-app.azurewebsites.net`. Si está vacía, CORS sigue permitiendo `*` (útil en desarrollo).

5. **CORS**: por defecto `allow_origins=["*"]`. En producción defina `CORS_ORIGINS` con el dominio público del sitio.

6. **HTTPS**: App Service termina TLS; la app escucha HTTP internamente en `PORT`.

### `az webapp up` devuelve 409 (zip deployment)

Ese código suele indicar **conflicto con el modo de despliegue** o **otro deploy en curso**.

1. **Quitar ejecución desde paquete remoto** (incompatible con el zip que sube `az webapp up`):

   ```bash
   az webapp config appsettings delete \
     --name mi-app-fastapi-mateo-v1 \
     --resource-group mi-app-fastapi-mateo-v1-rg \
     --setting-names WEBSITE_RUN_FROM_PACKAGE
   ```

   Si existía **`WEBSITE_RUN_FROM_ZIP`**, elimínela del mismo modo. Liste todo con:

   ```bash
   az webapp config appsettings list \
     --name mi-app-fastapi-mateo-v1 \
     --resource-group mi-app-fastapi-mateo-v1-rg -o table
   ```

2. **Esperar** a que termine un despliegue anterior (portal → **Deployment Center** / Kudu → **Deployments**) o revise el estado en la URL que muestra el CLI.

3. Vuelva a ejecutar `az webapp up ...`.

Si prefiere seguir usando **Run From Package** (`WEBSITE_RUN_FROM_PACKAGE=1`), no use `az webapp up` con zip: despliegue el `.zip` por otra vía (p. ej. `az webapp deployment source config-zip`) y deje coherente la documentación de Microsoft para ese flujo.

### Comprobación

- `GET /health` → incluye `frontend_index`, `frontend_assets`, `frontend_images` (si alguno es `false`, falta build o carpeta `dist/images` desde `public/images`).
- Documentación: `/docs` (solo si el build del front existe o la ruta no cae en la SPA según orden de rutas; en la práctica `/docs` y `/openapi.json` los expone FastAPI antes del fallback SPA).

## Tests

```bash
pytest test/test_api.py -q
```
