class CorreoInvalidoError(Exception):
    """Se lanza cuando el correo tiene un formato inválido"""
    pass

class NombreInvalidoError(Exception):
    """Se lanza cuando el nombre está vacío"""
    pass

class IssueInvalidoError(Exception):
    """Se lanza cuando la descripción está vacía"""
    pass
