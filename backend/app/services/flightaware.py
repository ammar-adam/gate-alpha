"""
FlightAware AeroAPI client. On any API error (rate limit, 404, network),
callers should fall back to mock_flight silently.
"""
import os
from datetime import datetime
from typing import Any

import httpx
from cachetools import TTLCache

from app.models.schemas import FlightResponse, FlightStatus, PredictionSchema

BASE_URL = "https://aeroapi.flightaware.com/aeroapi"
FLIGHT_CACHE: TTLCache[tuple[str, str], FlightResponse] = TTLCache(maxsize=500, ttl=90)


def _clamp(value: float, low: float, high: float) -> float:
    return max(low, min(high, value))


def _p_mkt(p_delay_30: float) -> float:
    return _clamp(p_delay_30 - 0.08, 0.05, 0.95)


def _airline_name(operator_iata: str) -> str:
    names: dict[str, str] = {
        "UA": "United Airlines",
        "AA": "American Airlines",
        "DL": "Delta Air Lines",
        "WN": "Southwest Airlines",
        "B6": "JetBlue Airways",
        "AS": "Alaska Airlines",
        "NK": "Spirit Airlines",
        "F9": "Frontier Airlines",
        "AC": "Air Canada",
    }
    return names.get(operator_iata or "", operator_iata or "Unknown")


def _iso(ts: str | None) -> str:
    if not ts:
        return ""
    if "T" in ts and "Z" in (ts[-1:] or ""):
        return ts
    return ts


def _parse_ete_minutes(ete: str | None) -> int | None:
    if not ete:
        return None
    try:
        parts = (ete or "").strip().split(":")
        if len(parts) >= 2:
            h, m = int(parts[0]), int(parts[1])
            return h * 60 + m
        return None
    except (ValueError, TypeError):
        return None


def _derive_status(progress_percent: Any, actual_out: Any, cancelled: bool) -> FlightStatus:
    if cancelled:
        return FlightStatus.CANCELLED
    if progress_percent is None:
        progress_percent = 0
    try:
        p = int(progress_percent)
    except (TypeError, ValueError):
        p = 0
    if p >= 100:
        return FlightStatus.ON_TIME
    if actual_out and p > 0:
        return FlightStatus.DELAYED
    if actual_out:
        return FlightStatus.DELAYED
    return FlightStatus.ON_TIME


def _derive_delay_minutes(
    scheduled_out: str | None,
    estimated_out: str | None,
    actual_out: str | None,
) -> int | None:
    out = actual_out or estimated_out
    if not out or not scheduled_out:
        return None
    try:
        s = datetime.fromisoformat(scheduled_out.replace("Z", "+00:00"))
        o = datetime.fromisoformat(out.replace("Z", "+00:00"))
        delta = o - s
        mins = int(delta.total_seconds() / 60)
        return max(0, mins) if mins > 0 else None
    except (ValueError, TypeError):
        return None


def _heuristic_p_delay_30(
    delay_minutes: int | None,
    delay_30_baseline: float,
) -> tuple[float, str, list[str]]:
    """TECH_SPEC 2.5: P = clamp(base + w1*sigmoid(delay_minutes-20) + ..., 0.05, 0.95)."""
    base = delay_30_baseline
    delay = delay_minutes or 0

    def sigmoid(x: float) -> float:
        return 1.0 / (1.0 + __import__("math").exp(-x))

    w1 = 0.4
    p = base + w1 * sigmoid((delay - 20) / 10.0)
    p = _clamp(p, 0.05, 0.95)
    if delay >= 30:
        confidence = "HIGH"
        codes = ["CURRENT_DELAY", "LATE_INBOUND"]
    elif delay >= 15:
        confidence = "MED"
        codes = ["CURRENT_DELAY"]
    else:
        confidence = "LOW"
        codes = ["ROUTE_HISTORY_BASELINE"]
    return p, confidence, codes


def _flight_from_fa(flight: dict[str, Any], requested_date: str, delay_30_baseline: float) -> FlightResponse | None:
    try:
        ident = (flight.get("fa_flight_id") or flight.get("ident") or "").strip()
        if not ident and flight.get("ident"):
            ident = str(flight["ident"])
        operator = (flight.get("operator_iata") or flight.get("operator") or "").strip()
        flight_number = str(flight.get("flight_number") or "").strip() or (ident.split("-")[0] if "-" in ident else ident)
        origin_obj = flight.get("origin") or {}
        dest_obj = flight.get("destination") or {}
        origin = (origin_obj.get("code_iata") or origin_obj.get("code") or "").strip()
        destination = (dest_obj.get("code_iata") or dest_obj.get("code") or "").strip()
        scheduled_out = flight.get("scheduled_out") or flight.get("filed_departuretime")
        if isinstance(scheduled_out, (int, float)):
            scheduled_out = datetime.utcfromtimestamp(scheduled_out).strftime("%Y-%m-%dT%H:%M:%SZ")
        scheduled_out = _iso(str(scheduled_out) if scheduled_out else "")
        estimated_out = flight.get("estimated_out") or flight.get("estimated_departuretime")
        if isinstance(estimated_out, (int, float)):
            estimated_out = datetime.utcfromtimestamp(estimated_out).strftime("%Y-%m-%dT%H:%M:%SZ")
        estimated_out = _iso(str(estimated_out) if estimated_out else scheduled_out)
        actual_out = flight.get("actual_out") or flight.get("actualdeparturetime")
        if isinstance(actual_out, (int, float)):
            actual_out = datetime.utcfromtimestamp(actual_out).strftime("%Y-%m-%dT%H:%M:%SZ")
        actual_out = str(actual_out) if actual_out else None
        progress_percent = flight.get("progress_percent")
        cancelled = (flight.get("status") or "").upper() in ("CANCELLED", "CANCELED", "C")
        status = _derive_status(progress_percent, actual_out, cancelled)
        delay_minutes = _derive_delay_minutes(scheduled_out, estimated_out, actual_out)
        last_updated = flight.get("last_position") or flight.get("updated_at") or estimated_out or scheduled_out
        if isinstance(last_updated, (int, float)):
            last_updated = datetime.utcfromtimestamp(last_updated).strftime("%Y-%m-%dT%H:%M:%SZ")
        last_updated = _iso(str(last_updated) if last_updated else "")

        p_delay_30, confidence, reason_codes = _heuristic_p_delay_30(delay_minutes or 0, delay_30_baseline)
        prediction = PredictionSchema(
            p_delay_30=p_delay_30,
            p_mkt=_p_mkt(p_delay_30),
            confidence=confidence,
            reason_codes=reason_codes,
        )

        return FlightResponse(
            ident=ident or "UNKNOWN",
            airline=_airline_name(operator),
            origin=origin or "???",
            destination=destination or "???",
            carrier_code=operator or "??",
            flight_number=flight_number or "?",
            scheduled_departure=scheduled_out,
            estimated_departure=estimated_out,
            status=status,
            delay_minutes=delay_minutes,
            last_updated=last_updated,
            prediction=prediction,
        )
    except (KeyError, TypeError, ValueError):
        return None


async def get_flight(ident: str, date: str) -> FlightResponse | None:
    """
    Fetch flight from AeroAPI. Filter by requested date.
    On any error returns None so caller can fall back to mock.
    """
    key = (ident.strip().upper(), date.strip())
    if key in FLIGHT_CACHE:
        return FLIGHT_CACHE[key]

    api_key = os.environ.get("FLIGHTAWARE_API_KEY", "").strip()
    if not api_key:
        return None

    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            r = await client.get(
                f"{BASE_URL}/flights/{ident}",
                headers={"x-apikey": api_key},
            )
            r.raise_for_status()
            data = r.json()
    except (httpx.HTTPError, httpx.TimeoutException, ValueError):
        return None

    flights = data.get("flights") or data.get("flight") or []
    if isinstance(flights, dict):
        flights = [flights]
    if not flights:
        return None

    requested_date_norm = date.strip()[:10]
    chosen: dict[str, Any] | None = None
    for f in flights:
        dep = f.get("scheduled_out") or f.get("filed_departuretime")
        if dep:
            if isinstance(dep, (int, float)):
                dep_str = datetime.utcfromtimestamp(dep).strftime("%Y-%m-%d")
            else:
                dep_str = str(dep)[:10]
            if dep_str == requested_date_norm:
                chosen = f
                break
    if not chosen and flights:
        chosen = flights[0]

    if not chosen:
        return None

    delay_30_baseline = 0.15
    flight_resp = _flight_from_fa(chosen, date, delay_30_baseline)
    if flight_resp:
        FLIGHT_CACHE[key] = flight_resp
    return flight_resp
