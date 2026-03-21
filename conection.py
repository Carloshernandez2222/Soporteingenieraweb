from fastapi import FastAPI, Request, HTTPException, Query
from fastapi.responses import JSONResponse, FileResponse
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional

# Importaciones de tu lógica anterior
from src.RegisterRequest import ServicioSoporte
from src.exceptions import NombreInvalidoError, CorreoInvalidoError, IssueInvalidoError

# --- A. Definición del Modelo de Datos (Pydantic) ---
# Requisito: Al menos 4 atributos con diferentes tipos
class CasoSoporte(BaseModel):
    id: int               # Entero
    cliente: str          # String
    activo: bool          # Booleano
    prioridad: float      # Float
    categoria: str        # Para filtrado dinámico

# --- Persistencia Temporal ---
# Lista vacía que funciona como base de datos mientras el servidor esté encendido
db_temporal: List[dict] = []

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

# --- Exception Handlers (Tu lógica original) ---
@test.exception_handler(NombreInvalidoError)
async def nombre_invalido_handler(request: Request, exc: NombreInvalidoError):
    return JSONResponse(status_code=400, content={"status": "error", "message": str(exc)})

@test.exception_handler(CorreoInvalidoError)
async def correo_invalido_handler(request: Request, exc: CorreoInvalidoError):
    return JSONResponse(status_code=400, content={"status": "error", "message": str(exc)})

@test.exception_handler(IssueInvalidoError)
async def issue_invalido_handler(request: Request, exc: IssueInvalidoError):
    return JSONResponse(status_code=400, content={"status": "error", "message": str(exc)})

# --- B. Implementación de Nuevas Rutas (Routing) ---

@test.get("/")
async def read_index():
    return FileResponse("static/index.html")

# 1. Endpoint lectura Total (GET)
@test.get("/casos/todos")
def obtener_todos():
    return db_temporal

# 2. Endpoint creación (POST)
@test.post("/casos/crear")
def crear_caso_temporal(caso: CasoSoporte):
    # Usamos .dict() para convertir el objeto Pydantic a diccionario
    nuevo_registro = caso.dict()
    db_temporal.append(nuevo_registro)
    return {"status": "success", "data": nuevo_registro}

# 3 y 4. Búsqueda Específica (Path Parameter) y Lógica de Error 404
@test.get("/casos/{id}")
def buscar_caso(id: int):
    for registro in db_temporal:
        if registro["id"] == id:
            return registro
    # Si no existe, devuelve 404
    raise HTTPException(status_code=404, detail="Caso no encontrado en la lista temporal")

# 5. Filtrado Dinámico (Query Parameter)
@test.get("/casos/filtrar/")
def filtrar_por_categoria(categoria: Optional[str] = Query(None)):
    if categoria:
        resultado = [c for c in db_temporal if c["categoria"].lower() == categoria.lower()]
        return resultado
    return db_temporal

# Ruta original de persistencia en SQLite
@test.post("/registrar")
def registrar_caso_api(nombre: str, email: str, descripcion: str):
    return servicio.registrar_caso(nombre, email, descripcion)