// Site smoke: drives the hub, /cli/ and /scheme/ in a real browser and checks every key, button and
// view the chrome offers. `node tools/smoke/site.mjs` from the repo root, exits 1 on any FAIL. Serves
// the tree itself on a free port. Playwright comes from scheme/test: run `npm ci` there once.
import http from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { extname, join, normalize, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const { chromium } = await import(join(ROOT, 'scheme/test/node_modules/playwright/index.mjs'));

const TYPES = { '.html': 'text/html', '.js': 'text/javascript', '.mjs': 'text/javascript', '.css': 'text/css',
  '.svg': 'image/svg+xml', '.png': 'image/png', '.json': 'application/json', '.xml': 'application/xml', '.txt': 'text/plain' };

const server = http.createServer(async (req, res) => {
  try {
    let path = normalize(decodeURIComponent(new URL(req.url, 'http://x').pathname));
    if (path.includes('..')) throw new Error('bad path');
    let file = join(ROOT, path);
    if ((await stat(file)).isDirectory()) {
      // The apps write `/scheme` (no slash) for an empty hash. nginx and GitHub Pages answer a
      // directory without its slash with a 301, and so does this server, or a reload would resolve
      // the page's relative css/ and js/ against the root.
      if (!path.endsWith('/')) { res.writeHead(301, { Location: path + '/' }); res.end(); return; }
      file = join(file, 'index.html');
    }
    res.writeHead(200, { 'Content-Type': TYPES[extname(file)] || 'application/octet-stream' });
    res.end(await readFile(file));
  } catch (_) {
    res.writeHead(404); res.end('not found');
  }
});
await new Promise(r => server.listen(0, '127.0.0.1', r));
const B = `http://127.0.0.1:${server.address().port}`;

const br = await chromium.launch();
let fails = 0;
const ok = (name, cond, extra = '') => {
  if (!cond) fails++;
  console.log(`${cond ? 'PASS' : 'FAIL'}  ${name}${extra ? '  ' + extra : ''}`);
};
// A fresh browser profile per group, so localStorage from one group never leaks into the next.
async function group(title, viewport, fn) {
  console.log(`\n# ${title}`);
  const ctx = await br.newContext({ viewport });
  await ctx.grantPermissions(['clipboard-read', 'clipboard-write']);
  // Cloudflare's analytics beacon only fails locally, it is not the page.
  await ctx.route(/cloudflareinsights\.com/, r => r.abort());
  const p = await ctx.newPage();
  const errs = [];
  p.on('pageerror', e => errs.push(e.message));
  try { await fn(p); } catch (e) { ok(`${title}: ran to the end`, false, e.message.split('\n')[0]); }
  ok(`${title}: no page errors`, errs.length === 0, errs.join(' | '));
  await ctx.close();
}

const DESK = { width: 1440, height: 900 };
const w = (p, ms = 300) => p.waitForTimeout(ms);
// What a Cyrillic layout puts in e.key for a physical key.
const ru = (p, key, code, shiftKey = false) => p.evaluate(([key, code, shiftKey]) => {
  (document.activeElement || document.body).dispatchEvent(new KeyboardEvent('keydown', { key, code, shiftKey, bubbles: true, cancelable: true }));
}, [key, code, shiftKey]);
const blur = (p) => p.evaluate(() => document.activeElement?.blur());
const helpOpen = (p) => p.evaluate(() => !!document.querySelector('.keys-dialog[open]'));
const activeId = (p) => p.evaluate(() => document.activeElement?.id || document.activeElement?.tagName);

// ─────────────────────────────────────────────────────────────── /cli/
await group('cli: keys and buttons', DESK, async (p) => {
  await p.goto(B + '/cli/'); await p.evaluate(() => document.fonts.ready); await w(p, 700);
  ok('"/" hint shows in the empty search', await p.$eval('.search-kbd', e => getComputedStyle(e).display !== 'none'));
  await p.keyboard.press('/'); await w(p, 150);
  ok('"/" focuses search', (await activeId(p)) === 'searchInput');
  await p.keyboard.type('rollout'); await w(p, 400);
  const filtered = await p.$$eval('.cmd-item', els => els.filter(e => !e.hidden && e.offsetParent).length);
  await p.keyboard.press('Escape'); await w(p);
  const after = await p.$$eval('.cmd-item', els => els.filter(e => !e.hidden && e.offsetParent).length);
  ok('Esc clears search', (await p.$eval('#searchInput', i => i.value)) === '' && after > filtered, `${filtered} -> ${after}`);
  await p.keyboard.press('Shift+Slash'); await w(p);
  ok('"?" opens the shortcuts sheet', await helpOpen(p));
  await p.keyboard.press('Escape'); await w(p);
  ok('Esc closes the sheet', !(await helpOpen(p)));
  await blur(p); await ru(p, ',', 'Slash', true); await w(p);
  ok('"?" on a Russian layout opens the sheet', await helpOpen(p));
  await p.click('.keys-close'); await w(p);
  ok('the sheet close button works', !(await helpOpen(p)));
  await blur(p); await ru(p, '.', 'Slash'); await w(p, 150);
  ok('"/" on a Russian layout focuses search', (await activeId(p)) === 'searchInput');
  await p.keyboard.press('Shift+Slash'); await w(p);
  ok('"?" typed into search stays text', !(await helpOpen(p)) && (await p.$eval('#searchInput', i => i.value)) === '?');
  await p.keyboard.press('Escape'); await w(p, 200);
  await p.click('#sideKeys'); await w(p);
  ok('the sidebar keyboard button opens the sheet', await helpOpen(p));
  await p.mouse.click(30, 450); await w(p);
  ok('a click outside closes the sheet', !(await helpOpen(p)));
  ok('section buttons are visible without hover', await p.$eval('.section-actions', e => getComputedStyle(e).opacity === '1' && getComputedStyle(e).display !== 'none'));
  const rep = await p.$eval('.section-actions a[title^="Report"]', a => [a.href, a.target]);
  ok('section report opens a prefilled issue in a new tab', rep[0].includes('/issues/new?title=') && decodeURIComponent(rep[0]).includes('#install-kubeadm') && rep[1] === '_blank');
  await p.click('.cmd-item .copy-btn'); await w(p, 200);
  ok('copy button copies the raw command', (await p.evaluate(() => navigator.clipboard.readText())) === (await p.$eval('.cmd-item', e => e.dataset.raw)));
  ok('code text equals the raw command (no stray characters)', await p.$eval('.cmd-item', e => e.querySelector('.cmd-code').textContent === e.dataset.raw));
  for (const q of ['stable', 'core:/stable', '--token']) {
    await p.fill('#searchInput', q); await w(p, 400);
    const r = await p.evaluate(() => [[...document.querySelectorAll('.cmd-item')].filter(e => !e.hidden && e.offsetParent).length,
      [...document.querySelectorAll('.cmd-code mark')].filter(m => m.offsetParent).length]);
    ok(`search "${q}" finds and highlights`, r[0] > 0 && r[1] > 0, `${r[0]} items, ${r[1]} marks`);
  }
  await p.fill('#searchInput', '');
  ok('no command overflows its card', await p.$$eval('.cmd-code', els => els.every(e => e.scrollWidth <= e.clientWidth + 1)));
});

// ─────────────────────────────────────────────────────────────── /scheme/
await group('scheme: grid and dialog keys and buttons', DESK, async (p) => {
  await p.goto(B + '/scheme/'); await p.evaluate(() => document.fonts.ready); await w(p, 700);
  await p.keyboard.press('/'); await w(p, 150);
  ok('"/" focuses search', (await activeId(p)) === 'searchInput');
  await p.keyboard.type('etcd'); await w(p, 400);
  const nF = (await p.$$('.card')).length;
  await p.keyboard.press('Escape'); await w(p, 400);
  ok('Esc clears search', (await p.$eval('#searchInput', i => i.value)) === '' && (await p.$$('.card')).length > nF);
  await blur(p); await ru(p, '.', 'Slash'); await w(p, 150);
  ok('"/" on a Russian layout focuses search', (await activeId(p)) === 'searchInput');
  await p.keyboard.press('Escape'); await blur(p);
  await p.keyboard.press('Shift+Slash'); await w(p);
  ok('"?" opens the sheet on the grid', await helpOpen(p));
  await p.keyboard.press('Escape'); await w(p);
  await ru(p, ',', 'Slash', true); await w(p);
  ok('"?" on a Russian layout opens the sheet', await helpOpen(p));
  await p.keyboard.press('Escape'); await w(p);
  ok('section link buttons are visible without hover', await p.$eval('.section-actions', e => getComputedStyle(e).opacity === '1'));
  await p.click('.section:nth-of-type(2) .section-link'); await w(p, 250);
  const url = await p.evaluate(() => navigator.clipboard.readText());
  ok('section link copies #at=<section>', /\/scheme\/#at=[a-z-]+$/.test(url), url);

  const href = await p.$eval('.card .card-link', a => a.getAttribute('href'));
  ok('a card title links to its static page', /^\/scheme\/card\/[a-z0-9-]+\/$/.test(href), href);
  const [tab] = await Promise.all([p.context().waitForEvent('page'), p.click('.card .card-link', { modifiers: ['Control'] })]);
  await tab.waitForLoadState(); await w(p, 300);
  ok('Ctrl+click opens the static page in a new tab, no dialog here', tab.url().endsWith(href) && !(await p.$('dialog.scheme-dialog[open]')));
  await tab.close();
  await p.focus('.card-link'); await p.keyboard.press(' '); await w(p, 1200);
  ok('Space on a focused card opens it', await p.evaluate(() => !!document.querySelector('dialog.scheme-dialog[open]')));
  await p.keyboard.press('Escape'); await w(p, 400);
  await p.focus('.card-link'); await p.keyboard.press('Enter'); await w(p, 1800);
  ok('Enter opens the focused card', await p.evaluate(() => !!document.querySelector('dialog.scheme-dialog[open]')));
  ok('the dialog has no copy-link button', !(await p.$('.dialog-link')));
  const st = () => p.evaluate(() => document.querySelector('.narration-step').textContent);
  const playing = () => p.$eval('[data-act="play"]', b => b.getAttribute('aria-label') === 'Pause');
  const loop = () => p.$eval('[data-act="loop"]', b => b.getAttribute('aria-pressed'));
  const title = () => p.$eval('.dialog-title', e => e.textContent);
  await w(p, 1500);
  await p.keyboard.press('Space'); await w(p, 200); const p1 = await playing();
  await p.keyboard.press('Space'); await w(p, 200); const p2 = await playing();
  ok('Space plays and pauses', p1 !== p2);
  if (await playing()) { await p.keyboard.press('Space'); await w(p, 200); }
  const s0 = await st(); await p.keyboard.press('ArrowRight'); await w(p, 400); const s1 = await st();
  await p.keyboard.press('ArrowLeft'); await w(p, 400);
  ok('arrows step forward and back', s1 !== s0 && (await st()) === s0, `${s0} | ${s1}`);
  await p.keyboard.press('ArrowRight'); await p.keyboard.press('r'); await w(p, 500);
  ok('R restarts', /^Step 1 /.test(await st()));
  await p.keyboard.press('ArrowRight'); await ru(p, 'к', 'KeyR'); await w(p, 500);
  ok('R on a Russian layout restarts', /^Step 1 /.test(await st()));
  const l0 = await loop(); await p.keyboard.press('l'); await w(p, 150); const l1 = await loop();
  await ru(p, 'д', 'KeyL'); await w(p, 150);
  ok('L toggles loop on both layouts', l0 !== l1 && (await loop()) === l0);
  const t0 = await title();
  await p.keyboard.press('Shift+ArrowRight'); await w(p, 1200); const t1 = await title();
  await p.keyboard.press('Shift+ArrowLeft'); await w(p, 1200);
  ok('Shift+arrows flip cards', t1 !== t0 && (await title()) === t0, `${t0} -> ${t1}`);
  await p.keyboard.press('f'); await w(p, 500);
  const fs = await p.evaluate(() => [!!document.fullscreenElement, document.querySelector('dialog.scheme-dialog').classList.contains('is-fullscreen')]);
  await p.keyboard.press('f'); await w(p, 500);
  ok('F enters and leaves fullscreen', fs[0] && fs[1] && !(await p.evaluate(() => !!document.fullscreenElement)));
  await p.mouse.click(700, 500); await ru(p, 'а', 'KeyF'); await w(p, 500);
  const ruFs = await p.evaluate(() => !!document.fullscreenElement);
  await p.evaluate(() => document.exitFullscreen().catch(() => {})); await w(p, 400);
  ok('F on a Russian layout enters fullscreen', ruFs);
  if (await playing()) { await p.keyboard.press('Space'); await w(p, 200); }
  await p.keyboard.press('Shift+Slash'); await w(p);
  ok('"?" opens the sheet over the card', await helpOpen(p));
  const s3 = await st(); await p.keyboard.press('ArrowRight'); await w(p);
  ok('card keys do nothing under the sheet', s3 === (await st()));
  await p.keyboard.press('Escape'); await w(p);
  ok('Esc closes the sheet first, the card stays', !(await helpOpen(p)) && await p.evaluate(() => !!document.querySelector('dialog.scheme-dialog[open]')));

  await p.click('.dialog-star'); await w(p, 200);
  const star = await p.evaluate(() => [document.querySelector('.dialog-star').classList.contains('starred'), JSON.parse(localStorage.getItem('kube-how:scheme-starred:v1') || '[]').length]);
  await p.click('.dialog-star'); await w(p, 200);
  ok('dialog star adds and removes', star[0] && star[1] === 1 && !(await p.$eval('.dialog-star', b => b.classList.contains('starred'))));
  await p.click('[data-act="next"]'); await w(p, 400);
  const rh = decodeURIComponent(await p.$eval('.dialog-report', a => a.href));
  ok('report link names the card and the step', rh.includes('/issues/new?title=[scheme]') && /Step: \d+ \/ \d+/.test(rh) && rh.includes('&step='));
  await p.click('.dialog-full'); await w(p, 500); const fb = await p.evaluate(() => !!document.fullscreenElement);
  await p.click('.dialog-full'); await w(p, 500);
  ok('fullscreen button on and off', fb && !(await p.evaluate(() => !!document.fullscreenElement)));
  const a0 = await st(); await p.click('[data-act="next"]'); await w(p, 400); const a1 = await st();
  await p.click('[data-act="prev"]'); await w(p, 400);
  ok('next and previous step buttons', a1 !== a0 && (await st()) === a0);
  await p.click('[data-act="next"]'); await p.click('[data-act="restart"]'); await w(p, 500);
  ok('restart button', /^Step 1 /.test(await st()));
  const pl = await playing(); await p.click('[data-act="play"]'); await w(p, 200);
  ok('play / pause button', pl !== (await playing()));
  if (await playing()) { await p.click('[data-act="play"]'); await w(p, 200); }
  const lb = await loop(); await p.click('[data-act="loop"]'); await w(p, 150);
  ok('loop button', lb !== (await loop())); await p.click('[data-act="loop"]');
  await p.click('.ctl-speed button[data-speed="2"]'); await w(p, 150);
  ok('speed 2x is active and remembered', await p.evaluate(() => document.querySelector('.ctl-speed [data-speed="2"]').classList.contains('active') && localStorage.getItem('kube-how:scheme-speed:v1') === '2'));
  await p.click('.ctl-speed button[data-speed="1"]');
  await p.click('.step-dot:nth-child(3)'); await w(p, 400);
  ok('a step dot jumps to its step', /^Step 3 /.test(await st()));
  const n0 = await title(); await p.click('.dialog-nav-next'); await w(p, 1200); const n1 = await title();
  await p.click('.dialog-nav-prev'); await w(p, 1200);
  ok('side arrows flip cards', n1 !== n0 && (await title()) === n0);
  await p.keyboard.press('Escape'); await w(p, 400);
  ok('Esc closes the card', !(await p.evaluate(() => !!document.querySelector('dialog.scheme-dialog[open]'))));
  await p.click('.card'); await w(p, 1200); await p.click('.dialog-close'); await w(p, 400);
  ok('the close button closes the card', !(await p.evaluate(() => !!document.querySelector('dialog.scheme-dialog[open]'))));
});

await group('scheme: compact view', DESK, async (p) => {
  await p.goto(B + '/scheme/'); await p.evaluate(() => document.fonts.ready); await w(p, 700);
  const cols = () => p.$eval('.cards-grid', g => getComputedStyle(g).gridTemplateColumns.split(' ').length);
  const fullCols = await cols();
  await p.click('.view-btn[data-view="compact"]'); await w(p, 400);
  ok('compact packs more cards a row and hides the description', (await cols()) > fullCols && await p.$eval('.card-desc', e => getComputedStyle(e).display === 'none'));
  ok('compact puts the description in the tooltip', ((await p.$eval('.card', c => c.title)) || '').length > 100);
  await p.reload(); await w(p, 800);
  ok('the view is remembered', await p.evaluate(() => document.body.classList.contains('view-compact')));
  await p.click('.card .star-btn'); await w(p, 200);
  ok('the star works and does not open the card', await p.evaluate(() => document.querySelector('.card .star-btn').classList.contains('starred') && !document.querySelector('dialog.scheme-dialog')));
  await p.click('.card .star-btn');
  await p.click('.card .card-poster'); await w(p, 1200);
  ok('a compact card opens', await p.evaluate(() => !!document.querySelector('dialog.scheme-dialog[open]')));
  await p.keyboard.press('Escape'); await w(p);
  await p.click('.view-btn[data-view="full"]'); await w(p, 400);
  ok('back to the detailed view', await p.evaluate(() => !document.body.classList.contains('view-compact') && !document.querySelector('.card').title));
});

// ─────────────────────────────────────────────────────────────── NEW badges + hub counts
await group('new since last visit + hub counts', DESK, async (p) => {
  await p.goto(B + '/'); await w(p, 1200);
  ok('hub shows live counts', /\d+ commands · \d+ sections/.test(await p.textContent('#hubStatCli')) && /\d+ schemes · \d+ categories/.test(await p.textContent('#hubStatScheme')));
  ok('hub has no Continue link (rejected idea)', !(await p.$('#hubContinue')));
  ok('first visit: no new pills on the hub', !(await p.$('.hub-stat .new-pill')));
  await p.goto(B + '/cli/'); await w(p, 900);
  ok('first cli visit: no NEW badges', (await p.$$('.cmd-item.is-new')).length === 0);
  await p.goto(B + '/scheme/'); await w(p, 900);
  ok('first scheme visit: no NEW badges', (await p.$$('.card-new')).length === 0);
  await p.evaluate(async () => {
    const { SECTIONS } = await import('/cli/js/data.js'); const { hashKey } = await import('/cli/js/lib/fresh.js');
    const cli = JSON.parse(localStorage.getItem('kube-how:cli-seen:v1'));
    [...SECTIONS[0].groups[0].cmds.slice(0, 3), ...SECTIONS[9].groups[0].cmds.slice(0, 2)].forEach(c => delete cli[hashKey(c.cmd)]);
    localStorage.setItem('kube-how:cli-seen:v1', JSON.stringify(cli));
    const sch = JSON.parse(localStorage.getItem('kube-how:scheme-seen:v1'));
    ['cluster-architecture', 'cluster-admission-chain', 'storage-volume-snapshot'].forEach(id => delete sch[id]);
    localStorage.setItem('kube-how:scheme-seen:v1', JSON.stringify(sch));
  });
  await p.goto(B + '/'); await w(p, 1200);
  ok('hub counts what is new before the pages are visited', (await p.textContent('#hubStatCli')).includes('5 new') && (await p.textContent('#hubStatScheme')).includes('3 new'));
  await p.goto(B + '/cli/'); await w(p, 900);
  ok('cli: 5 NEW commands, chips 3 + 2', (await p.$$('.cmd-item.is-new')).length === 5 && JSON.stringify(await p.$$eval('.section-new', e => e.map(x => x.textContent))) === '["3 new","2 new"]');
  await p.click('.cmd-item.is-new .copy-btn'); await w(p);
  ok('cli: a copy clears its badge and recounts', (await p.$$('.cmd-item.is-new')).length === 4 && (await p.$$eval('.section-new', e => e.map(x => x.textContent))).includes('2 new'));
  await p.goto(B + '/scheme/'); await w(p, 900);
  ok('scheme: 3 NEW posters', (await p.$$('.card-new')).length === 3);
  await p.click('.card[data-id="cluster-admission-chain"]'); await w(p, 1200);
  await p.keyboard.press('Escape'); await w(p, 400);
  ok('scheme: opening a card clears its badge and recounts', (await p.$$('.card-new')).length === 2 && (await p.$eval('.section .section-new', e => e.textContent)) === '1 new');
  ok('scheme: nothing remembers the last opened card', await p.evaluate(() => localStorage.getItem('kube-how:scheme-last:v1') === null));
});

// ─────────────────────────────────────────────────────────────── static pages
await group('static pages: every one answers, with its own title and canonical', DESK, async (p) => {
  const xml = await (await fetch(B + '/sitemap.xml')).text();
  const locs = [...xml.matchAll(/<loc>https:\/\/kube\.how([^<]+)<\/loc>/g)].map(m => m[1]);
  const bad = [];
  for (const path of locs.filter(l => /^\/(scheme\/card|cli\/section)\/([a-z0-9-]+\/)?$/.test(l))) {
    const r = await fetch(B + path); const html = await r.text();
    if (r.status !== 200) { bad.push(`${path} ${r.status}`); continue; }
    if (!html.includes(`<link rel="canonical" href="https://kube.how${path}">`)) bad.push(`${path} canonical`);
    if ((html.match(/<h1[ >]/g) || []).length !== 1) bad.push(`${path} h1 count`);
  }
  ok(`${locs.length} sitemap URLs, every card and section page answers 200 with one h1 and its own canonical`, bad.length === 0 && locs.length > 100, bad.slice(0, 5).join(', '));
  await p.goto(B + '/scheme/card/cluster-architecture/'); await w(p, 600);
  ok('a card page lists every narrated step', (await p.$$('.page-steps li')).length >= 3);
  ok('its Play link opens the card in the app', (await p.$eval('.page-play', a => a.getAttribute('href'))) === '/scheme/#scheme=cluster-architecture');
  await p.click('.page-play'); await w(p, 1800);
  ok('and the dialog opens there', await p.evaluate(() => document.querySelector('dialog.scheme-dialog[open] .dialog-title')?.textContent) === 'Cluster Architecture');
  await p.goto(B + '/cli/section/pod/'); await w(p, 600);
  await p.click('.cmd-item .copy-btn'); await w(p, 200);
  ok('a section page copies a command', (await p.evaluate(() => navigator.clipboard.readText())) === (await p.$eval('.cmd-item', e => e.dataset.raw)));
});

// ─────────────────────────────────────────────────────────────── analytics and URL shape
await group('analytics counts page loads only, URLs keep their slash', DESK, async (p) => {
  for (const [path, act] of [['/scheme/', '.cat-btn[data-cat="storage"]'], ['/cli/', '.top-kubernetes']]) {
    await p.goto(B + path); await w(p, 700);
    const beacon = await p.$eval('script[data-cf-beacon]', s => JSON.parse(s.dataset.cfBeacon));
    ok(`${path} beacon has spa:false (no page view per step or filter)`, beacon.spa === false);
    await p.click(act); await w(p, 300);
    ok(`${path} keeps its trailing slash after a filter`, await p.evaluate((pp) => location.pathname === pp, path));
  }
  await p.goto(B + '/scheme/'); await w(p, 700); await p.click('.card .card-poster'); await w(p, 1200);
  await p.keyboard.press('Escape'); await w(p, 300);
  ok('/scheme/ keeps its slash after a card is closed', await p.evaluate(() => location.pathname === '/scheme/'));
});

// ─────────────────────────────────────────────────────────────── layout at many widths
for (const [wd, ht] of [[1440, 900], [1280, 720], [700, 900], [390, 844]]) {
  await group(`hub is one viewport at ${wd}x${ht}`, { width: wd, height: ht }, async (p) => {
    await p.goto(B + '/'); await w(p, 1000);
    const r = await p.evaluate(() => [document.documentElement.scrollHeight, innerHeight,
      [...document.querySelectorAll('.hub-panel')].some(x => x.scrollHeight > x.clientHeight + 1)]);
    ok('no vertical scroll', r[0] <= r[1], `${r[0]} > ${r[1]}`);
    ok('no panel cuts its content', !r[2]);
  });
}
for (const wd of [360, 390]) {
  await group(`narrow ${wd}px`, { width: wd, height: 800 }, async (p) => {
    for (const path of ['/', '/cli/', '/scheme/']) {
      await p.goto(B + path); await p.evaluate(() => document.fonts.ready); await w(p, 700);
      ok(`${path} has no horizontal scroll`, await p.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
      if (path === '/') continue;
      ok(`${path} search placeholder fits`, await p.evaluate(() => {
        const i = document.getElementById('searchInput'), cs = getComputedStyle(i);
        const c = document.createElement('canvas').getContext('2d'); c.font = `${cs.fontWeight} ${cs.fontSize} ${cs.fontFamily}`;
        return c.measureText(i.placeholder).width <= i.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight);
      }));
      ok(`${path} no section header overflows`, await p.$$eval('.section-header', hs => hs.every(h => h.scrollWidth <= h.clientWidth + 1)));
    }
  });
}

await br.close();
server.close();
console.log(`\n${fails} failed`);
process.exit(fails ? 1 : 0);
