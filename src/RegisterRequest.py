import os
import re
import sqlite3

from .constants import MAX_DESCRIPCION_LEN, MAX_NOMBRE_LEN
from .email_utils import validar_y_normalizar_correo
from .exceptions import CorreoInvalidoError, IssueInvalidoError, NombreInvalidoError


class ServicioSoporte:
    def __init__(self, db_path: str | None = None):
        self.db_path = db_path or os.environ.get(
            "DATABASE_PATH", "/home/site/wwwroot/soporte.db"
        )
        parent = os.path.dirname(self.db_path)
        if parent and not os.path.isdir(parent):
            try:
                os.makedirs(parent, exist_ok=True)
            except OSError:
                pass

        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        cursor.execute(
            """
            CREATE TABLE IF NOT EXISTS casos (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                nombre TEXT NOT NULL,
                email TEXT NOT NULL,
                descripcion TEXT NOT NULL
            )
            """
        )
        conn.commit()
        conn.close()

    def registrar_caso(self, nombre: str, email: str, descripcion: str):
        nombre_limpio = (nombre or "").strip()
        descripcion_limpia = (descripcion or "").strip()

        if not nombre_limpio:
            raise NombreInvalidoError("El nombre no puede estar vacío.")
        if len(nombre_limpio) > MAX_NOMBRE_LEN:
            raise NombreInvalidoError(
                f"El nombre supera el máximo permitido ({MAX_NOMBRE_LEN} caracteres)."
            )
        if re.search(r"\d", nombre_limpio):
            raise NombreInvalidoError("El nombre no puede contener números.")

        email_norm = validar_y_normalizar_correo(email)

        if not descripcion_limpia:
            raise IssueInvalidoError("La descripción del issue no puede estar vacía.")
        if len(descripcion_limpia) > MAX_DESCRIPCION_LEN:
            raise IssueInvalidoError(
                f"La descripción supera el máximo permitido ({MAX_DESCRIPCION_LEN} caracteres)."
            )

        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        cursor.execute(
            "INSERT INTO casos (nombre, email, descripcion) VALUES (?, ?, ?)",
            (nombre_limpio, email_norm, descripcion_limpia),
        )
        caso_id = cursor.lastrowid
        conn.commit()
        conn.close()

        texto = f"Caso registrado para {nombre_limpio} en la base de datos (ticket #{caso_id})."
        return {
            "status": "success",
            "message": texto,
            "msg": texto,
            "caso_id": caso_id,
        }

    def listar_casos_por_email(self, email: str) -> list[dict]:
        email_norm = validar_y_normalizar_correo(email)
        conn = sqlite3.connect(self.db_path)
        conn.row_factory = sqlite3.Row
        cursor = conn.cursor()
        cursor.execute(
            """
            SELECT id, nombre, email, descripcion
            FROM casos
            WHERE email = ?
            ORDER BY id DESC
            """,
            (email_norm,),
        )
        filas = [dict(r) for r in cursor.fetchall()]
        conn.close()
        return filas

    def obtener_caso_sqlite_por_id(self, caso_id: int) -> dict | None:
        conn = sqlite3.connect(self.db_path)
        conn.row_factory = sqlite3.Row
        cursor = conn.cursor()
        cursor.execute(
            "SELECT id, nombre, email, descripcion FROM casos WHERE id = ?",
            (caso_id,),
        )
        row = cursor.fetchone()
        conn.close()
        return dict(row) if row else None
