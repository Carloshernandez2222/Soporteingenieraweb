import pytest
from sqlalchemy import create_engine
from sqlmodel import SQLModel, Session
from Backend.conection import test as app
from Backend.dependencies import get_engine

# IMPORTANTE: Importa los modelos ANTES de crear nada
from Backend.models import db_models

sqlite_url = "sqlite:///:memory:"
engine = create_engine(sqlite_url, connect_args={"check_same_thread": False})

@pytest.fixture(name="session")
def session_fixture():
    # 1. Limpiar metadata global de SQLModel para evitar conflictos
    SQLModel.metadata.clear()
    
    # 2. Registrar las tablas desde el módulo db_models
    # Esto asegura que se use la versión actual que tiene CompanyID
    SQLModel.metadata.create_all(engine)
    
    with Session(engine) as session:
        yield session
    
    # 3. Limpiar tras el test
    SQLModel.metadata.drop_all(engine)

@pytest.fixture(name="client")
def client_fixture(session: Session):
    # Sobrescribir dependencia para usar la sesión del test
    app.dependency_overrides[get_engine] = lambda: session
    
    from fastapi.testclient import TestClient
    client = TestClient(app)
    
    yield client
    
    app.dependency_overrides.clear()