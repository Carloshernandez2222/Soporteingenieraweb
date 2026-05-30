import os
from fastapi import APIRouter
from fastapi.responses import FileResponse, JSONResponse
from ..config_paths import FRONTEND_ASSETS_DIR, FRONTEND_IMAGES_DIR, FRONTEND_INDEX

router = APIRouter(prefix="/api", tags=["raíz"])

@router.get("/", summary="Aplicación web (React)")
async def read_index():
    if os.path.isfile(FRONTEND_INDEX):
        return FileResponse(FRONTEND_INDEX)
    return JSONResponse(
        status_code=503,
        content={"status": "error", "message": "Frontend no construido."},
    )

@router.get("/health", summary="Salud del servicio")
def health_check():
    index_ok = os.path.isfile(FRONTEND_INDEX)
    db_ok = False
    db_detail = "unknown"
    try:
        from sqlalchemy import text
        from ..core.database import get_engine
        with get_engine().connect() as conn:
            conn.execute(text("SELECT 1"))
        db_ok = True
    except Exception as exc:
        db_detail = str(exc)[:200]
    
    return {
        "status": "ok" if db_ok else "degraded",
        "database_ok": db_ok,
        "database": db_detail,
    }