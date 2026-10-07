// CENTRE (L-13), CENTRE-LOW (L-14) and OCCLUDED (L-15), reported, never failing (L-16). Carried rulings
// print as CARRIED. CENTRE-LOW reads one viewport's panel and CENTRE counts frames but not chips (L-17),
// both reproduced on purpose. A fallback face invalidates the panel numbers (L-21).

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { cards } from '../fixtures/catalog.mjs';
import { carriedBlock, carriedMap, carryKey, shapeProblems, staleKeys } from '../fixtures/carried.mjs';
import { stepTotal } from '../fixtures/module.mjs';
import { DIAGRAM_FACES } from '../fixtures/render.mjs';
import { readSnapshot } from '../fixtures/snapshot.mjs';

// All readings come from tools/walk.mjs, shared with report/overlay.test.mjs.

const TOL = 6;              // chip-strip centre slack, in viewBox units
const CENTRE_TOL = 40;      // content centre slack
const LOW_MIN_BLOCKS = 2;   // fewer than two blocks below the panel is not a composition
const LOW_MIN_SPAN = 200;   // a group narrower than this is not claiming the width
const OCCLUDED_FRAC = 0.15; // share of a block's AREA under the panel before it counts as lost
const CENTRE_X = 600;

// L-06. Everything is measured at the first. The other two exist for the panel.
const VIEWPORTS = [
  { width: 1600, height: 1000 },
  { width: 1280, height: 860 },
  { width: 1100, height: 800 },
];

// The OPEN entries in the card records are a different, overlapping population, counted in docs-census.

// The panel is anchored at the viewBox top-left, so overlap is measured from 0 on both axes.
function worstOcclusion(b, rects) {
  let worst = 0, at = null;
  for (const o of rects) {
    const ox = Math.max(0, Math.min(b.x + b.w, o.right) - Math.max(b.x, 0));
    const oy = Math.max(0, Math.min(b.y + b.h, o.bottom) - Math.max(b.y, 0));
    const frac = (ox * oy) / (b.w * b.h);
    if (frac > worst) { worst = frac; at = o; }
  }
  return { worst, at };
}

// Run twice: against one viewport's panel bottom (the verdict) and against the worst of three (measurement).
function centreLow(blockSeen, ovBottom) {
  if (!ovBottom) return null;
  const low = [...blockSeen.values()].filter(b => b.y >= ovBottom && !b.isFrame);
  if (low.length < LOW_MIN_BLOCKS) return null;
  const lo = Math.min(...low.map(b => b.x)), hi = Math.max(...low.map(b => b.x + b.w));
  const lc = (lo + hi) / 2;
  if (hi - lo < LOW_MIN_SPAN || Math.abs(lc - CENTRE_X) <= CENTRE_TOL) return null;
  return { n: low.length, lo, hi, centre: lc };
}

// Printed, never asserted.
const EXPECTED_STEPS = await stepTotal();

const catalogued = await cards();
const fx = n => Number.isFinite(n) ? n.toFixed(0) : 'n/a';

// GEOMETRY_IDS (or SCHEME_IDS) narrows the walk. Rows stay true per card, but population totals are
// announced as a SUBSET.
const ONLY_VAR = process.env.GEOMETRY_IDS ? 'GEOMETRY_IDS' : 'SCHEME_IDS';
const ONLY = (process.env.GEOMETRY_IDS || process.env.SCHEME_IDS || '')
  .split(',').map(s => s.trim()).filter(Boolean);

test('CENTRE / CENTRE-LOW / OCCLUDED across every card (report only, never fails)', async () => {
  const findings = { CENTRE: [], 'CENTRE-LOW': [], OCCLUDED: [] };
  const CARRIED = { CENTRE: carriedMap('CENTRE'), 'CENTRE-LOW': carriedMap('CENTRE-LOW'), OCCLUDED: carriedMap('OCCLUDED') };
  const perCard = new Map();
  const lowDelta = [];          // what a worst-of-three panel bottom would add or drop
  const fellBack = new Set();
  const notes = [];
  let sampledCards = 0, steps = 0, extraSteps = 0;

  // CENTRE and CENTRE-LOW key on the card id, OCCLUDED on the block label. Carried rows still print but stay out of perCard.
  const record = (rule, id, line, where = []) => {
    const carry = carryKey(id, where);
    const why = CARRIED[rule].get(carry);
    findings[rule].push({ id, line, carryKey: carry, why });
    if (why) return;
    if (!perCard.has(id)) perCard.set(id, []);
    perCard.get(id).push(`${rule.padEnd(10)} ${line}`);
  };

  try {
    const snap = readSnapshot();
    const all = snap.ids;
    const ids = ONLY.length ? all.filter(i => ONLY.includes(i)) : all;
    for (const want of ONLY) {
      if (!all.includes(want)) notes.push(`${ONLY_VAR} names ${want}, which the grid does not render`);
    }
    const vp0 = `${VIEWPORTS[0].width}x${VIEWPORTS[0].height}`;

    for (const id of ids) {
      try {
        const card = snap.cards[id];
        for (const f of card.fellBack) fellBack.add(f);
        const total = card.steps;
        if (!total) { notes.push(`${id}: stepCount 0, nothing walked`); continue; }

        // Pooled over every step: the content span is the union of what the card ever draws.
        const blockSeen = new Map();
        const span = [Infinity, -Infinity], spanNoFrames = [Infinity, -Infinity], strip = [Infinity, -Infinity];
        const ovRects = [];
        let ovRight = 0, ovBottom = 0;

        for (let i = 0; i < total; i++) {
          const row = card.byVp[vp0][i];
          // `panelSoft` is this file's two-edge reading, `panel` the four-edge one overlay reads.
          const data = row.geom && { ...row.geom, overlay: row.panelSoft };
          if (!data) { notes.push(`${id}: step ${i} had no diagram, not sampled`); continue; }
          steps++;
          for (const b of data.blocks) {
            blockSeen.set(`${b.x.toFixed(0)},${b.y.toFixed(0)},${b.w.toFixed(0)},${b.h.toFixed(0)}`, b);
          }
          if (data.overlay) {
            // Accumulated here only: CENTRE-LOW's panel bottom is this viewport's (L-17 blind spot).
            ovRight = Math.max(ovRight, data.overlay.right);
            ovBottom = Math.max(ovBottom, data.overlay.bottom);
            ovRects.push(data.overlay);
          }
          span[0] = Math.min(span[0], data.content[0]); span[1] = Math.max(span[1], data.content[1]);
          spanNoFrames[0] = Math.min(spanNoFrames[0], data.contentNoFrames[0]);
          spanNoFrames[1] = Math.max(spanNoFrames[1], data.contentNoFrames[1]);
          strip[0] = Math.min(strip[0], data.chips[0]); strip[1] = Math.max(strip[1], data.chips[1]);
        }

        // OCCLUDED's extra viewports, panel only.
        for (const vp of VIEWPORTS.slice(1)) {
          for (const row of card.byVp[`${vp.width}x${vp.height}`]) {
            if (row.panel) { ovRects.push(row.panel); extraSteps++; }
          }
        }

        // A card with no chips has a NaN strip centre, so no finding is made.
        const cc = (span[0] + span[1]) / 2;
        const pc = (strip[0] + strip[1]) / 2;
        const ovNote = ovBottom ? ` [panel covers x<=${fx(ovRight)}, y<=${fx(ovBottom)} at ${VIEWPORTS[0].width}x${VIEWPORTS[0].height}]` : '';
        if (Math.abs(pc - CENTRE_X) > TOL) {
          record('CENTRE', id, `chip strip spans ${fx(strip[0])}..${fx(strip[1])}, centre ${fx(pc)} (want ${CENTRE_X} +-${TOL})`);
        }
        if (Math.abs(cc - CENTRE_X) > CENTRE_TOL) {
          const ncc = (spanNoFrames[0] + spanNoFrames[1]) / 2;
          record('CENTRE', id,
            `content spans ${fx(span[0])}..${fx(span[1])}, centre ${fx(cc)} (want ~${CENTRE_X} +-${CENTRE_TOL}, ` +
            `margins ${fx(span[0])} / ${fx(1200 - span[1])})${ovNote}` +
            `\n             L-17: frames included above. Without them ${fx(spanNoFrames[0])}..${fx(spanNoFrames[1])}, ` +
            `centre ${fx(ncc)}${Math.abs(ncc - CENTRE_X) > CENTRE_TOL ? '' : ', which would NOT report'}`);
        }

        const low = centreLow(blockSeen, ovBottom);
        if (low) {
          record('CENTRE-LOW', id,
            `${low.n} blocks below the panel span ${fx(low.lo)}..${fx(low.hi)}, centre ${fx(low.centre)} ` +
            `(want ~${CENTRE_X}, full width is free there, panel bottom ${fx(ovBottom)})`);
        }
        // Measurement only.
        const ovBottomAll = ovRects.reduce((m, o) => Math.max(m, o.bottom), 0);
        const lowAll = centreLow(blockSeen, ovBottomAll);
        if (ovBottomAll > ovBottom && !!low !== !!lowAll) {
          lowDelta.push(`${id}: panel bottom ${fx(ovBottom)} -> ${fx(ovBottomAll)} would ` +
            (lowAll ? `ADD a finding (${lowAll.n} blocks, ${fx(lowAll.lo)}..${fx(lowAll.hi)}, centre ${fx(lowAll.centre)})`
              : 'DROP the finding above'));
        }

        if (ovRects.length) {
          for (const b of blockSeen.values()) {
            if (b.isFrame) continue;
            const { worst, at } = worstOcclusion(b, ovRects);
            if (worst > OCCLUDED_FRAC) {
              record('OCCLUDED', id,
                `"${b.label}" [${fx(b.x)}..${fx(b.x + b.w)} x ${fx(b.y)}..${fx(b.y + b.h)}] is ` +
                `${(100 * worst).toFixed(0)}% under the narration panel at its worst ` +
                `(x<=${fx(at.right)}, y<=${fx(at.bottom)})`, [b.label]);
            }
          }
        }

        sampledCards++;
      } catch (err) {
        notes.push(`${id}: ${err.message.split('\n')[0]}`);
      }
    }
  } catch (err) {
    notes.push(`harness: ${err.message.split('\n')[0]}`);
  }

  const total = findings.CENTRE.length + findings['CENTRE-LOW'].length + findings.OCCLUDED.length;
  const byCategory = new Map();
  for (const id of perCard.keys()) {
    const cat = id.split('-')[0];
    byCategory.set(cat, (byCategory.get(cat) || 0) + perCard.get(id).length);
  }

  const out = [];
  out.push('');
  out.push('===== CENTRE / CENTRE-LOW / OCCLUDED, REPORT ONLY (L-13, L-14, L-15) =====');
  if (fellBack.size) {
    out.push('  REPORT INVALID: measured on the FALLBACK face, not the real one.');
    for (const f of fellBack) out.push(`    ${f}`);
    out.push(`  The two faces this report needs are ${DIAGRAM_FACES.map(f => f.family).join(' and ')}. Every span and`);
    out.push('  centre below is partly a text measurement taken on a face about 20 percent narrower');
    out.push('  (L-21), and the panel bottom lands one text line HIGH, which hides occluded area and');
    out.push('  moves the line CENTRE-LOW counts blocks below. Both under-report, quietly, at exit 0.');
    out.push('  Fix the run (no route to fonts.googleapis.com / fonts.gstatic.com), not the cards.');
  }
  out.push(`  cards sampled ${sampledCards} of ${catalogued.length} in the catalog`);
  out.push(`  steps walked  ${steps} at ${VIEWPORTS[0].width}x${VIEWPORTS[0].height}, ` +
    `${extraSteps} more for the panel at ${VIEWPORTS.slice(1).map(v => `${v.width}x${v.height}`).join(' and ')}`);
  if (ONLY.length) {
    out.push(`  SUBSET: ${ONLY_VAR} restricted this walk to ${ONLY.length} card(s) (${ONLY.join(', ')}).`);
    out.push('  Every per-card and per-block row below is as true as it is on a full run: these three');
    out.push('  rules measure one card against the canvas and never against the catalog. The TOTAL, the');
    out.push('  by-category tally and the queue length are only the walked cards. A full run is what');
    out.push('  says how many findings the catalog holds.');
  } else if (sampledCards !== catalogued.length) {
    out.push(`  REPORT INCOMPLETE: ${catalogued.length - sampledCards} card(s) were not sampled, ` +
      'every number below undercounts. A report that scans nothing reports nothing.');
  }
  if (!ONLY.length && steps < EXPECTED_STEPS) {
    out.push(`  REPORT INCOMPLETE: ${EXPECTED_STEPS - steps} step(s) short of the ${EXPECTED_STEPS} ` +
      'a green run of this catalog walks. Every missing step is a composition nobody looked at.');
  }
  out.push('');
  out.push('  findings by rule, and how many of each a person has read and carried');
  let heldTotal = 0;
  for (const rule of ['CENTRE', 'CENTRE-LOW', 'OCCLUDED']) {
    const rows = findings[rule];
    const held = rows.filter(r => r.why);
    heldTotal += held.length;
    const cardsHit = new Set(rows.filter(r => !r.why).map(r => r.id));
    out.push(`    ${rule.padEnd(11)} ${String(rows.length).padStart(3)} finding(s), ` +
      `${held.length} carried with a reason, ${rows.length - held.length} left to work on ${cardsHit.size} card(s)`);
  }
  out.push(`    ${'TOTAL'.padEnd(11)} ${String(total).padStart(3)} finding(s), ${heldTotal} carried, ` +
    `${total - heldTotal} left to work on ${perCard.size} card(s)`);
  out.push(`    left to work by category: ${[...byCategory.entries()].sort().map(([c, n]) => `${c} ${n}`).join(', ') || 'none'}`);
  out.push('');

  for (const [id, lines] of [...perCard.entries()].sort()) {
    out.push(`  ${id}`);
    for (const l of lines) out.push(`    ${l}`);
  }
  out.push('');

  // On a SUBSET, staleness is judged only for walked cards.
  const walked = (key) => !ONLY.length || ONLY.includes(key.split(' ')[0]);
  for (const rule of ['CENTRE', 'CENTRE-LOW', 'OCCLUDED']) {
    const rows = findings[rule];
    const held = rows.filter(r => r.why);
    const stale = staleKeys(rule, rows.map(r => r.carryKey)).filter(walked);
    if (!held.length && !stale.length) continue;
    out.push(`  ${rule}, read and carried:`);
    for (const l of carriedBlock(rule, held.map(r => ({ key: r.carryKey, why: r.why })), stale, '    ')) out.push(l);
  }
  if (ONLY.length) {
    out.push('  The carried store was read for the walked card(s) only: on a subset every other');
    out.push('  entry would read as stale for the trivial reason that nothing opened its card.');
  }
  out.push('');

  out.push('  BLIND SPOT, measured: CENTRE-LOW judges against the panel bottom of ONE viewport');
  out.push(`  (${VIEWPORTS[0].width}x${VIEWPORTS[0].height}), because the extra passes feed OCCLUDED only. Cards where the`);
  out.push('  worst-of-three bottom would change the verdict: ' + (lowDelta.length || 'none'));
  for (const l of lowDelta) out.push(`    ${l}`);
  out.push('');

  out.push('  Against the record: the four CARDS.md carry the OPEN entries L-16 leaves open on purpose,');
  out.push('  counted in scheme/CLAUDE.md and machine-compared by unit/docs-census.test.mjs.');
  out.push(`  This walk produced ${total}. The two counts are NOT the same population and are not expected to`);
  out.push('  match: an OPEN entry is any finding a card record leaves open, including review-level ones no');
  out.push('  tool produces (an empty band at wide viewports, a frame label the panel covers, a poster');
  out.push('  silhouette), while the lines above are only what these three rules can see. A finding here');
  out.push('  with no OPEN entry behind it is the one worth chasing: it is either new, or it was closed in');
  out.push('  the record and not in the picture.');
  if (notes.length) {
    out.push('');
    out.push(`  cards that could not be sampled: ${notes.length}`);
    notes.slice(0, 20).forEach(l => out.push(`    ${l}`));
  }
  // Printed, not asserted: this file fails on nothing.
  const ids = new Set(catalogued.map(c => c.id));
  const broken = ['CENTRE', 'CENTRE-LOW', 'OCCLUDED'].flatMap(a => shapeProblems(a, ids));
  if (broken.length) {
    out.push('');
    out.push(`  BROKEN RULINGS in fixtures/carried.mjs: ${broken.length}`);
    for (const b of broken) out.push('    ' + b);
  }
  out.push('===== end of report =====');

  console.log(out.join('\n'));

  // No assertion on a finding, one on the walk: an incomplete run must not exit 0 (S-46). The expected
  // size is what the filter asked for.
  const wanted = ONLY.length ? ONLY.length : catalogued.length;
  assert.equal(sampledCards, wanted,
    `sampled ${sampledCards} of ${wanted} card(s) asked for. A report that scans nothing reports ` +
    'nothing, and every number above undercounts by whatever it missed.');
  assert.ok(ONLY.length ? steps > 0 : steps >= EXPECTED_STEPS,
    `walked ${steps} step(s), the specs declare ${ONLY.length ? 'more than zero for a subset' : EXPECTED_STEPS}. ` +
    'Every missing step is a composition nobody looked at.');
});
