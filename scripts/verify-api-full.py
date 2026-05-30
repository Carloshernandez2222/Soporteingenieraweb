#!/usr/bin/env python3
"""Verificación exhaustiva de la API TrackAid (requiere backend en marcha)."""
from __future__ import annotations

import json
import sys
import time
import urllib.error
import urllib.parse
import urllib.request
from dataclasses import dataclass

BASE = sys.argv[1] if len(sys.argv) > 1 else "http://127.0.0.1:8013"
PASSWORD = "TrackAid2026!"


@dataclass
class Result:
    name: str
    ok: bool
    status: int
    detail: str = ""


results: list[Result] = []
CASE_ID: str = ""
COMPANY_ID: str = ""
USER_PEDRO: str = ""
TALLER_ID: int = 0
REG_TICKET_ID: int = 0


def req(
    method: str,
    path: str,
    *,
    token: str | None = None,
    body: dict | None = None,
    query: dict | None = None,
) -> tuple[int, dict | list | str]:
    url = BASE + path
    if query:
        url += "?" + urllib.parse.urlencode(query)
    data = None
    headers = {"Accept": "application/json"}
    if body is not None:
        data = json.dumps(body).encode()
        headers["Content-Type"] = "application/json"
    if token:
        headers["Authorization"] = f"Bearer {token}"
    r = urllib.request.Request(url, data=data, headers=headers, method=method)
    try:
        with urllib.request.urlopen(r, timeout=15) as resp:
            raw = resp.read().decode()
            code = resp.status
    except urllib.error.HTTPError as e:
        code = e.code
        raw = e.read().decode()
    except Exception as e:
        return 0, str(e)
    if not raw:
        return code, {}
    try:
        return code, json.loads(raw)
    except json.JSONDecodeError:
        return code, raw


def check(name: str, code: int, expect: int | tuple[int, ...], payload: dict | list | str = "") -> None:
    ok = code in (expect if isinstance(expect, tuple) else (expect,))
    detail = ""
    if not ok and isinstance(payload, dict):
        detail = payload.get("message") or payload.get("code") or json.dumps(payload)[:120]
    elif not ok:
        detail = str(payload)[:120]
    results.append(Result(name, ok, code, detail))
    mark = "OK" if ok else "FAIL"
    print(f"  [{mark}] {name} → HTTP {code}" + (f" ({detail})" if detail and not ok else ""))


def login(email: str) -> str:
    code, data = req("POST", "/api/auth/login", body={"email": email, "password": PASSWORD})
    if code != 200 or not isinstance(data, dict):
        return ""
    return data.get("accessToken", "")


def main() -> int:
    global CASE_ID, COMPANY_ID, USER_PEDRO, TALLER_ID, REG_TICKET_ID
    print(f"Verificación completa → {BASE}\n")

    # --- Salud y SPA ---
    code, data = req("GET", "/health")
    check("GET /health", code, 200, data)
    code, data = req("GET", "/")
    check("GET / (SPA o 503)", code, (200, 503), data)

    # --- Auth (todos los roles demo) ---
    tokens: dict[str, str] = {}
    for role, email in [
        ("webmaster", "webmaster@trackaid.demo"),
        ("soporte", "soporte@trackaid.demo"),
        ("usuario", "usuario@trackaid.demo"),
    ]:
        t = login(email)
        tokens[role] = t
        check(f"POST /api/auth/login ({role})", 200 if t else 401, 200 if t else 401)

    tw = tokens["webmaster"]
    ts = tokens["soporte"]
    tu = tokens["usuario"]

    # Forgot / reset
    code, data = req(
        "POST",
        "/api/auth/forgot-password",
        body={"email": "usuario@trackaid.demo", "confirmEmail": "usuario@trackaid.demo"},
    )
    reset_token = data.get("resetToken", "") if isinstance(data, dict) else ""
    check("POST /api/auth/forgot-password", code, 200, data)
    if reset_token:
        code, data = req(
            "POST",
            "/api/auth/reset-password",
            body={
                "token": reset_token,
                "newPassword": PASSWORD,
                "confirmPassword": PASSWORD,
            },
        )
        check("POST /api/auth/reset-password", code, 200, data)

    # Register
    reg_email = f"full.verify.{int(time.time())}@trackaid.demo"
    code, data = req(
        "POST",
        "/api/auth/register",
        body={
            "nombre": "Full",
            "apellidos": "Verify",
            "email": reg_email,
            "password": PASSWORD,
            "confirmPassword": PASSWORD,
            "companyKey": "trackaid-demo",
            "acceptTerms": True,
        },
    )
    check("POST /api/auth/register", code, 201, data)

    # --- Companies ---
    code, data = req("GET", "/api/companies/activas")
    check("GET /api/companies/activas", code, 200, data)

    code, data = req("GET", "/api/companies", token=tw)
    check("GET /api/companies (webmaster)", code, 200, data)

    code, _ = req("GET", "/api/companies", token=tu)
    check("GET /api/companies sin rol → 403", code, 403)

    key = f"full-co-{int(time.time())}"
    code, data = req(
        "POST",
        "/api/companies",
        token=tw,
        body={"nombre": "Full Test Co", "llave": key},
    )
    check("POST /api/companies", code, 201, data)
    if isinstance(data, dict) and data.get("data"):
        COMPANY_ID = data["data"].get("id", "")

    if COMPANY_ID:
        code, data = req(
            "PATCH",
            f"/api/companies/{COMPANY_ID}/activa",
            token=tw,
            body={"activa": False},
        )
        check("PATCH company desactivar", code, 200, data)
        code, data = req(
            "PATCH",
            f"/api/companies/{COMPANY_ID}/activa",
            token=tw,
            body={"activa": True},
        )
        check("PATCH company reactivar", code, 200, data)

    # --- Admin ---
    code, data = req("GET", "/api/admin/usuarios", token=tw)
    check("GET /api/admin/usuarios", code, 200, data)

    pedro_email = f"pedro.full.{int(time.time())}@trackaid.demo"
    code, data = req(
        "POST",
        "/api/admin/usuarios",
        token=tw,
        body={
            "nombre": "Pedro",
            "apellidos": "Full",
            "email": pedro_email,
            "password": PASSWORD,
            "rol": "usuario",
            "companyId": COMPANY_ID or None,
        },
    )
    check("POST /api/admin/usuarios", code, 201, data)
    if isinstance(data, dict):
        u = data.get("user", data)
        USER_PEDRO = u.get("id", "")

    if USER_PEDRO:
        code, data = req(
            "PATCH",
            f"/api/admin/usuarios/{USER_PEDRO}/rol",
            token=tw,
            body={"rol": "soporte"},
        )
        check("PATCH usuario rol → soporte", code, 200, data)
        code, data = req(
            "PATCH",
            f"/api/admin/usuarios/{USER_PEDRO}/rol",
            token=tw,
            body={"rol": "usuario"},
        )
        check("PATCH usuario rol → usuario", code, 200, data)
        code, data = req(
            "PATCH",
            f"/api/admin/usuarios/{USER_PEDRO}/password",
            token=tw,
            body={"password": PASSWORD},
        )
        check("PATCH usuario password", code, 200, data)
        if COMPANY_ID:
            code, data = req(
                "PATCH",
                f"/api/admin/usuarios/{USER_PEDRO}/compania",
                token=tw,
                body={"companyId": COMPANY_ID},
            )
            check("PATCH usuario compania", code, 200, data)
        code, data = req(
            "PATCH",
            f"/api/admin/usuarios/{USER_PEDRO}/activo",
            token=tw,
            body={"activa": False},
        )
        check("PATCH usuario desactivar", code, 200, data)
        code, data = req(
            "PATCH",
            f"/api/admin/usuarios/{USER_PEDRO}/activo",
            token=tw,
            body={"activa": True},
        )
        check("PATCH usuario reactivar", code, 200, data)

    code, _ = req("GET", "/api/admin/usuarios", token=tu)
    check("GET admin sin webmaster → 403", code, 403)

    # --- Soporte SQL ---
    uid = USER_PEDRO or (login("usuario@trackaid.demo") and "")
    # get usuario id from token user
    code, login_data = req(
        "POST",
        "/api/auth/login",
        body={"email": "usuario@trackaid.demo", "password": PASSWORD},
    )
    if isinstance(login_data, dict) and login_data.get("user"):
        uid = login_data["user"].get("id", uid)

    code, data = req(
        "POST",
        "/api/casos/soporte",
        body={
            "user_id": uid,
            "descripcion": "Caso verificación completa",
            "case_type": "General",
            "priority": "Medium",
        },
    )
    check("POST /api/casos/soporte", code, 201, data)
    if isinstance(data, dict):
        inner = data.get("data", data)
        CASE_ID = inner.get("case_id", "")

    code, data = req("GET", f"/api/casos/soporte/mis-tickets/{uid}")
    check("GET mis-tickets", code, 200, data)

    code, data = req("GET", "/api/casos/soporte", token=ts)
    check("GET /api/casos/soporte (soporte)", code, 200, data)

    code, data = req("GET", "/api/casos/soporte/agentes", token=ts)
    check("GET /api/casos/soporte/agentes", code, 200, data)

    code, _ = req("GET", "/api/casos/soporte", token=tu)
    check("GET soporte lista como usuario → 403", code, 403)

    if CASE_ID and ts:
        soporte_id = ""
        code, ag = req("GET", "/api/casos/soporte/agentes", token=ts)
        if isinstance(ag, dict) and ag.get("data"):
            agents = ag["data"]
            if agents:
                soporte_id = agents[0].get("id", "")
        if soporte_id:
            code, data = req(
                "PATCH",
                f"/api/casos/soporte/{CASE_ID}/asignar",
                token=ts,
                body={"assignedToUserId": soporte_id},
            )
            check("PATCH asignar caso", code, 200, data)
        code, data = req(
            "PATCH",
            f"/api/casos/soporte/{CASE_ID}/estado",
            token=ts,
            body={"status": "En progreso", "comentario": "Verificación"},
        )
        check("PATCH estado caso", code, 200, data)
        code, data = req("GET", f"/api/casos/soporte/{CASE_ID}/historial", token=ts)
        check("GET historial caso", code, 200, data)
        code, data = req("PUT", f"/api/casos/soporte/{CASE_ID}/cerrar")
        check("PUT cerrar caso", code, 200, data)

    # --- Taller SQLite ---
    tid = int(time.time()) % 900000 + 1000
    code, data = req(
        "POST",
        "/api/casos/taller",
        body={
            "id": tid,
            "cliente": "Cliente Verificación",
            "activo": True,
            "prioridad": 5.0,
            "categoria": "red",
        },
    )
    check("POST /api/casos/taller", code, 201, data)
    TALLER_ID = tid

    code, data = req("GET", "/api/casos/taller")
    check("GET /api/casos/taller", code, 200, data)

    code, data = req("GET", "/api/casos/taller/metricas")
    check("GET /api/casos/taller/metricas", code, 200, data)

    code, data = req("GET", "/api/casos/taller/filtrar", query={"categoria": "red"})
    check("GET /api/casos/taller/filtrar", code, 200, data)

    code, data = req("GET", f"/api/casos/taller/{TALLER_ID}")
    check("GET /api/casos/taller/{id}", code, 200, data)

    code, data = req(
        "POST",
        "/api/casos/taller/integracion",
        query={"origen": "amazon"},
        body={
            "case_id": tid + 1,
            "buyer_name": "Amazon Test",
            "priority_level": "high",
            "issue_type": "envio",
            "is_open": True,
        },
    )
    check("POST /api/casos/taller/integracion", code, 200, data)

    # --- Registro SQLite ---
    code, data = req(
        "POST",
        "/registrar",
        query={
            "nombre": "Registro Web",
            "email": "registro@test.demo",
            "descripcion": "Ticket desde verificación",
            "categoria": "general",
            "origen": "web",
        },
    )
    check("POST /registrar", code, 200, data)
    if isinstance(data, dict):
        REG_TICKET_ID = int(data.get("caso_id") or data.get("id") or data.get("ticket_id") or 0)

    code, data = req("GET", "/api/casos/registro/tickets")
    check("GET /api/casos/registro/tickets", code, 200, data)

    code, data = req(
        "GET",
        "/api/casos/registro/tickets/por-email",
        query={"email": "registro@test.demo"},
    )
    check("GET registro por-email", code, 200, data)

    if REG_TICKET_ID:
        code, data = req("GET", f"/api/casos/registro/tickets/{REG_TICKET_ID}")
        check("GET registro detalle", code, 200, data)
    else:
        results.append(Result("GET registro detalle", False, 0, "sin caso_id en POST /registrar"))
        print("  [FAIL] GET registro detalle → sin ID de ticket")

    code, data = req(
        "POST",
        "/casos/integracion",
        query={"origen": "shopify"},
        body={
            "ticket_number": 9999,
            "customer": {"display_name": "Shopify Legacy"},
            "urgency_score": 4.0,
            "tags": ["test"],
            "status": "open",
        },
    )
    check("POST /casos/integracion (legacy)", code, 200, data)

    code, data = req("GET", "/casos/sqlite", query={"email": "registro@test.demo"})
    check("GET /casos/sqlite por email", code, 200, data)

    # --- Legacy /casos ---
    code, data = req("GET", "/casos/todos")
    check("GET /casos/todos (legacy)", code, 200, data)

    lid = tid + 2
    code, data = req(
        "POST",
        "/casos/crear",
        body={
            "id": lid,
            "cliente": "Legacy Cliente",
            "activo": True,
            "prioridad": 3.0,
            "categoria": "software",
        },
    )
    check("POST /casos/crear (legacy)", code, 201, data)

    code, data = req("GET", "/casos/metricas-jerarquicas")
    check("GET /casos/metricas-jerarquicas", code, 200, data)

    code, data = req("GET", "/casos/filtrar", query={"categoria": "software"})
    check("GET /casos/filtrar (legacy)", code, 200, data)

    code, data = req("GET", f"/casos/{lid}")
    check("GET /casos/{id} (legacy)", code, 200, data)

    code, data = req("GET", "/casos/sqlite/todos")
    check("GET /casos/sqlite/todos", code, 200, data)

    if REG_TICKET_ID:
        code, data = req("GET", f"/casos/persistidos/{REG_TICKET_ID}")
        check("GET /casos/persistidos/{id}", code, 200, data)
    else:
        results.append(Result("GET /casos/persistidos/{id}", False, 0, "sin REG_TICKET_ID"))
        print("  [FAIL] GET /casos/persistidos/{id} → sin ID")

    # Resumen
    failed = [r for r in results if not r.ok]
    print(f"\n{'=' * 50}")
    print(f"Total: {len(results)} | OK: {len(results) - len(failed)} | FAIL: {len(failed)}")
    if failed:
        print("\nFallos:")
        for r in failed:
            print(f"  - {r.name} (HTTP {r.status}): {r.detail}")
        return 1
    print("\nTodas las verificaciones pasaron.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
