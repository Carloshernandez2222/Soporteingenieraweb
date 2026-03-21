from pydantic import BaseModel
from typing import Optional

class CasoSoporte(BaseModel):
    id: int
    cliente: str
    prioridad: int  # Del 1 al 5
    activo: bool
    valor_estimado: float
    categoria: str # Para el filtrado dinámico
