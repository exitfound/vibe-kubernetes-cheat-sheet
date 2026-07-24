import { svg, g, text, rect, path } from '../lib/svg.js';
import { arrowDefs, box, pod, animateAlong } from '../lib/primitives.js';
import {
  valChip, setVal, pulsePod, routePacket, routeDur,
  makeInit, clearHighlights, clearWires, flashChips, BEAT, FADE,
} from '../lib/scaling-kit.js';

// scaling-hpa-algorithm: the ratio formula that turns a percentage into a replica count.
//   desiredReplicas = ceil( currentReplicas x currentMetric / targetMetric )
// The card fills that formula in term by term in a panel to the right of the overlay, then the row
// grows to the ceiling result. A second run at a lower metric shrinks it, and the ceiling is what
// keeps the autoscaler from ever rounding capacity away.
//
// GEOMETRY. The HPA sits top left of center (clear of the overlay), the formula panel fills the free
// zone to its right, the scale endpoint sits under the HPA, and the replica row sits low on y=ROW_Y
// where it has full width. Only Pods pulse, boxes light via .highlight, the formula terms fade in per
// step, and new replicas rise on their create lanes while shed replicas ghost out.
const SPINE_X = 600;

const HPA_X = 416, HPA_Y = 92, HPA_W = 250, HPA_H = 68;    // center 541,126
const HPA_CX = HPA_X + HPA_W / 2;                          // 541
const HPA_BOTTOM = HPA_Y + HPA_H;                          // 160

const FP_X = 712, FP_Y = 96, FP_W = 452, FP_H = 190;       // formula panel
const FL_X = FP_X + 28;                                    // 740, text left edge

const SCALE_X = 461, SCALE_Y = 300, SCALE_W = 160, SCALE_H = 44; // center 541,322
const SCALE_BOTTOM = SCALE_Y + SCALE_H;                    // 344

const SLOTS = 6;
const P_W = 96, P_H = 118, P_GAP = 28;
const ROW_Y = 392;
const ROW_W = SLOTS * P_W + (SLOTS - 1) * P_GAP;           // 716
const ROW_X0 = SPINE_X - ROW_W / 2;                        // 242
const slotX = i => ROW_X0 + i * (P_W + P_GAP);
const slotCX = i => slotX(i) + P_W / 2;                    // 290,414,538,662,786,910

const CHIPS_Y = 556;
const BUS_Y = 368;

const PATCH_LANE = [[HPA_CX, HPA_BOTTOM], [HPA_CX, SCALE_Y]];
const createLane = i => [[HPA_CX, SCALE_BOTTOM], [HPA_CX, BUS_Y], [slotCX(i), BUS_Y], [slotCX(i), ROW_Y]];

function laneWire(points, { dim = true } = {}) {
  const cls = 'scheme-arrow scheme-arrow-dashed scheme-arrow-scaling' + (dim ? ' scheme-arrow-dim' : '');
  const d = 'M ' + points.map(p => p.join(' ')).join(' L ');
  return path({ class: cls, d, 'stroke-dasharray': '5 5', fill: 'none' });
}

function ridingLabel(s, ctx, txt, points, { delay = 0, dur = null, easing = 'ease-in-out' } = {}) {
  if (ctx.reduced) return;
  const d = dur == null ? routeDur(points) : dur;
  const lbl = text({ class: 'scheme-box-sublabel', x: 0, y: -14, 'text-anchor': 'middle', 'data-cat': 'scaling' }, [txt]);
  lbl.style.opacity = '0';
  lbl.style.transform = `translate(${points[0][0]}px, ${points[0][1]}px)`;
  s.refs.packetLayer.appendChild(lbl);
  ctx.register(lbl.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 150, delay: Math.max(0, delay - 150), fill: 'forwards', easing: 'ease-out' }));
  ctx.register(animateAlong(lbl, points, { duration: d, delay, easing }));
  ctx.register(lbl.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 180, delay: delay + d + 160, fill: 'forwards', easing: 'ease-in' }));
}

function lightBoxAt(boxEl, ctx, delay = 0) {
  if (!boxEl) return;
  if (ctx.reduced || delay <= 0) { boxEl.classList.add('highlight'); return; }
  const a = boxEl.animate([{ opacity: 1 }, { opacity: 1 }], { duration: 1, delay });
  a.onfinish = () => boxEl.classList.add('highlight');
  ctx.register(a);
}

function buildReplica(i) {
  const x = slotX(i), y = ROW_Y;
  const shell = pod({ x, y, w: P_W, h: P_H, label: 'web', containers: 0, cat: 'scaling' });
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
      'aria-label': 'The HPA ratio formula. Desired replicas equals the ceiling of current replicas times the current metric divided by the target metric. Three Pods at ninety percent against a fifty percent target give the ceiling of three times ninety over fifty, which is the ceiling of five point four, so six Pods. The same formula at thirty percent shrinks it back down, and the ceiling is what keeps it from ever rounding required capacity away.',
      'data-style': 'outline',
    });
    root.appendChild(arrowDefs());

    const hpa = box({ x: HPA_X, y: HPA_Y, w: HPA_W, h: HPA_H, label: 'HPA', sublabel: 'target cpu 50%', cat: 'scaling' });
    const scaleBox = box({ x: SCALE_X, y: SCALE_Y, w: SCALE_W, h: SCALE_H, label: '/scale', cat: 'scaling' });

    // Formula panel: a framed box with a static title row and four work rows filled in per step.
    const panel = rect({ class: 'scheme-box-rect', x: FP_X, y: FP_Y, width: FP_W, height: FP_H, rx: 8, 'data-cat': 'scaling' });
    const fTitle = text({ class: 'scheme-box-label', x: FL_X, y: FP_Y + 34, 'text-anchor': 'start' }, ['desired = ceil( n x cur / tgt )']);
    const mkLine = dy => text({ class: 'scheme-label code', x: FL_X, y: FP_Y + dy, 'text-anchor': 'start' }, [' ']);
    const fInputs = mkLine(74);
    const fRatio  = mkLine(108);
    const fMul    = mkLine(142);
    const fResult = mkLine(176);
    [fInputs, fRatio, fMul, fResult].forEach(l => { l.style.opacity = '0'; });
    const panelGroup = g({});
    [panel, fTitle, fInputs, fRatio, fMul, fResult].forEach(el => panelGroup.appendChild(el));

    const replicas = [];
    for (let i = 0; i < SLOTS; i++) replicas.push(buildReplica(i));
    const rowGroup = g({});
    replicas.forEach(r => rowGroup.appendChild(r.wrap));

    const currentChip = valChip({ x: 150, y: CHIPS_Y, w: 260, h: 34, name: 'current', value: '90%', cat: 'scaling' });
    const targetChip  = valChip({ x: 450, y: CHIPS_Y, w: 260, h: 34, name: 'target',  value: '50%', cat: 'scaling' });
    const desiredChip = valChip({ x: 750, y: CHIPS_Y, w: 260, h: 34, name: 'desired', value: '-',   cat: 'scaling' });

    const packetLayer = g({ id: 'packetLayer' });

    // Z-order (bottom -> top): boxes, formula panel, replica row, chip strip, packet layer.
    [hpa, scaleBox, panelGroup, rowGroup].forEach(el => root.appendChild(el));
    [currentChip, targetChip, desiredChip].forEach(c => root.appendChild(c));
    root.appendChild(packetLayer);

    this.host.appendChild(root);
    this.refs = {
      svg: root, hpa, scaleBox, replicas,
      fInputs, fRatio, fMul, fResult,
      currentChip, targetChip, desiredChip,
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
function setChips(s, { current, target, desired }) {
  setChip(s.refs.currentChip, current);
  setChip(s.refs.targetChip, target);
  setChip(s.refs.desiredChip, desired);
}

// Set the four formula rows: each entry is [ref, text, visible]. Visible rows are pinned to opacity 1
// above the reduced guard, hidden ones to 0. Newly revealed rows are faded in below the guard.
function setLines(s, rows) {
  rows.forEach(([ref, txt, visible]) => {
    ref.textContent = txt;
    ref.style.opacity = visible ? '1' : '0';
  });
}
function revealLine(ctx, ref, delay = 0) {
  if (ctx.reduced) return;
  ctx.register(ref.animate([{ opacity: 0 }, { opacity: 1 }], { duration: FADE.in, delay, fill: 'forwards', easing: 'ease-out' }));
}

function setRow(s, visibleCount) {
  s.refs.replicas.forEach((r, i) => {
    r.wrap.style.opacity = i < visibleCount ? '1' : '0';
    r.wrap.style.transform = 'translate(0px, 0px)';
  });
}

function clearHL(s) {
  clearHighlights(s, ['hpa', 'scaleBox', 'currentChip', 'targetChip', 'desiredChip'],
    s.refs.replicas.map(r => r.wrap));
}

const STEPS = [
  {
    id: 'idle',
    duration: 1500,
    narration: 'The HPA decides how many replicas to run with a single formula. Desired replicas is the ceiling of current replicas times the current metric divided by the target. This workload runs three Pods and targets fifty percent cpu.',
    enter(s) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setChips(s, { current: '90%', target: '50%', desired: '-' });
      setLines(s, [[s.refs.fInputs, ' ', false], [s.refs.fRatio, ' ', false], [s.refs.fMul, ' ', false], [s.refs.fResult, ' ', false]]);
      setRow(s, 3);
    },
  },
  {
    id: 'inputs',
    duration: 2400,
    narration: 'Start with the three inputs. There are three replicas right now, they are averaging ninety percent cpu, and the target is fifty percent. Those three numbers are everything the formula needs.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setChips(s, { current: '90%', target: '50%', desired: '-' });
      setLines(s, [[s.refs.fInputs, 'replicas 3   current 90%   target 50%', true], [s.refs.fRatio, ' ', false], [s.refs.fMul, ' ', false], [s.refs.fResult, ' ', false]]);
      setRow(s, 3);
      // Conceptual step: the two input chips light and flash once, the formula row fades in. No packet,
      // no Pod acts.
      s.refs.currentChip.classList.add('highlight');
      s.refs.targetChip.classList.add('highlight');
      if (ctx.reduced) return;
      flashChips(s, ctx, ['currentChip', 'targetChip']);
      revealLine(ctx, s.refs.fInputs);
    },
  },
  {
    id: 'ratio',
    duration: 2400,
    narration: 'First take the metric ratio: current over target. Ninety over fifty is one point eight, which means the Pods are running at nearly twice the load the target allows. A ratio above one always means scale out.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setChips(s, { current: '90%', target: '50%', desired: '-' });
      setLines(s, [[s.refs.fInputs, 'replicas 3   current 90%   target 50%', true], [s.refs.fRatio, 'ratio = 90 / 50 = 1.8', true], [s.refs.fMul, ' ', false], [s.refs.fResult, ' ', false]]);
      setRow(s, 3);
      if (ctx.reduced) return;
      revealLine(ctx, s.refs.fRatio);
    },
  },
  {
    id: 'multiply',
    duration: 2400,
    narration: 'Then multiply the ratio by the current replica count. Three times one point eight is five point four. That is the raw, unrounded number of replicas the load says it wants.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setChips(s, { current: '90%', target: '50%', desired: '-' });
      setLines(s, [[s.refs.fInputs, 'replicas 3   current 90%   target 50%', true], [s.refs.fRatio, 'ratio = 90 / 50 = 1.8', true], [s.refs.fMul, '3 x 1.8 = 5.4', true], [s.refs.fResult, ' ', false]]);
      setRow(s, 3);
      if (ctx.reduced) return;
      revealLine(ctx, s.refs.fMul);
    },
  },
  {
    id: 'ceil',
    duration: 4200,
    narration: 'Finally round up. The ceiling of five point four is six, never five, because rounding down would leave the workload short of the capacity it just asked for. The HPA PATCHes the scale endpoint to six and three more Pods are created.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setChips(s, { current: '90%', target: '50%', desired: '6' });
      setLines(s, [[s.refs.fInputs, 'replicas 3   current 90%   target 50%', true], [s.refs.fRatio, 'ratio = 90 / 50 = 1.8', true], [s.refs.fMul, '3 x 1.8 = 5.4', true], [s.refs.fResult, 'ceil(5.4) = 6', true]]);
      setRow(s, 6);
      s.refs.hpa.classList.add('highlight');
      if (ctx.reduced) { s.refs.scaleBox.classList.add('highlight'); return; }
      revealLine(ctx, s.refs.fResult);
      // Down-arrow: PATCH drops from the HPA to the scale endpoint, then the controller creates the
      // three new replicas, which rise and pulse as their create balls land.
      s.refs.packetLayer.appendChild(laneWire(PATCH_LANE));
      const patch = routePacket(s, ctx, PATCH_LANE, { delay: FADE.in, cat: 'scaling' });
      ridingLabel(s, ctx, 'replicas 6', PATCH_LANE, { delay: FADE.in });
      lightBoxAt(s.refs.scaleBox, ctx, patch.arrivalMs);
      const NEW = [3, 4, 5];
      NEW.forEach((i, k) => {
        const lane = createLane(i);
        s.refs.packetLayer.appendChild(laneWire(lane));
        const start = patch.arrivalMs + BEAT.afterHop + k * 180;
        const pkt = routePacket(s, ctx, lane, { delay: start, cat: 'scaling' });
        const w = s.refs.replicas[i].wrap;
        w.style.opacity = '0';
        w.style.transform = 'translate(0px, 14px)';
        ctx.register(w.animate(
          [{ opacity: 0, transform: 'translate(0px, 14px)' }, { opacity: 1, transform: 'translate(0px, 0px)' }],
          { duration: 340, delay: pkt.arrivalMs, fill: 'forwards', easing: 'ease-out' },
        ));
        pulsePod(w, ctx, pkt.arrivalMs + 120);
      });
    },
  },
  {
    id: 'down-example',
    duration: 3400,
    narration: 'The same formula shrinks the workload later. Now six Pods are averaging thirty percent, so six times thirty over fifty is three point six, and the ceiling of that is four. The HPA PATCHes down to four and two Pods are removed.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setChips(s, { current: '30%', target: '50%', desired: '4' });
      setLines(s, [[s.refs.fInputs, 'replicas 6   current 30%   target 50%', true], [s.refs.fRatio, 'ratio = 30 / 50 = 0.6', true], [s.refs.fMul, '6 x 0.6 = 3.6', true], [s.refs.fResult, 'ceil(3.6) = 4', true]]);
      // The row settles at four: slots 4 and 5 are removed and fade fully out. Pinned above the guard.
      s.refs.replicas.forEach((r, i) => {
        r.wrap.style.transform = 'translate(0px, 0px)';
        r.wrap.style.opacity = i < 4 ? '1' : '0';
      });
      s.refs.hpa.classList.add('highlight');
      if (ctx.reduced) { s.refs.scaleBox.classList.add('highlight'); return; }
      [s.refs.fInputs, s.refs.fRatio, s.refs.fMul, s.refs.fResult].forEach((l, k) => revealLine(ctx, l, k * 80));
      s.refs.packetLayer.appendChild(laneWire(PATCH_LANE));
      const patch = routePacket(s, ctx, PATCH_LANE, { delay: FADE.in, cat: 'scaling' });
      ridingLabel(s, ctx, 'replicas 4', PATCH_LANE, { delay: FADE.in });
      lightBoxAt(s.refs.scaleBox, ctx, patch.arrivalMs);
      // The two shed replicas are removed and fade fully out on arrival of the PATCH.
      [4, 5].forEach(i => {
        const w = s.refs.replicas[i].wrap;
        ctx.register(w.animate([{ opacity: 1 }, { opacity: 0 }], { duration: FADE.out, delay: patch.arrivalMs, fill: 'forwards', easing: 'ease-in' }));
      });
    },
  },
];

export const init = makeInit(Scene, STEPS, { posterFirst: true });
