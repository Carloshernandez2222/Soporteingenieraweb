import re
from typing import Self

from pydantic import BaseModel, Field, field_validator, model_validator

from ..constants import MAX_EMAIL_LEN, MAX_NOMBRE_LEN


def _password_rules(password: str) -> None:
    if len(password) < 8:
        raise ValueError("La contraseña debe tener al menos 8 caracteres.")
    if not re.search(r"[a-z]", password) or not re.search(r"[A-Z]", password):
        raise ValueError("Combine letras mayúsculas y minúsculas.")
    if not re.search(r"[^a-zA-Z0-9]", password):
        raise ValueError("Incluya al menos un símbolo.")


class RegisterBody(BaseModel):
    nombre: str = Field(min_length=1, max_length=MAX_NOMBRE_LEN)
    apellidos: str = Field(min_length=1, max_length=MAX_NOMBRE_LEN)
    email: str = Field(min_length=1, max_length=MAX_EMAIL_LEN)
    password: str = Field(min_length=8, max_length=128)
    confirmPassword: str = Field(min_length=1, max_length=128)
    acceptTerms: bool

    @field_validator("nombre", "apellidos")
    @classmethod
    def strip_nombres(cls, v: str) -> str:
        return (v or "").strip()

    @field_validator("password")
    @classmethod
    def password_fuerte(cls, v: str) -> str:
        _password_rules(v)
        return v

    @model_validator(mode="after")
    def coincidencias(self) -> Self:
        if not self.acceptTerms:
            raise ValueError("Debe aceptar los términos.")
        if self.password != self.confirmPassword:
            raise ValueError("Las contraseñas no coinciden.")
        return self


class LoginBody(BaseModel):
    email: str = Field(min_length=1, max_length=MAX_EMAIL_LEN)
    password: str = Field(min_length=1, max_length=128)


class ForgotPasswordBody(BaseModel):
    email: str = Field(min_length=1, max_length=MAX_EMAIL_LEN)
    confirmEmail: str = Field(min_length=1, max_length=MAX_EMAIL_LEN)

    @model_validator(mode="after")
    def emails_coinciden(self) -> Self:
        if self.email.strip().lower() != self.confirmEmail.strip().lower():
            raise ValueError("Los correos no coinciden.")
        return self


class ResetPasswordBody(BaseModel):
    token: str = Field(min_length=8, max_length=256)
    newPassword: str = Field(min_length=8, max_length=128)
    confirmPassword: str = Field(min_length=1, max_length=128)

    @field_validator("newPassword")
    @classmethod
    def password_fuerte(cls, v: str) -> str:
        _password_rules(v)
        return v

    @model_validator(mode="after")
    def passwords_coinciden(self) -> Self:
        if self.newPassword != self.confirmPassword:
            raise ValueError("Las contraseñas no coinciden.")
        return self
