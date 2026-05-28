from __future__ import annotations

from typing import Any
from uuid import UUID

from sqlmodel import Session, select

from Backend.constants import normalizar_rol
from Backend.core.auth_roles import asignar_rol_usuario, obtener_rol_usuario
from Backend.core.database import get_engine
from Backend.core.exceptions import EmailAlreadyExistsError, UserNotFoundError
from Backend.models.db_models import CompanyDB, PersonDB, UserDB, UserRoleDB
from Backend.services.auth_service import _hash_password, _usuario_a_dict
from Backend.services.company_service import ServicioCompany


class ServicioAdmin:
    def __init__(self) -> None:
        self._companies = ServicioCompany()

    def listar_usuarios(self) -> list[dict[str, Any]]:
        with Session(get_engine()) as session:
            users = session.exec(select(UserDB).order_by(UserDB.Email)).all()
            return [_usuario_a_dict(session, u) for u in users]

    def crear_usuario(
        self,
        nombre: str,
        apellidos: str,
        email: str,
        password: str,
        rol: str,
        company_id: str | None,
    ) -> dict[str, Any]:
        email_norm = email.strip().lower()
        rol_norm = normalizar_rol(rol)

        with Session(get_engine()) as session:
            if session.exec(select(UserDB).where(UserDB.Email == email_norm)).first():
                raise EmailAlreadyExistsError()

            persona = PersonDB(FirstName=nombre.strip(), LastName=apellidos.strip())
            session.add(persona)
            session.flush()

            user = UserDB(
                Email=email_norm,
                PasswordHash=_hash_password(password),
                PersonID=persona.PersonID,
            )
            session.add(user)
            session.flush()
            asignar_rol_usuario(session, user.UserID, rol_norm)

            if company_id:
                company = session.get(CompanyDB, UUID(company_id))
                if not company:
                    raise ValueError("Compañía no encontrada.")
                self._companies.vincular_usuario(session, user.UserID, company)

            session.commit()
            session.refresh(user)
            return _usuario_a_dict(session, user)

    def cambiar_rol(self, user_id: str, rol: str) -> dict[str, Any]:
        with Session(get_engine()) as session:
            user = session.get(UserDB, UUID(user_id))
            if not user:
                raise UserNotFoundError()
            asignar_rol_usuario(session, user.UserID, normalizar_rol(rol))
            session.commit()
            return _usuario_a_dict(session, user)

    def cambiar_password(self, user_id: str, password: str) -> None:
        with Session(get_engine()) as session:
            user = session.get(UserDB, UUID(user_id))
            if not user:
                raise UserNotFoundError()
            user.PasswordHash = _hash_password(password)
            session.add(user)
            session.commit()

    def asignar_compania(self, user_id: str, company_id: str) -> dict[str, Any]:
        with Session(get_engine()) as session:
            user = session.get(UserDB, UUID(user_id))
            if not user:
                raise UserNotFoundError()
            company = session.get(CompanyDB, UUID(company_id))
            if not company:
                raise ValueError("Compañía no encontrada.")
            self._companies.vincular_usuario(session, user.UserID, company)
            session.commit()
            return _usuario_a_dict(session, user)

    def set_usuario_activo(self, user_id: str, activo: bool) -> dict[str, Any]:
        """Desactivación lógica vía rol (UserRoles.IsActive)."""
        with Session(get_engine()) as session:
            user = session.get(UserDB, UUID(user_id))
            if not user:
                raise UserNotFoundError()
            links = session.exec(select(UserRoleDB).where(UserRoleDB.UserID == user.UserID)).all()
            for link in links:
                link.IsActive = activo
                session.add(link)
            session.commit()
            data = _usuario_a_dict(session, user)
            data["activo"] = activo
            return data
