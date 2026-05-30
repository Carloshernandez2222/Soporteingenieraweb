"""Tests de humo (raíz Backend/test, compatible con rama refactor-arquitectura)."""

from fastapi.testclient import TestClient

from Backend.conection import test as app


def test_import_app():
    assert app is not None


def test_health():
    client = TestClient(app)
    assert client.get("/health").status_code == 200


def test_reporte_template():
    client = TestClient(app)
    res = client.get("/api/casos/reporte-pdf")
    assert res.status_code == 200
    assert "Reporte del Sistema" in res.text
