import { svg, g, rect, text } from '../lib/svg.js';
import { arrowDefs, pod, node, box, chainList, setChainActive, arrow, pathArrow } from '../lib/primitives.js';
import { routePacket, valChip, setVal, pulsePod, topPacket, makeInit, clearHighlights, clearWires, setWire, relationPath, FADE, BEAT, lightBoxAt, WL } from '../lib/workloads-kit.js';

// Layout A on the Workloads canon (WL in the kit): ladder left, chip column right, Node frame
// full width at the bottom. Panel measured at x<=397, y<=255 (worst of 1600/1440/1280/1100).
// Design notes for this card: scheme/docs/CARDS.md#workloads-statefulset-ordered-startup
const PANEL_B = 255, PANEL_GAP = 21;

// The controller is centred on CX so the lane leaves its bottom midpoint and drops down the
// corridor between the two columns. The headless Service hangs under the Api, not beside it.
const TOP1_X = 420, TOP1_W = 2 * (WL.CX - 420);          // 420..780, centred on CX
const TOP_GAP = 60;
const TOP2_X = TOP1_X + TOP1_W + TOP_GAP, TOP2_W = WL.R - (TOP1_X + TOP1_W + TOP_GAP);
const TOP_CY = WL.TOP_Y + WL.BOX_H / 2;
const REQ_Y = TOP_CY - WL.LANE_DY, RESP_Y = TOP_CY + WL.LANE_DY;
const WIRE_X = (TOP1_X + TOP1_W + TOP2_X) / 2;
const SVC_X = TOP2_X, SVC_W = TOP2_W, SVC_Y = 152, SVC_H = WL.BOX_H;
const SVC_CX = SVC_X + SVC_W / 2;

const BAND_Y = PANEL_B + PANEL_GAP;                      // 276, both columns start here
const LAD_X = WL.LADDER_X, LAD_W = WL.LADDER_W;          // 60..540, the pipeline
const LAD_Y = BAND_Y;                                    // 5 rows -> 276..476

const CHIP_VGAP = 8;
const CHIP_Y = i => BAND_Y + i * (WL.CHIP_H + CHIP_VGAP);

const NODE_Y = 496, NODE_H = 128;                        // 496..624
const POD_W = 300, POD_H = 82, POD_Y = NODE_Y + 34;      // 530..612
const POD_PAD = 24;
const POD_INNER = { dx: 30, w: POD_W - 60, dy: 24, h: 46 };
const POD_XS = [0, 1, 2].map(i => WL.L + POD_PAD + i * ((WL.W - POD_PAD * 2 - POD_W) / 2));
const POD_CX = i => POD_XS[i] + POD_W / 2;               // 234 / 600 / 966

// The lane drops from the controller into the Node frame, runs along a bus above the Pod row
// and taps down into the ordinal the step creates. Wires and balls share these points.
const BUS_Y = NODE_Y + 12;
const TRUNK = [[WL.CX, WL.TOP_BOTTOM], [WL.CX, BUS_Y]];
// The bus is split at the centre slot: each half, like each tap, belongs to an ordinal that does
// not exist until the rollout reaches it, and a lane into an absent Pod points at nothing.
const BUS_L = [[POD_CX(0), BUS_Y], [POD_CX(1), BUS_Y]];
const BUS_R = [[POD_CX(1), BUS_Y], [POD_CX(2), BUS_Y]];
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
      'aria-label': 'StatefulSet ordered rollout: Pods start one at a time in ordinal order, each gets a sticky hostname and PVC',
      'data-style': 'outline',
    });
    root.appendChild(arrowDefs());

    const controller = box({ x: TOP1_X, y: WL.TOP_Y, w: TOP1_W, h: WL.BOX_H, label: 'StatefulSet', sublabel: 'serial scale-up', role: 'cluster' });
    const apiserver  = box({ x: TOP2_X, y: WL.TOP_Y, w: TOP2_W, h: WL.BOX_H, label: 'API',       sublabel: 'PVC + Pod CRUD',     role: 'cluster' });
    const svc        = box({ x: SVC_X, y: SVC_Y, w: SVC_W, h: SVC_H, label: 'Service web',     sublabel: 'clusterIP=None (headless)', role: 'cluster' });

    root.appendChild(arrow({ x1: TOP1_X + TOP1_W, y1: REQ_Y, x2: TOP2_X, y2: REQ_Y, dim: true, dashed: true, role: 'cluster' }));
    root.appendChild(arrow({ x1: TOP2_X, y1: RESP_Y, x2: TOP1_X + TOP1_W, y2: RESP_Y, dim: true, dashed: true, role: 'cluster' }));
    root.appendChild(arrow({ x1: SVC_CX, y1: WL.TOP_BOTTOM, x2: SVC_CX, y2: SVC_Y, dim: true, dashed: true, role: 'cluster' }));

    const wireReq = text({ class: 'scheme-label code dim', x: WIRE_X, y: WL.TOP_Y - 12, 'text-anchor': 'middle', 'font-size': 9 }, [' ']);
    const wireSvc = text({ class: 'scheme-label code dim', x: SVC_CX, y: SVC_Y + SVC_H + 16, 'text-anchor': 'middle', 'font-size': 9 }, [' ']);
    [wireReq, wireSvc].forEach(t => root.appendChild(t));

    const web0Chip = valChip({ x: WL.CHIP_X, y: CHIP_Y(0), w: WL.CHIP_W, h: WL.CHIP_H, name: 'web-0',  value: 'pending', role: 'workloads' });
    const web1Chip = valChip({ x: WL.CHIP_X, y: CHIP_Y(1), w: WL.CHIP_W, h: WL.CHIP_H, name: 'web-1',  value: 'not created', role: 'workloads' });
    const web2Chip = valChip({ x: WL.CHIP_X, y: CHIP_Y(2), w: WL.CHIP_W, h: WL.CHIP_H, name: 'web-2',  value: 'not created', role: 'workloads' });
    const focusChip= valChip({ x: WL.CHIP_X, y: CHIP_Y(3), w: WL.CHIP_W, h: WL.CHIP_H, name: 'focus',  value: 'none', role: 'workloads' });
    [web0Chip, web1Chip, web2Chip, focusChip].forEach(c => root.appendChild(c));

    const chain = chainList({
      x: LAD_X, y: LAD_Y, w: LAD_W, rowH: WL.ROW_H, gap: WL.ROW_GAP,
      items: [
        '1. spec       ·  replicas=3, volumeClaimTemplate: data',
        '2. ordinal 0  ·  PVC data-web-0 bound, web-0 created',
        '3. ordering   ·  ordinal N+1 blocked until N is Ready',
        '4. ordinal 1  ·  PVC data-web-1, web-1 after web-0 Ready',
        '5. ordinal 2  ·  PVC data-web-2, web-2 after web-1 Ready',
      ],
      role: 'cluster',
    });

    const nodeEl = node({ x: WL.L, y: NODE_Y, w: WL.W, h: NODE_H, label: 'Node-1' });

    const POD_NAMES = ['web-0', 'web-1', 'web-2'];
    const POD_PVCS  = ['data-web-0', 'data-web-1', 'data-web-2'];
    const podBoxes = [];
    const podWrappers = POD_XS.map((px, i) => {
      const shell = pod({ x: px, y: POD_Y, w: POD_W, h: POD_H, label: POD_NAMES[i], sublabel: '', containers: 0, role: 'workloads' });
      const shellRect = shell.querySelector('.scheme-pod-rect');
      if (shellRect) shellRect.style.fill = 'rgba(255, 255, 255, 0.03)';

      const innerBox = box({ x: px + POD_INNER.dx, y: POD_Y + POD_INNER.dy, w: POD_INNER.w, h: POD_INNER.h, label: 'app', sublabel: 'pvc: ' + POD_PVCS[i], role: 'workloads' });

      const wrap = g({ id: `pod${i}` });
      wrap.style.opacity = '0';
      wrap.appendChild(shell);
      wrap.appendChild(innerBox);
      podBoxes.push(innerBox);
      return wrap;
    });
    const [pod0, pod1, pod2] = podWrappers;
    const [pod0Box, pod1Box, pod2Box] = podBoxes;

    // Trunk and bus carry the ball, the taps land it on a Pod: only the taps take an arrowhead.
    const trunk = trunkPath(TRUNK);
    const busL = trunkPath(BUS_L);
    const busR = trunkPath(BUS_R);
    const taps = POD_XS.map((_, i) => pathArrow({ points: TAP(i), dim: true, dashed: true, role: 'cluster' }));

    const packetLayer = g({ id: 'packetLayer' });

    // Z-order: the Node frame is a 70% opaque fill, so the bus that runs inside it and the balls
    // that ride it are appended after it. Ladder, Pods and the actor row sit above the packets.
    root.appendChild(nodeEl);
    [trunk, busL, busR, ...taps].forEach(w => root.appendChild(w));
    root.appendChild(packetLayer);
    root.appendChild(chain);
    [pod0, pod1, pod2].forEach(p => root.appendChild(p));
    root.appendChild(svc);
    root.appendChild(apiserver);
    root.appendChild(controller);

    this.host.appendChild(root);
    this.refs = {
      svg: root,
      controller, apiserver, svc, chain, nodeEl, trunk, busL, busR, taps,
      web0Chip, web1Chip, web2Chip, focusChip,
      pod0, pod1, pod2, pod0Box, pod1Box, pod2Box,
      packetLayer,
      wires: { req: wireReq, svc: wireSvc },
    };
  }

  reset() { this.build(); }
}

function clearHL(s) {
  clearHighlights(s,
    ['controller','apiserver','svc','web0Chip','web1Chip','web2Chip','focusChip','pod0Box','pod1Box','pod2Box'],
    [s.refs.pod0, s.refs.pod1, s.refs.pod2]);
}

// One call pins the three ordinals and the lanes that end on them: a tap goes with its Pod, and
// each half of the bus goes with the ordinal it reaches.
function setPods(s, o0, o1, o2) {
  [o0, o1, o2].forEach((o, i) => {
    s.refs['pod' + i].style.opacity = String(o);
    s.refs.taps[i].style.opacity = String(o);
  });
  s.refs.busL.style.opacity = String(o0);
  s.refs.busR.style.opacity = String(o2);
}

const STEPS = [
  {
    id: 'idle',
    duration: 1500,
    enter(s) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setPods(s, 0, 0, 0);
      setVal(s.refs.web0Chip, 'not created');
      setVal(s.refs.web1Chip, 'not created');
      setVal(s.refs.web2Chip, 'not created');
      setVal(s.refs.focusChip, 'none');
      setChainActive(s.refs.chain, 0);
    },
  },
  {
    id: 'pod-0',
    duration: 3600,
    narration: 'Controller picks ordinal 0 first. API creates PVC data-web-0 (sticky to ordinal 0 by name, never recycled), the binding controller pairs it with a fresh PV, then a Pod web-0 is created with spec.hostname=web-0 and spec.subdomain=web. Once readinessProbe passes, web-0 is Ready and gets registered as web-0.web in the headless Service EndpointSlice.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setPods(s, 1, 0, 0);
      setVal(s.refs.web0Chip, 'Ready · web-0.web');
      setVal(s.refs.web1Chip, 'not created');
      setVal(s.refs.web2Chip, 'not created');
      setVal(s.refs.focusChip, 'PVC data-web-0 bound');
      setWire(s, 'req', 'create PVC data-web-0 · Create Pod web-0');
      setWire(s, 'svc', 'register web-0.web');
      s.refs.controller.classList.add('highlight');
      s.refs.svc.classList.add('highlight');
      s.refs.web0Chip.classList.add('highlight');
      s.refs.focusChip.classList.add('highlight');
      setChainActive(s.refs.chain, 1);
      if (ctx.reduced) { s.refs.pod0Box.classList.add('highlight'); s.refs.apiserver.classList.add('highlight'); return; }
      // Controller asks Api to create the PVC and Pod, then the Pod is created
      // on the node. web-0 materializes and pulses when the create reaches the node.
      const req = topPacket(s, ctx, { from: TOP1_X + TOP1_W, to: TOP2_X, y: REQ_Y, role: 'workloads' });
      lightBoxAt(s.refs.apiserver, ctx, req.arrivalMs);
      const create = routePacket(s, ctx, LANE(0), { delay: req.arrivalMs + BEAT.afterHop, role: 'workloads' });
      ctx.register(s.refs.pod0.animate([{ opacity: 0 }, { opacity: 1 }], { duration: FADE.in, delay: create.arrivalMs, fill: 'both', easing: 'ease-out' }));
      pulsePod(s.refs.pod0, ctx, create.arrivalMs);
    },
  },
  {
    id: 'gate',
    duration: 1900,
    narration: 'The spec.podManagementPolicy field defaults to OrderedReady. The controller will not create web-1 while web-0 is not Ready, will not create web-2 while web-1 is not Ready, and so on. A stuck ordinal stalls every subsequent one. Setting podManagementPolicy=Parallel lifts this gate at the cost of ordering guarantees during scale-up and scale-down.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setPods(s, 1, 0, 0);
      setVal(s.refs.web0Chip, 'Ready · web-0.web');
      setVal(s.refs.web1Chip, 'gate open · web-0 Ready');
      setVal(s.refs.web2Chip, 'waits for web-1 Ready');
      setVal(s.refs.focusChip, 'podManagementPolicy: OrderedReady');
      s.refs.controller.classList.add('highlight');
      s.refs.web1Chip.classList.add('highlight');
      s.refs.web2Chip.classList.add('highlight');
      s.refs.focusChip.classList.add('highlight');
      setChainActive(s.refs.chain, 2);
      // The gate is pure controller logic, nothing travels and the Pods are untouched:
      // the blocked ordinals show via the static highlight only (no chip pulse).
    },
  },
  {
    id: 'pod-1',
    duration: 3100,
    narration: 'Replica web-0 cleared the gate. Controller creates PVC data-web-1 and Pod web-1 with spec.hostname=web-1, served as DNS web-1.web by the headless Service. Same flow as ordinal 0. Pod web-1 reaches Ready and the headless Service EndpointSlice now lists two backends: web-0.web and web-1.web.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setPods(s, 1, 1, 0);
      setVal(s.refs.web0Chip, 'Ready · web-0.web');
      setVal(s.refs.web1Chip, 'Ready · web-1.web');
      setVal(s.refs.web2Chip, 'gate open · web-1 Ready');
      setVal(s.refs.focusChip, 'PVC data-web-1 bound');
      setWire(s, 'req', 'create PVC data-web-1 · Create Pod web-1');
      setWire(s, 'svc', 'register web-1.web');
      s.refs.controller.classList.add('highlight');
      s.refs.svc.classList.add('highlight');
      s.refs.web1Chip.classList.add('highlight');
      s.refs.focusChip.classList.add('highlight');
      setChainActive(s.refs.chain, 3);
      if (ctx.reduced) { s.refs.pod1Box.classList.add('highlight'); s.refs.apiserver.classList.add('highlight'); return; }
      // Same create flow as ordinal 0. web-1 materializes and pulses on arrival.
      const req = topPacket(s, ctx, { from: TOP1_X + TOP1_W, to: TOP2_X, y: REQ_Y, role: 'workloads' });
      lightBoxAt(s.refs.apiserver, ctx, req.arrivalMs);
      const create = routePacket(s, ctx, LANE(1), { delay: req.arrivalMs + BEAT.afterHop, role: 'workloads' });
      ctx.register(s.refs.pod1.animate([{ opacity: 0 }, { opacity: 1 }], { duration: FADE.in, delay: create.arrivalMs, fill: 'both', easing: 'ease-out' }));
      pulsePod(s.refs.pod1, ctx, create.arrivalMs);
    },
  },
  {
    id: 'pod-2',
    duration: 3600,
    narration: 'Replica web-1 reached Ready, the gate unlocks for ordinal 2. PVC data-web-2 is provisioned and Pod web-2 starts with spec.hostname=web-2, served as DNS web-2.web. Once Ready, all three replicas are alive with sticky identities. Termination on scale-down runs in reverse order (web-2 first, then web-1, then web-0).',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setPods(s, 1, 1, 1);
      setVal(s.refs.web0Chip, 'Ready · web-0.web');
      setVal(s.refs.web1Chip, 'Ready · web-1.web');
      setVal(s.refs.web2Chip, 'Ready · web-2.web');
      setVal(s.refs.focusChip, 'all 3 ordinals Ready');
      setWire(s, 'req', 'create PVC data-web-2 · Create Pod web-2');
      setWire(s, 'svc', 'register web-2.web');
      s.refs.controller.classList.add('highlight');
      s.refs.svc.classList.add('highlight');
      s.refs.web2Chip.classList.add('highlight');
      s.refs.focusChip.classList.add('highlight');
      setChainActive(s.refs.chain, 4);
      if (ctx.reduced) { s.refs.pod2Box.classList.add('highlight'); s.refs.apiserver.classList.add('highlight'); return; }
      // Final ordinal. web-2 materializes and pulses on arrival, all three are Ready.
      const req = topPacket(s, ctx, { from: TOP1_X + TOP1_W, to: TOP2_X, y: REQ_Y, role: 'workloads' });
      lightBoxAt(s.refs.apiserver, ctx, req.arrivalMs);
      const create = routePacket(s, ctx, LANE(2), { delay: req.arrivalMs + BEAT.afterHop, role: 'workloads' });
      ctx.register(s.refs.pod2.animate([{ opacity: 0 }, { opacity: 1 }], { duration: FADE.in, delay: create.arrivalMs, fill: 'both', easing: 'ease-out' }));
      pulsePod(s.refs.pod2, ctx, create.arrivalMs);
    },
  },
];

export const init = makeInit(Scene, STEPS, { posterFirst: true });
