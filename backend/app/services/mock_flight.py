from app.models.schemas import FlightResponse, FlightStatus, PredictionSchema

_MOCK_BY_KEY: dict[tuple[str, str], FlightResponse] = {}


def _clamp(x: float, lo: float, hi: float) -> float:
    return max(lo, min(hi, x))


def _pred(p: float, conf: str, codes: list[str]) -> PredictionSchema:
    p_mkt = _clamp(p - 0.08, 0.05, 0.95)
    return PredictionSchema(p_model_delay_30=p, p_mkt=p_mkt, confidence=conf, reason_codes=codes)


def _make_demos() -> None:
    global _MOCK_BY_KEY
    _MOCK_BY_KEY = {
        ("UA4469", "2026-02-25"): FlightResponse(
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
            prediction=_pred(0.67, "MED", ["LATE_INBOUND", "AIRPORT_CONGESTION"]),
        ),
        ("AC123", "2026-02-25"): FlightResponse(
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
            prediction=_pred(0.22, "LOW", ["BASELINE_ROUTE_RISK"]),
        ),
        ("DL404", "2026-02-25"): FlightResponse(
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
            prediction=_pred(0.91, "HIGH", ["WEATHER", "WINTER_OPS", "CREW_TIMEOUT"]),
        ),
    }


DEMO_FALLBACK: FlightResponse | None = None


def get_flight(ident: str, date: str) -> FlightResponse:
    if not _MOCK_BY_KEY:
        _make_demos()
    key = (ident.strip().upper(), date.strip()[:10])
    if key in _MOCK_BY_KEY:
        return _MOCK_BY_KEY[key]
    global DEMO_FALLBACK
    if DEMO_FALLBACK is None:
        _make_demos()
        DEMO_FALLBACK = _MOCK_BY_KEY[("UA4469", "2026-02-25")]
    return DEMO_FALLBACK
