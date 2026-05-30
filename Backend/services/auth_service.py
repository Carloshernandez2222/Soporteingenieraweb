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
            if not usuario:
                return None
            
            if usuario.PasswordHash != hash_password(password):
                return None

            # 🚨 INACTIVACIÓN EN CASCADA 🚨
            # 1. ¿El usuario está inactivo?
            if not usuario.IsActive:
                raise ValueError("Su usuario ha sido desactivado. Contacte al Webmaster.")

            # 2. ¿Su compañía está inactiva?
            if usuario.CompanyID:
                compania = session.exec(select(CompanyDB).where(CompanyDB.CompanyID == usuario.CompanyID)).first()
                if compania and not compania.IsActive:
                    raise ValueError("La compañía asociada está inactiva. Acceso denegado.")

            # Obtener Rol
            user_role = session.exec(select(UserRoleDB).where(UserRoleDB.UserID == usuario.UserID)).first()
            role_name = ROL_DEFECTO
            if user_role:
                role = session.exec(select(RoleDB).where(RoleDB.RoleID == user_role.RoleID)).first()
                if role:
                    role_name = role.RoleName

            return {
                "user_id": str(usuario.UserID),
                "email": usuario.Email,
                "first_name": usuario.FirstName,
                "last_name": usuario.LastName,
                "role": role_name,
                "company_id": str(usuario.CompanyID) if usuario.CompanyID else None
            }

    def registrar_usuario(self, datos: dict[str, Any]) -> dict[str, Any]:
        with Session(get_engine()) as session:
            existente = session.exec(select(UserDB).where(UserDB.Email == datos["email"])).first()
            if existente:
                raise ValueError("El correo ya está registrado.")

            # 🚨 VALIDACIÓN DE COMPAÑÍA AL REGISTRAR 🚨
            company_id = datos.get("company_id")
            if company_id:
                compania = session.exec(select(CompanyDB).where(CompanyDB.CompanyID == company_id)).first()
                if not compania or not compania.IsActive:
                    raise ValueError("La llave de compañía es inválida o la empresa está inactiva.")

            nuevo_usuario = UserDB(
                Email=datos["email"],
                PasswordHash=hash_password(datos["password"]),
                FirstName=datos["first_name"],
                LastName=datos["last_name"],
                DocumentNumber=datos.get("document_number", "00000000"),
                CompanyID=company_id
            )
            session.add(nuevo_usuario)
            session.commit()
            session.refresh(nuevo_usuario)

            # Asignar rol
            rol_defecto = session.exec(select(RoleDB).where(RoleDB.RoleName == ROL_DEFECTO)).first()
            if rol_defecto:
                user_role = UserRoleDB(UserID=nuevo_usuario.UserID, RoleID=rol_defecto.RoleID)
                session.add(user_role)
            
            # 🚨 GUARDADO EN EL MÓDULO LOCATIONS 🚨
            city = datos.get("city")
            address = datos.get("address")
            if city or address:
                location = LocationDB(
                    UserID=nuevo_usuario.UserID,
                    City=city,
                    Address=address,
                    Country=datos.get("country", "Colombia") # Por defecto según modelo
                )
                session.add(location)

            session.commit()
            return {"status": "success", "user_id": str(nuevo_usuario.UserID)}

def hash_password(password: str) -> str:
    return hashlib.sha256(password.encode("utf-8")).hexdigest()

# AGREGA ESTO PARA QUE ADMIN_SERVICE NO SE QUEJE:
def _hash_password(password: str) -> str:
    return hash_password(password)

    # Backend/services/auth_service.py

# ... tu clase ServicioAuth y funciones anteriores ...

# AGREGA ESTO TAMBIÉN PARA COMPLETAR LA LIMPIEZA DE IMPORTACIONES:
def _usuario_a_dict(session: Session, user: UserDB) -> dict[str, Any]:
    """Helper para convertir el modelo UserDB a dict para el API."""
    user_data = user.model_dump()
    # Eliminamos el hash de la contraseña por seguridad antes de enviarlo
    if "PasswordHash" in user_data:
        del user_data["PasswordHash"]
    
    # Aquí puedes añadir lógica extra si necesitas incluir el rol u otros campos
    return user_data