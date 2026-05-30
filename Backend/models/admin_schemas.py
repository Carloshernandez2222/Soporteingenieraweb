import re
from typing import Self

from pydantic import BaseModel, Field, field_validator

from ..constants import MAX_EMAIL_LEN, MAX_NOMBRE_LEN


def _sanitize_key(v: str) -> str:
    key = re.sub(r"\s+", "-", v.strip().lower())
    return re.sub(r"[^a-z0-9\-_.]", "", key)


class CompanyCreateBody(BaseModel):
    nombre: str = Field(min_length=2, max_length=120)
    llave: str = Field(min_length=2, max_length=80)

    @field_validator("llave")
    @classmethod
    def key_ok(cls, v: str) -> str:
        key = _sanitize_key(v)
        if not key:
            raise ValueError("Llave inválida.")
        return key


class CompanyActiveBody(BaseModel):
    activa: bool


class AdminUserCreateBody(BaseModel):
    nombre: str = Field(min_length=1, max_length=MAX_NOMBRE_LEN)
    apellidos: str = Field(min_length=1, max_length=MAX_NOMBRE_LEN)
    email: str = Field(min_length=1, max_length=MAX_EMAIL_LEN)
    password: str = Field(min_length=8, max_length=128)
    rol: str = Field(min_length=3, max_length=32)
    companyId: str | None = None


class AdminUserRoleBody(BaseModel):
    rol: str = Field(min_length=3, max_length=32)


class AdminUserPasswordBody(BaseModel):
    password: str = Field(min_length=8, max_length=128)


class AdminUserActiveBody(BaseModel):
    activa: bool


class AdminAssignCompanyBody(BaseModel):
    companyId: str


class CaseAssignBody(BaseModel):
    assignedToUserId: str | None = None


class CaseStatusBody(BaseModel):
    status: str = Field(min_length=2, max_length=40)
    comentario: str = Field(default="", max_length=2000)
