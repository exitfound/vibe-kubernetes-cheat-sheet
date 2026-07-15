import { svg, g, text, line, rect } from '../lib/svg.js';
import { arrowDefs, box, pod, cylinder, pathArrow, animateAlong } from '../lib/primitives.js';
import {
  valChip, setVal, setBoxSublabel, pulsePod, pulsePodDim, routePacket, routeDur,
  makeInit, clearHighlights, clearWires, setWire, BEAT,
} from '../lib/storage-kit.js';

// fsGroup and Volume Ownership (viewBox 1200x640). A volume mounts owned by root, so a container
// running as a non-root user cannot write to it. securityContext.fsGroup tells kubelet to chown and
// setgid the whole volume tree to that GID before the container starts. fsGroupChangePolicy controls
// whether kubelet walks the entire tree every start (Always, the default) or checks only the
// top-level directory and skips the walk when it already matches (OnRootMismatch), which is what
// keeps a volume of millions of files from adding minutes to every Pod start. The Pod is on top,
// kubelet and the securityContext to the right, and the volume tree of files on the shelf at the
// bottom. The narration overlay owns x<=380 & y<=300, so every block sits at x>=440.
const POD_X = 440, POD_Y = 56, POD_W = 280, POD_H = 112;
const POD_CX = POD_X + POD_W / 2, POD_BOTTOM = POD_Y + POD_H; // 580 / 168

const KUBE_X = 770, KUBE_Y = 70, KUBE_W = 340, KUBE_H = 92;
const KUBE_CX = KUBE_X + KUBE_W / 2, KUBE_RIGHT = KUBE_X + KUBE_W, KUBE_BOTTOM = KUBE_Y + KUBE_H, KUBE_CY = KUBE_Y + KUBE_H / 2; // 940 / 1110 / 162 / 116

const SEC_X = 770, SEC_Y = 232, SEC_W = 340, SEC_H = 84;
const SEC_CX = SEC_X + SEC_W / 2, SEC_TOP = SEC_Y;           // 940 / 232

const CYL_X = 470, CYL_Y = 440, CYL_W = 170, CYL_H = 120;
const CYL_RIGHT = CYL_X + CYL_W, CYL_CY = CYL_Y + CYL_H / 2; // 640 / 500

const TREE_X = 700, TREE_Y = 436, TREE_W = 420, TREE_H = 120;
const TREE_LEFT = TREE_X, TREE_RIGHT = TREE_X + TREE_W, TREE_TOP = TREE_Y; // 700 / 1120 / 436
const FILE_Y = 486, FILE_H = 44, FILE_CY = FILE_Y + FILE_H / 2; // 508
const CHIPS_Y = 588;

const W_SEC_KUBE  = [[SEC_CX, SEC_TOP], [SEC_CX, KUBE_BOTTOM]];
const W_KUBE_TREE = [[KUBE_RIGHT, KUBE_CY], [1160, KUBE_CY], [1160, 470], [TREE_RIGHT, 470]];
const W_POD_TREE  = [[POD_CX, POD_BOTTOM], [POD_CX, 400], [TREE_LEFT, 400], [TREE_LEFT, TREE_TOP]];
const W_WALK      = [[720, FILE_CY], [1100, FILE_CY]];
const W_WALK_TOP  = [[720, FILE_CY], [768, FILE_CY]];         // OnRootMismatch: only the first entry

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

function podBlock({ x, y, w, h }) {
  const shell = pod({ x, y, w, h, label: 'Pod app-0', sublabel: 'runAsUser: 1000', containers: 0, cat: 'storage' });
  const shellRect = shell.querySelector('.scheme-pod-rect');
  if (shellRect) shellRect.style.fill = 'rgba(255, 255, 255, 0.03)';
  const innerBox = box({ x: x + 24, y: y + 42, w: w - 48, h: 46, label: 'container', sublabel: 'non-root', cat: 'storage' });
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
      'aria-label': 'fsGroup and volume ownership: a volume mounts owned by root so a non-root container cannot write, and securityContext.fsGroup makes kubelet chown and setgid the whole volume tree to that GID before the container starts, while fsGroupChangePolicy OnRootMismatch checks only the top-level directory and skips the walk when it already matches, which stops a volume of millions of files adding minutes to every Pod start whereas the default Always always walks',
      'data-style': 'outline',
    });
    root.appendChild(arrowDefs());

    const appPod = podBlock({ x: POD_X, y: POD_Y, w: POD_W, h: POD_H });
    const kube = box({ x: KUBE_X, y: KUBE_Y, w: KUBE_W, h: KUBE_H, label: 'kubelet', sublabel: 'applies fsGroup on start', cat: 'storage' });
    const sec  = box({ x: SEC_X, y: SEC_Y, w: SEC_W, h: SEC_H, label: 'securityContext', sublabel: 'fsGroup not set', cat: 'storage' });
    const cyl  = cylinder({ x: CYL_X, y: CYL_Y, w: CYL_W, h: CYL_H, label: 'vol-1', cat: 'storage' });
    const tree = box({ x: TREE_X, y: TREE_Y, w: TREE_W, h: TREE_H, label: 'volume tree', sublabel: 'owned root:root', cat: 'storage' });

    // File glyphs inside the tree, so the walk has something to sweep across.
    const files = [];
    for (let i = 0; i < 5; i++) {
      const fr = rect({ class: 'scheme-box-rect', x: 720 + i * 76, y: FILE_Y, width: 44, height: FILE_H, rx: 3 });
      fr.style.opacity = '0.55';
      files.push(fr);
    }

    // The tree is backed by the disk. A relationship, not traffic, so no arrowhead.
    const backLink = line({ class: 'scheme-arrow scheme-arrow-dashed scheme-arrow-dim scheme-arrow-storage', x1: TREE_LEFT, y1: 496, x2: CYL_RIGHT, y2: 496, 'stroke-dasharray': '5 5', fill: 'none' });

    const wSecKube  = pathArrow({ points: W_SEC_KUBE, dashed: true, dim: true, color: 'storage' });
    const wKubeTree = pathArrow({ points: W_KUBE_TREE, dashed: true, dim: true, color: 'storage' });
    const wPodTree  = pathArrow({ points: W_POD_TREE, dashed: true, dim: true, color: 'storage' });
    const wWalk = pathArrow({ points: W_WALK, dashed: true, dim: true, color: 'storage' });

    const secLbl = text({ class: 'scheme-label code dim', x: SEC_CX + 14, y: 200, 'text-anchor': 'start' }, [' ']);
    const treeLbl = text({ class: 'scheme-label code dim', x: 910, y: 424, 'text-anchor': 'middle' }, [' ']);

    const userChip   = valChip({ x: 60,  y: CHIPS_Y, w: 250, h: 32, name: 'runAsUser', value: '1000 (non-root)', cat: 'storage' });
    const ownerChip  = valChip({ x: 324, y: CHIPS_Y, w: 270, h: 32, name: 'owner', value: 'root:root', cat: 'storage' });
    const writeChip  = valChip({ x: 608, y: CHIPS_Y, w: 220, h: 32, name: 'write', value: 'denied', cat: 'storage' });
    const policyChip = valChip({ x: 842, y: CHIPS_Y, w: 300, h: 32, name: 'fsGroupChangePolicy', value: 'unset', cat: 'storage' });

    const packetLayer = g({ id: 'packetLayer' });

    // Z-order: blocks, then file glyphs, then wires + labels above, then chips, then the packet layer.
    [kube, sec, cyl, tree, appPod.group].forEach(el => root.appendChild(el));
    files.forEach(f => root.appendChild(f));
    [backLink, wSecKube, wKubeTree, wPodTree, wWalk].forEach(el => root.appendChild(el));
    [secLbl, treeLbl].forEach(el => root.appendChild(el));
    [userChip, ownerChip, writeChip, policyChip].forEach(c => root.appendChild(c));
    root.appendChild(packetLayer);

    this.host.appendChild(root);
    this.refs = {
      svg: root, appPod: appPod.group, appBox: appPod.innerBox,
      kube, sec, cyl, tree, files,
      userChip, ownerChip, writeChip, policyChip,
      wires: { sec: secLbl, tree: treeLbl },
      packetLayer,
    };
  }

  reset() { this.build(); }
}

function setChips(s, { user, owner, write, policy }) {
  setVal(s.refs.userChip, user);
  setVal(s.refs.ownerChip, owner);
  setVal(s.refs.writeChip, write);
  setVal(s.refs.policyChip, policy);
}

function clearHL(s) {
  clearHighlights(s, ['kube', 'sec', 'cyl', 'tree', 'appBox',
    'userChip', 'ownerChip', 'writeChip', 'policyChip'], [s.refs.appPod]);
}

// Sweep a scan ball across the file glyphs, brightening each as it passes: the tree walk.
function walkFiles(s, ctx, points, { delay = 0, only = 999 } = {}) {
  if (ctx.reduced) return delay + routeDur(points);
  const scan = routePacket(s, ctx, points, { cat: 'storage', delay, fadeIn: delay > 0 });
  s.refs.files.forEach((f, i) => {
    if (i >= only) return;
    const t = delay + routeDur(points) * (i / Math.max(1, s.refs.files.length - 1));
    const a = f.animate([{ opacity: 0.55 }, { opacity: 1 }, { opacity: 0.55 }], { duration: 500, delay: t, easing: 'ease-out' });
    ctx.register(a);
  });
  return scan.arrivalMs;
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
      setChips(s, { user: '1000 (non-root)', owner: 'root:root', write: 'denied', policy: 'unset' });
      setBoxSublabel(s.refs.tree, 'owned root:root');
      setBoxSublabel(s.refs.sec, 'fsGroup not set');
      s.refs.appPod.style.opacity = '0.5';
    },
  },
  {
    id: 'denied',
    duration: 2400,
    // The Pod is the actor and is stuck, so it pulses. No block flash on a Pod step.
    narration: 'Start the Pod with no fsGroup and it comes up, but the first write to the volume fails with permission denied. The disk is fine, the mount is fine. The ownership is simply wrong for a non-root process, and nothing in the container can fix a root-owned tree.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setChips(s, { user: '1000 (non-root)', owner: 'root:root', write: 'denied', policy: 'unset' });
      setBoxSublabel(s.refs.tree, 'owned root:root');
      s.refs.appPod.style.opacity = '0.5';
      s.refs.tree.classList.add('highlight');
      setWire(s, 'tree', 'write denied');
      if (ctx.reduced) return;
      pulsePodDim(s.refs.appPod, ctx, 0, { from: 0.5, peak: 0.85 });
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
      setChips(s, { user: '1000 (non-root)', owner: 'root:root', write: 'denied', policy: 'Always' });
      setBoxSublabel(s.refs.sec, 'fsGroup: 2000');
      setBoxSublabel(s.refs.tree, 'owned root:root');
      s.refs.appPod.style.opacity = '0.5';
      s.refs.sec.classList.add('highlight');
      setWire(s, 'sec', 'fsGroup: 2000');
      if (ctx.reduced) { s.refs.kube.classList.add('highlight'); return; }
      const r = routePacket(s, ctx, W_SEC_KUBE, { cat: 'storage' });
      ridingLabel(s, ctx, 'fsGroup: 2000', W_SEC_KUBE);
      lightBoxAt(s.refs.kube, ctx, r.arrivalMs);
    },
  },
  {
    id: 'chown',
    duration: 3400,
    narration: 'Before the container starts, kubelet walks the volume tree and chowns every entry to group 2000, setting the setgid bit so new files inherit it too. The owner becomes root, group 2000. This is real work on real inodes, done once at mount time.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setChips(s, { user: '1000 (non-root)', owner: 'root:2000 g+s', write: 'denied', policy: 'Always' });
      setBoxSublabel(s.refs.sec, 'fsGroup: 2000');
      setBoxSublabel(s.refs.tree, 'owned root:2000');
      s.refs.appPod.style.opacity = '0.5';
      s.refs.kube.classList.add('highlight');
      setWire(s, 'tree', 'chown + setgid');
      if (ctx.reduced) { s.refs.tree.classList.add('highlight'); return; }
      const r = routePacket(s, ctx, W_KUBE_TREE, { cat: 'storage' });
      ridingLabel(s, ctx, 'chown 2000', W_KUBE_TREE);
      const walkEnd = walkFiles(s, ctx, W_WALK, { delay: r.arrivalMs + BEAT.afterHop });
      lightBoxAt(s.refs.tree, ctx, walkEnd);
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
      setChips(s, { user: '1000 (non-root)', owner: 'root:2000 g+s', write: 'allowed', policy: 'Always' });
      setBoxSublabel(s.refs.tree, 'owned root:2000');
      s.refs.tree.classList.add('highlight');
      s.refs.appPod.style.opacity = '1';
      if (ctx.reduced) return;
      // Pod to infra: the container starts (pulse) first, then the write leaves at BEAT.afterPulse.
      s.refs.appPod.style.opacity = '0.5';
      ctx.register(s.refs.appPod.animate([{ opacity: 0.5 }, { opacity: 1 }], { duration: 500, delay: 0, fill: 'forwards', easing: 'ease-out' }));
      pulsePod(s.refs.appPod, ctx, 0);
      const w = routePacket(s, ctx, W_POD_TREE, { delay: BEAT.afterPulse, cat: 'storage' });
      ridingLabel(s, ctx, 'write ok', W_POD_TREE, { delay: BEAT.afterPulse });
      lightBoxAt(s.refs.tree, ctx, w.arrivalMs);
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
      setChips(s, { user: '1000 (non-root)', owner: 'root:2000 g+s', write: 'allowed', policy: 'Always (walks all)' });
      setBoxSublabel(s.refs.tree, 'millions of files');
      s.refs.appPod.style.opacity = '1';
      s.refs.policyChip.classList.add('highlight');
      setWire(s, 'tree', 'walk every file');
      if (ctx.reduced) { s.refs.tree.classList.add('highlight'); return; }
      const walkEnd = walkFiles(s, ctx, W_WALK, { delay: 0 });
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
      setChips(s, { user: '1000 (non-root)', owner: 'root:2000 g+s', write: 'allowed', policy: 'OnRootMismatch' });
      setBoxSublabel(s.refs.tree, 'top dir matches, skip');
      s.refs.appPod.style.opacity = '1';
      s.refs.policyChip.classList.add('highlight');
      setWire(s, 'tree', 'check top dir only');
      if (ctx.reduced) { s.refs.tree.classList.add('highlight'); return; }
      const walkEnd = walkFiles(s, ctx, W_WALK_TOP, { delay: 0, only: 1 });
      lightBoxAt(s.refs.tree, ctx, walkEnd);
    },
  },
];

export const init = makeInit(Scene, STEPS, { posterFirst: true });
