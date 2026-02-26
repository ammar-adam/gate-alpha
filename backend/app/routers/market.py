from fastapi import APIRouter, Query

from app.models.schemas import MarketResponse
from app.services import flightaware
from app.services.market_simulator import generate_orderbook
from app.services.mock_flight import get_flight as get_mock_flight

router = APIRouter(prefix="/market", tags=["market"])


@router.get("", response_model=MarketResponse)
async def market_lookup(
    ident: str = Query(..., description="Flight ident e.g. UA4469"),
    date: str = Query(..., description="Date YYYY-MM-DD"),
) -> MarketResponse:
    flight = await flightaware.get_flight(ident, date)
    if flight is None:
        flight = get_mock_flight(ident, date)
    p_model = flight.prediction.p_delay_30
    p_mkt = flight.prediction.p_mkt
    return generate_orderbook(p_model, p_mkt, ident, date)
