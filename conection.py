import mimetypes # <--- ¡ESTA ES LA LÍNEA MÁGICA QUE FALTABA!
from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware

# =========================================================
# FORZAMOS EL RECONOCIMIENTO DE ARCHIVOS (MIME TYPES)
mimetypes.add_type('text/css', '.css')
mimetypes.add_type('application/javascript', '.js')
# =========================================================

# Importamos los errores desde la nueva capa "core"
from src.core.exceptions import NombreInvalidoError, CorreoInvalidoError, IssueInvalidoError

# Importamos el enrutador que creamos en la capa "api"
from src.api.routers import router

# 1. Creamos la app
test = FastAPI()

# 2. Configuración de CORS
test.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# 3. Montamos la carpeta estática del Frontend
test.mount("/static", StaticFiles(directory="static"), name="static")

# 4. Incluimos todas las rutas modulares
test.include_router(router)

# --- Exception Handlers ---
@test.exception_handler(NombreInvalidoError)
async def nombre_invalido_handler(request: Request, exc: NombreInvalidoError):
    return JSONResponse(status_code=400, content={"status": "error", "message": str(exc)})

@test.exception_handler(CorreoInvalidoError)
async def correo_invalido_handler(request: Request, exc: CorreoInvalidoError):
    return JSONResponse(status_code=400, content={"status": "error", "message": str(exc)})

@test.exception_handler(IssueInvalidoError)
async def issue_invalido_handler(request: Request, exc: IssueInvalidoError):
    return JSONResponse(status_code=400, content={"status": "error", "message": str(exc)})