import { svg, g, rect, text } from '../lib/svg.js';
import { arrowDefs, pod, box, arrow, pathArrow, packet, animateAlong, fadeIn, pulse } from '../lib/primitives.js';
import { Timeline } from '../lib/timeline.js';

function valChip({ x, y, w, h = 32, name, value, cat = 'scaling' }) {
  const grp = g({ class: 'scheme-chip', 'data-cat': cat, transform: `translate(${x},${y})` });
  grp.appendChild(rect({ class: 'scheme-chip-rect', x: 0, y: 0, width: w, height: h, rx: 4 }));
  grp.appendChild(text({ class: 'scheme-chip-text', x: 12, y: h / 2 + 4, 'text-anchor': 'start' }, [name]));
  const valueT = text({ class: 'scheme-chip-text', x: w - 12, y: h / 2 + 4, 'text-anchor': 'end' }, [value]);
  grp.appendChild(valueT);
  grp.valueText = valueT;
  return grp;
}
function setVal(node, txt) { if (node && node.valueText) node.valueText.textContent = txt; }

class Scene {
  constructor(host) { this.host = host; this.refs = {}; this.build(); }

  build() {
    this.host.replaceChildren();
    this.refs = {};
    const root = svg({
      class: 'diagram',
      viewBox: '0 0 1200 540',
      preserveAspectRatio: 'xMidYMid meet',
      'aria-label': 'Cluster Autoscaler adds a node',
    });
    root.appendChild(arrowDefs());

    const pendingPod = pod({ x: 80, y: 20, w: 200, h: 80, label: 'App Pod', sublabel: 'requests cpu=3', cat: 'workloads' });
    root.appendChild(pendingPod);

    const statusChip = valChip({ x: 80, y: 110, w: 320, h: 32, name: 'phase', value: 'Pending: Unschedulable' });
    root.appendChild(statusChip);

    const ca = box({ x: 880, y: 20, w: 280, h: 80, label: 'cluster-autoscaler', sublabel: 'simulates fit', cat: 'scaling' });
    root.appendChild(ca);

    const cloud = box({ x: 880, y: 120, w: 280, h: 60, label: 'cloud-provider API', sublabel: 'CreateInstance', cat: 'control' });
    root.appendChild(cloud);

    const node1 = box({ x: 60,  y: 220, w: 340, h: 280, label: 'node-1', sublabel: 'cpu 2/2 used',     cat: 'control' });
    const node2 = box({ x: 420, y: 220, w: 340, h: 280, label: 'node-2', sublabel: 'cpu 2/2 used',     cat: 'control' });
    const node3 = box({ x: 780, y: 220, w: 340, h: 280, label: 'node-3', sublabel: 'spawned by CA',    cat: 'control' });
    node3.style.opacity = '0';
    root.appendChild(node1); root.appendChild(node2); root.appendChild(node3);

    const p1a = pod({ x: 100, y: 290, w: 130, h: 70, label: 'pod', sublabel: 'cpu 1', cat: 'workloads' });
    const p1b = pod({ x: 240, y: 290, w: 130, h: 70, label: 'pod', sublabel: 'cpu 1', cat: 'workloads' });
    const p2a = pod({ x: 460, y: 290, w: 130, h: 70, label: 'pod', sublabel: 'cpu 1', cat: 'workloads' });
    const p2b = pod({ x: 600, y: 290, w: 130, h: 70, label: 'pod', sublabel: 'cpu 1', cat: 'workloads' });
    root.appendChild(p1a); root.appendChild(p1b); root.appendChild(p2a); root.appendChild(p2b);

    const placedPod = pod({ x: 880, y: 290, w: 200, h: 80, label: 'App Pod', sublabel: 'cpu 3', cat: 'workloads' });
    placedPod.style.opacity = '0';
    root.appendChild(placedPod);

    root.appendChild(arrow({ x1: 320, y1: 60, x2: 880, y2: 60, dim: true, dashed: true, color: 'scaling' }));
    root.appendChild(arrow({ x1: 1020, y1: 100, x2: 1020, y2: 120, dim: true, color: 'control' }));
    root.appendChild(pathArrow({ points: [[1020, 180], [1020, 200], [950, 200], [950, 220]], dim: true, color: 'control' }));

    this.host.appendChild(root);
    this.refs = { svg: root, pendingPod, statusChip, ca, cloud, node1, node2, node3, p1a, p1b, p2a, p2b, placedPod };
  }

  reset() { this.build(); }
}

function clearHL(s) {
  ['pendingPod','statusChip','ca','cloud','node1','node2','node3','placedPod'].forEach(k => s.refs[k].classList.remove('highlight'));
}

const STEPS = [
  {
    id: 'idle',
    duration: 1500,
    narration: 'Cluster has 2 nodes, both at full CPU. A new App Pod with cpu=3 cannot fit.',
    enter(s) {
      clearHL(s);
      setVal(s.refs.statusChip, 'Pending: Unschedulable');
      s.refs.node3.style.opacity = '0';
      s.refs.placedPod.style.opacity = '0';
      s.refs.pendingPod.classList.add('highlight');
    },
  },
  {
    id: 'pending',
    duration: 1700,
    narration: 'Scheduler tries every node, none has 3 free CPU. Pod stays Pending with reason Unschedulable. cluster-autoscaler watches for exactly this signal.',
    enter(s, ctx) {
      clearHL(s);
      setVal(s.refs.statusChip, 'Pending: Unschedulable');
      s.refs.pendingPod.classList.add('highlight');
      s.refs.statusChip.classList.add('highlight');
      if (!ctx.reduced) ctx.register(pulse(s.refs.statusChip, { duration: 800, iterations: 2 }));
    },
  },
  {
    id: 'simulate',
    duration: 1900,
    narration: 'CA simulates: would the Pod fit on a fresh node from the configured node group? Yes. CA picks a node-pool template and decides to scale up.',
    enter(s, ctx) {
      clearHL(s);
      setVal(s.refs.statusChip, 'Pending: Unschedulable');
      s.refs.ca.classList.add('highlight');
      if (!ctx.reduced) ctx.register(pulse(s.refs.ca, { duration: 800, iterations: 2 }));
    },
  },
  {
    id: 'scale-up',
    duration: 1900,
    narration: 'CA calls the cloud provider API (AWS ASG / GCP MIG / etc.) and asks for one more instance. Cloud begins creating a VM.',
    enter(s, ctx) {
      clearHL(s);
      s.refs.ca.classList.add('highlight');
      s.refs.cloud.classList.add('highlight');
      if (!ctx.reduced) ctx.register(pulse(s.refs.cloud, { duration: 800, iterations: 1 }));
    },
  },
  {
    id: 'join',
    duration: 2000,
    narration: 'New VM boots and runs kubelet bootstrap. kubelet registers with apiserver, joins the cluster. node-3 appears in `kubectl get nodes`.',
    enter(s, ctx) {
      clearHL(s);
      s.refs.node3.style.opacity = '1';
      s.refs.node3.classList.add('highlight');
      if (!ctx.reduced) {
        ctx.register(fadeIn(s.refs.node3, { duration: 800 }));
        ctx.register(pulse(s.refs.node3, { duration: 800, iterations: 1 }));
      }
    },
  },
  {
    id: 'schedule',
    duration: 1900,
    narration: 'Scheduler re-runs across all nodes. node-3 now has 4 free CPU. The Pending Pod is bound, kubelet starts containers, and the pod becomes Running.',
    enter(s, ctx) {
      clearHL(s);
      setVal(s.refs.statusChip, 'Running on node-3');
      s.refs.placedPod.style.opacity = '1';
      s.refs.node3.classList.add('highlight');
      s.refs.placedPod.classList.add('highlight');
      s.refs.statusChip.classList.add('highlight');
      if (!ctx.reduced) {
        ctx.register(fadeIn(s.refs.placedPod, { duration: 700 }));
        ctx.register(pulse(s.refs.placedPod, { duration: 700, iterations: 1 }));
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
