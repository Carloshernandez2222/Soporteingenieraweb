"""Strategy (comportamental): procesamiento intercambiable según origen del registro."""

from __future__ import annotations

import re
from abc import ABC, abstractmethod
from typing import Any


class EstrategiaProcesamiento(ABC):
    @abstractmethod
    def procesar_entrada(self, payload: dict[str, Any]) -> dict[str, Any]:
        ...


class EstrategiaFormularioWeb(EstrategiaProcesamiento):
    def procesar_entrada(self, payload: dict[str, Any]) -> dict[str, Any]:
        return {
            "nombre": str(payload.get("nombre", "")).strip(),
            "email": str(payload.get("email", "")).strip(),
            "descripcion": str(payload.get("descripcion", "")).strip(),
            "categoria": str(payload.get("categoria") or "general").strip() or "general",
            "creado_por_rol": str(payload.get("creado_por_rol") or "usuario"),
        }


class EstrategiaChatbotAI(EstrategiaProcesamiento):
    def procesar_entrada(self, payload: dict[str, Any]) -> dict[str, Any]:
        texto = str(payload.get("mensaje") or payload.get("descripcion", "")).strip()
        entidades = self._extraer_entidades_nlp(texto)
        return {
            "nombre": entidades.get("nombre") or str(payload.get("nombre", "Usuario Chatbot")),
            "email": entidades.get("email") or str(payload.get("email", "")),
            "descripcion": entidades.get("descripcion") or texto,
            "categoria": entidades.get("categoria") or "chatbot",
            "creado_por_rol": "chatbot",
        }

    def _extraer_entidades_nlp(self, texto: str) -> dict[str, str]:
        email_match = re.search(r"[\w.+-]+@[\w.-]+\.\w+", texto)
        categoria = "general"
        for palabra, cat in (
            ("red", "red"),
            ("software", "software"),
            ("hardware", "hardware"),
            ("pago", "facturacion"),
        ):
            if palabra in texto.lower():
                categoria = cat
                break
        nombre = "Usuario Chatbot"
        if "me llamo" in texto.lower():
            parte = texto.lower().split("me llamo", 1)[1].strip().split(".")[0].split(",")[0]
            if parte:
                nombre = parte.strip().title()
        return {
            "email": email_match.group(0) if email_match else "",
            "descripcion": texto,
            "categoria": categoria,
            "nombre": nombre,
        }


def obtener_estrategia(origen: str) -> EstrategiaProcesamiento:
    if (origen or "").lower() in ("chatbot", "ai", "bot"):
        return EstrategiaChatbotAI()
    return EstrategiaFormularioWeb()
