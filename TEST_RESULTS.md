# TEST_RESULTS — travel-planner-bd (run 2026-10-14, 14:00 slot)

## Unit tests — 53/53 passed
`node tests/unit.test.js`
- Dates: daysInclusive 20→23 = 4; daysUntil 2026-10-14 → 2026-12-20 = 67;
  status upcoming/ongoing (on start + end)/ended; dateForDay day 1/4; dayForDate;
  2026-02-30 rejected, 2026-02-28 accepted, DD/MM/YYYY rejected.
- Money: toPaisa(1234.56) = 123456; formatMoney EN ৳1,234.56 / BN ৳১,২৩৪.৫৬;
  negative -৳50.00; toBnDigits(2026) = ২০২৬.
- Totals: expenses 5000 + 2500.50 + 499.50 → spent 8000.00, remaining 12000.00,
  40%, Food 3000, Stay 0; over-budget remaining -3000.
- Packing: 3/4 packed = 75%; empty = 0.
- Dashboard: 2 trips → total 2, upcoming 2, budget 30000, spent 8000,
  next = earliest-starting trip.
- Validation: trip (empty name / end-before-start / zero budget / bad date);
  expense (bad category / negative amount); itinerary (day 9 of 4-day trip /
  empty title); packing (empty name).
- Import validation: good data accepted; rejected: itinerary day 99, negative
  expense amount, non-array trips, missing trips, bad packing category.
- i18n: EN + BN titles; `{n}` placeholder present; fill() substitution.

## Smoke tests — 38/38 passed
`node tests/smoke.mjs` (raw CDP, /opt/meta-chromium/chrome, file://, ?asof=2026-10-14)
- Title/h1, 3 tabs, empty dashboard 0 trips, 0 console errors on load.
- Empty trip submit → inline error, still 0 trips.
- Add trip Cox Trip / Cox's Bazar / 2026-12-20 → 2026-12-23 / ৳20,000 →
  total 1, upcoming 1, budget ৳20,000.00, next-trip card, "in 67 day(s)",
  trip chip, detail shows budget.
- Itinerary: "Beach sunrise" 09:30 renders.
- Expense: Food ৳3,000 on 2026-12-20 → spent ৳3,000.00, detail shows
  ৳3,000.00 + remaining ৳17,000.00.
- Packing: "Sunscreen" renders, 0% packed → 100% after checkbox toggle.
- Negative expense -5 rejected inline, spent unchanged at ৳3,000.00.
- BN toggle: title "ট্রাভেল প্ল্যানার বিডি", budget "৳২০,০০০.০০",
  countdown "৬৭ দিন বাকি"; toggle back to EN.
- Reload persistence: trip + expense survive reload.
- Data tab: lowercase "delete" erase rejected, data intact; malformed import
  rejected, data intact; typed DELETE erase-all → 0 trips, ৳0.00 spent.
- 390px mobile: no horizontal overflow (scrollWidth <= 390).
- Zero http(s) network requests; zero console/page errors overall.

## Harness note
First smoke run failed 34/38 because the harness navigated via
http://127.0.0.1, which Chrome 152 blocks under CDP in this VM
(ERR_BLOCKED_BY_LOCAL_NETWORK_ACCESS_CHECKS, cf. AGENTS.md). Rewrote the
harness to file:// URLs; the app itself was unchanged and then passed 38/38.
This was a test-harness fix, not an app repair. App repairs: 0.
