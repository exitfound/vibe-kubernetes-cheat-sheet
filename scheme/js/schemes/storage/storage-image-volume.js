import { P, F, defineCard, BEAT, makeRidingLabel, chipStrip } from './storage-kit.js';
// Design notes for this card: ./CARDS/storage-image-volume.md


// Two frames: the Node right of the panel (x<=397), the Registry left of it, below the panel floor.
// Panel extent measured per viewport in the record. The Registry is CENTRED on the Node, so the two
// frames share one midline and the pull crosses between their faces on it. Their outer faces sit 60
// off each canvas edge, so the whole drawing spans 60..1140 and centres on 600.
const NODE_X = 440, NODE_Y = 150, NODE_W = 700, NODE_H = 430;              // 440..1140, 150..580
const REG_X = 60, REG_W = 272, REG_H = 254;                                // 60..332
const FRAME_MID = NODE_Y + NODE_H / 2;                                     // 365: both frame faces
const REG_Y = FRAME_MID - REG_H / 2;                                       // 238: 238..492

// The catalog block: 232 by 80, a Pod 232 by 104. Two columns inside the Node, one in the Registry.
// ONE PADDING, 24, holds inside EACH frame: from its floor up to its bottom row, and from the band
// its node() label occupies down to its top row. The Node columns sit 42 off each frame face.
const BLOCK_W = 232, BLOCK_H = 80, POD_H = 104;
const PAD = 24;
const L_COL = 482, R_COL = 866, REG_COL = REG_X + (REG_W - BLOCK_W) / 2;  // 482 / 866 / 80
const L_CX = L_COL + BLOCK_W / 2, R_CX = R_COL + BLOCK_W / 2;             // 598 / 982
const ROW_Y = NODE_Y + NODE_H - PAD - BLOCK_H;                            // 476: store, volume
const ROW_MID = ROW_Y + BLOCK_H / 2;                                      // 516
const REG_LOW_Y = REG_Y + REG_H - PAD - BLOCK_H;                          // 388: llm:v1
const REG_TOP_Y = REG_LOW_Y - PAD - BLOCK_H;                              // 284: app:v3 over llm:v1
const TOP_MID = 248;                                                      // Kubelet and Pod
const KUB_Y = TOP_MID - BLOCK_H / 2, POD_Y = TOP_MID - POD_H / 2;         // 208, 196

const CHIP_Y = 596;
const CH = chipStrip({ count: 3 });

// Each static wire and its ball share one array. Every lane is one way and ridden once.
const L_ASK   = [[L_CX, KUB_Y + BLOCK_H], [L_CX, ROW_Y]];                    // Kubelet -> store
// The pull is traffic between two PLACES, so it runs face midpoint to face midpoint on the shared
// midline and touches no inner block at either end: pullPolicy is a question of WHERE the object
// already is, the registry or the host.
const L_PULL  = [[REG_X + REG_W, FRAME_MID], [NODE_X, FRAME_MID]];            // Registry -> Node
const L_MOUNT = [[L_COL + BLOCK_W, ROW_MID], [R_COL, ROW_MID]];               // store -> volume
const L_START = [[L_COL + BLOCK_W, TOP_MID], [R_COL, TOP_MID]];               // Kubelet -> Pod
const L_READ  = [[R_CX, ROW_Y], [R_CX, POD_Y + POD_H]];                       // volume -> Pod

// EVERY ball rides routeDur, as on storage-emptydir. All five legs are 108 to 188 units, under the
// 315 routeDur needs, so every one lands on the 700ms PKT_DUR_MIN floor and one leg is one beat
// wherever it is on the card.
const tagFn = makeRidingLabel({ role: 'storage', inMs: 200, outMs: 200, hold: 0 });
// The level legs carry their tag above the ball and above the box tops at both ends, so it rides
// the whole leg and dissolves with its ball on arrival (M-30a).
const RUN_TAG = { dy: -48, fn: tagFn };
// The two vertical legs end head-on in a block edge, so each tag TRAILS its ball on the side away
// from the block it heads for and lands in the gap. Trailing, it would start inside the block the
// ball leaves, so it emerges once clear of that face: 170 of the 700ms leg is the 360 of 1500 this
// card measured, carried across to the new duration at the same fraction of the flight.
const EMERGE = { fn: makeRidingLabel({ role: 'storage', inMs: 200, outMs: 200, hold: 0, emergeMode: true }), emerge: 170 };
const ASK_TAG = { ...EMERGE, dx: 52, dy: -14 }, READ_TAG = { ...EMERGE, dx: -40, dy: 20 };
// The pull leg has no box top at either end, only frame faces, so its tag takes the storage-emptydir
// grammar instead of emerging: it rides the whole flight, 16 AHEAD of the ball so its box clears
// app:v3 at departure, and fades in before the ball leaves rather than out of the Registry.
const PULL_TAG = { dx: 16, dy: -48, fn: tagFn };

const lane = (key, points) => P.lane({ key, points, dashed: true, dim: true });

// Z-order (bottom -> top): the two frames, the blocks and the Pod, the lanes and the mount caption,
// the chip strip, then the packet layer.
export const SCENE = {
  'aria-label': 'Image volumes: Pod llm-server runs app image app:v3 and declares an image volume named model with reference llm:v1, an OCI image holding model weights, and pullPolicy IfNotPresent. At Pod startup Kubelet asks the container runtime to resolve the volume, before any container starts. llm:v1 is not on the Node, so it is pulled from the registry the same way a container image is, with the same pull credentials. As Kubelet creates the app container, the runtime mounts it as one read-only directory at /models, and only then does the container start. The app reads the weights but cannot write them. A recreated Pod resolves the volume again, but under IfNotPresent a Node already holding llm:v1 does not pull it again.',
  parts: [
    P.defs(),
    P.node({ x: NODE_X, y: NODE_Y, w: NODE_W, h: NODE_H, label: 'Node' }),
    P.node({ x: REG_X, y: REG_Y, w: REG_W, h: REG_H, label: 'Registry' }),
    P.box({ key: 'kubelet', x: L_COL, y: KUB_Y, w: BLOCK_W, h: BLOCK_H, label: 'Kubelet', sublabel: 'resolves volumes first' }),
    P.pod({
      key: 'pod', innerKey: 'appBox', x: R_COL, y: POD_Y, w: BLOCK_W, h: POD_H,
      label: 'Pod llm-server', sublabel: 'waiting for volume', containers: 0,
      inner: { dx: 20, dy: 34, w: BLOCK_W - 40, h: 44, label: 'app', sublabel: 'image app:v3' },
    }),
    P.box({ key: 'store', x: L_COL, y: ROW_Y, w: BLOCK_W, h: BLOCK_H, label: 'Container runtime', sublabel: 'on disk: app:v3' }),
    P.box({ key: 'vol', x: R_COL, y: ROW_Y, w: BLOCK_W, h: BLOCK_H, label: 'Volume model', sublabel: 'image volume, unresolved' }),
    P.box({ key: 'appImg', x: REG_COL, y: REG_TOP_Y, w: BLOCK_W, h: BLOCK_H, label: 'app:v3', sublabel: 'app image, no model' }),
    P.box({ key: 'llmImg', x: REG_COL, y: REG_LOW_Y, w: BLOCK_W, h: BLOCK_H, label: 'llm:v1', sublabel: 'OCI image, model weights' }),
    lane('lAsk', L_ASK),
    lane('lPull', L_PULL),
    lane('lMount', L_MOUNT),
    lane('lStart', L_START),
    lane('lRead', L_READ),
    P.wire({ key: 'mountAt', x: R_CX + 14, y: (ROW_Y + POD_Y + POD_H) / 2 + 4, anchor: 'start' }),
    P.chip({ key: 'onNode', x: CH.x(0), y: CHIP_Y, w: CH.w, h: 34, name: 'llm:v1 on Node', value: 'not present' }),
    P.chip({ key: 'appState', x: CH.x(1), y: CHIP_Y, w: CH.w, h: 34, name: 'app container', value: 'waiting' }),
    P.chip({ key: 'models', x: CH.x(2), y: CHIP_Y, w: CH.w, h: 34, name: '/models', value: 'not mounted' }),
    P.packets(),
  ],
  reset: {
    keys: ['kubelet', 'store', 'vol', 'appImg', 'llmImg', 'appBox', 'onNode', 'appState', 'models'],
    pods: ['pod'],
  },
};

// STO.S-01 as one literal: nothing is born or removed mid-story, and every lane is at full.
const STAGE = { lAsk: 1, lPull: 1, lMount: 1, lStart: 1, lRead: 1 };
const STORE_OLD = { store: 'on disk: app:v3' }, STORE_NEW = { store: 'on disk: app:v3, llm:v1' };
const VOL_OLD = { vol: 'image volume, unresolved' }, VOL_NEW = { vol: 'image volume, read-only' };
const WAIT = { pod: 'waiting for volume' }, RUN = { pod: 'Running' };
const NO_WIRE = { mountAt: '' }, WIRE = { mountAt: '/models, read-only' };

export const STEPS_SPEC = [
  {
    id: 'idle',
    duration: 1500,
    chipsCued: { onNode: 'not present', appState: 'waiting', models: 'not mounted' },
    sublabels: { ...STORE_OLD, ...VOL_OLD },
    podSublabels: WAIT,
    wires: NO_WIRE,
    opacity: STAGE,
  },
  {
    id: 'resolve',
    duration: 3000,
    narration: 'Pod llm-server declares an image volume named model: reference llm:v1, pullPolicy IfNotPresent, mounted at /models. At Pod startup Kubelet asks the container runtime to resolve it, before any container starts. The app image app:v3 is already on this Node.',
    chipsCued: { onNode: 'not present', appState: 'waiting', models: 'not mounted' },
    sublabels: { ...STORE_OLD, ...VOL_OLD },
    podSublabels: WAIT,
    wires: NO_WIRE,
    opacity: STAGE,
    lit: ['kubelet'],
    flow: [
      F.route({ points: L_ASK, delay: BEAT.lead, lights: ['store'] }),
      F.tag({ text: 'resolve llm:v1', points: L_ASK, delay: BEAT.lead, ...ASK_TAG }),
    ],
  },
  {
    id: 'pull',
    duration: 3000,
    narration: 'The model image llm:v1 is not on disk, so IfNotPresent pulls it. It comes from the registry the same way a container image does, with the same pull credentials. The weights ship as their own image, not baked into app:v3.',
    chipsCued: { onNode: 'pulled', appState: 'waiting', models: 'not mounted' },
    sublabels: { ...STORE_NEW, ...VOL_OLD },
    podSublabels: WAIT,
    wires: NO_WIRE,
    opacity: STAGE,
    lit: ['llmImg'],
    // Every value this step earns turns over when the ball that earns it lands (P-03).
    rewind: { sublabels: STORE_OLD, chips: { onNode: 'not present' } },
    flow: [
      F.route({ points: L_PULL, delay: BEAT.lead, name: 'pull', lights: ['store'] }),
      F.tag({ text: 'llm:v1', points: L_PULL, delay: BEAT.lead, ...PULL_TAG }),
      F.set({ sublabels: STORE_NEW, chipsCued: { onNode: 'pulled' }, at: 'pull' }),
    ],
  },
  {
    id: 'mount',
    duration: 3000,
    narration: 'As Kubelet creates the app container, the runtime mounts the image as one directory at the mountPath, /models, always read-only. Which kinds of OCI object it can mount is up to the runtime, but at least every image a container can run.',
    chipsCued: { onNode: 'pulled', appState: 'waiting', models: 'read-only' },
    sublabels: { ...STORE_NEW, ...VOL_NEW },
    podSublabels: WAIT,
    wires: WIRE,
    opacity: STAGE,
    lit: ['store'],
    rewind: { sublabels: VOL_OLD, chips: { models: 'not mounted' }, wires: NO_WIRE },
    flow: [
      F.route({ points: L_MOUNT, delay: BEAT.lead, name: 'mount', lights: ['vol'] }),
      F.tag({ text: 'mount ro', points: L_MOUNT, delay: BEAT.lead, ...RUN_TAG }),
      F.set({ sublabels: VOL_NEW, chipsCued: { models: 'read-only' }, wires: WIRE, at: 'mount' }),
    ],
  },
  {
    id: 'start',
    duration: 3400,
    narration: 'Only now does Kubelet start the app container, from its own image app:v3. Had resolving or pulling llm:v1 failed, the app container, which mounts it, would not start, and the Pod would report why in its status.',
    chipsCued: { onNode: 'pulled', appState: 'running', models: 'read-only' },
    sublabels: { ...STORE_NEW, ...VOL_NEW },
    podSublabels: RUN,
    wires: WIRE,
    opacity: STAGE,
    lit: ['kubelet'],
    rewind: { podSublabels: WAIT, chips: { appState: 'waiting' } },
    flow: [
      // The Pod is the receiver and its pulse IS the arrival cue: pulsePod brightens every rect
      // inside the shell, app box included, so a `lights` on top of it would double the cue and
      // then stand as a highlight until the step ends.
      F.route({ points: L_START, delay: BEAT.lead, name: 'start' }),
      F.tag({ text: 'start app', points: L_START, delay: BEAT.lead, ...RUN_TAG, dy: -56 }),
      F.pulse({ pod: 'pod', at: 'start' }),
      F.set({ podSublabels: RUN, chipsCued: { appState: 'running' }, at: 'start' }),
    ],
  },
  {
    id: 'read',
    duration: 3600,
    narration: 'The app reads the weights under /models but cannot write there. Recreating the Pod resolves the volume again, but under IfNotPresent a Node already holding llm:v1 does not pull it again: new weights need a new tag or pullPolicy Always, and app:v3 is never rebuilt for them.',
    chipsCued: { onNode: 'pulled', appState: 'running', models: 'read-only' },
    sublabels: { ...STORE_NEW, ...VOL_NEW },
    podSublabels: RUN,
    wires: WIRE,
    opacity: STAGE,
    lit: ['vol'],
    flow: [
      F.route({ points: L_READ, delay: BEAT.lead, name: 'read' }),
      F.tag({ text: 'weights', points: L_READ, delay: BEAT.lead, ...READ_TAG }),
      F.pulse({ pod: 'pod', at: 'read' }),
    ],
  },
];

export const init = defineCard(SCENE, STEPS_SPEC, { posterFirst: true });
