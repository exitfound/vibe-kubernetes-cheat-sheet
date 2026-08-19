// lane-traffic.mjs: the A-02 and A-05 walk, lifted out of report/lane-traffic.test.mjs on
// 2026-08-17 when the COPIED queue reached zero and the check was promoted.
//
// WHY A FIXTURE. Two readers now ask the same question for opposite purposes: the report prints
// every tier and the carried rulings, and ../unit/lane-shared.test.mjs asserts the two tiers whose
// queues are empty. A second copy of "what tier is this route" would let the gate and the report
// describe two different catalogues while both stayed green, which is the drift ../fixtures/spec.mjs
// was written against. A test file cannot import another test file either: that would register its
// tests a second time.
//
// WHAT IT IS BLIND TO, inherited and deliberate:
//   - A LANE DRAWN INSIDE AN ESCAPE. `part.raw` hands the layer a function, so a path built there is
//     invisible to a reader of parts-as-data. The three UNDRAWN routes on network-model are exactly
//     that, and the report prints the escape count beside them for the reader to weigh.
//   - COORDINATES, not identity, decide OTHER-PART and ASSEMBLED: a route equal to an arrow, or
//     covered by the union of several collinear drawn legs, is not something A-02 can ask to share.

import { pathRuns, walkParts } from './spec.mjs';

export const DRAWN_KINDS = new Set(['lane', 'arrow', 'relation']);
export const LANE_KIND = 'lane';
export const EPS = 0.5;
// The walk baseline is derived by each reader, never typed here: see CATALOG_BASELINE in
// ./catalog.mjs.

const pad = (n) => String(n).padStart(4);
export const key = (pts) => JSON.stringify(pts);
const cardsOf = (rows) => new Set(rows.map(r => r.card)).size;

// ---- geometry, and it is all of it ----------------------------------------------------------
export const segsOf = (pts) => { const o = []; for (let i = 1; i < pts.length; i++) o.push([pts[i - 1], pts[i]]); return o; };
const dist = (a, b) => Math.hypot(b[0] - a[0], b[1] - a[1]);
const cross = (a, b, c) => (b[0] - a[0]) * (c[1] - a[1]) - (b[1] - a[1]) * (c[0] - a[0]);

// Is `seg` covered end to end by the UNION of the pool segments collinear with it. Everything is
// projected onto seg's own parameter, clipped to [0,1] and merged, so ink from three different parts
// covers a leg that no single one of them does: see the header for why the union is not optional.
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

// A `d` string of absolute M/L commands, which is every `d` in the catalog (5 relation parts carry
// one). The reader is `pathRuns` in ./spec.mjs, shared with unit/spec-scene.test.mjs: this file
// carried a second one that disagreed with it about a path opening on `L`.

// The point runs one part draws, as arrays. A part draws more than one when its `d` carries several
// M commands, which is how a spine plus its taps is one element.
function runsOf(part) {
  const p = part.p || {};
  if (Array.isArray(p.points)) return [p.points];
  if (p.from && p.to) return [[p.from, p.to]];
  if (p.x1 !== undefined) return [[[p.x1, p.y1], [p.x2, p.y2]]];
  if (p.d !== undefined) return pathRuns(p.d);
  return [];
}

// Everything one card draws and everything one card sends down a wire, in one pass.
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
      // `from` and `to` are the two point objects the entry was handed, kept as such: a segment
      // sharing them with an arrow part is the segment form of SHARED, and building a fresh
      // [from, to] array first would destroy the only identity there is to compare.
      else if (e.verb === 'segment' && e.p.from && e.p.to) segments.push({ step: s.id, pts: [e.p.from, e.p.to], ends: [e.p.from, e.p.to] });
    }
  }
  return { lanes, drawn, runs, routes, segments, raws, tunes, unreadableD };
}

// Which of the six tiers one ROUTE falls in, against one card. Ordered, and the first match wins,
// so the tiers are mutually exclusive and can be summed.
export function tierOf(pts, { lanes, drawn, runs }) {
  if (lanes.some(l => l.pts === pts)) return 'SHARED';
  if (lanes.some(l => key(l.pts) === key(pts))) return 'COPIED';
  if (runs.some(r => r.kind !== LANE_KIND && key(r.pts) === key(pts))) return 'OTHER-PART';
  return geometryTier(pts, drawn);
}

// The same tiers for an F.segment, and the top two have to be asked differently: the entry carries
// two POINT objects rather than one array, so identity lives on the endpoints. It is also asked
// against every drawn kind rather than against lanes alone, because a two-point hop is drawn by an
// `arrow` far more often than by a `lane`.
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

export const A05_CARRIED = new Map([
  ['storage-volume-mode [[690,375],[690,442]]',
    'W_BLK_STAGE, and the record answers this with a NO: block mode has NO staging step, no mkfs and ' +
    'no mount, which is the entire contrast the card is built on, so the lane exists to be visibly ' +
    'empty beside the fs branch that uses its twin. Measured 2026-08-17: a dim storage lane renders ' +
    'at stroke-opacity 1 WITH a marker while .scheme-arrow-relation pins 0.45 and drops it, so either ' +
    'repair sinks ONE lane of a mirrored pair on a card whose whole claim is that the two columns are ' +
    'identical and only the field differs. The ruling was in storage/CARDS.md as NOT A DEFECT before ' +
    'this table existed and was simply never imported into it.'],
  ['network-ebpf-dataplane [[660,312],[790,312],[790,442],[920,442]]',
    'TO_PODY, the ALTERNATIVE backend of the map lookup. network/CARDS.md under this card: "TO_PODY ' +
    'carries no ball. It is the ALTERNATIVE backend, drawn so the reader can see the map lookup ' +
    'picked one of two, and the card says so in words. N destinations, N wires." NET.A-03.'],
  ['network-headless-service [[290,485],[355,485],[355,520],[820,520],[820,472],[880,472]]',
    'TO_W2, the third leg of the data fan. network/CARDS.md: "TO_W2 in the data fan rides nothing. ' +
    'N destinations get N wires so the reader can see the client picked one of three." NET.A-03, ' +
    'and the record two cards down names this one as the precedent for the nodeport fan.'],
  ['network-nodeport-loadbalancer [[600,230],[600,320]]',
    'TO_N2. network/CARDS.md: "TO_N2 and TO_N3 carry no ball on a given step. A NodePort opens the ' +
    'SAME port on EVERY Node, which is the card whole first claim, so all three lanes have to exist ' +
    'for the reader to see that any Node would have served the request." NET.A-03.'],
  ['network-nodeport-loadbalancer [[600,230],[600,286],[970,286],[970,320]]',
    'TO_N3, the other half of the same pair and the same record entry. Which of the three legs a ' +
    'step takes is the arbitrary part, and drawing only the taken one would make the arbitrary look ' +
    'like the only. NET.A-03.'],
  ['network-traffic-distribution [[630,320],[700,320],[700,236],[820,236]]',
    'FAN_A2. network/CARDS.md: "FAN_A2 carries no ball on its step. It is the endpoint the traffic ' +
    'distribution did NOT pick, and the point of the card is that the choice was made among the ' +
    'drawn candidates rather than forced." NET.A-03.'],
  ['network-model [[990,172],[990,280]]',
    'CNI_CONNECTOR, and this one is NOT a fan leg. network/CARDS.md: "CNI_CONNECTOR IS animated, ' +
    'with the repeating MARCH dash offset rather than a ball: this card vocabulary for this is what ' +
    'implements the model. No packet rides it because nothing DISCRETE travels, the plugin is not ' +
    'sending a message, it is the thing that makes the flat space exist." An F.anim on the dash ' +
    'offset is motion this file does not read as traffic, and should not.'],
  ['storage-reclaim-policy [[712,336],[712,390]]',
    'W_RET_WIPE, and the card says so at the declaration: "drawn, never travelled: that is Retain". ' +
    'The whole subject of the card is that the Retain column HAS the lane the Delete column uses and ' +
    'never sends anything down it, so removing the arrowhead would remove the comparison.'],
  ['storage-volume-detach-on-node-loss [[578,282],[578,260],[496,260],[496,208]]',
    'W_ATTACH_A, and the record answers this exact question with a NO: "W_ATTACH_A is reported as a ' +
    'lane nobody rides, and converting it to a relationPath is DECLINED: sinking one half of a ' +
    'deliberately symmetric pair makes the left lane the lesser arrow, which is the thing this card ' +
    'goes out of its way not to do." The card says which half is live through OPACITY instead.'],
]);

export const TIERS = ['SHARED', 'COPIED', 'OTHER-PART', 'ASSEMBLED', 'PARTIAL', 'UNDRAWN'];
