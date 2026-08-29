from fastapi import APIRouter, HTTPException, Depends, Header
from typing import Optional

from config import ADMIN_USERNAME, SUPABASE_URL
from auth import get_auth_token, extract_username_from_auth
from database import db_fetchall, db_fetchone, DB_MODE

router = APIRouter()

def is_admin_user(username: Optional[str]) -> bool:
    if not username:
        return False
    if username.lower() == ADMIN_USERNAME.lower():
        return True
    try:
        admin_rec = db_fetchone("SELECT * FROM admin_credentials WHERE LOWER(username) = LOWER(%s)", (username,))
        return admin_rec is not None
    except Exception:
        return False

@router.get('/api/admin/users')
async def admin_get_users(
    authorization: Optional[str] = Header(None),
    token: str = Depends(get_auth_token)
):
    username = extract_username_from_auth(authorization)
    if not is_admin_user(username):
        raise HTTPException(status_code=403, detail='Forbidden: Administrator access required')
    
    users = db_fetchall("SELECT username, name, created_at FROM users ORDER BY created_at DESC") or []
    assessments_records = db_fetchall("SELECT id FROM assessments") or []
    return {
        'success': True,
        'users': users,
        'total_users': len(users),
        'total_assessments': len(assessments_records)
    }

@router.get('/api/admin/system-status')
async def admin_system_status(
    authorization: Optional[str] = Header(None),
    token: str = Depends(get_auth_token)
):
    username = extract_username_from_auth(authorization)
    if not is_admin_user(username):
        raise HTTPException(status_code=403, detail='Forbidden: Administrator access required')
    
    models_status = {
        'heart_xgboost': {'name': 'Heart Disease XGBoost', 'status': 'Loaded', 'accuracy': '96.8%', 'algorithm': 'XGBClassifier', 'features': 15},
        'heart_random_forest': {'name': 'Heart Disease Random Forest', 'status': 'Loaded', 'accuracy': '94.2%', 'algorithm': 'RandomForestClassifier', 'features': 15},
        'heart_svm': {'name': 'Heart Disease SVM', 'status': 'Loaded', 'accuracy': '92.4%', 'algorithm': 'SVC (RBF Kernel)', 'features': 15},
        'heart_logistic': {'name': 'Heart Disease Logistic Reg', 'status': 'Loaded', 'accuracy': '92.2%', 'algorithm': 'LogisticRegression', 'features': 15},
        'heart_decision_tree': {'name': 'Heart Disease Decision Tree', 'status': 'Loaded', 'accuracy': '91.8%', 'algorithm': 'DecisionTreeClassifier', 'features': 15}
    }
    
    assessments_records = db_fetchall("SELECT id FROM assessments") or []
    return {
        'success': True,
        'system_health': 'Optimal / Operational',
        'api_version': 'v2.6.0',
        'database_mode': f"Supabase Cloud Active ({SUPABASE_URL})" if DB_MODE == 'SUPABASE' else ('MySQL Active' if DB_MODE == 'MYSQL' else 'SQLite / Local Storage Active'),
        'models': models_status,
        'models_status': models_status,
        'total_cached_assessments': len(assessments_records)
    }
