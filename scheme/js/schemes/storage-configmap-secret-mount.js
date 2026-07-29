import { svg, g, text } from '../lib/svg.js';
import { arrowDefs, box, pod, pathArrow } from '../lib/primitives.js';
import { valChip, setVal, pulsePod, routePacket, makeInit, clearHighlights, clearWires, setWire, relationPath, BEAT, makeRidingLabel, lightBoxAt, OPACITY } from '../lib/storage-kit.js';
// Design notes for this card: scheme/docs/CARDS.md#storage-configmap-secret-mount


const POD_X = 330, POD_Y = 56, POD_W = 540, POD_H = 120;        // 330..870, center 600
const POD_BOTTOM = POD_Y + POD_H;                               // 176
const APP_BX = 470, APP_BY = 90, APP_BW = 260, APP_BH = 56;     // inner app box, centered in the Pod

const VOL_X = 330, VOL_Y = 268, VOL_W = 540, VOL_H = 194;       // 330..870, bottom 462
const DATA_X = 510, DATA_Y = 300, DATA_W = 180, DATA_H = 48;    // ..data, center 600, bottom 348
const DATA_CX = 600;
const SYM_Y = DATA_Y + DATA_H / 2;                              // 324, the symlink pointer height

const DIR_Y = 380, DIR_W = 200, DIR_H = 64;                     // dir slot row, bottom 444
const DIR_BOTTOM = DIR_Y + DIR_H;
const OLD_X = 360, OLD_CX = 460;                                // v1 slot, 360..560
const NEW_X = 640, NEW_CX = 740;                                // v2 slot, 640..840

const KUBE_X = 430, KUBE_Y = 500, KUBE_W = 340, KUBE_H = 64;    // 430..770, center 600
const CM_X = 110, SEC_X = 890, SRC_Y = 500, SRC_W = 200, SRC_H = 64; // mirrored about 600
const SRC_MY = SRC_Y + SRC_H / 2;                               // 532, the source lane height

const CHIPS_Y = 594, CHIP_W = 320, CHIP_GAP = 20, CHIP_H = 34;
const CHIP_X = i => 600 - (CHIP_W * 3 + CHIP_GAP * 2) / 2 + i * (CHIP_W + CHIP_GAP);   // 100 / 440 / 780

// Each static wire and its ball share one array. Every lane is a single straight segment.
const W_CM_READ   = [[CM_X + SRC_W, SRC_MY], [KUBE_X, SRC_MY]];          // ConfigMap -> kubelet
const W_SEC_READ  = [[SEC_X, SRC_MY], [KUBE_X + KUBE_W, SRC_MY]];        // Secret -> kubelet
const W_WRITE_OLD = [[OLD_CX, KUBE_Y], [OLD_CX, DIR_BOTTOM]];            // kubelet -> v1 dir
const W_WRITE_NEW = [[NEW_CX, KUBE_Y], [NEW_CX, DIR_BOTTOM]];            // kubelet -> v2 dir
const W_APP_READ  = [[DATA_CX, VOL_Y], [DATA_CX, POD_BOTTOM]];           // volume -> Pod (the spine)
// The subPath read leaves the v1 dir on its own centre line so it visibly misses ..data, then steps
// into the Pod-to-volume corridor and enters the Pod beside the spine rather than out at its corner.
const GAP_MY = (POD_BOTTOM + VOL_Y) / 2;                                 // 222
const SUB_IN_X = DATA_CX - 60;                                           // 540
const W_SUBPATH   = [[OLD_CX, DIR_Y], [OLD_CX, GAP_MY], [SUB_IN_X, GAP_MY], [SUB_IN_X, POD_BOTTOM]];

const SYM_OLD = [[DATA_X, SYM_Y], [OLD_CX, SYM_Y], [OLD_CX, DIR_Y]];
const SYM_NEW = [[DATA_X + DATA_W, SYM_Y], [NEW_CX, SYM_Y], [NEW_CX, DIR_Y]];

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
      'aria-label': 'ConfigMap and Secret as files: each key becomes a file in the mounted directory. Kubelet writes the keys into a timestamped directory and points a ..data symlink at it, and on update it writes a new directory then flips the symlink atomically, so a reader never sees a half-written config. Updates arrive on the Kubelet sync period, a subPath mount opts out of the swap and never updates, and Secrets default to tmpfs.',
      'data-style': 'outline',
    });
    root.appendChild(arrowDefs());

    // shellWrap survives as a handle for code that wants the shell alone. The PULSE is not that:
    // it takes the whole Pod group, so the app box blinks with the Pod it belongs to (2026-07-29).
    const shell = pod({ x: POD_X, y: POD_Y, w: POD_W, h: POD_H, label: 'Pod api-0', sublabel: 'mounts /etc/config', containers: 0, role: 'storage' });
    const shellRect = shell.querySelector('.scheme-pod-rect');
    if (shellRect) shellRect.style.fill = 'rgba(255, 255, 255, 0.03)';
    // Nudge the mounts /etc/config sublabel up 2px off the pod bottom edge.
    const shellSub = shell.querySelector('.scheme-pod-sublabel');
    if (shellSub) shellSub.setAttribute('y', String(POD_H - 10));
    const shellWrap = g({});
    shellWrap.appendChild(shell);
    const appBox = box({ x: APP_BX, y: APP_BY, w: APP_BW, h: APP_BH, label: 'app', sublabel: 'reads /etc/config/app.conf', role: 'storage' });
    const podGroup = g({});
    [shellWrap, appBox].forEach(el => podGroup.appendChild(el));

    // The mounted volume directory, named by a title centered on its top band. The title sits
    // between the two inner lanes (x=460 and x=600 never cross it) and above ..data.
    const volBox = box({ x: VOL_X, y: VOL_Y, w: VOL_W, h: VOL_H, label: '', sublabel: '', role: 'storage' });
    volBox.querySelector('.scheme-box-rect').style.fill = 'rgba(255, 255, 255, 0.02)';
    const volLbl = text({ class: 'scheme-label code', x: 600, y: VOL_Y + 22, 'text-anchor': 'middle' }, ['Volume /etc/config']);
    // Corner tag naming what this block is: the kubelet-managed volume dir on the node. The path
    // holds for both sources (the Secret tmpfs is mounted at the same location).
    const nodeTag = text({ class: 'scheme-label code dim', x: VOL_X + 12, y: VOL_Y + 22, 'text-anchor': 'start' }, ['/var/lib/kubelet/pods/…']);

    const dataLink = box({ x: DATA_X, y: DATA_Y, w: DATA_W, h: DATA_H, label: '..data', sublabel: 'symlink', role: 'storage' });
    const dirOld = box({ x: OLD_X, y: DIR_Y, w: DIR_W, h: DIR_H, label: '..2026_07_10', sublabel: 'app.conf v1', role: 'storage' });
    const dirNew = box({ x: NEW_X, y: DIR_Y, w: DIR_W, h: DIR_H, label: '..2026_07_15', sublabel: 'app.conf v2', role: 'storage' });
    dirNew.style.opacity = '0';

    // Symlink pointers: relationships, not traffic, so relationPath rather than a stripped pathArrow.
    // Only one is ever visible at a time, that is the whole flip.
    const symOld = relationPath({ points: SYM_OLD, role: 'storage' });
    const symNew = relationPath({ points: SYM_NEW, role: 'storage' });
    symNew.style.opacity = '0';

    // The source row: kubelet centered, fed from both sides.
    const kubelet = box({ x: KUBE_X, y: KUBE_Y, w: KUBE_W, h: KUBE_H, label: 'Kubelet', sublabel: 'sync loop', role: 'storage' });
    const cm  = box({ x: CM_X,  y: SRC_Y, w: SRC_W, h: SRC_H, label: 'ConfigMap app', sublabel: 'key: app.conf', role: 'storage' });
    const sec = box({ x: SEC_X, y: SRC_Y, w: SRC_W, h: SRC_H, label: 'Secret TLS', sublabel: 'on tmpfs', role: 'storage' });
    sec.style.opacity = String(OPACITY.notready);

    const wCmRead   = pathArrow({ points: W_CM_READ,   dashed: true, dim: true, role: 'storage' });
    const wSecRead  = pathArrow({ points: W_SEC_READ,  dashed: true, dim: true, role: 'storage' });
    const wWriteOld = pathArrow({ points: W_WRITE_OLD, dashed: true, dim: true, role: 'storage' });
    const wWriteNew = pathArrow({ points: W_WRITE_NEW, dashed: true, dim: true, role: 'storage' });
    wWriteNew.style.opacity = '0';
    const wAppRead  = pathArrow({ points: W_APP_READ,  dashed: true, dim: true, role: 'storage' });
    const wSubpath  = pathArrow({ points: W_SUBPATH,   dashed: true, dim: true, role: 'storage' });
    wSubpath.style.opacity = '0';

    // The sync-period note sits right of the spine, vertically centered in the Pod-to-volume gap
    // (176..268, center 222, baseline compensated for the 11px font).
    const clockLbl = text({ class: 'scheme-label code dim', x: 618, y: 226, 'text-anchor': 'start' }, [' ']);

    // Uniform chip strip: three chips of one size, centered on the scheme axis.
    const modeChip  = valChip({ x: CHIP_X(0), y: CHIPS_Y, w: CHIP_W, h: CHIP_H, name: 'source',    value: 'ConfigMap', role: 'storage' });
    const swapChip  = valChip({ x: CHIP_X(1), y: CHIPS_Y, w: CHIP_W, h: CHIP_H, name: 'update',    value: 'symlink to v1', role: 'storage' });
    const valueChip = valChip({ x: CHIP_X(2), y: CHIPS_Y, w: CHIP_W, h: CHIP_H, name: 'app reads', value: 'app.conf v1', role: 'storage' });

    const packetLayer = g({ id: 'packetLayer' });

    // Z-order (bottom -> top): the volume container, then blocks, then symlink lines and wires and
    // labels above them, then the chip strip, then the packet layer so every ball rides above.
    root.appendChild(volBox);
    [podGroup, dataLink, dirOld, dirNew, kubelet, cm, sec].forEach(el => root.appendChild(el));
    [symOld, symNew, wCmRead, wSecRead, wWriteOld, wWriteNew, wAppRead, wSubpath, volLbl, nodeTag, clockLbl].forEach(el => root.appendChild(el));
    [modeChip, swapChip, valueChip].forEach(c => root.appendChild(c));
    root.appendChild(packetLayer);

    this.host.appendChild(root);
    this.refs = {
      svg: root, pod: podGroup, shellWrap, appBox,
      kubelet, cm, sec, dataLink, dirOld, dirNew, symOld, symNew,
      wWriteNew, wSubpath,
      modeChip, swapChip, valueChip,
      wires: { clock: clockLbl },
      packetLayer,
    };
  }

  reset() { this.build(); }
}

// Sets each chip and statically highlights the ones whose value CHANGES on this step (the family
// standard): a chip that changes glows for the step, a chip that stays the same does not.
function setChip(chip, val) {
  const changed = chip && chip.valueText && chip.valueText.textContent !== String(val);
  setVal(chip, val);
  if (changed) chip.classList.add('highlight');
}
function setChips(s, { mode, swap, value }) {
  setChip(s.refs.modeChip, mode);
  setChip(s.refs.swapChip, swap);
  setChip(s.refs.valueChip, value);
}

function setStage(s, { symOld = 1, symNew = 0, dirNew = 0, writeNew = 0, subpath = 0, sec = OPACITY.notready } = {}) {
  s.refs.symOld.style.opacity = String(symOld);
  s.refs.symNew.style.opacity = String(symNew);
  s.refs.dirNew.style.opacity = String(dirNew);
  s.refs.wWriteNew.style.opacity = String(writeNew);
  s.refs.wSubpath.style.opacity = String(subpath);
  s.refs.sec.style.opacity = String(sec);
}
const STAGE_FLIPPED = { symOld: 0, symNew: 1, dirNew: 1, writeNew: 1 };

function clearHL(s) {
  clearHighlights(s, ['kubelet', 'cm', 'sec', 'dataLink', 'dirOld', 'dirNew', 'appBox', 'modeChip', 'swapChip', 'valueChip'],
    [s.refs.shellWrap]);
  s.refs.pod.style.opacity = '1';
}

const STEPS = [
  {
    id: 'idle',
    duration: 1500,
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
    narration: 'Kubelet reads the keys from the ConfigMap and writes them as files into a timestamped directory on the Node. Every key becomes one file, and the value of the key becomes the contents of that file.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setChips(s, { mode: 'ConfigMap', swap: 'v1 written to disk', value: 'app.conf v1' });
      setStage(s, {});
      s.refs.cm.classList.add('highlight');
      s.refs.kubelet.classList.add('highlight');
      if (ctx.reduced) { s.refs.dirOld.classList.add('highlight'); return; }
      const read = routePacket(s, ctx, W_CM_READ, { role: 'storage' });
      ridingLabel(s, ctx, 'app.conf', W_CM_READ);
      const write = routePacket(s, ctx, W_WRITE_OLD, { delay: read.arrivalMs + BEAT.afterHop, role: 'storage' });
      lightBoxAt(s.refs.dirOld, ctx, write.arrivalMs);
      ridingLabel(s, ctx, 'write v1', W_WRITE_OLD, { delay: read.arrivalMs + BEAT.afterHop });
    },
  },
  {
    id: 'symlink',
    duration: 2400,
    narration: 'The path the app opens is a chain of symlinks. The app.conf symlink points into ..data, and ..data points at the current timestamped directory. So one symlink, ..data, decides which version every file resolves to.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setChips(s, { mode: 'ConfigMap', swap: 'files are symlinks', value: 'app.conf v1' });
      setStage(s, {});
      s.refs.dataLink.classList.add('highlight');
      s.refs.dirOld.classList.add('highlight');
      s.refs.appBox.classList.add('highlight');
      if (ctx.reduced) return;
      // The app reads through ..data (infra to Pod, a down-arrow): the ball leaves first, the Pod
      // pulses on arrival.
      const read = routePacket(s, ctx, W_APP_READ, { role: 'storage' });
      ridingLabel(s, ctx, 'resolves v1', W_APP_READ);
      pulsePod(s.refs.pod, ctx, read.arrivalMs);
    },
  },
  {
    id: 'atomic',
    duration: 2800,
    narration: 'On update Kubelet does not edit the live files. It writes a whole new timestamped directory, then flips the single ..data symlink to point at it in one atomic step. A reader either sees all of v1 or all of v2, never a half-written mix.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setChips(s, { mode: 'ConfigMap', swap: 'atomic symlink flip', value: 'v2 on next read' });
      // After the flip: the new dir exists and ..data points at it. That is the static end-state.
      setStage(s, STAGE_FLIPPED);
      s.refs.cm.classList.add('highlight');
      s.refs.kubelet.classList.add('highlight');
      s.refs.dataLink.classList.add('highlight');
      s.refs.dirNew.classList.add('highlight');
      if (ctx.reduced) return;
      // Re-set the pre-flip state below the guard: the updated ConfigMap reaches kubelet first,
      // then kubelet writes the new dir and flips the pointer.
      setStage(s, {});
      const read = routePacket(s, ctx, W_CM_READ, { role: 'storage' });
      ridingLabel(s, ctx, 'app.conf v2', W_CM_READ);
      const writeAt = read.arrivalMs + BEAT.afterHop;
      ctx.register(s.refs.dirNew.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 400, delay: writeAt, fill: 'forwards', easing: 'ease-out' }));
      ctx.register(s.refs.wWriteNew.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 400, delay: writeAt, fill: 'forwards', easing: 'ease-out' }));
      const write = routePacket(s, ctx, W_WRITE_NEW, { delay: writeAt, role: 'storage' });
      ridingLabel(s, ctx, 'write v2', W_WRITE_NEW, { delay: writeAt });
      // The flip happens the instant the new dir is complete: old pointer out, new pointer in.
      ctx.register(s.refs.symOld.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 250, delay: write.arrivalMs, fill: 'forwards', easing: 'ease-in' }));
      ctx.register(s.refs.symNew.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 250, delay: write.arrivalMs, fill: 'forwards', easing: 'ease-out' }));
    },
  },
  {
    id: 'sync',
    duration: 3000,
    narration: 'The flip is not instant across the cluster. A ConfigMap change reaches the file on the Kubelet sync period, up to about a minute, and even then nothing restarts the app. The process has to notice the file changed and re-read it on its own.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setChips(s, { mode: 'ConfigMap', swap: 'up to 60s to propagate', value: 'app.conf v2' });
      setStage(s, STAGE_FLIPPED);
      s.refs.dirNew.classList.add('highlight');
      s.refs.appBox.classList.add('highlight');
      setWire(s, 'clock', 'kubelet sync period, then the app re-reads');
      if (ctx.reduced) return;
      // After the sync delay the app re-reads, and ..data now resolves to v2.
      const read = routePacket(s, ctx, W_APP_READ, { delay: 900, role: 'storage' });
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
      setChips(s, { mode: 'ConfigMap', swap: 'subPath opts out', value: 'app.conf v1 forever' });
      setStage(s, { ...STAGE_FLIPPED, subpath: 1 });
      s.refs.dirOld.classList.add('highlight');
      if (ctx.reduced) return;
      // The subPath read rises straight from the old dir, visibly missing ..data on its way up.
      const read = routePacket(s, ctx, W_SUBPATH, { role: 'storage' });
      ridingLabel(s, ctx, 'v1 forever', W_SUBPATH);
      pulsePod(s.refs.pod, ctx, read.arrivalMs);
    },
  },
  {
    id: 'secret',
    duration: 2400,
    narration: 'A Secret mounted as a volume works exactly the same way, keys become files behind the atomic symlink swap. The one difference is that a Secret directory defaults to tmpfs, so its files live in memory and never get written to the Node disk.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setChips(s, { mode: 'Secret (tmpfs)', swap: 'same symlink swap', value: 'tls.crt from RAM' });
      setStage(s, { ...STAGE_FLIPPED, sec: 1 });
      s.refs.sec.classList.add('highlight');
      if (ctx.reduced) { s.refs.kubelet.classList.add('highlight'); return; }
      const read = routePacket(s, ctx, W_SEC_READ, { role: 'storage' });
      lightBoxAt(s.refs.kubelet, ctx, read.arrivalMs);
      ridingLabel(s, ctx, 'tls.crt in RAM', W_SEC_READ);
    },
  },
];

export const init = makeInit(Scene, STEPS, { posterFirst: true });
