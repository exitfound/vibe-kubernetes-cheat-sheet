import { svg, g, rect, text } from '../lib/svg.js';
import { arrowDefs, pod, node, box, chainList, setChainActive, arrow, pathArrow } from '../lib/primitives.js';
import { routePacket, valChip, setVal, setBoxSublabel, pulsePod, topPacket, relationPath, makeInit, clearHighlights, clearWires, setWire, FADE, BEAT, lightBoxAt, OPACITY, WL } from '../lib/workloads-kit.js';

// Layout B of the Workloads canon (WL): chips left, pipeline right, one tap into the surging Pod.
// Panel worst case x<=397, y<=230; a longer narration invalidates that measurement.
// Design notes for this card: scheme/docs/CARDS.md#workloads-deployment-rollback
const PANEL_B = 230;
const TOP1_X = 420, TOP1_W = 220;
const TOP_GAP = 60;
const TOP2_X = TOP1_X + TOP1_W + TOP_GAP, TOP2_W = 220;
const TOP_CY = WL.TOP_Y + WL.BOX_H / 2;
const REQ_Y = TOP_CY - WL.LANE_DY, RESP_Y = TOP_CY + WL.LANE_DY;
const WIRE_X = (TOP1_X + TOP1_W + TOP2_X) / 2;
const WIRE_Y = WL.TOP_Y - 12;                            // above the actor row, off the spine

const LAD_X = WL.CHIP_X, LAD_W = WL.CHIP_W;              // 660..1140, the pipeline
const LAD_Y = 160;                                       // 6 rows -> 160..402

// Chips as a column in the left band, which only opens below the panel.
const CHIP_GAP = 8;
const CHIPS_TOP = PANEL_B + 20;                          // 250
const CHIP_X = WL.LADDER_X, CHIP_W = WL.LADDER_W;        // 60..540
const CHIP_Y = i => CHIPS_TOP + i * (WL.CHIP_H + CHIP_GAP);

const NODE_H = 140, CANVAS_B = 624;
const NODE_Y = CANVAS_B - NODE_H;                        // 484..624, the frame rests on the floor
// FOUR slots. Every step of this card pins RS-v1 at 3 / 3, and the narration says RS-v1 was never
// scaled below three, so the three v1 Pods are always drawn. The fourth slot carries the whole v2
// story: it appears on the rollout, crash-loops, wedges, and is deleted by the undo. With three slots
// the broken v2 stood in a v1 Pod's place and the row showed two survivors against a chip saying three.
const POD_W = 234, POD_H = 106, POD_Y = NODE_Y + 22;     // 506..612
const POD_PAD = 24;
const POD_INNER = { dx: 30, w: POD_W - 60, dy: 28, h: 52 };
const SLOT_N = 4;
const POD_XS = [0, 1, 2, 3].map(i => WL.L + POD_PAD + i * ((WL.W - POD_PAD * 2 - POD_W) / (SLOT_N - 1)));
const POD_CX = i => POD_XS[i] + POD_W / 2;               // 201 / 467 / 733 / 999

// The trunk leaves the first actor box on its own midpoint, steps into the central corridor
// between the two columns, drops to a bus above the Pod row and taps down into the surging Pod,
// which is the only Pod any ball on this card is addressed to.
const TOP1_CX = TOP1_X + TOP1_W / 2;                     // 530
const JOG_Y = WL.TOP_BOTTOM + 20;                        // 140, below the boxes, above the ladder
const BUS_Y = NODE_Y - 24;                               // 460, clear of the chip column
const SPINE = [
  [TOP1_CX, WL.TOP_BOTTOM], [TOP1_CX, JOG_Y], [WL.SPINE_X, JOG_Y],
  [WL.SPINE_X, BUS_Y], [POD_CX(3), BUS_Y], [POD_CX(3), POD_Y],
];


class Scene {
  constructor(host) { this.host = host; this.refs = {}; this.build(); }

  build() {
    this.host.replaceChildren();
    this.refs = {};
    const root = svg({
      class: 'diagram',
      viewBox: '0 0 1200 640',
      preserveAspectRatio: 'xMidYMid meet',
      'aria-label': 'Deployment rollback and revision history: a bad rollout stalls past progressDeadlineSeconds, rollout undo scales the broken ReplicaSet to zero while the previous one keeps serving',
      'data-style': 'outline',
    });
    root.appendChild(arrowDefs());

    const controller = box({ x: TOP1_X, y: WL.TOP_Y, w: TOP1_W, h: WL.BOX_H, label: 'Deployment', sublabel: 'owns RS revisions', role: 'cluster' });
    const apiserver  = box({ x: TOP2_X, y: WL.TOP_Y, w: TOP2_W, h: WL.BOX_H, label: 'API',  sublabel: 'PATCH .scale + Pod CRUD', role: 'cluster' });

    root.appendChild(arrow({ x1: TOP1_X + TOP1_W, y1: REQ_Y, x2: TOP2_X, y2: REQ_Y, dim: true, dashed: true, role: 'cluster' }));
    // The answer lane is a relationship here, not a route: no step on this card names anything
    // travelling back from the API, so it carries no arrowhead and sits behind the live lane.
    root.appendChild(relationPath({ points: [[TOP2_X, RESP_Y], [TOP1_X + TOP1_W, RESP_Y]], role: 'cluster' }));

    const wireReq = text({ class: 'scheme-label code dim', x: WIRE_X, y: WIRE_Y, 'text-anchor': 'middle' }, [' ']);
    root.appendChild(wireReq);

    const rs1Chip  = valChip({ x: CHIP_X, y: CHIP_Y(0), w: CHIP_W, h: WL.CHIP_H, name: 'RS-v1 (rev 1) · Ready', value: '3 / 3', role: 'workloads' });
    const rs2Chip  = valChip({ x: CHIP_X, y: CHIP_Y(1), w: CHIP_W, h: WL.CHIP_H, name: 'RS-v2 (rev 2) · Ready', value: '0 / 0', role: 'workloads' });
    const condChip = valChip({ x: CHIP_X, y: CHIP_Y(2), w: CHIP_W, h: WL.CHIP_H, name: 'condition', value: 'Available=True', role: 'workloads' });
    const revChip  = valChip({ x: CHIP_X, y: CHIP_Y(3), w: CHIP_W, h: WL.CHIP_H, name: 'rollout',   value: 'stable @ rev 1', role: 'workloads' });
    [rs1Chip, rs2Chip, condChip, revChip].forEach(c => root.appendChild(c));

    const chain = chainList({
      x: LAD_X, y: LAD_Y, w: LAD_W, rowH: WL.ROW_H, gap: WL.ROW_GAP,
      items: [
        '1. stable   ·  rev 1, RS-v1 owns 3 Ready Pods',
        '2. rollout  ·  set image v2, RS-v2 surges (rev 2)',
        '3. bad      ·  v2 crashes, readiness never passes',
        '4. stuck    ·  progressDeadline, Progressing=False',
        '5. undo     ·  rollout undo, RS-v2 to 0, RS-v1 kept',
        '6. restored ·  rev 3 copies rev 1, Available=True',
      ],
      role: 'cluster',
    });

    const nodeEl = node({ x: WL.L, y: NODE_Y, w: WL.W, h: NODE_H, label: 'Node-1' });

    const POD_NAMES = ['web-a1', 'web-b2', 'web-c3', 'web-d4'];
    const podBoxes = [];
    const podWrappers = POD_XS.map((px, i) => {
      const shell = pod({ x: px, y: POD_Y, w: POD_W, h: POD_H, label: POD_NAMES[i], sublabel: '', containers: 0, role: 'workloads' });
      const shellRect = shell.querySelector('.scheme-pod-rect');
      if (shellRect) shellRect.style.fill = 'rgba(255, 255, 255, 0.03)';

      const innerBox = box({ x: px + POD_INNER.dx, y: POD_Y + POD_INNER.dy, w: POD_INNER.w, h: POD_INNER.h, label: 'app', sublabel: 'v1.0', role: 'workloads' });

      const wrap = g({ id: `pod${i + 1}` });
      wrap.appendChild(shell);
      wrap.appendChild(innerBox);
      podBoxes.push(innerBox);
      return wrap;
    });
    const [pod1, pod2, pod3, pod4] = podWrappers;
    const [pod1Box, pod2Box, pod3Box, pod4Box] = podBoxes;

    const connector = pathArrow({
      points: SPINE,
      dim: true, dashed: true, role: 'cluster',
    });
    root.appendChild(connector);

    const packetLayer = g({ id: 'packetLayer' });
    root.appendChild(packetLayer);

    root.appendChild(chain);
    root.appendChild(nodeEl);
    [pod1, pod2, pod3, pod4].forEach(p => root.appendChild(p));
    root.appendChild(apiserver);
    root.appendChild(controller);

    this.host.appendChild(root);
    this.refs = {
      svg: root,
      controller, apiserver, chain, nodeEl, connector,
      rs1Chip, rs2Chip, condChip, revChip,
      pod1, pod2, pod3, pod4, pod1Box, pod2Box, pod3Box, pod4Box,
      packetLayer,
      wires: { req: wireReq },
    };
  }

  reset() { this.build(); }
}

function clearHL(s) {
  clearHighlights(s,
    ['controller','apiserver','rs1Chip','rs2Chip','condChip','revChip','pod1Box','pod2Box','pod3Box','pod4Box'],
    [s.refs.pod1, s.refs.pod2, s.refs.pod3, s.refs.pod4]);
}
// A slot's version and its presence are one fact: `null` means the slot is empty on this step. The
// three v1 Pods never leave, so only the fourth argument ever changes.
function setSlots(s, ...slots) {
  slots.forEach((v, i) => {
    const pod = s.refs['pod' + (i + 1)];
    if (v === null) { pod.style.opacity = '0'; return; }
    pod.style.opacity = String(v.op === undefined ? 1 : v.op);
    setBoxSublabel(s.refs['pod' + (i + 1) + 'Box'], v.v);
  });
}
const V1 = { v: 'v1.0' };
const V2_NEW = { v: 'v2.0 · starting' };
const V2_CRASH = { v: 'v2.0 · CrashLoopBackOff', op: OPACITY.notready };
const V2_STUCK = { v: 'v2.0 · stuck', op: OPACITY.notready };
const STEPS = [
  {
    id: 'stable',
    duration: 1500,
    enter(s) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setSlots(s, V1, V1, V1, null);
      setVal(s.refs.rs1Chip, '3 / 3');
      setVal(s.refs.rs2Chip, '0 / 0');
      setVal(s.refs.condChip, 'Available=True');
      setVal(s.refs.revChip, 'stable @ rev 1');
      setChainActive(s.refs.chain, 0);
    },
  },
  {
    id: 'rollout',
    duration: 3700,
    narration: 'You run kubectl set image deployment/web app=v2.0, which PATCHes the Pod template. The new template hash differs, so the Deployment controller creates ReplicaSet RS-v2 as revision 2 and starts the rollout, surging a v2 Pod under the RollingUpdate strategy while the old Pods keep serving.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setSlots(s, V1, V1, V1, V2_NEW);
      setVal(s.refs.rs1Chip, '3 / 3');
      setVal(s.refs.rs2Chip, '0 / 1');
      setVal(s.refs.condChip, 'Progressing=True');
      s.refs.condChip.classList.add('highlight');
      setVal(s.refs.revChip, 'rolling out rev 2');
      setWire(s, 'req', 'PATCH .spec.template · create RS-v2 (rev 2)');
      s.refs.controller.classList.add('highlight');
      s.refs.rs2Chip.classList.add('highlight');
      s.refs.revChip.classList.add('highlight');
      setChainActive(s.refs.chain, 1);
      if (ctx.reduced) { s.refs.pod4Box.classList.add('highlight'); s.refs.apiserver.classList.add('highlight'); return; }
      // The PATCH hits the Api, then the surge order travels down the
      // connector and the surging Pod pulses on arrival.
      const req = topPacket(s, ctx, { from: TOP1_X + TOP1_W, to: TOP2_X, y: REQ_Y, role: 'workloads' });
      lightBoxAt(s.refs.apiserver, ctx, req.arrivalMs);
      const surge = routePacket(s, ctx, SPINE, { delay: req.arrivalMs + BEAT.afterHop, role: 'workloads' });
      pulsePod(s.refs.pod4, ctx, surge.arrivalMs);
    },
  },
  {
    id: 'bad',
    duration: 2900,
    narration: 'The v2 Pod is broken. Its readinessProbe never passes, so it churns in CrashLoopBackOff and never reports Ready. Because maxUnavailable kept the old Pods alive, the Service still has healthy v1 backends, but RS-v2 cannot reach its target and the rollout makes no progress.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setSlots(s, V1, V1, V1, V2_CRASH);
      setVal(s.refs.rs1Chip, '3 / 3');
      setVal(s.refs.rs2Chip, '0 / 1 (crashing)');
      setVal(s.refs.condChip, 'Progressing=True');
      setVal(s.refs.revChip, 'rev 2 never Ready');
      s.refs.revChip.classList.add('highlight');
      setWire(s, 'req', 'readinessProbe fail · v2 not Ready');
      s.refs.apiserver.classList.add('highlight');
      s.refs.rs2Chip.classList.add('highlight');
      setChainActive(s.refs.chain, 2);
      if (ctx.reduced) return;
      // The failed status reaches the controller over the connector. The v2 Pod pulses then dims to
      // show it is crash-looping, and the three v1 Pods are untouched throughout.
      s.refs.pod4.style.opacity = '1';
      const status = routePacket(s, ctx, SPINE, { role: 'workloads' });
      pulsePod(s.refs.pod4, ctx, status.arrivalMs);
      ctx.register(s.refs.pod4.animate([{ opacity: 1 }, { opacity: OPACITY.notready }], { duration: FADE.out, delay: status.arrivalMs, fill: 'both', easing: 'ease-in' }));
    },
  },
  {
    id: 'stuck',
    duration: 2300,
    narration: 'After progressDeadlineSeconds (600 by default), the Deployment sets the condition Progressing=False with reason ProgressDeadlineExceeded. The rollout is wedged: RS-v2 cannot reach its count, while RS-v1 keeps all three v1.0 Pods serving, so traffic stays healthy on the old version until someone steps in.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setSlots(s, V1, V1, V1, V2_STUCK);
      setVal(s.refs.rs1Chip, '3 / 3');
      setVal(s.refs.rs2Chip, '0 / 1 stuck');
      s.refs.rs2Chip.classList.add('highlight');
      setVal(s.refs.condChip, 'Progressing=False');
      setVal(s.refs.revChip, 'ProgressDeadlineExceeded');
      setWire(s, 'req', 'progressDeadlineSeconds elapsed · rollout halts');
      s.refs.condChip.classList.add('highlight');
      s.refs.revChip.classList.add('highlight');
      setChainActive(s.refs.chain, 3);
      // The deadline lapses with nothing moving and the Pods are untouched: the wedged
      // conditions show via the static highlight only (no chip pulse).
    },
  },
  {
    id: 'undo',
    duration: 3700,
    narration: 'Running kubectl rollout undo deployment/web rolls back to the previous good revision. The controller scales RS-v2 down to zero, while RS-v1 was never scaled below three and simply keeps serving. The broken v2 Pod is deleted, so all three serving Pods are on v1.0 again.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setSlots(s, V1, V1, V1, null);
      setVal(s.refs.rs1Chip, '3 / 3');
      setVal(s.refs.rs2Chip, '0 / 0');
      s.refs.rs2Chip.classList.add('highlight');
      setVal(s.refs.condChip, 'Progressing=True');
      s.refs.condChip.classList.add('highlight');
      setVal(s.refs.revChip, 'undo → rev 1 template');
      setWire(s, 'req', 'rollout undo · RS-v2 to 0 · RS-v1 stays 3');
      s.refs.controller.classList.add('highlight');
      s.refs.rs1Chip.classList.add('highlight');
      s.refs.revChip.classList.add('highlight');
      setChainActive(s.refs.chain, 4);
      if (ctx.reduced) { s.refs.pod4Box.classList.add('highlight'); s.refs.apiserver.classList.add('highlight'); return; }
      const req = topPacket(s, ctx, { from: TOP1_X + TOP1_W, to: TOP2_X, y: REQ_Y, role: 'workloads' });
      lightBoxAt(s.refs.apiserver, ctx, req.arrivalMs);
      // The undo reaches the node and the broken v2 Pod is DELETED, which is what the narration says:
      // RS-v2 goes to zero and the three v1 Pods simply keep serving, so the row loses its fourth Pod
      // rather than converting it back into a v1.
      s.refs.pod4.style.opacity = String(OPACITY.notready);
      const undo = routePacket(s, ctx, SPINE, { delay: req.arrivalMs + BEAT.afterHop, role: 'workloads' });
      pulsePod(s.refs.pod4, ctx, undo.arrivalMs);
      ctx.register(s.refs.pod4.animate([{ opacity: OPACITY.notready }, { opacity: 0 }], { duration: FADE.out, delay: undo.arrivalMs, fill: 'both', easing: 'ease-in' }));
    },
  },
  {
    id: 'restored',
    duration: 2300,
    narration: 'The rollback is itself recorded as a new revision 3 whose template equals revision 1. Undo does not erase revision 2, it stays in history, and revisionHistoryLimit caps how many old ReplicaSets are kept. Running kubectl rollout history lists all three revisions, and the Deployment reports Available=True again.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setSlots(s, V1, V1, V1, null);
      setVal(s.refs.rs1Chip, '3 / 3 (now rev 3)');
      s.refs.rs1Chip.classList.add('highlight');
      setVal(s.refs.rs2Chip, '0 / 0 (retained)');
      s.refs.rs2Chip.classList.add('highlight');
      setVal(s.refs.condChip, 'Available=True');
      setVal(s.refs.revChip, 'restored @ rev 3');
      s.refs.condChip.classList.add('highlight');
      s.refs.revChip.classList.add('highlight');
      setChainActive(s.refs.chain, 5);
      if (ctx.reduced) { ['pod1Box','pod2Box','pod3Box'].forEach(k => s.refs[k].classList.add('highlight')); return; }
      // Rolled back and healthy: the three v1 Pods pulse together (the pulse fades).
      pulsePod(s.refs.pod1, ctx, 0);
      pulsePod(s.refs.pod2, ctx, 0);
      pulsePod(s.refs.pod3, ctx, 0);
    },
  },
];

export const init = makeInit(Scene, STEPS, { posterFirst: true });
