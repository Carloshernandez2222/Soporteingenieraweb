"""Configuración y conexión a SQL Server (variables de entorno)."""

from __future__ import annotations

import os
from typing import Any
from urllib.parse import quote_plus


def _env(name: str, default: str = "") -> str:
    return os.environ.get(name, default).strip()


def _env_first(*names: str, default: str = "") -> str:
    """Acepta nombres de variables del repo y los de refactor-arquitectura (DB_*)."""
    for name in names:
        value = _env(name)
        if value:
            return value
    return default


def sqlserver_settings() -> dict[str, str]:
    host_raw = _env_first("DB_HOST", "SQLSERVER_HOST", default="127.0.0.1,1433")
    port = _env_first("DB_PORT", default="")
    if not port and "," in host_raw:
        _, port = host_raw.split(",", 1)
        port = port.strip()
    if not port:
        port = "1433"
    host = host_raw.split(",")[0].strip() or "127.0.0.1"
    return {
        "server": f"{host},{port}",
        "database": _env_first("DB_NAME", "SQLSERVER_DATABASE", default="TrackAidDB"),
        "username": _env_first("DB_USER", "SQLSERVER_USER", default="sa"),
        "password": _env_first("DB_PASSWORD", "SQLSERVER_PASSWORD", default=""),
        "driver": _env("SQLSERVER_DRIVER", "ODBC Driver 18 for SQL Server"),
        "encrypt": _env("SQLSERVER_ENCRYPT", "yes"),
        "trust_server_certificate": _env("SQLSERVER_TRUST_CERT", "yes"),
    }


def pyodbc_connection_string() -> str:
    s = sqlserver_settings()
    return (
        f"DRIVER={{{s['driver']}}};"
        f"SERVER={s['server']};"
        f"DATABASE={s['database']};"
        f"UID={s['username']};"
        f"PWD={s['password']};"
        f"Encrypt={s['encrypt']};"
        f"TrustServerCertificate={s['trust_server_certificate']};"
        "Connection Timeout=30;"
    )


def sqlalchemy_database_url() -> str:
    s = sqlserver_settings()
    user = quote_plus(s["username"])
    password = quote_plus(s["password"])
    driver = quote_plus(s["driver"])
    host = s["server"].split(",")[0]
    port = "1433"
    if "," in s["server"]:
        _, port_part = s["server"].split(",", 1)
        port = port_part.strip() or port
    encrypt = "yes" if s["encrypt"].lower() in ("yes", "true", "1") else "no"
    trust = "yes" if s["trust_server_certificate"].lower() in ("yes", "true", "1") else "no"
    return (
        f"mssql+pyodbc://{user}:{password}@{host}:{port}/{s['database']}"
        f"?driver={driver}&Encrypt={encrypt}&TrustServerCertificate={trust}"
    )


def obtener_conexion_sqlserver() -> Any:
    """Conexión directa pyodbc (scripts de diagnóstico)."""
    import pyodbc

    return pyodbc.connect(pyodbc_connection_string())
