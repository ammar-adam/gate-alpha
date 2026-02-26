from fastapi import APIRouter, Query
from starlette.responses import Response

from app.models.schemas import FlightResponse
from app.services.aviationstack import get_flight as get_live_flight
from app.services.mock_flight import get_flight as get_mock_flight

router = APIRouter(prefix="/flight", tags=["flight"])


@router.get("", response_model=FlightResponse)
async def flight_lookup(
    response: Response,
    ident: str = Query(..., description="Flight ident e.g. UA4469"),
    date: str = Query(..., description="Date YYYY-MM-DD"),
    mode: str = Query("demo", description="live = Aviationstack, demo = canned data"),
) -> FlightResponse:
    use_live = (mode or "").strip().lower() == "live"
    if use_live:
        result = await get_live_flight(ident, date)
        if result is not None:
            response.headers["X-Data-Source"] = "live"
            return result
    response.headers["X-Data-Source"] = "demo"
    return get_mock_flight(ident, date)
