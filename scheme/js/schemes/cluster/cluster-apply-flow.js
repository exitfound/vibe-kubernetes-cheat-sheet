import { svg, g, text } from '../../lib/svg.js';
import { arrowDefs, node, box, cylinder, pathArrow, podShell } from '../../lib/primitives.js';
import { routePacket, pulsePod, makeInit, clearHighlights, clearWires, setWire, BEAT, lightBoxAt, at } from './cluster-kit.js';

// Design notes for this card: ./CARDS.md#cluster-apply-flow

// One grid with cluster-architecture, minus the cloud-controller-manager. The client is the only
// block outside the frame, so its lanes address the FRAME rather than a block.
const FRAME_X = 150, FRAME_W = 900, FRAME_R = FRAME_X + FRAME_W;   // 150..1050, architecture's
const PAD = 20;                                          // one inset, used on every wall
const IN_L = FRAME_X + PAD, IN_R = FRAME_X + FRAME_W - PAD;   // 170 / 1030
const CX = FRAME_X + FRAME_W / 2;                        // 600
const BOX_W = 220, BOX_H = 80;                           // architecture's block, catalog standard

// The columns are architecture's, the rows were solved here and architecture copied them, so the
// two read as one family in both axes. Why the stack sits this low is in ./CARDS.md.
const CP_Y = 90, CP_H = 350, CP_CY = CP_Y + CP_H / 2;    // 90..440, wall midpoint 265
const NODE_Y = 475, NODE_H = 153;                        // 475..628, 12 of canvas floor under it

// Top row: the API on the centre, ETCD on the right wall, architecture's own slot. The 190 unit
// gap is what the label needs, write Deployment my-app measures 153. The left slot is empty.
const TOP_Y = 140, TOP_BOTTOM = TOP_Y + BOX_H;           // 140 / 220, 50 under the frame top
const TOP_CY = TOP_Y + BOX_H / 2;                        // 180
const LANE_DY = 10;
const OUT_Y = TOP_CY - LANE_DY, BACK_Y = TOP_CY + LANE_DY;   // 170 / 190
const API_X = CX - BOX_W / 2, API_R = API_X + BOX_W;     // 490..710
const FLANK_W = 130;
const ETCD_X = IN_R - FLANK_W, ETCD_R = IN_R;            // 900..1030, architecture's own slot
const ETCD_OVER = 30;                                    // cylinder overhang, architecture's
// The client stands in the 150 unit band the frame leaves on the right, centred on that wall, 10
// clear of each side. 130 is the band minus the margins and is also ETCD's width.
const KCTL_W = 130, KCTL_X = FRAME_R + 10, KCTL_R = KCTL_X + KCTL_W;   // 1060..1190
const KCTL_Y = CP_CY - BOX_H / 2;                        // 225..305, centred on the wall
const KCTL_CX = KCTL_X + KCTL_W / 2;                     // 1125

// Tier 2: architecture's two outer columns. Its centre column holds the cloud-controller-manager,
// which this card lacks, and that empty slot is what keeps the Node lane one straight line.
const T2_Y = 328;                                        // 328..408, 108 under the top row
const CM_X = IN_L, CM_CX = CM_X + BOX_W / 2;             // 170..390, 280
const SCHED_X = IN_R - BOX_W, SCHED_CX = SCHED_X + BOX_W / 2;   // 810..1030, 920
const T2_BELOW = T2_Y + BOX_H + 20;                      // 428, architecture's label register:
// one wire label under each tier-2 box, inside the frame whose floor is 440.

// Architecture's tier-3 slots: the Kubelet left, the Pod right. The Pod is 106 tall rather than
// 80, so it centres on the Kubelet's own line and the two share LANE_Y by construction.
const KUBELET_X = IN_L, KUBELET_R = KUBELET_X + BOX_W;   // 170..390
const KUBELET_Y = NODE_Y + 47;                           // 522..602, on the frame's own centre
const LANE_Y = KUBELET_Y + BOX_H / 2;                    // 562, and the Pod shares it
const POD_W = BOX_W, POD_X = IN_R - POD_W;               // 810..1030
const POD_H = 106, POD_Y = LANE_Y - POD_H / 2;           // 509..615, 34 under the frame label
// The Runtime takes architecture's centre Node column, so the row reads Kubelet, Runtime, Pod on
// one line. The last step NAMES the runtime as the actor, so it has to be on the card.
const RT_X = CX - BOX_W / 2, RT_R = RT_X + BOX_W;        // 490..710

// Each tier-2 box takes a mirrored pair on its top face, the watch turning at JOG_DOWN and the
// write back at JOG_UP, centred in the 108 unit band so the two never cross.
const BAND_CY = (TOP_BOTTOM + T2_Y) / 2;                 // 274, the middle of the band
const D10 = 10, JOG_DOWN = BAND_CY - D10, JOG_UP = BAND_CY + D10;   // 264 / 284
const TO_CM      = [[API_X + 50, TOP_BOTTOM], [API_X + 50, JOG_DOWN], [CM_CX - D10, JOG_DOWN], [CM_CX - D10, T2_Y]];
const FROM_CM    = [[CM_CX + D10, T2_Y], [CM_CX + D10, JOG_UP], [API_X + 70, JOG_UP], [API_X + 70, TOP_BOTTOM]];
const TO_SCHED   = [[API_R - 50, TOP_BOTTOM], [API_R - 50, JOG_DOWN], [SCHED_CX + D10, JOG_DOWN], [SCHED_CX + D10, T2_Y]];
const FROM_SCHED = [[SCHED_CX - D10, T2_Y], [SCHED_CX - D10, JOG_UP], [API_R - 70, JOG_UP], [API_R - 70, TOP_BOTTOM]];
// The Node lane is ONE straight vertical, the API bottom midpoint to the Node frame TOP midpoint,
// both on 600. It is addressed to the Node, not the Kubelet, and 600 is the empty tier-2 column.
const TO_KUBELET = [[CX, TOP_BOTTOM], [CX, NODE_Y]];
// ETCD holds the right flank, so the write leaves the API right face and the ack comes back into
// it. Both pairs straddle their own face midpoint, so no endpoint stands alone.
const KCTL_LANE_DX = 10;
const BAND_OUT_Y = 50, BAND_BACK_Y = 70;                 // the two levels in the 0..90 band
// Which side of each face a lane takes is NOT free: the out lane runs on the upper level, so it
// takes the OUTER slot at the client and the inner one at the frame. Any other pairing tangles.
const POST     = [[KCTL_CX + KCTL_LANE_DX, KCTL_Y], [KCTL_CX + KCTL_LANE_DX, BAND_OUT_Y], [CX - KCTL_LANE_DX, BAND_OUT_Y], [CX - KCTL_LANE_DX, CP_Y]];
const POST_ACK = [[CX + KCTL_LANE_DX, CP_Y], [CX + KCTL_LANE_DX, BAND_BACK_Y], [KCTL_CX - KCTL_LANE_DX, BAND_BACK_Y], [KCTL_CX - KCTL_LANE_DX, KCTL_Y]];
const PERSIST    = [[API_R, OUT_Y], [ETCD_X, OUT_Y]];
const PERSIST_ACK= [[ETCD_X, BACK_Y], [API_R, BACK_Y]];
const CRI        = [[KUBELET_R, LANE_Y], [RT_X, LANE_Y]];
const START      = [[RT_R, LANE_Y], [POD_X, LANE_Y]];
// The two ETCD labels sit BETWEEN their blocks, the request just above its out lane and the ack
// just below its return lane, both centred on the 190 unit gap.
const WIRE_REQ_Y = OUT_Y - 12, WIRE_ACK_Y = BACK_Y + 18;     // 158 / 208
const ETCD_GAP_CX = (API_R + ETCD_X) / 2;                // 805
// ONE register for both client labels: they never share a step, the POST is step 1 and the 201 is
// step 3, and the band below the return lane is 20 units, not enough for a second register.
const KCTL_LABEL_CX = (CX + KCTL_CX) / 2;                // 862, the middle of the level run
const KCTL_LABEL_Y = BAND_OUT_Y - 16;                    // 34, over the out lane
// The Node watch label is end-anchored just left of the spine: a horizontal string centred on a
// vertical lane is cut in half by it. +7 puts the baseline on the middle of the 440..475 band.
const WIRE_KUBELET_X = CX - 14;                          // 586, end-anchored
const WIRE_KUBELET_Y = (CP_Y + CP_H + NODE_Y) / 2 + 7;   // 464, centred in the band


class Scene {
  constructor(host) { this.host = host; this.refs = {}; this.build(); }

  build() {
    this.host.replaceChildren();
    this.refs = {};
    const root = svg({
      class: 'diagram',
      viewBox: '0 0 1200 640',
      preserveAspectRatio: 'xMidYMid meet',
      'aria-label': 'The object create path: a manifest travels from the client through the control plane to the Kubelet on a Node, which calls the Runtime to start the container',
      'data-style': 'outline',
    });
    root.appendChild(arrowDefs());

    // Both frames first, so each band sits behind everything it holds. They share one span, so the
    // control plane and the Node read as one column, and every block on the card sits in one.
    const cpEl   = node({ x: FRAME_X, y: CP_Y, w: FRAME_W, h: CP_H, label: 'Control plane' });
    const nodeEl = node({ x: FRAME_X, y: NODE_Y, w: FRAME_W, h: NODE_H, label: 'Node-1' });
    root.appendChild(cpEl);
    root.appendChild(nodeEl);

    // Top row: the API on the centre and ETCD on the right wall. kubectl is not part of it: it
    // stands outside the frame, on the midpoint of its right wall.
    const client = box({ x: KCTL_X, y: KCTL_Y, w: KCTL_W, h: BOX_H, label: 'kubectl', role: 'cluster' });
    const apisrv = box({ x: API_X, y: TOP_Y, w: BOX_W, h: BOX_H, label: 'API', role: 'cluster' });
    const etcd   = cylinder({ x: ETCD_X, y: TOP_Y - 10, w: FLANK_W, h: BOX_H + ETCD_OVER, label: 'ETCD', role: 'cluster' });
    root.appendChild(client);
    root.appendChild(apisrv);
    root.appendChild(etcd);

    // Middle row: the controller-manager and the Scheduler on the same two walls, with
    // architecture's centre column left empty between them.
    const cm    = box({ x: CM_X, y: T2_Y, w: BOX_W, h: BOX_H, label: 'controller-manager', role: 'cluster' });
    const sched = box({ x: SCHED_X, y: T2_Y, w: BOX_W, h: BOX_H, label: 'Scheduler',         role: 'cluster' });
    root.appendChild(cm);
    root.appendChild(sched);

    const kubelet = box({ x: KUBELET_X, y: KUBELET_Y, w: BOX_W, h: BOX_H, label: 'Kubelet', role: 'cluster' });
    const runtime = box({ x: RT_X, y: KUBELET_Y, w: BOX_W, h: BOX_H, label: 'Runtime', role: 'cluster' });
    root.appendChild(kubelet);
    root.appendChild(runtime);

    // The placed Pod (violet workloads tint) appears inside the node once the Kubelet starts it.
    const placedPodShell = podShell({ x: POD_X, y: POD_Y, w: POD_W, h: POD_H, label: 'Pod', sublabel: '', containers: 0, role: 'workloads' });
    placedPodShell.style.setProperty('--workloads-color', '#c0b0ff');

    const placedPodBox = box({ x: POD_X + 30, y: POD_Y + 28, w: POD_W - 60, h: 52, label: 'my-app-7d4-abc', sublabel: 'nginx:1.27', role: 'workloads' });
    placedPodBox.style.setProperty('--workloads-color', '#c0b0ff');

    const placedPod = g({ id: 'placedPod' });
    placedPod.style.opacity = '0';
    placedPod.appendChild(placedPodShell);
    placedPod.appendChild(placedPodBox);
    root.appendChild(placedPod);

    const kubeletCriArrow = pathArrow({ points: CRI, dashed: true, role: 'cluster' });
    const kubeletPodArrow = pathArrow({ points: START, dashed: true, role: 'cluster' });
    kubeletCriArrow.style.opacity = '0';
    kubeletPodArrow.style.opacity = '0';
    root.appendChild(kubeletCriArrow);
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

    const wirePost          = text({ class: 'scheme-label code dim', x: KCTL_LABEL_CX, y: KCTL_LABEL_Y, 'text-anchor': 'middle' }, [' ']);
    const wireApiAck        = text({ class: 'scheme-label code dim', x: KCTL_LABEL_CX, y: KCTL_LABEL_Y, 'text-anchor': 'middle' }, [' ']);
    const wirePersist       = text({ class: 'scheme-label code dim', x: ETCD_GAP_CX, y: WIRE_REQ_Y, 'text-anchor': 'middle' }, [' ']);
    const wireEtcdAck       = text({ class: 'scheme-label code dim', x: ETCD_GAP_CX, y: WIRE_ACK_Y, 'text-anchor': 'middle' }, [' ']);
    // Both tier-2 labels sit UNDER their own box, on architecture's register: the band above the
    // row carries two lane pairs and their jogs, and a label in it would sit on a lane.
    const wireController    = text({ class: 'scheme-label code dim', x: CM_CX, y: T2_BELOW, 'text-anchor': 'middle' }, [' ']);
    const wireSchedule      = text({ class: 'scheme-label code dim', x: SCHED_CX, y: T2_BELOW, 'text-anchor': 'middle' }, [' ']);
    // Beside the spine, not centred on it: see WIRE_KUBELET_X.
    const wireKubeletWatch  = text({ class: 'scheme-label code dim', x: WIRE_KUBELET_X, y: WIRE_KUBELET_Y, 'text-anchor': 'end' }, [' ']);
    [wirePost, wireApiAck, wirePersist, wireEtcdAck, wireController, wireSchedule, wireKubeletWatch].forEach(t => root.appendChild(t));

    const packetLayer = g({ id: 'packetLayer' });
    root.appendChild(packetLayer);

    this.host.appendChild(root);
    this.refs = {
      svg: root, client, apisrv, etcd, cm, sched, kubelet, runtime, placedPod, placedPodBox,
      kubeletCriArrow, kubeletPodArrow,
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
  clearHighlights(s, ['client','apisrv','etcd','cm','sched','kubelet','runtime','placedPodBox']);
}

const STEPS = [
  {
    id: 'idle',
    duration: 1500,
    enter(s) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      s.refs.placedPod.style.opacity = '0';
      s.refs.kubeletCriArrow.style.opacity = '0';
      s.refs.kubeletPodArrow.style.opacity = '0';
    },
  },
  {
    // 2400 rather than 1700: the client lanes climb over the frame now, so the POST rides 760
    // units against the 360 it rode across the old top row, and routeDur is length-based.
    id: 'post',
    duration: 2400,
    narration: 'You run kubectl apply -f deploy.yaml. The client serializes the manifest as JSON and POSTs it to /apis/apps/v1/namespaces/default/deployments on the API. On an object that already exists it is a PATCH, see Server-side Apply.',
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
    narration: 'The API authenticates the caller from your kubeconfig, checks RBAC, runs admission and schema validation, then writes the new Deployment my-app to ETCD. ETCD commits the write via Raft quorum at rv=842.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      s.refs.apisrv.classList.add('highlight');
      // The REQUEST, not its outcome: this register sits above the OUTBOUND lane. The commit is
      // what step 3 brings back, on the ack register, as ack · rv=842.
      setWire(s, 'persist', 'write Deployment my-app');
      if (ctx.reduced) { s.refs.etcd.classList.add('highlight'); return; }
      const pkt = routePacket(s, ctx, PERSIST, { role: 'cluster' });
      lightBoxAt(s.refs.etcd, ctx, pkt.arrivalMs);
    },
  },
  {
    // 3000 rather than 2200: this step chains the ETCD ack into the client ack, and the second
    // half of that chain is the same 760 unit climb the POST takes.
    id: 'etcd-response',
    duration: 3000,
    narration: 'ETCD acks the committed write back to the API at rv=842, and the API returns HTTP 201 Created to the kubectl client. The Deployment now exists in cluster state, but no Pods have been created yet.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      s.refs.etcd.classList.add('highlight');
      setWire(s, 'etcd-ack', 'ack · rv=842');
      setWire(s, 'api-ack', 'HTTP 201 Created');
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
    // 4400: this step is TWO watch-and-write cycles, not one, so it carries four balls.
    duration: 4400,
    narration: 'The Deployment controller, inside the controller-manager, sees my-app via its watch on the API and creates a ReplicaSet (my-app-7d4). The ReplicaSet controller sees THAT on a watch of its own and creates a Pod (my-app-7d4-abc) with no nodeName yet. Nobody calls anybody.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      s.refs.apisrv.classList.add('highlight');
      // End value above the guard, the second watch, because that is where the step lands.
      setWire(s, 'controller', 'watch ADDED ReplicaSet my-app-7d4');
      if (ctx.reduced) { s.refs.cm.classList.add('highlight'); return; }
      // Each handoff is a component reacting to its OWN watch, so both cycles ride: watch the
      // Deployment, create the ReplicaSet, watch the ReplicaSet, create the Pod.
      setWire(s, 'controller', 'watch ADDED Deployment my-app');
      const watchDeploy = routePacket(s, ctx, TO_CM, { role: 'cluster' });
      lightBoxAt(s.refs.cm, ctx, watchDeploy.arrivalMs);
      const makeRs = routePacket(s, ctx, FROM_CM, { delay: watchDeploy.arrivalMs + BEAT.afterHop, role: 'cluster' });
      const watchRs = routePacket(s, ctx, TO_CM, { delay: makeRs.arrivalMs + BEAT.afterHop, role: 'cluster' });
      at(s, ctx, makeRs.arrivalMs + BEAT.afterHop, () => setWire(s, 'controller', 'watch ADDED ReplicaSet my-app-7d4'));
      routePacket(s, ctx, FROM_CM, { delay: watchRs.arrivalMs + BEAT.afterHop, role: 'cluster' });
    },
  },
  {
    id: 'schedule',
    // 2400, not 2200: widening the tier-2 lane band took the span to 2211, and the auto-advance
    // would have cut the Binding off mid-flight.
    duration: 2400,
    narration: 'The Scheduler picks up my-app-7d4-abc, filters candidate Nodes (taints, resources, affinity), scores the survivors on free resources and topology spread, then posts a Binding that pins the Pod to Node-1.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      s.refs.apisrv.classList.add('highlight');
      setWire(s, 'schedule', 'POST .../binding · node=Node-1');
      if (ctx.reduced) { s.refs.sched.classList.add('highlight'); return; }
      // Watch in, Binding back out on the return lane. It lights when the watch reaches it:
      // everything it does here is a reaction to that event.
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
    // 3300: two hops now, the CRI call and the container starting, not one.
    duration: 3300,
    narration: 'The Kubelet calls the Runtime over CRI. The Runtime creates a Pod sandbox, which gets the Pod its network namespace and IP, then pulls nginx:1.27 and starts the container inside that sandbox. The Pod my-app-7d4-abc is Running on Node-1.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      s.refs.kubelet.classList.add('highlight');
      // Pin the arrows/pod visible so cancel returns cleanly. The Pod appears in its
      // normal (thin) outline, pulses once on arrival, then eases back to it.
      s.refs.kubeletCriArrow.style.opacity = '1';
      s.refs.kubeletPodArrow.style.opacity = '1';
      s.refs.placedPod.style.opacity = '1';
      if (ctx.reduced) {
        // Static end-state: the Runtime took the call and the Pod has started, so it rests in the
        // bold outline.
        s.refs.runtime.classList.add('highlight');
        s.refs.placedPodBox.classList.add('highlight');
        return;
      }
      ctx.register(s.refs.kubeletCriArrow.animate(
        [{ opacity: 0 }, { opacity: 1 }],
        { duration: 400, fill: 'forwards', easing: 'ease-out' }
      ));
      ctx.register(s.refs.kubeletPodArrow.animate(
        [{ opacity: 0 }, { opacity: 1 }],
        { duration: 400, fill: 'forwards', easing: 'ease-out' }
      ));
      ctx.register(s.refs.placedPod.animate(
        [{ opacity: 0 }, { opacity: 1 }],
        { duration: 400, fill: 'forwards', easing: 'ease-out' }
      ));
      // The Kubelet calls the Runtime, the Runtime brings the container up. Two hops, because two
      // actors: the Kubelet never touches a container itself.
      const cri = routePacket(s, ctx, CRI, { role: 'cluster' });
      lightBoxAt(s.refs.runtime, ctx, cri.arrivalMs);
      const start = routePacket(s, ctx, START, { delay: cri.arrivalMs + BEAT.afterHop, role: 'cluster' });
      pulsePod(s.refs.placedPod, ctx, start.arrivalMs);
    },
  },
];

export const init = makeInit(Scene, STEPS, { posterFirst: true });
