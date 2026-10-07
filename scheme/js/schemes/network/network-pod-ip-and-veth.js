import { g, path } from '../../lib/svg.js';
import { box } from '../../lib/primitives.js';
import { P, F, defineCard, ladder, midX, BEAT } from './network-kit.js';

// Design notes for this card: ./CARDS/network-pod-ip-and-veth.md

// Every element opens right of the narration panel or below it: the Node frame at x=420, the chip
// column at y=246.
const NODE_X = 420, NODE_Y = 130, NODE_W = 720;                 // height derived below
const IN_PAD = 30;
const IN_L = NODE_X + IN_PAD, IN_R = NODE_X + NODE_W - IN_PAD;

// The shell interior as a rhythm, so the shell HEIGHT is the sum of its parts: label band, two rows
// at one pitch, a third dropped clear, and the foot the sublabel prints in.

// Two containers and one interface, not three peers: eth0 drops clear by SPLIT_GAP because step
// `unit` claims both containers stand on that one eth0.
const ROW_H = 56, ROW_GAP = 20, SPLIT_GAP = 36, ROWS = 3, LABEL_BAND = 36, FOOT = 38;
const POD_X = IN_L, POD_W = 310, POD_Y = 208;
const POD_H = LABEL_BAND + ROWS * ROW_H + ROW_GAP + SPLIT_GAP + FOOT;

// The Pod shell right wall is the namespace boundary: the dashed segments below continue this x, so
// the line dividing the Node is the Pod edge extended. The two namespaces are peers.
const NS_X = POD_X + POD_W;

const rowY = ladder({ y: POD_Y + LABEL_BAND, rowH: ROW_H, gap: ROW_GAP });
const ETH_Y = rowY(1) + ROW_H + SPLIT_GAP;                      // dropped clear of the pair above
const LINK_Y = ETH_Y + ROW_H / 2;                               // the row both ends stand on
// Derived off the shell, so the margins over and under the Pod match and the two boundary
// segments come out the same length.
const NODE_H = (POD_Y - NODE_Y) * 2 + POD_H;

// NET.L-01 width. The inset is derived from the shell, so widening the shell keeps the boxes at 232.
const BOX_W = 232;
const BOX_X = POD_X + (POD_W - BOX_W) / 2;

// The root namespace side. The host end and the bridge share ONE column, the peer directly under
// the bridge it is a port on, and the column closes on the frame interior edge.
const PEER_X = IN_R - BOX_W;
const PEER_CX = PEER_X + BOX_W / 2;
const CNI_Y = 220, CNI_H = 80;
const TAG_Y = 186;                                              // the two territory captions, over the taller of the two zone tops

// The boundary continued above and below the shell: one element, two subpaths. `P.relation` is the
// recession treatment here, not a relationship claim (NET.A-04). Each segment stops clear of the shell
// (L-11).
const RULE_GAP = 8, RULE_INSET = 14;
const NS_RULE_D = `M ${NS_X} ${NODE_Y + RULE_INSET} L ${NS_X} ${POD_Y - RULE_GAP} `
  + `M ${NS_X} ${POD_Y + POD_H + RULE_GAP} L ${NS_X} ${NODE_Y + NODE_H - RULE_INSET}`;

// The veth lane runs face to face from eth0 to its peer, crossing the boundary: starting it on the
// shell wall would make the Pod edge the end of the pair, the claim this card corrects.
const ETH_R = BOX_X + BOX_W;                                    // the Pod end face
const VETH = [[ETH_R, LINK_Y], [PEER_X, LINK_Y]];               // eth0 -> host end
const PORT = [[PEER_CX, ETH_Y], [PEER_CX, CNI_Y + CNI_H]];      // host end -> cni0

// Two end ticks, so the pair reads as one object with two ends. The body is the ordinary dashed dim
// lane, and `CAP_IN` keeps each tick inboard of the face so it does not vanish into the box stroke.
const CAP_H = 18, CAP_IN = 20;
// Reads its two endpoints OUT OF `VETH`, the same array the lane and the packet take, so the ticks
// cannot drift off the ends they mark.
const vethEnds = () => {
  const [[x1, y1], [x2, y2]] = VETH;
  const grp = g({ class: 'scheme-veth-ends' });
  for (const x of [x1 + CAP_IN, x2 - CAP_IN]) {
    grp.appendChild(path({
      class: 'scheme-arrow scheme-arrow-dim scheme-arrow-network', 'data-role': 'network',
      d: `M ${x} ${y1 - CAP_H / 2} L ${x} ${y2 + CAP_H / 2}`, fill: 'none',
    }));
  }
  return grp;
};

// The readout is a column below the panel: a strip across the canvas would cut the namespace
// boundary, and these four chips are facts about one object.
const CHIP_X = 60, CHIP_W = 300, CHIP_H = 34, CHIP_GAP = 22;
const chipY = ladder({ y: 246, rowH: CHIP_H, gap: CHIP_GAP });

const POD_IP = '10.244.1.5/24';
const GW_IP = '10.244.1.1';   // the cni0 address: drawn on `port`, held on `unit`, narrated by `port`

// The three boxes go inside the shell group so the pulse reaches them: buildPod gives one `inner`,
// so the three peers are appended here.
const stack = (el, refs) => {
  refs.pause = box({ x: BOX_X, y: rowY(0), w: BOX_W, h: ROW_H, label: 'pause', sublabel: 'netns owner', role: 'network' });
  refs.app   = box({ x: BOX_X, y: rowY(1), w: BOX_W, h: ROW_H, label: 'app', sublabel: 'shares the netns', role: 'network' });
  refs.eth0  = box({ x: BOX_X, y: ETH_Y,   w: BOX_W, h: ROW_H, label: 'eth0', sublabel: 'in pod netns', role: 'network' });
  for (const k of ['pause', 'app', 'eth0']) el.appendChild(refs[k]);
};

// The list order IS the append order, which is the z-order: Node frame, boundary, Pod and bridge
// column, the lanes with end ticks and captions above them, the chip column, then the packet layer.
export const SCENE = {
  'aria-label': 'A veth pair drawn as one link with two ends: eth0 stands inside the Pod network namespace carrying 10.244.1.5, its peer stands in the Node root namespace carrying no address of its own and enslaved to the cni0 bridge which holds 10.244.1.1 instead, a packet entering one end leaves the other with no lookup in between, and every container in the Pod shares that one interface and that one address',
  parts: [
    P.defs(),
    P.node({ key: 'nodeEl', x: NODE_X, y: NODE_Y, w: NODE_W, h: NODE_H, label: 'Node-1' }),
    P.relation({ d: NS_RULE_D }),
    P.pod({
      key: 'podGroup', x: POD_X, y: POD_Y, w: POD_W, h: POD_H,
      label: 'Pod', sublabel: 'one netns, one address', tune: stack,
    }),
    P.box({ key: 'cni0', x: PEER_X, y: CNI_Y, w: BOX_W, h: CNI_H, label: 'cni0', sublabel: 'host bridge' }),
    P.box({ key: 'peer', x: PEER_X, y: ETH_Y, w: BOX_W, h: ROW_H, label: 'vethb3f8a2c7@if2', sublabel: 'in root netns' }),
    P.arrow({ from: VETH[0], to: VETH[1], dashed: true, dim: true }),
    P.raw({ make: vethEnds }),
    P.arrow({ from: PORT[0], to: PORT[1], dashed: true, dim: true }),
    // Three standing captions no step rewrites. `veth pair` centres on the cable, not on one side of
    // the boundary: it names one object.
    P.tag({ x: midX(POD_X, NS_X), y: TAG_Y, text: 'pod netns' }),
    P.tag({ x: midX(PEER_X, IN_R), y: TAG_Y, text: 'root netns' }),
    P.tag({ x: midX(ETH_R, PEER_X), y: LINK_Y - 16, text: 'veth pair' }),
    P.chip({ key: 'linkChip', x: CHIP_X, y: chipY(0), w: CHIP_W, h: CHIP_H, name: 'veth pair', value: 'one link' }),
    P.chip({ key: 'ipChip',   x: CHIP_X, y: chipY(1), w: CHIP_W, h: CHIP_H, name: 'Pod IP', value: 'allocated' }),
    P.chip({ key: 'hostChip', x: CHIP_X, y: chipY(2), w: CHIP_W, h: CHIP_H, name: 'host end', value: 'no address' }),
    P.chip({ key: 'pathChip', x: CHIP_X, y: chipY(3), w: CHIP_W, h: CHIP_H, name: 'datapath', value: 'idle' }),
    P.packets(),
  ],
  reset: {
    // NET.S-02: the boxes inside the shell are listed BY KEY, because clearPodHighlight only clears
    // inline strokes and a `.highlight` set inside a reduced replay would otherwise leak forward.
    keys: ['cni0', 'peer', 'pause', 'app', 'eth0', 'linkChip', 'ipChip', 'hostChip', 'pathChip'],
    pods: ['podGroup'],
  },
};

export const STEPS_SPEC = [
  {
    id: 'idle',
    duration: 1500,
    chips: { linkChip: 'one link', ipChip: 'allocated', hostChip: 'no address', pathChip: 'idle' },
    sublabels: { eth0: 'in pod netns', peer: 'in root netns', cni0: 'host bridge' },
    podSublabels: { podGroup: 'one netns, one address' },
  },
  {
    id: 'pair',
    duration: 2700,
    narration: 'One CNI ADD made this and exited. What it left is a single virtual link with two ends: eth0 stands inside the Pod network namespace and vethb3f8a2c7 stands in the Node root namespace. The @if2 on the host side name is the kernel pointing at the index of the other end.',
    chips: { linkChip: 'two ends, one link', ipChip: 'allocated', hostChip: 'no address', pathChip: 'idle' },
    sublabels: { eth0: 'in pod netns', peer: 'in root netns', cni0: 'host bridge' },
    podSublabels: { podGroup: 'one netns, one address' },
    // An anatomy beat: nothing travels, and what the step shows is the two ends standing in two
    // namespaces with the boundary between them (M-27).
    lit: ['eth0', 'peer', 'linkChip'],
  },
  {
    id: 'address',
    duration: 2600,
    narration: 'Of the two ends only the Pod end is configured with an address. Inside the namespace eth0 carries 10.244.1.5/24, and the host end carries none at all. An address belongs to a network namespace rather than to a cable or to a container, so the thing that has an address here is the Pod.',
    chips: { linkChip: 'two ends, one link', ipChip: POD_IP, hostChip: 'no address', pathChip: 'idle' },
    sublabels: { eth0: POD_IP, peer: 'no address', cni0: 'host bridge' },
    podSublabels: { podGroup: POD_IP },
    lit: ['eth0', 'ipChip'],
    // The chip, the eth0 sublabel and the Pod sublabel are ONE result (P-03, P-04), so `rewind`
    // holds the empty form of all three and one F.set writes them together on the beat the Pod
    // blinks out of. The Pod is what pulses, because the Pod is what gets the address.
    rewind: { chips: { ipChip: 'allocated' }, sublabels: { eth0: 'in pod netns' }, podSublabels: { podGroup: 'one netns, one address' } },
    // The animated path says the address landed by PULSING the Pod, which no lights list can name.
    reducedLit: ['eth0'],
    flow: [
      F.pulse({ pod: 'podGroup' }),
      F.set({
        delay: BEAT.afterPulse,
        chips: { ipChip: POD_IP },
        sublabels: { eth0: POD_IP },
        podSublabels: { podGroup: POD_IP },
      }),
    ],
  },
  {
    id: 'through',
    duration: 2800,
    narration: 'The app sends, and the packet goes out eth0 because on the usual plugins that is the one interface in this namespace facing outward. It enters one end of the pair and leaves the other with no lookup and no decision in between. A veth pair is a point to point link and nothing more.',
    chips: { linkChip: 'two ends, one link', ipChip: POD_IP, hostChip: 'no address', pathChip: 'veth, no lookup' },
    sublabels: { eth0: POD_IP, peer: 'no address', cni0: 'host bridge' },
    podSublabels: { podGroup: POD_IP },
    lit: ['app', 'eth0', 'pathChip'],
    // Up-arrow: the Pod blinks first, the packet leaves the eth0 face a BEAT.afterPulse
    // later, and the host end lights on its arrival (M-18a).
    flow: [
      F.pulse({ pod: 'podGroup' }),
      F.segment({ from: VETH[0], to: VETH[1], delay: BEAT.afterPulse, lights: ['peer'] }),
    ],
  },
  {
    id: 'port',
    duration: 2600,
    narration: 'The host end is put under cni0 as a bridge port, which is what master cni0 means. A port does not answer for anything, so it needs no address of its own, and the frame lands on the bridge rather than in the Node routing table. The address on this side belongs to cni0 instead, at 10.244.1.1.',
    chips: { linkChip: 'two ends, one link', ipChip: POD_IP, hostChip: 'port, no address', pathChip: 'veth to cni0' },
    sublabels: { eth0: POD_IP, peer: 'master cni0', cni0: GW_IP },
    podSublabels: { podGroup: POD_IP },
    // The host end is the sender here, so it is lit before its ball departs and cni0 is cued on the
    // arrival instead (M-18a). Both chips whose value MOVES on this step are cued with it (P-05).
    lit: ['peer', 'hostChip', 'pathChip'],
    flow: [
      F.segment({ from: PORT[0], to: PORT[1], lights: ['cni0'] }),
    ],
  },
  {
    id: 'unit',
    duration: 2700,
    narration: 'The pause container opened this namespace and app joined it, so both of them stand on that one eth0 and answer on that one address. A second container does not bring a second pair and a second address with it. The unit the pair and the address are allocated to is the Pod.',
    chips: { linkChip: 'one pair per Pod', ipChip: POD_IP, hostChip: 'port, no address', pathChip: 'veth to cni0' },
    sublabels: { eth0: POD_IP, peer: 'master cni0', cni0: GW_IP },
    podSublabels: { podGroup: POD_IP },
    // Static close, and the picture is the shell: both containers and the one interface they share
    // stand lit inside one boundary.
    lit: ['pause', 'app', 'eth0', 'linkChip'],
  },
];

export const init = defineCard(SCENE, STEPS_SPEC, { posterFirst: true });
