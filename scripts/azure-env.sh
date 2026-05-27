#!/usr/bin/env bash
# Aplica variables de entorno en Azure App Service (edita los valores antes de ejecutar).
set -euo pipefail

RG="${AZURE_RG:-mi-app-fastapi-mateo-v1-rg}"
APP="${AZURE_APP:-mi-app-fastapi-mateo-v1}"

# --- Edita esto ---
SQL_HOST="${SQLSERVER_HOST:-TU_SERVIDOR.database.windows.net,1433}"
SQL_DB="${SQLSERVER_DATABASE:-TrackAidDB}"
SQL_USER="${SQLSERVER_USER:-sqladmin}"
SQL_PASS="${SQLSERVER_PASSWORD:-CAMBIAR_PASSWORD}"
APP_URL="${APP_URL:-https://${APP}.azurewebsites.net}"

if [ "$SQL_PASS" = "CAMBIAR_PASSWORD" ]; then
  echo "Edita SQLSERVER_PASSWORD o exporta la variable antes de ejecutar."
  echo "  export SQLSERVER_PASSWORD='tu_password'"
  exit 1
fi

echo "Configurando $APP en $RG ..."

az webapp config set \
  --resource-group "$RG" \
  --name "$APP" \
  --startup-file "bash startup.sh"

az webapp config appsettings set \
  --resource-group "$RG" \
  --name "$APP" \
  --settings \
    SQLSERVER_HOST="$SQL_HOST" \
    SQLSERVER_DATABASE="$SQL_DB" \
    SQLSERVER_USER="$SQL_USER" \
    SQLSERVER_PASSWORD="$SQL_PASS" \
    SQLSERVER_ENCRYPT=yes \
    SQLSERVER_TRUST_CERT=no \
    WEB_CONCURRENCY=1 \
    SCM_DO_BUILD_DURING_DEPLOYMENT=true \
    CORS_ORIGINS="$APP_URL"

echo "Listo. Despliega con: bash scripts/azure-deploy-zip.sh && az webapp deploy -g $RG -n $APP --src-path azure-deploy.zip --type zip"
