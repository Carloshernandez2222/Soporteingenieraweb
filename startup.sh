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

# La SPA se sirve desde frontend/dist (no va en git).
# Por defecto NO compilamos en el arranque: en Azure suele superar el tiempo de inicio y el balanceador
# devuelve 503 aunque la app sea correcta. Use POST_BUILD_COMMAND en despliegue (ver README).
# Para forzar build al iniciar (p. ej. contenedor propio): RUN_FRONTEND_BUILD_ON_START=1
FRONT_INDEX="frontend/dist/index.html"
if [ ! -f "$FRONT_INDEX" ] && [ "${RUN_FRONTEND_BUILD_ON_START:-0}" = "1" ] && [ "${SKIP_FRONTEND_BUILD:-0}" != "1" ]; then
  echo "=========================================="
  echo "RUN_FRONTEND_BUILD_ON_START=1: no se encontró $FRONT_INDEX; compilando con npm..."
  if command -v npm >/dev/null 2>&1 && [ -f "frontend/package.json" ]; then
    (cd frontend && npm ci --no-audit --no-fund && npm run build) || {
      echo "ERROR: npm run build falló."
    }
  else
    echo "ERROR: npm no está en PATH."
  fi
  echo "=========================================="
elif [ ! -f "$FRONT_INDEX" ]; then
  echo "ADVERTENCIA: falta $FRONT_INDEX — defina POST_BUILD_COMMAND en Azure o RUN_FRONTEND_BUILD_ON_START=1 (ver README)."
fi

echo "=========================================="
echo "Iniciando API (Gunicorn + Uvicorn) puerto ${PORT}, workers=${WORKERS}"
echo "DATABASE_PATH=${DATABASE_PATH:-<repo>/soporte.db por defecto>}"
if [ -f "$FRONT_INDEX" ]; then
  echo "Frontend: OK ($FRONT_INDEX)"
else
  echo "Frontend: SIN dist — GET / devolverá error hasta compilar."
fi
echo "=========================================="

exec gunicorn -w "${WORKERS}" -k uvicorn.workers.UvicornWorker Backend.conection:test --bind "0.0.0.0:${PORT}"