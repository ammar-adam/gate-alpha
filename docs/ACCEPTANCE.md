# GateAlpha — Acceptance tests

Run through these before declaring the demo done.

## A) Functional

1. **Search returns populated StatusCard**  
   Search UA4469 / 2026-02-25 (or click the first example chip). Status card shows DELAYED, +47 min, scheduled vs estimated times, last updated, airline and route.

2. **ProbabilityCard shows P in 0–100% and Model vs Market**  
   Same search: big number e.g. 67%; line "Model: 67% vs Market: 59% → Edge +8%"; confidence; reason_codes as small inline tags (e.g. "Late inbound", "Airport congestion").

3. **HedgeSimulator updates with P**  
   After search, table shows YES/NO multipliers and payouts for $10, $50, $100 plus EV YES and EV NO. Change flight (e.g. AC123) and confirm numbers update (lower P → different multipliers/payouts).

4. **HistoryPanel**  
   For UA4469: route stats (on-time %, 15+, 30+, cancel) and sample size/period. For an unknown route or when backend returns sample_size 0, panel shows "Insufficient data" (or equivalent) without crashing.

## B) Resilience

5. **API failure → friendly error + demo**  
   Stop the backend or point frontend at a bad URL. Search: user sees an error message and the app shows demo data (e.g. UA4469) with the DEMO badge in the top-right. No blank screen or crash.

6. **Loading state**  
   Submit a search: loading skeletons (or spinner) appear within a short time (~200ms) and then resolve to the four panels.

7. **Rate limit / bad response**  
   If the backend returns 4xx/5xx, the app handles it (error banner and/or demo mode) and does not crash.

## C) UX polish

8. **Screenshot**  
   One screenshot captures all four panels (Status, Probability, Hedge, History) with clear KPIs and the search bar. Dark theme, large numbers, clean grid.

9. **Disclaimer**  
   Footer (or equivalent) always visible: "Hypothetical simulation. Not financial advice. No real trading."

10. **Example chips**  
    Three chips below the search inputs. Clicking a chip fills ident + date and triggers search (auto-submit). Chips: UA4469 (DELAYED), AC123 (ON_TIME), DL404 (CANCELLED).

11. **DEMO badge**  
    When `demoMode` is true (e.g. after API failure), a small "DEMO" badge is visible in the top-right corner. No manual toggle.

## D) Hedge math (manual check)

12. **Formulas**  
    For P = 0.67: yes_mult = 1/0.67 ≈ 1.49, no_mult = 1/0.33 ≈ 3.03. For $10 stake: profit_yes_if_true = 10*(1.49-1) = 4.93; EV_yes = 0.67*4.93 + 0.33*(-10) ≈ 0.00. Verify payouts and EVs match TECH_SPEC 2.7.
