import { svg, g, text } from '../lib/svg.js';
import { arrowDefs, pod, node, box, chainList, setChainActive, arrow, pathArrow } from '../lib/primitives.js';
import { valChip, setVal, pulsePod, routePacket, topPacket, makeInit, clearHighlights, clearWires, setWire, FADE, BEAT, lightBoxAt } from '../lib/cluster-kit.js';
// Design notes for this card: scheme/docs/CARDS.md#cluster-node-drain

// Layout C: this card carries the tallest narration panel in the category (x<=397, y<=380), so the
// whole left column above the Node frame is unusable and the ladder stays right.
const M = 60;
const CONTENT_L = M, CONTENT_R = 1200 - M;               // 60 / 1140
const CX = (CONTENT_L + CONTENT_R) / 2;                  // 600, the canvas centre by construction
const PANEL_R = 400, PANEL_B = 380;                      // the reserved corner, measured

const BOX_W = 232, BOX_H = 80;
const TOP_Y = 40, TOP_BOTTOM = TOP_Y + BOX_H;            // 40 / 120
const SPINE_X = 580;                                     // clear of the panel, left of the ladder
const KUBECTL_X = SPINE_X - BOX_W / 2;                   // 464..696
const TOP_GAP = 56;
const API_X = KUBECTL_X + BOX_W + TOP_GAP;               // 752..984
const LANE_DY = 12, TOP_CY = TOP_Y + BOX_H / 2;          // 80
const REQ_Y = TOP_CY - LANE_DY, RESP_Y = TOP_CY + LANE_DY;   // 68 / 92
const WIRE_X = (KUBECTL_X + BOX_W + API_X) / 2;          // 724
const WIRE_Y = TOP_Y - 14;                               // 26, above the row: the spine owns below it

const LADDER_X = 660, LADDER_W = 480;                    // 660..1140, right of the spine
const LADDER_Y = 170, ROW_H = 32, ROW_GAP = 10;          // 5 rows -> 170..370

const NODE_X = CONTENT_L, NODE_W = CONTENT_R - CONTENT_L;// 60..1140
const NODE_Y = PANEL_B, NODE_H = 152;                    // 380..532, the first row clear of the panel
const POD_W = 300, POD_H = 106, POD_Y = NODE_Y + 34;     // 414..520
const POD_PAD = 24;
const POD_XS = [0, 1, 2].map(i => NODE_X + POD_PAD + i * ((NODE_W - POD_PAD * 2 - POD_W) / 2));
const POD_CXS = POD_XS.map(x => x + POD_W / 2);          // 234 / 600 / 966
const POD_INNER = { dx: 30, w: POD_W - 60, dy: 28, h: 52 };

// Chips as a bottom strip, TWO per row: four across leaves 258 units and the names overlap
// their own values. 532 clears the longest pair on this card by 200.
const CHIP_H = 34, CHIP_GAP = 16, CHIP_VGAP = 8, CHIP_COLS = 2;
const CHIPS_Y = NODE_Y + NODE_H + 16;                    // 548, second row ends on 624
const CHIP_W = (NODE_W - CHIP_GAP * (CHIP_COLS - 1)) / CHIP_COLS;     // 532
const CHIP_X = i => CONTENT_L + (i % CHIP_COLS) * (CHIP_W + CHIP_GAP);
const CHIP_Y = i => CHIPS_Y + Math.floor(i / CHIP_COLS) * (CHIP_H + CHIP_VGAP);

// The eviction lane ends ON the Pod it evicts, never on the frame edge above it: it leaves the API,
// steps into the spine corridor above the ladder, drops to a bus above the Pod row and taps down into
// that Pod. One route per destination, and the same array feeds the drawn wire and the ball.
//
// It leaves the API, not kubectl, and that is the whole finding here: kubectl POSTs to the eviction
// subresource and the API is what reads the PDB, grants the 200 OK and DELETES the Pod, which the
// narration of both evict steps says in those words. The lane used to hang off SPINE_X, and KUBECTL_X
// is DERIVED from SPINE_X, so the box sat around the lane and the eviction appeared to come out of
// the command that had only ever talked to the API. Same shape as workloads-force-deletion.
const API_CX = API_X + BOX_W / 2;                        // 868
const JOG_Y = TOP_BOTTOM + 25;                           // 145, below the boxes, above the ladder
const BUS_Y = NODE_Y + 18;                               // 398, inside the frame, above the Pods
const EVICT_ROUTE = i => [[API_CX, TOP_BOTTOM], [API_CX, JOG_Y], [SPINE_X, JOG_Y], [SPINE_X, BUS_Y], [POD_CXS[i], BUS_Y], [POD_CXS[i], POD_Y]];



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

    const wireReq = text({ class: 'scheme-label code dim', x: WIRE_X, y: WIRE_Y, 'text-anchor': 'middle', 'font-size': 9 }, [' ']);
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
        '2. list     ·  enumerate Pods, skip DaemonSet / mirror',
        '3. evict    ·  POST .../pods/{name}/eviction',
        '4. PDB gate ·  API checks minAvailable, 200 or 429',
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
      const shell = pod({ x: px, y: POD_Y, w: POD_W, h: POD_H, label: 'Pod', sublabel: '', containers: 0, role: 'workloads' });
      shell.style.setProperty('--workloads-color', '#c0b0ff');
      const shellRect = shell.querySelector('.scheme-pod-rect');
      if (shellRect) shellRect.style.fill = 'rgba(255, 255, 255, 0.03)';

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

    // One drawn lane per Pod the eviction can reach. They share the spine and the bus, so the
    // two paths overlap there by construction and cannot drift apart.
    const evictLane1 = pathArrow({ points: EVICT_ROUTE(0), dim: true, dashed: true, role: 'cluster' });
    const evictLane2 = pathArrow({ points: EVICT_ROUTE(1), dim: true, dashed: true, role: 'cluster' });
    root.appendChild(evictLane1);
    root.appendChild(evictLane2);

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
      kubectl, apiserver, chain, nodeEl, evictLane1, evictLane2,
      cordonChip, pdbChip, healthyChip, lastChip,
      pod1, pod2, pod3, pod1Box, pod2Box, pod3Box,
      packetLayer,
      wires: { req: wireReq },
    };
  }

  reset() { this.build(); }
}

function clearHL(s) {
  clearHighlights(s,
    ['kubectl','apiserver','cordonChip','pdbChip','healthyChip','lastChip','pod1Box','pod2Box','pod3Box'],
    [s.refs.pod1, s.refs.pod2, s.refs.pod3]);
}

function resetPodOpacity(s) {
  ['pod1','pod2','pod3'].forEach(k => { s.refs[k].style.opacity = '1'; });
}

// An eviction lane outlives its Pod otherwise, and an arrow into a Pod that is gone points at
// nothing. Each lane is pinned to the presence of the Pod it ends on.
function setLanes(s, l1, l2) {
  s.refs.evictLane1.style.opacity = String(l1);
  s.refs.evictLane2.style.opacity = String(l2);
}

const STEPS = [
  {
    id: 'idle',
    duration: 1500,
    enter(s) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      resetPodOpacity(s);
      setLanes(s, 1, 1);
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
    narration: 'The drain command PATCHes Node-1 with spec.unschedulable=true. The Scheduler stops placing new Pods on this Node, and the status shows SchedulingDisabled. Already-running Pods stay put for now. Cordon is also exposed as a separate verb (kubectl cordon Node-1), drain just bundles it with the eviction loop.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      resetPodOpacity(s);
      setLanes(s, 1, 1);
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
    narration: 'The drain command lists Pods on Node-1 via fieldSelector=spec.nodeName=Node-1 and buckets each one. DaemonSet-owned Pods need --ignore-daemonsets (kubectl refuses to proceed without it when DS Pods are present). Mirror Pods (the API representation of static Pods) are skipped because Kubelet would recreate them immediately. Pods with emptyDir volumes need --delete-emptydir-data or they are also refused. The remaining set, two Deployment-backed Pods here, queues for the Eviction API.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      resetPodOpacity(s);
      setLanes(s, 1, 1);
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
    // The eviction now leaves the API rather than kubectl, 288 units further along, and the
    // step runs to 3762ms: 3300 cut the ball off before it reached web-1.
    duration: 3900,
    narration: 'The drain command POSTs to /api/v1/namespaces/default/pods/web-1/eviction. The API reads the matching PDB, finds currentHealthy=2 and minAvailable=1, so disruptionsAllowed=1. The eviction is granted with 200 OK, disruptionsAllowed atomically decrements to 0 (via optimistic concurrency on the PDB status), and the Pod is deleted with the standard grace period. The owning ReplicaSet observes the deletion and creates a replacement, which the Scheduler places on another Ready Node, covered in the Deployment rolling update card.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      resetPodOpacity(s);
      setLanes(s, 0, 1);
      setVal(s.refs.healthyChip, '1 of 2');
      setVal(s.refs.lastChip, 'web-1 · 200 OK');
      setWire(s, 'req', 'POST .../pods/web-1/eviction · 200 OK');
      s.refs.kubectl.classList.add('highlight');
      s.refs.pdbChip.classList.add('highlight');
      s.refs.healthyChip.classList.add('highlight');
      s.refs.lastChip.classList.add('highlight');
      // Pin final state so cancel between steps does not flash to default.
      s.refs.pod1.style.opacity = '0';
      s.refs.pod2.style.opacity = '1';
      s.refs.pod3.style.opacity = '1';
      setChainActive(s.refs.chain, 2);
      if (ctx.reduced) { s.refs.pod1Box.classList.add('highlight'); s.refs.apiserver.classList.add('highlight'); return; }
      // Top packet: kubectl → apiserver (POST eviction), then the delete flows
      // down the connector. The Pod reacts only when the ball reaches the node.
      const req = topPacket(s, ctx, { from: KUBECTL_X + BOX_W, to: API_X, y: REQ_Y, role: 'cluster' });
      lightBoxAt(s.refs.apiserver, ctx, req.arrivalMs);
      // The 200 OK the narration grants: it rides the answer lane back to kubectl, the same lane the
      // retry step already uses for its 429. Only the grant was missing, so the card showed a request
      // that was answered on one step and silently swallowed on the other.
      topPacket(s, ctx, { from: API_X, to: KUBECTL_X + BOX_W, y: RESP_Y, delay: req.arrivalMs + BEAT.afterHop, role: 'cluster' });
      const evict = routePacket(s, ctx, EVICT_ROUTE(0), { delay: req.arrivalMs + BEAT.afterHop, role: 'cluster' });
      pulsePod(s.refs.pod1, ctx, evict.arrivalMs);
      // The lane carried the ball, so it fades WITH its Pod rather than at step entry.
      [s.refs.pod1, s.refs.evictLane1].forEach(el => ctx.register(
        el.animate([{ opacity: 1 }, { opacity: 0 }], { duration: FADE.out, delay: evict.arrivalMs, fill: 'both', easing: 'ease-in' })));
    },
  },
  {
    id: 'evict-B-retry',
    duration: 4700,
    narration: 'The drain command POSTs eviction for web-2 next. With the web-1 replacement still spinning up, currentHealthy=1 equals minAvailable, so the PDB returns 429 Too Many Requests and the request is denied. It retries the eviction on a backoff. Once the replacement web-1 turns Ready elsewhere, currentHealthy bumps back to 2 and the next retry returns 200 OK, freeing web-2 to be evicted.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      resetPodOpacity(s);
      setLanes(s, 0, 0);
      setVal(s.refs.healthyChip, '1 of 2 → 2 of 2');
      setVal(s.refs.lastChip, 'web-2 · 429 → 200 OK');
      setWire(s, 'req', 'POST .../pods/web-2/eviction · 429 → retry → 200');
      s.refs.kubectl.classList.add('highlight');
      s.refs.pdbChip.classList.add('highlight');
      s.refs.healthyChip.classList.add('highlight');
      s.refs.lastChip.classList.add('highlight');
      // Pin final state.
      s.refs.pod1.style.opacity = '0';
      s.refs.pod2.style.opacity = '0';
      s.refs.pod3.style.opacity = '1';
      setChainActive(s.refs.chain, 3);
      if (ctx.reduced) { s.refs.apiserver.classList.add('highlight'); s.refs.pod2Box.classList.add('highlight'); return; }
      // First attempt: blocked. Top packet out, 429 response back, no connector follow-up. kubectl
      // is the source and lit from entry, the apiserver lights when the eviction reaches it.
      const attempt = topPacket(s, ctx, { from: KUBECTL_X + BOX_W, to: API_X, y: REQ_Y, role: 'cluster' });
      lightBoxAt(s.refs.apiserver, ctx, attempt.arrivalMs);
      const denied = topPacket(s, ctx, { from: API_X, to: KUBECTL_X + BOX_W, y: RESP_Y, delay: attempt.arrivalMs + BEAT.afterHop, role: 'cluster' });
      // Retry: kubectl → apiserver → connector → the Pod reacts on arrival.
      const retry = topPacket(s, ctx, { from: KUBECTL_X + BOX_W, to: API_X, y: REQ_Y, delay: denied.arrivalMs + BEAT.afterHop, role: 'cluster' });
      const evict = routePacket(s, ctx, EVICT_ROUTE(1), { delay: retry.arrivalMs + BEAT.afterHop, role: 'cluster' });
      pulsePod(s.refs.pod2, ctx, evict.arrivalMs);
      [s.refs.pod2, s.refs.evictLane2].forEach(el => ctx.register(
        el.animate([{ opacity: 1 }, { opacity: 0 }], { duration: FADE.out, delay: evict.arrivalMs, fill: 'both', easing: 'ease-in' })));
    },
  },
  {
    id: 'drained',
    duration: 2200,
    narration: 'Node-1 carries only the DaemonSet Pod now. Application traffic runs on the replacement web-1 and web-2 elsewhere. The Node is safe for kernel patch, reboot, or removal. To bring it back, kubectl uncordon Node-1 flips spec.unschedulable=false and the Scheduler can place new Pods on it again.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      resetPodOpacity(s);
      setLanes(s, 0, 0);
      setVal(s.refs.healthyChip, '2 of 2');
      setVal(s.refs.lastChip, '2 evicted · DS retained');
      setWire(s, 'req', 'drain complete · Node safe for maintenance');
      s.refs.kubectl.classList.add('highlight');
      s.refs.cordonChip.classList.add('highlight');
      s.refs.lastChip.classList.add('highlight');
      // Pin final state.
      s.refs.pod1.style.opacity = '0';
      s.refs.pod2.style.opacity = '0';
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
