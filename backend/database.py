import os
import re
import json
import sqlite3
import pymysql
import threading
import queue
import logging
import secrets
from datetime import datetime
from typing import Optional, Any, List, Dict

from config import (
    BASE_DIR, MODELS_DIR, load_dotenv, ADMIN_USERNAME, ADMIN_PASSWORD,
    SUPABASE_URL, SUPABASE_KEY, HAS_SUPABASE_LIB, HAS_PSYCOPG2
)
from auth import hash_password

logger = logging.getLogger("database")

DB_MODE = 'SQLITE'  # Modes: 'SUPABASE', 'MYSQL', or 'SQLITE'
USE_SQLITE = False
supabase_client: Optional[Any] = None

# =====================================================================
# Thread-Safe MySQL Connection Pool Manager
# =====================================================================
class MySQLConnectionPool:
    def __init__(self, max_connections: int = 10):
        self.max_connections = max_connections
        self._pool = queue.Queue(maxsize=max_connections)
        self._lock = threading.Lock()
        self._created_connections = 0

    def _create_new_connection(self):
        return pymysql.connect(
            host=os.environ.get('MYSQL_HOST', 'localhost'),
            user=os.environ.get('MYSQL_USER', 'root'),
            password=os.environ.get('MYSQL_PASSWORD', ''),
            database=os.environ.get('MYSQL_DB', 'health_risk_db'),
            charset='utf8mb4',
            cursorclass=pymysql.cursors.DictCursor,
            autocommit=False
        )

    def get_connection(self):
        try:
            conn = self._pool.get_nowait()
            try:
                conn.ping(reconnect=True)
                return conn
            except Exception:
                return self._create_new_connection()
        except queue.Empty:
            with self._lock:
                if self._created_connections < self.max_connections:
                    self._created_connections += 1
                    return self._create_new_connection()
            return self._pool.get(timeout=10)

    def release_connection(self, conn):
        if conn:
            try:
                self._pool.put_nowait(conn)
            except queue.Full:
                try:
                    conn.close()
                except Exception:
                    pass

mysql_pool = MySQLConnectionPool(max_connections=10)

def get_db_connection():
    return mysql_pool.get_connection()

def sync_supabase_schema():
    """Auto-synchronizes schema with Supabase Cloud Database."""
    schema_path = os.path.join(BASE_DIR, "supabase_schema.sql")

    try:
        db_url = os.environ.get("SUPABASE_DB_URL", "").strip() or os.environ.get("POSTGRES_URL", "").strip()
        if db_url and HAS_PSYCOPG2:
            import psycopg2
            print("Auto-synchronizing schema with Supabase PostgreSQL database...")
            conn = psycopg2.connect(db_url)
            conn.autocommit = True
            cursor = conn.cursor()
            
            # 1. Ensure username column exists on assessments table
            try:
                cursor.execute("ALTER TABLE public.assessments ADD COLUMN IF NOT EXISTS username TEXT NOT NULL DEFAULT 'admin';")
            except Exception as e:
                print(f"Notice on assessments column migration: {e}")

            # 2. Ensure audit_logs table exists
            try:
                cursor.execute("""
                    CREATE TABLE IF NOT EXISTS public.audit_logs (
                        id TEXT PRIMARY KEY,
                        timestamp TEXT NOT NULL,
                        username TEXT NOT NULL,
                        action TEXT NOT NULL,
                        category TEXT NOT NULL,
                        details TEXT NOT NULL,
                        ip_address TEXT NOT NULL DEFAULT '127.0.0.1',
                        status TEXT NOT NULL DEFAULT 'SUCCESS',
                        created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
                    );
                """)
            except Exception as e:
                print(f"Notice on audit_logs table migration: {e}")

            # 3. Synchronize full schema file if exists
            if os.path.exists(schema_path):
                try:
                    with open(schema_path, "r", encoding="utf-8") as f:
                        sql_content = f.read()
                    cursor.execute(sql_content)
                except Exception as s_err:
                    print(f"Notice on schema SQL execution: {s_err}")

            # 4. Reload PostgREST schema cache
            try:
                cursor.execute("NOTIFY pgrst, 'reload schema';")
            except Exception:
                pass

            cursor.close()
            conn.close()
            print("Successfully synchronized schema with Supabase Cloud Database!")
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

            # Ensure admin credentials in Supabase use valid bcrypt hash
            try:
                admin_user = os.environ.get('ADMIN_USERNAME', 'Ayushman24')
                admin_pass = os.environ.get('ADMIN_PASSWORD', 'Ayushman@#2005')
                admin_res = client.table('admin_credentials').select('*').ilike('username', admin_user).execute()
                if not admin_res.data:
                    client.table('admin_credentials').insert({'username': admin_user, 'password_hash': hash_password(admin_pass)}).execute()
                else:
                    stored_hash = admin_res.data[0].get('password_hash', '')
                    if not stored_hash.startswith('$2b$') and not stored_hash.startswith('$2a$'):
                        client.table('admin_credentials').update({'password_hash': hash_password(admin_pass)}).ilike('username', admin_user).execute()
            except Exception as ad_err:
                print(f"Notice during Supabase admin credential sync: {ad_err}")

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
            cursor.execute("CREATE DATABASE IF NOT EXISTS health_risk_db")
        conn.close()
        
        conn = get_db_connection()
        with conn.cursor() as cursor:
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS assessments (
                    id VARCHAR(50) PRIMARY KEY,
                    username VARCHAR(100) NOT NULL DEFAULT 'admin',
                    name VARCHAR(100) NOT NULL,
                    timestamp VARCHAR(50) NOT NULL,
                    personal JSON NOT NULL,
                    lifestyle JSON NOT NULL,
                    medical JSON NOT NULL,
                    results JSON NOT NULL
                )
            """)
            conn.commit()
            
            # Ensure username column exists
            try:
                cursor.execute("SELECT username FROM assessments LIMIT 1")
            except Exception:
                try:
                    cursor.execute("ALTER TABLE assessments ADD COLUMN username VARCHAR(100) NOT NULL DEFAULT 'admin'")
                    conn.commit()
                except Exception:
                    pass

            cursor.execute("""
                CREATE TABLE IF NOT EXISTS users (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    username VARCHAR(100) NOT NULL UNIQUE,
                    password_hash VARCHAR(255) NOT NULL,
                    name VARCHAR(100) NOT NULL,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            """)
            conn.commit()
            
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS admin_credentials (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    username VARCHAR(100) NOT NULL UNIQUE,
                    password_hash VARCHAR(255) NOT NULL,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            """)
            conn.commit()
            
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS audit_logs (
                    id VARCHAR(50) PRIMARY KEY,
                    timestamp VARCHAR(50) NOT NULL,
                    username VARCHAR(100) NOT NULL,
                    action VARCHAR(100) NOT NULL,
                    category VARCHAR(100) NOT NULL,
                    details TEXT NOT NULL,
                    ip_address VARCHAR(50) NOT NULL DEFAULT '127.0.0.1',
                    status VARCHAR(20) NOT NULL DEFAULT 'SUCCESS'
                )
            """)
            conn.commit()
            
            cursor.execute("SELECT COUNT(*) as cnt FROM admin_credentials")
            row = cursor.fetchone()
            if row and row['cnt'] == 0:
                admin_user = os.environ.get('ADMIN_USERNAME', 'Ayushman24')
                admin_pass = os.environ.get('ADMIN_PASSWORD', 'Ayushman@#2005')
                admin_hash = hash_password(admin_pass)
                cursor.execute("INSERT INTO admin_credentials (username, password_hash) VALUES (%s, %s)", (admin_user, admin_hash))
                conn.commit()
            try:
                cursor.execute("ALTER TABLE users ADD COLUMN name VARCHAR(100) DEFAULT 'User'")
                conn.commit()
            except Exception:
                pass
        mysql_pool.release_connection(conn)
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
                username TEXT NOT NULL DEFAULT 'admin',
                name TEXT NOT NULL,
                timestamp TEXT NOT NULL,
                personal TEXT NOT NULL,
                lifestyle TEXT NOT NULL,
                medical TEXT NOT NULL,
                results TEXT NOT NULL
            )
        """)
        try:
            cursor.execute("ALTER TABLE assessments ADD COLUMN username TEXT NOT NULL DEFAULT 'admin'")
        except Exception:
            pass

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
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS audit_logs (
                id TEXT PRIMARY KEY,
                timestamp TEXT NOT NULL,
                username TEXT NOT NULL,
                action TEXT NOT NULL,
                category TEXT NOT NULL,
                details TEXT NOT NULL,
                ip_address TEXT NOT NULL DEFAULT '127.0.0.1',
                status TEXT NOT NULL DEFAULT 'SUCCESS'
            )
        """)
        cursor.execute("SELECT COUNT(*) FROM admin_credentials")
        cnt = cursor.fetchone()[0]
        if cnt == 0:
            admin_user = os.environ.get('ADMIN_USERNAME', 'Ayushman24')
            admin_pass = os.environ.get('ADMIN_PASSWORD', 'Ayushman@#2005')
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

def _format_sqlite_query(query: str) -> str:
    """Safely replaces parameter placeholders (%s) with SQLite (?) without replacing % inside literals."""
    return re.sub(r'(?<!%)(%s)', '?', query)

def log_audit_event(action: str, category: str, username: str, details: str, status: str = 'SUCCESS', ip_address: str = '127.0.0.1'):
    """Utility to record high-fidelity telemetry and security audit logs."""
    try:
        log_id = f"audit-{secrets.token_hex(6)}"
        ts = datetime.now().isoformat()
        db_execute(
            "INSERT INTO audit_logs (id, timestamp, username, action, category, details, ip_address, status) VALUES (%s, %s, %s, %s, %s, %s, %s, %s)",
            (
                log_id,
                ts,
                str(username or 'anonymous'),
                str(action),
                str(category),
                str(details),
                str(ip_address or '127.0.0.1'),
                str(status)
            )
        )
    except Exception as err:
        logger.warning(f"Could not write audit log event: {err}")

def db_execute(query: str, params: tuple = None):
    if params is None:
        params = ()

    query_upper = query.strip().upper()
    if "ADMIN_CREDENTIALS" in query_upper:
        if "UPDATE" in query_upper or "DELETE" in query_upper:
            raise Exception("Admin credentials table is read-only and cannot be modified or deleted.")

    if DB_MODE == 'SUPABASE' and supabase_client is not None:
        try:
            if "INSERT INTO AUDIT_LOGS" in query_upper:
                p = params
                payload = {
                    "id": str(p[0]),
                    "timestamp": str(p[1]),
                    "username": str(p[2]),
                    "action": str(p[3]),
                    "category": str(p[4]),
                    "details": str(p[5]),
                    "ip_address": str(p[6]),
                    "status": str(p[7])
                }
                supabase_client.table("audit_logs").insert(payload).execute()
                return

            elif "INSERT INTO ASSESSMENTS" in query_upper:
                p = params
                if len(p) >= 8:
                    assess_id, username, name, timestamp, p_personal, p_lifestyle, p_medical, p_results = p[:8]
                else:
                    assess_id, name, timestamp, p_personal, p_lifestyle, p_medical, p_results = p[:7]
                    username = 'admin'

                p_personal = json.loads(p_personal) if isinstance(p_personal, str) else p_personal
                p_lifestyle = json.loads(p_lifestyle) if isinstance(p_lifestyle, str) else p_lifestyle
                p_medical = json.loads(p_medical) if isinstance(p_medical, str) else p_medical
                p_results = json.loads(p_results) if isinstance(p_results, str) else p_results
                
                payload = {
                    "id": str(assess_id),
                    "username": str(username),
                    "name": str(name),
                    "timestamp": str(timestamp),
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
                supabase_client.table("users").update({"name": str(new_name)}).ilike("username", str(username)).execute()
                return
                
            elif "UPDATE USERS SET PASSWORD_HASH =" in query_upper:
                new_hash, username = params
                supabase_client.table("users").update({"password_hash": str(new_hash)}).ilike("username", str(username)).execute()
                return
                
            elif "DELETE FROM USERS WHERE" in query_upper:
                username = params[0]
                supabase_client.table("users").delete().ilike("username", str(username)).execute()
                return
                
            elif "DELETE FROM ASSESSMENTS WHERE LOWER(USERNAME) =" in query_upper:
                username = params[0]
                supabase_client.table("assessments").delete().ilike("username", str(username)).execute()
                return

            elif "DELETE FROM ASSESSMENTS WHERE ID =" in query_upper:
                assess_id = params[0]
                supabase_client.table("assessments").delete().eq("id", str(assess_id)).execute()
                return

            elif "DELETE FROM AUDIT_LOGS" in query_upper:
                supabase_client.table("audit_logs").delete().neq("id", "none").execute()
                return
        except Exception as sb_ex_err:
            logger.exception("Supabase db_execute error")
            raise sb_ex_err

    if USE_SQLITE:
        sqlite_query = _format_sqlite_query(query)
        conn = sqlite3.connect(os.path.join(MODELS_DIR, "local_storage.db"))
        cursor = conn.cursor()
        cursor.execute(sqlite_query, params)
        conn.commit()
        conn.close()
    else:
        conn = get_db_connection()
        try:
            with conn.cursor() as cursor:
                cursor.execute(query, params)
            conn.commit()
        finally:
            mysql_pool.release_connection(conn)

def db_fetchall(query: str, params: tuple = None) -> List[Dict[str, Any]]:
    if params is None:
        params = ()

    if DB_MODE == 'SUPABASE' and supabase_client is not None:
        try:
            query_upper = query.strip().upper()
            if "FROM AUDIT_LOGS" in query_upper:
                res = supabase_client.table("audit_logs").select("*").order("timestamp", desc=True).limit(200).execute()
                return res.data or []

            elif "FROM USERS" in query_upper:
                res = supabase_client.table("users").select("username, name, created_at").order("created_at", desc=True).execute()
                data = res.data or []
                for row in data:
                    if 'created_at' in row and row['created_at']:
                        row['created_at'] = str(row['created_at'])
                return data
                
            elif "FROM ASSESSMENTS" in query_upper:
                if "SELECT ID FROM ASSESSMENTS" in query_upper:
                    res = supabase_client.table("assessments").select("id").execute()
                    return res.data or []
                elif "WHERE USERNAME =" in query_upper or "WHERE LOWER(USERNAME) =" in query_upper:
                    username = str(params[0]) if params else ""
                    try:
                        res = supabase_client.table("assessments").select("*").ilike("username", username).order("timestamp", desc=True).execute()
                        return res.data or []
                    except Exception as select_err:
                        err_msg = str(select_err).lower()
                        if "username" in err_msg or "42703" in err_msg:
                            res = supabase_client.table("assessments").select("*").order("timestamp", desc=True).execute()
                            all_data = res.data or []
                            filtered = [
                                row for row in all_data
                                if (row.get('username') and str(row.get('username')).lower() == username.lower())
                                or (isinstance(row.get('personal'), dict) and str(row.get('personal', {}).get('name', '')).lower() == username.lower())
                                or str(row.get('name', '')).lower() == username.lower()
                            ]
                            return filtered
                        raise select_err
                else:
                    res = supabase_client.table("assessments").select("*").order("timestamp", desc=True).execute()
                    return res.data or []
        except Exception as sb_fa_err:
            logger.exception("Supabase db_fetchall error")
            raise sb_fa_err

    if USE_SQLITE:
        sqlite_query = _format_sqlite_query(query)
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
        try:
            with conn.cursor() as cursor:
                cursor.execute(query, params)
                result = cursor.fetchall()
            return result
        finally:
            mysql_pool.release_connection(conn)

def db_fetchone(query: str, params: tuple = None) -> Optional[Dict[str, Any]]:
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
                    res = supabase_client.table("users").select("username, name, created_at").ilike("username", username).execute()
                else:
                    res = supabase_client.table("users").select("*").ilike("username", username).execute()
                data = res.data
                if data and len(data) > 0:
                    user_record = dict(data[0])
                    if 'created_at' in user_record and user_record['created_at']:
                        user_record['created_at'] = str(user_record['created_at'])
                    return user_record
                return None

            elif "FROM ASSESSMENTS" in query_upper:
                assess_id = str(params[0]) if params else ""
                res = supabase_client.table("assessments").select("*").eq("id", assess_id).execute()
                data = res.data
                if data and len(data) > 0:
                    return dict(data[0])
                return None
        except Exception as sb_fo_err:
            logger.exception("Supabase db_fetchone error")
            raise sb_fo_err

    if USE_SQLITE:
        sqlite_query = _format_sqlite_query(query)
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
        try:
            with conn.cursor() as cursor:
                cursor.execute(query, params)
                result = cursor.fetchone()
            return result
        finally:
            mysql_pool.release_connection(conn)
