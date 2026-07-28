import { svg, g, text } from '../lib/svg.js';
import { arrowDefs, box, pod, node, arrow } from '../lib/primitives.js';
import { valChip, setVal, setPodSublabel, pulsePod, segmentPacket, makeInit, clearHighlights, clearWires, setWire, relationPath, BEAT, lightBoxAt } from '../lib/network-kit.js';
// Design notes for this card: scheme/docs/CARDS.md#network-pod-ip-and-veth


const LINK_Y = 396; // shared y for the veth link, the loopback link and the packets on them

const NODE_X = 80, NODE_Y = 228, NODE_W = 1040, NODE_H = 300;
const POD_W = 420, POD_H = 188, POD_Y = 300;
const BR_W = 160;                                        // cni0 and the CNI plugin share one column
const INNER_GAP = 230;                                   // the veth run between the Pod shell and the bridge
const INNER_W = POD_W + INNER_GAP + BR_W;                // 810
const POD_X = NODE_X + (NODE_W - INNER_W) / 2;           // 195: the inner row is centred in the Node frame
const POD_R = POD_X + POD_W;                             // 615: Pod eth0 side, where the veth lands
const BR_X = POD_R + INNER_GAP;                          // 845
const BR_CX = BR_X + BR_W / 2;                           // 925
const CBOX_W = 150, CBOX_H = 76, CBOX_Y = 358;           // the two containers inside the shell
const PAUSE_X = POD_X + 30, APP_X = POD_X + 250;         // 225 and 445
const PAUSE_R = PAUSE_X + CBOX_W;                        // 375
const PLUGIN_Y = 250, PLUGIN_H = 64;
// Chip strip: four cells with even gaps spanning the Node frame 1:1.
const CHIP_Y = 560, CHIP_H = 34, CHIP_GAP = 20;
const CHIP_W = [250, 250, 250, 230];
const CHIP_X = CHIP_W.reduce((acc, w, i) => (i ? [...acc, acc[i - 1] + CHIP_W[i - 1] + CHIP_GAP] : [NODE_X]), []);
const WIRE_LABEL_DY = -14;   // wire labels ride this far above their link

// Each wire and the ball that rides it come from the same pair of points.
const CNI_EXEC = [[BR_CX, PLUGIN_Y + PLUGIN_H], [BR_CX, CBOX_Y]];   // plugin -> bridge
const VETH = [[BR_X, LINK_Y], [POD_R, LINK_Y]];                     // bridge -> Pod eth0
const LOOPBACK = [[APP_X, LINK_Y], [PAUSE_R, LINK_Y]];              // app -> pause over localhost

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

    const nodeEl = node({ x: NODE_X, y: NODE_Y, w: NODE_W, h: NODE_H, label: 'Node-1   ·   root namespace' });

    const podShell = pod({ x: POD_X, y: POD_Y, w: POD_W, h: POD_H, label: 'Pod', sublabel: 'netns: not ready', containers: 0, role: 'network' });
    const pauseBox = box({ x: PAUSE_X, y: CBOX_Y, w: CBOX_W, h: CBOX_H, label: 'pause', sublabel: 'netns owner', role: 'network' });
    const appBox   = box({ x: APP_X,   y: CBOX_Y, w: CBOX_W, h: CBOX_H, label: 'app',   sublabel: 'shares netns', role: 'network' });

    const cni0 = box({ x: BR_X, y: CBOX_Y, w: BR_W, h: CBOX_H, label: 'cni0', sublabel: 'host bridge', role: 'network' });
    // CNI plugin sits inside the Node, above the bridge it programs.
    const cniPlugin = box({ x: BR_X, y: PLUGIN_Y, w: BR_W, h: PLUGIN_H, label: 'CNI plugin', sublabel: 'veth + IPAM', role: 'network' });

    // veth pair: cni0 peer to the Pod eth0 (right edge of the shell). The CNI configures the
    // IP and link into the Pod, so the arrow points cni0 -> Pod and the packet rides with it.
    const veth = arrow({ x1: VETH[0][0], y1: VETH[0][1], x2: VETH[1][0], y2: VETH[1][1], dashed: true, dim: true, role: 'network' });
    const vethLabel = text({ class: 'scheme-label code dim', x: (POD_R + BR_X) / 2, y: LINK_Y + WIRE_LABEL_DY, 'text-anchor': 'middle', 'font-size': 10 }, [' ']);
    // CNI plugin exec wire down to the bridge.
    const cniWire = arrow({ x1: CNI_EXEC[0][0], y1: CNI_EXEC[0][1], x2: CNI_EXEC[1][0], y2: CNI_EXEC[1][1], dashed: true, dim: true, role: 'network' });
    // localhost loopback inside the shared namespace: a plain dashed link (no direction),
    // both containers simply share one loopback.
    const loWire = relationPath({ points: [[LOOPBACK[0][0], LINK_Y], [LOOPBACK[1][0], LINK_Y]], role: 'network' });
    const loLabel = text({ class: 'scheme-label code dim', x: (PAUSE_R + APP_X) / 2, y: LINK_Y + WIRE_LABEL_DY, 'text-anchor': 'middle', 'font-size': 10 }, [' ']);

    const nsChip   = valChip({ x: CHIP_X[0], y: CHIP_Y, w: CHIP_W[0], h: CHIP_H, name: 'namespace', value: 'not ready', role: 'network' });
    const ipChip   = valChip({ x: CHIP_X[1], y: CHIP_Y, w: CHIP_W[1], h: CHIP_H, name: 'Pod IP',    value: 'none',      role: 'network' });
    const vethChip = valChip({ x: CHIP_X[2], y: CHIP_Y, w: CHIP_W[2], h: CHIP_H, name: 'veth pair', value: 'none',      role: 'network' });
    const reachChip = valChip({ x: CHIP_X[3], y: CHIP_Y, w: CHIP_W[3], h: CHIP_H, name: 'app to pause', value: 'none',  role: 'network' });

    const packetLayer = g({ id: 'packetLayer' });

    root.appendChild(nodeEl);
    root.appendChild(cni0);
    root.appendChild(cniPlugin);
    // One group, not three siblings: pulsePod matches descendants only, so a bare shell never
    // gets the brightness half of the pulse.
    const podGroup = g({});
    podGroup.appendChild(podShell);
    podGroup.appendChild(pauseBox);
    podGroup.appendChild(appBox);
    root.appendChild(podGroup);
    [veth, cniWire, loWire, vethLabel, loLabel].forEach(el => root.appendChild(el));
    [nsChip, ipChip, vethChip, reachChip].forEach(c => root.appendChild(c));
    root.appendChild(packetLayer);

    this.host.appendChild(root);
    this.refs = {
      svg: root, nodeEl, podGroup, podShell, pauseBox, appBox, cni0, cniPlugin,
      nsChip, ipChip, vethChip, reachChip,
      packetLayer,
      wires: { veth: vethLabel, lo: loLabel },
    };
  }

  reset() { this.build(); }
}

function clearHL(s) {
  clearHighlights(s, ['cni0', 'cniPlugin', 'pauseBox', 'appBox', 'nsChip', 'ipChip', 'vethChip', 'reachChip'], [s.refs.podGroup]);
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
      const exec = segmentPacket(s, ctx, { from: CNI_EXEC[0], to: CNI_EXEC[1], role: 'network' });
      const conf = segmentPacket(s, ctx, { from: VETH[0], to: VETH[1], delay: exec.arrivalMs + BEAT.afterHop, role: 'network' });
      pulsePod(s.refs.podGroup, ctx, conf.arrivalMs);
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
      s.refs.appBox.classList.add('highlight');
      s.refs.reachChip.classList.add('highlight');
      if (ctx.reduced) { s.refs.pauseBox.classList.add('highlight'); return; }
      const APP_LEAD = 300; // brief lead so the app outline registers before the ball departs
      const lo = segmentPacket(s, ctx, { from: LOOPBACK[0], to: LOOPBACK[1], delay: APP_LEAD, role: 'network' });
      lightBoxAt(s.refs.pauseBox, ctx, lo.arrivalMs);
    },
  },
];

export const init = makeInit(Scene, STEPS, { posterFirst: true });
