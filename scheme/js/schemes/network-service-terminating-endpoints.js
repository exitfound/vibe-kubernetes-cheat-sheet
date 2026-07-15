import { svg, g, text } from '../lib/svg.js';
import { arrowDefs, box, pod, arrow, pathArrow, animateAlong } from '../lib/primitives.js';
import { valChip, setVal, setPodSublabel, pulsePod, segmentPacket, routePacket, routeDur, makeInit, clearHighlights, BEAT, FADE } from '../lib/network-kit.js';

// Terminating endpoints and connection draining during a rollout (viewBox 1200x640). This is the
// story of the few seconds while a backing Pod shuts down, and why a clean rollout drops nothing.
// Layout: the Client sits left on the center line facing kube-proxy in the middle, and two backend
// Pods sit on the right, web-a (stays Ready, top) and web-c (the one being retired, bottom). Two
// right-angle fans run from kube-proxy to each Pod (entering the Pod at 90). The bottom chip strip is the endpoint state that
// actually drives routing: web-c endpoint conditions (ready / serving / terminating), where new
// connections are allowed to land, and the grace-period window.
//
// Standard contract: Pods are shell + inner box and pulse as one, kube-proxy is infrastructure (it
// lights, never pulses), value chips never flash (they light via lightBoxAt or carry .highlight as
// durable state). What MOVES rides on the ball: each hop tags itself new conn or in-flight via
// ridingLabel, so there is no inline wire text to collide with the boxes. web-c dims as it leaves
// the serving set but keeps a serving flow during the drain window.
const FLOW_Y = 326;                     // center line: client and kube-proxy are centred on it
const CLIENT_EDGE = 255;                // right edge of the client Pod shell
const KP_LEFT = 440, KP_RIGHT = 660;    // kube-proxy box left / right edges
const POD_LEFT = 880, POD_W = 210, POD_H = 104;
// Backends are the exact vertical mirror of each other about FLOW_Y (326 +/- 158), so both sit
// symmetric above and below the kube-proxy block.
const PODA_CY = 168, PODC_CY = 484;
const BUS_X = 770;                       // shared vertical bus: the fans turn here so each one enters
                                         // its Pod horizontally, a right-angle approach not a diagonal
const PULSE_MS = 900;                    // PULSE_POD.ms: web-c fades only after its pulse completes
const DIM = 0.5;                         // single dim level for web-c once it is terminating: one shade
                                         // across every step so the fade never reads as a new state
// Each static wire and its moving ball share the exact same array. The fans are right-angle routes:
// out of kube-proxy horizontally, up or down the shared bus, then straight into the Pod left edge at 90.
const LANE  = [[CLIENT_EDGE, FLOW_Y], [KP_LEFT, FLOW_Y]];                                              // client -> kube-proxy
const FAN_A = [[KP_RIGHT, FLOW_Y - 14], [BUS_X, FLOW_Y - 14], [BUS_X, PODA_CY], [POD_LEFT, PODA_CY]];  // kube-proxy -> web-a
const FAN_C = [[KP_RIGHT, FLOW_Y + 14], [BUS_X, FLOW_Y + 14], [BUS_X, PODC_CY], [POD_LEFT, PODC_CY]];  // kube-proxy -> web-c

function lightBoxAt(boxEl, ctx, delay = 0) {
  if (!boxEl) return;
  if (ctx.reduced || delay <= 0) { boxEl.classList.add('highlight'); return; }
  const a = boxEl.animate([{ opacity: 1 }, { opacity: 1 }], { duration: 1, delay });
  a.onfinish = () => boxEl.classList.add('highlight');
  ctx.register(a);
}

// A small label that rides ALONG with the ball on the same path, timing and easing, tagging it with
// the flow class the step narrates (new conn or in-flight). It lives in the packet layer but is not a
// .scheme-packet, so it does not count as a packet to the tools. dur omitted => routeDur(points),
// matching a ball that also omits dur. Pass easing:'linear' so the tag stays locked to the linear ball.
function ridingLabel(s, ctx, txt, points, { delay = 0, dur = null, easing = 'linear' } = {}) {
  if (ctx.reduced) return;
  const d = dur == null ? routeDur(points) : dur;
  const lbl = text({ class: 'scheme-box-sublabel', x: 0, y: -14, 'text-anchor': 'middle', 'data-cat': 'network' }, [txt]);
  lbl.style.opacity = '0';
  s.refs.packetLayer.appendChild(lbl);
  ctx.register(lbl.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 150, delay: Math.max(0, delay - 150), fill: 'forwards', easing: 'ease-out' }));
  ctx.register(animateAlong(lbl, points, { duration: d, delay, easing }));
  ctx.register(lbl.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 180, delay: delay + d + 160, fill: 'forwards', easing: 'ease-in' }));
}

function podBlock({ x, y, w, h, label, ip }) {
  const shell = pod({ x, y, w, h, label, sublabel: ip, containers: 0, cat: 'network' });
  const shellRect = shell.querySelector('.scheme-pod-rect');
  if (shellRect) shellRect.style.fill = 'rgba(255, 255, 255, 0.03)';
  const innerBox = box({ x: x + 20, y: y + 30, w: w - 40, h: 48, label: 'app', sublabel: 'eth0', cat: 'network' });
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
      'aria-label': 'Terminating endpoints and connection draining: when a backing Pod is deleted its endpoint is flagged terminating so kube-proxy stops sending new connections to it while in-flight connections keep draining through the grace period, then the endpoint is removed',
      'data-style': 'outline',
    });
    root.appendChild(arrowDefs());

    const client = podBlock({ x: 70, y: 270, w: 185, h: 112, label: 'Client Pod', ip: '10.244.1.5' });
    const kproxy = box({ x: KP_LEFT, y: 286, w: KP_RIGHT - KP_LEFT, h: 80, label: 'kube-proxy', sublabel: 'routes new connections', cat: 'network' });
    const podA = podBlock({ x: POD_LEFT, y: PODA_CY - POD_H / 2, w: POD_W, h: POD_H, label: 'Pod web-a', ip: '10.244.1.5 · ready' });
    const podC = podBlock({ x: POD_LEFT, y: PODC_CY - POD_H / 2, w: POD_W, h: POD_H, label: 'Pod web-c', ip: '10.244.3.9 · ready' });

    const laneWire = arrow({ x1: LANE[0][0], y1: LANE[0][1], x2: LANE[1][0], y2: LANE[1][1], dashed: true, dim: true, color: 'network' });
    const fanAWire = pathArrow({ points: FAN_A, dashed: true, dim: true, color: 'network' });
    const fanCWire = pathArrow({ points: FAN_C, dashed: true, dim: true, color: 'network' });

    // The three chips span the block width: web-c endpoint conditions (the state that drives routing),
    // where new connections may land, and the grace-period window.
    const condChip  = valChip({ x: 70,  y: 566, w: 340, h: 34, name: 'endpoint web-c', value: 'ready · serving', cat: 'network' });
    const newChip   = valChip({ x: 430, y: 566, w: 290, h: 34, name: 'new conns', value: 'web-a and web-c', cat: 'network' });
    const graceChip = valChip({ x: 740, y: 566, w: 390, h: 34, name: 'grace period', value: 'not draining', cat: 'network' });

    const packetLayer = g({ id: 'packetLayer' });

    // Z-order: boxes/pods, then wires ABOVE them, then chips, then the packet layer on top.
    root.appendChild(kproxy);
    root.appendChild(client.group);
    root.appendChild(podA.group);
    root.appendChild(podC.group);
    [laneWire, fanAWire, fanCWire].forEach(el => root.appendChild(el));
    [condChip, newChip, graceChip].forEach(c => root.appendChild(c));
    root.appendChild(packetLayer);

    this.host.appendChild(root);
    this.refs = {
      svg: root, kproxy, client: client.group, clientBox: client.innerBox,
      podA: podA.group, podABox: podA.innerBox, podC: podC.group, podCBox: podC.innerBox,
      condChip, newChip, graceChip,
      packetLayer,
    };
  }

  reset() { this.build(); }
}

function clearHL(s) {
  // Inner app boxes are listed so a .highlight set in a reduced-replay block does not leak into later
  // steps. Both backend opacities reset to 1 so a dim set by an earlier step does not persist.
  clearHighlights(s, ['kproxy', 'condChip', 'newChip', 'graceChip', 'clientBox', 'podABox', 'podCBox'], [s.refs.client, s.refs.podA, s.refs.podC]);
  s.refs.podA.style.opacity = '1';
  s.refs.podC.style.opacity = '1';
}

const STEPS = [
  {
    id: 'idle',
    duration: 1500,
    narration: 'The web Service is backed by two Ready Pods, and a rolling update is about to retire one of them. The real question is what happens to traffic in the seconds while that Pod shuts down, so that nothing gets dropped.',
    enter(s) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      setVal(s.refs.condChip, 'ready · serving');
      setVal(s.refs.newChip, 'web-a and web-c');
      setVal(s.refs.graceChip, 'not draining');
      setPodSublabel(s.refs.podC, '10.244.3.9 · ready');
    },
  },
  {
    id: 'steady',
    duration: 3000,
    narration: 'Both Pods are Ready endpoints in the slice, so kube-proxy spreads new connections across the two of them. This is the normal state, before anything starts to change.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      s.refs.kproxy.classList.add('highlight');
      setVal(s.refs.condChip, 'ready · serving');
      setVal(s.refs.newChip, 'web-a and web-c');
      setVal(s.refs.graceChip, 'not draining');
      if (ctx.reduced) { s.refs.clientBox.classList.add('highlight'); s.refs.podABox.classList.add('highlight'); s.refs.podCBox.classList.add('highlight'); return; }
      // Up-arrow: the client pulses, one packet runs the lane to kube-proxy, then both fans fire so the
      // two backends light together and the balancing across both endpoints reads clearly.
      pulsePod(s.refs.client, ctx, 0);
      const send = segmentPacket(s, ctx, { from: LANE[0], to: LANE[1], delay: BEAT.afterPulse, cat: 'network' });
      ridingLabel(s, ctx, 'new conn', LANE, { delay: BEAT.afterPulse });
      const giveA = routePacket(s, ctx, FAN_A, { delay: send.arrivalMs + BEAT.afterHop, cat: 'network' });
      const giveC = routePacket(s, ctx, FAN_C, { delay: send.arrivalMs + BEAT.afterHop, cat: 'network' });
      pulsePod(s.refs.podA, ctx, giveA.arrivalMs);
      pulsePod(s.refs.podC, ctx, giveC.arrivalMs);
    },
  },
  {
    id: 'terminate',
    duration: 2400,
    narration: 'The rollout deletes Pod web-c. The kubelet sends it SIGTERM and runs its preStop hook, but the container does not vanish at once. It enters Terminating and keeps serving whatever it is already handling.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      setVal(s.refs.condChip, 'terminating · serving');
      setVal(s.refs.newChip, 'web-a and web-c');
      setVal(s.refs.graceChip, 'terminationGracePeriod 30s');
      setPodSublabel(s.refs.podC, '10.244.3.9 · terminating');
      // Static end-state: web-c has taken the signal and dimmed out of the normal set.
      s.refs.podC.style.opacity = String(DIM);
      if (ctx.reduced) { s.refs.podCBox.classList.add('highlight'); return; }
      // web-c starts calm at full opacity, pulses as it receives SIGTERM, THEN fades out to the dimmed
      // end-state (pulse first, dim after, never the reverse). No packet on this step.
      s.refs.podC.style.opacity = '1';
      pulsePod(s.refs.podC, ctx, 0);
      ctx.register(s.refs.podC.animate([{ opacity: 1 }, { opacity: DIM }], { duration: FADE.out, delay: PULSE_MS, fill: 'forwards', easing: 'ease-in' }));
    },
  },
  {
    id: 'condition',
    duration: 2600,
    narration: 'Almost at once the EndpointSlice controller flips that endpoint: ready becomes false while serving and terminating stay true. kube-proxy reads the change and stops handing NEW connections to web-c, so fresh traffic now goes to web-a only.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      s.refs.kproxy.classList.add('highlight');
      setVal(s.refs.condChip, 'notReady · serving');
      setVal(s.refs.newChip, 'web-a only');
      setVal(s.refs.graceChip, 'terminationGracePeriod 30s');
      setPodSublabel(s.refs.podC, '10.244.3.9 · terminating');
      // web-c is out of the new-connection set: keep it dim at the shared DIM level.
      s.refs.podC.style.opacity = String(DIM);
      if (ctx.reduced) { s.refs.clientBox.classList.add('highlight'); s.refs.podABox.classList.add('highlight'); return; }
      // A new connection now lands on web-a only: client pulses, packet runs the lane then the web-a
      // fan, and web-a pulses on arrival. No ball goes to web-c, which is the whole point.
      pulsePod(s.refs.client, ctx, 0);
      const send = segmentPacket(s, ctx, { from: LANE[0], to: LANE[1], delay: BEAT.afterPulse, cat: 'network' });
      ridingLabel(s, ctx, 'new conn', LANE, { delay: BEAT.afterPulse });
      const giveA = routePacket(s, ctx, FAN_A, { delay: send.arrivalMs + BEAT.afterHop, cat: 'network' });
      ridingLabel(s, ctx, 'to web-a', FAN_A, { delay: send.arrivalMs + BEAT.afterHop, easing: 'ease-in-out' });
      pulsePod(s.refs.podA, ctx, giveA.arrivalMs);
    },
  },
  {
    id: 'drain',
    duration: 4600,
    narration: 'The connection already established on web-c is not cut. With terminating endpoints kube-proxy keeps forwarding that in-flight flow to web-c for the grace window, while every new connection lands on web-a. That overlap is what lets a rollout finish without dropped requests.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      s.refs.kproxy.classList.add('highlight');
      setVal(s.refs.condChip, 'notReady · draining');
      setVal(s.refs.newChip, 'web-a only');
      setVal(s.refs.graceChip, 'draining in grace window');
      setPodSublabel(s.refs.podC, '10.244.3.9 · terminating');
      s.refs.podC.style.opacity = String(DIM);
      if (ctx.reduced) { s.refs.podCBox.classList.add('highlight'); s.refs.podABox.classList.add('highlight'); s.refs.clientBox.classList.add('highlight'); return; }
      // Two flows at once. The in-flight connection keeps draining to web-c (a packet on the web-c fan,
      // web-c pulses through its dimmed state on arrival). As it lands, a fresh connection starts from
      // the client, runs the lane and the web-a fan, and web-a pulses. New and in-flight, side by side.
      const drain = routePacket(s, ctx, FAN_C, { delay: 0, cat: 'network' });
      ridingLabel(s, ctx, 'in-flight', FAN_C, { delay: 0, easing: 'ease-in-out' });
      pulsePod(s.refs.podC, ctx, drain.arrivalMs);
      const startNew = drain.arrivalMs + BEAT.afterHop;
      pulsePod(s.refs.client, ctx, startNew);
      const send = segmentPacket(s, ctx, { from: LANE[0], to: LANE[1], delay: startNew + BEAT.afterPulse, cat: 'network' });
      ridingLabel(s, ctx, 'new conn', LANE, { delay: startNew + BEAT.afterPulse });
      const giveA = routePacket(s, ctx, FAN_A, { delay: send.arrivalMs + BEAT.afterHop, cat: 'network' });
      ridingLabel(s, ctx, 'to web-a', FAN_A, { delay: send.arrivalMs + BEAT.afterHop, easing: 'ease-in-out' });
      pulsePod(s.refs.podA, ctx, giveA.arrivalMs);
    },
  },
  {
    id: 'gone',
    duration: 2600,
    narration: 'When the grace period ends web-c exits, the controller removes its endpoint from the slice, and the replacement Pod started by the ReplicaSet is already Ready in its place. Traffic carried on throughout, and no client saw a reset.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      s.refs.kproxy.classList.add('highlight');
      setVal(s.refs.condChip, 'removed');
      setVal(s.refs.newChip, 'web-a + replica');
      setVal(s.refs.graceChip, 'grace elapsed');
      setPodSublabel(s.refs.podC, '10.244.3.9 · terminated');
      // web-c is gone: hold the same DIM shade as the terminating steps (the removal reads from the
      // chip and sublabel, not from a darker fade, so the dim never changes tone between steps).
      s.refs.podC.style.opacity = String(DIM);
      if (ctx.reduced) { s.refs.clientBox.classList.add('highlight'); s.refs.podABox.classList.add('highlight'); return; }
      // Service carries on: a new connection lands on web-a and it pulses on arrival.
      pulsePod(s.refs.client, ctx, 0);
      const send = segmentPacket(s, ctx, { from: LANE[0], to: LANE[1], delay: BEAT.afterPulse, cat: 'network' });
      ridingLabel(s, ctx, 'new conn', LANE, { delay: BEAT.afterPulse });
      const giveA = routePacket(s, ctx, FAN_A, { delay: send.arrivalMs + BEAT.afterHop, cat: 'network' });
      pulsePod(s.refs.podA, ctx, giveA.arrivalMs);
    },
  },
];

export const init = makeInit(Scene, STEPS, { posterFirst: true });
