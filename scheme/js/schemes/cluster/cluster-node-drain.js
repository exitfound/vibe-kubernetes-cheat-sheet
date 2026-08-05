import { svg, g, text } from '../../lib/svg.js';
import { arrowDefs, node, box, chainList, setChainActive, arrow, pathArrow, podShell } from '../../lib/primitives.js';
import { valChip, setVal, pulsePod, routePacket, topPacket, makeInit, clearHighlights, clearWires, setWire, BEAT, lightBoxAt, at, OPACITY } from './cluster-kit.js';
// Design notes for this card: ./CARDS.md#cluster-node-drain

// Layout C, ladder right, Node frame under the panel. Panel x<=397 y<=304, frame top 380: NO
// NARRATION MAY PASS 528 CHARACTERS, and that ceiling belongs to the frame, not to the current text.
const M = 60;
const CONTENT_L = M, CONTENT_R = 1200 - M;               // 60 / 1140
const CX = (CONTENT_L + CONTENT_R) / 2;                  // 600, the canvas centre by construction

const BOX_W = 232, BOX_H = 80;
const TOP_Y = 40, TOP_BOTTOM = TOP_Y + BOX_H;            // 40 / 120
// The API is centred on the Node frame so the eviction lane is one straight drop, and the whole top
// row moved left by the same 268 units to keep the pair rigid.
const TOP_GAP = 56;
const API_X = CX - BOX_W / 2;                            // 484..716, centred on the Node frame
const KUBECTL_X = API_X - TOP_GAP - BOX_W;               // 196..428
const LANE_DY = 12, TOP_CY = TOP_Y + BOX_H / 2;          // 80
const REQ_Y = TOP_CY - LANE_DY, RESP_Y = TOP_CY + LANE_DY;   // 68 / 92
// Over the API, NOT over the 56 unit gap: the longest label runs 365 units and gap-centred would
// reach x=273, inside the panel. Centred on the API it spans 417..783 and clears it outright.
const WIRE_X = CX;                                       // 600
const WIRE_Y = TOP_Y - 14;                               // 26, above the row: the spine owns below it

const LADDER_X = 660, LADDER_W = 480;                    // 660..1140, right of the spine
const LADDER_Y = 170, ROW_H = 32, ROW_GAP = 10;          // 5 rows -> 170..370

const NODE_X = CONTENT_L, NODE_W = CONTENT_R - CONTENT_L;// 60..1140
const NODE_Y = 380, NODE_H = 152;                        // 380..532, clear of the panel by 76 since 2026-08-04
const POD_W = 300, POD_H = 106, POD_Y = NODE_Y + 34;     // 414..520
const POD_PAD = 24;
const POD_XS = [0, 1, 2].map(i => NODE_X + POD_PAD + i * ((NODE_W - POD_PAD * 2 - POD_W) / 2));
const POD_INNER = { dx: 30, w: POD_W - 60, dy: 28, h: 52 };

// Chips as a bottom strip, TWO per row: four across leaves 258 units and the names overlap
// their own values. 532 clears the longest pair on this card by 200.
const CHIP_H = 34, CHIP_GAP = 16, CHIP_VGAP = 8, CHIP_COLS = 2;
const CHIPS_Y = NODE_Y + NODE_H + 16;                    // 548, second row ends on 624
const CHIP_W = (NODE_W - CHIP_GAP * (CHIP_COLS - 1)) / CHIP_COLS;     // 532
const CHIP_X = i => CONTENT_L + (i % CHIP_COLS) * (CHIP_W + CHIP_GAP);
const CHIP_Y = i => CHIPS_Y + Math.floor(i / CHIP_COLS) * (CHIP_H + CHIP_VGAP);

// ONE eviction lane, addressed to the Node rather than a Pod inside it: a single vertical drop,
// both endpoints on face midpoints. It leaves the API, not kubectl, because the API is what acts.
const API_CX = API_X + BOX_W / 2;                        // 600
const EVICT_ROUTE = [[API_CX, TOP_BOTTOM], [API_CX, NODE_Y]];



class Scene {
  constructor(host) { this.host = host; this.refs = {}; this.build(); }

  build() {
    this.host.replaceChildren();
    this.refs = {};
    const root = svg({
      class: 'diagram',
      viewBox: '0 0 1200 640',
      preserveAspectRatio: 'xMidYMid meet',
      'aria-label': 'Node drain: cordon, list-and-skip, eviction API with PDB gating',
      'data-style': 'outline',
    });
    root.appendChild(arrowDefs());

    const kubectl   = box({ x: KUBECTL_X, y: TOP_Y, w: BOX_W, h: BOX_H, label: 'kubectl', sublabel: 'drain Node-1',    role: 'cluster' });
    const apiserver = box({ x: API_X,     y: TOP_Y, w: BOX_W, h: BOX_H, label: 'API',     sublabel: 'eviction gateway', role: 'cluster' });

    // Top-row lanes, one per direction, straddling the row centre line by LANE_DY.
    root.appendChild(arrow({ x1: KUBECTL_X + BOX_W, y1: REQ_Y,  x2: API_X, y2: REQ_Y,  dim: true, dashed: true, role: 'cluster' }));
    root.appendChild(arrow({ x1: API_X, y1: RESP_Y, x2: KUBECTL_X + BOX_W, y2: RESP_Y, dim: true, dashed: true, role: 'cluster' }));

    const wireReq = text({ class: 'scheme-label code dim', x: WIRE_X, y: WIRE_Y, 'text-anchor': 'middle' }, [' ']);
    root.appendChild(wireReq);

    // State chips, one bottom strip across the content width.
    const cordonChip  = valChip({ x: CHIP_X(0), y: CHIP_Y(0), w: CHIP_W, h: CHIP_H, name: 'spec.unschedulable',     value: 'false', role: 'cluster' });
    const pdbChip     = valChip({ x: CHIP_X(1), y: CHIP_Y(1), w: CHIP_W, h: CHIP_H, name: 'web-pdb · minAvailable', value: '1', role: 'cluster' });
    const healthyChip = valChip({ x: CHIP_X(2), y: CHIP_Y(2), w: CHIP_W, h: CHIP_H, name: 'currentHealthy',         value: '2 of 2', role: 'cluster' });
    const lastChip    = valChip({ x: CHIP_X(3), y: CHIP_Y(3), w: CHIP_W, h: CHIP_H, name: 'last eviction',          value: 'none', role: 'cluster' });
    [cordonChip, pdbChip, healthyChip, lastChip].forEach(c => root.appendChild(c));

    // Pipeline chain, right of the spine.
    const chain = chainList({
      x: LADDER_X, y: LADDER_Y, w: LADDER_W, rowH: ROW_H, gap: ROW_GAP,
      items: [
        '1. cordon   ·  PATCH Node spec.unschedulable=true',
        '2. list     ·  --ignore-daemonsets --delete-emptydir-data --force',
        '3. evict    ·  POST .../pods/{name}/eviction',
        '4. PDB gate ·  API reads disruptionsAllowed, 200 or 429',
        '5. drained  ·  app Pods gone, DaemonSet stays',
      ],
      role: 'cluster',
    });

    // Bottom: Node-1 with 3 Pods: web-1, web-2 (Deployment), fluentd (DaemonSet).
    const nodeEl = node({ x: NODE_X, y: NODE_Y, w: NODE_W, h: NODE_H, label: 'Node-1' });

    const POD_NAMES = ['web-1', 'web-2', 'fluentd'];
    const POD_OWNER = ['Deployment', 'Deployment', 'DaemonSet'];
    const podBoxes = [];
    const podWrappers = POD_XS.map((px, i) => {
      const shell = podShell({ x: px, y: POD_Y, w: POD_W, h: POD_H, label: 'Pod', sublabel: '', containers: 0, role: 'workloads' });
      shell.style.setProperty('--workloads-color', '#c0b0ff');

      const innerBox = box({ x: px + POD_INNER.dx, y: POD_Y + POD_INNER.dy, w: POD_INNER.w, h: POD_INNER.h, label: POD_NAMES[i], sublabel: POD_OWNER[i], role: 'workloads' });
      innerBox.style.setProperty('--workloads-color', '#c0b0ff');

      const wrap = g({ id: `pod${i + 1}` });
      wrap.appendChild(shell);
      wrap.appendChild(innerBox);
      podBoxes.push(innerBox);
      return wrap;
    });
    const [pod1, pod2, pod3] = podWrappers;
    const [pod1Box, pod2Box, pod3Box] = podBoxes;

    // One lane, and it ends on the Node frame: the eviction is addressed to a Pod on this Node,
    // and which Pod that is comes from the pulse, not from a fan of taps into the Pod row.
    const evictLane = pathArrow({ points: EVICT_ROUTE, dim: true, dashed: true, role: 'cluster' });
    root.appendChild(evictLane);

    // Packet layer.
    const packetLayer = g({ id: 'packetLayer' });
    root.appendChild(packetLayer);

    root.appendChild(chain);
    root.appendChild(nodeEl);
    root.appendChild(pod1);
    root.appendChild(pod2);
    root.appendChild(pod3);
    root.appendChild(apiserver);
    root.appendChild(kubectl);

    this.host.appendChild(root);
    this.refs = {
      svg: root,
      kubectl, apiserver, chain, nodeEl,
      cordonChip, pdbChip, healthyChip, lastChip,
      pod1, pod2, pod3, pod1Box, pod2Box, pod3Box,
      packetLayer,
      wires: { req: wireReq },
    };
  }

  reset() { this.build(); }
}

function resetStep(s) {
  s.refs.packetLayer.replaceChildren();
  clearHighlights(s,
    ['kubectl','apiserver','cordonChip','pdbChip','healthyChip','lastChip','pod1Box','pod2Box','pod3Box'],
    [s.refs.pod1, s.refs.pod2, s.refs.pod3]);
  clearWires(s);
}

function resetPodOpacity(s) {
  ['pod1','pod2','pod3'].forEach(k => { s.refs[k].style.opacity = '1'; });
}

// The lane ends on the Node frame, which is on screen for the whole card, so it never has to be
// pinned to the presence of a Pod: nothing it points at can go away under it.

// Slower than FADE.out 700, where the Pod is gone 200ms before its own pulse ends and the eviction
// reads as a cut. Fades to OPACITY.terminated, not 0, or it leaves a hole in the Node frame.
const POD_FADE = 1200;
function fadeOut(s, ctx, key, boxKey, delay) {
  const box = s.refs[boxKey];
  const a = s.refs[key].animate(
    [{ opacity: 1 }, { opacity: OPACITY.terminated }], { duration: POD_FADE, delay, fill: 'both', easing: 'ease-in' });
  a.onfinish = () => { if (box) box.classList.remove('highlight'); };
  ctx.register(a);
}


const STEPS = [
  {
    id: 'idle',
    duration: 1500,
    enter(s) {
      resetStep(s);
      resetPodOpacity(s);
      setVal(s.refs.cordonChip, 'false');
      setVal(s.refs.pdbChip, '1');
      setVal(s.refs.healthyChip, '2 of 2');
      setVal(s.refs.lastChip, 'none');
      setChainActive(s.refs.chain, -1);
    },
  },
  {
    id: 'cordon',
    duration: 2000,
    narration: 'The drain command PATCHes Node-1 with spec.unschedulable=true. The Scheduler stops placing new Pods on this Node unless they tolerate the node.kubernetes.io/unschedulable taint the way DaemonSet Pods do, and the status shows SchedulingDisabled. Already-running Pods stay put for now. Cordon is also exposed as a separate verb (kubectl cordon Node-1), drain just bundles it with the eviction loop.',
    enter(s, ctx) {
      resetStep(s);
      resetPodOpacity(s);
      setVal(s.refs.cordonChip, 'true · SchedulingDisabled');
      setWire(s, 'req', 'PATCH /api/v1/nodes/Node-1 · spec.unschedulable=true');
      s.refs.kubectl.classList.add('highlight');
      s.refs.cordonChip.classList.add('highlight');
      setChainActive(s.refs.chain, 0);
      if (ctx.reduced) { s.refs.apiserver.classList.add('highlight'); return; }
      // kubectl, apiserver and cordonChip are all newly highlighted here, so the
      // Timeline auto-delta already pulses them. The PATCH rides the top hop.
      const pkt = topPacket(s, ctx, { from: KUBECTL_X + BOX_W, to: API_X, y: REQ_Y, role: 'cluster' });
      lightBoxAt(s.refs.apiserver, ctx, pkt.arrivalMs);
    },
  },
  {
    id: 'list',
    duration: 1900,
    narration: 'The drain command lists Pods on Node-1 via fieldSelector=spec.nodeName=Node-1 and buckets each one. A drain never evicts DaemonSet Pods. Mirror Pods (the API record of static Pods) are skipped because Kubelet would recreate them. Pods with emptyDir volumes and bare Pods with no owner abort the drain until the matching flag is passed. Two Deployment-backed Pods are left for the Eviction API.',
    enter(s, ctx) {
      resetStep(s);
      resetPodOpacity(s);
      setWire(s, 'req', 'GET /api/v1/pods · fieldSelector=spec.nodeName=Node-1');
      s.refs.kubectl.classList.add('highlight');
      setChainActive(s.refs.chain, 1);
      if (ctx.reduced) { s.refs.apiserver.classList.add('highlight'); return; }
      const pkt = topPacket(s, ctx, { from: KUBECTL_X + BOX_W, to: API_X, y: REQ_Y, role: 'cluster' });
      lightBoxAt(s.refs.apiserver, ctx, pkt.arrivalMs);
    },
  },
  {
    id: 'evict-A',
    // The eviction leaves the API, not kubectl, one 260 unit drop. The step ends on the Pod fade at
    // POD_FADE 1200, so it runs to 2700ms and duration follows it.
    duration: 2800,
    narration: 'The drain command POSTs an eviction for web-1. The API reads the matching PDB, whose status the disruption controller keeps at disruptionsAllowed=1. The eviction is granted with 200 OK, disruptionsAllowed decrements to 0 under optimistic concurrency, and the Pod is deleted with its grace period. The owning ReplicaSet replaces it elsewhere, covered in the Deployment rolling update card.',
    enter(s, ctx) {
      resetStep(s);
      resetPodOpacity(s);
      setVal(s.refs.healthyChip, '1 of 2');
      setVal(s.refs.lastChip, 'web-1 · 200 OK');
      setWire(s, 'req', 'POST .../pods/web-1/eviction · 200 OK');
      s.refs.kubectl.classList.add('highlight');
      s.refs.pdbChip.classList.add('highlight');
      s.refs.healthyChip.classList.add('highlight');
      s.refs.lastChip.classList.add('highlight');
      // Pin final state so cancel between steps does not flash to default. The evicted Pod ends at
      // the terminated shade, so the static path must NOT stand a highlight in for the pulse here.
      s.refs.pod1.style.opacity = String(OPACITY.terminated);
      s.refs.pod2.style.opacity = '1';
      s.refs.pod3.style.opacity = '1';
      setChainActive(s.refs.chain, 2);
      if (ctx.reduced) { s.refs.apiserver.classList.add('highlight'); return; }
      // The count the API READS is 2, and the eviction is what takes it to 1, so the chip stays at
      // what the previous step left and turns over when the eviction ball lands on web-1.
      setVal(s.refs.healthyChip, '2 of 2');
      // What kubectl KNOWS, so it cannot read 200 OK while the POST is still on the wire: it turns
      // over when the answer lands back, the count when the eviction takes effect on the Pod.
      setVal(s.refs.lastChip, 'none');
      // Top packet: kubectl → apiserver (POST eviction), then the delete flows
      // down the connector. The Pod reacts only when the ball reaches the node.
      const req = topPacket(s, ctx, { from: KUBECTL_X + BOX_W, to: API_X, y: REQ_Y, role: 'cluster' });
      lightBoxAt(s.refs.apiserver, ctx, req.arrivalMs);
      // The 200 OK rides the answer lane home, the same lane the retry step uses for its 429. A
      // return the narration promises and the motion never delivers is a defect family here.
      const granted = topPacket(s, ctx, { from: API_X, to: KUBECTL_X + BOX_W, y: RESP_Y, delay: req.arrivalMs + BEAT.afterHop, role: 'cluster' });
      at(s, ctx, granted.arrivalMs, () => setVal(s.refs.lastChip, 'web-1 · 200 OK'));
      const evict = routePacket(s, ctx, EVICT_ROUTE, { delay: req.arrivalMs + BEAT.afterHop, role: 'cluster' });
      at(s, ctx, evict.arrivalMs, () => setVal(s.refs.healthyChip, '1 of 2'));
      pulsePod(s.refs.pod1, ctx, evict.arrivalMs);
      fadeOut(s, ctx, 'pod1', 'pod1Box', evict.arrivalMs);
    },
  },
  {
    id: 'evict-B-retry',
    // Four hops plus the drop, ending on the POD_FADE dissolve: 4300ms.
    duration: 4400,
    narration: 'The drain command POSTs eviction for web-2 next. With the web-1 replacement still spinning up, currentHealthy=1 equals minAvailable, so disruptionsAllowed is 0 and the API returns 429 Too Many Requests. The drain command retries every 5 seconds. Once the replacement turns Ready elsewhere, currentHealthy is back to 2 and the next retry returns 200 OK, evicting web-2.',
    enter(s, ctx) {
      resetStep(s);
      resetPodOpacity(s);
      setVal(s.refs.healthyChip, '1 of 2 → 2 of 2');
      setVal(s.refs.lastChip, 'web-2 · 429 → 200 OK');
      setWire(s, 'req', 'POST .../pods/web-2/eviction · 429 → retry → 200');
      s.refs.kubectl.classList.add('highlight');
      s.refs.pdbChip.classList.add('highlight');
      s.refs.healthyChip.classList.add('highlight');
      s.refs.lastChip.classList.add('highlight');
      // Pin final state. Both evicted Pods hold the terminated shade, so neither takes a stand-in
      // highlight on the static path.
      s.refs.pod1.style.opacity = String(OPACITY.terminated);
      s.refs.pod2.style.opacity = String(OPACITY.terminated);
      s.refs.pod3.style.opacity = '1';
      setChainActive(s.refs.chain, 3);
      if (ctx.reduced) { s.refs.apiserver.classList.add('highlight'); return; }
      // Both chips roll back to what the step STARTS from. The pinned values are TRANSITIONS, so at
      // entry they announce the 429 and the retry that clears it before either is drawn.
      setVal(s.refs.healthyChip, '1 of 2');
      setVal(s.refs.lastChip, 'web-1 · 200 OK');
      // First attempt: blocked. Top packet out, 429 response back, no connector follow-up. kubectl
      // is the source and lit from entry, the apiserver lights when the eviction reaches it.
      const attempt = topPacket(s, ctx, { from: KUBECTL_X + BOX_W, to: API_X, y: REQ_Y, role: 'cluster' });
      lightBoxAt(s.refs.apiserver, ctx, attempt.arrivalMs);
      const denied = topPacket(s, ctx, { from: API_X, to: KUBECTL_X + BOX_W, y: RESP_Y, delay: attempt.arrivalMs + BEAT.afterHop, role: 'cluster' });
      at(s, ctx, denied.arrivalMs, () => setVal(s.refs.lastChip, 'web-2 · 429'));
      // Retry: kubectl → apiserver → connector → the Pod reacts on arrival. The count bumps as the
      // retry leaves, because the narration has the replacement turning Ready BEFORE it is granted.
      const retry = topPacket(s, ctx, { from: KUBECTL_X + BOX_W, to: API_X, y: REQ_Y, delay: denied.arrivalMs + BEAT.afterHop, role: 'cluster' });
      at(s, ctx, denied.arrivalMs + BEAT.afterHop, () => setVal(s.refs.healthyChip, '1 of 2 → 2 of 2'));
      const evict = routePacket(s, ctx, EVICT_ROUTE, { delay: retry.arrivalMs + BEAT.afterHop, role: 'cluster' });
      at(s, ctx, evict.arrivalMs, () => setVal(s.refs.lastChip, 'web-2 · 429 → 200 OK'));
      pulsePod(s.refs.pod2, ctx, evict.arrivalMs);
      fadeOut(s, ctx, 'pod2', 'pod2Box', evict.arrivalMs);
    },
  },
  {
    id: 'drained',
    duration: 2200,
    narration: 'Node-1 carries only the DaemonSet Pod now. Application traffic runs on the replacement web-1 and web-2 elsewhere. The Node is safe for kernel patch, reboot, or removal. To bring it back, kubectl uncordon Node-1 flips spec.unschedulable=false and the Scheduler can place new Pods on it again.',
    enter(s, ctx) {
      resetStep(s);
      resetPodOpacity(s);
      setVal(s.refs.healthyChip, '2 of 2');
      // currentHealthy climbing back to 2 of 2 is the point of the step (the budget is satisfied
      // again, so the drain is safe to call done), and it used to change with no cue on it.
      s.refs.healthyChip.classList.add('highlight');
      // A chip means what its name says: this holds the LAST eviction, not a tally. The summary is
      // carried by ladder row 5 and the wire label.
      setVal(s.refs.lastChip, 'web-2 · 200 OK');
      setWire(s, 'req', 'drain complete · Node safe for maintenance');
      s.refs.kubectl.classList.add('highlight');
      s.refs.cordonChip.classList.add('highlight');
      s.refs.lastChip.classList.add('highlight');
      // Pin final state. Both evicted Pods stay on screen at the terminated shade.
      s.refs.pod1.style.opacity = String(OPACITY.terminated);
      s.refs.pod2.style.opacity = String(OPACITY.terminated);
      s.refs.pod3.style.opacity = '1';
      setChainActive(s.refs.chain, 4);
      if (ctx.reduced) return;
      // fluentd (the DaemonSet Pod) is the lone survivor on Node-1: pulse it once
      // to call out that it is the only workload that stays after the drain.
      pulsePod(s.refs.pod3, ctx, 0);
    },
  },
];

export const init = makeInit(Scene, STEPS, { posterFirst: true });
