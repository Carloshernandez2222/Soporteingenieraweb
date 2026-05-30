"""Tickets de registro web/chatbot en SQLite (flujo legacy /registrar y /casos/sqlite)."""

from __future__ import annotations

import os
import re
import sqlite3
import time
from typing import Any

from ..config_paths import DEFAULT_SQLITE_PATH
from ..core.exceptions import (
    IssueInvalidoError,
    NombreInvalidoError,
    TicketSqliteNoEncontradoError,
)
from ..patterns.observer import IObservador, ObservadorEmail, ObservadorLogs
from ..utils.email_utils import validar_y_normalizar_correo


class ServicioRegistroSqlite:
    def __init__(self, db_path: str | None = None):
        self.db_path = db_path or os.environ.get("DATABASE_PATH") or DEFAULT_SQLITE_PATH
        self._observadores: list[IObservador] = [ObservadorLogs(), ObservadorEmail()]
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
            CREATE TABLE IF NOT EXISTS tickets_registro (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                nombre TEXT NOT NULL,
                email TEXT NOT NULL,
                descripcion TEXT NOT NULL,
                categoria TEXT NOT NULL DEFAULT 'general',
                creado_por_rol TEXT NOT NULL DEFAULT 'usuario',
                created_at REAL NOT NULL
            )
            """
        )
        conn.commit()
        conn.close()

    def _notificar(self, evento: str, datos: dict[str, Any]) -> None:
        for obs in self._observadores:
            obs.actualizar(evento, datos)

    def _validar_entrada(
        self,
        nombre: str,
        email: str,
        descripcion: str,
        *,
        origen_chatbot: bool = False,
    ) -> tuple[str, str, str]:
        nombre_t = (nombre or "").strip()
        if not nombre_t:
            nombre_t = "Usuario Chatbot" if origen_chatbot else ""
        if not nombre_t:
            raise NombreInvalidoError("El nombre no puede estar vacío.")
        if re.search(r"\d", nombre_t):
            if origen_chatbot:
                nombre_t = re.sub(r"\d+", " ", nombre_t).strip() or "Usuario Chatbot"
            else:
                raise NombreInvalidoError("El nombre no puede contener números.")
        descripcion_t = (descripcion or "").strip()
        if not descripcion_t:
            raise IssueInvalidoError("La descripción no puede estar vacía.")
        if origen_chatbot and len(descripcion_t) < 3:
            raise IssueInvalidoError("Cuéntanos un poco más sobre el problema.")
        email_norm = validar_y_normalizar_correo(email)
        return nombre_t, email_norm, descripcion_t

    def registrar_caso(
        self,
        nombre: str,
        email: str,
        descripcion: str,
        categoria: str | None = None,
        creado_por_rol: str = "usuario",
    ) -> dict[str, Any]:
        es_chatbot = (creado_por_rol or "").strip().lower() == "chatbot"
        nombre_t, email_norm, descripcion_t = self._validar_entrada(
            nombre, email, descripcion, origen_chatbot=es_chatbot
        )
        cat = (categoria or "general").strip() or "general"
        rol = (creado_por_rol or "usuario").strip() or "usuario"
        created = time.time()

        conn = self._connect()
        cur = conn.execute(
            """
            INSERT INTO tickets_registro (nombre, email, descripcion, categoria, creado_por_rol, created_at)
            VALUES (?, ?, ?, ?, ?, ?)
            """,
            (nombre_t, email_norm, descripcion_t, cat, rol, created),
        )
        conn.commit()
        caso_id = int(cur.lastrowid)
        conn.close()

        self._notificar(
            "CASO_CREADO",
            {"caso_id": caso_id, "email": email_norm, "categoria": cat, "creado_por_rol": rol},
        )
        msg = f"Ticket #{caso_id} registrado correctamente."
        return {
            "status": "success",
            "message": msg,
            "msg": msg,
            "caso_id": caso_id,
        }

    def _row_to_dict(self, row: sqlite3.Row) -> dict[str, Any]:
        return {
            "id": row["id"],
            "nombre": row["nombre"],
            "email": row["email"],
            "descripcion": row["descripcion"],
            "categoria": row["categoria"],
            "creado_por_rol": row["creado_por_rol"],
            "created_at": row["created_at"],
        }

    def listar_por_email(self, email: str) -> list[dict[str, Any]]:
        email_norm = validar_y_normalizar_correo(email)
        conn = self._connect()
        conn.row_factory = sqlite3.Row
        cur = conn.execute(
            """
            SELECT id, nombre, email, descripcion, categoria, creado_por_rol, created_at
            FROM tickets_registro
            WHERE email = ?
            ORDER BY id DESC
            """,
            (email_norm,),
        )
        out = [self._row_to_dict(r) for r in cur.fetchall()]
        conn.close()
        return out

    def listar_todos(self) -> list[dict[str, Any]]:
        conn = self._connect()
        conn.row_factory = sqlite3.Row
        cur = conn.execute(
            """
            SELECT id, nombre, email, descripcion, categoria, creado_por_rol, created_at
            FROM tickets_registro
            ORDER BY id DESC
            """
        )
        out = [self._row_to_dict(r) for r in cur.fetchall()]
        conn.close()
        return out

    def obtener_por_id(self, ticket_id: int) -> dict[str, Any]:
        conn = self._connect()
        conn.row_factory = sqlite3.Row
        row = conn.execute(
            """
            SELECT id, nombre, email, descripcion, categoria, creado_por_rol, created_at
            FROM tickets_registro
            WHERE id = ?
            """,
            (ticket_id,),
        ).fetchone()
        conn.close()
        if not row:
            raise TicketSqliteNoEncontradoError(f"No existe el ticket #{ticket_id}.")
        return self._row_to_dict(row)
