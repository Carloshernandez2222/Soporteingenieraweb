import pytest
import sys
import os

# Asegurar que el path esté bien
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '.')))

from Backend.conection import test as app  # Si tu instancia se llama 'app' en conection.py

def test_health_check():
    # Importante: usar 'app' directamente si es el cliente de FastAPI
    from fastapi.testclient import TestClient
    client = TestClient(app)
    response = client.get("/health")
    assert response.status_code == 200