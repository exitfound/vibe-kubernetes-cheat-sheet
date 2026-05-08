import { svg, g, rect, text } from '../lib/svg.js';
import { arrowDefs, pod, box, arrow, pathArrow, fadeOut, pulse } from '../lib/primitives.js';
import { Timeline } from '../lib/timeline.js';

function valChip({ x, y, w, h = 32, name, value, cat = 'lifecycle' }) {
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
      'aria-label': 'Graceful Pod shutdown',
    });
    root.appendChild(arrowDefs());

    const kubectl = box({ x: 60, y: 20, w: 260, h: 56, label: 'kubectl delete pod', sublabel: 'or controller delete', cat: 'control' });
    const api     = box({ x: 380, y: 20, w: 220, h: 56, label: 'kube-apiserver',     sublabel: 'sets deletionTimestamp', cat: 'control' });
    root.appendChild(kubectl); root.appendChild(api);

    const podBox = pod({ x: 60, y: 130, w: 540, h: 360, label: 'App Pod', sublabel: 'pod-1 (10.244.1.7)', cat: 'workloads' });
    root.appendChild(podBox);

    const container = box({ x: 100, y: 200, w: 300, h: 90, label: 'container', sublabel: 'PID 1: app server', cat: 'workloads' });
    root.appendChild(container);

    const preStopChip   = valChip({ x: 100, y: 310, w: 460, name: 'preStop hook',           value: 'idle' });
    const sigChip       = valChip({ x: 100, y: 350, w: 460, name: 'signal',                  value: '—' });
    const graceChip     = valChip({ x: 100, y: 390, w: 460, name: 'terminationGracePeriod', value: '30s remaining' });
    const phaseChip     = valChip({ x: 100, y: 430, w: 460, name: 'phase',                   value: 'Running' });
    root.appendChild(preStopChip); root.appendChild(sigChip); root.appendChild(graceChip); root.appendChild(phaseChip);

    const svc       = box({ x: 700, y: 130, w: 240, h: 60, label: 'Service app', sublabel: 'ClusterIP', cat: 'network' });
    const endpoints = valChip({ x: 660, y: 220, w: 380, name: 'Endpoints', value: '[pod-1: 10.244.1.7]' });
    root.appendChild(svc); root.appendChild(endpoints);

    root.appendChild(arrow({ x1: 320, y1: 48, x2: 380, y2: 48, dim: true, color: 'control' }));
    root.appendChild(arrow({ x1: 600, y1: 76, x2: 600, y2: 130, dim: true, dashed: true, color: 'control' }));
    root.appendChild(pathArrow({ points: [[600, 76], [600, 110], [820, 110], [820, 130]], dim: true, dashed: true, color: 'control' }));

    this.host.appendChild(root);
    this.refs = { svg: root, kubectl, api, podBox, container, preStopChip, sigChip, graceChip, phaseChip, svc, endpoints };
  }

  reset() { this.build(); }
}

function clearHL(s) {
  ['kubectl','api','podBox','container','preStopChip','sigChip','graceChip','phaseChip','svc','endpoints']
    .forEach(k => s.refs[k].classList.remove('highlight'));
}

const STEPS = [
  {
    id: 'idle',
    duration: 1500,
    narration: 'Pod is Running. Its IP is in the Service Endpoints. Traffic flows in normally.',
    enter(s) {
      clearHL(s);
      setVal(s.refs.preStopChip, 'idle');
      setVal(s.refs.sigChip, '—');
      setVal(s.refs.graceChip, '30s remaining');
      setVal(s.refs.phaseChip, 'Running');
      setVal(s.refs.endpoints, '[pod-1: 10.244.1.7]');
      s.refs.kubectl.classList.add('highlight');
    },
  },
  {
    id: 'delete',
    duration: 1900,
    narration: 'kubectl delete arrives. apiserver stamps deletionTimestamp. Two things happen in parallel: endpoint controller removes pod-1 from Endpoints, and kubelet starts the shutdown sequence.',
    enter(s, ctx) {
      clearHL(s);
      setVal(s.refs.phaseChip, 'Terminating');
      setVal(s.refs.endpoints, '[]  (removed)');
      s.refs.kubectl.classList.add('highlight');
      s.refs.api.classList.add('highlight');
      s.refs.endpoints.classList.add('highlight');
      s.refs.phaseChip.classList.add('highlight');
      if (!ctx.reduced) {
        ctx.register(pulse(s.refs.endpoints, { duration: 800, iterations: 1 }));
        ctx.register(pulse(s.refs.phaseChip, { duration: 800, iterations: 1 }));
      }
    },
  },
  {
    id: 'prestop',
    duration: 1900,
    narration: 'kubelet runs the preStop hook synchronously. Common pattern: sleep(5) so a load balancer has time to deregister the pod before the container starts dying.',
    enter(s, ctx) {
      clearHL(s);
      setVal(s.refs.preStopChip, 'sleep 5');
      setVal(s.refs.sigChip, '—');
      setVal(s.refs.phaseChip, 'Terminating');
      setVal(s.refs.endpoints, '[]');
      s.refs.preStopChip.classList.add('highlight');
      if (!ctx.reduced) ctx.register(pulse(s.refs.preStopChip, { duration: 800, iterations: 2 }));
    },
  },
  {
    id: 'sigterm',
    duration: 1700,
    narration: 'After preStop returns, kubelet sends SIGTERM to PID 1. A graceful app finishes in-flight requests, closes db pools, and exits.',
    enter(s, ctx) {
      clearHL(s);
      setVal(s.refs.preStopChip, 'completed');
      setVal(s.refs.sigChip, 'SIGTERM');
      setVal(s.refs.graceChip, '25s remaining');
      setVal(s.refs.phaseChip, 'Terminating');
      s.refs.container.classList.add('highlight');
      s.refs.sigChip.classList.add('highlight');
      if (!ctx.reduced) ctx.register(pulse(s.refs.sigChip, { duration: 800, iterations: 1 }));
    },
  },
  {
    id: 'countdown',
    duration: 1900,
    narration: 'terminationGracePeriodSeconds counts down. Most apps finish well before the timer expires, and kubelet observes the exit and starts cleanup.',
    enter(s, ctx) {
      clearHL(s);
      setVal(s.refs.preStopChip, 'completed');
      setVal(s.refs.sigChip, 'SIGTERM');
      setVal(s.refs.graceChip, '5s remaining');
      setVal(s.refs.phaseChip, 'Terminating');
      s.refs.graceChip.classList.add('highlight');
      if (!ctx.reduced) ctx.register(pulse(s.refs.graceChip, { duration: 600, iterations: 2 }));
    },
  },
  {
    id: 'sigkill',
    duration: 1900,
    narration: 'If the container is still alive when the grace timer hits 0, kubelet sends SIGKILL. apiserver removes the Pod object. Done.',
    enter(s, ctx) {
      clearHL(s);
      setVal(s.refs.preStopChip, 'completed');
      setVal(s.refs.sigChip, 'SIGKILL');
      setVal(s.refs.graceChip, '0s · expired');
      setVal(s.refs.phaseChip, 'Terminated');
      s.refs.sigChip.classList.add('highlight');
      s.refs.phaseChip.classList.add('highlight');
      if (!ctx.reduced) {
        ctx.register(pulse(s.refs.sigChip, { duration: 800, iterations: 2 }));
        ctx.register(fadeOut(s.refs.container, { duration: 800 }));
      }
      s.refs.container.style.opacity = '0.4';
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
