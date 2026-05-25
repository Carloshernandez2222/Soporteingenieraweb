from typing import Any, Optional
from fastapi import APIRouter, Body, HTTPException, Query, status, Depends
from pydantic import BaseModel
from ..dependencies import get_servicio_soporte, get_servicio_taller
from ..core.exceptions import CasoNoEncontradoError
from ..models import CasoSoporte
from ..patterns.adapter import obtener_adaptador

router = APIRouter(prefix="/api/casos", tags=["casos"])

# --- Modelos Pydantic para el Request Body ---
class RegistroSoporteBody(BaseModel):
    user_id: str
    descripcion: str
    order_id: Optional[str] = None
    case_type: str = "General"
    priority: str = "Medium"

# --- Módulo: Casos del Taller (Temporales) ---

@router.get("/taller", summary="Listar casos del taller")
def obtener_todos_taller():
    return {"status": "success", "data": get_servicio_taller().listar_todos()}

@router.post("/taller", summary="Crear caso temporal", status_code=status.HTTP_201_CREATED)
def crear_caso_taller(caso: CasoSoporte):
    nuevo_registro = caso.model_dump()
    nuevo_registro["plantilla"] = (caso.plantilla or "default").lower()
    data = get_servicio_taller().crear(nuevo_registro)
    return {"status": "success", "data": data}

@router.post("/taller/integracion", summary="Crear caso vía e-commerce")
def crear_caso_integracion(
    payload: dict[str, Any] = Body(...),
    origen: str = Query(..., description="Proveedor: amazon | shopify"),
):
    adaptador = obtener_adaptador(origen)
    if not adaptador:
        raise HTTPException(status_code=400, detail="Origen no soportado.")
    registro = adaptador.traducir_payload(payload)
    return {"status": "success", "origen": origen.lower(), "data": get_servicio_taller().crear(registro)}

# --- Módulo: Soporte (Persistido en SQL Server) ---

@router.post("/soporte", summary="Registrar caso de soporte", status_code=status.HTTP_201_CREATED)
def api_registrar_soporte(
    payload: RegistroSoporteBody,
    servicio_soporte = Depends(get_servicio_soporte)
):
    # Usamos el servicio de soporte refactorizado con SQL Server
    resultado = servicio_soporte.registrar_caso(
        user_id=payload.user_id, 
        descripcion=payload.descripcion, 
        order_id=payload.order_id,
        case_type=payload.case_type,
        priority=payload.priority
    )
    return {"status": "success", "data": resultado}

@router.get("/soporte", summary="Listar todos los tickets")
def api_listar_soporte():
    return {"status": "success", "data": get_servicio_soporte().listar_todos_casos()}

# --- NUEVO ENDPOINT: Listar tickets de un usuario ---
@router.get("/soporte/mis-tickets/{user_id}", summary="Listar tickets de un usuario")
def api_listar_mis_tickets(user_id: str, servicio_soporte = Depends(get_servicio_soporte)):
    return {"status": "success", "data": servicio_soporte.listar_casos_usuario(user_id)}

@router.put("/soporte/{case_id}/cerrar", summary="Cerrar caso de soporte")
def api_cerrar_caso(case_id: str):
    get_servicio_soporte().cerrar_caso(case_id)
    return {"status": "success", "message": "Caso cerrado correctamente."}

# --- Métricas y Consultas (Composite Pattern) ---

@router.get("/taller/metricas", summary="Métricas jerárquicas")
def metricas_jerarquicas():
    return {"status": "success", "data": get_servicio_taller().metricas_jerarquicas()}

@router.get("/taller/{id}", summary="Buscar caso del taller")
def buscar_caso_taller(id: int):
    registro = get_servicio_taller().obtener_por_id(id)
    if not registro:
        raise CasoNoEncontradoError("Caso no encontrado.")
    return registro