from __future__ import annotations
import secrets
import hashlib
import time
from typing import Any
from sqlmodel import Session, select
from Backend.core.database import get_engine
from Backend.models.db_models import UserDB, PersonDB
from Backend.constants import ROL_DEFECTO
from Backend.core.auth_roles import asignar_rol_usuario, obtener_rol_usuario
from Backend.services.company_service import ServicioCompany
from Backend.utils.email_utils import validar_y_normalizar_correo
from Backend.core.exceptions import (
    EmailAlreadyExistsError, 
    UserNotFoundError, 
    InvalidCredentialsError
)
# Asegúrate de crear este archivo para guardar los tokens en memoria de forma centralizada
from Backend.core.session_store import RESET_TOKENS 

# --- Funciones de Hash (Seguras bajo OWASP) ---
def _hash_password(password: str) -> str:
    salt = secrets.token_hex(16)
    dk = hashlib.pbkdf2_hmac("sha256", password.encode(), salt.encode(), 100_000)
    return f"{salt}${dk.hex()}"

def _verify_password(password: str, stored: str) -> bool:
    try:
        salt, hexhash = stored.split("$", 1)
        dk = hashlib.pbkdf2_hmac("sha256", password.encode(), salt.encode(), 100_000)
        return secrets.compare_digest(dk.hex(), hexhash)
    except ValueError:
        return False

def _usuario_a_dict(session: Session, user: UserDB) -> dict[str, Any]:
    """DTO para el frontend (incluye nombre, apellidos, rol y compañía)."""
    persona = session.get(PersonDB, user.PersonID)
    try:
        rol = obtener_rol_usuario(session, user.UserID)
    except Exception:
        rol = ROL_DEFECTO
    company_svc = ServicioCompany()
    company = company_svc.compania_primaria_usuario(session, user.UserID)
    return {
        "id": str(user.UserID),
        "email": user.Email,
        "nombre": persona.FirstName if persona else "",
        "apellidos": persona.LastName if persona else "",
        "rol": rol,
        "companyId": str(company.CompanyID) if company else None,
        "companyName": company.CompanyName if company else None,
        "companyKey": company.CompanyKey if company else None,
    }


class ServicioAuth:
    """Servicio de autenticación relacional (Persons + Users) con persistencia en SQL Server."""

    def registrar(
        self,
        nombre: str,
        apellidos: str,
        email: str,
        password: str,
        company_key: str,
    ) -> dict[str, Any]:
        email_norm = validar_y_normalizar_correo(email)
        company_svc = ServicioCompany()

        with Session(get_engine()) as session:
            existing = session.exec(select(UserDB).where(UserDB.Email == email_norm)).first()
            if existing:
                raise EmailAlreadyExistsError()

            company = company_svc.resolver_o_crear_para_registro(session, company_key)

            nueva_persona = PersonDB(FirstName=nombre.strip(), LastName=apellidos.strip())
            session.add(nueva_persona)
            session.flush()

            nuevo_usuario = UserDB(
                Email=email_norm,
                PasswordHash=_hash_password(password),
                PersonID=nueva_persona.PersonID,
            )
            session.add(nuevo_usuario)
            session.flush()
            asignar_rol_usuario(session, nuevo_usuario.UserID, ROL_DEFECTO)
            company_svc.vincular_usuario(session, nuevo_usuario.UserID, company)

            session.commit()
            session.refresh(nuevo_usuario)

            return _usuario_a_dict(session, nuevo_usuario)

    def login(self, email: str, password: str) -> dict[str, Any]:
        email_norm = validar_y_normalizar_correo(email)
        
        with Session(get_engine()) as session:
            user = session.exec(select(UserDB).where(UserDB.Email == email_norm)).first()
            if not user:
                raise UserNotFoundError()
            
            if not _verify_password(password, user.PasswordHash):
                raise InvalidCredentialsError()

            return _usuario_a_dict(session, user)

    def crear_token_reset(self, email: str) -> str:
        with Session(get_engine()) as session:
            user = session.exec(select(UserDB).where(UserDB.Email == email)).first()
            if not user:
                raise UserNotFoundError()
            
            token = secrets.token_urlsafe(32)
            # Guardar en el store centralizado
            RESET_TOKENS[token] = (email, time.time() + 3600)
            return token

    def restablecer_con_token(self, token: str, new_password: str) -> None:
        entry = RESET_TOKENS.pop(token, None)
        if not entry:
            raise ValueError("TOKEN_INVALIDO")
        
        email_norm, exp = entry
        if time.time() > exp:
            raise ValueError("TOKEN_EXPIRADO")
        
        with Session(get_engine()) as session:
            user = session.exec(select(UserDB).where(UserDB.Email == email_norm)).first()
            if not user:
                raise UserNotFoundError()
            
            user.PasswordHash = _hash_password(new_password)
            session.add(user)
            session.commit()