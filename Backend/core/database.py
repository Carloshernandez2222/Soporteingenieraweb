from __future__ import annotations
import os
from pathlib import Path
from sqlmodel import SQLModel, create_engine
from dotenv import load_dotenv

# Ruta explícita al .env — funciona sin importar desde dónde se lanza uvicorn
load_dotenv(dotenv_path=Path(__file__).resolve().parent.parent.parent / ".env")

_engine = None

def get_engine():
    """Devuelve el engine singleton (lazy) forzando la conexión a SQL Server."""
    global _engine
    if _engine is None:
        # AQUI FORZAMOS LA CONEXIÓN PARA EVITAR CUALQUIER ERROR DE LECTURA DEL .ENV
        # Si tienes problemas, esta cadena está hardcodeada con la contraseña validada.
        url = (
            f"mssql+pyodbc://{os.environ['DB_USER']}:{os.environ['DB_PASSWORD']}"
            f"@{os.environ.get('DB_HOST','localhost')}:{os.environ.get('DB_PORT','1433')}"
            f"/{os.environ['DB_NAME']}?driver=ODBC+Driver+18+for+SQL+Server&TrustServerCertificate=yes"
        )
        
        try:
            _engine = create_engine(
                url,
                echo=os.environ.get("SQL_ECHO", "").lower() in ("1", "true", "yes"),
                pool_pre_ping=True
            )
            # Test de conexión rápido al crear el engine
            with _engine.connect() as conn:
                pass
        except Exception as e:
            print(f"ERROR CRÍTICO AL CONECTAR A SQL SERVER: {e}")
            raise e
            
    return _engine

def init_db() -> None:
    """Crea tablas SQLModel en SQL Server si no existen."""
    from ..models import db_models  # noqa: F401
    
    engine = get_engine()
    SQLModel.metadata.create_all(engine)