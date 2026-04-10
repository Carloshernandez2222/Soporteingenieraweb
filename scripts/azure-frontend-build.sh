#!/bin/bash
# Ejecutar en el paso de build de Azure (POST_BUILD_SCRIPT_PATH) o a mano en el servidor.
# Directorio de trabajo esperado: raíz del repo (wwwroot).
set -e
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT/frontend"
npm ci --no-audit --no-fund
npm run build
