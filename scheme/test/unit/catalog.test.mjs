// catalog.test.mjs: the D block of ../../CANON.md (card metadata and the catalog) plus the
// catalog-reading rules of the old tools/check-canon.mjs: R-desc, R-modulepath, R-poster,
// R-srclabel, R-srcdup, and R-dash over the strings the catalog itself renders.
//
// Everything here reads DATA, through fixtures/catalog.mjs, which imports js/data.js. No regex over
// a card source. The two inputs that are not JS (sitemap.xml, and SCHEME_ALIASES inside app.js,
// which imports document and cannot be imported here) are read as text and then parsed into the
// object they declare, never matched pair by pair.
//
// Every walk that filters ends in census(): a check that scans nothing reports nothing, and the six
// browser-free checks this file replaces could all be reduced to a green run over an empty set by
// one bad directory filter. The counts below are the numbers a green gate printed at the start of
// the refactor, and they are asserted rather than merely printed, because coverage can collapse to a
// third at zero findings.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import {
  ROOT, catalog, cards, cardsByCategory, categories, categoryRegistry, census,
  folderFiles, folderModules, manifest, posters, schemes, subcategories,
} from '../fixtures/catalog.mjs';
import { sentences } from '../fixtures/prose.mjs';

// The catalog as it stood when the oracle baseline was taken. A run that sees fewer cards than this
// is a broken walk, not a smaller catalog, and it must be red.
const CARD_TOTAL = 108;
const PER_CATEGORY = { cluster: 21, workloads: 19, network: 37, storage: 31 };
const SUBCATEGORY_TOTAL = 15;   // 3 + 3 + 5 + 4, unique across the four categories (D-07)
const ALIAS_TOTAL = 29;         // SCHEME_ALIASES in js/app.js

// R-desc thresholds, taken from tools/check-canon.mjs:399-400 rather than from the canon text.
// The hard band was widened from 400-420 on 2026-07-26 because that ceiling was pushing qualifying
// conditions out of descriptions and left 29 true sentences standing as false absolutes.
const DESC_MIN = 400;
const DESC_MAX = 470;
const DESC_SENTENCES_MIN = 2;
const DESC_SENTENCES_MAX = 4;

// The eight keys a SCHEMES entry carries (D-01). There is no path field: app.js derives the module
// path from category + id.
const ENTRY_KEYS = ['id', 'title', 'category', 'subcategory', 'desc', 'k8sVersion', 'tinted', 'sources'];

// Built from code points, so this file does not itself contain the characters it bans.
const EM_DASH = String.fromCharCode(0x2014);
const EN_DASH = String.fromCharCode(0x2013);
const DASH_RE = new RegExp(`[${EM_DASH}${EN_DASH}]`);
const DASH_NAME = { [EM_DASH]: 'em-dash', [EN_DASH]: 'en-dash' };

// The three page roots of the single-origin site. A card deep link, if the sitemap ever carries one,
// is this scheme root plus the hash app.js routes on.
const SITE_ROOTS = ['https://kube.how/', 'https://kube.how/cli/', 'https://kube.how/scheme/'];
const DEEP_LINK = /^https:\/\/kube\.how\/scheme\/#scheme=([a-z0-9-]+)$/;

const SCHEMES = await schemes();
const CARDS = await cards();
const POSTERS = await posters();
const SUBS = await subcategories();
const CATS = await categories();
const REGISTRY = await categoryRegistry();
const { CATEGORY_LABEL, CATEGORY_ICONS, CATEGORY_TAGLINE } = await catalog();

const ids = new Set(SCHEMES.map(s => s.id));

// app.js touches document at import time, so its alias map is read as text and evaluated as the
// object literal it is, brace-matched from the declaration. A regex over `'old': 'new',` pairs would
// skip an entry wrapped across two lines and report the smaller map as clean, which is the exact
// failure mode this file exists to refuse.
async function schemeAliases() {
  const src = await readFile(join(ROOT, 'js', 'app.js'), 'utf8');
  const at = src.indexOf('const SCHEME_ALIASES');
  assert.ok(at >= 0, 'js/app.js no longer declares SCHEME_ALIASES: every published link to a renamed card is dead');
  const open = src.indexOf('{', at);
  let depth = 0;
  let end = open;
  for (; end < src.length; end++) {
    if (src[end] === '{') depth++;
    else if (src[end] === '}' && --depth === 0) break;
  }
  assert.equal(depth, 0, 'SCHEME_ALIASES has no balanced closing brace in js/app.js');
  return new Function(`return ${src.slice(open, end + 1)};`)();
}

// sitemap.xml lives at the REPO root, one level above scheme/. Parsed per <url> block so a stray
// second <loc> inside one block is a finding rather than an extra entry nobody notices.
async function sitemapUrls() {
  const xml = await readFile(join(ROOT, '..', 'sitemap.xml'), 'utf8');
  return [...xml.matchAll(/<url>([\s\S]*?)<\/url>/g)]
    .map(m => [...m[1].matchAll(/<loc>([^<]+)<\/loc>/g)].map(l => l[1].trim()));
}

// Every user-visible string the CATALOG owns, tagged with where it came from, so a finding names a
// field and not an offset. The card modules carry their own prose (narration, labels) and are
// scanned by the render tests, not here.
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

// ---- the census itself ----

test(`the catalog is whole (${CARD_TOTAL} cards)`, () => {
  assert.equal(SCHEMES.length, CARD_TOTAL,
    `data.js lists ${SCHEMES.length} cards, the baseline is ${CARD_TOTAL}. Every assertion below walks this list.`);
  // The fixture's projection is a filter over the same array, so a card lost between the two is a
  // broken projection rather than a smaller catalog.
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

// ---- D-01: the shape of a SCHEMES entry ----

test(`D-01 every entry carries exactly the ${ENTRY_KEYS.length} catalog fields`, () => {
  let seen = 0;
  for (const s of SCHEMES) {
    seen++;
    assert.deepEqual([...Object.keys(s)].sort(), [...ENTRY_KEYS].sort(),
      `${s.id || '(no id)'} declares ${Object.keys(s).join(', ')}`);
    // A leftover `module` field means a revert or a bad merge put back a data.js from before the
    // path became derived. Nothing reads it, so the whole gate stays green over it.
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

// ---- D-02 / D-03: R-modulepath, both halves ----

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

// The half that used to come free from every check walking the directory: a module nobody lists is
// a module nobody lints and the grid never renders. S-20 caps a category folder at four kinds of
// .js, and folderModules names the three that are not cards.
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

// ---- D-06: R-poster, an exact bijection ----

// Nothing else covers it end to end: renderPoster falls back to FALLBACK_POSTER, so a dropped key
// still renders 108 tiles, smoke still passes, and both oracles look inside the dialog.
test(`D-06 card and poster are a bijection (${Object.keys(POSTERS).length} of ${CARD_TOTAL})`, () => {
  const posterKeys = Object.keys(POSTERS);
  const orphanCards = SCHEMES.filter(s => !(s.id in POSTERS)).map(s => s.id);
  const orphanPosters = posterKeys.filter(k => !ids.has(k));
  assert.deepEqual(orphanCards, [], `${orphanCards.length} card(s) draw FALLBACK_POSTER instead of a poster`);
  assert.deepEqual(orphanPosters, [], `${orphanPosters.length} poster(s) belong to no card, so nothing renders them`);
  census('poster bijection', posterKeys.length, CARD_TOTAL);
  // A poster value is the BODY of the tile, not a document: renderPoster wraps it in the one
  // `<svg viewBox="0 0 320 180">` that R-04 pins, so a nested root here would carry a second camera.
  for (const s of SCHEMES) {
    const body = POSTERS[s.id];
    assert.equal(typeof body, 'string');
    assert.match(body, /<[a-z]/, `POSTERS.${s.id} draws no element`);
    assert.ok(!body.includes('<svg'), `POSTERS.${s.id} carries its own svg root, which renderPoster already supplies`);
  }
});

// ---- D-04 / D-05: R-desc ----

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

// ---- R-srclabel / R-srcdup ----

test('R-srcdup no card shows two sources under one label', () => {
  const bad = [];
  let scanned = 0;
  for (const s of SCHEMES) {
    const seen = new Set();
    for (const src of s.sources) {
      scanned++;
      // The dialog footer joins labels, so a repeat renders as "Sources: Gateway API, Gateway API".
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
  // 149 distinct hrefs behind 213 source rows at the baseline. This caught
  // pod-lifecycle/#pod-termination spelled three ways, one of them naming the page while pointing
  // into a section.
  assert.ok(byHref.size >= 100, `only ${byHref.size} distinct hrefs: the walk collapsed`);
  const bad = [...byHref]
    .filter(([, labels]) => labels.size > 1)
    .map(([href, labels]) => `${href} is labelled ${labels.size} ways: ` +
      [...labels].map(([l, id]) => `"${l}" (${id})`).join(' vs '));
  assert.deepEqual(bad, [], `${bad.length} href(s) carry more than one label`);
});

// ---- R-dash over the catalog's own prose ----

// Project-wide writing rule, and in a catalog string it also reaches the screen: a title or a desc
// is rendered on the grid tile, a source label in the dialog footer, a poster string on the tile
// itself. The card modules are covered by the render tests, not here.
test('R-dash no em-dash or en-dash in any catalog string', () => {
  const strings = catalogStrings();
  const bad = [];
  for (const { where, text } of strings) {
    const m = DASH_RE.exec(text);
    if (m) bad.push(`${where}: ${DASH_NAME[m[0]]} at offset ${m.index}`);
  }
  census('dash sweep', new Set(strings.filter(s => s.id).map(s => s.id)).size, CARD_TOTAL);
  // title + desc + poster + at least one source label per card, so a walk that lost a field is red
  // before the findings are read.
  assert.ok(strings.length >= CARD_TOTAL * 4, `scanned ${strings.length} strings for ${CARD_TOTAL} cards`);
  assert.deepEqual(bad, [], `${bad.length} dash(es) in user-visible catalog text`);
});

// ---- D-07 / D-08: categories and subcategories ----

test(`D-07 ${SUBCATEGORY_TOTAL} subcategory keys, none shared between categories`, () => {
  const owner = new Map();
  const collisions = [];
  for (const cat of CATS) {
    const list = SUBS[cat];
    assert.ok(Array.isArray(list) && list.length > 0, `SUBCATEGORIES.${cat} is empty, so its grid renders one orphan section`);
    for (const sc of list) {
      assert.deepEqual(Object.keys(sc).sort(), ['key', 'label'], `SUBCATEGORIES.${cat} row keys: ${Object.keys(sc).join(', ')}`);
      // Without this a `subcategory` value cannot be read without also reading `category`.
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
    // buildUnits() drops an unrecognised subcategory into an `_other` section titled by the
    // category. That branch is a fallback for a shape no category has today.
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
  // Labels are 1:1 with keys (D-07), or the nav shows one name for two filters.
  assert.equal(new Set(Object.values(CATEGORY_LABEL)).size, REGISTRY.length);
  // `all` owns no folder, no cards and no tint, so it carries no icon and no tagline either.
  assert.equal(CATEGORY_ICONS.all, undefined);
  assert.equal(CATEGORY_TAGLINE.all, undefined);
  assert.equal(SCHEMES.filter(s => s.category === 'all').length, 0);
  // A category is added in one place: every key that owns cards owns a manifest beside them.
  for (const cat of CATS) assert.equal(manifest(cat).rel, join('js', 'schemes', cat, 'cards.js'));
});

// ---- D-11: the alias map ----

test(`D-11 all ${ALIAS_TOTAL} SCHEME_ALIASES resolve to a live card`, async () => {
  const aliases = await schemeAliases();
  const entries = Object.entries(aliases);
  // Equality both ways on purpose. A dropped alias silently breaks a link published under the old
  // id, and a new one belongs to a rename that should be read alongside it.
  assert.equal(entries.length, ALIAS_TOTAL);
  const dead = entries.filter(([, to]) => !ids.has(to)).map(([from, to]) => `${from} -> ${to}`);
  assert.deepEqual(dead, [], `${dead.length} alias(es) point at a card that no longer exists, so the dialog never opens`);
  // openScheme() resolves once, not in a loop, so an alias whose target is itself an alias key
  // would resolve to nothing.
  const chained = entries.filter(([, to]) => to in aliases).map(([from, to]) => `${from} -> ${to} -> ...`);
  assert.deepEqual(chained, [], `${chained.length} alias chain(s): SCHEME_ALIASES is applied once`);
  // A live id used as an alias key would be rewritten before find() ever saw it.
  const shadowed = entries.filter(([from]) => ids.has(from)).map(([from]) => from);
  assert.deepEqual(shadowed, [], `${shadowed.length} alias key(s) shadow a live card id`);
});

// ---- D-12: the sitemap ----

test('D-12 sitemap.xml lists the three page roots and no unresolvable deep link', async () => {
  const blocks = await sitemapUrls();
  assert.ok(blocks.length >= SITE_ROOTS.length, `sitemap.xml has ${blocks.length} <url> entries`);
  const multi = blocks.filter(locs => locs.length !== 1);
  assert.deepEqual(multi, [], `${multi.length} <url> block(s) do not carry exactly one <loc>`);
  const locs = blocks.map(l => l[0]);
  const missing = SITE_ROOTS.filter(r => !locs.includes(r));
  assert.deepEqual(missing, [], `${missing.length} page root(s) missing from the sitemap`);
  // Today the sitemap carries 0 card deep links: the grid is one page and every card is a hash on
  // it. Any that appear must resolve, through the catalog or through SCHEME_ALIASES.
  const aliases = await schemeAliases();
  const bad = [];
  for (const loc of locs) {
    if (SITE_ROOTS.includes(loc)) continue;
    const m = DEEP_LINK.exec(loc);
    if (!m) { bad.push(`${loc} is neither a page root nor a #scheme= deep link`); continue; }
    const id = aliases[m[1]] || m[1];
    if (!ids.has(id)) bad.push(`${loc} points at a card that does not exist`);
  }
  assert.deepEqual(bad, [], `${bad.length} sitemap entry(ies) resolve to nothing`);
});
