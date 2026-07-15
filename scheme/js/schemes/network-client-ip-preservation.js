import { svg, g, text, line } from '../lib/svg.js';
import { arrowDefs, box, pod, arrow, animateAlong } from '../lib/primitives.js';
import { valChip, setVal, pulsePod, segmentPacket, routeDur, makeInit, clearHighlights, BEAT } from '../lib/network-kit.js';

// Preserving the client IP (viewBox 1200x640). The card answers one question: the backend Pod sees the
// proxy address on its socket, so where did the client go, and how does it come back. The flow is a
// straight left-to-right line, client -> edge proxy Pod -> backend Pod, with a header panel hanging
// above the proxy holding the two headers the edge writes. What each hop actually CARRIES is the whole
// point, so every ball wears a riding tag: the true source on the way in, the proxy source on the way
// out, then the header, then the PROXY protocol preamble.
//
// Standard contract: both Pods are shell + inner box; only Pods pulse; the client is infrastructure and
// only lights; value chips never flash; packets stop at block edges.
//
// GEOMETRY. Every wire and every packet is derived from a block edge, never hand-typed, so a block and
// the ball that rides to it cannot drift apart.
//
// Vertical: one spine, FLOW_Y, low enough that the client block (the only block on the left) clears the
// narration overlay, which really covers x 0..399, y 0..300. The client top edge is FLOW_Y - CLIENT_H/2
// = 334. The header panel is the only thing above y 300 and it lives at x >= 415, so it clears too.
//
// Horizontal: the panel is centred ON THE PROXY, since those headers are what that Pod writes, and the
// ownership line rises straight up from the proxy top centre. A 260-wide panel centred on PROXY_CX 545
// spans 415..675, clear of the overlay with 16 to spare, exactly as in the Ingress card. The row then
// spans CLIENT_X..POD_RIGHT = 40..1110 and the chip strip spans the same extent 1:1.
const FLOW_Y = 372;

const CLIENT_X = 40, CLIENT_W = 230, CLIENT_H = 76;
const CLIENT_Y = FLOW_Y - CLIENT_H / 2;        // 334, clear of the narration overlay
const CLIENT_RIGHT = CLIENT_X + CLIENT_W;      // 270

const PROXY_X = 430, PROXY_W = 230, PROXY_H = 124;
const PROXY_TOP = FLOW_Y - PROXY_H / 2;        // 310
const PROXY_RIGHT = PROXY_X + PROXY_W;         // 660
const PROXY_CX = PROXY_X + PROXY_W / 2;        // 545

const POD_X = 900, POD_W = 210, POD_H = 124;
const POD_TOP = FLOW_Y - POD_H / 2;            // 310
const POD_RIGHT = POD_X + POD_W;               // 1110

const PANEL_W = 260;
const PANEL_X = PROXY_CX - PANEL_W / 2;        // 415, clear of the narration overlay (399)
const PANEL_BOTTOM = 190;                      // bottom edge of the lower header chip
const CHIP_Y = 552;

// Each static wire and the ball that rides it share the same endpoints.
const ENTRY = [[CLIENT_RIGHT, FLOW_Y], [PROXY_X, FLOW_Y]];
const DELIVER = [[PROXY_RIGHT, FLOW_Y], [POD_X, FLOW_Y]];

function lightBoxAt(boxEl, ctx, delay = 0) {
  if (!boxEl) return;
  if (ctx.reduced || delay <= 0) { boxEl.classList.add('highlight'); return; }
  const a = boxEl.animate([{ opacity: 1 }, { opacity: 1 }], { duration: 1, delay });
  a.onfinish = () => boxEl.classList.add('highlight');
  ctx.register(a);
}

// A tag that rides ALONG with the ball on the same path, timing and easing, saying what that leg
// actually carries. It lives in the packet layer but is not a .scheme-packet, so the tools do not count
// it as a packet. Every ball on this card is a segmentPacket, which is always linear, so the tag is
// linear too or it would drift off the ball mid-flight.
function ridingLabel(s, ctx, txt, points, { delay = 0 } = {}) {
  if (ctx.reduced) return;
  const d = routeDur(points);
  const lbl = text({ class: 'scheme-box-sublabel', x: 0, y: -14, 'text-anchor': 'middle', 'data-cat': 'network' }, [txt]);
  lbl.style.opacity = '0';
  lbl.style.transform = `translate(${points[0][0]}px, ${points[0][1]}px)`;
  s.refs.packetLayer.appendChild(lbl);
  ctx.register(lbl.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 150, delay: Math.max(0, delay - 150), fill: 'forwards', easing: 'ease-out' }));
  ctx.register(animateAlong(lbl, points, { duration: d, delay, easing: 'linear' }));
  ctx.register(lbl.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 180, delay: delay + d + 140, fill: 'forwards', easing: 'ease-in' }));
}

function podBlock({ x, y, w, h, label, ip }) {
  const shell = pod({ x, y, w, h, label, sublabel: ip, containers: 0, cat: 'network' });
  const shellRect = shell.querySelector('.scheme-pod-rect');
  if (shellRect) shellRect.style.fill = 'rgba(255, 255, 255, 0.03)';
  const innerBox = box({ x: x + 20, y: y + 34, w: w - 40, h: 52, label: 'app', sublabel: 'eth0', cat: 'network' });
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
      'aria-label': 'Preserving the client IP: an edge proxy terminates the client connection and opens a new one to the backend from its own Pod address, so the backend socket no longer carries the client. The edge writes the original address into the X-Forwarded-For and Forwarded headers, which only the trusted edge hop may set, and for raw TCP or TLS passthrough it prepends a PROXY protocol preamble instead',
      'data-style': 'outline',
    });
    root.appendChild(arrowDefs());

    const panelTitle = text({ class: 'scheme-label code dim', x: PROXY_CX, y: 100, 'text-anchor': 'middle', 'font-size': 11 }, ['headers written by the edge']);
    const xffChip = valChip({ x: PANEL_X, y: 110, w: PANEL_W, h: 36, name: 'X-Forwarded-For', value: 'none', cat: 'network' });
    const fwdChip = valChip({ x: PANEL_X, y: 154, w: PANEL_W, h: 36, name: 'Forwarded', value: 'none', cat: 'network' });

    const client = box({ x: CLIENT_X, y: CLIENT_Y, w: CLIENT_W, h: CLIENT_H, label: 'Client', sublabel: '198.51.100.9', cat: 'network' });
    const proxy = podBlock({ x: PROXY_X, y: PROXY_TOP, w: PROXY_W, h: PROXY_H, label: 'Edge proxy Pod', ip: '10.244.0.9' });
    const podW = podBlock({ x: POD_X, y: POD_TOP, w: POD_W, h: POD_H, label: 'Pod web', ip: '10.244.2.7' });

    const entryWire = arrow({ x1: ENTRY[0][0], y1: ENTRY[0][1], x2: ENTRY[1][0], y2: ENTRY[1][1], dashed: true, dim: true, color: 'network' });
    const deliverWire = arrow({ x1: DELIVER[0][0], y1: DELIVER[0][1], x2: DELIVER[1][0], y2: DELIVER[1][1], dashed: true, dim: true, color: 'network' });
    // Ownership marker, NOT a traffic path: the proxy is what writes these headers. No packet ever
    // travels it, so it is a plain dashed line with NO arrowhead, to read as an association rather than
    // a wire missing its ball.
    const panelWire = line({ class: 'scheme-arrow scheme-arrow-dashed scheme-arrow-dim scheme-arrow-network', x1: PROXY_CX, y1: PROXY_TOP, x2: PROXY_CX, y2: PANEL_BOTTOM, 'stroke-dasharray': '5 5', fill: 'none' });

    // The four chips span the scheme 1:1, from the Client left edge to the backend Pod right edge, with
    // even 20px gaps. Widths are tuned to their content. What the backend sees is an OUTCOME of a
    // request, so those three read none until traffic actually flows. The edge mode is a property of the
    // setup, so it is true from the start.
    const srcChip   = valChip({ x: CLIENT_X, y: CHIP_Y, w: 300, h: 34, name: 'src at backend', value: 'none', cat: 'network' });
    const readsChip = valChip({ x: 360, y: CHIP_Y, w: 220, h: 34, name: 'app reads', value: 'none', cat: 'network' });
    const modeChip  = valChip({ x: 600, y: CHIP_Y, w: 260, h: 34, name: 'edge mode', value: 'L7 proxy', cat: 'network' });
    const ipChip    = valChip({ x: 880, y: CHIP_Y, w: POD_RIGHT - 880, h: 34, name: 'client IP', value: 'unknown', cat: 'network' });

    const packetLayer = g({ id: 'packetLayer' });

    // Z-order: body blocks, then wires + panel above them, then chips, then the packet layer with its
    // riding tags on top.
    root.appendChild(client);
    root.appendChild(proxy.group);
    root.appendChild(podW.group);
    [entryWire, deliverWire, panelWire, panelTitle].forEach(el => root.appendChild(el));
    [xffChip, fwdChip, srcChip, readsChip, modeChip, ipChip].forEach(c => root.appendChild(c));
    root.appendChild(packetLayer);

    this.host.appendChild(root);
    this.refs = {
      svg: root, client, proxy: proxy.group, proxyBox: proxy.innerBox,
      podW: podW.group, podWBox: podW.innerBox,
      xffChip, fwdChip, srcChip, readsChip, modeChip, ipChip,
      packetLayer,
    };
  }

  reset() { this.build(); }
}

// The inner app boxes (proxyBox/podWBox) are listed so their .highlight is cleared every step:
// clearPodHighlight only resets inline strokes, so without them a highlight set in a reduced-replay
// block leaks into later steps, since reduced replay never runs the forward motion path.
function clearHL(s) {
  clearHighlights(s, ['client', 'xffChip', 'fwdChip', 'srcChip', 'readsChip', 'modeChip', 'ipChip', 'proxyBox', 'podWBox'], [s.refs.proxy, s.refs.podW]);
}

const STEPS = [
  {
    id: 'idle',
    duration: 1500,
    narration: 'A packet only ever carries the address of its last hop, so by the time a request reaches a Pod the original client address can already be gone. At the edge there are two ways to carry it through anyway, one for HTTP and one for everything else.',
    enter(s) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      setVal(s.refs.xffChip, 'none');
      setVal(s.refs.fwdChip, 'none');
      setVal(s.refs.srcChip, 'none');
      setVal(s.refs.readsChip, 'none');
      setVal(s.refs.modeChip, 'L7 proxy');
      setVal(s.refs.ipChip, 'unknown');
    },
  },
  {
    id: 'arrive',
    duration: 2400,
    narration: 'The client opens the connection to the edge, an Ingress or Gateway proxy Pod. On this leg the source address is still the real one, 198.51.100.9, so the edge is the last place on the path that sees the client without having to be told.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      setVal(s.refs.xffChip, 'none');
      setVal(s.refs.fwdChip, 'none');
      setVal(s.refs.srcChip, 'none');
      setVal(s.refs.readsChip, 'none');
      setVal(s.refs.modeChip, 'L7 proxy');
      setVal(s.refs.ipChip, 'seen at the edge');
      s.refs.client.classList.add('highlight');
      s.refs.ipChip.classList.add('highlight');
      if (ctx.reduced) { s.refs.proxyBox.classList.add('highlight'); return; }
      // Down-arrow: the request arrives at the proxy Pod, which pulses on arrival. The true source
      // rides with the ball, because that is what this leg still carries.
      const inb = segmentPacket(s, ctx, { from: ENTRY[0], to: ENTRY[1], cat: 'network' });
      ridingLabel(s, ctx, 'src 198.51.100.9', ENTRY);
      pulsePod(s.refs.proxy, ctx, inb.arrivalMs);
    },
  },
  {
    id: 'reproxy',
    duration: 2800,
    narration: 'The proxy terminates that connection and opens a brand new one to the backend, out of its own Pod address. The packet the app receives has source 10.244.0.9, the proxy, and nothing in it mentions the client. Read from the socket, the client address is simply lost.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      setVal(s.refs.xffChip, 'none');
      setVal(s.refs.fwdChip, 'none');
      setVal(s.refs.srcChip, 'proxy 10.244.0.9');
      setVal(s.refs.readsChip, 'socket');
      setVal(s.refs.modeChip, 'L7 proxy');
      setVal(s.refs.ipChip, 'lost');
      s.refs.srcChip.classList.add('highlight');
      s.refs.readsChip.classList.add('highlight');
      s.refs.ipChip.classList.add('highlight');
      if (ctx.reduced) { s.refs.podWBox.classList.add('highlight'); return; }
      // Up-arrow, the proxy is the sender: it pulses FIRST as it opens the new connection, and only then
      // does the proxied request leave, carrying the proxy address as its source. The backend pulses on
      // arrival.
      pulsePod(s.refs.proxy, ctx, 0);
      const out = segmentPacket(s, ctx, { from: DELIVER[0], to: DELIVER[1], delay: BEAT.afterPulse, cat: 'network' });
      ridingLabel(s, ctx, 'src 10.244.0.9 (proxy)', DELIVER, { delay: BEAT.afterPulse });
      pulsePod(s.refs.podW, ctx, out.arrivalMs);
    },
  },
  {
    id: 'xff',
    duration: 2800,
    narration: 'So the edge writes the address down instead. Before proxying it adds X-Forwarded-For with the client address, and the standard Forwarded header carries the same value. The socket still says 10.244.0.9, but the application reads the header and logs the real client.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      setVal(s.refs.xffChip, '198.51.100.9');
      setVal(s.refs.fwdChip, 'for=198.51.100.9');
      setVal(s.refs.srcChip, 'proxy 10.244.0.9');
      setVal(s.refs.readsChip, 'header');
      setVal(s.refs.modeChip, 'L7 proxy');
      setVal(s.refs.ipChip, 'recovered');
      s.refs.xffChip.classList.add('highlight');
      s.refs.fwdChip.classList.add('highlight');
      s.refs.readsChip.classList.add('highlight');
      s.refs.ipChip.classList.add('highlight');
      if (ctx.reduced) { s.refs.podWBox.classList.add('highlight'); return; }
      // Same up-arrow as the previous step, but now the request the proxy sends carries the header, so
      // that is what rides the ball. The backend pulses on arrival.
      pulsePod(s.refs.proxy, ctx, 0);
      const out = segmentPacket(s, ctx, { from: DELIVER[0], to: DELIVER[1], delay: BEAT.afterPulse, cat: 'network' });
      ridingLabel(s, ctx, 'X-Forwarded-For: 198.51.100.9', DELIVER, { delay: BEAT.afterPulse });
      pulsePod(s.refs.podW, ctx, out.arrivalMs);
    },
  },
  {
    id: 'trust',
    duration: 2600,
    narration: 'A header is only data, and a client can send an X-Forwarded-For of its own to claim any address it likes. That is why the edge overwrites the header rather than appending to whatever arrived, and why an app should believe the value only when it comes from a proxy it trusts. Behind two proxies the header becomes a list, and only the hop written by your own edge can be trusted.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      // Short by necessity: the chip name is the longest on the card, so a value beyond ~12 characters
      // collides with it. "rewritten" is the whole point anyway: the forged claim did not survive.
      setVal(s.refs.xffChip, 'rewritten');
      setVal(s.refs.fwdChip, 'for=198.51.100.9');
      setVal(s.refs.srcChip, 'proxy 10.244.0.9');
      setVal(s.refs.readsChip, 'header');
      setVal(s.refs.modeChip, 'L7 proxy');
      setVal(s.refs.ipChip, 'trust the edge');
      s.refs.client.classList.add('highlight');
      s.refs.xffChip.classList.add('highlight');
      s.refs.ipChip.classList.add('highlight');
      if (ctx.reduced) { s.refs.proxyBox.classList.add('highlight'); return; }
      // Down-arrow: the client sends its own forged header, and the proxy pulses as it receives it and
      // overwrites the value. The forged claim is what rides the ball, so the spoof is literal traffic.
      const inb = segmentPacket(s, ctx, { from: ENTRY[0], to: ENTRY[1], cat: 'network' });
      ridingLabel(s, ctx, 'X-Forwarded-For: 1.2.3.4', ENTRY);
      pulsePod(s.refs.proxy, ctx, inb.arrivalMs);
    },
  },
  {
    id: 'passthrough',
    duration: 2800,
    narration: 'Not every protocol has a header to write into. With raw TCP, or with TLS passed through untouched, the edge cannot add anything to the payload. The PROXY protocol solves it by prepending a short preamble ahead of the first bytes, carrying the original source and destination, and the backend has to be configured to expect it or it reads that preamble as part of the request. At layer 4 there is one more option: externalTrafficPolicy Local keeps the real source on the packet itself, with no header and no preamble.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      // A raw TCP stream carries no headers, so the panel goes back to none and stays unlit: this mode
      // recovers the address a different way.
      setVal(s.refs.xffChip, 'none');
      setVal(s.refs.fwdChip, 'none');
      setVal(s.refs.srcChip, 'proxy 10.244.0.9');
      setVal(s.refs.readsChip, 'preamble');
      setVal(s.refs.modeChip, 'TCP passthrough');
      setVal(s.refs.ipChip, 'recovered');
      s.refs.modeChip.classList.add('highlight');
      s.refs.readsChip.classList.add('highlight');
      s.refs.ipChip.classList.add('highlight');
      if (ctx.reduced) { s.refs.podWBox.classList.add('highlight'); return; }
      // Up-arrow again: the proxy pulses as it prepends the preamble, then the stream leaves carrying it
      // and the backend pulses on arrival.
      pulsePod(s.refs.proxy, ctx, 0);
      const out = segmentPacket(s, ctx, { from: DELIVER[0], to: DELIVER[1], delay: BEAT.afterPulse, cat: 'network' });
      ridingLabel(s, ctx, 'PROXY TCP4 198.51.100.9', DELIVER, { delay: BEAT.afterPulse });
      pulsePod(s.refs.podW, ctx, out.arrivalMs);
    },
  },
];

export const init = makeInit(Scene, STEPS, { posterFirst: true });
