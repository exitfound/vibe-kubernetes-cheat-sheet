import { P, F, defineCard, laneY, ladder, strip, spread, midX, shade, CLU, LAYOUT, OPACITY } from './cluster-kit.js';

// Design notes for this card: ./CARDS.md#cluster-node-drain

// Layout C, ladder right, Node frame under the panel. Panel x<=397 y<=304, frame top 380: NO
// NARRATION MAY PASS 528 CHARACTERS, and that ceiling belongs to the frame, not to the current text.
const M = CLU.M;
const CONTENT_L = M, CONTENT_R = 1200 - M;               // 60 / 1140
const CX = midX(CONTENT_L, CONTENT_R);                   // 600, the canvas centre by construction

const BOX_W = CLU.BOX_W, BOX_H = CLU.BOX_H;              // 232 / 80
const TOP_Y = CLU.TOP_Y, TOP_BOTTOM = TOP_Y + BOX_H;     // 40 / 120
// The API is centred on the Node frame so the eviction lane is one straight drop, and the whole top
// row moved left by the same 268 units to keep the pair rigid.
const TOP_GAP = 56;
const API_X = CX - BOX_W / 2;                            // 484..716, centred on the Node frame
const KUBECTL_X = API_X - TOP_GAP - BOX_W;               // 196..428
const KUBECTL_R = KUBECTL_X + BOX_W;                     // 428, the face every top hop leaves from
const LANE_DY = CLU.LANE_DY, TOP_CY = midX(TOP_Y, TOP_BOTTOM);   // 12 / 80
const { out: REQ_Y, back: RESP_Y } = laneY(TOP_CY, LANE_DY);     // 68 / 92
// Over the API, NOT over the 56 unit gap: the longest label runs 365 units and gap-centred would
// reach x=273, inside the panel. Centred on the API it spans 417..783 and clears it outright.
const WIRE_X = CX;                                       // 600
const WIRE_Y = TOP_Y - 14;                               // 26, above the row: the spine owns below it

const LADDER_X = LAYOUT.C.ladder.x, LADDER_W = LAYOUT.C.ladder.w;   // 660..1140, right of the spine
const LADDER_Y = 170, ROW_H = CLU.ROW_H, ROW_GAP = CLU.ROW_GAP;     // 5 rows -> 170..370

const NODE_X = CONTENT_L, NODE_W = CONTENT_R - CONTENT_L;// 60..1140
const NODE_Y = 380, NODE_H = CLU.NODE.H;                 // 380..532, clear of the panel by 76
const POD_W = 300, POD_H = CLU.NODE.POD_H, POD_Y = NODE_Y + CLU.NODE.POD_DY;   // 414..520
const POD_PAD = 24;
// Fixed WIDTH, derived gap: three 300-wide Pods inset by POD_PAD leave 66 between them.
const POD_X = spread({ from: NODE_X + POD_PAD, to: CONTENT_R - POD_PAD, count: 3, w: POD_W }).x;  // 84/450/816
const POD_INNER = { dx: 30, w: POD_W - 60, dy: 28, h: 52 };

// Chips as a bottom strip, TWO per row: four across leaves 258 units and the names overlap
// their own values. 532 clears the longest pair on this card by 200.
const CHIP_H = CLU.CHIP_H, CHIP_GAP = 16, CHIP_VGAP = 8, CHIP_COLS = 2;
const CHIPS_Y = NODE_Y + NODE_H + 16;                    // 548, second row ends on 624
const CHIP_COL = strip({ from: CONTENT_L, to: CONTENT_R, count: CHIP_COLS, gap: CHIP_GAP });
const CHIP_W = CHIP_COL.w;                               // 532, which is LAYOUT.C.strip.two
const CHIP_ROW = ladder({ y: CHIPS_Y, rowH: CHIP_H, gap: CHIP_VGAP });
// The strip is read as a GRID: the index wraps across the two columns and steps down every second.
const CHIP_X = i => CHIP_COL.x(i % CHIP_COLS);
const CHIP_Y = i => CHIP_ROW(Math.floor(i / CHIP_COLS));

// ONE eviction lane, addressed to the Node rather than a Pod inside it: a single vertical drop,
// both endpoints on face midpoints. It leaves the API, not kubectl, because the API is what acts.
const API_CX = midX(API_X, API_X + BOX_W);               // 600
const EVICT_ROUTE = [[API_CX, TOP_BOTTOM], [API_CX, NODE_Y]];

// Bottom: Node-1 with 3 Pods: web-1, web-2 (Deployment), fluentd (DaemonSet).
const POD_NAMES = ['web-1', 'web-2', 'fluentd'];
const POD_OWNER = ['Deployment', 'Deployment', 'DaemonSet'];

// The list order IS the append order, so it is the z-order: the two top lanes and the wire label,
// the four chips, the eviction lane, the packet layer, the ladder, the Node frame and its Pods.
export const SCENE = {
  'aria-label': 'Node drain: cordon, list-and-skip, eviction API with PDB gating',
  parts: [
    P.defs(),
    // Top-row lanes, one per direction, straddling the row centre line by LANE_DY.
    P.arrow({ x1: KUBECTL_R, y1: REQ_Y, x2: API_X, y2: REQ_Y, dim: true, dashed: true }),
    P.arrow({ x1: API_X, y1: RESP_Y, x2: KUBECTL_R, y2: RESP_Y, dim: true, dashed: true }),
    P.wire({ key: 'req', x: WIRE_X, y: WIRE_Y }),
    // State chips, one bottom strip across the content width.
    P.chip({ key: 'cordonChip',  x: CHIP_X(0), y: CHIP_Y(0), w: CHIP_W, h: CHIP_H, name: 'spec.unschedulable',     value: 'false' }),
    P.chip({ key: 'pdbChip',     x: CHIP_X(1), y: CHIP_Y(1), w: CHIP_W, h: CHIP_H, name: 'web-pdb · minAvailable', value: '1' }),
    P.chip({ key: 'healthyChip', x: CHIP_X(2), y: CHIP_Y(2), w: CHIP_W, h: CHIP_H, name: 'currentHealthy',         value: '2 of 2' }),
    P.chip({ key: 'lastChip',    x: CHIP_X(3), y: CHIP_Y(3), w: CHIP_W, h: CHIP_H, name: 'last eviction',          value: 'none' }),
    // One lane, and it ends on the Node frame: the eviction is addressed to a Pod on this Node,
    // and which Pod that is comes from the pulse, not from a fan of taps into the Pod row.
    P.lane({ points: EVICT_ROUTE, dim: true, dashed: true }),
    P.packets(),
    // Pipeline chain, right of the spine.
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
    // Bare `g` wrappers with no class of their own: the id is what tells one Pod's shell and inner
    // box from the next one's, and it is what the fade and the opacity pins address.
    ...POD_NAMES.map((name, i) => P.pod({
      key: `pod${i + 1}`, id: `pod${i + 1}`, innerKey: `pod${i + 1}Box`,
      x: POD_X(i), y: POD_Y, w: POD_W, h: POD_H, label: 'Pod', sublabel: '', containers: 0,
      inner: { ...POD_INNER, label: name, sublabel: POD_OWNER[i] },
    })),
    // Top-row blocks ABSOLUTE LAST.
    P.box({ key: 'apiserver', x: API_X, y: TOP_Y, w: BOX_W, h: BOX_H, label: 'API', sublabel: 'eviction gateway' }),
    P.box({ key: 'kubectl', x: KUBECTL_X, y: TOP_Y, w: BOX_W, h: BOX_H, label: 'kubectl', sublabel: 'drain Node-1' }),
  ],
  // The three Pods DO go to clearHighlights: this card pulses all three and the pulse has to be
  // taken back off between steps, unlike the exemplar's placedPod.
  reset: {
    keys: ['kubectl', 'apiserver', 'cordonChip', 'pdbChip', 'healthyChip', 'lastChip', 'pod1Box', 'pod2Box', 'pod3Box'],
    pods: ['pod1', 'pod2', 'pod3'],
  },
};

// The lane ends on the Node frame, which is on screen for the whole card, so it never has to be
// pinned to the presence of a Pod: nothing it points at can go away under it.

// Slower than FADE.out 700, where the Pod is gone 200ms before its own pulse ends and the eviction
// reads as a cut. Fades to OPACITY.terminated, not 0, or it leaves a hole in the Node frame.
const POD_FADE = 1200;
const GONE = OPACITY.terminated;
// Every step writes all three Pod shades, so a Pod that is still standing says so rather than
// inheriting it: LIVE is the whole row and each eviction step overrides the ones that are gone.
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
    duration: 2000,
    narration: 'The drain command PATCHes Node-1 with spec.unschedulable=true. The Scheduler stops placing new Pods on this Node unless they tolerate the node.kubernetes.io/unschedulable taint the way DaemonSet Pods do, and the status shows SchedulingDisabled. Already-running Pods stay put for now. Cordon is also exposed as a separate verb (kubectl cordon Node-1), drain just bundles it with the eviction loop.',
    chips: { cordonChip: CORDONED, pdbChip: '1', healthyChip: '2 of 2', lastChip: 'none' },
    wires: { req: 'PATCH /api/v1/nodes/Node-1 · spec.unschedulable=true' },
    opacity: LIVE,
    lit: ['kubectl', 'cordonChip'],
    chain: 0,
    // kubectl, apiserver and cordonChip are newly highlighted here and only LIGHT: block
    // auto-pulse is off catalog-wide (autoPulse: false). The PATCH rides the top hop.
    flow: [F.top({ from: KUBECTL_R, to: API_X, y: REQ_Y, lights: ['apiserver'] })],
  },
  {
    id: 'list',
    duration: 1900,
    narration: 'The drain command lists Pods on Node-1 via fieldSelector=spec.nodeName=Node-1 and buckets each one. A drain never evicts DaemonSet Pods. Mirror Pods (the API record of static Pods) are skipped because Kubelet would recreate them. Pods with emptyDir volumes and bare Pods with no owner abort the drain until the matching flag is passed. Two Deployment-backed Pods are left for the Eviction API.',
    chips: { cordonChip: CORDONED, pdbChip: '1', healthyChip: '2 of 2', lastChip: 'none' },
    wires: { req: 'GET /api/v1/pods · fieldSelector=spec.nodeName=Node-1' },
    opacity: LIVE,
    lit: ['kubectl'],
    chain: 1,
    flow: [F.top({ from: KUBECTL_R, to: API_X, y: REQ_Y, lights: ['apiserver'] })],
  },
  {
    id: 'evict-A',
    // The eviction leaves the API, not kubectl, one 260 unit drop. The step ends on the Pod fade at
    // POD_FADE 1200, so it runs to 2700ms and duration follows it.
    duration: 2800,
    narration: 'The drain command POSTs an eviction for web-1. The API reads the matching PDB, whose status the disruption controller keeps at disruptionsAllowed=1. The eviction is granted with 200 OK, disruptionsAllowed decrements to 0 under optimistic concurrency, and the Pod is deleted with its grace period. The owning ReplicaSet replaces it elsewhere, covered in the Deployment rolling update card.',
    chips: { cordonChip: CORDONED, pdbChip: '1', healthyChip: '1 of 2', lastChip: 'web-1 · 200 OK' },
    wires: { req: 'POST .../pods/web-1/eviction · 200 OK' },
    // S-13: the static block states the END, so prev lands on a count that agrees with the
    // terminated shade below. The API READS 2 and the eviction takes it to 1, hence the rewind.
    rewind: { chips: { healthyChip: '2 of 2', lastChip: 'none' } },
    // Pin final state so cancel between steps does not flash to default. The evicted Pod ends at
    // the terminated shade, so the static path must NOT stand a highlight in for the pulse here.
    opacity: { ...LIVE, pod1: GONE },
    lit: ['kubectl', 'pdbChip', 'healthyChip', 'lastChip'],
    chain: 2,
    // Top packet: kubectl → apiserver (POST eviction), then the delete flows
    // down the connector. The Pod reacts only when the ball reaches the node.
    flow: [
      F.top({ from: KUBECTL_R, to: API_X, y: REQ_Y, name: 'req', lights: ['apiserver'] }),
      // The 200 OK rides the answer lane home, the same lane the retry step uses for its 429. A
      // return the narration promises and the motion never delivers is a defect family here.
      F.top({ from: API_X, to: KUBECTL_R, y: RESP_Y, after: 'req', name: 'granted' }),
      // What kubectl KNOWS, so it cannot read 200 OK while the POST is still on the wire: it turns
      // over when the answer lands back, the count when the eviction takes effect on the Pod.
      F.set({ at: 'granted', chips: { lastChip: 'web-1 · 200 OK' } }),
      F.route({ points: EVICT_ROUTE, after: 'req', name: 'evict' }),
      F.set({ at: 'evict', chips: { healthyChip: '1 of 2' } }),
      F.pulse({ pod: 'pod1', at: 'evict' }),
      // S-18: the inner box carries the pulse highlight, and the fade takes it back off in its own
      // onfinish, so a Pod at the terminated shade is never left standing lit.
      F.fade({ target: 'pod1', to: GONE, dur: POD_FADE, at: 'evict', unlight: ['pod1Box'] }),
    ],
  },
  {
    id: 'evict-B-retry',
    // Four hops plus the drop, ending on the POD_FADE dissolve: 4300ms.
    duration: 4400,
    narration: 'The drain command POSTs eviction for web-2 next. With the web-1 replacement still spinning up, currentHealthy=1 equals minAvailable, so disruptionsAllowed is 0 and the API returns 429 Too Many Requests. The drain command retries every 5 seconds. Once the replacement turns Ready elsewhere, currentHealthy is back to 2 and the next retry returns 200 OK, evicting web-2.',
    chips: { cordonChip: CORDONED, pdbChip: '1', healthyChip: '1 of 2 → 2 of 2', lastChip: 'web-2 · 429 → 200 OK' },
    wires: { req: 'POST .../pods/web-2/eviction · 429 → retry → 200' },
    // Both pinned values are TRANSITIONS and both chips START from what evict-A left: announcing
    // them at entry would give away the 429 and the retry that clears it before either is drawn.
    rewind: { chips: { healthyChip: '1 of 2', lastChip: 'web-1 · 200 OK' } },
    // Pin final state. Both evicted Pods hold the terminated shade, so neither takes a stand-in
    // highlight on the static path.
    opacity: { ...LIVE, pod1: GONE, pod2: GONE },
    lit: ['kubectl', 'pdbChip', 'healthyChip', 'lastChip'],
    chain: 3,
    // First attempt: blocked. Top packet out, 429 response back, no connector follow-up. kubectl
    // is the source and lit from entry, the apiserver lights when the eviction reaches it.
    flow: [
      F.top({ from: KUBECTL_R, to: API_X, y: REQ_Y, name: 'attempt', lights: ['apiserver'] }),
      F.top({ from: API_X, to: KUBECTL_R, y: RESP_Y, after: 'attempt', name: 'denied' }),
      F.set({ at: 'denied', chips: { lastChip: 'web-2 · 429' } }),
      // Retry: kubectl → apiserver → connector → the Pod reacts on arrival. The count bumps as the
      // retry leaves, because the narration has the replacement turning Ready BEFORE it is granted.
      F.top({ from: KUBECTL_R, to: API_X, y: REQ_Y, after: 'denied', name: 'retry' }),
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
    // A chip means what its name says: this holds the LAST eviction, not a tally. The summary is
    // carried by ladder row 5 and the wire label.
    chips: { cordonChip: CORDONED, pdbChip: '1', healthyChip: '2 of 2', lastChip: 'web-2 · 200 OK' },
    wires: { req: 'drain complete · Node safe for maintenance' },
    // Pin final state. Both evicted Pods stay on screen at the terminated shade.
    opacity: { ...LIVE, pod1: GONE, pod2: GONE },
    // The climb happened on the retry (`1 of 2 -> 2 of 2`); here the chip settles to the plain
    // reading, and it stays lit because a value that changes with no cue on it reads as a glitch.
    lit: ['healthyChip', 'kubectl', 'cordonChip', 'lastChip'],
    chain: 4,
    // fluentd (the DaemonSet Pod) is the lone survivor on Node-1: pulse it once
    // to call out that it is the only workload that stays after the drain.
    flow: [F.pulse({ pod: 'pod3' })],
  },
];

export const init = defineCard(SCENE, STEPS_SPEC, { posterFirst: true });
