from pydantic import BaseModel
from typing import Optional

class CasoSoporte(BaseModel):
    # 1. Campos obligatorios (Los únicos que enviará el usuario desde JS)
    nombre: str
    email: str
    descripcion: str

    # 2. Campos automáticos / asignados por el sistema (Opcionales en la petición web)
    id: Optional[int] = None
    activo: Optional[bool] = True
    prioridad: Optional[float] = 1.0
    categoria: Optional[str] = "General"