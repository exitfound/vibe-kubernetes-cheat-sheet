#!/usr/bin/env node
// anim-dump.mjs: a card's motion AS DATA per step (target, props, dur/delay/easing, transforms
// sampled at fixed progress, plus DOM facts). Analysis aid, not a gate. See scheme/CLAUDE.md.
// node anim-dump.mjs <id> [step] [--samples=0,50,100] [--json] [--base=URL]

import { launch, setInspect, stepCount, enterStep, stepSpan, DEFAULT_BASE } from './_shared.mjs';

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
let sampleOffsets = String(flags.samples || '0,50,100')
  .split(',').map(s => parseInt(s, 10))
  .filter(n => Number.isFinite(n))
  .map(n => Math.max(0, Math.min(100, n)) / 100);
if (!sampleOffsets.length) sampleOffsets = [0, 0.5, 1];

if (!schemeId) {
  console.error('Usage: node anim-dump.mjs <scheme-id> [step] [--samples=0,50,100] [--json] [--base=URL]');
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

(async () => {
  const browser = await launch();
  const ctx = await browser.newContext({ reducedMotion: 'no-preference', viewport: { width: 1400, height: 900 } });
  await ctx.addInitScript(setInspect, 'expose');
  const page = await ctx.newPage();

  await page.goto(`${baseUrl}/scheme/#scheme=${schemeId}`, { waitUntil: 'domcontentloaded' });
  await page.waitForFunction(() => !!window.__schemeCtl, null, { timeout: 8000 });
  await page.waitForSelector(DIAGRAM, { timeout: 8000 });

  const total = await stepCount(page);
  if (!total) { console.error(`No steps for ${schemeId}. base=${baseUrl}`); await browser.close(); process.exit(2); }

  let targets;
  if (stepArg) {
    const s = parseInt(stepArg, 10);
    if (!Number.isInteger(s) || s < 1 || s > total) {
      console.error(`Step "${stepArg}" out of range (1..${total}) for ${schemeId}.`);
      await browser.close();
      process.exit(2);
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

  await browser.close();

  if (degraded) console.error('WARN: controller lacked _timeline; some steps fell back to static state (no motion).');
  if (asJson) {
    console.log(JSON.stringify({ id: schemeId, sampleOffsets, steps }, null, 2));
  } else {
    console.log(renderTable(schemeId, steps, sampleOffsets));
  }
})().catch(e => { console.error(e); process.exit(1); });
