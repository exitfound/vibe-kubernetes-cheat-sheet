import { svg, g, text, path } from '../lib/svg.js';
import { arrowDefs, box, pod, node, arrow } from '../lib/primitives.js';
import { valChip, setVal, setPodSublabel, pulsePod, segmentPacket, makeInit, clearHighlights, clearWires, setWire, BEAT } from '../lib/network-kit.js';

// Layout zones (viewBox 1200x640): top band reserved for the narration overlay, the Node and
// everything inside it sit in the y228..528 band (lifted for balance, with a gap to the chip
// strip at y560), so the CNI plugin stays inside the Node box and nothing touches the panel.
// Every packet rides exactly along a dashed link (segmentPacket endpoints == link endpoints).
const LINK_Y = 396; // shared y for the veth link, the loopback link and the packets on them

// Light a block's persistent outline (the .highlight border, exactly like the workloads/control
// cards) at `delay` ms, with NO pulse: autoPulse is off, so the class just triggers the CSS
// stroke transition and the border stays lit. delay<=0 (or reduced motion) lights it at once.
function lightBoxAt(boxEl, ctx, delay = 0) {
  if (!boxEl) return;
  if (ctx.reduced || delay <= 0) { boxEl.classList.add('highlight'); return; }
  const a = boxEl.animate([{ opacity: 1 }, { opacity: 1 }], { duration: 1, delay });
  a.onfinish = () => boxEl.classList.add('highlight');
  ctx.register(a);
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
      'aria-label': 'A Pod network namespace and its veth pair: the pause container owns one namespace shared by every container, the CNI assigns a single Pod IP, and a veth pair links the namespace to the host bridge',
      'data-style': 'outline',
    });
    root.appendChild(arrowDefs());

    const nodeEl = node({ x: 80, y: 228, w: 1040, h: 300, label: 'Node-1   ·   root namespace' });

    const podShell = pod({ x: 150, y: 300, w: 420, h: 188, label: 'Pod', sublabel: 'netns: not ready', containers: 0, cat: 'network' });
    const pauseBox = box({ x: 180, y: 358, w: 150, h: 76, label: 'pause', sublabel: 'netns owner', cat: 'network' });
    const appBox   = box({ x: 400, y: 358, w: 150, h: 76, label: 'app',   sublabel: 'shares netns', cat: 'network' });

    const cni0 = box({ x: 800, y: 358, w: 160, h: 76, label: 'cni0', sublabel: 'host bridge', cat: 'network' });
    // CNI plugin sits inside the Node, above the bridge it programs.
    const cniPlugin = box({ x: 800, y: 250, w: 160, h: 64, label: 'CNI plugin', sublabel: 'veth + IPAM', cat: 'network' });

    // veth pair: cni0 peer to the Pod eth0 (right edge of the shell). The CNI configures the
    // IP and link into the Pod, so the arrow points cni0 -> Pod and the packet rides with it.
    const veth = arrow({ x1: 800, y1: LINK_Y, x2: 570, y2: LINK_Y, dashed: true, dim: true, color: 'network' });
    const vethLabel = text({ class: 'scheme-label code dim', x: 685, y: LINK_Y - 14, 'text-anchor': 'middle', 'font-size': 10 }, [' ']);
    // CNI plugin exec wire down to the bridge.
    const cniWire = arrow({ x1: 880, y1: 314, x2: 880, y2: 358, dashed: true, dim: true, color: 'network' });
    // localhost loopback inside the shared namespace: a plain dashed link (no direction),
    // both containers simply share one loopback.
    const loWire = path({ class: 'scheme-arrow scheme-arrow-dashed scheme-arrow-dim scheme-arrow-network', d: `M 400 ${LINK_Y} L 330 ${LINK_Y}`, fill: 'none' });
    const loLabel = text({ class: 'scheme-label code dim', x: 365, y: LINK_Y - 14, 'text-anchor': 'middle', 'font-size': 10 }, [' ']);

    const nsChip   = valChip({ x: 80,  y: 560, w: 250, h: 34, name: 'namespace', value: 'not ready', cat: 'network' });
    const ipChip   = valChip({ x: 350, y: 560, w: 250, h: 34, name: 'Pod IP',    value: 'none',      cat: 'network' });
    const vethChip = valChip({ x: 620, y: 560, w: 250, h: 34, name: 'veth pair', value: 'none',      cat: 'network' });
    const reachChip = valChip({ x: 890, y: 560, w: 230, h: 34, name: 'app to pause', value: 'none',  cat: 'network' });

    const packetLayer = g({ id: 'packetLayer' });

    // Z-order (bottom -> top): Node background, then the boxes, then the wires + their
    // labels ON TOP of the boxes (so a connector that crosses a box stays visible and the
    // text is selectable), then the value-chip strip, and finally the packet layer so the
    // ball rides above everything.
    root.appendChild(nodeEl);
    root.appendChild(cni0);
    root.appendChild(cniPlugin);
    root.appendChild(podShell);
    root.appendChild(pauseBox);
    root.appendChild(appBox);
    [veth, cniWire, loWire, vethLabel, loLabel].forEach(el => root.appendChild(el));
    [nsChip, ipChip, vethChip, reachChip].forEach(c => root.appendChild(c));
    root.appendChild(packetLayer);

    this.host.appendChild(root);
    this.refs = {
      svg: root, nodeEl, podShell, pauseBox, appBox, cni0, cniPlugin,
      nsChip, ipChip, vethChip, reachChip,
      packetLayer,
      wires: { veth: vethLabel, lo: loLabel },
    };
  }

  reset() { this.build(); }
}

function clearHL(s) {
  clearHighlights(s, ['cni0', 'cniPlugin', 'pauseBox', 'appBox', 'nsChip', 'ipChip', 'vethChip', 'reachChip'], [s.refs.podShell]);
}

const STEPS = [
  {
    id: 'idle',
    duration: 1500,
    narration: 'A Pod is more than its containers: it is one network namespace they all live in. Before any workload starts, that namespace has to be created and given an identity on the Node.',
    enter(s) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setPodSublabel(s.refs.podShell, 'netns: not ready');
      setVal(s.refs.nsChip, 'not ready');
      setVal(s.refs.ipChip, 'none');
      setVal(s.refs.vethChip, 'none');
      setVal(s.refs.reachChip, 'none');
    },
  },
  {
    id: 'sandbox',
    duration: 2100,
    narration: 'The runtime first starts the pause container, which holds the Pod network namespace open. Because pause owns that namespace, every other container in the Pod is later joined into it rather than getting its own, which is what makes them one network endpoint.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setPodSublabel(s.refs.podShell, 'netns: open');
      setVal(s.refs.nsChip, 'shared · owned by pause');
      // The pause box and the namespace chip keep a static highlight border for the whole
      // step (no pulse, no flash, no fade back) since they show the settled shared-netns state.
      s.refs.pauseBox.classList.add('highlight');
      s.refs.nsChip.classList.add('highlight');
    },
  },
  {
    id: 'cni-add',
    duration: 2400,
    narration: 'The runtime then calls the CNI plugin with the namespace path. The plugin allocates one IP for the Pod through its IPAM, creates a veth pair, moves one end into the namespace as eth0 and attaches the peer to cni0 on the host. The Pod now has a single routable address and a link to the Node.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setPodSublabel(s.refs.podShell, 'IP 10.244.1.5');
      setWire(s, 'veth', 'eth0 <-> veth');
      setVal(s.refs.ipChip, '10.244.1.5');
      setVal(s.refs.vethChip, 'eth0 <-> veth');
      s.refs.cniPlugin.classList.add('highlight');
      s.refs.cni0.classList.add('highlight');
      s.refs.ipChip.classList.add('highlight');
      s.refs.vethChip.classList.add('highlight');
      if (ctx.reduced) return;
      // CNI execs (plugin -> bridge), then the IP and link are configured into the Pod over the veth.
      const exec = segmentPacket(s, ctx, { from: [880, 314], to: [880, 358], cat: 'network' });
      const conf = segmentPacket(s, ctx, { from: [800, LINK_Y], to: [570, LINK_Y], delay: exec.arrivalMs + BEAT.afterHop, cat: 'network' });
      pulsePod(s.refs.podShell, ctx, conf.arrivalMs);
    },
  },
  {
    id: 'shared',
    duration: 2200,
    narration: 'With the namespace in place, the app container is joined into it instead of getting its own. Every container in the Pod now shares one IP, one routing table and one loopback, so they reach each other over localhost. To the rest of the cluster the whole Pod is a single endpoint at 10.244.1.5.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setPodSublabel(s.refs.podShell, 'IP 10.244.1.5');
      setWire(s, 'lo', '127.0.0.1');
      setVal(s.refs.reachChip, 'localhost');
      // Sequence (no pulses, just persistent highlight borders like the workloads cards):
      // the app block lights first and stays lit, then the loopback ball travels, then the
      // pause block lights on arrival.
      s.refs.appBox.classList.add('highlight');
      s.refs.reachChip.classList.add('highlight');
      if (ctx.reduced) { s.refs.pauseBox.classList.add('highlight'); return; }
      const APP_LEAD = 300; // brief lead so the app outline registers before the ball departs
      const lo = segmentPacket(s, ctx, { from: [400, LINK_Y], to: [330, LINK_Y], delay: APP_LEAD, cat: 'network' });
      lightBoxAt(s.refs.pauseBox, ctx, lo.arrivalMs);
    },
  },
];

export const init = makeInit(Scene, STEPS, { posterFirst: true });
