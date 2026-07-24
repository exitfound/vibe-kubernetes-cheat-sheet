import { svg, g, text, rect, line, path, circle } from '../lib/svg.js';
import { arrowDefs, box, pod, animateAlong } from '../lib/primitives.js';
import {
  valChip, setVal, pulsePod,
  makeInit, clearHighlights, clearWires, flashChips,
} from '../lib/scaling-kit.js';

// SCALING behavior card: FLAPPING AND HOW IT IS DAMPED. The synthesis card. A noisy metric would make
// a naive autoscaler add and remove Pods every tick (thrash), which is disruptive. The tolerance band
// (ignore small noise), the stabilization window (ignore brief dips), and the rate policies (cap the
// step) together turn a jittery signal into smooth, infrequent scaling.
//
// GEOMETRY. A jittery metric TRACE sits in a framed strip across the free width, with a shaded
// tolerance band and a target line. The trace is shaped so its story is literal: it jitters inside the
// band on the left, then dips below the band in the middle, then rises and stays above it on the right.
// A marker DOT rides that trace so the motion matches the words, staying inside the band on
// tolerance-damp, dipping below it on window-damp, and breaching above it on policy-damp. Below the
// trace three numbered GUARD pills (1 tolerance, 2 window, 3 policy) light up cumulatively as each
// damping mechanism is introduced. The replica ROW sits below them.
//
// PULSE MODEL. Only Pods pulse. The naive step FLAPS the row via opacity (Pods appear then vanish then
// appear, the churn the card is warning about) and the policy-damp step GROWS the row once as a
// deliberate scale event, so Pods change on exactly those two steps. The marker dot rides the trace on
// the naive / tolerance / window / policy steps to carry the signal. The smooth step alone is
// packet-less, pod-less and marker-less, so its events chip is flashed via flashChips instead. Guard
// pills and the marker are not pods: pills light via .highlight, the dot only travels, neither pulses.
const SPINE_X = 600;

const FR_X = 430, FR_Y = 166, FR_W = 662, FR_H = 120;      // trace frame
const BAND_Y = 208, BAND_H = 36;                           // tolerance band strip
const TARGET_Y = 226;                                      // target line

const PILL_Y = 312, PILL_H = 30, PILL_W = 200, PILL_GAP = 24;
const PILL_ROW_W = 3 * PILL_W + 2 * PILL_GAP;              // 648
const PILL_X0 = (1200 - PILL_ROW_W) / 2;                   // 276
const pillX = i => PILL_X0 + i * (PILL_W + PILL_GAP);

const SLOTS = 6;
const P_W = 96, P_H = 120, P_GAP = 28;
const ROW_Y = 372;
const ROW_W = SLOTS * P_W + (SLOTS - 1) * P_GAP;           // 716
const ROW_X0 = SPINE_X - ROW_W / 2;                        // 242
const slotX = i => ROW_X0 + i * (P_W + P_GAP);
const CHIPS_Y = 556;

// Hand-tuned samples telling the story in three regions inside the frame (y 166..286): a low-amplitude
// jitter INSIDE the band (idx 0..5), a DIP below the band (idx 5..10), then a RISE that stays ABOVE the
// band (idx 10..15). Band is y 208..244, target 226. The marker dot rides slices of this same polyline
// so the drawn trace and the moving dot cannot disagree.
const TRACE = [
  [460, 224], [500, 214], [540, 236], [580, 216], [620, 234], [660, 222],
  [700, 238], [740, 258], [780, 266], [820, 254], [860, 236],
  [900, 214], [940, 196], [980, 190], [1020, 192], [1060, 194],
];
// Slices ridden per step (inclusive index ranges into TRACE).
const RIDE_ALL = TRACE;
const RIDE_INSIDE = TRACE.slice(0, 6);   // jitter that stays in the band
const RIDE_DIP = TRACE.slice(4, 11);     // through the dip below the band
const RIDE_RISE = TRACE.slice(10, 16);   // up and over the band, sustained

// A marker dot that rides the trace to carry the metric reading. It is a plain circle, not a
// .scheme-packet, so the tools do not count it as traffic (the signal is a value over time, not a hop).
function traceDot() {
  const c = circle({ cx: 0, cy: 0, r: 6, 'data-cat': 'scaling' });
  c.style.fill = 'var(--scaling-color)';
  c.style.stroke = 'rgba(17, 15, 31, 0.9)';
  c.style.strokeWidth = '1.5';
  return c;
}
function rideMarker(s, ctx, pts, { dur, delay = 0 } = {}) {
  const dot = traceDot();
  dot.style.opacity = '0';
  dot.style.transform = `translate(${pts[0][0]}px, ${pts[0][1]}px)`;
  s.refs.packetLayer.appendChild(dot);
  ctx.register(dot.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 160, delay, fill: 'forwards', easing: 'ease-out' }));
  ctx.register(animateAlong(dot, pts, { duration: dur, delay, easing: 'ease-in-out' }));
  ctx.register(dot.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 200, delay: delay + dur + 120, fill: 'forwards', easing: 'ease-in' }));
}

function buildReplica(i) {
  const shell = pod({ x: slotX(i), y: ROW_Y, w: P_W, h: P_H, label: 'web', containers: 0, cat: 'scaling' });
  const shellRect = shell.querySelector('.scheme-pod-rect');
  if (shellRect) shellRect.style.fill = 'rgba(255, 255, 255, 0.03)';
  const wrap = g({});
  wrap.appendChild(shell);
  return { wrap, shell };
}

class Scene {
  constructor(host) { this.host = host; this.refs = {}; this.build(); }

  build() {
    this.host.replaceChildren();
    this.refs = {};
    const root = svg({
      class: 'diagram',
      viewBox: '0 0 1200 640',
      preserveAspectRatio: 'xMidYMid meet',
      'aria-label': 'How flapping is damped. A jittery metric would make a naive autoscaler add and remove Pods on every tick, a churn called thrashing that hurts more than it helps. Three behavior guards work together to prevent it: the tolerance band swallows small noise, the stabilization window ignores brief dips, and the rate policies cap how fast the count may move. As each guard engages the trace stops moving the row, until a jittery signal becomes a few smooth, deliberate scale events.',
      'data-style': 'outline',
    });
    root.appendChild(arrowDefs());

    const frame = rect({ x: FR_X, y: FR_Y, width: FR_W, height: FR_H, rx: 4, fill: 'rgba(255, 255, 255, 0.02)', stroke: 'rgba(255, 255, 255, 0.14)', 'stroke-width': 1 });
    const band = rect({ x: FR_X, y: BAND_Y, width: FR_W, height: BAND_H, rx: 2, fill: 'rgba(255, 160, 77, 0.14)', stroke: 'none' });
    const target = line({ x1: FR_X, y1: TARGET_Y, x2: FR_X + FR_W, y2: TARGET_Y, stroke: 'var(--scaling-color)', 'stroke-width': 1.2, 'stroke-dasharray': '4 4' });
    const traceD = 'M ' + TRACE.map(p => p.join(' ')).join(' L ');
    const trace = path({ class: 'scheme-arrow scheme-arrow-scaling', d: traceD, fill: 'none', 'stroke-width': 1.6 });
    const traceLbl = text({ class: 'scheme-label code dim', x: FR_X, y: FR_Y - 10, 'text-anchor': 'start' }, ['metric signal (noisy)']);

    const guardTol = box({ x: pillX(0), y: PILL_Y, w: PILL_W, h: PILL_H, label: '1. tolerance band', cat: 'scaling' });
    const guardWin = box({ x: pillX(1), y: PILL_Y, w: PILL_W, h: PILL_H, label: '2. stabilization window', cat: 'scaling' });
    const guardPol = box({ x: pillX(2), y: PILL_Y, w: PILL_W, h: PILL_H, label: '3. rate policies', cat: 'scaling' });

    const replicas = [];
    for (let i = 0; i < SLOTS; i++) replicas.push(buildReplica(i));
    const rowGroup = g({});
    replicas.forEach(r => rowGroup.appendChild(r.wrap));

    const signalChip = valChip({ x: 150, y: CHIPS_Y, w: 260, h: 34, name: 'signal', value: 'jittery', cat: 'scaling' });
    const guardsChip = valChip({ x: 440, y: CHIPS_Y, w: 360, h: 34, name: 'guards', value: 'none',    cat: 'scaling' });
    const eventsChip = valChip({ x: 830, y: CHIPS_Y, w: 220, h: 34, name: 'events', value: '-',       cat: 'scaling' });

    const packetLayer = g({ id: 'packetLayer' });

    [frame, band, target, trace, traceLbl, guardTol, guardWin, guardPol, rowGroup].forEach(el => root.appendChild(el));
    [signalChip, guardsChip, eventsChip].forEach(c => root.appendChild(c));
    root.appendChild(packetLayer);

    this.host.appendChild(root);
    this.refs = {
      svg: root, trace, band, guardTol, guardWin, guardPol, replicas,
      signalChip, guardsChip, eventsChip,
      wires: {}, packetLayer,
    };
  }

  reset() { this.build(); }
}

function setChip(chip, val) {
  const changed = chip && chip.valueText && chip.valueText.textContent !== String(val);
  setVal(chip, val);
  if (changed) chip.classList.add('highlight');
}
function setChips(s, { signal, guards, events }) {
  setChip(s.refs.signalChip, signal);
  setChip(s.refs.guardsChip, guards);
  setChip(s.refs.eventsChip, events);
}

function setRow(s, visibleCount) {
  s.refs.replicas.forEach((r, i) => {
    r.wrap.style.opacity = i < visibleCount ? '1' : '0';
    r.wrap.style.transform = 'translate(0px, 0px)';
  });
}

// Light the first `n` guard pills, dim the rest.
function setGuards(s, n) {
  [s.refs.guardTol, s.refs.guardWin, s.refs.guardPol].forEach((el, i) => {
    if (i < n) el.classList.add('highlight');
    else el.classList.remove('highlight');
  });
}

function clearHL(s) {
  clearHighlights(s, ['guardTol', 'guardWin', 'guardPol', 'signalChip', 'guardsChip', 'eventsChip'],
    s.refs.replicas.map(r => r.wrap));
}

const STEPS = [
  {
    id: 'idle',
    duration: 1500,
    narration: 'The metric coming into the autoscaler is noisy: it wobbles around the target tick after tick. On its own that jitter carries no real signal about load. The question is what an autoscaler does with a signal this shaky.',
    enter(s) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setChips(s, { signal: 'jittery', guards: 'none', events: '-' });
      setGuards(s, 0);
      setRow(s, 4);
    },
  },
  {
    id: 'naive',
    duration: 3000,
    narration: 'With no damping the autoscaler chases every wobble. One tick it reads high and adds Pods, the next it reads low and removes them, over and over. This is thrashing: the row flaps four to six to four to six and the churn disrupts every workload on it.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setChips(s, { signal: 'jittery', guards: 'none', events: 'churn 4-6-4-6' });
      setGuards(s, 0);
      setRow(s, 4);
      s.refs.eventsChip.classList.add('highlight');
      if (ctx.reduced) return;
      // The marker chases the whole jittery trace while the two extra Pods flap on and off, the
      // disruptive churn the guards exist to stop. Pods change here, so this step is not flashed. Pinned
      // resting state is the four-Pod row.
      rideMarker(s, ctx, RIDE_ALL, { dur: 2400 });
      [4, 5].forEach((i) => {
        const w = s.refs.replicas[i].wrap;
        w.style.opacity = '0';
        ctx.register(w.animate(
          [{ opacity: 0 }, { opacity: 1, offset: 0.2 }, { opacity: 0.12, offset: 0.45 }, { opacity: 1, offset: 0.7 }, { opacity: 0.12, offset: 0.9 }, { opacity: 0 }],
          { duration: 2600, fill: 'forwards', easing: 'ease-in-out' },
        ));
      });
    },
  },
  {
    id: 'tolerance-damp',
    duration: 2600,
    narration: 'The first guard is the tolerance band. Any reading within ten percent of the target counts as noise, so the small ups and downs inside the band no longer trigger anything. The marker jitters along the trace but stays inside the band, and the row stops reacting to it.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setChips(s, { signal: 'inside band', guards: 'tolerance', events: 'noise ignored' });
      setGuards(s, 1);
      setRow(s, 4);
      s.refs.guardsChip.classList.add('highlight');
      if (ctx.reduced) return;
      // The marker rides the left jitter, staying inside the band, so no scale event fires. The motion
      // is the marker, so this step is not flashed.
      rideMarker(s, ctx, RIDE_INSIDE, { dur: 1500, delay: 200 });
    },
  },
  {
    id: 'window-damp',
    duration: 2600,
    narration: 'The second guard is the stabilization window. Here the marker dips below the band for a moment, but scale down looks back over the recent window and keeps the higher count, so a momentary drop no longer shrinks the workload. Brief dips are absorbed too.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setChips(s, { signal: 'brief dip', guards: 'tolerance + window', events: 'dip ignored' });
      setGuards(s, 2);
      setRow(s, 4);
      s.refs.guardsChip.classList.add('highlight');
      if (ctx.reduced) return;
      // The marker travels down through the dip below the band and back up, but the window absorbs it so
      // the row does not shrink. The motion is the marker, so this step is not flashed.
      rideMarker(s, ctx, RIDE_DIP, { dur: 1700, delay: 200 });
    },
  },
  {
    id: 'policy-damp',
    duration: 3000,
    narration: 'When the marker rises above the band and stays there, the metric has left the band for real, so the third guard shapes the response. Rate policies cap how many Pods may be added per period, so the count climbs in a smooth bounded step instead of a spike. Here that is one deliberate move from four to six.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setChips(s, { signal: 'sustained rise', guards: 'all three', events: '1 scale up' });
      setGuards(s, 3);
      setRow(s, 6);
      s.refs.eventsChip.classList.add('highlight');
      if (ctx.reduced) return;
      // The marker breaches above the band and holds, then a real, capped scale event: the two new Pods
      // rise and pulse, once, not flapping.
      rideMarker(s, ctx, RIDE_RISE, { dur: 1400, delay: 200 });
      [4, 5].forEach((i, k) => {
        const w = s.refs.replicas[i].wrap;
        w.style.opacity = '0';
        w.style.transform = 'translate(0px, 14px)';
        const delay = 400 + k * 220;
        ctx.register(w.animate(
          [{ opacity: 0, transform: 'translate(0px, 14px)' }, { opacity: 1, transform: 'translate(0px, 0px)' }],
          { duration: 360, delay, fill: 'forwards', easing: 'ease-out' },
        ));
        pulsePod(w, ctx, delay + 120);
      });
    },
  },
  {
    id: 'smooth',
    duration: 2800,
    narration: 'Put together, the three guards turn a jittery signal into calm behavior. The same noisy metric that made a naive autoscaler thrash now produces only a few deliberate scale events. The workload is steady, and scaling happens when it truly matters.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setChips(s, { signal: 'jittery', guards: 'all three', events: 'few, deliberate' });
      setGuards(s, 3);
      setRow(s, 6);
      s.refs.eventsChip.classList.add('highlight');
      if (ctx.reduced) return;
      // Packet-less and pod-less: the row holds steady at six, the events chip flashes to close on the
      // smooth result.
      flashChips(s, ctx, ['eventsChip']);
    },
  },
];

export const init = makeInit(Scene, STEPS, { posterFirst: true });
