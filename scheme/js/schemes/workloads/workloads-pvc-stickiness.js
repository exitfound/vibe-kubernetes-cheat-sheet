import { svg, g, rect, text } from '../../lib/svg.js';
import { arrowDefs, node, box, cylinder, chainList, setChainActive, arrow, pathArrow, podShell } from '../../lib/primitives.js';
import { valChip, setVal, pulsePod, routePacket, topPacket, makeInit, clearHighlights, clearWires, setWire, relationPath, FADE, BEAT, lightBoxAt, at, OPACITY, WL } from './workloads-kit.js';

// Layout C on the Workloads canon (WL in the kit): the panel reaches y<=330 (worst of
// 1600/1440/1280/1100, x<=397), which leaves no column under it, so the pipeline keeps the right
// band and the chips form a two-across bottom strip. The PV sits between the two Node frames,
// which is where the story puts it: one disk, detached from Node-1 and attached to Node-2.
// Design notes for this card: scheme/docs/CARDS.md#workloads-pvc-stickiness
const PANEL_B = 330;
const TOP1_X = 420, TOP1_W = 220;
const TOP_GAP = 60;
const TOP2_X = TOP1_X + TOP1_W + TOP_GAP, TOP2_W = 220;
const TOP_CY = WL.TOP_Y + WL.BOX_H / 2;
const REQ_Y = TOP_CY - WL.LANE_DY, RESP_Y = TOP_CY + WL.LANE_DY;
const WIRE_X = (TOP1_X + TOP1_W + TOP2_X) / 2;
const TOP1_CX = TOP1_X + TOP1_W / 2;                     // 530, and the corridor the lane uses

const LAD_X = WL.CHIP_X, LAD_W = WL.CHIP_W;              // 660..1140, the pipeline
const LAD_Y = 150;                                       // 5 rows -> 150..350

// Chips two across, 532 wide: four across was 258 and every name ran into its own value.
const CHIP_COLS = 2, CHIP_GAP = 16, CHIP_VGAP = 8;
const CHIP_W = (WL.W - CHIP_GAP * (CHIP_COLS - 1)) / CHIP_COLS;
const CHIPS_Y = 548;                                     // 2 rows -> 548..582 / 590..624
const CHIP_X = i => WL.L + (i % CHIP_COLS) * (CHIP_W + CHIP_GAP);
const CHIP_Y = i => CHIPS_Y + Math.floor(i / CHIP_COLS) * (WL.CHIP_H + CHIP_VGAP);

// Node band: two frames with the PV disk parked in the gap between them, centred on CX.
const NODE_Y = 392, NODE_H = 140;                        // 392..532
const PV_W = 140, PV_GAP = 30;
const PV_X = WL.CX - PV_W / 2;                           // 530..670
const N_W = PV_X - PV_GAP - WL.L;                        // 440
const N_A_X = WL.L, N_B_X = PV_X + PV_W + PV_GAP;        // 60..500 / 700..1140
const PV_H = 100, PV_Y = NODE_Y + (NODE_H - PV_H) / 2;   // 412..512
const PV_CY = PV_Y + PV_H / 2;                           // 462

const POD_W = 300, POD_H = 94, POD_Y = NODE_Y + 34;      // 426..520
const POD_INNER = { dx: 30, w: POD_W - 60, dy: 26, h: 50 };
const P_A_X = N_A_X + (N_W - POD_W) / 2;                 // 130
const P_B_X = N_B_X + (N_W - POD_W) / 2;                 // 770
const P_A_CX = P_A_X + POD_W / 2, P_B_CX = P_B_X + POD_W / 2;   // 280 / 920

// One control-plane trunk down the corridor left of the pipeline, a bus above the Node band and
// one tap per Node, each ending on the Pod that reacts. Wires and balls share these points.
// The trunk leaves the API, not the StatefulSet: every step that sends a ball down here is the API
// write taking effect on a Node (the eviction deleting web-0, the binding placing it on Node-2), and
// the controller only ever POSTs to the API on the top row. It steps left into the corridor at the bus
// junction so both taps stay balanced around it. Same shape as workloads-force-deletion.
const TOP2_CX = TOP2_X + TOP2_W / 2;                     // 810
const JOG_Y = WL.TOP_BOTTOM + 20;                        // 140, below the boxes, above the pipeline
const BUS_Y = NODE_Y - 20;                               // 372
const TRUNK = [[TOP2_CX, WL.TOP_BOTTOM], [TOP2_CX, JOG_Y], [TOP1_CX, JOG_Y], [TOP1_CX, BUS_Y]];
const BUS_L = [[P_A_CX, BUS_Y], [TOP1_CX, BUS_Y]];
const BUS_R = [[TOP1_CX, BUS_Y], [P_B_CX, BUS_Y]];
const TAP_A = [[P_A_CX, BUS_Y], [P_A_CX, POD_Y]];
const TAP_B = [[P_B_CX, BUS_Y], [P_B_CX, POD_Y]];
const NODE1_LANE = [...TRUNK, [P_A_CX, BUS_Y], [P_A_CX, POD_Y]];
const NODE2_LANE = [...TRUNK, [P_B_CX, BUS_Y], [P_B_CX, POD_Y]];
// The CSI reattach: the disk itself goes to web-0 on Node-2, out of the PV right face. The
// mirrored line on the left is the mount web-0 already holds on Node-1, a relationship no ball
// ever rides, so it carries no arrowhead.
const PV_LANE = [[PV_X + PV_W, PV_CY], [P_B_X, PV_CY]];
const PV_MOUNT_A = [[P_A_X + POD_W, PV_CY], [PV_X, PV_CY]];

// A trunk segment carries the ball but is not its destination, so it is drawn without a marker:
// the arrowhead belongs on the tap that lands on a Pod.
function trunkPath(points, role = 'cluster') {
  return relationPath({ points, role, dash: '5 5' });
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
      'aria-label': 'StatefulSet PVC stickiness: a Pod evicted from one Node is recreated with the same ordinal, reattaches the same PVC, sees the previous on-disk state',
      'data-style': 'outline',
    });
    root.appendChild(arrowDefs());

    const controller = box({ x: TOP1_X, y: WL.TOP_Y, w: TOP1_W, h: WL.BOX_H, label: 'StatefulSet', sublabel: 'sticky identity, sticky PVC', role: 'cluster' });
    const apiserver  = box({ x: TOP2_X, y: WL.TOP_Y, w: TOP2_W, h: WL.BOX_H, label: 'API',       sublabel: 'PVC retained on Pod delete', role: 'cluster' });
    const pv         = cylinder({ x: PV_X, y: PV_Y, w: PV_W, h: PV_H, label: 'PV cloud-vol-x', role: 'storage' });

    root.appendChild(arrow({ x1: TOP1_X + TOP1_W, y1: REQ_Y, x2: TOP2_X, y2: REQ_Y, dim: true, dashed: true, role: 'cluster' }));
    root.appendChild(arrow({ x1: TOP2_X, y1: RESP_Y, x2: TOP1_X + TOP1_W, y2: RESP_Y, dim: true, dashed: true, role: 'cluster' }));

    const wireReq = text({ class: 'scheme-label code dim', x: WIRE_X, y: WL.TOP_Y - 12, 'text-anchor': 'middle' }, [' ']);
    root.appendChild(wireReq);

    const podChip  = valChip({ x: CHIP_X(0), y: CHIP_Y(0), w: CHIP_W, h: WL.CHIP_H, name: 'pod identity',  value: 'web-0 · Running', role: 'workloads' });
    const pvcChip  = valChip({ x: CHIP_X(1), y: CHIP_Y(1), w: CHIP_W, h: WL.CHIP_H, name: 'PVC name',      value: 'data-web-0 · Bound', role: 'storage' });
    const pvChip   = valChip({ x: CHIP_X(2), y: CHIP_Y(2), w: CHIP_W, h: WL.CHIP_H, name: 'PV name',       value: 'cloud-vol-x · ReadWriteOnce', role: 'storage' });
    const dataChip = valChip({ x: CHIP_X(3), y: CHIP_Y(3), w: CHIP_W, h: WL.CHIP_H, name: 'on-disk data',  value: 'rev=1234', role: 'storage' });
    [podChip, pvcChip, pvChip, dataChip].forEach(c => root.appendChild(c));

    // Pipeline chain, 5 stages of the lifecycle.
    const chain = chainList({
      x: LAD_X, y: LAD_Y, w: LAD_W, rowH: WL.ROW_H, gap: WL.ROW_GAP,
      items: [
        '1. running  ·  web-0 on Node-1 · PV mounted at /data',
        '2. evict    ·  Pod deleted, PVC retained',
        '3. recreate ·  controller spawns web-0 again (same name)',
        '4. bind     ·  scheduler picks Node-2 · PVC stays bound',
        '5. reattach ·  CSI mounts the same PV · /data preserved',
      ],
      role: 'cluster',
    });

    const nodeA = node({ x: N_A_X, y: NODE_Y, w: N_W, h: NODE_H, label: 'Node-1' });
    const nodeB = node({ x: N_B_X, y: NODE_Y, w: N_W, h: NODE_H, label: 'Node-2' });

    // Pod web-0 on Node-1: starts visible, fades on evict.
    const podAShell = podShell({ x: P_A_X, y: POD_Y, w: POD_W, h: POD_H, label: 'web-0', sublabel: '', containers: 0, role: 'workloads' });
    const podABox = box({ x: P_A_X + POD_INNER.dx, y: POD_Y + POD_INNER.dy, w: POD_INNER.w, h: POD_INNER.h, label: 'app', sublabel: 'mount: /data', role: 'workloads' });

    const podA = g({ id: 'podA' });
    podA.appendChild(podAShell);
    podA.appendChild(podABox);

    // Pod web-0 on Node-2: hidden initially, fades in on recreate.
    const podBShell = podShell({ x: P_B_X, y: POD_Y, w: POD_W, h: POD_H, label: 'web-0', sublabel: '', containers: 0, role: 'workloads' });
    const podBBox = box({ x: P_B_X + POD_INNER.dx, y: POD_Y + POD_INNER.dy, w: POD_INNER.w, h: POD_INNER.h, label: 'app', sublabel: 'mount: /data', role: 'workloads' });

    const podB = g({ id: 'podB' });
    podB.style.opacity = '0';
    podB.appendChild(podBShell);
    podB.appendChild(podBBox);

    // One trunk and one bus above the Node band, then a tap per Node. Only the taps land on a
    // Pod, so only they take an arrowhead.
    const trunk = trunkPath(TRUNK);
    const busL = trunkPath(BUS_L);
    const busR = trunkPath(BUS_R);
    const connector = pathArrow({ points: TAP_A, dim: true, dashed: true, role: 'cluster' });
    const connectorB = pathArrow({ points: TAP_B, dim: true, dashed: true, role: 'cluster' });
    // Storage lanes: the mount web-0 holds on Node-1, and the reattach into web-0 on Node-2.
    const pvMountA = trunkPath(PV_MOUNT_A, 'storage');
    const pvConnector = pathArrow({ points: PV_LANE, dim: true, dashed: true, role: 'storage' });

    const packetLayer = g({ id: 'packetLayer' });

    // Z-order: the Node frames are a 70% opaque fill, so the lanes that run inside them and the
    // balls that ride them are appended after. Ladder, Pods and actors sit above the packets.
    root.appendChild(nodeA);
    root.appendChild(nodeB);
    [trunk, busL, busR, connector, connectorB, pvMountA, pvConnector].forEach(w => root.appendChild(w));
    root.appendChild(packetLayer);
    root.appendChild(chain);
    root.appendChild(podA);
    root.appendChild(podB);
    root.appendChild(apiserver);
    root.appendChild(controller);
    root.appendChild(pv);

    this.host.appendChild(root);
    this.refs = {
      svg: root,
      controller, apiserver, pv, chain, nodeA, nodeB, trunk, busL, busR, connector, connectorB, pvMountA, pvConnector,
      podChip, pvcChip, pvChip, dataChip,
      podA, podB, podABox, podBBox,
      packetLayer,
      wires: { req: wireReq },
    };
  }

  reset() { this.build(); }
}

// A lane into a Pod that is not there points at nothing, so each one is pinned to 0 until its
// Pod is on that Node (project canon: an absent block dims, its lanes disappear).
function setLanes(s, { toA, toB }) {
  s.refs.trunk.style.opacity = (toA || toB) ? '1' : '0';
  s.refs.busL.style.opacity = toA ? '1' : '0';
  s.refs.connector.style.opacity = toA ? '1' : '0';
  s.refs.pvMountA.style.opacity = toA ? '1' : '0';
  s.refs.busR.style.opacity = toB ? '1' : '0';
  s.refs.connectorB.style.opacity = toB ? '1' : '0';
  s.refs.pvConnector.style.opacity = toB ? '1' : '0';
}


function clearHL(s) {
  clearHighlights(s,
    ['controller','apiserver','pv','podChip','pvcChip','pvChip','dataChip','podABox','podBBox'],
    [s.refs.podA, s.refs.podB]);
}

// Packet down the trunk and the left tap, to web-0 on Node-1.
function connectorPacketA(s, ctx, { delay = 0 } = {}) {
  return routePacket(s, ctx, NODE1_LANE, { delay, fadeIn: true, role: 'workloads' });
}
// Packet down the trunk and the right tap, to web-0 on Node-2.
function connectorPacketB(s, ctx, { delay = 0 } = {}) {
  return routePacket(s, ctx, NODE2_LANE, { delay, fadeIn: true, role: 'workloads' });
}
// Storage packet from the PV across into web-0 on Node-2 (CSI attach + mount).
function pvPacket(s, ctx, { delay = 0 } = {}) {
  return routePacket(s, ctx, PV_LANE, { delay, role: 'storage', fadeIn: true });
}

const STEPS = [
  {
    id: 'idle',
    duration: 1500,
    enter(s) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      s.refs.podA.style.opacity = '1';
      s.refs.podB.style.opacity = '0';
      setLanes(s, { toA: true, toB: false });
      setVal(s.refs.podChip, 'web-0 · Running on Node-1');
      setVal(s.refs.pvcChip, 'data-web-0 · Bound');
      setVal(s.refs.pvChip, 'cloud-vol-x · ReadWriteOnce');
      setVal(s.refs.dataChip, 'rev=1234');
      setChainActive(s.refs.chain, -1);
    },
  },
  {
    id: 'evict',
    // Motion: the eviction now leaves the API, 280 units further along, and runs to 2558ms.
    duration: 2700,
    narration: 'Node-1 goes NotReady (kernel panic, power loss, network partition). After the toleration on node.kubernetes.io/unreachable expires, taint-based eviction deletes the Pod, which sits in Terminating until the Node returns or an operator clears it, and only then is the object gone. Critically, the PVC data-web-0 is NOT deleted, the StatefulSet retains it for the ordinal under the default PVC retention policy. The PV cloud-vol-x stays Bound, the cloud disk is intact, rev=1234 persists.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      s.refs.podB.style.opacity = '0';
      setLanes(s, { toA: true, toB: false });
      setVal(s.refs.podChip, 'web-0 · Terminating, then removed');
      setVal(s.refs.pvcChip, 'data-web-0 · Bound (retained)');
      setVal(s.refs.pvChip, 'cloud-vol-x · on lost Node-1');
      setVal(s.refs.dataChip, 'rev=1234 · preserved');
      setWire(s, 'req', 'DELETE Pod web-0 · Keep PVC data-web-0');
      s.refs.controller.classList.add('highlight');
      s.refs.apiserver.classList.add('highlight');
      s.refs.podChip.classList.add('highlight');
      s.refs.pvcChip.classList.add('highlight');
      s.refs.pvChip.classList.add('highlight');
      s.refs.dataChip.classList.add('highlight');
      // Pin final opacity inline so a cancel between steps does not flash it back. The chip says
      // Terminating on this step, so web-0 sinks to that shade rather than leaving its slot.
      s.refs.podA.style.opacity = String(OPACITY.terminating);
      setChainActive(s.refs.chain, 1);
      if (ctx.reduced) return;
      const del = connectorPacketA(s, ctx);
      ctx.register(s.refs.podA.animate([{ opacity: 1 }, { opacity: OPACITY.terminating }], { duration: FADE.out, delay: del.arrivalMs, fill: 'both', easing: 'ease-in' }));
    },
  },
  {
    id: 'recreate',
    duration: 2300,
    narration: 'The StatefulSet controller observes the missing replica and creates a new Pod object with the same name web-0 (sticky identity). The Pod is unbound (spec.nodeName empty). Scheduler runs filter and score on the remaining Ready Nodes. PVC data-web-0 stays Bound to PV cloud-vol-x throughout, so no re-provisioning is needed.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      s.refs.podA.style.opacity = '0';
      s.refs.podB.style.opacity = '0';
      setLanes(s, { toA: false, toB: false });
      setVal(s.refs.podChip, 'web-0 · Pending (created again)');
      setVal(s.refs.pvcChip, 'data-web-0 · Bound (reused)');
      setVal(s.refs.pvChip, 'cloud-vol-x · on lost Node-1');
      setVal(s.refs.dataChip, 'rev=1234 · preserved');
      setWire(s, 'req', 'create Pod web-0 (sticky name)');
      s.refs.podChip.classList.add('highlight');
      s.refs.pvcChip.classList.add('highlight');
      setChainActive(s.refs.chain, 2);
      if (ctx.reduced) { s.refs.controller.classList.add('highlight'); s.refs.apiserver.classList.add('highlight'); return; }
      // Control-plane only, and in the order the narration gives it: the controller OBSERVES the
      // missing replica, which is an event arriving down the answer lane, and only then posts the new
      // Pod object. The Pod is still Pending and unbound, so nothing lands on a node yet.
      const observe = topPacket(s, ctx, { from: TOP2_X, to: TOP1_X + TOP1_W, y: RESP_Y, role: 'workloads' });
      lightBoxAt(s.refs.controller, ctx, observe.arrivalMs);
      const pkt = topPacket(s, ctx, { from: TOP1_X + TOP1_W, to: TOP2_X, y: REQ_Y, delay: observe.arrivalMs + BEAT.afterHop, role: 'workloads' });
      lightBoxAt(s.refs.apiserver, ctx, pkt.arrivalMs);
    },
  },
  {
    id: 'bind',
    // Motion: the binding now leaves the API and crosses to the far Node, running to 3069ms.
    duration: 3200,
    narration: 'Scheduler binds web-0 to Node-2. POST .../pods/web-0/binding writes spec.nodeName=Node-2 in ETCD. PVC data-web-0 stays bound to the same PV cloud-vol-x. The cloud volume is ReadWriteOnce, so it can be safely attached to Node-2 only because the old Pod is fully removed from API (force-delete a stuck Pod and you risk a dual mount, see the Force Deletion card).',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      s.refs.podA.style.opacity = '0';
      setLanes(s, { toA: false, toB: true });
      setVal(s.refs.podChip, 'web-0 · bound to Node-2');
      setVal(s.refs.pvcChip, 'data-web-0 · Bound (reused)');
      setVal(s.refs.pvChip, 'cloud-vol-x · attaching to Node-2');
      setVal(s.refs.dataChip, 'rev=1234 · preserved');
      setWire(s, 'req', 'POST .../pods/web-0/binding · Node-2');
      s.refs.apiserver.classList.add('highlight');
      s.refs.podChip.classList.add('highlight');
      s.refs.pvChip.classList.add('highlight');
      // Pin final opacity inline (web-0 now placed on Node-2) so a cancel does not hide it.
      s.refs.podB.style.opacity = '1';
      setChainActive(s.refs.chain, 3);
      if (ctx.reduced) return;
      // The identity chip carried the outcome from step entry, three seconds before the Pod appeared
      // on Node-2, so it read as bound while the slot was still empty. It holds the value the previous
      // step left and turns over when the binding actually lands.
      setVal(s.refs.podChip, 'web-0 · Pending (created again)');
      const bind = connectorPacketB(s, ctx);
      at(s, ctx, bind.arrivalMs, () => setVal(s.refs.podChip, 'web-0 · bound to Node-2'));
      ctx.register(s.refs.podB.animate([{ opacity: 0 }, { opacity: 1 }], { duration: FADE.in, delay: bind.arrivalMs, fill: 'both', easing: 'ease-out' }));
      pulsePod(s.refs.podB, ctx, bind.arrivalMs);
    },
  },
  {
    id: 'reattach',
    duration: 2600,
    narration: 'Kubelet on Node-2 starts the Pod. The CSI external-attacher detaches the PV from the lost Node-1 (force-detached because that Node is unreachable), then attaches it to Node-2 via ControllerPublishVolume. The node driver runs NodeStageVolume and NodePublishVolume to mount the volume at /data inside the new container. The application reads the same files at rev=1234, no data loss. The cloud-vol-x identity, the PVC name, and the Pod name all stayed sticky to ordinal 0.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      s.refs.podA.style.opacity = '0';
      s.refs.podB.style.opacity = '1';
      setLanes(s, { toA: false, toB: true });
      setVal(s.refs.podChip, 'web-0 · Running on Node-2');
      setVal(s.refs.pvcChip, 'data-web-0 · Bound');
      setVal(s.refs.pvChip, 'cloud-vol-x · mounted on Node-2');
      setVal(s.refs.dataChip, 'rev=1234 · preserved');
      setWire(s, 'req', 'CSI attach to Node-2 · NodeStage + NodePublish · /data');
      s.refs.pv.classList.add('highlight');
      s.refs.podChip.classList.add('highlight');
      s.refs.pvcChip.classList.add('highlight');
      s.refs.pvChip.classList.add('highlight');
      s.refs.dataChip.classList.add('highlight');
      setChainActive(s.refs.chain, 4);
      if (ctx.reduced) return;
      const mount = pvPacket(s, ctx);
      pulsePod(s.refs.podB, ctx, mount.arrivalMs);
    },
  },
];

export const init = makeInit(Scene, STEPS, { posterFirst: true });
