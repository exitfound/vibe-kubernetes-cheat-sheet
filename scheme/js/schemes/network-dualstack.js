import { svg, g } from '../lib/svg.js';
import { arrowDefs, box, pod, arrow } from '../lib/primitives.js';
import { valChip, setVal, setBoxSublabel, setPodSublabel, pulsePod, segmentPacket, routeDur, makeInit, clearHighlights, BEAT, makeRidingLabel} from '../lib/network-kit.js';
// Design notes for this card: scheme/docs/CARDS.md#network-dualstack


const CONFIG_X = 480, CONFIG_W = 600;        // band spans Service..Pod only (480..1080), clear of the client
const CONFIG_Y = 136, CONFIG_H = 80;
const CONFIG_BOTTOM = CONFIG_Y + CONFIG_H;   // 216
const ROW_Y = 286, ROW_H = 150;              // client / Service / Pod row
const LANE_Y = ROW_Y + ROW_H / 2;            // 361: data lane through the row centres
const POD_CX = 930;                          // Pod web centre (x 780..1080): the config->Pod drop
// Info chips aligned under the band (480..1080): two ClusterIP chips on a top row, then the
// ipFamilyPolicy chip stretched full-width on a row below, all centred on the band.
const CHIP_X = 480, CHIP_SPAN = 600, CHIP_GAP = 20;
const CHIP_W = (CHIP_SPAN - CHIP_GAP) / 2;   // 290
const CHIP_Y = 472, CHIP_Y2 = 516;

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
    const client = clientBlock({ x: 120, y: ROW_Y, w: 300, h: ROW_H });
    const svc = box({ x: 480, y: ROW_Y, w: 240, h: ROW_H, label: 'Service web', sublabel: 'ipFamilyPolicy', role: 'network' });
    const podRef = podBlock({ x: 780, y: ROW_Y, w: 300, h: ROW_H, label: 'Pod web', ip: 'IPv4 10.244.1.5' });

    const wClient = arrow({ x1: 420, y1: LANE_Y, x2: 480, y2: LANE_Y, dashed: true, dim: true });
    const wSvcPod = arrow({ x1: 720, y1: LANE_Y, x2: 780, y2: LANE_Y, dashed: true, dim: true });
    const wConfig = arrow({ x1: 600, y1: CONFIG_BOTTOM, x2: 600, y2: ROW_Y, dashed: true, dim: true });
    const wConfigPod = arrow({ x1: POD_CX, y1: CONFIG_BOTTOM, x2: POD_CX, y2: ROW_Y, dashed: true, dim: true });

    // Top row: the two ClusterIP chips split the band width. Second row: ipFamilyPolicy stretched the
    // full band width beneath them, so the three sit aligned and centred under the band.
    const v4Chip = valChip({ x: CHIP_X, y: CHIP_Y, w: CHIP_W, h: 34, name: 'clusterIP v4', value: '10.96.0.10', role: 'network' });
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
  const shell = pod({ x, y, w, h, label: 'client Pod', sublabel: 'dual-stack', containers: 0, role: 'network' });
  const shellRect = shell.querySelector('.scheme-pod-rect');
  if (shellRect) shellRect.style.fill = 'rgba(255, 255, 255, 0.03)';
  const innerBox = box({ x: x + 16, y: y + 36, w: w - 32, h: 50, label: 'app', sublabel: 'to Service web', role: 'network' });
  const group = g({});
  group.appendChild(shell);
  group.appendChild(innerBox);
  return { group, innerBox };
}

function podBlock({ x, y, w, h, label, ip }) {
  const shell = pod({ x, y, w, h, label, sublabel: ip, containers: 0, role: 'network' });
  const shellRect = shell.querySelector('.scheme-pod-rect');
  if (shellRect) shellRect.style.fill = 'rgba(255, 255, 255, 0.03)';
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
    narration: 'A single-stack cluster gives every Pod one IPv4 address and every Service one IPv4 ClusterIP. Dual-stack runs IPv4 and IPv6 side by side, so each of these gains a second address from the other family.',
    enter(s) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      setVal(s.refs.famChip, 'SingleStack');
      setVal(s.refs.v4Chip, '10.96.0.10');
      setVal(s.refs.v6Chip, 'none');
      setPodSublabel(s.refs.pod, 'IPv4 10.244.1.5');
      setBoxSublabel(s.refs.clientBox, 'to Service web');
    },
  },
  {
    id: 'enable',
    duration: 2300,
    narration: 'Dual-stack is enabled cluster-wide: the apiserver, controller-manager, kube-proxy, kubelet and CNI are all configured with both an IPv4 and an IPv6 pod CIDR and service CIDR. Nothing has a second address yet, but the address space for one now exists.',
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
      const drop = segmentPacket(s, ctx, { from: [POD_CX, CONFIG_BOTTOM], to: [POD_CX, ROW_Y], delay: 0, role: 'network' });
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
      s.refs.svc.classList.add('highlight');
      s.refs.famChip.classList.add('highlight');
      s.refs.v4Chip.classList.add('highlight');
      s.refs.v6Chip.classList.add('highlight');
      setVal(s.refs.famChip, 'PreferDualStack');
      setVal(s.refs.v6Chip, 'fd00:96::a');
      if (ctx.reduced) return;
      // Down-arrow: the second ClusterIP drops from the config band into the Service.
      segmentPacket(s, ctx, { from: [600, CONFIG_BOTTOM], to: [600, ROW_Y], delay: 0, role: 'network' });
    },
  },
  {
    id: 'client-chooses',
    duration: 2600,
    narration: 'A client resolving the Service gets both an A and an AAAA record, and connects over whichever family it prefers. Here it dials the IPv6 ClusterIP, and kube-proxy forwards the connection to the Pod IPv6 address. The same Service is reachable both ways.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      s.refs.svc.classList.add('highlight');
      s.refs.v6Chip.classList.add('highlight');
      setVal(s.refs.famChip, 'PreferDualStack');
      setVal(s.refs.v6Chip, 'fd00:96::a');
      setBoxSublabel(s.refs.clientBox, 'dials IPv6 fd00:96::a');
      if (ctx.reduced) { s.refs.podBox.classList.add('highlight'); return; }
      const HOP1 = [[420, LANE_Y], [480, LANE_Y]];   // client -> Service ClusterIP
      const HOP2 = [[720, LANE_Y], [780, LANE_Y]];   // Service -> Pod (after DNAT)
      pulsePod(s.refs.client, ctx, 0);
      const h1 = segmentPacket(s, ctx, { from: HOP1[0], to: HOP1[1], delay: BEAT.afterPulse, role: 'network' });
      ridingLabel(s, ctx, 'dst fd00:96::a', HOP1, { delay: BEAT.afterPulse, dur: routeDur(HOP1), easing: 'linear' });
      const h2 = segmentPacket(s, ctx, { from: HOP2[0], to: HOP2[1], delay: h1.arrivalMs + BEAT.afterHop, role: 'network' });
      ridingLabel(s, ctx, 'dst fd00::1:5', HOP2, { delay: h1.arrivalMs + BEAT.afterHop, dur: routeDur(HOP2), easing: 'linear' });
      pulsePod(s.refs.pod, ctx, h2.arrivalMs);
    },
  },
];

export const init = makeInit(Scene, STEPS, { posterFirst: true });
