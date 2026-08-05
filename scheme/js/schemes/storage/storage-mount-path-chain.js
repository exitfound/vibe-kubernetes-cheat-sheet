import { svg, g, text } from '../../lib/svg.js';
import { arrowDefs, box, cylinder, pathArrow, podShell } from '../../lib/primitives.js';
import { valChip, setVal, setChip, pulsePod, routePacket, makeInit, clearHighlights, clearWires, setWire, BEAT, lightBoxAt, makeRidingLabel, OPACITY, revealAt } from './storage-kit.js';
// Design notes for this card: ./CARDS.md#storage-mount-path-chain


const LEFT_X = 400;
const COL_W = 180, COL_GAP = 40;
const CONTENT_W = COL_W * 2 + COL_GAP;                   // 400
const CONTENT_CX = LEFT_X + CONTENT_W / 2;               // 600, the canvas centre, shared by every tier

const L_X = LEFT_X;                                      // 400, the Pod A column
const R_X = LEFT_X + COL_W + COL_GAP;                    // 620, the Pod B column
const L_CX = L_X + COL_W / 2;                            // 490
const R_CX = R_X + COL_W / 2;                            // 710, and (490 + 710) / 2 == CONTENT_CX

const CORRIDOR = 60;                                     // the gap between two tiers, uniform
const POD_H = 116, BIND_H = 64, STG_H = 64, DEV_H = 88;
const DISK_LBL_GAP = 32;                                 // disk bottom to chip strip
const CHIP_H = 34;
// Total ink height, top of the Pods to the bottom of the chip strip.
const STACK_H = POD_H + CORRIDOR + BIND_H + CORRIDOR + STG_H + CORRIDOR + DEV_H + DISK_LBL_GAP + CHIP_H;
const STACK_TOP = (640 - STACK_H) / 2;                   // 31, so the margin is 31 above and below

const POD_Y = STACK_TOP;                                 // 31
const POD_BOTTOM = POD_Y + POD_H;                        // 147
const BIND_Y = POD_BOTTOM + CORRIDOR;                    // 207
const BIND_TOP = BIND_Y, BIND_BOTTOM = BIND_Y + BIND_H;  // 207 / 271
const STG_Y = BIND_BOTTOM + CORRIDOR;                    // 331
const STG_TOP = STG_Y, STG_BOTTOM = STG_Y + STG_H;       // 331 / 395
const DEV_W = 180;
const DEV_X = CONTENT_CX - DEV_W / 2;                    // 510
const DEV_Y = STG_BOTTOM + CORRIDOR, DEV_TOP = DEV_Y;    // 455
const DEV_BOTTOM = DEV_Y + DEV_H;                        // 543

const LBL_POD_Y = POD_BOTTOM + 36;                       // 183, corridor 147..207
const LBL_BIND_Y = BIND_BOTTOM + 36;                     // 307, corridor 271..331
const LBL_DISK_Y = DEV_BOTTOM + 20;                      // 563, corridor 543..575
const CHIPS_Y = DEV_BOTTOM + DISK_LBL_GAP;               // 575

const CHIP_W = 232, CHIP_GAP = 16, CHIP_COUNT = 4;
const CHIPS_W = CHIP_W * CHIP_COUNT + CHIP_GAP * (CHIP_COUNT - 1);   // 976
const CHIP_X = Array.from({ length: CHIP_COUNT }, (_, i) =>
  CONTENT_CX - CHIPS_W / 2 + i * (CHIP_W + CHIP_GAP));               // 112 .. 1088

const lane = (cx, y1, y2) => [[cx, y1], [cx, y2]];

const W_DEV_UP    = lane(CONTENT_CX, DEV_TOP, STG_BOTTOM);       // NodeStage: the one real mount
const W_STG_A_UP  = lane(L_CX, STG_TOP, BIND_BOTTOM);            // NodePublish: bind into Pod A
const W_STG_B_UP  = lane(R_CX, STG_TOP, BIND_BOTTOM);            // NodePublish: bind into Pod B
const W_A_POD_UP  = lane(L_CX, BIND_TOP, POD_BOTTOM);            // runtime maps it to /data
const W_B_POD_UP  = lane(R_CX, BIND_TOP, POD_BOTTOM);
// The write: the same three corridors, reversed. Column B never carries one, so it has no pair.
const W_POD_A_DN  = lane(L_CX, POD_BOTTOM, BIND_TOP);
const W_A_STG_DN  = lane(L_CX, BIND_BOTTOM, STG_TOP);
const W_STG_DEV_DN = lane(CONTENT_CX, STG_BOTTOM, DEV_TOP);

// The tag that rides a ball on this card. Constants preserved from its hand-rolled copy.
const ridingLabel = makeRidingLabel({ role: 'storage' });
const RIDE_UP = { dy: 18 };      // trailing side of an ascending ball

function podBlock({ x, label }) {
  const shell = podShell({ x, y: POD_Y, w: COL_W, h: POD_H, label, sublabel: 'uses vol-1 at /data', containers: 0, role: 'storage' });
  const innerBox = box({ x: x + 14, y: POD_Y + 40, w: COL_W - 28, h: 50, label: '/data', sublabel: 'mount point', role: 'storage' });
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
      'aria-label': 'Where the bytes land. One attached block device is mounted exactly once on the Node, at a global staging path under the Kubelet plugins directory. That single staged filesystem is then bind-mounted into a directory that belongs to one Pod alone, under the Kubelet Pods directory and the Pod uid, and the container runtime maps that directory to slash data inside the container. A second Pod on the same Node gets its own directory and its own bind mount off the same staging path, so two Pods share one disk through two separate bind mounts with no second attach and no second filesystem mount. A write to slash data descends the same chain, through the bind mount into the staging mount and onto the device, with no copy made at any hop.',
      'data-style': 'outline',
    });
    root.appendChild(arrowDefs());

    const podA = podBlock({ x: L_X, label: 'Pod A' });
    const podB = podBlock({ x: R_X, label: 'Pod B' });

    const bindA = box({ x: L_X, y: BIND_Y, w: COL_W, h: BIND_H, label: 'Pod A bind mount', sublabel: '/pods/uid-a/volumes/vol-1', role: 'storage' });
    const bindB = box({ x: R_X, y: BIND_Y, w: COL_W, h: BIND_H, label: 'Pod B bind mount', sublabel: '/pods/uid-b/volumes/vol-1', role: 'storage' });

    const stg = box({
      x: LEFT_X, y: STG_Y, w: CONTENT_W, h: STG_H,
      label: 'Global staging mount', sublabel: '/plugins/.../csi/vol-1/globalmount', role: 'storage',
    });
    const dev = cylinder({ x: DEV_X, y: DEV_Y, w: DEV_W, h: DEV_H, label: '/dev/nvme1n1', role: 'storage' });
    {
      const l = dev.querySelector('.scheme-cylinder-label');
      if (l) l.setAttribute('y', DEV_H / 2 + 10);
    }

    const mk = points => pathArrow({ points, dashed: true, dim: true, role: 'storage' });
    const wDevUp   = mk(W_DEV_UP);
    const wStgAUp  = mk(W_STG_A_UP);
    const wAPodUp  = mk(W_A_POD_UP);
    const wStgBUp  = mk(W_STG_B_UP);
    const wBPodUp  = mk(W_B_POD_UP);
    const wPodADn  = mk(W_POD_A_DN);
    const wAStgDn  = mk(W_A_STG_DN);
    const wStgDevDn = mk(W_STG_DEV_DN);
    const laterWires = [wStgBUp, wBPodUp, wPodADn, wAStgDn, wStgDevDn];
    laterWires.forEach(w => { w.style.opacity = '0'; });
    [podB.group, bindB].forEach(el => { el.style.opacity = '0'; });

    const podLbl  = text({ class: 'scheme-label code dim', x: CONTENT_CX, y: LBL_POD_Y,  'text-anchor': 'middle' }, [' ']);
    const bindLbl = text({ class: 'scheme-label code dim', x: CONTENT_CX, y: LBL_BIND_Y, 'text-anchor': 'middle' }, [' ']);
    const diskLbl = text({ class: 'scheme-label code dim', x: CONTENT_CX, y: LBL_DISK_Y, 'text-anchor': 'middle' }, [' ']);

    const devChip   = valChip({ x: CHIP_X[0], y: CHIPS_Y, w: CHIP_W, h: CHIP_H, name: 'device',       value: '/dev/nvme1n1', role: 'storage' });
    const mountChip = valChip({ x: CHIP_X[1], y: CHIPS_Y, w: CHIP_W, h: CHIP_H, name: 'disk mounted', value: 'not yet',      role: 'storage' });
    const bindChip  = valChip({ x: CHIP_X[2], y: CHIPS_Y, w: CHIP_W, h: CHIP_H, name: 'bind mounts',  value: 'none',         role: 'storage' });
    const copyChip  = valChip({ x: CHIP_X[3], y: CHIPS_Y, w: CHIP_W, h: CHIP_H, name: 'data copies',  value: 'none',         role: 'storage' });

    const packetLayer = g({ id: 'packetLayer' });

    [dev, stg, bindA, bindB, podA.group, podB.group].forEach(el => root.appendChild(el));
    [wDevUp, wStgAUp, wAPodUp, wStgBUp, wBPodUp, wPodADn, wAStgDn, wStgDevDn].forEach(el => root.appendChild(el));
    [podLbl, bindLbl, diskLbl].forEach(el => root.appendChild(el));
    [devChip, mountChip, bindChip, copyChip].forEach(c => root.appendChild(c));
    root.appendChild(packetLayer);

    this.host.appendChild(root);
    this.refs = {
      svg: root,
      podA: podA.group, podB: podB.group,
      ctrA: podA.innerBox, ctrB: podB.innerBox,
      bindA, bindB, stg, dev,
      wDevUp, wStgAUp, wAPodUp, wStgBUp, wBPodUp, wPodADn, wAStgDn, wStgDevDn,
      devChip, mountChip, bindChip, copyChip,
      wires: { pod: podLbl, bind: bindLbl, disk: diskLbl },
      packetLayer,
    };
  }

  reset() { this.build(); }
}

function setChips(s, { device, mounted, binds, copies }) {
  setChip(s.refs.devChip, device);
  setChip(s.refs.mountChip, mounted);
  setChip(s.refs.bindChip, binds);
  setChip(s.refs.copyChip, copies);
}

function resetStep(s) {
  s.refs.packetLayer.replaceChildren();
  clearHighlights(s, ['bindA', 'bindB', 'stg', 'dev',
    'devChip', 'mountChip', 'bindChip', 'copyChip'], [s.refs.podA, s.refs.podB]);
  clearWires(s);
}

function setStage(s, { podB = 0, binds = 0, descent = 0, podA = 1 }) {
  s.refs.podA.style.opacity = String(podA);
  s.refs.podB.style.opacity = String(podB);
  s.refs.bindB.style.opacity = String(binds);
  s.refs.wStgBUp.style.opacity = String(binds);
  s.refs.wBPodUp.style.opacity = String(binds);
  const mount = descent ? '0' : '1';
  [s.refs.wDevUp, s.refs.wStgAUp, s.refs.wAPodUp].forEach(w => { w.style.opacity = mount; });
  [s.refs.wPodADn, s.refs.wAStgDn, s.refs.wStgDevDn].forEach(w => { w.style.opacity = String(descent); });
}

function flipAt(upEl, dnEl, ctx, delay = 0) {
  if (!upEl || !dnEl) return;
  if (ctx.reduced || delay <= 0) { upEl.style.opacity = '0'; dnEl.style.opacity = '1'; return; }
  upEl.style.opacity = '1';
  dnEl.style.opacity = '0';
  ctx.register(upEl.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 300, delay, fill: 'forwards', easing: 'ease-in' }));
  ctx.register(dnEl.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 300, delay, fill: 'forwards', easing: 'ease-out' }));
}

const STEPS = [
  {
    id: 'idle',
    duration: 1500,
    enter(s) {
      resetStep(s);
      setChips(s, { device: '/dev/nvme1n1', mounted: 'not yet', binds: 'none', copies: 'none' });
      setStage(s, { podA: OPACITY.pending });
      setWire(s, 'disk', 'attached to node-1');
    },
  },
  {
    id: 'stage',
    duration: 2600,
    narration: 'The device is mounted exactly once, at a global staging path under the Kubelet plugins directory. This is the only place the filesystem itself is mounted on the Node. Everything above this point is not another mount of the disk, it is a view onto this one.',
    enter(s, ctx) {
      resetStep(s);
      setChips(s, { device: '/dev/nvme1n1', mounted: 'once', binds: 'none', copies: 'none' });
      setStage(s, { podA: OPACITY.pending });
      setWire(s, 'disk', 'mounted once, here');
      s.refs.dev.classList.add('highlight');
      if (ctx.reduced) { s.refs.stg.classList.add('highlight'); return; }
      // No Pod is involved in NodeStage, so nothing pulses: the ball leaves after BEAT.lead so the
      // lit device registers as the source before it departs, and the staging mount lights on arrival.
      const m = routePacket(s, ctx, W_DEV_UP, { delay: BEAT.lead, role: 'storage' });
      ridingLabel(s, ctx, 'NodeStage', W_DEV_UP, { delay: BEAT.lead, ...RIDE_UP });
      lightBoxAt(s.refs.stg, ctx, m.arrivalMs);
    },
  },
  {
    id: 'bind',
    duration: 2800,
    narration: 'NodePublish does not touch the disk again. It bind-mounts the staged directory into a directory that belongs to Pod A alone, under /var/lib/kubelet/pods and the Pod uid. A bind mount is a second doorway onto the exact same files, not a copy.',
    enter(s, ctx) {
      resetStep(s);
      setChips(s, { device: '/dev/nvme1n1', mounted: 'once', binds: 'Pod A', copies: 'none' });
      setStage(s, { podA: OPACITY.pending });
      setWire(s, 'bind', 'NodePublish: bind mount');
      setWire(s, 'disk', 'still mounted once');
      s.refs.stg.classList.add('highlight');
      if (ctx.reduced) { s.refs.bindA.classList.add('highlight'); return; }
      const b = routePacket(s, ctx, W_STG_A_UP, { delay: BEAT.lead, role: 'storage' });
      ridingLabel(s, ctx, 'bind', W_STG_A_UP, { delay: BEAT.lead, ...RIDE_UP });
      lightBoxAt(s.refs.bindA, ctx, b.arrivalMs);
    },
  },
  {
    id: 'surface',
    duration: 3000,
    narration: 'That per-Pod directory is what the container runtime maps to /data inside Pod A. From the container it looks like a plain folder. Underneath, it is a bind mount of a bind mount of one staged device. Pod A can now read and write.',
    enter(s, ctx) {
      resetStep(s);
      setChips(s, { device: '/dev/nvme1n1', mounted: 'once', binds: 'Pod A', copies: 'none' });
      setStage(s, {});                                  // Pod A comes up to full opacity here
      setWire(s, 'pod', 'the runtime maps it');
      s.refs.bindA.classList.add('highlight');
      if (ctx.reduced) return;
      const p = routePacket(s, ctx, W_A_POD_UP, { role: 'storage' });
      ridingLabel(s, ctx, 'mount /data', W_A_POD_UP, RIDE_UP);
      s.refs.podA.style.opacity = String(OPACITY.pending);
      ctx.register(s.refs.podA.animate([{ opacity: OPACITY.pending }, { opacity: 1 }], { duration: 500, delay: p.arrivalMs, fill: 'forwards', easing: 'ease-out' }));
      pulsePod(s.refs.podA, ctx, p.arrivalMs);
    },
  },
  {
    id: 'second',
    duration: 3600,
    narration: 'A second Pod on the same Node gets its own directory and its own bind mount off the same global staging path. The disk is not attached twice and not staged twice. Two Pods, two bind mounts, one device underneath. That is how a single disk is shared across Pods on a Node.',
    enter(s, ctx) {
      resetStep(s);
      setChips(s, { device: '/dev/nvme1n1', mounted: 'once', binds: 'Pod A and Pod B', copies: 'none' });
      setStage(s, { podB: 1, binds: 1 });
      setWire(s, 'bind', 'a second bind mount');
      setWire(s, 'disk', 'still mounted once');
      s.refs.stg.classList.add('highlight');
      s.refs.bindA.classList.add('highlight');
      if (ctx.reduced) { s.refs.bindB.classList.add('highlight'); return; }
      // The Pod B column materializes as the chain claims it: its lanes and bind box first, then the
      // Pod itself once the bind mount has landed under it.
      [s.refs.wStgBUp, s.refs.wBPodUp, s.refs.bindB].forEach(el => revealAt(el, ctx, 1));
      const b = routePacket(s, ctx, W_STG_B_UP, { delay: BEAT.lead, role: 'storage' });
      ridingLabel(s, ctx, 'bind', W_STG_B_UP, { delay: BEAT.lead, ...RIDE_UP });
      lightBoxAt(s.refs.bindB, ctx, b.arrivalMs);
      const p = routePacket(s, ctx, W_B_POD_UP, { delay: b.arrivalMs + BEAT.afterHop, role: 'storage' });
      ridingLabel(s, ctx, 'mount /data', W_B_POD_UP, { delay: b.arrivalMs + BEAT.afterHop, ...RIDE_UP });
      s.refs.podB.style.opacity = '0';
      ctx.register(s.refs.podB.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 500, delay: b.arrivalMs, fill: 'forwards', easing: 'ease-out' }));
      pulsePod(s.refs.podB, ctx, p.arrivalMs);
    },
  },
  {
    id: 'write',
    duration: 4400,
    narration: 'Follow a write the other way. Pod A writes to /data, and the bytes pass down through its bind mount, into the global staging mount, and onto the device. No copy is made at any hop. All the mounts are windows onto the same blocks on the same disk.',
    enter(s, ctx) {
      resetStep(s);
      setChips(s, { device: '/dev/nvme1n1', mounted: 'once', binds: 'Pod A and Pod B', copies: 'none' });
      setStage(s, { podB: 1, binds: 1, descent: 1 });
      setWire(s, 'pod', 'same files, no copy');
      setWire(s, 'disk', 'the bytes land here');
      if (ctx.reduced) {
        [s.refs.bindA, s.refs.stg, s.refs.dev].forEach(el => el.classList.add('highlight'));
        return;
      }
      pulsePod(s.refs.podA, ctx, 0);
      flipAt(s.refs.wAPodUp, s.refs.wPodADn, ctx, 1);
      const h1 = routePacket(s, ctx, W_POD_A_DN, { delay: BEAT.afterPulse, role: 'storage' });
      ridingLabel(s, ctx, 'write', W_POD_A_DN, { delay: BEAT.afterPulse });
      lightBoxAt(s.refs.bindA, ctx, h1.arrivalMs);

      flipAt(s.refs.wStgAUp, s.refs.wAStgDn, ctx, h1.arrivalMs);
      const h2 = routePacket(s, ctx, W_A_STG_DN, { delay: h1.arrivalMs + BEAT.afterHop, role: 'storage' });
      ridingLabel(s, ctx, 'same blocks', W_A_STG_DN, { delay: h1.arrivalMs + BEAT.afterHop });
      lightBoxAt(s.refs.stg, ctx, h2.arrivalMs);

      flipAt(s.refs.wDevUp, s.refs.wStgDevDn, ctx, h2.arrivalMs);
      const h3 = routePacket(s, ctx, W_STG_DEV_DN, { delay: h2.arrivalMs + BEAT.afterHop, role: 'storage' });
      ridingLabel(s, ctx, 'bytes land', W_STG_DEV_DN, { delay: h2.arrivalMs + BEAT.afterHop });
      lightBoxAt(s.refs.dev, ctx, h3.arrivalMs);
    },
  },
];

export const init = makeInit(Scene, STEPS, { posterFirst: true });
