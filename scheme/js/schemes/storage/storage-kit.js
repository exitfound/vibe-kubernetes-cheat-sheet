export {
  valChip, setVal, setChip, setBoxLabel, setBoxSublabel, makeInit, packetAlong,
  routePacket, segmentPacket, routeDur, routeLength, packetArrival,
  topPacket, setConnectorDir, clearPodHighlight,
  diagramRoot, wrapPod, arrivalRipple, clearHighlights, clearWires, setWire, flashChips, lightBoxAt, at, makeRidingLabel,
  relationPath, revealAt, laneOf, REVEAL_MS,
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

// `base` must be the exact resting stroke and `bright` the tint-bright stop, for the reason under
// WORKLOADS_TINT: the non-persist pulse fills forwards to `base`.
export const STORAGE_TINT = Object.freeze({ base: 'rgb(94, 202, 148)', bright: 'rgb(174, 224, 199)' });


// The cylinder is the storage family's own block (the backing disk / PV). No other
// kit touches it, so its label setter lives here rather than in scheme-kit.
export function setCylinderLabel(cylEl, txt) {
  const l = cylEl && cylEl.querySelector('.scheme-cylinder-label');
  if (l) l.textContent = txt;
}

export const { pulsePod, pulsePodDim } = makeTintedPulses(STORAGE_TINT);

// The category's X grammar, measured over the 31 cards. Storage centres on a spine and hangs a
// chip strip under it, so what is shared is a CENTRE and the strip's scalars.
export const STO = Object.freeze({
  CX: 600,                    // 22 of the 23 cards naming a centre-X, and 30 of the 31 chip strips
  // CHIP_H 34 on 27 of 31, CHIP_GAP 16 on 18 of the 25 naming it, CHIP_W 232 on 12, 4 chips on 22.
  CHIP_H: 34, CHIP_GAP: 16, CHIP_W: 232, CHIP_COUNT: 4,
});

// Fix the width AND the gap, derive the span, centre it: 23 cards hand-roll exactly this, and
// strip() fixes the gap while spread() fixes the width, both spanning an exact from..to instead.
export const chipStrip = ({ cx = STO.CX, w = STO.CHIP_W, gap = STO.CHIP_GAP, count = STO.CHIP_COUNT } = {}) => {
  const x0 = cx - (w * count + gap * (count - 1)) / 2;
  return { w, gap, x: (i) => x0 + i * (w + gap) };
};

// All 600 role literals in this folder are 'storage', its 26 Pods included, so no recolour.
// The default tag that rides a ball (M-30). Other timings: own makeRidingLabel, passed as F.tag fn.
const ridingLabel = makeRidingLabel({ role: 'storage' });

const BIND = { role: 'storage', podRole: 'storage', tint: null, pulsePod, pulsePodDim, ridingLabel };
export const P = makePartKinds(BIND);
export const F = makeFlowKinds(BIND);
export const defineCard = defineCardWith(BIND);
