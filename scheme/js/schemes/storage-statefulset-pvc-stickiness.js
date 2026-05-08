import { svg, g, rect, text } from '../lib/svg.js';
import { arrowDefs, pod, box, cylinder, arrow, fadeIn, fadeOut, pulse } from '../lib/primitives.js';
import { Timeline } from '../lib/timeline.js';

function valChip({ x, y, w, h = 30, name, value, cat = 'storage' }) {
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
      'aria-label': 'StatefulSet PVC stickiness on reschedule',
    });
    root.appendChild(arrowDefs());

    const sset = box({ x: 60, y: 20, w: 320, h: 60, label: 'StatefulSet web', sublabel: 'replicas=1, vct: data', cat: 'workloads' });
    root.appendChild(sset);

    const podOld = pod({ x: 100, y: 130, w: 240, h: 110, label: 'web-0', sublabel: 'first incarnation', cat: 'workloads' });
    root.appendChild(podOld);

    const podNew = pod({ x: 480, y: 130, w: 240, h: 110, label: 'web-0', sublabel: 'rescheduled', cat: 'workloads' });
    podNew.style.opacity = '0';
    root.appendChild(podNew);

    const pvc = box({ x: 800, y: 130, w: 240, h: 60, label: 'PVC data-web-0', sublabel: 'name = sticky to ordinal 0', cat: 'storage' });
    root.appendChild(pvc);

    const pv = cylinder({ x: 820, y: 220, w: 200, h: 90, label: 'PV (cloud-vol-x)', cat: 'storage' });
    root.appendChild(pv);

    const dataChip = valChip({ x: 800, y: 330, w: 240, h: 32, name: 'on-disk data', value: 'rev=1234' });
    root.appendChild(dataChip);

    const phaseChip = valChip({ x: 60, y: 430, w: 980, h: 36, name: 'phase', value: 'Running on node-A' });
    root.appendChild(phaseChip);

    root.appendChild(arrow({ x1: 920, y1: 190, x2: 920, y2: 220, dim: true, color: 'storage' }));

    this.host.appendChild(root);
    this.refs = { svg: root, sset, podOld, podNew, pvc, pv, dataChip, phaseChip };
  }

  reset() { this.build(); }
}

function clearHL(s) {
  ['sset','podOld','podNew','pvc','pv','dataChip','phaseChip'].forEach(k => s.refs[k].classList.remove('highlight'));
}

const STEPS = [
  {
    id: 'idle',
    duration: 1500,
    narration: 'web-0 runs and writes to /data backed by PV cloud-vol-x. The PVC name data-web-0 is stitched to ordinal 0 of the StatefulSet.',
    enter(s) {
      clearHL(s);
      setVal(s.refs.dataChip, 'rev=1234');
      setVal(s.refs.phaseChip, 'Running on node-A');
      s.refs.podOld.style.opacity = '1';
      s.refs.podNew.style.opacity = '0';
      s.refs.podOld.classList.add('highlight');
    },
  },
  {
    id: 'delete',
    duration: 1900,
    narration: 'node-A fails (or pod-0 is evicted). web-0 is gone. The PVC stays untouched: StatefulSet does not delete it on Pod removal.',
    enter(s, ctx) {
      clearHL(s);
      setVal(s.refs.dataChip, 'rev=1234');
      setVal(s.refs.phaseChip, 'Pending · waiting to reschedule');
      s.refs.podOld.style.opacity = '0';
      s.refs.podNew.style.opacity = '0';
      s.refs.pvc.classList.add('highlight');
      s.refs.pv.classList.add('highlight');
      if (!ctx.reduced) {
        ctx.register(fadeOut(s.refs.podOld, { duration: 700 }));
      }
    },
  },
  {
    id: 'recreate',
    duration: 1900,
    narration: 'StatefulSet controller spawns a new pod with the same name web-0 (sticky identity). Scheduler binds it to a healthy node.',
    enter(s, ctx) {
      clearHL(s);
      setVal(s.refs.phaseChip, 'Pending · ContainerCreating');
      s.refs.podNew.style.opacity = '1';
      s.refs.podOld.style.opacity = '0';
      s.refs.podNew.classList.add('highlight');
      if (!ctx.reduced) {
        ctx.register(fadeIn(s.refs.podNew, { duration: 700 }));
      }
    },
  },
  {
    id: 'reattach',
    duration: 2000,
    narration: 'kubelet reattaches the same PVC data-web-0, and the same PV (cloud-vol-x) mounts at /data. The new web-0 sees the previous on-disk state.',
    enter(s, ctx) {
      clearHL(s);
      setVal(s.refs.dataChip, 'rev=1234 (preserved)');
      setVal(s.refs.phaseChip, 'Running on node-B');
      s.refs.podNew.style.opacity = '1';
      s.refs.podNew.classList.add('highlight');
      s.refs.pvc.classList.add('highlight');
      s.refs.pv.classList.add('highlight');
      s.refs.dataChip.classList.add('highlight');
      if (!ctx.reduced) {
        ctx.register(pulse(s.refs.podNew, { duration: 800, iterations: 1 }));
        ctx.register(pulse(s.refs.dataChip, { duration: 800, iterations: 1 }));
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
