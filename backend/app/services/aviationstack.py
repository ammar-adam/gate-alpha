"""
Aviationstack API client. On failure/rate-limit/no match return None for demo fallback.
"""
import os
from typing import Any

import httpx
from cachetools import TTLCache

from app.models.schemas import FlightResponse, FlightStatus, PredictionSchema

BASE_URL = "https://api.aviationstack.com/v1/flights"
FLIGHT_CACHE: TTLCache[tuple[str, str], FlightResponse] = TTLCache(maxsize=500, ttl=60)


def _clamp(value: float, low: float, high: float) -> float:
    return max(low, min(high, value))


def _status_map(s: str) -> FlightStatus:
    raw = (s or "").lower()
    if raw in ("cancelled", "canceled"): return FlightStatus.CANCELLED
    if raw == "diverted": return FlightStatus.DIVERTED
    if raw in ("active", "scheduled", "landed"): return FlightStatus.DELAYED if raw == "active" else FlightStatus.ON_TIME
    if raw == "incident": return FlightStatus.DELAYED
    return FlightStatus.UNKNOWN


def _airline_name(iata: str) -> str:
    names = {"UA": "United Airlines", "AA": "American Airlines", "DL": "Delta Air Lines",
             "WN": "Southwest Airlines", "B6": "JetBlue Airways", "AC": "Air Canada"}
    return names.get((iata or "").upper(), iata or "Unknown")


def _p_model_heuristic(
    delay_minutes: int | None,
    history_delay_30_pct: float,
    status: FlightStatus,
    has_live: bool,
    sample_size: int,
) -> tuple[float, str, list[str]]:
    base = _clamp(history_delay_30_pct, 0.05, 0.95) if history_delay_30_pct > 0 else 0.25
    uplift = 0.0
    if status == FlightStatus.DELAYED and delay_minutes:
        uplift = _clamp(delay_minutes / 120.0, 0, 0.5)
    p_model = _clamp(base + uplift, 0.05, 0.95)
    confidence = "HIGH" if (sample_size > 500 and has_live) else "MED"
    if sample_size < 100:
        confidence = "LOW"
    reason_codes = ["AIRPORT_CONGESTION", "LATE_INBOUND"] if status == FlightStatus.DELAYED else ["BASELINE_ROUTE_RISK"]
    return p_model, confidence, reason_codes


def _normalize(record: dict[str, Any], history_delay_30_pct: float, sample_size: int) -> FlightResponse | None:
    try:
        dep = record.get("departure") or {}
        arr = record.get("arrival") or {}
        airline = record.get("airline") or {}
        flight = record.get("flight") or {}
        flight_iata = (flight.get("iata") or record.get("flight_iata") or "").strip()
        flight_number = (flight.get("number") or "").strip()
        if not flight_iata and flight_number:
            airline_iata = (airline.get("iata") or "").strip()
            flight_iata = f"{airline_iata}{flight_number}" if airline_iata else flight_number
        if not flight_iata:
            return None
        origin = (dep.get("iata") or "").strip() or "???"
        destination = (arr.get("iata") or "").strip() or "???"
        carrier_code = (airline.get("iata") or flight_iata[:2] or "").strip() or "??"
        scheduled_departure = dep.get("scheduled") or ""
        estimated_departure = dep.get("estimated") or scheduled_departure
        actual_dep = dep.get("actual")
        last_updated = dep.get("estimated") or dep.get("actual") or estimated_departure or scheduled_departure or ""
        delay_minutes = dep.get("delay")
        if delay_minutes is not None and not isinstance(delay_minutes, int):
            try:
                delay_minutes = int(delay_minutes)
            except (TypeError, ValueError):
                delay_minutes = None
        status_raw = record.get("flight_status") or ""
        status = _status_map(status_raw)
        if status == FlightStatus.ON_TIME and delay_minutes and delay_minutes > 0:
            status = FlightStatus.DELAYED
        has_live = bool(record.get("live"))
        p_model, confidence, reason_codes = _p_model_heuristic(
            delay_minutes, history_delay_30_pct, status, has_live, sample_size
        )
        prediction = PredictionSchema(
            p_model_delay_30=p_model,
            confidence=confidence,
            reason_codes=reason_codes,
        )
        return FlightResponse(
            ident=flight_iata,
            airline=_airline_name(carrier_code),
            origin=origin,
            destination=destination,
            carrier_code=carrier_code,
            flight_number=flight_number or flight_iata,
            scheduled_departure=scheduled_departure,
            estimated_departure=estimated_departure,
            status=status,
            delay_minutes=delay_minutes,
            last_updated=last_updated,
            prediction=prediction,
        )
    except (KeyError, TypeError, ValueError):
        return None


async def get_flight(
    ident: str,
    date: str,
    history_delay_30_pct: float = 0.25,
    sample_size: int = 0,
) -> FlightResponse | None:
    key = (ident.strip().upper(), date.strip())
    if key in FLIGHT_CACHE:
        return FLIGHT_CACHE[key]
    api_key = os.environ.get("AVIATIONSTACK_API_KEY", "").strip()
    if not api_key:
        return None
    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            r = await client.get(
                BASE_URL,
                params={
                    "access_key": api_key,
                    "flight_iata": ident.strip(),
                    "flight_date": date.strip()[:10],
                    "limit": 10,
                },
            )
            r.raise_for_status()
            data = r.json()
    except (httpx.HTTPError, httpx.TimeoutException, ValueError):
        return None
    err = data.get("error")
    if err:
        return None
    results = data.get("data") or data.get("results") or []
    if not results:
        return None
    record = results[0]
    out = _normalize(record, history_delay_30_pct, sample_size)
    if out:
        FLIGHT_CACHE[key] = out
    return out
