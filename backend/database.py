import os
import json
import sqlite3
import pymysql
from typing import Optional, Any

from config import (
    BASE_DIR, MODELS_DIR, load_dotenv, ADMIN_USERNAME, ADMIN_PASSWORD,
    SUPABASE_URL, SUPABASE_KEY, HAS_SUPABASE_LIB, HAS_PSYCOPG2
)
from auth import hash_password

DB_MODE = 'SQLITE'  # Modes: 'SUPABASE', 'MYSQL', or 'SQLITE'
USE_SQLITE = False
supabase_client: Optional[Any] = None

def get_db_connection():
    return pymysql.connect(
        host=os.environ.get('MYSQL_HOST', 'localhost'),
        user=os.environ.get('MYSQL_USER', 'root'),
        password=os.environ.get('MYSQL_PASSWORD', ''),
        database=os.environ.get('MYSQL_DB', 'health_risk_db'),
        charset='utf8mb4',
        cursorclass=pymysql.cursors.DictCursor
    )

def sync_supabase_schema():
    """Auto-synchronizes supabase_schema.sql with Supabase Cloud Database."""
    schema_path = os.path.join(BASE_DIR, "supabase_schema.sql")
    if not os.path.exists(schema_path):
        return

    try:
        db_url = os.environ.get("SUPABASE_DB_URL", "").strip() or os.environ.get("POSTGRES_URL", "").strip()
        if db_url and HAS_PSYCOPG2:
            import psycopg2
            print("Auto-synchronizing supabase_schema.sql with Supabase PostgreSQL database...")
            with open(schema_path, "r", encoding="utf-8") as f:
                sql_content = f.read()
            conn = psycopg2.connect(db_url)
            cursor = conn.cursor()
            cursor.execute(sql_content)
            conn.commit()
            cursor.close()
            conn.close()
            print("Successfully synchronized supabase_schema.sql with Supabase Cloud Database!")
    except Exception as err:
        print(f"Notice during automatic schema synchronization: {err}")

def init_db():
    global DB_MODE, USE_SQLITE, supabase_client
    
    load_dotenv()
    sb_url = os.environ.get('SUPABASE_URL', '').strip()
    sb_key = os.environ.get('SUPABASE_KEY', '').strip() or os.environ.get('SUPABASE_SECRET_KEY', '').strip() or os.environ.get('SUPABASE_PUBLISHABLE_KEY', '').strip()

    # 1. Try Supabase Cloud Database first
    if HAS_SUPABASE_LIB and sb_url and sb_key:
        try:
            from supabase import create_client
            print(f"Connecting to Supabase Cloud Database ({sb_url})...")
            client = create_client(sb_url, sb_key)
            client.table('users').select('id').limit(1).execute()
            supabase_client = client
            DB_MODE = 'SUPABASE'
            USE_SQLITE = False
            print("Supabase Cloud Database connected and verified successfully. DB_MODE = 'SUPABASE'")
            sync_supabase_schema()
            return
        except Exception as sb_err:
            print(f"Supabase connection check failed: {sb_err}")
            print("Supabase unavailable or not configured. Falling back to MySQL / SQLite.")

    # 2. Try MySQL connection
    try:
        conn = pymysql.connect(
            host=os.environ.get('MYSQL_HOST', 'localhost'),
            user=os.environ.get('MYSQL_USER', 'root'),
            password=os.environ.get('MYSQL_PASSWORD', ''),
            charset='utf8mb4',
            cursorclass=pymysql.cursors.DictCursor
        )
        with conn.cursor() as cursor:
            db_name = os.environ.get('MYSQL_DB', 'health_risk_db')
            cursor.execute(f"CREATE DATABASE IF NOT EXISTS {db_name}")
        conn.close()
        
        conn = get_db_connection()
        with conn.cursor() as cursor:
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS assessments (
                    id VARCHAR(50) PRIMARY KEY,
                    name VARCHAR(100) NOT NULL,
                    timestamp VARCHAR(50) NOT NULL,
                    personal JSON NOT NULL,
                    lifestyle JSON NOT NULL,
                    medical JSON NOT NULL,
                    results JSON NOT NULL
                )
            """)
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS users (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    username VARCHAR(100) NOT NULL UNIQUE,
                    password_hash VARCHAR(255) NOT NULL,
                    name VARCHAR(100) NOT NULL,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            """)
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS admin_credentials (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    username VARCHAR(100) NOT NULL UNIQUE,
                    password_hash VARCHAR(255) NOT NULL,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            """)
            cursor.execute("SELECT COUNT(*) as cnt FROM admin_credentials")
            row = cursor.fetchone()
            if row and row['cnt'] == 0:
                admin_user = os.environ.get('ADMIN_USERNAME', 'admin')
                admin_pass = os.environ.get('ADMIN_PASSWORD', 'admin123')
                admin_hash = hash_password(admin_pass)
                cursor.execute("INSERT INTO admin_credentials (username, password_hash) VALUES (%s, %s)", (admin_user, admin_hash))
            try:
                cursor.execute("ALTER TABLE users ADD COLUMN name VARCHAR(100) DEFAULT 'User'")
            except Exception:
                pass
        conn.commit()
        conn.close()
        print("MySQL database and tables verified/created successfully. DB_MODE = 'MYSQL'")
        DB_MODE = 'MYSQL'
        USE_SQLITE = False
        return
    except Exception as e:
        print(f"Error during MySQL database initialization: {e}")
        print("MySQL connection failed. Falling back to local SQLite storage.")

    # 3. Fallback to Local SQLite
    DB_MODE = 'SQLITE'
    USE_SQLITE = True
    try:
        os.makedirs(MODELS_DIR, exist_ok=True)
        conn = sqlite3.connect(os.path.join(MODELS_DIR, "local_storage.db"))
        cursor = conn.cursor()
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS assessments (
                id TEXT PRIMARY KEY,
                name TEXT NOT NULL,
                timestamp TEXT NOT NULL,
                personal TEXT NOT NULL,
                lifestyle TEXT NOT NULL,
                medical TEXT NOT NULL,
                results TEXT NOT NULL
            )
        """)
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                username TEXT NOT NULL UNIQUE,
                password_hash TEXT NOT NULL,
                name TEXT NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """)
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS admin_credentials (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                username TEXT NOT NULL UNIQUE,
                password_hash TEXT NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """)
        cursor.execute("SELECT COUNT(*) FROM admin_credentials")
        cnt = cursor.fetchone()[0]
        if cnt == 0:
            admin_user = os.environ.get('ADMIN_USERNAME', 'admin')
            admin_pass = os.environ.get('ADMIN_PASSWORD', 'admin123')
            admin_hash = hash_password(admin_pass)
            cursor.execute("INSERT INTO admin_credentials (username, password_hash) VALUES (?, ?)", (admin_user, admin_hash))
        try:
            cursor.execute("ALTER TABLE users ADD COLUMN name TEXT DEFAULT 'User'")
        except Exception:
            pass
        conn.commit()
        conn.close()
        print("SQLite local database and tables verified/created successfully. DB_MODE = 'SQLITE'")
    except Exception as sq_err:
        print(f"Critical Error: Failed to initialize SQLite local database: {sq_err}")

def db_execute(query: str, params: tuple = None):
    if params is None:
        params = ()

    query_upper = query.strip().upper()
    if "ADMIN_CREDENTIALS" in query_upper:
        if "UPDATE" in query_upper or "DELETE" in query_upper:
            raise Exception("Admin credentials table is read-only and cannot be modified or deleted.")

    if DB_MODE == 'SUPABASE' and supabase_client is not None:
        try:
            if "INSERT INTO ASSESSMENTS" in query_upper:
                p = params
                p_personal = json.loads(p[3]) if isinstance(p[3], str) else p[3]
                p_lifestyle = json.loads(p[4]) if isinstance(p[4], str) else p[4]
                p_medical = json.loads(p[5]) if isinstance(p[5], str) else p[5]
                p_results = json.loads(p[6]) if isinstance(p[6], str) else p[6]
                
                payload = {
                    "id": str(p[0]),
                    "name": str(p[1]),
                    "timestamp": str(p[2]),
                    "personal": p_personal,
                    "lifestyle": p_lifestyle,
                    "medical": p_medical,
                    "results": p_results
                }
                supabase_client.table("assessments").insert(payload).execute()
                return
                
            elif "INSERT INTO USERS" in query_upper:
                p = params
                payload = {
                    "username": str(p[0]),
                    "password_hash": str(p[1]),
                    "name": str(p[2])
                }
                supabase_client.table("users").insert(payload).execute()
                return

            elif "INSERT INTO ADMIN_CREDENTIALS" in query_upper:
                p = params
                payload = {
                    "username": str(p[0]),
                    "password_hash": str(p[1])
                }
                supabase_client.table("admin_credentials").insert(payload).execute()
                return
                
            elif "UPDATE USERS SET NAME =" in query_upper:
                new_name, username = params
                supabase_client.table("users").update({"name": str(new_name)}).eq("username", str(username)).execute()
                return
                
            elif "UPDATE USERS SET PASSWORD_HASH =" in query_upper:
                new_hash, username = params
                supabase_client.table("users").update({"password_hash": str(new_hash)}).eq("username", str(username)).execute()
                return
                
            elif "DELETE FROM USERS WHERE USERNAME =" in query_upper:
                username = params[0]
                supabase_client.table("users").delete().eq("username", str(username)).execute()
                return
                
            elif "DELETE FROM ASSESSMENTS WHERE ID =" in query_upper:
                assess_id = params[0]
                supabase_client.table("assessments").delete().eq("id", str(assess_id)).execute()
                return
        except Exception as sb_ex_err:
            print(f"Supabase db_execute error: {sb_ex_err}")
            raise sb_ex_err

    if USE_SQLITE:
        sqlite_query = query.replace("%s", "?")
        conn = sqlite3.connect(os.path.join(MODELS_DIR, "local_storage.db"))
        cursor = conn.cursor()
        cursor.execute(sqlite_query, params)
        conn.commit()
        conn.close()
    else:
        conn = get_db_connection()
        with conn.cursor() as cursor:
            cursor.execute(query, params)
        conn.commit()
        conn.close()

def db_fetchall(query: str, params: tuple = None):
    if params is None:
        params = ()

    if DB_MODE == 'SUPABASE' and supabase_client is not None:
        try:
            query_upper = query.strip().upper()
            if "FROM USERS" in query_upper:
                res = supabase_client.table("users").select("username, name, created_at").order("created_at", desc=True).execute()
                data = res.data or []
                for row in data:
                    if 'created_at' in row and row['created_at']:
                        row['created_at'] = str(row['created_at'])
                return data
                
            elif "FROM ASSESSMENTS" in query_upper:
                if "SELECT ID FROM ASSESSMENTS" in query_upper:
                    res = supabase_client.table("assessments").select("id").execute()
                else:
                    res = supabase_client.table("assessments").select("*").order("timestamp", desc=True).execute()
                return res.data or []
        except Exception as sb_fa_err:
            print(f"Supabase db_fetchall error: {sb_fa_err}")
            raise sb_fa_err

    if USE_SQLITE:
        sqlite_query = query.replace("%s", "?")
        conn = sqlite3.connect(os.path.join(MODELS_DIR, "local_storage.db"))
        conn.row_factory = sqlite3.Row
        cursor = conn.cursor()
        cursor.execute(sqlite_query, params)
        rows = cursor.fetchall()
        result = [dict(row) for row in rows]
        conn.close()
        return result
    else:
        conn = get_db_connection()
        with conn.cursor() as cursor:
            cursor.execute(query, params)
            result = cursor.fetchall()
        conn.close()
        return result

def db_fetchone(query: str, params: tuple = None):
    if params is None:
        params = ()

    if DB_MODE == 'SUPABASE' and supabase_client is not None:
        try:
            query_upper = query.strip().upper()
            if "FROM ADMIN_CREDENTIALS" in query_upper:
                username = str(params[0]) if params else ""
                res = supabase_client.table("admin_credentials").select("*").ilike("username", username).execute()
                data = res.data
                if data and len(data) > 0:
                    admin_rec = dict(data[0])
                    if 'created_at' in admin_rec and admin_rec['created_at']:
                        admin_rec['created_at'] = str(admin_rec['created_at'])
                    return admin_rec
                return None

            elif "FROM USERS" in query_upper:
                username = str(params[0]) if params else ""
                if "SELECT USERNAME, NAME, CREATED_AT" in query_upper:
                    res = supabase_client.table("users").select("username, name, created_at").eq("username", username).execute()
                else:
                    res = supabase_client.table("users").select("*").ilike("username", username).execute()
                data = res.data
                if data and len(data) > 0:
                    user_record = dict(data[0])
                    if 'created_at' in user_record and user_record['created_at']:
                        user_record['created_at'] = str(user_record['created_at'])
                    return user_record
                return None
        except Exception as sb_fo_err:
            print(f"Supabase db_fetchone error: {sb_fo_err}")
            raise sb_fo_err

    if USE_SQLITE:
        sqlite_query = query.replace("%s", "?")
        conn = sqlite3.connect(os.path.join(MODELS_DIR, "local_storage.db"))
        conn.row_factory = sqlite3.Row
        cursor = conn.cursor()
        cursor.execute(sqlite_query, params)
        row = cursor.fetchone()
        result = dict(row) if row else None
        conn.close()
        return result
    else:
        conn = get_db_connection()
        with conn.cursor() as cursor:
            cursor.execute(query, params)
            result = cursor.fetchone()
        conn.close()
        return result
