import { svg, g, text, line } from '../lib/svg.js';
import { arrowDefs, box, cylinder, pathArrow, animateAlong } from '../lib/primitives.js';
import {
  valChip, setVal, routePacket, routeDur, makeInit, clearHighlights, clearWires, setWire, BEAT,
} from '../lib/storage-kit.js';

// Layout (viewBox 1200x640). Same storage grammar as storage-pvc-binding: the IDENTITY COLUMN is the
// spine (PVC on top, the PV that ends up bound to it directly below, both the same width and x), and
// the machinery sits in a column to the RIGHT. The difference from the binding card is that here the disk does not
// exist yet: the cylinder is invisible until CreateVolume returns, and the Bound link is drawn only
// once the PV object has been written. The descent is provisioner -> backend (CreateVolume) and the
// ascent is the volume handle coming back, on SEPARATE lanes so the round trip reads as a loop.
// Cylinders and boxes are infrastructure: they light, they never pulse. This card has no Pod at all,
// so NOTHING in it pulses or blinks: the packet-less first step is fully static by design and its
// read is carried by the .highlight outline alone.
//
// ---- Horizontal composition, derived rather than hand-placed ----
// Every tier (the two columns and the chip strip) shares ONE center, CONTENT_CX, instead of each
// carrying its own hand-typed margins. That shared center is NOT the canvas center, and it cannot be:
// the narration overlay permanently occupies the top left and the top row sits inside its band.
//
// Do not "improve" this by measuring the overlay at your own window size and sliding LEFT_X leftward.
// The overlay is HTML laid over the SVG, so the NARROWER the window, the MORE viewBox units it eats.
// Measured right edge by viewport: 185 at 1920 wide, 275 at 1600, 322 at 1400, 342 at 1280, 379 at
// 1100 and below. The blanket x<=380 rule is that worst case, not a pessimistic guess, so LEFT_X 400
// keeps a real margin at every window size. A left edge picked from a single wide-window measurement
// looks centered on the machine it was tuned on and slides under the overlay on a laptop.
const LEFT_X = 400;                                   // leftmost the TOP ROW may go, all viewports
const CONTENT_W = 520;
const RIGHT_END = LEFT_X + CONTENT_W;                 // 920
const CONTENT_CX = LEFT_X + CONTENT_W / 2;            // 660: the one center every tier uses

const COL_L_W = 200;                                  // identity column: the claim and its volume
const COL_R_W = 240;                                  // machinery column: class, provisioner, backend
const COL_R_X = RIGHT_END - COL_R_W;                  // 620
const COL_GAP = COL_R_X - (LEFT_X + COL_L_W);         // 80: the elbow channel lives in here

const PVC_X = LEFT_X, PVC_Y = 70, PVC_W = COL_L_W, PVC_H = 80;
const PVC_RIGHT = PVC_X + PVC_W, PVC_BOTTOM = PVC_Y + PVC_H;   // 540 / 150

const SC_X = COL_R_X, SC_Y = 70, SC_W = COL_R_W, SC_H = 80;
const SC_LEFT = SC_X, SC_BOTTOM = SC_Y + SC_H;                 // 620 / 150
const SC_CX = SC_X + SC_W / 2;                                 // 740

const PROV_X = COL_R_X, PROV_Y = 250, PROV_W = COL_R_W, PROV_H = 90;
const PROV_LEFT = PROV_X, PROV_TOP = PROV_Y, PROV_BOTTOM = PROV_Y + PROV_H; // 620 / 250 / 340

const CLOUD_X = COL_R_X, CLOUD_Y = 440, CLOUD_W = COL_R_W, CLOUD_H = 90;
const CLOUD_TOP = CLOUD_Y;                                     // 440

// The cylinder sits exactly under the claim, same width and same x, so the identity column reads as
// one stack rather than two blocks that happen to be near each other.
const PV_X = LEFT_X, PV_Y = 430, PV_W = COL_L_W, PV_H = 110;
const PV_TOP = PV_Y;                                           // 430
const PV_CX = PV_X + PV_W / 2;                                 // 440

// The identity spine and the PV write BOTH run down the center of the identity column. They can share
// that x because they are never on screen together: the write arrow shows only while the PV is being
// created, the spine only once it is bound. Any other arrangement puts one of them off center.
const SPINE_X = PV_CX;  // 440
const LANE_DY = 15;     // half-gap between the CreateVolume lane and the handle-return lane
const DOWN_X = SC_CX + LANE_DY;  // 755: provisioner -> backend
const UP_X = SC_CX - LANE_DY;    // 725: backend -> provisioner
const CHIPS_Y = 585;

// Chip widths keep their hand-tuned values (each is sized for its longest value, PV holds
// 'PV-a7f2 created'), but the x positions are DERIVED so the strip is centered on CANVAS_CX.
const CHIP_W = [210, 250, 240, 230];
const CHIP_GAP = 20;
const CHIPS_W = CHIP_W.reduce((a, b) => a + b, 0) + CHIP_GAP * (CHIP_W.length - 1);   // 990
const CHIPS_X0 = CHIP_W.reduce((acc, w, i) => {
  acc.push(i === 0 ? CONTENT_CX - CHIPS_W / 2 : acc[i - 1] + CHIP_W[i - 1] + CHIP_GAP);
  return acc;
}, []);                                                                               // 105 / 335 / 605 / 865

// The ONE vertical channel in the gap between the PVC column and the provisioner column. Both the
// claim descending into the provisioner and the PV write leaving it turn on this x, and their
// vertical runs do not overlap in y (130..282 above, 312..396 below), so sharing the channel reads
// as one clean lane. They used to sit at 686 and 690: a 4px offset, far too small to register as a
// deliberate lane split (those use LANE_DY, 15) and so it just looked like a misalignment. Derived
// from the gap so it stays centered in it if either column is ever resized.
const ELBOW_X = PVC_RIGHT + COL_GAP / 2;   // 580

// Each static wire and its ball share one array, so they cannot drift. Every endpoint is a block edge.
const W_SC_REF     = [[PVC_RIGHT, 100], [SC_LEFT, 100]];                                  // reference, no ball
const W_PVC_TO_PROV = [[PVC_RIGHT, 130], [ELBOW_X, 130], [ELBOW_X, 282], [PROV_LEFT, 282]];
const W_SC_TO_PROV  = [[SC_CX, SC_BOTTOM], [SC_CX, PROV_TOP]];
const W_PROV_TO_CLOUD = [[DOWN_X, PROV_BOTTOM], [DOWN_X, CLOUD_TOP]];
const W_CLOUD_TO_PROV = [[UP_X, CLOUD_TOP], [UP_X, PROV_BOTTOM]];
const W_PROV_TO_PV  = [[PROV_LEFT, 312], [ELBOW_X, 312], [ELBOW_X, 396], [PV_CX, 396], [PV_CX, PV_TOP]];
const W_BOUND       = [[SPINE_X, PVC_BOTTOM], [SPINE_X, PV_TOP]];

function lightBoxAt(boxEl, ctx, delay = 0) {
  if (!boxEl) return;
  if (ctx.reduced || delay <= 0) { boxEl.classList.add('highlight'); return; }
  const a = boxEl.animate([{ opacity: 1 }, { opacity: 1 }], { duration: 1, delay });
  a.onfinish = () => boxEl.classList.add('highlight');
  ctx.register(a);
}

// Reveals the disk (or any hidden block) exactly when the packet that creates it lands.
function revealAt(el, ctx, delay = 0) {
  if (!el) return;
  if (ctx.reduced || delay <= 0) { el.style.opacity = '1'; return; }
  el.style.opacity = '0';
  ctx.register(el.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 500, delay, fill: 'forwards', easing: 'ease-out' }));
}

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

class Scene {
  constructor(host) { this.host = host; this.refs = {}; this.build(); }

  build() {
    this.host.replaceChildren();
    this.refs = {};
    const root = svg({
      class: 'diagram',
      viewBox: '0 0 1200 640',
      preserveAspectRatio: 'xMidYMid meet',
      'aria-label': 'Dynamic provisioning: a claim finds no existing volume to bind to, so the StorageClass it names points at a provisioner, the provisioner asks the storage backend to create a real disk, writes a PersistentVolume object to represent it, and that brand new volume is bound to the claim straight away',
      'data-style': 'outline',
    });
    root.appendChild(arrowDefs());

    const pvc   = box({ x: PVC_X, y: PVC_Y, w: PVC_W, h: PVC_H, label: 'PVC data-claim', sublabel: 'wants 5Gi, class gp3', cat: 'storage' });
    const sc    = box({ x: SC_X, y: SC_Y, w: SC_W, h: SC_H, label: 'StorageClass gp3', sublabel: 'provisioner: ebs.csi.aws.com', cat: 'storage' });
    const prov  = box({ x: PROV_X, y: PROV_Y, w: PROV_W, h: PROV_H, label: 'External-provisioner', sublabel: 'CSI controller sidecar', cat: 'storage' });
    // Sublabel names the CSI driver because the narration says CreateVolume is called ON the driver,
    // and the driver has no box of its own: the ball lands here, so this box has to admit it is the
    // driver plus the backend behind it, or the text names an actor the picture does not have.
    const cloud = box({ x: CLOUD_X, y: CLOUD_Y, w: CLOUD_W, h: CLOUD_H, label: 'Storage Backend', sublabel: 'reached via the CSI driver', cat: 'storage' });

    // The volume does not exist until CreateVolume returns, so it starts invisible.
    const pv = cylinder({ x: PV_X, y: PV_Y, w: PV_W, h: PV_H, label: 'PV-a7f2', cat: 'storage' });
    pv.style.opacity = '0';

    // The claim NAMES its class. Nothing travels this line, so it carries no arrowhead: arrow()
    // always attaches a marker, which would read as a wire missing its ball.
    // Both of these are driven FROM their points arrays, not from repeated literals. They used to be
    // built from hand-copied coordinates while W_SC_REF and W_BOUND sat unused, so editing either
    // constant moved nothing and the two could silently drift apart.
    const [[scRefX1, scRefY1], [scRefX2, scRefY2]] = W_SC_REF;
    const [[bndX1, bndY1], [bndX2, bndY2]] = W_BOUND;
    const scRef = line({ class: 'scheme-arrow scheme-arrow-dashed scheme-arrow-dim scheme-arrow-storage', x1: scRefX1, y1: scRefY1, x2: scRefX2, y2: scRefY2, 'stroke-dasharray': '5 5', fill: 'none' });
    const boundLink = line({ class: 'scheme-arrow scheme-arrow-storage', x1: bndX1, y1: bndY1, x2: bndX2, y2: bndY2, fill: 'none' });
    boundLink.style.opacity = '0';

    const wPvcToProv   = pathArrow({ points: W_PVC_TO_PROV, dashed: true, dim: true, color: 'storage' });
    const wScToProv    = pathArrow({ points: W_SC_TO_PROV, dashed: true, dim: true, color: 'storage' });
    const wProvToCloud = pathArrow({ points: W_PROV_TO_CLOUD, dashed: true, dim: true, color: 'storage' });
    const wCloudToProv = pathArrow({ points: W_CLOUD_TO_PROV, dashed: true, dim: true, color: 'storage' });
    // Hidden until the step that writes the PV. This wire points AT the cylinder, and the cylinder
    // does not exist until CreateVolume has returned, so drawing it from step 0 was an arrow aimed
    // at blank canvas. It appears at the ENTRY of the createpv step (the ball has to have a wire to
    // ride) while the cylinder itself still appears later, on that ball landing.
    const wProvToPv    = pathArrow({ points: W_PROV_TO_PV, dashed: true, dim: true, color: 'storage' });
    wProvToPv.style.opacity = '0';

    // Anchored to the RIGHT of the spine, growing away from the overlay. Left-anchored it reaches back
    // to x=286 at its current length, and the overlay drops to y=342 on a small window (measured at
    // 900x650), which puts this label at y=296 squarely underneath it. It only looked safe on a wide
    // window, where the overlay stops at y=172.
    const boundLbl = text({ class: 'scheme-label code dim', x: SPINE_X + 22, y: 296, 'text-anchor': 'start' }, [' ']);
    const callLbl  = text({ class: 'scheme-label code dim', x: DOWN_X + 22, y: 396, 'text-anchor': 'start' }, [' ']);
    const pvLbl    = text({ class: 'scheme-label code dim', x: PV_X + PV_W / 2, y: 566, 'text-anchor': 'middle' }, [' ']);

    // The strip is laid out from its own total width so it centers on CANVAS_CX, the same center the
    // blocks above use. Hand-placed x values had it spanning 90..1080, a center of 585, so the whole
    // bottom row sat 15px left of the diagram it belongs to.
    const chipX = CHIPS_X0;
    const pvcChip  = valChip({ x: chipX[0], y: CHIPS_Y, w: CHIP_W[0], h: 34, name: 'PVC',   value: 'Pending', cat: 'storage' });
    const scChip   = valChip({ x: chipX[1], y: CHIPS_Y, w: CHIP_W[1], h: 34, name: 'class', value: 'gp3',     cat: 'storage' });
    const diskChip = valChip({ x: chipX[2], y: CHIPS_Y, w: CHIP_W[2], h: 34, name: 'disk',  value: 'none',    cat: 'storage' });
    const pvChip   = valChip({ x: chipX[3], y: CHIPS_Y, w: CHIP_W[3], h: 34, name: 'PV',    value: 'none',    cat: 'storage' });

    const packetLayer = g({ id: 'packetLayer' });

    // Z-order (bottom -> top): blocks, then wires and their labels above them, then the chip strip,
    // then the packet layer so every ball rides above everything.
    [pvc, sc, prov, cloud, pv].forEach(el => root.appendChild(el));
    [scRef, boundLink, wPvcToProv, wScToProv, wProvToCloud, wCloudToProv, wProvToPv].forEach(el => root.appendChild(el));
    [boundLbl, callLbl, pvLbl].forEach(el => root.appendChild(el));
    [pvcChip, scChip, diskChip, pvChip].forEach(c => root.appendChild(c));
    root.appendChild(packetLayer);

    this.host.appendChild(root);
    this.refs = {
      svg: root, pvc, sc, prov, cloud, pv, boundLink, wProvToPv,
      pvcChip, scChip, diskChip, pvChip,
      wires: { bound: boundLbl, call: callLbl, pv: pvLbl },
      packetLayer,
    };
  }

  reset() { this.build(); }
}

// A chip whose value CHANGED this step also lights (static highlight, never a flash): valueText still
// holds the previous step's text at call time (clearHL clears the highlight class, not the text), and
// steps are always entered in order (gotoStep rebuilds then replays 0..target), so the diff is
// deterministic. Same helper as storage-pvc-binding, this is the catalog-wide chip pattern.
function setChip(chip, val) {
  const changed = chip && chip.valueText && chip.valueText.textContent !== String(val);
  setVal(chip, val);
  if (changed) chip.classList.add('highlight');
}
function setChips(s, { pvc, sc, disk, pv }) {
  setChip(s.refs.pvcChip, pvc);
  setChip(s.refs.scChip, sc);
  setChip(s.refs.diskChip, disk);
  setChip(s.refs.pvChip, pv);
}

function clearHL(s) {
  clearHighlights(s, ['pvc', 'sc', 'prov', 'cloud', 'pv', 'pvcChip', 'scChip', 'diskChip', 'pvChip'], []);
}

const STEPS = [
  {
    id: 'idle',
    duration: 1500,
    narration: 'A claim asks for 5Gi of the gp3 class. Nothing in the cluster matches it, and unlike static provisioning there is no volume sitting there waiting to be picked. The claim is Pending and the disk it needs does not exist anywhere yet.',
    enter(s) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setChips(s, { pvc: 'Pending', sc: 'gp3', disk: 'none', pv: 'none' });
      s.refs.pv.style.opacity = '0';
      s.refs.wProvToPv.style.opacity = '0';
      s.refs.boundLink.style.opacity = '0';
    },
  },
  {
    id: 'nomatch',
    duration: 2100,
    // Deliberately motionless. A box flash would be canon-legal here (packet-less and Pod-less) but
    // was tried and rejected: the StorageClass is being READ in this step, not acting, and a blink
    // reads as the block doing something. The static .highlight outline carries it.
    narration: 'With static provisioning an administrator has to create the volume by hand before anyone can claim it. Here nobody did, so there is no candidate to bind to. What saves the claim is the class it names, because that class knows who can build a volume on demand.',
    enter(s) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setChips(s, { pvc: 'Pending', sc: 'gp3', disk: 'none', pv: 'none' });
      s.refs.pv.style.opacity = '0';
      s.refs.wProvToPv.style.opacity = '0';
      s.refs.boundLink.style.opacity = '0';
      s.refs.pvc.classList.add('highlight');
      s.refs.sc.classList.add('highlight');
    },
  },
  {
    id: 'provision',
    duration: 2600,
    narration: 'The StorageClass is the piece of configuration that names a provisioner and the parameters to build with. The external-provisioner sidecar watches for Pending claims that point at a class it owns, picks this one up, and reads both the size the claim asks for and the settings the class carries.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setChips(s, { pvc: 'Pending', sc: 'gp3', disk: 'none', pv: 'none' });
      s.refs.pv.style.opacity = '0';
      s.refs.wProvToPv.style.opacity = '0';
      s.refs.boundLink.style.opacity = '0';
      s.refs.pvc.classList.add('highlight');
      s.refs.sc.classList.add('highlight');
      if (ctx.reduced) { s.refs.prov.classList.add('highlight'); return; }
      const claim = routePacket(s, ctx, W_PVC_TO_PROV, { cat: 'storage' });
      ridingLabel(s, ctx, '5Gi, class gp3', W_PVC_TO_PROV);
      const params = routePacket(s, ctx, W_SC_TO_PROV, { cat: 'storage' });
      ridingLabel(s, ctx, 'ebs.csi.aws.com', W_SC_TO_PROV);
      lightBoxAt(s.refs.prov, ctx, Math.max(claim.arrivalMs, params.arrivalMs));
    },
  },
  {
    id: 'createvolume',
    duration: 3400,
    narration: 'The provisioner calls CreateVolume on the driver, which asks the storage backend for a real disk of the requested size. The backend carves one out and hands back the identifier it can be addressed by later. This is the only step where anything physical actually happens.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setChips(s, { pvc: 'Pending', sc: 'gp3', disk: 'vol-0abc123', pv: 'none' });
      s.refs.pv.style.opacity = '0';
      s.refs.wProvToPv.style.opacity = '0';
      s.refs.boundLink.style.opacity = '0';
      s.refs.prov.classList.add('highlight');
      s.refs.cloud.classList.add('highlight');
      setWire(s, 'call', 'CreateVolume');
      if (ctx.reduced) return;
      // Descent then ascent, on separate lanes, so the round trip reads as a loop, not a retrace.
      const call = routePacket(s, ctx, W_PROV_TO_CLOUD, { cat: 'storage' });
      ridingLabel(s, ctx, 'CreateVolume 5Gi', W_PROV_TO_CLOUD);
      lightBoxAt(s.refs.cloud, ctx, call.arrivalMs);
      const back = routePacket(s, ctx, W_CLOUD_TO_PROV, { delay: call.arrivalMs + BEAT.afterHop, cat: 'storage' });
      ridingLabel(s, ctx, 'vol-0abc123', W_CLOUD_TO_PROV, { delay: call.arrivalMs + BEAT.afterHop });
      lightBoxAt(s.refs.prov, ctx, back.arrivalMs);
    },
  },
  {
    id: 'createpv',
    duration: 3000,
    narration: 'A disk on its own is invisible to Kubernetes. The provisioner writes a PersistentVolume object carrying the identifier it just got back, and that object is the cluster representation of the disk. Only now does the volume exist as something a claim can be paired with.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setChips(s, { pvc: 'Pending', sc: 'gp3', disk: 'vol-0abc123', pv: 'PV-a7f2 created' });
      s.refs.wProvToPv.style.opacity = '1';
      s.refs.boundLink.style.opacity = '0';
      s.refs.prov.classList.add('highlight');
      s.refs.cloud.classList.add('highlight');
      setWire(s, 'pv', 'backed by vol-0abc123');
      // The volume exists by the end of this step, so its visibility is the static end-state.
      s.refs.pv.style.opacity = '1';
      if (ctx.reduced) { s.refs.pv.classList.add('highlight'); return; }
      const write = routePacket(s, ctx, W_PROV_TO_PV, { cat: 'storage' });
      ridingLabel(s, ctx, 'PV PV-a7f2', W_PROV_TO_PV);
      revealAt(s.refs.pv, ctx, write.arrivalMs);
      lightBoxAt(s.refs.pv, ctx, write.arrivalMs);
    },
  },
  {
    id: 'bind',
    duration: 2600,
    narration: 'The new volume was built for this one claim, so the provisioner already stamped it with a claimRef pointing back at the claim. There is nothing to search for and no shelf to pick from, so the pair goes straight to Bound. The volume was made to order.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setChips(s, { pvc: 'Bound', sc: 'gp3', disk: 'vol-0abc123', pv: 'Bound' });
      s.refs.pv.style.opacity = '1';
      s.refs.pvc.classList.add('highlight');
      s.refs.pv.classList.add('highlight');
      setWire(s, 'bound', 'claimRef: data-claim');
      setWire(s, 'pv', 'backed by vol-0abc123');
      // The write arrow is retired here: it shares the identity column center with the spine, so the
      // two must never be on screen at once. It has also done its job, this step is about the pairing.
      s.refs.wProvToPv.style.opacity = '0';
      s.refs.boundLink.style.opacity = '1';
      if (ctx.reduced) return;
      s.refs.boundLink.style.opacity = '0';
      // delay 0, not 200: the claimRef wire label is static (set above the guard) so it is on screen
      // from the first frame. Any delay here leaves it captioning a link that does not exist yet.
      ctx.register(s.refs.boundLink.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 600, delay: 0, fill: 'forwards', easing: 'ease-out' }));
    },
  },
];

export const init = makeInit(Scene, STEPS, { posterFirst: true });
