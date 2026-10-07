// Playwright plumbing shared by tools/walk.mjs and the card skills: launch, id discovery, opening a
// card, deterministic seek, opacity readings, element identity, root-space bboxes, panel extent.
// Helpers that run in the page (effectiveOpacity, ownOpacity, elementKey, keyedElements, rootBBox, overlayProbe) must have no free variables.

import { chromium } from 'playwright';
import { ONLY, SUBSET } from './catalog.mjs';

// Default to :8888, the live tree: the :8080 container serves a snapshot from its last build.
export const DEFAULT_BASE = (process.env.BASE || 'http://localhost:8888').replace(/\/$/, '');

// One selector timeout for every walk, generous because a shared machine starts browsers slowly.
export const SELECTOR_TIMEOUT_MS = 15000;

// No settle pause after a step: every step call is one synchronous page.evaluate, and the probe's
// getBBox / getComputedStyle force layout at read time.

export const DIAGRAM = 'dialog.scheme-dialog svg.diagram';

// Never hardcode a versioned Chromium cache path. PLAYWRIGHT_CHROMIUM points at a system browser.
export function launch(opts = {}) {
  const exe = process.env.PLAYWRIGHT_CHROMIUM;
  return chromium.launch({ headless: true, ...(exe ? { executablePath: exe } : {}), ...opts });
}

// Init script for every walk: exposes window.__schemeCtl ('grid' also draws the inspector) and
// freezes CSS transitions so static reads are final by construction. WAAPI is untouched.
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

// Scheme ids off the rendered grid, not data.js, so census() can catch a grid rendering a subset.
// SCHEME_IDS narrows it here, announced once per process so a filtered run is not read as full.
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
  // An empty walk passes everything vacuously, so a SCHEME_IDS typo is a hard error.
  if (!ids.length) {
    throw new Error(`SCHEME_IDS matched no card: ${ONLY.join(', ')}. The grid renders ${all.length}.`);
  }
  return ids;
}

// Not networkidle: domcontentloaded plus the selector, with the webfont awaited explicitly,
// since a diagram measured in the fallback face reports the wrong width.
export async function openCard(page, id, base = DEFAULT_BASE) {
  await page.goto(`${base}/scheme/#scheme=${id}`, { waitUntil: 'domcontentloaded' });
  await page.waitForSelector(DIAGRAM, { timeout: SELECTOR_TIMEOUT_MS });
  await page.evaluate(() => document.fonts.ready.then(() => true));
}

// Zero means the scene never built.
export function builtChildren(page) {
  return page.$eval(DIAGRAM, s => s.childElementCount);
}

// The controller's `total` covers the posterFirst last step the dot count drops.
export function stepCount(page) {
  return page.evaluate(() => {
    const c = window.__schemeCtl;
    if (c && Number.isFinite(c.total)) return c.total;
    return document.querySelectorAll('dialog.scheme-dialog .dialog-step-dots > *').length;
  });
}

// Step id, duration and narration off the debug handle, the only way in past makeInit's closure.
// Null when the handle is absent: a caller treating null as "no findings" cannot fail.
export function stepMeta(page) {
  return page.evaluate(() => {
    const tl = window.__schemeCtl && window.__schemeCtl._timeline;
    if (!tl || !tl.steps) return null;
    return tl.steps.map(s => ({ id: s.id || '', duration: s.duration || 0, narration: s.narration || '' }));
  });
}

// Play-path with animations but no auto-advance. False without the debug handle (static fallback).
export function enterStep(page, idx) {
  return page.evaluate(({ i, sel }) => {
    const c = window.__schemeCtl;
    if (!c) return false;
    const tl = c._timeline;
    if (i <= 0) { c.gotoStep(0); return true; }
    if (tl && typeof tl._enterStep === 'function') {
      c.gotoStep(i - 1);
      tl._enterStep(i, { withTimer: false, reduced: false });
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

// Static apply, as prev and reset do: nothing below `if (ctx.reduced) return` runs.
export function gotoStep(page, idx) {
  return page.evaluate(n => { const c = window.__schemeCtl; if (c) c.gotoStep(n); }, idx);
}

// Latest delay + active + endDelay in ms. An infinite animation counts one iteration.
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

// Race-free: currentTime is absolute, so real time elapsed since enterStep does not matter.
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

// The analytics beacon fails on localhost. Both the text and the location are read, and no bare
// net:: code is matched, because a card module failing to load prints the same line.
const IGNORED_NOISE = /cloudflareinsights|cdn-cgi\/rum/;
const isNoise = m => IGNORED_NOISE.test(m.text()) || IGNORED_NOISE.test(m.location()?.url || '');

// Attach before navigating: a throw during card module load happens before the diagram exists.
export function collectPageErrors(page) {
  const errors = [];
  const onConsole = m => {
    if (m.type() === 'error' && !isNoise(m)) errors.push(`console: ${m.text()}`);
  };
  const onPageErr = e => errors.push(`pageerror: ${e.message}`);
  page.on('console', onConsole);
  page.on('pageerror', onPageErr);
  return {
    errors,
    stop() { page.off('console', onConsole); page.off('pageerror', onPageErr); },
  };
}

// Two opacity readings under two names, both rounded to 2 decimals. They run in the page:
// no free variables and no calls to other helpers, or the serialised copy breaks silently.

// Product down the ancestor chain, exclusive of `root`: what actually composites on screen.
export function effectiveOpacity(el, root) {
  const stop = root || el.closest('svg');
  let o = 1;
  for (let n = el; n && n !== stop; n = n.parentElement) {
    const v = parseFloat(getComputedStyle(n).opacity);
    if (Number.isFinite(v)) o *= v;
  }
  return Math.round(o * 100) / 100;
}

// The element's own declared opacity, ancestors ignored: what the code left behind.
export function ownOpacity(el) {
  const v = parseFloat(getComputedStyle(el).opacity);
  return Number.isFinite(v) ? Math.round(v * 100) / 100 : 1;
}

// Install before the first navigation: an init script only runs on documents still to be created.
export function installOpacityHelpers(page) {
  return page.addInitScript(
    `window.__opacity = { effective: ${effectiveOpacity.toString()}, own: ${ownOpacity.toString()} };`);
}

// A key for one scene element that survives re-ordering: tag, classes minus highlight, data-role /
// data-idx, the id chain from the root, own geometry. Never slot index, style, opacity, text or
// anything a child carries. Runs in the page, no free variables.
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

// Every element matching `sel` with its key, minus `exclude`. Indistinguishable elements get #2, #3
// ordinals and a flag. Runs in the page and calls window.__key, not elementKey.
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

// Install before the first navigation, or the helpers are undefined on the open page.
export function installKeyHelpers(page) {
  return page.addInitScript(
    `window.__key = ${elementKey.toString()};\nwindow.__keyed = ${keyedElements.toString()};`);
}

// One element's bbox in the diagram's own coordinates, mapped through the element-to-root matrix.
// Returns {x, y, w, h}. `box` is optional. Runs in the page, no free variables.
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

// Install before the first navigation, or every probe that calls it throws.
export function installGeometryHelpers(page) {
  return page.addInitScript(`window.__toRoot = ${rootBBox.toString()};`);
}

// The narration panel's four edges in viewBox units (xMidYMid meet: one scale, letterboxed).
// Null mid-rebuild instead of a NaN. Runs in the page, closes over nothing.
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

// The font guard (L-21): the two faces at the sizes the diagrams draw with, each with the generic
// the CSS falls back to.
export const FACE_MONO = { spec: '11px "JetBrains Mono"', family: 'JetBrains Mono', generic: 'monospace' };
const FACE_SANS = { spec: '12px "Space Grotesk"', family: 'Space Grotesk', generic: 'sans-serif' };
export const DIAGRAM_FACES = [FACE_MONO, FACE_SANS];

// Returns the faces that are NOT painting, empty when the real ones are. Call after every navigation.
// Behavioural on purpose: document.fonts.check() says true for a family with no @font-face at all,
// so width is compared against a nonexistent family on the same generic. Runs in the page.
export function fallbackFaces(page, faces = DIAGRAM_FACES) {
  return page.evaluate(async (fs) => {
    for (const f of fs) { try { await document.fonts.load(f.spec); } catch (_) {} }
    await document.fonts.ready;

    const widthIn = (stack) => {
      const s = document.createElement('span');
      // Mixed advance widths at 64px so two faces cannot coincide and sub-pixel noise does not matter.
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
