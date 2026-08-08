#!/usr/bin/env node
// reduced-dump.mjs: a card's STATE ON THE REDUCED PATH per step (gotoStep under
// prefers-reduced-motion: serialized DOM, the sorted highlight set, chips and wires by ref key).
// The third half of the refactor oracle. Analysis aid, not a gate.
// node reduced-dump.mjs <id> [step] [--base=URL]
// node reduced-dump.mjs --all --out=DIR [--base=URL]
//
// WHY A THIRD HALF. The other two walk the ANIMATED path and only that path: both open their
// context with reducedMotion: 'no-preference' (anim-dump.mjs:218, dom-dump.mjs:100) and _shared's
// enterStep runs `tl._enterStep(i, { withTimer: false, reduced: false })`. On the test side
// render/reduced.test.mjs enforces two axes, OPACITY-OWN and OPACITY-INHERITED; its HIGHLIGHT axis
// reports and never fails. So nothing that must pass ever executes the `if (ctx.reduced)` branch of
// a step, and `CARD CLEAN` said nothing whatsoever about it.
//
// That branch is not a corner. It is what a viewer SEES after prev, after reset, after a #step deep
// link, and always under prefers-reduced-motion. Since the declarative layer landed it is also
// DERIVED rather than written: step-spec's flowLights reads every `lights`/`targets` in a flow and
// produces the guard (93 guards in cluster: 24 empty, 68 exact, 1 that genuinely differs and states
// reducedLit). A wrong derivation is a silent, invisible, catalog-wide defect, and the two existing
// halves are blind to it by construction: the animated path never calls flowLights at all.
//
// WHY gotoStep AND NOT A PRIVATE REPLAY. Timeline.gotoStep(i) resets the scene and replays steps
// 0..i with _ctx(true), which IS the reduced path, verbatim, the same code prev and a deep link
// run. Dumping anything else would be dumping a tool's opinion of the reduced path.
//
// WHAT THIS HALF STILL CANNOT SEE. It never plays anything, so it says nothing about motion (that
// is anim-dump) and nothing about a step's `duration` (nothing in the oracle sees that, only
// render/duration.test.mjs). It also cannot see F.fade({ unlight }): unlight fires from an onfinish
// on the animated path, and on the reduced path the fade is never emitted, so removing it changes
// no byte in any of the three halves. Anything a card hangs off an onfinish is outside the oracle.

import { mkdir, writeFile, rm } from 'node:fs/promises';
import { join } from 'node:path';
import { launch, setInspect, stepCount, discoverIds, DEFAULT_BASE } from './_shared.mjs';

const args = process.argv.slice(2);
const flags = Object.fromEntries(
  args.filter(a => a.startsWith('--')).map(a => {
    const [k, v] = a.replace(/^--/, '').split('=');
    return [k, v === undefined ? true : v];
  }),
);
const positional = args.filter(a => !a.startsWith('--'));
const schemeId = positional[0];
const stepArg = positional[1];
const baseUrl = (flags.base || DEFAULT_BASE).replace(/\/$/, '');
const dumpAll = !!flags.all;
const outDir = typeof flags.out === 'string' ? flags.out : null;

if (!schemeId && !dumpAll) {
  console.error('Usage: node reduced-dump.mjs <scheme-id> [step] [--base=URL]');
  console.error('       node reduced-dump.mjs --all --out=DIR [--base=URL]');
  process.exit(1);
}
if (dumpAll && !outDir) {
  console.error('--all needs --out=DIR (108 dumps do not belong on stdout).');
  process.exit(1);
}

const DIAGRAM = 'dialog.scheme-dialog svg.diagram';

// Replay 0..idx through the controller's own reduced path. Returns false if the debug handle is
// missing, in which case there is no reduced path to read and the caller reports the card degraded.
const gotoReduced = (page, idx) => page.evaluate((i) => {
  const c = window.__schemeCtl;
  if (!c || typeof c.gotoStep !== 'function') return false;
  c.gotoStep(i);
  return true;
}, idx);

// One round-trip per step. Everything below is read from the settled DOM: nothing is animating on
// this path, so there is no seek, no sampling and no timing to be race-free about.
const readStep = (page, idx) => page.evaluate(({ sel, i }) => {
  const svg = document.querySelector(sel);
  if (!svg) return null;
  const tl = window.__schemeCtl && window.__schemeCtl._timeline;
  const refs = (tl && tl.scene && tl.scene.refs) || null;

  // Element -> the name the CARD calls it, so a diff line reads `apiserver` and not a class soup.
  // 101 of the 108 card modules carry a refs map; the rest fall back to the DOM path below.
  const nameOf = new Map();
  const claim = (el, key) => { if (el && el.nodeType === 1 && !nameOf.has(el)) nameOf.set(el, key); };
  if (refs) {
    for (const k of Object.keys(refs)) {
      if (k === 'wires') continue;
      const v = refs[k];
      if (Array.isArray(v)) v.forEach((el, n) => claim(el, `${k}[${n}]`));
      else claim(v, k);
    }
    if (refs.wires) for (const k of Object.keys(refs.wires)) claim(refs.wires[k], `wires.${k}`);
  }
  // Fallback identity: the child-index path from the diagram root. Unambiguous and stable, and a
  // structural move that shifts it is a change dom-dump reports on the same run.
  const pathOf = (el) => {
    const p = [];
    for (let n = el; n && n !== svg && n.parentNode; n = n.parentNode) {
      p.unshift([...n.parentNode.children].indexOf(n));
    }
    return p.join('/');
  };
  const idOf = (el) => nameOf.get(el)
    || `@${pathOf(el)}.${(el.getAttribute('class') || '').split(/\s+/).filter(c => c && c !== 'highlight')[0] || el.tagName}`;

  // THE AXIS flowLights OWNS. Sorted, because the reduced guard adds classes in a list order that
  // is not observable anywhere else: sorting keeps the diff about membership, which is the claim.
  const highlights = [...svg.querySelectorAll('.highlight')].map(idOf).sort();

  // Chips and wires are already inside the serialized DOM. They are pulled out by ref key as well
  // because a chip that stops being written shows up here as one readable line instead of as a
  // changed <text> node 4KB into the tag stream.
  const chips = [], wires = [];
  if (refs) {
    for (const k of Object.keys(refs).sort()) {
      const v = refs[k];
      if (v && v.valueText) chips.push(`${k}=${v.valueText.textContent}`);
    }
    if (refs.wires) for (const k of Object.keys(refs.wires).sort()) wires.push(`${k}=${refs.wires[k].textContent}`);
  }

  // Script-driven animations only (a CSSTransition is a different constructor and can still be in
  // flight from a class change). On the reduced path this must be 0: a non-zero count is a step
  // emitting motion through its guard, which is exactly the defect the guard exists to prevent.
  const scriptAnims = document.getAnimations().filter(a => {
    const t = a.effect && a.effect.target;
    return t && svg.contains(t) && a.constructor && a.constructor.name === 'Animation';
  }).length;

  // The step id, which NO other half of the oracle can see (anim-dump reads the narration panel,
  // dom-dump reads the diagram): both are blind to `id` and to the key order of STEPS.
  const step = tl && tl.steps && tl.steps[i];
  return { html: svg.outerHTML, highlights, chips, wires, scriptAnims, stepId: (step && step.id) || '' };
}, { sel: DIAGRAM, i: idx });

// One tag per line so `diff` points at the element that changed instead of at a 6KB single line.
// Purely presentational and deterministic: it never merges or reorders anything.
const asLines = (html) => html.replace(/></g, '>\n<');

async function dumpCard(ctx, id, only) {
  const page = await ctx.newPage();
  try {
    await page.goto(`${baseUrl}/scheme/#scheme=${id}`, { waitUntil: 'domcontentloaded' });
    await page.waitForFunction(() => !!window.__schemeCtl, null, { timeout: 8000 });
    await page.waitForSelector(DIAGRAM, { timeout: 8000 });

    const total = await stepCount(page);
    if (!total) return { fatal: `No steps for ${id}. base=${baseUrl}` };

    let targets;
    if (only) {
      const s = parseInt(only, 10);
      if (!Number.isInteger(s) || s < 1 || s > total) {
        return { fatal: `Step "${only}" out of range (1..${total}) for ${id}.` };
      }
      targets = [s - 1];
    } else {
      targets = Array.from({ length: total }, (_, i) => i);
    }

    let degraded = false;
    const out = [`=== ${id} === (${total} steps, reduced path)`];
    for (const idx of targets) {
      const ran = await gotoReduced(page, idx);
      if (!ran) degraded = true;
      const d = await readStep(page, idx);
      if (!d) return { fatal: `No diagram for ${id} at step ${idx + 1}. base=${baseUrl}` };
      const n = String(idx + 1).padStart(2, '0');
      out.push(`\n--- step ${n} id=${d.stepId} ---`);
      out.push(`highlights (${d.highlights.length}): ${d.highlights.join(', ')}`);
      if (d.chips.length) out.push(`chips: ${d.chips.join('  ')}`);
      if (d.wires.length) out.push(`wires: ${d.wires.join('  ')}`);
      out.push(`scriptAnims: ${d.scriptAnims}`);
      out.push(asLines(d.html));
    }
    return { text: out.join('\n') + '\n', degraded, steps: targets.length };
  } finally {
    await page.close();
  }
}

(async () => {
  const browser = await launch();
  // The whole point of the tool: 'reduce' is what makes app.js skip the poster autoPlay (app.js:529)
  // and what a real reduced-motion viewer gets. gotoStep would force ctx.reduced on its own, but
  // without the media state a dwell timer would still fire and advance the step under the dump.
  const ctx = await browser.newContext({ reducedMotion: 'reduce', viewport: { width: 1400, height: 900 } });
  await ctx.addInitScript(setInspect, 'expose');

  if (dumpAll) {
    const probe = await ctx.newPage();
    const ids = await discoverIds(probe, baseUrl);
    await probe.close();
    if (!ids.length) { console.error(`No cards discovered. base=${baseUrl}`); await browser.close(); process.exit(2); }
    // Wipe first, sentinel last. See the same block in anim-dump.mjs for what a half-written
    // output directory did to a refactor that had broken 11 cards.
    await rm(outDir, { recursive: true, force: true });
    await mkdir(outDir, { recursive: true });

    let degradedAny = 0, steps = 0;
    for (const [i, id] of ids.entries()) {
      const r = await dumpCard(ctx, id, null);
      if (r.fatal) { console.error(r.fatal); await browser.close(); process.exit(2); }
      if (r.degraded) degradedAny++;
      steps += r.steps;
      await writeFile(join(outDir, `${id}.txt`), r.text);
      process.stderr.write(`\r  ${i + 1}/${ids.length} ${id}`.padEnd(60));
    }
    process.stderr.write('\r'.padEnd(61) + '\r');
    await browser.close();
    if (degradedAny) console.error(`WARN: ${degradedAny} card(s) had no controller handle (no reduced path read).`);
    await writeFile(join(outDir, '_complete'), `${ids.length} cards, ${steps} steps\n`);
    console.log(`reduced-dump --all: ${ids.length} cards, ${steps} steps -> ${outDir}`);
    return;
  }

  const r = await dumpCard(ctx, schemeId, stepArg);
  await browser.close();
  if (r.fatal) { console.error(r.fatal); process.exit(2); }
  if (r.degraded) console.error('WARN: controller lacked gotoStep; the reduced path was not read.');

  if (outDir) {
    await mkdir(outDir, { recursive: true });
    await writeFile(join(outDir, `${schemeId}.txt`), r.text);
    console.log(`reduced-dump: ${schemeId} -> ${join(outDir, `${schemeId}.txt`)}`);
  } else {
    process.stdout.write(r.text);
  }
})().catch(e => { console.error(e); process.exit(1); });
