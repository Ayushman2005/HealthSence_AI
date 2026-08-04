import warnings
warnings.filterwarnings('ignore')

from contextlib import asynccontextmanager
from fastapi import FastAPI, Request, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from database import init_db, DB_MODE
from ml_engine import load_ml_assets

import routes_auth
import routes_predict
import routes_symptom
import routes_chatbot
import routes_report
import routes_admin

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup tasks
    init_db()
    load_ml_assets()
    yield
    # Shutdown tasks (if any)

app = FastAPI(
    title="Health Risk AI API",
    description="FastAPI Backend for Health Risk AI Prediction System",
    version="2.6.0",
    lifespan=lifespan
)

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Custom exception handler for consistent {"error": "message"} responses
@app.exception_handler(HTTPException)
async def custom_http_exception_handler(request: Request, exc: HTTPException):
    return JSONResponse(
        status_code=exc.status_code,
        content={"error": exc.detail}
    )

# Root Health Check Endpoints
@app.get('/')
@app.get('/api')
@app.get('/api/health')
@app.get('/health')
async def root_health_check():
    return {
        "status": "online",
        "service": "Health Risk AI Backend API",
        "version": "2.6.0",
        "database_mode": DB_MODE
    }

# Include Modular Routers
app.include_router(routes_auth.router)
app.include_router(routes_predict.router)
app.include_router(routes_symptom.router)
app.include_router(routes_chatbot.router)
app.include_router(routes_report.router)
app.include_router(routes_admin.router)

if __name__ == '__main__':
    import uvicorn
    print("Starting FastAPI Backend Server via main.py...")
    uvicorn.run("main:app", host="0.0.0.0", port=5000, reload=True, reload_includes=["*.py", "*.sql", "*.env"])
