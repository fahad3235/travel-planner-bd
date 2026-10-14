/* travel-planner-bd — pure logic + rendering. Zero network requests. */
/* Money is integer paisa everywhere. Dates are YYYY-MM-DD local dates. */
(function (root) {
  'use strict';

  var BN_DIGITS = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
  var EXPENSE_CATS = ['Transport', 'Food', 'Stay', 'Shopping', 'Other'];
  var PACKING_CATS = ['Clothes', 'Documents', 'Toiletries', 'Electronics', 'Medicine', 'Other'];

  var I18N = {
    en: {
      title: 'Travel Planner BD',
      subtitle: 'Plan trips across Bangladesh — itinerary, budget and packing in one place.',
      tabDashboard: 'Dashboard', tabTrips: 'Trips', tabData: 'Data',
      langBtn: 'বাংলা',
      totalTrips: 'Total trips', upcomingTrips: 'Upcoming trips',
      totalBudget: 'Total budget', totalSpent: 'Total spent',
      nextTrip: 'Next trip', noTripsYet: 'No trips yet. Add your first trip below.',
      daysToGo: 'in {n} day(s)', ongoing: 'Ongoing now', ended: 'Ended',
      starts: 'Starts', ends: 'Ends', budget: 'Budget', spent: 'Spent', remaining: 'Remaining',
      view: 'View', addTrip: 'Add trip', tripName: 'Trip name', destination: 'Destination',
      startDate: 'Start date', endDate: 'End date', budgetBDT: 'Budget (৳)', notes: 'Notes (optional)',
      add: 'Add', delete: 'Delete', deleteTrip: 'Delete trip',
      itinerary: 'Itinerary', day: 'Day', time: 'Time', itemTitle: 'Title', note: 'Note',
      addItem: 'Add item', noItinerary: 'No itinerary items yet for this trip.',
      expenses: 'Expenses', expDate: 'Date', category: 'Category', amount: 'Amount (৳)',
      addExpense: 'Add expense', noExpenses: 'No expenses logged yet.',
      byCategory: 'By category', overBudget: 'Over budget by {amt}',
      packing: 'Packing checklist', packName: 'Item name', addPacking: 'Add packing item',
      noPacking: 'Nothing on the packing list yet.', packed: '{p}% packed',
      exportBtn: 'Export JSON', importBtn: 'Import JSON', importPlaceholder: 'Paste exported JSON here…',
      eraseBtn: 'Erase all data', eraseHint: 'Type DELETE in the box below to confirm, then press Erase all data.',
      erasePlaceholder: 'Type DELETE', importOk: 'Import successful.',
      eraseOk: 'All data erased.', selectTrip: 'Select a trip',
      errName: 'Trip name is required.', errDest: 'Destination is required.',
      errDate: 'Enter valid start and end dates.', errEndBeforeStart: 'End date cannot be before start date.',
      errBudget: 'Budget must be a positive number.',
      errExpDate: 'Enter a valid expense date.', errExpAmt: 'Amount must be a positive number.',
      errItemTitle: 'Title is required.', errItemDay: 'Day must be within the trip dates.',
      errPackName: 'Item name is required.', errImport: 'Invalid import data — nothing changed.',
      errErase: 'Type DELETE exactly to erase everything.',
      disclaimer: 'Offline personal planner. Budgets and expenses are your own records — not a booking or payment service.',
      tripDeleted: 'Trip deleted.', back: 'Back to trips',
      spentOf: '{spent} of {budget} ({pct}%)',
      confirmDeleteTrip: 'Delete this trip and all its itinerary, expenses and packing items?'
    },
    bn: {
      title: 'ট্রাভেল প্ল্যানার বিডি',
      subtitle: 'বাংলাদেশজুড়ে ভ্রমণের পরিকল্পনা করুন — ভ্রমণসূচি, বাজেট ও প্যাকিং এক জায়গায়।',
      tabDashboard: 'ড্যাশবোর্ড', tabTrips: 'ভ্রমণ', tabData: 'ডেটা',
      langBtn: 'English',
      totalTrips: 'মোট ভ্রমণ', upcomingTrips: 'আসন্ন ভ্রমণ',
      totalBudget: 'মোট বাজেট', totalSpent: 'মোট খরচ',
      nextTrip: 'পরবর্তী ভ্রমণ', noTripsYet: 'এখনো কোনো ভ্রমণ নেই। নিচে প্রথম ভ্রমণ যোগ করুন।',
      daysToGo: '{n} দিন বাকি', ongoing: 'চলমান', ended: 'শেষ',
      starts: 'শুরু', ends: 'শেষ', budget: 'বাজেট', spent: 'খরচ', remaining: 'বাকি',
      view: 'দেখুন', addTrip: 'ভ্রমণ যোগ করুন', tripName: 'ভ্রমণের নাম', destination: 'গন্তব্য',
      startDate: 'শুরুর তারিখ', endDate: 'শেষের তারিখ', budgetBDT: 'বাজেট (৳)', notes: 'নোট (ঐচ্ছিক)',
      add: 'যোগ করুন', delete: 'মুছুন', deleteTrip: 'ভ্রমণ মুছুন',
      itinerary: 'ভ্রমণসূচি', day: 'দিন', time: 'সময়', itemTitle: 'শিরোনাম', note: 'নোট',
      addItem: 'আইটেম যোগ করুন', noItinerary: 'এই ভ্রমণের জন্য এখনো কোনো ভ্রমণসূচি নেই।',
      expenses: 'খরচ', expDate: 'তারিখ', category: 'বিভাগ', amount: 'পরিমাণ (৳)',
      addExpense: 'খরচ যোগ করুন', noExpenses: 'এখনো কোনো খরচ লেখা হয়নি।',
      byCategory: 'বিভাগ অনুযায়ী', overBudget: 'বাজেটের চেয়ে {amt} বেশি',
      packing: 'প্যাকিং তালিকা', packName: 'জিনিসের নাম', addPacking: 'প্যাকিং আইটেম যোগ করুন',
      noPacking: 'প্যাকিং তালিকায় এখনো কিছু নেই।', packed: '{p}% প্যাক করা হয়েছে',
      exportBtn: 'JSON এক্সপোর্ট', importBtn: 'JSON ইমপোর্ট', importPlaceholder: 'এখানে এক্সপোর্ট করা JSON পেস্ট করুন…',
      eraseBtn: 'সব ডেটা মুছুন', eraseHint: 'নিশ্চিত করতে নিচের বাক্সে DELETE লিখুন, তারপর সব ডেটা মুছুন চাপুন।',
      erasePlaceholder: 'DELETE লিখুন', importOk: 'ইমপোর্ট সফল হয়েছে।',
      eraseOk: 'সব ডেটা মুছে ফেলা হয়েছে।', selectTrip: 'একটি ভ্রমণ বেছে নিন',
      errName: 'ভ্রমণের নাম আবশ্যক।', errDest: 'গন্তব্য আবশ্যক।',
      errDate: 'সঠিক শুরুর ও শেষের তারিখ দিন।', errEndBeforeStart: 'শেষের তারিখ শুরুর তারিখের আগে হতে পারবে না।',
      errBudget: 'বাজেট একটি ধনাত্মক সংখ্যা হতে হবে।',
      errExpDate: 'সঠিক খরচের তারিখ দিন।', errExpAmt: 'পরিমাণ একটি ধনাত্মক সংখ্যা হতে হবে।',
      errItemTitle: 'শিরোনাম আবশ্যক।', errItemDay: 'দিন ভ্রমণের তারিখের মধ্যে হতে হবে।',
      errPackName: 'জিনিসের নাম আবশ্যক।', errImport: 'অবৈধ ইমপোর্ট ডেটা — কিছুই পরিবর্তন হয়নি।',
      errErase: 'সবকিছু মুছতে ঠিক DELETE লিখুন।',
      disclaimer: 'অফলাইন ব্যক্তিগত পরিকল্পক। বাজেট ও খরচ আপনার নিজের হিসাব — এটি কোনো বুকিং বা পেমেন্ট সেবা নয়।',
      tripDeleted: 'ভ্রমণ মুছে ফেলা হয়েছে।', back: 'ভ্রমণ তালিকায় ফিরুন',
      spentOf: '{budget}-এর মধ্যে {spent} ({pct}%)',
      confirmDeleteTrip: 'এই ভ্রমণ এবং এর সব ভ্রমণসূচি, খরচ ও প্যাকিং আইটেম মুছে ফেলবেন?'
    }
  };

  function t(key, lang) { return (I18N[lang] || I18N.en)[key] || key; }
  function fill(template, vars) {
    return String(template).replace(/\{(\w+)\}/g, function (m, k) {
      return vars[k] !== undefined ? vars[k] : m;
    });
  }
  function toBnDigits(str) {
    return String(str).replace(/[0-9]/g, function (d) { return BN_DIGITS[+d]; });
  }
  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function isValidDateStr(s) {
    if (typeof s !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(s)) return false;
    var d = new Date(s + 'T00:00:00');
    return !isNaN(d.getTime()) && d.toISOString().slice(0, 10) === s;
  }
  function parseDate(s) { return new Date(s + 'T00:00:00'); }
  function fmtDate(s) { return s; }
  function dayDiff(a, b) { // b - a in whole days
    return Math.round((parseDate(b) - parseDate(a)) / 86400000);
  }
  function daysInclusive(start, end) { return dayDiff(start, end) + 1; }
  function daysUntil(start, asof) { return dayDiff(asof, start); }
  function tripStatus(trip, asof) {
    if (asof < trip.start) return 'upcoming';
    if (asof > trip.end) return 'ended';
    return 'ongoing';
  }
  function tripDayCount(trip) { return daysInclusive(trip.start, trip.end); }
  function dateForDay(trip, day) {
    var d = parseDate(trip.start);
    d.setDate(d.getDate() + (day - 1));
    var y = d.getFullYear(), m = String(d.getMonth() + 1).padStart(2, '0'), dd = String(d.getDate()).padStart(2, '0');
    return y + '-' + m + '-' + dd;
  }
  function dayForDate(trip, dateStr) { return dayDiff(trip.start, dateStr) + 1; }

  function toPaisa(amount) {
    var n = Number(amount);
    if (!isFinite(n)) return NaN;
    return Math.round(n * 100);
  }
  function fromPaisa(paisa) { return paisa / 100; }
  function formatMoney(paisa, lang) {
    var neg = paisa < 0;
    var abs = Math.abs(paisa);
    var whole = Math.floor(abs / 100);
    var frac = String(abs % 100).padStart(2, '0');
    var grouped = String(whole).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    var out = '৳' + grouped + '.' + frac;
    if (neg) out = '-' + out;
    return lang === 'bn' ? toBnDigits(out) : out;
  }
  function formatPct(num, lang) {
    var s = (Math.round(num * 100) / 100).toFixed(2) + '%';
    return lang === 'bn' ? toBnDigits(s) : s;
  }
  function fmtNum(n, lang) {
    var s = String(n);
    return lang === 'bn' ? toBnDigits(s) : s;
  }

  function tripTotals(trip) {
    var spent = 0;
    var byCat = {};
    EXPENSE_CATS.forEach(function (c) { byCat[c] = 0; });
    (trip.expenses || []).forEach(function (e) {
      spent += e.amountPaisa;
      if (byCat[e.category] !== undefined) byCat[e.category] += e.amountPaisa;
    });
    var remaining = trip.budgetPaisa - spent;
    var pct = trip.budgetPaisa > 0 ? (spent / trip.budgetPaisa) * 100 : 0;
    return { spent: spent, remaining: remaining, pct: pct, byCategory: byCat };
  }
  function packingProgress(trip) {
    var items = trip.packing || [];
    if (items.length === 0) return 0;
    var done = items.filter(function (p) { return p.packed; }).length;
    return Math.round((done / items.length) * 100);
  }
  function dashboardStats(state, asof) {
    var trips = state.trips || [];
    var upcoming = trips.filter(function (tr) { return tripStatus(tr, asof) === 'upcoming'; }).length;
    var budget = 0, spent = 0;
    trips.forEach(function (tr) { budget += tr.budgetPaisa; spent += tripTotals(tr).spent; });
    var next = null;
    trips.filter(function (tr) { return tripStatus(tr, asof) !== 'ended'; })
      .sort(function (a, b) { return a.start < b.start ? -1 : 1; })
      .forEach(function (tr) { if (!next) next = tr; });
    return { total: trips.length, upcoming: upcoming, budget: budget, spent: spent, next: next };
  }

  function validateTrip(input) {
    var errors = [];
    if (!input.name || !String(input.name).trim()) errors.push('errName');
    if (!input.destination || !String(input.destination).trim()) errors.push('errDest');
    if (!isValidDateStr(input.start) || !isValidDateStr(input.end)) errors.push('errDate');
    else if (input.end < input.start) errors.push('errEndBeforeStart');
    var p = toPaisa(input.budget);
    if (isNaN(p) || p <= 0) errors.push('errBudget');
    return errors;
  }
  function validateExpense(input) {
    var errors = [];
    if (!isValidDateStr(input.date)) errors.push('errExpDate');
    if (EXPENSE_CATS.indexOf(input.category) === -1) errors.push('errExpDate');
    var p = toPaisa(input.amount);
    if (isNaN(p) || p <= 0) errors.push('errExpAmt');
    return errors;
  }
  function validateItineraryItem(input, trip) {
    var errors = [];
    var day = Number(input.day);
    if (!input.title || !String(input.title).trim()) errors.push('errItemTitle');
    if (!Number.isInteger(day) || day < 1 || day > tripDayCount(trip)) errors.push('errItemDay');
    if (input.time && !/^([01]\d|2[0-3]):[0-5]\d$/.test(input.time)) errors.push('errItemTitle');
    return errors;
  }
  function validatePackingItem(input) {
    var errors = [];
    if (!input.name || !String(input.name).trim()) errors.push('errPackName');
    if (PACKING_CATS.indexOf(input.category) === -1) errors.push('errPackName');
    return errors;
  }
  function isPlainObject(v) { return v !== null && typeof v === 'object' && !Array.isArray(v); }
  function validateImport(data) {
    if (!isPlainObject(data) || !Array.isArray(data.trips)) return false;
    for (var i = 0; i < data.trips.length; i++) {
      var tr = data.trips[i];
      if (!isPlainObject(tr)) return false;
      if (typeof tr.id !== 'string' || typeof tr.name !== 'string' || typeof tr.destination !== 'string') return false;
      if (!isValidDateStr(tr.start) || !isValidDateStr(tr.end) || tr.end < tr.start) return false;
      if (!Number.isInteger(tr.budgetPaisa) || tr.budgetPaisa <= 0) return false;
      if (typeof tr.notes !== 'string') return false;
      if (!Array.isArray(tr.itinerary) || !Array.isArray(tr.expenses) || !Array.isArray(tr.packing)) return false;
      for (var j = 0; j < tr.itinerary.length; j++) {
        var it = tr.itinerary[j];
        if (!isPlainObject(it) || typeof it.id !== 'string' || !Number.isInteger(it.day) ||
            it.day < 1 || it.day > tripDayCount(tr) || typeof it.title !== 'string' ||
            typeof it.time !== 'string' || typeof it.note !== 'string') return false;
      }
      for (var k = 0; k < tr.expenses.length; k++) {
        var e = tr.expenses[k];
        if (!isPlainObject(e) || typeof e.id !== 'string' || !isValidDateStr(e.date) ||
            EXPENSE_CATS.indexOf(e.category) === -1 ||
            !Number.isInteger(e.amountPaisa) || e.amountPaisa <= 0 || typeof e.note !== 'string') return false;
      }
      for (var m = 0; m < tr.packing.length; m++) {
        var p = tr.packing[m];
        if (!isPlainObject(p) || typeof p.id !== 'string' || typeof p.name !== 'string' ||
            PACKING_CATS.indexOf(p.category) === -1 || typeof p.packed !== 'boolean') return false;
      }
    }
    return true;
  }

  function newId() {
    return 'id-' + Date.now().toString(36) + '-' + Math.floor(Math.random() * 1e9).toString(36);
  }
  function emptyState() { return { trips: [], lang: 'en' }; }

  /* ---------------- App (browser only) ---------------- */
  var STORAGE_KEY = 'travel-planner-bd-v1';
  var state = emptyState();
  var selectedTripId = null;
  var activeTab = 'dashboard';

  function getAsof() {
    try {
      var q = new URLSearchParams(window.location.search);
      var a = q.get('asof');
      if (a && isValidDateStr(a)) return a;
      if (window.__ASOF__ && isValidDateStr(window.__ASOF__)) return window.__ASOF__;
    } catch (e) { /* ignore */ }
    var now = new Date();
    return now.getFullYear() + '-' + String(now.getMonth() + 1).padStart(2, '0') + '-' + String(now.getDate()).padStart(2, '0');
  }
  function save() {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch (e) { /* ignore */ }
  }
  function load() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      var data = JSON.parse(raw);
      if (validateImport(data)) { state = data; if (state.lang !== 'bn') state.lang = 'en'; }
    } catch (e) { /* ignore */ }
  }
  function selectedTrip() {
    return (state.trips || []).filter(function (tr) { return tr.id === selectedTripId; })[0] || null;
  }
  function setLang(lang) {
    state.lang = lang === 'bn' ? 'bn' : 'en';
    document.documentElement.lang = state.lang === 'bn' ? 'bn' : 'en';
    save(); renderAll();
  }
  function showTab(tab) {
    activeTab = tab;
    document.querySelectorAll('.tab-btn').forEach(function (b) {
      b.classList.toggle('active', b.dataset.tab === tab);
    });
    document.querySelectorAll('.tab-panel').forEach(function (p) {
      p.classList.toggle('hidden', p.dataset.panel !== tab);
    });
  }
  function setError(id, keys) {
    var el = document.getElementById(id);
    if (!el) return;
    el.textContent = keys.length ? keys.map(function (k) { return t(k, state.lang); }).join(' ') : '';
  }
  function tripCard(tr, asof) {
    var tot = tripTotals(tr);
    var st = tripStatus(tr, asof);
    var statusText = st === 'upcoming' ? fill(t('daysToGo', state.lang), { n: fmtNum(daysUntil(tr.start, asof), state.lang) })
      : st === 'ongoing' ? t('ongoing', state.lang) : t('ended', state.lang);
    return '<article class="card trip-card" data-trip="' + esc(tr.id) + '">' +
      '<h3>' + esc(tr.name) + '</h3>' +
      '<p class="muted">' + esc(tr.destination) + ' · ' + esc(tr.start) + ' → ' + esc(tr.end) + ' · ' + esc(statusText) + '</p>' +
      '<p>' + esc(t('budget', state.lang)) + ': ' + esc(formatMoney(tr.budgetPaisa, state.lang)) +
      ' · ' + esc(t('spent', state.lang)) + ': ' + esc(formatMoney(tot.spent, state.lang)) + '</p>' +
      '<div class="bar"><div class="bar-fill" style="width:' + Math.min(100, tot.pct) + '%"></div></div>' +
      '<p class="muted">' + esc(fill(t('spentOf', state.lang), { spent: formatMoney(tot.spent, state.lang), budget: formatMoney(tr.budgetPaisa, state.lang), pct: fmtNum((Math.round(tot.pct * 100) / 100).toFixed(2), state.lang) })) + '</p>' +
      '<button class="btn view-trip" data-trip="' + esc(tr.id) + '">' + esc(t('view', state.lang)) + '</button>' +
      '</article>';
  }
  function renderDashboard() {
    var asof = getAsof();
    var s = dashboardStats(state, asof);
    document.getElementById('stat-total').textContent = fmtNum(s.total, state.lang);
    document.getElementById('stat-upcoming').textContent = fmtNum(s.upcoming, state.lang);
    document.getElementById('stat-budget').textContent = formatMoney(s.budget, state.lang);
    document.getElementById('stat-spent').textContent = formatMoney(s.spent, state.lang);
    var nextEl = document.getElementById('next-trip');
    if (s.next) {
      var st = tripStatus(s.next, asof);
      var when = st === 'upcoming' ? fill(t('daysToGo', state.lang), { n: fmtNum(daysUntil(s.next.start, asof), state.lang) })
        : st === 'ongoing' ? t('ongoing', state.lang) : t('ended', state.lang);
      nextEl.innerHTML = '<strong>' + esc(s.next.name) + '</strong> — ' + esc(s.next.destination) +
        '<br><span class="muted">' + esc(s.next.start) + ' → ' + esc(s.next.end) + ' · ' + esc(when) + '</span>';
    } else {
      nextEl.textContent = t('noTripsYet', state.lang);
    }
    var list = document.getElementById('dashboard-trips');
    list.innerHTML = state.trips.length ? state.trips.map(function (tr) { return tripCard(tr, asof); }).join('') :
      '<p class="muted">' + esc(t('noTripsYet', state.lang)) + '</p>';
    bindViewButtons(list);
  }
  function bindViewButtons(scope) {
    scope.querySelectorAll('.view-trip').forEach(function (btn) {
      btn.addEventListener('click', function () {
        selectedTripId = btn.dataset.trip;
        showTab('trips'); renderTrips();
      });
    });
  }
  function renderTrips() {
    var list = document.getElementById('trip-list');
    list.innerHTML = state.trips.length ? state.trips.map(function (tr) {
      return '<button class="trip-chip' + (tr.id === selectedTripId ? ' selected' : '') + '" data-trip="' + esc(tr.id) + '">' +
        esc(tr.name) + ' — ' + esc(tr.destination) + '</button>';
    }).join('') : '<p class="muted">' + esc(t('noTripsYet', state.lang)) + '</p>';
    list.querySelectorAll('.trip-chip').forEach(function (chip) {
      chip.addEventListener('click', function () { selectedTripId = chip.dataset.trip; renderTrips(); });
    });
    var detail = document.getElementById('trip-detail');
    var tr = selectedTrip();
    if (!tr) {
      detail.innerHTML = '<p class="muted">' + esc(t('selectTrip', state.lang)) + '</p>';
      return;
    }
    var asof = getAsof();
    var tot = tripTotals(tr);
    var packPct = packingProgress(tr);
    var dayOpts = '';
    for (var d = 1; d <= tripDayCount(tr); d++) {
      dayOpts += '<option value="' + d + '">' + esc(t('day', state.lang)) + ' ' + fmtNum(d, state.lang) + ' (' + esc(dateForDay(tr, d)) + ')</option>';
    }
    var itinHtml = '';
    for (var d2 = 1; d2 <= tripDayCount(tr); d2++) {
      var items = (tr.itinerary || []).filter(function (it) { return it.day === d2; })
        .sort(function (a, b) { return (a.time || '').localeCompare(b.time || ''); });
      if (!items.length) continue;
      itinHtml += '<h4>' + esc(t('day', state.lang)) + ' ' + fmtNum(d2, state.lang) + ' — ' + esc(dateForDay(tr, d2)) + '</h4><ul class="item-list">';
      items.forEach(function (it) {
        itinHtml += '<li><strong>' + esc(it.time || '—') + '</strong> ' + esc(it.title) +
          (it.note ? ' <span class="muted">— ' + esc(it.note) + '</span>' : '') +
          ' <button class="btn small danger del-itin" data-id="' + esc(it.id) + '">' + esc(t('delete', state.lang)) + '</button></li>';
      });
      itinHtml += '</ul>';
    }
    if (!itinHtml) itinHtml = '<p class="muted">' + esc(t('noItinerary', state.lang)) + '</p>';
    var catHtml = EXPENSE_CATS.map(function (c) {
      var amt = tot.byCategory[c];
      var pct = tot.spent > 0 ? Math.round((amt / tot.spent) * 100) : 0;
      return '<li>' + esc(c) + ': ' + esc(formatMoney(amt, state.lang)) + ' (' + fmtNum(pct, state.lang) + '%)</li>';
    }).join('');
    var expHtml = (tr.expenses || []).length ? '<ul class="item-list">' + (tr.expenses || []).slice().sort(function (a, b) {
      return a.date < b.date ? -1 : 1;
    }).map(function (e) {
      return '<li>' + esc(e.date) + ' · ' + esc(e.category) + ': <strong>' + esc(formatMoney(e.amountPaisa, state.lang)) + '</strong>' +
        (e.note ? ' <span class="muted">— ' + esc(e.note) + '</span>' : '') +
        ' <button class="btn small danger del-exp" data-id="' + esc(e.id) + '">' + esc(t('delete', state.lang)) + '</button></li>';
    }).join('') + '</ul>' : '<p class="muted">' + esc(t('noExpenses', state.lang)) + '</p>';
    var packHtml = (tr.packing || []).length ? '<ul class="item-list">' + (tr.packing || []).map(function (p) {
      return '<li><label><input type="checkbox" class="pack-toggle" data-id="' + esc(p.id) + '"' + (p.packed ? ' checked' : '') + '> ' +
        esc(p.name) + ' <span class="muted">(' + esc(p.category) + ')</span></label>' +
        ' <button class="btn small danger del-pack" data-id="' + esc(p.id) + '">' + esc(t('delete', state.lang)) + '</button></li>';
    }).join('') + '</ul>' : '<p class="muted">' + esc(t('noPacking', state.lang)) + '</p>';
    var overHtml = tot.remaining < 0 ? '<p class="over">' + esc(fill(t('overBudget', state.lang), { amt: formatMoney(-tot.remaining, state.lang) })) + '</p>' : '';
    detail.innerHTML =
      '<h3>' + esc(tr.name) + '</h3>' +
      '<p class="muted">' + esc(tr.destination) + ' · ' + esc(tr.start) + ' → ' + esc(tr.end) +
      ' (' + fmtNum(tripDayCount(tr), state.lang) + ' ' + esc(t('day', state.lang).toLowerCase()) + 's)' +
      (tr.notes ? ' · ' + esc(tr.notes) : '') + '</p>' +
      '<p>' + esc(t('budget', state.lang)) + ': ' + esc(formatMoney(tr.budgetPaisa, state.lang)) +
      ' · ' + esc(t('spent', state.lang)) + ': ' + esc(formatMoney(tot.spent, state.lang)) +
      ' · ' + esc(t('remaining', state.lang)) + ': ' + esc(formatMoney(tot.remaining, state.lang)) + '</p>' +
      '<div class="bar"><div class="bar-fill" style="width:' + Math.min(100, tot.pct) + '%"></div></div>' + overHtml +
      '<button class="btn danger" id="delete-trip-btn">' + esc(t('deleteTrip', state.lang)) + '</button>' +
      '<h3>' + esc(t('itinerary', state.lang)) + '</h3>' +
      '<form id="itin-form" novalidate><label>' + esc(t('day', state.lang)) +
      '<select id="itin-day">' + dayOpts + '</select></label>' +
      '<label>' + esc(t('time', state.lang)) + '<input id="itin-time" type="time"></label>' +
      '<label>' + esc(t('itemTitle', state.lang)) + '<input id="itin-title" type="text"></label>' +
      '<label>' + esc(t('note', state.lang)) + '<input id="itin-note" type="text"></label>' +
      '<button class="btn" type="submit">' + esc(t('addItem', state.lang)) + '</button>' +
      '<p class="error" id="itin-error"></p></form>' + itinHtml +
      '<h3>' + esc(t('expenses', state.lang)) + '</h3>' +
      '<form id="exp-form" novalidate><label>' + esc(t('expDate', state.lang)) +
      '<input id="exp-date" type="date" value="' + esc(asof) + '"></label>' +
      '<label>' + esc(t('category', state.lang)) + '<select id="exp-cat">' +
      EXPENSE_CATS.map(function (c) { return '<option>' + esc(c) + '</option>'; }).join('') + '</select></label>' +
      '<label>' + esc(t('amount', state.lang)) + '<input id="exp-amount" type="number" min="0.01" step="0.01"></label>' +
      '<label>' + esc(t('note', state.lang)) + '<input id="exp-note" type="text"></label>' +
      '<button class="btn" type="submit">' + esc(t('addExpense', state.lang)) + '</button>' +
      '<p class="error" id="exp-error"></p></form>' +
      '<p>' + esc(t('byCategory', state.lang)) + ':</p><ul class="item-list">' + catHtml + '</ul>' + expHtml +
      '<h3>' + esc(t('packing', state.lang)) + '</h3>' +
      '<p>' + esc(fill(t('packed', state.lang), { p: fmtNum(packPct, state.lang) })) + '</p>' +
      '<div class="bar"><div class="bar-fill" style="width:' + packPct + '%"></div></div>' +
      '<form id="pack-form" novalidate><label>' + esc(t('packName', state.lang)) +
      '<input id="pack-name" type="text"></label>' +
      '<label>' + esc(t('category', state.lang)) + '<select id="pack-cat">' +
      PACKING_CATS.map(function (c) { return '<option>' + esc(c) + '</option>'; }).join('') + '</select></label>' +
      '<button class="btn" type="submit">' + esc(t('addPacking', state.lang)) + '</button>' +
      '<p class="error" id="pack-error"></p></form>' + packHtml;

    document.getElementById('delete-trip-btn').addEventListener('click', function () {
      if (!window.confirm(t('confirmDeleteTrip', state.lang))) return;
      state.trips = state.trips.filter(function (x) { return x.id !== tr.id; });
      selectedTripId = null; save(); renderAll();
    });
    document.getElementById('itin-form').addEventListener('submit', function (ev) {
      ev.preventDefault();
      var input = { day: document.getElementById('itin-day').value, time: document.getElementById('itin-time').value, title: document.getElementById('itin-title').value, note: document.getElementById('itin-note').value };
      var errs = validateItineraryItem(input, tr);
      setError('itin-error', errs);
      if (errs.length) return;
      tr.itinerary.push({ id: newId(), day: Number(input.day), time: input.time || '', title: input.title.trim(), note: input.note.trim() });
      save(); renderTrips();
    });
    document.getElementById('exp-form').addEventListener('submit', function (ev) {
      ev.preventDefault();
      var input = { date: document.getElementById('exp-date').value, category: document.getElementById('exp-cat').value, amount: document.getElementById('exp-amount').value, note: document.getElementById('exp-note').value };
      var errs = validateExpense(input);
      setError('exp-error', errs);
      if (errs.length) return;
      tr.expenses.push({ id: newId(), date: input.date, category: input.category, amountPaisa: toPaisa(input.amount), note: input.note.trim() });
      save(); renderAll();
    });
    document.getElementById('pack-form').addEventListener('submit', function (ev) {
      ev.preventDefault();
      var input = { name: document.getElementById('pack-name').value, category: document.getElementById('pack-cat').value };
      var errs = validatePackingItem(input);
      setError('pack-error', errs);
      if (errs.length) return;
      tr.packing.push({ id: newId(), name: input.name.trim(), category: input.category, packed: false });
      save(); renderTrips();
    });
    detail.querySelectorAll('.del-itin').forEach(function (b) {
      b.addEventListener('click', function () { tr.itinerary = tr.itinerary.filter(function (x) { return x.id !== b.dataset.id; }); save(); renderTrips(); });
    });
    detail.querySelectorAll('.del-exp').forEach(function (b) {
      b.addEventListener('click', function () { tr.expenses = tr.expenses.filter(function (x) { return x.id !== b.dataset.id; }); save(); renderAll(); });
    });
    detail.querySelectorAll('.del-pack').forEach(function (b) {
      b.addEventListener('click', function () { tr.packing = tr.packing.filter(function (x) { return x.id !== b.dataset.id; }); save(); renderTrips(); });
    });
    detail.querySelectorAll('.pack-toggle').forEach(function (cb) {
      cb.addEventListener('change', function () {
        var p = (tr.packing || []).filter(function (x) { return x.id === cb.dataset.id; })[0];
        if (p) p.packed = cb.checked;
        save(); renderTrips();
      });
    });
  }
  function applyStaticText() {
    document.querySelectorAll('[data-i18n]').forEach(function (el) {
      el.textContent = t(el.dataset.i18n, state.lang);
    });
    document.querySelectorAll('[data-i18n-ph]').forEach(function (el) {
      el.placeholder = t(el.dataset.i18nPh, state.lang);
    });
    document.getElementById('lang-toggle').textContent = t('langBtn', state.lang);
  }
  function renderAll() {
    applyStaticText();
    renderDashboard();
    renderTrips();
    showTab(activeTab);
  }
  function init() {
    load();
    document.getElementById('lang-toggle').addEventListener('click', function () {
      setLang(state.lang === 'en' ? 'bn' : 'en');
    });
    document.querySelectorAll('.tab-btn').forEach(function (b) {
      b.addEventListener('click', function () { showTab(b.dataset.tab); });
    });
    document.getElementById('trip-form').addEventListener('submit', function (ev) {
      ev.preventDefault();
      var input = {
        name: document.getElementById('trip-name').value,
        destination: document.getElementById('trip-dest').value,
        start: document.getElementById('trip-start').value,
        end: document.getElementById('trip-end').value,
        budget: document.getElementById('trip-budget').value,
        notes: document.getElementById('trip-notes').value
      };
      var errs = validateTrip(input);
      setError('trip-error', errs);
      if (errs.length) return;
      var tr = { id: newId(), name: input.name.trim(), destination: input.destination.trim(), start: input.start, end: input.end, budgetPaisa: toPaisa(input.budget), notes: input.notes.trim(), itinerary: [], expenses: [], packing: [] };
      state.trips.push(tr);
      selectedTripId = tr.id;
      document.getElementById('trip-form').reset();
      save(); renderAll(); showTab('trips');
    });
    document.getElementById('export-btn').addEventListener('click', function () {
      var blob = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' });
      var a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = 'travel-planner-bd-export.json';
      a.click();
      URL.revokeObjectURL(a.href);
    });
    document.getElementById('import-btn').addEventListener('click', function () {
      var msg = document.getElementById('data-msg');
      try {
        var data = JSON.parse(document.getElementById('import-text').value);
        if (!validateImport(data)) { msg.textContent = t('errImport', state.lang); msg.className = 'error'; return; }
        state = data; if (state.lang !== 'bn') state.lang = 'en';
        selectedTripId = null; save(); renderAll();
        msg.textContent = t('importOk', state.lang); msg.className = 'ok';
      } catch (e) { msg.textContent = t('errImport', state.lang); msg.className = 'error'; }
    });
    document.getElementById('erase-btn').addEventListener('click', function () {
      var msg = document.getElementById('data-msg');
      if (document.getElementById('erase-confirm').value !== 'DELETE') {
        msg.textContent = t('errErase', state.lang); msg.className = 'error'; return;
      }
      state = emptyState(); selectedTripId = null; save(); renderAll();
      document.getElementById('erase-confirm').value = '';
      msg.textContent = t('eraseOk', state.lang); msg.className = 'ok';
    });
    renderAll();
  }

  var api = {
    I18N: I18N, EXPENSE_CATS: EXPENSE_CATS, PACKING_CATS: PACKING_CATS,
    t: t, fill: fill, toBnDigits: toBnDigits, esc: esc,
    isValidDateStr: isValidDateStr, parseDate: parseDate, dayDiff: dayDiff,
    daysInclusive: daysInclusive, daysUntil: daysUntil, tripStatus: tripStatus,
    tripDayCount: tripDayCount, dateForDay: dateForDay, dayForDate: dayForDate,
    toPaisa: toPaisa, fromPaisa: fromPaisa, formatMoney: formatMoney,
    formatPct: formatPct, fmtNum: fmtNum,
    tripTotals: tripTotals, packingProgress: packingProgress,
    dashboardStats: dashboardStats,
    validateTrip: validateTrip, validateExpense: validateExpense,
    validateItineraryItem: validateItineraryItem, validatePackingItem: validatePackingItem,
    validateImport: validateImport, newId: newId, emptyState: emptyState
  };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  root.TravelPlanner = api;
  if (typeof document !== 'undefined') {
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
    else init();
  }
})(typeof window !== 'undefined' ? window : globalThis);
