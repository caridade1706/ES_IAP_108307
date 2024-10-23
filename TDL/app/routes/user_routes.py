from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from schemas import UserResponse, UserBase
from database import get_db
import models as models
import os
from fastapi.responses import RedirectResponse
from dotenv import load_dotenv

router = APIRouter()

# Determine which environment file to load
env = os.getenv('ENV', 'development')
env_file = '../.env/development.env'  # Subir um nível para acessar .env/development.env

# Carregar variáveis de ambiente do arquivo .env
if os.path.exists(env_file):
    load_dotenv(env_file)
    print(f"Carregando variáveis de: {env_file}")
else:
    print(f"Arquivo .env não encontrado: {os.path.abspath(env_file)}")

# Configurações do Cognito
COGNITO_HOSTED_UI_URL_Registration = os.getenv("COGNITO_HOSTED_UI_URL_Registration")

@router.post("/users/", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def create_user(user: UserBase, db: Session = Depends(get_db)):
    db_user = db.query(models.User).filter(models.User.email == user.email).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")

    db_user = models.User(**user.model_dump())
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

# Endpoint para redirecionar para a Hosted UI do Cognito
@router.get("/auth/redirect")
async def redirect_to_cognito():
    print(f"COGNITO_HOSTED_UI_URL_Registration: {COGNITO_HOSTED_UI_URL_Registration}")
    if not COGNITO_HOSTED_UI_URL_Registration:
        raise HTTPException(status_code=500, detail="Cognito Hosted UI URL not configured")
    
    # Redirecionar para a URL configurada
    return RedirectResponse(url=COGNITO_HOSTED_UI_URL_Registration)
