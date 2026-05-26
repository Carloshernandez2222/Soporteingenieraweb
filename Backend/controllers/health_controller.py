import os

from fastapi import APIRouter
from fastapi.responses import FileResponse, JSONResponse

from ..config_paths import FRONTEND_ASSETS_DIR, FRONTEND_IMAGES_DIR, FRONTEND_INDEX

router = APIRouter(tags=["raíz"])


@router.get("/", summary="Aplicación web (React)")
async def read_index():
    if os.path.isfile(FRONTEND_INDEX):
        return FileResponse(FRONTEND_INDEX)
    return JSONResponse(
        status_code=503,
        content={
            "status": "error",
            "message": "Frontend no construido. Use Vite en desarrollo o ejecute npm run build en frontend/.",
        },
    )


@router.get("/health", summary="Salud del servicio")
def health_check():
    """Incluye si existe el build de Vite (diagnóstico de 503 en / o /assets)."""
    index_ok = os.path.isfile(FRONTEND_INDEX)
    assets_ok = os.path.isdir(FRONTEND_ASSETS_DIR)
    images_ok = os.path.isdir(FRONTEND_IMAGES_DIR)
    return {
        "status": "ok",
        "frontend_index": index_ok,
        "frontend_assets": assets_ok,
        "frontend_images": images_ok,
    }
