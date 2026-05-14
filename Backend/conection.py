"""
Punto de entrada histórico (Azure/Gunicorn: `conection:test`).

La aplicación se ensambla en `src.app_factory` con patrón MVC.
"""

from src.app_factory import create_app

test = create_app()
