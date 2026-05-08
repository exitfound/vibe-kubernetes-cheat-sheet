import { svg, g } from '../lib/svg.js';
import { arrowDefs, box, node, cylinder, arrow, pathArrow, packet, animateAlong, pulse } from '../lib/primitives.js';
import { Timeline } from '../lib/timeline.js';

class Scene {
  constructor(host) { this.host = host; this.refs = {}; this.build(); }

  build() {
    this.host.replaceChildren();
    this.refs = {};
    const root = svg({
      class: 'diagram',
      viewBox: '0 0 1200 620',
      preserveAspectRatio: 'xMidYMid meet',
      'aria-label': 'Kubernetes control plane architecture',
      'data-style': 'outline',
    });
    root.appendChild(arrowDefs());

    const apisrv = box({ x: 480, y: 80, w: 240, h: 80, label: 'ApiServer',         cat: 'control' });
    const etcdC  = cylinder({ x: 820, y: 70, w: 130, h: 110, label: 'ETCD',         cat: 'control' });
    root.appendChild(apisrv);
    root.appendChild(etcdC);

    const ctrlMgr = box({ x: 80,  y: 240, w: 240, h: 80, label: 'ControllerManager', cat: 'control' });
    const sched   = box({ x: 720, y: 240, w: 240, h: 80, label: 'Scheduler',         cat: 'control' });
    root.appendChild(ctrlMgr);
    root.appendChild(sched);

    const nodeEl = node({ x: 40, y: 420, w: 1120, h: 180, label: 'worker node' });
    root.appendChild(nodeEl);

    const kubelet = box({ x: 140, y: 480, w: 240, h: 80, label: 'Kubelet',   cat: 'control' });
    const runtime = box({ x: 480, y: 480, w: 240, h: 80, label: 'Runtime',   cat: 'control' });
    const kproxy  = box({ x: 820, y: 480, w: 240, h: 80, label: 'KubeProxy', cat: 'control' });
    root.appendChild(kubelet);
    root.appendChild(runtime);
    root.appendChild(kproxy);

    root.appendChild(arrow({ x1: 720, y1: 110, x2: 820, y2: 110, dim: true, dashed: true,  color: 'control' }));
    root.appendChild(arrow({ x1: 820, y1: 130, x2: 720, y2: 130, dim: true, dashed: true,  color: 'control' }));
    root.appendChild(pathArrow({ points: [[540, 160], [540, 210], [200, 210], [200, 240]], dim: true, dashed: true, color: 'control' }));
    root.appendChild(pathArrow({ points: [[660, 160], [660, 210], [840, 210], [840, 240]], dim: true, dashed: true, color: 'control' }));
    root.appendChild(pathArrow({ points: [[600, 160], [600, 380], [260, 380], [260, 480]], dim: true, dashed: true, color: 'control' }));

    const packetLayer = g({ id: 'packetLayer' });
    root.appendChild(packetLayer);

    this.host.appendChild(root);
    this.refs = { svg: root, apisrv, etcdC, ctrlMgr, sched, nodeEl, kubelet, runtime, kproxy, packetLayer };
  }

  reset() { this.build(); }
}

function clearHL(s) {
  ['apisrv','etcdC','ctrlMgr','sched','kubelet','runtime','kproxy']
    .forEach(k => s.refs[k].classList.remove('highlight'));
}

const STEPS = [
  {
    id: 'Overview',
    duration: 1500,
    narration: 'The Control Plane manages the desired cluster state. Worker nodes run the actual workloads. Every component exchanges data through the ApiServer.',
    enter(s) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
    },
  },
  {
    id: 'ApiServer',
    duration: 1700,
    narration: 'The ApiServer is the cluster\'s only entry point. Every read and every write passes through it. Replicas are stateless and require no coordination, so the layer scales horizontally.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      s.refs.apisrv.classList.add('highlight');
      if (!ctx.reduced) ctx.register(pulse(s.refs.apisrv, { duration: 800, iterations: 2 }));
    },
  },
  {
    id: 'etcd',
    duration: 1700,
    narration: 'ETCD is the cluster\'s only durable store, and the ApiServer is its only client. Every change is replicated through Raft, where a quorum of replicas must agree before the write is committed.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      s.refs.apisrv.classList.add('highlight');
      s.refs.etcdC.classList.add('highlight');
      const p = packet({ x: 720, y: 110, cat: 'control' });
      s.refs.packetLayer.appendChild(p);
      if (ctx.reduced) {
        p.style.transform = 'translate(820px, 110px)';
      } else {
        ctx.register(animateAlong(p, [[720, 110], [770, 110], [820, 110]], { duration: 1200 }));
        ctx.register(pulse(s.refs.etcdC, { duration: 800, iterations: 1 }));
      }
    },
  },
  {
    id: 'etcd-response',
    duration: 1700,
    narration: 'ETCD returns the requested data to the ApiServer. When the ApiServer subscribes via a watch, ETCD keeps that stream open and pushes subsequent changes through it without another round trip.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      s.refs.etcdC.classList.add('highlight');
      s.refs.apisrv.classList.add('highlight');
      const p = packet({ x: 820, y: 130, cat: 'control' });
      s.refs.packetLayer.appendChild(p);
      if (ctx.reduced) {
        p.style.transform = 'translate(720px, 130px)';
      } else {
        ctx.register(animateAlong(p, [[820, 130], [770, 130], [720, 130]], { duration: 1200 }));
        ctx.register(pulse(s.refs.apisrv, { duration: 800, iterations: 1 }));
      }
    },
  },
  {
    id: 'controllers',
    duration: 1900,
    narration: 'The ControllerManager runs many small control loops, one per resource kind (Deployment, ReplicaSet, Job and so on). Each watches the ApiServer and writes back to reconcile observed state with desired state.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      s.refs.apisrv.classList.add('highlight');
      s.refs.ctrlMgr.classList.add('highlight');
      const p = packet({ x: 540, y: 160, cat: 'control' });
      s.refs.packetLayer.appendChild(p);
      if (ctx.reduced) {
        p.style.transform = 'translate(200px, 240px)';
      } else {
        ctx.register(animateAlong(p, [[540, 160], [540, 210], [200, 210], [200, 240]], { duration: 1700 }));
      }
    },
  },
  {
    id: 'scheduler',
    duration: 1700,
    narration: 'The Scheduler watches Pods that don\'t yet have a node assignment, filters and scores the candidates, then posts a Binding back to the ApiServer. That single write is its entire job. The Kubelet on the chosen node takes it from there.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      s.refs.apisrv.classList.add('highlight');
      s.refs.sched.classList.add('highlight');
      const p = packet({ x: 660, y: 160, cat: 'control' });
      s.refs.packetLayer.appendChild(p);
      if (ctx.reduced) {
        p.style.transform = 'translate(840px, 240px)';
      } else {
        ctx.register(animateAlong(p, [[660, 160], [660, 210], [840, 210], [840, 240]], { duration: 1700 }));
      }
    },
  },
  {
    id: 'node-side',
    duration: 2000,
    narration: 'On a worker node, the Kubelet watches the ApiServer for Pods assigned to it and drives the Runtime to start their containers. KubeProxy installs the local rules that steer Service traffic.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      s.refs.apisrv.classList.add('highlight');
      s.refs.kubelet.classList.add('highlight');
      s.refs.runtime.classList.add('highlight');
      s.refs.kproxy.classList.add('highlight');
      const p = packet({ x: 600, y: 160, cat: 'control' });
      s.refs.packetLayer.appendChild(p);
      if (ctx.reduced) {
        p.style.transform = 'translate(260px, 480px)';
      } else {
        ctx.register(animateAlong(p, [[600, 160], [600, 380], [260, 380], [260, 480]], { duration: 1900 }));
        ctx.register(pulse(s.refs.kubelet, { duration: 800, iterations: 1 }));
      }
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
