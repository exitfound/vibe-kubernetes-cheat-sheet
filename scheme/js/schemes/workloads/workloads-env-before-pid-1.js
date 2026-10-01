import { P, F, defineCard, spread, strip, midX, WL, FADE, BEAT, OPACITY } from './workloads-kit.js';
import { g, rect, text } from '../../lib/svg.js';

// Design notes for this card: ./CARDS/workloads-env-before-pid-1.md

// An instrument, not the A / B / C column preset (WL.L-06): this card carries no ladder and no
// flanking chip column, and the argument for the arrangement is in the record. Panel measured at
// x<=396.55, y<=279.51 (worst of 1600/1280/1100, on the poster frame). The source row starts LEFT
// of that, a deliberate L-03 deviation, and the OPEN finding in the record has its cost per view.

// Band 1: the three sources, one per KIND of place a variable comes from. Three equal peers on an
// even pitch, so none of them reads as the ordinary case and the other two as exceptions. The row
// starts at 254 so its own midpoint IS WL.CX, and the spine of every lane hangs off that.
// 220 is set by the ENV STRIP, not by these six strings: every band takes this row's span, and 3
// chips across it hold 179.2 of name plus value. At 200 the strip is 201.33 and the widest pair
// overflows by 1.87, at 220 it is 221.33 and clears by 18.13. Padding is in the record.
const ROW_L = 254;                                       // WL.CX - (3 * SRC_W + 2 * SRC_GAP) / 2
const SRC_W = 220, SRC_GAP = 16, SRC_BOTTOM = WL.TOP_Y + WL.BOX_H;   // 120
const SRC_R = ROW_L + 3 * SRC_W + 2 * SRC_GAP;           // 946
const SRC = spread({ from: ROW_L, to: SRC_R, count: 3, w: SRC_W });  // 254 / 490 / 726
const SRC_CX = (i) => SRC.x(i) + SRC_W / 2;              // 364 / 600 / 836

// The spine is the source row midpoint and it LANDS ON WL.SPINE_X, which is what starting the row
// at 254 buys: a leg dropping straight out of its own source lands 364 / 600 / 836, a midpoint
// plus an L-12 mirrored pair about 600 alone, and every band under it centres on WL.CX with no
// turn anywhere. WL.L-07 pins the trunk to the 540..660 corridor and 600 sits inside it, which a
// row starting at 420 could not deliver.
const SPINE_X = midX(ROW_L, SRC_R);                      // 600, the row midpoint and WL.CX

// Band 2: the merge, the width of the source row and no wider.
const BAR_X = ROW_L, BAR_W = SRC_R - BAR_X;              // 254..946
const BAR_Y = 302, BAR_H = 62;                           // 302..364, 22.5 under the deepest panel
// Three straight drops onto the bar top face at -236 / 0 / +236 of its midpoint, no turn in any leg.
const LEG = [0, 1, 2].map(i => [[SRC_CX(i), SRC_BOTTOM], [SRC_CX(i), BAR_Y]]);

// Bands 3 and 4 share ONE span and it is the MERGE BOX span, so every band of the card ends on the
// same two x. That also makes the spine the midpoint of the rule, so its two halves are equal at
// 316, and the span centres on WL.CX so L-13 is met by construction. The rule is a chip height
// rather than a hairline, so the sentence it carries sits INSIDE it, split by the doorway.
const LOW_L = BAR_X, LOW_R = SRC_R;                      // 254..946
const WALL_Y = 388, WALL_H = 34, DOOR = 60;              // 388..422, 24 clear of the bar and the Pod
const WALL_L_W = SPINE_X - DOOR / 2 - LOW_L;             // 254..570
const WALL_R_X = SPINE_X + DOOR / 2;                     // 630..946
// 409, the baseline formula the phase rail of workloads-pod-startup-conditions puts its own on.
const WALL_TEXT_Y = WALL_Y + WALL_H / 2 + 4;
const WALL_CX = (x, w) => x + w / 2;                     // 412 and 788, each half its own centre

// Band 4: the container the set is handed to, and under it the set itself.
const POD_W = 480, POD_X = SPINE_X - POD_W / 2, POD_Y = 446, POD_H = 132;  // 360..840, 446..578
const CONT_W = 360, CONT_X = SPINE_X - CONT_W / 2, CONT_H = 68;
const CONT_Y = POD_Y + 34;                               // 480..548
// pod() puts the Pod sublabel on the baseline h - 8, whose ink runs to about 575, so the strip
// starts at 594 rather than tight under the shell. It shares the rule band, because the line the
// set crossed and the set itself are the two things that span everything.
const ENV_Y = 594;
// 221.33 each, which is not a LAYOUT.C.strip width because this strip takes the merge box span
// rather than L..R. Measured, the widest pair is `WEB_SERVICE_HOST` at 110.3 against `10.96.0.42`
// at 68.9, so 24 of padding leaves them 18.13 apart against a chipfit MIN_GAP of 4.
const ENV = strip({ from: LOW_L, to: LOW_R, count: 3, gap: 14 });

// The one crossing, straight down the spine and through the doorway, from the bar bottom midpoint
// to the Pod top midpoint. No turn anywhere on the card.
const HANDOVER = [[SPINE_X, BAR_Y + BAR_H], [SPINE_X, POD_Y]];
const WIRE_X = SPINE_X;                                  // over the middle source

// A wall segment is a hand-built chip, close to the phase rail of workloads-pod-startup-conditions
// but for one difference: the label has to be addressable per step, so the text is a P.tag laid
// over the rect rather than the label chip() carries. P.raw bypasses the kit binding, so the role
// is written by hand.
const wallSeg = (key, x, w) => P.raw({
  key,
  make: () => {
    const seg = g({ class: 'scheme-box', 'data-role': 'cluster', transform: `translate(${x},${WALL_Y})` });
    seg.appendChild(rect({ class: 'scheme-box-rect', x: 0, y: 0, width: w, height: WALL_H, rx: 4 }));
    return seg;
  },
});

// The list order IS the append order, so it is the z-order: lanes and the wire label first, then
// the environment strip and the packet layer, and wall / Pod / Kubelet / sources above the ball.
export const SCENE = {
  'aria-label': 'Config before PID 1: three different kinds of source feed one environment, the Kubelet merges them at launch, the whole set crosses the CreateContainer line exactly once, and an edit to the source afterwards never reaches the running process',
  parts: [
    P.defs(),
    // Three legs into one bar. Every leg carries a ball on some step, which is what earns it an
    // arrowhead (A-05), and nothing on this card ever travels upward, so there is no lane pair.
    ...LEG.map((points, i) => P.lane({ key: 'leg' + i, points, dim: true, dashed: true, role: 'cluster' })),
    P.lane({ key: 'handover', points: HANDOVER, dim: true, dashed: true, role: 'cluster' }),
    // WL.A-02: the per-step wire label sits ABOVE the top row, never below it.
    P.wire({ key: 'req', x: WIRE_X, y: WL.TOP_Y - 12 }),
    // The set as ONE group, because it is handed over as one thing and fades in as one thing.
    P.group({
      key: 'envSet',
      parts: [
        P.chip({ key: 'envDb', x: ENV.x(0), y: ENV_Y, w: ENV.w, h: WL.CHIP_H, name: 'DB_HOST', value: 'unset' }),
        P.chip({ key: 'envIp', x: ENV.x(1), y: ENV_Y, w: ENV.w, h: WL.CHIP_H, name: 'MY_POD_IP', value: 'unset' }),
        P.chip({ key: 'envSvc', x: ENV.x(2), y: ENV_Y, w: ENV.w, h: WL.CHIP_H, name: 'WEB_SERVICE_HOST', value: 'unset' }),
      ],
    }),
    P.packets(),
    // Appended AFTER the packet layer, so the ball runs under the wall, the Pod and the actors.
    wallSeg('wallL', LOW_L, WALL_L_W),
    wallSeg('wallR', WALL_R_X, LOW_R - WALL_R_X),
    // TWO captions, not one sentence halved: each half of the line states a rule of its own and
    // neither is a fragment of the other, so each is CENTRED in its own half rather than pushed
    // against the doorway, which is what a half of a broken sentence would need.
    P.tag({ key: 'wallTagL', x: WALL_CX(LOW_L, WALL_L_W), y: WALL_TEXT_Y, text: 'one call carries the whole set over' }),
    P.tag({ key: 'wallTagR', x: WALL_CX(WALL_R_X, LOW_R - WALL_R_X), y: WALL_TEXT_Y, text: 'nothing rewrites it short of a restart' }),
    P.pod({
      key: 'podGroup', id: 'podGroup',
      x: POD_X, y: POD_Y, w: POD_W, h: POD_H, label: 'Pod web-0', sublabel: 'no container yet', containers: 0,
      inner: { dx: CONT_X - POD_X, dy: CONT_Y - POD_Y, w: CONT_W, h: CONT_H, label: 'app', sublabel: 'container' },
    }),
    P.box({ key: 'barEl', x: BAR_X, y: BAR_Y, w: BAR_W, h: BAR_H, label: 'Kubelet', sublabel: 'waits for the container to start', role: 'cluster' }),
    P.box({ key: 'cmSrc', x: SRC.x(0), y: WL.TOP_Y, w: SRC_W, h: WL.BOX_H, label: 'ConfigMap app-config', sublabel: 'DB_HOST db.prod.svc', role: 'cluster' }),
    P.box({ key: 'podSrc', x: SRC.x(1), y: WL.TOP_Y, w: SRC_W, h: WL.BOX_H, label: 'Pod object', sublabel: 'status.podIP 10.244.1.5', role: 'cluster' }),
    P.box({ key: 'svcSrc', x: SRC.x(2), y: WL.TOP_Y, w: SRC_W, h: WL.BOX_H, label: 'Service web', sublabel: 'clusterIP 10.96.0.42', role: 'cluster' }),
  ],
  reset: {
    keys: ['cmSrc', 'podSrc', 'svcSrc', 'barEl', 'wallL', 'wallR', 'envDb', 'envIp', 'envSvc'],
    pods: ['podGroup'],
  },
};

// Values that recur, named once so a three-key chips block stays one readable line.
const UNSET = 'unset', DB = 'db.prod.svc', POD_IP = '10.244.1.5', SVC_IP = '10.96.0.42';
const EMPTY = { envDb: UNSET, envIp: UNSET, envSvc: UNSET };
const FILLED = { envDb: DB, envIp: POD_IP, envSvc: SVC_IP };
// The two sides of the line as FIELDS, so no step can lift one of them and leave the other behind.
const below = (live) => ({ envSet: live ? 1 : OPACITY.notready, podGroup: live ? 1 : OPACITY.notready });
const NO_CONTAINER = 'no container yet', RUNNING = 'PID 1 running with the environment';
// The source sublabel is stated by EVERY step, for the reason a chip value is: nothing in the
// reset restores it, so a step that leaves it unsaid shows the edited value on the way back.
const CM_LIVE = 'DB_HOST db.prod.svc', CM_EDITED = 'DB_HOST db.staging.svc';

export const STEPS_SPEC = [
  {
    id: 'idle',
    duration: 1500,
    chips: EMPTY,
    opacity: below(false),
    sublabels: { barEl: 'waits for the container to start', cmSrc: CM_LIVE },
    podSublabels: { podGroup: NO_CONTAINER },
  },
  {
    id: 'declare',
    duration: 3400,
    narration: 'One container asks for three variables and each comes from a different kind of place. DB_HOST is a key in a ConfigMap that somebody else owns and edits, MY_POD_IP comes off the Pod object itself through the downward API, and WEB_SERVICE_HOST is never asked for at all: the Kubelet adds a pair per Service on its own. None of the three is resolved yet.',
    chips: EMPTY,
    wires: { req: 'env, envFrom and valueFrom name only two of the three' },
    opacity: below(false),
    sublabels: { barEl: 'nothing assembled yet', cmSrc: CM_LIVE },
    podSublabels: { podGroup: NO_CONTAINER },
    lit: ['cmSrc', 'podSrc', 'svcSrc'],
  },
  {
    id: 'resolve',
    duration: 3200,
    narration: 'The Kubelet reads the objects the spec named, and it reads them at the moment it launches the container rather than at the moment the Pod was created. DB_HOST takes whatever the key holds at that instant, and a Secret is opened the same way. The Pod IP costs no read at all, because the Kubelet is already holding the Pod object that carries it.',
    chips: EMPTY,
    wires: { req: 'GET ConfigMap app-config · status.podIP needs no read' },
    opacity: below(false),
    sublabels: { barEl: 'reads the ConfigMap, holds the Pod object', cmSrc: CM_LIVE },
    podSublabels: { podGroup: NO_CONTAINER },
    lit: ['cmSrc', 'podSrc'],
    flow: [
      F.route({ points: LEG[0], lights: ['barEl'] }),
      F.route({ points: LEG[1], delay: 300, lights: ['barEl'] }),
    ],
  },
  {
    id: 'snapshot',
    duration: 3400,
    narration: 'On top of what the spec asked for, and unless enableServiceLinks is false, the Kubelet writes a pair of variables for every Service in this namespace that has a cluster IP right now, WEB_SERVICE_HOST and WEB_SERVICE_PORT for a Service named web. That list is a snapshot, so a Service created one second later is simply absent from this container. DNS is the way out of that ordering trap.',
    chips: EMPTY,
    wires: { req: 'Service web exists now · WEB_SERVICE_HOST and _PORT' },
    opacity: below(false),
    sublabels: { barEl: 'adds a pair per Service with a cluster IP', cmSrc: CM_LIVE },
    podSublabels: { podGroup: NO_CONTAINER },
    lit: ['svcSrc'],
    flow: [
      F.route({ points: LEG[2], delay: BEAT.lead, lights: ['barEl'] }),
    ],
  },
  {
    id: 'handover',
    duration: 3600,
    narration: 'The whole set crosses in one call. CreateContainer carries it, PID 1 starts with the variables already in its environment, and no second call of that kind is ever made for this container. What the downward API can send across has a limit worth knowing: a named label or annotation comes through, but the whole metadata.labels map is available only as a file in a downwardAPI volume.',
    chips: FILLED,
    wires: { req: 'CreateContainer · the set crosses · StartContainer' },
    opacity: below(true),
    sublabels: { barEl: 'the set is out of its hands', cmSrc: CM_LIVE },
    podSublabels: { podGroup: RUNNING },
    // The bar sends and the wall is the act, so both light at entry. The Pod is the receiver.
    lit: ['barEl', 'wallL', 'wallR'],
    flow: [
      F.route({ points: HANDOVER, name: 'create', delay: BEAT.lead }),
      // Down-arrow: the ball lands first, then the Pod blinks and lifts out of its dimmest shade.
      F.pulse({ pod: 'podGroup', at: 'create' }),
      F.fade({ target: 'podGroup', from: OPACITY.notready, to: 1, dur: FADE.in, at: 'create', fill: 'both', easing: 'ease-out' }),
      // One fade for the whole strip, because the set arrives as one thing and not as three.
      F.fade({ target: 'envSet', from: OPACITY.notready, to: 1, dur: FADE.in, at: 'create', fill: 'both', easing: 'ease-out' }),
    ],
  },
  {
    id: 'frozen',
    duration: 3400,
    narration: 'Somebody edits the ConfigMap. The Kubelet sees it, because it watches, and the object above the line now says something the copy below the line does not. A mounted volume would pick the new value up on the next sync and a downwardAPI volume behaves the same way after a resize, but a variable is a copy taken once, and only a restarted container reads it again.',
    // The three variables are deliberately NOT lit and NOT changed: that they did not move is the
    // whole sentence of the step, and the source sublabel above the line now disagrees with them.
    chips: FILLED,
    wires: { req: 'watch · ConfigMap app-config modified' },
    opacity: below(true),
    sublabels: { barEl: 'holds the new value and cannot deliver it', cmSrc: CM_EDITED },
    podSublabels: { podGroup: RUNNING },
    lit: ['cmSrc', 'wallL', 'wallR'],
    flow: [
      // The update is self-initiated by the API and DIES at the Kubelet: no crossing follows, and
      // the empty doorway under it is what the step is about.
      F.route({ points: LEG[0], delay: BEAT.lead, lights: ['barEl'] }),
    ],
  },
];

export const init = defineCard(SCENE, STEPS_SPEC, { posterFirst: true });
