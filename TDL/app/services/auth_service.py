# auth_utils.py
from jose import jwt, JWTError
from fastapi import HTTPException, status, Request
import requests
import os
from app import models
import base64
from fastapi import Depends
from sqlalchemy.orm import Session
from app.database import get_db

COGNITO_CLIENT_ID = os.getenv("COGNITO_APP_CLIENT_ID")
AWS_REGION = os.getenv("AWS_REGION")
COGNITO_USER_POOL_ID = os.getenv("COGNITO_USER_POOL_ID")
COGNITO_KEYS_URL = f"https://cognito-idp.{AWS_REGION}.amazonaws.com/{COGNITO_USER_POOL_ID}/.well-known/jwks.json"
COGNITO_REDIRECT_URI = os.getenv("COGNITO_REDIRECT_URI", "http://localhost:8000/auth/callback")
COGNITO_DOMAIN = os.getenv("COGNITO_DOMAIN", "iaproject.auth.eu-north-1.amazoncognito.com")
TOKEN_URL = f"https://{COGNITO_DOMAIN}/oauth2/token"


def validate_token(token: str, access_token: str) -> dict:
    keys = requests.get(COGNITO_KEYS_URL).json().get("keys", [])

    headers = jwt.get_unverified_headers(token)
    kid = headers["kid"]
    key = next((key for key in keys if key["kid"] == kid), None)
    
    if key is None:
        raise ValueError("Public key not found")

    issuer = f"https://cognito-idp.{AWS_REGION}.amazonaws.com/{COGNITO_USER_POOL_ID}"

    try:
        payload = jwt.decode(
            token,
            key,
            algorithms=["RS256"],
            audience=COGNITO_CLIENT_ID,
            issuer=issuer,
            access_token=access_token
        )

    except JWTError:
        raise HTTPException(status_code=401, detail="Token is invalid")

    return payload

def exchange_code_for_tokens(code: str) -> dict:
    client_auth = f"{COGNITO_CLIENT_ID}:{os.getenv('COGNITO_CLIENT_SECRET')}"
    encoded_auth = base64.b64encode(client_auth.encode()).decode()
    headers = {
        "Content-Type": "application/x-www-form-urlencoded",
        "Authorization": f"Basic {encoded_auth}"
    }
    
    response = requests.post(
        TOKEN_URL,
        data={
            "grant_type": "authorization_code",
            "client_id": COGNITO_CLIENT_ID,
            "redirect_uri": os.getenv("COGNITO_REDIRECT_URI"),
            "code": code
        },
        headers=headers
    )
    
    if response.status_code != 200:
        raise HTTPException(status_code=400, detail="Failed to obtain token")
    
    return response.json()

def get_or_create_user(db, payload):

    cognito_id = payload.get("sub")
    email = payload.get("email")
    username = payload.get("cognito:username")

    if not cognito_id or not email or not username:
        raise HTTPException(status_code=400, detail="Invalid token payload")

    user = db.query(models.User).filter(models.User.cognito_id == cognito_id).first()
    if not user:
        user = models.User(cognito_id=cognito_id, email=email, name=username)
        db.add(user)
        db.commit()
        db.refresh(user)

    return ("Logged in successfully", user)


def get_current_user(request: Request, db: Session = Depends(get_db)) -> models.User:
    """
    Extracts and verifies the JWT token from the cookie to retrieve the current user.
    """
    # Retrieve the access token from cookies
    token = request.cookies.get("access_token")
    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Access token missing",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    try:
        # Decode the JWT token to retrieve the payload
        payload = validate_token(token, token)  # Reuse the decode_jwt function in auth_service
        cognito_id = payload.get("sub")
        if cognito_id is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token payload",
                headers={"WWW-Authenticate": "Bearer"},
            )

        # Find the user in the database
        user = db.query(models.User).filter(models.User.cognito_id == cognito_id).first()
        if user is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="User not found",
                headers={"WWW-Authenticate": "Bearer"},
            )

        return user
    
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token validation failed",
            headers={"WWW-Authenticate": "Bearer"},
        )