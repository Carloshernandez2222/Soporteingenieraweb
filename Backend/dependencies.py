"""
Inyección de dependencias: servicios de negocio (singletons por proceso).

`reiniciar_servicios()` permite que los tests usen otra `DATABASE_PATH` tras monkeypatch.
"""

from __future__ import annotations

from .services.auth_service import ServicioAuth
from .services.soporte_service import ServicioSoporte
from .services.taller_service import ServicioTaller

_soporte: ServicioSoporte | None = None
_auth: ServicioAuth | None = None
_taller: ServicioTaller | None = None


def get_servicio_soporte() -> ServicioSoporte:
    global _soporte
    if _soporte is None:
        _soporte = ServicioSoporte()
    return _soporte


def get_servicio_auth() -> ServicioAuth:
    global _auth
    if _auth is None:
        _auth = ServicioAuth()
    return _auth


def get_servicio_taller() -> ServicioTaller:
    global _taller
    if _taller is None:
        _taller = ServicioTaller()
    return _taller


def reiniciar_servicios() -> None:
    """Nuevas instancias (p. ej. tras cambiar DATABASE_PATH en tests)."""
    global _soporte, _auth, _taller
    _soporte = ServicioSoporte()
    _auth = ServicioAuth()
    _taller = ServicioTaller()
