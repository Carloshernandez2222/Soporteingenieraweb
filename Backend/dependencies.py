"""
Inyección de dependencias: servicios de negocio (singletons por proceso).
"""

from __future__ import annotations

# Importamos solo los servicios que existen actualmente
from .services.admin_service import ServicioAdmin
from .services.auth_service import ServicioAuth
from .services.company_service import ServicioCompany
from .services.soporte_service import ServicioSoporte
from .core.database import get_engine # Asegúrate de mantener esto si lo usas

# Variables globales para los servicios
_soporte: ServicioSoporte | None = None
_auth: ServicioAuth | None = None
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
    global _soporte, _auth, _admin, _company
    _soporte = ServicioSoporte()
    _auth = ServicioAuth()
    _admin = ServicioAdmin()
    _company = ServicioCompany()