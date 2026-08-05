import { svg, g, text } from '../../lib/svg.js';
import { arrowDefs, box, pod, node, chainList, setChainActive, arrow, pathArrow } from '../../lib/primitives.js';
import { valChip, setVal, setBoxSublabel, setPodSublabel, pulsePod, routePacket, topPacket, makeInit, clearHighlights, clearWires, setWire, FADE, BEAT, lightBoxAt, OPACITY } from './cluster-kit.js';

// Laid out on the L: the narration panel owns the top-left corner and nothing is drawn there.
// Measured worst case over 1600/1440/1280/1100 at heights 1000/860/800 is x<=397, y<=213, and the
// two do NOT peak together: the panel is widest where it is shallow (397 x 92 at 1100x1000) and
// deepest where it is narrow (189 x 213 at 1600x800). Both edges bind something different here,
// the right edge caps the top row at x=404 and the bottom clears the columns at y=235.
const M = 60;
const CONTENT_L = M, CONTENT_R = 1200 - M;               // 60 / 1140
const CX = (CONTENT_L + CONTENT_R) / 2;                  // 600, the canvas centre by construction

// Three actors in the top row, all clear of the panel. The row is anchored on its RIGHT edge and
// built leftwards: CNI ends on CONTENT_R, and the gaps take whatever is left. It used to start at a
// fixed KUBE_X=420 with 30 unit gaps, and read as three boxes shoved together.
//
// 404 is the hard left stop, not a taste. The panel measures x<=397 at 1100 width across every
// height, and the top row lives at y 40..120, which is inside the panel band at that width. Seven
// units is the entire clearance, confirmed on a 1100x1000 render and not just on the number. That
// cap is a viewport-width effect (the panel hits its own max width), not a text-length one, so a
// longer narration cannot eat it: it grows downwards.
//
// So the room for the arrows comes out of the BOXES, which had 70 to 95 units of dead padding per
// side. Measured widest inner label: Kubelet 60 units, containerd 90 ("CRI gRPC server"), CNI 66
// ("veth + IPAM"). The widths below leave 60 / 60 / 57 per side, which is the tight end of the
// family and exactly what CNI already shipped. That buys 83 unit gaps in place of 38, so each
// call/return lane pair has better than twice the run it had.
const TOP_Y = 40, BOX_H = 80, TOP_BOTTOM = TOP_Y + BOX_H;// 40 / 120
const KUBE_W = 180, RT_W = 210, CNI_W = 180, TOP_GAP = 83;
const CNI_X = CONTENT_R - CNI_W, CNI_R = CONTENT_R;      // 960..1140
const RT_R = CNI_X - TOP_GAP, RT_X = RT_R - RT_W;        // 667..877
const KUBE_R = RT_X - TOP_GAP, KUBE_X = KUBE_R - KUBE_W; // 404..584
const LANE_DY = 12, TOP_CY = TOP_Y + BOX_H / 2;          // 80
const CALL_Y = TOP_CY - LANE_DY, BACK_Y = TOP_CY + LANE_DY;  // 68 / 92
const WIRE_Y = TOP_BOTTOM + 24;                          // 144
const WIRE_KR_X = (KUBE_R + RT_X) / 2;                   // 625.5
const WIRE_RC_X = (RT_R + CNI_X) / 2;                    // 918.5

// The left band opens below the panel.
const LADDER_X = CONTENT_L, LADDER_W = 430;              // 60..490, clear of the spine
const LADDER_Y = 235, ROW_H = 32, ROW_GAP = 10;          // 5 rows -> 235..435

const CHIP_X = 620, CHIP_W = CONTENT_R - CHIP_X;         // 520, 620..1140
const CHIP_H = 34, CHIP_GAP = 22;
const CHIP_Y = i => LADDER_Y + i * (CHIP_H + CHIP_GAP);  // 235 / 291 / 347 / 403, bottom 437

const NODE_X = CONTENT_L, NODE_W = CONTENT_R - CONTENT_L;// 60..1140
const NODE_Y = 462, NODE_H = 158;                        // 462..620
const POD_W = 460, POD_H = 116;
const POD_X = CX - POD_W / 2;                            // 370..830
const POD_Y = NODE_Y + 22;                               // 484..600
const INNER_W = 190, INNER_H = 54, INNER_Y = POD_Y + 30; // 514..568
const PAUSE_X = POD_X + 22;                              // 392..582
const APP_X = POD_X + POD_W - 22 - INNER_W;              // 618..808

// The lane from the RUNTIME down into the Node. Moving its start right by 270 units added 244ms to
// every ball that rides it, which put all four steps 131ms over their 2800 budget: they are 3100
// now. routeDur is length-based, so a start point IS a timing decision.
//
// It leaves Kubelet no longer: Kubelet is the one block on this card that never touches the sandbox.
// The whole subject is that it is a CRI CLIENT and containerd is what materialises the pause
// container, pulls, creates and starts. All four steps that ride this lane say so in their narration.
const SPINE_X = RT_X + RT_W / 2;                         // 772
// Design notes for this card: scheme/docs/CARDS.md#cluster-pod-sandbox-cri


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

    const kubelet = box({ x: KUBE_X, y: TOP_Y, w: KUBE_W, h: BOX_H, label: 'Kubelet',    sublabel: 'CRI client',      role: 'cluster' });
    const runtime = box({ x: RT_X,   y: TOP_Y, w: RT_W,   h: BOX_H, label: 'containerd', sublabel: 'CRI gRPC server', role: 'cluster' });
    const cni     = box({ x: CNI_X,  y: TOP_Y, w: CNI_W,  h: BOX_H, label: 'CNI plugin', sublabel: 'veth + IPAM',     role: 'cluster' });

    // Top arrows, symmetric about each box centre (y=80, so +/-15 -> 65 and 95).
    root.appendChild(arrow({ x1: KUBE_R, y1: CALL_Y, x2: RT_X, y2: CALL_Y, dim: true, dashed: true, role: 'cluster' }));
    root.appendChild(arrow({ x1: RT_X, y1: BACK_Y, x2: KUBE_R, y2: BACK_Y, dim: true, dashed: true, role: 'cluster' }));
    root.appendChild(arrow({ x1: RT_R, y1: CALL_Y, x2: CNI_X, y2: CALL_Y, dim: true, dashed: true, role: 'cluster' }));
    root.appendChild(arrow({ x1: CNI_X, y1: BACK_Y, x2: RT_R, y2: BACK_Y, dim: true, dashed: true, role: 'cluster' }));

    const wireKR = text({ class: 'scheme-label code dim', x: WIRE_KR_X, y: WIRE_Y, 'text-anchor': 'middle' }, [' ']);
    const wireRC = text({ class: 'scheme-label code dim', x: WIRE_RC_X, y: WIRE_Y, 'text-anchor': 'middle' }, [' ']);
    [wireKR, wireRC].forEach(t => root.appendChild(t));

    const chain = chainList({
      x: LADDER_X, y: LADDER_Y, w: LADDER_W, rowH: ROW_H, gap: ROW_GAP,
      items: [
        '1. RunPodSandbox   ·  pause container, shared namespaces',
        '2. CNI ADD         ·  veth pair, IPAM, route',
        '3. PullImage       ·  fetch image (skipped if cached)',
        '4. CreateContainer ·  cgroups, mounts, env',
        '5. StartContainer  ·  fork ENTRYPOINT inside sandbox',
      ],
      role: 'cluster',
    });

    const sandboxChip = valChip({ x: CHIP_X, y: CHIP_Y(0), w: CHIP_W, h: CHIP_H, name: 'sandbox id', value: 'none', role: 'cluster' });
    const ipChip      = valChip({ x: CHIP_X, y: CHIP_Y(1), w: CHIP_W, h: CHIP_H, name: 'Pod IP',     value: 'none', role: 'cluster' });
    const statusChip  = valChip({ x: CHIP_X, y: CHIP_Y(2), w: CHIP_W, h: CHIP_H, name: 'status',     value: 'none', role: 'cluster' });
    const lastOpChip  = valChip({ x: CHIP_X, y: CHIP_Y(3), w: CHIP_W, h: CHIP_H, name: 'last op',    value: 'none', role: 'cluster' });
    [sandboxChip, ipChip, statusChip, lastOpChip].forEach(c => root.appendChild(c));

    // Full content width, so its top face midpoint is CX and the zigzag lands dead centre on it.
    const nodeEl = node({ x: NODE_X, y: NODE_Y, w: NODE_W, h: NODE_H, label: 'Node-1' });

    const podShell = pod({ x: POD_X, y: POD_Y, w: POD_W, h: POD_H, label: 'Pod sandbox', sublabel: ' ', containers: 0, role: 'workloads' });
    podShell.style.setProperty('--workloads-color', '#c0b0ff');
    const podShellRect = podShell.querySelector('.scheme-pod-rect');
    if (podShellRect) podShellRect.style.fill = 'rgba(255, 255, 255, 0.03)';

    const pauseBox = box({ x: PAUSE_X, y: INNER_Y, w: INNER_W, h: INNER_H, label: 'pause', sublabel: 'netns · IPC · UTS', role: 'workloads' });
    pauseBox.style.setProperty('--workloads-color', '#c0b0ff');
    const appBox = box({ x: APP_X, y: INNER_Y, w: INNER_W, h: INNER_H, label: 'app', sublabel: 'ENTRYPOINT', role: 'workloads' });
    appBox.style.setProperty('--workloads-color', '#c0b0ff');

    // sandboxGroup (shell + pause) appears together at RunPodSandbox; appGroup later.
    const sandboxGroup = g({ id: 'sandboxGroup' });
    sandboxGroup.appendChild(podShell);
    sandboxGroup.appendChild(pauseBox);
    const appGroup = g({ id: 'appGroup' });
    appGroup.appendChild(appBox);
    // Inside the shell, not beside it: the app container belongs to the Pod, and pulsePod only
    // reaches what the Pod group contains.
    sandboxGroup.appendChild(appGroup);

    // The runtime does the work on the node: connector drops straight into the node top centre.
    const connector = pathArrow({
      points: SANDBOX_CONNECTOR,
      dim: true, dashed: true, role: 'cluster',
    });
    root.appendChild(connector);

    const packetLayer = g({ id: 'packetLayer' });
    root.appendChild(packetLayer);

    root.appendChild(chain);
    root.appendChild(nodeEl);
    root.appendChild(sandboxGroup);
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

// A centred zigzag into the NODE, not into the Pod inside it: off the containerd bottom face
// midpoint, across, then straight down onto the Node frame top face midpoint. Which container the
// step lands on is carried by the pulse, the same correction the four sibling Node cards took.
//
// The turn goes ABOVE both columns, and that is the load-bearing part. containerd sits at x=772,
// which is inside the chip column (620..1140, y 235..437), so the old lane, which turned at y=446
// just above the Node frame, ran its whole 326 unit drop straight through all four chips. The file
// claimed the opposite in a comment ("runs in the corridor ... so it crosses nothing") and every
// check agreed, because check-geometry THROUGH scores blocks and value chips are not blocks. The
// only free horizontal band is 120..235, between the top row and the columns, so the turn sits on
// its midpoint. That leaves the long leg on x=600, in the 490..620 gutter between ladder and chips.
const JOG_Y = (TOP_BOTTOM + LADDER_Y) / 2;               // 177.5, clear of the wire labels at y=144
const SANDBOX_CONNECTOR = [[SPINE_X, TOP_BOTTOM], [SPINE_X, JOG_Y], [CX, JOG_Y], [CX, NODE_Y]];

const STEPS = [
  {
    id: 'idle',
    duration: 1500,
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
    duration: 3100,
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
      s.refs.statusChip.classList.add('highlight');
      setWire(s, 'kr', 'RunPodSandbox');
      s.refs.kubelet.classList.add('highlight');
      s.refs.sandboxChip.classList.add('highlight');
      s.refs.lastOpChip.classList.add('highlight');
      setChainActive(s.refs.chain, 0);
      // Pin final state inline so cancel does not flash to default.
      s.refs.sandboxGroup.style.opacity = '1';
      if (ctx.reduced) { s.refs.runtime.classList.add('highlight'); return; }
      // gRPC to the runtime, then the runtime materialises the sandbox on the node.
      const grpc = topPacket(s, ctx, { from: KUBE_R, to: RT_X, y: CALL_Y, role: 'cluster' });
      lightBoxAt(s.refs.runtime, ctx, grpc.arrivalMs);
      const run = routePacket(s, ctx, SANDBOX_CONNECTOR, { delay: grpc.arrivalMs + BEAT.afterHop, role: 'cluster' });
      ctx.register(s.refs.sandboxGroup.animate([{ opacity: 0 }, { opacity: 1 }], { duration: FADE.in, delay: run.arrivalMs, fill: 'both', easing: 'ease-out' }));
      pulsePod(s.refs.sandboxGroup, ctx, run.arrivalMs);
    },
  },
  {
    id: 'cni',
    duration: 3100,
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
      s.refs.statusChip.classList.add('highlight');
      s.refs.lastOpChip.classList.add('highlight');
      setWire(s, 'rc', 'ADD · netns + IPAM');
      s.refs.runtime.classList.add('highlight');
      s.refs.ipChip.classList.add('highlight');
      setChainActive(s.refs.chain, 1);
      s.refs.sandboxGroup.style.opacity = '1';
      if (ctx.reduced) { s.refs.cni.classList.add('highlight'); return; }
      // Runtime execs CNI (right arrow), then the netns config lands on the sandbox.
      const exec = topPacket(s, ctx, { from: RT_R, to: CNI_X, y: CALL_Y, role: 'cluster' });
      // "returns the result" is in the narration, and the return lane is drawn: it just never carried
      // anything. The result comes back to the runtime before the sandbox is configured below.
      topPacket(s, ctx, { from: CNI_X, to: RT_R, y: BACK_Y, delay: exec.arrivalMs + BEAT.afterHop, role: 'cluster' });
      lightBoxAt(s.refs.cni, ctx, exec.arrivalMs);
      const conf = routePacket(s, ctx, SANDBOX_CONNECTOR, { delay: exec.arrivalMs + BEAT.afterHop, role: 'cluster' });
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
      // "pulled", not "cached": this step draws Kubelet making the PullImage call, and under the
      // default IfNotPresent a cached image is one Kubelet never calls for at all. The chip said
      // cached while the ball said called. The ladder row keeps the cached case in its parenthesis.
      setVal(s.refs.statusChip, 'image pulled');
      setVal(s.refs.lastOpChip, 'PullImage');
      s.refs.lastOpChip.classList.add('highlight');
      setWire(s, 'kr', 'PullImage · nginx:1.27');
      s.refs.kubelet.classList.add('highlight');
      s.refs.statusChip.classList.add('highlight');
      setChainActive(s.refs.chain, 2);
      s.refs.sandboxGroup.style.opacity = '1';
      if (ctx.reduced) { s.refs.runtime.classList.add('highlight'); return; }
      // Image fetch is a kubelet -> runtime gRPC only. The Pod does not change yet.
      const pkt = topPacket(s, ctx, { from: KUBE_R, to: RT_X, y: CALL_Y, role: 'cluster' });
      lightBoxAt(s.refs.runtime, ctx, pkt.arrivalMs);
    },
  },
  {
    id: 'create',
    duration: 3100,
    narration: 'Kubelet calls CreateContainer with the sandbox id, container config (command, env, mounts), and resource limits. The runtime sets up cgroups, prepares the mounts, and returns a container id. The container now exists in the sandbox but is not yet running.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setBoxSublabel(s.refs.appBox, 'created · not started');
      setVal(s.refs.statusChip, 'created (not started)');
      setVal(s.refs.lastOpChip, 'CreateContainer');
      s.refs.lastOpChip.classList.add('highlight');
      setWire(s, 'kr', 'CreateContainer');
      s.refs.kubelet.classList.add('highlight');
      s.refs.statusChip.classList.add('highlight');
      setChainActive(s.refs.chain, 3);
      s.refs.sandboxGroup.style.opacity = '1';
      // Pinned dim: the container exists but is not running.
      s.refs.appGroup.style.opacity = String(OPACITY.pending);
      if (ctx.reduced) { s.refs.runtime.classList.add('highlight'); return; }
      // gRPC to the runtime, then the created (not started) container lands dim.
      const grpc = topPacket(s, ctx, { from: KUBE_R, to: RT_X, y: CALL_Y, role: 'cluster' });
      lightBoxAt(s.refs.runtime, ctx, grpc.arrivalMs);
      // The container id the narration says comes back, on the drawn return lane.
      topPacket(s, ctx, { from: RT_X, to: KUBE_R, y: BACK_Y, delay: grpc.arrivalMs + BEAT.afterHop, role: 'cluster' });
      const create = routePacket(s, ctx, SANDBOX_CONNECTOR, { delay: grpc.arrivalMs + BEAT.afterHop, role: 'cluster' });
      ctx.register(s.refs.appGroup.animate([{ opacity: 0 }, { opacity: OPACITY.pending }], { duration: FADE.in, delay: create.arrivalMs, fill: 'both', easing: 'ease-out' }));
      pulsePod(s.refs.appGroup, ctx, create.arrivalMs);
    },
  },
  {
    id: 'start',
    duration: 3100,
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
      s.refs.statusChip.classList.add('highlight');
      s.refs.lastOpChip.classList.add('highlight');
      setChainActive(s.refs.chain, 4);
      s.refs.sandboxGroup.style.opacity = '1';
      // Pinned full: the container is running.
      s.refs.appGroup.style.opacity = '1';
      if (ctx.reduced) { s.refs.runtime.classList.add('highlight'); return; }
      // gRPC to the runtime, then the ENTRYPOINT forks and the container brightens.
      const grpc = topPacket(s, ctx, { from: KUBE_R, to: RT_X, y: CALL_Y, role: 'cluster' });
      lightBoxAt(s.refs.runtime, ctx, grpc.arrivalMs);
      const start = routePacket(s, ctx, SANDBOX_CONNECTOR, { delay: grpc.arrivalMs + BEAT.afterHop, role: 'cluster' });
      ctx.register(s.refs.appGroup.animate([{ opacity: OPACITY.pending }, { opacity: 1 }], { duration: FADE.in, delay: start.arrivalMs, fill: 'both', easing: 'ease-out' }));
      pulsePod(s.refs.appGroup, ctx, start.arrivalMs);
    },
  },
];

export const init = makeInit(Scene, STEPS, { posterFirst: true });
