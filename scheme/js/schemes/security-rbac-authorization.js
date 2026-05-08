import { svg, g, rect, text } from '../lib/svg.js';
import { arrowDefs, box, chainList, arrow, pulse } from '../lib/primitives.js';
import { Timeline } from '../lib/timeline.js';

function valChip({ x, y, w, h = 32, name, value, cat = 'security' }) {
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
      'aria-label': 'RBAC authorization flow',
    });
    root.appendChild(arrowDefs());

    const kubectl = box({ x: 60, y: 20, w: 240, h: 56, label: 'kubectl get pods', sublabel: 'as user alice', cat: 'control' });
    root.appendChild(kubectl);

    const api = box({ x: 360, y: 20, w: 240, h: 56, label: 'kube-apiserver', sublabel: 'authn / authz / admission', cat: 'control' });
    root.appendChild(api);

    const identity = valChip({ x: 660, y: 28, w: 380, h: 40, name: 'identity', value: 'user=alice  group=dev' });
    root.appendChild(identity);

    const authnChip = valChip({ x: 360, y: 96, w: 240, h: 30, name: 'authn', value: 'pending' });
    const authzChip = valChip({ x: 360, y: 130, w: 240, h: 30, name: 'authz', value: 'pending' });
    root.appendChild(authnChip);
    root.appendChild(authzChip);

    const bindings = chainList({
      x: 60, y: 200, w: 980,
      items: [
        'RoleBinding pod-reader  → User alice                  (ns default)',
        'CRB cluster-admin       → Group platform-team',
        'RoleBinding dev-edit    → ServiceAccount cd            (ns ci)',
      ],
      cat: 'security',
    });
    root.appendChild(bindings);

    const decision = valChip({ x: 60, y: 340, w: 980, h: 44, name: 'decision', value: 'pending' });
    root.appendChild(decision);

    const audit = box({ x: 60, y: 410, w: 980, h: 70, label: 'audit log', sublabel: 'no entry yet', cat: 'security' });
    root.appendChild(audit);

    root.appendChild(arrow({ x1: 300, y1: 48, x2: 360, y2: 48, dim: true, color: 'control' }));
    root.appendChild(arrow({ x1: 480, y1: 76, x2: 480, y2: 96, dim: true, color: 'control' }));
    root.appendChild(arrow({ x1: 480, y1: 160, x2: 480, y2: 200, dim: true, dashed: true, color: 'security' }));
    root.appendChild(arrow({ x1: 550, y1: 280, x2: 550, y2: 340, dim: true, dashed: true, color: 'security' }));
    root.appendChild(arrow({ x1: 550, y1: 384, x2: 550, y2: 410, dim: true, color: 'security' }));

    this.host.appendChild(root);
    this.refs = { svg: root, kubectl, api, identity, authnChip, authzChip, bindings, decision, audit };
  }

  reset() { this.build(); }
}

function clearHL(s) {
  ['kubectl','api','identity','authnChip','authzChip','decision','audit'].forEach(k => s.refs[k].classList.remove('highlight'));
  s.refs.bindings.querySelectorAll('.scheme-chip').forEach(r => r.classList.remove('highlight'));
}

const STEPS = [
  {
    id: 'idle',
    duration: 1500,
    narration: 'alice sends GET /api/v1/namespaces/default/pods. apiserver must decide whether she may read pods in the default namespace.',
    enter(s) {
      clearHL(s);
      setVal(s.refs.authnChip, 'pending');
      setVal(s.refs.authzChip, 'pending');
      setVal(s.refs.decision, 'pending');
      const subL = s.refs.audit.querySelector('.scheme-box-sublabel');
      if (subL) subL.textContent = 'no entry yet';
      s.refs.kubectl.classList.add('highlight');
    },
  },
  {
    id: 'authn',
    duration: 1700,
    narration: 'authn modules (x509 / token / OIDC) verify the credential. apiserver attaches identity (user, groups) to the request context.',
    enter(s, ctx) {
      clearHL(s);
      setVal(s.refs.authnChip, 'verified');
      s.refs.kubectl.classList.add('highlight');
      s.refs.api.classList.add('highlight');
      s.refs.authnChip.classList.add('highlight');
      s.refs.identity.classList.add('highlight');
      if (!ctx.reduced) ctx.register(pulse(s.refs.identity, { duration: 800, iterations: 1 }));
    },
  },
  {
    id: 'sar',
    duration: 1900,
    narration: 'authz modules run in order. RBAC builds a SubjectAccessReview: can user=alice perform verb=get on resource=pods in namespace=default?',
    enter(s, ctx) {
      clearHL(s);
      setVal(s.refs.authnChip, 'verified');
      setVal(s.refs.authzChip, 'evaluating');
      s.refs.api.classList.add('highlight');
      s.refs.authzChip.classList.add('highlight');
      s.refs.bindings.classList.add('highlight');
      if (!ctx.reduced) ctx.register(pulse(s.refs.bindings, { duration: 800, iterations: 1 }));
    },
  },
  {
    id: 'match',
    duration: 1900,
    narration: 'RBAC walks all RoleBindings and ClusterRoleBindings. The first match: pod-reader binding gives alice get/list on pods in default. Rule matches.',
    enter(s, ctx) {
      clearHL(s);
      setVal(s.refs.authnChip, 'verified');
      setVal(s.refs.authzChip, 'match');
      const rows = s.refs.bindings.querySelectorAll('.scheme-chip');
      if (rows[0]) rows[0].classList.add('highlight');
      s.refs.authzChip.classList.add('highlight');
      if (!ctx.reduced) ctx.register(pulse(rows[0], { duration: 800, iterations: 2 }));
    },
  },
  {
    id: 'allow',
    duration: 1900,
    narration: 'Decision: ALLOW. Request proceeds to admission. audit logs the decision (verb, user, resource, decision, reason).',
    enter(s, ctx) {
      clearHL(s);
      setVal(s.refs.authnChip, 'verified');
      setVal(s.refs.authzChip, 'allow');
      setVal(s.refs.decision, 'ALLOW · alice can get pods in default');
      const subL = s.refs.audit.querySelector('.scheme-box-sublabel');
      if (subL) subL.textContent = 'logged: alice GET pods/default ALLOW';
      s.refs.bindings.querySelectorAll('.scheme-chip')[0].classList.add('highlight');
      s.refs.decision.classList.add('highlight');
      s.refs.audit.classList.add('highlight');
      if (!ctx.reduced) {
        ctx.register(pulse(s.refs.decision, { duration: 800, iterations: 1 }));
        ctx.register(pulse(s.refs.audit, { duration: 800, iterations: 1 }));
      }
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
