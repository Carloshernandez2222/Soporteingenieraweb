"""Consulta de roles de usuario (tablas Roles / UserRoles en SQL Server)."""

from __future__ import annotations

from uuid import UUID

from sqlmodel import Session, select

from Backend.constants import ROL_DEFECTO, normalizar_rol
from Backend.models.db_models import RoleDB, UserRoleDB


def obtener_rol_usuario(session: Session, user_id: UUID) -> str:
    nombre = session.exec(
        select(RoleDB.RoleName)
        .join(UserRoleDB, UserRoleDB.RoleID == RoleDB.RoleID)
        .where(UserRoleDB.UserID == user_id, UserRoleDB.IsActive == True)  # noqa: E712
    ).first()
    return normalizar_rol(nombre) if nombre else ROL_DEFECTO


def asignar_rol_usuario(session: Session, user_id: UUID, rol_nombre: str) -> None:
    rol_key = normalizar_rol(rol_nombre)
    role = session.exec(select(RoleDB).where(RoleDB.RoleName == rol_key)).first()
    if not role:
        role = RoleDB(RoleName=rol_key, Description=f"Rol {rol_key}")
        session.add(role)
        session.flush()

    existe = session.exec(
        select(UserRoleDB).where(
            UserRoleDB.UserID == user_id,
            UserRoleDB.RoleID == role.RoleID,
        )
    ).first()
    if not existe:
        session.add(UserRoleDB(UserID=user_id, RoleID=role.RoleID))
