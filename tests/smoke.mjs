/* Headless-Chrome smoke test via raw CDP over file:// URLs.
   (Chrome 152 blocks CDP-driven navigation to http://127.0.0.1 in this VM.)
   Run: node tests/smoke.mjs */
import { spawn } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const DIR = path.dirname(fileURLToPath(import.meta.url)) + '/..';
let pass = 0, fail = 0;
function check(name, cond, extra) {
  if (cond) pass++;
  else { fail++; console.log('FAIL:', name, extra === undefined ? '' : String(extra).slice(0, 500)); }
}

// Start chrome with remote debugging
const chrome = spawn('/opt/meta-chromium/chrome', [
  '--headless=new', '--no-sandbox', '--disable-gpu',
  '--remote-debugging-port=9331', '--no-proxy-server', 'about:blank',
], { stdio: 'ignore' });
await new Promise(r => setTimeout(r, 2500));

// Use websocket via /json/list + raw WS using built-in? Node has no WS client built-in; use DevTools HTTP endpoints + Runtime via websocket from 'ws' if present.
let WS = globalThis.WebSocket;
if (!WS) { console.log('no WebSocket client available'); process.exit(1); }

const targets = await (await fetch('http://127.0.0.1:9331/json/list')).json();
const page = targets.find(t => t.type === 'page');
const ws = new WS(page.webSocketDebuggerUrl);
await new Promise((res, rej) => { ws.addEventListener('open', res); ws.addEventListener('error', rej); });
let seq = 0;
const pending = new Map();
ws.addEventListener('message', (ev) => {
  const msg = JSON.parse(ev.data.toString());
  if (msg.id && pending.has(msg.id)) {
    const { resolve } = pending.get(msg.id);
    pending.delete(msg.id);
    resolve(msg);
  }
});
function send(method, params = {}) {
  const id = ++seq;
  return new Promise((resolve) => {
    pending.set(id, { resolve });
    ws.send(JSON.stringify({ id, method, params }));
  });
}
const errors = [];
await send('Runtime.enable');
await send('Page.enable');
ws.addEventListener('message', (ev) => {
  const msg = JSON.parse(ev.data.toString());
  if (msg.method === 'Runtime.exceptionThrown') errors.push(JSON.stringify(msg.params.exceptionDetails).slice(0, 300));
  if (msg.method === 'Runtime.consoleAPICalled' && msg.params.type === 'error') errors.push('console.error: ' + JSON.stringify(msg.params.args).slice(0, 300));
});
async function ev(expr) {
  const r = await send('Runtime.evaluate', { expression: expr, returnByValue: true });
  if (r.result?.result?.subtype === 'error') return 'EVAL_ERROR: ' + (r.result.result.description || '');
  return r.result?.result?.value;
}
async function click(sel) {
  await ev(`(()=>{const el=document.querySelector(${JSON.stringify(sel)}); if(!el) return 'missing'; el.click(); return 'clicked';})()`);
}
async function type(sel, value) {
  await ev(`(()=>{const el=document.querySelector(${JSON.stringify(sel)}); if(!el) return 'missing'; el.focus(); el.value=${JSON.stringify(value)}; el.dispatchEvent(new Event('input',{bubbles:true})); el.dispatchEvent(new Event('change',{bubbles:true})); return 'typed';})()`);
}

const BASE = `file://${DIR}/index.html?asof=2026-10-14`;
await send('Page.navigate', { url: BASE });
await new Promise(r => setTimeout(r, 1500));

check('title renders', (await ev(`document.title`)) === 'Travel Planner BD');
check('h1 renders', (await ev(`document.querySelector('h1').textContent`)) === 'Travel Planner BD');
check('3 tabs present', (await ev(`document.querySelectorAll('.tab-btn').length`)) === 3);
check('empty dashboard shows 0 trips', (await ev(`document.getElementById('stat-total').textContent`)) === '0');
check('no console errors on load', errors.length === 0, errors.join(' | '));

// Validation: empty trip submit
await click('#trip-form button[type=submit]');
await new Promise(r => setTimeout(r, 300));
check('empty trip shows inline error', (await ev(`document.getElementById('trip-error').textContent.length`)) > 0);
check('still 0 trips after invalid submit', (await ev(`document.getElementById('stat-total').textContent`)) === '0');

// Add trip: Cox's Bazar 2026-12-20 -> 2026-12-23, budget 20000
await click('.tab-btn[data-tab="trips"]');
await type('#trip-name', "Cox Trip");
await type('#trip-dest', "Cox's Bazar");
await type('#trip-start', '2026-12-20');
await type('#trip-end', '2026-12-23');
await type('#trip-budget', '20000');
await click('#trip-form button[type=submit]');
await new Promise(r => setTimeout(r, 500));
check('trip added, dashboard total 1', (await ev(`document.getElementById('stat-total').textContent`)) === '1');
check('upcoming = 1', (await ev(`document.getElementById('stat-upcoming').textContent`)) === '1');
check('total budget ৳20,000.00', (await ev(`document.getElementById('stat-budget').textContent`)) === '৳20,000.00');
check('next trip shows Cox Trip', (await ev(`document.getElementById('next-trip').textContent`)).includes('Cox Trip'));
check('countdown 67 days', (await ev(`document.getElementById('next-trip').textContent`)).includes('in 67 day(s)'));
check('trip chip present', (await ev(`document.querySelectorAll('.trip-chip').length`)) === 1);
check('detail shows budget', (await ev(`document.getElementById('trip-detail').textContent`)).includes('৳20,000.00'));

// Add itinerary item Day 1 09:30 Beach
await type('#itin-title', 'Beach sunrise');
await type('#itin-time', '09:30');
await click('#itin-form button[type=submit]');
await new Promise(r => setTimeout(r, 400));
check('itinerary item renders', (await ev(`document.getElementById('trip-detail').textContent`)).includes('Beach sunrise'));

// Add expense Food 3000 on 2026-12-20
await type('#exp-date', '2026-12-20');
await ev(`document.getElementById('exp-cat').value='Food'`);
await type('#exp-amount', '3000');
await click('#exp-form button[type=submit]');
await new Promise(r => setTimeout(r, 400));
check('expense updates spent', (await ev(`document.getElementById('stat-spent').textContent`)) === '৳3,000.00');
check('detail shows Food 3000', (await ev(`document.getElementById('trip-detail').textContent`)).includes('৳3,000.00'));
check('remaining 17000 shown', (await ev(`document.getElementById('trip-detail').textContent`)).includes('৳17,000.00'));

// Add packing item + toggle packed
await type('#pack-name', 'Sunscreen');
await click('#pack-form button[type=submit]');
await new Promise(r => setTimeout(r, 400));
check('packing item renders', (await ev(`document.getElementById('trip-detail').textContent`)).includes('Sunscreen'));
check('packed 0% initially', (await ev(`document.getElementById('trip-detail').textContent`)).includes('0% packed'));
await click('.pack-toggle');
await new Promise(r => setTimeout(r, 400));
check('packed 100% after toggle', (await ev(`document.getElementById('trip-detail').textContent`)).includes('100% packed'));

// Invalid expense: negative amount
await type('#exp-amount', '-5');
await click('#exp-form button[type=submit]');
await new Promise(r => setTimeout(r, 300));
check('negative expense rejected inline', (await ev(`document.getElementById('exp-error').textContent.length`)) > 0);
check('spent unchanged after bad expense', (await ev(`document.getElementById('stat-spent').textContent`)) === '৳3,000.00');

// BN toggle
await click('#lang-toggle');
await new Promise(r => setTimeout(r, 500));
check('BN toggle renders Bengali title', (await ev(`document.querySelector('h1').textContent`)) === 'ট্রাভেল প্ল্যানার বিডি');
check('BN digits in budget stat', (await ev(`document.getElementById('stat-budget').textContent`)) === '৳২০,০০০.০০');
check('BN countdown renders Bengali digits', (await ev(`document.getElementById('next-trip').textContent`)).includes('৬৭ দিন বাকি'));
await click('#lang-toggle');
await new Promise(r => setTimeout(r, 400));
check('back to EN', (await ev(`document.querySelector('h1').textContent`)) === 'Travel Planner BD');

// Reload persistence
await send('Page.reload');
await new Promise(r => setTimeout(r, 1500));
check('trip persists after reload', (await ev(`document.getElementById('stat-total').textContent`)) === '1');
check('expense persists after reload', (await ev(`document.getElementById('stat-spent').textContent`)) === '৳3,000.00');

// Export/import round-trip via Data tab: erase with wrong confirm, then typed DELETE
await click('.tab-btn[data-tab="data"]');
await type('#erase-confirm', 'delete');
await click('#erase-btn');
await new Promise(r => setTimeout(r, 300));
check('lowercase delete rejected', (await ev(`document.getElementById('data-msg').textContent.length`)) > 0);
check('data intact after bad erase', (await ev(`document.getElementById('stat-total').textContent`)) === '1');
// malformed import rejected
await type('#import-text', '{not json');
await click('#import-btn');
await new Promise(r => setTimeout(r, 300));
check('malformed import rejected', (await ev(`document.getElementById('data-msg').textContent.length`)) > 0);
check('data intact after bad import', (await ev(`document.getElementById('stat-total').textContent`)) === '1');
// typed DELETE erase-all
await type('#erase-confirm', 'DELETE');
await click('#erase-btn');
await new Promise(r => setTimeout(r, 400));
check('erase-all clears trips', (await ev(`document.getElementById('stat-total').textContent`)) === '0');
check('erase-all clears spent', (await ev(`document.getElementById('stat-spent').textContent`)) === '৳0.00');

// 390px mobile: no horizontal overflow
await send('Emulation.setDeviceMetricsOverride', { width: 390, height: 844, deviceScaleFactor: 1, mobile: true });
await send('Page.navigate', { url: BASE });
await new Promise(r => setTimeout(r, 1500));
check('390px no horizontal overflow', (await ev(`document.documentElement.scrollWidth <= 390`)) === true);

// Zero network requests check (app makes no fetch/XHR): only http(s) resource entries count
const netReqs = await ev(`performance.getEntriesByType('resource').map(e=>e.name).filter(n=>n.startsWith('http')).length`);
check('zero external network requests', netReqs === 0, netReqs);

check('zero console/page errors overall', errors.length === 0, errors.join(' | '));

console.log(pass + '/' + (pass + fail) + ' smoke checks passed');
ws.close();
chrome.kill();
process.exit(fail ? 1 : 0);
