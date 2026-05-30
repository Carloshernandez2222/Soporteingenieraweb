import uuid
from datetime import datetime
from typing import Optional
from sqlmodel import SQLModel, Field

# Función auxiliar para hora UTC
def utc_now():
    return datetime.utcnow()

# --- MÓDULO DE EMPRESA ---
class CompanyDB(SQLModel, table=True):
    __tablename__ = "Companies"
    CompanyID: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    CompanyName: str = Field(max_length=255) # Asegúrate que sea CompanyName
    CompanyKey: str = Field(max_length=80, unique=True)
    IsActive: bool = Field(default=True)
    CreatedAt: datetime = Field(default_factory=utc_now)

# --- MÓDULO DE IDENTIDAD Y SEGURIDAD ---
class RoleDB(SQLModel, table=True):
    __tablename__ = "Roles"
    RoleID: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    RoleName: str = Field(max_length=50)
    Description: Optional[str] = None
    IsActive: bool = Field(default=True)

class UserRoleDB(SQLModel, table=True):
    __tablename__ = "UserRoles"
    UserID: uuid.UUID = Field(foreign_key="Users.UserID", primary_key=True)
    RoleID: uuid.UUID = Field(foreign_key="Roles.RoleID", primary_key=True)
    IsActive: bool = Field(default=True)

class UserDB(SQLModel, table=True):
    __tablename__ = "Users"
    UserID: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    Email: str = Field(index=True, unique=True)
    PasswordHash: str
    FirstName: str
    LastName: str
    CompanyID: Optional[uuid.UUID] = Field(default=None, foreign_key="Companies.CompanyID")
    IsActive: bool = Field(default=True)
    CreatedAt: datetime = Field(default_factory=utc_now)

# --- MÓDULO GEOGRÁFICO ---
class LocationDB(SQLModel, table=True):
    __tablename__ = "Locations"
    LocationID: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    UserID: Optional[uuid.UUID] = Field(default=None, foreign_key="Users.UserID")
    Address: Optional[str] = Field(default=None, max_length=255)
    City: Optional[str] = Field(default=None, max_length=100)
    State_Province: Optional[str] = Field(default=None, max_length=100)
    Country: Optional[str] = Field(default=None, max_length=100)
    IsActive: bool = Field(default=True)

# --- MÓDULO DE SOPORTE ---
class SupportCaseDB(SQLModel, table=True):
    __tablename__ = "SupportCases"
    CaseID: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    UserID: uuid.UUID = Field(foreign_key="Users.UserID")
    AssignedTo: Optional[uuid.UUID] = Field(default=None, foreign_key="Users.UserID")
    Description: str
    CaseType: Optional[str] = Field(default="General", max_length=50)
    Status: str = Field(default="Open", max_length=50)
    Priority: str = Field(default="Medium", max_length=50)
    IsActive: bool = Field(default=True)
    CreatedAt: datetime = Field(default_factory=utc_now)

class CaseHistoryDB(SQLModel, table=True):
    __tablename__ = "CaseHistory"
    LogID: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    CaseID: uuid.UUID = Field(foreign_key="SupportCases.CaseID")
    Status: Optional[str] = Field(default=None, max_length=50)
    Comment: str
    UpdatedBy: Optional[uuid.UUID] = Field(default=None, foreign_key="Users.UserID")
    IsActive: bool = Field(default=True)
    UpdatedAt: datetime = Field(default_factory=utc_now)

class ChatSessionDB(SQLModel, table=True):
    __tablename__ = "ChatSessions"
    SessionID: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    CaseID: uuid.UUID = Field(foreign_key="SupportCases.CaseID")
    IsActive: bool = Field(default=True)
    StartTime: datetime = Field(default_factory=utc_now)
    EndTime: Optional[datetime] = None

# --- MÓDULO DE CONFIGURACIÓN ---
class SystemParameterDB(SQLModel, table=True):
    __tablename__ = "SystemParameters"
    ParamID: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    KeyName: str = Field(max_length=100, unique=True)
    Value: Optional[str] = Field(default=None, max_length=255)
    IsActive: bool = Field(default=True)