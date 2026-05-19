"""Gestor de prototipos: registra plantillas y entrega clones."""

from __future__ import annotations

from .caso_plantilla import CasoPlantilla, IPrototipoCaso


class GestorPlantillas:
    def __init__(self) -> None:
        self._prototipos: dict[str, IPrototipoCaso] = {}
        self._registrar_plantillas_por_defecto()

    def _registrar_plantillas_por_defecto(self) -> None:
        self.agregar_plantilla(
            "default",
            CasoPlantilla(
                id=0,
                cliente="Cliente genérico",
                activo=1,
                prioridad=5.0,
                categoria="general",
            ),
        )
        self.agregar_plantilla(
            "amazon",
            CasoPlantilla(
                id=0,
                cliente="Amazon Marketplace",
                activo=1,
                prioridad=7.0,
                categoria="logistica",
            ),
        )
        self.agregar_plantilla(
            "shopify",
            CasoPlantilla(
                id=0,
                cliente="Shopify Store",
                activo=1,
                prioridad=6.0,
                categoria="ecommerce",
            ),
        )

    def agregar_plantilla(self, llave: str, prototipo: IPrototipoCaso) -> None:
        self._prototipos[llave.lower()] = prototipo

    def obtener_clon(self, llave: str) -> IPrototipoCaso:
        clave = (llave or "default").lower()
        base = self._prototipos.get(clave) or self._prototipos["default"]
        return base.clone()
