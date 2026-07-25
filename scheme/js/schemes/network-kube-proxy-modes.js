import { svg, g, rect, text } from '../lib/svg.js';
import { arrowDefs, box, pod, arrow, pathArrow } from '../lib/primitives.js';
import { valChip, setVal, pulsePod, routePacket, makeInit, clearHighlights, clearWires, setWire, BEAT } from '../lib/network-kit.js';
// Design notes for this card: scheme/docs/CARDS.md#network-kube-proxy-modes


const AXIS = 322;
const TOP_Y = 178;          // iptables chain lane (axis - 144)
const BOT_Y = 466;          // IPVS hash lane (axis + 144)
const ENTRY_X = 335;        // entry bend, centred between the client (right edge 266) and engines (404)
const TURN_X = 931;         // delivery turn, centred between the engines (right edge 896) and Pod (966)
const POD_X = 966;
const POD_H = 104;
const PODA_Y = 250;         // upper backend, reached from above (chain comes down)
const PODB_Y = 394;         // lower backend, reached from below (IPVS comes up): both symmetric about AXIS
const PAUSE = 240;          // dwell inside each chain box, so the walk reads as sequential

const KS = { x: 404, w: 150 }, SVC = { x: 578, w: 150 }, SEP = { x: 752, w: 144 };
const ENGINE_R = SEP.x + SEP.w; // 896, shared right edge of the chain and the hash box
const IPVS = { x: KS.x, w: ENGINE_R - KS.x }; // 404..896

// iptables hops: client -> KS (one zigzag), the two gaps, then SEP -> centred turn -> upper Pod.
const IPT_H1 = [[266, AXIS], [ENTRY_X, AXIS], [ENTRY_X, TOP_Y], [KS.x, TOP_Y]];
const IPT_H2 = [[KS.x + KS.w, TOP_Y], [SVC.x, TOP_Y]];
const IPT_H3 = [[SVC.x + SVC.w, TOP_Y], [SEP.x, TOP_Y]];
const IPT_H4 = [[ENGINE_R, TOP_Y], [TURN_X, TOP_Y], [TURN_X, PODA_Y], [POD_X, PODA_Y]];
// IPVS hops: client -> hash (one zigzag), then hash -> centred turn -> lower Pod (mirror of IPT_H4).
const IPVS_H1 = [[266, AXIS], [ENTRY_X, AXIS], [ENTRY_X, BOT_Y], [IPVS.x, BOT_Y]];
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
  const shell = pod({ x, y, w, h, label: 'client Pod', sublabel: '10.244.1.5', containers: 0, role: 'network' });
  const shellRect = shell.querySelector('.scheme-pod-rect');
  if (shellRect) shellRect.style.fill = 'rgba(255, 255, 255, 0.03)';
  const innerBox = box({ x: x + 18, y: y + 36, w: w - 36, h: 50, label: 'socket', sublabel: 'dst 10.96.0.10', role: 'network' });
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
      fill: 'rgba(255,255,255,0.04)', stroke: 'currentColor', 'stroke-width': 1, opacity: 0.4,
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

    const client = clientBlock({ x: 70, y: AXIS - 64, w: 196, h: 128 });

    // iptables lane: chain boxes + a single zigzag entry, two gap arrows and one centred delivery
    // arrow down to the upper Pod, grouped so the lane dims as one. Every wire rides a gap.
    const ks  = box({ x: KS.x,  y: TOP_Y - 28, w: KS.w,  h: 56, label: 'KUBE-SERVICES', sublabel: 'match dst :80', role: 'network' });
    const svc = box({ x: SVC.x, y: TOP_Y - 28, w: SVC.w, h: 56, label: 'KUBE-SVC', sublabel: 'statistic random', role: 'network' });
    const sep = box({ x: SEP.x, y: TOP_Y - 28, w: SEP.w, h: 56, label: 'KUBE-SEP', sublabel: 'DNAT .2.7', role: 'network' });
    const iEntry = pathArrow({ points: IPT_H1, dashed: true, dim: true, role: 'network' });
    const iGap1 = arrow({ x1: KS.x + KS.w, y1: TOP_Y, x2: SVC.x, y2: TOP_Y, dashed: true, dim: true, role: 'network' });
    const iGap2 = arrow({ x1: SVC.x + SVC.w, y1: TOP_Y, x2: SEP.x, y2: TOP_Y, dashed: true, dim: true, role: 'network' });
    const iDeliver = pathArrow({ points: IPT_H4, dashed: true, dim: true, role: 'network' });
    const iptLane = g({});
    [ks, svc, sep, iEntry, iGap1, iGap2, iDeliver].forEach(el => iptLane.appendChild(el));

    const ipvs = ipvsEngine({ x: IPVS.x, y: BOT_Y - 44, w: IPVS.w, h: 88 });
    const vEntry = pathArrow({ points: IPVS_H1, dashed: true, dim: true, role: 'network' });
    const vDeliver = pathArrow({ points: IPVS_H2, dashed: true, dim: true, role: 'network' });
    const ipvsLane = g({});
    [ipvs, vEntry, vDeliver].forEach(el => ipvsLane.appendChild(el));

    const podA = podBlock({ x: POD_X, y: PODA_Y - POD_H / 2, w: 200, h: POD_H, label: 'Pod web', ip: '10.244.2.7:8080' });
    const podB = podBlock({ x: POD_X, y: PODB_Y - POD_H / 2, w: 200, h: POD_H, label: 'Pod web', ip: '10.244.3.9:8080' });

    const iptTag  = text({ class: 'scheme-label code dim', x: 650, y: TOP_Y + 56, 'text-anchor': 'middle', 'font-size': 11 }, [' ']);
    const ipvsTag = text({ class: 'scheme-label code dim', x: 650, y: BOT_Y - 58, 'text-anchor': 'middle', 'font-size': 11 }, [' ']);

    const iptChip  = valChip({ x: 70,  y: 590, w: 345, h: 34, name: 'iptables', value: 'rule walk O(n)', role: 'network' });
    const pickChip = valChip({ x: 445, y: 590, w: 345, h: 34, name: 'selection', value: 'one backend', role: 'network' });
    const ipvsChip = valChip({ x: 820, y: 590, w: 345, h: 34, name: 'IPVS', value: 'hash O(1)', role: 'network' });

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

function lightAt(boxEl, ctx, delay) {
  if (!boxEl) return;
  if (ctx.reduced || delay <= 0) { boxEl.classList.add('highlight'); return; }
  const a = boxEl.animate([{ opacity: 1 }, { opacity: 1 }], { duration: 1, delay });
  a.onfinish = () => boxEl.classList.add('highlight');
  ctx.register(a);
}

function baseComplexity(s) {
  setVal(s.refs.iptChip, 'rule walk O(n)');
  setVal(s.refs.ipvsChip, 'hash O(1)');
}

const STEPS = [
  {
    id: 'idle',
    duration: 1500,
    narration: 'A connection to the Service ClusterIP 10.96.0.10 has to become one of the backend Pods. kube-proxy does that on every Node, and it can resolve the backend two ways that reach a Pod but scale very differently.',
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
    duration: 3600,
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
      s.refs.ipvsLane.style.opacity = '0.2';
      s.refs.podB.style.opacity = '0.4';
      if (ctx.reduced) {
        [s.refs.ks, s.refs.svc, s.refs.sep].forEach(b => b.classList.add('highlight'));
        s.refs.podABox.classList.add('highlight');
        return;
      }
      pulsePod(s.refs.client, ctx, 0);
      const a1 = routePacket(s, ctx, IPT_H1, { delay: BEAT.afterPulse, role: 'network' });
      lightAt(s.refs.ks, ctx, a1.arrivalMs);
      const a2 = routePacket(s, ctx, IPT_H2, { delay: a1.arrivalMs + PAUSE, role: 'network' });
      lightAt(s.refs.svc, ctx, a2.arrivalMs);
      const a3 = routePacket(s, ctx, IPT_H3, { delay: a2.arrivalMs + PAUSE, role: 'network' });
      lightAt(s.refs.sep, ctx, a3.arrivalMs);
      const a4 = routePacket(s, ctx, IPT_H4, { delay: a3.arrivalMs + PAUSE, role: 'network' });
      pulsePod(s.refs.podA, ctx, a4.arrivalMs);
    },
  },
  {
    id: 'ipvs',
    duration: 2600,
    narration: 'In IPVS mode the same kind of connection skips the walk. The Service is a virtual server and its endpoints are real servers in an in-kernel hash table, so a backend is found in one constant-time lookup no matter how many Services exist, here 10.244.3.9, scheduled with real algorithms like round-robin and least-connection.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      baseComplexity(s);
      s.refs.ipvs.classList.add('highlight');
      s.refs.ipvsChip.classList.add('highlight');
      s.refs.pickChip.classList.add('highlight');
      setVal(s.refs.pickChip, 'scheduler rr / lc');
      setWire(s, 'ipvs', 'one hash lookup, any scale');
      s.refs.iptLane.style.opacity = '0.2';
      s.refs.podA.style.opacity = '0.4';
      if (ctx.reduced) { s.refs.podBBox.classList.add('highlight'); return; }
      pulsePod(s.refs.client, ctx, 0);
      const b1 = routePacket(s, ctx, IPVS_H1, { delay: BEAT.afterPulse, role: 'network' });
      lightAt(s.refs.ipvs, ctx, b1.arrivalMs);
      const b2 = routePacket(s, ctx, IPVS_H2, { delay: b1.arrivalMs + PAUSE, role: 'network' });
      pulsePod(s.refs.podB, ctx, b2.arrivalMs);
    },
  },
  {
    id: 'scale',
    duration: 2600,
    narration: 'Either mode turns the ClusterIP into a ready backend, so the only real difference is the lookup. With thousands of Services the iptables chain is thousands of rules long and every new Service slows the walk, while the IPVS hash stays one step. That constant-time behaviour is why large clusters switch kube-proxy to IPVS.',
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
      setWire(s, 'ipt', 'grows with every Service');
      setWire(s, 'ipvs', 'constant time');
      if (ctx.reduced) return;
      [s.refs.wires.ipt, s.refs.wires.ipvs].forEach((t, i) => {
        t.style.opacity = '0';
        ctx.register(t.animate([{ opacity: 0 }, { opacity: 0.85 }], { duration: 440, delay: 220 + i * 240, fill: 'forwards', easing: 'ease-out' }));
      });
    },
  },
];

export const init = makeInit(Scene, STEPS, { posterFirst: true });
