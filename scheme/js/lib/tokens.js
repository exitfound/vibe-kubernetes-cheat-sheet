// Design notes: scheme/docs/INTERNALS.md#schemejslibtokensjs

export const PULSE_POD = Object.freeze({ ms: 900, bright: 1.4 });

// Block flash: a single brightness flash for value chips on packet-less steps, via
// flashChips, and by the Timeline auto-pulse on a fresh highlight. 600ms, ease-out.
export const PULSE_BLOCK = Object.freeze({ ms: 600, bright: 1.55, easing: 'ease-out' });

// Opacity vocabulary for pod/block states so "dim" reads the same across cards.
// `dim` mirrors the CSS .scheme-dim (0.35).
export const OPACITY = Object.freeze({
  full: 1, partial: 0.8, booting: 0.55, idle: 0.4, dim: 0.35, terminal: 0.3,
});

export const FADE = Object.freeze({ in: 600, out: 700 });

export const BEAT = Object.freeze({ afterPulse: 800, afterHop: 100, lead: 800 });
