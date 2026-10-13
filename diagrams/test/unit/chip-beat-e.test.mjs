// FORM-E of P-03, gated: a step where one chip waits for a beat while another states its value at
// entry. Close one with `rewind` plus an F.set at the arrival, or a reason in E_CARRIED. Also fails
// on the census and on a carried entry with no reason or no matching finding.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { cards } from '../fixtures/catalog.mjs';
import { stepTotal } from '../fixtures/module.mjs';
import { chipBeat, E_CARRIED } from '../fixtures/chip-beat.mjs';

const EXPECTED_CARDS = (await cards()).length;
const EXPECTED_STEPS = await stepTotal();

const FORMS = await chipBeat();

test('FORM-E: a chip states its value at entry while its neighbour waits for a beat', () => {
  // Census before the verdict: an empty finding list off a short walk looks like a pass.
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
