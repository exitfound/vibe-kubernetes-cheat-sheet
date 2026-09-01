// probes.mjs: the page-side readings the catalog walk takes, in one place.
//
// EVERY function here RUNS IN THE PAGE and therefore has NO FREE VARIABLES: `tools/walk.mjs`
// serialises each one into an init script and calls it by name, so anything it closes over is
// simply absent at the call site. Arguments come in as one object.
//
// They live here rather than in the test files that used to own them because those files no longer
// drive a browser: the walk opens each card once and takes every reading, and the tests assert over
// what it wrote. Two of these were already duplicated across two files each (the block extraction
// in render/geometry and report/geometry-soft was byte-identical; the panel rect in
// report/geometry-soft was a second copy of fixtures/render.mjs overlayProbe) and a third, the
// paint row, was shared by render/palette and report/palette-steps. One reading, written once, is
// the point.

// BLOCKS AND LANES, the geometry rules' whole picture. Lifted verbatim from
// render/geometry.test.mjs. Needs window.__toRoot, which installGeometryHelpers() puts there.
export const geometryProbe = () => {
  const svg = document.querySelector('dialog.scheme-dialog svg.diagram');
  if (!svg) return null;

  // getBBox() is in the element's own user space and primitives are translated groups, so every
  // bbox is mapped through the element-to-root matrix. Without it the check compares two
  // coordinate systems and every number it prints is fiction.
  const toRoot = (el, b) => window.__toRoot(el, svg, b);

  // The same matrix, kept here for the LANE half further down, which maps a list of path POINTS
  // rather than a bounding box and so has nothing to hand the shared helper. Neither of the other
  // two callers of that helper reads lanes, so this is not a fourth copy of anything.
  const rootCTM = svg.getScreenCTM();

  // Blocks: the shapes a lane must not be drawn across, and the faces an endpoint may sit on.
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

  // Lanes: every drawn arrow or relationship path, as one or more polylines.
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

// NAME/VALUE CHIP PAIRS and the gap between them. Lifted verbatim from render/chipfit.test.mjs.
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
    // Stacked texts (a heading over a sub-line) are not a name/value pair.
    if (Math.abs((nb.y + nb.height / 2) - (vb.y + vb.height / 2)) > stackTol) continue;
    out.push({
      n: (n.textContent || '').trim(),
      v: (v.textContent || '').trim(),
      gap: Math.round(vb.x - (nb.x + nb.width)),
    });
  }
  return out;
};

// EVERY DRAWN STRING and the frame that owns it. Lifted verbatim from render/inline.test.mjs.
// The `sel` it took as a bare argument arrives in the options object every probe here takes.
export const inlineProbe = ({ sel }) => {
  const svg = document.querySelector(sel);
  if (!svg) return null;
  const FRAME = '.scheme-box, .scheme-pod, .scheme-node, .scheme-cylinder';
  const texts = [...svg.querySelectorAll('text')].map(t => ({
    cls: (t.getAttribute('class') || '').split(/\s+/)[0],
    text: t.textContent || '',
  }));
  // A frame owns the text elements whose NEAREST enclosing frame is itself, so a Pod does not
  // inherit the strings of the box drawn inside it. Identity is the frame's POSITION, because
  // one card draws two distinct Pods under one label and keying on the text would merge them
  // and hide a shared address.
  const frames = [...svg.querySelectorAll(FRAME)].map(f => ({
    kind: (f.getAttribute('class') || '').split(/\s+/)[0],
    tf: f.getAttribute('transform') || '',
    own: [...f.querySelectorAll('text')]
      .filter(t => t.parentElement.closest(FRAME) === f)
      .map(t => ({ cls: (t.getAttribute('class') || '').split(/\s+/)[0], text: t.textContent || '' })),
  }));
  return { texts, frames };
};

// THE ANIMATION PLAN of a step at t=0. Lifted verbatim from render/motion.test.mjs.
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
  // A translate() out of a keyframe or out of an inline style. Packets and tags are pinned at
  // cx=0,cy=0 and moved by transform (M-09), so this is where a position lives.
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
    // getComputedTiming for the delay (it is the resolved one), getTiming for duration and easing
    // (the computed easing of a paused effect is the same string, and the declared one is what the
    // rule is about).
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
    // inPod: the target is a Pod, or SOME ancestor below the diagram root holds one. The ancestor
    // walk is what makes a container box legal: storage-emptydir wraps shell and containers in one
    // group and the boxes sit a level deeper, so a parent-only test would report four correct cards.
    // coTimed is the stricter half: that Pod must blink on the SAME beat, which is what "a Pod
    // pulses with everything inside it" actually says.
    let inPod = b.el.classList.contains('scheme-pod');
    let coTimed = inPod;
    for (let p = b.el.parentElement; p && p !== svg && !(inPod && coTimed); p = p.parentElement) {
      const pods = [...p.querySelectorAll('.scheme-pod')];
      if (pods.length) inPod = true;
      if (pods.some(q => brightA.some(x => x.el === q && x.delay === b.delay))) coTimed = true;
    }
    // The kit animates stroke on the rects of the same group at the same delay. A hand-rolled
    // brightness track has no such partner, which is what makes this the render-side R-rawpulse.
    const rects = [b.el, ...b.el.querySelectorAll('.scheme-pod-rect, .scheme-box-rect')];
    out.pulses.push({
      label: label(b.el), cls: b.el.getAttribute('class') || '', delay: b.delay, dur: b.dur, easing: b.easing,
      first: peaks.length ? peaks[0] : null,
      last: peaks.length ? peaks[peaks.length - 1] : null,
      peak: peaks.length ? Math.max(...peaks) : null,
      kitPaired: strokeA.some(s => s.delay === b.delay && rects.includes(s.el)),
      inPod, coTimed,
      // DESCENDANTS, where inPod reads ANCESTORS, and the two answer different questions. A card
      // names a Pod by the key of its WRAPPER g, which carries no class and sits directly under the
      // svg, so the ancestor walk never starts and inPod stays false on the very element a card
      // would hand to F.flash. Measured on network-ebpf-dataplane: parent is the svg, class null,
      // one .scheme-pod inside. FLASH-BLOCK reads this one.
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
      // The ripple is stamped at delay + travel on the last point of the route (M-14). 1ms of slack
      // because both numbers are rounded off the same arithmetic.
      ripples: all.some(r => r.el.classList.contains('scheme-ripple') && Math.abs(r.delay - want) <= 1 &&
        r.kf.some(k => { const p = xy(k.transform); return p && Math.abs(p[0] - end[0]) < 1 && Math.abs(p[1] - end[1]) < 1; })),
      // Every arrival in this step, so the Node side can name which beat this ball's delay came
      // from against the imported BEAT. A ball's OWN arrival is in the list and cannot explain its
      // own delay (an arrival is always later than the departure it belongs to), so it is left in
      // rather than filtered out by a special case.
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
      // M-31: built pinned at the route start, or the tag sits at the SVG origin under the narration
      // panel until its delay elapses. Read off the inline style, which makeRidingLabel writes at
      // build time: it is not deferred, so a frozen probe sees it.
      pinnedAtStart: !!pin && Math.abs(pin[0] - l.pts[0][0]) <= 1 && Math.abs(pin[1] - l.pts[0][1]) <= 1,
      pin,
      start: l.pts[0],
    });
  }

  for (const a of all) {
    if (a.dur === 1) out.timers.push({ label: label(a.el), kf: a.kf.length });
    const ops = a.kf.map(k => k.opacity).filter(o => o !== undefined && o !== null).map(Number);
    // M-29's grep, as data: a track that animates opacity from a value to the same value is the
    // composite-forcing no-op M-28 exists to forbid.
    if (ops.length >= 2 && ops.every(o => o === ops[0]) && a.kf.every(k => !k.transform && !k.filter && !k.stroke)) {
      out.noop.push({ label: label(a.el), ops, dur: a.dur });
    }
    if (a.kf.some(k => k.cx !== undefined || k.cy !== undefined)) out.cxcy.push({ label: label(a.el) });
    if (!ops.length || a.el.closest('#packetLayer') || a.kf.some(k => k.filter)) continue;
    out.fades.push({ dir: ops[ops.length - 1] < ops[0] ? 'out' : ops[ops.length - 1] > ops[0] ? 'in' : 'blink', dur: a.dur });
  }

  return out;
};

// COMPOSITED OPACITY and the .highlight state, read past the end of a step. Lifted verbatim
// from render/opacity.test.mjs. Needs the helpers installOpacityHelpers() puts on the page.
export const opacityProbe = ({ terminated }) => {
  const svg = document.querySelector('dialog.scheme-dialog svg.diagram');
  if (!svg) return null;

  // How a finding names an element: its own text, else the text of the nearest block around it.
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

  // PHASE, source (a): every inline pin currently on the tree. The OWN declared value.
  const found = [];
  for (const el of svg.querySelectorAll('[style*="opacity"]')) {
    const v = el.style.opacity;
    if (v === '' || moving(el)) continue;
    found.push({ kind: 'pin', v: parseFloat(v), label: label(el) });
  }

  // PHASE, source (b): every opacity keyframe of every animation on this diagram, plus the timing
  // ORDER needs. One pass, because both rules are answers about the same animation list.
  const fades = [], pulses = [], rises = [];
  for (const a of document.getAnimations()) {
    const tgt = a.effect && a.effect.target;
    if (!tgt || !svg.contains(tgt)) continue;
    const t = a.effect.getComputedTiming();
    let frames = [];
    try { frames = a.effect.getKeyframes(); } catch (_) { continue; }
    const ops = frames.map(f => f.opacity).filter(o => o !== undefined && o !== null).map(Number);
    // A pulse is the track carrying `filter`: brightness up and back. Collected even when it
    // carries no opacity of its own, because a dim Pod's blink lifts opacity and an ordinary one
    // does not, and ORDER has to see both.
    if (frames.some(f => f.filter)) pulses.push({ el: tgt, delay: t.delay || 0, label: label(tgt) });
    if (!ops.length || moving(tgt)) continue;
    // A track that returns to where it started is a BLINK (pulsePodDim), so only its resting value
    // is a phase: the peak is a pulse magnitude and lives in PULSE_POD, not in OPACITY (C-10).
    const blink = ops.length > 2 && ops[0] === ops[ops.length - 1];
    for (const o of (blink ? [ops[0]] : ops)) found.push({ kind: blink ? 'rest' : 'frame', v: o, label: label(tgt) });
    if (ops[ops.length - 1] < ops[0]) {
      fades.push({ el: tgt, delay: t.delay || 0, label: label(tgt), pod: isPod(tgt) });
    } else if (ops[ops.length - 1] > ops[0]) {
      rises.push({ el: tgt, delay: t.delay || 0 });
    }
  }

  // ORDER: for every Pod that fades out, the earliest pulse ON THAT ELEMENT (or inside it).
  // A pulse belongs to this fade only if the Pod has not come back up in between: a delete-then-
  // recreate (workloads-replicaset, storage-volumeclaimtemplates) fades to 0 and pulses on the way
  // back, and that pulse answers the RETURN, not the fade.
  const order = [];
  for (const f of fades) {
    if (!f.pod) continue;
    const mine = pulses
      .filter(p => p.el === f.el || f.el.contains(p.el))
      .filter(p => !rises.some(r => (r.el === f.el || f.el.contains(r.el)) && r.delay >= f.delay && r.delay <= p.delay));
    if (!mine.length) continue;                    // no pulse of this fade: nothing to order
    const first = Math.min(...mine.map(p => p.delay));
    // 1ms of slack: a pulse and a fade issued in the same call are the same beat.
    if (first > f.delay + 1) order.push({ label: f.label, pulse: Math.round(first), fade: Math.round(f.delay) });
  }

  // LIT: anything holding .highlight while it sits at the terminated shade, meaning anywhere in
  // (0, terminated]. Two edges, and both were measured rather than guessed:
  //   upper  at-or-below rather than equal-to, because under the PRODUCT reading a highlight
  //          pinned terminated inside a dimmed group lands below 0.12 and is no less gone for it.
  //          The original's equality could not see that case at all. Tolerance 0.001, as before.
  //   lower  a declared 0 is excluded. 0 is not a phase, it is "not drawn" (C-04), and pinning 0
  //          then revealing with a fade-in while the arrival lights the block is the standard
  //          reveal idiom: cluster-resource-quota, cluster-node-allocatable, network-service-cidr,
  //          storage-container-filesystem and storage-configmap-secret-mount all do it, and all
  //          five composite to full strength at the moment the highlight is on them.
  const lit = [];
  for (const el of svg.querySelectorAll('.highlight')) {
    // The product of the DECLARED pins on the chain, element included, root excluded: the same
    // walk effectiveOpacity() makes, over el.style.opacity instead of getComputedStyle. An
    // element with no pin of its own contributes 1, exactly as the original treated it.
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

// WHERE THE BALLS, BLOCKS AND CHIPS ARE. Lifted verbatim from report/arrival.test.mjs.
export const arrivalProbe = ({ tol }) => {
  const svg = document.querySelector('dialog.scheme-dialog svg.diagram');
  if (!svg) return null;

  // getBBox() is in the element's own user space and every primitive is a translated group, so each
  // box is mapped through the element-to-root matrix. It is the reason a hit test can compare a
  // route endpoint with a block at all. Literally the same mapping the geometry tests use now:
  // fixtures/render.mjs rootBBox, on the page as window.__toRoot via installGeometryHelpers().
  const toRoot = (el) => window.__toRoot(el, svg);
  const label = (el, fallback) => {
    const t = el.querySelector('text');
    return (((t && t.textContent) || fallback).trim().slice(0, 28)) || fallback;
  };

  // The blocks R3 governs. A .scheme-node frame is a CONTAINER, not a receiver: a lane crosses it to
  // reach what it holds, so a frame at a route end never is the thing that received the ball.
  const blocks = [];
  for (const sel of ['.scheme-box', '.scheme-pod', '.scheme-cylinder']) {
    for (const el of svg.querySelectorAll(sel)) {
      if (el.closest('#packetLayer')) continue;
      const cs = getComputedStyle(el);
      if (cs.opacity === '0' || cs.display === 'none') continue;
      blocks.push({ kind: sel.slice(8), label: label(el, sel), ...toRoot(el), hl: el.classList.contains('highlight') });
    }
  }

  // The value chips R2 governs. Chain-ladder rows are excluded: their highlight tracks the ACTIVE
  // ROW of a ladder, it is not a value that changed.
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

  // Packets: the ends of the transform keyframe list, the delay, and the arrivalMs the kit stamped on
  // the element. Read with everything paused at t=0, so this is the step's PLAN and not its progress.
  // The delay is read alongside the route because R3 needs to know WHEN a ball departs, not only that
  // it does: "this block already acted" only excuses being lit if it acted FIRST.
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

// From render/reduced.test.mjs, verbatim.
export const reducedSnap = (sel) => {
  const svg = document.querySelector('dialog.scheme-dialog svg.diagram');
  if (!svg) return { els: [], wires: [], collisions: 0 };
  if (!window.__opacity) throw new Error('window.__opacity missing: installOpacityHelpers ran after navigation');
  if (!window.__keyed) throw new Error('window.__keyed missing: installKeyHelpers ran after navigation');

  let collisions = 0;
  const count = (c) => { if (c) collisions++; };

  // The <text> a block draws ITSELF, never the text of a block nested inside it. A Pod contains an
  // inner .scheme-box and a Node frame contains whole Pods, so plain textContent would report one
  // wrong sublabel on the box that owns it AND on every ancestor, and one repair would close three
  // findings at once. `closest` answers which element in the list owns a given text node, and the
  // join is by drawn order, which for a value chip is name then value.
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

// From render/reduced.test.mjs, verbatim.
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

  // Which elements does this step PULSE? A pulse cannot be shown statically, so the reduced branch
  // stands in for it with a .highlight on the Pod inner box. That is the documented convention, not
  // a defect, and without this exemption the HIGHLIGHT axis reports it 130 more times and stops
  // being a signal at all. Collected before the seek, while the pulse animations still exist.
  //
  // SCOPE: the exemption is about the REDUCED branch of a step that pulses. It does not license a
  // .highlight left on an inner container box on the PLAYED path, which is STO.C-02 and S-19, and
  // which nothing here can see because both paths accumulate it identically.
  const pulsedTargets = new Set();
  for (const a of document.getAnimations()) {
    const tgt = a.effect && a.effect.target;
    if (!tgt || !svg.contains(tgt)) continue;
    const kf = a.effect.getKeyframes ? a.effect.getKeyframes() : [];
    if (!kf.some(k => k.filter !== undefined || k.stroke !== undefined)) continue;
    pulsedTargets.add(tgt);
  }
  // Returned as KEYS, the same ones snap() reads, so the exemption survives the scene being
  // re-ordered. Never return slot numbers here: a slot number points at whatever element happens
  // to occupy that slot, silently.
  const pulsedKeys = [];
  for (const { el, key } of window.__keyed(svg, sel.els, sel.transient)) {
    for (const t of pulsedTargets) { if (el === t || el.contains(t)) { pulsedKeys.push(key); break; } }
  }
  return pulsedKeys;
};

// From render/reduced.test.mjs, verbatim.
export const runDeferred = (t) => {
  let n = 0;
  const due = (window.__deferred || []).filter(d => d.end <= t).sort((a, b) => a.end - b.end);
  for (const d of due) {
    try { d.fn(); n++; } catch (_) {}
  }
  return n;
};
