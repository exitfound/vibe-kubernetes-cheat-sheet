import { LANE_DY, P, F, defineCard, CLU, LAYOUT, laneY, ladder, midX } from './cluster-kit.js';

// Design notes for this card: ./CARDS/cluster-kubelet-reconcile-loop.md

// Laid out on the L.
const M = 60;
const CONTENT_L = M, CONTENT_R = 1200 - M;

const TOP_Y = 40, TOP_H = 80, TOP_BOTTOM = TOP_Y + TOP_H;
const TOP_CY = midX(TOP_Y, TOP_BOTTOM);
const { out: OUT_Y, back: BACK_Y } = laneY(TOP_CY, LANE_DY);
const KUBE_X = 554, KUBE_W = 232, KUBE_R = KUBE_X + KUBE_W;
const RT_W = 232, RT_X = CONTENT_R - RT_W;

const API_X = CONTENT_L, API_W = 232, API_H = 80;
const API_Y = 300, API_R = API_X + API_W;
const API_CY = midX(API_Y, API_Y + API_H);
// Two risers, out left of back, so the vertical legs never share an x and never cross. Both clear
// the panel, each offset by LANE_DY from its face centre.
const RISER_OUT_X = 412, RISER_BACK_X = 436;
const { out: API_OUT_Y, back: API_BACK_Y } = laneY(API_CY, LANE_DY);
const API_TO_KUBE = [[API_R, API_OUT_Y], [RISER_OUT_X, API_OUT_Y], [RISER_OUT_X, OUT_Y], [KUBE_X, OUT_Y]];
const KUBE_TO_API = [[KUBE_X, BACK_Y], [RISER_BACK_X, BACK_Y], [RISER_BACK_X, API_BACK_Y], [API_R, API_BACK_Y]];

const LADDER_X = LAYOUT.B.ladder.x, LADDER_W = LAYOUT.B.ladder.w;
const LADDER_Y = 190, ROW_H = 32, ROW_GAP = 10;

// The Kubelet owns every ladder row, so the tie is a RELATIONSHIP: no ball, no arrowhead.
const KUBE_CX = midX(KUBE_X, KUBE_R);
const LADDER_CX = midX(LADDER_X, CONTENT_R);
const TIE_JOG_Y = midX(TOP_BOTTOM, LADDER_Y);
const KUBE_TO_CHAIN = [[KUBE_CX, TOP_BOTTOM], [KUBE_CX, TIE_JOG_Y], [LADDER_CX, TIE_JOG_Y], [LADDER_CX, LADDER_Y]];

const CHIP_X = LAYOUT.B.chips.x, CHIP_W = LAYOUT.B.chips.w;
const CHIP_H = 34, CHIP_GAP = 8;
const CHIP_Y = ladder({ y: 430, rowH: CHIP_H, gap: CHIP_GAP });

// Append order is z-order. One wrapper group, arrowDefs included, so a single transform shifts it all.
export const SCENE = {
  'aria-label': 'Kubelet sync loop: watch, PLEG, SyncPod, CRI, status',
  parts: [
    P.group({
      transform: 'translate(0, 0)',
      parts: [
        P.defs(),
        // Api <-> Kubelet (watch + status PATCH), Kubelet <-> Runtime (CRI calls).
        P.lane({ points: API_TO_KUBE, dim: true, dashed: true }),
        P.lane({ points: KUBE_TO_API, dim: true, dashed: true }),
        P.arrow({ x1: KUBE_R, y1: OUT_Y, x2: RT_X, y2: OUT_Y, dim: true, dashed: true }),
        P.arrow({ x1: RT_X, y1: BACK_Y, x2: KUBE_R, y2: BACK_Y, dim: true, dashed: true }),
        // The loop below belongs to the Kubelet.
        P.relation({ points: KUBE_TO_CHAIN }),
        // Right-anchored left of the out riser: a centred label would run through both risers.
        P.wire({ key: 'api', x: RISER_OUT_X - 8, y: API_Y - 12, anchor: 'end' }),
        // Above the top row: the band below belongs to the Kubelet-to-ladder tie.
        P.wire({ key: 'rt', x: midX(KUBE_R, RT_X), y: TOP_Y - 14 }),
        P.chip({ key: 'podChip', x: CHIP_X, y: CHIP_Y(0), w: CHIP_W, h: CHIP_H, name: 'Pod', value: 'none' }),
        P.chip({ key: 'desiredChip', x: CHIP_X, y: CHIP_Y(1), w: CHIP_W, h: CHIP_H, name: 'desired', value: 'none' }),
        P.chip({ key: 'observedChip', x: CHIP_X, y: CHIP_Y(2), w: CHIP_W, h: CHIP_H, name: 'observed', value: 'none' }),
        P.chip({ key: 'lastOpChip', x: CHIP_X, y: CHIP_Y(3), w: CHIP_W, h: CHIP_H, name: 'last CRI op', value: 'none' }),
        P.packets(),
        // After the packet layer, so the chain renders on top of it.
        P.chain({
          key: 'chain', x: LADDER_X, y: LADDER_Y, w: LADDER_W, rowH: ROW_H, gap: ROW_GAP,
          items: [
            '1. watch     ·  pod specs from API',
            '2. PLEG      ·  relist via ListPodSandbox/ListContainers',
            '3. SyncPod   ·  reconcile desired vs observed',
            '4. CRI       ·  RunPodSandbox/Pull/Create/Start gRPC',
            '5. status    ·  PATCH Pod containerStatuses',
          ],
        }),
        // Top-row blocks ABSOLUTE LAST.
        P.box({ key: 'api', x: API_X, y: API_Y, w: API_W, h: API_H, label: 'API', sublabel: 'spec source' }),
        P.box({ key: 'kubelet', x: KUBE_X, y: TOP_Y, w: KUBE_W, h: TOP_H, label: 'Kubelet', sublabel: 'on Node-1' }),
        P.box({ key: 'runtime', x: RT_X, y: TOP_Y, w: RT_W, h: TOP_H, label: 'containerd', sublabel: 'CRI gRPC' }),
      ],
    }),
  ],
  reset: { keys: ['api', 'kubelet', 'runtime', 'podChip', 'desiredChip', 'observedChip', 'lastOpChip'] },
};

// Every chip reports what the Kubelet has LEARNED or DONE, so each waits for the packet that earns
// it. Every enter() writes EVERY one, or clicking Next mid-flight loses whatever at() was holding.
const POD_NAME = 'my-app-7d4-x2k9p', SPEC = '1 container';
// One packet per call, in order, and the chip names each as it lands: the step is a SEQUENCE.
const CALLS = ['RunPodSandbox', 'PullImage', 'CreateContainer', 'StartContainer'];

export const STEPS_SPEC = [
  {
    id: 'idle',
    duration: 1500,
    chips: { podChip: 'none', desiredChip: 'none', observedChip: 'none', lastOpChip: 'none' },
    chain: -1,
  },
  {
    id: 'watch',
    duration: 1900,
    narration: 'The API streams an ADDED event for Pod my-app-7d4-x2k9p bound to Node-1. The Kubelet merges its spec sources into one update channel, and the sync loop records the Pod in podManager as desired state.',
    chips: { podChip: POD_NAME, desiredChip: SPEC, observedChip: 'none', lastOpChip: 'none' },
    wires: { api: 'watch ADDED' },
    lit: ['api', 'podChip', 'desiredChip'],
    chain: 0,
    // Both chips wait for the event to reach the Kubelet.
    rewind: { chips: { podChip: 'none', desiredChip: 'none' } },
    flow: [
      F.route({ points: API_TO_KUBE, name: 'added', lights: ['kubelet'] }),
      F.set({ at: 'added', chips: { podChip: 'my-app-7d4-x2k9p', desiredChip: '1 container' } }),
    ],
  },
  {
    id: 'pleg',
    duration: 3400,
    narration: 'PLEG (Pod Lifecycle Event Generator) wakes on its 1s timer, calls ListPodSandbox and ListContainers, and finds no sandbox or container for the new Pod. PLEG records the empty observed state for SyncPod. With EventedPLEG on (alpha feature gate, off by default), the runtime pushes lifecycle events over CRI, so Kubelet relists far less often.',
    chips: { podChip: POD_NAME, desiredChip: SPEC, observedChip: '0 containers', lastOpChip: 'ListContainers' },
    wires: { rt: 'ListPodSandbox · ListContainers' },
    lit: ['kubelet', 'observedChip', 'lastOpChip'],
    chain: 1,
    rewind: { chips: { observedChip: 'none', lastOpChip: 'none' } },
    // PLEG asks, so the Kubelet is lit from entry and the runtime lights on arrival. The two chips
    // land on different beats: the op when the call arrives, the observation when the answer does.
    flow: [
      F.top({ from: KUBE_R, to: RT_X, y: OUT_Y, name: 'req', lights: ['runtime'] }),
      F.set({ at: 'req', chips: { lastOpChip: 'ListContainers' } }),
      F.top({ from: RT_X, to: KUBE_R, y: BACK_Y, after: 'req', name: 'ans' }),
      F.set({ at: 'ans', chips: { observedChip: '0 containers' } }),
    ],
  },
  {
    id: 'syncpod',
    duration: 3100,
    narration: 'The sync loop queued the Pod for its Pod worker goroutine, which now calls SyncPod. SyncPod compares desired state (1 container in spec) against observed state (no sandbox, 0 containers). The diff is two actions: create the Pod sandbox, then create and start the missing container.',
    chips: { podChip: POD_NAME, desiredChip: SPEC, observedChip: '0 containers', lastOpChip: 'ListContainers' },
    lit: ['kubelet', 'desiredChip', 'observedChip'],
    chain: 2,
  },
  {
    id: 'cri',
    duration: 3800,
    narration: 'Kubelet issues CRI gRPC calls in sequence. RunPodSandbox creates the pause container with shared namespaces, then PullImage fetches the image, a call imagePullPolicy can skip when the image is already on the Node. CreateContainer and StartContainer then launch each container in the spec. The Pod Sandbox via CRI card details the sandbox setup.',
    chips: { podChip: POD_NAME, desiredChip: SPEC, observedChip: '0 containers', lastOpChip: 'StartContainer' },
    wires: { rt: 'RunPodSandbox · Pull · Create · Start' },
    lit: ['kubelet', 'lastOpChip'],
    chain: 3,
    rewind: { chips: { lastOpChip: 'ListContainers' } },
    flow: CALLS.flatMap((name, i) => [
      F.top({
        from: KUBE_R, to: RT_X, y: OUT_Y, name: 'cri' + i,
        after: i === 0 ? undefined : 'cri' + (i - 1),
        lights: i === 0 ? ['runtime'] : undefined,
      }),
      F.set({ at: 'cri' + i, chips: { lastOpChip: name } }),
    ]),
  },
  {
    id: 'status',
    duration: 4000,
    narration: 'Right after that sync the Kubelet asks PLEG to relist the Pod (beta PLEGOnDemandRelist gate, on by default), so it sees the running container without waiting for the 1s timer. Observed state catches up to desired state. SyncPod finds nothing left to create or start, and Kubelet PATCHes Pod status again, this time with the running container in containerStatuses.',
    chips: { podChip: POD_NAME, desiredChip: SPEC, observedChip: '1 container running', lastOpChip: 'ListContainers' },
    wires: { rt: 'ListPodSandbox · ListContainers', api: 'PATCH .../pods/{name}/status' },
    lit: ['lastOpChip', 'kubelet', 'observedChip'],
    chain: 4,
    // The on-demand relist observes first, then the PATCH rides, and the chips follow that order.
    rewind: { chips: { observedChip: '0 containers', lastOpChip: 'StartContainer' } },
    flow: [
      F.top({ from: KUBE_R, to: RT_X, y: OUT_Y, name: 'list', lights: ['runtime'] }),
      F.set({ at: 'list', chips: { lastOpChip: 'ListContainers' } }),
      F.top({ from: RT_X, to: KUBE_R, y: BACK_Y, after: 'list', name: 'seen' }),
      F.set({ at: 'seen', chips: { observedChip: '1 container running' } }),
      F.route({ points: KUBE_TO_API, after: 'seen', lights: ['api'] }),
    ],
  },
];

export const init = defineCard(SCENE, STEPS_SPEC, { posterFirst: true });
