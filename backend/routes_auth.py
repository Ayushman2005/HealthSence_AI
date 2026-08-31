import time
import logging
import threading
from typing import Optional, Dict, List
from fastapi import APIRouter, Request, HTTPException, Depends, Header
from pydantic import BaseModel, Field

from config import ADMIN_USERNAME
from auth import (
    hash_password, verify_password, generate_token, get_auth_token,
    extract_username_from_auth, extract_role_from_auth, is_admin_user
)
from database import db_fetchone, db_execute, log_audit_event

logger = logging.getLogger("auth_routes")
router = APIRouter()

# In-memory sliding-window IP rate limiter
_FAILED_ATTEMPTS: Dict[str, List[float]] = {}
_RATE_LIMIT_LOCK = threading.Lock()
_MAX_FAILED_ATTEMPTS = 5
_WINDOW_SECONDS = 60.0

def _check_rate_limit(client_ip: str):
    now = time.time()
    with _RATE_LIMIT_LOCK:
        attempts = _FAILED_ATTEMPTS.get(client_ip, [])
        attempts = [t for t in attempts if now - t < _WINDOW_SECONDS]
        _FAILED_ATTEMPTS[client_ip] = attempts
        if len(attempts) >= _MAX_FAILED_ATTEMPTS:
            raise HTTPException(
                status_code=429, 
                detail="Too many failed authentication attempts. Please try again in 1 minute."
            )

def _record_auth_failure(client_ip: str):
    now = time.time()
    with _RATE_LIMIT_LOCK:
        if client_ip not in _FAILED_ATTEMPTS:
            _FAILED_ATTEMPTS[client_ip] = []
        _FAILED_ATTEMPTS[client_ip].append(now)

class RegisterRequest(BaseModel):

    username: str = Field(..., min_length=3, max_length=50)
    password: str = Field(..., min_length=6)
    name: str = Field(..., min_length=1, max_length=100)

class LoginRequest(BaseModel):
    username: str = Field(..., min_length=1)
    password: str = Field(..., min_length=1)

class ProfileUpdateRequest(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)

class PasswordUpdateRequest(BaseModel):
    current_password: str = Field(..., min_length=1)
    new_password: str = Field(..., min_length=6)

@router.post('/api/register')
async def register(req: RegisterRequest, request: Request):
    client_ip = request.client.host if request.client else "unknown"
    _check_rate_limit(client_ip)

    try:
        username = req.username.strip()
        password = req.password
        name = req.name.strip()
        
        if username.lower() == ADMIN_USERNAME.lower():
            _record_auth_failure(client_ip)
            log_audit_event("REGISTER_FAILED", "SECURITY", username, "Registration rejected (reserved admin username)", status="FAILED", ip_address=client_ip)
            raise HTTPException(status_code=400, detail='Username already exists')
            
        existing_user = db_fetchone("SELECT id FROM users WHERE LOWER(username) = LOWER(%s)", (username,))
        if existing_user:
            _record_auth_failure(client_ip)
            log_audit_event("REGISTER_FAILED", "SECURITY", username, "Registration rejected (username taken)", status="FAILED", ip_address=client_ip)
            raise HTTPException(status_code=400, detail='Username already exists')
            
        password_hash = hash_password(password)
        db_execute("INSERT INTO users (username, password_hash, name) VALUES (%s, %s, %s)", (username, password_hash, name))
        
        log_audit_event("USER_REGISTER", "AUTHENTICATION", username, f"Account registered for {name}", status="SUCCESS", ip_address=client_ip)
        token = generate_token(username, role='user')
        return {
            'success': True,
            'token': token,
            'role': 'user',
            'username': username,
            'name': name,
            'message': 'Registration successful'
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.exception("Error during registration")
        raise HTTPException(status_code=500, detail="Registration failed due to an internal server error.")

@router.post('/api/login')
async def login(req: LoginRequest, request: Request):
    client_ip = request.client.host if request.client else "unknown"
    _check_rate_limit(client_ip)

    try:
        username = req.username.strip()
        password = req.password
        
        # 1. Check admin credentials table
        admin_rec = db_fetchone("SELECT * FROM admin_credentials WHERE LOWER(username) = LOWER(%s)", (username,))
        if admin_rec:
            stored_hash = admin_rec.get('password_hash', '')
            if verify_password(password, stored_hash):
                token = generate_token(admin_rec['username'], role='admin')
                log_audit_event("ADMIN_LOGIN", "AUTHENTICATION", admin_rec['username'], "Administrator signed in to management portal", status="SUCCESS", ip_address=client_ip)
                return {
                    'success': True,
                    'token': token,
                    'role': 'admin',
                    'username': admin_rec['username'],
                    'name': 'System Administrator',
                    'message': 'Admin login successful'
                }
            elif username.lower() == ADMIN_USERNAME.lower() and (not stored_hash.startswith('$2b$') and not stored_hash.startswith('$2a$')):
                from config import ADMIN_PASSWORD
                if password == ADMIN_PASSWORD:
                    new_hash = hash_password(password)
                    try:
                        from database import DB_MODE, supabase_client
                        if DB_MODE == 'SUPABASE' and supabase_client is not None:
                            supabase_client.table('admin_credentials').update({'password_hash': new_hash}).ilike('username', admin_rec['username']).execute()
                    except Exception:
                        pass
                    token = generate_token(admin_rec['username'], role='admin')
                    log_audit_event("ADMIN_LOGIN", "AUTHENTICATION", admin_rec['username'], "Administrator signed in (upgraded hash to bcrypt)", status="SUCCESS", ip_address=client_ip)
                    return {
                        'success': True,
                        'token': token,
                        'role': 'admin',
                        'username': admin_rec['username'],
                        'name': 'System Administrator',
                        'message': 'Admin login successful'
                    }
                else:
                    _record_auth_failure(client_ip)
                    log_audit_event("LOGIN_FAILED", "SECURITY", username, "Invalid administrator password attempt", status="FAILED", ip_address=client_ip)
                    raise HTTPException(status_code=401, detail='Invalid username or password')
            else:
                _record_auth_failure(client_ip)
                log_audit_event("LOGIN_FAILED", "SECURITY", username, "Invalid administrator credentials", status="FAILED", ip_address=client_ip)
                raise HTTPException(status_code=401, detail='Invalid username or password')


        # 2. Check standard users table
        user = db_fetchone("SELECT * FROM users WHERE LOWER(username) = LOWER(%s)", (username,))
        if user:
            stored_hash = user.get('password_hash', '')
            if verify_password(password, stored_hash):
                token = generate_token(user['username'], role='user')
                log_audit_event("USER_LOGIN", "AUTHENTICATION", user['username'], f"User signed in ({user.get('name', user['username'])})", status="SUCCESS", ip_address=client_ip)
                return {
                    'success': True,
                    'token': token,
                    'role': 'user',
                    'username': user['username'],
                    'name': user.get('name', user['username']),
                    'message': 'Login successful'
                }

        _record_auth_failure(client_ip)
        log_audit_event("LOGIN_FAILED", "SECURITY", username, "Failed authentication attempt (unknown user or wrong password)", status="FAILED", ip_address=client_ip)
        raise HTTPException(status_code=401, detail='Invalid username or password')
    except HTTPException:
        raise
    except Exception as e:
        logger.exception("Error during login")
        raise HTTPException(status_code=500, detail="Login failed due to an internal server error.")

@router.get('/api/user/profile')
async def get_user_profile(
    authorization: Optional[str] = Header(None),
    token: str = Depends(get_auth_token)
):
    try:
        username = extract_username_from_auth(authorization)
        if not username:
            raise HTTPException(status_code=401, detail='Invalid authentication token')

        if is_admin_user(username):
            admin_rec = db_fetchone("SELECT * FROM admin_credentials WHERE LOWER(username) = LOWER(%s)", (username,))
            return {
                'username': admin_rec['username'] if admin_rec else ADMIN_USERNAME,
                'name': 'System Administrator',
                'role': 'admin',
                'created_at': str(admin_rec.get('created_at', 'System Default')) if admin_rec else 'System Default'
            }

        user = db_fetchone("SELECT username, name, created_at FROM users WHERE LOWER(username) = LOWER(%s)", (username,))
        if not user:
            raise HTTPException(status_code=404, detail='User not found')
        user['role'] = 'user'
        return user
    except HTTPException:
        raise
    except Exception as e:
        logger.exception("Error fetching user profile")
        raise HTTPException(status_code=500, detail="Failed to fetch user profile.")

@router.put('/api/user/profile')
async def update_user_profile(
    req: ProfileUpdateRequest,
    authorization: Optional[str] = Header(None),
    token: str = Depends(get_auth_token)
):
    try:
        username = extract_username_from_auth(authorization)
        if not username:
            raise HTTPException(status_code=401, detail='Invalid authentication token')

        if is_admin_user(username):
            raise HTTPException(status_code=400, detail='Cannot update system administrator profile')
            
        new_name = req.name.strip()
        db_execute("UPDATE users SET name = %s WHERE LOWER(username) = LOWER(%s)", (new_name, username))
        log_audit_event("PROFILE_UPDATE", "ACCOUNT", username, f"Updated profile display name to '{new_name}'", status="SUCCESS")
        return {'success': True, 'message': 'Profile updated successfully', 'name': new_name}
    except HTTPException:
        raise
    except Exception as e:
        logger.exception("Error updating profile")
        raise HTTPException(status_code=500, detail="Failed to update profile.")

@router.put('/api/user/password')
async def update_user_password(
    req: PasswordUpdateRequest,
    authorization: Optional[str] = Header(None),
    token: str = Depends(get_auth_token)
):
    try:
        username = extract_username_from_auth(authorization)
        if not username:
            raise HTTPException(status_code=401, detail='Invalid authentication token')

        if is_admin_user(username):
            raise HTTPException(status_code=400, detail='Cannot update system administrator password here')
            
        current_password = req.current_password
        new_password = req.new_password
        
        user = db_fetchone("SELECT * FROM users WHERE LOWER(username) = LOWER(%s)", (username,))
        if not user or not verify_password(current_password, user.get('password_hash', '')):
            log_audit_event("PASSWORD_UPDATE_FAILED", "SECURITY", username, "Password update failed: incorrect current password", status="FAILED")
            raise HTTPException(status_code=401, detail='Incorrect current password')
            
        new_hash = hash_password(new_password)
        db_execute("UPDATE users SET password_hash = %s WHERE LOWER(username) = LOWER(%s)", (new_hash, username))
        log_audit_event("PASSWORD_UPDATE", "SECURITY", username, "User changed account password", status="SUCCESS")
        return {'success': True, 'message': 'Password updated successfully'}
    except HTTPException:
        raise
    except Exception as e:
        logger.exception("Error updating password")
        raise HTTPException(status_code=500, detail="Failed to update password.")

@router.delete('/api/user/account')
async def delete_user_account(
    authorization: Optional[str] = Header(None),
    token: str = Depends(get_auth_token)
):
    try:
        username = extract_username_from_auth(authorization)
        if not username:
            raise HTTPException(status_code=401, detail='Invalid authentication token')

        if is_admin_user(username):
            raise HTTPException(status_code=400, detail='Cannot delete system administrator account')
            
        # Delete user assessments and user record
        db_execute("DELETE FROM assessments WHERE LOWER(username) = LOWER(%s)", (username,))
        db_execute("DELETE FROM users WHERE LOWER(username) = LOWER(%s)", (username,))
        log_audit_event("ACCOUNT_DELETE", "ACCOUNT", username, "User account and all health assessments permanently deleted", status="SUCCESS")
        return {'success': True, 'message': 'Account and associated assessments deleted successfully'}
    except HTTPException:
        raise
    except Exception as e:
        logger.exception("Error deleting user account")
        raise HTTPException(status_code=500, detail="Failed to delete account.")
