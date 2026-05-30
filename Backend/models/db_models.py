from datetime import datetime
from typing import Optional
from uuid import UUID, uuid4

from sqlmodel import Field, SQLModel


def utc_now() -> datetime:
    return datetime.utcnow()


class PersonDB(SQLModel, table=True):
    """Legacy: solo lectura si existen filas antiguas vinculadas por PersonID."""

    __tablename__ = "Persons"
    PersonID: UUID = Field(default_factory=uuid4, primary_key=True)
    FirstName: str
    LastName: str
    DocumentNumber: str = "N/A"


class CompanyDB(SQLModel, table=True):
    __tablename__ = "Companies"
    CompanyID: UUID = Field(default_factory=uuid4, primary_key=True)
    CompanyName: str = Field(max_length=255)
    CompanyKey: str = Field(max_length=80, unique=True, index=True)
    IsActive: bool = Field(default=True)
    CreatedAt: datetime = Field(default_factory=utc_now)


class UserDB(SQLModel, table=True):
    __tablename__ = "Users"
    UserID: UUID = Field(default_factory=uuid4, primary_key=True)
    Email: str = Field(unique=True, index=True)
    PasswordHash: str
    FirstName: str = Field(max_length=100)
    LastName: str = Field(max_length=100)
    CompanyID: Optional[UUID] = Field(default=None, foreign_key="Companies.CompanyID")
    IsActive: bool = Field(default=True)
    CreatedAt: datetime = Field(default_factory=utc_now)


class UserCompanyDB(SQLModel, table=True):
    __tablename__ = "UserCompanies"
    UserID: UUID = Field(foreign_key="Users.UserID", primary_key=True)
    CompanyID: UUID = Field(foreign_key="Companies.CompanyID", primary_key=True)
    IsPrimary: bool = Field(default=True)
    IsActive: bool = Field(default=True)


class RoleDB(SQLModel, table=True):
    __tablename__ = "Roles"
    RoleID: UUID = Field(default_factory=uuid4, primary_key=True)
    RoleName: str = Field(max_length=50)
    Description: Optional[str] = None
    IsActive: bool = Field(default=True)


class UserRoleDB(SQLModel, table=True):
    __tablename__ = "UserRoles"
    UserID: UUID = Field(foreign_key="Users.UserID", primary_key=True)
    RoleID: UUID = Field(foreign_key="Roles.RoleID", primary_key=True)
    IsActive: bool = Field(default=True)


class LocationDB(SQLModel, table=True):
    __tablename__ = "Locations"
    LocationID: UUID = Field(default_factory=uuid4, primary_key=True)
    UserID: Optional[UUID] = Field(default=None, foreign_key="Users.UserID")
    Address: Optional[str] = Field(default=None, max_length=255)
    City: Optional[str] = Field(default=None, max_length=100)
    State_Province: Optional[str] = Field(default=None, max_length=100)
    Country: Optional[str] = Field(default=None, max_length=100)
    IsActive: bool = Field(default=True)


class OrderDB(SQLModel, table=True):
    __tablename__ = "Orders"
    OrderID: UUID = Field(default_factory=uuid4, primary_key=True)
    UserID: UUID = Field(foreign_key="Users.UserID")
    TotalAmount: float = 0.0
    OrderDate: datetime = Field(default_factory=utc_now)


class SupportCaseDB(SQLModel, table=True):
    __tablename__ = "SupportCases"
    CaseID: UUID = Field(default_factory=uuid4, primary_key=True)
    OrderID: Optional[UUID] = Field(default=None, foreign_key="Orders.OrderID")
    UserID: UUID = Field(foreign_key="Users.UserID")
    CompanyID: Optional[UUID] = Field(default=None, foreign_key="Companies.CompanyID")
    AssignedTo: Optional[UUID] = Field(default=None, foreign_key="Users.UserID")
    Description: Optional[str] = Field(default=None)
    CaseType: str = Field(default="General", max_length=50)
    Status: str = Field(default="Open", max_length=50)
    Priority: str = Field(default="Medium", max_length=50)
    IsActive: bool = Field(default=True)
    CreatedAt: datetime = Field(default_factory=utc_now)


class CaseHistoryDB(SQLModel, table=True):
    __tablename__ = "CaseHistory"
    LogID: UUID = Field(default_factory=uuid4, primary_key=True)
    CaseID: UUID = Field(foreign_key="SupportCases.CaseID")
    Status: Optional[str] = Field(default=None, max_length=50)
    Comment: Optional[str] = Field(default=None)
    UpdatedBy: Optional[UUID] = Field(default=None, foreign_key="Users.UserID")
    IsActive: bool = Field(default=True)
    UpdatedAt: datetime = Field(default_factory=utc_now)
