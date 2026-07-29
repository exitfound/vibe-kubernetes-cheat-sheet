import { svg, g, rect, text } from '../lib/svg.js';
import { arrowDefs, pod, node, box, chip, chainList, setChainActive, arrow, pathArrow } from '../lib/primitives.js';
import { routePacket, valChip, setVal, setBoxSublabel, pulsePod, topPacket, makeInit, clearHighlights, clearWires, setWire, FADE, BEAT, lightBoxAt, WL } from '../lib/workloads-kit.js';

// Layout C of the Workloads canon (WL): full-width chip strip, ticks in the left band.
// Panel worst case x<=397, y<=330; a longer narration invalidates that measurement.
// Design notes for this card: scheme/docs/CARDS.md#workloads-cronjob
const PANEL_B = 330;
const TOP1_X = 420, TOP1_W = 220;
const TOP_GAP = 60;
const TOP2_X = TOP1_X + TOP1_W + TOP_GAP, TOP2_W = 220;
const TOP_CY = WL.TOP_Y + WL.BOX_H / 2;
const REQ_Y = TOP_CY - WL.LANE_DY, RESP_Y = TOP_CY + WL.LANE_DY;
const WIRE_X = (TOP1_X + TOP1_W + TOP2_X) / 2;
const WIRE_Y = WL.TOP_Y - 12;                            // above the actor row, off the spine

const LAD_X = WL.CHIP_X, LAD_W = WL.CHIP_W;              // 660..1140, the pipeline
const LAD_Y = 150;                                       // 6 rows -> 150..392

const NODE_Y = 404, NODE_H = 134;                        // 404..538, below the ladder and the panel
const POD_H = 106, POD_TOP_PAD = 20;
const POD_Y = NODE_Y + POD_TOP_PAD;                      // 424..530, clear of the frame label
// 80, not the family 24: the first Job slot has to clear the frame's own NODE-1 label.
const POD_PAD = 80;
const POD_INNER = { dx: 30, dy: 28, h: 52 };

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

const TOP1_CX = TOP1_X + TOP1_W / 2;                     // 530

// Pod slots spread across the frame's inner width, so the row centres on CX.
const SLOT_N = 4, SLOT_W = 220;
const SLOT_SPAN = WL.W - POD_PAD * 2;
const SLOT_X = i => WL.L + POD_PAD + i * ((SLOT_SPAN - SLOT_W) / (SLOT_N - 1));
const SLOT_CX = i => SLOT_X(i) + SLOT_W / 2;             // 250 / 483 / 717 / 950

// The schedule ticks take the left band, which only opens below the panel. They used to sit at
// x=830, straight through the pipeline ladder.
const TICK_N = 6, TICK_W = 51, TICK_H = 28, TICK_GAP = 8, TICK_CAPTION_DY = 14;
const TICK_SPAN = TICK_N * TICK_W + (TICK_N - 1) * TICK_GAP;   // 346
const TICK_X = WL.L, TICK_Y = 356;

// The trunk drops from the CronJob box into the free middle band and ends in a bus above the Job
// row, tapping into the two slots any ball is ever addressed to.
const BUS_Y = NODE_Y - 8;                                // 396, between the ticks and the frame
const TRUNK = [[TOP1_CX, WL.TOP_BOTTOM], [TOP1_CX, BUS_Y]];
const LANE = i => [...TRUNK, [SLOT_CX(i), BUS_Y], [SLOT_CX(i), POD_Y]];

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
      'aria-label': 'CronJob controller: on each schedule tick it creates one Job from a template, the Job runs a Pod, with concurrencyPolicy, history limits and missed-schedule handling',
      'data-style': 'outline',
    });
    root.appendChild(arrowDefs());

    const cronjob   = box({ x: TOP1_X, y: WL.TOP_Y, w: TOP1_W, h: WL.BOX_H, label: 'CronJob',   sublabel: 'schedule evaluator',      role: 'cluster' });
    const apiserver = box({ x: TOP2_X, y: WL.TOP_Y, w: TOP2_W, h: WL.BOX_H, label: 'API', sublabel: 'create Job · prune history', role: 'cluster' });

    root.appendChild(arrow({ x1: TOP1_X + TOP1_W, y1: REQ_Y, x2: TOP2_X, y2: REQ_Y, dim: true, dashed: true, role: 'cluster' }));
    root.appendChild(arrow({ x1: TOP2_X, y1: RESP_Y, x2: TOP1_X + TOP1_W, y2: RESP_Y, dim: true, dashed: true, role: 'cluster' }));

    const wireReq = text({ class: 'scheme-label code dim', x: WIRE_X, y: WIRE_Y, 'text-anchor': 'middle', 'font-size': 9 }, [' ']);
    root.appendChild(wireReq);

    const scheduleChip = valChip({ x: CHIP_X(0), y: CHIP_Y(0), w: CHIP_W, h: WL.CHIP_H, name: 'schedule',           value: '*/5 * * * *', role: 'workloads' });
    const concChip     = valChip({ x: CHIP_X(1), y: CHIP_Y(1), w: CHIP_W, h: WL.CHIP_H, name: 'concurrencyPolicy', value: 'Forbid', role: 'workloads' });
    const activeChip   = valChip({ x: CHIP_X(2), y: CHIP_Y(2), w: CHIP_W, h: WL.CHIP_H, name: 'active jobs',        value: '0', role: 'workloads' });
    const lastChip     = valChip({ x: CHIP_X(3), y: CHIP_Y(3), w: CHIP_W, h: WL.CHIP_H, name: 'lastScheduleTime',   value: 'none', role: 'workloads' });
    [scheduleChip, concChip, activeChip, lastChip].forEach(c => root.appendChild(c));

    const ladderCaption = text({ class: 'scheme-label code dim', x: TICK_X + TICK_SPAN / 2, y: TICK_Y - TICK_CAPTION_DY, 'text-anchor': 'middle', 'font-size': 10 }, ['schedule ticks · every 5 min']);
    root.appendChild(ladderCaption);
    const tickLabels = ['12:00', '12:05', '12:10', '12:15', '12:20', '12:25'];
    const tickX = TICK_X, tickY = TICK_Y, tickW = TICK_W, tickGap = TICK_GAP;
    const ladder = g({ class: 'scheme-ladder', transform: `translate(${tickX},${tickY})` });
    const tickChips = tickLabels.map((lbl, i) => {
      const c = chip({ x: i * (tickW + tickGap), y: 0, w: tickW, h: TICK_H, label: lbl, role: 'workloads' });
      ladder.appendChild(c);
      return c;
    });
    root.appendChild(ladder);

    const eventChip = valChip({ x: CHIP_X(4), y: CHIP_Y(4), w: CHIP_W, h: WL.CHIP_H, name: 'last event', value: 'none', role: 'workloads' });
    root.appendChild(eventChip);

    const chain = chainList({
      x: LAD_X, y: LAD_Y, w: LAD_W, rowH: WL.ROW_H, gap: WL.ROW_GAP,
      items: [
        '1. create   ·  cron matched, Job from jobTemplate',
        '2. forbid   ·  prev still running, skip this tick',
        '3. next     ·  prev done, the next tick creates a Job',
        '4. history  ·  keep 3 success / 1 fail, prune oldest',
        '5. missed   ·  past startingDeadlineSeconds, skipped',
        '6. suspend  ·  spec.suspend pauses new Jobs',
      ],
      role: 'cluster',
    });

    const nodeEl = node({ x: WL.L, y: NODE_Y, w: WL.W, h: NODE_H, label: 'Node-1' });

    // Each slot is one scheduled run: the rounded shell is the Job, the inner box its Pod.
    const POD_DEFS = ['backup-28394400', 'backup-28394410', 'backup-28394415', 'backup-28394420']
      .map((job, i) => ({ x: SLOT_X(i), job }));
    const podBoxes = [];
    const podWrappers = POD_DEFS.map((d, i) => {
      const shell = pod({ x: d.x, y: POD_Y, w: SLOT_W, h: POD_H, label: d.job, sublabel: '', containers: 0, role: 'workloads' });
      const shellRect = shell.querySelector('.scheme-pod-rect');
      if (shellRect) shellRect.style.fill = 'rgba(255, 255, 255, 0.03)';

      const innerBox = box({ x: d.x + POD_INNER.dx, y: POD_Y + POD_INNER.dy, w: SLOT_W - POD_INNER.dx * 2, h: POD_INNER.h, label: 'Pod', sublabel: 'pending', role: 'workloads' });

      const wrap = g({ id: `pod${i + 1}` });
      wrap.style.opacity = '0';
      wrap.appendChild(shell);
      wrap.appendChild(innerBox);
      podBoxes.push(innerBox);
      return wrap;
    });
    const [pod1, pod2, pod3, pod4] = podWrappers;
    const [pod1Box, pod2Box, pod3Box, pod4Box] = podBoxes;

    // A drawn lane per Job slot that ever receives a create. They share the trunk and the bus,
    // so the two paths coincide there and read as one wiring tree with two arrowheads.
    const lanes = [0, 1].map(i => pathArrow({ points: LANE(i), dim: true, dashed: true, role: 'cluster' }));
    lanes.forEach(l => root.appendChild(l));

    const packetLayer = g({ id: 'packetLayer' });
    root.appendChild(packetLayer);

    root.appendChild(chain);
    root.appendChild(nodeEl);
    [pod1, pod2, pod3, pod4].forEach(p => root.appendChild(p));
    root.appendChild(apiserver);
    root.appendChild(cronjob);

    this.host.appendChild(root);
    this.refs = {
      svg: root,
      cronjob, apiserver, chain, nodeEl, lanes,
      scheduleChip, concChip, activeChip, lastChip, eventChip,
      ladder, tickChips,
      pod1, pod2, pod3, pod4, pod1Box, pod2Box, pod3Box, pod4Box,
      packetLayer,
      wires: { req: wireReq },
    };
  }

  reset() { this.build(); }
}

function clearHL(s) {
  clearHighlights(s,
    ['cronjob','apiserver','scheduleChip','concChip','activeChip','lastChip','eventChip','pod1Box','pod2Box','pod3Box','pod4Box'],
    [s.refs.pod1, s.refs.pod2, s.refs.pod3, s.refs.pod4]);
  s.refs.tickChips.forEach(c => c.classList.remove('highlight'));
}
// Pods and their lanes are pinned by one helper: a tap that outlives its Job slot lands an
// arrowhead in an empty Node frame. Only slots 0 and 1 are ever addressed, so only those carry one.
function setPods(s, ...vals) {
  vals.forEach((v, i) => {
    s.refs['pod' + (i + 1)].style.opacity = String(v);
    if (s.refs.lanes[i]) s.refs.lanes[i].style.opacity = String(v);
  });
}

function setTicks(s, lit) {
  s.refs.tickChips.forEach((c, i) => c.classList.toggle('highlight', lit.includes(i)));
}

const STEPS = [
  {
    id: 'idle',
    duration: 1500,
    enter(s) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setVal(s.refs.scheduleChip, '*/5 * * * *');
      setVal(s.refs.concChip, 'Forbid');
      setVal(s.refs.activeChip, '0');
      setVal(s.refs.lastChip, 'none');
      setVal(s.refs.eventChip, 'none');
      setPods(s, 0, 0, 0, 0);
      setTicks(s, []);
      setChainActive(s.refs.chain, -1);
    },
  },
  {
    id: 'create',
    duration: 3100,
    narration: 'At 12:00 the wall clock matches the schedule. The controller creates one Job, backup-28394400, from spec.jobTemplate through the API, and that Job in turn creates its own Pod. The path is always CronJob then Job then Pod, never CronJob straight to Pod. The numeric suffix is derived from the scheduled time, so a single tick can only ever produce one Job, which keeps creation idempotent. The status.active field becomes 1 and lastScheduleTime records 12:00.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setVal(s.refs.activeChip, '1');
      setVal(s.refs.lastChip, '12:00');
      setVal(s.refs.eventChip, 'created backup-28394400');
      setBoxSublabel(s.refs.pod1Box, 'Running');
      setWire(s, 'req', 'create Job backup-28394400 · from jobTemplate');
      s.refs.cronjob.classList.add('highlight');
      s.refs.activeChip.classList.add('highlight');
      s.refs.lastChip.classList.add('highlight');
      s.refs.eventChip.classList.add('highlight');
      setTicks(s, [0]);
      setChainActive(s.refs.chain, 0);
      // Pin final state: the 12:00 run is present, the rest are not created yet.
      setPods(s, 1, 0, 0, 0);
      if (ctx.reduced) { s.refs.pod1Box.classList.add('highlight'); s.refs.apiserver.classList.add('highlight'); return; }
      s.refs.pod1.style.opacity = '0';
      const req = topPacket(s, ctx, { from: TOP1_X + TOP1_W, to: TOP2_X, y: REQ_Y, role: 'workloads' });
      lightBoxAt(s.refs.apiserver, ctx, req.arrivalMs);
      // Create reaches the node, the Job Pod materializes and pulses on arrival.
      const create = routePacket(s, ctx, LANE(0), { delay: req.arrivalMs + BEAT.afterHop, role: 'workloads' });
      ctx.register(s.refs.pod1.animate([{ opacity: 0 }, { opacity: 1 }], { duration: FADE.in, delay: create.arrivalMs, fill: 'both', easing: 'ease-out' }));
      pulsePod(s.refs.pod1, ctx, create.arrivalMs);
    },
  },
  {
    id: 'forbid',
    duration: 2100,
    narration: 'This backup is slow and still Running when the 12:05 tick arrives. The spec.concurrencyPolicy field decides what happens to overlapping runs. With Forbid the controller skips the new tick entirely and records the Event JobAlreadyActive, it does not queue the run for later. The default Allow would let a second Job start alongside the first, and Replace would delete the still-running Job and start a fresh one in its place. Here nothing new is created and the 12:00 run keeps going.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setVal(s.refs.activeChip, '1');
      setVal(s.refs.lastChip, '12:00');
      setVal(s.refs.eventChip, 'JobAlreadyActive · skipped');
      setBoxSublabel(s.refs.pod1Box, 'Running');
      setWire(s, 'req', 'concurrencyPolicy=Forbid · skip new run');
      s.refs.cronjob.classList.add('highlight');
      s.refs.concChip.classList.add('highlight');
      s.refs.eventChip.classList.add('highlight');
      setTicks(s, [0]);
      setChainActive(s.refs.chain, 1);
      // No Job is created, so the only visible run is the one still going.
      setPods(s, 1, 0, 0, 0);
    },
  },
  {
    id: 'next',
    duration: 3100,
    narration: 'By 12:10 the 12:00 run has finished with exit 0, so status.active drops to 0. Now the 12:10 tick has no overlap to forbid, the controller creates Job backup-28394410 and its Pod starts. Each tick is a separate Job and a separate Pod, runs are never reused. The completed 12:00 Job is kept for now as part of the history.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setVal(s.refs.activeChip, '1');
      setVal(s.refs.lastChip, '12:10');
      setVal(s.refs.eventChip, 'created backup-28394410');
      setBoxSublabel(s.refs.pod1Box, 'Completed · exit 0');
      setBoxSublabel(s.refs.pod2Box, 'Running');
      setWire(s, 'req', 'create Job backup-28394410 · prev complete');
      s.refs.cronjob.classList.add('highlight');
      s.refs.activeChip.classList.add('highlight');
      s.refs.lastChip.classList.add('highlight');
      s.refs.eventChip.classList.add('highlight');
      setTicks(s, [0, 2]);
      setChainActive(s.refs.chain, 2);
      // Pin final: 12:00 done and retained, 12:10 running.
      setPods(s, 1, 1, 0, 0);
      if (ctx.reduced) { s.refs.pod2Box.classList.add('highlight'); s.refs.apiserver.classList.add('highlight'); return; }
      s.refs.pod2.style.opacity = '0';
      const req = topPacket(s, ctx, { from: TOP1_X + TOP1_W, to: TOP2_X, y: REQ_Y, role: 'workloads' });
      lightBoxAt(s.refs.apiserver, ctx, req.arrivalMs);
      const create = routePacket(s, ctx, LANE(1), { delay: req.arrivalMs + BEAT.afterHop, role: 'workloads' });
      ctx.register(s.refs.pod2.animate([{ opacity: 0 }, { opacity: 1 }], { duration: FADE.in, delay: create.arrivalMs, fill: 'both', easing: 'ease-out' }));
      pulsePod(s.refs.pod2, ctx, create.arrivalMs);
    },
  },
  {
    id: 'history',
    duration: 3100,
    narration: 'Over the following ticks more runs complete and finished Jobs pile up. The controller caps how many it keeps with successfulJobsHistoryLimit (default 3) and failedJobsHistoryLimit (default 1). Once a fourth successful Job exists it prunes the oldest, here backup-28394400, deleting that Job object and its Pod through the API. Trimming history is why kubectl get jobs shows only the most recent runs.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setVal(s.refs.activeChip, '0');
      s.refs.activeChip.classList.add('highlight');
      setVal(s.refs.lastChip, '12:20');
      s.refs.lastChip.classList.add('highlight');
      setVal(s.refs.eventChip, 'pruned backup-28394400');
      setBoxSublabel(s.refs.pod1Box, 'Completed · exit 0');
      setBoxSublabel(s.refs.pod2Box, 'Completed · exit 0');
      setBoxSublabel(s.refs.pod3Box, 'Completed · exit 0');
      setBoxSublabel(s.refs.pod4Box, 'Completed · exit 0');
      setWire(s, 'req', 'DELETE backup-28394400 · successfulJobsHistoryLimit=3');
      s.refs.eventChip.classList.add('highlight');
      setTicks(s, [0, 2, 3, 4]);
      setChainActive(s.refs.chain, 3);
      // Pin final: the oldest run is pruned, three are retained.
      setPods(s, 0, 1, 1, 1);
      if (ctx.reduced) { s.refs.apiserver.classList.add('highlight'); return; }
      // The DELETE reaches the node, the oldest Job pulses then its Pod is removed. The lane it
      // rides is brought back for the flight and leaves on the same beat as the Pod it feeds.
      s.refs.pod1.style.opacity = '1';
      s.refs.lanes[0].style.opacity = '1';
      const req = topPacket(s, ctx, { from: TOP1_X + TOP1_W, to: TOP2_X, y: REQ_Y, role: 'workloads' });
      lightBoxAt(s.refs.apiserver, ctx, req.arrivalMs);
      const prune = routePacket(s, ctx, LANE(0), { delay: req.arrivalMs + BEAT.afterHop, role: 'workloads' });
      pulsePod(s.refs.pod1, ctx, prune.arrivalMs);
      ctx.register(s.refs.pod1.animate([{ opacity: 1 }, { opacity: 0 }], { duration: FADE.out, delay: prune.arrivalMs, fill: 'both', easing: 'ease-in' }));
      ctx.register(s.refs.lanes[0].animate([{ opacity: 1 }, { opacity: 0 }], { duration: FADE.out, delay: prune.arrivalMs, fill: 'both', easing: 'ease-in' }));
    },
  },
  {
    id: 'missed',
    duration: 2200,
    narration: 'Suppose the controller was down for a while. On recovery it sees ticks it missed. The spec.startingDeadlineSeconds field bounds how late a missed run may still start, any tick older than that deadline is skipped and counted as missed rather than run late. With no deadline set the controller instead refuses to schedule once it finds more than 100 missed start times, logging an error. Because a CronJob is not exactly-once and may rarely create two Jobs or none for a tick, the Job itself should be idempotent.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setVal(s.refs.activeChip, '0');
      setVal(s.refs.lastChip, '12:20');
      setVal(s.refs.eventChip, 'missed 12:25 · past deadline');
      setWire(s, 'req', 'missed start > startingDeadlineSeconds · skip');
      s.refs.cronjob.classList.add('highlight');
      s.refs.eventChip.classList.add('highlight');
      setTicks(s, [0, 2, 3, 4]);
      setChainActive(s.refs.chain, 4);
      // No run is created for the missed tick, the retained history is unchanged.
      setPods(s, 0, 1, 1, 1);
    },
  },
  {
    id: 'suspend',
    duration: 2000,
    narration: 'Setting spec.suspend=true pauses the CronJob. The clock keeps advancing and the schedule still matches, but the controller creates no new Jobs while suspended, and any Job already running is left to finish on its own. Clearing the flag back to false resumes creation, and with no startingDeadlineSeconds set the ticks missed while suspended are scheduled at once. This is the safe way to pause a schedule without deleting the CronJob and losing its history.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setVal(s.refs.activeChip, '0');
      setVal(s.refs.lastChip, '12:20');
      setVal(s.refs.eventChip, 'suspend=true · creation paused');
      setWire(s, 'req', 'spec.suspend=true · no Jobs created');
      s.refs.cronjob.classList.add('highlight');
      s.refs.eventChip.classList.add('highlight');
      // Earlier runs stay on the ladder, the controller lights no new tick while suspended.
      setTicks(s, [0, 2, 3, 4]);
      setChainActive(s.refs.chain, 5);
      setPods(s, 0, 1, 1, 1);
      // Suspension is a spec flag, nothing travels: the paused state shows via the
      // static highlight only (no chip pulse).
    },
  },
];

export const init = makeInit(Scene, STEPS, { posterFirst: true });
