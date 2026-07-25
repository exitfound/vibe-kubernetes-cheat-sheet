import { svg, g, text } from '../lib/svg.js';
import { arrowDefs, box, pod, arrow } from '../lib/primitives.js';
import { valChip, setVal, pulsePod, segmentPacket, makeInit, clearHighlights, clearWires, setWire, lightBoxAt } from '../lib/network-kit.js';
// Design notes for this card: scheme/docs/CARDS.md#network-tls-termination


const FLOW_Y = 312;
const CLIENT_EDGE = 270;
const ING_LEFT = 470;
const ING_RIGHT = 710;
const POD_LEFT = 910;
const SECRET_X = 590;

function podBlock({ x, y, w, h, label, ip }) {
  const shell = pod({ x, y, w, h, label, sublabel: ip, containers: 0, role: 'network' });
  const shellRect = shell.querySelector('.scheme-pod-rect');
  if (shellRect) shellRect.style.fill = 'rgba(255, 255, 255, 0.03)';
  const innerBox = box({ x: x + 20, y: y + 34, w: w - 40, h: 52, label: 'app', sublabel: 'http :8080', role: 'network' });
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

    const client = box({ x: 70, y: 276, w: 200, h: 72, label: 'Client', sublabel: 'browser · https', role: 'network' });
    const secret = box({ x: 470, y: 150, w: 240, h: 56, label: 'TLS Secret', sublabel: 'cert + private key', role: 'network' });
    const ingress = box({ x: ING_LEFT, y: 276, w: 240, h: 72, label: 'Ingress Controller', sublabel: 'TLS terminate', role: 'network' });
    const podX = podBlock({ x: 910, y: 252, w: 210, h: 120, label: 'Pod web', ip: '10.244.2.7' });

    const cWire = arrow({ x1: CLIENT_EDGE, y1: FLOW_Y, x2: ING_LEFT, y2: FLOW_Y, dashed: true, dim: true, role: 'network' });
    const pWire = arrow({ x1: ING_RIGHT, y1: FLOW_Y, x2: POD_LEFT, y2: FLOW_Y, dashed: true, dim: true, role: 'network' });
    const sWire = arrow({ x1: SECRET_X, y1: 206, x2: SECRET_X, y2: 276, dashed: true, dim: true, role: 'network' });
    const cLabel = text({ class: 'scheme-label code dim', x: 370, y: FLOW_Y - 12, 'text-anchor': 'middle', 'font-size': 10 }, [' ']);
    const pLabel = text({ class: 'scheme-label code dim', x: 810, y: FLOW_Y - 12, 'text-anchor': 'middle', 'font-size': 10 }, [' ']);

    const schemeChip = valChip({ x: 70,  y: 440, w: 210, h: 34, name: 'wire', value: 'idle', role: 'network' });
    const tlsChip    = valChip({ x: 300, y: 440, w: 340, h: 34, name: 'TLS', value: 'none', role: 'network' });
    const certChip   = valChip({ x: 660, y: 440, w: 180, h: 34, name: 'cert', value: 'in Secret', role: 'network' });
    const backChip   = valChip({ x: 860, y: 440, w: 260, h: 34, name: 'to backend', value: 'none', role: 'network' });

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
      const hello = segmentPacket(s, ctx, { from: [CLIENT_EDGE, FLOW_Y], to: [ING_LEFT, FLOW_Y], role: 'network' });
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
      // Decryption happens inside the highlighted Ingress. The box lights via .highlight, it does not
      // flash, so this step reads as the calm termination point rather than a blink.
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
      const give = segmentPacket(s, ctx, { from: [ING_RIGHT, FLOW_Y], to: [POD_LEFT, FLOW_Y], role: 'network' });
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
      setVal(s.refs.tlsChip, 'terminate / re-encrypt / passthru');
      setVal(s.refs.schemeChip, 'http or https');
      setVal(s.refs.backChip, 'Pod :8080');
      if (ctx.reduced) return;
      // No new traffic: the backend Pod pulses to mark where passthrough would move termination to.
      pulsePod(s.refs.podX, ctx, 0);
    },
  },
];

export const init = makeInit(Scene, STEPS, { posterFirst: true });
