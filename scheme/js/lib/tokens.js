// tokens.js — shared animation magnitude tokens.
//
// Kept dependency-free (zero imports) so timeline.js, scheme-kit.js and
// control-kit.js can all read one source of truth without an import cycle.

// Pod pulse: stroke ramp (1.2->2.4 width, base->bright tint) + a brightness flash,
// the richer two-part highlight used for pods and their container boxes.
// 900ms total (450 up + 450 down). Tint colour is supplied per card family.
export const PULSE_POD = Object.freeze({ ms: 900, bright: 1.4 });

// Block flash: a single brightness flash for value chips on packet-less steps, via
// flashChips, and by the Timeline auto-pulse on a fresh highlight. 600ms, ease-out.
export const PULSE_BLOCK = Object.freeze({ ms: 600, bright: 1.55, easing: 'ease-out' });

// Opacity vocabulary for pod/block states so "dim" reads the same across cards.
// `dim` mirrors the CSS .scheme-dim (0.35).
export const OPACITY = Object.freeze({
  full: 1, partial: 0.8, booting: 0.55, idle: 0.4, dim: 0.35, terminal: 0.3,
});

// Pod fade vocabulary: a pod materializes over `in` ms (ease-out) and dissolves
// over `out` ms (ease-in). Cards that need a narrative-slow fade keep an explicit
// duration with a one-line justification next to the call.
export const FADE = Object.freeze({ in: 600, out: 700 });

// Choreography beats. `afterPulse` is the up-arrow gap: the pod blinks first and
// the packet departs once the blink has mostly landed (PULSE_POD is 900ms).
// `afterHop` is the down-arrow gap between a top-row hop arriving at a block and
// that block emitting the next packet. `lead` is the gap before a controller
// self-initiates a command packet down the connector with no preceding hop or
// pulse, so the lit source block registers before the ball leaves.
export const BEAT = Object.freeze({ afterPulse: 800, afterHop: 100, lead: 800 });
