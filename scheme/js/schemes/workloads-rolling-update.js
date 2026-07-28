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
const POD_W = 300, POD_H = 88, POD_Y = NODE_Y + 34;      // 524..612
const POD_PAD = 24;
const POD_INNER = { dx: 30, w: POD_W - 60, dy: 26, h: 48 };
const POD_XS = [0, 1, 2].map(i => WL.L + POD_PAD + i * ((WL.W - POD_PAD * 2 - POD_W) / 2));
const POD_CX = i => POD_XS[i] + POD_W / 2;               // 234 / 600 / 966

// The lane drops from the controller into the Node frame, runs along a bus above the Pod row
// and taps down into whichever Pod the step addresses. Wires and balls share these points.
const BUS_Y = NODE_Y + 12;
const TRUNK = [[WL.CX, WL.TOP_BOTTOM], [WL.CX, BUS_Y]];
const BUS = [[POD_CX(0), BUS_Y], [POD_CX(POD_XS.length - 1), BUS_Y]];
const TAP = i => [[POD_CX(i), BUS_Y], [POD_CX(i), POD_Y]];
const LANE = i => (POD_CX(i) === WL.CX
  ? [[WL.CX, WL.TOP_BOTTOM], [WL.CX, POD_Y]]
  : [[WL.CX, WL.TOP_BOTTOM], [WL.CX, BUS_Y], [POD_CX(i), BUS_Y], [POD_CX(i), POD_Y]]);

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
    root.appendChild(arrow({ x1: TOP2_X, y1: RESP_Y, x2: TOP1_X + TOP1_W, y2: RESP_Y, dim: true, dashed: true, role: 'cluster' }));

    const wireReq = text({ class: 'scheme-label code dim', x: WIRE_X, y: WL.TOP_Y - 12, 'text-anchor': 'middle', 'font-size': 9 }, [' ']);
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

    const POD_NAMES = ['web-1', 'web-2', 'web-3'];
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
    const [pod1, pod2, pod3] = podWrappers;
    const [pod1Box, pod2Box, pod3Box] = podBoxes;

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
    [pod1, pod2, pod3].forEach(p => root.appendChild(p));
    root.appendChild(apiserver);
    root.appendChild(controller);

    this.host.appendChild(root);
    this.refs = {
      svg: root,
      controller, apiserver, chain, nodeEl, trunk, bus, taps,
      v1Chip, v2Chip, surgeChip, progressChip,
      pod1, pod2, pod3, pod1Box, pod2Box, pod3Box,
      packetLayer,
      wires: { req: wireReq },
    };
  }

  reset() { this.build(); }
}

function clearHL(s) {
  clearHighlights(s,
    ['controller','apiserver','v1Chip','v2Chip','surgeChip','progressChip','pod1Box','pod2Box','pod3Box'],
    [s.refs.pod1, s.refs.pod2, s.refs.pod3]);
}
function setVersions(s, a, b, c) {
  setBoxSublabel(s.refs.pod1Box, a);
  setBoxSublabel(s.refs.pod2Box, b);
  setBoxSublabel(s.refs.pod3Box, c);
}
function resetPodOpacity(s) {
  ['pod1','pod2','pod3'].forEach(k => { s.refs[k].style.opacity = '1'; });
}

const STEPS = [
  {
    id: 'idle',
    duration: 1500,
    narration: 'A Deployment owns a ReplicaSet (RS-v1) at replicas=3, all Pods running image v1.0 and Ready. Strategy is RollingUpdate with maxSurge=1 and maxUnavailable=1, so during a rollout the cluster will hold between 2 and 4 Pods alive while the swap happens.',
    enter(s) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      resetPodOpacity(s);
      setVersions(s, 'v1.0', 'v1.0', 'v1.0');
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
      resetPodOpacity(s);
      setVersions(s, 'v1.0', 'v1.0', 'v1.0');
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
    duration: 3600,
    narration: 'Setting maxSurge=1 lets the controller scale RS-v2 from 0 to 1 before any old Pod leaves. A fresh v2.0 Pod is created on Node-1, Kubelet starts the container. Total live Pods is now 4 (3 v1 plus 1 surge), 1 above .spec.replicas.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      resetPodOpacity(s);
      setVersions(s, 'v2.0 · starting', 'v1.0', 'v1.0');
      setVal(s.refs.v1Chip, '3 / 3');
      setVal(s.refs.v2Chip, '0 / 1');
      setVal(s.refs.progressChip, 'surged +1 · 4 Pods alive');
      setWire(s, 'req', 'scale RS-v2 replicas: 0 → 1');
      s.refs.controller.classList.add('highlight');
      s.refs.v2Chip.classList.add('highlight');
      s.refs.progressChip.classList.add('highlight');
      setChainActive(s.refs.chain, 1);
      if (ctx.reduced) { s.refs.pod1Box.classList.add('highlight'); s.refs.apiserver.classList.add('highlight'); return; }
      // kubectl-style scale PATCH reaches Api, then the create flows down to the node.
      const patch = topPacket(s, ctx, { from: TOP1_X + TOP1_W, to: TOP2_X, y: REQ_Y, role: 'workloads' });
      lightBoxAt(s.refs.apiserver, ctx, patch.arrivalMs);
      // New v2 Pod is created in slot web-1: the ball travels down, the Pod pulses on arrival.
      const create = routePacket(s, ctx, LANE(0), { delay: patch.arrivalMs + BEAT.afterHop, role: 'workloads' });
      pulsePod(s.refs.pod1, ctx, create.arrivalMs);
    },
  },
  {
    id: 'probe-and-drain',
    duration: 3600,
    narration: 'The new Pod becomes Ready (readinessProbe passes successThreshold times). RS-v2 sees Ready=1. Now maxUnavailable=1 allows scaling RS-v1 from 3 down to 2, the controller picks the oldest Pod and triggers a graceful delete (preStop, then SIGTERM, then grace period).',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      resetPodOpacity(s);
      setVersions(s, 'v2.0 · Ready', 'v1.0', 'terminating');
      setVal(s.refs.v1Chip, '2 / 2');
      setVal(s.refs.v2Chip, '1 / 1');
      setVal(s.refs.progressChip, 'replaced 1/3 · 3 Pods alive');
      setWire(s, 'req', 'scale RS-v1 replicas: 3 → 2');
      s.refs.apiserver.classList.add('highlight');
      s.refs.v1Chip.classList.add('highlight');
      s.refs.v2Chip.classList.add('highlight');
      s.refs.progressChip.classList.add('highlight');
      setChainActive(s.refs.chain, 2);
      if (ctx.reduced) { s.refs.pod3.style.opacity = String(OPACITY.terminating); s.refs.pod1Box.classList.add('highlight'); return; }
      // Scale-down delete travels to the node. On arrival the new v2 Pod (web-1) confirms
      // Ready with a pulse, and the oldest v1 Pod (web-3) begins terminating and fades out.
      const drain = routePacket(s, ctx, LANE(2), { delay: BEAT.lead, role: 'workloads' });
      pulsePod(s.refs.pod1, ctx, drain.arrivalMs);
      pulsePod(s.refs.pod3, ctx, drain.arrivalMs);
      ctx.register(s.refs.pod3.animate([{ opacity: 1 }, { opacity: OPACITY.terminating }], { duration: FADE.out, delay: drain.arrivalMs, fill: 'both', easing: 'ease-in' }));
    },
  },
  {
    id: 'second-cycle',
    duration: 3100,
    narration: 'Same dance for slot web-2: surge a new v2 Pod, wait for Ready, drain the old v1. The controller does not move to a third replacement until this one is committed, so the rollout proceeds one Pod at a time.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      resetPodOpacity(s);
      setVersions(s, 'v2.0 · Ready', 'v2.0 · Ready', 'terminating');
      setVal(s.refs.v1Chip, '1 / 1');
      setVal(s.refs.v2Chip, '2 / 2');
      setVal(s.refs.progressChip, 'replaced 2/3 · 3 Pods alive');
      setWire(s, 'req', 'scale RS-v2: 1 → 2 · Scale RS-v1: 2 → 1');
      s.refs.controller.classList.add('highlight');
      s.refs.v1Chip.classList.add('highlight');
      s.refs.v2Chip.classList.add('highlight');
      s.refs.progressChip.classList.add('highlight');
      setChainActive(s.refs.chain, 3);
      // web-3 is still draining from the previous cycle: hold it dimmed.
      s.refs.pod3.style.opacity = String(OPACITY.terminating);
      if (ctx.reduced) { s.refs.pod2Box.classList.add('highlight'); s.refs.apiserver.classList.add('highlight'); return; }
      // Scale PATCH reaches Api, then the create flows down to slot web-2.
      const patch = topPacket(s, ctx, { from: TOP1_X + TOP1_W, to: TOP2_X, y: REQ_Y, role: 'workloads' });
      lightBoxAt(s.refs.apiserver, ctx, patch.arrivalMs);
      // New v2 Pod in slot web-2 reaches the node and pulses Ready on arrival.
      const create = routePacket(s, ctx, LANE(1), { delay: patch.arrivalMs + BEAT.afterHop, role: 'workloads' });
      pulsePod(s.refs.pod2, ctx, create.arrivalMs);
    },
  },
  {
    id: 'third-cycle',
    duration: 3600,
    narration: 'Last slot web-3: surge final v2 Pod, wait for Ready, drain the last v1. The Deployment status moves to .status.updatedReplicas=3, observedGeneration catches up to .metadata.generation, and the condition Progressing=True is set with reason NewReplicaSetAvailable.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      resetPodOpacity(s);
      setVersions(s, 'v2.0 · Ready', 'v2.0 · Ready', 'v2.0 · Ready');
      setVal(s.refs.v1Chip, '0 / 0');
      setVal(s.refs.v2Chip, '3 / 3');
      setVal(s.refs.progressChip, 'replaced 3/3 · 3 Pods alive');
      setWire(s, 'req', 'scale RS-v2: 2 → 3 · Scale RS-v1: 1 → 0');
      s.refs.apiserver.classList.add('highlight');
      s.refs.v1Chip.classList.add('highlight');
      s.refs.v2Chip.classList.add('highlight');
      s.refs.progressChip.classList.add('highlight');
      setChainActive(s.refs.chain, 4);
      // web-3 is re-filled as a v2 Pod: it starts dimmed from the prior drain and lifts to full.
      s.refs.pod3.style.opacity = String(OPACITY.terminating);
      if (ctx.reduced) { s.refs.pod3.style.opacity = '1'; s.refs.pod3Box.classList.add('highlight'); return; }
      // Final v2 Pod is created in slot web-3: ball travels down, the Pod lifts to full and pulses on arrival.
      const create = routePacket(s, ctx, LANE(2), { delay: BEAT.lead, role: 'workloads' });
      ctx.register(s.refs.pod3.animate([{ opacity: OPACITY.terminating }, { opacity: 1 }], { duration: FADE.in, delay: create.arrivalMs, fill: 'both', easing: 'ease-out' }));
      pulsePod(s.refs.pod3, ctx, create.arrivalMs);
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
      resetPodOpacity(s);
      setVersions(s, 'v2.0 · Ready', 'v2.0 · Ready', 'v2.0 · Ready');
      setVal(s.refs.v1Chip, '0 / 0 (retained)');
      s.refs.v1Chip.classList.add('highlight');
      setVal(s.refs.v2Chip, '3 / 3');
      setVal(s.refs.progressChip, 'Complete · Available=True');
      s.refs.progressChip.classList.add('highlight');
      setChainActive(s.refs.chain, 5);
      if (ctx.reduced) { ['pod1Box','pod2Box','pod3Box'].forEach(k => s.refs[k].classList.add('highlight')); return; }
      // Rollout converged: all three v2 Pods are Ready, pulse them together (the pulse fades back to the resting outline).
      pulsePod(s.refs.pod1, ctx, 0);
      pulsePod(s.refs.pod2, ctx, 0);
      pulsePod(s.refs.pod3, ctx, 0);
    },
  },
];

export const init = makeInit(Scene, STEPS, { posterFirst: true });
