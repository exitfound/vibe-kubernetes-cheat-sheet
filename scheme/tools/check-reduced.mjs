// check-reduced.mjs: the ctx.reduced contract. Enters each step twice, played-and-seeked and
// statically, and diffs what the two leave on screen. In the gate.
// node check-reduced.mjs [<id> ...]   ids => verbose; none => whole catalog, terse
//
// FOUR RULES, because the original one axis turned out to be the narrowest of the four.
//   OPACITY-OWN        the element's own computed opacity. The original check. ENFORCED.
//   OPACITY-INHERITED  the EFFECTIVE opacity, multiplied down the ancestor chain. CSS opacity does
//                      not inherit, so a card that pins state on the <g> WRAPPER around a Pod (at
//                      least 19 cards and 24 wrappers do) was invisible to OPACITY-OWN entirely.
//   WIRE-TEXT          the drawn wire labels. Never compared before. A card whose setWire runs only
//                      below the ctx.reduced guard shows blank lanes on prev/reset while the
//                      narration names the exact string that should be there.
//   HIGHLIGHT          the .highlight class set. This used to be uncomparable for a real reason,
//                      written in the old comment: lightBoxAt sets the class in onfinish, and the
//                      seek path never fires onfinish. That is fixed here by finishing the step's
//                      animations before snapping, rather than by dropping the rule.
// A new rule lands REPORT-ONLY so the gate stays a signal while its queue drains, the same
// convention check-canon.mjs uses. Move a rule into ENFORCED once its list is empty.
import { launch, setInspect, stepCount, enterStep, stepSpan, seekStep, discoverIds, DEFAULT_BASE } from './_shared.mjs';

const argIds = process.argv.slice(2).filter(a => !a.startsWith('--'));
const terse = argIds.length === 0;
const verboseAdvisory = process.argv.includes('--verbose');

const ENFORCED = new Set(['OPACITY-OWN']);

const SEL = '.scheme-box, .scheme-pod, .scheme-cylinder, .scheme-node, .scheme-chip, .scheme-arrow';

const snap = () => {
  const svg = document.querySelector('dialog.scheme-dialog svg.diagram');
  if (!svg) return { els: [], wires: [] };

  // Effective opacity: the product down the ancestor chain to the svg root. This is the number a
  // reader actually sees, and the one a <g> wrapper controls.
  const effective = (el) => {
    let o = 1;
    for (let n = el; n && n !== svg; n = n.parentElement) {
      const v = parseFloat(getComputedStyle(n).opacity);
      if (Number.isFinite(v)) o *= v;
    }
    return Math.round(o * 100) / 100;
  };

  // Inlined rather than closed over SEL because this runs in the page. It MUST stay identical to
  // SEL: captureDeferred indexes the same list, and the pulse exemption is keyed by that index.
  const els = [...svg.querySelectorAll('.scheme-box, .scheme-pod, .scheme-cylinder, .scheme-node, .scheme-chip, .scheme-arrow')]
    .filter(el => !el.closest('#packetLayer'))
    .map((el, i) => {
      const t = (el.querySelector('text') || {}).textContent || '';
      return {
        idx: i,
        key: `${i}:${el.getAttribute('class').split(' ')[0]}:${t.trim().slice(0, 20)}`,
        op: Math.round(parseFloat(getComputedStyle(el).opacity) * 100) / 100,
        opEff: effective(el),
        hl: el.classList.contains('highlight'),
      };
    });

  // Wire labels are plain text nodes, not blocks, so they need their own list.
  const wires = [...svg.querySelectorAll('.scheme-label')]
    .filter(el => !el.closest('#packetLayer'))
    .map((el, i) => ({ key: `w${i}`, text: (el.textContent || '').trim() }));

  return { els, wires };
};

// The deferred side effects of a step hang on `a.onfinish`: lightBoxAt adds its arrival class that
// way (scheme-kit.js:186) and several cards defer a setWire through the same shape. Seeking sets
// currentTime and never fires the event, and calling finish() does not help either, because the
// animation is PAUSED and a paused animation never enters the finished play state. So the handlers
// are invoked directly. The seek has already gone past the whole step span, so every one of them
// would have run in a real playback, and the handlers here are idempotent (add a class, set a
// text), which is what makes calling them by hand safe rather than a simulation of the browser.
// It has to be a two-part dance, and the reason is worth knowing before anyone simplifies it: the
// marker animations carry `fill: 'none'`, so the moment the seek pushes past their end they drop
// out of getAnimations() entirely. Measured on network-dns-ndots step 3: 16 handlers before the
// seek, 0 after. So the handlers are captured while they still exist, with the end time of each,
// and replayed afterwards for exactly those the seek went past.
const captureDeferred = (sel) => {
  const svg = document.querySelector('dialog.scheme-dialog svg.diagram');
  window.__deferred = [];
  if (!svg) return [];
  for (const a of document.getAnimations()) {
    const tgt = a.effect && a.effect.target;
    if (!tgt || !svg.contains(tgt)) continue;
    if (typeof a.onfinish !== 'function') continue;
    const t = a.effect.getComputedTiming();
    const end = (Number(t.delay) || 0) + (Number(t.activeDuration) || 0);
    window.__deferred.push({ fn: a.onfinish, end });
  }

  // Which elements does this step PULSE? A pulse cannot be shown statically, so the reduced branch
  // stands in for it with a .highlight on the Pod inner box. That is the documented convention, not
  // a defect, and without this exemption the HIGHLIGHT rule reports it 130 times and is a report
  // rather than a rule. Collected before the seek, while the pulse animations still exist.
  const pulsedTargets = new Set();
  for (const a of document.getAnimations()) {
    const tgt = a.effect && a.effect.target;
    if (!tgt || !svg.contains(tgt)) continue;
    const kf = a.effect.getKeyframes ? a.effect.getKeyframes() : [];
    if (!kf.some(k => k.filter !== undefined || k.stroke !== undefined)) continue;
    pulsedTargets.add(tgt);
  }
  const pulsedIdx = [];
  [...svg.querySelectorAll(sel)].filter(el => !el.closest('#packetLayer')).forEach((el, i) => {
    for (const t of pulsedTargets) { if (el === t || el.contains(t)) { pulsedIdx.push(i); return; } }
  });
  return pulsedIdx;
};

const runDeferred = (t) => {
  let n = 0;
  for (const d of (window.__deferred || [])) {
    if (d.end > t) continue;
    try { d.fn(); n++; } catch (_) {}
  }
  return n;
};

const browser = await launch();
const page = await browser.newPage({ viewport: { width: 1600, height: 1000 } });
await page.addInitScript(setInspect, 'expose');

const ids = terse ? await discoverIds(page) : argIds;
if (!ids.length) { console.error('NO CARDS RENDERED: posters/grid broken'); process.exit(1); }

let bad = 0;
const advisoryTotals = new Map();
for (const id of ids) {
  await page.goto(`${DEFAULT_BASE}/scheme/#scheme=${id}`, { waitUntil: 'networkidle' });
  await page.waitForSelector('dialog.scheme-dialog svg.diagram', { timeout: 10000 });
  const total = await stepCount(page);
  const violations = [], advisories = [];
  const report = (rule, msg) => (ENFORCED.has(rule) ? violations : advisories).push(`  ${rule}  ${msg}`);

  for (let i = 1; i < total; i++) {
    // Played: run the step's real play-path, freeze well past its own span, then let every
    // animation settle so onfinish effects (the arrival highlights) are actually applied.
    await enterStep(page, i);
    const pulsed = new Set(await page.evaluate(captureDeferred, SEL));
    const span = await stepSpan(page);
    await seekStep(page, span + 400);
    await page.evaluate(runDeferred, span + 400);
    await page.waitForTimeout(50);
    const played = await page.evaluate(snap);

    // Reduced: the same step applied statically, the way prev/reset replays it.
    await page.evaluate((n) => window.__schemeCtl.gotoStep(n), i);
    await page.waitForTimeout(50);
    const reduced = await page.evaluate(snap);

    for (let k = 0; k < Math.min(played.els.length, reduced.els.length); k++) {
      const p = played.els[k], r = reduced.els[k];
      if (p.key !== r.key) continue;
      // Slack for a fill-forwards landing.
      if (Math.abs(p.op - r.op) > 0.06) {
        report('OPACITY-OWN', `step ${i}  ${p.key}  opacity played=${p.op} reduced=${r.op}`);
      } else if (Math.abs(p.opEff - r.opEff) > 0.06) {
        // Only when the own-opacity axis agrees, so one defect is not reported twice.
        report('OPACITY-INHERITED', `step ${i}  ${p.key}  effective opacity played=${p.opEff} reduced=${r.opEff}`);
      }
      // A reduced-only highlight on something this step PULSES is the stand-in convention, not a
      // defect. The other direction always is one: whatever lights on arrival must also light on
      // the reduced path, or prev/reset shows a different picture than playing forward.
      if (p.hl !== r.hl && !(!p.hl && r.hl && pulsed.has(p.idx))) {
        report('HIGHLIGHT', `step ${i}  ${p.key}  highlight played=${p.hl} reduced=${r.hl}`);
      }
    }

    for (let k = 0; k < Math.min(played.wires.length, reduced.wires.length); k++) {
      const p = played.wires[k], r = reduced.wires[k];
      if (p.text === r.text) continue;
      report('WIRE-TEXT', `step ${i}  wire ${k}  played=${JSON.stringify(p.text)} reduced=${JSON.stringify(r.text)}`);
    }
  }

  for (const line of advisories) {
    const rule = line.trim().split(/\s+/)[0];
    advisoryTotals.set(rule, (advisoryTotals.get(rule) || 0) + 1);
  }

  if (violations.length) {
    bad++;
    console.log(`\n${id}  ${violations.length} mismatch(es)`);
    violations.slice(0, 20).forEach(l => console.log(l));
  } else if (!terse) {
    console.log(`\n${id}  reduced state matches played end-state on every step`);
  }
  if (advisories.length && (verboseAdvisory || !terse)) {
    console.log(`${violations.length ? '' : `\n${id}`}  ${advisories.length} report-only`);
    advisories.slice(0, 20).forEach(l => console.log(l));
  }
}

await browser.close();
if (terse && !bad) console.log(`reduced check OK: ${ids.length} cards match their played end-state on every step`);
if (advisoryTotals.size) {
  console.log('report-only rules (not failing the gate while their queue drains, --verbose to list):');
  for (const [rule, n] of [...advisoryTotals].sort((a, b) => b[1] - a[1])) console.log(`  ${rule}  ${n}`);
}
process.exit(bad ? 1 : 0);
