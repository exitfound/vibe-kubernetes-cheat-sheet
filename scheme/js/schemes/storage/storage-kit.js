// The card-facing API: a name is here because a card imports it. What only lib/ calls (the
// builders scene-spec.js and step-spec.js run) stays in lib/ and is not re-exported.
export {
  setVal, setBoxLabel, routeDur, packetArrival,
  // flashChips: no card imports it, S-25 keeps the one sanctioned block flash on the surface.
  flashChips, makeRidingLabel, relationPath, laneOf, REVEAL_MS,
  setPodSublabel, FADE, BEAT, OPACITY,
} from '../../lib/scheme-kit.js';

// The derived half of a card header, as formulas (lib/layout.js).
export { LANE_DY, laneY, ladder, strip, spread, midX, shade } from '../../lib/layout.js';
import { makeTintedPulses, makeRidingLabel } from '../../lib/scheme-kit.js';
import { makePartKinds, POD_VIOLET } from '../../lib/scene-spec.js';
import { makeFlowKinds, defineCardWith } from '../../lib/step-spec.js';
export { POD_VIOLET };
// Per-category wrapper over scheme-kit for the Storage cards. The storage-specific pieces are the
// jade pod tint, its two pulse wrappers and setCylinderLabel.

export const STORAGE_TINT = Object.freeze({ bright: 'rgb(174, 224, 199)' });


// The cylinder (backing disk or PV) is storage's own block, so its label setter lives here.
export function setCylinderLabel(cylEl, txt) {
  const l = cylEl && cylEl.querySelector('.scheme-cylinder-label');
  if (l) l.textContent = txt;
}

export const { pulsePod, pulsePodDim } = makeTintedPulses(STORAGE_TINT);

// The category's chip grammar: a shared centre and the scalars of the chip strip under the drawing.
export const STO = Object.freeze({
  CX: 600,
  CHIP_H: 34, CHIP_GAP: 16, CHIP_W: 232, CHIP_COUNT: 4,
});

// Fixes the width AND the gap and centres the derived span. strip() and spread() instead span an
// exact from..to, fixing only the gap or only the width.
export const chipStrip = ({ cx = STO.CX, w = STO.CHIP_W, gap = STO.CHIP_GAP, count = STO.CHIP_COUNT } = {}) => {
  const x0 = cx - (w * count + gap * (count - 1)) / 2;
  return { w, gap, x: (i) => x0 + i * (w + gap) };
};

// The default tag that rides a ball (M-30), living exactly as long as its ball (M-30a).
const ridingLabel = makeRidingLabel({ role: 'storage' });

const BIND = { role: 'storage', podRole: 'storage', tint: null, pulsePod, pulsePodDim, ridingLabel };
export const P = makePartKinds(BIND);
export const F = makeFlowKinds(BIND);
export const defineCard = defineCardWith(BIND);
