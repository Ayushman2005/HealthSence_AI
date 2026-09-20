# Cloudflare Backend Deployment Guide (No Docker Required) ⚡🌐

This guide explains how to deploy and run the **HealthRisk AI FastAPI Backend** on **Cloudflare** **without needing Docker or containers**.

---

## Method 1: Cloudflare Python Workers (Serverless, No Docker)

Cloudflare Workers has native Python support. You can deploy your FastAPI backend directly using the Cloudflare Wrangler CLI.

### Prerequisites
- [Node.js](https://nodejs.org/) installed (to run `npx wrangler`)
- A Cloudflare account

### Step 1: Install Wrangler in Backend Directory
Open your terminal in `backend/`:
```bash
cd backend
npm install
```

### Step 2: Login to Cloudflare
Authenticate with your Cloudflare account:
```bash
npx wrangler login
```

### Step 3: Configure Cloudflare Production Secrets
Set your encrypted secrets in Cloudflare:
```bash
# Security secret
npx wrangler secret put JWT_SECRET
# Enter your JWT secret (e.g., openssl rand -hex 32 or your custom secret)

# Supabase Cloud Database credentials
npx wrangler secret put SUPABASE_URL
npx wrangler secret put SUPABASE_KEY
npx wrangler secret put SUPABASE_DB_URL

# Cardio AI Groq API Key
npx wrangler secret put GROQ_API_KEY

# Admin credentials
npx wrangler secret put ADMIN_USERNAME
npx wrangler secret put ADMIN_PASSWORD
```

### Step 4: Deploy Directly to Cloudflare
Run the deploy command (no Docker needed!):
```bash
npx wrangler deploy
```

Wrangler will package your FastAPI code and upload it directly to Cloudflare's serverless edge network.
It will print your live URL:
`https://healthrisk-ai-backend.<your-account>.workers.dev`

### Step 5: Test the Live Cloudflare API
```bash
curl https://healthrisk-ai-backend.<your-account>.workers.dev/health
# Response: {"status":"online","service":"Health Risk AI Backend API","version":"2.6.0","database_mode":"SUPABASE"}
```

---

## Method 2: Cloudflare Tunnel (100% Free, Run Python on any Host / VM / PC)

If you are running the Python FastAPI app directly on any computer, VPS (e.g. Free Oracle Cloud, AWS, or local computer), you can expose it securely via Cloudflare without opening any ports and without Docker.

### Step 1: Run your FastAPI backend
In `backend/`:
```bash
pip install -r requirements.txt
python main.py
# Backend runs on http://localhost:5000
```

### Step 2: Install Cloudflare Tunnel CLI (`cloudflared`)
- **Windows (PowerShell)**:
  ```powershell
  winget install --id Cloudflare.cloudflared
  ```
- **Mac**:
  ```bash
  brew install cloudflare/cloudflare/cloudflared
  ```
- **Linux**:
  ```bash
  sudo apt-get install cloudflared
  ```

### Step 3: Authenticate and Create Tunnel
```bash
cloudflared tunnel login
cloudflared tunnel create healthrisk-backend
```

### Step 4: Link Your Domain / Subdomain
```bash
cloudflared tunnel route dns healthrisk-backend api.yourdomain.com
```

### Step 5: Start the Tunnel
```bash
cloudflared tunnel run --url http://localhost:5000 healthrisk-backend
```
Your backend is now live at `https://api.yourdomain.com` with free Cloudflare SSL, edge caching, and DDoS protection!

---

## Step 6: Connect Frontend to Cloudflare

Once deployed:

1. Open `frontend/.env.production`
2. Set your Cloudflare URL:
   ```env
   VITE_API_URL=https://healthrisk-ai-backend.<your-account>.workers.dev
   # OR: VITE_API_URL=https://api.yourdomain.com
   ```
3. Rebuild your frontend:
   ```bash
   cd frontend
   npm run build
   ```
