import re
from .exceptions import CorreoInvalidoError, NombreInvalidoError, IssueInvalidoError

class ServicioSoporte:
    def registrar_caso(self, nombre: str, email: str, descripcion: str):
        # 1. Validación de Nombre
        if not nombre or not nombre.strip():
            raise NombreInvalidoError("El nombre no puede estar vacío.")

        # 2. Validación de Correo (Regex corregido a 0-9)
        regex_correo = r'^[a-z0-9]+[\._]?[a-z0-9]+[@]\w+[.]\w+$'
        if not re.match(regex_correo, email):
            raise CorreoInvalidoError(f"El correo '{email}' no tiene un formato válido.")

        # 3. Validación de Issue
        if not descripcion or not descripcion.strip():
            raise IssueInvalidoError("La descripción del issue no puede estar vacía.")

        # Respuesta de éxito
        return {"status": "success", "msg": f"Caso registrado para {nombre}"}
