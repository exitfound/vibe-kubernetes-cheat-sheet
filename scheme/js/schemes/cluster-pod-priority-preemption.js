import { svg, g, text } from '../lib/svg.js';
import { arrowDefs, box, pod, node, chainList, setChainActive, arrow, pathArrow } from '../lib/primitives.js';
import { valChip, setVal, pulsePod, topPacket, routePacket, relationPath, makeInit, clearHighlights, clearWires, setWire, FADE, BEAT, lightBoxAt, OPACITY } from '../lib/cluster-kit.js';

// Layout C: the panel leaves no column under it, so the pipeline keeps the right band and the chips
// form a two-across bottom strip. Panel worst case over 1600/1440/1280/1100 at heights
// 1000/900/860/800 is x<=397, y<=280, at 1100x800 on the delete step (357 characters, the card
// wraps it widest), against a longest narration of 360 on bind. NODE_Y is 404, so the clearance is
// 124 units and the frame does NOT move up to spend it: 404 is a route length and therefore a
// packet timing. The CEILING is 360 characters per narration, and it is the tightest in the
// category: until the 2026-08-04 prose pass the longest step here ran 607 characters and the panel
// measured exactly 404, ZERO clearance, sitting on the Node frame top edge. NOTHING in the gate
// reports that, because check-geometry --rules=occluded scores occluded AREA and a strip off a 128
// tall frame is under its bar. Roughly 0.5 units of panel per character is what growth costs.
// Re-measure with VW=1100 VH=800 node overlay-measure.mjs after any prose edit on this card.
// Design notes for this card: scheme/docs/CARDS.md#cluster-pod-priority-preemption

// The X grammar the card was built on, restated locally when it moved to Cluster: same numbers.
const M = 60;
const CONTENT_L = M, CONTENT_R = 1200 - M;               // 60 / 1140
const CONTENT_W = CONTENT_R - CONTENT_L;                 // 1080
const CX = (CONTENT_L + CONTENT_R) / 2;                  // 600, the canvas centre by construction

// Scheduler leads the row and is centred on CX, so the lane to the Node leaves its bottom
// midpoint and clears the pipeline column.
const TOP_Y = 40, BOX_H = 80, TOP_BOTTOM = TOP_Y + BOX_H;// 40 / 80 / 120
const TOP1_X = 420, TOP1_W = 2 * (CX - 420);             // 420..780, centred on CX
const TOP_GAP = 60;
const TOP2_X = TOP1_X + TOP1_W + TOP_GAP, TOP2_W = CONTENT_R - (TOP1_X + TOP1_W + TOP_GAP);
const TOP_CY = TOP_Y + BOX_H / 2;
const LANE_DY = 12;
const REQ_Y = TOP_CY - LANE_DY, RESP_Y = TOP_CY + LANE_DY;
const WIRE_X = (TOP1_X + TOP1_W + TOP2_X) / 2;

const LAD_X = 660, LAD_W = 480;                          // 660..1140, the pipeline
const LAD_Y = 150;                                       // 5 rows -> 150..350
const ROW_H = 32, ROW_GAP = 10;

// Chips two across, 532 wide: four across was 258 and every name ran into its own value.
const CHIP_COLS = 2, CHIP_GAP = 16, CHIP_VGAP = 8, CHIP_H = 34;
const CHIP_W = (CONTENT_W - CHIP_GAP * (CHIP_COLS - 1)) / CHIP_COLS;
const CHIPS_Y = 548;                                     // 2 rows -> 548..582 / 590..624
const CHIP_X = i => CONTENT_L + (i % CHIP_COLS) * (CHIP_W + CHIP_GAP);
const CHIP_Y = i => CHIPS_Y + Math.floor(i / CHIP_COLS) * (CHIP_H + CHIP_VGAP);

const NODE_Y = 404, NODE_H = 128;                        // 404..532, clear of the panel
const POD_W = 300, POD_H = 82, POD_Y = NODE_Y + 34;      // 438..520
const POD_PAD = 24;
const POD_INNER = { dx: 30, w: POD_W - 60, dy: 24, h: 46 };
// Cluster draws its Pods in the family violet rather than the Workloads blue.
const POD_VIOLET = '#c0b0ff';

// Pod slots spread across the frame's inner width, so the row centres on CX.
const SLOT_N = 3, SLOT_W = POD_W;
const SLOT_SPAN = CONTENT_W - POD_PAD * 2;
const SLOT_X = i => CONTENT_L + POD_PAD + i * ((SLOT_SPAN - SLOT_W) / (SLOT_N - 1));
const SLOT_CX = i => SLOT_X(i) + SLOT_W / 2;             // 234 / 600 / 966

// Everything the Scheduler sends down addresses slot 0: it is the victim it preempts and the
// slot Pod NEW is bound into. The lane therefore ends on that Pod, and the wire and the ball
// are built from this one array.
const BUS_Y = NODE_Y + 12;
const VICTIM_SLOT = 0;
// Two lanes, because two different actors reach that slot and a ball must leave the one that acts.
// SCAN_LANE is the Scheduler evaluating the Pods already on the Node: it leaves the Scheduler, which
// is centred on CX for exactly this. NODE_LANE is what the API sets in motion once a write has landed
// on it, the graceful delete of the victim and the start of the bound Pod: the Scheduler never
// reaches a Node, it writes to the API and the Node acts on what it reads. Both share the drop, so
// they read as one wiring tree with two sources, the same construction as workloads-force-deletion.
const TOP2_CX = TOP2_X + TOP2_W / 2;                     // 990
const JOG_Y = TOP_BOTTOM + 20;                           // 140, below the boxes, above the pipeline
const SCAN_LANE = [[CX, TOP_BOTTOM], [CX, BUS_Y], [SLOT_CX(VICTIM_SLOT), BUS_Y], [SLOT_CX(VICTIM_SLOT), POD_Y]];
const NODE_LANE = [[TOP2_CX, TOP_BOTTOM], [TOP2_CX, JOG_Y], [CX, JOG_Y], [CX, BUS_Y], [SLOT_CX(VICTIM_SLOT), BUS_Y], [SLOT_CX(VICTIM_SLOT), POD_Y]];


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

    const scheduler = box({ x: TOP1_X, y: TOP_Y, w: TOP1_W, h: BOX_H, label: 'Scheduler', sublabel: 'filter + Score + Preempt', role: 'cluster' });
    const apiserver = box({ x: TOP2_X, y: TOP_Y, w: TOP2_W, h: BOX_H, label: 'API', sublabel: 'PriorityClass + delete + bind', role: 'cluster' });

    root.appendChild(arrow({ x1: TOP1_X + TOP1_W, y1: REQ_Y, x2: TOP2_X, y2: REQ_Y, dim: true, dashed: true, role: 'cluster' }));
    // The answer lane is a relationship here, not a route: no step on this card names anything
    // travelling back from the API, so it carries no arrowhead and sits behind the live lane.
    root.appendChild(relationPath({ points: [[TOP2_X, RESP_Y], [TOP1_X + TOP1_W, RESP_Y]], role: 'cluster' }));

    const wireReq = text({ class: 'scheme-label code dim', x: WIRE_X, y: TOP_Y - 12, 'text-anchor': 'middle' }, [' ']);
    root.appendChild(wireReq);

    const newPodChip  = valChip({ x: CHIP_X(0), y: CHIP_Y(0), w: CHIP_W, h: CHIP_H, name: 'Pod NEW · pri', value: '2e9 (system-cluster-critical)', role: 'cluster' });
    const attemptChip = valChip({ x: CHIP_X(1), y: CHIP_Y(1), w: CHIP_W, h: CHIP_H, name: 'sched attempt',      value: 'none', role: 'cluster' });
    const victimChip  = valChip({ x: CHIP_X(2), y: CHIP_Y(2), w: CHIP_W, h: CHIP_H, name: 'victim',             value: 'none', role: 'cluster' });
    const focusChip   = valChip({ x: CHIP_X(3), y: CHIP_Y(3), w: CHIP_W, h: CHIP_H, name: 'focus',              value: 'none', role: 'cluster' });
    [newPodChip, attemptChip, victimChip, focusChip].forEach(c => root.appendChild(c));

    const chain = chainList({
      x: LAD_X, y: LAD_Y, w: LAD_W, rowH: ROW_H, gap: ROW_GAP,
      items: [
        '1. spec    ·  priorityClassName → spec.priority',
        '2. attempt ·  Filter + Score · NoFit on every node',
        '3. preempt ·  find min-priority victim set',
        '4. delete  ·  standard DELETE · no PDB check',
        '5. bind    ·  nominatedNodeName → bind freed slot',
      ],
      role: 'cluster',
    });

    const nodeEl = node({ x: CONTENT_L, y: NODE_Y, w: CONTENT_W, h: NODE_H, label: 'Node-1' });

    const POD_DEFS = [
      { name: 'Pod A',   sub: 'priority: 100',  x: SLOT_X(0) },
      { name: 'Pod B',   sub: 'priority: 1000', x: SLOT_X(1) },
      { name: 'Pod C',   sub: 'priority: 100',  x: SLOT_X(2) },
      { name: 'Pod NEW', sub: 'priority: 2e9',  x: SLOT_X(0) },
    ];
    const podBoxes = [];
    const podWrappers = POD_DEFS.map((d, i) => {
      const shell = pod({ x: d.x, y: POD_Y, w: SLOT_W, h: POD_H, label: d.name, sublabel: '', containers: 0, role: 'workloads' });
      shell.style.setProperty('--workloads-color', POD_VIOLET);
      const shellRect = shell.querySelector('.scheme-pod-rect');
      if (shellRect) shellRect.style.fill = 'rgba(255, 255, 255, 0.03)';

      const innerBox = box({ x: d.x + POD_INNER.dx, y: POD_Y + POD_INNER.dy, w: POD_INNER.w, h: POD_INNER.h, label: 'app', sublabel: d.sub, role: 'workloads' });
      innerBox.style.setProperty('--workloads-color', POD_VIOLET);

      const wrap = g({ id: d.name === 'Pod NEW' ? 'podNew' : `pod${i + 1}` });
      wrap.appendChild(shell);
      wrap.appendChild(innerBox);
      podBoxes.push(innerBox);
      return wrap;
    });
    const [pod1, pod2, pod3, podNew] = podWrappers;
    const [pod1Box, pod2Box, pod3Box, podNewBox] = podBoxes;
    podNew.style.opacity = '0';

    const connector = pathArrow({ points: SCAN_LANE, dim: true, dashed: true, role: 'cluster' });
    const nodeLane  = pathArrow({ points: NODE_LANE, dim: true, dashed: true, role: 'cluster' });

    const packetLayer = g({ id: 'packetLayer' });

    // Z-order: the Node frame is a 70% opaque fill, so the lane leg that runs inside it and the
    // ball that rides it are appended after it. Ladder, Pods and actors sit above the packets.
    root.appendChild(nodeEl);
    root.appendChild(connector);
    root.appendChild(nodeLane);
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
    narration: 'Pod NEW arrives at the API. The PriorityClass admission plugin resolves spec.priorityClassName to a number, system-cluster-critical being 2000000000, and writes it into spec.priority. A raw spec.priority on a user Pod is rejected by validation, so PriorityClass is the only route. The other built-in class, system-node-critical, is slightly higher.',
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
    narration: 'Scheduler takes Pod NEW off its queue and runs a scheduling cycle. Filter plugins drop every Node failing a predicate (taints, ports, requests against allocatable), and here all of them fail on capacity, so Pod NEW is recorded Unschedulable. The default preemptionPolicy=PreemptLowerPriority opens preemption mode. A class set to Never would leave it queued.',
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
    narration: 'Preemption scans the running Pods on each Node for the smallest victim set whose deletion lets Pod NEW fit, every victim at strictly lower priority, lowest tried first. Pod A at 100 is enough alone: freeing its 1 CPU and 1Gi memory matches the Pod NEW requests. Pod C is also 100 but unneeded, and Pod B at 1000 is a candidate the greedy order never reaches.',
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
      const scan = routePacket(s, ctx, SCAN_LANE, { role: 'cluster' });
      pulsePod(s.refs.pod1, ctx, scan.arrivalMs);
    },
  },
  {
    id: 'delete',
    // The node-band ball now leaves the API rather than the Scheduler, which is 390 units
    // further along and 867ms slower end to end: 3400 cut it off mid-flight.
    duration: 4200,
    narration: 'Scheduler sends a standard DELETE for Pod A, not an eviction, so PodDisruptionBudget gates are bypassed, though victim choice prefers PDB-friendly sets. Pod A enters Terminating for its terminationGracePeriodSeconds: preStop, SIGTERM, SIGKILL. Pod NEW gets status.nominatedNodeName=Node-1, a hint, not a reservation: a higher priority Pod can still take it.',
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
      // Pin final state inline so cancel does not flash to default. Pod A is Terminating here, as
      // the victim chip says in words, so it keeps its slot at that shade.
      s.refs.pod1.style.opacity   = String(OPACITY.terminating);
      s.refs.pod2.style.opacity   = '1';
      s.refs.pod3.style.opacity   = '1';
      s.refs.podNew.style.opacity = '0';
      setChainActive(s.refs.chain, 3);
      if (ctx.reduced) { s.refs.apiserver.classList.add('highlight'); return; }
      // DELETE hits the apiserver (top hop), then travels down the connector.
      // Pod A pulses and sinks to Terminating only when the DELETE reaches the node.
      const del = topPacket(s, ctx, { from: TOP1_X + TOP1_W, to: TOP2_X, y: REQ_Y, role: 'cluster' });
      lightBoxAt(s.refs.apiserver, ctx, del.arrivalMs);
      const evict = routePacket(s, ctx, NODE_LANE, { delay: del.arrivalMs + BEAT.afterHop, fadeIn: true, role: 'cluster' });
      pulsePod(s.refs.pod1, ctx, evict.arrivalMs);
      ctx.register(s.refs.pod1.animate([{ opacity: 1 }, { opacity: OPACITY.terminating }], { duration: FADE.out, delay: evict.arrivalMs, fill: 'both', easing: 'ease-in' }));
    },
  },
  {
    id: 'bind',
    // The node-band ball now leaves the API rather than the Scheduler, which is 390 units
    // further along and 867ms slower end to end: 3400 cut it off mid-flight.
    duration: 4200,
    narration: 'Pod A exited gracefully, its capacity back on Node-1. Scheduler retries Pod NEW, Filter and Score now pass, and it binds to Node-1. The controller owning Pod A puts a replacement elsewhere or queues it. This is not node-pressure eviction, covered separately, where Kubelet evicts over-request Pods first, BestEffort leading, and priority only orders the queue.',
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
      const bind = topPacket(s, ctx, { from: TOP1_X + TOP1_W, to: TOP2_X, y: REQ_Y, role: 'cluster' });
      lightBoxAt(s.refs.apiserver, ctx, bind.arrivalMs);
      const place = routePacket(s, ctx, NODE_LANE, { delay: bind.arrivalMs + BEAT.afterHop, fadeIn: true, role: 'cluster' });
      pulsePod(s.refs.podNew, ctx, place.arrivalMs);
      ctx.register(s.refs.podNew.animate([{ opacity: 0 }, { opacity: 1 }], { duration: FADE.in, delay: place.arrivalMs, fill: 'both', easing: 'ease-out' }));
    },
  },
];

export const init = makeInit(Scene, STEPS, { posterFirst: true });
