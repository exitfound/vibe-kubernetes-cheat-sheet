// The card-facing API: a name is here because a card imports it. What only lib/ calls (the
// builders scene-spec.js and step-spec.js run) stays in lib/ and is not re-exported.
export {
  setVal, setBoxLabel, routeDur, packetArrival,
  // flashChips is the one name here no card imports: it is the only sanctioned block flash and
  // S-25 keeps it on the surface, so it stayed when the other unimported re-exports went.
  flashChips, makeRidingLabel, relationPath, laneOf, REVEAL_MS,
  setPodSublabel, FADE, BEAT, OPACITY,
} from '../../lib/scheme-kit.js';

// The derived half of a card header, as formulas (lib/layout.js). A SECOND source, so these six
// are own to the kit rather than part of the shared scheme-kit list, and S-21 stays one line.
export { laneY, ladder, strip, spread, midX, shade } from '../../lib/layout.js';
import { makeTintedPulses, makeRidingLabel } from '../../lib/scheme-kit.js';
import { makePartKinds, POD_VIOLET } from '../../lib/scene-spec.js';
import { makeFlowKinds, defineCardWith } from '../../lib/step-spec.js';
export { POD_VIOLET };
// Per-category wrapper over scheme-kit for the Storage cards. The storage-specific pieces are the
// jade pod tint, its two pulse wrappers and setCylinderLabel.

// `bright` is the tint-bright stop the pulse peaks on, for the reason under WORKLOADS_TINT.
export const STORAGE_TINT = Object.freeze({ bright: 'rgb(174, 224, 199)' });


// The cylinder is the storage family's own block (the backing disk / PV). No other
// kit touches it, so its label setter lives here rather than in scheme-kit.
export function setCylinderLabel(cylEl, txt) {
  const l = cylEl && cylEl.querySelector('.scheme-cylinder-label');
  if (l) l.textContent = txt;
}

export const { pulsePod, pulsePodDim } = makeTintedPulses(STORAGE_TINT);

// The category's chip grammar, measured over the 37 cards. What they share is a CENTRE and the
// scalars of the chip strip hung under the drawing.
export const STO = Object.freeze({
  CX: 600,                    // all 19 cards naming a centre-X, and 28 of the 34 chip strips
  // CHIP_H 34 on 30 of 34 strips, a 16 gap on 25, one width of 232 on 16, 4 chips on 24.
  CHIP_H: 34, CHIP_GAP: 16, CHIP_W: 232, CHIP_COUNT: 4,
});

// Fix the width AND the gap, derive the span, centre it: 17 cards call this, and strip() fixes
// the gap while spread() fixes the width, both spanning an exact from..to instead.
export const chipStrip = ({ cx = STO.CX, w = STO.CHIP_W, gap = STO.CHIP_GAP, count = STO.CHIP_COUNT } = {}) => {
  const x0 = cx - (w * count + gap * (count - 1)) / 2;
  return { w, gap, x: (i) => x0 + i * (w + gap) };
};

// Every role literal in this folder is 'storage', so no recolour: 38 are makeRidingLabel calls a
// card makes past this binding, and one is the bare podShell of storage-fsgroup-ownership.
// The default tag that rides a ball (M-30). Other timings: own makeRidingLabel, passed as F.tag fn.
const ridingLabel = makeRidingLabel({ role: 'storage' });

const BIND = { role: 'storage', podRole: 'storage', tint: null, pulsePod, pulsePodDim, ridingLabel };
export const P = makePartKinds(BIND);
export const F = makeFlowKinds(BIND);
export const defineCard = defineCardWith(BIND);
