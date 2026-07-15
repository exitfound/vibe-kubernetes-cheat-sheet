import { svg, g, text } from '../lib/svg.js';
import { arrowDefs, box, pod, arrow, animateAlong } from '../lib/primitives.js';
import { valChip, setVal, setBoxSublabel, setPodSublabel, pulsePod, segmentPacket, routeDur, makeInit, clearHighlights, BEAT } from '../lib/network-kit.js';

// Layout zones (viewBox 1200x640): the narration overlay is a fixed panel over the top-left
// (about x<=250, y<=152). The dual-stack config band sits below it (y=200) and now spans only the
// Service..Pod half (480..1080), so it no longer reaches over the client Pod on the left. The
// client / Service / Pod web row sits lower still (y=350). The config band drops into BOTH the
// Service (its ClusterIP) and the Pod (its address). The bottom info chips align under the band:
// the two ClusterIP chips on one row, the ipFamilyPolicy chip stretched full-width on a row below.
// Dual-stack means two parallel address families: the Pod gains a second IP, the Service gains a
// second ClusterIP, the client picks a family at connect time.
// Standard contract: only Pods pulse, boxes light via .highlight; the config band feeds the Pod and
// the Service with short packets dropping from it, packet endpoints match the static wires.
const CONFIG_X = 480, CONFIG_W = 600;        // band spans Service..Pod only (480..1080), clear of the client
// Whole scheme raised ~10% of the 640 viewBox (64px) versus the earlier layout. The band lives at
// x>=480, clear of the narration overlay (x<=250), so it can sit higher without touching it. The
// content stays horizontally centred (client + Pod symmetric about x=600); only the vertical offset
// changes.
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
    const config = box({ x: CONFIG_X, y: CONFIG_Y, w: CONFIG_W, h: CONFIG_H, label: 'dual-stack enabled', sublabel: 'Pod + Service CIDRs: IPv4 and IPv6', cat: 'network' });
    // Centred row: two identical Pod shells aligned to the band edges flank the Service at x=600.
    const client = clientBlock({ x: 120, y: ROW_Y, w: 300, h: ROW_H });
    const svc = box({ x: 480, y: ROW_Y, w: 240, h: ROW_H, label: 'Service web', sublabel: 'ipFamilyPolicy', cat: 'network' });
    const podRef = podBlock({ x: 780, y: ROW_Y, w: 300, h: ROW_H, label: 'Pod web', ip: 'IPv4 10.244.1.5' });

    // Dim dashed wires (uniform style): client -> Service -> Pod data lane (equal-length hops), plus
    // two drops from the config band into the Service (ClusterIP) and the Pod (CNI address). Each
    // drop shares its points with the per-step packet that rides it.
    const wClient = arrow({ x1: 420, y1: LANE_Y, x2: 480, y2: LANE_Y, dashed: true, dim: true });
    const wSvcPod = arrow({ x1: 720, y1: LANE_Y, x2: 780, y2: LANE_Y, dashed: true, dim: true });
    const wConfig = arrow({ x1: 600, y1: CONFIG_BOTTOM, x2: 600, y2: ROW_Y, dashed: true, dim: true });
    const wConfigPod = arrow({ x1: POD_CX, y1: CONFIG_BOTTOM, x2: POD_CX, y2: ROW_Y, dashed: true, dim: true });

    // Top row: the two ClusterIP chips split the band width. Second row: ipFamilyPolicy stretched the
    // full band width beneath them, so the three sit aligned and centred under the band.
    const v4Chip = valChip({ x: CHIP_X, y: CHIP_Y, w: CHIP_W, h: 34, name: 'clusterIP v4', value: '10.96.0.10', cat: 'network' });
    const v6Chip = valChip({ x: CHIP_X + CHIP_W + CHIP_GAP, y: CHIP_Y, w: CHIP_W, h: 34, name: 'clusterIP v6', value: 'none', cat: 'network' });
    const famChip = valChip({ x: CHIP_X, y: CHIP_Y2, w: CHIP_SPAN, h: 34, name: 'ipFamilyPolicy', value: 'SingleStack', cat: 'network' });

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
  const shell = pod({ x, y, w, h, label: 'client Pod', sublabel: 'dual-stack', containers: 0, cat: 'network' });
  const shellRect = shell.querySelector('.scheme-pod-rect');
  if (shellRect) shellRect.style.fill = 'rgba(255, 255, 255, 0.03)';
  const innerBox = box({ x: x + 16, y: y + 36, w: w - 32, h: 50, label: 'app', sublabel: 'to Service web', cat: 'network' });
  const group = g({});
  group.appendChild(shell);
  group.appendChild(innerBox);
  return { group, innerBox };
}

function podBlock({ x, y, w, h, label, ip }) {
  const shell = pod({ x, y, w, h, label, sublabel: ip, containers: 0, cat: 'network' });
  const shellRect = shell.querySelector('.scheme-pod-rect');
  if (shellRect) shellRect.style.fill = 'rgba(255, 255, 255, 0.03)';
  const innerBox = box({ x: x + 22, y: y + 42, w: w - 44, h: 56, label: 'app', sublabel: 'eth0', cat: 'network' });
  const group = g({});
  group.appendChild(shell);
  group.appendChild(innerBox);
  return { group, innerBox };
}

function clearHL(s) {
  clearHighlights(s, ['config', 'svc', 'famChip', 'v4Chip', 'v6Chip', 'clientBox', 'podBox'],
    [s.refs.client, s.refs.pod]);
}

// A small label that rides ALONG with the packet on the same hop and timing, used to show the
// destination address the connection carries. It lives in the packet layer but is not a
// .scheme-packet, so smoke counts are unaffected. Mirrors network-model's riding-label pattern.
// The easing MUST match the ball it rides: segmentPacket hops are linear, routePacket legs are
// eased. animateAlong defaults to ease-in-out, so a linear hop has to pass easing:'linear'
// explicitly or the tag slides off the ball mid-flight and only rejoins it at the endpoints.
function ridingLabel(s, ctx, txt, points, { delay = 0, dur = null, easing = 'ease-in-out' } = {}) {
  if (ctx.reduced) return;
  const d = dur == null ? routeDur(points) : dur;
  const lbl = text({ class: 'scheme-box-sublabel', x: 0, y: -16, 'text-anchor': 'middle', 'data-cat': 'network' }, [txt]);
  lbl.style.opacity = '0';
  s.refs.packetLayer.appendChild(lbl);
  ctx.register(lbl.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 140, delay: Math.max(0, delay - 140), fill: 'forwards', easing: 'ease-out' }));
  ctx.register(animateAlong(lbl, points, { duration: d, delay, easing }));  // same path + timing + easing as the packet
  ctx.register(lbl.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 180, delay: delay + d + 150, fill: 'forwards', easing: 'ease-in' }));
}

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
      // Enabling the feature is a config change with no per-object traffic, so the band just lights
      // up steadily: no flash, no packet. ipFamilyPolicy is a per-Service field and stays SingleStack
      // until a Service opts in, so that chip does not change yet.
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
      const drop = segmentPacket(s, ctx, { from: [POD_CX, CONFIG_BOTTOM], to: [POD_CX, ROW_Y], delay: 0, cat: 'network' });
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
      // The Service opts into dual-stack here: ipFamilyPolicy becomes PreferDualStack and it is given
      // a second ClusterIP from the v6 service CIDR. The config band is the source of that ClusterIP
      // (the service CIDR lives there), so it stays lit too, matching the Pod step.
      s.refs.config.classList.add('highlight');
      s.refs.svc.classList.add('highlight');
      s.refs.famChip.classList.add('highlight');
      s.refs.v4Chip.classList.add('highlight');
      s.refs.v6Chip.classList.add('highlight');
      setVal(s.refs.famChip, 'PreferDualStack');
      setVal(s.refs.v6Chip, 'fd00:96::a');
      if (ctx.reduced) return;
      // Down-arrow: the second ClusterIP drops from the config band into the Service.
      segmentPacket(s, ctx, { from: [600, CONFIG_BOTTOM], to: [600, ROW_Y], delay: 0, cat: 'network' });
    },
  },
  {
    id: 'client-chooses',
    duration: 2600,
    narration: 'A client resolving the Service gets both an A and an AAAA record, and connects over whichever family it prefers. Here it dials the IPv6 ClusterIP, and kube-proxy forwards the connection to the Pod IPv6 address. The same Service is reachable both ways.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      // The client picks a family at connect time, the Service policy is unchanged (still
      // PreferDualStack). Show the client dialing the IPv6 ClusterIP and highlight that address,
      // rather than overloading the ipFamilyPolicy chip with a client-side choice. The Service is on
      // the path (kube-proxy DNATs here), so it lights steadily via .highlight, it does not pulse.
      s.refs.svc.classList.add('highlight');
      s.refs.v6Chip.classList.add('highlight');
      setVal(s.refs.famChip, 'PreferDualStack');
      setVal(s.refs.v6Chip, 'fd00:96::a');
      setBoxSublabel(s.refs.clientBox, 'dials IPv6 fd00:96::a');
      if (ctx.reduced) { s.refs.podBox.classList.add('highlight'); return; }
      // Up-arrow into the Service then on to the Pod: client pulses first, two linear hops, the Pod
      // pulses on arrival. A riding label rides each hop to make the chosen family visible on the
      // wire and to show the kube-proxy DNAT: the client dials the IPv6 ClusterIP, then the
      // destination is rewritten to the Pod IPv6 on the way out.
      const HOP1 = [[420, LANE_Y], [480, LANE_Y]];   // client -> Service ClusterIP
      const HOP2 = [[720, LANE_Y], [780, LANE_Y]];   // Service -> Pod (after DNAT)
      pulsePod(s.refs.client, ctx, 0);
      const h1 = segmentPacket(s, ctx, { from: HOP1[0], to: HOP1[1], delay: BEAT.afterPulse, cat: 'network' });
      ridingLabel(s, ctx, 'dst fd00:96::a', HOP1, { delay: BEAT.afterPulse, dur: routeDur(HOP1), easing: 'linear' });
      const h2 = segmentPacket(s, ctx, { from: HOP2[0], to: HOP2[1], delay: h1.arrivalMs + BEAT.afterHop, cat: 'network' });
      ridingLabel(s, ctx, 'dst fd00::1:5', HOP2, { delay: h1.arrivalMs + BEAT.afterHop, dur: routeDur(HOP2), easing: 'linear' });
      pulsePod(s.refs.pod, ctx, h2.arrivalMs);
    },
  },
];

export const init = makeInit(Scene, STEPS, { posterFirst: true });
