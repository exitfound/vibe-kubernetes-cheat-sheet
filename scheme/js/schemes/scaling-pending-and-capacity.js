import { svg, g, text, path } from '../lib/svg.js';
import { arrowDefs, box, node, pod, animateAlong } from '../lib/primitives.js';
import {
  valChip, setVal, pulsePod, routePacket, routeDur,
  makeInit, clearHighlights, clearWires, flashChips, BEAT, FADE,
} from '../lib/scaling-kit.js';

// DISRUPTION boundary card. The scaling category ends where in-cluster capacity ends: when the
// scheduler finds no node with room, the next Pod stays Pending with reason Unschedulable. This is
// the forward-pointer to cluster autoscaling, which operates at the node and infrastructure layer,
// outside this category, drawn here as a dim ghost box off the right edge labeled outside scope.
//
// GEOMETRY. A Scheduler box sits top center (right of the narration overlay). Two node frames sit on
// y>=306, well below the overlay, each holding a row of three Pod slots. New Pods drop from the
// Scheduler down a create-lane into a free slot and pulse. When both nodes are full the next Pod
// cannot be placed, so it appears as a dim Pending ghost beside the nodes and never pulses (it is not
// running). A dim dashed arrow then points off the right edge to a Cluster Autoscaler ghost box.
const SPINE_X = 600;

const SCH_X = 460, SCH_Y = 96, SCH_W = 280, SCH_H = 66;   // 460..740, center 600
const SCH_BOTTOM = SCH_Y + SCH_H;                          // 162
const BUS_Y = 290;                                        // create bus above the node frames

const NODE_Y = 306, NODE_W = 300, NODE_H = 225;
const NODE1_X = 110, NODE2_X = 440;                       // 110..410, 440..740

const P_W = 80, P_H = 94, SLOT_Y = 418, SLOT_STEP = 95;
const slotX = (nodeX, i) => nodeX + 15 + i * SLOT_STEP;
const slotCX = (nodeX, i) => slotX(nodeX, i) + P_W / 2;

const PEND_X = 820, PEND_CX = PEND_X + P_W / 2;           // 820..900, center 860

const AUTO_X = 956, AUTO_Y = 402, AUTO_W = 224, AUTO_H = 108; // 956..1180, center 1068

const CHIPS_Y = 556;

const createLane = cx => [[SPINE_X, SCH_BOTTOM], [SPINE_X, BUS_Y], [cx, BUS_Y], [cx, SLOT_Y]];

function makePod(x, y, label) {
  const shell = pod({ x, y, w: P_W, h: P_H, label, sublabel: 'Ready', containers: 0, cat: 'scaling' });
  const shellRect = shell.querySelector('.scheme-pod-rect');
  if (shellRect) shellRect.style.fill = 'rgba(255, 255, 255, 0.03)';
  const wrap = g({});
  wrap.appendChild(shell);
  return { wrap, shell };
}

function laneWire(points) {
  const d = 'M ' + points.map(p => p.join(' ')).join(' L ');
  return path({ class: 'scheme-arrow scheme-arrow-dashed scheme-arrow-scaling scheme-arrow-dim', d, 'stroke-dasharray': '5 5', fill: 'none' });
}

// A tag that rides ALONG the create lane with the ball, carrying the bind verb the step narrates. The
// create balls are routePacket (eased), so the label rides eased too, with the same length-based
// duration, or it drifts off the ball mid-flight.
function ridingLabel(s, ctx, txt, points, { delay = 0 } = {}) {
  if (ctx.reduced) return;
  const d = routeDur(points);
  const lbl = text({ class: 'scheme-box-sublabel', x: 0, y: -14, 'text-anchor': 'middle', 'data-cat': 'scaling' }, [txt]);
  lbl.style.opacity = '0';
  s.refs.packetLayer.appendChild(lbl);
  ctx.register(lbl.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 150, delay: Math.max(0, delay - 150), fill: 'forwards', easing: 'ease-out' }));
  ctx.register(animateAlong(lbl, points, { duration: d, delay, easing: 'ease-in-out' }));
  ctx.register(lbl.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 180, delay: delay + d + 120, fill: 'forwards', easing: 'ease-in' }));
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
      'aria-label': 'Pending Pods and the capacity ceiling. As a workload scales, the scheduler places each new Pod on a node with room. When both nodes are full the next Pod finds nowhere to fit and stays Pending with reason Unschedulable. That is the ceiling of scaling inside a fixed cluster, and beyond it a cluster autoscaler would add a node so the Pod can bind, which runs outside this category.',
      'data-style': 'outline',
    });
    root.appendChild(arrowDefs());

    const sch = box({ x: SCH_X, y: SCH_Y, w: SCH_W, h: SCH_H, label: 'kube-scheduler', sublabel: 'places Pods on nodes with room', cat: 'scaling' });

    const node1 = node({ x: NODE1_X, y: NODE_Y, w: NODE_W, h: NODE_H, label: 'node-1' });
    const node2 = node({ x: NODE2_X, y: NODE_Y, w: NODE_W, h: NODE_H, label: 'node-2' });

    // node1 slots 0..2, node2 slots 0..2 (six slots of capacity across the two nodes).
    const n1 = [0, 1, 2].map(i => makePod(slotX(NODE1_X, i), SLOT_Y, 'web'));
    const n2 = [0, 1, 2].map(i => makePod(slotX(NODE2_X, i), SLOT_Y, 'web'));
    const pods = n1.concat(n2);

    const pend = makePod(PEND_X, SLOT_Y, 'web');
    const pendSub = pend.shell.querySelector('.scheme-pod-sublabel');
    if (pendSub) pendSub.textContent = 'Pending';
    pend.wrap.style.opacity = '0';

    // The forward pointer: a Cluster Autoscaler that would add a node. It is outside this category,
    // so it and its arrow are built hidden and only surface, dim, on the final step.
    const auto = box({ x: AUTO_X, y: AUTO_Y, w: AUTO_W, h: AUTO_H, label: 'Cluster Autoscaler', sublabel: 'adds a node · outside scope', cat: 'scaling' });
    auto.style.opacity = '0';
    const autoArrow = laneWire([[PEND_CX + P_W / 2 + 4, SLOT_Y + P_H / 2], [AUTO_X - 4, AUTO_Y + AUTO_H / 2]]);
    autoArrow.setAttribute('marker-end', 'url(#arrowhead-scaling)');
    autoArrow.style.opacity = '0';

    const nodesChip = valChip({ x: 110, y: CHIPS_Y, w: 250, h: 34, name: 'nodes',     value: 'room', cat: 'scaling' });
    const pendChip  = valChip({ x: 390, y: CHIPS_Y, w: 300, h: 34, name: 'pending',   value: '0',    cat: 'scaling' });
    const schedChip = valChip({ x: 720, y: CHIPS_Y, w: 370, h: 34, name: 'scheduled', value: '3 / 3', cat: 'scaling' });

    const packetLayer = g({ id: 'packetLayer' });

    // Z-order: scheduler + node frames, Pods on top of the frames, the autoscaler + its arrow, the
    // chip strip, then the packet layer on top.
    [sch, node1, node2].forEach(el => root.appendChild(el));
    pods.forEach(p => root.appendChild(p.wrap));
    root.appendChild(pend.wrap);
    [autoArrow, auto].forEach(el => root.appendChild(el));
    [nodesChip, pendChip, schedChip].forEach(c => root.appendChild(c));
    root.appendChild(packetLayer);

    this.host.appendChild(root);
    this.refs = {
      svg: root, sch, node1, node2, pods, pend, auto, autoArrow,
      nodesChip, pendChip, schedChip,
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
function setChips(s, { nodes, pending, scheduled }) {
  setChip(s.refs.nodesChip, nodes);
  setChip(s.refs.pendChip, pending);
  setChip(s.refs.schedChip, scheduled);
}

// Idle seeds 2 Pods on node-1 (slots 0,1) and 1 on node-2 (slot 0 = index 3): three across two nodes.
const IDLE_SET = [0, 1, 3];

// setPodsSet pins an explicit set of running Pod indices; setPods(6) fills every slot. Slots 0..2 are
// node-1, 3..5 are node-2. Every slot is pinned to an explicit opacity so a mid-step cancel and
// reduced motion land on the right picture.
function setPodsSet(s, indices) {
  s.refs.pods.forEach((p, i) => {
    p.wrap.style.opacity = indices.includes(i) ? '1' : '0';
    p.wrap.style.transform = 'translate(0px, 0px)';
  });
  s.refs.pend.wrap.style.opacity = '0';
}
function setPods(s, visible) {
  setPodsSet(s, [0, 1, 2, 3, 4, 5].slice(0, visible));
}

function clearHL(s) {
  clearHighlights(s, ['sch', 'node1', 'node2', 'nodesChip', 'pendChip', 'schedChip'],
    s.refs.pods.map(p => p.wrap).concat([s.refs.pend.wrap]));
  s.refs.auto.style.opacity = '0';
  s.refs.autoArrow.style.opacity = '0';
}

const STEPS = [
  {
    id: 'idle',
    duration: 1500,
    narration: 'Two nodes back this workload, and it runs three Pods across them with slots to spare: two on node-1 and one on node-2. When the workload asks for more Pods, the scheduler is the component that finds a node with room and places each one.',
    enter(s) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setChips(s, { nodes: 'room', pending: '0', scheduled: '3 / 3' });
      setPodsSet(s, IDLE_SET);
    },
  },
  {
    id: 'grow',
    duration: 3600,
    narration: 'The workload scales up. The scheduler places three more Pods, filling the free slots until both nodes are full. Every new Pod finds a node with room, so the scheduler binds each one and it starts running.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setChips(s, { nodes: '2 of 2 full', pending: '0', scheduled: '6 / 6' });
      setPods(s, 6);
      s.refs.sch.classList.add('highlight');
      if (ctx.reduced) return;
      // Down-arrow: each create rides a lane from the scheduler into a free slot, carrying a bind
      // label, and the new Pod rises and fades in as the packet lands, then pulses. The three empty
      // slots are node-1 slot 2 and both free slots on node-2.
      const NEW = [2, 4, 5];
      NEW.forEach((i, k) => {
        const cx = slotCX(i < 3 ? NODE1_X : NODE2_X, i % 3);
        const lane = createLane(cx);
        s.refs.packetLayer.appendChild(laneWire(lane));
        const delay = BEAT.afterHop + k * 200;
        const pkt = routePacket(s, ctx, lane, { delay, cat: 'scaling' });
        ridingLabel(s, ctx, i < 3 ? 'bind node-1' : 'bind node-2', lane, { delay });
        const w = s.refs.pods[i].wrap;
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
    id: 'unschedulable',
    duration: 3000,
    narration: 'Now the workload wants a seventh Pod, but neither node has room for it. The scheduler checks every node, finds zero of two fit, and leaves the Pod Pending with the reason Unschedulable. It is a real Pod object, it simply has nowhere to run.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setChips(s, { nodes: '2 of 2 full', pending: '1 Unschedulable', scheduled: '6 / 7' });
      setPods(s, 6);
      s.refs.sch.classList.add('highlight');
      s.refs.pendChip.classList.add('highlight');
      // The scheduler checks every node and finds none fit, so it lights while it works. The seventh
      // Pod exists but cannot be placed, so it settles as a dim Pending ghost beside the full nodes.
      // It never pulses because it is not running. Pinned dim above the guard.
      s.refs.pend.wrap.style.opacity = '0.32';
      if (ctx.reduced) return;
      ctx.register(s.refs.pend.wrap.animate([{ opacity: 0 }, { opacity: 0.32 }], { duration: FADE.in, fill: 'forwards', easing: 'ease-out' }));
    },
  },
  {
    id: 'the-ceiling',
    duration: 2600,
    narration: 'This is the ceiling of scaling inside a fixed cluster. Both nodes are full, no amount of adding replicas will help, and the Pending Pod will wait until real capacity appears. In-cluster scaling can go no further on its own.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setChips(s, { nodes: '2 of 2 full', pending: '1 Unschedulable', scheduled: '6 / 7' });
      setPods(s, 6);
      s.refs.pend.wrap.style.opacity = '0.32';
      s.refs.nodesChip.classList.add('highlight');
      s.refs.pendChip.classList.add('highlight');
      // Packet-less and pod-less: flash the node frames and the ceiling chips so the frozen full
      // cluster reads as the point being made.
      if (ctx.reduced) return;
      flashChips(s, ctx, ['node1', 'node2', 'nodesChip', 'pendChip']);
    },
  },
  {
    id: 'beyond',
    duration: 3000,
    narration: 'Beyond that ceiling, a cluster autoscaler watches for these Pending Pods and adds a node so they can bind. That node-level autoscaler operates at the node and infrastructure layer, outside this category. This card marks the boundary where Pod scaling hands off to node scaling.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setChips(s, { nodes: '2 of 2 full', pending: '1 Unschedulable', scheduled: '6 / 7' });
      setPods(s, 6);
      s.refs.pend.wrap.style.opacity = '0.32';
      // The forward pointer surfaces, dim, off the right edge. It is a ghost because it is out of
      // scope, so it settles at a dim opacity and never highlights beyond that.
      s.refs.auto.style.opacity = '0.42';
      s.refs.autoArrow.style.opacity = '0.42';
      if (ctx.reduced) return;
      ctx.register(s.refs.autoArrow.animate([{ opacity: 0 }, { opacity: 0.42 }], { duration: FADE.in, fill: 'forwards', easing: 'ease-out' }));
      ctx.register(s.refs.auto.animate([{ opacity: 0 }, { opacity: 0.42 }], { duration: FADE.in, delay: 160, fill: 'forwards', easing: 'ease-out' }));
    },
  },
];

export const init = makeInit(Scene, STEPS, { posterFirst: true });
