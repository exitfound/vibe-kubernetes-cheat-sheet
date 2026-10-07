// The four P-03 forms, computed once for the chip-beat report and the FORM-E gate in
// ../unit/chip-beat-e.test.mjs. Imports the kit itself, since it cannot work without the arrival
// arithmetic. Blind spots are listed in ../report/chip-beat.test.mjs.

import { cards } from './catalog.mjs';
import { carriedMap, carryKey, staleKeys } from './carried.mjs';
import { importAll } from './module.mjs';
import { entryChips, settledChips, staticChips, timelineOf } from './spec.mjs';
import { routeDur, REVEAL_MS, BEAT } from '../../js/lib/scheme-kit.js';

// Both readers assert the walk against derived counts, never typed here.

const KIT = { routeDur, REVEAL_MS, BEAT };

// Only these put a ball on the wire, and a tag rides one.
const PACKET_VERBS = new Set(['route', 'segment', 'top']);

const LEAD_CUT_MS = 1500;

// FORM-E rulings, stored in ./carried.mjs and read by both the report and the gate, which asserts its shape.
export const E_CARRIED = carriedMap('FORM-E');

// FORM-B has no gate, so a carried row here has no assertion behind it.
const B_CARRIED = carriedMap('FORM-B');

// The only place the forms are defined (see the report header). One record object is pushed into every
// form it satisfies, so `neighbours` on an E record is the beat-bound set of that step.
function chipBeatForms(catalogued, modules) {
  const A = [], B = [], E = [];
  const divergent = [];          // static path and animated path end on different text
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

      // Every step: a key whose static value is not where the animated path leaves it (report section 4).
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

      // The first moment any ball of this step lands.
      const lead = Math.min(...balls.map(r => r.arrival));

      // Keys turned over on a beat are doing it right, and make a neighbour's failure FORM-E.
      const onBeat = new Set();
      for (const r of rows) {
        if (r.verb !== 'set' || !(r.delay > 0)) continue;
        for (const k of [...Object.keys(r.p.chips || {}), ...Object.keys(r.p.chipsCued || {})]) onBeat.add(k);
      }

      const now = entryChips(s);
      const before = settledChips(spec[i - 1], KIT);
      const lit = new Set(s.lit || []);

      for (const k of Object.keys(now)) {
        // P-01 makes this empty today, guarded rather than assumed.
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
        // An E record is a B record with a neighbour on a beat, so one key serves both.
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
  // FORM-E owns a record that is both, so it is never carried as FORM-B.
  const bOpen = B.filter(r => !r.neighbours.length && !r.bWhy), bHeld = B.filter(r => r.bWhy);
  const bStale = staleKeys('FORM-B', B.filter(r => !r.neighbours.length).map(r => r.carryKey));

  return {
    A, B, bLead, bOpen, bHeld, bStale, E, eOpen, eHeld, divergent, notes, stale,
    walked, steps, candidateSteps, compared, unresolved,
    catalogSize: catalogued.length,
  };
}

export async function chipBeat() {
  return chipBeatForms(await cards(), await importAll());
}
