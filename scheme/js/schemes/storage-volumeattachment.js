import { svg, g, text, line } from '../lib/svg.js';
import { arrowDefs, box, pod, cylinder, pathArrow, animateAlong } from '../lib/primitives.js';
import {
  valChip, setVal, setBoxSublabel, pulsePod, pulsePodDim, routePacket, routeDur,
  makeInit, clearHighlights, clearWires, setWire, BEAT,
} from '../lib/storage-kit.js';

// VolumeAttachment (viewBox 1200x640). The identity spine at x=560 runs Pod -> VolumeAttachment ->
// kubelet, because the VolumeAttachment object, not the Pod, is the cluster record of "this disk is
// on that node". The attach/detach controller lives in kube-controller-manager, NOT in kubelet, and
// it is the thing that WRITES the object. The external-attacher watches it, calls
// ControllerPublishVolume, and on success stamps status.attached=true back on the same object. Only
// then does kubelet, waiting on that field, proceed to mount. Deleting the object is what triggers
// detach. Right column is the machinery (controller, attacher, cloud, disk). The narration overlay
// owns x<=380 & y<=300, so the whole spine sits at x>=417 and the disk top is at y=452.
const SPINE_X = 560;

const POD_X = 445, POD_Y = 54, POD_W = 230, POD_H = 108;
const POD_RIGHT = POD_X + POD_W, POD_BOTTOM = POD_Y + POD_H; // 675 / 162

const ADC_X = 770, ADC_Y = 70, ADC_W = 330, ADC_H = 82;
const ADC_LEFT = ADC_X, ADC_BOTTOM = ADC_Y + ADC_H;         // 770 / 152

const VA_X = 417, VA_Y = 252, VA_W = 286, VA_H = 96;
const VA_RIGHT = VA_X + VA_W, VA_TOP = VA_Y, VA_BOTTOM = VA_Y + VA_H; // 703 / 252 / 348

const ATT_X = 790, ATT_Y = 256, ATT_W = 300, ATT_H = 82;
const ATT_LEFT = ATT_X, ATT_BOTTOM = ATT_Y + ATT_H;         // 790 / 338

const KUBE_X = 435, KUBE_Y = 474, KUBE_W = 250, KUBE_H = 80;
const KUBE_RIGHT = KUBE_X + KUBE_W, KUBE_TOP = KUBE_Y, KUBE_CY = KUBE_Y + KUBE_H / 2; // 685 / 474 / 514

const CLOUD_X = 790, CLOUD_Y = 472, CLOUD_W = 210, CLOUD_H = 82;
const CLOUD_TOP = CLOUD_Y, CLOUD_RIGHT = CLOUD_X + CLOUD_W, CLOUD_CY = CLOUD_Y + CLOUD_H / 2; // 472 / 1000 / 513

const DISK_X = 1040, DISK_Y = 452, DISK_W = 130, DISK_H = 112;
const DISK_LEFT = DISK_X, DISK_CY = DISK_Y + DISK_H / 2;     // 1040 / 508
const CHIPS_Y = 594;
const DIM = 0.45;

const W_WRITE_VA    = [[ADC_LEFT, 130], [732, 130], [732, 288], [VA_RIGHT, 288]];
const W_WATCH_VA    = [[VA_RIGHT, 314], [ATT_LEFT, 314]];
const W_STATUS      = [[ATT_LEFT, 330], [VA_RIGHT, 330]];
const W_ATTACH_CLOUD = [[940, ATT_BOTTOM], [940, 410], [895, 410], [895, CLOUD_TOP]];
const W_CLOUD_DISK  = [[CLOUD_RIGHT, CLOUD_CY], [DISK_LEFT, DISK_CY]];
const W_GATE        = [[SPINE_X, VA_BOTTOM], [SPINE_X, KUBE_TOP]];
const W_MOUNT       = [[KUBE_RIGHT, KUBE_CY], [740, KUBE_CY], [740, POD_BOTTOM - 54], [POD_RIGHT, POD_BOTTOM - 54]];

function lightBoxAt(boxEl, ctx, delay = 0) {
  if (!boxEl) return;
  if (ctx.reduced || delay <= 0) { boxEl.classList.add('highlight'); return; }
  const a = boxEl.animate([{ opacity: 1 }, { opacity: 1 }], { duration: 1, delay });
  a.onfinish = () => boxEl.classList.add('highlight');
  ctx.register(a);
}

function dimBoxAt(el, ctx, delay = 0) {
  if (!el) return;
  if (ctx.reduced || delay <= 0) { el.style.opacity = String(DIM); return; }
  ctx.register(el.animate([{ opacity: 1 }, { opacity: DIM }], { duration: 400, delay, fill: 'forwards', easing: 'ease-out' }));
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
  const innerBox = box({ x: x + 22, y: y + 40, w: w - 44, h: 46, label: 'app', sublabel: 'wants /data', cat: 'storage' });
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
      'aria-label': 'The VolumeAttachment object: the attach and detach controller inside kube-controller-manager, not kubelet, decides a volume must be attached and writes a VolumeAttachment, the external-attacher watches it and calls ControllerPublishVolume, on success it sets status.attached true, and only then does kubelet mount, so the VolumeAttachment, not the Pod, is the cluster record that this disk is on that node and deleting it triggers detach',
      'data-style': 'outline',
    });
    root.appendChild(arrowDefs());

    const appPod = podBlock({ x: POD_X, y: POD_Y, w: POD_W, h: POD_H, label: 'Pod web-0', sublabel: 'needs vol-1' });
    const adc  = box({ x: ADC_X, y: ADC_Y, w: ADC_W, h: ADC_H, label: 'attach/detach controller', sublabel: 'in kube-controller-manager', cat: 'storage' });
    const va   = box({ x: VA_X, y: VA_Y, w: VA_W, h: VA_H, label: 'VolumeAttachment va-7f', sublabel: 'node: node-a', cat: 'storage' });
    const att  = box({ x: ATT_X, y: ATT_Y, w: ATT_W, h: ATT_H, label: 'external-attacher', sublabel: 'watches VolumeAttachment', cat: 'storage' });
    const kube = box({ x: KUBE_X, y: KUBE_Y, w: KUBE_W, h: KUBE_H, label: 'kubelet', sublabel: 'mounts only after attached', cat: 'storage' });
    const cloud = box({ x: CLOUD_X, y: CLOUD_Y, w: CLOUD_W, h: CLOUD_H, label: 'cloud storage API', sublabel: 'attaches the disk', cat: 'storage' });
    const disk = cylinder({ x: DISK_X, y: DISK_Y, w: DISK_W, h: DISK_H, label: 'vol-1', cat: 'storage' });

    // The identity spine above the VolumeAttachment: the Pod needs the volume. It carries no traffic,
    // so no arrowhead.
    const refPodVa = line({ class: 'scheme-arrow scheme-arrow-dashed scheme-arrow-dim scheme-arrow-storage', x1: SPINE_X, y1: POD_BOTTOM, x2: SPINE_X, y2: VA_TOP, 'stroke-dasharray': '5 5', fill: 'none' });

    const wWrite = pathArrow({ points: W_WRITE_VA, dashed: true, dim: true, color: 'storage' });
    const wWatch = pathArrow({ points: W_WATCH_VA, dashed: true, dim: true, color: 'storage' });
    const wStatus = pathArrow({ points: W_STATUS, dashed: true, dim: true, color: 'storage' });
    const wAttCloud = pathArrow({ points: W_ATTACH_CLOUD, dashed: true, dim: true, color: 'storage' });
    const wCloudDisk = pathArrow({ points: W_CLOUD_DISK, dashed: true, dim: true, color: 'storage' });
    const wGate = pathArrow({ points: W_GATE, dashed: true, dim: true, color: 'storage' });
    const wMount = pathArrow({ points: W_MOUNT, dashed: true, dim: true, color: 'storage' });

    const writeLbl = text({ class: 'scheme-label code dim', x: 732 + 10, y: 250, 'text-anchor': 'start' }, [' ']);
    const statusLbl = text({ class: 'scheme-label code dim', x: (VA_RIGHT + ATT_LEFT) / 2, y: 366, 'text-anchor': 'middle' }, [' ']);
    const gateLbl = text({ class: 'scheme-label code dim', x: SPINE_X + 12, y: 416, 'text-anchor': 'start' }, [' ']);

    const vaChip   = valChip({ x: 60,  y: CHIPS_Y, w: 300, h: 32, name: 'VolumeAttachment', value: 'none', cat: 'storage' });
    const attChip  = valChip({ x: 384, y: CHIPS_Y, w: 300, h: 32, name: 'attach', value: 'none', cat: 'storage' });
    const kubeChip = valChip({ x: 708, y: CHIPS_Y, w: 300, h: 32, name: 'kubelet', value: 'blocked', cat: 'storage' });

    const packetLayer = g({ id: 'packetLayer' });

    // Z-order: blocks, then the spine + wires + their labels, then chips, then the packet layer on top.
    [adc, va, att, kube, cloud, disk, appPod.group].forEach(el => root.appendChild(el));
    [refPodVa, wWrite, wWatch, wStatus, wAttCloud, wCloudDisk, wGate, wMount].forEach(el => root.appendChild(el));
    [writeLbl, statusLbl, gateLbl].forEach(el => root.appendChild(el));
    [vaChip, attChip, kubeChip].forEach(c => root.appendChild(c));
    root.appendChild(packetLayer);

    this.host.appendChild(root);
    this.refs = {
      svg: root, appPod: appPod.group, appBox: appPod.innerBox,
      adc, va, att, kube, cloud, disk,
      vaChip, attChip, kubeChip,
      wires: { write: writeLbl, status: statusLbl, gate: gateLbl },
      packetLayer,
    };
  }

  reset() { this.build(); }
}

function setChips(s, { va, att, kube }) {
  setVal(s.refs.vaChip, va);
  setVal(s.refs.attChip, att);
  setVal(s.refs.kubeChip, kube);
}

function clearHL(s) {
  clearHighlights(s, ['adc', 'va', 'att', 'kube', 'cloud', 'disk', 'appBox',
    'vaChip', 'attChip', 'kubeChip'], [s.refs.appPod]);
  s.refs.disk.style.opacity = '1';
}

const STEPS = [
  {
    id: 'idle',
    duration: 1500,
    narration: 'A Pod is scheduled to node-a and needs the disk vol-1. Before kubelet can mount anything, the disk has to be physically attached to that node, and Kubernetes tracks that fact in its own object. Right now no such object exists.',
    enter(s) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setChips(s, { va: 'none', att: 'none', kube: 'blocked' });
      setBoxSublabel(s.refs.va, 'not created yet');
      s.refs.appPod.style.opacity = '0.5';
    },
  },
  {
    id: 'decide',
    duration: 2200,
    // The Pod is the reason attach is needed, so the Pod pulses. No block flash on a Pod step.
    narration: 'It is not kubelet that decides a volume needs attaching. The attach and detach controller runs inside kube-controller-manager, sees a Pod bound to a node with a volume that is not attached there, and takes ownership of making it happen.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setChips(s, { va: 'none', att: 'none', kube: 'blocked' });
      setBoxSublabel(s.refs.va, 'not created yet');
      s.refs.appPod.style.opacity = '0.5';
      s.refs.adc.classList.add('highlight');
      if (ctx.reduced) return;
      pulsePodDim(s.refs.appPod, ctx, 0, { from: 0.5, peak: 0.8 });
    },
  },
  {
    id: 'write',
    duration: 2800,
    narration: 'The controller writes a VolumeAttachment object. It names the volume and the node, and it starts with status.attached set to false. This object is now the single cluster record that vol-1 is meant to live on node-a. Nothing physical has happened yet.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setChips(s, { va: 'attached: false', att: 'none', kube: 'blocked' });
      setBoxSublabel(s.refs.va, 'node: node-a, attached: false');
      s.refs.appPod.style.opacity = '0.5';
      s.refs.adc.classList.add('highlight');
      setWire(s, 'write', 'create');
      if (ctx.reduced) { s.refs.va.classList.add('highlight'); return; }
      const w = routePacket(s, ctx, W_WRITE_VA, { cat: 'storage' });
      ridingLabel(s, ctx, 'vol-1 -> node-a', W_WRITE_VA);
      lightBoxAt(s.refs.va, ctx, w.arrivalMs);
    },
  },
  {
    id: 'attach',
    duration: 3400,
    narration: 'The external-attacher sidecar watches VolumeAttachment objects. It picks this one up and calls ControllerPublishVolume on the driver, which asks the cloud to attach vol-1 to node-a. This is the step where the disk actually arrives on the node.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setChips(s, { va: 'attached: false', att: 'attaching', kube: 'blocked' });
      setBoxSublabel(s.refs.va, 'node: node-a, attached: false');
      s.refs.appPod.style.opacity = '0.5';
      s.refs.va.classList.add('highlight');
      if (ctx.reduced) { s.refs.att.classList.add('highlight'); s.refs.cloud.classList.add('highlight'); s.refs.disk.classList.add('highlight'); return; }
      const watch = routePacket(s, ctx, W_WATCH_VA, { cat: 'storage' });
      lightBoxAt(s.refs.att, ctx, watch.arrivalMs);
      const call = routePacket(s, ctx, W_ATTACH_CLOUD, { delay: watch.arrivalMs + BEAT.afterHop, cat: 'storage' });
      ridingLabel(s, ctx, 'ControllerPublish', W_ATTACH_CLOUD, { delay: watch.arrivalMs + BEAT.afterHop });
      lightBoxAt(s.refs.cloud, ctx, call.arrivalMs);
      const disk = routePacket(s, ctx, W_CLOUD_DISK, { delay: call.arrivalMs + BEAT.afterHop, cat: 'storage' });
      lightBoxAt(s.refs.disk, ctx, disk.arrivalMs);
    },
  },
  {
    id: 'status',
    duration: 2800,
    narration: 'When the cloud confirms the attach, the attacher writes status.attached true back onto the same VolumeAttachment. That one field is the signal everything downstream waits for. The object did not move, its status changed.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setChips(s, { va: 'attached: true', att: 'attached to node-a', kube: 'blocked' });
      setBoxSublabel(s.refs.va, 'node: node-a, attached: true');
      s.refs.appPod.style.opacity = '0.5';
      s.refs.att.classList.add('highlight');
      s.refs.cloud.classList.add('highlight');
      s.refs.disk.classList.add('highlight');
      setWire(s, 'status', 'attached: true');
      if (ctx.reduced) { s.refs.va.classList.add('highlight'); return; }
      const st = routePacket(s, ctx, W_STATUS, { cat: 'storage' });
      lightBoxAt(s.refs.va, ctx, st.arrivalMs);
    },
  },
  {
    id: 'mount',
    duration: 3400,
    narration: 'Kubelet has been blocked this whole time, watching that one field. The moment status.attached reads true it stops waiting, mounts the disk into the Pod, and the Pod starts. The VolumeAttachment gated the mount, and it is the object, not the Pod, that records the disk is on the node.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setChips(s, { va: 'attached: true', att: 'attached to node-a', kube: 'mounting' });
      setBoxSublabel(s.refs.va, 'node: node-a, attached: true');
      s.refs.va.classList.add('highlight');
      s.refs.disk.classList.add('highlight');
      setWire(s, 'gate', 'attached: true');
      s.refs.appPod.style.opacity = '1';
      if (ctx.reduced) { s.refs.kube.classList.add('highlight'); s.refs.appBox.classList.add('highlight'); return; }
      const gate = routePacket(s, ctx, W_GATE, { cat: 'storage' });
      lightBoxAt(s.refs.kube, ctx, gate.arrivalMs);
      const mount = routePacket(s, ctx, W_MOUNT, { delay: gate.arrivalMs + BEAT.afterHop, cat: 'storage' });
      ridingLabel(s, ctx, 'mount /data', W_MOUNT, { delay: gate.arrivalMs + BEAT.afterHop });
      s.refs.appPod.style.opacity = '0.5';
      ctx.register(s.refs.appPod.animate([{ opacity: 0.5 }, { opacity: 1 }], { duration: 500, delay: mount.arrivalMs, fill: 'forwards', easing: 'ease-out' }));
      pulsePod(s.refs.appPod, ctx, mount.arrivalMs);
      lightBoxAt(s.refs.appBox, ctx, mount.arrivalMs);
    },
  },
  {
    id: 'detach',
    duration: 3400,
    narration: 'Because the object is the record, deleting it is what tears the attach down. When the Pod is gone the controller removes the VolumeAttachment, the attacher sees it disappear, calls ControllerUnpublishVolume, and the cloud detaches vol-1 from node-a. No object, no attach.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setChips(s, { va: 'deleted', att: 'detaching', kube: 'released' });
      setBoxSublabel(s.refs.va, 'deletion -> detach');
      s.refs.appPod.style.opacity = '0.5';
      s.refs.va.classList.add('highlight');
      // The disk ends this step detached from the node.
      s.refs.disk.style.opacity = DIM;
      if (ctx.reduced) { s.refs.att.classList.add('highlight'); return; }
      s.refs.disk.style.opacity = '1';
      const watch = routePacket(s, ctx, W_WATCH_VA, { cat: 'storage' });
      ridingLabel(s, ctx, 'va deleted', W_WATCH_VA);
      lightBoxAt(s.refs.att, ctx, watch.arrivalMs);
      const call = routePacket(s, ctx, W_ATTACH_CLOUD, { delay: watch.arrivalMs + BEAT.afterHop, cat: 'storage' });
      ridingLabel(s, ctx, 'ControllerUnpublish', W_ATTACH_CLOUD, { delay: watch.arrivalMs + BEAT.afterHop });
      lightBoxAt(s.refs.cloud, ctx, call.arrivalMs);
      const disk = routePacket(s, ctx, W_CLOUD_DISK, { delay: call.arrivalMs + BEAT.afterHop, cat: 'storage' });
      dimBoxAt(s.refs.disk, ctx, disk.arrivalMs);
    },
  },
];

export const init = makeInit(Scene, STEPS, { posterFirst: true });
