import { svg, g, text, rect, path } from '../lib/svg.js';
import { arrowDefs, box, pod, pathArrow, animateAlong } from '../lib/primitives.js';
import {
  valChip, setVal, pulsePod, routePacket, routeDur,
  makeInit, clearHighlights, clearWires, flashChips, BEAT, FADE,
} from '../lib/scaling-kit.js';

// THE ANCHOR CARD of the scaling category. Scaling grammar is a CONTROL LOOP FEEDING A REPLICA ROW:
// a controller (here a Deployment) sits on top, a horizontal ROW OF POD REPLICAS sits below it, and
// the recurring gesture is the row GROWING sideways as the controller emits new replicas. Vertical
// scaling is the inverse gesture on one unit: the same Pod grows its resource request in place
// instead of the row multiplying. Both axes move the same underlying number, the resource request.
//
// GEOMETRY. The Deployment box sits top center (right of the narration overlay). The replica row sits
// on y=ROW_Y, well below the overlay, so it uses the full canvas width (the safe zone is an L: full
// width below the overlay). Six slots are centered on x=600, three shown at rest. New replicas rise
// and fade in from below as a create packet reaches each slot from the controller.
//
// PULSE MODEL: the Deployment is infrastructure, it lights via .highlight and never pulses. Only the
// Pod replicas pulse, and only the ones a step actually acts on (the new replicas on scale out, the
// focused replica on scale up). The resource gauge inside each Pod is a detail rect, it neither
// highlights nor pulses, it only reveals its grown overlay on the vertical step.
//
// WIRES: on scale out the controller emits a create packet down a create-lane to each new slot. The
// lanes are drawn dim into the packet layer for that step only (every ball rides a drawn wire) and
// cleared on the next step, so the row is never cluttered with lanes to empty slots.
const SPINE_X = 600;

const DEP_X = 460, DEP_Y = 104, DEP_W = 280, DEP_H = 74;   // 460..740, center 600
const DEP_BOTTOM = DEP_Y + DEP_H;                          // 178
const BUS_Y = 322;                                         // the create bus the lanes drop onto

const SLOTS = 6;
const P_W = 96, P_H = 120, P_GAP = 28;
const ROW_Y = 360, ROW_BOTTOM = ROW_Y + P_H;               // 360..480
const ROW_W = SLOTS * P_W + (SLOTS - 1) * P_GAP;           // 716
const ROW_X0 = SPINE_X - ROW_W / 2;                        // 242
const slotX = i => ROW_X0 + i * (P_W + P_GAP);             // 242,366,490,614,738,862
const slotCX = i => slotX(i) + P_W / 2;

// The seventh, over-capacity slot: a Pod that cannot be placed because the nodes are full.
const PEND_X = slotX(6);                                   // 986..1082

const CHIPS_Y = 556;

// A create-lane from the controller down onto the bus, across to a slot, and down into its top.
const createLane = i => [[SPINE_X, DEP_BOTTOM], [SPINE_X, BUS_Y], [slotCX(i), BUS_Y], [slotCX(i), ROW_Y]];

function laneWire(points) {
  const d = 'M ' + points.map(p => p.join(' ')).join(' L ');
  return path({ class: 'scheme-arrow scheme-arrow-dashed scheme-arrow-scaling scheme-arrow-dim', d, 'stroke-dasharray': '5 5', fill: 'none' });
}

// A replica: a Pod shell wrapped in a bare g so pulsePod reaches it and its rise-in can be animated
// on the wrap without clobbering the Pod translate. reqBase is the resting request, reqGrow is the
// enlarged request revealed only on the vertical step.
function buildReplica(i) {
  const x = slotX(i), y = ROW_Y;
  const shell = pod({ x, y, w: P_W, h: P_H, label: 'web', containers: 0, cat: 'scaling' });
  const shellRect = shell.querySelector('.scheme-pod-rect');
  if (shellRect) shellRect.style.fill = 'rgba(255, 255, 255, 0.03)';
  const reqBase = rect({ x: x + 30, y: y + 92, width: 36, height: 16, rx: 2, fill: 'rgba(255, 160, 77, 0.30)', stroke: 'var(--scaling-color)', 'stroke-width': 1 });
  const reqGrow = rect({ x: x + 30, y: y + 44, width: 36, height: 48, rx: 2, fill: 'rgba(255, 160, 77, 0.55)', stroke: 'var(--scaling-color)', 'stroke-width': 1 });
  reqGrow.style.opacity = '0';
  const cap = text({ class: 'scheme-pod-sublabel', x: x + P_W / 2, y: y + 82, 'text-anchor': 'middle' }, ['req']);
  const wrap = g({});
  [shell, reqGrow, reqBase, cap].forEach(el => wrap.appendChild(el));
  return { wrap, shell, reqGrow };
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
      'aria-label': 'The two axes of scaling in Kubernetes. Horizontal scaling adds Pod replicas, so a Deployment grows its row of Pods sideways. Vertical scaling keeps the same Pod but raises its resource request in place. Both move the same underlying number, the request, and both stop at the node capacity ceiling where adding nodes is a third axis handled outside this category.',
      'data-style': 'outline',
    });
    root.appendChild(arrowDefs());

    const dep = box({ x: DEP_X, y: DEP_Y, w: DEP_W, h: DEP_H, label: 'Deployment web', sublabel: 'owns replicas and the Pod template', cat: 'scaling' });

    const replicas = [];
    for (let i = 0; i < SLOTS; i++) replicas.push(buildReplica(i));
    const pend = buildReplica(6);
    // relabel the pending pod
    const pendLabel = pend.wrap.querySelector('.scheme-pod-label');
    if (pendLabel) pendLabel.textContent = 'web';
    pend.wrap.style.opacity = '0';

    const rowGroup = g({});
    replicas.forEach(r => rowGroup.appendChild(r.wrap));
    // pending pod drawn separately (it is not part of the managed row until placed)
    const pendGroup = g({});
    pendGroup.appendChild(pend.wrap);

    const replicasChip = valChip({ x: 150, y: CHIPS_Y, w: 240, h: 34, name: 'replicas',     value: '3',        cat: 'scaling' });
    const sizeChip     = valChip({ x: 410, y: CHIPS_Y, w: 330, h: 34, name: 'pod request',  value: 'cpu 250m', cat: 'scaling' });
    const capChip      = valChip({ x: 760, y: CHIPS_Y, w: 300, h: 34, name: 'node room',    value: 'fits',     cat: 'scaling' });

    const packetLayer = g({ id: 'packetLayer' });

    // Z-order (bottom -> top): controller, replica row, pending pod, chip strip, packet layer on top.
    [dep, rowGroup, pendGroup].forEach(el => root.appendChild(el));
    [replicasChip, sizeChip, capChip].forEach(c => root.appendChild(c));
    root.appendChild(packetLayer);

    this.host.appendChild(root);
    this.refs = {
      svg: root, dep, replicas, pend,
      replicasChip, sizeChip, capChip,
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
function setChips(s, { replicas, size, cap }) {
  setChip(s.refs.replicasChip, replicas);
  setChip(s.refs.sizeChip, size);
  setChip(s.refs.capChip, cap);
}

// Set every replica slot to an explicit opacity for this step (hidden slots stay hidden, the pending
// pod stays gone unless the boundary step summons it). Pinned above the reduced guard so a mid-step
// cancel and reduced motion both land on the right picture.
function setRow(s, visibleCount, { dimExcept = null } = {}) {
  s.refs.replicas.forEach((r, i) => {
    let op = i < visibleCount ? 1 : 0;
    if (op === 1 && dimExcept != null && i !== dimExcept) op = 0.4;
    r.wrap.style.opacity = String(op);
    r.wrap.style.transform = 'translate(0px, 0px)';
    r.reqGrow.style.opacity = (dimExcept === i && op === 1) ? '1' : '0';
  });
  s.refs.pend.wrap.style.opacity = '0';
}

function clearHL(s) {
  clearHighlights(s, ['dep', 'replicasChip', 'sizeChip', 'capChip'],
    s.refs.replicas.map(r => r.wrap).concat([s.refs.pend.wrap]));
}

const STEPS = [
  {
    id: 'idle',
    duration: 1500,
    narration: 'Scaling in Kubernetes has two axes. Horizontal scaling changes how many Pods run, vertical scaling changes how big each Pod is. This Deployment starts with three replicas, each asking for cpu 250m.',
    enter(s) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setChips(s, { replicas: '3', size: 'cpu 250m', cap: 'fits' });
      setRow(s, 3);
    },
  },
  {
    id: 'horizontal',
    duration: 3600,
    narration: 'Horizontal scaling adds replicas. The Deployment stamps out three more Pods from the same template and the row grows to six. This is the default and safest way to add capacity, because the load spreads across more identical Pods.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setChips(s, { replicas: '6', size: 'cpu 250m', cap: 'fits' });
      setRow(s, 6);
      s.refs.dep.classList.add('highlight');
      if (ctx.reduced) return;
      // The controller creates the three new replicas. Each create rides a lane down to its slot,
      // and the new Pod rises and fades in as the packet lands, then pulses (down-arrow: packet
      // first, pulse on arrival).
      const NEW = [3, 4, 5];
      NEW.forEach((i, k) => {
        const lane = createLane(i);
        s.refs.packetLayer.appendChild(laneWire(lane));
        const start = BEAT.afterHop + k * 200;
        const pkt = routePacket(s, ctx, lane, { delay: start, cat: 'scaling' });
        const w = s.refs.replicas[i].wrap;
        w.style.opacity = '0';
        w.style.transform = 'translate(0px, 14px)';
        ctx.register(w.animate(
          [{ opacity: 0, transform: 'translate(0px, 14px)' }, { opacity: 1, transform: 'translate(0px, 0px)' }],
          { duration: 360, delay: pkt.arrivalMs, fill: 'forwards', easing: 'ease-out' },
        ));
        pulsePod(w, ctx, pkt.arrivalMs + 120);
      });
    },
  },
  {
    id: 'vertical',
    duration: 3000,
    narration: 'Vertical scaling keeps the Pod count the same and raises the resource request instead. Focus one replica: an in-place resize can raise its request from cpu 250m to cpu 1000m without recreating it, so it gets a bigger slice of its node. One Pod, more room, rather than more Pods.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setChips(s, { replicas: '6', size: 'cpu 1000m', cap: 'fits' });
      // Focus the leftmost replica and dim the rest, so the grow-in-place reads on one unit.
      setRow(s, 6, { dimExcept: 0 });
      if (ctx.reduced) return;
      const focus = s.refs.replicas[0];
      // Reveal the enlarged request in place, then pulse the Pod that grew.
      focus.reqGrow.style.opacity = '0';
      ctx.register(focus.reqGrow.animate([{ opacity: 0 }, { opacity: 1 }], { duration: FADE.in, fill: 'forwards', easing: 'ease-out' }));
      pulsePod(focus.wrap, ctx, 260);
    },
  },
  {
    id: 'substrate',
    duration: 2600,
    narration: 'Both axes move the same number, the resource request. Horizontal scaling multiplies it across more Pods, vertical scaling raises it per Pod. The request is also what utilization is measured against, so it is the anchor every autoscaler reads.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setChips(s, { replicas: '6', size: 'cpu 250m', cap: 'fits' });
      setRow(s, 6);
      // A conceptual step with no packet and no Pod action, so the two chips that carry the idea
      // flash once (the only sanctioned block flash).
      s.refs.replicasChip.classList.add('highlight');
      s.refs.sizeChip.classList.add('highlight');
      if (ctx.reduced) return;
      flashChips(s, ctx, ['replicasChip', 'sizeChip']);
    },
  },
  {
    id: 'boundary',
    duration: 3000,
    narration: 'Both axes stop at the node capacity ceiling. When no node has room for the next Pod, that Pod stays Pending. Adding nodes is a third axis handled by a separate component at the node layer, outside this category.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setChips(s, { replicas: '7', size: 'cpu 250m', cap: 'full, Pending' });
      setRow(s, 6);
      s.refs.capChip.classList.add('highlight');
      // A seventh replica is requested but cannot be placed, so it appears as a dim Pending ghost
      // beyond the full row. It never pulses because it is not running. Pinned dim above the guard.
      s.refs.pend.wrap.style.opacity = '0.32';
      if (ctx.reduced) return;
      ctx.register(s.refs.pend.wrap.animate([{ opacity: 0 }, { opacity: 0.32 }], { duration: FADE.in, fill: 'forwards', easing: 'ease-out' }));
    },
  },
];

export const init = makeInit(Scene, STEPS, { posterFirst: true });
