import { svg, g, text } from '../../lib/svg.js';
import { arrowDefs, node, box, chainList, setChainActive, arrow } from '../../lib/primitives.js';
import { valChip, setVal, segmentPacket, makeInit, clearHighlights, clearWires, setWire, relationPath, BEAT, lightBoxAt, at, revealAt, REVEAL_MS } from '../../lib/cluster-kit.js';
// Design notes for this card: scheme/docs/CARDS.md#cluster-node-allocatable

// The picture is an ARITHMETIC, not a sequence, so the Node band carries ONE horizontal capacity
// bar that gets carved segment by segment and the ladder carries the running subtraction.
// Scale is exact: GI units per Gi, so every segment width IS its number and a reader can measure.
// Panel measured at 1600x1000 / 1280x860 / 1100x800: x<=291/378/397, y<=212/256/304, worst on the
// reserved step, the longest narration on the card at 451 characters. Nothing is drawn left of 420
// above the Node frame, so the binding number is the frame top on 336 and its label on 354. One
// panel line is 25 units at 1100x800, and 451 -> 304, 510 -> 329, 520 -> 354, which lands on the
// frame label. The CEILING is therefore 500 characters per narration. Re-measure with
// VW=1100 VH=800 node overlay-measure.mjs cluster-node-allocatable after any prose edit.
const M = 60;
const CONTENT_L = M, CONTENT_R = 1200 - M;               // 60 / 1140
const CX = (CONTENT_L + CONTENT_R) / 2;                  // 600, the canvas centre by construction

// Three actors in the 720 units right of the panel, so 200 wide rather than the family 232.
const BOX_W = 200, BOX_H = 80, TOP_GAP = 60;
const TOP_Y = 40, TOP_BOTTOM = TOP_Y + BOX_H;            // 40 / 120
const KUBELET_X = 420, KUBELET_R = KUBELET_X + BOX_W;    // 420..620
const API_X = KUBELET_R + TOP_GAP, API_R = API_X + BOX_W;// 680..880
const SCHED_X = API_R + TOP_GAP;                         // 940..1140
const TOP_CY = TOP_Y + BOX_H / 2;                        // 80, both hops ride the row centre line
const WIRE_Y = TOP_Y - 14;                               // 26, above the row
const WIRE_KA_X = (KUBELET_R + API_X) / 2;               // 650
const WIRE_AS_X = (API_R + SCHED_X) / 2;                 // 910

const LADDER_X = 660, LADDER_W = 480;                    // 660..1140, right of the panel
const LADDER_Y = 140, ROW_H = 25, ROW_GAP = 5;           // 6 rows -> 140..315

const NODE_X = CONTENT_L, NODE_W = CONTENT_R - CONTENT_L;// 60..1140
const NODE_Y = 336, NODE_H = 196;                        // 336..532

// One Gi of memory in viewBox units. Every width on the bar is a multiple of it, so the drawing
// and the arithmetic cannot disagree: 16Gi capacity, 1Gi + 512Mi + 512Mi carved, 14Gi left.
const GI = 56;
const BAR_W = 16 * GI, BAR_X = CX - BAR_W / 2;           // 896 wide, 152..1048
const BAR_Y = NODE_Y + 34, BAR_H = 64;                   // 370..434, node() draws NODE-1 at +18
const KUBE_X = BAR_X, KUBE_W = GI;                       // 152..208, 1Gi
const SYS_X = KUBE_X + KUBE_W, SYS_W = GI / 2;           // 208..236, 512Mi
const EVICT_X = SYS_X + SYS_W, EVICT_W = GI / 2;         // 236..264, 512Mi
const ALLOC_X = EVICT_X + EVICT_W, ALLOC_W = 14 * GI;    // 264..1048, 14Gi

// The request strip hangs under the bar and starts where Allocatable starts, because that is the
// only place Pod requests are measured from. A 15Gi request therefore runs to 1104 and overhangs
// the end of the bar by exactly one Gi, which is the whole answer the card is written to give.
const REQ_Y = BAR_Y + BAR_H + 8, REQ_H = 22;             // 442..464
const REQ_LBL_X = ALLOC_X + 10;                          // 274, start-anchored inside the strip

// Three narrow segments cannot hold a label, so their captions stagger on three tiers below the
// strip. 56, 28 and 28 units wide is the truth of the proportion, not a drawing problem to solve.
const TIER = [480, 498, 516];

const CHIP_H = 34, CHIP_GAP = 16, CHIP_VGAP = 8, CHIP_COLS = 2;
const CHIPS_Y = 548;                                     // second row ends on 624
const CHIP_W = (NODE_W - CHIP_GAP * (CHIP_COLS - 1)) / CHIP_COLS;   // 532
const CHIP_X = i => CONTENT_L + (i % CHIP_COLS) * (CHIP_W + CHIP_GAP);
const CHIP_Y = i => CHIPS_Y + Math.floor(i / CHIP_COLS) * (CHIP_H + CHIP_VGAP);

// Residency, not traffic: this Kubelet runs on this Node and is what computes its Allocatable.
// No ball ever rides it, so it takes no arrowhead. It leaves the Kubelet bottom face midpoint and
// lands on the Node frame top face midpoint, turning halfway between the two faces.
const JOG_Y = (TOP_BOTTOM + NODE_Y) / 2;                 // 228
const KUBELET_CX = KUBELET_X + BOX_W / 2;                // 520
const KUBELET_TO_NODE = [[KUBELET_CX, TOP_BOTTOM], [KUBELET_CX, JOG_Y], [CX, JOG_Y], [CX, NODE_Y]];

class Scene {
  constructor(host) { this.host = host; this.refs = {}; this.build(); }

  build() {
    this.host.replaceChildren();
    this.refs = {};
    const root = svg({
      class: 'diagram',
      viewBox: '0 0 1200 640',
      preserveAspectRatio: 'xMidYMid meet',
      'aria-label': 'Node Allocatable: the Kubelet carves kubeReserved, systemReserved and the hard eviction threshold out of the Node capacity, and what is left is the only number the Scheduler sums Pod requests against',
      'data-style': 'outline',
    });
    root.appendChild(arrowDefs());

    root.appendChild(relationPath({ points: KUBELET_TO_NODE, role: 'cluster' }));

    const nodeEl = node({ x: NODE_X, y: NODE_Y, w: NODE_W, h: NODE_H, label: 'Node-1' });
    root.appendChild(nodeEl);

    // The whole 16Gi, undivided. The segments below carve it and carry only strokes, so the fill
    // never doubles up where a segment sits on the bar.
    const capBar = box({ x: BAR_X, y: BAR_Y, w: BAR_W, h: BAR_H, rx: 6, role: 'cluster' });
    root.appendChild(capBar);
    root.appendChild(text({ class: 'scheme-label code dim', x: CX, y: BAR_Y - 8, 'text-anchor': 'middle' }, ['capacity 16Gi']));

    const segment = ({ x, w, caption, tier, label = '', sublabel = '' }) => {
      const bx = box({ x, y: BAR_Y, w, h: BAR_H, rx: 0, label, sublabel, role: 'cluster' });
      const rectEl = bx.querySelector('.scheme-box-rect');
      if (rectEl) rectEl.style.fill = 'transparent';
      const wrap = g({});
      wrap.appendChild(bx);
      if (caption) {
        wrap.appendChild(text({ class: 'scheme-label code dim', x: x + w / 2, y: TIER[tier], 'text-anchor': 'middle' }, [caption]));
      }
      wrap.style.opacity = '0';
      root.appendChild(wrap);
      return { wrap, bx };
    };
    const kube  = segment({ x: KUBE_X,  w: KUBE_W,  caption: 'kubeReserved 1Gi',     tier: 0 });
    const sys   = segment({ x: SYS_X,   w: SYS_W,   caption: 'systemReserved 512Mi', tier: 1 });
    const evict = segment({ x: EVICT_X, w: EVICT_W, caption: 'evictionHard 512Mi',   tier: 2 });
    const alloc = segment({ x: ALLOC_X, w: ALLOC_W, label: 'Allocatable', sublabel: '14Gi' });

    // Pod requests, drawn to scale from the Allocatable edge. Its width is set per step.
    const reqBar = box({ x: ALLOC_X, y: REQ_Y, w: ALLOC_W, h: REQ_H, rx: 4, role: 'cluster' });
    reqBar.style.opacity = '0';
    root.appendChild(reqBar);
    const reqLbl = text({ class: 'scheme-label code dim', x: REQ_LBL_X, y: REQ_Y + REQ_H / 2 + 4, 'text-anchor': 'start' }, [' ']);
    root.appendChild(reqLbl);

    // Top-row hops, both on the row centre line: every exchange on this card runs one way.
    root.appendChild(arrow({ x1: KUBELET_R, y1: TOP_CY, x2: API_X, y2: TOP_CY, dim: true, dashed: true, role: 'cluster' }));
    root.appendChild(arrow({ x1: API_R, y1: TOP_CY, x2: SCHED_X, y2: TOP_CY, dim: true, dashed: true, role: 'cluster' }));

    const wireKa = text({ class: 'scheme-label code dim', x: WIRE_KA_X, y: WIRE_Y, 'text-anchor': 'middle' }, [' ']);
    const wireAs = text({ class: 'scheme-label code dim', x: WIRE_AS_X, y: WIRE_Y, 'text-anchor': 'middle' }, [' ']);
    root.appendChild(wireKa);
    root.appendChild(wireAs);

    const capChip     = valChip({ x: CHIP_X(0), y: CHIP_Y(0), w: CHIP_W, h: CHIP_H, name: 'status.capacity.memory',    value: 'not reported',  role: 'cluster' });
    const allocChip   = valChip({ x: CHIP_X(1), y: CHIP_Y(1), w: CHIP_W, h: CHIP_H, name: 'status.allocatable.memory', value: 'not computed', role: 'cluster' });
    const fitChip     = valChip({ x: CHIP_X(2), y: CHIP_Y(2), w: CHIP_W, h: CHIP_H, name: 'NodeResourcesFit',          value: 'not evaluated', role: 'cluster' });
    const enforceChip = valChip({ x: CHIP_X(3), y: CHIP_Y(3), w: CHIP_W, h: CHIP_H, name: 'enforceNodeAllocatable',    value: 'pods · the default', role: 'cluster' });
    [capChip, allocChip, fitChip, enforceChip].forEach(c => root.appendChild(c));

    const packetLayer = g({ id: 'packetLayer' });
    root.appendChild(packetLayer);

    const chain = chainList({
      x: LADDER_X, y: LADDER_Y, w: LADDER_W, rowH: ROW_H, gap: ROW_GAP,
      items: [
        '1. capacity     ·  Kubelet reports 16Gi in status.capacity',
        '2. reserved     ·  kubeReserved 1Gi and systemReserved 512Mi',
        '3. eviction     ·  evictionHard memory.available 512Mi',
        '4. allocatable  ·  16Gi - 1Gi - 512Mi - 512Mi = 14Gi',
        '5. schedule     ·  sum of Pod requests must stay under 14Gi',
        '6. overcommit   ·  limits may pass 14Gi, requests may not',
      ],
      role: 'cluster',
    });
    root.appendChild(chain);

    // Top-row blocks last, so a ball passes behind them rather than over their labels.
    const kubelet = box({ x: KUBELET_X, y: TOP_Y, w: BOX_W, h: BOX_H, label: 'Kubelet',   sublabel: 'computes Allocatable',   role: 'cluster' });
    const api     = box({ x: API_X,     y: TOP_Y, w: BOX_W, h: BOX_H, label: 'API',       sublabel: 'Node status block',      role: 'cluster' });
    const sched   = box({ x: SCHED_X,   y: TOP_Y, w: BOX_W, h: BOX_H, label: 'Scheduler', sublabel: 'NodeResourcesFit filter', role: 'cluster' });
    root.appendChild(kubelet);
    root.appendChild(api);
    root.appendChild(sched);

    this.host.appendChild(root);
    this.refs = {
      svg: root,
      kubelet, api, sched, nodeEl, chain, capBar,
      segKube: kube.wrap, segKubeBox: kube.bx,
      segSys: sys.wrap, segSysBox: sys.bx,
      segEvict: evict.wrap, segEvictBox: evict.bx,
      segAlloc: alloc.wrap, segAllocBox: alloc.bx,
      reqBar,
      capChip, allocChip, fitChip, enforceChip,
      packetLayer,
      wires: { ka: wireKa, as: wireAs, req: reqLbl },
    };
  }

  reset() { this.build(); }
}

function clearHL(s) {
  clearHighlights(s, [
    'kubelet', 'api', 'sched', 'capBar',
    'segKubeBox', 'segSysBox', 'segEvictBox', 'segAllocBox', 'reqBar',
    'capChip', 'allocChip', 'fitChip', 'enforceChip',
  ]);
}

// Every step writes every chip. A chip left alone keeps the previous step's reading, and on this
// card that would let Allocatable claim a number the arithmetic has not reached yet.
function setChips(s, { cap, alloc, fit }) {
  setVal(s.refs.capChip, cap);
  setVal(s.refs.allocChip, alloc);
  setVal(s.refs.fitChip, fit);
  setVal(s.refs.enforceChip, 'pods · the default');
}

// One helper for every carved piece, so a step cannot pin four of five and drift on the fifth.
function setSegs(s, { kube = 0, sys = 0, evict = 0, alloc = 0, req = 0 }) {
  s.refs.segKube.style.opacity = String(kube);
  s.refs.segSys.style.opacity = String(sys);
  s.refs.segEvict.style.opacity = String(evict);
  s.refs.segAlloc.style.opacity = String(alloc);
  s.refs.reqBar.style.opacity = String(req);
}

function setReqWidth(s, gi) {
  const r = s.refs.reqBar.querySelector('.scheme-box-rect');
  if (r) r.setAttribute('width', gi * GI);
}

const STEPS = [
  {
    id: 'idle',
    duration: 1500,
    enter(s) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setChips(s, { cap: 'not reported', alloc: 'not computed', fit: 'not evaluated' });
      setSegs(s, {});
      setChainActive(s.refs.chain, -1);
    },
  },
  {
    id: 'capacity',
    duration: 2600,
    narration: 'Node-1 is a machine with 16Gi of RAM, and the Kubelet reports that whole number into status.capacity on the Node object. Capacity is the total the Node has, and it says nothing about who may use it. By default Pods can consume all of it, and competing with the daemons that keep the machine alive is exactly the problem the rest of this card solves.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setChips(s, { cap: '16Gi', alloc: 'not computed', fit: 'not evaluated' });
      setSegs(s, {});
      setWire(s, 'ka', 'PATCH status.capacity');
      s.refs.kubelet.classList.add('highlight');
      s.refs.capBar.classList.add('highlight');
      s.refs.capChip.classList.add('highlight');
      setChainActive(s.refs.chain, 0);
      if (ctx.reduced) { s.refs.api.classList.add('highlight'); return; }
      // The chip holds what the API STORES, so it turns over when the report lands there.
      setVal(s.refs.capChip, 'not reported');
      const pkt = segmentPacket(s, ctx, { from: [KUBELET_R, TOP_CY], to: [API_X, TOP_CY], role: 'cluster' });
      lightBoxAt(s.refs.api, ctx, pkt.arrivalMs);
      at(s, ctx, pkt.arrivalMs, () => setVal(s.refs.capChip, '16Gi'));
    },
  },
  {
    id: 'reserved',
    duration: 2800,
    narration: 'Two reservations come off the top, both of them Kubelet settings. The kubeReserved budget covers the Kubernetes daemons that are not Pods, meaning the Kubelet and the container runtime, and here it is 1Gi. The systemReserved budget covers the OS daemons like sshd and udev, plus the kernel itself, and here it is 512Mi. Both are always subtracted from the arithmetic, but neither becomes a real cgroup cap unless you name it in enforceNodeAllocatable.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setChips(s, { cap: '16Gi', alloc: 'not computed', fit: 'not evaluated' });
      setSegs(s, { kube: 1, sys: 1 });
      s.refs.kubelet.classList.add('highlight');
      s.refs.segKubeBox.classList.add('highlight');
      s.refs.segSysBox.classList.add('highlight');
      s.refs.enforceChip.classList.add('highlight');
      setChainActive(s.refs.chain, 1);
      if (ctx.reduced) return;
      // Two budgets, so two beats: they are separate cgroups and separate settings.
      revealAt(s.refs.segKube, ctx, 0);
      revealAt(s.refs.segSys, ctx, REVEAL_MS);
    },
  },
  {
    id: 'eviction-threshold',
    duration: 2600,
    narration: 'The hard eviction threshold comes off as well. The evictionHard setting for memory.available is the margin the Kubelet keeps free so the machine is much less likely to reach a kernel out-of-memory event, 512Mi on this Node. Even with no daemons on it at all, Pods could not use more than capacity minus this threshold, so the memory behind it counts as unavailable to Pods rather than as spare room.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setChips(s, { cap: '16Gi', alloc: 'not computed', fit: 'not evaluated' });
      setSegs(s, { kube: 1, sys: 1, evict: 1 });
      s.refs.kubelet.classList.add('highlight');
      s.refs.segEvictBox.classList.add('highlight');
      setChainActive(s.refs.chain, 2);
      if (ctx.reduced) return;
      revealAt(s.refs.segEvict, ctx, 0);
    },
  },
  {
    id: 'allocatable',
    duration: 3000,
    narration: 'What survives is Allocatable. 16Gi minus 1Gi minus 512Mi minus 512Mi leaves 14Gi, and the Kubelet publishes that in status.allocatable beside status.capacity, which is why kubectl describe node prints the two blocks one under the other. Allocatable is the amount on this Node available to be consumed by ordinary Pods.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setChips(s, { cap: '16Gi', alloc: '14Gi', fit: 'not evaluated' });
      setSegs(s, { kube: 1, sys: 1, evict: 1, alloc: 1 });
      setWire(s, 'ka', 'PATCH status.allocatable');
      s.refs.kubelet.classList.add('highlight');
      s.refs.segAllocBox.classList.add('highlight');
      s.refs.allocChip.classList.add('highlight');
      setChainActive(s.refs.chain, 3);
      if (ctx.reduced) { s.refs.api.classList.add('highlight'); return; }
      // The remainder is drawn first, then published: the chip is what the API holds, so it waits
      // for the PATCH to land rather than reading 14Gi while the ball is still on the wire.
      setVal(s.refs.allocChip, 'not computed');
      revealAt(s.refs.segAlloc, ctx, 0);
      const pkt = segmentPacket(s, ctx, { from: [KUBELET_R, TOP_CY], to: [API_X, TOP_CY], delay: REVEAL_MS, role: 'cluster' });
      lightBoxAt(s.refs.api, ctx, pkt.arrivalMs);
      at(s, ctx, pkt.arrivalMs, () => setVal(s.refs.allocChip, '14Gi'));
    },
  },
  {
    id: 'schedule',
    duration: 3000,
    narration: 'The Scheduler reads status.allocatable, never status.capacity, and it does not over-subscribe it: the sum of Pod requests on a Node has to stay under Allocatable. So Pod cache-0 asking for 15Gi is turned away by a Node advertising 16Gi, with a FailedScheduling event naming Insufficient memory, because the number it is measured against is 14Gi.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setChips(s, { cap: '16Gi', alloc: '14Gi', fit: '15Gi > 14Gi · Insufficient memory' });
      setReqWidth(s, 15);
      setSegs(s, { kube: 1, sys: 1, evict: 1, alloc: 1, req: 1 });
      setWire(s, 'as', 'watch · status.allocatable');
      setWire(s, 'req', 'Pod cache-0 requests 15Gi');
      s.refs.api.classList.add('highlight');
      s.refs.segAllocBox.classList.add('highlight');
      s.refs.fitChip.classList.add('highlight');
      setChainActive(s.refs.chain, 4);
      if (ctx.reduced) { s.refs.sched.classList.add('highlight'); return; }
      // The verdict is the Scheduler's, so it lands when the number it judges against arrives.
      setVal(s.refs.fitChip, 'not evaluated');
      revealAt(s.refs.reqBar, ctx, 0);
      const pkt = segmentPacket(s, ctx, { from: [API_R, TOP_CY], to: [SCHED_X, TOP_CY], delay: BEAT.afterHop, role: 'cluster' });
      lightBoxAt(s.refs.sched, ctx, pkt.arrivalMs);
      at(s, ctx, pkt.arrivalMs, () => setVal(s.refs.fitChip, '15Gi > 14Gi · Insufficient memory'));
    },
  },
  {
    id: 'overcommit',
    duration: 2800,
    narration: 'Only requests are summed. Limits may add up far past Allocatable, which is what kubectl describe node means when it warns that total limits may be over 100 percent. Three Pods requesting 4Gi each fit inside 14Gi while their 8Gi limits total 24Gi. By default the Kubelet enforces Allocatable across Pods alone, and it enforces it by evicting once their real usage passes it.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setChips(s, { cap: '16Gi', alloc: '14Gi', fit: '12Gi of 14Gi · fits' });
      setReqWidth(s, 12);
      setSegs(s, { kube: 1, sys: 1, evict: 1, alloc: 1, req: 1 });
      // The strip draws REQUESTS, so its label names requests only. The 24Gi of limits is the one
      // number on this step that is deliberately not drawn, because nothing on the bar measures it.
      setWire(s, 'req', '3 Pods · requests 12Gi of 14Gi');
      s.refs.sched.classList.add('highlight');
      s.refs.segAllocBox.classList.add('highlight');
      s.refs.fitChip.classList.add('highlight');
      s.refs.enforceChip.classList.add('highlight');
      setChainActive(s.refs.chain, 5);
      if (ctx.reduced) return;
      // A different set of Pods on the same Node, so the strip is redrawn rather than resized.
      revealAt(s.refs.reqBar, ctx, 0);
    },
  },
];

export const init = makeInit(Scene, STEPS, { posterFirst: true });
