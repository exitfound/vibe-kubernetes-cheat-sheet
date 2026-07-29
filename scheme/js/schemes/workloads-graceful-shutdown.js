import { svg, g, rect, text } from '../lib/svg.js';
import { arrowDefs, pod, node, box, chainList, setChainActive, arrow, pathArrow } from '../lib/primitives.js';
import { valChip, setVal, pulsePod, setConnectorDir, routePacket, topPacket, makeInit, clearHighlights, clearWires, setWire, FADE, BEAT, lightBoxAt, OPACITY, WL } from '../lib/workloads-kit.js';

// Layout C of the Workloads canon (WL): full-width chip strip, three per row.
// Panel worst case x<=397, y<=280; a longer narration invalidates that measurement.
// Design notes for this card: scheme/docs/CARDS.md#workloads-graceful-shutdown
const PANEL_B = 280;
const TOP1_X = 420, TOP1_W = 220;
const TOP_GAP = 60;
const TOP2_X = TOP1_X + TOP1_W + TOP_GAP, TOP2_W = 220;
const TOP_CY = WL.TOP_Y + WL.BOX_H / 2;
const REQ_Y = TOP_CY - WL.LANE_DY, RESP_Y = TOP_CY + WL.LANE_DY;
const WIRE_X = (TOP1_X + TOP1_W + TOP2_X) / 2;
const WIRE_Y = WL.TOP_Y - 12;                            // above the actor row, off the spine

const LAD_X = WL.CHIP_X, LAD_W = WL.CHIP_W;              // 660..1140, the pipeline
const LAD_Y = 140;                                       // 6 rows -> 140..382

const NODE_Y = 394, NODE_H = 134;                        // 394..528, below the ladder
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

// The connector steps into the central corridor beside the ladder and reaches the Pod itself.
const TOP1_CX = TOP1_X + TOP1_W / 2;                     // 530
const JOG_Y = WL.TOP_BOTTOM + 20;                        // 140, below the boxes, above the ladder
const CONNECTOR_DOWN = [[TOP1_CX, WL.TOP_BOTTOM], [TOP1_CX, JOG_Y], [WL.SPINE_X, JOG_Y], [WL.SPINE_X, POD_Y]];
const CONNECTOR_UP   = [...CONNECTOR_DOWN].reverse();

class Scene {
  constructor(host) { this.host = host; this.refs = {}; this.build(); }

  build() {
    this.host.replaceChildren();
    this.refs = {};
    const root = svg({
      class: 'diagram',
      viewBox: '0 0 1200 640',
      preserveAspectRatio: 'xMidYMid meet',
      'aria-label': 'Graceful Pod shutdown: deletionTimestamp, EndpointSlice marked terminating, preStop, SIGTERM, grace countdown, SIGKILL',
      'data-style': 'outline',
    });
    root.appendChild(arrowDefs());

    const kubectl = box({ x: TOP1_X, y: WL.TOP_Y, w: TOP1_W, h: WL.BOX_H, label: 'kubectl', sublabel: 'delete pod app-pod', role: 'cluster' });
    const api     = box({ x: TOP2_X, y: WL.TOP_Y, w: TOP2_W, h: WL.BOX_H, label: 'API', sublabel: 'sets deletionTimestamp', role: 'cluster' });

    root.appendChild(arrow({ x1: TOP1_X + TOP1_W, y1: REQ_Y, x2: TOP2_X, y2: REQ_Y, dim: true, dashed: true, role: 'cluster' }));
    root.appendChild(arrow({ x1: TOP2_X, y1: RESP_Y, x2: TOP1_X + TOP1_W, y2: RESP_Y, dim: true, dashed: true, role: 'cluster' }));

    const connectorDown = pathArrow({ points: CONNECTOR_DOWN, dim: true, dashed: true, role: 'cluster' });
    const connectorUp   = pathArrow({ points: CONNECTOR_UP,   dim: true, dashed: true, role: 'cluster' });
    connectorUp.style.opacity = '0';
    root.appendChild(connectorDown);
    root.appendChild(connectorUp);

    // Single wire label centered above the top row, clear of the connector below it.
    const wireReq = text({ class: 'scheme-label code dim', x: WIRE_X, y: WIRE_Y, 'text-anchor': 'middle', 'font-size': 9 }, [' ']);
    root.appendChild(wireReq);

    const chain = chainList({
      x: LAD_X, y: LAD_Y, w: LAD_W, rowH: WL.ROW_H, gap: WL.ROW_GAP,
      items: [
        '1. running   ·  Pod IP serving traffic',
        '2. delete    ·  deletionTimestamp, endpoint ready=false',
        '3. preStop   ·  Kubelet runs hook synchronously',
        '4. SIGTERM   ·  signal PID 1, drain in-flight work',
        '5. countdown ·  terminationGracePeriodSeconds ticks',
        '6. SIGKILL   ·  force-kill, remove Pod from etcd',
      ],
      role: 'cluster',
    });

    // State chips in the bottom strip, three then two.
    const preStopChip = valChip({ x: CHIP_X(0), y: CHIP_Y(0), w: CHIP_W, h: WL.CHIP_H, name: 'preStop hook',     value: 'idle', role: 'workloads' });
    const sigChip     = valChip({ x: CHIP_X(1), y: CHIP_Y(1), w: CHIP_W, h: WL.CHIP_H, name: 'signal',           value: 'none', role: 'workloads' });
    const graceChip   = valChip({ x: CHIP_X(2), y: CHIP_Y(2), w: CHIP_W, h: WL.CHIP_H, name: 'grace remaining',  value: '30s', role: 'workloads' });
    const statusChip  = valChip({ x: CHIP_X(3), y: CHIP_Y(3), w: CHIP_W, h: WL.CHIP_H, name: 'pod status',       value: 'Running', role: 'workloads' });
    const sliceChip   = valChip({ x: CHIP_X(4), y: CHIP_Y(4), w: CHIP_W, h: WL.CHIP_H, name: 'EndpointSlice',    value: '[10.244.1.7]', role: 'workloads' });
    [preStopChip, sigChip, graceChip, statusChip, sliceChip].forEach(c => root.appendChild(c));

    const nodeEl = node({ x: WL.L, y: NODE_Y, w: WL.W, h: NODE_H, label: 'Node-1' });

    const podShell = pod({ x: POD_X, y: POD_Y, w: POD_W, h: POD_H, label: 'Pod', sublabel: '', containers: 0, role: 'workloads' });
    const podShellRect = podShell.querySelector('.scheme-pod-rect');
    if (podShellRect) podShellRect.style.fill = 'rgba(255, 255, 255, 0.03)';

    // The container box. Signals target its main process, PID 1.
    const containerBox = box({ x: CONT_X, y: POD_Y + POD_INNER.dy, w: CONT_W, h: CONT_H, label: 'app', sublabel: 'container: PID 1', role: 'workloads' });

    const podGroup = g({ id: 'podGroup' });
    podGroup.appendChild(podShell);
    podGroup.appendChild(containerBox);

    // Packet layer.
    const packetLayer = g({ id: 'packetLayer' });
    root.appendChild(packetLayer);

    root.appendChild(chain);
    root.appendChild(nodeEl);
    root.appendChild(podGroup);
    root.appendChild(kubectl);
    root.appendChild(api);

    this.host.appendChild(root);
    this.refs = {
      svg: root,
      kubectl, api, chain, nodeEl, podGroup, connectorDown, connectorUp,
      preStopChip, sigChip, graceChip, statusChip, sliceChip,
      packetLayer,
      wires: { req: wireReq },
    };
  }

  reset() { this.build(); }
}

function clearHL(s) {
  clearHighlights(s,
    ['kubectl','api','preStopChip','sigChip','graceChip','statusChip','sliceChip'],
    [s.refs.podGroup]);
}

const STEPS = [
  {
    id: 'running',
    duration: 1500,
    enter(s) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setVal(s.refs.preStopChip, 'idle');
      setVal(s.refs.sigChip, 'none');
      setVal(s.refs.graceChip, '30s');
      setVal(s.refs.statusChip, 'Running');
      setVal(s.refs.sliceChip, '[10.244.1.7]');
      // Serving traffic: full opacity. Nothing is lit at step 0.
      s.refs.podGroup.style.opacity = '1';
      setConnectorDir(s, 'down');
      setChainActive(s.refs.chain, 0);
    },
  },
  {
    id: 'delete',
    duration: 3800,
    narration: 'A kubectl delete reaches the API, which stamps metadata.deletionTimestamp on the Pod. That field is what makes kubectl report the Pod as Terminating, while status.phase itself stays Running. In parallel the EndpointSlice controller marks 10.244.1.7 terminating with ready false rather than removing it, so kube-proxy stops sending new connections while the Kubelet termination sequence begins.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setVal(s.refs.preStopChip, 'idle');
      setVal(s.refs.sigChip, 'none');
      setVal(s.refs.graceChip, '30s');
      setVal(s.refs.statusChip, 'Terminating');
      setVal(s.refs.sliceChip, '[10.244.1.7] ready=false');
      setWire(s, 'req', 'DELETE /api/v1/.../app-pod');
      s.refs.kubectl.classList.add('highlight');
      s.refs.statusChip.classList.add('highlight');
      s.refs.sliceChip.classList.add('highlight');
      s.refs.podGroup.style.opacity = '1';
      setConnectorDir(s, 'down');
      setChainActive(s.refs.chain, 1);
      if (ctx.reduced) { s.refs.api.classList.add('highlight'); return; }
      // DELETE hits the apiserver (top hop), then the termination order travels
      // down to the kubelet side and the Pod pulses on arrival. The API receives the
      // DELETE, so it lights on arrival rather than at step entry.
      const req = topPacket(s, ctx, { from: TOP1_X + TOP1_W, to: TOP2_X, y: REQ_Y, role: 'workloads' });
      lightBoxAt(s.refs.api, ctx, req.arrivalMs);
      // The stamped field goes straight back on the answer lane, which is what the narration means by
      // the field making kubectl REPORT the Pod as Terminating. kubectl is the source of the round
      // trip and is already lit, so it does not light again on arrival.
      topPacket(s, ctx, { from: TOP2_X, to: TOP1_X + TOP1_W, y: RESP_Y, delay: req.arrivalMs + BEAT.afterHop, role: 'workloads' });
      const order = routePacket(s, ctx, CONNECTOR_DOWN, { delay: req.arrivalMs + BEAT.afterHop, role: 'workloads' });
      pulsePod(s.refs.podGroup, ctx, order.arrivalMs);
    },
  },
  {
    id: 'prestop',
    duration: 2000,
    narration: 'The Kubelet runs the container preStop hook synchronously, before any signal is sent. A common pattern is a short sleep, which holds the process alive long enough for load balancers and kube-proxy to finish deregistering the endpoint. New requests stop arriving while in-flight ones still complete.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setVal(s.refs.preStopChip, 'exec: sleep 5');
      setVal(s.refs.sigChip, 'none');
      setVal(s.refs.graceChip, '30s');
      setVal(s.refs.statusChip, 'Terminating');
      setVal(s.refs.sliceChip, '[10.244.1.7] ready=false');
      s.refs.preStopChip.classList.add('highlight');
      s.refs.podGroup.style.opacity = '1';
      setConnectorDir(s, 'down');
      setChainActive(s.refs.chain, 2);
      if (ctx.reduced) return;
      // The hook runs inside the container: the Pod pulses (the hook chip lights via
      // the static highlight only, no chip pulse).
      pulsePod(s.refs.podGroup, ctx, 0);
    },
  },
  {
    id: 'sigterm',
    duration: 2000,
    narration: 'Once preStop returns, the Kubelet asks the runtime to send SIGTERM to PID 1. A well-behaved app traps this signal, stops accepting new work, drains in-flight requests and closes its connections and pools. The time the preStop hook consumed is already gone from the same grace budget.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setVal(s.refs.preStopChip, 'completed');
      s.refs.preStopChip.classList.add('highlight');
      setVal(s.refs.sigChip, 'SIGTERM');
      setVal(s.refs.graceChip, '25s');
      setVal(s.refs.statusChip, 'Terminating');
      setVal(s.refs.sliceChip, '[10.244.1.7] ready=false');
      s.refs.sigChip.classList.add('highlight');
      s.refs.graceChip.classList.add('highlight');
      s.refs.podGroup.style.opacity = '1';
      setConnectorDir(s, 'down');
      setChainActive(s.refs.chain, 3);
      if (ctx.reduced) return;
      // SIGTERM lands on PID 1: the Pod pulses (the signal chips light via the
      // static highlight only, no chip pulse).
      pulsePod(s.refs.podGroup, ctx, 0);
    },
  },
  {
    id: 'countdown',
    duration: 2100,
    narration: 'The terminationGracePeriodSeconds, 30 by default, counts down from the moment of deletion. The preStop hook and the SIGTERM drain both spend this single shared budget. Most applications exit well before the timer reaches zero, and the Kubelet then proceeds straight to cleanup.',
    enter(s) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setVal(s.refs.preStopChip, 'completed');
      setVal(s.refs.sigChip, 'SIGTERM');
      setVal(s.refs.graceChip, '6s');
      setVal(s.refs.statusChip, 'Terminating');
      setVal(s.refs.sliceChip, '[10.244.1.7] ready=false');
      s.refs.graceChip.classList.add('highlight');
      s.refs.podGroup.style.opacity = '1';
      setConnectorDir(s, 'down');
      setChainActive(s.refs.chain, 4);
      // Pure timer step, nothing travels and the Pod is untouched: the ticking grace
      // budget shows via the static highlight only (no chip pulse).
    },
  },
  {
    id: 'sigkill',
    duration: 3500,
    narration: 'If the container is still alive when the grace timer reaches 0, the runtime sends SIGKILL, which the kernel delivers unconditionally to PID 1. Once the process is gone the Kubelet reports the terminated container, and the API removes the Pod object from ETCD.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setVal(s.refs.preStopChip, 'completed');
      setVal(s.refs.sigChip, 'SIGKILL');
      setVal(s.refs.graceChip, '0s · expired');
      setVal(s.refs.statusChip, 'deleted');
      setVal(s.refs.sliceChip, '[]');
      s.refs.sliceChip.classList.add('highlight');
      setWire(s, 'req', 'Pod removed from etcd');
      s.refs.sigChip.classList.add('highlight');
      s.refs.statusChip.classList.add('highlight');
      s.refs.graceChip.classList.add('highlight');
      // Killed and purged: the whole Pod block drops to its faint terminal state.
      s.refs.podGroup.style.opacity = String(OPACITY.terminated);
      setConnectorDir(s, 'up');
      setChainActive(s.refs.chain, 5);
      if (ctx.reduced) { s.refs.api.classList.add('highlight'); return; }
      pulsePod(s.refs.podGroup, ctx, 0);
      ctx.register(s.refs.podGroup.animate(
        [{ opacity: 1 }, { opacity: OPACITY.terminated }],
        { duration: FADE.out, fill: 'both', easing: 'ease-in' }
      ));
      // After the process is gone, the kubelet reports up to the apiserver.
      const pkt = routePacket(s, ctx, CONNECTOR_UP, { delay: BEAT.afterPulse, role: 'workloads' });
      lightBoxAt(s.refs.api, ctx, pkt.arrivalMs);
    },
  },
];

export const init = makeInit(Scene, STEPS, { posterFirst: true });
