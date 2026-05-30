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
from Backend.models.db_models import CompanyDB, UserCompanyDB, UserDB


def normalizar_company_key(raw: str) -> str:
    key = re.sub(r"\s+", "-", (raw or "").strip().lower())
    key = re.sub(r"[^a-z0-9\-_.]", "", key)
    return key


class ServicioCompany:
    def listar_activas(self) -> list[dict[str, Any]]:
        with Session(get_engine()) as session:
            rows = session.exec(
                select(CompanyDB).where(CompanyDB.IsActive == True).order_by(CompanyDB.CompanyName)
            ).all()
            return [self._company_dict(c) for c in rows]

    def listar_todas(self) -> list[dict[str, Any]]:
        with Session(get_engine()) as session:
            rows = session.exec(select(CompanyDB).order_by(CompanyDB.CompanyName)).all()
            return [self._company_dict(c) for c in rows]

    def obtener_por_key(self, company_key: str) -> CompanyDB:
        key = normalizar_company_key(company_key)
        if not key:
            raise CompanyNotFoundError("Llave de compañía inválida.")
        with Session(get_engine()) as session:
            company = session.exec(select(CompanyDB).where(CompanyDB.CompanyKey == key)).first()
            if not company:
                raise CompanyNotFoundError("No existe una compañía con esa llave.")
            return company

    def crear_compania(self, nombre: str, company_key: str) -> dict[str, Any]:
        key = normalizar_company_key(company_key)
        nombre_limpio = (nombre or "").strip()
        if not key or len(key) < 2:
            raise ValueError("La llave de compañía debe tener al menos 2 caracteres.")
        if not nombre_limpio:
            raise ValueError("El nombre de la compañía es obligatorio.")

        with Session(get_engine()) as session:
            existente = session.exec(select(CompanyDB).where(CompanyDB.CompanyKey == key)).first()
            if existente:
                raise CompanyKeyInUseError("Esa llave de compañía ya está en uso.")

            company = CompanyDB(CompanyName=nombre_limpio, CompanyKey=key, IsActive=True)
            session.add(company)
            session.commit()
            session.refresh(company)
            return self._company_dict(company)

    def vincular_usuario(self, session: Session, user_id: UUID, company: CompanyDB) -> None:
        if not company.IsActive:
            raise CompanyInactiveError("La compañía está inactiva.")
        user = session.get(UserDB, user_id)
        if user:
            user.CompanyID = company.CompanyID
            session.add(user)
            session.flush()
        link = session.exec(
            select(UserCompanyDB).where(
                UserCompanyDB.UserID == user_id,
                UserCompanyDB.CompanyID == company.CompanyID,
            )
        ).first()
        if not link:
            session.add(
                UserCompanyDB(
                    UserID=user_id,
                    CompanyID=company.CompanyID,
                    IsPrimary=True,
                    IsActive=True,
                )
            )
        else:
            link.IsActive = True
            link.IsPrimary = True
            session.add(link)

    def resolver_o_crear_para_registro(self, session: Session, company_key: str) -> CompanyDB:
        key = normalizar_company_key(company_key)
        if not key:
            raise ValueError("Debe indicar la llave de su compañía.")
        if len(key) < 8:
            raise ValueError("La llave de compañía debe tener al menos 8 caracteres.")

        company = session.exec(select(CompanyDB).where(CompanyDB.CompanyKey == key)).first()
        if company:
            if not company.IsActive:
                raise CompanyInactiveError("La compañía asociada a esa llave está inactiva.")
            return company

        raise CompanyNotFoundError(
            "La llave de compañía no existe. Solicite una llave válida al administrador."
        )

    def compania_primaria_usuario(self, session: Session, user_id: UUID) -> CompanyDB | None:
        user = session.get(UserDB, user_id)
        if user and user.CompanyID:
            company = session.get(CompanyDB, user.CompanyID)
            if company and company.IsActive:
                return company
        link = session.exec(
            select(UserCompanyDB)
            .where(UserCompanyDB.UserID == user_id, UserCompanyDB.IsActive == True)
            .order_by(UserCompanyDB.IsPrimary.desc())
        ).first()
        if not link:
            return None
        return session.get(CompanyDB, link.CompanyID)

    def set_activa(self, company_id: str, activa: bool) -> dict[str, Any]:
        with Session(get_engine()) as session:
            company = session.get(CompanyDB, UUID(company_id))
            if not company:
                raise CompanyNotFoundError("Compañía no encontrada.")
            company.IsActive = activa
            session.add(company)
            session.commit()
            session.refresh(company)
            return self._company_dict(company)

    @staticmethod
    def _company_dict(company: CompanyDB) -> dict[str, Any]:
        return {
            "id": str(company.CompanyID),
            "nombre": company.CompanyName,
            "llave": company.CompanyKey,
            "activa": company.IsActive,
            "creadaEn": company.CreatedAt.isoformat() if company.CreatedAt else None,
        }
