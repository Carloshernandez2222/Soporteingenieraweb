import pytest
from src.RegisterRequest import ServicioSoporte
from src.exceptions import CorreoInvalidoError, NombreInvalidoError, IssueInvalidoError

@pytest.fixture
def servicio():
    return ServicioSoporte()

@pytest.mark.parametrize("nombre, email, descripcion, escenario", [
    # --- CASOS DE ÉXITO ---
    ("Mateo", "mateo@example.com", "Falla en el login", "1. Registro estándar"),
    ("Admin", "admin.soporte@empresa.org", "Error 404 en /api", "2. Datos técnicos"),
    ("Juan", "juan123@gmail.com", "Consulta", "3. Usuario común"),
    ("M", "m@do.co", "Prueba", "4. Longitud mínima"),

    # --- CASOS DE ERROR: NOMBRE ---
    ("", "test@mail.com", "Desc válida", "5. Nombre vacío"),
    ("   ", "test@mail.com", "Desc válida", "6. Nombre espacios"),

    # --- CASOS DE ERROR: EMAIL ---
    ("Mateo", "correo-sin-arroba", "Desc válida", "7. Email sin formato"),
    ("Mateo", "mateo@dominio", "Desc válida", "8. Email sin punto"),
    ("Mateo", "mateo!#$@mail.com", "Desc válida", "9. Caracteres prohibidos"),
    ("Mateo", "@nomail.com", "Desc válida", "10. Sin usuario"),

    # --- CASOS DE ERROR: DESCRIPCIÓN ---
    ("Mateo", "mateo@mail.com", "", "11. Descripción vacía"),
    ("Mateo", "mateo@mail.com", "   ", "12. Descripción espacios"),
])
def test_validador_12_casos(servicio, nombre, email, descripcion, escenario):
    try:
        resultado = servicio.registrar_caso(nombre, email, descripcion)
        assert resultado["status"] == "success"
        print(f"\n[ÉXITO] {escenario}: Registro realizado.")
    except (NombreInvalidoError, CorreoInvalidoError, IssueInvalidoError) as e:
        print(f"\n[RECHAZADO] {escenario}: {type(e).__name__} capturado.")
