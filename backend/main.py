from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routers import flight, history

app = FastAPI(title="GateAlpha API", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(flight.router, prefix="/api")
app.include_router(history.router, prefix="/api")


@app.get("/")
def root() -> dict[str, str]:
    return {"app": "gatealpha"}
