// module.mjs: import a card's module, its kit, or a lib module in bare Node. No browser, no shim.
//
// This works because lib/motion.js guards its window.matchMedia probe with `typeof window`. Before
// that guard every one of the 108 cards threw `ReferenceError: window is not defined` at module
// load, through scheme-kit.js -> motion.js, and only data.js, posters.js, tokens.js, svg.js and
// primitives.js imported cleanly. Verified again here: all 108 import, nothing is stubbed.
//
// ===========================================================================================
// WHAT YOU CAN GET FROM A CARD MODULE, and it depends on which of two forms the card is in
// ===========================================================================================
// The export surface of a card has exactly TWO legal forms. Which one a card is in IS its migration
// state, so the SPLIT between them is the migration counter and unit/module.test.mjs prints it on
// every run. There is no third form and no half of one.
//
//   legacy    ['init']
//       The step list is an ARGUMENT to makeInit:
//           export const init = makeInit(Scene, STEPS, { posterFirst: true });
//       so the step `id`, `narration`, `duration`, `enter` and the diagram's `aria-label` all live
//       inside that closure and are STATICALLY UNREACHABLE. Do not go looking for them here, and do
//       not add a regex over the source to fake it: that is the mechanism this refactor is retiring.
//       They are read by RENDER instead, off `window.__schemeCtl._timeline.steps`
//       (fixtures/render.mjs, stepMeta()).
//
//   migrated  ['SCENE', 'STEPS_SPEC', 'init']
//       The scene and the steps are plain module-level DATA, so the same facts come off the
//       namespace in bare Node with no browser and no scraping. That is the whole point of the
//       declarative layer, and it is why the surface had to stop being one frozen name.
//
// What IS statically readable in both forms: everything in the catalog (id, title, category,
// subcategory, desc, k8sVersion, sources) via fixtures/catalog.mjs, because it lives in cards.js,
// not in the closure.

import { pathToFileURL } from 'node:url';
import { join } from 'node:path';
import { ROOT, cards, census } from './catalog.mjs';

// The two legal export surfaces of a card, written down as an expectation rather than discovered
// from what the catalog happens to hold. A card outside both has changed its contract, and the
// point of naming the forms is that it says so out loud instead of quietly widening one of them.
export const LEGACY_EXPORTS = Object.freeze(['init']);
export const MIGRATED_EXPORTS = Object.freeze(['SCENE', 'STEPS_SPEC', 'init']);

// form name -> its surface as one sorted, comma-joined string, which is the shape a comparison
// needs. Order here is the order the migration counter reports in.
export const CARD_FORMS = Object.freeze({
  migrated: [...MIGRATED_EXPORTS].sort().join(', '),
  legacy: [...LEGACY_EXPORTS].sort().join(', '),
});

// What a namespace actually exports, in the same shape CARD_FORMS holds.
export const exportSurface = (ns) => Object.keys(ns).sort().join(', ');

// Which form a card module is in, or null for anything else. EXACT set equality, never containment:
// a legacy card that grew one extra export would satisfy "contains init" and report as migrated,
// which is the one answer a migration counter must never give.
export function cardForm(ns) {
  const got = exportSurface(ns);
  return Object.keys(CARD_FORMS).find(f => CARD_FORMS[f] === got) || null;
}

const importAt = (...seg) => import(pathToFileURL(join(ROOT, ...seg)).href);

// One card's module namespace. Takes an id or a card record from catalog.mjs.
export async function importCard(card) {
  const rec = typeof card === 'string'
    ? (await cards()).find(c => c.id === card)
    : card;
  if (!rec) throw new Error(`importCard: no card with id "${card}" in the catalog`);
  return importAt(rec.rel);
}

// id -> module namespace for the whole catalog, with the census guard applied. An importer that
// silently walked half the catalog would report half the findings and pass.
export async function importAll() {
  const list = await cards();
  const out = new Map();
  for (const c of list) out.set(c.id, await importCard(c));
  census('importAll', out.size, list.length);
  return out;
}

// A category's kit module (`js/schemes/<cat>/<cat>-kit.js`). The four kits re-export one shared
// block, and comparing them to each other is the only source of truth for its size.
export const importKit = (category) => importAt('js', 'schemes', category, `${category}-kit.js`);

// A shared module under js/lib/, by basename: importLib('tokens.js').
export const importLib = (name) => importAt('js', 'lib', name);

// A category's manifest module: { CARDS, SUBCATEGORIES }.
export const importManifest = (category) => importAt('js', 'schemes', category, 'cards.js');
