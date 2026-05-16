class CorreoInvalidoError(Exception):
    """Se lanza cuando el correo tiene un formato inválido"""
    pass

class NombreInvalidoError(Exception):
    """Se lanza cuando el nombre está vacío o no cumple las reglas (p. ej. números)"""
    pass

class IdDuplicadoError(Exception):
    """Se lanza cuando se intenta registrar un id que ya existe en la lista temporal"""
    pass

class IssueInvalidoError(Exception):
    """Se lanza cuando la descripción está vacía"""
    pass


class RateLimitExceededError(Exception):
    """Demasiadas peticiones a /registrar desde la misma IP en la ventana configurada."""
    pass


class CasoNoEncontradoError(Exception):
    """No hay caso temporal con el id solicitado."""
    pass


class TicketSqliteNoEncontradoError(Exception):
    """No hay fila en SQLite con el id de ticket solicitado."""
    pass
