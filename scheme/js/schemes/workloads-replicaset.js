import { svg, g, rect, text } from '../lib/svg.js';
import { arrowDefs, pod, node, box, chainList, setChainActive, arrow, pathArrow, packet } from '../lib/primitives.js';
import { valChip, setVal, setBoxLabel, setBoxSublabel, pulsePod, connectorPacket, topPacket, makeInit, clearHighlights, clearWires, setWire, FADE, BEAT } from '../lib/scheme-kit.js';

// valChip / setVal / setBoxLabel / setBoxSublabel are imported from ../lib/scheme-kit.js
// Set a Pod slot in one call: label (the app= label), sublabel (owner state) and opacity.
function setPod(s, idx, { label, sub, opacity }) {
  const boxEl = s.refs['pod' + idx + 'Box'];
  const wrap  = s.refs['pod' + idx];
  if (label !== undefined) setBoxLabel(boxEl, label);
  if (sub   !== undefined) setBoxSublabel(boxEl, sub);
  if (opacity !== undefined) wrap.style.opacity = String(opacity);
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

    const rs  = box({ x: 320, y: 40, w: 220, h: 80, label: 'ReplicaSet', sublabel: 'owned by Deployment web', cat: 'control' });
    const api = box({ x: 580, y: 40, w: 220, h: 80, label: 'Api',  sublabel: 'Pod create · delete · watch', cat: 'control' });

    root.appendChild(arrow({ x1: 540, y1: 65, x2: 580, y2: 65, dim: true, dashed: true, color: 'control' }));
    root.appendChild(arrow({ x1: 580, y1: 95, x2: 540, y2: 95, dim: true, dashed: true, color: 'control' }));

    const wireReq = text({ class: 'scheme-label code dim', x: 560, y: 148, 'text-anchor': 'middle', 'font-size': 9 }, [' ']);
    root.appendChild(wireReq);

    const selectorChip = valChip({ x: 830, y: 40,  w: 350, h: 32, name: 'selector',       value: 'app=web' });
    const desiredChip  = valChip({ x: 830, y: 82,  w: 350, h: 32, name: 'spec.replicas',  value: '3' });
    const observedChip = valChip({ x: 830, y: 124, w: 350, h: 32, name: 'status.replicas', value: '3' });
    const actionChip   = valChip({ x: 830, y: 166, w: 350, h: 32, name: 'reconcile',      value: 'in sync' });
    [selectorChip, desiredChip, observedChip, actionChip].forEach(c => root.appendChild(c));

    const chain = chainList({
      x: 320, y: 220, w: 480, rowH: 32, gap: 10,
      items: [
        '1. own       ·  ownerReferences, Deployment → RS → Pod',
        '2. reconcile ·  desired vs observed, level-triggered',
        '3. self-heal ·  a Pod dies, the controller recreates it',
        '4. adopt     ·  a matching orphan is claimed by selector',
        '5. converge  ·  surplus deleted, never exceed replicas',
        '6. orphan    ·  relabel releases a Pod, RS replaces it',
      ],
      cat: 'control',
    });

    const nodeEl = node({ x: 320, y: 480, w: 860, h: 140, label: 'Node-1' });

    // Four Pod slots. Slot names are stable identities (like the Deployment card), the
    // inner box carries the selector label and the ownerReference state.
    const POD_DEFS = [
      { x: 386, name: 'web-a1' },
      { x: 586, name: 'web-b2' },
      { x: 786, name: 'web-c3' },
      { x: 986, name: 'web-d4' },
    ];
    const podBoxes = [];
    const podWrappers = POD_DEFS.map((d, i) => {
      const shell = pod({ x: d.x, y: 497, w: 182, h: 106, label: d.name, sublabel: '', containers: 0, cat: 'workloads' });
      const shellRect = shell.querySelector('.scheme-pod-rect');
      if (shellRect) shellRect.style.fill = 'rgba(255, 255, 255, 0.03)';

      const innerBox = box({ x: d.x + 10, y: 525, w: 162, h: 52, label: 'app=web', sublabel: 'owner: rs', cat: 'workloads' });

      const wrap = g({ id: `pod${i + 1}` });
      wrap.appendChild(shell);
      wrap.appendChild(innerBox);
      podBoxes.push(innerBox);
      return wrap;
    });
    const [pod1, pod2, pod3, pod4] = podWrappers;
    const [pod1Box, pod2Box, pod3Box, pod4Box] = podBoxes;
    pod4.style.opacity = '0'; // the fourth slot is empty until an orphan appears

    const connector = pathArrow({
      points: [[320, 80], [280, 80], [280, 550], [320, 550]],
      dim: true, dashed: true, color: 'control',
    });
    root.appendChild(connector);

    const packetLayer = g({ id: 'packetLayer' });
    root.appendChild(packetLayer);

    root.appendChild(chain);
    root.appendChild(nodeEl);
    [pod1, pod2, pod3, pod4].forEach(p => root.appendChild(p));
    root.appendChild(api);
    root.appendChild(rs);

    this.host.appendChild(root);
    this.refs = {
      svg: root,
      rs, api, chain, nodeEl, connector,
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
    narration: 'A ReplicaSet named web-7d4 keeps a stable set of Pods running. It declares spec.replicas=3 and a label selector app=web. The ReplicaSet controller, part of kube-controller-manager, watches every Pod that matches the selector and works to keep the running count equal to spec.replicas. The ReplicaSet itself is owned by a Deployment, which is how you normally manage it.',
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
    duration: 2600,
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
      const decl = connectorPacket(s, ctx, { delay: BEAT.lead });
      pulsePod(s.refs.pod1, ctx, decl.arrivalMs);
      pulsePod(s.refs.pod2, ctx, decl.arrivalMs);
      pulsePod(s.refs.pod3, ctx, decl.arrivalMs);
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
    duration: 3300,
    narration: 'One Pod is lost, its node failed or the Pod was deleted. The controller sees the observed count drop to 2 below the desired 3 through its Pod watch, and immediately creates a replacement Pod to restore the count. This self-healing is the whole point of a controller. A bare Pod created on its own has no owner watching it, so once gone it stays gone.',
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
      s.refs.rs.classList.add('highlight');
      s.refs.api.classList.add('highlight');
      s.refs.observedChip.classList.add('highlight');
      s.refs.actionChip.classList.add('highlight');
      setChainActive(s.refs.chain, 2);
      if (ctx.reduced) { s.refs.pod2Box.classList.add('highlight'); return; }
      // web-b2 dies, the controller issues the create (top hop), then the new Pod
      // travels down the connector and lands on arrival.
      ctx.register(s.refs.pod2.animate([{ opacity: 1 }, { opacity: 0 }], { duration: FADE.out, delay: 0, fill: 'forwards', easing: 'ease-in' }));
      const req = topPacket(s, ctx, { delay: FADE.out + BEAT.afterHop });
      const create = connectorPacket(s, ctx, { delay: req.arrivalMs + BEAT.afterHop });
      ctx.register(s.refs.pod2.animate([{ opacity: 0 }, { opacity: 1 }], { duration: FADE.in, delay: create.arrivalMs, fill: 'both', easing: 'ease-out' }));
      pulsePod(s.refs.pod2, ctx, create.arrivalMs);
    },
  },
  {
    id: 'adopt',
    duration: 2600,
    narration: 'A standalone Pod is created with the label app=web and no controller ownerReference. The ReplicaSet matches Pods by selector, not by who created them, so it adopts this orphan: it PATCHes the Pod metadata.ownerReferences to point at itself. The Pod was already running, adoption only restamps its owner, and it now joins the set on the node as the fourth replica. The observed count is now 4.',
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
      s.refs.api.classList.add('highlight');
      s.refs.observedChip.classList.add('highlight');
      s.refs.actionChip.classList.add('highlight');
      setChainActive(s.refs.chain, 3);
      if (ctx.reduced) { s.refs.pod4Box.classList.add('highlight'); return; }
      // The RS claims the orphan (ownerReference PATCH on the top arrow), then a packet runs
      // down the connector and the adopted Pod materializes in the node block on arrival,
      // showing the fourth replica joining the managed set.
      s.refs.pod4.style.opacity = '0';
      const patch = topPacket(s, ctx);
      const join = connectorPacket(s, ctx, { delay: patch.arrivalMs + BEAT.afterHop });
      ctx.register(s.refs.pod4.animate([{ opacity: 0 }, { opacity: 1 }], { duration: FADE.in, delay: join.arrivalMs, fill: 'both', easing: 'ease-out' }));
      pulsePod(s.refs.pod4, ctx, join.arrivalMs);
    },
  },
  {
    id: 'converge',
    duration: 2600,
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
      s.refs.api.classList.add('highlight');
      s.refs.observedChip.classList.add('highlight');
      s.refs.actionChip.classList.add('highlight');
      setChainActive(s.refs.chain, 4);
      if (ctx.reduced) return;
      // The DELETE travels to the node, the surplus Pod pulses then is removed on arrival.
      s.refs.pod4.style.opacity = '1';
      const del = topPacket(s, ctx);
      const evict = connectorPacket(s, ctx, { delay: del.arrivalMs + BEAT.afterHop });
      pulsePod(s.refs.pod4, ctx, evict.arrivalMs);
      ctx.register(s.refs.pod4.animate([{ opacity: 1 }, { opacity: 0 }], { duration: FADE.out, delay: evict.arrivalMs, fill: 'both', easing: 'ease-in' }));
    },
  },
  {
    id: 'orphan',
    duration: 2700,
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
      setPod(s, 3, { label: 'app=debug', sub: 'released · unmanaged', opacity: 0.45 });
      // pod4 is the fresh replacement that restores the matching count to 3.
      setPod(s, 4, { label: 'app=web', sub: 'owner: rs', opacity: 1 });
      setWire(s, 'req', 'label app=debug · remove ownerReference · create replacement');
      s.refs.rs.classList.add('highlight');
      s.refs.api.classList.add('highlight');
      s.refs.observedChip.classList.add('highlight');
      s.refs.actionChip.classList.add('highlight');
      setChainActive(s.refs.chain, 5);
      if (ctx.reduced) { s.refs.pod4Box.classList.add('highlight'); return; }
      // pod3 fades to its dim released state, the RS removes its ownerReference (top PATCH),
      // then creates a replacement that materializes in the free slot on arrival.
      ctx.register(s.refs.pod3.animate([{ opacity: 1 }, { opacity: 0.45 }], { duration: FADE.out, delay: 0, fill: 'both', easing: 'ease-in' }));
      const release = topPacket(s, ctx);
      s.refs.pod4.style.opacity = '0';
      const replace = connectorPacket(s, ctx, { delay: release.arrivalMs + BEAT.afterHop });
      ctx.register(s.refs.pod4.animate([{ opacity: 0 }, { opacity: 1 }], { duration: FADE.in, delay: replace.arrivalMs, fill: 'both', easing: 'ease-out' }));
      pulsePod(s.refs.pod4, ctx, replace.arrivalMs);
    },
  },
];

export const init = makeInit(Scene, STEPS, { posterFirst: true });
