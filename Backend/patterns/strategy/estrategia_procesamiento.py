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
    """Extrae nombre, correo y descripción de texto libre (varios estilos de redacción)."""

    _CATEGORIAS = (
        ("red", "red"),
        ("internet", "red"),
        ("conexion", "red"),
        ("conexión", "red"),
        ("wifi", "red"),
        ("software", "software"),
        ("sistema", "software"),
        ("panel", "software"),
        ("aplicacion", "software"),
        ("aplicación", "software"),
        ("hardware", "hardware"),
        ("equipo", "hardware"),
        ("pago", "facturacion"),
        ("factura", "facturacion"),
        ("cobro", "facturacion"),
        ("reembolso", "facturacion"),
        ("devolucion", "facturacion"),
        ("devolución", "facturacion"),
        ("pedido", "pedidos"),
        ("orden", "pedidos"),
        ("envio", "pedidos"),
        ("envío", "pedidos"),
        ("entrega", "pedidos"),
        ("checkout", "pedidos"),
        ("carrito", "pedidos"),
    )

    def procesar_entrada(self, payload: dict[str, Any]) -> dict[str, Any]:
        texto = str(
            payload.get("mensaje") or payload.get("descripcion") or ""
        ).strip()
        if not texto:
            texto = "Consulta desde chatbot"

        entidades = self._extraer_entidades_nlp(texto)
        nombre = (
            str(payload.get("nombre", "")).strip()
            or entidades.get("nombre")
            or "Usuario Chatbot"
        )
        email = str(payload.get("email", "")).strip() or entidades.get("email", "")
        descripcion = (
            str(payload.get("descripcion", "")).strip()
            or entidades.get("descripcion")
            or texto
        )

        return {
            "nombre": self._sanitizar_nombre(nombre),
            "email": email,
            "descripcion": descripcion.strip() or texto,
            "categoria": entidades.get("categoria") or "chatbot",
            "creado_por_rol": "chatbot",
        }

    def _sanitizar_nombre(self, nombre: str) -> str:
        limpio = re.sub(r"\d+", " ", nombre or "").strip()
        limpio = re.sub(r"\s+", " ", limpio)
        if len(limpio) < 2:
            return "Usuario Chatbot"
        return limpio[:80]

    def _extraer_entidades_nlp(self, texto: str) -> dict[str, str]:
        lower = texto.lower()
        email_match = re.search(r"[\w.+-]+@[\w.-]+\.\w+", texto, re.IGNORECASE)
        email = email_match.group(0).lower() if email_match else ""

        categoria = "general"
        for palabra, cat in self._CATEGORIAS:
            if palabra in lower:
                categoria = cat
                break

        nombre = self._extraer_nombre(texto, email)
        descripcion = self._limpiar_descripcion(texto, email, nombre)

        return {
            "email": email,
            "descripcion": descripcion or texto,
            "categoria": categoria,
            "nombre": nombre,
        }

    def _extraer_nombre(self, texto: str, email: str) -> str:
        for patron in (
            r"(?:me\s+llamo|mi\s+nombre\s+es|soy)\s+([a-záéíóúüñA-ZÁÉÍÓÚÜÑ\s'.-]{2,48})",
            r"nombre\s*:?\s*([a-záéíóúüñA-ZÁÉÍÓÚÜÑ\s'.-]{2,48})",
        ):
            m = re.search(patron, texto, re.IGNORECASE)
            if m:
                candidato = m.group(1).split(",")[0].split(".")[0].strip()
                if candidato and not re.search(r"\d", candidato):
                    return candidato.title()

        if email and email in texto:
            antes = texto.split(email, 1)[0]
            antes = re.sub(r"[,;:\-–—]+$", "", antes).strip()
            tokens = [
                w
                for w in re.split(r"[\s,]+", antes)
                if len(w) > 1 and w.lower() not in ("hola", "buenas", "oye", "soy", "me", "llamo")
            ]
            if 1 <= len(tokens) <= 4:
                candidato = " ".join(tokens)
                if candidato and not re.search(r"\d", candidato) and "@" not in candidato:
                    return candidato.title()
        return "Usuario Chatbot"

    def _limpiar_descripcion(self, texto: str, email: str, nombre: str) -> str:
        t = texto
        if email:
            t = re.sub(re.escape(email), " ", t, flags=re.IGNORECASE)
        if nombre and nombre != "Usuario Chatbot":
            t = re.sub(re.escape(nombre), " ", t, flags=re.IGNORECASE)
        t = re.sub(
            r"(?:me\s+llamo|mi\s+nombre\s+es|soy)\s+[^,.@]+",
            " ",
            t,
            flags=re.IGNORECASE,
        )
        t = re.sub(r"\s+", " ", t).strip(" ,.;:-")
        return t


def obtener_estrategia(origen: str) -> EstrategiaProcesamiento:
    if (origen or "").lower() in ("chatbot", "ai", "bot"):
        return EstrategiaChatbotAI()
    return EstrategiaFormularioWeb()
