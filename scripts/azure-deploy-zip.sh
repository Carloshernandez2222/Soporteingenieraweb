#!/bin/bash
# Empaqueta el repo para Azure incluyendo frontend/dist (ignorado por git pero necesario en prod).
set -e
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

echo "Compilando frontend..."
(cd frontend && npm ci --no-audit --no-fund && npm run build)

ZIP="${1:-azure-deploy.zip}"
rm -f "$ZIP"

echo "Creando $ZIP..."
zip -r "$ZIP" . \
  -x "*.git*" \
  -x "*node_modules/*" \
  -x "frontend/node_modules/*" \
  -x ".venv/*" \
  -x "venv/*" \
  -x "*.db" \
  -x "azure-deploy.zip" \
  -x ".azure/*"

echo "Listo: $ROOT/$ZIP (incluye frontend/dist)"
