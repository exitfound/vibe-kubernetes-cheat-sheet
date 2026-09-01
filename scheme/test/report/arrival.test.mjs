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
// ALL THREE AXES CARRY RULINGS, and none of them hides one. A finding somebody has read and decided
// to keep is filed in ../fixtures/carried.mjs against its axis, and this file then prints it marked
// CARRIED with the reason attached and counts it apart from the rows still to work. Two guards come
// with that store and both print here: a ruling with no reason or naming no catalogued card is
// reported as BROKEN, and a ruling that matches no finding on this walk is reported as stale,
// because a rule that stopped firing means the card moved under the ruling.
//
// WHY THIS FILE NEVER FAILS ON A FINDING. Both rules find things today, and every one of them is a
// statement about a CARD, not about the harness. The project already runs the cycle "report-only,
// then triage, then promote into the mandatory set" (the ENFORCED sets in check-canon.mjs:78 and
// check-reduced.mjs:25 are the same idea). Promoting either rule before its findings have been read
// would turn one measurement into a red gate for work nobody has scheduled. So the findings print
// and the run stays green.
//
// WHAT DOES FAIL HERE, and it is the only thing that does: the CENSUS. A report that scanned nothing
// prints no findings and looks exactly like a clean catalog. Fewer cards or steps than the catalog
// holds is therefore an assertion failure, not a note. The lesson was paid for once: the first run
// of a report test came back one step short and nothing about the output looked wrong.
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
//      R2-STEP   settled against settled, which is what the rule actually asks. This is the queue,
//                and the rulings a human has read and kept live in ../fixtures/carried.mjs, keyed
//                `<card id> <step index> <chip name>`, with the reason on each. All seven carried
//                today are one class: the chip's TEXT changed while the FACT it reports did not.
//                Anything outside that table is work.
//    They disagree, and the disagreement is the point: a rule can be reported faithfully and still
//    be reading the wrong frame.
//
// 2. THE PROBE CAN CATCH A STEP WITH NO DIAGRAM. Scene.build() empties the host and
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
import { cards, SUBSET } from '../fixtures/catalog.mjs';
import { carriedBlock, carriedMap, carryKey, shapeProblems, staleKeys } from '../fixtures/carried.mjs';
import { stepTotal } from '../fixtures/module.mjs';
import { readSnapshot } from '../fixtures/snapshot.mjs';
import { HIT_TOL, vpName, VIEWPORTS } from '../tools/walk.mjs';

// The viewport the walk takes both readings at, named rather than retyped.
const VP = vpName(VIEWPORTS[0]);

// The recorded walk. Assertions, not notes: see the header.
// The walk baseline, DERIVED rather than typed: the catalog it walks and the specs it reads are
// what say how big a whole walk is (CATALOG_BASELINE in ../fixtures/catalog.mjs).
const EXPECTED_CARDS = (await cards()).length;
const EXPECTED_STEPS = await stepTotal();

// How far off a block's bbox a route endpoint may land and still count as arriving at it, from
// check-arrival.mjs:28. Lanes stop on a FACE rather than in the middle of a block, and a lane pair is
// offset by LANE_DY (12) around the flow line, so a hit test with no tolerance would miss both.
// HIT_TOL is declared in tools/walk.mjs, beside the pass that applies it, and imported above:
// a tolerance typed in two places is two tolerances.


// Is point p on or inside block b, within tol?
const near = (b, p, tol) =>
  p[0] >= b.x - tol && p[0] <= b.x + b.w + tol && p[1] >= b.y - tol && p[1] <= b.y + b.h + tol;

const catalogued = await cards();

// The three axes of this file that carry rulings, keyed `<card id> <step index> <chip name>` for the
// two R2 axes and `<card id> <step index> <block label>` for R3. THE ENTRIES LIVE IN
// ../fixtures/carried.mjs, the one store for a report finding somebody has ruled on and kept, and
// these are its axis views. `R2_STEP_CARRIED` keeps its name because CANON.md P-09a cites it.
//
// All seven R2-STEP rulings are ONE class: the chip TEXT changed while the FACT it reports did not,
// so a cue would announce a change that did not happen. R2-ENTRY is a different class, almost
// entirely the frozen-sampling artefact this file documents in its own header. Anything outside
// either table is the queue to work.
const R2_STEP_CARRIED = carriedMap('R2-STEP');
const R2_ENTRY_CARRIED = carriedMap('R2-ENTRY');
const R3_CARRIED = carriedMap('R3');

test('arrival grammar across every step (report only, census is the one assertion)', async (t) => {
  const r3 = [], r2entry = [], r2step = [], notes = [];
  const r3ByCard = new Map(), entryByCard = new Map(), stepByCard = new Map();
  let walked = 0, sampled = 0, unstamped = 0, judged = 0;
  let entryPairs = 0, entryChanged = 0, stepPairs = 0, stepChanged = 0, deferredCue = 0;

  try {
    // THE BROWSER IS NOT DRIVEN HERE ANY MORE. `tools/walk.mjs` takes both readings of every step at
    // 1600x1000, the viewport this file set: the PLAYED one at t=0 in its played pass, and the
    // SETTLED one in its static pass, where gotoStep replays with ctx.reduced so every deferred
    // branch has already run. The probe moved to fixtures/probes.mjs as `arrivalProbe`, verbatim,
    // and the one-retry `sample()` is part of both passes.
    const snap = readSnapshot();
    const ids = snap.ids;

    for (const id of ids) {
      try {
        const card = snap.cards[id];
        const total = card.steps;
        walked++;
        let prevEntry = null, prevSettled = null;

        for (let i = 0; i < total; i++) {
          const { live, arrival: data } = card.played[i];
          if (!live && i > 0) {
            notes.push(`${id} step ${i}: no _timeline handle, the play path is not runnable and the step was skipped`);
            continue;
          }
          if (!data) {
            notes.push(`${id} step ${i}: no svg.diagram after a retry, the step was never read`);
            continue;
          }
          sampled++;

          const settledData = card.byVp[VP][i].arrival;
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
                // The CARRY key drops the coordinates the de-dup key needs: a ruling must survive a
                // block moving a few units, and the label plus the step already pin one row.
                const carry = carryKey(id, [String(i), b.label]);
                r3.push({
                  key, id, carryKey: carry, why: R3_CARRIED.get(carry),
                  line: `${id} step ${i}  "${b.label}" (${b.kind}) is lit when the step opens and receives a packet at ${pkt.arrivalMs}ms`,
                });
                if (!R3_CARRIED.has(carry)) r3ByCard.set(id, (r3ByCard.get(id) || 0) + 1);
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
              const carry = carryKey(id, [String(i), c.name]);
              const why = R2_ENTRY_CARRIED.get(carry);
              r2entry.push({
                id, deferred, carryKey: carry, why,
                line: `${id} step ${i}  [${deferred ? 'CUE LANDS LATER' : 'NO CUE IN STEP '}] chip "${c.name}" changed ` +
                  `${JSON.stringify(was.value)} to ${JSON.stringify(c.value)} with no .highlight at entry`,
              });
              if (!why) entryByCard.set(id, (entryByCard.get(id) || 0) + 1);
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
              const key = carryKey(id, [String(i), c.name]);
              const why = R2_STEP_CARRIED.get(key);
              r2step.push({
                id,
                key,
                why,
                line: `${id} step ${i}  chip "${c.name}" changed ${JSON.stringify(was.value)} to ` +
                  `${JSON.stringify(c.value)} and carries no .highlight when the step has settled`,
              });
              if (!why) stepByCard.set(id, (stepByCard.get(id) || 0) + 1);
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
  }

  const out = [];
  out.push('');
  out.push('===== arrival grammar, REPORT ONLY =====');
  out.push(`  cards walked ${walked} of ${catalogued.length} in the catalog, steps sampled ${sampled}`);
  out.push(`  packets judged by R3 ${judged}, packets with no arrivalMs stamp and therefore invisible to R3 ${unstamped}`);
  out.push(`  chip slots compared at entry ${entryPairs} (${entryChanged} changed), on the settled step ${stepPairs} (${stepChanged} changed)`);
  if (SUBSET) {
    out.push(`  SUBSET: SCHEME_IDS restricted the walk to ${walked} card(s), so the census below is NOT`);
    out.push('  asked. Every per-card row is as true as on a full run: R3 and the two R2 axes judge a');
    out.push('  ball against its own step and never against the catalog. The TOTALS and the queue');
    out.push('  lengths are only the walked cards, and a full run is what says how many the catalog holds.');
  } else if (walked < EXPECTED_CARDS || sampled < EXPECTED_STEPS) {
    out.push(`  REPORT INCOMPLETE: expected at least ${EXPECTED_CARDS} cards and ${EXPECTED_STEPS} steps, ` +
      'every number below undercounts');
  }
  // Every axis below prints the same two-tier shape: the rows still to work, then the rows a person
  // read and kept, marked CARRIED with the reason. The two counts are never added together.
  out.push('');
  const r3open = r3.filter(f => !f.why), r3held = r3.filter(f => f.why);
  out.push(`R3  lit before the ball lands: ${r3.length} finding(s), ` +
    `${r3held.length} carried with a reason, ${r3open.length} left to work on ${r3ByCard.size} card(s)`);
  for (const f of r3open) out.push('  ' + f.line);
  if (r3ByCard.size) {
    out.push('  by card:');
    for (const [id, c] of [...r3ByCard.entries()].sort((a, b) => b[1] - a[1])) out.push(`    ${String(c).padStart(3)}  ${id}`);
  }
  for (const l of carriedBlock('R3', r3held.map(f => ({ key: f.carryKey, why: f.why })),
    staleKeys('R3', r3.map(f => f.carryKey)), '  ')) out.push(l);

  out.push('');
  const entryOpen = r2entry.filter(f => !f.why), entryHeld = r2entry.filter(f => f.why);
  out.push(`R2-ENTRY  the tool's own reading, both samples frozen at t=0: ${r2entry.length} finding(s), ` +
    `${entryHeld.length} carried with a reason, ${entryOpen.length} left to work on ${entryByCard.size} card(s)`);
  out.push(`    of those, ${deferredCue} have a cue that lands later in the same step and ${r2entry.length - deferredCue} have none in that step`);
  for (const f of entryOpen) out.push('  ' + f.line);
  if (entryByCard.size) {
    out.push('  by card:');
    for (const [id, c] of [...entryByCard.entries()].sort((a, b) => b[1] - a[1])) out.push(`    ${String(c).padStart(3)}  ${id}`);
  }
  for (const l of carriedBlock('R2-ENTRY', entryHeld.map(f => ({ key: f.carryKey, why: f.why })),
    staleKeys('R2-ENTRY', r2entry.map(f => f.carryKey)), '  ')) out.push(l);
  out.push('');
  const open = r2step.filter(f => !f.why), held = r2step.filter(f => f.why);
  out.push(`R2-STEP   the same rule off the SETTLED step: ${r2step.length} finding(s), ` +
    `${held.length} carried with a reason, ${open.length} left to work on ${stepByCard.size} card(s)`);
  if (open.length) {
    out.push('  the queue to work:');
    for (const f of open) out.push('    ' + f.line);
    out.push('  by card:');
    for (const [id, c] of [...stepByCard.entries()].sort((a, b) => b[1] - a[1])) out.push(`    ${String(c).padStart(3)}  ${id}`);
  }
  if (held.length) out.push('  carried, text changed and the fact did not:');
  for (const l of carriedBlock('R2-STEP', held.map(f => ({ key: f.key, why: f.why, line: f.line })),
    staleKeys('R2-STEP', r2step.map(f => f.key)), '    ')) out.push(l);

  // The store's own shape, printed rather than asserted: a suppression with no reason or naming no
  // catalogued card is a broken RULING, and this file fails on the census alone.
  const ids = new Set(catalogued.map(c => c.id));
  const broken = ['R3', 'R2-ENTRY', 'R2-STEP'].flatMap(a => shapeProblems(a, ids));
  if (broken.length) {
    out.push('');
    out.push(`BROKEN RULINGS in fixtures/carried.mjs: ${broken.length}`);
    for (const b of broken) out.push('  ' + b);
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
  //
  // NOT ASKED under SCHEME_IDS, and skipped rather than failed. The statement it makes is true
  // either way, and it is the reason the SUBSET banner above exists: a filtered run of this file
  // proves nothing catalog-wide. But an intentionally narrowed run is not a broken one, and the
  // rest of the suite says so with `floor()` and `FULL_ONLY` instead of a red line. A red line on
  // the CHEAP path is worse than useless: it is what sends a reader back to the six-minute run to
  // find out whether anything is actually wrong.
  if (!SUBSET) {
    assert.ok(walked >= EXPECTED_CARDS,
      `walked ${walked} card(s), the catalog had ${EXPECTED_CARDS} when this report was written. ` +
      'A report over a subset prints few findings and looks exactly like a clean catalog.');
    assert.ok(sampled >= EXPECTED_STEPS,
      `sampled ${sampled} step(s), expected at least ${EXPECTED_STEPS}. A step nobody entered is a ` +
      'step whose arrival cue was never read, and this file would still print a number.');
  }

  t.diagnostic(`arrival: ${walked} cards, ${sampled} steps, ` +
    `R3 ${r3.length} (${r3.filter(f => !f.why).length} unexplained), ` +
    `R2-ENTRY ${r2entry.length} (${r2entry.filter(f => !f.why).length} unexplained), ` +
    `R2-STEP ${r2step.length} (${r2step.filter(f => !f.why).length} unexplained)`);
});
