import { svg, g, rect, text } from '../lib/svg.js';
import { arrowDefs, pod, node, box, chip, chainList, setChainActive, arrow, pathArrow } from '../lib/primitives.js';
import { valChip, setVal, setBoxSublabel, pulsePod, connectorPacket, topPacket, makeInit, clearHighlights, clearWires, setWire, FADE, BEAT } from '../lib/workloads-kit.js';
// Design notes for this card: scheme/docs/CARDS.md#workloads-cronjob


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

    const cronjob   = box({ x: 320, y: 40, w: 220, h: 80, label: 'CronJob',   sublabel: 'schedule evaluator',      role: 'cluster' });
    const apiserver = box({ x: 580, y: 40, w: 220, h: 80, label: 'Api', sublabel: 'create Job · prune history', role: 'cluster' });

    root.appendChild(arrow({ x1: 540, y1: 65, x2: 580, y2: 65, dim: true, dashed: true, role: 'cluster' }));
    root.appendChild(arrow({ x1: 580, y1: 95, x2: 540, y2: 95, dim: true, dashed: true, role: 'cluster' }));

    const wireReq = text({ class: 'scheme-label code dim', x: 560, y: 148, 'text-anchor': 'middle', 'font-size': 9 }, [' ']);
    root.appendChild(wireReq);

    const scheduleChip = valChip({ x: 830, y: 40,  w: 350, h: 32, name: 'schedule (UTC)',    value: '*/5 * * * *', role: 'workloads' });
    const concChip     = valChip({ x: 830, y: 82,  w: 350, h: 32, name: 'concurrencyPolicy', value: 'Forbid', role: 'workloads' });
    const activeChip   = valChip({ x: 830, y: 124, w: 350, h: 32, name: 'active jobs',        value: '0', role: 'workloads' });
    const lastChip     = valChip({ x: 830, y: 166, w: 350, h: 32, name: 'lastScheduleTime',   value: 'none', role: 'workloads' });
    [scheduleChip, concChip, activeChip, lastChip].forEach(c => root.appendChild(c));

    const ladderCaption = text({ class: 'scheme-label code dim', x: 1003, y: 222, 'text-anchor': 'middle', 'font-size': 10 }, ['schedule ticks · every 5 min']);
    root.appendChild(ladderCaption);
    const tickLabels = ['12:00', '12:05', '12:10', '12:15', '12:20', '12:25'];
    const tickX = 830, tickY = 235, tickW = 51, tickGap = 8;
    const ladder = g({ class: 'scheme-ladder', transform: `translate(${tickX},${tickY})` });
    const tickChips = tickLabels.map((lbl, i) => {
      const c = chip({ x: i * (tickW + tickGap), y: 0, w: tickW, h: 28, label: lbl, role: 'workloads' });
      ladder.appendChild(c);
      return c;
    });
    root.appendChild(ladder);

    const eventChip = valChip({ x: 830, y: 410, w: 350, h: 32, name: 'last event', value: 'none', role: 'workloads' });
    root.appendChild(eventChip);

    const chain = chainList({
      x: 320, y: 220, w: 480, rowH: 32, gap: 10,
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

    const nodeEl = node({ x: 320, y: 480, w: 860, h: 140, label: 'Node-1' });

    // Each slot is one scheduled run: the rounded shell is the Job, the inner box its Pod.
    const POD_DEFS = [
      { x: 386, job: 'backup-28394400' },
      { x: 586, job: 'backup-28394410' },
      { x: 786, job: 'backup-28394415' },
      { x: 986, job: 'backup-28394420' },
    ];
    const podBoxes = [];
    const podWrappers = POD_DEFS.map((d, i) => {
      const shell = pod({ x: d.x, y: 497, w: 182, h: 106, label: d.job, sublabel: '', containers: 0, role: 'workloads' });
      const shellRect = shell.querySelector('.scheme-pod-rect');
      if (shellRect) shellRect.style.fill = 'rgba(255, 255, 255, 0.03)';

      const innerBox = box({ x: d.x + 10, y: 525, w: 162, h: 52, label: 'Pod', sublabel: 'pending', role: 'workloads' });

      const wrap = g({ id: `pod${i + 1}` });
      wrap.style.opacity = '0';
      wrap.appendChild(shell);
      wrap.appendChild(innerBox);
      podBoxes.push(innerBox);
      return wrap;
    });
    const [pod1, pod2, pod3, pod4] = podWrappers;
    const [pod1Box, pod2Box, pod3Box, pod4Box] = podBoxes;

    const connector = pathArrow({
      points: [[320, 80], [280, 80], [280, 550], [320, 550]],
      dim: true, dashed: true, role: 'cluster',
    });
    root.appendChild(connector);

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
      cronjob, apiserver, chain, nodeEl, connector,
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
function setTicks(s, lit) {
  s.refs.tickChips.forEach((c, i) => c.classList.toggle('highlight', lit.includes(i)));
}

const STEPS = [
  {
    id: 'idle',
    duration: 1500,
    narration: 'A CronJob named backup is declared with schedule */5 * * * * (every five minutes) and concurrencyPolicy=Forbid. Its jobTemplate describes the Job to run. The controller does not run containers itself, it only watches the clock. The schedule is read in UTC unless spec.timeZone names an IANA zone (GA in 1.27), and the controller re-evaluates on a short interval, about every ten seconds. So far no Job has been created, so status.active is empty and lastScheduleTime is unset.',
    enter(s) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setVal(s.refs.scheduleChip, '*/5 * * * *');
      setVal(s.refs.concChip, 'Forbid');
      setVal(s.refs.activeChip, '0');
      setVal(s.refs.lastChip, 'none');
      setVal(s.refs.eventChip, 'none');
      s.refs.pod1.style.opacity = '0';
      s.refs.pod2.style.opacity = '0';
      s.refs.pod3.style.opacity = '0';
      s.refs.pod4.style.opacity = '0';
      setTicks(s, []);
      setChainActive(s.refs.chain, -1);
    },
  },
  {
    id: 'create',
    duration: 2600,
    narration: 'At 12:00 the wall clock matches the schedule. The controller creates one Job, backup-28394400, from spec.jobTemplate through the Api, and that Job in turn creates its own Pod. The path is always CronJob then Job then Pod, never CronJob straight to Pod. The numeric suffix is derived from the scheduled time, so a single tick can only ever produce one Job, which keeps creation idempotent. status.active becomes 1 and lastScheduleTime records 12:00.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setVal(s.refs.activeChip, '1');
      setVal(s.refs.lastChip, '12:00');
      setVal(s.refs.eventChip, 'created backup-28394400');
      setBoxSublabel(s.refs.pod1Box, 'Running');
      setWire(s, 'req', 'Create Job backup-28394400 · from jobTemplate');
      s.refs.cronjob.classList.add('highlight');
      s.refs.apiserver.classList.add('highlight');
      s.refs.activeChip.classList.add('highlight');
      s.refs.lastChip.classList.add('highlight');
      s.refs.eventChip.classList.add('highlight');
      setTicks(s, [0]);
      setChainActive(s.refs.chain, 0);
      // Pin final state: the 12:00 run is present, the rest are not created yet.
      s.refs.pod1.style.opacity = '1';
      s.refs.pod2.style.opacity = '0';
      s.refs.pod3.style.opacity = '0';
      s.refs.pod4.style.opacity = '0';
      if (ctx.reduced) { s.refs.pod1Box.classList.add('highlight'); return; }
      s.refs.pod1.style.opacity = '0';
      const req = topPacket(s, ctx, { role: 'workloads' });
      // Create reaches the node, the Job Pod materializes and pulses on arrival.
      const create = connectorPacket(s, ctx, { delay: req.arrivalMs + BEAT.afterHop, role: 'workloads' });
      ctx.register(s.refs.pod1.animate([{ opacity: 0 }, { opacity: 1 }], { duration: FADE.in, delay: create.arrivalMs, fill: 'both', easing: 'ease-out' }));
      pulsePod(s.refs.pod1, ctx, create.arrivalMs);
    },
  },
  {
    id: 'forbid',
    duration: 2100,
    narration: 'This backup is slow and still Running when the 12:05 tick arrives. spec.concurrencyPolicy decides what happens to overlapping runs. With Forbid the controller skips the new tick entirely and records the Event JobAlreadyActive, it does not queue the run for later. The default Allow would let a second Job start alongside the first, and Replace would delete the still-running Job and start a fresh one in its place. Here nothing new is created and the 12:00 run keeps going.',
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
      s.refs.pod1.style.opacity = '1';
      s.refs.pod2.style.opacity = '0';
      s.refs.pod3.style.opacity = '0';
      s.refs.pod4.style.opacity = '0';
    },
  },
  {
    id: 'next',
    duration: 2600,
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
      setWire(s, 'req', 'Create Job backup-28394410 · prev complete');
      s.refs.cronjob.classList.add('highlight');
      s.refs.apiserver.classList.add('highlight');
      s.refs.activeChip.classList.add('highlight');
      s.refs.lastChip.classList.add('highlight');
      s.refs.eventChip.classList.add('highlight');
      setTicks(s, [0, 2]);
      setChainActive(s.refs.chain, 2);
      // Pin final: 12:00 done and retained, 12:10 running.
      s.refs.pod1.style.opacity = '1';
      s.refs.pod2.style.opacity = '1';
      s.refs.pod3.style.opacity = '0';
      s.refs.pod4.style.opacity = '0';
      if (ctx.reduced) { s.refs.pod2Box.classList.add('highlight'); return; }
      s.refs.pod2.style.opacity = '0';
      const req = topPacket(s, ctx, { role: 'workloads' });
      const create = connectorPacket(s, ctx, { delay: req.arrivalMs + BEAT.afterHop, role: 'workloads' });
      ctx.register(s.refs.pod2.animate([{ opacity: 0 }, { opacity: 1 }], { duration: FADE.in, delay: create.arrivalMs, fill: 'both', easing: 'ease-out' }));
      pulsePod(s.refs.pod2, ctx, create.arrivalMs);
    },
  },
  {
    id: 'history',
    duration: 2600,
    narration: 'Over the following ticks more runs complete and finished Jobs pile up. The controller caps how many it keeps with successfulJobsHistoryLimit (default 3) and failedJobsHistoryLimit (default 1). Once a fourth successful Job exists it prunes the oldest, here backup-28394400, deleting that Job object and its Pod through the Api. Trimming history is why kubectl get jobs shows only the most recent runs.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setVal(s.refs.activeChip, '0');
      setVal(s.refs.lastChip, '12:20');
      setVal(s.refs.eventChip, 'pruned backup-28394400');
      setBoxSublabel(s.refs.pod1Box, 'Completed · exit 0');
      setBoxSublabel(s.refs.pod2Box, 'Completed · exit 0');
      setBoxSublabel(s.refs.pod3Box, 'Completed · exit 0');
      setBoxSublabel(s.refs.pod4Box, 'Completed · exit 0');
      setWire(s, 'req', 'DELETE backup-28394400 · successfulJobsHistoryLimit=3');
      s.refs.apiserver.classList.add('highlight');
      s.refs.eventChip.classList.add('highlight');
      setTicks(s, [0, 2, 3, 4]);
      setChainActive(s.refs.chain, 3);
      // Pin final: the oldest run is pruned, three are retained.
      s.refs.pod1.style.opacity = '0';
      s.refs.pod2.style.opacity = '1';
      s.refs.pod3.style.opacity = '1';
      s.refs.pod4.style.opacity = '1';
      if (ctx.reduced) return;
      // The DELETE reaches the node, the oldest Job pulses then its Pod is removed.
      s.refs.pod1.style.opacity = '1';
      const req = topPacket(s, ctx, { role: 'workloads' });
      const prune = connectorPacket(s, ctx, { delay: req.arrivalMs + BEAT.afterHop, role: 'workloads' });
      pulsePod(s.refs.pod1, ctx, prune.arrivalMs);
      ctx.register(s.refs.pod1.animate([{ opacity: 1 }, { opacity: 0 }], { duration: FADE.out, delay: prune.arrivalMs, fill: 'both', easing: 'ease-in' }));
    },
  },
  {
    id: 'missed',
    duration: 2200,
    narration: 'Suppose the controller was down for a while. On recovery it sees ticks it missed. spec.startingDeadlineSeconds bounds how late a missed run may still start, any tick older than that deadline is skipped and counted as missed rather than run late. With no deadline set the controller instead refuses to schedule once it finds more than 100 missed start times, logging an error. Because a CronJob is not exactly-once and may rarely create two Jobs or none for a tick, the Job itself should be idempotent.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setVal(s.refs.activeChip, '0');
      setVal(s.refs.lastChip, '12:20');
      setVal(s.refs.eventChip, 'missed 12:25 · past deadline');
      setWire(s, 'req', 'Missed start > startingDeadlineSeconds · skip');
      s.refs.cronjob.classList.add('highlight');
      s.refs.eventChip.classList.add('highlight');
      setTicks(s, [0, 2, 3, 4]);
      setChainActive(s.refs.chain, 4);
      // No run is created for the missed tick, the retained history is unchanged.
      s.refs.pod1.style.opacity = '0';
      s.refs.pod2.style.opacity = '1';
      s.refs.pod3.style.opacity = '1';
      s.refs.pod4.style.opacity = '1';
    },
  },
  {
    id: 'suspend',
    duration: 2000,
    narration: 'Setting spec.suspend=true pauses the CronJob. The clock keeps advancing and the schedule still matches, but the controller creates no new Jobs while suspended, and any Job already running is left to finish on its own. Clearing the flag back to false resumes creation from the next matching tick. This is the safe way to pause a schedule without deleting the CronJob and losing its history.',
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
      s.refs.pod1.style.opacity = '0';
      s.refs.pod2.style.opacity = '1';
      s.refs.pod3.style.opacity = '1';
      s.refs.pod4.style.opacity = '1';
      // Suspension is a spec flag, nothing travels: the paused state shows via the
      // static highlight only (no chip pulse).
    },
  },
];

export const init = makeInit(Scene, STEPS, { posterFirst: true });
