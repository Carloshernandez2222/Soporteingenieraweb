"""JWT mínimo para autenticación API (secret vía `JWT_SECRET`)."""

from __future__ import annotations

import os
from datetime import datetime, timedelta, timezone
from typing import Any

import jwt
from fastapi import HTTPException, status

DEFAULT_JWT_SECRET = "dev-trackaid-change-me-in-production"
JWT_ALGORITHM = "HS256"
JWT_EXPIRE_HOURS = 24


def jwt_secret() -> str:
    return os.environ.get("JWT_SECRET", "").strip() or DEFAULT_JWT_SECRET


def crear_token(user_id: str, email: str, rol: str) -> str:
    now = datetime.now(timezone.utc)
    payload = {
        "sub": user_id,
        "email": email,
        "rol": rol,
        "iat": now,
        "exp": now + timedelta(hours=JWT_EXPIRE_HOURS),
    }
    return jwt.encode(payload, jwt_secret(), algorithm=JWT_ALGORITHM)


def decodificar_token(token: str) -> dict[str, Any]:
    try:
        return jwt.decode(token, jwt_secret(), algorithms=[JWT_ALGORITHM])
    except jwt.ExpiredSignatureError as exc:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail={"code": "TOKEN_EXPIRED", "message": "Sesión expirada."},
        ) from exc
    except jwt.InvalidTokenError as exc:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail={"code": "TOKEN_INVALID", "message": "Token inválido."},
        ) from exc
