import { svg, g, rect, text, line } from '../lib/svg.js';
import { arrowDefs, box, cylinder, chainList, arrow, packet, pulse } from '../lib/primitives.js';
import { Timeline } from '../lib/timeline.js';

function valChip({ x, y, w, h = 32, name, value, cat = 'control' }) {
  const grp = g({ class: 'scheme-chip', 'data-cat': cat, transform: `translate(${x},${y})` });
  grp.appendChild(rect({ class: 'scheme-chip-rect', x: 0, y: 0, width: w, height: h, rx: 4 }));
  grp.appendChild(text({ class: 'scheme-chip-text', x: 12, y: h / 2 + 4, 'text-anchor': 'start' }, [name]));
  const valueT = text({ class: 'scheme-chip-text', x: w - 12, y: h / 2 + 4, 'text-anchor': 'end' }, [value]);
  grp.appendChild(valueT);
  grp.valueText = valueT;
  return grp;
}
function setVal(node, txt) { if (node && node.valueText) node.valueText.textContent = txt; }

class Scene {
  constructor(host) { this.host = host; this.refs = {}; this.build(); }

  build() {
    this.host.replaceChildren();
    this.refs = {};
    const root = svg({
      class: 'diagram',
      viewBox: '0 0 1200 540',
      preserveAspectRatio: 'xMidYMid meet',
      'aria-label': 'Admission chain: six stages from API request to etcd',
      'data-style': 'outline',
    });
    root.appendChild(arrowDefs());

    const kubectl = box({ x: 240, y: 60, w: 140, h: 80, label: 'Kubectl', sublabel: 'POST /api/v1/...', cat: 'control' });
    const api     = box({ x: 460, y: 60, w: 300, h: 80, label: 'ApiServer', sublabel: 'admission pipeline', cat: 'control' });
    const etcdC   = cylinder({ x: 850, y: 50, w: 140, h: 100, label: 'ETCD', cat: 'control' });

    const chain = chainList({
      x: 410, y: 220, w: 400, rowH: 32, gap: 12,
      items: [
        '1. authn      ·  identity from x509 / token / OIDC',
        '2. authz      ·  RBAC + Node + Webhook chain',
        '3. mutating   ·  webhooks may rewrite the object',
        '4. schema     ·  validate against OpenAPI schema',
        '5. validating ·  webhooks may reject the request',
        '6. persist    ·  write final object to etcd',
      ],
      cat: 'control',
    });

    const objChip       = valChip({ x: 820, y: 220, w: 350, h: 32, name: 'Pod object',    value: '{cpu=100m}' });
    const failurePolicy = valChip({ x: 820, y: 264, w: 350, h: 32, name: 'failurePolicy', value: '—' });

    root.appendChild(objChip);
    root.appendChild(failurePolicy);

    // Top-row arrows (out at y=100, return at y=130) — all dashed.
    root.appendChild(arrow({ x1: 380, y1: 100, x2: 460, y2: 100, dim: true, dashed: true, color: 'control' }));
    root.appendChild(arrow({ x1: 460, y1: 130, x2: 380, y2: 130, dim: true, dashed: true, color: 'control' }));
    root.appendChild(arrow({ x1: 760, y1: 100, x2: 850, y2: 100, dim: true, dashed: true, color: 'control' }));
    root.appendChild(arrow({ x1: 850, y1: 130, x2: 760, y2: 130, dim: true, dashed: true, color: 'control' }));

    // Connector ApiServer bottom → pipeline top.
    root.appendChild(arrow({ x1: 610, y1: 140, x2: 610, y2: 218, dim: true, dashed: true, color: 'control' }));

    // Solid colour-monotone connection line ETCD → chip column. No arrowhead, not dashed.
    root.appendChild(line({
      class: 'scheme-arrow scheme-arrow-control',
      x1: 920, y1: 154, x2: 920, y2: 220,
    }));

    // Wire labels.
    const wireReq  = text({ class: 'scheme-label code dim', x: 420, y: 46,  'text-anchor': 'middle' }, [' ']);
    const wireResp = text({ class: 'scheme-label code dim', x: 420, y: 158, 'text-anchor': 'middle' }, [' ']);
    [wireReq, wireResp].forEach(t => root.appendChild(t));

    // Packet layer.
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
  ['kubectl','api','etcdC','objChip','failurePolicy']
    .forEach(k => s.refs[k].classList.remove('highlight'));
  s.refs.chain.querySelectorAll('.scheme-chip').forEach(r => r.classList.remove('highlight'));
}

function clearWires(s) {
  Object.values(s.refs.wires).forEach(t => { t.textContent = ''; });
}

function setWire(s, key, txt) {
  if (s.refs.wires[key]) s.refs.wires[key].textContent = txt;
}

// Helper: a packet visible only while travelling along a single arrow segment.
function arrowPacket(s, ctx, { from, to, delay = 0, dur = 500, fadeIn = 80, fadeOut = 120 }) {
  const p = packet({ x: from[0], y: from[1], cat: 'control' });
  p.style.opacity = '0';
  s.refs.packetLayer.appendChild(p);
  ctx.register(p.animate(
    [{ opacity: 0 }, { opacity: 1 }],
    { duration: fadeIn, delay, fill: 'forwards', easing: 'linear' }
  ));
  ctx.register(p.animate(
    [
      { transform: `translate(${from[0]}px, ${from[1]}px)` },
      { transform: `translate(${to[0]}px, ${to[1]}px)` },
    ],
    { duration: dur, delay, fill: 'forwards', easing: 'linear' }
  ));
  ctx.register(p.animate(
    [{ opacity: 1 }, { opacity: 0 }],
    { duration: fadeOut, delay: delay + dur, fill: 'forwards', easing: 'linear' }
  ));
}

const ROW_Y = [236, 280, 324, 368, 412, 456];

const STEPS = [
  {
    id: 'idle',
    duration: 1500,
    narration: 'Six stages stand between an API request and etcd. Built-in stages always run, webhook stages run only when configurations exist.',
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
      // Two arrow segments: top arrow Kubectl→ApiServer, then down-connector ApiServer→pipeline.
      arrowPacket(s, ctx, { from: [380, 100], to: [460, 100], delay: 0,    dur: 600 });
      arrowPacket(s, ctx, { from: [610, 140], to: [610, 218], delay: 900,  dur: 600 });
      ctx.register(pulse(rows[0], { duration: 700, iterations: 1 }));
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
      if (ctx.reduced) return;
      ctx.register(pulse(rows[2], { duration: 800, iterations: 1 }));
    },
  },
  {
    id: 'schema',
    duration: 1500,
    narration: 'Built-in. The mutated object is validated against the resource\'s OpenAPI schema. Type errors and required-field violations are caught here, before validating webhooks run.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setVal(s.refs.failurePolicy, '—');
      const rows = s.refs.chain.querySelectorAll('.scheme-chip');
      if (rows[3]) rows[3].classList.add('highlight');
      if (ctx.reduced) return;
      ctx.register(pulse(rows[3], { duration: 800, iterations: 1 }));
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
      if (ctx.reduced) return;
      ctx.register(pulse(rows[4], { duration: 800, iterations: 1 }));
    },
  },
  {
    id: 'persist',
    duration: 2400,
    narration: 'Built-in. The apiserver writes the final object to etcd via Raft. Once ETCD commits, the apiserver returns HTTP 201 Created to the client and every open watch receives an ADDED event so informers can update their caches.',
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
      arrowPacket(s, ctx, { from: [760, 100], to: [850, 100], delay: 0,    dur: 600 });
      arrowPacket(s, ctx, { from: [850, 130], to: [760, 130], delay: 900,  dur: 600 });
      arrowPacket(s, ctx, { from: [460, 130], to: [380, 130], delay: 1800, dur: 600 });
      ctx.register(pulse(rows[5], { duration: 800, iterations: 1 }));
    },
  },
];

export function init(root, callbacks = {}) {
  const scene = new Scene(root);
  const tl = new Timeline({
    steps: STEPS,
    scene,
    onSceneReset: () => scene.reset(),
    onChange: callbacks.onStepChange,
    onPlayingChange: callbacks.onPlayingChange,
  });
  return {
    play: () => tl.play(),
    pause: () => tl.pause(),
    reset: () => tl.reset(),
    restart: () => tl.restart(),
    gotoStep: (i) => tl.gotoStep(i),
    setLoop: (b) => tl.setLoop(b),
    isLooping: () => tl.isLooping(),
    step: (dir) => tl.step(dir),
    setSpeed: (r) => tl.setSpeed(r),
    isPlaying: () => tl.isPlaying(),
    destroy: () => { tl.destroy(); root.replaceChildren(); },
  };
}
