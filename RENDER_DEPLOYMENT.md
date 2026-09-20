# Render Backend Deployment Guide 🚀

This guide explains how to deploy the **HealthRisk AI Backend** to [Render](https://render.com).

---

## Method 1: Deploy with Blueprint (`render.yaml`) — 1 Click (Recommended)

1. Commit and push your code to your GitHub repository:
   ```bash
   git add .
   git commit -m "Configure backend for Render deployment"
   git push origin main
   ```
2. Log into the [Render Dashboard](https://dashboard.render.com/).
3. Click **New +** in the top navigation -> Select **Blueprint**.
4. Connect your GitHub repository: `HealthSence_AI` (or `HEALTHRISK_AI`).
5. Render will automatically detect `render.yaml` and configure:
   - **Service Type**: Web Service
   - **Environment**: Python 3.10.12
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `gunicorn main:app -w 1 -k uvicorn.workers.UvicornWorker --timeout 120 --bind 0.0.0.0:$PORT`
6. Fill in the required environment variables:
   - `SUPABASE_URL`: `<your_supabase_url>`
   - `SUPABASE_KEY`: `<your_supabase_secret_key>`
   - `SUPABASE_DB_URL`: `<your_supabase_db_url>`
   - `GROQ_API_KEY`: `<your_groq_api_key>`
   - `ADMIN_USERNAME`: `<your_admin_username>`
   - `ADMIN_PASSWORD`: `<your_admin_password>`
   - `JWT_SECRET`: (Render will automatically generate a secure secret, or paste your custom secret)
7. Click **Apply**. Render will build and deploy your backend!

---

## Method 2: Manual Web Service Setup on Render

If you prefer to configure the service manually:

1. In Render Dashboard, click **New +** -> **Web Service**.
2. Select your GitHub repository.
3. Configure the fields:
   - **Name**: `healthrisk-ai-backend`
   - **Language**: `Python`
   - **Branch**: `main`
   - **Root Directory**: `backend`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `gunicorn main:app -w 1 -k uvicorn.workers.UvicornWorker --timeout 120 --bind 0.0.0.0:$PORT`
   - **Instance Type**: `Free`
4. In the **Environment Variables** section, add:
   - `PYTHON_VERSION`: `3.10.12`
   - `ENVIRONMENT`: `production`
   - `SUPABASE_URL`: `<your_supabase_url>`
   - `SUPABASE_KEY`: `<your_supabase_secret_key>`
   - `SUPABASE_DB_URL`: `<your_supabase_db_url>`
   - `GROQ_API_KEY`: `<your_groq_api_key>`
   - `ADMIN_USERNAME`: `<your_admin_username>`
   - `ADMIN_PASSWORD`: `<your_admin_password>`
   - `JWT_SECRET`: `<your_jwt_secret>`
5. Click **Deploy Web Service**.
6. Once deployed, test your API at:
   `https://healthrisk-ai-backend.onrender.com/health`

---

## Step 3: Verify Frontend Connection

The frontend is already configured to connect to your Render backend:
- [frontend/.env.production](file:///d:/PROJECTS/HealthSence_AI/frontend/.env.production): `VITE_API_URL=https://healthrisk-ai-backend.onrender.com`
- [frontend/src/config.js](file:///d:/PROJECTS/HealthSence_AI/frontend/src/config.js): defaults to your Render URL in production mode.

If your service name on Render differs from `healthrisk-ai-backend`, simply update `VITE_API_URL` in `frontend/.env.production` to your exact Render URL and run `npm run build` in `frontend/`.
