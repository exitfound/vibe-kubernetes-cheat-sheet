import { svg, g, text } from '../lib/svg.js';
import { arrowDefs, box, cylinder, chainList, arrow } from '../lib/primitives.js';
import { valChip, setVal, segmentPacket, makeInit, clearHighlights, clearWires, setWire, BEAT } from '../lib/control-kit.js';

class Scene {
  constructor(host) { this.host = host; this.refs = {}; this.build(); }

  build() {
    this.host.replaceChildren();
    this.refs = {};
    const root = svg({
      class: 'diagram',
      viewBox: '0 -50 1200 620',
      preserveAspectRatio: 'xMidYMid meet',
      'aria-label': 'Admission chain: six stages from Api request to ETCD',
      'data-style': 'outline',
    });
    root.appendChild(arrowDefs());

    // Top row: even 80px gaps, Api centred on x=600. The flanks (Kubectl/ETCD) are both 140 wide,
    // so a centred Api with equal gaps self-centres the whole row.
    const kubectl = box({ x: 230, y: 60, w: 140, h: 80, label: 'Kubectl', sublabel: 'POST /api/v1/...', cat: 'control' });
    const api     = box({ x: 450, y: 60, w: 300, h: 80, label: 'Api', sublabel: 'admission pipeline', cat: 'control' });
    const etcdC   = cylinder({ x: 830, y: 50, w: 140, h: 100, label: 'ETCD', cat: 'control' });
    // Centre the cylinder label optically: the default h/2 baseline reads high under the cap,
    // and a full nudge to the body-below-cap centre reads low. y=60 (glyph centre ~106) balances both.
    const etcdLbl = etcdC.querySelector('.scheme-cylinder-label');
    if (etcdLbl) etcdLbl.setAttribute('y', 60);

    const chain = chainList({
      x: 400, y: 220, w: 400, rowH: 32, gap: 12,
      items: [
        '1. authn      ·  identity from x509 / token / OIDC',
        '2. authz      ·  RBAC + Node + Webhook chain',
        '3. mutating   ·  webhooks may rewrite the object',
        '4. schema     ·  validate against OpenAPI schema',
        '5. validating ·  webhooks may reject the request',
        '6. persist    ·  write final object to ETCD',
      ],
      cat: 'control',
    });

    // Chip column: left edge aligned under ETCD so the right side reads as one ETCD → chips column.
    const objChip       = valChip({ x: 830, y: 220, w: 330, h: 32, name: 'Pod object',    value: '{cpu=100m}' });
    const failurePolicy = valChip({ x: 830, y: 264, w: 330, h: 32, name: 'failurePolicy', value: '—' });

    root.appendChild(objChip);
    root.appendChild(failurePolicy);

    // Out (request) at y=85, return (response) at y=115: the pair straddles the block centre (y=100)
    // symmetrically instead of riding low. Boxes span y=60..140 → equal 25px margins top and bottom.
    root.appendChild(arrow({ x1: 370, y1: 85,  x2: 450, y2: 85,  dim: true, dashed: true, color: 'control' }));
    root.appendChild(arrow({ x1: 450, y1: 115, x2: 370, y2: 115, dim: true, dashed: true, color: 'control' }));
    root.appendChild(arrow({ x1: 750, y1: 85,  x2: 830, y2: 85,  dim: true, dashed: true, color: 'control' }));
    root.appendChild(arrow({ x1: 830, y1: 115, x2: 750, y2: 115, dim: true, dashed: true, color: 'control' }));

    // Connector Api.bottom → pipeline.top (x=600 spine).
    root.appendChild(arrow({ x1: 600, y1: 140, x2: 600, y2: 218, dim: true, dashed: true, color: 'control' }));

    const wireReq  = text({ class: 'scheme-label code dim', x: 410, y: 46,  'text-anchor': 'middle' }, [' ']);
    const wireResp = text({ class: 'scheme-label code dim', x: 410, y: 158, 'text-anchor': 'middle' }, [' ']);
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
    narration: 'Six stages stand between an Api request and ETCD. Built-in stages always run, webhook stages run only when configurations exist.',
    enter(s) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setVal(s.refs.objChip, '{cpu=100m}');
      setVal(s.refs.failurePolicy, '—');
    },
  },
  {
    id: 'authn-authz',
    duration: 2000,
    narration: 'Built-in. Authn binds an identity (cert, token, or OIDC), then authz consults RBAC, Node, and Webhook. A failure here aborts the request with HTTP 401 (authn) or 403 (authz).',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setVal(s.refs.failurePolicy, '—');
      setWire(s, 'req', 'POST /api/v1/pods');
      s.refs.kubectl.classList.add('highlight');
      s.refs.api.classList.add('highlight');
      const rows = s.refs.chain.querySelectorAll('.scheme-chip');
      if (rows[0]) rows[0].classList.add('highlight');
      if (rows[1]) rows[1].classList.add('highlight');
      if (ctx.reduced) return;
      // Two arrow segments: top arrow Kubectl→Api, then down-connector Api→pipeline.
      const req = segmentPacket(s, ctx, { from: [370, 85], to: [450, 85] });
      segmentPacket(s, ctx, { from: [600, 140], to: [600, 218], delay: req.arrivalMs + BEAT.afterHop });
    },
  },
  {
    id: 'mutating',
    duration: 1700,
    narration: 'Pluggable. MutatingWebhookConfiguration objects route the request through external policy webhooks (Kyverno, OPA Gatekeeper, sidecar injectors) that can rewrite the object before validation.',
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
      setVal(s.refs.failurePolicy, '—');
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
    narration: 'Pluggable. ValidatingWebhookConfiguration webhooks inspect the final object and may only allow or deny, not mutate. Any deny aborts the request.',
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
    duration: 2400,
    narration: 'Built-in. The Api writes the final object to ETCD via Raft. Once ETCD commits, the Api returns HTTP 201 Created to the client and every open watch receives an ADDED event so informers can update their caches.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setVal(s.refs.failurePolicy, '—');
      setWire(s, 'resp', 'HTTP 201 Created');
      const rows = s.refs.chain.querySelectorAll('.scheme-chip');
      if (rows[5]) rows[5].classList.add('highlight');
      s.refs.kubectl.classList.add('highlight');
      s.refs.api.classList.add('highlight');
      s.refs.etcdC.classList.add('highlight');
      if (ctx.reduced) return;
      // Three arrow segments, sequenced. Each packet is visible only on its own arrow.
      const write = segmentPacket(s, ctx, { from: [750, 85], to: [830, 85] });
      const commit = segmentPacket(s, ctx, { from: [830, 115], to: [750, 115], delay: write.arrivalMs + BEAT.afterHop });
      segmentPacket(s, ctx, { from: [450, 115], to: [370, 115], delay: commit.arrivalMs + BEAT.afterHop });
    },
  },
];

export const init = makeInit(Scene, STEPS, { posterFirst: true });
