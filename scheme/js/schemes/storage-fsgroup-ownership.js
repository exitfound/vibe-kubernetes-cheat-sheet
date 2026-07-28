import { svg, g, text } from '../lib/svg.js';
import { arrowDefs, box, pod, cylinder, pathArrow } from '../lib/primitives.js';
import { valChip, setVal, setBoxSublabel, pulsePod, routePacket, segmentPacket, makeInit, clearHighlights, clearWires, setWire, BEAT, lightBoxAt, makeRidingLabel } from '../lib/storage-kit.js';
// Design notes for this card: scheme/docs/CARDS.md#storage-fsgroup-ownership


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

// The tag that rides a ball on this card. Constants preserved from its hand-rolled copy.
const ridingLabel = makeRidingLabel({ role: 'storage' });

function podBlock({ x, y }) {
  const shell = pod({ x, y, w: POD_W, h: POD_H, label: 'Pod app-0', containers: 0, role: 'storage' });
  const shellRect = shell.querySelector('.scheme-pod-rect');
  if (shellRect) shellRect.style.fill = 'rgba(255, 255, 255, 0.03)';
  const appBox = box({
    x: x + IN_INSET, y: y + IN_APP_DY, w: IN_W, h: IN_H,
    label: 'app', sublabel: 'runAsUser: 1000', role: 'storage',
  });
  const secBox = box({
    x: x + IN_INSET, y: y + IN_SEC_DY, w: IN_W, h: IN_H,
    label: 'securityContext', sublabel: 'fsGroup not set', role: 'storage',
  });
  const group = g({});
  group.appendChild(shell);
  group.appendChild(appBox);
  group.appendChild(secBox);
  return { group, appBox, secBox };
}

class Scene {
  constructor(host) { this.host = host; this.refs = {}; this.build(); }

  build() {
    this.host.replaceChildren();
    this.refs = {};
    const root = svg({
      class: 'diagram',
      viewBox: '0 0 1200 640',
      preserveAspectRatio: 'xMidYMid meet',
      'aria-label': 'fsGroup and volume ownership: a volume mounts owned by root so a non-root container cannot write, and securityContext.fsGroup makes Kubelet chown and setgid the whole volume tree to that GID before the container starts, while fsGroupChangePolicy OnRootMismatch checks only the top-level directory and skips the walk when it already matches, which stops a volume of millions of files adding minutes to every Pod start whereas the default Always always walks, and a CSI driver advertising VOLUME_MOUNT_GROUP applies the fsGroup itself so Kubelet does no walk at all',
      'data-style': 'outline',
    });
    root.appendChild(arrowDefs());

    const appPod = podBlock({ x: POD_X, y: POD_Y });
    const kube = box({
      x: KUBE_X, y: KUBE_Y, w: KUBE_W, h: KUBE_H,
      label: 'Kubelet', sublabel: 'applies fsGroup before start', role: 'storage',
    });

    const tree = box({
      x: TREE_X, y: TREE_Y, w: TREE_W, h: TREE_H,
      label: 'Volume tree', sublabel: 'owned root:root', role: 'storage',
    });
    // Lift the tree caption off the middle of the box: the listing lives there.
    const treeLbl = tree.querySelector('.scheme-box-label');
    if (treeLbl) treeLbl.setAttribute('y', TREE_LBL_Y);
    const treeSub = tree.querySelector('.scheme-box-sublabel');
    if (treeSub) treeSub.setAttribute('y', TREE_SUB_Y);

    // The listing rows, as chips: one name, one value, lighting as a unit when the scan reaches them.
    const rows = [], rowOwners = [];
    for (let i = 0; i < ROW_COUNT; i++) {
      const row = valChip({
        x: ROW_X, y: rowY(i), w: ROW_W, h: ROW_H,
        name: ROW_NAMES[i], value: OWNER_BEFORE, role: 'storage',
      });
      rows.push(row); rowOwners.push(row.valueText);
    }

    const cyl = cylinder({ x: CYL_X, y: CYL_Y, w: CYL_W, h: CYL_H, label: 'PV-app', role: 'storage' });
    // The primitive centres the label on the raw bbox, which reads high because the top cap ellipse
    // is not part of the visible front face. Re-centre on the face.
    const cylLbl = cyl.querySelector('.scheme-cylinder-label');
    if (cylLbl) cylLbl.setAttribute('y', CYL_H / 2 + 10);

    const wires = [W_SEC_KUBE, W_CHOWN, W_WRITE, W_WALK, W_PERSIST]
      .map(points => pathArrow({ points, dashed: true, dim: true, role: 'storage' }));

    const diskLbl = text({ class: 'scheme-label code dim', x: CONTENT_CX, y: DISK_LBL_Y, 'text-anchor': 'middle' }, [' ']);

    const ownerChip  = valChip({ x: CHIP_X[0], y: CHIPS_Y, w: CHIP_W, h: CHIP_H, name: 'owner', value: 'root:root', role: 'storage' });
    const writeChip  = valChip({ x: CHIP_X[1], y: CHIPS_Y, w: CHIP_W, h: CHIP_H, name: 'write', value: 'denied', role: 'storage' });
    const policyChip = valChip({ x: CHIP_X[2], y: CHIPS_Y, w: CHIP_W, h: CHIP_H, name: 'fsGroupChangePolicy', value: 'unset', role: 'storage' });

    const packetLayer = g({ id: 'packetLayer' });

    [cyl, tree].forEach(el => root.appendChild(el));
    rows.forEach(r => root.appendChild(r));
    [kube, appPod.group].forEach(el => root.appendChild(el));
    wires.forEach(el => root.appendChild(el));
    root.appendChild(diskLbl);
    [ownerChip, writeChip, policyChip].forEach(c => root.appendChild(c));
    root.appendChild(packetLayer);

    this.host.appendChild(root);
    this.refs = {
      svg: root,
      appPod: appPod.group, appBox: appPod.appBox, secBox: appPod.secBox,
      kube, cyl, tree, rows, rowOwners,
      ownerChip, writeChip, policyChip,
      wires: { disk: diskLbl },
      packetLayer,
    };
  }

  reset() { this.build(); }
}

function setChip(chip, val) {
  const changed = chip && chip.valueText && chip.valueText.textContent !== String(val);
  setVal(chip, val);
  if (changed) chip.classList.add('highlight');
}
// Every step writes EVERY chip. A chip left unset keeps the previous step's value, which is how a
// card comes to report 'write: allowed' on the step that is explaining that the write is refused.
function setChips(s, { owner, write, policy }) {
  setChip(s.refs.ownerChip, owner);
  setChip(s.refs.writeChip, write);
  setChip(s.refs.policyChip, policy);
}

function setRows(s, chowned) {
  s.refs.rowOwners.forEach((ow, i) => { ow.textContent = chowned ? OWNER_AFTER[i] : OWNER_BEFORE; });
  // Rows are chips, so 'visited by the scan' is a .highlight like any other. Clearing it here rather
  // than in clearHL keeps the listing's reset in one place with the values it belongs to.
  s.refs.rows.forEach(r => r.classList.remove('highlight'));
}

function clearHL(s) {
  clearHighlights(s, ['kube', 'cyl', 'tree', 'appBox', 'secBox',
    'ownerChip', 'writeChip', 'policyChip'], [s.refs.appPod]);
}

function walkRows(s, ctx, { delay = 0, only = ROW_COUNT, chown = false } = {}) {
  const endY = walkEndY(only);
  const dur = walkDur(only);
  const visit = i => {
    s.refs.rows[i].classList.add('highlight');
    if (chown) s.refs.rowOwners[i].textContent = OWNER_AFTER[i];
  };
  if (ctx.reduced) {
    for (let i = 0; i < only; i++) visit(i);
    return delay + dur;
  }
  const pkt = segmentPacket(s, ctx, {
    from: [CONTENT_CX, WALK_Y0], to: [CONTENT_CX, endY],
    delay, dur, role: 'storage',
  });
  for (let i = 0; i < only; i++) {
    const t = Math.round(delay + dur * (rowCy(i) - WALK_Y0) / (endY - WALK_Y0));
    if (chown) s.refs.rowOwners[i].textContent = OWNER_BEFORE;
    const mark = s.refs.rows[i].animate([{ opacity: 1 }, { opacity: 1 }], { duration: 1, delay: t });
    mark.onfinish = () => visit(i);
    ctx.register(mark);
  }
  return pkt.arrivalMs;
}

const STEPS = [
  {
    id: 'idle',
    duration: 1500,
    narration: 'The container runs as user 1000, deliberately not root. The volume it mounts was created owned by root, group root. A process that is not root and not in the owning group has no permission to write there, which is the trap this whole mechanism exists to solve.',
    enter(s) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setChips(s, { owner: 'root:root', write: 'denied', policy: 'unset' });
      setBoxSublabel(s.refs.secBox, 'fsGroup not set');
      setBoxSublabel(s.refs.tree, 'owned root:root');
      setRows(s, false);
      setWire(s, 'disk', 'created root:root');
    },
  },
  {
    id: 'denied',
    duration: 2800,
    narration: 'Start the Pod with no fsGroup and it comes up, but the first write to the volume fails with permission denied. The disk is fine, the mount is fine. The ownership is simply wrong for a non-root process, and nothing in the container can fix a root-owned tree.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setChips(s, { owner: 'root:root', write: 'denied', policy: 'unset' });
      setBoxSublabel(s.refs.secBox, 'fsGroup not set');
      setBoxSublabel(s.refs.tree, 'owned root:root');
      setRows(s, false);
      setWire(s, 'disk', 'created root:root');
      if (ctx.reduced) { s.refs.tree.classList.add('highlight'); return; }
      pulsePod(s.refs.appPod, ctx, 0);
      const w = routePacket(s, ctx, W_WRITE, { delay: BEAT.afterPulse, role: 'storage' });
      ridingLabel(s, ctx, 'EACCES', W_WRITE, { delay: BEAT.afterPulse });
      lightBoxAt(s.refs.tree, ctx, w.arrivalMs);
    },
  },
  {
    id: 'fsgroup',
    duration: 2800,
    narration: 'The fix is one field. Setting securityContext.fsGroup: 2000 asks Kubernetes to make the volume usable by group 2000, and every container in the Pod is added to that supplemental group. Kubelet reads this before it ever starts the container.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      // The policy becomes meaningful the moment fsGroup is set, and its default is Always. It was
      // 'unset' up to here because with no fsGroup there is nothing for a change policy to govern.
      setChips(s, { owner: 'root:root', write: 'denied', policy: 'Always (default)' });
      setBoxSublabel(s.refs.secBox, 'fsGroup: 2000');
      setBoxSublabel(s.refs.tree, 'owned root:root');
      setRows(s, false);
      setWire(s, 'disk', 'created root:root');
      s.refs.secBox.classList.add('highlight');
      if (ctx.reduced) { s.refs.kube.classList.add('highlight'); return; }
      pulsePod(s.refs.appPod, ctx, 0);
      const r = routePacket(s, ctx, W_SEC_KUBE, { delay: BEAT.afterPulse, role: 'storage' });
      ridingLabel(s, ctx, 'fsGroup: 2000', W_SEC_KUBE, { delay: BEAT.afterPulse });
      lightBoxAt(s.refs.kube, ctx, r.arrivalMs);
    },
  },
  {
    id: 'chown',
    // 4200 rather than 3400: adding the persist hop down to the volume pushed the step's own motion
    // to 3631ms, and a duration under that would auto-advance while the change was still in flight.
    duration: 4200,
    narration: 'Before the container starts, Kubelet walks the volume tree and chowns every entry to group 2000, setting the setgid bit on directories so new files inherit it too. The owner stays root, the group becomes 2000. This is real work on real inodes, done once at mount time.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setChips(s, { owner: 'root:2000 g+s', write: 'denied', policy: 'Always (default)' });
      setBoxSublabel(s.refs.secBox, 'fsGroup: 2000');
      setBoxSublabel(s.refs.tree, 'chown + setgid, entry by entry');
      setRows(s, true);
      setWire(s, 'disk', 'now group 2000');
      // kubelet is the SOURCE here, so it is lit from step entry. Only destinations wait for a ball.
      s.refs.kube.classList.add('highlight');
      if (ctx.reduced) { [s.refs.tree, s.refs.cyl].forEach(el => el.classList.add('highlight')); return; }
      const r = routePacket(s, ctx, W_CHOWN, { role: 'storage' });
      ridingLabel(s, ctx, 'chown -R :2000', W_CHOWN);
      const walkEnd = walkRows(s, ctx, { delay: r.arrivalMs + BEAT.afterHop, chown: true });
      lightBoxAt(s.refs.tree, ctx, walkEnd);
      const p = routePacket(s, ctx, W_PERSIST, { delay: walkEnd + BEAT.afterHop, role: 'storage' });
      ridingLabel(s, ctx, 'persisted', W_PERSIST, { delay: walkEnd + BEAT.afterHop });
      lightBoxAt(s.refs.cyl, ctx, p.arrivalMs);
    },
  },
  {
    id: 'writes',
    duration: 3000,
    narration: 'Now the container starts and its first write succeeds. Its process is in group 2000, the tree is group 2000, and the setgid bit keeps every new file in the same group. The permission problem is gone, paid for once at startup.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setChips(s, { owner: 'root:2000 g+s', write: 'allowed', policy: 'Always (default)' });
      setBoxSublabel(s.refs.secBox, 'fsGroup: 2000');
      setBoxSublabel(s.refs.tree, 'owned root:2000, setgid');
      setRows(s, true);
      setWire(s, 'disk', 'now group 2000');
      if (ctx.reduced) { [s.refs.tree, s.refs.cyl].forEach(el => el.classList.add('highlight')); return; }
      pulsePod(s.refs.appPod, ctx, 0);
      const w = routePacket(s, ctx, W_WRITE, { delay: BEAT.afterPulse, role: 'storage' });
      ridingLabel(s, ctx, 'write ok', W_WRITE, { delay: BEAT.afterPulse });
      lightBoxAt(s.refs.tree, ctx, w.arrivalMs);
      lightBoxAt(s.refs.cyl, ctx, w.arrivalMs);
    },
  },
  {
    id: 'always',
    duration: 3200,
    narration: 'There is a cost. The default policy, Always, walks and re-checks the entire tree on every single Pod start. On a small volume that is nothing. On a volume with millions of files it can add minutes to each start, and the Pod sits waiting the whole time.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      // The policy value does not change here: Always was already in force. This step explains what
      // it costs, and inventing a new chip value to make something light would be a lie.
      setChips(s, { owner: 'root:2000 g+s', write: 'allowed', policy: 'Always (default)' });
      setBoxSublabel(s.refs.secBox, 'fsGroup: 2000');
      setBoxSublabel(s.refs.tree, 'every start re-checks all of it');
      setRows(s, true);
      setWire(s, 'disk', 're-read on every start');
      // The policy chip is the subject of this step, so it lights even though its value did not
      // change. Static highlight, not a flash: chips never blink.
      s.refs.policyChip.classList.add('highlight');
      s.refs.cyl.classList.add('highlight');
      if (ctx.reduced) { s.refs.tree.classList.add('highlight'); return; }
      // The scan runs the whole listing again and nothing changes as a result, which IS the point:
      // the work is paid whether or not it was needed.
      const walkEnd = walkRows(s, ctx, { delay: 0 });
      lightBoxAt(s.refs.tree, ctx, walkEnd);
    },
  },
  {
    id: 'onmismatch',
    duration: 3000,
    narration: 'The fsGroupChangePolicy: OnRootMismatch setting is the escape. Kubelet checks only the ownership of the top-level directory. If it already matches the expected fsGroup, it assumes the tree was set on a previous start and skips the walk entirely. The next start is fast no matter how many files sit below.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setChips(s, { owner: 'root:2000 g+s', write: 'allowed', policy: 'OnRootMismatch' });
      setBoxSublabel(s.refs.secBox, 'fsGroup: 2000');
      setBoxSublabel(s.refs.tree, 'top dir matches, walk skipped');
      setRows(s, true);
      setWire(s, 'disk', 'set on a previous start');
      s.refs.cyl.classList.add('highlight');
      if (ctx.reduced) { s.refs.tree.classList.add('highlight'); return; }
      const walkEnd = walkRows(s, ctx, { delay: 0, only: 1 });
      lightBoxAt(s.refs.tree, ctx, walkEnd);
    },
  },
];

export const init = makeInit(Scene, STEPS, { posterFirst: true });
