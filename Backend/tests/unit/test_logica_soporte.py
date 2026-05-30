from Backend.services.soporte_service import ServicioSoporte

def test_asignacion_prioridad_alta():
    svc = ServicioSoporte()
    # Probamos la regla de negocio
    prioridad = svc._asignar_prioridad("Técnico", "Tengo una caída total del sistema")
    assert prioridad == "High"

def test_asignacion_prioridad_baja():
    svc = ServicioSoporte()
    prioridad = svc._asignar_prioridad("General", "Consulta sobre mi cuenta")
    assert prioridad == "Low"