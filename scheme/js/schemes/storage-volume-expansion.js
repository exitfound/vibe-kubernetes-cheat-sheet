import { svg, g, text, line } from '../lib/svg.js';
import { arrowDefs, box, pod, cylinder, pathArrow, animateAlong } from '../lib/primitives.js';
import {
  valChip, setVal, setBoxSublabel, pulsePod, routePacket, routeDur,
  makeInit, clearHighlights, clearWires, setWire, BEAT,
} from '../lib/storage-kit.js';

// Layout (viewBox 1200x640). Storage grammar: the consumer Pod on top, its claim in the middle, the
// real disk on the shelf below, all sharing the identity column at x=525 (the mount reference above
// the claim, the Bound link below it, both arrowhead-free relations). The machinery that grows the
// volume is a stack on the right: kubectl edits the request, the StorageClass gates it with
// allowVolumeExpansion, the external-resizer grows the real disk, and kubelet grows the filesystem.
// Expansion is deliberately TWO PHASE and the card shows the split: the disk grows first (controller
// side), the filesystem inside it grows second (node side), and only then does the Pod see the space.
// Only the Pod pulses. The narration overlay owns x<=380 & y<=300, so every block starts at x>=400.
const POD_X = 420, POD_Y = 55, POD_W = 210, POD_H = 120;
const POD_CX = POD_X + POD_W / 2, POD_BOTTOM = POD_Y + POD_H; // 525 / 175

const PVC_X = 420, PVC_Y = 250, PVC_W = 210, PVC_H = 90;
const PVC_CX = PVC_X + PVC_W / 2, PVC_RIGHT = PVC_X + PVC_W;  // 525 / 630
const PVC_TOP = PVC_Y, PVC_BOTTOM = PVC_Y + PVC_H;           // 250 / 340

const KUBECTL_X = 740, KUBECTL_Y = 50, KUBECTL_W = 300, KUBECTL_H = 60;
const CLASS_X = 740, CLASS_Y = 145, CLASS_W = 300, CLASS_H = 70;
const CLASS_CX = CLASS_X + CLASS_W / 2, CLASS_BOTTOM = CLASS_Y + CLASS_H; // 890 / 215
const RESIZER_X = 740, RESIZER_Y = 270, RESIZER_W = 300, RESIZER_H = 85;
const RESIZER_LEFT = RESIZER_X, RESIZER_TOP = RESIZER_Y, RESIZER_CX = RESIZER_X + RESIZER_W / 2; // 740 / 270 / 890
const KUBELET_X = 740, KUBELET_Y = 390, KUBELET_W = 300, KUBELET_H = 65;
const KUBELET_LEFT = KUBELET_X;                             // 740

const DISK_CX = 525, DISK_Y = 455, DISK_H = 95, DISK_TOP = DISK_Y; // 455
const SPEC_Y = DISK_Y + 62;                                 // 517
const CHIPS_Y = 585;
const SPINE_X = 525;

const W_EDIT     = [[KUBECTL_X, 80], [680, 80], [680, 285], [PVC_RIGHT, 285]];
const W_GATE     = [[RESIZER_CX, RESIZER_TOP], [RESIZER_CX, CLASS_BOTTOM]];
const W_CTRL_EXP = [[RESIZER_LEFT, 312], [680, 312], [680, 435], [DISK_CX, 435], [DISK_CX, DISK_TOP]];
const W_NODE_EXP = [[KUBELET_LEFT, 422], [700, 422], [700, 445], [DISK_CX + 35, 445], [DISK_CX + 35, DISK_TOP]];
const W_FS_UP    = [[SPINE_X, PVC_TOP], [SPINE_X, POD_BOTTOM]];

function lightBoxAt(boxEl, ctx, delay = 0) {
  if (!boxEl) return;
  if (ctx.reduced || delay <= 0) { boxEl.classList.add('highlight'); return; }
  const a = boxEl.animate([{ opacity: 1 }, { opacity: 1 }], { duration: 1, delay });
  a.onfinish = () => boxEl.classList.add('highlight');
  ctx.register(a);
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

function podBlock() {
  const shell = pod({ x: POD_X, y: POD_Y, w: POD_W, h: POD_H, label: 'Pod web-0', sublabel: 'df sees the volume', containers: 0, cat: 'storage' });
  const shellRect = shell.querySelector('.scheme-pod-rect');
  if (shellRect) shellRect.style.fill = 'rgba(255, 255, 255, 0.03)';
  const innerBox = box({ x: POD_X + 22, y: POD_Y + 44, w: POD_W - 44, h: 48, label: 'app', sublabel: 'writes to /data', cat: 'storage' });
  const group = g({});
  group.appendChild(shell);
  group.appendChild(innerBox);
  return { group, innerBox };
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
      'aria-label': 'Online volume expansion is a two phase operation. You raise the storage request on the claim, the StorageClass must have allowVolumeExpansion set to true, then the external-resizer calls ControllerExpandVolume to grow the real disk, and kubelet calls NodeExpandVolume to grow the filesystem inside the running Pod. The disk grows first and the filesystem grows second, and only after both does the Pod see the extra space. Shrinking a volume is not allowed.',
      'data-style': 'outline',
    });
    root.appendChild(arrowDefs());

    const web = podBlock();
    const pvc = box({ x: PVC_X, y: PVC_Y, w: PVC_W, h: PVC_H, label: 'PVC data-claim', sublabel: 'requests 5Gi', cat: 'storage' });
    const kubectl = box({ x: KUBECTL_X, y: KUBECTL_Y, w: KUBECTL_W, h: KUBECTL_H, label: 'kubectl patch pvc', sublabel: 'raises the request', cat: 'storage' });
    const klass = box({ x: CLASS_X, y: CLASS_Y, w: CLASS_W, h: CLASS_H, label: 'StorageClass gp3', sublabel: 'allowVolumeExpansion: true', cat: 'storage' });
    const resizer = box({ x: RESIZER_X, y: RESIZER_Y, w: RESIZER_W, h: RESIZER_H, label: 'external-resizer', sublabel: 'ControllerExpandVolume', cat: 'storage' });
    const kubelet = box({ x: KUBELET_X, y: KUBELET_Y, w: KUBELET_W, h: KUBELET_H, label: 'kubelet', sublabel: 'NodeExpandVolume', cat: 'storage' });
    const disk = cylinder({ x: DISK_CX - 105, y: DISK_Y, w: 210, h: DISK_H, label: 'pv-data', cat: 'storage' });

    const refLink   = line({ class: 'scheme-arrow scheme-arrow-dashed scheme-arrow-dim scheme-arrow-storage', x1: SPINE_X, y1: POD_BOTTOM, x2: SPINE_X, y2: PVC_TOP, 'stroke-dasharray': '5 5', fill: 'none' });
    const boundLink = line({ class: 'scheme-arrow scheme-arrow-storage', x1: SPINE_X, y1: PVC_BOTTOM, x2: SPINE_X, y2: DISK_TOP, fill: 'none' });

    const wEdit    = pathArrow({ points: W_EDIT, dashed: true, dim: true, color: 'storage' });
    const wGate    = pathArrow({ points: W_GATE, dashed: true, dim: true, color: 'storage' });
    const wCtrlExp = pathArrow({ points: W_CTRL_EXP, dashed: true, dim: true, color: 'storage' });
    const wNodeExp = pathArrow({ points: W_NODE_EXP, dashed: true, dim: true, color: 'storage' });
    const wFsUp    = pathArrow({ points: W_FS_UP, dashed: true, dim: true, color: 'storage' });
    wEdit.style.opacity = '0';
    wGate.style.opacity = '0';
    wCtrlExp.style.opacity = '0';
    wNodeExp.style.opacity = '0';
    wFsUp.style.opacity = '0';

    const capLbl  = text({ class: 'scheme-label code dim', x: DISK_CX, y: SPEC_Y, 'text-anchor': 'middle' }, [' ']);
    const noteLbl = text({ class: 'scheme-label code dim', x: SPINE_X, y: 372, 'text-anchor': 'middle' }, [' ']);

    const reqChip   = valChip({ x: 90,  y: CHIPS_Y, w: 250, h: 34, name: 'requests', value: '5Gi', cat: 'storage' });
    const diskChip  = valChip({ x: 360, y: CHIPS_Y, w: 210, h: 34, name: 'real disk', value: '5Gi', cat: 'storage' });
    const fsChip    = valChip({ x: 590, y: CHIPS_Y, w: 260, h: 34, name: 'filesystem', value: '5Gi', cat: 'storage' });
    const seesChip  = valChip({ x: 870, y: CHIPS_Y, w: 240, h: 34, name: 'Pod sees', value: '5Gi', cat: 'storage' });

    const packetLayer = g({ id: 'packetLayer' });

    // Z-order (bottom -> top): blocks and disk, then the identity links and route wires and labels
    // above them, then the Pod so it sits above its links, then the chip strip, then the packet layer.
    [pvc, kubectl, klass, resizer, kubelet, disk].forEach(el => root.appendChild(el));
    [refLink, boundLink, wEdit, wGate, wCtrlExp, wNodeExp, wFsUp].forEach(el => root.appendChild(el));
    root.appendChild(web.group);
    [capLbl, noteLbl].forEach(el => root.appendChild(el));
    [reqChip, diskChip, fsChip, seesChip].forEach(c => root.appendChild(c));
    root.appendChild(packetLayer);

    this.host.appendChild(root);
    this.refs = {
      svg: root, web: web.group, app: web.innerBox,
      pvc, kubectl, klass, resizer, kubelet, disk, refLink, boundLink,
      wEdit, wGate, wCtrlExp, wNodeExp, wFsUp,
      reqChip, diskChip, fsChip, seesChip,
      wires: { cap: capLbl, note: noteLbl },
      packetLayer,
    };
  }

  reset() { this.build(); }
}

function setChips(s, { req, disk, fs, sees }) {
  setVal(s.refs.reqChip, req);
  setVal(s.refs.diskChip, disk);
  setVal(s.refs.fsChip, fs);
  setVal(s.refs.seesChip, sees);
}

function clearHL(s) {
  clearHighlights(s, ['pvc', 'kubectl', 'klass', 'resizer', 'kubelet', 'disk', 'app',
    'reqChip', 'diskChip', 'fsChip', 'seesChip'], [s.refs.web]);
  s.refs.web.style.opacity = '1';
}

const STEPS = [
  {
    id: 'idle',
    duration: 1500,
    narration: 'Pod web-0 runs on a volume of 5Gi. The claim requests 5Gi, the real disk is 5Gi, and the filesystem inside it is 5Gi, so df in the Pod reads 5Gi. The workload has filled it up and needs more room, without going offline.',
    enter(s) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setChips(s, { req: '5Gi', disk: '5Gi', fs: '5Gi', sees: '5Gi' });
      setBoxSublabel(s.refs.pvc, 'requests 5Gi');
      setWire(s, 'cap', 'capacity 5Gi');
      s.refs.refLink.style.opacity = '1';
      s.refs.boundLink.style.opacity = '1';
      ['wEdit', 'wGate', 'wCtrlExp', 'wNodeExp', 'wFsUp'].forEach(k => { s.refs[k].style.opacity = '0'; });
    },
  },
  {
    id: 'edit',
    duration: 2800,
    narration: 'You edit the claim and raise spec.resources.requests.storage from 5Gi to 20Gi. That is the only thing you change by hand. The requested size is now 20Gi but nothing physical has moved yet: the disk and the filesystem are both still 5Gi.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setChips(s, { req: '20Gi', disk: '5Gi', fs: '5Gi', sees: '5Gi' });
      setBoxSublabel(s.refs.pvc, 'requests 20Gi');
      setWire(s, 'cap', 'capacity 5Gi');
      s.refs.refLink.style.opacity = '1';
      s.refs.boundLink.style.opacity = '1';
      s.refs.wEdit.style.opacity = '1';
      if (ctx.reduced) { s.refs.pvc.classList.add('highlight'); return; }
      const edit = routePacket(s, ctx, W_EDIT, { cat: 'storage' });
      ridingLabel(s, ctx, 'requests: 20Gi', W_EDIT);
      lightBoxAt(s.refs.pvc, ctx, edit.arrivalMs);
    },
  },
  {
    id: 'gate',
    duration: 2600,
    narration: 'The external-resizer watches for this. Before it does anything it checks the StorageClass, because expansion only proceeds when allowVolumeExpansion is true. If that flag were false the request would just be rejected. Here it is true, so the resize is allowed to start.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setChips(s, { req: '20Gi', disk: '5Gi', fs: '5Gi', sees: '5Gi' });
      setBoxSublabel(s.refs.pvc, 'requests 20Gi');
      setWire(s, 'cap', 'capacity 5Gi');
      s.refs.refLink.style.opacity = '1';
      s.refs.boundLink.style.opacity = '1';
      s.refs.resizer.classList.add('highlight');
      s.refs.wGate.style.opacity = '1';
      if (ctx.reduced) { s.refs.klass.classList.add('highlight'); return; }
      const gate = routePacket(s, ctx, W_GATE, { cat: 'storage' });
      ridingLabel(s, ctx, 'allowVolumeExpansion?', W_GATE);
      lightBoxAt(s.refs.klass, ctx, gate.arrivalMs);
    },
  },
  {
    id: 'controller-expand',
    duration: 2800,
    narration: 'Phase one happens on the controller side. The external-resizer calls ControllerExpandVolume on the driver, which asks the backend to grow the real disk from 5Gi to 20Gi. The block device is now bigger. The filesystem laid on top of it, though, has no idea and is still 5Gi.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setChips(s, { req: '20Gi', disk: '20Gi', fs: '5Gi, resize pending', sees: '5Gi' });
      setBoxSublabel(s.refs.pvc, 'FileSystemResizePending');
      setWire(s, 'cap', 'capacity 20Gi');
      s.refs.refLink.style.opacity = '1';
      s.refs.boundLink.style.opacity = '1';
      s.refs.resizer.classList.add('highlight');
      s.refs.wCtrlExp.style.opacity = '1';
      if (ctx.reduced) { s.refs.disk.classList.add('highlight'); return; }
      const exp = routePacket(s, ctx, W_CTRL_EXP, { cat: 'storage' });
      ridingLabel(s, ctx, 'ControllerExpandVolume', W_CTRL_EXP);
      lightBoxAt(s.refs.disk, ctx, exp.arrivalMs);
    },
  },
  {
    id: 'node-expand',
    duration: 2800,
    narration: 'Phase two happens on the node. Kubelet calls NodeExpandVolume, which grows the filesystem on the mounted device to fill the larger disk. This is the step that can only run on the node where the Pod is, because the filesystem is only writable where it is actually mounted.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setChips(s, { req: '20Gi', disk: '20Gi', fs: '20Gi', sees: '5Gi' });
      setBoxSublabel(s.refs.pvc, 'filesystem resized');
      setWire(s, 'cap', 'capacity 20Gi');
      s.refs.refLink.style.opacity = '1';
      s.refs.boundLink.style.opacity = '1';
      s.refs.kubelet.classList.add('highlight');
      s.refs.wNodeExp.style.opacity = '1';
      if (ctx.reduced) { s.refs.disk.classList.add('highlight'); return; }
      const exp = routePacket(s, ctx, W_NODE_EXP, { cat: 'storage' });
      ridingLabel(s, ctx, 'NodeExpandVolume', W_NODE_EXP);
      lightBoxAt(s.refs.disk, ctx, exp.arrivalMs);
    },
  },
  {
    id: 'pod-sees',
    duration: 2800,
    narration: 'Only now does the Pod see the space. The disk grew, then the filesystem grew, and the extra room becomes visible inside the running container with no restart. df in web-0 finally reads 20Gi. The two phase order is the whole point: the filesystem can never grow before the disk under it does.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setChips(s, { req: '20Gi', disk: '20Gi', fs: '20Gi', sees: '20Gi' });
      setBoxSublabel(s.refs.pvc, 'Bound, 20Gi');
      setWire(s, 'cap', 'capacity 20Gi');
      s.refs.refLink.style.opacity = '1';
      s.refs.boundLink.style.opacity = '1';
      s.refs.wFsUp.style.opacity = '1';
      if (ctx.reduced) { s.refs.app.classList.add('highlight'); return; }
      const up = routePacket(s, ctx, W_FS_UP, { cat: 'storage' });
      ridingLabel(s, ctx, 'now 20Gi', W_FS_UP);
      pulsePod(s.refs.web, ctx, up.arrivalMs);
      lightBoxAt(s.refs.app, ctx, up.arrivalMs);
    },
  },
  {
    id: 'no-shrink',
    duration: 2600,
    narration: 'Growing works, shrinking does not. If you try to lower the request back below the current size, the Api rejects it outright. There is no safe general way to shrink a filesystem that has data on it, so Kubernetes refuses the edit rather than risk losing bytes.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setChips(s, { req: '20Gi', disk: '20Gi', fs: '20Gi', sees: '20Gi' });
      setBoxSublabel(s.refs.pvc, 'shrink rejected');
      setWire(s, 'cap', 'capacity 20Gi');
      setWire(s, 'note', 'shrinking is not allowed');
      s.refs.refLink.style.opacity = '1';
      s.refs.boundLink.style.opacity = '1';
      s.refs.wEdit.style.opacity = '1';
      if (ctx.reduced) { s.refs.pvc.classList.add('highlight'); return; }
      const shrink = routePacket(s, ctx, W_EDIT, { cat: 'storage' });
      ridingLabel(s, ctx, 'requests: 5Gi', W_EDIT);
      lightBoxAt(s.refs.pvc, ctx, shrink.arrivalMs);
    },
  },
];

export const init = makeInit(Scene, STEPS, { posterFirst: true });
