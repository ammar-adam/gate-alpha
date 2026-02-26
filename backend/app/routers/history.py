from fastapi import APIRouter, Query

from app.models.schemas import HistoryResponse
from app.services.mock_history import get_history

router = APIRouter(prefix="/history", tags=["history"])


@router.get("", response_model=HistoryResponse)
def history_lookup(
    origin: str = Query(..., description="Origin airport code"),
    destination: str = Query(..., description="Destination airport code"),
    carrier: str | None = Query(None, description="Carrier code (optional)"),
) -> HistoryResponse:
    return get_history(origin, destination, carrier)
