# GateAlpha

Flight delay risk and **simulation-only** prediction market (no real money).  
Kalshi-style UI with credits, positions, and binary “Delay 30+ min?” contracts.

## Run locally

### Backend (FastAPI)

```bash
cd backend
pip install -r requirements.txt
```

Copy `.env.example` to `.env` and set your API key (optional for DEMO):

```bash
cp .env.example .env
# Edit .env: AVIATIONSTACK_API_KEY=your_key_here
```

Start the API:

```bash
python -m uvicorn main:app --reload --port 8000
```

- API: http://127.0.0.1:8000  
- Docs: http://127.0.0.1:8000/docs  

### Frontend (Vite + React)

```bash
cd frontend
npm install
npm run dev
```

App: http://localhost:5173  

The frontend proxies `/api` to the backend when both are running.

## DEMO vs LIVE

- **DEMO**: Uses canned flight data only. Works with no API key. Example chips load specific flights (UA4469, AC123, DL404).
- **LIVE**: Uses Aviationstack for real flight data. Set `AVIATIONSTACK_API_KEY` in backend `.env`. If the API fails or rate-limits, the app falls back to DEMO data so the UI never stays blank.

## Env vars (backend)

| Variable | Required | Description |
|----------|----------|-------------|
| `AVIATIONSTACK_API_KEY` | For LIVE | Get one at [aviationstack.com](https://aviationstack.com/signup/free) |

## Example flights (DEMO data)

| Ident  | Route     | Date       | Status    |
|--------|-----------|------------|-----------|
| UA4469 | EWR → BTV | 2026-02-25 | DELAYED   |
| AC123  | YYZ → YVR | 2026-02-25 | ON_TIME   |
| DL404  | JFK → LAX | 2026-02-25 | CANCELLED |

Use the example chips or enter flight number + date and click Search.

## Simulation only

- All amounts are in **credits** (no real money).
- You start with 1,000 credits (stored in browser localStorage).
- “Place bet” and “Close” update your simulated portfolio only.
- **Simulation only. No real trading.**
