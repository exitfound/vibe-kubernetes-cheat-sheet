import { FADE, P, F, defineCard, laneY, midX, makeRidingLabel, BEAT, OPACITY, BRISK_HOP_MS } from './network-kit.js';

// Design notes for this card: ./CARDS/network-headless-service.md

// Three bands: the discovery column right of the panel, the answer column beside it with one readout
// per A record, and the StatefulSet Pods along the bottom, reached by the data bus from below.
const BLOCK_W = 232, BLOCK_H = 80, POD_H = 104;
const COL_X = 444;
const COL_CX = COL_X + BLOCK_W / 2;            // the relation spine
const SVC_Y = 40;
const SLICE_Y = SVC_Y + BLOCK_H + 40;
const DNS_Y = SLICE_Y + BLOCK_H + 40;
const DNS_CY = DNS_Y + BLOCK_H / 2;

// The client sits level with CoreDNS, under the panel (L-03), so the lookup pair is straight.
const CLIENT_X = 60;
const CLIENT_R = CLIENT_X + BLOCK_W;
const CLIENT_Y = DNS_CY - POD_H / 2;
const CLIENT_CX = CLIENT_X + BLOCK_W / 2;
const CLIENT_B = CLIENT_Y + POD_H;
const { out: ASK_Y, back: ANS_Y } = laneY(DNS_CY, 12);
const ASK = [[CLIENT_R, ASK_Y], [COL_X, ASK_Y]];
const ANSWER = [[COL_X, ANS_Y], [CLIENT_R, ANS_Y]];

// The Pods row: three Pods spread to the canvas edge.
const PODS_L = 300, PODS_R = 1160, POD_Y = 440;
const POD_GAP = (PODS_R - PODS_L - 3 * BLOCK_W) / 2;
const podX = (i) => PODS_L + i * (BLOCK_W + POD_GAP);
const podCx = (i) => podX(i) + BLOCK_W / 2;
const POD_B = POD_Y + POD_H;

// One data lane per Pod (NET.A-03): down out of the client bottom, along the bus, up into the Pod
// bottom face. The bus runs under the row so no lane crosses a Pod it does not end on.
const BUS_Y = 596;
const toPod = (i) => [[CLIENT_CX, CLIENT_B], [CLIENT_CX, BUS_Y], [podCx(i), BUS_Y], [podCx(i), POD_B]];
const TO_POD = [0, 1, 2].map(toPod);

// The answer column: the question, then one row per Pod. Each row is a record that is in the answer
// or is not, and its state is the card subject.
const CHIP_X = 760, CHIP_W = PODS_R - CHIP_X;
const CHIP_H = 34, CHIP_GAP = 14;
const chipY = (i) => SLICE_Y + i * (CHIP_H + CHIP_GAP);

const NAMES = ['web-0', 'web-1', 'web-2'];
const IPS = ['10.244.2.7', '10.244.3.4', '10.244.1.9'];
const NEW_IP = '10.244.3.8';

// The connection carries its destination from the client face (NET.T-01), under the ball and left
// of it, so it clears the bus and both vertical legs.
const LEG_TAG = makeRidingLabel({ role: 'network', dy: 20, dx: -40, inMs: 200, outMs: 200, hold: 0 });

const pod = (i) => P.pod({
  key: `w${i}`, innerKey: `w${i}Box`, x: podX(i), y: POD_Y, w: BLOCK_W, h: POD_H, label: NAMES[i], sublabel: IPS[i],
  inner: { dx: 20, dy: 34, w: BLOCK_W - 40, h: 44, label: 'app', sublabel: 'ready' },
});

// The list order IS the append order, which is the z-order: blocks, relations, lanes, chips, packets.
export const SCENE = {
  'aria-label': 'Headless Service: Service nginx has clusterIP None, so kube-proxy writes no rules for it. A client Pod asks CoreDNS, through the kube-dns Service, for nginx.default.svc.cluster.local and gets one A record per ready Pod of StatefulSet web, then connects to one Pod IP it picked itself. When web-2 is not ready its record is left out. Each Pod also has its own name, web-0.nginx.default.svc.cluster.local, which resolves to web-0 again once it is recreated with a new IP and is ready.',
  parts: [
    P.defs(),
    P.box({ key: 'svc', x: COL_X, y: SVC_Y, w: BLOCK_W, h: BLOCK_H, label: 'Service nginx', sublabel: 'clusterIP: None' }),
    P.box({ key: 'slice', x: COL_X, y: SLICE_Y, w: BLOCK_W, h: BLOCK_H, label: 'EndpointSlice', sublabel: '3 of 3 ready' }),
    P.box({ key: 'dns', x: COL_X, y: DNS_Y, w: BLOCK_W, h: BLOCK_H, label: 'CoreDNS', sublabel: 'kube-dns 10.96.0.10' }),
    P.pod({
      key: 'client', innerKey: 'clientBox', x: CLIENT_X, y: CLIENT_Y, w: BLOCK_W, h: POD_H, label: 'Client Pod', sublabel: '10.244.1.5',
      inner: { dx: 20, dy: 34, w: BLOCK_W - 40, h: 44, label: 'app', sublabel: 'resolver' },
    }),
    pod(0), pod(1), pod(2),
    // Ownership, not traffic: the control plane keeps the slice for the Service, CoreDNS watches it.
    P.relation({ points: [[COL_CX, SVC_Y + BLOCK_H], [COL_CX, SLICE_Y]] }),
    P.relation({ points: [[COL_CX, SLICE_Y + BLOCK_H], [COL_CX, DNS_Y]] }),
    P.arrow({ from: ASK[0], to: ASK[1], dashed: true, dim: true }),
    P.arrow({ from: ANSWER[0], to: ANSWER[1], dashed: true, dim: true }),
    P.lane({ points: TO_POD[0], dashed: true, dim: true }),
    P.lane({ points: TO_POD[1], dashed: true, dim: true }),
    P.lane({ points: TO_POD[2], dashed: true, dim: true }),
    P.wire({ key: 'dnsWire', x: midX(CLIENT_R, COL_X), y: ANS_Y + 22 }),
    P.chip({ key: 'qChip', x: CHIP_X, y: chipY(0), w: CHIP_W, h: CHIP_H, name: 'query', value: 'none' }),
    P.chip({ key: 'r0', x: CHIP_X, y: chipY(1), w: CHIP_W, h: CHIP_H, name: 'A web-0', value: 'not asked' }),
    P.chip({ key: 'r1', x: CHIP_X, y: chipY(2), w: CHIP_W, h: CHIP_H, name: 'A web-1', value: 'not asked' }),
    P.chip({ key: 'r2', x: CHIP_X, y: chipY(3), w: CHIP_W, h: CHIP_H, name: 'A web-2', value: 'not asked' }),
    P.packets(),
  ],
  reset: {
    keys: ['svc', 'slice', 'dns', 'clientBox', 'w0Box', 'w1Box', 'w2Box', 'qChip', 'r0', 'r1', 'r2'],
    pods: ['client', 'w0', 'w1', 'w2'],
  },
};

const SVC_Q = 'nginx.default.svc';
const POD_Q = 'web-0.nginx.default.svc';
const NOT_ASKED = 'not asked';
const ALL_READY = { w0: 1, w1: 1, w2: 1 };
const W2_DOWN = { w0: 1, w1: 1, w2: OPACITY.notready };
const WIRE = { dnsWire: 'UDP 53' };

// The short lookup legs take BRISK_HOP_MS rather than the routeDur floor (M-12, PACING).

// A lookup round trip: the client asks, CoreDNS lights, the answer comes home and the client pulses.
const lookup = (start = 0) => [
  F.pulse({ pod: 'client', delay: start }),
  F.segment({ from: ASK[0], to: ASK[1], delay: start + BEAT.afterPulse, name: 'q', lights: ['dns', 'slice'], dur: BRISK_HOP_MS }),
  F.segment({ from: ANSWER[0], to: ANSWER[1], after: 'q', name: 'a', dur: BRISK_HOP_MS, pulse: 'client' }),
];

const turn = (at, chips) => [F.set({ at, chips }), F.light({ targets: Object.keys(chips), at })];

export const STEPS_SPEC = [
  {
    id: 'idle',
    duration: 1500,
    chips: { qChip: 'none', r0: NOT_ASKED, r1: NOT_ASKED, r2: NOT_ASKED },
    wires: WIRE,
    opacity: ALL_READY,
  },
  {
    id: 'query',
    duration: 3100,
    narration: 'StatefulSet web runs three Pods behind Service nginx, whose clusterIP is None. There is no virtual IP, so kube-proxy writes no rules for it. Under the default ClusterFirst DNS policy the lookup of nginx.default.svc.cluster.local still goes to CoreDNS through the kube-dns Service.',
    chips: { qChip: SVC_Q, r0: 'pending', r1: 'pending', r2: 'pending' },
    wires: WIRE,
    opacity: ALL_READY,
    lit: ['svc'],
    rewind: { chips: { qChip: 'none', r0: NOT_ASKED, r1: NOT_ASKED, r2: NOT_ASKED } },
    reducedLit: ['clientBox'],
    flow: [
      F.pulse({ pod: 'client' }),
      F.segment({ from: ASK[0], to: ASK[1], delay: BEAT.afterPulse, name: 'q', lights: ['dns'], dur: BRISK_HOP_MS }),
      ...turn('q', { qChip: SVC_Q, r0: 'pending', r1: 'pending', r2: 'pending' }),
    ],
  },
  {
    id: 'answer',
    duration: 3400,
    narration: 'For a headless Service with a selector the control plane still keeps an EndpointSlice, and CoreDNS answers from it: one A record for every ready Pod, three addresses instead of one virtual IP. Nothing balances the traffic, and the whole set comes back for the client to choose from.',
    chips: { qChip: SVC_Q, r0: IPS[0], r1: IPS[1], r2: IPS[2] },
    wires: WIRE,
    opacity: ALL_READY,
    lit: ['dns', 'slice'],
    rewind: { chips: { r0: 'pending', r1: 'pending', r2: 'pending' } },
    reducedLit: ['clientBox'],
    flow: [
      F.segment({ from: ANSWER[0], to: ANSWER[1], delay: BEAT.lead, name: 'a', dur: BRISK_HOP_MS }),
      ...turn('a', { r0: IPS[0], r1: IPS[1], r2: IPS[2] }),
      F.pulse({ pod: 'client', at: 'a' }),
    ],
  },
  {
    id: 'direct',
    duration: 4600,
    narration: 'The client connects straight to one address from that set, here web-1 at 10.244.3.4. No ClusterIP is in the path and no Service rule rewrites the destination, so the client chooses from the set itself and kube-proxy has no say.',
    chips: { qChip: SVC_Q, r0: IPS[0], r1: IPS[1], r2: IPS[2] },
    wires: WIRE,
    opacity: ALL_READY,
    reducedLit: ['w1Box'],
    flow: [
      F.pulse({ pod: 'client' }),
      F.route({ points: TO_POD[1], delay: BEAT.afterPulse, name: 'hop', tag: { fn: LEG_TAG, text: IPS[1] }, pulse: 'w1' }),
      F.light({ targets: ['r1'], delay: BEAT.afterPulse }),
    ],
  },
  {
    id: 'not-ready',
    duration: 5000,
    narration: 'Pod web-2 fails its readiness probe. Its endpoint turns ready=false in the EndpointSlice and CoreDNS stops publishing it, so the same lookup now returns two addresses. A Service with publishNotReadyAddresses set would keep web-2 in the answer.',
    chips: { qChip: SVC_Q, r0: IPS[0], r1: IPS[1], r2: 'not ready, left out' },
    sublabels: { slice: '2 of 3 ready', w2Box: 'not ready' },
    wires: WIRE,
    opacity: W2_DOWN,
    rewind: {
      opacity: ALL_READY,
      sublabels: { slice: '3 of 3 ready', w2Box: 'ready' },
      chips: { r2: IPS[2] },
    },
    reducedLit: ['clientBox'],
    flow: [
      F.fade({ target: 'w2', from: 1, to: OPACITY.notready, dur: FADE.out, name: 'down' }),
      F.set({ at: 'down', sublabels: { slice: '2 of 3 ready', w2Box: 'not ready' } }),
      F.light({ targets: ['slice'], at: 'down' }),
      ...lookup(900),
      ...turn('a', { r2: 'not ready, left out' }),
    ],
  },
  {
    id: 'pod-name',
    duration: 6000,
    narration: 'Each Pod also gets a name of its own, the Pod name under the governing Service that the StatefulSet serviceName points at: web-0.nginx.default.svc.cluster.local. That lookup returns web-0 alone, which lets a client reach one specific replica, such as a primary.',
    chips: { qChip: POD_Q, r0: IPS[0], r1: NOT_ASKED, r2: NOT_ASKED },
    sublabels: { slice: '2 of 3 ready', w2Box: 'not ready' },
    wires: WIRE,
    opacity: W2_DOWN,
    rewind: { chips: { qChip: SVC_Q, r0: IPS[0], r1: IPS[1], r2: 'not ready, left out' } },
    reducedLit: ['clientBox', 'w0Box'],
    flow: [
      ...lookup(0),
      ...turn('q', { qChip: POD_Q }),
      ...turn('a', { r0: IPS[0], r1: NOT_ASKED, r2: NOT_ASKED }),
      // The pulse the lookup lands on 'a' is also the sender cue for this connection.
      F.route({ points: TO_POD[0], at: 'a', plus: BEAT.afterPulse, name: 'hop', tag: { fn: LEG_TAG, text: IPS[0] }, pulse: 'w0' }),
    ],
  },
  {
    id: 'new-ip',
    duration: 5600,
    narration: 'Delete web-0 and the StatefulSet recreates it under the same name, here with a new IP. Once it is ready the same lookup returns 10.244.3.8: the name is stable, the address is not. A client that cached the answer can hold it until the record TTL expires, 30 seconds under kubeadm.',
    chips: { qChip: POD_Q, r0: NEW_IP, r1: NOT_ASKED, r2: NOT_ASKED },
    sublabels: { slice: '2 of 3 ready', w2Box: 'not ready' },
    podSublabels: { w0: NEW_IP },
    wires: WIRE,
    opacity: W2_DOWN,
    rewind: { chips: { r0: IPS[0] }, podSublabels: { w0: IPS[0] } },
    reducedLit: ['clientBox'],
    flow: [
      F.fade({ target: 'w0', from: 1, to: 0, dur: FADE.out, name: 'gone' }),
      F.set({ at: 'gone', podSublabels: { w0: NEW_IP } }),
      F.reveal({ target: 'w0', at: 'gone' }),
      ...lookup(1500),
      ...turn('a', { r0: NEW_IP }),
    ],
  },
];

export const init = defineCard(SCENE, STEPS_SPEC, { posterFirst: true });
