#!/usr/bin/env node
// motion.mjs: every animation a card really runs, per step, as data, played in real time with CSS transitions left live.
// usage: cd scheme/test && node ../../.claude/skills/card-review/tools/motion.mjs <card-id> [--viewport=1600x1000] [--base=URL] [--all]
// A brightness track is a pulse (`M-04`) and only Pods pulse (`M-01`), so one on a non-Pod is flagged SUSPECT.
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
  // Re-query the svg on every sample: reset() rebuilds the scene, so an earlier reference is detached.
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
  // Walk the whole card at real speed, sampling until the last step has had its hold.
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
        // A Pod is an unclassed wrapper `g` around a `.scheme-pod` shell plus inner boxes, and pulsePod tracks
        // the descendants too (`M-03`), so ask the wrapper rather than closest('.scheme-pod').
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
// ARRIVALS: tracks starting on the millisecond a packet begins its fade are the receiver's cue. A Pod pulse
// or lightBoxAt is a cue, a frame or lane fade is not. Compare rows across steps (`P-04`).
const arrivals = [];
const near = (a, b) => Math.abs(a - b) <= 20;
for (const step of [...new Set(rows.map(r => r.step))]) {
  const inStep = rows.filter(r => r.step === step);
  const lands = [...new Set(inStep
    .filter(r => /^scheme-packet/.test(r.target) && r.props.includes('opacity') && /^1 -> 0/.test(r.vals))
    .map(r => r.delay))];
  for (const at of lands) {
    const react = inStep.filter(r => near(r.delay, at) && !/^scheme-(packet|ripple)/.test(r.target));
    const pulse = react.filter(r => r.isPod && r.props.some(p => /filter/i.test(p)));
    const light = react.filter(r => !r.props.length && !/^diagram/.test(r.target));
    const fades = react.filter(r => !r.isPod && r.props.includes('opacity'));
    // A deferred write (an F.set turnover, a wire) is an empty track on the svg root itself.
    const writes = react.filter(r => !r.props.length && /^diagram/.test(r.target));
    const verdict = pulse.length || light.length ? 'cued'
      : fades.length ? 'FADE-ONLY' : writes.length ? 'WRITE-ONLY' : 'NO CUE';
    arrivals.push({ step, at, verdict, pulse: pulse.length, light: light.length,
      fades: fades.map(r => r.target.split(' ')[0]) });
  }
}
console.log('\nARRIVALS: what reacts on the millisecond a ball lands');
for (const a of arrivals) {
  console.log(`  step ${a.step}  d${String(a.at).padEnd(6)} ${a.verdict.padEnd(10)} pulses ${a.pulse}  lights ${a.light}` +
    (a.fades.length ? `  fades ${a.fades.join(', ')}` : ''));
}
const uncued = arrivals.filter(a => a.verdict !== 'cued');
if (uncued.length) {
  console.log(`${uncued.length} arrival(s) with no Pod pulse and no light. FADE-ONLY is the shipped defect`);
  console.log('above. WRITE-ONLY (only a chip or wire turns over) and NO CUE are a queue to READ, not a');
  console.log('verdict: open the frame at the arrival and compare it with the card\'s other arrivals.');
}
console.log('\nA seek CANNOT show any of this, and neither can a settled frame. This is the only reader.');
