import { P, F, defineCard, makeRidingLabel, BEAT, OPACITY } from './network-kit.js';

// Design notes for this card: ./CARDS/network-loadbalancer-straight-to-pods.md

// One spine on x 600 carries both flows: traffic DOWN from the client into the balancer, control UP
// from the EndpointSlice through the controller into the target ladder. Two equal Node frames flank
// the spine, mirrored about it, and each balancer leg lands on its frame top.
const CX = 600;
const COL_W = 232, COL_H = 80;                    // NET.L-01: every block on the spine
const COL_X = CX - COL_W / 2;
const COL_R = COL_X + COL_W;
const GAP = 36;                                   // one lane length between spine blocks

const CLIENT_Y = 16;
const LB_Y = CLIENT_Y + COL_H + GAP;
const LB_CY = LB_Y + COL_H / 2;                   // both legs leave the balancer side faces here

// The target ladder, one row per target the balancer can hold, flush under the balancer box.
const ROW_H = 28, ROW_GAP = 6, ROWS = 4;
const LADDER_Y = LB_Y + COL_H + 10;
const LADDER_B = LADDER_Y + ROWS * ROW_H + (ROWS - 1) * ROW_GAP;

const CTRL_Y = LADDER_B + GAP;
const SLICE_Y = CTRL_Y + COL_H + GAP;
const SLICE_B = SLICE_Y + COL_H;

// Node frames: a FRAME_GAP corridor to the spine on each side, the top LEG_DROP under the leg run so
// the leg lands on it.
const FRAME_GAP = 64;
const NODE_W = 340;
const N1_X = COL_X - FRAME_GAP - NODE_W;
const N2_X = COL_R + FRAME_GAP;                   // mirrors Node-1 about CX
const N1_CX = N1_X + NODE_W / 2, N2_CX = N2_X + NODE_W / 2;
const LEG_Y = LADDER_B;                           // the legs run out over the frames at the ladder bottom
const LEG_DROP = 28;
const NODE_Y = LEG_Y + LEG_DROP;

// Inside each frame: the Pod 34 under the frame top, its nodePort chip right under it.
const POD_W = 232, POD_H = 104;
const POD_Y = NODE_Y + 34;
const NP_H = 34, NP_Y = POD_Y + POD_H + 12;
const NODE_H = NP_Y + NP_H + 12 - NODE_Y;
const NODE_B = NODE_Y + NODE_H;

// The two readouts stand in the top right corner, the one corner the narration panel leaves free.
const CHIP_W = NODE_W, CHIP_H = 34;
const CAP1_Y = 26, CHIP1_Y = 34;
const CAP2_Y = 92, CHIP2_Y = 100;

const LEG_X1 = COL_X - FRAME_GAP / 2, LEG_X2 = COL_R + FRAME_GAP / 2;   // mid corridor
const UNDER_Y = SLICE_B + 22;                     // the underlay runs under the whole spine

const TRUNK = [[CX, CLIENT_Y + COL_H], [CX, LB_Y]];
const TO_N1 = [[COL_X, LB_CY], [LEG_X1, LB_CY], [LEG_X1, LEG_Y], [N1_CX, LEG_Y], [N1_CX, NODE_Y]];
const TO_N2 = [[COL_R, LB_CY], [LEG_X2, LB_CY], [LEG_X2, LEG_Y], [N2_CX, LEG_Y], [N2_CX, NODE_Y]];
const UNDER = [[N2_CX, NODE_B], [N2_CX, UNDER_Y], [N1_CX, UNDER_Y], [N1_CX, NODE_B]];
const WATCH = [[CX, SLICE_Y], [CX, CTRL_Y + COL_H]];
const REGISTER = [[CX, CTRL_Y], [CX, LADDER_B]];

// Three tag kinds emerge instead of showing before departure, each because of where it starts: the
// spine hop tags on a box face, the Node-1 tag under the narration panel, the SNAT tag on its own lane.
const ridingLabel = makeRidingLabel({ role: 'network', emergeMode: true });
const gapLabel = makeRidingLabel({ role: 'network', hold: 0, emergeMode: true });
const tag = (p) => F.tag({ fn: ridingLabel, ...p });
// A leg rides LEG_DUR so its tag is readable (M-12, PACING in motion.test), the tag OUTSIDE the ball
// so it clears its own lane and the spine. The Node-1 tag waits LEFT_TAG_IN to clear the panel bottom.
const LEG_DUR = 1800, LEFT_TAG_IN = 600;
const TAG_LEG = { dur: LEG_DUR, dx: 70, dy: -18 };
const TAG_LEG_LEFT = { dur: LEG_DUR, dx: -70, dy: -18, emerge: LEFT_TAG_IN };
// The spine hop tags ride right of the ball and TRAILING it, so they rest clear of every face.
const TAG_GAP_UP = { fn: gapLabel, dx: 60, dy: 16, easing: 'linear' };     // WATCH, REGISTER
const TAG_GAP_DOWN = { ...TAG_GAP_UP, dy: -12 };                           // TRUNK
const TAG_UNDER = { dy: 16, emerge: 200 };

const LB_IP = '203.0.113.7';
const OLD = '10.244.1.5', NEW = '10.244.2.7';
const OLD_EP = `${OLD}:8080`, NEW_EP = `${NEW}:8080`;
// Ladder row indices: the two Node port targets, then the two Pod targets.
const NODE_ROWS = [0, 1], OLD_ROW = [2], NEW_ROW = [3];
// The rows reach the steps as refs, so a row outside the target list stands at pending: record NOTE.
const rowRefs = (el, refs) => {
  const r = el.querySelectorAll('.scheme-chip');
  refs.row0 = r[0]; refs.row1 = r[1]; refs.row2 = r[2]; refs.row3 = r[3];
};
const shade = (on, i) => (on.includes(i) ? 1 : OPACITY.pending);
const targets = (on) => ({ chain: on, opacity: { row0: shade(on, 0), row1: shade(on, 1), row2: shade(on, 2), row3: shade(on, 3) } });

const pod = (key, x, label, sublabel) => P.pod({
  key, innerKey: `${key}Box`, x, y: POD_Y, w: POD_W, h: POD_H, label, sublabel,
  inner: { dx: 20, dy: 26, w: POD_W - 40, h: 44, label: 'app', sublabel: 'eth0' },
});

export const SCENE = {
  'aria-label': 'LoadBalancer straight to Pods: a balancer that targets Node ports lists nodePort 31000 on every Node, and a Node with no backend DNATs and, under the default Cluster policy, SNATs the connection on to the Pod on another Node. A balancer implementation that targets Pods reads the Service endpoints, here an EndpointSlice, and registers the Pod IP and port, so a connection reaches the Pod with no second Node hop and no Node SNAT, and a replaced Pod is registered again at its new address. allocateLoadBalancerNodePorts false then allocates no new Node port unless one is requested, and 31000 stays allocated until it is removed explicitly',
  // The list order IS the append order, which is the z-order: frames, their Pods and chips, then the
  // spine, then lanes, then the readouts, then the packet layer.
  parts: [
    P.defs(),
    P.node({ key: 'node1', x: N1_X, y: NODE_Y, w: NODE_W, h: NODE_H, label: 'Node-1' }),
    P.node({ key: 'node2', x: N2_X, y: NODE_Y, w: NODE_W, h: NODE_H, label: 'Node-2' }),
    pod('podW1', N1_CX - POD_W / 2, 'Pod web-1', OLD),
    // The replacement: it does not exist until `replace`, so it stands at pending with a sublabel.
    pod('podW2', N2_CX - POD_W / 2, 'Pod web-2', 'not created yet'),
    P.chip({ key: 'np1', x: N1_CX - POD_W / 2, y: NP_Y, w: POD_W, h: NP_H, name: 'nodePort', value: '31000' }),
    P.chip({ key: 'np2', x: N2_CX - POD_W / 2, y: NP_Y, w: POD_W, h: NP_H, name: 'nodePort', value: '31000' }),
    P.box({ key: 'client', x: COL_X, y: CLIENT_Y, w: COL_W, h: COL_H, label: 'External client', sublabel: '' }),
    P.box({ key: 'lb', x: COL_X, y: LB_Y, w: COL_W, h: COL_H, label: 'Cloud LoadBalancer', sublabel: LB_IP }),
    P.chain({
      key: 'chain', x: COL_X, y: LADDER_Y, w: COL_W, rowH: ROW_H, gap: ROW_GAP, tune: rowRefs,
      items: ['target Node-1:31000', 'target Node-2:31000', `target ${OLD_EP}`, `target ${NEW_EP}`],
    }),
    P.box({ key: 'ctrl', x: COL_X, y: CTRL_Y, w: COL_W, h: COL_H, label: 'Balancer controller', sublabel: 'registers Node ports' }),
    P.box({ key: 'slice', x: COL_X, y: SLICE_Y, w: COL_W, h: COL_H, label: 'EndpointSlice web-x9f2k', sublabel: OLD_EP }),
    P.arrow({ from: TRUNK[0], to: TRUNK[1], dashed: true, dim: true }),
    P.lane({ points: TO_N1, dashed: true, dim: true }),
    P.lane({ points: TO_N2, dashed: true, dim: true }),
    P.lane({ points: UNDER, dashed: true, dim: true }),
    P.arrow({ from: WATCH[0], to: WATCH[1], dashed: true, dim: true }),
    P.arrow({ from: REGISTER[0], to: REGISTER[1], dashed: true, dim: true }),
    P.tag({ x: N2_X, y: CAP1_Y, text: 'Service web', anchor: 'start' }),
    P.chip({ key: 'allocChip', x: N2_X, y: CHIP1_Y, w: CHIP_W, h: CHIP_H, name: 'allocateLoadBalancerNodePorts', value: 'true' }),
    // A readout, not a Service field: what the last external connection did.
    P.tag({ x: N2_X, y: CAP2_Y, text: 'last external connection', anchor: 'start' }),
    P.chip({ key: 'hopsChip', x: N2_X, y: CHIP2_Y, w: CHIP_W, h: CHIP_H, name: 'path through Nodes', value: 'none' }),
    P.packets(),
  ],
  reset: {
    keys: ['client', 'lb', 'ctrl', 'slice', 'np1', 'np2', 'podW1Box', 'podW2Box', 'allocChip', 'hopsChip'],
    pods: ['podW1', 'podW2'],
  },
};

// Every Pod shade, Pod sublabel and ladder row in ONE place per step (A-16). No lane is keyed.
const stage = (replaced, on) => ({
  chain: on,
  opacity: { podW1: replaced ? OPACITY.pending : 1, podW2: replaced ? 1 : OPACITY.pending, ...targets(on).opacity },
  podSublabels: { podW1: replaced ? `${OLD} · deleted` : OLD, podW2: replaced ? NEW : 'not created yet' },
});
const PORTS = { np1: '31000', np2: '31000' };
const NODE_MODE = { lb: LB_IP, ctrl: 'registers Node ports', slice: OLD_EP };
const POD_MODE = { lb: LB_IP, ctrl: 'watches EndpointSlices', slice: OLD_EP };
const REPLACED = { ...POD_MODE, slice: NEW_EP };

export const STEPS_SPEC = [
  {
    id: 'idle',
    duration: 1500,
    // The poster lights nothing (S-09): the row shades alone say which rows are targets.
    ...stage(false, NODE_ROWS),
    chain: -1,
    chips: { allocChip: 'true', hopsChip: 'none', ...PORTS },
    sublabels: NODE_MODE,
  },
  {
    id: 'nodeports',
    duration: 6400,
    narration: 'By default a LoadBalancer Service allocates a nodePort, here 31000 on every Node, and a balancer that targets Node ports lists those ports as its targets. This connection lands on Node-2, which runs no backend, so Node-2 DNATs it and, under the default externalTrafficPolicy Cluster, SNATs it on to Pod web-1 on Node-1. Two Nodes handle one connection.',
    ...stage(false, NODE_ROWS),
    chips: { allocChip: 'true', hopsChip: '2', ...PORTS },
    sublabels: NODE_MODE,
    lit: ['client'],
    reducedLit: ['podW1Box'],
    rewind: { chips: { hopsChip: 'none' } },
    flow: [
      F.segment({ from: TRUNK[0], to: TRUNK[1], delay: BEAT.lead, name: 'entry', lights: ['lb'] }),
      tag({ text: `to ${LB_IP}`, points: TRUNK, delay: BEAT.lead, ...TAG_GAP_DOWN }),
      F.route({ points: TO_N2, after: 'entry', dur: LEG_DUR, name: 'toN2', lights: ['np2'] }),
      F.tag({ text: 'to Node-2:31000', points: TO_N2, after: 'entry', ...TAG_LEG }),
      F.route({ points: UNDER, after: 'toN2', name: 'hop', lights: ['hopsChip'] }),
      tag({ text: 'src Node-2 (SNAT)', points: UNDER, after: 'toN2', ...TAG_UNDER }),
      F.pulse({ pod: 'podW1', at: 'hop' }),
      F.set({ at: 'hop', chips: { hopsChip: '2' } }),
    ],
  },
  {
    id: 'register',
    duration: 4400,
    narration: 'A balancer implementation that targets Pods works from the Service instead. Here its controller watches the EndpointSlice of Service web, reads the endpoint 10.244.1.5:8080 and registers it with the balancer as a target, and the Node port rows stop being targets. The field allocateLoadBalancerNodePorts still reads true and 31000 is still allocated: the implementation chose Pod targets, not the field.',
    ...stage(false, OLD_ROW),
    chips: { allocChip: 'true', hopsChip: '2', ...PORTS },
    sublabels: POD_MODE,
    lit: ['slice'],
    rewind: targets(NODE_ROWS),
    flow: [
      F.segment({ from: WATCH[0], to: WATCH[1], delay: BEAT.lead, name: 'watch', lights: ['ctrl'] }),
      tag({ text: OLD_EP, points: WATCH, delay: BEAT.lead, ...TAG_GAP_UP }),
      F.segment({ from: REGISTER[0], to: REGISTER[1], after: 'watch', name: 'reg', lights: ['lb'] }),
      tag({ text: OLD_EP, points: REGISTER, after: 'watch', ...TAG_GAP_UP }),
      F.set({ at: 'reg', ...targets(OLD_ROW) }),
    ],
  },
  {
    id: 'direct',
    duration: 4600,
    narration: 'The next connection goes to the target 10.244.1.5:8080 itself. It reaches Node-1 already addressed to Pod web-1, so there is no second Node hop and no Node SNAT, and Node-2 is not on its path at all. Node port 31000 is still open on both Nodes, but this balancer no longer sends anything to it.',
    ...stage(false, OLD_ROW),
    chips: { allocChip: 'true', hopsChip: '1', ...PORTS },
    sublabels: POD_MODE,
    lit: ['client'],
    reducedLit: ['podW1Box'],
    rewind: { chips: { hopsChip: '2' } },
    flow: [
      F.segment({ from: TRUNK[0], to: TRUNK[1], delay: BEAT.lead, name: 'entry', lights: ['lb'] }),
      tag({ text: `to ${LB_IP}`, points: TRUNK, delay: BEAT.lead, ...TAG_GAP_DOWN }),
      F.route({ points: TO_N1, after: 'entry', dur: LEG_DUR, name: 'toN1', lights: ['hopsChip'] }),
      tag({ text: `to ${OLD_EP}`, points: TO_N1, after: 'entry', ...TAG_LEG_LEFT }),
      F.pulse({ pod: 'podW1', at: 'toN1' }),
      F.set({ at: 'toN1', chips: { hopsChip: '1' } }),
    ],
  },
  {
    id: 'replace',
    duration: 5400,
    narration: 'Pod web-1 is deleted and its replacement, Pod web-2, starts on Node-2 at 10.244.2.7. The EndpointSlice now lists 10.244.2.7:8080, so the controller registers the new address and 10.244.1.5:8080 stops being a target. How it health checks the new target, here a probe of 10.244.2.7:8080, is up to the implementation: the Kubernetes API does not define it.',
    ...stage(true, NEW_ROW),
    chips: { allocChip: 'true', hopsChip: '1', ...PORTS },
    sublabels: REPLACED,
    lit: ['slice'],
    reducedLit: ['podW2Box'],
    rewind: targets(OLD_ROW),
    flow: [
      F.segment({ from: WATCH[0], to: WATCH[1], delay: BEAT.lead, name: 'watch', lights: ['ctrl'] }),
      tag({ text: NEW_EP, points: WATCH, delay: BEAT.lead, ...TAG_GAP_UP }),
      F.segment({ from: REGISTER[0], to: REGISTER[1], after: 'watch', name: 'reg', lights: ['lb'] }),
      tag({ text: NEW_EP, points: REGISTER, after: 'watch', ...TAG_GAP_UP }),
      F.set({ at: 'reg', ...targets(NEW_ROW) }),
      F.route({ points: TO_N2, after: 'reg', dur: LEG_DUR, name: 'check' }),
      F.tag({ text: `probe ${NEW_EP}`, points: TO_N2, after: 'reg', ...TAG_LEG }),
      F.pulse({ pod: 'podW2', at: 'check' }),
    ],
  },
  {
    id: 'no-nodeports',
    // No packet: a field changes, and the chips it leaves standing carry the beat.
    duration: 3800,
    narration: 'With the balancer no longer using the Node ports, the Service can set spec.allocateLoadBalancerNodePorts false, which is meant only for balancers that route straight to Pods. No new Node port is allocated unless a port asks for a specific one. Ports already allocated are not freed automatically: 31000 stays until the nodePort entry is removed explicitly from every Service port.',
    ...stage(true, NEW_ROW),
    chips: { allocChip: 'false', hopsChip: '1', ...PORTS },
    sublabels: REPLACED,
    lit: ['allocChip', 'np1', 'np2'],
  },
];

export const init = defineCard(SCENE, STEPS_SPEC, { posterFirst: true });
