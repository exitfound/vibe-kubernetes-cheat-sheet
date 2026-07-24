import { svg, g, text } from '../lib/svg.js';
import { arrowDefs, box, pod, cylinder, pathArrow, animateAlong } from '../lib/primitives.js';
import {
  valChip, setVal, setBoxSublabel, pulsePod, routePacket, segmentPacket, routeDur,
  makeInit, clearHighlights, clearWires, setWire, BEAT,
} from '../lib/storage-kit.js';

// fsGroup and Volume Ownership (viewBox 1200x640).
//
// A volume mounts owned by root, so a container running as a non-root user cannot write to it.
// securityContext.fsGroup tells kubelet to chown and setgid the whole volume tree to that GID
// before the container starts. fsGroupChangePolicy then decides whether kubelet walks the entire
// tree on every start (Always, the default) or checks only the top-level directory and skips the
// walk when it already matches (OnRootMismatch), which is what keeps a volume of millions of files
// from adding minutes to every Pod start.
//
// ---- Composition: one spine, nothing beside it ----
// Everything on this card sits on a single vertical spine at CONTENT_CX, in storage stack grammar:
//
//   Pod app-0   (App + securityContext as its two inner rows)
//   kubelet
//   volume tree (a real directory listing, three rows, each showing its owner)
//   PV-app      (the disk the tree lives on)
//
// The version this replaces put the disk and the tree SIDE BY SIDE on a shelf, and that one choice
// caused most of what was wrong with it. A shelf pushes the tree centre 95 units right of the
// spine, so the chown lane could not land on the middle of the thing it was chowning, the write
// lane had to come down as a third off-centre line, and the disk was joined to the tree by a
// horizontal stub that carried no traffic. Stacking them puts every arrow back on the block it
// points at and makes the whole card symmetric about x=600.
//
// securityContext is now an inner row of the Pod rather than a box under it, which is both truer
// (it is a field OF the Pod, not a peer of it) and what buys back the vertical room the listing
// needs.
//
// ---- The narration overlay, measured for THIS card ----
// The overlay is HTML laid over the SVG, so the NARROWER the window the MORE viewBox units it
// eats. Worst right edge / bottom edge across all 7 steps, by viewport, measured 2026-07-21 and
// still valid because the narration strings below are unchanged:
//   1920x1080 -> 203 / 146    1440x900 -> 319 / 183    1280x800 -> 358 / 213
//   1100x800  -> 397 / 205     900x650 -> 398 / 375
// So the reserved rectangle is x<=398 AND y<=375. The narrowest block on the spine is the Pod at
// 226 wide, whose left edge is 487, and the widest is the tree at 340, left edge 430. Both clear
// 398, so the x condition alone keeps every block out of the overlay at any height and the stack
// is free to be centred vertically. A longer narration invalidates these and they must be
// re-measured.
const CONTENT_CX = 600;

// ---- Vertical stack, chained off one origin so the whole card centres by moving one number ----
// Tier heights and the gaps between them are declared once, summed, and the leftover space is
// split evenly above and below. Nothing here is a hand-typed y.
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

// ---- The Pod's two inner rows ----
// The container and the securityContext share the Pod's inset, so their edges line up and read as
// two fields of one object. The pod primitive puts its own label baseline at y+16, so the first
// row starts at 26 to clear it, and the Pod carries no sublabel of its own: runAsUser belongs to
// the container row, which is the thing actually running as that user.
const IN_INSET = 16, IN_W = POD_W - IN_INSET * 2, IN_H = 42;   // 194 wide
const IN_APP_DY = 26, IN_SEC_DY = 76;                          // 26..68 and 76..118, 8 clear of the floor

// ---- The volume tree, drawn as a directory listing ----
// Three rows, each carrying a name on the left and its owner on the right. This is the load-bearing
// change on the card: the version this replaces drew five blank rectangles and swept a ball across
// them, so the one thing that actually happens during a chown, the ownership changing, was nowhere
// on screen and the sweep read as decoration.
//
// Row 0 is the TOP-LEVEL DIRECTORY, and that is not a cosmetic detail: OnRootMismatch is defined in
// terms of exactly that directory, so having it as a labelled row is what lets the last step show
// the rule instead of asserting it. Row 2 stands in for the rest of the tree, which is what makes
// the 'minutes per start' claim on the Always step something the reader can see rather than take on
// trust.
//
// A row is built with valChip, the SAME primitive as the readouts in the strip along the bottom, and
// for the same reason: a row is a name with a value against it. The first version hand-rolled them
// out of a scheme-box-rect at 3% fill inside a group held at 0.75 opacity, and that combination read
// as grey furniture sitting BEHIND the tree rather than as content on it. valChip brings the chip
// fill, the category stroke and the bright chip text, so the listing now matches the strip below it
// in weight and colour, and it brings .highlight, which is how a row shows it has been visited.
//
// The gap between the name column and the owner column is where the walk lane runs, so it is sized
// off the longest string on each side. valChip anchors the name 12 from the left and the value 12
// from the right, and scheme-chip-text measures 6.88 viewBox units per character:
//   name  '... 4.2M more'  13 ch = 89, from local 12  -> ends local 101
//   owner 'root:2000 g+s'  13 ch = 89, to local 296   -> starts local 207
// The lane sits at local 154, so it has 53 units of clear space either side of it.
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

// ---- Lanes ----
// Two lanes reach the tree and they arrive on DIFFERENT EDGES on purpose, so neither has to share
// an edge with the other and neither lands off centre. The chown comes down the spine into the TOP
// edge, because that is kubelet acting on the volume. The write comes in from the RIGHT edge on its
// own bypass, because the container writes to the volume directly and never through kubelet. That
// bypass is the one structural fact this diagram can state that the narration cannot, which is why
// it survives even though it is the only thing on the card that is not on the spine.
const W_SEC_KUBE = [[CONTENT_CX, POD_BOTTOM], [CONTENT_CX, KUBE_TOP]];
const W_CHOWN    = [[CONTENT_CX, KUBE_BOTTOM], [CONTENT_CX, TREE_Y]];
const WRITE_X = 800;                                     // 30 clear of the tree, 87 clear of the Pod
const W_WRITE = [[POD_RIGHT, POD_CY], [WRITE_X, POD_CY], [WRITE_X, TREE_CY], [TREE_RIGHT, TREE_CY]];

// The chown does not stop at the listing: it lands on the volume, which is the whole reason it
// survives a restart and therefore the whole reason OnRootMismatch is allowed to trust it. So the
// disk is a real destination on this card, not a backdrop, and the same spine carries the change one
// tier further down into it.
const W_PERSIST = [[CONTENT_CX, TREE_BOTTOM], [CONTENT_CX, CYL_Y]];

// The walk continues straight down the spine THROUGH the listing, so the chown and the walk read as
// one movement that carries on into the tree rather than as two unrelated balls.
const WALK_Y0 = TREE_Y + 44;                             // 346, just under the tree sublabel
const walkEndY = only => (only >= ROW_COUNT ? rowY(ROW_COUNT - 1) + ROW_H : rowCy(only - 1) + 12);
const W_WALK = [[CONTENT_CX, WALK_Y0], [CONTENT_CX, walkEndY(ROW_COUNT)]];

// The walk deliberately leaves the PKT_SPEED canon, because a walk is WORK and not transit. Both
// sweeps run at the SAME speed and differ only in how far they travel, which is the honest shape of
// the thing: OnRootMismatch is not a faster walk, it is a walk that stops after one entry. At
// WALK_SPEED the full listing takes about 1470ms and the single-directory check about 470ms, a
// ratio the eye can compare directly. WALK_MIN_MS floors the short one so it stays longer than its
// own fade in and out and reads as a check rather than as a glitch.
const WALK_SPEED = 0.068, WALK_MIN_MS = 420;
const walkDur = only => Math.max(WALK_MIN_MS, Math.round((walkEndY(only) - WALK_Y0) / WALK_SPEED));

// ---- Chip strip ----
// ONE width for all three chips. valChip anchors the name 12 from the left and the value 12 from the
// right, so a chip needs name + value + 24 plus a readable gap. Measured worst cases, in viewBox
// units: owner 41 + 'root:2000 g+s' 90 = 131, write 35 + 'allowed' 48 = 107, fsGroupChangePolicy
// 131 + 'Always (default)' 110 = 265. So 300 clears the worst by 35.
const CHIP_W = 300, CHIP_GAP = 16, CHIP_COUNT = 3;
const CHIPS_W = CHIP_W * CHIP_COUNT + CHIP_GAP * (CHIP_COUNT - 1);   // 932
const CHIP_X = Array.from({ length: CHIP_COUNT }, (_, i) =>
  CONTENT_CX - CHIPS_W / 2 + i * (CHIP_W + CHIP_GAP));               // 134 / 450 / 766

function lightBoxAt(boxEl, ctx, delay = 0) {
  if (!boxEl) return;
  if (ctx.reduced || delay <= 0) { boxEl.classList.add('highlight'); return; }
  const a = boxEl.animate([{ opacity: 1 }, { opacity: 1 }], { duration: 1, delay });
  a.onfinish = () => boxEl.classList.add('highlight');
  ctx.register(a);
}

// A tag that rides with the ball on the same points, duration AND easing, so the packet visibly
// carries what the step narrates. Not a .scheme-packet, so the tools do not count it. Every ball
// that carries a tag on this card is a routePacket, which is eased, so the default ease-in-out
// matches and the tag stays glued to the ball. The walk ball is linear and deliberately carries no
// tag: at a row centre a tag would render straight on top of the listing.
function ridingLabel(s, ctx, txt, points, { delay = 0, dur = null, easing = 'ease-in-out' } = {}) {
  if (ctx.reduced) return;
  const d = dur == null ? routeDur(points) : dur;
  const lbl = text({ class: 'scheme-box-sublabel', x: 0, y: -14, 'text-anchor': 'middle', 'data-cat': 'storage' }, [txt]);
  lbl.style.opacity = '0';
  lbl.style.transform = `translate(${points[0][0]}px, ${points[0][1]}px)`;
  s.refs.packetLayer.appendChild(lbl);
  ctx.register(lbl.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 150, delay: Math.max(0, delay - 150), fill: 'forwards', easing: 'ease-out' }));
  ctx.register(animateAlong(lbl, points, { duration: d, delay, easing }));
  ctx.register(lbl.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 180, delay: delay + d + 160, fill: 'forwards', easing: 'ease-in' }));
}

// PULSE MODEL: the Pod is ONE unit and blinks as one. The shell and both inner rows live in `group`,
// and `group` is what gets pulsed. The wrapping g is not optional: pulsePod finds its targets with
// querySelectorAll, which matches descendants only and never the element itself, so pulsing a bare
// pod() would catch its .scheme-pod-rect child but not the group, and the pulse would silently fire
// at half strength (symptom in anim-dump: strokeOpacity rows, no filter row). Neither inner row is
// ever given a .highlight, so nothing stays lit after the blink has decayed.
function podBlock({ x, y }) {
  const shell = pod({ x, y, w: POD_W, h: POD_H, label: 'Pod app-0', containers: 0, cat: 'storage' });
  const shellRect = shell.querySelector('.scheme-pod-rect');
  if (shellRect) shellRect.style.fill = 'rgba(255, 255, 255, 0.03)';
  const appBox = box({
    x: x + IN_INSET, y: y + IN_APP_DY, w: IN_W, h: IN_H,
    label: 'App', sublabel: 'runAsUser: 1000', cat: 'storage',
  });
  const secBox = box({
    x: x + IN_INSET, y: y + IN_SEC_DY, w: IN_W, h: IN_H,
    label: 'securityContext', sublabel: 'fsGroup not set', cat: 'storage',
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
      'aria-label': 'fsGroup and volume ownership: a volume mounts owned by root so a non-root container cannot write, and securityContext.fsGroup makes kubelet chown and setgid the whole volume tree to that GID before the container starts, while fsGroupChangePolicy OnRootMismatch checks only the top-level directory and skips the walk when it already matches, which stops a volume of millions of files adding minutes to every Pod start whereas the default Always always walks',
      'data-style': 'outline',
    });
    root.appendChild(arrowDefs());

    const appPod = podBlock({ x: POD_X, y: POD_Y });
    const kube = box({
      x: KUBE_X, y: KUBE_Y, w: KUBE_W, h: KUBE_H,
      label: 'Kubelet', sublabel: 'applies fsGroup before start', cat: 'storage',
    });

    const tree = box({
      x: TREE_X, y: TREE_Y, w: TREE_W, h: TREE_H,
      label: 'Volume Tree', sublabel: 'owned root:root', cat: 'storage',
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
        name: ROW_NAMES[i], value: OWNER_BEFORE, cat: 'storage',
      });
      rows.push(row); rowOwners.push(row.valueText);
    }

    const cyl = cylinder({ x: CYL_X, y: CYL_Y, w: CYL_W, h: CYL_H, label: 'PV-app', cat: 'storage' });
    // The primitive centres the label on the raw bbox, which reads high because the top cap ellipse
    // is not part of the visible front face. Re-centre on the face.
    const cylLbl = cyl.querySelector('.scheme-cylinder-label');
    if (cylLbl) cylLbl.setAttribute('y', CYL_H / 2 + 10);

    // Each wire is built from the SAME points array as the ball that rides it, so the drawn lane and
    // the packet cannot drift apart. All five carry a ball on some step, which is what earns them an
    // arrowhead. W_PERSIST used to be a bare markerless line, on the reasoning that the disk backing
    // the tree is a relationship and not traffic. That was wrong, and it is what made the disk read
    // as scenery: a chown is not an abstraction over the volume, it rewrites inodes ON it, so there
    // IS traffic down that line and it earns its arrowhead like any other.
    const wires = [W_SEC_KUBE, W_CHOWN, W_WRITE, W_WALK, W_PERSIST]
      .map(points => pathArrow({ points, dashed: true, dim: true, color: 'storage' }));

    const diskLbl = text({ class: 'scheme-label code dim', x: CONTENT_CX, y: DISK_LBL_Y, 'text-anchor': 'middle' }, [' ']);

    const ownerChip  = valChip({ x: CHIP_X[0], y: CHIPS_Y, w: CHIP_W, h: CHIP_H, name: 'owner', value: 'root:root', cat: 'storage' });
    const writeChip  = valChip({ x: CHIP_X[1], y: CHIPS_Y, w: CHIP_W, h: CHIP_H, name: 'write', value: 'denied', cat: 'storage' });
    const policyChip = valChip({ x: CHIP_X[2], y: CHIPS_Y, w: CHIP_W, h: CHIP_H, name: 'fsGroupChangePolicy', value: 'unset', cat: 'storage' });

    const packetLayer = g({ id: 'packetLayer' });

    // Z-order (bottom -> top): the disk and the tree, then the listing rows so they sit on the tree
    // face, then kubelet and the Pod, then the backing link and the lanes above every block, then
    // the disk caption, then the chip strip, then the packet layer so every ball rides above all.
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

// A chip whose value CHANGED this step also lights (static highlight, never a flash): valueText
// still holds the previous step's text at call time (clearHL clears the class, not the text) and
// steps are always entered in order, so the diff is deterministic. Catalog-wide chip pattern.
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

// Same rule for the listing: every step writes EVERY row, so no row can be left displaying an
// ownership the current step has already moved past. `chowned` is the whole state, because on this
// card the tree is only ever entirely before the chown or entirely after it.
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

// Sweep the scan down the listing, lighting each row as the ball crosses its centre and, when the
// step is the chown itself, flipping that row's owner at the same instant. `only` is how many
// entries kubelet actually inspects: the whole listing under Always, exactly one under
// OnRootMismatch. The ball is LINEAR, so a row's moment is a pure ratio of distance and needs no
// easing correction, which is the reason this is a segmentPacket and not a routePacket. Returns the
// arrival time so the caller can chain the tree light off real geometry.
//
// A row lights by taking .highlight as the ball crosses it and KEEPS it for the rest of the step, so
// the listing fills in behind the scan and the finished frame shows exactly how far kubelet got.
// That is what makes the last two steps comparable at a glance: three lit rows under Always, one lit
// row and two untouched under OnRootMismatch. Rows are readouts, not actors, so this is a static
// highlight and never a blink.
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
    delay, dur, cat: 'storage',
  });
  for (let i = 0; i < only; i++) {
    const t = Math.round(delay + dur * (rowCy(i) - WALK_Y0) / (endY - WALK_Y0));
    // A zero-effect timer animation lands the visit exactly on the beat the ball crosses the row, the
    // same trick lightBoxAt uses. On the chown step the final owner values are already pinned above
    // the reduced guard, so this only has to stage the before-value and schedule the change.
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
      // The tree lights only when the write actually gets there. Lighting it above the guard, as this
      // step used to, meant the destination was already lit while the ball was still in flight, which
      // reads as the tree reacting before anything reached it.
      if (ctx.reduced) { s.refs.tree.classList.add('highlight'); return; }
      // Pod to infra, so up-arrow ordering: the Pod blinks first because it is the actor, and the
      // write leaves at BEAT.afterPulse down the bypass. The write attempt is literal traffic the
      // step narrates, not decoration: the process really does issue it and it really does reach the
      // tree. What differs from the 'writes' step is everything around it, the same lane and the
      // same shape of tag read as a refusal here and as success there. The disk stays dark, and that
      // is the point: a refused write never reaches the volume.
      pulsePod(s.refs.appPod, ctx, 0);
      const w = routePacket(s, ctx, W_WRITE, { delay: BEAT.afterPulse, cat: 'storage' });
      ridingLabel(s, ctx, 'EACCES', W_WRITE, { delay: BEAT.afterPulse });
      lightBoxAt(s.refs.tree, ctx, w.arrivalMs);
    },
  },
  {
    id: 'fsgroup',
    duration: 2800,
    narration: 'The fix is one field. securityContext.fsGroup: 2000 asks Kubernetes to make the volume usable by group 2000, and every container in the Pod is added to that supplemental group. Kubelet reads this before it ever starts the container.',
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
      // The field being read out belongs to the Pod, and the ball leaves the Pod carrying it, so this
      // is up-arrow ordering like any other Pod-to-infra hop: the Pod blinks first as the source and
      // the ball departs at BEAT.afterPulse. It used to fire the ball with no pulse at all, which
      // left the one block the packet came out of as the only inert thing on the step.
      pulsePod(s.refs.appPod, ctx, 0);
      const r = routePacket(s, ctx, W_SEC_KUBE, { delay: BEAT.afterPulse, cat: 'storage' });
      ridingLabel(s, ctx, 'fsGroup: 2000', W_SEC_KUBE, { delay: BEAT.afterPulse });
      lightBoxAt(s.refs.kube, ctx, r.arrivalMs);
    },
  },
  {
    id: 'chown',
    // 4200 rather than 3400: adding the persist hop down to the volume pushed the step's own motion
    // to 3631ms, and a duration under that would auto-advance while the change was still in flight.
    duration: 4200,
    narration: 'Before the container starts, kubelet walks the volume tree and chowns every entry to group 2000, setting the setgid bit on directories so new files inherit it too. The owner stays root, the group becomes 2000. This is real work on real inodes, done once at mount time.',
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
      // Three chained hops that read as one continuous movement down the spine: kubelet issues the
      // chown, the scan carries straight on into the listing, and the change lands on the volume.
      // Every time comes off arrivalMs and BEAT, never a typed delay.
      const r = routePacket(s, ctx, W_CHOWN, { cat: 'storage' });
      ridingLabel(s, ctx, 'chown -R :2000', W_CHOWN);
      const walkEnd = walkRows(s, ctx, { delay: r.arrivalMs + BEAT.afterHop, chown: true });
      lightBoxAt(s.refs.tree, ctx, walkEnd);
      const p = routePacket(s, ctx, W_PERSIST, { delay: walkEnd + BEAT.afterHop, cat: 'storage' });
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
      // The Pod blinks as the writer, then the write leaves at BEAT.afterPulse down the same lane it
      // was refused on. Unlike the 'denied' step the bytes get through, so the volume lights with the
      // tree: the two together are what 'the write landed' looks like.
      pulsePod(s.refs.appPod, ctx, 0);
      const w = routePacket(s, ctx, W_WRITE, { delay: BEAT.afterPulse, cat: 'storage' });
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
      // The volume is lit from entry rather than on a ball, because here it is the SOURCE: every
      // entry the scan re-checks is an inode read off this disk, which is precisely where the cost
      // being narrated comes from.
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
    narration: 'fsGroupChangePolicy: OnRootMismatch is the escape. Kubelet checks only the ownership of the top-level directory. If it already matches the expected fsGroup, it assumes the tree was set on a previous start and skips the walk entirely. The next start is fast no matter how many files sit below.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setChips(s, { owner: 'root:2000 g+s', write: 'allowed', policy: 'OnRootMismatch' });
      setBoxSublabel(s.refs.secBox, 'fsGroup: 2000');
      setBoxSublabel(s.refs.tree, 'top dir matches, walk skipped');
      setRows(s, true);
      setWire(s, 'disk', 'set on a previous start');
      // Lit from entry, and this is the step where that matters most: the ownership OnRootMismatch
      // trusts is the ownership sitting on this disk from the last start. Without the volume lit here
      // the rule looks like kubelet guessing rather than kubelet reading persisted state.
      s.refs.cyl.classList.add('highlight');
      if (ctx.reduced) { s.refs.tree.classList.add('highlight'); return; }
      // Only the top-level directory is inspected, and the ball stops beside it. The full-length lane
      // stays drawn underneath on purpose, and the two rows below it stay resting: seeing the scan
      // NOT travel the listing is the whole point, and it is directly comparable with the step before
      // because both start from the same place at the same speed. No block flash to close on, this
      // is the last step and it should come to rest.
      const walkEnd = walkRows(s, ctx, { delay: 0, only: 1 });
      lightBoxAt(s.refs.tree, ctx, walkEnd);
    },
  },
];

export const init = makeInit(Scene, STEPS, { posterFirst: true });
