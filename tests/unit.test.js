/* Unit tests for travel-planner-bd logic. Run: node tests/unit.test.js */
const L = require('../js/logic.js');
let pass = 0, fail = 0;
function check(name, cond, extra) {
  if (cond) { pass++; }
  else { fail++; console.log('FAIL:', name, extra === undefined ? '' : JSON.stringify(extra)); }
}
function eq(name, got, want) { check(name, JSON.stringify(got) === JSON.stringify(want), { got, want }); }

const trip = { id: 't1', name: 'Cox Trip', destination: "Cox's Bazar", start: '2026-12-20', end: '2026-12-23',
  budgetPaisa: 2000000, notes: '', itinerary: [], expenses: [], packing: [] };

// Dates
eq('daysInclusive 20-23 = 4', L.daysInclusive('2026-12-20', '2026-12-23'), 4);
eq('daysUntil 2026-10-14 -> 2026-12-20 = 67', L.daysUntil('2026-12-20', '2026-10-14'), 67);
eq('status upcoming', L.tripStatus(trip, '2026-10-14'), 'upcoming');
eq('status ongoing on start', L.tripStatus(trip, '2026-12-20'), 'ongoing');
eq('status ongoing on end', L.tripStatus(trip, '2026-12-23'), 'ongoing');
eq('status ended', L.tripStatus(trip, '2026-12-24'), 'ended');
eq('dateForDay day1', L.dateForDay(trip, 1), '2026-12-20');
eq('dateForDay day4', L.dateForDay(trip, 4), '2026-12-23');
eq('dayForDate', L.dayForDate(trip, '2026-12-22'), 3);
check('invalid date rejected', !L.isValidDateStr('2026-02-30'));
check('valid date accepted', L.isValidDateStr('2026-02-28'));
check('bad format rejected', !L.isValidDateStr('20/12/2026'));

// Money
eq('toPaisa 1234.56', L.toPaisa('1234.56'), 123456);
eq('formatMoney en', L.formatMoney(123456, 'en'), '৳1,234.56');
eq('formatMoney bn', L.formatMoney(123456, 'bn'), '৳১,২৩৪.৫৬');
eq('formatMoney negative', L.formatMoney(-5000, 'en'), '-৳50.00');
eq('toBnDigits', L.toBnDigits('2026'), '২০২৬');

// Totals
trip.expenses = [
  { id: 'e1', date: '2026-12-20', category: 'Transport', amountPaisa: 500000, note: '' },
  { id: 'e2', date: '2026-12-21', category: 'Food', amountPaisa: 250050, note: '' },
  { id: 'e3', date: '2026-12-21', category: 'Food', amountPaisa: 49950, note: '' },
];
const tot = L.tripTotals(trip);
eq('spent 8000.00', tot.spent, 800000);
eq('remaining 12000.00', tot.remaining, 1200000);
eq('pct 40', tot.pct, 40);
eq('byCategory Food 3000', tot.byCategory.Food, 300000);
eq('byCategory Stay 0', tot.byCategory.Stay, 0);
// Over-budget
const over = { ...trip, budgetPaisa: 500000 };
eq('over-budget remaining negative', L.tripTotals(over).remaining, -300000);

// Packing
trip.packing = [
  { id: 'p1', name: 'Shirt', category: 'Clothes', packed: true },
  { id: 'p2', name: 'Passport', category: 'Documents', packed: false },
  { id: 'p3', name: 'Charger', category: 'Electronics', packed: true },
  { id: 'p4', name: 'Toothbrush', category: 'Toiletries', packed: true },
];
eq('packing 3/4 = 75', L.packingProgress(trip), 75);
eq('packing empty = 0', L.packingProgress({ packing: [] }), 0);

// Dashboard
const state = { trips: [trip, { ...trip, id: 't2', start: '2026-11-01', end: '2026-11-02', budgetPaisa: 1000000, expenses: [] }], lang: 'en' };
const ds = L.dashboardStats(state, '2026-10-14');
eq('dashboard total 2', ds.total, 2);
eq('dashboard upcoming 2', ds.upcoming, 2);
eq('dashboard budget 30000', ds.budget, 3000000);
eq('dashboard spent 8000', ds.spent, 800000);
eq('dashboard next is earliest', ds.next.id, 't2');

// Validation
eq('validateTrip ok', L.validateTrip({ name: 'X', destination: 'Y', start: '2026-12-01', end: '2026-12-02', budget: '100' }), []);
check('validateTrip empty name', L.validateTrip({ name: ' ', destination: 'Y', start: '2026-12-01', end: '2026-12-02', budget: '100' }).includes('errName'));
check('validateTrip end before start', L.validateTrip({ name: 'X', destination: 'Y', start: '2026-12-05', end: '2026-12-02', budget: '100' }).includes('errEndBeforeStart'));
check('validateTrip zero budget', L.validateTrip({ name: 'X', destination: 'Y', start: '2026-12-01', end: '2026-12-02', budget: '0' }).includes('errBudget'));
check('validateTrip bad date', L.validateTrip({ name: 'X', destination: 'Y', start: '2026-13-01', end: '2026-12-02', budget: '100' }).includes('errDate'));
eq('validateExpense ok', L.validateExpense({ date: '2026-12-20', category: 'Food', amount: '10.50' }), []);
check('validateExpense bad cat', L.validateExpense({ date: '2026-12-20', category: 'Fun', amount: '10' }).length > 0);
check('validateExpense neg amt', L.validateExpense({ date: '2026-12-20', category: 'Food', amount: '-5' }).includes('errExpAmt'));
eq('validateItin ok', L.validateItineraryItem({ day: '2', time: '09:30', title: 'Beach' }, trip), []);
check('validateItin day out of range', L.validateItineraryItem({ day: '9', time: '', title: 'X' }, trip).includes('errItemDay'));
check('validateItin empty title', L.validateItineraryItem({ day: '1', time: '', title: ' ' }, trip).includes('errItemTitle'));
eq('validatePack ok', L.validatePackingItem({ name: 'Hat', category: 'Clothes' }), []);
check('validatePack empty', L.validatePackingItem({ name: '', category: 'Clothes' }).includes('errPackName'));

// Import validation
const good = { trips: [JSON.parse(JSON.stringify(trip))], lang: 'en' };
check('validateImport good', L.validateImport(good));
check('validateImport rejects bad day', !L.validateImport({ trips: [{ ...JSON.parse(JSON.stringify(trip)), itinerary: [{ id: 'x', day: 99, time: '', title: 'T', note: '' }] }], lang: 'en' }));
check('validateImport rejects negative amount', !L.validateImport({ trips: [{ ...JSON.parse(JSON.stringify(trip)), expenses: [{ id: 'x', date: '2026-12-20', category: 'Food', amountPaisa: -1, note: '' }] }], lang: 'en' }));
check('validateImport rejects non-array', !L.validateImport({ trips: 'nope' }));
check('validateImport rejects missing trips', !L.validateImport({}));
check('validateImport rejects bad category', !L.validateImport({ trips: [{ ...JSON.parse(JSON.stringify(trip)), packing: [{ id: 'x', name: 'N', category: 'Pets', packed: false }] }], lang: 'en' }));

// i18n
eq('i18n en title', L.t('title', 'en'), 'Travel Planner BD');
eq('i18n bn title', L.t('title', 'bn'), 'ট্রাভেল প্ল্যানার বিডি');
check('i18n bn daysToGo has placeholder', L.t('daysToGo', 'bn').includes('{n}'));
eq('fill', L.fill('in {n} day(s)', { n: 5 }), 'in 5 day(s)');

console.log(pass + '/' + (pass + fail) + ' unit checks passed');
process.exit(fail ? 1 : 0);
