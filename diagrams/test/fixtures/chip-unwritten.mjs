// What counts as a chip write, shared by the report and the chip-written verdict.
// Blind to writes inside an escape (step.enter, F.run), which P-11 bans.

// The walk baseline is derived by both readers, never typed here.

// Carried LIT-NOT-WRITTEN rulings, stored in ./carried.mjs. Empty.
import { carriedMap } from './carried.mjs';

export const CHIP_CARRIED = carriedMap('LIT-NOT-WRITTEN');

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

// Every key a step points at through the four cues: `lit`, `reducedLit`, F.light targets, packet `lights`.
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
