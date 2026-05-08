import { svg } from '../lib/svg.js';
import { arrowDefs, pod, box, node, chip, arrow, pathArrow, fadeIn, fadeOut, pulse } from '../lib/primitives.js';
import { Timeline } from '../lib/timeline.js';

class Scene {
  constructor(host) { this.host = host; this.refs = {}; this.build(); }

  build() {
    this.host.replaceChildren();
    this.refs = {};
    const root = svg({
      class: 'diagram',
      viewBox: '0 0 1100 560',
      preserveAspectRatio: 'xMidYMid meet',
      'aria-label': 'Node drain: cordon, evict, reschedule',
    });
    root.appendChild(arrowDefs());

    const kubectl = box({ x: 420, y: 20, w: 260, h: 50, label: 'kubectl drain node-1', cat: 'control' });
    root.appendChild(kubectl);

    const node1 = node({ x: 40, y: 110, w: 480, h: 420, label: 'node-1' });
    root.appendChild(node1);
    const node2 = node({ x: 560, y: 110, w: 480, h: 420, label: 'node-2' });
    root.appendChild(node2);

    const cordonBadge = chip({ x: 200, y: 132, w: 220, h: 28, label: 'SchedulingDisabled', cat: 'lifecycle' });
    cordonBadge.style.opacity = '0';
    root.appendChild(cordonBadge);

    const podA1 = pod({ x: 80,  y: 200, w: 130, h: 70, label: 'Pod A', sublabel: 'app', cat: 'workloads' });
    root.appendChild(podA1);
    const podB1 = pod({ x: 250, y: 200, w: 130, h: 70, label: 'Pod B', sublabel: 'app', cat: 'workloads' });
    root.appendChild(podB1);
    const ds1   = pod({ x: 80,  y: 320, w: 200, h: 70, label: 'fluentd', sublabel: 'DaemonSet', cat: 'workloads' });
    root.appendChild(ds1);

    const podA2 = pod({ x: 600, y: 200, w: 130, h: 70, label: 'Pod A', sublabel: 'app', cat: 'workloads' });
    podA2.style.opacity = '0';
    root.appendChild(podA2);
    const podB2 = pod({ x: 770, y: 200, w: 130, h: 70, label: 'Pod B', sublabel: 'app', cat: 'workloads' });
    podB2.style.opacity = '0';
    root.appendChild(podB2);
    const ds2   = pod({ x: 600, y: 320, w: 200, h: 70, label: 'fluentd', sublabel: 'DaemonSet', cat: 'workloads' });
    root.appendChild(ds2);

    root.appendChild(pathArrow({ points: [[550, 70], [550, 90], [280, 90], [280, 110]], dim: true, dashed: true, color: 'control' }));

    this.host.appendChild(root);
    this.refs = { svg: root, kubectl, node1, node2, cordonBadge, podA1, podB1, ds1, podA2, podB2, ds2 };
  }

  reset() { this.build(); }
}

function clearHL(s) {
  ['kubectl', 'podA1', 'podB1', 'ds1', 'podA2', 'podB2', 'ds2'].forEach(k => s.refs[k].classList.remove('highlight'));
}

const STEPS = [
  {
    id: 'idle',
    duration: 1400,
    narration: 'Two app Pods (A, B) and a DaemonSet pod run on node-1. node-2 has spare capacity and runs its own DaemonSet pod.',
    enter(s) {
      clearHL(s);
      s.refs.cordonBadge.style.opacity = '0';
      s.refs.podA1.style.opacity = '1';
      s.refs.podB1.style.opacity = '1';
      s.refs.podA2.style.opacity = '0';
      s.refs.podB2.style.opacity = '0';
      s.refs.kubectl.classList.add('highlight');
    },
  },
  {
    id: 'cordon',
    duration: 1700,
    narration: 'kubectl drain node-1 first cordons the node. SchedulingDisabled flag tells the scheduler to stop placing new Pods there.',
    enter(s, ctx) {
      clearHL(s);
      s.refs.kubectl.classList.add('highlight');
      s.refs.cordonBadge.style.opacity = '1';
      s.refs.podA1.style.opacity = '1';
      s.refs.podB1.style.opacity = '1';
      s.refs.podA2.style.opacity = '0';
      s.refs.podB2.style.opacity = '0';
      if (!ctx.reduced) ctx.register(fadeIn(s.refs.cordonBadge, { duration: 600 }));
    },
  },
  {
    id: 'evict-A',
    duration: 2000,
    narration: 'Eviction API call for Pod A. Controller deletes it, scheduler picks node-2 (the only Ready node left), and a fresh Pod A starts there.',
    enter(s, ctx) {
      clearHL(s);
      s.refs.kubectl.classList.add('highlight');
      s.refs.cordonBadge.style.opacity = '1';
      s.refs.podA1.style.opacity = '0';
      s.refs.podB1.style.opacity = '1';
      s.refs.podA2.style.opacity = '1';
      s.refs.podB2.style.opacity = '0';
      if (!ctx.reduced) {
        ctx.register(fadeOut(s.refs.podA1, { duration: 700 }));
        ctx.register(fadeIn(s.refs.podA2, { duration: 700 }));
        ctx.register(pulse(s.refs.podA2, { duration: 700, iterations: 1 }));
      }
    },
  },
  {
    id: 'evict-B',
    duration: 2000,
    narration: 'PodDisruptionBudget allows one disruption at a time. Once Pod A is Ready, eviction moves on to Pod B, and the same flow places it on node-2.',
    enter(s, ctx) {
      clearHL(s);
      s.refs.kubectl.classList.add('highlight');
      s.refs.cordonBadge.style.opacity = '1';
      s.refs.podA1.style.opacity = '0';
      s.refs.podB1.style.opacity = '0';
      s.refs.podA2.style.opacity = '1';
      s.refs.podB2.style.opacity = '1';
      if (!ctx.reduced) {
        ctx.register(fadeOut(s.refs.podB1, { duration: 700 }));
        ctx.register(fadeIn(s.refs.podB2, { duration: 700 }));
        ctx.register(pulse(s.refs.podB2, { duration: 700, iterations: 1 }));
      }
    },
  },
  {
    id: 'ds-skip',
    duration: 1700,
    narration: 'DaemonSet pods are intentionally skipped (--ignore-daemonsets). fluentd stays put on node-1 to keep the node observable during maintenance.',
    enter(s, ctx) {
      clearHL(s);
      s.refs.kubectl.classList.add('highlight');
      s.refs.cordonBadge.style.opacity = '1';
      s.refs.podA1.style.opacity = '0';
      s.refs.podB1.style.opacity = '0';
      s.refs.podA2.style.opacity = '1';
      s.refs.podB2.style.opacity = '1';
      s.refs.ds1.classList.add('highlight');
      if (!ctx.reduced) ctx.register(pulse(s.refs.ds1, { duration: 800, iterations: 2 }));
    },
  },
  {
    id: 'drained',
    duration: 1900,
    narration: 'node-1 carries only the DaemonSet pod. App workloads run on node-2. node-1 is now safe for reboot, kernel patch, or removal.',
    enter(s, ctx) {
      clearHL(s);
      s.refs.kubectl.classList.add('highlight');
      s.refs.cordonBadge.style.opacity = '1';
      s.refs.podA1.style.opacity = '0';
      s.refs.podB1.style.opacity = '0';
      s.refs.podA2.style.opacity = '1';
      s.refs.podB2.style.opacity = '1';
      s.refs.podA2.classList.add('highlight');
      s.refs.podB2.classList.add('highlight');
      if (!ctx.reduced) {
        ctx.register(pulse(s.refs.podA2, { duration: 700, iterations: 1 }));
        ctx.register(pulse(s.refs.podB2, { duration: 700, iterations: 1 }));
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
