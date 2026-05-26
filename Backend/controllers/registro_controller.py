from fastapi import APIRouter, Query, Request

from ..constants import MAX_DESCRIPCION_LEN, MAX_EMAIL_LEN, MAX_NOMBRE_LEN
from ..constants import normalizar_rol
from ..dependencies import get_servicio_registro_sqlite
from ..core.rate_limit import verificar_limite_registrar
from ..patterns.strategy import obtener_estrategia
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
    nombre: str = Query("", max_length=MAX_NOMBRE_LEN, description="Nombre (formulario web)."),
    email: str = Query("", max_length=MAX_EMAIL_LEN),
    descripcion: str = Query("", max_length=MAX_DESCRIPCION_LEN),
    mensaje: str = Query(
        "",
        max_length=MAX_DESCRIPCION_LEN,
        description="Texto libre del chatbot (Strategy chatbot).",
    ),
    categoria: str = Query("general", max_length=64, description="Categoría del ticket."),
    creado_por_rol: str = Query(
        "usuario",
        max_length=20,
        description="Rol que creó el ticket (`usuario`/`soporte`/`webmaster`).",
    ),
    origen: str = Query(
        "web",
        description="Contexto de registro: web (formulario) | chatbot (NLP).",
    ),
):
    verificar_limite_registrar(ip_cliente(request))
    estrategia = obtener_estrategia(origen)
    datos = estrategia.procesar_entrada(
        {
            "nombre": nombre,
            "email": email,
            "descripcion": descripcion or mensaje,
            "mensaje": mensaje,
            "categoria": categoria,
            "creado_por_rol": creado_por_rol,
        }
    )
    return get_servicio_registro_sqlite().registrar_caso(
        datos["nombre"],
        datos["email"],
        datos["descripcion"],
        datos.get("categoria"),
        normalizar_rol(datos.get("creado_por_rol")),
    )
