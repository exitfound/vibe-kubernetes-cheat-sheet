import { P, F, defineCard, laneY, midX, spread, shade, BEAT, OPACITY } from './network-kit.js';
import { g, rect, text } from '../../lib/svg.js';

// Design notes for this card: ./CARDS/network-kube-proxy-modes.md

// Content edges mirror about 600 and the chip strip centres by construction. The chain row is the
// one tier that does NOT centre: it has to start right of the panel edge.
const SCHEME_L = 40, SCHEME_R = 1160;

// The axis sits low enough that the Client Pod shell clears the narration panel.
const AXIS = 352;
const LANE_DY = 144;             // chain lane above the axis, hash lane the same distance below
const { out: TOP_Y, back: BOT_Y } = laneY(AXIS, LANE_DY);
const ROW_H = 56;                // chain box height, centred on its lane
const IPVS_H = 88;               // hash box height, centred on its lane
const POD_DY = LANE_DY / 2;
// Upper backend reached from above (the chain comes down), lower backend from below.
const { out: PODA_Y, back: PODB_Y } = laneY(AXIS, POD_DY);

const CLIENT_W = 196, CLIENT_H = 128;
const CLIENT_R = SCHEME_L + CLIENT_W;  // right edge, where both entry lanes leave
const POD_W = 200, POD_H = 104;
const POD_X = SCHEME_R - POD_W;        // backend column left edge

// The engine row starts at 420: the chain boxes sit ABOVE the panel bottom, so they clear its right edge.
const ENGINE_L = 420, ENGINE_W = 492, ENGINE_GAP = 24;
const ENGINE_R = ENGINE_L + ENGINE_W;  // shared right edge of the chain and the hash box
const KS = { x: ENGINE_L, w: 150 };
const SVC = { x: ENGINE_L + 150 + ENGINE_GAP, w: 150 };
const SEP = { x: ENGINE_L + 324 + ENGINE_GAP, w: ENGINE_R - (ENGINE_L + 348) };
const IPVS = { x: ENGINE_L, w: ENGINE_W };

// The pile `scale` reveals: three fading copies of the chain row on the SAME x segments, so a copy
// reads as a copy, with room left over the hash box so the two lanes stay separate.
const STACK_TOP = 252, STACK_H = 22, STACK_GAP = 36;
// Halving each step, so the pile RECEDES rather than reading as three more rows of equal weight.
const STACK_FADE = [0.52, 0.26, 0.13];

const ENTRY_X = midX(CLIENT_R, ENGINE_L);   // entry bend, centred in the client-to-engines gap
const TURN_X = midX(ENGINE_R, POD_X);       // delivery turn, centred in the engines-to-Pod gap
const PAUSE = 240;          // dwell inside each chain box, so the walk reads as sequential
// The chain gaps are too short for the 700ms floor: an explicit dur crosses them briskly and leaves
// PAUSE to say `stopping at each` (M-12).
const GAP_MS = 200;

// Three chips of a fixed width spanning the whole content band, so the strip centres on 600.
const CHIP_Y = 590, CHIP_H = 34, CHIP_W = 350;
const CHIPS = spread({ from: SCHEME_L, to: SCHEME_R, count: 3, w: CHIP_W });

// iptables hops: client -> KS (one zigzag), the two gaps, then SEP -> centred turn -> upper Pod.
const IPT_H1 = [[CLIENT_R, AXIS], [ENTRY_X, AXIS], [ENTRY_X, TOP_Y], [KS.x, TOP_Y]];
const IPT_H2 = [[KS.x + KS.w, TOP_Y], [SVC.x, TOP_Y]];
const IPT_H3 = [[SVC.x + SVC.w, TOP_Y], [SEP.x, TOP_Y]];
const IPT_H4 = [[ENGINE_R, TOP_Y], [TURN_X, TOP_Y], [TURN_X, PODA_Y], [POD_X, PODA_Y]];
// IPVS hops: client -> hash (one zigzag), then hash -> centred turn -> lower Pod (mirror of IPT_H4).
const IPVS_H1 = [[CLIENT_R, AXIS], [ENTRY_X, AXIS], [ENTRY_X, BOT_Y], [IPVS.x, BOT_Y]];
const IPVS_H2 = [[ENGINE_R, BOT_Y], [TURN_X, BOT_Y], [TURN_X, PODB_Y], [POD_X, PODB_Y]];

const POD_INNER = { dx: 18, dy: 28, w: POD_W - 36, h: 42, label: 'app', sublabel: 'eth0' };

// The chain repeated, once per Service, drawn as bare rects rather than boxes: they are the SAME row
// again and not new actors, so they take no label, no key and no `.scheme-box` semantics. Literal
// cyan for the same reason `netns-stack-band` is literal, since a bare rect resolves no role token.
function chainStack() {
  const grp = g({ class: 'ipt-stack' });
  STACK_FADE.forEach((a, r) => {
    for (const seg of [KS, SVC, SEP]) {
      grp.appendChild(rect({
        x: seg.x, y: STACK_TOP + r * STACK_GAP, width: seg.w, height: STACK_H, rx: 4,
        fill: `rgba(79,229,255,${(a * 0.09).toFixed(3)})`,
        stroke: `rgba(79,229,255,${a})`, 'stroke-width': 1,
      }));
    }
  });
  return grp;
}

// IPVS engine: a wide box whose body is a bucket grid, so it reads as one indexed hash table that
// does the work of the whole chain above it. No part kind draws a rect row, hence P.raw.
function ipvsEngine({ x, y, w, h }) {
  const grp = g({ class: 'scheme-box', 'data-role': 'network', transform: `translate(${x},${y})` });
  grp.appendChild(rect({ class: 'scheme-box-rect', x: 0, y: 0, width: w, height: h, rx: 6 }));
  grp.appendChild(text({ class: 'scheme-box-label', x: w / 2, y: 24, 'text-anchor': 'middle' }, ['IPVS hash table']));
  const n = 7, gx = 26, cw = (w - 52) / n, gy = 38, ch = 24;
  for (let c = 0; c < n; c++) {
    grp.appendChild(rect({
      class: 'scheme-grid-cell', x: gx + c * cw, y: gy, width: cw - 8, height: ch, rx: 3,
      fill: 'rgba(255,255,255,0.04)', stroke: 'currentColor', 'stroke-width': 1,
    }));
  }
  grp.appendChild(text({ class: 'scheme-box-sublabel', x: w / 2, y: h - 12, 'text-anchor': 'middle' }, ['virtual server -> real server']));
  return grp;
}

// Z-order: client + pods, then the two lanes, then the tags, then chips, then packets on top.
export const SCENE = {
  'aria-label': 'kube-proxy backend selection as two routes: the iptables route walks a chain KUBE-SERVICES to KUBE-SVC to KUBE-SEP box by box that grows O(n) with Services, while the IPVS route resolves a backend in one O(1) in-kernel hash lookup',
  parts: [
    P.defs(),
    P.pod({
      key: 'client', innerKey: 'clientBox', x: SCHEME_L, y: AXIS - CLIENT_H / 2, w: CLIENT_W, h: CLIENT_H,
      label: 'Client Pod', sublabel: '10.244.1.5',
      inner: { dx: 18, dy: 36, w: CLIENT_W - 36, h: 50, label: 'Socket', sublabel: 'dst 10.96.0.20' },
    }),
    P.pod({
      key: 'podA', innerKey: 'podABox', x: POD_X, y: PODA_Y - POD_H / 2, w: POD_W, h: POD_H,
      label: 'Pod web', sublabel: '10.244.2.7:8080', inner: POD_INNER,
    }),
    P.pod({
      key: 'podB', innerKey: 'podBBox', x: POD_X, y: PODB_Y - POD_H / 2, w: POD_W, h: POD_H,
      label: 'Pod web', sublabel: '10.244.3.9:8080', inner: POD_INNER,
    }),
    // iptables lane: chain boxes + a single zigzag entry, two gap arrows and one centred delivery
    // arrow down to the upper Pod, grouped so the lane dims as one. Every wire rides a gap.
    P.group({
      key: 'iptLane',
      parts: [
        P.raw({ key: 'iptStack', make: chainStack }),
        P.box({ key: 'ks', x: KS.x, y: TOP_Y - ROW_H / 2, w: KS.w, h: ROW_H, label: 'KUBE-SERVICES', sublabel: 'match dst :80' }),
        P.box({ key: 'svc', x: SVC.x, y: TOP_Y - ROW_H / 2, w: SVC.w, h: ROW_H, label: 'KUBE-SVC', sublabel: 'statistic random' }),
        P.box({ key: 'sep', x: SEP.x, y: TOP_Y - ROW_H / 2, w: SEP.w, h: ROW_H, label: 'KUBE-SEP', sublabel: 'DNAT .2.7' }),
        P.lane({ points: IPT_H1, dashed: true, dim: true }),
        P.lane({ points: IPT_H2, dashed: true, dim: true }),
        P.lane({ points: IPT_H3, dashed: true, dim: true }),
        P.lane({ points: IPT_H4, dashed: true, dim: true }),
      ],
    }),
    P.group({
      key: 'ipvsLane',
      parts: [
        P.raw({ key: 'ipvs', make: () => ipvsEngine({ x: IPVS.x, y: BOT_Y - IPVS_H / 2, w: IPVS.w, h: IPVS_H }) }),
        P.lane({ points: IPVS_H1, dashed: true, dim: true }),
        P.lane({ points: IPVS_H2, dashed: true, dim: true }),
      ],
    }),
    // Each lane carries one per-step tag. The tune hands the same <text> up under a second name,
    // because refs.wires is the setWire bucket and F.anim reaches for refs by key.
    P.wire({ key: 'ipt', x: ENGINE_L + ENGINE_W / 2, y: TOP_Y - ROW_H / 2 - 14, tune: (el, refs) => { refs.iptTag = el; } }),
    P.wire({ key: 'ipvs', x: ENGINE_L + ENGINE_W / 2, y: BOT_Y - IPVS_H / 2 - 14, tune: (el, refs) => { refs.ipvsTag = el; } }),
    P.chip({ key: 'iptChip', x: CHIPS.x(0), y: CHIP_Y, w: CHIP_W, h: CHIP_H, name: 'iptables', value: 'rule walk O(n)' }),
    P.chip({ key: 'pickChip', x: CHIPS.x(1), y: CHIP_Y, w: CHIP_W, h: CHIP_H, name: 'selection', value: 'one backend' }),
    P.chip({ key: 'ipvsChip', x: CHIPS.x(2), y: CHIP_Y, w: CHIP_W, h: CHIP_H, name: 'IPVS', value: 'hash O(1)' }),
    P.packets(),
  ],
  reset: {
    keys: ['ks', 'svc', 'sep', 'ipvs', 'iptChip', 'pickChip', 'ipvsChip', 'clientBox', 'podABox', 'podBBox'],
    pods: ['client', 'podA', 'podB'],
  },
};

// Both lanes and both backends at rest, with the pile DOWN: each mode step states which half it
// dims, and `scale` is the one step that raises the pile.
const ALL_UP = { iptLane: 1, ipvsLane: 1, podA: 1, podB: 1, iptStack: 0 };
// The complexity pair the two mode steps never move: only the scale step turns it over.
const BASE_COST = { iptChip: 'rule walk O(n)', ipvsChip: 'hash O(1)' };
// What the selection chip reads before a route has picked anything, so a mode step entered from
// either direction starts from no pick.
const NO_PICK = 'one backend';
const TAG_FADE = { keyframes: [{ opacity: 0 }, { opacity: 1 }], options: { duration: 440, fill: 'forwards', easing: 'ease-out' } };

export const STEPS_SPEC = [
  {
    id: 'idle',
    duration: 1500,
    chips: { ...BASE_COST, pickChip: NO_PICK },
    opacity: ALL_UP,
  },
  {
    id: 'iptables',
    duration: 4600,
    narration: 'In iptables mode the packet walks a chain box by box. It enters KUBE-SERVICES, jumps to the per-Service KUBE-SVC chain that picks an endpoint by statistic random, then a KUBE-SEP chain DNATs it to that Pod, here 10.244.2.7. The kernel walks these rules in sequence, so the chain grows O(n) with the number of Services.',
    // S-13: the static block states the END. The pick does not exist until KUBE-SVC makes it, so
    // `rewind` puts the chip back to the neutral reading `idle` states and `h2` turns it over.
    chips: { ...BASE_COST, pickChip: 'statistic random' },
    rewind: { chips: { pickChip: NO_PICK } },
    wires: { ipt: 'stops at every rule' },
    opacity: { ...ALL_UP, ...shade(['ipvsLane', 'podB'], OPACITY.notready) },
    lit: ['iptChip'],
    // The animated path says the upper backend was served by PULSING it, which no lights list names.
    reducedLit: ['podABox'],
    // Up-arrow: the client blinks first, then the ball stops at each chain box for a dwell before
    // the next hop, and the box lights as the ball lands on it.
    flow: [
      F.pulse({ pod: 'client' }),
      F.route({ points: IPT_H1, delay: BEAT.afterPulse, name: 'h1', lights: ['ks'] }),
      F.route({ points: IPT_H2, at: 'h1', plus: PAUSE, dur: GAP_MS, name: 'h2', lights: ['svc', 'pickChip'] }),
      F.set({ at: 'h2', chips: { pickChip: 'statistic random' } }),
      F.route({ points: IPT_H3, at: 'h2', plus: PAUSE, dur: GAP_MS, name: 'h3', lights: ['sep'] }),
      F.route({ points: IPT_H4, at: 'h3', plus: PAUSE, pulse: 'podA' }),
    ],
  },
  {
    id: 'ipvs',
    duration: 3500,
    narration: 'In IPVS mode the same kind of connection skips the walk. The Service is a virtual server and its endpoints are real servers in an in-kernel hash table, so a backend is found in one constant-time lookup no matter how many Services exist, here 10.244.3.9, scheduled with real algorithms like round-robin and least-connection.',
    // The same shape as `iptables`, deliberately: each mode step enters on NO_PICK and produces its own
    // answer (P-04).
    chips: { ...BASE_COST, pickChip: 'scheduler rr / lc' },
    rewind: { chips: { pickChip: NO_PICK } },
    wires: { ipvs: 'one hash lookup, any scale' },
    opacity: { ...ALL_UP, ...shade(['iptLane', 'podA'], OPACITY.notready) },
    lit: ['ipvsChip'],
    // The hash table is where the connection LANDS, so it lights on arrival through the flow and
    // never at entry: lighting it here would hide its own arrival. The Pod pulse has no static twin.
    reducedLit: ['podBBox'],
    flow: [
      F.pulse({ pod: 'client' }),
      F.route({ points: IPVS_H1, delay: BEAT.afterPulse, name: 'v1', lights: ['ipvs', 'pickChip'] }),
      F.set({ at: 'v1', chips: { pickChip: 'scheduler rr / lc' } }),
      F.route({ points: IPVS_H2, at: 'v1', plus: PAUSE, pulse: 'podB' }),
    ],
  },
  {
    id: 'scale',
    // The narration has a PANEL ceiling: one line more pushes the panel over the Client Pod. Re-measure
    // after any edit.
    duration: 4200,
    narration: 'Either mode turns the ClusterIP into a ready backend, and what scale exposes is the lookup. With thousands of Services the iptables chain is thousands of rules long and every new one slows the walk, while the IPVS hash stays one step. Large clusters long preferred IPVS for that, though Kubernetes deprecated it in v1.35, disables it by default in v1.40 and removes it in v1.43 in favour of nftables.',
    chips: { iptChip: 'thousands of rules', pickChip: 'unchanged by scale', ipvsChip: 'still one lookup' },
    wires: { ipt: 'grows with every Service', ipvs: 'constant time' },
    // S-13: the static block states the END, so the pile stands here and `rewind` puts it back down.
    opacity: { ...ALL_UP, iptStack: 1 },
    // What is true HERE is that selection is what scale does NOT touch. It must not say the two
    // modes select the same way: two earlier steps establish that they do not.
    lit: ['ks', 'svc', 'sep', 'ipvs', 'iptChip', 'ipvsChip', 'pickChip'],
    // The pile and both verdicts are already written above, so the animated path hides all three and
    // brings them up in order. The reduced path shows them standing, which is why this is a rewind.
    rewind: { opacity: { iptStack: 0, iptTag: 0, ipvsTag: 0 } },
    // The picture makes the argument before the words do: the chain repeats itself down the band
    // while the hash box does not move, and only then do the two verdicts land.
    flow: [
      F.reveal({ target: 'iptStack', delay: 260, name: 'grow' }),
      F.anim({ target: 'iptTag', ...TAG_FADE, after: 'grow' }),
      F.anim({ target: 'ipvsTag', ...TAG_FADE, after: 'grow', plus: 240 }),
    ],
  },
];

export const init = defineCard(SCENE, STEPS_SPEC, { posterFirst: true });
