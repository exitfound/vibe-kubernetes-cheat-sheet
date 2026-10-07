import { path } from '../../lib/svg.js';
import { P, F, defineCard, ladder, strip, laneY, WL, LAYOUT, FADE, OPACITY } from './workloads-kit.js';

// Design notes for this card: ./CARDS/workloads-image-pull-registry-auth.md

// Layout C: ladder in the right band, chips as a two-across bottom strip.

// The left actor is centred on CX so the spine leaves its bottom midpoint (WL.L-07).
const TOP1_W = 232, TOP1_X = WL.CX - TOP1_W / 2;
const TOP2_W = 232, TOP2_X = WL.R - TOP2_W;              // right edge on the chip strip
const TOP_CY = WL.TOP_Y + WL.BOX_H / 2;
const { out: REQ_Y, back: RESP_Y } = laneY(TOP_CY, WL.LANE_DY);
const WIRE_X = WL.CX;

// The cloud path's own centre, placed by transform so it wraps the Registry alone.
const CLOUD_CX = 685, CLOUD_CY = 85, CLOUD_SCALE = 1.05;
const CLOUD_DX = (TOP2_X + TOP2_W / 2) - CLOUD_CX * CLOUD_SCALE;
const CLOUD_DY = TOP_CY - CLOUD_CY * CLOUD_SCALE;

const LAD_X = LAYOUT.C.ladder.x, LAD_W = LAYOUT.C.ladder.w;
const LAD_Y = 176;                                       // clear of the cloud

// Two across: four across is too narrow for the name-value pairs.
const CHIP_COLS = 2, CHIP_GAP = 16, CHIP_VGAP = 8;
const CHIPS = strip({ from: WL.L, to: WL.R, count: CHIP_COLS, gap: CHIP_GAP });
const CHIPS_Y = 548;
const CHIP_ROW = ladder({ y: CHIPS_Y, rowH: WL.CHIP_H, gap: CHIP_VGAP });
const CHIP_X = i => CHIPS.x(i % CHIP_COLS);
const CHIP_Y = i => CHIP_ROW(Math.floor(i / CHIP_COLS));

const NODE_Y = 396, NODE_H = 136;                        // clear of the panel
const POD_W = 460, POD_X = WL.CX - 230;
const POD_H = 90, POD_Y = NODE_Y + 34;
const CONT_W = 300, CONT_X = WL.CX - CONT_W / 2;
const CONT_H = 48, CONT_Y = POD_Y + 26;

// WL.A-03: the lane ends on the Node frame face midpoint, never on a Pod inside it.
const SPINE = [[WL.CX, WL.TOP_BOTTOM], [WL.CX, NODE_Y]];

// No part kind draws an arbitrary <path>. Attribute order is serialised (R3): keep it as written.
const cloudGlyph = () => P.raw({
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

// List order is z-order: the Node frame fill is 70% opaque, so the lane and the ball come after it.
export const SCENE = {
  'aria-label': 'Image pull policy and registry auth: Kubelet evaluates imagePullPolicy, resolves imagePullSecrets, asks the runtime whether the image is already on the Node, pulls missing layers by digest, then creates and starts the container',
  parts: [
    P.defs(),
    P.arrow({ x1: TOP1_X + TOP1_W, y1: REQ_Y, x2: TOP2_X, y2: REQ_Y, dim: true, dashed: true, role: 'cluster' }),
    P.arrow({ x1: TOP2_X, y1: RESP_Y, x2: TOP1_X + TOP1_W, y2: RESP_Y, dim: true, dashed: true, role: 'cluster' }),
    // WL.A-02: the wire label sits above the actor row.
    P.wire({ key: 'req', x: WIRE_X, y: WL.TOP_Y - 12 }),
    P.chip({ key: 'imageChip', x: CHIP_X(0), y: CHIP_Y(0), w: CHIPS.w, h: WL.CHIP_H, name: 'image', value: 'app:v2' }),
    P.chip({ key: 'policyChip', x: CHIP_X(1), y: CHIP_Y(1), w: CHIPS.w, h: WL.CHIP_H, name: 'imagePullPolicy', value: 'not read yet' }),
    P.chip({ key: 'layersChip', x: CHIP_X(2), y: CHIP_Y(2), w: CHIPS.w, h: WL.CHIP_H, name: 'layers cached', value: 'not probed' }),
    P.chip({ key: 'statusChip', x: CHIP_X(3), y: CHIP_Y(3), w: CHIPS.w, h: WL.CHIP_H, name: 'container state', value: 'Waiting' }),
    P.node({ key: 'nodeEl', x: WL.L, y: NODE_Y, w: WL.W, h: NODE_H, label: 'Node-1' }),
    P.lane({ key: 'connector', points: SPINE, dim: true, dashed: true, role: 'cluster' }),
    P.packets(),
    P.chain({
      key: 'chain', x: LAD_X, y: LAD_Y, w: LAD_W, rowH: WL.ROW_H, gap: WL.ROW_GAP, role: 'cluster',
      items: [
        '1. policy ·  Always | IfNotPresent | Never · default by tag',
        '2. auth   ·  imagePullSecrets · Pod spec, or its ServiceAccount',
        '3. cache  ·  CRI ImageStatus · is this image on the Node',
        '4. pull   ·  GET /v2/{repo}/blobs/<digest> · reuse cached layers',
        '5. start  ·  overlay rootfs · CreateContainer + Start',
      ],
    }),
    P.pod({
      key: 'podGroup', id: 'podGroup',
      x: POD_X, y: POD_Y, w: POD_W, h: POD_H, label: 'Pod', sublabel: '', containers: 0,
      opacity: OPACITY.pending,
      inner: { dx: CONT_X - POD_X, dy: CONT_Y - POD_Y, w: CONT_W, h: CONT_H, label: 'app', sublabel: 'container' },
    }),
    cloudGlyph(),
    P.box({ key: 'registry', x: TOP2_X, y: WL.TOP_Y, w: TOP2_W, h: WL.BOX_H, label: 'Registry', sublabel: 'OCI Distribution · out-of-cluster', role: 'cluster' }),
    P.box({ key: 'kubelet', x: TOP1_X, y: WL.TOP_Y, w: TOP1_W, h: WL.BOX_H, label: 'Kubelet', sublabel: 'image puller', role: 'cluster' }),
  ],
  reset: {
    keys: ['kubelet', 'registry', 'nodeEl', 'imageChip', 'policyChip', 'layersChip', 'statusChip'],
    pods: ['podGroup'],
  },
};

// All four chips at once, so no step leaves one carrying the previous value.
const chipRow = (image, policy, layers, status) =>
  ({ imageChip: image, policyChip: policy, layersChip: layers, statusChip: status });

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
    duration: 4100,
    narration: 'Kubelet reads spec.containers[0].imagePullPolicy. Left unset, the default follows the image reference: :latest or no tag at all gives Always, which re-resolves the digest on every container start, and any other tag (v2 here) or a pinned digest gives IfNotPresent. The explicit value Never disables pulling, so the image has to be preloaded on the Node or the container fails with ErrImageNeverPull. Pull is per-container, not per-Pod.',
    chips: chipRow(IMAGE, IFNOTPRESENT, 'not probed', CREATING),
    wires: { req: 'imagePullPolicy=IfNotPresent (default for v2 tag)' },
    opacity: { podGroup: OPACITY.pending },
    // A local Kubelet read: nothing travels, static highlight only.
    lit: ['statusChip', 'kubelet', 'policyChip'],
    chain: 0,
  },
  {
    id: 'auth',
    duration: 4000,
    narration: 'A private registry needs credentials, so Kubelet reads Pod.spec.imagePullSecrets, which the ServiceAccount admission plugin fills from the Pod ServiceAccount when the Pod names none of its own. Each Secret of type kubernetes.io/dockerconfigjson holds a docker config, and Kubelet hands a matching entry to the runtime in the CRI PullImage request. For ECR, GCR or ACR a credential provider plugin can mint credentials instead.',
    chips: chipRow(IMAGE, IFNOTPRESENT, 'not probed', CREATING),
    wires: { req: 'authConfig from Pod.spec.imagePullSecrets' },
    opacity: { podGroup: OPACITY.pending },
    // Inside the Kubelet: nothing travels, static highlight only.
    lit: ['kubelet'],
    chain: 1,
  },
  {
    id: 'cache',
    duration: 3500,
    narration: 'Kubelet asks the runtime, through the CRI ImageStatus call, whether this exact image is already on the Node. The layer store behind it is content-addressable, keyed by sha256 digest and shared by every Pod on the Node. The app:v2 image is only partly there: 2 of its 4 layers went into the store with earlier images, so ImageStatus reports no image and the pull goes ahead.',
    chips: chipRow(IMAGE, IFNOTPRESENT, '2 of 4', CREATING),
    wires: { req: 'CRI ImageStatus · no image · the pull goes ahead' },
    opacity: { podGroup: OPACITY.pending },
    lit: ['kubelet', 'layersChip'],
    chain: 2,
    // The count waits for the probe to land (P-03).
    rewind: { chips: { layersChip: 'not probed' } },
    // The probe is for this Pod, so the pending Pod blinks dim on arrival.
    flow: [
      F.route({ points: SPINE, name: 'probe', pulse: { pod: 'podGroup', dim: true } }),
      F.set({ at: 'probe', chips: { layersChip: '2 of 4' } }),
    ],
  },
  {
    id: 'pull',
    duration: 4100,
    narration: 'The runtime fetches the manifest first, then issues GET /v2/app/blobs/sha256:{digest} for each of the 2 missing layers, carrying the assembled Authorization header. The 2 layers already in the store are reused, so a partial cache hit shrinks the wire transfer. On error the container goes Waiting with reason ErrImagePull and Kubelet retries on an exponential backoff (10s, 20s, 40s, capped at 300s), which surfaces as ImagePullBackOff.',
    chips: chipRow(IMAGE, IFNOTPRESENT, '4 of 4', CREATING),
    wires: { req: 'GET /v2/app/blobs/sha256:... · 200 · 2 new layers' },
    opacity: { podGroup: OPACITY.pending },
    lit: ['kubelet', 'layersChip'],
    chain: 3,
    // The count waits for the 200 with the layers.
    rewind: { chips: { layersChip: '2 of 4' } },
    flow: [
      // The registry lights on the GET landing: it answers, it does not open the step.
      F.top({ from: TOP1_X + TOP1_W, to: TOP2_X, y: REQ_Y, name: 'get', lights: ['registry'] }),
      F.top({ from: TOP2_X, to: TOP1_X + TOP1_W, y: RESP_Y, after: 'get', name: 'layers' }),
      F.set({ at: 'layers', chips: { layersChip: '4 of 4' } }),
    ],
  },
  {
    id: 'start',
    duration: 4150,
    narration: 'All 4 layers are in the store. With the default overlayfs snapshotter the container rootfs is an overlay filesystem: every layer mounts read-only under one top read-write layer that takes whatever the container writes outside its volumes. Only that upper layer is per-container, so a second Pod on the same image shares the lower ones. Kubelet then calls CreateContainer to bind that rootfs and the mounts, and StartContainer to exec PID 1.',
    chips: chipRow(IMAGE, IFNOTPRESENT, '4 of 4', 'Running'),
    wires: { req: 'overlay rootfs · CreateContainer · StartContainer' },
    opacity: { podGroup: 1 },
    lit: ['kubelet', 'statusChip'],
    chain: 4,
    // Running is earned when StartContainer lands, not at step entry.
    rewind: { chips: { statusChip: CREATING } },
    flow: [
      F.route({ points: SPINE, name: 'start' }),
      F.set({ at: 'start', chips: { statusChip: 'Running' } }),
      F.fade({ target: 'podGroup', from: OPACITY.pending, to: 1, dur: FADE.in, at: 'start', fill: 'both', easing: 'ease-out' }),
      F.pulse({ pod: 'podGroup', at: 'start' }),
    ],
  },
];

export const init = defineCard(SCENE, STEPS_SPEC, { posterFirst: true });
