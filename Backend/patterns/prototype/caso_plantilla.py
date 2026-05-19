"""Prototype (creacional): plantillas clonables de casos del taller."""

from __future__ import annotations

import copy
from abc import ABC, abstractmethod
from typing import Any


class IPrototipoCaso(ABC):
    @abstractmethod
    def clone(self) -> IPrototipoCaso:
        ...

    @abstractmethod
    def actualizar_datos(self, datos: dict[str, Any]) -> None:
        ...

    @abstractmethod
    def to_registro(self) -> dict[str, Any]:
        ...


class CasoPlantilla(IPrototipoCaso):
    def __init__(
        self,
        id: int = 0,
        cliente: str = "",
        activo: int = 1,
        prioridad: float = 5.0,
        categoria: str = "general",
        created_at: float = 0.0,
    ):
        self.id = id
        self.cliente = cliente
        self.activo = activo
        self.prioridad = prioridad
        self.categoria = categoria
        self.created_at = created_at

    def clone(self) -> CasoPlantilla:
        return copy.deepcopy(self)

    def actualizar_datos(self, datos: dict[str, Any]) -> None:
        if "id" in datos:
            self.id = int(datos["id"])
        if "cliente" in datos:
            self.cliente = str(datos["cliente"])
        if "activo" in datos:
            self.activo = 1 if datos["activo"] else 0
        if "prioridad" in datos:
            self.prioridad = float(datos["prioridad"])
        if "categoria" in datos:
            self.categoria = str(datos["categoria"])

    def to_registro(self) -> dict[str, Any]:
        return {
            "id": self.id,
            "cliente": self.cliente,
            "activo": bool(self.activo),
            "prioridad": self.prioridad,
            "categoria": self.categoria,
        }
