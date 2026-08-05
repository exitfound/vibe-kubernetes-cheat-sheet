import { svg, g, text } from '../../lib/svg.js';
import { arrowDefs, node, box, arrow, pathArrow, podShell } from '../../lib/primitives.js';
import { valChip, setVal, setBoxSublabel, pulsePod, routePacket, segmentPacket, topPacket, makeInit, clearHighlights, clearWires, setWire, relationPath, revealAt, REVEAL_MS, FADE, BEAT, lightBoxAt, at, OPACITY } from './cluster-kit.js';
// Design notes for this card: scheme/docs/CARDS-cluster.md#cluster-static-pods

// Three tiers on the L. Measured panel: 1600x1000 x<=291 y<=160, 1280x860 x<=378 y<=193,
// 1100x800 x<=397 y<=230 (worst, on the drain step at 322 characters). Everything in tiers 1 and 2
// starts at x=450 or right of it, so the panel can never reach those whatever the narrations grow
// to. The only block left of 420 is the manifest file at y=427, so what the panel has to clear is
// the Node frame at y=380. The CEILING is 390 characters: cluster-node-drain has the same panel
// geometry and the same frame top, and its 396 character step measures 379 at 1100x800, one unit
// short. Re-measure with VW=1100 VH=800 node overlay-measure.mjs after any prose edit.
const M = 60;
const CONTENT_L = M, CONTENT_R = 1200 - M;               // 60 / 1140
const CX = (CONTENT_L + CONTENT_R) / 2;                  // 600, the canvas centre by construction

const BOX_W = 232, BOX_H = 80;
// Tier 1. The API is centred on CX so the mirror Pod hangs straight below it and the Kubelet lane is
// one vertical drop with no jog. kubectl therefore goes to the RIGHT of the API, which reverses the
// reading direction of the top row: see docs/CARDS-cluster.md for why the left slot was declined.
const TOP_Y = 40, TOP_BOTTOM = TOP_Y + BOX_H;            // 40 / 120
const TOP_GAP = 56;
const API_X = CX - BOX_W / 2, API_R = API_X + BOX_W;     // 484..716
const KUBECTL_X = API_R + TOP_GAP;                       // 772..1004
const LANE_DY = 12, TOP_CY = TOP_Y + BOX_H / 2;          // 80
const REQ_Y = TOP_CY - LANE_DY, RESP_Y = TOP_CY + LANE_DY;   // 68 / 92
const WIRE_TOP_X = (API_R + KUBECTL_X) / 2;              // 744
const WIRE_TOP_Y = TOP_Y - 14;                           // 26, above the row

// Tier 2: the mirror Pod, the one object this card draws inside the API.
const MIR_W = 300, MIR_H = 106;
const MIR_X = CX - MIR_W / 2;                            // 450..750
const MIR_Y = 190, MIR_BOTTOM = MIR_Y + MIR_H;           // 190..296

// Tier 3: the Node band. Family numbers, the ones cluster-node-drain carries.
const NODE_X = CONTENT_L, NODE_W = CONTENT_R - CONTENT_L;// 60..1140
const NODE_Y = 380, NODE_H = 152;                        // 380..532
const POD_W = 300, POD_H = 106, POD_Y = NODE_Y + 34;     // 414..520
const ROW_CY = POD_Y + POD_H / 2;                        // 467
const POD_PAD = 24;
const FILE_W = 300, FILE_X = NODE_X + POD_PAD, FILE_R = FILE_X + FILE_W;  // 84..384
const KUBE_X = CX - BOX_W / 2, KUBE_R = KUBE_X + BOX_W;  // 484..716, on CX like the API above it
const POD_X = CONTENT_R - POD_PAD - POD_W;               // 816..1116
const BOX_TOP = ROW_CY - BOX_H / 2;                      // 427, the two 80 tall boxes centre on the row
const POD_INNER = { dx: 30, w: POD_W - 60, dy: 28, h: 52 };

// The three routes of the Node band and the one that leaves it. What travels file to Kubelet is the
// Pod spec off the disk, so that lane points at the Kubelet even though the Kubelet is the actor: it
// scans, and what it gets back is the spec. Everything else leaves the Kubelet, which is the only
// box on this card that ever acts.
const FILE_TO_KUBE = [[FILE_R, ROW_CY], [KUBE_X, ROW_CY]];
const KUBE_TO_POD = [[KUBE_R, ROW_CY], [POD_X, ROW_CY]];
const KUBE_TO_MIRROR = [[CX, BOX_TOP], [CX, MIR_BOTTOM]];
// The API holds the mirror Pod, it does not drive it. No ball rides this on any step and it takes no
// arrowhead: the asymmetry of the card is that nothing ever travels down out of the API.
const API_TO_MIRROR = [[CX, TOP_BOTTOM], [CX, MIR_Y]];
const WIRE_MIR_X = CX + 12, WIRE_MIR_Y = 365;            // right of the drop, above the Node frame

// Chips as a bottom strip, TWO per row: four across leaves 258 units and the names overlap
// their own values.
const CHIP_H = 34, CHIP_GAP = 16, CHIP_VGAP = 8, CHIP_COLS = 2;
const CHIPS_Y = NODE_Y + NODE_H + 16;                    // 548, second row ends on 624
const CHIP_W = (NODE_W - CHIP_GAP * (CHIP_COLS - 1)) / CHIP_COLS;     // 532
const CHIP_X = i => CONTENT_L + (i % CHIP_COLS) * (CHIP_W + CHIP_GAP);
const CHIP_Y = i => CHIPS_Y + Math.floor(i / CHIP_COLS) * (CHIP_H + CHIP_VGAP);

const VIOLET = '#c0b0ff';

class Scene {
  constructor(host) { this.host = host; this.refs = {}; this.build(); }

  build() {
    this.host.replaceChildren();
    this.refs = {};
    const root = svg({
      class: 'diagram',
      viewBox: '0 0 1200 640',
      preserveAspectRatio: 'xMidYMid meet',
      'aria-label': 'Static Pods and mirror Pods: the Kubelet runs a manifest file on the Node and mirrors it into the API',
      'data-style': 'outline',
    });
    root.appendChild(arrowDefs());

    const apiserver = box({ x: API_X, y: TOP_Y, w: BOX_W, h: BOX_H, label: 'API', sublabel: 'holds the mirror Pod', role: 'cluster' });
    const kubectl = box({ x: KUBECTL_X, y: TOP_Y, w: BOX_W, h: BOX_H, label: 'kubectl', sublabel: 'delete and drain', role: 'cluster' });

    // Top-row lanes, one per direction, straddling the row centre line by LANE_DY.
    root.appendChild(arrow({ x1: KUBECTL_X, y1: REQ_Y, x2: API_R, y2: REQ_Y, dim: true, dashed: true, role: 'cluster' }));
    root.appendChild(arrow({ x1: API_R, y1: RESP_Y, x2: KUBECTL_X, y2: RESP_Y, dim: true, dashed: true, role: 'cluster' }));

    // API.bottom -> mirror Pod.top. A relationship, not a route.
    const holds = relationPath({ points: API_TO_MIRROR, role: 'cluster' });
    root.appendChild(holds);

    // Node band lanes plus the one lane that leaves the Node, upward.
    const fileLane = pathArrow({ points: FILE_TO_KUBE, dim: true, dashed: true, role: 'cluster' });
    const podLane = pathArrow({ points: KUBE_TO_POD, dim: true, dashed: true, role: 'cluster' });
    const mirrorLane = pathArrow({ points: KUBE_TO_MIRROR, dim: true, dashed: true, role: 'cluster' });
    [fileLane, podLane, mirrorLane].forEach(l => root.appendChild(l));

    const wireTop = text({ class: 'scheme-label code dim', x: WIRE_TOP_X, y: WIRE_TOP_Y, 'text-anchor': 'middle' }, [' ']);
    const wireMir = text({ class: 'scheme-label code dim', x: WIRE_MIR_X, y: WIRE_MIR_Y, 'text-anchor': 'start' }, [' ']);
    [wireTop, wireMir].forEach(t => root.appendChild(t));

    // State chips, one bottom strip across the content width.
    const pathChip = valChip({ x: CHIP_X(0), y: CHIP_Y(0), w: CHIP_W, h: CHIP_H, name: 'staticPodPath', value: '/etc/kubernetes/manifests', role: 'cluster' });
    const fileChip = valChip({ x: CHIP_X(1), y: CHIP_Y(1), w: CHIP_W, h: CHIP_H, name: 'manifest file', value: 'none', role: 'cluster' });
    const podChip = valChip({ x: CHIP_X(2), y: CHIP_Y(2), w: CHIP_W, h: CHIP_H, name: 'static Pod', value: 'none', role: 'cluster' });
    const mirrorChip = valChip({ x: CHIP_X(3), y: CHIP_Y(3), w: CHIP_W, h: CHIP_H, name: 'mirror Pod', value: 'none', role: 'cluster' });
    [pathChip, fileChip, podChip, mirrorChip].forEach(c => root.appendChild(c));

    const nodeEl = node({ x: NODE_X, y: NODE_Y, w: NODE_W, h: NODE_H, label: 'Node-1' });

    const fileBox = box({ x: FILE_X, y: BOX_TOP, w: FILE_W, h: BOX_H, label: 'Manifest file', sublabel: 'no file yet', role: 'cluster' });
    const kubelet = box({ x: KUBE_X, y: BOX_TOP, w: BOX_W, h: BOX_H, label: 'Kubelet', sublabel: 'scans the directory', role: 'cluster' });

    const mkPod = (id, x, y, name, sub) => {
      const shell = podShell({ x, y, w: POD_W, h: POD_H, label: 'Pod', sublabel: '', containers: 0, role: 'workloads' });
      shell.style.setProperty('--workloads-color', VIOLET);
      const inner = box({ x: x + POD_INNER.dx, y: y + POD_INNER.dy, w: POD_INNER.w, h: POD_INNER.h, label: name, sublabel: sub, role: 'workloads' });
      inner.style.setProperty('--workloads-color', VIOLET);
      const wrap = g({ id });
      wrap.appendChild(shell);
      wrap.appendChild(inner);
      return [wrap, inner];
    };
    const [staticPod, staticPodBox] = mkPod('staticPod', POD_X, POD_Y, 'static-web', 'not started');
    const [mirrorPod, mirrorBox] = mkPod('mirrorPod', MIR_X, MIR_Y, 'static-web-Node-1', 'not in the API yet');

    // Packet layer.
    const packetLayer = g({ id: 'packetLayer' });
    root.appendChild(packetLayer);

    // Frame, then everything that must sit above the balls.
    root.appendChild(nodeEl);
    root.appendChild(fileBox);
    root.appendChild(kubelet);
    root.appendChild(staticPod);
    root.appendChild(mirrorPod);
    root.appendChild(apiserver);
    root.appendChild(kubectl);

    this.host.appendChild(root);
    this.refs = {
      svg: root,
      apiserver, kubectl, nodeEl, fileBox, kubelet,
      holds, fileLane, podLane, mirrorLane,
      pathChip, fileChip, podChip, mirrorChip,
      staticPod, staticPodBox, mirrorPod, mirrorBox,
      packetLayer,
      wires: { top: wireTop, mirror: wireMir },
    };
  }

  reset() { this.build(); }
}

function clearHL(s) {
  clearHighlights(s,
    ['apiserver', 'kubectl', 'fileBox', 'kubelet', 'pathChip', 'fileChip', 'podChip', 'mirrorChip', 'staticPodBox', 'mirrorBox'],
    [s.refs.staticPod, s.refs.mirrorPod]);
}

// Presence in ONE helper, for the same reason the chips go through one: three blocks that come into
// existence at three different beats drift the moment a step is added. A block that is not there yet
// dims to OPACITY.pending and SAYS so in its sublabel, because removing it leaves a block-sized hole
// in the row and that reads as a rendering fault rather than as an absence.
const SUB = {
  file: ['no file yet', 'static-web.yaml'],
  pod: ['not started', 'no owner'],
  mirror: ['not in the API yet', 'mirror · read-only'],
};
// A lane is only as present as the fainter of its ends, so each one is pinned in the SAME pass as
// the block it depends on: the spec lane on the file it comes off, the run lane and the create lane
// on the Pod each one lands in, and the API tie on the object it holds.
function setStage(s, { file, pod: podOn, mirror }) {
  const shade = on => (on ? '1' : String(OPACITY.pending));
  s.refs.fileBox.style.opacity = shade(file);
  s.refs.fileLane.style.opacity = shade(file);
  setBoxSublabel(s.refs.fileBox, SUB.file[file ? 1 : 0]);
  s.refs.staticPod.style.opacity = shade(podOn);
  s.refs.podLane.style.opacity = shade(podOn);
  setBoxSublabel(s.refs.staticPodBox, SUB.pod[podOn ? 1 : 0]);
  s.refs.mirrorPod.style.opacity = shade(mirror);
  s.refs.mirrorLane.style.opacity = shade(mirror);
  s.refs.holds.style.opacity = shade(mirror);
  setBoxSublabel(s.refs.mirrorBox, SUB.mirror[mirror ? 1 : 0]);
}

// Every enter() writes EVERY chip through this. A chip left unset keeps the previous step's value,
// and on this card that would leave `mirror Pod` reading `deleted` while the next step narrates a
// drain skipping it.
function setChips(s, { file, staticPod, mirror }) {
  setVal(s.refs.pathChip, '/etc/kubernetes/manifests');
  setVal(s.refs.fileChip, file);
  setVal(s.refs.podChip, staticPod);
  setVal(s.refs.mirrorChip, mirror);
}

// The mirror goes out slower than the catalog FADE.out (700) for the reason cluster-node-drain gives:
// at 700 the block is gone 200ms before its own pulse ends, so the delete reads as a cut rather than
// as a deletion. It fades to OPACITY.terminated rather than to 0, and comes back on the recreate.
const MIRROR_FADE = 1200;

const STEPS = [
  {
    id: 'idle',
    duration: 1500,
    enter(s) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setStage(s, { file: false, pod: false, mirror: false });
      setChips(s, { file: 'none', staticPod: 'none', mirror: 'none' });
    },
  },
  {
    id: 'manifest',
    duration: 2400,
    narration: 'A Pod manifest appears in the directory the Kubelet watches on Node-1, named by staticPodPath in the KubeletConfiguration and conventionally /etc/kubernetes/manifests. The Kubelet rescans it and reads every file whose name does not start with a dot.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setStage(s, { file: true, pod: false, mirror: false });
      setChips(s, { file: 'static-web.yaml', staticPod: 'none', mirror: 'none' });
      s.refs.fileBox.classList.add('highlight');
      s.refs.pathChip.classList.add('highlight');
      s.refs.fileChip.classList.add('highlight');
      if (ctx.reduced) { s.refs.kubelet.classList.add('highlight'); return; }
      // The file has to be on disk before anything can be read off it, so it lands first and the
      // spec leaves for the Kubelet once it is there.
      revealAt(s.refs.fileBox, ctx, 0, OPACITY.pending);
      revealAt(s.refs.fileLane, ctx, 0, OPACITY.pending);
      const spec = segmentPacket(s, ctx, { from: FILE_TO_KUBE[0], to: FILE_TO_KUBE[1], delay: REVEAL_MS, role: 'cluster' });
      lightBoxAt(s.refs.kubelet, ctx, spec.arrivalMs);
    },
  },
  {
    id: 'kubelet-starts',
    duration: 2800,
    narration: 'The Kubelet starts the container itself. No Scheduler placed this Pod and no controller owns it, so the Kubelet supervises it directly and restarts it when it fails. That is how a kubeadm control plane comes up: the API server, the controller-manager, the Scheduler and ETCD all run as static Pods.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setStage(s, { file: true, pod: true, mirror: false });
      setChips(s, { file: 'static-web.yaml', staticPod: 'static-web · Running', mirror: 'none' });
      s.refs.fileBox.classList.add('highlight');
      s.refs.kubelet.classList.add('highlight');
      s.refs.podChip.classList.add('highlight');
      if (ctx.reduced) return;
      // The container exists once the Kubelet has actually started it, so the Pod stays at the
      // pending shade and the chip stays empty until the ball lands on the slot.
      setVal(s.refs.podChip, 'none');
      setBoxSublabel(s.refs.staticPodBox, SUB.pod[0]);
      const run = routePacket(s, ctx, KUBE_TO_POD, { role: 'cluster' });
      // The lane holds the pending shade for the flight rather than 0, so it is on screen while its
      // own ball rides it and only comes to full when the container it points at exists.
      revealAt(s.refs.podLane, ctx, run.arrivalMs, OPACITY.pending);
      revealAt(s.refs.staticPod, ctx, run.arrivalMs, OPACITY.pending);
      pulsePod(s.refs.staticPod, ctx, run.arrivalMs);
      at(s, ctx, run.arrivalMs, () => {
        setVal(s.refs.podChip, 'static-web · Running');
        setBoxSublabel(s.refs.staticPodBox, SUB.pod[1]);
      });
    },
  },
  {
    id: 'mirror',
    duration: 2800,
    narration: 'The Kubelet also creates a mirror Pod in the API for it, so kubectl get pods lists it like any other Pod. The name takes the Node name as a suffix, the kubernetes.io/config.mirror annotation marks it, and the labels on the file are copied across so selectors match it.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setStage(s, { file: true, pod: true, mirror: true });
      setChips(s, { file: 'static-web.yaml', staticPod: 'static-web · Running', mirror: 'static-web-Node-1' });
      setWire(s, 'mirror', 'POST /api/v1/namespaces/default/pods');
      s.refs.kubelet.classList.add('highlight');
      s.refs.mirrorChip.classList.add('highlight');
      if (ctx.reduced) { s.refs.apiserver.classList.add('highlight'); return; }
      // The object appears when the create reaches the API, not at step entry.
      setVal(s.refs.mirrorChip, 'none');
      setBoxSublabel(s.refs.mirrorBox, SUB.mirror[0]);
      const create = routePacket(s, ctx, KUBE_TO_MIRROR, { role: 'cluster' });
      lightBoxAt(s.refs.apiserver, ctx, create.arrivalMs);
      revealAt(s.refs.mirrorPod, ctx, create.arrivalMs, OPACITY.pending);
      revealAt(s.refs.mirrorLane, ctx, create.arrivalMs, OPACITY.pending);
      revealAt(s.refs.holds, ctx, create.arrivalMs, OPACITY.pending);
      pulsePod(s.refs.mirrorPod, ctx, create.arrivalMs);
      at(s, ctx, create.arrivalMs, () => {
        setVal(s.refs.mirrorChip, 'static-web-Node-1');
        setBoxSublabel(s.refs.mirrorBox, SUB.mirror[1]);
      });
    },
  },
  {
    id: 'delete-mirror',
    // Request out (700), answer home (1500), the mirror pulses and dissolves from 1600 over
    // MIRROR_FADE, the recreate leaves at 2900 and lands at 3600 with a pulse behind it: 4500.
    duration: 4700,
    narration: 'Deleting the mirror Pod with kubectl removes the API object and nothing else. The container on Node-1 keeps running, because the file on disk is what the Kubelet reads, and its next scan recreates the mirror. Nothing done to the object reaches the container.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setStage(s, { file: true, pod: true, mirror: true });
      setChips(s, { file: 'static-web.yaml', staticPod: 'static-web · Running', mirror: 'deleted, then recreated' });
      setWire(s, 'top', 'DELETE /api/v1/namespaces/default/pods/static-web-Node-1');
      setWire(s, 'mirror', 'POST /api/v1/namespaces/default/pods');
      s.refs.kubectl.classList.add('highlight');
      s.refs.kubelet.classList.add('highlight');
      s.refs.mirrorChip.classList.add('highlight');
      if (ctx.reduced) { s.refs.apiserver.classList.add('highlight'); return; }
      // The chip walks the step instead of announcing its end: present, gone, back.
      setVal(s.refs.mirrorChip, 'static-web-Node-1');
      const del = topPacket(s, ctx, { from: KUBECTL_X, to: API_R, y: REQ_Y, role: 'cluster' });
      lightBoxAt(s.refs.apiserver, ctx, del.arrivalMs);
      topPacket(s, ctx, { from: API_R, to: KUBECTL_X, y: RESP_Y, delay: del.arrivalMs + BEAT.afterHop, role: 'cluster' });
      // The object goes: pulse and dissolve on the same beat, so the blink is not cut off by the fade.
      const gone = del.arrivalMs + BEAT.afterHop;
      pulsePod(s.refs.mirrorPod, ctx, gone);
      at(s, ctx, gone, () => {
        setVal(s.refs.mirrorChip, 'deleted from the API');
        setBoxSublabel(s.refs.mirrorBox, 'deleted from the API');
      });
      // The API tie goes with it, because there is nothing left for the API to hold. The Kubelet
      // lane does NOT: it is the lane the recreate rides a beat later, and a lane carrying a ball
      // has to be on screen for the flight.
      const fade = (el) => ctx.register(el.animate(
        [{ opacity: 1 }, { opacity: OPACITY.terminated }], { duration: MIRROR_FADE, delay: gone, fill: 'both', easing: 'ease-in' }));
      fade(s.refs.mirrorPod);
      fade(s.refs.holds);
      // And the Kubelet puts it straight back, up the same lane it created it on.
      const again = routePacket(s, ctx, KUBE_TO_MIRROR, { delay: gone + MIRROR_FADE + BEAT.afterHop, role: 'cluster' });
      const back = (el) => ctx.register(el.animate(
        [{ opacity: OPACITY.terminated }, { opacity: 1 }], { duration: FADE.in, delay: again.arrivalMs, fill: 'forwards', easing: 'ease-out' }));
      back(s.refs.mirrorPod);
      back(s.refs.holds);
      pulsePod(s.refs.mirrorPod, ctx, again.arrivalMs);
      at(s, ctx, again.arrivalMs, () => {
        setVal(s.refs.mirrorChip, 'deleted, then recreated');
        setBoxSublabel(s.refs.mirrorBox, SUB.mirror[1]);
      });
    },
  },
  {
    id: 'edit-file',
    // Spec off the disk (700), restart lands at 1500, the Pod pulse runs to 2400.
    duration: 3000,
    narration: 'To change a static Pod you change its file. The Kubelet applies the new spec on its next scan and restarts the container, and moving the file out of the directory removes the Pod. The spec cannot refer to a ConfigMap, a Secret or a ServiceAccount, so everything it needs comes off the file or the Node filesystem.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setStage(s, { file: true, pod: true, mirror: true });
      setChips(s, { file: 'static-web.yaml · image nginx:1.27', staticPod: 'static-web · restarted', mirror: 'static-web-Node-1' });
      s.refs.fileBox.classList.add('highlight');
      s.refs.fileChip.classList.add('highlight');
      s.refs.podChip.classList.add('highlight');
      if (ctx.reduced) { s.refs.kubelet.classList.add('highlight'); return; }
      // The container is restarted by the ball that reaches it, so the chip holds what the previous
      // step left until then.
      setVal(s.refs.podChip, 'static-web · Running');
      const spec = segmentPacket(s, ctx, { from: FILE_TO_KUBE[0], to: FILE_TO_KUBE[1], role: 'cluster' });
      lightBoxAt(s.refs.kubelet, ctx, spec.arrivalMs);
      const restart = routePacket(s, ctx, KUBE_TO_POD, { delay: spec.arrivalMs + BEAT.afterHop, role: 'cluster' });
      pulsePod(s.refs.staticPod, ctx, restart.arrivalMs);
      at(s, ctx, restart.arrivalMs, () => setVal(s.refs.podChip, 'static-web · restarted'));
    },
  },
  {
    id: 'drain',
    duration: 2800,
    narration: 'A drain evicts or deletes the Pods on Node-1 and skips every mirror Pod, because removing one through the API would stop nothing. DaemonSet Pods are left alone too, and the Node Drain card covers the rest of that loop. So a static Pod rides out a drain and a kubeadm control plane keeps serving while its Node is cordoned.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setStage(s, { file: true, pod: true, mirror: true });
      setChips(s, { file: 'static-web.yaml · image nginx:1.27', staticPod: 'static-web · restarted', mirror: 'static-web-Node-1 · drain skips it' });
      setWire(s, 'top', 'kubectl drain Node-1 · mirror Pods are skipped');
      s.refs.kubectl.classList.add('highlight');
      s.refs.mirrorChip.classList.add('highlight');
      if (ctx.reduced) { s.refs.apiserver.classList.add('highlight'); return; }
      const list = topPacket(s, ctx, { from: KUBECTL_X, to: API_R, y: REQ_Y, role: 'cluster' });
      lightBoxAt(s.refs.apiserver, ctx, list.arrivalMs);
      topPacket(s, ctx, { from: API_R, to: KUBECTL_X, y: RESP_Y, delay: list.arrivalMs + BEAT.afterHop, role: 'cluster' });
    },
  },
];

export const init = makeInit(Scene, STEPS, { posterFirst: true });
