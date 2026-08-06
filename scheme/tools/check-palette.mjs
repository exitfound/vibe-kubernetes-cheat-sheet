// check-palette.mjs: the colour half of the gate. Baseline-free: SPREAD, UNKNOWN, UNPAINTED, all
// explained in ../CANON.md C-01 to C-03. Runs under reducedMotion or a filled pulse reads back as resting.
// node check-palette.mjs [<id> ...]   ids => verbose; none => whole catalog, terse
import { launch, setInspect, discoverIds, DEFAULT_BASE } from './_shared.mjs';

const argIds = process.argv.slice(2);
const terse = argIds.length === 0;
const ROLES = new Set(['cluster', 'workloads', 'network', 'storage']);

// Element class -> the descendant that actually carries the paint (null = the element itself).
const PAINTED = [
  ['.scheme-pod', '.scheme-pod-rect'],
  ['.scheme-box', '.scheme-box-rect'],
  ['.scheme-chip', '.scheme-chip-rect'],
  ['.scheme-cylinder', '.scheme-cylinder-body'],
  ['.scheme-packet', null],
  ['.scheme-ripple', null],
  // Added 2026-07-29 as a regression guard. Arrows were absent from this list entirely, which is
  // why `dim: true` painting like a live lane on 315 calls was invisible to every check.
  ['.scheme-arrow', null],
];

const probe = (painted) => {
  const svg = document.querySelector('dialog.scheme-dialog svg.diagram');
  if (!svg) return null;
  const out = [];
  for (const [sel, childSel] of painted) {
    for (const el of svg.querySelectorAll(`${sel}[data-role]`)) {
      const paint = childSel ? el.querySelector(childSel) : el;
      if (!paint) continue;
      const cs = getComputedStyle(paint);
      // State matters: .highlight repaints to the bright stop, so a lit chip and a resting one
      // legitimately differ. Without this the check reports its own blindness as a card defect.
      // `scheme-arrow-dim` is a state, not a variant: a dim lane and a live one of the same role
      // are meant to differ, so without it here the guard above reports the difference as a SPREAD.
      const state = ['highlight', 'scheme-arrow-dim']
        .filter(c => el.classList.contains(c)).join('+') || 'rest';
      out.push({
        cls: sel.slice(1),
        role: el.getAttribute('data-role'),
        state,
        stroke: cs.stroke,
        fill: cs.fill,
        // A packet paints with fill, everything else with stroke.
        paintProp: sel === '.scheme-packet' ? 'fill' : 'stroke',
      });
    }
  }
  return out;
};

const browser = await launch();
const ctx = await browser.newContext({ viewport: { width: 1600, height: 1000 }, reducedMotion: 'reduce' });
const page = await ctx.newPage();
await page.addInitScript(setInspect, 'expose');

const ids = terse ? await discoverIds(page) : argIds;
if (!ids.length) { console.error('NO CARDS RENDERED: posters/grid broken'); process.exit(1); }

// key "category|class|role|prop" -> Map colour -> [card ids]
const spread = new Map();
const unknown = [];
const unpainted = [];
let seen = 0;

for (const id of ids) {
  const category = id.split('-')[0];
  await page.goto(`${DEFAULT_BASE}/scheme/#scheme=${id}`, { waitUntil: 'networkidle' });
  await page.waitForSelector('dialog.scheme-dialog svg.diagram', { timeout: 10000 });
  const rows = await page.evaluate(probe, PAINTED);
  if (!rows) { console.log(`  ${id}: no diagram`); continue; }
  for (const r of rows) {
    seen++;
    if (!ROLES.has(r.role)) { unknown.push(`${id}  ${r.cls} role="${r.role}"`); continue; }
    const colour = r.paintProp === 'fill' ? r.fill : r.stroke;
    if (!colour || colour === 'none' || /rgba\(\s*0,\s*0,\s*0,\s*0\s*\)/.test(colour)) {
      unpainted.push(`${id}  ${r.cls}[data-role="${r.role}"] ${r.paintProp}=${colour}`);
      continue;
    }
    const key = `${category}|${r.cls}|${r.role}|${r.state}|${r.paintProp}`;
    if (!spread.has(key)) spread.set(key, new Map());
    const byColour = spread.get(key);
    if (!byColour.has(colour)) byColour.set(colour, []);
    const cards = byColour.get(colour);
    if (!cards.includes(id)) cards.push(id);
  }
  if (!terse) console.log(`${id}  ${rows.length} painted element(s)`);
}

await browser.close();

const inconsistent = [...spread.entries()].filter(([, byColour]) => byColour.size > 1);
const problems = inconsistent.length + unknown.length + unpainted.length;

if (unknown.length) {
  console.log(`\nUNKNOWN role (not one of ${[...ROLES].join('/')}): ${unknown.length}`);
  unknown.slice(0, 20).forEach(l => console.log('  ' + l));
}
if (unpainted.length) {
  console.log(`\nUNPAINTED (a role is set but nothing resolved a colour): ${unpainted.length}`);
  unpainted.slice(0, 20).forEach(l => console.log('  ' + l));
}
if (inconsistent.length) {
  console.log(`\nSPREAD (one category+class+role resolving to more than one colour): ${inconsistent.length}`);
  for (const [key, byColour] of inconsistent) {
    console.log(`  ${key}`);
    for (const [colour, cards] of byColour) {
      console.log(`    ${colour.padEnd(22)} ${cards.length} card(s): ${cards.slice(0, 4).join(', ')}${cards.length > 4 ? ' ...' : ''}`);
    }
  }
}

if (problems) { console.error(`\npalette check FAILED: ${problems} problem(s)`); process.exit(1); }
console.log(`palette check OK: ${seen} painted elements across ${ids.length} cards, ${spread.size} category+class+role+state combinations, each resolving to one colour`);
