"""Excepciones de dominio para compañías y administración."""


class CompanyNotFoundError(Exception):
    pass


class CompanyKeyInUseError(Exception):
    pass


class CompanyInactiveError(Exception):
    pass
