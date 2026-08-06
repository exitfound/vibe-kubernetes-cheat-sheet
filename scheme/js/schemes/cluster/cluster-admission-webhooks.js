import { g, text } from '../../lib/svg.js';
import { arrowDefs, box, cylinder, chainList, arrow, pathArrow } from '../../lib/primitives.js';
import { valChip, setVal, segmentPacket, routePacket, makeInit, clearHighlights, clearWires, setWire, relationPath, BEAT, lightBoxAt, diagramRoot } from './cluster-kit.js';

// Design notes for this card: ./CARDS.md#cluster-admission-webhooks

// Laid out on the L. Panel x<=397 y<=230, kubectl at KCTL_Y 300: 70 units of clearance and roughly
// 480 characters. The wrap is token-bound, so MEASURE rather than counting.
const M = 60;
const CONTENT_L = M, CONTENT_R = 1200 - M;               // 60 / 1140
// Reserved narration corner: 400 x 230. Nothing on this card derives from it, and the measured
// worst case per viewport is in the header note above.

// The flanks stand on one inset band, not on the content edges: kubectl, ETCD and the chip strip
// share BAND_L / BAND_R, so their edges line up by construction and the card still centres on 600.
const BAND_INSET = 40;
const BAND_L = CONTENT_L + BAND_INSET, BAND_R = CONTENT_R - BAND_INSET;   // 100 / 1100

const KCTL_X = BAND_L, KCTL_W = 240, KCTL_H = 80;       // 100..340
const KCTL_Y = 300;                                      // 300..380
const KCTL_CX = KCTL_X + KCTL_W / 2;                     // 220, both lanes straddle this

const TOP_Y = 60, TOP_H = 80, TOP_BOTTOM = TOP_Y + TOP_H;// 60 / 140
const TOP_CY = TOP_Y + TOP_H / 2;                        // 100
const API_X = 420, API_W = 400, API_R = API_X + API_W;   // 420..820
const API_CX = API_X + API_W / 2;                        // 620
// Optical, not geometric: a straight cylinder wall flush with a rounded rect READS as overhanging,
// because rx=4 pulls the chip's own edge in. Pull the cylinder in by that rx.
const ETCD_OPTICAL = 4;
const ETCD_W = 140, ETCD_X = BAND_R - ETCD_OPTICAL - ETCD_W;   // 956..1096
const LANE_DY = 15;
const OUT_Y = TOP_CY - LANE_DY, BACK_Y = TOP_CY + LANE_DY;   // 85 / 115

// Both lanes leave the kubectl TOP face, one right angle each, out left of back at both ends so they
// never cross. 73% and 68% of the two runs sit behind the panel: an accepted cost, see ./CARDS.md.
const KCTL_OUT_X = KCTL_CX - LANE_DY, KCTL_BACK_X = KCTL_CX + LANE_DY;   // 205 / 235
const KCTL_TO_API = [[KCTL_OUT_X, KCTL_Y], [KCTL_OUT_X, OUT_Y], [API_X, OUT_Y]];
const API_TO_KCTL = [[API_X, BACK_Y], [KCTL_BACK_X, BACK_Y], [KCTL_BACK_X, KCTL_Y]];

const LADDER_X = API_X, LADDER_W = API_W;                // the pipeline hangs under the API
const LADDER_Y = 220;
// A relationship, not a route: the five stages below ARE the API, so nothing travels down there.
// No arrowhead, and it lands ON the ladder edge rather than short of it.
const API_TO_CHAIN = [[API_CX, TOP_BOTTOM], [API_CX, LADDER_Y]];

const CHIP_H = 34, CHIPS_Y = 520, CHIP_GAP = 20;
const CHIP_W = (BAND_R - BAND_L - CHIP_GAP) / 2;         // 490
const CHIP_X = i => BAND_L + i * (CHIP_W + CHIP_GAP);    // 100 / 610

class Scene {
  constructor(host) { this.host = host; this.refs = {}; this.build(); }

  build() {
    this.host.replaceChildren();
    this.refs = {};
    const root = diagramRoot({ 'aria-label': 'Admission chain: five stages from API request to ETCD' });
    root.appendChild(arrowDefs());

    // The Api and its ladder hold the middle column; kubectl and ETCD are the flanks, both standing
    // on the inset band so the drawing centres on 600 without either of them touching a content edge.
    const kubectl = box({ x: KCTL_X, y: KCTL_Y, w: KCTL_W, h: KCTL_H, label: 'kubectl', sublabel: 'POST /api/v1/...', role: 'cluster' });
    const api     = box({ x: API_X, y: TOP_Y, w: API_W, h: TOP_H, label: 'API', sublabel: 'admission pipeline', role: 'cluster' });
    const etcdC   = cylinder({ x: ETCD_X, y: TOP_Y - 10, w: ETCD_W, h: TOP_H + 20, label: 'ETCD', role: 'cluster' });
    // Centre the cylinder label optically: the default h/2 baseline reads high under the cap,
    // and a full nudge to the body-below-cap centre reads low. y=60 (glyph centre ~106) balances both.
    const etcdLbl = etcdC.querySelector('.scheme-cylinder-label');
    if (etcdLbl) etcdLbl.setAttribute('y', 60);

    const chain = chainList({
      x: LADDER_X, y: LADDER_Y, w: LADDER_W, rowH: 32, gap: 12,
      // ONE row per STEP, or every number runs ahead of the step counter the reader is watching.
      // The runs of spaces are SOURCE alignment only: SVG <text> collapses them. Do not size off them.
      items: [
        '1. authn, authz ·  who the caller is, what they may do',
        '2. mutating     ·  plugins and webhooks rewrite it',
        '3. schema       ·  types and required fields checked',
        '4. validating   ·  plugins, policies and webhooks',
        '5. persist      ·  write final object to ETCD',
      ],
      role: 'cluster',
    });

    // Chip strip: it spans the same inset band as the flanks, so its left edge is the kubectl left
    // edge and its right edge is the ETCD right edge, one vertical line down each side.
    const objChip       = valChip({ x: CHIP_X(0), y: CHIPS_Y, w: CHIP_W, h: CHIP_H, name: 'Pod object',    value: '{cpu=100m}', role: 'cluster' });
    // A STANDING configuration value, not a per-step state: failurePolicy is a field on the webhook
    // configurations and does not become "none" while the request sits in the schema step.
    const failurePolicy = valChip({ x: CHIP_X(1), y: CHIPS_Y, w: CHIP_W, h: CHIP_H, name: 'failurePolicy', value: 'Fail | Ignore', role: 'cluster' });

    root.appendChild(objChip);
    root.appendChild(failurePolicy);

    // Out (request) at y=85, return (response) at y=115: the pair straddles the API face centre
    // (y=100) symmetrically, the same way both lanes straddle the kubectl top face centre at x=220.
    root.appendChild(pathArrow({ points: KCTL_TO_API, dim: true, dashed: true, role: 'cluster' }));
    root.appendChild(pathArrow({ points: API_TO_KCTL, dim: true, dashed: true, role: 'cluster' }));
    root.appendChild(arrow({ x1: API_R, y1: OUT_Y,  x2: ETCD_X, y2: OUT_Y,  dim: true, dashed: true, role: 'cluster' }));
    root.appendChild(arrow({ x1: ETCD_X, y1: BACK_Y, x2: API_R, y2: BACK_Y, dim: true, dashed: true, role: 'cluster' }));

    root.appendChild(relationPath({ points: API_TO_CHAIN, role: 'cluster' }));

    const wireReq  = text({ class: 'scheme-label code dim', x: API_CX, y: 46,  'text-anchor': 'middle' }, [' ']);
    // Centred under kubectl now that both lanes leave its top face: the gap to its right is down to
    // 80 units, and the whole band below the box is empty until the chip strip at y=520.
    const wireResp = text({ class: 'scheme-label code dim', x: KCTL_CX, y: KCTL_Y + KCTL_H + 26, 'text-anchor': 'middle' }, [' ']);
    [wireReq, wireResp].forEach(t => root.appendChild(t));

    const packetLayer = g({ id: 'packetLayer' });
    root.appendChild(packetLayer);

    // Chain LAST among middle blocks so it renders on top of packetLayer.
    root.appendChild(chain);

    // Top-row blocks ABSOLUTE LAST.
    root.appendChild(kubectl);
    root.appendChild(api);
    root.appendChild(etcdC);

    this.host.appendChild(root);
    this.refs = {
      svg: root,
      kubectl, api, etcdC, objChip, failurePolicy, chain,
      packetLayer,
      wires: { req: wireReq, resp: wireResp },
    };
  }

  reset() { this.build(); }
}

function setChips(s, { obj, failurePolicy }) {
  setVal(s.refs.objChip, obj);
  setVal(s.refs.failurePolicy, failurePolicy);
}

function resetStep(s) {
  s.refs.packetLayer.replaceChildren();
  clearHighlights(s, ['kubectl','api','etcdC','objChip','failurePolicy']);
  clearWires(s);
}

const STEPS = [
  {
    id: 'idle',
    duration: 1500,
    enter(s) {
      resetStep(s);
      setChips(s, { obj: '{cpu=100m}', failurePolicy: 'Fail | Ignore' });
    },
  },
  {
    id: 'authn-authz',
    // The top-face exit makes the request route 430 units, a 956ms glide. One ball, span 1516.
    duration: 2200,
    narration: 'Built-in, and already done. The request arrives authenticated, so admission never sees an anonymous caller. Authorizers run in configured order, commonly Node then RBAC, and the first to allow or to deny ends it, so no later one runs. Nothing allowing it means 403.',
    enter(s, ctx) {
      resetStep(s);
      setChips(s, { obj: '{cpu=100m}', failurePolicy: 'Fail | Ignore' });
      setWire(s, 'req', 'POST /api/v1/namespaces/default/pods');
      s.refs.kubectl.classList.add('highlight');
      const rows = s.refs.chain.querySelectorAll('.scheme-chip');
      if (rows[0]) rows[0].classList.add('highlight');
      if (ctx.reduced) { s.refs.api.classList.add('highlight'); return; }
      // One hop, Kubectl → Api. The Api is its receiver, so it lights when the request lands rather
      // than at entry. Nothing rides down to the ladder: those five stages are the Api itself.
      const req = routePacket(s, ctx, KCTL_TO_API, { role: 'cluster' });
      lightBoxAt(s.refs.api, ctx, req.arrivalMs);
    },
  },
  {
    id: 'mutating',
    duration: 1700,
    narration: 'Pluggable plus built-in. Always-on mutating plugins like ServiceAccount, LimitRanger and DefaultTolerationSeconds rewrite the Pod here, and MutatingWebhookConfiguration adds external policy webhooks (Kyverno, OPA Gatekeeper, sidecar injectors) on top, all before validation.',
    enter(s, ctx) {
      resetStep(s);
      const rows = s.refs.chain.querySelectorAll('.scheme-chip');
      if (rows[1]) rows[1].classList.add('highlight');
      setChips(s, { obj: '{cpu=100m, runAsNonRoot=true}', failurePolicy: 'Fail | Ignore' });
      s.refs.objChip.classList.add('highlight');
      s.refs.failurePolicy.classList.add('highlight');
      // Rewrites land on statically highlighted chips, no block flash. The Api is lit because this
      // stage runs INSIDE it: otherwise the three motionless middle steps light no actor at all.
      s.refs.api.classList.add('highlight');
    },
  },
  {
    id: 'schema',
    duration: 1700,
    narration: 'Built-in. The API validates the mutated object for its kind, so bad types and missing required fields fail here, before any validating webhook runs.',
    enter(s, ctx) {
      resetStep(s);
      setChips(s, { obj: '{cpu=100m, runAsNonRoot=true}', failurePolicy: 'Fail | Ignore' });
      const rows = s.refs.chain.querySelectorAll('.scheme-chip');
      if (rows[2]) rows[2].classList.add('highlight');
      // Schema validation happens inside the Api, so the Api is lit and the object under check
      // stays statically highlighted, no block flash.
      s.refs.objChip.classList.add('highlight');
      s.refs.api.classList.add('highlight');
    },
  },
  {
    id: 'validating',
    duration: 1700,
    // NOT "called last": AllOrderedPlugins ends validatingwebhook, resourcequota, deny, so a webhook
    // that admits an object can still be followed by a quota denial.
    narration: 'Pluggable plus built-in. LimitRanger is back to check min and max, ValidatingAdmissionPolicy runs in process, validating webhooks call out over HTTP, and ResourceQuota runs after all of them. None may mutate, and any deny aborts the request. See the ResourceQuota and LimitRange card.',
    enter(s, ctx) {
      resetStep(s);
      const rows = s.refs.chain.querySelectorAll('.scheme-chip');
      if (rows[3]) rows[3].classList.add('highlight');
      setChips(s, { obj: '{cpu=100m, runAsNonRoot=true}', failurePolicy: 'Fail | Ignore' });
      s.refs.failurePolicy.classList.add('highlight');
      // Validating webhooks may only allow or deny; the policy chip stays statically
      // highlighted, no block flash. The Api is lit for the same reason as the two stages above.
      s.refs.api.classList.add('highlight');
    },
  },
  {
    id: 'persist',
    duration: 3000,
    narration: 'Built-in. The API writes the final object to ETCD via Raft. Once ETCD commits, the API returns HTTP 201 Created to the client and every open watch receives an ADDED event so informers can update their caches.',
    enter(s, ctx) {
      resetStep(s);
      setChips(s, { obj: '{cpu=100m, runAsNonRoot=true}', failurePolicy: 'Fail | Ignore' });
      setWire(s, 'resp', 'HTTP 201 Created');
      const rows = s.refs.chain.querySelectorAll('.scheme-chip');
      if (rows[4]) rows[4].classList.add('highlight');
      s.refs.api.classList.add('highlight');
      if (ctx.reduced) { s.refs.etcdC.classList.add('highlight'); s.refs.kubectl.classList.add('highlight'); return; }
      // Three arrow segments, sequenced. Each packet is visible only on its own arrow. The Api is
      // the source and stays lit from entry; ETCD lights on the write landing, like kubectl below.
      const write = segmentPacket(s, ctx, { from: [API_R, OUT_Y], to: [ETCD_X, OUT_Y], role: 'cluster' });
      lightBoxAt(s.refs.etcdC, ctx, write.arrivalMs);
      const commit = segmentPacket(s, ctx, { from: [ETCD_X, BACK_Y], to: [API_R, BACK_Y], delay: write.arrivalMs + BEAT.afterHop, role: 'cluster' });
      const kubectlPkt = routePacket(s, ctx, API_TO_KCTL, { delay: commit.arrivalMs + BEAT.afterHop, role: 'cluster' });
      lightBoxAt(s.refs.kubectl, ctx, kubectlPkt.arrivalMs);
    },
  },
];

export const init = makeInit(Scene, STEPS, { posterFirst: true });
