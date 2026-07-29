import { svg, g, rect, text } from '../lib/svg.js';
import { arrowDefs, pod, node, box, chainList, setChainActive, arrow, pathArrow } from '../lib/primitives.js';
import { routePacket, valChip, setVal, pulsePod, topPacket, makeInit, clearHighlights, clearWires, setWire, FADE, BEAT, lightBoxAt, OPACITY, WL } from '../lib/workloads-kit.js';

// Layout B of the Workloads canon (WL): chips left, pipeline right, a bus tapping every Pod.
// Panel worst case x<=397, y<=230; a longer narration invalidates that measurement.
// Design notes for this card: scheme/docs/CARDS.md#workloads-daemonset
const PANEL_B = 230;
const TOP1_X = 420, TOP1_W = 220;
const TOP_GAP = 60;
const TOP2_X = TOP1_X + TOP1_W + TOP_GAP, TOP2_W = 220;
const TOP_CY = WL.TOP_Y + WL.BOX_H / 2;
const REQ_Y = TOP_CY - WL.LANE_DY, RESP_Y = TOP_CY + WL.LANE_DY;
const WIRE_X = (TOP1_X + TOP1_W + TOP2_X) / 2;
const WIRE_Y = WL.TOP_Y - 12;                            // above the actor row, off the spine

const LAD_X = WL.CHIP_X, LAD_W = WL.CHIP_W;              // 660..1140, the pipeline
const LAD_Y = 160;                                       // 5 rows -> 160..360

// Chips as a column in the left band, which only opens below the panel.
const CHIP_GAP = 8;
const CHIPS_TOP = PANEL_B + 20;                          // 250
const CHIP_X = WL.LADDER_X, CHIP_W = WL.LADDER_W;        // 60..540
const CHIP_Y = i => CHIPS_TOP + i * (WL.CHIP_H + CHIP_GAP);

const NODE_H = 140, CANVAS_B = 624;
const NODE_Y = CANVAS_B - NODE_H;                        // 484..624, the frames rest on the floor
const POD_H = 106, POD_Y = NODE_Y + 22;                  // 506..612
const POD_INNER = { dy: 28, h: 52 };

// Four Node frames laid across the content width, so the row centres on CX by construction.
const NODE_N = 4, NODE_GAP = 24;
const N_W = (WL.W - NODE_GAP * (NODE_N - 1)) / NODE_N;   // 252
const N_X = i => WL.L + i * (N_W + NODE_GAP);            // 60 / 336 / 612 / 888
const N_POD_DX = 12, N_INNER_DX = 22;                    // Pod and container insets in the frame
const N_POD_W = N_W - N_POD_DX * 2, N_INNER_W = N_W - N_INNER_DX * 2;
const POD_CX = i => N_X(i) + N_W / 2;                    // 186 / 462 / 738 / 1014

// The trunk leaves the first actor box on its own midpoint, steps into the central corridor
// between the two columns, and drops to a bus above the Pod row. One tap per Pod hangs off the
// bus, so every lane ends on a Pod rather than on the frame edge above it.
const TOP1_CX = TOP1_X + TOP1_W / 2;                     // 530
const JOG_Y = WL.TOP_BOTTOM + 20;                        // 140, below the boxes, above the ladder
const BUS_Y = NODE_Y - 24;                               // 460, clear of the chip column
const TRUNK = [[TOP1_CX, WL.TOP_BOTTOM], [TOP1_CX, JOG_Y], [WL.SPINE_X, JOG_Y], [WL.SPINE_X, BUS_Y]];
const LANE = i => [...TRUNK, [POD_CX(i), BUS_Y], [POD_CX(i), POD_Y]];

const NODE_JOIN_DELAY = 200;                             // Node-4 fades in a beat before its Pod

// valChip / setVal / setBoxSublabel are imported from ../lib/workloads-kit.js

class Scene {
  constructor(host) { this.host = host; this.refs = {}; this.build(); }

  build() {
    this.host.replaceChildren();
    this.refs = {};
    const root = svg({
      class: 'diagram',
      viewBox: '0 0 1200 640',
      preserveAspectRatio: 'xMidYMid meet',
      'aria-label': 'DaemonSet controller: keeps exactly one Pod on every matching Node, adds a Pod when a Node joins and removes one when a Node leaves',
      'data-style': 'outline',
    });
    root.appendChild(arrowDefs());

    const daemonset = box({ x: TOP1_X, y: WL.TOP_Y, w: TOP1_W, h: WL.BOX_H, label: 'DaemonSet', sublabel: '', role: 'cluster' });
    const apiserver = box({ x: TOP2_X, y: WL.TOP_Y, w: TOP2_W, h: WL.BOX_H, label: 'API', sublabel: 'watch Nodes · Pod CRUD', role: 'cluster' });

    root.appendChild(arrow({ x1: TOP1_X + TOP1_W, y1: REQ_Y, x2: TOP2_X, y2: REQ_Y, dim: true, dashed: true, role: 'cluster' }));
    root.appendChild(arrow({ x1: TOP2_X, y1: RESP_Y, x2: TOP1_X + TOP1_W, y2: RESP_Y, dim: true, dashed: true, role: 'cluster' }));

    const wireReq = text({ class: 'scheme-label code dim', x: WIRE_X, y: WIRE_Y, 'text-anchor': 'middle', 'font-size': 9 }, [' ']);
    root.appendChild(wireReq);

    const desiredChip = valChip({ x: CHIP_X, y: CHIP_Y(0), w: CHIP_W, h: WL.CHIP_H, name: 'desiredNumberScheduled', value: '3', role: 'workloads' });
    const currentChip = valChip({ x: CHIP_X, y: CHIP_Y(1), w: CHIP_W, h: WL.CHIP_H, name: 'currentNumberScheduled', value: '0', role: 'workloads' });
    const readyChip   = valChip({ x: CHIP_X, y: CHIP_Y(2), w: CHIP_W, h: WL.CHIP_H, name: 'numberReady',            value: '0', role: 'workloads' });
    const focusChip   = valChip({ x: CHIP_X, y: CHIP_Y(3), w: CHIP_W, h: WL.CHIP_H, name: 'focus',                  value: 'selector: app=fluentd', role: 'workloads' });
    [desiredChip, currentChip, readyChip, focusChip].forEach(c => root.appendChild(c));

    const chain = chainList({
      x: LAD_X, y: LAD_Y, w: LAD_W, rowH: WL.ROW_H, gap: WL.ROW_GAP,
      items: [
        '1. spec      ·  one Pod per node, selector + tolerations',
        '2. place     ·  create a Pod on every matching node',
        '3. node join ·  new node, desiredNumberScheduled++, add Pod',
        '4. update    ·  RollingUpdate maxUnavailable=1, one by one',
        '5. drain     ·  node gone, its Pod deleted, not rescheduled',
      ],
      role: 'cluster',
    });

    // Four node slots across the bottom band. Node-4 starts hidden and joins in step 3.
    const NODE_DEFS = [
      { key: 'node1El', x: N_X(0), label: 'Node-1' },
      { key: 'node2El', x: N_X(1), label: 'Node-2' },
      { key: 'node3El', x: N_X(2), label: 'Node-3' },
      { key: 'node4El', x: N_X(3), label: 'Node-4' },
    ];
    const nodeEls = {};
    NODE_DEFS.forEach(d => { nodeEls[d.key] = node({ x: d.x, y: NODE_Y, w: N_W, h: NODE_H, label: d.label }); });
    nodeEls.node4El.style.opacity = '0';

    const POD_XS = [0, 1, 2, 3].map(N_X);
    const podWrappers = [];
    const podBoxes = [];
    POD_XS.forEach((nx, i) => {
      const shell = pod({ x: nx + N_POD_DX, y: POD_Y, w: N_POD_W, h: POD_H, label: 'fluentd', sublabel: '', containers: 0, role: 'workloads' });
      const shellRect = shell.querySelector('.scheme-pod-rect');
      if (shellRect) shellRect.style.fill = 'rgba(255, 255, 255, 0.03)';

      const innerBox = box({ x: nx + N_INNER_DX, y: POD_Y + POD_INNER.dy, w: N_INNER_W, h: POD_INNER.h, label: 'fluentd', sublabel: 'log agent', role: 'workloads' });

      const wrap = g({ id: `pod${i + 1}` });
      wrap.style.opacity = '0';
      wrap.appendChild(shell);
      wrap.appendChild(innerBox);
      podWrappers.push(wrap);
      podBoxes.push(innerBox);
    });
    const [pod1, pod2, pod3, pod4] = podWrappers;
    const [pod1Box, pod2Box, pod3Box, pod4Box] = podBoxes;

    // One drawn lane per Pod. They share the trunk and the bus, so the four paths coincide
    // there and read as a single wiring tree with four arrowheads.
    const lanes = [0, 1, 2, 3].map(i => pathArrow({ points: LANE(i), dim: true, dashed: true, role: 'cluster' }));
    lanes.forEach(l => root.appendChild(l));
    lanes[3].style.opacity = '0';                 // Node-4 has not joined yet

    const packetLayer = g({ id: 'packetLayer' });
    root.appendChild(packetLayer);

    root.appendChild(chain);
    NODE_DEFS.forEach(d => root.appendChild(nodeEls[d.key]));
    [pod1, pod2, pod3, pod4].forEach(p => root.appendChild(p));
    root.appendChild(apiserver);
    root.appendChild(daemonset);

    this.host.appendChild(root);
    this.refs = {
      svg: root,
      daemonset, apiserver, chain, lanes,
      desiredChip, currentChip, readyChip, focusChip,
      node1El: nodeEls.node1El, node2El: nodeEls.node2El, node3El: nodeEls.node3El, node4El: nodeEls.node4El,
      pod1, pod2, pod3, pod4, pod1Box, pod2Box, pod3Box, pod4Box,
      packetLayer,
      wires: { req: wireReq },
    };
  }

  reset() { this.build(); }
}

function clearHL(s) {
  clearHighlights(s,
    ['daemonset','apiserver','desiredChip','currentChip','readyChip','focusChip','pod1Box','pod2Box','pod3Box','pod4Box'],
    [s.refs.pod1, s.refs.pod2, s.refs.pod3, s.refs.pod4]);
}

// A lane into a Node that is not in the cluster points at nothing, so it is pinned out.
function setLanes(s, on) { s.refs.lanes.forEach((l, i) => { l.style.opacity = String(on[i]); }); }

const STEPS = [
  {
    id: 'idle',
    duration: 1500,
    enter(s) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      s.refs.pod1.style.opacity = '0';
      s.refs.pod2.style.opacity = '0';
      s.refs.pod3.style.opacity = '0';
      s.refs.pod4.style.opacity = '0';
      s.refs.node2El.style.opacity = '1';
      s.refs.node4El.style.opacity = '0';
      setLanes(s, [1, 1, 1, 0]);
      setVal(s.refs.desiredChip, '3');
      setVal(s.refs.currentChip, '0');
      setVal(s.refs.readyChip, '0');
      setVal(s.refs.focusChip, 'selector: app=fluentd');
      setChainActive(s.refs.chain, 0);
    },
  },
  {
    id: 'place',
    duration: 3800,
    narration: 'The controller sees three matching Nodes and zero Pods, so it creates one Pod on each through the API and the local Kubelet starts it. A DaemonSet places exactly one Pod per Node, never a second, so the count follows the Nodes themselves rather than a fixed replica number you set.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      s.refs.node4El.style.opacity = '0';
      s.refs.pod4.style.opacity = '0';
      setLanes(s, [1, 1, 1, 0]);
      setVal(s.refs.desiredChip, '3');
      setVal(s.refs.currentChip, '3');
      setVal(s.refs.readyChip, '3');
      setVal(s.refs.focusChip, 'one Pod per matching node');
      s.refs.focusChip.classList.add('highlight');
      setWire(s, 'req', 'create one Pod per matching node');
      s.refs.daemonset.classList.add('highlight');
      s.refs.currentChip.classList.add('highlight');
      s.refs.readyChip.classList.add('highlight');
      setChainActive(s.refs.chain, 1);
      // Pin final opacities so a step change does not revert the Pods to the built 0.
      s.refs.pod1.style.opacity = '1';
      s.refs.pod2.style.opacity = '1';
      s.refs.pod3.style.opacity = '1';
      if (ctx.reduced) { ['pod1Box','pod2Box','pod3Box'].forEach(k => s.refs[k].classList.add('highlight')); s.refs.apiserver.classList.add('highlight'); return; }
      const req = topPacket(s, ctx, { from: TOP1_X + TOP1_W, to: TOP2_X, y: REQ_Y, role: 'workloads' });
      lightBoxAt(s.refs.apiserver, ctx, req.arrivalMs);
      // One create per matching Node, each riding its own tap off the bus, so every Pod that
      // materializes has a ball that actually reached it.
      const pods = [s.refs.pod1, s.refs.pod2, s.refs.pod3];
      pods.forEach((p, i) => {
        const create = routePacket(s, ctx, LANE(i), { delay: req.arrivalMs + BEAT.afterHop, role: 'workloads' });
        ctx.register(p.animate([{ opacity: 0 }, { opacity: 1 }], { duration: FADE.in, delay: create.arrivalMs, fill: 'both', easing: 'ease-out' }));
        pulsePod(p, ctx, create.arrivalMs);
      });
    },
  },
  {
    id: 'node-join',
    duration: 3800,
    narration: 'A new worker Node-4 joins the cluster and turns Ready. The DaemonSet controller watches Node objects, recomputes desiredNumberScheduled to four, and creates a Pod on Node-4 alone. No other Node is disturbed. Automatic per-node placement is the whole reason a DaemonSet exists.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setVal(s.refs.desiredChip, '4');
      setVal(s.refs.currentChip, '4');
      setVal(s.refs.readyChip, '4');
      s.refs.readyChip.classList.add('highlight');
      setVal(s.refs.focusChip, 'Node-4 joined, Pod added');
      s.refs.focusChip.classList.add('highlight');
      setWire(s, 'req', 'watch Node added · desiredNumberScheduled 3 to 4');
      s.refs.daemonset.classList.add('highlight');
      s.refs.desiredChip.classList.add('highlight');
      s.refs.currentChip.classList.add('highlight');
      setChainActive(s.refs.chain, 2);
      // Pin final: the three existing Pods plus Node-4 and its new Pod are present.
      s.refs.pod1.style.opacity = '1';
      s.refs.pod2.style.opacity = '1';
      s.refs.pod3.style.opacity = '1';
      s.refs.node4El.style.opacity = '1';
      s.refs.pod4.style.opacity = '1';
      setLanes(s, [1, 1, 1, 1]);
      if (ctx.reduced) { s.refs.pod4Box.classList.add('highlight'); s.refs.apiserver.classList.add('highlight'); return; }
      // The node joins first (its rect fades in), then the controller creates a Pod
      // on it, which materializes and pulses when the create reaches the node.
      s.refs.node4El.style.opacity = '0';
      s.refs.pod4.style.opacity = '0';
      s.refs.lanes[3].style.opacity = '0';
      ctx.register(s.refs.node4El.animate([{ opacity: 0 }, { opacity: 1 }], { duration: FADE.in, delay: NODE_JOIN_DELAY, fill: 'both', easing: 'ease-out' }));
      ctx.register(s.refs.lanes[3].animate([{ opacity: 0 }, { opacity: 1 }], { duration: FADE.in, delay: NODE_JOIN_DELAY, fill: 'both', easing: 'ease-out' }));
      const req = topPacket(s, ctx, { from: TOP1_X + TOP1_W, to: TOP2_X, y: REQ_Y, role: 'workloads' });
      lightBoxAt(s.refs.apiserver, ctx, req.arrivalMs);
      const create = routePacket(s, ctx, LANE(3), { delay: req.arrivalMs + BEAT.afterHop, role: 'workloads' });
      ctx.register(s.refs.pod4.animate([{ opacity: 0 }, { opacity: 1 }], { duration: FADE.in, delay: create.arrivalMs, fill: 'both', easing: 'ease-out' }));
      pulsePod(s.refs.pod4, ctx, create.arrivalMs);
    },
  },
  {
    id: 'update',
    duration: 3800,
    narration: 'The image is bumped from fluentd v1 to v2. The RollingUpdate strategy with maxUnavailable=1 deletes and recreates the Pods one Node at a time, never taking more than one down at once, so log collection keeps running on the rest. The OnDelete strategy would instead wait until you delete each Pod by hand.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setVal(s.refs.desiredChip, '4');
      setVal(s.refs.currentChip, '4');
      setVal(s.refs.readyChip, '3 / 4 updating');
      setVal(s.refs.focusChip, 'RollingUpdate · maxUnavailable=1');
      setWire(s, 'req', 'RollingUpdate · maxUnavailable=1 · v1 to v2');
      s.refs.daemonset.classList.add('highlight');
      s.refs.readyChip.classList.add('highlight');
      s.refs.focusChip.classList.add('highlight');
      setChainActive(s.refs.chain, 3);
      // All four Pods stay placed, Node-4 stays present.
      s.refs.pod1.style.opacity = '1';
      s.refs.pod2.style.opacity = '1';
      s.refs.pod3.style.opacity = '1';
      s.refs.pod4.style.opacity = '1';
      s.refs.node4El.style.opacity = '1';
      setLanes(s, [1, 1, 1, 1]);
      if (ctx.reduced) { s.refs.pod1Box.classList.add('highlight'); return; }
      const req = topPacket(s, ctx, { from: TOP1_X + TOP1_W, to: TOP2_X, y: REQ_Y, role: 'workloads' });
      const update = routePacket(s, ctx, LANE(0), { delay: req.arrivalMs + BEAT.afterHop, role: 'workloads' });
      pulsePod(s.refs.pod1, ctx, update.arrivalMs);
    },
  },
  {
    id: 'drain',
    duration: 2400,
    narration: 'Node-2 is drained and leaves the cluster. Its DaemonSet Pod is deleted and, unlike a Deployment replica, it is not recreated on another Node. A DaemonSet keeps exactly one Pod per Node and every surviving Node already has one, so desiredNumberScheduled simply drops back to three.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setVal(s.refs.desiredChip, '3');
      setVal(s.refs.currentChip, '3');
      s.refs.currentChip.classList.add('highlight');
      setVal(s.refs.readyChip, '3');
      s.refs.readyChip.classList.add('highlight');
      setVal(s.refs.focusChip, 'Node-2 gone, Pod not rescheduled');
      s.refs.focusChip.classList.add('highlight');
      setWire(s, 'req', 'Node-2 removed · delete its Pod · no reschedule');
      s.refs.daemonset.classList.add('highlight');
      s.refs.desiredChip.classList.add('highlight');
      setChainActive(s.refs.chain, 4);
      // Pin final: Node-2 and its Pod are gone, the other three Pods and Node-4 remain.
      s.refs.pod1.style.opacity = '1';
      s.refs.pod3.style.opacity = '1';
      s.refs.pod4.style.opacity = '1';
      s.refs.node4El.style.opacity = '1';
      s.refs.pod2.style.opacity = '0';
      s.refs.node2El.style.opacity = String(OPACITY.terminated);
      setLanes(s, [1, 0, 1, 1]);
      if (ctx.reduced) return;
      // The delete reaches Node-2 down its own tap. pod2 pulses then fades out, Node-2 dims
      // as it leaves the cluster, and the lane into it goes with it.
      s.refs.pod2.style.opacity = '1';
      s.refs.node2El.style.opacity = '1';
      s.refs.lanes[1].style.opacity = '1';
      const del = routePacket(s, ctx, LANE(1), { role: 'workloads' });
      pulsePod(s.refs.pod2, ctx, del.arrivalMs);
      ctx.register(s.refs.pod2.animate([{ opacity: 1 }, { opacity: 0 }], { duration: FADE.out, delay: del.arrivalMs, fill: 'both', easing: 'ease-in' }));
      ctx.register(s.refs.node2El.animate([{ opacity: 1 }, { opacity: OPACITY.terminated }], { duration: FADE.out, delay: del.arrivalMs, fill: 'both', easing: 'ease-in' }));
      ctx.register(s.refs.lanes[1].animate([{ opacity: 1 }, { opacity: 0 }], { duration: FADE.out, delay: del.arrivalMs, fill: 'both', easing: 'ease-in' }));
    },
  },
];

export const init = makeInit(Scene, STEPS, { posterFirst: true });
