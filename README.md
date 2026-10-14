# Travel Planner BD

Offline bilingual (EN/বাংলা) trip planner for Bangladesh. Plan trips with a
day-by-day itinerary, track expenses against a budget in integer paisa, and
keep a packing checklist — all in the browser, with no server and no network
requests.

## Features

- **Trips** — name, destination, start/end dates, total budget (৳), optional notes.
  Status is derived from the current date: Upcoming / Ongoing / Ended.
- **Dashboard** — total trips, upcoming trips, total budget, total spent,
  next-trip card with a days-to-departure countdown, and per-trip progress bars.
- **Itinerary** — day-by-day items (day, time, title, note), grouped by trip day,
  sorted by time. Day numbers are validated against the trip's date range.
- **Expenses** — dated expense log (Transport / Food / Stay / Shopping / Other),
  category breakdown, spent vs budget, remaining, and an over-budget warning.
- **Packing checklist** — items with categories and packed checkboxes, plus a
  packed-percentage progress bar.
- **Data** — JSON export / import with strict validation (malformed imports are
  rejected with data intact), and typed-`DELETE` erase-all.
- **Bilingual** — EN/বাংলা toggle persisted in localStorage, Bengali digits in
  amounts, dates, and counts.
- **Offline-first** — zero network requests by design; data lives in localStorage.

## Stack

Vanilla HTML/CSS/JS, no dependencies, no build step. Money is stored as
integer paisa to avoid float error. Dates are `YYYY-MM-DD` local dates.

## Run

Open `index.html` in a browser, or serve the directory with any static server:

```bash
npx serve .
# or
python3 -m http.server 8000
```

## Testing

```bash
node tests/unit.test.js   # 53 pure-logic checks
node tests/smoke.mjs      # 38 headless-Chrome (CDP, file://) checks
```

The smoke test accepts `?asof=YYYY-MM-DD` to pin "today" for deterministic
countdowns (the app also honours `window.__ASOF__`).

Hand-verified scenario (see `TEST_RESULTS.md`): Cox's Bazar trip
2026-12-20 → 2026-12-23, budget ৳20,000.00, Food expense ৳3,000.00 →
remaining ৳17,000.00, countdown "in 67 day(s)" from 2026-10-14.

## Limitations

- Personal planner only — not a booking, payment, or travel-agency service.
  It stores your own records; it does not fetch prices, availability, or
  schedules.
- Data lives in one browser's localStorage; there is no account or sync.
- Budget/expense figures are whatever you enter; nothing is verified against
  real-world prices.

## Status

MVP complete. Tests: 53/53 unit + 38/38 smoke, 0 console/page errors.
