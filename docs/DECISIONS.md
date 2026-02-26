# GateAlpha — Implementation decisions

Decisions made where the PRD/TECH_SPEC did not specify.

## Backend

- **Demo fallback key**: Unrecognized `(ident, date)` returns the same payload as UA4469/2026-02-25 (DELAYED) so the app always has data.
- **History fallback**: Unknown route returns `sample_size: 0` and the requested `origin`/`destination` so the UI can show "Insufficient data for X → Y".
- **Caching**: Flight lookup cached 90s (FlightAware) keyed by (ident, date). History from static BTS JSON (no TTL).
- **Pydantic confidence**: Validated via `pattern="^(LOW|MED|HIGH)$"` for consistency.
- **FlightAware**: Async httpx client; GET /flights/{ident}; filter by requested date; map to FlightResponse; on any API error (rate limit, 404, network) fall back to mock_flight silently. Prediction from heuristic (delay_minutes + baseline) when provider has no predictions endpoint.
- **BTS history**: Precomputed app/data/bts_routes.json with key "ORIG-DEST-CARRIER"; 12 US route/carrier combos; get_history tries exact key then origin+destination match.
- **X-Data-Source**: Set on every /api/flight response (live | mock) via Response header.
- **Market simulator**: Seeded random from hash(ident+date) so orderbook is deterministic per flight; yes_best_ask = round(p_mkt*100), yes_best_bid = yes_best_ask - 2; 5 levels each side; volume_24h and open_interest in 500–5000.

## Frontend

- **Demo mode data**: When the API throws, the hook sets cached `DEMO_FLIGHT` and `DEMO_HISTORY` in memory (no second request). `demoMode` is set so the DEMO badge shows.
- **Reason code labels**: Backend sends uppercase codes (e.g. `LATE_INBOUND`). Frontend maps to display labels (e.g. "Late inbound") in `ProbabilityCard` via a small lookup; unknown codes are formatted by replacing underscores and lowercasing.
- **Date input**: Native `type="date"` for the search field.
- **Stakes**: Hedge simulator uses $10, $50, $100 per TECH_SPEC; defined in `lib/hedge.ts` as `STAKES`.
- **EV_NO**: Formula used is `(1 - P) * profitNoIfTrue + P * (-stake)` so EV is consistent with YES (profit if correct outcome, loss if wrong).
- **Tailwind**: v4 with `@tailwindcss/vite`; dark theme via `class="dark"` on `html` and custom `terminal` palette in `tailwind.config.js` and `index.css` @theme.
- **getFlight response**: Returns `{ flight, dataSource }`; client reads `X-Data-Source` header so UI can show LIVE/MOCK pill and "Powered by FlightAware" when live.
- **Market UI**: Kalshi-style summary bar (YES/NO best ask, Vol 24h, OI, last trade), two-column orderbook (YES bids, NO bids) with depth bars; trade simulator uses best ask as fill price, shows contracts, EV, edge; "Place Bet" disabled with tooltip "Hypothetical only — no real trading".
- **Auto-refresh**: Poll /api/flight every 60s when flight exists and status !== CANCELLED and not demoMode; lastFetchedAt drives "Last updated Xs ago" ticker; probability card flashes (ring) when p_delay_30 changes; HedgeSimulator pulses best bid/ask and animates orderbook depth width on update.

## General

- **Branding**: "GateAlpha" in title, header, and README; no TaxiHedge/GateGuard.
- **Disclaimer**: Single footer line: "Hypothetical simulation. Not financial advice. No real trading."

## Explicitly out of scope

- **Real database**: No PostgreSQL/MySQL; mock and in-memory only.
- **Real auth**: No JWT, sessions, or OAuth; frontend-only "name" for greeting.
- **Real money / Kalshi**: Simulation only; no real trading or Kalshi integration.
- **Mobile app**: Web only; no native iOS/Android.
- **Persistent user accounts**: No sign-up or stored profiles; name and positions are session-only (reset on refresh).
- **Search over real flight schedules**: Search endpoint returns mock list; no live schedule API.
