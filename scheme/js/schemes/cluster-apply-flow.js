import { svg, g, text } from '../lib/svg.js';
import { arrowDefs, pod, node, box, cylinder, arrow, pathArrow } from '../lib/primitives.js';
import { routePacket, pulsePod, makeInit, clearHighlights, clearWires, setWire, BEAT } from '../lib/cluster-kit.js';
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
      viewBox: '-10 0 1200 620',
      preserveAspectRatio: 'xMidYMid meet',
      'aria-label': 'Kubectl apply flow through the control plane',
      'data-style': 'outline',
    });
    root.appendChild(arrowDefs());

    const client = box({ x: 270, y: 80, w: 130, h: 80, label: 'Kubectl',   role: 'cluster' });
    const apisrv = box({ x: 490, y: 80, w: 220, h: 80, label: 'Api', role: 'cluster' });
    const etcd   = cylinder({ x: 900, y: 70, w: 130, h: 110, label: 'ETCD', role: 'cluster' });
    root.appendChild(client);
    root.appendChild(apisrv);
    root.appendChild(etcd);

    // Middle row: ControllerManager (left, centre 340) and Scheduler (right, centre 860),
    // mirrored about the spine and pulled in toward the Api.
    const cm    = box({ x: 230, y: 240, w: 220, h: 80, label: 'ControllerManager', role: 'cluster' });
    const sched = box({ x: 750, y: 240, w: 220, h: 80, label: 'Scheduler',         role: 'cluster' });
    root.appendChild(cm);
    root.appendChild(sched);

    // Bottom: a full-width worker node holding the Kubelet and the Pod it places.
    const nodeEl = node({ x: 100, y: 420, w: 980, h: 180, label: 'Node-1' });
    root.appendChild(nodeEl);

    const kubelet = box({ x: 125, y: 480, w: 220, h: 80, label: 'Kubelet', role: 'cluster' });
    root.appendChild(kubelet);

    // The placed Pod (violet workloads tint) appears inside the node once the Kubelet starts it.
    const placedPodShell = pod({ x: 710, y: 462, w: 216, h: 106, label: 'Pod', sublabel: '', containers: 0, role: 'workloads' });
    placedPodShell.style.setProperty('--workloads-color', '#c0b0ff');
    const placedPodShellRect = placedPodShell.querySelector('.scheme-pod-rect');
    if (placedPodShellRect) placedPodShellRect.style.fill = 'rgba(255, 255, 255, 0.03)';

    const placedPodBox = box({ x: 740, y: 490, w: 156, h: 52, label: 'my-app-7d4-abc', sublabel: 'nginx:1.27', role: 'workloads' });
    placedPodBox.style.setProperty('--workloads-color', '#c0b0ff');

    const placedPod = g({ id: 'placedPod' });
    placedPod.style.opacity = '0';
    placedPod.appendChild(placedPodShell);
    placedPod.appendChild(placedPodBox);
    root.appendChild(placedPod);

    const kubeletPodArrow = arrow({ x1: 345, y1: 515, x2: 710, y2: 515, dashed: true, role: 'cluster' });
    kubeletPodArrow.style.opacity = '0';
    root.appendChild(kubeletPodArrow);

    // Top-row lanes straddle the Api centre (y=110 out, y=130 back) on both sides.
    root.appendChild(arrow({ x1: 400, y1: 110, x2: 490, y2: 110, dim: true, dashed: true, role: 'cluster' }));
    root.appendChild(arrow({ x1: 490, y1: 130, x2: 400, y2: 130, dim: true, dashed: true, role: 'cluster' }));
    root.appendChild(arrow({ x1: 710, y1: 110, x2: 900, y2: 110, dim: true, dashed: true, role: 'cluster' }));
    root.appendChild(arrow({ x1: 900, y1: 130, x2: 710, y2: 130, dim: true, dashed: true, role: 'cluster' }));
    // Api -> ControllerManager and Api -> Scheduler, mirrored about the spine.
    root.appendChild(pathArrow({ points: [[540, 160], [540, 200], [340, 200], [340, 240]], dim: true, dashed: true, role: 'cluster' }));
    root.appendChild(pathArrow({ points: [[660, 160], [660, 200], [870, 200], [870, 240]], dim: true, dashed: true, role: 'cluster' }));
    root.appendChild(pathArrow({ points: [[850, 240], [850, 220], [640, 220], [640, 160]], dim: true, dashed: true, role: 'cluster' }));
    // Api -> Kubelet: straight down the spine, then into the Kubelet inside the node.
    root.appendChild(pathArrow({ points: [[600, 160], [600, 390], [235, 390], [235, 480]], dim: true, dashed: true, role: 'cluster' }));

    const wirePost          = text({ class: 'scheme-label code dim', x: 445, y: 68,  'text-anchor': 'middle' }, [' ']);
    // HTTP 201 ack rides below the top row (y=180) so its ends clear the Kubectl/Api corners.
    const wireApiAck        = text({ class: 'scheme-label code dim', x: 445, y: 180, 'text-anchor': 'middle' }, [' ']);
    const wirePersist       = text({ class: 'scheme-label code dim', x: 805, y: 98,  'text-anchor': 'middle' }, [' ']);
    const wireEtcdAck       = text({ class: 'scheme-label code dim', x: 805, y: 152, 'text-anchor': 'middle' }, [' ']);
    const wireController    = text({ class: 'scheme-label code dim', x: 440, y: 186, 'text-anchor': 'middle' }, [' ']);
    const wireSchedule      = text({ class: 'scheme-label code dim', x: 765, y: 186, 'text-anchor': 'middle' }, [' ']);
    const wireKubeletWatch  = text({ class: 'scheme-label code dim', x: 495, y: 376, 'text-anchor': 'middle' }, [' ']);
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
    narration: 'Before any request arrives, the cluster sits in a steady state. The Control Plane runs Api, ETCD, ControllerManager and Scheduler. On Node-1, the Kubelet watches the Api for pods assigned to it.',
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
    narration: 'You run "kubectl apply -f deploy.yaml". The client serializes the manifest as JSON and POSTs it to /apis/apps/v1/namespaces/default/deployments on the Api.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      s.refs.client.classList.add('highlight');
      s.refs.apisrv.classList.add('highlight');
      setWire(s, 'post', 'POST /apis/apps/v1/namespaces/default/deployments');
      if (ctx.reduced) return;
      routePacket(s, ctx, [[400, 110], [445, 110], [490, 110]], { role: 'cluster' });
    },
  },
  {
    id: 'persist',
    duration: 1700,
    narration: 'The Api authenticates the caller using credentials from your kubeconfig, runs admission and schema validation, then writes the new Deployment "my-app" to ETCD. ETCD commits the write via Raft quorum at rv=842.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      s.refs.apisrv.classList.add('highlight');
      s.refs.etcd.classList.add('highlight');
      setWire(s, 'persist', 'write committed · rv=842');
      if (ctx.reduced) return;
      routePacket(s, ctx, [[710, 110], [805, 110], [900, 110]], { role: 'cluster' });
    },
  },
  {
    id: 'etcd-response',
    duration: 1900,
    narration: 'ETCD acks the committed write back to the Api at rv=842, and the Api returns HTTP 201 Created to the Kubectl client. The Deployment now exists in cluster state, but no Pods have been created yet.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      s.refs.client.classList.add('highlight');
      s.refs.apisrv.classList.add('highlight');
      s.refs.etcd.classList.add('highlight');
      clearWires(s);
      s.refs.wires['etcd-ack'].textContent = 'ack · rv=842';
      s.refs.wires['api-ack'].textContent  = 'HTTP 201 Created';
      if (ctx.reduced) return;

      const ack = routePacket(s, ctx, [[900, 130], [805, 130], [710, 130]], { role: 'cluster' });
      routePacket(s, ctx, [[490, 130], [445, 130], [400, 130]], { delay: ack.arrivalMs + BEAT.afterHop, role: 'cluster' });
    },
  },
  {
    id: 'controller',
    duration: 1900,
    narration: 'The Deployment controller, inside the ControllerManager, sees "my-app" via its watch on the Api. It creates a ReplicaSet (my-app-7d4). The ReplicaSet controller then creates a Pod (my-app-7d4-abc) with no nodeName yet.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      s.refs.apisrv.classList.add('highlight');
      s.refs.cm.classList.add('highlight');
      setWire(s, 'controller', 'watch ADDED Deployment my-app');
      if (ctx.reduced) return;
      routePacket(s, ctx, [[540, 160], [540, 200], [340, 200], [340, 240]], { role: 'cluster' });
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
      s.refs.sched.classList.add('highlight');
      setWire(s, 'schedule', 'POST .../binding · node=Node-1');
      if (ctx.reduced) return;
      // The Scheduler picks up the unscheduled Pod on its watch (Api -> Scheduler), then posts the
      // Binding back to the Api on the return lane (Scheduler -> Api) that pins it to Node-1.
      const pickup = routePacket(s, ctx, [[660, 160], [660, 200], [870, 200], [870, 240]], { role: 'cluster' });
      routePacket(s, ctx, [[850, 240], [850, 220], [640, 220], [640, 160]], { delay: pickup.arrivalMs + BEAT.afterHop, role: 'cluster' });
    },
  },
  {
    id: 'kubelet-watch',
    duration: 2200,
    narration: 'The Kubelet on Node-1 has a filtered watch on /api/v1/pods?fieldSelector=spec.nodeName=Node-1. The Api streams my-app-7d4-abc to it, and the Kubelet prepares to start the Pod.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      s.refs.apisrv.classList.add('highlight');
      s.refs.kubelet.classList.add('highlight');
      setWire(s, 'kubelet-watch', 'watch ADDED my-app-7d4-abc');
      if (ctx.reduced) return;
      routePacket(s, ctx, [[600, 160], [600, 390], [235, 390], [235, 480]], { role: 'cluster' });
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
      const start = routePacket(s, ctx, [[345, 515], [528, 515], [710, 515]], { role: 'cluster' });
      pulsePod(s.refs.placedPod, ctx, start.arrivalMs);
    },
  },
];

export const init = makeInit(Scene, STEPS, { posterFirst: true });
