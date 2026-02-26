# GateAlpha — Product Requirements Document

## 1.1 One-liner

A single-page web app that lets travelers look up a flight, see a live delay risk probability, and simulate a hypothetical prediction-market hedge on "30+ minute delay."

## 1.2 Goals

- Ship a polished demo by Thursday EOD.
- Look great in screenshots + Loom.
- Prove ability in real-time data, probabilistic outputs, and market-style UX.

## 1.3 Non-goals (explicitly out of scope for MVP)

- Real money trading / real Kalshi orders
- User accounts / auth
- Perfect delay model calibration
- Mobile app (responsive web only)

## 1.4 Target users

- **Traveler**: anxious about delays; wants "risk + impact"
- **Power user**: wants EV/edge, enjoys market framing
- **Recruiter/investor**: wants a crisp demo story + clean execution

## 1.5 Core user story

"As a traveler, I enter my flight number and date and instantly get the flight status, a probability of a 30+ minute delay, and a simulated hedge payout table."

## 1.6 MVP features

### F1 — Flight lookup

- **Input**: flight number + date (required)
- **Output**: airline, route, scheduled dep/arr, latest status, last update time
- **SearchBar spec**:
  - 3 **example flight chips** rendered below the input fields.
  - Clicking a chip **auto-populates** ident + date and **auto-submits** the search.
  - Example flights:
    - **UA4469** | EWR → BTV | 2026-02-25 | status: DELAYED
    - **AC123**  | YYZ → YVR | 2026-02-25 | status: ON_TIME
    - **DL404**  | JFK → LAX | 2026-02-25 | status: CANCELLED

### F2 — Status card

- **States**: On Time / Delayed / Cancelled / Diverted / Unknown
- **Show**: scheduled vs estimated times, delay minutes (if delayed)

### F3 — Delay probability (30+ min)

- **Display**: big number (e.g., "67% chance of 30+ min delay")
- **Model vs Market**: Backend computes **P_mkt** = clamp(P_model - 0.08, 0.05, 0.95) (demo stub). ProbabilityCard must show: **"Model: 67% vs Market: 59% → Edge +8%"** using model and market values (edge = P_model - P_mkt, as percentage points).
- **Reason codes**: Render as **small inline tags** below the big probability number. Examples: "Late inbound" | "Airport congestion" | "Winter ops".
- Include confidence label: Low/Med/High (heuristic ok).

### F4 — Hedge simulator (paper market)

- Binary market: "Delay 30+ min? YES/NO"
- **Show**:
  - Implied odds (YES / NO)
  - Payout table for $10 / $50 / $100
  - EV for YES and NO
  - Optional "alpha/edge score" vs market implied (if included)

### F5 — Historical stats (route/airline)

- Show route/airline aggregates:
  - On-time %
  - 15+ min delay %
  - 30+ min delay %
  - Cancellation %

### F6 — Demo Mode indicator

- When the app is using mock/fallback data, show a small **"DEMO"** badge in the **top-right corner** of the UI.
- No toggle needed — badge appears **automatically** when `demoMode = true` in useFlightSearch state.

## 1.7 UX requirements (must-haves)

- Dark theme, "terminal/Bloomberg" aesthetic
- KPI numbers large + scannable
- Loading states + error states look intentional
- "Demo mode" fallback if API fails (cached example flight)

## 1.8 Legal/Disclaimers (MVP)

- Banner text (small): "Hypothetical simulation. Not financial advice. No real trading."

## 1.9 Success criteria (demo definition of done)

- User can search 3–5 flights reliably
- UI looks premium in a screenshot
- Hedge simulator works with consistent math
- Handles API errors gracefully with demo fallback
