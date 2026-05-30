from __future__ import annotations
import hashlib
from typing import Any, Optional
from sqlmodel import Session, select
from Backend.core.database import get_engine
from Backend.models.db_models import UserDB, RoleDB, UserRoleDB, CompanyDB, LocationDB
from Backend.constants import ROL_DEFECTO

def hash_password(password: str) -> str:
    return hashlib.sha256(password.encode("utf-8")).hexdigest()

class ServicioAuth:
    def autenticar_usuario(self, email: str, password: str) -> Optional[dict[str, Any]]:
        with Session(get_engine()) as session:
            usuario = session.exec(select(UserDB).where(UserDB.Email == email)).first()
            if not usuario or usuario.PasswordHash != hash_password(password):
                return None
            
            if not usuario.IsActive:
                raise ValueError("Su usuario ha sido desactivado.")

            # Obtener Rol
            user_role = session.exec(select(UserRoleDB).where(UserRoleDB.UserID == usuario.UserID)).first()
            role_name = ROL_DEFECTO
            if user_role:
                role = session.exec(select(RoleDB).where(RoleDB.RoleID == user_role.RoleID)).first()
                if role:
                    role_name = role.RoleName

            return {
                "id": str(usuario.UserID), # Asegúrate que el controlador busque "id"
                "email": usuario.Email,
                "first_name": usuario.FirstName,
                "last_name": usuario.LastName,
                "rol": role_name,
                "company_id": str(usuario.CompanyID) if usuario.CompanyID else None
            }

    def registrar_usuario(self, datos: dict[str, Any]) -> dict[str, Any]:
        with Session(get_engine()) as session:
            if session.exec(select(UserDB).where(UserDB.Email == datos["email"])).first():
                raise ValueError("El correo ya está registrado.")

            nuevo_usuario = UserDB(
                Email=datos["email"],
                PasswordHash=hash_password(datos["password"]),
                FirstName=datos["first_name"],
                LastName=datos["last_name"],
                CompanyID=datos.get("company_id")
            )
            session.add(nuevo_usuario)
            session.commit()
            session.refresh(nuevo_usuario)
            
            return {"id": str(nuevo_usuario.UserID), "email": nuevo_usuario.Email}

    # Alias para compatibilidad con el controlador
    def login(self, email, password):
        return self.autenticar_usuario(email, password)

    def registrar(self, nombre, apellidos, email, password, company_key):
        return self.registrar_usuario({
            "first_name": nombre, "last_name": apellidos, 
            "email": email, "password": password, "company_id": company_key
        })

def _hash_password(password: str) -> str:
    return hash_password(password)

def _usuario_a_dict(session: Session, user: UserDB) -> dict[str, Any]:
    user_data = user.model_dump()
    if "PasswordHash" in user_data:
        del user_data["PasswordHash"]
    return user_data