import { svg, g, text, line } from '../lib/svg.js';
import { arrowDefs, box, cylinder, pathArrow } from '../lib/primitives.js';
import { valChip, setVal, routePacket, makeInit, clearHighlights, clearWires, setWire, relationPath, BEAT, lightBoxAt, makeRidingLabel, revealAt } from '../lib/storage-kit.js';
// Design notes for this card: scheme/docs/CARDS.md#storage-dynamic-provisioning


const LEFT_X = 400;                                   // leftmost the TOP ROW may go, all viewports
const CANVAS_CX = 600;                                // where the chip strip sits, always

const COL_L_W = 200;                                  // identity column: the claim and its volume
const COL_R_W = 220;                                  // machinery column: class, provisioner, backend
const COL_GAP = 40;                                   // the elbow channel lives in here
const COL_R_X = LEFT_X + COL_L_W + COL_GAP;           // 640
// The claim tier sits inside the narration panel's y band, so the left edge is pinned at 400 and the
// composition is centred by pulling the machinery column in, not by sliding the whole card left.
const RIGHT_END = COL_R_X + COL_R_W;                  // 860, so the drawing centres on 630

const PVC_X = LEFT_X, PVC_Y = 70, PVC_W = COL_L_W, PVC_H = 80;
const PVC_RIGHT = PVC_X + PVC_W, PVC_BOTTOM = PVC_Y + PVC_H;   // 540 / 150

const SC_X = COL_R_X, SC_Y = 70, SC_W = COL_R_W, SC_H = 80;
const SC_LEFT = SC_X, SC_BOTTOM = SC_Y + SC_H;                 // 640 / 150
const SC_CX = SC_X + SC_W / 2;                                 // 750
const ROW_MY = SC_Y + SC_H / 2;                                // 110, shared by the claim and the class

const PROV_X = COL_R_X, PROV_Y = 250, PROV_W = COL_R_W, PROV_H = 90;
const PROV_LEFT = PROV_X, PROV_TOP = PROV_Y, PROV_BOTTOM = PROV_Y + PROV_H; // 640 / 250 / 340
const PROV_MY = PROV_Y + PROV_H / 2;                                        // 295

const CLOUD_X = COL_R_X, CLOUD_Y = 440, CLOUD_W = COL_R_W, CLOUD_H = 90;
const CLOUD_TOP = CLOUD_Y;                                     // 440

// The cylinder sits exactly under the claim, same width and same x, so the identity column reads as
// one stack rather than two blocks that happen to be near each other.
const PV_X = LEFT_X, PV_Y = 430, PV_W = COL_L_W, PV_H = 110;
const PV_TOP = PV_Y;                                           // 430
const PV_CX = PV_X + PV_W / 2;                                 // 440

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
  acc.push(i === 0 ? CANVAS_CX - CHIPS_W / 2 : acc[i - 1] + CHIP_W[i - 1] + CHIP_GAP);
  return acc;
}, []);                                                                               // 105 / 335 / 605 / 865

const ELBOW_X = PVC_RIGHT + COL_GAP / 2;   // 620

// Two lanes share each of these two faces, so they sit as a mirrored pair either side of the face
// midpoint: alone and off-centre, a single endpoint reads as a slip rather than as a pair.
const ROW_LANE = 12, PROV_LANE = 16;

// Each static wire and its ball share one array, so they cannot drift. Every endpoint is a block edge.
const W_SC_REF     = [[PVC_RIGHT, ROW_MY - ROW_LANE], [SC_LEFT, ROW_MY - ROW_LANE]];      // reference, no ball
const W_PVC_TO_PROV = [[PVC_RIGHT, ROW_MY + ROW_LANE], [ELBOW_X, ROW_MY + ROW_LANE], [ELBOW_X, PROV_MY - PROV_LANE], [PROV_LEFT, PROV_MY - PROV_LANE]];
const W_SC_TO_PROV  = [[SC_CX, SC_BOTTOM], [SC_CX, PROV_TOP]];
const W_PROV_TO_CLOUD = [[DOWN_X, PROV_BOTTOM], [DOWN_X, CLOUD_TOP]];
const W_CLOUD_TO_PROV = [[UP_X, CLOUD_TOP], [UP_X, PROV_BOTTOM]];
const W_PROV_TO_PV  = [[PROV_LEFT, PROV_MY + PROV_LANE], [ELBOW_X, PROV_MY + PROV_LANE], [ELBOW_X, 396], [PV_CX, 396], [PV_CX, PV_TOP]];
const W_BOUND       = [[SPINE_X, PVC_BOTTOM], [SPINE_X, PV_TOP]];

// The tag that rides a ball on this card. Constants preserved from its hand-rolled copy.
const ridingLabel = makeRidingLabel({ role: 'storage' });

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

    const pvc   = box({ x: PVC_X, y: PVC_Y, w: PVC_W, h: PVC_H, label: 'PVC data-claim', sublabel: 'wants 5Gi, class gp3', role: 'storage' });
    const sc    = box({ x: SC_X, y: SC_Y, w: SC_W, h: SC_H, label: 'StorageClass gp3', sublabel: 'provisioner: ebs.csi.aws.com', role: 'storage' });
    const prov  = box({ x: PROV_X, y: PROV_Y, w: PROV_W, h: PROV_H, label: 'External-provisioner', sublabel: 'CSI controller sidecar', role: 'storage' });
    const cloud = box({ x: CLOUD_X, y: CLOUD_Y, w: CLOUD_W, h: CLOUD_H, label: 'Storage backend', sublabel: 'reached via the CSI driver', role: 'storage' });

    // The volume does not exist until CreateVolume returns, so it starts invisible.
    const pv = cylinder({ x: PV_X, y: PV_Y, w: PV_W, h: PV_H, label: 'PV-a7f2', role: 'storage' });
    pv.style.opacity = '0';

    const [[bndX1, bndY1], [bndX2, bndY2]] = W_BOUND;
    const scRef = relationPath({ points: W_SC_REF, role: 'storage', dash: '5 5' });
    const boundLink = line({ class: 'scheme-arrow scheme-arrow-storage', x1: bndX1, y1: bndY1, x2: bndX2, y2: bndY2, fill: 'none' });
    boundLink.style.opacity = '0';

    const wPvcToProv   = pathArrow({ points: W_PVC_TO_PROV, dashed: true, dim: true, role: 'storage' });
    const wScToProv    = pathArrow({ points: W_SC_TO_PROV, dashed: true, dim: true, role: 'storage' });
    const wProvToCloud = pathArrow({ points: W_PROV_TO_CLOUD, dashed: true, dim: true, role: 'storage' });
    const wCloudToProv = pathArrow({ points: W_CLOUD_TO_PROV, dashed: true, dim: true, role: 'storage' });
    const wProvToPv    = pathArrow({ points: W_PROV_TO_PV, dashed: true, dim: true, role: 'storage' });
    wProvToPv.style.opacity = '0';

    const boundLbl = text({ class: 'scheme-label code dim', x: SPINE_X + 22, y: 296, 'text-anchor': 'start' }, [' ']);
    const callLbl  = text({ class: 'scheme-label code dim', x: DOWN_X + 22, y: 396, 'text-anchor': 'start' }, [' ']);
    const pvLbl    = text({ class: 'scheme-label code dim', x: PV_X + PV_W / 2, y: 566, 'text-anchor': 'middle' }, [' ']);

    const chipX = CHIPS_X0;
    const pvcChip  = valChip({ x: chipX[0], y: CHIPS_Y, w: CHIP_W[0], h: 34, name: 'PVC',   value: 'Pending', role: 'storage' });
    const scChip   = valChip({ x: chipX[1], y: CHIPS_Y, w: CHIP_W[1], h: 34, name: 'class', value: 'gp3',     role: 'storage' });
    const diskChip = valChip({ x: chipX[2], y: CHIPS_Y, w: CHIP_W[2], h: 34, name: 'disk',  value: 'none',    role: 'storage' });
    const pvChip   = valChip({ x: chipX[3], y: CHIPS_Y, w: CHIP_W[3], h: 34, name: 'PV',    value: 'none',    role: 'storage' });

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
      const claim = routePacket(s, ctx, W_PVC_TO_PROV, { role: 'storage' });
      ridingLabel(s, ctx, '5Gi, class gp3', W_PVC_TO_PROV);
      const params = routePacket(s, ctx, W_SC_TO_PROV, { role: 'storage' });
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
      setWire(s, 'call', 'CreateVolume');
      // The provisioner calls, so it is lit from entry. The backend was lit here as well, which hid
      // its own lightBoxAt below: a call cannot land on a block that was already answering.
      if (ctx.reduced) { s.refs.cloud.classList.add('highlight'); return; }
      // Descent then ascent, on separate lanes, so the round trip reads as a loop, not a retrace.
      const call = routePacket(s, ctx, W_PROV_TO_CLOUD, { role: 'storage' });
      ridingLabel(s, ctx, 'CreateVolume 5Gi', W_PROV_TO_CLOUD);
      lightBoxAt(s.refs.cloud, ctx, call.arrivalMs);
      const back = routePacket(s, ctx, W_CLOUD_TO_PROV, { delay: call.arrivalMs + BEAT.afterHop, role: 'storage' });
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
      const write = routePacket(s, ctx, W_PROV_TO_PV, { role: 'storage' });
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
