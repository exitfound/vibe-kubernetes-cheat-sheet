#!/usr/bin/env node
// gaps.mjs: what a section does NOT teach. The other two tools of this skill answer "what is in
// this section". This one answers the question the skill is actually reached for, by fetching the
// kubernetes.io trees the section already reads and diffing their first-class topics against the
// cards that are here.
//
//   node .claude/skills/section-review/tools/gaps.mjs <category>/<section>
//   node .claude/skills/section-review/tools/gaps.mjs <category>          every section of it
//     --absent          list only the topics nothing here teaches
//     --top=N           how many of the undisposed absences get a detail block (default 15)
//     --min-cite=N      read only trees this section cites at least N times (default 1)
//     --stage=MODE      open topic pages for a feature stage: none, gaps (default), all
//     --refresh         ignore the cache and fetch every page again
//     --offline         never touch the network, answer from the cache alone
//     --json            the whole result as one object, for diffing two runs
//
// Runs from anywhere: paths are resolved against this file, and the only import outside the skill
// is scheme/test/fixtures/catalog.mjs, which reaches node builtins only. No npm dependency, no
// browser, no server. Node's built-in fetch is the whole network layer.
//
// WHY THIS EXISTS. The gap half of this skill used to be a manual fetch of documentation trees,
// which is the most expensive step in the procedure and the one most likely to be skipped or half
// done. The map of which tree a section reads was already mined into reference/upstream.md and sat
// there as prose. This turns it into data, and closes the loop at the other end by reading the
// declined ledger, so a proposal the user has already turned down never comes back.
//
// THE ONE RULE UNDER EVERYTHING HERE. A citation is NOT coverage. Nineteen of volumes-claims's
// citations land in /concepts/storage, which proves the section reads that tree and proves nothing
// about what it covers. So a page a card merely cites can reach PARTIAL and can never reach
// COVERED. COVERED is decided from card NAMES, the same definition overlap.mjs already uses for
// "owns a term", because the card whose title carries the words is the card a reader lands on.
// The `first source` marker on a PARTIAL row is the tool naming its own likeliest promotion, for a
// human to rule on. It is never applied automatically.
//
// WHAT IT CANNOT SEE, and the list is not short.
//   * Whether a topic DESERVES a card. Everything below is upstream's editorial shape, not this
//     catalog's. A page can be absent because a sibling section owns it, because a SCOPE block
//     cedes it on purpose, or because it is not worth a diagram, and only a human says which.
//   * Whether a card is any good, whether its picture matches its words, whether the order teaches.
//   * A topic taught under another name. COVERED is a token match over an id and a title, so a card
//     that teaches projected volumes and calls itself something else reads ABSENT here.
//   * A page split across several cards. One large upstream page covered by six cards reads
//     PARTIAL, because no single card is named after the whole of it. That is the commonest false
//     finding this tool produces and the evidence columns are there to settle it in one look.
//   * The difference between a card NAMED after a page and one whose name merely CONTAINS its
//     words. COVERED is a subset test, so `Deployments` reads COVERED off `Deployment Rolling
//     Update`. That is the one way this tool over-reports COVERAGE and it is OPEN: the guard in
//     classify() below closes the scenery-word half of it and nothing closes the rest.
//   * Anything outside kubernetes.io. The map carries etcd.io, raft.github.io and github.com trees
//     and this tool lists them and does not fetch them: they have no shared index shape to parse.
//   * Freshness beyond the cache. A cached tree is what upstream looked like when it was written,
//     and the header prints how old the oldest entry used is.
//
// THE CACHE holds the EXTRACTED result rather than the page, because an index page is half a
// megabyte and the extract is a few hundred bytes. A change to the extraction below therefore
// needs a re-fetch, which the PARSER stamp forces on its own: bump it and every stale entry is
// refetched without anyone having to remember --refresh.
import { schemes, subcategories, ROOT } from '../../../../scheme/test/fixtures/catalog.mjs';
import { walkStrings, sourcePath, NOT_A_TOPIC } from './bands.mjs';
import { readFileSync, readdirSync, existsSync, mkdirSync, writeFileSync, statSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const UPSTREAM_DOC = join(HERE, '..', 'reference', 'upstream.md');
const CACHE_DIR = join(HERE, '..', 'cache');
const PARSER = 2;
const HOST = 'https://kubernetes.io';
const POOL = 5;
const TIMEOUT_MS = 20000;

// ---------------------------------------------------------------------------------------------
// arguments
// ---------------------------------------------------------------------------------------------
const args = process.argv.slice(2);
const flags = Object.fromEntries(args.filter(a => a.startsWith('--')).map(a => {
  const [k, v = 'true'] = a.slice(2).split('='); return [k, v];
}));
const target = args.find(a => !a.startsWith('--'));
if (!target) {
  console.error('Usage: node gaps.mjs <category>[/<section>] [--absent] [--top=N] [--min-cite=N]');
  console.error('       [--stage=none|gaps|all] [--refresh] [--offline] [--json]');
  process.exit(1);
}
const MIN_CITE = Number(flags['min-cite'] || 1);
const STAGE_MODE = String(flags.stage || 'gaps');
if (!['none', 'gaps', 'all'].includes(STAGE_MODE)) {
  console.error(`unknown --stage=${STAGE_MODE}. One of: none, gaps, all`);
  process.exit(1);
}
const OFFLINE = flags.offline === 'true';
const REFRESH = flags.refresh === 'true';

const SUBS = await subcategories();
const [cat, sec] = target.split('/');
if (!SUBS[cat]) {
  console.error(`unknown category "${cat}". Known: ${Object.keys(SUBS).join(', ')}`);
  process.exit(1);
}
if (sec && !SUBS[cat].some(s => s.key === sec)) {
  console.error(`unknown section "${sec}" in ${cat}. Known: ${SUBS[cat].map(s => s.key).join(', ')}`);
  process.exit(1);
}
const wanted = sec ? SUBS[cat].filter(s => s.key === sec) : SUBS[cat];

// ---------------------------------------------------------------------------------------------
// words. A topic is matched by its TOKENS rather than its string, because upstream writes
// "Persistent Volumes" and a card id writes `persistent-volume`.
// ---------------------------------------------------------------------------------------------
const STOP = new Set(['and', 'or', 'the', 'a', 'an', 'of', 'in', 'on', 'for', 'to', 'with', 'from',
  'using', 'use', 'your', 'you', 'its', 'it', 'this', 'that', 'other', 'more', 'about', 'entire',
  'section', 'print', 'overview', 'concept', 'guide', 'docs', 'doc', 'k8s']);

const singular = (w) => {
  if (w.length <= 3) return w;
  if (/(ss|us|is)$/.test(w)) return w;
  if (/(ches|shes|sses|xes|zes)$/.test(w)) return w.slice(0, -2);
  if (/ies$/.test(w)) return `${w.slice(0, -3)}y`;
  if (/s$/.test(w)) return w.slice(0, -1);
  return w;
};

const raw = (text) => String(text).toLowerCase().split(/[^a-z0-9+]+/)
  .filter(w => w.length > 1).map(singular);

// The scenery list bands.mjs already carries is exactly the set of words a topic cannot be ABOUT
// in this catalog, so it is reused here rather than re-derived. It is applied to the TOPIC only:
// a card's own name keeps every word, or the fallback below would have nothing to match against.
const SCENERY = new Set([...NOT_A_TOPIC].map(t => singular(t.toLowerCase())));

// Filtered tokens, falling back to the unfiltered set when filtering empties it. `/concepts/
// storage/volumes/` is the case that needs the fallback: every word it has is scenery, and a topic
// with no tokens can be neither covered nor absent, only invisible.
const topicTokens = (text) => {
  const all = raw(text);
  const kept = all.filter(w => !STOP.has(w) && !SCENERY.has(w));
  return [...new Set(kept.length ? kept : all)];
};
// TRUE when the fallback above is the only reason this text has tokens at all: every word it holds
// is scenery or a stop word, so the tokens name no subject. Such a set is still matched for PARTIAL
// and still listed, and it is refused for COVERED in classify() below. See the note there.
const sceneryOnly = (text) => {
  const all = raw(text);
  return all.length > 0 && all.every(w => STOP.has(w) || SCENERY.has(w));
};
const nameTokens = (text) => [...new Set(raw(text).filter(w => !STOP.has(w)))];

const subset = (small, big) => small.length > 0 && small.every(w => big.includes(w));
const esc = t => t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const inText = (tok, text) => new RegExp(`(?<![\\w-])${esc(tok)}s?(?![\\w-])`, 'i').test(text);
const allInText = (toks, text) => toks.length > 0 && toks.every(t => inText(t, text));

// ---------------------------------------------------------------------------------------------
// reference/upstream.md: the tree map and the declined ledger, both parsed rather than recalled.
// The map's shape is a `### <category>/<section>` heading followed by one fenced block whose lines
// are `<count><spaces><comma separated paths>`, with indented continuation lines belonging to the
// count above them. That is the shape the file was mined into and this reader does not change it.
// ---------------------------------------------------------------------------------------------
function readUpstream() {
  const text = readFileSync(UPSTREAM_DOC, 'utf8');
  const lines = text.split('\n');
  const map = new Map();
  const declined = [];

  let key = null;
  let fenced = false;
  let count = 0;
  for (const line of lines) {
    const head = line.match(/^###\s+([a-z-]+)\/([a-z-]+)\s*$/);
    if (head) { key = `${head[1]}/${head[2]}`; map.set(key, []); fenced = false; continue; }
    if (/^##\s/.test(line)) { key = null; fenced = false; }
    if (key && line.trim() === '```') { fenced = !fenced; continue; }
    if (key && fenced) {
      const m = line.match(/^(\d+)\s+(.*)$/);
      const body = m ? m[2] : (/^\s+\S/.test(line) ? line.trim() : null);
      if (m) count = Number(m[1]);
      if (body === null) continue;
      for (const p of body.split(',').map(s => s.trim()).filter(Boolean)) {
        map.get(key).push({ path: p, cites: count });
      }
      continue;
    }
    // The ledger. Five columns, and a row is skipped unless its Section cell carries something:
    // the header, the divider and the empty seed row all fail that test.
    const cells = line.match(/^\|(.+)\|\s*$/);
    if (!cells) continue;
    const cols = cells[1].split('|').map(c => c.trim());
    if (cols.length !== 5) continue;
    if (!cols[0] || /^-+$/.test(cols[0]) || cols[0].toLowerCase() === 'section') continue;
    declined.push({ section: cols[0], topic: cols[1], page: cols[2], on: cols[3], why: cols[4] });
  }
  return { map, declined };
}

const { map: TREE_MAP, declined: DECLINED } = readUpstream();

// ---------------------------------------------------------------------------------------------
// the catalog. Every card, because "another section already owns this" is a disposition the GAPS
// lane has to state and it cannot be seen from inside one section.
// ---------------------------------------------------------------------------------------------
const ALL = await schemes();
const cards = [];
for (const e of ALL) {
  const rel = join('js', 'schemes', e.category, `${e.id}.js`);
  const ns = await import(pathToFileURL(join(ROOT, rel)).href);
  const steps = Array.isArray(ns.STEPS_SPEC) ? ns.STEPS_SPEC : [];
  const text = [e.desc, ...steps.flatMap(s => walkStrings(s)), ...walkStrings(ns.SCENE || {})].join('\n');
  const sources = (e.sources || []).map(s => sourcePath(s.href).replace(/#.*$/, '').replace(/\/$/, ''));
  cards.push({
    id: e.id, title: e.title, category: e.category, subcategory: e.subcategory,
    sources, text, names: nameTokens(`${e.id.replace(/^[a-z]+-/, '')} ${e.title}`),
  });
}

// Every SCOPE block in the four records, as one blob per block, CARRYING THE CARD IT BELONGS TO. A
// SCOPE line sits at column 0 and its continuation lines are indented, which is the shape the
// record vocabulary fixes. The owner matters: a block in another category ceding a topic says
// nothing about this section, and matching against all of them was reporting cluster records as a
// reason a storage topic is absent.
function readScopes() {
  const out = [];
  const dirs = readdirSync(join(ROOT, 'js', 'schemes'), { withFileTypes: true })
    .filter(d => d.isDirectory()).map(d => d.name);
  const files = [];
  for (const d of dirs) {
    const one = join(ROOT, 'js', 'schemes', d, 'CARDS.md');
    if (existsSync(one)) files.push([one, null]);
    const split = join(ROOT, 'js', 'schemes', d, 'CARDS');
    if (existsSync(split)) {
      for (const f of readdirSync(split)) if (f.endsWith('.md')) files.push([join(split, f), f.replace(/\.md$/, '')]);
    }
  }
  for (const [f, fixedOwner] of files) {
    const lines = readFileSync(f, 'utf8').split('\n');
    let owner = fixedOwner;
    for (let i = 0; i < lines.length; i++) {
      const head = lines[i].match(/^##\s+([a-z][a-z0-9-]+)\s*$/);
      if (head && !fixedOwner) owner = head[1];
      if (!/^SCOPE\s/.test(lines[i])) continue;
      const block = [lines[i].replace(/^SCOPE\s+/, '')];
      for (let j = i + 1; j < lines.length && /^\s{2,}\S/.test(lines[j]); j++) block.push(lines[j].trim());
      out.push({ owner, where: `${f.replace(`${ROOT}/`, '')}:${i + 1}`, text: block.join(' ') });
    }
  }
  return out;
}
const SCOPES = readScopes();

// ---------------------------------------------------------------------------------------------
// the network, with the cache in front of it
// ---------------------------------------------------------------------------------------------
// A 404 on one tree index is NOT the network being down, and conflating the two was the first bug
// this counter had: `/reference/generated` is in the map and is not a page, so one 404 was flipping
// a run served entirely from cache into UNVERIFIED. `transport` counts only the failures that mean
// nothing can be reached at all.
const netlog = { attempted: 0, fetched: 0, cached: 0, missing: 0, transport: 0, ages: [], reason: null, http: [] };

const cacheFile = (url) => join(CACHE_DIR, `${url.replace(HOST, '').replace(/[^a-z0-9]+/gi, '-').replace(/^-|-$/g, '')}.json`);

function readCache(url) {
  const f = cacheFile(url);
  if (!existsSync(f)) return null;
  try {
    const rec = JSON.parse(readFileSync(f, 'utf8'));
    if (rec.v !== PARSER) return null;
    rec.ageDays = Math.round((Date.now() - statSync(f).mtimeMs) / 86400000);
    return rec;
  } catch { return null; }
}

function writeCache(url, rec) {
  mkdirSync(CACHE_DIR, { recursive: true });
  writeFileSync(cacheFile(url), `${JSON.stringify({ ...rec, v: PARSER, url, at: new Date().toISOString() }, null, 1)}\n`);
}

// kubernetes.io ships minified HTML with UNQUOTED href attributes, which is why this accepts a
// bare value. A regex over the sidebar is enough here and a parser would be a dependency.
const LINK = /<a[^>]*\shref=["']?(\/docs\/[^"'\s>#?]*)["']?[^>]*>([\s\S]*?)<\/a>/g;

function extractChildren(html, prefix) {
  const seen = new Map();
  for (const m of html.matchAll(LINK)) {
    const href = m[1];
    if (!href.startsWith(prefix)) continue;
    const rest = href.slice(prefix.length).replace(/\/$/, '');
    if (!rest || rest.includes('/') || rest.startsWith('_')) continue;
    const title = m[2].replace(/<[^>]*>/g, ' ').replace(/&amp;/g, '&').replace(/\s+/g, ' ').trim();
    if (!title || seen.has(href)) continue;
    seen.set(href, title);
  }
  return [...seen].map(([url, title]) => ({ url, title }));
}

// A page states its stage in a `feature-state-stage` span, or states nothing at all, which is what
// a long-stable core page does. Absence is reported as absence and never as stable.
//
// THE ENTITY DECODE IS NOT COSMETIC. On some pages the only copy of the banner in the markup sits
// inside a tooltip attribute as escaped HTML, so a search of the raw bytes for `Feature state:`
// finds `&lt;/span&gt;` behind the colon and a looser capture prints that as the stage. Decoding
// first makes the two forms one form, which is why the class name is the anchor rather than the
// words after the colon.
function extractStage(html) {
  const text = html.replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&amp;/g, '&');
  const m = text.match(/feature-state-stage"?>\s*(Alpha|Beta|Stable|Deprecated)\s*<\/span>([^<]{0,90})/i);
  if (!m) return null;
  let stage = m[1][0].toUpperCase() + m[1].slice(1).toLowerCase();
  let tail = (m[2] || '').replace(/\s+/g, ' ');
  const since = tail.match(/^\s*since\s+Kubernetes\s+(v[\d.]+)/i);
  if (since) { stage += ` since ${since[1]}`; tail = tail.slice(since[0].length); }
  const clause = tail.match(/^\s*[;,]\s*([^.;]{3,50})/);
  if (clause) stage += `, ${clause[1].trim()}`;
  return stage;
}

async function fetchText(url) {
  const res = await fetch(url, {
    signal: AbortSignal.timeout(TIMEOUT_MS),
    headers: { 'user-agent': 'kube-how-section-review/1 (+local docs coverage diff)' },
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.text();
}

// One page, cache first. `kind` decides what is extracted and therefore what is stored.
async function load(url, kind) {
  if (!REFRESH) {
    const hit = readCache(url);
    if (hit && hit.kind === kind) { netlog.cached++; netlog.ages.push(hit.ageDays); return hit; }
  }
  if (OFFLINE) { netlog.missing++; return null; }
  netlog.attempted++;
  try {
    const html = await fetchText(url);
    const rec = kind === 'index'
      ? { kind, topics: extractChildren(html, new URL(url).pathname) }
      : { kind, stage: extractStage(html) };
    writeCache(url, rec);
    netlog.fetched++;
    return { ...rec, ageDays: 0 };
  } catch (err) {
    const msg = String(err.message || err);
    netlog.missing++;
    if (/^HTTP \d+$/.test(msg)) netlog.http.push(`${url.replace(HOST, '')} ${msg}`);
    else { netlog.transport++; netlog.reason = netlog.reason || msg; }
    return null;
  }
}

async function pool(items, fn) {
  const out = new Array(items.length);
  let next = 0;
  await Promise.all(Array.from({ length: Math.min(POOL, items.length) }, async () => {
    for (let i = next++; i < items.length; i = next++) out[i] = await fn(items[i], i);
  }));
  return out;
}

// ---------------------------------------------------------------------------------------------
// the diff
// ---------------------------------------------------------------------------------------------
const declinedFor = (key, topic, toks) => DECLINED.find((d) => {
  const scope = d.section.replace(/`/g, '').trim();
  if (scope !== '*' && scope !== key && scope !== key.split('/')[1]) return false;
  const page = d.page.replace(/`/g, '').replace(/\/$/, '').trim();
  if (page && page !== '-' && topic.url.replace(/\/$/, '').endsWith(page.replace(/^https?:\/\/[^/]+/, ''))) return true;
  const rowToks = topicTokens(d.topic.replace(/`/g, ''));
  return subset(rowToks, toks) || subset(toks, rowToks);
});

function classify(topic, mine, key) {
  const slugText = topic.url.replace(/\/$/, '').split('/').pop().replace(/-/g, ' ');
  const slugToks = topicTokens(slugText);
  const titleToks = topicTokens(topic.title);
  const toks = [...new Set([...slugToks, ...titleToks])];
  const slugScenery = sceneryOnly(slugText);
  const titleScenery = sceneryOnly(topic.title);
  const page = topic.url.replace(/\/$/, '');

  // COVERED is a SUBSET test over the card's name tokens, and a subset test is only as strong as
  // the smaller side. A topic whose whole token set is scenery (`controllers`, `volumes`) is one
  // generic word wide, and one generic word is a subset of a great many card names: on 2026-09-04
  // the `/concepts/workloads/controllers/` index, titled `Workload Management` and slugged
  // `controllers`, was reported `COVERED  named by workloads-daemonset` because that card is titled
  // `DaemonSet Controller`. A false COVERED is worse than a false ABSENT, because it deletes the
  // row from the report instead of over-listing it, so a scenery-only side of the match is refused
  // here. The topic keeps its tokens everywhere else: it can still reach PARTIAL, and an ABSENT one
  // still carries its evidence.
  //
  // THIS IS A GUARD, NOT A REPAIR OF THE MATCHER. The test stays loose wherever the topic's words
  // are real ones: a card whose name merely CONTAINS them still reads COVERED, so `Deployments` is
  // COVERED by `Deployment Rolling Update`, which is named after one section of that page.
  // Appendix B of SKILL.md carries that one as open.
  const owns = (c) => (!slugScenery && subset(slugToks, c.names))
    || (!titleScenery && subset(titleToks, c.names));
  const here = mine.filter(owns).sort((a, b) => a.names.length - b.names.length);
  const citers = mine.filter(c => c.sources.includes(page));
  const firstSource = mine.find(c => c.sources[0] === page);
  const touchers = mine.filter(c => allInText(slugToks, c.text) || allInText(titleToks, c.text));
  const away = cards.filter(c => c.subcategory !== key.split('/')[1] && owns(c));
  const ids = new Set(mine.map(c => c.id));
  const ceded = SCOPES.filter(s => ids.has(s.owner))
    .filter(s => allInText(slugToks, s.text) || allInText(titleToks, s.text));

  const verdict = here.length ? 'COVERED' : (citers.length || touchers.length) ? 'PARTIAL' : 'ABSENT';

  // Where a new card would sit. The best-matching card is the one whose own text carries the most
  // of the topic's tokens, and the pair reported is that card and its manifest successor. It is a
  // starting point for the argument in G4, never the argument.
  let between = null;
  if (verdict !== 'COVERED' && mine.length > 1) {
    const scored = mine.map((c, i) => ({ i, n: toks.filter(t => inText(t, c.text)).length }));
    const best = scored.reduce((a, b) => (b.n > a.n ? b : a), scored[0]);
    const anchored = best.n > 0;
    const i = anchored ? best.i : mine.length - 1;
    const j = i < mine.length - 1 ? i : i - 1;
    between = {
      after: mine[j].id, afterPos: j + 1, before: mine[j + 1].id, beforePos: j + 2,
      anchored, hits: best.n,
    };
  }

  return {
    title: topic.title,
    // A trailing slash on every topic URL, because a few sidebar links ship without one and the
    // ledger matches on the path: two spellings of one page would be two topics to decline.
    url: `${HOST}${page}/`,
    verdict,
    tokens: toks,
    covered: here.map(c => c.id),
    cited: citers.map(c => c.id),
    firstSource: firstSource ? firstSource.id : null,
    touched: touchers.map(c => c.id),
    elsewhere: away.map(c => `${c.id} (${c.category}/${c.subcategory})`),
    ceded: ceded.map(s => s.where),
    between,
    stage: undefined,
    declined: declinedFor(key, topic, toks),
  };
}

// ---------------------------------------------------------------------------------------------
// run
// ---------------------------------------------------------------------------------------------
const out = { category: cat, offline: OFFLINE, network: null, sections: [] };

for (const s of wanted) {
  const key = `${cat}/${s.key}`;
  const mine = cards.filter(c => c.category === cat && c.subcategory === s.key);
  const mapped = (TREE_MAP.get(key) || []).filter(t => t.cites >= MIN_CITE);
  const trees = mapped.filter(t => t.path.startsWith('/'));
  const foreign = mapped.filter(t => !t.path.startsWith('/'));

  const loaded = await pool(trees, t => load(`${HOST}/docs${t.path}/`, 'index'));

  const treeRows = [];
  const topics = [];
  for (let i = 0; i < trees.length; i++) {
    const rec = loaded[i];
    const row = {
      path: trees[i].path, cites: trees[i].cites, url: `${HOST}/docs${trees[i].path}/`,
      read: Boolean(rec), ageDays: rec ? rec.ageDays : null, topics: [],
    };
    if (rec) {
      for (const t of rec.topics) {
        const c = classify(t, mine, key);
        c.tree = trees[i].path;
        row.topics.push(c);
        topics.push(c);
      }
    }
    treeRows.push(row);
  }

  const filtered = topics.filter(t => t.declined);
  const live = topics.filter(t => !t.declined);

  const stageWanted = STAGE_MODE === 'all' ? live
    : STAGE_MODE === 'gaps' ? live.filter(t => t.verdict !== 'COVERED') : [];
  const stages = await pool(stageWanted, t => load(t.url, 'page'));
  stageWanted.forEach((t, i) => { t.stage = stages[i] ? (stages[i].stage || 'not stated') : null; });

  // The shortlist: ABSENT with NO disposition. A topic a sibling section already owns by name, or
  // one a SCOPE block here already cedes, is an absence with its answer attached and belongs in
  // the listing rather than in the proposals. What is left is what nobody has ruled on yet.
  //
  // The order is the section's OWN reading of upstream, not upstream's: a tree this section cites
  // fifteen times is its home tree and a tree it cites once is a reference it reached for, so the
  // citation count leads and the lexical anchor breaks the tie. It is a reading order for a human,
  // never a ranking of what the section needs, which is G4 and is not a tool's judgement.
  const citesOf = new Map(trees.map(t => [t.path, t.cites]));
  const shortlist = live
    .filter(t => t.verdict === 'ABSENT' && !t.elsewhere.length && !t.ceded.length)
    .map(t => ({ ...t, cites: citesOf.get(t.tree) || 0, hits: t.between ? t.between.hits : 0 }))
    .sort((a, b) => (b.cites - a.cites) || (b.hits - a.hits) || a.title.localeCompare(b.title));

  out.sections.push({
    key: s.key, label: s.label, cards: mine.length,
    trees: treeRows, foreign: foreign.map(f => f.path), topics: live, declined: filtered, shortlist,
  });
}

// UNVERIFIED is the whole run resting on the cache. It is true when nothing was allowed to reach
// the network, and when everything that tried to reach it failed to get there at all. A page that
// answered with a 404 was reached, so it says nothing about the rest of the run.
const UNVERIFIED = OFFLINE || (netlog.attempted > 0 && netlog.fetched === 0 && netlog.transport > 0);
out.network = {
  attempted: netlog.attempted, fetched: netlog.fetched, fromCache: netlog.cached,
  unread: netlog.missing, transportFailures: netlog.transport, httpFailures: netlog.http,
  oldestCacheDays: netlog.ages.length ? Math.max(...netlog.ages) : null,
  reason: netlog.reason, unverified: UNVERIFIED,
};

if (flags.json === 'true') {
  // A tree row carries its topics only so the printer can group by tree. In the JSON they would be
  // a second copy of `section.topics`, which every topic already tags with `tree`, and a diff of
  // two runs would then report every change twice.
  const lean = {
    ...out,
    unverified: UNVERIFIED,
    sections: out.sections.map(s => ({
      ...s,
      trees: s.trees.map(({ topics, ...t }) => ({
        ...t,
        counts: Object.fromEntries(['COVERED', 'PARTIAL', 'ABSENT']
          .map(v => [v, topics.filter(x => !x.declined && x.verdict === v).length])),
      })),
    })),
  };
  console.log(JSON.stringify(lean, null, 2));
  process.exit(0);
}

// ---------------------------------------------------------------------------------------------
// print
// ---------------------------------------------------------------------------------------------
const pad = (v, n) => String(v).padEnd(n);
const num = (v, n) => String(v).padStart(n);
const clip = (v, n) => (String(v).length > n ? `${String(v).slice(0, n - 1)}…` : String(v));
// With no network every verdict below rests on a cache entry nobody confirmed this run, so every
// verdict carries the mark rather than the header carrying it alone. A reader who scrolls past a
// header has still been told.
const MARK = () => (UNVERIFIED ? '*' : '');
// The listing groups by tree and prints the tree URL above it, so a row carries the child alone.
const slug = (url) => url.replace(/\/$/, '').split('/').pop();

console.log('\nA citation is not coverage. COVERED here means a card in this section is NAMED after the');
console.log('page, PARTIAL means a card cites or mentions it, ABSENT means neither. This tool cannot say');
console.log('whether a topic deserves a card: a sibling section may own it, a SCOPE block may cede it, or');
console.log('it may not be worth a diagram. It reads kubernetes.io trees only, and only the pages an index');
console.log('lists as its own children. Every row below is evidence for a human to rule on.');

if (UNVERIFIED) {
  console.log(`\nNETWORK  ${OFFLINE ? '--offline was passed, so nothing was fetched' : `unreachable (${netlog.reason})`}.`);
  console.log('         Everything below comes from the cache and is UNVERIFIED. Trees with no cache entry');
  console.log('         are listed as unread and contribute no topics at all.');
} else {
  console.log(`\nNETWORK  live. ${netlog.fetched} page(s) fetched, ${netlog.cached} served from cache${netlog.ages.length ? `, oldest ${Math.max(...netlog.ages)}d` : ''}, ${netlog.missing} unread.`);
  for (const h of netlog.http) console.log(`         answered but not a page: ${h}`);
}
console.log(`CACHE    ${CACHE_DIR.replace(`${process.cwd()}/`, '')}  (--refresh to rebuild it)`);

for (const s of out.sections) {
  console.log(`\n${'='.repeat(100)}`);
  console.log(`${cat}/${s.key}  "${s.label}"  ${s.cards} cards`);
  console.log('='.repeat(100));

  console.log(`\nTREES READ  from reference/upstream.md, filtered to cites >= ${MIN_CITE}`);
  for (const t of s.trees) {
    const seen = t.topics.filter(x => !x.declined);
    const n = (v) => seen.filter(x => x.verdict === v).length;
    const status = t.read
      ? `${num(seen.length, 3)} topics   COVERED ${n('COVERED')}  PARTIAL ${n('PARTIAL')}  ABSENT ${n('ABSENT')}${t.ageDays ? `   cache ${t.ageDays}d` : ''}`
      : (UNVERIFIED ? '  not read, no cache entry' : '  not read, index unavailable');
    console.log(`  ${num(t.cites, 3)}x  ${pad(t.path, 44)}${status}`);
  }
  if (s.foreign.length) {
    console.log(`  not fetched, outside kubernetes.io: ${s.foreign.join(', ')}`);
  }
  if (!s.trees.length) console.log('  none. This section has no tree map in reference/upstream.md.');

  // ---- the listing. One line per topic, because the whole point is that a reviewer reads all of
  // it rather than the six rows that fit on a screen. The evidence tail is what settles the row.
  const rows = flags.absent === 'true' ? s.topics.filter(t => t.verdict === 'ABSENT') : s.topics;
  const counts = ['COVERED', 'PARTIAL', 'ABSENT'].map(v => `${v} ${s.topics.filter(t => t.verdict === v).length}`);
  console.log(`\nTOPICS  ${s.topics.length} first-class upstream pages   ${counts.join('   ')}`);
  if (flags.absent === 'true') console.log('        --absent was passed, so only the ABSENT rows are listed.');
  if (UNVERIFIED) console.log('        * UNVERIFIED: read from the cache and not confirmed against upstream on this run.');

  for (const tree of s.trees) {
    const here = rows.filter(t => t.tree === tree.path);
    if (!here.length) continue;
    console.log(`\n  ${tree.url}`);
    for (const t of here) {
      let tail = '';
      if (t.verdict === 'COVERED') tail = `named by ${t.covered.join(', ')}`;
      else if (t.cited.length) tail = `cited by ${t.cited.length} here${t.firstSource ? `, first source of ${t.firstSource}` : ''}`;
      else if (t.touched.length) tail = `mentioned in ${t.touched.length} here`;
      if (t.verdict !== 'COVERED' && t.elsewhere.length) tail += `${tail ? '. ' : ''}owned elsewhere by ${t.elsewhere[0]}${t.elsewhere.length > 1 ? ` +${t.elsewhere.length - 1}` : ''}`;
      if (t.verdict === 'ABSENT' && t.ceded.length) tail += `${tail ? '. ' : ''}ceded by a SCOPE block at ${t.ceded[0]}`;
      if (t.verdict === 'ABSENT' && !tail) tail = t.stage === undefined ? 'nothing here names, cites or mentions it' : `stage ${t.stage === null ? 'UNVERIFIED' : t.stage}`;
      console.log(`    ${pad(t.verdict + MARK(), 9)}${pad(clip(t.title, 44), 46)}${pad(clip(slug(t.url), 32), 34)}${tail}`);
    }
  }

  // ---- the proposals. Everything above minus the absences that already have an answer.
  const TOP = Number(flags.top || 15);
  console.log(`\nABSENT WITH NO DISPOSITION  (${s.shortlist.length} of ${s.topics.filter(t => t.verdict === 'ABSENT').length} absences)`);
  console.log('  No card here names it, no card elsewhere owns it, no SCOPE block cedes it. That is a');
  console.log('  candidate and not yet a gap: the reader still has to say what it would cost to be without it.');
  console.log('  Ordered by how heavily this section cites the tree it came from, then by lexical anchor.');
  s.shortlist.slice(0, TOP).forEach((t, i) => {
    console.log(`\n  ${num(i + 1, 3)}. ${t.title}   [${t.tree}, cited ${t.cites}x by this section]`);
    console.log(`       ${t.url}`);
    const st = t.stage === undefined ? 'not read, --stage=none was passed'
      : t.stage === null ? 'UNVERIFIED, the page was not read'
      : `${t.stage}${UNVERIFIED ? '   UNVERIFIED, from the cache' : ''}`;
    console.log(`       stage         ${st}`);
    if (t.between) {
      const how = t.between.anchored ? `#${t.between.afterPos} already uses ${t.between.hits} of its words` : 'no card here uses its words, so this is the tail of the section';
      console.log(`       sits between  #${t.between.afterPos} ${t.between.after}  ..  #${t.between.beforePos} ${t.between.before}   (${how})`);
    } else {
      console.log('       sits between  nothing to sit between, this section is too small to place it');
    }
    if (t.cited.length) console.log(`       note          already cited by ${t.cited.join(', ')}, and a citation is not coverage`);
  });
  if (s.shortlist.length > TOP) {
    console.log(`\n  ${s.shortlist.length - TOP} more, listed above and not detailed here. --top=${s.shortlist.length} for all of them:`);
    console.log(`  ${s.shortlist.slice(TOP).map(t => t.title).join(' | ')}`);
  }
  if (!s.shortlist.length) console.log('\n  none. Every absence in this section already has an answer attached.');

  if (s.declined.length) {
    console.log(`\nDECLINED AND FILTERED OUT  (${s.declined.length}, from the ledger in reference/upstream.md)`);
    for (const t of s.declined) console.log(`  ${pad(clip(t.title, 44), 46)}${t.declined.why}`);
  } else {
    console.log('\nDECLINED AND FILTERED OUT  none. The ledger holds no row matching this section.');
  }
}

console.log('\nABSENT is a lead, not a gap. Say for every absence you do not promote which it is: owned by a');
console.log('sibling section, ceded by a SCOPE block, or not worth a diagram.');
