import { svg, g, text } from '../lib/svg.js';
import { arrowDefs, pod, box, cylinder, chainList, arrow, pathArrow } from '../lib/primitives.js';
import { valChip, setVal, segmentPacket, routePacket, pulsePod, makeInit, clearHighlights, clearWires, setWire, FADE, BEAT, lightBoxAt, OPACITY } from '../lib/cluster-kit.js';

// Layout A, the Cluster exemplar: actor row on top clear of the panel, pipeline ladder in the left
// column, state chips in the right column, candidate Nodes full width at the bottom.
// Panel worst case over 1600/1280/1100 is x<=397, y<=181.
const M = 60;
const CONTENT_L = M, CONTENT_R = 1200 - M;               // 60 / 1140
const CX = (CONTENT_L + CONTENT_R) / 2;                  // 600
const PANEL_R = 400, PANEL_B = 181;                      // the reserved corner, measured

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

// The bind path leaves the API on its bottom midpoint and turns onto the ladder's top midpoint.
// The turn sits at JOG_Y, below the panel, because the ladder now stands in the left column.
const JOG_Y = 200;
const API_TO_CHAIN = [[API_CX, TOP_BOTTOM], [API_CX, JOG_Y], [LADDER_CX, JOG_Y], [LADDER_CX, LADDER_Y - 2]];

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
    const root = svg({
      class: 'diagram',
      viewBox: '0 0 1200 640',
      preserveAspectRatio: 'xMidYMid meet',
      'aria-label': 'Scheduler decision cycle: queue, filter, score, bind',
      'data-style': 'outline',
    });
    root.appendChild(arrowDefs());

    // Top row: even 60px gaps, Api centred on x=600 so its downward spine lands on the pipeline.
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

    // Connector Api.bottom → pipeline.top (x=600 spine).
    root.appendChild(pathArrow({ points: API_TO_CHAIN, dim: true, dashed: true, role: 'cluster' }));

    // Wire labels at fixed positions, populated per step.
    const wireReq     = text({ class: 'scheme-label code dim', x: WIRE_SA_X, y: 46,  'text-anchor': 'middle' }, [' ']);
    const wireResp    = text({ class: 'scheme-label code dim', x: WIRE_SA_X, y: 158, 'text-anchor': 'middle' }, [' ']);
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

    // Verdict chip below each node.
    const verdicts = nx.map((x) => valChip({ x, y: VERDICT_Y, w: nodeW, h: VERDICT_H, name: 'verdict', value: 'none', role: 'cluster' }));
    verdicts.forEach(v => root.appendChild(v));

    const placedPodShell = pod({ x: PLACED_X, y: PLACED_Y, w: PLACED_W, h: PLACED_H, label: 'Pod', sublabel: '', containers: 0, role: 'workloads' });
    placedPodShell.style.setProperty('--workloads-color', '#c0b0ff');
    const placedPodShellRect = placedPodShell.querySelector('.scheme-pod-rect');
    if (placedPodShellRect) placedPodShellRect.style.fill = 'rgba(255, 255, 255, 0.03)';

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

function clearHL(s) {
  clearHighlights(s,
    ['sched','api','etcdC','queueChip','candChip','winnerChip','n1','n2','n3','n4','v1','v2','v3','v4','placedPodBox']);
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
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      resetNodeOpacity(s);
      resetVerdicts(s);
      setVal(s.refs.queueChip, 'none');
      setVal(s.refs.candChip, 'none');
      setVal(s.refs.winnerChip, 'none');
      s.refs.placedPod.style.opacity = '0';
    },
  },
  {
    id: 'queue',
    duration: 2800,
    narration: 'A new Pod my-app-7d4-abc lands on the Scheduler queue with an empty spec.nodeName. Until that field is set, no Kubelet will start the Pod. The Scheduler pulls it off the queue and begins the per-pod cycle.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      resetNodeOpacity(s);
      resetVerdicts(s);
      setVal(s.refs.queueChip, 'my-app-7d4-abc');
      setVal(s.refs.candChip, '4 of 4');
      s.refs.candChip.classList.add('highlight');
      setVal(s.refs.winnerChip, 'none');
      setWire(s, 'resp', 'watch ADDED · spec.nodeName=""');
      s.refs.api.classList.add('highlight');
      s.refs.queueChip.classList.add('highlight');
      const rows = s.refs.chain.querySelectorAll('.scheme-chip');
      if (rows[0]) rows[0].classList.add('highlight');
      if (ctx.reduced) { s.refs.sched.classList.add('highlight'); return; }
      // Watch event flows Api → Scheduler (return arrow at y=130), then drops to pipeline row 1.
      const watch = segmentPacket(s, ctx, { from: [API_X, BACK_Y], to: [SCHED_R, BACK_Y], role: 'cluster' });
      lightBoxAt(s.refs.sched, ctx, watch.arrivalMs);
      routePacket(s, ctx, API_TO_CHAIN, { delay: watch.arrivalMs + BEAT.afterHop, role: 'cluster' });
    },
  },
  {
    id: 'filter',
    duration: 2300,
    narration: 'Filter plugins evaluate every Node against the Pod requirements. Node-1 carries a NoSchedule taint without a matching toleration, Node-2 lacks the requested memory. Both are dropped before scoring.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setVal(s.refs.candChip, '2 of 4');
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
    duration: 1400,
    narration: 'Surviving Nodes are ranked by score plugins like NodeResourcesFit, NodeAffinity, and PodTopologySpread. Each plugin returns 0 to 100 and the values are weighted-summed: Node-3 scores 78, Node-4 scores 92.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
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
      // Scoring is computed inside the Scheduler, nothing travels and nothing pulses:
      // the score verdicts just settle on v3/v4 via the static highlight.
    },
  },
  {
    id: 'bind',
    duration: 2400,
    narration: 'Highest score wins, ties broken at random. The Scheduler does not patch the Pod itself. It POSTs a Binding to the binding subresource, and the API writes spec.nodeName=Node-4 into ETCD via Raft.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setVal(s.refs.winnerChip, 'Node-4 · 92');
      setWire(s, 'req', 'POST .../pods/my-app-7d4-abc/binding');
      setWire(s, 'persist', 'spec.nodeName=Node-4 · rv=903');
      s.refs.n1.style.opacity = String(OPACITY.notready);
      s.refs.n2.style.opacity = String(OPACITY.notready);
      s.refs.sched.classList.add('highlight');
      s.refs.winnerChip.classList.add('highlight');
      s.refs.n4.classList.add('highlight');
      const rows = s.refs.chain.querySelectorAll('.scheme-chip');
      if (rows[3]) rows[3].classList.add('highlight');
      if (ctx.reduced) { s.refs.api.classList.add('highlight'); s.refs.etcdC.classList.add('highlight'); return; }
      // Two arrow segments: Scheduler → Api (binding POST), then Api → ETCD (persist). The Api is
      // mid-chain here: it takes the POST before it writes, so it lights on arrival like ETCD does.
      const post = segmentPacket(s, ctx, { from: [SCHED_R, OUT_Y], to: [API_X, OUT_Y], role: 'cluster' });
      lightBoxAt(s.refs.api, ctx, post.arrivalMs);
      const etcdCPkt = segmentPacket(s, ctx, { from: [API_R, OUT_Y], to: [ETCD_X, OUT_Y], delay: post.arrivalMs + BEAT.afterHop, role: 'cluster' });
      lightBoxAt(s.refs.etcdC, ctx, etcdCPkt.arrivalMs);
    },
  },
  {
    id: 'placed',
    duration: 2200,
    narration: 'Node-4 sees the Pod through a filtered watch on /api/v1/pods?fieldSelector=spec.nodeName=Node-4. On that ADDED event the image is pulled by the Kubelet there, and the Pod transitions to Running.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setVal(s.refs.winnerChip, 'Node-4 · 92');
      s.refs.n1.style.opacity = String(OPACITY.notready);
      s.refs.n2.style.opacity = String(OPACITY.notready);
      s.refs.n4.classList.add('highlight');
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
