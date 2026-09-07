import { P, F, defineCard, ladder, midX, WL, FADE, OPACITY } from './workloads-kit.js';
import { g, rect, text } from '../../lib/svg.js';
import { box } from '../../lib/primitives.js';

// Design notes for this card: ./CARDS/workloads-ephemeral-containers.md

// Not the A / B / C column preset (WL.L-06): this card carries no ladder. Two chip columns take the
// band below the panel, and the panel measurement is in the record with what it binds.
const PANEL_B = 256, PANEL_GAP = 20;
const BAND_Y = PANEL_B + PANEL_GAP;                      // 276, the two caption baselines

// The content span is 120..1080 rather than WL.L..WL.R: the widest chip pair needs 269 of a column,
// so the full 1080 stood a quarter empty on each flank. The record has the reading.
const SPAN_L = 120, SPAN_R = 1080, SPAN_W = SPAN_R - SPAN_L;   // 960

// Three DOORS on the API, stacked on CX so the one write that goes through descends one straight
// spine (WL.L-07), and kubectl to their RIGHT: the reversal workloads-pod-resize makes.
const DOOR_W = 280, DOOR_H = 52, DOOR_GAP = 12;
const DOOR_X = WL.CX - DOOR_W / 2, DOOR_R = DOOR_X + DOOR_W;   // 460..740
const DOOR_Y = ladder({ y: WL.TOP_Y, rowH: DOOR_H, gap: DOOR_GAP });   // 40 / 104 / 168
const DOOR_CY = i => DOOR_Y(i) + DOOR_H / 2;             // 66 / 130 / 194
const DOOR_BOTTOM = DOOR_Y(2) + DOOR_H;                  // 220
// kubectl is flush with the right edge of the span, so its right face lines up with the chips
// and the Node frame below it, and the fan takes whatever corridor is left to the doors.
const KUBECTL_W = 232, KUBECTL_X = SPAN_R - KUBECTL_W;   // 848..1080
const KUBECTL_Y = DOOR_CY(1) - WL.BOX_H / 2;             // 90..170, centred on the middle door
const BUS_X = midX(DOOR_R, KUBECTL_X);                   // 794
// WL.A-02: the top-row label sits ABOVE the actor it belongs to, centred on kubectl. The widest
// string measures 206.7 at 1600x1000, so centred it stays 66 clear of the bus and 12 inside the box.
const WIRE_X = KUBECTL_X + KUBECTL_W / 2, WIRE_Y = KUBECTL_Y - 12;   // 964, 78

// The corridor label hangs off the SIDE of the spine, in the band between the doors and the chips.
const SPINE_WIRE_Y = 246, SPINE_WIRE_DX = 14;

// Two chip columns, the field contract LEFT and the object state RIGHT, both one caption clear of
// BAND_Y. They keep the WL.L-02 inner edges at 540 and 660 and end on the span instead.
const CON_X = SPAN_L, CON_W = WL.COL_L.x + WL.COL_L.w - SPAN_L;    // 120..540
const ST_X = WL.COL_R.x, ST_W = SPAN_R - WL.COL_R.x;               // 660..1080
const CHIP_Y = ladder({ y: BAND_Y + 8, rowH: WL.CHIP_H, gap: 8 });   // 284..444

// The frame is 164 tall rather than the 128 the section runs: the Pod holds a namespace region
// with two container boxes and its own caption inside it, and the record has the vertical budget.
const NODE_Y = 460, NODE_H = 164;                        // 460..624
// 820 wide: the CENTRE bbox (L-13) is the doors, kubectl on the span edge and this Pod, and a
// narrower Pod puts its centre outside the 40 unit band. The record has the two readings.
const POD_W = 820, POD_H = 130, POD_X = WL.CX - POD_W / 2;     // 190..1010, 482..612
const POD_Y = NODE_Y + 22;
// The PID namespace of the app container, drawn as a dashed region INSIDE the Pod with both boxes
// in it: the slot the debug container takes is in that namespace, which is what --target means.
// Every offset here is Pod-relative, and the region is placed at POD_X + NS_DX, POD_Y + NS_DY:
// the Pod wrapper carries no transform of its own, so nothing appended to it inherits one.
const NS_PAD = 22, NS_TOP = 26, NS_BOTTOM = 12;
const NS_DX = NS_PAD, NS_DY = NS_TOP;                    // 22, 26
const NS_W = POD_W - 2 * NS_PAD, NS_H = POD_H - NS_TOP - NS_BOTTOM;   // 776 x 92, so 508..600
const NS_CAPTION_DY = 14;                                // the caption baseline inside the region
const CONT_W = 360, CONT_H = 52, CONT_PAD = 18, CONT_GAP = 20;
const CONT_DY = NS_DY + NS_H - NS_BOTTOM - CONT_H - 6;   // 48, so the boxes sit 18 above the region floor
const APP_DX = NS_DX + CONT_PAD;                         // 40
const DBG_DX = APP_DX + CONT_W + CONT_GAP;               // 420

// One trunk out of kubectl, a bus, and a tap into each door. The trunk and the bus carry every
// fan ball, so they are lanes minus the head, which belongs on the tap alone (A-05, the qos model).
const TRUNK = [[KUBECTL_X, DOOR_CY(1)], [BUS_X, DOOR_CY(1)]];
const BUS = [[BUS_X, DOOR_CY(0)], [BUS_X, DOOR_CY(2)]];
const TAP = i => [[BUS_X, DOOR_CY(i)], [DOOR_R, DOOR_CY(i)]];
// The ball rides the whole run, from the kubectl face to the door face. The middle door is a
// straight line, the outer two turn on the bus. Same numbers as the drawn lanes (WL.S-01).
const LANE = i => (i === 1
  ? [[KUBECTL_X, DOOR_CY(1)], [DOOR_R, DOOR_CY(1)]]
  : [[KUBECTL_X, DOOR_CY(1)], [BUS_X, DOOR_CY(1)], [BUS_X, DOOR_CY(i)], [DOOR_R, DOOR_CY(i)]]);
// One corridor, downward only, from the third door to the Node FRAME face midpoint (WL.A-03).
const SPINE = [[WL.SPINE_X, DOOR_BOTTOM], [WL.SPINE_X, NODE_Y]];

const trunkPath = (key, points) => P.lane({
  key, points, dim: true, dashed: true, role: 'cluster',
  tune: (el) => el.removeAttribute('marker-end'),
});

// What each door says about itself when nothing is at it, and its verdict when a step knocks.
const DOOR_IDLE = { execDoor: 'exec into a container', specDoor: 'the pods resource itself', ephemDoor: 'the only writer of the list' };
const KUBECTL_IDLE = 'exec · edit · debug';
// What the second container box says about itself before the subresource write, between the write
// and the start, and once it runs: the entry exists from step 3, the container from step 5.
const ABSENT = 'not in the spec yet', IN_SPEC = 'in the spec · not started', PRESENT = 'ephemeral container';
const APP_IDLE = 'distroless · no shell', APP_KEPT = 'distroless · restartCount 0';

// The namespace region is a naked dashed rect plus its caption, grouped so it fades as one thing.
// No part kind builds a fill-less boundary, and a box() would be scored as a block (L-10, L-13).
const nsRegion = () => {
  const grp = g({ class: 'scheme-ns', transform: `translate(${POD_X + NS_DX},${POD_Y + NS_DY})` });
  const r = rect({ class: 'scheme-ns-rect', x: 0, y: 0, width: NS_W, height: NS_H, rx: 6 });
  r.style.fill = 'none';
  r.style.stroke = 'var(--workloads-color)';
  r.style.strokeOpacity = '0.55';
  r.style.strokeDasharray = '4 4';
  grp.appendChild(r);
  grp.appendChild(text({ class: 'scheme-label code dim', x: NS_W / 2, y: NS_CAPTION_DY, 'text-anchor': 'middle' }, ['PID namespace of app · what targetContainerName joins']));
  return grp;
};

// The list order IS the append order, so it is the z-order: the lanes and both chip columns first,
// then the packet layer, and captions / Node / Pod / doors / kubectl above the ball.
export const SCENE = {
  'aria-label': 'Ephemeral containers: on a running Pod kubectl exec is closed by a distroless image and a Pod spec edit cannot add a container, so kubectl debug patches the ephemeralcontainers subresource instead, and the container it adds runs in the PID namespace of the container it targets with no ports, no probes and no resources, and it is never restarted or removed',
  parts: [
    P.defs(),
    trunkPath('trunk', TRUNK),
    trunkPath('bus', BUS),
    ...[0, 1, 2].map(i => P.arrow({ key: `tap${i}`, from: TAP(i)[0], to: TAP(i)[1], dim: true, dashed: true, role: 'cluster' })),
    P.lane({ key: 'spineLane', points: SPINE, dim: true, dashed: true, role: 'cluster' }),
    // The field contract: four fields the door refuses, as name and verdict.
    P.chip({ key: 'portsChip', x: CON_X, y: CHIP_Y(0), w: CON_W, h: WL.CHIP_H, name: 'ports', value: 'disallowed' }),
    P.chip({ key: 'probesChip', x: CON_X, y: CHIP_Y(1), w: CON_W, h: WL.CHIP_H, name: 'livenessProbe · readinessProbe', value: 'disallowed' }),
    P.chip({ key: 'resourcesChip', x: CON_X, y: CHIP_Y(2), w: CON_W, h: WL.CHIP_H, name: 'resources', value: 'disallowed' }),
    P.chip({ key: 'restartPolicyChip', x: CON_X, y: CHIP_Y(3), w: CON_W, h: WL.CHIP_H, name: 'restartPolicy', value: 'disallowed' }),
    // The object as the API holds it: the immutable list, the appendable one, the target, the status.
    P.chip({ key: 'containersChip', x: ST_X, y: CHIP_Y(0), w: ST_W, h: WL.CHIP_H, name: 'spec.containers', value: '1 · app' }),
    P.chip({ key: 'ephemChip', x: ST_X, y: CHIP_Y(1), w: ST_W, h: WL.CHIP_H, name: 'spec.ephemeralContainers', value: 'empty' }),
    P.chip({ key: 'targetChip', x: ST_X, y: CHIP_Y(2), w: ST_W, h: WL.CHIP_H, name: 'targetContainerName', value: 'unset' }),
    P.chip({ key: 'statusChip', x: ST_X, y: CHIP_Y(3), w: ST_W, h: WL.CHIP_H, name: 'status.ephemeralContainerStatuses', value: 'none' }),
    P.packets(),
    // Everything below is appended AFTER the packet layer, so the ball runs under it.
    // Two standing captions: each column is one thing on every step, a contract and an object.
    P.tag({ x: CON_X, y: BAND_Y, anchor: 'start', text: 'EphemeralContainer fields' }),
    P.tag({ x: ST_X, y: BAND_Y, anchor: 'start', text: 'Pod object' }),
    P.node({ key: 'nodeEl', x: SPAN_L, y: NODE_Y, w: SPAN_W, h: NODE_H, label: 'Node-1' }),
    P.pod({
      key: 'podGroup', id: 'podGroup', innerKey: 'appBox',
      // No Pod sublabel: pod() prints one at h - 8, whose ink crosses the region floor at 600.
      x: POD_X, y: POD_Y, w: POD_W, h: POD_H, label: 'Pod', sublabel: '', containers: 0,
      inner: { dx: APP_DX, dy: CONT_DY, w: CONT_W, h: CONT_H, label: 'app', sublabel: APP_IDLE },
      // buildPod carries ONE inner box. The region goes in UNDER the app box and the debug box is
      // a peer of it, both inside the shell, because pulsePod reaches only what the Pod contains.
      // box() defaults its role to the empty string, so the kit binding is written out by hand.
      // C-14: the slot is DIM before the container exists, never cut out, and the sublabel says so.
      tune: (el, refs) => {
        refs.nsRegion = nsRegion();
        refs.nsRegion.style.opacity = String(OPACITY.notready);
        el.insertBefore(refs.nsRegion, refs.appBox);
        refs.debugBox = box({
          x: POD_X + DBG_DX, y: POD_Y + CONT_DY, w: CONT_W, h: CONT_H,
          label: 'debugger-8xzrl', sublabel: ABSENT, role: 'workloads',
        });
        refs.debugBox.style.opacity = String(OPACITY.terminated);
        el.appendChild(refs.debugBox);
      },
    }),
    P.box({ key: 'execDoor', x: DOOR_X, y: DOOR_Y(0), w: DOOR_W, h: DOOR_H, label: 'pods/exec', sublabel: DOOR_IDLE.execDoor, role: 'cluster' }),
    P.box({ key: 'specDoor', x: DOOR_X, y: DOOR_Y(1), w: DOOR_W, h: DOOR_H, label: 'Pod spec', sublabel: DOOR_IDLE.specDoor, role: 'cluster' }),
    P.box({ key: 'ephemDoor', x: DOOR_X, y: DOOR_Y(2), w: DOOR_W, h: DOOR_H, label: 'pods/ephemeralcontainers', sublabel: DOOR_IDLE.ephemDoor, role: 'cluster' }),
    P.box({ key: 'kubectlEl', x: KUBECTL_X, y: KUBECTL_Y, w: KUBECTL_W, h: WL.BOX_H, label: 'kubectl', sublabel: KUBECTL_IDLE, role: 'cluster' }),
    P.wire({ key: 'top', x: WIRE_X, y: WIRE_Y }),
    P.wire({ key: 'spine', x: WL.SPINE_X + SPINE_WIRE_DX, y: SPINE_WIRE_Y, anchor: 'start' }),
  ],
  reset: {
    keys: [
      'execDoor', 'specDoor', 'ephemDoor', 'kubectlEl', 'appBox', 'debugBox',
      'portsChip', 'probesChip', 'resourcesChip', 'restartPolicyChip',
      'containersChip', 'ephemChip', 'targetChip', 'statusChip',
    ],
    pods: ['podGroup'],
  },
};

// The contract never changes value, so its four chips are one object every step spreads.
const CONTRACT = { portsChip: 'disallowed', probesChip: 'disallowed', resourcesChip: 'disallowed', restartPolicyChip: 'disallowed' };
const CONTRACT_KEYS = Object.keys(CONTRACT);
// The two readings of the object, before and after the third door is used.
const BEFORE = { ...CONTRACT, containersChip: '1 · app', ephemChip: 'empty', targetChip: 'unset', statusChip: 'none' };
const AFTER = { ...BEFORE, ephemChip: '1 · debugger-8xzrl', targetChip: 'app' };
// The three doors state their sublabels on EVERY step (P-01 for a sublabel): a verdict left
// unsaid would survive into the next step through prev and reset.
const doors = (o = {}) => ({ ...DOOR_IDLE, kubectlEl: KUBECTL_IDLE, appBox: APP_IDLE, debugBox: ABSENT, ...o });
// The Pod side before and after the container starts, stated in ONE place (A-16).
const NOT_STARTED = { podGroup: 1, debugBox: OPACITY.terminated, nsRegion: OPACITY.notready };
const STARTED = { podGroup: 1, debugBox: 1, nsRegion: 1 };

export const STEPS_SPEC = [
  {
    id: 'idle',
    duration: 1500,
    chips: BEFORE,
    // The Pod is Running from the first frame: this card never draws it in any other phase.
    opacity: NOT_STARTED,
    sublabels: doors(),
  },
  {
    id: 'no-shell',
    duration: 2900,
    narration: 'The app container runs a distroless image, which ships no shell and no debugging tools. The kubectl exec command goes through the pods/exec subresource and asks the container to start sh, and there is no sh to start, so the first door is closed by the image itself and no shell exec into app can open it.',
    chips: BEFORE,
    wires: { top: 'exec -it -c app -- sh' },
    opacity: NOT_STARTED,
    sublabels: doors({ execDoor: 'no sh in the image', kubectlEl: 'exec -it -c app -- sh' }),
    lit: ['kubectlEl', 'appBox'],
    flow: [
      F.route({ points: LANE(0), lights: ['execDoor'] }),
    ],
  },
  {
    id: 'immutable',
    duration: 3100,
    narration: 'Adding a container is closed too. The kubectl edit command writes the Pod spec back through the Pod resource itself, and a container cannot be appended to spec.containers on a live Pod: through that door a Pod update may change nothing in the list but the images, so the API server rejects it. The spec.ephemeralContainers list cannot be set that way either.',
    chips: BEFORE,
    wires: { top: 'edit: add a container to spec' },
    opacity: NOT_STARTED,
    sublabels: doors({ specDoor: 'containers cannot be added', kubectlEl: 'edit pod · add a container' }),
    lit: ['kubectlEl', 'containersChip'],
    flow: [
      F.route({ points: LANE(1), lights: ['specDoor'] }),
    ],
  },
  {
    id: 'third-door',
    duration: 3300,
    narration: 'The kubectl debug command builds an EphemeralContainer, names it debugger- plus a random suffix when you do not (debugger-8xzrl here), and PATCHes it onto the pods/ephemeralcontainers subresource. That handler is the only writer of the list, so kubectl edit cannot reach it. The API server appends the entry, which can never be changed or removed afterwards.',
    chips: AFTER,
    wires: { top: 'PATCH pods/ephemeralcontainers' },
    opacity: NOT_STARTED,
    sublabels: doors({ ephemDoor: 'appended · never removed', kubectlEl: 'debug -it --image … --target app', debugBox: IN_SPEC }),
    lit: ['kubectlEl'],
    flow: [
      F.route({ points: LANE(2), lights: ['ephemDoor', 'ephemChip', 'targetChip'] }),
    ],
  },
  {
    id: 'contract',
    duration: 3200,
    narration: 'The object going through that door takes the same container spec as a real container, with many fields refused. It may not have ports, so ports, livenessProbe and readinessProbe are disallowed. Resources are disallowed too, because it spends spare capacity already allocated to the Pod, and restartPolicy cannot be set: it is never restarted once it exits.',
    chips: AFTER,
    opacity: NOT_STARTED,
    sublabels: doors({ ephemDoor: 'appended · never removed', kubectlEl: 'debug -it --image … --target app', debugBox: IN_SPEC }),
    // Nothing travels and no Pod acts, so the beat is the four refused fields lighting under the
    // door that refuses them, and the static highlight carries it alone (M-27).
    lit: ['ephemDoor', ...CONTRACT_KEYS],
  },
  {
    id: 'starts',
    duration: 3400,
    narration: 'The write reaches the Node and the new container comes up inside the Pod that is already running, in the namespaces of the container targetContainerName names, PID among them. The Pod is not replaced and app is not restarted, so its restartCount stays at 0, and what the debug container does is reported under status.ephemeralContainerStatuses.',
    chips: { ...AFTER, statusChip: 'Running' },
    wires: { spine: 'start debugger-8xzrl in the running Pod' },
    opacity: STARTED,
    sublabels: doors({ ephemDoor: 'appended · never removed', kubectlEl: 'debug -it --image … --target app', appBox: APP_KEPT, debugBox: PRESENT }),
    flow: [
      // The order the down-arrow takes catalog-wide: the ball lands first, then the region and the
      // container inside it come up, and the Pod blinks with the new box already in it.
      F.route({ points: SPINE, name: 'write', lights: ['statusChip', 'targetChip'] }),
      F.fade({ target: 'nsRegion', from: OPACITY.notready, to: 1, dur: FADE.in, at: 'write', fill: 'both', easing: 'ease-out' }),
      F.fade({ target: 'debugBox', from: OPACITY.terminated, to: 1, dur: FADE.in, at: 'write', fill: 'both', easing: 'ease-out' }),
      F.pulse({ pod: 'podGroup', at: 'write' }),
    ],
  },
  {
    id: 'inside',
    duration: 3300,
    narration: 'Because it shares the PID namespace of app, running ps inside the debug container lists the app process, and the /proc link of that process reaches the app filesystem, which is how a distroless image gets read. The container runtime has to implement namespace targeting for any of that to work, and the entry stays in the list for as long as the Pod does.',
    chips: { ...AFTER, statusChip: 'Running' },
    opacity: STARTED,
    sublabels: doors({ ephemDoor: 'appended · never removed', kubectlEl: 'debug -it --image … --target app', appBox: APP_KEPT, debugBox: PRESENT }),
    // The two containers share a namespace rather than traffic, so both light and nothing rides
    // between them: a ball over the 20 units between the boxes would crawl at the M-13 floor.
    lit: ['appBox', 'debugBox'],
  },
];

export const init = defineCard(SCENE, STEPS_SPEC, { posterFirst: true });
