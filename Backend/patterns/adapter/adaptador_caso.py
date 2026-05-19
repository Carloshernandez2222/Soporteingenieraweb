"""Adapter (estructural): traduce payloads externos al modelo interno del taller."""

from __future__ import annotations

from abc import ABC, abstractmethod
from typing import Any


class IAdaptadorCaso(ABC):
    @abstractmethod
    def traducir_payload(self, payload_externo: dict[str, Any]) -> dict[str, Any]:
        ...


class AdaptadorAmazon(IAdaptadorCaso):
    def traducir_payload(self, payload_externo: dict[str, Any]) -> dict[str, Any]:
        prioridad = self._extraer_prioridad(str(payload_externo.get("priority_level", "medium")))
        return {
            "id": int(payload_externo.get("case_id") or payload_externo.get("id", 0)),
            "cliente": str(payload_externo.get("buyer_name") or payload_externo.get("cliente", "")),
            "activo": bool(payload_externo.get("is_open", True)),
            "prioridad": prioridad,
            "categoria": str(payload_externo.get("issue_type") or "logistica"),
            "plantilla": "amazon",
        }

    def _extraer_prioridad(self, nivel: str) -> float:
        mapa = {"low": 2.0, "medium": 5.0, "high": 8.0, "critical": 10.0}
        return mapa.get(nivel.lower(), 5.0)


class AdaptadorShopify(IAdaptadorCaso):
    def traducir_payload(self, payload_externo: dict[str, Any]) -> dict[str, Any]:
        customer = payload_externo.get("customer") or {}
        if isinstance(customer, dict):
            nombre = customer.get("display_name") or customer.get("email", "Shopify")
        else:
            nombre = str(customer)
        return {
            "id": int(payload_externo.get("ticket_number") or payload_externo.get("id", 0)),
            "cliente": nombre,
            "activo": payload_externo.get("status") != "closed",
            "prioridad": float(payload_externo.get("urgency_score", 5.0)),
            "categoria": str(payload_externo.get("tags", ["ecommerce"])[0] if payload_externo.get("tags") else "ecommerce"),
            "plantilla": "shopify",
        }


def obtener_adaptador(origen: str) -> IAdaptadorCaso | None:
    adaptadores: dict[str, IAdaptadorCaso] = {
        "amazon": AdaptadorAmazon(),
        "shopify": AdaptadorShopify(),
    }
    return adaptadores.get((origen or "").lower())
