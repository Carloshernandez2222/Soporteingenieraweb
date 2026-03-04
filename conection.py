from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from src.RegisterRequest import ServicioSoporte
from src.exceptions import NombreInvalidoError, CorreoInvalidoError, IssueInvalidoError

test = FastAPI()
servicio = ServicioSoporte()

# --- Exception Handlers (Aquí es donde ocurre la magia) ---

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
def home(): 
    return {"mensaje": "Mi API está funcionando"} 

@test.get("/eventos") 
def listar_eventos(): 
    return {"eventos": ["CONIITI 2024", "Taller React", "Charla IA"]}   

@test.post("/registrar")
def registrar_caso_api(nombre: str, email: str, descripcion: str):
    # Ya no necesitas el try/except aquí. 
    # Si 'servicio' lanza un error, FastAPI lo captura automáticamente arriba.
    return servicio.registrar_caso(nombre, email, descripcion)