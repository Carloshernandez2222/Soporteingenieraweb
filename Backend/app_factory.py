"""
Fábrica de la aplicación FastAPI (ensambla middleware, excepciones, routers MVC).
"""

import os
from fastapi import FastAPI, Request, status
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.staticfiles import StaticFiles
from starlette.exceptions import HTTPException as StarletteHTTPException

from .config_paths import FRONTEND_ASSETS_DIR, FRONTEND_IMAGES_DIR
from .controllers.auth_controller import router as auth_router
from .controllers.casos_controller import router as casos_router
from .controllers.health_controller import router as health_router
from .controllers.registro_controller import router as registro_router
from .controllers.spa_controller import router as spa_router

# Importaciones de excepciones
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
    InvalidCredentialsError
)

def _cors_allow_origins() -> list[str]:
    raw = os.environ.get("CORS_ORIGINS", "").strip()
    return [o.strip() for o in raw.split(",") if o.strip()] if raw else ["*"]

def create_app() -> FastAPI:
    app = FastAPI(title="API Soporte Técnico", version="1.0.0")

    # Static Files
    if os.path.isdir(FRONTEND_ASSETS_DIR):
        app.mount("/assets", StaticFiles(directory=FRONTEND_ASSETS_DIR), name="vite_assets")
    if os.path.isdir(FRONTEND_IMAGES_DIR):
        app.mount("/images", StaticFiles(directory=FRONTEND_IMAGES_DIR), name="vite_images")

    app.add_middleware(CORSMiddleware, allow_origins=_cors_allow_origins(), allow_methods=["*"], allow_headers=["*"])

    # --- Exception Handlers Globales ---
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

    @app.exception_handler(ValueError)
    async def value_error_handler(request: Request, exc: ValueError):
        if str(exc) == "ORDER_NOT_FOUND":
            return JSONResponse(status_code=400, content={"status": "error", "code": "ORDER_NOT_FOUND", "message": "El ID de pedido no existe."})
        return JSONResponse(status_code=400, content={"status": "error", "message": str(exc)})

    # Otros handlers básicos que ya tenías...
    @app.exception_handler(NombreInvalidoError)
    async def nombre_invalido_handler(request: Request, exc: NombreInvalidoError):
        return JSONResponse(status_code=400, content={"status": "error", "message": str(exc)})

    # --- Incluir Routers ---
    app.include_router(health_router)
    app.include_router(casos_router)
    app.include_router(registro_router)
    app.include_router(auth_router)
    app.include_router(spa_router)

    return app