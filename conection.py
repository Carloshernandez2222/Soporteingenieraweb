import os

from fastapi import FastAPI, Query, Request
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, JSONResponse
from fastapi.staticfiles import StaticFiles
from starlette.exceptions import HTTPException as StarletteHTTPException
from typing import List, Optional

from src.RegisterRequest import ServicioSoporte
from src.constants import MAX_DESCRIPCION_LEN, MAX_EMAIL_LEN, MAX_NOMBRE_LEN
from src.exceptions import (
    CasoNoEncontradoError,
    CorreoInvalidoError,
    IdDuplicadoError,
    IssueInvalidoError,
    NombreInvalidoError,
    RateLimitExceededError,
    TicketSqliteNoEncontradoError,
)
from src.models import CasoSoporte
from src.rate_limit import verificar_limite_registrar

# --- Persistencia temporal (taller) ---
db_temporal: List[dict] = []

test = FastAPI(
    title="API Soporte Técnico",
    description=(
        "Registro de casos en SQLite (Azure) y gestión temporal en memoria para el taller. "
        "Formato de error unificado: `{\"status\": \"error\", \"message\": \"...\"}`."
    ),
    version="1.0.0",
    openapi_tags=[
        {
            "name": "raíz",
            "description": "Páginas estáticas y comprobación de salud.",
        },
        {
            "name": "registro-sqlite",
            "description": "Alta y consulta de casos persistidos en SQLite.",
        },
        {
            "name": "casos-temporales",
            "description": "Lista en memoria: creación, búsqueda y filtros.",
        },
    ],
)

# Build del front: cd frontend && npm run build → frontend/dist
_FRONT_DIST = os.path.join("frontend", "dist")
_FRONT_INDEX = os.path.join(_FRONT_DIST, "index.html")
_ASSETS_DIR = os.path.join(_FRONT_DIST, "assets")
if os.path.isdir(_ASSETS_DIR):
    test.mount("/assets", StaticFiles(directory=_ASSETS_DIR), name="vite_assets")

servicio = ServicioSoporte()

test.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


def _ip_cliente(request: Request) -> str:
    xff = request.headers.get("x-forwarded-for")
    if xff:
        return xff.split(",")[0].strip()
    if request.client:
        return request.client.host
    return "desconocido"


def _mensaje_validacion_pydantic(exc: RequestValidationError) -> str:
    partes: list[str] = []
    for err in exc.errors():
        loc = [str(x) for x in err.get("loc", []) if x not in ("body", "query", "path")]
        ctx = ".".join(loc) if loc else "entrada"
        msg = err.get("msg", "")
        if msg.startswith("Value error, "):
            msg = msg[len("Value error, ") :]
        partes.append(f"{ctx}: {msg}")
    return "; ".join(partes) if partes else "Datos de entrada inválidos."


@test.exception_handler(RequestValidationError)
async def validacion_pydantic_handler(request: Request, exc: RequestValidationError):
    return JSONResponse(
        status_code=422,
        content={
            "status": "error",
            "message": _mensaje_validacion_pydantic(exc),
        },
    )


@test.exception_handler(StarletteHTTPException)
async def http_exception_handler(request: Request, exc: StarletteHTTPException):
    if isinstance(exc.detail, str):
        mensaje = exc.detail
    else:
        mensaje = str(exc.detail)
    return JSONResponse(
        status_code=exc.status_code,
        content={"status": "error", "message": mensaje},
    )


@test.exception_handler(NombreInvalidoError)
async def nombre_invalido_handler(request: Request, exc: NombreInvalidoError):
    return JSONResponse(status_code=400, content={"status": "error", "message": str(exc)})


@test.exception_handler(CorreoInvalidoError)
async def correo_invalido_handler(request: Request, exc: CorreoInvalidoError):
    return JSONResponse(status_code=400, content={"status": "error", "message": str(exc)})


@test.exception_handler(IssueInvalidoError)
async def issue_invalido_handler(request: Request, exc: IssueInvalidoError):
    return JSONResponse(status_code=400, content={"status": "error", "message": str(exc)})


@test.exception_handler(IdDuplicadoError)
async def id_duplicado_handler(request: Request, exc: IdDuplicadoError):
    return JSONResponse(status_code=409, content={"status": "error", "message": str(exc)})


@test.exception_handler(RateLimitExceededError)
async def rate_limit_handler(request: Request, exc: RateLimitExceededError):
    return JSONResponse(status_code=429, content={"status": "error", "message": str(exc)})


@test.exception_handler(CasoNoEncontradoError)
async def caso_no_encontrado_handler(request: Request, exc: CasoNoEncontradoError):
    return JSONResponse(status_code=404, content={"status": "error", "message": str(exc)})


@test.exception_handler(TicketSqliteNoEncontradoError)
async def ticket_sqlite_no_encontrado_handler(
    request: Request, exc: TicketSqliteNoEncontradoError
):
    return JSONResponse(status_code=404, content={"status": "error", "message": str(exc)})


@test.get("/", tags=["raíz"], summary="Aplicación web (React)")
async def read_index():
    return FileResponse(_FRONT_INDEX)


@test.get("/health", tags=["raíz"], summary="Salud del servicio")
def health_check():
    return {"status": "ok"}


@test.get(
    "/casos/todos",
    tags=["casos-temporales"],
    summary="Listar todos los casos temporales",
    response_description="Lista completa en memoria",
)
def obtener_todos():
    return db_temporal


@test.post(
    "/casos/crear",
    tags=["casos-temporales"],
    summary="Crear caso temporal",
    response_description="Caso añadido si el id es único",
)
def crear_caso_temporal(caso: CasoSoporte):
    nuevo_registro = caso.model_dump()
    if any(registro["id"] == nuevo_registro["id"] for registro in db_temporal):
        raise IdDuplicadoError(f"Ya existe un caso con el id {nuevo_registro['id']}.")
    db_temporal.append(nuevo_registro)
    return {"status": "success", "data": nuevo_registro}


# Debe declararse antes de /casos/{id} para que "sqlite" no se interprete como id entero.
@test.get(
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
        "data": servicio.listar_casos_por_email(email),
    }


@test.get(
    "/casos/persistidos/{caso_id}",
    tags=["registro-sqlite"],
    summary="Obtener ticket SQLite por id",
    description="Detalle de un caso persistido por su id autonumérico.",
)
def obtener_ticket_sqlite(caso_id: int):
    caso = servicio.obtener_caso_sqlite_por_id(caso_id)
    if caso is None:
        raise TicketSqliteNoEncontradoError(
            "No hay ticket en la base de datos con ese id."
        )
    return {"status": "success", "data": caso}


@test.get(
    "/casos/{id}",
    tags=["casos-temporales"],
    summary="Buscar caso temporal por id",
    response_description="Registro único o 404",
)
def buscar_caso(id: int):
    for registro in db_temporal:
        if registro["id"] == id:
            return registro
    raise CasoNoEncontradoError("Caso no encontrado en la lista temporal.")


@test.get(
    "/casos/filtrar/",
    tags=["casos-temporales"],
    summary="Filtrar casos temporales por categoría",
)
def filtrar_por_categoria(categoria: Optional[str] = Query(None)):
    if categoria:
        return [c for c in db_temporal if c["categoria"].lower() == categoria.lower()]
    return db_temporal


@test.post(
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
):
    verificar_limite_registrar(_ip_cliente(request))
    return servicio.registrar_caso(nombre, email, descripcion)


@test.get("/{spa_path:path}", tags=["raíz"], include_in_schema=False)
async def spa_fallback(spa_path: str):
    """
    Sirve la SPA para rutas del front (/consultar, /taller, …). Las rutas de API,
    /docs, /openapi.json, etc. se registran antes y tienen prioridad.
    """
    return FileResponse(_FRONT_INDEX)
