import { svg, g } from '../../lib/svg.js';
import { arrowDefs, box, arrow, podShell } from '../../lib/primitives.js';
import { valChip, setVal, setBoxSublabel, setPodSublabel, pulsePod, segmentPacket, routeDur, makeInit, clearHighlights, BEAT, makeRidingLabel, lightBoxAt } from './network-kit.js';
// Design notes for this card: ./CARDS.md#network-dualstack


const CONFIG_X = 480, CONFIG_W = 600;        // band spans Service..Pod only (480..1080), clear of the client
const CONFIG_Y = 136, CONFIG_H = 80;
const CONFIG_BOTTOM = CONFIG_Y + CONFIG_H;   // 216
const CONFIG_CX = CONFIG_X + CONFIG_W / 2;   // 780
const ROW_Y = 286, ROW_H = 150;              // client / Service / Pod row
const LANE_Y = ROW_Y + ROW_H / 2;            // 361: data lane through the row centres
const CLIENT_X = 120, CLIENT_W = 300;        // client Pod: 120..420
const SVC_X = 480, SVC_W = 240;              // Service web: 480..720
const POD_X = 780, POD_W = 300;              // Pod web: 780..1080
const ROW_RIGHT = POD_X + POD_W;             // 1080
// The band applies to BOTH the Service and the Pod, so its two drops are a mirrored pair about the
// BAND centre rather than one tap per target centre, each still landing well inside its target face.
const TAP_DX = 165;
const TAP_SVC = CONFIG_CX - TAP_DX;          // 615, into the Service top edge
const TAP_POD = CONFIG_CX + TAP_DX;          // 945, into the Pod top edge
// Info chips span the whole row, client left edge to Pod right edge, so the strip centres on x=600:
// two ClusterIP chips on a top row, then the ipFamilyPolicy chip stretched the full width below.
const CHIP_X = CLIENT_X, CHIP_SPAN = ROW_RIGHT - CLIENT_X, CHIP_GAP = 20;
const CHIP_W = (CHIP_SPAN - CHIP_GAP) / 2;   // 470
const CHIP_Y = 472, CHIP_Y2 = 516;

// Each static wire and the ball that rides it come from the same points array.
const DROP_SVC = [[TAP_SVC, CONFIG_BOTTOM], [TAP_SVC, ROW_Y]];
const DROP_POD = [[TAP_POD, CONFIG_BOTTOM], [TAP_POD, ROW_Y]];
const HOP_CLIENT = [[CLIENT_X + CLIENT_W, LANE_Y], [SVC_X, LANE_Y]];   // client -> Service ClusterIP
const HOP_SVC = [[SVC_X + SVC_W, LANE_Y], [POD_X, LANE_Y]];            // Service -> Pod (after DNAT)

class Scene {
  constructor(host) { this.host = host; this.refs = {}; this.build(); }

  build() {
    this.host.replaceChildren();
    this.refs = {};
    const root = svg({
      class: 'diagram',
      viewBox: '0 0 1200 640',
      preserveAspectRatio: 'xMidYMid meet',
      'aria-label': 'Dual-stack IPv4 and IPv6: with both families enabled a Pod gets one address from each family, a Service gets one ClusterIP per family ordered by ipFamilies, and the client connects over whichever family it prefers',
      'data-style': 'outline',
    });
    root.appendChild(arrowDefs());

    // Config band spans Service..Pod (480..1080), centred on x=780, label centred.
    const config = box({ x: CONFIG_X, y: CONFIG_Y, w: CONFIG_W, h: CONFIG_H, label: 'dual-stack enabled', sublabel: 'Pod + Service CIDRs: IPv4 and IPv6', role: 'network' });
    // Centred row: two identical Pod shells aligned to the band edges flank the Service at x=600.
    const client = clientBlock({ x: CLIENT_X, y: ROW_Y, w: CLIENT_W, h: ROW_H });
    const svc = box({ x: SVC_X, y: ROW_Y, w: SVC_W, h: ROW_H, label: 'Service web', sublabel: 'ipFamilyPolicy', role: 'network' });
    const podRef = podBlock({ x: POD_X, y: ROW_Y, w: POD_W, h: ROW_H, label: 'Pod web', ip: 'IPv4 10.244.1.5' });

    const wClient = arrow({ x1: HOP_CLIENT[0][0], y1: LANE_Y, x2: HOP_CLIENT[1][0], y2: LANE_Y, dashed: true, dim: true });
    const wSvcPod = arrow({ x1: HOP_SVC[0][0], y1: LANE_Y, x2: HOP_SVC[1][0], y2: LANE_Y, dashed: true, dim: true });
    const wConfig = arrow({ x1: TAP_SVC, y1: CONFIG_BOTTOM, x2: TAP_SVC, y2: ROW_Y, dashed: true, dim: true });
    const wConfigPod = arrow({ x1: TAP_POD, y1: CONFIG_BOTTOM, x2: TAP_POD, y2: ROW_Y, dashed: true, dim: true });

    // Top row: the two ClusterIP chips split the row width. Second row: ipFamilyPolicy stretched the
    // full width beneath them, so the three sit aligned under the client, Service and Pod above.
    const v4Chip = valChip({ x: CHIP_X, y: CHIP_Y, w: CHIP_W, h: 34, name: 'clusterIP v4', value: '10.96.0.20', role: 'network' });
    const v6Chip = valChip({ x: CHIP_X + CHIP_W + CHIP_GAP, y: CHIP_Y, w: CHIP_W, h: 34, name: 'clusterIP v6', value: 'none', role: 'network' });
    const famChip = valChip({ x: CHIP_X, y: CHIP_Y2, w: CHIP_SPAN, h: 34, name: 'ipFamilyPolicy', value: 'SingleStack', role: 'network' });

    const packetLayer = g({ id: 'packetLayer' });

    // Z-order: config + service + client + pod, then wires ABOVE, then chips, then packets.
    root.appendChild(config);
    root.appendChild(svc);
    root.appendChild(client.group);
    root.appendChild(podRef.group);
    [wClient, wSvcPod, wConfig, wConfigPod].forEach(el => root.appendChild(el));
    [famChip, v4Chip, v6Chip].forEach(c => root.appendChild(c));
    root.appendChild(packetLayer);

    this.host.appendChild(root);
    this.refs = {
      svg: root, config, svc, client: client.group, clientBox: client.innerBox,
      pod: podRef.group, podBox: podRef.innerBox,
      famChip, v4Chip, v6Chip, packetLayer, wires: {},
    };
  }

  reset() { this.build(); }
}

function clientBlock({ x, y, w, h }) {
  const shell = podShell({ x, y, w, h, label: 'Client Pod', sublabel: 'dual-stack', containers: 0, role: 'network' });
  const innerBox = box({ x: x + 16, y: y + 36, w: w - 32, h: 50, label: 'app', sublabel: 'to Service web', role: 'network' });
  const group = g({});
  group.appendChild(shell);
  group.appendChild(innerBox);
  return { group, innerBox };
}

function podBlock({ x, y, w, h, label, ip }) {
  const shell = podShell({ x, y, w, h, label, sublabel: ip, containers: 0, role: 'network' });
  const innerBox = box({ x: x + 22, y: y + 42, w: w - 44, h: 56, label: 'app', sublabel: 'eth0', role: 'network' });
  const group = g({});
  group.appendChild(shell);
  group.appendChild(innerBox);
  return { group, innerBox };
}

function clearHL(s) {
  clearHighlights(s, ['config', 'svc', 'famChip', 'v4Chip', 'v6Chip', 'clientBox', 'podBox'],
    [s.refs.client, s.refs.pod]);
}

// The tag that rides a ball on this card. Constants preserved from its hand-rolled copy.
const ridingLabel = makeRidingLabel({ role: 'network', dy: -16, inMs: 140, hold: 150 });

const STEPS = [
  {
    id: 'idle',
    duration: 1500,
    enter(s) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      setVal(s.refs.famChip, 'SingleStack');
      setVal(s.refs.v4Chip, '10.96.0.20');
      setVal(s.refs.v6Chip, 'none');
      setPodSublabel(s.refs.pod, 'IPv4 10.244.1.5');
      setBoxSublabel(s.refs.clientBox, 'to Service web');
    },
  },
  {
    id: 'enable',
    duration: 2300,
    narration: 'Dual-stack is enabled cluster-wide: the API server and controller-manager take an IPv4 and an IPv6 service CIDR, the controller-manager and kube-proxy take both pod CIDRs, the Kubelet takes a Node IP of each family, and the CNI has to support both. Nothing has a second address yet, but the address space for one now exists.',
    enter(s) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      s.refs.config.classList.add('highlight');
      setVal(s.refs.famChip, 'SingleStack');
    },
  },
  {
    id: 'pod-two-ips',
    duration: 2500,
    narration: 'When the Pod is created, the CNI now allocates one address from each family, an IPv4 from the v4 pod CIDR and an IPv6 from the v6 pod CIDR. Both live on the same eth0, and the Pod can speak either protocol.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      // The dual-stack config (its CNI plus the v6 pod CIDR) is the source of the new address, so the
      // band stays lit as the allocation flows out of it.
      s.refs.config.classList.add('highlight');
      setPodSublabel(s.refs.pod, 'IPv4 10.244.1.5 . IPv6 fd00::1:5');
      if (ctx.reduced) { s.refs.podBox.classList.add('highlight'); return; }
      // Down-arrow: the IPv6 address drops from the config band into the Pod, which pulses on arrival.
      // This is the CNI allocating the second family onto eth0.
      const drop = segmentPacket(s, ctx, { from: DROP_POD[0], to: DROP_POD[1], delay: 0, role: 'network' });
      pulsePod(s.refs.pod, ctx, drop.arrivalMs);
    },
  },
  {
    id: 'service-two-clusterips',
    duration: 2500,
    narration: 'A Service with ipFamilyPolicy PreferDualStack is given one ClusterIP per family, ordered by its ipFamilies list, here IPv4 then IPv6. Each ClusterIP is backed by the same set of Pods, just reached over a different protocol.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      s.refs.config.classList.add('highlight');
      s.refs.famChip.classList.add('highlight');
      s.refs.v4Chip.classList.add('highlight');
      s.refs.v6Chip.classList.add('highlight');
      setVal(s.refs.famChip, 'PreferDualStack');
      setVal(s.refs.v6Chip, 'fd00:96::a');
      if (ctx.reduced) { s.refs.svc.classList.add('highlight'); return; }
      // Down-arrow: the second ClusterIP drops from the config band into the Service.
      const pkt = segmentPacket(s, ctx, { from: DROP_SVC[0], to: DROP_SVC[1], delay: 0, role: 'network' });
      lightBoxAt(s.refs.svc, ctx, pkt.arrivalMs);
    },
  },
  {
    id: 'client-chooses',
    duration: 3300,
    narration: 'A client resolving the Service gets both an A and an AAAA record, and connects over whichever family it prefers. Here it dials the IPv6 ClusterIP, and kube-proxy forwards the connection to the Pod IPv6 address. The same Service is reachable both ways.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      s.refs.v6Chip.classList.add('highlight');
      setVal(s.refs.famChip, 'PreferDualStack');
      setVal(s.refs.v6Chip, 'fd00:96::a');
      setBoxSublabel(s.refs.clientBox, 'dials IPv6 fd00:96::a');
      if (ctx.reduced) { s.refs.svc.classList.add('highlight'); s.refs.podBox.classList.add('highlight'); return; }
      // The Service is the first hop's destination, so it lights when the client packet lands on it
      // and forwards one beat later, rather than being lit before the client has dialled.
      const HOP1 = HOP_CLIENT, HOP2 = HOP_SVC;
      pulsePod(s.refs.client, ctx, 0);
      const h1 = segmentPacket(s, ctx, { from: HOP1[0], to: HOP1[1], delay: BEAT.afterPulse, role: 'network' });
      ridingLabel(s, ctx, 'dst fd00:96::a', HOP1, { delay: BEAT.afterPulse, dur: routeDur(HOP1), easing: 'linear' });
      lightBoxAt(s.refs.svc, ctx, h1.arrivalMs);
      const h2 = segmentPacket(s, ctx, { from: HOP2[0], to: HOP2[1], delay: h1.arrivalMs + BEAT.afterHop, role: 'network' });
      ridingLabel(s, ctx, 'dst fd00::1:5', HOP2, { delay: h1.arrivalMs + BEAT.afterHop, dur: routeDur(HOP2), easing: 'linear' });
      pulsePod(s.refs.pod, ctx, h2.arrivalMs);
    },
  },
];

export const init = makeInit(Scene, STEPS, { posterFirst: true });
