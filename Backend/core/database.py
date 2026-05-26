"""
Motor SQLModel — URL por entorno (SQLite taller/registro o SQL Server auth/soporte).
"""

from __future__ import annotations

import os

from sqlmodel import SQLModel, create_engine

from ..config_paths import DEFAULT_SQLITE_PATH
from ..utils.sqlserver import sqlalchemy_database_url

_engine = None


def create_database_url() -> str:
    """Construye la URL del motor según variables de entorno."""
    explicit = os.environ.get("DATABASE_URL", "").strip()
    if explicit:
        return explicit
    if os.environ.get("SQLSERVER_PASSWORD", "").strip():
        return sqlalchemy_database_url()
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
            echo=os.environ.get("SQL_ECHO", "").lower() in ("1", "true", "yes"),
            connect_args=connect_args,
        )
    return _engine


def init_db() -> None:
    """Crea tablas SQLModel si no existen (útil en SQLite / dev)."""
    from ..models import db_models  # noqa: F401

    SQLModel.metadata.create_all(get_engine())
