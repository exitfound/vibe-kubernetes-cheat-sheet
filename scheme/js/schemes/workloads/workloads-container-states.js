import { P, F, defineCard, spread, laneY, midX, WL, FADE, BEAT, OPACITY } from './workloads-kit.js';
import { box } from '../../lib/primitives.js';

// Design notes for this card: ./CARDS/workloads-container-states.md

// Own geometry, no A / B / C preset: the card carries no ladder and no chip column, so the two
// columns those presets choose between do not exist here. Three record slots span 90..1110 under
// the panel, and the Node band under them, on the same 90..1110, holds the Pod and its own Kubelet.
// Panel worst case x<=397, y<=230; a longer narration invalidates that measurement.
const PANEL_B = 230;
const BAND_Y = PANEL_B + 20;                             // 250, the slot row top, clear of the panel
const CAPTION_Y = BAND_Y - 12;                           // 238, the board caption baseline

// The one remote actor, centred on the spine (WL.L-07), and its corridor down to the board. It
// takes the 232 the family gives an actor box, so the row reads the same width as its siblings.
const TOP_W = 232, TOP_X = WL.CX - TOP_W / 2;            // 484..716
const CORRIDOR = [[WL.SPINE_X, WL.TOP_BOTTOM], [WL.SPINE_X, BAND_Y]];
const CORR_WIRE_X = WL.SPINE_X + 14, CORR_WIRE_Y = midX(WL.TOP_BOTTOM, BAND_Y) + 4;

// Three slots, spread so the middle one is centred on the spine and the outer two sit on column
// centres 230 and 970: the containers under the first two are centred there as well. The three
// CENTRES are what the rest of the card is built on (the write lane lands on the first, the Kubelet
// stands under the third), so a width change moves the edges and never them. 248 and not the 232 of
// the actor row above: `Terminated · exitCode 137 · OOMKilled` measures 223.1, which a 232 box would
// leave 4.5 units per side, and the string is the record this card is about.
const SLOT_W = 248, SLOT_H = WL.BOX_H;                   // 250..330
const SLOTS = spread({ from: 106, to: 1094, count: 3, w: SLOT_W });   // 106, 476, 846
const SLOT_X = (i) => SLOTS.x(i);
const SLOT_CX = (i) => SLOT_X(i) + SLOT_W / 2;           // 230, 600, 970
const SLOT_MID_Y = BAND_Y + SLOT_H / 2;                  // 290, the roll lanes
const SLOT_B = BAND_Y + SLOT_H;                          // 330
const ROLL_1 = { from: [SLOT_X(0) + SLOT_W, SLOT_MID_Y], to: [SLOT_X(1), SLOT_MID_Y] };   // 354 -> 476
const ROLL_2 = { from: [SLOT_X(1) + SLOT_W, SLOT_MID_Y], to: [SLOT_X(2), SLOT_MID_Y] };   // 724 -> 846

// One chip, centred under the middle slot so the strip centre is the canvas centre (L-13).
const CHIP_W = SLOT_W, CHIP_X = SLOT_X(1), CHIP_Y = SLOT_B + 20;   // 476..724, 350..384

// The Node band on the canvas floor, on the full 90..1110 the card is built inside, and the Kubelet
// inside it as the agent of that Node. It is stated as its own pair rather than read off the slot
// row: the slots are 248 and the frame is not, so a derived edge would drag the floor along with a
// width change up there.
const NODE_H = 140, CANVAS_B = 624, FRAME_PAD = 20;
const NODE_Y = CANVAS_B - NODE_H;                        // 484..624
const NODE_X = 90, NODE_W = 1020;                                 // 90..1110
// The Pod at the size workloads-ephemeral-containers draws (two 210 boxes in a 96 tall shell),
// against the left frame edge, so the live instance sits under the state slot (centre 235 vs 230).
const CONT_W = 210, CONT_H = 52, CONT_PAD = 20, CONT_DY = 30;
const POD_X = NODE_X + FRAME_PAD;                        // 110
const CONT_X = (i) => POD_X + CONT_PAD + i * (CONT_W + CONT_PAD);   // 130, 360
const POD_W = 3 * CONT_PAD + 2 * CONT_W, POD_R = POD_X + POD_W;     // 480, 110..590
const POD_H = 96;
// 28 under the frame top rather than centred: the frame label inks to y 506 from x 102, and the
// Pod starts at x 110, so its top edge has to clear that label rather than the frame edge.
const POD_Y = NODE_Y + 28;                               // 512..608

// The Kubelet under the third slot, centred on it and inset FRAME_PAD from the frame edge, at the
// Pod's own vertical centre so the ground pair leaves and lands on face midpoints at one height.
const KUBE_W = 240, KUBE_CX = SLOT_CX(2);                // 970
const KUBE_X = KUBE_CX - KUBE_W / 2;                     // 850..1090
const KUBE_Y = POD_Y + (POD_H - WL.BOX_H) / 2;           // 520..600

// The ground pair between the Pod and its Kubelet, mirrored around the shared face centre: the
// restart order rides left on the upper lane, the exit report rides right on the lower (A-03).
const LANE_CY = midX(KUBE_Y, KUBE_Y + WL.BOX_H);         // 560, also the Pod centre
const { out: OUT_Y, back: EXIT_Y } = laneY(LANE_CY, WL.LANE_DY);   // 548 / 572
const LANE_OUT = { from: [KUBE_X, OUT_Y], to: [POD_R, OUT_Y] };
const LANE_EXIT = { from: [POD_R, EXIT_Y], to: [KUBE_X, EXIT_Y] };
const GROUND_WIRE_X = midX(POD_R, KUBE_X);               // 720
const WIRE_OUT_Y = OUT_Y - 12, WIRE_EXIT_Y = EXIT_Y + 18;   // 536 / 590

// The status write: it leaves the Kubelet upward, crosses above the Pod and lands on the bottom
// face of the state slot. The horizontal runs 50 under the chip and 50 above the frame.
const WRITE_Y = midX(CHIP_Y + WL.CHIP_H, NODE_Y);        // 434
const WRITE_LANE = [[KUBE_CX, KUBE_Y], [KUBE_CX, WRITE_Y], [SLOT_CX(0), WRITE_Y], [SLOT_CX(0), SLOT_B]];
const WRITE_WIRE_Y = WRITE_Y - 10;

// The record strings, named once: two live states and the two terminations the card shows.
const RUN_2 = 'Running · startedAt 09:20:14Z', RUN_3 = 'Running · startedAt 09:24:30Z';
const TERM_1 = 'Terminated · exitCode 1 · Error';
const TERM_137 = 'Terminated · exitCode 137 · OOMKilled';
// What the two container boxes say, per generation.
const LIVE_2 = 'app #2 · Running', DEAD_2 = 'app #2 · exited 137';
const LIVE_3 = 'app #3 · Running';
const KEPT_1 = 'app #1 · exited 1 · kept', KEPT_2 = 'app #2 · exited 137 · kept';

// The list order IS the append order, so it is the z-order: the Node frame first, because its
// fill dims whatever it covers, then lanes and wire labels, the caption and the chip, the packet
// layer, and slots / Pod / actors above the ball.
export const SCENE = {
  'aria-label': 'Container restarts and lastState: when Kubelet restarts a crashed container, the Terminated record rolls from state into lastState, the dead instance stays on the Node for kubectl logs --previous, and only the most recent termination survives the next restart',
  parts: [
    P.defs(),
    P.node({ key: 'nodeEl', x: NODE_X, y: NODE_Y, w: NODE_W, h: NODE_H, label: 'Node-1' }),
    P.arrow({ key: 'corridor', from: CORRIDOR[0], to: CORRIDOR[1], dim: true, dashed: true, role: 'cluster' }),
    P.lane({ key: 'writeLane', points: WRITE_LANE, dim: true, dashed: true, role: 'cluster' }),
    P.arrow({ key: 'roll1', ...ROLL_1, dim: true, dashed: true, role: 'cluster' }),
    // A relationship, not a route: nothing is delivered to a sign that says nothing is kept.
    P.relation({ key: 'roll2', points: [ROLL_2.from, ROLL_2.to], role: 'cluster' }),
    P.arrow({ key: 'laneOut', ...LANE_OUT, dim: true, dashed: true, role: 'cluster' }),
    P.arrow({ key: 'laneExit', ...LANE_EXIT, dim: true, dashed: true, role: 'cluster' }),
    P.wire({ key: 'corr', x: CORR_WIRE_X, y: CORR_WIRE_Y, anchor: 'start' }),
    P.wire({ key: 'write', x: WL.CX, y: WRITE_WIRE_Y }),
    P.wire({ key: 'out', x: GROUND_WIRE_X, y: WIRE_OUT_Y }),
    P.wire({ key: 'exit', x: GROUND_WIRE_X, y: WIRE_EXIT_Y }),
    // A standing caption: the row below is one API record on every step, not a pipeline. It ends
    // on the right edge of the row at 1094, clear of the corridor landing on the middle slot.
    P.tag({ x: SLOT_X(2) + SLOT_W, y: CAPTION_Y, anchor: 'end', text: 'API · Pod.status.containerStatuses[app]' }),
    P.chip({ key: 'restartChip', x: CHIP_X, y: CHIP_Y, w: CHIP_W, h: WL.CHIP_H, name: 'restartCount', value: '1' }),
    P.packets(),
    // Everything below is appended AFTER the packet layer, so the ball runs under it.
    P.box({ key: 'stateSlot', x: SLOT_X(0), y: BAND_Y, w: SLOT_W, h: SLOT_H, label: '.state', sublabel: RUN_2, role: 'cluster' }),
    P.box({ key: 'lastSlot', x: SLOT_X(1), y: BAND_Y, w: SLOT_W, h: SLOT_H, label: '.lastState', sublabel: TERM_1, role: 'cluster' }),
    // Not a record: a standing sign that nothing older is stored, so it rests outside the path.
    P.box({ key: 'olderSlot', x: SLOT_X(2), y: BAND_Y, w: SLOT_W, h: SLOT_H, label: 'Older terminations', sublabel: 'not kept', role: 'cluster', opacity: OPACITY.notready }),
    P.pod({
      key: 'podGroup', id: 'podGroup', innerKey: 'liveBox',
      // No Pod sublabel: pod() prints one at h - 8, which would cross the container boxes.
      x: POD_X, y: POD_Y, w: POD_W, h: POD_H, label: 'Pod', sublabel: '', containers: 0,
      inner: { dx: CONT_X(0) - POD_X, dy: CONT_DY, w: CONT_W, h: CONT_H, label: 'Live instance', sublabel: LIVE_2 },
      // buildPod carries ONE inner box. The previous instance is a peer of it and sits INSIDE the
      // shell, because pulsePod reaches only what the Pod group contains. box() defaults its role
      // to the empty string, so the kit binding is written out by hand. It is dead and kept, so
      // it rests at notready: alive to the Node, serving nothing.
      tune: (el, refs) => {
        refs.prevBox = box({
          x: CONT_X(1), y: POD_Y + CONT_DY, w: CONT_W, h: CONT_H,
          label: 'Previous instance', sublabel: KEPT_1, role: 'workloads',
        });
        refs.prevBox.style.opacity = String(OPACITY.notready);
        el.appendChild(refs.prevBox);
      },
    }),
    P.box({ key: 'kubelet', x: KUBE_X, y: KUBE_Y, w: KUBE_W, h: WL.BOX_H, label: 'Kubelet', sublabel: 'writes containerStatuses[]', role: 'cluster' }),
    P.box({ key: 'kubectl', x: TOP_X, y: WL.TOP_Y, w: TOP_W, h: WL.BOX_H, label: 'kubectl', sublabel: 'describe · logs --previous', role: 'cluster' }),
  ],
  reset: {
    keys: ['kubectl', 'kubelet', 'stateSlot', 'lastSlot', 'olderSlot', 'liveBox', 'prevBox', 'restartChip'],
    pods: ['podGroup'],
  },
};

// The Pod, the ground pair it shares with the Kubelet, and the dead instance inside it, stated in
// one place (A-16). The ground pair stays at 1 on every step, OVERRULING A-13 by request: the
// Kubelet at its far end is always up, and the exit report rides it while the Pod is down.
// The previous instance rests at notready EFFECTIVE: its own shade rises to 1 while the
// Pod itself is down, or the product 0.4 x 0.4 leaves its sublabel unreadable on crash and message.
const ground = (pod) => ({
  podGroup: pod, laneOut: 1, laneExit: 1,
  prevBox: pod === 1 ? OPACITY.notready : 1, olderSlot: OPACITY.notready,
});

// The three-fold static record every step pins in full (P-01 for the chip, T-30 for the rest).
const record = (state, last, live, prev) => ({
  sublabels: { stateSlot: state, lastSlot: last, liveBox: live, prevBox: prev },
});

export const STEPS_SPEC = [
  {
    id: 'idle',
    duration: 1500,
    chips: { restartChip: '1' },
    ...record(RUN_2, TERM_1, LIVE_2, KEPT_1),
    opacity: ground(1),
  },
  {
    id: 'crash',
    duration: 4500,
    narration: 'The process hits its memory limit and the kernel kills it. Kubelet spots the dead container and writes state as Terminated: a record carrying exitCode 137, reason OOMKilled, startedAt and finishedAt. It holds the live slot only until Kubelet turns to the restart, not until the new container runs.',
    chips: { restartChip: '1' },
    ...record(TERM_137, TERM_1, DEAD_2, KEPT_1),
    wires: { exit: 'exit 137', write: 'PATCH status · state Terminated' },
    opacity: ground(OPACITY.notready),
    // The slot is written when the ball lands, so it opens on what the step starts from (P-03).
    rewind: { sublabels: { stateSlot: RUN_2 } },
    flow: [
      // The container dies first: the Pod blinks and dims, then the exit report crosses to the
      // Kubelet, and the Kubelet carries it up into the record.
      F.pulse({ pod: 'podGroup' }),
      F.fade({ target: 'podGroup', from: 1, to: OPACITY.notready, dur: FADE.out, fill: 'both', easing: 'ease-in' }),
      F.segment({ ...LANE_EXIT, delay: BEAT.afterPulse, name: 'exit', lights: ['kubelet'] }),
      F.route({ points: WRITE_LANE, after: 'exit', name: 'write', lights: ['stateSlot'] }),
      F.set({ at: 'write', sublabels: { stateSlot: TERM_137 } }),
    ],
  },
  {
    id: 'message',
    duration: 2600,
    narration: 'A container can leave a note. Whatever it writes to terminationMessagePath, default /dev/termination-log, becomes the message field of that Terminated record. The terminationMessagePolicy defaults to File, and FallbackToLogsOnError takes the log tail instead when the file is empty after a failed exit.',
    chips: { restartChip: '1' },
    ...record(TERM_137, TERM_1, DEAD_2, KEPT_1),
    opacity: ground(OPACITY.notready),
    // The note is a field of the record the last step wrote: nothing travels and the Pod is
    // already down, so the record it belongs to lights through the static highlight alone (M-27).
    lit: ['stateSlot'],
  },
  {
    id: 'restart',
    duration: 5300,
    narration: 'Kubelet starts a fresh container in the same Pod and reports it. The record rolls over: state is Running again, the Terminated record moves into lastState, and what lastState held before is dropped. The restartCount becomes 2. On the Node the dead instance stays, container GC keeps one per container by default.',
    chips: { restartChip: '2' },
    ...record(RUN_3, TERM_137, LIVE_3, KEPT_2),
    wires: { out: 'restart', write: 'PATCH status · Running, roll lastState' },
    opacity: ground(1),
    lit: ['kubelet', 'restartChip'],
    // Every value the write produces opens on what the step starts from and turns over when the
    // ball that carries it lands (P-03), the containers on the restart order, the record on the write.
    rewind: { chips: { restartChip: '1' }, sublabels: { stateSlot: TERM_137, lastSlot: TERM_1, liveBox: DEAD_2, prevBox: KEPT_1 } },
    flow: [
      // Down-arrow order (M-16): the order lands, the fresh container comes up and the Pod blinks
      // with it, then the Kubelet reports the new state and the record rolls one slot along.
      F.segment({ ...LANE_OUT, delay: BEAT.lead, name: 'restart' }),
      F.fade({ target: 'podGroup', from: OPACITY.notready, to: 1, dur: FADE.in, at: 'restart', fill: 'both', easing: 'ease-out' }),
      F.pulse({ pod: 'podGroup', at: 'restart' }),
      F.set({ at: 'restart', sublabels: { liveBox: LIVE_3, prevBox: KEPT_2 } }),
      F.route({ points: WRITE_LANE, after: 'restart', name: 'write', lights: ['stateSlot'] }),
      F.set({ at: 'write', chips: { restartChip: '2' }, sublabels: { stateSlot: RUN_3 } }),
      F.segment({ ...ROLL_1, after: 'write', name: 'roll', lights: ['lastSlot'] }),
      F.light({ at: 'roll', targets: ['olderSlot'] }),
      F.set({ at: 'roll', sublabels: { lastSlot: TERM_137 } }),
    ],
  },
  {
    id: 'read',
    duration: 2600,
    narration: 'This is where to look. The live state says Running, so the container is fine right now and explains nothing. Running kubectl describe pod prints both records, State and Last State, and Last State holds the answer: a Terminated record with exitCode 137 and reason OOMKilled, which is why the previous instance died.',
    chips: { restartChip: '2' },
    ...record(RUN_3, TERM_137, LIVE_3, KEPT_2),
    wires: { corr: 'kubectl describe' },
    opacity: ground(1),
    lit: ['kubectl'],
    flow: [
      // kubectl self-initiates, so the lit source registers before the ball leaves (M-18).
      F.route({ points: CORRIDOR, delay: BEAT.lead, lights: ['stateSlot', 'lastSlot'] }),
    ],
  },
  {
    id: 'exitcodes',
    duration: 2600,
    narration: 'The exitCode names the cause. 0 is Completed, a clean exit. 1 is a generic application Error. Codes above 128 usually carry a signal: 137 is 128 plus 9 for SIGKILL, paired with reason OOMKilled when the kernel did it, and 143 is 128 plus 15 for SIGTERM. The number narrows the cause, the reason beside it names it.',
    chips: { restartChip: '2' },
    ...record(RUN_3, TERM_137, LIVE_3, KEPT_2),
    opacity: ground(1),
    // Decoding the code is a local lookup: nothing travels and the Pod is untouched, so the
    // record being read lights through the static highlight alone (M-27).
    lit: ['lastSlot'],
  },
  {
    id: 'logs',
    duration: 3200,
    narration: 'The record has no log. Running kubectl logs --previous asks for the log of the previous instance, and Kubelet reads it off the dead container on the Node. It works for one generation only: the next restart makes this instance the older one, container GC removes it, and its lastState record is overwritten too.',
    chips: { restartChip: '2' },
    ...record(RUN_3, TERM_137, LIVE_3, KEPT_2),
    wires: { corr: 'kubectl logs --previous', out: 'read log' },
    opacity: ground(1),
    lit: ['kubectl'],
    flow: [
      // The request reaches the API record, and the Kubelet on the Node answers it out of the dead
      // container it still holds: the API to Kubelet leg is the beat between the two balls. The
      // read into the Pod is a down-arrow, so the Pod blinks on its arrival (M-16).
      F.route({ points: CORRIDOR, delay: BEAT.lead, name: 'ask', lights: ['lastSlot'] }),
      F.light({ at: 'ask', targets: ['kubelet'] }),
      F.segment({ ...LANE_OUT, after: 'ask', name: 'readlog', lights: ['prevBox'] }),
      F.pulse({ pod: 'podGroup', at: 'readlog' }),
    ],
  },
];

export const init = defineCard(SCENE, STEPS_SPEC, { posterFirst: true });
