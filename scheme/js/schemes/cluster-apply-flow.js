import { svg, g, text } from '../lib/svg.js';
import { arrowDefs, pod, node, box, cylinder, pathArrow } from '../lib/primitives.js';
import { routePacket, pulsePod, makeInit, clearHighlights, clearWires, setWire, BEAT, lightBoxAt } from '../lib/cluster-kit.js';

// Laid out on the L: the narration panel owns the top-left corner and nothing is drawn there.
// Measured worst case over 1600/1440/1280/1100 is x<=397, y<=171, so kubectl starts at 420. The
// tier below the panel (controller-manager, Scheduler, Kubelet, the placed Pod) uses the full
// width and centres on CX, which is what CENTRE-LOW asks for.
const M = 60;
const CONTENT_L = M, CONTENT_R = 1200 - M;               // 60 / 1140
const CX = (CONTENT_L + CONTENT_R) / 2;                  // 600
const PANEL_R = 400, PANEL_B = 190;                      // the reserved corner

const TOP_Y = 80, TOP_H = 80, TOP_BOTTOM = TOP_Y + TOP_H;// 80 / 160
const TOP_CY = TOP_Y + TOP_H / 2;                        // 120
const LANE_DY = 10;
const OUT_Y = TOP_CY - LANE_DY, BACK_Y = TOP_CY + LANE_DY;   // 110 / 130
const KCTL_X = 420, KCTL_W = 130, KCTL_R = KCTL_X + KCTL_W;  // 420..550
const API_X = 610, API_W = 220, API_R = API_X + API_W;   // 610..830
const API_CX = API_X + API_W / 2;                        // 720
const ETCD_X = 950, ETCD_W = 130, ETCD_R = ETCD_X + ETCD_W;  // 950..1080

// Second tier, wholly below the panel.
const T2_Y = 240, T2_H = 80, T2_W = 220;
const CM_X = 240, CM_CX = CM_X + T2_W / 2;               // 240..460, 350
const SCHED_X = 845, SCHED_CX = SCHED_X + T2_W / 2;      // 845..1065, 955

// Four lanes leave the API's bottom face, so they are drawn as two mirrored pairs about API_CX.
const D30 = 30, D60 = 60;
const NODE_X = 110, NODE_W = 980, NODE_Y = 420, NODE_H = 180;   // 110..1090, 420..600
const KUBELET_X = 135, KUBELET_W = 220, KUBELET_Y = 475, KUBELET_H = 80;
const KUBELET_R = KUBELET_X + KUBELET_W, KUBELET_CX = KUBELET_X + KUBELET_W / 2;  // 355, 245
const POD_X = 720, POD_W = 216, POD_Y = 462, POD_H = 106;
const LANE_Y = KUBELET_Y + KUBELET_H / 2;                // 515, and the Pod shares it

const SCHED_LANE_DX = 20;
const TO_CM      = [[API_CX - D60, TOP_BOTTOM], [API_CX - D60, 200], [CM_CX, 200], [CM_CX, T2_Y]];
const TO_SCHED   = [[API_CX + D60, TOP_BOTTOM], [API_CX + D60, 200], [SCHED_CX + SCHED_LANE_DX, 200], [SCHED_CX + SCHED_LANE_DX, T2_Y]];
const FROM_SCHED = [[SCHED_CX - SCHED_LANE_DX, T2_Y], [SCHED_CX - SCHED_LANE_DX, 220], [API_CX + D30, 220], [API_CX + D30, TOP_BOTTOM]];
const TO_KUBELET = [[API_CX - D30, TOP_BOTTOM], [API_CX - D30, 390], [KUBELET_CX, 390], [KUBELET_CX, KUBELET_Y]];
const POST       = [[KCTL_R, OUT_Y], [API_X, OUT_Y]];
const POST_ACK   = [[API_X, BACK_Y], [KCTL_R, BACK_Y]];
const PERSIST    = [[API_R, OUT_Y], [ETCD_X, OUT_Y]];
const PERSIST_ACK= [[ETCD_X, BACK_Y], [API_R, BACK_Y]];
const START      = [[KUBELET_R, LANE_Y], [POD_X, LANE_Y]];
const WIRE_TOP_Y = TOP_Y - 20;                           // 60, above the top row
// Design notes for this card: scheme/docs/CARDS.md#cluster-apply-flow


class Scene {
  constructor(host) { this.host = host; this.refs = {}; this.build(); }

  build() {
    this.host.replaceChildren();
    this.refs = {};
    const root = svg({
      class: 'diagram',
      // x=-10 centres the content (union bbox centre x=590) in the dialog window,
      // padL=padR=110, the same self-centring the sibling Delete Flow card uses.
      viewBox: '0 0 1200 640',
      preserveAspectRatio: 'xMidYMid meet',
      'aria-label': 'kubectl apply flow through the control plane',
      'data-style': 'outline',
    });
    root.appendChild(arrowDefs());

    const client = box({ x: KCTL_X, y: TOP_Y, w: KCTL_W, h: TOP_H, label: 'kubectl',   role: 'cluster' });
    const apisrv = box({ x: API_X, y: TOP_Y, w: API_W, h: TOP_H, label: 'API', role: 'cluster' });
    const etcd   = cylinder({ x: ETCD_X, y: TOP_Y - 10, w: ETCD_W, h: TOP_H + 20, label: 'ETCD', role: 'cluster' });
    root.appendChild(client);
    root.appendChild(apisrv);
    root.appendChild(etcd);

    // Middle row: ControllerManager (left, centre 340) and Scheduler (right, centre 860),
    // mirrored about the spine and pulled in toward the Api.
    const cm    = box({ x: CM_X, y: T2_Y, w: T2_W, h: T2_H, label: 'controller-manager', role: 'cluster' });
    const sched = box({ x: SCHED_X, y: T2_Y, w: T2_W, h: T2_H, label: 'Scheduler',         role: 'cluster' });
    root.appendChild(cm);
    root.appendChild(sched);

    // Bottom: a full-width worker node holding the Kubelet and the Pod it places.
    const nodeEl = node({ x: NODE_X, y: NODE_Y, w: NODE_W, h: NODE_H, label: 'Node-1' });
    root.appendChild(nodeEl);

    const kubelet = box({ x: KUBELET_X, y: KUBELET_Y, w: KUBELET_W, h: KUBELET_H, label: 'Kubelet', role: 'cluster' });
    root.appendChild(kubelet);

    // The placed Pod (violet workloads tint) appears inside the node once the Kubelet starts it.
    const placedPodShell = pod({ x: POD_X, y: POD_Y, w: POD_W, h: POD_H, label: 'Pod', sublabel: '', containers: 0, role: 'workloads' });
    placedPodShell.style.setProperty('--workloads-color', '#c0b0ff');
    const placedPodShellRect = placedPodShell.querySelector('.scheme-pod-rect');
    if (placedPodShellRect) placedPodShellRect.style.fill = 'rgba(255, 255, 255, 0.03)';

    const placedPodBox = box({ x: POD_X + 30, y: POD_Y + 28, w: POD_W - 60, h: 52, label: 'my-app-7d4-abc', sublabel: 'nginx:1.27', role: 'workloads' });
    placedPodBox.style.setProperty('--workloads-color', '#c0b0ff');

    const placedPod = g({ id: 'placedPod' });
    placedPod.style.opacity = '0';
    placedPod.appendChild(placedPodShell);
    placedPod.appendChild(placedPodBox);
    root.appendChild(placedPod);

    const kubeletPodArrow = pathArrow({ points: START, dashed: true, role: 'cluster' });
    kubeletPodArrow.style.opacity = '0';
    root.appendChild(kubeletPodArrow);

    // Top-row lanes straddle the Api centre (y=110 out, y=130 back) on both sides.
    // Each top-row lane is drawn from the SAME array that carries its ball.
    root.appendChild(pathArrow({ points: POST,        dim: true, dashed: true, role: 'cluster' }));
    root.appendChild(pathArrow({ points: POST_ACK,    dim: true, dashed: true, role: 'cluster' }));
    root.appendChild(pathArrow({ points: PERSIST,     dim: true, dashed: true, role: 'cluster' }));
    root.appendChild(pathArrow({ points: PERSIST_ACK, dim: true, dashed: true, role: 'cluster' }));
    // Api -> ControllerManager and Api -> Scheduler, mirrored about the spine.
    root.appendChild(pathArrow({ points: TO_CM, dim: true, dashed: true, role: 'cluster' }));
    root.appendChild(pathArrow({ points: TO_SCHED, dim: true, dashed: true, role: 'cluster' }));
    root.appendChild(pathArrow({ points: FROM_SCHED, dim: true, dashed: true, role: 'cluster' }));
    // Api -> Kubelet: straight down the spine, then into the Kubelet inside the node.
    root.appendChild(pathArrow({ points: TO_KUBELET, dim: true, dashed: true, role: 'cluster' }));

    // Above the row: the gaps these two label are 60 and 120 units wide and the strings are far
    // longer, so on the row they struck the blocks either side of their own lane.
    const wirePost          = text({ class: 'scheme-label code dim', x: (KCTL_R + API_X) / 2, y: WIRE_TOP_Y,  'text-anchor': 'middle' }, [' ']);
    // HTTP 201 ack rides below the top row (y=180) so its ends clear the Kubectl/Api corners.
    const wireApiAck        = text({ class: 'scheme-label code dim', x: (KCTL_R + API_X) / 2, y: BACK_Y + 26, 'text-anchor': 'middle' }, [' ']);
    const wirePersist       = text({ class: 'scheme-label code dim', x: (API_R + ETCD_X) / 2, y: WIRE_TOP_Y,  'text-anchor': 'middle' }, [' ']);
    const wireEtcdAck       = text({ class: 'scheme-label code dim', x: (API_R + ETCD_X) / 2, y: BACK_Y + 18, 'text-anchor': 'middle' }, [' ']);
    const wireController    = text({ class: 'scheme-label code dim', x: CM_CX + 120, y: 194, 'text-anchor': 'middle' }, [' ']);
    const wireSchedule      = text({ class: 'scheme-label code dim', x: SCHED_CX - 140, y: 194, 'text-anchor': 'middle' }, [' ']);
    const wireKubeletWatch  = text({ class: 'scheme-label code dim', x: 500, y: 380, 'text-anchor': 'middle' }, [' ']);
    [wirePost, wireApiAck, wirePersist, wireEtcdAck, wireController, wireSchedule, wireKubeletWatch].forEach(t => root.appendChild(t));

    const packetLayer = g({ id: 'packetLayer' });
    root.appendChild(packetLayer);

    this.host.appendChild(root);
    this.refs = {
      svg: root, client, apisrv, etcd, cm, sched, kubelet, placedPod, placedPodBox, kubeletPodArrow,
      wires: {
        post:            wirePost,
        persist:         wirePersist,
        controller:      wireController,
        schedule:        wireSchedule,
        'kubelet-watch': wireKubeletWatch,
        'etcd-ack':      wireEtcdAck,
        'api-ack':       wireApiAck,
      },
      packetLayer,
    };
  }

  reset() { this.build(); }
}

function clearHL(s) {
  clearHighlights(s, ['client','apisrv','etcd','cm','sched','kubelet','placedPodBox']);
}

const STEPS = [
  {
    id: 'idle',
    duration: 1400,
    enter(s) {
      s.refs.packetLayer.replaceChildren();
      s.refs.placedPod.style.opacity = '0';
      s.refs.kubeletPodArrow.style.opacity = '0';
      clearHL(s);
      clearWires(s);
    },
  },
  {
    id: 'post',
    duration: 1700,
    narration: 'You run "kubectl apply -f deploy.yaml". The client serializes the manifest as JSON and POSTs it to /apis/apps/v1/namespaces/default/deployments on the API.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      s.refs.client.classList.add('highlight');
      setWire(s, 'post', 'POST /apis/apps/v1/namespaces/default/deployments');
      if (ctx.reduced) { s.refs.apisrv.classList.add('highlight'); return; }
      const pkt = routePacket(s, ctx, POST, { role: 'cluster' });
      lightBoxAt(s.refs.apisrv, ctx, pkt.arrivalMs);
    },
  },
  {
    id: 'persist',
    duration: 1700,
    narration: 'The API authenticates the caller using credentials from your kubeconfig, runs admission and schema validation, then writes the new Deployment "my-app" to ETCD. ETCD commits the write via Raft quorum at rv=842.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      s.refs.apisrv.classList.add('highlight');
      setWire(s, 'persist', 'write committed · rv=842');
      if (ctx.reduced) { s.refs.etcd.classList.add('highlight'); return; }
      const pkt = routePacket(s, ctx, PERSIST, { role: 'cluster' });
      lightBoxAt(s.refs.etcd, ctx, pkt.arrivalMs);
    },
  },
  {
    id: 'etcd-response',
    duration: 2200,
    narration: 'ETCD acks the committed write back to the API at rv=842, and the API returns HTTP 201 Created to the kubectl client. The Deployment now exists in cluster state, but no Pods have been created yet.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      s.refs.etcd.classList.add('highlight');
      clearWires(s);
      s.refs.wires['etcd-ack'].textContent = 'ack · rv=842';
      s.refs.wires['api-ack'].textContent  = 'HTTP 201 Created';
      if (ctx.reduced) { s.refs.apisrv.classList.add('highlight'); s.refs.client.classList.add('highlight'); return; }

      // ETCD sends the ack, so it is lit from entry. The Api is mid-chain: it takes the ack before
      // it answers the client, so it lights on arrival, and the client lights one hop later.
      const ack = routePacket(s, ctx, PERSIST_ACK, { role: 'cluster' });
      lightBoxAt(s.refs.apisrv, ctx, ack.arrivalMs);
      const clientPkt = routePacket(s, ctx, POST_ACK, { delay: ack.arrivalMs + BEAT.afterHop, role: 'cluster' });
      lightBoxAt(s.refs.client, ctx, clientPkt.arrivalMs);
    },
  },
  {
    id: 'controller',
    duration: 1900,
    narration: 'The Deployment controller, inside the controller-manager, sees "my-app" via its watch on the API. It creates a ReplicaSet (my-app-7d4). The ReplicaSet controller then creates a Pod (my-app-7d4-abc) with no nodeName yet.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      s.refs.apisrv.classList.add('highlight');
      setWire(s, 'controller', 'watch ADDED Deployment my-app');
      if (ctx.reduced) { s.refs.cm.classList.add('highlight'); return; }
      const pkt = routePacket(s, ctx, TO_CM, { role: 'cluster' });
      lightBoxAt(s.refs.cm, ctx, pkt.arrivalMs);
    },
  },
  {
    id: 'schedule',
    duration: 2200,
    narration: 'The Scheduler picks up my-app-7d4-abc, filters candidate Nodes (taints, resources, affinity), scores the survivors, and posts a Binding that pins the Pod to Node-1.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      s.refs.apisrv.classList.add('highlight');
      setWire(s, 'schedule', 'POST .../binding · node=Node-1');
      if (ctx.reduced) { s.refs.sched.classList.add('highlight'); return; }
      // The Scheduler picks up the unscheduled Pod on its watch (Api -> Scheduler), then posts the
      // Binding back to the Api on the return lane (Scheduler -> Api) that pins it to Node-1. It
      // lights when the watch reaches it: everything it does here is a reaction to that event.
      const pickup = routePacket(s, ctx, TO_SCHED, { role: 'cluster' });
      lightBoxAt(s.refs.sched, ctx, pickup.arrivalMs);
      routePacket(s, ctx, FROM_SCHED, { delay: pickup.arrivalMs + BEAT.afterHop, role: 'cluster' });
    },
  },
  {
    id: 'kubelet-watch',
    duration: 2400,
    narration: 'The Kubelet on Node-1 has a filtered watch on /api/v1/pods?fieldSelector=spec.nodeName=Node-1. The API streams my-app-7d4-abc to it, and the Kubelet prepares to start the Pod.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      s.refs.apisrv.classList.add('highlight');
      setWire(s, 'kubelet-watch', 'watch ADDED my-app-7d4-abc');
      if (ctx.reduced) { s.refs.kubelet.classList.add('highlight'); return; }
      const pkt = routePacket(s, ctx, TO_KUBELET, { role: 'cluster' });
      lightBoxAt(s.refs.kubelet, ctx, pkt.arrivalMs);
    },
  },
  {
    id: 'create-pod',
    duration: 2500,
    narration: 'The Kubelet pulls the nginx:1.27 image and starts the container. The Pod my-app-7d4-abc transitions to Running on Node-1.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      s.refs.kubelet.classList.add('highlight');
      // Pin the arrow/pod visible so cancel returns cleanly. The Pod appears in its
      // normal (thin) outline, pulses once on arrival, then eases back to it.
      s.refs.kubeletPodArrow.style.opacity = '1';
      s.refs.placedPod.style.opacity = '1';
      if (ctx.reduced) {
        // Static end-state: the Pod has started, so it rests in the bold outline.
        s.refs.placedPodBox.classList.add('highlight');
        return;
      }
      ctx.register(s.refs.kubeletPodArrow.animate(
        [{ opacity: 0 }, { opacity: 1 }],
        { duration: 400, fill: 'forwards', easing: 'ease-out' }
      ));
      ctx.register(s.refs.placedPod.animate(
        [{ opacity: 0 }, { opacity: 1 }],
        { duration: 400, fill: 'forwards', easing: 'ease-out' }
      ));
      const start = routePacket(s, ctx, START, { role: 'cluster' });
      pulsePod(s.refs.placedPod, ctx, start.arrivalMs);
    },
  },
];

export const init = makeInit(Scene, STEPS, { posterFirst: true });
