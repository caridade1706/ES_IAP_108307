# conftest.py
import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine, inspect
from sqlalchemy.orm import sessionmaker
from app.main import app
from app.database import Base, get_db
from app.models import User
from app.routes.user_routes import get_current_user

# In-memory SQLite database for testing
DATABASE_URL = "sqlite:///:memory:"
engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Override the dependency for the database session in testing
@pytest.fixture(scope="module")
def db():
    # Create the tables in the in-memory database
    Base.metadata.create_all(bind=engine)
    db = TestingSessionLocal()
    yield db
    db.close()

@pytest.fixture(scope="module")
def client():
    Base.metadata.create_all(bind=engine)
    # Mock the get_current_user_info dependency to simulate an authenticated user
    def mock_get_current_user_info():
        return {"sub": "test_user_id"}  # Mock user_id as "test_user_id"
    
    app.dependency_overrides[get_db] = lambda: TestingSessionLocal()
    app.dependency_overrides[get_current_user] = mock_get_current_user_info
    with TestClient(app) as c:
        yield c
