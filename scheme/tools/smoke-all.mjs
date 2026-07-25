// smoke-all.mjs: open every scheme, build it, walk every step twice (reduced and PLAYED) and fail on
// any console error or page exception. The played pass is the point: stepping only via gotoStep under
// reducedMotion never executes a single line below `if (ctx.reduced) return;`. In the gate.
import { launch, setInspect, stepCount, enterStep, discoverIds, DEFAULT_BASE } from './_shared.mjs';

const BASE = DEFAULT_BASE;

const browser = await launch();
// NOT reducedMotion: the played pass has to run the real motion path.
const ctx = await browser.newContext();
const page = await ctx.newPage();
await page.addInitScript(setInspect, 'expose');

const ids = await discoverIds(page, BASE);
console.log(`discovered ${ids.length} schemes`);
if (ids.length === 0) { console.error('NO CARDS RENDERED: posters/grid broken'); process.exit(1); }

const results = [];
for (const id of ids) {
  const errs = [];
  // Ignore the Cloudflare RUM analytics beacon: it fails CORS on localhost,
  // pre-existing and unrelated to the JS under test.
  const ignore = t => /cloudflareinsights|cdn-cgi\/rum|ERR_FAILED/.test(t);
  const onConsole = m => { if (m.type() === 'error' && !ignore(m.text())) errs.push(`console: ${m.text()}`); };
  const onPageErr = e => errs.push(`pageerror: ${e.message}`);
  page.on('console', onConsole);
  page.on('pageerror', onPageErr);
  try {
    await page.goto(`${BASE}/scheme/#scheme=${id}`, { waitUntil: 'networkidle' });
    await page.waitForSelector('dialog.scheme-dialog svg.diagram', { timeout: 8000 });
    const built = await page.$eval('dialog.scheme-dialog svg.diagram', s => s.childElementCount);
    const total = await stepCount(page);
    // Pass 1, reduced: the static end-state of every step, the path prev/reset takes.
    for (let i = 0; i < total; i++) {
      await page.evaluate(n => window.__schemeCtl && window.__schemeCtl.gotoStep(n), i);
      await page.waitForTimeout(30);
    }
    // Pass 2, played: enterStep runs each step's real enter() with reduced:false and freezes it, so
    // every packet, pulse, riding label and lightBoxAt actually executes. Timeline swallows a throw
    // into console.error, which the listener above turns into a failure.
    for (let i = 1; i < total; i++) {
      await enterStep(page, i);
      await page.waitForTimeout(30);
    }
    const ok = built > 0 && total > 0 && errs.length === 0;
    results.push({ id, total, built, errs, ok });
    if (!ok) console.log(`  FAIL ${id}  steps=${total} svgChildren=${built} errs=${errs.length}`);
  } catch (e) {
    errs.push(`exception: ${e.message}`);
    results.push({ id, total: 0, built: 0, errs, ok: false });
    console.log(`  FAIL ${id}  ${e.message}`);
  } finally {
    page.off('console', onConsole);
    page.off('pageerror', onPageErr);
  }
}

await browser.close();
const failed = results.filter(r => !r.ok);
console.log('---');
console.log(`PASS ${results.length - failed.length}/${results.length}`);
if (failed.length) {
  for (const f of failed) {
    console.log(`\n### ${f.id} (steps=${f.total}, svgChildren=${f.built})`);
    f.errs.slice(0, 6).forEach(e => console.log('   ' + e));
  }
  process.exit(1);
}
console.log('All schemes built and stepped cleanly, zero console/page errors.');
