// Design notes: scheme/docs/INTERNALS.md#schemejslibtokensjs

// `dimPeak` is how bright a DIM pod gets at the top of its blink. It is a pulse magnitude,
// not a phase, which is why it lives here and not in OPACITY: a pod at OPACITY.pending that
// blinks is still pending, the blink only has to be visible against its resting shade.
export const PULSE_POD = Object.freeze({ ms: 900, bright: 1.4, dimPeak: 0.8 });

// Block flash: a single brightness flash for value chips on packet-less steps, via
// flashChips, and by the Timeline auto-pulse on a fresh highlight. 600ms, ease-out.
export const PULSE_BLOCK = Object.freeze({ ms: 600, bright: 1.55, easing: 'ease-out' });

// Fade-phase vocabulary: one shade per lifecycle phase, catalog-wide. A card writes a bare
// 0 or 1 (an element is drawn or it is not) and takes every shade in between from here, so a
// reader who learns a shade on one card reads it correctly on the next.
export const OPACITY = Object.freeze({
  running: 1,          // in focus and working
  pending: 0.55,       // declared, not working yet
  notready: 0.4,       // alive but not serving, not observed, or outside this path
  terminating: 0.25,   // deletionTimestamp set, eviction or shutdown under way
  terminated: 0.12,    // gone from the API, or finished
});

export const FADE = Object.freeze({ in: 600, out: 700 });

export const BEAT = Object.freeze({ afterPulse: 800, afterHop: 100, lead: 800 });
