from unittest.mock import MagicMock
from fastapi.testclient import TestClient
import pytest
from tests.conftest import db
from app.main import app
from app.routes.task_routes import create_task
from app.schemas import TaskCreate, TaskResponse
from app.models import TaskStatus, User
from app.routes.user_routes import get_current_user
from sqlalchemy.orm import Session


# Simulação de um usuário autenticado com dados fixos
mock_user = {
    "sub": "test-cognito-id",  # Identificador único do usuário no Cognito
    "username": "Test User",
    "email": "test@example.com"
}

# Cliente de teste para FastAPI
client = TestClient(app)
# Mock para a sessão do banco de dados
mock_db = MagicMock()

# Teste para a criação de uma tarefa sem banco de dados e sem dependência de autenticação
def test_create_task():
    # Mock das operações do banco de dados para evitar interação com a base real
    mock_db.add = MagicMock()
    mock_db.commit = MagicMock()
    mock_db.refresh = MagicMock()
    
    # Dados de entrada para criar a tarefa
    task_data = {
        "title": "Test Task",
        "description": "This is a test task",
        "priority": "Medium",
        "deadline": "2024-12-31T23:59:00"
    }

    # Cria a tarefa chamando diretamente a função `create_task` com o usuário e o db mockados
    task = TaskCreate(**task_data)
    response_task = create_task(task=task, db=mock_db, user=mock_user)

    # Verificações para garantir que a tarefa foi criada corretamente
    assert response_task.title == task_data["title"]
    assert response_task.description == task_data["description"]
    assert response_task.priority == task_data["priority"]
    assert response_task.status == TaskStatus.TODO
    assert response_task.owner_id == mock_user["sub"]

def create_user_in_db(db: Session, user_id: str, email: str, username: str):
   
        user_data = User(cognito_id=user_id, email=email, username=username)
        db.add(user_data)
        db.commit()
        db.refresh(user_data)
        return user_data       
    

# Teste para a criação de uma tarefa com o post /tasks
def test_create_task_route():
    # Mock das operações do banco de dados para evitar interação com a base real
    mock_db.add = MagicMock()
    mock_db.commit = MagicMock()
    mock_db.refresh = MagicMock()

    def mock_get_current_user_info(user_id: str):
        return {"sub": user_id}

    # Simulate User B
    user_b_id = "004c19cc-e021-70ce-5655-6eb6c36dd08b"
    user_b_email = "user_b@example.com"
    user_b_username = "UserB"

    create_user_in_db(db,user_id=user_b_id, email=user_b_email, username=user_b_username)
    # Now simulate as User B
    app.dependency_overrides[get_current_user] = lambda: mock_get_current_user_info(user_b_id)

    # Dados de entrada para criar a tarefa
    task_data = {
        "title": "Test Task",
        "description": "This is a test task",
        "priority": "Medium",
        "deadline": "2024-12-31T23:59:00"
    }

    # Cria a tarefa chamando a rota POST /tasks
    response = client.post("/tasks", json=task_data, cookies={"access_token": "mock_token"})

    # Verificações para garantir que a tarefa foi criada corretamente
    assert response.status_code == 201
    response_task = TaskResponse(**response.json())
    assert response_task.title == task_data["title"]
    assert response_task.description == task_data["description"]
    assert response_task.priority == task_data["priority"]
    assert response_task.status == TaskStatus.TODO
    assert response_task.owner_id == mock_user["sub"]

   