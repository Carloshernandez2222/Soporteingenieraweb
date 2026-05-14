import re
from typing import Annotated

from pydantic import BaseModel, ConfigDict, Field, field_validator

from ..constants import MAX_NOMBRE_LEN

Prioridad = Annotated[
    float,
    Field(
        ge=0.0,
        le=10.0,
        description="Prioridad de 0 (baja) a 10 (crítica).",
        examples=[3.5],
    ),
]


class CasoSoporte(BaseModel):
    """Modelo de entrada: caso en la lista temporal en memoria (taller)."""

    model_config = ConfigDict(
        json_schema_extra={
            "examples": [
                {
                    "id": 1001,
                    "cliente": "María Pérez",
                    "activo": True,
                    "prioridad": 4.0,
                    "categoria": "red",
                }
            ]
        }
    )

    id: int = Field(description="Identificador único del caso en la lista temporal.", examples=[1001])
    cliente: str = Field(
        max_length=MAX_NOMBRE_LEN,
        description="Nombre del cliente, sin dígitos; máximo "
        + str(MAX_NOMBRE_LEN)
        + " caracteres.",
        examples=["María Pérez"],
    )
    activo: bool = Field(description="Si el caso sigue activo.", examples=[True])
    prioridad: Prioridad
    categoria: str = Field(
        max_length=64,
        description="Categoría del incidente (p. ej. red, software, hardware).",
        examples=["red"],
    )

    @field_validator("cliente")
    @classmethod
    def cliente_sin_numeros(cls, v: str) -> str:
        t = (v or "").strip()
        if re.search(r"\d", t):
            raise ValueError("El nombre del cliente no puede contener números.")
        return v
