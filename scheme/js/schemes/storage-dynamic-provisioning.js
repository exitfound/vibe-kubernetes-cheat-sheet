import { svg, g, text, line } from '../lib/svg.js';
import { arrowDefs, box, cylinder, pathArrow, animateAlong } from '../lib/primitives.js';
import {
  valChip, setVal, routePacket, routeDur, makeInit, clearHighlights, clearWires, setWire, BEAT,
} from '../lib/storage-kit.js';

// Layout (viewBox 1200x640). Same storage grammar as storage-pvc-binding: the IDENTITY COLUMN at
// x=470 is the spine (PVC on top, the PV that ends up bound to it directly below), and the machinery
// sits in a column to the RIGHT. The difference from the binding card is that here the disk does not
// exist yet: the cylinder is invisible until CreateVolume returns, and the Bound link is drawn only
// once the PV object has been written. The descent is provisioner -> backend (CreateVolume) and the
// ascent is the volume handle coming back, on SEPARATE lanes so the round trip reads as a loop.
// Cylinders and boxes are infrastructure: they light, they never pulse. This card has no Pod at all,
// so nothing pulses, which is exactly why the packet-less first step uses a chip-free box flash.
// The narration overlay owns x<=380 & y<=300, so every block starts at x>=400.
const PVC_X = 400, PVC_Y = 70, PVC_W = 230, PVC_H = 80;
const PVC_RIGHT = PVC_X + PVC_W, PVC_BOTTOM = PVC_Y + PVC_H;   // 630 / 150

const SC_X = 740, SC_Y = 70, SC_W = 300, SC_H = 80;
const SC_LEFT = SC_X, SC_BOTTOM = SC_Y + SC_H;                 // 740 / 150
const SC_CX = SC_X + SC_W / 2;                                 // 890

const PROV_X = 740, PROV_Y = 250, PROV_W = 300, PROV_H = 90;
const PROV_LEFT = PROV_X, PROV_TOP = PROV_Y, PROV_BOTTOM = PROV_Y + PROV_H; // 740 / 250 / 340

const CLOUD_X = 740, CLOUD_Y = 440, CLOUD_W = 300, CLOUD_H = 90;
const CLOUD_TOP = CLOUD_Y;                                     // 440

const PV_X = 420, PV_Y = 430, PV_W = 220, PV_H = 110;
const PV_TOP = PV_Y;                                           // 430

const SPINE_X = 470;    // the identity column: PVC -> PV
const LANE_DY = 15;     // half-gap between the CreateVolume lane and the handle-return lane
const DOWN_X = SC_CX + LANE_DY;  // 905: provisioner -> backend
const UP_X = SC_CX - LANE_DY;    // 875: backend -> provisioner
const CHIPS_Y = 585;

// Each static wire and its ball share one array, so they cannot drift. Every endpoint is a block edge.
const W_SC_REF     = [[PVC_RIGHT, 100], [SC_LEFT, 100]];                                  // reference, no ball
const W_PVC_TO_PROV = [[PVC_RIGHT, 130], [686, 130], [686, 282], [PROV_LEFT, 282]];
const W_SC_TO_PROV  = [[SC_CX, SC_BOTTOM], [SC_CX, PROV_TOP]];
const W_PROV_TO_CLOUD = [[DOWN_X, PROV_BOTTOM], [DOWN_X, CLOUD_TOP]];
const W_CLOUD_TO_PROV = [[UP_X, CLOUD_TOP], [UP_X, PROV_BOTTOM]];
const W_PROV_TO_PV  = [[PROV_LEFT, 312], [690, 312], [690, 396], [560, 396], [560, PV_TOP]];
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

// The only sanctioned block blink, and only on a step with no packet and no Pod, so the card does
// not read frozen. Value chips never blink, so this takes boxes only.
function flashBox(el, ctx, delay = 0) {
  if (!el || ctx.reduced) return;
  ctx.register(el.animate(
    [{ filter: 'brightness(1)' }, { filter: 'brightness(1.55)' }, { filter: 'brightness(1)' }],
    { duration: 600, delay, easing: 'ease-out' },
  ));
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
    const prov  = box({ x: PROV_X, y: PROV_Y, w: PROV_W, h: PROV_H, label: 'external-provisioner', sublabel: 'CSI controller sidecar', cat: 'storage' });
    const cloud = box({ x: CLOUD_X, y: CLOUD_Y, w: CLOUD_W, h: CLOUD_H, label: 'storage backend', sublabel: 'the real disk lives here', cat: 'storage' });

    // The volume does not exist until CreateVolume returns, so it starts invisible.
    const pv = cylinder({ x: PV_X, y: PV_Y, w: PV_W, h: PV_H, label: 'pv-a7f2', cat: 'storage' });
    pv.style.opacity = '0';

    // The claim NAMES its class. Nothing travels this line, so it carries no arrowhead: arrow()
    // always attaches a marker, which would read as a wire missing its ball.
    const scRef = line({ class: 'scheme-arrow scheme-arrow-dashed scheme-arrow-dim scheme-arrow-storage', x1: PVC_RIGHT, y1: 100, x2: SC_LEFT, y2: 100, 'stroke-dasharray': '5 5', fill: 'none' });
    const boundLink = line({ class: 'scheme-arrow scheme-arrow-storage', x1: SPINE_X, y1: PVC_BOTTOM, x2: SPINE_X, y2: PV_TOP, fill: 'none' });
    boundLink.style.opacity = '0';

    const wPvcToProv   = pathArrow({ points: W_PVC_TO_PROV, dashed: true, dim: true, color: 'storage' });
    const wScToProv    = pathArrow({ points: W_SC_TO_PROV, dashed: true, dim: true, color: 'storage' });
    const wProvToCloud = pathArrow({ points: W_PROV_TO_CLOUD, dashed: true, dim: true, color: 'storage' });
    const wCloudToProv = pathArrow({ points: W_CLOUD_TO_PROV, dashed: true, dim: true, color: 'storage' });
    const wProvToPv    = pathArrow({ points: W_PROV_TO_PV, dashed: true, dim: true, color: 'storage' });

    const boundLbl = text({ class: 'scheme-label code dim', x: SPINE_X - 25, y: 296, 'text-anchor': 'end' }, [' ']);
    const callLbl  = text({ class: 'scheme-label code dim', x: DOWN_X + 22, y: 396, 'text-anchor': 'start' }, [' ']);
    const pvLbl    = text({ class: 'scheme-label code dim', x: PV_X + PV_W / 2, y: 566, 'text-anchor': 'middle' }, [' ']);

    const pvcChip  = valChip({ x: 90,  y: CHIPS_Y, w: 210, h: 34, name: 'PVC',   value: 'Pending', cat: 'storage' });
    const scChip   = valChip({ x: 320, y: CHIPS_Y, w: 250, h: 34, name: 'class', value: 'gp3',     cat: 'storage' });
    const diskChip = valChip({ x: 590, y: CHIPS_Y, w: 240, h: 34, name: 'disk',  value: 'none',    cat: 'storage' });
    const pvChip   = valChip({ x: 850, y: CHIPS_Y, w: 230, h: 34, name: 'PV',    value: 'none',    cat: 'storage' });

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
      svg: root, pvc, sc, prov, cloud, pv, boundLink,
      pvcChip, scChip, diskChip, pvChip,
      wires: { bound: boundLbl, call: callLbl, pv: pvLbl },
      packetLayer,
    };
  }

  reset() { this.build(); }
}

function setChips(s, { pvc, sc, disk, pv }) {
  setVal(s.refs.pvcChip, pvc);
  setVal(s.refs.scChip, sc);
  setVal(s.refs.diskChip, disk);
  setVal(s.refs.pvChip, pv);
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
      s.refs.boundLink.style.opacity = '0';
    },
  },
  {
    id: 'nomatch',
    duration: 2100,
    // Packet-less and Pod-less, so a box flash is the sanctioned way to keep it from reading frozen.
    narration: 'With static provisioning an administrator has to create the volume by hand before anyone can claim it. Here nobody did, so there is no candidate to bind to. What saves the claim is the class it names, because that class knows who can build a volume on demand.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setChips(s, { pvc: 'Pending', sc: 'gp3', disk: 'none', pv: 'none' });
      s.refs.pv.style.opacity = '0';
      s.refs.boundLink.style.opacity = '0';
      s.refs.pvc.classList.add('highlight');
      s.refs.sc.classList.add('highlight');
      flashBox(s.refs.sc, ctx, 0);
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
      setChips(s, { pvc: 'Pending', sc: 'gp3', disk: 'vol-0abc123', pv: 'pv-a7f2 created' });
      s.refs.boundLink.style.opacity = '0';
      s.refs.prov.classList.add('highlight');
      s.refs.cloud.classList.add('highlight');
      setWire(s, 'pv', 'backed by vol-0abc123');
      // The volume exists by the end of this step, so its visibility is the static end-state.
      s.refs.pv.style.opacity = '1';
      if (ctx.reduced) { s.refs.pv.classList.add('highlight'); return; }
      const write = routePacket(s, ctx, W_PROV_TO_PV, { cat: 'storage' });
      ridingLabel(s, ctx, 'PV pv-a7f2', W_PROV_TO_PV);
      revealAt(s.refs.pv, ctx, write.arrivalMs);
      lightBoxAt(s.refs.pv, ctx, write.arrivalMs);
    },
  },
  {
    id: 'bind',
    duration: 2600,
    narration: 'The new volume was built for this one claim, so the provisioner already stamped it with a claimRef pointing back. The binding controller sees a matching pair and both turn Bound. Nothing was reused and nothing was picked from a shelf, the volume was made to order.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setChips(s, { pvc: 'Bound', sc: 'gp3', disk: 'vol-0abc123', pv: 'Bound' });
      s.refs.pv.style.opacity = '1';
      s.refs.pvc.classList.add('highlight');
      s.refs.pv.classList.add('highlight');
      setWire(s, 'bound', 'Bound');
      setWire(s, 'pv', 'backed by vol-0abc123');
      s.refs.boundLink.style.opacity = '1';
      if (ctx.reduced) return;
      s.refs.boundLink.style.opacity = '0';
      ctx.register(s.refs.boundLink.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 600, delay: 200, fill: 'forwards', easing: 'ease-out' }));
    },
  },
];

export const init = makeInit(Scene, STEPS, { posterFirst: true });
