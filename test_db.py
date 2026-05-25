from Backend.conection import obtener_conexion_sqlserver

try:
    print("Iniciando prueba de conexión...")
    conn = obtener_conexion_sqlserver()
    cursor = conn.cursor()
    cursor.execute("SELECT @@VERSION")
    version = cursor.fetchone()[0]
    
    print("\n✅ ¡CONEXIÓN EXITOSA A SQL SERVER!")
    print(f"Versión detectada:\n{version}\n")
    conn.close()
except Exception as e:
    print(f"\n❌ Error de conexión:\n{str(e)}")