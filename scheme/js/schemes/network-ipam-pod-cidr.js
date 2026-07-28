import { svg, g } from '../lib/svg.js';
import { arrowDefs, box, pod, node, arrow, pathArrow } from '../lib/primitives.js';
import { valChip, setVal, setPodSublabel, pulsePod, segmentPacket, routePacket, makeInit, clearHighlights, lightBoxAt } from '../lib/network-kit.js';
// Design notes for this card: scheme/docs/CARDS.md#network-ipam-pod-cidr


// Geometry. Panel measured 2026-07-27: right <= 397, bottom <= 255. The three Node frames span
// 80..1120 and are centred on the canvas, the control-plane column stands on their common centre.
const NODE_Y = 312, NODE_W = 300, NODE_H = 290;
const NODE_X = [80, 450, 820];
const NODE_CX = NODE_X.map(x => x + NODE_W / 2);            // 230, 600, 970
const SPINE_X = NODE_CX[1];                                 // 600: controller column and Node-2 drop

const CFG_X = 460, CFG_W = 280, CFG_Y = 44, CFG_H = 64;     // the cluster pod CIDR pool
const KCM_Y = 150, KCM_H = 72;
const KCM_BOTTOM = KCM_Y + KCM_H;                           // 222: where every allocation leaves

const SLICE_W = 260, SLICE_H = 34, SLICE_Y = 350;
const SLICE_X = NODE_X.map(x => x + (NODE_W - SLICE_W) / 2);// 100, 470, 840
const SLICE_BOTTOM = SLICE_Y + SLICE_H;                     // 384: where the IPAM hands an IP down

const POD_Y = 442, POD_W = 200, POD_H = 130;
const POD_X = NODE_CX.map(cx => cx - POD_W / 2);            // 130, 500, 870

const BRANCH_Y = 264;                                       // the bus the flanking allocations turn on
// controller -> a Node slice: straight down the spine for Node-2, down and out along the bus for the
// flanking two. Wire and ball come from the same array.
const allocTo = (cx) => [[SPINE_X, KCM_BOTTOM], [SPINE_X, BRANCH_Y], [cx, BRANCH_Y], [cx, SLICE_Y]];
const ALLOC1 = allocTo(NODE_CX[0]);
const ALLOC3 = allocTo(NODE_CX[2]);
const ALLOC2 = [[SPINE_X, KCM_BOTTOM], [SPINE_X, SLICE_Y]];        // Node-2 sits on the spine
const CFG_DROP = [[SPINE_X, CFG_Y + CFG_H], [SPINE_X, KCM_Y]];     // the pool the controller reads
const IPAM1 = [[NODE_CX[0], SLICE_BOTTOM], [NODE_CX[0], POD_Y]];   // Node-1 IPAM -> its Pod
const IPAM2 = [[SPINE_X, SLICE_BOTTOM], [SPINE_X, POD_Y]];         // Node-2 IPAM -> its Pod

// One Pod as a translucent shell wrapping an eth0 container box, grouped so pulsePod
// animates both rects together. Returns { group, innerBox }.
function podBlock({ x, y, label, ip }) {
  const shell = pod({ x, y, w: POD_W, h: POD_H, label, sublabel: ip, containers: 0, role: 'network' });
  const shellRect = shell.querySelector('.scheme-pod-rect');
  if (shellRect) shellRect.style.fill = 'rgba(255, 255, 255, 0.03)';
  const innerBox = box({ x: x + 20, y: y + 37, w: POD_W - 40, h: 56, label: 'app', sublabel: 'eth0', role: 'network' });
  const group = g({});
  group.appendChild(shell);
  group.appendChild(innerBox);
  return { group, innerBox };
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
      'aria-label': 'IPAM and Pod CIDR allocation: the controller-manager carves a non-overlapping slice of the cluster pod CIDR for each Node, and the CNI IPAM on a Node hands Pod IPs out of its own slice',
      'data-style': 'outline',
    });
    root.appendChild(arrowDefs());

    const clusterBox = box({ x: CFG_X, y: CFG_Y, w: CFG_W, h: CFG_H, label: 'Cluster Pod CIDR', sublabel: '10.244.0.0/16', role: 'network' });
    const kcm = box({ x: CFG_X, y: KCM_Y, w: CFG_W, h: KCM_H, label: 'controller-manager', role: 'network' });

    const node1 = node({ x: NODE_X[0], y: NODE_Y, w: NODE_W, h: NODE_H, label: 'Node-1' });
    const node2 = node({ x: NODE_X[1], y: NODE_Y, w: NODE_W, h: NODE_H, label: 'Node-2' });
    const node3 = node({ x: NODE_X[2], y: NODE_Y, w: NODE_W, h: NODE_H, label: 'Node-3' });

    const slice1 = valChip({ x: SLICE_X[0], y: SLICE_Y, w: SLICE_W, h: SLICE_H, name: 'node.spec.podCIDR', value: 'pending', role: 'network' });
    const slice2 = valChip({ x: SLICE_X[1], y: SLICE_Y, w: SLICE_W, h: SLICE_H, name: 'node.spec.podCIDR', value: 'pending', role: 'network' });
    const slice3 = valChip({ x: SLICE_X[2], y: SLICE_Y, w: SLICE_W, h: SLICE_H, name: 'node.spec.podCIDR', value: 'pending', role: 'network' });
    [slice1, slice2, slice3].forEach(c => root.appendChild(c));

    const a = podBlock({ x: POD_X[0], y: POD_Y, label: 'Pod', ip: 'IP pending' });
    // The Node-2 pod proves uniqueness on the final step; it stays hidden until then.
    const b = podBlock({ x: POD_X[1], y: POD_Y, label: 'Pod', ip: 'IP pending' });
    b.group.style.opacity = '0';

    const cfgArrow   = arrow({ x1: SPINE_X, y1: CFG_Y + CFG_H, x2: SPINE_X, y2: KCM_Y, dashed: true, dim: true });
    const allocArrow1 = pathArrow({ points: ALLOC1, dashed: true, dim: true });
    const allocArrow2 = arrow({ x1: SPINE_X, y1: KCM_BOTTOM, x2: SPINE_X, y2: SLICE_Y, dashed: true, dim: true });
    const allocArrow3 = pathArrow({ points: ALLOC3, dashed: true, dim: true });
    const ipamArrow  = arrow({ x1: NODE_CX[0], y1: SLICE_BOTTOM, x2: NODE_CX[0], y2: POD_Y, dashed: true, dim: true });
    const ipam2Arrow = arrow({ x1: SPINE_X, y1: SLICE_BOTTOM, x2: SPINE_X, y2: POD_Y, dashed: true, dim: true });
    ipam2Arrow.style.opacity = '0';

    const packetLayer = g({ id: 'packetLayer' });

    root.appendChild(node1);
    root.appendChild(node2);
    root.appendChild(node3);
    root.appendChild(slice1);
    root.appendChild(slice2);
    root.appendChild(slice3);
    root.appendChild(a.group);
    root.appendChild(b.group);
    root.appendChild(clusterBox);
    root.appendChild(kcm);
    // arrows on top of the blocks so the dim wires read clearly, then packets on top.
    [cfgArrow, allocArrow1, allocArrow2, allocArrow3, ipamArrow, ipam2Arrow].forEach(el => root.appendChild(el));
    root.appendChild(packetLayer);

    this.host.appendChild(root);
    this.refs = {
      svg: root, clusterBox, kcm, node1, node2, node3,
      slice1, slice2, slice3, podA: a.group, podABox: a.innerBox,
      podB: b.group, podBBox: b.innerBox, ipam2Arrow,
      packetLayer, wires: {},
    };
  }

  reset() { this.build(); }
}

function clearHL(s) {
  clearHighlights(s, ['clusterBox', 'kcm', 'slice1', 'slice2', 'slice3', 'podABox', 'podBBox'], [s.refs.podA, s.refs.podB]);
  // The Node-2 pod and its IPAM arrow are revealed only on the final uniqueness step.
  s.refs.podB.style.opacity = '0';
  s.refs.ipam2Arrow.style.opacity = '0';
}

const STEPS = [
  {
    id: 'idle',
    duration: 1500,
    narration: 'The whole cluster shares one large pod address space, here 10.244.0.0/16. For Pod IPs to stay unique and routable, that space has to be split up so no two Nodes ever hand out the same address.',
    enter(s) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      setVal(s.refs.slice1, 'pending');
      setVal(s.refs.slice2, 'pending');
      setVal(s.refs.slice3, 'pending');
      setPodSublabel(s.refs.podA, 'IP pending');
    },
  },
  {
    id: 'cluster-cidr',
    duration: 2000,
    narration: 'The cluster pod CIDR is configured once, on the controller-manager, with the --cluster-cidr flag. It is the single pool every Pod IP in the cluster will eventually come from, and on its own it belongs to no Node yet.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      s.refs.clusterBox.classList.add('highlight');
      if (ctx.reduced) { s.refs.kcm.classList.add('highlight'); return; }
      // The pool registers into the controller-manager; arrival ripple marks the kcm.
      const pkt = segmentPacket(s, ctx, { from: CFG_DROP[0], to: CFG_DROP[1], dur: 450, role: 'network' });
      lightBoxAt(s.refs.kcm, ctx, pkt.arrivalMs);
    },
  },
  {
    id: 'allocate',
    duration: 2600,
    narration: 'With --allocate-node-cidrs set, the controller-manager carves a smaller, non-overlapping block out of the pool for every Node and writes it into node.spec.podCIDR. Here each Node gets its own /24, so Node-1 owns 10.244.1.0/24, Node-2 owns 10.244.2.0/24 and Node-3 owns 10.244.3.0/24.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      s.refs.kcm.classList.add('highlight');
      s.refs.slice1.classList.add('highlight');
      s.refs.slice2.classList.add('highlight');
      s.refs.slice3.classList.add('highlight');
      setVal(s.refs.slice1, '10.244.1.0/24');
      setVal(s.refs.slice2, '10.244.2.0/24');
      setVal(s.refs.slice3, '10.244.3.0/24');
      if (ctx.reduced) return;
      const dur = 1100;
      routePacket(s, ctx, ALLOC2, { dur, fadeIn: true, role: 'network' });
      routePacket(s, ctx, ALLOC1, { dur, fadeIn: true, role: 'network' });
      routePacket(s, ctx, ALLOC3, { dur, fadeIn: true, role: 'network' });
    },
  },
  {
    id: 'ipam',
    duration: 2400,
    narration: 'When a Pod is scheduled to Node-1, the CNI IPAM running there picks the next free address strictly out of that Node slice, 10.244.1.0/24, and assigns 10.244.1.5. It never reaches outside its own block, which is exactly what stops two Nodes from colliding.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      s.refs.slice1.classList.add('highlight');
      setVal(s.refs.slice1, '10.244.1.0/24');
      setVal(s.refs.slice2, '10.244.2.0/24');
      setVal(s.refs.slice3, '10.244.3.0/24');
      setPodSublabel(s.refs.podA, 'IP 10.244.1.5');
      if (ctx.reduced) { s.refs.podABox.classList.add('highlight'); return; }
      // IPAM hands an address from the slice down to the Pod (packet first, then the
      // Pod pulses on arrival: it is the receiver, so no blink-first here).
      const give = segmentPacket(s, ctx, { from: IPAM1[0], to: IPAM1[1], dur: 550, role: 'network' });
      pulsePod(s.refs.podA, ctx, give.arrivalMs);
    },
  },
  {
    id: 'unique',
    duration: 2600,
    narration: 'Every other Node assigns the same way, out of its own slice. A Pod scheduled to Node-2 gets 10.244.2.8 from 10.244.2.0/24, a different /24 that can never overlap the addresses on Node-1. So every Pod IP is unique across the whole cluster, which is what lets any Pod be reached directly while routing only has to track which Node owns which /24.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      s.refs.slice1.classList.add('highlight');
      s.refs.slice2.classList.add('highlight');
      s.refs.slice3.classList.add('highlight');
      setVal(s.refs.slice1, '10.244.1.0/24');
      setVal(s.refs.slice2, '10.244.2.0/24');
      setVal(s.refs.slice3, '10.244.3.0/24');
      setPodSublabel(s.refs.podA, 'IP 10.244.1.5');
      setPodSublabel(s.refs.podB, 'IP 10.244.2.8');
      if (ctx.reduced) {
        s.refs.podB.style.opacity = '1';
        s.refs.ipam2Arrow.style.opacity = '1';
        s.refs.podBBox.classList.add('highlight');
        return;
      }
      ctx.register(s.refs.podB.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 350, fill: 'forwards', easing: 'ease-out' }));
      ctx.register(s.refs.ipam2Arrow.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 350, fill: 'forwards', easing: 'ease-out' }));
      // After the pod appears, Node-2 IPAM hands its address down (packet first, then the pod
      // pulses on arrival, the receiver).
      const give = segmentPacket(s, ctx, { from: IPAM2[0], to: IPAM2[1], delay: 420, dur: 550, role: 'network' });
      pulsePod(s.refs.podB, ctx, give.arrivalMs);
    },
  },
];

export const init = makeInit(Scene, STEPS, { posterFirst: true });
