# GateAlpha — Tech Spec (System Requirements + Interfaces)

## 2.1 Architecture

- **Frontend**: SPA (React + Vite + Tailwind)
- **Backend**: FastAPI to hide API keys, normalize provider responses, cache results (TTL)

## 2.2 External dependencies

- **Flight data**: FlightAware AeroAPI (+ Foresight) priority; Aviationstack fallback.
- **Historical**: BTS aggregates OR precomputed JSON packaged with backend.

## 2.3 Backend endpoints

### GET /api/flight

**Query params**

- `ident`: string (e.g., "UA4469")
- `date`: string YYYY-MM-DD

**Response**

- `ident`, `airline`, `origin`, `destination`
- **Route/carrier fields**: `carrier_code` (string, e.g. "UA"), `flight_number` (string, e.g. "4469")
- `scheduled_departure`, `estimated_departure`, `status`, `delay_minutes`, `last_updated`
- `prediction`: `p_delay_30`, `confidence`, `reason_codes`, **`p_mkt`** (market-implied probability, computed in backend mock)

**P_mkt in mock service**: `p_mkt = clamp(p_delay_30 - 0.08, 0.05, 0.95)` (demo stub). Add `p_mkt` to the prediction object in the response schema.

### GET /api/history

**Query params**: `origin`, `destination`, `carrier` (optional)

**Response**: `origin`, `destination`, `carrier`, `stats` (on_time_pct, delay_15_pct, delay_30_pct, cancel_pct), `sample_size`, `period`

## 2.4 Mock flight service (mock_flight.py)

- **P_mkt**: Compute `p_mkt = clamp(p_delay_30 - 0.08, 0.05, 0.95)` and include in `prediction`.
- **Response schema**: Include `carrier_code` and `flight_number` on the flight object; include `p_mkt` in `prediction`.
- **Named mock scenarios**: Ensure all **3 example flights** are included as named mock scenarios with **distinct**:
  - `status` (DELAYED, ON_TIME, CANCELLED)
  - `p_delay_30` and derived `p_mkt`
  - `reason_codes` (e.g. different lists per scenario)
- Example flights:
  - **UA4469** | EWR → BTV | 2026-02-25 | DELAYED
  - **AC123**  | YYZ → YVR | 2026-02-25 | ON_TIME
  - **DL404**  | JFK → LAX | 2026-02-25 | CANCELLED

## 2.5 Caching + rate limiting

- Cache flight lookups 60–120 seconds by (ident, date)
- Cache history 24 hours

## 2.6 Probability model (MVP)

- If provider gives predicted times → map to delay distribution.
- Else heuristic: e.g. `P = clamp(base + w1*sigmoid(delay_minutes-20) + w2*airport_congestion, 0.05, 0.95)`.

## 2.7 Hedge simulator formulas

- `yes_mult = 1 / P`, `no_mult = 1 / (1 - P)`
- `profit_yes_if_true = stake*(yes_mult - 1)`
- `EV_yes = P*profit_yes_if_true + (1-P)*(-stake)`

## 2.8 Frontend components

- **SearchBar**: input + submit + **3 example flight chips** (click → auto-fill ident/date + auto-submit)
- **StatusCard**: status, times, delay minutes
- **ProbabilityCard**: Model vs Market ("Model: X% vs Market: Y% → Edge +Z%"), big P, confidence, **reason_codes as small inline tags**
- **HedgeSimulator**: odds, payout table, EV, edge score
- **HistoryPanel**: route stats
- **Demo badge**: top-right "DEMO" when `demoMode === true`
