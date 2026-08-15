// geometry-soft.test.mjs: the three geometry rules that are NOT in the gate, and are not supposed
// to be. Successor of the report half of tools/check-geometry.mjs, the half the gate never ran
// (`--rules=diagonal,through,offedge` in tools/package.json names the other three).
//
//   CENTRE     (L-13)  the content bbox centres within 40 units of x=600, the chip strip within 6.
//   CENTRE-LOW (L-14)  blocks sitting BELOW the narration panel centre on x=600 too, because the
//                      full width is free down there.
//   OCCLUDED   (L-15)  no block has a substantial share of its AREA under the narration panel.
//
// WHY THIS FILE NEVER FAILS. L-16: a finding that can only be closed by making the picture worse
// is left OPEN, with the measurement and the reason written into the card's record. The four
// records carry 18 such entries today (9 cluster, 5 storage, 3 workloads, 1 network). Making these
// three rules mandatory would mean either editing those cards until the pictures are worse, or
// carrying a permanent suppression list, and a suppression list is the thing L-12's numeric
// whitelist already taught this project not to keep. So this file MEASURES and PRINTS. The
// decision about a finding belongs to a person holding the card's record open, and the report
// below is written to be read next to it.
//
// Read the census line at the top of the output first. A report that scanned nothing also prints
// no findings, and that is the only way this file can lie.
//
// VIEWPORTS, and which rule uses which. The standard set is L-06: 1600x1000, 1280x860, 1100x800.
// Only the narration panel moves with the viewport, and it moves NON-MONOTONICALLY (L-05): the
// panel is HTML at a fraction of the dialog width while the diagram is an SVG that scales with it,
// so a WIDER dialog gives a WIDER panel that wraps into FEWER lines and is therefore SHORTER in
// viewBox units. Blocks and chips do not move at all, they are viewBox geometry.
//   CENTRE      one viewport. It reads no panel.
//   OCCLUDED    all three, worst case, exactly as the original did.
//   CENTRE-LOW  ONE viewport, 1600x1000, and this is a BLIND SPOT reproduced on purpose. In the
//               original, the panel bottom that decides which blocks count as "low" is accumulated
//               only in the first walk (check-geometry.mjs:233-237); the extra viewport passes
//               push into ovRects, which only OCCLUDED reads. So CENTRE-LOW judges against one
//               viewport whether or not OCCLUDED is switched on. The report prints what the
//               worst-of-three panel bottom would have changed, as a measurement, never as the
//               verdict: reproducing a rule is not the moment to also redefine it.
//
// L-17 IS REPRODUCED, NOT FIXED. CENTRE counts node() frames in its content bbox and counts no
// chips at all, while CENTRE-LOW excludes frames. That is one quantity computed two ways inside one
// file, and it means a card balanced by a frame full of chip rows still reports. Both readings are
// printed side by side under each CENTRE finding so a reader can see which of the two the number
// came from, but the verdict is the original's.
//
// FONTS FIRST (L-21), and it matters more here than anywhere. A block's bbox is the bbox of its
// GROUP, label and sublabel included, so the content span these three rules centre on is partly a
// text measurement. Measured before the webfont arrives it is the fallback face, about 20 percent
// narrower, and every span, centre and occluded area computed from it is wrong in the same
// direction. No tool in the old harness waited for fonts, so the recorded counts were taken on
// whatever face happened to be resolved. document.fonts.ready alone is not enough:
// scheme/index.html attaches the Google Fonts stylesheet from the onload handler of a
// <link rel="preload">, so `ready` can settle before the sheet is linked. Neither is
// document.fonts.check(), which is why the guard moved into fixtures/render.mjs as a behavioural
// width probe: with no sheet attached there is no @font-face rule to be missing, so check() reports
// every family available, including ones that do not exist. This file never fails, so a fallback
// face is printed at the top of the report as loudly as a line can be printed, and it invalidates
// everything below it.
//
// MEASURED, because "about 20 percent" is not a number anyone can act on. With fonts.gstatic.com
// blocked and everything else identical:
//   block geometry  UNCHANGED on all 108 cards. A block's bbox is its rect, and no card has a
//                   label wider than the rect around it, so the content span does not move at all.
//   panel bottom    SHORTER by 17.5 units, one text line, on 3 of 6 cards sampled
//                   (cluster-delete-flow 194.9 -> 177.4, network-ipam-pod-cidr 177.4 -> 160,
//                   workloads-pod-phase-machine 317 -> 299.5). The panel right edge does not move.
// So the exposure is entirely on the two rules that read the panel: a run without fonts gets a
// SHORTER panel, which hides occluded area and moves the line CENTRE-LOW counts blocks below. Both
// under-report, quietly, at exit 0. That is the shape of the risk L-21 describes, and no tool in
// the old harness could see it.
//
// The probe is a LOCAL COPY, deliberately, and it is NOT the same probe render/geometry.test.mjs
// carries: this file reads blocks, chips and the panel, that one reads blocks and lanes. Neither is
// a subset of the other in any useful way, and a shared fixture would be a third shape that neither
// caller uses whole. Same call report/palette-steps.test.mjs made, same reason.

import { test } from 'node:test';
import { cards } from '../fixtures/catalog.mjs';
import {
  DEFAULT_BASE, DIAGRAM, SELECTOR_TIMEOUT_MS, STEP_SETTLE_MS, DIAGRAM_FACES,
  launch, setInspect, discoverIds, openCard, stepCount, gotoStep, fallbackFaces,
  installGeometryHelpers, overlayProbe,
} from '../fixtures/render.mjs';

// Tolerances, carried over from check-geometry.mjs unchanged.
const TOL = 6;              // chip-strip centre slack, in viewBox units
const CENTRE_TOL = 40;      // content centre slack
const LOW_MIN_BLOCKS = 2;   // fewer than two blocks below the panel is not a composition
const LOW_MIN_SPAN = 200;   // a group narrower than this is not claiming the width
const OCCLUDED_FRAC = 0.15; // share of a block's AREA under the panel before it counts as lost
const CENTRE_X = 600;       // centre of the 1200-unit viewBox

// L-06. The first row is where everything is measured; the other two exist for the panel.
const VIEWPORTS = [
  { width: 1600, height: 1000 },
  { width: 1280, height: 860 },
  { width: 1100, height: 800 },
];

// What the four card records say is left open on purpose (L-16, and the "Known deliberate
// exceptions" table of CANON.md). Printed for comparison, never asserted: it counts OPEN ENTRIES IN
// THE RECORDS, which is a different population from findings this tool produces. See the closing
// note the report prints.
//
// TWO NUMBERS, AND THEY ARE NOT ONE NUMBER. This file prints 8 findings on the live catalog (CENTRE
// 2, CENTRE-LOW 4, OCCLUDED 2), and the four records carry 18 `^OPEN` entries. Both counted
// 2026-08-07. The constant below was 17 for months, which was neither of them: it was an old
// finding count carried into a slot that holds a record count, so a reader comparing the two lines
// of the report was comparing a stale figure with a live one. The records cover more than geometry
// (a frame label under the panel, a band empty by construction, a lane pair declined), so the two
// populations OVERLAP and never coincide, and this line is a record census, not a target.
const DOCUMENTED_OPEN = { total: 18, cluster: 9, storage: 5, workloads: 3, network: 1 };

// Runs IN THE PAGE. No free variables: page.evaluate serialises it. The root-space mapping it uses
// is shared with render/geometry.test.mjs and report/arrival.test.mjs (fixtures/render.mjs
// rootBBox), and reaches the page as window.__toRoot through installGeometryHelpers(). The probe
// itself stays local: the three files read different halves of one picture.
const probe = () => {
  const svg = document.querySelector('dialog.scheme-dialog svg.diagram');
  if (!svg) return null;

  const toRoot = (el, b) => window.__toRoot(el, svg, b);

  const blocks = [];
  for (const sel of ['.scheme-box', '.scheme-pod', '.scheme-cylinder', '.scheme-node']) {
    const isFrame = sel === '.scheme-node';
    for (const el of svg.querySelectorAll(sel)) {
      if (el.closest('#packetLayer')) continue;
      const cs = getComputedStyle(el);
      if (cs.opacity === '0' || cs.display === 'none') continue;
      const b = toRoot(el, el.getBBox());
      const label = (el.querySelector('text') || {}).textContent || sel;
      blocks.push({ label: label.trim().slice(0, 28), x: b.x, y: b.y, w: b.w, h: b.h, isFrame });
    }
  }

  // Content extent, TWICE. `content` is the original's: every block, frames included, which is the
  // number CENTRE judges. `contentNoFrames` is the same span with frames dropped, the way
  // CENTRE-LOW counts, and it exists only so the report can show both sides of L-17.
  let cx0 = Infinity, cx1 = -Infinity, fx0 = Infinity, fx1 = -Infinity;
  for (const b of blocks) {
    cx0 = Math.min(cx0, b.x); cx1 = Math.max(cx1, b.x + b.w);
    if (!b.isFrame) { fx0 = Math.min(fx0, b.x); fx1 = Math.max(fx1, b.x + b.w); }
  }

  // Chip strip extent. No packet-layer filter and no opacity filter, as in the original: a chip
  // parked at opacity 0 still holds its slot in the strip.
  let px0 = Infinity, px1 = -Infinity;
  for (const el of svg.querySelectorAll('.scheme-chip')) {
    const b = toRoot(el, el.getBBox());
    px0 = Math.min(px0, b.x); px1 = Math.max(px1, b.x + b.w);
  }

  // The panel's REAL extent in viewBox units. The blanket safe-zone (x<=380, y<=300) is a catalog
  // worst case, so a card is judged against its own panel, mapped through xMidYMid meet.
  let overlay = null;
  const ov = document.querySelector('.narration-overlay');
  if (ov) {
    const sb = svg.getBoundingClientRect();
    const ob = ov.getBoundingClientRect();
    const vb = svg.viewBox.baseVal;
    const scale = Math.min(sb.width / vb.width, sb.height / vb.height);
    const offX = sb.left + (sb.width - vb.width * scale) / 2;
    const offY = sb.top + (sb.height - vb.height * scale) / 2;
    overlay = { right: (ob.right - offX) / scale + vb.x, bottom: (ob.bottom - offY) / scale + vb.y };
  }

  return { blocks, content: [cx0, cx1], contentNoFrames: [fx0, fx1], chips: [px0, px1], overlay };
};

// The extra viewport passes consume ONLY the panel extent (check-geometry.mjs:262-273 pushes
// nothing else), so they run fixtures/render.mjs overlayProbe instead of the full probe above.
// Blocks and chips are viewBox geometry and do not move with the viewport, so nothing is lost and
// two thirds of the walk gets cheaper. That probe is shared with report/overlay.test.mjs and
// returns all four panel edges; this file reads `right` and `bottom` and ignores the other two.

// The worst area share of block b under any measured panel rect. The panel is anchored at the
// top-left corner of the viewBox, so the overlap is measured from 0 on both axes, exactly as the
// original computed it.
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

// CENTRE-LOW's verdict, factored out because the report runs it twice: once against the panel
// bottom the original uses (one viewport) and once against the worst of the three, to measure what
// the blind spot costs. Returns null when the rule has nothing to say.
function centreLow(blockSeen, ovBottom) {
  if (!ovBottom) return null;
  const low = [...blockSeen.values()].filter(b => b.y >= ovBottom && !b.isFrame);
  if (low.length < LOW_MIN_BLOCKS) return null;
  const lo = Math.min(...low.map(b => b.x)), hi = Math.max(...low.map(b => b.x + b.w));
  const lc = (lo + hi) / 2;
  if (hi - lo < LOW_MIN_SPAN || Math.abs(lc - CENTRE_X) <= CENTRE_TOL) return null;
  return { n: low.length, lo, hi, centre: lc };
}

// One probe, with one retry when the diagram is momentarily absent. Scene.build() empties the host
// and appends a NEW <svg.diagram>, so a step change has an instant with no diagram in the dialog and
// a probe landing in it returns null. Measured: without the retry this walk sampled 649 of 650 steps
// where the mandatory file, doing the same walk, sampled 650. One unsampled step is one step of a
// composition nobody looked at, and in a file that never fails it would have gone unnoticed.
async function probeStep(page) {
  let data = await page.evaluate(probe);
  if (data) return data;
  await page.waitForSelector(DIAGRAM, { timeout: SELECTOR_TIMEOUT_MS });
  return page.evaluate(probe);
}

// The step census of a green run of the whole catalog (REFACTOR-PLAN 0.2). Printed, never asserted.
const EXPECTED_STEPS = 650;

const catalogued = await cards();
const fx = n => Number.isFinite(n) ? n.toFixed(0) : 'n/a';

test('CENTRE / CENTRE-LOW / OCCLUDED across every card (report only, never fails)', async () => {
  const findings = { CENTRE: [], 'CENTRE-LOW': [], OCCLUDED: [] };
  const perCard = new Map();
  const lowDelta = [];          // what a worst-of-three panel bottom would add or drop
  const fellBack = new Set();
  const notes = [];
  let browser;
  let sampledCards = 0, steps = 0, extraSteps = 0;

  const record = (rule, id, line) => {
    findings[rule].push({ id, line });
    if (!perCard.has(id)) perCard.set(id, []);
    perCard.get(id).push(`${rule.padEnd(10)} ${line}`);
  };

  try {
    browser = await launch();
    const context = await browser.newContext({ viewport: VIEWPORTS[0] });
    const page = await context.newPage();
    await page.addInitScript(setInspect, 'expose');
    await installGeometryHelpers(page);
    const ids = await discoverIds(page, DEFAULT_BASE);

    for (const id of ids) {
      try {
        await openCard(page, id);
        for (const f of await fallbackFaces(page)) fellBack.add(f);
        const total = await stepCount(page);
        if (!total) { notes.push(`${id}: stepCount 0, nothing walked`); continue; }

        // Pooled over every step: a block that only appears mid-story still has to sit where it
        // belongs, and the content span is the union of what the card ever draws.
        const blockSeen = new Map();
        const span = [Infinity, -Infinity], spanNoFrames = [Infinity, -Infinity], strip = [Infinity, -Infinity];
        const ovRects = [];
        let ovRight = 0, ovBottom = 0;

        for (let i = 0; i < total; i++) {
          await gotoStep(page, i);
          await page.waitForTimeout(STEP_SETTLE_MS);
          const data = await probeStep(page);
          if (!data) { notes.push(`${id}: step ${i} had no diagram, not sampled`); continue; }
          steps++;
          for (const b of data.blocks) {
            blockSeen.set(`${b.x.toFixed(0)},${b.y.toFixed(0)},${b.w.toFixed(0)},${b.h.toFixed(0)}`, b);
          }
          if (data.overlay) {
            // ovRight / ovBottom accumulate HERE ONLY. That is the blind spot described in the
            // header: CENTRE-LOW's panel bottom is this viewport's worst, never the set's.
            ovRight = Math.max(ovRight, data.overlay.right);
            ovBottom = Math.max(ovBottom, data.overlay.bottom);
            ovRects.push(data.overlay);
          }
          span[0] = Math.min(span[0], data.content[0]); span[1] = Math.max(span[1], data.content[1]);
          spanNoFrames[0] = Math.min(spanNoFrames[0], data.contentNoFrames[0]);
          spanNoFrames[1] = Math.max(spanNoFrames[1], data.contentNoFrames[1]);
          strip[0] = Math.min(strip[0], data.chips[0]); strip[1] = Math.max(strip[1], data.chips[1]);
        }

        // OCCLUDED's extra viewports. Panel only.
        for (const vp of VIEWPORTS.slice(1)) {
          await page.setViewportSize(vp);
          for (let i = 0; i < total; i++) {
            await gotoStep(page, i);
            await page.waitForTimeout(STEP_SETTLE_MS);
            const o = await page.evaluate(overlayProbe);
            if (o) { ovRects.push(o); extraSteps++; }
          }
        }
        await page.setViewportSize(VIEWPORTS[0]);

        // CENTRE. Both readings printed, the original's judged. A card with no chips leaves the
        // strip at [Infinity, -Infinity] and its centre is NaN, so the comparison is false and no
        // finding is made: that is the original's behaviour and it is right, a card without chips
        // has no strip to centre.
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

        // CENTRE-LOW, as the original judges it: one viewport's panel bottom.
        const low = centreLow(blockSeen, ovBottom);
        if (low) {
          record('CENTRE-LOW', id,
            `${low.n} blocks below the panel span ${fx(low.lo)}..${fx(low.hi)}, centre ${fx(low.centre)} ` +
            `(want ~${CENTRE_X}, full width is free there, panel bottom ${fx(ovBottom)})`);
        }
        // ...and what the worst-of-three panel bottom would have said instead. Measurement only.
        const ovBottomAll = ovRects.reduce((m, o) => Math.max(m, o.bottom), 0);
        const lowAll = centreLow(blockSeen, ovBottomAll);
        if (ovBottomAll > ovBottom && !!low !== !!lowAll) {
          lowDelta.push(`${id}: panel bottom ${fx(ovBottom)} -> ${fx(ovBottomAll)} would ` +
            (lowAll ? `ADD a finding (${lowAll.n} blocks, ${fx(lowAll.lo)}..${fx(lowAll.hi)}, centre ${fx(lowAll.centre)})`
              : 'DROP the finding above'));
        }

        // OCCLUDED, over every panel rect from all three viewports.
        if (ovRects.length) {
          for (const b of blockSeen.values()) {
            if (b.isFrame) continue;
            const { worst, at } = worstOcclusion(b, ovRects);
            if (worst > OCCLUDED_FRAC) {
              record('OCCLUDED', id,
                `"${b.label}" [${fx(b.x)}..${fx(b.x + b.w)} x ${fx(b.y)}..${fx(b.y + b.h)}] is ` +
                `${(100 * worst).toFixed(0)}% under the narration panel at its worst ` +
                `(x<=${fx(at.right)}, y<=${fx(at.bottom)})`);
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
  } finally {
    if (browser) await browser.close();
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
  if (sampledCards !== catalogued.length) {
    out.push(`  REPORT INCOMPLETE: ${catalogued.length - sampledCards} card(s) were not sampled, ` +
      'every number below undercounts. A report that scans nothing reports nothing.');
  }
  if (steps < EXPECTED_STEPS) {
    out.push(`  REPORT INCOMPLETE: ${EXPECTED_STEPS - steps} step(s) short of the ${EXPECTED_STEPS} ` +
      'a green run of this catalog walks. Every missing step is a composition nobody looked at.');
  }
  out.push('');
  out.push('  findings by rule');
  for (const rule of ['CENTRE', 'CENTRE-LOW', 'OCCLUDED']) {
    const rows = findings[rule];
    const cardsHit = new Set(rows.map(r => r.id));
    out.push(`    ${rule.padEnd(11)} ${String(rows.length).padStart(3)} finding(s) on ${cardsHit.size} card(s)`);
  }
  out.push(`    ${'TOTAL'.padEnd(11)} ${String(total).padStart(3)} finding(s) on ${perCard.size} card(s)`);
  out.push(`    by category: ${[...byCategory.entries()].sort().map(([c, n]) => `${c} ${n}`).join(', ') || 'none'}`);
  out.push('');

  for (const [id, lines] of [...perCard.entries()].sort()) {
    out.push(`  ${id}`);
    for (const l of lines) out.push(`    ${l}`);
  }
  out.push('');

  out.push('  BLIND SPOT, measured: CENTRE-LOW judges against the panel bottom of ONE viewport');
  out.push(`  (${VIEWPORTS[0].width}x${VIEWPORTS[0].height}), because the extra passes feed OCCLUDED only. Cards where the`);
  out.push('  worst-of-three bottom would change the verdict: ' + (lowDelta.length || 'none'));
  for (const l of lowDelta) out.push(`    ${l}`);
  out.push('');

  out.push(`  Against the record: the four CARDS.md carry ${DOCUMENTED_OPEN.total} OPEN entries ` +
    `(cluster ${DOCUMENTED_OPEN.cluster}, storage ${DOCUMENTED_OPEN.storage}, ` +
    `workloads ${DOCUMENTED_OPEN.workloads}, network ${DOCUMENTED_OPEN.network}).`);
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
  out.push('===== end of report =====');

  console.log(out.join('\n'));
  // No assertion, on purpose. Every line above is a measurement, and L-16 puts the decision about
  // it with a person reading the card's record. See the header.
});
