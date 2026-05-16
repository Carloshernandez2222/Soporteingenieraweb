from email_validator import EmailNotValidError, validate_email

from .constants import MAX_EMAIL_LEN
from .core.exceptions import CorreoInvalidoError


def validar_y_normalizar_correo(raw: str) -> str:
    """
    Normaliza y valida el correo (sin comprobar entregabilidad DNS).
    Devuelve forma normalizada (p. ej. dominio en minúsculas).
    """
    s = (raw or "").strip()
    if not s:
        raise CorreoInvalidoError("El correo no puede estar vacío.")
    if len(s) > MAX_EMAIL_LEN:
        raise CorreoInvalidoError(
            f"El correo supera el máximo permitido ({MAX_EMAIL_LEN} caracteres)."
        )
    try:
        info = validate_email(s, check_deliverability=False)
        return info.normalized
    except EmailNotValidError:
        raise CorreoInvalidoError("El correo no tiene un formato válido.") from None
