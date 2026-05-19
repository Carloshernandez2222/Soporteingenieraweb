"""Casos tipo 'taller' (cliente, categoría, prioridad): persistidos en SQLite."""

from __future__ import annotations

import os
import sqlite3
import time
from typing import Any

from ..config_paths import DEFAULT_SQLITE_PATH
from ..core.exceptions import IdDuplicadoError
from ..patterns.composite import CasoHoja, TiendaComposite
from ..patterns.prototype import GestorPlantillas


class ServicioTaller:
    def __init__(self, db_path: str | None = None):
        self.db_path = db_path or os.environ.get("DATABASE_PATH") or DEFAULT_SQLITE_PATH
        self.gestor = GestorPlantillas()
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
            CREATE TABLE IF NOT EXISTS casos_taller (
                id INTEGER PRIMARY KEY,
                cliente TEXT NOT NULL,
                activo INTEGER NOT NULL CHECK (activo IN (0, 1)),
                prioridad REAL NOT NULL,
                categoria TEXT NOT NULL,
                created_at REAL NOT NULL DEFAULT 0
            )
            """
        )
        conn.commit()
        cur = conn.execute("PRAGMA table_info(casos_taller)")
        cols = {r[1] for r in cur.fetchall()}
        if "created_at" not in cols:
            conn.execute(
                "ALTER TABLE casos_taller ADD COLUMN created_at REAL NOT NULL DEFAULT 0"
            )
            conn.commit()
        # Corregir datos antiguos: antes se rellenaba created_at con `id` (no es timestamp Unix).
        conn.execute(
            """
            UPDATE casos_taller
            SET created_at = 0
            WHERE created_at > 0 AND created_at < 1000000000
            """
        )
        conn.commit()
        conn.close()

    def _row_to_dict(self, row: sqlite3.Row) -> dict[str, Any]:
        return {
            "id": row["id"],
            "cliente": row["cliente"],
            "activo": bool(row["activo"]),
            "prioridad": row["prioridad"],
            "categoria": row["categoria"],
            "created_at": row["created_at"],
        }

    def listar_todos(self) -> list[dict[str, Any]]:
        conn = self._connect()
        conn.row_factory = sqlite3.Row
        cur = conn.execute(
            """
            SELECT id, cliente, activo, prioridad, categoria, created_at
            FROM casos_taller
            ORDER BY id DESC
            """
        )
        out = [self._row_to_dict(r) for r in cur.fetchall()]
        conn.close()
        return out

    def crear(self, registro: dict[str, Any]) -> dict[str, Any]:
        llave_plantilla = str(registro.get("plantilla") or "default")
        clon = self.gestor.obtener_clon(llave_plantilla)
        clon.actualizar_datos(registro)
        base = clon.to_registro()
        nuevo = {
            "id": int(base["id"]),
            "cliente": base["cliente"],
            "activo": 1 if base["activo"] else 0,
            "prioridad": float(base["prioridad"]),
            "categoria": base["categoria"],
            "created_at": time.time(),
        }
        conn = self._connect()
        try:
            conn.execute(
                """
                INSERT INTO casos_taller (id, cliente, activo, prioridad, categoria, created_at)
                VALUES (?, ?, ?, ?, ?, ?)
                """,
                (
                    nuevo["id"],
                    nuevo["cliente"],
                    nuevo["activo"],
                    nuevo["prioridad"],
                    nuevo["categoria"],
                    nuevo["created_at"],
                ),
            )
            conn.commit()
        except sqlite3.IntegrityError:
            conn.close()
            raise IdDuplicadoError(
                f"Ya existe un caso con el id {nuevo['id']}."
            ) from None
        conn.close()
        return {**nuevo, "activo": bool(nuevo["activo"])}

    def obtener_por_id(self, caso_id: int) -> dict[str, Any] | None:
        conn = self._connect()
        conn.row_factory = sqlite3.Row
        row = conn.execute(
            """
            SELECT id, cliente, activo, prioridad, categoria, created_at
            FROM casos_taller
            WHERE id = ?
            """,
            (caso_id,),
        ).fetchone()
        conn.close()
        return self._row_to_dict(row) if row else None

    def filtrar_por_categoria(self, categoria: str | None) -> list[dict[str, Any]]:
        conn = self._connect()
        conn.row_factory = sqlite3.Row
        if categoria and categoria.strip():
            cat = categoria.strip().lower()
            cur = conn.execute(
                """
                SELECT id, cliente, activo, prioridad, categoria, created_at FROM casos_taller
                WHERE LOWER(categoria) = ?
                ORDER BY id DESC
                """,
                (cat,),
            )
        else:
            cur = conn.execute(
                """
                SELECT id, cliente, activo, prioridad, categoria, created_at
                FROM casos_taller
                ORDER BY id DESC
                """
            )
        out = [self._row_to_dict(r) for r in cur.fetchall()]
        conn.close()
        return out

    def metricas_jerarquicas(self) -> dict[str, Any]:
        """Composite: agrupa casos por cliente (tienda) y calcula métricas globales."""
        casos = self.listar_todos()
        raiz = TiendaComposite("TrackAid Global")
        tiendas: dict[str, TiendaComposite] = {}

        for registro in casos:
            cliente = str(registro["cliente"])
            if cliente not in tiendas:
                nodo = TiendaComposite(cliente)
                tiendas[cliente] = nodo
                raiz.agregar(nodo)
            tiendas[cliente].agregar(CasoHoja.from_dict(registro))

        return {
            "total_casos": raiz.obtener_total_casos(),
            "prioridad_promedio_global": raiz.obtener_prioridad_promedio(),
            "tiendas": [
                {
                    "nombre": t.nombre,
                    "total_casos": t.obtener_total_casos(),
                    "prioridad_promedio": t.obtener_prioridad_promedio(),
                }
                for t in tiendas.values()
            ],
        }
