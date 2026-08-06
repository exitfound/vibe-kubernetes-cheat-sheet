import { g, text } from '../../lib/svg.js';
import { arrowDefs, node, box, chainList, setChainActive, arrow, pathArrow, podShell } from '../../lib/primitives.js';
import { valChip, setVal, pulsePod, routePacket, topPacket, makeInit, clearHighlights, clearWires, setWire, lightBoxAt, at, OPACITY, diagramRoot } from './cluster-kit.js';
// Design notes for this card: ./CARDS.md#cluster-graceful-node-shutdown

// Laid out on the L. Panel x<=397 y<=230 against a ladder and chip column starting at 250, so 20
// units of headroom: NO NARRATION MAY PASS 323 CHARACTERS, which is what the signal step spends.
const M = 60;
const CONTENT_L = M, CONTENT_R = 1200 - M;               // 60 / 1140
const CX = (CONTENT_L + CONTENT_R) / 2;                  // 600, the canvas centre by construction

// Top row, right of the panel. The spine is on CX so the lane below is a straight drop, running the
// 540..620 corridor between ladder and chips so it crosses nothing.
const BOX_W = 232, BOX_H = 80;
const TOP_Y = 40, TOP_BOTTOM = TOP_Y + BOX_H;            // 40 / 120
const SPINE_X = CX;                                      // 600
const KUBE_X = SPINE_X - BOX_W / 2;                      // 484..716
const SYS_GAP = 56;
const SYS_X = KUBE_X + BOX_W + SYS_GAP;                  // 772..1004
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

// node() draws its own label at NODE_Y + 18, so the Pod row needs the family's 34 of top padding or
// NODE-1 prints on the first Pod. 34 + 106 + 12 is the family 152.
const NODE_H = 152, NODE_BOTTOM = 624, NODE_Y = NODE_BOTTOM - NODE_H;   // 472..624
const NODE_X = CONTENT_L, NODE_W = CONTENT_R - CONTENT_L;// 60..1140
const POD_W = 300, POD_H = 106;
const POD_Y = NODE_Y + 34;                               // 506..612
const POD_INNER = { dx: 30, w: POD_W - 60, dy: 28, h: 52 };
const POD_PAD = 24;
const POD_SPAN = NODE_W - POD_PAD * 2;                   // 1032
const POD_XS = [0, 1, 2].map(i => NODE_X + POD_PAD + i * ((POD_SPAN - POD_W) / 2));  // 84 / 450 / 816

// ONE lane, addressed to the Node rather than a Pod inside it. Both SIGTERM phases ride it, and
// WHICH Pods each reaches is carried by the pulses, not by a fan of taps.
const SIG_LANE = [[SPINE_X, TOP_BOTTOM], [SPINE_X, NODE_Y]];


class Scene {
  constructor(host) { this.host = host; this.refs = {}; this.build(); }

  build() {
    this.host.replaceChildren();
    this.refs = {};
    const root = diagramRoot({ 'aria-label': 'Graceful Node shutdown: systemd inhibitor lock, priority-ordered Pod termination' });
    root.appendChild(arrowDefs());

    const kubelet = box({ x: KUBE_X, y: TOP_Y, w: BOX_W, h: BOX_H, label: 'Kubelet', sublabel: 'shutdown manager', role: 'cluster' });
    const systemd = box({ x: SYS_X,  y: TOP_Y, w: BOX_W, h: BOX_H, label: 'systemd', sublabel: 'inhibitor lock',   role: 'cluster' });

    root.appendChild(arrow({ x1: SYS_X, y1: SIG_Y, x2: KUBE_X + BOX_W, y2: SIG_Y, dim: true, dashed: true, role: 'cluster' }));
    root.appendChild(arrow({ x1: KUBE_X + BOX_W, y1: REL_Y, x2: SYS_X, y2: REL_Y, dim: true, dashed: true, role: 'cluster' }));

    // Wire label centred in the gap below the top row, populated per step. It renders at 11px from
    // `.scheme-label.code`: do not add a `font-size` attribute and do not size a gap against one.
    const wireSig = text({ class: 'scheme-label code dim', x: WIRE_X, y: WIRE_Y, 'text-anchor': 'middle' }, [' ']);
    root.appendChild(wireSig);

    const lockChip     = valChip({ x: CHIP_X, y: CHIP_Y(0), w: CHIP_W, h: CHIP_H, name: 'inhibitor lock',                   value: 'held by Kubelet', role: 'cluster' });
    const gpChip       = valChip({ x: CHIP_X, y: CHIP_Y(1), w: CHIP_W, h: CHIP_H, name: 'shutdownGracePeriod',              value: '60s', role: 'cluster' });
    const gpCritChip   = valChip({ x: CHIP_X, y: CHIP_Y(2), w: CHIP_W, h: CHIP_H, name: 'shutdownGracePeriodCriticalPods', value: '20s', role: 'cluster' });
    const phaseChip    = valChip({ x: CHIP_X, y: CHIP_Y(3), w: CHIP_W, h: CHIP_H, name: 'phase',                            value: 'normal', role: 'cluster' });
    [lockChip, gpChip, gpCritChip, phaseChip].forEach(c => root.appendChild(c));

    const chain = chainList({
      x: LADDER_X, y: LADDER_Y, w: LADDER_W, rowH: ROW_H, gap: ROW_GAP,
      items: [
        // The separator column is set by the longest stage name, so every row pads to that width
        // and the dots line up at index 13, the same column the sibling eviction ladder uses.
        '1. signal    ·  systemd PrepareForShutdown over D-Bus',
        '2. condition ·  set NotReady, bucket by priority',
        '3. normal    ·  SIGTERM non-critical, await up to 40s',
        '4. critical  ·  SIGTERM critical, await up to 20s',
        '5. release   ·  drop lock, OS proceeds with shutdown',
      ],
      role: 'cluster',
    });

    const nodeEl = node({ x: NODE_X, y: NODE_Y, w: NODE_W, h: NODE_H, label: 'Node-1' });

    const POD_SUBS = ['priority: 0', 'priority: 0', 'priority: 2e9'];
    const podBoxes = [];
    const podWrappers = POD_XS.map((px, i) => {
      const shell = podShell({ x: px, y: POD_Y, w: POD_W, h: POD_H, label: 'Pod', sublabel: '', containers: 0, role: 'workloads' });
      shell.style.setProperty('--workloads-color', '#c0b0ff');

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

    const sigLane = pathArrow({ points: SIG_LANE, dim: true, dashed: true, role: 'cluster' });
    root.appendChild(sigLane);

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
      systemd, kubelet, chain, nodeEl,
      lockChip, gpChip, gpCritChip, phaseChip,
      pod1, pod2, pod3, pod1Box, pod2Box, pod3Box,
      packetLayer,
      wires: { sig: wireSig },
    };
  }

  reset() { this.build(); }
}

function setChips(s, { lock, gp, gpCrit, phase }) {
  setVal(s.refs.lockChip, lock);
  setVal(s.refs.gpChip, gp);
  setVal(s.refs.gpCritChip, gpCrit);
  setVal(s.refs.phaseChip, phase);
}

function resetStep(s) {
  s.refs.packetLayer.replaceChildren();
  clearHighlights(s,
    ['systemd','kubelet','lockChip','gpChip','gpCritChip','phaseChip'],
    [s.refs.pod1, s.refs.pod2, s.refs.pod3]);
  clearWires(s);
}

// The lane ends on the Node frame, which is on screen for the whole card, so it is never pinned to a
// Pod: nothing it points at can go away under it. This helper is now only about the Pods.
function setPods(s, ...vals) {
  vals.forEach((v, i) => { s.refs['pod' + (i + 1)].style.opacity = String(v); });
}

// 1200 against a 900ms pulse keeps the Pod on screen while it blinks instead of vanishing mid-blink.
// Settles on OPACITY.terminated, not 0, or it leaves a block-sized hole in the Node frame.
const POD_FADE = 1200;
function fadeOut(s, ctx, key, delay) {
  ctx.register(s.refs[key].animate(
    [{ opacity: 1 }, { opacity: OPACITY.terminated }], { duration: POD_FADE, delay, fill: 'both', easing: 'ease-in' }));
}


const STEPS = [
  {
    id: 'idle',
    duration: 1500,
    enter(s) {
      resetStep(s);
      setPods(s, 1, 1, 1);
      setChips(s, { lock: 'held by Kubelet', gp: '60s', gpCrit: '20s', phase: 'normal' });
      // Idle baseline: nothing is happening yet, no chain row highlighted.
      setChainActive(s.refs.chain, -1);
    },
  },
  {
    id: 'signal',
    duration: 2000,
    narration: 'The Node is about to shut down (poweroff, reboot, or hibernate), and systemd emits PrepareForShutdown over D-Bus. Kubelet catches the signal via its logind subscription. Its delay-type inhibitor lock makes systemd pause the actual shutdown, so Kubelet can enter shutdown mode rather than let the OS kill processes outright.',
    enter(s, ctx) {
      resetStep(s);
      setPods(s, 1, 1, 1);
      setChips(s, { lock: 'held by Kubelet', gp: '60s', gpCrit: '20s', phase: 'normal' });
      setWire(s, 'sig', 'PrepareForShutdown · D-Bus');
      s.refs.systemd.classList.add('highlight');
      s.refs.phaseChip.classList.add('highlight');
      setChainActive(s.refs.chain, 0);
      if (ctx.reduced) { s.refs.kubelet.classList.add('highlight'); return; }
      // The Kubelet has not received anything until the signal lands, so the phase waits for it.
      const pkt = topPacket(s, ctx, { from: SYS_X, to: KUBE_X + BOX_W, y: SIG_Y, role: 'cluster' });
      lightBoxAt(s.refs.kubelet, ctx, pkt.arrivalMs);
      at(s, ctx, pkt.arrivalMs, () => setVal(s.refs.phaseChip, 'shutdown signal received'));
    },
  },
  {
    id: 'condition',
    duration: 1900,
    narration: 'Kubelet sets a NotReady condition on the Node with the reason node is shutting down, which is what stops the Scheduler placing anything here, and its admission handler rejects Pods that were already bound. Existing Pods are bucketed by priority: at or above 2,000,000,000 is the critical bucket, the rest are non-critical.',
    enter(s) {
      resetStep(s);
      setPods(s, 1, 1, 1);
      setChips(s, { lock: 'held by Kubelet', gp: '60s', gpCrit: '20s', phase: 'NotReady · bucketing pods' });
      s.refs.kubelet.classList.add('highlight');
      s.refs.phaseChip.classList.add('highlight');
      setChainActive(s.refs.chain, 1);
      // Kubelet flips admission state internally: nothing travels and no block
      // flashes, the phase value change carries the step.
    },
  },
  {
    id: 'terminate-normal',
    duration: 2400,
    narration: 'Kubelet sends SIGTERM to every non-critical Pod in parallel. They get shutdownGracePeriod minus shutdownGracePeriodCriticalPods to finish (40s with this configuration). Each ends up with the status reason Terminated.',
    enter(s, ctx) {
      resetStep(s);
      setChips(s, { lock: 'held by Kubelet', gp: '60s', gpCrit: '20s', phase: 'NotReady · bucketing pods' });
      s.refs.kubelet.classList.add('highlight');
      s.refs.phaseChip.classList.add('highlight');
      s.refs.gpChip.classList.add('highlight');
      // Pin final state so cancel between steps does not flash to default. The two non-critical Pods
      // stay on screen as ghosts at the terminated shade, the critical Pod survives at full.
      setPods(s, OPACITY.terminated, OPACITY.terminated, 1);
      setChainActive(s.refs.chain, 2);
      if (ctx.reduced) return;
      // ONE SIGTERM down the one lane, and BOTH non-critical Pods react to it on arrival, which is
      // what the narration means by in parallel. The phase waits for the signal to land too.
      const sig = routePacket(s, ctx, SIG_LANE, { role: 'cluster' });
      at(s, ctx, sig.arrivalMs, () => setVal(s.refs.phaseChip, 'terminating non-critical · 40s'));
      pulsePod(s.refs.pod1, ctx, sig.arrivalMs);
      pulsePod(s.refs.pod2, ctx, sig.arrivalMs);
      fadeOut(s, ctx, 'pod1', sig.arrivalMs);
      fadeOut(s, ctx, 'pod2', sig.arrivalMs);
    },
  },
  {
    id: 'terminate-critical',
    duration: 2400,
    narration: 'After non-critical Pods are gone (or their grace expired), Kubelet sends SIGTERM to system-critical Pods. They get shutdownGracePeriodCriticalPods (20s here). DaemonSet infra workloads such as CNI or kube-proxy usually sit in this bucket.',
    enter(s, ctx) {
      resetStep(s);
      setChips(s, { lock: 'held by Kubelet', gp: '60s', gpCrit: '20s', phase: 'terminating non-critical · 40s' });
      s.refs.kubelet.classList.add('highlight');
      s.refs.phaseChip.classList.add('highlight');
      s.refs.gpCritChip.classList.add('highlight');
      // Pin final state. Nothing is left running in the Node frame, and all three Pods hold the
      // terminated shade rather than leaving three block-sized holes in the Pod row.
      setPods(s, OPACITY.terminated, OPACITY.terminated, OPACITY.terminated);
      setChainActive(s.refs.chain, 3);
      if (ctx.reduced) return;
      const sig = routePacket(s, ctx, SIG_LANE, { role: 'cluster' });
      at(s, ctx, sig.arrivalMs, () => setVal(s.refs.phaseChip, 'terminating critical · 20s'));
      // SIGTERM reaches the critical Pod: it flinches (pulse) then terminates (fade).
      pulsePod(s.refs.pod3, ctx, sig.arrivalMs);
      fadeOut(s, ctx, 'pod3', sig.arrivalMs);
    },
  },
  {
    id: 'release',
    duration: 2200,
    narration: 'All Pods are gone or their grace expired. Kubelet releases the inhibitor lock, and systemd resumes the shutdown sequence. The Node has carried NotReady since the Kubelet set that condition, and once Lease renewals in kube-node-lease stop the control plane treats it as unreachable as well.',
    enter(s, ctx) {
      resetStep(s);
      setChips(s, { lock: 'held by Kubelet', gp: '60s', gpCrit: '20s', phase: 'terminating critical · 20s' });
      setWire(s, 'sig', 'release lock');
      s.refs.kubelet.classList.add('highlight');
      s.refs.lockChip.classList.add('highlight');
      s.refs.phaseChip.classList.add('highlight');
      // Pin final state. All three Pods stay on screen at the terminated shade.
      setPods(s, OPACITY.terminated, OPACITY.terminated, OPACITY.terminated);
      setChainActive(s.refs.chain, 4);
      if (ctx.reduced) { s.refs.systemd.classList.add('highlight'); return; }
      // systemd is not free to proceed until the release actually reaches it, so both chips wait.
      const pkt = topPacket(s, ctx, { from: KUBE_X + BOX_W, to: SYS_X, y: REL_Y, role: 'cluster' });
      lightBoxAt(s.refs.systemd, ctx, pkt.arrivalMs);
      at(s, ctx, pkt.arrivalMs, () => {
        setVal(s.refs.lockChip, 'released');
        setVal(s.refs.phaseChip, 'lock released · OS shutdown');
      });
    },
  },
];

export const init = makeInit(Scene, STEPS, { posterFirst: true });
