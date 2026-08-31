// frame-face.test.mjs: WL.A-03, where a lane coming DOWN from the actor row into a Node band is
// allowed to stop. Read off the SPEC, so it needs no browser.
//
// ===========================================================================================
// WHY THIS FILE HAD TO BE WRITTEN, AND WHY NO EXISTING CHECK COULD HAVE CAUGHT IT
// ===========================================================================================
// The rule is that such a lane ends on the FRAME FACE MIDPOINT and never on a Pod inside the
// frame: an endpoint on the Pod makes the lane pierce the frame it crosses, which draws the
// Kubelet reaching THROUGH the Node rather than acting on it.
//
// Two rules in the L block look like they already ask this and neither does:
//
//   L-10 (THROUGH)  no segment crosses a block it does not terminate on. A `node` is deliberately
//                   NOT in the block set: ../unit/spec-scene.test.mjs states the reason in its own
//                   scoping comment, "lanes are supposed to run inside it to reach what it holds,
//                   so it is never an obstacle". That sentence is the OPPOSITE policy from
//                   WL.A-03, and it is the one that runs.
//   L-11 (OFFEDGE)  an endpoint sits on a block FACE MIDPOINT. A Pod IS a block and `POD_Y` IS its
//                   top face midpoint, so the defective form satisfies this rule exactly.
//
// So both endpoints of the defective lane are legal to every machine in the tree, the rule lived
// only as prose in `js/schemes/workloads/CLAUDE.md`, and the debt count inside that prose was a
// number somebody had to re-measure by hand. A card review that ran the whole gate green could
// still ship the shape, and did. This file is that count, computed.
//
// ===========================================================================================
// THE POPULATION IS NARROWER THAN "A LANE THAT CROSSES A FRAME", AND THAT IS THE WHOLE CARE
// ===========================================================================================
// Crossing a frame edge is not the defect. Three shapes cross one and only the first is the rule:
//
//   FROM ABOVE, onto a Pod   the actor row acting on the Node band. THE QUEUE.
//   FROM ABOVE, into the interior   it lands on something the frame HOLDS that is not a Pod, a
//                   box drawn inside the Node. Printed apart, because whether the frame face is
//                   the right stop for it is a per-card argument this file cannot settle.
//   NOT FROM ABOVE  the two ends are both on the ground: a Pod reaching a Pod on another Node, a
//                   PV mounting into a Pod, a Service reaching its endpoints. The traffic really
//                   does arrive at the Pod, so WL.A-03 does not reach it. Counted, never queued.
//
// ===========================================================================================
// WHAT THIS FILE IS BLIND TO
// ===========================================================================================
//   - A LANE SPELLED AS A `d` STRING or built inside a `P.raw` escape. Only `lane` points and
//     `arrow` endpoints are read. A card carrying a raw escape is named on its row so the reader
//     knows the walk may be short there.
//   - WHETHER THE FACE IT LANDS ON IS THE MIDPOINT. That is L-11's question and L-11 already runs
//     over frames, which are in its face set even though they are out of L-10's obstacle set.
//   - CURVES. A frame is a rect and a segment is read as its two ends, so a lane that bows over an
//     edge and back is not a crossing here.
import { test } from 'node:test';
import { cards } from '../fixtures/catalog.mjs';
import { carriedBlock, shapeProblems, staleKeys } from '../fixtures/carried.mjs';
import { importAll, stepTotal } from '../fixtures/module.mjs';

// Half a unit, the tolerance the sibling geometry readers use: coordinates here are integers or
// exact thirds and nothing is meant to sit near an edge, so it only has to survive float noise.
const EPS = 0.5;

const TRANSLATE_RE = /^translate\(\s*(-?[\d.]+)(?:\s*[ ,]\s*(-?[\d.]+))?\s*\)$/;

// The part tree with group translates applied, which is what puts a lane and a frame declared in
// different groups into one coordinate space.
function flatten(SCENE) {
  const out = [];
  const walk = (parts, dx, dy) => {
    (parts || []).forEach((part) => {
      if (!part) return;
      const p = part.p || {};
      out.push({ kind: part.kind, key: part.key, p, dx, dy });
      if (part.kind !== 'group') return;
      const m = p.transform === undefined ? null : TRANSLATE_RE.exec(String(p.transform).trim());
      walk(p.parts, dx + (m ? Number(m[1]) : 0), dy + (m ? Number(m[2] || 0) : 0));
    });
  };
  walk(SCENE.parts, 0, 0);
  return out;
}

const rect = (p, dx, dy) => ([p.x, p.y, p.w, p.h].every(v => typeof v === 'number' && Number.isFinite(v))
  ? { x: p.x + dx, y: p.y + dy, w: p.w, h: p.h } : null);

const strictlyInside = (x, y, r) =>
  x > r.x + EPS && x < r.x + r.w - EPS && y > r.y + EPS && y < r.y + r.h - EPS;
const strictlyOutside = (x, y, r) =>
  x < r.x - EPS || x > r.x + r.w + EPS || y < r.y - EPS || y > r.y + r.h + EPS;
const onRect = (x, y, r) =>
  x >= r.x - EPS && x <= r.x + r.w + EPS && y >= r.y - EPS && y <= r.y + r.h + EPS;
// The converted form: the endpoint sits ON the frame outline, so it is neither inside nor outside.
const onFace = (x, y, r) => onRect(x, y, r) && !strictlyInside(x, y, r);

function readCard(SCENE) {
  const flat = flatten(SCENE);
  const frames = [];
  const pods = [];
  const segs = [];
  let raws = 0;
  for (const { kind, key, p, dx, dy } of flat) {
    if (kind === 'raw') { raws++; continue; }
    if (kind === 'node') { const r = rect(p, dx, dy); if (r) frames.push({ ...r, key: key || p.label || 'node' }); }
    if (kind === 'pod') { const r = rect(p, dx, dy); if (r) pods.push({ ...r, key: key || p.id || p.label || 'pod' }); }
    if (kind === 'lane' && Array.isArray(p.points) && p.points.length > 1) {
      segs.push({ kind, key, pts: p.points.map(([x, y]) => [x + dx, y + dy]) });
    }
    if (kind === 'arrow' && [p.x1, p.y1, p.x2, p.y2].every(Number.isFinite)) {
      segs.push({ kind, key, pts: [[p.x1 + dx, p.y1 + dy], [p.x2 + dx, p.y2 + dy]] });
    }
  }
  return { frames, pods, segs, raws };
}

const catalogued = await cards();
const modules = await importAll();
const EXPECTED_CARDS = catalogued.length;
const EXPECTED_STEPS = await stepTotal();

const pad = (n) => String(n).padStart(4);

test('WL.A-03, a lane from the actor row stops on the Node FRAME face and not on a Pod inside it (report only)', (t) => {
  const queue = [];       // from above, onto a Pod: the defect
  const interior = [];    // from above, into the interior but not onto a Pod
  const ground = [];      // crosses, but not from above: out of the rule's reach
  const onFaceRows = [];  // the converted form, counted so the queue has a denominator
  const notes = [];
  let walked = 0, steps = 0, framesSeen = 0;

  for (const c of catalogued) {
    const ns = modules.get(c.id);
    if (!ns || !ns.SCENE || !Array.isArray(ns.SCENE.parts)) {
      notes.push(`${c.id}: exports no walkable SCENE, so this card was never read`);
      continue;
    }
    walked++;
    steps += Array.isArray(ns.STEPS_SPEC) ? ns.STEPS_SPEC.length : 0;
    const { frames, pods, segs, raws } = readCard(ns.SCENE);
    framesSeen += frames.length;
    if (!frames.length) continue;

    for (const s of segs) {
      const a = s.pts[0];
      const b = s.pts[s.pts.length - 1];
      for (const fr of frames) {
        // The converted form first: an end ON the outline while the other end is clear of it.
        for (const [end, other] of [[b, a], [a, b]]) {
          if (onFace(end[0], end[1], fr) && strictlyOutside(other[0], other[1], fr)) {
            onFaceRows.push({ card: c.id, key: s.key || '(unkeyed)' });
          }
        }
        let landing = null, from = null;
        if (strictlyInside(b[0], b[1], fr) && strictlyOutside(a[0], a[1], fr)) { landing = b; from = a; }
        else if (strictlyInside(a[0], a[1], fr) && strictlyOutside(b[0], b[1], fr)) { landing = a; from = b; }
        if (!landing) continue;

        const pod = pods.find(p => onRect(landing[0], landing[1], p));
        const row = {
          card: c.id, cat: c.category, kind: s.kind, key: s.key || '(unkeyed)',
          from: `${from[0]},${from[1]}`, to: `${landing[0]},${landing[1]}`,
          frame: fr.key, face: fr.y, pod: pod ? pod.key : '', raws,
          carryKey: `${c.id} ${s.key || '(unkeyed)'} ${fr.key}`,
        };
        if (from[1] >= fr.y - EPS) ground.push(row);
        else if (pod) queue.push(row);
        else interior.push(row);
      }
    }
  }

  const cardsOf = (rows) => new Set(rows.map(r => r.card)).size;
  const out = [];
  out.push('');
  out.push('===== WL.A-03, THE LANE INTO THE NODE BAND, REPORT ONLY =====');
  out.push(`  cards walked ${walked} of ${EXPECTED_CARDS} in the catalog, steps read ${steps}, node frames ${framesSeen}`);
  if (walked < EXPECTED_CARDS || steps < EXPECTED_STEPS) {
    out.push(`  REPORT INCOMPLETE: expected ${EXPECTED_CARDS} cards and ${EXPECTED_STEPS} steps, ` +
      'every number below undercounts');
  }
  for (const n of notes) out.push(`  ${n}`);

  out.push('');
  out.push('1. THE THREE SHAPES A LANE CAN TAKE TO A FRAME, counted live on this walk');
  out.push(`   ON FACE      ${pad(onFaceRows.length)} lane(s) on ${cardsOf(onFaceRows)} card(s)   the rule satisfied: it stops on the outline`);
  out.push(`   ONTO A POD   ${pad(queue.length)} lane(s) on ${cardsOf(queue)} card(s)   THE QUEUE: it crosses the face and lands on a Pod`);
  out.push(`   INTO INSIDE  ${pad(interior.length)} lane(s) on ${cardsOf(interior)} card(s)   crosses and lands on no Pod, a per-card argument`);
  out.push(`   ON THE GROUND${pad(ground.length)} lane(s) on ${cardsOf(ground)} card(s)   both ends on the ground, outside the rule`);

  const held = [];
  const seen = new Set();
  out.push('');
  out.push(`2. THE QUEUE: ${queue.length} lane(s) on ${cardsOf(queue)} card(s) cross the frame face and end on a Pod`);
  const byCard = new Map();
  for (const r of queue) {
    seen.add(r.carryKey);
    if (!byCard.has(r.card)) byCard.set(r.card, []);
    byCard.get(r.card).push(r);
  }
  const carried = new Map();
  for (const [id, rows] of [...byCard.entries()].sort()) {
    out.push(`   ${rows[0].cat}/${id}`);
    for (const r of rows) {
      const line = `${r.key} ${r.from} -> ${r.to}, frame '${r.frame}' face at y ${r.face}, lands on ${r.pod}`;
      out.push(`      ${line}${r.raws ? `   [card carries ${r.raws} raw escape(s), a drawn path may be invisible here]` : ''}`);
      if (carried.has(r.carryKey)) held.push({ key: r.carryKey, why: carried.get(r.carryKey), line });
    }
  }
  out.push('   THE FIX IS ONE COORDINATE, and it is a card-local change: the lane end moves from the');
  out.push('   Pod top to the frame top, which moves no block, no band and no step. It IS a timing');
  out.push('   change, because routeDur is length-based (A-11), so re-read the span and the pace.');

  if (interior.length) {
    out.push('');
    out.push(`3. INTO THE INTERIOR, NOT A QUEUE: ${interior.length} lane(s) on ${cardsOf(interior)} card(s)`);
    for (const r of interior) {
      out.push(`   ${r.cat}/${r.card}  ${r.key} ${r.from} -> ${r.to}, frame '${r.frame}' face at y ${r.face}`);
    }
    out.push('   These reach something the frame HOLDS that is not a Pod. Whether the face is the');
    out.push('   right stop is the card record\'s call, and this file only names them.');
  }

  const stale = staleKeys('FRAME-FACE', seen);
  for (const l of carriedBlock('FRAME-FACE', held, stale)) out.push(l);
  for (const b of shapeProblems('FRAME-FACE', new Set(catalogued.map(c => c.id)))) out.push(`   BROKEN RULING  ${b}`);

  out.push('');
  out.push('===== end of report =====');
  console.log(out.join('\n'));

  t.diagnostic(`WL.A-03: ${walked} cards, on-face ${onFaceRows.length}, ` +
    `queue ${queue.length} on ${cardsOf(queue)} card(s), interior ${interior.length}, ground ${ground.length}`);
});
