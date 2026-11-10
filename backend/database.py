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
    """Production-grade thread-safe connection pool with health checking,

    leak protection, and proper connection counter synchronization.
    """
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
            autocommit=False,
            connect_timeout=10
        )

    def get_connection(self):
        # 1. Try to fetch an idle connection from the pool
        try:
            conn = self._pool.get_nowait()
            try:
                conn.ping(reconnect=True)
                return conn
            except Exception:
                try:
                    conn.close()
                except Exception:
                    pass
                with self._lock:
                    self._created_connections = max(0, self._created_connections - 1)
        except queue.Empty:
            pass

        # 2. Check if we can create a new connection
        with self._lock:
            if self._created_connections < self.max_connections:
                self._created_connections += 1
                try:
                    return self._create_new_connection()
                except Exception:
                    self._created_connections = max(0, self._created_connections - 1)
                    raise

        # 3. Pool is saturated; wait up to 10 seconds for a connection to be released
        try:
            conn = self._pool.get(timeout=10)
            try:
                conn.ping(reconnect=True)
                return conn
            except Exception:
                try:
                    conn.close()
                except Exception:
                    pass
                with self._lock:
                    self._created_connections = max(0, self._created_connections - 1)
                return self.get_connection()
        except queue.Empty:
            raise RuntimeError("Database connection pool exhausted: timeout waiting for available connection.")

    def release_connection(self, conn):
        if not conn:
            return
        try:
            # Rollback any uncommitted transaction to prevent dirty state reuse
            try:
                conn.rollback()
            except Exception:
                pass
            self._pool.put_nowait(conn)
        except queue.Full:
            try:
                conn.close()
            except Exception:
                pass
            with self._lock:
                self._created_connections = max(0, self._created_connections - 1)
        except Exception:
            try:
                conn.close()
            except Exception:
                pass
            with self._lock:
                self._created_connections = max(0, self._created_connections - 1)

mysql_pool = MySQLConnectionPool(max_connections=10)

def get_db_connection():
    return mysql_pool.get_connection()


# =====================================================================
# SQLite Helper with WAL Mode & Connection Hardening
# =====================================================================
def _get_sqlite_db_path() -> str:
    os.makedirs(MODELS_DIR, exist_ok=True)
    return os.path.join(MODELS_DIR, "local_storage.db")

def _get_sqlite_connection() -> sqlite3.Connection:
    conn = sqlite3.connect(_get_sqlite_db_path(), timeout=30.0, check_same_thread=False)
    conn.execute("PRAGMA journal_mode=WAL;")
    conn.execute("PRAGMA synchronous=NORMAL;")
    conn.execute("PRAGMA busy_timeout=5000;")
    conn.execute("PRAGMA foreign_keys=ON;")
    return conn

def _format_sqlite_query(query: str) -> str:
    """Safely converts MySQL %s placeholders to SQLite ? placeholders

    without corrupting date format strings (e.g. strftime('%Y-%m-%d'))
    or escaped percent signs (%%).
    """
    # Replace %s only when it represents a parameter placeholder outside quotes
    tokens = []
    in_quote = False
    quote_char = ''
    i = 0
    n = len(query)

    while i < n:
        char = query[i]
        if char in ("'", '"'):
            if not in_quote:
                in_quote = True
                quote_char = char
            elif char == quote_char:
                # Check for escaped quotes like ''
                if i + 1 < n and query[i + 1] == quote_char:
                    tokens.append(char)
                    tokens.append(query[i + 1])
                    i += 2
                    continue
                in_quote = False
            tokens.append(char)
            i += 1
        elif not in_quote and char == '%' and i + 1 < n:
            if query[i + 1] == 's':
                tokens.append('?')
                i += 2
            elif query[i + 1] == '%':
                tokens.append('%')
                i += 2
            else:
                tokens.append(char)
                i += 1
        else:
            tokens.append(char)
            i += 1

    return "".join(tokens)


# =====================================================================
# Schema Synchronization & Database Initialization
# =====================================================================
def sync_supabase_schema():
    """Auto-synchronizes schema with Supabase Cloud Database."""
    schema_path = os.path.join(BASE_DIR, "supabase_schema.sql")

    try:
        db_url = os.environ.get("SUPABASE_DB_URL", "").strip() or os.environ.get("POSTGRES_URL", "").strip()
        if db_url and HAS_PSYCOPG2:
            import psycopg2
            logger.info("Auto-synchronizing schema with Supabase PostgreSQL database...")
            conn = psycopg2.connect(db_url, connect_timeout=10)
            conn.autocommit = True
            cursor = conn.cursor()
            
            try:
                cursor.execute("ALTER TABLE public.assessments ADD COLUMN IF NOT EXISTS username TEXT NOT NULL DEFAULT 'admin';")
            except Exception as e:
                logger.debug(f"Notice on assessments column migration: {e}")

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
                logger.debug(f"Notice on audit_logs table migration: {e}")

            # Performance indexes
            try:
                cursor.execute("CREATE INDEX IF NOT EXISTS idx_assessments_username_timestamp ON public.assessments (username, timestamp DESC);")
                cursor.execute("CREATE INDEX IF NOT EXISTS idx_audit_logs_timestamp ON public.audit_logs (timestamp DESC);")
            except Exception as idx_err:
                logger.debug(f"Notice on index creation: {idx_err}")

            if os.path.exists(schema_path):
                try:
                    with open(schema_path, "r", encoding="utf-8") as f:
                        sql_content = f.read()
                    cursor.execute(sql_content)
                except Exception as s_err:
                    logger.debug(f"Notice on schema SQL execution: {s_err}")

            try:
                cursor.execute("NOTIFY pgrst, 'reload schema';")
            except Exception:
                pass

            cursor.close()
            conn.close()
            logger.info("Successfully synchronized schema with Supabase Cloud Database!")
    except Exception as err:
        logger.warning(f"Notice during automatic schema synchronization: {err}")

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
                logger.debug(f"Notice during Supabase admin credential sync: {ad_err}")

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
            cursorclass=pymysql.cursors.DictCursor,
            connect_timeout=5
        )
        try:
            with conn.cursor() as cursor:
                cursor.execute("CREATE DATABASE IF NOT EXISTS health_risk_db")
        finally:
            conn.close()
        
        conn = get_db_connection()
        try:
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
                
                try:
                    cursor.execute("SELECT username FROM assessments LIMIT 1")
                except Exception:
                    try:
                        cursor.execute("ALTER TABLE assessments ADD COLUMN username VARCHAR(100) NOT NULL DEFAULT 'admin'")
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
                
                cursor.execute("""
                    CREATE TABLE IF NOT EXISTS admin_credentials (
                        id INT AUTO_INCREMENT PRIMARY KEY,
                        username VARCHAR(100) NOT NULL UNIQUE,
                        password_hash VARCHAR(255) NOT NULL,
                        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                    )
                """)
                
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

                # Performance indexes for MySQL
                try:
                    cursor.execute("CREATE INDEX idx_assessments_user_ts ON assessments (username, timestamp)")
                except Exception:
                    pass
                try:
                    cursor.execute("CREATE INDEX idx_audit_logs_ts ON audit_logs (timestamp)")
                except Exception:
                    pass
                
                cursor.execute("SELECT COUNT(*) as cnt FROM admin_credentials")
                row = cursor.fetchone()
                if row and row['cnt'] == 0:
                    admin_user = os.environ.get('ADMIN_USERNAME', 'Ayushman24')
                    admin_pass = os.environ.get('ADMIN_PASSWORD', 'Ayushman@#2005')
                    admin_hash = hash_password(admin_pass)
                    cursor.execute("INSERT INTO admin_credentials (username, password_hash) VALUES (%s, %s)", (admin_user, admin_hash))
                
                try:
                    cursor.execute("ALTER TABLE users ADD COLUMN name VARCHAR(100) DEFAULT 'User'")
                except Exception:
                    pass

                conn.commit()
            print("MySQL database and tables verified/created successfully. DB_MODE = 'MYSQL'")
            DB_MODE = 'MYSQL'
            USE_SQLITE = False
            return
        finally:
            mysql_pool.release_connection(conn)
    except Exception as e:
        print(f"Error during MySQL database initialization: {e}")
        print("MySQL connection failed. Falling back to local SQLite storage.")

    # 3. Fallback to Local SQLite
    DB_MODE = 'SQLITE'
    USE_SQLITE = True
    try:
        conn = _get_sqlite_connection()
        try:
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

            # Indexes for SQLite performance
            cursor.execute("CREATE INDEX IF NOT EXISTS idx_assessments_username_timestamp ON assessments (username, timestamp DESC);")
            cursor.execute("CREATE INDEX IF NOT EXISTS idx_audit_logs_timestamp ON audit_logs (timestamp DESC);")

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
            print("SQLite local database and tables verified/created successfully. DB_MODE = 'SQLITE'")
        finally:
            conn.close()
    except Exception as sq_err:
        print(f"Critical Error: Failed to initialize SQLite local database: {sq_err}")


# =====================================================================
# Audit Logging
# =====================================================================
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


# =====================================================================
# Database Query Execution (db_execute, db_fetchall, db_fetchone)
# =====================================================================
def db_execute(query: str, params: tuple = None):
    if params is None:
        params = ()

    query_upper = query.strip().upper()

    # Prevent accidental permanent deletion of root administrator account
    if "DELETE FROM ADMIN_CREDENTIALS" in query_upper:
        root_admin = (ADMIN_USERNAME or 'ayushman24').lower()
        if params and str(params[0]).lower() == root_admin:
            raise ValueError("Root system administrator account cannot be deleted.")

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
                
            elif "UPDATE USERS" in query_upper and "SET NAME =" in query_upper:
                new_name, username = params
                supabase_client.table("users").update({"name": str(new_name)}).ilike("username", str(username)).execute()
                return
                
            elif "UPDATE USERS" in query_upper and "SET PASSWORD_HASH =" in query_upper:
                new_hash, username = params
                supabase_client.table("users").update({"password_hash": str(new_hash)}).ilike("username", str(username)).execute()
                return

            elif "UPDATE ADMIN_CREDENTIALS" in query_upper and "SET PASSWORD_HASH =" in query_upper:
                new_hash, username = params
                supabase_client.table("admin_credentials").update({"password_hash": str(new_hash)}).ilike("username", str(username)).execute()
                return
                
            elif "DELETE FROM USERS" in query_upper:
                username = params[0]
                supabase_client.table("users").delete().ilike("username", str(username)).execute()
                return

            elif "DELETE FROM ADMIN_CREDENTIALS" in query_upper:
                username = params[0]
                supabase_client.table("admin_credentials").delete().ilike("username", str(username)).execute()
                return
                
            elif "DELETE FROM ASSESSMENTS" in query_upper and ("USERNAME" in query_upper):
                username = params[0]
                supabase_client.table("assessments").delete().ilike("username", str(username)).execute()
                return

            elif "DELETE FROM ASSESSMENTS" in query_upper and ("ID" in query_upper):
                assess_id = params[0]
                supabase_client.table("assessments").delete().eq("id", str(assess_id)).execute()
                return

            elif "DELETE FROM AUDIT_LOGS" in query_upper:
                supabase_client.table("audit_logs").delete().neq("id", "none").execute()
                return

            else:
                logger.warning(f"Unmatched Supabase query pattern in db_execute: {query}")
                raise NotImplementedError(f"Query not supported in Supabase adapter: {query}")
        except Exception as sb_ex_err:
            logger.exception(f"Supabase db_execute error for query: {query}")
            raise sb_ex_err

    if USE_SQLITE:
        sqlite_query = _format_sqlite_query(query)
        conn = _get_sqlite_connection()
        try:
            cursor = conn.cursor()
            cursor.execute(sqlite_query, params)
            conn.commit()
        finally:
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

            elif "FROM ADMIN_CREDENTIALS" in query_upper:
                res = supabase_client.table("admin_credentials").select("username, created_at").execute()
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
                            filtered = []
                            for row in all_data:
                                p_data = row.get('personal')
                                if isinstance(p_data, str):
                                    try:
                                        p_data = json.loads(p_data)
                                    except Exception:
                                        p_data = {}
                                p_name = p_data.get('name', '') if isinstance(p_data, dict) else ''
                                if (
                                    (row.get('username') and str(row.get('username')).lower() == username.lower())
                                    or (p_name and str(p_name).lower() == username.lower())
                                    or str(row.get('name', '')).lower() == username.lower()
                                ):
                                    filtered.append(row)
                            return filtered
                        raise select_err
                elif "WHERE ID =" in query_upper:
                    assess_id = str(params[0]) if params else ""
                    res = supabase_client.table("assessments").select("*").eq("id", assess_id).execute()
                    return res.data or []
                elif "GROUP BY USERNAME" in query_upper or "GROUP BY LOWER(USERNAME)" in query_upper:
                    res = supabase_client.table("assessments").select("username").execute()
                    all_rows = res.data or []
                    counts = {}
                    for row in all_rows:
                        u = row.get("username")
                        if u:
                            u_lower = str(u).lower()
                            counts[u_lower] = counts.get(u_lower, 0) + 1
                    return [{"username": k, "count": v} for k, v in counts.items()]
                else:
                    res = supabase_client.table("assessments").select("*").order("timestamp", desc=True).execute()
                    return res.data or []
            else:
                logger.warning(f"Unmatched Supabase query in db_fetchall: {query}")
                raise NotImplementedError(f"Query not supported in Supabase adapter: {query}")
        except Exception as sb_fa_err:
            logger.exception(f"Supabase db_fetchall error for query: {query}")
            raise sb_fa_err

    if USE_SQLITE:
        sqlite_query = _format_sqlite_query(query)
        conn = _get_sqlite_connection()
        try:
            conn.row_factory = sqlite3.Row
            cursor = conn.cursor()
            cursor.execute(sqlite_query, params)
            rows = cursor.fetchall()
            return [dict(row) for row in rows]
        finally:
            conn.close()
    else:
        conn = get_db_connection()
        try:
            with conn.cursor() as cursor:
                cursor.execute(query, params)
                return cursor.fetchall()
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
            else:
                logger.warning(f"Unmatched Supabase query in db_fetchone: {query}")
                raise NotImplementedError(f"Query not supported in Supabase adapter: {query}")
        except Exception as sb_fo_err:
            logger.exception(f"Supabase db_fetchone error for query: {query}")
            raise sb_fo_err

    if USE_SQLITE:
        sqlite_query = _format_sqlite_query(query)
        conn = _get_sqlite_connection()
        try:
            conn.row_factory = sqlite3.Row
            cursor = conn.cursor()
            cursor.execute(sqlite_query, params)
            row = cursor.fetchone()
            return dict(row) if row else None
        finally:
            conn.close()
    else:
        conn = get_db_connection()
        try:
            with conn.cursor() as cursor:
                cursor.execute(query, params)
                return cursor.fetchone()
        finally:
            mysql_pool.release_connection(conn)
