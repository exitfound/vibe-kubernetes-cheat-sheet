import { svg, g, text } from '../lib/svg.js';
import { arrowDefs, pod, node, box, cylinder, arrow, pathArrow, packet, animateAlong, pulse } from '../lib/primitives.js';
import { Timeline } from '../lib/timeline.js';

class Scene {
  constructor(host) { this.host = host; this.refs = {}; this.build(); }

  build() {
    this.host.replaceChildren();
    this.refs = {};
    const root = svg({
      class: 'diagram',
      viewBox: '0 0 1000 620',
      preserveAspectRatio: 'xMidYMid meet',
      'aria-label': 'kubectl apply flow through the control plane',
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

    const sched = box({ x: 640, y: 240, w: 240, h: 80, label: 'Scheduler', cat: 'control' });
    root.appendChild(sched);

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
    placedPod.style.opacity = '0';
    placedPod.appendChild(placedPodShell);
    placedPod.appendChild(placedPodBox);
    root.appendChild(placedPod);

    const kubeletPodArrow = arrow({ x1: 290, y1: 505, x2: 530, y2: 505, dashed: true, color: 'control' });
    kubeletPodArrow.style.opacity = '0';
    root.appendChild(kubeletPodArrow);

    root.appendChild(arrow({ x1: 260, y1: 100, x2: 390, y2: 100, dim: true, dashed: true,  color: 'control' }));
    root.appendChild(arrow({ x1: 610, y1: 100, x2: 750, y2: 100, dim: true, dashed: true,  color: 'control' }));
    root.appendChild(arrow({ x1: 750, y1: 130, x2: 610, y2: 130, dim: true, dashed: true,  color: 'control' }));
    root.appendChild(arrow({ x1: 390, y1: 130, x2: 260, y2: 130, dim: true, dashed: true,  color: 'control' }));
    root.appendChild(pathArrow({ points: [[440, 140], [440, 200], [260, 200], [260, 240]], dim: true, dashed: true, color: 'control' }));
    root.appendChild(pathArrow({ points: [[560, 140], [560, 200], [760, 200], [760, 240]], dim: true, dashed: true, color: 'control' }));
    root.appendChild(pathArrow({ points: [[500, 140], [500, 380], [190, 380], [190, 465]], dim: true, dashed: true, color: 'control' }));

    const wirePost          = text({ class: 'scheme-label code dim', x: 325, y: 46,  'text-anchor': 'middle' }, [' ']);
    const wirePersist       = text({ class: 'scheme-label code dim', x: 680, y: 46,  'text-anchor': 'middle' }, [' ']);
    const wireController    = text({ class: 'scheme-label code dim', x: 325, y: 178, 'text-anchor': 'middle' }, [' ']);
    const wireSchedule      = text({ class: 'scheme-label code dim', x: 685, y: 178, 'text-anchor': 'middle' }, [' ']);
    const wireKubeletWatch  = text({ class: 'scheme-label code dim', x: 345, y: 370, 'text-anchor': 'middle' }, [' ']);
    const wireCreatePod     = text({ class: 'scheme-label code dim', x: 410, y: 493, 'text-anchor': 'middle' }, [' ']);
    const wireEtcdAck       = text({ class: 'scheme-label code dim', x: 680, y: 158, 'text-anchor': 'middle' }, [' ']);
    const wireApiAck        = text({ class: 'scheme-label code dim', x: 325, y: 158, 'text-anchor': 'middle' }, [' ']);
    [wirePost, wirePersist, wireController, wireSchedule, wireKubeletWatch, wireCreatePod, wireEtcdAck, wireApiAck].forEach(t => root.appendChild(t));

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
        'create-pod':    wireCreatePod,
        'etcd-ack':      wireEtcdAck,
        'api-ack':       wireApiAck,
      },
      packetLayer,
    };
  }

  reset() { this.build(); }
}

function clearHL(s) {
  ['client','apisrv','etcd','cm','sched','kubelet'].forEach(k => s.refs[k].classList.remove('highlight'));
  if (s.refs.placedPodBox) s.refs.placedPodBox.classList.remove('highlight');
}

function clearWires(s) {
  Object.values(s.refs.wires).forEach(t => { t.textContent = ''; });
}

function setWire(s, key, txt) {
  clearWires(s);
  if (s.refs.wires[key]) s.refs.wires[key].textContent = txt;
}

const STEPS = [
  {
    id: 'idle',
    duration: 1400,
    narration: 'Before any request arrives, the cluster sits in a steady state. The Control Plane runs ApiServer, ETCD, ControllerManager and Scheduler. On Node-1, the Kubelet watches the ApiServer for pods assigned to it.',
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
    narration: 'You run "kubectl apply -f deploy.yaml". The client serializes the manifest as JSON and POSTs it to /apis/apps/v1/namespaces/default/deployments on the ApiServer.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      s.refs.client.classList.add('highlight');
      s.refs.apisrv.classList.add('highlight');
      setWire(s, 'post', 'POST /apis/apps/v1/namespaces/default/deployments');
      if (ctx.reduced) return;
      const p = packet({ x: 260, y: 100, cat: 'control' });
      s.refs.packetLayer.appendChild(p);
      ctx.register(animateAlong(p, [[260, 100], [325, 100], [390, 100]], { duration: 1400 }));
      ctx.register(p.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 200, delay: 1400, fill: 'forwards', easing: 'ease-in' }));
    },
  },
  {
    id: 'persist',
    duration: 1700,
    narration: 'The ApiServer authenticates the caller using credentials from your kubeconfig, runs admission and schema validation, then writes the new Deployment "my-app" to ETCD. ETCD commits the write via Raft quorum at rv=842.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      s.refs.apisrv.classList.add('highlight');
      s.refs.etcd.classList.add('highlight');
      setWire(s, 'persist', 'write committed · rv=842');
      if (ctx.reduced) return;
      const p = packet({ x: 610, y: 100, cat: 'control' });
      s.refs.packetLayer.appendChild(p);
      ctx.register(animateAlong(p, [[610, 100], [680, 100], [750, 100]], { duration: 1100 }));
      ctx.register(p.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 200, delay: 1100, fill: 'forwards', easing: 'ease-in' }));
    },
  },
  {
    id: 'etcd-response',
    duration: 1900,
    narration: 'ETCD acks the committed write back to the ApiServer at rv=842, and the ApiServer returns HTTP 201 Created to the Kubectl client. The Deployment now exists in cluster state, but no Pods have been created yet.',
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
    id: 'controller',
    duration: 1900,
    narration: 'The Deployment controller, inside the ControllerManager, sees "my-app" via its watch on the ApiServer. It creates a ReplicaSet (my-app-7d4). The ReplicaSet controller then creates a Pod (my-app-7d4-abc) with no nodeName yet.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      s.refs.apisrv.classList.add('highlight');
      s.refs.cm.classList.add('highlight');
      setWire(s, 'controller', 'watch ADDED Deployment my-app');
      if (ctx.reduced) return;
      const p = packet({ x: 440, y: 140, cat: 'control' });
      s.refs.packetLayer.appendChild(p);
      ctx.register(animateAlong(p, [[440, 140], [440, 200], [260, 200], [260, 240]], { duration: 1700 }));
      ctx.register(p.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 200, delay: 1700, fill: 'forwards', easing: 'ease-in' }));
    },
  },
  {
    id: 'schedule',
    duration: 1900,
    narration: 'The Scheduler picks up my-app-7d4-abc, filters candidate nodes (taints, resources, affinity), scores the survivors, and posts a Binding that pins the Pod to Node-1.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      s.refs.apisrv.classList.add('highlight');
      s.refs.sched.classList.add('highlight');
      setWire(s, 'schedule', 'POST .../binding · node=Node-1');
      if (ctx.reduced) return;
      const p = packet({ x: 560, y: 140, cat: 'control' });
      s.refs.packetLayer.appendChild(p);
      ctx.register(animateAlong(p, [[560, 140], [560, 200], [760, 200], [760, 240]], { duration: 1700 }));
      ctx.register(p.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 200, delay: 1700, fill: 'forwards', easing: 'ease-in' }));
    },
  },
  {
    id: 'kubelet-watch',
    duration: 2200,
    narration: 'The Kubelet on Node-1 has a filtered watch on /api/v1/pods?fieldSelector=spec.nodeName=Node-1. The ApiServer streams my-app-7d4-abc to it, and the Kubelet prepares to start the Pod.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      s.refs.apisrv.classList.add('highlight');
      s.refs.kubelet.classList.add('highlight');
      setWire(s, 'kubelet-watch', 'watch ADDED my-app-7d4-abc');
      if (ctx.reduced) return;
      const p = packet({ x: 500, y: 140, cat: 'control' });
      s.refs.packetLayer.appendChild(p);
      ctx.register(animateAlong(p, [[500, 140], [500, 380], [190, 380], [190, 465]], { duration: 1900 }));
      ctx.register(p.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 200, delay: 1900, fill: 'forwards', easing: 'ease-in' }));
    },
  },
  {
    id: 'create-pod',
    duration: 2500,
    narration: 'The Kubelet pulls the nginx:1.27 image and starts the container. The Pod my-app-7d4-abc transitions to Running on Node-1.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      s.refs.kubelet.classList.add('highlight');
      s.refs.placedPodBox.classList.add('highlight');
      setWire(s, 'create-pod', 'pull nginx:1.27 · start container');
      // Pin final state inline so cancel returns cleanly.
      s.refs.kubeletPodArrow.style.opacity = '1';
      s.refs.placedPod.style.opacity = '1';
      if (ctx.reduced) return;
      ctx.register(s.refs.kubeletPodArrow.animate(
        [{ opacity: 0 }, { opacity: 1 }],
        { duration: 400, fill: 'forwards', easing: 'ease-out' }
      ));
      const p = packet({ x: 290, y: 505, cat: 'control' });
      s.refs.packetLayer.appendChild(p);
      ctx.register(animateAlong(p, [[290, 505], [410, 505], [530, 505]], { duration: 1500 }));
      ctx.register(p.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 200, delay: 1500, fill: 'forwards', easing: 'ease-in' }));
      ctx.register(s.refs.placedPod.animate(
        [{ opacity: 0 }, { opacity: 1 }],
        { duration: 700, delay: 0, fill: 'forwards', easing: 'ease-out' }
      ));
    },
  },
];

export function init(root, callbacks = {}) {
  const scene = new Scene(root);
  const tl = new Timeline({
    steps: STEPS,
    scene,
    onSceneReset: () => scene.reset(),
    onChange: callbacks.onStepChange,
    onPlayingChange: callbacks.onPlayingChange,
  });
  return {
    play: () => tl.play(),
    pause: () => tl.pause(),
    reset: () => tl.reset(),
    restart: () => tl.restart(),
    gotoStep: (i) => tl.gotoStep(i),
    setLoop: (b) => tl.setLoop(b),
    isLooping: () => tl.isLooping(),
    step: (dir) => tl.step(dir),
    setSpeed: (r) => tl.setSpeed(r),
    isPlaying: () => tl.isPlaying(),
    destroy: () => { tl.destroy(); root.replaceChildren(); },
  };
}
