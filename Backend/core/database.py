"""
Motor SQLModel — patrón Fábrica: URL y engine configurables por entorno.

Por defecto SQLite (`DATABASE_PATH` o `soporte.db` en la raíz del repo).
Para SQL Server local: `DATABASE_URL=mssql+pyodbc://...` (requiere `pyodbc`).
"""

from __future__ import annotations

import os

from sqlmodel import SQLModel, create_engine

from ..config_paths import DEFAULT_SQLITE_PATH

_engine = None


def create_database_url() -> str:
    """Construye la URL del motor según variables de entorno."""
    explicit = os.environ.get("DATABASE_URL", "").strip()
    if explicit:
        return explicit
    db_path = os.environ.get("DATABASE_PATH", DEFAULT_SQLITE_PATH)
    return f"sqlite:///{db_path}"


def get_engine():
    """Devuelve el engine singleton (lazy)."""
    global _engine
    if _engine is None:
        url = create_database_url()
        connect_args: dict = {}
        if url.startswith("sqlite"):
            connect_args["check_same_thread"] = False
        _engine = create_engine(
            url,
            echo=os.environ.get("SQL_ECHO", "").strip() == "1",
            connect_args=connect_args,
        )
    return _engine


def init_db() -> None:
    """Crea tablas SQLModel si no existen (SQLite / dev / Azure sin migraciones)."""
    from ..models import db_models  # noqa: F401 — registra metadatos

    SQLModel.metadata.create_all(get_engine())
