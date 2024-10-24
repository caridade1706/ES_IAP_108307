# auth_utils.py
from jose import jwt, JWTError
from fastapi import HTTPException, status
import requests
import os

COGNITO_CLIENT_ID = os.getenv("COGNITO_APP_CLIENT_ID")
AWS_REGION = os.getenv("AWS_REGION")
COGNITO_USER_POOL_ID = os.getenv("COGNITO_USER_POOL_ID")
COGNITO_KEYS_URL = f"https://cognito-idp.{AWS_REGION}.amazonaws.com/{COGNITO_USER_POOL_ID}/.well-known/jwks.json"

def get_cognito_public_keys():
    try:
        response = requests.get(COGNITO_KEYS_URL)
        response.raise_for_status()
        keys = response.json()["keys"]
        return keys
    except requests.exceptions.RequestException as e:
        raise HTTPException(status_code=500, detail=f"Error fetching Cognito public keys: {e}")

def get_public_key_from_jwk(token: str, keys):
    headers = jwt.get_unverified_header(token)
    kid = headers.get("kid")
    
    if not kid:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token header")
    
    for key in keys:
        if key["kid"] == kid:
            return key
    
    raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Public key not found")

def validate_token(id_token: str, access_token: str = None):
    keys = get_cognito_public_keys()
    
    try:
        public_key = get_public_key_from_jwk(id_token, keys)
        print(f"Public Key: {public_key}")
        
        # Desativando a verificação de at_hash para teste
        options = {"verify_at_hash": False}
        
        # Decodificar o token com a chave pública
        payload = jwt.decode(
            id_token,
            public_key,
            algorithms=["RS256"],
            audience=COGNITO_CLIENT_ID,
            options=options
        )
        print(f"Decoded payload: {payload}")
        return payload
    except JWTError as e:
        print(f"JWTError: {e}")
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail=f"Invalid token: {e}")
