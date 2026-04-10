#!/usr/bin/env bash
# Crea un zip listo para Azure INCLUYENDO frontend/dist.
# az webapp up excluye rutas en .gitignore, por eso dist nunca subía aunque existiera en local.
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

echo "==> npm ci && npm run build (frontend)"
(cd frontend && npm ci --no-audit --no-fund && npm run build)

OUT="${1:-$ROOT/azure-deploy.zip}"
rm -f "$OUT"

echo "==> Creando $OUT"
zip -r "$OUT" . \
  -x 'azure-deploy.zip' \
  -x '*/.git/*' \
  -x '.git/*' \
  -x '*/node_modules/*' \
  -x 'frontend/node_modules/*' \
  -x '*/__pycache__/*' \
  -x '*.pyc' \
  -x '.venv/*' \
  -x 'venv/*' \
  -x 'env/*' \
  -x '*.db' \
  -x '.DS_Store'

echo "==> Listo. Subir con:"
echo "    az webapp deploy --resource-group TU_RG --name TU_APP --src-path \"$OUT\" --type zip"
echo "(Si tu CLI no tiene 'webapp deploy', usa: az webapp deployment source config-zip --resource-group TU_RG --name TU_APP --src \"$OUT\")"
