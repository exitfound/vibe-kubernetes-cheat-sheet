import { pod } from '../../lib/primitives.js';
import { P, F, defineCard } from './network-kit.js';

// Design notes for this card: ./CARDS.md#network-pod-ip-and-veth


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

const APP_LEAD = 300; // brief lead so the app outline registers before the ball departs

// The list order IS the append order, which is the z-order: the Node frame, the blocks, then the
// wires and their labels ON TOP of the blocks, then the chip strip, and the packet layer last.
export const SCENE = {
  'aria-label': 'A Pod network namespace and its veth pair: the pause container owns one namespace shared by every container, the CNI assigns a single Pod IP, and a veth pair links the namespace to the host bridge',
  parts: [
    P.defs(),
    P.node({ key: 'nodeEl', x: NODE_X, y: NODE_Y, w: NODE_W, h: NODE_H, label: 'Node-1   ·   root namespace' }),
    P.box({ key: 'cni0', x: BR_X, y: CBOX_Y, w: BR_W, h: CBOX_H, label: 'cni0', sublabel: 'host bridge' }),
    // CNI plugin sits inside the Node, above the bridge it programs.
    P.box({ key: 'cniPlugin', x: BR_X, y: PLUGIN_Y, w: BR_W, h: PLUGIN_H, label: 'CNI plugin', sublabel: 'veth + IPAM' }),
    // One group, not three siblings: pulsePod matches descendants only, so a bare shell never
    // gets the brightness half of the pulse.
    P.group({
      key: 'podGroup',
      parts: [
        // A bare pod(), NOT podShell(): this card ships without the washed shell fill, and it holds
        // two sibling containers rather than the single inner box P.pod builds. Hence P.raw.
        P.raw({
          key: 'podShell',
          make: () => pod({ x: POD_X, y: POD_Y, w: POD_W, h: POD_H, label: 'Pod', sublabel: 'netns: not ready', containers: 0, role: 'network' }),
        }),
        P.box({ key: 'pauseBox', x: PAUSE_X, y: CBOX_Y, w: CBOX_W, h: CBOX_H, label: 'pause', sublabel: 'netns owner' }),
        P.box({ key: 'appBox', x: APP_X, y: CBOX_Y, w: CBOX_W, h: CBOX_H, label: 'app', sublabel: 'shares netns' }),
      ],
    }),
    // veth pair: cni0 peer to the Pod eth0 (right edge of the shell). The CNI configures the
    // IP and link into the Pod, so the arrow points cni0 -> Pod and the packet rides with it.
    P.arrow({ from: VETH[0], to: VETH[1], dashed: true, dim: true }),
    // CNI plugin exec wire down to the bridge.
    P.arrow({ from: CNI_EXEC[0], to: CNI_EXEC[1], dashed: true, dim: true }),
    // localhost loopback inside the shared namespace: a plain dashed link (no direction),
    // both containers simply share one loopback.
    P.relation({ key: 'loWire', points: LOOPBACK }),
    P.wire({ key: 'veth', x: (POD_R + BR_X) / 2, y: LINK_Y + WIRE_LABEL_DY }),
    P.wire({ key: 'lo', x: (PAUSE_R + APP_X) / 2, y: LINK_Y + WIRE_LABEL_DY }),
    P.chip({ key: 'nsChip', x: CHIP_X[0], y: CHIP_Y, w: CHIP_W[0], h: CHIP_H, name: 'namespace', value: 'not ready' }),
    P.chip({ key: 'ipChip', x: CHIP_X[1], y: CHIP_Y, w: CHIP_W[1], h: CHIP_H, name: 'Pod IP', value: 'none' }),
    P.chip({ key: 'vethChip', x: CHIP_X[2], y: CHIP_Y, w: CHIP_W[2], h: CHIP_H, name: 'veth pair', value: 'none' }),
    P.chip({ key: 'reachChip', x: CHIP_X[3], y: CHIP_Y, w: CHIP_W[3], h: CHIP_H, name: 'app to pause', value: 'none' }),
    P.packets(),
  ],
  reset: {
    keys: ['cni0', 'cniPlugin', 'pauseBox', 'appBox', 'nsChip', 'ipChip', 'vethChip', 'reachChip'],
    pods: ['podGroup'],
    // The loopback is drawn as a relationship (shared facility, no direction, no arrowhead) and so
    // sits recessed, but one step sends a ball along it. Reset here, raised in that step.
    extra(s) { s.refs.loWire.style.strokeOpacity = ''; },
  },
};

export const STEPS_SPEC = [
  {
    id: 'idle',
    duration: 1500,
    chips: { nsChip: 'not ready', ipChip: 'none', vethChip: 'none', reachChip: 'none' },
    podSublabels: { podShell: 'netns: not ready' },
  },
  {
    id: 'sandbox',
    duration: 2100,
    narration: 'The pause container is started first by the runtime, and it holds the Pod network namespace open. Because pause owns that namespace, every other container in the Pod is later joined into it rather than getting its own, which is what makes them one network endpoint.',
    chips: { nsChip: 'shared · owned by pause', ipChip: 'none', vethChip: 'none', reachChip: 'none' },
    podSublabels: { podShell: 'netns: open' },
    // The pause box and the namespace chip keep a static highlight border for the whole
    // step (no pulse, no flash, no fade back) since they show the settled shared-netns state.
    lit: ['pauseBox', 'nsChip'],
  },
  {
    id: 'cni-add',
    duration: 2400,
    narration: 'The CNI plugin is then called by the runtime with the namespace path. It allocates one IP for the Pod through its IPAM, creates a veth pair, moves one end into the namespace as eth0 and attaches the peer to cni0 on the host. The Pod now has a single routable address and a link to the Node.',
    chips: { nsChip: 'shared · owned by pause', ipChip: '10.244.1.5', vethChip: 'eth0 <-> veth', reachChip: 'none' },
    wires: { veth: 'eth0 <-> veth' },
    podSublabels: { podShell: 'IP 10.244.1.5' },
    lit: ['cniPlugin', 'ipChip', 'vethChip'],
    // CNI execs (plugin -> bridge), then the IP and link are configured into the Pod over the veth.
    // The bridge is the receiver of that exec, so it lights when the ball lands on it.
    flow: [
      F.segment({ from: CNI_EXEC[0], to: CNI_EXEC[1], name: 'exec', lights: ['cni0'] }),
      F.segment({ from: VETH[0], to: VETH[1], after: 'exec', name: 'conf' }),
      F.pulse({ pod: 'podGroup', at: 'conf' }),
    ],
  },
  {
    id: 'shared',
    duration: 2200,
    narration: 'With the namespace in place, the app container is joined into it instead of getting its own. Every container in the Pod now shares one IP, one routing table and one loopback, so they reach each other over localhost. To the rest of the cluster the whole Pod is a single endpoint at 10.244.1.5.',
    chips: { nsChip: 'shared · owned by pause', ipChip: '10.244.1.5', vethChip: 'eth0 <-> veth', reachChip: 'localhost' },
    wires: { lo: '127.0.0.1' },
    podSublabels: { podShell: 'IP 10.244.1.5' },
    lit: ['appBox', 'reachChip'],
    // stroke-opacity is the one thing no field writes: the loopback carries the ball on this step,
    // so it is raised from its recessed rest here and put back by reset.extra.
    enter(s) { s.refs.loWire.style.strokeOpacity = '1'; },
    flow: [
      F.segment({ from: LOOPBACK[0], to: LOOPBACK[1], delay: APP_LEAD, lights: ['pauseBox'] }),
    ],
  },
];

export const init = defineCard(SCENE, STEPS_SPEC, { posterFirst: true });
