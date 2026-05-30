from fastapi import APIRouter, Depends, status
from sqlmodel import Session
from ..core.auth_deps import require_roles
from ..dependencies import get_servicio_company, get_engine
from ..models.admin_schemas import CompanyActiveBody, CompanyCreateBody
from ..models.db_models import CompanyDB, LocationDB
from ..services.company_service import ServicioCompany

router = APIRouter(prefix="/api/companies", tags=["companies"])

@router.get("/activas", summary="Compañías activas")
def api_companies_activas(svc: ServicioCompany = Depends(get_servicio_company)):
    return {"success": True, "data": svc.listar_activas()}

@router.get("", summary="Todas las compañías", dependencies=[Depends(require_roles("webmaster"))])
def api_companies_todas(svc: ServicioCompany = Depends(get_servicio_company)):
    return {"success": True, "data": svc.listar_todas()}

@router.post("", summary="Crear compañía y ubicación", status_code=status.HTTP_201_CREATED, dependencies=[Depends(require_roles("webmaster"))])
def api_company_crear(body: CompanyCreateBody):
    # Usamos sesión directa aquí para asegurar la atomicidad (transacción)
    with Session(get_engine()) as session:
        # 1. Crear compañía
        nueva_comp = CompanyDB(Name=body.nombre, Nit=body.nit)
        session.add(nueva_comp)
        session.commit()
        session.refresh(nueva_comp)
        
        # 2. Crear ubicación asociada
        nueva_loc = LocationDB(City=body.ciudad, Address=body.direccion, CompanyID=nueva_comp.CompanyID)
        session.add(nueva_loc)
        session.commit()
        
        return {"success": True, "data": {"company_id": nueva_comp.CompanyID, "location_id": nueva_loc.LocationID}}

@router.patch("/{company_id}/activa", summary="Activar/Desactivar compañía", dependencies=[Depends(require_roles("webmaster"))])
def api_company_activa(company_id: str, body: CompanyActiveBody, svc: ServicioCompany = Depends(get_servicio_company)):
    data = svc.set_activa(company_id, body.activa)
    return {"success": True, "data": data}