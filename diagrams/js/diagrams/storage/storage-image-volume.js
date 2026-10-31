import { P, F, defineCard, BEAT, chipStrip } from './storage-kit.js';
// Design notes for this card: ./CARDS/storage-image-volume.md


// Two frames: the Node right of the panel, the Registry left of it below the panel floor. The
// Registry is centred on the Node, so the pull crosses between their faces on one midline, and
// their outer faces sit 60 off each canvas edge.
const NODE_X = 440, NODE_W = 700;

// The catalog frame padding holds inside each frame: 34 of label band over the topmost content
// (in the Node, the `start app` tag riding over its lane) and 12 of floor under the lowest.
const NODE_Y = 148;
const HEAD = 34, FOOT = 12, REG_GAP = 24;

// The catalog block and Pod. Two columns inside the Node, one in the Registry.
const BLOCK_W = 232, BLOCK_H = 80, POD_H = 104;
const L_COL = 482, R_COL = 866;
const L_CX = L_COL + BLOCK_W / 2, R_CX = R_COL + BLOCK_W / 2;
const ROW_Y = 476;                                                        // store, volume
const ROW_MID = ROW_Y + BLOCK_H / 2;
const NODE_H = ROW_Y + BLOCK_H + FOOT - NODE_Y;
const TOP_MID = 248;                                                      // Kubelet and Pod
const KUB_Y = TOP_MID - BLOCK_H / 2, POD_Y = TOP_MID - POD_H / 2;

const REG_X = 60, REG_W = 272, REG_H = HEAD + 2 * BLOCK_H + REG_GAP + FOOT;
const FRAME_MID = NODE_Y + NODE_H / 2;
const REG_Y = FRAME_MID - REG_H / 2;
const REG_COL = REG_X + (REG_W - BLOCK_W) / 2;
const REG_TOP_Y = REG_Y + HEAD;                                           // app:v3 over llm:v1
const REG_LOW_Y = REG_TOP_Y + BLOCK_H + REG_GAP;

const CHIP_Y = 596;
const CH = chipStrip({ count: 3 });

// Each static wire and its ball share one array. Every lane is one way and ridden once.
const L_ASK   = [[L_CX, KUB_Y + BLOCK_H], [L_CX, ROW_Y]];                    // Kubelet -> store
// The pull is traffic between two places, so it runs face midpoint to face midpoint on the shared
// midline and touches no inner block: pullPolicy is a question of where the object already is.
const L_PULL  = [[REG_X + REG_W, FRAME_MID], [NODE_X, FRAME_MID]];            // Registry -> Node
const L_MOUNT = [[L_COL + BLOCK_W, ROW_MID], [R_COL, ROW_MID]];               // store -> volume
const L_START = [[L_COL + BLOCK_W, TOP_MID], [R_COL, TOP_MID]];               // Kubelet -> Pod
const L_READ  = [[R_CX, ROW_Y], [R_CX, POD_Y + POD_H]];                       // volume -> Pod

// Every tag shows from departure, 16 clear of its ball, measured from its own width (6 units a
// character), on the side where it meets no block text at either end.
const beside = (side, dy) => (text) => ({ text, dx: side * (16 + 3 * text.length), dy });
// The level legs: the tag trails, so it lands clear of the block the ball heads for.
const runTag = beside(-1, -18);
// The pull leads, so it leaves the Registry frame clear of app:v3.
const pullTag = beside(1, -14);
// The ask leads down out of Kubelet, the read trails up out of the volume, under the Pod.
const askTag = beside(1, 10), readTag = beside(-1, 16);

const lane = (key, points) => P.lane({ key, points, dashed: true, dim: true });

// Z-order: the two frames, the blocks and the Pod, the lanes and the mount caption, the chip
// strip, then the packet layer.
export const SCENE = {
  'aria-label': 'Image volumes: Pod llm-server runs app image app:v3 and declares an image volume named model with reference llm:v1 (an OCI image holding model weights) and pullPolicy IfNotPresent. At Pod startup, before any container starts, Kubelet asks the container runtime to resolve the volume. The image llm:v1 is not on the Node, so it is pulled from the registry the same way a container image is, with the same pull credentials. As Kubelet creates the app container, the runtime mounts the volume as one read-only directory at /models, and only then does the container start. The app reads the weights but cannot write them. A recreated Pod resolves the volume again, but under IfNotPresent a Node already holding llm:v1 skips the pull, unless that Node pulled the private image with other credentials.',
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
    keys: ['kubelet', 'store', 'vol', 'appImg', 'llmImg', 'onNode', 'appState', 'models'],
    pods: ['pod'],
  },
};

// STO.S-01 as one literal: nothing is born or removed mid-story, and every lane is at full.
const STAGE = { lAsk: 1, lPull: 1, lMount: 1, lStart: 1, lRead: 1 };
const STORE_OLD = { store: 'on disk: app:v3' }, STORE_NEW = { store: 'on disk: app:v3, llm:v1' };
const VOL_OLD = { vol: 'image volume, unresolved' }, VOL_RES = { vol: 'image volume, resolved' };
const VOL_NEW = { vol: 'image volume, read-only' };
const WAIT = { pod: 'waiting for volume' }, MOUNTED = { pod: 'volume mounted' }, RUN = { pod: 'Running' };
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
    narration: 'Pod llm-server declares an image volume named model, with reference llm:v1, pullPolicy IfNotPresent and mountPath /models. At Pod startup, before any container starts, Kubelet asks the container runtime to resolve that volume. The app image app:v3 is already on this Node.',
    chipsCued: { onNode: 'not present', appState: 'waiting', models: 'not mounted' },
    sublabels: { ...STORE_OLD, ...VOL_OLD },
    podSublabels: WAIT,
    wires: NO_WIRE,
    opacity: STAGE,
    lit: ['kubelet'],
    flow: [
      F.route({ points: L_ASK, delay: BEAT.lead, lights: ['store'], tag: askTag('resolve llm:v1') }),
    ],
  },
  {
    id: 'pull',
    duration: 3000,
    narration: 'The model image llm:v1 is not on disk, so under IfNotPresent it gets pulled. It comes from the registry the same way a container image does, with the same pull credentials. The weights live in their own image, not baked into app:v3.',
    chipsCued: { onNode: 'pulled', appState: 'waiting', models: 'not mounted' },
    sublabels: { ...STORE_NEW, ...VOL_RES },
    podSublabels: WAIT,
    wires: NO_WIRE,
    opacity: STAGE,
    lit: ['llmImg'],
    // Every value this step earns turns over when the ball that earns it lands (P-03). The volume
    // is resolved once the image is on disk.
    rewind: { sublabels: { ...STORE_OLD, ...VOL_OLD }, chips: { onNode: 'not present' } },
    flow: [
      F.route({ points: L_PULL, delay: BEAT.lead, name: 'pull', lights: ['store'], tag: pullTag('llm:v1') }),
      F.set({ sublabels: { ...STORE_NEW, ...VOL_RES }, chipsCued: { onNode: 'pulled' }, at: 'pull' }),
    ],
  },
  {
    id: 'mount',
    duration: 3000,
    narration: 'As Kubelet creates the app container, the runtime mounts the image as one directory at the mountPath, /models, always read-only. Which kinds of OCI object can be mounted this way is up to the runtime, but at least every image a container can run.',
    chipsCued: { onNode: 'pulled', appState: 'waiting', models: 'read-only' },
    sublabels: { ...STORE_NEW, ...VOL_NEW },
    podSublabels: MOUNTED,
    wires: WIRE,
    opacity: STAGE,
    lit: ['store'],
    rewind: { sublabels: VOL_RES, podSublabels: WAIT, chips: { models: 'not mounted' }, wires: NO_WIRE },
    flow: [
      F.route({ points: L_MOUNT, delay: BEAT.lead, name: 'mount', lights: ['vol'], tag: runTag('mount ro') }),
      F.set({ sublabels: VOL_NEW, podSublabels: MOUNTED, chipsCued: { models: 'read-only' }, wires: WIRE, at: 'mount' }),
    ],
  },
  {
    id: 'start',
    duration: 3400,
    narration: 'Only now does Kubelet start the app container, from its own image app:v3. Had resolving or pulling llm:v1 failed, the app container, which mounts that image, would wait while Kubelet retries with backoff, and the Pod would report why in its status.',
    chipsCued: { onNode: 'pulled', appState: 'running', models: 'read-only' },
    sublabels: { ...STORE_NEW, ...VOL_NEW },
    podSublabels: RUN,
    wires: WIRE,
    opacity: STAGE,
    lit: ['kubelet'],
    rewind: { podSublabels: MOUNTED, chips: { appState: 'waiting' } },
    flow: [
      // The Pod is the receiver and its pulse is the arrival cue: a `lights` on top of it would double
      // the cue and then stand as a highlight until the step ends.
      F.route({ points: L_START, delay: BEAT.lead, name: 'start', tag: runTag('start app'), pulse: 'pod' }),
      F.set({ podSublabels: RUN, chipsCued: { appState: 'running' }, at: 'start' }),
    ],
  },
  {
    id: 'read',
    duration: 3600,
    narration: 'The app reads the weights in /models but cannot write there. A recreated Pod resolves the volume again, but under IfNotPresent a Node holding llm:v1 skips the pull unless that Node pulled the private image with other credentials. New weights take a new tag or digest, or pullPolicy Always, and app:v3 needs no rebuild for them.',
    chipsCued: { onNode: 'pulled', appState: 'running', models: 'read-only' },
    sublabels: { ...STORE_NEW, ...VOL_NEW },
    podSublabels: RUN,
    wires: WIRE,
    opacity: STAGE,
    lit: ['vol'],
    flow: [
      F.route({ points: L_READ, delay: BEAT.lead, name: 'read', tag: readTag('weights'), pulse: 'pod' }),
    ],
  },
];

export const init = defineCard(SCENE, STEPS_SPEC, { posterFirst: true });
