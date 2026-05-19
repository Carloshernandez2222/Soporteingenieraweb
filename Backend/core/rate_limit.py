from collections import defaultdict
from time import time

from ..constants import REGISTRAR_RATE_LIMIT_MAX, REGISTRAR_RATE_LIMIT_WINDOW_SEC
from .exceptions import RateLimitExceededError

_hits_por_ip: dict[str, list[float]] = defaultdict(list)


def verificar_limite_registrar(ip: str) -> None:
    ahora = time()
    ventana_inicio = ahora - REGISTRAR_RATE_LIMIT_WINDOW_SEC
    lista = _hits_por_ip[ip]
    lista[:] = [t for t in lista if t > ventana_inicio]
    if len(lista) >= REGISTRAR_RATE_LIMIT_MAX:
        raise RateLimitExceededError(
            "Demasiados registros desde esta dirección en poco tiempo. "
            f"Intenta de nuevo en {REGISTRAR_RATE_LIMIT_WINDOW_SEC} segundos."
        )
    lista.append(ahora)


def reiniciar_limites_para_tests() -> None:
    """Solo para pruebas: vacía el contador en memoria."""
    _hits_por_ip.clear()
