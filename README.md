# Soporteingenieraweb (TrackAid)

API FastAPI + SPA React (Vite). Centro de soporte con registro de incidencias, panel por roles y taller en SQLite.

## Arquitectura (MVC)

| Capa | Ubicación | Rol |
|------|-----------|-----|
| **Modelos** | `src/models/` | Esquemas Pydantic y DTOs (`auth_schemas`, `caso_soporte`, etc.). |
| **Vistas** | `src/views/` | Capa de presentación API (respuestas JSON); en REST suele integrarse en controladores. |
| **Controladores** | `src/controllers/` | Rutas HTTP: `auth`, `casos`, `registro`, `health`, `spa`. |
| **Servicios** | `src/services/` | Lógica de negocio y acceso a datos: `auth`, `soporte`, `taller` (SQLite). |
| **Fábrica** | `src/app_factory.py` | Ensambla middleware, routers y excepciones. |
| **Entrada** | `conection.py` | Expone `test` para Gunicorn/Uvicorn (`conection:test`). |

Utilidades: `src/exceptions.py`, `src/dependencies.py`, `src/constants.py`, `src/email_utils.py`.

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

Eso significa que en el servidor **no existe** `frontend/dist/index.html`. Esa carpeta **no se sube con git** (está ignorada); hay que generarla en el despliegue o en tu máquina antes del zip.

**Opción A (recomendada en Azure):** en **Configuration → Application settings** añada:

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

### Comprobación

- `GET /health` → `{"status":"ok","frontend_index":true,"frontend_assets":true}` (si algún `frontend_*` es `false`, faltó `npm run build` en el servidor o el despliegue no incluye `frontend/dist`).
- Documentación: `/docs` (solo si el build del front existe o la ruta no cae en la SPA según orden de rutas; en la práctica `/docs` y `/openapi.json` los expone FastAPI antes del fallback SPA).

## Tests

```bash
pytest test/test_api.py -q
```
