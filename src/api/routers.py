from fastapi import APIRouter, HTTPException, Query
from fastapi.responses import FileResponse
from typing import List, Optional

# Importamos SOLO el modelo
from src.models_db.models import CasoSoporte

# Creamos el enrutador
router = APIRouter()

# --- Persistencia Temporal ---
# (Esta es tu base de datos actual en memoria)
db_temporal: List[dict] = []

# --- Rutas ---

@router.get("/")
async def read_index():
    return FileResponse("static/index.html")

@router.get("/casos/todos")
def obtener_todos():
    return db_temporal

@router.post("/casos/crear")
def crear_caso_temporal(caso: CasoSoporte):
    nuevo_registro = caso.dict()
    db_temporal.append(nuevo_registro)
    return {"status": "success", "data": nuevo_registro}

@router.get("/casos/{id}")
def buscar_caso(id: int):
    for registro in db_temporal:
        if registro["id"] == id:
            return registro
    raise HTTPException(status_code=404, detail="Caso no encontrado")

@router.get("/casos/filtrar/")
def filtrar_por_categoria(categoria: Optional[str] = Query(None)):
    if categoria:
        resultado = [c for c in db_temporal if c.get("categoria", "").lower() == categoria.lower()]
        return resultado
    return db_temporal