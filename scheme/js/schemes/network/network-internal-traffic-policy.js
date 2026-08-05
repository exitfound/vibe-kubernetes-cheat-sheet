import { svg, g, text } from '../../lib/svg.js';
import { arrowDefs, box, node, arrow, pathArrow, podShell } from '../../lib/primitives.js';
import { valChip, setVal, pulsePod, segmentPacket, routePacket, makeInit, clearHighlights, clearWires, setWire, relationPath, BEAT, lightBoxAt, makeRidingLabel, OPACITY } from './network-kit.js';
// Design notes for this card: scheme/docs/CARDS.md#network-internal-traffic-policy


const FLOW_Y = 405;

const SVC_X = 450, SVC_Y = 56, SVC_W = 300, SVC_H = 74;
const SVC_CX = SVC_X + SVC_W / 2;              // 600
const SVC_BOTTOM = SVC_Y + SVC_H;              // 130

const NODE_Y = 312, NODE_H = 186;
const NODE_BOTTOM = NODE_Y + NODE_H;           // 498
const N1_X = 40, N1_W = 700;
const N1_CX = N1_X + N1_W / 2;                 // 390, the axis the Service ownership line lands on
const N2_X = 780, N2_W = 380;

const POD_W = 190, POD_H = 104;
const POD_Y = FLOW_Y - POD_H / 2;              // 353
const CLIENT_X = 70;
const CLIENT_RIGHT = CLIENT_X + POD_W;         // 260
const KP_X = 300, KP_W = 180, KP_H = 68;
const KP_TOP = FLOW_Y - KP_H / 2;              // 371
const KP_RIGHT = KP_X + KP_W;                  // 480
const KP_CX = KP_X + KP_W / 2;                 // 390
const PODA_X = 530;                            // local backend, inside Node-1
const PODB_X = 875;                            // remote backend, inside Node-2
const PODB_CX = PODB_X + POD_W / 2;            // 970

const UNDER_Y = NODE_BOTTOM + 40;              // 538, the underlay lane between the Nodes
const CHIP_Y = 578, CHIP_H = 34;
const SCHEME_LEFT = N1_X;                      // 40
const SCHEME_RIGHT = N2_X + N2_W;              // 1160


// Each static wire and the ball that rides it share the same points array.
const TO_KP = [[CLIENT_RIGHT, FLOW_Y], [KP_X, FLOW_Y]];
const TO_LOCAL = [[KP_RIGHT, FLOW_Y], [PODA_X, FLOW_Y]];
// The DNAT happens inside kube-proxy, so the remote leg re-emerges BELOW it, on the Node-1 bottom edge:
// by the time the ball is on this path the packet has already left the Node.
const TO_REMOTE = [[KP_CX, NODE_BOTTOM], [KP_CX, UNDER_Y], [PODB_CX, UNDER_Y], [PODB_CX, NODE_BOTTOM]];

// The tag that rides a ball on this card. Constants preserved from its hand-rolled copy.
const ridingLabel = makeRidingLabel({ role: 'network', outMs: 170, hold: 0 });

function podBlock({ x, y, w, h, label, ip }) {
  const shell = podShell({ x, y, w, h, label, sublabel: ip, containers: 0, role: 'network' });
  const innerBox = box({ x: x + 20, y: y + 30, w: w - 40, h: 46, label: 'app', sublabel: 'eth0', role: 'network' });
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
      'aria-label': 'internalTrafficPolicy Cluster versus Local: with Cluster the kube-proxy on the client Node programs every ready endpoint, so a call to the ClusterIP can be DNAT-ed to a backend on another Node and cross the cluster network. With Local it keeps only the endpoints on that same Node, so the packet never leaves it, and if the Node runs no backend at all the endpoint set is empty and kube-proxy drops the packets, so the caller hangs and times out, because Local has no fallback and no health check.',
      'data-style': 'outline',
    });
    root.appendChild(arrowDefs());

    const node1 = node({ x: N1_X, y: NODE_Y, w: N1_W, h: NODE_H, label: 'Node-1' });
    const node2 = node({ x: N2_X, y: NODE_Y, w: N2_W, h: NODE_H, label: 'Node-2' });

    const client = podBlock({ x: CLIENT_X, y: POD_Y, w: POD_W, h: POD_H, label: 'Client Pod', ip: '10.244.1.5' });
    const kproxy = box({ x: KP_X, y: KP_TOP, w: KP_W, h: KP_H, label: 'kube-proxy', sublabel: 'on Node-1', role: 'network' });
    const podA = podBlock({ x: PODA_X, y: POD_Y, w: POD_W, h: POD_H, label: 'Pod web', ip: '10.244.1.9' });
    const podB = podBlock({ x: PODB_X, y: POD_Y, w: POD_W, h: POD_H, label: 'Pod web', ip: '10.244.2.7' });

    const svc = box({ x: SVC_X, y: SVC_Y, w: SVC_W, h: SVC_H, label: 'Service web', sublabel: 'ClusterIP 10.96.0.20:80', role: 'network' });

    const kpWire = arrow({ x1: TO_KP[0][0], y1: TO_KP[0][1], x2: TO_KP[1][0], y2: TO_KP[1][1], dashed: true, dim: true, role: 'network' });
    const localWire = arrow({ x1: TO_LOCAL[0][0], y1: TO_LOCAL[0][1], x2: TO_LOCAL[1][0], y2: TO_LOCAL[1][1], dashed: true, dim: true, role: 'network' });
    const remoteWire = pathArrow({ points: TO_REMOTE, dashed: true, dim: true, role: 'network' });
    const OWN = [[SVC_CX, SVC_BOTTOM], [SVC_CX, 240], [N1_CX, 240], [N1_CX, NODE_Y]];
    const ownLink = relationPath({ points: OWN, role: 'network', dash: '5 5' });

    // What each backend is to the kube-proxy on Node-1. Both notes sit on one baseline under the Pods,
    // inside their Nodes, so they read as a pair that the policy flips.
    const aNote = text({ class: 'scheme-label code dim', x: PODA_X + POD_W / 2, y: 480, 'text-anchor': 'middle' }, [' ']);
    const bNote = text({ class: 'scheme-label code dim', x: PODB_CX, y: 480, 'text-anchor': 'middle' }, [' ']);

    const policyChip = valChip({ x: SCHEME_LEFT, y: CHIP_Y, w: 290, h: CHIP_H, name: 'internalTrafficPolicy', value: 'Cluster', role: 'network' });
    const scopeChip  = valChip({ x: 350, y: CHIP_Y, w: 300, h: CHIP_H, name: 'endpoints in scope', value: 'none', role: 'network' });
    const hopChip    = valChip({ x: 670, y: CHIP_Y, w: 210, h: CHIP_H, name: 'leaves Node', value: 'none', role: 'network' });
    const resultChip = valChip({ x: 900, y: CHIP_Y, w: SCHEME_RIGHT - 900, h: CHIP_H, name: 'result', value: 'none', role: 'network' });

    const packetLayer = g({ id: 'packetLayer' });

    // Z-order: the two Nodes in back, then the blocks inside them, then the Service, then wires + notes,
    // then chips, then the packet layer with its riding tags on top.
    root.appendChild(node1);
    root.appendChild(node2);
    root.appendChild(client.group);
    root.appendChild(kproxy);
    root.appendChild(podA.group);
    root.appendChild(podB.group);
    root.appendChild(svc);
    [kpWire, localWire, remoteWire, ownLink, aNote, bNote].forEach(el => root.appendChild(el));
    [policyChip, scopeChip, hopChip, resultChip].forEach(c => root.appendChild(c));
    root.appendChild(packetLayer);

    this.host.appendChild(root);
    this.refs = {
      svg: root, svc, kproxy, node1, node2,
      client: client.group, clientBox: client.innerBox,
      podA: podA.group, podABox: podA.innerBox,
      podB: podB.group, podBBox: podB.innerBox,
      policyChip, scopeChip, hopChip, resultChip,
      localWire, remoteWire,
      packetLayer, wires: { a: aNote, b: bNote },
    };
  }

  reset() { this.build(); }
}

// A backend and the lane kube-proxy would reach it by are one thing: if the endpoint is out of scope
// the lane is not a route any more. One helper pins both, because two separate assignments are how a
// bright arrow came to point at a Pod that the step had just taken out of scope.
function setBackends(s, localOp, remoteOp) {
  [s.refs.podA, s.refs.localWire].forEach(el => { el.style.opacity = String(localOp); });
  [s.refs.podB, s.refs.node2, s.refs.remoteWire].forEach(el => { el.style.opacity = String(remoteOp); });
}

function clearHL(s) {
  clearHighlights(s, ['svc', 'kproxy', 'policyChip', 'scopeChip', 'hopChip', 'resultChip', 'clientBox', 'podABox', 'podBBox'], [s.refs.client, s.refs.podA, s.refs.podB]);
  ['node1', 'client'].forEach(k => { s.refs[k].style.opacity = '1'; });
  setBackends(s, 1, 1);
}

const STEPS = [
  {
    id: 'idle',
    duration: 1500,
    enter(s) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setVal(s.refs.policyChip, 'Cluster');
      setVal(s.refs.scopeChip, 'none');
      setVal(s.refs.hopChip, 'none');
      setVal(s.refs.resultChip, 'none');
    },
  },
  {
    id: 'cluster',
    // Motion: client pulse, the ball leaves at BEAT.afterPulse(800), reaches kube-proxy at 1500, the
    // remote leg runs 1600..3067, and the backend pulse (900) ends at 3967. The floor leaves a settle.
    duration: 4400,
    narration: 'With the default Cluster, kube-proxy on Node-1 programs every ready endpoint of the Service, on any Node. The client dials the ClusterIP and the packet is DNAT-ed to the backend on Node-2, so it leaves the Node and crosses the cluster network. Load spreads evenly over all backends, at the price of a cross-node, and possibly cross-zone, hop.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setVal(s.refs.policyChip, 'Cluster');
      setVal(s.refs.scopeChip, 'all ready (2)');
      setVal(s.refs.hopChip, 'yes');
      setVal(s.refs.resultChip, 'served by Node-2');
      s.refs.resultChip.classList.add('highlight');
      // Both backends are programmed, so both notes read as endpoints. This flow happens to take the
      // remote one.
      setWire(s, 'a', 'endpoint · local');
      setWire(s, 'b', 'endpoint · remote');
      s.refs.svc.classList.add('highlight');
      s.refs.policyChip.classList.add('highlight');
      s.refs.scopeChip.classList.add('highlight');
      s.refs.hopChip.classList.add('highlight');
      if (ctx.reduced) { s.refs.kproxy.classList.add('highlight'); s.refs.podBBox.classList.add('highlight'); return; }
      pulsePod(s.refs.client, ctx, 0);
      const toKp = segmentPacket(s, ctx, { from: TO_KP[0], to: TO_KP[1], delay: BEAT.afterPulse, role: 'network' });
      ridingLabel(s, ctx, 'dst 10.96.0.20:80', TO_KP, { delay: BEAT.afterPulse, easing: 'linear' });
      lightBoxAt(s.refs.kproxy, ctx, toKp.arrivalMs);
      const outDelay = toKp.arrivalMs + BEAT.afterHop;
      const out = routePacket(s, ctx, TO_REMOTE, { delay: outDelay, role: 'network' });
      ridingLabel(s, ctx, 'dst 10.244.2.7:8080', TO_REMOTE, { delay: outDelay, dy: 20 });
      pulsePod(s.refs.podB, ctx, out.arrivalMs);
    },
  },
  {
    id: 'local',
    // Motion: client pulse, ball leaves at 800, lands on kube-proxy at 1500, the local leg runs
    // 1600..2300, and the backend pulse (900) ends at 3200.
    duration: 3600,
    narration: 'Set internalTrafficPolicy to Local and kube-proxy keeps only the endpoints that live on Node-1 itself. The same call to the same ClusterIP now goes to the local Pod, the packet never leaves the Node, and the cross-node hop is gone. This is how a Pod reaches the node-local agent of a DaemonSet, a log shipper or a per-node cache, without paying to cross the cluster.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setVal(s.refs.policyChip, 'Local');
      setVal(s.refs.scopeChip, 'node-local (1)');
      setVal(s.refs.hopChip, 'no');
      setVal(s.refs.resultChip, 'served by Node-1');
      s.refs.resultChip.classList.add('highlight');
      setWire(s, 'a', 'endpoint · in scope');
      setWire(s, 'b', 'endpoint · out of scope');
      // The remote backend is no longer programmed on this Node, so it, its Node and the lane that
      // would have reached it go dim: out of scope is the whole point of Local.
      setBackends(s, 1, OPACITY.notready);
      s.refs.svc.classList.add('highlight');
      s.refs.policyChip.classList.add('highlight');
      s.refs.scopeChip.classList.add('highlight');
      s.refs.hopChip.classList.add('highlight');
      if (ctx.reduced) { s.refs.kproxy.classList.add('highlight'); s.refs.podABox.classList.add('highlight'); return; }
      pulsePod(s.refs.client, ctx, 0);
      const toKp = segmentPacket(s, ctx, { from: TO_KP[0], to: TO_KP[1], delay: BEAT.afterPulse, role: 'network' });
      ridingLabel(s, ctx, 'dst 10.96.0.20:80', TO_KP, { delay: BEAT.afterPulse, easing: 'linear' });
      lightBoxAt(s.refs.kproxy, ctx, toKp.arrivalMs);
      const giveDelay = toKp.arrivalMs + BEAT.afterHop;
      const give = segmentPacket(s, ctx, { from: TO_LOCAL[0], to: TO_LOCAL[1], delay: giveDelay, role: 'network' });
      ridingLabel(s, ctx, 'dst 10.244.1.9:8080', TO_LOCAL, { delay: giveDelay, easing: 'linear' });
      pulsePod(s.refs.podA, ctx, give.arrivalMs);
    },
  },
  {
    id: 'no-local-backend',
    // Motion: client pulse, ball leaves at 800 and lands on kube-proxy at 1500. Nothing leaves it: the
    // point of the step is the hop that does NOT happen.
    duration: 2900,
    narration: 'The catch is that Local has no fallback. If Node-1 runs no backend of its own the endpoint set is empty, kube-proxy has nothing to DNAT to, and it drops the packets rather than forwarding them to Node-2, so the caller just hangs until it times out. There is no health check to steer callers elsewhere, which is the real difference from externalTrafficPolicy, so Local is safe only when a backend is guaranteed on every Node, as a DaemonSet gives.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setVal(s.refs.policyChip, 'Local');
      setVal(s.refs.scopeChip, 'node-local (0)');
      setVal(s.refs.hopChip, 'no');
      setVal(s.refs.resultChip, 'traffic dropped');
      setWire(s, 'a', 'no local backend');
      setWire(s, 'b', 'endpoint · out of scope');
      // Node-1 has lost its backend and the remote one is still out of scope, so both Pods go dim, and
      // both lanes with them: there is nothing left for kube-proxy to send to.
      setBackends(s, OPACITY.notready, OPACITY.notready);
      s.refs.policyChip.classList.add('highlight');
      s.refs.scopeChip.classList.add('highlight');
      s.refs.resultChip.classList.add('highlight');
      if (ctx.reduced) { s.refs.kproxy.classList.add('highlight'); return; }
      // The call is made exactly as before, and it dies at kube-proxy: the ball arrives, the box lights,
      // and no further ball leaves. The absent second hop is the whole point of the step.
      pulsePod(s.refs.client, ctx, 0);
      const toKp = segmentPacket(s, ctx, { from: TO_KP[0], to: TO_KP[1], delay: BEAT.afterPulse, role: 'network' });
      ridingLabel(s, ctx, 'dst 10.96.0.20:80', TO_KP, { delay: BEAT.afterPulse, easing: 'linear' });
      lightBoxAt(s.refs.kproxy, ctx, toKp.arrivalMs);
    },
  },
];

export const init = makeInit(Scene, STEPS, { posterFirst: true });
