-- Migración idempotente: Users con FirstName/LastName (modelo unificado).
-- Ejecutar en TrackAidDB si los POST fallan tras unificar la BD.
USE TrackAidDB;
GO

IF COL_LENGTH('Users', 'FirstName') IS NULL
  ALTER TABLE Users ADD FirstName NVARCHAR(100) NOT NULL CONSTRAINT DF_Users_FirstName DEFAULT '';
GO
IF COL_LENGTH('Users', 'LastName') IS NULL
  ALTER TABLE Users ADD LastName NVARCHAR(100) NOT NULL CONSTRAINT DF_Users_LastName DEFAULT '';
GO
IF COL_LENGTH('Users', 'CompanyID') IS NULL
  ALTER TABLE Users ADD CompanyID UNIQUEIDENTIFIER NULL REFERENCES Companies(CompanyID);
GO

UPDATE u
SET
  u.FirstName = COALESCE(NULLIF(LTRIM(RTRIM(u.FirstName)), ''), p.FirstName),
  u.LastName = COALESCE(NULLIF(LTRIM(RTRIM(u.LastName)), ''), p.LastName)
FROM Users u
INNER JOIN Persons p ON u.PersonID = p.PersonID
WHERE u.PersonID IS NOT NULL;
GO

IF EXISTS (
  SELECT 1 FROM sys.columns
  WHERE object_id = OBJECT_ID('Users') AND name = 'PersonID' AND is_nullable = 0
)
  ALTER TABLE Users ALTER COLUMN PersonID UNIQUEIDENTIFIER NULL;
GO

-- Companies: nombres de columna Fase 2
IF COL_LENGTH('Companies', 'CompanyName') IS NULL AND COL_LENGTH('Companies', 'Name') IS NOT NULL
  EXEC sp_rename 'Companies.Name', 'CompanyName', 'COLUMN';
GO
IF COL_LENGTH('Companies', 'CompanyKey') IS NULL AND COL_LENGTH('Companies', 'Nit') IS NOT NULL
  EXEC sp_rename 'Companies.Nit', 'CompanyKey', 'COLUMN';
GO

IF COL_LENGTH('SupportCases', 'CompanyID') IS NULL
  ALTER TABLE SupportCases ADD CompanyID UNIQUEIDENTIFIER NULL REFERENCES Companies(CompanyID);
GO
IF COL_LENGTH('SupportCases', 'AssignedTo') IS NULL
  ALTER TABLE SupportCases ADD AssignedTo UNIQUEIDENTIFIER NULL REFERENCES Users(UserID);
GO
IF COL_LENGTH('SupportCases', 'IsActive') IS NULL
  ALTER TABLE SupportCases ADD IsActive BIT DEFAULT 1;
GO

PRINT 'Migración unificada aplicada.';
