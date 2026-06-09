import { svg, g, rect, text, line } from '../lib/svg.js';
import { arrowDefs, pod, box, cylinder, chainList, arrow, packet, pulse, fadeIn } from '../lib/primitives.js';
import { Timeline } from '../lib/timeline.js';

function valChip({ x, y, w, h = 32, name, value, cat = 'control' }) {
  const grp = g({ class: 'scheme-chip', 'data-cat': cat, transform: `translate(${x},${y})` });
  grp.appendChild(rect({ class: 'scheme-chip-rect', x: 0, y: 0, width: w, height: h, rx: 4 }));
  grp.appendChild(text({ class: 'scheme-chip-text', x: 12, y: h / 2 + 4, 'text-anchor': 'start' }, [name]));
  const valueT = text({ class: 'scheme-chip-text', x: w - 12, y: h / 2 + 4, 'text-anchor': 'end' }, [value]);
  grp.appendChild(valueT);
  grp.valueText = valueT;
  return grp;
}
function setVal(node, txt) { if (node && node.valueText) node.valueText.textContent = txt; }

// Helper: a packet visible only while travelling along a single arrow segment.
function arrowPacket(s, ctx, { from, to, delay = 0, dur = 500, fadeIn: fIn = 80, fadeOut: fOut = 120 }) {
  const p = packet({ x: from[0], y: from[1], cat: 'control' });
  p.style.opacity = '0';
  s.refs.packetLayer.appendChild(p);
  ctx.register(p.animate(
    [{ opacity: 0 }, { opacity: 1 }],
    { duration: fIn, delay, fill: 'forwards', easing: 'linear' }
  ));
  ctx.register(p.animate(
    [
      { transform: `translate(${from[0]}px, ${from[1]}px)` },
      { transform: `translate(${to[0]}px, ${to[1]}px)` },
    ],
    { duration: dur, delay, fill: 'forwards', easing: 'linear' }
  ));
  ctx.register(p.animate(
    [{ opacity: 1 }, { opacity: 0 }],
    { duration: fOut, delay: delay + dur, fill: 'forwards', easing: 'linear' }
  ));
}

class Scene {
  constructor(host) { this.host = host; this.refs = {}; this.build(); }

  build() {
    this.host.replaceChildren();
    this.refs = {};
    const root = svg({
      class: 'diagram',
      viewBox: '0 0 1200 620',
      preserveAspectRatio: 'xMidYMid meet',
      'aria-label': 'Scheduler decision cycle: queue, filter, score, bind',
      'data-style': 'outline',
    });
    root.appendChild(arrowDefs());

    const sched = box({ x: 200, y: 60, w: 200, h: 80, label: 'Scheduler', sublabel: 'watch unscheduled Pods', cat: 'control' });
    const api   = box({ x: 460, y: 60, w: 320, h: 80, label: 'ApiServer', sublabel: 'pods + binding subresource', cat: 'control' });
    const etcdC = cylinder({ x: 850, y: 50, w: 140, h: 100, label: 'ETCD', cat: 'control' });

    // Pipeline chain centred under ApiServer, w=400 so it never reaches into the chip column.
    const chain = chainList({
      x: 400, y: 220, w: 400, rowH: 32, gap: 12,
      items: [
        '1. queue   ·  Pod dequeued from SchedulingQueue',
        '2. filter  ·  plugins drop nodes that fail predicates',
        '3. score   ·  plugins rank survivors 0 to 100',
        '4. bind    ·  POST .../pods/{name}/binding',
      ],
      cat: 'control',
    });

    // State chips column. Three chips, top-aligned with the first three chain rows.
    const queueChip  = valChip({ x: 820, y: 220, w: 360, h: 32, name: 'queued pod', value: '—' });
    const candChip   = valChip({ x: 820, y: 264, w: 360, h: 32, name: 'candidates', value: '—' });
    const winnerChip = valChip({ x: 820, y: 308, w: 360, h: 32, name: 'winner',     value: '—' });
    root.appendChild(queueChip);
    root.appendChild(candChip);
    root.appendChild(winnerChip);

    // Top-row arrows (out at y=100, return at y=130) — all dashed.
    root.appendChild(arrow({ x1: 400, y1: 100, x2: 460, y2: 100, dim: true, dashed: true, color: 'control' }));
    root.appendChild(arrow({ x1: 460, y1: 130, x2: 400, y2: 130, dim: true, dashed: true, color: 'control' }));
    root.appendChild(arrow({ x1: 780, y1: 100, x2: 850, y2: 100, dim: true, dashed: true, color: 'control' }));
    root.appendChild(arrow({ x1: 850, y1: 130, x2: 780, y2: 130, dim: true, dashed: true, color: 'control' }));

    // Connector ApiServer.bottom → pipeline.top.
    root.appendChild(arrow({ x1: 620, y1: 140, x2: 620, y2: 218, dim: true, dashed: true, color: 'control' }));

    // Solid colour-monotone connection line ETCD → chip column. No arrowhead, not dashed.
    root.appendChild(line({
      class: 'scheme-arrow scheme-arrow-control',
      x1: 920, y1: 154, x2: 920, y2: 220,
    }));

    // Wire labels at fixed positions, populated per step.
    const wireReq     = text({ class: 'scheme-label code dim', x: 430, y: 46,  'text-anchor': 'middle' }, [' ']);
    const wireResp    = text({ class: 'scheme-label code dim', x: 430, y: 158, 'text-anchor': 'middle' }, [' ']);
    const wirePersist = text({ class: 'scheme-label code dim', x: 815, y: 46,  'text-anchor': 'middle' }, [' ']);
    [wireReq, wireResp, wirePersist].forEach(t => root.appendChild(t));

    // Bottom row: 4 candidate nodes side-by-side.
    const nodeY = 410;
    const nodeH = 130;
    const nodeW = 240;
    const nx = [60, 340, 620, 900];
    const nLabels = ['node-1', 'node-2', 'node-3', 'node-4'];
    const nSubs = [
      'taint dedicated=db:NoSchedule',
      'mem free 200Mi (req 800Mi)',
      'cpu 40% / mem 60%',
      'cpu 25% / mem 35%',
    ];
    const nodes = nx.map((x, i) => box({ x, y: nodeY, w: nodeW, h: nodeH, label: nLabels[i], sublabel: nSubs[i], cat: 'control' }));
    nodes.forEach(n => root.appendChild(n));

    // Verdict chip below each node.
    const verdicts = nx.map((x) => valChip({ x, y: 552, w: nodeW, h: 32, name: 'verdict', value: '—' }));
    verdicts.forEach(v => root.appendChild(v));

    const placedPodShell = pod({ x: 912, y: 422, w: 216, h: 106, label: 'Pod', sublabel: '', containers: 0, cat: 'workloads' });
    placedPodShell.style.setProperty('--workloads-color', '#c0b0ff');
    const placedPodShellRect = placedPodShell.querySelector('.scheme-pod-rect');
    if (placedPodShellRect) placedPodShellRect.style.fill = 'rgba(255, 255, 255, 0.03)';

    const placedPodBox = box({ x: 942, y: 450, w: 156, h: 52, label: 'my-app-7d4-abc', sublabel: 'nginx:1.27', cat: 'workloads' });
    placedPodBox.style.setProperty('--workloads-color', '#c0b0ff');

    const placedPod = g({ id: 'placedPod' });
    placedPod.style.opacity = '0';
    placedPod.appendChild(placedPodShell);
    placedPod.appendChild(placedPodBox);
    root.appendChild(placedPod);

    // Packet layer.
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
  ['sched','api','etcdC','queueChip','candChip','winnerChip','n1','n2','n3','n4','v1','v2','v3','v4','placedPodBox']
    .forEach(k => s.refs[k].classList.remove('highlight'));
  s.refs.chain.querySelectorAll('.scheme-chip').forEach(r => r.classList.remove('highlight'));
}

function setN4TextOpacity(s, op) {
  const lbl = s.refs.n4.querySelector('.scheme-box-label');
  const sub = s.refs.n4.querySelector('.scheme-box-sublabel');
  if (lbl) lbl.style.opacity = op;
  if (sub) sub.style.opacity = op;
}

function clearWires(s) {
  Object.values(s.refs.wires).forEach(t => { t.textContent = ''; });
}

function setWire(s, key, txt) {
  if (s.refs.wires[key]) s.refs.wires[key].textContent = txt;
}

function resetNodeOpacity(s) {
  ['n1','n2','n3','n4'].forEach(k => { s.refs[k].style.opacity = '1'; });
}

function resetVerdicts(s) {
  ['v1','v2','v3','v4'].forEach(k => setVal(s.refs[k], '—'));
}

const STEPS = [
  {
    id: 'idle',
    duration: 1500,
    narration: 'Kube-scheduler runs on the Control Plane and watches the ApiServer for unscheduled Pods. For each one it owns the placement decision through four discrete stages.',
    enter(s) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      resetNodeOpacity(s);
      resetVerdicts(s);
      setVal(s.refs.queueChip, '—');
      setVal(s.refs.candChip, '—');
      setVal(s.refs.winnerChip, '—');
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
      setVal(s.refs.winnerChip, '—');
      setWire(s, 'resp', 'watch ADDED · spec.nodeName=""');
      s.refs.sched.classList.add('highlight');
      s.refs.api.classList.add('highlight');
      s.refs.queueChip.classList.add('highlight');
      const rows = s.refs.chain.querySelectorAll('.scheme-chip');
      if (rows[0]) rows[0].classList.add('highlight');
      if (ctx.reduced) return;
      // Watch event flows ApiServer → Scheduler (return arrow at y=130), then drops to pipeline row 1.
      arrowPacket(s, ctx, { from: [460, 130], to: [400, 130], delay: 0,    dur: 600 });
      arrowPacket(s, ctx, { from: [620, 140], to: [620, 218], delay: 900,  dur: 600 });
      ctx.register(pulse(rows[0], { duration: 700, iterations: 1 }));
    },
  },
  {
    id: 'filter',
    duration: 2300,
    narration: 'Filter plugins evaluate every node against the Pod requirements. Node-1 carries a NoSchedule taint without a matching toleration, node-2 lacks the requested memory. Both are dropped before scoring.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setVal(s.refs.candChip, '2 of 4');
      setVal(s.refs.v1, 'filtered · taint');
      setVal(s.refs.v2, 'filtered · resources');
      setVal(s.refs.v3, '—');
      setVal(s.refs.v4, '—');
      s.refs.api.classList.add('highlight');
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
      ctx.register(s.refs.n1.animate([{ opacity: 1 }, { opacity: 0.35 }], { duration: 600, fill: 'forwards', easing: 'ease-in' }));
      ctx.register(s.refs.n2.animate([{ opacity: 1 }, { opacity: 0.35 }], { duration: 600, fill: 'forwards', easing: 'ease-in' }));
      ctx.register(pulse(rows[1], { duration: 800, iterations: 1 }));
    },
  },
  {
    id: 'score',
    duration: 2200,
    narration: 'Surviving nodes are ranked by score plugins like NodeResourcesFit, NodeAffinity, and PodTopologySpread. Each plugin returns 0 to 100 and the values are weighted-summed: node-3 scores 78, node-4 scores 92.',
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
      if (ctx.reduced) return;
      ctx.register(pulse(rows[2], { duration: 800, iterations: 1 }));
    },
  },
  {
    id: 'bind',
    duration: 2400,
    narration: 'Highest score wins, ties broken at random. The Scheduler does not patch the Pod itself. It POSTs a Binding to the binding subresource, and the ApiServer writes spec.nodeName=node-4 into ETCD via Raft.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setVal(s.refs.winnerChip, 'node-4 · 92');
      setWire(s, 'req', 'POST .../pods/my-app-7d4-abc/binding');
      setWire(s, 'persist', 'spec.nodeName=node-4 · rv=903');
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
      // Two arrow segments: Scheduler → ApiServer (binding POST), then ApiServer → ETCD (persist).
      arrowPacket(s, ctx, { from: [400, 100], to: [460, 100], delay: 0,    dur: 600 });
      arrowPacket(s, ctx, { from: [780, 100], to: [850, 100], delay: 900,  dur: 600 });
      ctx.register(pulse(rows[3], { duration: 800, iterations: 1 }));
      ctx.register(s.refs.etcdC.animate(
        [{ filter: 'brightness(1)' }, { filter: 'brightness(1.45)' }, { filter: 'brightness(1)' }],
        { duration: 600, delay: 1500, iterations: 1, easing: 'ease-in-out' }
      ));
    },
  },
  {
    id: 'placed',
    duration: 2200,
    narration: 'The Kubelet on node-4 has a filtered watch on /api/v1/pods?fieldSelector=spec.nodeName=node-4. The MODIFIED event arrives, Kubelet pulls the image, and the Pod transitions to Running.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setVal(s.refs.winnerChip, 'node-4 · 92');
      s.refs.n1.style.opacity = '0.35';
      s.refs.n2.style.opacity = '0.35';
      s.refs.n4.classList.add('highlight');
      s.refs.placedPodBox.classList.add('highlight');
      // Hide node-4's own label and sublabel so the inner box reads cleanly inside the slot.
      setN4TextOpacity(s, '0');
      // Pin final state inline so cancel returns to the right value, not default.
      s.refs.placedPod.style.opacity = '1';
      if (ctx.reduced) return;
      ctx.register(fadeIn(s.refs.placedPod, { duration: 700 }));
    },
  },
];

export function init(root, callbacks = {}) {
  const scene = new Scene(root);
  const tl = new Timeline({
    steps: STEPS,
    scene,
    onSceneReset: () => scene.reset(),
    onChange: callbacks.onStepChange,
    onPlayingChange: callbacks.onPlayingChange,
  });
  return {
    play: () => tl.play(),
    pause: () => tl.pause(),
    reset: () => tl.reset(),
    restart: () => tl.restart(),
    gotoStep: (i) => tl.gotoStep(i),
    setLoop: (b) => tl.setLoop(b),
    isLooping: () => tl.isLooping(),
    step: (dir) => tl.step(dir),
    setSpeed: (r) => tl.setSpeed(r),
    isPlaying: () => tl.isPlaying(),
    destroy: () => { tl.destroy(); root.replaceChildren(); },
  };
}
