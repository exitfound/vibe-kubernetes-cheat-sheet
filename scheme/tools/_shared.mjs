// _shared.mjs — common Playwright plumbing for the scheme dev tools (smoke-all,
// anim-dump, frame-strip). Launch, controller-probing, and the deterministic-seek
// trio live here so the tools cannot drift apart again: the deleted
// frame-strip-patched.mjs was exactly that drift, a private fork of getStepCount
// that diverged from the original.
import { chromium } from 'playwright';

// Default dev server: Docker nginx on :8080. Override with BASE=... in the env.
export const DEFAULT_BASE = (process.env.BASE || 'http://localhost:8080').replace(/\/$/, '');

// Let Playwright resolve its own bundled Chromium. Set PLAYWRIGHT_CHROMIUM only to
// point at a system browser; never hardcode a versioned cache path (~/.cache/
// ms-playwright/chromium-<build>/...) — it breaks on the next Playwright bump and
// on any machine that is not this one.
export function launch(opts = {}) {
  const exe = process.env.PLAYWRIGHT_CHROMIUM;
  return chromium.launch({ headless: true, ...(exe ? { executablePath: exe } : {}), ...opts });
}

// Init script (page.addInitScript(setInspect, 'expose')) that exposes
// window.__schemeCtl. Pass 'grid' instead to also draw the inspector overlay.
export function setInspect(mode) {
  try { localStorage.setItem('scheme:inspect', mode); } catch (_) {}
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

// Run exactly ONE step's play-path with animations but no auto-advance: steps
// 0..idx-1 are applied statically (gotoStep), then step idx's enter() runs with
// reduced:false via the timeline. Returns true if the real play-path ran, false if
// the controller lacks the debug handle (then it falls back to a static frame — no
// motion). Pair with seekStep() to freeze the result at a chosen logical time.
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

// Logical length of the current step in ms: the latest end (delay + active +
// endDelay) across the diagram's finite animations. Infinite loops (flowDash) count
// only one iteration. 0 when the step has no animations (e.g. the poster).
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

// Freeze every diagram animation at absolute logical time t (ms). Idempotent and
// race-free: currentTime is set absolutely, so real time elapsed since enterStep is
// irrelevant. Returns how many animations were pinned.
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
