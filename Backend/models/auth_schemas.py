import re
from typing import Self
from pydantic import BaseModel, ConfigDict, Field, field_validator, model_validator

from ..constants import MAX_EMAIL_LEN, MAX_NOMBRE_LEN

def _password_rules(password: str) -> None:
    if len(password) < 8:
        raise ValueError("La contraseña debe tener al menos 8 caracteres.")
    if not re.search(r"[a-z]", password) or not re.search(r"[A-Z]", password):
        raise ValueError("Combine letras mayúsculas y minúsculas.")
    if not re.search(r"[^a-zA-Z0-9]", password):
        raise ValueError("Incluya al menos un símbolo.")

class RegisterBody(BaseModel):
    model_config = ConfigDict(extra="forbid")

    first_name: str = Field(min_length=1, max_length=MAX_NOMBRE_LEN)
    last_name: str = Field(min_length=1, max_length=MAX_NOMBRE_LEN)
    document_number: str = Field(min_length=5, max_length=50)
    city: str | None = None
    address: str | None = None
    email: str = Field(min_length=1, max_length=MAX_EMAIL_LEN)
    company_id: str = Field(min_length=8, max_length=80)
    password: str = Field(min_length=8, max_length=128)
    confirm_password: str = Field(min_length=1, max_length=128)
    accept_terms: bool

    @field_validator("first_name", "last_name")
    @classmethod
    def strip_nombres(cls, v: str) -> str:
        return (v or "").strip()

    @field_validator("company_id")
    @classmethod
    def sanitize_company_key(cls, v: str) -> str:
        key = re.sub(r"\s+", "-", v.strip().lower())
        key = re.sub(r"[^a-z0-9\-_.]", "", key)
        if not key or len(key) < 8:
            raise ValueError("La llave de compañía debe tener al menos 8 caracteres.")
        return key

    @field_validator("password")
    @classmethod
    def password_fuerte(cls, v: str) -> str:
        _password_rules(v)
        return v

    @model_validator(mode="after")
    def coincidencias(self) -> Self:
        if not self.accept_terms:
            raise ValueError("Debe aceptar los términos.")
        if self.password != self.confirm_password:
            raise ValueError("Las contraseñas no coinciden.")
        return self

class LoginBody(BaseModel):
    email: str = Field(min_length=1, max_length=MAX_EMAIL_LEN)
    password: str = Field(min_length=1, max_length=128)

class ForgotPasswordBody(BaseModel):
    email: str = Field(min_length=1, max_length=MAX_EMAIL_LEN)
    confirm_email: str = Field(min_length=1, max_length=MAX_EMAIL_LEN)

    @model_validator(mode="after")
    def emails_coinciden(self) -> Self:
        if self.email.strip().lower() != self.confirm_email.strip().lower():
            raise ValueError("Los correos no coinciden.")
        return self

class ResetPasswordBody(BaseModel):
    token: str = Field(min_length=8, max_length=256)
    new_password: str = Field(min_length=8, max_length=128)
    confirm_password: str = Field(min_length=1, max_length=128)

    @field_validator("new_password")
    @classmethod
    def password_fuerte(cls, v: str) -> str:
        _password_rules(v)
        return v

    @model_validator(mode="after")
    def passwords_coinciden(self) -> Self:
        if self.new_password != self.confirm_password:
            raise ValueError("Las contraseñas no coinciden.")
        return self