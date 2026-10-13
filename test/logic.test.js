// Run with:  node test/logic.test.js
// Works the same in any machine timezone (try: TZ=America/New_York node test/logic.test.js)
const assert = require('assert');
const cfg = require('../public/js/config.js');
const L = require('../public/js/logic.js');

const at = (iso) => Date.parse(iso);
let passed = 0;
const test = (name, fn) => { fn(); passed++; console.log('  ok  ' + name); };

console.log('Timezone of this machine:', Intl.DateTimeFormat().resolvedOptions().timeZone);

test('weekdays agree with dates', () => {
  assert.strictEqual(L.formatDate('2026-10-29').long, 'Thursday, 29 October 2026');
  assert.strictEqual(L.formatDate('2026-10-30').long, 'Friday, 30 October 2026');
  assert.strictEqual(L.formatDate('2026-10-31').long, 'Saturday, 31 October 2026');
});

test('config events are in the right order with the right details', () => {
  const [m, b, w] = cfg.events;
  assert.deepStrictEqual([m.name, b.name, w.name], ['Mehndi', 'Baarat', 'Walima']);
  assert.strictEqual(m.venueName, null);
  assert.strictEqual(m.time, null);
  assert.strictEqual(b.timeLabel, 'Departure');
  assert.strictEqual(b.time, '11:00 AM');
  assert.strictEqual(b.countdownAt, '2026-10-30T11:00:00+05:00');
  assert.strictEqual(b.countdownBasis, 'departure');
  assert.strictEqual(b.calendarAt, '2026-10-30T11:00:00+05:00');
  assert.strictEqual(b.startsAt, null);                 // departure is never treated as ceremony start
  assert.strictEqual(w.time, '2:00 PM');
  assert.strictEqual(w.startsAt, '2026-10-31T14:00:00+05:00');
  assert.strictEqual(b.venueName, 'Al-Rehman Marque');
  assert.strictEqual(w.venueName, 'Rajpoot Marriage Hall');
});

test('before the wedding: counts down to the Mehndi day (14 Oct, midnight PKT -> exactly 15 days)', () => {
  const s = L.getCountdownState(cfg.events, at('2026-10-14T00:00:00+05:00'));
  assert.strictEqual(s.status, 'counting');
  assert.strictEqual(s.event.id, 'mehndi');
  assert.deepStrictEqual(s.parts, { days: 15, hours: 0, minutes: 0, seconds: 0 });
});

test('one second before the Mehndi day starts', () => {
  const s = L.getCountdownState(cfg.events, at('2026-10-28T23:59:59+05:00'));
  assert.strictEqual(s.event.id, 'mehndi');
  assert.deepStrictEqual(s.parts, { days: 0, hours: 0, minutes: 0, seconds: 1 });
});

test('moves on to the Baarat once the Mehndi day has begun', () => {
  const s = L.getCountdownState(cfg.events, at('2026-10-29T10:00:00+05:00'));
  assert.strictEqual(s.event.id, 'baarat');
  assert.deepStrictEqual(s.parts, { days: 1, hours: 1, minutes: 0, seconds: 0 });
});

test('Baarat countdown reaches departure at 11:00 AM PKT', () => {
  const s = L.getCountdownState(cfg.events, at('2026-10-30T10:59:59+05:00'));
  assert.strictEqual(s.event.id, 'baarat');
  assert.deepStrictEqual(s.parts, { days: 0, hours: 0, minutes: 0, seconds: 1 });
});

test('moves on to the Walima (2:00 PM) after the Baarat day begins', () => {
  const s = L.getCountdownState(cfg.events, at('2026-10-30T12:00:00+05:00'));
  assert.strictEqual(s.event.id, 'walima');
  assert.deepStrictEqual(s.parts, { days: 1, hours: 2, minutes: 0, seconds: 0 });
});

test('after the Walima start: finished message state, never negative', () => {
  assert.strictEqual(L.getCountdownState(cfg.events, at('2026-10-31T14:00:00+05:00')).status, 'finished');
  assert.strictEqual(L.getCountdownState(cfg.events, at('2027-01-01T00:00:00+05:00')).status, 'finished');
  assert.strictEqual(cfg.countdown.finishedMessage, 'Three beautiful days, countless precious memories. Thank you for celebrating with us.');
});

test('result is identical regardless of how the instant is written (timezone safe)', () => {
  const a = L.getCountdownState(cfg.events, at('2026-10-20T12:00:00+05:00'));
  const b = L.getCountdownState(cfg.events, at('2026-10-20T07:00:00Z'));
  const c = L.getCountdownState(cfg.events, at('2026-10-20T03:00:00-04:00'));
  assert.deepStrictEqual(a.parts, b.parts);
  assert.deepStrictEqual(a.parts, c.parts);
});

test('all parts are non-negative integers across a sweep of times', () => {
  for (let t = at('2026-10-01T00:00:00+05:00'); t < at('2026-11-03T00:00:00+05:00'); t += 3600 * 1000 + 17000) {
    const s = L.getCountdownState(cfg.events, t);
    if (s.status === 'counting') {
      Object.values(s.parts).forEach((v) => assert.ok(Number.isInteger(v) && v >= 0));
      assert.ok(s.parts.hours < 24 && s.parts.minutes < 60 && s.parts.seconds < 60);
    }
  }
});

test('maps links use a search query for the venue and address', () => {
  assert.strictEqual(
    L.mapsUrl('Al-Rehman Marque', 'Faisalabad Road, Chiniot, Pakistan'),
    'https://www.google.com/maps/search/?api=1&query=Al-Rehman%20Marque%2C%20Faisalabad%20Road%2C%20Chiniot%2C%20Pakistan'
  );
});

test('calendar file is valid and contains only confirmed details', () => {
  const ics = L.buildIcs(cfg, at('2026-10-14T00:00:00+05:00'));
  assert.ok(ics.startsWith('BEGIN:VCALENDAR\r\n') && ics.endsWith('END:VCALENDAR\r\n'));
  assert.strictEqual((ics.match(/BEGIN:VEVENT/g) || []).length, 3);
  assert.strictEqual((ics.match(/END:VEVENT/g) || []).length, 3);
  assert.ok(!/[^\r]\n/.test(ics), 'every line break must be CRLF');
  ics.split('\r\n').forEach((l) => assert.ok(l.length <= 75, 'line too long: ' + l));
  assert.ok(ics.includes('DTSTART;VALUE=DATE:20261029'));      // Mehndi: all-day
  assert.ok(ics.includes('DTSTART:20261030T060000Z'));         // Baarat departure: 11:00 AM PKT
  assert.ok(!ics.includes('DTSTART;VALUE=DATE:20261030'));
  assert.ok(ics.includes('DTSTART:20261031T090000Z'));         // Walima: 2:00 PM PKT = 09:00 UTC
  assert.ok(ics.includes('Departure: 11:00 AM'));
  const mehndi = ics.split('BEGIN:VEVENT')[1];
  assert.ok(!mehndi.includes('LOCATION'), 'Mehndi must have no invented venue');
  assert.ok(mehndi.includes('Venue details to be announced'));
});

console.log('\n' + passed + ' tests passed');
