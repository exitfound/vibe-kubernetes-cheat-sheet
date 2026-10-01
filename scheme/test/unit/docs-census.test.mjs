// docs-census.test.mjs: is every COUNT a document states still the count the tree holds? `S-49`.
//
// The census, the claim registry and the document reads are `../fixtures/census.mjs`, because
// `tools/docs-sync.mjs` writes the numbers this file asserts and the two must never hold two
// copies of the registry. What stays here is the two assertions, and they are the whole point:
// printing a count is not checking it.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { ROOT } from '../fixtures/catalog.mjs';
import { CATS, CLAIMS, CLAIM_FLOOR, DOCS, asNumber, flat, folder } from '../fixtures/census.mjs';

test('CENSUS every count a document states is the count the tree holds', () => {
  assert.ok(CLAIMS.length >= CLAIM_FLOOR,
    `only ${CLAIMS.length} claim(s) in the registry, floor ${CLAIM_FLOOR}. A registry that stops ` +
    'holding claims passes by finding nothing to check.');

  const missing = [];
  const wrong = [];
  for (const claim of CLAIMS) {
    const text = flat(DOCS.get(claim.doc));
    const m = claim.re.exec(text);
    if (!m) {
      missing.push(`${claim.doc}  ${claim.label}\n      pattern: ${claim.re}`);
      continue;
    }
    const got = m.slice(1).map(asNumber);
    const want = claim.want();
    if (got.length !== want.length || got.some((n, i) => n !== want[i])) {
      wrong.push(
        `${claim.doc}  ${claim.label}\n` +
        `      document says: [${got.join(', ')}]\n` +
        `      the tree holds: [${want.join(', ')}]\n` +
        `      sentence: ${m[0].slice(0, 150)}`);
    }
  }

  assert.deepEqual(missing, [],
    `${missing.length} claim(s) no longer match the document they guard. A reworded sentence is not ` +
    'a passing claim: either restore the shape or update the pattern here.\n  ' + missing.join('\n  '));
  assert.deepEqual(wrong, [],
    `${wrong.length} stated count(s) disagree with the tree:\n  ` + wrong.join('\n  '));
});

test('CENSUS the registry covers every document that states a guarded count', () => {
  // A document with claims against it must be one the tree actually holds under `scheme/`, and the
  // four folder contracts must all be represented: a category whose counts nobody guards is how the
  // 14-of-31 drift lived. This is the cheap structural half of the same question.
  const want = new Set(['CANON.md', 'CLAUDE.md', ...CATS.map(folder)]);
  const have = new Set(CLAIMS.map(c => c.doc));
  assert.deepEqual([...want].filter(d => !have.has(d)), [],
    'a document the registry is supposed to cover carries no claim');
  for (const doc of have) assert.ok(existsSync(join(ROOT, doc)), `claim names a missing document: ${doc}`);
});
