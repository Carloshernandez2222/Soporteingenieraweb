from typing import Optional

from fastapi import APIRouter, Query

from ..constants import MAX_EMAIL_LEN, MAX_NOMBRE_LEN
from ..dependencies import get_servicio_soporte, get_servicio_taller
from ..exceptions import CasoNoEncontradoError, TicketSqliteNoEncontradoError
from ..models import CasoSoporte

router = APIRouter()


@router.get(
    "/casos/todos",
    tags=["casos-temporales"],
    summary="Listar todos los casos del taller",
    response_description="Lista en SQLite (tabla casos_taller)",
)
def obtener_todos():
    return get_servicio_taller().listar_todos()


@router.post(
    "/casos/crear",
    tags=["casos-temporales"],
    summary="Crear caso del taller",
    response_description="Caso persistido en SQLite si el id es único",
)
def crear_caso_temporal(caso: CasoSoporte):
    nuevo_registro = caso.model_dump()
    data = get_servicio_taller().crear(nuevo_registro)
    return {"status": "success", "data": data}


@router.get(
    "/casos/sqlite",
    tags=["registro-sqlite"],
    summary="Listar casos en SQLite por correo",
    description=(
        "Devuelve los casos persistidos cuyo correo coincide (tras normalización) "
        "con el indicado. Útil para consultar historial del solicitante."
    ),
)
def casos_sqlite_por_email(
    email: str = Query(
        ...,
        min_length=1,
        max_length=MAX_EMAIL_LEN,
        description="Correo del solicitante (se normaliza como en el registro).",
    ),
):
    return {
        "status": "success",
        "data": get_servicio_soporte().listar_casos_por_email(email),
    }


@router.get(
    "/casos/sqlite/todos",
    tags=["registro-sqlite"],
    summary="Listar todos los tickets SQLite",
    description="Devuelve el listado global de tickets persistidos en SQLite (id descendente).",
)
def casos_sqlite_todos():
    return {
        "status": "success",
        "data": get_servicio_soporte().listar_todos_casos(),
    }


@router.get(
    "/casos/sqlite/por-solicitante",
    tags=["registro-sqlite"],
    summary="Listar tickets por correo y nombre del solicitante",
    description=(
        "Misma validación de nombre que al registrar ticket (sin dígitos). "
        "Comparación de nombre sin distinguir mayúsculas."
    ),
)
def casos_sqlite_por_solicitante(
    email: str = Query(..., min_length=1, max_length=MAX_EMAIL_LEN),
    nombre: str = Query(..., min_length=1, max_length=MAX_NOMBRE_LEN),
):
    return {
        "status": "success",
        "data": get_servicio_soporte().listar_casos_por_email_y_nombre(email, nombre),
    }


@router.get(
    "/casos/persistidos/{caso_id}",
    tags=["registro-sqlite"],
    summary="Obtener ticket SQLite por id",
    description="Detalle de un caso persistido por su id autonumérico.",
)
def obtener_ticket_sqlite(caso_id: int):
    caso = get_servicio_soporte().obtener_caso_sqlite_por_id(caso_id)
    if caso is None:
        raise TicketSqliteNoEncontradoError(
            "No hay ticket en la base de datos con ese id."
        )
    return {"status": "success", "data": caso}


@router.get(
    "/casos/{id}",
    tags=["casos-temporales"],
    summary="Buscar caso del taller por id",
    response_description="Registro único en SQLite o 404",
)
def buscar_caso(id: int):
    registro = get_servicio_taller().obtener_por_id(id)
    if registro is None:
        raise CasoNoEncontradoError("Caso no encontrado en la base de datos del taller.")
    return registro


@router.get(
    "/casos/filtrar/",
    tags=["casos-temporales"],
    summary="Filtrar casos del taller por categoría",
)
def filtrar_por_categoria(categoria: Optional[str] = Query(None)):
    return get_servicio_taller().filtrar_por_categoria(categoria)
