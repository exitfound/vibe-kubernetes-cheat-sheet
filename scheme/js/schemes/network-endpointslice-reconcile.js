import { svg, g } from '../lib/svg.js';
import { arrowDefs, box, pod, arrow } from '../lib/primitives.js';
import { valChip, setVal, setPodSublabel, pulsePod, segmentPacket, makeInit, clearHighlights, BEAT, lightBoxAt, makeRidingLabel, OPACITY } from '../lib/network-kit.js';
// Design notes for this card: scheme/docs/CARDS.md#network-endpointslice-reconcile


const CTLR_TOP = 350;                       // top edge of the controller box
const SLICE_BOTTOM = 290;                   // bottom edge of the lowest endpoint row
const WRITE_PATH = [[600, CTLR_TOP], [600, SLICE_BOTTOM]];   // controller -> slice, straight up
const SLICE_RIGHT = 790, KPROXY_LEFT = 840; // slice right edge, kube-proxy left edge
const READ_PATH = [[SLICE_RIGHT, 222], [KPROXY_LEFT, 222]];  // slice -> kube-proxy, straight right

// The tag that rides a ball on this card. Constants preserved from its hand-rolled copy.
const ridingLabel = makeRidingLabel({ role: 'network' });

function podBlock({ x, y, w, h, label, ip }) {
  const shell = pod({ x, y, w, h, label, sublabel: ip, containers: 0, role: 'network' });
  const shellRect = shell.querySelector('.scheme-pod-rect');
  if (shellRect) shellRect.style.fill = 'rgba(255, 255, 255, 0.03)';
  const innerBox = box({ x: x + 20, y: y + 30, w: w - 40, h: 48, label: 'app', sublabel: 'eth0', role: 'network' });
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
      'aria-label': 'Service and EndpointSlice reconciliation: the controller watches Pods matching the Service selector and writes the ready ones into an EndpointSlice that kube-proxy consumes, with readiness gating membership',
      'data-style': 'outline',
    });
    root.appendChild(arrowDefs());

    // Top: the Service owns the selector and names the slice, but holds no addresses.
    const service = box({ x: 410, y: 52, w: 380, h: 70, label: 'Service web', sublabel: 'selector app=web · holds no addresses', role: 'network' });

    // Centre: the EndpointSlice (the derived list). One row per matching Pod.
    const ep1 = valChip({ x: 410, y: 152, w: 380, h: 42, name: 'endpoint', value: '(empty)', role: 'network' });
    const ep2 = valChip({ x: 410, y: 200, w: 380, h: 42, name: 'endpoint', value: '(empty)', role: 'network' });
    const ep3 = valChip({ x: 410, y: 248, w: 380, h: 42, name: 'endpoint', value: '(empty)', role: 'network' });

    // Right: kube-proxy, the consumer that reads the slice.
    const kproxy = box({ x: 840, y: 178, w: 280, h: 88, label: 'kube-proxy', sublabel: 'reads the slice', role: 'network' });

    // Lower-centre: the controller, the engine that watches Pods and writes the slice.
    const ctlr = box({ x: 410, y: 350, w: 380, h: 90, label: 'EndpointSlice controller', sublabel: 'watches app=web, writes endpoints', role: 'network' });

    // Bottom: the live Pods (the source of truth).
    const a = podBlock({ x: 90,  y: 488, w: 250, h: 128, label: 'Pod app=web', ip: '10.244.1.5 · ready' });
    const b = podBlock({ x: 475, y: 488, w: 250, h: 128, label: 'Pod app=web', ip: '10.244.2.7 · ready' });
    const c = podBlock({ x: 860, y: 488, w: 250, h: 128, label: 'Pod app=web', ip: '10.244.3.9 · notReady' });

    // Wires: Service names the slice (down), controller writes the slice (up), slice is read by
    // kube-proxy (right), and the controller watches the Pod set (down).
    const declWire  = arrow({ x1: 600, y1: 122, x2: 600, y2: 152, dashed: true, dim: true, role: 'network' });
    const writeWire = arrow({ x1: WRITE_PATH[0][0], y1: WRITE_PATH[0][1], x2: WRITE_PATH[1][0], y2: WRITE_PATH[1][1], dashed: true, dim: true, role: 'network' });
    const readWire  = arrow({ x1: READ_PATH[0][0], y1: READ_PATH[0][1], x2: READ_PATH[1][0], y2: READ_PATH[1][1], dashed: true, dim: true, role: 'network' });
    const watchWire = arrow({ x1: 600, y1: 440, x2: 600, y2: 484, dashed: true, dim: true, role: 'network' });

    const packetLayer = g({ id: 'packetLayer' });

    root.appendChild(service);
    root.appendChild(kproxy);
    root.appendChild(ctlr);
    root.appendChild(a.group);
    root.appendChild(b.group);
    root.appendChild(c.group);
    [ep1, ep2, ep3].forEach(el => root.appendChild(el));
    [declWire, writeWire, readWire, watchWire].forEach(el => root.appendChild(el));
    root.appendChild(packetLayer);

    this.host.appendChild(root);
    this.refs = {
      svg: root, service, ctlr, kproxy,
      ep1, ep2, ep3,
      podA: a.group, podABox: a.innerBox, podB: b.group, podBBox: b.innerBox, podC: c.group, podCBox: c.innerBox,
      packetLayer, wires: {},
    };
  }

  reset() { this.build(); }
}

function clearHL(s) {
  // The inner pod boxes (podABox etc.) light in the reduced-motion end-states, so they must be
  // cleared here too or a replayed prior step leaks its .highlight into the next one.
  clearHighlights(s, ['service', 'ctlr', 'kproxy', 'ep1', 'ep2', 'ep3', 'podABox', 'podBBox', 'podCBox'], [s.refs.podA, s.refs.podB, s.refs.podC]);
  s.refs.podB.style.opacity = '1';
}

const STEPS = [
  {
    id: 'idle',
    duration: 1500,
    narration: 'A Service named web selects Pods with the label app=web, but the set of Pods behind it changes constantly as they come and go. Something has to keep a live list of which Pods are actually serving right now, and that list is the EndpointSlice.',
    enter(s) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      s.refs.podC.style.opacity = String(OPACITY.notready);
      setVal(s.refs.ep1, '(empty)');
      setVal(s.refs.ep2, '(empty)');
      setVal(s.refs.ep3, '(empty)');
    },
  },
  {
    id: 'selector',
    duration: 2200,
    narration: 'The Service holds only a selector, app=web, and no addresses of its own. Every Pod carrying that label is a candidate backend, here three of them, but a Pod has to be Ready before it should receive traffic. Two are Ready, one is not.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      s.refs.podC.style.opacity = String(OPACITY.notready);
      s.refs.service.classList.add('highlight');
      if (ctx.reduced) { s.refs.podABox.classList.add('highlight'); s.refs.podBBox.classList.add('highlight'); return; }
      // The Ready candidates pulse together so the selector match reads clearly.
      pulsePod(s.refs.podA, ctx, 0);
      pulsePod(s.refs.podB, ctx, 0);
    },
  },
  {
    id: 'reconcile',
    duration: 2700,
    narration: 'The EndpointSlice controller watches every matching Pod and writes the Ready ones into the slice as an IP and port, one endpoint each. So 10.244.1.5 and 10.244.2.7 are added. The third Pod is recorded too, but flagged notReady, so it stays out of the serving set.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      s.refs.podC.style.opacity = String(OPACITY.notready);
      s.refs.ctlr.classList.add('highlight');
      setVal(s.refs.ep1, '10.244.1.5:8080 · ready');
      setVal(s.refs.ep2, '10.244.2.7:8080 · ready');
      setVal(s.refs.ep3, '10.244.3.9 · notReady');
      s.refs.ep3.classList.add('highlight');
      if (ctx.reduced) { s.refs.ep1.classList.add('highlight'); s.refs.ep2.classList.add('highlight'); return; }
      pulsePod(s.refs.podA, ctx, 0);
      pulsePod(s.refs.podB, ctx, 0);
      const write = segmentPacket(s, ctx, { from: WRITE_PATH[0], to: WRITE_PATH[1], delay: BEAT.afterPulse, role: 'network' });
      // Both Ready endpoints are committed in this write and light together, so the tag names the
      // set it commits rather than a single address.
      ridingLabel(s, ctx, 'ready endpoints', WRITE_PATH, { delay: BEAT.afterPulse, easing: 'linear' });
      lightBoxAt(s.refs.ep1, ctx, write.arrivalMs);
      lightBoxAt(s.refs.ep2, ctx, write.arrivalMs);
    },
  },
  {
    id: 'readiness',
    duration: 2500,
    narration: 'Membership is gated on readiness, not liveness. When Pod 10.244.2.7 starts failing its readiness probe, the controller flips that endpoint to notReady and drops it from the serving set, so no new traffic is sent to it. The container is never restarted, and it rejoins the moment it reports Ready again.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      s.refs.podC.style.opacity = String(OPACITY.notready);
      s.refs.ctlr.classList.add('highlight');
      setVal(s.refs.ep1, '10.244.1.5:8080 · ready');
      setVal(s.refs.ep2, '10.244.2.7 · dropped (notReady)');
      setVal(s.refs.ep3, '10.244.3.9 · notReady');
      setPodSublabel(s.refs.podB, '10.244.2.7 · notReady');
      if (ctx.reduced) { s.refs.podBBox.classList.add('highlight'); s.refs.ep2.classList.add('highlight'); return; }
      // Pod B flips to notReady (it pulses through its dimmed state), the controller updates the
      // slice (one packet up), and the dropped endpoint lights to show the change.
      s.refs.podB.style.opacity = String(OPACITY.notready);
      pulsePod(s.refs.podB, ctx, 0);
      const upd = segmentPacket(s, ctx, { from: WRITE_PATH[0], to: WRITE_PATH[1], delay: BEAT.afterPulse, role: 'network' });
      ridingLabel(s, ctx, '10.244.2.7 notReady', WRITE_PATH, { delay: BEAT.afterPulse, easing: 'linear' });
      lightBoxAt(s.refs.ep2, ctx, upd.arrivalMs);
    },
  },
  {
    id: 'consume',
    duration: 2300,
    narration: 'The kube-proxy on every Node watches the EndpointSlice, never the Pods directly. When the slice changes it reprograms the Node dataplane so traffic to the Service only ever lands on a currently Ready endpoint. The slice is the contract between what is healthy and where packets go.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      s.refs.podC.style.opacity = String(OPACITY.notready);
      s.refs.podB.style.opacity = String(OPACITY.notready);
      s.refs.ep1.classList.add('highlight');
      setVal(s.refs.ep1, '10.244.1.5:8080 · ready');
      setVal(s.refs.ep2, '10.244.2.7 · dropped (notReady)');
      setVal(s.refs.ep3, '10.244.3.9 · notReady');
      if (ctx.reduced) { s.refs.kproxy.classList.add('highlight'); return; }
      // kube-proxy reads the slice (one clean hop) and lights on arrival. The ball carries a short
      // read tag so the direction of the pull reads clearly.
      const read = segmentPacket(s, ctx, { from: READ_PATH[0], to: READ_PATH[1], role: 'network' });
      ridingLabel(s, ctx, 'reads slice', READ_PATH, { easing: 'linear' });
      lightBoxAt(s.refs.kproxy, ctx, read.arrivalMs);
    },
  },
];

export const init = makeInit(Scene, STEPS, { posterFirst: true });
