import { svg, g, text } from '../lib/svg.js';
import { arrowDefs, pod, node, box, cylinder, arrow, pathArrow, packet, animateAlong } from '../lib/primitives.js';
import { makeInit } from '../lib/control-kit.js';

class Scene {
  constructor(host) { this.host = host; this.refs = {}; this.build(); }

  build() {
    this.host.replaceChildren();
    this.refs = {};
    const root = svg({
      class: 'diagram',
      viewBox: '0 0 1000 620',
      preserveAspectRatio: 'xMidYMid meet',
      'aria-label': 'kubectl delete flow through the control plane',
      'data-style': 'outline',
    });
    root.appendChild(arrowDefs());

    const client = box({ x: 130, y: 60, w: 130, h: 80, label: 'Kubectl', cat: 'control' });
    root.appendChild(client);

    const apisrv = box({ x: 390, y: 60, w: 220, h: 80, label: 'ApiServer', cat: 'control' });
    root.appendChild(apisrv);

    const etcd = cylinder({ x: 750, y: 50, w: 140, h: 100, label: 'ETCD', cat: 'control' });
    root.appendChild(etcd);

    const cm = box({ x: 140, y: 240, w: 240, h: 80, label: 'ControllerManager', cat: 'control' });
    root.appendChild(cm);

    const gc = box({ x: 640, y: 240, w: 240, h: 80, label: 'GarbageCollector', cat: 'control' });
    root.appendChild(gc);

    const nodeEl = node({ x: 50, y: 410, w: 900, h: 190, label: 'Node-1' });
    root.appendChild(nodeEl);

    const kubelet = box({ x: 90, y: 465, w: 200, h: 80, label: 'Kubelet', cat: 'control' });
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

    const kubeletPodArrow = arrow({ x1: 290, y1: 505, x2: 530, y2: 505, dashed: true, color: 'control' });
    root.appendChild(kubeletPodArrow);

    root.appendChild(arrow({ x1: 260, y1: 100, x2: 390, y2: 100, dim: true, dashed: true, color: 'control' }));
    root.appendChild(arrow({ x1: 610, y1: 100, x2: 750, y2: 100, dim: true, dashed: true, color: 'control' }));
    root.appendChild(arrow({ x1: 750, y1: 130, x2: 610, y2: 130, dim: true, dashed: true, color: 'control' }));
    root.appendChild(arrow({ x1: 390, y1: 130, x2: 260, y2: 130, dim: true, dashed: true, color: 'control' }));
    root.appendChild(pathArrow({ points: [[440, 140], [440, 200], [260, 200], [260, 240]], dim: true, dashed: true, color: 'control' }));
    root.appendChild(pathArrow({ points: [[530, 140], [530, 195], [760, 195], [760, 240]], dim: true, dashed: true, color: 'control' }));
    root.appendChild(pathArrow({ points: [[640, 280], [590, 280], [590, 140]], dim: true, dashed: true, color: 'control' }));
    root.appendChild(pathArrow({ points: [[500, 140], [500, 380], [190, 380], [190, 465]], dim: true, dashed: true, color: 'control' }));

    const wireDelete       = text({ class: 'scheme-label code dim', x: 325, y: 46,  'text-anchor': 'middle' }, [' ']);
    const wirePersist      = text({ class: 'scheme-label code dim', x: 680, y: 46,  'text-anchor': 'middle' }, [' ']);
    const wireEtcdAck      = text({ class: 'scheme-label code dim', x: 680, y: 158, 'text-anchor': 'middle' }, [' ']);
    const wireApiAck       = text({ class: 'scheme-label code dim', x: 325, y: 158, 'text-anchor': 'middle' }, [' ']);
    const wireController   = text({ class: 'scheme-label code dim', x: 325, y: 178, 'text-anchor': 'middle' }, [' ']);
    const wireGc           = text({ class: 'scheme-label code dim', x: 685, y: 178, 'text-anchor': 'middle' }, [' ']);
    const wireKubeletWatch = text({ class: 'scheme-label code dim', x: 345, y: 370, 'text-anchor': 'middle' }, [' ']);
    const wireStopPod      = text({ class: 'scheme-label code dim', x: 410, y: 493, 'text-anchor': 'middle' }, [' ']);
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
  ['client','apisrv','etcd','cm','gc','kubelet'].forEach(k => s.refs[k].classList.remove('highlight'));
  if (s.refs.placedPodBox) s.refs.placedPodBox.classList.remove('highlight');
}

function clearWires(s) {
  Object.values(s.refs.wires).forEach(t => { t.textContent = ''; });
}

function setWire(s, key, txt) {
  if (s.refs.wires[key]) s.refs.wires[key].textContent = txt;
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
    narration: 'You run "kubectl delete deployment my-app --cascade=foreground". The client sends an HTTP DELETE to /apis/apps/v1/namespaces/default/deployments/my-app on the ApiServer with propagationPolicy=Foreground in the request body.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      s.refs.client.classList.add('highlight');
      s.refs.apisrv.classList.add('highlight');
      setWire(s, 'delete', 'DELETE /apis/apps/v1/.../deployments/my-app');
      if (ctx.reduced) return;
      const p = packet({ x: 260, y: 100, cat: 'control' });
      s.refs.packetLayer.appendChild(p);
      ctx.register(animateAlong(p, [[260, 100], [325, 100], [390, 100]], { duration: 1400 }));
      ctx.register(p.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 200, delay: 1400, fill: 'forwards', easing: 'ease-in' }));
    },
  },
  {
    id: 'mark-deletion',
    duration: 1900,
    narration: 'The ApiServer does not remove the object. It patches metadata.deletionTimestamp and adds the foregroundDeletion finalizer, then commits the change to ETCD via Raft at rv=843. The Deployment is now Terminating but still exists in cluster state.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      s.refs.apisrv.classList.add('highlight');
      s.refs.etcd.classList.add('highlight');
      setWire(s, 'persist', 'patch deletionTimestamp · rv=843');
      if (ctx.reduced) return;
      const p = packet({ x: 610, y: 100, cat: 'control' });
      s.refs.packetLayer.appendChild(p);
      ctx.register(animateAlong(p, [[610, 100], [680, 100], [750, 100]], { duration: 1100 }));
      ctx.register(p.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 200, delay: 1100, fill: 'forwards', easing: 'ease-in' }));
    },
  },
  {
    id: 'ack-response',
    duration: 1900,
    narration: 'ETCD acks the committed write back to the ApiServer, and the ApiServer returns HTTP 202 Accepted to Kubectl. From the caller perspective the call already returned, but the object lifecycle is only just beginning.',
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

      const p1 = packet({ x: 750, y: 130, cat: 'control' });
      s.refs.packetLayer.appendChild(p1);
      ctx.register(animateAlong(p1, [[750, 130], [680, 130], [610, 130]], { duration: 900 }));
      ctx.register(p1.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 200, delay: 900, fill: 'forwards', easing: 'ease-in' }));

      const p2 = packet({ x: 390, y: 130, cat: 'control' });
      p2.style.opacity = '0';
      s.refs.packetLayer.appendChild(p2);
      ctx.register(p2.animate(
        [{ opacity: 0 }, { opacity: 1 }],
        { duration: 200, delay: 800, fill: 'forwards', easing: 'ease-out' }
      ));
      ctx.register(p2.animate(
        [
          { transform: 'translate(390px, 130px)' },
          { transform: 'translate(260px, 130px)' }
        ],
        { duration: 900, delay: 800, fill: 'forwards', easing: 'ease-in-out' }
      ));
      ctx.register(p2.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 200, delay: 1700, fill: 'forwards', easing: 'ease-in' }));
    },
  },
  {
    id: 'gc-cascade',
    duration: 3200,
    narration: 'The ApiServer pushes a MODIFIED event for the Deployment to all watchers in parallel. The Deployment controller inside the ControllerManager sees the new deletionTimestamp and stops issuing new rollouts. The GarbageCollector receives the same event, walks ownerReferences locally, and only after that initiates its own PATCH calls back to the ApiServer to set deletionTimestamp on ReplicaSet my-app-7d4 and Pod my-app-7d4-abc.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      s.refs.apisrv.classList.add('highlight');
      s.refs.cm.classList.add('highlight');
      s.refs.gc.classList.add('highlight');
      clearWires(s);
      s.refs.wires['controller'].textContent = 'watch MODIFIED · Deployment';
      s.refs.wires['gc'].textContent         = 'PATCH replicasets · pods';
      if (ctx.reduced) return;

      const p1 = packet({ x: 530, y: 140, cat: 'control' });
      s.refs.packetLayer.appendChild(p1);
      ctx.register(animateAlong(p1, [[530, 140], [530, 195], [760, 195], [760, 240]], { duration: 1100 }));
      ctx.register(p1.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 200, delay: 1100, fill: 'forwards', easing: 'ease-in' }));
      // To CM (left), for Deployment/ReplicaSet controllers:
      const pCm = packet({ x: 440, y: 140, cat: 'control' });
      s.refs.packetLayer.appendChild(pCm);
      ctx.register(animateAlong(pCm, [[440, 140], [440, 200], [260, 200], [260, 240]], { duration: 1100 }));
      ctx.register(pCm.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 200, delay: 1100, fill: 'forwards', easing: 'ease-in' }));

      // GC is already lit at entry via the auto-delta pulse, so no separate arrival brightness
      // (which would double-blink against the entry pulse). The MODIFIED-event packet reaching
      // GC carries the beat, then the PATCH-back packet leaves below.

      const p2 = packet({ x: 640, y: 280, cat: 'control' });
      p2.style.opacity = '0';
      s.refs.packetLayer.appendChild(p2);
      ctx.register(p2.animate(
        [{ opacity: 0 }, { opacity: 1 }],
        { duration: 200, delay: 1800, fill: 'forwards', easing: 'ease-out' }
      ));
      ctx.register(p2.animate(
        [
          { transform: 'translate(640px, 280px)' },
          { transform: 'translate(590px, 280px)', offset: 0.26 },
          { transform: 'translate(590px, 140px)' }
        ],
        { duration: 1200, delay: 1800, fill: 'forwards', easing: 'ease-in-out' }
      ));
      ctx.register(p2.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 200, delay: 3000, fill: 'forwards', easing: 'ease-in' }));
    },
  },
  {
    id: 'kubelet-watch',
    duration: 2000,
    narration: 'The Kubelet on Node-1 has a filtered watch for Pods bound to it. The ApiServer streams a MODIFIED event for my-app-7d4-abc carrying its new deletionTimestamp, and the Kubelet starts the termination procedure for the Pod.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      s.refs.apisrv.classList.add('highlight');
      s.refs.kubelet.classList.add('highlight');
      setWire(s, 'kubelet-watch', 'watch MODIFIED · Pod');
      if (ctx.reduced) return;
      const p = packet({ x: 500, y: 140, cat: 'control' });
      s.refs.packetLayer.appendChild(p);
      ctx.register(animateAlong(p, [[500, 140], [500, 380], [190, 380], [190, 465]], { duration: 1700 }));
      ctx.register(p.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 200, delay: 1700, fill: 'forwards', easing: 'ease-in' }));
    },
  },
  {
    id: 'kubelet-stops',
    duration: 2400,
    narration: 'The Kubelet sends SIGTERM to the container, waits up to terminationGracePeriodSeconds (30s default), then reports the Pod terminated to the ApiServer. Pod-side details (probes, preStop hook) are covered in the Graceful Pod Shutdown card.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      s.refs.kubelet.classList.add('highlight');
      s.refs.placedPodBox.classList.add('highlight');
      setWire(s, 'stop-pod', 'SIGTERM · grace 30s');
      // Pin final state inline so cancel between steps doesn't flash to default opacity.
      s.refs.placedPod.style.opacity = '0.4';
      if (ctx.reduced) return;
      // SIGTERM packet flies from Kubelet to Pod first.
      const sigPacket = packet({ x: 290, y: 505, cat: 'control' });
      s.refs.packetLayer.appendChild(sigPacket);
      ctx.register(animateAlong(sigPacket, [[290, 505], [410, 505], [530, 505]], { duration: 1000 }));
      ctx.register(sigPacket.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 200, delay: 1000, fill: 'forwards', easing: 'ease-in' }));
      ctx.register(s.refs.placedPod.animate(
        [{ opacity: 1 }, { opacity: 0.4 }],
        { duration: 1300, delay: 1000, fill: 'both', easing: 'ease-in' }
      ));
    },
  },
  {
    id: 'purge',
    duration: 2300,
    narration: 'With the Pod terminated and dependents accounted for, the GarbageCollector clears the foregroundDeletion finalizer up the chain. The ApiServer issues real DELETEs to ETCD, removing Pod, ReplicaSet, and Deployment in turn. Watchers receive DELETED events. The objects are now truly gone.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      s.refs.apisrv.classList.add('highlight');
      s.refs.etcd.classList.add('highlight');
      setWire(s, 'persist', 'DELETE · finalizers=[] · rv=856');
      // Pin final state inline so cancel returns to the right value, not default.
      s.refs.placedPod.style.opacity = '0';
      s.refs.kubeletPodArrow.style.opacity = '0';
      if (ctx.reduced) return;
      ctx.register(s.refs.placedPod.animate(
        [{ opacity: 0.4 }, { opacity: 0 }],
        { duration: 1100, fill: 'forwards', easing: 'ease-out' }
      ));
      ctx.register(s.refs.kubeletPodArrow.animate(
        [{ opacity: 1 }, { opacity: 0 }],
        { duration: 800, fill: 'forwards', easing: 'ease-out' }
      ));
      const p = packet({ x: 610, y: 100, cat: 'control' });
      s.refs.packetLayer.appendChild(p);
      ctx.register(animateAlong(p, [[610, 100], [680, 100], [750, 100]], { duration: 1200 }));
      ctx.register(p.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 200, delay: 1200, fill: 'forwards', easing: 'ease-in' }));
    },
  },
];

export const init = makeInit(Scene, STEPS);
