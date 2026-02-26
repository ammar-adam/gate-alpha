# GateAlpha

Flight delay risk and hypothetical prediction-market hedge (single-page app).

## Run locally

### Backend (FastAPI)

```bash
cd backend
pip install -r requirements.txt
python -m uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

API: http://127.0.0.1:8000  
Docs: http://127.0.0.1:8000/docs  

### Frontend (Vite + React)

```bash
cd frontend
npm install
npm run dev
```

App: http://localhost:5173  

The frontend proxies `/api` to the backend when both are running.

## Example flights (mock data)

| Ident   | Route     | Date       | Status    |
|---------|-----------|------------|-----------|
| UA4469  | EWR → BTV | 2026-02-25 | DELAYED   |
| AC123   | YYZ → YVR | 2026-02-25 | ON_TIME   |
| DL404   | JFK → LAX | 2026-02-25 | CANCELLED |

Use the example chips on the search bar or enter ident + date manually.
