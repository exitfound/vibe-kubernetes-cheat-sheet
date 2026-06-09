import { svg, g, text } from '../lib/svg.js';
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
    const etcdC  = cylinder({ x: 940, y: 70, w: 130, h: 110, label: 'ETCD',         cat: 'control' });
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

    root.appendChild(arrow({ x1: 720, y1: 110, x2: 940, y2: 110, dim: true, dashed: true,  color: 'control' }));
    root.appendChild(arrow({ x1: 940, y1: 130, x2: 720, y2: 130, dim: true, dashed: true,  color: 'control' }));
    root.appendChild(pathArrow({ points: [[540, 160], [540, 210], [200, 210], [200, 240]], dim: true, dashed: true, color: 'control' }));
    root.appendChild(pathArrow({ points: [[660, 160], [660, 210], [840, 210], [840, 240]], dim: true, dashed: true, color: 'control' }));
    root.appendChild(pathArrow({ points: [[600, 160], [600, 380], [260, 380], [260, 480]], dim: true, dashed: true, color: 'control' }));

    const wireEtcdWrite  = text({ class: 'scheme-label code dim', x: 830, y: 98,  'text-anchor': 'middle' }, [' ']);
    const wireEtcdRead   = text({ class: 'scheme-label code dim', x: 830, y: 152, 'text-anchor': 'middle' }, [' ']);
    const wireControllers = text({ class: 'scheme-label code dim', x: 370, y: 200, 'text-anchor': 'middle' }, [' ']);
    const wireScheduler  = text({ class: 'scheme-label code dim', x: 750, y: 200, 'text-anchor': 'middle' }, [' ']);
    const wireNode       = text({ class: 'scheme-label code dim', x: 430, y: 370, 'text-anchor': 'middle' }, [' ']);
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
  ['apisrv','etcdC','ctrlMgr','sched','kubelet','runtime','kproxy']
    .forEach(k => s.refs[k].classList.remove('highlight'));
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
    id: 'Overview',
    duration: 1500,
    narration: 'The Control Plane manages the desired cluster state. Worker nodes run the actual workloads. Every component exchanges data through the ApiServer.',
    enter(s) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
    },
  },
  {
    id: 'ApiServer',
    duration: 1700,
    narration: 'The ApiServer is the cluster\'s only entry point. Every read and every write passes through it. Replicas are stateless and require no coordination, so the layer scales horizontally.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      s.refs.apisrv.classList.add('highlight');
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
      setWire(s, 'etcd-write', 'write · Raft quorum commit');
      if (ctx.reduced) return;
      const p = packet({ x: 720, y: 110, cat: 'control' });
      s.refs.packetLayer.appendChild(p);
      ctx.register(animateAlong(p, [[720, 110], [830, 110], [940, 110]], { duration: 1200 }));
      ctx.register(p.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 200, delay: 1200, fill: 'forwards', easing: 'ease-in' }));
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
      setWire(s, 'etcd-read', 'read · watch stream open');
      if (ctx.reduced) return;
      const p = packet({ x: 940, y: 130, cat: 'control' });
      s.refs.packetLayer.appendChild(p);
      ctx.register(animateAlong(p, [[940, 130], [830, 130], [720, 130]], { duration: 1200 }));
      ctx.register(p.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 200, delay: 1200, fill: 'forwards', easing: 'ease-in' }));
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
      setWire(s, 'controllers', 'watch · reconcile loop');
      if (ctx.reduced) return;
      const p = packet({ x: 540, y: 160, cat: 'control' });
      s.refs.packetLayer.appendChild(p);
      ctx.register(animateAlong(p, [[540, 160], [540, 210], [200, 210], [200, 240]], { duration: 1700 }));
      ctx.register(p.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 200, delay: 1700, fill: 'forwards', easing: 'ease-in' }));
    },
  },
  {
    id: 'scheduler',
    duration: 1900,
    narration: 'The Scheduler watches Pods that don\'t yet have a node assignment, filters and scores the candidates, then posts a Binding back to the ApiServer. That single write is its entire job. The Kubelet on the chosen node takes it from there.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      s.refs.apisrv.classList.add('highlight');
      s.refs.sched.classList.add('highlight');
      setWire(s, 'scheduler', 'watch Pods · post Binding');
      if (ctx.reduced) return;
      const p = packet({ x: 660, y: 160, cat: 'control' });
      s.refs.packetLayer.appendChild(p);
      ctx.register(animateAlong(p, [[660, 160], [660, 210], [840, 210], [840, 240]], { duration: 1700 }));
      ctx.register(p.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 200, delay: 1700, fill: 'forwards', easing: 'ease-in' }));
    },
  },
  {
    id: 'node-side',
    duration: 2200,
    narration: 'On a worker node, the Kubelet watches the ApiServer for Pods assigned to it and drives the Runtime to start their containers. KubeProxy installs the local rules that steer Service traffic.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      s.refs.apisrv.classList.add('highlight');
      s.refs.kubelet.classList.add('highlight');
      s.refs.runtime.classList.add('highlight');
      s.refs.kproxy.classList.add('highlight');
      setWire(s, 'node', 'watch Pods · spec.nodeName=node');
      if (ctx.reduced) return;
      const p = packet({ x: 600, y: 160, cat: 'control' });
      s.refs.packetLayer.appendChild(p);
      ctx.register(animateAlong(p, [[600, 160], [600, 380], [260, 380], [260, 480]], { duration: 1900 }));
      ctx.register(p.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 200, delay: 1900, fill: 'forwards', easing: 'ease-in' }));
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
