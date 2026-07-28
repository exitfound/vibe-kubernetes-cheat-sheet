import { svg, g, text } from '../lib/svg.js';
import { arrowDefs, box, pod, node, cylinder, pathArrow } from '../lib/primitives.js';
import { valChip, setVal, setBoxSublabel, pulsePod, routePacket, makeInit, clearHighlights, clearWires, setWire, BEAT, lightBoxAt, makeRidingLabel, OPACITY } from '../lib/storage-kit.js';
// Design notes for this card: scheme/docs/CARDS.md#storage-volumeattachment


const M = 60;
const CONTENT_L = M, CONTENT_R = 1200 - M;               // 60 / 1140
const CX = (CONTENT_L + CONTENT_R) / 2;                  // 600, the canvas centre by construction

// Every solid block on the card is ONE size, storage-csi-architecture's.
const BOX_W = 232, BOX_H = 76;

const LEFT_X = 400;
const NODE_W = 300;
const COL_L_X = LEFT_X;                                  // 400..700, the node frame
const COL_L_CX = COL_L_X + NODE_W / 2;                   // 550
const COL_R_X = CONTENT_R - BOX_W;                       // 908..1140, the control-plane column
const COL_R_CX = COL_R_X + BOX_W / 2;                    // 1024
const CORRIDOR_X = (COL_L_X + NODE_W + COL_R_X) / 2;     // 804: the one lane that crosses the columns

const NODE_Y = 24, NODE_H = 396;                         // 24..420
const POD_W = 226, POD_H = 110;
const POD_X = COL_L_CX - POD_W / 2;                      // 437
const POD_Y = 64;
const POD_BOTTOM = POD_Y + POD_H;                        // 174
const POD_PAD = 24, POD_INNER_Y = 40, POD_INNER_H = 46;  // the App box, same insets as attach-mount
const KUBE_W = POD_W, KUBE_H = BOX_H;
const KUBE_X = COL_L_CX - KUBE_W / 2;                    // 437, flush with the Pod above it
const KUBE_Y = 324;
const KUBE_TOP = KUBE_Y, KUBE_BOTTOM = KUBE_Y + KUBE_H;  // 324 / 400, 20 clear of the frame bottom
const KUBE_RIGHT = KUBE_X + KUBE_W;                      // 663
const KUBE_CY = KUBE_Y + KUBE_H / 2;                     // 362

const ROWS = 3;
const ROW_GAP = (NODE_H - ROWS * BOX_H) / (ROWS - 1);    // 84
const ROW_Y = i => NODE_Y + i * (BOX_H + ROW_GAP);       // 24 / 184 / 344
const ADC_Y = ROW_Y(0);
const ADC_BOTTOM = ADC_Y + BOX_H;                        // 100
const VA_Y = ROW_Y(1);
const VA_TOP = VA_Y, VA_BOTTOM = VA_Y + BOX_H;           // 184 / 260
const VA_CY = VA_Y + BOX_H / 2;                          // 222
const ATT_Y = ROW_Y(2);
const ATT_TOP = ATT_Y, ATT_BOTTOM = ATT_Y + BOX_H;       // 420, level with the node frame bottom

const DISK_W = 200, DISK_H = 114;
const DISK_X = 130;
const DISK_Y = 400;
const DISK_TOP = DISK_Y, DISK_BOTTOM = DISK_Y + DISK_H;  // 400 / 514
const DISK_CX = DISK_X + DISK_W / 2;                     // 230
const DISK_RIGHT = DISK_X + DISK_W;                      // 330
const DISK_CY = DISK_Y + DISK_H / 2;                     // 457
const DISK_LBL_Y = DISK_TOP - 14;                        // 386

const CHIPS_Y = 592, CHIP_H = 34;                        // 592..626, 14 clear of the viewBox
const CHIP_GAP = 16, CHIP_COUNT = 4;
// The strip spans the card's own margins, so it centres on CX by construction. Hanging its left end
// on DISK_X instead put the strip at 130..1140, whose centre is 635.
const CHIPS_L = CONTENT_L, CHIPS_R = CONTENT_R;          // 60 / 1140
const CHIPS_W = CHIPS_R - CHIPS_L;                                      // 1080
const CHIP_W = (CHIPS_W - CHIP_GAP * (CHIP_COUNT - 1)) / CHIP_COUNT;    // 258
const CHIP_X = Array.from({ length: CHIP_COUNT }, (_, i) =>
  CHIPS_L + i * (CHIP_W + CHIP_GAP));                    // 60 / 334 / 608 / 882, last ends 1140

const LANE = 40;
const W_WRITE   = [[COL_R_CX, ADC_BOTTOM], [COL_R_CX, VA_TOP]];              // controller creates it
const W_WATCH   = [[COL_R_CX - LANE, VA_BOTTOM], [COL_R_CX - LANE, ATT_TOP]];// attacher reads it
const W_STATUS  = [[COL_R_CX + LANE, ATT_TOP], [COL_R_CX + LANE, VA_BOTTOM]];// attacher writes back
const PUBLISH_JOG_Y = DISK_BOTTOM + 32;                  // 546
const W_PUBLISH = [[COL_R_CX, ATT_BOTTOM], [COL_R_CX, PUBLISH_JOG_Y], [DISK_CX, PUBLISH_JOG_Y], [DISK_CX, DISK_BOTTOM]];
// The result surfacing on the node leaves the disk's right face and climbs into kubelet from below,
// so the two lanes touching the disk use different faces and their riding tags never share a strip.
const W_ONNODE  = [[DISK_RIGHT, DISK_CY], [COL_L_CX, DISK_CY], [COL_L_CX, KUBE_BOTTOM]];
const W_GATE    = [[COL_R_X, VA_CY], [CORRIDOR_X, VA_CY], [CORRIDOR_X, KUBE_CY], [KUBE_RIGHT, KUBE_CY]];
const W_MOUNT   = [[COL_L_CX, KUBE_TOP], [COL_L_CX, POD_BOTTOM]];

// How long a born-mid-story construction takes to materialise, and how long it takes to leave. It runs
// before the ball is sent (BEAT.lead is 800), so nothing is ever aimed at a block that is not there.
const LAND_MS = 500;

function fadeTo(el, ctx, from, to, delay = 0, dur = LAND_MS) {
  if (!el) return;
  if (ctx.reduced) { el.style.opacity = String(to); return; }
  el.style.opacity = String(from);
  ctx.register(el.animate([{ opacity: from }, { opacity: to }], { duration: dur, delay, fill: 'forwards', easing: 'ease-out' }));
}

// The tag that rides a ball on this card. Constants preserved from its hand-rolled copy.
const ridingLabel = makeRidingLabel({ role: 'storage' });

function podBlock() {
  const shell = pod({ x: POD_X, y: POD_Y, w: POD_W, h: POD_H, label: 'Pod web-0', sublabel: 'needs vol-1', containers: 0, role: 'storage' });
  const shellRect = shell.querySelector('.scheme-pod-rect');
  if (shellRect) shellRect.style.fill = 'rgba(255, 255, 255, 0.03)';
  const innerBox = box({ x: POD_X + POD_PAD, y: POD_Y + POD_INNER_Y, w: POD_W - POD_PAD * 2, h: POD_INNER_H, label: 'app', sublabel: 'wants /data', role: 'storage' });
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
      'aria-label': 'The VolumeAttachment object. The attach and detach controller inside kube-controller-manager, not Kubelet, decides a volume must be attached to a Node and writes a VolumeAttachment naming the volume and the Node with status.attached false. The external-attacher watches those objects, calls ControllerPublishVolume on the driver, and on success writes status.attached true back onto the same object. Kubelet is blocked on that one field and mounts only once it reads true. Because the object, not the Pod, is the cluster record of the attach, deleting it is what triggers ControllerUnpublishVolume and the detach.',
      'data-style': 'outline',
    });
    root.appendChild(arrowDefs());

    const nodeBox = node({ x: COL_L_X, y: NODE_Y, w: NODE_W, h: NODE_H, label: 'Node-1' });
    const appPod = podBlock();
    const kube = box({ x: KUBE_X, y: KUBE_Y, w: KUBE_W, h: KUBE_H, label: 'Kubelet', sublabel: 'gated on attach', role: 'storage' });

    const adc = box({ x: COL_R_X, y: ADC_Y, w: BOX_W, h: BOX_H, label: 'Attach/Detach controller', sublabel: 'kube-controller-manager', role: 'storage' });
    const va  = box({ x: COL_R_X, y: VA_Y,  w: BOX_W, h: BOX_H, label: 'VolumeAttachment va-7f', sublabel: 'not created yet', role: 'storage' });
    const att = box({ x: COL_R_X, y: ATT_Y, w: BOX_W, h: BOX_H, label: 'External-attacher', sublabel: 'watches VolumeAttachment', role: 'storage' });

    const disk = cylinder({ x: DISK_X, y: DISK_Y, w: DISK_W, h: DISK_H, label: 'vol-1', role: 'storage' });
    const diskLabel = disk.querySelector('.scheme-cylinder-label');
    if (diskLabel) diskLabel.setAttribute('y', DISK_H / 2 + 10);

    const mkWire = points => pathArrow({ points, dashed: true, dim: true, role: 'storage' });
    const wWrite = mkWire(W_WRITE), wWatch = mkWire(W_WATCH);
    const wStatus = mkWire(W_STATUS), wGate = mkWire(W_GATE);
    // Lanes between blocks that stand for the whole card, so they are always drawn.
    const wPublish = mkWire(W_PUBLISH), wOnNode = mkWire(W_ONNODE);
    const wMount = mkWire(W_MOUNT);
    const vaLanes = [wWrite, wWatch, wStatus, wGate];
    const wires = [...vaLanes, wPublish, wOnNode, wMount];

    va.style.opacity = String(OPACITY.pending);
    vaLanes.forEach(el => { el.style.opacity = '0'; });

    const writeLbl = text({ class: 'scheme-label code dim', x: COL_R_CX + 12, y: (ADC_BOTTOM + VA_TOP) / 2 + 4, 'text-anchor': 'start' }, [' ']);
    const diskLbl  = text({ class: 'scheme-label code dim', x: DISK_CX, y: DISK_LBL_Y, 'text-anchor': 'middle' }, [' ']);

    const vaChip   = valChip({ x: CHIP_X[0], y: CHIPS_Y, w: CHIP_W, h: CHIP_H, name: 'VolumeAttachment', value: 'none',      role: 'storage' });
    const attrChip = valChip({ x: CHIP_X[1], y: CHIPS_Y, w: CHIP_W, h: CHIP_H, name: 'status.attached', value: 'no object', role: 'storage' });
    const diskChip = valChip({ x: CHIP_X[2], y: CHIPS_Y, w: CHIP_W, h: CHIP_H, name: 'disk on node-1',  value: 'no',        role: 'storage' });
    const kubeChip = valChip({ x: CHIP_X[3], y: CHIPS_Y, w: CHIP_W, h: CHIP_H, name: 'kubelet',         value: 'blocked',   role: 'storage' });

    const packetLayer = g({ id: 'packetLayer' });

    [nodeBox, adc, va, att, disk, appPod.group, kube].forEach(el => root.appendChild(el));
    wires.forEach(el => root.appendChild(el));
    [writeLbl, diskLbl].forEach(el => root.appendChild(el));
    [vaChip, attrChip, diskChip, kubeChip].forEach(c => root.appendChild(c));
    root.appendChild(packetLayer);

    this.host.appendChild(root);
    this.refs = {
      svg: root,
      appPod: appPod.group, appBox: appPod.innerBox,
      kube, adc, va, att, disk, vaLanes, mountLane: wMount,
      vaChip, attrChip, diskChip, kubeChip,
      wires: { write: writeLbl, disk: diskLbl },
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
function setChips(s, { va, attached, disk, kubelet }) {
  setChip(s.refs.vaChip, va);
  setChip(s.refs.attrChip, attached);
  setChip(s.refs.diskChip, disk);
  setChip(s.refs.kubeChip, kubelet);
}

function setBorn(s, { object = OPACITY.pending, lanes = 0, pod = 1 } = {}) {
  s.refs.va.style.opacity = String(object);
  s.refs.vaLanes.forEach(w => { w.style.opacity = String(lanes); });
  s.refs.appPod.style.opacity = String(pod);
  s.refs.mountLane.style.opacity = String(pod);
}

function clearHL(s) {
  clearHighlights(s, ['adc', 'va', 'att', 'kube', 'disk', 'appBox',
    'vaChip', 'attrChip', 'diskChip', 'kubeChip'], [s.refs.appPod]);
  s.refs.disk.style.opacity = '1';
}

const STEPS = [
  {
    id: 'idle',
    duration: 1500,
    narration: 'Pod web-0 is scheduled onto Node-1 and needs the disk vol-1. Before Kubelet can mount anything the disk has to be attached to that Node, and Kubernetes keeps that fact in an object of its own. Right now no such object exists, so Kubelet is going nowhere.',
    enter(s) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setChips(s, { va: 'none', attached: 'no object', disk: 'no', kubelet: 'blocked' });
      setBoxSublabel(s.refs.va, 'not created yet');
      setWire(s, 'disk', 'not attached to any node');
      // The Pod is scheduled and waiting, which the narration states outright, so it is present at
      // full strength. Only the object is missing, and it is genuinely absent rather than greyed out.
      setBorn(s, { object: OPACITY.pending, lanes: 0, pod: 1 });
    },
  },
  {
    id: 'decide',
    duration: 2200,
    narration: 'It is not Kubelet that decides a volume needs attaching. The attach and detach controller runs inside kube-controller-manager, sees a Pod bound to a Node with a volume that is not attached there, and takes ownership of making it happen.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setChips(s, { va: 'none', attached: 'no object', disk: 'no', kubelet: 'blocked' });
      setBoxSublabel(s.refs.va, 'not created yet');
      setWire(s, 'disk', 'not attached to any node');
      setBorn(s, { object: OPACITY.pending, lanes: 0, pod: 1 });
      s.refs.adc.classList.add('highlight');
    },
  },
  {
    id: 'write',
    duration: 2600,
    narration: 'The controller writes a VolumeAttachment. It names the volume and the Node, and it starts with status.attached set to false. This object is now the single cluster record that vol-1 is meant to live on Node-1. Nothing physical has happened yet.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setChips(s, { va: 'va-7f', attached: 'false', disk: 'no', kubelet: 'blocked' });
      setBoxSublabel(s.refs.va, 'node-1, attached: false');
      setWire(s, 'write', 'create');
      setWire(s, 'disk', 'not attached to any node');
      // The object exists by the END of this step, so visible is the static end-state.
      setBorn(s, { object: 1, lanes: 1, pod: 1 });
      s.refs.adc.classList.add('highlight');
      if (ctx.reduced) { s.refs.va.classList.add('highlight'); return; }
      // The object and all four of its lanes materialise as ONE construction, and finish before the
      // write is sent (LAND_MS 500 against BEAT.lead 800), so no arrowhead is ever aimed at nothing.
      fadeTo(s.refs.va, ctx, OPACITY.pending, 1);
      s.refs.vaLanes.forEach(w => fadeTo(w, ctx, 0, 1));
      const w = routePacket(s, ctx, W_WRITE, { delay: BEAT.lead, role: 'storage' });
      ridingLabel(s, ctx, 'vol-1 on node-1', W_WRITE, { delay: BEAT.lead });
      lightBoxAt(s.refs.va, ctx, w.arrivalMs);
    },
  },
  {
    id: 'attach',
    duration: 4800,
    narration: 'The external-attacher watches VolumeAttachment objects. It picks this one up and calls ControllerPublishVolume on the driver, and that call is what gets vol-1 attached to Node-1 in the storage backend. The device is physically on the Node now, and Kubelet still will not touch it, because the object still says false.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      // The chip strip is the whole point of this step: the disk IS on node-1 and status.attached is
      // STILL false. Reading those two chips side by side is the card in one line.
      setChips(s, { va: 'va-7f', attached: 'false', disk: 'yes', kubelet: 'blocked' });
      setBoxSublabel(s.refs.va, 'node-1, attached: false');
      setWire(s, 'disk', 'attached to node-1');
      setBorn(s, { object: 1, lanes: 1, pod: 1 });
      s.refs.va.classList.add('highlight');
      if (ctx.reduced) { s.refs.att.classList.add('highlight'); s.refs.disk.classList.add('highlight'); s.refs.kube.classList.add('highlight'); return; }
      const watch = routePacket(s, ctx, W_WATCH, { role: 'storage' });
      lightBoxAt(s.refs.att, ctx, watch.arrivalMs);
      const call = routePacket(s, ctx, W_PUBLISH, { delay: watch.arrivalMs + BEAT.afterHop, role: 'storage' });
      ridingLabel(s, ctx, 'ControllerPublish', W_PUBLISH, { delay: watch.arrivalMs + BEAT.afterHop });
      lightBoxAt(s.refs.disk, ctx, call.arrivalMs);
      const land = routePacket(s, ctx, W_ONNODE, { delay: call.arrivalMs + BEAT.afterHop, role: 'storage' });
      ridingLabel(s, ctx, 'vol-1 on node-1', W_ONNODE, { delay: call.arrivalMs + BEAT.afterHop });
      lightBoxAt(s.refs.kube, ctx, land.arrivalMs);
    },
  },
  {
    id: 'status',
    duration: 2600,
    narration: 'When the backend confirms the attach, the attacher writes status.attached true back onto the same VolumeAttachment. That one field is the signal everything downstream waits for. The object did not move and nothing was recreated, one field changed.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setChips(s, { va: 'va-7f', attached: 'true', disk: 'yes', kubelet: 'blocked' });
      setBoxSublabel(s.refs.va, 'node-1, attached: true');
      setWire(s, 'disk', 'attached to node-1');
      setBorn(s, { object: 1, lanes: 1, pod: 1 });
      s.refs.att.classList.add('highlight');
      s.refs.disk.classList.add('highlight');
      if (ctx.reduced) { s.refs.va.classList.add('highlight'); return; }
      // The status write goes up its OWN lane, offset LANE the other side of the column centre from
      // the watch it answers, so it never reads as the watch bouncing back.
      const st = routePacket(s, ctx, W_STATUS, { role: 'storage' });
      ridingLabel(s, ctx, 'attached: true', W_STATUS);
      lightBoxAt(s.refs.va, ctx, st.arrivalMs);
    },
  },
  {
    id: 'mount',
    duration: 3200,
    narration: 'Kubelet has been blocked this whole time, watching that one field. The moment status.attached reads true it stops waiting, mounts the disk into the Pod at /data, and the Pod starts. The VolumeAttachment gated the mount.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setChips(s, { va: 'va-7f', attached: 'true', disk: 'yes', kubelet: 'mounted' });
      setBoxSublabel(s.refs.va, 'node-1, attached: true');
      setWire(s, 'disk', 'attached to node-1, mounted at /data');
      setBorn(s, { object: 1, lanes: 1, pod: 1 });
      s.refs.va.classList.add('highlight');
      s.refs.disk.classList.add('highlight');
      s.refs.kube.classList.add('highlight');
      if (ctx.reduced) return;
      const gate = routePacket(s, ctx, W_GATE, { role: 'storage' });
      ridingLabel(s, ctx, 'attached: true', W_GATE);
      lightBoxAt(s.refs.kube, ctx, gate.arrivalMs);
      const mount = routePacket(s, ctx, W_MOUNT, { delay: gate.arrivalMs + BEAT.afterHop, role: 'storage' });
      ridingLabel(s, ctx, 'mount /data', W_MOUNT, { delay: gate.arrivalMs + BEAT.afterHop });
      pulsePod(s.refs.appPod, ctx, mount.arrivalMs);
    },
  },
  {
    id: 'detach',
    duration: 4600,
    narration: 'Because the object is the record, deleting it is what tears the attach down. Once the Pod is gone the controller deletes the VolumeAttachment, the attacher sees the deletion mark, calls ControllerUnpublishVolume, and only when the backend has detached vol-1 from Node-1 does the object finally go. No object, no attach.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setChips(s, { va: 'deleted', attached: 'gone', disk: 'no', kubelet: 'released' });
      setBoxSublabel(s.refs.va, 'deleted after detach');
      setWire(s, 'disk', 'detached from node-1');
      setBorn(s, { object: OPACITY.terminated, lanes: 0, pod: 0 });
      s.refs.disk.style.opacity = String(OPACITY.notready);
      if (ctx.reduced) { s.refs.att.classList.add('highlight'); return; }
      setBorn(s, { object: 1, lanes: 1, pod: 1 });
      s.refs.disk.style.opacity = '1';
      s.refs.va.classList.add('highlight');
      fadeTo(s.refs.appPod, ctx, 1, 0);
      fadeTo(s.refs.mountLane, ctx, 1, 0);
      const watch = routePacket(s, ctx, W_WATCH, { delay: BEAT.lead, role: 'storage' });
      ridingLabel(s, ctx, 'va-7f deleted', W_WATCH, { delay: BEAT.lead });
      lightBoxAt(s.refs.att, ctx, watch.arrivalMs);
      // The deletion mark, not the deletion: the attacher sees deletionTimestamp and the object
      // drops to the terminating shade, still holding its finalizer.
      fadeTo(s.refs.va, ctx, 1, OPACITY.terminating, watch.arrivalMs);
      const call = routePacket(s, ctx, W_PUBLISH, { delay: watch.arrivalMs + BEAT.afterHop, role: 'storage' });
      ridingLabel(s, ctx, 'ControllerUnpublish', W_PUBLISH, { delay: watch.arrivalMs + BEAT.afterHop });
      fadeTo(s.refs.disk, ctx, 1, OPACITY.notready, call.arrivalMs, 400);
      // Only once the backend has detached does the object itself go, and its lanes with it. Not
      // fadeTo here: that helper pins its `from` inline, which would drop the object to the
      // terminating shade at step entry instead of at the watch.
      ctx.register(s.refs.va.animate(
        [{ opacity: OPACITY.terminating }, { opacity: OPACITY.terminated }],
        { duration: LAND_MS, delay: call.arrivalMs, fill: 'forwards', easing: 'ease-out' }));
      s.refs.vaLanes.forEach(w => fadeTo(w, ctx, 1, 0, call.arrivalMs));
    },
  },
];

export const init = makeInit(Scene, STEPS, { posterFirst: true });
