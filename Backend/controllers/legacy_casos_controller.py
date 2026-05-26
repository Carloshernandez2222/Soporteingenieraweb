"""
Rutas legacy `/casos/*` usadas por el panel React y el proxy de Vite.

Mantienen compatibilidad con la API anterior mientras los nuevos endpoints viven en `/api/casos/*`.
"""

from __future__ import annotations

from typing import Any

from fastapi import APIRouter, Body, HTTPException, Query, status

from ..core.exceptions import CasoNoEncontradoError, IdDuplicadoError
from ..dependencies import get_servicio_registro_sqlite, get_servicio_taller
from ..models import CasoSoporte
from ..patterns.adapter import obtener_adaptador

router = APIRouter(prefix="/casos", tags=["casos-legacy"])


@router.get("/todos", summary="[Legacy] Listar casos del taller")
def legacy_listar_todos():
    return get_servicio_taller().listar_todos()


@router.post("/crear", summary="[Legacy] Crear caso del taller", status_code=status.HTTP_201_CREATED)
def legacy_crear(caso: CasoSoporte):
    nuevo_registro = caso.model_dump()
    nuevo_registro["plantilla"] = (caso.plantilla or "default").lower()
    try:
        return get_servicio_taller().crear(nuevo_registro)
    except IdDuplicadoError:
        raise


@router.post("/integracion", summary="[Legacy] Integración e-commerce")
def legacy_integracion(
    payload: dict[str, Any] = Body(...),
    origen: str = Query(..., description="Proveedor: amazon | shopify"),
):
    adaptador = obtener_adaptador(origen)
    if not adaptador:
        raise HTTPException(status_code=400, detail="Origen no soportado.")
    registro = adaptador.traducir_payload(payload)
    data = get_servicio_taller().crear(registro)
    return {"status": "success", "origen": origen.lower(), "data": data}


@router.get("/metricas-jerarquicas", summary="[Legacy] Métricas composite")
def legacy_metricas():
    return {"status": "success", "data": get_servicio_taller().metricas_jerarquicas()}


@router.get("/filtrar", summary="[Legacy] Filtrar por categoría")
@router.get("/filtrar/", summary="[Legacy] Filtrar por categoría (barra final)")
def legacy_filtrar(categoria: str | None = Query(None)):
    return get_servicio_taller().filtrar_por_categoria(categoria)


@router.get("/sqlite", summary="[Legacy] Tickets por correo")
def legacy_sqlite_por_email(email: str = Query(...)):
    data = get_servicio_registro_sqlite().listar_por_email(email)
    return {"status": "success", "data": data}


@router.get("/sqlite/todos", summary="[Legacy] Todos los tickets SQLite")
def legacy_sqlite_todos():
    return {"status": "success", "data": get_servicio_registro_sqlite().listar_todos()}


@router.get("/persistidos/{ticket_id}", summary="[Legacy] Detalle ticket SQLite")
def legacy_persistido(ticket_id: int):
    data = get_servicio_registro_sqlite().obtener_por_id(ticket_id)
    return {"status": "success", "data": data}


@router.get("/{caso_id}", summary="[Legacy] Caso del taller por id")
def legacy_obtener(caso_id: int):
    registro = get_servicio_taller().obtener_por_id(caso_id)
    if not registro:
        raise CasoNoEncontradoError("Caso no encontrado.")
    return registro
