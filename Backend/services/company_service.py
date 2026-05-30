from __future__ import annotations
import re
from typing import Any
from uuid import UUID
from sqlmodel import Session, select
from Backend.core.database import get_engine
from Backend.core.exceptions_companies import (
    CompanyInactiveError,
    CompanyKeyInUseError,
    CompanyNotFoundError,
)
from Backend.models.db_models import CompanyDB, UserDB

def normalizar_company_key(key: str) -> str:
    return re.sub(r"[^a-z0-9\-_.]", "", key.strip().lower())

class ServicioCompany:
    def listar_activas(self) -> list[dict[str, Any]]:
        with Session(get_engine()) as session:
            comps = session.exec(select(CompanyDB).where(CompanyDB.IsActive == True)).all()
            return [{"id": str(c.CompanyID), "nombre": c.Name, "llave": c.Nit} for c in comps]

    def listar_todas(self) -> list[dict[str, Any]]:
        with Session(get_engine()) as session:
            comps = session.exec(select(CompanyDB)).all()
            return [{"id": str(c.CompanyID), "nombre": c.Name, "llave": c.Nit, "activa": c.IsActive} for c in comps]

    def crear_compania(self, nombre: str, llave: str) -> dict[str, Any]:
        # (Ajusta esto si usas el método del controlador donde creamos ubicación simultánea)
        pass 

    def vincular_usuario(self, session: Session, user_id: UUID, company: CompanyDB) -> None:
        """Vincula un usuario a una compañía actualizando su CompanyID directamente."""
        user = session.get(UserDB, user_id)
        if user:
            user.CompanyID = company.CompanyID
            session.add(user)
            session.flush()

    def set_activa(self, company_id: str, activa: bool) -> dict[str, Any]:
        with Session(get_engine()) as session:
            company = session.get(CompanyDB, UUID(company_id))
            if not company:
                raise CompanyNotFoundError()
            company.IsActive = activa
            session.add(company)
            session.commit()
            return {"id": str(company.CompanyID), "activa": company.IsActive}