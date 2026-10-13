/*
 * ============================================================
 *  WEDDING CONFIGURATION  -  the one place to edit everything
 * ============================================================
 *  - Dates are written as YYYY-MM-DD.
 *  - Every exact moment (countdownAt, startsAt, endsAt) carries the
 *    Pakistan Standard Time offset +05:00, so the countdown is correct
 *    on any device, in any timezone.
 *  - Leave a value as null when it has not been confirmed. The site will
 *    show "To be announced" instead of inventing anything.
 *
 *  countdownAt   The moment the countdown counts toward.
 *  countdownBasis
 *      'start' = a confirmed event time
 *      'departure' = the Baarat departure time, not its ceremony start
 *      'day'   = no confirmed start time yet, so we count to 12:00 AM
 *                (midnight) at the start of that day, Pakistan time.
 *                The page says this openly and never shows it as a
 *                ceremony time.
 *  startsAt      Confirmed event time. Only set when it is really known.
 *  calendarAt    A confirmed calendar time that is not an event start,
 *                such as the Baarat departure time.
 *  endsAt        When the event is considered over (used by the calendar
 *                logic and for documentation; not shown to guests).
 *
 *  When you learn the Mehndi time, set: time: '7:00 PM',
 *  countdownAt: '2026-10-29T19:00:00+05:00', countdownBasis: 'start',
 *  startsAt: '2026-10-29T19:00:00+05:00'  (use your real time).
 */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.WEDDING_CONFIG = factory();
})(typeof self !== 'undefined' ? self : this, function () {
  return {
    timezone: 'Asia/Karachi',
    pageTitle: 'Obaid & Samra | Wedding Invitation',
    shortNames: 'Obaid & Samra',

    couple: {
      groom: 'Obaid Ur Rehman',
      bride: 'Samra Younas'
    },

    dateRangeLabel: '29 — 31 October 2026',
    dateRangeCompact: '29–31 October 2026',

    hero: {
      bismillah: 'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ',
      lead: 'Together with their families',
      sub: 'Joyfully invite you to celebrate their wedding'
    },

    countdown: {
      heading: 'Counting Down to Our Celebrations',
      finishedMessage: 'Three beautiful days, countless precious memories. Thank you for celebrating with us.'
    },

    coupleSection: {
      heading: 'A Beautiful New Beginning',
      body: 'With grateful hearts and the blessings of our families, we look forward to beginning a beautiful new chapter together. Your presence, prayers, and good wishes will make these special moments even more meaningful.'
    },

    eventsSection: {
      heading: 'Our Wedding Celebrations',
      lead: 'Three days of love, blessings, and togetherness.'
    },

    venuesSection: {
      heading: 'Find Your Way',
      lead: 'We look forward to celebrating these special moments with you.'
    },

    invitation: {
      heading: 'Your Presence Is Our Greatest Gift',
      paragraphs: [
        'With the blessings of Allah and the love and support of our families, we warmly invite you to join us as we celebrate the wedding of Obaid Ur Rehman and Samra Younas.',
        'Your presence, duas, and good wishes will make these special moments even more memorable.',
        'We look forward to celebrating together.'
      ]
    },

    final: {
      heading: 'With Love & Gratitude',
      closing: 'Looking forward to celebrating with you.',
      calendarButton: 'Save the Wedding Dates'
    },

    events: [
      {
        id: 'mehndi',
        name: 'Mehndi',
        date: '2026-10-29',
        accent: 'white',
        motif: 'floral',
        timeLabel: 'Timing',
        time: null,                      // not confirmed
        venueName: null,                 // not confirmed
        address: null,
        countdownLabel: 'Mehndi',
        countdownAt: '2026-10-29T00:00:00+05:00',
        countdownBasis: 'day',
        startsAt: null,
        endsAt: '2026-10-30T00:00:00+05:00'
      },
      {
        id: 'baarat',
        name: 'Baarat',
        date: '2026-10-30',
        accent: 'champagne',
        motif: 'arch',
        timeLabel: 'Departure',          // 11:00 AM is not the ceremony start
        time: '11:00 AM',
        venueName: 'Al-Rehman Marque',
        address: 'Faisalabad Road, Chiniot, Pakistan',
        countdownAt: '2026-10-30T11:00:00+05:00',
        countdownBasis: 'departure',
        countdownLabel: 'Baarat Departure',
        calendarAt: '2026-10-30T11:00:00+05:00',
        startsAt: null,                  // ceremony start time not confirmed
        endsAt: '2026-10-31T00:00:00+05:00'
      },
      {
        id: 'walima',
        name: 'Walima',
        date: '2026-10-31',
        accent: 'champagne',
        motif: 'sprig',
        timeLabel: 'Time',
        time: '2:00 PM',
        venueName: 'Rajpoot Marriage Hall',
        address: 'Sargodha Road, Chiniot, Pakistan',
        countdownAt: '2026-10-31T14:00:00+05:00',
        countdownBasis: 'start',
        startsAt: '2026-10-31T14:00:00+05:00',
        countdownLabel: 'Walima',
        endsAt: '2026-11-01T00:00:00+05:00'
      }
    ]
  };
});
