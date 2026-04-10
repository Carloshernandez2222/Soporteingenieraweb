import importlib

import pytest
from fastapi.testclient import TestClient

from src.rate_limit import reiniciar_limites_para_tests


@pytest.fixture
def client(tmp_path, monkeypatch):
    monkeypatch.setenv("DATABASE_PATH", str(tmp_path / "soporte_api.sqlite"))
    from src.dependencies import reiniciar_servicios

    reiniciar_servicios()
    import conection

    importlib.reload(conection)
    reiniciar_limites_para_tests()
    tc = TestClient(conection.test)
    yield tc
    reiniciar_limites_para_tests()


def test_crear_caso_temporal_ok(client):
    body = {
        "id": 42,
        "cliente": "Ana",
        "activo": True,
        "prioridad": 2.5,
        "categoria": "software",
    }
    r = client.post("/casos/crear", json=body)
    assert r.status_code == 200
    data = r.json()
    assert data["status"] == "success"
    assert data["data"]["id"] == 42


def test_crear_caso_id_duplicado(client):
    body = {
        "id": 7,
        "cliente": "Luis",
        "activo": True,
        "prioridad": 1.0,
        "categoria": "red",
    }
    assert client.post("/casos/crear", json=body).status_code == 200
    r2 = client.post("/casos/crear", json=body)
    assert r2.status_code == 409
    j = r2.json()
    assert j["status"] == "error"
    assert "message" in j


def test_buscar_caso_404(client):
    r = client.get("/casos/99999")
    assert r.status_code == 404
    j = r.json()
    assert j["status"] == "error"
    assert "message" in j


def test_buscar_caso_ok(client):
    body = {
        "id": 100,
        "cliente": "Bea",
        "activo": False,
        "prioridad": 5.0,
        "categoria": "hardware",
    }
    client.post("/casos/crear", json=body)
    r = client.get("/casos/100")
    assert r.status_code == 200
    assert r.json()["cliente"] == "Bea"


def test_422_formato_unificado(client):
    r = client.post("/casos/crear", json={"id": "no-es-int"})
    assert r.status_code == 422
    j = r.json()
    assert j["status"] == "error"
    assert "message" in j and len(j["message"]) > 0


def test_registrar_y_listar_sqlite(client):
    p = {"nombre": "Pedro", "email": "pedro@example.com", "descripcion": "Prueba API"}
    r = client.post("/registrar", params=p)
    assert r.status_code == 200
    j = r.json()
    assert j["status"] == "success"
    assert j["message"] == j["msg"]
    assert "caso_id" in j and isinstance(j["caso_id"], int)

    r2 = client.get("/casos/sqlite", params={"email": "pedro@example.com"})
    assert r2.status_code == 200
    lista = r2.json()["data"]
    assert len(lista) >= 1
    assert lista[0]["nombre"] == "Pedro"

    r3 = client.get(f"/casos/persistidos/{j['caso_id']}")
    assert r3.status_code == 200
    assert r3.json()["data"]["email"] == "pedro@example.com"

    r4 = client.get(
        "/casos/sqlite/por-solicitante",
        params={"email": "pedro@example.com", "nombre": "Pedro"},
    )
    assert r4.status_code == 200
    filtrada = r4.json()["data"]
    assert len(filtrada) >= 1
    assert filtrada[0]["nombre"] == "Pedro"

    r5 = client.get("/casos/sqlite/todos")
    assert r5.status_code == 200
    todos = r5.json()["data"]
    assert len(todos) >= 1
    assert any(x["email"] == "pedro@example.com" for x in todos)


def test_persistidos_404(client):
    r = client.get("/casos/persistidos/999999")
    assert r.status_code == 404
    assert r.json()["status"] == "error"


def test_openapi_no_roto_por_spa(client):
    assert client.get("/openapi.json").status_code == 200


def test_health_incluye_estado_frontend(client):
    r = client.get("/health")
    assert r.status_code == 200
    j = r.json()
    assert j["status"] == "ok"
    assert "frontend_index" in j and isinstance(j["frontend_index"], bool)
    assert "frontend_assets" in j and isinstance(j["frontend_assets"], bool)


def test_rate_limit_registrar(client):
    reiniciar_limites_para_tests()
    for i in range(15):
        r = client.post(
            "/registrar",
            params={
                "nombre": "Ana",
                "email": f"u{i}@example.com",
                "descripcion": "spam test",
            },
        )
        assert r.status_code == 200, r.text
    r16 = client.post(
        "/registrar",
        params={"nombre": "Ana", "email": "u99@example.com", "descripcion": "debe fallar"},
    )
    assert r16.status_code == 429
    assert r16.json()["status"] == "error"
