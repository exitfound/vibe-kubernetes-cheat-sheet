import { svg, g, text, line } from '../lib/svg.js';
import { arrowDefs, box, pod, pathArrow, animateAlong } from '../lib/primitives.js';
import {
  valChip, setVal, pulsePod, routePacket, routeDur,
  makeInit, clearHighlights, clearWires, setWire, BEAT,
} from '../lib/storage-kit.js';

// ConfigMap and Secret as Files. The consumer Pod is top-right, the mounted /etc/config directory is
// the centre of the card, and the ConfigMap and Secret sources plus kubelet sit on the left.
//
// The mechanism the card teaches is the ATOMIC SYMLINK SWAP. kubelet writes the keys into a
// timestamped directory and points a ..data symlink at it, and the visible files are symlinks into
// ..data. On update kubelet writes a brand new timestamped dir, then flips the single ..data symlink
// in one step, so a reader never sees a half-written config. Updates land on the kubelet sync period
// (up to about a minute) and the app must re-read the file itself. A subPath mount pins one file and
// opts OUT of the swap, so it never updates. A Secret uses the same machinery but on tmpfs.
//
// Symlink pointers are bare dashed lines with NO arrowhead (a reference, not traffic). Only the Pod
// pulses. kubelet and the dirs are infrastructure: they light. The overlay owns x<=380 & y<=300.
const POD_X = 760, POD_Y = 55, POD_W = 340, POD_H = 140;
const POD_BOTTOM = POD_Y + POD_H;                     // 195

const KUBE_X = 430, KUBE_Y = 250, KUBE_W = 200, KUBE_H = 90;
const KUBE_RIGHT = KUBE_X + KUBE_W, KUBE_BOTTOM = KUBE_Y + KUBE_H; // 630 / 340

const CM_X = 430, CM_Y = 390, CM_W = 200, CM_H = 70;  // ConfigMap source
const SEC_X = 430, SEC_Y = 486, SEC_W = 200, SEC_H = 64; // Secret source, hidden until its step

const DATA_X = 720, DATA_Y = 288, DATA_W = 180, DATA_H = 48; // ..data symlink
const DATA_CX = DATA_X + DATA_W / 2, DATA_BOTTOM = DATA_Y + DATA_H; // 810 / 336

const OLD_X = 720, OLD_Y = 384, OLD_W = 180, OLD_H = 64; // old timestamped dir (v1)
const OLD_CX = OLD_X + OLD_W / 2, OLD_TOP = OLD_Y, OLD_MY = OLD_Y + 32; // 810 / 384 / 416

const NEW_X = 945, NEW_Y = 384, NEW_W = 180, NEW_H = 64; // new timestamped dir (v2)
const NEW_CX = NEW_X + NEW_W / 2, NEW_TOP = NEW_Y;    // 1035 / 384

const CHIPS_Y = 590;

// Each static wire and its ball share one array. Every endpoint is a block edge.
const W_CM_READ    = [[530, CM_Y], [530, KUBE_BOTTOM]];
const W_WRITE_OLD  = [[KUBE_RIGHT, 300], [660, 300], [660, OLD_MY], [OLD_X, OLD_MY]];
const W_WRITE_NEW  = [[KUBE_RIGHT, 272], [NEW_CX, 272], [NEW_CX, NEW_TOP]];
const W_APP_READ   = [[850, DATA_Y], [850, 250], [900, 250], [900, POD_BOTTOM]];
const W_SUBPATH    = [[790, OLD_TOP], [790, 230], [960, 230], [960, POD_BOTTOM]];
const W_SEC_READ   = [[430, 512], [400, 512], [400, 300], [KUBE_X, 300]];

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

function podBlock({ x, y, w, h, label, sublabel }) {
  const shell = pod({ x, y, w, h, label, sublabel, containers: 0, cat: 'storage' });
  const shellRect = shell.querySelector('.scheme-pod-rect');
  if (shellRect) shellRect.style.fill = 'rgba(255, 255, 255, 0.03)';
  const innerBox = box({ x: x + 24, y: y + 46, w: w - 48, h: 58, label: 'app', sublabel: 'reads /etc/config/app.conf', cat: 'storage' });
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
      'aria-label': 'ConfigMap and Secret as files: each key becomes a file in the mounted directory. kubelet writes the keys into a timestamped directory and points a ..data symlink at it, and on update it writes a new directory then flips the symlink atomically, so a reader never sees a half-written config. Updates arrive on the kubelet sync period, a subPath mount opts out of the swap and never updates, and Secrets default to tmpfs.',
      'data-style': 'outline',
    });
    root.appendChild(arrowDefs());

    const podB = podBlock({ x: POD_X, y: POD_Y, w: POD_W, h: POD_H, label: 'Pod api-0', sublabel: 'mounts /etc/config' });

    const kubelet = box({ x: KUBE_X, y: KUBE_Y, w: KUBE_W, h: KUBE_H, label: 'kubelet', sublabel: 'sync loop', cat: 'storage' });
    const cm  = box({ x: CM_X, y: CM_Y, w: CM_W, h: CM_H, label: 'ConfigMap app', sublabel: 'key: app.conf', cat: 'storage' });
    const sec = box({ x: SEC_X, y: SEC_Y, w: SEC_W, h: SEC_H, label: 'Secret tls', sublabel: 'on tmpfs', cat: 'storage' });
    sec.style.opacity = '0';

    const dirBox = box({ x: 680, y: 245, w: 470, h: 235, label: '', sublabel: '', cat: 'storage' });
    dirBox.querySelector('.scheme-box-rect').style.fill = 'rgba(255, 255, 255, 0.02)';
    const dirLbl = text({ class: 'scheme-label code dim', x: 692, y: 268, 'text-anchor': 'start' }, ['/etc/config (mounted volume)']);

    const dataLink = box({ x: DATA_X, y: DATA_Y, w: DATA_W, h: DATA_H, label: '..data', sublabel: 'symlink', cat: 'storage' });
    const dirOld = box({ x: OLD_X, y: OLD_Y, w: OLD_W, h: OLD_H, label: '..2026_07_10', sublabel: 'app.conf v1', cat: 'storage' });
    const dirNew = box({ x: NEW_X, y: NEW_Y, w: NEW_W, h: NEW_H, label: '..2026_07_15', sublabel: 'app.conf v2', cat: 'storage' });
    dirNew.style.opacity = '0';

    // Symlink pointers: bare dashed lines with no arrowhead, because a symlink is a reference.
    const symOld = line({ class: 'scheme-arrow scheme-arrow-dashed scheme-arrow-dim scheme-arrow-storage', x1: DATA_CX, y1: DATA_BOTTOM, x2: OLD_CX, y2: OLD_TOP, 'stroke-dasharray': '5 5', fill: 'none' });
    const symNew = line({ class: 'scheme-arrow scheme-arrow-dashed scheme-arrow-storage', x1: DATA_CX, y1: DATA_BOTTOM, x2: NEW_CX, y2: NEW_TOP, 'stroke-dasharray': '5 5', fill: 'none' });
    symNew.style.opacity = '0';

    const wCmRead   = pathArrow({ points: W_CM_READ,   dashed: true, dim: true, color: 'storage' });
    const wWriteOld = pathArrow({ points: W_WRITE_OLD, dashed: true, dim: true, color: 'storage' });
    const wWriteNew = pathArrow({ points: W_WRITE_NEW, dashed: true, dim: true, color: 'storage' });
    const wAppRead  = pathArrow({ points: W_APP_READ,  dashed: true, dim: true, color: 'storage' });
    const wSubpath  = pathArrow({ points: W_SUBPATH,   dashed: true, dim: true, color: 'storage' });
    wSubpath.style.opacity = '0';
    const wSecRead  = pathArrow({ points: W_SEC_READ,  dashed: true, dim: true, color: 'storage' });
    wSecRead.style.opacity = '0';

    const clockLbl = text({ class: 'scheme-label code dim', x: 900, y: 520, 'text-anchor': 'middle' }, [' ']);

    const modeChip  = valChip({ x: 90,  y: CHIPS_Y, w: 300, h: 34, name: 'source', value: 'ConfigMap', cat: 'storage' });
    const swapChip  = valChip({ x: 410, y: CHIPS_Y, w: 360, h: 34, name: 'update', value: 'symlink to v1', cat: 'storage' });
    const valueChip = valChip({ x: 790, y: CHIPS_Y, w: 300, h: 34, name: 'app reads', value: 'app.conf v1', cat: 'storage' });

    const packetLayer = g({ id: 'packetLayer' });

    // Z-order (bottom -> top): the dir container, then blocks, then symlink lines and wires and
    // labels above them, then the chip strip, then the packet layer so every ball rides above.
    root.appendChild(dirBox);
    [podB.group, kubelet, cm, sec, dataLink, dirOld, dirNew].forEach(el => root.appendChild(el));
    [symOld, symNew, wCmRead, wWriteOld, wWriteNew, wAppRead, wSubpath, wSecRead, dirLbl, clockLbl].forEach(el => root.appendChild(el));
    [modeChip, swapChip, valueChip].forEach(c => root.appendChild(c));
    root.appendChild(packetLayer);

    this.host.appendChild(root);
    this.refs = {
      svg: root, pod: podB.group, podBox: podB.innerBox,
      kubelet, cm, sec, dataLink, dirOld, dirNew, symOld, symNew, wSubpath, wSecRead,
      modeChip, swapChip, valueChip,
      wires: { clock: clockLbl },
      packetLayer,
    };
  }

  reset() { this.build(); }
}

function setChips(s, { mode, swap, value }) {
  setVal(s.refs.modeChip, mode);
  setVal(s.refs.swapChip, swap);
  setVal(s.refs.valueChip, value);
}

// Sets the visibility of every toggled element, so no step can leak another step's state.
function setStage(s, { symOld = 1, symNew = 0, dirNew = 0, sec = 0, subpath = 0, secRead = 0 }) {
  s.refs.symOld.style.opacity = String(symOld);
  s.refs.symNew.style.opacity = String(symNew);
  s.refs.dirNew.style.opacity = String(dirNew);
  s.refs.sec.style.opacity = String(sec);
  s.refs.wSubpath.style.opacity = String(subpath);
  s.refs.wSecRead.style.opacity = String(secRead);
}

function clearHL(s) {
  clearHighlights(s, ['kubelet', 'cm', 'sec', 'dataLink', 'dirOld', 'dirNew', 'podBox', 'modeChip', 'swapChip', 'valueChip'],
    [s.refs.pod]);
  s.refs.pod.style.opacity = '1';
}

const STEPS = [
  {
    id: 'idle',
    duration: 1500,
    narration: 'A ConfigMap mounted as a volume turns each of its keys into a file. The app reads /etc/config/app.conf like any file on disk, and never has to know the value came from a ConfigMap. It reads version one to start with.',
    enter(s) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setChips(s, { mode: 'ConfigMap', swap: 'symlink to v1', value: 'app.conf v1' });
      setStage(s, {});
    },
  },
  {
    id: 'keys',
    duration: 2600,
    narration: 'kubelet reads the keys from the ConfigMap and writes them as files into a timestamped directory on the node. Every key becomes one file, and the value of the key becomes the contents of that file.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setChips(s, { mode: 'ConfigMap', swap: 'symlink to v1', value: 'app.conf v1' });
      setStage(s, {});
      s.refs.cm.classList.add('highlight');
      if (ctx.reduced) { s.refs.kubelet.classList.add('highlight'); s.refs.dirOld.classList.add('highlight'); return; }
      const read = routePacket(s, ctx, W_CM_READ, { cat: 'storage' });
      ridingLabel(s, ctx, 'app.conf', W_CM_READ);
      lightBoxAt(s.refs.kubelet, ctx, read.arrivalMs);
      const write = routePacket(s, ctx, W_WRITE_OLD, { delay: read.arrivalMs + BEAT.afterHop, cat: 'storage' });
      ridingLabel(s, ctx, 'write v1', W_WRITE_OLD, { delay: read.arrivalMs + BEAT.afterHop });
      lightBoxAt(s.refs.dirOld, ctx, write.arrivalMs);
    },
  },
  {
    id: 'symlink',
    duration: 2400,
    narration: 'The path the app opens is a chain of symlinks. app.conf points into ..data, and ..data points at the current timestamped directory. So one symlink, ..data, decides which version every file resolves to.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setChips(s, { mode: 'ConfigMap', swap: 'files are symlinks', value: 'app.conf v1' });
      setStage(s, {});
      s.refs.dataLink.classList.add('highlight');
      s.refs.dirOld.classList.add('highlight');
      if (ctx.reduced) return;
      // The app reads through ..data (infra to Pod, a down-arrow): the ball leaves first, the Pod
      // pulses on arrival.
      const read = routePacket(s, ctx, W_APP_READ, { cat: 'storage' });
      ridingLabel(s, ctx, 'resolves v1', W_APP_READ);
      pulsePod(s.refs.pod, ctx, read.arrivalMs);
    },
  },
  {
    id: 'atomic',
    duration: 2800,
    narration: 'On update kubelet does not edit the live files. It writes a whole new timestamped directory, then flips the single ..data symlink to point at it in one atomic step. A reader either sees all of v1 or all of v2, never a half-written mix.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setChips(s, { mode: 'ConfigMap', swap: 'atomic symlink flip', value: 'v2 staged' });
      // After the flip: the new dir exists and ..data points at it. That is the static end-state.
      setStage(s, { symOld: 0, symNew: 1, dirNew: 1 });
      s.refs.cm.classList.add('highlight');
      s.refs.dirNew.classList.add('highlight');
      if (ctx.reduced) return;
      // Re-set the pre-flip state below the guard, then write the new dir and flip the pointer.
      setStage(s, { symOld: 1, symNew: 0, dirNew: 0 });
      s.refs.dirNew.style.opacity = '0';
      ctx.register(s.refs.dirNew.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 400, fill: 'forwards', easing: 'ease-out' }));
      const write = routePacket(s, ctx, W_WRITE_NEW, { cat: 'storage' });
      ridingLabel(s, ctx, 'write v2', W_WRITE_NEW);
      lightBoxAt(s.refs.dirNew, ctx, write.arrivalMs);
      // The flip happens the instant the new dir is complete: old pointer out, new pointer in.
      ctx.register(s.refs.symOld.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 250, delay: write.arrivalMs, fill: 'forwards', easing: 'ease-in' }));
      ctx.register(s.refs.symNew.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 250, delay: write.arrivalMs, fill: 'forwards', easing: 'ease-out' }));
    },
  },
  {
    id: 'sync',
    duration: 3000,
    narration: 'The flip is not instant across the cluster. A ConfigMap change reaches the file on the kubelet sync period, up to about a minute, and even then nothing restarts the app. The process has to notice the file changed and re-read it on its own.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setChips(s, { mode: 'ConfigMap', swap: 'up to 60s to propagate', value: 'app.conf v2' });
      setStage(s, { symOld: 0, symNew: 1, dirNew: 1 });
      s.refs.dirNew.classList.add('highlight');
      setWire(s, 'clock', 'kubelet sync period, then the app re-reads');
      if (ctx.reduced) return;
      // After the sync delay the app re-reads, and ..data now resolves to v2.
      const read = routePacket(s, ctx, W_APP_READ, { delay: 900, cat: 'storage' });
      ridingLabel(s, ctx, 'resolves v2', W_APP_READ, { delay: 900 });
      pulsePod(s.refs.pod, ctx, read.arrivalMs);
    },
  },
  {
    id: 'subpath',
    duration: 2600,
    narration: 'A subPath mount takes a single file out of the volume and mounts it directly, bypassing the ..data symlink. Because it points straight at one timestamped file, the flip never reaches it, so a subPath-mounted key is frozen at the value it had when the container started.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setChips(s, { mode: 'ConfigMap', swap: 'subPath opts out', value: 'subPath stuck at v1' });
      setStage(s, { symOld: 0, symNew: 1, dirNew: 1, subpath: 1 });
      s.refs.dirOld.classList.add('highlight');
      if (ctx.reduced) return;
      // The subPath read points straight at the old dir, so it delivers v1 even after the flip.
      const read = routePacket(s, ctx, W_SUBPATH, { cat: 'storage' });
      ridingLabel(s, ctx, 'v1 forever', W_SUBPATH);
      pulsePod(s.refs.pod, ctx, read.arrivalMs);
    },
  },
  {
    id: 'secret',
    duration: 2400,
    narration: 'A Secret mounted as a volume works exactly the same way, keys become files behind the atomic symlink swap. The one difference is that a Secret directory defaults to tmpfs, so its files live in memory and never get written to the node disk.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setChips(s, { mode: 'Secret (tmpfs)', swap: 'same symlink swap', value: 'never on disk' });
      setStage(s, { symOld: 0, symNew: 1, dirNew: 1, sec: 1, secRead: 1 });
      s.refs.sec.classList.add('highlight');
      if (ctx.reduced) { s.refs.kubelet.classList.add('highlight'); return; }
      const read = routePacket(s, ctx, W_SEC_READ, { cat: 'storage' });
      ridingLabel(s, ctx, 'tls.crt in RAM', W_SEC_READ);
      lightBoxAt(s.refs.kubelet, ctx, read.arrivalMs);
    },
  },
];

export const init = makeInit(Scene, STEPS, { posterFirst: true });
