"""
Punto de entrada ASGI (Gunicorn/Uvicorn: `Backend.conection:test`).

La aplicación se ensambla en `Backend.app_factory` (patrón Fábrica + MVC).
"""

from Backend.app_factory import create_app
from Backend.utils.sqlserver import obtener_conexion_sqlserver

test = create_app()

__all__ = ["test", "obtener_conexion_sqlserver"]
