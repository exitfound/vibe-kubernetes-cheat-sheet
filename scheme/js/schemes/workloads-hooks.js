import { svg, g, rect, text } from '../lib/svg.js';
import { arrowDefs, pod, node, box, chainList, setChainActive, arrow, pathArrow } from '../lib/primitives.js';
import { routePacket, valChip, setVal, pulsePod, topPacket, segmentPacket, makeInit, clearHighlights, clearWires, setWire, lightBoxAt, FADE, BEAT, OPACITY, WL } from '../lib/workloads-kit.js';

// Layout C of the Workloads canon (WL): the deepest panel in the category leaves room for no column.
// Panel worst case x<=397, y<=379; a longer narration invalidates that measurement.
// Design notes for this card: scheme/docs/CARDS.md#workloads-hooks
const PANEL_B = 379;
const TOP1_X = 420, TOP1_W = 220;
const TOP_GAP = 60;
const TOP2_X = TOP1_X + TOP1_W + TOP_GAP, TOP2_W = 220;
const TOP_CY = WL.TOP_Y + WL.BOX_H / 2;
const REQ_Y = TOP_CY - WL.LANE_DY, RESP_Y = TOP_CY + WL.LANE_DY;
const WIRE_X = (TOP1_X + TOP1_W + TOP2_X) / 2;
const WIRE_Y = WL.TOP_Y - 12;                            // above the actor row, off the spine

const LAD_X = WL.CHIP_X, LAD_W = WL.CHIP_W;              // 660..1140, the pipeline
const LAD_Y = 140;                                       // 6 rows -> 140..382

const NODE_Y = 394, NODE_H = 134;                        // 394..528, below the ladder and the panel
const POD_W = 460, POD_H = 106, POD_TOP_PAD = 20;
const POD_X = WL.CX - POD_W / 2;                         // 370..830, centred on CX
const POD_Y = NODE_Y + POD_TOP_PAD;                      // 414..520, clear of the frame label
const CONT_W = 300, CONT_X = WL.CX - CONT_W / 2, CONT_H = 64;
const POD_INNER = { dy: 28 };

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

// The spine steps into the central corridor beside the ladder and reaches the Pod itself.
const TOP2_CX = TOP2_X + TOP2_W / 2;                     // 810
const JOG_Y = WL.TOP_BOTTOM + 20;                        // 140, below the boxes, above the ladder
// The lane into the container leaves the RUNTIME, not Kubelet. Kubelet never touches a container
// directly, which is the whole subject of the card: it asks over CRI and the runtime is what execs
// the hook and delivers the signal. Both steps that ride this say so in their own wire label
// (CRI ExecSync · preStop · Sync, CRI StopContainer · SIGTERM · ACK), and it used to leave TOP1_CX.
const SPINE = [[TOP2_CX, WL.TOP_BOTTOM], [TOP2_CX, JOG_Y], [WL.SPINE_X, JOG_Y], [WL.SPINE_X, POD_Y]];


class Scene {
  constructor(host) { this.host = host; this.refs = {}; this.build(); }

  build() {
    this.host.replaceChildren();
    this.refs = {};
    const root = svg({
      class: 'diagram',
      viewBox: '0 0 1200 640',
      preserveAspectRatio: 'xMidYMid meet',
      'aria-label': 'Container lifecycle hooks: postStart races the ENTRYPOINT, preStop runs synchronously before SIGTERM',
      'data-style': 'outline',
    });
    root.appendChild(arrowDefs());

    const kubelet = box({ x: TOP1_X, y: WL.TOP_Y, w: TOP1_W, h: WL.BOX_H, label: 'Kubelet', sublabel: 'lifecycle handler', role: 'cluster' });
    const runtime = box({ x: TOP2_X, y: WL.TOP_Y, w: TOP2_W, h: WL.BOX_H, label: 'Runtime', sublabel: 'CRI runc / containerd', role: 'cluster' });

    root.appendChild(arrow({ x1: TOP1_X + TOP1_W, y1: REQ_Y, x2: TOP2_X, y2: REQ_Y, dim: true, dashed: true, role: 'cluster' }));
    root.appendChild(arrow({ x1: TOP2_X, y1: RESP_Y, x2: TOP1_X + TOP1_W, y2: RESP_Y, dim: true, dashed: true, role: 'cluster' }));

    // Single wire label centered below the top row, set per step via setWire.
    const wireReq = text({ class: 'scheme-label code dim', x: WIRE_X, y: WIRE_Y, 'text-anchor': 'middle', 'font-size': 9 }, [' ']);
    root.appendChild(wireReq);

    const postStartChip   = valChip({ x: CHIP_X(0), y: CHIP_Y(0), w: CHIP_W, h: WL.CHIP_H, name: 'postStart hook',  value: 'declared', role: 'workloads' });
    const entrypointChip  = valChip({ x: CHIP_X(1), y: CHIP_Y(1), w: CHIP_W, h: WL.CHIP_H, name: 'ENTRYPOINT',       value: 'not started', role: 'workloads' });
    const preStopChip     = valChip({ x: CHIP_X(2), y: CHIP_Y(2), w: CHIP_W, h: WL.CHIP_H, name: 'preStop hook',     value: 'declared', role: 'workloads' });
    const stateChip       = valChip({ x: CHIP_X(3), y: CHIP_Y(3), w: CHIP_W, h: WL.CHIP_H, name: 'container state',  value: 'Waiting', role: 'workloads' });
    const graceChip       = valChip({ x: CHIP_X(4), y: CHIP_Y(4), w: CHIP_W, h: WL.CHIP_H, name: 'grace remaining',  value: '30s', role: 'workloads' });
    [postStartChip, entrypointChip, preStopChip, stateChip, graceChip].forEach(c => root.appendChild(c));

    const chain = chainList({
      x: LAD_X, y: LAD_Y, w: LAD_W, rowH: WL.ROW_H, gap: WL.ROW_GAP,
      items: [
        '1. declared  ·  spec defines postStart + preStop',
        '2. created   ·  runtime starts the ENTRYPOINT',
        '3. postStart ·  hook races the ENTRYPOINT, no order',
        '4. running   ·  both settled, container serves',
        '5. preStop   ·  delete fires hook before any signal',
        '6. sigterm   ·  SIGTERM, then SIGKILL at grace=0',
      ],
      role: 'cluster',
    });

    const nodeEl = node({ x: WL.L, y: NODE_Y, w: WL.W, h: NODE_H, label: 'Node-1' });

    const podShell = pod({ x: POD_X, y: POD_Y, w: POD_W, h: POD_H, label: 'Pod', sublabel: '', containers: 0, role: 'workloads' });
    const podShellRect = podShell.querySelector('.scheme-pod-rect');
    if (podShellRect) podShellRect.style.fill = 'rgba(255, 255, 255, 0.03)';

    const containerBox = box({ x: CONT_X, y: POD_Y + POD_INNER.dy, w: CONT_W, h: CONT_H, label: 'app', sublabel: 'terminationGracePeriod: 30s', role: 'workloads' });

    const podGroup = g({ id: 'podGroup' });
    podGroup.appendChild(podShell);
    podGroup.appendChild(containerBox);

    const connector = pathArrow({
      points: SPINE,
      dim: true, dashed: true, role: 'cluster',
    });
    root.appendChild(connector);

    // Packet layer.
    const packetLayer = g({ id: 'packetLayer' });
    root.appendChild(packetLayer);

    root.appendChild(chain);
    root.appendChild(nodeEl);
    root.appendChild(podGroup);
    root.appendChild(kubelet);
    root.appendChild(runtime);

    this.host.appendChild(root);
    this.refs = {
      svg: root,
      kubelet, runtime, chain, nodeEl, podGroup, podShell, containerBox, connector,
      postStartChip, entrypointChip, preStopChip, stateChip, graceChip,
      packetLayer,
      wires: { req: wireReq },
    };
  }

  reset() { this.build(); }
}

function clearHL(s) {
  clearHighlights(s,
    ['kubelet','runtime','postStartChip','entrypointChip','preStopChip','stateChip','graceChip','podShell','containerBox'],
    [s.refs.podGroup]);
}

const STEPS = [
  {
    id: 'idle',
    duration: 1500,
    enter(s) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      s.refs.podGroup.style.opacity = String(OPACITY.pending);
      setVal(s.refs.postStartChip, 'declared');
      setVal(s.refs.entrypointChip, 'not started');
      setVal(s.refs.preStopChip, 'declared');
      setVal(s.refs.stateChip, 'Waiting');
      setVal(s.refs.graceChip, '30s');
      setChainActive(s.refs.chain, -1);
    },
  },
  {
    id: 'declared',
    duration: 1900,
    narration: 'The Pod spec carries two per-container handlers. The lifecycle.postStart hook will fire concurrently with the ENTRYPOINT the moment the container is created, with no ordering guarantee between the two. The lifecycle.preStop hook will run synchronously on delete, before any signal, and eats into terminationGracePeriodSeconds while it runs. Each handler is one of exec (a command inside the container), httpGet (an HTTP request Kubelet issues against the Pod IP), or sleep (a fixed-duration pause). A tcpSocket handler also exists but is deprecated.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      s.refs.podGroup.style.opacity = String(OPACITY.pending);
      setVal(s.refs.postStartChip, 'declared');
      setVal(s.refs.entrypointChip, 'not started');
      setVal(s.refs.preStopChip, 'declared');
      setVal(s.refs.stateChip, 'Waiting');
      setVal(s.refs.graceChip, '30s');
      setWire(s, 'req', 'lifecycle.postStart + preStop declared');
      s.refs.postStartChip.classList.add('highlight');
      s.refs.preStopChip.classList.add('highlight');
      setChainActive(s.refs.chain, 0);
      // Declaration only, nothing travels. The two declared hooks light up via the
      // static highlight outline; pulsing is reserved for the Pod blocks, so no chip flash.
    },
  },
  {
    id: 'created',
    duration: 2200,
    narration: 'The runtime creates the container from the image and starts the ENTRYPOINT process as PID 1. The Kubelet has issued the CreateContainer and StartContainer calls over the CRI socket, so the container has just been started and is moving into the Running state.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      s.refs.podGroup.style.opacity = '1';
      setVal(s.refs.entrypointChip, 'starting (PID 1)');
      setVal(s.refs.stateChip, 'Running');
      s.refs.stateChip.classList.add('highlight');
      setWire(s, 'req', 'CRI CreateContainer + StartContainer · OK');
      s.refs.kubelet.classList.add('highlight');
      s.refs.entrypointChip.classList.add('highlight');
      setChainActive(s.refs.chain, 1);
      if (ctx.reduced) { s.refs.runtime.classList.add('highlight'); return; }
      // The CRI calls hop to the runtime, the OK hops back, and the container
      // materializes once the start call lands.
      const req = topPacket(s, ctx, { from: TOP1_X + TOP1_W, to: TOP2_X, y: REQ_Y, role: 'workloads' });
      lightBoxAt(s.refs.runtime, ctx, req.arrivalMs);
      segmentPacket(s, ctx, { from: [TOP2_X, RESP_Y], to: [TOP1_X + TOP1_W, RESP_Y], delay: req.arrivalMs + BEAT.afterHop, role: 'workloads' });
      ctx.register(s.refs.podGroup.animate(
        [{ opacity: OPACITY.pending }, { opacity: 1 }],
        { duration: FADE.in, delay: req.arrivalMs, fill: 'both', easing: 'ease-out' }
      ));
    },
  },
  {
    id: 'poststart',
    duration: 2100,
    narration: 'Kubelet fires the postStart hook the moment the container is created, concurrently with the ENTRYPOINT. There is no guarantee which one finishes first. Exec handlers run inside the container over CRI ExecSync, httpGet handlers are issued by Kubelet directly against the Pod IP. If the handler exits non-zero or times out, Kubelet kills the container (subject to the Pod restartPolicy).',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      s.refs.podGroup.style.opacity = '1';
      setVal(s.refs.postStartChip, 'exec running (racing)');
      setVal(s.refs.entrypointChip, 'running (racing)');
      setVal(s.refs.stateChip, 'Running');
      setWire(s, 'req', 'CRI ExecSync · postStart · Exit 0');
      s.refs.kubelet.classList.add('highlight');
      s.refs.postStartChip.classList.add('highlight');
      s.refs.entrypointChip.classList.add('highlight');
      setChainActive(s.refs.chain, 2);
      if (ctx.reduced) { s.refs.runtime.classList.add('highlight'); return; }
      const req = topPacket(s, ctx, { from: TOP1_X + TOP1_W, to: TOP2_X, y: REQ_Y, role: 'workloads' });
      lightBoxAt(s.refs.runtime, ctx, req.arrivalMs);
      segmentPacket(s, ctx, { from: [TOP2_X, RESP_Y], to: [TOP1_X + TOP1_W, RESP_Y], delay: req.arrivalMs + BEAT.afterHop, role: 'workloads' });
    },
  },
  {
    id: 'running',
    duration: 2200,
    narration: 'Both the ENTRYPOINT and the postStart handler have settled. The container reports Running and the postStart chip flips to completed. Kubelet keeps watching via PLEG and running readiness/liveness probes, the runtime keeps the process alive, and the Pod takes traffic through its Service endpoints once Ready.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      s.refs.podGroup.style.opacity = '1';
      setVal(s.refs.postStartChip, 'completed (exit 0)');
      setVal(s.refs.entrypointChip, 'running');
      setVal(s.refs.stateChip, 'Running');
      setWire(s, 'req', 'PLEG watch · Readiness probe OK · Serving traffic');
      s.refs.kubelet.classList.add('highlight');
      s.refs.postStartChip.classList.add('highlight');
      s.refs.entrypointChip.classList.add('highlight');
      s.refs.stateChip.classList.add('highlight');
      setChainActive(s.refs.chain, 3);
      if (ctx.reduced) { s.refs.runtime.classList.add('highlight'); return; }
      const req = topPacket(s, ctx, { from: TOP1_X + TOP1_W, to: TOP2_X, y: REQ_Y, role: 'workloads' });
      lightBoxAt(s.refs.runtime, ctx, req.arrivalMs);
      segmentPacket(s, ctx, { from: [TOP2_X, RESP_Y], to: [TOP1_X + TOP1_W, RESP_Y], delay: req.arrivalMs + BEAT.afterHop, role: 'workloads' });
    },
  },
  {
    id: 'prestop',
    duration: 3800,
    narration: 'A delete arrives and the container is about to be stopped. Before sending any signal, Kubelet runs the preStop hook synchronously and waits for it to return. The ENTRYPOINT is still Running here. The hook executes inside the terminationGracePeriodSeconds budget, so its runtime is subtracted from the 30s window.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      s.refs.podGroup.style.opacity = '1';
      setVal(s.refs.preStopChip, 'exec running (sync)');
      setVal(s.refs.stateChip, 'Running');
      setVal(s.refs.graceChip, '22s');
      setWire(s, 'req', 'CRI ExecSync · preStop · Sync');
      s.refs.kubelet.classList.add('highlight');
      s.refs.preStopChip.classList.add('highlight');
      s.refs.graceChip.classList.add('highlight');
      setChainActive(s.refs.chain, 4);
      if (ctx.reduced) { s.refs.runtime.classList.add('highlight'); return; }
      const req = topPacket(s, ctx, { from: TOP1_X + TOP1_W, to: TOP2_X, y: REQ_Y, role: 'workloads' });
      lightBoxAt(s.refs.runtime, ctx, req.arrivalMs);
      const ack = segmentPacket(s, ctx, { from: [TOP2_X, RESP_Y], to: [TOP1_X + TOP1_W, RESP_Y], delay: req.arrivalMs + BEAT.afterHop, role: 'workloads' });
      const exec = routePacket(s, ctx, SPINE, { delay: ack.arrivalMs + BEAT.afterHop, role: 'workloads' });
      pulsePod(s.refs.podGroup, ctx, exec.arrivalMs);
    },
  },
  {
    id: 'sigterm',
    duration: 4000,
    narration: 'Once preStop returns, Kubelet asks the runtime to stop the container via CRI StopContainer. The runtime delivers SIGTERM to the ENTRYPOINT process inside the Pod. The grace timer keeps counting down from where preStop left off. If the process is still alive when it reaches 0, the runtime escalates to SIGKILL. The container then exits and the Pod object is removed from the API.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setVal(s.refs.preStopChip, 'completed (exit 0)');
      s.refs.preStopChip.classList.add('highlight');
      setVal(s.refs.entrypointChip, 'received SIGTERM');
      s.refs.entrypointChip.classList.add('highlight');
      setVal(s.refs.stateChip, 'Terminated');
      setVal(s.refs.graceChip, '0s · SIGKILL');
      setWire(s, 'req', 'CRI StopContainer · SIGTERM · ACK');
      s.refs.kubelet.classList.add('highlight');
      s.refs.stateChip.classList.add('highlight');
      s.refs.graceChip.classList.add('highlight');
      // Pin final state inline so cancel between steps does not flash to default.
      s.refs.podGroup.style.opacity = String(OPACITY.terminating);
      setChainActive(s.refs.chain, 5);
      if (ctx.reduced) { s.refs.runtime.classList.add('highlight'); return; }
      const req = topPacket(s, ctx, { from: TOP1_X + TOP1_W, to: TOP2_X, y: REQ_Y, role: 'workloads' });
      lightBoxAt(s.refs.runtime, ctx, req.arrivalMs);
      const ack = segmentPacket(s, ctx, { from: [TOP2_X, RESP_Y], to: [TOP1_X + TOP1_W, RESP_Y], delay: req.arrivalMs + BEAT.afterHop, role: 'workloads' });
      const stop = routePacket(s, ctx, SPINE, { delay: ack.arrivalMs + BEAT.afterHop, role: 'workloads' });
      pulsePod(s.refs.podGroup, ctx, stop.arrivalMs);
      ctx.register(s.refs.podGroup.animate(
        [{ opacity: 1 }, { opacity: OPACITY.terminating }],
        { duration: FADE.out, delay: stop.arrivalMs, fill: 'both', easing: 'ease-in' }
      ));
    },
  },
];

export const init = makeInit(Scene, STEPS, { posterFirst: true });
