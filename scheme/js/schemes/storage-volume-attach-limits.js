import { svg, g, rect } from '../lib/svg.js';
import { arrowDefs, box, pod, node, pathArrow } from '../lib/primitives.js';
// Design notes for this card: scheme/docs/CARDS.md#storage-volume-attach-limits

import {
  valChip, setVal, setBoxLabel, setBoxSublabel, setPodSublabel, pulsePod,
  routePacket, routeDur,
  makeInit, clearHighlights, clearWires, BEAT, FADE, lightBoxAt, makeRidingLabel} from '../lib/storage-kit.js';

const LEFT_X = 400;
const CONTENT_W = 400;
const CONTENT_CX = LEFT_X + CONTENT_W / 2;               // 600

// ---- Vertical stack, chained off one origin so the whole card centres by moving one number ----
const POD_H = 110, SCHED_H = 60, CSI_H = 56, NODE_H = 150, CHIP_H = 32;
const G_POD_SCHED = 54, G_SCHED_CSI = 50, G_CSI_NODE = 48, G_NODE_CHIPS = 24;

const STACK_H = POD_H + G_POD_SCHED + SCHED_H + G_SCHED_CSI + CSI_H + G_CSI_NODE + NODE_H + G_NODE_CHIPS + CHIP_H;
const STACK_TOP = (640 - STACK_H) / 2;                   // 32, and the bottom margin matches it

// 226x110 is the storage family Pod, set by storage-csi-attach-mount and kept here so a Pod is the
// same object across the row.
const POD_W = 226;
const POD_X = CONTENT_CX - POD_W / 2;                    // 487
const POD_Y = STACK_TOP;                                 // 32
const POD_BOTTOM = POD_Y + POD_H;                        // 142

const PVC_DY = 34, PVC_H = 46;

// Matched to CSI_W (280) so the Scheduler and the CSINode box below it read as one column. The
// sublabel 'NodeVolumeLimits filter' measures about 250 units, so 280 still leaves ~30 units of air.
const SCHED_W = 280;
const SCHED_X = CONTENT_CX - SCHED_W / 2;                // 460, aligned with CSI_X
const SCHED_Y = POD_BOTTOM + G_POD_SCHED;                // 198
const SCHED_BOTTOM = SCHED_Y + SCHED_H;                  // 258

const CSI_W = 280;
const CSI_X = CONTENT_CX - CSI_W / 2;                    // 460..740
const CSI_Y = SCHED_BOTTOM + G_SCHED_CSI;                // 302
const CSI_TOP = CSI_Y, CSI_BOTTOM = CSI_Y + CSI_H;       // 302 / 358
const CSI_MID_Y = CSI_Y + CSI_H / 2;                     // 330, where the two side entries land
const CSI_LEFT = CSI_X, CSI_RIGHT = CSI_X + CSI_W;       // 460 / 740

const NODE_W = 220, NODE_GAP = 30;
const NODES_W = NODE_W * 3 + NODE_GAP * 2;               // 720
const NODES_X0 = CONTENT_CX - NODES_W / 2;               // 240
const NODE_Y = CSI_BOTTOM + G_CSI_NODE;                  // 406
const NODE_X = [0, 1, 2].map(i => NODES_X0 + i * (NODE_W + NODE_GAP)); // 240 / 490 / 740
const NODE_CX = NODE_X.map(x => x + NODE_W / 2);         // 350 / 600 / 850, centred on 600

const LANE_X = NODE_CX;                                  // 350 / 600 / 850

const SLOT_N = 8, SLOT_COLS = 4, SLOT_W = 26, SLOT_HGT = 26, SLOT_GAP = 10;
const SLOT_ROW_W = SLOT_COLS * SLOT_W + (SLOT_COLS - 1) * SLOT_GAP;    // 134
const SLOT_X0 = (NODE_W - SLOT_ROW_W) / 2;               // 43
const SLOT_Y0 = 38;                                      // two rows, 38..64 and 74..100
const CNT_X = 24, CNT_Y = 110, CNT_W = NODE_W - 48, CNT_H = 30;        // 172 wide, bottom 140, 10 clear

const CHIP_W = 232, CHIP_GAP = 16, CHIP_COUNT = 4;
const CHIPS_W = CHIP_W * CHIP_COUNT + CHIP_GAP * (CHIP_COUNT - 1);     // 976
const CHIPS_Y = NODE_Y + NODE_H + G_NODE_CHIPS;          // 572
const CHIP_X = Array.from({ length: CHIP_COUNT }, (_, i) =>
  CONTENT_CX - CHIPS_W / 2 + i * (CHIP_W + CHIP_GAP));   // 112..1088

const LANE_DX = 40;
const W_POD_SCHED = [[CONTENT_CX - LANE_DX, POD_BOTTOM], [CONTENT_CX - LANE_DX, SCHED_Y]];
const W_SCHED_POD = [[CONTENT_CX + LANE_DX, SCHED_Y], [CONTENT_CX + LANE_DX, POD_BOTTOM]];

const W_SCHED_CSI = [[CONTENT_CX, SCHED_BOTTOM], [CONTENT_CX, CSI_TOP]];

const W_NODE_CSI = [
  [[LANE_X[0], NODE_Y], [LANE_X[0], CSI_MID_Y], [CSI_LEFT, CSI_MID_Y]],
  [[LANE_X[1], NODE_Y], [LANE_X[1], CSI_BOTTOM]],
  [[LANE_X[2], NODE_Y], [LANE_X[2], CSI_MID_Y], [CSI_RIGHT, CSI_MID_Y]],
];

const REPORT_DUR = Math.max(...W_NODE_CSI.map(routeDur));

const SLOT_FILL = Object.freeze({
  free: 'rgba(255, 255, 255, 0.04)',
  used: 'rgba(94, 202, 148, 0.30)',
  fresh: 'rgba(94, 202, 148, 0.62)',
});
const SLOT_STROKE = 'rgba(94, 202, 148, 0.35)';

// The tag that rides a ball on this card. Constants preserved from its hand-rolled copy.
const ridingLabel = makeRidingLabel({ role: 'storage' });

function podBlock() {
  const shell = pod({
    x: POD_X, y: POD_Y, w: POD_W, h: POD_H,
    label: 'Pod web-0', sublabel: 'not created', containers: 0, role: 'storage',
  });
  const shellRect = shell.querySelector('.scheme-pod-rect');
  if (shellRect) shellRect.style.fill = 'rgba(255, 255, 255, 0.03)';
  const innerBox = box({
    x: POD_X + 16, y: POD_Y + PVC_DY, w: POD_W - 32, h: PVC_H,
    label: 'PVC data-web-0', sublabel: 'needs one slot', role: 'storage',
  });
  const group = g({});
  group.appendChild(shell);
  group.appendChild(innerBox);
  return { group, innerBox };
}

function nodeBlock({ x, label }) {
  const frame = node({ x, y: NODE_Y, w: NODE_W, h: NODE_H, label });
  const cap = frame.querySelector('.scheme-node-label');
  if (cap) cap.setAttribute('y', 14);

  const slots = [];
  for (let i = 0; i < SLOT_N; i++) {
    const col = i % SLOT_COLS, row = Math.floor(i / SLOT_COLS);
    const r = rect({
      x: SLOT_X0 + col * (SLOT_W + SLOT_GAP),
      y: SLOT_Y0 + row * (SLOT_HGT + SLOT_GAP),
      width: SLOT_W, height: SLOT_HGT, rx: 3,
    });
    r.style.stroke = SLOT_STROKE;
    r.style.strokeWidth = '1';
    r.style.fill = SLOT_FILL.free;
    frame.appendChild(r);
    slots.push(r);
  }

  const counter = box({ x: x + CNT_X, y: NODE_Y + CNT_Y, w: CNT_W, h: CNT_H, label: '0 of 8', role: 'storage' });
  return { frame, slots, counter };
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
      'aria-label': 'Node volume attach limits. Every Node has a hard ceiling on how many volumes one CSI driver may have attached to it at once. The CSI node plugin answers NodeGetInfo with max_volumes_per_node, Kubelet writes that number into the Node CSINode object as allocatable.count, and the scheduler filter NodeVolumeLimits is the only thing that reads it. Here three Nodes each report a ceiling of eight, so the cluster has twenty four attachment slots. As claims are provisioned the Nodes walk up to eight of eight and the cluster runs out of slots. Pod web-0 is then created, asks for one volume, and the filter rejects every Node, so the Pod sits in Pending reporting that the Nodes exceed max volume count even though every Node has spare CPU and spare memory. The count covers the volumes of Pods assigned to a Node plus every VolumeAttachment still live on it, so a slot is freed only when a detach completes and its VolumeAttachment is deleted, not when a Pod dies. The Pod schedules on the next attempt after one detach finishes on Node-3. The levers are fewer volumes per Pod, more Nodes, or a Node pool whose instance type reports a higher ceiling.',
      'data-style': 'outline',
    });
    root.appendChild(arrowDefs());

    const podNew = podBlock();

    const sched = box({
      x: SCHED_X, y: SCHED_Y, w: SCHED_W, h: SCHED_H,
      label: 'Scheduler', sublabel: 'NodeVolumeLimits filter', role: 'storage',
    });

    const csinode = box({
      x: CSI_X, y: CSI_Y, w: CSI_W, h: CSI_H,
      label: 'CSINode (one per node)', sublabel: 'allocatable.count: 8', role: 'storage',
    });

    const nodes = ['node-1', 'node-2', 'node-3'].map((label, i) => nodeBlock({ x: NODE_X[i], label }));

    const wPodSched = pathArrow({ points: W_POD_SCHED, dashed: true, dim: true, role: 'storage' });
    const wSchedPod = pathArrow({ points: W_SCHED_POD, dashed: true, dim: true, role: 'storage' });
    const wSchedCsi = pathArrow({ points: W_SCHED_CSI, dashed: true, dim: true, role: 'storage' });
    const wReport = W_NODE_CSI.map(pts => pathArrow({ points: pts, dashed: true, dim: true, role: 'storage' }));

    const capChip   = valChip({ x: CHIP_X[0], y: CHIPS_Y, w: CHIP_W, h: CHIP_H, name: 'allocatable.count', value: '8 per node', role: 'storage' });
    const attChip   = valChip({ x: CHIP_X[1], y: CHIPS_Y, w: CHIP_W, h: CHIP_H, name: 'attached',          value: '4 of 24',    role: 'storage' });
    const podChip   = valChip({ x: CHIP_X[2], y: CHIPS_Y, w: CHIP_W, h: CHIP_H, name: 'Pod web-0',         value: 'not created', role: 'storage' });
    const blockChip = valChip({ x: CHIP_X[3], y: CHIPS_Y, w: CHIP_W, h: CHIP_H, name: 'blocked by',        value: 'nothing',     role: 'storage' });

    const packetLayer = g({ id: 'packetLayer' });

    nodes.forEach(n => root.appendChild(n.frame));
    nodes.forEach(n => root.appendChild(n.counter));
    [csinode, sched, podNew.group].forEach(el => root.appendChild(el));
    [wPodSched, wSchedPod, wSchedCsi, ...wReport].forEach(el => root.appendChild(el));
    [capChip, attChip, podChip, blockChip].forEach(c => root.appendChild(c));
    root.appendChild(packetLayer);

    this.host.appendChild(root);
    this.refs = {
      svg: root,
      podNew: podNew.group, podBox: podNew.innerBox,
      podShell: podNew.group.querySelector('.scheme-pod'),
      sched, csinode,
      nodes,
      cnt0: nodes[0].counter, cnt1: nodes[1].counter, cnt2: nodes[2].counter,
      wPodSched, wSchedPod, wSchedCsi, wReport,
      capChip, attChip, podChip, blockChip,
      wires: {},
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
function setChips(s, { cap = '8 per node', attached, pod: podVal, blocked }) {
  setChip(s.refs.capChip, cap);
  setChip(s.refs.attChip, attached);
  setChip(s.refs.podChip, podVal);
  setChip(s.refs.blockChip, blocked);
}

function setSlots(s, counts) {
  s.refs.nodes.forEach((n, i) => {
    const spec = counts[i];
    const used = typeof spec === 'number' ? spec : spec.used;
    const fresh = typeof spec === 'number' ? false : Boolean(spec.fresh);
    n.slots.forEach((r, j) => {
      if (j >= used) { r.style.fill = SLOT_FILL.free; return; }
      r.style.fill = (fresh && j === used - 1) ? SLOT_FILL.fresh : SLOT_FILL.used;
    });
    setBoxLabel(n.counter, used + ' of ' + SLOT_N);
  });
}

// Runs fn at a point inside the step, or at once on the static path so the end state stays right.
function at(s, ctx, delay, fn) {
  if (ctx.reduced || delay <= 0) { fn(); return; }
  const a = s.refs.svg.animate([{ opacity: 1 }, { opacity: 1 }], { duration: 1, delay });
  a.onfinish = fn;
  ctx.register(a);
}

function clearHL(s) {
  clearHighlights(s, ['sched', 'csinode', 'cnt0', 'cnt1', 'cnt2', 'podBox',
    'capChip', 'attChip', 'podChip', 'blockChip'], [s.refs.podNew]);
}

function setStage(s, {
  podOp = 0, podSub = 'not created', pvcSub = 'needs one slot',
  linkPod = 0,        // the Pod to Scheduler request lane
  linkBack = 0,       // the Scheduler to Pod answer lane
  linkRead = 0,       // the Scheduler reading allocatable.count off CSINode
} = {}) {
  s.refs.podNew.style.opacity = String(podOp);
  setPodSublabel(s.refs.podShell, podSub);
  setBoxSublabel(s.refs.podBox, pvcSub);
  s.refs.wPodSched.style.opacity = String(linkPod);
  s.refs.wSchedPod.style.opacity = String(linkBack);
  s.refs.wSchedCsi.style.opacity = String(linkRead);
}

const STEPS = [
  {
    id: 'idle',
    duration: 1500,
    enter(s) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setStage(s, {});
      setSlots(s, [2, 1, 1]);
      setChips(s, { attached: '4 of 24', pod: 'not created', blocked: 'nothing' });
    },
  },
  {
    id: 'cap',
    duration: 2800,
    narration: 'The ceiling is not a Kubernetes setting. It is reported by the CSI node plugin as max_volumes_per_node in its NodeGetInfo answer, then written by the Kubelet into the CSINode object for that Node as allocatable.count. Real drivers report anything from a handful on a small VM to a hundred and twenty seven on GCE.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setStage(s, {});
      setSlots(s, [2, 1, 1]);
      setChips(s, { attached: '4 of 24', pod: 'not created', blocked: 'nothing' });
      if (ctx.reduced) { s.refs.csinode.classList.add('highlight'); return; }
      W_NODE_CSI.forEach(pts => {
        routePacket(s, ctx, pts, { delay: BEAT.lead, dur: REPORT_DUR, role: 'storage' });
        ridingLabel(s, ctx, 'cap 8', pts, { delay: BEAT.lead, dur: REPORT_DUR });
      });
      // One arrival instant for all three, so the box lights exactly as the last of them touches it.
      lightBoxAt(s.refs.csinode, ctx, BEAT.lead + REPORT_DUR);
    },
  },
  {
    id: 'fill',
    duration: 2600,
    // Packet-less and Pod-less, and it does not need the sanctioned block flash: the slots filling IS
    // the motion, and it is the only step on the card where the gauge moves on its own.
    narration: 'Now the cluster fills. More Pods with claims are provisioned, more disks attach, and every Node walks up to its own ceiling: eight of eight on all three, twenty four of twenty four across the cluster. No alarm fires, because a Node sitting exactly at its ceiling is a healthy Node.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setStage(s, {});
      setSlots(s, [8, 8, 8]);
      setChips(s, { attached: '24 of 24', pod: 'not created', blocked: 'nothing' });
      s.refs.nodes.forEach(n => n.counter.classList.add('highlight'));
      if (ctx.reduced) return;
      // The gauge read its final 24 of 24 from step entry, while the slots it counts were still
      // filling in for another two seconds. It holds the count the previous step left and turns over
      // when the last slot lands.
      setChips(s, { attached: '4 of 24', pod: 'not created', blocked: 'nothing' });
      const prev = [2, 1, 1];
      let seq = 0;
      s.refs.nodes.forEach((n, i) => {
        for (let j = prev[i]; j < SLOT_N; j++, seq++) {
          n.slots[j].style.opacity = '0';
          ctx.register(n.slots[j].animate([{ opacity: 0 }, { opacity: 1 }],
            { duration: 220, delay: 90 * seq, fill: 'forwards', easing: 'ease-out' }));
        }
      });
      at(s, ctx, 90 * (seq - 1) + 220, () => setChips(s, { attached: '24 of 24', pod: 'not created', blocked: 'nothing' }));
    },
  },
  {
    id: 'ask',
    duration: 3000,
    narration: 'Now Pod web-0 is created and it asks for one volume of its own. Before the scheduler can score any Node it has to filter out the ones that cannot take the Pod at all, and one filter exists purely for this ceiling. It is called NodeVolumeLimits, and it skips Pods that ask for no volumes.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setStage(s, { podOp: 1, podSub: 'Pending', linkPod: 1 });
      setSlots(s, [8, 8, 8]);
      setChips(s, { attached: '24 of 24', pod: 'Pending', blocked: 'nothing' });
      if (ctx.reduced) { s.refs.sched.classList.add('highlight'); return; }
      // The Pod arriving IS the event, so it fades in first, and then takes the up-arrow ordering:
      // it blinks because it is the actor, and the request leaves once the blink has landed.
      s.refs.podNew.style.opacity = '0';
      ctx.register(s.refs.podNew.animate([{ opacity: 0 }, { opacity: 1 }], { duration: FADE.in, delay: 150, fill: 'forwards', easing: 'ease-out' }));
      pulsePod(s.refs.podNew, ctx, 250);
      const req = routePacket(s, ctx, W_POD_SCHED, { delay: 250 + BEAT.afterPulse, role: 'storage' });
      ridingLabel(s, ctx, 'schedule web-0', W_POD_SCHED, { delay: 250 + BEAT.afterPulse });
      lightBoxAt(s.refs.sched, ctx, req.arrivalMs);
    },
  },
  {
    id: 'filter',
    duration: 3200,
    narration: 'The filter reads allocatable.count out of each CSINode and compares it with what that Node already owes: the volumes of the Pods assigned to it, plus every VolumeAttachment still live on it. Eight against a ceiling of eight, so all three are rejected before scoring runs at all.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setStage(s, { podOp: 1, podSub: 'Pending', linkPod: 1, linkRead: 1 });
      setSlots(s, [8, 8, 8]);
      setChips(s, { attached: '24 of 24', pod: 'Pending', blocked: 'max volume count' });
      // The three counters are what the filter is actually comparing against, so all three are lit
      // for the whole step. This is a read, not a write: nothing on the node tier changes.
      s.refs.nodes.forEach(n => n.counter.classList.add('highlight'));
      // Lit from entry because the Scheduler is where the read comes from, and a ball must never
      // depart from an unlit block or it reads as coming from nowhere.
      s.refs.sched.classList.add('highlight');
      if (ctx.reduced) { s.refs.csinode.classList.add('highlight'); return; }
      const rd = routePacket(s, ctx, W_SCHED_CSI, { delay: BEAT.lead, role: 'storage' });
      ridingLabel(s, ctx, 'read allocatable.count', W_SCHED_CSI, { delay: BEAT.lead });
      lightBoxAt(s.refs.csinode, ctx, rd.arrivalMs);
    },
  },
  {
    id: 'reject',
    duration: 3000,
    narration: 'So web-0 stays Pending, and its event reads zero of three Nodes are available, three Nodes exceed max volume count. Every one of those Nodes has spare CPU and spare memory, which is what makes this hard to recognise: the cluster looks half empty and the Pod will not schedule.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setStage(s, { podOp: 1, podSub: 'FailedScheduling', linkPod: 1, linkBack: 1, linkRead: 1 });
      setSlots(s, [8, 8, 8]);
      setChips(s, { attached: '24 of 24', pod: 'FailedScheduling', blocked: 'max volume count' });
      s.refs.sched.classList.add('highlight');
      if (ctx.reduced) return;
      const ans = routePacket(s, ctx, W_SCHED_POD, { delay: BEAT.lead, role: 'storage' });
      ridingLabel(s, ctx, 'exceed max volume count', W_SCHED_POD, { delay: BEAT.lead, dy: 22 });
      pulsePod(s.refs.podNew, ctx, ans.arrivalMs);
    },
  },
  {
    id: 'detachlag',
    duration: 3400,
    // The senior edge, and the reason this is not simply a capacity-planning card. A slot is held by
    // an ATTACHMENT, not by a Pod, so the two are not freed at the same moment.
    narration: 'What clears it is a detach completing. The slot is held by the VolumeAttachment, not by the Pod, so deleting a Pod frees nothing until that object is gone, and a detach takes seconds to tens of seconds. One finishes on Node-3, the count drops to seven, and web-0 is placed there at once.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setStage(s, { podOp: 1, podSub: 'Running on node-3', pvcSub: 'attached on node-3', linkPod: 1, linkBack: 1, linkRead: 1 });
      setSlots(s, [8, 8, { used: 8, fresh: true }]);
      setChips(s, { attached: '24 of 24', pod: 'Running on node-3', blocked: 'nothing' });
      s.refs.nodes[2].counter.classList.add('highlight');
      if (ctx.reduced) return;
      const slot = s.refs.nodes[2].slots[SLOT_N - 1];
      const cnt = s.refs.nodes[2].counter;
      const free = slot.animate([{ opacity: 1 }, { opacity: 0 }], { duration: FADE.out, delay: 200, fill: 'forwards', easing: 'ease-in' });
      free.onfinish = () => setBoxLabel(cnt, '7 of ' + SLOT_N);
      ctx.register(free);
      const take = slot.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 400, delay: 1600, fill: 'forwards', easing: 'ease-out' });
      take.onfinish = () => setBoxLabel(cnt, SLOT_N + ' of ' + SLOT_N);
      ctx.register(take);
      pulsePod(s.refs.podNew, ctx, 2000);
    },
  },
  {
    id: 'fix',
    duration: 3400,
    narration: 'Every lever here is about the ceiling and none is about CPU. Fewer volumes per Pod is the cheapest, since a Pod mounting four claims eats four slots wherever it lands. More Nodes buys more slots, and an instance type that reports a higher ceiling buys more per Node.',
    enter(s) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setStage(s, { podOp: 1, podSub: 'Running on node-3', pvcSub: 'attached on node-3', linkPod: 1, linkBack: 1, linkRead: 1 });
      setSlots(s, [8, 8, { used: 8, fresh: true }]);
      setChips(s, { attached: '24 of 24', pod: 'Running on node-3', blocked: 'nothing' });
      s.refs.csinode.classList.add('highlight');
    },
  },
];

export const init = makeInit(Scene, STEPS, { posterFirst: true });
