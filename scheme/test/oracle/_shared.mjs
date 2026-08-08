// _shared.mjs: Playwright plumbing shared by every tool (launch, id discovery, step count, and the
// deterministic-seek trio) so they cannot drift apart into private forks again.
import { chromium } from 'playwright';

// Default dev server: Docker nginx on :8080. Override with BASE=... in the env.
export const DEFAULT_BASE = (process.env.BASE || 'http://localhost:8080').replace(/\/$/, '');

// Playwright resolves its own Chromium. PLAYWRIGHT_CHROMIUM only to point at a system browser:
// never hardcode a versioned cache path, it dies on the next bump and on any other machine.
export function launch(opts = {}) {
  const exe = process.env.PLAYWRIGHT_CHROMIUM;
  return chromium.launch({ headless: true, ...(exe ? { executablePath: exe } : {}), ...opts });
}

// Init script (page.addInitScript(setInspect, 'expose')) that exposes
// window.__schemeCtl. Pass 'grid' instead to also draw the inspector overlay.
export function setInspect(mode) {
  try { localStorage.setItem('scheme:inspect', mode); } catch (_) {}
}

// Every scheme id, in catalog order, off the rendered grid. The one source of truth for "the whole
// catalog": a private list misses new cards and keeps running retired ones. Navigates the page.
export async function discoverIds(page, base = DEFAULT_BASE) {
  await page.goto(`${base}/scheme/`, { waitUntil: 'networkidle' });
  return page.$$eval('article.card', els =>
    els.map(e => e.dataset.id || e.getAttribute('data-id')).filter(Boolean));
}

// True STEPS length: the controller's `total` (covers the posterFirst last step
// that the dialog-dot count drops). Falls back to dots if the controller is hidden.
export function stepCount(page) {
  return page.evaluate(() => {
    const c = window.__schemeCtl;
    if (c && Number.isFinite(c.total)) return c.total;
    return document.querySelectorAll('dialog.scheme-dialog .dialog-step-dots > *').length;
  });
}

const DIAGRAM = 'dialog.scheme-dialog svg.diagram';

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
