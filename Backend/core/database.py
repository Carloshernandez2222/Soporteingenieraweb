# Cambia esta línea:
# from sqlmodel import create_sql_engine, SQLModel

# Por esta línea:
from sqlmodel import create_engine, SQLModel

# Y donde tenías engine = create_sql_engine(...) usa:
DATABASE_URL = "mssql+pyodbc://sa:TrackAid_Secure2026!@127.0.0.1:1433/TrackAidDB?driver=ODBC+Driver+18+for+SQL+Server&Encrypt=yes&TrustServerCertificate=yes"

engine = create_engine(DATABASE_URL, echo=True)