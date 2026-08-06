#!/usr/bin/env node
// check-arrival.mjs: the R2/R3 detector. Enters every step's real play-path frozen at t=0 and asks
// two questions the source cannot answer.
//   R3  a block that RECEIVES a packet this step must not already be lit at step entry. It has to
//       gain .highlight on arrival (lightBoxAt at pkt.arrivalMs). Source blocks are exempt: the
//       block a ball leaves from is supposed to be lit before it leaves.
//   R2  a value chip whose value changed since the previous step must carry .highlight this step.
// Value chips are deliberately OUT of R3 (author's decision): they light at step entry with the
// text change, boxes/pods/cylinders light on arrival.
// node check-arrival.mjs [--rules=r2,r3] [<id> ...]   ids => verbose; none => whole catalog, terse
import { launch, setInspect, stepCount, enterStep, discoverIds, DEFAULT_BASE } from './_shared.mjs';

const ALL_RULES = ['R2', 'R3'];
const args = process.argv.slice(2);
const ruleArg = args.find(a => a.startsWith('--rules='));
const rules = new Set(ruleArg
  ? ruleArg.slice('--rules='.length).split(',').map(s => s.trim().toUpperCase()).filter(Boolean)
  : ALL_RULES);
const unknown = [...rules].filter(r => !ALL_RULES.includes(r));
if (unknown.length) { console.error(`unknown rule(s): ${unknown.join(', ')} (have: ${ALL_RULES.join(', ')})`); process.exit(2); }
const on = r => rules.has(r);

const argIds = args.filter(a => !a.startsWith('--'));
const terse = argIds.length === 0;

// How far off a block's bbox a route endpoint may land and still count as arriving at it. Lanes
// stop on a face, and a lane pair is offset by LANE_DY (12) around the flow line.
const HIT_TOL = 16;

const probe = () => {
  const svg = document.querySelector('dialog.scheme-dialog svg.diagram');
  if (!svg) return null;

  // getBBox() is in the element's own user space and primitives are translated groups, so map
  // every bbox through the element-to-root matrix (same mapping as check-geometry).
  const rootCTM = svg.getScreenCTM();
  const toRoot = (el) => {
    const b = el.getBBox();
    const m = rootCTM.inverse().multiply(el.getScreenCTM());
    const pt = (x, y) => {
      const p = svg.createSVGPoint(); p.x = x; p.y = y;
      const q = p.matrixTransform(m);
      return [q.x, q.y];
    };
    const c = [pt(b.x, b.y), pt(b.x + b.width, b.y), pt(b.x, b.y + b.height), pt(b.x + b.width, b.y + b.height)];
    const xs = c.map(p => p[0]), ys = c.map(p => p[1]);
    return { x: Math.min(...xs), y: Math.min(...ys), w: Math.max(...xs) - Math.min(...xs), h: Math.max(...ys) - Math.min(...ys) };
  };
  const label = (el, fallback) => {
    const t = el.querySelector('text');
    return ((t && t.textContent) || fallback).trim().slice(0, 28) || fallback;
  };

  // Blocks R3 governs. Node frames are containers, not receivers: a lane crosses them to reach
  // what they hold, so a frame at a route end is never the thing that "received" the ball.
  const blocks = [];
  for (const sel of ['.scheme-box', '.scheme-pod', '.scheme-cylinder']) {
    for (const el of svg.querySelectorAll(sel)) {
      if (el.closest('#packetLayer')) continue;
      const cs = getComputedStyle(el);
      if (cs.opacity === '0' || cs.display === 'none') continue;
      const b = toRoot(el);
      blocks.push({ kind: sel.slice(8), label: label(el, sel), ...b, hl: el.classList.contains('highlight') });
    }
  }

  // Value chips R2 governs. Chain-ladder rows are excluded: their highlight tracks the active row,
  // it is not a value that changes.
  const chips = [];
  let ci = 0;
  for (const el of svg.querySelectorAll('.scheme-chip')) {
    if (el.closest('#packetLayer') || el.closest('.scheme-chain')) continue;
    const texts = [...el.querySelectorAll('text')].map(t => (t.textContent || '').trim());
    chips.push({
      key: `${ci++}:${texts[0] || ''}`,
      name: texts[0] || '',
      value: texts.length > 1 ? texts[texts.length - 1] : null,
      hl: el.classList.contains('highlight'),
    });
  }

  // Packets: start and end of the transform keyframe list, plus the arrivalMs the kit stamped on
  // the element. Read at t=0 with everything paused, so this is the step's plan, not its progress.
  const packets = [];
  for (const el of svg.querySelectorAll('#packetLayer .scheme-packet')) {
    // The delay is read alongside the frames because R3 needs to know WHEN a ball departs, not only
    // that it does: "this block already acted" is only an excuse for being lit if it acted first.
    let frames = null, delay = 0;
    for (const a of el.getAnimations()) {
      const kf = a.effect.getKeyframes();
      if (kf.length && kf.some(k => k.transform && k.transform !== 'none')) {
        frames = kf;
        const t = a.effect.getComputedTiming();
        delay = Number.isFinite(t.delay) ? Math.round(t.delay) : 0;
        break;
      }
    }
    if (!frames) continue;
    const xy = (k) => {
      const m = /translate\(\s*(-?[\d.]+)px[, ]+\s*(-?[\d.]+)px\s*\)/.exec(k.transform || '');
      return m ? [+m[1], +m[2]] : null;
    };
    const from = xy(frames[0]), to = xy(frames[frames.length - 1]);
    if (!from || !to) continue;
    packets.push({ from, to, delay, arrivalMs: Number.isFinite(el.arrivalMs) ? Math.round(el.arrivalMs) : null, role: el.getAttribute('data-role') || '' });
  }

  return { blocks, chips, packets };
};

const browser = await launch();
const page = await browser.newPage({ viewport: { width: 1600, height: 1000 } });
await page.addInitScript(setInspect, 'expose');

const ids = terse ? await discoverIds(page) : argIds;
if (!ids.length) { console.error('NO CARDS RENDERED: posters/grid broken'); process.exit(1); }

// Is point p on or inside block b, within tol?
const near = (b, p, tol) =>
  p[0] >= b.x - tol && p[0] <= b.x + b.w + tol && p[1] >= b.y - tol && p[1] <= b.y + b.h + tol;

let badCards = 0, totalR3 = 0, totalR2 = 0, totalUnstamped = 0;
const queue = [];
for (const id of ids) {
  await page.goto(`${DEFAULT_BASE}/scheme/#scheme=${id}`, { waitUntil: 'networkidle' });
  await page.waitForSelector('dialog.scheme-dialog svg.diagram', { timeout: 10000 });
  const total = await stepCount(page);
  const issues = [];
  let prevChips = null;
  let r3 = 0, r2 = 0, unstamped = 0;

  for (let i = 0; i < total; i++) {
    const live = await enterStep(page, i);
    if (!live && i > 0) { issues.push(`  step ${i}  no _timeline handle: motion path not runnable, step skipped`); continue; }
    const data = await page.evaluate(probe);
    if (!data) continue;

    if (on('R3') && i > 0) {
      // A block that emits a ball is allowed to be lit at entry ONLY if it acts before it receives.
      // That is the round trip: the origin sends at delay 0 and its answer comes home later, so it
      // is legitimately lit from the start. A MID-CHAIN block is the opposite case: it receives hop
      // one and only then sends hop two, so it must be dark at entry and light on arrival.
      // The old exemption was "is the source of ANY packet in this step", which swallowed every
      // mid-chain block and every round-trip endpoint. That is why this rule reported 1 while a
      // read of the catalog found fifteen of exactly this shape.
      const actsFirst = (b, pkt) => data.packets.some(q =>
        near(b, q.from, HIT_TOL) && q.delay <= pkt.delay);
      for (const pkt of data.packets) {
        if (!pkt.arrivalMs) { unstamped++; continue; }  // no arrival to defer to: counted, not judged
        for (const b of data.blocks) {
          if (!near(b, pkt.to, HIT_TOL)) continue;
          if (actsFirst(b, pkt)) continue;
          if (!b.hl) continue;                        // correct: dark at entry, lights on arrival
          const key = `${i}|${b.label}|${b.x.toFixed(0)},${b.y.toFixed(0)}`;
          if (issues.some(l => l.includes(`[${key}]`))) continue;
          r3++;
          issues.push(`  R3  step ${i}  "${b.label}" (${b.kind}) is lit at step entry but receives a packet at ${pkt.arrivalMs}ms [${key}]`);
        }
      }
    }

    if (on('R2') && prevChips) {
      for (const c of data.chips) {
        const was = prevChips.find(p => p.key === c.key);
        if (!was || was.value == null || c.value == null) continue;
        if (was.value === c.value) continue;
        if (c.hl) continue;
        r2++;
        issues.push(`  R2  step ${i}  chip "${c.name}" changed ${JSON.stringify(was.value)} -> ${JSON.stringify(c.value)} without .highlight`);
      }
    }
    prevChips = data.chips;
  }

  totalR3 += r3; totalR2 += r2; totalUnstamped += unstamped;
  if (issues.length) {
    badCards++;
    queue.push(`${id}  R3=${r3} R2=${r2}`);
    console.log(`\n${id}  ${issues.length} finding(s)`);
    issues.forEach(l => console.log(l.replace(/ \[[^\]]*\]$/, '')));
  } else if (!terse) {
    console.log(`\n${id}  clean on [${[...rules].join(', ')}]`);
  }
}

await browser.close();
console.log(`\narrival check: ${ids.length} cards, ${badCards} with findings (R3 ${totalR3}, R2 ${totalR2})`);
// Reported rather than judged: a packet the kit never stamped has no arrival to defer to, so R3
// cannot see it either way. The number is the size of this rule's remaining blind spot.
if (totalUnstamped) console.log(`  packets with no arrivalMs stamp, invisible to R3: ${totalUnstamped}`);
if (terse && queue.length) {
  console.log('queue:');
  for (const q of queue) console.log('  ' + q);
}
process.exit(badCards ? 1 : 0);
