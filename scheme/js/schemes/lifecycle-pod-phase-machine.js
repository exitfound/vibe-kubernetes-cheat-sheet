import { svg, g, rect, text } from '../lib/svg.js';
import { arrowDefs, stateNode, setActiveState, arrow, pathArrow, pulse } from '../lib/primitives.js';
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
      viewBox: '0 0 1100 540',
      preserveAspectRatio: 'xMidYMid meet',
      'aria-label': 'Pod phase state machine',
    });
    root.appendChild(arrowDefs());

    const fsm = g({ id: 'fsm' });
    fsm.appendChild(stateNode({ id: 'pending',   label: 'Pending',           x: 80,  y: 120, w: 200, h: 80, cat: 'lifecycle' }));
    fsm.appendChild(stateNode({ id: 'running',   label: 'Running',           x: 420, y: 120, w: 200, h: 80, cat: 'lifecycle' }));
    fsm.appendChild(stateNode({ id: 'succeeded', label: 'Succeeded',         x: 760, y: 60,  w: 220, h: 70, cat: 'lifecycle' }));
    fsm.appendChild(stateNode({ id: 'failed',    label: 'Failed',            x: 760, y: 170, w: 220, h: 70, cat: 'lifecycle' }));
    fsm.appendChild(stateNode({ id: 'crashloop', label: 'CrashLoopBackOff',  x: 400, y: 300, w: 260, h: 80, cat: 'lifecycle' }));
    root.appendChild(fsm);

    root.appendChild(arrow({ x1: 280, y1: 160, x2: 420, y2: 160, dim: true, color: 'lifecycle' }));
    root.appendChild(pathArrow({ points: [[620, 140], [690, 140], [690, 95], [760, 95]], dim: true, color: 'lifecycle' }));
    root.appendChild(pathArrow({ points: [[620, 180], [690, 180], [690, 205], [760, 205]], dim: true, color: 'lifecycle' }));
    root.appendChild(arrow({ x1: 520, y1: 200, x2: 520, y2: 300, dim: true, dashed: true, color: 'lifecycle' }));
    root.appendChild(arrow({ x1: 470, y1: 300, x2: 470, y2: 200, dim: true, dashed: true, color: 'lifecycle' }));

    const phaseChip   = valChip({ x: 80, y: 410, w: 460, h: 36, name: 'pod.status.phase', value: 'Pending' });
    const reasonChip  = valChip({ x: 580, y: 410, w: 400, h: 36, name: 'reason',          value: '—' });
    const restartChip = valChip({ x: 80, y: 460, w: 460, h: 36, name: 'restartCount',     value: '0' });
    const noteChip    = valChip({ x: 580, y: 460, w: 400, h: 36, name: 'restartPolicy',   value: 'Always' });
    root.appendChild(phaseChip); root.appendChild(reasonChip); root.appendChild(restartChip); root.appendChild(noteChip);

    this.host.appendChild(root);
    this.refs = { svg: root, fsm, phaseChip, reasonChip, restartChip, noteChip };
  }

  reset() { this.build(); }
}

const STEPS = [
  {
    id: 'idle',
    duration: 1500,
    narration: 'Pod object lands in etcd. Phase is Pending. No node has been picked yet, no images pulled.',
    enter(s) {
      setActiveState(s.refs.fsm, 'pending');
      setVal(s.refs.phaseChip, 'Pending');
      setVal(s.refs.reasonChip, 'unscheduled');
      setVal(s.refs.restartChip, '0');
      setVal(s.refs.noteChip, 'Always');
    },
  },
  {
    id: 'creating',
    duration: 1700,
    narration: 'Scheduler binds the Pod to a node. kubelet starts pulling images. Phase stays Pending, and reason becomes ContainerCreating (or ImagePullBackOff if the registry is unreachable).',
    enter(s, ctx) {
      setActiveState(s.refs.fsm, 'pending');
      setVal(s.refs.phaseChip, 'Pending');
      setVal(s.refs.reasonChip, 'ContainerCreating');
      setVal(s.refs.restartChip, '0');
      if (!ctx.reduced) {
        const node = s.refs.fsm.querySelector('[data-state-id="pending"]');
        ctx.register(pulse(node, { duration: 800, iterations: 1 }));
      }
    },
  },
  {
    id: 'running',
    duration: 1700,
    narration: 'All containers have started. Phase moves to Running. The Pod is now visible to Service Endpoints once readinessProbe succeeds.',
    enter(s, ctx) {
      setActiveState(s.refs.fsm, 'running');
      setVal(s.refs.phaseChip, 'Running');
      setVal(s.refs.reasonChip, 'started');
      setVal(s.refs.restartChip, '0');
      if (!ctx.reduced) {
        const node = s.refs.fsm.querySelector('[data-state-id="running"]');
        ctx.register(pulse(node, { duration: 800, iterations: 1 }));
      }
    },
  },
  {
    id: 'crash',
    duration: 2000,
    narration: 'Container exits non-zero. With restartPolicy=Always, kubelet restarts it. After repeated failures, Phase remains Running but waiting reason flips to CrashLoopBackOff with exponential backoff.',
    enter(s, ctx) {
      setActiveState(s.refs.fsm, 'crashloop');
      setVal(s.refs.phaseChip, 'Running');
      setVal(s.refs.reasonChip, 'CrashLoopBackOff (waiting)');
      setVal(s.refs.restartChip, '4');
      if (!ctx.reduced) {
        const node = s.refs.fsm.querySelector('[data-state-id="crashloop"]');
        ctx.register(pulse(node, { duration: 800, iterations: 2 }));
      }
    },
  },
  {
    id: 'backoff-retry',
    duration: 1900,
    narration: 'Backoff timer elapses, kubelet retries. Container starts cleanly this time, reason clears, Pod remains Running.',
    enter(s, ctx) {
      setActiveState(s.refs.fsm, 'running');
      setVal(s.refs.phaseChip, 'Running');
      setVal(s.refs.reasonChip, 'started (after retry)');
      setVal(s.refs.restartChip, '5');
      if (!ctx.reduced) {
        const node = s.refs.fsm.querySelector('[data-state-id="running"]');
        ctx.register(pulse(node, { duration: 800, iterations: 1 }));
      }
    },
  },
  {
    id: 'terminate',
    duration: 1900,
    narration: 'Eventually all containers exit 0 (e.g., Job): phase becomes Succeeded. If the container exits non-zero with restartPolicy=Never, phase becomes Failed.',
    enter(s, ctx) {
      setActiveState(s.refs.fsm, 'succeeded');
      setVal(s.refs.phaseChip, 'Succeeded');
      setVal(s.refs.reasonChip, 'all containers exited 0');
      setVal(s.refs.restartChip, '5');
      setVal(s.refs.noteChip, 'OnFailure / Never paths end at Failed');
      if (!ctx.reduced) {
        const node = s.refs.fsm.querySelector('[data-state-id="succeeded"]');
        ctx.register(pulse(node, { duration: 800, iterations: 2 }));
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
