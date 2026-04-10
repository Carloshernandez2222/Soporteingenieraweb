#!/bin/bash
# Arranque en Azure App Service (Linux) o local con Gunicorn + Uvicorn workers.
# En el portal: comando de inicio = "bash startup.sh" (o ruta completa bajo /home/site/wwwroot).
set -e
cd "$(dirname "$0")"

export PYTHONPATH="${PYTHONPATH}:$(pwd)"

PORT="${PORT:-8000}"
# Planes pequeños (F1/B1): 1–2 workers; ajuste con WEB_CONCURRENCY en Application settings.
WORKERS="${WEB_CONCURRENCY:-2}"

# SQLite persistente fuera del despliegue que se sobrescribe (recomendado en Azure)
if [ -z "${DATABASE_PATH:-}" ] && [ -d "/home/site" ]; then
  mkdir -p /home/site/data 2>/dev/null || true
  export DATABASE_PATH="/home/site/data/soporte.db"
fi

echo "=========================================="
echo "Iniciando API (Gunicorn + Uvicorn) puerto ${PORT}, workers=${WORKERS}"
echo "DATABASE_PATH=${DATABASE_PATH:-<repo>/soporte.db por defecto>}"
echo "=========================================="

exec gunicorn -w "${WORKERS}" -k uvicorn.workers.UvicornWorker conection:test --bind "0.0.0.0:${PORT}"
