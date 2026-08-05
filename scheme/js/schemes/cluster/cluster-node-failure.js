import { svg, g, text } from '../../lib/svg.js';
import { arrowDefs, node, box, cylinder, chainList, setChainActive, pathArrow, podShell } from '../../lib/primitives.js';
import { valChip, setVal, pulsePod, routePacket, makeInit, clearHighlights, clearWires, setWire, relationPath, FADE, lightBoxAt, laneOf, OPACITY } from './cluster-kit.js';
// Design notes for this card: ./CARDS.md#cluster-node-failure

// Layout C: six ladder rows plus two Node frames plus six chips do not leave room for a left
// column, so the ladder stays right and the chips take a two-row bottom strip. Panel x<=397, y<=280.
const M = 60;
const CONTENT_L = M, CONTENT_R = 1200 - M;               // 60 / 1140
const CX = (CONTENT_L + CONTENT_R) / 2;                  // 600, the canvas centre by construction
// Reserved narration corner: 400 x 280, measured. Nothing derives from it, so it stays a note
// rather than a constant nobody reads.

const TOP_Y = 40, TOP_H = 80, TOP_BOTTOM = TOP_Y + TOP_H;    // 40 / 120
const CTRL_W = 300, LEASE_W = 130, TOP_GAP = 70;
const CTRL_X = CX - CTRL_W / 2, CTRL_R = CTRL_X + CTRL_W;// 450..750, centred so its spine is on CX
const LEASE_X = CTRL_R + TOP_GAP;                        // 820..950
const LEASE_CX = LEASE_X + LEASE_W / 2;                  // 885
const TOP_CY = TOP_Y + TOP_H / 2;                        // 80
const WIRE_X = (CTRL_R + LEASE_X) / 2;                   // 785
const WIRE_Y = TOP_Y - 14;                               // 26, above the row: the lanes own below it

const LADDER_X = 660, LADDER_W = 480;                    // 660..1140
const LADDER_Y = 152, ROW_H = 32, ROW_GAP = 10;          // 6 rows -> 152..394

// Two Nodes centred on CX, each anchored on its OUTER edge and shrinking inwards, so the corridor
// between them is 196 and the reschedule lane gets a real 98 unit run into Node-2.
const NODE_W = 442, NODE_H = 132;                        // 520 shrunk 15% from the inner edge
const NODE_Y = 406, NODE_BOTTOM = NODE_Y + NODE_H;       // 406..538
const NODE_A_X = CONTENT_L, NODE_A_R = NODE_A_X + NODE_W;// 60..502
const NODE_B_X = CONTENT_R - NODE_W;                     // 698..1140
const POD_W = 300, POD_H = 106, POD_Y = NODE_Y + 16;     // 422..528
const POD_A_X = NODE_A_X + (NODE_W - POD_W) / 2;         // 131..431
const POD_B_X = NODE_B_X + (NODE_W - POD_W) / 2;         // 769..1069
const POD_INNER = { dx: 30, w: POD_W - 60, dy: 28, h: 52 };
// Frame midpoints, which is where every lane on this card now starts and ends.
const NODE_A_CX = NODE_A_X + NODE_W / 2;                 // 281
const NODE_CY = NODE_Y + NODE_H / 2;                     // 472

// THREE per row: five across leaves 206 units and the taint value alone needs 335. Six chips, so
// row 1 is "is the Node alive" and row 2 is "what happens to its Pods".
const CHIP_H = 32, CHIP_GAP = 14, CHIP_VGAP = 8, CHIP_COLS = 3;
const CHIPS_Y = NODE_BOTTOM + 14;                        // 552, second row ends on 624
const CHIPS_W = CONTENT_R - CONTENT_L;                   // 1080
const CHIP_W = (CHIPS_W - CHIP_GAP * (CHIP_COLS - 1)) / CHIP_COLS;    // 350.67
const CHIP_X = i => CONTENT_L + (i % CHIP_COLS) * (CHIP_W + CHIP_GAP);
const CHIP_Y = i => CHIPS_Y + Math.floor(i / CHIP_COLS) * (CHIP_H + CHIP_VGAP);

// Every lane starts and ends on a NODE FRAME face, never on a Pod inside one: which Pod the step
// lands on is carried by the pulse. No Pod renews a Lease either, the Kubelet on the Node does.
const LANE_DX = 12;                                      // the two lanes share the Node-1 top face
// The heartbeat riser and the reschedule drop share the 502..660 band, so 640 keeps 20 off the
// ladder and 40 off the drop: wide enough that the two do not read as one LANE_DX pair.
const GUTTER_X = LADDER_X - 20;                          // 640, between the drop and the ladder
const UNDER_TOP_Y = TOP_BOTTOM + 16;                     // 136, below the top row, above the ladder
const EV_JOG_Y = NODE_Y - 66;                            // 340, the outbound lane of the corridor
const HB_JOG_Y = NODE_Y - 44;                            // 362, the return lane, 22 below it

const HEARTBEAT_CONNECTOR = [[NODE_A_CX + LANE_DX, NODE_Y], [NODE_A_CX + LANE_DX, HB_JOG_Y], [GUTTER_X, HB_JOG_Y], [GUTTER_X, UNDER_TOP_Y], [LEASE_CX, UNDER_TOP_Y], [LEASE_CX, TOP_BOTTOM]];
// Both leave the controller, the actor both steps name. NOT a mirrored pair: Node-2's top face is
// unreachable under the ladder, so the reschedule takes the corridor and the midpoint outright.
const RS_X = CX;                                         // 600, corridor centre and face midpoint
const EV_X = CX - LANE_DX * 2;                           // 576, clear of it by 24
const EVICT_CONNECTOR     = [[EV_X, TOP_BOTTOM], [EV_X, EV_JOG_Y], [NODE_A_CX - LANE_DX, EV_JOG_Y], [NODE_A_CX - LANE_DX, NODE_Y]];
const RESCHED_CONNECTOR   = [[RS_X, TOP_BOTTOM], [RS_X, NODE_CY], [NODE_B_X, NODE_CY]];

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

    // The sublabel names BOTH: since 1.29 they are independent components and this card makes them
    // do different things one step apart, so naming one denies the actor the next step names.
    const ctrl  = box({ x: CTRL_X, y: TOP_Y, w: CTRL_W, h: TOP_H, label: 'controller-manager', sublabel: 'node-lifecycle + taint-eviction', role: 'cluster' });
    // The heartbeat lane climbs into the Lease on its bottom midpoint, LEASE_CX.
    const lease = cylinder({ x: LEASE_X, y: TOP_Y, w: LEASE_W, h: TOP_H, label: 'Lease', role: 'cluster' });

    // One relationship line, not a pair of arrows: the status flip is COMPUTED on the controller
    // from an expired Lease, so nothing travels between them on any step.
    root.appendChild(relationPath({ points: [[CTRL_R, TOP_CY], [LEASE_X, TOP_CY]], role: 'cluster' }));

    // Heartbeat connector: Node-1 top centre up and over into the Lease bottom centre.
    const hbLane = pathArrow({ points: HEARTBEAT_CONNECTOR, dim: true, dashed: true, role: 'cluster' });
    root.appendChild(hbLane);

    // Two controller-sourced lanes into the Node band: the eviction DELETE drops onto the Node-1
    // frame, and the creation of the replacement turns into the Node-2 frame.
    const evictLane = pathArrow({ points: EVICT_CONNECTOR,   dim: true, dashed: true, role: 'cluster' });
    const reschedLane = pathArrow({ points: RESCHED_CONNECTOR, dim: true, dashed: true, role: 'cluster' });
    root.appendChild(evictLane);
    root.appendChild(reschedLane);

    const wireCtrl = text({ class: 'scheme-label code dim', x: WIRE_X, y: WIRE_Y, 'text-anchor': 'middle' }, [' ']);
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

    // Row 1, the detection trio. The grace period is the THRESHOLD the Lease age is measured
    // against: it is what makes 30s of staleness harmless and 52s fatal.
    const readyChip = valChip({ x: CHIP_X(0), y: CHIP_Y(0), w: CHIP_W, h: CHIP_H, name: 'Ready',      value: 'True', role: 'cluster' });
    const leaseChip = valChip({ x: CHIP_X(1), y: CHIP_Y(1), w: CHIP_W, h: CHIP_H, name: 'Lease age',  value: '2s · Fresh', role: 'cluster' });
    const graceChip = valChip({ x: CHIP_X(2), y: CHIP_Y(2), w: CHIP_W, h: CHIP_H, name: 'grace period', value: '50s · not reached', role: 'cluster' });
    // Row 2, the eviction trio.
    const taintChip = valChip({ x: CHIP_X(3), y: CHIP_Y(3), w: CHIP_W, h: CHIP_H, name: 'Taint',          value: 'none', role: 'cluster' });
    const tolerChip = valChip({ x: CHIP_X(4), y: CHIP_Y(4), w: CHIP_W, h: CHIP_H, name: 'Toleration',     value: 'none', role: 'cluster' });
    const evictChip = valChip({ x: CHIP_X(5), y: CHIP_Y(5), w: CHIP_W, h: CHIP_H, name: 'eviction timer', value: 'none', role: 'cluster' });
    [readyChip, leaseChip, graceChip, taintChip, tolerChip, evictChip].forEach(c => root.appendChild(c));

    // Bottom row: two worker nodes side-by-side. Node-1 is the failing one, Node-2 the target.
    const nodeA = node({ x: NODE_A_X, y: NODE_Y, w: NODE_W, h: NODE_H, label: 'Node-1' });
    const nodeB = node({ x: NODE_B_X, y: NODE_Y, w: NODE_W, h: NODE_H, label: 'Node-2' });

    // Failing node hosts the running Pod that gets evicted.
    const podAShell = podShell({ x: POD_A_X, y: POD_Y, w: POD_W, h: POD_H, label: 'Pod', sublabel: ' ', containers: 0, role: 'workloads' });
    podAShell.style.setProperty('--workloads-color', '#c0b0ff');

    const podABox = box({ x: POD_A_X + POD_INNER.dx, y: POD_Y + POD_INNER.dy, w: POD_INNER.w, h: POD_INNER.h, label: 'app-pod', sublabel: 'nginx:1.27', role: 'workloads' });
    podABox.style.setProperty('--workloads-color', '#c0b0ff');

    const podA = g({ id: 'podA' });
    podA.appendChild(podAShell);
    podA.appendChild(podABox);

    // Target node receives the rescheduled replacement Pod (hidden until reschedule).
    const podBShell = podShell({ x: POD_B_X, y: POD_Y, w: POD_W, h: POD_H, label: 'Pod', sublabel: ' ', containers: 0, role: 'workloads' });
    podBShell.style.setProperty('--workloads-color', '#c0b0ff');

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
      readyChip, leaseChip, graceChip, taintChip, tolerChip, evictChip,
      chain,
      nodeA, nodeB, podA, podB, podABox, podBBox,
      hbLane, evictLane, reschedLane,
      packetLayer,
      wires: { ctrl: wireCtrl },
    };
  }

  reset() { this.build(); }
}

function resetStep(s) {
  s.refs.packetLayer.replaceChildren();
  clearHighlights(s,
    ['ctrl', 'lease', 'readyChip', 'leaseChip', 'graceChip', 'taintChip', 'tolerChip', 'evictChip'],
    [s.refs.podA, s.refs.podB]);
  clearWires(s);
}
function resetNodeOpacity(s) {
  s.refs.nodeA.style.opacity = '1';
  s.refs.nodeB.style.opacity = '1';
  s.refs.podA.style.opacity = '1';
  // Nothing has travelled controller -> Node-2 until the reschedule, and an arrowhead into Node-2
  // five steps early promises a delivery that never comes, so that lane starts dark.
  setLanes(s, 1, 0);
}
// A lane carries the shade of the dimmer of its two ends, and here that is always the Node-1 frame,
// so pass the FRAME shade. The reschedule lane never touches Node-1: it is drawn or it is not.
function setLanes(s, nodeA, resched) {
  s.refs.hbLane.style.opacity = laneOf(nodeA, OPACITY.running);
  s.refs.evictLane.style.opacity = laneOf(nodeA, OPACITY.running);
  s.refs.reschedLane.style.opacity = String(resched);
}

// Every enter() writes EVERY chip through this, the poster step included, or the last step counts
// an eviction timer down on a Pod its own narration has replaced.
function setChips(s, { ready, lease, grace, taint, toler, evict }) {
  setVal(s.refs.readyChip, ready);
  setVal(s.refs.leaseChip, lease);
  setVal(s.refs.graceChip, grace);
  setVal(s.refs.taintChip, taint);
  setVal(s.refs.tolerChip, toler);
  setVal(s.refs.evictChip, evict);
}

const STEPS = [
  {
    id: 'healthy',
    duration: 1500,
    enter(s) {
      resetStep(s);
      resetNodeOpacity(s);
      setChips(s, { ready: 'True', lease: '2s · Fresh', grace: '50s · not reached', taint: 'none', toler: 'none', evict: 'none' });
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
      resetStep(s);
      resetNodeOpacity(s);
      setChips(s, { ready: 'True', lease: '2s · Fresh · renewed', grace: '50s · not reached', taint: 'none', toler: 'none', evict: 'none' });
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
      resetStep(s);
      resetNodeOpacity(s);
      s.refs.podB.style.opacity = '0';
      setChips(s, { ready: 'True (Stale Lease)', lease: '30s · Stale', grace: '50s · not reached', taint: 'none', toler: 'none', evict: 'none' });
      s.refs.readyChip.classList.add('highlight');
      s.refs.leaseChip.classList.add('highlight');
      // The threshold is the whole reason this step changes nothing else: 30s of staleness is
      // under 50s, so Ready is still True and no Pod has been touched.
      s.refs.graceChip.classList.add('highlight');
      // Pin opacity inline so cancel between steps does not flash to default. The two lanes that end
      // on the frame take its new shade with it, here and on every step after this one.
      s.refs.nodeA.style.opacity = String(OPACITY.notready);
      setLanes(s, OPACITY.notready, 0);
      setChainActive(s.refs.chain, 1);
      if (ctx.reduced) return;
      [s.refs.nodeA, s.refs.hbLane, s.refs.evictLane].forEach(el => ctx.register(
        el.animate([{ opacity: 1 }, { opacity: OPACITY.notready }], { duration: FADE.out, fill: 'forwards', easing: 'ease-in' })));
    },
  },
  {
    id: 'not-ready',
    duration: 2000,
    narration: 'After --node-monitor-grace-period (default 50s), the Node-lifecycle-controller flips Ready from True to Unknown: it cannot tell whether Node-1 died or is just unreachable. Pods are still on the Node, and eviction has not started.',
    enter(s) {
      resetStep(s);
      s.refs.nodeA.style.opacity = String(OPACITY.notready);
      s.refs.nodeB.style.opacity = '1';
      s.refs.podA.style.opacity = '1';
      s.refs.podB.style.opacity = '0';
      setChips(s, { ready: 'Unknown · unreachable', lease: '52s · Expired', grace: '50s · exceeded', taint: 'none', toler: 'none', evict: 'none' });
      setLanes(s, OPACITY.notready, 0);
      s.refs.leaseChip.classList.add('highlight');
      s.refs.readyChip.classList.add('highlight');
      s.refs.graceChip.classList.add('highlight');
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
    narration: 'The node-lifecycle-controller adds the taint node.kubernetes.io/unreachable:NoExecute. Kubernetes had already given this Pod a 300s toleration for it, which it does for any Pod that does not set one itself. DaemonSet Pods set theirs with no tolerationSeconds, so this never evicts them. The 300s now ticks down.',
    enter(s) {
      resetStep(s);
      s.refs.nodeA.style.opacity = String(OPACITY.notready);
      s.refs.nodeB.style.opacity = '1';
      s.refs.podA.style.opacity = '1';
      s.refs.podB.style.opacity = '0';
      setChips(s, { ready: 'Unknown · unreachable', lease: '52s · Expired', grace: '50s · exceeded', taint: 'node.kubernetes.io/unreachable:NoExecute', toler: 'NoExecute · 300s', evict: '300s · Counting down' });
      setLanes(s, OPACITY.notready, 0);
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
      resetStep(s);
      s.refs.nodeA.style.opacity = String(OPACITY.notready);
      s.refs.nodeB.style.opacity = '1';
      s.refs.podB.style.opacity = '0';
      setChips(s, { ready: 'Unknown · unreachable', lease: '52s · Expired', grace: '50s · exceeded', taint: 'node.kubernetes.io/unreachable:NoExecute', toler: 'NoExecute · 300s', evict: '0s · Terminating' });
      s.refs.evictChip.classList.add('highlight');
      s.refs.ctrl.classList.add('highlight');
      setWire(s, 'ctrl', 'DELETE /api/v1/.../pods/{name} · taint-eviction');
      setChainActive(s.refs.chain, 4);
      // Terminating is a phase, not an absence, so the Pod stays drawn at that shade. Its two lanes
      // do NOT follow it: both end on the Node-1 frame and hold the frame shade.
      s.refs.podA.style.opacity = String(OPACITY.terminating);
      setLanes(s, OPACITY.notready, 0);
      if (ctx.reduced) return;
      // The DELETE travels from the controller down the left margin to the Pod on
      // Node-1; the Pod flinches and sinks to Terminating when the packet reaches it.
      const del = routePacket(s, ctx, EVICT_CONNECTOR, { role: 'cluster' });
      pulsePod(s.refs.podA, ctx, del.arrivalMs);
      ctx.register(s.refs.podA.animate([{ opacity: 1 }, { opacity: OPACITY.terminating }], { duration: FADE.out, delay: del.arrivalMs, fill: 'both', easing: 'ease-in' }));
    },
  },
  {
    id: 'reschedule',
    duration: 2600,
    narration: 'The owning controller (Deployment via its ReplicaSet) sees the missing replica and creates a replacement Pod. Scheduler picks the healthy Node-2 and Kubelet there starts it. End-to-end recovery takes about 50s plus 300s by default, the grace period plus the toleration.',
    enter(s, ctx) {
      resetStep(s);
      s.refs.nodeA.style.opacity = String(OPACITY.notready);
      s.refs.nodeB.style.opacity = '1';
      // The old Pod is still Terminating, not gone, so it keeps that shade. Its lanes keep the
      // Node-1 frame shade, which is what they end on.
      s.refs.podA.style.opacity = String(OPACITY.terminating);
      setChips(s, { ready: 'Unknown · unreachable', lease: 'over 350s · Expired', grace: '50s · exceeded', taint: 'node.kubernetes.io/unreachable:NoExecute', toler: 'NoExecute · 300s', evict: 'none · Node-2 has no taint' });
      // The two chips that move on this step carry the card's usual cue. The Lease age IS the
      // 50s plus 300s the narration adds up, and the timer has nothing left to run against.
      s.refs.leaseChip.classList.add('highlight');
      s.refs.evictChip.classList.add('highlight');
      s.refs.ctrl.classList.add('highlight');
      setWire(s, 'ctrl', 'Deployment recreates replica · Scheduler binds Node-2');
      setChainActive(s.refs.chain, 5);
      // Pin final state inline. The reschedule lane comes on now: it ends on the Node-2 frame, and
      // this is the first step on which anything travels there.
      s.refs.podB.style.opacity = '1';
      setLanes(s, OPACITY.notready, 1);
      if (ctx.reduced) return;
      // Nothing moves from the dying Pod: the controller CREATES a replacement, so the ball leaves
      // the controller and the new Pod materialises and pulses only when it arrives on Node-2.
      const bind = routePacket(s, ctx, RESCHED_CONNECTOR, { role: 'cluster' });
      ctx.register(s.refs.podB.animate([{ opacity: 0 }, { opacity: 1 }], { duration: FADE.in, delay: bind.arrivalMs, fill: 'both', easing: 'ease-out' }));
      pulsePod(s.refs.podB, ctx, bind.arrivalMs);
    },
  },
];

export const init = makeInit(Scene, STEPS, { posterFirst: true });
