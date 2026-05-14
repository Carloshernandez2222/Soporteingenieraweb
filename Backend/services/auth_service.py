from __future__ import annotations

import hashlib
import os
import secrets
import sqlite3
import time
from typing import Any

from ..config_paths import DEFAULT_SQLITE_PATH
from ..constants import ROL_DEFECTO, normalizar_rol
from ..email_utils import validar_y_normalizar_correo

RESET_TOKENS: dict[str, tuple[str, float]] = {}
RESET_TTL_SEC = 3600


def _hash_password(password: str) -> str:
    salt = secrets.token_hex(16)
    dk = hashlib.pbkdf2_hmac("sha256", password.encode(), salt.encode(), 100_000)
    return f"{salt}${dk.hex()}"


def _verify_password(password: str, stored: str) -> bool:
    try:
        salt, hexhash = stored.split("$", 1)
    except ValueError:
        return False
    dk = hashlib.pbkdf2_hmac("sha256", password.encode(), salt.encode(), 100_000)
    return secrets.compare_digest(dk.hex(), hexhash)


class ServicioAuth:
    """Servicio / modelo de negocio: usuarios del panel (SQLite)."""

    def __init__(self, db_path: str | None = None):
        self.db_path = db_path or os.environ.get("DATABASE_PATH") or DEFAULT_SQLITE_PATH
        parent = os.path.dirname(self.db_path)
        if parent and not os.path.isdir(parent):
            try:
                os.makedirs(parent, exist_ok=True)
            except OSError:
                pass
        self._init_db()

    def _connect(self) -> sqlite3.Connection:
        return sqlite3.connect(self.db_path)

    def _init_db(self) -> None:
        conn = self._connect()
        conn.execute(
            """
            CREATE TABLE IF NOT EXISTS usuarios (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                email TEXT NOT NULL UNIQUE,
                password_hash TEXT NOT NULL,
                nombre TEXT NOT NULL,
                apellidos TEXT NOT NULL,
                created_at REAL NOT NULL,
                rol TEXT NOT NULL DEFAULT 'usuario'
            )
            """
        )
        conn.commit()
        conn.close()
        self._ensure_rol_column()

    def _ensure_rol_column(self) -> None:
        """Bases antiguas sin columna `rol`: la añadimos (editable luego con SQL manual)."""
        conn = self._connect()
        cur = conn.execute("PRAGMA table_info(usuarios)")
        cols = [r[1] for r in cur.fetchall()]
        if cols and "rol" not in cols:
            conn.execute(
                "ALTER TABLE usuarios ADD COLUMN rol TEXT NOT NULL DEFAULT 'usuario'"
            )
            conn.commit()
        conn.close()

    def _row_to_user(self, row: sqlite3.Row) -> dict[str, Any]:
        try:
            rol_raw = row["rol"]
        except (KeyError, IndexError):
            rol_raw = ROL_DEFECTO
        return {
            "id": str(row["id"]),
            "nombre": row["nombre"],
            "apellidos": row["apellidos"],
            "email": row["email"],
            "rol": normalizar_rol(rol_raw),
        }

    def registrar(
        self, nombre: str, apellidos: str, email: str, password: str
    ) -> dict[str, Any]:
        email_norm = validar_y_normalizar_correo(email)
        nombre_t = nombre.strip()
        apellidos_t = apellidos.strip()
        if not nombre_t or not apellidos_t:
            raise ValueError("Nombre y apellidos son obligatorios.")
        ph = _hash_password(password)
        now = time.time()
        conn = self._connect()
        try:
            conn.execute(
                """
                INSERT INTO usuarios (email, password_hash, nombre, apellidos, created_at)
                VALUES (?, ?, ?, ?, ?)
                """,
                (email_norm, ph, nombre_t, apellidos_t, now),
            )
            conn.commit()
            uid = conn.execute("SELECT last_insert_rowid()").fetchone()[0]
        except sqlite3.IntegrityError:
            raise ValueError("EMAIL_IN_USE") from None
        finally:
            conn.close()
        conn = self._connect()
        conn.row_factory = sqlite3.Row
        try:
            row = conn.execute("SELECT * FROM usuarios WHERE id = ?", (uid,)).fetchone()
        finally:
            conn.close()
        assert row is not None
        return self._row_to_user(row)

    def login(self, email: str, password: str) -> dict[str, Any]:
        email_norm = validar_y_normalizar_correo(email)
        conn = self._connect()
        conn.row_factory = sqlite3.Row
        row = conn.execute(
            "SELECT * FROM usuarios WHERE email = ?", (email_norm,)
        ).fetchone()
        conn.close()
        if row is None:
            raise LookupError("USER_NOT_FOUND")
        if not _verify_password(password, row["password_hash"]):
            raise PermissionError("INVALID_CREDENTIALS")
        return self._row_to_user(row)

    def usuario_por_email(self, email: str) -> sqlite3.Row | None:
        email_norm = validar_y_normalizar_correo(email)
        conn = self._connect()
        conn.row_factory = sqlite3.Row
        row = conn.execute(
            "SELECT id FROM usuarios WHERE email = ?", (email_norm,)
        ).fetchone()
        conn.close()
        return row

    def crear_token_reset(self, email: str) -> str:
        row = self.usuario_por_email(email)
        if row is None:
            raise LookupError("USER_NOT_FOUND")
        token = secrets.token_urlsafe(32)
        email_norm = validar_y_normalizar_correo(email)
        RESET_TOKENS[token] = (email_norm, time.time() + RESET_TTL_SEC)
        return token

    def restablecer_con_token(self, token: str, new_password: str) -> None:
        entry = RESET_TOKENS.pop(token, None)
        if entry is None:
            raise ValueError("TOKEN_INVALIDO")
        email_norm, exp = entry
        if time.time() > exp:
            raise ValueError("TOKEN_EXPIRADO")
        ph = _hash_password(new_password)
        conn = self._connect()
        cur = conn.execute(
            "UPDATE usuarios SET password_hash = ? WHERE email = ?", (ph, email_norm)
        )
        conn.commit()
        conn.close()
        if cur.rowcount == 0:
            raise LookupError("USER_NOT_FOUND")
