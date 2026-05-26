#!/usr/bin/env bash
# Crea TrackAidDB y aplica schema.sql (Codespace / local con Docker).
set -euo pipefail
cd "$(dirname "$0")/.."

SA_PASSWORD="${SQLSERVER_PASSWORD:-TrackAid_Secure2026!}"
CONTAINER="${SQL_CONTAINER:-trackaid-sql}"

echo "Copiando schema.sql al contenedor ${CONTAINER}..."
docker cp schema.sql "${CONTAINER}:/tmp/schema.sql"

echo "Aplicando schema (puede tardar unos segundos)..."
docker exec "${CONTAINER}" /opt/mssql-tools18/bin/sqlcmd \
  -S localhost -U sa -P "${SA_PASSWORD}" -C \
  -i /tmp/schema.sql

echo "Base TrackAidDB lista."
