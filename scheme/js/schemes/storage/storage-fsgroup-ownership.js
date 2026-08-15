import { P, F, defineCard, BEAT, packetArrival } from './storage-kit.js';
import { podShell } from '../../lib/primitives.js';
// Design notes for this card: ./CARDS.md#storage-fsgroup-ownership


const CONTENT_CX = 600;

const POD_W = 226, POD_H = 126;          // the storage-category Pod standard (storage-csi-attach-mount)
const KUBE_W = 232, KUBE_H = 70;         // the storage-category server-box standard (storage-csi-architecture)
const TREE_W = 340, TREE_H = 152;
const CYL_W = 150, CYL_H = 70;
const CHIP_H = 32;
const CORRIDOR = 40;                     // Pod to kubelet, kubelet to tree: the two carrying corridors
const DISK_GAP = 30;                     // tree to disk: a relationship, so it sits tighter
const CHIP_GAP_V = 28;                   // disk to chip strip, with the disk caption in between

const STACK_H = POD_H + CORRIDOR + KUBE_H + CORRIDOR + TREE_H + DISK_GAP + CYL_H + CHIP_GAP_V + CHIP_H;
const STACK_TOP = (640 - STACK_H) / 2;   // 26, and the bottom margin matches it

const POD_Y = STACK_TOP;                                 // 26
const POD_X = CONTENT_CX - POD_W / 2;                    // 487
const POD_BOTTOM = POD_Y + POD_H;                        // 152
const POD_RIGHT = POD_X + POD_W;                         // 713
const POD_CY = POD_Y + POD_H / 2;                        // 89

const KUBE_Y = POD_BOTTOM + CORRIDOR;                    // 192
const KUBE_X = CONTENT_CX - KUBE_W / 2;                  // 484
const KUBE_TOP = KUBE_Y, KUBE_BOTTOM = KUBE_Y + KUBE_H;  // 192 / 262

const TREE_Y = KUBE_BOTTOM + CORRIDOR;                   // 302
const TREE_X = CONTENT_CX - TREE_W / 2;                  // 430
const TREE_BOTTOM = TREE_Y + TREE_H;                     // 454
const TREE_CY = TREE_Y + TREE_H / 2;                     // 378
const TREE_RIGHT = TREE_X + TREE_W;                      // 770

const CYL_Y = TREE_BOTTOM + DISK_GAP;                    // 484
const CYL_X = CONTENT_CX - CYL_W / 2;                    // 525
const CYL_BOTTOM = CYL_Y + CYL_H;                        // 554

const DISK_LBL_Y = CYL_BOTTOM + 18;                      // 572, 10 clear of the chip strip
const CHIPS_Y = CYL_BOTTOM + CHIP_GAP_V;                 // 582

const IN_INSET = 16, IN_W = POD_W - IN_INSET * 2, IN_H = 42;   // 194 wide
const IN_APP_DY = 26, IN_SEC_DY = 76;                          // 26..68 and 76..118, 8 clear of the floor

const ROW_COUNT = 3, ROW_H = 24, ROW_GAP = 10, ROW_PAD = 16;
const ROW_X = TREE_X + ROW_PAD;                          // 446
const ROW_W = TREE_W - ROW_PAD * 2;                      // 308
const ROW_TOP = TREE_Y + 52;                             // 354, 14 below the tree sublabel baseline
const rowY  = i => ROW_TOP + i * (ROW_H + ROW_GAP);      // 354 / 388 / 422
const rowCy = i => rowY(i) + ROW_H / 2;                  // 366 / 400 / 434

const ROW_NAMES = ['/data', 'app.log', '... 4.2M more'];
const OWNER_BEFORE = 'root:root';
// After the chown the top-level DIRECTORY carries setgid and the plain file does not, which is what
// fsGroup actually does: it sets the group and adds g+rwX everywhere, and setgid on directories only.
const OWNER_AFTER = ['root:2000 g+s', 'root:2000', 'root:2000'];

// The tree label and sublabel are re-anchored to the TOP of the box after construction, because
// box() centres them and the listing owns the middle.
const TREE_LBL_Y = 22, TREE_SUB_Y = 38;

const W_SEC_KUBE = [[CONTENT_CX, POD_BOTTOM], [CONTENT_CX, KUBE_TOP]];
const W_CHOWN    = [[CONTENT_CX, KUBE_BOTTOM], [CONTENT_CX, TREE_Y]];
const WRITE_X = 800;                                     // 30 clear of the tree, 87 clear of the Pod
const W_WRITE = [[POD_RIGHT, POD_CY], [WRITE_X, POD_CY], [WRITE_X, TREE_CY], [TREE_RIGHT, TREE_CY]];

const W_PERSIST = [[CONTENT_CX, TREE_BOTTOM], [CONTENT_CX, CYL_Y]];

// The walk continues straight down the spine THROUGH the listing, so the chown and the walk read as
// one movement that carries on into the tree rather than as two unrelated balls.
const WALK_Y0 = TREE_Y + 44;                             // 346, just under the tree sublabel
const walkEndY = only => (only >= ROW_COUNT ? rowY(ROW_COUNT - 1) + ROW_H : rowCy(only - 1) + 12);
const W_WALK = [[CONTENT_CX, WALK_Y0], [CONTENT_CX, walkEndY(ROW_COUNT)]];

const WALK_SPEED = 0.068, WALK_MIN_MS = 420;
const walkDur = only => Math.max(WALK_MIN_MS, Math.round((walkEndY(only) - WALK_Y0) / WALK_SPEED));

const CHIP_W = 300, CHIP_GAP = 16, CHIP_COUNT = 3;
const CHIPS_W = CHIP_W * CHIP_COUNT + CHIP_GAP * (CHIP_COUNT - 1);   // 932
const CHIP_X = Array.from({ length: CHIP_COUNT }, (_, i) =>
  CONTENT_CX - CHIPS_W / 2 + i * (CHIP_W + CHIP_GAP));               // 134 / 450 / 766

// Lift the tree caption off the middle of the box: the listing lives there. Two SVG attributes,
// which no field writes, on elements the box kind does not hand back.
const liftTreeCaption = (el) => {
  const lbl = el.querySelector('.scheme-box-label');
  if (lbl) lbl.setAttribute('y', TREE_LBL_Y);
  const sub = el.querySelector('.scheme-box-sublabel');
  if (sub) sub.setAttribute('y', TREE_SUB_Y);
};

// The listing rows, as chips: one name, one value, lighting as a unit when the scan reaches them.
// They stay ARRAYS the seven enter hooks read as rows[n]: a scalar key adds a `chips: rowN=...` line per step.
const row = (i) => P.chip({
  x: ROW_X, y: rowY(i), w: ROW_W, h: ROW_H, name: ROW_NAMES[i], value: OWNER_BEFORE,
  tune: (el, refs) => {
    refs.rows = [...(refs.rows || []), el];
    refs.rowOwners = [...(refs.rowOwners || []), el.valueText];
  },
});

// The Pod carries TWO peer inner boxes against P.pod's single `inner`, so the shell is a raw part
// inside the group rather than a P.pod: a P.pod with no inner would wrap the shell in a second g.
const appShell = () => podShell({
  x: POD_X, y: POD_Y, w: POD_W, h: POD_H, label: 'Pod app-0', containers: 0, role: 'storage',
});

// Z-order, bottom to top: the disk and the tree, the listing on it, kubelet and the Pod, the five
// wires, the disk caption, the chip strip, then the packet layer.
export const SCENE = {
  'aria-label': 'fsGroup and volume ownership: a freshly mounted volume is owned by root so a non-root container cannot write to it, and securityContext.fsGroup makes Kubelet chown and setgid the whole volume tree to that GID before the container starts, while fsGroupChangePolicy OnRootMismatch checks only the top-level directory and skips the walk when it already matches, which stops a volume of millions of files adding minutes to every Pod start the way the default policy Always does',
  parts: [
    P.defs(),
    // The primitive centres the label on the raw bbox, which reads high because the top cap ellipse
    // is not part of the visible front face. Re-centre on the face.
    P.cylinder({ key: 'cyl', x: CYL_X, y: CYL_Y, w: CYL_W, h: CYL_H, label: 'PV app', labelY: CYL_H / 2 + 10 }),
    P.box({ key: 'tree', x: TREE_X, y: TREE_Y, w: TREE_W, h: TREE_H, label: 'Volume tree', sublabel: 'owned root:root', tune: liftTreeCaption }),
    row(0), row(1), row(2),
    P.box({ key: 'kube', x: KUBE_X, y: KUBE_Y, w: KUBE_W, h: KUBE_H, label: 'Kubelet', sublabel: 'applies fsGroup before start' }),
    P.group({
      key: 'appPod',
      parts: [
        P.raw({ make: appShell }),
        P.box({ key: 'appBox', x: POD_X + IN_INSET, y: POD_Y + IN_APP_DY, w: IN_W, h: IN_H, label: 'app', sublabel: 'runAsUser: 1000' }),
        P.box({ key: 'secBox', x: POD_X + IN_INSET, y: POD_Y + IN_SEC_DY, w: IN_W, h: IN_H, label: 'securityContext', sublabel: 'fsGroup not set' }),
      ],
    }),
    P.lane({ points: W_SEC_KUBE, dashed: true, dim: true }),
    P.lane({ points: W_CHOWN, dashed: true, dim: true }),
    P.lane({ points: W_WRITE, dashed: true, dim: true }),
    P.lane({ points: W_WALK, dashed: true, dim: true }),
    P.lane({ points: W_PERSIST, dashed: true, dim: true }),
    P.wire({ key: 'disk', x: CONTENT_CX, y: DISK_LBL_Y }),
    P.chip({ key: 'ownerChip', x: CHIP_X[0], y: CHIPS_Y, w: CHIP_W, h: CHIP_H, name: 'owner', value: 'root:root' }),
    P.chip({ key: 'writeChip', x: CHIP_X[1], y: CHIPS_Y, w: CHIP_W, h: CHIP_H, name: 'write', value: 'denied' }),
    P.chip({ key: 'policyChip', x: CHIP_X[2], y: CHIPS_Y, w: CHIP_W, h: CHIP_H, name: 'fsGroupChangePolicy', value: 'unset' }),
    P.packets(),
  ],
  reset: {
    keys: ['kube', 'cyl', 'tree', 'appBox', 'secBox', 'ownerChip', 'writeChip', 'policyChip'],
    pods: ['appPod'],
  },
};

// Every step writes EVERY chip. A chip left unset keeps the previous step's value, which is how a
// card comes to report 'write: allowed' on the step that is explaining that the write is refused.
const chips = (owner, write, policy) => ({ ownerChip: owner, writeChip: write, policyChip: policy });

// The rows are the one part of this card no field can reach, so their per-step END state is written
// through the step escape, on BOTH paths, and the animated path winds it back in walkMarks.
const showRows = (chowned, visited) => (s) => {
  s.refs.rowOwners.forEach((ow, i) => { ow.textContent = chowned ? OWNER_AFTER[i] : OWNER_BEFORE; });
  s.refs.rows.forEach((r, i) => r.classList.toggle('highlight', i < visited));
};

// The scan itself. Its timers hang on the ROW, not the svg, so no flow verb reproduces them: F.run
// at delay 0 runs INLINE and registers nothing (at() in scheme-kit), so the loop keeps its position.
const walkMarks = ({ delay, only, chown }) => (s, ctx) => {
  const endY = walkEndY(only), dur = walkDur(only);
  s.refs.rows.forEach(r => r.classList.remove('highlight'));
  for (let i = 0; i < only; i++) {
    const t = Math.round(delay + dur * (rowCy(i) - WALK_Y0) / (endY - WALK_Y0));
    if (chown) s.refs.rowOwners[i].textContent = OWNER_BEFORE;
    // Empty keyframes: a timer must name no property, or every row the scan has not reached yet
    // sits on its own composited layer. Reasoning at lightBoxAt in scheme-kit.js.
    const mark = s.refs.rows[i].animate([], { duration: 1, delay: t });
    mark.onfinish = () => {
      s.refs.rows[i].classList.add('highlight');
      if (chown) s.refs.rowOwners[i].textContent = OWNER_AFTER[i];
    };
    ctx.register(mark);
  }
};

// The ball and the row timers start together, and an F.run fn cannot read the flow arrival map, so
// the start is ONE card number both take: on the chown step, where the chown ball lands plus a hop.
const WALK_AT = packetArrival(W_CHOWN) + BEAT.afterHop;   // 800
const walk = ({ delay = 0, only = ROW_COUNT, chown = false } = {}) => [
  F.segment({ from: [CONTENT_CX, WALK_Y0], to: [CONTENT_CX, walkEndY(only)], delay, dur: walkDur(only), name: 'walk' }),
  F.run({ fn: walkMarks({ delay, only, chown }) }),
];

export const STEPS_SPEC = [
  {
    id: 'idle',
    duration: 1500,
    chipsCued: chips('root:root', 'denied', 'unset'),
    sublabels: { secBox: 'fsGroup not set', tree: 'owned root:root' },
    wires: { disk: 'created root:root' },
    enter: showRows(false, 0),
  },
  {
    id: 'denied',
    duration: 2800,
    narration: 'Start the Pod with no fsGroup and it comes up, but the first write to the volume fails with permission denied. The disk is fine, the mount is fine. The ownership is simply wrong for a non-root process, and nothing in the container can fix a root-owned tree.',
    chipsCued: chips('root:root', 'denied', 'unset'),
    sublabels: { secBox: 'fsGroup not set', tree: 'owned root:root' },
    wires: { disk: 'created root:root' },
    enter: showRows(false, 0),
    // The tree lights only when the write actually gets there, so the cue hangs off the route
    // arrival rather than sitting in `lit` at step entry.
    flow: [
      F.pulse({ pod: 'appPod' }),
      F.route({ points: W_WRITE, delay: BEAT.afterPulse, name: 'write' }),
      F.tag({ text: 'EACCES', points: W_WRITE, delay: BEAT.afterPulse }),
      F.light({ targets: ['tree'], at: 'write' }),
    ],
  },
  {
    id: 'fsgroup',
    duration: 2800,
    narration: 'The fix is one field. Setting securityContext.fsGroup: 2000 asks Kubernetes to make the volume usable by group 2000, and every container in the Pod is added to that supplemental group. Kubelet reads this before it ever starts the container.',
    // The policy becomes meaningful the moment fsGroup is set, and its default is Always. It was
    // 'unset' up to here because with no fsGroup there is nothing for a change policy to govern.
    chipsCued: chips('root:root', 'denied', 'Always (default)'),
    sublabels: { secBox: 'fsGroup: 2000', tree: 'owned root:root' },
    wires: { disk: 'created root:root' },
    lit: ['secBox'],
    enter: showRows(false, 0),
    flow: [
      F.pulse({ pod: 'appPod' }),
      F.route({ points: W_SEC_KUBE, delay: BEAT.afterPulse, name: 'read' }),
      F.tag({ text: 'fsGroup: 2000', points: W_SEC_KUBE, delay: BEAT.afterPulse }),
      F.light({ targets: ['kube'], at: 'read' }),
    ],
  },
  {
    id: 'chown',
    // 4200 rather than 3400: adding the persist hop down to the volume pushed the step's own motion
    // to 3631ms, and a duration under that would auto-advance while the change was still in flight.
    duration: 4200,
    narration: 'Before the container starts, Kubelet walks the volume tree and chowns every entry to group 2000, setting the setgid bit on directories so new files inherit it too. The owner stays root, the group becomes 2000. This is real work on real inodes, done once at mount time.',
    chipsCued: chips('root:2000 g+s', 'denied', 'Always (default)'),
    sublabels: { secBox: 'fsGroup: 2000', tree: 'chown + setgid, entry by entry' },
    wires: { disk: 'now group 2000' },
    // kubelet is the SOURCE here, so it is lit from step entry. Only destinations wait for a ball.
    lit: ['kube'],
    enter: showRows(true, ROW_COUNT),
    flow: [
      F.route({ points: W_CHOWN }),
      F.tag({ text: 'chown -R :2000', points: W_CHOWN }),
      ...walk({ delay: WALK_AT, chown: true }),
      F.light({ targets: ['tree'], at: 'walk' }),
      F.route({ points: W_PERSIST, after: 'walk', name: 'persist' }),
      F.tag({ text: 'persisted', points: W_PERSIST, after: 'walk' }),
      F.light({ targets: ['cyl'], at: 'persist' }),
    ],
  },
  {
    id: 'writes',
    duration: 3000,
    narration: 'Now the container starts and its first write succeeds. Its process is in group 2000, the tree is group 2000, and the setgid bit keeps every new file in the same group. The permission problem is gone, paid for once at startup.',
    chipsCued: chips('root:2000 g+s', 'allowed', 'Always (default)'),
    sublabels: { secBox: 'fsGroup: 2000', tree: 'owned root:2000, setgid' },
    wires: { disk: 'now group 2000' },
    enter: showRows(true, 0),
    flow: [
      F.pulse({ pod: 'appPod' }),
      F.route({ points: W_WRITE, delay: BEAT.afterPulse, name: 'write' }),
      F.tag({ text: 'write ok', points: W_WRITE, delay: BEAT.afterPulse }),
      F.light({ targets: ['tree', 'cyl'], at: 'write' }),
    ],
  },
  {
    id: 'always',
    duration: 3200,
    narration: 'There is a cost. The default policy, Always, walks and re-checks the entire tree on every single Pod start. On a small volume that is nothing. On a volume with millions of files it can add minutes to each start, and the Pod sits waiting the whole time.',
    // The policy value does not change here: Always was already in force. This step explains what
    // it costs, and inventing a new chip value to make something light would be a lie.
    chipsCued: chips('root:2000 g+s', 'allowed', 'Always (default)'),
    sublabels: { secBox: 'fsGroup: 2000', tree: 'every start re-checks all of it' },
    wires: { disk: 're-read on every start' },
    // The policy chip is the subject of this step, so it lights even though its value did not
    // change. Static highlight, not a flash: chips never blink.
    lit: ['policyChip', 'cyl'],
    enter: showRows(true, ROW_COUNT),
    // The scan runs the whole listing again and nothing changes as a result, which IS the point:
    // the work is paid whether or not it was needed.
    flow: [
      ...walk(),
      F.light({ targets: ['tree'], at: 'walk' }),
    ],
  },
  {
    id: 'onmismatch',
    duration: 3000,
    narration: 'The fsGroupChangePolicy: OnRootMismatch setting is the escape. Kubelet checks only the ownership of the top-level directory. If it already matches the expected fsGroup, it assumes the tree was set on a previous start and skips the walk entirely. The next start is fast no matter how many files sit below.',
    chipsCued: chips('root:2000 g+s', 'allowed', 'OnRootMismatch'),
    sublabels: { secBox: 'fsGroup: 2000', tree: 'top dir matches, walk skipped' },
    wires: { disk: 'set on a previous start' },
    lit: ['cyl'],
    // Only the top directory is visited, so only its row lights on either path.
    enter: showRows(true, 1),
    flow: [
      ...walk({ only: 1 }),
      F.light({ targets: ['tree'], at: 'walk' }),
    ],
  },
];

export const init = defineCard(SCENE, STEPS_SPEC, { posterFirst: true });
