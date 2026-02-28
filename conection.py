from fastapi import FastAPI 

test = FastAPI() 

@test.get("/") 
def home(): 
    return {"mensaje": "Mi API está funcionando"} 

@test.get("/eventos") 
def listar_eventos(): 
    return {"eventos": ["CONIITI 2024", "Taller React", "Charla IA"]}   

# Aquí conectamos tu lógica de soporte a la API
@test.post("/registrar")
def registrar_caso_api(nombre: str, email: str, descripcion: str):
    try:
        resultado = servicio.registrar_caso(nombre, email, descripcion)
        return resultado
    except Exception as e:
        return {"status": "error", "message": str(e)}