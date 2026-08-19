// chip-unwritten.mjs: the walk behind the "chip nobody writes" rule, lifted out of
// report/chip-unwritten.test.mjs on 2026-08-17 when its queue reached zero and the check was promoted.
//
// WHY A FIXTURE. ../unit/chip-written.test.mjs now asks the same question as a VERDICT while the
// report keeps printing the two tiers and the carried table. Two copies of "what counts as a write"
// would let the gate and the report describe different catalogues while both stayed green, which is
// the drift ./spec.mjs was written against, and a test file cannot import another test file without
// registering its tests twice.
//
// WHAT IT IS BLIND TO: a write inside an escape. `step.enter` and `F.run` are function bodies, so a
// setVal() in one is a write this reader cannot see. P-11 bans exactly that, which is why the finding
// is worth printing rather than guarding against: such a chip is a P-11 finding, not this one.

// The walk baseline is not typed here. Both readers derive it: the card count off the catalog they
// already walk, the step count off `stepTotal()` in ./module.mjs. See CATALOG_BASELINE in
// ./catalog.mjs for why a literal floor weakens as the catalog grows.

// Rulings a human has READ and decided to carry, keyed `<card id> <chip key>`. Empty today, and that
// reads correctly: nothing is reported, so nothing is carried.
export const CHIP_CARRIED = new Map([]);

export function writtenKeys(spec) {
  const out = new Set();
  const add = (o) => { if (o) for (const k of Object.keys(o)) out.add(k); };
  for (const s of spec) {
    add(s.chips);
    add(s.chipsCued);
    if (s.rewind) { add(s.rewind.chips); add(s.rewind.chipsCued); }
    for (const e of s.flow || []) if (e.verb === 'set') { add(e.p.chips); add(e.p.chipsCued); }
  }
  return out;
}

// Every key any step POINTS AT, through all four cues that put `.highlight` on an element: the
// static `lit`, the reduced-path `reducedLit`, an F.light target list, and the `lights` a packet
// entry hangs off its own arrival.
export function cuedKeys(spec) {
  const out = new Set();
  for (const s of spec) {
    for (const k of s.lit || []) out.add(k);
    for (const k of s.reducedLit || []) out.add(k);
    for (const e of s.flow || []) {
      if (e.verb === 'light') for (const k of e.p.targets || []) out.add(k);
      for (const k of e.p.lights || []) out.add(k);
    }
  }
  return out;
}
