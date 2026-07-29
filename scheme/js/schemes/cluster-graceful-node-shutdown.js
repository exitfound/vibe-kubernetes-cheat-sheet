import { svg, g, text } from '../lib/svg.js';
import { arrowDefs, pod, node, box, chainList, setChainActive, arrow, pathArrow } from '../lib/primitives.js';
import { valChip, setVal, pulsePod, routePacket, topPacket, makeInit, clearHighlights, clearWires, setWire, lightBoxAt } from '../lib/cluster-kit.js';
// Design notes for this card: scheme/docs/CARDS.md#cluster-graceful-node-shutdown

// Laid out on the L, the way network and storage are: the narration panel owns the top-left
// corner, everything else is free. Measured worst case over 1600/1440/1280/1100 is x<=397,
// y<=220 for this card, so the corner reserved below is 400 x 240 and nothing is drawn in it.
// A longer narration on any step invalidates that bottom: re-measure with tools/panel probe.
const M = 60;
const CONTENT_L = M, CONTENT_R = 1200 - M;               // 60 / 1140
const CX = (CONTENT_L + CONTENT_R) / 2;                  // 600, the canvas centre by construction
const PANEL_R = 400, PANEL_B = 240;                      // the reserved corner

// Top row, right of the panel. One vertical spine carries the SIGTERM down to the Node, and it
// runs in the corridor between the ladder and the chip column so it crosses nothing.
const BOX_W = 232, BOX_H = 80;
const TOP_Y = 40, TOP_BOTTOM = TOP_Y + BOX_H;            // 40 / 120
const SPINE_X = 580;
const KUBE_X = SPINE_X - BOX_W / 2;                      // 464..696
const SYS_GAP = 56;
const SYS_X = KUBE_X + BOX_W + SYS_GAP;                  // 752..984
const LANE_DY = 12;                                      // catalog standard: a lane pair straddles the flow line
const TOP_CY = TOP_Y + BOX_H / 2;                        // 80
const SIG_Y = TOP_CY - LANE_DY, REL_Y = TOP_CY + LANE_DY;// 68 / 92, one lane per direction
const WIRE_Y = TOP_BOTTOM + 26;                          // 146
const WIRE_X = (KUBE_X + BOX_W + SYS_X) / 2;             // 724, centred in the gap

// Left band, which only opens up below the panel.
const LADDER_X = CONTENT_L, LADDER_W = 480;              // 60..540
const LADDER_Y = 250, ROW_H = 32, ROW_GAP = 10;          // 5 rows -> 250..450

const CHIP_X = 620, CHIP_W = CONTENT_R - CHIP_X;         // 520, 620..1140
const CHIP_H = 34, CHIP_GAP = 21;
const CHIP_Y = i => LADDER_Y + i * (CHIP_H + CHIP_GAP);  // 250 / 305 / 360 / 415, bottom 449

const NODE_Y = 476, NODE_H = 140;                        // 476..616
const NODE_X = CONTENT_L, NODE_W = CONTENT_R - CONTENT_L;// 60..1140
const POD_W = 300, POD_H = 106;
const POD_Y = NODE_Y + 22;                               // 498..604
const POD_INNER = { dx: 30, w: POD_W - 60, dy: 28, h: 52 };
const POD_PAD = 24;
const POD_SPAN = NODE_W - POD_PAD * 2;                   // 1032
const POD_XS = [0, 1, 2].map(i => NODE_X + POD_PAD + i * ((POD_SPAN - POD_W) / 2));  // 84 / 450 / 816
const POD_CXS = POD_XS.map(x => x + POD_W / 2);          // 234 / 600 / 966

// SIGTERM goes to a Pod, so the lane ends ON that Pod: the spine drops to a bus above the row and
// taps down into each one. One route per destination, and the same array feeds wire and ball.
const BUS_Y = NODE_Y - 14;                               // 462, between the columns and the frame
const SIG_LANE = i => [[SPINE_X, TOP_BOTTOM], [SPINE_X, BUS_Y], [POD_CXS[i], BUS_Y], [POD_CXS[i], POD_Y]];


class Scene {
  constructor(host) { this.host = host; this.refs = {}; this.build(); }

  build() {
    this.host.replaceChildren();
    this.refs = {};
    const root = svg({
      class: 'diagram',
      viewBox: '0 0 1200 640',
      preserveAspectRatio: 'xMidYMid meet',
      'aria-label': 'Graceful Node shutdown: systemd inhibitor lock, priority-ordered Pod termination',
      'data-style': 'outline',
    });
    root.appendChild(arrowDefs());

    const kubelet = box({ x: KUBE_X, y: TOP_Y, w: BOX_W, h: BOX_H, label: 'Kubelet', sublabel: 'shutdown manager', role: 'cluster' });
    const systemd = box({ x: SYS_X,  y: TOP_Y, w: BOX_W, h: BOX_H, label: 'systemd', sublabel: 'inhibitor lock',   role: 'cluster' });

    root.appendChild(arrow({ x1: SYS_X, y1: SIG_Y, x2: KUBE_X + BOX_W, y2: SIG_Y, dim: true, dashed: true, role: 'cluster' }));
    root.appendChild(arrow({ x1: KUBE_X + BOX_W, y1: REL_Y, x2: SYS_X, y2: REL_Y, dim: true, dashed: true, role: 'cluster' }));

    // Wire label (font-size: 9) centred in the 40px gap below the top row, populated per step.
    const wireSig = text({ class: 'scheme-label code dim', x: WIRE_X, y: WIRE_Y, 'text-anchor': 'middle', 'font-size': 9 }, [' ']);
    root.appendChild(wireSig);

    const lockChip     = valChip({ x: CHIP_X, y: CHIP_Y(0), w: CHIP_W, h: CHIP_H, name: 'inhibitor lock',                   value: 'held by Kubelet', role: 'cluster' });
    const gpChip       = valChip({ x: CHIP_X, y: CHIP_Y(1), w: CHIP_W, h: CHIP_H, name: 'shutdownGracePeriod',              value: '60s', role: 'cluster' });
    const gpCritChip   = valChip({ x: CHIP_X, y: CHIP_Y(2), w: CHIP_W, h: CHIP_H, name: 'shutdownGracePeriodCriticalPods', value: '20s', role: 'cluster' });
    const phaseChip    = valChip({ x: CHIP_X, y: CHIP_Y(3), w: CHIP_W, h: CHIP_H, name: 'phase',                            value: 'normal', role: 'cluster' });
    [lockChip, gpChip, gpCritChip, phaseChip].forEach(c => root.appendChild(c));

    const chain = chainList({
      x: LADDER_X, y: LADDER_Y, w: LADDER_W, rowH: ROW_H, gap: ROW_GAP,
      items: [
        '1. signal   ·  systemd PrepareForShutdown over D-Bus',
        '2. cordon   ·  reject new Pods, bucket by priority',
        '3. normal   ·  SIGTERM non-critical, await up to 40s',
        '4. critical ·  SIGTERM critical, await up to 20s',
        '5. release  ·  drop lock, OS proceeds with shutdown',
      ],
      role: 'cluster',
    });

    const nodeEl = node({ x: NODE_X, y: NODE_Y, w: NODE_W, h: NODE_H, label: 'Node-1' });

    const POD_SUBS = ['priority: 0', 'priority: 0', 'priority: 2e9'];
    const podBoxes = [];
    const podWrappers = POD_XS.map((px, i) => {
      const shell = pod({ x: px, y: POD_Y, w: POD_W, h: POD_H, label: 'Pod', sublabel: '', containers: 0, role: 'workloads' });
      shell.style.setProperty('--workloads-color', '#c0b0ff');
      const shellRect = shell.querySelector('.scheme-pod-rect');
      if (shellRect) shellRect.style.fill = 'rgba(255, 255, 255, 0.03)';

      const innerBox = box({ x: px + POD_INNER.dx, y: POD_Y + POD_INNER.dy, w: POD_INNER.w, h: POD_INNER.h, label: 'app', sublabel: POD_SUBS[i], role: 'workloads' });
      innerBox.style.setProperty('--workloads-color', '#c0b0ff');

      const wrap = g({ id: `pod${i + 1}` });
      wrap.appendChild(shell);
      wrap.appendChild(innerBox);
      podBoxes.push(innerBox);
      return wrap;
    });
    const [pod1, pod2, pod3] = podWrappers;
    const [pod1Box, pod2Box, pod3Box] = podBoxes;

    // One drawn lane per Pod the signal can reach; they share the spine and the bus by construction.
    const sigLanes = [0, 1, 2].map(i => pathArrow({ points: SIG_LANE(i), dim: true, dashed: true, role: 'cluster' }));
    sigLanes.forEach(l => root.appendChild(l));

    // Packet layer.
    const packetLayer = g({ id: 'packetLayer' });
    root.appendChild(packetLayer);

    root.appendChild(chain);
    root.appendChild(nodeEl);
    root.appendChild(pod1);
    root.appendChild(pod2);
    root.appendChild(pod3);
    root.appendChild(systemd);
    root.appendChild(kubelet);

    this.host.appendChild(root);
    this.refs = {
      svg: root,
      systemd, kubelet, chain, nodeEl, sigLanes,
      lockChip, gpChip, gpCritChip, phaseChip,
      pod1, pod2, pod3, pod1Box, pod2Box, pod3Box,
      packetLayer,
      wires: { sig: wireSig },
    };
  }

  reset() { this.build(); }
}

function clearHL(s) {
  clearHighlights(s,
    ['systemd','kubelet','lockChip','gpChip','gpCritChip','phaseChip'],
    [s.refs.pod1, s.refs.pod2, s.refs.pod3]);
}

// One helper pins a Pod and its own SIGTERM lane together: an arrowhead landing on a Pod that is
// already gone points at nothing, and two independent assignments drift the moment a step is added.
function setPods(s, ...vals) {
  vals.forEach((v, i) => {
    s.refs['pod' + (i + 1)].style.opacity = String(v);
    s.refs.sigLanes[i].style.opacity = String(v);
  });
}

const STEPS = [
  {
    id: 'idle',
    duration: 1500,
    enter(s) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setPods(s, 1, 1, 1);
      setVal(s.refs.lockChip, 'held by Kubelet');
      setVal(s.refs.gpChip, '60s');
      setVal(s.refs.gpCritChip, '20s');
      setVal(s.refs.phaseChip, 'normal');
      // Idle baseline: nothing is happening yet, no chain row highlighted.
      setChainActive(s.refs.chain, -1);
    },
  },
  {
    id: 'signal',
    duration: 2000,
    narration: 'The Node is about to shut down (poweroff, reboot, or hibernate), and systemd emits PrepareForShutdown over D-Bus. Kubelet catches the signal via its logind subscription. Its delay-type inhibitor lock makes systemd pause the actual shutdown, so Kubelet can enter shutdown mode rather than let the OS kill processes outright.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setPods(s, 1, 1, 1);
      setVal(s.refs.phaseChip, 'shutdown signal received');
      setWire(s, 'sig', 'PrepareForShutdown · D-Bus');
      s.refs.systemd.classList.add('highlight');
      s.refs.phaseChip.classList.add('highlight');
      setChainActive(s.refs.chain, 0);
      if (ctx.reduced) { s.refs.kubelet.classList.add('highlight'); return; }
      const pkt = topPacket(s, ctx, { from: SYS_X, to: KUBE_X + BOX_W, y: SIG_Y, role: 'cluster' });
      lightBoxAt(s.refs.kubelet, ctx, pkt.arrivalMs);
    },
  },
  {
    id: 'cordon',
    duration: 1900,
    narration: 'Kubelet flips its admission state and rejects any new Pod assignments from the API. Existing Pods are listed and bucketed by priority: those at or above the system-cluster-critical threshold (2,000,000,000) form the critical bucket, and the rest are non-critical.',
    enter(s) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setPods(s, 1, 1, 1);
      setVal(s.refs.phaseChip, 'cordoned · bucketing pods');
      s.refs.kubelet.classList.add('highlight');
      s.refs.phaseChip.classList.add('highlight');
      setChainActive(s.refs.chain, 1);
      // Kubelet flips admission state internally: nothing travels and no block
      // flashes, the phase value change carries the step.
    },
  },
  {
    id: 'terminate-normal',
    duration: 2900,
    narration: 'Kubelet sends SIGTERM to every non-critical Pod in parallel. They get shutdownGracePeriod minus shutdownGracePeriodCriticalPods to finish (40s with this configuration). Pods that exit early let the phase advance sooner.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setVal(s.refs.phaseChip, 'terminating non-critical · 40s');
      s.refs.kubelet.classList.add('highlight');
      s.refs.phaseChip.classList.add('highlight');
      s.refs.gpChip.classList.add('highlight');
      // Pin final state so cancel between steps does not flash to default. The critical Pod and its
      // lane survive this step, the other two go together.
      setPods(s, 0, 0, 1);
      setChainActive(s.refs.chain, 2);
      if (ctx.reduced) return;
      // One SIGTERM per non-critical Pod, each riding its own lane.
      const sig = routePacket(s, ctx, SIG_LANE(0), { role: 'cluster' });
      const sig2 = routePacket(s, ctx, SIG_LANE(1), { role: 'cluster' });
      pulsePod(s.refs.pod1, ctx, sig.arrivalMs);
      pulsePod(s.refs.pod2, ctx, sig2.arrivalMs);
      // Narrative-slow 1200ms fade: the grace-period drain reads as a long dim, not a snap. The lane
      // fades on the same beat as the Pod it feeds, and fill:'both' holds it on screen through the
      // delay window so the ball is never riding an invisible wire.
      ctx.register(s.refs.pod1.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 1200, delay: sig.arrivalMs, fill: 'both', easing: 'ease-in' }));
      ctx.register(s.refs.pod2.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 1200, delay: sig2.arrivalMs, fill: 'both', easing: 'ease-in' }));
      ctx.register(s.refs.sigLanes[0].animate([{ opacity: 1 }, { opacity: 0 }], { duration: 1200, delay: sig.arrivalMs, fill: 'both', easing: 'ease-in' }));
      ctx.register(s.refs.sigLanes[1].animate([{ opacity: 1 }, { opacity: 0 }], { duration: 1200, delay: sig2.arrivalMs, fill: 'both', easing: 'ease-in' }));
    },
  },
  {
    id: 'terminate-critical',
    duration: 3000,
    narration: 'After non-critical Pods are gone (or their grace expired), Kubelet sends SIGTERM to system-critical Pods. They get shutdownGracePeriodCriticalPods (20s here). DaemonSet infra workloads such as CNI or kube-proxy usually sit in this bucket.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setVal(s.refs.phaseChip, 'terminating critical · 20s');
      s.refs.kubelet.classList.add('highlight');
      s.refs.phaseChip.classList.add('highlight');
      s.refs.gpCritChip.classList.add('highlight');
      // Pin final state. Nothing is left in the Node frame, lanes included.
      setPods(s, 0, 0, 0);
      setChainActive(s.refs.chain, 3);
      if (ctx.reduced) return;
      const sig = routePacket(s, ctx, SIG_LANE(2), { role: 'cluster' });
      // SIGTERM reaches the critical Pod: it flinches (pulse) then terminates (fade).
      pulsePod(s.refs.pod3, ctx, sig.arrivalMs);
      // Narrative-slow 1200ms fade: the grace-period drain reads as a long dim, not a snap. The lane
      // rides the same timing, held visible through the delay window by fill:'both'.
      ctx.register(s.refs.pod3.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 1200, delay: sig.arrivalMs, fill: 'both', easing: 'ease-in' }));
      ctx.register(s.refs.sigLanes[2].animate([{ opacity: 1 }, { opacity: 0 }], { duration: 1200, delay: sig.arrivalMs, fill: 'both', easing: 'ease-in' }));
    },
  },
  {
    id: 'release',
    duration: 2200,
    narration: 'All Pods are gone or their grace expired. Kubelet releases the inhibitor lock, and systemd resumes the shutdown sequence. While the Node is down, the Lease in kube-node-lease grows stale, so the cluster marks it NotReady until Kubelet boots back up and resumes renewals.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setVal(s.refs.lockChip, 'released');
      setVal(s.refs.phaseChip, 'lock released · OS shutdown');
      setWire(s, 'sig', 'release lock');
      s.refs.kubelet.classList.add('highlight');
      s.refs.lockChip.classList.add('highlight');
      s.refs.phaseChip.classList.add('highlight');
      // Pin final state.
      setPods(s, 0, 0, 0);
      setChainActive(s.refs.chain, 4);
      if (ctx.reduced) { s.refs.systemd.classList.add('highlight'); return; }
      const pkt = topPacket(s, ctx, { from: KUBE_X + BOX_W, to: SYS_X, y: REL_Y, role: 'cluster' });
      lightBoxAt(s.refs.systemd, ctx, pkt.arrivalMs);
    },
  },
];

export const init = makeInit(Scene, STEPS, { posterFirst: true });
