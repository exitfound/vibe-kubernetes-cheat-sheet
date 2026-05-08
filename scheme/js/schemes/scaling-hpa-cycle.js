import { svg, g, rect, text } from '../lib/svg.js';
import { arrowDefs, pod, box, arrow, pathArrow, fadeIn, pulse } from '../lib/primitives.js';
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
      viewBox: '0 0 1100 500',
      preserveAspectRatio: 'xMidYMid meet',
      'aria-label': 'HPA scale-up cycle',
    });
    root.appendChild(arrowDefs());

    const dep     = box({ x: 320, y: 40, w: 220, h: 60, label: 'Deployment', sublabel: 'app', cat: 'control' });
    const depChip = valChip({ x: 320, y: 110, w: 220, h: 30, name: 'spec.replicas', value: '2', cat: 'control' });
    const hpa     = box({ x: 580, y: 40, w: 240, h: 60, label: 'HPA', sublabel: 'targetCPU 60%', cat: 'scaling' });
    const hpaChip = valChip({ x: 580, y: 110, w: 240, h: 30, name: 'desired', value: '2', cat: 'scaling' });
    root.appendChild(dep); root.appendChild(depChip);
    root.appendChild(hpa); root.appendChild(hpaChip);

    const rs = box({ x: 320, y: 180, w: 220, h: 60, label: 'ReplicaSet', sublabel: 'scale = 2', cat: 'workloads' });
    const ms = box({ x: 620, y: 180, w: 200, h: 60, label: 'metrics-server', sublabel: 'cAdvisor read', cat: 'control' });
    root.appendChild(rs); root.appendChild(ms);

    const cpuGauge = valChip({ x: 80, y: 410, w: 480, h: 38, name: 'avg CPU across replicas', value: '35%', cat: 'scaling' });
    root.appendChild(cpuGauge);

    const p1 = pod({ x: 80,  y: 290, w: 110, h: 80, label: 'Pod', sublabel: 'app', cat: 'workloads' });
    const p2 = pod({ x: 210, y: 290, w: 110, h: 80, label: 'Pod', sublabel: 'app', cat: 'workloads' });
    const p3 = pod({ x: 340, y: 290, w: 110, h: 80, label: 'Pod', sublabel: 'app', cat: 'workloads' });
    const p4 = pod({ x: 470, y: 290, w: 110, h: 80, label: 'Pod', sublabel: 'app', cat: 'workloads' });
    p3.style.opacity = '0';
    p4.style.opacity = '0';
    root.appendChild(p1); root.appendChild(p2); root.appendChild(p3); root.appendChild(p4);

    root.appendChild(pathArrow({ points: [[580, 330], [600, 330], [600, 210], [620, 210]], dim: true, dashed: true, color: 'storage' }));
    root.appendChild(arrow({ x1: 720, y1: 180, x2: 720, y2: 100, dim: true, color: 'control' }));
    root.appendChild(arrow({ x1: 580, y1: 70, x2: 540, y2: 70, dim: true, color: 'control' }));
    root.appendChild(arrow({ x1: 430, y1: 100, x2: 430, y2: 180, dim: true, dashed: true, color: 'control' }));
    root.appendChild(arrow({ x1: 430, y1: 240, x2: 430, y2: 290, dim: true, dashed: true, color: 'workloads' }));

    this.host.appendChild(root);
    this.refs = { svg: root, dep, depChip, hpa, hpaChip, rs, ms, cpuGauge, p1, p2, p3, p4 };
  }

  reset() { this.build(); }
}

function clearHL(s) {
  ['dep','depChip','hpa','hpaChip','rs','ms','cpuGauge','p1','p2','p3','p4']
    .forEach(k => s.refs[k].classList.remove('highlight'));
}

const STEPS = [
  {
    id: 'idle',
    duration: 1400,
    narration: 'Two replicas serve modest traffic. Average CPU sits at 35%, well under the HPA target of 60%. desired equals current, no action.',
    enter(s) {
      clearHL(s);
      setVal(s.refs.depChip, '2');
      setVal(s.refs.hpaChip, '2');
      setVal(s.refs.cpuGauge, '35%');
      s.refs.p3.style.opacity = '0';
      s.refs.p4.style.opacity = '0';
      s.refs.cpuGauge.classList.add('highlight');
    },
  },
  {
    id: 'spike',
    duration: 1700,
    narration: 'Traffic spike. kubelet cAdvisor reports per-Pod CPU, metrics-server aggregates and exposes /apis/metrics.k8s.io. Average climbs to 85%.',
    enter(s, ctx) {
      clearHL(s);
      setVal(s.refs.cpuGauge, '85%');
      s.refs.cpuGauge.classList.add('highlight');
      s.refs.ms.classList.add('highlight');
      if (!ctx.reduced) ctx.register(pulse(s.refs.cpuGauge, { duration: 800, iterations: 2 }));
    },
  },
  {
    id: 'compute',
    duration: 1700,
    narration: 'HPA controller reads metrics every syncPeriod. desired = ceil(currentReplicas * currentCPU / targetCPU) = ceil(2 * 85 / 60) = 3, but stabilization window allows up to 4 for headroom.',
    enter(s, ctx) {
      clearHL(s);
      setVal(s.refs.cpuGauge, '85%');
      setVal(s.refs.hpaChip, '4');
      s.refs.hpa.classList.add('highlight');
      s.refs.hpaChip.classList.add('highlight');
      if (!ctx.reduced) ctx.register(pulse(s.refs.hpaChip, { duration: 800, iterations: 1 }));
    },
  },
  {
    id: 'patch',
    duration: 1700,
    narration: 'HPA PATCHes the scale subresource of the Deployment, lifting spec.replicas from 2 to 4.',
    enter(s, ctx) {
      clearHL(s);
      setVal(s.refs.cpuGauge, '85%');
      setVal(s.refs.hpaChip, '4');
      setVal(s.refs.depChip, '4');
      s.refs.dep.classList.add('highlight');
      s.refs.depChip.classList.add('highlight');
      if (!ctx.reduced) ctx.register(pulse(s.refs.depChip, { duration: 800, iterations: 1 }));
    },
  },
  {
    id: 'scale-up',
    duration: 2000,
    narration: 'Deployment controller updates the ReplicaSet. ReplicaSet creates two new Pods, scheduler binds, kubelet starts containers.',
    enter(s, ctx) {
      clearHL(s);
      setVal(s.refs.depChip, '4');
      setVal(s.refs.hpaChip, '4');
      setVal(s.refs.cpuGauge, '85%');
      s.refs.rs.classList.add('highlight');
      s.refs.p3.style.opacity = '1';
      s.refs.p4.style.opacity = '1';
      if (!ctx.reduced) {
        ctx.register(fadeIn(s.refs.p3, { duration: 800 }));
        ctx.register(fadeIn(s.refs.p4, { duration: 800 }));
        ctx.register(pulse(s.refs.rs, { duration: 800, iterations: 1 }));
      }
    },
  },
  {
    id: 'settled',
    duration: 1900,
    narration: 'Four Pods now share the load. Average CPU drops to 50%, below target. HPA holds desired at 4 until the stabilization window expires before any scale-down.',
    enter(s, ctx) {
      clearHL(s);
      setVal(s.refs.depChip, '4');
      setVal(s.refs.hpaChip, '4');
      setVal(s.refs.cpuGauge, '50%');
      s.refs.p3.style.opacity = '1';
      s.refs.p4.style.opacity = '1';
      s.refs.cpuGauge.classList.add('highlight');
      s.refs.hpa.classList.add('highlight');
      if (!ctx.reduced) ctx.register(pulse(s.refs.cpuGauge, { duration: 800, iterations: 1 }));
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
