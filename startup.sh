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

# La SPA se sirve desde frontend/dist (no va en git). Si falta, intentar compilar si hay Node/npm.
FRONT_INDEX="frontend/dist/index.html"
if [ ! -f "$FRONT_INDEX" ] && [ "${SKIP_FRONTEND_BUILD:-0}" != "1" ]; then
  echo "=========================================="
  echo "No se encontró $FRONT_INDEX (Vite no está construido)."
  if command -v npm >/dev/null 2>&1 && [ -f "frontend/package.json" ]; then
    echo "Compilando frontend con npm (puede tardar la primera vez)..."
    (cd frontend && npm ci --no-audit --no-fund && npm run build) || {
      echo "ERROR: npm run build falló. Revise logs o construya en CI y despliegue con dist/."
      echo "Opciones: en Azure defina WEBSITE_NODE_DEFAULT_VERSION y POST_BUILD_COMMAND (ver README)."
    }
  else
    echo "ERROR: npm no está en PATH. En App Service (stack Python) añada:"
    echo "  WEBSITE_NODE_DEFAULT_VERSION = ~20"
    echo "  POST_BUILD_COMMAND = cd frontend && npm ci && npm run build"
    echo "O ejecute localmente: cd frontend && npm ci && npm run build y suba el zip con frontend/dist."
  fi
  echo "=========================================="
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

exec gunicorn -w "${WORKERS}" -k uvicorn.workers.UvicornWorker conection:test --bind "0.0.0.0:${PORT}"
