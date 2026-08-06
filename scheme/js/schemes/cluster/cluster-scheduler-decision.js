import { g, text } from '../../lib/svg.js';
import { arrowDefs, box, cylinder, chainList, arrow, podShell } from '../../lib/primitives.js';
import { valChip, setVal, segmentPacket, pulsePod, makeInit, clearHighlights, clearWires, setWire, relationPath, FADE, BEAT, lightBoxAt, OPACITY, diagramRoot } from './cluster-kit.js';

// Design notes for this card: ./CARDS.md#cluster-scheduler-decision

// Layout A, the Cluster exemplar: actor row clear of the panel, ladder left, chips right, candidate
// Nodes full width at the bottom. Panel x<=397 y<=180, and JOG_Y sits on that line.
const M = 60;
const CONTENT_L = M, CONTENT_R = 1200 - M;               // 60 / 1140
// Reserved narration corner: 400 x 180. Nothing on this card derives from it, and the measured
// worst case per viewport is in the header note above.

const TOP_Y = 60, TOP_H = 80, TOP_BOTTOM = TOP_Y + TOP_H;    // 60 / 140
const TOP_CY = TOP_Y + TOP_H / 2;                        // 100
const LANE_DY = 15;
const OUT_Y = TOP_CY - LANE_DY, BACK_Y = TOP_CY + LANE_DY;   // 85 / 115
const SCHED_W = 190, API_W = 300, ETCD_W = 130, TOP_GAP = 50;
const SCHED_X = 420, SCHED_R = SCHED_X + SCHED_W;        // 420..610
const API_X = SCHED_R + TOP_GAP, API_R = API_X + API_W;  // 660..960
const API_CX = API_X + API_W / 2;                        // 810
const ETCD_X = API_R + TOP_GAP;                          // 1010..1140
const WIRE_SA_X = (SCHED_R + API_X) / 2;                 // 635
const WIRE_AE_X = (API_R + ETCD_X) / 2;                  // 985

const ROW_H = 32, ROW_GAP = 12;
const LADDER_X = CONTENT_L, LADDER_W = 480;              // 60..540
const LADDER_Y = 220, LADDER_CX = LADDER_X + LADDER_W / 2;   // 220, 300
const CHIP_X = 660, CHIP_W = CONTENT_R - CHIP_X;         // 480, 660..1140
const CHIP_Y = i => LADDER_Y + i * (ROW_H + ROW_GAP);    // chips share the ladder rhythm

// A relationship, not a route: the API owns the Pod objects the cycle below reads. Face midpoint to
// face midpoint, turn halfway between them rather than hugging the ladder.
const JOG_Y = (TOP_BOTTOM + LADDER_Y) / 2;    // 180
const API_TO_CHAIN = [[API_CX, TOP_BOTTOM], [API_CX, JOG_Y], [LADDER_CX, JOG_Y], [LADDER_CX, LADDER_Y]];
// Centred in the band between the top row and that dashed jog, not pinned under the boxes: the +4
// puts the glyph MIDDLE on the band centre, where y=158 sat 7 under the row and 19 clear of the jog.
const WIRE_RESP_Y = (TOP_BOTTOM + JOG_Y) / 2 + 4;        // 164, visual centre 160.1 against 160

const NODE_Y = 410, NODE_H = 130, NODE_W = 240;
const NODE_XS = [60, 340, 620, 900];
const VERDICT_Y = 552, VERDICT_H = 32;
const PLACED_X = 912, PLACED_Y = 422, PLACED_W = 216, PLACED_H = 106;
const PLACED_INNER = { dx: 10, dy: 28, w: 196, h: 52 };

class Scene {
  constructor(host) { this.host = host; this.refs = {}; this.build(); }

  build() {
    this.host.replaceChildren();
    this.refs = {};
    const root = diagramRoot({ 'aria-label': 'Scheduler decision cycle: queue, filter, score, bind' });
    root.appendChild(arrowDefs());

    // Top row: even 50px gaps, Scheduler / Api / ETCD left to right, all clear of the panel.
    const sched = box({ x: SCHED_X, y: TOP_Y, w: SCHED_W, h: TOP_H, label: 'Scheduler', sublabel: 'watch unscheduled Pods', role: 'cluster' });
    const api   = box({ x: API_X, y: TOP_Y, w: API_W, h: TOP_H, label: 'API', sublabel: 'pods + binding subresource', role: 'cluster' });
    const etcdC = cylinder({ x: ETCD_X, y: TOP_Y - 10, w: ETCD_W, h: TOP_H + 20, label: 'ETCD', role: 'cluster' });
    // Centre the cylinder label optically: the default h/2 baseline reads high under the cap,
    // and a full nudge to the body-below-cap centre reads low. y=60 (glyph centre ~106) balances both.
    const etcdLbl = etcdC.querySelector('.scheme-cylinder-label');
    if (etcdLbl) etcdLbl.setAttribute('y', 60);

    // Pipeline ladder in the left column, below the panel.
    const chain = chainList({
      x: LADDER_X, y: LADDER_Y, w: LADDER_W, rowH: ROW_H, gap: ROW_GAP,
      items: [
        '1. queue   ·  Pod dequeued from SchedulingQueue',
        '2. filter  ·  plugins drop Nodes that fail predicates',
        '3. score   ·  plugins rank survivors 0 to 100',
        '4. bind    ·  POST .../pods/{name}/binding',
      ],
      role: 'cluster',
    });

    // State chips in the right column, one per ladder row so the two columns share a rhythm.
    const queueChip  = valChip({ x: CHIP_X, y: CHIP_Y(0), w: CHIP_W, h: ROW_H, name: 'queued pod', value: 'none', role: 'cluster' });
    const candChip   = valChip({ x: CHIP_X, y: CHIP_Y(1), w: CHIP_W, h: ROW_H, name: 'candidates', value: 'none', role: 'cluster' });
    const winnerChip = valChip({ x: CHIP_X, y: CHIP_Y(2), w: CHIP_W, h: ROW_H, name: 'winner',     value: 'none', role: 'cluster' });
    root.appendChild(queueChip);
    root.appendChild(candChip);
    root.appendChild(winnerChip);

    // Top-row arrows (out at y=100, return at y=130), all dashed.
    root.appendChild(arrow({ x1: SCHED_R, y1: OUT_Y,  x2: API_X, y2: OUT_Y,  dim: true, dashed: true, role: 'cluster' }));
    root.appendChild(arrow({ x1: API_X, y1: BACK_Y, x2: SCHED_R, y2: BACK_Y, dim: true, dashed: true, role: 'cluster' }));
    root.appendChild(arrow({ x1: API_R, y1: OUT_Y,  x2: ETCD_X, y2: OUT_Y,  dim: true, dashed: true, role: 'cluster' }));
    root.appendChild(arrow({ x1: ETCD_X, y1: BACK_Y, x2: API_R, y2: BACK_Y, dim: true, dashed: true, role: 'cluster' }));

    // Api.bottom → pipeline.top. No arrowhead and no ball: it states that the cycle below works on
    // the Pod objects the API holds, it does not carry traffic.
    root.appendChild(relationPath({ points: API_TO_CHAIN, role: 'cluster' }));

    // Wire labels at fixed positions, populated per step.
    const wireReq     = text({ class: 'scheme-label code dim', x: WIRE_SA_X, y: 46,  'text-anchor': 'middle' }, [' ']);
    const wireResp    = text({ class: 'scheme-label code dim', x: WIRE_SA_X, y: WIRE_RESP_Y, 'text-anchor': 'middle' }, [' ']);
    const wirePersist = text({ class: 'scheme-label code dim', x: WIRE_AE_X, y: 46,  'text-anchor': 'middle' }, [' ']);
    [wireReq, wireResp, wirePersist].forEach(t => root.appendChild(t));

    // Bottom row: 4 candidate nodes side-by-side.
    const nodeY = NODE_Y;
    const nodeH = NODE_H;
    const nodeW = NODE_W;
    const nx = NODE_XS;
    const nLabels = ['Node-1', 'Node-2', 'Node-3', 'Node-4'];
    const nSubs = [
      'taint dedicated=db:NoSchedule',
      'mem free 200Mi (req 800Mi)',
      'cpu 40% / mem 60%',
      'cpu 25% / mem 35%',
    ];
    const nodes = nx.map((x, i) => box({ x, y: nodeY, w: nodeW, h: nodeH, label: nLabels[i], sublabel: nSubs[i], role: 'cluster' }));
    nodes.forEach(n => root.appendChild(n));

    // Verdict chip below each node. Written out rather than mapped: prose.mjs seeds on a literal
    // valChip call, and a factory hides every verdict these four draw from check-inline (P-15).
    const v1 = valChip({ x: nx[0], y: VERDICT_Y, w: nodeW, h: VERDICT_H, name: 'verdict', value: 'none', role: 'cluster' });
    const v2 = valChip({ x: nx[1], y: VERDICT_Y, w: nodeW, h: VERDICT_H, name: 'verdict', value: 'none', role: 'cluster' });
    const v3 = valChip({ x: nx[2], y: VERDICT_Y, w: nodeW, h: VERDICT_H, name: 'verdict', value: 'none', role: 'cluster' });
    const v4 = valChip({ x: nx[3], y: VERDICT_Y, w: nodeW, h: VERDICT_H, name: 'verdict', value: 'none', role: 'cluster' });
    const verdicts = [v1, v2, v3, v4];
    verdicts.forEach(v => root.appendChild(v));

    const placedPodShell = podShell({ x: PLACED_X, y: PLACED_Y, w: PLACED_W, h: PLACED_H, label: 'Pod', sublabel: '', containers: 0, role: 'workloads' });
    placedPodShell.style.setProperty('--workloads-color', '#c0b0ff');

    // Inner box matches the workloads canon for a 216-wide shell: 10px side insets (w=196).
    const placedPodBox = box({ x: PLACED_X + PLACED_INNER.dx, y: PLACED_Y + PLACED_INNER.dy, w: PLACED_INNER.w, h: PLACED_INNER.h, label: 'my-app-7d4-abc', sublabel: 'nginx:1.27', role: 'workloads' });
    placedPodBox.style.setProperty('--workloads-color', '#c0b0ff');

    const placedPod = g({ id: 'placedPod' });
    placedPod.style.opacity = '0';
    placedPod.appendChild(placedPodShell);
    placedPod.appendChild(placedPodBox);
    root.appendChild(placedPod);

    const packetLayer = g({ id: 'packetLayer' });
    root.appendChild(packetLayer);

    // Chain LAST among middle blocks so it renders on top of packetLayer.
    root.appendChild(chain);

    // Top-row blocks ABSOLUTE LAST.
    root.appendChild(sched);
    root.appendChild(api);
    root.appendChild(etcdC);

    this.host.appendChild(root);
    this.refs = {
      svg: root, sched, api, etcdC, chain,
      queueChip, candChip, winnerChip,
      n1: nodes[0], n2: nodes[1], n3: nodes[2], n4: nodes[3],
      v1: verdicts[0], v2: verdicts[1], v3: verdicts[2], v4: verdicts[3],
      placedPod, placedPodBox, packetLayer,
      wires: { req: wireReq, resp: wireResp, persist: wirePersist },
    };
  }

  reset() { this.build(); }
}

function setChips(s, { queued, candidates, winner }) {
  setVal(s.refs.queueChip, queued);
  setVal(s.refs.candChip, candidates);
  setVal(s.refs.winnerChip, winner);
}

function resetStep(s) {
  s.refs.packetLayer.replaceChildren();
  clearHighlights(s,
    ['sched','api','etcdC','queueChip','candChip','winnerChip','n1','n2','n3','n4','v1','v2','v3','v4','placedPodBox']);
  clearWires(s);
}

function setN4TextOpacity(s, op) {
  const lbl = s.refs.n4.querySelector('.scheme-box-label');
  const sub = s.refs.n4.querySelector('.scheme-box-sublabel');
  if (lbl) lbl.style.opacity = op;
  if (sub) sub.style.opacity = op;
}

function resetNodeOpacity(s) {
  ['n1','n2','n3','n4'].forEach(k => { s.refs[k].style.opacity = '1'; });
}

function resetVerdicts(s) {
  ['v1','v2','v3','v4'].forEach(k => setVal(s.refs[k], 'none'));
}

const STEPS = [
  {
    id: 'idle',
    duration: 1500,
    enter(s) {
      resetStep(s);
      resetNodeOpacity(s);
      resetVerdicts(s);
      setChips(s, { queued: 'none', candidates: 'none', winner: 'none' });
      s.refs.placedPod.style.opacity = '0';
    },
  },
  {
    id: 'queue',
    duration: 2800,
    narration: 'A new Pod my-app-7d4-abc reaches the Scheduler on its watch with spec.nodeName empty. Until that field is set, no Kubelet will start it. The Scheduler pops it off the active queue and runs one scheduling cycle.',
    enter(s, ctx) {
      resetStep(s);
      resetNodeOpacity(s);
      resetVerdicts(s);
      setChips(s, { queued: 'my-app-7d4-abc', candidates: '4 of 4', winner: 'none' });
      s.refs.candChip.classList.add('highlight');
      setVal(s.refs.winnerChip, 'none');
      setWire(s, 'resp', 'watch ADDED · spec.nodeName=""');
      s.refs.api.classList.add('highlight');
      s.refs.queueChip.classList.add('highlight');
      const rows = s.refs.chain.querySelectorAll('.scheme-chip');
      if (rows[0]) rows[0].classList.add('highlight');
      if (ctx.reduced) { s.refs.sched.classList.add('highlight'); return; }
      // Watch event flows Api → Scheduler on the return lane at y=115. The queue and the three
      // stages below it are the Scheduler's own work, so nothing travels down to the ladder.
      const watch = segmentPacket(s, ctx, { from: [API_X, BACK_Y], to: [SCHED_R, BACK_Y], role: 'cluster' });
      lightBoxAt(s.refs.sched, ctx, watch.arrivalMs);
    },
  },
  {
    id: 'filter',
    duration: 2300,
    narration: 'Filter plugins test each Node against the Pod requirements, and in a large cluster they stop once enough Nodes fit. Node-1 carries a NoSchedule taint without a matching toleration, Node-2 lacks the requested memory. Both are dropped before scoring.',
    enter(s, ctx) {
      resetStep(s);
      setChips(s, { queued: 'my-app-7d4-abc', candidates: '2 of 4', winner: 'none' });
      setVal(s.refs.v1, 'filtered · taint');
      setVal(s.refs.v2, 'filtered · resources');
      setVal(s.refs.v3, 'none');
      setVal(s.refs.v4, 'none');
      // Filtering is the Scheduler's own work (the Api is not involved), so the Scheduler lights up.
      s.refs.sched.classList.add('highlight');
      s.refs.candChip.classList.add('highlight');
      s.refs.v1.classList.add('highlight');
      s.refs.v2.classList.add('highlight');
      const rows = s.refs.chain.querySelectorAll('.scheme-chip');
      if (rows[1]) rows[1].classList.add('highlight');
      // Pin final opacity inline so cancel between steps does not flash to default.
      s.refs.n1.style.opacity = String(OPACITY.notready);
      s.refs.n2.style.opacity = String(OPACITY.notready);
      s.refs.n3.style.opacity = '1';
      s.refs.n4.style.opacity = '1';
      if (ctx.reduced) return;
      ctx.register(s.refs.n1.animate([{ opacity: 1 }, { opacity: OPACITY.notready }], { duration: FADE.out, fill: 'forwards', easing: 'ease-in' }));
      ctx.register(s.refs.n2.animate([{ opacity: 1 }, { opacity: OPACITY.notready }], { duration: FADE.out, fill: 'forwards', easing: 'ease-in' }));
    },
  },
  {
    id: 'score',
    // 1400ms was the shortest step on the card and it carries the densest text with no motion at
    // all, so nothing but reading time sets it: 2200 matches the packet-less pace of the siblings.
    duration: 2200,
    narration: 'Surviving Nodes are ranked by score plugins like NodeResourcesFit, NodeAffinity and PodTopologySpread. Each returns 0 to 100 for a Node and the weighted sum is the final score: Node-3 gets 78, Node-4 gets 92. See the Pod Priority and Preemption card.',
    enter(s, ctx) {
      resetStep(s);
      setChips(s, { queued: 'my-app-7d4-abc', candidates: '2 of 4', winner: 'none' });
      setVal(s.refs.v3, 'score 78');
      setVal(s.refs.v4, 'score 92');
      s.refs.n1.style.opacity = String(OPACITY.notready);
      s.refs.n2.style.opacity = String(OPACITY.notready);
      s.refs.n3.classList.add('highlight');
      s.refs.n4.classList.add('highlight');
      s.refs.v3.classList.add('highlight');
      s.refs.v4.classList.add('highlight');
      const rows = s.refs.chain.querySelectorAll('.scheme-chip');
      if (rows[2]) rows[2].classList.add('highlight');
      // Computed inside the Scheduler, so nothing travels and nothing pulses: the verdicts settle
      // via the static highlight. The Scheduler lights because the step is its own work.
      s.refs.sched.classList.add('highlight');
    },
  },
  {
    id: 'bind',
    // Three hops now, span 2860: 2400 would have cut the commit ack off mid-flight.
    duration: 3000,
    narration: 'Highest score wins, ties broken at random. The Scheduler assumes the placement so the next Pod sees Node-4 as taken. It POSTs a Binding to the binding subresource, not a Pod patch, and the API writes it into ETCD, which acks the Raft commit.',
    enter(s, ctx) {
      resetStep(s);
      setChips(s, { queued: 'my-app-7d4-abc', candidates: '2 of 4', winner: 'Node-4 · 92' });
      setWire(s, 'req', 'POST .../pods/my-app-7d4-abc/binding');
      setWire(s, 'persist', 'spec.nodeName=Node-4 · rv=903');
      s.refs.n1.style.opacity = String(OPACITY.notready);
      s.refs.n2.style.opacity = String(OPACITY.notready);
      s.refs.sched.classList.add('highlight');
      s.refs.winnerChip.classList.add('highlight');
      s.refs.n4.classList.add('highlight');
      // Lit on score, lit on placed, so it stays lit here: the verdict chip follows the Node above
      // it, and going dark for one step in the middle read as the winner being un-chosen.
      s.refs.v4.classList.add('highlight');
      const rows = s.refs.chain.querySelectorAll('.scheme-chip');
      if (rows[3]) rows[3].classList.add('highlight');
      if (ctx.reduced) { s.refs.api.classList.add('highlight'); s.refs.etcdC.classList.add('highlight'); return; }
      // Three hops: binding POST, persist, then the commit ack home. The Api is MID-CHAIN, so it
      // lights on arrival like ETCD. The ack is what rv=903 on the persist wire is.
      const post = segmentPacket(s, ctx, { from: [SCHED_R, OUT_Y], to: [API_X, OUT_Y], role: 'cluster' });
      lightBoxAt(s.refs.api, ctx, post.arrivalMs);
      const etcdCPkt = segmentPacket(s, ctx, { from: [API_R, OUT_Y], to: [ETCD_X, OUT_Y], delay: post.arrivalMs + BEAT.afterHop, role: 'cluster' });
      lightBoxAt(s.refs.etcdC, ctx, etcdCPkt.arrivalMs);
      segmentPacket(s, ctx, { from: [ETCD_X, BACK_Y], to: [API_R, BACK_Y], delay: etcdCPkt.arrivalMs + BEAT.afterHop, role: 'cluster' });
    },
  },
  {
    id: 'placed',
    duration: 2200,
    narration: 'The Kubelet on Node-4 watches /api/v1/pods?fieldSelector=spec.nodeName=Node-4, so the write arrives there as an ADDED event. It pulls the image and starts the containers, and the Pod goes from Pending to Running.',
    enter(s, ctx) {
      resetStep(s);
      setChips(s, { queued: 'my-app-7d4-abc', candidates: '2 of 4', winner: 'Node-4 · 92' });
      s.refs.n1.style.opacity = String(OPACITY.notready);
      s.refs.n2.style.opacity = String(OPACITY.notready);
      s.refs.n4.classList.add('highlight');
      // The verdict chip belongs to the Node above it, so it takes the same highlight: without it
      // the winning column ended with a lit frame over a chip shaded like the two filtered ones.
      s.refs.v4.classList.add('highlight');
      s.refs.placedPodBox.classList.add('highlight');
      // Hide node-4's own label and sublabel so the inner box reads cleanly inside the slot.
      setN4TextOpacity(s, '0');
      // Pin final state inline so cancel returns to the right value, not default.
      s.refs.placedPod.style.opacity = '1';
      if (ctx.reduced) return;
      // The placed Pod fades in and pulses together (shared delay), matching the
      // workloads pod-pulse canon, instead of pulsing a beat after the fade.
      ctx.register(s.refs.placedPod.animate([{ opacity: 0 }, { opacity: 1 }], { duration: FADE.in, fill: 'both', easing: 'ease-out' }));
      pulsePod(s.refs.placedPod, ctx, 0);
    },
  },
];

export const init = makeInit(Scene, STEPS, { posterFirst: true });
