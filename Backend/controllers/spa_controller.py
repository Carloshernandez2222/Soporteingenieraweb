import os

from fastapi import APIRouter, HTTPException
from fastapi.responses import FileResponse, JSONResponse

from ..config_paths import FRONTEND_INDEX

router = APIRouter(tags=["raíz"], include_in_schema=False)

# Evita devolver index.html cuando faltan estáticos montados (p. ej. /images sin dist).
_SPA_EXCLUDED_PREFIXES = ("api/", "assets/", "images/", "casos/", "registrar/")
_SPA_EXCLUDED_EXACT = frozenset({"health", "docs", "openapi.json", "redoc"})


@router.get("/{spa_path:path}")
async def spa_fallback(spa_path: str):
    """
    Sirve la SPA para rutas del front. Registrar este router al final.
    """
    if spa_path in _SPA_EXCLUDED_EXACT or spa_path.startswith(_SPA_EXCLUDED_PREFIXES):
        raise HTTPException(status_code=404, detail="Not found")
    if os.path.isfile(FRONTEND_INDEX):
        return FileResponse(FRONTEND_INDEX)
    return JSONResponse(
        status_code=503,
        content={
            "status": "error",
            "message": "Frontend no construido. En desarrollo abra http://localhost:5173 (Vite).",
        },
    )
