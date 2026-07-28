import { svg, g, text } from '../lib/svg.js';
import { arrowDefs, pod, node, box, cylinder, chainList, setChainActive, arrow, pathArrow } from '../lib/primitives.js';
import { valChip, setVal, pulsePod, routePacket, makeInit, clearHighlights, clearWires, setWire, FADE, lightBoxAt, OPACITY } from '../lib/cluster-kit.js';
// Design notes for this card: scheme/docs/CARDS.md#cluster-node-failure

// Layout C: six ladder rows plus two Node frames plus five chips do not leave room for a left
// column, so the ladder stays right and the chips take a two-row bottom strip. Panel x<=397, y<=280.
const M = 60;
const CONTENT_L = M, CONTENT_R = 1200 - M;               // 60 / 1140
const CX = (CONTENT_L + CONTENT_R) / 2;                  // 600, the canvas centre by construction
const PANEL_R = 400, PANEL_B = 280;                      // the reserved corner, measured

const TOP_Y = 40, TOP_H = 80, TOP_BOTTOM = TOP_Y + TOP_H;    // 40 / 120
const CTRL_W = 300, LEASE_W = 130, TOP_GAP = 70;
const CTRL_X = CX - CTRL_W / 2, CTRL_R = CTRL_X + CTRL_W;// 450..750, centred so its spine is on CX
const LEASE_X = CTRL_R + TOP_GAP;                        // 820..950
const LEASE_CX = LEASE_X + LEASE_W / 2;                  // 885
const LANE_DY = 15, TOP_CY = TOP_Y + TOP_H / 2;          // 80
const READ_Y = TOP_CY - LANE_DY, WRITE_Y = TOP_CY + LANE_DY;  // 65 / 95
const WIRE_X = (CTRL_R + LEASE_X) / 2;                   // 785
const WIRE_Y = TOP_Y - 14;                               // 26, above the row: the lanes own below it

const LADDER_X = 660, LADDER_W = 480;                    // 660..1140
const LADDER_Y = 152, ROW_H = 32, ROW_GAP = 10;          // 6 rows -> 152..394

// Two Nodes side by side, the pair centred on CX and using the full content width.
const NODE_W = 520, NODE_H = 132, NODE_GAP = 40;
const NODE_Y = 406, NODE_BOTTOM = NODE_Y + NODE_H;       // 406..538
const NODE_A_X = CONTENT_L, NODE_A_R = NODE_A_X + NODE_W;// 60..580
const NODE_B_X = NODE_A_R + NODE_GAP;                    // 620..1140
const POD_W = 300, POD_H = 106, POD_Y = NODE_Y + 16;     // 422..528
const POD_A_X = NODE_A_X + (NODE_W - POD_W) / 2;         // 170..470
const POD_B_X = NODE_B_X + (NODE_W - POD_W) / 2;         // 730..1030
const POD_A_CX = POD_A_X + POD_W / 2;                    // 320
const POD_CY = POD_Y + POD_H / 2;                        // 475
const POD_INNER = { dx: 30, w: POD_W - 60, dy: 28, h: 52 };

// Bottom strip, THREE per row: five across leaves 206 units and the taint value alone needs 335.
const CHIP_H = 32, CHIP_GAP = 14, CHIP_VGAP = 8, CHIP_COLS = 3;
const CHIPS_Y = NODE_BOTTOM + 14;                        // 552, second row ends on 624
const CHIPS_W = CONTENT_R - CONTENT_L;                   // 1080
const CHIP_W = (CHIPS_W - CHIP_GAP * (CHIP_COLS - 1)) / CHIP_COLS;    // 350.67
const CHIP_X = i => CONTENT_L + (i % CHIP_COLS) * (CHIP_W + CHIP_GAP);
const CHIP_Y = i => CHIPS_Y + Math.floor(i / CHIP_COLS) * (CHIP_H + CHIP_VGAP);

// Every lane ends ON the Pod it addresses, never on the frame edge above it, and none of them may
// cross the ladder: both verticals stay left of LADDER_X and meet the top row through GUTTER_X.
const LANE_DX = 12;                                      // the two lanes share the Pod top face
const GUTTER_X = LADDER_X - 40;                          // 620, the corridor between Pods and ladder
const UNDER_TOP_Y = TOP_BOTTOM + 16;                     // 136, below the top row, above the ladder
const EV_JOG_Y = NODE_Y - 66;                            // 340, the outbound lane of the corridor
const HB_JOG_Y = NODE_Y - 44;                            // 362, the return lane, 22 below it

const HEARTBEAT_CONNECTOR = [[POD_A_CX + LANE_DX, POD_Y], [POD_A_CX + LANE_DX, HB_JOG_Y], [GUTTER_X, HB_JOG_Y], [GUTTER_X, UNDER_TOP_Y], [LEASE_CX, UNDER_TOP_Y], [LEASE_CX, TOP_BOTTOM]];
const EVICT_CONNECTOR     = [[CX, TOP_BOTTOM], [CX, EV_JOG_Y], [POD_A_CX - LANE_DX, EV_JOG_Y], [POD_A_CX - LANE_DX, POD_Y]];
const RESCHED_CONNECTOR   = [[POD_A_X + POD_W, POD_CY], [POD_B_X, POD_CY]];

class Scene {
  constructor(host) { this.host = host; this.refs = {}; this.build(); }

  build() {
    this.host.replaceChildren();
    this.refs = {};
    const root = svg({
      class: 'diagram',
      viewBox: '0 0 1200 640',
      preserveAspectRatio: 'xMidYMid meet',
      'aria-label': 'Node failure and eviction: lease heartbeat loss, Ready flips to Unknown, NoExecute taint, taint-eviction delete, reschedule',
      'data-style': 'outline',
    });
    root.appendChild(arrowDefs());

    const ctrl  = box({ x: CTRL_X, y: TOP_Y, w: CTRL_W, h: TOP_H, label: 'controller-manager', sublabel: 'node-lifecycle-controller', role: 'cluster' });
    // The heartbeat lane climbs into the Lease on its bottom midpoint, LEASE_CX.
    const lease = cylinder({ x: LEASE_X, y: TOP_Y, w: LEASE_W, h: TOP_H, label: 'Lease', role: 'cluster' });

    // Top-row lanes, one per direction, straddling the row centre line by LANE_DY.
    root.appendChild(arrow({ x1: CTRL_R, y1: READ_Y,  x2: LEASE_X, y2: READ_Y,  dim: true, dashed: true, role: 'cluster' }));
    root.appendChild(arrow({ x1: LEASE_X, y1: WRITE_Y, x2: CTRL_R, y2: WRITE_Y, dim: true, dashed: true, role: 'cluster' }));

    // Heartbeat connector: Node-1 top centre up and over into the Lease bottom centre.
    const hbLane = pathArrow({ points: HEARTBEAT_CONNECTOR, dim: true, dashed: true, role: 'cluster' });
    root.appendChild(hbLane);

    // Controller -> failing-node connector so the eviction DELETE is carried by a
    // visible packet the Pod reacts to on arrival; reschedule bridges node to node.
    const evictLane = pathArrow({ points: EVICT_CONNECTOR,   dim: true, dashed: true, role: 'cluster' });
    const reschedLane = pathArrow({ points: RESCHED_CONNECTOR, dim: true, dashed: true, role: 'cluster' });
    root.appendChild(evictLane);
    root.appendChild(reschedLane);

    const wireCtrl = text({ class: 'scheme-label code dim', x: WIRE_X, y: WIRE_Y, 'text-anchor': 'middle', 'font-size': 9 }, [' ']);
    root.appendChild(wireCtrl);

    const chain = chainList({
      x: LADDER_X, y: LADDER_Y, w: LADDER_W, rowH: ROW_H, gap: ROW_GAP,
      items: [
        '1. heartbeat   ·  Lease renewed every 10s, Ready=True',
        '2. missed      ·  Kubelet stops renewing',
        '3. NotReady    ·  Ready flips to Unknown after grace',
        '4. tainted     ·  Controller adds NoExecute taint',
        '5. evicted     ·  Toleration expires, Pod terminating',
        '6. rescheduled ·  Scheduler binds replacement',
      ],
      role: 'cluster',
    });

    // State chips column on the right, each tracking one Node/Lease/Taint field.
    const readyChip = valChip({ x: CHIP_X(0), y: CHIP_Y(0), w: CHIP_W, h: CHIP_H, name: 'Ready',          value: 'True', role: 'cluster' });
    const leaseChip = valChip({ x: CHIP_X(1), y: CHIP_Y(1), w: CHIP_W, h: CHIP_H, name: 'Lease age',      value: '2s · Fresh', role: 'cluster' });
    const taintChip = valChip({ x: CHIP_X(2), y: CHIP_Y(2), w: CHIP_W, h: CHIP_H, name: 'Taint',          value: 'none', role: 'cluster' });
    const tolerChip = valChip({ x: CHIP_X(3), y: CHIP_Y(3), w: CHIP_W, h: CHIP_H, name: 'Toleration',     value: 'none', role: 'cluster' });
    const evictChip = valChip({ x: CHIP_X(4), y: CHIP_Y(4), w: CHIP_W, h: CHIP_H, name: 'eviction timer', value: 'none', role: 'cluster' });
    [readyChip, leaseChip, taintChip, tolerChip, evictChip].forEach(c => root.appendChild(c));

    // Bottom row: two worker nodes side-by-side. Node-1 is the failing one, Node-2 the target.
    const nodeA = node({ x: NODE_A_X, y: NODE_Y, w: NODE_W, h: NODE_H, label: 'Node-1' });
    const nodeB = node({ x: NODE_B_X, y: NODE_Y, w: NODE_W, h: NODE_H, label: 'Node-2' });

    // Failing node hosts the running Pod that gets evicted.
    const podAShell = pod({ x: POD_A_X, y: POD_Y, w: POD_W, h: POD_H, label: 'Pod', sublabel: ' ', containers: 0, role: 'workloads' });
    podAShell.style.setProperty('--workloads-color', '#c0b0ff');
    const podAShellRect = podAShell.querySelector('.scheme-pod-rect');
    if (podAShellRect) podAShellRect.style.fill = 'rgba(255, 255, 255, 0.03)';

    const podABox = box({ x: POD_A_X + POD_INNER.dx, y: POD_Y + POD_INNER.dy, w: POD_INNER.w, h: POD_INNER.h, label: 'app-pod', sublabel: 'nginx:1.27', role: 'workloads' });
    podABox.style.setProperty('--workloads-color', '#c0b0ff');

    const podA = g({ id: 'podA' });
    podA.appendChild(podAShell);
    podA.appendChild(podABox);

    // Target node receives the rescheduled replacement Pod (hidden until reschedule).
    const podBShell = pod({ x: POD_B_X, y: POD_Y, w: POD_W, h: POD_H, label: 'Pod', sublabel: ' ', containers: 0, role: 'workloads' });
    podBShell.style.setProperty('--workloads-color', '#c0b0ff');
    const podBShellRect = podBShell.querySelector('.scheme-pod-rect');
    if (podBShellRect) podBShellRect.style.fill = 'rgba(255, 255, 255, 0.03)';

    const podBBox = box({ x: POD_B_X + POD_INNER.dx, y: POD_Y + POD_INNER.dy, w: POD_INNER.w, h: POD_INNER.h, label: 'app-pod', sublabel: 'nginx:1.27', role: 'workloads' });
    podBBox.style.setProperty('--workloads-color', '#c0b0ff');

    const podB = g({ id: 'podB' });
    podB.style.opacity = '0';
    podB.appendChild(podBShell);
    podB.appendChild(podBBox);

    const packetLayer = g({ id: 'packetLayer' });
    root.appendChild(packetLayer);

    root.appendChild(chain);
    root.appendChild(nodeA);
    root.appendChild(nodeB);
    root.appendChild(podA);
    root.appendChild(podB);
    root.appendChild(ctrl);
    root.appendChild(lease);

    this.host.appendChild(root);
    this.refs = {
      svg: root,
      ctrl, lease,
      readyChip, leaseChip, taintChip, tolerChip, evictChip,
      chain,
      nodeA, nodeB, podA, podB, podABox, podBBox,
      hbLane, evictLane, reschedLane,
      packetLayer,
      wires: { ctrl: wireCtrl },
    };
  }

  reset() { this.build(); }
}

function clearHL(s) {
  clearHighlights(s,
    ['ctrl', 'lease', 'readyChip', 'leaseChip', 'taintChip', 'tolerChip', 'evictChip'],
    [s.refs.podA, s.refs.podB]);
}
function resetNodeOpacity(s) {
  s.refs.nodeA.style.opacity = '1';
  s.refs.nodeB.style.opacity = '1';
  s.refs.podA.style.opacity = '1';
  // A lane is only drawn while the Pod on its end exists: both Node-1 lanes end on the Pod that
  // gets evicted, and the reschedule lane ends on a replacement that does not exist yet.
  setLanes(s, 1, 1, 0);
}
function setLanes(s, hb, evict, resched) {
  s.refs.hbLane.style.opacity = String(hb);
  s.refs.evictLane.style.opacity = String(evict);
  s.refs.reschedLane.style.opacity = String(resched);
}

const STEPS = [
  {
    id: 'healthy',
    duration: 1500,
    narration: 'Node-1 is Ready and a Pod runs on it. The Lease in kube-node-lease is fresh, and the Node-lifecycle-controller sees no anomaly on its watch. Steady state.',
    enter(s) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      resetNodeOpacity(s);
      setVal(s.refs.readyChip, 'True');
      setVal(s.refs.leaseChip, '2s · Fresh');
      setVal(s.refs.taintChip, 'none');
      setVal(s.refs.tolerChip, 'none');
      setVal(s.refs.evictChip, 'none');
      s.refs.podB.style.opacity = '0';
      // Idle baseline: nothing is happening yet, no chain row highlighted.
      setChainActive(s.refs.chain, -1);
    },
  },
  {
    id: 'heartbeat',
    duration: 2600,
    narration: 'Kubelet on Node-1 proves liveness with two heartbeats. It renews its Lease in kube-node-lease every 10s and PATCHes Node.status every 5 min. The Node-lifecycle-controller treats the fast Lease renewal as its primary liveness signal.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      resetNodeOpacity(s);
      setVal(s.refs.readyChip, 'True');
      setVal(s.refs.leaseChip, '2s · Fresh · renewed');
      s.refs.podB.style.opacity = '0';
      setWire(s, 'ctrl', 'Kubelet · PUT lease renewTime · every 10s');
      s.refs.leaseChip.classList.add('highlight');
      setChainActive(s.refs.chain, 0);
      if (ctx.reduced) { s.refs.lease.classList.add('highlight'); return; }
      const pkt = routePacket(s, ctx, HEARTBEAT_CONNECTOR, { role: 'cluster' });
      lightBoxAt(s.refs.lease, ctx, pkt.arrivalMs);
    },
  },
  {
    id: 'kubelet-stops',
    duration: 2000,
    narration: 'The Kubelet on Node-1 stops renewing (kernel panic, network partition, or Kubelet crash). The Lease grows stale, but Pods on the Node keep running for now.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      resetNodeOpacity(s);
      s.refs.podB.style.opacity = '0';
      setVal(s.refs.readyChip, 'True (Stale Lease)');
      setVal(s.refs.leaseChip, '30s · Stale');
      s.refs.readyChip.classList.add('highlight');
      s.refs.leaseChip.classList.add('highlight');
      // Pin opacity inline so cancel between steps does not flash to default.
      s.refs.nodeA.style.opacity = String(OPACITY.notready);
      setChainActive(s.refs.chain, 1);
      if (ctx.reduced) return;
      ctx.register(s.refs.nodeA.animate([{ opacity: 1 }, { opacity: OPACITY.notready }], { duration: FADE.out, fill: 'forwards', easing: 'ease-in' }));
    },
  },
  {
    id: 'not-ready',
    duration: 2000,
    narration: 'After --node-monitor-grace-period (default 50s), the Node-lifecycle-controller flips Ready from True to Unknown: it cannot tell whether Node-1 died or is just unreachable. Pods are still on the Node, and eviction has not started.',
    enter(s) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      s.refs.nodeA.style.opacity = String(OPACITY.notready);
      s.refs.nodeB.style.opacity = '1';
      s.refs.podA.style.opacity = '1';
      s.refs.podB.style.opacity = '0';
      setVal(s.refs.readyChip, 'Unknown · unreachable');
      setVal(s.refs.leaseChip, '52s · Expired');
      s.refs.leaseChip.classList.add('highlight');
      s.refs.readyChip.classList.add('highlight');
      s.refs.ctrl.classList.add('highlight');
      setWire(s, 'ctrl', 'PATCH /api/v1/nodes/Node-1/status');
      setChainActive(s.refs.chain, 2);
      // The status flip is computed on the controller from the expired Lease:
      // nothing travels and no block flashes, the changed Ready value carries it.
    },
  },
  {
    id: 'taint-applied',
    duration: 2100,
    narration: 'The controller adds the taint node.kubernetes.io/unreachable:NoExecute. The DefaultTolerationSeconds admission plugin already gave every Pod a 300s toleration for this taint, and that timer now ticks down.',
    enter(s) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      s.refs.nodeA.style.opacity = String(OPACITY.notready);
      s.refs.nodeB.style.opacity = '1';
      s.refs.podA.style.opacity = '1';
      s.refs.podB.style.opacity = '0';
      setVal(s.refs.taintChip, 'node.kubernetes.io/unreachable:NoExecute');
      setVal(s.refs.tolerChip, 'NoExecute · 300s');
      setVal(s.refs.evictChip, '300s · Counting down');
      s.refs.taintChip.classList.add('highlight');
      s.refs.tolerChip.classList.add('highlight');
      s.refs.evictChip.classList.add('highlight');
      s.refs.ctrl.classList.add('highlight');
      setWire(s, 'ctrl', 'PATCH /api/v1/nodes/Node-1 · spec.taints');
      setChainActive(s.refs.chain, 3);
      // The taint lands as a field write on the controller: nothing travels and
      // no block flashes, the new taint and toleration timer carry the step.
    },
  },
  {
    id: 'evict',
    duration: 2400,
    narration: 'Toleration expires. The taint-eviction-controller deletes the Pod with a plain DELETE that bypasses PodDisruptionBudgets (unlike kubectl drain, which uses the PDB-aware Eviction API). The Pod gets a deletionTimestamp and sits in Terminating, because the API can only finish the delete once the Kubelet confirms it, and the unreachable Node-1 still holds the orphaned container.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      s.refs.nodeA.style.opacity = String(OPACITY.notready);
      s.refs.nodeB.style.opacity = '1';
      s.refs.podB.style.opacity = '0';
      setVal(s.refs.evictChip, '0s · Terminating');
      s.refs.evictChip.classList.add('highlight');
      s.refs.ctrl.classList.add('highlight');
      setWire(s, 'ctrl', 'DELETE /api/v1/.../pods/{name} · taint-eviction');
      setChainActive(s.refs.chain, 4);
      // Pin final state so cancel does not snap back to opacity 1. Both Node-1 lanes end on this
      // Pod, so they go with it rather than outliving it as arrows into an empty frame.
      s.refs.podA.style.opacity = '0';
      setLanes(s, 0, 0, 0);
      if (ctx.reduced) return;
      // The DELETE travels from the controller down the left margin to the Pod on
      // Node-1; the Pod flinches and disappears only when the packet reaches it.
      const del = routePacket(s, ctx, EVICT_CONNECTOR, { role: 'cluster' });
      pulsePod(s.refs.podA, ctx, del.arrivalMs);
      [s.refs.podA, s.refs.hbLane, s.refs.evictLane].forEach(el => ctx.register(
        el.animate([{ opacity: 1 }, { opacity: 0 }], { duration: FADE.out, delay: del.arrivalMs, fill: 'both', easing: 'ease-in' })));
    },
  },
  {
    id: 'reschedule',
    duration: 2200,
    narration: 'The owning controller (Deployment via its ReplicaSet) sees the missing replica and creates a replacement Pod. Scheduler picks the healthy Node-2 and Kubelet there starts it. End-to-end recovery takes about 50s plus 300s by default, the grace period plus the toleration.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      s.refs.nodeA.style.opacity = String(OPACITY.notready);
      s.refs.nodeB.style.opacity = '1';
      s.refs.podA.style.opacity = '0';
      s.refs.ctrl.classList.add('highlight');
      setWire(s, 'ctrl', 'Deployment recreates replica · Scheduler binds Node-2');
      setChainActive(s.refs.chain, 5);
      // Pin final state inline. The reschedule lane is the only one left: it ends on the
      // replacement, which exists from this step on.
      s.refs.podB.style.opacity = '1';
      setLanes(s, 0, 0, 1);
      if (ctx.reduced) return;
      // The bind packet bridges Node-1 across to Node-2 (node block to node block);
      // the replacement Pod materialises and pulses only when it lands on Node-2.
      const bind = routePacket(s, ctx, RESCHED_CONNECTOR, { role: 'cluster' });
      ctx.register(s.refs.podB.animate([{ opacity: 0 }, { opacity: 1 }], { duration: FADE.in, delay: bind.arrivalMs, fill: 'both', easing: 'ease-out' }));
      pulsePod(s.refs.podB, ctx, bind.arrivalMs);
    },
  },
];

export const init = makeInit(Scene, STEPS, { posterFirst: true });
