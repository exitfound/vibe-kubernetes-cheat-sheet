// spec.mjs: read a MIGRATED card's declarative spec as data. No browser, no source scraping.
// Everything here answers one of two questions a `SCENE` cannot answer by itself: what is in the
// part tree once groups are flattened, and what names an escape hook creates behind the layer's back.
//
// WHY THE ESCAPES HAVE TO BE READ AT ALL. `tune(el, refs)` and `raw.make(refs)` may write a ref,
// and 16 cards do it, 38 keys in all. A reader that ignored them would call every reset key naming
// one a typo: that was queue Q1, twelve false findings, until 2026-08-14.
//
// THE READER ONLY EVER WIDENS THE LEGAL SET, which is the safe direction for a regex over source
// text: a pattern it misses costs a loud false finding, never a silent pass. It reads a LITERAL key
// only, so a computed `refs[k] = ...` is invisible to it. `js/schemes/network/CLAUDE.md` bans that
// form for this reason and the catalog has none.
//
// WHO USES IT, and why it lives here rather than in either of them: `unit/spec-steps.test.mjs`
// resolves the names a step uses against the scene, `report/skeleton-census.test.mjs` counts escapes
// and prints Q1. Two copies of one regex drift, and a drift between those two would show up as a
// disagreement about which cards are broken.

// A literal `refs.x =` or `refs['x'] =` assignment. The `(?!=)` keeps `refs.x ==` out.
export const ESCAPE_ASSIGN = /\brefs\s*(?:\.\s*([A-Za-z_$][\w$]*)|\[\s*['"]([^'"]+)['"]\s*\])\s*=(?!=)/g;

// Every function ANYWHERE in an object, so a hook kind invented after this file was written is
// still scanned. Depth 8 is the tree's own ceiling: groups nest, flow entries carry options.
export function collectFns(value, out = [], depth = 0) {
  if (depth > 8 || value === null || typeof value !== 'object') return out;
  for (const v of Object.values(value)) {
    if (typeof v === 'function') out.push(v);
    else if (v && typeof v === 'object') collectFns(v, out, depth + 1);
  }
  return out;
}

// The ref names one escape body assigns, in source order, duplicates kept: a caller counting sites
// needs them, a caller building a set does not care.
export const assignedRefs = (fn) => [...fn.toString().matchAll(ESCAPE_ASSIGN)].map(m => m[1] || m[2]);

// Every ref name the escapes of one or more spec objects create, deduplicated.
export function escapeRefs(...objects) {
  const names = new Set();
  for (const obj of objects) for (const fn of collectFns(obj)) for (const k of assignedRefs(fn)) names.add(k);
  return names;
}

// The part tree with groups flattened, in document order, which is z-order (scene-spec.js appends
// in list order). `visit(part, at)` is called for every entry INCLUDING a null one, because a hole
// in the list is a finding for the census and must not be skipped silently here.
export function walkParts(parts, visit, path = 'parts') {
  (parts || []).forEach((part, i) => {
    const at = `${path}[${i}]`;
    visit(part, at);
    if (part && part.kind === 'group') walkParts(part.p && part.p.parts, visit, `${at}.parts`);
  });
}
