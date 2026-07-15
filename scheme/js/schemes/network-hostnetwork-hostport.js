import { svg, g, text } from '../lib/svg.js';
import { arrowDefs, box, pod, node, arrow, pathArrow, animateAlong } from '../lib/primitives.js';
import { valChip, setVal, setBoxSublabel, setPodSublabel, pulsePod, segmentPacket, routePacket, routeDur, makeInit, clearHighlights, clearWires, setWire, BEAT } from '../lib/network-kit.js';

// hostNetwork and hostPort (viewBox 1200x640). Every other Pod Networking card assumes the Pod has its
// OWN namespace, its own IP and a veth into the bridge. This card is the two sanctioned ways out of that,
// and the composition is one Node seen from the LAN side.
//
// Standard contract: Pods are shell + inner box; only Pods pulse; the client, the NIC, the bridge and the
// portmap rule are infrastructure and only light; value chips never flash; packets stop at block edges.
// The two reflective steps carry no motion at all: they compare, they do not move traffic.
//
// GEOMETRY. A strict three-column grid, so nothing sits at a random x. Every wire and every packet is
// derived from a block edge, never hand-typed.
//
//   COL1 (cx 240)          COL2 (cx 600)          COL3 (cx 960)
//   portmap rule           Node eth0              (empty: the lane to the agent runs through it)
//   Pod app                cni0 bridge            Pod node-agent
//
// The NIC is the hub and it exits three ways, one per direction: LEFT along its own row into the portmap
// rule, RIGHT along that same row into the hostNetwork Pod, and DOWN its own column into the bridge. Each
// block therefore sits under or beside the block it belongs to: the rule above the Pod it maps to, the
// bridge under the NIC that routes into it, and the hostNetwork Pod alone in a column, because it hangs
// off nothing.
//
// Vertical: the narration overlay really covers x 0..399, y 0..300, and the Node spans the full width, so
// its frame starts at 305, just under the panel, and runs to 570, which is as deep as the chip strip
// allows. The client is the only block above the Node and it sits at x >= 450, clear of the panel, dead
// centred on the NIC so the entry hop is one clean vertical with no dogleg.
const NODE_X = 40, NODE_Y = 305, NODE_W = 1120, NODE_H = 265;
const NODE_BOTTOM = NODE_Y + NODE_H;           // 570

const COL1_CX = 240, COL2_CX = 600, COL3_CX = 960;

const CLIENT_X = 450, CLIENT_Y = 56, CLIENT_W = 300, CLIENT_H = 74;
const CLIENT_BOTTOM = CLIENT_Y + CLIENT_H;     // 130

// Row 1: the Node NIC and the rule that sits on its ingress path, both on one baseline.
const R1_Y = 330, R1_H = 64;
const R1_CY = R1_Y + R1_H / 2;                 // 362
const R1_BOTTOM = R1_Y + R1_H;                 // 394

const ETH_W = 240;
const ETH_X = COL2_CX - ETH_W / 2;             // 480
const ETH_RIGHT = ETH_X + ETH_W;               // 720

const PM_W = 260;
const PM_X = COL1_CX - PM_W / 2;               // 110
const PM_RIGHT = PM_X + PM_W;                  // 370

// Row 2: the two Pods and the bridge between them, all centred on one line.
const R2_Y = 440, POD_H = 110, POD_W = 210;
const POD_CY = R2_Y + POD_H / 2;               // 495
const APP_X = COL1_CX - POD_W / 2;             // 135
const APP_RIGHT = APP_X + POD_W;               // 345
const AGENT_X = COL3_CX - POD_W / 2;           // 855

const BR_W = 200, BR_H = 60;
const BR_X = COL2_CX - BR_W / 2;               // 500
const BR_TOP = POD_CY - BR_H / 2;              // 465

const BUS_Y = (R1_BOTTOM + R2_Y) / 2;          // 417, the lane between the two rows
const CHIP_Y = 590, CHIP_H = 34;
const SCHEME_LEFT = NODE_X;                    // 40
const SCHEME_RIGHT = NODE_X + NODE_W;          // 1160

const DIM = '0.4';

// Each static wire and the ball that rides it share the same points array. The three NIC exits are one
// per direction, and the rule rejoins the ordinary path on the bus between the rows.
const ENTRY = [[COL2_CX, CLIENT_BOTTOM], [COL2_CX, R1_Y]];               // LAN client -> the Node NIC
const TO_PM = [[ETH_X, R1_CY], [PM_RIGHT, R1_CY]];                       // NIC -> the portmap rule
const TO_AGENT = [[ETH_RIGHT, R1_CY], [COL3_CX, R1_CY], [COL3_CX, R2_Y]];// NIC -> the hostNetwork Pod
const TO_BRIDGE = [[COL2_CX, R1_BOTTOM], [COL2_CX, BR_TOP]];             // NIC -> the bridge, ordinary route
// The rewrite happens INSIDE the rule box, so the ball re-emerges at its bottom edge already carrying the
// Pod address, and only then joins the ordinary path. It lands on the bridge left of the NIC route so the
// two never overlap.
const PM_TO_BRIDGE = [[COL1_CX, R1_BOTTOM], [COL1_CX, BUS_Y], [560, BUS_Y], [560, BR_TOP]];
const VETH = [[BR_X, POD_CY], [APP_RIGHT, POD_CY]];                      // bridge -> Pod app, the veth pair

function lightBoxAt(boxEl, ctx, delay = 0) {
  if (!boxEl) return;
  if (ctx.reduced || delay <= 0) { boxEl.classList.add('highlight'); return; }
  const a = boxEl.animate([{ opacity: 1 }, { opacity: 1 }], { duration: 1, delay });
  a.onfinish = () => boxEl.classList.add('highlight');
  ctx.register(a);
}

// A tag that rides ALONG with the ball on the same path, timing and easing, carrying the address that leg
// actually has. It lives in the packet layer but is not a .scheme-packet, so the tools do not count it as
// a packet. segmentPacket is linear and routePacket is eased, so each caller passes the easing of the ball
// it rides or the tag drifts off it mid-flight. `emerge` holds the tag invisible until the ball has
// cleared the block it is leaving, for a leg that exits downward out of a box.
function ridingLabel(s, ctx, txt, points, { delay = 0, easing = 'ease-in-out', emerge = 0, dy = -14 } = {}) {
  if (ctx.reduced) return;
  const d = routeDur(points);
  const lbl = text({ class: 'scheme-box-sublabel', x: 0, y: dy, 'text-anchor': 'middle', 'data-cat': 'network' }, [txt]);
  lbl.style.opacity = '0';
  lbl.style.transform = `translate(${points[0][0]}px, ${points[0][1]}px)`;
  s.refs.packetLayer.appendChild(lbl);
  ctx.register(lbl.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 150, delay: delay + emerge, fill: 'forwards', easing: 'ease-out' }));
  ctx.register(animateAlong(lbl, points, { duration: d, delay, easing }));
  ctx.register(lbl.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 170, delay: delay + d, fill: 'forwards', easing: 'ease-in' }));
}

function podBlock({ x, y, w, h, label, ip }) {
  const shell = pod({ x, y, w, h, label, sublabel: ip, containers: 0, cat: 'network' });
  const shellRect = shell.querySelector('.scheme-pod-rect');
  if (shellRect) shellRect.style.fill = 'rgba(255, 255, 255, 0.03)';
  const innerBox = box({ x: x + 20, y: y + 30, w: w - 40, h: 48, label: 'app', sublabel: 'eth0', cat: 'network' });
  const group = g({});
  group.appendChild(shell);
  group.appendChild(innerBox);
  return { group, innerBox };
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
      'aria-label': 'hostNetwork and hostPort: an ordinary Pod has its own network namespace, its own Pod IP and a veth pair into the bridge. A Pod with hostNetwork true has no namespace of its own at all, so it has no veth and no Pod IP, it runs in the Node namespace and binds straight to the Node address, at the cost of the Node port space and its own isolation. A Pod with a hostPort keeps everything it had, and the CNI portmap plugin only adds a DNAT rule on the Node that rewrites the Node address and host port to the Pod IP and container port.',
      'data-style': 'outline',
    });
    root.appendChild(arrowDefs());

    // The frame label sits at the Node top-left (x+12, y+18), which puts it above and left of the portmap
    // box at x=110, so Node-1 clears it. Do not lengthen it much further or it runs under that box. The
    // Node address stays on the eth0 block, which is where it belongs anyway.
    const theNode = node({ x: NODE_X, y: NODE_Y, w: NODE_W, h: NODE_H, label: 'Node-1' });

    const client = box({ x: CLIENT_X, y: CLIENT_Y, w: CLIENT_W, h: CLIENT_H, label: 'Client on the LAN', sublabel: '', cat: 'network' });
    const eth = box({ x: ETH_X, y: R1_Y, w: ETH_W, h: R1_H, label: 'Node eth0', sublabel: '192.168.1.20', cat: 'network' });
    const portmap = box({ x: PM_X, y: R1_Y, w: PM_W, h: R1_H, label: 'Portmap rule', sublabel: 'none', cat: 'network' });
    const bridge = box({ x: BR_X, y: BR_TOP, w: BR_W, h: BR_H, label: 'cni0 bridge', sublabel: '10.244.1.1', cat: 'network' });

    const podApp = podBlock({ x: APP_X, y: R2_Y, w: POD_W, h: POD_H, label: 'Pod app', ip: '10.244.1.5' });
    const podAgent = podBlock({ x: AGENT_X, y: R2_Y, w: POD_W, h: POD_H, label: 'Pod node-agent', ip: 'hostNetwork: true' });

    const entryWire = arrow({ x1: ENTRY[0][0], y1: ENTRY[0][1], x2: ENTRY[1][0], y2: ENTRY[1][1], dashed: true, dim: true, color: 'network' });
    const pmWire = arrow({ x1: TO_PM[0][0], y1: TO_PM[0][1], x2: TO_PM[1][0], y2: TO_PM[1][1], dashed: true, dim: true, color: 'network' });
    const brWire = arrow({ x1: TO_BRIDGE[0][0], y1: TO_BRIDGE[0][1], x2: TO_BRIDGE[1][0], y2: TO_BRIDGE[1][1], dashed: true, dim: true, color: 'network' });
    const vethWire = arrow({ x1: VETH[0][0], y1: VETH[0][1], x2: VETH[1][0], y2: VETH[1][1], dashed: true, dim: true, color: 'network' });
    const agentWire = pathArrow({ points: TO_AGENT, dashed: true, dim: true, color: 'network' });
    const pmBrWire = pathArrow({ points: PM_TO_BRIDGE, dashed: true, dim: true, color: 'network' });

    // The veth is the thing the two Pods differ by, so the wire that carries it is the one wire that is
    // named. Everything else a step needs to say rides the chips or the Pod sublabels.
    const vethLabel = text({ class: 'scheme-label code dim', x: (BR_X + APP_RIGHT) / 2, y: POD_CY - 12, 'text-anchor': 'middle', 'font-size': 10 }, [' ']);

    // The four chips span the Node 1:1, with even 20px gaps. They are the four things these two fields
    // actually change, and each is a property of the setup rather than of a request, so they all carry the
    // ordinary-Pod truth from the start and the steps flip them.
    const nsChip   = valChip({ x: SCHEME_LEFT, y: CHIP_Y, w: 260, h: CHIP_H, name: 'netns', value: 'own', cat: 'network' });
    const ipChip   = valChip({ x: 320, y: CHIP_Y, w: 300, h: CHIP_H, name: 'Pod IP', value: '10.244.1.5', cat: 'network' });
    const vethChip = valChip({ x: 640, y: CHIP_Y, w: 170, h: CHIP_H, name: 'veth', value: 'yes', cat: 'network' });
    const portChip = valChip({ x: 830, y: CHIP_Y, w: SCHEME_RIGHT - 830, h: CHIP_H, name: 'reachable at', value: 'Pod IP only', cat: 'network' });

    const packetLayer = g({ id: 'packetLayer' });

    // Z-order: the Node frame in back, then the blocks inside and above it, then wires + the veth label,
    // then chips, then the packet layer with its riding tags on top.
    root.appendChild(theNode);
    root.appendChild(client);
    root.appendChild(eth);
    root.appendChild(portmap);
    root.appendChild(bridge);
    root.appendChild(podApp.group);
    root.appendChild(podAgent.group);
    [entryWire, pmWire, brWire, vethWire, agentWire, pmBrWire, vethLabel].forEach(el => root.appendChild(el));
    [nsChip, ipChip, vethChip, portChip].forEach(c => root.appendChild(c));
    root.appendChild(packetLayer);

    this.host.appendChild(root);
    this.refs = {
      svg: root, theNode, client, eth, portmap, bridge,
      podApp: podApp.group, podAppBox: podApp.innerBox,
      podAgent: podAgent.group, podAgentBox: podAgent.innerBox,
      nsChip, ipChip, vethChip, portChip,
      packetLayer, wires: { veth: vethLabel },
    };
  }

  reset() { this.build(); }
}

// The inner app boxes are listed by key so the .highlight a reduced replay puts on them is cleared too:
// clearPodHighlight only resets inline strokes. Every dimmable block goes back to full opacity so the dim
// one case puts on the other cannot leak into the next step.
function clearHL(s) {
  clearHighlights(s, ['client', 'eth', 'portmap', 'bridge', 'nsChip', 'ipChip', 'vethChip', 'portChip', 'podAppBox', 'podAgentBox'], [s.refs.podApp, s.refs.podAgent]);
  ['podApp', 'podAgent', 'portmap', 'bridge'].forEach(k => { s.refs[k].style.opacity = '1'; });
}

// The ordinary wiring (bridge, veth Pod, and the portmap rule that exists only for hostPort) is not what a
// hostNetwork Pod uses, so those blocks dim while that case is on screen, and the other way round.
function only(s, which) {
  const idle = which === 'hostnet' ? ['podApp', 'bridge', 'portmap'] : ['podAgent'];
  idle.forEach(k => { s.refs[k].style.opacity = DIM; });
}

const STEPS = [
  {
    id: 'idle',
    duration: 1500,
    narration: 'By default a Pod gets its own network namespace, one Pod IP out of the Node podCIDR, and a veth pair into the cni0 bridge. Nothing on the Node listens on its behalf, so the Node address knows nothing about it. Two fields opt out of that, and the infrastructure Pods of any cluster are built on them.',
    enter(s) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setBoxSublabel(s.refs.portmap, 'none');
      setPodSublabel(s.refs.podApp, '10.244.1.5');
      setVal(s.refs.nsChip, 'own');
      setVal(s.refs.ipChip, '10.244.1.5');
      setVal(s.refs.vethChip, 'yes');
      setVal(s.refs.portChip, 'Pod IP only');
      setWire(s, 'veth', 'veth pair');
    },
  },
  {
    id: 'hostnetwork',
    // Motion: entry(700) + hop beat(100) + lane(700) = 1500, then the Pod pulse (900) ends at 2400.
    duration: 3000,
    narration: 'With hostNetwork true the Pod gets no namespace of its own at all. It runs inside the Node namespace, so there is no veth, no Pod IP and no bridge in the path: the container binds straight to the Node interfaces. A client that dials 192.168.1.20:80 is served by the Pod with no NAT anywhere, which is exactly how kube-proxy, the CNI agent and node-exporter run.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      only(s, 'hostnet');
      setBoxSublabel(s.refs.portmap, 'none');
      setPodSublabel(s.refs.podApp, '10.244.1.5');
      setVal(s.refs.nsChip, 'the Node one');
      setVal(s.refs.ipChip, '192.168.1.20 (Node)');
      setVal(s.refs.vethChip, 'none');
      setVal(s.refs.portChip, 'Node IP :80');
      s.refs.client.classList.add('highlight');
      s.refs.nsChip.classList.add('highlight');
      s.refs.ipChip.classList.add('highlight');
      s.refs.vethChip.classList.add('highlight');
      if (ctx.reduced) { s.refs.eth.classList.add('highlight'); s.refs.podAgentBox.classList.add('highlight'); return; }
      // Down-arrow all the way: the request lands on the Node NIC, which lights on arrival, and goes on to
      // the Pod with no rewrite of any kind, so the same Node address rides the ball the whole way.
      const inb = segmentPacket(s, ctx, { from: ENTRY[0], to: ENTRY[1], cat: 'network' });
      ridingLabel(s, ctx, 'dst 192.168.1.20:80', ENTRY, { easing: 'linear' });
      lightBoxAt(s.refs.eth, ctx, inb.arrivalMs);
      const outDelay = inb.arrivalMs + BEAT.afterHop;
      const out = routePacket(s, ctx, TO_AGENT, { delay: outDelay, cat: 'network' });
      ridingLabel(s, ctx, 'dst 192.168.1.20:80', TO_AGENT, { delay: outDelay });
      pulsePod(s.refs.podAgent, ctx, out.arrivalMs);
    },
  },
  {
    id: 'hostnetwork-cost',
    duration: 2400,
    narration: 'The price is the Node port space and the isolation. The container listens on the Node itself, so a second Pod that wants the same port cannot be scheduled here at all, and the Pod sees every Node interface with nothing of its own between it and the host. That is a privilege for the agents that must see the Node, not for applications.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      only(s, 'hostnet');
      setBoxSublabel(s.refs.portmap, 'none');
      setVal(s.refs.nsChip, 'the Node one');
      setVal(s.refs.ipChip, '192.168.1.20 (Node)');
      setVal(s.refs.vethChip, 'none');
      setVal(s.refs.portChip, 'Node IP :80');
      s.refs.eth.classList.add('highlight');
      s.refs.nsChip.classList.add('highlight');
      s.refs.portChip.classList.add('highlight');
      // Reflective beat: nothing travels, so nothing moves. The chips and the NIC the Pod now shares
      // simply light, exactly as the cost step of the External Traffic card does.
    },
  },
  {
    id: 'hostport',
    // Motion: entry(700) + beat + rule hop(700) + beat + rewrite route(700) + beat + veth(700) = 3100,
    // then the Pod pulse (900) ends at 4000. The floor leaves a settle.
    duration: 4400,
    narration: 'hostPort is the smaller hammer. The Pod keeps its own namespace, its Pod IP and its veth, and the CNI portmap plugin only adds one DNAT rule on the Node: anything arriving at 192.168.1.20:8080 is rewritten to 10.244.1.5:80 and then delivered down the ordinary bridge and veth. The Pod is reachable from the LAN and still never learns that it was.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      only(s, 'hostport');
      setBoxSublabel(s.refs.portmap, 'nodeIP:8080 -> pod:80');
      setPodSublabel(s.refs.podApp, '10.244.1.5 · hostPort 8080');
      setVal(s.refs.nsChip, 'own');
      setVal(s.refs.ipChip, '10.244.1.5');
      setVal(s.refs.vethChip, 'yes');
      setVal(s.refs.portChip, 'Node IP :8080');
      setWire(s, 'veth', 'veth pair');
      s.refs.client.classList.add('highlight');
      s.refs.portChip.classList.add('highlight');
      s.refs.vethChip.classList.add('highlight');
      if (ctx.reduced) {
        ['eth', 'portmap', 'bridge'].forEach(k => s.refs[k].classList.add('highlight'));
        s.refs.podAppBox.classList.add('highlight');
        return;
      }
      // Down-arrow chain: the request lands on the NIC, is matched by the portmap rule, and the rewrite
      // happens INSIDE that box, so the ball re-emerges at its bottom edge already carrying the Pod
      // address. From there it takes the ordinary path, bridge then veth, and the Pod pulses on arrival.
      const inb = segmentPacket(s, ctx, { from: ENTRY[0], to: ENTRY[1], cat: 'network' });
      ridingLabel(s, ctx, 'dst 192.168.1.20:8080', ENTRY, { easing: 'linear' });
      lightBoxAt(s.refs.eth, ctx, inb.arrivalMs);
      const pmDelay = inb.arrivalMs + BEAT.afterHop;
      const toPm = segmentPacket(s, ctx, { from: TO_PM[0], to: TO_PM[1], delay: pmDelay, cat: 'network' });
      lightBoxAt(s.refs.portmap, ctx, toPm.arrivalMs);
      const brDelay = toPm.arrivalMs + BEAT.afterHop;
      const toBr = routePacket(s, ctx, PM_TO_BRIDGE, { delay: brDelay, cat: 'network' });
      ridingLabel(s, ctx, 'dst 10.244.1.5:80', PM_TO_BRIDGE, { delay: brDelay, emerge: 150 });
      lightBoxAt(s.refs.bridge, ctx, toBr.arrivalMs);
      const vethDelay = toBr.arrivalMs + BEAT.afterHop;
      const toPod = segmentPacket(s, ctx, { from: VETH[0], to: VETH[1], delay: vethDelay, cat: 'network' });
      pulsePod(s.refs.podApp, ctx, toPod.arrivalMs);
    },
  },
  {
    id: 'tradeoff',
    duration: 2600,
    narration: 'Both fields spend the same scarce thing, a port on the Node, so the scheduler counts a hostPort as a Node resource and only one replica of that Pod can land here. The difference is what you give up: hostNetwork hands the Node namespace to the container and suits the agents that must see it, while hostPort keeps the Pod isolated and punches a single port through to it. Everything else belongs behind a Service.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      // Both cases are on screen side by side for the comparison, so nothing is dimmed here.
      setBoxSublabel(s.refs.portmap, 'nodeIP:8080 -> pod:80');
      setPodSublabel(s.refs.podApp, '10.244.1.5 · hostPort 8080');
      setVal(s.refs.nsChip, 'own or the Node one');
      setVal(s.refs.ipChip, 'Pod IP or Node IP');
      setVal(s.refs.vethChip, 'yes or none');
      setVal(s.refs.portChip, 'one per Node either way');
      setWire(s, 'veth', 'veth pair');
      s.refs.nsChip.classList.add('highlight');
      s.refs.portChip.classList.add('highlight');
      // Reflective beat, same as the other cost step: the chips carry the comparison, nothing travels.
    },
  },
];

export const init = makeInit(Scene, STEPS, { posterFirst: true });
