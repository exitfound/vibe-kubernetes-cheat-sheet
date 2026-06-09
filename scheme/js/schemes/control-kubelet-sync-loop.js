import { svg, g, rect, text } from '../lib/svg.js';
import { arrowDefs, box, chainList, arrow, packet, animateAlong, pulse } from '../lib/primitives.js';
import { Timeline } from '../lib/timeline.js';

function valChip({ x, y, w, h = 32, name, value, cat = 'control' }) {
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
      viewBox: '0 0 1200 460',
      preserveAspectRatio: 'xMidYMid meet',
      'aria-label': 'Kubelet sync loop: watch, PLEG, SyncPod, CRI, status',
      'data-style': 'outline',
    });
    const content = g({ transform: 'translate(60, 23) scale(0.9)' });
    content.appendChild(arrowDefs());

    const api     = box({ x: 320, y: 40, w: 220, h: 80, label: 'ApiServer',  sublabel: 'spec source',  cat: 'control' });
    const kubelet = box({ x: 620, y: 40, w: 220, h: 80, label: 'Kubelet',    sublabel: 'on Node-1',    cat: 'control' });
    const runtime = box({ x: 920, y: 40, w: 240, h: 80, label: 'containerd', sublabel: 'CRI gRPC',     cat: 'control' });

    // Top arrows: ApiServer ↔ Kubelet (watch + status PATCH), Kubelet ↔ Runtime (CRI calls).
    content.appendChild(arrow({ x1: 540, y1: 80,  x2: 620, y2: 80,  dim: true, dashed: true, color: 'control' }));
    content.appendChild(arrow({ x1: 620, y1: 110, x2: 540, y2: 110, dim: true, dashed: true, color: 'control' }));
    content.appendChild(arrow({ x1: 840, y1: 80,  x2: 920, y2: 80,  dim: true, dashed: true, color: 'control' }));
    content.appendChild(arrow({ x1: 920, y1: 110, x2: 840, y2: 110, dim: true, dashed: true, color: 'control' }));

    // Wire labels (font-size: 9) in the gap between top row and pipeline.
    const wireApi = text({ class: 'scheme-label code dim', x: 580, y: 148, 'text-anchor': 'middle', 'font-size': 9 }, [' ']);
    const wireRT  = text({ class: 'scheme-label code dim', x: 880, y: 148, 'text-anchor': 'middle', 'font-size': 9 }, [' ']);
    [wireApi, wireRT].forEach(t => content.appendChild(t));

    // Pipeline chain: 5 stages of the Kubelet sync cycle.
    const chain = chainList({
      x: 320, y: 200, w: 460, rowH: 32, gap: 10,
      items: [
        '1. watch     ·  pod specs from ApiServer',
        '2. PLEG      ·  observe containers via list-containers',
        '3. SyncPod   ·  reconcile desired vs observed',
        '4. CRI       ·  Create/Start container gRPC',
        '5. status    ·  PATCH Pod containerStatuses',
      ],
      cat: 'control',
    });

    // State chips column on the right.
    const podChip      = valChip({ x: 800, y: 200, w: 380, h: 32, name: 'Pod',         value: '—' });
    const desiredChip  = valChip({ x: 800, y: 242, w: 380, h: 32, name: 'desired',     value: '—' });
    const observedChip = valChip({ x: 800, y: 284, w: 380, h: 32, name: 'observed',    value: '—' });
    const lastOpChip   = valChip({ x: 800, y: 326, w: 380, h: 32, name: 'last CRI op', value: '—' });
    [podChip, desiredChip, observedChip, lastOpChip].forEach(c => content.appendChild(c));

    // Packet layer.
    const packetLayer = g({ id: 'packetLayer' });
    content.appendChild(packetLayer);

    // Chain LAST among middle blocks so it renders on top of packet layer.
    content.appendChild(chain);

    // Top-row blocks ABSOLUTE LAST.
    content.appendChild(api);
    content.appendChild(kubelet);
    content.appendChild(runtime);

    root.appendChild(content);
    this.host.appendChild(root);
    this.refs = {
      svg: root,
      api, kubelet, runtime, chain,
      podChip, desiredChip, observedChip, lastOpChip,
      packetLayer,
      wires: { api: wireApi, rt: wireRT },
    };
  }

  reset() { this.build(); }
}

function clearHL(s) {
  ['api','kubelet','runtime','podChip','desiredChip','observedChip','lastOpChip']
    .forEach(k => s.refs[k].classList.remove('highlight'));
  s.refs.chain.querySelectorAll('.scheme-chip').forEach(r => r.classList.remove('highlight'));
}

function clearWires(s) {
  Object.values(s.refs.wires).forEach(t => { t.textContent = ''; });
}

function setWire(s, key, txt) {
  if (s.refs.wires[key]) s.refs.wires[key].textContent = txt;
}

const STEPS = [
  {
    id: 'idle',
    duration: 1500,
    narration: 'Kubelet on Node-1 runs a continuous reconciliation loop. Pod specs come in from sources (mainly ApiServer), and observed container state comes from the runtime via PLEG. SyncPod compares the two and issues CRI calls to converge.',
    enter(s) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setVal(s.refs.podChip, '—');
      setVal(s.refs.desiredChip, '—');
      setVal(s.refs.observedChip, '—');
      setVal(s.refs.lastOpChip, '—');
    },
  },
  {
    id: 'watch',
    duration: 1900,
    narration: 'ApiServer streams an ADDED event for Pod my-app-7d4-abc bound to Node-1. Kubelet\'s source dispatcher routes the spec into podManager as desired state.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setVal(s.refs.podChip, 'my-app-7d4-abc');
      setVal(s.refs.desiredChip, '1 container');
      setVal(s.refs.observedChip, '—');
      setVal(s.refs.lastOpChip, '—');
      setWire(s, 'api', 'watch ADDED');
      s.refs.api.classList.add('highlight');
      s.refs.kubelet.classList.add('highlight');
      s.refs.podChip.classList.add('highlight');
      s.refs.desiredChip.classList.add('highlight');
      const rows = s.refs.chain.querySelectorAll('.scheme-chip');
      if (rows[0]) rows[0].classList.add('highlight');
      if (ctx.reduced) return;
      const p = packet({ x: 540, y: 80, cat: 'control' });
      s.refs.packetLayer.appendChild(p);
      ctx.register(animateAlong(p, [[540, 80], [620, 80]], { duration: 900 }));
      // Fade out AFTER the packet has fully arrived at the destination block.
      ctx.register(p.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 200, delay: 900, fill: 'forwards', easing: 'ease-in' }));
      ctx.register(pulse(rows[0], { duration: 700, iterations: 1 }));
    },
  },
  {
    id: 'pleg',
    duration: 2000,
    narration: 'PLEG (Pod Lifecycle Event Generator) wakes on its 1s timer, calls ListContainers on the runtime, and sees no containers for the new Pod. The empty observed state is recorded for SyncPod to act on.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setVal(s.refs.observedChip, '0 containers');
      setVal(s.refs.lastOpChip, 'ListContainers');
      setWire(s, 'rt', 'ListContainers');
      s.refs.kubelet.classList.add('highlight');
      s.refs.runtime.classList.add('highlight');
      s.refs.observedChip.classList.add('highlight');
      s.refs.lastOpChip.classList.add('highlight');
      const rows = s.refs.chain.querySelectorAll('.scheme-chip');
      if (rows[1]) rows[1].classList.add('highlight');
      if (ctx.reduced) return;
      const p1 = packet({ x: 840, y: 80, cat: 'control' });
      s.refs.packetLayer.appendChild(p1);
      ctx.register(animateAlong(p1, [[840, 80], [920, 80]], { duration: 700 }));
      ctx.register(p1.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 200, delay: 700, fill: 'forwards', easing: 'ease-in' }));
      const p2 = packet({ x: 920, y: 110, cat: 'control' });
      p2.style.opacity = '0';
      s.refs.packetLayer.appendChild(p2);
      ctx.register(p2.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 100, delay: 800, fill: 'forwards' }));
      ctx.register(p2.animate(
        [{ transform: 'translate(920px, 110px)' }, { transform: 'translate(840px, 110px)' }],
        { duration: 700, delay: 800, fill: 'forwards', easing: 'ease-in-out' }
      ));
      ctx.register(p2.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 200, delay: 800 + 700, fill: 'forwards', easing: 'ease-in' }));
      ctx.register(pulse(rows[1], { duration: 700, iterations: 1 }));
    },
  },
  {
    id: 'syncpod',
    duration: 1900,
    narration: 'SyncPod runs for the new Pod, comparing desired state (1 container in spec) against observed state (0 containers). The diff is a single action: create and start the missing container. The Pod\'s worker goroutine drives that sequence directly, with no separate action queue involved.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      s.refs.kubelet.classList.add('highlight');
      s.refs.desiredChip.classList.add('highlight');
      s.refs.observedChip.classList.add('highlight');
      const rows = s.refs.chain.querySelectorAll('.scheme-chip');
      if (rows[2]) rows[2].classList.add('highlight');
      if (ctx.reduced) return;
      ctx.register(pulse(rows[2], { duration: 800, iterations: 1 }));
    },
  },
  {
    id: 'cri',
    duration: 2400,
    narration: 'Kubelet issues CRI gRPC calls in sequence: RunPodSandbox creates the pause container with shared namespaces, then CreateContainer + StartContainer launch each container in the spec. Details of the sandbox setup are covered in the Pod Sandbox via CRI card.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setVal(s.refs.lastOpChip, 'StartContainer');
      setWire(s, 'rt', 'RunPodSandbox · Create · Start');
      s.refs.kubelet.classList.add('highlight');
      s.refs.runtime.classList.add('highlight');
      s.refs.lastOpChip.classList.add('highlight');
      const rows = s.refs.chain.querySelectorAll('.scheme-chip');
      if (rows[3]) rows[3].classList.add('highlight');
      if (ctx.reduced) return;
      // Three packets sequenced for RunPodSandbox, CreateContainer, StartContainer.
      [0, 700, 1400].forEach(delay => {
        const p = packet({ x: 840, y: 80, cat: 'control' });
        p.style.opacity = '0';
        s.refs.packetLayer.appendChild(p);
        ctx.register(p.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 80, delay, fill: 'forwards' }));
        ctx.register(p.animate(
          [{ transform: 'translate(840px, 80px)' }, { transform: 'translate(920px, 80px)' }],
          { duration: 600, delay, fill: 'forwards', easing: 'linear' }
        ));
        ctx.register(p.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 100, delay: delay + 600, fill: 'forwards' }));
      });
      ctx.register(pulse(rows[3], { duration: 800, iterations: 1 }));
    },
  },
  {
    id: 'status',
    duration: 2000,
    narration: 'Next PLEG cycle observes the running container, observed state catches up to desired state, and SyncPod issues no new CRI calls. Kubelet PATCHes Pod status (containerStatuses) back to ApiServer. The loop is ready for the next change.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setVal(s.refs.observedChip, '1 running');
      setVal(s.refs.lastOpChip, 'ListContainers');
      setWire(s, 'api', 'PATCH .../pods/{name}/status');
      s.refs.kubelet.classList.add('highlight');
      s.refs.api.classList.add('highlight');
      s.refs.observedChip.classList.add('highlight');
      const rows = s.refs.chain.querySelectorAll('.scheme-chip');
      if (rows[4]) rows[4].classList.add('highlight');
      if (ctx.reduced) return;
      const p = packet({ x: 620, y: 110, cat: 'control' });
      s.refs.packetLayer.appendChild(p);
      ctx.register(animateAlong(p, [[620, 110], [540, 110]], { duration: 900 }));
      // Fade out AFTER the packet has fully arrived at the destination block.
      ctx.register(p.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 200, delay: 900, fill: 'forwards', easing: 'ease-in' }));
      ctx.register(pulse(rows[4], { duration: 800, iterations: 1 }));
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
