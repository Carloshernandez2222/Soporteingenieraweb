"""Límites de entrada alineados entre API, validadores y formulario estático."""

from typing import Final

MAX_NOMBRE_LEN = 120
MAX_DESCRIPCION_LEN = 4000
MAX_EMAIL_LEN = 254  # RFC 5321

REGISTRAR_RATE_LIMIT_MAX = 15
REGISTRAR_RATE_LIMIT_WINDOW_SEC = 60

# Roles de panel (asignación manual en BD salvo `usuario` al registrarse por la web)
ROLES_USUARIO: Final[tuple[str, ...]] = ("webmaster", "soporte", "usuario")
ROLES_USUARIO_SET: Final[frozenset[str]] = frozenset(ROLES_USUARIO)
ROL_DEFECTO: Final[str] = "usuario"


def normalizar_rol(valor: str | None) -> str:
    """Si el valor en SQLite no es uno de los roles válidos, se trata como `usuario`."""
    r = (valor or "").strip().lower()
    return r if r in ROLES_USUARIO_SET else ROL_DEFECTO
