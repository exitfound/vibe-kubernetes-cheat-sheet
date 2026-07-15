import { svg, g, text, line } from '../lib/svg.js';
import { arrowDefs, box, cylinder, pathArrow, animateAlong } from '../lib/primitives.js';
import {
  valChip, setVal, setBoxSublabel, routePacket, routeDur,
  makeInit, clearHighlights, clearWires, setWire, BEAT,
} from '../lib/storage-kit.js';

// Layout (viewBox 1200x640). This card is a side-by-side comparison, so the storage stack is drawn
// TWICE: a Delete column on the left and a Retain column on the right, each a claim on top, its bound
// volume in the middle, and the real disk on the shelf at the bottom. The identity column (the bare
// arrowhead-free Bound link) runs down the centre of each stack, because in both columns the claim,
// the PV and the disk start as one bound chain. Deleting the PVC is the event that splits the two
// stories apart. There is no Pod anywhere in this card, so nothing pulses: boxes and cylinders light,
// and the one packet-less split step is allowed a box flash. The narration overlay owns x<=380 &
// y<=300, so every block starts at x>=400.
const PVC_Y = 60, PVC_H = 72, PVC_BOTTOM = PVC_Y + PVC_H;   // 132
const PV_Y = 250, PV_H = 78, PV_TOP = PV_Y, PV_BOTTOM = PV_Y + PV_H; // 250 / 328
const DISK_Y = 450, DISK_H = 100, DISK_TOP = DISK_Y;        // 450
const COL_W = 190;

const DEL_CX = 520, RET_CX = 900;
const DEL_X = DEL_CX - COL_W / 2, RET_X = RET_CX - COL_W / 2; // 425 / 805

const ADMIN_X = 1000, ADMIN_Y = 60, ADMIN_W = 180, ADMIN_H = 72; // the human, top-right, clear of the columns
const ADMIN_CX = ADMIN_X + ADMIN_W / 2;                     // 1090
const RET_RIGHT = RET_CX + COL_W / 2;                       // 995, the Retain PV right edge
const SPEC_Y = DISK_Y + 66;                                 // 516
const VERDICT_Y = 566;
const CHIPS_Y = 585;

const GONE = 0.12;   // an object the API has removed

// Delete branch: the controller calls DeleteVolume straight down the disk column.
const W_DEL_CALL = [[DEL_CX, PV_BOTTOM], [DEL_CX, DISK_TOP]];
// Retain branch: a fresh claim drops onto the Released volume and is turned away.
const W_RET_TRY  = [[RET_CX, PVC_BOTTOM], [RET_CX, PV_TOP]];
// The admin edits the stuck PV by hand to clear its stale claimRef.
const W_ADMIN_PV = [[ADMIN_CX, ADMIN_Y + ADMIN_H], [ADMIN_CX, 286], [RET_RIGHT, 286]];

function lightBoxAt(boxEl, ctx, delay = 0) {
  if (!boxEl) return;
  if (ctx.reduced || delay <= 0) { boxEl.classList.add('highlight'); return; }
  const a = boxEl.animate([{ opacity: 1 }, { opacity: 1 }], { duration: 1, delay });
  a.onfinish = () => boxEl.classList.add('highlight');
  ctx.register(a);
}

// Fades an object out of existence when the delete that removes it lands.
function removeAt(el, ctx, delay = 0, to = GONE) {
  if (!el) return;
  if (ctx.reduced || delay <= 0) { el.style.opacity = String(to); return; }
  ctx.register(el.animate([{ opacity: 1 }, { opacity: to }], { duration: 500, delay, fill: 'forwards', easing: 'ease-in' }));
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

function specText(cx, txt) {
  return text({ class: 'scheme-label code dim', x: cx, y: SPEC_Y, 'text-anchor': 'middle' }, [txt]);
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
      'aria-label': 'Reclaim policy decides what happens to a PersistentVolume and its real disk when the claim is deleted. Under Delete the controller wipes the backing disk and removes the PV object, so everything is cleaned up automatically. Under Retain the PV and the disk both survive but the PV is parked in the Released phase carrying a stale claimRef, so nothing can rebind to it until an administrator clears that reference by hand.',
      'data-style': 'outline',
    });
    root.appendChild(arrowDefs());

    const delPvc = box({ x: DEL_X, y: PVC_Y, w: COL_W, h: PVC_H, label: 'PVC data-a', sublabel: 'Bound', cat: 'storage' });
    const delPv  = box({ x: DEL_X, y: PV_Y, w: COL_W, h: PV_H, label: 'pv-del', sublabel: 'reclaim: Delete', cat: 'storage' });
    const delDisk = cylinder({ x: DEL_CX - 95, y: DISK_Y, w: 190, h: DISK_H, label: 'vol-aaa', cat: 'storage' });

    const retPvc = box({ x: RET_X, y: PVC_Y, w: COL_W, h: PVC_H, label: 'PVC data-b', sublabel: 'Bound', cat: 'storage' });
    const retPv  = box({ x: RET_X, y: PV_Y, w: COL_W, h: PV_H, label: 'pv-ret', sublabel: 'reclaim: Retain', cat: 'storage' });
    const retDisk = cylinder({ x: RET_CX - 95, y: DISK_Y, w: 190, h: DISK_H, label: 'vol-bbb', cat: 'storage' });

    const admin = box({ x: ADMIN_X, y: ADMIN_Y, w: ADMIN_W, h: ADMIN_H, label: 'cluster administrator', sublabel: 'kubectl patch pv', cat: 'storage' });
    admin.style.opacity = '0';

    // The identity columns: the Bound link down each stack, arrowhead-free because a bound relation
    // carries no traffic. Above the disk the volume names its backing disk, also arrowhead-free.
    const delBound = line({ class: 'scheme-arrow scheme-arrow-storage', x1: DEL_CX, y1: PVC_BOTTOM, x2: DEL_CX, y2: PV_TOP, fill: 'none' });
    const delBack  = line({ class: 'scheme-arrow scheme-arrow-dashed scheme-arrow-dim scheme-arrow-storage', x1: DEL_CX, y1: PV_BOTTOM, x2: DEL_CX, y2: DISK_TOP, 'stroke-dasharray': '5 5', fill: 'none' });
    const retBound = line({ class: 'scheme-arrow scheme-arrow-storage', x1: RET_CX, y1: PVC_BOTTOM, x2: RET_CX, y2: PV_TOP, fill: 'none' });
    const retBack  = line({ class: 'scheme-arrow scheme-arrow-dashed scheme-arrow-dim scheme-arrow-storage', x1: RET_CX, y1: PV_BOTTOM, x2: RET_CX, y2: DISK_TOP, 'stroke-dasharray': '5 5', fill: 'none' });

    const wDelCall = pathArrow({ points: W_DEL_CALL, dashed: true, dim: true, color: 'storage' });
    const wRetTry  = pathArrow({ points: W_RET_TRY, dashed: true, dim: true, color: 'storage' });
    const wAdminPv = pathArrow({ points: W_ADMIN_PV, dashed: true, dim: true, color: 'storage' });
    wRetTry.style.opacity = '0';
    wAdminPv.style.opacity = '0';

    const delLbl = text({ class: 'scheme-label code dim', x: DEL_CX, y: VERDICT_Y, 'text-anchor': 'middle' }, [' ']);
    const retLbl = text({ class: 'scheme-label code dim', x: RET_CX, y: VERDICT_Y, 'text-anchor': 'middle' }, [' ']);

    const delChip = valChip({ x: 90,  y: CHIPS_Y, w: 260, h: 34, name: 'Delete side', value: 'PV Bound', cat: 'storage' });
    const delDiskChip = valChip({ x: 370, y: CHIPS_Y, w: 220, h: 34, name: 'vol-aaa', value: 'exists', cat: 'storage' });
    const retChip = valChip({ x: 620, y: CHIPS_Y, w: 250, h: 34, name: 'Retain side', value: 'PV Bound', cat: 'storage' });
    const retDiskChip = valChip({ x: 890, y: CHIPS_Y, w: 220, h: 34, name: 'vol-bbb', value: 'exists', cat: 'storage' });

    const packetLayer = g({ id: 'packetLayer' });

    // Z-order (bottom -> top): blocks, then the identity links and route wires and their labels above
    // them, then the chip strip, then the packet layer so every ball rides above everything.
    [delPvc, delPv, delDisk, retPvc, retPv, retDisk, admin].forEach(el => root.appendChild(el));
    [delBound, delBack, retBound, retBack, wDelCall, wRetTry, wAdminPv].forEach(el => root.appendChild(el));
    [delLbl, retLbl].forEach(el => root.appendChild(el));
    root.appendChild(specText(DEL_CX, 'real disk, EBS'));
    root.appendChild(specText(RET_CX, 'real disk, EBS'));
    [delChip, delDiskChip, retChip, retDiskChip].forEach(c => root.appendChild(c));
    root.appendChild(packetLayer);

    this.host.appendChild(root);
    this.refs = {
      svg: root,
      delPvc, delPv, delDisk, retPvc, retPv, retDisk, admin,
      delBound, retBound, wRetTry, wAdminPv,
      delChip, delDiskChip, retChip, retDiskChip,
      wires: { del: delLbl, ret: retLbl },
      packetLayer,
    };
  }

  reset() { this.build(); }
}

function setChips(s, { del, delDisk, ret, retDisk }) {
  setVal(s.refs.delChip, del);
  setVal(s.refs.delDiskChip, delDisk);
  setVal(s.refs.retChip, ret);
  setVal(s.refs.retDiskChip, retDisk);
}

function clearHL(s) {
  clearHighlights(s, ['delPvc', 'delPv', 'delDisk', 'retPvc', 'retPv', 'retDisk', 'admin',
    'delChip', 'delDiskChip', 'retChip', 'retDiskChip'], []);
  s.refs.delPvc.style.opacity = '1';
  s.refs.delPv.style.opacity = '1';
  s.refs.delDisk.style.opacity = '1';
  s.refs.retPvc.style.opacity = '1';
}

const STEPS = [
  {
    id: 'idle',
    duration: 1500,
    narration: 'Two identical setups: a claim bound to a volume bound to a real disk. The only difference is the reclaim policy stamped on the PV, Delete on the left and Retain on the right. That single field decides what survives when the claim goes away.',
    enter(s) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setChips(s, { del: 'PV Bound', delDisk: 'exists', ret: 'PV Bound', retDisk: 'exists' });
      setBoxSublabel(s.refs.delPvc, 'Bound');
      setBoxSublabel(s.refs.retPvc, 'Bound');
      s.refs.delBound.style.opacity = '1';
      s.refs.retBound.style.opacity = '1';
      s.refs.admin.style.opacity = '0';
      s.refs.wRetTry.style.opacity = '0';
      s.refs.wAdminPv.style.opacity = '0';
    },
  },
  {
    id: 'delete-pvc',
    duration: 2200,
    // Packet-less and Pod-less: a box flash on the two claims is the sanctioned cue.
    narration: 'You delete both claims with kubectl delete pvc. The claims start terminating and their Bound links break. Nothing has touched the volumes yet. What the two PVs do next is decided entirely by their reclaim policy.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setChips(s, { del: 'PVC deleted', delDisk: 'exists', ret: 'PVC deleted', retDisk: 'exists' });
      setBoxSublabel(s.refs.delPvc, 'Terminating');
      setBoxSublabel(s.refs.retPvc, 'Terminating');
      s.refs.delPvc.classList.add('highlight');
      s.refs.retPvc.classList.add('highlight');
      s.refs.delBound.style.opacity = '0';
      s.refs.retBound.style.opacity = '0';
      s.refs.admin.style.opacity = '0';
      // The claims are on their way out, so they end this step faded.
      s.refs.delPvc.style.opacity = '0.4';
      s.refs.retPvc.style.opacity = '0.4';
      if (ctx.reduced) return;
      flashBox(s.refs.delPvc, ctx, 0);
      flashBox(s.refs.retPvc, ctx, 0);
    },
  },
  {
    id: 'delete-branch',
    duration: 3100,
    narration: 'The Delete policy cleans everything up. The controller calls DeleteVolume on the driver, the real disk is wiped, and then the PV object itself is removed. This is convenient for scratch data and dangerous for anything you meant to keep, because the disk is gone for good.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setChips(s, { del: 'PV removed', delDisk: 'wiped and gone', ret: 'PVC deleted', retDisk: 'exists' });
      setBoxSublabel(s.refs.delPvc, 'Terminating');
      setBoxSublabel(s.refs.retPvc, 'Terminating');
      s.refs.delBound.style.opacity = '0';
      s.refs.retBound.style.opacity = '0';
      s.refs.delPvc.style.opacity = GONE;
      s.refs.retPvc.style.opacity = '0.4';
      setWire(s, 'del', 'DeleteVolume, then PV removed');
      // End-state: the disk and the PV are gone on the Delete side.
      s.refs.delDisk.style.opacity = GONE;
      s.refs.delPv.style.opacity = GONE;
      if (ctx.reduced) return;
      s.refs.delDisk.style.opacity = '1';
      s.refs.delPv.style.opacity = '1';
      const call = routePacket(s, ctx, W_DEL_CALL, { cat: 'storage' });
      ridingLabel(s, ctx, 'DeleteVolume', W_DEL_CALL);
      removeAt(s.refs.delDisk, ctx, call.arrivalMs);
      removeAt(s.refs.delPv, ctx, call.arrivalMs + 400);
    },
  },
  {
    id: 'retain-branch',
    duration: 2400,
    // Packet-less and Pod-less: the phase change carries the step, with a flash on the surviving PV.
    narration: 'The Retain policy touches nothing. The PV and its disk both survive with all their data. The volume moves to the Released phase, which means its claim is gone but the volume is not free: it still carries the old claimRef pointing at a claim that no longer exists.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setChips(s, { del: 'PV removed', delDisk: 'gone', ret: 'PV Released', retDisk: 'kept, data intact' });
      setBoxSublabel(s.refs.retPv, 'Released, stale claimRef');
      s.refs.delPvc.style.opacity = GONE;
      s.refs.delPv.style.opacity = GONE;
      s.refs.delDisk.style.opacity = GONE;
      s.refs.retPvc.style.opacity = GONE;
      s.refs.retPv.classList.add('highlight');
      s.refs.retDisk.classList.add('highlight');
      s.refs.delBound.style.opacity = '0';
      s.refs.retBound.style.opacity = '0';
      setWire(s, 'ret', 'Released, data kept');
      if (ctx.reduced) return;
      flashBox(s.refs.retPv, ctx, 0);
    },
  },
  {
    id: 'retain-stuck',
    duration: 2800,
    narration: 'A brand new claim asking for the same storage cannot use the Released volume. The binding controller sees the leftover claimRef, decides the volume is spoken for, and skips it. The new claim stays Pending, which is the classic surprise of Retain: the disk is right there but nothing can reach it.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setChips(s, { del: 'PV removed', delDisk: 'gone', ret: 'new claim Pending', retDisk: 'kept, unusable' });
      setBoxSublabel(s.refs.retPvc, 'new claim, Pending');
      s.refs.delPvc.style.opacity = GONE;
      s.refs.delPv.style.opacity = GONE;
      s.refs.delDisk.style.opacity = GONE;
      s.refs.retPv.classList.add('highlight');
      // A fresh claim reappears in the top slot to try for the volume.
      s.refs.retPvc.style.opacity = '1';
      s.refs.wRetTry.style.opacity = '1';
      setWire(s, 'ret', 'blocked by stale claimRef');
      if (ctx.reduced) return;
      const tryBind = routePacket(s, ctx, W_RET_TRY, { cat: 'storage' });
      ridingLabel(s, ctx, 'bind me', W_RET_TRY);
      lightBoxAt(s.refs.retPv, ctx, tryBind.arrivalMs);
    },
  },
  {
    id: 'admin-clears',
    duration: 3000,
    narration: 'Only a human breaks the deadlock. An administrator edits the PV and removes the claimRef by hand. With the reference cleared the volume returns to Available, and now the waiting claim can finally bind to it. Retain keeps your data safe but it makes reuse a deliberate manual act.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setChips(s, { del: 'PV removed', delDisk: 'gone', ret: 'PV Available', retDisk: 'kept, reusable' });
      setBoxSublabel(s.refs.retPv, 'Available, claimRef cleared');
      s.refs.delPvc.style.opacity = GONE;
      s.refs.delPv.style.opacity = GONE;
      s.refs.delDisk.style.opacity = GONE;
      s.refs.retPvc.style.opacity = '1';
      s.refs.admin.style.opacity = '1';
      s.refs.wAdminPv.style.opacity = '1';
      setWire(s, 'ret', 'claimRef cleared, Available');
      if (ctx.reduced) { s.refs.retPv.classList.add('highlight'); return; }
      const patch = routePacket(s, ctx, W_ADMIN_PV, { cat: 'storage' });
      ridingLabel(s, ctx, 'claimRef: null', W_ADMIN_PV);
      lightBoxAt(s.refs.retPv, ctx, patch.arrivalMs);
    },
  },
];

export const init = makeInit(Scene, STEPS, { posterFirst: true });
