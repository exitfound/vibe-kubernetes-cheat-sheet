// The D block of CANON.md plus R-desc, R-modulepath, R-poster, R-srclabel, R-srcdup and R-dash over
// catalog strings, read as data through fixtures/catalog.mjs. sitemap.xml is parsed, not pattern-matched.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
import {
  ROOT, catalog, cards, cardsByCategory, categories, categoryRegistry, census,
  folderFiles, folderModules, manifest, posters, schemes, subcategories, CATALOG_BASELINE,
} from '../fixtures/catalog.mjs';
import { sentences } from '../fixtures/prose.mjs';

// The typed card total. This is where adding or removing a card in data.js is acknowledged.
const CARD_TOTAL = CATALOG_BASELINE.cards;
const PER_CATEGORY = { cluster: 28, workloads: 32, network: 44, storage: 39 };
const SUBCATEGORY_TOTAL = 15;   // unique across the four categories (D-07)

// D-04 / D-05 bands. A tighter ceiling pushes qualifiers out and leaves false absolutes (T-20).
const DESC_MIN = 400;
const DESC_MAX = 470;
const DESC_SENTENCES_MIN = 2;
const DESC_SENTENCES_MAX = 4;

// D-01. No path field: app.js derives it from category + id.
const ENTRY_KEYS = ['id', 'title', 'category', 'subcategory', 'desc', 'k8sVersion', 'tinted', 'sources'];

// Built from code points so this file does not contain the characters it bans.
const EM_DASH = String.fromCharCode(0x2014);
const EN_DASH = String.fromCharCode(0x2013);
const DASH_RE = new RegExp(`[${EM_DASH}${EN_DASH}]`);
const DASH_NAME = { [EM_DASH]: 'em-dash', [EN_DASH]: 'en-dash' };

const SITE_ROOTS = ['https://kube.how/', 'https://kube.how/cli/', 'https://kube.how/scheme/'];
// Static pages written by tools/pages/build.mjs.
const SCHEME_PAGE = /^https:\/\/kube\.how\/scheme\/card\/([a-z0-9-]+)\/$/;
const CLI_PAGE = /^https:\/\/kube\.how\/cli\/section\/([a-z0-9-]+)\/$/;
const PAGE_INDEXES = ['https://kube.how/scheme/card/', 'https://kube.how/cli/section/'];

const SCHEMES = await schemes();
const CARDS = await cards();
const POSTERS = await posters();
const SUBS = await subcategories();
const CATS = await categories();
const REGISTRY = await categoryRegistry();
const { CATEGORY_LABEL, CATEGORY_ICONS, CATEGORY_TAGLINE } = await catalog();

const ids = new Set(SCHEMES.map(s => s.id));

// Parsed per <url> block, so a stray second <loc> is a finding.
async function sitemapUrls() {
  const xml = await readFile(join(ROOT, '..', 'sitemap.xml'), 'utf8');
  return [...xml.matchAll(/<url>([\s\S]*?)<\/url>/g)]
    .map(m => [...m[1].matchAll(/<loc>([^<]+)<\/loc>/g)].map(l => l[1].trim()));
}

// Strings the catalog owns, tagged with their field. Card modules are scanned by the render tests.
function catalogStrings() {
  const out = [];
  for (const c of REGISTRY) {
    out.push({ where: `CATEGORIES[${c.key}].label`, text: c.label });
    if (c.tagline) out.push({ where: `CATEGORIES[${c.key}].tagline`, text: c.tagline });
  }
  for (const [cat, list] of Object.entries(SUBS)) {
    for (const sc of list) out.push({ where: `SUBCATEGORIES.${cat}[${sc.key}].label`, text: sc.label });
  }
  for (const s of SCHEMES) {
    out.push({ id: s.id, where: `${s.id}.title`, text: s.title });
    out.push({ id: s.id, where: `${s.id}.desc`, text: s.desc });
    for (const src of s.sources || []) out.push({ id: s.id, where: `${s.id}.sources["${src.label}"]`, text: src.label });
    out.push({ id: s.id, where: `POSTERS.${s.id}`, text: POSTERS[s.id] || '' });
  }
  return out;
}

test(`the catalog is whole (${CARD_TOTAL} cards)`, () => {
  assert.equal(SCHEMES.length, CARD_TOTAL,
    `data.js lists ${SCHEMES.length} cards, the baseline is ${CARD_TOTAL}. Every assertion below walks this list.`);
  // A card lost between the two views is a broken projection.
  census('catalog cards()', CARDS.length, SCHEMES.length);
  assert.equal(ids.size, CARD_TOTAL, `${CARD_TOTAL - ids.size} duplicate id(s): app.js resolves a card by find(), so the second copy is unreachable`);
});

test(`the four categories hold ${Object.values(PER_CATEGORY).join(' + ')} cards`, async () => {
  const byCat = await cardsByCategory();
  assert.deepEqual([...byCat.keys()].sort(), Object.keys(PER_CATEGORY).sort());
  const counts = Object.fromEntries([...byCat].map(([k, v]) => [k, v.length]));
  assert.deepEqual(counts, PER_CATEGORY);
  census('per-category split', Object.values(counts).reduce((a, b) => a + b, 0), CARD_TOTAL);
});

test(`D-01 every entry carries exactly the ${ENTRY_KEYS.length} catalog fields`, () => {
  let seen = 0;
  for (const s of SCHEMES) {
    seen++;
    assert.deepEqual([...Object.keys(s)].sort(), [...ENTRY_KEYS].sort(),
      `${s.id || '(no id)'} declares ${Object.keys(s).join(', ')}`);
    // A leftover `module` field means a pre-derivation data.js came back. Nothing reads it.
    assert.equal(s.module, undefined, `${s.id} still carries a module field, which nothing reads`);
    for (const k of ['id', 'title', 'category', 'subcategory', 'desc', 'k8sVersion']) {
      assert.equal(typeof s[k], 'string', `${s.id}.${k} is ${typeof s[k]}, not a string`);
      assert.ok(s[k].length > 0, `${s.id}.${k} is empty`);
    }
    assert.equal(s.tinted, true, `${s.id}.tinted is ${s.tinted}: every card is on the per-category tinted dialog`);
    assert.match(s.k8sVersion, /^\d+\.\d+$/, `${s.id}.k8sVersion "${s.k8sVersion}" is not a MAJOR.MINOR version`);
    assert.ok(CATS.includes(s.category), `${s.id}.category "${s.category}" is not one of ${CATS.join(', ')}`);
    assert.ok(Array.isArray(s.sources) && s.sources.length > 0,
      `${s.id} has no sources, so its dialog footer renders empty`);
    for (const src of s.sources) {
      assert.deepEqual(Object.keys(src).sort(), ['href', 'label'], `${s.id} source keys: ${Object.keys(src).join(', ')}`);
      assert.ok(src.label.length > 0, `${s.id} has a source with an empty label`);
      assert.match(src.href, /^https:\/\//, `${s.id} source "${src.label}" is not an https URL`);
    }
  }
  census('entry shape', seen, CARD_TOTAL);
});

test('D-02 an id starts with its category, which is the folder app.js imports from', () => {
  let seen = 0;
  for (const c of CARDS) {
    seen++;
    assert.equal(c.id.split('-')[0], c.category,
      `${c.id} would make app.js import js/schemes/${c.category}/${c.id}.js. This broke once for real, ` +
      'when workloads-pod-priority-preemption became cluster-pod-priority-preemption.');
    assert.equal(c.rel, join('js', 'schemes', c.category, `${c.id}.js`));
  }
  census('id prefix', seen, CARD_TOTAL);
});

// S-20: a category folder holds its cards plus the modules folderModules names.
test(`D-03 each category folder holds its cards plus ${folderModules('cluster').size} declared modules and nothing else`, async () => {
  let claimed = 0;
  for (const cat of CATS) {
    const onDisk = await folderFiles(cat);
    const allowed = folderModules(cat);
    const listed = (await cardsByCategory()).get(cat).map(c => c.base).sort();
    const cardsOnDisk = onDisk.filter(n => !allowed.has(n));
    assert.deepEqual(cardsOnDisk, listed,
      `js/schemes/${cat}/ and its cards.js disagree. On disk but unclaimed: ` +
      `${cardsOnDisk.filter(n => !listed.includes(n)).join(', ') || 'none'}. ` +
      `Claimed but missing: ${listed.filter(n => !cardsOnDisk.includes(n)).join(', ') || 'none'}.`);
    for (const n of allowed) {
      assert.ok(onDisk.includes(n), `js/schemes/${cat}/${n} is missing, and every card in the folder imports the kit`);
    }
    claimed += cardsOnDisk.length;
  }
  census('folder walk', claimed, CARD_TOTAL);
});

// renderPoster falls back to FALLBACK_POSTER, so a dropped key still renders a full grid.
test(`D-06 card and poster are a bijection (${Object.keys(POSTERS).length} of ${CARD_TOTAL})`, () => {
  const posterKeys = Object.keys(POSTERS);
  const orphanCards = SCHEMES.filter(s => !(s.id in POSTERS)).map(s => s.id);
  const orphanPosters = posterKeys.filter(k => !ids.has(k));
  assert.deepEqual(orphanCards, [], `${orphanCards.length} card(s) draw FALLBACK_POSTER instead of a poster`);
  assert.deepEqual(orphanPosters, [], `${orphanPosters.length} poster(s) belong to no card, so nothing renders them`);
  census('poster bijection', posterKeys.length, CARD_TOTAL);
  // renderPoster wraps the body in the one svg R-04 pins, so a nested root would be a second camera.
  for (const s of SCHEMES) {
    const body = POSTERS[s.id];
    assert.equal(typeof body, 'string');
    assert.match(body, /<[a-z]/, `POSTERS.${s.id} draws no element`);
    assert.ok(!body.includes('<svg'), `POSTERS.${s.id} carries its own svg root, which renderPoster already supplies`);
  }
});

test(`D-04 every desc is ${DESC_MIN} to ${DESC_MAX} characters`, () => {
  const bad = [];
  let seen = 0;
  for (const s of SCHEMES) {
    seen++;
    const len = s.desc.length;
    if (len < DESC_MIN || len > DESC_MAX) bad.push(`${s.id} ${len} chars`);
  }
  census('desc length', seen, CARD_TOTAL);
  assert.deepEqual(bad, [], `${bad.length} desc(s) outside the hard band (target is 410-460, 3 sentences)`);
});

test(`D-05 every desc is ${DESC_SENTENCES_MIN} to ${DESC_SENTENCES_MAX} sentences`, () => {
  const bad = [];
  let seen = 0;
  for (const s of SCHEMES) {
    seen++;
    const n = sentences(s.desc).length;
    if (n < DESC_SENTENCES_MIN || n > DESC_SENTENCES_MAX) bad.push(`${s.id} ${n} sentences`);
  }
  census('desc sentences', seen, CARD_TOTAL);
  assert.deepEqual(bad, [], `${bad.length} desc(s) outside 3 sentences with a tolerance of one`);
});

test('R-srcdup no card shows two sources under one label', () => {
  const bad = [];
  let scanned = 0;
  for (const s of SCHEMES) {
    const seen = new Set();
    for (const src of s.sources) {
      scanned++;
      // The dialog footer joins labels, so a repeat renders twice.
      if (seen.has(src.label)) bad.push(`${s.id} repeats "${src.label}"`);
      seen.add(src.label);
    }
  }
  assert.ok(scanned >= CARD_TOTAL, `scanned ${scanned} sources for ${CARD_TOTAL} cards: the walk collapsed`);
  assert.deepEqual(bad, [], `${bad.length} duplicated source label(s)`);
});

test('R-srclabel one href carries one label across the whole catalog', () => {
  const byHref = new Map();
  for (const s of SCHEMES) {
    for (const src of s.sources) {
      if (!byHref.has(src.href)) byHref.set(src.href, new Map());
      byHref.get(src.href).set(src.label, s.id);
    }
  }
  // A collapse guard. The counts execute in report/sources.test.mjs.
  assert.ok(byHref.size >= 100, `only ${byHref.size} distinct hrefs: the walk collapsed`);
  const bad = [...byHref]
    .filter(([, labels]) => labels.size > 1)
    .map(([href, labels]) => `${href} is labelled ${labels.size} ways: ` +
      [...labels].map(([l, id]) => `"${l}" (${id})`).join(' vs '));
  assert.deepEqual(bad, [], `${bad.length} href(s) carry more than one label`);
});

// Catalog strings reach the screen on the tile and in the dialog footer.
test('R-dash no em-dash or en-dash in any catalog string', () => {
  const strings = catalogStrings();
  const bad = [];
  for (const { where, text } of strings) {
    const m = DASH_RE.exec(text);
    if (m) bad.push(`${where}: ${DASH_NAME[m[0]]} at offset ${m.index}`);
  }
  census('dash sweep', new Set(strings.filter(s => s.id).map(s => s.id)).size, CARD_TOTAL);
  // Title, desc, poster and at least one source label per card.
  assert.ok(strings.length >= CARD_TOTAL * 4, `scanned ${strings.length} strings for ${CARD_TOTAL} cards`);
  assert.deepEqual(bad, [], `${bad.length} dash(es) in user-visible catalog text`);
});

test(`D-07 ${SUBCATEGORY_TOTAL} subcategory keys, none shared between categories`, () => {
  const owner = new Map();
  const collisions = [];
  for (const cat of CATS) {
    const list = SUBS[cat];
    assert.ok(Array.isArray(list) && list.length > 0, `SUBCATEGORIES.${cat} is empty, so its grid renders one orphan section`);
    for (const sc of list) {
      assert.deepEqual(Object.keys(sc).sort(), ['key', 'label'], `SUBCATEGORIES.${cat} row keys: ${Object.keys(sc).join(', ')}`);
      if (owner.has(sc.key)) collisions.push(`${sc.key} is claimed by ${owner.get(sc.key)} and ${cat}`);
      owner.set(sc.key, cat);
    }
  }
  assert.deepEqual(collisions, []);
  assert.equal(owner.size, SUBCATEGORY_TOTAL);
});

test('D-07 every card sorts into a subcategory its own category declares', () => {
  const owner = new Map();
  for (const cat of CATS) for (const sc of SUBS[cat]) owner.set(sc.key, cat);
  const populated = new Set();
  const orphans = [];
  for (const s of SCHEMES) {
    // buildUnits() would drop an unknown subcategory into an `_other` section.
    if (owner.get(s.subcategory) !== s.category) {
      orphans.push(`${s.id} is ${s.category}/${s.subcategory}, declared by ${owner.get(s.subcategory) || 'nobody'}`);
      continue;
    }
    populated.add(s.subcategory);
  }
  assert.deepEqual(orphans, [], `${orphans.length} card(s) would render in the _other fallback section`);
  census('subcategory walk', populated.size, SUBCATEGORY_TOTAL);
  const empty = [...owner.keys()].filter(k => !populated.has(k));
  assert.deepEqual(empty, [], `${empty.length} subcategory filter button(s) would open an empty grid`);
});

test(`D-08 CATEGORY_LABEL, _ICONS and _TAGLINE are projections of CATEGORIES (${REGISTRY.length} rows)`, () => {
  assert.equal(REGISTRY[0].key, 'all', 'the grid nav needs its All pseudo-entry first');
  assert.deepEqual(REGISTRY.slice(1).map(c => c.key), CATS, 'CATEGORIES order is the nav order and the section order');
  assert.equal(CATS.length, Object.keys(PER_CATEGORY).length);
  for (const c of REGISTRY) {
    assert.equal(CATEGORY_LABEL[c.key], c.label, `CATEGORY_LABEL.${c.key} is not the registry label`);
    assert.equal(CATEGORY_ICONS[c.key], c.icon, `CATEGORY_ICONS.${c.key} is not the registry icon`);
    assert.equal(CATEGORY_TAGLINE[c.key], c.tagline, `CATEGORY_TAGLINE.${c.key} is not the registry tagline`);
  }
  // Labels are 1:1 with keys (D-07).
  assert.equal(new Set(Object.values(CATEGORY_LABEL)).size, REGISTRY.length);
  assert.equal(CATEGORY_ICONS.all, undefined);
  assert.equal(CATEGORY_TAGLINE.all, undefined);
  assert.equal(SCHEMES.filter(s => s.category === 'all').length, 0);
  for (const cat of CATS) assert.equal(manifest(cat).rel, join('js', 'schemes', cat, 'cards.js'));
});

test('D-12 sitemap.xml lists the three page roots, a page for every card and section, and nothing unresolvable', async () => {
  const blocks = await sitemapUrls();
  assert.ok(blocks.length >= SITE_ROOTS.length, `sitemap.xml has ${blocks.length} <url> entries`);
  const multi = blocks.filter(locs => locs.length !== 1);
  assert.deepEqual(multi, [], `${multi.length} <url> block(s) do not carry exactly one <loc>`);
  const locs = blocks.map(l => l[0]);
  const missing = SITE_ROOTS.filter(r => !locs.includes(r));
  assert.deepEqual(missing, [], `${missing.length} page root(s) missing from the sitemap`);
  // Crawlers ignore `#`, so every card and section needs its static page listed, and nothing else.
  const { SECTIONS } = await import(pathToFileURL(join(ROOT, '..', 'cli', 'js', 'data.js')).href);
  const sectionIds = new Set(SECTIONS.map(s => s.id));
  const bad = [];
  const seen = new Set();
  for (const loc of locs) {
    if (SITE_ROOTS.includes(loc) || PAGE_INDEXES.includes(loc)) continue;
    const sm = SCHEME_PAGE.exec(loc), cm = CLI_PAGE.exec(loc);
    if (sm) { if (!ids.has(sm[1])) bad.push(`${loc} points at a card that does not exist`); seen.add(`scheme/${sm[1]}`); continue; }
    if (cm) { if (!sectionIds.has(cm[1])) bad.push(`${loc} points at a section that does not exist`); seen.add(`cli/${cm[1]}`); continue; }
    bad.push(`${loc} is neither a page root nor a card or section page`);
  }
  assert.deepEqual(bad, [], `${bad.length} sitemap entry(ies) resolve to nothing`);
  const unlisted = [...[...ids].map(id => `scheme/${id}`), ...[...sectionIds].map(id => `cli/${id}`)].filter(k => !seen.has(k));
  assert.deepEqual(unlisted, [], `${unlisted.length} card or section page(s) missing from the sitemap: run node tools/pages/build.mjs`);
});
