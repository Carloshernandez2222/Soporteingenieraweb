import re
import sqlite3
import os
from src.core.exceptions import CorreoInvalidoError, NombreInvalidoError, IssueInvalidoError

class ServicioSoporte:
    def __init__(self):
        # Ruta absoluta para persistencia en Azure App Service
        self.db_path = "/home/site/wwwroot/soporte.db"
        
        # Creamos la tabla al instanciar la clase (se ejecuta una sola vez)
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS casos (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                nombre TEXT NOT NULL,
                email TEXT NOT NULL,
                descripcion TEXT NOT NULL
            )
        ''')
        conn.commit()
        conn.close()

    def registrar_caso(self, nombre: str, email: str, descripcion: str):
        # 1. Validación de Nombre
        if not nombre or not nombre.strip():
            raise NombreInvalidoError("El nombre no puede estar vacío.")

        # 2. Validación de Correo
        regex_correo = r'^[a-z0-9]+[\._]?[a-z0-9]+[@]\w+[.]\w+$'
        if not re.match(regex_correo, email):
            raise CorreoInvalidoError(f"El correo '{email}' no tiene un formato válido.")

        # 3. Validación de Issue
        if not descripcion or not descripcion.strip():
            raise IssueInvalidoError("La descripción del issue no puede estar vacía.")

        # Guardado en base de datos usando la ruta absoluta definida
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        cursor.execute(
            "INSERT INTO casos (nombre, email, descripcion) VALUES (?, ?, ?)",
            (nombre, email, descripcion)
        )
        conn.commit()
        conn.close()

        # Respuesta de éxito
        return {"status": "success", "msg": f"Caso registrado para {nombre} en la base de datos"}