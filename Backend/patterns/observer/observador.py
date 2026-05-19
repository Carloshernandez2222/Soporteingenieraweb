"""Observer (comportamental): reacciones desacopladas ante eventos del servicio de soporte."""

from __future__ import annotations

import logging
from abc import ABC, abstractmethod
from typing import Any

logger = logging.getLogger("trackaid.soporte")


class IObservador(ABC):
    @abstractmethod
    def actualizar(self, evento: str, datos: dict[str, Any]) -> None:
        ...


class ObservadorLogs(IObservador):
    def actualizar(self, evento: str, datos: dict[str, Any]) -> None:
        logger.info("[Observer:Log] evento=%s datos=%s", evento, datos)


class ObservadorEmail(IObservador):
    """Simula notificación por correo (demo del taller; sin SMTP real)."""

    def actualizar(self, evento: str, datos: dict[str, Any]) -> None:
        if evento != "CASO_CREADO":
            return
        email = datos.get("email", "")
        caso_id = datos.get("caso_id")
        logger.info(
            "[Observer:Email] Notificación simulada a %s — ticket #%s registrado.",
            email,
            caso_id,
        )
