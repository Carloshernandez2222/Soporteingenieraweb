import pytest
from sqlmodel import Session, SQLModel, create_engine
from sqlalchemy import StaticPool
from Backend.conection import test as app
import Backend.core.database as db_module
from Backend.services.soporte_service import ServicioSoporte
from Backend.models.db_models import *

sqlite_url = "sqlite:///:memory:"
engine = create_engine(
    sqlite_url, 
    connect_args={"check_same_thread": False},
    poolclass=StaticPool
)

@pytest.fixture(autouse=True)
def setup_db(monkeypatch):
    monkeypatch.setattr(db_module, "get_engine", lambda: engine)
    SQLModel.metadata.create_all(engine)
    yield
    SQLModel.metadata.drop_all(engine)

@pytest.fixture(name="session")
def session_fixture():
    with Session(engine) as session:
        yield session

@pytest.fixture(name="client")
def client_fixture():
    from fastapi.testclient import TestClient
    return TestClient(app)