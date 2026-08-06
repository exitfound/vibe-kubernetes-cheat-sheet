export {
  valChip, setVal, setChip, setBoxLabel, setBoxSublabel, makeInit, packetAlong,
  routePacket, segmentPacket, routeDur, routeLength, packetArrival,
  topPacket, setConnectorDir, clearPodHighlight,
  diagramRoot, wrapPod, arrivalRipple, clearHighlights, clearWires, setWire, flashChips, lightBoxAt, at, makeRidingLabel,
  relationPath, revealAt, laneOf, REVEAL_MS,
  setPodSublabel, FADE, BEAT, OPACITY,
} from '../../lib/scheme-kit.js';
import { makeTintedPulses } from '../../lib/scheme-kit.js';
// Design notes: scheme/INTERNALS.md#schemejsschemesstoragestorage-kitjs

export const STORAGE_TINT = Object.freeze({ base: 'rgb(94, 202, 148)', bright: 'rgb(174, 224, 199)' });


// The cylinder is the storage family's own block (the backing disk / PV). No other
// kit touches it, so its label setter lives here rather than in scheme-kit.
export function setCylinderLabel(cylEl, txt) {
  const l = cylEl && cylEl.querySelector('.scheme-cylinder-label');
  if (l) l.textContent = txt;
}

export const { pulsePod, pulsePodDim } = makeTintedPulses(STORAGE_TINT);
