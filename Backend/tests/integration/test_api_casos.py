import uuid
from Backend.models.db_models import UserDB

def test_crear_caso_exitoso(client, session):
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

    payload = {
        "user_id": str(user_id_val),
        "descripcion": "Mi internet no funciona",
        "case_type": "Falla"
    }
    response = client.post("/api/casos/soporte", json=payload)
    
    assert response.status_code in [200, 201], response.text