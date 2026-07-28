#!/usr/bin/env node
// check-sources.mjs: liveness and relevance plumbing for SCHEMES[].sources. Fetches every unique
// href, follows redirects, and reports four classes:
//   DEAD    HTTP >= 400, the link is broken outright
//   SOFT    landed on an ANCESTOR of the requested path: the page is gone and the site bounced the
//           reader to a section index, which is a 404 wearing a 200
//   MOVED   landed somewhere else entirely: the link still works but should name its new home
//   ANCHOR  the #fragment does not exist in the page, so the link opens at the top and the reader
//           has to hunt for the paragraph the card is citing
// Side effect that the text pass depends on: every fetched page is cached under .cache/pages, so
// wave B2 can verify narration against the real docs without 600 network round trips.
// node check-sources.mjs [--cached] [--json]
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const CACHE = join(__dirname, '.cache');
const PAGES = join(CACHE, 'pages');
const INDEX = join(CACHE, 'index.json');

const args = process.argv.slice(2);
const cachedOnly = args.includes('--cached');
const asJson = args.includes('--json');

const { SCHEMES } = await import(pathToFileURL(join(__dirname, '..', 'js', 'data.js')).href);

// href -> the cards citing it, so a finding says which cards to go fix.
const cites = new Map();
for (const s of SCHEMES) {
  for (const src of s.sources || []) {
    if (!cites.has(src.href)) cites.set(src.href, []);
    cites.get(src.href).push({ id: s.id, label: src.label });
  }
}
const urls = [...cites.keys()].sort();

await mkdir(PAGES, { recursive: true });
let index = {};
if (existsSync(INDEX)) index = JSON.parse(await readFile(INDEX, 'utf8'));

const slug = u => createHash('sha1').update(u).digest('hex').slice(0, 16) + '.html';

async function load(url) {
  const rec = index[url];
  if (cachedOnly || (rec && rec.ok)) {
    if (rec && existsSync(join(PAGES, rec.file))) {
      return { ...rec, body: await readFile(join(PAGES, rec.file), 'utf8'), fromCache: true };
    }
    if (cachedOnly) return { url, status: 0, finalUrl: url, error: 'not cached', body: '' };
  }
  try {
    const res = await fetch(url, {
      redirect: 'follow',
      headers: { 'user-agent': 'kube.how source check (scheme/tools/check-sources.mjs)' },
    });
    const body = res.ok ? await res.text() : '';
    const file = slug(url);
    if (body) await writeFile(join(PAGES, file), body);
    const rec2 = { url, status: res.status, finalUrl: res.url, file, ok: res.ok };
    index[url] = rec2;
    return { ...rec2, body };
  } catch (e) {
    const rec2 = { url, status: 0, finalUrl: url, error: String(e.message || e), ok: false };
    index[url] = rec2;
    return { ...rec2, body: '' };
  }
}

// Bounded concurrency: 137 URLs at once is rude and gets throttled, one at a time is slow.
async function mapLimit(items, limit, fn) {
  const out = new Array(items.length);
  let next = 0;
  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, async () => {
    for (;;) {
      const i = next++;
      if (i >= items.length) return;
      out[i] = await fn(items[i], i);
    }
  }));
  return out;
}

const findings = [];
const results = await mapLimit(urls, 6, async (url) => {
  const r = await load(url);
  const want = new URL(url);
  const got = (() => { try { return new URL(r.finalUrl || url); } catch (_) { return want; } })();
  const cards = cites.get(url).map(c => c.id);

  if (r.error) { findings.push({ cls: 'DEAD', url, detail: r.error, cards }); return r; }
  if (r.status >= 400) { findings.push({ cls: 'DEAD', url, detail: `HTTP ${r.status}`, cards }); return r; }

  const wp = want.pathname.replace(/\/$/, '');
  const gp = got.pathname.replace(/\/$/, '');
  if (wp !== gp) {
    // An ancestor path means the specific page is gone and the site handed back a section index.
    // Anything else is a genuine move and the card should just name the new address.
    const cls = wp.startsWith(gp + '/') ? 'SOFT' : 'MOVED';
    findings.push({ cls, url, detail: `landed on ${got.href}`, cards });
  }

  if (want.hash && r.body) {
    const frag = decodeURIComponent(want.hash.slice(1));
    const esc = frag.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    // kubernetes.io ships MINIFIED html, so ids come through unquoted (id=emptydir). Demanding
    // quotes reported 49 of 58 anchors dead, all of them false. The optional captured quote plus
    // the trailing lookahead accepts both spellings and still refuses a prefix match, so
    // #emptydir does not silently satisfy itself on id=emptydir-configuration-example.
    // GitHub prefixes heading ids with user-content- and rewrites them client side: both count.
    const re = new RegExp(`(?:id|name)=(["']?)(?:user-content-)?${esc}\\1(?=[\\s/>])`, 'i');
    if (!re.test(r.body)) findings.push({ cls: 'ANCHOR', url, detail: `#${frag} not found in the page`, cards });
  }
  return r;
});

await writeFile(INDEX, JSON.stringify(index, null, 1));

const order = { DEAD: 0, SOFT: 1, MOVED: 2, ANCHOR: 3 };
findings.sort((a, b) => order[a.cls] - order[b.cls] || a.url.localeCompare(b.url));

if (asJson) {
  console.log(JSON.stringify({ urls: urls.length, findings }, null, 1));
} else {
  let cls = null;
  for (const f of findings) {
    if (f.cls !== cls) { cls = f.cls; console.log(`\n${cls}`); }
    console.log(`  ${f.url}`);
    console.log(`    ${f.detail}`);
    console.log(`    cited by: ${f.cards.join(', ')}`);
  }
  const byCls = {};
  for (const f of findings) byCls[f.cls] = (byCls[f.cls] || 0) + 1;
  const cached = results.filter(r => r.fromCache).length;
  console.log(`\nsources check: ${urls.length} unique urls over ${SCHEMES.length} cards` +
    ` (${cached} served from .cache), ${findings.length} finding(s)` +
    (findings.length ? `: ${Object.entries(byCls).map(([k, v]) => `${k} ${v}`).join(', ')}` : ''));
}
process.exit(findings.length ? 1 : 0);
