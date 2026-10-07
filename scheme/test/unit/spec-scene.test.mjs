// Migrated card SCENEs read as data: L-09 DIAGONAL, L-10 THROUGH, L-11/L-12 OFFEDGE, S-42 roles,
// S-07 one packet layer, the S-11 reset prologue, and string-writer targets. render/geometry.test.mjs
// is the DOM twin. Blind to escape hooks (raw, tune), per-step state, and the bbox mapping.

import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { cards, census } from '../fixtures/catalog.mjs';
import { cardForm, importAll, importKit } from '../fixtures/module.mjs';
import { pathRuns, refUniverse } from '../fixtures/spec.mjs';

// Tolerances shared with render/geometry.test.mjs so both layers agree on what a finding is.
const AXIS_EPS = 0.01;      // a segment is axis-aligned within this, in viewBox units
const TOL = 6;              // slack on a face midpoint
const EDGE_TOL = 2;         // how close a point must be to a face to count as sitting ON it
const TWIN_TOL = 2;         // how exactly two mirrored offsets must cancel to read as a pair (L-12)
const FACE_FRAC = 0.18;     // an offset up to 18% of the face it sits on is not a stray coordinate

// L-11: on a Node frame face an endpoint may sit level with the centre of a block the frame holds.
function aimedAtHeld(p, f, axis, blocks) {
  return blocks.some(b =>
    b.x >= f.x - EDGE_TOL && b.x + b.w <= f.x + f.w + EDGE_TOL &&
    b.y >= f.y - EDGE_TOL && b.y + b.h <= f.y + f.h + EDGE_TOL &&
    Math.abs((axis === 'v' ? p[1] - (b.y + b.h / 2) : p[0] - (b.x + b.w / 2))) <= TOL);
}
const THROUGH_INSET = 3;    // the rect THROUGH tests is shrunk by this on each side

const listing = (items, cap = 8) =>
  items.slice(0, cap).join('\n  ') + (items.length > cap ? `\n  ... and ${items.length - cap} more` : '');

// importAll() carries the census guard, so a short catalog throws before any assertion.
const catalogued = await cards();
const CARD_COUNT = catalogued.length;
const modules = await importAll();
const categoryOf = new Map(catalogued.map(c => [c.id, c.category]));

// cardForm() is exact set equality on the export surface, so a legacy card cannot read as migrated.
const migratedIds = [...modules].filter(([, ns]) => cardForm(ns) === 'migrated').map(([id]) => id).sort();
const legacyIds = [...modules].filter(([, ns]) => cardForm(ns) === 'legacy').map(([id]) => id).sort();

// Built by a different question than migratedIds, which is what makes comparing them a guard.
const scenes = [];
for (const [id, ns] of modules) {
  const S = ns.SCENE;
  if (S && typeof S === 'object' && !Array.isArray(S) && Array.isArray(S.parts)) {
    scenes.push({ id, category: categoryOf.get(id), SCENE: S, STEPS_SPEC: ns.STEPS_SPEC || [] });
  }
}
scenes.sort((a, b) => (a.id < b.id ? -1 : a.id > b.id ? 1 : 0));

// The expected role is read off each kit's constructors, never hardcoded.
const kits = new Map();
for (const cat of new Set(scenes.map(s => s.category))) kits.set(cat, await importKit(cat));

// Offsets accumulate down nested groups. Only translate composes, anything else is reported unplaceable.
const TRANSLATE_RE = /^translate\(\s*(-?[\d.]+)(?:\s*[ ,]\s*(-?[\d.]+))?\s*\)$/;

function flatten(SCENE) {
  const out = [];
  const unplaceable = [];
  const walk = (parts, dx, dy, path) => {
    (parts || []).forEach((part, i) => {
      if (!part) return;
      const p = part.p || {};
      const here = `${path}[${i}]${part.kind}${part.key ? `#${part.key}` : ''}`;
      out.push({ kind: part.kind, key: part.key, p, dx, dy, path: here });
      if (part.kind !== 'group') return;
      let [ndx, ndy] = [dx, dy];
      if (p.transform !== undefined) {
        const m = TRANSLATE_RE.exec(String(p.transform).trim());
        if (!m) unplaceable.push(`${here} carries transform "${p.transform}", which is not a translate`);
        else { ndx += Number(m[1]); ndy += Number(m[2] || 0); }
      }
      walk(p.parts, ndx, ndy, `${here}/`);
    });
  };
  walk(SCENE.parts, 0, 0, '');
  return { parts: out, unplaceable };
}

const flat = new Map(scenes.map(s => [s.id, flatten(s.SCENE)]));

// Scoping as in render/geometry.test.mjs, except a chip counts as a THROUGH obstacle here (never an
// OFFEDGE face). A node is a frame: never an obstacle, but its faces count.
const rectOf = (x, y, w, h, dx, dy, label, kind) =>
  ([x, y, w, h].every(v => typeof v === 'number' && Number.isFinite(v))
    ? { x: x + dx, y: y + dy, w, h, label: String(label).slice(0, 28), kind }
    : null);

// Straight M/L `d` only, each `M` starting a new run. A curve or arc yields null rather than an
// approximated obstacle. Reader shared in ../fixtures/spec.mjs.
function straightD(d) {
  const runs = pathRuns(d);
  return runs.length ? runs : null;
}

function geometryOf(parts) {
  const blocks = [];     // obstacles for THROUGH and faces for OFFEDGE
  const chips = [];      // obstacles for THROUGH only
  const frames = [];     // faces for OFFEDGE only
  const lanes = [];
  for (const { kind, key, p, dx, dy, path } of parts) {
    const push = (arr, r) => { if (r) arr.push(r); };
    if (kind === 'box') push(blocks, rectOf(p.x, p.y, p.w, p.h, dx, dy, p.label || key || 'box', kind));
    if (kind === 'cylinder') push(blocks, rectOf(p.x, p.y, p.w, p.h, dx, dy, p.label || key || 'cylinder', kind));
    if (kind === 'pod') {
      push(blocks, rectOf(p.x, p.y, p.w, p.h, dx, dy, key || p.label || 'pod', kind));
      // The inner box is offset from the shell as buildPod does it, and counts as a .scheme-box.
      if (p.inner) push(blocks, rectOf(p.x + p.inner.dx, p.y + p.inner.dy, p.inner.w, p.inner.h, dx, dy,
        p.inner.label || `${key} inner`, 'box'));
    }
    if (kind === 'node') push(frames, rectOf(p.x, p.y, p.w, p.h, dx, dy, p.label || key || 'node', kind));
    if (kind === 'chip') push(chips, rectOf(p.x, p.y, p.w, p.h, dx, dy, p.name || key || 'chip', kind));
    let pts = null;
    if (kind === 'lane' || kind === 'relation') {
      pts = p.points;
      if (!pts) {
        const subs = straightD(p.d);
        if (subs) {
          for (const s of subs) lanes.push({ kind, key, path, points: s.map(([x, y]) => [x + dx, y + dy]) });
          continue;
        }
      }
    }
    if (kind === 'arrow') pts = p.from ? [p.from, p.to] : [[p.x1, p.y1], [p.x2, p.y2]];
    if (!Array.isArray(pts) || pts.length < 2) continue;
    const ok = pts.every(q => Array.isArray(q) && q.length >= 2 && q.slice(0, 2).every(v => typeof v === 'number' && Number.isFinite(v)));
    if (!ok) { lanes.push({ kind, key, path, points: null }); continue; }
    lanes.push({ kind, key, path, points: pts.map(([x, y]) => [x + dx, y + dy]) });
  }
  return { blocks, chips, frames, lanes };
}

const geom = new Map(scenes.map(s => [s.id, geometryOf(flat.get(s.id).parts)]));

// The ref namespace comes from fixtures/spec.mjs, cached per card.
const universe = new Map(scenes.map(s => [s.id, refUniverse(s.SCENE, s.STEPS_SPEC)]));

// `rewind` and F.set run the same writeStatics, so a key that draws nothing draws nothing in all three.
function writeBlocks(STEPS_SPEC) {
  const out = [];
  for (const [i, spec] of (STEPS_SPEC || []).entries()) {
    if (!spec) continue;
    const at = `step ${i} "${spec.id}"`;
    out.push([at, spec]);
    if (spec.rewind) out.push([`${at} rewind`, spec.rewind]);
    for (const [j, e] of (spec.flow || []).entries()) {
      if (e && e.verb === 'set' && e.p) out.push([`${at} flow[${j}] F.set`, e.p]);
    }
  }
  return out;
}

// Copied from render/geometry.test.mjs with its exemptions: an endpoint on a face is not a crossing,
// an endpoint inside the block is an arrival.
function crosses(a, b, r, tol) {
  const x0 = r.x + tol, x1 = r.x + r.w - tol, y0 = r.y + tol, y1 = r.y + r.h - tol;
  if (x1 <= x0 || y1 <= y0) return false;
  const inside = p => p[0] > x0 && p[0] < x1 && p[1] > y0 && p[1] < y1;
  if (inside(a) || inside(b)) return false;
  if (Math.abs(a[0] - b[0]) < AXIS_EPS) {
    if (a[0] <= x0 || a[0] >= x1) return false;
    return Math.min(a[1], b[1]) < y1 && Math.max(a[1], b[1]) > y0;
  }
  if (Math.abs(a[1] - b[1]) < AXIS_EPS) {
    if (a[1] <= y0 || a[1] >= y1) return false;
    return Math.min(a[0], b[0]) < x1 && Math.max(a[0], b[0]) > x0;
  }
  return false;
}

describe('the migrated population', () => {
  // Same list, not same length: a card swapped for another would keep a count.
  test('every migrated card was walked, and only migrated cards were', (t) => {
    assert.ok(migratedIds.length > 0,
      'NOT ONE CARD EXPORTS A SCENE. Every rule in this file would pass over an empty set, which is ' +
      'the failure this test exists to make loud. Either the declarative layer was reverted or the ' +
      'export surface changed name.');
    assert.deepEqual(scenes.map(s => s.id), migratedIds,
      `this file walked ${scenes.length} scene(s), fixtures/module.mjs counts ${migratedIds.length} ` +
      'migrated card(s). A card exporting SCENE without the rest of the migrated surface, or the ' +
      'other way round, takes itself out of these rules silently.');
    // Sums to the catalog, so a card in neither form cannot hide.
    census('spec-scene population', migratedIds.length + legacyIds.length, CARD_COUNT);
    const cats = [...new Set(scenes.map(s => s.category))].sort();
    t.diagnostic(`scenes walked: ${scenes.length} migrated, ${legacyIds.length} legacy, ` +
      `${CARD_COUNT} of ${CARD_COUNT} accounted for. Categories in play: ${cats.join(', ')}`);
  });

  // A scene emptied to `parts: []` would satisfy every rule below.
  test('every walked scene holds parts, blocks and lanes to rule on', (t) => {
    const findings = [];
    let parts = 0, blocks = 0, lanes = 0, segments = 0;
    for (const s of scenes) {
      const f = flat.get(s.id), g = geom.get(s.id);
      parts += f.parts.length;
      blocks += g.blocks.length + g.chips.length + g.frames.length;
      lanes += g.lanes.length;
      for (const L of g.lanes) if (L.points) segments += L.points.length - 1;
      if (f.parts.length === 0) findings.push(`${s.id}  SCENE.parts is empty`);
      if (g.blocks.length === 0) findings.push(`${s.id}  declares no block at all, so THROUGH and OFFEDGE have no subject`);
      if (g.lanes.length === 0) findings.push(`${s.id}  declares no lane at all, so DIAGONAL has no subject`);
      assert.deepEqual(f.unplaceable, [],
        `${s.id}: this walk cannot place ${f.unplaceable.length} part(s), so every coordinate below ` +
        `them is wrong rather than missing:\n  ${listing(f.unplaceable)}`);
    }
    assert.equal(findings.length, 0, `${findings.length} scene(s) with nothing to rule on:\n  ${listing(findings)}`);
    t.diagnostic(`${parts} parts, ${blocks} block rects, ${lanes} lanes, ${segments} segments across ${scenes.length} scenes`);
  });
});

describe('scene geometry, read from SCENE.parts', () => {
  test('L-09 DIAGONAL: every declared segment is horizontal or vertical', (t) => {
    const findings = [];
    let segments = 0;
    for (const s of scenes) {
      for (const L of geom.get(s.id).lanes) {
        if (!L.points) {
          findings.push(`${s.id}  ${L.path} declares points that are not a list of number pairs`);
          continue;
        }
        for (let k = 0; k + 1 < L.points.length; k++) {
          segments++;
          const a = L.points[k], b = L.points[k + 1];
          if (Math.abs(a[0] - b[0]) > AXIS_EPS && Math.abs(a[1] - b[1]) > AXIS_EPS) {
            findings.push(`${s.id}  ${L.path}: segment (${a}) -> (${b}) is neither horizontal nor vertical`);
          }
        }
      }
    }
    assert.ok(segments > 0, 'zero segments walked: the lane kinds were renamed and this rule is asserting nothing');
    assert.equal(findings.length, 0, `${findings.length} diagonal segment(s):\n  ${listing(findings)}`);
    t.diagnostic(`${segments} declared segments, all axis-aligned within ${AXIS_EPS}`);
  });

  // Mutually exclusive branches hidden per step read here as crossings never on screen. Each entry was
  // verified on the frames and an entry that stops firing fails.
  const THROUGH_EXEMPT = {
    'storage-volume-binding-mode [14]lane#wProvA x Disk zone-b':
      'The Immediate and WaitForFirstConsumer branches never share a frame. On imm-provision, '
      + 'wProvA runs to Disk zone-a and diskB is at opacity 0; on wffc-provision, diskB is drawn '
      + 'and wProvA is at opacity 0, with wProvB serving it. Frames checked at both steps.',
    'storage-container-filesystem [15]lane#lRead x /etc/app.conf':
      'The read lane and the upperdir copy of app.conf never share a frame. On copyup lRead fades '
      + 'out before uConf fades in, on remove uConf is gone before lRead returns, and every step '
      + 'pins exactly one of the two at 0. Frames checked at copyup and remove.',
    // A lane drawn through a block sized around it, where satisfying the rule makes the picture worse (L-16).
    ...Object.fromEntries(['/data', 'app.log', '... 4.2M more'].map(row => [
      `storage-fsgroup-ownership [11]lane x ${row}`,
      'The walk lane IS the scan, and it is drawn down the corridor the listing rows leave for it: '
      + 'each row spans x 446..754, its name column ends at 547 and its owner column starts at 653, '
      + 'so the lane at x=600 has 53 units clear either side. Frame checked on the always step.',
    ])),
  };

  test('L-10 THROUGH: no declared segment crosses a block it does not terminate on', (t) => {
    const findings = [];
    const usedExempt = new Set();
    let tested = 0;
    for (const s of scenes) {
      const g = geom.get(s.id);
      // A node frame is what lanes run inside, so it is no obstacle.
      const obstacles = [...g.blocks, ...g.chips];
      for (const L of g.lanes) {
        if (!L.points) continue;
        for (let k = 0; k + 1 < L.points.length; k++) {
          const a = L.points[k], b = L.points[k + 1];
          for (const r of obstacles) {
            tested++;
            if (!crosses(a, b, r, THROUGH_INSET)) continue;
            const ex = `${s.id} ${L.path} x ${r.label}`;
            if (ex in THROUGH_EXEMPT) { usedExempt.add(ex); continue; }
            findings.push(`${s.id}  ${L.path}: segment (${a}) -> (${b}) crosses ${r.kind} "${r.label}" ` +
              `[${r.x}..${r.x + r.w} x ${r.y}..${r.y + r.h}]`);
          }
        }
      }
    }
    assert.ok(tested > 0, 'zero segment-block pairs tested: either the lanes or the blocks went missing');
    assert.equal(findings.length, 0, `${findings.length} crossing(s):\n  ${listing(findings)}`);
    const stale = Object.keys(THROUGH_EXEMPT).filter(k => !usedExempt.has(k));
    assert.equal(stale.length, 0, `${stale.length} exemption(s) that no longer describe anything:\n  ${listing(stale)}`);
    t.diagnostic(`${tested} segment-block pairs tested against rects inset by ${THROUGH_INSET}, `
      + `${usedExempt.size} declared exemption(s) used`);
  });

  // An endpoint is a defect only alone on its face: a mirrored +d/-d sibling is an L-12 pair. Pooled per card.
  test('L-11 OFFEDGE: a lane endpoint sits on a face midpoint, unless L-12 pairs it', (t) => {
    const findings = [];
    let hits = 0, faces = 0, atMid = 0, byFrac = 0, byTwin = 0, byAim = 0;
    for (const s of scenes) {
      const g = geom.get(s.id);
      // A lane ending on a chip is not a defect, as in render/geometry.test.mjs.
      const faceable = [...g.blocks, ...g.frames];
      const faceHits = new Map();
      for (const L of g.lanes) {
        if (!L.points) continue;
        for (const p of [L.points[0], L.points[L.points.length - 1]]) {
          for (const r of faceable) {
            const mx = r.x + r.w / 2, my = r.y + r.h / 2;
            const onV = (Math.abs(p[0] - r.x) < EDGE_TOL || Math.abs(p[0] - (r.x + r.w)) < EDGE_TOL) &&
              p[1] > r.y - EDGE_TOL && p[1] < r.y + r.h + EDGE_TOL;
            const onH = (Math.abs(p[1] - r.y) < EDGE_TOL || Math.abs(p[1] - (r.y + r.h)) < EDGE_TOL) &&
              p[0] > r.x - EDGE_TOL && p[0] < r.x + r.w + EDGE_TOL;
            const gk = `${r.x},${r.y},${r.w},${r.h}`;
            const push = (face, off, axis) => {
              const k = `${gk}:${face}`;
              if (!faceHits.has(k)) faceHits.set(k, []);
              faceHits.get(k).push({ off, p, r, axis, path: L.path, frame: g.frames.includes(r) });
            };
            if (onV) push(Math.abs(p[0] - r.x) < EDGE_TOL ? 'left' : 'right', p[1] - my, 'v');
            if (onH) push(Math.abs(p[1] - r.y) < EDGE_TOL ? 'top' : 'bottom', p[0] - mx, 'h');
          }
        }
      }
      faces += faceHits.size;
      const seen = new Set();
      for (const list of faceHits.values()) {
        for (const h of list) {
          hits++;
          const off = Math.abs(h.off);
          if (off <= TOL) { atMid++; continue; }
          const face = h.axis === 'v' ? h.r.h : h.r.w;
          if (off / face <= FACE_FRAC) { byFrac++; continue; }
          if (list.some(o => o !== h && Math.abs(o.off + h.off) <= TWIN_TOL)) { byTwin++; continue; }
          if (h.frame && aimedAtHeld(h.p, h.r, h.axis, g.blocks)) { byAim++; continue; }
          const key = `${h.p} ${h.r.label} ${h.axis}`;
          if (seen.has(key)) continue;
          seen.add(key);
          const mid = h.axis === 'v' ? (h.r.y + h.r.h / 2) : (h.r.x + h.r.w / 2);
          findings.push(`${s.id}  ${h.path}: endpoint (${h.p}) alone on "${h.r.label}" ` +
            `${h.axis === 'v' ? 'side' : 'top/bottom'} edge, ${off.toFixed(1)} off its midpoint ` +
            `${h.axis === 'v' ? 'y' : 'x'}=${mid} (${(100 * off / face).toFixed(0)}% of a ${face} face)`);
        }
      }
    }
    // Without this the rule goes vacuous when the face test stops matching.
    assert.ok(hits > 0, 'not one lane endpoint landed on any block face, so OFFEDGE ruled on nothing');
    assert.equal(findings.length, 0, `${findings.length} endpoint(s) off a face midpoint:\n  ${listing(findings)}`);
    t.diagnostic(`${hits} endpoint-on-face hits over ${faces} faces: ${atMid} on the midpoint, ` +
      `${byFrac} within ${FACE_FRAC * 100}% of the face, ${byTwin} exempt as an L-12 mirrored pair, ` +
      `${byAim} on a frame face level with a block it holds`);
  });
});

// S-42: the role a part carries must be the one its kit binds (a wrong role does not spread colour).
// An override counts only once declared here, keyed by (category, kind, role). Unused triples are printed.
const CROSS_ROLE = {
  // Workloads cards draw the control plane acting on the Pod (Kubelet, probes, ETCD), which is cluster.
  workloads: {
    box: ['cluster'], chain: ['cluster'], arrow: ['cluster'],
    lane: ['cluster'], relation: ['cluster'],
    cylinder: ['cluster'],
  },
};

// Parts that carry no role at all, keeping the neutral dim arrowhead. Binding one would change the picture.
const NO_ROLE = {
  network: ['arrow', 'lane', 'relation'],
};

describe('the role binding', () => {
  test('each kit binds a role, gives node none, and gives Pod parts their own', (t) => {
    const findings = [];
    for (const [cat, kit] of kits) {
      const probe = (kind) => kit.P[kind]({}).p;
      const roled = Object.keys(kit.P).filter(k => typeof probe(k).role === 'string' && probe(k).role !== '');
      if (roled.length === 0) findings.push(`${cat}: no part kind carries a bound role, so the role test below is vacuous`);
      if ('role' in probe('node')) findings.push(`${cat}: P.node adds role "${probe('node').role}". A node() takes no role (S-42, R6)`);
      const pod = probe('pod');
      const catRole = probe('box').role;
      // A Pod colour is stated once: cluster pins the workloads violet, the other three draw their own.
      if (typeof pod.role !== 'string' || !pod.role) findings.push(`${cat}: P.pod carries no podRole`);
      else if (pod.role === catRole && pod.tint) findings.push(`${cat}: P.pod takes the category's own role "${pod.role}" yet pins tint ${pod.tint}, a second copy of the category colour`);
      else if (pod.role !== catRole && (typeof pod.tint !== 'string' || !pod.tint)) findings.push(`${cat}: P.pod borrows role "${pod.role}" from another category and pins no tint, so its colour is whatever that category paints`);
      t.diagnostic(`${cat}: role "${probe('box').role}" on ${roled.length} kinds, podRole "${pod.role}", tint ${pod.tint}`);
    }
    assert.equal(findings.length, 0, `${findings.length} finding(s) in the kit bindings:\n  ${listing(findings)}`);
  });

  test('every part carries exactly the role its kit binds to its kind', (t) => {
    const findings = [];
    const tally = new Map();
    const used = new Map();
    let walked = 0;
    for (const s of scenes) {
      const kit = kits.get(s.category);
      for (const { kind, p, path } of flat.get(s.id).parts) {
        if (!(kind in kit.P)) { findings.push(`${s.id}  ${path}: kind "${kind}" is not one the kit builds`); continue; }
        walked++;
        const want = kit.P[kind]({}).p;
        const has = 'role' in p, wants = 'role' in want;
        const k = `${kind}:${wants ? want.role : '(none)'}`;
        tally.set(k, (tally.get(k) || 0) + 1);
        if (!wants && has) {
          findings.push(`${s.id}  ${path}: carries role "${p.role}" on a kind the kit gives none`);
        } else if (wants && !has) {
          findings.push(`${s.id}  ${path}: carries no role, the kit binds "${want.role}" to this kind`);
        } else if (wants && p.role !== want.role) {
          // An override is a finding unless CROSS_ROLE declares it.
          const triple = `${s.category}.${kind} -> ${p.role || '(none)'}`;
          used.set(triple, (used.get(triple) || 0) + 1);
          if (p.role === '') {
            if (!(NO_ROLE[s.category] || []).includes(kind)) {
              findings.push(`${s.id}  ${path}: drops the role entirely, the kit binds "${want.role}", and no NO_ROLE entry allows ${s.category}.${kind}`);
            }
          } else if (!((CROSS_ROLE[s.category] || {})[kind] || []).includes(p.role)) {
            findings.push(`${s.id}  ${path}: overrides role to "${p.role}", the kit binds "${want.role}", and no CROSS_ROLE entry allows ${s.category}.${kind}`);
          }
        }
        if (kind === 'pod' && p.tint !== want.tint) {
          findings.push(`${s.id}  ${path}: Pod tint is ${p.tint}, the kit binds ${want.tint}`);
        }
      }
    }
    assert.ok(walked > 0, 'no part was checked for a role at all');
    assert.equal(findings.length, 0, `${findings.length} role finding(s) over ${walked} parts:\n  ${listing(findings)}`);
    t.diagnostic([...tally.entries()].sort((a, b) => b[1] - a[1]).map(([k, n]) => `${k} x${n}`).join(', '));
    // Unused declarations rot, so they are printed.
    t.diagnostic(`cross-role in use: ${[...used.entries()].map(([k, n]) => `${k} x${n}`).join(', ') || 'none'}`);
    const idle = Object.entries(CROSS_ROLE).flatMap(([cat, kinds]) =>
      Object.entries(kinds).flatMap(([kind, roles]) => roles
        .filter(r => !used.has(`${cat}.${kind} -> ${r}`))
        .map(r => `${cat}.${kind} -> ${r}`)))
      .concat(Object.entries(NO_ROLE).flatMap(([cat, kinds]) => kinds
        .filter(k => !used.has(`${cat}.${k} -> (none)`))
        .map(k => `${cat}.${k} -> (none)`)));
    t.diagnostic(`cross-role declared but unused: ${idle.join(', ') || 'none'}`);
  });
});

// Every string a part draws must be reachable. Fields are listed, not discovered, and every other
// string property must be a declared non-text field, so a new field goes red instead of unread.
const TEXT_FIELDS = {
  box: ['label', 'sublabel'],
  pod: ['label', 'sublabel'],          // inner.label / inner.sublabel handled beside it
  node: ['label'],
  cylinder: ['label'],
  chip: ['name', 'value'],
  chain: ['items'],                    // an array of row strings
  tag: ['text'],
  wire: [],                            // draws only what a step writes, so it needs a key and no more
};
const NON_TEXT_STRINGS = {
  '*': ['key', 'role', 'cls'],
  pod: ['id', 'innerKey', 'shellKey', 'tint'],
  group: ['id', 'transform'],
  packets: ['id'],
  tag: ['anchor'],
  wire: ['anchor'],
  chain: ['anchor'],
  relation: ['dash', 'd'],             // a stroke-dasharray and a path definition, neither read off the canvas
};

describe('the strings the scene draws', () => {
  test('every drawn string SCENE declares is a plain string, and no string field goes unread', (t) => {
    const findings = [];
    const perField = new Map();
    let strings = 0, textParts = 0;
    for (const s of scenes) {
      for (const { kind, key, p, path } of flat.get(s.id).parts) {
        const fields = TEXT_FIELDS[kind];
        const allowed = new Set([...(NON_TEXT_STRINGS['*']), ...(NON_TEXT_STRINGS[kind] || []), ...(fields || [])]);
        for (const [name, v] of Object.entries(p)) {
          if (typeof v !== 'string') continue;
          if (!allowed.has(name)) {
            findings.push(`${s.id}  ${path}: string field "${name}" is one this walk does not read. ` +
              'Add it to TEXT_FIELDS if it is drawn, to NON_TEXT_STRINGS if it is not.');
          }
        }
        if (!fields) continue;
        textParts++;
        let declared = 0;
        for (const f of fields) {
          if (!(f in p)) continue;
          if (f === 'items') {
            if (!Array.isArray(p.items)) { findings.push(`${s.id}  ${path}: items is ${typeof p.items}, expected an array`); continue; }
            if (p.items.length === 0) findings.push(`${s.id}  ${path}: chain declares no row, so it draws nothing`);
            for (const [i, it] of p.items.entries()) {
              if (typeof it !== 'string') { findings.push(`${s.id}  ${path}: chain row ${i} is ${typeof it}, expected a string`); continue; }
              declared++; strings++;
              perField.set('items', (perField.get('items') || 0) + 1);
            }
            continue;
          }
          if (typeof p[f] !== 'string') {
            findings.push(`${s.id}  ${path}: ${f} is ${typeof p[f]}, expected a string. A number renders and ` +
              'then reads as prose to nothing, so no text rule can ever see it.');
            continue;
          }
          declared++; strings++;
          perField.set(f, (perField.get(f) || 0) + 1);
        }
        if (kind === 'pod' && p.inner) {
          for (const f of ['label', 'sublabel']) {
            if (!(f in p.inner)) continue;
            if (typeof p.inner[f] !== 'string') { findings.push(`${s.id}  ${path}: inner.${f} is ${typeof p.inner[f]}`); continue; }
            declared++; strings++;
            perField.set(`inner.${f}`, (perField.get(`inner.${f}`) || 0) + 1);
          }
        }
        // writeStatics reaches a part only through refs[key], so a text-capable part with no text and no key is a permanent blank.
        if (declared === 0 && !key) {
          findings.push(`${s.id}  ${path}: draws no declared text and has no key, so no step can write one`);
        }
      }
    }
    assert.ok(strings > 0, 'zero drawn strings found in any SCENE: the text fields were renamed and this rule is blind');
    assert.equal(findings.length, 0, `${findings.length} finding(s) over ${textParts} text-bearing parts:\n  ${listing(findings)}`);
    t.diagnostic(`${strings} drawn strings declared in SCENE over ${textParts} text-bearing parts: ` +
      [...perField.entries()].sort((a, b) => b[1] - a[1]).map(([f, n]) => `${f} ${n}`).join(', '));
  });

  // The only place the six string writers are resolved: the key must exist and land on a kind that
  // writer can write (every writer is guarded, so a miss is silent). A raw imitating a kind is named here.
  const RAW_SHAPED_AS = {
    // A hand-forged g.scheme-box holding its own .scheme-box-sublabel.
    'network-flat-pod-network.bus': 'box',
  };

  test('every string a step writes lands on a part of the scene that can hold it', (t) => {
    const WRITERS = {
      chips: { kinds: ['chip'], via: 'setVal / setChip, which need the valueText only a valChip carries' },
      chipsCued: { kinds: ['chip'], via: 'setChip' },
      labels: { kinds: ['box'], via: 'setBoxLabel, which queries .scheme-box-label' },
      sublabels: { kinds: ['box'], via: 'setBoxSublabel, which queries .scheme-box-sublabel' },
      podSublabels: { kinds: ['pod', 'podShell'], via: 'setPodSublabel, which queries .scheme-pod-sublabel' },
    };
    const findings = [];
    const usedShapes = new Set();
    let writes = 0;
    for (const s of scenes) {
      const { refs, wires, escaped } = universe.get(s.id);
      for (const [where, o] of writeBlocks(s.STEPS_SPEC)) {
        for (const [field, { kinds, via }] of Object.entries(WRITERS)) {
          for (const k of Object.keys(o[field] || {})) {
            writes++;
            if (escaped.has(k)) continue;              // built by an escape: unreadable, never a finding
            const shaped = RAW_SHAPED_AS[`${s.id}.${k}`];
            if (shaped) usedShapes.add(`${s.id}.${k}`);
            const kind = shaped && refs.get(k) === 'raw' ? shaped : refs.get(k);
            if (!kind) findings.push(`${s.id}  ${where} writes ${field}.${k}, and no part of the scene answers to "${k}"`);
            else if (!kinds.includes(kind)) {
              findings.push(`${s.id}  ${where} writes ${field}.${k} onto a ${kind}. It needs ${kinds.join(' or ')}: ${via}`);
            }
          }
        }
        // setWire reads refs.wires, the other bucket.
        for (const k of Object.keys(o.wires || {})) {
          writes++;
          if (!wires.has(k)) findings.push(`${s.id}  ${where} writes wire "${k}", which no P.wire declares`);
        }
      }
    }
    assert.ok(writes > 0, 'no step writes a single string through a key: this rule is asserting nothing');
    assert.equal(findings.length, 0, `${findings.length} write(s) that draw nothing:\n  ${listing(findings)}`);
    t.diagnostic(`${writes} step string writes, every one landing on a part that can hold it`);
    const idleShapes = Object.keys(RAW_SHAPED_AS).filter(k => !usedShapes.has(k));
    t.diagnostic(`raw parts judged as another kind: ${usedShapes.size} in use` +
      (idleShapes.length ? `, DECLARED AND UNUSED: ${idleShapes.join(', ')}` : ''));
  });

  test('the escape hooks are the only place a drawn string can hide, and each is a real hook', (t) => {
    const findings = [];
    let raws = 0, tunes = 0, assigned = 0;
    const cardsWith = new Set();
    for (const s of scenes) {
      for (const { kind, p, path } of flat.get(s.id).parts) {
        if (kind === 'raw') {
          raws++; cardsWith.add(s.id);
          if (typeof p.make !== 'function' && p.el === undefined) {
            findings.push(`${s.id}  ${path}: a raw part with neither make() nor el builds nothing`);
          }
        }
        if (p.tune !== undefined) {
          tunes++; cardsWith.add(s.id);
          if (typeof p.tune !== 'function') findings.push(`${s.id}  ${path}: tune is ${typeof p.tune}, expected a function`);
        }
      }
      assigned += universe.get(s.id).escaped.size;
    }
    assert.equal(findings.length, 0, `${findings.length} malformed escape(s):\n  ${listing(findings)}`);
    t.diagnostic(`${raws} raw parts and ${tunes} tune hooks in ${cardsWith.size} of ${scenes.length} cards, ` +
      `assigning ${assigned} refs this file can only see by name`);
  });
});

// reset (S-11): `keys` and `pods` are written out, never inferred, so only this test keeps them honest.
describe('the reset prologue', () => {
  test('every reset key and every reset pod names a part of the scene', (t) => {
    const findings = [];
    let keys = 0, pods = 0;
    for (const s of scenes) {
      const { refs, wires, escaped } = universe.get(s.id);
      const reset = s.SCENE.reset || {};
      if (!s.SCENE.reset) findings.push(`${s.id}  declares no reset, so resetStep clears nothing`);
      for (const [field, list] of [['keys', reset.keys || []], ['pods', reset.pods || []]]) {
        for (const k of list) {
          field === 'keys' ? keys++ : pods++;
          if (refs.has(k) || escaped.has(k)) continue;
          const hint = wires.has(k) ? ' It is a WIRE key, and clearHighlights reads refs, not refs.wires.' : '';
          findings.push(`${s.id}  reset.${field} names "${k}", which no part and no escape hook creates.${hint}`);
        }
      }
      if (reset.extra !== undefined && typeof reset.extra !== 'function') {
        findings.push(`${s.id}  reset.extra is ${typeof reset.extra}, expected a function`);
      }
    }
    assert.ok(keys > 0, 'not one reset key over the whole population: this rule is asserting nothing');
    assert.equal(findings.length, 0, `${findings.length} unresolved reset entr(ies):\n  ${listing(findings)}`);
    t.diagnostic(`${keys} reset keys and ${pods} reset pods, all resolved`);
  });

  // A step lights a part the reset does not clear, and the highlight survives into later steps.
  // Only the leak is asked here: resolution is unit/spec-steps.test.mjs's.
  test('every part a step lights is cleared by the reset', (t) => {
    const findings = [];
    let lit = 0;
    for (const s of scenes) {
      const cleared = new Set(s.SCENE.reset && s.SCENE.reset.keys ? s.SCENE.reset.keys : []);
      for (const [i, spec] of (s.STEPS_SPEC || []).entries()) {
        if (!spec) continue;
        const where = `step ${i} "${spec.id}"`;
        const sources = [['lit', spec.lit || []], ['reducedLit', spec.reducedLit || []]];
        for (const [j, e] of (spec.flow || []).entries()) {
          if (!e || !e.p) continue;
          const keys = e.verb === 'light' ? (e.p.targets || []) : (e.p.lights || []);
          if (keys.length) sources.push([`flow[${j}] ${e.verb}`, keys]);
        }
        for (const [field, keys] of sources) {
          for (const k of keys) {
            lit++;
            // The chain is cleared by its own sweep in clearHighlights.
            if (k === 'chain' || cleared.has(k)) continue;
            findings.push(`${s.id}  ${where} lights "${k}" via ${field}, and reset.keys does not clear it`);
          }
        }
      }
    }
    assert.ok(lit > 0, 'no step lights anything: this rule is asserting nothing');
    assert.equal(findings.length, 0, `${findings.length} highlight(s) that outlive their step:\n  ${listing(findings)}`);
    t.diagnostic(`${lit} highlight targets across lit, reducedLit and flow, all cleared by their reset`);
  });
});

describe('scene shape', () => {
  test("every scene carries its own aria-label", (t) => {
    const findings = [];
    const byLabel = new Map();
    for (const s of scenes) {
      const al = s.SCENE['aria-label'];
      if (typeof al !== 'string' || !al.trim()) {
        findings.push(`${s.id}  aria-label is ${typeof al === 'string' ? 'blank' : typeof al}`);
        continue;
      }
      if (byLabel.has(al)) findings.push(`${s.id}  shares its aria-label with ${byLabel.get(al)}: "${al}"`);
      byLabel.set(al, s.id);
    }
    assert.equal(findings.length, 0, `${findings.length} finding(s):\n  ${listing(findings)}`);
    t.diagnostic(`${byLabel.size} distinct aria-labels over ${scenes.length} scenes, ` +
      `${Math.min(...[...byLabel.keys()].map(l => l.length))} to ${Math.max(...[...byLabel.keys()].map(l => l.length))} chars`);
  });

  // S-07: buildScene assigns refs.packetLayer so a second layer silently wins, and two arrowDefs duplicate ids.
  test('one defs, one packet layer, and no key claimed twice', (t) => {
    const findings = [];
    let defs = 0, packets = 0;
    for (const s of scenes) {
      const parts = flat.get(s.id).parts;
      const d = parts.filter(p => p.kind === 'defs').length;
      const k = parts.filter(p => p.kind === 'packets').length;
      defs += d; packets += k;
      if (d !== 1) findings.push(`${s.id}  declares ${d} defs part(s), expected exactly 1`);
      if (k !== 1) findings.push(`${s.id}  declares ${k} packet layer(s), expected exactly 1`);
      const seen = new Map();
      for (const { kind, key, p, path } of parts) {
        const bucket = kind === 'wire' ? 'wires' : 'refs';
        for (const [name, src] of [[key, kind], [p.innerKey, 'innerKey'], [p.shellKey, 'shellKey']]) {
          if (!name) continue;
          const at = src === kind ? bucket : 'refs';
          const id = `${at}:${name}`;
          if (seen.has(id)) findings.push(`${s.id}  ${path}: key "${name}" is already claimed by ${seen.get(id)}, ` +
            'and the later part silently replaces the earlier ref');
          seen.set(id, path);
        }
      }
    }
    assert.equal(findings.length, 0, `${findings.length} finding(s):\n  ${listing(findings)}`);
    t.diagnostic(`${defs} arrowDefs and ${packets} packet layers over ${scenes.length} scenes, no key claimed twice`);
  });

  // style.opacity takes String(v), so a bad value paints without complaint.
  test('every opacity a part declares is a number between 0 and 1', (t) => {
    const findings = [];
    let declared = 0;
    for (const s of scenes) {
      for (const { p, path } of flat.get(s.id).parts) {
        if (p.opacity === undefined) continue;
        declared++;
        if (typeof p.opacity !== 'number' || !Number.isFinite(p.opacity) || p.opacity < 0 || p.opacity > 1) {
          findings.push(`${s.id}  ${path}: opacity is ${JSON.stringify(p.opacity)}`);
        }
      }
    }
    assert.equal(findings.length, 0, `${findings.length} finding(s):\n  ${listing(findings)}`);
    t.diagnostic(`${declared} opacities declared in SCENE, all numeric and in range`);
  });
});
