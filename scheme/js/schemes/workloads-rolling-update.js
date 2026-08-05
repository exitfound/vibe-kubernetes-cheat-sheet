import { svg, g, rect, text } from '../lib/svg.js';
import { arrowDefs, pod, node, box, chainList, setChainActive, arrow, pathArrow } from '../lib/primitives.js';
import { routePacket, valChip, setVal, setBoxSublabel, pulsePod, topPacket, makeInit, clearHighlights, clearWires, setWire, relationPath, FADE, BEAT, lightBoxAt, OPACITY, WL } from '../lib/workloads-kit.js';

// Layout A on the Workloads canon (WL in the kit): ladder left, chip column right, Node frame
// full width at the bottom. Panel measured at x<=397, y<=205 (worst of 1600/1440/1280/1100).
// Design notes for this card: scheme/docs/CARDS.md#workloads-rolling-update
const PANEL_B = 205, PANEL_GAP = 21;

// The first actor box is centred on CX so the lane leaves its bottom midpoint and still drops
// down the corridor between the two columns.
const TOP1_X = 420, TOP1_W = 2 * (WL.CX - 420);          // 420..780, centred on CX
const TOP_GAP = 60;
const TOP2_X = TOP1_X + TOP1_W + TOP_GAP, TOP2_W = WL.R - (TOP1_X + TOP1_W + TOP_GAP);
const TOP_CY = WL.TOP_Y + WL.BOX_H / 2;
const REQ_Y = TOP_CY - WL.LANE_DY, RESP_Y = TOP_CY + WL.LANE_DY;
const WIRE_X = (TOP1_X + TOP1_W + TOP2_X) / 2;

const BAND_Y = PANEL_B + PANEL_GAP;                      // 226, both columns start here
const LAD_X = WL.LADDER_X, LAD_W = WL.LADDER_W;          // 60..540, the pipeline
const LAD_Y = BAND_Y;                                    // 6 rows -> 226..468

const CHIP_VGAP = 8;
const CHIP_Y = i => BAND_Y + i * (WL.CHIP_H + CHIP_VGAP);

const NODE_Y = 490, NODE_H = 134;                        // 490..624
// FOUR slots, not three, and that is the content of the card rather than a layout preference:
// maxSurge=1 means the rollout is transiently one Pod ABOVE .spec.replicas, which the surge step says
// in words and in its chip ("4 Pods alive"). With three slots the drawing showed three Pods against a
// chip counting four, so the card contradicted its own subject. The fourth slot is where the surge
// lands; each drain then frees a slot the next v2 takes, and the row ends with its leftmost slot empty
// because the surge capacity is released at the end.
const POD_W = 234, POD_H = 88, POD_Y = NODE_Y + 34;      // 524..612
const POD_PAD = 24;
const POD_INNER = { dx: 30, w: POD_W - 60, dy: 26, h: 48 };
const SLOT_N = 4;
const POD_XS = [0, 1, 2, 3].map(i => WL.L + POD_PAD + i * ((WL.W - POD_PAD * 2 - POD_W) / (SLOT_N - 1)));
const POD_CX = i => POD_XS[i] + POD_W / 2;               // 201 / 467 / 733 / 999

// Moving the trunk onto the API added 390 units and about 680ms to every ball that rides it, so
// the four steps that send one grew their duration to match: routeDur is length-based, and a
// start point is therefore a timing decision as much as a drawing one.
// The lane leaves the API, steps into the corridor between the two columns, runs along a bus above
// the Pod row and taps down into whichever Pod the step addresses. Wires and balls share these points.
//
// It leaves the API and not the Deployment, which is what every step here actually describes: the
// Deployment PATCHes .scale, and what appears or leaves on the Node is the API write taking effect
// through the ReplicaSet and Kubelet. The Deployment box stays centred on CX because the corridor
// runs there, but the trunk no longer hangs off it. Same shape as workloads-force-deletion.
const TOP2_CX = TOP2_X + TOP2_W / 2;                     // 990
const JOG_Y = WL.TOP_BOTTOM + 25;                        // 145, below the boxes, above both columns
const BUS_Y = NODE_Y + 12;
const TRUNK = [[TOP2_CX, WL.TOP_BOTTOM], [TOP2_CX, JOG_Y], [WL.CX, JOG_Y], [WL.CX, BUS_Y]];
const BUS = [[POD_CX(0), BUS_Y], [POD_CX(POD_XS.length - 1), BUS_Y]];
const TAP = i => [[POD_CX(i), BUS_Y], [POD_CX(i), POD_Y]];
const LANE = i => (POD_CX(i) === WL.CX
  ? [...TRUNK, [WL.CX, POD_Y]]
  : [...TRUNK, [POD_CX(i), BUS_Y], [POD_CX(i), POD_Y]]);

// A trunk segment carries the ball but is not its destination, so it is drawn without a marker:
// the arrowhead belongs on the tap that lands on a Pod.
function trunkPath(points) {
  return relationPath({ points, role: 'cluster', dash: '5 5' });
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
      'aria-label': 'Deployment rolling update: maxSurge surges a new ReplicaSet Pod first, maxUnavailable drains an old one once the new is Ready, repeat until converged',
      'data-style': 'outline',
    });
    root.appendChild(arrowDefs());

    const controller = box({ x: TOP1_X, y: WL.TOP_Y, w: TOP1_W, h: WL.BOX_H, label: 'Deployment', sublabel: 'scales RS-v1, RS-v2', role: 'cluster' });
    const apiserver  = box({ x: TOP2_X, y: WL.TOP_Y, w: TOP2_W, h: WL.BOX_H, label: 'API',     sublabel: 'PATCH .scale + Pod CRUD', role: 'cluster' });

    root.appendChild(arrow({ x1: TOP1_X + TOP1_W, y1: REQ_Y, x2: TOP2_X, y2: REQ_Y, dim: true, dashed: true, role: 'cluster' }));
    // The answer lane is a relationship here, not a route: no step on this card names anything
    // travelling back from the API, so it carries no arrowhead and sits behind the live lane.
    root.appendChild(relationPath({ points: [[TOP2_X, RESP_Y], [TOP1_X + TOP1_W, RESP_Y]], role: 'cluster' }));

    const wireReq = text({ class: 'scheme-label code dim', x: WIRE_X, y: WL.TOP_Y - 12, 'text-anchor': 'middle' }, [' ']);
    root.appendChild(wireReq);

    const v1Chip       = valChip({ x: WL.CHIP_X, y: CHIP_Y(0), w: WL.CHIP_W, h: WL.CHIP_H, name: 'RS-v1 (old) · Ready', value: '3 / 3', role: 'workloads' });
    const v2Chip       = valChip({ x: WL.CHIP_X, y: CHIP_Y(1), w: WL.CHIP_W, h: WL.CHIP_H, name: 'RS-v2 (new) · Ready', value: '0 / 0', role: 'workloads' });
    const surgeChip    = valChip({ x: WL.CHIP_X, y: CHIP_Y(2), w: WL.CHIP_W, h: WL.CHIP_H, name: 'maxSurge · maxUnavailable', value: '1 · 1', role: 'workloads' });
    const progressChip = valChip({ x: WL.CHIP_X, y: CHIP_Y(3), w: WL.CHIP_W, h: WL.CHIP_H, name: 'rollout',  value: 'idle', role: 'workloads' });
    [v1Chip, v2Chip, surgeChip, progressChip].forEach(c => root.appendChild(c));

    // Pipeline chain, 6 stages of the rolling update cycle.
    const chain = chainList({
      x: LAD_X, y: LAD_Y, w: LAD_W, rowH: WL.ROW_H, gap: WL.ROW_GAP,
      items: [
        '1. spec      ·  image v1.0 → v2.0 patch',
        '2. surge     ·  create v2 Pod (maxSurge=1)',
        '3. probe     ·  readinessProbe marks Ready',
        '4. drain     ·  terminate v1 Pod (maxUnavailable=1)',
        '5. repeat    ·  surge + drain per old replica',
        '6. converged ·  3 v2 Ready, RS-v1 scaled to 0',
      ],
      role: 'cluster',
    });

    const nodeEl = node({ x: WL.L, y: NODE_Y, w: WL.W, h: NODE_H, label: 'Node-1' });

    // Random suffixes, as a Deployment really gives them, and the same shape workloads-replicaset
    // uses. Ordinals would imply an age order the drawing never establishes, while the narration
    // says the controller picks the OLDEST Pod.
    const POD_NAMES = ['web-a1', 'web-b2', 'web-c3', 'web-d4'];
    const podBoxes = [];
    const podWrappers = POD_XS.map((px, i) => {
      const shell = pod({ x: px, y: POD_Y, w: POD_W, h: POD_H, label: POD_NAMES[i], sublabel: '', containers: 0, role: 'workloads' });
      const shellRect = shell.querySelector('.scheme-pod-rect');
      if (shellRect) shellRect.style.fill = 'rgba(255, 255, 255, 0.03)';

      const innerBox = box({ x: px + POD_INNER.dx, y: POD_Y + POD_INNER.dy, w: POD_INNER.w, h: POD_INNER.h, label: 'app', sublabel: 'v1.0', role: 'workloads' });

      const wrap = g({ id: `pod${i + 1}` });
      wrap.appendChild(shell);
      wrap.appendChild(innerBox);
      podBoxes.push(innerBox);
      return wrap;
    });
    const [pod1, pod2, pod3, pod4] = podWrappers;
    const [pod1Box, pod2Box, pod3Box, pod4Box] = podBoxes;

    // Trunk and bus carry the ball, the taps land it on a Pod: only the taps take an arrowhead.
    const trunk = trunkPath(TRUNK);
    const bus = trunkPath(BUS);
    const taps = POD_XS.map((_, i) => pathArrow({ points: TAP(i), dim: true, dashed: true, role: 'cluster' }));

    const packetLayer = g({ id: 'packetLayer' });

    // Z-order: the Node frame is a 70% opaque fill, so the bus that runs inside it and the balls
    // that ride it are appended after it. Ladder, Pods and the actor row sit above the packets.
    root.appendChild(nodeEl);
    [trunk, bus, ...taps].forEach(w => root.appendChild(w));
    root.appendChild(packetLayer);
    root.appendChild(chain);
    [pod1, pod2, pod3, pod4].forEach(p => root.appendChild(p));
    root.appendChild(apiserver);
    root.appendChild(controller);

    this.host.appendChild(root);
    this.refs = {
      svg: root,
      controller, apiserver, chain, nodeEl, trunk, bus, taps,
      v1Chip, v2Chip, surgeChip, progressChip,
      pod1, pod2, pod3, pod4, pod1Box, pod2Box, pod3Box, pod4Box,
      packetLayer,
      wires: { req: wireReq },
    };
  }

  reset() { this.build(); }
}

function clearHL(s) {
  clearHighlights(s,
    ['controller','apiserver','v1Chip','v2Chip','surgeChip','progressChip','pod1Box','pod2Box','pod3Box','pod4Box'],
    [s.refs.pod1, s.refs.pod2, s.refs.pod3, s.refs.pod4]);
}
// A slot's version and its presence are one fact, so one helper writes both: `null` means the slot is
// not occupied on this step. Two separate assignments are how a row comes to show more Pods alive than
// its own chip counts.
function setSlots(s, ...slots) {
  slots.forEach((v, i) => {
    const pod = s.refs['pod' + (i + 1)];
    if (v === null) { pod.style.opacity = '0'; return; }
    pod.style.opacity = String(v.op === undefined ? 1 : v.op);
    setBoxSublabel(s.refs['pod' + (i + 1) + 'Box'], v.v);
  });
}
const V1 = { v: 'v1.0' }, V2 = { v: 'v2.0 · Ready' }, V2_NEW = { v: 'v2.0 · starting' };
const GOING = { v: 'terminating', op: OPACITY.terminating };

const STEPS = [
  {
    id: 'idle',
    duration: 1500,
    enter(s) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setSlots(s, V1, V1, V1, null);
      setVal(s.refs.v1Chip, '3 / 3');
      setVal(s.refs.v2Chip, '0 / 0');
      setVal(s.refs.surgeChip, '1 · 1');
      setVal(s.refs.progressChip, 'idle');
      setChainActive(s.refs.chain, -1);
    },
  },
  {
    id: 'spec',
    duration: 1900,
    narration: 'You run kubectl set image deployment/web app=v2.0, which PATCHes .spec.template. The new template hash differs, so the Deployment controller creates ReplicaSet RS-v2 with replicas=0. RS-v1 still owns all 3 live Pods, no churn yet.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setSlots(s, V1, V1, V1, null);
      setVal(s.refs.v1Chip, '3 / 3');
      setVal(s.refs.v2Chip, '0 / 0');
      setVal(s.refs.progressChip, 'spec PATCHed · RS-v2 created');
      setWire(s, 'req', 'PATCH .spec.template · New RS-v2');
      s.refs.controller.classList.add('highlight');
      s.refs.progressChip.classList.add('highlight');
      setChainActive(s.refs.chain, 0);
      if (ctx.reduced) { s.refs.apiserver.classList.add('highlight'); return; }
      const pkt = topPacket(s, ctx, { from: TOP1_X + TOP1_W, to: TOP2_X, y: REQ_Y, role: 'workloads' });
      lightBoxAt(s.refs.apiserver, ctx, pkt.arrivalMs);
    },
  },
  {
    id: 'surge',
    duration: 4500,
    narration: 'Setting maxSurge=1 lets the controller scale RS-v2 from 0 to 1 before any old Pod leaves. A fresh v2.0 Pod is created on Node-1, Kubelet starts the container. Total live Pods is now 4 (3 v1 plus 1 surge), 1 above .spec.replicas.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setSlots(s, V1, V1, V1, V2_NEW);
      setVal(s.refs.v1Chip, '3 / 3');
      setVal(s.refs.v2Chip, '0 / 1');
      setVal(s.refs.progressChip, 'surged +1 · 4 Pods alive');
      setWire(s, 'req', 'scale RS-v2 replicas: 0 → 1');
      s.refs.controller.classList.add('highlight');
      s.refs.v2Chip.classList.add('highlight');
      s.refs.progressChip.classList.add('highlight');
      setChainActive(s.refs.chain, 1);
      if (ctx.reduced) { s.refs.pod4Box.classList.add('highlight'); s.refs.apiserver.classList.add('highlight'); return; }
      // kubectl-style scale PATCH reaches Api, then the create flows down to the node.
      const patch = topPacket(s, ctx, { from: TOP1_X + TOP1_W, to: TOP2_X, y: REQ_Y, role: 'workloads' });
      lightBoxAt(s.refs.apiserver, ctx, patch.arrivalMs);
      // The surge Pod is created in the FOURTH slot, beside the three v1 Pods rather than on top of
      // one of them: that is what being one above .spec.replicas looks like.
      const create = routePacket(s, ctx, LANE(3), { delay: patch.arrivalMs + BEAT.afterHop, role: 'workloads' });
      pulsePod(s.refs.pod4, ctx, create.arrivalMs);
    },
  },
  {
    id: 'probe-and-drain',
    duration: 4500,
    narration: 'The new Pod becomes Ready (readinessProbe passes successThreshold times). RS-v2 sees Ready=1. Now maxUnavailable=1 allows scaling RS-v1 from 3 down to 2, the controller picks the oldest Pod and triggers a graceful delete (preStop, then SIGTERM, then grace period).',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setSlots(s, V1, V1, GOING, V2);
      setVal(s.refs.v1Chip, '2 / 2');
      setVal(s.refs.v2Chip, '1 / 1');
      setVal(s.refs.progressChip, 'replaced 1/3 · 3 Pods alive');
      setWire(s, 'req', 'scale RS-v1 replicas: 3 → 2');
      s.refs.apiserver.classList.add('highlight');
      s.refs.v1Chip.classList.add('highlight');
      s.refs.v2Chip.classList.add('highlight');
      s.refs.progressChip.classList.add('highlight');
      setChainActive(s.refs.chain, 2);
      if (ctx.reduced) { s.refs.pod4Box.classList.add('highlight'); return; }
      // Readiness comes FIRST and is the precondition, which is what the narration says: the new v2
      // Pod confirms Ready, and only then does maxUnavailable allow the scale-down to travel to the
      // node and take the oldest v1 Pod. Both used to pulse on the same arrival, which drew the
      // permission and the thing it permits as one event.
      pulsePod(s.refs.pod4, ctx, 0);
      const drain = routePacket(s, ctx, LANE(2), { delay: BEAT.afterPulse, role: 'workloads' });
      s.refs.pod3.style.opacity = '1';
      pulsePod(s.refs.pod3, ctx, drain.arrivalMs);
      ctx.register(s.refs.pod3.animate([{ opacity: 1 }, { opacity: OPACITY.terminating }], { duration: FADE.out, delay: drain.arrivalMs, fill: 'both', easing: 'ease-in' }));
    },
  },
  {
    id: 'second-cycle',
    // Motion: the surge into the freed slot lands, then the next old Pod drains: 5920ms. A cycle is now TWO events, a surge and a
    // drain, where the three-slot version could only draw one.
    duration: 6200,
    narration: 'Same dance again: surge one more v2 Pod into the room the last drain gave back, wait for Ready, drain the next old v1. The controller does not move to a third replacement until this one is committed, so the rollout proceeds one Pod at a time.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setSlots(s, V1, GOING, V2, V2);
      setVal(s.refs.v1Chip, '1 / 1');
      setVal(s.refs.v2Chip, '2 / 2');
      setVal(s.refs.progressChip, 'replaced 2/3 · 3 Pods alive');
      setWire(s, 'req', 'scale RS-v2: 1 → 2 · Scale RS-v1: 2 → 1');
      s.refs.controller.classList.add('highlight');
      s.refs.v1Chip.classList.add('highlight');
      s.refs.v2Chip.classList.add('highlight');
      s.refs.progressChip.classList.add('highlight');
      setChainActive(s.refs.chain, 3);
      if (ctx.reduced) { s.refs.pod3Box.classList.add('highlight'); s.refs.apiserver.classList.add('highlight'); return; }
      // Scale PATCH reaches Api, then the create flows down into the slot the previous drain freed:
      // the surge is always one Pod, so it reuses the room the last old Pod gave back.
      const patch = topPacket(s, ctx, { from: TOP1_X + TOP1_W, to: TOP2_X, y: REQ_Y, role: 'workloads' });
      lightBoxAt(s.refs.apiserver, ctx, patch.arrivalMs);
      s.refs.pod3.style.opacity = String(OPACITY.terminating);
      s.refs.pod2.style.opacity = '1';
      const create = routePacket(s, ctx, LANE(2), { delay: patch.arrivalMs + BEAT.afterHop, role: 'workloads' });
      ctx.register(s.refs.pod3.animate([{ opacity: OPACITY.terminating }, { opacity: 1 }], { duration: FADE.in, delay: create.arrivalMs, fill: 'both', easing: 'ease-out' }));
      pulsePod(s.refs.pod3, ctx, create.arrivalMs);
      // and the next old Pod leaves on the same beat the new one lands
      const drain = routePacket(s, ctx, LANE(1), { delay: create.arrivalMs + BEAT.afterHop, role: 'workloads' });
      pulsePod(s.refs.pod2, ctx, drain.arrivalMs);
      ctx.register(s.refs.pod2.animate([{ opacity: 1 }, { opacity: OPACITY.terminating }], { duration: FADE.out, delay: drain.arrivalMs, fill: 'both', easing: 'ease-in' }));
    },
  },
  {
    id: 'third-cycle',
    // Motion: the final surge lands, then the last v1 drains: 6460ms. A cycle is now TWO events, a surge and a
    // drain, where the three-slot version could only draw one.
    duration: 6800,
    narration: 'Last cycle: surge the final v2 Pod, wait for Ready, drain the last v1. The Deployment status moves to .status.updatedReplicas=3, observedGeneration catches up to .metadata.generation, and the condition Progressing=True is set with reason NewReplicaSetAvailable.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setSlots(s, GOING, V2, V2, V2);
      setVal(s.refs.v1Chip, '0 / 0');
      setVal(s.refs.v2Chip, '3 / 3');
      setVal(s.refs.progressChip, 'replaced 3/3 · 3 Pods alive');
      setWire(s, 'req', 'scale RS-v2: 2 → 3 · Scale RS-v1: 1 → 0');
      s.refs.apiserver.classList.add('highlight');
      s.refs.v1Chip.classList.add('highlight');
      s.refs.v2Chip.classList.add('highlight');
      s.refs.progressChip.classList.add('highlight');
      setChainActive(s.refs.chain, 4);
      if (ctx.reduced) { s.refs.pod2Box.classList.add('highlight'); return; }
      // The last cycle: the final v2 lands in the slot the second drain freed, and the last v1 leaves.
      s.refs.pod2.style.opacity = String(OPACITY.terminating);
      s.refs.pod1.style.opacity = '1';
      const create = routePacket(s, ctx, LANE(1), { delay: BEAT.lead, role: 'workloads' });
      ctx.register(s.refs.pod2.animate([{ opacity: OPACITY.terminating }, { opacity: 1 }], { duration: FADE.in, delay: create.arrivalMs, fill: 'both', easing: 'ease-out' }));
      pulsePod(s.refs.pod2, ctx, create.arrivalMs);
      const drain = routePacket(s, ctx, LANE(0), { delay: create.arrivalMs + BEAT.afterHop, role: 'workloads' });
      pulsePod(s.refs.pod1, ctx, drain.arrivalMs);
      ctx.register(s.refs.pod1.animate([{ opacity: 1 }, { opacity: OPACITY.terminating }], { duration: FADE.out, delay: drain.arrivalMs, fill: 'both', easing: 'ease-in' }));
    },
  },
  {
    id: 'converged',
    duration: 2200,
    narration: 'RS-v2 owns 3 Ready Pods, RS-v1 sits at replicas=0 but is retained for revisionHistoryLimit (default 10) so kubectl rollout undo can flip back in one PATCH. Deployment condition Available=True, rollout complete.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setSlots(s, null, V2, V2, V2);
      setVal(s.refs.v1Chip, '0 / 0 (retained)');
      s.refs.v1Chip.classList.add('highlight');
      setVal(s.refs.v2Chip, '3 / 3');
      setVal(s.refs.progressChip, 'Complete · Available=True');
      s.refs.progressChip.classList.add('highlight');
      setChainActive(s.refs.chain, 5);
      if (ctx.reduced) { ['pod2Box','pod3Box','pod4Box'].forEach(k => s.refs[k].classList.add('highlight')); return; }
      // Rollout converged: the three live v2 Pods sit in slots 2, 3 and 4, because the surge capacity
      // is released from the LEFTMOST slot. Pulse those three (the pulse fades back to the resting
      // outline), never slot 1, which setSlots has just emptied.
      pulsePod(s.refs.pod2, ctx, 0);
      pulsePod(s.refs.pod3, ctx, 0);
      pulsePod(s.refs.pod4, ctx, 0);
    },
  },
];

export const init = makeInit(Scene, STEPS, { posterFirst: true });
