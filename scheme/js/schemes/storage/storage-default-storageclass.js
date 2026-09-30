import { P, F, defineCard, OPACITY, BEAT, STO, makeRidingLabel } from './storage-kit.js';
// Design notes for this card: ./CARDS/storage-default-storageclass.md


const CX = STO.CX;                                    // 600, the four claims sit symmetric about it

// Actor blocks take the catalog size (NET.L-01): 232 by 80.
const BOX_W = 232, BOX_H = 80;

// The claims row, in creation order left to right. A 32 gap puts the outer two at 204 and 996,
// mirrored about CX, so the admission pair reaches them over two buses of equal length.
const CLAIM_GAP = 32;
const CLAIM_Y = 380, CLAIM_BOTTOM = CLAIM_Y + BOX_H;          // 380 / 460
const claimCx = (i) => CX + (i - 1.5) * (BOX_W + CLAIM_GAP);  // 204 / 468 / 732 / 996
const A_CX = claimCx(0), B_CX = claimCx(1), C_CX = claimCx(2), D_CX = claimCx(3);

// The admission plugin stands on CX right of the panel wall (x 484 clears 397), in the top band.
const ADM_X = CX - BOX_W / 2, ADM_Y = 96;
const ADM_RIGHT = ADM_X + BOX_W, ADM_BOTTOM = ADM_Y + BOX_H;   // 716 / 176
const ADM_MID = ADM_Y + BOX_H / 2;                            // 136
const LANE = 12;                                              // the mirrored pair off the admission floor
// The left bus stays below y 300, so no lane or tag enters the x<=380, y<=300 corner of the panel.
const BUS_Y = 318;                                            // 62 above the claim tops

// The class catalog: three rows in creation order, centred on the admission mid height so the
// relation between them is one straight hop into the middle row.
const CHAIN_X = 772, CHAIN_W = 296, ROW_GAP = 8;         // the widest row inks 261.9 at 1600x1000
const CHAIN_Y = ADM_MID - (3 * STO.CHIP_H + 2 * ROW_GAP) / 2; // 77
const CAPTION_Y = CHAIN_Y - 12;                               // 65

// The bottom band: the classless volume under the claim bound to it, the controller under data-c.
// Both stand on one band top, 80 under the claims, so the card keeps three bands.
const CTRL_Y = 540;
const PV_W = 180, PV_H = 86, PV_Y = CTRL_Y;
const SPEC_Y = PV_Y + 62;                                     // a line under the cylinder name

const W_ADM_TO_A = [[CX - LANE, ADM_BOTTOM], [CX - LANE, BUS_Y], [A_CX, BUS_Y], [A_CX, CLAIM_Y]];
const W_ADM_TO_D = [[CX + LANE, ADM_BOTTOM], [CX + LANE, BUS_Y], [D_CX, BUS_Y], [D_CX, CLAIM_Y]];
const W_CTRL_TO_C = [[C_CX, CTRL_Y], [C_CX, CLAIM_BOTTOM]];
// The plugin reads the flags of EVERY class, so its line meets a bracket spanning all three rows
// rather than the face of the middle one, which would read as the plugin reading fast alone.
const BRACKET_X = CHAIN_X - 12;
const rowMid = (i) => CHAIN_Y + i * (STO.CHIP_H + ROW_GAP) + STO.CHIP_H / 2;   // 94 / 136 / 178
const W_READ = [[ADM_RIGHT, ADM_MID], [BRACKET_X, ADM_MID]];
const W_BRACKET = [[CHAIN_X, rowMid(0)], [BRACKET_X, rowMid(0)], [BRACKET_X, rowMid(2)], [CHAIN_X, rowMid(2)]];
const W_BOUND = [[B_CX, CLAIM_BOTTOM], [B_CX, PV_Y]];

// Each tag lives exactly as long as its ball (M-30a) and emerges once clear of the box it leaves.
const TAG = makeRidingLabel({ role: 'storage', inMs: 200, outMs: 200, hold: 0, emergeMode: true });
// On the admission trunk the tag stands off the lane on the side away from its twin, 34 out.
const STAMP_DX = 34, STAMP_EMERGE = 300;
// The controller hop is 80 units: a tagged ball rides the catalog 1500, the tag trails under it so
// it lands in the gap below data-c, and it emerges once the ball has lifted it off the controller.
const LEG_DUR = 1500;
const RETRO_TAG = { dy: 16, dx: 26, dur: LEG_DUR, emerge: 700, fn: TAG };

// Family z-order: blocks and the disk, then relations, lanes and captions, then the class catalog and
// the Bound caption, then the packet layer.
export const SCENE = {
  'aria-label': 'Default StorageClass: a claim created with no storageClassName gets the class annotated as default written into it by the DefaultStorageClass admission plugin, a claim that sets storageClassName to an empty string is left alone and binds only to a volume with no class, a claim created while no default exists stays unset, and while it is still unbound the PV binding controller writes the new default into it once one appears, and while two classes are default during a migration a new claim gets the most recently created one, so data-a ends on standard, data-b on the empty string, data-c on fast and data-d on ultra',
  parts: [
    P.defs(),
    P.box({ key: 'adm', x: ADM_X, y: ADM_Y, w: BOX_W, h: BOX_H, label: 'DefaultStorageClass', sublabel: 'admission, kube-apiserver' }),
    P.box({ key: 'pvcA', x: A_CX - BOX_W / 2, y: CLAIM_Y, w: BOX_W, h: BOX_H, label: 'PVC data-a', sublabel: 'not created yet' }),
    P.box({ key: 'pvcB', x: B_CX - BOX_W / 2, y: CLAIM_Y, w: BOX_W, h: BOX_H, label: 'PVC data-b', sublabel: 'not created yet' }),
    P.box({ key: 'pvcC', x: C_CX - BOX_W / 2, y: CLAIM_Y, w: BOX_W, h: BOX_H, label: 'PVC data-c', sublabel: 'not created yet' }),
    P.box({ key: 'pvcD', x: D_CX - BOX_W / 2, y: CLAIM_Y, w: BOX_W, h: BOX_H, label: 'PVC data-d', sublabel: 'not created yet' }),
    P.box({ key: 'ctrl', x: C_CX - BOX_W / 2, y: CTRL_Y, w: BOX_W, h: BOX_H, label: 'PV binding controller', sublabel: 'kube-controller-manager' }),
    P.cylinder({ key: 'pvCyl', x: B_CX - PV_W / 2, y: PV_Y, w: PV_W, h: PV_H, label: 'PV nfs-01' }),
    P.tag({ x: B_CX, y: SPEC_Y, text: '10Gi, no class' }),
    // Nothing travels either relation: the plugin reads the flags, and the Bound link is a pairing.
    P.relation({ key: 'readRel', points: W_READ }),
    P.relation({ key: 'bracket', points: W_BRACKET }),
    P.relation({ key: 'boundRel', points: W_BOUND, opacity: 0 }),
    P.lane({ key: 'wAdmA', points: W_ADM_TO_A, dashed: true, dim: true }),
    P.lane({ key: 'wAdmD', points: W_ADM_TO_D, dashed: true, dim: true }),
    P.lane({ key: 'wCtrlC', points: W_CTRL_TO_C, dashed: true, dim: true }),
    P.tag({ x: CHAIN_X + CHAIN_W / 2, y: CAPTION_Y, anchor: 'middle', text: 'lit row = is-default-class: "true"' }),
    P.chain({
      key: 'chain', x: CHAIN_X, y: CHAIN_Y, w: CHAIN_W, rowH: STO.CHIP_H, gap: ROW_GAP,
      items: [
        'StorageClass standard, created 2024-05',
        'StorageClass fast, created 2025-02',
        'StorageClass ultra, created 2026-03',
      ],
    }),
    P.wire({ key: 'bound', x: B_CX + 12, y: (CLAIM_BOTTOM + PV_Y) / 2 + 4, anchor: 'start' }),
    P.packets(),
  ],
  reset: { keys: ['adm', 'ctrl', 'pvcA', 'pvcB', 'pvcC', 'pvcD', 'pvCyl'] },
};

const NOT_YET = 'not created yet';
const STD = 'storageClassName: standard';
const EMPTY = 'storageClassName: ""';
const UNSET = 'no storageClassName';
const FAST = 'storageClassName: fast';
const ULTRA = 'storageClassName: ultra';
const subs = (a, b, c, d) => ({ pvcA: a, pvcB: b, pvcC: c, pvcD: d });

// STO.S-01 as a field: the four claims are born mid-story, and the Bound link with data-b, so each
// is pinned on EVERY step. A claim not created yet stands at pending (C-14). Lanes are never dimmed.
const LANES = { readRel: 1, bracket: 1, wAdmA: 1, wAdmD: 1, wCtrlC: 1 };
const stage = (a, b, c, d, bound) => ({
  ...LANES,
  pvcA: a ? 1 : OPACITY.pending, pvcB: b ? 1 : OPACITY.pending,
  pvcC: c ? 1 : OPACITY.pending, pvcD: d ? 1 : OPACITY.pending,
  boundRel: bound ? 1 : 0,
});
// The admin edits an annotation first, and what follows reads the new flags a beat later.
const FLAG_AT = 300;
const AFTER_FLAG = FLAG_AT + BEAT.lead;
// data-b is stored first, and the binding controller pairs it once it is there.
const BOUND_AT = 1400;
// A claim is stored the moment it is admitted: it comes up from pending on the beat that makes it.
const bornAt = (target, when = {}) => F.fade({ target, from: OPACITY.pending, to: 1, dur: 500, fill: 'forwards', easing: 'ease-out', ...when });

export const STEPS_SPEC = [
  {
    id: 'idle',
    duration: 1500,
    sublabels: subs(NOT_YET, NOT_YET, NOT_YET, NOT_YET),
    opacity: stage(false, false, false, false, false),
    chain: [0],
  },
  {
    id: 'omitted',
    duration: 3200,
    narration: 'PVC data-a leaves storageClassName out. On its way into the API server the DefaultStorageClass admission plugin looks for the class annotated storageclass.kubernetes.io/is-default-class: "true", finds standard, and writes it into the claim before the claim is stored.',
    sublabels: subs(STD, NOT_YET, NOT_YET, NOT_YET),
    opacity: stage(true, false, false, false, false),
    chain: [0],
    lit: ['adm'],
    rewind: { sublabels: { pvcA: NOT_YET }, opacity: { pvcA: OPACITY.pending } },
    flow: [
      F.route({ points: W_ADM_TO_A, delay: BEAT.lead, name: 'stamp', lights: ['pvcA'] }),
      F.tag({ text: 'standard', points: W_ADM_TO_A, delay: BEAT.lead, dx: -STAMP_DX, emerge: STAMP_EMERGE, fn: TAG }),
      bornAt('pvcA', { at: 'stamp' }),
      F.set({ at: 'stamp', sublabels: { pvcA: STD } }),
    ],
  },
  {
    id: 'empty',
    duration: 3200,
    narration: 'PVC data-b sets storageClassName: "" on purpose. An empty string is a value, so the plugin leaves it alone: the claim asks for no class at all. The binding controller can pair it only with a volume that has no class either, here the pre-created PV nfs-01.',
    sublabels: subs(STD, EMPTY, NOT_YET, NOT_YET),
    wires: { bound: 'Bound' },
    opacity: stage(true, true, false, false, true),
    chain: [0],
    lit: ['pvcB'],
    rewind: { wires: { bound: '' }, opacity: { pvcB: OPACITY.pending, boundRel: 0 } },
    flow: [
      bornAt('pvcB'),
      F.fade({ target: 'boundRel', from: 0, to: 1, dur: 600, fill: 'forwards', easing: 'ease-out', delay: BOUND_AT }),
      // The binding controller makes the pairing, so it lights with the link it writes.
      F.light({ targets: ['ctrl', 'pvCyl'], delay: BOUND_AT }),
      F.set({ delay: BOUND_AT, wires: { bound: 'Bound' } }),
    ],
  },
  {
    id: 'gap',
    duration: 3200,
    narration: 'To switch defaults the admin first removes the annotation from standard. PVC data-c, created in that gap, gets no class written in. A claim like it could still bind a volume that has no class, but nfs-01 is already bound, so data-c waits Pending with no class.',
    sublabels: subs(STD, EMPTY, UNSET, NOT_YET),
    wires: { bound: 'Bound' },
    opacity: stage(true, true, true, false, true),
    chain: [],
    rewind: { chain: [0], sublabels: { pvcC: NOT_YET }, opacity: { pvcC: OPACITY.pending } },
    flow: [
      F.set({ delay: FLAG_AT, chain: [] }),
      bornAt('pvcC', { delay: AFTER_FLAG }),
      F.set({ delay: AFTER_FLAG, sublabels: { pvcC: UNSET } }),
      F.light({ targets: ['pvcC'], delay: AFTER_FLAG }),
    ],
  },
  {
    id: 'retro',
    duration: 3600,
    narration: 'Then the admin annotates fast. The PV binding controller finds unbound claims that still have no storageClassName and writes the new default into them, so data-c gets fast. The empty string on data-b stays, and data-a keeps standard: a class, once written, does not follow the default.',
    sublabels: subs(STD, EMPTY, FAST, NOT_YET),
    wires: { bound: 'Bound' },
    opacity: stage(true, true, true, false, true),
    chain: [1],
    lit: ['ctrl'],
    rewind: { chain: [], sublabels: { pvcC: UNSET } },
    flow: [
      F.set({ delay: FLAG_AT, chain: [1] }),
      F.route({ points: W_CTRL_TO_C, delay: AFTER_FLAG, dur: LEG_DUR, name: 'retro', lights: ['pvcC'] }),
      F.tag({ text: 'fast', points: W_CTRL_TO_C, delay: AFTER_FLAG, ...RETRO_TAG }),
      F.set({ at: 'retro', sublabels: { pvcC: FAST } }),
    ],
  },
  {
    id: 'overlap',
    duration: 3400,
    narration: 'The other order annotates the new class before removing the old flag, so for a short migration window fast and ultra are both default. PVC data-d, created in that window, gets the most recently created of the two: ultra. Outside a migration, keep just one default.',
    sublabels: subs(STD, EMPTY, FAST, ULTRA),
    wires: { bound: 'Bound' },
    opacity: stage(true, true, true, true, true),
    chain: [1, 2],
    lit: ['adm'],
    rewind: { chain: [1], sublabels: { pvcD: NOT_YET }, opacity: { pvcD: OPACITY.pending } },
    flow: [
      F.set({ delay: FLAG_AT, chain: [1, 2] }),
      F.route({ points: W_ADM_TO_D, delay: AFTER_FLAG, name: 'stamp', lights: ['pvcD'] }),
      F.tag({ text: 'ultra', points: W_ADM_TO_D, delay: AFTER_FLAG, dx: STAMP_DX, emerge: STAMP_EMERGE, fn: TAG }),
      bornAt('pvcD', { at: 'stamp' }),
      F.set({ at: 'stamp', sublabels: { pvcD: ULTRA } }),
    ],
  },
];

export const init = defineCard(SCENE, STEPS_SPEC, { posterFirst: true });
