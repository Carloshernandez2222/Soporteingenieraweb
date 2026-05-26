"""
Punto de entrada ASGI (Gunicorn/Uvicorn: `Backend.conection:test` o `conection:test`).

La aplicación se ensambla en `Backend.app_factory` (patrón Fábrica + MVC).
"""

from Backend.app_factory import create_app

test = create_app()
