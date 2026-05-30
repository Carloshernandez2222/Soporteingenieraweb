import pytest
from sqlalchemy import create_engine
from sqlmodel import SQLModel, Session
from Backend.conection import test as app
from Backend.dependencies import get_engine

# Importar todos los modelos para que la metadata de SQLModel los reconozca
from Backend.models.db_models import (
    CompanyDB, RoleDB, UserRoleDB, UserDB, 
    LocationDB, SupportCaseDB, CaseHistoryDB, 
    ChatSessionDB, SystemParameterDB
)

# Motor de base de datos en memoria
sqlite_url = "sqlite:///:memory:"
engine = create_engine(sqlite_url, connect_args={"check_same_thread": False})

@pytest.fixture(name="session")
def session_fixture():
    # 1. Asegurar que las tablas existan en ESTE engine específico
    SQLModel.metadata.create_all(engine)
    
    # 2. Crear la sesión y cederla al test
    with Session(engine) as session:
        yield session
        
    # 3. Limpiar después del test
    SQLModel.metadata.drop_all(engine)

@pytest.fixture(name="client")
def client_fixture(session: Session):
    # Sobrescribir la dependencia de base de datos de la App
    # para que use la sesión que ya tiene las tablas creadas
    def get_session_override():
        return session
    
    app.dependency_overrides[get_engine] = get_session_override
    
    from fastapi.testclient import TestClient
    client = TestClient(app)
    yield client
    app.dependency_overrides.clear()