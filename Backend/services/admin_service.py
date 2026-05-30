from __future__ import annotations
from typing import Any
from uuid import UUID
from sqlmodel import Session, select
from Backend.constants import normalizar_rol
from Backend.core.auth_roles import asignar_rol_usuario
from Backend.core.database import get_engine
from Backend.core.exceptions import EmailAlreadyExistsError, UserNotFoundError
from Backend.models.db_models import CompanyDB, UserDB, UserRoleDB
from Backend.services.auth_service import _hash_password, _usuario_a_dict
from Backend.services.company_service import ServicioCompany

class ServicioAdmin:
    def __init__(self, engine=None):
        # Si no pasas el engine, lo obtiene de la función get_engine
        self.engine = engine or get_engine()

    def listar_usuarios(self) -> list[dict]:
        with Session(self.engine) as session:
            usuarios = session.exec(select(UserDB)).all()
            return [
                {
                    "id": str(u.UserID),
                    "nombre": u.FirstName,
                    "apellidos": u.LastName,
                    "email": u.Email,
                    "activo": u.IsActive,
                    "companyId": str(u.CompanyID) if u.CompanyID else None
                } 
                for u in usuarios
            ]

    def crear_usuario(self, nombre: str, apellidos: str, email: str, password: str, rol: str, company_id: str | None) -> dict[str, Any]:
        email_norm = email.strip().lower()
        rol_norm = normalizar_rol(rol)

        with Session(get_engine()) as session:
            if session.exec(select(UserDB).where(UserDB.Email == email_norm)).first():
                raise EmailAlreadyExistsError()

            # Creación directa en UserDB
            user = UserDB(
                Email=email_norm,
                PasswordHash=_hash_password(password),
                FirstName=nombre.strip(),
                LastName=apellidos.strip()
            )
            session.add(user)
            session.flush()
            
            asignar_rol_usuario(session, user.UserID, rol_norm)

            if company_id:
                company = session.get(CompanyDB, UUID(company_id))
                if not company:
                    raise ValueError("Compañía no encontrada.")
                user.CompanyID = UUID(company_id)  # asignar directo al modelo

            session.commit()
            session.refresh(user)
            return _usuario_a_dict(session, user)

    # ... (El resto de métodos como cambiar_rol, cambiar_password siguen igual)