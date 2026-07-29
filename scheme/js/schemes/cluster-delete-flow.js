import { svg, g, text } from '../lib/svg.js';
import { arrowDefs, pod, node, box, cylinder, pathArrow } from '../lib/primitives.js';
import { routePacket, pulsePod, makeInit, clearHighlights, clearWires, setWire, BEAT, lightBoxAt, OPACITY } from '../lib/cluster-kit.js';

// Laid out on the L: the narration panel owns the top-left corner and nothing is drawn there.
// Measured worst case over 1600/1440/1280/1100 is x<=397, y<=270, so kubectl and the second tier
// both start clear of it. The camera is canonical now: the old viewBox offset was hiding an
// off-centre composition rather than fixing one.
const M = 60;
const CONTENT_L = M, CONTENT_R = 1200 - M;               // 60 / 1140
const CX = (CONTENT_L + CONTENT_R) / 2;                  // 600
const PANEL_R = 400, PANEL_B = 300;                      // the reserved corner

const TOP_Y = 60, TOP_H = 80, TOP_BOTTOM = TOP_Y + TOP_H;// 60 / 140
const TOP_CY = TOP_Y + TOP_H / 2;                        // 100
const LANE_DY = 10;
const OUT_Y = TOP_CY - LANE_DY, BACK_Y = TOP_CY + LANE_DY;   // 90 / 110
const KCTL_X = 420, KCTL_W = 130, KCTL_R = KCTL_X + KCTL_W; // 420..550
const API_X = 610, API_W = 220, API_R = API_X + API_W;   // 610..830
const API_CX = API_X + API_W / 2;                        // 720
const ETCD_X = 950, ETCD_W = 130;                        // 950..1080

const T2_Y = 300, T2_H = 80, T2_W = 240;                 // 300..380, wholly below the panel
const CM_X = 240, CM_CX = CM_X + T2_W / 2;               // 240..480, 360
const GC_X = 825, GC_CX = GC_X + T2_W / 2;               // 825..1065, 945

const NODE_X = 110, NODE_W = 980, NODE_Y = 410, NODE_H = 190;
const KUBELET_X = 135, KUBELET_W = 220, KUBELET_Y = 465, KUBELET_H = 80;
const KUBELET_R = KUBELET_X + KUBELET_W, KUBELET_CX = KUBELET_X + KUBELET_W / 2;   // 355, 245
const POD_X = 720, POD_W = 216, POD_Y = 452, POD_H = 106;
const LANE_Y = KUBELET_Y + KUBELET_H / 2;                // 505, the Pod shares it

// Five lanes leave the API's bottom face: two mirrored pairs plus one on the midpoint, which is
// what keeps every endpoint either paired or centred.
const D20 = 20, D30 = 30, D60 = 60;
const TO_CM       = [[API_CX - D60, TOP_BOTTOM], [API_CX - D60, 200], [CM_CX, 200], [CM_CX, T2_Y]];
const TO_GC       = [[API_CX + D60, TOP_BOTTOM], [API_CX + D60, 200], [GC_CX + D20, 200], [GC_CX + D20, T2_Y]];
const FROM_GC     = [[GC_CX - D20, T2_Y], [GC_CX - D20, 220], [API_CX, 220], [API_CX, TOP_BOTTOM]];
const TO_KUBELET  = [[API_CX - D30, TOP_BOTTOM], [API_CX - D30, 392], [KUBELET_CX - D20, 392], [KUBELET_CX - D20, KUBELET_Y]];
const FROM_KUBELET= [[KUBELET_CX + D20, KUBELET_Y], [KUBELET_CX + D20, 402], [API_CX + D30, 402], [API_CX + D30, TOP_BOTTOM]];
const DELETE      = [[KCTL_R, OUT_Y], [API_X, OUT_Y]];
const DELETE_ACK  = [[API_X, BACK_Y], [KCTL_R, BACK_Y]];
const PERSIST     = [[API_R, OUT_Y], [ETCD_X, OUT_Y]];
const PERSIST_ACK = [[ETCD_X, BACK_Y], [API_R, BACK_Y]];
const STOP_POD    = [[KUBELET_R, LANE_Y], [POD_X, LANE_Y]];
const WIRE_TOP_Y  = TOP_Y - 20;                          // 40, above the top row
// Design notes for this card: scheme/docs/CARDS.md#cluster-delete-flow


class Scene {
  constructor(host) { this.host = host; this.refs = {}; this.build(); }

  build() {
    this.host.replaceChildren();
    this.refs = {};
    const root = svg({
      class: 'diagram',
      viewBox: '0 0 1200 640',
      preserveAspectRatio: 'xMidYMid meet',
      'aria-label': 'kubectl delete flow through the control plane',
      'data-style': 'outline',
    });
    root.appendChild(arrowDefs());

    const client = box({ x: KCTL_X, y: TOP_Y, w: KCTL_W, h: TOP_H, label: 'kubectl', role: 'cluster' });
    root.appendChild(client);

    const apisrv = box({ x: API_X, y: TOP_Y, w: API_W, h: TOP_H, label: 'API', role: 'cluster' });
    root.appendChild(apisrv);

    const etcd = cylinder({ x: ETCD_X, y: TOP_Y - 10, w: ETCD_W, h: TOP_H + 20, label: 'ETCD', role: 'cluster' });
    root.appendChild(etcd);

    // ControllerManager and GarbageCollector are mirrored about the Api spine (x=500): both
    // 240 wide, centres at 250 and 750 (250 either side of the spine).
    const cm = box({ x: CM_X, y: T2_Y, w: T2_W, h: T2_H, label: 'controller-manager', role: 'cluster' });
    root.appendChild(cm);

    const gc = box({ x: GC_X, y: T2_Y, w: T2_W, h: T2_H, label: 'Garbage collector', role: 'cluster' });
    root.appendChild(gc);

    const nodeEl = node({ x: NODE_X, y: NODE_Y, w: NODE_W, h: NODE_H, label: 'Node-1' });
    root.appendChild(nodeEl);

    const kubelet = box({ x: KUBELET_X, y: KUBELET_Y, w: KUBELET_W, h: KUBELET_H, label: 'Kubelet', role: 'cluster' });
    root.appendChild(kubelet);

    const placedPodShell = pod({ x: POD_X, y: POD_Y, w: POD_W, h: POD_H, label: 'Pod', sublabel: '', containers: 0, role: 'workloads' });
    placedPodShell.style.setProperty('--workloads-color', '#c0b0ff');
    const placedPodShellRect = placedPodShell.querySelector('.scheme-pod-rect');
    if (placedPodShellRect) placedPodShellRect.style.fill = 'rgba(255, 255, 255, 0.03)';

    const placedPodBox = box({ x: POD_X + 30, y: POD_Y + 28, w: POD_W - 60, h: 52, label: 'my-app-7d4-abc', sublabel: 'nginx:1.27', role: 'workloads' });
    placedPodBox.style.setProperty('--workloads-color', '#c0b0ff');

    const placedPod = g({ id: 'placedPod' });
    placedPod.appendChild(placedPodShell);
    placedPod.appendChild(placedPodBox);
    root.appendChild(placedPod);

    const kubeletPodArrow = pathArrow({ points: STOP_POD, dashed: true, role: 'cluster' });
    root.appendChild(kubeletPodArrow);

    // Top-row lanes straddle the Api/Kubectl/ETCD centre line (y=100): request out at y=90,
    // response back at y=110. Each is drawn from the SAME array that carries its ball.
    root.appendChild(pathArrow({ points: DELETE,      dim: true, dashed: true, role: 'cluster' }));
    root.appendChild(pathArrow({ points: DELETE_ACK,  dim: true, dashed: true, role: 'cluster' }));
    root.appendChild(pathArrow({ points: PERSIST,     dim: true, dashed: true, role: 'cluster' }));
    root.appendChild(pathArrow({ points: PERSIST_ACK, dim: true, dashed: true, role: 'cluster' }));
    // Api -> ControllerManager and Api -> GarbageCollector, mirrored about the spine (x=500).
    root.appendChild(pathArrow({ points: TO_CM, dim: true, dashed: true, role: 'cluster' }));
    root.appendChild(pathArrow({ points: TO_GC, dim: true, dashed: true, role: 'cluster' }));
    root.appendChild(pathArrow({ points: FROM_GC, dim: true, dashed: true, role: 'cluster' }));
    // Api -> Kubelet and the Kubelet -> Api return lane (the "Pod terminated" report) straddle the
    // Kubelet centre (x=190 in, x=210 out) and keep their horizontal legs clear of the Node top.
    root.appendChild(pathArrow({ points: TO_KUBELET, dim: true, dashed: true, role: 'cluster' }));
    root.appendChild(pathArrow({ points: FROM_KUBELET, dim: true, dashed: true, role: 'cluster' }));

    // Above the row: the gaps these two label are 60 and 120 units wide, and the strings are
    // three times that, so on the row they struck the blocks either side of their own lane.
    const wireDelete       = text({ class: 'scheme-label code dim', x: (KCTL_R + API_X) / 2, y: WIRE_TOP_Y,  'text-anchor': 'middle' }, [' ']);
    const wirePersist      = text({ class: 'scheme-label code dim', x: (API_R + ETCD_X) / 2, y: WIRE_TOP_Y,  'text-anchor': 'middle' }, [' ']);
    const wireEtcdAck      = text({ class: 'scheme-label code dim', x: (API_R + ETCD_X) / 2, y: BACK_Y + 26, 'text-anchor': 'middle' }, [' ']);
    const wireApiAck       = text({ class: 'scheme-label code dim', x: (KCTL_R + API_X) / 2, y: BACK_Y + 26, 'text-anchor': 'middle' }, [' ']);
    const wireController   = text({ class: 'scheme-label code dim', x: CM_CX + 130, y: 194, 'text-anchor': 'middle' }, [' ']);
    const wireGc           = text({ class: 'scheme-label code dim', x: GC_CX - 150, y: 194, 'text-anchor': 'middle' }, [' ']);
    const wireKubeletWatch = text({ class: 'scheme-label code dim', x: 470, y: 386, 'text-anchor': 'middle' }, [' ']);
    const wireStopPod      = text({ class: 'scheme-label code dim', x: (KUBELET_R + POD_X) / 2, y: LANE_Y - 12, 'text-anchor': 'middle' }, [' ']);
    [wireDelete, wirePersist, wireEtcdAck, wireApiAck, wireController, wireGc, wireKubeletWatch, wireStopPod].forEach(t => root.appendChild(t));

    const packetLayer = g({ id: 'packetLayer' });
    root.appendChild(packetLayer);

    this.host.appendChild(root);
    this.refs = {
      svg: root, client, apisrv, etcd, cm, gc, kubelet, placedPod, placedPodBox, kubeletPodArrow,
      wires: {
        delete:          wireDelete,
        persist:         wirePersist,
        'etcd-ack':      wireEtcdAck,
        'api-ack':       wireApiAck,
        controller:      wireController,
        gc:              wireGc,
        'kubelet-watch': wireKubeletWatch,
        'stop-pod':      wireStopPod,
      },
      packetLayer,
    };
  }

  reset() { this.build(); }
}

function clearHL(s) {
  clearHighlights(s, ['client','apisrv','etcd','cm','gc','kubelet','placedPodBox']);
}

const STEPS = [
  {
    id: 'idle',
    duration: 1400,
    enter(s) {
      s.refs.packetLayer.replaceChildren();
      s.refs.placedPod.style.opacity = '1';
      s.refs.kubeletPodArrow.style.opacity = '1';
      clearHL(s);
      clearWires(s);
    },
  },
  {
    id: 'delete-request',
    duration: 1700,
    narration: 'You run "kubectl delete deployment my-app --cascade=foreground". The client sends an HTTP DELETE to /apis/apps/v1/namespaces/default/deployments/my-app on the API with propagationPolicy=Foreground in the request body.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      s.refs.client.classList.add('highlight');
      setWire(s, 'delete', 'DELETE /apis/apps/v1/.../deployments/my-app');
      if (ctx.reduced) { s.refs.apisrv.classList.add('highlight'); return; }
      const pkt = routePacket(s, ctx, DELETE, { role: 'cluster' });
      lightBoxAt(s.refs.apisrv, ctx, pkt.arrivalMs);
    },
  },
  {
    id: 'mark-deletion',
    duration: 1900,
    narration: 'The API does not remove the object. It patches metadata.deletionTimestamp and adds the foregroundDeletion finalizer, then commits the change to ETCD via Raft at rv=843. The Deployment is now Terminating but still exists in cluster state.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      s.refs.apisrv.classList.add('highlight');
      setWire(s, 'persist', 'patch deletionTimestamp · rv=843');
      if (ctx.reduced) { s.refs.etcd.classList.add('highlight'); return; }
      const pkt = routePacket(s, ctx, PERSIST, { role: 'cluster' });
      lightBoxAt(s.refs.etcd, ctx, pkt.arrivalMs);
    },
  },
  {
    id: 'ack-response',
    duration: 2200,
    narration: 'ETCD acks the committed write back to the API, and the API returns HTTP 202 Accepted to kubectl. From the caller perspective the call already returned, but the object lifecycle is only just beginning.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      s.refs.etcd.classList.add('highlight');
      clearWires(s);
      s.refs.wires['etcd-ack'].textContent = 'ack · rv=843';
      s.refs.wires['api-ack'].textContent  = 'HTTP 202 Accepted';
      if (ctx.reduced) { s.refs.apisrv.classList.add('highlight'); s.refs.client.classList.add('highlight'); return; }

      // ETCD sends the ack and is lit from entry. The Api takes it before it answers kubectl, so
      // it lights on arrival rather than at step entry.
      const ack = routePacket(s, ctx, PERSIST_ACK, { role: 'cluster' });
      lightBoxAt(s.refs.apisrv, ctx, ack.arrivalMs);
      const clientPkt = routePacket(s, ctx, DELETE_ACK, { delay: ack.arrivalMs + BEAT.afterHop, role: 'cluster' });
      lightBoxAt(s.refs.client, ctx, clientPkt.arrivalMs);
    },
  },
  {
    id: 'gc-cascade',
    duration: 3200,
    narration: 'The API broadcasts a MODIFIED event for the Deployment to its watchers. The Deployment controller in the controller-manager sees the deletionTimestamp and stops issuing rollouts. The Garbage collector walks the ownerReferences, then issues foreground DELETEs for ReplicaSet my-app-7d4 and Pod my-app-7d4-abc, which only stamp a deletionTimestamp on each rather than removing it from ETCD yet.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      s.refs.apisrv.classList.add('highlight');
      clearWires(s);
      s.refs.wires['controller'].textContent = 'watch MODIFIED · Deployment';
      s.refs.wires['gc'].textContent         = 'DELETE replicasets · pods';
      if (ctx.reduced) { s.refs.cm.classList.add('highlight'); s.refs.gc.classList.add('highlight'); return; }

      // The Api broadcasts, so it is the lit source. The Garbage collector is a receiver first and
      // only then a sender, so it lights on the MODIFIED event landing, exactly like the CM below.
      const gcEvent = routePacket(s, ctx, TO_GC, { role: 'cluster' });
      lightBoxAt(s.refs.gc, ctx, gcEvent.arrivalMs);
      // To CM (left), for Deployment/ReplicaSet controllers:
      const cmPkt = routePacket(s, ctx, TO_CM, { role: 'cluster' });
      lightBoxAt(s.refs.cm, ctx, cmPkt.arrivalMs);

      // The MODIFIED-event packet reaching GC carries the beat, then the
      // PATCH-back packet leaves below once the event has landed.
      routePacket(s, ctx, FROM_GC, { delay: gcEvent.arrivalMs + BEAT.afterHop, role: 'cluster' });
    },
  },
  {
    id: 'kubelet-watch',
    duration: 2500,
    narration: 'The Kubelet on Node-1 has a filtered watch for Pods bound to it. The API streams a MODIFIED event for my-app-7d4-abc carrying its new deletionTimestamp, and the Kubelet starts the termination procedure for the Pod.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      s.refs.apisrv.classList.add('highlight');
      setWire(s, 'kubelet-watch', 'watch MODIFIED · Pod');
      if (ctx.reduced) { s.refs.kubelet.classList.add('highlight'); return; }
      const pkt = routePacket(s, ctx, TO_KUBELET, { role: 'cluster' });
      lightBoxAt(s.refs.kubelet, ctx, pkt.arrivalMs);
    },
  },
  {
    id: 'kubelet-stops',
    duration: 4100,
    narration: 'The Kubelet sends SIGTERM to the container, waits up to terminationGracePeriodSeconds (30s default), then reports the Pod terminated to the API. Pod-side details (probes, preStop hook) are covered in the Graceful Pod Shutdown card.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      s.refs.kubelet.classList.add('highlight');
      setWire(s, 'stop-pod', 'SIGTERM · grace 30s');
      // Pin final state inline so cancel between steps doesn't flash to default opacity.
      s.refs.placedPod.style.opacity = String(OPACITY.terminating);
      if (ctx.reduced) { s.refs.apisrv.classList.add('highlight'); return; }
      // SIGTERM packet flies from Kubelet to Pod first.
      const sigterm = routePacket(s, ctx, STOP_POD, { role: 'cluster' });
      // Narrative-slow fade: the grace-period drain reads as a long dim, not a snap.
      ctx.register(s.refs.placedPod.animate(
        [{ opacity: 1 }, { opacity: OPACITY.terminating }],
        { duration: 1300, delay: sigterm.arrivalMs, fill: 'both', easing: 'ease-in' }
      ));
      // The whole Pod (shell + inner box) pulses once in sync as the SIGTERM lands, then dims
      // out with the grace-period fade. Nothing is left pinned bright.
      pulsePod(s.refs.placedPod, ctx, sigterm.arrivalMs);
      // After the grace-period drain, the Kubelet reports the terminated Pod up to the Api on the
      // return lane.
      const apisrvPkt = routePacket(s, ctx, FROM_KUBELET, { delay: sigterm.arrivalMs + 800, role: 'cluster' });
      lightBoxAt(s.refs.apisrv, ctx, apisrvPkt.arrivalMs);
    },
  },
  {
    id: 'purge',
    duration: 2500,
    narration: 'With the Pod terminated and dependents accounted for, the Garbage collector clears the foregroundDeletion finalizer up the chain. The API issues real DELETEs to ETCD, removing Pod, ReplicaSet, and Deployment in turn. Watchers receive DELETED events. The objects are now truly gone.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      s.refs.gc.classList.add('highlight');
      setWire(s, 'gc', 'clear finalizer');
      setWire(s, 'persist', 'DELETE · finalizers=[] · rv=856');
      // Pin final state inline so cancel returns to the right value, not default.
      s.refs.placedPod.style.opacity = '0';
      s.refs.kubeletPodArrow.style.opacity = '0';
      if (ctx.reduced) { s.refs.apisrv.classList.add('highlight'); s.refs.etcd.classList.add('highlight'); return; }
      // The GarbageCollector clears the foregroundDeletion finalizer (PATCH up to the Api), then the
      // Api issues the real DELETE to ETCD. The Pod and its arrow vanish as the object leaves ETCD.
      // The Api is mid-chain and lights on the PATCH landing, ETCD one hop later.
      const clear = routePacket(s, ctx, FROM_GC, { role: 'cluster' });
      lightBoxAt(s.refs.apisrv, ctx, clear.arrivalMs);
      const del = routePacket(s, ctx, PERSIST, { delay: clear.arrivalMs + BEAT.afterHop, role: 'cluster' });
      lightBoxAt(s.refs.etcd, ctx, del.arrivalMs);
      ctx.register(s.refs.placedPod.animate(
        [{ opacity: OPACITY.terminating }, { opacity: 0 }],
        { duration: 700, delay: del.arrivalMs, fill: 'forwards', easing: 'ease-out' }
      ));
      ctx.register(s.refs.kubeletPodArrow.animate(
        [{ opacity: 1 }, { opacity: 0 }],
        { duration: 600, delay: del.arrivalMs, fill: 'forwards', easing: 'ease-out' }
      ));
    },
  },
];

export const init = makeInit(Scene, STEPS, { posterFirst: true });
