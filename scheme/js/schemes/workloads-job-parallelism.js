import { svg, g, rect, text } from '../lib/svg.js';
import { arrowDefs, pod, node, box, chainList, setChainActive, arrow, pathArrow } from '../lib/primitives.js';
import { routePacket, valChip, setVal, setBoxSublabel, pulsePod, topPacket, makeInit, clearHighlights, clearWires, setWire, FADE, BEAT, lightBoxAt, OPACITY, WL } from '../lib/workloads-kit.js';

// Layout C of the Workloads canon (WL): full-width chip strip, a bus tapping all three workers.
// Panel worst case x<=397, y<=280; a longer narration invalidates that measurement.
// Design notes for this card: scheme/docs/CARDS.md#workloads-job-parallelism
const PANEL_B = 280;
const TOP1_X = 420, TOP1_W = 220;
const TOP_GAP = 60;
const TOP2_X = TOP1_X + TOP1_W + TOP_GAP, TOP2_W = 220;
const TOP_CY = WL.TOP_Y + WL.BOX_H / 2;
const REQ_Y = TOP_CY - WL.LANE_DY, RESP_Y = TOP_CY + WL.LANE_DY;
const WIRE_X = (TOP1_X + TOP1_W + TOP2_X) / 2;
const WIRE_Y = WL.TOP_Y - 12;                            // above the actor row, off the spine

const LAD_X = WL.CHIP_X, LAD_W = WL.CHIP_W;              // 660..1140, the pipeline
const LAD_Y = 150;                                       // 5 rows -> 150..350

const NODE_Y = 386, NODE_H = 142;                        // 386..528, below the ladder and the panel
const POD_W = 300, POD_H = 106, POD_TOP_PAD = 24;
const POD_Y = NODE_Y + POD_TOP_PAD;                      // 410..516, clear of the frame label
const POD_PAD = 24;
const POD_INNER = { dx: 30, w: POD_W - 60, dy: 28, h: 52 };
const POD_XS = [0, 1, 2].map(i => WL.L + POD_PAD + i * ((WL.W - POD_PAD * 2 - POD_W) / 2));
const POD_CX = i => POD_XS[i] + POD_W / 2;               // 234 / 600 / 966

// Chips as a full-width bottom strip, three per row so name and value never collide. Five chips
// means a row of three and a row of two, the short row centred on CX.
const CHIP_PER_ROW = 3, CHIP_GAP = 14;
const CHIP_W = (WL.W - CHIP_GAP * (CHIP_PER_ROW - 1)) / CHIP_PER_ROW;   // 350.67
const CHIP_ROW_H = WL.CHIP_H + 8;
const CHIPS_TOP = 548;                                   // two rows -> 548..624
const CHIP_ROW_N = i => (i < CHIP_PER_ROW ? CHIP_PER_ROW : 2);
const CHIP_X = i => {
  const col = i % CHIP_PER_ROW, n = CHIP_ROW_N(i);
  const rowW = n * CHIP_W + (n - 1) * CHIP_GAP;
  return WL.CX - rowW / 2 + col * (CHIP_W + CHIP_GAP);
};
const CHIP_Y = i => CHIPS_TOP + Math.floor(i / CHIP_PER_ROW) * CHIP_ROW_H;

// The trunk steps into the central corridor beside the ladder, drops to a bus above the Pod row
// and taps down into each worker, so every ball ends on the Pod it makes pulse.
const TOP1_CX = TOP1_X + TOP1_W / 2;                     // 530
const JOG_Y = WL.TOP_BOTTOM + 20;                        // 140, below the boxes, above the ladder
const BUS_Y = NODE_Y - 12;                               // 374, between the ladder and the frame
const TRUNK = [[TOP1_CX, WL.TOP_BOTTOM], [TOP1_CX, JOG_Y], [WL.SPINE_X, JOG_Y], [WL.SPINE_X, BUS_Y]];
const LANE = i => (POD_CX(i) === WL.SPINE_X
  ? [...TRUNK, [WL.SPINE_X, POD_Y]]
  : [...TRUNK, [POD_CX(i), BUS_Y], [POD_CX(i), POD_Y]]);


// valChip / setVal / setBoxSublabel are imported from ../lib/workloads-kit.js

class Scene {
  constructor(host) { this.host = host; this.refs = {}; this.build(); }

  build() {
    this.host.replaceChildren();
    this.refs = {};
    const root = svg({
      class: 'diagram',
      viewBox: '0 0 1200 640',
      preserveAspectRatio: 'xMidYMid meet',
      'aria-label': 'Job parallelism and completions: at most parallelism workers run concurrently, until completions successful runs are recorded',
      'data-style': 'outline',
    });
    root.appendChild(arrowDefs());

    const controller = box({ x: TOP1_X, y: WL.TOP_Y, w: TOP1_W, h: WL.BOX_H, label: 'Job', sublabel: 'spawn + count', role: 'cluster' });
    const apiserver  = box({ x: TOP2_X, y: WL.TOP_Y, w: TOP2_W, h: WL.BOX_H, label: 'API', sublabel: 'create Pod · watch exit', role: 'cluster' });

    root.appendChild(arrow({ x1: TOP1_X + TOP1_W, y1: REQ_Y, x2: TOP2_X, y2: REQ_Y, dim: true, dashed: true, role: 'cluster' }));
    root.appendChild(arrow({ x1: TOP2_X, y1: RESP_Y, x2: TOP1_X + TOP1_W, y2: RESP_Y, dim: true, dashed: true, role: 'cluster' }));

    const wireReq = text({ class: 'scheme-label code dim', x: WIRE_X, y: WIRE_Y, 'text-anchor': 'middle', 'font-size': 9 }, [' ']);
    root.appendChild(wireReq);

    const parChip       = valChip({ x: CHIP_X(0), y: CHIP_Y(0), w: CHIP_W, h: WL.CHIP_H, name: 'parallelism',  value: '3', role: 'workloads' });
    const compChip      = valChip({ x: CHIP_X(1), y: CHIP_Y(1), w: CHIP_W, h: WL.CHIP_H, name: 'completions', value: '6', role: 'workloads' });
    const succChip      = valChip({ x: CHIP_X(2), y: CHIP_Y(2), w: CHIP_W, h: WL.CHIP_H, name: 'succeeded',   value: '0', role: 'workloads' });
    const failChip      = valChip({ x: CHIP_X(3), y: CHIP_Y(3), w: CHIP_W, h: WL.CHIP_H, name: 'failed',      value: '0', role: 'workloads' });
    [parChip, compChip, succChip, failChip].forEach(c => root.appendChild(c));

    const chain = chainList({
      x: LAD_X, y: LAD_Y, w: LAD_W, rowH: WL.ROW_H, gap: WL.ROW_GAP,
      items: [
        '1. spec     ·  parallelism=3, completions=6',
        '2. spawn    ·  controller creates Pods up to parallelism',
        '3. progress ·  exit 0 → succeeded++ · then start next',
        '4. retry    ·  exit != 0 → failed++ · respawn (backoffLimit)',
        '5. complete ·  succeeded == completions · Complete=True',
      ],
      role: 'cluster',
    });

    // State chip for the Job status: last chip of the strip.
    const phaseChip = valChip({ x: CHIP_X(4), y: CHIP_Y(4), w: CHIP_W, h: WL.CHIP_H, name: 'job status', value: '0 active', role: 'workloads' });
    root.appendChild(phaseChip);

    const nodeEl = node({ x: WL.L, y: NODE_Y, w: WL.W, h: NODE_H, label: 'Node-1' });

    const POD_NAMES = ['worker-1', 'worker-2', 'worker-3'];
    const podBoxes = [];
    const podWrappers = POD_XS.map((px, i) => {
      const shell = pod({ x: px, y: POD_Y, w: POD_W, h: POD_H, label: POD_NAMES[i], sublabel: '', containers: 0, role: 'workloads' });
      const shellRect = shell.querySelector('.scheme-pod-rect');
      if (shellRect) shellRect.style.fill = 'rgba(255, 255, 255, 0.03)';

      const innerBox = box({ x: px + POD_INNER.dx, y: POD_Y + POD_INNER.dy, w: POD_INNER.w, h: POD_INNER.h, label: 'app', sublabel: 'idle', role: 'workloads' });

      const wrap = g({ id: `pod${i + 1}` });
      wrap.style.opacity = '0';
      wrap.appendChild(shell);
      wrap.appendChild(innerBox);
      podBoxes.push(innerBox);
      return wrap;
    });
    const [pod1, pod2, pod3] = podWrappers;
    const [pod1Box, pod2Box, pod3Box] = podBoxes;

    // One drawn lane per worker. They share the trunk and the bus, so the three paths coincide
    // there and read as a single wiring tree with three arrowheads.
    const lanes = [0, 1, 2].map(i => pathArrow({ points: LANE(i), dim: true, dashed: true, role: 'cluster' }));
    lanes.forEach(l => root.appendChild(l));

    const packetLayer = g({ id: 'packetLayer' });
    root.appendChild(packetLayer);

    root.appendChild(chain);
    root.appendChild(nodeEl);
    [pod1, pod2, pod3].forEach(p => root.appendChild(p));
    root.appendChild(apiserver);
    root.appendChild(controller);

    this.host.appendChild(root);
    this.refs = {
      svg: root,
      controller, apiserver, chain, nodeEl, lanes,
      parChip, compChip, succChip, failChip, phaseChip,
      pod1, pod2, pod3, pod1Box, pod2Box, pod3Box,
      packetLayer,
      wires: { req: wireReq },
    };
  }

  reset() { this.build(); }
}

function clearHL(s) {
  clearHighlights(s,
    ['controller','apiserver','parChip','compChip','succChip','failChip','phaseChip','pod1Box','pod2Box','pod3Box'],
    [s.refs.pod1, s.refs.pod2, s.refs.pod3]);
}
// One ball per worker, all leaving together: every Pod that pulses has a ball that reached it.
function fanOut(s, ctx, delay = 0) {
  return [s.refs.pod1, s.refs.pod2, s.refs.pod3].map((p, i) => {
    const pkt = routePacket(s, ctx, LANE(i), { delay, role: 'workloads' });
    pulsePod(p, ctx, pkt.arrivalMs);
    return pkt;
  });
}

// A worker slot and its own lane are pinned by one helper: a tap that outlives its Pod lands an
// arrowhead in an empty Node frame, and on this card the idle frame is the first thing a reader sees.
function setPods(s, ...vals) {
  vals.forEach((v, i) => {
    s.refs['pod' + (i + 1)].style.opacity = String(v);
    s.refs.lanes[i].style.opacity = String(v);
  });
}

function setUnits(s, a, b, c) {
  setBoxSublabel(s.refs.pod1Box, a);
  setBoxSublabel(s.refs.pod2Box, b);
  setBoxSublabel(s.refs.pod3Box, c);
}

const STEPS = [
  {
    id: 'idle',
    duration: 1500,
    enter(s) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setUnits(s, 'idle', 'idle', 'idle');
      setVal(s.refs.parChip, '3');
      setVal(s.refs.compChip, '6');
      setVal(s.refs.succChip, '0');
      setVal(s.refs.failChip, '0');
      setVal(s.refs.phaseChip, '0 active');
      setPods(s, 0, 0, 0);
      setChainActive(s.refs.chain, 0);
    },
  },
  {
    id: 'spawn',
    duration: 3500,
    narration: 'Job controller observes 0 live Pods against a parallelism of 3, so it creates 3 Pods to fill the cap. They all run the same Pod template. How they divide work is up to the app (pull from an external queue, or, with completionMode=Indexed, read JOB_COMPLETION_INDEX from the env). With three Pods now running, .status.active becomes 3.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setUnits(s, 'running · unit-1', 'running · unit-2', 'running · unit-3');
      setVal(s.refs.succChip, '0');
      setVal(s.refs.failChip, '0');
      setVal(s.refs.phaseChip, 'Running · 3 active');
      setWire(s, 'req', 'create 3 Pods (parallelism cap)');
      s.refs.controller.classList.add('highlight');
      s.refs.phaseChip.classList.add('highlight');
      setChainActive(s.refs.chain, 1);
      // Pin final opacities inline so a step change (which cancels the fade-in
      // animations) leaves the Pods visible instead of reverting to the built 0.
      setPods(s, 1, 1, 1);
      if (ctx.reduced) { s.refs.apiserver.classList.add('highlight'); return; }
      // Create travels controller -> Api -> Node. The 3 Pods materialize and pulse
      // together when the create reaches the node (parallelism=3 starts them simultaneously).
      const req = topPacket(s, ctx, { from: TOP1_X + TOP1_W, to: TOP2_X, y: REQ_Y, role: 'workloads' });
      lightBoxAt(s.refs.apiserver, ctx, req.arrivalMs);
      const create = fanOut(s, ctx, req.arrivalMs + BEAT.afterHop);
      [s.refs.pod1, s.refs.pod2, s.refs.pod3].forEach((p, i) => {
        ctx.register(p.animate([{ opacity: 0 }, { opacity: 1 }], { duration: FADE.in, delay: create[i].arrivalMs, fill: 'both', easing: 'ease-out' }));
      });
    },
  },
  {
    id: 'partial',
    duration: 2700,
    narration: 'Both worker-1 and worker-2 exit 0, so .status.succeeded increments to 2. worker-3 exits with code 1, .status.failed becomes 1. The failed Pod is retained in Failed phase as a tombstone (visible in kubectl get pods until the Job is garbage-collected), so the post-mortem stays inspectable. A replacement still needs to run to reach completions=6.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setUnits(s, 'unit-1 done · exit 0', 'unit-2 done · exit 0', 'unit-3 FAILED · exit 1');
      setVal(s.refs.succChip, '2');
      setVal(s.refs.failChip, '1');
      setVal(s.refs.phaseChip, 'Running · 1 failed');
      setWire(s, 'req', 'watch Pod exits · 2 exit 0 · 1 exit 1');
      s.refs.controller.classList.add('highlight');
      s.refs.apiserver.classList.add('highlight');
      s.refs.succChip.classList.add('highlight');
      s.refs.failChip.classList.add('highlight');
      s.refs.phaseChip.classList.add('highlight');
      setChainActive(s.refs.chain, 2);
      // Pin final opacities inline (worker-3 exited 1 and settles to the terminated shade) so a
      // cancel does not drop worker-1 and worker-2 back to the built 0.
      setPods(s, 1, 1, OPACITY.terminated);
      if (ctx.reduced) return;
      const recon = fanOut(s, ctx);
      // Lane 3 dims on the same beat as the worker it feeds. fill:'both' holds it at full through
      // the delay window, so the ball is never riding a wire dimmer than itself.
      ctx.register(s.refs.pod3.animate([{ opacity: 1 }, { opacity: OPACITY.terminated }], { duration: FADE.out, delay: recon[2].arrivalMs, fill: 'both', easing: 'ease-in' }));
      ctx.register(s.refs.lanes[2].animate([{ opacity: 1 }, { opacity: OPACITY.terminated }], { duration: FADE.out, delay: recon[2].arrivalMs, fill: 'both', easing: 'ease-in' }));
    },
  },
  {
    id: 'retry',
    duration: 3500,
    narration: 'Per spec.backoffLimit (default 6, total failures across the Job), the controller respawns a replacement Pod for the failed unit, gated by an exponential backoff that starts at 10s. Meanwhile worker-1 and worker-2 have finished, so fresh Pods take their slots for units 4 and 5 (each completion is its own Pod run, Pods are never reused). Three Pods active again, the parallelism cap respected.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setUnits(s, 'running · unit-4', 'running · unit-5', 'running · unit-3 (retry)');
      setVal(s.refs.succChip, '2');
      setVal(s.refs.failChip, '1');
      setVal(s.refs.phaseChip, 'Running · 3 active');
      setWire(s, 'req', 'create Pods · units 4, 5 + unit-3 retry');
      s.refs.controller.classList.add('highlight');
      s.refs.phaseChip.classList.add('highlight');
      setChainActive(s.refs.chain, 3);
      // Pin final opacities inline (worker-3 replacement back to 1) so a cancel
      // does not drop the three live Pods back to the built 0.
      setPods(s, 1, 1, 1);
      if (ctx.reduced) { s.refs.apiserver.classList.add('highlight'); return; }
      const req = topPacket(s, ctx, { from: TOP1_X + TOP1_W, to: TOP2_X, y: REQ_Y, role: 'workloads' });
      lightBoxAt(s.refs.apiserver, ctx, req.arrivalMs);
      fanOut(s, ctx, req.arrivalMs + BEAT.afterHop);
    },
  },
  {
    id: 'complete',
    duration: 2700,
    narration: 'Between them the three workers have completed all 6 units, the last one (unit-6) just finishing on worker-1. .status.succeeded now equals .spec.completions (6), so the controller sets condition Complete=True and stops creating Pods. The earlier single failure stays counted in .status.failed, and the terminated Pods are retained until ttlSecondsAfterFinished elapses (Job auto-cleanup) or until kubectl delete job is issued.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setUnits(s, 'unit-6 done · exit 0', 'unit-5 done · exit 0', 'unit-3 done · exit 0');
      setVal(s.refs.succChip, '6');
      setVal(s.refs.failChip, '1');
      setVal(s.refs.phaseChip, 'Complete · 6/6 succeeded');
      setWire(s, 'req', 'watch final exit · succeeded == completions');
      s.refs.controller.classList.add('highlight');
      s.refs.phaseChip.classList.add('highlight');
      s.refs.succChip.classList.add('highlight');
      setChainActive(s.refs.chain, 4);
      // Pin final opacities inline so the three Pods stay visible after a cancel.
      setPods(s, 1, 1, 1);
      if (ctx.reduced) return;
      // Final reconcile reaches the node. The three workers settle to their completed
      // units and pulse together as the Job reaches completions=6 (Complete=True).
      fanOut(s, ctx);
    },
  },
];

export const init = makeInit(Scene, STEPS, { posterFirst: true });
