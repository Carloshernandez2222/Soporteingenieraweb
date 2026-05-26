"""
Usuarios demo para el panel (roles webmaster / soporte / usuario).

Se ejecuta al arrancar la app salvo `SKIP_DB_SEED=1`. Idempotente: no duplica correos.
"""

from __future__ import annotations

import logging
from typing import Any
from uuid import UUID

from sqlmodel import Session, select

from Backend.constants import ROLES_USUARIO, ROL_DEFECTO, normalizar_rol
from Backend.core.database import get_engine
from Backend.models.db_models import PersonDB, RoleDB, UserDB, UserRoleDB
from Backend.services.auth_service import _hash_password

logger = logging.getLogger("trackaid.seed")

DEMO_PASSWORD = "TrackAid2026!"

DEMO_USERS: list[dict[str, str]] = [
    {
        "email": "webmaster@trackaid.demo",
        "nombre": "Ana",
        "apellidos": "Webmaster",
        "rol": "webmaster",
    },
    {
        "email": "soporte@trackaid.demo",
        "nombre": "Luis",
        "apellidos": "Soporte",
        "rol": "soporte",
    },
    {
        "email": "usuario@trackaid.demo",
        "nombre": "María",
        "apellidos": "Usuario",
        "rol": "usuario",
    },
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
    link = session.exec(
        select(UserRoleDB).where(
            UserRoleDB.UserID == user_id,
            UserRoleDB.RoleID == role.RoleID,
        )
    ).first()
    if not link:
        session.add(UserRoleDB(UserID=user_id, RoleID=role.RoleID))


def ejecutar_seed_demo() -> None:
    """Crea roles y usuarios demo si el motor SQL está disponible."""
    engine = get_engine()
    with Session(engine) as session:
        roles_map = _asegurar_roles(session)
        session.commit()

    with Session(engine) as session:
        roles_map = _asegurar_roles(session)
        password_hash = _hash_password(DEMO_PASSWORD)

        for spec in DEMO_USERS:
            email = spec["email"].strip().lower()
            user = session.exec(select(UserDB).where(UserDB.Email == email)).first()
            if not user:
                persona = PersonDB(
                    FirstName=spec["nombre"],
                    LastName=spec["apellidos"],
                )
                session.add(persona)
                session.flush()
                user = UserDB(
                    Email=email,
                    PasswordHash=password_hash,
                    PersonID=persona.PersonID,
                )
                session.add(user)
                session.flush()
                logger.info("Usuario demo creado: %s (%s)", email, spec["rol"])
            else:
                user.PasswordHash = password_hash
                session.add(user)
                logger.debug("Usuario demo actualizado (contraseña): %s", email)

            _asignar_rol(session, user.UserID, spec["rol"], roles_map)

        session.commit()

    logger.info(
        "Seed demo listo (%d cuentas, contraseña: documentada en README).",
        len(DEMO_USERS),
    )
