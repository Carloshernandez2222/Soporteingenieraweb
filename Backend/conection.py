"""
Punto de entrada ASGI (Azure/Gunicorn: `Backend.conection:test`).
"""

from Backend.app_factory import create_app
from Backend.utils.sqlserver import obtener_conexion_sqlserver

test = create_app()

__all__ = ["test", "obtener_conexion_sqlserver"]
