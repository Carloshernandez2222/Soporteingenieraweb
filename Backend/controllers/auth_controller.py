from fastapi import APIRouter
from fastapi.responses import JSONResponse

from ..dependencies import get_servicio_auth
from ..exceptions import CorreoInvalidoError
from ..models import ForgotPasswordBody, LoginBody, RegisterBody, ResetPasswordBody

router = APIRouter(prefix="/api/auth", tags=["auth"])


@router.post("/register", summary="Registro de usuario")
def api_auth_register(body: RegisterBody):
    try:
        user = get_servicio_auth().registrar(
            body.nombre, body.apellidos, body.email, body.password
        )
        return {"success": True, "user": user}
    except CorreoInvalidoError as e:
        return JSONResponse(
            status_code=400,
            content={
                "code": "INVALID_EMAIL",
                "message": str(e),
                "details": {"email": str(e)},
            },
        )
    except ValueError as e:
        if str(e) == "EMAIL_IN_USE":
            return JSONResponse(
                status_code=400,
                content={
                    "code": "EMAIL_IN_USE",
                    "message": "Ya existe una cuenta con este correo.",
                    "details": {"email": "Este correo ya está registrado."},
                },
            )
        return JSONResponse(
            status_code=400,
            content={
                "code": "VALIDATION_ERROR",
                "message": str(e),
                "details": {"form": str(e)},
            },
        )


@router.post("/login", summary="Iniciar sesión")
def api_auth_login(body: LoginBody):
    try:
        user = get_servicio_auth().login(body.email, body.password)
        return {"success": True, "user": user}
    except CorreoInvalidoError as e:
        return JSONResponse(
            status_code=400,
            content={
                "code": "INVALID_EMAIL",
                "message": str(e),
                "details": {"email": str(e)},
            },
        )
    except LookupError as e:
        code = str(e)
        if code == "USER_NOT_FOUND":
            return JSONResponse(
                status_code=404,
                content={
                    "code": "USER_NOT_FOUND",
                    "message": "No hay cuenta registrada con este correo.",
                },
            )
        return JSONResponse(
            status_code=404,
            content={"code": "USER_NOT_FOUND", "message": "Usuario no encontrado."},
        )
    except PermissionError:
        return JSONResponse(
            status_code=401,
            content={
                "code": "INVALID_CREDENTIALS",
                "message": "Correo o contraseña incorrectos.",
            },
        )


@router.post(
    "/forgot-password",
    summary="Solicitar restablecimiento (dev: devuelve token en la respuesta)",
)
def api_auth_forgot_password(body: ForgotPasswordBody):
    try:
        token = get_servicio_auth().crear_token_reset(body.email)
        return {
            "success": True,
            "message": "Si el correo existe, puede continuar con el restablecimiento.",
            "resetToken": token,
        }
    except CorreoInvalidoError as e:
        return JSONResponse(
            status_code=400,
            content={
                "code": "INVALID_EMAIL",
                "message": str(e),
                "details": {"email": str(e)},
            },
        )
    except LookupError:
        return JSONResponse(
            status_code=404,
            content={
                "code": "USER_NOT_FOUND",
                "message": "No hay cuenta registrada con este correo.",
                "details": {"email": "Verifique el correo o regístrese."},
            },
        )


@router.post("/reset-password", summary="Restablecer contraseña con token")
def api_auth_reset_password(body: ResetPasswordBody):
    try:
        get_servicio_auth().restablecer_con_token(body.token, body.newPassword)
        return {"success": True, "message": "Contraseña actualizada correctamente."}
    except ValueError as e:
        msg = str(e)
        if msg == "TOKEN_INVALIDO":
            code, m = "TOKEN_INVALIDO", "El enlace de restablecimiento no es válido."
        elif msg == "TOKEN_EXPIRADO":
            code, m = "TOKEN_EXPIRADO", "El enlace expiró. Solicite uno nuevo."
        else:
            code, m = "VALIDATION_ERROR", msg
        return JSONResponse(
            status_code=400,
            content={"code": code, "message": m},
        )
    except LookupError:
        return JSONResponse(
            status_code=404,
            content={"code": "USER_NOT_FOUND", "message": "No se pudo actualizar la cuenta."},
        )
