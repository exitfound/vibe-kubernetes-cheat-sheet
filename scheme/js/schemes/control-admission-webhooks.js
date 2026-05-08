import { svg, g, rect, text } from '../lib/svg.js';
import { arrowDefs, box, cylinder, chainList, arrow, pulse } from '../lib/primitives.js';
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
      viewBox: '0 0 1100 540',
      preserveAspectRatio: 'xMidYMid meet',
      'aria-label': 'Admission chain: mutating then validating',
    });
    root.appendChild(arrowDefs());

    const kubectl = box({ x: 40, y: 20, w: 220, h: 60, label: 'kubectl apply', sublabel: 'POST /api/v1/...', cat: 'control' });
    const api     = box({ x: 320, y: 20, w: 240, h: 60, label: 'kube-apiserver', sublabel: 'admission pipeline', cat: 'control' });
    root.appendChild(kubectl);
    root.appendChild(api);

    const objChip = valChip({ x: 600, y: 32, w: 460, h: 44, name: 'Pod object', value: '{requests.cpu=100m}' });
    root.appendChild(objChip);

    const legend = valChip({ x: 820, y: 130, w: 240, h: 32, name: 'legend', value: '■ built-in   ▸ webhook' });
    root.appendChild(legend);

    const failurePolicy = valChip({ x: 820, y: 168, w: 240, h: 32, name: 'failurePolicy', value: '—' });
    root.appendChild(failurePolicy);

    const chain = chainList({
      x: 40, y: 130, w: 760,
      items: [
        '■ 1. authn        identity from x509 / token / OIDC',
        '■ 2. authz        RBAC + Node + ABAC chain',
        '▸ 3. mutating     webhooks may rewrite the object',
        '■ 4. schema       validate against OpenAPI schema',
        '▸ 5. validating   webhooks may reject the request',
        '■ 6. persist      write final object to etcd',
      ],
      cat: 'control',
    });
    root.appendChild(chain);

    const etcdC = cylinder({ x: 820, y: 220, w: 220, h: 100, label: 'etcd', cat: 'control' });
    root.appendChild(etcdC);

    root.appendChild(arrow({ x1: 260, y1: 50, x2: 320, y2: 50, dim: true, color: 'control' }));
    root.appendChild(arrow({ x1: 800, y1: 270, x2: 820, y2: 270, dim: true, color: 'control' }));

    this.host.appendChild(root);
    this.refs = { svg: root, kubectl, api, objChip, legend, failurePolicy, chain, etcdC };
  }

  reset() { this.build(); }
}

function clearHL(s) {
  ['kubectl','api','objChip','etcdC','failurePolicy'].forEach(k => s.refs[k].classList.remove('highlight'));
  s.refs.chain.querySelectorAll('.scheme-chip').forEach(r => r.classList.remove('highlight'));
}

const STEPS = [
  {
    id: 'idle',
    duration: 1400,
    narration: 'Six stages stand between an API request and etcd. Built-in stages always run, webhook stages run only when configurations exist.',
    enter(s) {
      clearHL(s);
      setVal(s.refs.objChip, '{requests.cpu=100m}');
      setVal(s.refs.failurePolicy, '—');
      s.refs.kubectl.classList.add('highlight');
    },
  },
  {
    id: 'authn-authz',
    duration: 1700,
    narration: 'Built-in. Authn binds an identity (cert / token / OIDC), then authz consults RBAC, Node, ABAC. Failure ends the request immediately with 401 or 403.',
    enter(s, ctx) {
      clearHL(s);
      setVal(s.refs.failurePolicy, '—');
      s.refs.kubectl.classList.add('highlight');
      s.refs.api.classList.add('highlight');
      const rows = s.refs.chain.querySelectorAll('.scheme-chip');
      if (rows[0]) rows[0].classList.add('highlight');
      if (rows[1]) rows[1].classList.add('highlight');
      if (!ctx.reduced) ctx.register(pulse(rows[0], { duration: 700, iterations: 1 }));
    },
  },
  {
    id: 'mutating',
    duration: 1900,
    narration: 'Pluggable. MutatingWebhookConfiguration objects route the request through external policy webhooks (Kyverno, OPA, sidecar injectors) that can rewrite the object.',
    enter(s, ctx) {
      clearHL(s);
      s.refs.api.classList.add('highlight');
      const rows = s.refs.chain.querySelectorAll('.scheme-chip');
      if (rows[2]) rows[2].classList.add('highlight');
      setVal(s.refs.objChip, '{requests.cpu=100m, securityContext.runAsNonRoot=true}');
      setVal(s.refs.failurePolicy, 'Fail | Ignore');
      s.refs.objChip.classList.add('highlight');
      s.refs.failurePolicy.classList.add('highlight');
      if (!ctx.reduced) {
        ctx.register(pulse(rows[2], { duration: 800, iterations: 1 }));
        ctx.register(pulse(s.refs.objChip, { duration: 800, iterations: 1 }));
      }
    },
  },
  {
    id: 'schema',
    duration: 1500,
    narration: 'Built-in. The mutated object is validated against the resource\'s OpenAPI schema. Type errors and required-field violations are caught here, before any policy.',
    enter(s, ctx) {
      clearHL(s);
      setVal(s.refs.failurePolicy, '—');
      const rows = s.refs.chain.querySelectorAll('.scheme-chip');
      if (rows[3]) rows[3].classList.add('highlight');
      if (!ctx.reduced) ctx.register(pulse(rows[3], { duration: 700, iterations: 1 }));
    },
  },
  {
    id: 'validating',
    duration: 1900,
    narration: 'Pluggable. ValidatingWebhookConfiguration webhooks inspect the final object and may only allow or deny — they cannot mutate. Any deny aborts the request.',
    enter(s, ctx) {
      clearHL(s);
      const rows = s.refs.chain.querySelectorAll('.scheme-chip');
      if (rows[4]) rows[4].classList.add('highlight');
      setVal(s.refs.failurePolicy, 'Fail | Ignore');
      s.refs.failurePolicy.classList.add('highlight');
      if (!ctx.reduced) ctx.register(pulse(rows[4], { duration: 700, iterations: 1 }));
    },
  },
  {
    id: 'persist',
    duration: 1700,
    narration: 'Built-in. apiserver writes the final object to etcd via Raft. Informers wake up and the request returns 201 Created.',
    enter(s, ctx) {
      clearHL(s);
      setVal(s.refs.failurePolicy, '—');
      const rows = s.refs.chain.querySelectorAll('.scheme-chip');
      if (rows[5]) rows[5].classList.add('highlight');
      s.refs.etcdC.classList.add('highlight');
      if (!ctx.reduced) ctx.register(pulse(s.refs.etcdC, { duration: 800, iterations: 2 }));
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
