import { svg, g, rect, text } from '../lib/svg.js';
import { arrowDefs, pod, node, box, chainList, setChainActive, arrow, pathArrow } from '../lib/primitives.js';
import { valChip, setVal, setBoxSublabel, pulsePod, clearPodHighlight, connectorPacket, topPacket, makeInit } from '../lib/scheme-kit.js';

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
      'aria-label': 'DaemonSet controller: keeps exactly one Pod on every matching node, adds a Pod when a node joins and removes one when a node leaves',
      'data-style': 'outline',
    });
    root.appendChild(arrowDefs());

    const daemonset = box({ x: 320, y: 40, w: 220, h: 80, label: 'DaemonSet', sublabel: '', cat: 'control' });
    const apiserver = box({ x: 580, y: 40, w: 220, h: 80, label: 'ApiServer', sublabel: 'watch Nodes · Pod CRUD', cat: 'control' });

    root.appendChild(arrow({ x1: 540, y1: 65, x2: 580, y2: 65, dim: true, dashed: true, color: 'control' }));
    root.appendChild(arrow({ x1: 580, y1: 95, x2: 540, y2: 95, dim: true, dashed: true, color: 'control' }));

    const wireReq = text({ class: 'scheme-label code dim', x: 560, y: 148, 'text-anchor': 'middle', 'font-size': 9 }, [' ']);
    root.appendChild(wireReq);

    const desiredChip = valChip({ x: 830, y: 40,  w: 350, h: 32, name: 'desiredNumberScheduled', value: '3' });
    const currentChip = valChip({ x: 830, y: 82,  w: 350, h: 32, name: 'currentNumberScheduled', value: '0' });
    const readyChip   = valChip({ x: 830, y: 124, w: 350, h: 32, name: 'numberReady',            value: '0' });
    const focusChip   = valChip({ x: 830, y: 166, w: 350, h: 32, name: 'focus',                  value: 'selector: app=fluentd' });
    [desiredChip, currentChip, readyChip, focusChip].forEach(c => root.appendChild(c));

    const chain = chainList({
      x: 320, y: 220, w: 480, rowH: 32, gap: 10,
      items: [
        '1. spec      ·  one Pod per node, selector + tolerations',
        '2. place     ·  create a Pod on every matching node',
        '3. node join ·  new node, desiredNumberScheduled++, add Pod',
        '4. update    ·  RollingUpdate maxUnavailable=1, one by one',
        '5. drain     ·  node gone, its Pod deleted, not rescheduled',
      ],
      cat: 'control',
    });

    // Four node slots across the bottom band. node-4 starts hidden and joins in step 3.
    const NODE_DEFS = [
      { key: 'node1El', x: 320, label: 'node-1' },
      { key: 'node2El', x: 538, label: 'node-2' },
      { key: 'node3El', x: 756, label: 'node-3' },
      { key: 'node4El', x: 974, label: 'node-4' },
    ];
    const nodeEls = {};
    NODE_DEFS.forEach(d => { nodeEls[d.key] = node({ x: d.x, y: 468, w: 206, h: 162, label: d.label }); });
    nodeEls.node4El.style.opacity = '0';

    const POD_XS = [320, 538, 756, 974];
    const podWrappers = [];
    const podBoxes = [];
    POD_XS.forEach((nx, i) => {
      const shell = pod({ x: nx + 12, y: 506, w: 182, h: 106, label: 'fluentd', sublabel: '', containers: 0, cat: 'workloads' });
      const shellRect = shell.querySelector('.scheme-pod-rect');
      if (shellRect) shellRect.style.fill = 'rgba(255, 255, 255, 0.03)';

      const innerBox = box({ x: nx + 22, y: 534, w: 162, h: 52, label: 'fluentd', sublabel: 'log agent', cat: 'workloads' });

      const wrap = g({ id: `pod${i + 1}` });
      wrap.style.opacity = '0';
      wrap.appendChild(shell);
      wrap.appendChild(innerBox);
      podWrappers.push(wrap);
      podBoxes.push(innerBox);
    });
    const [pod1, pod2, pod3, pod4] = podWrappers;
    const [pod1Box, pod2Box, pod3Box, pod4Box] = podBoxes;

    const connector = pathArrow({
      points: [[320, 80], [280, 80], [280, 550], [320, 550]],
      dim: true, dashed: true, color: 'control',
    });
    root.appendChild(connector);

    const packetLayer = g({ id: 'packetLayer' });
    root.appendChild(packetLayer);

    root.appendChild(chain);
    NODE_DEFS.forEach(d => root.appendChild(nodeEls[d.key]));
    [pod1, pod2, pod3, pod4].forEach(p => root.appendChild(p));
    root.appendChild(apiserver);
    root.appendChild(daemonset);

    this.host.appendChild(root);
    this.refs = {
      svg: root,
      daemonset, apiserver, chain, connector,
      desiredChip, currentChip, readyChip, focusChip,
      node1El: nodeEls.node1El, node2El: nodeEls.node2El, node3El: nodeEls.node3El, node4El: nodeEls.node4El,
      pod1, pod2, pod3, pod4, pod1Box, pod2Box, pod3Box, pod4Box,
      packetLayer,
      wires: { req: wireReq },
    };
  }

  reset() { this.build(); }
}

function clearHL(s) {
  ['daemonset','apiserver','desiredChip','currentChip','readyChip','focusChip','pod1Box','pod2Box','pod3Box','pod4Box']
    .forEach(k => s.refs[k].classList.remove('highlight'));
  s.refs.chain.querySelectorAll('.scheme-chip').forEach(r => r.classList.remove('highlight'));
  ['pod1','pod2','pod3','pod4'].forEach(k => clearPodHighlight(s.refs[k]));
}
function clearWires(s) { Object.values(s.refs.wires).forEach(t => { t.textContent = ''; }); }
function setWire(s, key, txt) { if (s.refs.wires[key]) s.refs.wires[key].textContent = txt; }

// pulsePod / clearPodHighlight / connectorPacket / topPacket are imported from ../lib/scheme-kit.js

const STEPS = [
  {
    id: 'idle',
    duration: 1500,
    narration: 'A DaemonSet named fluentd is declared with a node selector and a RollingUpdate strategy. It computes desiredNumberScheduled from the nodes that match the selector, three here, and since no Pods exist yet currentNumberScheduled is 0.',
    enter(s) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      s.refs.pod1.style.opacity = '0';
      s.refs.pod2.style.opacity = '0';
      s.refs.pod3.style.opacity = '0';
      s.refs.pod4.style.opacity = '0';
      s.refs.node2El.style.opacity = '1';
      s.refs.node4El.style.opacity = '0';
      setVal(s.refs.desiredChip, '3');
      setVal(s.refs.currentChip, '0');
      setVal(s.refs.readyChip, '0');
      setVal(s.refs.focusChip, 'selector: app=fluentd');
      setChainActive(s.refs.chain, -1);
    },
  },
  {
    id: 'place',
    duration: 2500,
    narration: 'The controller sees three matching nodes and zero Pods, so it creates one Pod on each through the apiserver and the local kubelet starts it. A DaemonSet places exactly one Pod per node, never a second, so the count follows the nodes themselves rather than a fixed replica number you set.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      s.refs.node4El.style.opacity = '0';
      s.refs.pod4.style.opacity = '0';
      setVal(s.refs.desiredChip, '3');
      setVal(s.refs.currentChip, '3');
      setVal(s.refs.readyChip, '3');
      setVal(s.refs.focusChip, 'one Pod per matching node');
      setWire(s, 'req', 'Create one Pod per matching node');
      s.refs.daemonset.classList.add('highlight');
      s.refs.apiserver.classList.add('highlight');
      s.refs.currentChip.classList.add('highlight');
      s.refs.readyChip.classList.add('highlight');
      setChainActive(s.refs.chain, 1);
      // Pin final opacities so a step change does not revert the Pods to the built 0.
      s.refs.pod1.style.opacity = '1';
      s.refs.pod2.style.opacity = '1';
      s.refs.pod3.style.opacity = '1';
      if (ctx.reduced) { ['pod1Box','pod2Box','pod3Box'].forEach(k => s.refs[k].classList.add('highlight')); return; }
      topPacket(s, ctx);
      // Create reaches the node band, the three Pods materialize and pulse together.
      connectorPacket(s, ctx, { delay: 800, dur: 1100 });
      const ARRIVAL = 1900;
      ctx.register(s.refs.pod1.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 600, delay: ARRIVAL, fill: 'both', easing: 'ease-out' }));
      ctx.register(s.refs.pod2.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 600, delay: ARRIVAL, fill: 'both', easing: 'ease-out' }));
      ctx.register(s.refs.pod3.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 600, delay: ARRIVAL, fill: 'both', easing: 'ease-out' }));
      pulsePod(s.refs.pod1, ctx, ARRIVAL);
      pulsePod(s.refs.pod2, ctx, ARRIVAL);
      pulsePod(s.refs.pod3, ctx, ARRIVAL);
    },
  },
  {
    id: 'node-join',
    duration: 2400,
    narration: 'A new worker node-4 joins the cluster and turns Ready. The DaemonSet controller watches Node objects, recomputes desiredNumberScheduled to four, and creates a Pod on node-4 alone. No other node is disturbed. Automatic per-node placement is the whole reason a DaemonSet exists.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setVal(s.refs.desiredChip, '4');
      setVal(s.refs.currentChip, '4');
      setVal(s.refs.readyChip, '4');
      setVal(s.refs.focusChip, 'node-4 joined, Pod added');
      setWire(s, 'req', 'Watch Node added · desiredNumberScheduled 3 to 4');
      s.refs.daemonset.classList.add('highlight');
      s.refs.apiserver.classList.add('highlight');
      s.refs.desiredChip.classList.add('highlight');
      s.refs.currentChip.classList.add('highlight');
      setChainActive(s.refs.chain, 2);
      // Pin final: the three existing Pods plus node-4 and its new Pod are present.
      s.refs.pod1.style.opacity = '1';
      s.refs.pod2.style.opacity = '1';
      s.refs.pod3.style.opacity = '1';
      s.refs.node4El.style.opacity = '1';
      s.refs.pod4.style.opacity = '1';
      if (ctx.reduced) { s.refs.pod4Box.classList.add('highlight'); return; }
      // The node joins first (its rect fades in), then the controller creates a Pod
      // on it, which materializes and pulses when the create reaches the node.
      s.refs.node4El.style.opacity = '0';
      s.refs.pod4.style.opacity = '0';
      ctx.register(s.refs.node4El.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 600, delay: 200, fill: 'both', easing: 'ease-out' }));
      topPacket(s, ctx);
      connectorPacket(s, ctx, { delay: 800, dur: 1100 });
      ctx.register(s.refs.pod4.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 600, delay: 1900, fill: 'both', easing: 'ease-out' }));
      pulsePod(s.refs.pod4, ctx, 1900);
    },
  },
  {
    id: 'update',
    duration: 2300,
    narration: 'The image is bumped from fluentd v1 to v2. The RollingUpdate strategy with maxUnavailable=1 deletes and recreates the Pods one node at a time, never taking more than one down at once, so log collection keeps running on the rest. The OnDelete strategy would instead wait until you delete each Pod by hand.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setVal(s.refs.desiredChip, '4');
      setVal(s.refs.currentChip, '4');
      setVal(s.refs.readyChip, '3 / 4 updating');
      setVal(s.refs.focusChip, 'RollingUpdate · maxUnavailable=1');
      setWire(s, 'req', 'RollingUpdate · maxUnavailable=1 · v1 to v2');
      s.refs.daemonset.classList.add('highlight');
      s.refs.readyChip.classList.add('highlight');
      s.refs.focusChip.classList.add('highlight');
      setChainActive(s.refs.chain, 3);
      // All four Pods stay placed, node-4 stays present.
      s.refs.pod1.style.opacity = '1';
      s.refs.pod2.style.opacity = '1';
      s.refs.pod3.style.opacity = '1';
      s.refs.pod4.style.opacity = '1';
      s.refs.node4El.style.opacity = '1';
      if (ctx.reduced) { s.refs.pod1Box.classList.add('highlight'); return; }
      // One node at a time: the update travels controller -> ApiServer -> node-1 down the
      // dashed connector, and only when it arrives does node-1 react. pod1 pulses as its
      // Pod is recreated on the new version, while the rest keep serving. Mirrors the
      // surge step of workloads-rolling-update (ball first, pulse on arrival).
      topPacket(s, ctx);
      connectorPacket(s, ctx, { delay: 800, dur: 1100 });
      pulsePod(s.refs.pod1, ctx, 1900);
    },
  },
  {
    id: 'drain',
    duration: 2400,
    narration: 'node-2 is drained and leaves the cluster. Its DaemonSet Pod is deleted and, unlike a Deployment replica, it is not recreated on another node. A DaemonSet keeps exactly one Pod per node and every surviving node already has one, so desiredNumberScheduled simply drops back to three.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setVal(s.refs.desiredChip, '3');
      setVal(s.refs.currentChip, '3');
      setVal(s.refs.readyChip, '3');
      setVal(s.refs.focusChip, 'node-2 gone, Pod not rescheduled');
      setWire(s, 'req', 'Node-2 removed · delete its Pod · no reschedule');
      s.refs.daemonset.classList.add('highlight');
      s.refs.desiredChip.classList.add('highlight');
      setChainActive(s.refs.chain, 4);
      // Pin final: node-2 and its Pod are gone, the other three Pods and node-4 remain.
      s.refs.pod1.style.opacity = '1';
      s.refs.pod3.style.opacity = '1';
      s.refs.pod4.style.opacity = '1';
      s.refs.node4El.style.opacity = '1';
      s.refs.pod2.style.opacity = '0';
      s.refs.node2El.style.opacity = '0.4';
      if (ctx.reduced) return;
      // The delete reaches node-2 over the connector. pod2 pulses then fades out and
      // node-2 dims as it leaves the cluster.
      s.refs.pod2.style.opacity = '1';
      s.refs.node2El.style.opacity = '1';
      connectorPacket(s, ctx, { delay: 0, dur: 1100 });
      pulsePod(s.refs.pod2, ctx, 1100);
      ctx.register(s.refs.pod2.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 700, delay: 1100, fill: 'both', easing: 'ease-in' }));
      ctx.register(s.refs.node2El.animate([{ opacity: 1 }, { opacity: 0.4 }], { duration: 700, delay: 1100, fill: 'both', easing: 'ease-in' }));
    },
  },
];

export const init = makeInit(Scene, STEPS);
