from fastapi import APIRouter, status, Depends, HTTPException
from ..core.jwt_auth import crear_token
from ..dependencies import get_servicio_auth
from ..models.auth_schemas import LoginBody, RegisterBody
from ..services.auth_service import ServicioAuth
from typing import Any  # <--- ¡ESTA LÍNEA ES LA QUE FALTA O ESTÁ MAL!
router = APIRouter(prefix="/api/auth", tags=["auth"])

def _respuesta_sesion(user: dict[str, Any]) -> dict[str, Any]:
    # Aquí usamos las llaves que definimos en el dict del servicio
    token = crear_token(user["id"], user["email"], user["rol"])
    return {"success": True, "user": user, "accessToken": token}

@router.post("/register", summary="Registro de usuario", status_code=status.HTTP_201_CREATED)
def api_auth_register(body: RegisterBody, auth_service: ServicioAuth = Depends(get_servicio_auth)):
    try:
        user = auth_service.registrar(
            body.nombre, body.apellidos, body.email, 
            body.password, body.companyKey
        )
        return {"success": True, "user": user}
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/login", summary="Iniciar sesión")
def api_auth_login(body: LoginBody, auth_service: ServicioAuth = Depends(get_servicio_auth)):
    user = auth_service.login(body.email, body.password)
    if not user:
        raise HTTPException(status_code=401, detail="Credenciales incorrectas")
    return _respuesta_sesion(user)