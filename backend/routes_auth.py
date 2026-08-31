import time
import logging
from collections import defaultdict
from fastapi import APIRouter, Request, HTTPException, Depends, Header
from pydantic import BaseModel, Field
from typing import Optional

from config import ADMIN_USERNAME
from auth import (
    hash_password, verify_password, generate_token, get_auth_token,
    extract_username_from_auth, extract_role_from_auth, is_admin_user
)
from database import db_fetchone, db_execute

logger = logging.getLogger("auth_routes")
router = APIRouter()

# In-Memory Rate Limiting for Auth Endpoints (5 failed attempts / 30 requests per minute per IP)
_auth_request_history = defaultdict(list)
_auth_failure_history = defaultdict(list)

def _check_rate_limit(client_ip: str, max_requests: int = 30, window_secs: int = 60):
    now = time.time()
    # Prune older records
    _auth_request_history[client_ip] = [t for t in _auth_request_history[client_ip] if now - t < window_secs]
    _auth_failure_history[client_ip] = [t for t in _auth_failure_history[client_ip] if now - t < window_secs]
    
    if len(_auth_failure_history[client_ip]) >= 5:
        raise HTTPException(
            status_code=429,
            detail="Too many failed login attempts. Please wait 60 seconds before trying again."
        )
    if len(_auth_request_history[client_ip]) >= max_requests:
        raise HTTPException(
            status_code=429,
            detail="Rate limit exceeded. Please slow down your authentication requests."
        )
    _auth_request_history[client_ip].append(now)

def _record_auth_failure(client_ip: str):
    _auth_failure_history[client_ip].append(time.time())

class RegisterRequest(BaseModel):
    username: str = Field(..., min_length=3, max_length=100)
    password: str = Field(..., min_length=6, max_length=128)
    name: str = Field(..., min_length=2, max_length=100)

class LoginRequest(BaseModel):
    username: str = Field(..., min_length=1, max_length=100)
    password: str = Field(..., min_length=1, max_length=128)

class ProfileUpdateRequest(BaseModel):
    name: str = Field(..., min_length=2, max_length=100)

class PasswordUpdateRequest(BaseModel):
    current_password: str = Field(..., min_length=1, max_length=128)
    new_password: str = Field(..., min_length=6, max_length=128)

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
            raise HTTPException(status_code=400, detail='Username already exists')
            
        existing_user = db_fetchone("SELECT id FROM users WHERE LOWER(username) = LOWER(%s)", (username,))
        if existing_user:
            _record_auth_failure(client_ip)
            raise HTTPException(status_code=400, detail='Username already exists')
            
        password_hash = hash_password(password)
        db_execute("INSERT INTO users (username, password_hash, name) VALUES (%s, %s, %s)", (username, password_hash, name))
        
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
                    raise HTTPException(status_code=401, detail='Invalid username or password')
            else:
                _record_auth_failure(client_ip)
                raise HTTPException(status_code=401, detail='Invalid username or password')


        # 2. Check standard users table
        user = db_fetchone("SELECT * FROM users WHERE LOWER(username) = LOWER(%s)", (username,))
        if user:
            stored_hash = user.get('password_hash', '')
            if verify_password(password, stored_hash):
                token = generate_token(user['username'], role='user')
                return {
                    'success': True,
                    'token': token,
                    'role': 'user',
                    'username': user['username'],
                    'name': user.get('name', user['username']),
                    'message': 'Login successful'
                }

        _record_auth_failure(client_ip)
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
            raise HTTPException(status_code=401, detail='Incorrect current password')
            
        new_hash = hash_password(new_password)
        db_execute("UPDATE users SET password_hash = %s WHERE LOWER(username) = LOWER(%s)", (new_hash, username))
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
        return {'success': True, 'message': 'Account and associated assessments deleted successfully'}
    except HTTPException:
        raise
    except Exception as e:
        logger.exception("Error deleting user account")
        raise HTTPException(status_code=500, detail="Failed to delete account.")
