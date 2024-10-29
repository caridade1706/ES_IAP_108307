import pytest
from unittest.mock import MagicMock
from datetime import datetime
from app.schemas import TaskCreate
from app.models import TaskStatus
from app.routes.task_routes import create_task
from unittest.mock import patch
from fastapi.testclient import TestClient
from app.main import app

def test_create_task_direct():
    # Mock the database operations
    mock_db = MagicMock()
    mock_db.add = MagicMock()
    mock_db.commit = MagicMock()
    mock_db.refresh = MagicMock()

    # Mock user data
    mock_user = {"sub": "test_user_id"}  # Simulating Cognito user ID as "test_user_id"

    # Task data to create
    task_data = {
        "title": "Test Task",
        "description": "This is a test task",
        "priority": "Medium",  # Priority should match the schema's enum values
        "deadline": datetime(2024, 12, 31, 23, 59, 0)
    }

    # Initialize TaskCreate model from task_data
    task = TaskCreate(**task_data)

    # Call create_task with mocked db and user
    response_task = create_task(task=task, db=mock_db, user=mock_user)

    # Verify the task is created with correct data
    assert response_task.title == task_data["title"]
    assert response_task.description == task_data["description"]
    assert response_task.priority == task_data["priority"]
    assert response_task.status == TaskStatus.TODO
    assert response_task.owner_id == mock_user["sub"]

