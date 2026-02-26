# GateAlpha — Implementation decisions

Decisions made where the PRD/TECH_SPEC did not specify.

## Backend

- **Demo fallback key**: Unrecognized `(ident, date)` returns the same payload as UA4469/2026-02-25 (DELAYED) so the app always has data.
- **History fallback**: Unknown route returns `sample_size: 0` and the requested `origin`/`destination` so the UI can show "Insufficient data for X → Y".
- **Caching**: Not implemented in MVP; can add in-memory TTL (60–120s flight, 24h history) later.
- **Pydantic confidence**: Validated via `pattern="^(LOW|MED|HIGH)$"` for consistency.

## Frontend

- **Demo mode data**: When the API throws, the hook sets cached `DEMO_FLIGHT` and `DEMO_HISTORY` in memory (no second request). `demoMode` is set so the DEMO badge shows.
- **Reason code labels**: Backend sends uppercase codes (e.g. `LATE_INBOUND`). Frontend maps to display labels (e.g. "Late inbound") in `ProbabilityCard` via a small lookup; unknown codes are formatted by replacing underscores and lowercasing.
- **Date input**: Native `type="date"` for the search field.
- **Stakes**: Hedge simulator uses $10, $50, $100 per TECH_SPEC; defined in `lib/hedge.ts` as `STAKES`.
- **EV_NO**: Formula used is `(1 - P) * profitNoIfTrue + P * (-stake)` so EV is consistent with YES (profit if correct outcome, loss if wrong).
- **Tailwind**: v4 with `@tailwindcss/vite`; dark theme via `class="dark"` on `html` and custom `terminal` palette in `tailwind.config.js` and `index.css` @theme.

## General

- **Branding**: "GateAlpha" in title, header, and README; no TaxiHedge/GateGuard.
- **Disclaimer**: Single footer line: "Hypothetical simulation. Not financial advice. No real trading."
