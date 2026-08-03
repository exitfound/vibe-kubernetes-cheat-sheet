import { svg, g, text } from '../lib/svg.js';
import { arrowDefs, pod, node, box, cylinder, pathArrow } from '../lib/primitives.js';
import { routePacket, pulsePod, makeInit, clearHighlights, clearWires, setWire, BEAT, lightBoxAt } from '../lib/cluster-kit.js';

// The API is pinned to the canvas centre and its flanks are DERIVED from one GAP, so the top row is
// symmetric about CX by construction. Measured panel worst case over 1600/1280/1100 is x<=397,
// y<=180. The row no longer clears that band: see TOP_Y.
const M = 60;
const CONTENT_L = M, CONTENT_R = 1200 - M;               // 60 / 1140
const CX = (CONTENT_L + CONTENT_R) / 2;                  // 600
// Reserved narration corner: 400 x 180. Nothing on this card derives from it, and the measured
// worst case per viewport is in the header note above.

// The whole stack hangs off TOP_Y so raising or lowering the top row is ONE number, not eight.
// 108 puts the topmost ink, the ETCD cylinder at TOP_Y - 10, on y=98. The rows below are then
// spread by V rather than pinned, so the Node frame floor lands on 590 and the drawing runs
// 98..590: 98 units of margin above, 50 below.
// This DOES put kubectl (x 170..300) under the panel, which reaches x<=397 down to y<=180.
const TOP_Y = 108, TOP_H = 80, TOP_BOTTOM = TOP_Y + TOP_H;   // 108 / 188
const TOP_CY = TOP_Y + TOP_H / 2;                        // 148
const LANE_DY = 10;
const OUT_Y = TOP_CY - LANE_DY, BACK_Y = TOP_CY + LANE_DY;   // 138 / 158

// The API is pinned to the canvas centre. GAP is solved from the widest string that has to live
// between two blocks on the ETCD side. That was write committed rv=842 at 165 units when GAP was
// solved, so 190 left 12.5 a side. The label is now write Deployment my-app at 153 (the old one
// claimed the commit on the outbound register), so the margin is 18.5 and GAP is no longer tight.
// It stays 190: shrinking it would move ETCD for no gain.
// The Node frame, not this row, still sets the content bbox.
const API_W = 220, API_CX = CX, API_X = API_CX - API_W / 2, API_R = API_X + API_W;  // 490..710
const GAP = 190;
// kubectl is the ONE block in the row that is not derived from GAP. Its LEFT edge is pinned at 170,
// the value the symmetric layout left it at, and it grows to the RIGHT only, by instruction: the
// block was asked wider without being moved. So the row is no longer symmetric about CX, kubectl is
// 160 wide against ETCD's 130 and its gap is 160 against ETCD's 190, and that is deliberate.
// 160 is close to the ceiling rather than a free choice: the gap has to hold POST .../deployments,
// measured at 133 units, so the 160 gap leaves 13.5 a side and roughly 27 more units of width is
// all that exists before the label stops fitting between the blocks.
const KCTL_X = 170, KCTL_W = 160, KCTL_R = KCTL_X + KCTL_W;              // 170..330
const ETCD_W = 130, ETCD_X = API_R + GAP, ETCD_R = ETCD_X + ETCD_W;      // 900..1030

// Second tier, mirrored about CX for the same reason the top row is.
// V is the gap ABOVE tier 2 and it is now the only thing that moves the row: the Node frame is
// pinned (see NODE_Y), so raising V lowers tier 2 into the gap below it rather than pushing the
// frame down. The two gaps are therefore no longer equal, 98 above against 74 below, and that is
// the instruction rather than an oversight: the row was asked lower with everything else held.
// The lane band above tier 2 is derived from V, so it re-centres itself on every change.
// History: 60 above tier 2 and FIVE below it, then 52/52, then 62/62, then 74/74, 86/86, now 98/74.
const V = 98;
const T2_Y = TOP_BOTTOM + V, T2_H = 80, T2_W = 220, T2_D = 320;   // 286..366
const CM_CX = CX - T2_D, CM_X = CM_CX - T2_W / 2;        // 280, 170..390
const SCHED_CX = CX + T2_D, SCHED_X = SCHED_CX - T2_W / 2;   // 920, 810..1030

// Five lanes meet the API bottom face: two mirrored pairs about API_CX, plus the Kubelet lane
// on the midpoint.
const D30 = 30, D60 = 60;
// 150 rather than the original 180: those 30 units went into V. The frame clears its contents,
// which end at NODE_Y + 134, by 16, and the canvas floor by 50.
// NODE_Y is PINNED at 440 rather than derived from V. It used to be T2_Y + T2_H + V, which kept
// tier 2 exactly midway but meant the frame could not be held still while the row moved. 440 is
// where that expression left it at V=86, so this is a freeze, not a move.
const NODE_X = 110, NODE_W = 980, NODE_Y = 440, NODE_H = 150;   // 110..1090, 440..590
// The two blocks inside the frame are pushed off ITS edges by ONE padding, used twice, so the side
// insets are equal by construction and cannot drift apart the way they had: the Kubelet sat 25
// from the left wall and the Pod 154 from the right, which read as the pair sliding leftwards
// inside the frame. NODE_PAD is the canvas margin M, so the frame breathes like the canvas does.
// The Kubelet lands on 170..390, exactly the controller-manager column above it, and the Pod ends
// on 1030, exactly where the Scheduler does. That alignment is a consequence, not the goal, but it
// is worth not breaking.
const NODE_PAD = M;                                      // 60, left and right alike
const KUBELET_W = 220, KUBELET_X = NODE_X + NODE_PAD;    // 170..390
const KUBELET_Y = NODE_Y + 41, KUBELET_H = 80;
const KUBELET_R = KUBELET_X + KUBELET_W;                 // 390. No KUBELET_CX any more: the only
// thing that ever used it was the Kubelet lane, which no longer aims at this box.
const POD_W = 216, POD_X = NODE_X + NODE_W - NODE_PAD - POD_W;   // 814..1030
const POD_Y = NODE_Y + 28, POD_H = 106;                  // shares LANE_Y with the Kubelet
const LANE_Y = KUBELET_Y + KUBELET_H / 2;                // 521, and the Pod shares it

// Each tier-2 box carries a mirrored pair on its top face: the watch lands on the outer lane and
// runs at LANE_OUT_Y, the write back leaves on the inner one and runs at LANE_BACK_Y, so the two
// never cross. Both levels plus the two wire labels live in the V-tall band above tier 2.
// The pair is pinned to BAND_CY, the exact middle of that band, and spread by one HALF-gap either
// side, so it floats between the two rows instead of hanging off the face it was measured from.
// Both levels used to be offsets from TOP_BOTTOM (+25 / +40), which glued them to the top row and
// left 22 units of dead air under them.
const T2_LANE_DX = 20;
const BAND_CY = TOP_BOTTOM + V / 2;                      // 237
const T2_LANE_HALF = 8;
const LANE_OUT_Y = BAND_CY - T2_LANE_HALF, LANE_BACK_Y = BAND_CY + T2_LANE_HALF;   // 229 / 245
// TWO registers, the same idiom the top row uses: a label describing traffic that goes OUT sits
// above the out lane, a label describing traffic that comes BACK sits below the return lane. Both
// tier-2 labels used to share the out register, which put POST .../binding, the Scheduler's answer,
// over the watch lane that delivered the question to it.
const WIRE_T2_OUT_Y = LANE_OUT_Y - 8;                    // 221, above the out lane
const WIRE_T2_BACK_Y = LANE_BACK_Y + 14;                 // 259, below the return lane
const TO_CM      = [[API_CX - D60, TOP_BOTTOM], [API_CX - D60, LANE_OUT_Y], [CM_CX - T2_LANE_DX, LANE_OUT_Y], [CM_CX - T2_LANE_DX, T2_Y]];
const FROM_CM    = [[CM_CX + T2_LANE_DX, T2_Y], [CM_CX + T2_LANE_DX, LANE_BACK_Y], [API_CX - D30, LANE_BACK_Y], [API_CX - D30, TOP_BOTTOM]];
const TO_SCHED   = [[API_CX + D60, TOP_BOTTOM], [API_CX + D60, LANE_OUT_Y], [SCHED_CX + T2_LANE_DX, LANE_OUT_Y], [SCHED_CX + T2_LANE_DX, T2_Y]];
const FROM_SCHED = [[SCHED_CX - T2_LANE_DX, T2_Y], [SCHED_CX - T2_LANE_DX, LANE_BACK_Y], [API_CX + D30, LANE_BACK_Y], [API_CX + D30, TOP_BOTTOM]];
// The Kubelet lane is ONE straight vertical segment with no turn in it at all: it leaves the API
// bottom face on its midpoint and lands on the Node frame TOP face, and both midpoints are the
// same x because the API is centred on CX and the frame spans 110..1090. So the ball drops into
// the Node and stops there. What happens next is the Node's own business and is drawn inside it
// on the following step, Kubelet to Pod along START.
// Two earlier shapes are superseded, both of which sent the ball on to the Kubelet: a jog INSIDE
// the frame at NODE_Y + 28 (the ball crossed the frame edge at x=600 and crawled left across the
// floor of the Node), and then the same jog lifted into the band above the frame so the entry was
// vertical but still landed on the Kubelet top face. The lane is not addressed to the Kubelet, it
// is addressed to the Node, and it now says so.
// The spine clears both tier-2 boxes because CX=600 sits in the 390..810 gap between them.
const TO_KUBELET = [[API_CX, TOP_BOTTOM], [API_CX, NODE_Y]];
const POST       = [[KCTL_R, OUT_Y], [API_X, OUT_Y]];
const POST_ACK   = [[API_X, BACK_Y], [KCTL_R, BACK_Y]];
const PERSIST    = [[API_R, OUT_Y], [ETCD_X, OUT_Y]];
const PERSIST_ACK= [[ETCD_X, BACK_Y], [API_R, BACK_Y]];
const START      = [[KUBELET_R, LANE_Y], [POD_X, LANE_Y]];
// All four wire labels sit BETWEEN their blocks, which the old 60-unit gap could not hold:
// requests just above their out lane, acks just below their return lane, each centred on its own
// gap, and each gap clears its own widest string: the kubectl gap 160 against POST .../deployments at
// 133 (13.5 a side), GAP 190 against write Deployment my-app at 153 (18.5 a side).
const WIRE_REQ_Y = OUT_Y - 12, WIRE_ACK_Y = BACK_Y + 18;     // 126 / 176
// Derived from the two edges, so widening kubectl carried both left labels right with it.
const KCTL_GAP_CX = (KCTL_R + API_X) / 2;                // 410
const ETCD_GAP_CX = (API_R + ETCD_X) / 2;                // 835
// The Kubelet watch label is the one that does NOT sit between two blocks, because its lane is
// vertical. A horizontal string centred on a vertical lane is cut in half by it, so this one is
// right-anchored just left of the spine, on the middle of the open band between tier 2 and the
// frame (366..440). The +4 puts the baseline on that middle rather than the ascender.
const WIRE_KUBELET_X = API_CX - 14;                      // 586, end-anchored
const WIRE_KUBELET_Y = (T2_Y + T2_H + NODE_Y) / 2 + 4;   // 407
// Design notes for this card: scheme/docs/CARDS.md#cluster-apply-flow


class Scene {
  constructor(host) { this.host = host; this.refs = {}; this.build(); }

  build() {
    this.host.replaceChildren();
    this.refs = {};
    const root = svg({
      class: 'diagram',
      viewBox: '0 0 1200 640',
      preserveAspectRatio: 'xMidYMid meet',
      'aria-label': 'kubectl apply flow from the client through the control plane to the Kubelet on a Node',
      'data-style': 'outline',
    });
    root.appendChild(arrowDefs());

    const client = box({ x: KCTL_X, y: TOP_Y, w: KCTL_W, h: TOP_H, label: 'kubectl',   role: 'cluster' });
    const apisrv = box({ x: API_X, y: TOP_Y, w: API_W, h: TOP_H, label: 'API', role: 'cluster' });
    const etcd   = cylinder({ x: ETCD_X, y: TOP_Y - 10, w: ETCD_W, h: TOP_H + 20, label: 'ETCD', role: 'cluster' });
    root.appendChild(client);
    root.appendChild(apisrv);
    root.appendChild(etcd);

    // Middle row: controller-manager and Scheduler, mirrored about CX at +/- T2_D like the row above.
    const cm    = box({ x: CM_X, y: T2_Y, w: T2_W, h: T2_H, label: 'controller-manager', role: 'cluster' });
    const sched = box({ x: SCHED_X, y: T2_Y, w: T2_W, h: T2_H, label: 'Scheduler',         role: 'cluster' });
    root.appendChild(cm);
    root.appendChild(sched);

    // Bottom: a full-width worker node holding the Kubelet and the Pod it places.
    const nodeEl = node({ x: NODE_X, y: NODE_Y, w: NODE_W, h: NODE_H, label: 'Node-1' });
    root.appendChild(nodeEl);

    const kubelet = box({ x: KUBELET_X, y: KUBELET_Y, w: KUBELET_W, h: KUBELET_H, label: 'Kubelet', role: 'cluster' });
    root.appendChild(kubelet);

    // The placed Pod (violet workloads tint) appears inside the node once the Kubelet starts it.
    const placedPodShell = pod({ x: POD_X, y: POD_Y, w: POD_W, h: POD_H, label: 'Pod', sublabel: '', containers: 0, role: 'workloads' });
    placedPodShell.style.setProperty('--workloads-color', '#c0b0ff');
    const placedPodShellRect = placedPodShell.querySelector('.scheme-pod-rect');
    if (placedPodShellRect) placedPodShellRect.style.fill = 'rgba(255, 255, 255, 0.03)';

    const placedPodBox = box({ x: POD_X + 30, y: POD_Y + 28, w: POD_W - 60, h: 52, label: 'my-app-7d4-abc', sublabel: 'nginx:1.27', role: 'workloads' });
    placedPodBox.style.setProperty('--workloads-color', '#c0b0ff');

    const placedPod = g({ id: 'placedPod' });
    placedPod.style.opacity = '0';
    placedPod.appendChild(placedPodShell);
    placedPod.appendChild(placedPodBox);
    root.appendChild(placedPod);

    const kubeletPodArrow = pathArrow({ points: START, dashed: true, role: 'cluster' });
    kubeletPodArrow.style.opacity = '0';
    root.appendChild(kubeletPodArrow);

    // Top-row lanes straddle the Api centre (OUT_Y out, BACK_Y back) on both sides.
    // Each top-row lane is drawn from the SAME array that carries its ball.
    root.appendChild(pathArrow({ points: POST,        dim: true, dashed: true, role: 'cluster' }));
    root.appendChild(pathArrow({ points: POST_ACK,    dim: true, dashed: true, role: 'cluster' }));
    root.appendChild(pathArrow({ points: PERSIST,     dim: true, dashed: true, role: 'cluster' }));
    root.appendChild(pathArrow({ points: PERSIST_ACK, dim: true, dashed: true, role: 'cluster' }));
    // ControllerManager and Scheduler each get a watch lane out and a write lane back, and the
    // two pairs are mirrored about the spine.
    root.appendChild(pathArrow({ points: TO_CM, dim: true, dashed: true, role: 'cluster' }));
    root.appendChild(pathArrow({ points: FROM_CM, dim: true, dashed: true, role: 'cluster' }));
    root.appendChild(pathArrow({ points: TO_SCHED, dim: true, dashed: true, role: 'cluster' }));
    root.appendChild(pathArrow({ points: FROM_SCHED, dim: true, dashed: true, role: 'cluster' }));
    // Api -> Kubelet: straight down the spine, then into the Kubelet inside the node.
    root.appendChild(pathArrow({ points: TO_KUBELET, dim: true, dashed: true, role: 'cluster' }));

    const wirePost          = text({ class: 'scheme-label code dim', x: KCTL_GAP_CX, y: WIRE_REQ_Y, 'text-anchor': 'middle' }, [' ']);
    const wireApiAck        = text({ class: 'scheme-label code dim', x: KCTL_GAP_CX, y: WIRE_ACK_Y, 'text-anchor': 'middle' }, [' ']);
    const wirePersist       = text({ class: 'scheme-label code dim', x: ETCD_GAP_CX, y: WIRE_REQ_Y, 'text-anchor': 'middle' }, [' ']);
    const wireEtcdAck       = text({ class: 'scheme-label code dim', x: ETCD_GAP_CX, y: WIRE_ACK_Y, 'text-anchor': 'middle' }, [' ']);
    // The controller label describes the watch going OUT, so it takes the out register. The
    // Scheduler label describes the Binding coming BACK, so it takes the return one.
    const wireController    = text({ class: 'scheme-label code dim', x: CM_CX + 120, y: WIRE_T2_OUT_Y, 'text-anchor': 'middle' }, [' ']);
    const wireSchedule      = text({ class: 'scheme-label code dim', x: SCHED_CX - 160, y: WIRE_T2_BACK_Y, 'text-anchor': 'middle' }, [' ']);
    // Beside the spine, not centred on it: see WIRE_KUBELET_X.
    const wireKubeletWatch  = text({ class: 'scheme-label code dim', x: WIRE_KUBELET_X, y: WIRE_KUBELET_Y, 'text-anchor': 'end' }, [' ']);
    [wirePost, wireApiAck, wirePersist, wireEtcdAck, wireController, wireSchedule, wireKubeletWatch].forEach(t => root.appendChild(t));

    const packetLayer = g({ id: 'packetLayer' });
    root.appendChild(packetLayer);

    this.host.appendChild(root);
    this.refs = {
      svg: root, client, apisrv, etcd, cm, sched, kubelet, placedPod, placedPodBox, kubeletPodArrow,
      wires: {
        post:            wirePost,
        persist:         wirePersist,
        controller:      wireController,
        schedule:        wireSchedule,
        'kubelet-watch': wireKubeletWatch,
        'etcd-ack':      wireEtcdAck,
        'api-ack':       wireApiAck,
      },
      packetLayer,
    };
  }

  reset() { this.build(); }
}

function clearHL(s) {
  clearHighlights(s, ['client','apisrv','etcd','cm','sched','kubelet','placedPodBox']);
}

const STEPS = [
  {
    id: 'idle',
    duration: 1400,
    enter(s) {
      s.refs.packetLayer.replaceChildren();
      s.refs.placedPod.style.opacity = '0';
      s.refs.kubeletPodArrow.style.opacity = '0';
      clearHL(s);
      clearWires(s);
    },
  },
  {
    id: 'post',
    duration: 1700,
    narration: 'You run "kubectl apply -f deploy.yaml". The client serializes the manifest as JSON and POSTs it to /apis/apps/v1/namespaces/default/deployments on the API.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      s.refs.client.classList.add('highlight');
      // Elided to fit between the blocks, the card's own idiom (step 5 writes POST .../binding).
      // Nothing is lost: the step narration spells the full path out.
      setWire(s, 'post', 'POST .../deployments');
      if (ctx.reduced) { s.refs.apisrv.classList.add('highlight'); return; }
      const pkt = routePacket(s, ctx, POST, { role: 'cluster' });
      lightBoxAt(s.refs.apisrv, ctx, pkt.arrivalMs);
    },
  },
  {
    id: 'persist',
    duration: 1700,
    narration: 'The API authenticates the caller from your kubeconfig, checks RBAC, runs admission and schema validation, then writes the new Deployment "my-app" to ETCD. ETCD commits the write via Raft quorum at rv=842.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      s.refs.apisrv.classList.add('highlight');
      // The REQUEST, not its outcome. This register sits above the outbound lane, so a label
      // reading write committed claimed the commit while the ball was still in flight, and the
      // commit is what step 3 brings back on the ack register as ack · rv=842.
      setWire(s, 'persist', 'write Deployment my-app');
      if (ctx.reduced) { s.refs.etcd.classList.add('highlight'); return; }
      const pkt = routePacket(s, ctx, PERSIST, { role: 'cluster' });
      lightBoxAt(s.refs.etcd, ctx, pkt.arrivalMs);
    },
  },
  {
    id: 'etcd-response',
    duration: 2200,
    narration: 'ETCD acks the committed write back to the API at rv=842, and the API returns HTTP 201 Created to the kubectl client. The Deployment now exists in cluster state, but no Pods have been created yet.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      s.refs.etcd.classList.add('highlight');
      clearWires(s);
      s.refs.wires['etcd-ack'].textContent = 'ack · rv=842';
      s.refs.wires['api-ack'].textContent  = 'HTTP 201 Created';
      if (ctx.reduced) { s.refs.apisrv.classList.add('highlight'); s.refs.client.classList.add('highlight'); return; }

      // ETCD sends the ack, so it is lit from entry. The Api is mid-chain: it takes the ack before
      // it answers the client, so it lights on arrival, and the client lights one hop later.
      const ack = routePacket(s, ctx, PERSIST_ACK, { role: 'cluster' });
      lightBoxAt(s.refs.apisrv, ctx, ack.arrivalMs);
      const clientPkt = routePacket(s, ctx, POST_ACK, { delay: ack.arrivalMs + BEAT.afterHop, role: 'cluster' });
      lightBoxAt(s.refs.client, ctx, clientPkt.arrivalMs);
    },
  },
  {
    id: 'controller',
    duration: 2700,
    narration: 'The Deployment controller, inside the controller-manager, sees "my-app" via its watch on the API. It creates a ReplicaSet (my-app-7d4). The ReplicaSet controller then creates a Pod (my-app-7d4-abc) with no nodeName yet.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      s.refs.apisrv.classList.add('highlight');
      setWire(s, 'controller', 'watch ADDED Deployment my-app');
      if (ctx.reduced) { s.refs.cm.classList.add('highlight'); return; }
      // The Deployment controller reacts on its watch and then WRITES back: the ReplicaSet and the
      // Pod are both creates on the API. Same out-and-back shape the schedule step uses next.
      const pickup = routePacket(s, ctx, TO_CM, { role: 'cluster' });
      lightBoxAt(s.refs.cm, ctx, pickup.arrivalMs);
      routePacket(s, ctx, FROM_CM, { delay: pickup.arrivalMs + BEAT.afterHop, role: 'cluster' });
    },
  },
  {
    id: 'schedule',
    // 2400, not 2200: widening the tier-2 lane band lengthened the out-and-back pair, and
    // routeDur is length-based, so the span went to 2211 and the auto-advance would have cut
    // the Binding off mid-flight.
    duration: 2400,
    narration: 'The Scheduler picks up my-app-7d4-abc, filters candidate Nodes (taints, resources, affinity), scores the survivors on free resources and topology spread, then posts a Binding that pins the Pod to Node-1.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      s.refs.apisrv.classList.add('highlight');
      setWire(s, 'schedule', 'POST .../binding · node=Node-1');
      if (ctx.reduced) { s.refs.sched.classList.add('highlight'); return; }
      // The Scheduler picks up the unscheduled Pod on its watch (Api -> Scheduler), then posts the
      // Binding back to the Api on the return lane (Scheduler -> Api) that pins it to Node-1. It
      // lights when the watch reaches it: everything it does here is a reaction to that event.
      const pickup = routePacket(s, ctx, TO_SCHED, { role: 'cluster' });
      lightBoxAt(s.refs.sched, ctx, pickup.arrivalMs);
      routePacket(s, ctx, FROM_SCHED, { delay: pickup.arrivalMs + BEAT.afterHop, role: 'cluster' });
    },
  },
  {
    id: 'kubelet-watch',
    duration: 2400,
    narration: 'The Kubelet on Node-1 has a filtered watch on /api/v1/pods?fieldSelector=spec.nodeName=Node-1. The API streams my-app-7d4-abc down that watch to Node-1, where the Kubelet picks it up.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      s.refs.apisrv.classList.add('highlight');
      setWire(s, 'kubelet-watch', 'watch ADDED my-app-7d4-abc');
      if (ctx.reduced) { s.refs.kubelet.classList.add('highlight'); return; }
      const pkt = routePacket(s, ctx, TO_KUBELET, { role: 'cluster' });
      lightBoxAt(s.refs.kubelet, ctx, pkt.arrivalMs);
    },
  },
  {
    id: 'create-pod',
    duration: 2500,
    narration: 'The Kubelet asks the container runtime for a Pod sandbox, which gets the Pod its network namespace and IP, then pulls nginx:1.27 and starts the container in it. The Pod my-app-7d4-abc is Running on Node-1.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      s.refs.kubelet.classList.add('highlight');
      // Pin the arrow/pod visible so cancel returns cleanly. The Pod appears in its
      // normal (thin) outline, pulses once on arrival, then eases back to it.
      s.refs.kubeletPodArrow.style.opacity = '1';
      s.refs.placedPod.style.opacity = '1';
      if (ctx.reduced) {
        // Static end-state: the Pod has started, so it rests in the bold outline.
        s.refs.placedPodBox.classList.add('highlight');
        return;
      }
      ctx.register(s.refs.kubeletPodArrow.animate(
        [{ opacity: 0 }, { opacity: 1 }],
        { duration: 400, fill: 'forwards', easing: 'ease-out' }
      ));
      ctx.register(s.refs.placedPod.animate(
        [{ opacity: 0 }, { opacity: 1 }],
        { duration: 400, fill: 'forwards', easing: 'ease-out' }
      ));
      const start = routePacket(s, ctx, START, { role: 'cluster' });
      pulsePod(s.refs.placedPod, ctx, start.arrivalMs);
    },
  },
];

export const init = makeInit(Scene, STEPS, { posterFirst: true });
