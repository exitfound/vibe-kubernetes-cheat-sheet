import { svg, g, text } from '../lib/svg.js';
import { arrowDefs, pod, node, box, cylinder, arrow, pathArrow } from '../lib/primitives.js';
import { routePacket, pulsePod, makeInit, clearHighlights, clearWires, setWire, BEAT } from '../lib/control-kit.js';

class Scene {
  constructor(host) { this.host = host; this.refs = {}; this.build(); }

  build() {
    this.host.replaceChildren();
    this.refs = {};
    const root = svg({
      class: 'diagram',
      viewBox: '-100 7 1200 620',
      preserveAspectRatio: 'xMidYMid meet',
      'aria-label': 'Kubectl delete flow through the control plane',
      'data-style': 'outline',
    });
    root.appendChild(arrowDefs());

    const client = box({ x: 130, y: 60, w: 130, h: 80, label: 'Kubectl', cat: 'control' });
    root.appendChild(client);

    const apisrv = box({ x: 390, y: 60, w: 220, h: 80, label: 'Api', cat: 'control' });
    root.appendChild(apisrv);

    // ETCD narrowed to w=130 (was 140) so the label is not lost in a squat-wide cylinder and the
    // two control-plane cards match. Top/height unchanged (y=50, h=100) so its centre stays level
    // with the Api row (y=100) and the top wire labels keep their clearance above the cap.
    const etcd = cylinder({ x: 750, y: 50, w: 130, h: 100, label: 'ETCD', cat: 'control' });
    root.appendChild(etcd);

    // ControllerManager and GarbageCollector are mirrored about the Api spine (x=500): both
    // 240 wide, centres at 250 and 750 (250 either side of the spine).
    const cm = box({ x: 130, y: 240, w: 240, h: 80, label: 'ControllerManager', cat: 'control' });
    root.appendChild(cm);

    const gc = box({ x: 630, y: 240, w: 240, h: 80, label: 'GarbageCollector', cat: 'control' });
    root.appendChild(gc);

    const nodeEl = node({ x: 50, y: 410, w: 900, h: 190, label: 'Node-1' });
    root.appendChild(nodeEl);

    const kubelet = box({ x: 90, y: 465, w: 220, h: 80, label: 'Kubelet', cat: 'control' });
    root.appendChild(kubelet);

    const placedPodShell = pod({ x: 530, y: 452, w: 216, h: 106, label: 'Pod', sublabel: '', containers: 0, cat: 'workloads' });
    placedPodShell.style.setProperty('--workloads-color', '#c0b0ff');
    const placedPodShellRect = placedPodShell.querySelector('.scheme-pod-rect');
    if (placedPodShellRect) placedPodShellRect.style.fill = 'rgba(255, 255, 255, 0.03)';

    const placedPodBox = box({ x: 560, y: 480, w: 156, h: 52, label: 'my-app-7d4-abc', sublabel: 'nginx:1.27', cat: 'workloads' });
    placedPodBox.style.setProperty('--workloads-color', '#c0b0ff');

    const placedPod = g({ id: 'placedPod' });
    placedPod.appendChild(placedPodShell);
    placedPod.appendChild(placedPodBox);
    root.appendChild(placedPod);

    const kubeletPodArrow = arrow({ x1: 310, y1: 505, x2: 530, y2: 505, dashed: true, color: 'control' });
    root.appendChild(kubeletPodArrow);

    // Top-row lanes straddle the Api/Kubectl/ETCD centre line (y=100): request out at y=90,
    // response back at y=110, so the pair sits centred on the blocks instead of low.
    root.appendChild(arrow({ x1: 260, y1: 90, x2: 390, y2: 90, dim: true, dashed: true, color: 'control' }));
    root.appendChild(arrow({ x1: 610, y1: 90, x2: 750, y2: 90, dim: true, dashed: true, color: 'control' }));
    root.appendChild(arrow({ x1: 750, y1: 110, x2: 610, y2: 110, dim: true, dashed: true, color: 'control' }));
    root.appendChild(arrow({ x1: 390, y1: 110, x2: 260, y2: 110, dim: true, dashed: true, color: 'control' }));
    // Api -> ControllerManager and Api -> GarbageCollector, mirrored about the spine (x=500).
    root.appendChild(pathArrow({ points: [[450, 140], [450, 200], [250, 200], [250, 240]], dim: true, dashed: true, color: 'control' }));
    root.appendChild(pathArrow({ points: [[550, 140], [550, 200], [760, 200], [760, 240]], dim: true, dashed: true, color: 'control' }));
    // GarbageCollector DELETEs back up to the Api. Nested inside-and-below the event arrow (exits
    // GC top left of the centre entry, lower lane y=220) so the two never cross, the same out/back
    // layout the Control Plane Architecture card uses.
    root.appendChild(pathArrow({ points: [[740, 240], [740, 220], [540, 220], [540, 140]], dim: true, dashed: true, color: 'control' }));
    // Api -> Kubelet and the Kubelet -> Api return lane (the "Pod terminated" report) straddle the
    // Kubelet centre (x=190 in, x=210 out) and keep their horizontal legs clear of the Node top.
    root.appendChild(pathArrow({ points: [[500, 140], [500, 360], [190, 360], [190, 465]], dim: true, dashed: true, color: 'control' }));
    root.appendChild(pathArrow({ points: [[210, 465], [210, 380], [520, 380], [520, 140]], dim: true, dashed: true, color: 'control' }));

    const wireDelete       = text({ class: 'scheme-label code dim', x: 325, y: 46,  'text-anchor': 'middle' }, [' ']);
    const wirePersist      = text({ class: 'scheme-label code dim', x: 680, y: 46,  'text-anchor': 'middle' }, [' ']);
    const wireEtcdAck      = text({ class: 'scheme-label code dim', x: 680, y: 152, 'text-anchor': 'middle' }, [' ']);
    const wireApiAck       = text({ class: 'scheme-label code dim', x: 325, y: 152, 'text-anchor': 'middle' }, [' ']);
    const wireController   = text({ class: 'scheme-label code dim', x: 350, y: 178, 'text-anchor': 'middle' }, [' ']);
    const wireGc           = text({ class: 'scheme-label code dim', x: 680, y: 178, 'text-anchor': 'middle' }, [' ']);
    const wireKubeletWatch = text({ class: 'scheme-label code dim', x: 425, y: 350, 'text-anchor': 'middle' }, [' ']);
    const wireStopPod      = text({ class: 'scheme-label code dim', x: 420, y: 493, 'text-anchor': 'middle' }, [' ']);
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
    narration: 'Steady state: Deployment my-app owns ReplicaSet my-app-7d4, which owns Pod my-app-7d4-abc running on Node-1. Every dependent carries an ownerReference back up the chain. No object has a deletionTimestamp yet.',
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
    narration: 'You run "kubectl delete deployment my-app --cascade=foreground". The client sends an HTTP DELETE to /apis/apps/v1/namespaces/default/deployments/my-app on the Api with propagationPolicy=Foreground in the request body.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      s.refs.client.classList.add('highlight');
      s.refs.apisrv.classList.add('highlight');
      setWire(s, 'delete', 'DELETE /apis/apps/v1/.../deployments/my-app');
      if (ctx.reduced) return;
      routePacket(s, ctx, [[260, 90], [325, 90], [390, 90]]);
    },
  },
  {
    id: 'mark-deletion',
    duration: 1900,
    narration: 'The Api does not remove the object. It patches metadata.deletionTimestamp and adds the foregroundDeletion finalizer, then commits the change to ETCD via Raft at rv=843. The Deployment is now Terminating but still exists in cluster state.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      s.refs.apisrv.classList.add('highlight');
      s.refs.etcd.classList.add('highlight');
      setWire(s, 'persist', 'patch deletionTimestamp · rv=843');
      if (ctx.reduced) return;
      routePacket(s, ctx, [[610, 90], [680, 90], [750, 90]]);
    },
  },
  {
    id: 'ack-response',
    duration: 1900,
    narration: 'ETCD acks the committed write back to the Api, and the Api returns HTTP 202 Accepted to Kubectl. From the caller perspective the call already returned, but the object lifecycle is only just beginning.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      s.refs.client.classList.add('highlight');
      s.refs.apisrv.classList.add('highlight');
      s.refs.etcd.classList.add('highlight');
      clearWires(s);
      s.refs.wires['etcd-ack'].textContent = 'ack · rv=843';
      s.refs.wires['api-ack'].textContent  = 'HTTP 202 Accepted';
      if (ctx.reduced) return;

      const ack = routePacket(s, ctx, [[750, 110], [680, 110], [610, 110]]);
      routePacket(s, ctx, [[390, 110], [260, 110]], { delay: ack.arrivalMs + BEAT.afterHop });
    },
  },
  {
    id: 'gc-cascade',
    duration: 3200,
    narration: 'The Api broadcasts a MODIFIED event for the Deployment to its watchers. The Deployment controller in the ControllerManager sees the deletionTimestamp and stops issuing rollouts. The GarbageCollector walks the ownerReferences, then issues foreground DELETEs for ReplicaSet my-app-7d4 and Pod my-app-7d4-abc, which only stamp a deletionTimestamp on each rather than removing it from ETCD yet.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      s.refs.apisrv.classList.add('highlight');
      s.refs.cm.classList.add('highlight');
      s.refs.gc.classList.add('highlight');
      clearWires(s);
      s.refs.wires['controller'].textContent = 'watch MODIFIED · Deployment';
      s.refs.wires['gc'].textContent         = 'DELETE replicasets · pods';
      if (ctx.reduced) return;

      const gcEvent = routePacket(s, ctx, [[550, 140], [550, 200], [760, 200], [760, 240]]);
      // To CM (left), for Deployment/ReplicaSet controllers:
      routePacket(s, ctx, [[450, 140], [450, 200], [250, 200], [250, 240]]);

      // The MODIFIED-event packet reaching GC carries the beat, then the
      // PATCH-back packet leaves below once the event has landed.
      routePacket(s, ctx, [[740, 240], [740, 220], [540, 220], [540, 140]], { delay: gcEvent.arrivalMs + BEAT.afterHop });
    },
  },
  {
    id: 'kubelet-watch',
    duration: 2000,
    narration: 'The Kubelet on Node-1 has a filtered watch for Pods bound to it. The Api streams a MODIFIED event for my-app-7d4-abc carrying its new deletionTimestamp, and the Kubelet starts the termination procedure for the Pod.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      s.refs.apisrv.classList.add('highlight');
      s.refs.kubelet.classList.add('highlight');
      setWire(s, 'kubelet-watch', 'watch MODIFIED · Pod');
      if (ctx.reduced) return;
      routePacket(s, ctx, [[500, 140], [500, 360], [190, 360], [190, 465]]);
    },
  },
  {
    id: 'kubelet-stops',
    duration: 2800,
    narration: 'The Kubelet sends SIGTERM to the container, waits up to terminationGracePeriodSeconds (30s default), then reports the Pod terminated to the Api. Pod-side details (probes, preStop hook) are covered in the Graceful Pod Shutdown card.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      s.refs.kubelet.classList.add('highlight');
      s.refs.apisrv.classList.add('highlight');
      setWire(s, 'stop-pod', 'SIGTERM · grace 30s');
      // Pin final state inline so cancel between steps doesn't flash to default opacity.
      s.refs.placedPod.style.opacity = '0.4';
      if (ctx.reduced) return;
      // SIGTERM packet flies from Kubelet to Pod first.
      const sigterm = routePacket(s, ctx, [[310, 505], [420, 505], [530, 505]]);
      // Narrative-slow fade: the grace-period drain reads as a long dim, not a snap.
      ctx.register(s.refs.placedPod.animate(
        [{ opacity: 1 }, { opacity: 0.4 }],
        { duration: 1300, delay: sigterm.arrivalMs, fill: 'both', easing: 'ease-in' }
      ));
      // The whole Pod (shell + inner box) pulses once in sync as the SIGTERM lands, then dims
      // out with the grace-period fade. Nothing is left pinned bright.
      pulsePod(s.refs.placedPod, ctx, sigterm.arrivalMs);
      // After the grace-period drain, the Kubelet reports the terminated Pod up to the Api on the
      // return lane.
      routePacket(s, ctx, [[210, 465], [210, 380], [520, 380], [520, 140]], { delay: sigterm.arrivalMs + 800 });
    },
  },
  {
    id: 'purge',
    duration: 2300,
    narration: 'With the Pod terminated and dependents accounted for, the GarbageCollector clears the foregroundDeletion finalizer up the chain. The Api issues real DELETEs to ETCD, removing Pod, ReplicaSet, and Deployment in turn. Watchers receive DELETED events. The objects are now truly gone.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      s.refs.gc.classList.add('highlight');
      s.refs.apisrv.classList.add('highlight');
      s.refs.etcd.classList.add('highlight');
      setWire(s, 'gc', 'clear finalizer');
      setWire(s, 'persist', 'DELETE · finalizers=[] · rv=856');
      // Pin final state inline so cancel returns to the right value, not default.
      s.refs.placedPod.style.opacity = '0';
      s.refs.kubeletPodArrow.style.opacity = '0';
      if (ctx.reduced) return;
      // The GarbageCollector clears the foregroundDeletion finalizer (PATCH up to the Api), then the
      // Api issues the real DELETE to ETCD. The Pod and its arrow vanish as the object leaves ETCD.
      const clear = routePacket(s, ctx, [[740, 240], [740, 220], [540, 220], [540, 140]]);
      const del = routePacket(s, ctx, [[610, 90], [680, 90], [750, 90]], { delay: clear.arrivalMs + BEAT.afterHop });
      ctx.register(s.refs.placedPod.animate(
        [{ opacity: 0.4 }, { opacity: 0 }],
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
