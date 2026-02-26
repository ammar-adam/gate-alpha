"""
Load precomputed BTS on-time stats from app/data/bts_routes.json.
Fallback: sample_size 0 when route not found. Cache 24h.
"""
from pathlib import Path

from cachetools import TTLCache

from app.models.schemas import HistoryResponse, HistoryStatsSchema

_DATA_PATH = Path(__file__).resolve().parent.parent / "data" / "bts_routes.json"
_routes_cache: dict[str, dict] | None = None
_history_cache: TTLCache[tuple[str, str, str], HistoryResponse] = TTLCache(maxsize=300, ttl=86400)


def _load_routes() -> dict[str, dict]:
    global _routes_cache
    if _routes_cache is not None:
        return _routes_cache
    if not _DATA_PATH.exists():
        _routes_cache = {}
        return _routes_cache
    try:
        import json

        with open(_DATA_PATH, encoding="utf-8") as f:
            _routes_cache = json.load(f)
    except (json.JSONDecodeError, OSError):
        _routes_cache = {}
    return _routes_cache


def _insufficient_data(origin: str, destination: str) -> HistoryResponse:
    return HistoryResponse(
        origin=origin,
        destination=destination,
        carrier=None,
        stats=HistoryStatsSchema(
            on_time_pct=0.0,
            delay_15_pct=0.0,
            delay_30_pct=0.0,
            cancel_pct=0.0,
        ),
        sample_size=0,
        period="—",
    )


def get_history(origin: str, destination: str, carrier: str | None = None) -> HistoryResponse:
    o = origin.strip().upper()
    d = destination.strip().upper()
    c = (carrier or "").strip().upper()
    key = (o, d, c)
    if key in _history_cache:
        return _history_cache[key]
    routes = _load_routes()
    key = f"{o}-{d}-{c}" if c else f"{o}-{d}"
    if key in routes:
        row = routes[key]
        out = HistoryResponse(
            origin=o or origin,
            destination=d or destination,
            carrier=c or None,
            stats=HistoryStatsSchema(
                on_time_pct=float(row.get("on_time_pct", 0)),
                delay_15_pct=float(row.get("delay_15_pct", 0)),
                delay_30_pct=float(row.get("delay_30_pct", 0)),
                cancel_pct=float(row.get("cancel_pct", 0)),
            ),
            sample_size=int(row.get("sample_size", 0)),
            period=str(row.get("period", "—")),
        )
        _history_cache[key] = out
        return out
    for k, row in routes.items():
        parts = k.split("-")
        if len(parts) >= 2 and parts[0] == o and parts[1] == d:
            out = HistoryResponse(
                origin=o or origin,
                destination=d or destination,
                carrier=parts[2] if len(parts) > 2 else None,
                stats=HistoryStatsSchema(
                    on_time_pct=float(row.get("on_time_pct", 0)),
                    delay_15_pct=float(row.get("delay_15_pct", 0)),
                    delay_30_pct=float(row.get("delay_30_pct", 0)),
                    cancel_pct=float(row.get("cancel_pct", 0)),
                ),
                sample_size=int(row.get("sample_size", 0)),
                period=str(row.get("period", "—")),
            )
            _history_cache[key] = out
            return out
    out = _insufficient_data(o or origin, d or destination)
    _history_cache[key] = out
    return out
