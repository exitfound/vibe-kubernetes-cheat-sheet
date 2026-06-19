import { svg, g, text } from '../lib/svg.js';
import { arrowDefs, box, pod, arrow } from '../lib/primitives.js';
import { valChip, setVal, pulsePod, segmentPacket, makeInit, clearHighlights, clearWires, setWire, BEAT } from '../lib/network-kit.js';

// Layout zones (viewBox 1200x640): top-left band reserved for the narration overlay. The flow runs
// left to right along y312, external client -> Ingress controller -> backend Pod, with the TLS
// Secret sitting above the Ingress as the source of the certificate. TLS is decrypted INSIDE the
// Ingress box. The client and Ingress are infrastructure (they light, never pulse); only the
// backend Pod pulses.
const FLOW_Y = 312;
const CLIENT_EDGE = 270;
const ING_LEFT = 470;
const ING_RIGHT = 710;
const POD_LEFT = 910;
const SECRET_X = 590;

function lightBoxAt(boxEl, ctx, delay = 0) {
  if (!boxEl) return;
  if (ctx.reduced || delay <= 0) { boxEl.classList.add('highlight'); return; }
  const a = boxEl.animate([{ opacity: 1 }, { opacity: 1 }], { duration: 1, delay });
  a.onfinish = () => boxEl.classList.add('highlight');
  ctx.register(a);
}

function podBlock({ x, y, w, h, label, ip }) {
  const shell = pod({ x, y, w, h, label, sublabel: ip, containers: 0, cat: 'network' });
  const shellRect = shell.querySelector('.scheme-pod-rect');
  if (shellRect) shellRect.style.fill = 'rgba(255, 255, 255, 0.03)';
  const innerBox = box({ x: x + 20, y: y + 34, w: w - 40, h: 52, label: 'app', sublabel: 'http :8080', cat: 'network' });
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
      'aria-label': 'TLS termination at the edge: a client opens an HTTPS connection to the Ingress controller, which presents the certificate from a TLS Secret, completes the handshake, decrypts the request, and proxies plain HTTP to the backend Pod, with re-encrypt or passthrough as alternatives',
      'data-style': 'outline',
    });
    root.appendChild(arrowDefs());

    const client = box({ x: 70, y: 276, w: 200, h: 72, label: 'client', sublabel: 'browser · https', cat: 'network' });
    const secret = box({ x: 470, y: 150, w: 240, h: 56, label: 'tls Secret', sublabel: 'cert + private key', cat: 'network' });
    const ingress = box({ x: ING_LEFT, y: 276, w: 240, h: 72, label: 'Ingress controller', sublabel: 'TLS terminate', cat: 'network' });
    const podX = podBlock({ x: 910, y: 252, w: 210, h: 120, label: 'Pod web', ip: '10.244.2.7' });

    const cWire = arrow({ x1: CLIENT_EDGE, y1: FLOW_Y, x2: ING_LEFT, y2: FLOW_Y, dashed: true, dim: true, color: 'network' });
    const pWire = arrow({ x1: ING_RIGHT, y1: FLOW_Y, x2: POD_LEFT, y2: FLOW_Y, dashed: true, dim: true, color: 'network' });
    const sWire = arrow({ x1: SECRET_X, y1: 206, x2: SECRET_X, y2: 276, dashed: true, dim: true, color: 'network' });
    const cLabel = text({ class: 'scheme-label code dim', x: 370, y: FLOW_Y - 12, 'text-anchor': 'middle', 'font-size': 10 }, [' ']);
    const pLabel = text({ class: 'scheme-label code dim', x: 810, y: FLOW_Y - 12, 'text-anchor': 'middle', 'font-size': 10 }, [' ']);

    const schemeChip = valChip({ x: 80,  y: 560, w: 250, h: 34, name: 'wire', value: 'idle', cat: 'network' });
    const tlsChip    = valChip({ x: 350, y: 560, w: 250, h: 34, name: 'TLS', value: 'none', cat: 'network' });
    const certChip   = valChip({ x: 620, y: 560, w: 250, h: 34, name: 'cert', value: 'in Secret', cat: 'network' });
    const backChip   = valChip({ x: 890, y: 560, w: 230, h: 34, name: 'to backend', value: 'none', cat: 'network' });

    const packetLayer = g({ id: 'packetLayer' });

    // Z-order: client + secret + ingress + pod, then wires + labels above, then chips, then packets.
    root.appendChild(client);
    root.appendChild(secret);
    root.appendChild(ingress);
    root.appendChild(podX.group);
    [cWire, pWire, sWire, cLabel, pLabel].forEach(el => root.appendChild(el));
    [schemeChip, tlsChip, certChip, backChip].forEach(c => root.appendChild(c));
    root.appendChild(packetLayer);

    this.host.appendChild(root);
    this.refs = {
      svg: root, client, secret, ingress, podX: podX.group, podXBox: podX.innerBox,
      schemeChip, tlsChip, certChip, backChip,
      packetLayer, wires: { c: cLabel, p: pLabel },
    };
  }

  reset() { this.build(); }
}

function clearHL(s) {
  clearHighlights(s, ['client', 'secret', 'ingress', 'schemeChip', 'tlsChip', 'certChip', 'backChip'], [s.refs.podX]);
}

function flashBox(s, ctx, key) {
  if (ctx.reduced) return;
  const el = s.refs[key];
  if (!el) return;
  ctx.register(el.animate(
    [{ filter: 'brightness(1)' }, { filter: 'brightness(1.5)' }, { filter: 'brightness(1)' }],
    { duration: 600, easing: 'ease-out' }
  ));
}

const STEPS = [
  {
    id: 'idle',
    duration: 1500,
    narration: 'Clients reach the cluster over HTTPS, but the backend Pods usually speak plain HTTP. Something at the edge has to handle the encryption so the apps do not each have to. That job is TLS termination, and the Ingress or Gateway is where it happens.',
    enter(s) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setVal(s.refs.schemeChip, 'idle');
      setVal(s.refs.tlsChip, 'none');
      setVal(s.refs.certChip, 'in Secret');
      setVal(s.refs.backChip, 'none');
    },
  },
  {
    id: 'handshake',
    duration: 2500,
    narration: 'The client opens a TLS connection to the Ingress. The controller presents the certificate loaded from a Kubernetes Secret, the one named in the Ingress tls section, and the two complete the handshake. The bytes on this leg are encrypted end to edge.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setWire(s, 'c', 'TLS handshake · https');
      s.refs.ingress.classList.add('highlight');
      s.refs.secret.classList.add('highlight');
      s.refs.schemeChip.classList.add('highlight');
      s.refs.tlsChip.classList.add('highlight');
      s.refs.certChip.classList.add('highlight');
      setVal(s.refs.schemeChip, 'https');
      setVal(s.refs.tlsChip, 'handshake');
      setVal(s.refs.certChip, 'presented');
      if (ctx.reduced) { s.refs.client.classList.add('highlight'); return; }
      // No Pod on this leg: the client and ingress are infra. The encrypted hello rides client ->
      // ingress, which lights on arrival along with the Secret it pulled the cert from.
      const hello = segmentPacket(s, ctx, { from: [CLIENT_EDGE, FLOW_Y], to: [ING_LEFT, FLOW_Y], cat: 'network' });
      lightBoxAt(s.refs.ingress, ctx, hello.arrivalMs);
    },
  },
  {
    id: 'terminate',
    duration: 2400,
    narration: 'With the session established, the Ingress decrypts the request. This is the termination point: the encrypted stream ends here and the controller now holds the plain HTTP request, headers and body in the clear, ready to be routed by host and path.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      s.refs.ingress.classList.add('highlight');
      s.refs.tlsChip.classList.add('highlight');
      s.refs.schemeChip.classList.add('highlight');
      setVal(s.refs.tlsChip, 'terminated');
      setVal(s.refs.schemeChip, 'now http');
      // Packet-less, pod-less: flash the Ingress box where decryption happens. Chips light only.
      flashBox(s, ctx, 'ingress');
    },
  },
  {
    id: 'proxy',
    duration: 2500,
    narration: 'The Ingress proxies the plaintext request over the internal network to the backend Pod. Inside the cluster the traffic is plain HTTP, which is why backend apps can stay simple and never see a certificate. The Pod serves the request on its normal port.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setWire(s, 'p', 'http plaintext');
      s.refs.ingress.classList.add('highlight');
      s.refs.backChip.classList.add('highlight');
      setVal(s.refs.schemeChip, 'http');
      setVal(s.refs.backChip, 'Pod :8080');
      if (ctx.reduced) { s.refs.podXBox.classList.add('highlight'); return; }
      // The plaintext request leaves the ingress and is delivered to the backend Pod, which pulses
      // on arrival.
      const give = segmentPacket(s, ctx, { from: [ING_RIGHT, FLOW_Y], to: [POD_LEFT, FLOW_Y], cat: 'network' });
      pulsePod(s.refs.podX, ctx, give.arrivalMs);
    },
  },
  {
    id: 'modes',
    duration: 2600,
    narration: 'Terminating at the edge is the common choice, but not the only one. Re-encrypt opens a fresh TLS connection to the backend so traffic stays encrypted inside the cluster too, and passthrough forwards the raw TLS bytes untouched, letting the Pod hold the certificate and terminate the session itself.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      s.refs.ingress.classList.add('highlight');
      s.refs.tlsChip.classList.add('highlight');
      setVal(s.refs.tlsChip, 'terminate / re-encrypt / passthrough');
      setVal(s.refs.schemeChip, 'http or https');
      setVal(s.refs.backChip, 'Pod :8080');
      if (ctx.reduced) return;
      // No new traffic: the backend Pod pulses to mark where passthrough would move termination to.
      pulsePod(s.refs.podX, ctx, 0);
    },
  },
];

export const init = makeInit(Scene, STEPS, { posterFirst: true });
