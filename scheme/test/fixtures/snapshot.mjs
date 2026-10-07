// Reads the walk tools/walk.mjs wrote. A missing snapshot throws instead of reading as an empty
// walk, because "0 findings" from no rows looks exactly like a clean catalog.
import { readFileSync } from 'node:fs';
import { SNAPSHOT, decode } from '../tools/walk.mjs';

let cached = null;

export function readSnapshot() {
  if (cached) return cached;
  let raw;
  try {
    raw = readFileSync(SNAPSHOT, 'utf8');
  } catch (_) {
    throw new Error(
      `no walk at ${SNAPSHOT}. The report tier asserts over a walk taken once for all of it: run\n` +
      '  npm run report          (which takes the walk first, every time)\n' +
      'or take it by hand with `node tools/walk.mjs`. This is deliberately an error and not an ' +
      'empty walk: a report over zero cards prints the same thing as a clean catalog.');
  }
  cached = JSON.parse(raw, decode);
  return cached;
}
