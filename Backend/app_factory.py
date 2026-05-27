"""
Fábrica de la aplicación FastAPI (patrón Fábrica: ensambla middleware, excepciones, routers MVC).
"""

import logging
import os
from contextlib import asynccontextmanager

from fastapi import FastAPI, Request, status
from fastapi.exceptions import RequestValidationError
from sqlalchemy.exc import SQLAlchemyError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.staticfiles import StaticFiles
from starlette.exceptions import HTTPException as StarletteHTTPException

from .config_paths import FRONTEND_ASSETS_DIR, FRONTEND_IMAGES_DIR
from .core.database import init_db
from .controllers.auth_controller import router as auth_router
from .controllers.casos_controller import router as casos_router
from .controllers.health_controller import router as health_router
from .controllers.legacy_casos_controller import router as legacy_casos_router
from .controllers.registro_controller import router as registro_router
from .controllers.spa_controller import router as spa_router

from .core.exceptions import (
    CasoNoEncontradoError,
    CorreoInvalidoError,
    IdDuplicadoError,
    IssueInvalidoError,
    NombreInvalidoError,
    RateLimitExceededError,
    TicketSqliteNoEncontradoError,
    EmailAlreadyExistsError,
    UserNotFoundError,
    InvalidCredentialsError,
)


def _cors_allow_origins() -> list[str]:
    raw = os.environ.get("CORS_ORIGINS", "").strip()
    return [o.strip() for o in raw.split(",") if o.strip()] if raw else ["*"]


@asynccontextmanager
async def _lifespan(app: FastAPI):
    try:
        init_db()
    except Exception as exc:
        logging.getLogger("trackaid").warning("init_db omitido: %s", exc)

    log = logging.getLogger("trackaid")
    try:
        from .core.database import create_database_url

        url = create_database_url()
        log.info("Base de datos: %s", url.split("@")[-1] if "@" in url else url)
    except Exception:
        pass

    if os.environ.get("SKIP_DB_SEED", "").lower() not in ("1", "true", "yes"):
        try:
            from .core.seed import ejecutar_seed_demo

            ejecutar_seed_demo()
        except Exception as exc:
            log.warning("Seed de usuarios demo omitido (revise SQL Server / .env): %s", exc)
    yield


def create_app() -> FastAPI:
    app = FastAPI(title="API Soporte Técnico", version="1.0.0", lifespan=_lifespan)

    if os.path.isdir(FRONTEND_ASSETS_DIR):
        app.mount("/assets", StaticFiles(directory=FRONTEND_ASSETS_DIR), name="vite_assets")
    if os.path.isdir(FRONTEND_IMAGES_DIR):
        app.mount("/images", StaticFiles(directory=FRONTEND_IMAGES_DIR), name="vite_images")

    app.add_middleware(CORSMiddleware, allow_origins=_cors_allow_origins(), allow_methods=["*"], allow_headers=["*"])

    @app.exception_handler(RequestValidationError)
    async def validacion_pydantic_handler(request: Request, exc: RequestValidationError):
        return JSONResponse(status_code=422, content={"status": "error", "message": "Datos de entrada inválidos."})

    @app.exception_handler(CasoNoEncontradoError)
    async def caso_no_encontrado_handler(request: Request, exc: CasoNoEncontradoError):
        return JSONResponse(status_code=status.HTTP_404_NOT_FOUND, content={"status": "error", "code": "CASO_NOT_FOUND", "message": str(exc)})

    @app.exception_handler(EmailAlreadyExistsError)
    async def email_exists(request, exc):
        return JSONResponse(status_code=400, content={"code": "EMAIL_IN_USE", "message": "El correo ya está registrado."})

    @app.exception_handler(UserNotFoundError)
    async def user_not_found(request, exc):
        return JSONResponse(status_code=404, content={"code": "USER_NOT_FOUND", "message": "Usuario no encontrado."})

    @app.exception_handler(InvalidCredentialsError)
    async def invalid_creds(request, exc):
        return JSONResponse(status_code=401, content={"code": "INVALID_CREDENTIALS", "message": "Credenciales incorrectas."})

    @app.exception_handler(CorreoInvalidoError)
    async def correo_invalido_handler(request: Request, exc: CorreoInvalidoError):
        return JSONResponse(status_code=400, content={"code": "INVALID_EMAIL", "message": str(exc)})

    @app.exception_handler(SQLAlchemyError)
    async def database_error_handler(request: Request, exc: SQLAlchemyError):
        logging.getLogger("trackaid").exception("Error de base de datos")
        return JSONResponse(
            status_code=503,
            content={
                "code": "DATABASE_ERROR",
                "message": (
                    "No se pudo acceder a la base de datos. "
                    "En Codespace: docker compose up -d, bash scripts/codespace-init-db.sh "
                    "y SQLSERVER_PASSWORD en .env (ver README)."
                ),
            },
        )

    @app.exception_handler(ValueError)
    async def value_error_handler(request: Request, exc: ValueError):
        if str(exc) == "ORDER_NOT_FOUND":
            return JSONResponse(status_code=400, content={"status": "error", "code": "ORDER_NOT_FOUND", "message": "El ID de pedido no existe."})
        return JSONResponse(status_code=400, content={"status": "error", "message": str(exc)})

    @app.exception_handler(NombreInvalidoError)
    async def nombre_invalido_handler(request: Request, exc: NombreInvalidoError):
        return JSONResponse(status_code=400, content={"status": "error", "message": str(exc)})

    @app.exception_handler(IssueInvalidoError)
    async def issue_invalido_handler(request: Request, exc: IssueInvalidoError):
        return JSONResponse(status_code=400, content={"status": "error", "message": str(exc)})

    @app.exception_handler(TicketSqliteNoEncontradoError)
    async def ticket_sqlite_no_encontrado(request: Request, exc: TicketSqliteNoEncontradoError):
        return JSONResponse(
            status_code=404,
            content={"status": "error", "code": "TICKET_NOT_FOUND", "message": str(exc)},
        )

    @app.exception_handler(IdDuplicadoError)
    async def id_duplicado_handler(request: Request, exc: IdDuplicadoError):
        return JSONResponse(status_code=409, content={"status": "error", "message": str(exc)})

    app.include_router(health_router)
    app.include_router(legacy_casos_router)
    app.include_router(casos_router)
    app.include_router(registro_router)
    app.include_router(auth_router)
    app.include_router(spa_router)

    return app
