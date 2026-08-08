// render.mjs: the Playwright plumbing every render test shares, so they cannot drift apart into
// private forks again (launch, id discovery, opening a card, the deterministic-seek trio, and the
// two opacity readings). Carried over from tools/_shared.mjs with three deliberate changes, each
// marked below with the divergence it closes.

import { chromium } from 'playwright';

// ---------------------------------------------------------------------------------------------
// DIVERGENCE 1: the default base is :8888, the LIVE tree, not :8080.
//
// :8080 is the Docker container, and the Dockerfile is a blanket `COPY . .` with no mounts, so it
// serves a SNAPSHOT. Pointing the old harness at it meant every render check silently read the
// files as they were at the last image build and passed on stale content. That was the single most
// expensive trap in the harness, so the default now points at
//   python3 -m http.server 8888   (from the repo root)
// which serves the working tree. BASE= still overrides, for checking a built container on purpose.
// ---------------------------------------------------------------------------------------------
export const DEFAULT_BASE = (process.env.BASE || 'http://localhost:8888').replace(/\/$/, '');

// ---------------------------------------------------------------------------------------------
// DIVERGENCE 2: one selector timeout and one settle pause for the whole suite.
//
// The old checks waited on the SAME element with three different numbers (8000 in smoke-all and
// anim-dump, 10000 in reduced/geometry/palette/arrival, 15000 in duration/opacity/chipfit) and
// paused between steps with four (20, 30, 50, 60). Nothing chose those, they accumulated. Both
// constants below take the most conservative value that was already in use: a flake costs a whole
// re-run, and nothing is gained by giving up 7 seconds earlier or sampling 30 ms sooner.
// ---------------------------------------------------------------------------------------------

// 15000: the longest waitForSelector in the old set (check-duration:21, check-opacity:124,
// check-chipfit:46). Generous on purpose, a browser sharing a machine with another Playwright run
// starts slowly.
export const SELECTOR_TIMEOUT_MS = 15000;

// 50: the longest step-walk pause in the old set (check-reduced:147,152 and check-geometry:193).
// The two-snapshot comparisons were tuned against it, so shortening it is a silent risk, not a
// speed-up.
export const STEP_SETTLE_MS = 50;

export const DIAGRAM = 'dialog.scheme-dialog svg.diagram';

// Playwright resolves its own Chromium. PLAYWRIGHT_CHROMIUM only to point at a system browser:
// never hardcode a versioned cache path, it dies on the next bump and on any other machine.
export function launch(opts = {}) {
  const exe = process.env.PLAYWRIGHT_CHROMIUM;
  return chromium.launch({ headless: true, ...(exe ? { executablePath: exe } : {}), ...opts });
}

// Init script (page.addInitScript(setInspect, 'expose')) that exposes window.__schemeCtl.
// Pass 'grid' instead to also draw the inspector overlay.
export function setInspect(mode) {
  try { localStorage.setItem('scheme:inspect', mode); } catch (_) {}
}

// Every scheme id, in catalog order, off the rendered grid. Deliberately the BROWSER's answer and
// not data.js: comparing the two with census() is what catches a grid that renders a subset.
// Navigates the page.
export async function discoverIds(page, base = DEFAULT_BASE) {
  await page.goto(`${base}/scheme/`, { waitUntil: 'networkidle' });
  return page.$$eval('article.card', els =>
    els.map(e => e.dataset.id || e.getAttribute('data-id')).filter(Boolean));
}

// Open one card's dialog and wait for its diagram to exist. Every render test starts here.
export async function openCard(page, id, base = DEFAULT_BASE) {
  await page.goto(`${base}/scheme/#scheme=${id}`, { waitUntil: 'networkidle' });
  await page.waitForSelector(DIAGRAM, { timeout: SELECTOR_TIMEOUT_MS });
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
// This is the ONLY way to read a step's text in wave 1. A card exports just `init`, so the step
// list is sealed inside makeInit's closure (see fixtures/module.mjs). The path is not new, it is
// how check-duration read durations. Returns null when the debug handle is absent, and a caller
// that treats null as "no findings" has written a check that cannot fail.
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

// The Cloudflare RUM analytics beacon fails CORS on localhost. Pre-existing, unrelated to the JS
// under test, and the same filter the old smoke used.
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
// The old checks each had a private one and they disagreed: check-reduced.mjs:33-42 multiplied
// down the ancestor chain, check-opacity.mjs:101-109 took the minimum of the inline styles on it.
// That is not a dispute about the right answer, it is two different questions, and naming them
// apart is the fix. Both round to 2 decimals, as both originals did, so a float artefact of a
// fill-forwards landing is not a finding.
//
// BOTH RUN IN THE PAGE. They are written with no free variables so installOpacityHelpers() can
// serialise them with Function.prototype.toString(). Do not close over anything from this module,
// and do not call a helper from inside them, or the injected copy breaks silently.
// ---------------------------------------------------------------------------------------------

// The PRODUCT down the ancestor chain, exclusive of `root` (defaults to the enclosing <svg>).
// This is what SVG and CSS actually composite and what a reader sees: a <g> at 0.5 holding a rect
// at 0.5 renders at 0.25. It is the number a group wrapper controls, and the one that answers
// "is this element visible on screen".
// Used by: check-reduced's OPACITY-INHERITED axis (the `opEff` field).
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
// Used by: check-reduced's OPACITY-OWN (:159-161), the only ENFORCED rule that check had.
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
export function keyedElements(root, sel, exclude) {
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
// THE FONT GUARD (L-21). Shared because four files need it and three of them had it wrong.
//
// The two faces the diagrams draw with, at the sizes L-20 records (css/diagrams.css:5,37):
// .scheme-chip-text and .scheme-label code are 11px JetBrains Mono, box labels and the narration
// panel are 12px Space Grotesk. load() takes a CSS font shorthand and the size in it is not
// decoration, a face is loaded per size. Each face also carries the GENERIC the CSS actually falls
// back to, which the probe below cannot work without.
// ---------------------------------------------------------------------------------------------
export const FACE_MONO = { spec: '11px "JetBrains Mono"', family: 'JetBrains Mono', generic: 'monospace' };
export const FACE_SANS = { spec: '12px "Space Grotesk"', family: 'Space Grotesk', generic: 'sans-serif' };
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
