import { svg, g, rect, text } from '../lib/svg.js';
import { arrowDefs, pod, box, arrow, pulse } from '../lib/primitives.js';
import { Timeline } from '../lib/timeline.js';

function probeRow({ x, y, w, h = 32, name, value, cat = 'lifecycle' }) {
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
      viewBox: '0 0 1100 540',
      preserveAspectRatio: 'xMidYMid meet',
      'aria-label': 'Startup, liveness, readiness probes',
    });
    root.appendChild(arrowDefs());

    const podBox = pod({ x: 80, y: 100, w: 420, h: 360, label: 'App Pod', sublabel: 'with three probes', cat: 'workloads' });
    root.appendChild(podBox);

    const container = box({ x: 200, y: 170, w: 180, h: 80, label: 'app container', sublabel: 'image:tag', cat: 'workloads' });
    root.appendChild(container);

    const startup   = probeRow({ x: 110, y: 280, w: 360, name: 'startupProbe',   value: 'pending' });
    const liveness  = probeRow({ x: 110, y: 322, w: 360, name: 'livenessProbe',  value: 'gated' });
    const readiness = probeRow({ x: 110, y: 364, w: 360, name: 'readinessProbe', value: 'gated' });
    root.appendChild(startup);
    root.appendChild(liveness);
    root.appendChild(readiness);

    const restartChip = probeRow({ x: 110, y: 414, w: 360, name: 'container restarts', value: '0', cat: 'control' });
    root.appendChild(restartChip);

    const svc = box({ x: 600, y: 180, w: 160, h: 60, label: 'svc-app', sublabel: 'ClusterIP', cat: 'network' });
    root.appendChild(svc);

    const endpoints = probeRow({ x: 600, y: 290, w: 380, name: 'Endpoints', value: 'empty', cat: 'network' });
    root.appendChild(endpoints);

    root.appendChild(arrow({ x1: 500, y1: 210, x2: 600, y2: 210, dim: true, color: 'network' }));
    root.appendChild(arrow({ x1: 680, y1: 240, x2: 680, y2: 290, dim: true, dashed: true, color: 'network' }));

    this.host.appendChild(root);
    this.refs = { svg: root, podBox, container, startup, liveness, readiness, restartChip, svc, endpoints };
  }

  reset() { this.build(); }
}

function clearHL(s) {
  ['podBox', 'container', 'startup', 'liveness', 'readiness', 'restartChip', 'svc', 'endpoints']
    .forEach(k => s.refs[k].classList.remove('highlight'));
}

const STEPS = [
  {
    id: 'starting',
    duration: 1500,
    narration: 'Container is starting. startupProbe runs every periodSeconds, while livenessProbe and readinessProbe are gated until startup succeeds.',
    enter(s) {
      clearHL(s);
      setVal(s.refs.startup,   'pending');
      setVal(s.refs.liveness,  'gated');
      setVal(s.refs.readiness, 'gated');
      setVal(s.refs.restartChip, '0');
      setVal(s.refs.endpoints, 'empty');
      s.refs.container.classList.add('highlight');
    },
  },
  {
    id: 'startup-fail',
    duration: 1800,
    narration: 'A few startupProbe attempts fail. Counter ticks toward failureThreshold, and kubelet keeps retrying instead of restarting the container.',
    enter(s, ctx) {
      clearHL(s);
      setVal(s.refs.startup,   'failing (3/30)');
      setVal(s.refs.liveness,  'gated');
      setVal(s.refs.readiness, 'gated');
      setVal(s.refs.restartChip, '0');
      setVal(s.refs.endpoints, 'empty');
      s.refs.startup.classList.add('highlight');
      if (!ctx.reduced) ctx.register(pulse(s.refs.startup, { duration: 700, iterations: 2 }));
    },
  },
  {
    id: 'startup-success',
    duration: 1700,
    narration: 'startupProbe finally passes. kubelet removes it from rotation, and livenessProbe and readinessProbe begin running on their own intervals.',
    enter(s) {
      clearHL(s);
      setVal(s.refs.startup,   'passed');
      setVal(s.refs.liveness,  'active');
      setVal(s.refs.readiness, 'probing');
      setVal(s.refs.restartChip, '0');
      setVal(s.refs.endpoints, 'empty');
      s.refs.startup.classList.add('highlight');
      s.refs.liveness.classList.add('highlight');
      s.refs.readiness.classList.add('highlight');
    },
  },
  {
    id: 'ready',
    duration: 1700,
    narration: 'readinessProbe passes successConsecutiveThreshold. The Pod IP joins the Service Endpoints object and starts receiving traffic.',
    enter(s, ctx) {
      clearHL(s);
      setVal(s.refs.startup,   'passed');
      setVal(s.refs.liveness,  'passing');
      setVal(s.refs.readiness, 'passing');
      setVal(s.refs.restartChip, '0');
      setVal(s.refs.endpoints, '10.244.1.5:8080');
      s.refs.readiness.classList.add('highlight');
      s.refs.svc.classList.add('highlight');
      s.refs.endpoints.classList.add('highlight');
      if (!ctx.reduced) ctx.register(pulse(s.refs.endpoints, { duration: 800, iterations: 1 }));
    },
  },
  {
    id: 'liveness-fail',
    duration: 2000,
    narration: 'App hangs. livenessProbe fails past failureThreshold, kubelet kills the container and increments restart count. readinessProbe drops too, so the IP leaves Endpoints immediately.',
    enter(s, ctx) {
      clearHL(s);
      setVal(s.refs.startup,   'reset');
      setVal(s.refs.liveness,  'failing (3/3)');
      setVal(s.refs.readiness, 'failing');
      setVal(s.refs.restartChip, '1');
      setVal(s.refs.endpoints, 'empty');
      s.refs.liveness.classList.add('highlight');
      s.refs.readiness.classList.add('highlight');
      s.refs.restartChip.classList.add('highlight');
      if (!ctx.reduced) {
        ctx.register(pulse(s.refs.liveness, { duration: 700, iterations: 2 }));
        ctx.register(pulse(s.refs.restartChip, { duration: 700, iterations: 1 }));
      }
    },
  },
  {
    id: 'recovery',
    duration: 1900,
    narration: 'New container starts. startupProbe gates again, then readiness passes, and the Pod IP rejoins Endpoints. Traffic resumes.',
    enter(s, ctx) {
      clearHL(s);
      setVal(s.refs.startup,   'passed');
      setVal(s.refs.liveness,  'passing');
      setVal(s.refs.readiness, 'passing');
      setVal(s.refs.restartChip, '1');
      setVal(s.refs.endpoints, '10.244.1.5:8080');
      s.refs.container.classList.add('highlight');
      s.refs.svc.classList.add('highlight');
      s.refs.endpoints.classList.add('highlight');
      if (!ctx.reduced) ctx.register(pulse(s.refs.container, { duration: 700, iterations: 1 }));
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
