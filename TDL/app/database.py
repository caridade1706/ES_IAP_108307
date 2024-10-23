import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from dotenv import load_dotenv

# Determine which environment file to load
env = os.getenv('ENV', 'development')
env_file = f'../.env/{env}.env'

# Load environment variables from file
if os.path.exists(env_file):
    load_dotenv(env_file)

# Retrieve credentials from environment variables
db_user = os.getenv('DB_USER', 'root')
db_password = os.getenv('DB_PASSWORD', 'password')
db_host = os.getenv('DB_HOST', 'localhost')
db_name = os.getenv('DB_NAME', 'db_todolist')
db_port = os.getenv('DB_PORT', '3306')

URL_DATABASE = f'mysql+pymysql://{db_user}:{db_password}@{db_host}:{db_port}/{db_name}'

print(f'URL_DATABASE: {URL_DATABASE}')

engine = create_engine(URL_DATABASE)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

# Dependência para obter uma sessão do banco de dados
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()