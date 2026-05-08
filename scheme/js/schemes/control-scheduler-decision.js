import { svg, g, rect, text } from '../lib/svg.js';
import { arrowDefs, pod, box, arrow, pathArrow, fadeIn, pulse } from '../lib/primitives.js';
import { Timeline } from '../lib/timeline.js';

function statusChip({ x, y, w, h = 32, name, value, cat = 'control' }) {
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
      'aria-label': 'Scheduler filter and score',
    });
    root.appendChild(arrowDefs());

    const pendingPod = pod({ x: 510, y: 20, w: 180, h: 80, label: 'App Pod', sublabel: 'nodeName: ?', cat: 'control' });
    root.appendChild(pendingPod);

    const sched = box({ x: 510, y: 130, w: 180, h: 56, label: 'kube-scheduler', sublabel: 'filter / score', cat: 'control' });
    root.appendChild(sched);

    const n1 = box({ x: 20,  y: 240, w: 260, h: 110, label: 'node-1', sublabel: 'taint dedicated=db:NoSchedule', cat: 'control' });
    const n2 = box({ x: 300, y: 240, w: 260, h: 110, label: 'node-2', sublabel: 'mem free 200Mi (req 800Mi)',   cat: 'control' });
    const n3 = box({ x: 580, y: 240, w: 260, h: 110, label: 'node-3', sublabel: 'cpu 40% / mem 60%',             cat: 'control' });
    const n4 = box({ x: 860, y: 240, w: 260, h: 110, label: 'node-4', sublabel: 'cpu 25% / mem 35%',             cat: 'control' });
    root.appendChild(n1); root.appendChild(n2); root.appendChild(n3); root.appendChild(n4);

    const s1 = statusChip({ x: 20,  y: 372, w: 260, name: 'verdict',       value: 'pending' });
    const s2 = statusChip({ x: 300, y: 372, w: 260, name: 'verdict',       value: 'pending' });
    const s3 = statusChip({ x: 580, y: 372, w: 260, name: 'score',         value: 'pending' });
    const s4 = statusChip({ x: 860, y: 372, w: 260, name: 'score',         value: 'pending' });
    root.appendChild(s1); root.appendChild(s2); root.appendChild(s3); root.appendChild(s4);

    const placedPod = pod({ x: 905, y: 270, w: 170, h: 60, label: 'App Pod', sublabel: 'on node-4', cat: 'workloads' });
    placedPod.style.opacity = '0';
    root.appendChild(placedPod);

    root.appendChild(arrow({ x1: 600, y1: 100, x2: 600, y2: 130, dim: true, color: 'control' }));
    root.appendChild(pathArrow({ points: [[600, 186], [600, 220], [150, 220], [150, 240]], dim: true, dashed: true, color: 'control' }));
    root.appendChild(pathArrow({ points: [[600, 186], [600, 220], [430, 220], [430, 240]], dim: true, dashed: true, color: 'control' }));
    root.appendChild(pathArrow({ points: [[600, 186], [600, 220], [710, 220], [710, 240]], dim: true, dashed: true, color: 'control' }));
    root.appendChild(pathArrow({ points: [[600, 186], [600, 220], [990, 220], [990, 240]], dim: true, dashed: true, color: 'control' }));

    this.host.appendChild(root);
    this.refs = { svg: root, pendingPod, sched, n1, n2, n3, n4, s1, s2, s3, s4, placedPod };
  }

  reset() { this.build(); }
}

function clearHL(s) {
  ['pendingPod','sched','n1','n2','n3','n4','s1','s2','s3','s4','placedPod']
    .forEach(k => s.refs[k].classList.remove('highlight'));
}

const STEPS = [
  {
    id: 'idle',
    duration: 1500,
    narration: 'Newly created Pod has no nodeName. Scheduler watches the apiserver for unscheduled Pods and grabs this one off the queue.',
    enter(s) {
      clearHL(s);
      setVal(s.refs.s1, 'pending');
      setVal(s.refs.s2, 'pending');
      setVal(s.refs.s3, 'pending');
      setVal(s.refs.s4, 'pending');
      s.refs.placedPod.style.opacity = '0';
      s.refs.n1.style.opacity = '1';
      s.refs.n2.style.opacity = '1';
      s.refs.pendingPod.classList.add('highlight');
    },
  },
  {
    id: 'filter',
    duration: 2100,
    narration: 'Filter phase: predicate plugins drop nodes that cannot fit. node-1 has a NoSchedule taint without matching toleration. node-2 lacks memory.',
    enter(s, ctx) {
      clearHL(s);
      s.refs.sched.classList.add('highlight');
      setVal(s.refs.s1, 'FILTERED · taint');
      setVal(s.refs.s2, 'FILTERED · resources');
      setVal(s.refs.s3, 'pending');
      setVal(s.refs.s4, 'pending');
      s.refs.s1.classList.add('highlight');
      s.refs.s2.classList.add('highlight');
      s.refs.n1.style.opacity = '0.35';
      s.refs.n2.style.opacity = '0.35';
      if (!ctx.reduced) {
        ctx.register(s.refs.n1.animate([{ opacity: 1 }, { opacity: 0.35 }], { duration: 600, fill: 'forwards', easing: 'ease-in' }));
        ctx.register(s.refs.n2.animate([{ opacity: 1 }, { opacity: 0.35 }], { duration: 600, fill: 'forwards', easing: 'ease-in' }));
      }
    },
  },
  {
    id: 'score-3',
    duration: 1700,
    narration: 'Score phase: surviving nodes get scored by plugins (LeastResourceFit, NodeAffinity, PodTopologySpread). node-3 scores 78.',
    enter(s, ctx) {
      clearHL(s);
      s.refs.sched.classList.add('highlight');
      setVal(s.refs.s1, 'FILTERED · taint');
      setVal(s.refs.s2, 'FILTERED · resources');
      setVal(s.refs.s3, '78');
      setVal(s.refs.s4, 'pending');
      s.refs.n1.style.opacity = '0.35';
      s.refs.n2.style.opacity = '0.35';
      s.refs.n3.classList.add('highlight');
      s.refs.s3.classList.add('highlight');
      if (!ctx.reduced) ctx.register(pulse(s.refs.n3, { duration: 700, iterations: 1 }));
    },
  },
  {
    id: 'score-4',
    duration: 1700,
    narration: 'node-4 has more headroom, so it scores 92. Highest-scoring node wins (ties are broken by sample at random).',
    enter(s, ctx) {
      clearHL(s);
      s.refs.sched.classList.add('highlight');
      setVal(s.refs.s4, '92');
      setVal(s.refs.s3, '78');
      s.refs.n1.style.opacity = '0.35';
      s.refs.n2.style.opacity = '0.35';
      s.refs.n4.classList.add('highlight');
      s.refs.s4.classList.add('highlight');
      if (!ctx.reduced) ctx.register(pulse(s.refs.n4, { duration: 700, iterations: 2 }));
    },
  },
  {
    id: 'bind',
    duration: 1700,
    narration: 'Scheduler issues a Binding via the pods/binding subresource. apiserver writes nodeName=node-4 onto the Pod object in etcd.',
    enter(s, ctx) {
      clearHL(s);
      s.refs.pendingPod.classList.add('highlight');
      s.refs.n4.classList.add('highlight');
      s.refs.n1.style.opacity = '0.35';
      s.refs.n2.style.opacity = '0.35';
      const subL = s.refs.pendingPod.querySelector('.scheme-pod-sublabel');
      if (subL) subL.textContent = 'nodeName: node-4';
      if (!ctx.reduced) ctx.register(pulse(s.refs.pendingPod, { duration: 700, iterations: 1 }));
    },
  },
  {
    id: 'placed',
    duration: 1900,
    narration: 'kubelet on node-4 watches /pods?nodeName=node-4. It sees the new Pod, pulls images, starts containers. The cluster reaches steady state.',
    enter(s, ctx) {
      clearHL(s);
      s.refs.n4.classList.add('highlight');
      s.refs.placedPod.classList.add('highlight');
      s.refs.placedPod.style.opacity = '1';
      s.refs.n1.style.opacity = '0.35';
      s.refs.n2.style.opacity = '0.35';
      const subL = s.refs.pendingPod.querySelector('.scheme-pod-sublabel');
      if (subL) subL.textContent = 'nodeName: node-4';
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
