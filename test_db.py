from Backend.utils.sqlserver import obtener_conexion_sqlserver

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
    if "ODBC Driver 18" in str(e) and "file not found" in str(e):
        print(
            "\n→ Falta el driver del sistema (no basta con pip install pyodbc).\n"
            "  En Codespace ejecute:  bash scripts/codespace-setup.sh\n"
            "  O manualmente:         sudo ACCEPT_EULA=Y apt-get install -y msodbcsql18"
        )