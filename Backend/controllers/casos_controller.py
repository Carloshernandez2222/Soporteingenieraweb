from typing import Any
from fastapi import APIRouter, HTTPException, status, Depends, Request
from fastapi.templating import Jinja2Templates
from datetime import datetime
from pydantic import BaseModel, Field
from ..dependencies import get_servicio_soporte

router = APIRouter(prefix="/api/casos", tags=["Casos de Soporte"])
templates = Jinja2Templates(directory="Backend/templates")

# --- Modelos Pydantic ---
class RegistroSoporteBody(BaseModel):
    user_id: str = Field(..., description="ID del usuario (UUID)")
    descripcion: str = Field(..., description="Descripción detallada del problema")
    case_type: str = Field(default="General", description="Tipo de caso")

# --- Endpoints Soporte ---
@router.post("/soporte", summary="Registrar caso de soporte", status_code=status.HTTP_201_CREATED)
def api_registrar_soporte(
    payload: RegistroSoporteBody,
    servicio_soporte = Depends(get_servicio_soporte)
):
    try:
        resultado = servicio_soporte.registrar_caso(
            user_id=payload.user_id, 
            descripcion=payload.descripcion, 
            case_type=payload.case_type
        )
        return {"status": "success", "data": resultado}
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/soporte", summary="Listar todos los tickets")
def api_listar_soporte(servicio_soporte = Depends(get_servicio_soporte)):
    return {"status": "success", "data": servicio_soporte.listar_todos_casos()}

@router.get("/soporte/agentes", summary="Listar agentes de soporte")
def api_agentes():
    # Placeholder: Agrega la lógica de tu servicio si es necesaria
    return {"success": True, "data": []}

@router.get("/soporte/mis-tickets/{user_id}", summary="Listar tickets de un usuario")
def api_listar_mis_tickets(user_id: str, servicio_soporte = Depends(get_servicio_soporte)):
    try:
        return {"status": "success", "data": servicio_soporte.listar_casos_usuario(user_id)}
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.put("/soporte/{case_id}/cerrar", summary="Cerrar caso de soporte")
def api_cerrar_caso(case_id: str, servicio_soporte = Depends(get_servicio_soporte)):
    try:
        servicio_soporte.cerrar_caso(case_id)
        return {"status": "success", "message": "Caso cerrado correctamente."}
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

# --- Endpoints Taller (Corregidos de 405 a 404) ---
@router.post("/taller", summary="Registrar caso taller")
def api_registrar_taller():
    # Asegúrate de usar @router.post para que no dé 405
    return {"status": "success", "message": "Caso taller registrado"}

@router.get("/taller/metricas", summary="Obtener métricas del taller")
def api_metricas():
    return {"success": True, "data": {"casos_resueltos": 0, "tiempo_promedio": 0}}

# --- Reportes ---
@router.get("/reporte-pdf", summary="Generar reporte visual")
async def generar_reporte(request: Request):
    return templates.TemplateResponse("reporte.html", {
        "request": request, 
        "fecha": datetime.now().strftime("%Y-%m-%d %H:%M")
    })