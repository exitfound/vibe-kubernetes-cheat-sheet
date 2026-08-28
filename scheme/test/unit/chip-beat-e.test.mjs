// chip-beat-e.test.mjs: FORM-E of P-03, as a VERDICT. One class only, and it is the narrowest one
// the data can name: a step where at least one chip waits for a beat (an F.set with a delay) and
// ANOTHER chip on that same step states its value at entry, before any ball of the step has landed.
// The card knows the technique and applied it next door, which is the shape P-04 calls worse than
// doing it to neither.
//
// ===========================================================================================
// WHY THIS IS MANDATORY AND ITS THREE SIBLINGS ARE NOT
// ===========================================================================================
// The cycle is written in ../report/arrival.test.mjs and this project has run it three times:
// report-only, then a human triage of the queue, then promotion into the mandatory set. FORM-E
// reached the end of it. Its queue was read card by card: every finding carried with a written
// reason in E_CARRIED, none left to work. A check goes into `npm test` only from that state, because
// a check that reddens the gate on a queue nobody has read makes work impossible rather than
// visible.
//
// The other three forms stay in ../report/chip-beat.test.mjs and their SIZE is the whole argument:
// FORM-A and FORM-B run to hundreds of records over most of the catalogue, and section 4's path
// divergence is open beside them. Any of them promoted today would redden the gate against work
// nobody has scheduled. `npm run report` prints the three populations live.
//
// ===========================================================================================
// WHERE THE ANSWER COMES FROM
// ===========================================================================================
// ../fixtures/chip-beat.mjs, which is also what the report reads. The walk, the four form
// definitions, the census floor and E_CARRIED are all there and exist ONCE: a second implementation
// of "what a FORM-E record is" would let this file and the report describe two different catalogues
// while both stayed green, and the day one of them learned a new packet verb they would disagree
// about which card is broken. That fixture's header carries the rest of the argument.
//
// It needs no browser: a route's flight time is geometry and a step's chip values are fields, so
// both halves of the question are in the spec. That is why this is unit/ and not render/.
//
// ===========================================================================================
// WHAT FAILS HERE, AND WHAT A FAILURE MEANS
// ===========================================================================================
//   FORM-E   a record whose key is not in E_CARRIED. Two honest ways to close one: turn the chip
//            over on the beat that earns it (`rewind` plus an F.set at the arrival, NOT an F.set
//            alone, which opens the divergence section 4 of the report counts), or read the card,
//            decide the value is the PREMISE of the step rather than something an arrival produces,
//            and write that reason into E_CARRIED. An entry with no reason is not a decision.
//   census   fewer than the recorded cards or steps. A walk over a subset finds no FORM-E record and
//            looks exactly like a clean catalogue: a walk one step short drops that step silently
//            and nothing in the output looks wrong. Every walker in this harness carries the same
//            floor.
//   table    a carried entry with no reason, a key that is not three fields, or a key that no longer
//            matches any finding. The last one is a stale carry: the finding was repaired and the
//            table still claims it. It is loud on purpose, and the fix is one line.
//
// ===========================================================================================
// WHAT THIS FILE IS BLIND TO
// ===========================================================================================
//   - WHETHER THE ARRIVAL EARNS THE VALUE, which is the actual subject of P-03. No field on a step
//     declares it, so this file judges the SHAPE of the data only, and the shape is a verdict solely
//     because the neighbour chip proves the technique is available on the card. That is why FORM-A and
//     FORM-B, which lack the neighbour, cannot be promoted with the same argument.
//   - Every blind spot of the walk itself, written out in full in the header of
//     ../report/chip-beat.test.mjs: `enter(s, ctx)` bodies, cues that are not highlights, WHICH
//     packet earns which chip, and `anim` and `tag`, which are not counted as balls.
//   - The three other forms. A card can be repaired for FORM-E and leave its FORM-B lead untouched,
//     and this file will not say so. Run `npm run report` for the queue.
//   - Whether a REASON in E_CARRIED is true. It is prose, and only its presence is machine-checkable.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { cards } from '../fixtures/catalog.mjs';
import { stepTotal } from '../fixtures/module.mjs';
import { chipBeat, E_CARRIED } from '../fixtures/chip-beat.mjs';

// The walk baseline, DERIVED rather than typed: the catalog it walks and the specs it reads are
// what say how big a whole walk is (CATALOG_BASELINE in ../fixtures/catalog.mjs).
const EXPECTED_CARDS = (await cards()).length;
const EXPECTED_STEPS = await stepTotal();


const FORMS = await chipBeat();

test('FORM-E: a chip states its value at entry while its neighbour waits for a beat', () => {
  // The census first. An empty finding list off a short walk is the one failure that looks like a
  // pass, so it is asserted BEFORE the verdict rather than after it.
  assert.ok(FORMS.walked >= EXPECTED_CARDS,
    `walked ${FORMS.walked} card(s) of the ${FORMS.catalogSize} in the catalog, floor ${EXPECTED_CARDS}. ` +
    'A walk over a subset finds no FORM-E record and looks exactly like a clean catalogue.');
  assert.ok(FORMS.steps >= EXPECTED_STEPS,
    `read ${FORMS.steps} step(s), floor ${EXPECTED_STEPS}. A step nobody read is a step whose chip ` +
    'turnover was never timed, and this check would still pass.');
  assert.ok(FORMS.compared > 0,
    'not one chip slot was compared against the previous step, so the form measured an empty set. ' +
    'Either the chip resolution has gone blind or no step carries a ball.');

  const lines = FORMS.eOpen.map(r =>
    `${r.card} step ${r.i} '${r.stepId}'  chip "${r.key}" reads ${JSON.stringify(r.to)} at entry ` +
    `(was ${JSON.stringify(r.from)}), ${r.lead}ms before the first arrival of the step, while ` +
    `[${r.neighbours.join(', ')}] on this same step wait for their beat`);
  assert.deepEqual(lines, [],
    `${lines.length} FORM-E finding(s), P-03 and P-04:\n  ${lines.join('\n  ')}\n` +
    'Each step above already turns another chip over on a beat, so the card has the technique and ' +
    'applied it to the neighbour only. Bind the chip to the arrival that earns it (rewind plus an ' +
    'F.set at that arrival, not an F.set alone: see section 4 of report/chip-beat.test.mjs), or read ' +
    'the card and carry it in E_CARRIED in fixtures/chip-beat.mjs with the reason it is the premise ' +
    'of the step rather than something an arrival produces.');
});

test('FORM-E: every carried entry is a decision, and none of them is stale', () => {
  const bad = [];
  for (const [key, why] of E_CARRIED) {
    if (key.split(' ').length !== 3) {
      bad.push(`E_CARRIED key '${key}' is not '<card id> <step id> <chip key>', so it can never ` +
        'match a finding and carries nothing');
    }
    if (typeof why !== 'string' || why.trim().length <= 20) {
      bad.push(`E_CARRIED['${key}'] carries no reason. A carried finding is a decision somebody ` +
        'measured, and without the reason it is only a shorter queue');
    }
  }
  assert.deepEqual(bad, [], `${bad.length} problem(s) in the carried table:\n  ${bad.join('\n  ')}`);
  assert.deepEqual(FORMS.stale, [],
    `${FORMS.stale.length} carried entry(ies) no longer match any FORM-E record: ` +
    `${FORMS.stale.join(' | ')}. The finding was repaired or the card was renamed, and the table ` +
    'still claims it. Remove the entry: a carry nothing matches quietly widens what the next one ' +
    'would forgive. An empty table is a legitimate end state, reached by repairing every one.');
});
