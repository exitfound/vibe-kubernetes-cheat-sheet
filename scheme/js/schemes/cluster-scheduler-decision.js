import { svg, g, text } from '../lib/svg.js';
import { arrowDefs, pod, box, cylinder, chainList, arrow } from '../lib/primitives.js';
import { valChip, setVal, segmentPacket, pulsePod, makeInit, clearHighlights, clearWires, setWire, FADE, BEAT } from '../lib/cluster-kit.js';

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
    const sched = box({ x: 180, y: 60, w: 200, h: 80, label: 'Scheduler', sublabel: 'watch unscheduled Pods', role: 'cluster' });
    const api   = box({ x: 440, y: 60, w: 320, h: 80, label: 'Api', sublabel: 'pods + binding subresource', role: 'cluster' });
    const etcdC = cylinder({ x: 820, y: 50, w: 140, h: 100, label: 'ETCD', role: 'cluster' });
    // Centre the cylinder label optically: the default h/2 baseline reads high under the cap,
    // and a full nudge to the body-below-cap centre reads low. y=60 (glyph centre ~106) balances both.
    const etcdLbl = etcdC.querySelector('.scheme-cylinder-label');
    if (etcdLbl) etcdLbl.setAttribute('y', 60);

    // Pipeline chain centred under Api (cx=600), w=400 so it never reaches into the chip column.
    const chain = chainList({
      x: 400, y: 220, w: 400, rowH: 32, gap: 12,
      items: [
        '1. queue   ·  Pod dequeued from SchedulingQueue',
        '2. filter  ·  plugins drop Nodes that fail predicates',
        '3. score   ·  plugins rank survivors 0 to 100',
        '4. bind    ·  POST .../pods/{name}/binding',
      ],
      role: 'cluster',
    });

    // State chips column. Three chips, top-aligned with the first three chain rows and
    // right-aligned with node-4 + the placed Pod so the whole right edge reads as one column.
    const queueChip  = valChip({ x: 900, y: 220, w: 240, h: 32, name: 'queued pod', value: 'none', role: 'cluster' });
    const candChip   = valChip({ x: 900, y: 264, w: 240, h: 32, name: 'candidates', value: 'none', role: 'cluster' });
    const winnerChip = valChip({ x: 900, y: 308, w: 240, h: 32, name: 'winner',     value: 'none', role: 'cluster' });
    root.appendChild(queueChip);
    root.appendChild(candChip);
    root.appendChild(winnerChip);

    // Top-row arrows (out at y=100, return at y=130), all dashed.
    root.appendChild(arrow({ x1: 380, y1: 85,  x2: 440, y2: 85,  dim: true, dashed: true, role: 'cluster' }));
    root.appendChild(arrow({ x1: 440, y1: 115, x2: 380, y2: 115, dim: true, dashed: true, role: 'cluster' }));
    root.appendChild(arrow({ x1: 760, y1: 85,  x2: 820, y2: 85,  dim: true, dashed: true, role: 'cluster' }));
    root.appendChild(arrow({ x1: 820, y1: 115, x2: 760, y2: 115, dim: true, dashed: true, role: 'cluster' }));

    // Connector Api.bottom → pipeline.top (x=600 spine).
    root.appendChild(arrow({ x1: 600, y1: 140, x2: 600, y2: 218, dim: true, dashed: true, role: 'cluster' }));

    // Wire labels at fixed positions, populated per step.
    const wireReq     = text({ class: 'scheme-label code dim', x: 410, y: 46,  'text-anchor': 'middle' }, [' ']);
    const wireResp    = text({ class: 'scheme-label code dim', x: 410, y: 158, 'text-anchor': 'middle' }, [' ']);
    const wirePersist = text({ class: 'scheme-label code dim', x: 790, y: 46,  'text-anchor': 'middle' }, [' ']);
    [wireReq, wireResp, wirePersist].forEach(t => root.appendChild(t));

    // Bottom row: 4 candidate nodes side-by-side.
    const nodeY = 410;
    const nodeH = 130;
    const nodeW = 240;
    const nx = [60, 340, 620, 900];
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
    const verdicts = nx.map((x) => valChip({ x, y: 552, w: nodeW, h: 32, name: 'verdict', value: 'none', role: 'cluster' }));
    verdicts.forEach(v => root.appendChild(v));

    const placedPodShell = pod({ x: 912, y: 422, w: 216, h: 106, label: 'Pod', sublabel: '', containers: 0, role: 'workloads' });
    placedPodShell.style.setProperty('--workloads-color', '#c0b0ff');
    const placedPodShellRect = placedPodShell.querySelector('.scheme-pod-rect');
    if (placedPodShellRect) placedPodShellRect.style.fill = 'rgba(255, 255, 255, 0.03)';

    // Inner box matches the workloads canon for a 216-wide shell: 10px side insets (w=196).
    const placedPodBox = box({ x: 922, y: 450, w: 196, h: 52, label: 'my-app-7d4-abc', sublabel: 'nginx:1.27', role: 'workloads' });
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
    narration: 'Kube-scheduler runs on the Control Plane and watches the Api for unscheduled Pods. For each one it owns the placement decision through four discrete stages.',
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
    duration: 1900,
    narration: 'A new Pod my-app-7d4-abc lands on the Scheduler queue with an empty spec.nodeName. Until that field is set, no Kubelet will start the Pod. The Scheduler pulls it off the queue and begins the per-pod cycle.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      resetNodeOpacity(s);
      resetVerdicts(s);
      setVal(s.refs.queueChip, 'my-app-7d4-abc');
      setVal(s.refs.candChip, '4 of 4');
      setVal(s.refs.winnerChip, 'none');
      setWire(s, 'resp', 'watch ADDED · spec.nodeName=""');
      s.refs.sched.classList.add('highlight');
      s.refs.api.classList.add('highlight');
      s.refs.queueChip.classList.add('highlight');
      const rows = s.refs.chain.querySelectorAll('.scheme-chip');
      if (rows[0]) rows[0].classList.add('highlight');
      if (ctx.reduced) return;
      // Watch event flows Api → Scheduler (return arrow at y=130), then drops to pipeline row 1.
      const watch = segmentPacket(s, ctx, { from: [440, 115], to: [380, 115], role: 'cluster' });
      segmentPacket(s, ctx, { from: [600, 140], to: [600, 218], delay: watch.arrivalMs + BEAT.afterHop, role: 'cluster' });
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
      s.refs.n1.style.opacity = '0.35';
      s.refs.n2.style.opacity = '0.35';
      s.refs.n3.style.opacity = '1';
      s.refs.n4.style.opacity = '1';
      if (ctx.reduced) return;
      ctx.register(s.refs.n1.animate([{ opacity: 1 }, { opacity: 0.35 }], { duration: FADE.out, fill: 'forwards', easing: 'ease-in' }));
      ctx.register(s.refs.n2.animate([{ opacity: 1 }, { opacity: 0.35 }], { duration: FADE.out, fill: 'forwards', easing: 'ease-in' }));
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
      s.refs.n1.style.opacity = '0.35';
      s.refs.n2.style.opacity = '0.35';
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
    narration: 'Highest score wins, ties broken at random. The Scheduler does not patch the Pod itself. It POSTs a Binding to the binding subresource, and the Api writes spec.nodeName=Node-4 into ETCD via Raft.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setVal(s.refs.winnerChip, 'Node-4 · 92');
      setWire(s, 'req', 'POST .../pods/my-app-7d4-abc/binding');
      setWire(s, 'persist', 'spec.nodeName=Node-4 · rv=903');
      s.refs.n1.style.opacity = '0.35';
      s.refs.n2.style.opacity = '0.35';
      s.refs.sched.classList.add('highlight');
      s.refs.api.classList.add('highlight');
      s.refs.etcdC.classList.add('highlight');
      s.refs.winnerChip.classList.add('highlight');
      s.refs.n4.classList.add('highlight');
      const rows = s.refs.chain.querySelectorAll('.scheme-chip');
      if (rows[3]) rows[3].classList.add('highlight');
      if (ctx.reduced) return;
      // Two arrow segments: Scheduler → Api (binding POST), then Api → ETCD (persist).
      const post = segmentPacket(s, ctx, { from: [380, 85], to: [440, 85], role: 'cluster' });
      segmentPacket(s, ctx, { from: [760, 85], to: [820, 85], delay: post.arrivalMs + BEAT.afterHop, role: 'cluster' });
    },
  },
  {
    id: 'placed',
    duration: 2200,
    narration: 'The Kubelet on Node-4 has a filtered watch on /api/v1/pods?fieldSelector=spec.nodeName=Node-4. The MODIFIED event arrives, Kubelet pulls the image, and the Pod transitions to Running.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setVal(s.refs.winnerChip, 'Node-4 · 92');
      s.refs.n1.style.opacity = '0.35';
      s.refs.n2.style.opacity = '0.35';
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
