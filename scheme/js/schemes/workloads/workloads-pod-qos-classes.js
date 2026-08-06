import { g, text } from '../../lib/svg.js';
import { arrowDefs, box, node, chainList, setChainActive, arrow, pathArrow, podShell } from '../../lib/primitives.js';
import { routePacket, valChip, setVal, setBoxSublabel, pulsePod, topPacket, makeInit, clearHighlights, clearWires, setWire, relationPath, lightBoxAt, FADE, BEAT, OPACITY, WL, diagramRoot } from './workloads-kit.js';

// Design notes for this card: ./CARDS.md#workloads-pod-qos-classes

// Layout C on the Workloads canon (WL): panel x<=397 y<=404 leaves no column under it, so the
// pipeline keeps the right band and the chips form a two-across bottom strip.

// Kubelet is the node-facing actor, so it leads the row and is centred on CX: every lane to the
// Node leaves its bottom midpoint and clears the pipeline column.
const TOP1_X = 420, TOP1_W = 2 * (WL.CX - 420);          // 420..780, centred on CX
const TOP_GAP = 60;
const TOP2_X = TOP1_X + TOP1_W + TOP_GAP, TOP2_W = WL.R - (TOP1_X + TOP1_W + TOP_GAP);
const TOP_CY = WL.TOP_Y + WL.BOX_H / 2;
const REQ_Y = TOP_CY - WL.LANE_DY, RESP_Y = TOP_CY + WL.LANE_DY;
const WIRE_X = (TOP1_X + TOP1_W + TOP2_X) / 2;

const LAD_X = WL.CHIP_X, LAD_W = WL.CHIP_W;              // 660..1140, the pipeline
const LAD_Y = 150;                                       // 5 rows -> 150..350

// Chips two across, 532 wide: four across was 258 and every name ran into its own value.
const CHIP_COLS = 2, CHIP_GAP = 16, CHIP_VGAP = 8;
const CHIP_W = (WL.W - CHIP_GAP * (CHIP_COLS - 1)) / CHIP_COLS;
const CHIPS_Y = 548;                                     // 2 rows -> 548..582 / 590..624
const CHIP_X = i => WL.L + (i % CHIP_COLS) * (CHIP_W + CHIP_GAP);
const CHIP_Y = i => CHIPS_Y + Math.floor(i / CHIP_COLS) * (WL.CHIP_H + CHIP_VGAP);

const NODE_Y = 404, NODE_H = 128;                        // 404..532, clear of the panel
const POD_W = 300, POD_H = 82, POD_Y = NODE_Y + 34;      // 438..520
const POD_PAD = 24;
const POD_INNER = { dx: 30, w: POD_W - 60, dy: 24, h: 46 };
const POD_XS = [0, 1, 2].map(i => WL.L + POD_PAD + i * ((WL.W - POD_PAD * 2 - POD_W) / 2));
const POD_CX = i => POD_XS[i] + POD_W / 2;               // 234 / 600 / 966

// Every step that travels writes to all three Pods at once, so the lane drops to a bus above the
// Pod row and taps down into each. One ball per tap, wire and ball from the same points.
const BUS_Y = NODE_Y + 12;
const TRUNK = [[WL.CX, WL.TOP_BOTTOM], [WL.CX, BUS_Y]];
const BUS = [[POD_CX(0), BUS_Y], [POD_CX(POD_XS.length - 1), BUS_Y]];
const TAP = i => [[POD_CX(i), BUS_Y], [POD_CX(i), POD_Y]];
const LANE = i => (POD_CX(i) === WL.CX
  ? [[WL.CX, WL.TOP_BOTTOM], [WL.CX, POD_Y]]
  : [[WL.CX, WL.TOP_BOTTOM], [WL.CX, BUS_Y], [POD_CX(i), BUS_Y], [POD_CX(i), POD_Y]]);

// A trunk segment carries the ball but is not its destination, so it is drawn without a marker:
// the arrowhead belongs on the tap that lands on a Pod.
function trunkPath(points) {
  return relationPath({ points, role: 'cluster', dash: '5 5' });
}


function setSublabels(s, a, b, c) {
  setBoxSublabel(s.refs.pod1Box, a);
  setBoxSublabel(s.refs.pod2Box, b);
  setBoxSublabel(s.refs.pod3Box, c);
}

class Scene {
  constructor(host) { this.host = host; this.refs = {}; this.build(); }

  build() {
    this.host.replaceChildren();
    this.refs = {};
    const root = diagramRoot({ 'aria-label': 'Pod QoS classes: API derives qosClass from requests vs limits at admission, Kubelet applies cgroup config and oom_score_adj by tier' });
    root.appendChild(arrowDefs());

    const kubelet   = box({ x: TOP1_X, y: WL.TOP_Y, w: TOP1_W, h: WL.BOX_H, label: 'Kubelet',   sublabel: 'cgroups + eviction',            role: 'cluster' });
    const apiserver = box({ x: TOP2_X, y: WL.TOP_Y, w: TOP2_W, h: WL.BOX_H, label: 'API', sublabel: 'admission · qosClass · binding', role: 'cluster' });

    // A RELATIONSHIP: the only write this card narrates Kubelet -> API is the binding POST, which
    // the Scheduler makes and this card does not draw. Nothing can ride it, so no arrowhead.
    root.appendChild(relationPath({ points: [[TOP1_X + TOP1_W, REQ_Y], [TOP2_X, REQ_Y]], role: 'cluster' }));
    root.appendChild(arrow({ x1: TOP2_X, y1: RESP_Y, x2: TOP1_X + TOP1_W, y2: RESP_Y, dim: true, dashed: true, role: 'cluster' }));

    const wireReq = text({ class: 'scheme-label code dim', x: WIRE_X, y: WL.TOP_Y - 12, 'text-anchor': 'middle' }, [' ']);
    root.appendChild(wireReq);

    const pod1Chip  = valChip({ x: CHIP_X(0), y: CHIP_Y(0), w: CHIP_W, h: WL.CHIP_H, name: 'Pod A · qosClass', value: 'pending', role: 'workloads' });
    const pod2Chip  = valChip({ x: CHIP_X(1), y: CHIP_Y(1), w: CHIP_W, h: WL.CHIP_H, name: 'Pod B · qosClass', value: 'pending', role: 'workloads' });
    const pod3Chip  = valChip({ x: CHIP_X(2), y: CHIP_Y(2), w: CHIP_W, h: WL.CHIP_H, name: 'Pod C · qosClass', value: 'pending', role: 'workloads' });
    const focusChip = valChip({ x: CHIP_X(3), y: CHIP_Y(3), w: CHIP_W, h: WL.CHIP_H, name: 'focus',            value: 'none', role: 'workloads' });
    [pod1Chip, pod2Chip, pod3Chip, focusChip].forEach(c => root.appendChild(c));

    const chain = chainList({
      x: LAD_X, y: LAD_Y, w: LAD_W, rowH: WL.ROW_H, gap: WL.ROW_GAP,
      items: [
        '1. spec      ·  3 Pods, different resource shapes',
        '2. classify  ·  API derives qosClass at admission',
        '3. schedule  ·  scheduler bins by requests only',
        '4. cgroups   ·  Kubelet sets memory.max + oom_score_adj',
        '5. evict     ·  over request first, then Priority',
      ],
      role: 'cluster',
    });

    const nodeEl = node({ x: WL.L, y: NODE_Y, w: WL.W, h: NODE_H, label: 'Node-1' });

    const POD_NAMES = ['Pod A', 'Pod B', 'Pod C'];
    const POD_SUBS  = ['no requests · no limits', 'req only · 500m / 256Mi', 'req == limits · 1 / 1Gi'];
    const podBoxes = [];
    const podWrappers = POD_XS.map((px, i) => {
      const shell = podShell({ x: px, y: POD_Y, w: POD_W, h: POD_H, label: POD_NAMES[i], sublabel: '', containers: 0, role: 'workloads' });

      const innerBox = box({ x: px + POD_INNER.dx, y: POD_Y + POD_INNER.dy, w: POD_INNER.w, h: POD_INNER.h, label: 'app', sublabel: POD_SUBS[i], role: 'workloads' });

      const wrap = g({ id: `pod${i + 1}` });
      wrap.appendChild(shell);
      wrap.appendChild(innerBox);
      podBoxes.push(innerBox);
      return wrap;
    });
    const [pod1, pod2, pod3] = podWrappers;
    const [pod1Box, pod2Box, pod3Box] = podBoxes;

    // Trunk and bus carry the balls, the taps land them on a Pod: only the taps take an arrowhead.
    const trunk = trunkPath(TRUNK);
    const bus = trunkPath(BUS);
    const taps = POD_XS.map((_, i) => pathArrow({ points: TAP(i), dim: true, dashed: true, role: 'cluster' }));

    const packetLayer = g({ id: 'packetLayer' });

    // Z-order: the Node frame is a 70% opaque fill, so the bus that runs inside it and the balls
    // that ride it are appended after it. Ladder, Pods and the actor row sit above the packets.
    root.appendChild(nodeEl);
    [trunk, bus, ...taps].forEach(w => root.appendChild(w));
    root.appendChild(packetLayer);
    root.appendChild(chain);
    [pod1, pod2, pod3].forEach(p => root.appendChild(p));
    root.appendChild(kubelet);
    root.appendChild(apiserver);

    this.host.appendChild(root);
    this.refs = {
      svg: root,
      apiserver, kubelet, chain, nodeEl, trunk, bus, taps,
      pod1Chip, pod2Chip, pod3Chip, focusChip,
      pod1, pod2, pod3, pod1Box, pod2Box, pod3Box,
      packetLayer,
      wires: { req: wireReq },
    };
  }

  reset() { this.build(); }
}

function setChips(s, { pod1, pod2, pod3, focus }) {
  setVal(s.refs.pod1Chip, pod1);
  setVal(s.refs.pod2Chip, pod2);
  setVal(s.refs.pod3Chip, pod3);
  setVal(s.refs.focusChip, focus);
}

function resetStep(s) {
  s.refs.packetLayer.replaceChildren();
  clearHighlights(s,
    ['apiserver','kubelet','pod1Chip','pod2Chip','pod3Chip','focusChip','pod1Box','pod2Box','pod3Box'],
    [s.refs.pod1, s.refs.pod2, s.refs.pod3]);
  clearWires(s);
}
function resetPodOpacity(s) {
  ['pod1','pod2','pod3'].forEach(k => { s.refs[k].style.opacity = '1'; });
}
// One ball per tap. The outer lanes are longer, so each Pod pulses on its own ball landing.
function fanToPods(s, ctx, { delay = 0 } = {}) {
  return [0, 1, 2].map(i => {
    const pkt = routePacket(s, ctx, LANE(i), { delay, role: 'workloads' });
    pulsePod(s.refs['pod' + (i + 1)], ctx, pkt.arrivalMs);
    return pkt;
  });
}

const STEPS = [
  {
    id: 'idle',
    duration: 1500,
    enter(s) {
      resetStep(s);
      resetPodOpacity(s);
      setSublabels(s, 'no requests · no limits', 'req only · 500m / 256Mi', 'req == limits · 1 / 1Gi');
      setVal(s.refs.pod1Chip, 'pending');
      setVal(s.refs.pod2Chip, 'pending');
      setVal(s.refs.pod3Chip, 'pending');
      setVal(s.refs.focusChip, 'none');
      setChainActive(s.refs.chain, -1);
    },
  },
  {
    id: 'spec',
    duration: 1700,
    narration: 'The classification rule has three outcomes. BestEffort: no container has any requests or limits at all. Guaranteed: every container has CPU and memory requests and limits set, with requests equal to limits. Burstable: anything in between (at least one resource declared but does not match the Guaranteed pattern).',
    enter(s, ctx) {
      resetStep(s);
      resetPodOpacity(s);
      setSublabels(s, 'no requests · no limits', 'req only · 500m / 256Mi', 'req == limits · 1 / 1Gi');
      setChips(s, { pod1: 'pending', pod2: 'pending', pod3: 'pending', focus: '3 shapes inspected' });
      setWire(s, 'req', 'rule: empty → BestEffort · req==lim → Guaranteed · Else Burstable');
      s.refs.apiserver.classList.add('highlight');
      s.refs.focusChip.classList.add('highlight');
      setChainActive(s.refs.chain, 0);
      // The rule is read inside the Api, nothing travels: the focus chip takes the
      // static highlight only, no flash (info chips do not pulse).
    },
  },
  {
    id: 'classify',
    duration: 2100,
    narration: 'The API server applies the rule and tags each Pod with its class on status.qosClass. Pod A becomes BestEffort (empty resources). Pod B becomes Burstable (requests only, no limits). Pod C becomes Guaranteed (requests equal limits everywhere). This tag is set once at creation and never changes for the rest of the Pod life.',
    enter(s, ctx) {
      resetStep(s);
      resetPodOpacity(s);
      setSublabels(s, 'BestEffort', 'Burstable', 'Guaranteed');
      setChips(s, { pod1: 'BestEffort', pod2: 'Burstable', pod3: 'Guaranteed', focus: 'status.qosClass written' });
      setWire(s, 'req', 'status.qosClass · A=BestEffort · B=Burstable · C=Guaranteed');
      s.refs.apiserver.classList.add('highlight');
      s.refs.pod1Chip.classList.add('highlight');
      s.refs.pod2Chip.classList.add('highlight');
      s.refs.pod3Chip.classList.add('highlight');
      s.refs.focusChip.classList.add('highlight');
      setChainActive(s.refs.chain, 1);
      if (ctx.reduced) return;
      // Api tags all three Pods with their qosClass at once: they pulse together.
      pulsePod(s.refs.pod1, ctx, 0);
      pulsePod(s.refs.pod2, ctx, 0);
      pulsePod(s.refs.pod3, ctx, 0);
    },
  },
  {
    id: 'schedule',
    duration: 3400,
    narration: 'Each Pod is now placed on a Node. Scheduling looks only at requests, ignoring both limits and the QoS class. Pod A asks for nothing and fits anywhere. Pod B competes for 500m CPU and 256Mi memory. Pod C competes for 1 CPU and 1Gi memory. Once a Node passes the checks, the Pod is bound to it via POST .../pods/{name}/binding.',
    enter(s, ctx) {
      resetStep(s);
      resetPodOpacity(s);
      setSublabels(s, 'BestEffort', 'Burstable', 'Guaranteed');
      setChips(s, { pod1: 'BestEffort', pod2: 'Burstable', pod3: 'Guaranteed', focus: 'scheduler · requests only' });
      setWire(s, 'req', 'POST .../pods/{name}/binding · requests only, not limits');
      s.refs.apiserver.classList.add('highlight');
      s.refs.focusChip.classList.add('highlight');
      setChainActive(s.refs.chain, 2);
      if (ctx.reduced) { s.refs.kubelet.classList.add('highlight'); return; }
      // Api writes the binding, the Kubelet observes it and places each Pod. The Kubelet lights when
      // the binding REACHES it, since placing the Pods is its answer to it.
      const bind = topPacket(s, ctx, { from: TOP2_X, to: TOP1_X + TOP1_W, y: RESP_Y, role: 'workloads' });
      lightBoxAt(s.refs.kubelet, ctx, bind.arrivalMs);
      fanToPods(s, ctx, { delay: bind.arrivalMs + BEAT.afterHop });
    },
  },
  {
    id: 'cgroups',
    duration: 2600,
    narration: 'Kubelet on the chosen Node writes the Linux cgroup config for each Pod. The container memory cap (memory.max) and CPU cap (cpu.max) come from limits. If limits are absent (Pod A is BestEffort) there is no cap at all. Kubelet also writes oom_score_adj for each container process, a number the kernel uses to choose which process to kill first under memory pressure. BestEffort gets 1000 (kernel picks it first). Guaranteed gets -997 (almost never picked). Burstable sits in between, scaled by its memory request via 1000 - 1000*(request/capacity), clamped to range 3..999.',
    enter(s, ctx) {
      resetStep(s);
      resetPodOpacity(s);
      setSublabels(s, 'BestEffort · oom_score=1000', 'Burstable · oom_score~scaled', 'Guaranteed · oom_score=-997');
      setChips(s, { pod1: 'BestEffort', pod2: 'Burstable', pod3: 'Guaranteed', focus: 'memory.max · oom_score_adj' });
      setWire(s, 'req', 'cgroup v2 · memory.max + cpu.max + oom_score_adj');
      s.refs.kubelet.classList.add('highlight');
      s.refs.focusChip.classList.add('highlight');
      setChainActive(s.refs.chain, 3);
      if (ctx.reduced) return;
      // Kubelet pushes cgroup config down to the node, each Pod pulses as it is written.
      fanToPods(s, ctx);
    },
  },
  {
    id: 'tiers',
    // Motion: Pod A is reached at 1520, Pod B a beat later at 2327, and the second fade ends at
    // 3227. Sequencing the two evictions costs 627ms over the old simultaneous fan.
    duration: 3400,
    narration: 'When the Node runs low on memory, Kubelet ranks Pods by whether each is using more than it requested, then by Pod Priority, then by how far over the request it sits. Pod A declared no request at all, so it is over the moment it allocates anything and goes first. Pod B is over its own request and goes next. Pod C requests exactly what it is allowed to use, so it never exceeds its request and is reached only by the kernel OOMKiller in extreme cases. QoS class does not decide this order, it only predicts it, and this is a separate mechanism from priority-based preemption (which is covered in its own card).',
    enter(s, ctx) {
      resetStep(s);
      resetPodOpacity(s);
      setSublabels(s, 'BestEffort · evicted 1st', 'Burstable · evicted 2nd', 'Guaranteed · survives');
      setChips(s, { pod1: 'BestEffort', pod2: 'Burstable', pod3: 'Guaranteed', focus: 'over request, then Priority' });
      setWire(s, 'req', 'evicted first: over its request, then by Priority');
      s.refs.kubelet.classList.add('highlight');
      s.refs.pod1Chip.classList.add('highlight');
      s.refs.focusChip.classList.add('highlight');
      setChainActive(s.refs.chain, 4);
      s.refs.pod1.style.opacity = String(OPACITY.terminating);
      s.refs.pod2.style.opacity = String(OPACITY.terminating);
      s.refs.pod3.style.opacity = '1';
      if (ctx.reduced) return;
      // The ORDER is the content here, so explicit delays rather than the shared fan: the lanes are
      // 684 and 318 units, so sending together lands `evicted 2nd` 800ms before `evicted 1st`.
      const evictA = routePacket(s, ctx, LANE(0), { role: 'workloads' });
      pulsePod(s.refs.pod1, ctx, evictA.arrivalMs);
      ctx.register(s.refs.pod1.animate([{ opacity: 1 }, { opacity: OPACITY.terminating }], { duration: FADE.out, delay: evictA.arrivalMs, fill: 'both', easing: 'ease-in' }));
      const evictB = routePacket(s, ctx, LANE(1), { delay: evictA.arrivalMs + BEAT.afterHop, role: 'workloads' });
      pulsePod(s.refs.pod2, ctx, evictB.arrivalMs);
      ctx.register(s.refs.pod2.animate([{ opacity: 1 }, { opacity: OPACITY.terminating }], { duration: FADE.out, delay: evictB.arrivalMs, fill: 'both', easing: 'ease-in' }));
    },
  },
];

export const init = makeInit(Scene, STEPS, { posterFirst: true });
