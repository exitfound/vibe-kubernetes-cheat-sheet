#!/usr/bin/env node
// kin.mjs: a section's composition signatures, content bands and levers as data, so a new card can differ from its siblings.
// usage: node .claude/skills/card-new/tools/kin.mjs <category>[/<subcategory>] | --levers | --id=<card-id> [--json]
// Counts part kinds off SCENE.parts: group transforms, raw shapes and tune output are invisible, and it never judges a picture.
import { schemes, subcategories, ROOT } from '../../../../scheme/test/fixtures/catalog.mjs';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';

const args = process.argv.slice(2);
const flags = Object.fromEntries(args.filter(a => a.startsWith('--')).map(a => {
  const [k, v = 'true'] = a.slice(2).split('='); return [k, v];
}));
const target = args.find(a => !a.startsWith('--'));
if (!target && !flags.levers && !flags.id) {
  console.error('Usage: node kin.mjs <category>[/<subcategory>]');
  console.error('       node kin.mjs --levers');
  console.error('       node kin.mjs --id=<card-id>');
  process.exit(1);
}

// A group is a part like any other, so the walk flattens nested groups and keeps each group in the count.
function flatten(parts, out = []) {
  for (const p of parts || []) {
    if (!p) continue;
    out.push(p);
    if (p.kind === 'group') flatten(p.p && p.p.parts, out);
  }
  return out;
}

const num = (v) => (typeof v === 'number' && Number.isFinite(v) ? v : null);
const uniqSorted = (xs) => [...new Set(xs.filter(x => x !== null))].sort((a, b) => a - b);

// The special elements a new card differs by, beyond box + pod + lane + chip.
const LEVERS = [
  ['chain', 'stepped ladder of rows (P.chain)', s => s.kinds.chain > 0],
  ['cylinder', 'a disk, one or more (P.cylinder)', s => s.kinds.cylinder > 0],
  ['cylinders', 'TWO or more disks compared', s => s.kinds.cylinder >= 2],
  ['frame', 'one node() frame', s => s.kinds.node === 1],
  ['frames', 'TWO or more node() frames', s => s.kinds.node >= 2],
  ['noframe', 'no node() frame at all', s => !s.kinds.node],
  ['nopod', 'no Pod on the canvas', s => !s.kinds.pod],
  ['podrow', 'four or more Pods', s => s.kinds.pod >= 4],
  ['raw', 'a hand-forged shape (P.raw): bar, ruler, rung, slot, cell', s => s.kinds.raw > 0],
  ['tag', 'a standing caption that is not a per-step wire', s => s.kinds.tag > 0],
  ['group', 'an explicit group, so a whole assembly fades as one', s => s.kinds.group > 0],
  ['relation', 'a relationship line carrying no traffic', s => s.kinds.relation > 0],
  ['relations', 'THREE or more relationship lines', s => s.kinds.relation >= 3],
  ['fan', 'six or more lanes: a fan, a bus or a mesh', s => s.lanes >= 6],
  ['nochip', 'no value chip at all', s => !s.kinds.chip],
  ['chiprow', 'six or more value chips', s => s.kinds.chip >= 6],
  ['column', 'chips stacked in ONE column', s => s.chipCols === 1 && s.kinds.chip > 1],
  ['strip', 'chips as a wide strip, three or more across', s => s.chipCols >= 3],
  ['grid', 'chips on more than one row AND more than one column', s => s.chipRows > 1 && s.chipCols > 1],
  ['deep', 'four or more content bands down the canvas', s => s.bands.length >= 4],
  ['shallow', 'two content bands or fewer', s => s.bands.length <= 2],
  ['long', 'seven or more steps', s => s.steps >= 7],
  ['short', 'four steps or fewer', s => s.steps <= 4],
];

function readCard(entry, ns) {
  const parts = flatten(ns.SCENE && ns.SCENE.parts);
  const kinds = {};
  for (const p of parts) kinds[p.kind] = (kinds[p.kind] || 0) + 1;
  for (const k of ['box', 'pod', 'node', 'chip', 'cylinder', 'chain', 'raw', 'tag', 'group', 'relation', 'lane', 'arrow', 'wire'])
    kinds[k] = kinds[k] || 0;

  const of = (kind) => parts.filter(p => p.kind === kind).map(p => p.p || {});
  const bodies = [...of('box'), ...of('pod'), ...of('cylinder'), ...of('node')];
  const chips = of('chip');
  const chipX = uniqSorted(chips.map(c => num(c.x)));
  const chipY = uniqSorted(chips.map(c => num(c.y)));

  const s = {
    id: entry.id,
    category: entry.category,
    subcategory: entry.subcategory,
    title: entry.title,
    steps: Array.isArray(ns.STEPS_SPEC) ? ns.STEPS_SPEC.length : 0,
    kinds,
    lanes: kinds.lane + kinds.arrow,
    // A band is a distinct y a body element starts on.
    bands: uniqSorted(bodies.map(b => num(b.y))),
    frames: of('node').map(n => [num(n.x), num(n.y), num(n.w), num(n.h)]),
    chipCols: chipX.length,
    chipRows: chipY.length,
    chipX,
  };
  s.levers = LEVERS.filter(([, , test]) => test(s)).map(([key]) => key);
  // The signature is counts only, nothing positional, so two cards sharing one may still look different.
  s.sig = `box${kinds.box} pod${kinds.pod} node${kinds.node} chip${kinds.chip} cyl${kinds.cylinder} chain${kinds.chain} raw${kinds.raw}`;
  return s;
}

async function readAll() {
  const list = await schemes();
  const out = [];
  for (const entry of list) {
    const url = pathToFileURL(join(ROOT, 'js', 'schemes', entry.category, `${entry.id}.js`)).href;
    let ns;
    try { ns = await import(url); } catch (err) {
      console.error(`SKIPPED ${entry.id}: ${err.message}`);
      continue;
    }
    out.push(readCard(entry, ns));
  }
  if (out.length !== list.length) {
    console.error(`READ ${out.length} of ${list.length} catalogued cards. A partial read makes every ` +
      'count below smaller than the tree, so treat nothing here as a census until it is whole.');
  }
  return out;
}

// ---------------------------------------------------------------------------------------------
// Output
// ---------------------------------------------------------------------------------------------
const pad = (s, n) => String(s).padEnd(n);
const P = (...a) => console.log(...a);

function printSection(label, rows, all) {
  P('');
  P(`=== ${label}: ${rows.length} card(s)`);
  P('');
  P(pad('card', 40), pad('st', 3), pad('signature', 46), pad('bands', 30), 'levers');
  for (const r of rows) {
    P(pad(r.id, 40), pad(r.steps, 3), pad(r.sig, 46), pad(r.bands.join(','), 30), r.levers.join(' '));
  }

  // A signature two or more cards in this section share is what the next card should not reach for by default.
  const bySig = new Map();
  for (const r of rows) {
    if (!bySig.has(r.sig)) bySig.set(r.sig, []);
    bySig.get(r.sig).push(r.id);
  }
  const crowded = [...bySig].filter(([, ids]) => ids.length > 1).sort((a, b) => b[1].length - a[1].length);
  P('');
  P(`--- signatures: ${bySig.size} distinct over ${rows.length} cards`);
  if (!crowded.length) P('    no signature is shared inside this section.');
  for (const [sig, ids] of crowded) P(`    ${ids.length}x  ${sig}\n         ${ids.join(', ')}`);

  // The catalog-wide count says whether an unused lever is rare everywhere or just never reached for here.
  const used = new Set(rows.flatMap(r => r.levers));
  P('');
  P('--- levers this section has never used (catalog-wide users in brackets)');
  for (const [key, gloss] of LEVERS) {
    if (used.has(key)) continue;
    const n = all.filter(r => r.levers.includes(key)).length;
    P(`    ${pad(key, 11)} ${pad(gloss, 52)} [${n}]`);
  }
  P('');
  P('--- levers this section leans on');
  for (const [key, gloss] of LEVERS) {
    const here = rows.filter(r => r.levers.includes(key)).length;
    if (here < Math.max(2, Math.ceil(rows.length / 2))) continue;
    P(`    ${pad(key, 11)} ${pad(gloss, 52)} ${here}/${rows.length} here`);
  }
}

function printLevers(all) {
  P('');
  P(`=== levers, catalog-wide over ${all.length} cards`);
  P('');
  P(pad('lever', 12), pad('what it is', 54), pad('cards', 6), 'example ids');
  for (const [key, gloss] of LEVERS) {
    const hits = all.filter(r => r.levers.includes(key));
    P(pad(key, 12), pad(gloss, 54), pad(hits.length, 6), hits.slice(0, 3).map(h => h.id).join(', '));
  }
  P('');
  P('A lever with a LOW count is not a lever to avoid: it is one nobody has needed yet. A lever at');
  P('or near the catalog size is house grammar, and dropping it is the deviation that needs a reason.');
}

const all = await readAll();

if (flags.json) {
  const pick = flags.id ? all.filter(r => r.id === flags.id)
    : target ? all.filter(r => (target.includes('/') ? `${r.category}/${r.subcategory}` === target : r.category === target))
      : all;
  console.log(JSON.stringify({ cards: pick, levers: LEVERS.map(([k, g]) => ({ key: k, gloss: g })) }, null, 1));
  process.exit(0);
}

if (flags.levers && !target && !flags.id) { printLevers(all); process.exit(0); }

if (flags.id) {
  const me = all.find(r => r.id === flags.id);
  if (!me) { console.error(`no card with id ${flags.id}`); process.exit(1); }
  const siblings = all.filter(r => r.subcategory === me.subcategory && r.id !== me.id);
  P('');
  P(`=== ${me.id}  (${me.category}/${me.subcategory})`);
  P(`    signature  ${me.sig}`);
  P(`    bands      ${me.bands.join(',')}`);
  P(`    levers     ${me.levers.join(' ')}`);
  const twins = siblings.filter(r => r.sig === me.sig);
  P('');
  if (twins.length) {
    P(`    SAME SIGNATURE as ${twins.length} sibling(s): ${twins.map(t => t.id).join(', ')}`);
    P('    Open their rendered frames beside this card before calling the difference real.');
  } else {
    P('    No sibling in this section carries this signature.');
  }
  const shared = siblings.length
    ? LEVERS.filter(([k]) => me.levers.includes(k) && siblings.every(s => s.levers.includes(k))).map(([k]) => k)
    : [];
  const own = LEVERS.filter(([k]) => me.levers.includes(k) && !siblings.some(s => s.levers.includes(k))).map(([k]) => k);
  P(`    levers every sibling also has: ${shared.join(' ') || '(none)'}`);
  P(`    levers no sibling has:         ${own.join(' ') || '(none)'}`);
  P('');
  P('    The second line is the one that answers "is this card worth opening after the others".');
  P('    An empty second line is a finding to argue with, not a failure.');
  process.exit(0);
}

// SUBCATEGORIES order is editorial (`D-10`), so a category walk follows it rather than sorting.
const SUBS = await subcategories();
const labelOf = (cat, sub) => ((SUBS[cat] || []).find(s => s.key === sub) || {}).label || '';
if (target.includes('/')) {
  const [cat, sub] = target.split('/');
  const rows = all.filter(r => r.category === cat && r.subcategory === sub);
  if (!rows.length) { console.error(`no cards in ${target}`); process.exit(1); }
  printSection(`${cat}/${sub}  ${labelOf(cat, sub)}`, rows, all);
} else {
  const rows = all.filter(r => r.category === target);
  if (!rows.length) { console.error(`no cards in category ${target}`); process.exit(1); }
  for (const { key, label } of SUBS[target] || []) {
    const sec = rows.filter(r => r.subcategory === key);
    if (sec.length) printSection(`${target}/${key}  ${label}`, sec, all);
  }
}
