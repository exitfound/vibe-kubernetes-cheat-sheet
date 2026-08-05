import { svg, g, text } from '../../lib/svg.js';
import { arrowDefs, box, node, cylinder, pathArrow } from '../../lib/primitives.js';
import { routePacket, makeInit, clearHighlights, clearWires, setWire, BEAT, lightBoxAt, OPACITY } from './cluster-kit.js';

// Two dashed frames of the same width, a control plane over Node-1, each holding its own tiers.
// Design notes for this card: scheme/docs/CARDS.md#cluster-architecture
const BOX_W = 220, BOX_H = 80;
const CX = 600;

// Both frames span 150..1050 with 20 of padding on each wall, so every block lives inside
// 170..1030 and the two bands read as one column. The rows are cluster-apply-flow's, to the unit.
const FRAME_X = 150, FRAME_W = 900;
const CP_Y = 90, CP_H = 350;                             // 90..440, apply-flow's frame exactly
const NODE_Y = 475, NODE_H = 153;                        // 475..628, 12 of canvas floor under it

const API_Y = 140, API_BOTTOM = API_Y + BOX_H;           // 140 / 220
const API_X = CX - BOX_W / 2, API_R = API_X + BOX_W;     // 490..710
const API_CY = API_Y + BOX_H / 2;                        // 180
const ETCD_W = 130, ETCD_X = 900;                        // 900..1030, right edge on the Scheduler below
const LANE_DY = 10;
const ETCD_OUT = API_CY - LANE_DY, ETCD_IN = API_CY + LANE_DY;   // 170 / 190

const T2_Y = 328;                                        // controller-manager, cloud-controller-manager, Scheduler
const CM_X = 170, CM_CX = CM_X + BOX_W / 2;              // 170..390, 280
const CCM_X = CX - BOX_W / 2;                            // 490..710, straight under the API
const SCHED_X = 810, SCHED_CX = SCHED_X + BOX_W / 2;     // 810..1030, 920

const T2_BELOW = T2_Y + BOX_H + 20;                      // 428, one wire label under each tier-2 box,
                                                         // 12 clear of the frame floor

const T3_Y = NODE_Y + 47;                                // 522, Runtime, Kubelet, kube-proxy.
// 47 is apply-flow's offset, copied rather than re-derived so the two Node rows sit on one line.
const RT_X = 170, KUBE_X = CX - BOX_W / 2, KP_X = 810;
const KUBE_CX = KUBE_X + BOX_W / 2, KP_CX = KP_X + BOX_W / 2;    // 600 / 920
const T3_CY = T3_Y + BOX_H / 2;                          // 562
const T3_BELOW = T3_Y + BOX_H + 14;                      // 616, tier 2's rhythm inside the Node
// frame. 14 rather than 20: the shorter frame leaves 26 under the row, so +20 lands 3 off the floor.

// Each control-plane exchange is a lane PAIR straddling the flow line, so no endpoint sits alone.
// The two Node-bound lanes are single and therefore leave the API on a face MIDPOINT instead.
const D10 = 10;
const BAND_CY = (API_BOTTOM + T2_Y) / 2;                 // 274, the middle of the band
const JOG_DOWN = BAND_CY - D10, JOG_UP = BAND_CY + D10;  // 264 / 284, centred in the 108 unit band
// L_CORR / R_CORR are the midpoints of the corridors flanking the tier-2 centre column, BAND_Y the
// free band between the frames: the two Node-bound lanes turn there and cross no block.
const L_CORR = 440, R_CORR = 760, BAND_Y = 457;          // 457 is the middle of the 440..475 band
const API_TO_ETCD = [[API_R, ETCD_OUT], [ETCD_X, ETCD_OUT]];
const ETCD_TO_API = [[ETCD_X, ETCD_IN], [API_R, ETCD_IN]];
const TO_CM    = [[API_X + 50, API_BOTTOM], [API_X + 50, JOG_DOWN], [CM_CX - D10, JOG_DOWN], [CM_CX - D10, T2_Y]];
const FROM_CM  = [[CM_CX + D10, T2_Y], [CM_CX + D10, JOG_UP], [API_X + 70, JOG_UP], [API_X + 70, API_BOTTOM]];
const TO_CCM   = [[CX - D10, API_BOTTOM], [CX - D10, T2_Y]];
const FROM_CCM = [[CX + D10, T2_Y], [CX + D10, API_BOTTOM]];
const TO_SCHED = [[API_R - 50, API_BOTTOM], [API_R - 50, JOG_DOWN], [SCHED_CX + D10, JOG_DOWN], [SCHED_CX + D10, T2_Y]];
const FROM_SCHED = [[SCHED_CX - D10, T2_Y], [SCHED_CX - D10, JOG_UP], [API_R - 70, JOG_UP], [API_R - 70, API_BOTTOM]];
const API_TO_KUBELET = [[API_X, API_CY], [L_CORR, API_CY], [L_CORR, BAND_Y], [KUBE_CX, BAND_Y], [KUBE_CX, T3_Y]];
const API_TO_KPROXY  = [[API_R, API_CY], [R_CORR, API_CY], [R_CORR, BAND_Y], [KP_CX, BAND_Y], [KP_CX, T3_Y]];
// CRI, and it runs Kubelet to Runtime because that is the direction the last step narrates.
const KUBELET_TO_RUNTIME = [[KUBE_X, T3_CY], [RT_X + BOX_W, T3_CY]];


class Scene {
  constructor(host) { this.host = host; this.refs = {}; this.build(); }

  build() {
    this.host.replaceChildren();
    this.refs = {};
    const root = svg({
      class: 'diagram',
      viewBox: '0 0 1200 640',
      preserveAspectRatio: 'xMidYMid meet',
      'aria-label': 'Kubernetes cluster architecture: the API, ETCD, the controller-manager, the cloud-controller-manager and the Scheduler inside the control plane, with the Kubelet and kube-proxy on Node-1 each watching the API for itself, and the Kubelet driving the Runtime over CRI',
      'data-style': 'outline',
    });
    root.appendChild(arrowDefs());

    // Frames first so both bands sit behind everything they hold.
    const cpEl   = node({ x: FRAME_X, y: CP_Y, w: FRAME_W, h: CP_H, label: 'Control plane' });
    const nodeEl = node({ x: FRAME_X, y: NODE_Y, w: FRAME_W, h: NODE_H, label: 'Node-1' });
    // Both frame labels sit on their own frame corner, which is where node() puts them: CONTROL
    // PLANE at (162, 108) and NODE-1 at (162, 493). What that costs is in docs/CARDS.md.
    root.appendChild(cpEl);
    root.appendChild(nodeEl);

    // Tier 1: API (centre) + ETCD (top-right). All component boxes use the
    // workloads standard size (w:220 h:80) so every block reads at one scale.
    const apisrv = box({ x: API_X, y: API_Y, w: BOX_W, h: BOX_H, label: 'API',  role: 'cluster' });
    const etcdC  = cylinder({ x: ETCD_X, y: API_Y - 10, w: ETCD_W, h: BOX_H + 30, label: 'ETCD', role: 'cluster' });
    root.appendChild(apisrv);
    root.appendChild(etcdC);

    // Tier 2: the three loop runners. Each column stands over its tier-3 neighbour,
    // and the cloud-controller-manager sits straight under the API it watches.
    const ctrlMgr = box({ x: CM_X, y: T2_Y, w: BOX_W, h: BOX_H, label: 'controller-manager', role: 'cluster' });
    // The sublabel is the doc's own qualifier: Components lists it as cloud-controller-manager
    // (optional) and an on-premises cluster runs none. Without it the centre slot reads as core.
    const ccm     = box({ x: CCM_X, y: T2_Y, w: BOX_W, h: BOX_H, label: 'cloud-controller-manager', sublabel: 'optional', role: 'cluster' });
    const sched   = box({ x: SCHED_X, y: T2_Y, w: BOX_W, h: BOX_H, label: 'Scheduler',         role: 'cluster' });
    root.appendChild(ctrlMgr);
    root.appendChild(ccm);
    root.appendChild(sched);

    // Tier 3, inside the Node frame: Runtime (left), Kubelet (centre), kube-proxy (right).
    const runtime = box({ x: RT_X, y: T3_Y, w: BOX_W, h: BOX_H, label: 'Runtime',   role: 'cluster' });
    const kubelet = box({ x: KUBE_X, y: T3_Y, w: BOX_W, h: BOX_H, label: 'Kubelet',   role: 'cluster' });
    const kproxy  = box({ x: KP_X, y: T3_Y, w: BOX_W, h: BOX_H, label: 'kube-proxy', role: 'cluster' });
    root.appendChild(runtime);
    root.appendChild(kubelet);
    root.appendChild(kproxy);

    // The lanes are built in two named groups, not one flat list, because the card shows one half
    // of the diagram at a time: ten lanes on screen at once is more than a reader can follow.
    const lane = points => pathArrow({ points, dim: true, dashed: true, role: 'cluster' });
    const cpLanes = [API_TO_ETCD, ETCD_TO_API, TO_CM, FROM_CM, TO_CCM, FROM_CCM, TO_SCHED, FROM_SCHED].map(lane);
    const nodeLanes = [API_TO_KUBELET, API_TO_KPROXY].map(lane);
    cpLanes.forEach(el => root.appendChild(el));
    nodeLanes.forEach(el => root.appendChild(el));

    // The Kubelet drives the Runtime over CRI, and the last step NAMES that call, so this is a
    // route with a ball rather than a relationship. It runs Kubelet to Runtime, the direction the
    // narration gives it, and it belongs to the Node half and mutes with it.
    const criLane = lane(KUBELET_TO_RUNTIME);
    nodeLanes.push(criLane);
    root.appendChild(criLane);

    // The two ETCD labels share one centre line in the 190 unit gap between the API and the
    // cylinder: the write above its lane, the read below its own.
    const ETCD_LABEL_X = (API_R + ETCD_X) / 2;           // 805
    const wireEtcdWrite  = text({ class: 'scheme-label code dim', x: ETCD_LABEL_X, y: ETCD_OUT - 12,  'text-anchor': 'middle' }, [' ']);
    const wireEtcdRead   = text({ class: 'scheme-label code dim', x: ETCD_LABEL_X, y: ETCD_IN + 22, 'text-anchor': 'middle' }, [' ']);
    const wireControllers = text({ class: 'scheme-label code dim', x: CM_CX, y: T2_BELOW, 'text-anchor': 'middle' }, [' ']);
    const wireCloud      = text({ class: 'scheme-label code dim', x: CX, y: T2_BELOW, 'text-anchor': 'middle' }, [' ']);
    const wireScheduler  = text({ class: 'scheme-label code dim', x: SCHED_CX, y: T2_BELOW, 'text-anchor': 'middle' }, [' ']);
    // The two Node lane labels sit UNDER the block they describe, the same way each tier-2 label
    // sits under its own box. They used to ride the horizontal run of their lane in the band
    // between the frames, which put them nowhere near the thing doing the watching.
    const wireKubelet    = text({ class: 'scheme-label code dim', x: KUBE_CX, y: T3_BELOW, 'text-anchor': 'middle' }, [' ']);
    const wireKproxy     = text({ class: 'scheme-label code dim', x: KP_CX, y: T3_BELOW, 'text-anchor': 'middle' }, [' ']);
    [wireEtcdWrite, wireEtcdRead, wireControllers, wireCloud, wireScheduler, wireKubelet, wireKproxy]
      .forEach(t => root.appendChild(t));

    const packetLayer = g({ id: 'packetLayer' });
    root.appendChild(packetLayer);

    this.host.appendChild(root);
    this.refs = {
      svg: root, apisrv, etcdC, ctrlMgr, ccm, sched, cpEl, nodeEl, kubelet, runtime, kproxy,
      cpLanes, nodeLanes,
      wires: {
        'etcd-write':  wireEtcdWrite,
        'etcd-read':   wireEtcdRead,
        controllers:   wireControllers,
        cloud:         wireCloud,
        scheduler:     wireScheduler,
        kubelet:       wireKubelet,
        kproxy:        wireKproxy,
      },
      packetLayer,
    };
  }

  reset() { this.build(); }
}

function clearHL(s) {
  clearHighlights(s, ['apisrv','etcdC','ctrlMgr','ccm','sched','kubelet','runtime','kproxy']);
}

// One helper writes BOTH groups, so they cannot drift. The two treatments differ deliberately: a
// control-plane lane out of play dims to OPACITY.notready, a Node-bound lane is not drawn at all
// and arrives on the step that uses it.
function setLanes(s, { cp, nodeTier }) {
  s.refs.cpLanes.forEach(el => { el.style.opacity = cp ? 1 : OPACITY.notready; });
  s.refs.nodeLanes.forEach(el => { el.style.opacity = nodeTier ? 1 : 0; });
}

const STEPS = [
  {
    id: 'idle',
    duration: 1500,
    enter(s) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setLanes(s, { cp: true, nodeTier: false });
    },
  },
  {
    id: 'api',
    duration: 1700,
    narration: 'The API is the only way in for clients and controllers. Every read and every write passes through it, and a write clears authentication, authorization and admission before it is stored. Replicas are stateless and scale horizontally. The one path that skips it is a static Pod, which the Kubelet reads off the Node.',
    enter(s) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setLanes(s, { cp: true, nodeTier: false });
      s.refs.apisrv.classList.add('highlight');
    },
  },
  {
    id: 'etcd',
    duration: 1700,
    narration: 'ETCD is the only durable store in the cluster, and the API is its only client. Every change is replicated through Raft, where a quorum of replicas must agree before the write is committed and the revision moves forward.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setLanes(s, { cp: true, nodeTier: false });
      s.refs.apisrv.classList.add('highlight');
      setWire(s, 'etcd-write', 'write · Raft quorum commit');
      if (ctx.reduced) { s.refs.etcdC.classList.add('highlight'); return; }
      const pkt = routePacket(s, ctx, API_TO_ETCD, { role: 'cluster' });
      lightBoxAt(s.refs.etcdC, ctx, pkt.arrivalMs);
    },
  },
  {
    id: 'etcd-response',
    duration: 1700,
    narration: 'On the way back ETCD serves reads to the API, which is a separate exchange rather than the answer to that write. A watch keeps the stream open and pushes later changes through it without another round trip. Clients watch the API, never ETCD, and it answers them from its own cache.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setLanes(s, { cp: true, nodeTier: false });
      s.refs.etcdC.classList.add('highlight');
      setWire(s, 'etcd-read', 'read · watch stream');
      if (ctx.reduced) { s.refs.apisrv.classList.add('highlight'); return; }
      const pkt = routePacket(s, ctx, ETCD_TO_API, { role: 'cluster' });
      lightBoxAt(s.refs.apisrv, ctx, pkt.arrivalMs);
    },
  },
  {
    id: 'controllers',
    duration: 2600,
    narration: 'The controller-manager runs one control loop per resource kind (Deployment, ReplicaSet, Job and so on). Each watches the API, never ETCD, and writes back to reconcile observed state with desired state.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setLanes(s, { cp: true, nodeTier: false });
      s.refs.apisrv.classList.add('highlight');
      setWire(s, 'controllers', 'watch · reconcile loop');
      if (ctx.reduced) { s.refs.ctrlMgr.classList.add('highlight'); return; }
      // Watch event in on the upper lane, reconcile write-back out on the lower one. The
      // controller-manager is dark until the watch lands: it acts on what it receives.
      const watch = routePacket(s, ctx, TO_CM, { role: 'cluster' });
      lightBoxAt(s.refs.ctrlMgr, ctx, watch.arrivalMs);
      routePacket(s, ctx, FROM_CM, { delay: watch.arrivalMs + BEAT.afterHop, role: 'cluster' });
    },
  },
  {
    id: 'cloud-controllers',
    duration: 2400,
    narration: 'The cloud-controller-manager runs the loops that talk to a cloud provider: Node lifecycle, cloud routes and Service load balancers. It is optional and a cluster on your own hardware has none. It writes what it learns back to the API, and it is split out so provider code lives outside the core.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setLanes(s, { cp: true, nodeTier: false });
      s.refs.apisrv.classList.add('highlight');
      // The lane pair runs API to CCM and back, so the label names what rides it. The call to the
      // provider is in the narration, because no provider is drawn and no ball goes to one.
      setWire(s, 'cloud', 'watch Nodes · write Node and Service status');
      if (ctx.reduced) { s.refs.ccm.classList.add('highlight'); return; }
      // Same beat as the controller-manager beside it: watch in, write-back out.
      const watch = routePacket(s, ctx, TO_CCM, { role: 'cluster' });
      lightBoxAt(s.refs.ccm, ctx, watch.arrivalMs);
      routePacket(s, ctx, FROM_CCM, { delay: watch.arrivalMs + BEAT.afterHop, role: 'cluster' });
    },
  },
  {
    id: 'scheduler',
    duration: 2600,
    narration: 'The Scheduler watches Pods that have no Node assignment yet, filters and scores the candidates, then posts a Binding back to the API. On the ordinary path that one write is all it does, and preemption is the exception where it also deletes victims. The Kubelet on the chosen Node takes it from there.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setLanes(s, { cp: true, nodeTier: false });
      s.refs.apisrv.classList.add('highlight');
      setWire(s, 'scheduler', 'watch Pods · post Binding');
      if (ctx.reduced) { s.refs.sched.classList.add('highlight'); return; }
      // Watch Pods in on the upper lane, the Binding posted back on the lower one.
      const watch = routePacket(s, ctx, TO_SCHED, { role: 'cluster' });
      lightBoxAt(s.refs.sched, ctx, watch.arrivalMs);
      routePacket(s, ctx, FROM_SCHED, { delay: watch.arrivalMs + BEAT.afterHop, role: 'cluster' });
    },
  },
  {
    id: 'node-side',
    duration: 3100,
    narration: 'The Kubelet watches the API for Pods assigned to its Node, then calls the Runtime over CRI to start their containers. Beside it kube-proxy watches the API on its own, for Services and EndpointSlices, and programs the local rules. It is optional too, and an eBPF dataplane can replace it.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      // The Node half takes over: the two lanes into the Node band are DRAWN for the first time
      // here, at full strength, and the control-plane exchanges mute behind them.
      setLanes(s, { cp: false, nodeTier: true });
      s.refs.apisrv.classList.add('highlight');
      setWire(s, 'kubelet', 'watch Pods · spec.nodeName=Node-1');
      setWire(s, 'kproxy', 'watch Services · EndpointSlices');
      if (ctx.reduced) {
        s.refs.kubelet.classList.add('highlight');
        s.refs.runtime.classList.add('highlight');
        s.refs.kproxy.classList.add('highlight');
        return;
      }
      // Two independent lanes off the API: kube-proxy is not fed by the Kubelet.
      const toKubelet = routePacket(s, ctx, API_TO_KUBELET, { role: 'cluster' });
      lightBoxAt(s.refs.kubelet, ctx, toKubelet.arrivalMs);
      const toProxy = routePacket(s, ctx, API_TO_KPROXY, { role: 'cluster' });
      lightBoxAt(s.refs.kproxy, ctx, toProxy.arrivalMs);
      // The CRI call leaves AFTER the watch lands, so the Runtime lights on the Kubelet driving it
      // rather than at the same instant as the Kubelet, which read as the API lighting both.
      const cri = routePacket(s, ctx, KUBELET_TO_RUNTIME, { delay: toKubelet.arrivalMs + BEAT.afterHop, role: 'cluster' });
      lightBoxAt(s.refs.runtime, ctx, cri.arrivalMs);
    },
  },
];

export const init = makeInit(Scene, STEPS, { posterFirst: true });
