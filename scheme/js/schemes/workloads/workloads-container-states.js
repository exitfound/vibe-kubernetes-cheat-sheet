import { P, F, defineCard, ladder, WL, LAYOUT, FADE, BEAT, OPACITY } from './workloads-kit.js';

// Design notes for this card: ./CARDS.md#workloads-container-states

// Layout B of the Workloads canon (WL): chips left, pipeline right, spine into the Pod.
// Panel worst case x<=397, y<=230; a longer narration invalidates that measurement.
const PANEL_B = 230;
const TOP_W = 280, TOP_X = WL.CX - TOP_W / 2;
const WIRE_Y = WL.TOP_Y - 12;                            // above the actor box
const NODE_H = 140, CANVAS_B = 624;
const NODE_Y = CANVAS_B - NODE_H;                        // 484..624, the frame rests on the floor

// LAYOUT.B of the kit, which this card is on: chips in the LEFT column, pipeline in the RIGHT.
// WL.L-06 picks A / B / C against THIS card's measured panel bottom, and B is the one that fits.
const LAD_X = LAYOUT.B.ladder.x, LAD_W = LAYOUT.B.ladder.w;    // 660..1140, the pipeline
const LAD_Y = 160;                                       // 6 rows -> 160..402

const POD_W = 460, POD_H = 110, POD_X = WL.CX - POD_W / 2;
const POD_Y = NODE_Y + (NODE_H - POD_H) / 2;             // 499..609, centred in the frame
const CONT_W = 300, CONT_H = 64, CONT_X = WL.CX - CONT_W / 2;
const CONT_Y = POD_Y + 30;

// The spine reaches the Pod it addresses, not the frame edge above it.
const SPINE = [[WL.SPINE_X, WL.TOP_BOTTOM], [WL.SPINE_X, POD_Y]];
const SPINE_UP = [...SPINE].reverse();

// Chips as a column in the left band, which only opens below the panel.
const CHIP_GAP = 8;
const CHIPS_TOP = PANEL_B + 20;                          // 250, clear of the panel
const CHIP_X = LAYOUT.B.chips.x, CHIP_W = LAYOUT.B.chips.w;    // 60..540
const CHIP_Y = ladder({ y: CHIPS_TOP, rowH: WL.CHIP_H, gap: CHIP_GAP });

// The two termination records, named once: the one the card opens on and the one the crash writes.
const PRIOR = 'Terminated · exitCode 1 · Error';
const FRESH = 'Terminated · exitCode 137 · OOMKilled';

// The list order IS the append order, so it is the z-order: the two corridors and the wire label
// first, then the chip column, the packet layer, and chain / Node / Pod / Kubelet above the ball.
export const SCENE = {
  'aria-label': 'Container restarts and lastState: Kubelet preserves the previous termination record so a restart can be debugged',
  parts: [
    P.defs(),
    // One corridor drawn twice, down for the restart order and up for the exit report. Exactly one
    // is visible per step, which is what the `corridor()` pair in every `opacity` block below says.
    P.lane({ key: 'connectorDown', points: SPINE, dim: true, dashed: true, role: 'cluster' }),
    P.lane({ key: 'connectorUp', points: SPINE_UP, dim: true, dashed: true, role: 'cluster', opacity: 0 }),
    // WL.A-02: the top-row wire label sits ABOVE the actor row, never below it.
    P.wire({ key: 'req', x: WL.CX, y: WIRE_Y }),
    // State field chips in the left band: the containerStatuses fields you read.
    P.chip({ key: 'stateChip', x: CHIP_X, y: CHIP_Y(0), w: CHIP_W, h: WL.CHIP_H, name: 'state', value: 'Running' }),
    P.chip({ key: 'detailChip', x: CHIP_X, y: CHIP_Y(1), w: CHIP_W, h: WL.CHIP_H, name: 'state detail', value: 'startedAt 09:20:14Z' }),
    P.chip({ key: 'lastChip', x: CHIP_X, y: CHIP_Y(2), w: CHIP_W, h: WL.CHIP_H, name: 'lastState', value: PRIOR }),
    P.chip({ key: 'restartChip', x: CHIP_X, y: CHIP_Y(3), w: CHIP_W, h: WL.CHIP_H, name: 'restartCount', value: '2' }),
    P.packets(),
    // Everything below is appended AFTER the packet layer, so the ball runs under it.
    P.chain({
      key: 'chain', x: LAD_X, y: LAD_Y, w: LAD_W, rowH: WL.ROW_H, gap: WL.ROW_GAP, role: 'cluster',
      items: [
        '1. running    ·  state is Running, the container is up',
        '2. exit       ·  process exits, state becomes Terminated',
        '3. restart    ·  the Terminated record rolls into lastState',
        '4. lastState  ·  the prior-death record, read it to debug',
        '5. exitCode   ·  decode the number into a cause of death',
        '6. describe   ·  kubectl shows State and Last State',
      ],
    }),
    P.node({ key: 'nodeEl', x: WL.L, y: NODE_Y, w: WL.W, h: NODE_H, label: 'Node-1' }),
    P.pod({
      key: 'podGroup', id: 'podGroup',
      x: POD_X, y: POD_Y, w: POD_W, h: POD_H, label: 'Pod', sublabel: '', containers: 0,
      // No build-time opacity: every step pins the Pod's own, and the poster frame is `running`.
      inner: { dx: CONT_X - POD_X, dy: CONT_Y - POD_Y, w: CONT_W, h: CONT_H, label: 'app', sublabel: 'container' },
    }),
    P.box({ key: 'kubelet', x: TOP_X, y: WL.TOP_Y, w: TOP_W, h: WL.BOX_H, label: 'Kubelet', sublabel: 'writes containerStatuses[]', role: 'cluster' }),
  ],
  reset: {
    keys: ['kubelet', 'stateChip', 'detailChip', 'lastChip', 'restartChip'],
    pods: ['podGroup'],
  },
};

// setConnectorDir as FIELDS: the pair is written in one place, so no step can leave both corridors
// on or neither. Key order is the order the helper wrote them in.
const corridor = (dir) => ({ connectorDown: dir === 'up' ? 0 : 1, connectorUp: dir === 'up' ? 1 : 0 });

export const STEPS_SPEC = [
  {
    id: 'running',
    duration: 1500,
    // Every step pins the full record, so the four chips are always stated together.
    chips: { stateChip: 'Running', detailChip: 'startedAt 09:20:14Z', lastChip: PRIOR, restartChip: '2' },
    opacity: { podGroup: 1, ...corridor('down') },
    chain: 0,
  },
  {
    id: 'crash',
    duration: 2600,
    narration: 'The process hits its memory limit and the kernel kills it. Kubelet sets state to Terminated, a record carrying exitCode, reason, startedAt and finishedAt. Here exitCode is 137 and reason is OOMKilled. This live Terminated record exists only for an instant.',
    chips: { stateChip: 'Terminated', detailChip: 'exitCode 137 · OOMKilled', lastChip: PRIOR, restartChip: '2' },
    wires: { req: 'CRI: container exited · 137' },
    opacity: { podGroup: OPACITY.notready, ...corridor('up') },
    lit: ['stateChip', 'detailChip'],
    chain: 1,
    flow: [
      // Pod blinks and dims first (the container just died), then the CRI exit
      // report travels up the connector to Kubelet.
      F.pulse({ pod: 'podGroup' }),
      F.fade({ target: 'podGroup', from: 1, to: OPACITY.notready, dur: FADE.out, fill: 'both', easing: 'ease-in' }),
      F.route({ points: SPINE_UP, delay: BEAT.afterPulse, lights: ['kubelet'] }),
    ],
  },
  {
    id: 'restart',
    duration: 2300,
    narration: 'Kubelet restarts the container in the same Pod sandbox. As the fresh instance comes up, state goes back to Running, and the Terminated record just produced is rolled into lastState. The restartCount ticks to 3. The earlier lastState is overwritten, only the most recent termination is kept.',
    chips: { stateChip: 'Running', detailChip: 'startedAt 09:24:30Z', lastChip: FRESH, restartChip: '3' },
    wires: { req: 'restart container · lastState recorded' },
    // Fresh container running: the container box returns to full opacity.
    opacity: { podGroup: 1, ...corridor('down') },
    lit: ['detailChip', 'kubelet', 'stateChip', 'lastChip', 'restartChip'],
    chain: 2,
    flow: [
      // The restart order travels down to the node, the fresh container comes up
      // and the Pod pulses on arrival.
      F.route({ points: SPINE, name: 'restart' }),
      F.fade({ target: 'podGroup', from: OPACITY.notready, to: 1, dur: FADE.in, at: 'restart', fill: 'both', easing: 'ease-out' }),
      F.pulse({ pod: 'podGroup', at: 'restart' }),
    ],
  },
  {
    id: 'read',
    duration: 2200,
    narration: 'This is the field you debug with. The live state says Running, so the container is fine right now and reveals nothing about the failure. The lastState field holds the answer: a Terminated record with exitCode 137 and reason OOMKilled, which is why the previous instance died.',
    chips: { stateChip: 'Running', detailChip: 'startedAt 09:24:30Z', lastChip: FRESH, restartChip: '3' },
    opacity: { podGroup: 1, ...corridor('down') },
    // Reading status is local, nothing travels and the Pod is untouched, so the
    // fields you read light up via the static highlight only (no chip pulse).
    lit: ['stateChip', 'lastChip'],
    chain: 3,
  },
  {
    id: 'exitcodes',
    duration: 2400,
    narration: 'The exitCode names the cause. 0 is Completed, a clean exit. 1 is a generic application Error. Codes above 128 carry a signal: 137 is 128 plus 9 for SIGKILL, paired with reason OOMKilled when the kernel did it, and 143 is 128 plus 15 for SIGTERM. The number narrows the cause, and the reason beside it names it.',
    chips: { stateChip: 'Running', detailChip: 'startedAt 09:24:30Z', lastChip: FRESH, restartChip: '3' },
    opacity: { podGroup: 1, ...corridor('down') },
    // Decoding the code is a local lookup, nothing travels and the Pod is untouched,
    // so the record being read lights up via the static highlight only (no chip pulse).
    lit: ['lastChip'],
    chain: 4,
  },
  {
    id: 'describe',
    duration: 2100,
    narration: 'Running kubectl describe pod surfaces both records, State for the live instance and Last State for the prior one. Together with restartCount, which counts every restart, these three fields are what you read to diagnose a container that has been restarting.',
    chips: { stateChip: 'Running', detailChip: 'startedAt 09:24:30Z', lastChip: FRESH, restartChip: '3' },
    opacity: { podGroup: 1, ...corridor('down') },
    // kubectl only reads, nothing travels and the Pod is untouched, so the three
    // diagnostic fields light up via the static highlight only (no chip pulse).
    lit: ['stateChip', 'lastChip', 'restartChip'],
    chain: 5,
  },
];

export const init = defineCard(SCENE, STEPS_SPEC, { posterFirst: true });
