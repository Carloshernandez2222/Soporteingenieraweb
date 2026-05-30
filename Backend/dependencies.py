"""
Inyección de dependencias: servicios de negocio (singletons por proceso).

`reiniciar_servicios()` permite que los tests usen otra `DATABASE_PATH` tras monkeypatch.
"""

from __future__ import annotations

from .services.admin_service import ServicioAdmin
from .services.auth_service import ServicioAuth
from .services.company_service import ServicioCompany
from .services.registro_sqlite_service import ServicioRegistroSqlite
from .services.soporte_service import ServicioSoporte
from .services.taller_service import ServicioTaller

_soporte: ServicioSoporte | None = None
_auth: ServicioAuth | None = None
_taller: ServicioTaller | None = None
_registro_sqlite: ServicioRegistroSqlite | None = None
_admin: ServicioAdmin | None = None
_company: ServicioCompany | None = None


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


def get_servicio_registro_sqlite() -> ServicioRegistroSqlite:
    global _registro_sqlite
    if _registro_sqlite is None:
        _registro_sqlite = ServicioRegistroSqlite()
    return _registro_sqlite


def get_servicio_admin() -> ServicioAdmin:
    global _admin
    if _admin is None:
        _admin = ServicioAdmin()
    return _admin


def get_servicio_company() -> ServicioCompany:
    global _company
    if _company is None:
        _company = ServicioCompany()
    return _company


def reiniciar_servicios() -> None:
    """Nuevas instancias (p. ej. tras cambiar DATABASE_PATH en tests)."""
    global _soporte, _auth, _taller, _registro_sqlite, _admin, _company
    _soporte = ServicioSoporte()
    _auth = ServicioAuth()
    _taller = ServicioTaller()
    _registro_sqlite = ServicioRegistroSqlite()
    _admin = ServicioAdmin()
    _company = ServicioCompany()
