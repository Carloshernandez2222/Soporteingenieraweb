import os
import re
import sqlite3
import time

from ..config_paths import DEFAULT_SQLITE_PATH
from ..constants import MAX_DESCRIPCION_LEN, MAX_NOMBRE_LEN
from ..constants import normalizar_rol
from ..utils.email_utils import validar_y_normalizar_correo
from ..core.exceptions import CorreoInvalidoError, IssueInvalidoError, NombreInvalidoError
from ..patterns.observer import IObservador, ObservadorEmail, ObservadorLogs


class ServicioSoporte:
    """Servicio / modelo de negocio: persistencia de tickets en SQLite."""

    def __init__(self, db_path: str | None = None):
        self.db_path = db_path or os.environ.get("DATABASE_PATH") or DEFAULT_SQLITE_PATH
        self._observadores: list[IObservador] = [ObservadorLogs(), ObservadorEmail()]
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
                descripcion TEXT NOT NULL,
                categoria TEXT NOT NULL DEFAULT 'general',
                creado_por_rol TEXT NOT NULL DEFAULT 'usuario',
                created_at REAL NOT NULL DEFAULT 0
            )
            """
        )
        conn.commit()
        self._ensure_columns(conn)
        conn.close()

    def _ensure_columns(self, conn: sqlite3.Connection) -> None:
        cur = conn.execute("PRAGMA table_info(casos)")
        cols = {r[1] for r in cur.fetchall()}
        if "categoria" not in cols:
            conn.execute(
                "ALTER TABLE casos ADD COLUMN categoria TEXT NOT NULL DEFAULT 'general'"
            )
        if "creado_por_rol" not in cols:
            conn.execute(
                "ALTER TABLE casos ADD COLUMN creado_por_rol TEXT NOT NULL DEFAULT 'usuario'"
            )
        if "created_at" not in cols:
            conn.execute("ALTER TABLE casos ADD COLUMN created_at REAL NOT NULL DEFAULT 0")
        # Corregir datos antiguos: antes se rellenaba created_at con `id` (no es timestamp Unix).
        conn.execute(
            """
            UPDATE casos
            SET created_at = 0
            WHERE created_at > 0 AND created_at < 1000000000
            """
        )
        conn.commit()

    def suscribir(self, observador: IObservador) -> None:
        self._observadores.append(observador)

    def desuscribir(self, observador: IObservador) -> None:
        if observador in self._observadores:
            self._observadores.remove(observador)

    def notificar(self, evento: str, datos: dict) -> None:
        for obs in self._observadores:
            obs.actualizar(evento, datos)

    def registrar_caso(
        self,
        nombre: str,
        email: str,
        descripcion: str,
        categoria: str | None = None,
        creado_por_rol: str | None = None,
    ):
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
        categoria_limpia = (categoria or "").strip() or "general"
        rol_norm = normalizar_rol(creado_por_rol)
        created_at = time.time()

        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        cursor.execute(
            """
            INSERT INTO casos (nombre, email, descripcion, categoria, creado_por_rol, created_at)
            VALUES (?, ?, ?, ?, ?, ?)
            """,
            (
                nombre_limpio,
                email_norm,
                descripcion_limpia,
                categoria_limpia,
                rol_norm,
                created_at,
            ),
        )
        caso_id = cursor.lastrowid
        conn.commit()
        conn.close()

        self.notificar(
            "CASO_CREADO",
            {
                "caso_id": caso_id,
                "nombre": nombre_limpio,
                "email": email_norm,
                "categoria": categoria_limpia,
                "creado_por_rol": rol_norm,
            },
        )

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
            SELECT id, nombre, email, descripcion, categoria, creado_por_rol, created_at
            FROM casos
            WHERE email = ?
            ORDER BY id DESC
            """,
            (email_norm,),
        )
        filas = [dict(r) for r in cursor.fetchall()]
        conn.close()
        return filas

    def listar_todos_casos(self) -> list[dict]:
        """Listado global de tickets persistidos (más recientes primero)."""
        conn = sqlite3.connect(self.db_path)
        conn.row_factory = sqlite3.Row
        cursor = conn.cursor()
        cursor.execute(
            """
            SELECT id, nombre, email, descripcion, categoria, creado_por_rol, created_at
            FROM casos
            ORDER BY id DESC
            """
        )
        filas = [dict(r) for r in cursor.fetchall()]
        conn.close()
        return filas

    def listar_casos_por_email_y_nombre(self, email: str, nombre: str) -> list[dict]:
        """Tickets SQLite donde coinciden correo (normalizado) y nombre del solicitante (sin distinguir mayúsculas)."""
        email_norm = validar_y_normalizar_correo(email)
        nombre_limpio = (nombre or "").strip()
        if not nombre_limpio:
            raise NombreInvalidoError("El nombre no puede estar vacío.")
        if len(nombre_limpio) > MAX_NOMBRE_LEN:
            raise NombreInvalidoError(
                f"El nombre supera el máximo permitido ({MAX_NOMBRE_LEN} caracteres)."
            )
        if re.search(r"\d", nombre_limpio):
            raise NombreInvalidoError("El nombre no puede contener números.")

        conn = sqlite3.connect(self.db_path)
        conn.row_factory = sqlite3.Row
        cursor = conn.cursor()
        cursor.execute(
            """
            SELECT id, nombre, email, descripcion, categoria, creado_por_rol, created_at
            FROM casos
            WHERE email = ? AND LOWER(TRIM(nombre)) = LOWER(?)
            ORDER BY id DESC
            """,
            (email_norm, nombre_limpio),
        )
        filas = [dict(r) for r in cursor.fetchall()]
        conn.close()
        return filas

    def obtener_caso_sqlite_por_id(self, caso_id: int) -> dict | None:
        conn = sqlite3.connect(self.db_path)
        conn.row_factory = sqlite3.Row
        cursor = conn.cursor()
        cursor.execute(
            """
            SELECT id, nombre, email, descripcion, categoria, creado_por_rol, created_at
            FROM casos
            WHERE id = ?
            """,
            (caso_id,),
        )
        row = cursor.fetchone()
        conn.close()
        return dict(row) if row else None
