import { svg, g, rect, text } from '../lib/svg.js';
import { arrowDefs, pod, box, cylinder, arrow, fadeIn, pulse } from '../lib/primitives.js';
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
      viewBox: '0 0 1100 540',
      preserveAspectRatio: 'xMidYMid meet',
      'aria-label': 'VolumeSnapshot lifecycle',
    });
    root.appendChild(arrowDefs());

    const srcPvc = box({ x: 60, y: 20, w: 200, h: 50, label: 'PVC src',  sublabel: 'bound', cat: 'storage' });
    const srcPv  = cylinder({ x: 80, y: 90, w: 160, h: 80, label: 'PV src',   cat: 'storage' });
    root.appendChild(srcPvc);
    root.appendChild(srcPv);

    const snap = box({ x: 360, y: 20, w: 260, h: 70, label: 'VolumeSnapshot snap-1', sublabel: 'spec.source.PVC=src', cat: 'storage' });
    root.appendChild(snap);

    const snapper = pod({ x: 700, y: 20, w: 280, h: 70, label: 'external-snapshotter', sublabel: 'CSI sidecar', cat: 'control' });
    root.appendChild(snapper);

    const content = box({ x: 360, y: 130, w: 260, h: 70, label: 'VolumeSnapshotContent', sublabel: 'snapHandle: cloud-snap-42', cat: 'storage' });
    root.appendChild(content);

    const cloudSnap = cylinder({ x: 720, y: 110, w: 240, h: 80, label: 'cloud snapshot', cat: 'storage' });
    cloudSnap.style.opacity = '0';
    root.appendChild(cloudSnap);

    const readyChip = valChip({ x: 360, y: 220, w: 600, h: 32, name: 'readyToUse', value: 'false' });
    root.appendChild(readyChip);

    const newPvc = box({ x: 60,  y: 320, w: 220, h: 60, label: 'PVC restored', sublabel: 'dataSource: snap-1', cat: 'storage' });
    newPvc.style.opacity = '0';
    root.appendChild(newPvc);

    const newPv  = cylinder({ x: 80, y: 400, w: 180, h: 80, label: 'PV restored', cat: 'storage' });
    newPv.style.opacity = '0';
    root.appendChild(newPv);

    root.appendChild(arrow({ x1: 260, y1: 50, x2: 360, y2: 50, dim: true, dashed: true, color: 'storage' }));
    root.appendChild(arrow({ x1: 620, y1: 55, x2: 700, y2: 55, dim: true, color: 'control' }));
    root.appendChild(arrow({ x1: 840, y1: 90, x2: 840, y2: 110, dim: true, color: 'storage' }));
    root.appendChild(arrow({ x1: 720, y1: 165, x2: 620, y2: 165, dim: true, dashed: true, color: 'storage' }));
    root.appendChild(arrow({ x1: 170, y1: 280, x2: 170, y2: 320, dim: true, color: 'storage' }));
    root.appendChild(arrow({ x1: 360, y1: 350, x2: 280, y2: 350, dim: true, dashed: true, color: 'storage' }));

    this.host.appendChild(root);
    this.refs = { svg: root, srcPvc, srcPv, snap, snapper, content, cloudSnap, readyChip, newPvc, newPv };
  }

  reset() { this.build(); }
}

function clearHL(s) {
  ['srcPvc','srcPv','snap','snapper','content','cloudSnap','readyChip','newPvc','newPv'].forEach(k => s.refs[k].classList.remove('highlight'));
}

const STEPS = [
  {
    id: 'idle',
    duration: 1500,
    narration: 'Source PVC is bound to PV src holding live data. We want a point-in-time copy without stopping the workload.',
    enter(s) {
      clearHL(s);
      setVal(s.refs.readyChip, 'false');
      s.refs.cloudSnap.style.opacity = '0';
      s.refs.newPvc.style.opacity = '0';
      s.refs.newPv.style.opacity = '0';
      s.refs.srcPv.classList.add('highlight');
    },
  },
  {
    id: 'create-snap',
    duration: 1700,
    narration: 'User creates a VolumeSnapshot CR pointing at PVC src. external-snapshotter sidecar watches the apiserver and notices the new object.',
    enter(s, ctx) {
      clearHL(s);
      setVal(s.refs.readyChip, 'false');
      s.refs.snap.classList.add('highlight');
      s.refs.snapper.classList.add('highlight');
      if (!ctx.reduced) ctx.register(pulse(s.refs.snap, { duration: 800, iterations: 1 }));
    },
  },
  {
    id: 'driver-call',
    duration: 1900,
    narration: 'snapshotter calls driver CreateSnapshot RPC. The driver asks the cloud to take a snapshot of the underlying volume and returns a snapshot handle.',
    enter(s, ctx) {
      clearHL(s);
      setVal(s.refs.readyChip, 'false');
      s.refs.snapper.classList.add('highlight');
      s.refs.cloudSnap.classList.add('highlight');
      s.refs.cloudSnap.style.opacity = '1';
      if (!ctx.reduced) {
        ctx.register(fadeIn(s.refs.cloudSnap, { duration: 700 }));
        ctx.register(pulse(s.refs.cloudSnap, { duration: 800, iterations: 1 }));
      }
    },
  },
  {
    id: 'bound',
    duration: 1700,
    narration: 'VolumeSnapshotContent is created with the snapshot handle. snapshotter binds VolumeSnapshot ↔ VolumeSnapshotContent and flips readyToUse=true.',
    enter(s, ctx) {
      clearHL(s);
      setVal(s.refs.readyChip, 'true');
      s.refs.cloudSnap.style.opacity = '1';
      s.refs.snap.classList.add('highlight');
      s.refs.content.classList.add('highlight');
      s.refs.readyChip.classList.add('highlight');
      if (!ctx.reduced) ctx.register(pulse(s.refs.readyChip, { duration: 800, iterations: 2 }));
    },
  },
  {
    id: 'restore',
    duration: 2000,
    narration: 'A new PVC is created with dataSource referring to snap-1. The provisioner clones the snapshot into a new PV, and the PVC restored binds to it. New workloads can mount and replay state.',
    enter(s, ctx) {
      clearHL(s);
      setVal(s.refs.readyChip, 'true');
      s.refs.cloudSnap.style.opacity = '1';
      s.refs.newPvc.style.opacity = '1';
      s.refs.newPv.style.opacity = '1';
      s.refs.newPvc.classList.add('highlight');
      s.refs.newPv.classList.add('highlight');
      if (!ctx.reduced) {
        ctx.register(fadeIn(s.refs.newPvc, { duration: 700 }));
        ctx.register(fadeIn(s.refs.newPv, { duration: 700 }));
        ctx.register(pulse(s.refs.newPv, { duration: 800, iterations: 1 }));
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
