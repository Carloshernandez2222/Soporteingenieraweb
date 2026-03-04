from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse, FileResponse
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from src.RegisterRequest import ServicioSoporte
from src.exceptions import NombreInvalidoError, CorreoInvalidoError, IssueInvalidoError

# 1. Primero creamos la app
test = FastAPI()

# 2. Luego montamos la carpeta estática
test.mount("/static", StaticFiles(directory="static"), name="static")

# 3. Configuramos el resto
servicio = ServicioSoporte()

test.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

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

# --- Rutas ---

@test.get("/")
async def read_index():
    return FileResponse("static/index.html")

@test.get("/eventos") 
def listar_eventos(): 
    return {"eventos": ["CONIITI 2024", "Taller React", "Charla IA"]}   

@test.post("/registrar")
def registrar_caso_api(nombre: str, email: str, descripcion: str):
    return servicio.registrar_caso(nombre, email, descripcion)