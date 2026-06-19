import { svg, g } from '../lib/svg.js';
import { arrowDefs, box, pod, arrow } from '../lib/primitives.js';
import { valChip, setVal, setPodSublabel, pulsePod, segmentPacket, makeInit, clearHighlights, BEAT } from '../lib/network-kit.js';

// Layout zones (viewBox 1200x640): the top-left band (x<=380, y<=300) is reserved for the
// narration overlay, so the client sits low-left and the cluster-config band plus Service and Pod
// sit at x>=430. Dual-stack means two parallel address families: the Pod gains a second IP, the
// Service gains a second ClusterIP, and the client picks a family at connect time.
// Standard contract: only Pods pulse, boxes light via .highlight (config and Service flash only on
// their own packet-less steps), packet endpoints match the static wires.
const LANE_Y = 395;

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

    const config = box({ x: 430, y: 150, w: 560, h: 80, label: 'dual-stack enabled', sublabel: 'pod + service CIDRs: IPv4 and IPv6', cat: 'network' });
    const client = clientBlock({ x: 90, y: 330, w: 200, h: 130 });
    const svc = box({ x: 430, y: 320, w: 250, h: 150, label: 'Service web', sublabel: 'ipFamilyPolicy', cat: 'network' });
    const podRef = podBlock({ x: 820, y: 320, w: 300, h: 150, label: 'Pod web', ip: 'IPv4 10.244.1.5' });

    // Dim dashed wires: client -> Service -> Pod data lane, plus config -> Service.
    const wClient = arrow({ x1: 290, y1: LANE_Y, x2: 430, y2: LANE_Y, dashed: true, dim: true });
    const wSvcPod = arrow({ x1: 680, y1: LANE_Y, x2: 820, y2: LANE_Y, dashed: true, dim: true });
    const wConfig = arrow({ x1: 555, y1: 230, x2: 555, y2: 320, dashed: true, dim: true });

    const famChip = valChip({ x: 90, y: 510, w: 280, h: 34, name: 'ipFamilyPolicy', value: 'SingleStack', cat: 'network' });
    const v4Chip = valChip({ x: 430, y: 510, w: 260, h: 34, name: 'clusterIP v4', value: '10.96.0.10', cat: 'network' });
    const v6Chip = valChip({ x: 720, y: 510, w: 300, h: 34, name: 'clusterIP v6', value: 'none', cat: 'network' });

    const packetLayer = g({ id: 'packetLayer' });

    // Z-order: config + service + client + pod, then wires ABOVE, then chips, then packets.
    root.appendChild(config);
    root.appendChild(svc);
    root.appendChild(client.group);
    root.appendChild(podRef.group);
    [wClient, wSvcPod, wConfig].forEach(el => root.appendChild(el));
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

// One-shot box flash for a packet-less, pod-less step (the only sanctioned block blink).
function flashBox(s, ctx, key) {
  if (ctx.reduced) return;
  const el = s.refs[key];
  if (!el) return;
  ctx.register(el.animate(
    [{ filter: 'brightness(1)' }, { filter: 'brightness(1.5)' }, { filter: 'brightness(1)' }],
    { duration: 600, easing: 'ease-out' }
  ));
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
    },
  },
  {
    id: 'enable',
    duration: 2300,
    narration: 'Dual-stack is enabled cluster-wide: the apiserver, controller-manager, kubelet and CNI are all configured with both an IPv4 and an IPv6 pod CIDR and service CIDR. Nothing has a second address yet, but the address space for one now exists.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      s.refs.config.classList.add('highlight');
      setVal(s.refs.famChip, 'PreferDualStack');
      // Packet-less, pod-less step: flash the config band as the second family is turned on.
      flashBox(s, ctx, 'config');
    },
  },
  {
    id: 'pod-two-ips',
    duration: 2500,
    narration: 'When the Pod is created, the CNI now allocates one address from each family, an IPv4 from the v4 pod CIDR and an IPv6 from the v6 pod CIDR. Both live on the same eth0, and the Pod can speak either protocol.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      s.refs.config.classList.add('highlight');
      setVal(s.refs.famChip, 'PreferDualStack');
      setPodSublabel(s.refs.pod, 'IPv4 10.244.1.5 . IPv6 fd00::1:5');
      if (ctx.reduced) { s.refs.podBox.classList.add('highlight'); return; }
      // The Pod gains its second address: it pulses as the family is added.
      pulsePod(s.refs.pod, ctx, 0);
    },
  },
  {
    id: 'service-two-clusterips',
    duration: 2500,
    narration: 'A Service with ipFamilyPolicy PreferDualStack is given one ClusterIP per family, ordered by its ipFamilies list, here IPv4 then IPv6. Each ClusterIP is backed by the same set of Pods, just reached over a different protocol.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      s.refs.svc.classList.add('highlight');
      s.refs.v4Chip.classList.add('highlight');
      s.refs.v6Chip.classList.add('highlight');
      setVal(s.refs.v6Chip, 'fd00:96::a');
      // Packet-less, pod-less step: flash the Service as it gains its second ClusterIP.
      flashBox(s, ctx, 'svc');
    },
  },
  {
    id: 'client-chooses',
    duration: 2600,
    narration: 'A client resolving the Service gets both an A and an AAAA record, and connects over whichever family it prefers. Here it dials the IPv6 ClusterIP, and kube-proxy forwards the connection to the Pod IPv6 address. The same Service is reachable both ways.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      s.refs.v6Chip.classList.add('highlight');
      setVal(s.refs.famChip, 'client picks IPv6');
      setVal(s.refs.v6Chip, 'fd00:96::a');
      if (ctx.reduced) { s.refs.podBox.classList.add('highlight'); return; }
      // Up-arrow into the Service then on to the Pod: client pulses first, two linear hops, the Pod
      // pulses on arrival.
      pulsePod(s.refs.client, ctx, 0);
      const h1 = segmentPacket(s, ctx, { from: [290, LANE_Y], to: [430, LANE_Y], delay: BEAT.afterPulse, cat: 'network' });
      const h2 = segmentPacket(s, ctx, { from: [680, LANE_Y], to: [820, LANE_Y], delay: h1.arrivalMs + BEAT.afterHop, cat: 'network' });
      pulsePod(s.refs.pod, ctx, h2.arrivalMs);
    },
  },
];

export const init = makeInit(Scene, STEPS, { posterFirst: true });
