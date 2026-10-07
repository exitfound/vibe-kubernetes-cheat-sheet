import { LANE_DY, P, F, defineCard, laneY, ladder, strip, spread, midX, shade, CLU, LAYOUT, OPACITY } from './cluster-kit.js';

// Design notes for this card: ./CARDS/cluster-node-drain.md

// Layout C, ladder right, Node frame under the panel: no narration may pass 528 characters.
const M = CLU.M;
const CONTENT_L = M, CONTENT_R = 1200 - M;
const CX = midX(CONTENT_L, CONTENT_R);

// The API is centred on the Node frame so the eviction lane is one straight drop.
const BOX_W = CLU.BOX_W, BOX_H = CLU.BOX_H;
const TOP_Y = CLU.TOP_Y, TOP_BOTTOM = TOP_Y + BOX_H;
const API_X = CX - BOX_W / 2, API_R = API_X + BOX_W;
const KUBECTL_X = CONTENT_R - BOX_W;
const TOP_CY = midX(TOP_Y, TOP_BOTTOM);
const { out: REQ_Y, back: RESP_Y } = laneY(TOP_CY, LANE_DY);
const WIRE_X = midX(API_R, KUBECTL_X);
const WIRE_Y = TOP_Y - 14;                               // above the row: the spine owns below it

const LADDER_X = LAYOUT.C.ladder.x, LADDER_W = LAYOUT.C.ladder.w;
const LADDER_Y = 170, ROW_H = CLU.ROW_H, ROW_GAP = CLU.ROW_GAP;

const NODE_X = CONTENT_L, NODE_W = CONTENT_R - CONTENT_L;
const NODE_Y = 380, NODE_H = CLU.NODE.H;
const POD_W = 300, POD_H = CLU.NODE.POD_H, POD_Y = NODE_Y + CLU.NODE.POD_DY;
const POD_PAD = 24;
// Fixed width, derived gap.
const POD_X = spread({ from: NODE_X + POD_PAD, to: CONTENT_R - POD_PAD, count: 3, w: POD_W }).x;
const POD_INNER = { dx: 30, w: POD_W - 60, dy: 28, h: 52 };

// Two chips per row: four across is too narrow for the name-value pairs.
const CHIP_H = CLU.CHIP_H, CHIP_GAP = 16, CHIP_VGAP = 8, CHIP_COLS = 2;
const CHIPS_Y = NODE_Y + NODE_H + 16;
const CHIP_COL = strip({ from: CONTENT_L, to: CONTENT_R, count: CHIP_COLS, gap: CHIP_GAP });
const CHIP_W = CHIP_COL.w;
const CHIP_ROW = ladder({ y: CHIPS_Y, rowH: CHIP_H, gap: CHIP_VGAP });
// A grid: the index wraps across the two columns.
const CHIP_X = i => CHIP_COL.x(i % CHIP_COLS);
const CHIP_Y = i => CHIP_ROW(Math.floor(i / CHIP_COLS));

// One eviction lane from the API (it acts, not kubectl) to the Node frame, never a Pod.
const API_CX = midX(API_X, API_R);
const EVICT_ROUTE = [[API_CX, TOP_BOTTOM], [API_CX, NODE_Y]];

const POD_NAMES = ['web-1', 'web-2', 'fluentd'];
const POD_OWNER = ['Deployment', 'Deployment', 'DaemonSet'];

// List order is z-order.
export const SCENE = {
  'aria-label': 'Node drain: cordon, list-and-skip, eviction through the API with PDB gating, a 429 and a retry, and the DaemonSet Pod left standing',
  parts: [
    P.defs(),
    // The request runs right to left: the panel owns everything left of the API.
    P.arrow({ x1: KUBECTL_X, y1: REQ_Y, x2: API_R, y2: REQ_Y, dim: true, dashed: true }),
    P.arrow({ x1: API_R, y1: RESP_Y, x2: KUBECTL_X, y2: RESP_Y, dim: true, dashed: true }),
    P.wire({ key: 'req', x: WIRE_X, y: WIRE_Y }),
    P.chip({ key: 'cordonChip',  x: CHIP_X(0), y: CHIP_Y(0), w: CHIP_W, h: CHIP_H, name: 'spec.unschedulable',     value: 'false' }),
    P.chip({ key: 'pdbChip',     x: CHIP_X(1), y: CHIP_Y(1), w: CHIP_W, h: CHIP_H, name: 'web-pdb · minAvailable', value: '1' }),
    P.chip({ key: 'healthyChip', x: CHIP_X(2), y: CHIP_Y(2), w: CHIP_W, h: CHIP_H, name: 'currentHealthy',         value: '2 of 2' }),
    P.chip({ key: 'lastChip',    x: CHIP_X(3), y: CHIP_Y(3), w: CHIP_W, h: CHIP_H, name: 'last eviction',          value: 'none' }),
    // Which Pod is evicted comes from the pulse, not from taps into the Pod row.
    P.lane({ points: EVICT_ROUTE, dim: true, dashed: true }),
    P.packets(),
    P.chain({
      key: 'chain', x: LADDER_X, y: LADDER_Y, w: LADDER_W, rowH: ROW_H, gap: ROW_GAP,
      items: [
        '1. cordon   ·  PATCH Node spec.unschedulable=true',
        '2. list     ·  --ignore-daemonsets --delete-emptydir-data --force',
        '3. evict    ·  POST .../pods/{name}/eviction',
        '4. PDB gate ·  API reads disruptionsAllowed, 200 or 429',
        '5. drained  ·  app Pods gone, DaemonSet stays',
      ],
    }),
    P.node({ key: 'nodeEl', x: NODE_X, y: NODE_Y, w: NODE_W, h: NODE_H, label: 'Node-1' }),
    // The id is what the fade and the opacity pins address.
    ...POD_NAMES.map((name, i) => P.pod({
      key: `pod${i + 1}`, id: `pod${i + 1}`, innerKey: `pod${i + 1}Box`,
      x: POD_X(i), y: POD_Y, w: POD_W, h: POD_H, label: 'Pod', sublabel: '', containers: 0,
      inner: { ...POD_INNER, label: name, sublabel: POD_OWNER[i] },
    })),
    // Top-row blocks absolute last.
    P.box({ key: 'apiserver', x: API_X, y: TOP_Y, w: BOX_W, h: BOX_H, label: 'API', sublabel: 'eviction gateway' }),
    P.box({ key: 'kubectl', x: KUBECTL_X, y: TOP_Y, w: BOX_W, h: BOX_H, label: 'kubectl', sublabel: 'drain Node-1' }),
  ],
  // All three Pods are pulsed, so all three are reset between steps.
  reset: {
    keys: ['kubectl', 'apiserver', 'cordonChip', 'pdbChip', 'healthyChip', 'lastChip', 'pod1Box', 'pod2Box', 'pod3Box'],
    pods: ['pod1', 'pod2', 'pod3'],
  },
};

// Slower than FADE.out so the Pod outlives its own pulse. Terminated, not 0, or the frame has a hole.
const POD_FADE = 1200;
const GONE = OPACITY.terminated;
// Every step writes all three Pod shades rather than inheriting them.
const LIVE = shade(['pod1', 'pod2', 'pod3'], 1);
const CORDONED = 'true · SchedulingDisabled';

export const STEPS_SPEC = [
  {
    id: 'idle',
    duration: 1500,
    chips: { cordonChip: 'false', pdbChip: '1', healthyChip: '2 of 2', lastChip: 'none' },
    opacity: LIVE,
    chain: -1,
  },
  {
    id: 'cordon',
    duration: 3800,
    narration: 'The drain command PATCHes Node-1 with spec.unschedulable=true. The Scheduler stops placing new Pods on this Node unless they tolerate the node.kubernetes.io/unschedulable taint the way DaemonSet Pods do, and the status shows SchedulingDisabled. Already-running Pods stay put for now. Cordon is also exposed as a separate verb (kubectl cordon Node-1), drain just bundles it with the eviction loop.',
    chips: { cordonChip: CORDONED, pdbChip: '1', healthyChip: '2 of 2', lastChip: 'none' },
    wires: { req: 'PATCH Node-1 · spec.unschedulable=true' },
    // S-13: the static block states the end, the field turns over when the answer lands.
    rewind: { chips: { cordonChip: 'false' } },
    opacity: LIVE,
    lit: ['kubectl', 'cordonChip'],
    chain: 0,
    flow: [
      F.top({ from: KUBECTL_X, to: API_R, y: REQ_Y, name: 'req', lights: ['apiserver'] }),
      F.top({ from: API_R, to: KUBECTL_X, y: RESP_Y, after: 'req', name: 'acked' }),
      // A chip shows what kubectl knows: it turns when the answer is back.
      F.set({ at: 'acked', chips: { cordonChip: CORDONED } }),
    ],
  },
  {
    id: 'list',
    duration: 3800,
    narration: 'The drain command lists Pods on Node-1 via fieldSelector=spec.nodeName=Node-1 and buckets each one. A drain never evicts DaemonSet Pods and will not proceed without --ignore-daemonsets. Mirror Pods (the API record of static Pods) are skipped because Kubelet would recreate them. Pods with emptyDir volumes and bare Pods with no owner abort the drain until the matching flag is passed. Two Deployment-backed Pods are left for the Eviction API.',
    chips: { cordonChip: CORDONED, pdbChip: '1', healthyChip: '2 of 2', lastChip: 'none' },
    wires: { req: 'GET /api/v1/pods · fieldSelector=spec.nodeName=Node-1' },
    opacity: LIVE,
    lit: ['kubectl'],
    chain: 1,
    // The bucketing is done on what comes back, so the list rides home.
    flow: [
      F.top({ from: KUBECTL_X, to: API_R, y: REQ_Y, name: 'req', lights: ['apiserver'] }),
      F.top({ from: API_R, to: KUBECTL_X, y: RESP_Y, after: 'req', name: 'listed' }),
    ],
  },
  {
    id: 'evict-A',
    // Duration follows the Pod fade at the end.
    duration: 2800,
    narration: 'The drain command POSTs an eviction for web-1. The API reads the matching PDB, whose status the disruption controller keeps at disruptionsAllowed=1. The eviction is granted with 200 OK, disruptionsAllowed decrements to 0 under optimistic concurrency, and the Pod is deleted with its grace period. The owning ReplicaSet replaces it elsewhere, covered in the Deployment rolling update card.',
    chips: { cordonChip: CORDONED, pdbChip: '1', healthyChip: '1 of 2', lastChip: 'web-1 · 200 OK' },
    wires: { req: 'POST .../pods/web-1/eviction' },
    // S-13: the static block states the end. The API reads 2 and the eviction takes it to 1.
    rewind: { chips: { healthyChip: '2 of 2', lastChip: 'none' } },
    // The evicted Pod ends terminated, so the static path takes no stand-in highlight.
    opacity: { ...LIVE, pod1: GONE },
    lit: ['kubectl', 'pdbChip', 'healthyChip', 'lastChip'],
    chain: 2,
    flow: [
      F.top({ from: KUBECTL_X, to: API_R, y: REQ_Y, name: 'req', lights: ['apiserver'] }),
      F.top({ from: API_R, to: KUBECTL_X, y: RESP_Y, after: 'req', name: 'granted' }),
      // The last-eviction chip turns on the answer, the count on the eviction arrival.
      F.set({ at: 'granted', chips: { lastChip: 'web-1 · 200 OK' } }),
      F.route({ points: EVICT_ROUTE, after: 'req', name: 'evict' }),
      F.set({ at: 'evict', chips: { healthyChip: '1 of 2' } }),
      F.pulse({ pod: 'pod1', at: 'evict' }),
      // S-18: the fade unlights the inner box so a terminated Pod is never left lit.
      F.fade({ target: 'pod1', to: GONE, dur: POD_FADE, at: 'evict', unlight: ['pod1Box'] }),
    ],
  },
  {
    id: 'evict-B-retry',
    duration: 4400,
    narration: 'The drain command POSTs eviction for web-2 next. With the web-1 replacement still spinning up, currentHealthy=1 equals minAvailable, so disruptionsAllowed is 0 and the API returns 429 Too Many Requests. The drain command retries every 5 seconds. Once the replacement turns Ready elsewhere, currentHealthy is back to 2 and the next retry returns 200 OK, evicting web-2.',
    chips: { cordonChip: CORDONED, pdbChip: '1', healthyChip: '1 of 2 → 2 of 2', lastChip: 'web-2 · 429 → 200 OK' },
    wires: { req: 'POST .../pods/web-2/eviction' },
    // Both chips start from what evict-A left, so the 429 is not given away at entry.
    rewind: { chips: { healthyChip: '1 of 2', lastChip: 'web-1 · 200 OK' } },
    opacity: { ...LIVE, pod1: GONE, pod2: GONE },
    lit: ['kubectl', 'pdbChip', 'healthyChip', 'lastChip'],
    chain: 3,
    // First attempt is blocked: 429 back, nothing goes down.
    flow: [
      F.top({ from: KUBECTL_X, to: API_R, y: REQ_Y, name: 'attempt', lights: ['apiserver'] }),
      F.top({ from: API_R, to: KUBECTL_X, y: RESP_Y, after: 'attempt', name: 'denied' }),
      F.set({ at: 'denied', chips: { lastChip: 'web-2 · 429' } }),
      // The count bumps as the retry leaves: the replacement is Ready before the grant.
      F.top({ from: KUBECTL_X, to: API_R, y: REQ_Y, after: 'denied', name: 'retry' }),
      F.set({ after: 'denied', chips: { healthyChip: '1 of 2 → 2 of 2' } }),
      F.route({ points: EVICT_ROUTE, after: 'retry', name: 'evict' }),
      F.set({ at: 'evict', chips: { lastChip: 'web-2 · 429 → 200 OK' } }),
      F.pulse({ pod: 'pod2', at: 'evict' }),
      F.fade({ target: 'pod2', to: GONE, dur: POD_FADE, at: 'evict', unlight: ['pod2Box'] }),
    ],
  },
  {
    id: 'drained',
    duration: 2200,
    narration: 'Node-1 carries only the DaemonSet Pod now. Application traffic runs on the replacement web-1 and web-2 elsewhere. The Node is safe for kernel patch, reboot, or removal. To bring it back, kubectl uncordon Node-1 flips spec.unschedulable=false and the Scheduler can place new Pods on it again.',
    // The last eviction, not a tally.
    chips: { cordonChip: CORDONED, pdbChip: '1', healthyChip: '2 of 2', lastChip: 'web-2 · 200 OK' },
    wires: { req: 'drain complete · DaemonSet Pod stays' },
    opacity: { ...LIVE, pod1: GONE, pod2: GONE },
    // A value that changes is lit, or it reads as a glitch.
    lit: ['healthyChip', 'kubectl', 'cordonChip', 'lastChip'],
    chain: 4,
    // The DaemonSet Pod is the lone survivor.
    flow: [F.pulse({ pod: 'pod3' })],
  },
];

export const init = defineCard(SCENE, STEPS_SPEC, { posterFirst: true });
