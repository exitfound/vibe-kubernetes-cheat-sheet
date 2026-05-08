import { svg, g, text } from '../lib/svg.js';
import { arrowDefs, pod, box, chip, cylinder, arrow, packet, animateAlong, fadeIn, pulse } from '../lib/primitives.js';
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
      'aria-label': 'PVC to PV binding',
    });
    root.appendChild(arrowDefs());

    const podEl = pod({ x: 50, y: 200, w: 130, h: 90, label: 'App Pod', sublabel: 'volumes: data', containers: 1, cat: 'workloads' });
    root.appendChild(podEl);

    const pvc = chip({ x: 230, y: 225, w: 170, h: 40, label: 'PVC data-claim · 5Gi', cat: 'storage' });
    root.appendChild(pvc);

    const provisioner = box({ x: 450, y: 200, w: 220, h: 90, label: 'CSI provisioner', sublabel: 'StorageClass gp3', cat: 'control' });
    root.appendChild(provisioner);

    const pv = cylinder({ x: 740, y: 200, w: 130, h: 90, label: 'PV pv-x73a', cat: 'storage' });
    pv.style.opacity = '0';
    root.appendChild(pv);

    // Static dim arrows
    root.appendChild(arrow({ x1: 180, y1: 245, x2: 230, y2: 245, dim: true, color: 'storage' }));    // Pod → PVC
    const pvcToProv = arrow({ x1: 400, y1: 245, x2: 450, y2: 245, dim: true, color: 'control' });   // PVC → Provisioner
    root.appendChild(pvcToProv);
    const provToPv = arrow({ x1: 670, y1: 245, x2: 740, y2: 245, dim: true, color: 'storage' });    // Provisioner → PV
    root.appendChild(provToPv);

    // Bound link (PVC ↔ PV) — visible only on step 3+
    const boundLink = arrow({ x1: 400, y1: 360, x2: 740, y2: 360, dim: false, color: 'storage' });
    boundLink.style.opacity = '0';
    root.appendChild(boundLink);
    const boundLabel = text({ class: 'scheme-label code dim', x: 570, y: 350, 'text-anchor': 'middle' }, ['Bound']);
    boundLabel.style.opacity = '0';
    root.appendChild(boundLabel);

    // Mount link Pod ↔ PV (visible step 4)
    const mountLink = arrow({ x1: 115, y1: 290, x2: 805, y2: 290, dim: false, dashed: true, color: 'storage' });
    mountLink.style.opacity = '0';
    root.appendChild(mountLink);
    const mountLabel = text({ class: 'scheme-label code dim', x: 460, y: 410, 'text-anchor': 'middle' }, ['kubelet mount']);
    mountLabel.style.opacity = '0';
    root.appendChild(mountLabel);

    const packetLayer = g({ id: 'packetLayer' });
    root.appendChild(packetLayer);

    this.host.appendChild(root);
    this.refs = { svg: root, podEl, pvc, provisioner, pv, boundLink, boundLabel, mountLink, mountLabel, packetLayer };
  }

  reset() { this.build(); }
}

const STEPS = [
  {
    id: 'idle',
    duration: 1400,
    narration: 'A Pod claims storage via a PVC named data-claim. The PVC is Pending — no PV satisfies it yet.',
    enter(s) {
      s.refs.packetLayer.replaceChildren();
      s.refs.pv.style.opacity = '0';
      s.refs.boundLink.style.opacity = '0';
      s.refs.boundLabel.style.opacity = '0';
      s.refs.mountLink.style.opacity = '0';
      s.refs.mountLabel.style.opacity = '0';
      s.refs.pvc.classList.remove('highlight');
      s.refs.provisioner.classList.remove('highlight');
      s.refs.pv.classList.remove('highlight');
      s.refs.podEl.classList.add('highlight');
      s.refs.pvc.classList.add('highlight');
    },
  },
  {
    id: 'notice',
    duration: 1700,
    narration: 'The PV controller watches PVCs. Seeing this one Pending and matching StorageClass=gp3, it asks the CSI driver.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      s.refs.pvc.classList.add('highlight');
      s.refs.provisioner.classList.add('highlight');
      const p = packet({ x: 400, y: 245, cat: 'control' });
      s.refs.packetLayer.appendChild(p);
      if (ctx.reduced) {
        p.style.transform = 'translate(450px, 245px)';
      } else {
        ctx.register(animateAlong(p, [[400, 245], [450, 245]], { duration: 900 }));
      }
    },
  },
  {
    id: 'create-pv',
    duration: 1800,
    narration: 'CSI provisioner creates a real volume in the storage backend and registers a PV object in etcd.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      s.refs.pvc.classList.remove('highlight');
      s.refs.pv.style.opacity = '1';
      if (!ctx.reduced) ctx.register(fadeIn(s.refs.pv, { duration: 700 }));
      const p = packet({ x: 670, y: 245, cat: 'storage' });
      s.refs.packetLayer.appendChild(p);
      if (ctx.reduced) {
        p.style.transform = 'translate(740px, 245px)';
      } else {
        ctx.register(animateAlong(p, [[670, 245], [740, 245]], { duration: 900 }));
      }
    },
  },
  {
    id: 'bind',
    duration: 1700,
    narration: 'The binding controller pairs the PVC and PV: PVC.spec.volumeName = PV.name. Both move to Bound.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      s.refs.provisioner.classList.remove('highlight');
      s.refs.pvc.classList.add('highlight');
      s.refs.pv.classList.add('highlight');
      s.refs.boundLink.style.opacity = '1';
      s.refs.boundLabel.style.opacity = '1';
      if (!ctx.reduced) {
        ctx.register(fadeIn(s.refs.boundLink, { duration: 600 }));
        ctx.register(fadeIn(s.refs.boundLabel, { duration: 600 }));
      }
    },
  },
  {
    id: 'mount',
    duration: 1700,
    narration: 'When the Pod schedules, kubelet asks the CSI node plugin to attach and mount the volume into the container.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      s.refs.mountLink.style.opacity = '1';
      s.refs.mountLabel.style.opacity = '1';
      if (!ctx.reduced) {
        ctx.register(fadeIn(s.refs.mountLink, { duration: 600 }));
        ctx.register(fadeIn(s.refs.mountLabel, { duration: 600 }));
        ctx.register(pulse(s.refs.podEl, { duration: 800, iterations: 2 }));
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
