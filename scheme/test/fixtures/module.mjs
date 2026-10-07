// Imports a card, its kit or a lib module in bare Node, no browser and no stubs (lib/motion.js guards
// window). A card's export surface is migrated ['SCENE', 'STEPS_SPEC', 'init'] or legacy ['init'],
// whose steps are sealed in makeInit's closure and readable only by render.

import { pathToFileURL } from 'node:url';
import { join } from 'node:path';
import { ROOT, cards, census } from './catalog.mjs';

// Expected surfaces, written down. LEGACY_EXPORTS is the detector S-02 keeps alive.
const LEGACY_EXPORTS = Object.freeze(['init']);
const MIGRATED_EXPORTS = Object.freeze(['SCENE', 'STEPS_SPEC', 'init']);

// Sorted and comma-joined, in the order the migration counter reports.
export const CARD_FORMS = Object.freeze({
  migrated: [...MIGRATED_EXPORTS].sort().join(', '),
  legacy: [...LEGACY_EXPORTS].sort().join(', '),
});

export const exportSurface = (ns) => Object.keys(ns).sort().join(', ');

// Exact set equality: a legacy card that grew one extra export must not read as migrated.
export function cardForm(ns) {
  const got = exportSurface(ns);
  return Object.keys(CARD_FORMS).find(f => CARD_FORMS[f] === got) || null;
}

const importAt = (...seg) => import(pathToFileURL(join(ROOT, ...seg)).href);

async function importCard(card) {
  const rec = typeof card === 'string'
    ? (await cards()).find(c => c.id === card)
    : card;
  if (!rec) throw new Error(`importCard: no card with id "${card}" in the catalog`);
  return importAt(rec.rel);
}

// With the census guard applied.
export async function importAll() {
  const list = await cards();
  // Concurrent, with the Map built from the settled list so the order is the catalog's.
  const mods = await Promise.all(list.map(c => importCard(c)));
  const out = new Map(list.map((c, i) => [c.id, mods[i]]));
  census('importAll', out.size, list.length);
  return out;
}

// The four kits re-export one block. Comparing them is the only source of truth for its size.
export const importKit = (category) => importAt('js', 'schemes', category, `${category}-kit.js`);

export const importLib = (name) => importAt('js', 'lib', name);

// Summed off declared specs, memoised, and kept out of catalog.mjs, which must not import cards.
// A legacy card would lower it rather than fail here: S-02 in unit/module.test.mjs catches that first.
let stepTotalMemo = null;
export async function stepTotal() {
  if (stepTotalMemo === null) {
    let n = 0;
    for (const ns of (await importAll()).values()) {
      if (Array.isArray(ns.STEPS_SPEC)) n += ns.STEPS_SPEC.length;
    }
    stepTotalMemo = n;
  }
  return stepTotalMemo;
}
