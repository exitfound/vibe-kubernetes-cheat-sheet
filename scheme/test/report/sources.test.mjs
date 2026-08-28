// sources.test.mjs: liveness of every href in SCHEMES[].sources. Successor to
// tools/check-sources.mjs.
//
// WHY THIS CAN NEVER BE MANDATORY. It needs the public internet. The ancestor was never in the gate
// for exactly that reason, and the reason is not squeamishness: a run with no route out produces
// one finding per url, so a laptop on a plane reports the entire bibliography of the catalog as
// broken. That output is worse than no output, because it is one confident false statement per url
// about somebody else's website. Everything below is arranged around making that impossible.
//
// THE ONE THING THIS FILE OWES ABOVE ALL ELSE. With no network it must say `REPORT INVALID: no
// network` and PASS, not print findings. Two independent guards, because one is not enough:
//
//   1. A preflight to two hosts that have nothing to do with the catalog. Two, so a single site
//      being down is not mistaken for the internet being down; unrelated to the catalog, so a
//      genuinely dead kubernetes.io reads as 132 real findings and not as "we are offline". ANY
//      answer counts as reachable, including a 500: the question is whether packets leave, not
//      whether a page is healthy.
//   2. A post-hoc guard on the walk itself. If every single url failed at the TRANSPORT layer (DNS,
//      connect, TLS, timeout) then the network went away after the preflight, and the run is
//      invalid however green the preflight was. A DEAD verdict needs an HTTP status behind it, and
//      a run where nothing ever got a status has measured nothing.
//
// NO CACHE, DELIBERATELY. The ancestor wrote every fetched page under .cache/pages, and its own
// header explains the trap in capitals: A WARM CACHE MAKES THIS CHECK STOP CHECKING. Once a url had
// a good record it was never fetched again, so a run could report zero findings having proved
// nothing about today, and only --refresh made green mean anything. The cache had one real
// consumer, a planned text pass that would verify narration against the real docs without hundreds
// of round trips, and that pass does not exist. A store whose only reader is hypothetical, and
// whose presence silently disables the check, is not worth the page files or the .gitignore line.
// The whole bibliography at concurrency 6 takes well under a minute. If the text pass is ever built, it should own
// its own store and its own staleness policy rather than inherit this one by accident.
//
// WHAT A FINDING MEANS, per class (carried over from the ancestor, whose taxonomy is right):
//   DEAD    transport failure, or HTTP >= 400. The link is broken outright.
//   SOFT    landed on an ANCESTOR of the requested path. The page is gone and the site bounced the
//           reader to a section index, which is a 404 wearing a 200. This is the class that a naive
//           status check misses entirely, and on documentation sites it is the common one.
//   MOVED   landed somewhere else. The link works, the card should name the new address.
//   ANCHOR  the #fragment is not in the page, so the link opens at the top and the reader has to
//           hunt for the paragraph the card cites. Better than a third of the hrefs carry a fragment,
//           which the run counts and prints, so this is not an edge case.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { schemes, CATALOG_BASELINE } from '../fixtures/catalog.mjs';

// Unrelated to the catalog on purpose. See guard 1 in the header.
const PROBE_HOSTS = ['https://example.com/', 'https://cloudflare.com/'];
const PREFLIGHT_TIMEOUT_MS = 8000;

// One request budget for the walk. Long enough that a slow documentation site is not called dead,
// short enough that the whole bibliography cannot wedge a report.
const REQUEST_TIMEOUT_MS = 20000;

// The whole bibliography at once is rude and gets throttled, one at a time is slow. The ancestor's number.
const CONCURRENCY = 6;

const UA = 'kube.how source check (scheme/test/report/sources.test.mjs)';

// The recorded census, taken on a green tree at 115 cards. Printed for comparison so a
// bibliography that shrinks by half is visible, never used to clamp anything.
const RECORDED = { rows: 252, unique: 171, cards: 115 };

async function reachable(url, ms) {
  try {
    // GET, not HEAD: some CDNs answer HEAD with a 405 and that is not the question being asked.
    const res = await fetch(url, { headers: { 'user-agent': UA }, signal: AbortSignal.timeout(ms) });
    return { ok: true, status: res.status };
  } catch (e) {
    return { ok: false, error: String((e && e.message) || e) };
  }
}

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

// A fragment is present if some element declares it as an id or a name. kubernetes.io ships
// MINIFIED html, so ids come through unquoted (id=emptydir): demanding quotes reported 49 of 58
// anchors dead, all of them false. The optional captured quote plus the trailing lookahead accepts
// both spellings and still refuses a PREFIX match, so #emptydir does not silently satisfy itself on
// id=emptydir-configuration-example. GitHub prefixes heading ids with user-content- and rewrites
// them client side, so both spellings count.
function hasAnchor(body, frag) {
  const esc = frag.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const re = new RegExp(`(?:id|name)=(["']?)(?:user-content-)?${esc}\\1(?=[\\s/>])`, 'i');
  return re.test(body);
}

const SCHEMES = await schemes();

// href -> the cards citing it, so a finding says which cards to go and fix.
const cites = new Map();
let rows = 0;
const cardsWithoutSources = [];
for (const s of SCHEMES) {
  const list = s.sources || [];
  if (!list.length) cardsWithoutSources.push(s.id);
  for (const src of list) {
    rows++;
    if (!cites.has(src.href)) cites.set(src.href, []);
    cites.get(src.href).push({ id: s.id, label: src.label });
  }
}
const urls = [...cites.keys()].sort();

test('source links are alive (report only, never fails, needs the network)', async () => {
  const out = [];
  out.push('');
  out.push('===== SOURCE LINKS, REPORT ONLY (D-01 sources) =====');

  // ---- the half that needs no network ------------------------------------------------------
  out.push(`  source rows   ${rows} over ${SCHEMES.length} cards ` +
    `(recorded: ${RECORDED.rows} over ${RECORDED.cards})`);
  out.push(`  unique hrefs  ${urls.length} (recorded: ${RECORDED.unique})`);
  out.push(`  reuse         ${rows - urls.length} row(s) cite an href another card already cites`);
  out.push(`  with fragment ${urls.filter(u => u.includes('#')).length} of ${urls.length} hrefs carry a #anchor`);
  out.push(`  cards with no sources: ${cardsWithoutSources.length}` +
    (cardsWithoutSources.length ? ` (${cardsWithoutSources.slice(0, 10).join(', ')})` : ''));
  const byHost = new Map();
  for (const u of urls) {
    let h = 'unparseable';
    try { h = new URL(u).host; } catch (_) {}
    byHost.set(h, (byHost.get(h) || 0) + 1);
  }
  out.push(`  hosts         ${byHost.size}: ` +
    [...byHost.entries()].sort((a, b) => b[1] - a[1]).map(([h, n]) => `${h} ${n}`).join(', '));
  if (rows !== RECORDED.rows || urls.length !== RECORDED.unique) {
    out.push('  NOTE: the census differs from the recorded one. A card added or removed moves it, so a');
    out.push('  MOVED verdict means read the diff, then update the record: never the other way round.');
  }
  out.push('');

  // ---- guard 1: is there a network at all --------------------------------------------------
  const probes = await Promise.all(PROBE_HOSTS.map(u => reachable(u, PREFLIGHT_TIMEOUT_MS)));
  const online = probes.some(p => p.ok);
  if (!online) {
    out.push('  REPORT INVALID: no network');
    PROBE_HOSTS.forEach((u, i) => out.push(`    preflight ${u} -> ${probes[i].error}`));
    out.push(`  Neither probe host answered, so ${urls.length} fetches would fail at the transport layer`);
    out.push(`  and this file would print ${urls.length} DEAD findings about ${byHost.size} websites that are`);
    out.push('  probably fine. Nothing was fetched. The counts above are still true: they are read');
    out.push('  from data.js and need no network. Re-run with a route out to learn anything about');
    out.push('  liveness.');
    out.push('===== end of report =====');
    console.log(out.join('\n'));
    return;                       // PASS. An unmeasurable question is not a failing one.
  }
  out.push(`  preflight     online (${PROBE_HOSTS.filter((_, i) => probes[i].ok).length} of ` +
    `${PROBE_HOSTS.length} probe host(s) answered)`);
  out.push('');

  // ---- the walk ----------------------------------------------------------------------------
  const findings = [];
  let live = 0, dead = 0, redirected = 0, transportErrors = 0, anchorsChecked = 0;
  const statusCount = new Map();

  const results = await mapLimit(urls, CONCURRENCY, async (url) => {
    const cardIds = cites.get(url).map(c => c.id);
    let res;
    try {
      res = await fetch(url, {
        redirect: 'follow',
        headers: { 'user-agent': UA },
        signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
      });
    } catch (e) {
      transportErrors++;
      dead++;
      findings.push({ cls: 'DEAD', url, detail: String((e && e.message) || e), cards: cardIds });
      return { url, transport: false };
    }

    statusCount.set(res.status, (statusCount.get(res.status) || 0) + 1);
    if (res.status >= 400) {
      dead++;
      findings.push({ cls: 'DEAD', url, detail: `HTTP ${res.status}`, cards: cardIds });
      return { url, transport: true, status: res.status };
    }
    live++;

    const body = await res.text().catch(() => '');
    const want = new URL(url);
    let got = want;
    try { got = new URL(res.url || url); } catch (_) {}

    const wp = want.pathname.replace(/\/$/, '');
    const gp = got.pathname.replace(/\/$/, '');
    if (want.origin !== got.origin || wp !== gp) redirected++;
    if (wp !== gp) {
      // An ancestor path means the specific page is gone and the site handed back a section index.
      // Anything else is a genuine move and the card should just name the new address.
      const cls = wp.startsWith(gp + '/') ? 'SOFT' : 'MOVED';
      findings.push({ cls, url, detail: `landed on ${got.href}`, cards: cardIds });
    }

    if (want.hash && body) {
      anchorsChecked++;
      const frag = decodeURIComponent(want.hash.slice(1));
      if (!hasAnchor(body, frag)) {
        findings.push({ cls: 'ANCHOR', url, detail: `#${frag} not found in the page`, cards: cardIds });
      }
    }
    return { url, transport: true, status: res.status };
  });

  // ---- guard 2: did the network survive the walk -------------------------------------------
  const reached = results.filter(r => r && r.transport).length;
  if (urls.length && reached === 0) {
    out.push('  REPORT INVALID: no network');
    out.push(`  The preflight answered but all ${urls.length} fetches failed at the transport layer, so`);
    out.push('  the route went away during the run. Every DEAD line below would be an artefact of');
    out.push('  this machine, not a fact about a website. Findings suppressed.');
    out.push('===== end of report =====');
    console.log(out.join('\n'));
    return;                       // PASS, same reasoning as guard 1.
  }
  if (reached < urls.length) {
    out.push(`  REPORT INCOMPLETE: ${urls.length - reached} of ${urls.length} url(s) never returned a status.`);
    out.push('  Those are counted DEAD below, but a transport failure is ambiguous: it is a broken');
    out.push('  link, a blocked host or a flaky minute, and only a re-run tells them apart.');
    out.push('');
  }

  const order = { DEAD: 0, SOFT: 1, MOVED: 2, ANCHOR: 3 };
  findings.sort((a, b) => order[a.cls] - order[b.cls] || a.url.localeCompare(b.url));

  out.push('  LIVENESS');
  out.push(`    fetched       ${urls.length} unique href(s), ${reached} returned a status`);
  out.push(`    live          ${live}  (HTTP < 400)`);
  out.push(`    dead          ${dead}  (${transportErrors} transport failure(s), ${dead - transportErrors} HTTP >= 400)`);
  out.push(`    redirected    ${redirected}  (final url differs from the one the card names)`);
  out.push(`    anchors       ${anchorsChecked} fragment(s) checked against the fetched page`);
  out.push(`    statuses      ${[...statusCount.entries()].sort((a, b) => a[0] - b[0]).map(([s, n]) => `${s} x${n}`).join(', ') || 'none'}`);
  out.push('');

  const byCls = {};
  for (const f of findings) byCls[f.cls] = (byCls[f.cls] || 0) + 1;
  out.push(`  FINDINGS: ${findings.length}` +
    (findings.length ? ` (${Object.entries(byCls).map(([k, v]) => `${k} ${v}`).join(', ')})` : ''));
  let cls = null;
  for (const f of findings) {
    if (f.cls !== cls) { cls = f.cls; out.push(`    ${cls}`); }
    out.push(`      ${f.url}`);
    out.push(`        ${f.detail}`);
    out.push(`        cited by: ${f.cards.join(', ')}`);
  }
  out.push('');
  out.push('  Nothing above is cached, so a green run means the links were alive at the moment it ran');
  out.push('  and says nothing about tomorrow. That is the strongest claim a liveness check can make,');
  out.push('  and the ancestor could not make it at all once its page cache was warm.');
  out.push('===== end of report =====');

  console.log(out.join('\n'));

  // NO ASSERTION ON A LINK, and one on the WALK. Every liveness finding here is about somebody
  // else's website, which no commit in this repository can fix atomically, and a red run for a
  // documentation site's Tuesday outage trains people to ignore red runs.
  //
  // What is not about anybody else's website is whether this file READ the catalog. A rename that
  // empties `sources` leaves nothing to check, prints a clean report and exits 0, and that is the
  // one failure a report may still go red on (`S-46`). Deliberately a floor and not an equality:
  // the url count moves with every card that cites a new page, while zero means the reader died.
  assert.ok(SCHEMES.length === CATALOG_BASELINE.cards,
    `read ${SCHEMES.length} catalog entr(ies), the baseline is ${CATALOG_BASELINE.cards}`);
  assert.ok(rows > 0 && urls.length > 0,
    `collected ${rows} source row(s) over ${urls.length} url(s) from ${SCHEMES.length} cards: ` +
    'a liveness report with no urls checks nothing and prints a clean page.');
});
