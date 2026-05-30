import re
from pydantic import BaseModel, Field, field_validator
from ..constants import MAX_EMAIL_LEN, MAX_NOMBRE_LEN
from pydantic import BaseModel, Field, field_validator, AliasChoices  # <--- Agregamos AliasChoices aquí
def _sanitize_key(v: str) -> str:
    key = re.sub(r"\s+", "-", v.strip().lower())
    return re.sub(r"[^a-z0-9\-_.]", "", key)

class CompanyCreateBody(BaseModel):
    nombre: str = Field(min_length=2, max_length=120)
    llave: str = Field(min_length=2, max_length=80)
    ciudad: str = Field(min_length=2, max_length=100)
    direccion: str = Field(min_length=2, max_length=200)

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
    # Acepta cualquiera de estos nombres: "nombre", "firstName" o "name"
    nombre: str = Field(validation_alias=AliasChoices('nombre', 'firstName', 'name'))
    apellidos: str = Field(validation_alias=AliasChoices('apellidos', 'lastName', 'surname'))
    email: str
    password: str
    rol: str
    # Acepta cualquiera de estos: "companyId", "company_id"
    companyId: str | None = Field(None, validation_alias=AliasChoices('companyId', 'company_id'))


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
