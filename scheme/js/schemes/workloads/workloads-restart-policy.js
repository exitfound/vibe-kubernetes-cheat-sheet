import { svg, g, rect, text } from '../../lib/svg.js';
import { arrowDefs, box, pod, node, chainList, setChainActive, arrow } from '../../lib/primitives.js';
import { valChip, setVal, pulsePod, topPacket, makeInit, clearHighlights, clearWires, setWire, relationPath, lightBoxAt, FADE, BEAT, OPACITY, WL } from '../../lib/workloads-kit.js';

// Layout C on the Workloads canon (WL in the kit): the panel reaches y<=355 (worst of
// 1600/1440/1280/1100, x<=397), which leaves no column under it, so the pipeline keeps the right
// band and the chips form a two-across bottom strip.
// Design notes for this card: scheme/docs/CARDS.md#workloads-restart-policy
const PANEL_B = 355;

// Kubelet is the node-facing actor, so it leads the row and is centred on CX: the line down to
// the Node leaves its bottom midpoint and clears the pipeline column.
const TOP1_X = 420, TOP1_W = 2 * (WL.CX - 420);          // 420..780, centred on CX
const TOP_GAP = 60;
const TOP2_X = TOP1_X + TOP1_W + TOP_GAP, TOP2_W = WL.R - (TOP1_X + TOP1_W + TOP_GAP);
const TOP_CY = WL.TOP_Y + WL.BOX_H / 2;
const REQ_Y = TOP_CY - WL.LANE_DY, RESP_Y = TOP_CY + WL.LANE_DY;
const WIRE_X = (TOP1_X + TOP1_W + TOP2_X) / 2;

const LAD_X = WL.CHIP_X, LAD_W = WL.CHIP_W;              // 660..1140, the pipeline
const LAD_Y = 150;                                       // 5 rows -> 150..350

// Chips two across, 532 wide: four across was 258 and every name ran into its own value.
const CHIP_COLS = 2, CHIP_GAP = 16, CHIP_VGAP = 8;
const CHIP_W = (WL.W - CHIP_GAP * (CHIP_COLS - 1)) / CHIP_COLS;
const CHIPS_Y = 548;                                     // 2 rows -> 548..582 / 590..624
const CHIP_X = i => WL.L + (i % CHIP_COLS) * (CHIP_W + CHIP_GAP);
const CHIP_Y = i => CHIPS_Y + Math.floor(i / CHIP_COLS) * (WL.CHIP_H + CHIP_VGAP);

const NODE_Y = 392, NODE_H = 140;                        // 392..532, clear of the panel
const POD_W = 300, POD_H = 94, POD_Y = NODE_Y + 34;      // 426..520
const POD_PAD = 24;
const POD_INNER = { dx: 30, w: POD_W - 60, dy: 26, h: 50 };
const POD_XS = [0, 1, 2].map(i => WL.L + POD_PAD + i * ((WL.W - POD_PAD * 2 - POD_W) / 2));

// Nothing ever travels down to the Node on this card: restartPolicy is enforced in place and
// every packet is a top-row hop. The line to the Node is therefore a relationship, so it lands
// on the frame midpoint and carries no arrowhead.
const OWNERSHIP = [[WL.CX, WL.TOP_BOTTOM], [WL.CX, NODE_Y]];


class Scene {
  constructor(host) { this.host = host; this.refs = {}; this.build(); }

  build() {
    this.host.replaceChildren();
    this.refs = {};
    const root = svg({
      class: 'diagram',
      viewBox: '0 0 1200 640',
      preserveAspectRatio: 'xMidYMid meet',
      'aria-label': 'Pod restartPolicy: Always, OnFailure and Never decide whether Kubelet restarts a container after it exits',
      'data-style': 'outline',
    });
    root.appendChild(arrowDefs());

    const kubelet   = box({ x: TOP1_X, y: WL.TOP_Y, w: TOP1_W, h: WL.BOX_H, label: 'Kubelet',   sublabel: 'restart enforcer',        role: 'cluster' });
    const apiserver = box({ x: TOP2_X, y: WL.TOP_Y, w: TOP2_W, h: WL.BOX_H, label: 'API', sublabel: 'stores spec.restartPolicy', role: 'cluster' });

    root.appendChild(arrow({ x1: TOP1_X + TOP1_W, y1: REQ_Y, x2: TOP2_X, y2: REQ_Y, dim: true, dashed: true, role: 'cluster' }));
    root.appendChild(arrow({ x1: TOP2_X, y1: RESP_Y, x2: TOP1_X + TOP1_W, y2: RESP_Y, dim: true, dashed: true, role: 'cluster' }));

    const wireReq = text({ class: 'scheme-label code dim', x: WIRE_X, y: WL.TOP_Y - 12, 'text-anchor': 'middle' }, [' ']);
    root.appendChild(wireReq);

    // State chips in the bottom strip: one per Pod plus a focus line.
    const pod1Chip  = valChip({ x: CHIP_X(0), y: CHIP_Y(0), w: CHIP_W, h: WL.CHIP_H, name: 'Pod A · Always',    value: 'Running', role: 'workloads' });
    const pod2Chip  = valChip({ x: CHIP_X(1), y: CHIP_Y(1), w: CHIP_W, h: WL.CHIP_H, name: 'Pod B · OnFailure', value: 'Running', role: 'workloads' });
    const pod3Chip  = valChip({ x: CHIP_X(2), y: CHIP_Y(2), w: CHIP_W, h: WL.CHIP_H, name: 'Pod C · Never',     value: 'Running', role: 'workloads' });
    const focusChip = valChip({ x: CHIP_X(3), y: CHIP_Y(3), w: CHIP_W, h: WL.CHIP_H, name: 'focus',             value: 'none', role: 'workloads' });
    [pod1Chip, pod2Chip, pod3Chip, focusChip].forEach(c => root.appendChild(c));

    const chain = chainList({
      x: LAD_X, y: LAD_Y, w: LAD_W, rowH: WL.ROW_H, gap: WL.ROW_GAP,
      items: [
        '1. policy    ·  Pod-level, all containers, default Always',
        '2. exit 0    ·  Always restarts, OnFailure and Never do not',
        '3. exit != 0 ·  Always and OnFailure restart, Never does not',
        '4. backoff   ·  Always and OnFailure share the restart backoff',
        '5. fit       ·  Always for services, OnFailure / Never for Jobs',
      ],
      role: 'cluster',
    });

    const nodeEl = node({ x: WL.L, y: NODE_Y, w: WL.W, h: NODE_H, label: 'Node-1' });

    const POD_NAMES = ['Pod A', 'Pod B', 'Pod C'];
    const POD_SUBS  = ['restartPolicy: Always', 'restartPolicy: OnFailure', 'restartPolicy: Never'];
    const podBoxes = [];
    const podWrappers = POD_XS.map((px, i) => {
      const shell = pod({ x: px, y: POD_Y, w: POD_W, h: POD_H, label: POD_NAMES[i], sublabel: '', containers: 0, role: 'workloads' });
      const shellRect = shell.querySelector('.scheme-pod-rect');
      if (shellRect) shellRect.style.fill = 'rgba(255, 255, 255, 0.03)';

      const innerBox = box({ x: px + POD_INNER.dx, y: POD_Y + POD_INNER.dy, w: POD_INNER.w, h: POD_INNER.h, label: 'app', sublabel: POD_SUBS[i], role: 'workloads' });

      const wrap = g({ id: `pod${i + 1}` });
      wrap.appendChild(shell);
      wrap.appendChild(innerBox);
      podBoxes.push(innerBox);
      return wrap;
    });
    const [pod1, pod2, pod3] = podWrappers;
    const [pod1Box, pod2Box, pod3Box] = podBoxes;

    const ownership = relationPath({ points: OWNERSHIP, role: 'cluster', dash: '5 5' });

    const packetLayer = g({ id: 'packetLayer' });

    // Z-order: Node frame, then the ownership line, then packets, then ladder, Pods, actor row.
    root.appendChild(nodeEl);
    root.appendChild(ownership);
    root.appendChild(packetLayer);
    root.appendChild(chain);
    [pod1, pod2, pod3].forEach(p => root.appendChild(p));
    root.appendChild(kubelet);
    root.appendChild(apiserver);

    this.host.appendChild(root);
    this.refs = {
      svg: root,
      apiserver, kubelet, chain, nodeEl, ownership,
      pod1Chip, pod2Chip, pod3Chip, focusChip,
      pod1, pod2, pod3, pod1Box, pod2Box, pod3Box,
      packetLayer,
      wires: { req: wireReq },
    };
  }

  reset() { this.build(); }
}

function clearHL(s) {
  clearHighlights(s,
    ['apiserver','kubelet','pod1Chip','pod2Chip','pod3Chip','focusChip','pod1Box','pod2Box','pod3Box'],
    [s.refs.pod1, s.refs.pod2, s.refs.pod3]);
}
function resetPodOpacity(s) {
  ['pod1','pod2','pod3'].forEach(k => { s.refs[k].style.opacity = '1'; });
}
// Set all three Pod chips plus the focus line in one call.
function setChips(s, { a, b, c, focus }) {
  setVal(s.refs.pod1Chip, a);
  setVal(s.refs.pod2Chip, b);
  setVal(s.refs.pod3Chip, c);
  setVal(s.refs.focusChip, focus);
}

function bouncePacket(s, ctx, { delay = 0 } = {}) {
  // Kubelet watches the Api, then the spec hops back down the return lane once it answers. The Api
  // is the receiver of that first hop on every step that calls this, so it lights on arrival here
  // rather than at step entry, and each caller lights it statically under ctx.reduced.
  const req = topPacket(s, ctx, { from: TOP1_X + TOP1_W, to: TOP2_X, y: REQ_Y, delay, role: 'workloads' });
  lightBoxAt(s.refs.apiserver, ctx, req.arrivalMs);
  return topPacket(s, ctx, { from: TOP2_X, to: TOP1_X + TOP1_W, y: RESP_Y, delay: req.arrivalMs + BEAT.afterHop, role: 'workloads' });
}

// The container exit is an in-place event with no packet to anchor to: the Pods
// react this many ms into the step (pulse, plus a fade for the ones that stop).
const REACT_MS = 400;

const STEPS = [
  {
    id: 'idle',
    duration: 1500,
    enter(s) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      resetPodOpacity(s);
      setChips(s, { a: 'Running', b: 'Running', c: 'Running', focus: 'none' });
      setChainActive(s.refs.chain, -1);
    },
  },
  {
    id: 'policy',
    duration: 2200,
    narration: 'The restartPolicy is a Pod-level field. The Pod-level value is immutable once the Pod is created and covers every main container that does not set its own. Since 1.35 the ContainerRestartRules feature gate is beta and enabled by default, so an individual container may carry a restartPolicy that overrides the Pod one. The default is Always. Init containers may override it with their own restartPolicy (the native sidecar pattern, on by default since 1.29 and GA in 1.33). Kubelet reads the field from the Pod spec and applies it each time a container terminates.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      resetPodOpacity(s);
      setChips(s, { a: 'Running', b: 'Running', c: 'Running', focus: 'Pod-level, default Always' });
      setWire(s, 'req', 'watch · spec.restartPolicy delivered · Status reported back');
      s.refs.kubelet.classList.add('highlight');
      s.refs.focusChip.classList.add('highlight');
      setChainActive(s.refs.chain, 0);
      if (ctx.reduced) { s.refs.apiserver.classList.add('highlight'); return; }
      bouncePacket(s, ctx);
    },
  },
  {
    id: 'exit-zero',
    duration: 2400,
    narration: 'Scenario: a container exits 0, a clean success. Pod A (Always) restarts the container and stays Running. Pod B (OnFailure) does not restart a successful exit, so once the container is done the Pod phase becomes Succeeded. Pod C (Never) does not restart anything either and likewise ends Succeeded.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      resetPodOpacity(s);
      setChips(s, { a: 'Running (restarted)', b: 'Succeeded', c: 'Succeeded', focus: 'exit 0: only Always restarts' });
      s.refs.focusChip.classList.add('highlight');
      setWire(s, 'req', 'container exit 0 · Restart only if Always');
      s.refs.kubelet.classList.add('highlight');
      s.refs.pod1Chip.classList.add('highlight');
      s.refs.pod2Chip.classList.add('highlight');
      s.refs.pod3Chip.classList.add('highlight');
      // Pin final opacities: A is back to Running, B and C are terminal.
      s.refs.pod1.style.opacity = '1';
      s.refs.pod2.style.opacity = String(OPACITY.terminated);
      s.refs.pod3.style.opacity = String(OPACITY.terminated);
      setChainActive(s.refs.chain, 1);
      if (ctx.reduced) { s.refs.apiserver.classList.add('highlight'); return; }
      bouncePacket(s, ctx);
      ctx.register(s.refs.pod2.animate(
        [{ opacity: 1 }, { opacity: OPACITY.terminated }],
        { duration: FADE.out, delay: REACT_MS, fill: 'both', easing: 'ease-in' }
      ));
      ctx.register(s.refs.pod3.animate(
        [{ opacity: 1 }, { opacity: OPACITY.terminated }],
        { duration: FADE.out, delay: REACT_MS, fill: 'both', easing: 'ease-in' }
      ));
      pulsePod(s.refs.pod1, ctx, REACT_MS);
      pulsePod(s.refs.pod2, ctx, REACT_MS);
      pulsePod(s.refs.pod3, ctx, REACT_MS);
    },
  },
  {
    id: 'exit-nonzero',
    duration: 2400,
    narration: 'Scenario: a container exits with a non-zero code, a failure. Pod A (Always) restarts it. Pod B (OnFailure) restarts it too, that is exactly what OnFailure means. Pod C (Never) restarts nothing, so a single failure drives the Pod phase to Failed.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      resetPodOpacity(s);
      setChips(s, { a: 'Running (restarted)', b: 'Running (restarted)', c: 'Failed', focus: 'exit != 0: only Never does not restart' });
      s.refs.focusChip.classList.add('highlight');
      setWire(s, 'req', 'exit != 0 · Restart if Always or OnFailure');
      s.refs.kubelet.classList.add('highlight');
      s.refs.pod1Chip.classList.add('highlight');
      s.refs.pod2Chip.classList.add('highlight');
      s.refs.pod3Chip.classList.add('highlight');
      // Pin: A and B are restarted back to Running, C is terminal Failed.
      s.refs.pod1.style.opacity = '1';
      s.refs.pod2.style.opacity = '1';
      s.refs.pod3.style.opacity = String(OPACITY.terminated);
      setChainActive(s.refs.chain, 2);
      if (ctx.reduced) { s.refs.apiserver.classList.add('highlight'); return; }
      bouncePacket(s, ctx);
      ctx.register(s.refs.pod3.animate(
        [{ opacity: 1 }, { opacity: OPACITY.terminated }],
        { duration: FADE.out, delay: REACT_MS, fill: 'both', easing: 'ease-in' }
      ));
      pulsePod(s.refs.pod1, ctx, REACT_MS);
      pulsePod(s.refs.pod2, ctx, REACT_MS);
      pulsePod(s.refs.pod3, ctx, REACT_MS);
    },
  },
  {
    id: 'backoff',
    duration: 2400,
    narration: 'Every restart, whether driven by Always or by OnFailure, goes through the same exponential backoff. The delay starts at 10s and doubles on each subsequent restart (10s, 20s, 40s, 80s, 160s, capped at 300s). The container sits in Waiting with reason=CrashLoopBackOff during the wait, and the timer resets after the container has run successfully for 10 minutes. A Never Pod never restarts at all, so it cannot enter this loop.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      resetPodOpacity(s);
      setChips(s, { a: 'Waiting (backoff)', b: 'Waiting (backoff)', c: 'never enters backoff', focus: 'backoff 10s..300s, shared' });
      s.refs.pod3Chip.classList.add('highlight');
      setWire(s, 'req', 'restart backoff: 10s → 20s → ... → 300s cap');
      s.refs.kubelet.classList.add('highlight');
      s.refs.pod1Chip.classList.add('highlight');
      s.refs.pod2Chip.classList.add('highlight');
      s.refs.focusChip.classList.add('highlight');
      // Pin: A and B sit in backoff (alive, not serving), C runs normally.
      s.refs.pod1.style.opacity = String(OPACITY.notready);
      s.refs.pod2.style.opacity = String(OPACITY.notready);
      s.refs.pod3.style.opacity = '1';
      setChainActive(s.refs.chain, 3);
      if (ctx.reduced) { s.refs.apiserver.classList.add('highlight'); return; }
      bouncePacket(s, ctx);
      ctx.register(s.refs.pod1.animate(
        [{ opacity: 1 }, { opacity: OPACITY.notready }],
        { duration: FADE.out, delay: REACT_MS, fill: 'both', easing: 'ease-in' }
      ));
      ctx.register(s.refs.pod2.animate(
        [{ opacity: 1 }, { opacity: OPACITY.notready }],
        { duration: FADE.out, delay: REACT_MS, fill: 'both', easing: 'ease-in' }
      ));
      pulsePod(s.refs.pod1, ctx, REACT_MS);
      pulsePod(s.refs.pod2, ctx, REACT_MS);
      pulsePod(s.refs.pod3, ctx, REACT_MS);
    },
  },
  {
    id: 'fit',
    duration: 2200,
    narration: 'Long-running controllers (Deployment, ReplicaSet, DaemonSet, StatefulSet) only allow restartPolicy=Always, so their Pods always restart. Job uses OnFailure or Never to let its Pods reach a terminal Succeeded or Failed phase instead of looping forever.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setChips(s, { a: 'long-running services', b: 'Job (OnFailure)', c: 'Job (Never)', focus: 'long-running vs run-to-completion' });
      s.refs.focusChip.classList.add('highlight');
      setWire(s, 'req', 'Always: long-running · OnFailure / Never: Jobs');
      s.refs.pod1Chip.classList.add('highlight');
      s.refs.pod2Chip.classList.add('highlight');
      s.refs.pod3Chip.classList.add('highlight');
      s.refs.pod1.style.opacity = '1';
      s.refs.pod2.style.opacity = String(OPACITY.notready);
      s.refs.pod3.style.opacity = String(OPACITY.notready);
      setChainActive(s.refs.chain, 4);
      if (ctx.reduced) return;
      ctx.register(s.refs.pod2.animate(
        [{ opacity: 1 }, { opacity: OPACITY.notready }],
        { duration: FADE.out, delay: REACT_MS, fill: 'both', easing: 'ease-in' }
      ));
      ctx.register(s.refs.pod3.animate(
        [{ opacity: 1 }, { opacity: OPACITY.notready }],
        { duration: FADE.out, delay: REACT_MS, fill: 'both', easing: 'ease-in' }
      ));
      pulsePod(s.refs.pod1, ctx, REACT_MS);
      pulsePod(s.refs.pod2, ctx, REACT_MS);
      pulsePod(s.refs.pod3, ctx, REACT_MS);
    },
  },
];

export const init = makeInit(Scene, STEPS, { posterFirst: true });
