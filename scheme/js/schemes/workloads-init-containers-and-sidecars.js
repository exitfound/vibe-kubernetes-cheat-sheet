import { svg, g, rect, text } from '../lib/svg.js';
import { arrowDefs, pod, box, arrow, fadeIn, pulse } from '../lib/primitives.js';
import { Timeline } from '../lib/timeline.js';

function valChip({ x, y, w, h = 30, name, value, cat = 'workloads' }) {
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
      viewBox: '0 0 1100 520',
      preserveAspectRatio: 'xMidYMid meet',
      'aria-label': 'Init containers and native sidecars order',
    });
    root.appendChild(arrowDefs());

    const podBox = pod({ x: 60, y: 40, w: 980, h: 440, label: 'App Pod', sublabel: '2 init + sidecar + main', cat: 'workloads' });
    root.appendChild(podBox);

    const ic1 = box({ x: 100, y: 160, w: 200, h: 120, label: 'initC1', sublabel: 'wait-for-db',     cat: 'control' });
    const ic2 = box({ x: 330, y: 160, w: 200, h: 120, label: 'initC2', sublabel: 'migrate-schema',  cat: 'control' });
    const sc  = box({ x: 560, y: 160, w: 200, h: 120, label: 'sidecar', sublabel: 'restartPolicy: Always (1.29+)', cat: 'workloads' });
    const mc  = box({ x: 790, y: 160, w: 220, h: 120, label: 'main', sublabel: 'app server',        cat: 'workloads' });
    root.appendChild(ic1); root.appendChild(ic2); root.appendChild(sc); root.appendChild(mc);

    const ic1Status = valChip({ x: 100, y: 300, w: 200, name: 'initC1',  value: 'pending' });
    const ic2Status = valChip({ x: 330, y: 300, w: 200, name: 'initC2',  value: 'gated' });
    const scStatus  = valChip({ x: 560, y: 300, w: 200, name: 'sidecar', value: 'gated' });
    const mcStatus  = valChip({ x: 790, y: 300, w: 220, name: 'main',    value: 'gated' });
    root.appendChild(ic1Status); root.appendChild(ic2Status); root.appendChild(scStatus); root.appendChild(mcStatus);

    const sequence = valChip({ x: 100, y: 360, w: 910, h: 36, name: 'pod phase', value: 'PodInitializing' });
    root.appendChild(sequence);

    root.appendChild(arrow({ x1: 300, y1: 220, x2: 330, y2: 220, dim: true, color: 'control' }));
    root.appendChild(arrow({ x1: 530, y1: 220, x2: 560, y2: 220, dim: true, color: 'control' }));
    root.appendChild(arrow({ x1: 760, y1: 220, x2: 790, y2: 220, dim: true, dashed: true, color: 'workloads' }));

    this.host.appendChild(root);
    this.refs = { svg: root, podBox, ic1, ic2, sc, mc, ic1Status, ic2Status, scStatus, mcStatus, sequence };
  }

  reset() { this.build(); }
}

function clearHL(s) {
  ['podBox','ic1','ic2','sc','mc','ic1Status','ic2Status','scStatus','mcStatus','sequence']
    .forEach(k => s.refs[k].classList.remove('highlight'));
}

const STEPS = [
  {
    id: 'idle',
    duration: 1500,
    narration: 'Pod spec lists 2 init containers, a native sidecar (initContainer with restartPolicy=Always), and the main container. Order matters.',
    enter(s) {
      clearHL(s);
      setVal(s.refs.ic1Status, 'pending');
      setVal(s.refs.ic2Status, 'gated');
      setVal(s.refs.scStatus, 'gated');
      setVal(s.refs.mcStatus, 'gated');
      setVal(s.refs.sequence, 'PodInitializing');
      s.refs.ic1.classList.add('highlight');
    },
  },
  {
    id: 'init1',
    duration: 1700,
    narration: 'initC1 runs first. It must exit successfully before anything else starts. Failure here keeps the Pod stuck in Init:0/N with a kubelet restart-backoff.',
    enter(s, ctx) {
      clearHL(s);
      setVal(s.refs.ic1Status, 'Running');
      setVal(s.refs.ic2Status, 'gated');
      setVal(s.refs.scStatus, 'gated');
      setVal(s.refs.mcStatus, 'gated');
      setVal(s.refs.sequence, 'PodInitializing');
      s.refs.ic1.classList.add('highlight');
      if (!ctx.reduced) ctx.register(pulse(s.refs.ic1, { duration: 800, iterations: 1 }));
    },
  },
  {
    id: 'init2',
    duration: 1700,
    narration: 'initC1 exited 0. initC2 starts. Same rule: it must complete before the next phase begins.',
    enter(s, ctx) {
      clearHL(s);
      setVal(s.refs.ic1Status, 'Completed');
      setVal(s.refs.ic2Status, 'Running');
      setVal(s.refs.scStatus, 'gated');
      setVal(s.refs.mcStatus, 'gated');
      setVal(s.refs.sequence, 'PodInitializing');
      s.refs.ic2.classList.add('highlight');
      if (!ctx.reduced) ctx.register(pulse(s.refs.ic2, { duration: 800, iterations: 1 }));
    },
  },
  {
    id: 'sidecar-start',
    duration: 1900,
    narration: 'The sidecar (1.29+ native syntax) starts next. As soon as it reports Started, the main container is allowed to start in parallel. The sidecar will keep running and restarting alongside main.',
    enter(s, ctx) {
      clearHL(s);
      setVal(s.refs.ic1Status, 'Completed');
      setVal(s.refs.ic2Status, 'Completed');
      setVal(s.refs.scStatus, 'Started');
      setVal(s.refs.mcStatus, 'Starting');
      setVal(s.refs.sequence, 'PodInitializing → Running');
      s.refs.sc.classList.add('highlight');
      s.refs.mc.classList.add('highlight');
      if (!ctx.reduced) {
        ctx.register(fadeIn(s.refs.mc, { duration: 600 }));
        ctx.register(pulse(s.refs.sc, { duration: 800, iterations: 1 }));
      }
    },
  },
  {
    id: 'running',
    duration: 1700,
    narration: 'Pod is Running. sidecar serves cross-cutting concerns (proxy / log shipping / token rotation) for the lifetime of main. On Pod termination, the order reverses: main stops, then sidecar.',
    enter(s, ctx) {
      clearHL(s);
      setVal(s.refs.ic1Status, 'Completed');
      setVal(s.refs.ic2Status, 'Completed');
      setVal(s.refs.scStatus, 'Running');
      setVal(s.refs.mcStatus, 'Running');
      setVal(s.refs.sequence, 'Running');
      s.refs.podBox.classList.add('highlight');
      if (!ctx.reduced) ctx.register(pulse(s.refs.podBox, { duration: 800, iterations: 1 }));
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
