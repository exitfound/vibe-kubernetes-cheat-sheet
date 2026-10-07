// Opens every card once and takes every reading the render and report files assert over, into
// `.snapshot/panel.json`. A pipeline stage, not a cache: every script runs it first.
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  DEFAULT_BASE, DIAGRAM, FACE_MONO, SELECTOR_TIMEOUT_MS, builtChildren, collectPageErrors, launch,
  initPage, discoverIds, openCard, stepCount, stepMeta, gotoStep, enterStep, seekStep, stepSpan,
  fallbackFaces, overlayProbe, installGeometryHelpers, installOpacityHelpers, installKeyHelpers,
} from '../fixtures/render.mjs';
import {
  arrivalProbe, captureDeferred, chipProbe, geometryProbe, inlineProbe, motionProbe, opacityProbe,
  reducedSnap, runDeferred,
} from '../fixtures/probes.mjs';
import { OPACITY } from '../../js/lib/tokens.js';
import { PAINTED, probePaint } from '../fixtures/palette.mjs';

const HERE = dirname(fileURLToPath(import.meta.url));
export const SNAPSHOT = join(HERE, '..', '.snapshot', 'panel.json');

// JSON writes null for a non-finite number, and an empty accumulator is [Infinity, -Infinity]
// that consumers compare against, so non-finite values are encoded as tagged strings.
const INF = '@Infinity', NEG_INF = '@-Infinity', NAN = '@NaN';
const encode = (_k, v) =>
  typeof v !== 'number' || Number.isFinite(v) ? v
    : v === Infinity ? INF : v === -Infinity ? NEG_INF : NAN;
export const decode = (_k, v) =>
  v === INF ? Infinity : v === NEG_INF ? -Infinity : v === NAN ? NaN : v;

// L-06.
export const VIEWPORTS = [
  { width: 1600, height: 1000 },
  { width: 1280, height: 860 },
  { width: 1100, height: 800 },
];
export const vpName = vp => `${vp.width}x${vp.height}`;

// Owned by render/chipfit.test.mjs, stated here because the reading is taken here.
export const STACK_TOL = 4;

// Constants applied here and imported by the files that judge them.
export const HIT_TOL = 16;               // report/arrival: a ball is AT a target within this
const TERMINATED = OPACITY.terminated;  // render/opacity: the shade a terminated element holds
// Puts every delayed effect of the step, deferred handlers included, behind the playhead. The seek is instant.
const SETTLE_PAST_SPAN_MS = 400;
const SELECTORS = {
  els: '.scheme-box, .scheme-pod, .scheme-cylinder, .scheme-node, .scheme-chip, .scheme-arrow',
  wires: '.scheme-label',
  transient: '#packetLayer',
};

// Runs in the page, no free variables.
const fullProbe = () => {
  const svg = document.querySelector('dialog.scheme-dialog svg.diagram');
  if (!svg) return null;
  const toRoot = (el, b) => window.__toRoot(el, svg, b);

  const blocks = [];
  for (const sel of ['.scheme-box', '.scheme-pod', '.scheme-cylinder', '.scheme-node']) {
    const isFrame = sel === '.scheme-node';
    for (const el of svg.querySelectorAll(sel)) {
      if (el.closest('#packetLayer')) continue;
      const cs = getComputedStyle(el);
      if (cs.opacity === '0' || cs.display === 'none') continue;
      const b = toRoot(el, el.getBBox());
      const label = (el.querySelector('text') || {}).textContent || sel;
      blocks.push({ label: label.trim().slice(0, 28), x: b.x, y: b.y, w: b.w, h: b.h, isFrame });
    }
  }

  let cx0 = Infinity, cx1 = -Infinity, fx0 = Infinity, fx1 = -Infinity;
  for (const b of blocks) {
    cx0 = Math.min(cx0, b.x); cx1 = Math.max(cx1, b.x + b.w);
    if (!b.isFrame) { fx0 = Math.min(fx0, b.x); fx1 = Math.max(fx1, b.x + b.w); }
  }
  let px0 = Infinity, px1 = -Infinity;
  for (const el of svg.querySelectorAll('.scheme-chip')) {
    if (el.closest('#packetLayer')) continue;
    const cs = getComputedStyle(el);
    if (cs.opacity === '0' || cs.display === 'none') continue;
    const b = toRoot(el, el.getBBox());
    px0 = Math.min(px0, b.x); px1 = Math.max(px1, b.x + b.w);
  }

  return { blocks, content: [cx0, cx1], contentNoFrames: [fx0, fx1], chips: [px0, px1] };
};

// geometry-soft's two-edge panel reading under its own guards: null only when the overlay is absent.
const softPanel = () => {
  const svg = document.querySelector('dialog.scheme-dialog svg.diagram');
  const ov = document.querySelector('.narration-overlay');
  if (!svg || !ov) return null;
  const sb = svg.getBoundingClientRect();
  const ob = ov.getBoundingClientRect();
  const vb = svg.viewBox.baseVal;
  const scale = Math.min(sb.width / vb.width, sb.height / vb.height);
  const offX = sb.left + (sb.width - vb.width * scale) / 2;
  const offY = sb.top + (sb.height - vb.height * scale) / 2;
  return { right: (ob.right - offX) / scale + vb.x, bottom: (ob.bottom - offY) / scale + vb.y };
};

async function walk({ base = DEFAULT_BASE } = {}) {
  const browser = await launch();
  try {
    const context = await browser.newContext({ viewport: VIEWPORTS[0] });
    const page = await context.newPage();
    await page.addInitScript(initPage, 'expose');
    await installGeometryHelpers(page);
    await installOpacityHelpers(page);
    await installKeyHelpers(page);
    // Page globals are `__w`-prefixed so they cannot replace `window.__opacity`. One evaluate per step,
    // not three CDP round trips. overlayProbe is serialised from fixtures/render.mjs, not copied.
    await page.addInitScript(`window.__wFull = ${fullProbe.toString()};` +
                             `window.__wPanel = ${overlayProbe.toString()};` +
                             `window.__wSoftPanel = ${softPanel.toString()};` +
                             `window.__wGeometry = ${geometryProbe.toString()};` +
                             `window.__wChips = ${chipProbe.toString()};` +
                             `window.__wInline = ${inlineProbe.toString()};` +
                             `window.__wMotion = ${motionProbe.toString()};` +
                             `window.__wOpacity = ${opacityProbe.toString()};` +
                             `window.__wArrival = ${arrivalProbe.toString()};` +
                             `window.__wSnap = ${reducedSnap.toString()};` +
                             `window.__wCapture = ${captureDeferred.toString()};` +
                             `window.__wRunDeferred = ${runDeferred.toString()};`);
    const ids = await discoverIds(page, base);

    const cards = {};
    for (const id of ids) {
      // Collected across the whole visit for render/inline (module that would not parse) and render/smoke.
      const collector = collectPageErrors(page);
      let openError = null;
      try {
        await openCard(page, id);
      } catch (e) {
        openError = String(e.message).split('\n')[0];
        collector.stop();
        cards[id] = { openError, errors: collector.errors.slice(), steps: 0, byVp: {} };
        continue;
      }
      // render/chipfit guards only the mono face, everything else both.
      const fellBack = await fallbackFaces(page);
      const fellBackMono = await fallbackFaces(page, [FACE_MONO]);
      const total = await stepCount(page);
      const meta = total ? await stepMeta(page) : null;
      const aria = await page.$eval(DIAGRAM, s => s.getAttribute('aria-label') || '');
      const built = await builtChildren(page);
      const byVp = {};
      for (const vp of VIEWPORTS) {
        const name = vpName(vp);
        if (name !== vpName(VIEWPORTS[0])) await page.setViewportSize(vp);
        const rows = [];
        // Geometry is viewBox space, taken once. The panel is a pixel box, taken on all three viewports.
        const wantGeom = name === vpName(VIEWPORTS[0]);
        for (let i = 0; i < total; i++) {
          await gotoStep(page, i);
          const take = () => page.evaluate(({ g, stackTol, sel, selectors, tol }) => ({
            geom: g ? window.__wFull() : null,
            lanes: g ? window.__wGeometry() : null,
            chips: g ? window.__wChips({ stackTol }) : null,
            inline: g ? window.__wInline({ sel }) : null,
            // render/reduced's static frame, the way prev and reset replay the step.
            snap: g ? window.__wSnap(selectors) : null,
            // report/arrival's settled reading: gotoStep with ctx.reduced runs every deferred branch.
            arrival: g ? window.__wArrival({ tol }) : null,
            panel: window.__wPanel(),
            panelSoft: window.__wSoftPanel(),
          }), { g: wantGeom, stackTol: STACK_TOL, sel: DIAGRAM, selectors: SELECTORS, tol: HIT_TOL });
          let row = await take();
          // One retry when a reset has momentarily removed the diagram, on a null geometry or a null panel.
          // A selector timeout leaves the row null for the consumer to report.
          if ((wantGeom && !row.geom) || !row.panel) {
            try {
              await page.waitForSelector(DIAGRAM, { timeout: SELECTOR_TIMEOUT_MS });
              row = await take();
            } catch (_) { /* leave the row as it came back. The consumer reports it */ }
          }
          rows.push(row);
        }
        byVp[name] = rows;
      }
      await page.setViewportSize(VIEWPORTS[0]);

      // Played pass, order load-bearing: enterStep, reads at t=0, captureDeferred, stepSpan, seek(span + 1)
      // for opacity, seek(span + SETTLE) then runDeferred and snap for reduced. runDeferred is the only mutation.
      const played = [];
      for (let i = 0; i < total; i++) {
        const live = await enterStep(page, i);
        const takeZero = () => page.evaluate(({ tol }) => ({
          motion: window.__wMotion(),
          arrival: window.__wArrival({ tol }),
        }), { tol: HIT_TOL });
        let atZero = await takeZero();
        // One retry, as above: a null at t=0 is a rebuild race, not a broken card.
        if (!atZero.motion || !atZero.arrival) {
          try {
            await page.waitForSelector(DIAGRAM, { timeout: SELECTOR_TIMEOUT_MS });
            atZero = await takeZero();
          } catch (_) { /* the consumer reports the null */ }
        }
        const pulsed = await page.evaluate(captureDeferred, SELECTORS);
        const span = await stepSpan(page);
        // Read even on an unplayed step, which render/opacity's `sampled` census counts.
        if (live) await seekStep(page, span + 1);
        const opacity = await page.evaluate(opacityProbe, { terminated: TERMINATED });
        await seekStep(page, span + SETTLE_PAST_SPAN_MS);
        await page.evaluate(runDeferred, span + SETTLE_PAST_SPAN_MS);
        const snapPlayed = await page.evaluate(reducedSnap, SELECTORS);
        played.push({ live, span, pulsed, motion: atZero.motion, arrival: atZero.arrival, opacity, snap: snapPlayed });
      }

      collector.stop();
      cards[id] = {
        openError, errors: collector.errors.slice(), steps: total, fellBack, fellBackMono,
        meta, aria, built, byVp, played,
      };
    }

    // reducedMotion is a context option, so the palette files get a second context: a mid-flight
    // pulse would turn a motion magnitude into a colour finding.
    const rmContext = await browser.newContext({ viewport: VIEWPORTS[0], reducedMotion: 'reduce' });
    const rmPage = await rmContext.newPage();
    await rmPage.addInitScript(initPage, 'expose');
    const rmIds = await discoverIds(rmPage, base);
    if (rmIds.length !== ids.length) {
      throw new Error(`the reduced-motion grid rendered ${rmIds.length} cards and the first ` +
        `rendered ${ids.length}. One of the two walks is reading a different catalog.`);
    }
    for (const id of rmIds) {
      const card = cards[id];
      if (!card || card.openError) continue;
      try {
        await openCard(rmPage, id);
        const open = await rmPage.evaluate(probePaint, PAINTED);
        const total = card.steps;
        const stat = [], play = [];
        for (let i = 0; i < total; i++) {
          await gotoStep(rmPage, i);
          stat.push(await rmPage.evaluate(probePaint, PAINTED));
        }
        // Step 0 is the static poster with no play path.
        play.push(null);
        for (let i = 1; i < total; i++) {
          await enterStep(rmPage, i);
          play.push(await rmPage.evaluate(probePaint, PAINTED));
        }
        card.paint = { open, static: stat, played: play };
      } catch (err) {
        card.paintError = String(err.message).split('\n')[0];
      }
    }
    await rmContext.close();

    // A walk that opened nothing is a failed run, not an empty one.
    const opened = Object.values(cards).filter(c => !c.openError).length;
    if (!opened) {
      throw new Error(
        `the walk opened NONE of the ${ids.length} cards it found on the grid. Every card threw on ` +
        `openCard, which is a run failure and not a catalog finding: check that the server at ` +
        `${base} is still answering. First error: ${Object.values(cards)[0].openError}`);
    }
    // A partial failure fails the run too, reported once here instead of as broken cards in every consumer.
    if (opened < ids.length) {
      const broken = Object.entries(cards).filter(([, c]) => c.openError).slice(0, 5);
      throw new Error(
        `the walk opened ${opened} of the ${ids.length} cards on the grid. ${ids.length - opened} ` +
        'never opened, and a snapshot missing them makes every consumer report them as broken ' +
        'cards rather than as a run that went wrong. Re-run: this is almost always the static ' +
        `server at ${base} dropping requests under a parallel run.\n  ` +
        broken.map(([id, c]) => `${id}: ${c.openError}`).join('\n  '));
    }

    return {
      generatedAt: new Date().toISOString(),
      base,
      viewports: VIEWPORTS.map(vpName),
      ids,
      cards,
    };
  } finally {
    await browser.close();
  }
}

if (process.argv[1] && process.argv[1].endsWith('walk.mjs')) {
  const t0 = Date.now();
  const snap = await walk();
  mkdirSync(dirname(SNAPSHOT), { recursive: true });
  writeFileSync(SNAPSHOT, JSON.stringify(snap, encode));
  const steps = Object.values(snap.cards).reduce((n, c) => n + c.steps, 0);
  console.log(`walk: ${snap.ids.length} cards, ${steps} steps, ${snap.viewports.length} viewports ` +
              `-> ${SNAPSHOT} in ${((Date.now() - t0) / 1000).toFixed(1)}s`);
}
