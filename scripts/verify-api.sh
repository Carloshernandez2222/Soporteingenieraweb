#!/usr/bin/env bash
# Verificación rápida de API (SQLite local).
set -euo pipefail
BASE="${1:-http://127.0.0.1:8013}"
FAIL=0

check() {
  local name="$1" code="$2" expect="$3"
  if [[ "$code" != "$expect" ]]; then
    echo "FAIL $name (HTTP $code, esperado $expect)"
    FAIL=1
  else
    echo "OK   $name (HTTP $code)"
  fi
}

echo "=== Login webmaster ==="
LOGIN=$(curl -s -w "\n%{http_code}" -X POST "$BASE/api/auth/login" \
  -H 'Content-Type: application/json' \
  -d '{"email":"webmaster@trackaid.demo","password":"TrackAid2026!"}')
BODY=$(echo "$LOGIN" | sed '$d')
CODE=$(echo "$LOGIN" | tail -1)
check "login" "$CODE" "200"
TOKEN=$(echo "$BODY" | python3 -c "import sys,json; print(json.load(sys.stdin).get('accessToken',''))" 2>/dev/null || true)
if [[ -z "$TOKEN" ]]; then
  echo "Sin token; abortando."
  exit 1
fi

echo "=== GET companies activas ==="
R=$(curl -s -w "\n%{http_code}" "$BASE/api/companies/activas")
check "companies/activas" "$(echo "$R" | tail -1)" "200"

echo "=== POST company ==="
KEY="verify-$(date +%s)"
R=$(curl -s -w "\n%{http_code}" -X POST "$BASE/api/companies" \
  -H "Authorization: Bearer $TOKEN" -H 'Content-Type: application/json' \
  -d "{\"nombre\":\"Verify Co\",\"llave\":\"$KEY\"}")
check "POST /api/companies" "$(echo "$R" | tail -1)" "201"

echo "=== POST admin usuario ==="
EMAIL="verify.user.$RANDOM@trackaid.demo"
R=$(curl -s -w "\n%{http_code}" -X POST "$BASE/api/admin/usuarios" \
  -H "Authorization: Bearer $TOKEN" -H 'Content-Type: application/json' \
  -d "{\"nombre\":\"Verify\",\"apellidos\":\"User\",\"email\":\"$EMAIL\",\"password\":\"TrackAid2026!\",\"rol\":\"usuario\"}")
BODY=$(echo "$R" | sed '$d')
check "POST /api/admin/usuarios" "$(echo "$R" | tail -1)" "201"
USER_ID=$(echo "$BODY" | python3 -c "import sys,json; d=json.load(sys.stdin); u=d.get('user',d); print(u.get('id',''))")

echo "=== POST caso soporte ==="
R=$(curl -s -w "\n%{http_code}" -X POST "$BASE/api/casos/soporte" \
  -H 'Content-Type: application/json' \
  -d "{\"user_id\":\"$USER_ID\",\"descripcion\":\"Verificación automática\",\"case_type\":\"General\"}")
check "POST /api/casos/soporte" "$(echo "$R" | tail -1)" "201"

echo "=== GET casos soporte ==="
R=$(curl -s -w "\n%{http_code}" "$BASE/api/casos/soporte" -H "Authorization: Bearer $TOKEN")
check "GET /api/casos/soporte" "$(echo "$R" | tail -1)" "200"

echo "=== Register (llave demo) ==="
REG_EMAIL="reg.$RANDOM@trackaid.demo"
R=$(curl -s -w "\n%{http_code}" -X POST "$BASE/api/auth/register" \
  -H 'Content-Type: application/json' \
  -d "{\"nombre\":\"Nuevo\",\"apellidos\":\"Reg\",\"email\":\"$REG_EMAIL\",\"password\":\"TrackAid2026!\",\"confirmPassword\":\"TrackAid2026!\",\"companyKey\":\"trackaid-demo\",\"acceptTerms\":true}")
check "POST /api/auth/register" "$(echo "$R" | tail -1)" "201"

if [[ "$FAIL" -eq 0 ]]; then
  echo ""
  echo "Todas las verificaciones pasaron."
  exit 0
fi
echo ""
echo "Algunas verificaciones fallaron."
exit 1
