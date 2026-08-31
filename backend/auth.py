import time
import bcrypt
import jwt
from datetime import datetime, timezone, timedelta
from typing import Optional, Dict, Any
from fastapi import HTTPException, Header, Depends

from config import JWT_SECRET, JWT_ALGORITHM, JWT_EXPIRATION_HOURS, ADMIN_USERNAME

def hash_password(password: str) -> str:
    salt = bcrypt.gensalt(rounds=12)
    return bcrypt.hashpw(password.encode('utf-8'), salt).decode('utf-8')

def verify_password(plain_password: str, hashed_password: str) -> bool:
    if not plain_password or not hashed_password:
        return False
    try:
        return bcrypt.checkpw(plain_password.encode('utf-8'), hashed_password.encode('utf-8'))
    except Exception:
        return False

def generate_token(username: str, role: str = 'user') -> str:
    now = datetime.now(timezone.utc)
    payload = {
        "sub": username,
        "role": role,
        "iat": now,
        "exp": now + timedelta(hours=JWT_EXPIRATION_HOURS)
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)

def decode_token(token: str) -> Optional[Dict[str, Any]]:
    if not token:
        return None
    try:
        return jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
    except (jwt.ExpiredSignatureError, jwt.InvalidTokenError, Exception):
        return None

def verify_token(token: str) -> bool:
    payload = decode_token(token)
    if not payload or not payload.get('sub'):
        return False
    username = payload.get('sub')
    if username.lower() == ADMIN_USERNAME.lower():
        return True
    try:
        from database import db_fetchone
        admin = db_fetchone("SELECT * FROM admin_credentials WHERE LOWER(username) = LOWER(%s)", (username,))
        if admin:
            return True
        user = db_fetchone("SELECT * FROM users WHERE LOWER(username) = LOWER(%s)", (username,))
        return user is not None
    except Exception:
        # Security check fails closed on error
        return False

def get_auth_token(authorization: Optional[str] = Header(None)) -> str:
    if not authorization:
        raise HTTPException(status_code=401, detail="Authorization header is missing")
    parts = authorization.split()
    if len(parts) != 2 or parts[0].lower() != "bearer":
        raise HTTPException(status_code=401, detail="Authorization header must be Bearer token")
    token = parts[1]
    payload = decode_token(token)
    if not payload or not payload.get('sub'):
        raise HTTPException(status_code=401, detail="Unauthorized or token expired")
    return token

def extract_username_from_auth(authorization: Optional[str] = Header(None)) -> Optional[str]:
    if not authorization:
        return None
    parts = authorization.split()
    if len(parts) == 2 and parts[0].lower() == "bearer":
        token = parts[1]
        payload = decode_token(token)
        if payload and payload.get('sub'):
            return str(payload.get('sub'))
    return None

def extract_role_from_auth(authorization: Optional[str] = Header(None)) -> Optional[str]:
    if not authorization:
        return None
    parts = authorization.split()
    if len(parts) == 2 and parts[0].lower() == "bearer":
        token = parts[1]
        payload = decode_token(token)
        if payload:
            return str(payload.get('role', 'user'))
    return None

def is_admin_user(username: Optional[str]) -> bool:
    if not username:
        return False
    if username.lower() == ADMIN_USERNAME.lower():
        return True
    try:
        from database import db_fetchone
        admin = db_fetchone("SELECT * FROM admin_credentials WHERE LOWER(username) = LOWER(%s)", (username,))
        return admin is not None
    except Exception:
        return False

def get_admin_token(authorization: Optional[str] = Header(None)) -> str:
    token = get_auth_token(authorization)
    username = extract_username_from_auth(authorization)
    if not is_admin_user(username):
        raise HTTPException(status_code=403, detail="Forbidden: Administrator privileges required to access this resource")
    return token
