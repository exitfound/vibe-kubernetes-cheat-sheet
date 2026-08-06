import { g, text } from '../../lib/svg.js';
import { arrowDefs, box, arrow, podShell } from '../../lib/primitives.js';
import { valChip, setVal, pulsePod, segmentPacket, makeInit, clearHighlights, clearWires, relationPath, BEAT, makeRidingLabel, wrapPod, diagramRoot } from './network-kit.js';
// Design notes for this card: ./CARDS.md#network-client-ip-preservation


// The content band is symmetric about the canvas centre by construction, so the flow row and the
// chip strip both centre on 600 without anything being stretched to make them.
const CONTENT_L = 65, CONTENT_R = 1135;         // midpoint 600, the canvas centre
// Narration panel measured at bottom <= 355 over 1600x1000 / 1280x860 / 1100x800, the deepest
// in networking. FLOW_Y clears it, so a longer narration invalidates the row placement.
const FLOW_Y = 410;                            // Client top lands at 372, clear of the panel

const CLIENT_X = CONTENT_L, CLIENT_W = 230, CLIENT_H = 76;
const CLIENT_Y = FLOW_Y - CLIENT_H / 2;        // 372, below the narration panel
const CLIENT_RIGHT = CLIENT_X + CLIENT_W;      // 295

const PROXY_X = 455, PROXY_W = 230, PROXY_H = 124;
const PROXY_TOP = FLOW_Y - PROXY_H / 2;        // 348
const PROXY_RIGHT = PROXY_X + PROXY_W;         // 685
const PROXY_CX = PROXY_X + PROXY_W / 2;        // 570

const POD_W = 210, POD_H = 124;
const POD_X = CONTENT_R - POD_W;               // 925
const POD_TOP = FLOW_Y - POD_H / 2;            // 348, and the Pod right edge is CONTENT_R 1135

const PANEL_W = 260;
const PANEL_X = PROXY_CX - PANEL_W / 2;        // 440, clear of the narration panel edge (397)
const PANEL_BOTTOM = 190;                      // bottom edge of the lower header chip
const CHIP_Y = 552;

// Four chips spanning CONTENT_L..CONTENT_R, so the strip centres on 600 by construction.
const CHIP_GAP = 20, CHIP_H = 34;
const CHIP_WS = [300, 220, 250, 240];          // sums with the gaps to CONTENT_R - CONTENT_L
const CHIP_X = i => CONTENT_L + CHIP_WS.slice(0, i).reduce((a, w) => a + w + CHIP_GAP, 0);

// Each static wire and the ball that rides it share the same endpoints.
const ENTRY = [[CLIENT_RIGHT, FLOW_Y], [PROXY_X, FLOW_Y]];
const DELIVER = [[PROXY_RIGHT, FLOW_Y], [POD_X, FLOW_Y]];

// The tag that rides a ball here. Every ball on this card is a linear segmentPacket, so the tag
// rides LINEAR too: the eased default drifts off its ball mid-flight and rejoins at the ends.
const ridingLabel = makeRidingLabel({ role: 'network', hold: 140, easing: 'linear' });

function podBlock({ x, y, w, h, label, ip }) {
  const shell = podShell({ x, y, w, h, label, sublabel: ip, containers: 0, role: 'network' });
  const innerBox = box({ x: x + 20, y: y + 34, w: w - 40, h: 52, label: 'app', sublabel: 'eth0', role: 'network' });
  return wrapPod(shell, innerBox);
}

class Scene {
  constructor(host) { this.host = host; this.refs = {}; this.build(); }

  build() {
    this.host.replaceChildren();
    this.refs = {};
    const root = diagramRoot({ 'aria-label': 'Preserving the client IP: an edge proxy terminates the client connection and opens a new one to the backend from its own Pod address, so the backend socket no longer carries the client. The edge writes the original address into the X-Forwarded-For and Forwarded headers, which only the trusted edge hop may set, and for raw TCP or TLS passthrough it prepends a PROXY protocol preamble instead' });
    root.appendChild(arrowDefs());

    const panelTitle = text({ class: 'scheme-label code dim', x: PROXY_CX, y: 100, 'text-anchor': 'middle' }, ['headers written by the edge']);
    const xffChip = valChip({ x: PANEL_X, y: 110, w: PANEL_W, h: 36, name: 'X-Forwarded-For', value: 'none', role: 'network' });
    const fwdChip = valChip({ x: PANEL_X, y: 154, w: PANEL_W, h: 36, name: 'Forwarded', value: 'none', role: 'network' });

    const client = box({ x: CLIENT_X, y: CLIENT_Y, w: CLIENT_W, h: CLIENT_H, label: 'Client', sublabel: '198.51.100.9', role: 'network' });
    const proxy = podBlock({ x: PROXY_X, y: PROXY_TOP, w: PROXY_W, h: PROXY_H, label: 'Edge proxy Pod', ip: '10.244.0.9' });
    const podW = podBlock({ x: POD_X, y: POD_TOP, w: POD_W, h: POD_H, label: 'Pod web', ip: '10.244.2.7' });

    const entryWire = arrow({ x1: ENTRY[0][0], y1: ENTRY[0][1], x2: ENTRY[1][0], y2: ENTRY[1][1], dashed: true, dim: true, role: 'network' });
    const deliverWire = arrow({ x1: DELIVER[0][0], y1: DELIVER[0][1], x2: DELIVER[1][0], y2: DELIVER[1][1], dashed: true, dim: true, role: 'network' });
    const panelWire = relationPath({ points: [[PROXY_CX, PROXY_TOP], [PROXY_CX, PANEL_BOTTOM]], role: 'network', dash: '5 5' });

    const srcChip   = valChip({ x: CHIP_X(0), y: CHIP_Y, w: CHIP_WS[0], h: CHIP_H, name: 'src at backend', value: 'none', role: 'network' });
    const readsChip = valChip({ x: CHIP_X(1), y: CHIP_Y, w: CHIP_WS[1], h: CHIP_H, name: 'app reads', value: 'none', role: 'network' });
    const modeChip  = valChip({ x: CHIP_X(2), y: CHIP_Y, w: CHIP_WS[2], h: CHIP_H, name: 'edge mode', value: 'L7 proxy', role: 'network' });
    const ipChip    = valChip({ x: CHIP_X(3), y: CHIP_Y, w: CHIP_WS[3], h: CHIP_H, name: 'client IP', value: 'unknown', role: 'network' });

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

function setChips(s, { xff, fwd, src, reads, mode, podIp }) {
  setVal(s.refs.xffChip, xff);
  setVal(s.refs.fwdChip, fwd);
  setVal(s.refs.srcChip, src);
  setVal(s.refs.readsChip, reads);
  setVal(s.refs.modeChip, mode);
  setVal(s.refs.ipChip, podIp);
}

function resetStep(s) {
  s.refs.packetLayer.replaceChildren();
  clearHighlights(s, ['client', 'xffChip', 'fwdChip', 'srcChip', 'readsChip', 'modeChip', 'ipChip', 'proxyBox', 'podWBox'], [s.refs.proxy, s.refs.podW]);
  clearWires(s);
}

const STEPS = [
  {
    id: 'idle',
    duration: 1500,
    enter(s) {
      resetStep(s);
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
      resetStep(s);
      setChips(s, { xff: 'none', fwd: 'none', src: 'none', reads: 'none', mode: 'L7 proxy', podIp: 'seen at the edge' });
      s.refs.client.classList.add('highlight');
      s.refs.ipChip.classList.add('highlight');
      if (ctx.reduced) { s.refs.proxyBox.classList.add('highlight'); return; }
      // Down-arrow: the request arrives at the proxy Pod, which pulses on arrival. The true source
      // rides with the ball, because that is what this leg still carries.
      const inb = segmentPacket(s, ctx, { from: ENTRY[0], to: ENTRY[1], role: 'network' });
      ridingLabel(s, ctx, 'src 198.51.100.9', ENTRY);
      pulsePod(s.refs.proxy, ctx, inb.arrivalMs);
    },
  },
  {
    id: 'reproxy',
    duration: 2800,
    narration: 'The proxy terminates that connection and opens a brand new one to the backend, out of its own Pod address. The packet the app receives has source 10.244.0.9, the proxy, and nothing in it mentions the client. Read from the socket, the client address is simply lost.',
    enter(s, ctx) {
      resetStep(s);
      setChips(s, { xff: 'none', fwd: 'none', src: 'proxy 10.244.0.9', reads: 'socket', mode: 'L7 proxy', podIp: 'lost' });
      s.refs.srcChip.classList.add('highlight');
      s.refs.readsChip.classList.add('highlight');
      s.refs.ipChip.classList.add('highlight');
      if (ctx.reduced) { s.refs.podWBox.classList.add('highlight'); return; }
      pulsePod(s.refs.proxy, ctx, 0);
      const out = segmentPacket(s, ctx, { from: DELIVER[0], to: DELIVER[1], delay: BEAT.afterPulse, role: 'network' });
      ridingLabel(s, ctx, 'src 10.244.0.9 (proxy)', DELIVER, { delay: BEAT.afterPulse });
      pulsePod(s.refs.podW, ctx, out.arrivalMs);
    },
  },
  {
    id: 'xff',
    duration: 2800,
    narration: 'So the edge writes the address down instead. Before proxying it adds X-Forwarded-For with the client address, and the standard Forwarded header carries the same value. The socket still says 10.244.0.9, but the application reads the header and logs the real client.',
    enter(s, ctx) {
      resetStep(s);
      setChips(s, { xff: '198.51.100.9', fwd: 'for=198.51.100.9', src: 'proxy 10.244.0.9', reads: 'header', mode: 'L7 proxy', podIp: 'recovered' });
      s.refs.xffChip.classList.add('highlight');
      s.refs.fwdChip.classList.add('highlight');
      s.refs.readsChip.classList.add('highlight');
      s.refs.ipChip.classList.add('highlight');
      if (ctx.reduced) { s.refs.podWBox.classList.add('highlight'); return; }
      // Same up-arrow as the previous step, but now the request the proxy sends carries the header, so
      // that is what rides the ball. The backend pulses on arrival.
      pulsePod(s.refs.proxy, ctx, 0);
      const out = segmentPacket(s, ctx, { from: DELIVER[0], to: DELIVER[1], delay: BEAT.afterPulse, role: 'network' });
      ridingLabel(s, ctx, 'X-Forwarded-For: 198.51.100.9', DELIVER, { delay: BEAT.afterPulse });
      pulsePod(s.refs.podW, ctx, out.arrivalMs);
    },
  },
  {
    id: 'trust',
    duration: 2600,
    narration: 'A header is only data, and a client can send an X-Forwarded-For of its own to claim any address it likes. That is why the edge overwrites the header rather than appending to whatever arrived, and why an app should believe the value only when it comes from a proxy it trusts. Behind two proxies the header becomes a list, and only the hop written by your own edge can be trusted.',
    enter(s, ctx) {
      resetStep(s);
      // Short by necessity: the chip name is the longest on the card, so a value beyond ~12 characters
      // collides with it. "rewritten" is the whole point anyway: the forged claim did not survive.
      setChips(s, { xff: 'rewritten', fwd: 'for=198.51.100.9', src: 'proxy 10.244.0.9', reads: 'header', mode: 'L7 proxy', podIp: 'trusted hop only' });
      s.refs.client.classList.add('highlight');
      s.refs.xffChip.classList.add('highlight');
      s.refs.ipChip.classList.add('highlight');
      if (ctx.reduced) { s.refs.proxyBox.classList.add('highlight'); return; }
      // Down-arrow: the client sends its own forged header, and the proxy pulses as it receives it and
      // overwrites the value. The forged claim is what rides the ball, so the spoof is literal traffic.
      const inb = segmentPacket(s, ctx, { from: ENTRY[0], to: ENTRY[1], role: 'network' });
      ridingLabel(s, ctx, 'X-Forwarded-For: 1.2.3.4', ENTRY);
      pulsePod(s.refs.proxy, ctx, inb.arrivalMs);
    },
  },
  {
    id: 'passthrough',
    duration: 2800,
    narration: 'Not every protocol has a header to write into. With raw TCP, or with TLS passed through untouched, the edge cannot add anything to the payload. The PROXY protocol solves it by prepending a short preamble ahead of the first bytes, carrying the original source and destination, and the backend has to be configured to expect it or it reads that preamble as part of the request. At layer 4 there is one more option: externalTrafficPolicy Local keeps the real source on the packet itself, with no header and no preamble.',
    enter(s, ctx) {
      resetStep(s);
      // A raw TCP stream carries no headers, so the panel goes back to none and stays unlit: this mode
      // recovers the address a different way.
      setChips(s, { xff: 'none', fwd: 'none', src: 'proxy 10.244.0.9', reads: 'preamble', mode: 'TCP passthrough', podIp: 'recovered' });
      s.refs.modeChip.classList.add('highlight');
      s.refs.readsChip.classList.add('highlight');
      s.refs.ipChip.classList.add('highlight');
      if (ctx.reduced) { s.refs.podWBox.classList.add('highlight'); return; }
      // Up-arrow again: the proxy pulses as it prepends the preamble, then the stream leaves carrying it
      // and the backend pulses on arrival.
      pulsePod(s.refs.proxy, ctx, 0);
      const out = segmentPacket(s, ctx, { from: DELIVER[0], to: DELIVER[1], delay: BEAT.afterPulse, role: 'network' });
      ridingLabel(s, ctx, 'PROXY TCP4 198.51.100.9', DELIVER, { delay: BEAT.afterPulse });
      pulsePod(s.refs.podW, ctx, out.arrivalMs);
    },
  },
];

export const init = makeInit(Scene, STEPS, { posterFirst: true });
