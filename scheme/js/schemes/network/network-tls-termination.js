import { P, F, defineCard, laneY, midX } from './network-kit.js';

// Design notes for this card: ./CARDS.md#network-tls-termination


const FLOW_Y = 312;
const CLIENT_EDGE = 270;
const ING_LEFT = 470;
const ING_RIGHT = 710;
const POD_LEFT = 910;
const SECRET_X = 590;
const LANE_DY = 12;
// 300 the client hello, 324 the server side of the handshake.
const { out: HS_OUT_Y, back: HS_BACK_Y } = laneY(FLOW_Y, LANE_DY);

const SCHEME_L = 70, SCHEME_R = 1120;      // content band: the chip strip spans it, the Pod is flush right
const ROW_H = 72;
const ROW_Y = FLOW_Y - ROW_H / 2;          // 276, the client and the Ingress share one baseline
const CLIENT_W = CLIENT_EDGE - SCHEME_L;   // 200
const ING_W = ING_RIGHT - ING_LEFT;        // 240
const SECRET_Y = 150, SECRET_H = 56;
const SECRET_BOTTOM = SECRET_Y + SECRET_H; // 206, the edge the certificate leaves from
const POD_W = SCHEME_R - POD_LEFT, POD_H = 120;   // 210 wide
const POD_Y = FLOW_Y - POD_H / 2;          // 252
const POD_INNER = { dx: 20, dy: 34, w: POD_W - 40, h: 52, label: 'app', sublabel: 'http :8080' };

// Chip strip: four cells from SCHEME_L with an even gap. The widths are not equal, each is sized
// for its own longest value (the TLS cell carries the three-mode string).
const CHIP_Y = 440, CHIP_H = 34, CHIP_GAP = 20;
const CHIP_W = [210, 340, 180, 260];
const CHIP_X = CHIP_W.reduce((acc, w, i) => (i ? [...acc, acc[i - 1] + CHIP_W[i - 1] + CHIP_GAP] : [SCHEME_L]), []);

// Each static wire and the ball that rides it share one points array.
const HELLO = [[CLIENT_EDGE, HS_OUT_Y], [ING_LEFT, HS_OUT_Y]];
const HS_BACK = [[ING_LEFT, HS_BACK_Y], [CLIENT_EDGE, HS_BACK_Y]];
const TO_POD = [[ING_RIGHT, FLOW_Y], [POD_LEFT, FLOW_Y]];
const CERT = [[SECRET_X, SECRET_BOTTOM], [SECRET_X, ROW_Y]];

// The list order IS the append order, which is the z-order: client + secret + ingress + Pod, then
// wires + labels above them, then the chips, then the packet layer.
export const SCENE = {
  'aria-label': 'TLS termination at the edge: a client opens an HTTPS connection to the Ingress controller, which presents the certificate from a TLS Secret, completes the handshake, decrypts the request, and proxies plain HTTP to the backend Pod, with re-encrypt or passthrough as alternatives',
  parts: [
    P.defs(),
    P.box({ key: 'client', x: SCHEME_L, y: ROW_Y, w: CLIENT_W, h: ROW_H, label: 'Client', sublabel: 'browser · https' }),
    P.box({ key: 'secret', x: ING_LEFT, y: SECRET_Y, w: ING_W, h: SECRET_H, label: 'TLS Secret', sublabel: 'cert + private key' }),
    P.box({ key: 'ingress', x: ING_LEFT, y: ROW_Y, w: ING_W, h: ROW_H, label: 'Ingress controller', sublabel: 'TLS terminate' }),
    P.pod({
      key: 'podX', innerKey: 'podXBox', x: POD_LEFT, y: POD_Y, w: POD_W, h: POD_H,
      label: 'Pod web', sublabel: '10.244.2.7', inner: POD_INNER,
    }),
    // The client leg is a PAIR, because a handshake COMPLETES at the client. The backend leg stays
    // single, because nothing on this card ever claims a response from the Pod.
    P.arrow({ from: HELLO[0], to: HELLO[1], dashed: true, dim: true }),
    P.arrow({ from: HS_BACK[0], to: HS_BACK[1], dashed: true, dim: true }),
    P.arrow({ from: TO_POD[0], to: TO_POD[1], dashed: true, dim: true }),
    P.arrow({ from: CERT[0], to: CERT[1], dashed: true, dim: true }),
    // The client leg is a lane PAIR, so its caption clears the OUT lane at 300 rather than sitting on
    // it. The backend leg is a single lane on FLOW_Y, so 12 above FLOW_Y is already clear of the ball.
    P.wire({ key: 'c', x: midX(CLIENT_EDGE, ING_LEFT), y: HS_OUT_Y - 12 }),
    P.wire({ key: 'p', x: midX(ING_RIGHT, POD_LEFT), y: FLOW_Y - 12 }),
    P.chip({ key: 'schemeChip', x: CHIP_X[0], y: CHIP_Y, w: CHIP_W[0], h: CHIP_H, name: 'wire', value: 'idle' }),
    P.chip({ key: 'tlsChip', x: CHIP_X[1], y: CHIP_Y, w: CHIP_W[1], h: CHIP_H, name: 'TLS', value: 'none' }),
    P.chip({ key: 'certChip', x: CHIP_X[2], y: CHIP_Y, w: CHIP_W[2], h: CHIP_H, name: 'cert', value: 'in Secret' }),
    P.chip({ key: 'backChip', x: CHIP_X[3], y: CHIP_Y, w: CHIP_W[3], h: CHIP_H, name: 'to backend', value: 'none' }),
    P.packets(),
  ],
  // podXBox is a key, not a pod group: the pod-group list only resets inline pulse strokes, so a
  // .highlight on the backend container would stay lit through every later step.
  reset: {
    keys: ['client', 'secret', 'ingress', 'podXBox', 'schemeChip', 'tlsChip', 'certChip', 'backChip'],
    pods: ['podX'],
  },
};

export const STEPS_SPEC = [
  {
    id: 'idle',
    duration: 1500,
    chips: { schemeChip: 'idle', tlsChip: 'none', certChip: 'in Secret', backChip: 'none' },
  },
  {
    id: 'handshake',
    // Motion: the hello out, the certificate down from the Secret, then the server side of the
    // handshake back to the client, ending at 2860.
    duration: 3200,
    narration: 'The client opens a TLS connection to the Ingress. The controller presents the certificate loaded from a Kubernetes Secret, the one named in the Ingress tls section, and the two complete the handshake. The bytes on this leg are encrypted end to edge.',
    chips: { schemeChip: 'https', tlsChip: 'handshake', certChip: 'presented', backChip: 'none' },
    wires: { c: 'TLS handshake · https' },
    lit: ['secret', 'schemeChip', 'tlsChip', 'certChip', 'client'],
    // The wire turns https and the handshake opens when the hello lands at 700, and the certificate
    // is presented only when it leaves the Secret and arrives at 1500.
    rewind: { chips: { schemeChip: 'idle', tlsChip: 'none', certChip: 'in Secret' } },
    // No Pod on this leg: the client and ingress are infra. The encrypted hello rides client ->
    // ingress, which lights on arrival along with the Secret it pulled the cert from.
    flow: [
      F.segment({ from: HELLO[0], to: HELLO[1], name: 'hello', lights: ['ingress'] }),
      F.set({ at: 'hello', chips: { schemeChip: 'https', tlsChip: 'handshake' } }),
      // The certificate the controller PRESENTS, then the server side of the handshake reaching the
      // client, so the exchange completes where the narration says it completes.
      F.segment({ from: CERT[0], to: CERT[1], after: 'hello', name: 'cert' }),
      F.segment({ from: HS_BACK[0], to: HS_BACK[1], after: 'cert' }),
      F.set({ at: 'cert', chips: { certChip: 'presented' } }),
    ],
  },
  {
    id: 'terminate',
    duration: 2400,
    narration: 'With the session established, the Ingress decrypts the request. This is the termination point: the encrypted stream ends here and the controller now holds the plain HTTP request, headers and body in the clear, ready to be routed by host and path.',
    chips: { schemeChip: 'https', tlsChip: 'terminated', certChip: 'presented', backChip: 'none' },
    // Decryption happens inside the highlighted Ingress. The box lights via .highlight, it does not
    // flash, so this step reads as the calm termination point rather than a blink.
    lit: ['ingress', 'tlsChip'],
  },
  {
    id: 'proxy',
    duration: 2500,
    narration: 'The Ingress proxies the plaintext request over the internal network to the backend Pod. Inside the cluster the traffic is plain HTTP, which is why backend apps can stay simple and never see a certificate. The Pod serves the request on its normal port.',
    chips: { schemeChip: 'http', tlsChip: 'terminated', certChip: 'presented', backChip: 'Pod :8080' },
    wires: { p: 'http plaintext' },
    lit: ['ingress', 'backChip', 'schemeChip'],
    // The animated path says the backend Pod was served by PULSING it, which no lights list names.
    reducedLit: ['podXBox'],
    // The plaintext request leaves the ingress and is delivered to the backend Pod, which pulses
    // on arrival.
    flow: [
      F.segment({ from: TO_POD[0], to: TO_POD[1], name: 'give' }),
      F.pulse({ pod: 'podX', at: 'give' }),
    ],
  },
  {
    id: 'modes',
    duration: 2600,
    narration: 'Terminating at the edge is the common choice, but not the only one. Re-encrypt opens a fresh TLS connection to the backend so traffic stays encrypted inside the cluster too, and passthrough forwards the raw TLS bytes untouched, letting the Pod hold the certificate and terminate the session itself.',
    // Under three modes at once the honest value is where the certificate MAY live, not where it
    // just was: left alone, the cert chip reads presented into a step about passthrough.
    chips: { schemeChip: 'http or https', tlsChip: 'terminate / re-encrypt / passthru', certChip: 'controller or Pod', backChip: 'Pod :8080' },
    lit: ['ingress', 'tlsChip', 'schemeChip', 'certChip'],
    // No new traffic: the backend Pod pulses to mark where passthrough would move termination to.
    flow: [F.pulse({ pod: 'podX' })],
  },
];

export const init = defineCard(SCENE, STEPS_SPEC, { posterFirst: true });
