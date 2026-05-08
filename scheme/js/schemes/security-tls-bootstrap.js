import { svg, g, rect, text } from '../lib/svg.js';
import { arrowDefs, pod, box, arrow, pathArrow, packet, animateAlong, pulse } from '../lib/primitives.js';
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
      'aria-label': 'Kubelet TLS bootstrap',
    });
    root.appendChild(arrowDefs());

    const nodeBox = box({ x: 40, y: 80, w: 360, h: 420, label: 'node-1 (joining)', sublabel: 'fresh VM, no client cert', cat: 'control' });
    root.appendChild(nodeBox);

    const kubelet = pod({ x: 80, y: 130, w: 280, h: 90, label: 'kubelet', sublabel: 'systemd unit', cat: 'control' });
    root.appendChild(kubelet);

    const tokenChip = valChip({ x: 80, y: 240, w: 280, name: 'bootstrap-token', value: 'abcdef.0123456789' });
    const certChip  = valChip({ x: 80, y: 290, w: 280, name: 'client cert',     value: 'absent' });
    const keyChip   = valChip({ x: 80, y: 340, w: 280, name: 'private key',     value: 'absent' });
    root.appendChild(tokenChip); root.appendChild(certChip); root.appendChild(keyChip);

    const api = box({ x: 460, y: 80, w: 220, h: 90, label: 'kube-apiserver', sublabel: 'CSR endpoint', cat: 'control' });
    root.appendChild(api);

    const csrObj = box({ x: 460, y: 200, w: 220, h: 100, label: 'CSR object', sublabel: 'pending', cat: 'security' });
    root.appendChild(csrObj);

    const approver = pod({ x: 720, y: 80, w: 320, h: 90, label: 'csr-approver', sublabel: 'controller-manager', cat: 'control' });
    root.appendChild(approver);

    const signer = pod({ x: 720, y: 200, w: 320, h: 100, label: 'csr-signer', sublabel: 'cluster CA', cat: 'security' });
    root.appendChild(signer);

    const csrStatus = valChip({ x: 460, y: 320, w: 580, h: 32, name: 'csr.status', value: 'Pending' });
    root.appendChild(csrStatus);

    const eventChip = valChip({ x: 460, y: 360, w: 580, h: 32, name: 'kubelet auth', value: 'using bootstrap token' });
    root.appendChild(eventChip);

    root.appendChild(pathArrow({ points: [[360, 175], [410, 175], [410, 125], [460, 125]], dim: true, color: 'security' }));
    root.appendChild(pathArrow({ points: [[680, 250], [700, 250], [700, 125], [720, 125]], dim: true, dashed: true, color: 'control' }));
    root.appendChild(arrow({ x1: 720, y1: 250, x2: 680, y2: 250, dim: true, dashed: true, color: 'security' }));
    root.appendChild(arrow({ x1: 460, y1: 290, x2: 360, y2: 290, dim: true, color: 'security' }));

    const packetLayer = g({ id: 'packetLayer' });
    root.appendChild(packetLayer);

    this.host.appendChild(root);
    this.refs = { svg: root, nodeBox, kubelet, tokenChip, certChip, keyChip, api, csrObj, approver, signer, csrStatus, eventChip, packetLayer };
  }

  reset() { this.build(); }
}

function clearHL(s) {
  ['nodeBox','kubelet','tokenChip','certChip','keyChip','api','csrObj','approver','signer','csrStatus','eventChip']
    .forEach(k => s.refs[k].classList.remove('highlight'));
}

const STEPS = [
  {
    id: 'idle',
    duration: 1500,
    narration: 'Fresh node has only a bootstrap token (kubeadm or cloud-init injected). No client certificate yet, so kubelet can\'t authenticate as system:node:<name> directly.',
    enter(s) {
      clearHL(s);
      s.refs.packetLayer.replaceChildren();
      setVal(s.refs.tokenChip, 'abcdef.0123456789');
      setVal(s.refs.certChip, 'absent');
      setVal(s.refs.keyChip, 'absent');
      setVal(s.refs.csrStatus, 'no CSR yet');
      setVal(s.refs.eventChip, 'using bootstrap token');
      s.refs.kubelet.classList.add('highlight');
    },
  },
  {
    id: 'submit-csr',
    duration: 1900,
    narration: 'kubelet generates a private key, builds a CSR with subject system:node:<name>/group system:nodes, and POSTs it. The bootstrap token authenticates this single call.',
    enter(s, ctx) {
      clearHL(s);
      s.refs.packetLayer.replaceChildren();
      setVal(s.refs.keyChip, 'generated locally');
      setVal(s.refs.csrStatus, 'Pending · awaiting approval');
      setVal(s.refs.eventChip, 'POST CertificateSigningRequest');
      s.refs.kubelet.classList.add('highlight');
      s.refs.api.classList.add('highlight');
      s.refs.csrObj.classList.add('highlight');
      const p = packet({ x: 360, y: 175, cat: 'security' });
      s.refs.packetLayer.appendChild(p);
      if (ctx.reduced) {
        p.style.transform = 'translate(460px, 125px)';
      } else {
        ctx.register(animateAlong(p, [[360, 175], [410, 175], [410, 125], [460, 125]], { duration: 1500 }));
      }
    },
  },
  {
    id: 'auto-approve',
    duration: 1900,
    narration: 'csr-approver controller watches CSRs. RBAC allows the bootstrap group to request system:nodes certs, signerName matches, and the controller flips condition Approved=true.',
    enter(s, ctx) {
      clearHL(s);
      s.refs.packetLayer.replaceChildren();
      setVal(s.refs.csrStatus, 'Approved · awaiting signer');
      setVal(s.refs.eventChip, 'auto-approve by csr-approver');
      s.refs.approver.classList.add('highlight');
      s.refs.csrObj.classList.add('highlight');
      if (!ctx.reduced) ctx.register(pulse(s.refs.approver, { duration: 800, iterations: 1 }));
    },
  },
  {
    id: 'sign',
    duration: 1900,
    narration: 'csr-signer signs the CSR with the cluster CA. The signed certificate ends up in csr.status.certificate, encoded PEM.',
    enter(s, ctx) {
      clearHL(s);
      s.refs.packetLayer.replaceChildren();
      setVal(s.refs.csrStatus, 'Issued · status.certificate populated');
      setVal(s.refs.eventChip, 'signed by cluster CA');
      s.refs.signer.classList.add('highlight');
      s.refs.csrObj.classList.add('highlight');
      if (!ctx.reduced) ctx.register(pulse(s.refs.signer, { duration: 800, iterations: 1 }));
    },
  },
  {
    id: 'store',
    duration: 1700,
    narration: 'kubelet polls its CSR, sees the signed cert, writes it under /var/lib/kubelet/pki/kubelet-client-current.pem alongside the private key.',
    enter(s, ctx) {
      clearHL(s);
      s.refs.packetLayer.replaceChildren();
      setVal(s.refs.certChip, 'stored locally');
      setVal(s.refs.eventChip, 'cert installed');
      s.refs.kubelet.classList.add('highlight');
      s.refs.certChip.classList.add('highlight');
      if (!ctx.reduced) ctx.register(pulse(s.refs.certChip, { duration: 800, iterations: 1 }));
    },
  },
  {
    id: 'normal-ops',
    duration: 1900,
    narration: 'kubelet now authenticates with the client cert (not the bootstrap token). It also schedules periodic CSRs to renew before expiry, again via the same flow.',
    enter(s, ctx) {
      clearHL(s);
      s.refs.packetLayer.replaceChildren();
      setVal(s.refs.tokenChip, 'discarded');
      setVal(s.refs.certChip, 'in use (renews automatically)');
      setVal(s.refs.eventChip, 'authenticating as system:node:node-1');
      s.refs.kubelet.classList.add('highlight');
      s.refs.api.classList.add('highlight');
      if (!ctx.reduced) ctx.register(pulse(s.refs.kubelet, { duration: 800, iterations: 1 }));
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
