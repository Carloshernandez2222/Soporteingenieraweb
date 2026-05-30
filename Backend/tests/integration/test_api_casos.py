import uuid # Importante
from sqlmodel import Session
from Backend.models.db_models import UserDB

def test_crear_caso_exitoso(client, session: Session):
    # 1. Crear un usuario dummy convirtiendo el ID a objeto UUID
    user_id_val = uuid.UUID("550e8400-e29b-41d4-a716-446655440000")
    
    dummy_user = UserDB(
        UserID=user_id_val,
        Email="test@empresa.com",
        PasswordHash="hash",
        FirstName="Test",
        LastName="User",
        DocumentNumber="12345"
    )
    session.add(dummy_user)
    session.commit()

    # 2. Hacer el POST
    payload = {
        "user_id": str(user_id_val), # El payload JSON debe enviar el string
        "descripcion": "Mi internet no funciona",
        "case_type": "Falla"
    }
    response = client.post("/api/casos/soporte", json=payload)
    
    # 3. Validar
    # Si todo va bien, deberías obtener un 200 o 201
    assert response.status_code in [200, 201]