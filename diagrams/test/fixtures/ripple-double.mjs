// Where and when each ring starts, shared by the report and the ripple-single verdict so both read
// one catalogue. RIPPLE_MS is a copy of a number the kit does not export, asserted in the report.

import { carriedMap } from './carried.mjs';

export const RIPPLE_MS = 560;

export const TOP_DEFAULT = { to: 580, y: 65 };

// Printed beside the live numbers, never asserted: a repair is supposed to move them.
const RECORDED = { rings: 718, 'F.ripple': 4, SIMULTANEOUS: 4, STAGGERED: 7, NEAR: 0 };

// Carried SIMULTANEOUS rulings, stored in ./carried.mjs. Empty.
export const RIPPLE_CARRIED = carriedMap('SIMULTANEOUS');

const pad = (n) => String(n).padStart(4);
export const at = (pt) => `${pt[0]},${pt[1]}`;

// Where one flow entry leaves a ring, or null. Ball verbs ring on landing (M-14), F.ripple at its
// own delay, every other verb rings nothing.
export function ringOf(row) {
  const { verb, p, delay, arrival } = row;
  if (verb === 'route') return Array.isArray(p.points) && p.points.length ? { src: 'route', pt: p.points[p.points.length - 1], t: arrival } : null;
  if (verb === 'segment') return p.to ? { src: 'segment', pt: p.to, t: arrival } : null;
  if (verb === 'top') return { src: 'top', pt: [p.to === undefined ? TOP_DEFAULT.to : p.to, p.y === undefined ? TOP_DEFAULT.y : p.y], t: arrival };
  if (verb === 'ripple') return p.point ? { src: 'F.ripple', pt: p.point, t: delay } : null;
  return null;
}
