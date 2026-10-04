// chip-beat.mjs: the four P-03 forms, computed ONCE for the two files that read them. The walk, the
// forms, the carried table and the recorded census floor all live here, and neither reader owns a
// copy of any of them.
//
// WHO USES IT, and why the split is what it is:
//   ../report/chip-beat.test.mjs  prints all four forms as a queue a person rules on, and fails only
//                                 on the census. FORM-A and FORM-B are open queues.
//   ../unit/chip-beat-e.test.mjs  turns FORM-E into a verdict: an E record outside E_CARRIED is a
//                                 red gate, which is what promotion into `npm test` MEANS.
//
// WHY A FIXTURE AND NOT A HELPER INSIDE EITHER OF THEM. A test file that imported another test file
// would REGISTER that file's tests a second time, so the report cannot be the gate's library and the
// gate cannot be the report's. What is left is a shared module, and the alternative to it is two
// implementations of "what a FORM-E record is": the day one of them learns that `F.anim` moves a
// ball, the gate and the report describe two different catalogues and both look green. That drift is
// exactly what ./spec.mjs was pulled together to end, one layer down, and the note at the top of it
// tells the story of the three readers of one regex that had already parted.
//
// WHY HERE AND NOT INSIDE ./spec.mjs. That file answers questions about ONE step or ONE scene, holds
// no opinion about any card, and knows nothing of the catalogue: every function in it takes a spec
// and returns a reading of it. This one walks the whole catalogue and returns a JUDGEMENT (four named
// populations, one of them a failure class). Those are two layers, and the reason to keep them apart
// is practical rather than tidy: ./spec.mjs is imported by four mandatory checks that have nothing to
// do with P-03, and a walk of the whole catalogue does not belong in their import graph.
//
// THE KIT IS IMPORTED HERE, not passed in as ./spec.mjs takes it. That fixture states its reason
// (it stays importable without the kit, and its callers time flows against different questions);
// this one cannot do its job without the arrival arithmetic at all, so an argument would only be a
// way for two callers to hand it two different constants.
//
// WHAT IT IS BLIND TO is the subject of both readers and is written out in full in the header of
// ../report/chip-beat.test.mjs: whether the arrival EARNS the value, `enter(s, ctx)` bodies, the
// four cards whose cue is not a highlight, WHICH packet earns which chip, and `anim` and `tag`,
// which are not counted as balls. The short version of all five: this module reads the SHAPE of the
// data, and P-06 is the reason no field in the data says which shape is correct.

import { cards } from './catalog.mjs';
import { carriedMap, carryKey, staleKeys } from './carried.mjs';
import { importAll } from './module.mjs';
import { entryChips, settledChips, staticChips, timelineOf } from './spec.mjs';
import { routeDur, REVEAL_MS, BEAT } from '../../js/lib/scheme-kit.js';

// The walk is asserted by both readers: a walk over a subset finds few E records and looks exactly
// like a clean catalogue, and a walk one step short drops that step silently with nothing in the
// output looking wrong. The two numbers it is judged against are DERIVED, never typed here: the
// card count off the catalog the reader already walks, the step count off `stepTotal()` in
// ./module.mjs. See CATALOG_BASELINE in ./catalog.mjs.

// The kit constants the fixture's arrival arithmetic runs on.
const KIT = { routeDur, REVEAL_MS, BEAT };

// The verbs that put a BALL on the wire. pulse, set, light, run, fade, reveal and anim move no
// packet, and tag rides one rather than being one, so a step made only of those has no arrival for a
// chip to run ahead of and is not a candidate at all.
const PACKET_VERBS = new Set(['route', 'segment', 'top']);

// The lead at or past which a FORM-B record is also counted as FORM-B-LEAD.
const LEAD_CUT_MS = 1500;

// -------------------------------------------------------------------------------------------
// FORM-E entries a human has READ and decided to carry, keyed `<card id> <step id> <chip key>`.
// THE ENTRIES THEMSELVES LIVE IN ./carried.mjs, the one store for a report finding somebody has
// ruled on and kept: this is the axis view of it, under the name the two readers already import.
// Add a ruling THERE, as `{ axis: 'FORM-E', card, where: [stepId, chipKey], why }`, and it appears
// here with no other edit. ../unit/chip-beat-e.test.mjs still names this file, and this is where
// the export is.
//
// IT IS AN AXIS VIEW BECAUSE BOTH READERS NEED IT AND THEY NEED THE SAME ONE. The report marks a
// carried record CARRIED and prints its reason; the gate treats the same record as not-a-failure.
// Two copies would mean a finding carried in one file and red in the other, which is the worst of
// the shapes this table can take. Its own shape (a reason on every entry, three fields in every
// key) is asserted by ../unit/chip-beat-e.test.mjs, where a broken table has to be able to go red.
// -------------------------------------------------------------------------------------------
export const E_CARRIED = carriedMap('FORM-E');

// FORM-B has no gate and its queue runs to hundreds, so a carried row here says a person read a
// high-ranked row and kept it. Same store, same key shape, no assertion behind it.
const B_CARRIED = carriedMap('FORM-B');

// -------------------------------------------------------------------------------------------
// THE WALK. One pass over the catalogue, and the only place the four forms are defined.
//
//   FORM-A       step i > 0, the flow carries a packet, the chip's ENTRY value (chips + chipsCued
//                + rewind) differs from the previous step's SETTLED value, and no F.set with a
//                positive delay turns that key over in this step. The naive form, which P-06 puts
//                inside the rules, so it is counted and never judged.
//   FORM-B       FORM-A, and the step names that chip in `lit`, so the CARD ITSELF declares the
//                value to be the news of this step.
//   FORM-B-LEAD  FORM-B with a first arrival at or past LEAD_CUT_MS.
//   FORM-E       FORM-B, and ANOTHER chip on the SAME step IS turned over on a beat (an F.set with
//                a delay). The card knows the technique and applied it to a neighbour, which is
//                the shape P-04 calls worse than doing neither.
//
// One record object is pushed into every form it satisfies, so A, B and E share objects by identity
// and `neighbours` on an E record is the beat-bound set of that same step.
// -------------------------------------------------------------------------------------------
function chipBeatForms(catalogued, modules) {
  const A = [], B = [], E = [];
  const divergent = [];          // the second hole: static path and animated path end on different text
  const notes = [];
  let walked = 0, steps = 0, candidateSteps = 0, compared = 0, unresolved = 0;

  for (const c of catalogued) {
    const ns = modules.get(c.id);
    if (!ns || !Array.isArray(ns.STEPS_SPEC)) {
      notes.push(`${c.id}: exports no STEPS_SPEC array, so this card was never read`);
      continue;
    }
    walked++;
    const spec = ns.STEPS_SPEC;

    for (let i = 0; i < spec.length; i++) {
      const s = spec[i];
      steps++;

      // Measured on the way past: a key whose static value is not where the animated path leaves
      // it. Every step, not only a candidate one, since the divergence has nothing to do with
      // packets. It is the hole an F.set repair opens, and the report's section 4 prints it.
      const stat = staticChips(s), settled = settledChips(s, KIT);
      for (const k of Object.keys(stat)) {
        if (settled[k] !== stat[k]) {
          divergent.push({
            card: c.id,
            line: `${c.id} '${s.id}' chip "${k}": the static path ends on ${JSON.stringify(stat[k])}, ` +
              `the animated path on ${JSON.stringify(settled[k])}`,
          });
        }
      }

      if (i === 0) continue;      // the poster carries no flow by construction (S-09)

      const rows = timelineOf(s.flow, KIT);
      if (rows === null) { unresolved++; continue; }   // unit/spec-steps.test.mjs owns that finding
      const balls = rows.filter(r => PACKET_VERBS.has(r.verb));
      if (!balls.length) continue;
      candidateSteps++;

      // The lead: the first moment ANY ball of this step lands. A value on screen before this had
      // nothing to arrive for it.
      const lead = Math.min(...balls.map(r => r.arrival));

      // Keys this step turns over ON A BEAT, which is the technique P-03 asks for. A key here is
      // doing the right thing and is not a candidate; the SAME set is what makes a neighbour's
      // failure form E.
      const onBeat = new Set();
      for (const r of rows) {
        if (r.verb !== 'set' || !(r.delay > 0)) continue;
        for (const k of [...Object.keys(r.p.chips || {}), ...Object.keys(r.p.chipsCued || {})]) onBeat.add(k);
      }

      const now = entryChips(s);
      const before = settledChips(spec[i - 1], KIT);
      const lit = new Set(s.lit || []);

      for (const k of Object.keys(now)) {
        // A key the previous step does not state cannot be compared. P-01 makes that empty today
        // (every step of a card writes the same chip set) and it stays guarded rather than assumed.
        if (!(k in before)) continue;
        compared++;
        if (before[k] === now[k]) continue;
        if (onBeat.has(k)) continue;

        const rec = {
          card: c.id, step: `${c.id}#${i}`, i, stepId: s.id, key: k,
          from: before[k], to: now[k], lead,
          neighbours: [...onBeat].filter(x => x !== k),
        };
        A.push(rec);
        if (!lit.has(k)) continue;           // the card does not call this value the news: A only
        // One key serves both forms, because an E record IS a B record with a neighbour on a beat.
        rec.carryKey = carryKey(c.id, [s.id, k]);
        B.push(rec);
        if (rec.neighbours.length) {
          rec.why = E_CARRIED.get(rec.carryKey);
          E.push(rec);
        } else {
          rec.bWhy = B_CARRIED.get(rec.carryKey);
        }
      }
    }
  }

  const bLead = B.filter(r => r.lead >= LEAD_CUT_MS);
  const eOpen = E.filter(r => !r.why), eHeld = E.filter(r => r.why);
  const stale = staleKeys('FORM-E', E.map(r => r.carryKey));
  // A FORM-B row is carried only where it is NOT also FORM-E: E is the narrower reading of the same
  // record and owns it, so a ruling written on both axes would be printed twice and counted twice.
  const bOpen = B.filter(r => !r.neighbours.length && !r.bWhy), bHeld = B.filter(r => r.bWhy);
  const bStale = staleKeys('FORM-B', B.filter(r => !r.neighbours.length).map(r => r.carryKey));

  return {
    A, B, bLead, bOpen, bHeld, bStale, E, eOpen, eHeld, divergent, notes, stale,
    walked, steps, candidateSteps, compared, unresolved,
    catalogSize: catalogued.length,
  };
}

// The same walk with its two inputs loaded, for a caller that wants the forms and nothing else.
// Both readers use it, so both read one catalogue and one set of modules.
export async function chipBeat() {
  return chipBeatForms(await cards(), await importAll());
}
