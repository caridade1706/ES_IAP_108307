from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database import engine, SessionLocal
from models import Base
from routes import user_routes

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Cria as tabelas no banco de dados
Base.metadata.create_all(bind=engine)

# Inclui as rotas de usuários
app.include_router(user_routes.router)