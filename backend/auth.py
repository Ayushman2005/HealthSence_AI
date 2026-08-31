import hmac
import hashlib
import time
import bcrypt
from typing import Optional
from fastapi import HTTPException, Header

from config import JWT_SECRET, ADMIN_USERNAME

def hash_password(password: str) -> str:
    salt = bcrypt.gensalt(rounds=12)
    return bcrypt.hashpw(password.encode('utf-8'), salt).decode('utf-8')

def verify_password(plain_password: str, hashed_password: str) -> bool:
    if not plain_password or not hashed_password:
        return False
    try:
        if hashed_password.startswith('$2b$') or hashed_password.startswith('$2a$') or hashed_password.startswith('$2y$'):
            return bcrypt.checkpw(plain_password.encode('utf-8'), hashed_password.encode('utf-8'))
        else:
            # Backward-compatible fallback verification for legacy salted SHA-256 hashes
            legacy_salt = "healthrisk-ai-salt-2026"
            legacy_hash = hashlib.sha256((plain_password + legacy_salt).encode()).hexdigest()
            return hmac.compare_digest(legacy_hash, hashed_password)
    except Exception:
        return False

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
                # Security checks MUST FAIL CLOSED on database/connection exceptions
                return False

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
    if not authorization:
        return None
    parts = authorization.split()
    if len(parts) == 2 and parts[0].lower() == "bearer":
        token = parts[1]
        if verify_token(token):
            return token.split(':')[0]
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

