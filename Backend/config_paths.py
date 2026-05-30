"""Rutas de proyecto (configuración estática)."""

import os

_SRC_DIR = os.path.dirname(os.path.abspath(__file__))
REPO_ROOT = os.path.normpath(os.path.join(_SRC_DIR, ".."))
DEFAULT_SQLITE_PATH = os.path.join(REPO_ROOT, "soporte.db")

# Un solo front (Vite en frontend/); el build cae en frontend/dist
FRONTEND_DIR = os.path.join(REPO_ROOT, "frontend")
FRONTEND_DIST = os.path.join(FRONTEND_DIR, "dist")
FRONTEND_INDEX = os.path.join(FRONTEND_DIST, "index.html")
FRONTEND_ASSETS_DIR = os.path.join(FRONTEND_DIST, "assets")
# Vite copia public/ a la raíz de dist/ (p. ej. public/images/logo.png → dist/images/logo.png)
FRONTEND_IMAGES_DIR = os.path.join(FRONTEND_DIST, "images")
BACKEND_TEMPLATES_DIR = os.path.join(_SRC_DIR, "templates")
