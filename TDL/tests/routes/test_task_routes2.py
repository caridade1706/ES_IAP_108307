import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from unittest.mock import patch
from app.main import app
from app.database import Base, get_db, SessionLocal
from app.models import User
from TDL.app.services.auth_service import validate_token  # Ensure this is the correct path
from TDL.app.routes.auth_routes import get_current_user_info

client = TestClient(app)

# Mock function to simulate Cognito user info
def mock_get_current_user_info(user_id: str):
    return {"sub": user_id}

# Fixture to create a clean test database
@pytest.fixture
def test_db():
    # Create tables in the database
    db = SessionLocal()
    Base.metadata.drop_all(bind=db.get_bind())
    Base.metadata.create_all(bind=db.get_bind())
    try:
        yield db
    finally:
        db.rollback()
        db.close()

# Helper function to create a user in the test database
def create_specific_user(db, user_id, email, name):
    existing_user = db.query(User).filter(User.cognito_id == user_id).first()
    if not existing_user:
        user = User(cognito_id=user_id, email=email, name=name)
        db.add(user)
        db.commit()
        return user
    return existing_user

# Test function to create a task for a specific user
def test_create_task(client, test_db):
    # Specify the UUID for User A
    user_id = "90cca98c-7041-70f8-3298-479881cae008"
    user_email = "user@example.com"
    user_name = "Test User"

    # Create User A in the test database
    create_specific_user(test_db, user_id=user_id, email=user_email, name=user_name)

    # Task data for the POST request
    task_data = {
        "title": "Sample Task",
        "description": "This is a test task",
        "priority": "Medium",
        "deadline": "2024-12-31T23:59:00"
    }

    # Override the dependency to mock `get_current_user_info`
    app.dependency_overrides[get_current_user_info] = lambda: mock_get_current_user_info(user_id)

    response = client.post("/tasks", json=task_data, cookies={"access_token": "mock_token"})

    # Validate the response
    assert response.status_code == 201, f"Unexpected status: {response.status_code}, Response: {response.text}"

    # Check task data in the response
    created_task = response.json()
    assert created_task["title"] == task_data["title"]
    assert created_task["description"] == task_data["description"]
    assert created_task["priority"] == task_data["priority"]
    assert created_task["owner_id"] == user_id  # Verify the owner matches the specified UUID

    # Clean up dependency overrides
    app.dependency_overrides.clear()
