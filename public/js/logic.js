/*
 * Pure helper functions (no DOM). Shared by the page and by the tests.
 */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.WeddingLogic = factory();
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  var WEEKDAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  var MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July',
    'August', 'September', 'October', 'November', 'December'];

  /** '2026-10-29' -> { weekday:'Thursday', day:29, month:'October', year:2026, text:'29 October 2026' }
   *  Calculated from the calendar date itself, so it never shifts with the device's timezone. */
  function formatDate(dateStr) {
    var p = String(dateStr).split('-');
    var y = Number(p[0]), m = Number(p[1]), d = Number(p[2]);
    var wd = new Date(Date.UTC(y, m - 1, d)).getUTCDay();
    return {
      weekday: WEEKDAYS[wd],
      day: d,
      month: MONTHS[m - 1],
      year: y,
      text: d + ' ' + MONTHS[m - 1] + ' ' + y,
      long: WEEKDAYS[wd] + ', ' + d + ' ' + MONTHS[m - 1] + ' ' + y
    };
  }

  /** Which event is the countdown pointing at, and how much time is left?
   *  Picks the first event whose countdown moment is still in the future, so it moves on to
   *  the next event automatically. Never returns negative numbers. */
  function getCountdownState(events, nowMs) {
    var upcoming = events
      .map(function (e) { return { e: e, t: Date.parse(e.countdownAt) }; })
      .filter(function (x) { return !isNaN(x.t) && x.t > nowMs; })
      .sort(function (a, b) { return a.t - b.t; });

    if (!upcoming.length) return { status: 'finished' };

    var total = Math.max(0, Math.floor((upcoming[0].t - nowMs) / 1000));
    return {
      status: 'counting',
      event: upcoming[0].e,
      parts: {
        days: Math.floor(total / 86400),
        hours: Math.floor((total % 86400) / 3600),
        minutes: Math.floor((total % 3600) / 60),
        seconds: total % 60
      }
    };
  }

  function mapsUrl(venueName, address) {
    var q = [venueName, address].filter(Boolean).join(', ');
    return 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent(q);
  }

  // ---------- Calendar (.ics) ----------
  function icsEscape(s) {
    return String(s).replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\r?\n/g, '\\n');
  }
  function fold(line) {
    var out = [];
    while (line.length > 72) { out.push(line.slice(0, 72)); line = ' ' + line.slice(72); }
    out.push(line);
    return out.join('\r\n');
  }
  function pad(n) { return (n < 10 ? '0' : '') + n; }
  function icsDate(dateStr) { return dateStr.replace(/-/g, ''); }
  function nextDay(dateStr) {
    var p = dateStr.split('-');
    var d = new Date(Date.UTC(Number(p[0]), Number(p[1]) - 1, Number(p[2]) + 1));
    return d.getUTCFullYear() + pad(d.getUTCMonth() + 1) + pad(d.getUTCDate());
  }
  function icsUtc(ms) {
    var d = new Date(ms);
    return d.getUTCFullYear() + pad(d.getUTCMonth() + 1) + pad(d.getUTCDate()) + 'T' +
      pad(d.getUTCHours()) + pad(d.getUTCMinutes()) + pad(d.getUTCSeconds()) + 'Z';
  }

  /** Builds a valid iCalendar file with ONLY confirmed details:
   *  - An event with a confirmed start time becomes a timed event (no invented end time).
   *  - Otherwise it becomes an all-day event on its date.
   *  - Unknown venues are simply left out. */
  function buildIcs(cfg, nowMs) {
    var lines = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//Obaid and Samra Wedding//Invitation//EN',
      'CALSCALE:GREGORIAN',
      'METHOD:PUBLISH'
    ];
    var stamp = icsUtc(nowMs);

    cfg.events.forEach(function (ev) {
      var desc = [];
      var calendarStart = ev.startsAt || ev.calendarAt;
      if (ev.time && ev.timeLabel) desc.push(ev.timeLabel + ': ' + ev.time);
      if (!ev.venueName) desc.push('Venue details to be announced.');
      if (!ev.time) desc.push('Time to be announced.');

      lines.push('BEGIN:VEVENT');
      lines.push('UID:' + ev.id + '-' + icsDate(ev.date) + '@obaid-samra-wedding');
      lines.push('DTSTAMP:' + stamp);
      if (calendarStart) {
        lines.push('DTSTART:' + icsUtc(Date.parse(calendarStart)));
      } else {
        lines.push('DTSTART;VALUE=DATE:' + icsDate(ev.date));
        lines.push('DTEND;VALUE=DATE:' + nextDay(ev.date));
      }
      lines.push('SUMMARY:' + icsEscape(ev.name + ' - ' + cfg.shortNames + ' Wedding'));
      if (ev.venueName) {
        lines.push('LOCATION:' + icsEscape([ev.venueName, ev.address].filter(Boolean).join(', ')));
      }
      if (desc.length) lines.push('DESCRIPTION:' + icsEscape(desc.join('\n')));
      lines.push('END:VEVENT');
    });

    lines.push('END:VCALENDAR');
    return lines.map(fold).join('\r\n') + '\r\n';
  }

  return {
    formatDate: formatDate,
    getCountdownState: getCountdownState,
    mapsUrl: mapsUrl,
    buildIcs: buildIcs
  };
});
