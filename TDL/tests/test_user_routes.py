# Importando os módulos necessários
import pytest
from app.database import Base, engine
from fastapi.testclient import TestClient
from app.main import app
from app.models import User

client = TestClient(app)

@pytest.fixture(scope="function", autouse=True)
def setup_and_teardown_db():
    # Cria as tabelas no banco de dados antes dos testes
    Base.metadata.create_all(bind=engine)
    yield
    # Remove as tabelas do banco de dados após os testes
    Base.metadata.drop_all(bind=engine)

def test_create_user():
    # Simula uma solicitação para criação de usuário
    response = client.post("/users/", json={"cognito_id": "test123", "name": "John", "email": "john@test.com"})
    assert response.status_code == 201  # Verifica se a criação do usuário foi bem-sucedida

def test_get_user_when_exist():
    # Cria um usuário e depois tenta recuperá-lo
    client.post("/users/", json={"cognito_id": "test123", "name": "John", "email": "john@test.com"})
    response = client.get("/users/1")  # Tenta buscar o usuário pelo ID
    assert response.status_code == 200  # Verifica se a busca do usuário foi bem-sucedida
    data = response.json()
    assert data["name"] == "John"
    assert data["email"] == "john@test.com"

def test_get_user_when_not_exist():
    # Tenta buscar um usuário que não existe
    response = client.get("/users/9999")  # ID inexistente
    assert response.status_code == 404  # Verifica se o status da resposta indica que o usuário não foi encontrado

def test_user_authentication():
    # Teste de autenticação simplificado para redirecionamento do Cognito
    response = client.get("/auth/login", allow_redirects=False)
    assert response.status_code == 307  # O Cognito deve redirecionar para a página de login
    assert "location" in response.headers  # Verifica se o cabeçalho de localização está presente
    assert "cognito" in response.headers["location"]  # Confirma que o redirecionamento é para o Cognito

def test_logout():
    # Teste de logout simulando que o cookie é removido
    client.cookies.set("access_token", "mock_access_token")  # Configura um cookie de token simulado
    response = client.get("/auth/logout")  # Simula o logout
    assert response.status_code == 200
    assert response.json() == {"message": "User logged out successfully"}
    assert "access_token" not in response.cookies  # Verifica se o cookie foi removido
