// Shared animation magnitude tokens, kept dependency-free (zero imports) so timeline.js,
// scheme-kit.js and the four category kits can all read one source of truth without an import cycle.

// Pod pulse: a stroke ramp plus a brightness flash, half the ms up and half down, tinted per kit.
// `dimPeak` is how bright a DIM pod gets at the top of its blink: a MAGNITUDE, so not in OPACITY.
export const PULSE_POD = Object.freeze({ ms: 900, bright: 1.4, dimPeak: 0.8 });

// Block flash: a single brightness flash for value chips on packet-less steps, via
// flashChips, and by the Timeline auto-pulse on a fresh highlight. 600ms, ease-out.
export const PULSE_BLOCK = Object.freeze({ ms: 600, bright: 1.55, easing: 'ease-out' });

// Fade-phase vocabulary: one shade per lifecycle phase, catalog-wide, so a card writes a bare 0 or
// 1 and takes every shade between from here. A LANE has no phase of its own: ../../CANON.md A-13.
export const OPACITY = Object.freeze({
  running: 1,          // in focus and working
  pending: 0.55,       // declared, not working yet
  notready: 0.4,       // alive but not serving, not observed, or outside this path
  terminating: 0.25,   // deletionTimestamp set, eviction or shutdown under way
  terminated: 0.12,    // gone from the API, or finished
});

// Pod fade vocabulary: a pod materialises over `in` ms (ease-out) and dissolves over `out`
// (ease-in). A narrative-slow fade keeps an explicit duration plus a justification at the call.
export const FADE = Object.freeze({ in: 600, out: 700 });

// Choreography gaps: `afterPulse` after a pod blink, `afterHop` between an arrival and the next
// send, `lead` before a self-initiated packet. AN ADDED HOP COSTS ~800ms, so `duration` must rise.
export const BEAT = Object.freeze({ afterPulse: 800, afterHop: 100, lead: 800 });
