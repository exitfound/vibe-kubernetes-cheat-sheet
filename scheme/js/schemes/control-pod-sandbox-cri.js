import { svg, g, text } from '../lib/svg.js';
import { arrowDefs, box, pod, node, chainList, setChainActive, arrow, pathArrow } from '../lib/primitives.js';
import { valChip, setVal, setBoxSublabel, setPodSublabel, pulsePod, clearPodHighlight, pulseActiveBlocks, packetAlong, wirePacket, makeInit } from '../lib/control-kit.js';

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
  clearPodHighlight(s.refs.sandboxGroup);
  clearPodHighlight(s.refs.appGroup);
}
function clearWires(s) {
  Object.values(s.refs.wires).forEach(t => { t.textContent = ''; });
}
function setWire(s, key, txt) {
  if (s.refs.wires[key]) s.refs.wires[key].textContent = txt;
}

// Top blocks/chips that stay highlighted across steps and so need an explicit pulse.
const ACTIVE_KEYS = ['kubelet', 'runtime', 'cni', 'sandboxChip', 'ipChip', 'statusChip', 'lastOpChip'];
const SANDBOX_CONNECTOR = [[700, 120], [700, 460]];
// Runtime (containerd) acting on the Pod on the node, down the vertical connector.
function connectorPacket(s, ctx, { delay = 0, dur = 1000 } = {}) {
  return packetAlong(s.refs.packetLayer, ctx, SANDBOX_CONNECTOR, { delay, dur });
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
      pulseActiveBlocks(s, ctx, ACTIVE_KEYS);
      // gRPC to the runtime, then the runtime materialises the sandbox on the node.
      wirePacket(s, ctx, [500, 65], [560, 65], { dur: 700 });
      connectorPacket(s, ctx, { delay: 700, dur: 900 });
      ctx.register(s.refs.sandboxGroup.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 500, delay: 1600, fill: 'both', easing: 'ease-out' }));
      pulsePod(s.refs.sandboxGroup, ctx, 1600);
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
      pulseActiveBlocks(s, ctx, ACTIVE_KEYS);
      // Runtime execs CNI (right arrow), then the netns config lands on the sandbox.
      wirePacket(s, ctx, [840, 65], [900, 65], { dur: 700 });
      connectorPacket(s, ctx, { delay: 700, dur: 900 });
      pulsePod(s.refs.sandboxGroup, ctx, 1600);
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
      pulseActiveBlocks(s, ctx, ACTIVE_KEYS);
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
      pulseActiveBlocks(s, ctx, ACTIVE_KEYS);
      wirePacket(s, ctx, [500, 65], [560, 65], { dur: 700 });
      connectorPacket(s, ctx, { delay: 700, dur: 900 });
      ctx.register(s.refs.appGroup.animate([{ opacity: 0 }, { opacity: 0.45 }], { duration: 500, delay: 1600, fill: 'both', easing: 'ease-out' }));
      pulsePod(s.refs.appGroup, ctx, 1600);
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
      pulseActiveBlocks(s, ctx, ACTIVE_KEYS);
      wirePacket(s, ctx, [500, 65], [560, 65], { dur: 700 });
      connectorPacket(s, ctx, { delay: 700, dur: 900 });
      ctx.register(s.refs.appGroup.animate([{ opacity: 0.45 }, { opacity: 1 }], { duration: 600, delay: 1600, fill: 'both', easing: 'ease-out' }));
      pulsePod(s.refs.appGroup, ctx, 1600);
    },
  },
];

export const init = makeInit(Scene, STEPS);
