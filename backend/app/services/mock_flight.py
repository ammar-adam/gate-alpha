from app.models.schemas import FlightResponse, FlightStatus, PredictionSchema


def _clamp(value: float, low: float, high: float) -> float:
    return max(low, min(high, value))


def _p_mkt(p_delay_30: float) -> float:
    return _clamp(p_delay_30 - 0.08, 0.05, 0.95)


def _prediction(p_delay_30: float, confidence: str, reason_codes: list[str]) -> PredictionSchema:
    return PredictionSchema(
        p_delay_30=p_delay_30,
        p_mkt=_p_mkt(p_delay_30),
        confidence=confidence,
        reason_codes=reason_codes,
    )


UA4469_EWR_BTV = FlightResponse(
    ident="UA4469",
    airline="United Airlines",
    origin="EWR",
    destination="BTV",
    carrier_code="UA",
    flight_number="4469",
    scheduled_departure="2026-02-25T08:30:00Z",
    estimated_departure="2026-02-25T09:17:00Z",
    status=FlightStatus.DELAYED,
    delay_minutes=47,
    last_updated="2026-02-25T08:12:00Z",
    prediction=_prediction(0.67, "MED", ["LATE_INBOUND", "AIRPORT_CONGESTION"]),
)

AC123_YYZ_YVR = FlightResponse(
    ident="AC123",
    airline="Air Canada",
    origin="YYZ",
    destination="YVR",
    carrier_code="AC",
    flight_number="123",
    scheduled_departure="2026-02-25T14:00:00Z",
    estimated_departure="2026-02-25T14:00:00Z",
    status=FlightStatus.ON_TIME,
    delay_minutes=None,
    last_updated="2026-02-25T13:45:00Z",
    prediction=_prediction(0.22, "LOW", ["ROUTE_HISTORY_BASELINE"]),
)

DL404_JFK_LAX = FlightResponse(
    ident="DL404",
    airline="Delta Air Lines",
    origin="JFK",
    destination="LAX",
    carrier_code="DL",
    flight_number="404",
    scheduled_departure="2026-02-25T18:00:00Z",
    estimated_departure="2026-02-25T18:00:00Z",
    status=FlightStatus.CANCELLED,
    delay_minutes=None,
    last_updated="2026-02-25T16:30:00Z",
    prediction=_prediction(0.91, "HIGH", ["WEATHER", "WINTER_OPS", "CREW_TIMEOUT"]),
)

DEMO_FALLBACK = FlightResponse(
    ident="UA4469",
    airline="United Airlines",
    origin="EWR",
    destination="BTV",
    carrier_code="UA",
    flight_number="4469",
    scheduled_departure="2026-02-25T08:30:00Z",
    estimated_departure="2026-02-25T09:17:00Z",
    status=FlightStatus.DELAYED,
    delay_minutes=47,
    last_updated="2026-02-25T08:12:00Z",
    prediction=_prediction(0.67, "MED", ["LATE_INBOUND", "AIRPORT_CONGESTION"]),
)

_MOCK_BY_KEY: dict[tuple[str, str], FlightResponse] = {
    ("UA4469", "2026-02-25"): UA4469_EWR_BTV,
    ("AC123", "2026-02-25"): AC123_YYZ_YVR,
    ("DL404", "2026-02-25"): DL404_JFK_LAX,
}


def get_flight(ident: str, date: str) -> FlightResponse:
    key = (ident.strip().upper(), date.strip())
    return _MOCK_BY_KEY.get(key, DEMO_FALLBACK)
