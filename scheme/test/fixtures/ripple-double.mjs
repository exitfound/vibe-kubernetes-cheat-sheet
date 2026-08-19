// ripple-double.mjs: the walk behind "how many rings land on one arrival", lifted out of
// report/ripple-double.test.mjs on 2026-08-17 when its SIMULTANEOUS queue reached zero and the check
// was promoted.
//
// WHY A FIXTURE. ../unit/ripple-single.test.mjs now asks the same question as a VERDICT while the
// report keeps printing all three tiers. Two copies of "where and when does a ring start" would let
// the gate and the report describe different catalogues while both stayed green, and a test file
// cannot import another test file without registering its tests twice.
//
// RIPPLE_MS IS A SECOND COPY OF A NUMBER THE KIT DOES NOT EXPORT, and that is deliberate and
// asserted: a stale window would silently stop catching pairs. See the report file's header.

export const RIPPLE_MS = 560;

// topPacket's own defaults, for the one verb whose path is not written out in the entry.
export const TOP_DEFAULT = { to: 580, y: 65 };

// What the walk measured the day this file was written. Printed beside the live numbers, never
// asserted: a repair is SUPPOSED to move them.
const RECORDED = { rings: 718, 'F.ripple': 4, SIMULTANEOUS: 4, STAGGERED: 7, NEAR: 0 };

// -------------------------------------------------------------------------------------------
// Findings a human has READ and decided to carry, keyed `<card id> <step id> <x>,<y>`, with the
// reason on each. EMPTY ON PURPOSE, and that is the statement this table makes: not one of the four
// has been read by a person yet, so everything outside the table is work by definition. Same shape
// and same discipline as R2_STEP_CARRIED in ./arrival.test.mjs.
// -------------------------------------------------------------------------------------------
export const RIPPLE_CARRIED = new Map([]);


const pad = (n) => String(n).padStart(4);
export const at = (pt) => `${pt[0]},${pt[1]}`;

// Where one flow entry leaves a ring, or null when it leaves none. The three ball verbs each get one
// with no opt-in, because packetAlong calls arrivalRipple on every launch (M-14), and F.ripple is a
// direct call to the same function. pulse, set, light, run, fade, reveal, anim and tag ring nothing.
export function ringOf(row) {
  const { verb, p, delay, arrival } = row;
  if (verb === 'route') return Array.isArray(p.points) && p.points.length ? { src: 'route', pt: p.points[p.points.length - 1], t: arrival } : null;
  if (verb === 'segment') return p.to ? { src: 'segment', pt: p.to, t: arrival } : null;
  if (verb === 'top') return { src: 'top', pt: [p.to === undefined ? TOP_DEFAULT.to : p.to, p.y === undefined ? TOP_DEFAULT.y : p.y], t: arrival };
  // The verb rings where it is told, and its own delay IS the moment: it lands nothing itself.
  if (verb === 'ripple') return p.point ? { src: 'F.ripple', pt: p.point, t: delay } : null;
  return null;
}
