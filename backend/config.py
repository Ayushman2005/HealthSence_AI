import os
import sys

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODELS_DIR = os.path.join(BASE_DIR, "models")

# Load environment variables from .env
def load_dotenv():
    env_path = os.path.join(BASE_DIR, ".env")
    if os.path.exists(env_path):
        with open(env_path, "r", encoding="utf-8") as f:
            for line in f:
                line = line.strip()
                if line and not line.startswith("#"):
                    parts = line.split("=", 1)
                    if len(parts) == 2:
                        key = parts[0].strip()
                        val = parts[1].strip()
                        if val.startswith('"') and val.endswith('"'):
                            val = val[1:-1]
                        elif val.startswith("'") and val.endswith("'"):
                            val = val[1:-1]
                        os.environ[key] = val

load_dotenv()

# Admin credentials & security configuration
ADMIN_USERNAME = os.environ.get('ADMIN_USERNAME', 'Ayushman24')
ADMIN_PASSWORD = os.environ.get('ADMIN_PASSWORD', 'Ayushman@#2005')
JWT_SECRET = os.environ.get('JWT_SECRET', 'healthsence_secret_key_2026')

# Supabase Configurations
SUPABASE_URL = os.environ.get('SUPABASE_URL', '').strip()
SUPABASE_KEY = os.environ.get('SUPABASE_KEY', '').strip() or os.environ.get('SUPABASE_SECRET_KEY', '').strip() or os.environ.get('SUPABASE_PUBLISHABLE_KEY', '').strip()

try:
    from supabase import create_client, Client
    HAS_SUPABASE_LIB = True
except ImportError:
    HAS_SUPABASE_LIB = False

try:
    import psycopg2
    HAS_PSYCOPG2 = True
except ImportError:
    HAS_PSYCOPG2 = False
