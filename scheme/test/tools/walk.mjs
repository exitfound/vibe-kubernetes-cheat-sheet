// walk.mjs: open every card ONCE and take every panel and geometry reading the report tier needs,
// into `.snapshot/panel.json`. `report/overlay.test.mjs` and `report/geometry-soft.test.mjs` then
// assert over the file instead of each driving its own browser.
//
// WHY. Measured on 2026-09-01, quiet machine, 123 cards and 750 steps: a browser launch costs 0.1s,
// the grid load 0.3s, and `openCard` 85ms x 123 = 10.5s. Thirteen browser-driven test files pay
// that 10.5s each, so 137 of the suite's 265 seconds is spent re-opening cards that were already
// open in another process a moment earlier. Nothing is shareable across those processes, because
// `node --test` forks one per file. So the sharing has to happen BEFORE them, here.
//
// These two files in particular walked the SAME two extra viewports with the SAME panel probe:
// `overlay` reads all three viewports for the panel numbers it prints, `geometry-soft` reads the
// two extra ones only to feed OCCLUDED. 1500 duplicated step probes and 246 duplicated viewport
// resizes, and 84 of the report's 135 seconds.
//
// STALENESS IS NOT A RISK HERE, because this is a pipeline stage and not a cache: `npm run report`
// runs it first, every time, and it keys nothing and reuses nothing. There is no mode in which a
// test reads a snapshot of a tree that has since changed. If that ever stops being true the
// `generatedAt` and `base` in the file are what a reader checks first.
//
// ONE PROBE WHERE THERE WERE TWO. `geometry-soft` computed the panel rect inline with the same six
// lines of arithmetic as `fixtures/render.mjs overlayProbe`, and the two differed only in their
// guards: `overlayProbe` returns null on a zero-width svg or viewBox, the inline one did not, and
// it returned two edges where the shared one returns four. Both readings are taken and both are
// stored, `panel` under the shared guards and `panelSoft` under the inline ones, so neither
// consumer's behaviour moves by a step. Two copies of one measurement is the defect this file was
// written to remove, not one to carry forward.
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

// -------------------------------------------------------------------------------------------
// INFINITY SURVIVES THE ROUND TRIP, and it has to. An empty accumulator in these probes is
// `[Infinity, -Infinity]`: a card that draws no chip leaves its strip at exactly that, and every
// consumer relies on the comparison against it being FALSE so no finding is made. `JSON.stringify`
// writes `null` for a non-finite number, `Math.min(Infinity, null)` is 0, and the strip then reads
// `0..0, centre 0` and fires CENTRE on six cards that have nothing wrong with them. Caught by
// diffing the printed report against the run before the change, which is the only thing that could
// have caught it: every one of those six was a plausible-looking finding.
// -------------------------------------------------------------------------------------------
// `decode` is the only half of this pair anyone else needs: `fixtures/snapshot.mjs` hands it to
// JSON.parse. `encode` has one caller, the write below.
const INF = '@Infinity', NEG_INF = '@-Infinity', NAN = '@NaN';
const encode = (_k, v) =>
  typeof v !== 'number' || Number.isFinite(v) ? v
    : v === Infinity ? INF : v === -Infinity ? NEG_INF : NAN;
export const decode = (_k, v) =>
  v === INF ? Infinity : v === NEG_INF ? -Infinity : v === NAN ? NaN : v;

// L-06, and the same three rows both consumers declare. Stated once here now.
export const VIEWPORTS = [
  { width: 1600, height: 1000 },
  { width: 1280, height: 860 },
  { width: 1100, height: 800 },
];
export const vpName = vp => `${vp.width}x${vp.height}`;

// render/chipfit.test.mjs owns the rule this feeds and the tolerance with it. Stated here because
// the reading is taken here; the file that judges it re-states nothing and imports the rows.
export const STACK_TOL = 4;

// The other consumers' constants, in the file that applies them, imported by the files that judge
// them. Each was typed once in the test that owned the walk and is typed once here now.
export const HIT_TOL = 16;               // report/arrival: a ball is AT a target within this
const TERMINATED = OPACITY.terminated;  // render/opacity: the shade a terminated element holds
// How far past its own span a step is seeked before render/reduced's played snapshot. 400 has one
// job: put every delayed effect of the step behind the playhead, deferred handlers included. It
// costs nothing because the seek is instant, so the only way this number is wrong is by being too
// small. Local, because the seek that applies it is here and nobody else asks.
const SETTLE_PAST_SPAN_MS = 400;
const SELECTORS = {
  els: '.scheme-box, .scheme-pod, .scheme-cylinder, .scheme-node, .scheme-chip, .scheme-arrow',
  wires: '.scheme-label',
  transient: '#packetLayer',
};

// Runs IN THE PAGE, so no free variables. Lifted verbatim out of report/geometry-soft.test.mjs
// except for the panel half, which is described in the header above.
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

// geometry-soft's inline panel reading, kept under ITS guards: two edges, and null only when the
// overlay element is absent.
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
    // The readings are installed as page globals under a `__w` prefix and taken in ONE evaluate per
    // step. The prefix is not decoration: `installOpacityHelpers` already owns `window.__opacity`
    // (a namespace with `.own` and `.effective` on it) and a probe installed under that name
    // silently replaced it, so the first played step died on `window.__opacity.own is not a
    // function`. Everything this file puts on the page is `__w`-prefixed for that reason. Three
    // separate evaluates would be three CDP round trips, and a round trip is 3.3ms against a probe
    // that costs 8: at 750 steps by three viewports that is the difference between 11 seconds and
    // 34. `overlayProbe` is serialised from the SHARED function in fixtures/render.mjs rather than
    // copied, so the file that owns it stays the only place it is written.
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
      // Page errors are collected across the whole visit, because two consumers read them and both
      // are about a card that never came up: render/inline reports the module that would not parse
      // (an apostrophe in a narration ends the string and app.js logs "Failed to load scheme"), and
      // render/smoke reports anything the console said while both paths were driven.
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
      // Two face sets, because two consumers guard different ones: most files want both diagram
      // faces, render/chipfit wants only the mono one its chips are drawn in (its CHIP_FACES).
      // Cheap: fallbackFaces is 130ms a card and this is one extra probe on the same open page.
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
        // The full geometry is viewBox space and does not move with the viewport, so it is taken
        // once, on the row where it is judged. The panel is a pixel box and is taken on all three.
        const wantGeom = name === vpName(VIEWPORTS[0]);
        for (let i = 0; i < total; i++) {
          await gotoStep(page, i);
          const take = () => page.evaluate(({ g, stackTol, sel, selectors, tol }) => ({
            geom: g ? window.__wFull() : null,
            lanes: g ? window.__wGeometry() : null,
            chips: g ? window.__wChips({ stackTol }) : null,
            inline: g ? window.__wInline({ sel }) : null,
            // render/reduced's other half: the same step applied STATICALLY, the way prev and reset
            // replay it, against the played frame the pass below takes.
            snap: g ? window.__wSnap(selectors) : null,
            // report/arrival's SECOND reading of a step: the static path, where gotoStep replays
            // with ctx.reduced so every deferred branch has already run. Its settled end state.
            arrival: g ? window.__wArrival({ tol }) : null,
            panel: window.__wPanel(),
            panelSoft: window.__wSoftPanel(),
          }), { g: wantGeom, stackTol: STACK_TOL, sel: DIAGRAM, selectors: SELECTORS, tol: HIT_TOL });
          let row = await take();
          // ONE RETRY when the diagram is momentarily absent, carried over from
          // report/geometry-soft.test.mjs and load-bearing there. `Scene.build()` empties the host
          // and appends a NEW `<svg.diagram>`, so a step change has an instant with no diagram in
          // the dialog and a probe landing in it reads null. Measured in that file: without the
          // retry the walk came back one step short of the mandatory file doing the same walk, and
          // in a report that never fails it went unnoticed. Every consumer of this snapshot inherits
          // the guarantee, so it is taken here once instead of by each of them.
          // Both consumers carried a retry and they guarded different halves: geometry-soft's fired
          // on a null GEOMETRY, overlay's on a null PANEL. The union fires on either, so neither
          // loses its guarantee, and the `catch` is overlay's: a selector that times out leaves the
          // row null and the consumer says so in its notes, rather than taking the whole walk down.
          if ((wantGeom && !row.geom) || !row.panel) {
            try {
              await page.waitForSelector(DIAGRAM, { timeout: SELECTOR_TIMEOUT_MS });
              row = await take();
            } catch (_) { /* leave the row as it came back; the consumer reports it */ }
          }
          rows.push(row);
        }
        byVp[name] = rows;
      }
      await page.setViewportSize(VIEWPORTS[0]);

      // -------------------------------------------------------------------------------------
      // THE PLAYED PASS, at VIEWPORTS[0], once for the six files that each used to take it.
      //
      // The ORDER below is the union of theirs and it is load-bearing, so it is written out:
      //   enterStep(i)                     the step's animations exist and are frozen at t=0
      //   motion / arrival at t=0          three files read the plan and the positions here
      //   captureDeferred                  render/reduced collects the onfinish callbacks and the
      //                                    pulse targets while the pulse animations still exist
      //   stepSpan                         render/duration's number, and the seek distance below
      //   seek(span + 1)      -> opacity   render/opacity reads one millisecond past the end
      //   seek(span + SETTLE) -> runDeferred, snap   render/reduced's played frame
      // Every reading before the first seek is a READ, so sharing one enterStep between them
      // changes nothing; the two seeks are monotonic, so the earlier read cannot see the later
      // position. `runDeferred` is the only mutation and it runs last, after everything that
      // would have been disturbed by it.
      // -------------------------------------------------------------------------------------
      const played = [];
      for (let i = 0; i < total; i++) {
        const live = await enterStep(page, i);
        const takeZero = () => page.evaluate(({ tol }) => ({
          motion: window.__wMotion(),
          arrival: window.__wArrival({ tol }),
        }), { tol: HIT_TOL });
        let atZero = await takeZero();
        // render/motion carried its own one-retry `sample()` for the same reason the static pass
        // has one: the scene is torn down and rebuilt on every reset, so a null is a race and not a
        // broken card. Union again, so neither consumer loses its guarantee.
        if (!atZero.motion || !atZero.arrival) {
          try {
            await page.waitForSelector(DIAGRAM, { timeout: SELECTOR_TIMEOUT_MS });
            atZero = await takeZero();
          } catch (_) { /* the consumer reports the null */ }
        }
        const pulsed = await page.evaluate(captureDeferred, SELECTORS);
        const span = await stepSpan(page);
        // The seek only happens on a live step, but the READING is taken either way: render/opacity
        // probes an unplayed step too, and a walk that returned null there would silently drop it
        // from that file's `sampled` census.
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

    // -----------------------------------------------------------------------------------------
    // THE REDUCED-MOTION PASS, in a SECOND CONTEXT, for render/palette and report/palette-steps.
    //
    // It cannot share the page above, and that is the one thing here that is not a cost decision:
    // `reducedMotion` is a CONTEXT option, not a per-page one, and both palette files set it for
    // the same stated reason, that a pulse mid-flight repaints the stroke and sampling one turns a
    // motion magnitude into a colour finding. So the two of them share a context with each other
    // and with nobody else. The played rows override it per step through enterStep's reduced:false,
    // which is the route those files already took.
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
        // Step 0 is the static poster and has no play path of its own, so its slot stays null.
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

    // A WALK THAT OPENED NOTHING IS A FAILED RUN, NOT AN EMPTY ONE. Written after a real incident:
    // the static server stopped answering mid-run, every `openCard` threw, and the walk wrote a
    // 18KB snapshot in which every card carried an `openError`. Nothing downstream failed on it.
    // report/palette-steps printed "cards sampled 0 of 123" and passed, because it never fails, and
    // the mandatory files would have compared empty lists to empty lists. This is the same rule
    // fixtures/catalog.mjs states about readdir and every walker states with census(): a green run
    // over an empty set is worse than a red one.
    const opened = Object.values(cards).filter(c => !c.openError).length;
    if (!opened) {
      throw new Error(
        `the walk opened NONE of the ${ids.length} cards it found on the grid. Every card threw on ` +
        `openCard, which is a run failure and not a catalog finding: check that the server at ` +
        `${base} is still answering. First error: ${Object.values(cards)[0].openError}`);
    }
    // AND A PARTIAL FAILURE IS ALSO A RUN FAILURE, for the same reason one line up and against the
    // same temptation. A warning here was the first version of this and it was wrong: nothing reads
    // stderr, and what the twelve consumers WOULD do with a snapshot missing 23 cards is report 23
    // broken cards each, in twelve different vocabularies, none of which says "the server dropped
    // requests". That reads as a catalog full of defects, which is the most expensive possible way
    // to be told the harness had a bad afternoon. A card that genuinely cannot open is a red gate
    // either way, so nothing that used to be catchable stops being caught: what changes is that it
    // is reported ONCE, here, as itself.
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

// Written only when this file is the entry point, so a test can import `walk` without a side effect.
if (process.argv[1] && process.argv[1].endsWith('walk.mjs')) {
  const t0 = Date.now();
  const snap = await walk();
  mkdirSync(dirname(SNAPSHOT), { recursive: true });
  writeFileSync(SNAPSHOT, JSON.stringify(snap, encode));
  const steps = Object.values(snap.cards).reduce((n, c) => n + c.steps, 0);
  console.log(`walk: ${snap.ids.length} cards, ${steps} steps, ${snap.viewports.length} viewports ` +
              `-> ${SNAPSHOT} in ${((Date.now() - t0) / 1000).toFixed(1)}s`);
}
