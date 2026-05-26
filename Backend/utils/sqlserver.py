"""Conexión directa pyodbc a SQL Server (solo desarrollo local con Docker)."""


def obtener_conexion_sqlserver():
    """
    Establece la conexión con el contenedor local de SQL Server apuntando a TrackAidDB.
    Requiere `pyodbc` y ODBC Driver 18 for SQL Server instalados.
    """
    import pyodbc

    server = "127.0.0.1,1433"
    database = "TrackAidDB"
    username = "sa"
    password = "TrackAid_Secure2026!"
    driver = "{ODBC Driver 18 for SQL Server}"

    connection_string = (
        f"DRIVER={driver};SERVER={server};DATABASE={database};UID={username};"
        f"PWD={password};Encrypt=yes;TrustServerCertificate=yes;Connection Timeout=30;"
    )

    return pyodbc.connect(connection_string)
