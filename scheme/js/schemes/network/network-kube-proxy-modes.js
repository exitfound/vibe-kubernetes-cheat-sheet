import { svg, g, rect, text } from '../../lib/svg.js';
import { arrowDefs, box, pod, arrow, pathArrow } from '../../lib/primitives.js';
import { valChip, setVal, pulsePod, routePacket, makeInit, clearHighlights, clearWires, setWire, BEAT, OPACITY, lightBoxAt } from '../../lib/network-kit.js';
// Design notes for this card: scheme/docs/CARDS.md#network-kube-proxy-modes


const CX = 600;                        // canvas centre: the chip strip is built on it
const SCHEME_L = 40, SCHEME_R = 1160;  // content edges, mirrored about CX

// Narration panel measured at bottom <= 280 (a longer narration invalidates this): the axis sits low
// enough that the Client Pod shell clears it.
const AXIS = 352;
const LANE_DY = 144;             // chain lane above the axis, hash lane the same distance below
const TOP_Y = AXIS - LANE_DY;    // 208: iptables chain lane
const BOT_Y = AXIS + LANE_DY;    // 496: IPVS hash lane
const ROW_H = 56;                // chain box height, centred on its lane
const IPVS_H = 88;               // hash box height, centred on its lane
const POD_DY = LANE_DY / 2;      // 72
const PODA_Y = AXIS - POD_DY;    // 280: upper backend, reached from above (chain comes down)
const PODB_Y = AXIS + POD_DY;    // 424: lower backend, reached from below (IPVS comes up)

const CLIENT_W = 196, CLIENT_H = 128;
const CLIENT_R = SCHEME_L + CLIENT_W;  // 248: right edge, where both entry lanes leave
const POD_W = 200, POD_H = 104;
const POD_X = SCHEME_R - POD_W;        // 948: backend column left edge

// Engine row: the iptables chain and the equally wide hash box. It starts at 420 because the chain
// boxes sit ABOVE the narration panel bottom, so they have to clear its right edge (x <= 397).
const ENGINE_L = 420, ENGINE_W = 492, ENGINE_GAP = 24;
const ENGINE_R = ENGINE_L + ENGINE_W;  // 912, shared right edge of the chain and the hash box
const KS = { x: ENGINE_L, w: 150 };
const SVC = { x: ENGINE_L + 150 + ENGINE_GAP, w: 150 };          // 594..744
const SEP = { x: ENGINE_L + 324 + ENGINE_GAP, w: ENGINE_R - (ENGINE_L + 348) }; // 768..912
const IPVS = { x: ENGINE_L, w: ENGINE_W };

const ENTRY_X = (CLIENT_R + ENGINE_L) / 2;   // 301: entry bend, centred in the client-to-engines gap
const TURN_X = (ENGINE_R + POD_X) / 2;       // 897: delivery turn, centred in the engines-to-Pod gap
const PAUSE = 240;          // dwell inside each chain box, so the walk reads as sequential

const CHIP_Y = 590, CHIP_H = 34, CHIP_W = 350;
const CHIP_GAP = (SCHEME_R - SCHEME_L - 3 * CHIP_W) / 2;   // 35
const chipX = (i) => SCHEME_L + i * (CHIP_W + CHIP_GAP);

// iptables hops: client -> KS (one zigzag), the two gaps, then SEP -> centred turn -> upper Pod.
const IPT_H1 = [[CLIENT_R, AXIS], [ENTRY_X, AXIS], [ENTRY_X, TOP_Y], [KS.x, TOP_Y]];
const IPT_H2 = [[KS.x + KS.w, TOP_Y], [SVC.x, TOP_Y]];
const IPT_H3 = [[SVC.x + SVC.w, TOP_Y], [SEP.x, TOP_Y]];
const IPT_H4 = [[ENGINE_R, TOP_Y], [TURN_X, TOP_Y], [TURN_X, PODA_Y], [POD_X, PODA_Y]];
// IPVS hops: client -> hash (one zigzag), then hash -> centred turn -> lower Pod (mirror of IPT_H4).
const IPVS_H1 = [[CLIENT_R, AXIS], [ENTRY_X, AXIS], [ENTRY_X, BOT_Y], [IPVS.x, BOT_Y]];
const IPVS_H2 = [[ENGINE_R, BOT_Y], [TURN_X, BOT_Y], [TURN_X, PODB_Y], [POD_X, PODB_Y]];

function podBlock({ x, y, w, h, label, ip }) {
  const shell = pod({ x, y, w, h, label, sublabel: ip, containers: 0, role: 'network' });
  const shellRect = shell.querySelector('.scheme-pod-rect');
  if (shellRect) shellRect.style.fill = 'rgba(255, 255, 255, 0.03)';
  const innerBox = box({ x: x + 18, y: y + 28, w: w - 36, h: 42, label: 'app', sublabel: 'eth0', role: 'network' });
  const group = g({});
  group.appendChild(shell);
  group.appendChild(innerBox);
  return { group, innerBox };
}

function clientBlock({ x, y, w, h }) {
  const shell = pod({ x, y, w, h, label: 'Client Pod', sublabel: '10.244.1.5', containers: 0, role: 'network' });
  const shellRect = shell.querySelector('.scheme-pod-rect');
  if (shellRect) shellRect.style.fill = 'rgba(255, 255, 255, 0.03)';
  const innerBox = box({ x: x + 18, y: y + 36, w: w - 36, h: 50, label: 'Socket', sublabel: 'dst 10.96.0.20', role: 'network' });
  const group = g({});
  group.appendChild(shell);
  group.appendChild(innerBox);
  return { group, innerBox };
}

// IPVS engine: a wide box whose body is a bucket grid, so it reads as one indexed hash table that
// does the work of the whole chain above it.
function ipvsEngine({ x, y, w, h }) {
  const grp = g({ class: 'scheme-box', 'data-role': 'network', transform: `translate(${x},${y})` });
  grp.appendChild(rect({ class: 'scheme-box-rect', x: 0, y: 0, width: w, height: h, rx: 6 }));
  grp.appendChild(text({ class: 'scheme-box-label', x: w / 2, y: 24, 'text-anchor': 'middle' }, ['IPVS hash table']));
  const n = 7, gx = 26, cw = (w - 52) / n, gy = 38, ch = 24;
  for (let c = 0; c < n; c++) {
    grp.appendChild(rect({
      class: 'scheme-grid-cell', x: gx + c * cw, y: gy, width: cw - 8, height: ch, rx: 3,
      fill: 'rgba(255,255,255,0.04)', stroke: 'currentColor', 'stroke-width': 1,
    }));
  }
  grp.appendChild(text({ class: 'scheme-box-sublabel', x: w / 2, y: h - 12, 'text-anchor': 'middle' }, ['virtual server -> real server']));
  return grp;
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
      'aria-label': 'kube-proxy backend selection as two routes: the iptables route walks a chain KUBE-SERVICES to KUBE-SVC to KUBE-SEP box by box that grows O(n) with Services, while the IPVS route resolves a backend in one O(1) in-kernel hash lookup',
      'data-style': 'outline',
    });
    root.appendChild(arrowDefs());

    const client = clientBlock({ x: SCHEME_L, y: AXIS - CLIENT_H / 2, w: CLIENT_W, h: CLIENT_H });

    // iptables lane: chain boxes + a single zigzag entry, two gap arrows and one centred delivery
    // arrow down to the upper Pod, grouped so the lane dims as one. Every wire rides a gap.
    const ks  = box({ x: KS.x,  y: TOP_Y - ROW_H / 2, w: KS.w,  h: ROW_H, label: 'KUBE-SERVICES', sublabel: 'match dst :80', role: 'network' });
    const svc = box({ x: SVC.x, y: TOP_Y - ROW_H / 2, w: SVC.w, h: ROW_H, label: 'KUBE-SVC', sublabel: 'statistic random', role: 'network' });
    const sep = box({ x: SEP.x, y: TOP_Y - ROW_H / 2, w: SEP.w, h: ROW_H, label: 'KUBE-SEP', sublabel: 'DNAT .2.7', role: 'network' });
    const iEntry = pathArrow({ points: IPT_H1, dashed: true, dim: true, role: 'network' });
    const iGap1 = arrow({ x1: KS.x + KS.w, y1: TOP_Y, x2: SVC.x, y2: TOP_Y, dashed: true, dim: true, role: 'network' });
    const iGap2 = arrow({ x1: SVC.x + SVC.w, y1: TOP_Y, x2: SEP.x, y2: TOP_Y, dashed: true, dim: true, role: 'network' });
    const iDeliver = pathArrow({ points: IPT_H4, dashed: true, dim: true, role: 'network' });
    const iptLane = g({});
    [ks, svc, sep, iEntry, iGap1, iGap2, iDeliver].forEach(el => iptLane.appendChild(el));

    const ipvs = ipvsEngine({ x: IPVS.x, y: BOT_Y - IPVS_H / 2, w: IPVS.w, h: IPVS_H });
    const vEntry = pathArrow({ points: IPVS_H1, dashed: true, dim: true, role: 'network' });
    const vDeliver = pathArrow({ points: IPVS_H2, dashed: true, dim: true, role: 'network' });
    const ipvsLane = g({});
    [ipvs, vEntry, vDeliver].forEach(el => ipvsLane.appendChild(el));

    const podA = podBlock({ x: POD_X, y: PODA_Y - POD_H / 2, w: POD_W, h: POD_H, label: 'Pod web', ip: '10.244.2.7:8080' });
    const podB = podBlock({ x: POD_X, y: PODB_Y - POD_H / 2, w: POD_W, h: POD_H, label: 'Pod web', ip: '10.244.3.9:8080' });

    const iptTag  = text({ class: 'scheme-label code dim', x: ENGINE_L + ENGINE_W / 2, y: TOP_Y + ROW_H, 'text-anchor': 'middle' }, [' ']);
    const ipvsTag = text({ class: 'scheme-label code dim', x: ENGINE_L + ENGINE_W / 2, y: BOT_Y - IPVS_H / 2 - 14, 'text-anchor': 'middle' }, [' ']);

    const iptChip  = valChip({ x: chipX(0), y: CHIP_Y, w: CHIP_W, h: CHIP_H, name: 'iptables', value: 'rule walk O(n)', role: 'network' });
    const pickChip = valChip({ x: chipX(1), y: CHIP_Y, w: CHIP_W, h: CHIP_H, name: 'selection', value: 'one backend', role: 'network' });
    const ipvsChip = valChip({ x: chipX(2), y: CHIP_Y, w: CHIP_W, h: CHIP_H, name: 'IPVS', value: 'hash O(1)', role: 'network' });

    const packetLayer = g({ id: 'packetLayer' });

    // Z-order: client + pods + lanes, then tags, then chips, then packets on top.
    root.appendChild(client.group);
    root.appendChild(podA.group);
    root.appendChild(podB.group);
    root.appendChild(iptLane);
    root.appendChild(ipvsLane);
    [iptTag, ipvsTag].forEach(el => root.appendChild(el));
    [iptChip, pickChip, ipvsChip].forEach(c => root.appendChild(c));
    root.appendChild(packetLayer);

    this.host.appendChild(root);
    this.refs = {
      svg: root, client: client.group, clientBox: client.innerBox,
      ks, svc, sep, ipvs, iptLane, ipvsLane,
      podA: podA.group, podABox: podA.innerBox, podB: podB.group, podBBox: podB.innerBox,
      iptChip, pickChip, ipvsChip, packetLayer,
      wires: { ipt: iptTag, ipvs: ipvsTag },
    };
  }

  reset() { this.build(); }
}

function clearHL(s) {
  clearHighlights(s, ['ks', 'svc', 'sep', 'ipvs', 'iptChip', 'pickChip', 'ipvsChip', 'clientBox', 'podABox', 'podBBox'],
    [s.refs.client, s.refs.podA, s.refs.podB]);
  s.refs.iptLane.style.opacity = '1';
  s.refs.ipvsLane.style.opacity = '1';
  s.refs.podA.style.opacity = '1';
  s.refs.podB.style.opacity = '1';
}

function baseComplexity(s) {
  setVal(s.refs.iptChip, 'rule walk O(n)');
  setVal(s.refs.ipvsChip, 'hash O(1)');
}

const STEPS = [
  {
    id: 'idle',
    duration: 1500,
    enter(s) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      baseComplexity(s);
      setVal(s.refs.pickChip, 'one backend');
    },
  },
  {
    id: 'iptables',
    duration: 5400,
    narration: 'In iptables mode the packet walks a chain box by box. It enters KUBE-SERVICES, jumps to the per-Service KUBE-SVC chain that picks an endpoint by statistic random, then a KUBE-SEP chain DNATs it to that Pod, here 10.244.2.7. The kernel walks these rules in sequence, so the chain grows O(n) with the number of Services.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      baseComplexity(s);
      s.refs.iptChip.classList.add('highlight');
      s.refs.pickChip.classList.add('highlight');
      setVal(s.refs.pickChip, 'statistic random');
      setWire(s, 'ipt', 'stops at every rule');
      s.refs.ipvsLane.style.opacity = String(OPACITY.notready);
      s.refs.podB.style.opacity = String(OPACITY.notready);
      if (ctx.reduced) {
        [s.refs.ks, s.refs.svc, s.refs.sep].forEach(b => b.classList.add('highlight'));
        s.refs.podABox.classList.add('highlight');
        return;
      }
      pulsePod(s.refs.client, ctx, 0);
      const a1 = routePacket(s, ctx, IPT_H1, { delay: BEAT.afterPulse, role: 'network' });
      lightBoxAt(s.refs.ks, ctx, a1.arrivalMs);
      const a2 = routePacket(s, ctx, IPT_H2, { delay: a1.arrivalMs + PAUSE, role: 'network' });
      lightBoxAt(s.refs.svc, ctx, a2.arrivalMs);
      const a3 = routePacket(s, ctx, IPT_H3, { delay: a2.arrivalMs + PAUSE, role: 'network' });
      lightBoxAt(s.refs.sep, ctx, a3.arrivalMs);
      const a4 = routePacket(s, ctx, IPT_H4, { delay: a3.arrivalMs + PAUSE, role: 'network' });
      pulsePod(s.refs.podA, ctx, a4.arrivalMs);
    },
  },
  {
    id: 'ipvs',
    duration: 3500,
    narration: 'In IPVS mode the same kind of connection skips the walk. The Service is a virtual server and its endpoints are real servers in an in-kernel hash table, so a backend is found in one constant-time lookup no matter how many Services exist, here 10.244.3.9, scheduled with real algorithms like round-robin and least-connection.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      baseComplexity(s);
      s.refs.ipvsChip.classList.add('highlight');
      s.refs.pickChip.classList.add('highlight');
      setVal(s.refs.pickChip, 'scheduler rr / lc');
      setWire(s, 'ipvs', 'one hash lookup, any scale');
      s.refs.iptLane.style.opacity = String(OPACITY.notready);
      s.refs.podA.style.opacity = String(OPACITY.notready);
      // The hash table is where the connection LANDS, so it lights on arrival below and only the
      // reduced path sets it here. It was lit at entry as well, which hid its own arrival.
      if (ctx.reduced) { s.refs.ipvs.classList.add('highlight'); s.refs.podBBox.classList.add('highlight'); return; }
      pulsePod(s.refs.client, ctx, 0);
      const b1 = routePacket(s, ctx, IPVS_H1, { delay: BEAT.afterPulse, role: 'network' });
      lightBoxAt(s.refs.ipvs, ctx, b1.arrivalMs);
      const b2 = routePacket(s, ctx, IPVS_H2, { delay: b1.arrivalMs + PAUSE, role: 'network' });
      pulsePod(s.refs.podB, ctx, b2.arrivalMs);
    },
  },
  {
    id: 'scale',
    duration: 2600,
    narration: 'Either mode turns the ClusterIP into a ready backend, so the only real difference is the lookup. With thousands of Services the iptables chain is thousands of rules long and every new Service slows the walk, while the IPVS hash stays one step. That constant-time behaviour is why large clusters long preferred IPVS, though Kubernetes deprecated the IPVS mode in v1.35 in favour of the newer nftables mode.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      [s.refs.ks, s.refs.svc, s.refs.sep].forEach(b => b.classList.add('highlight'));
      s.refs.ipvs.classList.add('highlight');
      s.refs.iptChip.classList.add('highlight');
      s.refs.ipvsChip.classList.add('highlight');
      setVal(s.refs.iptChip, 'thousands of rules');
      setVal(s.refs.ipvsChip, 'still one lookup');
      // The selection chip was the one chip this step did not write, so it carried the IPVS scheduler
      // from the step before. What is true HERE is that selection is the thing scale does not touch:
      // the chain walk grows with every Service, the choice of backend does not. It must not say the
      // two modes select the SAME way, because this card spends two steps establishing that they do
      // not (statistic random against a rr / lc scheduler), and it said exactly that for one commit.
      setVal(s.refs.pickChip, 'unchanged by scale');
      s.refs.pickChip.classList.add('highlight');
      setWire(s, 'ipt', 'grows with every Service');
      setWire(s, 'ipvs', 'constant time');
      if (ctx.reduced) return;
      [s.refs.wires.ipt, s.refs.wires.ipvs].forEach((t, i) => {
        t.style.opacity = '0';
        ctx.register(t.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 440, delay: 220 + i * 240, fill: 'forwards', easing: 'ease-out' }));
      });
    },
  },
];

export const init = makeInit(Scene, STEPS, { posterFirst: true });
