from typing import Any

from fastapi import APIRouter, status, Depends
from ..core.jwt_auth import crear_token
from ..dependencies import get_servicio_auth
from ..models import LoginBody, RegisterBody, ResetPasswordBody, ForgotPasswordBody
from ..services.auth_service import ServicioAuth

router = APIRouter(prefix="/api/auth", tags=["auth"])


def _respuesta_sesion(user: dict[str, Any]) -> dict[str, Any]:
    token = crear_token(user["id"], user["email"], user["rol"])
    return {"success": True, "user": user, "accessToken": token}


@router.post("/register", summary="Registro de usuario", status_code=status.HTTP_201_CREATED)
def api_auth_register(body: RegisterBody, auth_service: ServicioAuth = Depends(get_servicio_auth)):
    user = auth_service.registrar(
        body.nombre,
        body.apellidos,
        body.email,
        body.password,
        body.companyKey or "",
    )
    return _respuesta_sesion(user)


@router.post("/login", summary="Iniciar sesión")
def api_auth_login(body: LoginBody, auth_service: ServicioAuth = Depends(get_servicio_auth)):
    user = auth_service.login(body.email, body.password)
    return _respuesta_sesion(user)

@router.post("/forgot-password", summary="Solicitar restablecimiento")
def api_auth_forgot_password(body: ForgotPasswordBody, auth_service: ServicioAuth = Depends(get_servicio_auth)):
    token = auth_service.crear_token_reset(body.email)
    return {"success": True, "message": "Procesado", "resetToken": token}

@router.post("/reset-password", summary="Restablecer contraseña")
def api_auth_reset_password(body: ResetPasswordBody, auth_service: ServicioAuth = Depends(get_servicio_auth)):
    auth_service.restablecer_con_token(body.token, body.newPassword)
    return {"success": True, "message": "Contraseña actualizada."}