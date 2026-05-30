# Despliegue en Azure App Service (orden completo)

Proyecto: **TrackAid** — FastAPI (Gunicorn + Uvicorn) + React en `frontend/dist`.

Nombres de ejemplo del README (ajústalos si los tuyos son otros):

| Recurso | Nombre ejemplo |
|---------|----------------|
| Grupo de recursos | `mi-app-fastapi-mateo-v1-rg` |
| App Service | `mi-app-fastapi-mateo-v1` |
| URL pública | `https://mi-app-fastapi-mateo-v1.azurewebsites.net` |

---

## Fase 0 — Requisitos en tu máquina o Codespace

1. Cuenta de Azure con suscripción activa.
2. [Azure CLI](https://learn.microsoft.com/cli/azure/install-azure-cli) instalado.
3. Sesión iniciada:

```bash
az login
az account set --subscription "NOMBRE_O_ID_DE_TU_SUSCRIPCION"
az account show -o table
```

4. Código actualizado:

```bash
cd /workspaces/Soporteingenieraweb   # o la ruta de tu clone
git pull origin main
```

---

## Fase 1 — Base de datos SQL en Azure

En Codespace usaste **SQL Server en Docker**. En Azure necesitas **Azure SQL Database** (o un SQL Server accesible desde Internet).

### 1.1 Crear servidor y base (si aún no existen)

```bash
RG="mi-app-fastapi-mateo-v1-rg"
LOCATION="eastus"
SQL_SERVER="trackaid-sql-$(whoami | tr '[:upper:]' '[:lower:]' | tr -cd 'a-z0-9' | head -c 12)"
SQL_ADMIN="sqladmin"
SQL_PASS='TU_PASSWORD_SEGURO_AQUI'   # cámbialo
DB_NAME="TrackAidDB"

az group create -n "$RG" -l "$LOCATION" 2>/dev/null || true

az sql server create \
  --name "$SQL_SERVER" \
  --resource-group "$RG" \
  --location "$LOCATION" \
  --admin-user "$SQL_ADMIN" \
  --admin-password "$SQL_PASS"

az sql server firewall-rule create \
  --resource-group "$RG" \
  --server "$SQL_SERVER" \
  --name AllowAzure \
  --start-ip-address 0.0.0.0 \
  --end-ip-address 0.0.0.0

az sql db create \
  --resource-group "$RG" \
  --server "$SQL_SERVER" \
  --name "$DB_NAME" \
  --service-objective S0
```

Anota:

- **Servidor:** `trackaid-sql-xxx.database.windows.net`
- **Base:** `TrackAidDB`
- **Usuario:** `sqladmin`
- **Contraseña:** la que elegiste

### 1.2 Aplicar el esquema (`schema.sql`)

Desde tu PC/Codespace (con `sqlcmd` o Azure Data Studio), conéctate al servidor Azure SQL y ejecuta el archivo `schema.sql` del repositorio.

Con `sqlcmd` (si lo tienes):

```bash
sqlcmd -S trackaid-sql-xxx.database.windows.net -d TrackAidDB -U sqladmin -P 'TU_PASSWORD' -N -C -i schema.sql
```

---

## Fase 2 — App Service (si ya existe, salta a Fase 3)

```bash
RG="mi-app-fastapi-mateo-v1-rg"
APP="mi-app-fastapi-mateo-v1"
PLAN="mi-app-fastapi-mateo-v1-plan"
LOCATION="eastus"

az appservice plan create --name "$PLAN" --resource-group "$RG" --sku B1 --is-linux

az webapp create \
  --resource-group "$RG" \
  --plan "$PLAN" \
  --name "$APP" \
  --runtime "PYTHON:3.12"
```

---

## Fase 3 — Configuración de la Web App (portal o CLI)

### 3.1 Comando de inicio

**Configuration → General settings → Startup Command:**

```bash
bash startup.sh
```

### 3.2 Application settings (variables)

Sustituye con tus datos de Azure SQL:

| Nombre | Valor ejemplo |
|--------|----------------|
| `SQLSERVER_HOST` | `tuservidor.database.windows.net,1433` |
| `SQLSERVER_DATABASE` | `TrackAidDB` |
| `SQLSERVER_USER` | `sqladmin` |
| `SQLSERVER_PASSWORD` | `TU_PASSWORD` |
| `SQLSERVER_ENCRYPT` | `yes` |
| `SQLSERVER_TRUST_CERT` | `no` |
| `WEB_CONCURRENCY` | `1` (plan F1) o `2` (B1+) |
| `CORS_ORIGINS` | `https://mi-app-fastapi-mateo-v1.azurewebsites.net` |
| `SCM_DO_BUILD_DURING_DEPLOYMENT` | `true` |

Opcional (usuarios demo al arrancar):

| `SKIP_DB_SEED` | `0` o no definir |

**No definas** `WEBSITE_RUN_FROM_PACKAGE` si despliegas con zip local (ver Fase 5).

### 3.3 Aplicar settings por CLI (plantilla)

Edita `scripts/azure-env.sh` con tus valores y ejecuta:

```bash
bash scripts/azure-env.sh
```

---

## Fase 4 — Crear el paquete de despliegue (con frontend compilado)

En la **raíz del repo** (no dentro de `frontend`):

```bash
cd /workspaces/Soporteingenieraweb
bash scripts/azure-deploy-zip.sh
```

Genera `azure-deploy.zip` con `frontend/dist` incluido.

---

## Fase 5 — Subir a Azure

```bash
RG="mi-app-fastapi-mateo-v1-rg"
APP="mi-app-fastapi-mateo-v1"

az webapp deploy \
  --resource-group "$RG" \
  --name "$APP" \
  --src-path azure-deploy.zip \
  --type zip
```

Si tu CLI es antigua:

```bash
az webapp deployment source config-zip \
  --resource-group "$RG" \
  --name "$APP" \
  --src azure-deploy.zip
```

Espera 2–5 minutos. Revisa en portal → **Deployment Center** → logs.

---

## Fase 6 — Comprobar que todo funciona

### 6.1 Salud

```bash
curl -s "https://mi-app-fastapi-mateo-v1.azurewebsites.net/health" | python3 -m json.tool
```

Debe mostrar:

- `"frontend_index": true`
- `"frontend_assets": true`
- `"database_ok": true`

### 6.2 Login demo

```bash
curl -s -X POST "https://mi-app-fastapi-mateo-v1.azurewebsites.net/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"webmaster@trackaid.demo","password":"TrackAid2026!"}'
```

### 6.3 Navegador

1. Abre `https://TU-APP.azurewebsites.net`
2. Inicia sesión con `webmaster@trackaid.demo` / `TrackAid2026!`
3. Prueba `/demo` y el panel

---

## Fase 7 — Despliegue alternativo desde GitHub

1. Portal → App Service → **Deployment Center**.
2. Origen: **GitHub** → repo `Soporteingenieraweb` → rama `main`.
3. En **Application settings** añade:
   - `WEBSITE_NODE_DEFAULT_VERSION` = `~20`
   - `POST_BUILD_COMMAND` = `cd frontend && npm ci && npm run build`
4. `Startup Command` = `bash startup.sh`
5. Mismas variables SQL de la Fase 3.
6. Guarda y **Sync**.

---

## Problemas frecuentes

| Síntoma | Solución |
|---------|----------|
| `Frontend no construido` | Usar `azure-deploy-zip.sh` o `POST_BUILD_COMMAND` |
| 503 al arrancar | `WEB_CONCURRENCY=1`; no uses `RUN_FRONTEND_BUILD_ON_START=1` |
| `database_ok: false` | Revisar `SQLSERVER_*`, firewall Azure SQL, `schema.sql` aplicado |
| Error ODBC en logs | En Azure SQL usa `TrustServerCertificate=no`; host `*.database.windows.net,1433` |
| 409 al desplegar | Quitar `WEBSITE_RUN_FROM_PACKAGE`; esperar deploy anterior |
| Login 500 | Log stream: `az webapp log tail -g RG -n APP` |

### Ver logs en vivo

```bash
az webapp log tail --resource-group mi-app-fastapi-mateo-v1-rg --name mi-app-fastapi-mateo-v1
```

---

## Resumen en 6 comandos (si ya tienes App + Azure SQL)

```bash
cd /workspaces/Soporteingenieraweb
git pull origin main
# (configurar variables en portal o scripts/azure-env.sh)
bash scripts/azure-deploy-zip.sh
az webapp deploy -g mi-app-fastapi-mateo-v1-rg -n mi-app-fastapi-mateo-v1 --src-path azure-deploy.zip --type zip
curl -s https://mi-app-fastapi-mateo-v1.azurewebsites.net/health
```
