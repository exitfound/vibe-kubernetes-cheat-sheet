import { svg, g, text } from '../lib/svg.js';
import { arrowDefs, pod, box, chip, fadeIn, fadeOut, pulse } from '../lib/primitives.js';
import { Timeline } from '../lib/timeline.js';

class Scene {
  constructor(host) { this.host = host; this.refs = {}; this.build(); }

  build() {
    this.host.replaceChildren();
    this.refs = {};
    const root = svg({
      class: 'diagram',
      viewBox: '0 0 1000 500',
      preserveAspectRatio: 'xMidYMid meet',
      'aria-label': 'Deployment rolling update',
    });
    root.appendChild(arrowDefs());

    const dep = chip({ x: 300, y: 30, w: 400, h: 38, label: 'Deployment web · maxSurge=1, maxUnavailable=1', cat: 'workloads' });
    root.appendChild(dep);

    root.appendChild(text({ class: 'scheme-label dim', x: 200, y: 110, 'text-anchor': 'middle' }, ['ReplicaSet web-v1 (1.0)']));
    root.appendChild(text({ class: 'scheme-label dim', x: 800, y: 110, 'text-anchor': 'middle' }, ['ReplicaSet web-v2 (2.0)']));

    const oldX = [70, 190, 310];
    const newX = [580, 700, 820];
    const podY = 220;
    const podW = 110;
    const podH = 80;

    const v1 = oldX.map((x, i) => {
      const p = pod({ x, y: podY, w: podW, h: podH, label: 'web', sublabel: 'v1.0', containers: 1, cat: 'workloads' });
      root.appendChild(p);
      return p;
    });
    const v2 = newX.map((x, i) => {
      const p = pod({ x, y: podY, w: podW, h: podH, label: 'web', sublabel: 'v2.0', containers: 1, cat: 'workloads' });
      p.style.opacity = '0';
      root.appendChild(p);
      return p;
    });

    // Counters
    const v1Count = text({ class: 'scheme-label code dim', x: 200, y: 360, 'text-anchor': 'middle' }, ['Ready: 3 / 3']);
    const v2Count = text({ class: 'scheme-label code dim', x: 800, y: 360, 'text-anchor': 'middle' }, ['Ready: 0 / 3']);
    root.appendChild(v1Count);
    root.appendChild(v2Count);

    this.host.appendChild(root);
    this.refs = { svg: root, dep, v1, v2, v1Count, v2Count };
  }

  reset() { this.build(); }
}

function clearHighlights(s) {
  [...s.refs.v1, ...s.refs.v2].forEach(p => p.classList.remove('highlight'));
}

function applyState(s, ctx, { v1Live, v2Live, highlightV2 = -1, highlightV1 = -1 }) {
  s.refs.v1.forEach((p, i) => {
    const visible = i < v1Live;
    if (ctx.reduced) {
      p.style.opacity = visible ? '1' : '0';
    } else {
      const cur = p.style.opacity === '0' ? 0 : 1;
      const target = visible ? 1 : 0;
      if (cur !== target) {
        if (target === 1) {
          p.style.opacity = '1';
          ctx.register(fadeIn(p, { duration: 500 }));
        } else {
          ctx.register(fadeOut(p, { duration: 500 }));
          p.style.opacity = '0';
        }
      } else {
        p.style.opacity = visible ? '1' : '0';
      }
    }
  });
  s.refs.v2.forEach((p, i) => {
    const visible = i < v2Live;
    if (ctx.reduced) {
      p.style.opacity = visible ? '1' : '0';
    } else {
      const cur = p.style.opacity === '0' ? 0 : 1;
      const target = visible ? 1 : 0;
      if (cur !== target) {
        if (target === 1) {
          p.style.opacity = '1';
          ctx.register(fadeIn(p, { duration: 500 }));
        } else {
          ctx.register(fadeOut(p, { duration: 500 }));
          p.style.opacity = '0';
        }
      } else {
        p.style.opacity = visible ? '1' : '0';
      }
    }
  });
  clearHighlights(s);
  if (highlightV2 >= 0 && s.refs.v2[highlightV2]) {
    s.refs.v2[highlightV2].classList.add('highlight');
    if (!ctx.reduced) ctx.register(pulse(s.refs.v2[highlightV2], { duration: 700, iterations: 2 }));
  }
  if (highlightV1 >= 0 && s.refs.v1[highlightV1]) {
    s.refs.v1[highlightV1].classList.add('highlight');
  }
  s.refs.v1Count.textContent = `Ready: ${v1Live} / 3`;
  s.refs.v2Count.textContent = `Ready: ${v2Live} / 3`;
}

const STEPS = [
  {
    id: 'idle',
    duration: 1400,
    narration: 'Deployment is steady at 3 replicas of v1. Updating the image triggers a new ReplicaSet.',
    enter(s, ctx) {
      applyState(s, ctx, { v1Live: 3, v2Live: 0 });
      s.refs.dep.classList.add('highlight');
    },
  },
  {
    id: 'surge',
    duration: 1500,
    narration: 'maxSurge=1 lets the new ReplicaSet scale up by one before any v1 leaves.',
    enter(s, ctx) { applyState(s, ctx, { v1Live: 3, v2Live: 1, highlightV2: 0 }); },
  },
  {
    id: 'first-replace',
    duration: 1500,
    narration: 'New Pod becomes Ready (probes pass). Now maxUnavailable=1 lets one v1 terminate.',
    enter(s, ctx) { applyState(s, ctx, { v1Live: 2, v2Live: 1 }); },
  },
  {
    id: 'second-surge',
    duration: 1500,
    narration: 'Controller surges another v2 Pod. The pattern repeats: bring up new, drain old.',
    enter(s, ctx) { applyState(s, ctx, { v1Live: 2, v2Live: 2, highlightV2: 1 }); },
  },
  {
    id: 'second-replace',
    duration: 1500,
    narration: 'Second v1 terminates after its v2 counterpart is Ready.',
    enter(s, ctx) { applyState(s, ctx, { v1Live: 1, v2Live: 2 }); },
  },
  {
    id: 'final',
    duration: 1500,
    narration: 'Last v2 comes up, last v1 leaves. Deployment converged: 3 v2, 0 v1.',
    enter(s, ctx) { applyState(s, ctx, { v1Live: 0, v2Live: 3, highlightV2: 2 }); },
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
