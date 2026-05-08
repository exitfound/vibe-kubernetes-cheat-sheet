import { svg, g, rect, text } from '../lib/svg.js';
import { arrowDefs, pod, box, queueLane, setSlotState, pulse, fadeIn, fadeOut } from '../lib/primitives.js';
import { Timeline } from '../lib/timeline.js';

function valChip({ x, y, w, h = 32, name, value, cat = 'workloads' }) {
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
      'aria-label': 'Job parallelism and completions',
    });
    root.appendChild(arrowDefs());

    const jobBox = box({ x: 80, y: 20, w: 460, h: 60, label: 'Job process-batch', sublabel: 'parallelism=3 · completions=6', cat: 'workloads' });
    root.appendChild(jobBox);

    const counters = valChip({ x: 580, y: 28, w: 460, h: 44, name: 'succeeded / failed', value: '0 / 0' });
    root.appendChild(counters);

    const lane = queueLane({
      x: 80, y: 120, slotW: 70, slotH: 60, gap: 12,
      items: ['queued','queued','queued','queued','queued','queued'],
      cat: 'workloads',
    });
    root.appendChild(lane);
    for (let i = 0; i < 6; i++) setSlotState(lane, i, 'queued');

    const p1 = pod({ x: 80,  y: 240, w: 220, h: 80, label: 'pod-1', sublabel: 'worker', cat: 'workloads' });
    const p2 = pod({ x: 320, y: 240, w: 220, h: 80, label: 'pod-2', sublabel: 'worker', cat: 'workloads' });
    const p3 = pod({ x: 560, y: 240, w: 220, h: 80, label: 'pod-3', sublabel: 'worker', cat: 'workloads' });
    p1.style.opacity = '0';
    p2.style.opacity = '0';
    p3.style.opacity = '0';
    root.appendChild(p1); root.appendChild(p2); root.appendChild(p3);

    const p1Status = valChip({ x: 80,  y: 340, w: 220, name: 'pod-1', value: 'idle' });
    const p2Status = valChip({ x: 320, y: 340, w: 220, name: 'pod-2', value: 'idle' });
    const p3Status = valChip({ x: 560, y: 340, w: 220, name: 'pod-3', value: 'idle' });
    root.appendChild(p1Status); root.appendChild(p2Status); root.appendChild(p3Status);

    const phaseChip = valChip({ x: 80, y: 420, w: 700, h: 36, name: 'job phase', value: 'Pending' });
    root.appendChild(phaseChip);

    this.host.appendChild(root);
    this.refs = { svg: root, jobBox, counters, lane, p1, p2, p3, p1Status, p2Status, p3Status, phaseChip };
  }

  reset() { this.build(); }
}

function clearHL(s) {
  ['jobBox','counters','p1','p2','p3','p1Status','p2Status','p3Status','phaseChip'].forEach(k => s.refs[k].classList.remove('highlight'));
}

const STEPS = [
  {
    id: 'idle',
    duration: 1400,
    narration: 'Job declares parallelism=3 (max running pods) and completions=6 (total successful runs needed). 6 work units sit in the queue.',
    enter(s) {
      clearHL(s);
      setVal(s.refs.counters, '0 / 0');
      setVal(s.refs.p1Status, 'idle');
      setVal(s.refs.p2Status, 'idle');
      setVal(s.refs.p3Status, 'idle');
      setVal(s.refs.phaseChip, 'Pending');
      s.refs.p1.style.opacity = '0';
      s.refs.p2.style.opacity = '0';
      s.refs.p3.style.opacity = '0';
      for (let i = 0; i < 6; i++) setSlotState(s.refs.lane, i, 'queued');
      s.refs.jobBox.classList.add('highlight');
    },
  },
  {
    id: 'start-3',
    duration: 1900,
    narration: 'Job controller spawns 3 worker Pods (parallelism cap). Each picks an unfinished slot and starts processing.',
    enter(s, ctx) {
      clearHL(s);
      setVal(s.refs.counters, '0 / 0');
      setVal(s.refs.p1Status, 'unit-1');
      setVal(s.refs.p2Status, 'unit-2');
      setVal(s.refs.p3Status, 'unit-3');
      setVal(s.refs.phaseChip, 'Running · 3 pods active');
      s.refs.p1.style.opacity = '1';
      s.refs.p2.style.opacity = '1';
      s.refs.p3.style.opacity = '1';
      setSlotState(s.refs.lane, 0, 'in-flight');
      setSlotState(s.refs.lane, 1, 'in-flight');
      setSlotState(s.refs.lane, 2, 'in-flight');
      if (!ctx.reduced) {
        ctx.register(fadeIn(s.refs.p1, { duration: 600 }));
        ctx.register(fadeIn(s.refs.p2, { duration: 600 }));
        ctx.register(fadeIn(s.refs.p3, { duration: 600 }));
      }
    },
  },
  {
    id: 'partial',
    duration: 2000,
    narration: 'pod-1 and pod-2 finish their units (status 0). pod-3 fails (non-zero exit). Job records 2 succeeded / 1 failed and creates a replacement pod for unit-3.',
    enter(s, ctx) {
      clearHL(s);
      setVal(s.refs.counters, '2 / 1');
      setVal(s.refs.p1Status, 'unit-1 done');
      setVal(s.refs.p2Status, 'unit-2 done');
      setVal(s.refs.p3Status, 'unit-3 FAILED');
      setVal(s.refs.phaseChip, 'Running · backoff retry');
      s.refs.p3Status.classList.add('highlight');
      setSlotState(s.refs.lane, 0, 'done');
      setSlotState(s.refs.lane, 1, 'done');
      setSlotState(s.refs.lane, 2, 'queued');
      s.refs.p3.style.opacity = '0';
      if (!ctx.reduced) {
        ctx.register(fadeOut(s.refs.p3, { duration: 600 }));
        ctx.register(pulse(s.refs.p3Status, { duration: 800, iterations: 2 }));
      }
    },
  },
  {
    id: 'retry-progress',
    duration: 2000,
    narration: 'Replacement pod-3 picks up unit-3. pod-1 and pod-2 grab the next units 4 and 5. Three workers, three live units again.',
    enter(s, ctx) {
      clearHL(s);
      setVal(s.refs.counters, '2 / 1');
      setVal(s.refs.p1Status, 'unit-4');
      setVal(s.refs.p2Status, 'unit-5');
      setVal(s.refs.p3Status, 'unit-3 (retry)');
      setVal(s.refs.phaseChip, 'Running · 3 pods active');
      s.refs.p3.style.opacity = '1';
      setSlotState(s.refs.lane, 2, 'in-flight');
      setSlotState(s.refs.lane, 3, 'in-flight');
      setSlotState(s.refs.lane, 4, 'in-flight');
      if (!ctx.reduced) {
        ctx.register(fadeIn(s.refs.p3, { duration: 600 }));
        ctx.register(pulse(s.refs.p3, { duration: 800, iterations: 1 }));
      }
    },
  },
  {
    id: 'all-done',
    duration: 1900,
    narration: 'All 6 work units have a successful pod. Job records succeeded=6, sets condition Complete=True, and stops creating new pods.',
    enter(s, ctx) {
      clearHL(s);
      setVal(s.refs.counters, '6 / 1');
      setVal(s.refs.p1Status, 'unit-6 done');
      setVal(s.refs.p2Status, 'idle');
      setVal(s.refs.p3Status, 'idle');
      setVal(s.refs.phaseChip, 'Complete');
      for (let i = 0; i < 6; i++) setSlotState(s.refs.lane, i, 'done');
      s.refs.jobBox.classList.add('highlight');
      s.refs.phaseChip.classList.add('highlight');
      if (!ctx.reduced) {
        ctx.register(pulse(s.refs.phaseChip, { duration: 800, iterations: 2 }));
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
