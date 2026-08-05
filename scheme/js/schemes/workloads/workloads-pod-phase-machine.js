import { svg, g, rect, text } from '../../lib/svg.js';
import { arrowDefs, pod, node, box, chainList, setChainActive, pathArrow } from '../../lib/primitives.js';
import { valChip, setVal, setBoxSublabel, pulsePod, routePacket, makeInit, clearHighlights, clearWires, setWire, OPACITY, WL } from '../../lib/workloads-kit.js';

// Layout C, and the tightest card in the catalog. It carries the longest narration (the terminal
// step covers Succeeded, Failed, the Unknown deprecation and the DisruptionTarget path) and the
// panel measures 397 x 504 at the narrowest viewport, more than three quarters of the canvas
// height on the left. So the actor row, the pipeline and the chip column all live right of
// PANEL_R, and only the status.phase chip and the Node frame fit in the 136 unit band below
// PANEL_B, which is why the Pod is shorter here than the family default.
// A longer narration on any step invalidates PANEL_B: re-measure.
// Design notes for this card: scheme/docs/CARDS.md#workloads-pod-phase-machine
const PANEL_R = 420, PANEL_B = 504;

const TOP_W = 280, TOP_X = PANEL_R;                      // 420..700

const CHIPCOL_X = 740, CHIPCOL_W = WL.R - CHIPCOL_X;     // 400, 740..1140
const CHIPCOL_Y = i => WL.TOP_Y + i * (WL.CHIP_H + 10);  // 40 / 84 / 128

const LAD_X = WL.CHIP_X, LAD_W = WL.CHIP_W;              // 660..1140, the pipeline
const LAD_Y = 236;                                       // 6 rows -> 236..478

// status.phase takes the left column of the band below the panel, so the chip strip still
// straddles CX and the lane down to the Pod has a clear corridor at x = SPINE_X.
const STRIP_X = WL.LADDER_X, STRIP_W = WL.LADDER_W;      // 60..540
const STRIP_Y = 506;

const NODE_Y = 546, NODE_H = 78;                         // 546..624
const POD_W = 460, POD_X = WL.CX - POD_W / 2;            // 370..830
const POD_Y = 552, POD_H = 64;                           // 552..616
const CONT_W = 300, CONT_X = WL.CX - CONT_W / 2;         // 450..750
const CONT_Y = 574, CONT_H = 36;                         // 574..610

// The sync lane runs down the corridor between the status.phase chip and the pipeline, and ends
// on the Pod it addresses rather than on the Node frame edge above it.
const SPINE_X = TOP_X + TOP_W / 2;                       // 560
const SPINE = [[SPINE_X, WL.TOP_BOTTOM], [SPINE_X, POD_Y]];


class Scene {
  constructor(host) { this.host = host; this.refs = {}; this.build(); }

  build() {
    this.host.replaceChildren();
    this.refs = {};
    const root = svg({
      class: 'diagram',
      viewBox: '0 0 1200 640',
      preserveAspectRatio: 'xMidYMid meet',
      'aria-label': 'Pod lifecycle phases: Kubelet reconciles status.phase through Pending, Running and a terminal Succeeded or Failed, with CrashLoopBackOff sitting inside Running as a container waiting reason',
      'data-style': 'outline',
    });
    root.appendChild(arrowDefs());

    const kubelet = box({ x: TOP_X, y: WL.TOP_Y, w: TOP_W, h: WL.BOX_H, label: 'Kubelet', sublabel: 'reconciles status.phase', role: 'cluster' });

    // Kubelet -> the Pod on Node-1, straight down the corridor. Appended below with the Node
    // frame, whose fill would otherwise hide its last leg.
    const connector = pathArrow({
      points: SPINE,
      dim: true, dashed: true, role: 'cluster',
    });

    // Wire label sits ABOVE the Kubelet box: below it the spine runs through the same point and
    // would split the string in two.
    const wireReq = text({ class: 'scheme-label code dim', x: SPINE_X, y: WL.TOP_Y - 12, 'text-anchor': 'middle' }, [' ']);
    root.appendChild(wireReq);

    const chain = chainList({
      x: LAD_X, y: LAD_Y, w: LAD_W, rowH: WL.ROW_H, gap: WL.ROW_GAP,
      items: [
        '1. admit     ·  stored in etcd, no node yet',
        '2. schedule  ·  bound to node, sandbox + image pull',
        '3. start     ·  at least one container started',
        '4. crashloop ·  exit + backoff, waiting reason inside Running',
        '5. recover   ·  restart succeeds, container Running again',
        '6. terminal  ·  all containers exit, Succeeded or Failed',
      ],
      role: 'cluster',
    });

    const phaseChip   = valChip({ x: STRIP_X, y: STRIP_Y, w: STRIP_W, h: WL.CHIP_H, name: 'status.phase',     value: 'Pending', role: 'workloads' });
    const cStateChip  = valChip({ x: CHIPCOL_X, y: CHIPCOL_Y(0), w: CHIPCOL_W, h: WL.CHIP_H, name: 'container state',  value: 'none', role: 'workloads' });
    const restartChip = valChip({ x: CHIPCOL_X, y: CHIPCOL_Y(1), w: CHIPCOL_W, h: WL.CHIP_H, name: 'restartCount',     value: '0', role: 'workloads' });
    const policyChip  = valChip({ x: CHIPCOL_X, y: CHIPCOL_Y(2), w: CHIPCOL_W, h: WL.CHIP_H, name: 'restartPolicy',    value: 'OnFailure', role: 'workloads' });
    [phaseChip, cStateChip, restartChip, policyChip].forEach(c => root.appendChild(c));

    const nodeEl = node({ x: WL.L, y: NODE_Y, w: WL.W, h: NODE_H, label: 'Node-1' });

    const podShell = pod({ x: POD_X, y: POD_Y, w: POD_W, h: POD_H, label: 'Pod', sublabel: '', containers: 0, role: 'workloads' });
    const podShellRect = podShell.querySelector('.scheme-pod-rect');
    if (podShellRect) podShellRect.style.fill = 'rgba(255, 255, 255, 0.03)';

    const containerBox = box({ x: CONT_X, y: CONT_Y, w: CONT_W, h: CONT_H, label: 'app', sublabel: 'no container yet', role: 'workloads' });

    // Wrap shell + container in a group so opacity animates uniformly.
    const podGroup = g({ id: 'podGroup' });
    podGroup.appendChild(podShell);
    podGroup.appendChild(containerBox);
    podGroup.style.opacity = String(OPACITY.pending);

    const packetLayer = g({ id: 'packetLayer' });

    // Z-order: the Node frame is a 70% opaque fill, so the lane leg that runs inside it and the
    // ball that rides it are appended after it. Ladder, Pod and Kubelet sit above the packets.
    root.appendChild(nodeEl);
    root.appendChild(connector);
    root.appendChild(packetLayer);
    root.appendChild(chain);
    root.appendChild(podGroup);
    root.appendChild(kubelet);

    this.host.appendChild(root);
    this.refs = {
      svg: root,
      kubelet, chain, nodeEl, podGroup, podShell, containerBox, connector,
      phaseChip, cStateChip, restartChip, policyChip,
      packetLayer,
      wires: { req: wireReq },
    };
  }

  reset() { this.build(); }
}

function clearHL(s) {
  clearHighlights(s,
    ['kubelet','phaseChip','cStateChip','restartChip','policyChip','podShell','containerBox'],
    [s.refs.podGroup]);
}
function setChips(s, { phase, cstate, restart, policy = 'OnFailure' }) {
  setVal(s.refs.phaseChip, phase);
  setVal(s.refs.cStateChip, cstate);
  setVal(s.refs.restartChip, restart);
  setVal(s.refs.policyChip, policy);
}

function syncPacket(s, ctx, { delay = 0 } = {}) {
  return routePacket(s, ctx, SPINE, { delay, fadeIn: true, role: 'workloads' });
}

const PHASE_FADE_MS = 700, PHASE_FADE_DELAY = 400;

const STEPS = [
  {
    id: 'admit',
    duration: 1500,
    enter(s) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setChips(s, { phase: 'Pending', cstate: 'none', restart: '0' });
      setBoxSublabel(s.refs.containerBox, 'no container yet');
      setWire(s, 'req', 'spec.nodeName not set · Waiting for scheduler');
      s.refs.podGroup.style.opacity = String(OPACITY.pending);
      setChainActive(s.refs.chain, 0);
    },
  },
  {
    id: 'schedule',
    duration: 2000,
    narration: 'The scheduler has bound the Pod to Node-1, so spec.nodeName is set and Kubelet picks the Pod up via its watch. Kubelet pulls images, creates the Pod sandbox and the container is in Waiting with reason ContainerCreating. The status.phase field is still Pending until at least one container has started.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setChips(s, { phase: 'Pending', cstate: 'Waiting · ContainerCreating', restart: '0' });
      setBoxSublabel(s.refs.containerBox, 'Waiting · ContainerCreating');
      setWire(s, 'req', 'spec.nodeName=Node-1 · SyncPod · Image pull + sandbox');
      s.refs.kubelet.classList.add('highlight');
      s.refs.phaseChip.classList.add('highlight');
      s.refs.cStateChip.classList.add('highlight');
      s.refs.podGroup.style.opacity = String(OPACITY.pending);
      setChainActive(s.refs.chain, 1);
      if (ctx.reduced) return;
      syncPacket(s, ctx);
    },
  },
  {
    id: 'running',
    duration: 2300,
    narration: 'Every container has been created and at least one has started, so status.phase becomes Running. Each container reports a Running state, and the Pod does its work until its containers exit. The Running phase covers the entire working life of the Pod.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setChips(s, { phase: 'Running', cstate: 'Running', restart: '0' });
      setBoxSublabel(s.refs.containerBox, 'Running · serving');
      setWire(s, 'req', 'StartContainer OK · Phase Pending → Running');
      s.refs.kubelet.classList.add('highlight');
      s.refs.phaseChip.classList.add('highlight');
      s.refs.cStateChip.classList.add('highlight');
      s.refs.podGroup.style.opacity = '1';
      setChainActive(s.refs.chain, 2);
      if (ctx.reduced) return;
      const sync = syncPacket(s, ctx);
      ctx.register(s.refs.podGroup.animate([{ opacity: OPACITY.pending }, { opacity: OPACITY.running }], { duration: PHASE_FADE_MS, delay: PHASE_FADE_DELAY, fill: 'both', easing: 'ease-out' }));
      pulsePod(s.refs.podGroup, ctx, sync.arrivalMs);
    },
  },
  {
    id: 'crashloop',
    duration: 2400,
    narration: 'The container exits with a non-zero code. With restartPolicy OnFailure Kubelet restarts it inside the same sandbox, but repeated fast failures trigger an exponential backoff: the delay starts at 10s and doubles on each subsequent restart (10s, 20s, 40s, 80s, 160s, capped at 300s). The container sits in Waiting with reason=CrashLoopBackOff while the timer ticks. The status.phase field stays Running the whole time, because CrashLoopBackOff is a container-level waiting reason, never a phase of its own.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setChips(s, { phase: 'Running', cstate: 'Waiting · CrashLoopBackOff', restart: '4' });
      setBoxSublabel(s.refs.containerBox, 'CrashLoopBackOff');
      setWire(s, 'req', 'exit != 0 · CrashLoopBackOff · Phase stays Running');
      s.refs.kubelet.classList.add('highlight');
      s.refs.cStateChip.classList.add('highlight');
      s.refs.restartChip.classList.add('highlight');
      s.refs.podGroup.style.opacity = String(OPACITY.notready);
      setChainActive(s.refs.chain, 3);
      if (ctx.reduced) return;
      syncPacket(s, ctx);
      ctx.register(s.refs.podGroup.animate([{ opacity: OPACITY.running }, { opacity: OPACITY.notready }], { duration: PHASE_FADE_MS, fill: 'both', easing: 'ease-in' }));
    },
  },
  {
    id: 'recover',
    duration: 2300,
    narration: 'The backoff timer elapses and Kubelet retries the container. This time it starts cleanly and runs to its next reconcile, so the container state returns to Running and restartCount records how many times the container was restarted. The status.phase field was Running through the whole episode, only the container-level state moved.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setChips(s, { phase: 'Running', cstate: 'Running', restart: '5' });
      setBoxSublabel(s.refs.containerBox, 'Running · restarted');
      setWire(s, 'req', 'backoff elapsed · StartContainer · restartCount++');
      s.refs.kubelet.classList.add('highlight');
      s.refs.cStateChip.classList.add('highlight');
      s.refs.restartChip.classList.add('highlight');
      s.refs.podGroup.style.opacity = '1';
      setChainActive(s.refs.chain, 4);
      if (ctx.reduced) return;
      const sync = syncPacket(s, ctx);
      ctx.register(s.refs.podGroup.animate([{ opacity: OPACITY.notready }, { opacity: OPACITY.running }], { duration: PHASE_FADE_MS, delay: PHASE_FADE_DELAY, fill: 'both', easing: 'ease-out' }));
      pulsePod(s.refs.podGroup, ctx, sync.arrivalMs);
    },
  },
  {
    id: 'terminal',
    duration: 2400,
    narration: 'The container finally exits 0. restartPolicy OnFailure does not restart a success, so every container is Terminated and status.phase becomes Succeeded, a terminal state common for Jobs. Under restartPolicy=Never a non-zero exit is not restarted either and ends at Failed instead. Both are terminal, the Pod will not run again. If the Node hosting the Pod becomes unreachable, the node controller sets the Node Ready condition to Unknown and evicts its Pods, and the Pods sit in Terminating until the Node returns or the Node object is deleted, at which point Pod garbage collection marks them Failed with a DisruptionTarget condition. The Unknown phase is not part of that path, it was deprecated in 1.22 and nothing has set it since 2015.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setChips(s, { phase: 'Succeeded', cstate: 'Terminated · Completed · exit 0', restart: '5' });
      setBoxSublabel(s.refs.containerBox, 'Terminated · Completed');
      setWire(s, 'req', 'exit 0 · Phase Running → Succeeded · Terminal');
      s.refs.kubelet.classList.add('highlight');
      s.refs.phaseChip.classList.add('highlight');
      s.refs.cStateChip.classList.add('highlight');
      s.refs.podGroup.style.opacity = String(OPACITY.terminated);
      setChainActive(s.refs.chain, 5);
      if (ctx.reduced) return;
      syncPacket(s, ctx);
      ctx.register(s.refs.podGroup.animate([{ opacity: OPACITY.running }, { opacity: OPACITY.terminated }], { duration: PHASE_FADE_MS, delay: PHASE_FADE_DELAY, fill: 'both', easing: 'ease-in' }));
    },
  },
];

export const init = makeInit(Scene, STEPS, { posterFirst: true });
