#!/usr/bin/env bash
# Configuración inicial en GitHub Codespaces (ODBC 18, venv, SQL Server, schema).
set -euo pipefail
cd "$(dirname "$0")/.."

echo "==> 1/5 Entorno virtual Python"
if [ ! -d .venv ]; then
  python3 -m venv .venv
fi
# shellcheck disable=SC1091
source .venv/bin/activate
pip install -q -r requirements.txt

echo "==> 2/5 Microsoft ODBC Driver 18 for SQL Server"
if odbcinst -q -d 2>/dev/null | grep -qi "ODBC Driver 18"; then
  echo "    Ya instalado."
else
  curl -fsSL https://packages.microsoft.com/keys/microsoft.asc | sudo gpg --dearmor -o /usr/share/keyrings/microsoft-prod.gpg
  curl -fsSL "https://packages.microsoft.com/config/ubuntu/$(lsb_release -rs)/prod.list" \
    | sudo tee /etc/apt/sources.list.d/mssql-release.list >/dev/null
  sudo apt-get update -qq
  sudo ACCEPT_EULA=Y apt-get install -y -qq msodbcsql18 unixodbc-dev
  echo "    Instalado."
fi

echo "==> 3/5 Variables .env"
if [ ! -f .env ]; then
  cp .env.example .env
fi
grep -q '^SQLSERVER_PASSWORD=.' .env || sed -i 's/^SQLSERVER_PASSWORD=.*/SQLSERVER_PASSWORD=TrackAid_Secure2026!/' .env

echo "==> 4/5 SQL Server (Docker)"
docker compose up -d
echo "    Esperando SQL Server (hasta 90 s)..."
for i in $(seq 1 45); do
  if docker compose exec -T sqlserver /opt/mssql-tools18/bin/sqlcmd \
    -S localhost -U sa -P "TrackAid_Secure2026!" -C -Q "SELECT 1" >/dev/null 2>&1; then
    echo "    SQL Server listo."
    break
  fi
  sleep 2
  if [ "$i" -eq 45 ]; then
    echo "ERROR: SQL Server no respondió. Ejecute: docker compose logs sqlserver"
    exit 1
  fi
done
bash scripts/codespace-init-db.sh

echo "==> 5/5 Prueba de conexión"
set -a
# shellcheck disable=SC1091
source .env
set +a
python test_db.py

echo ""
echo "Listo. Arranque:"
echo "  source .venv/bin/activate && set -a && source .env && set +a"
echo "  uvicorn Backend.conection:test --reload --host 0.0.0.0 --port 8000"
echo "  (otra terminal) cd frontend && npm ci && npm run dev -- --host 0.0.0.0 --port 5173"
