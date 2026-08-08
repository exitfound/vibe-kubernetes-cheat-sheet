// arrival.test.mjs: the arrival grammar, measured. Successor of tools/check-arrival.mjs, which was
// written, run, and NEVER PUT IN THE GATE. Its chain is defined in tools/package.json and this check
// is not in it, so nothing has ever run it on a schedule and nothing has ever depended on its exit
// code. That history is the whole reason this file lives under report/ and not under render/.
//
//   R3  a block that RECEIVES a packet this step must not already be lit when the step opens. It has
//       to gain .highlight on arrival, which is what lightBoxAt(el, ctx, pkt.arrivalMs) is for. A
//       block lit from the start says "this is the thing" before the thing has happened, and the
//       ball then lands on something already announced.
//       Blocks that ACT FIRST are exempt: the origin of a round trip sends at delay 0 and its answer
//       comes home later, so it is legitimately lit before the ball it receives. A MID-CHAIN block is
//       the opposite shape: it receives hop one and only then sends hop two, so it must open dark.
//   R2  a value chip whose value CHANGED since the previous step must carry .highlight this step.
//       Otherwise the number turns over with nothing pointing at it, on the one step that is about it.
//
// Value chips are deliberately OUT of R3 and that is an authored decision, not an omission: a chip
// lights at step entry WITH its text change (setChip does both in one call), while boxes, pods and
// cylinders light on arrival. Two different cues for two different kinds of object.
//
// WHY THIS FILE NEVER FAILS ON A FINDING. Both rules find things today, and every one of them is a
// statement about a CARD, not about the harness. The project already runs the cycle "report-only,
// then triage, then promote into the mandatory set" (the ENFORCED sets in check-canon.mjs:78 and
// check-reduced.mjs:25 are the same idea). Promoting either rule before its findings have been read
// would turn one measurement into a red gate for work nobody has scheduled. So the findings print
// and the run stays green.
//
// WHAT DOES FAIL HERE, and it is the only thing that does: the CENSUS. A report that scanned nothing
// prints no findings and looks exactly like a clean catalog. Fewer than the recorded 108 cards or
// 650 steps is therefore an assertion failure, not a note. This is the lesson of stage 2.4c, where
// the first run of a report test counted 649 of 650 and nothing about the output looked wrong.
//
// TWO HARNESS LIMITS THIS FILE IS BUILT AROUND.
//
// 1. A PAUSED ANIMATION NEVER FIRES onfinish (stage 2.3a). enterStep pauses every animation of the
//    step, so nothing a card defers to a completion handler has run when the probe reads the DOM.
//    For R3 that is not a defect of the reading, it is its SUBJECT: the rule asks what the step looks
//    like AT ENTRY, before any arrival has landed, and lightBoxAt is exactly such a deferred handler,
//    so a block that lights correctly on arrival reads as dark here and reads as dark for the right
//    reason. The frozen probe is the correct instrument for R3 and would be the wrong one for any
//    rule about the END of a step.
//    FOR R2 IT CHANGES THE ANSWER, and the original had no way to know. A frozen t=0 sample sees
//    neither a value a card writes mid-step nor a cue it lands mid-step, and BOTH halves of R2 are
//    then read off the wrong frame. storage-fsgroup-ownership is the worked example, and its
//    CARDS.md section describes the intended behaviour in as many words ("a row lights by taking
//    .highlight as the ball crosses it"): on its chown step the listing still reads root:root at
//    t=0 and turns over row by row as the ball passes, each row taking .highlight and keeping it.
//    Frozen, the change is therefore invisible in the step that makes it and shows up in the NEXT
//    step, where the cue has legitimately already been shown and cleared. The tool reported three
//    findings against a card doing exactly what its record says.
//    So every step is sampled TWICE: frozen at entry, and again on the STATIC path, where gotoStep
//    replays it with ctx.reduced so every deferred branch runs at once, which is the settled end
//    state a real playthrough reaches. That gives two readings of one rule:
//      R2-ENTRY  the tool's own comparison, entry against entry. Reproduced verbatim so its number
//                is checkable, and each finding is additionally labelled with whether a cue lands
//                later in that same step.
//      R2-STEP   settled against settled, which is what the rule actually asks. This is the queue.
//    They disagree, and the disagreement is the point: a rule can be reported faithfully and still
//    be reading the wrong frame.
//
// 2. THE PROBE CAN CATCH A STEP WITH NO DIAGRAM (stage 2.4c). Scene.build() empties the host and
//    appends a fresh <svg.diagram>, so a probe landing in that window sees nothing at all. The
//    original wrote `if (!data) continue;` and would have undercounted silently. Here the sample
//    re-waits on the selector and probes once more, and a step that still has no diagram is counted
//    and named.
//
// WHAT THE RULES ARE BLIND TO, both inherited:
//   - a packet the kit never stamped with arrivalMs has no arrival to defer to, so R3 cannot judge it
//     either way. The count is printed: it is the size of the rule's remaining blind spot.
//   - R2 compares chips POSITIONALLY, by index and name. A step that adds or removes a chip shifts
//     every key after it and the comparison silently pairs different chips. The same positional
//     weakness stage 2.3c records for reduced.test.mjs, and the same fix will serve both.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { cards } from '../fixtures/catalog.mjs';
import {
  DEFAULT_BASE, DIAGRAM, SELECTOR_TIMEOUT_MS, STEP_SETTLE_MS,
  launch, setInspect, discoverIds, openCard, stepCount, enterStep, gotoStep,
} from '../fixtures/render.mjs';

// The recorded walk. Assertions, not notes: see the header.
const EXPECTED_CARDS = 108;
const EXPECTED_STEPS = 650;

// How far off a block's bbox a route endpoint may land and still count as arriving at it, from
// check-arrival.mjs:28. Lanes stop on a FACE rather than in the middle of a block, and a lane pair is
// offset by LANE_DY (12) around the flow line, so a hit test with no tolerance would miss both.
const HIT_TOL = 16;

const probe = ({ tol }) => {
  const svg = document.querySelector('dialog.scheme-dialog svg.diagram');
  if (!svg) return null;

  // getBBox() is in the element's own user space and every primitive is a translated group, so each
  // box is mapped through the element-to-root matrix. Same mapping as the geometry tests use, and it
  // is the reason a hit test can compare a route endpoint with a block at all.
  const rootCTM = svg.getScreenCTM();
  const toRoot = (el) => {
    const b = el.getBBox();
    const m = rootCTM.inverse().multiply(el.getScreenCTM());
    const pt = (x, y) => {
      const p = svg.createSVGPoint(); p.x = x; p.y = y;
      const q = p.matrixTransform(m);
      return [q.x, q.y];
    };
    const c = [pt(b.x, b.y), pt(b.x + b.width, b.y), pt(b.x, b.y + b.height), pt(b.x + b.width, b.y + b.height)];
    const xs = c.map(p => p[0]), ys = c.map(p => p[1]);
    return { x: Math.min(...xs), y: Math.min(...ys), w: Math.max(...xs) - Math.min(...xs), h: Math.max(...ys) - Math.min(...ys) };
  };
  const label = (el, fallback) => {
    const t = el.querySelector('text');
    return (((t && t.textContent) || fallback).trim().slice(0, 28)) || fallback;
  };

  // The blocks R3 governs. A .scheme-node frame is a CONTAINER, not a receiver: a lane crosses it to
  // reach what it holds, so a frame at a route end never is the thing that received the ball.
  const blocks = [];
  for (const sel of ['.scheme-box', '.scheme-pod', '.scheme-cylinder']) {
    for (const el of svg.querySelectorAll(sel)) {
      if (el.closest('#packetLayer')) continue;
      const cs = getComputedStyle(el);
      if (cs.opacity === '0' || cs.display === 'none') continue;
      blocks.push({ kind: sel.slice(8), label: label(el, sel), ...toRoot(el), hl: el.classList.contains('highlight') });
    }
  }

  // The value chips R2 governs. Chain-ladder rows are excluded: their highlight tracks the ACTIVE
  // ROW of a ladder, it is not a value that changed.
  const chips = [];
  let ci = 0;
  for (const el of svg.querySelectorAll('.scheme-chip')) {
    if (el.closest('#packetLayer') || el.closest('.scheme-chain')) continue;
    const texts = [...el.querySelectorAll('text')].map(t => (t.textContent || '').trim());
    chips.push({
      key: `${ci++}:${texts[0] || ''}`,
      name: texts[0] || '',
      value: texts.length > 1 ? texts[texts.length - 1] : null,
      hl: el.classList.contains('highlight'),
    });
  }

  // Packets: the ends of the transform keyframe list, the delay, and the arrivalMs the kit stamped on
  // the element. Read with everything paused at t=0, so this is the step's PLAN and not its progress.
  // The delay is read alongside the route because R3 needs to know WHEN a ball departs, not only that
  // it does: "this block already acted" only excuses being lit if it acted FIRST.
  const packets = [];
  for (const el of svg.querySelectorAll('#packetLayer .scheme-packet')) {
    let frames = null, delay = 0;
    for (const a of el.getAnimations()) {
      const kf = a.effect.getKeyframes();
      if (kf.length && kf.some(k => k.transform && k.transform !== 'none')) {
        frames = kf;
        const t = a.effect.getComputedTiming();
        delay = Number.isFinite(t.delay) ? Math.round(t.delay) : 0;
        break;
      }
    }
    if (!frames) continue;
    const xy = (k) => {
      const m = /translate\(\s*(-?[\d.]+)px[, ]+\s*(-?[\d.]+)px\s*\)/.exec(k.transform || '');
      return m ? [+m[1], +m[2]] : null;
    };
    const from = xy(frames[0]), to = xy(frames[frames.length - 1]);
    if (!from || !to) continue;
    packets.push({
      from, to, delay,
      arrivalMs: Number.isFinite(el.arrivalMs) ? Math.round(el.arrivalMs) : null,
      role: el.getAttribute('data-role') || '',
    });
  }

  return { blocks, chips, packets, tol };
};

// Is point p on or inside block b, within tol?
const near = (b, p, tol) =>
  p[0] >= b.x - tol && p[0] <= b.x + b.w + tol && p[1] >= b.y - tol && p[1] <= b.y + b.h + tol;

const catalogued = await cards();

test('arrival grammar across every step (report only, census is the one assertion)', async (t) => {
  const r3 = [], r2entry = [], r2step = [], notes = [];
  const r3ByCard = new Map(), entryByCard = new Map(), stepByCard = new Map();
  let browser;
  let walked = 0, sampled = 0, unstamped = 0, judged = 0;
  let entryPairs = 0, entryChanged = 0, stepPairs = 0, stepChanged = 0, deferredCue = 0;

  try {
    browser = await launch();
    const page = await browser.newPage({ viewport: { width: 1600, height: 1000 } });
    await page.addInitScript(setInspect, 'expose');
    const ids = await discoverIds(page, DEFAULT_BASE);

    // One retry on the diagram selector, then one more probe. See harness limit 2 in the header.
    const sample = async () => {
      let d = await page.evaluate(probe, { tol: HIT_TOL });
      if (d) return d;
      await page.waitForSelector(DIAGRAM, { timeout: SELECTOR_TIMEOUT_MS });
      return page.evaluate(probe, { tol: HIT_TOL });
    };

    for (const id of ids) {
      try {
        await openCard(page, id);
        const total = await stepCount(page);
        walked++;
        let prevEntry = null, prevSettled = null;

        for (let i = 0; i < total; i++) {
          const live = await enterStep(page, i);
          if (!live && i > 0) {
            notes.push(`${id} step ${i}: no _timeline handle, the play path is not runnable and the step was skipped`);
            continue;
          }
          const data = await sample();
          if (!data) {
            notes.push(`${id} step ${i}: no svg.diagram after a retry, the step was never read`);
            continue;
          }
          sampled++;

          // The second reading of the same step: the STATIC path, where gotoStep replays with
          // ctx.reduced so every deferred branch has already run. This is the settled end state, and
          // it is the only way a frozen harness can see a cue that lands mid-step.
          await gotoStep(page, i);
          await page.waitForTimeout(STEP_SETTLE_MS);
          const settledData = await sample();
          const settled = (settledData && settledData.chips) || null;

          if (i > 0) {
            for (const pkt of data.packets) {
              // No stamp means no arrival to defer to, so R3 cannot judge this ball either way.
              // Counted rather than assumed innocent: the number is the size of the blind spot.
              if (!pkt.arrivalMs) { unstamped++; continue; }
              judged++;
              const actsFirst = (b) => data.packets.some(q => near(b, q.from, HIT_TOL) && q.delay <= pkt.delay);
              for (const b of data.blocks) {
                if (!near(b, pkt.to, HIT_TOL)) continue;
                if (actsFirst(b)) continue;      // it sent before it received: lit at entry is correct
                if (!b.hl) continue;             // dark at entry, lights on arrival: correct
                const key = `${id}|${i}|${b.label}|${b.x.toFixed(0)},${b.y.toFixed(0)}`;
                if (r3.some(l => l.key === key)) continue;
                r3.push({
                  key, id,
                  line: `${id} step ${i}  "${b.label}" (${b.kind}) is lit when the step opens and receives a packet at ${pkt.arrivalMs}ms`,
                });
                r3ByCard.set(id, (r3ByCard.get(id) || 0) + 1);
              }
            }
          }

          // R2-ENTRY: the original's exact reading, two frozen samples compared at t=0. Kept
          // verbatim so its number can be checked against the tool it replaces.
          if (prevEntry) {
            for (const c of data.chips) {
              const was = prevEntry.find(p => p.key === c.key);
              if (!was || was.value == null || c.value == null) continue;
              entryPairs++;
              if (was.value === c.value) continue;
              entryChanged++;
              if (c.hl) continue;
              const late = settled && settled.find(p => p.key === c.key);
              const deferred = !!(late && late.hl);
              if (deferred) deferredCue++;
              r2entry.push({
                id, deferred,
                line: `${id} step ${i}  [${deferred ? 'CUE LANDS LATER' : 'NO CUE IN STEP '}] chip "${c.name}" changed ` +
                  `${JSON.stringify(was.value)} to ${JSON.stringify(c.value)} with no .highlight at entry`,
              });
              entryByCard.set(id, (entryByCard.get(id) || 0) + 1);
            }
          }

          // R2-STEP: the same rule read off the SETTLED state of each step instead of its entry.
          // This is the axis that answers the canon question, and the two disagree by construction:
          // a card that turns a value over MID-step (storage-fsgroup-ownership walks a listing row by
          // row) writes the new value during step i, so a frozen entry sample first sees it at step
          // i+1, where the cue has legitimately already been shown and cleared. R2-ENTRY reports that
          // as a bare finding against the wrong step. R2-STEP does not, and it is the queue to work.
          if (prevSettled && settled) {
            for (const c of settled) {
              const was = prevSettled.find(p => p.key === c.key);
              if (!was || was.value == null || c.value == null) continue;
              stepPairs++;
              if (was.value === c.value) continue;
              stepChanged++;
              if (c.hl) continue;
              r2step.push({
                id,
                line: `${id} step ${i}  chip "${c.name}" changed ${JSON.stringify(was.value)} to ` +
                  `${JSON.stringify(c.value)} and carries no .highlight when the step has settled`,
              });
              stepByCard.set(id, (stepByCard.get(id) || 0) + 1);
            }
          }

          prevEntry = data.chips;
          if (settled) prevSettled = settled;
        }
      } catch (err) {
        notes.push(`${id}: ${err.message.split('\n')[0]}`);
      }
    }
  } catch (err) {
    notes.push(`harness: ${err.message.split('\n')[0]}`);
  } finally {
    if (browser) await browser.close();
  }

  const out = [];
  out.push('');
  out.push('===== arrival grammar, REPORT ONLY =====');
  out.push(`  cards walked ${walked} of ${catalogued.length} in the catalog, steps sampled ${sampled}`);
  out.push(`  packets judged by R3 ${judged}, packets with no arrivalMs stamp and therefore invisible to R3 ${unstamped}`);
  out.push(`  chip slots compared at entry ${entryPairs} (${entryChanged} changed), on the settled step ${stepPairs} (${stepChanged} changed)`);
  if (walked < EXPECTED_CARDS || sampled < EXPECTED_STEPS) {
    out.push(`  REPORT INCOMPLETE: expected at least ${EXPECTED_CARDS} cards and ${EXPECTED_STEPS} steps, ` +
      'every number below undercounts');
  }
  out.push('');
  out.push(`R3  lit before the ball lands: ${r3.length} finding(s) on ${r3ByCard.size} card(s)`);
  for (const f of r3) out.push('  ' + f.line);
  if (r3ByCard.size) {
    out.push('  by card:');
    for (const [id, c] of [...r3ByCard.entries()].sort((a, b) => b[1] - a[1])) out.push(`    ${String(c).padStart(3)}  ${id}`);
  }
  out.push('');
  out.push(`R2-ENTRY  the tool's own reading, both samples frozen at t=0: ${r2entry.length} finding(s) on ${entryByCard.size} card(s)`);
  out.push(`    of those, ${deferredCue} have a cue that lands later in the same step and ${r2entry.length - deferredCue} have none in that step`);
  for (const f of r2entry) out.push('  ' + f.line);
  if (entryByCard.size) {
    out.push('  by card:');
    for (const [id, c] of [...entryByCard.entries()].sort((a, b) => b[1] - a[1])) out.push(`    ${String(c).padStart(3)}  ${id}`);
  }
  out.push('');
  out.push(`R2-STEP   the same rule off the SETTLED step, which is the queue to work: ${r2step.length} finding(s) on ${stepByCard.size} card(s)`);
  for (const f of r2step) out.push('  ' + f.line);
  if (stepByCard.size) {
    out.push('  by card:');
    for (const [id, c] of [...stepByCard.entries()].sort((a, b) => b[1] - a[1])) out.push(`    ${String(c).padStart(3)}  ${id}`);
  }
  if (notes.length) {
    out.push('');
    out.push(`steps or cards that could not be read: ${notes.length}`);
    notes.slice(0, 30).forEach(l => out.push('  ' + l));
  }
  out.push('===== end of report =====');
  console.log(out.join('\n'));

  // The one assertion. Everything above is a measurement whose acceptance belongs to a person; a
  // walk that covered less than the catalog is not a measurement at all.
  assert.ok(walked >= EXPECTED_CARDS,
    `walked ${walked} card(s), the catalog had ${EXPECTED_CARDS} when this report was written. ` +
    'A report over a subset prints few findings and looks exactly like a clean catalog.');
  assert.ok(sampled >= EXPECTED_STEPS,
    `sampled ${sampled} step(s), expected at least ${EXPECTED_STEPS}. A step nobody entered is a ` +
    'step whose arrival cue was never read, and this file would still print a number.');

  t.diagnostic(`arrival: ${walked} cards, ${sampled} steps, R3 ${r3.length}, ` +
    `R2-ENTRY ${r2entry.length}, R2-STEP ${r2step.length}`);
});
