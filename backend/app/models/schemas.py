from enum import Enum
from typing import Optional

from pydantic import BaseModel, Field


class FlightStatus(str, Enum):
    ON_TIME = "ON_TIME"
    DELAYED = "DELAYED"
    CANCELLED = "CANCELLED"
    DIVERTED = "DIVERTED"
    UNKNOWN = "UNKNOWN"


class PredictionSchema(BaseModel):
    p_delay_30: float = Field(..., ge=0, le=1)
    p_mkt: float = Field(..., ge=0, le=1)
    confidence: str = Field(..., pattern="^(LOW|MED|HIGH)$")
    reason_codes: list[str] = Field(default_factory=list)


class FlightResponse(BaseModel):
    ident: str
    airline: str
    origin: str
    destination: str
    carrier_code: str
    flight_number: str
    scheduled_departure: str
    estimated_departure: str
    status: FlightStatus
    delay_minutes: Optional[int] = None
    last_updated: str
    prediction: PredictionSchema


class HistoryStatsSchema(BaseModel):
    on_time_pct: float = Field(..., ge=0, le=1)
    delay_15_pct: float = Field(..., ge=0, le=1)
    delay_30_pct: float = Field(..., ge=0, le=1)
    cancel_pct: float = Field(..., ge=0, le=1)


class HistoryResponse(BaseModel):
    origin: str
    destination: str
    carrier: Optional[str] = None
    stats: HistoryStatsSchema
    sample_size: int
    period: str
