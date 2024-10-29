from unittest.mock import MagicMock    
from unittest.mock import patch
from app.models import User
import requests
from fastapi.responses import RedirectResponse
from fastapi import APIRouter, HTTPException
from app.models import User
from app.database import SessionLocal
from fastapi import status

def test_fixture_setup(client, db_mock):
    assert client is not None, "A fixture `client` não foi inicializada corretamente"
    assert db_mock is not None, "A fixture `db_mock` não foi inicializada corretamente"



def test_insert_user_commit(db_mock):
    # Simulação dos dados do usuário que você deseja criar
    user_data = User(
        cognito_id="mock-cognito-id",
        email="mockuser@example.com",
        name="Mock User"
    )

    # Mock do retorno do banco de dados
    db_mock.query.return_value.filter.return_value.first.return_value = None  # Simula que não existe usuário
    db_mock.add = MagicMock()  # Mock da função add
    db_mock.commit = MagicMock()  # Mock da função commit

    # Insere o usuário usando a função que você implementou
    new_user = insert_user(db_mock, user_data)

    # Verifica se o commit foi chamado
    assert db_mock.add.called
    assert db_mock.commit.called
    assert new_user.email == user_data.email
    assert new_user.name == user_data.name


def test_login_logout_flow(client):
    with patch("app.services.auth_service.exchange_code_for_tokens") as mock_exchange_code_for_tokens, \
         patch("app.services.auth_service.validate_token") as mock_validate_token:

        # Mock the functions
        mock_exchange_code_for_tokens.return_value = {
            "id_token": "test_id_token",
            "access_token": "test_access_token"
        }
        mock_validate_token.return_value = {
            "sub": "test_cognito_id",
            "email": "testuser@example.com",
            "name": "Test User"
        }

        # Continue with the test
        login_response = client.get("/auth/login", follow_redirects=False)
        assert login_response.status_code == status.HTTP_307_TEMPORARY_REDIRECT

        code = "test_authorization_code"
        callback_response = client.get(f"/auth/callback?code={code}")
        assert callback_response.status_code == status.HTTP_200_OK
        assert callback_response.cookies.get("access_token") == "test_access_token"
