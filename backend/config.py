import os
import sys

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODELS_DIR = os.path.join(BASE_DIR, "models")

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

# Environment Mode
ENVIRONMENT = os.environ.get('ENVIRONMENT', 'development').lower()
IS_PRODUCTION = ENVIRONMENT in ['production', 'prod'] or os.environ.get('RENDER', '') == 'true'

# Admin credentials & security configuration
ADMIN_USERNAME = os.environ.get('ADMIN_USERNAME', 'admin')
ADMIN_PASSWORD = os.environ.get('ADMIN_PASSWORD', 'admin123')

# JWT Secret Key Validation
JWT_SECRET = os.environ.get('JWT_SECRET', '').strip()
if not JWT_SECRET:
    if IS_PRODUCTION:
        raise RuntimeError("CRITICAL SECURITY ERROR: 'JWT_SECRET' environment variable must be set in production mode.")
    else:
        JWT_SECRET = 'healthsence_dev_insecure_secret_key_change_in_prod'
        print("WARNING: JWT_SECRET environment variable is unset. Using development fallback secret.")

# Allowed CORS Origins Whitelist
raw_origins = os.environ.get('ALLOWED_ORIGINS', '').strip()
if raw_origins:
    ALLOWED_ORIGINS = [orig.strip() for orig in raw_origins.split(',') if orig.strip()]
else:
    ALLOWED_ORIGINS = [
        "http://localhost:5173",
        "http://localhost:3000",
        "http://localhost:5000",
        "http://localhost:8000",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:5000",
        "http://127.0.0.1:8000"
    ]

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

