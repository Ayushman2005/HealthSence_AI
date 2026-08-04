from fastapi import APIRouter, Request, HTTPException, Depends, Header
from pydantic import BaseModel
from typing import Optional

from config import ADMIN_USERNAME, ADMIN_PASSWORD
from auth import (
    hash_password, generate_token, get_auth_token, extract_username_from_auth
)
from database import db_fetchone, db_execute

router = APIRouter()

class RegisterRequest(BaseModel):
    username: Optional[str] = None
    password: Optional[str] = None
    name: Optional[str] = None

class LoginRequest(BaseModel):
    username: Optional[str] = None
    password: Optional[str] = None

class ProfileUpdateRequest(BaseModel):
    name: Optional[str] = None

class PasswordUpdateRequest(BaseModel):
    current_password: Optional[str] = None
    new_password: Optional[str] = None

@router.post('/api/register')
async def register(req: RegisterRequest):
    try:
        username = req.username
        password = req.password
        name = req.name
        
        if not username or not password or not name:
            raise HTTPException(status_code=400, detail='Name, username, and password are required')
            
        username = username.strip()
        name = name.strip()
        
        if len(name) < 2:
            raise HTTPException(status_code=400, detail='Name must be at least 2 characters long')
        if len(username) < 3:
            raise HTTPException(status_code=400, detail='Username must be at least 3 characters long')
        if len(password) < 6:
            raise HTTPException(status_code=400, detail='Password must be at least 6 characters long')
            
        if username.lower() == ADMIN_USERNAME.lower():
            raise HTTPException(status_code=400, detail='Username already exists')
            
        existing_user = db_fetchone("SELECT * FROM users WHERE LOWER(username) = LOWER(%s)", (username,))
        if existing_user:
            raise HTTPException(status_code=400, detail='Username already exists')
            
        password_hash = hash_password(password)
        db_execute("INSERT INTO users (username, password_hash, name) VALUES (%s, %s, %s)", (username, password_hash, name))
        
        token = generate_token(username)
        return {
            'success': True,
            'token': token,
            'message': 'Registration successful'
        }
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error during registration: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post('/api/login')
async def login(req: LoginRequest):
    try:
        username = req.username
        password = req.password
        
        if not username or not password:
            raise HTTPException(status_code=400, detail='Username and password are required')
            
        username = username.strip()
        
        # Check admin credentials table first
        admin_rec = db_fetchone("SELECT * FROM admin_credentials WHERE LOWER(username) = LOWER(%s)", (username,))
        if admin_rec:
            if admin_rec.get('password_hash') == hash_password(password):
                token = generate_token(admin_rec['username'])
                return {
                    'success': True,
                    'token': token,
                    'role': 'admin',
                    'username': admin_rec['username'],
                    'name': 'System Administrator',
                    'message': 'Admin login successful'
                }
        elif username.lower() == ADMIN_USERNAME.lower() and password == ADMIN_PASSWORD:
            token = generate_token(ADMIN_USERNAME)
            return {
                'success': True,
                'token': token,
                'role': 'admin',
                'username': ADMIN_USERNAME,
                'name': 'System Administrator',
                'message': 'Admin login successful'
            }

        user = db_fetchone("SELECT * FROM users WHERE LOWER(username) = LOWER(%s)", (username,))
        if user:
            password_hash = hash_password(password)
            if user['password_hash'] == password_hash:
                token = generate_token(user['username'])
                return {
                    'success': True,
                    'token': token,
                    'role': 'user',
                    'username': user['username'],
                    'name': user['name'],
                    'message': 'Login successful'
                }
                
        raise HTTPException(status_code=401, detail='Invalid username or password')
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error during login: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get('/api/user/profile')
async def get_user_profile(
    authorization: Optional[str] = Header(None),
    token: str = Depends(get_auth_token)
):
    try:
        username = extract_username_from_auth(authorization)
        if username and username.lower() == ADMIN_USERNAME.lower():
            return {
                'username': ADMIN_USERNAME,
                'name': 'System Administrator',
                'role': 'admin',
                'created_at': 'System Default'
            }
        
        user = db_fetchone("SELECT username, name, created_at FROM users WHERE username = %s", (username,))
        if not user:
            raise HTTPException(status_code=404, detail='User not found')
        user['role'] = 'user'
        return user
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.put('/api/user/profile')
async def update_user_profile(
    req: ProfileUpdateRequest,
    authorization: Optional[str] = Header(None),
    token: str = Depends(get_auth_token)
):
    try:
        username = extract_username_from_auth(authorization)
        if username and username.lower() == ADMIN_USERNAME.lower():
            raise HTTPException(status_code=400, detail='Cannot update system administrator profile')
            
        new_name = req.name
        if not new_name or len(new_name.strip()) < 2:
            raise HTTPException(status_code=400, detail='Name must be at least 2 characters long')
            
        db_execute("UPDATE users SET name = %s WHERE username = %s", (new_name.strip(), username))
        return {'success': True, 'message': 'Profile updated successfully', 'name': new_name.strip()}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.put('/api/user/password')
async def update_user_password(
    req: PasswordUpdateRequest,
    authorization: Optional[str] = Header(None),
    token: str = Depends(get_auth_token)
):
    try:
        username = extract_username_from_auth(authorization)
        if username and username.lower() == ADMIN_USERNAME.lower():
            raise HTTPException(status_code=400, detail='Cannot update system administrator password')
            
        current_password = req.current_password
        new_password = req.new_password
        
        if not current_password or not new_password:
            raise HTTPException(status_code=400, detail='Current and new password are required')
        if len(new_password) < 6:
            raise HTTPException(status_code=400, detail='New password must be at least 6 characters long')
            
        user = db_fetchone("SELECT * FROM users WHERE username = %s", (username,))
        if not user or user['password_hash'] != hash_password(current_password):
            raise HTTPException(status_code=401, detail='Incorrect current password')
            
        new_hash = hash_password(new_password)
        db_execute("UPDATE users SET password_hash = %s WHERE username = %s", (new_hash, username))
        return {'success': True, 'message': 'Password updated successfully'}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.delete('/api/user/account')
async def delete_user_account(
    authorization: Optional[str] = Header(None),
    token: str = Depends(get_auth_token)
):
    try:
        username = extract_username_from_auth(authorization)
        if username and username.lower() == ADMIN_USERNAME.lower():
            raise HTTPException(status_code=400, detail='Cannot delete system administrator account')
            
        db_execute("DELETE FROM users WHERE username = %s", (username,))
        return {'success': True, 'message': 'Account deleted successfully'}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
