from fastapi import APIRouter, Query, Request

from ..constants import MAX_DESCRIPCION_LEN, MAX_EMAIL_LEN, MAX_NOMBRE_LEN
from ..constants import normalizar_rol
from ..dependencies import get_servicio_soporte
from ..rate_limit import verificar_limite_registrar
from ..utils.request_helpers import ip_cliente

router = APIRouter()


@router.post(
    "/registrar",
    tags=["registro-sqlite"],
    summary="Registrar caso en SQLite",
    description="Crea un registro persistente. Límite de frecuencia por IP para reducir abuso.",
    responses={
        400: {"description": "Validación de negocio (nombre, correo o descripción)."},
        429: {"description": "Demasiadas peticiones desde la misma IP."},
    },
)
def registrar_caso_api(
    request: Request,
    nombre: str = Query(..., max_length=MAX_NOMBRE_LEN, description="Nombre completo, sin dígitos."),
    email: str = Query(..., max_length=MAX_EMAIL_LEN),
    descripcion: str = Query(..., max_length=MAX_DESCRIPCION_LEN),
    categoria: str = Query("general", max_length=64, description="Categoría del ticket."),
    creado_por_rol: str = Query(
        "usuario",
        max_length=20,
        description="Rol que creó el ticket (`usuario`/`soporte`/`webmaster`).",
    ),
):
    verificar_limite_registrar(ip_cliente(request))
    return get_servicio_soporte().registrar_caso(
        nombre, email, descripcion, categoria, normalizar_rol(creado_por_rol)
    )
