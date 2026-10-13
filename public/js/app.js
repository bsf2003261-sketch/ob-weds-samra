/*
 * Renders the invitation from WEDDING_CONFIG.
 * Each function below is a small reusable component: Hero, Countdown, Couple,
 * EventCard, Events, VenueBlock, Venues, Invitation, Final, Footer.
 */
(function () {
  'use strict';

  var C = window.WEDDING_CONFIG;
  var L = window.WeddingLogic;
  var SVG_NS = 'http://www.w3.org/2000/svg';

  // ---------- tiny DOM helpers (text is always inserted safely) ----------
  function h(tag, attrs, kids) {
    var el = document.createElement(tag);
    attrs = attrs || {};
    Object.keys(attrs).forEach(function (k) {
      var v = attrs[k];
      if (v === null || v === undefined || v === false) return;
      if (k === 'class') el.className = v;
      else if (k === 'text') el.textContent = v;
      else el.setAttribute(k, v === true ? '' : v);
    });
    (kids || []).forEach(function (kid) {
      if (kid === null || kid === undefined) return;
      el.appendChild(typeof kid === 'string' ? document.createTextNode(kid) : kid);
    });
    return el;
  }

  function art(id, cls, viewBox) {
    var svg = document.createElementNS(SVG_NS, 'svg');
    svg.setAttribute('class', 'art ' + (cls || ''));
    svg.setAttribute('viewBox', viewBox);
    svg.setAttribute('aria-hidden', 'true');
    svg.setAttribute('focusable', 'false');
    var use = document.createElementNS(SVG_NS, 'use');
    use.setAttribute('href', '#' + id);
    svg.appendChild(use);
    return svg;
  }

  function heading(level, text, cls) {
    return h('div', { class: 'heading reveal' }, [
      art('sprig', 'heading__sprig', '0 0 72 28'),
      h('h' + level, { class: cls || 'h2', text: text }),
      art('sprig', 'heading__sprig heading__sprig--flip', '0 0 72 28')
    ]);
  }

  function rule() { return art('rule', 'rule', '0 0 200 20'); }

  // ---------- components ----------
  function Hero() {
    return h('section', { class: 'hero', id: 'top', 'aria-labelledby': 'couple-names' }, [
      art('arch', 'hero__arch', '0 -10 320 480'),
      h('div', { class: 'hero__inner' }, [
        h('p', { class: 'hero__bismillah fade fade-1', lang: 'ar', dir: 'rtl', text: C.hero.bismillah }),
        h('p', { class: 'hero__lead fade fade-2', text: C.hero.lead }),
        h('h1', { class: 'names fade fade-3', id: 'couple-names' }, [
          h('span', { class: 'names__name', text: C.couple.groom }),
          h('span', { class: 'names__amp', 'aria-hidden': 'true', text: '&' }),
          h('span', { class: 'sr-only', text: 'and' }),
          h('span', { class: 'names__name', text: C.couple.bride })
        ]),
        h('p', { class: 'hero__sub fade fade-4', text: C.hero.sub }),
        h('div', { class: 'fade fade-5' }, [rule()]),
        h('p', { class: 'hero__dates fade fade-5', text: C.dateRangeLabel })
      ]),
      h('a', { class: 'scroll-cue fade fade-6', href: '#countdown', 'aria-label': 'Scroll down to the countdown' }, [
        h('span', { class: 'scroll-cue__line' })
      ])
    ]);
  }

  function Countdown() {
    var units = [['days', 'Days'], ['hours', 'Hours'], ['minutes', 'Minutes'], ['seconds', 'Seconds']];
    var unitEls = {};

    var grid = h('div', { class: 'countdown__grid', role: 'timer', 'aria-live': 'off' },
      units.map(function (u) {
        var num = h('span', { class: 'countdown__num', text: '00' });
        unitEls[u[0]] = num;
        return h('div', { class: 'countdown__unit' }, [num, h('span', { class: 'countdown__label', text: u[1] })]);
      })
    );

    var nextLine = h('p', { class: 'countdown__next' });
    var note = h('p', { class: 'countdown__note' });
    var finished = h('p', { class: 'countdown__finished', text: C.countdown.finishedMessage, hidden: true });
    var summary = h('p', { class: 'sr-only', 'aria-live': 'polite' });
    var timer = null;

    var section = h('section', { class: 'section countdown', id: 'countdown', 'aria-labelledby': 'countdown-title' }, [
      heading(2, C.countdown.heading).cloneNode(true),
      nextLine, grid, note, finished, summary
    ]);
    section.querySelector('h2').id = 'countdown-title';

    function pad(n) { return (n < 10 ? '0' : '') + n; }
    function unitText(n, unit) { return n + ' ' + unit + (n === 1 ? '' : 's'); }
    var lastSummaryMinute = -1;

    function stopTimer() {
      if (timer !== null) {
        clearInterval(timer);
        timer = null;
      }
    }

    function startTimer() {
      if (timer !== null || document.hidden) return;
      timer = setInterval(function () {
        if (!tick()) stopTimer();
      }, 1000);
    }

    function tick() {
      var s = L.getCountdownState(C.events, Date.now());

      if (s.status === 'finished') {
        grid.hidden = true; nextLine.hidden = true; note.hidden = true; finished.hidden = false;
        summary.textContent = C.countdown.finishedMessage;
        return false;
      }

      grid.hidden = false; nextLine.hidden = false; finished.hidden = true;
      var ev = s.event, d = L.formatDate(ev.date);
      var countdownLabel = ev.countdownLabel || ev.name;
      nextLine.textContent = '';
      nextLine.appendChild(document.createTextNode('Next celebration: '));
      nextLine.appendChild(h('strong', { text: countdownLabel }));
      nextLine.appendChild(document.createTextNode(' · ' + d.weekday + ', ' + d.text));

      unitEls.days.textContent = pad(s.parts.days);
      unitEls.hours.textContent = pad(s.parts.hours);
      unitEls.minutes.textContent = pad(s.parts.minutes);
      unitEls.seconds.textContent = pad(s.parts.seconds);

      if (ev.countdownBasis === 'day') {
        note.hidden = false;
        note.textContent = 'Counting to midnight at the start of this day in Pakistan Standard Time as a fallback. The Mehndi time is not confirmed.';
      } else if (ev.countdownBasis === 'departure') {
        note.hidden = false;
        note.textContent = 'Counting to the Baarat departure at ' + ev.time + ' Pakistan Standard Time. This is not the ceremony start.';
      } else {
        note.hidden = false;
        note.textContent = 'Counting to the Walima at ' + ev.time + ' Pakistan Standard Time.';
      }

      // keep screen-reader announcements calm: update once a minute
      var minuteKey = s.parts.days * 1440 + s.parts.hours * 60 + s.parts.minutes;
      if (minuteKey !== lastSummaryMinute) {
        lastSummaryMinute = minuteKey;
        summary.textContent = unitText(s.parts.days, 'day') + ', ' + unitText(s.parts.hours, 'hour') +
          ' and ' + unitText(s.parts.minutes, 'minute') + ' until ' + countdownLabel + '.';
      }
      return true;
    }

    if (tick()) startTimer();
    document.addEventListener('visibilitychange', function () {
      stopTimer();
      if (!document.hidden && tick()) startTimer();
    });
    window.addEventListener('pagehide', stopTimer);
    window.addEventListener('pageshow', function () {
      stopTimer();
      if (!document.hidden && tick()) startTimer();
    });
    return section;
  }

  function Couple() {
    return h('section', { class: 'section couple', id: 'couple', 'aria-labelledby': 'couple-title' }, [
      h('div', { class: 'couple__art reveal' }, [art('arch', 'couple__arch', '0 -10 320 480')]),
      h('div', { class: 'couple__text' }, [
        (function () { var el = heading(2, C.coupleSection.heading); el.querySelector('h2').id = 'couple-title'; return el; })(),
        h('p', { class: 'couple__names reveal', text: C.couple.groom + ' & ' + C.couple.bride }),
        rule(),
        h('p', { class: 'prose reveal', text: C.coupleSection.body })
      ])
    ]);
  }

  function EventCard(ev, index) {
    var d = L.formatDate(ev.date);
    var venue = ev.venueName
      ? [h('span', { class: 'event__venue-name', text: ev.venueName }),
         ev.address ? h('span', { class: 'event__venue-address', text: ev.address }) : null]
      : [h('span', { class: 'event__tba', text: 'To be announced' })];

    var timeValue = ev.time
      ? [h('time', { datetime: ev.calendarAt || ev.startsAt || ev.countdownAt, text: ev.time })]
      : [h('span', { class: 'event__tba', text: 'To be announced' })];
    var facts = !ev.time && !ev.venueName
      ? h('p', { class: 'event__tba event__tba--combined', text: 'Venue and timing to be announced.' })
      : h('dl', { class: 'event__facts' }, [
          h('div', {}, [h('dt', { text: ev.timeLabel || 'Time' }), h('dd', {}, timeValue)]),
          h('div', {}, [h('dt', { text: 'Venue' }), h('dd', {}, venue)])
        ]);

    var motif = ev.motif === 'arch'
      ? art('arch', 'event__motif event__motif--arch', '0 -10 320 480')
      : ev.motif === 'floral'
        ? art('corner', 'event__motif event__motif--floral', '0 0 220 220')
        : art('sprig', 'event__motif event__motif--sprig', '0 0 72 28');

    return h('article', { class: 'event event--' + ev.accent + ' reveal', 'aria-labelledby': 'event-' + ev.id }, [
      motif,
      h('p', { class: 'event__index', text: '0' + (index + 1) }),
      h('h3', { class: 'event__name', id: 'event-' + ev.id, text: ev.name }),
      rule(),
      h('p', { class: 'event__weekday', text: d.weekday }),
      h('time', { class: 'event__date', datetime: ev.date, text: d.text }),
      facts
    ]);
  }

  function Events() {
    return h('section', { class: 'section events', id: 'events', 'aria-labelledby': 'events-title' }, [
      (function () { var el = heading(2, C.eventsSection.heading); el.querySelector('h2').id = 'events-title'; return el; })(),
      h('p', { class: 'section__lead events__lead', text: C.eventsSection.lead }),
      h('div', { class: 'events__grid' }, C.events.map(EventCard))
    ]);
  }

  function VenueBlock(ev) {
    var url = L.mapsUrl(ev.venueName, ev.address);
    var buttonText = ev.id === 'baarat' ? 'Get Baarat Directions' : 'Get Walima Directions';
    return h('article', { class: 'venue reveal' }, [
      h('p', { class: 'venue__event', text: ev.name + ' Venue' }),
      h('h3', { class: 'venue__name', text: ev.venueName }),
      h('p', { class: 'venue__address', text: ev.address }),
      h('a', {
        class: 'btn', href: url, target: '_blank', rel: 'noopener noreferrer',
        'aria-label': buttonText + ' to ' + ev.venueName + ' on Google Maps (opens in a new tab)'
      }, [buttonText])
    ]);
  }

  function Venues() {
    var confirmed = C.events.filter(function (e) { return e.venueName; });
    var pending = C.events.filter(function (e) { return !e.venueName; });

    var kids = [
      (function () { var el = heading(2, C.venuesSection.heading); el.querySelector('h2').id = 'venues-title'; return el; })(),
      h('p', { class: 'section__lead venues__lead', text: C.venuesSection.lead }),
      h('div', { class: 'venues__grid' }, confirmed.map(VenueBlock))
    ];

    pending.forEach(function (ev) {
      kids.push(h('p', { class: 'venues__pending reveal' }, [
        h('strong', { text: ev.name }),
        ' venue: to be announced.'
      ]));
    });
    return h('section', { class: 'section venues', id: 'venues', 'aria-labelledby': 'venues-title' }, kids);
  }

  function Invitation() {
    var box = h('div', { class: 'invite__box reveal' }, [
      art('corner', 'invite__corner invite__corner--tl', '0 0 220 220'),
      art('corner', 'invite__corner invite__corner--br', '0 0 220 220'),
      h('h2', { class: 'h2', id: 'invitation-title', text: C.invitation.heading }),
      rule()
    ].concat(C.invitation.paragraphs.map(function (p) { return h('p', { class: 'prose', text: p }); })));

    return h('section', { class: 'section invite', id: 'invitation', 'aria-labelledby': 'invitation-title' }, [box]);
  }

  function Final() {
    var status = h('p', { class: 'final__status', role: 'status' });
    var btn = h('button', { class: 'btn btn--solid', type: 'button', text: C.final.calendarButton });

    btn.addEventListener('click', function () {
      try {
        var ics = L.buildIcs(C, Date.now());
        var blob = new Blob([ics], { type: 'text/calendar;charset=utf-8' });
        var url = URL.createObjectURL(blob);
        var a = document.createElement('a');
        a.href = url; a.download = 'Obaid-and-Samra-Wedding.ics';
        document.body.appendChild(a); a.click(); a.remove();
        setTimeout(function () { URL.revokeObjectURL(url); }, 4000);
        status.textContent = 'Calendar file prepared. Open the downloaded file to add the dates to your calendar.';
      } catch (e) {
        status.textContent = 'Sorry, the calendar file could not be created on this device.';
      }
    });

    return h('section', { class: 'section final', id: 'final', 'aria-labelledby': 'final-title' }, [
      art('sprig', 'final__sprig reveal', '0 0 72 28'),
      h('h2', { class: 'h2 reveal', id: 'final-title', text: C.final.heading }),
      h('p', { class: 'final__names reveal', text: C.couple.groom + ' & ' + C.couple.bride }),
      h('p', { class: 'final__dates reveal', text: C.dateRangeLabel }),
      rule(),
      h('p', { class: 'prose reveal', text: C.final.closing }),
      h('div', { class: 'reveal' }, [btn]),
      status
    ]);
  }

  function Footer() {
    return h('footer', { class: 'footer' }, [
      h('p', { text: C.couple.groom + ' & ' + C.couple.bride }),
      h('p', { text: C.dateRangeCompact })
    ]);
  }

  // ---------- mount ----------
  var app = document.getElementById('app');
  app.textContent = '';
  [Hero(), Countdown(), Couple(), Events(), Venues(), Invitation(), Final()].forEach(function (n) { app.appendChild(n); });
  document.body.appendChild(Footer());
  document.title = C.pageTitle;

  // ---------- gentle reveal on scroll ----------
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var items = document.querySelectorAll('.reveal');
  if (reduce || !('IntersectionObserver' in window)) {
    items.forEach(function (el) { el.classList.add('in'); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); }
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -6% 0px' });
    items.forEach(function (el) { io.observe(el); });
  }

  // ---------- discreet nav: appears after the hero ----------
  var nav = document.getElementById('nav');
  var hero = document.getElementById('top');
  function onScroll() {
    var past = window.scrollY > hero.offsetHeight * 0.6;
    nav.classList.toggle('nav--show', past);
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
})();
