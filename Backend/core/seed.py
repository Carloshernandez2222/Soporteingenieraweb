"""Usuarios demo idempotentes (webmaster / soporte / usuario)."""

from __future__ import annotations

from sqlmodel import Session, select

from ..constants import ROL_DEFECTO, normalizar_rol
from ..models.db_models import PersonDB, UserDB
from ..services.auth_service import _hash_password

DEMO_PASSWORD = "TrackAid2025!"

DEMO_USERS: tuple[dict[str, str], ...] = (
    {
        "email": "webmaster@trackaid.demo",
        "nombre": "Demo",
        "apellidos": "Webmaster",
        "rol": "webmaster",
    },
    {
        "email": "soporte@trackaid.demo",
        "nombre": "Demo",
        "apellidos": "Soporte",
        "rol": "soporte",
    },
    {
        "email": "usuario@trackaid.demo",
        "nombre": "Demo",
        "apellidos": "Usuario",
        "rol": "usuario",
    },
)


def seed_demo_users(engine) -> None:
    """Crea o actualiza cuentas demo sin duplicar por email."""
    with Session(engine) as session:
        for spec in DEMO_USERS:
            email = spec["email"].strip().lower()
            rol = normalizar_rol(spec["rol"])
            existing = session.exec(select(UserDB).where(UserDB.Email == email)).first()
            if existing:
                existing.Rol = rol
                person = session.get(PersonDB, existing.PersonID)
                if person:
                    person.FirstName = spec["nombre"]
                    person.LastName = spec["apellidos"]
                session.add(existing)
                continue

            persona = PersonDB(
                FirstName=spec["nombre"],
                LastName=spec["apellidos"],
            )
            session.add(persona)
            session.flush()

            usuario = UserDB(
                Email=email,
                PasswordHash=_hash_password(DEMO_PASSWORD),
                PersonID=persona.PersonID,
                Rol=rol or ROL_DEFECTO,
            )
            session.add(usuario)
        session.commit()
