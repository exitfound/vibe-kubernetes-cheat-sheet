import { svg, g, text } from '../lib/svg.js';
import { arrowDefs, pod, node, box, cylinder, pathArrow } from '../lib/primitives.js';
import { routePacket, pulsePod, makeInit, clearHighlights, clearWires, setWire, BEAT, lightBoxAt, OPACITY } from '../lib/cluster-kit.js';

// Every row is centred on CX and symmetric about it, the sibling Apply Flow card's grammar. Measured
// per step over 1600x1000 / 1280x860 / 1100x800, the panel is x<=397 on every step and its bottom
// reaches 282 on the gc-cascade step, the deepest narration in the pair.
// An earlier version of this card kept the top row RIGHT of the panel (420..1080) so nothing was
// occluded, and it was rejected: it centred nothing, the row sat 150 units right of the centre the
// Node frame sets, and the whole drawing leaned. The trade taken instead is the sibling's, and it
// is a real cost rather than a free win: see TOP_Y.
const M = 60;
const CONTENT_L = M, CONTENT_R = 1200 - M;               // 60 / 1140
const CX = (CONTENT_L + CONTENT_R) / 2;                  // 600
// Reserved narration corner: 397 x 282, measured rather than assumed. Nothing derives from it, and
// worst case per viewport is in the header note above.

// 110 is as low as the row can go. Below it sit band 1 (which has to hold two lane levels and two
// tier-2 wire labels), tier 2, band 2 and the Node frame, and tier 2 cannot rise because the panel
// reaches 282. The cost: kubectl at 170..330 and the two labels in the left gap are inside the
// panel's column, so on this card they are covered rather than merely clipped. That is the price of
// a centred API here and it was taken knowingly, exactly as on Apply Flow.
const TOP_Y = 110, TOP_H = 80, TOP_BOTTOM = TOP_Y + TOP_H;// 110 / 190
const TOP_CY = TOP_Y + TOP_H / 2;                        // 150
const LANE_DY = 10;
const OUT_Y = TOP_CY - LANE_DY, BACK_Y = TOP_CY + LANE_DY;   // 140 / 160
// The API is pinned to the canvas centre and ETCD is DERIVED from it through GAP, so the right of
// the row cannot drift. It was 420..550 / 640..860 / 950..1080, three hand-placed blocks whose
// centre was 750.
const KCTL_W = 160, API_W = 220, ETCD_W = 130;
const GAP = 190;
const API_X = CX - API_W / 2, API_R = API_X + API_W, API_CX = CX;   // 490..710
// kubectl is the ONE block in the row not derived from GAP, and it matches the Apply Flow card:
// its LEFT edge is pinned at 170, where the symmetric 130-wide version left it, and it grows to the
// RIGHT only. So the row is no longer symmetric, kubectl is 160 wide against ETCD's 130 and its gap
// is 160 against 190, and that is deliberate on both cards. 160 is near the ceiling: the gap has to
// keep holding HTTP 202 Accepted, measured at 113 units, which leaves 23.5 a side.
const KCTL_X = 170, KCTL_R = KCTL_X + KCTL_W;            // 170..330
const ETCD_X = API_R + GAP, ETCD_R = ETCD_X + ETCD_W;    // 900..1030

// Tier 2 is mirrored about CX, which is both the centre the Node frame sets and the API's own
// centre, so every row on the card shares one axis. The old comment here claimed a spine at x=500
// and centres at 250 and 750; all three numbers were dead.
// T2_D is SOLVED, not chosen: it is whatever puts the tier-2 row's outer edges NODE_PAD inside the
// Node frame, which is the same inset the Kubelet and the Pod get. So four things line up on each
// side by construction: kubectl left = controller-manager left = Kubelet left = 170, and ETCD right
// = Garbage collector right = Pod right = 1030. Nothing here is eyeballed.
const T2_Y = 300, T2_H = 80, T2_W = 240;                 // 300..380, wholly below the panel
const T2_D = CX - (110 + M) - T2_W / 2;                  // 310
const CM_CX = CX - T2_D, CM_X = CM_CX - T2_W / 2;        // 290, 170..410
const GC_CX = CX + T2_D, GC_X = GC_CX - T2_W / 2;        // 910, 790..1030

// The frame and its contents are the Apply Flow card's, to the unit, because the two cards draw the
// same Node and should not disagree about it. NODE_PAD is applied to BOTH walls, which is what the
// hand-placed KUBELET_X=135 / POD_X=720 could not hold: they left 25 of inset on the left and 154
// on the right, so the pair read as having slid leftwards inside the frame.
const NODE_X = 110, NODE_W = 980, NODE_Y = 440, NODE_H = 150;   // 110..1090, 440..590
const NODE_PAD = M;                                      // 60, left and right alike
const NODE_CX = NODE_X + NODE_W / 2;                     // 600, the frame's top-face midpoint
const KUBELET_W = 220, KUBELET_X = NODE_X + NODE_PAD;    // 170..390
const KUBELET_Y = NODE_Y + 41, KUBELET_H = 80;           // 481..561
const KUBELET_R = KUBELET_X + KUBELET_W;                 // 390
const POD_W = 216, POD_X = NODE_X + NODE_W - NODE_PAD - POD_W;   // 814..1030
const POD_Y = NODE_Y + 28, POD_H = 106;                  // 468..574
const LANE_Y = KUBELET_Y + KUBELET_H / 2;                // 521, the Pod shares it

// The two horizontal bands, each with its lane pair pinned to the band's own centre so a lane can
// never end up glued to the row it left. Both levels used to be literals (200/220 and 392/402).
// The gaps are 110 above tier 2 and 60 below, deliberately unequal and NOT a rhythm to even out:
// tier 2 cannot rise because the panel reaches 282, and the two bands carry different loads. Band 1
// holds a lane pair AND both tier-2 wire labels, band 2 holds one wire label and no lane turn at
// all, because the Node pair runs straight through it.
const BAND1_CY = (TOP_BOTTOM + T2_Y) / 2;                // 245
const BAND2_CY = (T2_Y + T2_H + NODE_Y) / 2;             // 410
const LANE_HALF = 8;
const LANE1_OUT = BAND1_CY - LANE_HALF, LANE1_BACK = BAND1_CY + LANE_HALF;   // 237 / 253

// Five lanes meet the API's bottom face at 540 / 590 / 610 / 630 / 660. The ORDER across that face
// is forced rather than chosen, and getting it wrong is what produced a crossing: every lane except
// the Node pair turns and runs horizontally through band 1, so each of them has to leave the face
// OUTSIDE the pair or it cuts across one of the two verticals dropping to the frame. The Node pair
// therefore takes the two innermost slots and NOTHING crosses in this band.
const D20 = 20, D30 = 30, D60 = 60;
const TO_CM       = [[API_CX - D60, TOP_BOTTOM], [API_CX - D60, LANE1_OUT], [CM_CX, LANE1_OUT], [CM_CX, T2_Y]];
const TO_GC       = [[API_CX + D60, TOP_BOTTOM], [API_CX + D60, LANE1_OUT], [GC_CX + D20, LANE1_OUT], [GC_CX + D20, T2_Y]];
const FROM_GC     = [[GC_CX - D20, T2_Y], [GC_CX - D20, LANE1_BACK], [API_CX + D30, LANE1_BACK], [API_CX + D30, TOP_BOTTOM]];
// Addressed to the NODE, not to the Kubelet, the same decision the Apply Flow card records: a watch
// stream arrives at a Node and a status report leaves one, and what the Kubelet does with it is
// drawn INSIDE the frame on its own step. They stay a mirrored pair on the FRAME's top face
// whatever else moves, because one endpoint alone on a face has to sit on that face's midpoint and
// two have to straddle it.
// The API, the frame and the canvas share one centre, so a pair straddling it by LANE_DY (the same
// half-offset the top row uses) is vertical at BOTH ends: two straight lines, no turn in either,
// and close enough to read as one exchange rather than as two separate errands.
const TO_NODE     = [[API_CX - LANE_DY, TOP_BOTTOM], [NODE_CX - LANE_DY, NODE_Y]];
const FROM_NODE   = [[NODE_CX + LANE_DY, NODE_Y], [API_CX + LANE_DY, TOP_BOTTOM]];
const DELETE      = [[KCTL_R, OUT_Y], [API_X, OUT_Y]];
const DELETE_ACK  = [[API_X, BACK_Y], [KCTL_R, BACK_Y]];
const PERSIST     = [[API_R, OUT_Y], [ETCD_X, OUT_Y]];
const PERSIST_ACK = [[ETCD_X, BACK_Y], [API_R, BACK_Y]];
const STOP_POD    = [[KUBELET_R, LANE_Y], [POD_X, LANE_Y]];
// Two registers, SPLIT by what fits. The acks go between the blocks like the Apply Flow card's,
// because they are short (HTTP 202 Accepted measures 115 against a 190 gap). The requests cannot:
// DELETE /apis/apps/v1/.../deployments/my-app measures 287 and patch deletionTimestamp rv=843
// measures 213, so both ride ABOVE the row instead. They used to sit at BACK_Y + 26, INSIDE the
// row band, which drew HTTP 202 Accepted straight across the kubectl and API borders on step 3.
const WIRE_REQ_Y = TOP_Y - 20;                           // 90, above the row
const WIRE_ACK_Y = BACK_Y + 18;                          // 178, between the blocks
const KCTL_GAP_CX = (KCTL_R + API_X) / 2;                // 410, follows the widened block
const ETCD_GAP_CX = (API_R + ETCD_X) / 2;                // 805
// Design notes for this card: scheme/docs/CARDS.md#cluster-delete-flow


class Scene {
  constructor(host) { this.host = host; this.refs = {}; this.build(); }

  build() {
    this.host.replaceChildren();
    this.refs = {};
    const root = svg({
      class: 'diagram',
      viewBox: '0 0 1200 640',
      preserveAspectRatio: 'xMidYMid meet',
      'aria-label': 'kubectl delete flow from the client through the control plane to the Kubelet on a Node',
      'data-style': 'outline',
    });
    root.appendChild(arrowDefs());

    const client = box({ x: KCTL_X, y: TOP_Y, w: KCTL_W, h: TOP_H, label: 'kubectl', role: 'cluster' });
    root.appendChild(client);

    const apisrv = box({ x: API_X, y: TOP_Y, w: API_W, h: TOP_H, label: 'API', role: 'cluster' });
    root.appendChild(apisrv);

    const etcd = cylinder({ x: ETCD_X, y: TOP_Y - 10, w: ETCD_W, h: TOP_H + 20, label: 'ETCD', role: 'cluster' });
    root.appendChild(etcd);

    // controller-manager and Garbage collector, mirrored about CX at +/- T2_D. See the constants.
    const cm = box({ x: CM_X, y: T2_Y, w: T2_W, h: T2_H, label: 'controller-manager', role: 'cluster' });
    root.appendChild(cm);

    // The sublabel is load-bearing, not decoration: drawn as a peer of the controller-manager and
    // never placed by any step, the Garbage collector read as a control-plane component of its own.
    // It is a controller inside kube-controller-manager, exactly like the Deployment controller the
    // gc-cascade step names in the box beside it.
    const gc = box({ x: GC_X, y: T2_Y, w: T2_W, h: T2_H, label: 'Garbage collector', sublabel: 'in controller-manager', role: 'cluster' });
    root.appendChild(gc);

    const nodeEl = node({ x: NODE_X, y: NODE_Y, w: NODE_W, h: NODE_H, label: 'Node-1' });
    root.appendChild(nodeEl);

    const kubelet = box({ x: KUBELET_X, y: KUBELET_Y, w: KUBELET_W, h: KUBELET_H, label: 'Kubelet', role: 'cluster' });
    root.appendChild(kubelet);

    const placedPodShell = pod({ x: POD_X, y: POD_Y, w: POD_W, h: POD_H, label: 'Pod', sublabel: '', containers: 0, role: 'workloads' });
    placedPodShell.style.setProperty('--workloads-color', '#c0b0ff');
    const placedPodShellRect = placedPodShell.querySelector('.scheme-pod-rect');
    if (placedPodShellRect) placedPodShellRect.style.fill = 'rgba(255, 255, 255, 0.03)';

    const placedPodBox = box({ x: POD_X + 30, y: POD_Y + 28, w: POD_W - 60, h: 52, label: 'my-app-7d4-abc', sublabel: 'nginx:1.27', role: 'workloads' });
    placedPodBox.style.setProperty('--workloads-color', '#c0b0ff');

    const placedPod = g({ id: 'placedPod' });
    placedPod.appendChild(placedPodShell);
    placedPod.appendChild(placedPodBox);
    root.appendChild(placedPod);

    const kubeletPodArrow = pathArrow({ points: STOP_POD, dashed: true, role: 'cluster' });
    root.appendChild(kubeletPodArrow);

    // Top-row lanes straddle the Api/Kubectl/ETCD centre line (y=100): request out at y=90,
    // response back at y=110. Each is drawn from the SAME array that carries its ball.
    root.appendChild(pathArrow({ points: DELETE,      dim: true, dashed: true, role: 'cluster' }));
    root.appendChild(pathArrow({ points: DELETE_ACK,  dim: true, dashed: true, role: 'cluster' }));
    root.appendChild(pathArrow({ points: PERSIST,     dim: true, dashed: true, role: 'cluster' }));
    root.appendChild(pathArrow({ points: PERSIST_ACK, dim: true, dashed: true, role: 'cluster' }));
    // API to controller-manager and API to Garbage collector, plus the Garbage collector's return.
    root.appendChild(pathArrow({ points: TO_CM, dim: true, dashed: true, role: 'cluster' }));
    root.appendChild(pathArrow({ points: TO_GC, dim: true, dashed: true, role: 'cluster' }));
    root.appendChild(pathArrow({ points: FROM_GC, dim: true, dashed: true, role: 'cluster' }));
    // The Node pair: the watch event down, the terminated report back up, mirrored on the frame's
    // top face so neither endpoint stands alone off its midpoint.
    root.appendChild(pathArrow({ points: TO_NODE, dim: true, dashed: true, role: 'cluster' }));
    root.appendChild(pathArrow({ points: FROM_NODE, dim: true, dashed: true, role: 'cluster' }));

    // Requests above the row, acks below it. Neither register touches a block.
    const wireDelete       = text({ class: 'scheme-label code dim', x: KCTL_GAP_CX, y: WIRE_REQ_Y, 'text-anchor': 'middle' }, [' ']);
    const wirePersist      = text({ class: 'scheme-label code dim', x: ETCD_GAP_CX, y: WIRE_REQ_Y, 'text-anchor': 'middle' }, [' ']);
    const wireApiAck       = text({ class: 'scheme-label code dim', x: KCTL_GAP_CX, y: WIRE_ACK_Y, 'text-anchor': 'middle' }, [' ']);
    const wireEtcdAck      = text({ class: 'scheme-label code dim', x: ETCD_GAP_CX, y: WIRE_ACK_Y, 'text-anchor': 'middle' }, [' ']);
    // Band 1 carries one label per side, each centred on the horizontal run it names and sitting 8
    // above the OUT level. The Garbage collector label names the BACK lane from over its own pair.
    const wireController   = text({ class: 'scheme-label code dim', x: (CM_CX + API_CX - D60) / 2, y: LANE1_OUT - 8, 'text-anchor': 'middle' }, [' ']);
    const wireGc           = text({ class: 'scheme-label code dim', x: (API_CX + D30 + GC_CX - D20) / 2, y: LANE1_OUT - 8, 'text-anchor': 'middle' }, [' ']);
    // Band 2. Its lane is a straight VERTICAL, and a horizontal string centred on a vertical lane is
    // cut in half by it, so this one is right-anchored just left of the lane, on the band's centre.
    const wireKubeletWatch = text({ class: 'scheme-label code dim', x: NODE_CX - LANE_DY - 14, y: BAND2_CY + 4, 'text-anchor': 'end' }, [' ']);
    const wireStopPod      = text({ class: 'scheme-label code dim', x: (KUBELET_R + POD_X) / 2, y: LANE_Y - 12, 'text-anchor': 'middle' }, [' ']);
    [wireDelete, wirePersist, wireEtcdAck, wireApiAck, wireController, wireGc, wireKubeletWatch, wireStopPod].forEach(t => root.appendChild(t));

    const packetLayer = g({ id: 'packetLayer' });
    root.appendChild(packetLayer);

    this.host.appendChild(root);
    this.refs = {
      svg: root, client, apisrv, etcd, cm, gc, kubelet, placedPod, placedPodBox, kubeletPodArrow,
      wires: {
        delete:          wireDelete,
        persist:         wirePersist,
        'etcd-ack':      wireEtcdAck,
        'api-ack':       wireApiAck,
        controller:      wireController,
        gc:              wireGc,
        'kubelet-watch': wireKubeletWatch,
        'stop-pod':      wireStopPod,
      },
      packetLayer,
    };
  }

  reset() { this.build(); }
}

function clearHL(s) {
  clearHighlights(s, ['client','apisrv','etcd','cm','gc','kubelet','placedPodBox']);
}

const STEPS = [
  {
    id: 'idle',
    duration: 1400,
    enter(s) {
      s.refs.packetLayer.replaceChildren();
      s.refs.placedPod.style.opacity = '1';
      s.refs.kubeletPodArrow.style.opacity = '1';
      clearHL(s);
      clearWires(s);
    },
  },
  {
    id: 'delete-request',
    duration: 1700,
    narration: 'You run "kubectl delete deployment my-app --cascade=foreground". The client sends an HTTP DELETE to /apis/apps/v1/namespaces/default/deployments/my-app on the API with propagationPolicy=Foreground in the request body.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      s.refs.client.classList.add('highlight');
      setWire(s, 'delete', 'DELETE /apis/apps/v1/.../deployments/my-app');
      if (ctx.reduced) { s.refs.apisrv.classList.add('highlight'); return; }
      const pkt = routePacket(s, ctx, DELETE, { role: 'cluster' });
      lightBoxAt(s.refs.apisrv, ctx, pkt.arrivalMs);
    },
  },
  {
    id: 'mark-deletion',
    duration: 1900,
    narration: 'The API does not remove the object. It patches metadata.deletionTimestamp and adds the foregroundDeletion finalizer, then commits the change to ETCD via Raft at rv=843. The Deployment is now marked for deletion but still exists in cluster state.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      s.refs.apisrv.classList.add('highlight');
      setWire(s, 'persist', 'patch deletionTimestamp · rv=843');
      if (ctx.reduced) { s.refs.etcd.classList.add('highlight'); return; }
      const pkt = routePacket(s, ctx, PERSIST, { role: 'cluster' });
      lightBoxAt(s.refs.etcd, ctx, pkt.arrivalMs);
    },
  },
  {
    id: 'ack-response',
    duration: 2200,
    narration: 'ETCD acks the committed write back to the API, and the API returns HTTP 202 Accepted to kubectl. From the caller perspective the call already returned, but the object lifecycle is only just beginning.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      s.refs.etcd.classList.add('highlight');
      clearWires(s);
      s.refs.wires['etcd-ack'].textContent = 'ack · rv=843';
      s.refs.wires['api-ack'].textContent  = 'HTTP 202 Accepted';
      if (ctx.reduced) { s.refs.apisrv.classList.add('highlight'); s.refs.client.classList.add('highlight'); return; }

      // ETCD sends the ack and is lit from entry. The Api takes it before it answers kubectl, so
      // it lights on arrival rather than at step entry.
      const ack = routePacket(s, ctx, PERSIST_ACK, { role: 'cluster' });
      lightBoxAt(s.refs.apisrv, ctx, ack.arrivalMs);
      const clientPkt = routePacket(s, ctx, DELETE_ACK, { delay: ack.arrivalMs + BEAT.afterHop, role: 'cluster' });
      lightBoxAt(s.refs.client, ctx, clientPkt.arrivalMs);
    },
  },
  {
    id: 'gc-cascade',
    duration: 3200,
    narration: 'The API broadcasts a MODIFIED event for the Deployment to its watchers. The Deployment controller in the controller-manager sees the deletionTimestamp and stops issuing rollouts. The Garbage collector walks the ownerReferences, then issues foreground DELETEs for ReplicaSet my-app-7d4 and Pod my-app-7d4-abc, which only stamp a deletionTimestamp on each rather than removing it from ETCD yet.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      s.refs.apisrv.classList.add('highlight');
      clearWires(s);
      s.refs.wires['controller'].textContent = 'watch MODIFIED · Deployment';
      s.refs.wires['gc'].textContent         = 'DELETE replicasets · pods';
      if (ctx.reduced) { s.refs.cm.classList.add('highlight'); s.refs.gc.classList.add('highlight'); return; }

      // The Api broadcasts, so it is the lit source. The Garbage collector is a receiver first and
      // only then a sender, so it lights on the MODIFIED event landing, exactly like the CM below.
      const gcEvent = routePacket(s, ctx, TO_GC, { role: 'cluster' });
      lightBoxAt(s.refs.gc, ctx, gcEvent.arrivalMs);
      // To CM (left), for Deployment/ReplicaSet controllers:
      const cmPkt = routePacket(s, ctx, TO_CM, { role: 'cluster' });
      lightBoxAt(s.refs.cm, ctx, cmPkt.arrivalMs);

      // The MODIFIED-event packet reaching GC carries the beat, then the
      // PATCH-back packet leaves below once the event has landed.
      routePacket(s, ctx, FROM_GC, { delay: gcEvent.arrivalMs + BEAT.afterHop, role: 'cluster' });
    },
  },
  {
    id: 'kubelet-watch',
    duration: 2500,
    narration: 'The Kubelet on Node-1 has a filtered watch for Pods bound to it. The API streams a MODIFIED event for my-app-7d4-abc carrying its new deletionTimestamp down that watch to Node-1, and the Kubelet starts the termination procedure.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      s.refs.apisrv.classList.add('highlight');
      setWire(s, 'kubelet-watch', 'watch MODIFIED · Pod');
      if (ctx.reduced) { s.refs.kubelet.classList.add('highlight'); return; }
      const pkt = routePacket(s, ctx, TO_NODE, { role: 'cluster' });
      lightBoxAt(s.refs.kubelet, ctx, pkt.arrivalMs);
    },
  },
  {
    id: 'kubelet-stops',
    duration: 4100,
    narration: 'The Kubelet starts the terminationGracePeriodSeconds budget (30s by default), inside which the container gets SIGTERM and then SIGKILL only if it outlives the timer, then reports the terminated Pod up to the API. What the budget is spent on is covered in the Graceful Pod Shutdown card.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      s.refs.kubelet.classList.add('highlight');
      setWire(s, 'stop-pod', 'SIGTERM · grace 30s');
      // Pin final state inline so cancel between steps doesn't flash to default opacity.
      s.refs.placedPod.style.opacity = String(OPACITY.terminating);
      if (ctx.reduced) { s.refs.apisrv.classList.add('highlight'); return; }
      // SIGTERM packet flies from Kubelet to Pod first.
      const sigterm = routePacket(s, ctx, STOP_POD, { role: 'cluster' });
      // Narrative-slow fade: the grace-period drain reads as a long dim, not a snap.
      ctx.register(s.refs.placedPod.animate(
        [{ opacity: 1 }, { opacity: OPACITY.terminating }],
        { duration: 1300, delay: sigterm.arrivalMs, fill: 'both', easing: 'ease-in' }
      ));
      // The whole Pod (shell + inner box) pulses once in sync as the SIGTERM lands, then dims
      // out with the grace-period fade. Nothing is left pinned bright.
      pulsePod(s.refs.placedPod, ctx, sigterm.arrivalMs);
      // After the grace-period drain, the Kubelet reports the terminated Pod up to the Api on the
      // return lane.
      const apisrvPkt = routePacket(s, ctx, FROM_NODE, { delay: sigterm.arrivalMs + 800, role: 'cluster' });
      lightBoxAt(s.refs.apisrv, ctx, apisrvPkt.arrivalMs);
    },
  },
  {
    id: 'purge',
    duration: 2500,
    narration: 'With the Pod terminated and dependents accounted for, the Garbage collector clears the foregroundDeletion finalizer up the chain. The API issues real DELETEs to ETCD, removing Pod, ReplicaSet, and Deployment in turn. Watchers receive DELETED events. The objects are now truly gone.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      s.refs.gc.classList.add('highlight');
      setWire(s, 'gc', 'clear finalizer');
      setWire(s, 'persist', 'DELETE · finalizers=[] · rv=856');
      // Pin final state inline so cancel returns to the right value, not default.
      s.refs.placedPod.style.opacity = '0';
      s.refs.kubeletPodArrow.style.opacity = '0';
      if (ctx.reduced) { s.refs.apisrv.classList.add('highlight'); s.refs.etcd.classList.add('highlight'); return; }
      // The GarbageCollector clears the foregroundDeletion finalizer (PATCH up to the Api), then the
      // Api issues the real DELETE to ETCD. The Pod and its arrow vanish as the object leaves ETCD.
      // The Api is mid-chain and lights on the PATCH landing, ETCD one hop later.
      const clear = routePacket(s, ctx, FROM_GC, { role: 'cluster' });
      lightBoxAt(s.refs.apisrv, ctx, clear.arrivalMs);
      const del = routePacket(s, ctx, PERSIST, { delay: clear.arrivalMs + BEAT.afterHop, role: 'cluster' });
      lightBoxAt(s.refs.etcd, ctx, del.arrivalMs);
      ctx.register(s.refs.placedPod.animate(
        [{ opacity: OPACITY.terminating }, { opacity: 0 }],
        { duration: 700, delay: del.arrivalMs, fill: 'forwards', easing: 'ease-out' }
      ));
      ctx.register(s.refs.kubeletPodArrow.animate(
        [{ opacity: 1 }, { opacity: 0 }],
        { duration: 600, delay: del.arrivalMs, fill: 'forwards', easing: 'ease-out' }
      ));
    },
  },
];

export const init = makeInit(Scene, STEPS, { posterFirst: true });
