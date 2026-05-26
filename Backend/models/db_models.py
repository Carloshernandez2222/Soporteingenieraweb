from sqlmodel import SQLModel, Field, Relationship
from uuid import UUID, uuid4
from datetime import datetime
from typing import Optional

class PersonDB(SQLModel, table=True):
    __tablename__ = "Persons"
    PersonID: UUID = Field(default_factory=uuid4, primary_key=True)
    FirstName: str
    LastName: str
    DocumentNumber: str = "N/A"

class UserDB(SQLModel, table=True):
    __tablename__ = "Users"
    UserID: UUID = Field(default_factory=uuid4, primary_key=True)
    Email: str = Field(unique=True, index=True)
    PasswordHash: str
    PersonID: UUID = Field(foreign_key="Persons.PersonID")
    person: PersonDB = Relationship()


class RoleDB(SQLModel, table=True):
    __tablename__ = "Roles"
    RoleID: UUID = Field(default_factory=uuid4, primary_key=True)
    RoleName: str
    Description: str | None = None
    IsActive: bool = Field(default=True)


class UserRoleDB(SQLModel, table=True):
    __tablename__ = "UserRoles"
    UserID: UUID = Field(foreign_key="Users.UserID", primary_key=True)
    RoleID: UUID = Field(foreign_key="Roles.RoleID", primary_key=True)
    IsActive: bool = Field(default=True)

class OrderDB(SQLModel, table=True):
    __tablename__ = "Orders"
    OrderID: UUID = Field(default_factory=uuid4, primary_key=True)
    UserID: UUID = Field(foreign_key="Users.UserID")
    TotalAmount: float
    OrderDate: datetime = Field(default_factory=datetime.utcnow)

class SupportCaseDB(SQLModel, table=True):
    __tablename__ = "SupportCases"
    CaseID: UUID = Field(default_factory=uuid4, primary_key=True)
    OrderID: Optional[UUID] = Field(default=None, foreign_key="Orders.OrderID")
    UserID: UUID = Field(foreign_key="Users.UserID")
    Description: Optional[str] = Field(default=None)
    CaseType: str
    Status: str = "Open"
    Priority: str = "Medium"
    CreatedAt: datetime = Field(default_factory=datetime.utcnow)