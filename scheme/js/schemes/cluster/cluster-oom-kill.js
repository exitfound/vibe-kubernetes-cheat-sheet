import { svg, g, text } from '../../lib/svg.js';
import { arrowDefs, node, box, chainList, setChainActive, arrow, pathArrow, podShell } from '../../lib/primitives.js';
import { valChip, setVal, setBoxSublabel, pulsePod, routePacket, topPacket, makeInit, clearHighlights, clearWires, setWire, FADE, lightBoxAt, OPACITY, at } from './cluster-kit.js';
// Design notes for this card: ./CARDS.md#cluster-oom-kill

// Layout C: ladder right, chips in a two-row bottom strip. Panel x<=397 y<=280, frame top 388, so
// NO NARRATION MAY PASS ROUGHLY 570 CHARACTERS. The ceiling belongs to the frame, not to the text.
const M = 60;
const CONTENT_L = M, CONTENT_R = 1200 - M;               // 60 / 1140
const CX = (CONTENT_L + CONTENT_R) / 2;                  // 600, the canvas centre by construction

const BOX_W = 232, BOX_H = 80;
const TOP_Y = 40, TOP_BOTTOM = TOP_Y + BOX_H;            // 40 / 120
const SPINE_X = CX;                                      // 600, the Node frame midpoint, clear of the panel
const KUBE_X = SPINE_X - BOX_W / 2;                      // 484..716
// The kernel right-aligns on CONTENT_R, level with the right chip column, the ladder and the frame.
// One box centred on the spine, one flush to the content edge, as on cluster-node-pressure-eviction.
const KERN_X = CONTENT_R - BOX_W;                        // 908..1140
const LANE_DY = 12, TOP_CY = TOP_Y + BOX_H / 2;          // 80
const UP_Y = TOP_CY - LANE_DY, DOWN_Y = TOP_CY + LANE_DY;// 68 / 92
const WIRE_X = (KUBE_X + BOX_W + KERN_X) / 2;            // 812, the gap midpoint
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

// The one lane, shared by the static pathArrow and the packet route: Kubelet bottom face midpoint to
// Node frame top face midpoint, both on the spine. Addressed to the NODE, not the Pod inside it.
const NODE_CONNECTOR = [[SPINE_X, TOP_BOTTOM], [SPINE_X, NODE_Y]];

// NO tie from a top-row block to the ladder: that line is only true when ONE block owns every row,
// and this ladder has three owners in five. Hanging it off one would say that block does all five.

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

    const wireKernel = text({ class: 'scheme-label code dim', x: WIRE_X, y: WIRE_Y, 'text-anchor': 'middle' }, [' ']);
    root.appendChild(wireKernel);

    const memChip         = valChip({ x: CHIP_X(0), y: CHIP_Y(0), w: CHIP_W, h: CHIP_H, name: 'memory.current / max', value: '100Mi / 256Mi', role: 'cluster' });
    const oomScoreChip    = valChip({ x: CHIP_X(1), y: CHIP_Y(1), w: CHIP_W, h: CHIP_H, name: 'oom_score_adj',         value: '900 Burstable 3 to 999, Guaranteed -997, BestEffort 1000', role: 'cluster' });
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

    const shellEl = podShell({ x: POD_X, y: POD_Y, w: POD_W, h: POD_H, label: 'Pod', sublabel: '', containers: 0, role: 'workloads' });
    shellEl.style.setProperty('--workloads-color', '#c0b0ff');

    const containerBox = box({ x: CONT_X, y: CONT_Y, w: CONT_W, h: CONT_H, label: 'app', sublabel: 'using 100Mi of 256Mi', role: 'workloads' });
    containerBox.style.setProperty('--workloads-color', '#c0b0ff');

    // Grouped for z-order, shared pulse AND shared opacity: the kill dims the whole group, shell
    // included. Opacity lives on the GROUP, never on containerBox, or the two multiply.
    const podGroup = g({ id: 'podGroup' });
    podGroup.appendChild(shellEl);
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
      kubelet, kernel, chain, nodeEl, podGroup, containerBox,
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

// Every enter() writes EVERY chip through this, idle included. oom_score_adj is a standing value
// carrying the whole ranking scale, so it is a lookup on the chip rather than a sentence.
const OOM_SCORE = '900 Burstable 3 to 999, Guaranteed -997, BestEffort 1000';
// What memory.current reads once the SIGKILL has taken the container down.
const DEAD_MEM = 'near 0 / 256Mi · processes killed';
function setChips(s, { mem, state, restarts }) {
  setVal(s.refs.memChip, mem);
  setVal(s.refs.oomScoreChip, OOM_SCORE);
  setVal(s.refs.terminationChip, state);
  setVal(s.refs.restartChip, restarts);
}

const STEPS = [
  {
    id: 'idle',
    duration: 1500,
    enter(s) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      s.refs.podGroup.style.opacity = '1';
      setBoxSublabel(s.refs.containerBox, 'using 100Mi of 256Mi');
      setChips(s, { mem: '100Mi / 256Mi', state: 'Running', restarts: '0' });
      setChainActive(s.refs.chain, -1);
    },
  },
  {
    id: 'allocate',
    duration: 2000,
    narration: 'The workload grows, and memory.current keeps rising toward memory.max as the container allocates anonymous pages, page cache, and slab. The cgroup memory controller accounts every byte against the limit.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      s.refs.podGroup.style.opacity = '1';
      setBoxSublabel(s.refs.containerBox, 'using 220Mi of 256Mi');
      setChips(s, { mem: '220Mi / 256Mi · climbing', state: 'Running', restarts: '0' });
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
      s.refs.podGroup.style.opacity = '1';
      setBoxSublabel(s.refs.containerBox, 'using 256Mi of 256Mi · at limit');
      setChips(s, { mem: '256Mi / 256Mi · at limit', state: 'Running', restarts: '0' });
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
    // The RUNTIME writes memory.oom.group, the Kubelet only asks for it over CRI. Verification and
    // the singleProcessOOMKill footnote are in ./CARDS.md.
    narration: 'Reclaim has failed at memory.max, so the kernel invokes the cgroup-scoped OOM killer. The runtime sets memory.oom.group on that cgroup under cgroup v2, so the kernel SIGKILLs every process in the container as one unit rather than the single worst offender. The oom_score_adj applied at container start from the QoS class ranks containers when the whole Node runs out, not inside one cgroup.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      // containerStatuses[].state is still Running at this instant: the kernel killed the process
      // and the Kubelet has not told the API yet, which is the observe step.
      setChips(s, { mem: '256Mi / 256Mi · at limit', state: 'Running · not yet observed', restarts: '0' });
      setWire(s, 'kernel', 'cgroup OOM killer · SIGKILL to the container');
      s.refs.kernel.classList.add('highlight');
      s.refs.oomScoreChip.classList.add('highlight');
      setChainActive(s.refs.chain, 2);
      // Pin final state inline so cancel between steps does not flash to default.
      setBoxSublabel(s.refs.containerBox, 'OOMKilled · SIGKILL');
      s.refs.podGroup.style.opacity = String(OPACITY.terminated);
      if (ctx.reduced) return;
      // An in-place kernel event, so nothing travels: the Pod flinches, then goes dark a beat later.
      // The sandbox surviving is carried by the restart step in words, not by holding the shell lit.
      pulsePod(s.refs.podGroup, ctx, 200);
      ctx.register(s.refs.podGroup.animate(
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
      s.refs.podGroup.style.opacity = String(OPACITY.terminated);
      setBoxSublabel(s.refs.containerBox, 'terminated · exit 137');
      // memory.current fell away with the processes the SIGKILL took: it read at limit here for as
      // long as the step wrote only one chip, beside a container the same step calls terminated.
      setChips(s, { mem: DEAD_MEM, state: 'Terminated · OOMKilled · 137', restarts: '0' });
      setWire(s, 'kernel', 'container exited 137 · PLEG relist · PATCH status');
      s.refs.memChip.classList.add('highlight');
      s.refs.terminationChip.classList.add('highlight');
      s.refs.kernel.classList.add('highlight');
      setChainActive(s.refs.chain, 3);
      if (ctx.reduced) { s.refs.kubelet.classList.add('highlight'); return; }
      // `container state` is what the Kubelet KNOWS, so it holds what oomkill left until the relist
      // result lands, which is the whole point of this step.
      setVal(s.refs.terminationChip, 'Running · not yet observed');
      const pkt = topPacket(s, ctx, { from: KERN_X, to: KUBE_X + BOX_W, y: DOWN_Y, role: 'cluster' });
      lightBoxAt(s.refs.kubelet, ctx, pkt.arrivalMs);
      at(s, ctx, pkt.arrivalMs, () => setVal(s.refs.terminationChip, 'Terminated · OOMKilled · 137'));
    },
  },
  {
    id: 'restart',
    duration: 2500,
    narration: 'The restartPolicy is Always (the default), so Kubelet starts a fresh container inside the same Pod sandbox. The Pod IP and Linux namespaces are preserved and restartCount increments. Repeated OOMKills trip CrashLoopBackOff, so each retry is delayed exponentially from 10s up to a 5 min cap, and 10 minutes of clean running resets it.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setBoxSublabel(s.refs.containerBox, 'using 120Mi of 256Mi');
      setChips(s, { mem: '120Mi / 256Mi', state: 'Running (restarted)', restarts: '1' });
      // "applied", not "written": Kubelet passes both in the CRI create call and the runtime is what
      // touches the cgroup file and /proc/PID/oom_score_adj. This card draws no runtime block.
      setWire(s, 'kernel', 'new container · memory.max + oom_score_adj applied');
      s.refs.kubelet.classList.add('highlight');
      s.refs.memChip.classList.add('highlight');
      s.refs.terminationChip.classList.add('highlight');
      s.refs.restartChip.classList.add('highlight');
      // Pin final state inline.
      s.refs.podGroup.style.opacity = '1';
      setChainActive(s.refs.chain, 4);
      if (ctx.reduced) { s.refs.kernel.classList.add('highlight'); return; }
      // The new container does not exist until the create lands, so the box and the three chips it
      // moves hold what observe left and turn over together on arrival, with the pulse and the fade.
      setBoxSublabel(s.refs.containerBox, 'terminated · exit 137');
      setChips(s, { mem: DEAD_MEM, state: 'Terminated · OOMKilled · 137', restarts: '0' });
      const create = routePacket(s, ctx, NODE_CONNECTOR, { role: 'cluster' });
      const kernelPkt = topPacket(s, ctx, { from: KUBE_X + BOX_W, to: KERN_X, y: UP_Y, delay: 200, role: 'cluster' });
      lightBoxAt(s.refs.kernel, ctx, kernelPkt.arrivalMs);
      at(s, ctx, create.arrivalMs, () => {
        setBoxSublabel(s.refs.containerBox, 'using 120Mi of 256Mi');
        setChips(s, { mem: '120Mi / 256Mi', state: 'Running (restarted)', restarts: '1' });
      });
      pulsePod(s.refs.podGroup, ctx, create.arrivalMs);
      ctx.register(s.refs.podGroup.animate(
        [{ opacity: OPACITY.terminated }, { opacity: 1 }],
        { duration: FADE.in, delay: create.arrivalMs, fill: 'both', easing: 'ease-out' }
      ));
    },
  },
];

export const init = makeInit(Scene, STEPS, { posterFirst: true });
