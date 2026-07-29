import { svg, g, line, text } from '../lib/svg.js';
import { arrowDefs, box, node, cylinder, pathArrow } from '../lib/primitives.js';
import { routePacket, makeInit, clearHighlights, clearWires, setWire, BEAT, lightBoxAt } from '../lib/cluster-kit.js';

// The layout is a three-tier control plane over one Worker Node, every tier centred on CX. It was
// already clear of the narration panel, so this pass only names the numbers: the geometry record
// belongs in constants, not scattered through build().
const M = 60;
const CONTENT_L = M, CONTENT_R = 1200 - M;               // 60 / 1140
const CX = (CONTENT_L + CONTENT_R) / 2;                  // 600

const BOX_W = 220, BOX_H = 80;
const API_Y = 80, API_BOTTOM = API_Y + BOX_H;            // 80 / 160
const API_X = CX - BOX_W / 2, API_R = API_X + BOX_W;     // 490..710
const ETCD_W = 130, ETCD_X = 960;                        // 960..1090
const LANE_DY = 10, API_CY = API_Y + BOX_H / 2;          // 120
const ETCD_OUT = API_CY - LANE_DY, ETCD_IN = API_CY + LANE_DY;   // 110 / 130

const T2_Y = 240;                                        // controller-manager + Scheduler
const CM_X = 170, CM_CX = CM_X + BOX_W / 2;              // 170..390, 280
const SCHED_X = 810, SCHED_CX = SCHED_X + BOX_W / 2;     // 810..1030, 920

const NODE_X = 120, NODE_W = 960, NODE_Y = 420, NODE_H = 180;    // 120..1080, 420..600
const T3_Y = 480;                                        // Runtime + Kubelet + kube-proxy
const RT_X = 170, KUBE_X = CX - BOX_W / 2, KP_X = 810;
const T3_CY = T3_Y + BOX_H / 2;                          // 520

// Each tier-2 exchange is a lane pair straddling the flow line, so no endpoint sits alone.
const D10 = 10, D30 = 30, D60 = 60;
const JOG_DOWN = 200, JOG_UP = 220;
// ETCD is the API's only client, so the pair straddles the API centre line, and the Node spine drops
// from the API bottom midpoint. Named because the packets ride these SAME arrays: they used to be
// literals repeated at every call site, which is how a sister card came to fly a ball off its wire.
const API_TO_ETCD = [[API_R, ETCD_OUT], [ETCD_X, ETCD_OUT]];
const ETCD_TO_API = [[ETCD_X, ETCD_IN], [API_R, ETCD_IN]];
const API_TO_NODE = [[CX, API_BOTTOM], [CX, NODE_Y]];
const TO_CM    = [[API_X + 50, API_BOTTOM], [API_X + 50, JOG_DOWN], [CM_CX - D10, JOG_DOWN], [CM_CX - D10, T2_Y]];
const FROM_CM  = [[CM_CX + D10, T2_Y], [CM_CX + D10, JOG_UP], [API_X + 70, JOG_UP], [API_X + 70, API_BOTTOM]];
const TO_SCHED = [[API_R - 50, API_BOTTOM], [API_R - 50, JOG_DOWN], [SCHED_CX + D10, JOG_DOWN], [SCHED_CX + D10, T2_Y]];
const FROM_SCHED = [[SCHED_CX - D10, T2_Y], [SCHED_CX - D10, JOG_UP], [API_R - 70, JOG_UP], [API_R - 70, API_BOTTOM]];
// Design notes for this card: scheme/docs/CARDS.md#cluster-architecture


class Scene {
  constructor(host) { this.host = host; this.refs = {}; this.build(); }

  build() {
    this.host.replaceChildren();
    this.refs = {};
    const root = svg({
      class: 'diagram',
      viewBox: '0 0 1200 640',
      preserveAspectRatio: 'xMidYMid meet',
      'aria-label': 'Kubernetes control plane architecture',
      'data-style': 'outline',
    });
    root.appendChild(arrowDefs());

    // Top row: Api (centre) + ETCD (top-right). All component boxes use the
    // workloads standard size (w:220 h:80) so every block reads at one scale.
    const apisrv = box({ x: API_X, y: API_Y, w: BOX_W, h: BOX_H, label: 'API',  role: 'cluster' });
    const etcdC  = cylinder({ x: ETCD_X, y: API_Y - 10, w: ETCD_W, h: BOX_H + 30, label: 'ETCD', role: 'cluster' });
    root.appendChild(apisrv);
    root.appendChild(etcdC);

    // Middle row: ControllerManager sits above Runtime (left column),
    // Scheduler sits above KubeProxy (right column), same x as the node boxes.
    const ctrlMgr = box({ x: CM_X, y: T2_Y, w: BOX_W, h: BOX_H, label: 'controller-manager', role: 'cluster' });
    const sched   = box({ x: SCHED_X, y: T2_Y, w: BOX_W, h: BOX_H, label: 'Scheduler',         role: 'cluster' });
    root.appendChild(ctrlMgr);
    root.appendChild(sched);

    const nodeEl = node({ x: NODE_X, y: NODE_Y, w: NODE_W, h: NODE_H, label: 'Worker Node' });
    root.appendChild(nodeEl);

    // Bottom row: Runtime (left), Kubelet (centre, straight under Api), KubeProxy (right).
    const runtime = box({ x: RT_X, y: T3_Y, w: BOX_W, h: BOX_H, label: 'Runtime',   role: 'cluster' });
    const kubelet = box({ x: KUBE_X, y: T3_Y, w: BOX_W, h: BOX_H, label: 'Kubelet',   role: 'cluster' });
    const kproxy  = box({ x: KP_X, y: T3_Y, w: BOX_W, h: BOX_H, label: 'kube-proxy', role: 'cluster' });
    root.appendChild(runtime);
    root.appendChild(kubelet);
    root.appendChild(kproxy);

    root.appendChild(pathArrow({ points: API_TO_ETCD, dim: true, dashed: true, role: 'cluster' }));
    root.appendChild(pathArrow({ points: ETCD_TO_API, dim: true, dashed: true, role: 'cluster' }));
    root.appendChild(pathArrow({ points: TO_CM, dim: true, dashed: true, role: 'cluster' }));
    root.appendChild(pathArrow({ points: FROM_CM, dim: true, dashed: true, role: 'cluster' }));
    root.appendChild(pathArrow({ points: TO_SCHED, dim: true, dashed: true, role: 'cluster' }));
    root.appendChild(pathArrow({ points: FROM_SCHED, dim: true, dashed: true, role: 'cluster' }));
    root.appendChild(pathArrow({ points: API_TO_NODE, dim: true, dashed: true, role: 'cluster' }));

    // Inside the node: Kubelet wired to Runtime and KubeProxy (solid binding lines, not flow).
    root.appendChild(line({ class: 'scheme-arrow scheme-arrow-cluster', x1: RT_X + BOX_W, y1: T3_CY, x2: KUBE_X, y2: T3_CY }));
    root.appendChild(line({ class: 'scheme-arrow scheme-arrow-cluster', x1: KUBE_X + BOX_W, y1: T3_CY, x2: KP_X, y2: T3_CY }));

    const wireEtcdWrite  = text({ class: 'scheme-label code dim', x: (API_R + ETCD_X) / 2, y: ETCD_OUT - 12,  'text-anchor': 'middle' }, [' ']);
    const wireEtcdRead   = text({ class: 'scheme-label code dim', x: (API_R + ETCD_X) / 2, y: ETCD_IN + 22, 'text-anchor': 'middle' }, [' ']);
    const wireControllers = text({ class: 'scheme-label code dim', x: CM_CX + 135, y: 186, 'text-anchor': 'middle' }, [' ']);
    const wireScheduler  = text({ class: 'scheme-label code dim', x: SCHED_CX - 135, y: 186, 'text-anchor': 'middle' }, [' ']);
    const wireNode       = text({ class: 'scheme-label code dim', x: CX + 18, y: NODE_Y - 16, 'text-anchor': 'start' }, [' ']);
    [wireEtcdWrite, wireEtcdRead, wireControllers, wireScheduler, wireNode].forEach(t => root.appendChild(t));

    const packetLayer = g({ id: 'packetLayer' });
    root.appendChild(packetLayer);

    this.host.appendChild(root);
    this.refs = {
      svg: root, apisrv, etcdC, ctrlMgr, sched, nodeEl, kubelet, runtime, kproxy,
      wires: {
        'etcd-write':  wireEtcdWrite,
        'etcd-read':   wireEtcdRead,
        controllers:   wireControllers,
        scheduler:     wireScheduler,
        node:          wireNode,
      },
      packetLayer,
    };
  }

  reset() { this.build(); }
}

function clearHL(s) {
  clearHighlights(s, ['apisrv','etcdC','ctrlMgr','sched','kubelet','runtime','kproxy']);
}

const STEPS = [
  {
    id: 'Overview',
    duration: 1500,
    enter(s) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
    },
  },
  {
    id: 'Api',
    duration: 1700,
    narration: 'The API is the only entry point to the cluster. Every read and every write passes through it. Replicas are stateless and require no coordination, so the layer scales horizontally.',
    enter(s) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      s.refs.apisrv.classList.add('highlight');
    },
  },
  {
    id: 'etcd',
    duration: 1700,
    narration: 'ETCD is the only durable store in the cluster, and the API is its only client. Every change is replicated through Raft, where a quorum of replicas must agree before the write is committed.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
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
    narration: 'ETCD returns the requested data to the API. When the API subscribes via a watch, ETCD keeps that stream open and pushes subsequent changes through it without another round trip.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      s.refs.etcdC.classList.add('highlight');
      setWire(s, 'etcd-read', 'read · watch stream open');
      if (ctx.reduced) { s.refs.apisrv.classList.add('highlight'); return; }
      const pkt = routePacket(s, ctx, ETCD_TO_API, { role: 'cluster' });
      lightBoxAt(s.refs.apisrv, ctx, pkt.arrivalMs);
    },
  },
  {
    id: 'controllers',
    duration: 2600,
    narration: 'The controller-manager runs many small control loops, one per resource kind (Deployment, ReplicaSet, Job and so on). Each watches the API and writes back to reconcile observed state with desired state.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      s.refs.apisrv.classList.add('highlight');
      setWire(s, 'controllers', 'watch · reconcile loop');
      if (ctx.reduced) { s.refs.ctrlMgr.classList.add('highlight'); return; }
      // Watch event in (Api -> ControllerManager, upper lane), then the reconcile
      // write-back out (ControllerManager -> Api, lower lane). The controller-manager is dark
      // until the watch event lands: it acts on what it receives, so it may not be lit before.
      const watch = routePacket(s, ctx, TO_CM, { role: 'cluster' });
      lightBoxAt(s.refs.ctrlMgr, ctx, watch.arrivalMs);
      routePacket(s, ctx, FROM_CM, { delay: watch.arrivalMs + BEAT.afterHop, role: 'cluster' });
    },
  },
  {
    id: 'scheduler',
    duration: 2600,
    narration: 'The Scheduler watches Pods that have no Node assignment yet, filters and scores the candidates, then posts a Binding back to the API. That one write is the whole of its job. The Kubelet on the chosen Node takes it from there.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      s.refs.apisrv.classList.add('highlight');
      setWire(s, 'scheduler', 'watch Pods · post Binding');
      if (ctx.reduced) { s.refs.sched.classList.add('highlight'); return; }
      // Watch Pods in (Api -> Scheduler, upper lane), then the Binding posted back
      // to the Api (Scheduler -> Api, lower lane). The Scheduler lights on the watch arriving.
      const watch = routePacket(s, ctx, TO_SCHED, { role: 'cluster' });
      lightBoxAt(s.refs.sched, ctx, watch.arrivalMs);
      routePacket(s, ctx, FROM_SCHED, { delay: watch.arrivalMs + BEAT.afterHop, role: 'cluster' });
    },
  },
  {
    id: 'node-side',
    duration: 2200,
    narration: 'On a worker Node, the Kubelet watches the API for Pods assigned to it and drives the Runtime to start their containers, while kube-proxy installs the local rules that steer Service traffic.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      s.refs.apisrv.classList.add('highlight');
      s.refs.kubelet.classList.add('highlight');
      s.refs.runtime.classList.add('highlight');
      s.refs.kproxy.classList.add('highlight');
      setWire(s, 'node', 'watch Pods · spec.nodeName=Node');
      if (ctx.reduced) return;
      routePacket(s, ctx, API_TO_NODE, { role: 'cluster' });
    },
  },
];

export const init = makeInit(Scene, STEPS, { posterFirst: true });
