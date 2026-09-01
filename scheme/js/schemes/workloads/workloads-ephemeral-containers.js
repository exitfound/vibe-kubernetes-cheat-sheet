import { P, F, defineCard, ladder, midX, WL, LAYOUT, FADE, OPACITY } from './workloads-kit.js';
import { box } from '../../lib/primitives.js';

// Design notes for this card: ./CARDS/workloads-ephemeral-containers.md

// Layout A of the Workloads canon (WL): the field contract left, state chips right, Node on the
// floor. Panel worst case x<=396.55, y<=254.66 at 1100x800 on step 2, and a longer narration
// invalidates that measurement. 256 is that bottom rounded up to a whole unit.
const PANEL_B = 256, PANEL_GAP = 20;
const BAND_Y = PANEL_B + PANEL_GAP;                      // 276, the caption baseline

// The API sits on CX so the write descends one straight spine, which puts kubectl to its RIGHT:
// the reversal workloads-pod-resize makes, for the WL.L-07 reason it makes it.
const BOX_W = 232;
const API_X = WL.CX - BOX_W / 2, API_R = API_X + BOX_W;  // 484..716
const TOP_GAP = 56;
const KUBECTL_X = API_R + TOP_GAP;                       // 772..1004
const TOP_CY = WL.TOP_Y + WL.BOX_H / 2;                  // 80
const WIRE_X = midX(API_R, KUBECTL_X);                   // 744
const WIRE_Y = WL.TOP_Y - 12;                            // 28, the WL.A-02 line

// The corridor label hangs off the SIDE of the spine, in the empty band between the actor row and
// the two columns: centred on the spine it would sit on the lane it names.
const SPINE_WIRE_Y = 146, SPINE_WIRE_DX = 14;

// LAYOUT.A of the kit: the contract in the LEFT column, the state chips in the RIGHT.
// WL.L-06 picks A / B / C against THIS card's measured panel bottom.
const FLD_X = LAYOUT.A.ladder.x, FLD_W = LAYOUT.A.ladder.w;    // 60..540
const FLD_Y = BAND_Y + 8;                                // 284, one caption clear of BAND_Y
// 28 and 8 rather than the WL.ROW_H 32 and WL.ROW_GAP 10 every pipeline here takes: five rows on
// the house numbers is 200 tall against the 192 this card's caption leaves above the Node frame.
const FLD_ROW_H = 28, FLD_GAP = 8;                       // 5 rows -> 284..456
const CHIP_X = LAYOUT.A.chips.x, CHIP_W = LAYOUT.A.chips.w;    // 660..1140
const CHIP_GAP = 8;
const CHIP_Y = ladder({ y: FLD_Y, rowH: WL.CHIP_H, gap: CHIP_GAP });   // 284..444

const NODE_Y = 496, NODE_H = 128;                        // 496..624
const POD_W = 500, POD_H = 96, POD_X = WL.CX - POD_W / 2;      // 350..850
const POD_Y = NODE_Y + 22;                               // 518..614
// Two peer container boxes on one row, so the Pod carries the same 24 of air on both flanks and
// the pair reads as one list rather than as a box with a satellite.
const CONT_W = 210, CONT_H = 52, CONT_PAD = 24, CONT_DY = 30;
const APP_DX = CONT_PAD;                                 // 374..584
const DBG_DX = POD_W - CONT_PAD - CONT_W;                // 616..826

// kubectl writes to the API and nothing answers on this card, so the top row carries ONE lane and
// no WL.A-01 pair. The same array feeds the drawn arrow and the ball (WL.S-01).
const REQ_LANE = [[KUBECTL_X, TOP_CY], [API_R, TOP_CY]];
// One corridor, downward only, ending on the Node FRAME face midpoint rather than on the Pod
// inside it (WL.A-03). The frame is full width, so its top midpoint is WL.SPINE_X already.
const SPINE = [[WL.SPINE_X, WL.TOP_BOTTOM], [WL.SPINE_X, NODE_Y]];

// The EphemeralContainer field contract, four refusals and the one field the last step needs.
// The padding aligns the SOURCE only: SVG collapses a run of spaces, so the rendered rows read
// `field · verdict` ragged, the same way every chain in this category renders.
const FIELDS = [
  'ports                          ·  disallowed',
  'livenessProbe · readinessProbe ·  disallowed',
  'resources                      ·  disallowed',
  'restartPolicy                  ·  disallowed',
  'targetContainerName            ·  allowed',
];
const REFUSED = [0, 1, 2, 3];

// What the second container box says about itself before and after the subresource write.
const ABSENT = 'not in the spec yet', PRESENT = 'ephemeral container';

// The API box names the subresource the step is actually addressing, and it is not the same one on
// every step. Step 1 is a kubectl exec, which goes to pods/exec: leaving the box on
// pods/ephemeralcontainers there drew the failing attempt arriving at the one door this card says
// it can never reach, and the ball lands on that face.
const SUB_EXEC = 'pods/exec', SUB_EPHEM = 'pods/ephemeralcontainers';

// The list order IS the append order, so it is the z-order: the two lanes and the chip column
// first, then the packet layer, and caption / contract / Node / Pod / actor row above the ball.
export const SCENE = {
  'aria-label': 'Ephemeral containers: kubectl debug patches the ephemeralcontainers subresource of a Pod that is already running, and the container it adds carries no ports, no probes, no resources and no restart guarantee',
  parts: [
    P.defs(),
    P.arrow({ key: 'reqLane', from: REQ_LANE[0], to: REQ_LANE[1], dim: true, dashed: true, role: 'cluster' }),
    P.lane({ key: 'spineLane', points: SPINE, dim: true, dashed: true, role: 'cluster' }),
    // The object as the API holds it: the immutable list, the appendable one, the status array
    // that answers for it, and the counter that proves the app container was left alone.
    P.chip({ key: 'containersChip', x: CHIP_X, y: CHIP_Y(0), w: CHIP_W, h: WL.CHIP_H, name: 'spec.containers', value: '1 · app' }),
    P.chip({ key: 'ephemChip', x: CHIP_X, y: CHIP_Y(1), w: CHIP_W, h: WL.CHIP_H, name: 'spec.ephemeralContainers', value: 'empty' }),
    P.chip({ key: 'statusChip', x: CHIP_X, y: CHIP_Y(2), w: CHIP_W, h: WL.CHIP_H, name: 'ephemeralContainerStatuses', value: 'none' }),
    P.chip({ key: 'restartChip', x: CHIP_X, y: CHIP_Y(3), w: CHIP_W, h: WL.CHIP_H, name: 'app restartCount', value: '0' }),
    P.packets(),
    // Everything below is appended AFTER the packet layer, so the ball runs under it.
    // A standing caption, not a per-step wire: the column below is one API object on every step,
    // and naming it is what stops it reading as a pipeline of stages.
    P.tag({ x: FLD_X, y: BAND_Y, anchor: 'start', text: 'EphemeralContainer fields' }),
    P.chain({ key: 'chain', x: FLD_X, y: FLD_Y, w: FLD_W, rowH: FLD_ROW_H, gap: FLD_GAP, role: 'cluster', items: FIELDS }),
    P.node({ key: 'nodeEl', x: WL.L, y: NODE_Y, w: WL.W, h: NODE_H, label: 'Node-1' }),
    P.pod({
      key: 'podGroup', id: 'podGroup', innerKey: 'appBox',
      // No Pod sublabel: pod() prints one at h - 8, whose ink runs 596.2..608.5 at 1100x800 and
      // crosses the bottom edge of both container boxes at 600. Both neighbours in this section
      // pass an empty string for the same reason.
      x: POD_X, y: POD_Y, w: POD_W, h: POD_H, label: 'Pod', sublabel: '', containers: 0,
      inner: { dx: APP_DX, dy: CONT_DY, w: CONT_W, h: CONT_H, label: 'app', sublabel: 'distroless · no shell' },
      // buildPod carries ONE inner box. The debug container is a peer of it and has to sit INSIDE
      // the shell, because pulsePod reaches only what the Pod group contains. box() defaults its
      // role to the empty string, so the kit binding is written out by hand here.
      // C-14: the slot is DIM before the container exists, never cut out, and the sublabel says so.
      tune: (el, refs) => {
        refs.debugBox = box({
          x: POD_X + DBG_DX, y: POD_Y + CONT_DY, w: CONT_W, h: CONT_H,
          label: 'debugger-8xzrl', sublabel: ABSENT, role: 'workloads',
        });
        refs.debugBox.style.opacity = String(OPACITY.terminated);
        el.appendChild(refs.debugBox);
      },
    }),
    P.box({ key: 'apiEl', x: API_X, y: WL.TOP_Y, w: BOX_W, h: WL.BOX_H, label: 'API', sublabel: SUB_EPHEM, role: 'cluster' }),
    P.box({ key: 'kubectlEl', x: KUBECTL_X, y: WL.TOP_Y, w: BOX_W, h: WL.BOX_H, label: 'kubectl', sublabel: 'debug -it --target app', role: 'cluster' }),
    P.wire({ key: 'top', x: WIRE_X, y: WIRE_Y }),
    P.wire({ key: 'spine', x: WL.SPINE_X + SPINE_WIRE_DX, y: SPINE_WIRE_Y, anchor: 'start' }),
  ],
  reset: {
    keys: ['apiEl', 'kubectlEl', 'appBox', 'debugBox', 'containersChip', 'ephemChip', 'statusChip', 'restartChip'],
    pods: ['podGroup'],
  },
};

// The two readings of the list, named once so a four-key `chips` block stays one readable line.
const NO_EPHEM = 'empty', ONE_EPHEM = '1 · debugger-8xzrl';

export const STEPS_SPEC = [
  {
    id: 'idle',
    duration: 1500,
    // Every step pins the whole record, so the four chips are always stated together.
    chips: { containersChip: '1 · app', ephemChip: NO_EPHEM, statusChip: 'none', restartChip: '0' },
    // The Pod is Running from the first frame: this card never draws it in any other phase.
    opacity: { podGroup: 1, debugBox: OPACITY.terminated },
    sublabels: { apiEl: SUB_EPHEM, debugBox: ABSENT },
    chain: -1,
  },
  {
    id: 'no-way-in',
    duration: 2900,
    narration: 'The app container runs a distroless image, which ships no shell and no debugging tools, so kubectl exec has no sh to start. Adding one is closed too. A container cannot be appended to spec.containers on a Pod that already exists, and spec.ephemeralContainers cannot be set by updating the Pod spec either.',
    chips: { containersChip: '1 · app', ephemChip: NO_EPHEM, statusChip: 'none', restartChip: '0' },
    wires: { top: 'exec -it app -- sh' },
    opacity: { podGroup: 1, debugBox: OPACITY.terminated },
    sublabels: { apiEl: SUB_EXEC, debugBox: ABSENT },
    lit: ['kubectlEl', 'containersChip'],
    chain: -1,
    flow: [
      F.route({ points: REQ_LANE, lights: ['apiEl'] }),
    ],
  },
  {
    id: 'subresource',
    duration: 3300,
    narration: 'The kubectl debug command builds an EphemeralContainer, names it debugger-8xzrl when you do not, and PATCHes it onto the pods/ephemeralcontainers subresource. That handler is the only writer of the list, which is why kubectl edit cannot reach it. The API server appends the entry, and an ephemeral container can never be changed or removed afterwards.',
    chips: { containersChip: '1 · app', ephemChip: ONE_EPHEM, statusChip: 'none', restartChip: '0' },
    wires: { top: 'PATCH pods/ephemeralcontainers' },
    opacity: { podGroup: 1, debugBox: OPACITY.terminated },
    sublabels: { apiEl: SUB_EPHEM, debugBox: ABSENT },
    lit: ['kubectlEl'],
    chain: -1,
    flow: [
      F.route({ points: REQ_LANE, lights: ['apiEl', 'ephemChip'] }),
    ],
  },
  {
    id: 'contract',
    duration: 3200,
    narration: 'The object going through that door takes the same container spec as a real container, with many of its fields refused. It may not have ports, so ports, livenessProbe and readinessProbe are disallowed. Resources are disallowed too, because it spends spare capacity already allocated to the Pod, and restartPolicy cannot be set at all.',
    chips: { containersChip: '1 · app', ephemChip: ONE_EPHEM, statusChip: 'none', restartChip: '0' },
    opacity: { podGroup: 1, debugBox: OPACITY.terminated },
    sublabels: { apiEl: SUB_EPHEM, debugBox: ABSENT },
    // Nothing travels and no Pod acts, so the beat is the four refused rows lighting under the
    // API that refuses them, and the static highlight carries it alone (M-27).
    lit: ['apiEl'],
    chain: REFUSED,
  },
  {
    id: 'starts',
    duration: 3100,
    narration: 'The write reaches the Node and the new container comes up inside the Pod that is already running. The Pod is not replaced and the app container is not restarted, so its restartCount does not move. The debug container gets no restart guarantee of its own, and what it does is reported under status.ephemeralContainerStatuses.',
    chips: { containersChip: '1 · app', ephemChip: ONE_EPHEM, statusChip: 'Running', restartChip: '0' },
    wires: { spine: 'start debugger-8xzrl in the running Pod' },
    opacity: { podGroup: 1, debugBox: 1 },
    sublabels: { apiEl: SUB_EPHEM, debugBox: PRESENT },
    chain: -1,
    flow: [
      // The order the down-arrow takes catalog-wide: the ball lands first, then the Pod blinks
      // with the new container inside it, which is what a Pod pulse reaches.
      F.route({ points: SPINE, name: 'write', lights: ['statusChip'] }),
      F.fade({ target: 'debugBox', from: OPACITY.terminated, to: 1, dur: FADE.in, at: 'write', fill: 'both', easing: 'ease-out' }),
      F.pulse({ pod: 'podGroup', at: 'write' }),
    ],
  },
  {
    id: 'target',
    duration: 3150,
    narration: 'The --target flag sets targetContainerName, so the debug container runs in the namespaces of the container it names, IPC and PID among them. Running ps inside it then lists the app process, and the /proc link of that process reaches the app filesystem. The container runtime has to implement namespace targeting for any of that to work.',
    chips: { containersChip: '1 · app', ephemChip: ONE_EPHEM, statusChip: 'Running', restartChip: '0' },
    opacity: { podGroup: 1, debugBox: 1 },
    sublabels: { apiEl: SUB_EPHEM, debugBox: PRESENT },
    // The two containers share namespaces rather than traffic, so both light and nothing rides
    // between them: a ball over the 32 units between the boxes would crawl at the M-13 floor.
    lit: ['appBox', 'debugBox'],
    chain: 4,
  },
];

export const init = defineCard(SCENE, STEPS_SPEC, { posterFirst: true });
