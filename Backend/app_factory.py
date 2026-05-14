"""
Fábrica de la aplicación FastAPI (ensambla middleware, excepciones, routers MVC).
"""

import os

from fastapi import FastAPI, Request
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.staticfiles import StaticFiles
from starlette.exceptions import HTTPException as StarletteHTTPException

from .config_paths import FRONTEND_ASSETS_DIR
from .controllers.auth_controller import router as auth_router
from .controllers.casos_controller import router as casos_router
from .controllers.health_controller import router as health_router
from .controllers.registro_controller import router as registro_router
from .controllers.spa_controller import router as spa_router
from .exceptions import (
    CasoNoEncontradoError,
    CorreoInvalidoError,
    IdDuplicadoError,
    IssueInvalidoError,
    NombreInvalidoError,
    RateLimitExceededError,
    TicketSqliteNoEncontradoError,
)


def _cors_allow_origins() -> list[str]:
    """En producción use CORS_ORIGINS=https://tu-dominio.com (lista separada por comas). Vacío = *."""
    raw = os.environ.get("CORS_ORIGINS", "").strip()
    if not raw:
        return ["*"]
    return [o.strip() for o in raw.split(",") if o.strip()]


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


def create_app() -> FastAPI:
    app = FastAPI(
        title="API Soporte Técnico",
        description=(
            "Arquitectura MVC: modelos en `src/models`, servicios en `src/services`, "
            "controladores en `src/controllers`. "
            "Tickets y taller persistidos en SQLite (`DATABASE_PATH`)."
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
                "description": "Casos del taller en SQLite: creación, listado y filtros.",
            },
            {
                "name": "auth",
                "description": "Registro e inicio de sesión para el panel (SQLite).",
            },
        ],
    )

    if os.path.isdir(FRONTEND_ASSETS_DIR):
        app.mount("/assets", StaticFiles(directory=FRONTEND_ASSETS_DIR), name="vite_assets")

    app.add_middleware(
        CORSMiddleware,
        allow_origins=_cors_allow_origins(),
        allow_methods=["*"],
        allow_headers=["*"],
    )

    @app.exception_handler(RequestValidationError)
    async def validacion_pydantic_handler(request: Request, exc: RequestValidationError):
        if request.url.path.startswith("/api/auth"):
            details: dict[str, str] = {}
            for err in exc.errors():
                loc = [str(x) for x in err.get("loc", []) if x not in ("body", "query", "path")]
                key = loc[-1] if loc else "form"
                msg = err.get("msg", "")
                if msg.startswith("Value error, "):
                    msg = msg[len("Value error, ") :]
                details[key] = msg
            first = next(iter(details.values()), "Datos inválidos")
            return JSONResponse(
                status_code=422,
                content={
                    "code": "VALIDATION_ERROR",
                    "message": first,
                    "details": details,
                },
            )
        return JSONResponse(
            status_code=422,
            content={
                "status": "error",
                "message": _mensaje_validacion_pydantic(exc),
            },
        )

    @app.exception_handler(StarletteHTTPException)
    async def http_exception_handler(request: Request, exc: StarletteHTTPException):
        if isinstance(exc.detail, str):
            mensaje = exc.detail
        else:
            mensaje = str(exc.detail)
        return JSONResponse(
            status_code=exc.status_code,
            content={"status": "error", "message": mensaje},
        )

    @app.exception_handler(NombreInvalidoError)
    async def nombre_invalido_handler(request: Request, exc: NombreInvalidoError):
        return JSONResponse(status_code=400, content={"status": "error", "message": str(exc)})

    @app.exception_handler(CorreoInvalidoError)
    async def correo_invalido_handler(request: Request, exc: CorreoInvalidoError):
        return JSONResponse(status_code=400, content={"status": "error", "message": str(exc)})

    @app.exception_handler(IssueInvalidoError)
    async def issue_invalido_handler(request: Request, exc: IssueInvalidoError):
        return JSONResponse(status_code=400, content={"status": "error", "message": str(exc)})

    @app.exception_handler(IdDuplicadoError)
    async def id_duplicado_handler(request: Request, exc: IdDuplicadoError):
        return JSONResponse(status_code=409, content={"status": "error", "message": str(exc)})

    @app.exception_handler(RateLimitExceededError)
    async def rate_limit_handler(request: Request, exc: RateLimitExceededError):
        return JSONResponse(status_code=429, content={"status": "error", "message": str(exc)})

    @app.exception_handler(CasoNoEncontradoError)
    async def caso_no_encontrado_handler(request: Request, exc: CasoNoEncontradoError):
        return JSONResponse(status_code=404, content={"status": "error", "message": str(exc)})

    @app.exception_handler(TicketSqliteNoEncontradoError)
    async def ticket_sqlite_no_encontrado_handler(
        request: Request, exc: TicketSqliteNoEncontradoError
    ):
        return JSONResponse(status_code=404, content={"status": "error", "message": str(exc)})

    app.include_router(health_router)
    app.include_router(casos_router)
    app.include_router(registro_router)
    app.include_router(auth_router)
    app.include_router(spa_router)

    return app
