import { P, F, defineCard } from './network-kit.js';
import { rect } from '../../lib/svg.js';
import { podShell } from '../../lib/primitives.js';

// Design notes for this card: ./CARDS.md#network-namespaces


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
// packet). The empty role keeps the neutral hue the hand-written call had, since it passed none.
const dashLink = (key, x1, y1, x2, y2) => P.relation({ key, points: [[x1, y1], [x2, y2]], role: '' });

// The netns shell and the shared-stack band sit as plain siblings inside podGroup, and no part kind
// emits a lone podShell or a bare rect, so both are P.raw and hand their role to the primitive.
const netnsShell = () => podShell({ x: POD_LEFT, y: POD_TOP, w: POD_W, h: POD_H, label: 'Pod NETNS', sublabel: 'isolated stack · 10.244.1.5', containers: 0, role: 'network' });
// `width`/`height`, not `w`/`h`: svg.js sets whatever key it is handed as an ATTRIBUTE, and an SVG
// rect with no width renders nothing, so this band was in the DOM and invisible since it was written.
const stackBand = () => rect({ class: 'netns-stack-band', x: BAND_CX - 204, y: 276, width: 408, height: 122, rx: 10,
  style: 'fill:rgba(79,229,255,0.035);stroke:rgba(79,229,255,0.28);stroke-width:1' });

// Z-order: host stack, then pod shell + band + rail/taps, then the interface/container boxes over
// the rail, then the veth cable + wire labels, then chips, then the packet layer on top.
export const SCENE = {
  'aria-label': 'Network namespaces: the pause container holds one isolated network stack with its own interfaces, routing table and ports, every container in the Pod shares it and reaches the others over localhost, and a veth pair is the only link between the Pod namespace and the host namespace',
  parts: [
    P.defs(),
    P.box({ key: 'host', x: 150, y: HOST_Y, w: 260, h: HOST_H, label: 'Host NETNS', sublabel: 'node NICs · routes · iptables' }),
    P.group({
      key: 'podGroup',
      parts: [
        P.raw({ make: netnsShell }),
        P.raw({ make: stackBand }),
        P.tag({ x: BAND_CX, y: 420, text: 'shared network stack' }),
        dashLink('rail', COL_L, RAIL_Y, COL_R, RAIL_Y),          // the shared stack bus
        dashLink('tapApp', COL_L, ROW_TOP_BOT, COL_L, RAIL_Y),   // app     -> rail
        dashLink('tapSide', COL_R, ROW_TOP_BOT, COL_R, RAIL_Y),  // sidecar -> rail
        dashLink('tapEth', COL_L, ROW_BOT, COL_L, RAIL_Y),       // eth0    -> rail
        dashLink('tapLo', COL_R, ROW_BOT, COL_R, RAIL_Y),        // lo      -> rail
        // The four boxes drawn inside the Pod go INSIDE its group, so the pulse reaches them: a Pod
        // blinks as one thing and everything drawn inside it blinks with it (2026-07-29).
        P.box({ key: 'eth0', x: COL_L - 79, y: ROW_BOT, w: 158, h: IFACE_H, label: 'eth0', sublabel: '10.244.1.5' }),
        P.box({ key: 'lo', x: COL_R - 79, y: ROW_BOT, w: 158, h: IFACE_H, label: 'lo', sublabel: '127.0.0.1' }),
        // Containers (tenants) on top, the shared stack (eth0 + lo) on the row below.
        P.box({ key: 'app', x: COL_L - 79, y: ROW_TOP, w: 158, h: ROW_TOP_H, label: 'app', sublabel: 'container' }),
        P.box({ key: 'side', x: COL_R - 79, y: ROW_TOP, w: 158, h: ROW_TOP_H, label: 'sidecar', sublabel: 'container' }),
      ],
    }),
    // veth pair host stack -> Pod namespace: the only cross-namespace link, a single dashed cable
    // that plugs into the Pod netns boundary (its in-Pod end is eth0, just inside).
    P.arrow({ key: 'vethWire', x1: HOST_EDGE, y1: AXIS_Y, x2: POD_LEFT, y2: AXIS_Y, dashed: true, dim: true }),
    P.wire({ key: 'veth', x: 505, y: AXIS_Y - 12 }),
    P.wire({ key: 'local', x: BAND_CX, y: RAIL_Y - 12 }),
    // Info chips centered under the diagram: the row spans exactly host-left (150) to Pod-right (1048).
    P.chip({ key: 'scopeChip', x: 150, y: 500, w: 210, h: 34, name: 'namespace', value: 'host' }),
    P.chip({ key: 'ifaceChip', x: 376, y: 500, w: 205, h: 34, name: 'interfaces', value: 'node NICs' }),
    P.chip({ key: 'portChip', x: 597, y: 500, w: 180, h: 34, name: 'ports', value: 'private' }),
    P.chip({ key: 'reachChip', x: 793, y: 500, w: 255, h: 34, name: 'reach', value: 'node + beyond' }),
    P.packets(),
  ],
  reset: {
    keys: ['host', 'app', 'side', 'lo', 'eth0', 'scopeChip', 'ifaceChip', 'portChip', 'reachChip'],
    pods: ['podGroup'],
  },
};

export const STEPS_SPEC = [
  {
    id: 'idle',
    duration: 1500,
    chips: { scopeChip: 'host', ifaceChip: 'node NICs', portChip: 'shared', reachChip: 'node + beyond' },
  },
  {
    id: 'fresh',
    duration: 2200,
    narration: 'When the Pod sandbox starts, the pause container is handed a brand new network namespace. At first it holds only a loopback device and nothing else, fully cut off from the host stack and from every other Pod. It cannot yet reach anything outside itself.',
    chips: { scopeChip: 'pod', ifaceChip: 'lo only', portChip: 'shared', reachChip: 'isolated' },
    // Only lo is live yet: every block and wire is drawn, but lo is the one that lights. Nothing
    // flows in or out yet, so lo simply holds its highlight outline, no flash.
    lit: ['lo', 'ifaceChip', 'reachChip', 'scopeChip'],
  },
  {
    id: 'veth',
    duration: 2400,
    narration: 'CNI then adds a veth pair: one end becomes eth0 inside the Pod namespace with the Pod IP, the peer stays in the host namespace, plugged straight into the host stack. That single cable is the only path between the two stacks, so all Pod traffic to the Node and beyond crosses it.',
    chips: { scopeChip: 'pod', ifaceChip: 'lo + eth0', portChip: 'shared', reachChip: 'node + beyond' },
    wires: { veth: 'veth pair' },
    // The host link comes alive: the host stack lights, and the packet that rides the veth lights eth0.
    lit: ['host', 'ifaceChip', 'reachChip'],
    // Down-arrow: the packet crosses the veth from the host side into eth0, which lights on arrival,
    // then the pod shell pulses as the namespace gains reach.
    flow: [
      F.segment({ from: [HOST_EDGE, AXIS_Y], to: [POD_LEFT, AXIS_Y], name: 'hop', lights: ['eth0'] }),
      F.pulse({ pod: 'podGroup', at: 'hop' }),
    ],
  },
  {
    id: 'shared',
    duration: 2600,
    narration: 'Every container in the Pod joins this same namespace, so app and sidecar share one eth0 and one set of ports. They reach each other over 127.0.0.1 with no network hop, which is why two containers in a Pod cannot both bind the same port.',
    chips: { scopeChip: 'pod', ifaceChip: 'lo + eth0', portChip: 'shared', reachChip: 'node + beyond' },
    wires: { local: 'localhost' },
    // Every container now shares the one stack: app, sidecar and eth0 all light, lo lights on arrival.
    lit: ['app', 'eth0', 'portChip'],
    flow: [
      F.route({ points: LOCAL_PATH, lights: ['side', 'lo'] }),
    ],
  },
  {
    id: 'isolation',
    duration: 2600,
    narration: 'Because the stack is private, the Pod has its own routing table, its own iptables and its own port space, all separate from the host and from other Pods. Delete the Pod and the namespace is torn down, releasing the veth and the IP in one move.',
    chips: { scopeChip: 'pod · private', ifaceChip: 'lo + eth0', portChip: 'own space', reachChip: 'node + beyond' },
    wires: { veth: 'veth pair' },
    // The veth still links the two stacks here, so keep the host lit and the cable bright instead of
    // letting it read as a dead line: this is the contrast the step is about (pod-private vs host).
    lit: ['host', 'eth0', 'lo', 'scopeChip', 'portChip', 'reachChip'],
    // No new traffic: the whole shared stack (shell + band + rail) pulses to mark the isolated
    // stack as the unit that lives and dies as one.
    flow: [
      F.pulse({ pod: 'podGroup' }),
    ],
  },
];

export const init = defineCard(SCENE, STEPS_SPEC, { posterFirst: true });
