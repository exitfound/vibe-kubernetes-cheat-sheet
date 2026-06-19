import { svg, g, text } from '../lib/svg.js';
import { arrowDefs, box, arrow, pathArrow } from '../lib/primitives.js';
import { valChip, setVal, segmentPacket, routePacket, makeInit, clearHighlights, clearWires } from '../lib/network-kit.js';

// kube-proxy backend selection (viewBox 1200x640), no Pods: iptables walks a chain of rules on
// the left, IPVS uses an in-kernel hash table on the right. Motion is packets only; the one
// packet-less step (IPVS) gets a single box flash. Value chips never flash. Packets ride the
// vertical chain and the right-angle fan, stopping at each box edge.
const SEP_A = [[310, 372], [310, 386], [180, 386], [180, 400]]; // KUBE-SVC -> KUBE-SEP-AA
const SEP_B = [[310, 372], [310, 386], [440, 386], [440, 400]]; // KUBE-SVC -> KUBE-SEP-BB

function flashBox(s, ctx, key) {
  if (ctx.reduced) return;
  const el = s.refs[key];
  if (!el) return;
  ctx.register(el.animate(
    [{ filter: 'brightness(1)' }, { filter: 'brightness(1.5)' }, { filter: 'brightness(1)' }],
    { duration: 600, easing: 'ease-out' }
  ));
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
      'aria-label': 'kube-proxy backend selection: in iptables mode a packet walks KUBE-SERVICES into a per-Service chain that picks an endpoint by probability and DNATs it, while IPVS mode does the same with an in-kernel hash table and schedulers',
      'data-style': 'outline',
    });
    root.appendChild(arrowDefs());

    const iptTitle = text({ class: 'scheme-label code dim', x: 310, y: 205, 'text-anchor': 'middle', 'font-size': 12 }, ['iptables mode']);
    const ipvsTitle = text({ class: 'scheme-label code dim', x: 915, y: 205, 'text-anchor': 'middle', 'font-size': 12 }, ['IPVS mode']);
    [iptTitle, ipvsTitle].forEach(t => root.appendChild(t));

    const cSvc  = box({ x: 110, y: 222, w: 400, h: 64, label: 'KUBE-SERVICES', sublabel: 'match dst 10.96.0.10:80', cat: 'network' });
    const cSvcX = box({ x: 110, y: 308, w: 400, h: 64, label: 'KUBE-SVC-AB12', sublabel: 'per-Service · statistic random', cat: 'network' });
    const cSepA = box({ x: 70,  y: 400, w: 220, h: 74, label: 'KUBE-SEP-AA', sublabel: 'DNAT -> 10.244.2.7', cat: 'network' });
    const cSepB = box({ x: 330, y: 400, w: 220, h: 74, label: 'KUBE-SEP-BB', sublabel: 'DNAT -> 10.244.3.9', cat: 'network' });

    // entry into the chain, the KUBE-SERVICES -> KUBE-SVC jump, and the right-angle fan to the
    // two per-endpoint chains.
    const entry = arrow({ x1: 310, y1: 176, x2: 310, y2: 222, dashed: true, dim: true, color: 'network' });
    const jump  = arrow({ x1: 310, y1: 286, x2: 310, y2: 308, dashed: true, dim: true, color: 'network' });
    const fanA = pathArrow({ points: SEP_A, dashed: true, dim: true, color: 'network' });
    const fanB = pathArrow({ points: SEP_B, dashed: true, dim: true, color: 'network' });

    const ipvsBox = box({ x: 700, y: 222, w: 430, h: 250, cat: 'network' });
    const ipvsVs = valChip({ x: 730, y: 258, w: 370, h: 34, name: 'virtual server', value: '10.96.0.10:80', cat: 'network' });
    const ipvsR1 = valChip({ x: 730, y: 304, w: 370, h: 34, name: 'real server', value: '10.244.2.7 · rr', cat: 'network' });
    const ipvsR2 = valChip({ x: 730, y: 350, w: 370, h: 34, name: 'real server', value: '10.244.3.9 · rr', cat: 'network' });
    const ipvsNote = text({ class: 'scheme-label code dim', x: 915, y: 432, 'text-anchor': 'middle', 'font-size': 11 }, ['in-kernel hash · O(1) lookup']);

    const iptChip  = valChip({ x: 110, y: 520, w: 360, h: 34, name: 'iptables', value: 'sequential O(n)', cat: 'network' });
    const ipvsChip = valChip({ x: 500, y: 520, w: 300, h: 34, name: 'IPVS', value: 'hash O(1)', cat: 'network' });
    const pickChip = valChip({ x: 830, y: 520, w: 290, h: 34, name: 'selection', value: 'probability', cat: 'network' });

    const packetLayer = g({ id: 'packetLayer' });

    root.appendChild(cSvc);
    root.appendChild(cSvcX);
    root.appendChild(cSepA);
    root.appendChild(cSepB);
    root.appendChild(ipvsBox);
    [ipvsVs, ipvsR1, ipvsR2, ipvsNote].forEach(el => root.appendChild(el));
    [entry, jump, fanA, fanB].forEach(el => root.appendChild(el));
    [iptChip, ipvsChip, pickChip].forEach(c => root.appendChild(c));
    root.appendChild(packetLayer);

    this.host.appendChild(root);
    this.refs = {
      svg: root, cSvc, cSvcX, cSepA, cSepB, ipvsBox, ipvsVs, ipvsR1, ipvsR2,
      iptChip, ipvsChip, pickChip,
      packetLayer, wires: {},
    };
  }

  reset() { this.build(); }
}

function clearHL(s) {
  clearHighlights(s, ['cSvc', 'cSvcX', 'cSepA', 'cSepB', 'ipvsBox', 'ipvsVs', 'ipvsR1', 'ipvsR2', 'iptChip', 'ipvsChip', 'pickChip'], []);
}

const STEPS = [
  {
    id: 'idle',
    duration: 1500,
    narration: 'kube-proxy turns a ClusterIP into a real backend choice on every Node. It can do that two ways: by writing iptables rules, the long-standing default, or by programming the kernel IPVS load balancer. Both reach the same Pods, but they scale very differently.',
    enter(s) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      setVal(s.refs.pickChip, 'probability');
    },
  },
  {
    id: 'kube-services',
    duration: 2200,
    narration: 'In iptables mode a packet destined for the ClusterIP first enters the top-level KUBE-SERVICES chain. A rule there matches the destination 10.96.0.10:80 and jumps to the chain that belongs to this specific Service.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      s.refs.cSvc.classList.add('highlight');
      s.refs.iptChip.classList.add('highlight');
      if (ctx.reduced) return;
      // Packet walks in from above and stops at the chain box edge; the box lights, never flashes.
      segmentPacket(s, ctx, { from: [310, 176], to: [310, 222], cat: 'network' });
    },
  },
  {
    id: 'svc-chain',
    duration: 2200,
    narration: 'The per-Service chain KUBE-SVC-AB12 holds one jump rule per endpoint. The order matters: with iptables the kernel walks these rules in sequence, so a cluster with thousands of Services builds very long chains the packet has to traverse.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      s.refs.cSvcX.classList.add('highlight');
      s.refs.iptChip.classList.add('highlight');
      if (ctx.reduced) return;
      segmentPacket(s, ctx, { from: [310, 286], to: [310, 308], cat: 'network' });
    },
  },
  {
    id: 'pick-dnat',
    duration: 2500,
    narration: 'Each endpoint rule uses the statistic module with mode random and a probability, so the first rule fires with chance 1/N, the next with 1/(N-1), and so on, giving an even spread. The chosen KUBE-SEP chain then DNATs the packet to that Pod IP, here 10.244.2.7:8080.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      s.refs.cSvcX.classList.add('highlight');
      s.refs.cSepA.classList.add('highlight');
      s.refs.pickChip.classList.add('highlight');
      setVal(s.refs.pickChip, 'random · 1/N');
      if (ctx.reduced) return;
      // The chosen rule fires: the packet rides the right-angle fan to KUBE-SEP-AA and stops at it.
      routePacket(s, ctx, SEP_A, { cat: 'network' });
    },
  },
  {
    id: 'ipvs',
    duration: 2400,
    narration: 'IPVS mode does the same job without the rule walk. The Service is a virtual server and its endpoints are real servers in an in-kernel hash table, so backend lookup is constant time no matter how many Services exist, and IPVS adds real schedulers like round-robin and least-connection instead of plain probability.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      s.refs.ipvsBox.classList.add('highlight');
      s.refs.ipvsVs.classList.add('highlight');
      s.refs.ipvsR1.classList.add('highlight');
      s.refs.ipvsChip.classList.add('highlight');
      s.refs.pickChip.classList.add('highlight');
      setVal(s.refs.pickChip, 'scheduler · rr / lc');
      // Packet-less step, no Pod: a single flash on the IPVS box only. The chips just light.
      flashBox(s, ctx, 'ipvsBox');
    },
  },
];

export const init = makeInit(Scene, STEPS, { posterFirst: true });
