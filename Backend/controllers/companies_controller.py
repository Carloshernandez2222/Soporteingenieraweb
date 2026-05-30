from fastapi import APIRouter, Depends, status

from ..core.auth_deps import require_roles
from ..dependencies import get_servicio_company
from ..models.admin_schemas import CompanyActiveBody, CompanyCreateBody
from ..services.company_service import ServicioCompany

router = APIRouter(prefix="/api/companies", tags=["companies"])


@router.get("/activas", summary="Compañías activas (carrusel / selector)")
def api_companies_activas(svc: ServicioCompany = Depends(get_servicio_company)):
    return {"success": True, "data": svc.listar_activas()}


@router.get(
    "",
    summary="Todas las compañías (webmaster)",
    dependencies=[Depends(require_roles("webmaster"))],
)
def api_companies_todas(svc: ServicioCompany = Depends(get_servicio_company)):
    return {"success": True, "data": svc.listar_todas()}


@router.post(
    "",
    summary="Crear compañía (webmaster)",
    status_code=status.HTTP_201_CREATED,
    dependencies=[Depends(require_roles("webmaster"))],
)
def api_company_crear(body: CompanyCreateBody, svc: ServicioCompany = Depends(get_servicio_company)):
    data = svc.crear_compania(body.nombre, body.llave)
    return {"success": True, "data": data}


@router.patch(
    "/{company_id}/activa",
    summary="Activar o desactivar compañía (webmaster)",
    dependencies=[Depends(require_roles("webmaster"))],
)
def api_company_activa(
    company_id: str,
    body: CompanyActiveBody,
    svc: ServicioCompany = Depends(get_servicio_company),
):
    data = svc.set_activa(company_id, body.activa)
    return {"success": True, "data": data}
