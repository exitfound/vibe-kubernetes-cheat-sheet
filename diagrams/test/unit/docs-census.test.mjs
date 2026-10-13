// The README headline counts match the catalog. Fix a failure with `npm run docs:sync`.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { CLAIMS, DOCS, asNumber, flat } from '../fixtures/census.mjs';

test('CENSUS every count the README states is the count the tree holds', () => {
  const bad = [];
  for (const claim of CLAIMS) {
    const m = claim.re.exec(flat(DOCS.get(claim.doc)));
    if (!m) { bad.push(`${claim.label}: sentence not found, pattern ${claim.re}`); continue; }
    const got = m.slice(1).map(asNumber), want = claim.want();
    if (got.some((n, i) => n !== want[i])) bad.push(`${claim.label}: says [${got}], tree holds [${want}]`);
  }
  assert.deepEqual(bad, []);
});
