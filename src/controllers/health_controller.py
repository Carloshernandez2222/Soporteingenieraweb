import os

from fastapi import APIRouter
from fastapi.responses import FileResponse, JSONResponse

from ..config_paths import FRONTEND_INDEX

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
    return {"status": "ok"}
