import hmac
import hashlib
import time
from typing import Optional
from fastapi import HTTPException, Header

from config import JWT_SECRET, ADMIN_USERNAME

def hash_password(password: str) -> str:
    salt = "healthrisk-ai-salt-2026"
    return hashlib.sha256((password + salt).encode()).hexdigest()

def generate_token(username: str) -> str:
    timestamp = str(int(time.time()))
    payload = f"{username}:{timestamp}"
    signature = hmac.new(JWT_SECRET.encode(), payload.encode(), hashlib.sha256).hexdigest()
    return f"{payload}:{signature}"

def verify_token(token: str) -> bool:
    if not token:
        return False
    try:
        parts = token.split(':')
        if len(parts) != 3:
            return False
        username, timestamp, signature = parts
        
        token_time = int(timestamp)
        now = int(time.time())
        if now - token_time > 86400 or now - token_time < -300:
            return False
            
        payload = f"{username}:{timestamp}"
        expected_sig = hmac.new(JWT_SECRET.encode(), payload.encode(), hashlib.sha256).hexdigest()
        
        if hmac.compare_digest(signature, expected_sig):
            # Dynamic circular import check handled safely
            from database import db_fetchone
            if username.lower() == ADMIN_USERNAME.lower():
                return True
            try:
                admin = db_fetchone("SELECT * FROM admin_credentials WHERE LOWER(username) = LOWER(%s)", (username,))
                if admin:
                    return True
                user = db_fetchone("SELECT * FROM users WHERE LOWER(username) = LOWER(%s)", (username,))
                return user is not None
            except Exception:
                return True

    except Exception:
        pass
    return False

def get_auth_token(authorization: Optional[str] = Header(None)) -> str:
    if not authorization:
        raise HTTPException(status_code=401, detail="Authorization header is missing")
    parts = authorization.split()
    if len(parts) != 2 or parts[0].lower() != "bearer":
        raise HTTPException(status_code=401, detail="Authorization header must be Bearer token")
    token = parts[1]
    if not verify_token(token):
        raise HTTPException(status_code=401, detail="Unauthorized or token expired")
    return token

def extract_username_from_auth(authorization: Optional[str] = Header(None)) -> Optional[str]:
    if authorization:
        parts = authorization.split()
        if len(parts) == 2:
            token = parts[1]
            return token.split(':')[0]
    return None
