import { svg, g, rect, text } from '../lib/svg.js';
import { arrowDefs, pod, node, box, chainList, setChainActive, arrow, pathArrow } from '../lib/primitives.js';
import { valChip, setVal, setBoxSublabel, pulsePod, connectorPacket, topPacket, makeInit, clearHighlights, clearWires, setWire, FADE, BEAT } from '../lib/scheme-kit.js';

// valChip / setVal / setBoxSublabel are imported from ../lib/scheme-kit.js

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

    const controller = box({ x: 320, y: 40, w: 220, h: 80, label: 'Job', sublabel: 'spawn + count', cat: 'control' });
    const apiserver  = box({ x: 580, y: 40, w: 220, h: 80, label: 'Api', sublabel: 'create Pod · watch exit', cat: 'control' });

    root.appendChild(arrow({ x1: 540, y1: 65, x2: 580, y2: 65, dim: true, dashed: true, color: 'control' }));
    root.appendChild(arrow({ x1: 580, y1: 95, x2: 540, y2: 95, dim: true, dashed: true, color: 'control' }));

    const wireReq = text({ class: 'scheme-label code dim', x: 560, y: 148, 'text-anchor': 'middle', 'font-size': 9 }, [' ']);
    root.appendChild(wireReq);

    const parChip       = valChip({ x: 830, y: 40,  w: 350, h: 32, name: 'parallelism',  value: '3' });
    const compChip      = valChip({ x: 830, y: 82,  w: 350, h: 32, name: 'completions', value: '6' });
    const succChip      = valChip({ x: 830, y: 124, w: 350, h: 32, name: 'succeeded',   value: '0' });
    const failChip      = valChip({ x: 830, y: 166, w: 350, h: 32, name: 'failed',      value: '0' });
    [parChip, compChip, succChip, failChip].forEach(c => root.appendChild(c));

    const chain = chainList({
      x: 320, y: 220, w: 480, rowH: 32, gap: 10,
      items: [
        '1. spec     ·  parallelism=3, completions=6',
        '2. spawn    ·  controller creates Pods up to parallelism',
        '3. progress ·  exit 0 → succeeded++ · then start next',
        '4. retry    ·  exit != 0 → failed++ · respawn (backoffLimit)',
        '5. complete ·  succeeded == completions · Complete=True',
      ],
      cat: 'control',
    });

    // State chip for the Job status: aligned below the pipeline.
    const phaseChip = valChip({ x: 830, y: 410, w: 350, h: 32, name: 'job status', value: '0 active' });
    root.appendChild(phaseChip);

    const nodeEl = node({ x: 320, y: 480, w: 860, h: 140, label: 'Node-1' });

    const POD_NAMES = ['worker-1', 'worker-2', 'worker-3'];
    const POD_XS    = [386, 642, 898];
    const podBoxes = [];
    const podWrappers = POD_XS.map((px, i) => {
      const shell = pod({ x: px, y: 497, w: 216, h: 106, label: POD_NAMES[i], sublabel: '', containers: 0, cat: 'workloads' });
      const shellRect = shell.querySelector('.scheme-pod-rect');
      if (shellRect) shellRect.style.fill = 'rgba(255, 255, 255, 0.03)';

      const innerBox = box({ x: px + 10, y: 525, w: 196, h: 52, label: 'app', sublabel: 'idle', cat: 'workloads' });

      const wrap = g({ id: `pod${i + 1}` });
      wrap.style.opacity = '0';
      wrap.appendChild(shell);
      wrap.appendChild(innerBox);
      podBoxes.push(innerBox);
      return wrap;
    });
    const [pod1, pod2, pod3] = podWrappers;
    const [pod1Box, pod2Box, pod3Box] = podBoxes;

    const connector = pathArrow({
      points: [[320, 80], [280, 80], [280, 550], [320, 550]],
      dim: true, dashed: true, color: 'control',
    });
    root.appendChild(connector);

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
      controller, apiserver, chain, nodeEl, connector,
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
function setUnits(s, a, b, c) {
  setBoxSublabel(s.refs.pod1Box, a);
  setBoxSublabel(s.refs.pod2Box, b);
  setBoxSublabel(s.refs.pod3Box, c);
}

const STEPS = [
  {
    id: 'idle',
    duration: 1500,
    narration: 'A Job named process-batch declares spec.parallelism=3 (max Pods running at once) and spec.completions=6 (target number of successful exits). The Job controller auto-generates a selector on the batch.kubernetes.io/controller-uid label and stamps the same label plus an ownerReference onto each spawned Pod. A Job has no phase field like a Pod does, its state lives in the active, succeeded and failed counts plus a Complete or Failed condition. So far .status.active is 0, no Pods created yet.',
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
      s.refs.pod1.style.opacity = '0';
      s.refs.pod2.style.opacity = '0';
      s.refs.pod3.style.opacity = '0';
      setChainActive(s.refs.chain, 0);
    },
  },
  {
    id: 'spawn',
    duration: 2600,
    narration: 'Job controller observes 0 live Pods against a parallelism of 3, so it creates 3 Pods to fill the cap. They all run the same Pod template. How they divide work is up to the app (pull from an external queue, or, with completionMode=Indexed, read JOB_COMPLETION_INDEX from the env). With three Pods now running, .status.active becomes 3.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setUnits(s, 'running · unit-1', 'running · unit-2', 'running · unit-3');
      setVal(s.refs.succChip, '0');
      setVal(s.refs.failChip, '0');
      setVal(s.refs.phaseChip, 'Running · 3 active');
      setWire(s, 'req', 'Create 3 Pods (parallelism cap)');
      s.refs.controller.classList.add('highlight');
      s.refs.apiserver.classList.add('highlight');
      s.refs.phaseChip.classList.add('highlight');
      setChainActive(s.refs.chain, 1);
      // Pin final opacities inline so a step change (which cancels the fade-in
      // animations) leaves the Pods visible instead of reverting to the built 0.
      s.refs.pod1.style.opacity = '1';
      s.refs.pod2.style.opacity = '1';
      s.refs.pod3.style.opacity = '1';
      if (ctx.reduced) return;
      // Create travels controller -> Api -> Node. The 3 Pods materialize and pulse
      // together when the create reaches the node (parallelism=3 starts them simultaneously).
      const req = topPacket(s, ctx);
      const create = connectorPacket(s, ctx, { delay: req.arrivalMs + BEAT.afterHop });
      ctx.register(s.refs.pod1.animate([{ opacity: 0 }, { opacity: 1 }], { duration: FADE.in, delay: create.arrivalMs, fill: 'both', easing: 'ease-out' }));
      ctx.register(s.refs.pod2.animate([{ opacity: 0 }, { opacity: 1 }], { duration: FADE.in, delay: create.arrivalMs, fill: 'both', easing: 'ease-out' }));
      ctx.register(s.refs.pod3.animate([{ opacity: 0 }, { opacity: 1 }], { duration: FADE.in, delay: create.arrivalMs, fill: 'both', easing: 'ease-out' }));
      pulsePod(s.refs.pod1, ctx, create.arrivalMs);
      pulsePod(s.refs.pod2, ctx, create.arrivalMs);
      pulsePod(s.refs.pod3, ctx, create.arrivalMs);
    },
  },
  {
    id: 'partial',
    duration: 2400,
    narration: 'worker-1 and worker-2 exit 0, so .status.succeeded increments to 2. worker-3 exits with code 1, .status.failed becomes 1. The failed Pod is retained in Failed phase as a tombstone (visible in kubectl get pods until the Job is garbage-collected), so the post-mortem stays inspectable. A replacement still needs to run to reach completions=6.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setUnits(s, 'unit-1 done · exit 0', 'unit-2 done · exit 0', 'unit-3 FAILED · exit 1');
      setVal(s.refs.succChip, '2');
      setVal(s.refs.failChip, '1');
      setVal(s.refs.phaseChip, 'Running · 1 failed');
      setWire(s, 'req', 'Watch Pod exits · 2 exit 0 · 1 exit 1');
      s.refs.controller.classList.add('highlight');
      s.refs.apiserver.classList.add('highlight');
      s.refs.succChip.classList.add('highlight');
      s.refs.failChip.classList.add('highlight');
      s.refs.phaseChip.classList.add('highlight');
      setChainActive(s.refs.chain, 2);
      // Pin final opacities inline (worker-3 failed and dims to 0.4) so a cancel
      // does not drop worker-1 and worker-2 back to the built 0.
      s.refs.pod1.style.opacity = '1';
      s.refs.pod2.style.opacity = '1';
      s.refs.pod3.style.opacity = '0.4';
      if (ctx.reduced) return;
      // Controller reconciles the observed exits down to the node state. On arrival the
      // three Pods react together: worker-1 and worker-2 settle as succeeded (stay lit),
      // worker-3 pulses then dims to show it failed.
      const recon = connectorPacket(s, ctx);
      pulsePod(s.refs.pod1, ctx, recon.arrivalMs);
      pulsePod(s.refs.pod2, ctx, recon.arrivalMs);
      pulsePod(s.refs.pod3, ctx, recon.arrivalMs);
      ctx.register(s.refs.pod3.animate([{ opacity: 1 }, { opacity: 0.4 }], { duration: FADE.out, delay: recon.arrivalMs, fill: 'both', easing: 'ease-in' }));
    },
  },
  {
    id: 'retry',
    duration: 2600,
    narration: 'Per spec.backoffLimit (default 6, total failures across the Job), the controller respawns a replacement Pod for the failed unit, gated by an exponential backoff that starts at 10s. Meanwhile worker-1 and worker-2 have finished, so fresh Pods take their slots for units 4 and 5 (each completion is its own Pod run, Pods are never reused). Three Pods active again, the parallelism cap respected.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setUnits(s, 'running · unit-4', 'running · unit-5', 'running · unit-3 (retry)');
      setVal(s.refs.succChip, '2');
      setVal(s.refs.failChip, '1');
      setVal(s.refs.phaseChip, 'Running · 3 active');
      setWire(s, 'req', 'Create Pods · units 4, 5 + unit-3 retry');
      s.refs.controller.classList.add('highlight');
      s.refs.apiserver.classList.add('highlight');
      s.refs.phaseChip.classList.add('highlight');
      setChainActive(s.refs.chain, 3);
      // Pin final opacities inline (worker-3 replacement back to 1) so a cancel
      // does not drop the three live Pods back to the built 0.
      s.refs.pod1.style.opacity = '1';
      s.refs.pod2.style.opacity = '1';
      s.refs.pod3.style.opacity = '1';
      if (ctx.reduced) return;
      // Replacement create travels controller -> Api -> Node. worker-3 already runs
      // its retry here at full opacity (the dim belonged to the previous step), all three
      // live Pods pulse together on arrival (parallelism=3).
      const req = topPacket(s, ctx);
      const create = connectorPacket(s, ctx, { delay: req.arrivalMs + BEAT.afterHop });
      pulsePod(s.refs.pod1, ctx, create.arrivalMs);
      pulsePod(s.refs.pod2, ctx, create.arrivalMs);
      pulsePod(s.refs.pod3, ctx, create.arrivalMs);
    },
  },
  {
    id: 'complete',
    duration: 2400,
    narration: 'Between them the three workers have completed all 6 units, the last one (unit-6) just finishing on worker-1. .status.succeeded now equals .spec.completions (6), so the controller sets condition Complete=True and stops creating Pods. The earlier single failure stays counted in .status.failed, and the terminated Pods are retained until ttlSecondsAfterFinished elapses (Job auto-cleanup) or until kubectl delete job is issued.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setUnits(s, 'unit-6 done · exit 0', 'unit-5 done · exit 0', 'unit-3 done · exit 0');
      setVal(s.refs.succChip, '6');
      setVal(s.refs.failChip, '1');
      setVal(s.refs.phaseChip, 'Complete · 6/6 succeeded');
      setWire(s, 'req', 'Watch final exit · succeeded == completions');
      s.refs.controller.classList.add('highlight');
      s.refs.phaseChip.classList.add('highlight');
      s.refs.succChip.classList.add('highlight');
      setChainActive(s.refs.chain, 4);
      // Pin final opacities inline so the three Pods stay visible after a cancel.
      s.refs.pod1.style.opacity = '1';
      s.refs.pod2.style.opacity = '1';
      s.refs.pod3.style.opacity = '1';
      if (ctx.reduced) return;
      // Final reconcile reaches the node. The three workers settle to their completed
      // units and pulse together as the Job reaches completions=6 (Complete=True).
      const fin = connectorPacket(s, ctx);
      pulsePod(s.refs.pod1, ctx, fin.arrivalMs);
      pulsePod(s.refs.pod2, ctx, fin.arrivalMs);
      pulsePod(s.refs.pod3, ctx, fin.arrivalMs);
    },
  },
];

export const init = makeInit(Scene, STEPS, { posterFirst: true });
