// render.mjs: the Playwright plumbing every render test shares, so they cannot drift apart into
// private forks again (launch, id discovery, opening a card, the deterministic-seek trio, the two
// opacity readings, element identity, the root-space bbox mapping and the narration-panel extent).
// Carried over from tools/_shared.mjs with three deliberate changes, each marked below with the
// divergence it closes.
//
// Six of the helpers below RUN IN THE PAGE and are therefore written with no free variables:
// effectiveOpacity, ownOpacity, elementKey, keyedElements, rootBBox and overlayProbe. The first
// five reach the page through an install* function that serialises them into an init script; the
// last is passed to page.evaluate() directly, which serialises it the same way.

import { chromium } from 'playwright';
import { ONLY, SUBSET } from './catalog.mjs';

// ---------------------------------------------------------------------------------------------
// DIVERGENCE 1: the default base is :8888, the LIVE tree, not :8080.
//
// :8080 is the Docker container, and the Dockerfile is a blanket `COPY . .` with no mounts, so it
// serves a SNAPSHOT: a run pointed at it silently reads the files as they were at the last image
// build and passes on stale content. That is the single most expensive trap in this harness, so the
// default points at
//   python3 -m http.server 8888   (from the repo root)
// which serves the working tree. BASE= still overrides, for checking a built container on purpose.
// ---------------------------------------------------------------------------------------------
export const DEFAULT_BASE = (process.env.BASE || 'http://localhost:8888').replace(/\/$/, '');

// ---------------------------------------------------------------------------------------------
// DIVERGENCE 2: one selector timeout for the whole suite, and NO settle pause anywhere.
//
// ONE NUMBER, for every walk in render/ and report/. Per-walk timings are never chosen, they
// accumulate: left alone they become three different timeouts on the SAME element, and nobody can
// say which one is the rule. It takes the most conservative value any walk needs, because a flake
// costs a whole re-run and nothing is gained by giving a slow browser 7 seconds less.
// ---------------------------------------------------------------------------------------------

// 15000: covers the slowest waitForSelector in the suite, the duration, opacity and chip-fit
// walks. Generous on purpose, a browser sharing a machine with another Playwright run starts
// slowly.
export const SELECTOR_TIMEOUT_MS = 15000;

// ===========================================================================================
// WHY THERE IS NO SETTLE BETWEEN A STEP AND THE READ THAT FOLLOWS IT
// ===========================================================================================
// Every walk used to sleep `STEP_SETTLE_MS` (50) after setting a step. It bought nothing, and this
// is the argument rather than the measurement: the data path is SYNCHRONOUS through CDP. `gotoStep`,
// `enterStep` and `seekStep` are each one `page.evaluate` that returns only after its DOM writes,
// and the probe that follows reads through `getBBox` / `getComputedStyle`, which force style and
// layout at the moment of the read. There is no frame in that chain to wait for.
//
// The only thing 50ms could have covered is the CSS transition on seven rect classes in
// `css/diagrams.css`, fill / stroke / filter / opacity over 300ms. It did not cover that either, and
// the reason is worth writing down because it is not the obvious one: MEASURED over 6 cards and 40
// steps with no freeze at all, the computed opacity, stroke and fill are already final the instant
// `gotoStep` returns, and reading again at 50ms and at 450ms gives the same bytes. Headless Chromium
// produces no frames for a page nobody is looking at, so its animation timeline does not advance and
// the transition never runs. It is the same fact that made a `requestAnimationFrame` settle 2.5x
// SLOWER than the sleep it replaced: that experiment cost the gate 158s -> 394s and was reverted.
//
// So the freeze `initPage` installs is not a repair of an interpolated read: it makes deterministic
// BY CONSTRUCTION what is currently deterministic by an accident of headless frame scheduling. It
// costs nothing, and it is what keeps these numbers true the day a walk runs headful, with a GPU, or
// on whatever a future Playwright does with frame production.
//
// Measured over the whole gate: 155s to 87s, and with the report tier and the doc edits that landed
// with it, 72s, with the diagnostics, censuses and findings of all 1026 tests byte for byte what they
// were. Verified over five full runs plus one under 3x CPU oversubscription, all identical.

export const DIAGRAM = 'dialog.scheme-dialog svg.diagram';

// Playwright resolves its own Chromium. PLAYWRIGHT_CHROMIUM only to point at a system browser:
// never hardcode a versioned cache path, it dies on the next bump and on any other machine.
export function launch(opts = {}) {
  const exe = process.env.PLAYWRIGHT_CHROMIUM;
  return chromium.launch({ headless: true, ...(exe ? { executablePath: exe } : {}), ...opts });
}

// The init script EVERY browser walk installs: `page.addInitScript(initPage, 'expose')`. Two jobs,
// and they are together on purpose, because the second one must not be forgettable.
//
//   1. Expose `window.__schemeCtl`, the debug handle the step walks drive. Pass 'grid' instead of
//      'expose' to also draw the inspector overlay.
//   2. Freeze CSS transitions. `css/diagrams.css` transitions fill, stroke, filter and opacity over
//      300ms on the seven rect classes. Headless Chromium does not advance them today (see above),
//      so this changes no reading in this environment and is measured to change none: it is what
//      makes every static read final BY CONSTRUCTION rather than by that accident. A walk that
//      forgot to ask for it would not fail, it would read a plausible number, which is the worst way
//      to be wrong, and a separate init script per file is exactly the thing a new render file would
//      leave out. So it lives here, with the handle nobody forgets.
//
// It does NOT touch WAAPI: `element.animate` is what the cards run and what render/motion,
// render/opacity and render/reduced measure. Only the CSS transition layer is frozen.
export function initPage(mode) {
  try { localStorage.setItem('scheme:inspect', mode); } catch (_) {}
  const freeze = () => {
    const st = document.createElement('style');
    st.textContent = '*, *::before, *::after { transition: none !important; }';
    (document.head || document.documentElement).appendChild(st);
  };
  if (document.head) freeze();
  else addEventListener('DOMContentLoaded', freeze, { once: true });
}

// Every scheme id, in catalog order, off the rendered grid. Deliberately the BROWSER's answer and
// not data.js: comparing the two with census() is what catches a grid that renders a subset.
// Navigates the page.
//
// SCHEME_IDS narrows the answer here, in ONE place, because all nine render files walk the ids this
// returns. The announcement is printed once per process so a filtered run cannot be read as a full
// one. What keeps it honest is in fixtures/catalog.mjs beside `floor()`.
let announced = false;
export async function discoverIds(page, base = DEFAULT_BASE) {
  await page.goto(`${base}/scheme/`, { waitUntil: 'domcontentloaded' });
  await page.waitForSelector('article.card', { timeout: SELECTOR_TIMEOUT_MS });
  const all = await page.$$eval('article.card', els =>
    els.map(e => e.dataset.id || e.getAttribute('data-id')).filter(Boolean));
  if (!SUBSET) return all;
  const ids = all.filter(i => ONLY.includes(i));
  if (!announced) {
    announced = true;
    const missing = ONLY.filter(i => !all.includes(i));
    console.log(`# SUBSET: SCHEME_IDS restricted this walk to ${ids.length} of ${all.length} card(s): ${ids.join(', ')}`);
    console.log('#   Floors and censuses are OFF. This is not the gate: run it unfiltered before a commit.');
    if (missing.length) console.log(`#   SCHEME_IDS named ${missing.length} id(s) the grid does not render: ${missing.join(', ')}`);
  }
  // A typo must not read green. An empty walk passes every assertion in the suite vacuously, which
  // is the one failure mode a filter like this can introduce, so it is a hard error instead.
  if (!ids.length) {
    throw new Error(`SCHEME_IDS matched no card: ${ONLY.join(', ')}. The grid renders ${all.length}.`);
  }
  return ids;
}

// Open one card's dialog and wait for its diagram to exist. Every render test starts here.
//
// NOT `networkidle`: measured, it costs 157ms per card against 67ms for domcontentloaded plus the
// selector, and the suite opens a card 972 times. What the idle wait was really buying is the
// WEBFONT, and a diagram measured in the fallback face reports the wrong width, so that is waited
// for explicitly instead of hoped for. `fallbackFaces()` remains the check that it worked.
export async function openCard(page, id, base = DEFAULT_BASE) {
  await page.goto(`${base}/scheme/#scheme=${id}`, { waitUntil: 'domcontentloaded' });
  await page.waitForSelector(DIAGRAM, { timeout: SELECTOR_TIMEOUT_MS });
  await page.evaluate(() => document.fonts.ready.then(() => true));
}

// Child element count of the diagram. Zero means the scene never built, which is the cheapest
// proof a card is broken and says nothing about whether the picture is right.
export function builtChildren(page) {
  return page.$eval(DIAGRAM, s => s.childElementCount);
}

// True STEPS length: the controller's `total` (covers the posterFirst last step that the dialog-dot
// count drops). Falls back to dots if the controller is hidden.
export function stepCount(page) {
  return page.evaluate(() => {
    const c = window.__schemeCtl;
    if (c && Number.isFinite(c.total)) return c.total;
    return document.querySelectorAll('dialog.scheme-dialog .dialog-step-dots > *').length;
  });
}

// Per-step metadata off the live controller: id, duration and narration.
//
// This is the ONLY way to read a step's text. A card exports just `init`, so the step list is
// sealed inside makeInit's closure (see fixtures/module.mjs), and the debug handle the controller
// hangs on window is the one way in: render/duration.test.mjs reads durations by it, and
// render/inline.test.mjs and render/reduced.test.mjs read the same list. Returns null when the
// debug handle is absent, and a caller that treats null as "no findings" has written a check that
// cannot fail.
export function stepMeta(page) {
  return page.evaluate(() => {
    const tl = window.__schemeCtl && window.__schemeCtl._timeline;
    if (!tl || !tl.steps) return null;
    return tl.steps.map(s => ({ id: s.id || '', duration: s.duration || 0, narration: s.narration || '' }));
  });
}

// Run ONE step's play-path with animations but no auto-advance. Returns false if the controller
// lacks the debug handle, in which case it falls back to a static frame. Pair with seekStep().
export function enterStep(page, idx) {
  return page.evaluate(({ i, sel }) => {
    const c = window.__schemeCtl;
    if (!c) return false;
    const tl = c._timeline;
    if (i <= 0) { c.gotoStep(0); return true; }
    if (tl && typeof tl._enterStep === 'function') {
      c.gotoStep(i - 1);
      tl._enterStep(i, { withTimer: false, reduced: false });
      // Freeze immediately so nothing advances before the first seek.
      const svg = document.querySelector(sel);
      if (svg) for (const a of document.getAnimations()) {
        const t = a.effect && a.effect.target;
        if (t && svg.contains(t)) { try { a.pause(); } catch (_) {} }
      }
      return true;
    }
    c.gotoStep(i);            // no debug handle: static reduced state only
    return false;
  }, { i: idx, sel: DIAGRAM });
}

// Apply a step statically, the way prev and reset replay it: every enter() runs with ctx.reduced,
// so nothing below `if (ctx.reduced) return;` executes.
export function gotoStep(page, idx) {
  return page.evaluate(n => { const c = window.__schemeCtl; if (c) c.gotoStep(n); }, idx);
}

// Logical length of the current step in ms: the latest delay + active + endDelay. An infinite
// animation counts one iteration, so a span can include something that never actually ends.
export function stepSpan(page) {
  return page.evaluate((sel) => {
    const svg = document.querySelector(sel);
    if (!svg) return 0;
    let max = 0;
    for (const a of document.getAnimations()) {
      const tgt = a.effect && a.effect.target;
      if (!tgt || !svg.contains(tgt)) continue;
      const t = a.effect.getComputedTiming();
      const active = Number.isFinite(t.activeDuration) ? t.activeDuration : (t.duration || 0);
      const end = (t.delay || 0) + active + (t.endDelay || 0);
      if (Number.isFinite(end) && end > max) max = end;
    }
    return Math.round(max);
  }, DIAGRAM);
}

// Freeze every diagram animation at absolute logical time t. Race-free because currentTime is
// absolute, so elapsed real time since enterStep does not matter.
export function seekStep(page, t) {
  return page.evaluate(({ tt, sel }) => {
    const svg = document.querySelector(sel);
    if (!svg) return 0;
    let n = 0;
    for (const a of document.getAnimations()) {
      const tgt = a.effect && a.effect.target;
      if (!tgt || !svg.contains(tgt)) continue;
      try { a.pause(); a.currentTime = tt; n++; } catch (_) {}
    }
    return n;
  }, { tt: t, sel: DIAGRAM });
}

// The Cloudflare RUM analytics beacon fails CORS on localhost. Pre-existing and unrelated to the JS
// under test.
const IGNORED_NOISE = /cloudflareinsights|cdn-cgi\/rum|ERR_FAILED/;

// Collect console errors and uncaught page exceptions until stop(). Attach BEFORE navigating: a
// throw during module load of the card is exactly the failure worth catching, and it happens
// before the diagram exists.
export function collectPageErrors(page) {
  const errors = [];
  const onConsole = m => {
    if (m.type() === 'error' && !IGNORED_NOISE.test(m.text())) errors.push(`console: ${m.text()}`);
  };
  const onPageErr = e => errors.push(`pageerror: ${e.message}`);
  page.on('console', onConsole);
  page.on('pageerror', onPageErr);
  return {
    errors,
    stop() { page.off('console', onConsole); page.off('pageerror', onPageErr); },
  };
}

// ---------------------------------------------------------------------------------------------
// DIVERGENCE 3: two opacity readings under two unambiguous names.
//
// A single helper called "opacity" invites two different answers: the PRODUCT down the ancestor
// chain, and the element's OWN declared value with ancestors ignored. A caller that gets the other
// one reads a number that is not wrong, it is the answer to a question it did not ask. That is not
// a dispute to settle, it is two questions, and naming them apart is the fix. Both round to 2
// decimals, so a float artefact of a fill-forwards landing is not a finding.
//
// BOTH RUN IN THE PAGE. They are written with no free variables so installOpacityHelpers() can
// serialise them with Function.prototype.toString(). Do not close over anything from this module,
// and do not call a helper from inside them, or the injected copy breaks silently.
// ---------------------------------------------------------------------------------------------

// The PRODUCT down the ancestor chain, exclusive of `root` (defaults to the enclosing <svg>).
// This is what SVG and CSS actually composite and what a reader sees: a <g> at 0.5 holding a rect
// at 0.5 renders at 0.25. It is the number a group wrapper controls, and the one that answers
// "is this element visible on screen".
// Used by: render/reduced.test.mjs, its OPACITY-INHERITED axis (the `eff` field of a snapshot),
// and render/opacity.test.mjs for the composited value under LIT.
export function effectiveOpacity(el, root) {
  const stop = root || el.closest('svg');
  let o = 1;
  for (let n = el; n && n !== stop; n = n.parentElement) {
    const v = parseFloat(getComputedStyle(n).opacity);
    if (Number.isFinite(v)) o *= v;
  }
  return Math.round(o * 100) / 100;
}

// The element's OWN declared opacity, ancestors ignored. This is the axis a card author sets
// directly on the element, and it answers "did this step leave the same value behind on both
// paths", which is a question about the code, not about the picture.
// Used by: render/reduced.test.mjs, its OPACITY-OWN axis (the `own` field of a snapshot), one of
// the four axes that file enforces.
export function ownOpacity(el) {
  const v = parseFloat(getComputedStyle(el).opacity);
  return Number.isFinite(v) ? Math.round(v * 100) / 100 : 1;
}

// Install both as window.__opacity.effective / .own, for use inside page.evaluate. Source-level
// injection, because a page.evaluate callback cannot reach a Node-side function.
// Call it BEFORE the first navigation: an init script only runs on a document that is still to be
// created, so installing it after openCard leaves window.__opacity undefined on the open page.
export function installOpacityHelpers(page) {
  return page.addInitScript(
    `window.__opacity = { effective: ${effectiveOpacity.toString()}, own: ${ownOpacity.toString()} };`);
}

// ---------------------------------------------------------------------------------------------
// ELEMENT IDENTITY. A key for one scene element that survives the scene being re-ordered.
//
// Any check that snapshots the same scene twice and diffs the two has to answer "which element in
// snapshot A is which element in snapshot B", and the cheap answer, the slot number, is wrong the
// moment append order changes. Plan 3.2 changes it on purpose: the SCENE part list becomes the
// append order, so creation order stops being append order and a migrated card lands its elements
// in a different sequence than the hand-written one did.
//
// WHAT GOES IN. Only what identifies the element and cannot be re-ordered:
//   tag, the class list minus `highlight`, data-role / data-idx, the chain of ids from the diagram
//   root down to the element itself, and the element's OWN geometry attributes.
// WHAT STAYS OUT, and why each one:
//   - the slot index, which is the whole point;
//   - `highlight`, `style` and computed opacity, because a test that keys on the state it measures
//     turns every state defect into a pair of unrelated elements instead of one finding;
//   - text, because it moves legitimately: valChip's second <text> is the value a step animates,
//     and setBoxLabel rewrites a box label mid-step;
//   - anything a child carries. cluster-node-allocatable:193 resizes a `.scheme-box-rect` INSIDE a
//     `.scheme-box`, so a key that reached into children would move with the picture.
//
// The id chain is what makes this work on the shape the catalog actually uses. Almost nothing in a
// diagram carries an id of its own (21 elements on cluster-node-drain, zero ids), and the Pod
// wrappers are bare `<g id="pod1">` with no class at all (cluster-node-drain.js:103), so the
// wrapper is not an element in its own right here: it is the thing that tells its shell and its
// inner box apart from the next Pod's.
//
// Runs IN THE PAGE. No free variables, so installKeyHelpers() can serialise it.
export function elementKey(el, root) {
  const stop = root || el.closest('svg');
  const ids = [];
  for (let n = el; n && n !== stop; n = n.parentElement) if (n.id) ids.unshift(n.id);
  const cls = (el.getAttribute('class') || '').trim().split(/\s+/)
    .filter(c => c && c !== 'highlight').sort().join('.');
  const pick = (names) => names.filter(a => el.hasAttribute(a))
    .map(a => `${a}=${el.getAttribute(a)}`).join(',');
  const data = pick(['data-role', 'data-idx']);
  const geom = pick(['transform', 'd', 'points', 'x', 'y', 'x1', 'y1', 'x2', 'y2',
    'cx', 'cy', 'r', 'rx', 'ry', 'width', 'height', 'text-anchor']);
  return `${el.tagName}.${cls}|${data}|${ids.join('/')}|${geom}`;
}

// Every element of `root` matching `sel`, each with its key, minus anything inside `exclude`.
//
// COLLISIONS. Two elements can be indistinguishable by every attribute above (same class, same
// transform, same wrapper), and then they are superimposed and interchangeable to a reader. They
// get a `#2`, `#3` ordinal in document order and are flagged, so a caller can report how often the
// key had to fall back on position. Sorting them out further would mean keying on the state under
// test, which is the thing this helper exists to avoid.
//
// Runs IN THE PAGE, and calls window.__key rather than closing over elementKey: a serialised
// function cannot reach a Node-side name.
function keyedElements(root, sel, exclude) {
  const seen = new Map();
  const out = [];
  for (const el of root.querySelectorAll(sel)) {
    if (exclude && el.closest(exclude)) continue;
    const base = window.__key(el, root);
    const n = (seen.get(base) || 0) + 1;
    seen.set(base, n);
    out.push({ el, key: n > 1 ? `${base}#${n}` : base, collision: n > 1 });
  }
  return out;
}

// Install both as window.__key and window.__keyed. Same rule as installOpacityHelpers: BEFORE the
// first navigation, or the helpers are undefined on the open page.
export function installKeyHelpers(page) {
  return page.addInitScript(
    `window.__key = ${elementKey.toString()};\nwindow.__keyed = ${keyedElements.toString()};`);
}

// ---------------------------------------------------------------------------------------------
// THE ROOT-SPACE MAPPING. One element's bounding box in the diagram's own coordinates.
//
// getBBox() answers in the element's OWN user space and every primitive is a translated group, so a
// bbox and a path only become comparable after both are mapped through the element-to-root matrix.
// Without it a check compares two coordinate systems and every number it prints is fiction.
//
// Shared because there are three callers. render/geometry.test.mjs and report/geometry-soft.test.mjs
// map blocks, report/arrival.test.mjs maps the blocks a route endpoint may land on. The first two
// carried the note "a local copy rather than a shared fixture on purpose ... if a third caller
// appears, that is the moment", the third arrived and said so, and this is that moment taken.
//
// The one change from the three copies: the root matrix is read per call rather than hoisted once
// per probe. The root <svg> does not move while a probe runs, so every number is identical, and a
// caller no longer has to keep a `rootCTM` in scope for a helper it did not write.
//
// `box` is optional: pass the bbox when the caller already has it (the geometry probes do), omit it
// and the element is asked for its own (arrival does). Returns {x, y, w, h}, never the DOM's
// {x, y, width, height}, because that is the shape all three callers already spoke.
//
// Runs IN THE PAGE. No free variables, so installGeometryHelpers() can serialise it.
export function rootBBox(el, root, box) {
  const svg = root || el.closest('svg');
  const b = box || el.getBBox();
  const m = svg.getScreenCTM().inverse().multiply(el.getScreenCTM());
  const pt = (x, y) => {
    const p = svg.createSVGPoint(); p.x = x; p.y = y;
    const q = p.matrixTransform(m);
    return [q.x, q.y];
  };
  const c = [pt(b.x, b.y), pt(b.x + b.width, b.y), pt(b.x, b.y + b.height), pt(b.x + b.width, b.y + b.height)];
  const xs = c.map(p => p[0]), ys = c.map(p => p[1]);
  return { x: Math.min(...xs), y: Math.min(...ys), w: Math.max(...xs) - Math.min(...xs), h: Math.max(...ys) - Math.min(...ys) };
}

// Install as window.__toRoot. Same rule as the two installers above: BEFORE the first navigation,
// or the helper is undefined on the open page and every probe that calls it throws.
export function installGeometryHelpers(page) {
  return page.addInitScript(`window.__toRoot = ${rootBBox.toString()};`);
}

// ---------------------------------------------------------------------------------------------
// THE NARRATION PANEL EXTENT, in viewBox units.
//
// The panel is HTML in CSS pixels and the diagram is an SVG with a viewBox, so the two live in
// different coordinate systems and the mapping is the whole measurement. preserveAspectRatio is
// xMidYMid meet: ONE uniform scale, letterboxed on whichever axis has slack, which is why the
// offset is computed from the centred box and not from the element's own top-left.
//
// ALL FOUR EDGES, because the two callers wanted different halves of one number and that is exactly
// how the copies came to exist. report/overlay.test.mjs reads all four, report/geometry-soft.test.mjs
// uses right and bottom only. A shared probe returning two of them would have been a third
// definition rather than a fix. The zero-size guard is the overlay copy's and it is kept: a diagram
// mid-rebuild has no box, and returning null lets a caller skip the sample instead of pooling a NaN.
//
// Runs IN THE PAGE: passed to page.evaluate() by value, so it closes over nothing.
export const overlayProbe = () => {
  const svg = document.querySelector('dialog.scheme-dialog svg.diagram');
  const ov = document.querySelector('.narration-overlay');
  if (!svg || !ov) return null;
  const sb = svg.getBoundingClientRect();
  const ob = ov.getBoundingClientRect();
  const vb = svg.viewBox.baseVal;
  if (!sb.width || !sb.height || !vb.width || !vb.height) return null;
  const scale = Math.min(sb.width / vb.width, sb.height / vb.height);
  const offX = sb.left + (sb.width - vb.width * scale) / 2;
  const offY = sb.top + (sb.height - vb.height * scale) / 2;
  return {
    right: (ob.right - offX) / scale + vb.x,
    bottom: (ob.bottom - offY) / scale + vb.y,
    left: (ob.left - offX) / scale + vb.x,
    top: (ob.top - offY) / scale + vb.y,
  };
};

// ---------------------------------------------------------------------------------------------
// THE FONT GUARD (L-21). Shared because four files need it and three of them had it wrong.
//
// The two faces the diagrams draw with, at the sizes L-20 records (css/diagrams.css:5,37):
// .scheme-chip-text and .scheme-label code are 11px JetBrains Mono, box labels and the narration
// panel are 12px Space Grotesk. load() takes a CSS font shorthand and the size in it is not
// decoration, a face is loaded per size. Each face also carries the GENERIC the CSS actually falls
// back to, which the probe below cannot work without.
// ---------------------------------------------------------------------------------------------
export const FACE_MONO = { spec: '11px "JetBrains Mono"', family: 'JetBrains Mono', generic: 'monospace' };
const FACE_SANS = { spec: '12px "Space Grotesk"', family: 'Space Grotesk', generic: 'sans-serif' };
export const DIAGRAM_FACES = [FACE_MONO, FACE_SANS];

// Wait for the real faces, then decide whether they are the ones PAINTING. Returns one description
// per face that is not, so an empty array means the measurement that follows is the real one.
// Call after every navigation: a fresh document has a fresh font set.
//
// DO NOT "SIMPLIFY" THIS BACK TO document.fonts.check(). That is what three of the four callers
// used, and the guard could not fire. Measured on scheme/cluster-architecture, once normally and
// once with fonts.googleapis.com and fonts.gstatic.com aborted, everything else identical:
//
//                                                    fonts reachable   both hosts blocked
//     document.fonts.check('11px "JetBrains Mono"')       true                true
//     document.fonts.check('12px "Space Grotesk"')        true                true
//     document.fonts.check('12px "Totally Nonexistent 12345"')  true          true
//     @font-face rules registered in the document          0                   0
//     document.fonts.size                                 36                   0
//     narration panel bottom, viewBox units              160.00              142.56
//
// check() answers the same on both sides of the only difference that matters, and it says yes to a
// family that cannot exist. The reason is in the spec, not in the browser: check() asks whether
// every font in the list is AVAILABLE, and a family with no @font-face rule anywhere is treated as
// a system-font lookup and reported available. scheme/index.html attaches the Google Fonts
// stylesheet from the onload handler of a <link rel="preload">, so with the hosts unreachable the
// sheet never attaches, there is no @font-face rule for either family, and check() has nothing to
// say no about. It only catches the narrower case where the sheet arrived and a font FILE did not.
// document.fonts.ready is no help either: it settles the moment nothing is PENDING, which is also
// true a beat before the sheet is linked.
//
// What that cost: a run measuring the fallback stayed green and reported the narration panel on
// cluster-architecture 24.85 viewBox units SHALLOWER than the truth (17.44 on the step above).
// Shallower is the FLATTERING direction, so every number the run printed was wrong the same way
// and nothing said so.
//
// So the honest test is behavioural: render a string in the wanted family with its real generic
// fallback, and again in a family name that cannot exist with the same generic. Equal widths mean
// the wanted family resolved to that same fallback, which is precisely "we are measuring the
// fallback". A machine with the face installed locally measures as loaded, which is right: the
// intended face IS what paints. A machine whose generic monospace IS JetBrains Mono reports a false
// fallback, which is the safe direction for a guard whose job is to admit doubt.
//
// Runs IN THE PAGE, so the inner function closes over nothing but its own argument.
export function fallbackFaces(page, faces = DIAGRAM_FACES) {
  return page.evaluate(async (fs) => {
    for (const f of fs) { try { await document.fonts.load(f.spec); } catch (_) {} }
    await document.fonts.ready;

    const widthIn = (stack) => {
      const s = document.createElement('span');
      // Mixed advance widths, so two different faces cannot coincide by accident. 64px because the
      // difference scales with size and sub-pixel noise does not.
      s.textContent = 'mmmmmiiiiillllWWWW0123456789';
      s.style.cssText = 'position:absolute;left:-9999px;top:-9999px;white-space:pre;font-size:64px;';
      s.style.fontFamily = stack;
      document.body.appendChild(s);
      const w = s.getBoundingClientRect().width;
      s.remove();
      return w;
    };

    const out = [];
    for (const f of fs) {
      const declared = document.fonts.check(f.spec);
      const wanted = widthIn(`"${f.family}", ${f.generic}`);
      const control = widthIn(`"no-such-family-b7f3a1", ${f.generic}`);
      const painting = Math.abs(wanted - control) > 0.5;
      if (!declared || !painting) {
        out.push(`${f.family} (fonts.check ${declared ? 'says loaded' : 'says missing'}, ` +
          `${painting ? 'paints its own face' : `paints the ${f.generic} fallback`})`);
      }
    }
    return out;
  }, faces);
}
