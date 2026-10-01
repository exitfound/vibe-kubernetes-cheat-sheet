// snapshot.mjs: read the panel/geometry walk that `tools/walk.mjs` takes, and refuse to be read
// when it is not there.
//
// A missing snapshot is a HARD ERROR and never an empty walk. A report file that found no rows
// would print "0 findings" and exit 0, which is the same output as a clean catalog: the failure
// mode this harness is most careful about everywhere else (fixtures/catalog.mjs says it about
// readdir, every walker says it with census()). So the throw here is the check.
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
