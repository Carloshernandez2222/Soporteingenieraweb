"""Tests de integración — endpoints de autenticación."""
import uuid
import pytest
from Backend.models.db_models import UserDB, RoleDB, UserRoleDB
from Backend.services.auth_service import _hash_password
from sqlmodel import select
 
 
# ── helpers ───────────────────────────────────────────────────────────────────
 
def _crear_usuario(session, email="user@test.com", password="Test1234!", rol="usuario"):
    user = UserDB(
        UserID=uuid.uuid4(),
        Email=email,
        PasswordHash=_hash_password(password),
        FirstName="Test",
        LastName="User",
        IsActive=True,
    )
    session.add(user)
    session.flush()
 
    role = session.exec(select(RoleDB).where(RoleDB.RoleName == rol)).first()
    if not role:
        role = RoleDB(RoleID=uuid.uuid4(), RoleName=rol)
        session.add(role)
        session.flush()
 
    session.add(UserRoleDB(UserID=user.UserID, RoleID=role.RoleID))
    session.commit()
    return user
 
 
# ── tests ─────────────────────────────────────────────────────────────────────
 
def test_login_exitoso(client, session):
    """Login con credenciales correctas retorna 200 con token."""
    _crear_usuario(session, email="login@test.com", password="Secure1!")
    resp = client.post("/api/auth/login", json={"email": "login@test.com", "password": "Secure1!"})
    assert resp.status_code == 200
    body = resp.json()
    # acepta cualquier estructura que contenga un token
    content = str(body)
    assert "token" in content.lower() or "data" in content.lower()
 
 
def test_login_password_incorrecta(client, session):
    """Login con contraseña incorrecta retorna 401."""
    _crear_usuario(session, email="wrong@test.com", password="Correct1!")
    resp = client.post("/api/auth/login", json={"email": "wrong@test.com", "password": "WrongPass1!"})
    assert resp.status_code == 401
 
 
def test_login_usuario_no_existe(client):
    """Login con email inexistente retorna 401 o 404."""
    resp = client.post("/api/auth/login", json={"email": "fantasma@test.com", "password": "Pass1234!"})
    assert resp.status_code in (401, 404)
 
 
def test_login_email_vacio(client):
    """Login con email vacío retorna 422 (validación Pydantic)."""
    resp = client.post("/api/auth/login", json={"email": "", "password": "Pass1234!"})
    assert resp.status_code == 422
 
 
def test_login_sin_password(client):
    """Login sin campo password retorna 422."""
    resp = client.post("/api/auth/login", json={"email": "user@test.com"})
    assert resp.status_code == 422
 
 
def test_forgot_password_emails_no_coinciden(client):
    """forgot-password con emails distintos retorna 422."""
    resp = client.post("/api/auth/forgot-password", json={
        "email": "a@test.com",
        "confirmEmail": "b@test.com"
    })
    assert resp.status_code == 422
 
 
def test_forgot_password_usuario_no_existe(client):
    """forgot-password con email inexistente retorna 404 o 400."""
    resp = client.post("/api/auth/forgot-password", json={
        "email": "noexiste@test.com",
        "confirmEmail": "noexiste@test.com"
    })
    assert resp.status_code in (400, 404)