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

    db_ok = False
    db_detail = "unknown"
    try:
        from sqlalchemy import text
        from ..core.database import create_database_url, get_engine

        db_detail = "sqlite" if create_database_url().startswith("sqlite") else "sqlserver"
        with get_engine().connect() as conn:
            conn.execute(text("SELECT 1"))
        db_ok = True
    except Exception as exc:
        db_detail = str(exc)[:200]

    return {
        "status": "ok" if db_ok else "degraded",
        "frontend_index": index_ok,
        "frontend_assets": assets_ok,
        "frontend_images": images_ok,
        "database_ok": db_ok,
        "database": db_detail,
    }
