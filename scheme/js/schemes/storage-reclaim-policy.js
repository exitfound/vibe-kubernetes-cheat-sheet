import { svg, g, text, line } from '../lib/svg.js';
import { arrowDefs, box, cylinder, pathArrow, animateAlong } from '../lib/primitives.js';
import {
  valChip, setVal, setBoxSublabel, routePacket, routeDur,
  makeInit, clearHighlights, clearWires, setWire, BEAT,
} from '../lib/storage-kit.js';

// Layout (viewBox 1200x640). This card is a side-by-side comparison, so the storage stack is drawn
// TWICE: a Delete column on the left and a Retain column on the right, each a claim on top, its bound
// volume under it, and the real disk on the shelf at the bottom. Between the volumes and the disks
// runs ONE full-width band, the PV controller and CSI driver, because both columns are reclaimed by
// the same controller reading the same field: the band is where the two stories split. Every reclaim
// is therefore a DESCENT through it, exactly as in storage-access-modes: PV -> controller (the policy
// is read), then controller -> disk (the disk is wiped). Retain is the branch where the second hop
// never happens, and that absence is the whole point, so the first hop is still drawn and still lands
// on the band. There is no Pod anywhere in this card, so nothing pulses: boxes, the band and the
// cylinders light, and the one packet-less step is allowed a box flash.
//
// Two rules govern that light, and both exist because a lit stroke is a claim about the object:
//   1. Only the SOURCE of a ball is lit at step entry. Every destination earns its light on arrival
//      (lightBoxAt at pkt.arrivalMs), so the card never announces an outcome before the act.
//   2. A block that is not at full opacity never carries one. Faded means gone or refused, and a
//      dimmed block still glowing reads as deleted-but-somehow-live. removeAt enforces this for the
//      mid-flight case by dropping the class as the fade lands.
// The narration overlay owns x<=380 & y<=300, so every block starts at x>=400.
//
// ---- Vertical rhythm ----
// Four tiers with three equal 54px gaps, so no hop is a blink and no tier reads as belonging to its
// neighbour. The whole stack is pulled UP rather than centered vertically, because FIVE text rows
// queue up under the disk shelf: the cylinder name, the spec line, the verdict line and two rows of
// chips. Sitting the shelf lower crushes those five into each other, which is what the first cut of
// this layout did. Everything above the shelf is spaced backwards from it.
const PVC_Y = 30, PVC_H = 68, PVC_BOTTOM = PVC_Y + PVC_H;      // 98
const PV_Y = 152, PV_H = 72, PV_TOP = PV_Y, PV_BOTTOM = PV_Y + PV_H;  // 152 / 224
const BAND_Y = 278, BAND_H = 58, BAND_TOP = BAND_Y, BAND_BOTTOM = BAND_Y + BAND_H;  // 278 / 336
const DISK_Y = 390, DISK_H = 100, DISK_TOP = DISK_Y;           // 390, shelf ends at 490
const COL_W = 176;

// ---- Horizontal composition ----
// The stack is centered on the CANVAS, at 600, not merely placed somewhere to the right of the
// narration overlay. That costs width and the cost is not negotiable: the overlay permanently owns
// the top left (x<=380 worst case), the top two tiers sit inside its vertical band, so the leftmost
// the columns may start is 400. Centering on 600 with a left edge of 400 pins the stack to exactly
// 400 wide. Everything horizontal is derived from those two numbers, so the two columns split what
// is left rather than each carrying a hand-typed x.
//
// Do not "fix" the narrowness by sliding LEFT_X left after measuring the overlay on your own screen.
// The overlay is HTML laid over the SVG, so the NARROWER the window, the MORE viewBox units it eats:
// measured right edge is 185 at 1920 wide but 379 at 1100 and below. LEFT_X 400 is that worst case
// plus a hair, not a pessimistic guess.
const LEFT_X = 400, STACK_W = 400;                             // 400..800, so the center is 600
const COL_GAP = STACK_W - COL_W * 2;                           // 48
const DEL_X = LEFT_X, RET_X = LEFT_X + COL_W + COL_GAP;        // 400 / 624
const DEL_CX = DEL_X + COL_W / 2, RET_CX = RET_X + COL_W / 2;  // 488 / 712
const BAND_X = LEFT_X, BAND_W = STACK_W;
const RET_RIGHT = RET_X + COL_W;                               // 800

// The human sits in the right margin and is the one element that breaks the symmetry, which it has
// to: the left margin is the narration overlay and nothing may be parked there, so an actor that is
// not part of either stack has only one place to go. It is kept close to the Retain column rather
// than pushed to the canvas edge, and it appears on exactly one step, so the composition reads as
// centered on the six steps where it is absent and as centered-plus-a-visitor on the one where it is.
const ADMIN_W = 160, ADMIN_H = 68, ADMIN_X = 850, ADMIN_Y = PVC_Y;
const ADMIN_CX = ADMIN_X + ADMIN_W / 2;                        // 930

// cylinder() puts its own name on the baseline h/2+5, and this spec line goes 14 BELOW that. It used
// to be a flat DISK_Y+66, which left 11px between two baselines whose text is 11px tall: the two
// lines visually touched. Same fix, same number, as storage-access-modes.
const SPEC_GAP = 14;
const SPEC_Y = DISK_Y + DISK_H / 2 + 5 + SPEC_GAP;             // 485
// The verdict line clears the bottom of the cylinder by a full row rather than the 16px it used to,
// and the chip strip clears the verdict by another one. Both are derived so raising the shelf again
// carries them with it.
const VERDICT_Y = DISK_Y + DISK_H + 28;                        // 518

// The readout is a 2x2 GRID, not a row of four: each column of the diagram gets its own pair of
// chips stacked directly under it, at exactly the column x and exactly the column width. One row per
// kind of object (the volumes, then their disks), so reading across compares the two policies and
// reading down walks one stack. A single row of four could not do this: four chips wide enough to
// hold their text come to 920px against a 400px stack, so the strip would be more than twice the
// width of the thing it reports on, and no chip would line up with anything above it.
//
// The cost is a hard 152px of room for text per chip (176 minus 12px of padding at each end), so
// values are kept to about 12 characters: the longest pair here, 'vol-aaa' plus 'wiped, gone', comes
// to roughly 46 + 73 px of 11px JetBrains Mono, which leaves a clear gap between the name and the
// value. Anything longer collides in the middle of the chip, so shorten the VALUE, never the width.
const CHIP_W = COL_W;                        // each chip is exactly as wide as the column above it
const CHIP_H = 34;
const CHIP_ROW_1 = VERDICT_Y + 18;           // 536: the volumes
const CHIP_ROW_2 = CHIP_ROW_1 + CHIP_H + 8;  // 578: their disks, strip ends at 612

const GONE = 0.12;   // an object the API has removed
const DYING = 0.45;  // an object with a deletionTimestamp on it
const DIM = 0.6;     // a claim that exists and is refused: Pending, not deleted

// Reclaim hops, both columns. The same points arrays feed the static lanes and the balls, so the two
// cannot drift apart.
const W_DEL_POLICY = [[DEL_CX, PV_BOTTOM], [DEL_CX, BAND_TOP]];
const W_DEL_WIPE   = [[DEL_CX, BAND_BOTTOM], [DEL_CX, DISK_TOP]];
const W_RET_POLICY = [[RET_CX, PV_BOTTOM], [RET_CX, BAND_TOP]];
const W_RET_WIPE   = [[RET_CX, BAND_BOTTOM], [RET_CX, DISK_TOP]];  // drawn, never travelled: that is Retain
// A fresh claim reaching down for the Released volume, and the admin reaching in from the side.
const W_RET_BIND = [[RET_CX, PVC_BOTTOM], [RET_CX, PV_TOP]];
const W_ADMIN_PV = [[ADMIN_CX, ADMIN_Y + ADMIN_H], [ADMIN_CX, PV_Y + PV_H / 2], [RET_RIGHT, PV_Y + PV_H / 2]];

function lightBoxAt(boxEl, ctx, delay = 0) {
  if (!boxEl) return;
  if (ctx.reduced || delay <= 0) { boxEl.classList.add('highlight'); return; }
  const a = boxEl.animate([{ opacity: 1 }, { opacity: 1 }], { duration: 1, delay });
  a.onfinish = () => boxEl.classList.add('highlight');
  ctx.register(a);
}

// Fades an object out of existence when the delete that removes it lands, and takes its lit stroke
// with it. A block that has gone dark must not keep glowing: the highlight means "this is live and
// in play", so a ghost at 0.12 still wearing it reads as a deleted object that is somehow still
// working. This is the one place the class cannot simply be pinned per step, because the fade is
// mid-flight, so the class comes off when the fade lands.
function removeAt(el, ctx, delay = 0, to = GONE) {
  if (!el) return;
  if (ctx.reduced || delay <= 0) { el.style.opacity = String(to); el.classList.remove('highlight'); return; }
  const a = el.animate([{ opacity: 1 }, { opacity: to }], { duration: 500, delay, fill: 'forwards', easing: 'ease-in' });
  a.onfinish = () => el.classList.remove('highlight');
  ctx.register(a);
}

// The only sanctioned block blink, and only on a step with no packet and no Pod, so the card does
// not read frozen. Value chips never blink, so this takes boxes only.
function flashBox(el, ctx, delay = 0) {
  if (!el || ctx.reduced) return;
  ctx.register(el.animate(
    [{ filter: 'brightness(1)' }, { filter: 'brightness(1.55)' }, { filter: 'brightness(1)' }],
    { duration: 600, delay, easing: 'ease-out' },
  ));
}

// A tag that rides with the ball on the same path, timing and easing, so the packet visibly carries
// what the step narrates. Not a .scheme-packet, so the tools do not count it.
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

function specText(cx, txt) {
  return text({ class: 'scheme-label code dim', x: cx, y: SPEC_Y, 'text-anchor': 'middle' }, [txt]);
}

// Two line vocabularies, and the difference is the whole point of reading the card:
//   dashed + arrowhead = a ROUTE, something travels it. Every reclaim lane is one of these, including
//     the Retain lane down to the disk, which is a real route that this policy simply never uses.
//   solid, no arrowhead  = a RELATION, the Bound link. Nothing travels a relation, so it gets no head.
// Routes are built with pathArrow so the head, the dash pattern and the storage tint all come from
// one place, and from the SAME points array the ball is animated along.
function lane(points) {
  return pathArrow({ points, dashed: true, dim: true, color: 'storage' });
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
      'aria-label': 'Reclaim policy decides what happens to a PersistentVolume and its real disk once the claim is deleted. Both volumes go to the Released phase, and then the same PV controller reads the reclaim policy on each one. Under Delete it calls DeleteVolume on the CSI driver, the disk is wiped and the PV object is removed. Under Retain it makes no call at all, so the disk and its data survive, but the volume stays Released carrying a stale claimRef, and a new claim asking for it is skipped and left Pending until an administrator clears that reference by hand and lets the volume bind again.',
      'data-style': 'outline',
    });
    root.appendChild(arrowDefs());

    const delPvc = box({ x: DEL_X, y: PVC_Y, w: COL_W, h: PVC_H, label: 'PVC data-a', sublabel: 'Bound', cat: 'storage' });
    const delPv  = box({ x: DEL_X, y: PV_Y, w: COL_W, h: PV_H, label: 'PV-del', sublabel: 'reclaim: Delete', cat: 'storage' });
    const delDisk = cylinder({ x: DEL_CX - COL_W / 2, y: DISK_Y, w: COL_W, h: DISK_H, label: 'vol-aaa', cat: 'storage' });

    const retPvc = box({ x: RET_X, y: PVC_Y, w: COL_W, h: PVC_H, label: 'PVC data-b', sublabel: 'Bound', cat: 'storage' });
    const retPv  = box({ x: RET_X, y: PV_Y, w: COL_W, h: PV_H, label: 'PV-ret', sublabel: 'reclaim: Retain', cat: 'storage' });
    const retDisk = cylinder({ x: RET_CX - COL_W / 2, y: DISK_Y, w: COL_W, h: DISK_H, label: 'vol-bbb', cat: 'storage' });

    // The claim that arrives AFTER the first one is deleted is its own box, not the old one turned
    // back on. It used to be the same element wearing a new sublabel, so the step that narrates a
    // brand new claim showed the deleted claim rising from the dead under its original name.
    const retPvc2 = box({ x: RET_X, y: PVC_Y, w: COL_W, h: PVC_H, label: 'PVC data-c', sublabel: 'Pending', cat: 'storage' });
    retPvc2.style.opacity = '0';

    // One controller for both columns: the reclaim policy is a field it reads, not two machines.
    const band = box({ x: BAND_X, y: BAND_Y, w: BAND_W, h: BAND_H, label: 'PV controller and CSI driver', sublabel: 'reads the reclaim policy on each released volume', cat: 'storage' });

    const admin = box({ x: ADMIN_X, y: ADMIN_Y, w: ADMIN_W, h: ADMIN_H, label: 'administrator', sublabel: 'kubectl patch pv', cat: 'storage' });
    admin.style.opacity = '0';

    // The Bound links: solid and arrowhead-free, because a bound relation carries no traffic.
    const delBound = line({ class: 'scheme-arrow scheme-arrow-storage', x1: DEL_CX, y1: PVC_BOTTOM, x2: DEL_CX, y2: PV_TOP, fill: 'none' });
    const retBound = line({ class: 'scheme-arrow scheme-arrow-storage', x1: RET_CX, y1: PVC_BOTTOM, x2: RET_CX, y2: PV_TOP, fill: 'none' });

    // The reclaim lanes: always drawn, in both columns, so the Retain side visibly HAS the lane the
    // Delete side uses and simply never sends anything down it.
    const lDelPolicy = lane(W_DEL_POLICY);
    const lDelWipe   = lane(W_DEL_WIPE);
    const lRetPolicy = lane(W_RET_POLICY);
    const lRetWipe   = lane(W_RET_WIPE);

    const wRetBind = pathArrow({ points: W_RET_BIND, dashed: true, dim: true, color: 'storage' });
    const wAdminPv = pathArrow({ points: W_ADMIN_PV, dashed: true, dim: true, color: 'storage' });
    wRetBind.style.opacity = '0';
    wAdminPv.style.opacity = '0';

    const delLbl = text({ class: 'scheme-label code dim', x: DEL_CX, y: VERDICT_Y, 'text-anchor': 'middle' }, [' ']);
    const retLbl = text({ class: 'scheme-label code dim', x: RET_CX, y: VERDICT_Y, 'text-anchor': 'middle' }, [' ']);

    // Each chip names ONE object and reports only that object's state, so a value can never be read
    // as a caption for something else. The two PV chips carry the phase, which is why the PV boxes
    // keep their reclaim policy as a fixed sublabel instead of flipping between the two meanings.
    const delChip     = valChip({ x: DEL_X, y: CHIP_ROW_1, w: CHIP_W, h: CHIP_H, name: 'PV-del', value: 'Bound', cat: 'storage' });
    const retChip     = valChip({ x: RET_X, y: CHIP_ROW_1, w: CHIP_W, h: CHIP_H, name: 'PV-ret', value: 'Bound', cat: 'storage' });
    const delDiskChip = valChip({ x: DEL_X, y: CHIP_ROW_2, w: CHIP_W, h: CHIP_H, name: 'vol-aaa', value: 'exists', cat: 'storage' });
    const retDiskChip = valChip({ x: RET_X, y: CHIP_ROW_2, w: CHIP_W, h: CHIP_H, name: 'vol-bbb', value: 'exists', cat: 'storage' });

    const packetLayer = g({ id: 'packetLayer' });

    // Z-order (bottom -> top): blocks, then the lanes and their labels above them, then the chip
    // strip, then the packet layer so every ball rides above everything.
    [delPvc, delPv, delDisk, retPvc, retPvc2, retPv, retDisk, band, admin].forEach(el => root.appendChild(el));
    [delBound, retBound, lDelPolicy, lDelWipe, lRetPolicy, lRetWipe, wRetBind, wAdminPv].forEach(el => root.appendChild(el));
    [delLbl, retLbl].forEach(el => root.appendChild(el));
    // The spec line is a sibling of the cylinder, not a child of it, so it has to be faded BY HAND
    // when the disk it describes is deleted. It used to be left alone, which left a bright
    // "real disk, EBS" hanging under a disk the step had just wiped out of existence.
    const delSpec = specText(DEL_CX, 'real disk, EBS');
    const retSpec = specText(RET_CX, 'real disk, EBS');
    root.appendChild(delSpec);
    root.appendChild(retSpec);
    [delChip, delDiskChip, retChip, retDiskChip].forEach(c => root.appendChild(c));
    root.appendChild(packetLayer);

    this.host.appendChild(root);
    this.refs = {
      svg: root,
      delPvc, delPv, delDisk, retPvc, retPvc2, retPv, retDisk, band, admin,
      delBound, retBound, wRetBind, wAdminPv, delSpec, retSpec,
      delChip, delDiskChip, retChip, retDiskChip,
      wires: { del: delLbl, ret: retLbl },
      packetLayer,
    };
  }

  reset() { this.build(); }
}

// A chip whose value CHANGED this step also lights (static highlight, never a flash): valueText still
// holds the previous step's text at call time and steps are always entered in order, so the diff is
// deterministic. Catalog-wide chip pattern.
function setChip(chip, val) {
  const changed = chip && chip.valueText && chip.valueText.textContent !== String(val);
  setVal(chip, val);
  if (changed) chip.classList.add('highlight');
}
function setChips(s, { del, delDisk, ret, retDisk }) {
  setChip(s.refs.delChip, del);
  setChip(s.refs.delDiskChip, delDisk);
  setChip(s.refs.retChip, ret);
  setChip(s.refs.retDiskChip, retDisk);
}

// Every step pins EVERY opacity that any step can change, so a step can never inherit a stale one
// and a cancel mid-flight always lands on this step's own end state.
function setStage(s, { delPvc, delPv, delDisk, retPvc, retPvc2, admin, delBound, retBound, retBindLane, adminLane }) {
  s.refs.delPvc.style.opacity = String(delPvc);
  s.refs.delPv.style.opacity = String(delPv);
  s.refs.delDisk.style.opacity = String(delDisk);
  s.refs.delSpec.style.opacity = String(delDisk);   // the caption dies with the disk it describes
  s.refs.retPvc.style.opacity = String(retPvc);
  s.refs.retPvc2.style.opacity = String(retPvc2);
  s.refs.admin.style.opacity = String(admin);
  s.refs.delBound.style.opacity = String(delBound);
  s.refs.retBound.style.opacity = String(retBound);
  s.refs.wRetBind.style.opacity = String(retBindLane);
  s.refs.wAdminPv.style.opacity = String(adminLane);
}

function clearHL(s) {
  clearHighlights(s, ['delPvc', 'delPv', 'delDisk', 'retPvc', 'retPvc2', 'retPv', 'retDisk', 'band', 'admin',
    'delChip', 'delDiskChip', 'retChip', 'retDiskChip'], []);
}

const STEPS = [
  {
    id: 'idle',
    duration: 1500,
    narration: 'Two identical stacks: a claim bound to a volume, and behind that volume a real disk. The only difference is one field on the PV, the reclaim policy, set to Delete on the left and Retain on the right. That single field decides what survives when the claim goes away.',
    enter(s) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setChips(s, { del: 'Bound', delDisk: 'exists', ret: 'Bound', retDisk: 'exists' });
      setBoxSublabel(s.refs.delPvc, 'Bound');
      setBoxSublabel(s.refs.retPvc, 'Bound');
      setBoxSublabel(s.refs.retPvc2, 'Pending');
      setStage(s, { delPvc: 1, delPv: 1, delDisk: 1, retPvc: 1, retPvc2: 0, admin: 0, delBound: 1, retBound: 1, retBindLane: 0, adminLane: 0 });
    },
  },
  {
    id: 'delete-pvc',
    duration: 2400,
    // Packet-less and Pod-less: a box flash on the two claims is the sanctioned cue.
    narration: 'You delete both claims with kubectl delete pvc. The Bound links break and both volumes move to the Released phase, which means only that the claim they belonged to is gone. Nothing has touched the disks yet. What happens next is decided entirely by the reclaim policy.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setChips(s, { del: 'Released', delDisk: 'exists', ret: 'Released', retDisk: 'exists' });
      setBoxSublabel(s.refs.delPvc, 'Terminating');
      setBoxSublabel(s.refs.retPvc, 'Terminating');
      // The two volumes light because their phase flipped to Released. The two claims do NOT, even
      // though they are what you deleted: they end this step faded, and a faded block never keeps a
      // lit stroke. What marks them is the flash below plus their new Terminating sublabel.
      s.refs.delPv.classList.add('highlight');
      s.refs.retPv.classList.add('highlight');
      // The claims are on their way out, so they end this step faded but still readable.
      setStage(s, { delPvc: DYING, delPv: 1, delDisk: 1, retPvc: DYING, retPvc2: 0, admin: 0, delBound: 0, retBound: 0, retBindLane: 0, adminLane: 0 });
      if (ctx.reduced) return;
      flashBox(s.refs.delPvc, ctx, 0);
      flashBox(s.refs.retPvc, ctx, 0);
    },
  },
  {
    id: 'delete-branch',
    duration: 3400,
    narration: 'The controller reads Delete on the left volume and cleans everything up. It calls DeleteVolume on the CSI driver, the real disk is wiped, and then the PV object itself is removed. Convenient for scratch data and unforgiving for anything you meant to keep, because the disk is gone for good.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setChips(s, { del: 'removed', delDisk: 'wiped, gone', ret: 'Released', retDisk: 'exists' });
      setBoxSublabel(s.refs.delPvc, 'Terminating');
      setBoxSublabel(s.refs.retPvc, 'Terminating');
      setWire(s, 'del', 'disk wiped, PV removed');
      // End-state: the band has acted, and the PV and its disk are gone on the Delete side.
      setStage(s, { delPvc: GONE, delPv: GONE, delDisk: GONE, retPvc: DYING, retPvc2: 0, admin: 0, delBound: 0, retBound: 0, retBindLane: 0, adminLane: 0 });
      s.refs.band.classList.add('highlight');
      if (ctx.reduced) return;
      // Replayed forward, the two objects start alive and are killed by the ball that reaches them.
      s.refs.delPv.style.opacity = '1';
      s.refs.delDisk.style.opacity = '1';
      s.refs.delSpec.style.opacity = '1';
      s.refs.band.classList.remove('highlight');
      // The PV is the block the ball leaves from, so it lights at once: it is the actor here, not a
      // bystander that happens to be above the lane. The disk lights when the wipe REACHES it and
      // only then starts dissolving, so the hit registers before the object stops existing.
      s.refs.delPv.classList.add('highlight');
      const policy = routePacket(s, ctx, W_DEL_POLICY, { cat: 'storage' });
      ridingLabel(s, ctx, 'policy: Delete', W_DEL_POLICY);
      lightBoxAt(s.refs.band, ctx, policy.arrivalMs);
      const wipe = routePacket(s, ctx, W_DEL_WIPE, { delay: policy.arrivalMs + BEAT.afterHop, cat: 'storage' });
      ridingLabel(s, ctx, 'DeleteVolume', W_DEL_WIPE, { delay: policy.arrivalMs + BEAT.afterHop });
      lightBoxAt(s.refs.delDisk, ctx, wipe.arrivalMs);
      removeAt(s.refs.delDisk, ctx, wipe.arrivalMs + 180);
      removeAt(s.refs.delSpec, ctx, wipe.arrivalMs + 180);
      removeAt(s.refs.delPv, ctx, wipe.arrivalMs + 580);
    },
  },
  {
    id: 'retain-branch',
    duration: 3000,
    narration: 'The same controller reads Retain on the right volume and deliberately does nothing. No call ever reaches the driver, so the disk and every byte on it survive. The volume stays parked in Released, still carrying the claimRef of a claim that no longer exists.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setChips(s, { del: 'removed', delDisk: 'wiped, gone', ret: 'Released', retDisk: 'data intact' });
      setWire(s, 'ret', 'nothing touched, data kept');
      setStage(s, { delPvc: GONE, delPv: GONE, delDisk: GONE, retPvc: GONE, retPvc2: 0, admin: 0, delBound: 0, retBound: 0, retBindLane: 0, adminLane: 0 });
      // Static end state, which is also what a reduced-motion replay snaps to.
      s.refs.retPv.classList.add('highlight');
      s.refs.retDisk.classList.add('highlight');
      s.refs.band.classList.add('highlight');
      if (ctx.reduced) return;
      // Played forward, only the SOURCE of the ball is lit from the start. The band and the disk
      // have to earn their light: the band when the ball lands on it, the disk at the same instant,
      // because that is the moment the policy is read and the disk is spared. Lighting the disk at
      // step entry announced the outcome before the ball that decides it had left the volume.
      s.refs.band.classList.remove('highlight');
      s.refs.retDisk.classList.remove('highlight');
      // The policy hop is made on this side too, and it is the SECOND hop that never happens: the
      // lane down to the disk is drawn and stays empty. Retain shown as an absence, not as a gap.
      const policy = routePacket(s, ctx, W_RET_POLICY, { cat: 'storage' });
      ridingLabel(s, ctx, 'policy: Retain', W_RET_POLICY);
      lightBoxAt(s.refs.band, ctx, policy.arrivalMs);
      lightBoxAt(s.refs.retDisk, ctx, policy.arrivalMs);
    },
  },
  {
    id: 'retain-stuck',
    duration: 3000,
    narration: 'A brand new claim asks for the same storage and cannot have it. The binding controller sees the leftover claimRef, decides the volume is already spoken for, and skips it. The new claim stays Pending: the disk is sitting right there, full of data, and nothing can reach it.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setChips(s, { del: 'removed', delDisk: 'wiped, gone', ret: 'Released', retDisk: 'unusable' });
      setBoxSublabel(s.refs.retPvc2, 'Pending');
      setWire(s, 'ret', 'skipped: stale claimRef');
      // The refused claim is dim, not faded out: it exists, it is just not getting what it asked for.
      setStage(s, { delPvc: GONE, delPv: GONE, delDisk: GONE, retPvc: 0, retPvc2: DIM, admin: 0, delBound: 0, retBound: 0, retBindLane: 1, adminLane: 0 });
      // The asking claim sits at DIM and therefore gets NO lit stroke: it is the ball leaving it that
      // says it is the one asking, and dim plus glowing would say refused and live at the same time.
      if (ctx.reduced) { s.refs.retPv.classList.add('highlight'); return; }
      // The request lands on the PV and the PV lights, because it was looked at. Nothing below it
      // lights and no Bound link appears, which is what tells the request apart from an accepted one.
      const tryBind = routePacket(s, ctx, W_RET_BIND, { cat: 'storage' });
      ridingLabel(s, ctx, 'bind me', W_RET_BIND);
      lightBoxAt(s.refs.retPv, ctx, tryBind.arrivalMs);
    },
  },
  {
    id: 'admin-clears',
    duration: 3200,
    narration: 'Only a human breaks the deadlock. An administrator patches the PV and removes the stale claimRef by hand. With the reference cleared the volume goes back to Available, which is the first moment anything is allowed to bind to it again.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setChips(s, { del: 'removed', delDisk: 'wiped, gone', ret: 'Available', retDisk: 'reusable' });
      setBoxSublabel(s.refs.retPvc2, 'Pending');
      setWire(s, 'ret', 'claimRef cleared, Available');
      setStage(s, { delPvc: GONE, delPv: GONE, delDisk: GONE, retPvc: 0, retPvc2: DIM, admin: 1, delBound: 0, retBound: 0, retBindLane: 0, adminLane: 1 });
      // The human is the actor on this step, so the human lights.
      s.refs.admin.classList.add('highlight');
      if (ctx.reduced) { s.refs.retPv.classList.add('highlight'); return; }
      const patch = routePacket(s, ctx, W_ADMIN_PV, { cat: 'storage' });
      ridingLabel(s, ctx, 'claimRef: null', W_ADMIN_PV);
      lightBoxAt(s.refs.retPv, ctx, patch.arrivalMs);
    },
  },
  {
    id: 'rebind',
    duration: 3000,
    narration: 'Now the waiting claim binds, and the data that survived the whole story is reachable again. That is the trade Retain makes: it never loses your data, and it never hands it back on its own, so reuse is always a deliberate manual act.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setChips(s, { del: 'removed', delDisk: 'wiped, gone', ret: 'Bound', retDisk: 'in use again' });
      setBoxSublabel(s.refs.retPvc2, 'Bound');
      setWire(s, 'ret', 'bound to PVC data-c');
      // A ball travels this segment on this step, so the segment is a ROUTE and is drawn dashed with
      // a head, not as the solid Bound relation. The solid line is reserved for the resting state,
      // where nothing moves along it. That the claim ended up bound is carried by its own sublabel,
      // the PV-ret chip and the verdict line, all three of which say Bound on this step.
      setStage(s, { delPvc: GONE, delPv: GONE, delDisk: GONE, retPvc: 0, retPvc2: 1, admin: 0, delBound: 0, retBound: 0, retBindLane: 1, adminLane: 0 });
      s.refs.retDisk.classList.add('highlight');
      if (ctx.reduced) { s.refs.retPv.classList.add('highlight'); s.refs.retPvc2.classList.add('highlight'); return; }
      // Only the claim, the ball's source, is lit from the start. The volume lights when the bind
      // reaches it, and the disk lights at the same moment, because the disk becoming reachable IS
      // that arrival. It used to light at step entry, which showed the payoff before the act.
      s.refs.retDisk.classList.remove('highlight');
      s.refs.retPvc2.classList.add('highlight');
      const bind = routePacket(s, ctx, W_RET_BIND, { cat: 'storage' });
      ridingLabel(s, ctx, 'bound', W_RET_BIND);
      lightBoxAt(s.refs.retPv, ctx, bind.arrivalMs);
      lightBoxAt(s.refs.retDisk, ctx, bind.arrivalMs);
    },
  },
];

export const init = makeInit(Scene, STEPS, { posterFirst: true });
