import { P, F, defineCard, laneY, midX, BEAT } from './network-kit.js';

// Design notes for this card: ./CARDS.md#network-conntrack-nat


// Panel right <= 397, bottom <= 255. The flow row starts at 252, so the top 3 units of the Client Pod
// DO overlap the panel corner: measured and left, not a clearance. A longer narration invalidates it.
const POD_Y = 252, POD_H = 120;                    // both Pod shells stand on one baseline
const CLIENT_X = 70, CLIENT_W = 190;
const CLIENT_EDGE = CLIENT_X + CLIENT_W;           // 260
const NF_X = 470, NF_W = 240, NF_Y = 276, NF_H = 72;
const NF_LEFT = NF_X, NF_RIGHT = NF_X + NF_W;      // 470 / 710
const NF_CX = NF_X + NF_W / 2;                     // 590
const CHIP_R = 1130;                               // the strip and the server Pod end here together
const SERVER_W = 200, SERVER_X = CHIP_R - SERVER_W;// 930
const SERVER_LEFT = SERVER_X;

const FLOW_Y = POD_Y + POD_H / 2;   // 312: mid-line, where the per-gap wire label sits between the lanes
const LANE_DY = 12;                 // half-gap between the request and reply lanes
const { out: REQ_Y, back: REP_Y } = laneY(FLOW_Y, LANE_DY);   // 300 request (left -> right), 324 reply

// The outer two chips are flush with the Pod footprints and the middle pair centred under netfilter,
// so the strip centres on 600 with every chip still under the block it describes.
const CHIP_L = CLIENT_X, CHIP_Y = 530, CHIP_H = 34;
const CHIP_W_OUT = 250, CHIP_W_MID = 215, CHIP_GAP_MID = 14;
const CHIP_X_ORIG = CHIP_L;                                     // 70
const CHIP_X_STATE = NF_CX - CHIP_GAP_MID / 2 - CHIP_W_MID;     // 368
const CHIP_X_DIR = NF_CX + CHIP_GAP_MID / 2;                    // 597
const CHIP_X_NAT = CHIP_R - CHIP_W_OUT;                         // 880

// Two lanes per gap: request (top, ->) and reply (bottom, <-). The reply arrows are the reverse
// direction the ball travels on the reply step, so the motion always has a matching arrow.
const C_REQ = [[CLIENT_EDGE, REQ_Y], [NF_LEFT, REQ_Y]];
const C_REP = [[NF_LEFT, REP_Y], [CLIENT_EDGE, REP_Y]];
const S_REQ = [[NF_RIGHT, REQ_Y], [SERVER_LEFT, REQ_Y]];
const S_REP = [[SERVER_LEFT, REP_Y], [NF_RIGHT, REP_Y]];

const POD_INNER = { dx: 20, dy: 34, h: 52, label: 'app', sublabel: 'eth0' };

// The list order IS the append order, which is the z-order: pods + netfilter box, then wires + labels
// above, then chips, then the packet layer.
export const SCENE = {
  'aria-label': 'Connection tracking and NAT: the first packet of a flow is rewritten by netfilter and recorded in the conntrack table as an entry mapping the original tuple to the translated one, so the reply is reverse-translated automatically and every later packet of the flow takes the same fast path without re-evaluating rules',
  parts: [
    P.defs(),
    P.box({ key: 'nf', x: NF_X, y: NF_Y, w: NF_W, h: NF_H, label: 'netfilter', sublabel: 'NAT + conntrack' }),
    P.pod({
      key: 'client', innerKey: 'clientBox', x: CLIENT_X, y: POD_Y, w: CLIENT_W, h: POD_H,
      label: 'Client Pod', sublabel: '10.244.1.5', inner: { ...POD_INNER, w: CLIENT_W - 40 },
    }),
    P.pod({
      key: 'server', innerKey: 'serverBox', x: SERVER_X, y: POD_Y, w: SERVER_W, h: POD_H,
      label: 'Server Pod', sublabel: '10.244.2.7:8080', inner: { ...POD_INNER, w: SERVER_W - 40 },
    }),
    P.arrow({ from: C_REQ[0], to: C_REQ[1], dashed: true, dim: true }),
    P.arrow({ from: C_REP[0], to: C_REP[1], dashed: true, dim: true }),
    P.arrow({ from: S_REQ[0], to: S_REQ[1], dashed: true, dim: true }),
    P.arrow({ from: S_REP[0], to: S_REP[1], dashed: true, dim: true }),
    // One label per gap, on the mid-line between the two lanes. Blank at build, filled per step.
    P.wire({ key: 'c', x: midX(CLIENT_EDGE, NF_LEFT), y: FLOW_Y + 3 }),
    P.wire({ key: 's', x: midX(NF_RIGHT, SERVER_LEFT), y: FLOW_Y + 3 }),
    P.chip({ key: 'origChip', x: CHIP_X_ORIG, y: CHIP_Y, w: CHIP_W_OUT, h: CHIP_H, name: 'orig dst', value: '10.96.0.20:80' }),
    P.chip({ key: 'stateChip', x: CHIP_X_STATE, y: CHIP_Y, w: CHIP_W_MID, h: CHIP_H, name: 'ct state', value: 'none' }),
    P.chip({ key: 'dirChip', x: CHIP_X_DIR, y: CHIP_Y, w: CHIP_W_MID, h: CHIP_H, name: 'reply', value: 'none' }),
    P.chip({ key: 'natChip', x: CHIP_X_NAT, y: CHIP_Y, w: CHIP_W_OUT, h: CHIP_H, name: 'translated', value: 'none' }),
    P.packets(),
  ],
  // The inner boxes are keys, not pod groups: a pod group only has its pulse strokes reset, so a
  // .highlight left on a container would ride along into every later step.
  reset: {
    keys: ['nf', 'clientBox', 'serverBox', 'origChip', 'natChip', 'stateChip', 'dirChip'],
    pods: ['client', 'server'],
  },
};

const ORIG_DST = '10.96.0.20:80';
const NAT_DST = '-> 10.244.2.7:8080';

export const STEPS_SPEC = [
  {
    id: 'idle',
    duration: 1500,
    chips: { origChip: ORIG_DST, natChip: 'none', stateChip: 'none', dirChip: 'none' },
  },
  {
    id: 'send',
    duration: 2200,
    narration: 'The client opens a connection to a Service address and the first packet leaves its eth0. On the way out it enters netfilter, where the NAT rules will decide what to do with a destination that no real host owns.',
    chips: { origChip: ORIG_DST, natChip: 'none', stateChip: 'none', dirChip: 'none' },
    wires: { c: 'dst 10.96.0.20:80' },
    lit: ['origChip'],
    // The animated path says the client sent this packet by PULSING it, which no lights list names.
    reducedLit: ['clientBox'],
    // Up-arrow: client pulses first, the packet leaves on the request lane at BEAT.afterPulse and
    // reaches netfilter.
    flow: [
      F.pulse({ pod: 'client' }),
      F.segment({ from: C_REQ[0], to: C_REQ[1], delay: BEAT.afterPulse, lights: ['nf'] }),
    ],
  },
  {
    id: 'new',
    duration: 2500,
    narration: 'This is the first packet of an unseen flow, so conntrack creates a NEW entry. It records the original tuple and the translated one, rewrites the destination to the backend Pod IP, and forwards the packet on. The mapping is now stored for the life of the connection.',
    chips: { origChip: ORIG_DST, natChip: NAT_DST, stateChip: 'NEW', dirChip: 'none' },
    wires: { s: 'dst 10.244.2.7:8080' },
    lit: ['nf', 'natChip', 'stateChip'],
    // The animated path says the server was served by PULSING it, which no lights list names.
    reducedLit: ['serverBox'],
    // The rewritten packet emerges from netfilter (the DNAT happened inside) on the request lane
    // and is delivered to the server, which pulses on arrival.
    flow: [
      F.segment({ from: S_REQ[0], to: S_REQ[1], name: 'give' }),
      F.pulse({ pod: 'server', at: 'give' }),
    ],
  },
  {
    id: 'reply',
    duration: 2600,
    narration: 'The server replies from its own IP, and conntrack matches the packet against the reverse tuple of the stored entry. The translation is undone automatically, so the source becomes the Service address again and seeing this reply flips the entry to ESTABLISHED. The reply is never re-evaluated against the NAT rules, the recorded mapping is simply reversed.',
    chips: { origChip: ORIG_DST, natChip: NAT_DST, stateChip: 'ESTABLISHED', dirChip: 'reverse NAT' },
    wires: { c: 'src restored to 10.96.0.20' },
    lit: ['stateChip', 'dirChip'],
    // The animated path says the client got the reply by PULSING it, which no lights list names.
    reducedLit: ['clientBox'],
    // The reply rides its own lane, the ball hidden across the box for the reverse NAT. netfilter
    // lights as the reply ENTERS it, so the box is not already lit when its own packet lands.
    flow: [
      F.segment({ from: S_REP[0], to: S_REP[1], name: 'h1', lights: ['nf'] }),
      F.segment({ from: C_REP[0], to: C_REP[1], after: 'h1', name: 'h2' }),
      F.pulse({ pod: 'client', at: 'h2' }),
    ],
  },
  {
    id: 'fastpath',
    duration: 3300,
    narration: 'From now on every packet of this flow hits the existing ESTABLISHED entry and is translated the same way with no rule walk at all. This is why a flow always sticks to one backend, and why a Node under heavy churn can exhaust its conntrack table and start dropping new connections.',
    // The chip is named `reply`, so its value has to stay true of the REPLY: on an established flow
    // the reply keeps the same reverse translation and no longer costs a rule walk.
    chips: { origChip: ORIG_DST, natChip: NAT_DST, stateChip: 'ESTABLISHED', dirChip: 'reverse NAT, no walk' },
    wires: { c: 'dst 10.96.0.20:80', s: '-> 10.244.2.7:8080' },
    lit: ['natChip', 'stateChip', 'dirChip'],
    // The animated path says the server was served by PULSING it, which no lights list names.
    reducedLit: ['serverBox'],
    // A later packet takes the fast path: client pulses, then the ball runs straight through on the
    // request lane (translated inside netfilter, no pause for a rule walk) to the server.
    flow: [
      F.pulse({ pod: 'client' }),
      F.segment({ from: C_REQ[0], to: C_REQ[1], delay: BEAT.afterPulse, name: 'h1', lights: ['nf'] }),
      F.segment({ from: S_REQ[0], to: S_REQ[1], after: 'h1', name: 'h2' }),
      F.pulse({ pod: 'server', at: 'h2' }),
    ],
  },
];

export const init = defineCard(SCENE, STEPS_SPEC, { posterFirst: true });
