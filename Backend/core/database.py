import os

from sqlmodel import SQLModel, create_engine

from ..utils.sqlserver import sqlalchemy_database_url

DATABASE_URL = os.environ.get("DATABASE_URL", "").strip() or sqlalchemy_database_url()
engine = create_engine(DATABASE_URL, echo=os.environ.get("SQL_ECHO", "").lower() in ("1", "true", "yes"))

__all__ = ["SQLModel", "engine", "DATABASE_URL"]
