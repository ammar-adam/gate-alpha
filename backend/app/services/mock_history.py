from app.models.schemas import HistoryResponse, HistoryStatsSchema

EWR_BTV_UA = HistoryResponse(
    origin="EWR",
    destination="BTV",
    carrier="UA",
    stats=HistoryStatsSchema(
        on_time_pct=0.72,
        delay_15_pct=0.21,
        delay_30_pct=0.14,
        cancel_pct=0.03,
    ),
    sample_size=842,
    period="2025-01 to 2025-12",
)

YYZ_YVR_AC = HistoryResponse(
    origin="YYZ",
    destination="YVR",
    carrier="AC",
    stats=HistoryStatsSchema(
        on_time_pct=0.81,
        delay_15_pct=0.14,
        delay_30_pct=0.08,
        cancel_pct=0.02,
    ),
    sample_size=1204,
    period="2025-01 to 2025-12",
)

JFK_LAX_DL = HistoryResponse(
    origin="JFK",
    destination="LAX",
    carrier="DL",
    stats=HistoryStatsSchema(
        on_time_pct=0.68,
        delay_15_pct=0.24,
        delay_30_pct=0.12,
        cancel_pct=0.05,
    ),
    sample_size=2156,
    period="2025-01 to 2025-12",
)

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
    o, d, c = origin.strip().upper(), destination.strip().upper(), (carrier or "").strip().upper()
    key = (o, d, c)
    by_route = {
        ("EWR", "BTV", "UA"): EWR_BTV_UA,
        ("YYZ", "YVR", "AC"): YYZ_YVR_AC,
        ("JFK", "LAX", "DL"): JFK_LAX_DL,
    }
    if key in by_route:
        return by_route[key]
    if (o, d) in [("EWR", "BTV"), ("YYZ", "YVR"), ("JFK", "LAX")]:
        for (oo, dd, cc), resp in by_route.items():
            if oo == o and dd == d:
                return resp
    return _insufficient_data(o or origin, d or destination)
