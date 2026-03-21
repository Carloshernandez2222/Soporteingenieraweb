from pydantic import BaseModel

class CasoSoporte(BaseModel):
    id: int
    cliente: str
    activo: bool
    prioridad: float
    categoria: str