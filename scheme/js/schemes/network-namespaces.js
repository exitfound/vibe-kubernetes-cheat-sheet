import { svg, g, text, rect } from '../lib/svg.js';
import { arrowDefs, box, pod, arrow } from '../lib/primitives.js';
import { valChip, setVal, pulsePod, segmentPacket, routePacket, makeInit, clearHighlights, clearWires, setWire, relationPath, lightBoxAt } from '../lib/network-kit.js';
// Design notes for this card: scheme/docs/CARDS.md#network-namespaces


const POD_TOP = 160;      // Pod netns shell top
const POD_H = 304;        // Pod netns shell height
const POD_CY = POD_TOP + POD_H / 2;   // 312: Pod netns vertical center, the host block centers on this
const AXIS_Y = POD_CY;    // 312: veth axis = the shared center of the host and Pod blocks, so the cable runs dead level between them
const HOST_EDGE = 410;    // host stack right edge (veth start)
const HOST_H = 150;       // host block height
const HOST_Y = POD_CY - HOST_H / 2;   // 237: host block top, vertically centered on the Pod netns block
const POD_LEFT = 600;     // Pod netns shell left edge (veth end): the cable stops at the namespace
const POD_W = 448;        // Pod netns shell width
const POD_CX = POD_LEFT + POD_W / 2;  // 824: Pod netns horizontal center, the interior content + labels center on this
const COL_SPREAD = 113;   // half the gap between the two interior columns
const COL_L = POD_CX - COL_SPREAD;    // 711: left column center (app over eth0)
const COL_R = POD_CX + COL_SPREAD;    // 937: right column center (sidecar over lo)
const ROW_TOP = 196;      // container row top
const ROW_TOP_H = 60;
const ROW_TOP_BOT = ROW_TOP + ROW_TOP_H;   // container row bottom (256)
const IFACE_H = 60;       // interface box height (eth0 / lo)
const ROW_BOT = 330;      // stack-interface row top: pushed well below the containers so they do not touch
const RAIL_Y = 293;       // shared-stack rail (bus), midway in the gap between the two rows
const BAND_CX = POD_CX;   // 824: shared-stack band center = Pod center, so the band + its label sit centered

// The localhost path: app drops to the shared rail, rides it across, and climbs to the sidecar. This
// is the in-Pod loopback path, so it touches both container taps and the rail in one motion.
const LOCAL_PATH = [[COL_L, ROW_TOP_BOT], [COL_L, RAIL_Y], [COL_R, RAIL_Y], [COL_R, ROW_TOP_BOT]];

// One interior connector style: a constant dashed dim line, no arrowhead (direction is carried by the
// packet). Drawn once and never re-styled per step, so all five taps and the veth read identically.
function dashLink(x1, y1, x2, y2) {
  return relationPath({ points: [[x1, y1], [x2, y2]] });
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
      'aria-label': 'Network namespaces: the pause container holds one isolated network stack with its own interfaces, routing table and ports, every container in the Pod shares it and reaches the others over localhost, and a veth pair is the only link between the Pod namespace and the host namespace',
      'data-style': 'outline',
    });
    root.appendChild(arrowDefs());

    const host = box({ x: 150, y: HOST_Y, w: 260, h: HOST_H, label: 'Host NETNS', sublabel: 'node NICs · routes · iptables', role: 'network' });

    const shell = pod({ x: POD_LEFT, y: POD_TOP, w: POD_W, h: POD_H, label: 'Pod NETNS', sublabel: 'isolated stack · 10.244.1.5', containers: 0, role: 'network' });
    const shellRect = shell.querySelector('.scheme-pod-rect');
    if (shellRect) shellRect.style.fill = 'rgba(255, 255, 255, 0.03)';

    // Containers (tenants) on top, the shared stack (eth0 + lo) on the row below.
    const app  = box({ x: COL_L - 79, y: ROW_TOP, w: 158, h: ROW_TOP_H, label: 'app',     sublabel: 'container', role: 'network' });
    const side = box({ x: COL_R - 79, y: ROW_TOP, w: 158, h: ROW_TOP_H, label: 'sidecar', sublabel: 'container', role: 'network' });
    const eth0 = box({ x: COL_L - 79, y: ROW_BOT, w: 158, h: IFACE_H, label: 'eth0', sublabel: '10.244.1.5', role: 'network' });
    const lo   = box({ x: COL_R - 79, y: ROW_BOT, w: 158, h: IFACE_H, label: 'lo',   sublabel: '127.0.0.1',  role: 'network' });

    const band = rect({ class: 'netns-stack-band', x: BAND_CX - 204, y: 276, w: 408, h: 122, rx: 10,
      style: 'fill:rgba(79,229,255,0.035);stroke:rgba(79,229,255,0.28);stroke-width:1' });
    const bandLabel = text({ class: 'scheme-label code dim', x: BAND_CX, y: 420, 'text-anchor': 'middle' }, ['shared network stack']);
    const rail   = dashLink(COL_L, RAIL_Y, COL_R, RAIL_Y);        // the shared stack bus
    const tapApp = dashLink(COL_L, ROW_TOP_BOT, COL_L, RAIL_Y);   // app     -> rail
    const tapSide= dashLink(COL_R, ROW_TOP_BOT, COL_R, RAIL_Y);   // sidecar -> rail
    const tapEth = dashLink(COL_L, ROW_BOT, COL_L, RAIL_Y);       // eth0    -> rail
    const tapLo  = dashLink(COL_R, ROW_BOT, COL_R, RAIL_Y);       // lo      -> rail
    const podGroup = g({});
    [shell, band, bandLabel, rail, tapApp, tapSide, tapEth, tapLo].forEach(el => podGroup.appendChild(el));

    // veth pair host stack -> Pod namespace: the only cross-namespace link, a single dashed cable
    // that plugs into the Pod netns boundary (its in-Pod end is eth0, just inside).
    const vethWire  = arrow({ x1: HOST_EDGE, y1: AXIS_Y, x2: POD_LEFT, y2: AXIS_Y, dashed: true, dim: true, role: 'network' });
    const vethLabel = text({ class: 'scheme-label code dim', x: 505, y: AXIS_Y - 12, 'text-anchor': 'middle' }, [' ']);
    const localLabel = text({ class: 'scheme-label code dim', x: BAND_CX, y: RAIL_Y - 12, 'text-anchor': 'middle' }, [' ']);

    // Info chips centered under the diagram: the row spans exactly host-left (150) to Pod-right (1048).
    const scopeChip = valChip({ x: 150, y: 500, w: 210, h: 34, name: 'namespace', value: 'host', role: 'network' });
    const ifaceChip = valChip({ x: 376, y: 500, w: 205, h: 34, name: 'interfaces', value: 'node NICs', role: 'network' });
    const portChip  = valChip({ x: 597, y: 500, w: 180, h: 34, name: 'ports', value: 'private', role: 'network' });
    const reachChip = valChip({ x: 793, y: 500, w: 255, h: 34, name: 'reach', value: 'node + beyond', role: 'network' });

    const packetLayer = g({ id: 'packetLayer' });

    // Z-order: host stack, then pod shell + band + rail/taps, then the interface/container boxes over
    // the rail, then the veth cable + wire labels, then chips, then the packet layer on top.
    root.appendChild(host);
    // The four boxes drawn inside the Pod go INSIDE its group, so the pulse reaches them: a Pod
    // blinks as one thing and everything drawn inside it blinks with it (2026-07-29).
    [eth0, lo, app, side].forEach(el => podGroup.appendChild(el));
    root.appendChild(podGroup);
    [vethWire, vethLabel, localLabel].forEach(el => root.appendChild(el));
    [scopeChip, ifaceChip, portChip, reachChip].forEach(c => root.appendChild(c));
    root.appendChild(packetLayer);

    this.host.appendChild(root);
    this.refs = {
      svg: root, host, podGroup, app, side, lo, eth0,
      rail, tapApp, tapSide, tapEth, tapLo, vethWire,
      scopeChip, ifaceChip, portChip, reachChip,
      packetLayer, wires: { local: localLabel, veth: vethLabel },
    };
  }

  reset() { this.build(); }
}

function clearHL(s) {
  clearHighlights(s, ['host', 'app', 'side', 'lo', 'eth0', 'scopeChip', 'ifaceChip', 'portChip', 'reachChip'], [s.refs.podGroup]);
}

const STEPS = [
  {
    id: 'idle',
    duration: 1500,
    enter(s) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setVal(s.refs.scopeChip, 'host');
      setVal(s.refs.ifaceChip, 'node NICs');
      setVal(s.refs.portChip, 'shared');
      setVal(s.refs.reachChip, 'node + beyond');
    },
  },
  {
    id: 'fresh',
    duration: 2200,
    narration: 'When the Pod sandbox starts, the pause container is handed a brand new network namespace. At first it holds only a loopback device and nothing else, fully cut off from the host stack and from every other Pod. It cannot yet reach anything outside itself.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      // Only lo is live yet: every block and wire is drawn, but lo is the one that lights.
      s.refs.lo.classList.add('highlight');
      s.refs.ifaceChip.classList.add('highlight');
      s.refs.reachChip.classList.add('highlight');
      setVal(s.refs.scopeChip, 'pod');
      s.refs.scopeChip.classList.add('highlight');
      setVal(s.refs.ifaceChip, 'lo only');
      setVal(s.refs.reachChip, 'isolated');
      // Nothing flows in or out yet: lo simply holds its highlight outline, no flash.
    },
  },
  {
    id: 'veth',
    duration: 2400,
    narration: 'CNI then adds a veth pair: one end becomes eth0 inside the Pod namespace with the Pod IP, the peer stays in the host namespace, plugged straight into the host stack. That single cable is the only path between the two stacks, so all Pod traffic to the Node and beyond crosses it.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setWire(s, 'veth', 'veth pair');
      // The host link comes alive: the host stack lights, and the packet that rides the veth lights eth0.
      s.refs.host.classList.add('highlight');
      s.refs.ifaceChip.classList.add('highlight');
      s.refs.reachChip.classList.add('highlight');
      setVal(s.refs.scopeChip, 'pod');
      setVal(s.refs.ifaceChip, 'lo + eth0');
      setVal(s.refs.reachChip, 'node + beyond');
      if (ctx.reduced) { s.refs.eth0.classList.add('highlight'); return; }
      // Down-arrow: the packet crosses the veth from the host side into eth0, which lights on arrival,
      // then the pod shell pulses as the namespace gains reach.
      const hop = segmentPacket(s, ctx, { from: [HOST_EDGE, AXIS_Y], to: [POD_LEFT, AXIS_Y], role: 'network' });
      lightBoxAt(s.refs.eth0, ctx, hop.arrivalMs);
      pulsePod(s.refs.podGroup, ctx, hop.arrivalMs);
    },
  },
  {
    id: 'shared',
    duration: 2600,
    narration: 'Every container in the Pod joins this same namespace, so app and sidecar share one eth0 and one set of ports. They reach each other over 127.0.0.1 with no network hop, which is why two containers in a Pod cannot both bind the same port.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setWire(s, 'local', 'localhost');
      // Every container now shares the one stack: app, sidecar and eth0 all light, lo lights on arrival.
      s.refs.app.classList.add('highlight');
      s.refs.eth0.classList.add('highlight');
      s.refs.portChip.classList.add('highlight');
      setVal(s.refs.scopeChip, 'pod');
      setVal(s.refs.portChip, 'shared');
      if (ctx.reduced) { s.refs.lo.classList.add('highlight'); s.refs.side.classList.add('highlight'); return; }
      const hop = routePacket(s, ctx, LOCAL_PATH, { role: 'network' });
      lightBoxAt(s.refs.side, ctx, hop.arrivalMs);
      lightBoxAt(s.refs.lo, ctx, hop.arrivalMs);
    },
  },
  {
    id: 'isolation',
    duration: 2600,
    narration: 'Because the stack is private, the Pod has its own routing table, its own iptables and its own port space, all separate from the host and from other Pods. Delete the Pod and the namespace is torn down, releasing the veth and the IP in one move.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      // The veth still links the two stacks here, so keep the host lit and the cable bright instead of
      // letting it read as a dead line: this is the contrast the step is about (pod-private vs host).
      s.refs.host.classList.add('highlight');
      setWire(s, 'veth', 'veth pair');
      s.refs.eth0.classList.add('highlight');
      s.refs.lo.classList.add('highlight');
      s.refs.scopeChip.classList.add('highlight');
      s.refs.portChip.classList.add('highlight');
      s.refs.reachChip.classList.add('highlight');
      setVal(s.refs.scopeChip, 'pod · private');
      setVal(s.refs.ifaceChip, 'lo + eth0');
      setVal(s.refs.portChip, 'own space');
      setVal(s.refs.reachChip, 'node + beyond');
      if (ctx.reduced) return;
      // No new traffic: the whole shared stack (shell + band + rail) pulses to mark the isolated
      // stack as the unit that lives and dies as one.
      pulsePod(s.refs.podGroup, ctx, 0);
    },
  },
];

export const init = makeInit(Scene, STEPS, { posterFirst: true });
