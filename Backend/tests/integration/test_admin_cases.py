"""Tests de integración — panel de administración."""
import uuid
import pytest
from Backend.models.db_models import UserDB, RoleDB, UserRoleDB
from Backend.services.auth_service import _hash_password
from Backend.core.jwt_auth import crear_token
from sqlmodel import select


# ── helpers ───────────────────────────────────────────────────────────────────

def _auth_header(user_id: str, rol: str = "webmaster") -> dict:
    token = crear_token(user_id, f"{rol}@test.com", rol)
    return {"Authorization": f"Bearer {token}"}


def _seed_webmaster(session) -> UserDB:
    uid = uuid.uuid4()
    user = UserDB(
        UserID=uid,
        Email="webmaster@test.com",
        PasswordHash=_hash_password("Admin123!"),
        FirstName="Admin",
        LastName="Master",
        IsActive=True,
    )
    session.add(user)
    session.flush()
    role = RoleDB(RoleID=uuid.uuid4(), RoleName="webmaster")
    session.add(role)
    session.flush()
    session.add(UserRoleDB(UserID=uid, RoleID=role.RoleID))
    session.commit()
    return user


# ── tests ─────────────────────────────────────────────────────────────────────

def test_listar_usuarios_sin_auth(client):
    """Sin token, /api/admin/usuarios retorna 401 o 403."""
    resp = client.get("/api/admin/usuarios")
    assert resp.status_code in (401, 403)


def test_listar_usuarios_con_auth(client, session):
    """Con token webmaster, lista retorna 200 con campo data."""
    wm = _seed_webmaster(session)
    resp = client.get("/api/admin/usuarios", headers=_auth_header(str(wm.UserID)))
    assert resp.status_code == 200
    body = resp.json()
    assert "data" in body or isinstance(body, list)


def test_crear_usuario_admin(client, session):
    """Webmaster puede crear un usuario nuevo — retorna 201."""
    wm = _seed_webmaster(session)
    payload = {
        "nombre": "Nuevo",
        "apellidos": "Usuario",
        "email": "nuevo@empresa.com",
        "password": "Pass1234!",
        "rol": "usuario",
        "companyId": None,
    }
    resp = client.post(
        "/api/admin/usuarios",
        json=payload,
        headers=_auth_header(str(wm.UserID))
    )
    assert resp.status_code in (200, 201)


def test_crear_usuario_email_duplicado(client, session):
    """Crear dos usuarios con el mismo email retorna 400 o 409."""
    wm = _seed_webmaster(session)
    payload = {
        "nombre": "Dup",
        "apellidos": "User",
        "email": "dup@empresa.com",
        "password": "Pass1234!",
        "rol": "usuario",
        "companyId": None,
    }
    headers = _auth_header(str(wm.UserID))
    client.post("/api/admin/usuarios", json=payload, headers=headers)
    resp = client.post("/api/admin/usuarios", json=payload, headers=headers)
    assert resp.status_code in (400, 409)


def test_cambiar_rol_usuario_inexistente(client, session):
    """Cambiar rol de UUID inexistente retorna 404."""
    wm = _seed_webmaster(session)
    fake_id = str(uuid.uuid4())
    resp = client.patch(
        f"/api/admin/usuarios/{fake_id}/rol",
        json={"rol": "soporte"},
        headers=_auth_header(str(wm.UserID))
    )
    assert resp.status_code == 404


def test_rol_insuficiente_bloqueado(client, session):
    """Usuario con rol 'usuario' no puede acceder a /api/admin/usuarios."""
    uid = str(uuid.uuid4())
    resp = client.get(
        "/api/admin/usuarios",
        headers=_auth_header(uid, rol="usuario")
    )
    assert resp.status_code == 403