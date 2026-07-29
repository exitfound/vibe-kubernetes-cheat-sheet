import { svg, g, text } from '../lib/svg.js';
import { arrowDefs, box, pod, node, arrow, pathArrow, chainList, setChainActive } from '../lib/primitives.js';
import { valChip, setVal, setPodSublabel, pulsePod, segmentPacket, routePacket, makeInit, clearHighlights, clearWires, setWire, relationPath, BEAT } from '../lib/network-kit.js';
// Design notes for this card: scheme/docs/CARDS.md#network-cni-invocation


const RAISE = 64;                           // lift the whole diagram up ~10% of the viewBox height
const ROW_Y = 352 - RAISE;                  // 288: Kubelet / CRI / bridge-tap row (straight ADD)

// Actor boxes (workloads-standard height 80). Kubelet sits well left so the inline RunPodSandbox
// label has room in the gap to the CRI.
const CONTENT_L = 60, CONTENT_R = 1140;     // the content band, so the chip strip centres on 600
const KUBE = [CONTENT_L, 312 - RAISE, 200, 80];  // x, y, w, h  -> centre 160  bottom 328
const CRI  = [370, 312 - RAISE, 220, 80];   // centre 480  right 590  bottom 328
const CRI_CX = CRI[0] + CRI[2] / 2;         // 480

const SBX = [360, 442 - RAISE, 240, 116];   // x, y, w, h  -> top 378  right 600  centre y 436 = PAUSE_Y
const SBX_CX = SBX[0] + SBX[2] / 2;         // 480
const SBX_RIGHT = SBX[0] + SBX[2];          // 600
const PAUSE_Y = 500 - RAISE;                 // 436: pause / eth0 inner box centre = result-tap height = block centre

// CNI plugin container + internal spine. Three taps: bridge at the runtime row, result at the
// sandbox row (PAUSE_Y), IPAM exactly between, so the spine spans the two straight arrows.
const SPINE_X = 846;
const CHAIN_X = 866, CHAIN_W = 252, CHAIN_ROWH = 40;
const TAP = [ROW_Y, (ROW_Y + PAUSE_Y) / 2, PAUSE_Y];   // 288, 362, 436
const CHAIN_GAP = (TAP[1] - TAP[0]) - CHAIN_ROWH;       // pitch derived from the tap spacing
const CHAIN_Y = TAP[0] - CHAIN_ROWH / 2;                // first row top
const CNI_TOP = 308 - RAISE;                             // 244
const CNI_X = CONTENT_R - 320;              // 820, so its chip can end on the content edge
const CNI = [CNI_X, CNI_TOP, 320, (TAP[2] + CHAIN_ROWH / 2 + 14) - CNI_TOP];  // wraps every row + padding

// Connector point arrays (each shared by the static wire and the packet that rides it).
const RUN    = [[KUBE[0] + KUBE[2], ROW_Y], [CRI[0], ROW_Y]];          // Kubelet -> CRI
const ADD    = [[CRI[0] + CRI[2], ROW_Y], [SPINE_X, ROW_Y]];          // CRI -> bridge tap (straight)
const NETNS  = [[CRI_CX, CRI[1] + CRI[3]], [CRI_CX, SBX[1]]];          // CRI -> sandbox (vertical)
const SP_1_2 = [[SPINE_X, TAP[0]], [SPINE_X, TAP[1]]];                 // bridge -> IPAM (down the spine)
const SP_2_3 = [[SPINE_X, TAP[1]], [SPINE_X, TAP[2]]];                 // IPAM -> result (down the spine, stops at result)
const RESULT = [[SPINE_X, PAUSE_Y], [SBX_RIGHT, PAUSE_Y]];             // result tap -> sandbox (straight)
const JOIN   = [[KUBE[0] + KUBE[2] / 2, KUBE[1] + KUBE[3]], [KUBE[0] + KUBE[2] / 2, PAUSE_Y], [SBX[0], PAUSE_Y]];  // Kubelet -> sandbox (L)

class Scene {
  constructor(host) { this.host = host; this.refs = {}; this.build(); }

  build() {
    this.host.replaceChildren();
    this.refs = {};
    const root = svg({
      class: 'diagram',
      viewBox: '0 0 1200 640',
      preserveAspectRatio: 'xMidYMid meet',
      'aria-label': 'CNI plugin invocation: the Kubelet asks the CRI runtime to create the Pod sandbox, the runtime invokes the CNI ADD operation, the plugin chain wires a veth and allocates an IP, and the result is written into the sandbox namespace as eth0',
      'data-style': 'outline',
    });
    root.appendChild(arrowDefs());

    const kubelet = box({ x: KUBE[0], y: KUBE[1], w: KUBE[2], h: KUBE[3], label: 'Kubelet', sublabel: 'PodSpec ready', role: 'network' });
    const cri = box({ x: CRI[0], y: CRI[1], w: CRI[2], h: CRI[3], label: 'CRI . containerd', sublabel: 'sandbox runtime', role: 'network' });

    // Pod sandbox = a pod shell (loopback-only netns) wrapping an inner pause/eth0 box.
    const sandboxShell = pod({ x: SBX[0], y: SBX[1], w: SBX[2], h: SBX[3], label: 'Pod sandbox', sublabel: 'netns: lo only', containers: 0, role: 'network' });
    const sandboxRect = sandboxShell.querySelector('.scheme-pod-rect');
    if (sandboxRect) sandboxRect.style.fill = 'rgba(255, 255, 255, 0.03)';
    const sandboxInner = box({ x: SBX[0] + 22, y: PAUSE_Y - 30, w: SBX[2] - 44, h: 60, label: 'pause', sublabel: 'eth0', role: 'network' });
    const sandbox = g({});
    sandbox.appendChild(sandboxShell);
    sandbox.appendChild(sandboxInner);

    // CNI plugin: one dashed node container. Inside, a vertical dashed spine taps each plugin row,
    // so the whole chain ball rides a drawn line and the rows read as one connected chain.
    const cniBox = node({ x: CNI[0], y: CNI[1], w: CNI[2], h: CNI[3], label: 'CNI plugin' });
    const spineD = `M ${SPINE_X} ${TAP[0]} L ${SPINE_X} ${TAP[2]} `
      + TAP.map(y => `M ${SPINE_X} ${y} L ${CHAIN_X} ${y}`).join(' ');
    const spine = relationPath({ d: spineD });
    const chain = chainList({
      x: CHAIN_X, y: CHAIN_Y, w: CHAIN_W, rowH: CHAIN_ROWH, gap: CHAIN_GAP, role: 'network',
      items: ['bridge: veth pair, attach cni0', 'host-local IPAM: 10.244.1.5', 'result: IP, routes, DNS'],
    });

    // Dim dashed wires, blank labels filled per step. Same point arrays as the packets.
    const wRun    = arrow({ x1: RUN[0][0], y1: RUN[0][1], x2: RUN[1][0], y2: RUN[1][1], dashed: true, dim: true });
    const wAdd    = arrow({ x1: ADD[0][0], y1: ADD[0][1], x2: ADD[1][0], y2: ADD[1][1], dashed: true, dim: true });
    const wNetns  = arrow({ x1: NETNS[0][0], y1: NETNS[0][1], x2: NETNS[1][0], y2: NETNS[1][1], dashed: true, dim: true });
    const wResult = arrow({ x1: RESULT[0][0], y1: RESULT[0][1], x2: RESULT[1][0], y2: RESULT[1][1], dashed: true, dim: true });
    const wJoin   = pathArrow({ points: JOIN, dashed: true, dim: true });

    const lRun    = text({ class: 'scheme-label code dim', x: 309, y: ROW_Y - 10, 'text-anchor': 'middle', 'font-size': 10 }, [' ']);
    const lAdd    = text({ class: 'scheme-label code dim', x: 685, y: ROW_Y - 10, 'text-anchor': 'middle', 'font-size': 10 }, [' ']);
    const lNetns  = text({ class: 'scheme-label code dim', x: CRI_CX + 12, y: CRI[1] + CRI[3] + 30, 'text-anchor': 'start', 'font-size': 10 }, [' ']);
    const lResult = text({ class: 'scheme-label code dim', x: 690, y: PAUSE_Y - 10, 'text-anchor': 'middle', 'font-size': 10 }, [' ']);
    const lJoin   = text({ class: 'scheme-label code dim', x: 254, y: PAUSE_Y + 16, 'text-anchor': 'middle', 'font-size': 10 }, [' ']);

    // Status chips docked under the block each describes: the allocated Pod IP under the sandbox,
    // the live CNI operation under the plugin container.
    // The two chips are hung on the content band, not on the blocks they caption, so the strip
    // spans CONTENT_L..CONTENT_R and centres on the canvas without anything being stretched.
    const ipChip = valChip({ x: CONTENT_L, y: SBX[1] + SBX[3] + 12, w: SBX_RIGHT - CONTENT_L, h: 30, name: 'Pod IP', value: 'pending', role: 'network' });
    const opChip = valChip({ x: CNI[0], y: CNI[1] + CNI[3] + 12, w: CONTENT_R - CNI[0], h: 30, name: 'CNI op', value: 'idle', role: 'network' });

    const packetLayer = g({ id: 'packetLayer' });

    // Z-order: body blocks + CNI container + spine + ladder, then wires + labels above, then chips,
    // then packets on top.
    root.appendChild(kubelet);
    root.appendChild(cri);
    root.appendChild(sandbox);
    root.appendChild(cniBox);
    root.appendChild(spine);
    root.appendChild(chain);
    [wRun, wAdd, wNetns, wResult, wJoin, lRun, lAdd, lNetns, lResult, lJoin].forEach(el => root.appendChild(el));
    [ipChip, opChip].forEach(c => root.appendChild(c));
    root.appendChild(packetLayer);

    this.host.appendChild(root);
    this.refs = {
      svg: root, kubelet, cri, cniBox, chain, sandbox, sandboxInner,
      ipChip, opChip, packetLayer,
      wires: { run: lRun, add: lAdd, netns: lNetns, result: lResult, join: lJoin },
    };
  }

  reset() { this.build(); }
}

function clearHL(s) {
  clearHighlights(s, ['kubelet', 'cri', 'ipChip', 'opChip', 'sandboxInner'], [s.refs.sandbox]);
  setChainActive(s.refs.chain, -1);
}

// Light one or more plugin rows. When the ball hops between two rows, both the row it leaves and the
// row it enters read as active, so the source is never dark while traffic flows out of it.
function lightChain(s, ...idxs) {
  s.refs.chain.querySelectorAll('.scheme-chip').forEach(row => {
    row.classList.toggle('highlight', idxs.includes(Number(row.getAttribute('data-idx'))));
  });
}

const STEPS = [
  {
    id: 'idle',
    duration: 1500,
    enter(s) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setVal(s.refs.ipChip, 'pending');
      setVal(s.refs.opChip, 'idle');
      setPodSublabel(s.refs.sandbox, 'netns: lo only');
    },
  },
  {
    id: 'sandbox',
    duration: 2600,
    narration: 'First the Kubelet asks the CRI runtime, here containerd, to create the Pod sandbox. The runtime starts the pause container, which owns a fresh network namespace that every container in the Pod will share. For now that namespace holds loopback only and no Pod IP.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      // Both actors are in the handoff: the kubelet initiates, the runtime creates the sandbox.
      s.refs.kubelet.classList.add('highlight');
      s.refs.cri.classList.add('highlight');
      setWire(s, 'run', 'RunPodSandbox');
      setWire(s, 'netns', 'create netns');
      s.refs.opChip.classList.add('highlight');
      setVal(s.refs.opChip, 'not called yet');
      setPodSublabel(s.refs.sandbox, 'netns: lo only');
      if (ctx.reduced) { s.refs.sandboxInner.classList.add('highlight'); return; }
      // kubelet calls the runtime, which then creates the sandbox: two chained hops, the sandbox
      // pulses on arrival (down-arrow: packet first, pulse at arrivalMs).
      const h1 = segmentPacket(s, ctx, { from: RUN[0], to: RUN[1], role: 'network' });
      const h2 = segmentPacket(s, ctx, { from: NETNS[0], to: NETNS[1], delay: h1.arrivalMs + BEAT.afterHop, role: 'network' });
      pulsePod(s.refs.sandbox, ctx, h2.arrivalMs);
    },
  },
  {
    id: 'invoke-add',
    duration: 2400,
    narration: 'The runtime then invokes the CNI ADD operation on the main plugin, a bridge here. It passes the sandbox namespace path and the network config from /etc/cni/net.d, handing off the actual plumbing instead of doing it itself.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      s.refs.cri.classList.add('highlight');
      setChainActive(s.refs.chain, 0);
      s.refs.opChip.classList.add('highlight');
      setWire(s, 'add', 'ADD + netns path');
      setVal(s.refs.opChip, 'ADD');
      if (ctx.reduced) return;
      // The ADD call rides straight from the runtime into the bridge tap (top of the spine).
      segmentPacket(s, ctx, { from: ADD[0], to: ADD[1], role: 'network' });
    },
  },
  {
    id: 'plugin-chain',
    duration: 2600,
    narration: 'The bridge plugin creates a veth pair and attaches the host end to the cni0 bridge, then delegates to its IPAM plugin. The host-local plugin allocates 10.244.1.5 from this Node range and hands the address back.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      // The ball leaves bridge for IPAM: light both, so the row it departs is not dark.
      lightChain(s, 0, 1);
      s.refs.ipChip.classList.add('highlight');
      s.refs.opChip.classList.add('highlight');
      setVal(s.refs.ipChip, '10.244.1.5');
      setVal(s.refs.opChip, 'ADD');
      if (ctx.reduced) return;
      // The bridge delegates down the spine to the IPAM tap, rippling there as the address is
      // picked.
      segmentPacket(s, ctx, { from: SP_1_2[0], to: SP_1_2[1], role: 'network' });
    },
  },
  {
    id: 'result',
    duration: 2400,
    narration: 'The chain finishes and the plugin assembles a single CNI result. It carries everything that was produced, the IP, the routes and the DNS, and is handed back up to the runtime.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      // The ball leaves IPAM for result: light both, so the row it departs is not dark.
      lightChain(s, 1, 2);
      s.refs.ipChip.classList.add('highlight');
      s.refs.opChip.classList.add('highlight');
      setVal(s.refs.ipChip, '10.244.1.5');
      setVal(s.refs.opChip, 'ADD');
      if (ctx.reduced) return;
      // The ball rides the spine from the IPAM tap to the result tap and stops there, rippling like
      // it did at bridge and IPAM, so every plugin in the chain gets its own arrival.
      segmentPacket(s, ctx, { from: SP_2_3[0], to: SP_2_3[1], role: 'network' });
    },
  },
  {
    id: 'write-eth0',
    duration: 2600,
    narration: 'The veth end the plugin placed in the sandbox namespace now comes up as eth0, carrying 10.244.1.5. The Pod has its single network identity, and the runtime records the CNI result.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setChainActive(s.refs.chain, 2);
      s.refs.ipChip.classList.add('highlight');
      s.refs.opChip.classList.add('highlight');
      setWire(s, 'result', 'eth0 up');
      setVal(s.refs.ipChip, '10.244.1.5');
      setVal(s.refs.opChip, 'ADD ok');
      setPodSublabel(s.refs.sandbox, 'eth0: 10.244.1.5');
      if (ctx.reduced) { s.refs.sandboxInner.classList.add('highlight'); return; }
      // Only now does the ball leave the result tap and ride the straight wire into the sandbox,
      // which pulses as eth0 comes up (down-arrow: packet first, pulse at arrivalMs).
      const hop = segmentPacket(s, ctx, { from: RESULT[0], to: RESULT[1], role: 'network' });
      pulsePod(s.refs.sandbox, ctx, hop.arrivalMs);
    },
  },
  {
    id: 'join',
    duration: 2600,
    narration: 'Only now does the Kubelet start the app containers, and they join the namespace the sandbox already set up, so they all share that one Pod IP. When the Pod is later deleted, the runtime calls CNI DEL to release the address and remove the veth.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      s.refs.kubelet.classList.add('highlight');
      setWire(s, 'join', 'start app containers');
      setPodSublabel(s.refs.sandbox, 'eth0: 10.244.1.5');
      setVal(s.refs.ipChip, '10.244.1.5');
      setVal(s.refs.opChip, 'DEL on delete');
      s.refs.opChip.classList.add('highlight');
      if (ctx.reduced) { s.refs.sandboxInner.classList.add('highlight'); return; }
      // kubelet starts the app containers into the existing namespace: an L route, the sandbox
      // pulses as the containers join it (down-arrow, eased multi-point route, no explicit dur).
      const hop = routePacket(s, ctx, JOIN, { role: 'network' });
      pulsePod(s.refs.sandbox, ctx, hop.arrivalMs);
    },
  },
];

export const init = makeInit(Scene, STEPS, { posterFirst: true });
