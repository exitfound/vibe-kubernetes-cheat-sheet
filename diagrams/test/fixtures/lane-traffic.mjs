// The A-02 and A-05 walk, shared by the report and ../unit/lane-shared.test.mjs so both read one catalogue.
// Blind to lanes drawn inside part.raw. OTHER-PART and ASSEMBLED are decided by coordinates, not identity.

import { carriedMap } from './carried.mjs';
import { pathRuns, walkParts } from './spec.mjs';

export const DRAWN_KINDS = new Set(['lane', 'arrow', 'relation']);
export const LANE_KIND = 'lane';
export const EPS = 0.5;
// The walk baseline is derived by each reader, never typed here.

const pad = (n) => String(n).padStart(4);
export const key = (pts) => JSON.stringify(pts);
const cardsOf = (rows) => new Set(rows.map(r => r.card)).size;

export const segsOf = (pts) => { const o = []; for (let i = 1; i < pts.length; i++) o.push([pts[i - 1], pts[i]]); return o; };
const dist = (a, b) => Math.hypot(b[0] - a[0], b[1] - a[1]);
const cross = (a, b, c) => (b[0] - a[0]) * (c[1] - a[1]) - (b[1] - a[1]) * (c[0] - a[0]);

// Covered by the union of collinear pool segments, projected onto seg, clipped to [0,1] and merged.
export function covered(seg, pool) {
  const [a, b] = seg;
  const L = dist(a, b);
  if (L === 0) return true;
  const tol = EPS / L;
  const spans = [];
  for (const [c, d] of pool) {
    if (Math.abs(cross(a, b, c)) / L > EPS || Math.abs(cross(a, b, d)) / L > EPS) continue;
    const at = (p) => ((p[0] - a[0]) * (b[0] - a[0]) + (p[1] - a[1]) * (b[1] - a[1])) / (L * L);
    let [t0, t1] = [at(c), at(d)];
    if (t0 > t1) [t0, t1] = [t1, t0];
    t0 = Math.max(0, t0);
    t1 = Math.min(1, t1);
    if (t1 > t0) spans.push([t0, t1]);
  }
  spans.sort((x, y) => x[0] - y[0]);
  let reach = 0;
  for (const [t0, t1] of spans) {
    if (t0 > reach + tol) break;
    if (t1 > reach) reach = t1;
  }
  return reach >= 1 - tol;
}

// `d` strings are read by `pathRuns` in ./spec.mjs.

// A `d` with several M commands draws several runs (a spine plus its taps).
function runsOf(part) {
  const p = part.p || {};
  if (Array.isArray(p.points)) return [p.points];
  if (p.from && p.to) return [[p.from, p.to]];
  if (p.x1 !== undefined) return [[[p.x1, p.y1], [p.x2, p.y2]]];
  if (p.d !== undefined) return pathRuns(p.d);
  return [];
}

export function readCard(ns) {
  const lanes = [];        // the A-02 reference set and the A-05 population
  const drawn = [];        // every run of every drawn kind, for the geometry tier
  const runs = [];         // the same runs unbroken, for the whole-path comparisons
  let raws = 0, tunes = 0, unreadableD = 0;
  walkParts(ns.SCENE.parts, (part, at) => {
    if (!part) return;
    const { kind, p = {} } = part;
    if (kind === 'raw') raws++;
    if (typeof p.tune === 'function') tunes++;
    if (!DRAWN_KINDS.has(kind)) return;
    const mine = runsOf(part);
    if (!mine.length) { unreadableD++; return; }
    for (const pts of mine) {
      drawn.push(...segsOf(pts));
      runs.push({ kind, pts });
      if (kind === LANE_KIND) lanes.push({ pts, name: part.key || at });
    }
  });
  const routes = [], segments = [];
  for (const s of ns.STEPS_SPEC || []) {
    for (const e of s.flow || []) {
      if (e.verb === 'route' && Array.isArray(e.p.points)) routes.push({ step: s.id, pts: e.p.points });
      // The original point objects are kept: building a fresh array would destroy the identity compared.
      else if (e.verb === 'segment' && e.p.from && e.p.to) segments.push({ step: s.id, pts: [e.p.from, e.p.to], ends: [e.p.from, e.p.to] });
    }
  }
  return { lanes, drawn, runs, routes, segments, raws, tunes, unreadableD };
}

// Ordered and first match wins, so tiers are exclusive and sum.
export function tierOf(pts, { lanes, drawn, runs }) {
  if (lanes.some(l => l.pts === pts)) return 'SHARED';
  if (lanes.some(l => key(l.pts) === key(pts))) return 'COPIED';
  if (runs.some(r => r.kind !== LANE_KIND && key(r.pts) === key(pts))) return 'OTHER-PART';
  return geometryTier(pts, drawn);
}

// Identity lives on the two endpoint objects, and it is asked of every drawn kind, mostly `arrow`.
export function segTierOf(ends, { drawn, runs }) {
  const pts = [ends[0], ends[1]];
  if (runs.some(r => r.pts.length === 2 && r.pts[0] === ends[0] && r.pts[1] === ends[1])) return 'SHARED';
  if (runs.some(r => key(r.pts) === key(pts))) return 'COPIED';
  return geometryTier(pts, drawn);
}

function geometryTier(pts, drawn) {
  const segs = segsOf(pts);
  const on = segs.filter(sg => covered(sg, drawn)).length;
  if (on === segs.length) return 'ASSEMBLED';
  return on ? 'PARTIAL' : 'UNDRAWN';
}

// Carried A-05 rulings, stored in ./carried.mjs. The gate and the report read the same Map.
export const A05_CARRIED = carriedMap('A-05');

export const TIERS = ['SHARED', 'COPIED', 'OTHER-PART', 'ASSEMBLED', 'PARTIAL', 'UNDRAWN'];
