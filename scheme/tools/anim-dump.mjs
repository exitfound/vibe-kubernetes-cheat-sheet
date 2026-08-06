#!/usr/bin/env node
// anim-dump.mjs: a card's motion AS DATA per step (target, props, dur/delay/easing, transforms
// sampled at fixed progress, plus DOM facts). Analysis aid, not a gate. See ./README.md.
// node anim-dump.mjs <id> [step] [--samples=0,50,100] [--json] [--base=URL]
// node anim-dump.mjs --all --out=DIR [--samples=...]   one JSON per card, the motion oracle

import { mkdir, writeFile, rm } from 'node:fs/promises';
import { join } from 'node:path';
import { launch, setInspect, stepCount, enterStep, stepSpan, discoverIds, DEFAULT_BASE } from './_shared.mjs';

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
// --base= wins, else BASE= from the env. No hardcoded default: that made BASE inert and dumped
// the container's stale copy as if it were current.
const baseUrl = (flags.base || DEFAULT_BASE).replace(/\/$/, '');
const asJson = !!flags.json;
// --all walks the whole catalog and writes one JSON per card under --out. That pair is the
// motion half of the refactor oracle: run it before and after a change and diff the trees.
const dumpAll = !!flags.all;
const outDir = typeof flags.out === 'string' ? flags.out : null;
let sampleOffsets = String(flags.samples || '0,50,100')
  .split(',').map(s => parseInt(s, 10))
  .filter(n => Number.isFinite(n))
  .map(n => Math.max(0, Math.min(100, n)) / 100);
if (!sampleOffsets.length) sampleOffsets = [0, 0.5, 1];

if (!schemeId && !dumpAll) {
  console.error('Usage: node anim-dump.mjs <scheme-id> [step] [--samples=0,50,100] [--json] [--base=URL]');
  console.error('       node anim-dump.mjs --all --out=DIR [--samples=0,50,100] [--base=URL]');
  process.exit(1);
}
if (dumpAll && !outDir) {
  console.error('--all needs --out=DIR (108 dumps do not belong on stdout).');
  process.exit(1);
}

const DIAGRAM = 'dialog.scheme-dialog svg.diagram';

// One round-trip per step: read animation metadata + sample computed values at each
// progress point by seeking, plus the step's DOM facts and narration.
function dumpStep(page, offsets) {
  return page.evaluate(({ sel, offsets }) => {
    const svg = document.querySelector(sel);
    if (!svg) return null;
    const anims = document.getAnimations().filter(a => {
      const t = a.effect && a.effect.target;
      return t && svg.contains(t);
    });

    let span = 0;
    for (const a of anims) {
      const t = a.effect.getComputedTiming();
      const active = Number.isFinite(t.activeDuration) ? t.activeDuration : (t.duration || 0);
      const end = (t.delay || 0) + active + (t.endDelay || 0);
      if (Number.isFinite(end) && end > span) span = end;
    }
    span = Math.round(span);

    const labelOf = (el) => {
      if (!el) return '?';
      if (el.id) return '#' + el.id;
      const cls = (el.getAttribute('class') || '').split(/\s+/)[0] || el.tagName;
      let p = el, txt = '';
      while (p && p !== svg) {
        const l = p.querySelector && p.querySelector('.scheme-pod-label,.scheme-box-label,.scheme-node-label');
        if (l && l.textContent.trim()) { txt = l.textContent.trim(); break; }
        p = p.parentNode;
      }
      return (txt ? txt + ' ' : '') + cls;
    };
    const propsOf = (a) => {
      const set = new Set();
      for (const f of a.effect.getKeyframes()) {
        for (const k of Object.keys(f)) {
          if (['offset', 'computedOffset', 'easing', 'composite'].includes(k)) continue;
          set.add(k);
        }
      }
      return [...set];
    };
    const fmt = (prop, val) => {
      if (val == null) return '';
      if (prop === 'transform') {
        if (val === 'none') return 't(0,0)';
        const m = val.match(/matrix\(([^)]+)\)/);
        if (m) { const p = m[1].split(',').map(s => +s.trim()); return `t(${Math.round(p[4])},${Math.round(p[5])})`; }
      }
      if (prop === 'opacity') return (+val).toFixed(2);
      return String(val).replace(/\s+/g, ' ').slice(0, 26);
    };

    const meta = anims.map(a => {
      const props = propsOf(a);
      const primary = props.includes('transform') ? 'transform'
        : props.includes('opacity') ? 'opacity'
        : (props[0] || '');
      const t = a.effect.getComputedTiming();
      return {
        target: labelOf(a.effect.target),
        props,
        primary,
        durMs: Math.round(t.duration || 0),
        delayMs: Math.round(t.delay || 0),
        iters: Number.isFinite(t.iterations) ? t.iterations : 'inf',
        easing: a.effect.getTiming().easing,
        samples: [],
      };
    });

    for (const off of offsets) {
      const T = Math.round(span * off);
      for (const a of anims) { try { a.pause(); a.currentTime = T; } catch (_) {} }
      anims.forEach((a, i) => {
        const cs = getComputedStyle(a.effect.target);
        const prim = meta[i].primary;
        meta[i].samples.push(prim ? fmt(prim, cs[prim]) : '');
      });
    }

    const packetLayer = svg.querySelector('#packetLayer');
    const packets = packetLayer ? packetLayer.querySelectorAll('.scheme-packet').length : 0;
    const ballOnTop = packetLayer ? (packetLayer === svg.lastElementChild) : null;
    const highlights = [...svg.querySelectorAll('.highlight')].map(labelOf);

    const stepEl = document.querySelector('dialog.scheme-dialog .narration-step');
    const textEl = document.querySelector('dialog.scheme-dialog .narration-text');
    return {
      span, packets, ballOnTop, highlights,
      stepLabel: stepEl ? stepEl.textContent.trim() : '',
      narration: textEl ? textEl.textContent.trim() : '',
      anims: meta,
    };
  }, { sel: DIAGRAM, offsets });
}

// Fixed-width cell: truncate (with a trailing '>') when longer than the column, so
// long values like 'brightness(1.31536)' or 'strokeOpacity' never push columns out.
const padR = (s, n) => { s = String(s); return (s.length > n ? s.slice(0, n - 1) + '>' : s).padEnd(n); };
const padL = (s, n) => { s = String(s); return (s.length > n ? s.slice(0, n - 1) + '>' : s).padStart(n); };

function renderTable(id, steps, offsets) {
  const pct = offsets.map(o => `${Math.round(o * 100)}%`);
  const SW = 14;            // sample column width
  const out = [];
  out.push(`\n=== ${id} === (${steps.length} steps, sampled at ${pct.join(' / ')})`);
  for (const s of steps) {
    if (!s) continue;
    const { idx, data } = s;
    const flags = [
      `span=${data.span}ms`,
      `packets=${data.packets}`,
      data.ballOnTop === true ? 'BALL-ON-TOP' : null,
      data.highlights.length ? `hl=[${data.highlights.join(', ')}]` : null,
    ].filter(Boolean).join('  ');
    out.push(`\nstep ${String(idx + 1).padStart(2, '0')}  ${data.stepLabel || ''}  ${flags}`);
    if (data.narration) out.push(`   "${data.narration}"`);
    if (!data.anims.length) { out.push('   (no animations)'); continue; }
    const w = Math.max(18, ...data.anims.map(a => a.target.length));
    out.push('   ' + padR('target', w) + '  ' + padR('prop', 14) + padR('dur/delay', 11) + padR('easing', 11) + pct.map(p => padL(p, SW)).join(''));
    for (const a of data.anims) {
      const timing = `${a.durMs}/${a.delayMs}`;
      out.push('   ' + padR(a.target, w) + '  ' + padR(a.primary || a.props[0] || '', 14) + padR(timing, 11) + padR(String(a.easing), 11) + a.samples.map(v => padL(v, SW)).join(''));
    }
  }
  return out.join('\n');
}

// One card, on its own page. A FRESH page per card is deliberate: navigating hash-only does not
// reload, so window.__schemeCtl would still hold the PREVIOUS card's controller and every wait
// below would pass instantly against the wrong scheme.
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
    const steps = [];
    for (const idx of targets) {
      const ran = await enterStep(page, idx);
      if (!ran) degraded = true;
      await page.waitForTimeout(20);
      const _span = await stepSpan(page); // warms getAnimations after enter
      const data = await dumpStep(page, sampleOffsets);
      steps.push({ idx, data });
    }
    return { steps, degraded };
  } finally {
    await page.close();
  }
}

(async () => {
  const browser = await launch();
  const ctx = await browser.newContext({ reducedMotion: 'no-preference', viewport: { width: 1400, height: 900 } });
  await ctx.addInitScript(setInspect, 'expose');

  if (dumpAll) {
    const probe = await ctx.newPage();
    const ids = await discoverIds(probe, baseUrl);
    await probe.close();
    if (!ids.length) { console.error(`No cards discovered. base=${baseUrl}`); await browser.close(); process.exit(2); }
    // Wipe first, and write _complete only at the end. Without both, a run that dies partway
    // leaves the previous run's files in place, the directory still holds 108 of them, and
    // `diff -rq` against the baseline reports no changes over dumps that were never taken. That
    // is not theoretical: it happened here, and it passed a refactor that had broken 11 cards.
    await rm(outDir, { recursive: true, force: true });
    await mkdir(outDir, { recursive: true });

    let degradedAny = 0, steps = 0;
    for (const [i, id] of ids.entries()) {
      const r = await dumpCard(ctx, id, null);
      if (r.fatal) { console.error(r.fatal); await browser.close(); process.exit(2); }
      if (r.degraded) degradedAny++;
      steps += r.steps.length;
      await writeFile(join(outDir, `${id}.json`), JSON.stringify({ id, sampleOffsets, steps: r.steps }, null, 2) + '\n');
      process.stderr.write(`\r  ${i + 1}/${ids.length} ${id}`.padEnd(60));
    }
    process.stderr.write('\r'.padEnd(61) + '\r');
    await browser.close();
    if (degradedAny) console.error(`WARN: ${degradedAny} card(s) fell back to static state (no _timeline).`);
    await writeFile(join(outDir, '_complete'), `${ids.length} cards, ${steps} steps\n`);
    console.log(`anim-dump --all: ${ids.length} cards, ${steps} steps -> ${outDir}`);
    return;
  }

  const r = await dumpCard(ctx, schemeId, stepArg);
  await browser.close();
  if (r.fatal) { console.error(r.fatal); process.exit(2); }

  if (r.degraded) console.error('WARN: controller lacked _timeline; some steps fell back to static state (no motion).');
  if (outDir) {
    await mkdir(outDir, { recursive: true });
    await writeFile(join(outDir, `${schemeId}.json`), JSON.stringify({ id: schemeId, sampleOffsets, steps: r.steps }, null, 2) + '\n');
    console.log(`anim-dump: ${schemeId} -> ${join(outDir, `${schemeId}.json`)}`);
  } else if (asJson) {
    console.log(JSON.stringify({ id: schemeId, sampleOffsets, steps: r.steps }, null, 2));
  } else {
    console.log(renderTable(schemeId, r.steps, sampleOffsets));
  }
})().catch(e => { console.error(e); process.exit(1); });
