import { P, F, defineCard, ladder, strip, spread, midX, laneOf, CLU, LAYOUT, BEAT, FADE, OPACITY } from './cluster-kit.js';

// Design notes for this card: ./CARDS/cluster-node-restart.md

// Layout C, ladder right, Node frame under the panel. Panel x<=397 y<=230 against a frame at 380,
// so NO NARRATION MAY PASS 360 CHARACTERS. The three Pods are three fates, not three replicas.
const M = CLU.M;
const CONTENT_L = M, CONTENT_R = 1200 - M;               // 60 / 1140
const CX = midX(CONTENT_L, CONTENT_R);                   // 600, the canvas centre by construction

// Top row: the two pieces of Node software whose restart is its own event. The Kubelet sits on CX
// so the lane below it is one straight drop, the runtime takes the right wall like systemd does.
const BOX_W = CLU.BOX_W, BOX_H = CLU.BOX_H;              // 232 / 80
const TOP_Y = CLU.TOP_Y, TOP_BOTTOM = TOP_Y + BOX_H;     // 40 / 120
const TOP_CY = midX(TOP_Y, TOP_BOTTOM);                  // 80
const KUBE_X = CX - BOX_W / 2, KUBE_R = KUBE_X + BOX_W;  // 484..716
const RT_X = CONTENT_R - BOX_W;                          // 908..1140

const LADDER_X = LAYOUT.C.ladder.x, LADDER_W = LAYOUT.C.ladder.w;   // 660..1140, right of the drop
const LADDER_Y = 148, ROW_H = CLU.ROW_H, ROW_GAP = CLU.ROW_GAP;     // 5 rows -> 148..348

const NODE_X = CONTENT_L, NODE_W = CONTENT_R - CONTENT_L;// 60..1140
const NODE_Y = 380, NODE_H = CLU.NODE.H;                 // 380..532, the CLU.L-01 family
const POD_W = 300, POD_H = CLU.NODE.POD_H, POD_Y = NODE_Y + CLU.NODE.POD_DY;   // 414..520
const POD_PAD = 24;
// Fixed WIDTH, derived gap: three 300-wide Pods inset by POD_PAD leave 66 between them.
const POD_X = spread({ from: NODE_X + POD_PAD, to: CONTENT_R - POD_PAD, count: 3, w: POD_W }).x;  // 84/450/816
const POD_INNER = { dx: 30, w: POD_W - 60, dy: 28, h: 52 };

// Chips as a bottom strip, THREE per row: 350.67 is what LAYOUT.C.strip.three names, and the
// widest name and value pair on this card clears it by 30.
const CHIP_H = CLU.CHIP_H, CHIP_GAP = 14, CHIP_VGAP = 8, CHIP_COLS = 3;
const CHIPS_Y = NODE_Y + NODE_H + 16;                    // 548, second row ends on 624
const CHIP_COL = strip({ from: CONTENT_L, to: CONTENT_R, count: CHIP_COLS, gap: CHIP_GAP });
const CHIP_W = CHIP_COL.w;                               // 350.67
const CHIP_ROW = ladder({ y: CHIPS_Y, rowH: CHIP_H, gap: CHIP_VGAP });
// The strip is read as a GRID: the index wraps across the three columns and steps down every third.
const CHIP_X = i => CHIP_COL.x(i % CHIP_COLS);
const CHIP_Y = i => CHIP_ROW(Math.floor(i / CHIP_COLS));

// ONE lane, addressed to the Node frame rather than to a Pod inside it: WHICH Pods the Kubelet
// brings back is carried by the pulses, not by a fan of taps into the Pod row.
const RECREATE_LANE = [[CX, TOP_BOTTOM], [CX, NODE_Y]];
// The Kubelet drives the runtime over CRI on every step and on none of them does that exchange
// carry what a step narrates, so it is a relation and takes no arrowhead (A-05, A-06).
const CRI_RELATION = [[KUBE_R, TOP_CY], [RT_X, TOP_CY]];

// Both registers sit on one line in the 348..380 band, one on each side of the drop, so no glyph
// ever lands on the lane. 368 centres the 14.6 unit glyph box in that band.
const WIRE_Y = 368;
const WIRE_ACT_X = CX + 14, WIRE_BRANCH_X = CX - 14;     // 614 anchored start / 586 anchored end

// Three Pods, three fates. The sublabel is the OWNERSHIP, because ownership is what decides which
// of them survives a Node that stays away too long.
const PODS = [
  { key: 'podWeb',   name: 'web-0',       owner: 'owned by ReplicaSet web-7d4' },
  { key: 'podAgent', name: 'node-agent',  owner: 'static Pod · run by the Kubelet' },
  { key: 'podDbg',   name: 'debug-shell', owner: 'standalone · nothing owns it' },
];

// The list order IS the append order, so it is the z-order: the CRI relation and the drop, the two
// wire registers, the six chips, the packet layer, the ladder, the frame and its Pods, actors last.
export const SCENE = {
  'aria-label': 'Node restart and reboot: a Kubelet restart leaving the running containers in place, a container runtime restart usually doing the same, a reboot stopping every container first, the Node reporting NotReady and able to carry the not-ready taint until the Kubelet, the runtime and the network are ready, the Kubelet recreating the containers of the Pods still bound to it, and a standalone Pod deleted while the Node was away never coming back',
  parts: [
    P.defs(),
    P.relation({ key: 'cri', points: CRI_RELATION, dash: '5 5' }),
    P.lane({ key: 'dropLane', points: RECREATE_LANE, dim: true, dashed: true }),
    P.wire({ key: 'act', x: WIRE_ACT_X, y: WIRE_Y, anchor: 'start' }),
    P.wire({ key: 'branch', x: WIRE_BRANCH_X, y: WIRE_Y, anchor: 'end' }),
    // Row 1 is the thesis: the same three chips hold all card, because the difference between the
    // three events is the reason the card exists rather than a state that moves through it.
    P.chip({ key: 'rtChip',    x: CHIP_X(0), y: CHIP_Y(0), w: CHIP_W, h: CHIP_H, name: 'runtime restart', value: 'containers usually stay up' }),
    P.chip({ key: 'kubeChip',  x: CHIP_X(1), y: CHIP_Y(1), w: CHIP_W, h: CHIP_H, name: 'Kubelet restart', value: 'containers stay up' }),
    P.chip({ key: 'bootChip',  x: CHIP_X(2), y: CHIP_Y(2), w: CHIP_W, h: CHIP_H, name: 'Node reboot',     value: 'every container stops' }),
    // Row 2 is the state this card walks.
    P.chip({ key: 'condChip',  x: CHIP_X(3), y: CHIP_Y(3), w: CHIP_W, h: CHIP_H, name: 'Node condition', value: 'Ready' }),
    P.chip({ key: 'taintChip', x: CHIP_X(4), y: CHIP_Y(4), w: CHIP_W, h: CHIP_H, name: 'Taint',          value: 'none' }),
    P.chip({ key: 'boundChip', x: CHIP_X(5), y: CHIP_Y(5), w: CHIP_W, h: CHIP_H, name: 'Pod objects bound', value: '3' }),
    P.packets(),
    P.chain({
      key: 'chain', x: LADDER_X, y: LADDER_Y, w: LADDER_W, rowH: ROW_H, gap: ROW_GAP,
      items: [
        // Single spaces around the separator, MEASURED: SVG collapses a run of whitespace, so the
        // padded columns the sibling ladders type in their source do not reach the screen.
        '1. three events · runtime restart, Kubelet restart, reboot',
        '2. reboot · every container on the Node stops first',
        '3. back up · NotReady until Kubelet, runtime, network',
        '4. recreate · Kubelet restores the Pods still bound here',
        '5. or replaced · down too long, only a controller replaces a Pod',
      ],
    }),
    P.node({ key: 'nodeEl', x: NODE_X, y: NODE_Y, w: NODE_W, h: NODE_H, label: 'Node-1' }),
    ...PODS.map((p, i) => P.pod({
      key: p.key, id: p.key, innerKey: `${p.key}Box`,
      x: POD_X(i), y: POD_Y, w: POD_W, h: POD_H, label: 'Pod', sublabel: '', containers: 0,
      inner: { ...POD_INNER, label: p.name, sublabel: p.owner },
    })),
    // Top-row blocks ABSOLUTE LAST.
    P.box({ key: 'runtime', x: RT_X,   y: TOP_Y, w: BOX_W, h: BOX_H, label: 'Container runtime', sublabel: 'containerd or CRI-O' }),
    P.box({ key: 'kubelet', x: KUBE_X, y: TOP_Y, w: BOX_W, h: BOX_H, label: 'Kubelet',           sublabel: 'on Node-1' }),
  ],
  reset: {
    keys: [
      'kubelet', 'runtime', 'rtChip', 'kubeChip', 'bootChip', 'condChip', 'taintChip', 'boundChip',
      // S-19: a highlight put on a Pod INNER box is cleared by name here, never by `pods`.
      ...PODS.map(p => `${p.key}Box`),
    ],
    pods: PODS.map(p => p.key),
  },
};

const DOWN = OPACITY.notready, GONE = OPACITY.terminated;
const POD_KEYS = PODS.map(p => p.key);
// The Node-side software and the two lanes that join it are stated in ONE place, so a lane can
// never outshine the box it leaves (A-13, A-16). The frame itself never fades: it is the machine.
const stage = ({ soft = 1, web = 1, agent = 1, dbg = 1 } = {}) => ({
  kubelet: soft, runtime: soft,
  cri: laneOf(soft, soft),
  dropLane: laneOf(soft, OPACITY.running),
  podWeb: web, podAgent: agent, podDbg: dbg,
});

// The branch sign, one grammar catalog-wide (T-35). Steps 5 and 6 show what the SAME Node comes
// back to when it came back late, so the machine stays up and only the Pod roster differs.
const BRANCH = 'if instead the Node stays down past the toleration';

// Every step writes every chip. The first three are the thesis and never move, the last three are
// what the reboot does to the Node object.
const EVENTS = { rtChip: 'containers usually stay up', kubeChip: 'containers stay up', bootChip: 'every container stops' };
const READY = { ...EVENTS, condChip: 'Ready', taintChip: 'none', boundChip: '3' };
const PAUSED = { ...EVENTS, condChip: 'heartbeats paused', taintChip: 'none', boundChip: '3' };
const NOT_READY = { ...EVENTS, condChip: 'NotReady', taintChip: 'node.kubernetes.io/not-ready:NoExecute', boundChip: '3' };

export const STEPS_SPEC = [
  {
    id: 'idle',
    duration: 1500,
    chips: READY,
    opacity: stage(),
    // Idle baseline: nothing is happening yet, no ladder row highlighted.
    chain: -1,
  },
  {
    id: 'three-events',
    duration: 3200,
    narration: 'Three different events get run together under one word and they are not the same thing. A Kubelet restart leaves the already running containers in place, and so does a container runtime restart in the configuration most of them run with. A reboot is the most disruptive of the three: it is both of the others at once.',
    chips: READY,
    opacity: stage(),
    // Packet-less and Pod-less, so the highlight alone carries the beat (M-27). The two actors and
    // the three thesis chips are the whole step: nothing has happened to the Node yet.
    lit: ['kubelet', 'runtime', 'rtChip', 'kubeChip', 'bootChip'],
    chain: 0,
  },
  {
    id: 'reboot',
    duration: 2800,
    narration: 'The machine reboots. Every container on the Node stops first, and the Kubelet and the container runtime go down with it. The Pod objects are untouched and still bound to this Node, but nothing is running here and the heartbeats pause until the Kubelet is back and has finished initializing.',
    chips: PAUSED,
    // Pin the final state inline so a cancel between steps does not flash to default. Everything
    // Node-side sits at notready: the Pod objects are alive in the API, they are just not serving.
    opacity: stage({ soft: DOWN, web: DOWN, agent: DOWN, dbg: DOWN }),
    lit: ['condChip'],
    chain: 1,
    // Containers first, then the software, which is the order the reference states. Nothing pulses:
    // a reboot signals nobody, so there is no beat for a Pod to answer (M-08).
    flow: [
      ...POD_KEYS.map(k => F.fade({ target: k, to: DOWN, dur: FADE.out })),
      F.fade({ target: 'kubelet', to: DOWN, dur: FADE.out, delay: 400 }),
      F.fade({ target: 'runtime', to: DOWN, dur: FADE.out, delay: 400 }),
      F.fade({ target: 'cri', to: DOWN, dur: FADE.out, delay: 400 }),
      F.fade({ target: 'dropLane', to: DOWN, dur: FADE.out, delay: 400 }),
    ],
  },
  {
    id: 'back-up',
    duration: 2800,
    narration: 'The machine boots. The Kubelet starts, renews its Lease and reconciles the Node status, and the Node is reported NotReady until the Kubelet, the container runtime and the network are all ready. While it is NotReady it can carry the taint node.kubernetes.io/not-ready.',
    chips: NOT_READY,
    // Pin the final state. The software is back, the containers are not: that gap is the step.
    opacity: stage({ web: DOWN, agent: DOWN, dbg: DOWN }),
    lit: ['kubelet', 'runtime', 'condChip', 'taintChip'],
    chain: 2,
    // Two beats, in the order the reference lists them: the Kubelet comes up, then the runtime and
    // the link between them. Nothing travels yet, because nothing has been recreated to travel to.
    flow: [
      F.fade({ target: 'kubelet', from: DOWN, to: 1, dur: FADE.in, easing: 'ease-out' }),
      F.fade({ target: 'runtime', from: DOWN, to: 1, dur: FADE.in, delay: FADE.in, easing: 'ease-out' }),
      F.fade({ target: 'cri', from: DOWN, to: 1, dur: FADE.in, delay: FADE.in, easing: 'ease-out' }),
      F.fade({ target: 'dropLane', from: DOWN, to: 1, dur: FADE.in, delay: FADE.in, easing: 'ease-out' }),
    ],
  },
  {
    id: 'recreate',
    duration: 3000,
    narration: 'The Kubelet recreates the containers of the Pods still bound to this Node, and the Node goes Ready. The static Pod node-agent comes back with nothing else involved: it is managed by the Kubelet directly, without the API server observing it, so no controller has to place it again.',
    chips: READY,
    wires: { act: 'recreate the containers of the bound Pods' },
    opacity: stage(),
    lit: ['kubelet', 'condChip', 'taintChip'],
    chain: 3,
    // S-13: the static block states the END. Nothing is running again until the Kubelet acts, so the
    // two chips it earns wind back to what back-up left and turn over when the ball lands.
    rewind: { chips: { condChip: 'NotReady', taintChip: 'node.kubernetes.io/not-ready:NoExecute' } },
    // Down-arrow: the ball travels first and every Pod blinks on its arrival (M-16). The Pods rise
    // out of notready on the same beat, so the ordinary pulse reads and pulsePodDim is not needed.
    flow: [
      F.route({ points: RECREATE_LANE, delay: BEAT.lead, name: 'start' }),
      F.set({ at: 'start', chips: { condChip: 'Ready', taintChip: 'none' } }),
      ...POD_KEYS.map(k => F.pulse({ pod: k, at: 'start' })),
      ...POD_KEYS.map(k => F.fade({ target: k, from: DOWN, to: 1, dur: FADE.in, at: 'start', easing: 'ease-out' })),
    ],
  },
  {
    id: 'replaced',
    duration: 3200,
    narration: 'If instead the Node stays down past the configured toleration period, the control plane evicts a Pod that does not tolerate the not-ready taint, and it is already gone by the time the machine returns. A ReplicaSet owns Pod web-0, so a replacement was created at once and the Scheduler may have put it on a different Node.',
    chips: { ...READY, boundChip: '2 · web-0 deleted' },
    wires: { branch: BRANCH },
    // Pin the final state. The machine is up and the two survivors hold full strength, so the one
    // Pod at OPACITY.terminated reads as gone rather than as one more thing in a dimmed picture.
    opacity: stage({ web: GONE }),
    lit: ['boundChip'],
    chain: 4,
    // S-13: the static block states the END, so the count winds back to what step 4 left and turns
    // over when the Pod has actually gone rather than 1500ms before it (P-03).
    rewind: { chips: { boundChip: '3' } },
    // BEAT.lead first, so the caption and the sentence land before the Pod goes. No ball and no
    // pulse: no control-plane block stands here, and a DELETE that landed while the Node was away.
    flow: [
      F.fade({ target: 'podWeb', to: GONE, dur: FADE.out, delay: BEAT.lead, name: 'gone' }),
      F.set({ at: 'gone', chips: { boundChip: '2 · web-0 deleted' } }),
    ],
  },
  {
    id: 'standalone',
    duration: 3000,
    narration: 'Pod debug-shell went the same way, and nothing brings it back: a standalone Pod is not recreated after deletion. The static Pod is the opposite case, because deleting its mirror Pod through the API does not remove the static Pod the Kubelet runs. Run what has to survive a reboot under a controller.',
    chips: { ...READY, boundChip: '1 · debug-shell deleted' },
    wires: { branch: BRANCH },
    // Pin the final state, and it is the frame the card ends on: two ghosts and the one Pod the
    // Kubelet owns outright, still at full strength on a Node that is running again.
    opacity: stage({ web: GONE, dbg: GONE }),
    lit: ['boundChip', 'podAgentBox'],
    chain: 4,
    rewind: { chips: { boundChip: '2 · web-0 deleted' } },
    flow: [
      F.fade({ target: 'podDbg', to: GONE, dur: FADE.out, delay: BEAT.lead, name: 'gone' }),
      F.set({ at: 'gone', chips: { boundChip: '1 · debug-shell deleted' } }),
    ],
  },
];

export const init = defineCard(SCENE, STEPS_SPEC, { posterFirst: true });
