import { svg, g, rect, text } from '../lib/svg.js';
import { arrowDefs, pod, node, box, chainList, setChainActive, arrow, pathArrow, packet, animateAlong, pulse } from '../lib/primitives.js';
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
      'aria-label': 'Graceful node shutdown: systemd inhibitor lock, priority-ordered Pod termination',
      'data-style': 'outline',
    });
    root.appendChild(arrowDefs());

    const kubelet = box({ x: 320, y: 40, w: 220, h: 80, label: 'Kubelet', sublabel: 'shutdown manager', cat: 'control' });
    const systemd = box({ x: 580, y: 40, w: 220, h: 80, label: 'systemd', sublabel: 'inhibitor lock',   cat: 'control' });

    root.appendChild(arrow({ x1: 580, y1: 65, x2: 540, y2: 65, dim: true, dashed: true, color: 'control' }));
    root.appendChild(arrow({ x1: 540, y1: 95, x2: 580, y2: 95, dim: true, dashed: true, color: 'control' }));

    // Wire label (font-size: 9) centred in the 40px gap below the top row, populated per step.
    const wireSig = text({ class: 'scheme-label code dim', x: 560, y: 148, 'text-anchor': 'middle', 'font-size': 9 }, [' ']);
    root.appendChild(wireSig);

    const lockChip     = valChip({ x: 830, y: 40,  w: 350, h: 32, name: 'inhibitor lock',                   value: 'held by kubelet' });
    const gpChip       = valChip({ x: 830, y: 82,  w: 350, h: 32, name: 'shutdownGracePeriod',              value: '60s' });
    const gpCritChip   = valChip({ x: 830, y: 124, w: 350, h: 32, name: 'shutdownGracePeriodCriticalPods', value: '20s' });
    const phaseChip    = valChip({ x: 830, y: 166, w: 350, h: 32, name: 'phase',                            value: 'normal' });
    [lockChip, gpChip, gpCritChip, phaseChip].forEach(c => root.appendChild(c));

    const chain = chainList({
      x: 320, y: 220, w: 480, rowH: 32, gap: 10,
      items: [
        '1. signal   ·  systemd PrepareForShutdown over D-Bus',
        '2. cordon   ·  reject new Pods, bucket by priority',
        '3. normal   ·  SIGTERM non-critical, await up to 40s',
        '4. critical ·  SIGTERM critical, await up to 20s',
        '5. release  ·  drop lock, OS proceeds with shutdown',
      ],
      cat: 'control',
    });

    const nodeEl = node({ x: 320, y: 480, w: 860, h: 140, label: 'Node-1' });

    const POD_SUBS = ['priority: 0', 'priority: 0', 'system-critical'];
    const POD_XS   = [386, 642, 898];
    const podBoxes = [];
    const podWrappers = POD_XS.map((px, i) => {
      const shell = pod({ x: px, y: 497, w: 216, h: 106, label: 'Pod', sublabel: '', containers: 0, cat: 'workloads' });
      shell.style.setProperty('--workloads-color', '#c0b0ff');
      const shellRect = shell.querySelector('.scheme-pod-rect');
      if (shellRect) shellRect.style.fill = 'rgba(255, 255, 255, 0.03)';

      const innerBox = box({ x: px + 30, y: 525, w: 156, h: 52, label: 'app', sublabel: POD_SUBS[i], cat: 'workloads' });
      innerBox.style.setProperty('--workloads-color', '#c0b0ff');

      const wrap = g({ id: `pod${i + 1}` });
      wrap.appendChild(shell);
      wrap.appendChild(innerBox);
      podBoxes.push(innerBox);
      return wrap;
    });
    const [pod1, pod2, pod3] = podWrappers;
    const [pod1Box, pod2Box, pod3Box] = podBoxes;

    const connector = pathArrow({
      points: [[320, 80], [280, 80], [280, 550], [320, 550]],
      dim: true, dashed: true, color: 'control',
    });
    root.appendChild(connector);

    // Packet layer.
    const packetLayer = g({ id: 'packetLayer' });
    root.appendChild(packetLayer);

    root.appendChild(chain);
    root.appendChild(nodeEl);
    root.appendChild(pod1);
    root.appendChild(pod2);
    root.appendChild(pod3);
    root.appendChild(systemd);
    root.appendChild(kubelet);

    this.host.appendChild(root);
    this.refs = {
      svg: root,
      systemd, kubelet, chain, nodeEl, connector,
      lockChip, gpChip, gpCritChip, phaseChip,
      pod1, pod2, pod3, pod1Box, pod2Box, pod3Box,
      packetLayer,
      wires: { sig: wireSig },
    };
  }

  reset() { this.build(); }
}

function clearHL(s) {
  ['systemd','kubelet','lockChip','gpChip','gpCritChip','phaseChip']
    .forEach(k => s.refs[k].classList.remove('highlight'));
  s.refs.chain.querySelectorAll('.scheme-chip').forEach(r => r.classList.remove('highlight'));
  clearPodHighlight(s, s.refs.pod1);
  clearPodHighlight(s, s.refs.pod2);
  clearPodHighlight(s, s.refs.pod3);
}

function clearWires(s) {
  Object.values(s.refs.wires).forEach(t => { t.textContent = ''; });
}

function setWire(s, key, txt) {
  if (s.refs.wires[key]) s.refs.wires[key].textContent = txt;
}

function resetPodOpacity(s) {
  ['pod1','pod2','pod3'].forEach(k => { s.refs[k].style.opacity = '1'; });
}

// Pulse every highlighted top block / chip this step. Timeline auto-pulses only blocks
// highlighted for the first time, so blocks that stay highlighted across consecutive steps
// (kubelet, the phase chip) would otherwise sit still. Pods are excepted (pulsePod).
function pulseActiveBlocks(s, ctx) {
  const FRAMES = [
    { filter: 'brightness(1)' }, { filter: 'brightness(1.55)' }, { filter: 'brightness(1)' },
  ];
  ['kubelet', 'systemd', 'lockChip', 'gpChip', 'gpCritChip', 'phaseChip'].forEach(k => {
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
    id: 'idle',
    duration: 1500,
    narration: 'Node-1 runs three Pods: two non-critical workloads and one critical Pod (PriorityClass system-cluster-critical or system-node-critical, e.g. kube-proxy or a CNI agent). The feature is off by default. Here Kubelet is configured with shutdownGracePeriod=60s and shutdownGracePeriodCriticalPods=20s, so it holds a systemd inhibitor lock while the node runs normally.',
    enter(s) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      resetPodOpacity(s);
      setVal(s.refs.lockChip, 'held by kubelet');
      setVal(s.refs.gpChip, '60s');
      setVal(s.refs.gpCritChip, '20s');
      setVal(s.refs.phaseChip, 'normal');
      // Idle baseline: nothing is happening yet, no chain row highlighted.
      setChainActive(s.refs.chain, -1);
    },
  },
  {
    id: 'signal',
    duration: 2000,
    narration: 'systemd is about to shut down the node (poweroff, reboot, or hibernate) and emits PrepareForShutdown over D-Bus. Kubelet catches the signal via its logind subscription. Its delay-type inhibitor lock makes systemd pause the actual shutdown, so Kubelet can enter shutdown mode rather than let the OS kill processes outright.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      resetPodOpacity(s);
      setVal(s.refs.phaseChip, 'shutdown signal received');
      setWire(s, 'sig', 'PrepareForShutdown · D-Bus');
      s.refs.systemd.classList.add('highlight');
      s.refs.kubelet.classList.add('highlight');
      s.refs.phaseChip.classList.add('highlight');
      setChainActive(s.refs.chain, 0);
      if (ctx.reduced) return;
      pulseActiveBlocks(s, ctx);
      const p = packet({ x: 580, y: 65, cat: 'control' });
      s.refs.packetLayer.appendChild(p);
      ctx.register(animateAlong(p, [[580, 65], [540, 65]], { duration: 800 }));
      ctx.register(p.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 200, delay: 800, fill: 'forwards', easing: 'ease-in' }));
    },
  },
  {
    id: 'cordon',
    duration: 1900,
    narration: 'Kubelet flips its admission state and rejects any new Pod assignments from ApiServer. Existing Pods are listed and bucketed by priority: those at or above the system-cluster-critical threshold (2,000,000,000) form the critical bucket, and the rest are non-critical.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      resetPodOpacity(s);
      setVal(s.refs.phaseChip, 'cordoned · bucketing pods');
      s.refs.kubelet.classList.add('highlight');
      s.refs.phaseChip.classList.add('highlight');
      setChainActive(s.refs.chain, 1);
      if (ctx.reduced) return;
      pulseActiveBlocks(s, ctx);
    },
  },
  {
    id: 'terminate-normal',
    duration: 2700,
    narration: 'Kubelet sends SIGTERM to every non-critical Pod in parallel. They get shutdownGracePeriod minus shutdownGracePeriodCriticalPods to finish (40s with this configuration). Pods that exit early let the phase advance sooner.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setVal(s.refs.phaseChip, 'terminating non-critical · 40s');
      s.refs.kubelet.classList.add('highlight');
      s.refs.phaseChip.classList.add('highlight');
      s.refs.gpChip.classList.add('highlight');
      // Pin final state so cancel between steps does not flash to default.
      s.refs.pod1.style.opacity = '0';
      s.refs.pod2.style.opacity = '0';
      s.refs.pod3.style.opacity = '1';
      setChainActive(s.refs.chain, 2);
      if (ctx.reduced) return;
      pulseActiveBlocks(s, ctx);
      const p = packet({ x: 320, y: 80, cat: 'control' });
      s.refs.packetLayer.appendChild(p);
      ctx.register(animateAlong(p, [[320, 80], [280, 80], [280, 550], [320, 550]], { duration: 1100 }));
      ctx.register(p.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 200, delay: 1100, fill: 'forwards', easing: 'ease-in' }));
      // SIGTERM reaches the node: the non-critical Pods flinch (pulse) then terminate (fade).
      pulsePod(s, ctx, s.refs.pod1, 1100);
      pulsePod(s, ctx, s.refs.pod2, 1100);
      ctx.register(s.refs.pod1.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 1200, delay: 1300, fill: 'both', easing: 'ease-in' }));
      ctx.register(s.refs.pod2.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 1200, delay: 1300, fill: 'both', easing: 'ease-in' }));
    },
  },
  {
    id: 'terminate-critical',
    duration: 2400,
    narration: 'After non-critical Pods are gone (or their grace expired), Kubelet sends SIGTERM to system-critical Pods. They get shutdownGracePeriodCriticalPods (20s here). DaemonSet infra workloads such as CNI or kube-proxy usually sit in this bucket.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setVal(s.refs.phaseChip, 'terminating critical · 20s');
      s.refs.kubelet.classList.add('highlight');
      s.refs.phaseChip.classList.add('highlight');
      s.refs.gpCritChip.classList.add('highlight');
      // Pin final state.
      s.refs.pod1.style.opacity = '0';
      s.refs.pod2.style.opacity = '0';
      s.refs.pod3.style.opacity = '0';
      setChainActive(s.refs.chain, 3);
      if (ctx.reduced) return;
      pulseActiveBlocks(s, ctx);
      const p = packet({ x: 320, y: 80, cat: 'control' });
      s.refs.packetLayer.appendChild(p);
      ctx.register(animateAlong(p, [[320, 80], [280, 80], [280, 550], [320, 550]], { duration: 1100 }));
      ctx.register(p.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 200, delay: 1100, fill: 'forwards', easing: 'ease-in' }));
      // SIGTERM reaches the node: the critical Pod flinches (pulse) then terminates (fade).
      pulsePod(s, ctx, s.refs.pod3, 1100);
      ctx.register(s.refs.pod3.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 1200, delay: 1300, fill: 'both', easing: 'ease-in' }));
    },
  },
  {
    id: 'release',
    duration: 2200,
    narration: 'All Pods are gone or their grace expired. Kubelet releases the inhibitor lock, and systemd resumes the shutdown sequence. While the node is down, the Lease in kube-node-lease grows stale, so the cluster marks it NotReady until kubelet boots back up and resumes renewals.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setVal(s.refs.lockChip, 'released');
      setVal(s.refs.phaseChip, 'lock released · OS shutdown');
      setWire(s, 'sig', 'release lock');
      s.refs.systemd.classList.add('highlight');
      s.refs.kubelet.classList.add('highlight');
      s.refs.lockChip.classList.add('highlight');
      s.refs.phaseChip.classList.add('highlight');
      // Pin final state.
      s.refs.pod1.style.opacity = '0';
      s.refs.pod2.style.opacity = '0';
      s.refs.pod3.style.opacity = '0';
      setChainActive(s.refs.chain, 4);
      if (ctx.reduced) return;
      pulseActiveBlocks(s, ctx);
      const p = packet({ x: 540, y: 95, cat: 'control' });
      s.refs.packetLayer.appendChild(p);
      ctx.register(animateAlong(p, [[540, 95], [580, 95]], { duration: 800 }));
      ctx.register(p.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 200, delay: 800, fill: 'forwards', easing: 'ease-in' }));
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
