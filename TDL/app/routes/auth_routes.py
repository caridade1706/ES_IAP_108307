from fastapi import APIRouter, Depends, HTTPException, status, Request, Response
from fastapi.responses import RedirectResponse, JSONResponse
from fastapi.security import OAuth2PasswordBearer
import requests
from sqlalchemy.orm import Session
from app.database import get_db
import app.models as models
from app.services.auth_service import validate_token, exchange_code_for_tokens, get_or_create_user
import os
from dotenv import load_dotenv
from urllib.parse import urlencode


router = APIRouter()

# Load environment variables
env = os.getenv('ENV', 'development')
env_file = '../.env/development.env'

if os.path.exists(env_file):
    load_dotenv(env_file)
    print(f"Loaded variables from: {env_file}")
else:
    print(f"Environment file not found: {os.path.abspath(env_file)}")

# Cognito configuration
COGNITO_CLIENT_ID = os.getenv("COGNITO_APP_CLIENT_ID")
COGNITO_REDIRECT_URI = os.getenv("COGNITO_REDIRECT_URI", "http://localhost:8000/auth/callback")
COGNITO_DOMAIN = os.getenv("COGNITO_DOMAIN", "iaproject.auth.eu-north-1.amazoncognito.com")

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:3000")

@router.get("/dashboard", name="index")
async def read_index():
    # Redirecionar para a URL do frontend
    return RedirectResponse(url=f"{FRONTEND_URL}/dashboard")

@router.get("/auth/login")
async def login_to_cognito():
    if not COGNITO_CLIENT_ID or not COGNITO_DOMAIN:
        raise HTTPException(status_code=500, detail="Cognito Client ID or Domain is not configured")
    
    # Build the login URL with the necessary parameters
    params = {
        "client_id": COGNITO_CLIENT_ID,
        "response_type": "code",
        "redirect_uri": COGNITO_REDIRECT_URI
    }
    url = f"https://{COGNITO_DOMAIN}/login?" + urlencode(params)
    
    # Redirect to the Cognito login page
    return RedirectResponse(url=url)

@router.get("/auth/callback")
async def auth_callback(request : Request, response: Response, db: Session = Depends(get_db)):
    
    code = request.query_params.get("code")
    if not code:
        raise HTTPException(status_code=400, detail="Code not found in query parameters")
    
    tokens = exchange_code_for_tokens(code)

    id_token = tokens.get("id_token")
    access_token = tokens.get("access_token")


    payload = validate_token(id_token, access_token)
    
    get_or_create_user(db, payload)

    response = RedirectResponse(url="/dashboard")
    response.set_cookie(key="access_token", value=access_token, httponly=True, max_age=3600, secure=True)
    return response

@router.get("/auth/logout")
async def logout():
    response = JSONResponse(content={"message": "User logged out successfully"})
    response.delete_cookie(key="access_token")
    return response

@router.get("/auth/me")
async def get_current_user(request: Request, db: Session = Depends(get_db)):
    token = request.cookies.get("access_token")
    if not token:
        raise HTTPException(status_code=401, detail="Token not found in cookies")
    
    # Validação do token
    try:
        payload = validate_token(token, token)
    except Exception as e:
        raise HTTPException(status_code=401, detail=f"Invalid token: {str(e)}")

    # Extrair ID do usuário (sub) do payload
    cognito_id = payload.get("sub")
    if not cognito_id:
        raise HTTPException(status_code=400, detail="Invalid token payload")

    # Buscar o usuário no banco de dados
    user = db.query(models.User).filter(models.User.cognito_id == cognito_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    # Retornar dados do usuário
    return {"username": user.name, "email": user.email}

