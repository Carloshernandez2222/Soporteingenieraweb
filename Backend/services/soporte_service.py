from __future__ import annotations
from typing import Any, Optional, List
from uuid import UUID
from sqlmodel import Session, select
from Backend.core.database import get_engine
from Backend.models.db_models import SupportCaseDB, UserDB
from Backend.core.exceptions import CasoNoEncontradoError
from Backend.patterns.observer import IObservador, ObservadorEmail, ObservadorLogs

class ServicioSoporte:
    """Servicio de negocio: Persistencia de tickets unificada en SQL Server."""

    def __init__(self):
        self._observadores: List[IObservador] = [ObservadorLogs(), ObservadorEmail()]

    def notificar(self, evento: str, datos: dict) -> None:
        for obs in self._observadores:
            obs.actualizar(evento, datos)

    def _asignar_prioridad(self, case_type: str, descripcion: str) -> str:
        """REGLA DE NEGOCIO: Asignación de prioridad dinámica basada en el texto y tipo."""
        texto_analisis = (case_type + " " + descripcion).lower()
        
        # Palabras clave críticas = Alta prioridad
        if any(palabra in texto_analisis for palabra in ["caída", "caida", "urgente", "falla", "error", "no puedo", "roto"]):
            return "High"
        # Palabras de consulta = Baja prioridad
        elif any(palabra in texto_analisis for palabra in ["consulta", "información", "informacion", "pregunta", "duda"]):
            return "Low"
        
        # Por defecto
        return "Medium"

    def registrar_caso(
        self,
        user_id: str,
        descripcion: str,
        case_type: str = "General",
    ) -> dict[str, Any]:
        
        with Session(get_engine()) as session:
            # 1. Validación de formato de UserID
            try:
                target_user_id = UUID(user_id)
            except (ValueError, TypeError):
                raise ValueError("El ID de usuario proporcionado no tiene un formato válido.")

            # 2. Validar que el usuario realmente existe en SQL Server
            usuario = session.exec(select(UserDB).where(UserDB.UserID == target_user_id)).first()
            if not usuario:
                raise ValueError("El usuario especificado no existe en la base de datos.")

            # 3. Aplicar regla de negocio de prioridad
            prioridad_calculada = self._asignar_prioridad(case_type, descripcion)

            # 4. Creación del caso (ID generado automáticamente por SQLModel)
            nuevo_caso = SupportCaseDB(
                UserID=target_user_id,
                Description=descripcion,
                CaseType=case_type,
                Status="Open",
                Priority=prioridad_calculada
            )
            
            session.add(nuevo_caso)
            session.commit()
            session.refresh(nuevo_caso)

            # 5. Notificación
            self.notificar("CASO_CREADO", {
                "case_id": str(nuevo_caso.CaseID), 
                "type": case_type,
                "priority": prioridad_calculada
            })

            return {
                "status": "success",
                "case_id": str(nuevo_caso.CaseID),
                "message": f"Caso guardado exitosamente con prioridad {prioridad_calculada}."
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
                    "description": c.Description,
                    "created_at": c.CreatedAt.isoformat() if c.CreatedAt else None
                } for c in casos
            ]

    def listar_casos_usuario(self, user_id: str) -> List[dict[str, Any]]:
        with Session(get_engine()) as session:
            try:
                target_id = UUID(user_id)
            except (ValueError, TypeError):
                raise ValueError("El ID de usuario proporcionado no tiene un formato válido.")

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
                    "description": getattr(c, 'Description', 'Sin descripción'),
                    "created_at": c.CreatedAt.isoformat() if c.CreatedAt else None
                } for c in casos
            ]

    def cerrar_caso(self, case_id: str) -> bool:
        with Session(get_engine()) as session:
            try:
                target_id = UUID(case_id)
            except (ValueError, TypeError):
                raise ValueError("El ID del caso no tiene un formato válido.")

            caso = session.exec(select(SupportCaseDB).where(SupportCaseDB.CaseID == target_id)).first()
            if not caso:
                raise CasoNoEncontradoError("No existe el caso solicitado.")
            
            caso.Status = "Closed"
            session.add(caso)
            session.commit()
            return True