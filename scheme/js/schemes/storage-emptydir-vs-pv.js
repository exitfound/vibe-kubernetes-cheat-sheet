import { svg, g, rect, text } from '../lib/svg.js';
import { arrowDefs, pod, box, cylinder, chip, arrow, fadeIn, fadeOut, pulse } from '../lib/primitives.js';
import { Timeline } from '../lib/timeline.js';

function valChip({ x, y, w, h = 32, name, value, cat = 'storage' }) {
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
      'aria-label': 'emptyDir vs PV behavior on reschedule',
    });
    root.appendChild(arrowDefs());

    const labelA = chip({ x: 60,  y: 20, w: 480, h: 36, label: 'Pod A · emptyDir',     cat: 'workloads' });
    const labelB = chip({ x: 580, y: 20, w: 480, h: 36, label: 'Pod B · PVC + PV',     cat: 'storage' });
    root.appendChild(labelA); root.appendChild(labelB);

    const podA = pod({ x: 80,  y: 90, w: 440, h: 130, label: 'Pod A', sublabel: 'volume: emptyDir', cat: 'workloads' });
    const podB = pod({ x: 600, y: 90, w: 440, h: 130, label: 'Pod B', sublabel: 'volume: PVC data',  cat: 'workloads' });
    root.appendChild(podA); root.appendChild(podB);

    const volA = chip({ x: 120, y: 240, w: 360, h: 40, label: 'emptyDir  (host tmpfs)', cat: 'workloads' });
    root.appendChild(volA);

    const volB = cylinder({ x: 680, y: 240, w: 280, h: 80, label: 'PV cloud-vol-y', cat: 'storage' });
    root.appendChild(volB);

    const dataA = valChip({ x: 120, y: 300, w: 360, name: 'Pod A · data', value: 'log1 · log2' });
    const dataB = valChip({ x: 640, y: 340, w: 360, name: 'Pod B · data', value: 'log1 · log2' });
    root.appendChild(dataA); root.appendChild(dataB);

    const noteA = valChip({ x: 120, y: 340, w: 360, name: 'lifetime',  value: 'tied to Pod' });
    const noteB = valChip({ x: 640, y: 380, w: 360, name: 'lifetime',  value: 'tied to PVC (survives Pod)' });
    root.appendChild(noteA); root.appendChild(noteB);

    const phaseChip = valChip({ x: 120, y: 440, w: 880, h: 38, name: 'event', value: 'idle' });
    root.appendChild(phaseChip);

    this.host.appendChild(root);
    this.refs = { svg: root, podA, podB, volA, volB, dataA, dataB, noteA, noteB, phaseChip };
  }

  reset() { this.build(); }
}

function clearHL(s) {
  ['podA','podB','volA','volB','dataA','dataB','noteA','noteB','phaseChip'].forEach(k => s.refs[k].classList.remove('highlight'));
}

const STEPS = [
  {
    id: 'idle',
    duration: 1500,
    narration: 'Two Pods on node-A. Pod A uses an emptyDir volume, while Pod B uses a PVC that binds to a cloud-backed PV. Both apps have written some data.',
    enter(s) {
      clearHL(s);
      setVal(s.refs.dataA, 'log1 · log2');
      setVal(s.refs.dataB, 'log1 · log2');
      setVal(s.refs.phaseChip, 'idle');
      s.refs.podA.style.opacity = '1';
      s.refs.podB.style.opacity = '1';
      s.refs.podA.classList.add('highlight');
      s.refs.podB.classList.add('highlight');
    },
  },
  {
    id: 'node-fail',
    duration: 1900,
    narration: 'node-A fails. Both Pods are evicted. The cloud volume disconnects from the node, but the underlying disk persists. The host\'s tmpfs is gone with the node.',
    enter(s, ctx) {
      clearHL(s);
      setVal(s.refs.phaseChip, 'node-A failure · pods evicted');
      s.refs.podA.style.opacity = '0';
      s.refs.podB.style.opacity = '0';
      s.refs.phaseChip.classList.add('highlight');
      if (!ctx.reduced) {
        ctx.register(fadeOut(s.refs.podA, { duration: 700 }));
        ctx.register(fadeOut(s.refs.podB, { duration: 700 }));
        ctx.register(pulse(s.refs.phaseChip, { duration: 800, iterations: 2 }));
      }
    },
  },
  {
    id: 'reschedule',
    duration: 1900,
    narration: 'Both Pods are rescheduled to node-B. emptyDir gets a fresh, empty tmpfs on the new host. The PV reattaches to the new node, exposing the same disk.',
    enter(s, ctx) {
      clearHL(s);
      setVal(s.refs.dataA, 'empty');
      setVal(s.refs.dataB, 'log1 · log2 (preserved)');
      setVal(s.refs.phaseChip, 'rescheduled to node-B');
      s.refs.podA.style.opacity = '1';
      s.refs.podB.style.opacity = '1';
      if (!ctx.reduced) {
        ctx.register(fadeIn(s.refs.podA, { duration: 700 }));
        ctx.register(fadeIn(s.refs.podB, { duration: 700 }));
      }
    },
  },
  {
    id: 'compare',
    duration: 1900,
    narration: 'Pod A starts from scratch: any state in the old emptyDir is gone. Pod B keeps its history because the PV survived. Use emptyDir for cache, PV for data that must outlive a Pod.',
    enter(s, ctx) {
      clearHL(s);
      setVal(s.refs.dataA, 'empty');
      setVal(s.refs.dataB, 'log1 · log2 (preserved)');
      setVal(s.refs.phaseChip, 'Running on node-B · diverged state');
      s.refs.dataA.classList.add('highlight');
      s.refs.dataB.classList.add('highlight');
      s.refs.podA.style.opacity = '1';
      s.refs.podB.style.opacity = '1';
      if (!ctx.reduced) {
        ctx.register(pulse(s.refs.dataA, { duration: 800, iterations: 1 }));
        ctx.register(pulse(s.refs.dataB, { duration: 800, iterations: 1 }));
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
