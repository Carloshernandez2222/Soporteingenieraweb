"""Dependencias FastAPI: usuario autenticado y autorización por rol."""

from __future__ import annotations

from dataclasses import dataclass
from typing import Callable

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

from ..constants import normalizar_rol
from .jwt_auth import decodificar_token

_bearer = HTTPBearer(auto_error=False)


@dataclass(frozen=True)
class CurrentUser:
    id: str
    email: str
    rol: str
    nombre: str
    apellidos: str


def _user_from_payload(payload: dict) -> CurrentUser:
    user_id = str(payload.get("sub") or "")
    email = str(payload.get("email") or "")
    if not user_id or not email:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail={"code": "TOKEN_INVALID", "message": "Token incompleto."},
        )
    return CurrentUser(
        id=user_id,
        email=email,
        rol=normalizar_rol(str(payload.get("rol") or "")),
        nombre=str(payload.get("nombre") or ""),
        apellidos=str(payload.get("apellidos") or ""),
    )


def get_current_user(
    creds: HTTPAuthorizationCredentials | None = Depends(_bearer),
) -> CurrentUser:
    if creds is None or creds.scheme.lower() != "bearer" or not creds.credentials:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail={"code": "NOT_AUTHENTICATED", "message": "Se requiere autenticación."},
        )
    return _user_from_payload(decodificar_token(creds.credentials))


def require_roles(*roles: str) -> Callable[..., CurrentUser]:
    allowed = frozenset(normalizar_rol(r) for r in roles)

    def _dep(user: CurrentUser = Depends(get_current_user)) -> CurrentUser:
        if user.rol not in allowed:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail={"code": "FORBIDDEN", "message": "No tiene permiso para esta acción."},
            )
        return user

    return _dep
