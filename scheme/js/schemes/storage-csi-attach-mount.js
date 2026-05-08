import { svg, g, rect, text } from '../lib/svg.js';
import { arrowDefs, pod, box, cylinder, arrow, packet, animateAlong, pulse } from '../lib/primitives.js';
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
      viewBox: '0 0 1200 540',
      preserveAspectRatio: 'xMidYMid meet',
      'aria-label': 'CSI volume attach and mount',
    });
    root.appendChild(arrowDefs());

    const attacher = pod({ x: 80, y: 20, w: 240, h: 70, label: 'external-attacher', sublabel: 'controller sidecar', cat: 'control' });
    const cloudVol = cylinder({ x: 520, y: 20, w: 200, h: 70, label: 'cloud-volume', cat: 'storage' });
    const attachedChip = valChip({ x: 860, y: 32, w: 260, h: 44, name: 'attached-to', value: '—' });
    root.appendChild(attacher);
    root.appendChild(cloudVol);
    root.appendChild(attachedChip);

    const nodeBox = box({ x: 80, y: 140, w: 1080, h: 380, label: 'node-1', sublabel: 'csi-driver DaemonSet runs here', cat: 'control' });
    root.appendChild(nodeBox);

    const kubelet = pod({ x: 120, y: 190, w: 200, h: 70, label: 'kubelet', sublabel: 'pod manager', cat: 'control' });
    const csiNode = pod({ x: 360, y: 190, w: 240, h: 70, label: 'csi-node-driver', sublabel: 'DaemonSet pod', cat: 'control' });
    root.appendChild(kubelet);
    root.appendChild(csiNode);

    const globalMount = valChip({ x: 640, y: 210, w: 460, h: 32, name: 'NodeStage', value: '/var/.../globalmount  empty' });
    root.appendChild(globalMount);

    const appPod = pod({ x: 120, y: 320, w: 240, h: 130, label: 'App Pod', sublabel: 'mountPath /data', cat: 'workloads' });
    root.appendChild(appPod);

    const bindMount = valChip({ x: 640, y: 380, w: 460, h: 32, name: 'NodePublish', value: '/var/.../<podUID>/mount  empty' });
    root.appendChild(bindMount);

    const containerStatus = valChip({ x: 640, y: 430, w: 460, h: 32, name: 'container', value: 'Waiting (volume not ready)' });
    root.appendChild(containerStatus);

    root.appendChild(arrow({ x1: 320, y1: 55, x2: 520, y2: 55, dim: true, color: 'storage' }));
    root.appendChild(arrow({ x1: 320, y1: 224, x2: 360, y2: 224, dim: true, color: 'control' }));
    root.appendChild(arrow({ x1: 600, y1: 224, x2: 640, y2: 224, dim: true, color: 'storage' }));
    root.appendChild(arrow({ x1: 870, y1: 244, x2: 870, y2: 380, dim: true, dashed: true, color: 'storage' }));
    root.appendChild(arrow({ x1: 360, y1: 396, x2: 640, y2: 396, dim: true, color: 'storage' }));

    this.host.appendChild(root);
    this.refs = { svg: root, attacher, cloudVol, attachedChip, nodeBox, kubelet, csiNode, globalMount, appPod, bindMount, containerStatus };
  }

  reset() { this.build(); }
}

function clearHL(s) {
  ['attacher','cloudVol','attachedChip','kubelet','csiNode','globalMount','appPod','bindMount','containerStatus']
    .forEach(k => s.refs[k].classList.remove('highlight'));
}

const STEPS = [
  {
    id: 'idle',
    duration: 1500,
    narration: 'PVC has bound a PV, and scheduler put App Pod on node-1. The cloud-volume exists in the cloud API, but is not yet wired into the node.',
    enter(s) {
      clearHL(s);
      setVal(s.refs.attachedChip, '—');
      setVal(s.refs.globalMount, '/var/.../globalmount  empty');
      setVal(s.refs.bindMount, '/var/.../<podUID>/mount  empty');
      setVal(s.refs.containerStatus, 'Waiting (volume not ready)');
      s.refs.cloudVol.classList.add('highlight');
    },
  },
  {
    id: 'controller-publish',
    duration: 1900,
    narration: 'external-attacher controller calls driver ControllerPublishVolume(volumeId, nodeId). Cloud API attaches the disk to node-1 as a block device.',
    enter(s, ctx) {
      clearHL(s);
      setVal(s.refs.attachedChip, 'node-1');
      s.refs.attacher.classList.add('highlight');
      s.refs.cloudVol.classList.add('highlight');
      s.refs.attachedChip.classList.add('highlight');
      if (!ctx.reduced) {
        ctx.register(pulse(s.refs.cloudVol, { duration: 800, iterations: 1 }));
        ctx.register(pulse(s.refs.attachedChip, { duration: 800, iterations: 1 }));
      }
    },
  },
  {
    id: 'node-stage',
    duration: 1900,
    narration: 'kubelet asks csi-node-driver to NodeStageVolume. Driver formats (if needed) and mounts the block device at a node-global path used for all Pods consuming this volume.',
    enter(s, ctx) {
      clearHL(s);
      setVal(s.refs.attachedChip, 'node-1');
      setVal(s.refs.globalMount, '/var/.../globalmount  mounted (ext4)');
      s.refs.kubelet.classList.add('highlight');
      s.refs.csiNode.classList.add('highlight');
      s.refs.globalMount.classList.add('highlight');
      if (!ctx.reduced) ctx.register(pulse(s.refs.globalMount, { duration: 800, iterations: 1 }));
    },
  },
  {
    id: 'node-publish',
    duration: 1900,
    narration: 'For each Pod using this PVC, kubelet calls NodePublishVolume. Driver bind-mounts the global path to a Pod-specific path under /var/lib/kubelet/pods/<podUID>.',
    enter(s, ctx) {
      clearHL(s);
      setVal(s.refs.attachedChip, 'node-1');
      setVal(s.refs.globalMount, '/var/.../globalmount  mounted (ext4)');
      setVal(s.refs.bindMount, '/var/.../<podUID>/mount  bind-mounted');
      s.refs.csiNode.classList.add('highlight');
      s.refs.bindMount.classList.add('highlight');
      if (!ctx.reduced) ctx.register(pulse(s.refs.bindMount, { duration: 800, iterations: 2 }));
    },
  },
  {
    id: 'running',
    duration: 1900,
    narration: 'kubelet starts the container with that path mounted into /data. App Pod now reads and writes the persistent volume directly.',
    enter(s, ctx) {
      clearHL(s);
      setVal(s.refs.attachedChip, 'node-1');
      setVal(s.refs.globalMount, '/var/.../globalmount  mounted (ext4)');
      setVal(s.refs.bindMount, '/var/.../<podUID>/mount  bind-mounted');
      setVal(s.refs.containerStatus, 'Running · /data ready');
      s.refs.appPod.classList.add('highlight');
      s.refs.containerStatus.classList.add('highlight');
      if (!ctx.reduced) ctx.register(pulse(s.refs.appPod, { duration: 800, iterations: 1 }));
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
