# Kitchen Accountability ERP 🍲

A complete Kitchen Management and ERP system built with FastAPI and modern responsive UI, synchronized in real-time with **Google Sheets ("Kitchen Accountability 2025-26")** and local Excel fallback.

---

## 🌟 Key Modules

1. **Orders & Sponsors**: Devotee plates, matrix incentive calculator, donation bifurcations, Cash/GPay/Bank tracking.
2. **Vendor Management**: Vendor accounts, multi-bill breakdown, auto-calculated expenses, debit/credit difference.
3. **Cook Management & Payroll**: Staff roster, Policy Section 3 matrix profit distribution, base salaries, festival allowances, annual bonuses, synced directly across all active month tabs.
4. **Donation Analytics**: Dynamic visual charts and breakdown summaries.
5. **Master Template Cloning**: One-click new month worksheet creation preserving all formulas and layout.

---

## 🚀 Free Hosting Guide (Step-by-Step)

You can host this application **100% free with a public HTTPS URL** using either **Render.com** (recommended) or **Hugging Face Spaces**.

---

### Option A: Render.com (Recommended - 5 Minutes)

**Render** offers free Web Services with automatic HTTPS (`https://your-app-name.onrender.com`) and automatic continuous deployment from GitHub.

#### Step 1: Push Project to GitHub
1. Create a new repository on [GitHub](https://github.com/new) (e.g. `kitchen-accountability-erp`).
2. Make sure `.gitignore` is present so `credentials.json` is **never committed publicly**.
3. Push your code:
   ```bash
   git init
   git add .
   git commit -m "Initial commit of Kitchen Accountability ERP"
   git branch -M main
   git remote add origin https://github.com/<your-username>/kitchen-accountability-erp.git
   git push -u origin main
   ```

#### Step 2: Deploy on Render
1. Go to [Render.com](https://render.com) and sign in (using GitHub).
2. Click **New +** -> **Web Service**.
3. Select your GitHub repository (`kitchen-accountability-erp`).
4. Configure the service settings:
   - **Name**: `kitchen-accountability` (or any name you choose)
   - **Runtime**: `Python 3`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn app:app --host 0.0.0.0 --port $PORT`
   - **Instance Type**: `Free`
5. In **Environment Variables**, add:
   - `SPREADSHEET_ID`: `15tvKnG6mx2XiwQi54pynK1q_gSMW8lNrwMklKambK4Y`
   - `SPREADSHEET_GID`: `1912501962`
   - `GOOGLE_SERVICE_ACCOUNT_JSON`: Open your local `credentials.json` file, copy the entire JSON content, and paste it here as the value.
6. Click **Create Web Service**.
7. In ~2 minutes, your free live URL (`https://kitchen-accountability.onrender.com`) will be online!

---

### Option B: Hugging Face Spaces (100% Free, Always On)

**Hugging Face Spaces** provides 100% free CPU containers (2 vCPU, 16 GB RAM) with public HTTPS links and built-in secrets management.

1. Go to [Hugging Face Spaces](https://huggingface.co/spaces) and click **Create new Space**.
2. Space Name: `kitchen-erp`
3. Space SDK: **Docker** (using the included `Dockerfile`) or **FastAPI**.
4. Visibility: **Public** or **Private**.
5. Go to Space **Settings** -> **Variables and secrets** -> **New secret**:
   - Name: `GOOGLE_SERVICE_ACCOUNT_JSON`
   - Value: Paste the contents of `credentials.json`
6. Push the repository files. The app builds and runs instantly!

---

### Option C: Koyeb (Always-Free Nano Tier)

1. Sign up on [Koyeb.com](https://www.koyeb.com).
2. Click **Create App** -> **GitHub**.
3. Select repo, set port `8000`, add `GOOGLE_SERVICE_ACCOUNT_JSON` environment variable.
4. Deploy!

---

## 💻 Local Development

```powershell
uvicorn app:app --host 127.0.0.1 --port 8000
```
Open browser: **http://127.0.0.1:8000**
