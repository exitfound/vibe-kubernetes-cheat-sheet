import { svg, g, rect, text } from '../lib/svg.js';
import { arrowDefs, box, pod, node, chainList, setChainActive, arrow, pathArrow } from '../lib/primitives.js';
import { valChip, setVal, pulsePod, routePacket, topPacket, makeInit, clearHighlights, clearWires, setWire, FADE, BEAT, lightBoxAt, OPACITY, WL } from '../lib/workloads-kit.js';

// Layout B of the Workloads canon (WL): chips left, pipeline right, one trunk, one tap per Node.
// Panel worst case x<=397, y<=280; a longer narration invalidates that measurement.
// Design notes for this card: scheme/docs/CARDS.md#workloads-force-deletion
const PANEL_B = 280;
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
const CHIPS_TOP = PANEL_B + 20;                          // 300
const CHIP_X = WL.LADDER_X, CHIP_W = WL.LADDER_W;        // 60..540
const CHIP_Y = i => CHIPS_TOP + i * (WL.CHIP_H + CHIP_GAP);   // 300..460

const NODE_H = 134, CANVAS_B = 624;
const NODE_Y = CANVAS_B - NODE_H;                        // 490..624, the frames rest on the floor
const POD_W = 300, POD_H = 106;
const POD_Y = NODE_Y + (NODE_H - POD_H) / 2;             // 504..610, centred in the frame
const POD_INNER = { dx: 30, w: POD_W - 60, dy: 28, h: 52 };

// Two Node frames side by side, the pair filling the content width so it centres on CX.
const NODE_GAP = 40;
const N_W = (WL.W - NODE_GAP) / 2;                       // 520
const N_A_X = WL.L, N_B_X = WL.L + N_W + NODE_GAP;       // 60..580 / 620..1140
const P_A_X = N_A_X + (N_W - POD_W) / 2;                 // 170
const P_B_X = N_B_X + (N_W - POD_W) / 2;                 // 730
const P_A_CX = P_A_X + POD_W / 2, P_B_CX = P_B_X + POD_W / 2;   // 320 / 880, mirrored about CX

// Both node-band actions (the node controller losing Node-1, the StatefulSet recreating on
// Node-2) leave the API box. The trunk steps into the corridor between the two columns, drops to
// a bus below the chip column and taps down into the Pod each step addresses.
const TOP1_CX = TOP1_X + TOP1_W / 2;                     // 530
const TOP2_CX = TOP2_X + TOP2_W / 2;                     // 810
const JOG_Y = WL.TOP_BOTTOM + 20;                        // 140, below the boxes, above the ladder
const BUS_Y = NODE_Y - 15;                               // 475, between the chip column and the frames
const TRUNK = [[TOP2_CX, WL.TOP_BOTTOM], [TOP2_CX, JOG_Y], [WL.SPINE_X, JOG_Y], [WL.SPINE_X, BUS_Y]];
const NODE1_LANE = [...TRUNK, [P_A_CX, BUS_Y], [P_A_CX, POD_Y]];
const NODE2_LANE = [...TRUNK, [P_B_CX, BUS_Y], [P_B_CX, POD_Y]];


class Scene {
  constructor(host) { this.host = host; this.refs = {}; this.build(); }

  build() {
    this.host.replaceChildren();
    this.refs = {};
    const root = svg({
      class: 'diagram',
      viewBox: '0 0 1200 640',
      preserveAspectRatio: 'xMidYMid meet',
      'aria-label': 'Force deletion and stuck Terminating Pods: an unreachable Node leaves a Pod stuck, force delete risks two live instances',
      'data-style': 'outline',
    });
    root.appendChild(arrowDefs());

    const kubectl = box({ x: TOP1_X, y: WL.TOP_Y, w: TOP1_W, h: WL.BOX_H, label: 'kubectl', sublabel: 'delete pod pod-a', role: 'cluster' });
    const api     = box({ x: TOP2_X, y: WL.TOP_Y, w: TOP2_W, h: WL.BOX_H, label: 'API', sublabel: 'deletionTimestamp + etcd', role: 'cluster' });

    root.appendChild(arrow({ x1: TOP1_X + TOP1_W, y1: REQ_Y, x2: TOP2_X, y2: REQ_Y, dim: true, dashed: true, role: 'cluster' }));
    root.appendChild(arrow({ x1: TOP2_X, y1: RESP_Y, x2: TOP1_X + TOP1_W, y2: RESP_Y, dim: true, dashed: true, role: 'cluster' }));

    const wireReq = text({ class: 'scheme-label code dim', x: WIRE_X, y: WIRE_Y, 'text-anchor': 'middle', 'font-size': 9 }, [' ']);
    root.appendChild(wireReq);

    const connector = pathArrow({
      points: NODE1_LANE,
      dim: true, dashed: true, role: 'cluster',
    });
    root.appendChild(connector);

    const connectorRight = pathArrow({
      points: NODE2_LANE,
      dim: true, dashed: true, role: 'cluster',
    });
    root.appendChild(connectorRight);

    // State chips in the left band.
    const nodeChip    = valChip({ x: CHIP_X, y: CHIP_Y(0), w: CHIP_W, h: WL.CHIP_H, name: 'node-1',      value: 'Ready', role: 'workloads' });
    const podChip     = valChip({ x: CHIP_X, y: CHIP_Y(1), w: CHIP_W, h: WL.CHIP_H, name: 'Pod A',       value: 'Running', role: 'workloads' });
    const replicaChip = valChip({ x: CHIP_X, y: CHIP_Y(2), w: CHIP_W, h: WL.CHIP_H, name: 'StatefulSet', value: 'replicas 1/1', role: 'workloads' });
    const focusChip   = valChip({ x: CHIP_X, y: CHIP_Y(3), w: CHIP_W, h: WL.CHIP_H, name: 'focus',       value: 'none', role: 'workloads' });
    [nodeChip, podChip, replicaChip, focusChip].forEach(c => root.appendChild(c));

    const chain = chainList({
      x: LAD_X, y: LAD_Y, w: LAD_W, rowH: WL.ROW_H, gap: WL.ROW_GAP,
      items: [
        '1. node lost   ·  Kubelet heartbeats stop, Node NotReady',
        '2. terminating ·  deletionTimestamp set, Kubelet cannot ack',
        '3. stuck       ·  identity held, no replacement is made',
        '4. force       ·  --grace-period=0 --force drops it from etcd',
        '5. risk        ·  partitioned node may still run the old one',
      ],
      role: 'cluster',
    });

    const node1 = node({ x: N_A_X, y: NODE_Y, w: N_W, h: NODE_H, label: 'Node-1' });
    const node2 = node({ x: N_B_X, y: NODE_Y, w: N_W, h: NODE_H, label: 'Node-2' });

    const podOldShell = pod({ x: P_A_X, y: POD_Y, w: POD_W, h: POD_H, label: 'Pod A', sublabel: '', containers: 0, role: 'workloads' });
    const podOldShellRect = podOldShell.querySelector('.scheme-pod-rect');
    if (podOldShellRect) podOldShellRect.style.fill = 'rgba(255, 255, 255, 0.03)';

    const podOldBox = box({ x: P_A_X + POD_INNER.dx, y: POD_Y + POD_INNER.dy, w: POD_INNER.w, h: POD_INNER.h, label: 'app', sublabel: 'StatefulSet Pod', role: 'workloads' });

    const podOld = g({ id: 'podOld' });
    podOld.appendChild(podOldShell);
    podOld.appendChild(podOldBox);

    const podNewShell = pod({ x: P_B_X, y: POD_Y, w: POD_W, h: POD_H, label: 'Pod B', sublabel: '', containers: 0, role: 'workloads' });
    const podNewShellRect = podNewShell.querySelector('.scheme-pod-rect');
    if (podNewShellRect) podNewShellRect.style.fill = 'rgba(255, 255, 255, 0.03)';

    const podNewBox = box({ x: P_B_X + POD_INNER.dx, y: POD_Y + POD_INNER.dy, w: POD_INNER.w, h: POD_INNER.h, label: 'app', sublabel: 'recreated replica', role: 'workloads' });

    const podNew = g({ id: 'podNew' });
    podNew.style.opacity = '0';
    podNew.appendChild(podNewShell);
    podNew.appendChild(podNewBox);

    const packetLayer = g({ id: 'packetLayer' });
    root.appendChild(packetLayer);

    root.appendChild(chain);
    root.appendChild(node1);
    root.appendChild(node2);
    root.appendChild(podOld);
    root.appendChild(podNew);
    root.appendChild(kubectl);
    root.appendChild(api);

    this.host.appendChild(root);
    this.refs = {
      svg: root,
      kubectl, api, connector, connectorRight, chain, node1, node2,
      nodeChip, podChip, replicaChip, focusChip,
      podOld, podNew, podOldBox, podNewBox,
      packetLayer,
      wires: { req: wireReq },
    };
  }

  reset() { this.build(); }
}

function clearHL(s) {
  clearHighlights(s,
    ['kubectl','api','nodeChip','podChip','replicaChip','focusChip','podOldBox','podNewBox'],
    [s.refs.podOld, s.refs.podNew]);
}

// Both balls ride the lane that is actually drawn under them: same points array, no second copy.
function recreationPacket(s, ctx, { delay = 0 } = {}) {
  return routePacket(s, ctx, NODE2_LANE, { delay, fadeIn: true, role: 'workloads' });
}
function node1Packet(s, ctx, { delay = 0 } = {}) {
  return routePacket(s, ctx, NODE1_LANE, { delay, fadeIn: true, role: 'workloads' });
}
// Each lane is pinned together with the Pod it lands on. Only the right-hand pair was ever set, so
// the Node-1 lane kept a full-opacity arrowhead on a Pod that had already dimmed away.
function setPods(s, oldV, newV) {
  s.refs.podOld.style.opacity = String(oldV);
  s.refs.connector.style.opacity = String(oldV);
  s.refs.podNew.style.opacity = String(newV);
  s.refs.connectorRight.style.opacity = String(newV);
}

function setChips(s, { node, pod, replica, focus }) {
  setVal(s.refs.nodeChip, node);
  setVal(s.refs.podChip, pod);
  setVal(s.refs.replicaChip, replica);
  setVal(s.refs.focusChip, focus);
}

const STEPS = [
  {
    id: 'idle',
    duration: 1500,
    enter(s) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setChips(s, { node: 'Ready', pod: 'Running', replica: 'replicas 1/1', focus: 'none' });
      setPods(s, 1, 0);
      setChainActive(s.refs.chain, -1);
    },
  },
  {
    id: 'node-lost',
    duration: 3000,
    narration: 'Node-1 stops posting Kubelet heartbeats, from a kernel panic, a power loss or a network partition. After node-monitor-grace-period, 50s by default, the node controller sets the Node Ready condition to Unknown and marks Node-1 NotReady. The control plane can no longer observe what Pod A is actually doing.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setChips(s, { node: 'NotReady (Unknown)', pod: 'Running (last seen)', replica: 'replicas 1/1', focus: 'heartbeat lost' });
      s.refs.podChip.classList.add('highlight');
      s.refs.focusChip.classList.add('highlight');
      setWire(s, 'req', 'Node controller: Ready → Unknown');
      s.refs.api.classList.add('highlight');
      s.refs.nodeChip.classList.add('highlight');
      // Node-1 is now unobservable: the Pod is alive but nothing observes it.
      setPods(s, OPACITY.notready, 0);
      setChainActive(s.refs.chain, 0);
      if (ctx.reduced) return;
      // The node controller reaches toward Node-1 over the connector. When the
      // packet arrives the Pod pulses and dims to its unobservable shade.
      const probe = node1Packet(s, ctx);
      pulsePod(s.refs.podOld, ctx, probe.arrivalMs);
      ctx.register(s.refs.podOld.animate([{ opacity: 1 }, { opacity: OPACITY.notready }], { duration: FADE.out, delay: probe.arrivalMs, fill: 'both', easing: 'ease-in' }));
      // The lane dims on the same beat, held at full through the delay window by fill:'both' so the
      // probe is never riding a wire fainter than itself.
      ctx.register(s.refs.connector.animate([{ opacity: 1 }, { opacity: OPACITY.notready }], { duration: FADE.out, delay: probe.arrivalMs, fill: 'both', easing: 'ease-in' }));
    },
  },
  {
    id: 'terminating',
    duration: 2200,
    narration: 'A delete is issued for Pod A, by you or by the node controller clearing Pods off the lost Node. The API stamps metadata.deletionTimestamp, so the Pod reads as Terminating. Normally the Kubelet would stop the container and let the API remove the object, but Node-1 Kubelet is unreachable and nothing acknowledges the delete.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setChips(s, { node: 'NotReady (Unknown)', pod: 'Terminating', replica: 'replicas 1/1', focus: 'deletionTimestamp set' });
      s.refs.focusChip.classList.add('highlight');
      setWire(s, 'req', 'DELETE .../pods/pod-a · deletionTimestamp');
      s.refs.kubectl.classList.add('highlight');
      s.refs.podChip.classList.add('highlight');
      setPods(s, OPACITY.terminating, 0);
      setChainActive(s.refs.chain, 1);
      if (ctx.reduced) { s.refs.api.classList.add('highlight'); return; }
      const pkt = topPacket(s, ctx, { from: TOP1_X + TOP1_W, to: TOP2_X, y: REQ_Y, role: 'workloads' });
      lightBoxAt(s.refs.api, ctx, pkt.arrivalMs);
    },
  },
  {
    id: 'stuck',
    duration: 2300,
    narration: 'Pod A is stuck in Terminating with no time limit, while status.phase stays Running. The StatefulSet will not create a replacement, because the sticky identity and its RWO volume are still held by the undeleted Pod A. A leftover metadata.finalizers entry causes the same stuck Terminating, cleared by removing the finalizer rather than by force.',
    enter(s) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setChips(s, { node: 'NotReady (Unknown)', pod: 'Terminating (stuck)', replica: 'replacement blocked', focus: 'identity still held by Pod A' });
      s.refs.focusChip.classList.add('highlight');
      s.refs.podChip.classList.add('highlight');
      s.refs.replicaChip.classList.add('highlight');
      setPods(s, OPACITY.terminating, 0);
      setChainActive(s.refs.chain, 2);
      // Nothing travels while the identity is held and the Pod is untouched: the blocked
      // state shows via the static highlight only (no chip pulse).
    },
  },
  {
    id: 'force',
    duration: 2200,
    narration: 'Running kubectl delete pod pod-a --grace-period=0 --force tells the API to drop the Pod object from ETCD at once, with no wait for any Kubelet acknowledgement. The API now reports the Pod as gone, and the StatefulSet identity is free again.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setChips(s, { node: 'NotReady (Unknown)', pod: 'force-deleted', replica: 'identity freed', focus: 'object dropped from etcd' });
      s.refs.replicaChip.classList.add('highlight');
      s.refs.focusChip.classList.add('highlight');
      setWire(s, 'req', 'DELETE pod-a · --grace-period=0 --force');
      s.refs.kubectl.classList.add('highlight');
      s.refs.podChip.classList.add('highlight');
      setPods(s, OPACITY.terminated, 0);
      setChainActive(s.refs.chain, 3);
      if (ctx.reduced) { s.refs.api.classList.add('highlight'); return; }
      const pkt = topPacket(s, ctx, { from: TOP1_X + TOP1_W, to: TOP2_X, y: REQ_Y, role: 'workloads' });
      lightBoxAt(s.refs.api, ctx, pkt.arrivalMs);
      // The answer comes straight back, which is the point of --force: the API reports the object gone
      // without waiting for any Kubelet. kubectl is the source of the round trip, so it is already lit
      // and does not light again on arrival.
      topPacket(s, ctx, { from: TOP2_X, to: TOP1_X + TOP1_W, y: RESP_Y, delay: pkt.arrivalMs + BEAT.afterHop, role: 'workloads' });
    },
  },
  {
    id: 'risk',
    duration: 3500,
    narration: 'The StatefulSet immediately recreates the replica, here as Pod B on Node-2. The danger: if Node-1 was only network-partitioned, its Kubelet is alive and the original Pod A still runs there. Pod A and Pod B now share one StatefulSet identity and the same volume, which corrupts data. Force-delete only after the Node is confirmed dead, or delete the Node object so its Pods are garbage-collected cleanly.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setChips(s, { node: 'partitioned, still live', pod: 'maybe still running', replica: 'identity live twice', focus: 'split-brain hazard' });
      s.refs.nodeChip.classList.add('highlight');
      s.refs.podChip.classList.add('highlight');
      setWire(s, 'req', 'StatefulSet recreates pod-b on Node-2');
      s.refs.replicaChip.classList.add('highlight');
      s.refs.focusChip.classList.add('highlight');
      // Each lane appears and dims with the Pod it ends on: before this step Pod B does not exist
      // and an arrow into it would point at nothing.
      // Pod A comes UP from terminated to notready here, and that rise is the whole step: the API
      // believes it is gone, the chips say it may still be running.
      setPods(s, OPACITY.notready, 1);
      setChainActive(s.refs.chain, 4);
      // podNew appears on arrival, so pulse it then. Lighting podNewBox in enter() would
      // auto-pulse it at delay 0 while the Pod is still invisible (and double with pulsePod).
      if (ctx.reduced) { s.refs.podNewBox.classList.add('highlight'); return; }
      const recreate = recreationPacket(s, ctx);
      ctx.register(s.refs.podNew.animate([{ opacity: 0 }, { opacity: 1 }], { duration: FADE.in, delay: recreate.arrivalMs, fill: 'both', easing: 'ease-out' }));
      pulsePod(s.refs.podNew, ctx, recreate.arrivalMs);
    },
  },
];

export const init = makeInit(Scene, STEPS, { posterFirst: true });
