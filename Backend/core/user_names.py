"""Nombres de usuario desde columnas unificadas en Users."""

from __future__ import annotations

from sqlmodel import Session

from Backend.models.db_models import UserDB


def nombres_usuario(session: Session, user: UserDB | None) -> tuple[str, str]:
    if not user:
        return "", ""
    return (user.FirstName or "").strip(), (user.LastName or "").strip()


def nombre_completo(session: Session, user: UserDB | None) -> str:
    first, last = nombres_usuario(session, user)
    return f"{first} {last}".strip() or (user.Email if user else "—")
