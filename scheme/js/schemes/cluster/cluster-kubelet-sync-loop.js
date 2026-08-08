import { P, F, defineCard, laneY, ladder, midX } from './cluster-kit.js';

// Design notes for this card: ./CARDS.md#cluster-kubelet-sync-loop

// Laid out on the L. Panel x<=397 y<=255 (269 at 1024x768) against the API box at y=300, so the
// CEILING is 360 characters per narration: 362 costs one more line and lands 1024x768 on 296.
const M = 60;
const CONTENT_L = M, CONTENT_R = 1200 - M;               // 60 / 1140

const TOP_Y = 40, TOP_H = 80, TOP_BOTTOM = TOP_Y + TOP_H;// 40 / 120
const TOP_CY = midX(TOP_Y, TOP_BOTTOM);                  // 80
const LANE_DY = 15;
const { out: OUT_Y, back: BACK_Y } = laneY(TOP_CY, LANE_DY);  // 65 / 95
const KUBE_X = 560, KUBE_W = 220, KUBE_R = KUBE_X + KUBE_W;  // 560..780
const RT_W = 240, RT_X = CONTENT_R - RT_W;  // 900..1140

const API_X = CONTENT_L, API_W = 240, API_H = 80;
const API_Y = 300, API_R = API_X + API_W;                // 60..300, 300..380
const API_CY = midX(API_Y, API_Y + API_H);               // 340
// Two risers, out left of back, so the vertical legs never share an x and never cross. Both clear
// the panel, each offset by LANE_DY from its face centre.
const RISER_OUT_X = 412, RISER_BACK_X = 436;
const { out: API_OUT_Y, back: API_BACK_Y } = laneY(API_CY, LANE_DY);   // 325 / 355
const API_TO_KUBE = [[API_R, API_OUT_Y], [RISER_OUT_X, API_OUT_Y], [RISER_OUT_X, OUT_Y], [KUBE_X, OUT_Y]];
const KUBE_TO_API = [[KUBE_X, BACK_Y], [RISER_BACK_X, BACK_Y], [RISER_BACK_X, API_BACK_Y], [API_R, API_BACK_Y]];

const LADDER_X = 640, LADDER_W = CONTENT_R - LADDER_X;   // 500, 640..1140
const LADDER_Y = 190, ROW_H = 32, ROW_GAP = 10;          // 5 rows -> 190..390

// The Kubelet owns EVERY ladder row, so the tie is a RELATIONSHIP: no ball, no arrowhead. Face
// midpoint to face midpoint, turn halfway between, and the whole band stays free for it.
const KUBE_CX = midX(KUBE_X, KUBE_R);                    // 670
const LADDER_CX = midX(LADDER_X, CONTENT_R);             // 890
const TIE_JOG_Y = midX(TOP_BOTTOM, LADDER_Y);            // 155
const KUBE_TO_CHAIN = [[KUBE_CX, TOP_BOTTOM], [KUBE_CX, TIE_JOG_Y], [LADDER_CX, TIE_JOG_Y], [LADDER_CX, LADDER_Y]];

const CHIP_X = CONTENT_L, CHIP_W = 480;                  // 60..540, the category column width
const CHIP_H = 34, CHIP_GAP = 8;
const CHIP_Y = ladder({ y: 430, rowH: CHIP_H, gap: CHIP_GAP });   // 430 / 472 / 514 / 556

// The list order IS the append order, so it is the z-order. Everything hangs off one wrapper group,
// arrowDefs included, so the whole drawing can be shifted with a single transform.
export const SCENE = {
  'aria-label': 'Kubelet sync loop: watch, PLEG, SyncPod, CRI, status',
  parts: [
    P.group({
      transform: 'translate(0, 0)',
      parts: [
        P.defs(),
        // Top arrows, symmetric about each box centre (y=80, so +/-15 -> 65 and 95):
        // Api <-> Kubelet (watch + status PATCH), Kubelet <-> Runtime (CRI calls).
        P.lane({ points: API_TO_KUBE, dim: true, dashed: true }),
        P.lane({ points: KUBE_TO_API, dim: true, dashed: true }),
        P.arrow({ x1: KUBE_R, y1: OUT_Y, x2: RT_X, y2: OUT_Y, dim: true, dashed: true }),
        P.arrow({ x1: RT_X, y1: BACK_Y, x2: KUBE_R, y2: BACK_Y, dim: true, dashed: true }),
        // Kubelet.bottom -> ladder.top: the loop below belongs to this box. See KUBE_TO_CHAIN above.
        P.relation({ points: KUBE_TO_CHAIN }),
        // Wire labels between top row and pipeline, right-anchored left of the out riser: the longest
        // string is 193 units against a 112 unit gap, so a centred label runs through both risers.
        P.wire({ key: 'api', x: RISER_OUT_X - 8, y: API_Y - 12, anchor: 'end' }),
        // ABOVE the top row, not below it: the band below belongs to the Kubelet-to-ladder tie now.
        // TOP_Y - 14 is where cluster-node-drain, cluster-oom-kill and cluster-node-failure put theirs.
        P.wire({ key: 'rt', x: midX(KUBE_R, RT_X), y: TOP_Y - 14 }),
        // State chips column on the right.
        P.chip({ key: 'podChip', x: CHIP_X, y: CHIP_Y(0), w: CHIP_W, h: CHIP_H, name: 'Pod', value: 'none' }),
        P.chip({ key: 'desiredChip', x: CHIP_X, y: CHIP_Y(1), w: CHIP_W, h: CHIP_H, name: 'desired', value: 'none' }),
        P.chip({ key: 'observedChip', x: CHIP_X, y: CHIP_Y(2), w: CHIP_W, h: CHIP_H, name: 'observed', value: 'none' }),
        P.chip({ key: 'lastOpChip', x: CHIP_X, y: CHIP_Y(3), w: CHIP_W, h: CHIP_H, name: 'last CRI op', value: 'none' }),
        P.packets(),
        // Chain LAST among middle blocks so it renders on top of packet layer.
        // Pipeline chain: 5 stages of the Kubelet sync cycle.
        P.chain({
          key: 'chain', x: LADDER_X, y: LADDER_Y, w: LADDER_W, rowH: ROW_H, gap: ROW_GAP,
          items: [
            '1. watch     ·  pod specs from API',
            '2. PLEG      ·  observe containers via ListContainers',
            '3. SyncPod   ·  reconcile desired vs observed',
            '4. CRI       ·  Pull/Create/Start container gRPC',
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
const POD_NAME = 'my-app-7d4-abc', SPEC = '1 container';
// One packet per call the narration names, in order, and the chip names each as it lands: the
// step is a SEQUENCE, so a chip reading StartContainer from entry skips three quarters of it.
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
    narration: 'The API streams an ADDED event for Pod my-app-7d4-abc bound to Node-1. The Kubelet merges its spec sources into one update channel, and the sync loop records the Pod in podManager as desired state.',
    chips: { podChip: POD_NAME, desiredChip: SPEC, observedChip: 'none', lastOpChip: 'none' },
    wires: { api: 'watch ADDED' },
    lit: ['api', 'podChip', 'desiredChip'],
    chain: 0,
    // podManager holds the spec once the event REACHES the Kubelet, so both chips wait for the
    // ball rather than describing a desired state the Node has not been told about yet.
    rewind: { chips: { podChip: 'none', desiredChip: 'none' } },
    flow: [
      F.route({ points: API_TO_KUBE, name: 'added', lights: ['kubelet'] }),
      F.set({ at: 'added', chips: { podChip: 'my-app-7d4-abc', desiredChip: '1 container' } }),
    ],
  },
  {
    id: 'pleg',
    duration: 2200,
    narration: 'PLEG (Pod Lifecycle Event Generator) wakes on its 1s timer, calls ListContainers on the runtime, and sees no containers for the new Pod. The empty observed state is recorded for SyncPod. The EventedPLEG feature gate (alpha, off by default) has the runtime push lifecycle events over CRI, so the Kubelet relists at a reduced rate rather than on its 1s timer.',
    chips: { podChip: POD_NAME, desiredChip: SPEC, observedChip: '0 containers', lastOpChip: 'ListContainers' },
    wires: { rt: 'ListContainers' },
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
    duration: 1900,
    narration: 'SyncPod runs for the new Pod, comparing desired state (1 container in spec) against observed state (0 containers). The diff is a single action: create and start the missing container. The per-Pod worker goroutine drives that sequence directly, with no separate action queue involved.',
    chips: { podChip: POD_NAME, desiredChip: SPEC, observedChip: '0 containers', lastOpChip: 'ListContainers' },
    lit: ['kubelet', 'desiredChip', 'observedChip'],
    chain: 2,
  },
  {
    id: 'cri',
    // Four calls, four packets: 3660ms. PullImage cost the step 800 (a 120 unit hop sits on the
    // PKT_DUR_MIN floor of 700, plus BEAT.afterHop), so duration follows it up from 3000.
    duration: 3800,
    narration: 'Kubelet issues CRI gRPC calls in sequence: RunPodSandbox creates the pause container with shared namespaces, PullImage fetches the image unless it is already on the Node, then CreateContainer and StartContainer launch each container in the spec. Details of the sandbox setup are covered in the Pod Sandbox via CRI card.',
    chips: { podChip: POD_NAME, desiredChip: SPEC, observedChip: '0 containers', lastOpChip: 'StartContainer' },
    wires: { rt: 'RunPodSandbox · Pull · Create · Start' },
    lit: ['kubelet', 'lastOpChip'],
    chain: 3,
    rewind: { chips: { lastOpChip: 'ListContainers' } },
    flow: CALLS.flatMap((name, i) => [
      F.segment({
        from: [KUBE_R, OUT_Y], to: [RT_X, OUT_Y], name: 'cri' + i,
        after: i === 0 ? undefined : 'cri' + (i - 1),
        lights: i === 0 ? ['runtime'] : undefined,
      }),
      F.set({ at: 'cri' + i, chips: { lastOpChip: name } }),
    ]),
  },
  {
    id: 'status',
    // Motion: the PLEG round trip to the runtime (700 out, 700 back with a beat between), then
    // the PATCH down the riser to the API, ending at 3316.
    duration: 3600,
    narration: 'Next PLEG cycle observes the running container, observed state catches up to desired state, and SyncPod issues no new CRI calls. Kubelet PATCHes Pod status (containerStatuses) back to the API. The loop is ready for the next change.',
    chips: { podChip: POD_NAME, desiredChip: SPEC, observedChip: '1 container running', lastOpChip: 'ListContainers' },
    wires: { api: 'PATCH .../pods/{name}/status' },
    lit: ['lastOpChip', 'kubelet', 'observedChip'],
    chain: 4,
    // The sentence OPENS with the next PLEG cycle observing the container and only THEN PATCHes,
    // so both ride. The chips carry the same order: the step starts holding what CRI left.
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
