import { svg, g, text } from '../lib/svg.js';
import { arrowDefs, box, pod, cylinder, pathArrow, chainList, setChainActive, animateAlong } from '../lib/primitives.js';
import {
  valChip, setVal, pulsePod, routePacket, routeDur, makeInit, clearHighlights, clearWires, setWire, BEAT,
} from '../lib/storage-kit.js';

// Attach and Mount Chain (viewBox 1200x640). THE LADDER CARD. The four gRPC calls that stand between
// a PVC and a writable /data are a numbered ladder down the LEFT (chainList, one rung lit per step),
// and the RIGHT is the topology those calls act on: the CSI controller and the cloud disk up top, the
// node below with its attached block device, the ONE global staging mount, and the two Pods that
// share it. The descent is literal: CreateVolume makes the disk, ControllerPublishVolume moves it
// into the node as a device, NodeStageVolume mounts it once at the global path, NodePublishVolume
// bind-mounts that one staged filesystem into each Pod. Stage is once per node, publish is once per
// Pod, which is exactly how two Pods on one node share a single attached disk. The narration overlay
// owns x<=380 & y<=300, so the ladder tops sit at y>=360 and all topology is at x>=618.
const LAD_X = 60, LAD_Y = 360, LAD_W = 508, LAD_ROW = 46, LAD_GAP = 12;

const CTRL_X = 624, CTRL_Y = 64, CTRL_W = 252, CTRL_H = 64;
const CTRL_RIGHT = CTRL_X + CTRL_W, CTRL_CY = CTRL_Y + CTRL_H / 2; // 876 / 96

const CDISK_X = 1010, CDISK_Y = 64, CDISK_W = 150, CDISK_H = 104;
const CDISK_CX = CDISK_X + CDISK_W / 2, CDISK_LEFT = CDISK_X, CDISK_BOTTOM = CDISK_Y + CDISK_H; // 1085 / 1010 / 168

const NF_X = 618, NF_Y = 208, NF_W = 560, NF_H = 388;             // node frame

const DEV_X = 1010, DEV_Y = 236, DEV_W = 150, DEV_H = 94;
const DEV_CX = DEV_X + DEV_W / 2, DEV_TOP = DEV_Y, DEV_BOTTOM = DEV_Y + DEV_H; // 1085 / 236 / 330

const ND_X = 648, ND_Y = 244, ND_W = 250, ND_H = 60;             // CSI node driver
const STG_X = 648, STG_Y = 352, STG_W = 322, STG_H = 62;         // global staging mount
const STG_CX = STG_X + STG_W / 2, STG_RIGHT = STG_X + STG_W, STG_BOTTOM = STG_Y + STG_H; // 809 / 970 / 414

const PODA_X = 648, PODB_X = 946, POD_Y = 464, POD_W = 228, POD_H = 110;
const PODA_CX = PODA_X + POD_W / 2, PODB_CX = PODB_X + POD_W / 2; // 762 / 1060
const CHIPS_Y = 610;

const W_CREATE  = [[CTRL_RIGHT, CTRL_CY], [985, CTRL_CY], [985, 116], [CDISK_LEFT, 116]];
const W_ATTACH  = [[CDISK_CX, CDISK_BOTTOM], [CDISK_CX, DEV_TOP]];
const W_STAGE   = [[DEV_CX, DEV_BOTTOM], [DEV_CX, 388], [STG_RIGHT, 388]];
const W_PUB_A   = [[STG_CX, STG_BOTTOM], [STG_CX, 440], [PODA_CX, 440], [PODA_CX, POD_Y]];
const W_PUB_B   = [[STG_CX, STG_BOTTOM], [STG_CX, 440], [PODB_CX, 440], [PODB_CX, POD_Y]];

function lightBoxAt(boxEl, ctx, delay = 0) {
  if (!boxEl) return;
  if (ctx.reduced || delay <= 0) { boxEl.classList.add('highlight'); return; }
  const a = boxEl.animate([{ opacity: 1 }, { opacity: 1 }], { duration: 1, delay });
  a.onfinish = () => boxEl.classList.add('highlight');
  ctx.register(a);
}

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

function podBlock({ x, y, w, h, label }) {
  const shell = pod({ x, y, w, h, label, sublabel: 'mount /data', containers: 0, cat: 'storage' });
  const shellRect = shell.querySelector('.scheme-pod-rect');
  if (shellRect) shellRect.style.fill = 'rgba(255, 255, 255, 0.03)';
  const innerBox = box({ x: x + 24, y: y + 40, w: w - 48, h: 46, label: '/data', sublabel: 'writable', cat: 'storage' });
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
      'aria-label': 'The CSI attach and mount chain: four gRPC calls take a volume from nowhere to a writable path, CreateVolume makes the disk, ControllerPublishVolume attaches it to the node, NodeStageVolume formats and mounts it once at a global staging path, and NodePublishVolume bind-mounts that one staged filesystem into each Pod, which is how two Pods on one node share a single attached disk',
      'data-style': 'outline',
    });
    root.appendChild(arrowDefs());

    const chain = chainList({
      x: LAD_X, y: LAD_Y, w: LAD_W, rowH: LAD_ROW, gap: LAD_GAP,
      items: [
        '1. CreateVolume  ·  the disk now exists',
        '2. ControllerPublishVolume  ·  attached to the node',
        '3. NodeStageVolume  ·  formatted, mounted once',
        '4. NodePublishVolume  ·  bind-mounted into the Pod',
      ],
      cat: 'storage',
    });

    const ctrl  = box({ x: CTRL_X, y: CTRL_Y, w: CTRL_W, h: CTRL_H, label: 'CSI controller', sublabel: 'attacher + provisioner', cat: 'storage' });
    const cdisk = cylinder({ x: CDISK_X, y: CDISK_Y, w: CDISK_W, h: CDISK_H, label: 'cloud disk vol-1', cat: 'storage' });
    const dev   = cylinder({ x: DEV_X, y: DEV_Y, w: DEV_W, h: DEV_H, label: 'nvme1n1', cat: 'storage' });
    dev.style.opacity = '0';
    const nd    = box({ x: ND_X, y: ND_Y, w: ND_W, h: ND_H, label: 'CSI node driver', sublabel: 'node plugin', cat: 'storage' });
    const stg   = box({ x: STG_X, y: STG_Y, w: STG_W, h: STG_H, label: 'global staging mount', sublabel: '.../csi/vol-1/globalmount', cat: 'storage' });
    const podA  = podBlock({ x: PODA_X, y: POD_Y, w: POD_W, h: POD_H, label: 'Pod A' });
    const podB  = podBlock({ x: PODB_X, y: POD_Y, w: POD_W, h: POD_H, label: 'Pod B' });
    podB.group.style.opacity = '0';

    const nodeFrame = box({ x: NF_X, y: NF_Y, w: NF_W, h: NF_H, label: '', sublabel: '', cat: 'storage' });
    nodeFrame.querySelector('.scheme-box-rect').style.fill = 'none';
    nodeFrame.appendChild(text({ class: 'scheme-label dim', x: NF_X + 16, y: NF_Y + 22, 'text-anchor': 'start' }, ['node-a']));

    const wCreate = pathArrow({ points: W_CREATE, dashed: true, dim: true, color: 'storage' });
    const wAttach = pathArrow({ points: W_ATTACH, dashed: true, dim: true, color: 'storage' });
    const wStage  = pathArrow({ points: W_STAGE, dashed: true, dim: true, color: 'storage' });
    const wPubA   = pathArrow({ points: W_PUB_A, dashed: true, dim: true, color: 'storage' });
    const wPubB   = pathArrow({ points: W_PUB_B, dashed: true, dim: true, color: 'storage' });
    wPubB.style.opacity = '0';

    const stageLbl = text({ class: 'scheme-label code dim', x: STG_RIGHT + 8, y: 384, 'text-anchor': 'start' }, [' ']);

    const diskChip  = valChip({ x: 60,  y: CHIPS_Y, w: 236, h: 30, name: 'disk',    value: 'none', cat: 'storage' });
    const stageChip = valChip({ x: 314, y: CHIPS_Y, w: 210, h: 30, name: 'staging', value: 'none', cat: 'storage' });
    const podsChip  = valChip({ x: 542, y: CHIPS_Y, w: 300, h: 30, name: 'Pods on node', value: 'none', cat: 'storage' });

    const packetLayer = g({ id: 'packetLayer' });

    // Z-order: node frame behind, then blocks, then wires + label, then the ladder and chips, then the
    // packet layer on top. The ladder is appended after the packet layer so its lit rung stays crisp.
    root.appendChild(nodeFrame);
    [ctrl, cdisk, dev, nd, stg, podA.group, podB.group].forEach(el => root.appendChild(el));
    [wCreate, wAttach, wStage, wPubA, wPubB].forEach(el => root.appendChild(el));
    root.appendChild(stageLbl);
    [diskChip, stageChip, podsChip].forEach(c => root.appendChild(c));
    root.appendChild(packetLayer);
    root.appendChild(chain);

    this.host.appendChild(root);
    this.refs = {
      svg: root, chain, ctrl, cdisk, dev, nd, stg,
      podA: podA.group, podABox: podA.innerBox, podB: podB.group, podBBox: podB.innerBox, wPubB,
      diskChip, stageChip, podsChip,
      wires: { stage: stageLbl },
      packetLayer,
    };
  }

  reset() { this.build(); }
}

function setChips(s, { disk, stage, pods }) {
  setVal(s.refs.diskChip, disk);
  setVal(s.refs.stageChip, stage);
  setVal(s.refs.podsChip, pods);
}

function clearHL(s) {
  clearHighlights(s, ['ctrl', 'cdisk', 'dev', 'nd', 'stg', 'podABox', 'podBBox',
    'diskChip', 'stageChip', 'podsChip'], [s.refs.podA, s.refs.podB]);
}

const STEPS = [
  {
    id: 'idle',
    duration: 1500,
    narration: 'Between a bound claim and a container that can write to /data stand four gRPC calls. Two are controller calls that happen once in the cluster, two are node calls that happen on the machine where the Pod lands. Nothing is mounted until all four have run in order.',
    enter(s) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setChainActive(s.refs.chain, -1);
      setChips(s, { disk: 'none', stage: 'none', pods: 'none' });
      s.refs.dev.style.opacity = '0';
      s.refs.podA.style.opacity = '0.5';
      s.refs.podB.style.opacity = '0';
      s.refs.wPubB.style.opacity = '0';
    },
  },
  {
    id: 'create',
    duration: 2800,
    narration: 'CreateVolume runs first, on the controller side. The provisioner asks the driver to carve a real disk out of the cloud backend. When it returns, a disk called vol-1 exists somewhere in the provider, but it is not near any node yet and nothing can read a byte of it.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setChainActive(s.refs.chain, 0);
      setChips(s, { disk: 'vol-1 exists', stage: 'none', pods: 'none' });
      s.refs.dev.style.opacity = '0';
      s.refs.podA.style.opacity = '0.5';
      s.refs.podB.style.opacity = '0';
      s.refs.wPubB.style.opacity = '0';
      s.refs.ctrl.classList.add('highlight');
      if (ctx.reduced) { s.refs.cdisk.classList.add('highlight'); return; }
      const c = routePacket(s, ctx, W_CREATE, { cat: 'storage' });
      ridingLabel(s, ctx, 'CreateVolume', W_CREATE);
      lightBoxAt(s.refs.cdisk, ctx, c.arrivalMs);
    },
  },
  {
    id: 'attach',
    duration: 2800,
    narration: 'ControllerPublishVolume runs next, still on the controller side. The external-attacher asks the driver to attach vol-1 to the node the Pod was scheduled on. This is a cloud operation: the disk shows up on the node as a raw block device, here /dev/nvme1n1. It is still unformatted.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setChainActive(s.refs.chain, 1);
      setChips(s, { disk: 'attached to node-a', stage: 'none', pods: 'none' });
      s.refs.podA.style.opacity = '0.5';
      s.refs.podB.style.opacity = '0';
      s.refs.wPubB.style.opacity = '0';
      s.refs.ctrl.classList.add('highlight');
      s.refs.cdisk.classList.add('highlight');
      // The block device exists on the node by the end of this step, so its visibility is the end-state.
      s.refs.dev.style.opacity = '1';
      if (ctx.reduced) { s.refs.dev.classList.add('highlight'); return; }
      const a = routePacket(s, ctx, W_ATTACH, { cat: 'storage' });
      ridingLabel(s, ctx, 'ControllerPublish', W_ATTACH);
      revealAt(s.refs.dev, ctx, a.arrivalMs);
      lightBoxAt(s.refs.dev, ctx, a.arrivalMs);
    },
  },
  {
    id: 'stage',
    duration: 3000,
    narration: 'NodeStageVolume is the first node call. The node plugin formats the raw device if needed and mounts it once, at a global staging path under the kubelet directory. This happens a single time per node no matter how many Pods will use the volume, which is the whole reason stage and publish are two calls, not one.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setChainActive(s.refs.chain, 2);
      setChips(s, { disk: 'attached to node-a', stage: 'mounted once', pods: 'none' });
      s.refs.dev.style.opacity = '1';
      s.refs.podA.style.opacity = '0.5';
      s.refs.podB.style.opacity = '0';
      s.refs.wPubB.style.opacity = '0';
      s.refs.dev.classList.add('highlight');
      s.refs.nd.classList.add('highlight');
      setWire(s, 'stage', 'format + mount');
      if (ctx.reduced) { s.refs.stg.classList.add('highlight'); return; }
      const st = routePacket(s, ctx, W_STAGE, { cat: 'storage' });
      ridingLabel(s, ctx, 'NodeStage', W_STAGE);
      lightBoxAt(s.refs.stg, ctx, st.arrivalMs);
    },
  },
  {
    id: 'publish',
    duration: 3200,
    narration: 'NodePublishVolume is the last call, once per Pod. It does not re-mount the disk. It bind-mounts the already staged filesystem into this Pod private directory, which surfaces as /data inside the container. Only now does Pod A start and begin writing.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setChainActive(s.refs.chain, 3);
      setChips(s, { disk: 'attached to node-a', stage: 'mounted once', pods: 'Pod A' });
      s.refs.dev.style.opacity = '1';
      s.refs.podB.style.opacity = '0';
      s.refs.wPubB.style.opacity = '0';
      s.refs.stg.classList.add('highlight');
      setWire(s, 'stage', 'staged once');
      // Pod A is running by the end of this step, so full opacity is the static end-state.
      s.refs.podA.style.opacity = '1';
      if (ctx.reduced) { s.refs.podABox.classList.add('highlight'); return; }
      const p = routePacket(s, ctx, W_PUB_A, { cat: 'storage' });
      ridingLabel(s, ctx, 'NodePublish', W_PUB_A);
      s.refs.podA.style.opacity = '0.5';
      ctx.register(s.refs.podA.animate([{ opacity: 0.5 }, { opacity: 1 }], { duration: 500, delay: p.arrivalMs, fill: 'forwards', easing: 'ease-out' }));
      pulsePod(s.refs.podA, ctx, p.arrivalMs);
      lightBoxAt(s.refs.podABox, ctx, p.arrivalMs);
    },
  },
  {
    id: 'share',
    duration: 3200,
    narration: 'A second Pod lands on the same node and asks for the same volume. The disk is already attached and already staged, so those two calls are skipped entirely. Only one more NodePublishVolume runs, a second bind-mount off the same global staging path. That is how several Pods on one node share a single attached disk.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setChainActive(s.refs.chain, 3);
      setChips(s, { disk: 'attached to node-a', stage: 'mounted once', pods: 'Pod A + Pod B' });
      s.refs.dev.style.opacity = '1';
      s.refs.podA.style.opacity = '1';
      s.refs.stg.classList.add('highlight');
      setWire(s, 'stage', 'staged once');
      // Pod B is present and running by the end of this step.
      s.refs.podB.style.opacity = '1';
      s.refs.wPubB.style.opacity = '1';
      if (ctx.reduced) { s.refs.podBBox.classList.add('highlight'); return; }
      const p = routePacket(s, ctx, W_PUB_B, { cat: 'storage' });
      ridingLabel(s, ctx, 'NodePublish again', W_PUB_B);
      s.refs.podB.style.opacity = '0';
      ctx.register(s.refs.podB.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 500, delay: Math.max(0, p.arrivalMs - 400), fill: 'forwards', easing: 'ease-out' }));
      pulsePod(s.refs.podB, ctx, p.arrivalMs);
      lightBoxAt(s.refs.podBBox, ctx, p.arrivalMs);
    },
  },
];

export const init = makeInit(Scene, STEPS, { posterFirst: true });
