import { svg, g, text } from '../lib/svg.js';
import { arrowDefs, pod, node, box, chainList, setChainActive, arrow, pathArrow } from '../lib/primitives.js';
import { valChip, setVal, setBoxSublabel, pulsePod, routePacket, topPacket, makeInit, clearHighlights, clearWires, setWire, FADE, lightBoxAt, OPACITY } from '../lib/cluster-kit.js';
// Design notes for this card: scheme/docs/CARDS.md#cluster-oom-kill

// Layout C: the panel reaches y<=330 on the left, so the ladder stays right and the chips take a
// two-row bottom strip. Panel worst case over 1600/1280/1100 is x<=397, y<=330.
const M = 60;
const CONTENT_L = M, CONTENT_R = 1200 - M;               // 60 / 1140
const CX = (CONTENT_L + CONTENT_R) / 2;                  // 600, the canvas centre by construction
const PANEL_R = 400, PANEL_B = 330;                      // the reserved corner, measured

const BOX_W = 232, BOX_H = 80;
const TOP_Y = 40, TOP_BOTTOM = TOP_Y + BOX_H;            // 40 / 120
const SPINE_X = 580;                                     // clear of the panel, left of the ladder
const KUBE_X = SPINE_X - BOX_W / 2;                      // 464..696
const TOP_GAP = 56;
const KERN_X = KUBE_X + BOX_W + TOP_GAP;                 // 752..984
const LANE_DY = 12, TOP_CY = TOP_Y + BOX_H / 2;          // 80
const UP_Y = TOP_CY - LANE_DY, DOWN_Y = TOP_CY + LANE_DY;// 68 / 92
const WIRE_X = (KUBE_X + BOX_W + KERN_X) / 2;            // 724
const WIRE_Y = TOP_Y - 14;                               // 26, above the row: the spine owns below it

const LADDER_X = 660, LADDER_W = 480;                    // 660..1140
const LADDER_Y = 170, ROW_H = 32, ROW_GAP = 10;          // 5 rows -> 170..370

const NODE_X = CONTENT_L, NODE_W = CONTENT_R - CONTENT_L;// 60..1140
const NODE_Y = 388, NODE_H = 144;                        // 388..532, the first row clear of the panel
const POD_W = 480, POD_H = 110;
const POD_X = CX - POD_W / 2;                            // 360..840
const POD_Y = NODE_Y + 20;                               // 408..518
const CONT_W = 300, CONT_H = 64;
const CONT_X = CX - CONT_W / 2;                          // 450..750
const CONT_Y = POD_Y + 30;                               // 438..502

// Bottom strip, TWO per row: four across leaves 258 units and the names overlap their values.
const CHIP_H = 34, CHIP_GAP = 16, CHIP_VGAP = 8, CHIP_COLS = 2;
const CHIPS_Y = NODE_Y + NODE_H + 16;                    // 548, second row ends on 624
const CHIP_W = (NODE_W - CHIP_GAP * (CHIP_COLS - 1)) / CHIP_COLS;     // 532
const CHIP_X = i => CONTENT_L + (i % CHIP_COLS) * (CHIP_W + CHIP_GAP);
const CHIP_Y = i => CHIPS_Y + Math.floor(i / CHIP_COLS) * (CHIP_H + CHIP_VGAP);

// The one lane on the card, shared by the static pathArrow and the packet route. It ends on the
// Pod shell, not on the Node frame edge above it, because the Pod is what reacts.
const NODE_CONNECTOR = [[SPINE_X, TOP_BOTTOM], [SPINE_X, POD_Y]];

class Scene {
  constructor(host) { this.host = host; this.refs = {}; this.build(); }

  build() {
    this.host.replaceChildren();
    this.refs = {};
    const root = svg({
      class: 'diagram',
      viewBox: '0 0 1200 640',
      preserveAspectRatio: 'xMidYMid meet',
      'aria-label': 'Container OOMKill: cgroup memory.max, kernel cgroup OOM killer, Kubelet observation via PLEG, restart',
      'data-style': 'outline',
    });
    root.appendChild(arrowDefs());

    const kubelet = box({ x: KUBE_X, y: TOP_Y, w: BOX_W, h: BOX_H, label: 'Kubelet',      sublabel: 'PLEG + status patch', role: 'cluster' });
    const kernel  = box({ x: KERN_X, y: TOP_Y, w: BOX_W, h: BOX_H, label: 'Linux kernel', sublabel: 'cgroup OOM killer',    role: 'cluster' });

    root.appendChild(arrow({ x1: KUBE_X + BOX_W, y1: UP_Y,   x2: KERN_X, y2: UP_Y,   dim: true, dashed: true, role: 'cluster' }));
    root.appendChild(arrow({ x1: KERN_X, y1: DOWN_Y, x2: KUBE_X + BOX_W, y2: DOWN_Y, dim: true, dashed: true, role: 'cluster' }));

    const wireKernel = text({ class: 'scheme-label code dim', x: WIRE_X, y: WIRE_Y, 'text-anchor': 'middle', 'font-size': 9 }, [' ']);
    root.appendChild(wireKernel);

    const memChip         = valChip({ x: CHIP_X(0), y: CHIP_Y(0), w: CHIP_W, h: CHIP_H, name: 'memory.current / max', value: '100Mi / 256Mi', role: 'cluster' });
    const oomScoreChip    = valChip({ x: CHIP_X(1), y: CHIP_Y(1), w: CHIP_W, h: CHIP_H, name: 'oom_score_adj',         value: '900 (Burstable)', role: 'cluster' });
    const terminationChip = valChip({ x: CHIP_X(2), y: CHIP_Y(2), w: CHIP_W, h: CHIP_H, name: 'container state',           value: 'Running', role: 'cluster' });
    const restartChip     = valChip({ x: CHIP_X(3), y: CHIP_Y(3), w: CHIP_W, h: CHIP_H, name: 'restartCount',          value: '0', role: 'cluster' });
    [memChip, oomScoreChip, terminationChip, restartChip].forEach(c => root.appendChild(c));

    const chain = chainList({
      x: LADDER_X, y: LADDER_Y, w: LADDER_W, rowH: ROW_H, gap: ROW_GAP,
      items: [
        '1. allocate ·  workload pushes memory.current up',
        '2. cgroup   ·  usage hits memory.max, kernel notified',
        '3. OOMKill  ·  cgroup OOM killer SIGKILLs the container',
        '4. observe  ·  PLEG sees terminated, PATCH Pod status',
        '5. restart  ·  same sandbox, new container, count++',
      ],
      role: 'cluster',
    });

    const nodeEl = node({ x: NODE_X, y: NODE_Y, w: NODE_W, h: NODE_H, label: 'Node-1' });

    const podShell = pod({ x: POD_X, y: POD_Y, w: POD_W, h: POD_H, label: 'Pod', sublabel: '', containers: 0, role: 'workloads' });
    podShell.style.setProperty('--workloads-color', '#c0b0ff');
    const podShellRect = podShell.querySelector('.scheme-pod-rect');
    if (podShellRect) podShellRect.style.fill = 'rgba(255, 255, 255, 0.03)';

    const containerBox = box({ x: CONT_X, y: CONT_Y, w: CONT_W, h: CONT_H, label: 'app', sublabel: 'using 100Mi of 256Mi', role: 'workloads' });
    containerBox.style.setProperty('--workloads-color', '#c0b0ff');

    // Grouped for z-order and shared pulse. The shell (the Pod sandbox) keeps full opacity
    // through the kill; only the inner container box dims, because the sandbox survives.
    const podGroup = g({ id: 'podGroup' });
    podGroup.appendChild(podShell);
    podGroup.appendChild(containerBox);

    const connector = pathArrow({
      points: NODE_CONNECTOR,
      dim: true, dashed: true, role: 'cluster',
    });
    root.appendChild(connector);

    const packetLayer = g({ id: 'packetLayer' });

    // Z-order canon: packetLayer first (under the blocks) so a packet tucks under
    // its destination on arrival; then chain, node, pod, then top-row blocks last.
    root.appendChild(packetLayer);
    root.appendChild(chain);
    root.appendChild(nodeEl);
    root.appendChild(podGroup);
    root.appendChild(kubelet);
    root.appendChild(kernel);

    this.host.appendChild(root);
    this.refs = {
      svg: root,
      kubelet, kernel, chain, nodeEl, podGroup, podShell, containerBox, connector,
      memChip, oomScoreChip, terminationChip, restartChip,
      packetLayer,
      wires: { kernel: wireKernel },
    };
  }

  reset() { this.build(); }
}

function clearHL(s) {
  clearHighlights(s,
    ['kubelet','kernel','memChip','oomScoreChip','terminationChip','restartChip'],
    [s.refs.podGroup]);
}

const STEPS = [
  {
    id: 'idle',
    duration: 1500,
    narration: 'A Pod runs on Node-1 with a memory limit of 256Mi. Kubelet has written this limit into the container cgroup as memory.max. Current usage sits well under the cap, and the container reports Running.',
    enter(s) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      s.refs.containerBox.style.opacity = '1';
      setBoxSublabel(s.refs.containerBox, 'using 100Mi of 256Mi');
      setVal(s.refs.memChip, '100Mi / 256Mi');
      setVal(s.refs.oomScoreChip, '900 (Burstable)');
      setVal(s.refs.terminationChip, 'Running');
      setVal(s.refs.restartChip, '0');
      setChainActive(s.refs.chain, -1);
    },
  },
  {
    id: 'allocate',
    duration: 2000,
    narration: 'The workload grows, and memory.current keeps rising toward memory.max as the container allocates anonymous pages, page caches, and slab. The cgroup memory controller accounts every byte against the limit.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      s.refs.containerBox.style.opacity = '1';
      setBoxSublabel(s.refs.containerBox, 'using 220Mi of 256Mi');
      setVal(s.refs.memChip, '220Mi / 256Mi · climbing');
      setWire(s, 'kernel', 'memory.current rising · charged to the cgroup');
      s.refs.memChip.classList.add('highlight');
      setChainActive(s.refs.chain, 0);
      if (ctx.reduced) return;
      // Pulse marks the new reading the container block just showed (220Mi).
      pulsePod(s.refs.podGroup, ctx, 0);
    },
  },
  {
    id: 'cgroup',
    duration: 2000,
    narration: 'Usage in memory.current reaches memory.max. The cgroup memory controller cannot reclaim enough (swap is disabled on most Kubernetes Nodes), so the kernel raises an out-of-memory event scoped to this one cgroup.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      s.refs.containerBox.style.opacity = '1';
      setBoxSublabel(s.refs.containerBox, 'using 256Mi of 256Mi · at limit');
      setVal(s.refs.memChip, '256Mi / 256Mi · at limit');
      setWire(s, 'kernel', 'memory.current == memory.max · cgroup OOM event');
      s.refs.memChip.classList.add('highlight');
      s.refs.kernel.classList.add('highlight');
      setChainActive(s.refs.chain, 1);
      if (ctx.reduced) return;
      // Pulse marks the container block hitting the cap (256Mi of 256Mi).
      pulsePod(s.refs.podGroup, ctx, 0);
    },
  },
  {
    id: 'oomkill',
    duration: 2300,
    narration: 'The container is over its own memory.max and reclaim has failed, so the kernel invokes the cgroup-scoped OOM killer. It looks only at processes inside this cgroup and sends SIGKILL to the worst offender by badness score (memory footprint biased by oom_score_adj). Kubelet had set that value from the QoS class at container start: Guaranteed -997, BestEffort 1000, Burstable scaled from 3 to 999 by memory request. The container main process takes the SIGKILL.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setWire(s, 'kernel', 'cgroup OOM killer · SIGKILL to the container');
      s.refs.kernel.classList.add('highlight');
      s.refs.oomScoreChip.classList.add('highlight');
      setChainActive(s.refs.chain, 2);
      // Pin final state inline so cancel between steps does not flash to default.
      setBoxSublabel(s.refs.containerBox, 'OOMKilled · SIGKILL');
      s.refs.containerBox.style.opacity = String(OPACITY.terminated);
      if (ctx.reduced) return;
      // OOM is an in-place kernel event, nothing travels: the container flinches (pulse a
      // beat in) then goes dark (dissolve, a beat after the flinch). The shell/sandbox stays lit.
      pulsePod(s.refs.podGroup, ctx, 200);
      ctx.register(s.refs.containerBox.animate(
        [{ opacity: 1 }, { opacity: OPACITY.terminated }],
        { duration: FADE.out, delay: 700, fill: 'both', easing: 'ease-in' }
      ));
    },
  },
  {
    id: 'observe',
    duration: 2100,
    narration: 'PLEG (Pod Lifecycle Event Generator) spots the dead container on its next relist of the container runtime. Kubelet PATCHes the container status to terminated with reason OOMKilled and exitCode 137 (128 + 9 for SIGKILL). After the restart this record moves to lastState.terminated, which is what kubectl describe and get show.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      s.refs.containerBox.style.opacity = String(OPACITY.terminated);
      setBoxSublabel(s.refs.containerBox, 'terminated · exit 137');
      setVal(s.refs.terminationChip, 'Terminated · OOMKilled · 137');
      setWire(s, 'kernel', 'container exited 137 · PLEG relist · PATCH status');
      s.refs.terminationChip.classList.add('highlight');
      s.refs.kernel.classList.add('highlight');
      setChainActive(s.refs.chain, 3);
      if (ctx.reduced) { s.refs.kubelet.classList.add('highlight'); return; }
      // The exit status surfaces from the kernel/runtime up to kubelet (bottom arrow).
      const pkt = topPacket(s, ctx, { from: KERN_X, to: KUBE_X + BOX_W, y: DOWN_Y, role: 'cluster' });
      lightBoxAt(s.refs.kubelet, ctx, pkt.arrivalMs);
    },
  },
  {
    id: 'restart',
    duration: 2500,
    narration: 'The restartPolicy is Always (the default), so Kubelet starts a fresh container inside the same Pod sandbox. The Pod IP and Linux namespaces are preserved and restartCount increments. Repeated OOMKills trip CrashLoopBackOff, so each retry is delayed exponentially starting at 10s and capped at 5 min.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setBoxSublabel(s.refs.containerBox, 'using 120Mi of 256Mi');
      setVal(s.refs.memChip, '120Mi / 256Mi');
      setVal(s.refs.terminationChip, 'Running (restarted)');
      setVal(s.refs.restartChip, '1');
      setWire(s, 'kernel', 'new container · write memory.max + oom_score_adj');
      s.refs.kubelet.classList.add('highlight');
      s.refs.memChip.classList.add('highlight');
      s.refs.terminationChip.classList.add('highlight');
      s.refs.restartChip.classList.add('highlight');
      // Pin final state inline.
      s.refs.containerBox.style.opacity = '1';
      setChainActive(s.refs.chain, 4);
      if (ctx.reduced) { s.refs.kernel.classList.add('highlight'); return; }
      const create = routePacket(s, ctx, NODE_CONNECTOR, { role: 'cluster' });
      const kernelPkt = topPacket(s, ctx, { from: KUBE_X + BOX_W, to: KERN_X, y: UP_Y, delay: 200, role: 'cluster' });
      lightBoxAt(s.refs.kernel, ctx, kernelPkt.arrivalMs);
      pulsePod(s.refs.podGroup, ctx, create.arrivalMs);
      ctx.register(s.refs.containerBox.animate(
        [{ opacity: OPACITY.terminated }, { opacity: 1 }],
        { duration: FADE.in, delay: create.arrivalMs, fill: 'both', easing: 'ease-out' }
      ));
    },
  },
];

export const init = makeInit(Scene, STEPS, { posterFirst: true });
