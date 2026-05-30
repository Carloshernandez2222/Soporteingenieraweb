"""
Motor SQLModel — URL por entorno (SQLite taller/registro o SQL Server auth/soporte).
"""

from __future__ import annotations

import os

from sqlmodel import SQLModel, create_engine
from sqlalchemy import text

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

    engine = get_engine()
    SQLModel.metadata.create_all(engine)
    _ensure_sqlite_phase2_schema(engine)


def _ensure_sqlite_phase2_schema(engine) -> None:
    """Compatibilidad local: agrega columnas nuevas en SQLite existente."""
    url = create_database_url()
    if not url.startswith("sqlite"):
        return
    with engine.begin() as conn:
        rows = conn.execute(text('PRAGMA table_info("SupportCases")')).fetchall()
        cols = {str(r[1]) for r in rows}
        if "CompanyID" not in cols:
            conn.execute(text('ALTER TABLE "SupportCases" ADD COLUMN "CompanyID" TEXT'))
        if "AssignedTo" not in cols:
            conn.execute(text('ALTER TABLE "SupportCases" ADD COLUMN "AssignedTo" TEXT'))
        if "IsActive" not in cols:
            conn.execute(text('ALTER TABLE "SupportCases" ADD COLUMN "IsActive" INTEGER DEFAULT 1'))
