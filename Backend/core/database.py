"""
Motor SQLModel — URL por entorno (SQLite taller/registro o SQL Server auth/soporte).
"""

from __future__ import annotations

import os

from dotenv import load_dotenv
from sqlmodel import SQLModel, create_engine
from sqlalchemy import text

from ..config_paths import DEFAULT_SQLITE_PATH
from ..utils.sqlserver import sqlalchemy_database_url

load_dotenv()

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
    """Crea tablas SQLModel si no existen y aplica migraciones ligeras."""
    from ..models import db_models  # noqa: F401

    engine = get_engine()
    SQLModel.metadata.create_all(engine)
    _ensure_support_cases_columns(engine)
    _ensure_unified_users_schema(engine)


def _table_columns(conn, table: str) -> set[str]:
    url = str(conn.engine.url)
    if url.startswith("sqlite"):
        rows = conn.execute(text(f'PRAGMA table_info("{table}")')).fetchall()
        return {str(r[1]) for r in rows}
    rows = conn.execute(
        text(
            """
            SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS
            WHERE TABLE_NAME = :table
            """
        ),
        {"table": table},
    ).fetchall()
    return {str(r[0]) for r in rows}


def _ensure_support_cases_columns(engine) -> None:
    with engine.begin() as conn:
        try:
            cols = _table_columns(conn, "SupportCases")
        except Exception:
            return
        if not cols:
            return
        dialect = conn.engine.dialect.name
        if "CompanyID" not in cols:
            col_type = "UNIQUEIDENTIFIER NULL" if dialect == "mssql" else "TEXT"
            conn.execute(text(f'ALTER TABLE "SupportCases" ADD "CompanyID" {col_type}'))
        if "AssignedTo" not in cols:
            col_type = "UNIQUEIDENTIFIER NULL" if dialect == "mssql" else "TEXT"
            conn.execute(text(f'ALTER TABLE "SupportCases" ADD "AssignedTo" {col_type}'))
        if "IsActive" not in cols:
            col_type = "BIT DEFAULT 1" if dialect == "mssql" else "INTEGER DEFAULT 1"
            conn.execute(text(f'ALTER TABLE "SupportCases" ADD "IsActive" {col_type}'))


def _ensure_unified_users_schema(engine) -> None:
    """Alinea Users con FirstName/LastName/CompanyID (modelo unificado)."""
    with engine.begin() as conn:
        try:
            cols = _table_columns(conn, "Users")
        except Exception:
            return
        if not cols:
            return

        dialect = conn.engine.dialect.name
        additions: list[tuple[str, str]] = []
        if "FirstName" not in cols:
            additions.append(
                ("FirstName", "NVARCHAR(100) NOT NULL DEFAULT ''" if dialect == "mssql" else "TEXT DEFAULT ''")
            )
        if "LastName" not in cols:
            additions.append(
                ("LastName", "NVARCHAR(100) NOT NULL DEFAULT ''" if dialect == "mssql" else "TEXT DEFAULT ''")
            )
        if "CompanyID" not in cols:
            additions.append(
                ("CompanyID", "UNIQUEIDENTIFIER NULL" if dialect == "mssql" else "TEXT")
            )
        if "IsActive" not in cols:
            additions.append(
                ("IsActive", "BIT DEFAULT 1" if dialect == "mssql" else "INTEGER DEFAULT 1")
            )
        if "CreatedAt" not in cols:
            additions.append(
                ("CreatedAt", "DATETIME DEFAULT GETDATE()" if dialect == "mssql" else "TEXT")
            )

        for name, col_type in additions:
            conn.execute(text(f'ALTER TABLE "Users" ADD "{name}" {col_type}'))

        cols_after = _table_columns(conn, "Users")
        if "FirstName" in cols_after and "PersonID" in cols_after:
            if dialect == "mssql":
                conn.execute(
                    text(
                        """
                        UPDATE u SET
                          u.FirstName = COALESCE(NULLIF(LTRIM(RTRIM(u.FirstName)), ''), p.FirstName),
                          u.LastName = COALESCE(NULLIF(LTRIM(RTRIM(u.LastName)), ''), p.LastName)
                        FROM Users u
                        INNER JOIN Persons p ON u.PersonID = p.PersonID
                        """
                    )
                )
            else:
                conn.execute(
                    text(
                        """
                        UPDATE Users SET
                          FirstName = COALESCE(NULLIF(TRIM(FirstName), ''), (
                            SELECT p.FirstName FROM Persons p WHERE p.PersonID = Users.PersonID
                          )),
                          LastName = COALESCE(NULLIF(TRIM(LastName), ''), (
                            SELECT p.LastName FROM Persons p WHERE p.PersonID = Users.PersonID
                          ))
                        WHERE PersonID IS NOT NULL
                        """
                    )
                )

        if dialect == "mssql" and "PersonID" in cols_after:
            try:
                conn.execute(
                    text(
                        """
                        IF EXISTS (
                          SELECT 1 FROM sys.columns c
                          JOIN sys.tables t ON c.object_id = t.object_id
                          WHERE t.name = 'Users' AND c.name = 'PersonID' AND c.is_nullable = 0
                        )
                        ALTER TABLE Users ALTER COLUMN PersonID UNIQUEIDENTIFIER NULL
                        """
                    )
                )
            except Exception:
                pass
