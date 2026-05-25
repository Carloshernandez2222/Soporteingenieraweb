"""
Punto de entrada histórico (Azure/Gunicorn: `conection:test`).

La aplicación se ensambla en `Backend.app_factory` con patrón MVC.
Ahora también centraliza la conexión principal a la base de datos SQL Server.
"""

import pyodbc
from Backend.app_factory import create_app

# 1. Inicialización de la aplicación FastAPI (ASGI)
test = create_app()

# 2. Configuración de la conexión a SQL Server (Local con Docker)
def obtener_conexion_sqlserver():
    """
    Establece la conexión con el contenedor local de SQL Server apuntando a TrackAidDB.
    """
    server = '127.0.0.1,1433' 
    database = 'TrackAidDB'
    username = 'sa'
    password = 'TrackAid_Secure2026!'
    driver = '{ODBC Driver 18 for SQL Server}'
    
    # TrustServerCertificate=yes es indispensable para conexiones locales sin SSL firmado
    connection_string = f'DRIVER={driver};SERVER={server};DATABASE={database};UID={username};PWD={password};Encrypt=yes;TrustServerCertificate=yes;Connection Timeout=30;'
    
    try:
        conn = pyodbc.connect(connection_string)
        return conn
    except Exception as e:
        print(f"❌ Error conectando a SQL Server: {e}")
        raise
