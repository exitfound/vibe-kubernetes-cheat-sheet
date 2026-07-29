import { svg, g, text } from '../lib/svg.js';
import { arrowDefs, box, cylinder, chainList, arrow, pathArrow } from '../lib/primitives.js';
import { valChip, setVal, segmentPacket, routePacket, makeInit, clearHighlights, clearWires, setWire, BEAT, lightBoxAt } from '../lib/cluster-kit.js';

// Laid out on the L: the narration panel owns the top-left corner and nothing is drawn there.
// Measured worst case over 1600/1440/1280/1100 is x<=397, y<=195, so kubectl moves into the
// freed bottom-left (the storage grammar) and the API row starts at 420. That is what lets the
// content still span 60..1140 and centre on CX.
const M = 60;
const CONTENT_L = M, CONTENT_R = 1200 - M;               // 60 / 1140
const CX = (CONTENT_L + CONTENT_R) / 2;                  // 600
const PANEL_R = 400, PANEL_B = 215;                      // the reserved corner

const KCTL_X = CONTENT_L, KCTL_W = 240, KCTL_H = 80;
const KCTL_Y = 300, KCTL_R = KCTL_X + KCTL_W;            // 60..300, 300..380
const KCTL_CY = KCTL_Y + KCTL_H / 2;                     // 340

const TOP_Y = 60, TOP_H = 80, TOP_BOTTOM = TOP_Y + TOP_H;// 60 / 140
const TOP_CY = TOP_Y + TOP_H / 2;                        // 100
const API_X = 420, API_W = 400, API_R = API_X + API_W;   // 420..820
const API_CX = API_X + API_W / 2;                        // 620
const ETCD_W = 140, ETCD_X = CONTENT_R - ETCD_W;         // 1000..1140
const LANE_DY = 15;
const OUT_Y = TOP_CY - LANE_DY, BACK_Y = TOP_CY + LANE_DY;   // 85 / 115

// Request and response get their own riser, out left of back so the verticals never cross. The
// corridor between the panel edge (x<=397) and the API face (420) is only 23 units wide, which is
// what sets these two numbers. Each lane leaves its box offset by LANE_DY from that face centre.
const RISER_OUT_X = 404, RISER_BACK_X = 416;
const KCTL_OUT_Y = KCTL_CY - LANE_DY, KCTL_BACK_Y = KCTL_CY + LANE_DY;   // 325 / 355
const KCTL_TO_API = [[KCTL_R, KCTL_OUT_Y], [RISER_OUT_X, KCTL_OUT_Y], [RISER_OUT_X, OUT_Y], [API_X, OUT_Y]];
const API_TO_KCTL = [[API_X, BACK_Y], [RISER_BACK_X, BACK_Y], [RISER_BACK_X, KCTL_BACK_Y], [KCTL_R, KCTL_BACK_Y]];

const LADDER_X = API_X, LADDER_W = API_W;                // the pipeline hangs under the API
const LADDER_Y = 220;
const API_TO_CHAIN = [[API_CX, TOP_BOTTOM], [API_CX, LADDER_Y - 2]];

const CHIP_H = 34, CHIPS_Y = 520, CHIP_GAP = 20;
const CHIP_W = (CONTENT_R - CONTENT_L - CHIP_GAP) / 2;   // 530
const CHIP_X = i => CONTENT_L + i * (CHIP_W + CHIP_GAP); // 60 / 610

class Scene {
  constructor(host) { this.host = host; this.refs = {}; this.build(); }

  build() {
    this.host.replaceChildren();
    this.refs = {};
    const root = svg({
      class: 'diagram',
      viewBox: '0 0 1200 640',
      preserveAspectRatio: 'xMidYMid meet',
      'aria-label': 'Admission chain: six stages from API request to ETCD',
      'data-style': 'outline',
    });
    root.appendChild(arrowDefs());

    // Top row: even 80px gaps, Api centred on x=600. The flanks (Kubectl/ETCD) are both 140 wide,
    // so a centred Api with equal gaps self-centres the whole row.
    const kubectl = box({ x: KCTL_X, y: KCTL_Y, w: KCTL_W, h: KCTL_H, label: 'kubectl', sublabel: 'POST /api/v1/...', role: 'cluster' });
    const api     = box({ x: API_X, y: TOP_Y, w: API_W, h: TOP_H, label: 'API', sublabel: 'admission pipeline', role: 'cluster' });
    const etcdC   = cylinder({ x: ETCD_X, y: TOP_Y - 10, w: ETCD_W, h: TOP_H + 20, label: 'ETCD', role: 'cluster' });
    // Centre the cylinder label optically: the default h/2 baseline reads high under the cap,
    // and a full nudge to the body-below-cap centre reads low. y=60 (glyph centre ~106) balances both.
    const etcdLbl = etcdC.querySelector('.scheme-cylinder-label');
    if (etcdLbl) etcdLbl.setAttribute('y', 60);

    const chain = chainList({
      x: LADDER_X, y: LADDER_Y, w: LADDER_W, rowH: 32, gap: 12,
      items: [
        '1. authn      ·  identity from x509 / token / OIDC',
        '2. authz      ·  RBAC + Node + Webhook chain',
        '3. mutating   ·  webhooks may rewrite the object',
        '4. schema     ·  validate against OpenAPI schema',
        '5. validating ·  webhooks may reject the request',
        '6. persist    ·  write final object to ETCD',
      ],
      role: 'cluster',
    });

    // Chip column: left edge aligned under ETCD so the right side reads as one ETCD → chips column.
    const objChip       = valChip({ x: CHIP_X(0), y: CHIPS_Y, w: CHIP_W, h: CHIP_H, name: 'Pod object',    value: '{cpu=100m}', role: 'cluster' });
    const failurePolicy = valChip({ x: CHIP_X(1), y: CHIPS_Y, w: CHIP_W, h: CHIP_H, name: 'failurePolicy', value: 'none', role: 'cluster' });

    root.appendChild(objChip);
    root.appendChild(failurePolicy);

    // Out (request) at y=85, return (response) at y=115: the pair straddles the block centre (y=100)
    // symmetrically instead of riding low. Boxes span y=60..140 → equal 25px margins top and bottom.
    root.appendChild(pathArrow({ points: KCTL_TO_API, dim: true, dashed: true, role: 'cluster' }));
    root.appendChild(pathArrow({ points: API_TO_KCTL, dim: true, dashed: true, role: 'cluster' }));
    root.appendChild(arrow({ x1: API_R, y1: OUT_Y,  x2: ETCD_X, y2: OUT_Y,  dim: true, dashed: true, role: 'cluster' }));
    root.appendChild(arrow({ x1: ETCD_X, y1: BACK_Y, x2: API_R, y2: BACK_Y, dim: true, dashed: true, role: 'cluster' }));

    // Connector API bottom midpoint -> pipeline top midpoint.
    root.appendChild(pathArrow({ points: API_TO_CHAIN, dim: true, dashed: true, role: 'cluster' }));

    const wireReq  = text({ class: 'scheme-label code dim', x: API_CX, y: 46,  'text-anchor': 'middle' }, [' ']);
    // Right-anchored below the kubectl box: the string is ~125 units and the gap its lane runs in is
    // 116, so anything centred on that gap overruns into the ladder column at x=420.
    const wireResp = text({ class: 'scheme-label code dim', x: RISER_OUT_X - 8, y: KCTL_Y + KCTL_H + 20, 'text-anchor': 'end' }, [' ']);
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

function clearHL(s) {
  clearHighlights(s, ['kubectl','api','etcdC','objChip','failurePolicy']);
}

const ROW_Y = [236, 280, 324, 368, 412, 456];

const STEPS = [
  {
    id: 'idle',
    duration: 1500,
    enter(s) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setVal(s.refs.objChip, '{cpu=100m}');
      setVal(s.refs.failurePolicy, 'none');
    },
  },
  {
    id: 'authn-authz',
    duration: 2200,
    narration: 'Built-in. Authn binds an identity (cert, token, or OIDC), then authz consults RBAC, Node, and Webhook. A failure here aborts the request with HTTP 401 (authn) or 403 (authz).',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setVal(s.refs.failurePolicy, 'none');
      setWire(s, 'req', 'POST /api/v1/pods');
      s.refs.kubectl.classList.add('highlight');
      s.refs.api.classList.add('highlight');
      const rows = s.refs.chain.querySelectorAll('.scheme-chip');
      if (rows[0]) rows[0].classList.add('highlight');
      if (rows[1]) rows[1].classList.add('highlight');
      if (ctx.reduced) return;
      // Two arrow segments: top arrow Kubectl→Api, then down-connector Api→pipeline.
      const req = routePacket(s, ctx, KCTL_TO_API, { role: 'cluster' });
      routePacket(s, ctx, API_TO_CHAIN, { delay: req.arrivalMs + BEAT.afterHop, role: 'cluster' });
    },
  },
  {
    id: 'mutating',
    duration: 1700,
    narration: 'Pluggable plus built-in. Always-on mutating plugins like ServiceAccount and DefaultStorageClass rewrite the object here, and MutatingWebhookConfiguration objects add external policy webhooks (Kyverno, OPA Gatekeeper, sidecar injectors) on top, all before validation.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      const rows = s.refs.chain.querySelectorAll('.scheme-chip');
      if (rows[2]) rows[2].classList.add('highlight');
      setVal(s.refs.objChip, '{cpu=100m, runAsNonRoot=true}');
      setVal(s.refs.failurePolicy, 'Fail | Ignore');
      s.refs.objChip.classList.add('highlight');
      s.refs.failurePolicy.classList.add('highlight');
      // Mutating webhooks rewrite the object in place; the new values settle on the
      // statically highlighted chips, no block flash.
    },
  },
  {
    id: 'schema',
    duration: 1700,
    narration: 'Built-in. The mutated object is validated against the OpenAPI schema for its resource. Type errors and required-field violations are caught here, before validating webhooks run.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setVal(s.refs.failurePolicy, 'none');
      const rows = s.refs.chain.querySelectorAll('.scheme-chip');
      if (rows[3]) rows[3].classList.add('highlight');
      // Schema validation happens inside the Api; the object under check stays statically
      // highlighted, no block flash.
      s.refs.objChip.classList.add('highlight');
    },
  },
  {
    id: 'validating',
    duration: 1700,
    narration: 'Pluggable plus built-in. Always-on validating plugins like ResourceQuota and LimitRanger check the final object here, and ValidatingWebhookConfiguration webhooks add external checks on top. Both may only allow or deny, not mutate, and any deny aborts the request.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      const rows = s.refs.chain.querySelectorAll('.scheme-chip');
      if (rows[4]) rows[4].classList.add('highlight');
      setVal(s.refs.failurePolicy, 'Fail | Ignore');
      s.refs.failurePolicy.classList.add('highlight');
      // Validating webhooks may only allow or deny; the policy chip stays statically
      // highlighted, no block flash.
    },
  },
  {
    id: 'persist',
    duration: 3000,
    narration: 'Built-in. The API writes the final object to ETCD via Raft. Once ETCD commits, the API returns HTTP 201 Created to the client and every open watch receives an ADDED event so informers can update their caches.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setVal(s.refs.failurePolicy, 'none');
      setWire(s, 'resp', 'HTTP 201 Created');
      const rows = s.refs.chain.querySelectorAll('.scheme-chip');
      if (rows[5]) rows[5].classList.add('highlight');
      s.refs.api.classList.add('highlight');
      s.refs.etcdC.classList.add('highlight');
      if (ctx.reduced) { s.refs.kubectl.classList.add('highlight'); return; }
      // Three arrow segments, sequenced. Each packet is visible only on its own arrow.
      const write = segmentPacket(s, ctx, { from: [API_R, OUT_Y], to: [ETCD_X, OUT_Y], role: 'cluster' });
      const commit = segmentPacket(s, ctx, { from: [ETCD_X, BACK_Y], to: [API_R, BACK_Y], delay: write.arrivalMs + BEAT.afterHop, role: 'cluster' });
      const kubectlPkt = routePacket(s, ctx, API_TO_KCTL, { delay: commit.arrivalMs + BEAT.afterHop, role: 'cluster' });
      lightBoxAt(s.refs.kubectl, ctx, kubectlPkt.arrivalMs);
    },
  },
];

export const init = makeInit(Scene, STEPS, { posterFirst: true });
