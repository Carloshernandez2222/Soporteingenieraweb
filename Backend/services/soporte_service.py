from __future__ import annotations
from typing import Any, Optional, List
from uuid import UUID
from sqlmodel import Session, select
from Backend.core.database import get_engine
from Backend.models.db_models import CaseHistoryDB, CompanyDB, PersonDB, SupportCaseDB, OrderDB, UserDB
from Backend.services.company_service import ServicioCompany
from Backend.core.exceptions import CasoNoEncontradoError
from Backend.patterns.observer import IObservador, ObservadorEmail, ObservadorLogs

class ServicioSoporte:
    """Servicio de negocio: Persistencia de tickets en SQL Server con SQLModel."""

    def __init__(self):
        self._observadores: List[IObservador] = [ObservadorLogs(), ObservadorEmail()]
        self._companies = ServicioCompany()

    def notificar(self, evento: str, datos: dict) -> None:
        for obs in self._observadores:
            obs.actualizar(evento, datos)

    def registrar_caso(
        self,
        user_id: str,
        descripcion: str,
        order_id: Optional[str] = None,
        case_type: str = "General",
        priority: str = "Medium"
    ) -> dict[str, Any]:
        
        with Session(get_engine()) as session:
            # 1. Validación de UserID (Obligatorio)
            try:
                target_user_id = UUID(user_id)
            except (ValueError, TypeError):
                raise ValueError("FORMATO_INVALIDO_USER_ID")

            # 2. Validación de OrderID (Solo si viene con datos)
            target_order_id = None
            if order_id and order_id.strip():
                try:
                    target_order_id = UUID(order_id)
                except ValueError:
                    raise ValueError("FORMATO_INVALIDO_ORDER_ID")
                
                # Validar existencia real en base de datos
                order = session.exec(select(OrderDB).where(OrderDB.OrderID == target_order_id)).first()
                if not order:
                    raise ValueError("ORDER_NOT_FOUND")

            company = self._companies.compania_primaria_usuario(session, target_user_id)

            nuevo_caso = SupportCaseDB(
                UserID=target_user_id,
                OrderID=target_order_id,
                CompanyID=company.CompanyID if company else None,
                Description=descripcion,
                CaseType=case_type,
                Status="Abierto",
                Priority=priority,
            )
            
            session.add(nuevo_caso)
            session.commit()
            session.refresh(nuevo_caso)

            # 4. Notificación
            self.notificar("CASO_CREADO", {"case_id": str(nuevo_caso.CaseID), "type": case_type})

            return {
                "status": "success",
                "case_id": str(nuevo_caso.CaseID),
                "message": "Solicitud registrada correctamente.",
            }

    def _caso_dict(self, session: Session, caso: SupportCaseDB) -> dict[str, Any]:
        solicitante = session.get(UserDB, caso.UserID)
        persona = session.get(PersonDB, solicitante.PersonID) if solicitante else None
        asignado = session.get(UserDB, caso.AssignedTo) if caso.AssignedTo else None
        persona_asignado = session.get(PersonDB, asignado.PersonID) if asignado else None
        company = session.get(CompanyDB, caso.CompanyID) if caso.CompanyID else None
        return {
            "case_id": str(caso.CaseID),
            "user_id": str(caso.UserID),
            "solicitante": f"{persona.FirstName} {persona.LastName}".strip() if persona else "—",
            "solicitante_email": solicitante.Email if solicitante else "",
            "assigned_to": str(caso.AssignedTo) if caso.AssignedTo else None,
            "asignado_nombre": (
                f"{persona_asignado.FirstName} {persona_asignado.LastName}".strip()
                if persona_asignado
                else None
            ),
            "company_id": str(caso.CompanyID) if caso.CompanyID else None,
            "company_name": company.CompanyName if company else None,
            "type": caso.CaseType,
            "status": caso.Status,
            "priority": caso.Priority,
            "description": caso.Description or "",
            "created_at": caso.CreatedAt,
        }

    def listar_todos_casos(self) -> List[dict[str, Any]]:
        with Session(get_engine()) as session:
            casos = session.exec(select(SupportCaseDB).order_by(SupportCaseDB.CreatedAt.desc())).all()
            return [self._caso_dict(session, c) for c in casos]

    # --- NUEVO MÉTODO: Listar casos de un usuario específico ---
    def listar_casos_usuario(self, user_id: str) -> List[dict[str, Any]]:
        with Session(get_engine()) as session:
            try:
                target_id = UUID(user_id)
            except (ValueError, TypeError):
                raise ValueError("FORMATO_INVALIDO_USER_ID")

            # Buscamos solo los tickets que pertenezcan a este usuario
            casos = session.exec(
                select(SupportCaseDB)
                .where(SupportCaseDB.UserID == target_id)
                .order_by(SupportCaseDB.CreatedAt.desc())
            ).all()
            
            return [self._caso_dict(session, c) for c in casos]

    def asignar_caso(self, case_id: str, assigned_to_user_id: str | None) -> dict[str, Any]:
        with Session(get_engine()) as session:
            caso = session.get(SupportCaseDB, UUID(case_id))
            if not caso:
                raise CasoNoEncontradoError("Solicitud no encontrada.")
            if assigned_to_user_id:
                asignado = session.get(UserDB, UUID(assigned_to_user_id))
                if not asignado:
                    raise ValueError("Usuario de asignación no encontrado.")
                caso.AssignedTo = asignado.UserID
            else:
                caso.AssignedTo = None
            session.add(caso)
            session.commit()
            session.refresh(caso)
            return self._caso_dict(session, caso)

    def actualizar_estado(
        self, case_id: str, status: str, comentario: str, updated_by_user_id: str
    ) -> dict[str, Any]:
        with Session(get_engine()) as session:
            caso = session.get(SupportCaseDB, UUID(case_id))
            if not caso:
                raise CasoNoEncontradoError("Solicitud no encontrada.")
            editor = session.get(UserDB, UUID(updated_by_user_id))
            if not editor:
                raise ValueError("Usuario no válido.")

            caso.Status = status.strip()
            session.add(caso)
            session.add(
                CaseHistoryDB(
                    CaseID=caso.CaseID,
                    Status=caso.Status,
                    Comment=(comentario or "").strip() or None,
                    UpdatedBy=editor.UserID,
                )
            )
            session.commit()
            session.refresh(caso)
            return self._caso_dict(session, caso)

    def historial_caso(self, case_id: str) -> list[dict[str, Any]]:
        with Session(get_engine()) as session:
            logs = session.exec(
                select(CaseHistoryDB)
                .where(CaseHistoryDB.CaseID == UUID(case_id))
                .order_by(CaseHistoryDB.UpdatedAt.desc())
            ).all()
            out: list[dict[str, Any]] = []
            for log in logs:
                editor = session.get(UserDB, log.UpdatedBy)
                persona = session.get(PersonDB, editor.PersonID) if editor else None
                out.append(
                    {
                        "status": log.Status,
                        "comentario": log.Comment,
                        "updated_at": log.UpdatedAt,
                        "updated_by": (
                            f"{persona.FirstName} {persona.LastName}".strip() if persona else ""
                        ),
                    }
                )
            return out

    def cerrar_caso(self, case_id: str) -> bool:
        with Session(get_engine()) as session:
            try:
                target_id = UUID(case_id)
            except (ValueError, TypeError):
                raise ValueError("FORMATO_INVALIDO_ID")

            caso = session.exec(select(SupportCaseDB).where(SupportCaseDB.CaseID == target_id)).first()
            if not caso:
                raise CasoNoEncontradoError("No existe el caso solicitado.")
            
            caso.Status = "Cerrado"
            session.add(caso)
            session.commit()
            return True