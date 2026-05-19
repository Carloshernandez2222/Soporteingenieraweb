"""Composite (estructural): métricas unificadas para tiendas (compuestos) y casos (hojas)."""

from __future__ import annotations

from abc import ABC, abstractmethod
from typing import Any


class ComponenteSoporte(ABC):
    def __init__(self, nombre: str):
        self.nombre = nombre

    @abstractmethod
    def obtener_total_casos(self) -> int:
        ...

    @abstractmethod
    def obtener_prioridad_promedio(self) -> float:
        ...


class CasoHoja(ComponenteSoporte):
    def __init__(self, caso_id: int, prioridad: float, nombre_cliente: str):
        super().__init__(nombre_cliente)
        self.caso_id = caso_id
        self.prioridad = prioridad

    @classmethod
    def from_dict(cls, registro: dict[str, Any]) -> CasoHoja:
        return cls(
            caso_id=int(registro["id"]),
            prioridad=float(registro["prioridad"]),
            nombre_cliente=str(registro["cliente"]),
        )

    def obtener_total_casos(self) -> int:
        return 1

    def obtener_prioridad_promedio(self) -> float:
        return self.prioridad


class TiendaComposite(ComponenteSoporte):
    def __init__(self, nombre: str):
        super().__init__(nombre)
        self._hijos: list[ComponenteSoporte] = []

    def agregar(self, componente: ComponenteSoporte) -> None:
        self._hijos.append(componente)

    def eliminar(self, componente: ComponenteSoporte) -> None:
        if componente in self._hijos:
            self._hijos.remove(componente)

    def obtener_total_casos(self) -> int:
        return sum(h.obtener_total_casos() for h in self._hijos)

    def obtener_prioridad_promedio(self) -> float:
        total = self.obtener_total_casos()
        if total == 0:
            return 0.0
        suma = sum(
            h.obtener_prioridad_promedio() * h.obtener_total_casos() for h in self._hijos
        )
        return round(suma / total, 2)
