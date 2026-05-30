"""
Usuarios demo para el panel.
"""
from __future__ import annotations
import logging
from uuid import UUID
from sqlmodel import Session, select
from Backend.constants import ROLES_USUARIO, ROL_DEFECTO, normalizar_rol
from Backend.core.database import get_engine
from Backend.models.db_models import CompanyDB, RoleDB, UserDB, UserRoleDB
from Backend.services.auth_service import _hash_password
from Backend.services.company_service import ServicioCompany, normalizar_company_key

logger = logging.getLogger("trackaid.seed")
DEMO_PASSWORD = "TrackAid2026!"

DEMO_COMPANIES: list[dict[str, str]] = [
    {"nombre": "TrackAid Demo", "llave": "trackaid-demo"},
    {"nombre": "Acme Retail", "llave": "acme-retail"},
]

DEMO_USERS: list[dict[str, str]] = [
    {"email": "webmaster@trackaid.demo", "nombre": "Ana", "apellidos": "Webmaster", "rol": "webmaster"},
    {"email": "soporte@trackaid.demo", "nombre": "Luis", "apellidos": "Soporte", "rol": "soporte"},
    {"email": "usuario@trackaid.demo", "nombre": "María", "apellidos": "Usuario", "rol": "usuario"},
]

def _asegurar_roles(session: Session) -> dict[str, RoleDB]:
    por_nombre: dict[str, RoleDB] = {}
    for nombre in ROLES_USUARIO:
        rol = session.exec(select(RoleDB).where(RoleDB.RoleName == nombre)).first()
        if not rol:
            rol = RoleDB(RoleName=nombre, Description=f"Rol {nombre}")
            session.add(rol)
            session.flush()
        por_nombre[nombre] = rol
    return por_nombre

def _asignar_rol(session: Session, user_id: UUID, rol_nombre: str, roles: dict[str, RoleDB]) -> None:
    rol_key = normalizar_rol(rol_nombre)
    role = roles.get(rol_key) or roles[ROL_DEFECTO]
    link = session.exec(select(UserRoleDB).where(UserRoleDB.UserID == user_id, UserRoleDB.RoleID == role.RoleID)).first()
    if not link:
        session.add(UserRoleDB(UserID=user_id, RoleID=role.RoleID))

def ejecutar_seed_demo() -> None:
    engine = get_engine()
    company_svc = ServicioCompany()

    with Session(engine) as session:
        roles_map = _asegurar_roles(session)
        password_hash = _hash_password(DEMO_PASSWORD)

        companies_by_key: dict[str, CompanyDB] = {}
        for spec in DEMO_COMPANIES:
            key = normalizar_company_key(spec["llave"])
            company = session.exec(select(CompanyDB).where(CompanyDB.CompanyKey == key)).first()
            if not company:
                company = CompanyDB(CompanyName=spec["nombre"], CompanyKey=key, IsActive=True)
                session.add(company)
                session.flush()
            companies_by_key[key] = company

        for spec in DEMO_USERS:
            email = spec["email"].strip().lower()
            user = session.exec(select(UserDB).where(UserDB.Email == email)).first()
            if not user:
               
                user = UserDB(
                    Email=email,
                    PasswordHash=password_hash,
                    FirstName=spec["nombre"],
                    LastName=spec["apellidos"]
                )
                session.add(user)
                session.flush()
            else:
                user.PasswordHash = password_hash
                session.add(user)

            _asignar_rol(session, user.UserID, spec["rol"], roles_map)
            demo_company = companies_by_key.get(normalizar_company_key("trackaid-demo"))
            if demo_company:
                company_svc.vincular_usuario(session, user.UserID, demo_company)

        session.commit()
    logger.info("Seed demo listo.")