from __future__ import annotations
from typing import Any, Optional, List
from uuid import UUID
from sqlmodel import Session, select
from Backend.core.database import get_engine
from Backend.models.db_models import SupportCaseDB, OrderDB
from Backend.core.exceptions import CasoNoEncontradoError
from Backend.patterns.observer import IObservador, ObservadorEmail, ObservadorLogs

class ServicioSoporte:
    """Servicio de negocio: Persistencia de tickets en SQL Server con SQLModel."""

    def __init__(self):
        self._observadores: List[IObservador] = [ObservadorLogs(), ObservadorEmail()]

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

            # 3. Creación del caso (Ahora guarda la descripción)
            nuevo_caso = SupportCaseDB(
                UserID=target_user_id,
                OrderID=target_order_id,
                Description=descripcion,  # <--- GUARDAMOS LA DESCRIPCIÓN
                CaseType=case_type,
                Status="Open",
                Priority=priority
            )
            
            session.add(nuevo_caso)
            session.commit()
            session.refresh(nuevo_caso)

            # 4. Notificación
            self.notificar("CASO_CREADO", {"case_id": str(nuevo_caso.CaseID), "type": case_type})

            return {
                "status": "success",
                "case_id": str(nuevo_caso.CaseID),
                "message": f"Caso #{nuevo_caso.CaseID} registrado exitosamente."
            }

    def listar_todos_casos(self) -> List[dict[str, Any]]:
        with Session(get_engine()) as session:
            casos = session.exec(select(SupportCaseDB).order_by(SupportCaseDB.CreatedAt.desc())).all()
            return [
                {
                    "case_id": str(c.CaseID),
                    "user_id": str(c.UserID),
                    "type": c.CaseType,
                    "status": c.Status,
                    "priority": c.Priority,
                    "created_at": c.CreatedAt
                } for c in casos
            ]

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
            
            return [
                {
                    "case_id": str(c.CaseID),
                    "type": c.CaseType,
                    "status": c.Status,
                    "priority": c.Priority,
                    "description": getattr(c, 'Description', 'Sin descripción'), # <--- DEVOLVEMOS LA DESCRIPCIÓN
                    "created_at": c.CreatedAt
                } for c in casos
            ]

    def cerrar_caso(self, case_id: str) -> bool:
        with Session(get_engine()) as session:
            try:
                target_id = UUID(case_id)
            except (ValueError, TypeError):
                raise ValueError("FORMATO_INVALIDO_ID")

            caso = session.exec(select(SupportCaseDB).where(SupportCaseDB.CaseID == target_id)).first()
            if not caso:
                raise CasoNoEncontradoError("No existe el caso solicitado.")
            
            caso.Status = "Closed"
            session.add(caso)
            session.commit()
            return True