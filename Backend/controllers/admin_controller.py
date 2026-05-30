from fastapi import APIRouter, Depends, status
from fastapi import Request, HTTPException
from ..core.auth_deps import require_roles
from ..dependencies import get_servicio_admin
from ..models.admin_schemas import (
    AdminAssignCompanyBody,
    AdminUserActiveBody,
    AdminUserCreateBody,
    AdminUserPasswordBody,
    AdminUserRoleBody,
)
from ..services.admin_service import ServicioAdmin

_webmaster = Depends(require_roles("webmaster"))

router = APIRouter(
    prefix="/api/admin",
    tags=["admin"],
    dependencies=[_webmaster],
)


@router.get("/usuarios", summary="Listar usuarios")
def api_admin_usuarios(svc: ServicioAdmin = Depends(get_servicio_admin)):
    return {"success": True, "data": svc.listar_usuarios()}


@router.post("/usuarios", summary="Crear usuario", status_code=status.HTTP_201_CREATED)
async def api_admin_crear_usuario(
    request: Request,
    body: AdminUserCreateBody,
    svc: ServicioAdmin = Depends(get_servicio_admin),
):
    # Esto imprimirá en la terminal exactamente lo que recibe el backend
    data = await request.json()
    print(f"DEBUG: Datos recibidos: {data}")
    
    try:
        user = svc.crear_usuario(
            body.nombre,
            body.apellidos,
            body.email,
            body.password,
            body.rol,
            body.companyId,
        )
        return {"success": True, "user": user}
    except EmailAlreadyExistsError:
        raise HTTPException(status_code=409, detail="El correo ya está registrado.")
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        print(f"ERROR: {e}")
        raise HTTPException(status_code=500, detail="Error interno al crear usuario.")


@router.patch("/usuarios/{user_id}/rol", summary="Cambiar rol")
def api_admin_rol(
    user_id: str,
    body: AdminUserRoleBody,
    svc: ServicioAdmin = Depends(get_servicio_admin),
):
    user = svc.cambiar_rol(user_id, body.rol)
    return {"success": True, "user": user}


@router.patch("/usuarios/{user_id}/password", summary="Restablecer contraseña")
def api_admin_password(
    user_id: str,
    body: AdminUserPasswordBody,
    svc: ServicioAdmin = Depends(get_servicio_admin),
):
    svc.cambiar_password(user_id, body.password)
    return {"success": True, "message": "Contraseña actualizada."}


@router.patch("/usuarios/{user_id}/compania", summary="Asignar compañía")
def api_admin_compania(
    user_id: str,
    body: AdminAssignCompanyBody,
    svc: ServicioAdmin = Depends(get_servicio_admin),
):
    user = svc.asignar_compania(user_id, body.companyId)
    return {"success": True, "user": user}


@router.patch("/usuarios/{user_id}/activo", summary="Activar o desactivar usuario")
def api_admin_activo(
    user_id: str,
    body: AdminUserActiveBody,
    svc: ServicioAdmin = Depends(get_servicio_admin),
):
    user = svc.set_usuario_activo(user_id, body.activa)
    return {"success": True, "user": user}
