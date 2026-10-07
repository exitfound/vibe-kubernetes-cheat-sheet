import { P, F, defineCard, ladder, midX, WL, FADE, BEAT, OPACITY } from './workloads-kit.js';
import { g, rect, text } from '../../lib/svg.js';
import { box } from '../../lib/primitives.js';

// Design notes for this card: ./CARDS/workloads-ephemeral-containers.md

// No ladder, so not the A / B / C column preset (WL.L-06): two chip columns under the panel.
const PANEL_B = 256, PANEL_GAP = 20;
const BAND_Y = PANEL_B + PANEL_GAP;                      // the two caption baselines

// Narrower than WL.L..WL.R so the chip columns do not stand half empty.
const SPAN_L = 120, SPAN_R = 1080, SPAN_W = SPAN_R - SPAN_L;

// Three doors on the API stacked on CX so the write that passes descends one spine (WL.L-07).
const DOOR_W = 280, DOOR_H = 52, DOOR_GAP = 12;
const DOOR_X = WL.CX - DOOR_W / 2, DOOR_R = DOOR_X + DOOR_W;
const DOOR_Y = ladder({ y: WL.TOP_Y, rowH: DOOR_H, gap: DOOR_GAP });
const DOOR_CY = i => DOOR_Y(i) + DOOR_H / 2;
const DOOR_BOTTOM = DOOR_Y(2) + DOOR_H;
// kubectl is flush with the span edge, in line with the chips and the Node frame.
const KUBECTL_W = 232, KUBECTL_X = SPAN_R - KUBECTL_W;
const KUBECTL_Y = DOOR_CY(1) - WL.BOX_H / 2;             // centred on the middle door
const BUS_X = midX(DOOR_R, KUBECTL_X);
// WL.A-02: the top-row label sits above its actor.
const WIRE_X = KUBECTL_X + KUBECTL_W / 2, WIRE_Y = KUBECTL_Y - 12;

const SPINE_WIRE_Y = 246, SPINE_WIRE_DX = 14;

// Field contract left, object state right: WL.L-02 inner edges, outer edges on the span.
const CON_X = SPAN_L, CON_W = WL.COL_L.x + WL.COL_L.w - SPAN_L;
const ST_X = WL.COL_R.x, ST_W = SPAN_R - WL.COL_R.x;
const CHIP_Y = ladder({ y: BAND_Y + 8, rowH: WL.CHIP_H, gap: 8 });

const NODE_Y = 456;
// Narrower and the centre bbox (L-13) leaves the 40 unit band.
const POD_W = 820, POD_H = 130, POD_X = WL.CX - POD_W / 2;
const POD_Y = NODE_Y + 34;
const NODE_H = 34 + POD_H + 12;
// The app container's PID namespace, a dashed region holding both boxes: what --target joins.
// Offsets are Pod-relative and added to POD_X / POD_Y: the Pod wrapper has no transform.
const NS_PAD = 22, NS_TOP = 26, NS_BOTTOM = 12;
const NS_DX = NS_PAD, NS_DY = NS_TOP;
const NS_W = POD_W - 2 * NS_PAD, NS_H = POD_H - NS_TOP - NS_BOTTOM;
const NS_CAPTION_DY = 14;                                // caption baseline inside the region
const CONT_W = 360, CONT_H = 52, CONT_PAD = 18, CONT_GAP = 20;
const CONT_DY = NS_DY + NS_H - NS_BOTTOM - CONT_H - 6;
const APP_DX = NS_DX + CONT_PAD;
const DBG_DX = APP_DX + CONT_W + CONT_GAP;

// Trunk and bus carry every fan ball, but the head belongs on the tap alone (A-05).
const TRUNK = [[KUBECTL_X, DOOR_CY(1)], [BUS_X, DOOR_CY(1)]];
const BUS = [[BUS_X, DOOR_CY(0)], [BUS_X, DOOR_CY(2)]];
const TAP = i => [[BUS_X, DOOR_CY(i)], [DOOR_R, DOOR_CY(i)]];
// Same points as the drawn lanes (WL.S-01).
const LANE = i => (i === 1
  ? [[KUBECTL_X, DOOR_CY(1)], [DOOR_R, DOOR_CY(1)]]
  : [[KUBECTL_X, DOOR_CY(1)], [BUS_X, DOOR_CY(1)], [BUS_X, DOOR_CY(i)], [DOOR_R, DOOR_CY(i)]]);
// Downward only, to the Node frame face midpoint (WL.A-03).
const SPINE = [[WL.SPINE_X, DOOR_BOTTOM], [WL.SPINE_X, NODE_Y]];

const trunkPath = (key, points) => P.lane({
  key, points, dim: true, dashed: true, role: 'cluster',
  tune: (el) => el.removeAttribute('marker-end'),
});

const DOOR_IDLE = { execDoor: 'exec into a container', specDoor: 'the pods resource itself', ephemDoor: 'the only writer of the list' };
const KUBECTL_IDLE = 'exec · edit · debug';
// The debug box before the write, between write and start, and running.
const ABSENT = 'not in the spec yet', IN_SPEC = 'in the spec · not started', PRESENT = 'ephemeral container';
const APP_IDLE = 'distroless · no shell', APP_KEPT = 'distroless · restartCount 0';

// Hand-built: no part kind draws a fill-less boundary, and a box() would score as a block (L-10, L-13).
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

// List order is z-order: lanes and chips under the packet layer, everything else above the ball.
export const SCENE = {
  'aria-label': 'Ephemeral containers: on a running Pod kubectl exec is closed by a distroless image and a Pod spec edit cannot add a container, so kubectl debug patches the ephemeralcontainers subresource instead, and the container it adds runs in the PID namespace of the container it targets with no ports, no probes and no resources, and it is never restarted or removed',
  parts: [
    P.defs(),
    trunkPath('trunk', TRUNK),
    trunkPath('bus', BUS),
    ...[0, 1, 2].map(i => P.arrow({ key: `tap${i}`, from: TAP(i)[0], to: TAP(i)[1], dim: true, dashed: true, role: 'cluster' })),
    P.lane({ key: 'spineLane', points: SPINE, dim: true, dashed: true, role: 'cluster' }),
    P.chip({ key: 'portsChip', x: CON_X, y: CHIP_Y(0), w: CON_W, h: WL.CHIP_H, name: 'ports', value: 'disallowed' }),
    P.chip({ key: 'probesChip', x: CON_X, y: CHIP_Y(1), w: CON_W, h: WL.CHIP_H, name: 'livenessProbe · readinessProbe', value: 'disallowed' }),
    P.chip({ key: 'resourcesChip', x: CON_X, y: CHIP_Y(2), w: CON_W, h: WL.CHIP_H, name: 'resources', value: 'disallowed' }),
    P.chip({ key: 'restartPolicyChip', x: CON_X, y: CHIP_Y(3), w: CON_W, h: WL.CHIP_H, name: 'restartPolicy', value: 'disallowed' }),
    P.chip({ key: 'containersChip', x: ST_X, y: CHIP_Y(0), w: ST_W, h: WL.CHIP_H, name: 'spec.containers', value: '1 · app' }),
    P.chip({ key: 'ephemChip', x: ST_X, y: CHIP_Y(1), w: ST_W, h: WL.CHIP_H, name: 'spec.ephemeralContainers', value: 'empty' }),
    P.chip({ key: 'targetChip', x: ST_X, y: CHIP_Y(2), w: ST_W, h: WL.CHIP_H, name: 'targetContainerName', value: 'unset' }),
    P.chip({ key: 'statusChip', x: ST_X, y: CHIP_Y(3), w: ST_W, h: WL.CHIP_H, name: 'status.ephemeralContainerStatuses', value: 'none' }),
    P.packets(),
    P.tag({ x: CON_X, y: BAND_Y, anchor: 'start', text: 'EphemeralContainer fields' }),
    P.tag({ x: ST_X, y: BAND_Y, anchor: 'start', text: 'Pod object' }),
    P.node({ key: 'nodeEl', x: SPAN_L, y: NODE_Y, w: SPAN_W, h: NODE_H, label: 'Node-1' }),
    P.pod({
      key: 'podGroup', id: 'podGroup', innerKey: 'appBox',
      // No Pod sublabel: it would cross the region floor.
      x: POD_X, y: POD_Y, w: POD_W, h: POD_H, label: 'Pod', sublabel: '', containers: 0,
      inner: { dx: APP_DX, dy: CONT_DY, w: CONT_W, h: CONT_H, label: 'app', sublabel: APP_IDLE },
      // Region and debug box go inside the shell, since pulsePod reaches only what the Pod holds.
      // box() defaults its role to empty, so the role is written by hand. C-14: dim, never cut out.
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

const CONTRACT = { portsChip: 'disallowed', probesChip: 'disallowed', resourcesChip: 'disallowed', restartPolicyChip: 'disallowed' };
const CONTRACT_KEYS = Object.keys(CONTRACT);
const BEFORE = { ...CONTRACT, containersChip: '1 · app', ephemChip: 'empty', targetChip: 'unset', statusChip: 'none' };
const AFTER = { ...BEFORE, ephemChip: '1 · debugger-8xzrl', targetChip: 'app' };
// Every step states all door sublabels (P-01), or a verdict survives into the next step.
const doors = (o = {}) => ({ ...DOOR_IDLE, kubectlEl: KUBECTL_IDLE, appBox: APP_IDLE, debugBox: ABSENT, ...o });
// Stated in one place (A-16).
const NOT_STARTED = { podGroup: 1, debugBox: OPACITY.terminated, nsRegion: OPACITY.notready };
const STARTED = { podGroup: 1, debugBox: 1, nsRegion: 1 };

export const STEPS_SPEC = [
  {
    id: 'idle',
    duration: 1500,
    chips: BEFORE,
    opacity: NOT_STARTED,
    sublabels: doors(),
  },
  {
    id: 'no-shell',
    duration: 2900,
    narration: 'The app container runs a distroless image, which ships no shell and no debugging tools. The kubectl exec command goes through the pods/exec subresource and asks the container to start sh, and there is no sh to start, so the first door is closed by the image itself and no shell exec into app can open it.',
    chips: BEFORE,
    wires: { top: 'exec: start sh in app' },
    opacity: NOT_STARTED,
    sublabels: doors({ execDoor: 'no sh in the image', kubectlEl: 'exec -it -c app -- sh' }),
    // kubectl acts first, lit while the ball waits (M-18a).
    lit: ['kubectlEl', 'appBox'],
    rewind: { sublabels: { execDoor: DOOR_IDLE.execDoor } },
    flow: [
      F.route({ points: LANE(0), delay: BEAT.lead, name: 'knock', lights: ['execDoor'] }),
      F.set({ at: 'knock', sublabels: { execDoor: 'no sh in the image' } }),
    ],
  },
  {
    id: 'immutable',
    duration: 3400,
    narration: 'Adding a container is closed too. The kubectl edit command writes the Pod spec back through the Pod resource itself, and a container cannot be appended to spec.containers on a live Pod: through that door a Pod update may change nothing in the list but the images, so the API server rejects it. The spec.ephemeralContainers list cannot be set that way either.',
    chips: BEFORE,
    wires: { top: 'PATCH pods: add a container' },
    opacity: NOT_STARTED,
    sublabels: doors({ specDoor: 'containers cannot be added', kubectlEl: 'edit pod · add a container' }),
    lit: ['kubectlEl', 'containersChip'],
    rewind: { sublabels: { specDoor: DOOR_IDLE.specDoor } },
    flow: [
      F.route({ points: LANE(1), delay: BEAT.lead, name: 'knock', lights: ['specDoor'] }),
      F.set({ at: 'knock', sublabels: { specDoor: 'containers cannot be added' } }),
    ],
  },
  {
    id: 'third-door',
    duration: 3400,
    narration: 'The kubectl debug command builds an EphemeralContainer, names it debugger- plus a random suffix when you do not (debugger-8xzrl here), and PATCHes it onto the pods/ephemeralcontainers subresource. That handler is the only writer of the list, so kubectl edit cannot reach it. The API server appends the entry, which can never be changed or removed afterwards.',
    chips: AFTER,
    wires: { top: 'PATCH pods/ephemeralcontainers' },
    opacity: NOT_STARTED,
    sublabels: doors({ ephemDoor: 'appended · never removed', kubectlEl: 'debug -it --image … --target app', debugBox: IN_SPEC }),
    lit: ['kubectlEl'],
    // The entry exists once the PATCH lands (P-03).
    rewind: {
      chips: { ephemChip: BEFORE.ephemChip, targetChip: BEFORE.targetChip },
      sublabels: { ephemDoor: DOOR_IDLE.ephemDoor, debugBox: ABSENT },
    },
    flow: [
      F.route({ points: LANE(2), delay: BEAT.lead, name: 'patch', lights: ['ephemDoor', 'ephemChip', 'targetChip'] }),
      F.set({ at: 'patch', chips: { ephemChip: AFTER.ephemChip, targetChip: AFTER.targetChip }, sublabels: { ephemDoor: 'appended · never removed', debugBox: IN_SPEC } }),
    ],
  },
  {
    id: 'contract',
    duration: 3400,
    narration: 'The object going through that door takes the same container spec as a real container, with many fields refused. It may not have ports, so ports, livenessProbe and readinessProbe are disallowed. Resources are disallowed too, because it spends spare capacity already allocated to the Pod, and restartPolicy cannot be set: it is never restarted once it exits.',
    chips: AFTER,
    opacity: NOT_STARTED,
    sublabels: doors({ ephemDoor: 'appended · never removed', kubectlEl: 'debug -it --image … --target app', debugBox: IN_SPEC }),
    // Nothing travels: the static highlight carries the beat (M-27).
    lit: ['ephemDoor', ...CONTRACT_KEYS],
  },
  {
    id: 'starts',
    duration: 3400,
    narration: 'The Kubelet on the Node sees the new entry and starts the container inside the Pod that is already running, in the namespaces of the container targetContainerName names, PID among them. The Pod is not replaced and app is not restarted, so its restartCount stays at 0, and what the debug container does is reported under status.ephemeralContainerStatuses.',
    chips: { ...AFTER, statusChip: 'Running' },
    wires: { spine: 'start debugger-8xzrl in the running Pod' },
    opacity: STARTED,
    sublabels: doors({ ephemDoor: 'appended · never removed', kubectlEl: 'debug -it --image … --target app', appBox: APP_KEPT, debugBox: PRESENT }),
    // The door acts first, lit while the ball waits (M-18a).
    lit: ['ephemDoor'],
    rewind: { chips: { statusChip: 'none' }, sublabels: { debugBox: IN_SPEC } },
    flow: [
      // Down-arrow order: ball lands, then the container comes up, then the Pod blinks.
      F.route({ points: SPINE, delay: BEAT.lead, name: 'write', lights: ['statusChip', 'targetChip'] }),
      F.set({ at: 'write', chips: { statusChip: 'Running' }, sublabels: { debugBox: PRESENT } }),
      F.fade({ target: 'nsRegion', from: OPACITY.notready, to: 1, dur: FADE.in, at: 'write', fill: 'both', easing: 'ease-out' }),
      F.fade({ target: 'debugBox', from: OPACITY.terminated, to: 1, dur: FADE.in, at: 'write', fill: 'both', easing: 'ease-out' }),
      F.pulse({ pod: 'podGroup', at: 'write' }),
    ],
  },
  {
    id: 'inside',
    duration: 3400,
    narration: 'Because it shares the PID namespace of app, running ps inside the debug container lists the app process, and the /proc link of that process reaches the app filesystem, which is how a distroless image gets read. The container runtime has to implement namespace targeting for any of that to work, and the entry stays in the list for as long as the Pod does.',
    chips: { ...AFTER, statusChip: 'Running' },
    opacity: STARTED,
    sublabels: doors({ ephemDoor: 'appended · never removed', kubectlEl: 'debug -it --image … --target app', appBox: APP_KEPT, debugBox: PRESENT }),
    // A shared namespace, not traffic: nothing rides between the boxes.
    lit: ['appBox', 'debugBox'],
  },
];

export const init = defineCard(SCENE, STEPS_SPEC, { posterFirst: true });
