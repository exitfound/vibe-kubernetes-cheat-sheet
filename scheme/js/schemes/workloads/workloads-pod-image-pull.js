import { path } from '../../lib/svg.js';
import { P, F, defineCard, ladder, strip, laneY, WL, LAYOUT, FADE, OPACITY } from './workloads-kit.js';

// Design notes for this card: ./CARDS.md#workloads-pod-image-pull

// Layout C on the Workloads canon (WL): panel x<=397 y<=379 leaves no column under it, so the
// pipeline keeps the right band and the chips form a two-across bottom strip.

// Kubelet leads the row and is centred on CX, so the lane down to the Pod leaves its bottom
// midpoint. The Registry sits inside the cloud, which is why it is the narrower of the two.
const TOP1_X = 420, TOP1_W = 2 * (WL.CX - 420);          // 420..780, centred on CX
const TOP_GAP = 60;
const TOP2_X = TOP1_X + TOP1_W + TOP_GAP, TOP2_W = 260;  // 840..1100, inside the cloud
const TOP_CY = WL.TOP_Y + WL.BOX_H / 2;
const { out: REQ_Y, back: RESP_Y } = laneY(TOP_CY, WL.LANE_DY);
const WIRE_X = WL.CX;

// The cloud is one hand-drawn path whose own centre is (685, 85). It is placed by transform so
// it wraps the Registry instead of straddling both actor boxes.
const CLOUD_CX = 685, CLOUD_CY = 85, CLOUD_SCALE = 1.05;
const CLOUD_DX = (TOP2_X + TOP2_W / 2) - CLOUD_CX * CLOUD_SCALE;
const CLOUD_DY = TOP_CY - CLOUD_CY * CLOUD_SCALE;

// LAYOUT.C of the kit: the ladder takes the RIGHT column, because C has no free column at all.
const LAD_X = LAYOUT.C.ladder.x, LAD_W = LAYOUT.C.ladder.w;    // 660..1140, the pipeline
const LAD_Y = 176;                                       // 5 rows -> 176..376, clear of the cloud

// Chips two across, 532 wide (LAYOUT.C.strip.two): four across was 258 and every name ran into
// its own value. The strip spans WL.L..WL.R exactly, so the gap is fixed and the width derives.
const CHIP_COLS = 2, CHIP_GAP = 16, CHIP_VGAP = 8;
const CHIPS = strip({ from: WL.L, to: WL.R, count: CHIP_COLS, gap: CHIP_GAP });
const CHIPS_Y = 548;                                     // 2 rows -> 548..582 / 590..624
const CHIP_ROW = ladder({ y: CHIPS_Y, rowH: WL.CHIP_H, gap: CHIP_VGAP });
const CHIP_X = i => CHIPS.x(i % CHIP_COLS);
const CHIP_Y = i => CHIP_ROW(Math.floor(i / CHIP_COLS));

const NODE_Y = 396, NODE_H = 136;                        // 396..532, clear of the panel
const POD_W = 460, POD_X = WL.CX - 230;
const POD_H = 90, POD_Y = NODE_Y + 34;                   // 430..520
const CONT_W = 300, CONT_X = WL.CX - CONT_W / 2;
const CONT_H = 48, CONT_Y = POD_Y + 26;                  // 456..504

// The lane ends on the Pod it addresses, not on the Node frame edge above it.
const SPINE = [[WL.CX, WL.TOP_BOTTOM], [WL.CX, POD_Y]];

// The registry cloud is a free glyph: no part kind draws an arbitrary <path>, so it is the card's
// only P.raw. Attribute order is serialised (R3), so it stays exactly as written here.
const cloudGlyph = () => P.raw({
  key: 'cloud',
  make: () => path({
    d: 'M 555 80 Q 545 50, 580 50 Q 590 25, 630 30 Q 650 15, 690 25 Q 730 18, 750 35 Q 790 28, 810 60 Q 830 80, 815 105 Q 825 130, 790 138 Q 770 152, 730 142 Q 700 155, 670 145 Q 640 152, 610 142 Q 580 148, 565 125 Q 540 110, 555 80 Z',
    class: 'scheme-cloud',
    transform: `translate(${CLOUD_DX},${CLOUD_DY}) scale(${CLOUD_SCALE})`,
    fill: 'rgba(255,255,255,0.03)',
    stroke: 'var(--diag-stroke-soft)',
    'stroke-width': '1.2',
    'stroke-linejoin': 'round',
  }),
});

// The list order IS the append order, so it is the z-order: the Node frame is a 70% opaque fill, so
// the lane leg inside it and the ball that rides it follow it, and ladder / Pod / actors sit above.
export const SCENE = {
  'aria-label': 'Image pull policy and registry auth: Kubelet evaluates imagePullPolicy, resolves imagePullSecrets, checks the local layer store, pulls missing layers by digest',
  parts: [
    P.defs(),
    P.arrow({ x1: TOP1_X + TOP1_W, y1: REQ_Y, x2: TOP2_X, y2: REQ_Y, dim: true, dashed: true, role: 'cluster' }),
    P.arrow({ x1: TOP2_X, y1: RESP_Y, x2: TOP1_X + TOP1_W, y2: RESP_Y, dim: true, dashed: true, role: 'cluster' }),
    // WL.A-02: the top-row wire label sits ABOVE the actor row, never below it.
    P.wire({ key: 'req', x: WIRE_X, y: WL.TOP_Y - 12 }),
    P.chip({ key: 'imageChip', x: CHIP_X(0), y: CHIP_Y(0), w: CHIPS.w, h: WL.CHIP_H, name: 'image', value: 'app:v2' }),
    P.chip({ key: 'policyChip', x: CHIP_X(1), y: CHIP_Y(1), w: CHIPS.w, h: WL.CHIP_H, name: 'imagePullPolicy', value: 'pending' }),
    P.chip({ key: 'layersChip', x: CHIP_X(2), y: CHIP_Y(2), w: CHIPS.w, h: WL.CHIP_H, name: 'layers cached', value: 'not probed' }),
    P.chip({ key: 'statusChip', x: CHIP_X(3), y: CHIP_Y(3), w: CHIPS.w, h: WL.CHIP_H, name: 'container state', value: 'Waiting' }),
    P.node({ key: 'nodeEl', x: WL.L, y: NODE_Y, w: WL.W, h: NODE_H, label: 'Node-1' }),
    P.lane({ key: 'connector', points: SPINE, dim: true, dashed: true, role: 'cluster' }),
    P.packets(),
    // Everything below is appended AFTER the packet layer, so the ball runs under it.
    P.chain({
      key: 'chain', x: LAD_X, y: LAD_Y, w: LAD_W, rowH: WL.ROW_H, gap: WL.ROW_GAP, role: 'cluster',
      items: [
        '1. policy ·  Always | IfNotPresent | Never · default by tag',
        '2. auth   ·  imagePullSecrets · Pod + ServiceAccount',
        '3. cache  ·  CRI ImageStatus · digest hit on local store',
        '4. pull   ·  GET /v2/{repo}/blobs/<digest> · reuse cached layers',
        '5. start  ·  overlay rootfs · CreateContainer + Start',
      ],
    }),
    P.pod({
      key: 'podGroup', id: 'podGroup',
      x: POD_X, y: POD_Y, w: POD_W, h: POD_H, label: 'Pod', sublabel: '', containers: 0,
      // Born pending, exactly as the hand-written build() left it: the poster frame is `idle`.
      opacity: OPACITY.pending,
      inner: { dx: CONT_X - POD_X, dy: CONT_Y - POD_Y, w: CONT_W, h: CONT_H, label: 'app', sublabel: 'container' },
    }),
    cloudGlyph(),
    P.box({ key: 'registry', x: TOP2_X, y: WL.TOP_Y, w: TOP2_W, h: WL.BOX_H, label: 'Registry', sublabel: 'OCI Distribution · out-of-cluster', role: 'cluster' }),
    P.box({ key: 'kubelet', x: TOP1_X, y: WL.TOP_Y, w: TOP1_W, h: WL.BOX_H, label: 'Kubelet', sublabel: 'image puller', role: 'cluster' }),
  ],
  reset: {
    keys: ['kubelet', 'registry', 'cloud', 'imageChip', 'policyChip', 'layersChip', 'statusChip'],
    pods: ['podGroup'],
  },
};

// The four chips as FIELDS, so no step can state three of them and leave the fourth carrying the
// previous step's value. Key order is the order the old setChips helper wrote them in.
const chipRow = (image, policy, layers, status) =>
  ({ imageChip: image, policyChip: policy, layersChip: layers, statusChip: status });

// Values that recur across steps, named once so a four-key `chips` block stays one readable line.
const IMAGE = 'app:v2', IFNOTPRESENT = 'IfNotPresent', CREATING = 'Waiting · ContainerCreating';

export const STEPS_SPEC = [
  {
    id: 'idle',
    duration: 1500,
    chips: chipRow(IMAGE, 'not read yet', 'not probed', 'Waiting'),
    opacity: { podGroup: OPACITY.pending },
    chain: -1,
  },
  {
    id: 'policy',
    duration: 1900,
    narration: 'Kubelet reads spec.containers[0].imagePullPolicy. The default depends on the image reference: :latest defaults to Always (re-resolve the digest on every container start), while every other explicit tag (v2 here) or a pinned digest defaults to IfNotPresent (skip the pull when the image is already in the local store). The explicit value Never disables pulling entirely (the image must be preloaded out-of-band, otherwise the container fails with ErrImageNeverPull). Pull is per-container, not per-Pod.',
    chips: chipRow(IMAGE, IFNOTPRESENT, 'not probed', CREATING),
    wires: { req: 'imagePullPolicy=IfNotPresent (default for v2 tag)' },
    opacity: { podGroup: OPACITY.pending },
    // Policy resolution is a local Kubelet read, nothing travels: the resolved chips
    // and Kubelet take the static highlight only, no flash (info blocks do not pulse).
    lit: ['statusChip', 'kubelet', 'policyChip'],
    chain: 0,
  },
  {
    id: 'auth',
    duration: 1900,
    narration: 'For private registries Kubelet needs credentials. It walks two lists: Pod.spec.imagePullSecrets and the imagePullSecrets attached to the Pod ServiceAccount. Each Secret of type kubernetes.io/dockerconfigjson stores a base64-encoded docker config with per-registry auth tokens. Kubelet picks the matching entry and passes credentials to the runtime via the CRI PullImage request. For cloud-managed registries (ECR, GCR, ACR) a Kubelet image credential provider plugin can produce credentials dynamically instead. Public images skip this step.',
    chips: chipRow(IMAGE, IFNOTPRESENT, 'not probed', CREATING),
    wires: { req: 'authConfig from Pod + ServiceAccount imagePullSecrets' },
    opacity: { podGroup: OPACITY.pending },
    // Credential lookup happens inside the Kubelet, nothing travels: the Kubelet
    // takes the static highlight only, no flash (info blocks do not pulse).
    lit: ['kubelet'],
    chain: 1,
  },
  {
    id: 'cache',
    duration: 2300,
    narration: 'Kubelet asks the runtime via the CRI ImageStatus call whether this exact image is already present on this Node. The layer store it queries is content-addressable, keyed by sha256 digest and shared across every Pod on the Node. The app:v2 image is only partially cached: 2 of its 4 layers are already in the store (shared with other images). If the policy were Always, the remote manifest would still be fetched to resolve the current digest, and the actual blob pulls skipped when it matches the local digest.',
    chips: chipRow(IMAGE, IFNOTPRESENT, '2 of 4', CREATING),
    wires: { req: 'CRI ImageStatus · Digest probe · 2 of 4 cached' },
    opacity: { podGroup: OPACITY.pending },
    lit: ['kubelet', 'layersChip'],
    chain: 2,
    flow: [
      // Pod stays dim while the probe travels, then blinks when it reaches the node.
      F.route({ points: SPINE, name: 'probe' }),
      F.pulse({ pod: 'podGroup', dim: true, at: 'probe' }),
    ],
  },
  {
    id: 'pull',
    duration: 2400,
    narration: 'Kubelet has the runtime pull the 2 missing layers. The image manifest is fetched first, then for each missing layer a GET /v2/app/blobs/sha256:{digest} goes to the registry with the assembled Authorization header. Layers shared with previously-pulled images on this Node are reused from the store, so a partial cache hit shrinks the actual wire transfer. On error (404, auth fail, network timeout) the container goes Waiting with reason ErrImagePull, Kubelet retries on an exponential backoff (~10s, 20s, 40s, capped at 300s), surfaced as ImagePullBackOff after the first few failures.',
    chips: chipRow(IMAGE, IFNOTPRESENT, '4 of 4', CREATING),
    wires: { req: 'GET /v2/app/blobs/sha256:... · 200 · 2 new layers · 4 of 4 cached' },
    opacity: { podGroup: OPACITY.pending },
    lit: ['kubelet', 'cloud', 'layersChip'],
    chain: 3,
    flow: [
      // Blob GET reaches the registry, the 200 with the layers hops back after it lands. The
      // registry lights on the GET landing: it answers the request, it does not open the step.
      F.top({ from: TOP1_X + TOP1_W, to: TOP2_X, y: REQ_Y, name: 'get', lights: ['registry'] }),
      F.top({ from: TOP2_X, to: TOP1_X + TOP1_W, y: RESP_Y, after: 'get' }),
    ],
  },
  {
    id: 'start',
    duration: 2300,
    narration: 'All 4 layers are present in the layer store. The container rootfs is assembled as an overlay filesystem: each layer mounts read-only and one top read-write layer holds the writes the running container makes. The layer store is shared across containers, so a second Pod using the same image reuses the same lower layers (only the upper RW layer is per-container). Kubelet calls CreateContainer to bind the rootfs and configure namespaces, then StartContainer to exec PID 1.',
    chips: chipRow(IMAGE, IFNOTPRESENT, '4 of 4', 'Running'),
    wires: { req: 'overlay rootfs · CreateContainer · StartContainer' },
    // Container created and started: the whole Pod block lifts to full opacity.
    opacity: { podGroup: 1 },
    lit: ['kubelet', 'statusChip'],
    chain: 4,
    flow: [
      F.route({ points: SPINE, name: 'start' }),
      // Container created and started: the Pod lights up and pulses on arrival.
      F.fade({ target: 'podGroup', from: OPACITY.pending, to: 1, dur: FADE.in, at: 'start', fill: 'both', easing: 'ease-out' }),
      F.pulse({ pod: 'podGroup', at: 'start' }),
    ],
  },
];

export const init = defineCard(SCENE, STEPS_SPEC, { posterFirst: true });
