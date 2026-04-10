import os

from fastapi import APIRouter
from fastapi.responses import FileResponse, JSONResponse

from ..config_paths import FRONTEND_INDEX

router = APIRouter(tags=["raíz"], include_in_schema=False)


@router.get("/{spa_path:path}")
async def spa_fallback(spa_path: str):
    """
    Sirve la SPA para rutas del front. Registrar este router al final.
    """
    if os.path.isfile(FRONTEND_INDEX):
        return FileResponse(FRONTEND_INDEX)
    return JSONResponse(
        status_code=503,
        content={
            "status": "error",
            "message": "Frontend no construido. En desarrollo abra http://localhost:5173 (Vite).",
        },
    )
