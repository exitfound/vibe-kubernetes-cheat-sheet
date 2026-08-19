#!/usr/bin/env node
// motion.mjs: every animation a card really runs, per step, as DATA.
//
//   cd scheme/test && node ../../.claude/skills/card-review/tools/motion.mjs <card-id>
//     [--viewport=1600x1000] [--base=http://localhost:8888] [--all]   --all: chrome animations too
//
// WHY THIS EXISTS, and it is the hole that shipped a defect. The other three probes all read a
// STATE and none of them reads MOTION: frames.mjs freezes, settled-dump.mjs reads the frame AFTER
// the motion has ended, buildframe.mjs reads the frame BEFORE step 0. So a card could pulse a
// block for 600ms on three steps running and every probe, plus the whole gate, came back clean.
//
// Two things it does that no test file may:
//   1. It PLAYS the card in real time. `gotoStep`, prev and reset all replay with `ctx.reduced`,
//      and `flashChips` (and anything else guarded) returns immediately on that path, so a
//      reduced-path reader is blind to it BY CONSTRUCTION.
//   2. It leaves CSS transitions LIVE. `test/fixtures/render.mjs` initPage() freezes them on
//      purpose so static reads are final, which means no render test can ever see a WAAPI
//      animation and a CSS transition land on the same element.
//
// The FLAGS column is the point. A `filter: brightness(...)` track is what this codebase calls a
// PULSE (`M-04`), and `M-01` says only Pods pulse, so a brightness track on anything that is not
// a Pod is printed as SUSPECT. It is not automatically a defect: `M-27` sanctions `F.flash`, and
// the two canon rows disagree. Read the target, then decide, and write the decision into the
// card's record either way.
import {
  launch, openCard, DEFAULT_BASE, DIAGRAM,
} from '../../../../scheme/test/fixtures/render.mjs';

const args = process.argv.slice(2);
const flags = Object.fromEntries(args.filter(a => a.startsWith('--')).map(a => {
  const [k, v = 'true'] = a.slice(2).split('='); return [k, v];
}));
const id = args.find(a => !a.startsWith('--'));
if (!id) { console.error('Usage: node motion.mjs <card-id> [--viewport=WxH] [--all]'); process.exit(1); }

const base = (flags.base || DEFAULT_BASE).replace(/\/$/, '');
const [width, height] = (flags.viewport || '1600x1000').split('x').map(Number);

const browser = await launch();
const ctx = await browser.newContext({ viewport: { width, height } });
// Expose __schemeCtl WITHOUT initPage's transition freeze: the freeze is exactly what would hide
// a CSS transition racing a WAAPI track on one element.
await ctx.addInitScript(() => {
  try { localStorage.setItem('scheme:inspect', 'expose'); } catch (_) {}
});
const page = await ctx.newPage();
await openCard(page, id, base);
await page.evaluate(() => document.fonts.ready);

const rows = await page.evaluate(async ({ sel, all }) => {
  // Re-query the svg on every sample: reset() rebuilds the scene through host.replaceChildren(),
  // so a reference captured before the playthrough is detached and contains() then answers false
  // for every target on the card.
  const diagram = () => document.querySelector(sel);
  const label = (el) => {
    const cls = (el.getAttribute && el.getAttribute('class')) || el.tagName;
    const txt = (el.textContent || '').trim().replace(/\s+/g, ' ').slice(0, 22);
    return txt ? `${cls} "${txt}"` : cls;
  };
  const ctl = window.__schemeCtl;
  const total = ctl.total;
  ctl.reset();
  await new Promise(r => setTimeout(r, 250));
  ctl.play();

  const seen = new Set(), out = [];
  // Walk the whole card at real speed. Every step holds for its own `duration`, so the wall clock
  // is the sum plus slack; the loop simply samples until the last step has had its hold.
  const deadline = performance.now() + 4000 + total * 3500;
  while (performance.now() < deadline) {
    const m = (document.querySelector('.narration-overlay') || {}).textContent || '';
    const step = (m.match(/Step\s+(\d+)/) || [])[1] || '0';
    const svg = diagram();
    for (const a of document.getAnimations()) {
      const eff = a.effect;
      if (!eff || !eff.target) continue;
      const inDiagram = svg && svg.contains(eff.target);
      if (!inDiagram && !all) continue;
      const kf = eff.getKeyframes();
      const props = [...new Set(kf.flatMap(k => Object.keys(k)))]
        .filter(k => !['offset', 'composite', 'computedOffset', 'easing'].includes(k));
      const t = eff.getTiming();
      const key = `${step}|${label(eff.target)}|${props}|${t.duration}|${t.delay}`;
      if (seen.has(key)) continue;
      seen.add(key);
      out.push({
        step, target: label(eff.target), props, dur: t.duration, delay: t.delay,
        // A Pod is a wrapper `g` with NO class holding a `.scheme-pod` shell plus inner boxes, and
        // `pulsePod` attaches a track to the descendants too (`M-03`), so closest('.scheme-pod')
        // alone reports every inner box of every Pod as a bare box. Ask the wrapper instead.
        isPod: !!(eff.target.closest('.scheme-pod') || eff.target.querySelector('.scheme-pod')
          || (eff.target.parentElement && eff.target.parentElement.querySelector(':scope > .scheme-pod'))),
        vals: kf.map(k => props.map(p => k[p]).join('/')).join(' -> ').slice(0, 78),
      });
    }
    await new Promise(r => requestAnimationFrame(r));
  }
  return out;
}, { sel: DIAGRAM, all: flags.all === 'true' });

await browser.close();

const suspect = [];
console.log(`=== ${id} === real-time playthrough at ${width}x${height}, CSS transitions LIVE\n`);
let cur = null;
for (const r of rows) {
  if (r.step !== cur) { cur = r.step; console.log(`--- step ${cur} ---`); }
  const isPulse = r.props.some(p => /filter/i.test(p)) || /brightness/.test(r.vals);
  const flag = isPulse && !r.isPod ? 'SUSPECT' : '';
  if (flag) suspect.push(r);
  console.log(
    `  ${String(r.props.join(',') || '(empty keyframes)').padEnd(22)}` +
    `${String(r.dur + 'ms d' + r.delay).padEnd(14)}${flag.padEnd(9)}${r.target}`);
  if (r.vals) console.log(`  ${' '.repeat(22)}${r.vals}`);
}

console.log('');
if (suspect.length) {
  console.log(`${suspect.length} SUSPECT track(s): a brightness/filter animation on something that is NOT a Pod.`);
  console.log('M-04 calls that a PULSE and M-01 says only Pods pulse. M-27 sanctions F.flash, so the');
  console.log('two rows disagree: read each target and record the decision in the card note either way.');
} else {
  console.log('No brightness/filter track outside a Pod. An empty-keyframe track is lightBoxAt (M-28).');
}
console.log('\nA seek CANNOT show any of this, and neither can a settled frame. This is the only reader.');
