import { svg, g, rect, text } from '../lib/svg.js';
import { arrowDefs, box, pod, node, chainList, setChainActive, arrow, pathArrow, packet, animateAlong, pulse } from '../lib/primitives.js';
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

function setBoxSublabel(boxEl, txt) {
  const sub = boxEl.querySelector('.scheme-box-sublabel');
  if (sub) sub.textContent = txt;
}
function setPodSublabel(podEl, txt) {
  const sub = podEl.querySelector('.scheme-pod-sublabel');
  if (sub) sub.textContent = txt;
}

class Scene {
  constructor(host) { this.host = host; this.refs = {}; this.build(); }

  build() {
    this.host.replaceChildren();
    this.refs = {};
    const root = svg({
      class: 'diagram',
      viewBox: '0 0 1200 640',
      preserveAspectRatio: 'xMidYMid meet',
      'aria-label': 'Pod sandbox via CRI: RunPodSandbox creates the pause container, CNI attaches the network, PullImage, CreateContainer and StartContainer launch the workload inside the sandbox',
      'data-style': 'outline',
    });
    root.appendChild(arrowDefs());

    const kubelet = box({ x: 300, y: 40, w: 200, h: 80, label: 'Kubelet',    sublabel: 'CRI client',      cat: 'control' });
    const runtime = box({ x: 560, y: 40, w: 280, h: 80, label: 'containerd', sublabel: 'CRI gRPC server', cat: 'control' });
    const cni     = box({ x: 900, y: 40, w: 200, h: 80, label: 'CNI plugin', sublabel: 'veth + IPAM',     cat: 'control' });

    // Top arrows, symmetric about each box centre (y=80, so +/-15 -> 65 and 95).
    root.appendChild(arrow({ x1: 500, y1: 65, x2: 560, y2: 65, dim: true, dashed: true, color: 'control' }));
    root.appendChild(arrow({ x1: 560, y1: 95, x2: 500, y2: 95, dim: true, dashed: true, color: 'control' }));
    root.appendChild(arrow({ x1: 840, y1: 65, x2: 900, y2: 65, dim: true, dashed: true, color: 'control' }));
    root.appendChild(arrow({ x1: 900, y1: 95, x2: 840, y2: 95, dim: true, dashed: true, color: 'control' }));

    const wireKR = text({ class: 'scheme-label code dim', x: 530, y: 144, 'text-anchor': 'middle', 'font-size': 9 }, [' ']);
    const wireRC = text({ class: 'scheme-label code dim', x: 870, y: 144, 'text-anchor': 'middle', 'font-size': 9 }, [' ']);
    [wireKR, wireRC].forEach(t => root.appendChild(t));

    const chain = chainList({
      x: 60, y: 196, w: 470, rowH: 32, gap: 10,
      items: [
        '1. RunPodSandbox   ·  pause container, shared namespaces',
        '2. CNI ADD         ·  veth pair, IPAM, route',
        '3. PullImage       ·  fetch image (skipped if cached)',
        '4. CreateContainer ·  cgroups, mounts, env',
        '5. StartContainer  ·  fork ENTRYPOINT inside sandbox',
      ],
      cat: 'control',
    });

    const sandboxChip = valChip({ x: 800, y: 196, w: 380, h: 32, name: 'sandbox id', value: 'none' });
    const ipChip      = valChip({ x: 800, y: 238, w: 380, h: 32, name: 'Pod IP',     value: 'none' });
    const statusChip  = valChip({ x: 800, y: 280, w: 380, h: 32, name: 'status',     value: 'none' });
    const lastOpChip  = valChip({ x: 800, y: 322, w: 380, h: 32, name: 'last op',    value: 'none' });
    [sandboxChip, ipChip, statusChip, lastOpChip].forEach(c => root.appendChild(c));

    // Node centred under containerd (centre x=700) so the connector drops straight in.
    const nodeEl = node({ x: 320, y: 460, w: 760, h: 160, label: 'Node-1' });

    // The Pod sandbox: shell holds the pause container (created at RunPodSandbox)
    // and the workload container (created at CreateContainer, started at StartContainer).
    // Centred in the node (centre x=700) too.
    const podShell = pod({ x: 470, y: 482, w: 460, h: 116, label: 'Pod sandbox', sublabel: ' ', containers: 0, cat: 'workloads' });
    podShell.style.setProperty('--workloads-color', '#c0b0ff');
    const podShellRect = podShell.querySelector('.scheme-pod-rect');
    if (podShellRect) podShellRect.style.fill = 'rgba(255, 255, 255, 0.03)';

    const pauseBox = box({ x: 492, y: 512, w: 190, h: 54, label: 'pause', sublabel: 'netns · IPC · UTS', cat: 'workloads' });
    pauseBox.style.setProperty('--workloads-color', '#c0b0ff');
    const appBox = box({ x: 718, y: 512, w: 190, h: 54, label: 'app', sublabel: 'ENTRYPOINT', cat: 'workloads' });
    appBox.style.setProperty('--workloads-color', '#c0b0ff');

    // sandboxGroup (shell + pause) appears together at RunPodSandbox; appGroup later.
    const sandboxGroup = g({ id: 'sandboxGroup' });
    sandboxGroup.appendChild(podShell);
    sandboxGroup.appendChild(pauseBox);
    const appGroup = g({ id: 'appGroup' });
    appGroup.appendChild(appBox);

    // The runtime does the work on the node: connector drops straight into the node top centre.
    const connector = pathArrow({
      points: [[700, 120], [700, 460]],
      dim: true, dashed: true, color: 'control',
    });
    root.appendChild(connector);

    const packetLayer = g({ id: 'packetLayer' });

    root.appendChild(chain);
    root.appendChild(nodeEl);
    root.appendChild(sandboxGroup);
    root.appendChild(appGroup);
    root.appendChild(kubelet);
    root.appendChild(runtime);
    root.appendChild(cni);
    root.appendChild(packetLayer);

    this.host.appendChild(root);
    this.refs = {
      svg: root,
      kubelet, runtime, cni, chain, nodeEl, connector,
      sandboxGroup, appGroup, podShell, pauseBox, appBox,
      sandboxChip, ipChip, statusChip, lastOpChip,
      packetLayer,
      wires: { kr: wireKR, rc: wireRC },
    };
  }

  reset() { this.build(); }
}

function clearHL(s) {
  ['kubelet','runtime','cni','sandboxChip','ipChip','statusChip','lastOpChip']
    .forEach(k => s.refs[k].classList.remove('highlight'));
  s.refs.chain.querySelectorAll('.scheme-chip').forEach(r => r.classList.remove('highlight'));
  clearPodHighlight(s, s.refs.sandboxGroup);
  clearPodHighlight(s, s.refs.appGroup);
}
function clearWires(s) {
  Object.values(s.refs.wires).forEach(t => { t.textContent = ''; });
}
function setWire(s, key, txt) {
  if (s.refs.wires[key]) s.refs.wires[key].textContent = txt;
}

// Pod is recoloured violet (--workloads-color #c0b0ff), so the pulse tint matches it.
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
// Pulse every highlighted top-row block / chip this step (pods excepted, they use pulsePod).
// Timeline only auto-pulses blocks highlighted for the first time, so blocks that stay
// highlighted across consecutive steps (containerd, status chip) would otherwise sit still.
function pulseActiveBlocks(s, ctx) {
  const FRAMES = [
    { filter: 'brightness(1)' }, { filter: 'brightness(1.55)' }, { filter: 'brightness(1)' },
  ];
  ['kubelet', 'runtime', 'cni', 'sandboxChip', 'ipChip', 'statusChip', 'lastOpChip'].forEach(k => {
    const el = s.refs[k];
    if (el && el.classList.contains('highlight')) {
      ctx.register(el.animate(FRAMES, { duration: 600, iterations: 1, easing: 'ease-out' }));
    }
  });
}
// Runtime (containerd) acting on the Pod on the node, down the vertical connector.
function connectorPacket(s, ctx, { delay = 0, dur = 1000 } = {}) {
  const pts = [[700, 120], [700, 460]];
  const p = packet({ x: pts[0][0], y: pts[0][1], cat: 'control' });
  p.style.opacity = '0';
  s.refs.packetLayer.appendChild(p);
  const fadeInDelay = Math.max(0, delay - 200);
  ctx.register(p.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 200, delay: fadeInDelay, fill: 'forwards', easing: 'ease-out' }));
  ctx.register(animateAlong(p, pts, { duration: dur, delay }));
  ctx.register(p.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 200, delay: delay + dur, fill: 'forwards', easing: 'ease-in' }));
}
// Short packet along one of the top gRPC / CNI arrows.
function wirePacket(s, ctx, from, to, { delay = 0, dur = 800 } = {}) {
  const p = packet({ x: from[0], y: from[1], cat: 'control' });
  s.refs.packetLayer.appendChild(p);
  ctx.register(animateAlong(p, [from, to], { duration: dur, delay }));
  ctx.register(p.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 200, delay: delay + dur, fill: 'forwards', easing: 'ease-in' }));
}

const STEPS = [
  {
    id: 'idle',
    duration: 1500,
    narration: 'Kubelet talks to the container runtime over a Unix socket via the Container Runtime Interface (CRI). Bringing a Pod up takes four CRI gRPC calls. The runtime in turn invokes a CNI plugin for Pod networking, which is an exec of a binary, not a gRPC.',
    enter(s) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      s.refs.sandboxGroup.style.opacity = '0';
      s.refs.appGroup.style.opacity = '0';
      setPodSublabel(s.refs.podShell, ' ');
      setBoxSublabel(s.refs.appBox, 'ENTRYPOINT');
      setVal(s.refs.sandboxChip, 'none');
      setVal(s.refs.ipChip, 'none');
      setVal(s.refs.statusChip, 'none');
      setVal(s.refs.lastOpChip, 'none');
      setChainActive(s.refs.chain, -1);
    },
  },
  {
    id: 'sandbox',
    duration: 2100,
    narration: 'Kubelet calls RunPodSandbox with the Pod namespace, labels, and resource hints. The runtime creates a pause container that holds the network, IPC, and UTS namespaces every workload container will share by default. The PID namespace is shared only when spec.shareProcessNamespace is set.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      s.refs.appGroup.style.opacity = '0';
      setPodSublabel(s.refs.podShell, 'sandbox ready');
      setVal(s.refs.sandboxChip, 'pause-7f3a');
      setVal(s.refs.statusChip, 'sandbox ready');
      setVal(s.refs.lastOpChip, 'RunPodSandbox');
      setWire(s, 'kr', 'RunPodSandbox');
      s.refs.kubelet.classList.add('highlight');
      s.refs.runtime.classList.add('highlight');
      s.refs.sandboxChip.classList.add('highlight');
      s.refs.lastOpChip.classList.add('highlight');
      setChainActive(s.refs.chain, 0);
      // Pin final state inline so cancel does not flash to default.
      s.refs.sandboxGroup.style.opacity = '1';
      if (ctx.reduced) return;
      pulseActiveBlocks(s, ctx);
      // gRPC to the runtime, then the runtime materialises the sandbox on the node.
      wirePacket(s, ctx, [500, 65], [560, 65], { dur: 700 });
      connectorPacket(s, ctx, { delay: 700, dur: 900 });
      ctx.register(s.refs.sandboxGroup.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 500, delay: 1600, fill: 'both', easing: 'ease-out' }));
      pulsePod(s, ctx, s.refs.sandboxGroup, 1600);
    },
  },
  {
    id: 'cni',
    duration: 2200,
    narration: 'As part of sandbox setup the runtime invokes the configured CNI plugin with the sandbox netns path. The plugin creates a veth pair, allocates an IP via IPAM, configures routes, and returns the result. The Pod IP is now set on the sandbox.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      s.refs.appGroup.style.opacity = '0';
      setPodSublabel(s.refs.podShell, 'IP 10.244.1.5');
      setVal(s.refs.ipChip, '10.244.1.5');
      setVal(s.refs.statusChip, 'sandbox ready · IP set');
      setVal(s.refs.lastOpChip, 'CNI ADD');
      setWire(s, 'rc', 'ADD · netns + IPAM');
      s.refs.runtime.classList.add('highlight');
      s.refs.cni.classList.add('highlight');
      s.refs.ipChip.classList.add('highlight');
      setChainActive(s.refs.chain, 1);
      s.refs.sandboxGroup.style.opacity = '1';
      if (ctx.reduced) return;
      pulseActiveBlocks(s, ctx);
      // Runtime execs CNI (right arrow), then the netns config lands on the sandbox.
      wirePacket(s, ctx, [840, 65], [900, 65], { dur: 700 });
      connectorPacket(s, ctx, { delay: 700, dur: 900 });
      pulsePod(s, ctx, s.refs.sandboxGroup, 1600);
    },
  },
  {
    id: 'image',
    duration: 1900,
    narration: 'Kubelet calls PullImage for each container in the Pod, respecting imagePullPolicy and imagePullSecrets. The runtime fetches the image from the registry into the node image store, or reuses a cached layer set if it is already local. No container exists yet.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      s.refs.appGroup.style.opacity = '0';
      setVal(s.refs.statusChip, 'image cached');
      setVal(s.refs.lastOpChip, 'PullImage');
      setWire(s, 'kr', 'PullImage · nginx:1.27');
      s.refs.kubelet.classList.add('highlight');
      s.refs.runtime.classList.add('highlight');
      s.refs.statusChip.classList.add('highlight');
      setChainActive(s.refs.chain, 2);
      s.refs.sandboxGroup.style.opacity = '1';
      if (ctx.reduced) return;
      pulseActiveBlocks(s, ctx);
      // Image fetch is a kubelet -> runtime gRPC only. The Pod does not change yet.
      wirePacket(s, ctx, [500, 65], [560, 65], { dur: 700 });
    },
  },
  {
    id: 'create',
    duration: 2100,
    narration: 'Kubelet calls CreateContainer with the sandbox id, container config (command, env, mounts), and resource limits. The runtime sets up cgroups, prepares the mounts, and returns a container id. The container now exists in the sandbox but is not yet running.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setBoxSublabel(s.refs.appBox, 'created · not started');
      setVal(s.refs.statusChip, 'created (not started)');
      setVal(s.refs.lastOpChip, 'CreateContainer');
      setWire(s, 'kr', 'CreateContainer');
      s.refs.kubelet.classList.add('highlight');
      s.refs.runtime.classList.add('highlight');
      s.refs.statusChip.classList.add('highlight');
      setChainActive(s.refs.chain, 3);
      s.refs.sandboxGroup.style.opacity = '1';
      // Pinned dim: the container exists but is not running.
      s.refs.appGroup.style.opacity = '0.45';
      if (ctx.reduced) return;
      pulseActiveBlocks(s, ctx);
      wirePacket(s, ctx, [500, 65], [560, 65], { dur: 700 });
      connectorPacket(s, ctx, { delay: 700, dur: 900 });
      ctx.register(s.refs.appGroup.animate([{ opacity: 0 }, { opacity: 0.45 }], { duration: 500, delay: 1600, fill: 'both', easing: 'ease-out' }));
      pulsePod(s, ctx, s.refs.appGroup, 1600);
    },
  },
  {
    id: 'start',
    duration: 2300,
    narration: 'Kubelet calls StartContainer with the container id. The runtime forks the container ENTRYPOINT process inside the shared namespaces of the sandbox. The Pod workload is now running and the Pod reports Ready once its probes pass.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setBoxSublabel(s.refs.appBox, 'running');
      setVal(s.refs.statusChip, 'running');
      setVal(s.refs.lastOpChip, 'StartContainer');
      setWire(s, 'kr', 'StartContainer');
      s.refs.kubelet.classList.add('highlight');
      s.refs.runtime.classList.add('highlight');
      s.refs.statusChip.classList.add('highlight');
      s.refs.lastOpChip.classList.add('highlight');
      setChainActive(s.refs.chain, 4);
      s.refs.sandboxGroup.style.opacity = '1';
      // Pinned full: the container is running.
      s.refs.appGroup.style.opacity = '1';
      if (ctx.reduced) return;
      pulseActiveBlocks(s, ctx);
      wirePacket(s, ctx, [500, 65], [560, 65], { dur: 700 });
      connectorPacket(s, ctx, { delay: 700, dur: 900 });
      ctx.register(s.refs.appGroup.animate([{ opacity: 0.45 }, { opacity: 1 }], { duration: 600, delay: 1600, fill: 'both', easing: 'ease-out' }));
      pulsePod(s, ctx, s.refs.appGroup, 1600);
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
