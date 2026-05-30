from __future__ import annotations
from typing import Any, Optional, List
from uuid import UUID
from sqlmodel import Session, select
from Backend.core.database import get_engine
from Backend.models.db_models import SupportCaseDB, UserDB
from Backend.patterns.observer import IObservador, ObservadorEmail, ObservadorLogs

class ServicioSoporte:
    def __init__(self, engine=None):
        self._observadores: List[IObservador] = [ObservadorLogs(), ObservadorEmail()]
        self.engine = engine or get_engine()

    # NUEVO: Método faltante que causaba el AttributeError en el controlador
    def listar_todos_casos(self) -> List[dict[str, Any]]:
        with Session(self.engine) as session:
            casos = session.exec(select(SupportCaseDB)).all()
            return [{"id": str(c.CaseID), "descripcion": c.Description, "tipo": c.CaseType, "estado": c.Status} for c in casos]

    def notificar(self, evento: str, datos: dict) -> None:
        for obs in self._observadores:
            obs.actualizar(evento, datos)

    def _asignar_prioridad(self, case_type: str, descripcion: str) -> str:
        texto_analisis = (case_type + " " + descripcion).lower()
        if any(p in texto_analisis for p in ["caída", "caida", "urgente", "falla", "error", "no puedo", "roto"]):
            return "High"
        elif any(p in texto_analisis for p in ["consulta", "información", "informacion", "pregunta", "duda"]):
            return "Low"
        return "Medium"

    def _ejecutar_registro(self, session: Session, user_id: str, descripcion: str, case_type: str) -> dict[str, Any]:
        try:
            target_user_id = UUID(user_id)
        except (ValueError, TypeError):
            raise ValueError("El ID de usuario proporcionado no tiene un formato válido.")

        usuario = session.exec(select(UserDB).where(UserDB.UserID == target_user_id)).first()
        if not usuario:
            raise ValueError("El usuario especificado no existe en la base de datos.")

        prioridad = self._asignar_prioridad(case_type, descripcion)
        nuevo_caso = SupportCaseDB(UserID=target_user_id, Description=descripcion, CaseType=case_type, Status="Open", Priority=prioridad)
        
        session.add(nuevo_caso)
        session.commit()
        session.refresh(nuevo_caso)
        self.notificar("CASO_CREADO", {"case_id": str(nuevo_caso.CaseID), "type": case_type, "priority": prioridad})
        return {"status": "success", "case_id": str(nuevo_caso.CaseID), "message": f"Creado con prioridad {prioridad}."}

    def registrar_caso(self, user_id: str, descripcion: str, case_type: str = "General", session: Session = None) -> dict[str, Any]:
        if session:
            return self._ejecutar_registro(session, user_id, descripcion, case_type)
        with Session(self.engine) as session:
            return self._ejecutar_registro(session, user_id, descripcion, case_type)
    
    def listar_casos_usuario(self, user_id: str) -> List[dict[str, Any]]:
        try:
            target_user_id = UUID(user_id)
        except (ValueError, TypeError):
            raise ValueError("El ID de usuario no tiene un formato válido.")

        with Session(self.engine) as session:
            # Filtramos los casos por el UserID
            statement = select(SupportCaseDB).where(SupportCaseDB.UserID == target_user_id)
            casos = session.exec(statement).all()
            
            return [
                {
                    "id": str(c.CaseID), 
                    "descripcion": c.Description, 
                    "tipo": c.CaseType, 
                    "estado": c.Status,
                    "prioridad": c.Priority
                } for c in casos
            ]