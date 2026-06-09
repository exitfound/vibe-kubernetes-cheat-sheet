import { svg, g, rect, text } from '../lib/svg.js';
import { arrowDefs, pod, node, box, cylinder, chainList, setChainActive, arrow, pathArrow, packet, animateAlong, pulse, fadeIn } from '../lib/primitives.js';
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
      viewBox: '0 0 1200 640',
      preserveAspectRatio: 'xMidYMid meet',
      'aria-label': 'Node failure and eviction: lease heartbeat loss, Ready flips to Unknown, NoExecute taint, taint-eviction delete, reschedule',
      'data-style': 'outline',
    });
    root.appendChild(arrowDefs());

    const ctrl  = box({ x: 320, y: 40, w: 320, h: 120, label: 'Kube-controller-manager', sublabel: 'node-lifecycle-controller', cat: 'control' });
    // Lease centred on x=790 so the heartbeat connector drops into its bottom centre.
    const lease = cylinder({ x: 720, y: 30, w: 140, h: 140, label: 'Lease', cat: 'control' });

    // Top-row arrows, symmetric about the box centre (y=100, so +/-15 -> 85 and 115).
    root.appendChild(arrow({ x1: 640, y1: 85,  x2: 720, y2: 85,  dim: true, dashed: true, color: 'control' }));
    root.appendChild(arrow({ x1: 720, y1: 115, x2: 640, y2: 115, dim: true, dashed: true, color: 'control' }));

    // Heartbeat connector: Node-B top centre (510) up and over into the Lease bottom centre (790).
    root.appendChild(pathArrow({
      points: [[510, 480], [510, 470], [790, 470], [790, 170]],
      dim: true, dashed: true, color: 'control',
    }));

    const wireCtrl = text({ class: 'scheme-label code dim', x: 480, y: 188, 'text-anchor': 'middle', 'font-size': 9 }, [' ']);
    root.appendChild(wireCtrl);

    const chain = chainList({
      x: 320, y: 220, w: 460, rowH: 32, gap: 10,
      items: [
        '1. heartbeat   ·  Lease renewed every 10s, Ready=True',
        '2. missed      ·  Kubelet stops renewing',
        '3. NotReady    ·  Ready flips to Unknown after grace',
        '4. tainted     ·  Controller adds NoExecute taint',
        '5. evicted     ·  Toleration expires, Pod deleted',
        '6. rescheduled ·  Scheduler binds replacement',
      ],
      cat: 'control',
    });

    // State chips column on the right, each tracking one Node/Lease/Taint field.
    const readyChip = valChip({ x: 800, y: 220, w: 380, h: 32, name: 'Ready',          value: 'True' });
    const leaseChip = valChip({ x: 800, y: 262, w: 380, h: 32, name: 'Lease age',      value: '2s · Fresh' });
    const taintChip = valChip({ x: 800, y: 304, w: 380, h: 32, name: 'Taint',          value: 'none' });
    const tolerChip = valChip({ x: 800, y: 346, w: 380, h: 32, name: 'Toleration',     value: 'none' });
    const evictChip = valChip({ x: 800, y: 388, w: 380, h: 32, name: 'Eviction timer', value: 'none' });
    [readyChip, leaseChip, taintChip, tolerChip, evictChip].forEach(c => root.appendChild(c));

    // Bottom row: two worker nodes side-by-side. Node-B is the failing one, Node-A the target.
    const nodeB = node({ x: 320, y: 480, w: 380, h: 140, label: 'Node-B' });
    const nodeA = node({ x: 720, y: 480, w: 380, h: 140, label: 'Node-A' });

    const podBShell = pod({ x: 402, y: 497, w: 216, h: 106, label: 'Pod', sublabel: ' ', containers: 0, cat: 'workloads' });
    podBShell.style.setProperty('--workloads-color', '#c0b0ff');
    const podBShellRect = podBShell.querySelector('.scheme-pod-rect');
    if (podBShellRect) podBShellRect.style.fill = 'rgba(255, 255, 255, 0.03)';

    const podBBox = box({ x: 432, y: 525, w: 156, h: 52, label: 'app-pod', sublabel: 'nginx:1.27', cat: 'workloads' });
    podBBox.style.setProperty('--workloads-color', '#c0b0ff');

    const podB = g({ id: 'podB' });
    podB.appendChild(podBShell);
    podB.appendChild(podBBox);

    const podAShell = pod({ x: 802, y: 497, w: 216, h: 106, label: 'Pod', sublabel: ' ', containers: 0, cat: 'workloads' });
    podAShell.style.setProperty('--workloads-color', '#c0b0ff');
    const podAShellRect = podAShell.querySelector('.scheme-pod-rect');
    if (podAShellRect) podAShellRect.style.fill = 'rgba(255, 255, 255, 0.03)';

    const podABox = box({ x: 832, y: 525, w: 156, h: 52, label: 'app-pod', sublabel: 'nginx:1.27', cat: 'workloads' });
    podABox.style.setProperty('--workloads-color', '#c0b0ff');

    const podA = g({ id: 'podA' });
    podA.style.opacity = '0';
    podA.appendChild(podAShell);
    podA.appendChild(podABox);

    const packetLayer = g({ id: 'packetLayer' });
    root.appendChild(packetLayer);

    root.appendChild(chain);
    root.appendChild(nodeB);
    root.appendChild(nodeA);
    root.appendChild(podB);
    root.appendChild(podA);
    root.appendChild(ctrl);
    root.appendChild(lease);

    this.host.appendChild(root);
    this.refs = {
      svg: root,
      ctrl, lease,
      readyChip, leaseChip, taintChip, tolerChip, evictChip,
      chain,
      nodeB, nodeA, podB, podA, podBBox, podABox,
      packetLayer,
      wires: { ctrl: wireCtrl },
    };
  }

  reset() { this.build(); }
}

function clearHL(s) {
  ['ctrl', 'lease', 'readyChip', 'leaseChip', 'taintChip', 'tolerChip', 'evictChip']
    .forEach(k => s.refs[k].classList.remove('highlight'));
  s.refs.chain.querySelectorAll('.scheme-chip').forEach(r => r.classList.remove('highlight'));
  clearPodHighlight(s, s.refs.podB);
  clearPodHighlight(s, s.refs.podA);
}
function clearWires(s) {
  Object.values(s.refs.wires).forEach(t => { t.textContent = ''; });
}
function setWire(s, key, txt) {
  if (s.refs.wires[key]) s.refs.wires[key].textContent = txt;
}
function resetNodeOpacity(s) {
  s.refs.nodeB.style.opacity = '1';
  s.refs.nodeA.style.opacity = '1';
  s.refs.podB.style.opacity = '1';
}

// Pulse every highlighted top block / chip this step. Timeline auto-pulses only blocks
// highlighted for the first time, so blocks that stay highlighted across consecutive steps
// (the controller, sticky chips) would otherwise sit still. Pods are excepted (pulsePod).
function pulseActiveBlocks(s, ctx) {
  const FRAMES = [
    { filter: 'brightness(1)' }, { filter: 'brightness(1.55)' }, { filter: 'brightness(1)' },
  ];
  ['ctrl', 'lease', 'readyChip', 'leaseChip', 'taintChip', 'tolerChip', 'evictChip'].forEach(k => {
    const el = s.refs[k];
    if (el && el.classList.contains('highlight')) {
      ctx.register(el.animate(FRAMES, { duration: 600, iterations: 1, easing: 'ease-out' }));
    }
  });
}

// Pods are recoloured violet (--workloads-color #c0b0ff), so the pulse tint matches them.
const TINT_BASE   = 'rgb(192, 176, 255)';
const TINT_BRIGHT = 'rgb(224, 214, 255)';
function pulsePod(s, ctx, podGroup, delay, { persist = false } = {}) {
  if (!podGroup) return;
  const podShellRect     = podGroup.querySelector('.scheme-pod-rect');
  const containerBoxRect = podGroup.querySelector('.scheme-box-rect');
  const targets = [podShellRect, containerBoxRect].filter(Boolean);
  const PULSE = 900, RAMP = PULSE / 2;
  for (const el of targets) {
    el.style.transition = 'none';
    const up = el.animate([
      { stroke: TINT_BASE,   strokeOpacity: 0.65, strokeWidth: 1.2 },
      { stroke: TINT_BRIGHT, strokeOpacity: 1,    strokeWidth: 2.4 },
    ], { duration: RAMP, delay, fill: 'forwards', easing: 'ease-in-out' });
    ctx.register(up);
    if (persist) {
      up.onfinish = () => { el.style.stroke = TINT_BRIGHT; el.style.strokeOpacity = '1'; el.style.strokeWidth = '2.4'; };
    } else {
      ctx.register(el.animate([
        { stroke: TINT_BRIGHT, strokeOpacity: 1,    strokeWidth: 2.4 },
        { stroke: TINT_BASE,   strokeOpacity: 0.65, strokeWidth: 1.2 },
      ], { duration: RAMP, delay: delay + RAMP, fill: 'forwards', easing: 'ease-in-out' }));
    }
  }
  const BRIGHTNESS_FRAMES = [
    { filter: 'brightness(1)' }, { filter: 'brightness(1.4)' }, { filter: 'brightness(1)' },
  ];
  for (const el of podGroup.querySelectorAll('.scheme-pod, .scheme-box')) {
    ctx.register(el.animate(BRIGHTNESS_FRAMES, { duration: PULSE, delay, fill: 'forwards', easing: 'ease-in-out' }));
  }
}
function clearPodHighlight(s, podGroup) {
  if (!podGroup) return;
  for (const el of podGroup.querySelectorAll('.scheme-pod-rect, .scheme-box-rect')) {
    el.style.stroke = ''; el.style.strokeOpacity = ''; el.style.strokeWidth = ''; el.style.transition = '';
  }
}

const STEPS = [
  {
    id: 'healthy',
    duration: 1500,
    narration: 'Node-B is Ready and a Pod runs on it. The Lease in kube-node-lease is fresh, and the Node-lifecycle-controller sees no anomaly on its watch. Steady state.',
    enter(s) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      resetNodeOpacity(s);
      setVal(s.refs.readyChip, 'True');
      setVal(s.refs.leaseChip, '2s · Fresh');
      setVal(s.refs.taintChip, 'none');
      setVal(s.refs.tolerChip, 'none');
      setVal(s.refs.evictChip, 'none');
      s.refs.podA.style.opacity = '0';
      // Idle baseline: nothing is happening yet, no chain row highlighted.
      setChainActive(s.refs.chain, -1);
    },
  },
  {
    id: 'heartbeat',
    duration: 2400,
    narration: 'Kubelet on Node-B proves liveness with two heartbeats. Every 10s it updates its Lease in kube-node-lease via ApiServer. Every 5 min it PATCHes Node.status (sooner on change). The Node-lifecycle-controller uses the Lease as its primary liveness signal. The high-frequency renewal makes Ready resilient to transient status delays.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      resetNodeOpacity(s);
      setVal(s.refs.readyChip, 'True');
      setVal(s.refs.leaseChip, '2s · Fresh · renewed');
      s.refs.podA.style.opacity = '0';
      setWire(s, 'ctrl', 'kubelet · PUT lease renewTime · every 10s');
      s.refs.lease.classList.add('highlight');
      s.refs.leaseChip.classList.add('highlight');
      setChainActive(s.refs.chain, 0);
      if (ctx.reduced) return;
      pulseActiveBlocks(s, ctx);
      const p = packet({ x: 510, y: 480, cat: 'control' });
      s.refs.packetLayer.appendChild(p);
      ctx.register(animateAlong(p, [[510, 480], [510, 470], [790, 470], [790, 170]], { duration: 2200 }));
      ctx.register(p.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 200, delay: 2200, fill: 'forwards', easing: 'ease-in' }));
    },
  },
  {
    id: 'kubelet-stops',
    duration: 2000,
    narration: 'The Kubelet on Node-B stops renewing (kernel panic, network partition, or Kubelet crash). The Lease grows stale, but Pods on the node keep running for now.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      resetNodeOpacity(s);
      s.refs.podA.style.opacity = '0';
      setVal(s.refs.readyChip, 'True (Stale Lease)');
      setVal(s.refs.leaseChip, '30s · Stale');
      s.refs.readyChip.classList.add('highlight');
      s.refs.leaseChip.classList.add('highlight');
      // Pin opacity inline so cancel between steps does not flash to default.
      s.refs.nodeB.style.opacity = '0.55';
      setChainActive(s.refs.chain, 1);
      if (ctx.reduced) return;
      pulseActiveBlocks(s, ctx);
      ctx.register(s.refs.nodeB.animate([{ opacity: 1 }, { opacity: 0.55 }], { duration: 700, fill: 'forwards', easing: 'ease-in' }));
    },
  },
  {
    id: 'not-ready',
    duration: 2000,
    narration: 'After --node-monitor-grace-period (default 40s), the Node-lifecycle-controller flips Ready from True to Unknown: it cannot tell whether Node-B died or is just unreachable. Pods are still on the node, and eviction has not started.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      s.refs.nodeB.style.opacity = '0.55';
      s.refs.nodeA.style.opacity = '1';
      s.refs.podB.style.opacity = '1';
      s.refs.podA.style.opacity = '0';
      setVal(s.refs.readyChip, 'Unknown · unreachable');
      setVal(s.refs.leaseChip, '42s · Expired');
      s.refs.readyChip.classList.add('highlight');
      s.refs.ctrl.classList.add('highlight');
      setWire(s, 'ctrl', 'PATCH /api/v1/nodes/Node-B/status');
      setChainActive(s.refs.chain, 2);
      if (ctx.reduced) return;
      pulseActiveBlocks(s, ctx);
    },
  },
  {
    id: 'taint-applied',
    duration: 2100,
    narration: 'The controller adds the taint node.kubernetes.io/unreachable:NoExecute. The DefaultTolerationSeconds admission plugin already gave every Pod a 300s toleration for this taint, and that timer now ticks down.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      s.refs.nodeB.style.opacity = '0.55';
      s.refs.nodeA.style.opacity = '1';
      s.refs.podB.style.opacity = '1';
      s.refs.podA.style.opacity = '0';
      setVal(s.refs.taintChip, 'node.kubernetes.io/unreachable:NoExecute');
      setVal(s.refs.tolerChip, 'NoExecute · 300s');
      setVal(s.refs.evictChip, '300s · Counting down');
      s.refs.taintChip.classList.add('highlight');
      s.refs.tolerChip.classList.add('highlight');
      s.refs.evictChip.classList.add('highlight');
      s.refs.ctrl.classList.add('highlight');
      setWire(s, 'ctrl', 'PATCH /api/v1/nodes/Node-B · spec.taints');
      setChainActive(s.refs.chain, 3);
      if (ctx.reduced) return;
      pulseActiveBlocks(s, ctx);
    },
  },
  {
    id: 'evict',
    duration: 2200,
    narration: 'Toleration expires. The taint-eviction-controller deletes the Pod with a plain DELETE that bypasses PodDisruptionBudgets (unlike kubectl drain, which uses the PDB-aware Eviction API). ApiServer removes the Pod from etcd, while the unreachable Node-B still holds the orphaned container.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      s.refs.nodeB.style.opacity = '0.55';
      s.refs.nodeA.style.opacity = '1';
      s.refs.podA.style.opacity = '0';
      setVal(s.refs.evictChip, '0s · Deleted');
      s.refs.evictChip.classList.add('highlight');
      s.refs.ctrl.classList.add('highlight');
      setWire(s, 'ctrl', 'DELETE /api/v1/.../pods/{name} · taint-eviction');
      setChainActive(s.refs.chain, 4);
      // Pin final state so cancel does not snap back to opacity 1.
      s.refs.podB.style.opacity = '0';
      if (ctx.reduced) return;
      pulseActiveBlocks(s, ctx);
      // The Pod flinches (pulse) as the delete lands, then disappears.
      pulsePod(s, ctx, s.refs.podB, 200);
      ctx.register(s.refs.podB.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 800, delay: 700, fill: 'both', easing: 'ease-in' }));
    },
  },
  {
    id: 'reschedule',
    duration: 2200,
    narration: 'The owning controller (Deployment via its ReplicaSet) sees the missing replica and creates a replacement Pod. Scheduler picks the healthy Node-A and Kubelet there starts it. End-to-end recovery takes about 40s plus 300s by default, the grace period plus the toleration.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      s.refs.nodeB.style.opacity = '0.55';
      s.refs.nodeA.style.opacity = '1';
      s.refs.podB.style.opacity = '0';
      s.refs.ctrl.classList.add('highlight');
      setWire(s, 'ctrl', 'Deployment recreates replica · Scheduler binds Node-A');
      setChainActive(s.refs.chain, 5);
      // Pin final state inline.
      s.refs.podA.style.opacity = '1';
      if (ctx.reduced) return;
      pulseActiveBlocks(s, ctx);
      // The replacement Pod materialises on Node-A and pulses as it starts.
      ctx.register(s.refs.podA.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 800, delay: 200, fill: 'both', easing: 'ease-out' }));
      pulsePod(s, ctx, s.refs.podA, 300);
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
