// The page-side readings tools/walk.mjs takes. Every function runs in the page, so no free variables
// and arguments arrive as one object.

// Blocks and lanes for the geometry rules. Needs window.__toRoot (installGeometryHelpers).
export const geometryProbe = () => {
  const svg = document.querySelector('dialog.scheme-dialog svg.diagram');
  if (!svg) return null;

  // getBBox() is in the element's own user space, so every bbox is mapped to root.
  const toRoot = (el, b) => window.__toRoot(el, svg, b);

  // Lanes map path points, not a bbox, so they use the matrix directly.
  const rootCTM = svg.getScreenCTM();

  const blocks = [];
  for (const sel of ['.scheme-box', '.scheme-pod', '.scheme-cylinder', '.scheme-node']) {
    const isFrame = sel === '.scheme-node';        // container, never an obstacle. See the header.
    for (const el of svg.querySelectorAll(sel)) {
      if (el.closest('#packetLayer')) continue;
      const cs = getComputedStyle(el);
      if (cs.opacity === '0' || cs.display === 'none') continue;
      const b = toRoot(el, el.getBBox());
      const label = (el.querySelector('text') || {}).textContent || sel;
      blocks.push({ label: label.trim().slice(0, 28), x: b.x, y: b.y, w: b.w, h: b.h, isFrame });
    }
  }

  const lanes = [];
  for (const el of svg.querySelectorAll('.scheme-arrow')) {
    if (el.closest('#packetLayer')) continue;
    const cs = getComputedStyle(el);
    if (cs.opacity === '0' || cs.display === 'none') continue;
    let subpaths = [];
    if (el.tagName.toLowerCase() === 'line') {
      subpaths = [[[+el.getAttribute('x1'), +el.getAttribute('y1')], [+el.getAttribute('x2'), +el.getAttribute('y2')]]];
    } else {
      const d = el.getAttribute('d') || '';
      if (/[QqCcSsTtAa]/.test(d)) continue;        // curved: no straight-segment claim to make
      const toks = d.match(/[MmLlHhVvZz]|-?\d+(?:\.\d+)?/g) || [];
      let cmd = null, cur = null, x = 0, y = 0, start = null;
      for (let i = 0; i < toks.length;) {
        if (/^[MmLlHhVvZz]$/.test(toks[i])) {
          cmd = toks[i++];
          if (/[Zz]/.test(cmd) && cur && start) { cur.push([start[0], start[1]]); }
          continue;
        }
        if (!cmd) break;                           // `d` starting with a number: nothing to claim
        const rel = cmd === cmd.toLowerCase();
        if (/[Hh]/.test(cmd))      { x = rel ? x + (+toks[i++]) : +toks[i++]; }
        else if (/[Vv]/.test(cmd)) { y = rel ? y + (+toks[i++]) : +toks[i++]; }
        else {
          const nx = +toks[i++], ny = +toks[i++];
          x = rel ? x + nx : nx; y = rel ? y + ny : ny;
        }
        if (/[Mm]/.test(cmd)) { cur = [[x, y]]; subpaths.push(cur); start = [x, y]; cmd = rel ? 'l' : 'L'; }
        else if (cur) { cur.push([x, y]); }
      }
    }
    const lm = rootCTM.inverse().multiply(el.getScreenCTM());
    for (const sp of subpaths) {
      if (sp.length < 2) continue;
      lanes.push(sp.map(([px, py]) => {
        const p = svg.createSVGPoint(); p.x = px; p.y = py;
        const q = p.matrixTransform(lm);
        return [Math.round(q.x * 100) / 100, Math.round(q.y * 100) / 100];
      }));
    }
  }

  return { blocks, lanes };
};

// Name/value chip pairs and the gap between them.
export const chipProbe = ({ stackTol }) => {
  const svg = document.querySelector('dialog.scheme-dialog svg.diagram');
  if (!svg) return null;
  const out = [];
  for (const c of svg.querySelectorAll('.scheme-chip')) {
    if (c.closest('.scheme-chain')) continue;        // ladder rows carry one string, not a pair
    const ts = [...c.querySelectorAll('text')];
    if (ts.length < 2) continue;
    const [n, v] = [ts[0], ts[ts.length - 1]];
    const nb = n.getBBox(), vb = v.getBBox();
    // A heading over a sub-line is not a name/value pair.
    if (Math.abs((nb.y + nb.height / 2) - (vb.y + vb.height / 2)) > stackTol) continue;
    out.push({
      n: (n.textContent || '').trim(),
      v: (v.textContent || '').trim(),
      gap: Math.round(vb.x - (nb.x + nb.width)),
    });
  }
  return out;
};

// Every drawn string and the frame that owns it.
export const inlineProbe = ({ sel }) => {
  const svg = document.querySelector(sel);
  if (!svg) return null;
  const FRAME = '.scheme-box, .scheme-pod, .scheme-node, .scheme-cylinder';
  const texts = [...svg.querySelectorAll('text')].map(t => ({
    cls: (t.getAttribute('class') || '').split(/\s+/)[0],
    text: t.textContent || '',
  }));
  // A frame owns the texts whose nearest frame is itself. Keyed by position: one card draws two Pods
  // under one label, and keying on text would hide a shared address.
  const frames = [...svg.querySelectorAll(FRAME)].map(f => ({
    kind: (f.getAttribute('class') || '').split(/\s+/)[0],
    tf: f.getAttribute('transform') || '',
    own: [...f.querySelectorAll('text')]
      .filter(t => t.parentElement.closest(FRAME) === f)
      .map(t => ({ cls: (t.getAttribute('class') || '').split(/\s+/)[0], text: t.textContent || '' })),
  }));
  return { texts, frames };
};

// The animation plan of a step at t=0.
export const motionProbe = () => {
  const svg = document.querySelector('dialog.scheme-dialog svg.diagram');
  if (!svg) return null;

  const label = (el) => {
    const t = el.querySelector && el.querySelector('text');
    const own = ((t && t.textContent) || '').trim();
    if (own) return own.slice(0, 30);
    const near = el.closest && el.closest('.scheme-box, .scheme-pod, .scheme-cylinder, .scheme-node');
    const nt = near && near.querySelector('text');
    return (((nt && nt.textContent) || el.tagName).trim().slice(0, 30)) || el.tagName;
  };
  // Packets and tags sit at cx=0,cy=0 and move by transform (M-09).
  const xy = (t) => {
    const m = /translate\(\s*(-?[\d.]+)px[, ]+\s*(-?[\d.]+)px\s*\)/.exec(t || '');
    return m ? [+m[1], +m[2]] : null;
  };
  const rk = (p) => p.map(q => `${Math.round(q[0])},${Math.round(q[1])}`).join('|');

  const all = [];
  for (const a of document.getAnimations()) {
    const tgt = a.effect && a.effect.target;
    if (!tgt || !svg.contains(tgt)) continue;
    let kf = [];
    try { kf = a.effect.getKeyframes(); } catch (_) { continue; }
    // Computed timing for the resolved delay, declared timing for duration and easing.
    const tm = a.effect.getTiming(), ct = a.effect.getComputedTiming();
    all.push({ el: tgt, kf, delay: Math.round(ct.delay || 0), dur: Math.round(Number(tm.duration) || 0), easing: tm.easing });
  }

  const brightA = all.filter(r => r.kf.some(k => k.filter));
  const strokeA = all.filter(r => r.kf.some(k => k.stroke));
  const moves = all.map(r => ({ ...r, pts: r.kf.map(k => xy(k.transform)).filter(Boolean) })).filter(r => r.pts.length >= 2);
  const balls = moves.filter(r => r.el.classList.contains('scheme-packet'));

  const out = { pulses: [], ramps: [], balls: [], labels: [], timers: [], noop: [], cxcy: [], fades: [] };

  for (const b of brightA) {
    const peaks = b.kf.map(k => parseFloat((/brightness\(([\d.]+)\)/.exec(k.filter || '') || [0, NaN])[1]))
      .filter(Number.isFinite);
    // inPod: the target or some ancestor below the root is a Pod (container boxes sit a level deeper).
    // coTimed: that Pod blinks on the same beat.
    let inPod = b.el.classList.contains('scheme-pod');
    let coTimed = inPod;
    for (let p = b.el.parentElement; p && p !== svg && !(inPod && coTimed); p = p.parentElement) {
      const pods = [...p.querySelectorAll('.scheme-pod')];
      if (pods.length) inPod = true;
      if (pods.some(q => brightA.some(x => x.el === q && x.delay === b.delay))) coTimed = true;
    }
    // The kit animates stroke on the group's rects at the same delay. A hand-rolled pulse has no partner (R-rawpulse).
    const rects = [b.el, ...b.el.querySelectorAll('.scheme-pod-rect, .scheme-box-rect')];
    out.pulses.push({
      label: label(b.el), cls: b.el.getAttribute('class') || '', delay: b.delay, dur: b.dur, easing: b.easing,
      first: peaks.length ? peaks[0] : null,
      last: peaks.length ? peaks[peaks.length - 1] : null,
      peak: peaks.length ? Math.max(...peaks) : null,
      kitPaired: strokeA.some(s => s.delay === b.delay && rects.includes(s.el)),
      inPod, coTimed,
      // Descendants, where inPod reads ancestors: a Pod wrapper g has no class and sits under the svg. FLASH-BLOCK reads this.
      ownsPod: b.el.classList.contains('scheme-pod') || !!b.el.querySelector('.scheme-pod'),
    });
  }

  for (const s of strokeA) {
    const blk = s.el.closest('.scheme-pod, .scheme-box');
    out.ramps.push({
      label: label(s.el), cls: s.el.getAttribute('class') || '', delay: s.delay, dur: s.dur,
      blockPulses: !!blk && brightA.some(x => x.el === blk),
    });
  }

  const arrivals = balls.map(b => b.delay + b.dur);
  for (const b of balls) {
    const end = b.pts[b.pts.length - 1];
    const want = b.delay + b.dur;
    out.balls.push({
      label: label(b.el), delay: b.delay, dur: b.dur, easing: b.easing, pts: b.pts,
      // The ripple is stamped at delay + travel on the route's last point (M-14), 1ms slack for rounding.
      ripples: all.some(r => r.el.classList.contains('scheme-ripple') && Math.abs(r.delay - want) <= 1 &&
        r.kf.some(k => { const p = xy(k.transform); return p && Math.abs(p[0] - end[0]) < 1 && Math.abs(p[1] - end[1]) < 1; })),
      // Every arrival of the step, for naming which beat a delay came from. A ball's own arrival cannot explain its delay.
      afterArrivals: arrivals,
    });
  }

  for (const l of moves) {
    if (l.el.tagName !== 'text' || !l.el.closest('#packetLayer')) continue;
    const same = balls.filter(b => rk(b.pts) === rk(l.pts));
    const pin = xy(l.el.style.transform);
    out.labels.push({
      txt: (l.el.textContent || '').slice(0, 24), easing: l.easing, dur: l.dur, delay: l.delay,
      matches: same.length,
      ballEasing: same.length ? same[0].easing : null,
      ballDur: same.length ? same[0].dur : null,
      // M-31: built pinned at the route start, read off the inline style makeRidingLabel writes at build time.
      pinnedAtStart: !!pin && Math.abs(pin[0] - l.pts[0][0]) <= 1 && Math.abs(pin[1] - l.pts[0][1]) <= 1,
      pin,
      start: l.pts[0],
    });
  }

  for (const a of all) {
    if (a.dur === 1) out.timers.push({ label: label(a.el), kf: a.kf.length });
    const ops = a.kf.map(k => k.opacity).filter(o => o !== undefined && o !== null).map(Number);
    // M-29: an opacity track from a value to the same value is the no-op M-28 forbids.
    if (ops.length >= 2 && ops.every(o => o === ops[0]) && a.kf.every(k => !k.transform && !k.filter && !k.stroke)) {
      out.noop.push({ label: label(a.el), ops, dur: a.dur });
    }
    if (a.kf.some(k => k.cx !== undefined || k.cy !== undefined)) out.cxcy.push({ label: label(a.el) });
    if (!ops.length || a.el.closest('#packetLayer') || a.kf.some(k => k.filter)) continue;
    out.fades.push({ dir: ops[ops.length - 1] < ops[0] ? 'out' : ops[ops.length - 1] > ops[0] ? 'in' : 'blink', dur: a.dur });
  }

  return out;
};

// Composited opacity and .highlight past the end of a step. Needs installOpacityHelpers().
export const opacityProbe = ({ terminated }) => {
  const svg = document.querySelector('dialog.scheme-dialog svg.diagram');
  if (!svg) return null;

  // Its own text, else the nearest block's.
  const label = (el) => {
    const t = el.querySelector && el.querySelector('text');
    const own = (t && t.textContent || '').trim();
    if (own) return own.slice(0, 28);
    const near = el.closest && el.closest('.scheme-box, .scheme-pod, .scheme-cylinder, .scheme-node');
    const nt = near && near.querySelector('text');
    return ((nt && nt.textContent) || el.tagName).trim().slice(0, 28) || el.tagName;
  };
  const isPod = (el) => !!(el.classList && el.classList.contains('scheme-pod')) ||
    !!(el.querySelector && el.querySelector('.scheme-pod'));
  const moving = (el) => !!(el.closest && el.closest('#packetLayer'));

  // PHASE (a): every inline pin, the own declared value.
  const found = [];
  for (const el of svg.querySelectorAll('[style*="opacity"]')) {
    const v = el.style.opacity;
    if (v === '' || moving(el)) continue;
    found.push({ kind: 'pin', v: parseFloat(v), label: label(el) });
  }

  // PHASE (b): every opacity keyframe, plus the timing ORDER needs.
  const fades = [], pulses = [], rises = [];
  for (const a of document.getAnimations()) {
    const tgt = a.effect && a.effect.target;
    if (!tgt || !svg.contains(tgt)) continue;
    const t = a.effect.getComputedTiming();
    let frames = [];
    try { frames = a.effect.getKeyframes(); } catch (_) { continue; }
    const ops = frames.map(f => f.opacity).filter(o => o !== undefined && o !== null).map(Number);
    // A pulse is a filter track, collected even without opacity: a dim Pod's blink lifts opacity and ORDER needs both.
    if (frames.some(f => f.filter)) pulses.push({ el: tgt, delay: t.delay || 0, label: label(tgt) });
    if (!ops.length || moving(tgt)) continue;
    // A blink returns to where it started, so only its resting value is a phase (C-10).
    const blink = ops.length > 2 && ops[0] === ops[ops.length - 1];
    for (const o of (blink ? [ops[0]] : ops)) found.push({ kind: blink ? 'rest' : 'frame', v: o, label: label(tgt) });
    if (ops[ops.length - 1] < ops[0]) {
      fades.push({ el: tgt, delay: t.delay || 0, label: label(tgt), pod: isPod(tgt) });
    } else if (ops[ops.length - 1] > ops[0]) {
      rises.push({ el: tgt, delay: t.delay || 0 });
    }
  }

  // ORDER: the earliest pulse on a fading Pod, unless it came back up in between (that pulse answers the return).
  const order = [];
  for (const f of fades) {
    if (!f.pod) continue;
    const mine = pulses
      .filter(p => p.el === f.el || f.el.contains(p.el))
      .filter(p => !rises.some(r => (r.el === f.el || f.el.contains(r.el)) && r.delay >= f.delay && r.delay <= p.delay));
    if (!mine.length) continue;                    // no pulse of this fade: nothing to order
    const first = Math.min(...mine.map(p => p.delay));
    // A pulse and a fade issued in the same call are the same beat.
    if (first > f.delay + 1) order.push({ label: f.label, pulse: Math.round(first), fade: Math.round(f.delay) });
  }

  // LIT: .highlight at a composited opacity in (0, terminated]. At-or-below catches a pin inside a dimmed
  // group, and 0 is excluded as "not drawn" (the reveal idiom).
  const lit = [];
  for (const el of svg.querySelectorAll('.highlight')) {
    // Same walk as effectiveOpacity() over declared pins. An unpinned element contributes 1.
    let declared = 1;
    for (let n = el; n && n !== svg; n = n.parentElement) {
      const v = n.style && n.style.opacity;
      if (v !== '' && v !== undefined && v !== null) {
        const f = parseFloat(v);
        if (Number.isFinite(f)) declared *= f;
      }
    }
    declared = Math.round(declared * 1000) / 1000;
    if (declared <= 0.001 || declared > terminated + 0.001) continue;
    lit.push({ label: label(el), declared, composited: window.__opacity.effective(el, svg) });
  }

  return { found, order, lit };
};

// Balls, blocks and chips for report/arrival.
export const arrivalProbe = ({ tol }) => {
  const svg = document.querySelector('dialog.scheme-dialog svg.diagram');
  if (!svg) return null;

  // Mapped through window.__toRoot, the same rootBBox the geometry tests use.
  const toRoot = (el) => window.__toRoot(el, svg);
  const label = (el, fallback) => {
    const t = el.querySelector('text');
    return (((t && t.textContent) || fallback).trim().slice(0, 28)) || fallback;
  };

  // R3's blocks. A node frame is a container a lane crosses, never a receiver.
  const blocks = [];
  for (const sel of ['.scheme-box', '.scheme-pod', '.scheme-cylinder']) {
    for (const el of svg.querySelectorAll(sel)) {
      if (el.closest('#packetLayer')) continue;
      const cs = getComputedStyle(el);
      if (cs.opacity === '0' || cs.display === 'none') continue;
      blocks.push({ kind: sel.slice(8), label: label(el, sel), ...toRoot(el), hl: el.classList.contains('highlight') });
    }
  }

  // R2's chips. Chain rows are out: their highlight tracks the active row, not a changed value.
  const chips = [];
  let ci = 0;
  for (const el of svg.querySelectorAll('.scheme-chip')) {
    if (el.closest('#packetLayer') || el.closest('.scheme-chain')) continue;
    const texts = [...el.querySelectorAll('text')].map(t => (t.textContent || '').trim());
    chips.push({
      key: `${ci++}:${texts[0] || ''}`,
      name: texts[0] || '',
      value: texts.length > 1 ? texts[texts.length - 1] : null,
      hl: el.classList.contains('highlight'),
    });
  }

  // Route ends, delay and the stamped arrivalMs, read paused at t=0 (the plan). R3 needs when a ball departs.
  const packets = [];
  for (const el of svg.querySelectorAll('#packetLayer .scheme-packet')) {
    let frames = null, delay = 0;
    for (const a of el.getAnimations()) {
      const kf = a.effect.getKeyframes();
      if (kf.length && kf.some(k => k.transform && k.transform !== 'none')) {
        frames = kf;
        const t = a.effect.getComputedTiming();
        delay = Number.isFinite(t.delay) ? Math.round(t.delay) : 0;
        break;
      }
    }
    if (!frames) continue;
    const xy = (k) => {
      const m = /translate\(\s*(-?[\d.]+)px[, ]+\s*(-?[\d.]+)px\s*\)/.exec(k.transform || '');
      return m ? [+m[1], +m[2]] : null;
    };
    const from = xy(frames[0]), to = xy(frames[frames.length - 1]);
    if (!from || !to) continue;
    packets.push({
      from, to, delay,
      arrivalMs: Number.isFinite(el.arrivalMs) ? Math.round(el.arrivalMs) : null,
      role: el.getAttribute('data-role') || '',
    });
  }

  return { blocks, chips, packets, tol };
};

export const reducedSnap = (sel) => {
  const svg = document.querySelector('dialog.scheme-dialog svg.diagram');
  if (!svg) return { els: [], wires: [], collisions: 0 };
  if (!window.__opacity) throw new Error('window.__opacity missing: installOpacityHelpers ran after navigation');
  if (!window.__keyed) throw new Error('window.__keyed missing: installKeyHelpers ran after navigation');

  let collisions = 0;
  const count = (c) => { if (c) collisions++; };

  // Only the text a block draws itself, never a nested block's, so one defect is one finding.
  const ownText = (el) => {
    const out = [];
    for (const t of el.querySelectorAll('text')) {
      if (t.closest(sel.els) !== el) continue;
      out.push((t.textContent || '').trim());
    }
    return out.join(' | ');
  };

  const els = window.__keyed(svg, sel.els, sel.transient).map(({ el, key, collision }) => {
    count(collision);
    return {
      key,
      own: window.__opacity.own(el),
      eff: window.__opacity.effective(el, svg),
      txt: ownText(el),
      hl: el.classList.contains('highlight'),
    };
  });

  const wires = window.__keyed(svg, sel.wires, sel.transient).map(({ el, key, collision }) => {
    count(collision);
    return { key, text: (el.textContent || '').trim() };
  });

  return { els, wires, collisions };
};

export const captureDeferred = (sel) => {
  const svg = document.querySelector('dialog.scheme-dialog svg.diagram');
  window.__deferred = [];
  if (!svg) return [];
  if (!window.__keyed) throw new Error('window.__keyed missing: installKeyHelpers ran after navigation');
  for (const a of document.getAnimations()) {
    const tgt = a.effect && a.effect.target;
    if (!tgt || !svg.contains(tgt)) continue;
    if (typeof a.onfinish !== 'function') continue;
    const t = a.effect.getComputedTiming();
    const end = (Number(t.delay) || 0) + (Number(t.activeDuration) || 0);
    window.__deferred.push({ fn: a.onfinish, end });
  }

  // Pulsed targets: the reduced branch stands in for a pulse with a .highlight on the inner box, so
  // HIGHLIGHT exempts them. Collected before the seek. Does not license a played-path highlight (S-19).
  const pulsedTargets = new Set();
  for (const a of document.getAnimations()) {
    const tgt = a.effect && a.effect.target;
    if (!tgt || !svg.contains(tgt)) continue;
    const kf = a.effect.getKeyframes ? a.effect.getKeyframes() : [];
    if (!kf.some(k => k.filter !== undefined || k.stroke !== undefined)) continue;
    pulsedTargets.add(tgt);
  }
  // Keys, not slot numbers, so the exemption survives re-ordering.
  const pulsedKeys = [];
  for (const { el, key } of window.__keyed(svg, sel.els, sel.transient)) {
    for (const t of pulsedTargets) { if (el === t || el.contains(t)) { pulsedKeys.push(key); break; } }
  }
  return pulsedKeys;
};

export const runDeferred = (t) => {
  let n = 0;
  const due = (window.__deferred || []).filter(d => d.end <= t).sort((a, b) => a.end - b.end);
  for (const d of due) {
    try { d.fn(); n++; } catch (_) {}
  }
  return n;
};
