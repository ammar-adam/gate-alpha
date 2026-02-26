from fastapi import APIRouter, Query

from app.models.schemas import FlightResponse
from app.services.mock_flight import get_flight

router = APIRouter(prefix="/flight", tags=["flight"])


@router.get("", response_model=FlightResponse)
def flight_lookup(
    ident: str = Query(..., description="Flight ident e.g. UA4469"),
    date: str = Query(..., description="Date YYYY-MM-DD"),
) -> FlightResponse:
    return get_flight(ident, date)
