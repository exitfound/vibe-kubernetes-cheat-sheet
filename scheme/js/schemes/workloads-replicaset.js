import { svg, g, rect, text } from '../lib/svg.js';
import { arrowDefs, pod, node, box, chainList, setChainActive, arrow, pathArrow } from '../lib/primitives.js';
import { routePacket, valChip, setVal, setBoxLabel, setBoxSublabel, pulsePod, topPacket, makeInit, clearHighlights, clearWires, setWire, relationPath, FADE, BEAT, lightBoxAt, OPACITY, WL } from '../lib/workloads-kit.js';

// Layout B on the Workloads canon (WL in the kit): the panel reaches y<=305 (worst of
// 1600/1440/1280/1100, x<=397), which leaves room under it for the chip column but not for the
// six-row pipeline, so the two columns swap: chips left, ladder right, Node frame full width.
// Design notes for this card: scheme/docs/CARDS.md#workloads-replicaset
const PANEL_B = 305, PANEL_GAP = 20;

// The ReplicaSet is centred on CX so the lane leaves its bottom midpoint and drops down the
// corridor between the two columns.
const TOP1_X = 420, TOP1_W = 2 * (WL.CX - 420);          // 420..780, centred on CX
const TOP_GAP = 60;
const TOP2_X = TOP1_X + TOP1_W + TOP_GAP, TOP2_W = WL.R - (TOP1_X + TOP1_W + TOP_GAP);
const TOP_CY = WL.TOP_Y + WL.BOX_H / 2;
const REQ_Y = TOP_CY - WL.LANE_DY, RESP_Y = TOP_CY + WL.LANE_DY;
const WIRE_X = (TOP1_X + TOP1_W + TOP2_X) / 2;

const LAD_X = WL.CHIP_X, LAD_W = WL.CHIP_W;              // 660..1140, the pipeline
const LAD_Y = 150;                                       // 6 rows -> 150..392

// Chips take the left column, which the panel frees below PANEL_B.
const CHIP_X = WL.LADDER_X, CHIP_W = WL.LADDER_W;        // 60..540
const CHIP_VGAP = 8;
const CHIP_Y = i => PANEL_B + PANEL_GAP + i * (WL.CHIP_H + CHIP_VGAP);   // 325..485

const NODE_Y = 500, NODE_H = 124;                        // 500..624
const POD_H = 78, POD_Y = NODE_Y + 34;                   // 534..612
const POD_PAD = 24;
const POD_INNER = { dy: 24, h: 44 };

// Four Pod slots spread across the frame's inner width, so the row centres on CX.
const SLOT_N = 4, SLOT_W = 220, SLOT_INNER_DX = 30;
const SLOT_SPAN = WL.W - POD_PAD * 2;
const SLOT_X = i => WL.L + POD_PAD + i * ((SLOT_SPAN - SLOT_W) / (SLOT_N - 1));
const SLOT_CX = i => SLOT_X(i) + SLOT_W / 2;

// The lane drops from the ReplicaSet into the Node frame, runs along a bus above the Pod row and
// taps down into whichever Pod the step addresses. Wires and balls share these points.
const BUS_Y = NODE_Y + 12;
const TRUNK = [[WL.CX, WL.TOP_BOTTOM], [WL.CX, BUS_Y]];
// The bus is split at slot 2: the tail and the tap beyond it belong to the fourth slot, which is
// empty on four of the seven steps, and a lane into a Pod that is not there points at nothing.
const BUS = [[SLOT_CX(0), BUS_Y], [SLOT_CX(SLOT_N - 2), BUS_Y]];
const BUS_TAIL = [[SLOT_CX(SLOT_N - 2), BUS_Y], [SLOT_CX(SLOT_N - 1), BUS_Y]];
const TAP = i => [[SLOT_CX(i), BUS_Y], [SLOT_CX(i), POD_Y]];
const LANE = i => (SLOT_CX(i) === WL.CX
  ? [[WL.CX, WL.TOP_BOTTOM], [WL.CX, POD_Y]]
  : [[WL.CX, WL.TOP_BOTTOM], [WL.CX, BUS_Y], [SLOT_CX(i), BUS_Y], [SLOT_CX(i), POD_Y]]);

// A trunk segment carries the ball but is not its destination, so it is drawn without a marker:
// the arrowhead belongs on the tap that lands on a Pod.
function trunkPath(points) {
  return relationPath({ points, role: 'cluster', dash: '5 5' });
}


// valChip / setVal / setBoxLabel / setBoxSublabel are imported from ../lib/workloads-kit.js
// Set a Pod slot in one call: label (the app= label), sublabel (owner state) and opacity.
function setPod(s, idx, { label, sub, opacity }) {
  const boxEl = s.refs['pod' + idx + 'Box'];
  const wrap  = s.refs['pod' + idx];
  if (label !== undefined) setBoxLabel(boxEl, label);
  if (sub   !== undefined) setBoxSublabel(boxEl, sub);
  if (opacity !== undefined) {
    wrap.style.opacity = String(opacity);
    // The fourth slot owns the bus tail and its own tap: they come and go with the Pod.
    if (idx === SLOT_N) {
      s.refs.busTail.style.opacity = String(opacity);
      s.refs.taps[SLOT_N - 1].style.opacity = String(opacity);
    }
  }
}

class Scene {
  constructor(host) { this.host = host; this.refs = {}; this.build(); }

  build() {
    this.host.replaceChildren();
    this.refs = {};
    const root = svg({
      class: 'diagram',
      viewBox: '0 0 1200 640',
      preserveAspectRatio: 'xMidYMid meet',
      'aria-label': 'ReplicaSet controller: a reconcile loop keeps spec.replicas Pods running, owns them through ownerReferences, adopts a matching orphan and releases a relabeled Pod',
      'data-style': 'outline',
    });
    root.appendChild(arrowDefs());

    const rs  = box({ x: TOP1_X, y: WL.TOP_Y, w: TOP1_W, h: WL.BOX_H, label: 'ReplicaSet', sublabel: 'owned by Deployment web', role: 'cluster' });
    const api = box({ x: TOP2_X, y: WL.TOP_Y, w: TOP2_W, h: WL.BOX_H, label: 'API',  sublabel: 'Pod create · delete · watch', role: 'cluster' });

    root.appendChild(arrow({ x1: TOP1_X + TOP1_W, y1: REQ_Y, x2: TOP2_X, y2: REQ_Y, dim: true, dashed: true, role: 'cluster' }));
    root.appendChild(arrow({ x1: TOP2_X, y1: RESP_Y, x2: TOP1_X + TOP1_W, y2: RESP_Y, dim: true, dashed: true, role: 'cluster' }));

    const wireReq = text({ class: 'scheme-label code dim', x: WIRE_X, y: WL.TOP_Y - 12, 'text-anchor': 'middle' }, [' ']);
    root.appendChild(wireReq);

    const selectorChip = valChip({ x: CHIP_X, y: CHIP_Y(0), w: CHIP_W, h: WL.CHIP_H, name: 'selector',       value: 'app=web', role: 'workloads' });
    const desiredChip  = valChip({ x: CHIP_X, y: CHIP_Y(1), w: CHIP_W, h: WL.CHIP_H, name: 'spec.replicas',  value: '3', role: 'workloads' });
    const observedChip = valChip({ x: CHIP_X, y: CHIP_Y(2), w: CHIP_W, h: WL.CHIP_H, name: 'status.replicas', value: '3', role: 'workloads' });
    const actionChip   = valChip({ x: CHIP_X, y: CHIP_Y(3), w: CHIP_W, h: WL.CHIP_H, name: 'reconcile',      value: 'in sync', role: 'workloads' });
    [selectorChip, desiredChip, observedChip, actionChip].forEach(c => root.appendChild(c));

    const chain = chainList({
      x: LAD_X, y: LAD_Y, w: LAD_W, rowH: WL.ROW_H, gap: WL.ROW_GAP,
      items: [
        '1. own       ·  ownerReferences, Deployment → RS → Pod',
        '2. reconcile ·  desired vs observed, level-triggered',
        '3. self-heal ·  a Pod dies, the controller recreates it',
        '4. adopt     ·  a matching orphan is claimed by selector',
        '5. converge  ·  surplus deleted, never exceed replicas',
        '6. orphan    ·  relabel releases a Pod, RS replaces it',
      ],
      role: 'cluster',
    });

    const nodeEl = node({ x: WL.L, y: NODE_Y, w: WL.W, h: NODE_H, label: 'Node-1' });

    // Four Pod slots. Slot names are stable identities (like the Deployment card), the
    // inner box carries the selector label and the ownerReference state.
    const POD_DEFS = ['web-a1', 'web-b2', 'web-c3', 'web-d4'].map((name, i) => ({ x: SLOT_X(i), name }));
    const podBoxes = [];
    const podWrappers = POD_DEFS.map((d, i) => {
      const shell = pod({ x: d.x, y: POD_Y, w: SLOT_W, h: POD_H, label: d.name, sublabel: '', containers: 0, role: 'workloads' });
      const shellRect = shell.querySelector('.scheme-pod-rect');
      if (shellRect) shellRect.style.fill = 'rgba(255, 255, 255, 0.03)';

      const innerBox = box({ x: d.x + SLOT_INNER_DX, y: POD_Y + POD_INNER.dy, w: SLOT_W - SLOT_INNER_DX * 2, h: POD_INNER.h, label: 'app=web', sublabel: 'owner: rs', role: 'workloads' });

      const wrap = g({ id: `pod${i + 1}` });
      wrap.appendChild(shell);
      wrap.appendChild(innerBox);
      podBoxes.push(innerBox);
      return wrap;
    });
    const [pod1, pod2, pod3, pod4] = podWrappers;
    const [pod1Box, pod2Box, pod3Box, pod4Box] = podBoxes;
    pod4.style.opacity = '0'; // the fourth slot is empty until an orphan appears

    // Trunk and bus carry the ball, the taps land it on a Pod: only the taps take an arrowhead.
    const trunk = trunkPath(TRUNK);
    const bus = trunkPath(BUS);
    const busTail = trunkPath(BUS_TAIL);
    const taps = [0, 1, 2, 3].map(i => pathArrow({ points: TAP(i), dim: true, dashed: true, role: 'cluster' }));

    const packetLayer = g({ id: 'packetLayer' });

    // Z-order: the Node frame is a 70% opaque fill, so the bus that runs inside it and the balls
    // that ride it are appended after it. Ladder, Pods and the actor row sit above the packets.
    root.appendChild(nodeEl);
    [trunk, bus, busTail, ...taps].forEach(w => root.appendChild(w));
    root.appendChild(packetLayer);
    root.appendChild(chain);
    [pod1, pod2, pod3, pod4].forEach(p => root.appendChild(p));
    root.appendChild(api);
    root.appendChild(rs);

    this.host.appendChild(root);
    this.refs = {
      svg: root,
      rs, api, chain, nodeEl, trunk, bus, busTail, taps,
      selectorChip, desiredChip, observedChip, actionChip,
      pod1, pod2, pod3, pod4, pod1Box, pod2Box, pod3Box, pod4Box,
      packetLayer,
      wires: { req: wireReq },
    };
  }

  reset() { this.build(); }
}

function clearHL(s) {
  clearHighlights(s,
    ['rs','api','selectorChip','desiredChip','observedChip','actionChip','pod1Box','pod2Box','pod3Box','pod4Box'],
    [s.refs.pod1, s.refs.pod2, s.refs.pod3, s.refs.pod4]);
}

const STEPS = [
  {
    id: 'idle',
    duration: 1500,
    enter(s) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setVal(s.refs.selectorChip, 'app=web');
      setVal(s.refs.desiredChip, '3');
      setVal(s.refs.observedChip, '3');
      setVal(s.refs.actionChip, 'in sync');
      setPod(s, 1, { label: 'app=web', sub: 'owner: rs', opacity: 1 });
      setPod(s, 2, { label: 'app=web', sub: 'owner: rs', opacity: 1 });
      setPod(s, 3, { label: 'app=web', sub: 'owner: rs', opacity: 1 });
      setPod(s, 4, { label: 'app=web', sub: 'owner: none', opacity: 0 });
      setChainActive(s.refs.chain, -1);
    },
  },
  {
    id: 'own',
    duration: 3700,
    narration: 'Every Pod the ReplicaSet manages carries a metadata.ownerReferences entry pointing back to it, with controller=true. That link is what lets garbage collection clean up the Pods when the ReplicaSet is deleted. The ownership is a chain: a Deployment owns this ReplicaSet, and the ReplicaSet owns the Pods. You scale the Deployment, it updates the ReplicaSet spec.replicas, and the ReplicaSet is what actually creates and deletes Pods.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setVal(s.refs.observedChip, '3');
      setVal(s.refs.actionChip, 'in sync');
      setPod(s, 1, { label: 'app=web', sub: 'owner: rs', opacity: 1 });
      setPod(s, 2, { label: 'app=web', sub: 'owner: rs', opacity: 1 });
      setPod(s, 3, { label: 'app=web', sub: 'owner: rs', opacity: 1 });
      setPod(s, 4, { opacity: 0 });
      setWire(s, 'req', 'ownerReferences · controller=true · Deployment → RS → Pod');
      s.refs.rs.classList.add('highlight');
      s.refs.observedChip.classList.add('highlight');
      setChainActive(s.refs.chain, 0);
      if (ctx.reduced) return;
      // Declaration: a packet runs from the ReplicaSet down the connector to the node, and the
      // three Pods pulse on arrival, announcing they exist and belong to the RS by ownerReference.
      [0, 1, 2].forEach(i => {
        const decl = routePacket(s, ctx, LANE(i), { delay: BEAT.lead, role: 'workloads' });
        pulsePod(s.refs['pod' + (i + 1)], ctx, decl.arrivalMs);
      });
    },
  },
  {
    id: 'reconcile',
    duration: 2000,
    narration: 'The controller runs a continuous reconcile loop. On every relevant change it compares the desired count (spec.replicas=3) against the observed count of matching Pods (3 right now) and acts only on the difference. Because it is level-triggered it works off the current observed state, not off one-time events, so a missed event or a controller restart still converges to the same result. With desired equal to observed there is nothing to do.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setVal(s.refs.observedChip, '3');
      setVal(s.refs.actionChip, 'balanced · no-op');
      setPod(s, 1, { label: 'app=web', sub: 'owner: rs', opacity: 1 });
      setPod(s, 2, { label: 'app=web', sub: 'owner: rs', opacity: 1 });
      setPod(s, 3, { label: 'app=web', sub: 'owner: rs', opacity: 1 });
      setPod(s, 4, { opacity: 0 });
      setWire(s, 'req', 'watch Pods · desired 3 == observed 3 · no-op');
      s.refs.rs.classList.add('highlight');
      s.refs.desiredChip.classList.add('highlight');
      s.refs.observedChip.classList.add('highlight');
      s.refs.actionChip.classList.add('highlight');
      setChainActive(s.refs.chain, 1);
      // No packet moves on a no-op reconcile and the Pods are untouched: the compared
      // values show via the static highlight only (no chip pulse).
    },
  },
  {
    id: 'self-heal',
    // Motion: the Pod fade (700) + beat, the watch event in (700), the create out (700), the new Pod
    // down the lane and its arrival pulse, which lands at 4521. The watch hop cost 800 of that.
    duration: 4700,
    narration: 'One Pod is lost, its Node failed or the Pod was deleted. The controller sees the observed count drop to 2 below the desired 3 through its Pod watch, and immediately creates a replacement Pod to restore the count. This self-healing is the whole point of a controller. A bare Pod created on its own has no owner watching it, so once gone it stays gone.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setVal(s.refs.observedChip, '2 → 3');
      setVal(s.refs.actionChip, 'create +1');
      setPod(s, 1, { label: 'app=web', sub: 'owner: rs', opacity: 1 });
      setPod(s, 2, { label: 'app=web', sub: 'owner: rs', opacity: 1 });
      setPod(s, 3, { label: 'app=web', sub: 'owner: rs', opacity: 1 });
      setPod(s, 4, { opacity: 0 });
      setWire(s, 'req', 'observed 2 < 3 · create Pod web-b2');
      s.refs.observedChip.classList.add('highlight');
      s.refs.actionChip.classList.add('highlight');
      setChainActive(s.refs.chain, 2);
      if (ctx.reduced) { s.refs.rs.classList.add('highlight'); s.refs.pod2Box.classList.add('highlight'); s.refs.api.classList.add('highlight'); return; }
      // web-b2 dies and the loss reaches the controller as a watch event down the answer lane, which
      // is what the narration means by seeing the count drop THROUGH its Pod watch. The controller is
      // dark until that event lands: it acts on what it receives. Only then does the create go out,
      // and the new Pod travels down the connector.
      ctx.register(s.refs.pod2.animate([{ opacity: 1 }, { opacity: 0 }], { duration: FADE.out, delay: 0, fill: 'forwards', easing: 'ease-in' }));
      const watch = topPacket(s, ctx, { from: TOP2_X, to: TOP1_X + TOP1_W, y: RESP_Y, delay: FADE.out + BEAT.afterHop, role: 'workloads' });
      lightBoxAt(s.refs.rs, ctx, watch.arrivalMs);
      const req = topPacket(s, ctx, { from: TOP1_X + TOP1_W, to: TOP2_X, y: REQ_Y, delay: watch.arrivalMs + BEAT.afterHop, role: 'workloads' });
      lightBoxAt(s.refs.api, ctx, req.arrivalMs);
      const create = routePacket(s, ctx, LANE(1), { delay: req.arrivalMs + BEAT.afterHop, role: 'workloads' });
      ctx.register(s.refs.pod2.animate([{ opacity: 0 }, { opacity: 1 }], { duration: FADE.in, delay: create.arrivalMs, fill: 'both', easing: 'ease-out' }));
      pulsePod(s.refs.pod2, ctx, create.arrivalMs);
    },
  },
  {
    id: 'adopt',
    duration: 3700,
    narration: 'A standalone Pod is created with the label app=web and no controller ownerReference. The ReplicaSet matches Pods by selector, not by who created them, so it adopts this orphan: it PATCHes the Pod metadata.ownerReferences to point at itself. The Pod was already running, adoption only restamps its owner, and it now joins the set on the Node as the fourth replica. The observed count is now 4.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setVal(s.refs.observedChip, '3 → 4');
      setVal(s.refs.actionChip, 'adopt +1');
      setPod(s, 1, { label: 'app=web', sub: 'owner: rs', opacity: 1 });
      setPod(s, 2, { label: 'app=web', sub: 'owner: rs', opacity: 1 });
      setPod(s, 3, { label: 'app=web', sub: 'owner: rs', opacity: 1 });
      setPod(s, 4, { label: 'app=web', sub: 'adopted · owner: rs', opacity: 1 });
      setWire(s, 'req', 'PATCH ownerReferences · adopt web-d4 (app=web)');
      s.refs.rs.classList.add('highlight');
      s.refs.observedChip.classList.add('highlight');
      s.refs.actionChip.classList.add('highlight');
      setChainActive(s.refs.chain, 3);
      if (ctx.reduced) { s.refs.pod4Box.classList.add('highlight'); s.refs.api.classList.add('highlight'); return; }
      s.refs.pod4.style.opacity = '0';
      const patch = topPacket(s, ctx, { from: TOP1_X + TOP1_W, to: TOP2_X, y: REQ_Y, role: 'workloads' });
      lightBoxAt(s.refs.api, ctx, patch.arrivalMs);
      const join = routePacket(s, ctx, LANE(3), { delay: patch.arrivalMs + BEAT.afterHop, role: 'workloads' });
      ctx.register(s.refs.pod4.animate([{ opacity: 0 }, { opacity: 1 }], { duration: FADE.in, delay: join.arrivalMs, fill: 'both', easing: 'ease-out' }));
      pulsePod(s.refs.pod4, ctx, join.arrivalMs);
    },
  },
  {
    id: 'converge',
    duration: 3700,
    narration: 'Adoption pushed the count to 4, one above spec.replicas. The same reconcile loop now deletes one Pod to return to exactly 3. A ReplicaSet never runs more than its desired count, no matter where the extra Pod came from. When it has to pick a victim it ranks candidates (unscheduled and not-ready Pods first, then by the controller.kubernetes.io/pod-deletion-cost annotation), then issues a delete.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setVal(s.refs.observedChip, '4 → 3');
      setVal(s.refs.actionChip, 'delete -1');
      setPod(s, 1, { label: 'app=web', sub: 'owner: rs', opacity: 1 });
      setPod(s, 2, { label: 'app=web', sub: 'owner: rs', opacity: 1 });
      setPod(s, 3, { label: 'app=web', sub: 'owner: rs', opacity: 1 });
      setPod(s, 4, { label: 'app=web', sub: 'surplus · deleting', opacity: 0 });
      setWire(s, 'req', 'observed 4 > 3 · DELETE surplus Pod');
      s.refs.rs.classList.add('highlight');
      s.refs.observedChip.classList.add('highlight');
      s.refs.actionChip.classList.add('highlight');
      setChainActive(s.refs.chain, 4);
      if (ctx.reduced) { s.refs.api.classList.add('highlight'); return; }
      // The DELETE travels to the node, the surplus Pod pulses then is removed on arrival. The whole
      // fourth slot comes back for the flight, bus tail and tap included: LANE(3) runs along both,
      // so restoring the Pod alone left the last two legs of the ball on blank canvas.
      setPod(s, 4, { opacity: 1 });
      const del = topPacket(s, ctx, { from: TOP1_X + TOP1_W, to: TOP2_X, y: REQ_Y, role: 'workloads' });
      lightBoxAt(s.refs.api, ctx, del.arrivalMs);
      const evict = routePacket(s, ctx, LANE(3), { delay: del.arrivalMs + BEAT.afterHop, role: 'workloads' });
      pulsePod(s.refs.pod4, ctx, evict.arrivalMs);
      // Pod, tail and tap leave on one beat. fill:'both' holds them on screen through the delay.
      [s.refs.pod4, s.refs.busTail, s.refs.taps[SLOT_N - 1]].forEach(el => ctx.register(
        el.animate([{ opacity: 1 }, { opacity: 0 }], { duration: FADE.out, delay: evict.arrivalMs, fill: 'both', easing: 'ease-in' })));
    },
  },
  {
    id: 'orphan',
    duration: 3700,
    narration: 'The reverse of adoption. A Pod is relabeled so it no longer matches the selector, here app=web becomes app=debug. The ReplicaSet releases it by removing its ownerReference, and the Pod keeps running as an unmanaged standalone Pod. That drops the matching count to 2, so the controller creates a replacement to hold 3. Labels are the binding: change them and a Pod moves in or out of the set.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setVal(s.refs.observedChip, '2 → 3');
      setVal(s.refs.actionChip, 'release + create');
      setPod(s, 1, { label: 'app=web', sub: 'owner: rs', opacity: 1 });
      setPod(s, 2, { label: 'app=web', sub: 'owner: rs', opacity: 1 });
      // pod3 is relabeled off the selector and released, it keeps running but unmanaged.
      setPod(s, 3, { label: 'app=debug', sub: 'released · unmanaged', opacity: OPACITY.notready });
      // pod4 is the fresh replacement that restores the matching count to 3.
      setPod(s, 4, { label: 'app=web', sub: 'owner: rs', opacity: 1 });
      setWire(s, 'req', 'label app=debug · remove ownerReference · create replacement');
      s.refs.rs.classList.add('highlight');
      s.refs.observedChip.classList.add('highlight');
      s.refs.actionChip.classList.add('highlight');
      setChainActive(s.refs.chain, 5);
      if (ctx.reduced) { s.refs.pod4Box.classList.add('highlight'); s.refs.api.classList.add('highlight'); return; }
      // pod3 fades to its dim released state, the RS removes its ownerReference (top PATCH),
      // then creates a replacement that materializes in the free slot on arrival.
      ctx.register(s.refs.pod3.animate([{ opacity: 1 }, { opacity: OPACITY.notready }], { duration: FADE.out, delay: 0, fill: 'both', easing: 'ease-in' }));
      const release = topPacket(s, ctx, { from: TOP1_X + TOP1_W, to: TOP2_X, y: REQ_Y, role: 'workloads' });
      lightBoxAt(s.refs.api, ctx, release.arrivalMs);
      s.refs.pod4.style.opacity = '0';
      const replace = routePacket(s, ctx, LANE(3), { delay: release.arrivalMs + BEAT.afterHop, role: 'workloads' });
      ctx.register(s.refs.pod4.animate([{ opacity: 0 }, { opacity: 1 }], { duration: FADE.in, delay: replace.arrivalMs, fill: 'both', easing: 'ease-out' }));
      pulsePod(s.refs.pod4, ctx, replace.arrivalMs);
    },
  },
];

export const init = makeInit(Scene, STEPS, { posterFirst: true });
