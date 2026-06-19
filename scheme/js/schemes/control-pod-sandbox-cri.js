import { svg, g, text } from '../lib/svg.js';
import { arrowDefs, box, pod, node, chainList, setChainActive, arrow, pathArrow } from '../lib/primitives.js';
import { valChip, setVal, setBoxSublabel, setPodSublabel, pulsePod, routePacket, topPacket, makeInit, clearHighlights, clearWires, setWire, FADE, BEAT } from '../lib/control-kit.js';

class Scene {
  constructor(host) { this.host = host; this.refs = {}; this.build(); }

  build() {
    this.host.replaceChildren();
    this.refs = {};
    const root = svg({
      class: 'diagram',
      viewBox: '0 20 1200 620',
      preserveAspectRatio: 'xMidYMid meet',
      'aria-label': 'Pod sandbox via CRI: RunPodSandbox creates the pause container, CNI attaches the network, PullImage, CreateContainer and StartContainer launch the workload inside the sandbox',
      'data-style': 'outline',
    });
    root.appendChild(arrowDefs());

    const kubelet = box({ x: 300, y: 40, w: 200, h: 80, label: 'Kubelet',    sublabel: 'CRI client',      cat: 'control' });
    const runtime = box({ x: 560, y: 40, w: 280, h: 80, label: 'Containerd', sublabel: 'CRI gRPC server', cat: 'control' });
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

    // Node centred under Containerd (centre x=700) so the connector drops straight in.
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

    // Z-order canon: packetLayer rides above the static wires but below the
    // blocks, so the ball reads on its connector and arrival is told by the pulse
    // (matches every other node card; the center connector travels in open space).
    const packetLayer = g({ id: 'packetLayer' });
    root.appendChild(packetLayer);

    root.appendChild(chain);
    root.appendChild(nodeEl);
    root.appendChild(sandboxGroup);
    root.appendChild(appGroup);
    root.appendChild(kubelet);
    root.appendChild(runtime);
    root.appendChild(cni);

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
  clearHighlights(s,
    ['kubelet','runtime','cni','sandboxChip','ipChip','statusChip','lastOpChip'],
    [s.refs.sandboxGroup, s.refs.appGroup]);
}

const SANDBOX_CONNECTOR = [[700, 120], [700, 460]];

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
      // gRPC to the runtime, then the runtime materialises the sandbox on the node.
      const grpc = topPacket(s, ctx, { from: 500, to: 560 });
      const run = routePacket(s, ctx, SANDBOX_CONNECTOR, { delay: grpc.arrivalMs + BEAT.afterHop });
      ctx.register(s.refs.sandboxGroup.animate([{ opacity: 0 }, { opacity: 1 }], { duration: FADE.in, delay: run.arrivalMs, fill: 'both', easing: 'ease-out' }));
      pulsePod(s.refs.sandboxGroup, ctx, run.arrivalMs);
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
      // Runtime execs CNI (right arrow), then the netns config lands on the sandbox.
      const exec = topPacket(s, ctx, { from: 840, to: 900 });
      const conf = routePacket(s, ctx, SANDBOX_CONNECTOR, { delay: exec.arrivalMs + BEAT.afterHop });
      pulsePod(s.refs.sandboxGroup, ctx, conf.arrivalMs);
    },
  },
  {
    id: 'image',
    duration: 1900,
    narration: 'Kubelet calls PullImage for each container in the Pod, respecting imagePullPolicy and imagePullSecrets. The runtime fetches the image from the registry into the Node image store, or reuses a cached layer set if it is already local. No container exists yet.',
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
      // Image fetch is a kubelet -> runtime gRPC only. The Pod does not change yet.
      topPacket(s, ctx, { from: 500, to: 560 });
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
      // gRPC to the runtime, then the created (not started) container lands dim.
      const grpc = topPacket(s, ctx, { from: 500, to: 560 });
      const create = routePacket(s, ctx, SANDBOX_CONNECTOR, { delay: grpc.arrivalMs + BEAT.afterHop });
      ctx.register(s.refs.appGroup.animate([{ opacity: 0 }, { opacity: 0.45 }], { duration: FADE.in, delay: create.arrivalMs, fill: 'both', easing: 'ease-out' }));
      pulsePod(s.refs.appGroup, ctx, create.arrivalMs);
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
      // gRPC to the runtime, then the ENTRYPOINT forks and the container brightens.
      const grpc = topPacket(s, ctx, { from: 500, to: 560 });
      const start = routePacket(s, ctx, SANDBOX_CONNECTOR, { delay: grpc.arrivalMs + BEAT.afterHop });
      ctx.register(s.refs.appGroup.animate([{ opacity: 0.45 }, { opacity: 1 }], { duration: FADE.in, delay: start.arrivalMs, fill: 'both', easing: 'ease-out' }));
      pulsePod(s.refs.appGroup, ctx, start.arrivalMs);
    },
  },
];

export const init = makeInit(Scene, STEPS, { posterFirst: true });
