import { P, F, defineCard, laneY, BEAT } from './network-kit.js';

// Design notes for this card: ./CARDS.md#network-pod-to-pod-same-node


const POD_MID = 380;          // vertical centre of the pod / cni0 blocks
const LANE = 12;              // half-gap between the two veth lanes
const { out: TOP_Y, back: BOT_Y } = laneY(POD_MID, LANE);   // 368 forward (A -> B), 392 return (B -> A)
const HOP = 800;              // ball travel per veth hop, a touch slower than the 700ms
                              // floor so the direction of each hop reads clearly

// The veth pair as four directional legs, two per lane. The dim dashed wire and the bright ball
// share these endpoints exactly, so the motion always has a matching arrow under it.
const A_OUT = [[350, TOP_Y], [505, TOP_Y]];   // A    -> cni0
const B_IN  = [[675, TOP_Y], [850, TOP_Y]];   // cni0 -> B
const B_OUT = [[850, BOT_Y], [675, BOT_Y]];   // B    -> cni0 (reply)
const A_IN  = [[505, BOT_Y], [350, BOT_Y]];   // cni0 -> A    (reply)

const POD_INNER = { dx: 20, dy: 37, w: 160, h: 56, label: 'app', sublabel: 'eth0' };

// The list order IS the append order, which is the z-order: chips first, then the Node frame and
// its blocks, then the veth wires + labels ABOVE them, and the packet layer on the very top.
export const SCENE = {
  'aria-label': 'Pod-to-Pod traffic on the same Node: Pod A reaches Pod B through the cni0 bridge over a pair of veth links, with no NAT and no encapsulation',
  parts: [
    P.defs(),
    P.chip({ key: 'srcChip', x: 80, y: 540, w: 250, h: 34, name: 'src', value: '10.244.1.5' }),
    P.chip({ key: 'dstChip', x: 350, y: 540, w: 250, h: 34, name: 'dst', value: '10.244.1.6' }),
    P.chip({ key: 'pathChip', x: 620, y: 540, w: 250, h: 34, name: 'datapath', value: 'L2 bridge' }),
    P.chip({ key: 'natChip', x: 890, y: 540, w: 230, h: 34, name: 'NAT', value: 'none' }),
    P.node({ key: 'nodeEl', x: 80, y: 255, w: 1040, h: 250, label: 'Node-1   ·   10.244.1.0/24' }),
    P.box({ key: 'cni0', x: 505, y: 345, w: 170, h: 70, label: 'cni0', sublabel: 'L2 bridge' }),
    P.pod({ key: 'podA', innerKey: 'podABox', x: 150, y: 315, w: 200, h: 130, label: 'Pod A', sublabel: '10.244.1.5', inner: POD_INNER }),
    P.pod({ key: 'podB', innerKey: 'podBBox', x: 850, y: 315, w: 200, h: 130, label: 'Pod B', sublabel: '10.244.1.6', inner: POD_INNER }),
    // The four veth legs carry NO role on purpose: they are dim dashed infrastructure and keep the
    // neutral arrowhead, which the category default would replace with the cyan one.
    P.arrow({ from: A_OUT[0], to: A_OUT[1], dashed: true, dim: true, role: '' }),
    P.arrow({ from: B_IN[0], to: B_IN[1], dashed: true, dim: true, role: '' }),
    P.arrow({ from: B_OUT[0], to: B_OUT[1], dashed: true, dim: true, role: '' }),
    P.arrow({ from: A_IN[0], to: A_IN[1], dashed: true, dim: true, role: '' }),
    P.wire({ key: 'a', x: 427, y: TOP_Y - 12 }),
    P.wire({ key: 'b', x: 762, y: TOP_Y - 12 }),
    P.packets(),
  ],
  // The inner app boxes are listed BY KEY (NET.S-02): a pod group only has its pulse strokes reset,
  // so a .highlight left inside one by a reduced replay would ride into every later step.
  reset: {
    keys: ['cni0', 'podABox', 'podBBox', 'srcChip', 'dstChip', 'pathChip', 'natChip'],
    pods: ['podA', 'podB'],
  },
};

const VETH = 'veth · eth0';
const SRC = '10.244.1.5';
const DST = '10.244.1.6';

export const STEPS_SPEC = [
  {
    id: 'idle',
    duration: 1500,
    chips: { pathChip: 'L2 bridge', natChip: 'none', srcChip: SRC, dstChip: DST },
  },
  {
    id: 'arp',
    duration: 5300,
    narration: 'A does not yet know the MAC behind 10.244.1.6, so it broadcasts an ARP request out eth0. The veth peer hands it to cni0, the Node Linux bridge, which floods it out every other port. B sees its own IP and unicasts an ARP reply with its MAC back to A, and from that reply the bridge learns which port B sits on.',
    chips: { pathChip: 'ARP who-has .6', natChip: 'none', srcChip: SRC, dstChip: DST },
    wires: { a: VETH, b: VETH },
    lit: ['pathChip'],
    // The animated path says both Pods handled the exchange by PULSING them, which no cue names.
    reducedLit: ['podABox', 'podBBox'],
    // A broadcasts first (blink, then the request departs at BEAT.afterPulse). The request floods
    // A -> bridge -> B on the top lane, the reply comes back B -> bridge -> A on the bottom.
    flow: [
      F.pulse({ pod: 'podA' }),
      F.segment({ from: A_OUT[0], to: A_OUT[1], delay: BEAT.afterPulse, dur: HOP, name: 'req1', lights: ['cni0'] }),
      F.segment({ from: B_IN[0], to: B_IN[1], after: 'req1', dur: HOP, name: 'req2' }),
      F.segment({ from: B_OUT[0], to: B_OUT[1], after: 'req2', dur: HOP, name: 'rep1' }),
      F.segment({ from: A_IN[0], to: A_IN[1], after: 'rep1', dur: HOP, name: 'rep2' }),
      F.pulse({ pod: 'podB', at: 'req2' }),
      F.pulse({ pod: 'podA', at: 'rep2' }),
    ],
  },
  {
    id: 'forward',
    duration: 3500,
    narration: 'With the MAC for B resolved and its bridge port learned, A sends the actual data frame as a unicast. It crosses the veth onto cni0, which switches it straight out the veth peer to B eth0. This is plain layer 2 forwarding inside the Node, so the packet never touches the physical NIC.',
    chips: { pathChip: 'L2 bridge', natChip: 'none', srcChip: SRC, dstChip: DST },
    wires: { a: VETH, b: VETH },
    lit: ['pathChip'],
    // Both Pods are said to send and receive by PULSING them, and no cue names either inner box.
    reducedLit: ['podABox', 'podBBox'],
    // A pulses FIRST and fully, the data frame departs only after that blink lands, then rides the
    // forward lane A -> bridge -> B in two hops. The bridge lights on arrival and never pulses.
    flow: [
      F.pulse({ pod: 'podA' }),
      F.segment({ from: A_OUT[0], to: A_OUT[1], delay: BEAT.afterPulse, dur: HOP, name: 'hop1', lights: ['cni0'] }),
      F.segment({ from: B_IN[0], to: B_IN[1], after: 'hop1', dur: HOP, name: 'hop2' }),
      F.pulse({ pod: 'podB', at: 'hop2' }),
    ],
  },
  {
    id: 'no-nat',
    duration: 2100,
    narration: 'B receives the packet with A real source IP intact. Same-node Pod-to-Pod traffic is never rewritten: there is no SNAT, no DNAT and no overlay encapsulation, just one bridge hop between two veth ports. Every Pod IP is routable inside the cluster, which is the flat-network promise of the Kubernetes model.',
    chips: { pathChip: 'L2 bridge', natChip: 'none · src preserved', srcChip: SRC, dstChip: DST },
    wires: { b: VETH },
    lit: ['srcChip', 'dstChip', 'natChip'],
    // B is shown as the receiver by its PULSE alone, and this step fires no cue at all.
    reducedLit: ['podBBox'],
    // Info chips get the strict static highlight only, no flash. Just the pod pulses.
    flow: [
      F.pulse({ pod: 'podB' }),
    ],
  },
];

export const init = defineCard(SCENE, STEPS_SPEC, { posterFirst: true });
