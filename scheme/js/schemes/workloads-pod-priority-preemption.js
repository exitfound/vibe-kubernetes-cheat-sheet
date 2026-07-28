import { svg, g, rect, text } from '../lib/svg.js';
import { arrowDefs, box, pod, node, chainList, setChainActive, arrow, pathArrow } from '../lib/primitives.js';
import { valChip, setVal, pulsePod, topPacket, routePacket, makeInit, clearHighlights, clearWires, setWire, FADE, BEAT, lightBoxAt, WL } from '../lib/workloads-kit.js';

// Layout C on the Workloads canon (WL in the kit): the panel reaches y<=404 (worst of
// 1600/1440/1280/1100, x<=397), which leaves no column under it, so the pipeline keeps the right
// band and the chips form a two-across bottom strip.
// Design notes for this card: scheme/docs/CARDS.md#workloads-pod-priority-preemption
const PANEL_B = 404;

// Scheduler leads the row and is centred on CX, so the lane to the Node leaves its bottom
// midpoint and clears the pipeline column.
const TOP1_X = 420, TOP1_W = 2 * (WL.CX - 420);          // 420..780, centred on CX
const TOP_GAP = 60;
const TOP2_X = TOP1_X + TOP1_W + TOP_GAP, TOP2_W = WL.R - (TOP1_X + TOP1_W + TOP_GAP);
const TOP_CY = WL.TOP_Y + WL.BOX_H / 2;
const REQ_Y = TOP_CY - WL.LANE_DY, RESP_Y = TOP_CY + WL.LANE_DY;
const WIRE_X = (TOP1_X + TOP1_W + TOP2_X) / 2;

const LAD_X = WL.CHIP_X, LAD_W = WL.CHIP_W;              // 660..1140, the pipeline
const LAD_Y = 150;                                       // 5 rows -> 150..350

// Chips two across, 532 wide: four across was 258 and every name ran into its own value.
const CHIP_COLS = 2, CHIP_GAP = 16, CHIP_VGAP = 8;
const CHIP_W = (WL.W - CHIP_GAP * (CHIP_COLS - 1)) / CHIP_COLS;
const CHIPS_Y = 548;                                     // 2 rows -> 548..582 / 590..624
const CHIP_X = i => WL.L + (i % CHIP_COLS) * (CHIP_W + CHIP_GAP);
const CHIP_Y = i => CHIPS_Y + Math.floor(i / CHIP_COLS) * (WL.CHIP_H + CHIP_VGAP);

const NODE_Y = 404, NODE_H = 128;                        // 404..532, clear of the panel
const POD_W = 300, POD_H = 82, POD_Y = NODE_Y + 34;      // 438..520
const POD_PAD = 24;
const POD_INNER = { dx: 30, w: POD_W - 60, dy: 24, h: 46 };

// Pod slots spread across the frame's inner width, so the row centres on CX.
const SLOT_N = 3, SLOT_W = POD_W;
const SLOT_SPAN = WL.W - POD_PAD * 2;
const SLOT_X = i => WL.L + POD_PAD + i * ((SLOT_SPAN - SLOT_W) / (SLOT_N - 1));
const SLOT_CX = i => SLOT_X(i) + SLOT_W / 2;             // 234 / 600 / 966

// Everything the Scheduler sends down addresses slot 0: it is the victim it preempts and the
// slot Pod NEW is bound into. The lane therefore ends on that Pod, and the wire and the ball
// are built from this one array.
const BUS_Y = NODE_Y + 12;
const VICTIM_SLOT = 0;
const LANE = [[WL.CX, WL.TOP_BOTTOM], [WL.CX, BUS_Y], [SLOT_CX(VICTIM_SLOT), BUS_Y], [SLOT_CX(VICTIM_SLOT), POD_Y]];


class Scene {
  constructor(host) { this.host = host; this.refs = {}; this.build(); }

  build() {
    this.host.replaceChildren();
    this.refs = {};
    const root = svg({
      class: 'diagram',
      viewBox: '0 0 1200 640',
      preserveAspectRatio: 'xMidYMid meet',
      'aria-label': 'Pod priority and preemption: scheduler preempts the lowest-priority victim to make room for a high-priority Pod on a full Node',
      'data-style': 'outline',
    });
    root.appendChild(arrowDefs());

    const scheduler = box({ x: TOP1_X, y: WL.TOP_Y, w: TOP1_W, h: WL.BOX_H, label: 'Scheduler', sublabel: 'filter + Score + Preempt', role: 'cluster' });
    const apiserver = box({ x: TOP2_X, y: WL.TOP_Y, w: TOP2_W, h: WL.BOX_H, label: 'API', sublabel: 'PriorityClass + delete + bind', role: 'cluster' });

    root.appendChild(arrow({ x1: TOP1_X + TOP1_W, y1: REQ_Y, x2: TOP2_X, y2: REQ_Y, dim: true, dashed: true, role: 'cluster' }));
    root.appendChild(arrow({ x1: TOP2_X, y1: RESP_Y, x2: TOP1_X + TOP1_W, y2: RESP_Y, dim: true, dashed: true, role: 'cluster' }));

    const wireReq = text({ class: 'scheme-label code dim', x: WIRE_X, y: WL.TOP_Y - 12, 'text-anchor': 'middle', 'font-size': 9 }, [' ']);
    root.appendChild(wireReq);

    const newPodChip  = valChip({ x: CHIP_X(0), y: CHIP_Y(0), w: CHIP_W, h: WL.CHIP_H, name: 'Pod NEW · pri', value: '2e9 (system-cluster-critical)', role: 'workloads' });
    const attemptChip = valChip({ x: CHIP_X(1), y: CHIP_Y(1), w: CHIP_W, h: WL.CHIP_H, name: 'sched attempt',      value: 'none', role: 'workloads' });
    const victimChip  = valChip({ x: CHIP_X(2), y: CHIP_Y(2), w: CHIP_W, h: WL.CHIP_H, name: 'victim',             value: 'none', role: 'workloads' });
    const focusChip   = valChip({ x: CHIP_X(3), y: CHIP_Y(3), w: CHIP_W, h: WL.CHIP_H, name: 'focus',              value: 'none', role: 'workloads' });
    [newPodChip, attemptChip, victimChip, focusChip].forEach(c => root.appendChild(c));

    const chain = chainList({
      x: LAD_X, y: LAD_Y, w: LAD_W, rowH: WL.ROW_H, gap: WL.ROW_GAP,
      items: [
        '1. spec    ·  priorityClassName → spec.priority',
        '2. attempt ·  Filter + Score · NoFit on every node',
        '3. preempt ·  find min-priority victim set',
        '4. delete  ·  standard DELETE · no PDB check',
        '5. bind    ·  nominatedNodeName → bind freed slot',
      ],
      role: 'cluster',
    });

    const nodeEl = node({ x: WL.L, y: NODE_Y, w: WL.W, h: NODE_H, label: 'Node-1' });

    const POD_DEFS = [
      { name: 'Pod A',   sub: 'priority: 100',  x: SLOT_X(0) },
      { name: 'Pod B',   sub: 'priority: 1000', x: SLOT_X(1) },
      { name: 'Pod C',   sub: 'priority: 100',  x: SLOT_X(2) },
      { name: 'Pod NEW', sub: 'priority: 2e9',  x: SLOT_X(0) },
    ];
    const podBoxes = [];
    const podWrappers = POD_DEFS.map((d, i) => {
      const shell = pod({ x: d.x, y: POD_Y, w: SLOT_W, h: POD_H, label: d.name, sublabel: '', containers: 0, role: 'workloads' });
      const shellRect = shell.querySelector('.scheme-pod-rect');
      if (shellRect) shellRect.style.fill = 'rgba(255, 255, 255, 0.03)';

      const innerBox = box({ x: d.x + POD_INNER.dx, y: POD_Y + POD_INNER.dy, w: POD_INNER.w, h: POD_INNER.h, label: 'app', sublabel: d.sub, role: 'workloads' });

      const wrap = g({ id: d.name === 'Pod NEW' ? 'podNew' : `pod${i + 1}` });
      wrap.appendChild(shell);
      wrap.appendChild(innerBox);
      podBoxes.push(innerBox);
      return wrap;
    });
    const [pod1, pod2, pod3, podNew] = podWrappers;
    const [pod1Box, pod2Box, pod3Box, podNewBox] = podBoxes;
    podNew.style.opacity = '0';

    const connector = pathArrow({ points: LANE, dim: true, dashed: true, role: 'cluster' });

    const packetLayer = g({ id: 'packetLayer' });

    // Z-order: the Node frame is a 70% opaque fill, so the lane leg that runs inside it and the
    // ball that rides it are appended after it. Ladder, Pods and actors sit above the packets.
    root.appendChild(nodeEl);
    root.appendChild(connector);
    root.appendChild(packetLayer);
    root.appendChild(chain);
    [pod1, pod2, pod3, podNew].forEach(p => root.appendChild(p));
    root.appendChild(apiserver);
    root.appendChild(scheduler);

    this.host.appendChild(root);
    this.refs = {
      svg: root,
      scheduler, apiserver, chain, nodeEl, connector,
      newPodChip, attemptChip, victimChip, focusChip,
      pod1, pod2, pod3, podNew, pod1Box, pod2Box, pod3Box, podNewBox,
      packetLayer,
      wires: { req: wireReq },
    };
  }

  reset() { this.build(); }
}

function clearHL(s) {
  clearHighlights(s,
    ['scheduler','apiserver','newPodChip','attemptChip','victimChip','focusChip','pod1Box','pod2Box','pod3Box','podNewBox'],
    [s.refs.pod1, s.refs.pod2, s.refs.pod3, s.refs.podNew]);
}

const STEPS = [
  {
    id: 'idle',
    duration: 1500,
    narration: 'Three Pods are running on Node-1: Pod A and Pod C at priority 100, Pod B at priority 1000. Their cpu and memory requests sum to the Node allocatable, so the Node is full and cannot accept new Pods. A new Pod is about to land at the API with priorityClassName=system-cluster-critical (numeric priority 2000000000, far above any current occupant).',
    enter(s) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setVal(s.refs.newPodChip,  '2e9 (system-cluster-critical)');
      setVal(s.refs.attemptChip, 'none');
      setVal(s.refs.victimChip,  'none');
      setVal(s.refs.focusChip,   'none');
      s.refs.pod1.style.opacity   = '1';
      s.refs.pod2.style.opacity   = '1';
      s.refs.pod3.style.opacity   = '1';
      s.refs.podNew.style.opacity = '0';
      setChainActive(s.refs.chain, -1);
    },
  },
  {
    id: 'spec',
    duration: 1900,
    narration: 'Pod NEW arrives at the API. The PriorityClass admission plugin resolves spec.priorityClassName to a numeric value (system-cluster-critical → 2000000000) and writes it into spec.priority on the Pod object. PriorityClass is the only sanctioned way to express priority, raw spec.priority on a user Pod is rejected by validation. Built-in classes are system-cluster-critical and system-node-critical (slightly higher).',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setVal(s.refs.newPodChip,  '2e9 (system-cluster-critical)');
      setVal(s.refs.attemptChip, 'pending');
      s.refs.attemptChip.classList.add('highlight');
      setVal(s.refs.victimChip,  'none');
      setVal(s.refs.focusChip,   'priority resolved at admission');
      s.refs.focusChip.classList.add('highlight');
      setWire(s, 'req', 'PriorityClass admission · spec.priority=2e9');
      s.refs.apiserver.classList.add('highlight');
      s.refs.newPodChip.classList.add('highlight');
      s.refs.pod1.style.opacity   = '1';
      s.refs.pod2.style.opacity   = '1';
      s.refs.pod3.style.opacity   = '1';
      s.refs.podNew.style.opacity = '0';
      setChainActive(s.refs.chain, 0);
      // Admission resolves the priority in place, nothing travels: the changed chips
      // take the static highlight only, no flash (info chips do not pulse).
    },
  },
  {
    id: 'attempt',
    duration: 2000,
    narration: 'Scheduler picks Pod NEW from its queue and runs the scheduling cycle. Filter plugins drop every Node that fails predicates (taints, ports, requests vs allocatable, etc.). Every Node here fails on capacity. Scheduler records the Pod as Unschedulable. If the Pod PriorityClass has preemptionPolicy=PreemptLowerPriority (the default), Scheduler enters preemption mode. PriorityClasses with preemptionPolicy=Never never preempt anyone, those Pods just wait in the queue.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setVal(s.refs.newPodChip,  '2e9 (system-cluster-critical)');
      setVal(s.refs.attemptChip, 'NoFit on all nodes');
      setVal(s.refs.victimChip,  'none');
      setVal(s.refs.focusChip,   'Unschedulable · entering preempt mode');
      s.refs.focusChip.classList.add('highlight');
      setWire(s, 'req', 'filter all nodes · NoFit · Event FailedScheduling');
      s.refs.scheduler.classList.add('highlight');
      s.refs.attemptChip.classList.add('highlight');
      s.refs.pod1.style.opacity   = '1';
      s.refs.pod2.style.opacity   = '1';
      s.refs.pod3.style.opacity   = '1';
      s.refs.podNew.style.opacity = '0';
      setChainActive(s.refs.chain, 1);
      // The scheduling cycle fails inside the Scheduler, nothing travels: the verdict
      // chips take the static highlight only, no flash (info chips do not pulse).
    },
  },
  {
    id: 'preempt',
    duration: 2600,
    narration: 'Preemption enumerates running Pods on each Node and looks for the smallest victim set whose deletion would let Pod NEW fit, with the constraint that every victim has strictly lower priority. Greedy: try lowest-priority candidates first. Pod A (priority 100) is enough on its own, freeing its 1 CPU and 1Gi memory matches Pod NEW requests. Pod C is also priority 100 but unnecessary (Pod A alone fits the resource ask). Pod B at 1000 is a valid candidate by priority but the greedy strategy prefers lower-priority victims first.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setVal(s.refs.newPodChip,  '2e9 (system-cluster-critical)');
      setVal(s.refs.attemptChip, 'preempt mode');
      s.refs.attemptChip.classList.add('highlight');
      setVal(s.refs.victimChip,  'Pod A · priority 100');
      setVal(s.refs.focusChip,   'min victim set · smallest, lowest pri');
      s.refs.focusChip.classList.add('highlight');
      setWire(s, 'req', 'preempt scan · Victim set: {Pod A}');
      s.refs.scheduler.classList.add('highlight');
      s.refs.victimChip.classList.add('highlight');
      s.refs.pod1.style.opacity   = '1';
      s.refs.pod2.style.opacity   = '1';
      s.refs.pod3.style.opacity   = '1';
      s.refs.podNew.style.opacity = '0';
      setChainActive(s.refs.chain, 2);
      if (ctx.reduced) return;
      // Scheduler scans the node over the connector to find the victim set.
      // Pod A pulses when the scan reaches it (victim flagged in victimChip).
      const scan = routePacket(s, ctx, LANE, { role: 'workloads' });
      pulsePod(s.refs.pod1, ctx, scan.arrivalMs);
    },
  },
  {
    id: 'delete',
    duration: 3400,
    narration: 'Scheduler issues a standard DELETE to /api/v1/.../pods/pod-a. Preemption uses delete (not the eviction API), so PodDisruptionBudget gates are bypassed at the API layer. The preemption algorithm does try to minimize PDB violations when picking victims, but it can violate them when no PDB-friendly victim set fits. Pod A enters Terminating with its terminationGracePeriodSeconds (preStop hook → SIGTERM → SIGKILL fallback after grace expires). Pod NEW gets status.nominatedNodeName=Node-1 written by the scheduler so other Pods do not race into the freed slot during this window.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setVal(s.refs.newPodChip,  '2e9 (system-cluster-critical)');
      setVal(s.refs.attemptChip, 'preempt · nominated Node-1');
      s.refs.attemptChip.classList.add('highlight');
      setVal(s.refs.victimChip,  'Pod A · Terminating');
      setVal(s.refs.focusChip,   'DELETE · no PDB check for preempt');
      s.refs.focusChip.classList.add('highlight');
      setWire(s, 'req', 'DELETE .../pods/pod-a · Graceful · nominatedNodeName=Node-1');
      s.refs.scheduler.classList.add('highlight');
      s.refs.victimChip.classList.add('highlight');
      // Pin final state inline so cancel does not flash to default.
      s.refs.pod1.style.opacity   = '0';
      s.refs.pod2.style.opacity   = '1';
      s.refs.pod3.style.opacity   = '1';
      s.refs.podNew.style.opacity = '0';
      setChainActive(s.refs.chain, 3);
      if (ctx.reduced) { s.refs.apiserver.classList.add('highlight'); return; }
      // DELETE hits the apiserver (top hop), then travels down the connector.
      // Pod A pulses and fades out only when the DELETE reaches the node.
      const del = topPacket(s, ctx, { from: TOP1_X + TOP1_W, to: TOP2_X, y: REQ_Y, role: 'workloads' });
      lightBoxAt(s.refs.apiserver, ctx, del.arrivalMs);
      const evict = routePacket(s, ctx, LANE, { delay: del.arrivalMs + BEAT.afterHop, fadeIn: true, role: 'workloads' });
      pulsePod(s.refs.pod1, ctx, evict.arrivalMs);
      ctx.register(s.refs.pod1.animate([{ opacity: 1 }, { opacity: 0 }], { duration: FADE.out, delay: evict.arrivalMs, fill: 'both', easing: 'ease-in' }));
    },
  },
  {
    id: 'bind',
    duration: 3400,
    narration: 'Pod A has exited gracefully and is gone. Its allocatable capacity returns to Node-1. Scheduler picks Pod NEW again, Filter+Score now passes, and binds via POST /api/v1/.../pods/pod-new/binding. Pod NEW then starts on Node-1. The controller that owns Pod A (Deployment, StatefulSet) creates a replacement which the scheduler may place on another Node, or queue if no Node has capacity. Preemption is distinct from node-pressure eviction (covered separately), where the Kubelet evicts Pods that are over their requests first, which puts BestEffort at the front, and uses Pod priority only to order that queue.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setVal(s.refs.newPodChip,  '2e9 (system-cluster-critical)');
      setVal(s.refs.attemptChip, 'bound to Node-1');
      setVal(s.refs.victimChip,  'Pod A · gone');
      s.refs.victimChip.classList.add('highlight');
      setVal(s.refs.focusChip,   'nominatedNodeName cleared');
      s.refs.focusChip.classList.add('highlight');
      setWire(s, 'req', 'POST .../pods/pod-new/binding · Node-1');
      s.refs.scheduler.classList.add('highlight');
      s.refs.attemptChip.classList.add('highlight');
      // Pin final state.
      s.refs.pod1.style.opacity   = '0';
      s.refs.pod2.style.opacity   = '1';
      s.refs.pod3.style.opacity   = '1';
      s.refs.podNew.style.opacity = '1';
      setChainActive(s.refs.chain, 4);
      if (ctx.reduced) { s.refs.apiserver.classList.add('highlight'); return; }
      // Bind hits the apiserver (top hop), then travels down the connector.
      // Pod NEW pulses once (pulse fades) and materializes in the freed slot when the bind reaches the node.
      const bind = topPacket(s, ctx, { from: TOP1_X + TOP1_W, to: TOP2_X, y: REQ_Y, role: 'workloads' });
      lightBoxAt(s.refs.apiserver, ctx, bind.arrivalMs);
      const place = routePacket(s, ctx, LANE, { delay: bind.arrivalMs + BEAT.afterHop, fadeIn: true, role: 'workloads' });
      pulsePod(s.refs.podNew, ctx, place.arrivalMs);
      ctx.register(s.refs.podNew.animate([{ opacity: 0 }, { opacity: 1 }], { duration: FADE.in, delay: place.arrivalMs, fill: 'both', easing: 'ease-out' }));
    },
  },
];

export const init = makeInit(Scene, STEPS, { posterFirst: true });
