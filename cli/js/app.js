import { COPY_ICON, CHECK_ICON, STAR_ICON, LINK_ICON, DOCS_ICON, CONTACT_ICON, SPONSOR_ICON, SECTIONS } from './data.js';
import { setupSidebar } from './lib/sidebar.js';
import { setupKeysHelp, isSlash } from './lib/keys.js';
import { trackFresh, hashKey } from './lib/fresh.js';

setupSidebar();

// Yield one painted frame before building the heavy command list below, so
// navigation shows the dark shell instantly instead of a blank canvas flash.
await new Promise(resolve => requestAnimationFrame(() => setTimeout(resolve, 0)));

document.getElementById('year').textContent = new Date().getFullYear();

// ── Constants ────────────────────────────────────────────────
const SCROLL_THRESHOLD = 300;
const TOAST_DURATION   = 2000;
const COPY_RESET_DELAY = 1500;
const SEARCH_DEBOUNCE  = 80;
const STARRED_KEY      = 'kube-how:starred:v1';
const ISSUES_URL       = 'https://github.com/exitfound/vibe-kubernetes-cheat-sheet/issues/new';
const REPORT_ICON      = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 22V4"/><path d="M4 4h13l-2 4.5L17 13H4"/></svg>`;

// ── Starred commands (persisted) ─────────────────────────────
// Command strings rewritten in the Kubernetes 1.35 / Helm 4 refresh (2026-10). A star saved
// under the old string follows its command instead of silently disappearing.
const STAR_RENAMES = {
  "apt-get update && apt-get install -y apt-transport-https ca-certificates curl": "apt-get update && apt-get install -y apt-transport-https ca-certificates curl gpg",
  "curl -fsSL https://pkgs.k8s.io/core:/stable:/v1.32/deb/Release.key | gpg --dearmor -o /etc/apt/keyrings/kubernetes-apt-keyring.gpg": "curl -fsSL https://pkgs.k8s.io/core:/stable:/v1.35/deb/Release.key | gpg --dearmor -o /etc/apt/keyrings/kubernetes-apt-keyring.gpg",
  "echo \"deb [signed-by=/etc/apt/keyrings/kubernetes-apt-keyring.gpg] https://pkgs.k8s.io/core:/stable:/v1.32/deb/ /\" | tee /etc/apt/sources.list.d/kubernetes.list": "echo \"deb [signed-by=/etc/apt/keyrings/kubernetes-apt-keyring.gpg] https://pkgs.k8s.io/core:/stable:/v1.35/deb/ /\" | tee /etc/apt/sources.list.d/kubernetes.list",
  "kubeadm init --cri-socket /run/containerd/containerd.sock": "kubeadm init --cri-socket unix:///var/run/containerd/containerd.sock",
  "k3d kubeconfig merge <name> --switch-context": "k3d kubeconfig merge <name> --kubeconfig-switch-context",
  "curl -Lo ./kind https://kind.sigs.k8s.io/dl/latest/kind-linux-amd64 && chmod +x ./kind && sudo mv ./kind /usr/local/bin/": "curl -Lo ./kind https://kind.sigs.k8s.io/dl/v0.33.0/kind-linux-amd64 && chmod +x ./kind && sudo mv ./kind /usr/local/bin/",
  "kind export logs --name <name> --outdir <dir>": "kind export logs <dir> --name <name>",
  "curl -LO https://storage.googleapis.com/minikube/releases/latest/minikube-linux-amd64 && sudo install minikube-linux-amd64 /usr/local/bin/minikube": "curl -LO https://github.com/kubernetes/minikube/releases/latest/download/minikube-linux-amd64 && sudo install minikube-linux-amd64 /usr/local/bin/minikube",
  "minikube start --driver hyperkit": "minikube start --driver vfkit",
  "kubectl autoscale deploy/<name> --min=2 --max=10 --cpu-percent=80": "kubectl autoscale deploy/<name> --min=2 --max=10 --cpu=80%",
  "kubectl get endpoints <name>": "kubectl get endpointslices -l kubernetes.io/service-name=<name>",
  "kubectl annotate sc <name> storageclass.kubernetes.io/is-default-class=true": "kubectl annotate sc <name> storageclass.kubernetes.io/is-default-class=true --overwrite",
  "kubectl get gateways -o wide": "kubectl get gateways",
  "kubectl get httproutes -o wide": "kubectl get httproutes",
  "kubectl annotate ingressclass <name> ingressclass.kubernetes.io/is-default-class=true": "kubectl annotate ingressclass <name> ingressclass.kubernetes.io/is-default-class=true --overwrite",
  "kubectl auth can-i get pods/log --as=<user>": "kubectl auth can-i get pods --subresource=log --as=<user>",
  "curl https://raw.githubusercontent.com/helm/helm/main/scripts/get-helm-3 | bash": "curl https://raw.githubusercontent.com/helm/helm/main/scripts/get-helm-4 | bash",
  "helm install <release> <chart> --dry-run": "helm install <release> <chart> --dry-run=client",
  "helm install <release> <chart> --atomic": "helm install <release> <chart> --rollback-on-failure",
  "helm upgrade <release> <chart> --atomic": "helm upgrade <release> <chart> --rollback-on-failure",
  "helm plugin install <url>": "helm plugin install <url> --verify=false",
  "kustomize edit set namesuffix -<suffix>": "kustomize edit set namesuffix -- -<suffix>",
  "kustomize edit add label <key>:<value>": "kustomize edit add label <key>:<value> --without-selector",
  ":pvcs": ":pvc",
  "kubectl get events -n kube-system --sort-by='.lastTimestamp'": "kubectl get events -n kube-system --sort-by='.metadata.creationTimestamp'",
  "k3s kubectl get events -n kube-system --sort-by='.lastTimestamp'": "k3s kubectl get events -n kube-system --sort-by='.metadata.creationTimestamp'",
  "kubectl get events --sort-by='.lastTimestamp'": "kubectl get events --sort-by='.metadata.creationTimestamp'",
  "minikube ssh -- journalctl -u kubelet -f": "minikube ssh -- sudo journalctl -u kubelet -f",
  "minikube ssh -- crictl ps -a": "minikube ssh -- sudo crictl ps -a",
  "minikube kubectl -- get events --sort-by='.lastTimestamp'": "minikube kubectl -- get events --sort-by='.metadata.creationTimestamp'",
  "kubectl get events -A --sort-by='.lastTimestamp'": "kubectl get events -A --sort-by='.metadata.creationTimestamp'",
  "kubectl debug <pod> -it --image=busybox --copy-to=<debug-pod> --share-processes": "kubectl debug <pod> -it --image=busybox --copy-to=<debug-pod> --share-processes --profile=general",
  "kubectl debug <pod> -it --image=busybox --copy-to=<debug-pod>": "kubectl debug <pod> -it --image=busybox --copy-to=<debug-pod> --profile=general",
  "kubectl debug -it <pod> --image=alpine --profile=restricted": "kubectl debug -it <pod> --image=<nonroot-image> --profile=restricted",
  "kubectl debug -it <pod> --image=nicolaka/netshoot --target=<container>": "kubectl debug -it <pod> --image=nicolaka/netshoot --target=<container> --profile=general",
  "kubectl debug node/<node> -it --image=busybox": "kubectl debug node/<node> -it --image=busybox --profile=sysadmin",
  "kubectl exec -it <pod> -- touch <mount-path>/.write-test && rm <mount-path>/.write-test": "kubectl exec <pod> -- sh -c \"touch <mount-path>/.write-test && rm <mount-path>/.write-test\"",
  "kubectl exec -it <pod> -- cat /sys/fs/cgroup/memory/memory.usage_in_bytes": "kubectl exec -it <pod> -- cat /sys/fs/cgroup/memory.current",
  "kubectl get events --field-selector=reason=FailedToCreatePodSandbox": "kubectl get events --field-selector=reason=FailedCreatePodSandBox",
  "kubectl get events --field-selector=reason=FailedScheduling -A --sort-by='.lastTimestamp'": "kubectl get events --field-selector=reason=FailedScheduling -A --sort-by='.metadata.creationTimestamp'",
  "helm install <release> <chart> --dry-run --debug": "helm install <release> <chart> --dry-run=client --debug",
  "kustomize build --enable-alpha-plugins <dir>": "kustomize build --enable-alpha-plugins --enable-exec <dir>",
  "tail -f ~/.local/share/k9s/k9s.log": "tail -f ~/.local/state/k9s/k9s.log",
  "tail -f ~/Library/Logs/k9s/k9s.log": "tail -f \"$HOME/Library/Application Support/k9s/k9s.log\"",
  "cat ~/.local/share/k9s/k9s.log | grep -i error": "grep -i error ~/.local/state/k9s/k9s.log",
  "cat ~/Library/Logs/k9s/k9s.log | grep -i error": "grep -i error \"$HOME/Library/Application Support/k9s/k9s.log\"",
};

const starred = (() => {
  try {
    const raw = localStorage.getItem(STARRED_KEY);
    const saved = raw ? JSON.parse(raw) : [];
    const set = new Set(saved.map(cmd => STAR_RENAMES[cmd] || cmd));
    if (saved.some(cmd => cmd in STAR_RENAMES)) {
      localStorage.setItem(STARRED_KEY, JSON.stringify([...set]));
    }
    return set;
  } catch (_) { return new Set(); }
})();

function persistStarred() {
  try { localStorage.setItem(STARRED_KEY, JSON.stringify([...starred])); } catch (_) {}
}

function isStarred(cmd) { return starred.has(cmd); }

// ── HTML escape ───────────────────────────────────────────────
function escapeHtml(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// ── Syntax Highlighter ────────────────────────────────────────
function hl(raw, { slashBreaks = true } = {}) {
  const e = s => s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

  const tokens = raw.split(' ').filter(Boolean);

  // Flags and short tokens go in an unbreakable .tok box (see styles.css), so a line never breaks
  // inside "--token" or "$(id -u)". A long URL or path stays inline and wraps after a "/" while
  // sharing its lines with its neighbours, instead of taking whole lines to itself. The browser
  // offers no break after "/" on its own, so a <wbr> goes after each one, in text and never in a tag.
  // The <wbr> splits the text node, and applyMark() matches inside one node, so a search for a
  // string with a "/" in it renders without them.
  return tokens.map((tok, i) => {
    const html = hlTok(tok, i);
    if (tok.startsWith('-') || tok.length <= 30) return `<span class="tok">${html}</span>`;
    if (!slashBreaks) return html;
    return html.split(/(<[^>]*>)/).map(part => part.startsWith('<') ? part : part.replace(/\//g, '/<wbr>')).join('');
  }).join(' ');

  function hlTok(tok, i) {
    // Main binary
    if (i === 0) return `<span class="hl-cmd">${e(tok)}</span>`;

    // Sub-command (not a flag or placeholder)
    if (i === 1 && !/^[-<\[]/.test(tok)) return `<span class="hl-sub">${e(tok)}</span>`;

    // Separators: --, |, >, >>
    if (tok === '--' || tok === '|' || tok === '>' || tok === '>>') {
      return `<span class="hl-sep">${e(tok)}</span>`;
    }

    // Flags (with optional =value)
    if (/^--?[a-zA-Z]/.test(tok)) {
      const eq = tok.indexOf('=');
      if (eq > 0) {
        return `<span class="hl-flag">${e(tok.slice(0, eq))}</span>=<span class="hl-val">${e(tok.slice(eq + 1))}</span>`;
      }
      return `<span class="hl-flag">${e(tok)}</span>`;
    }

    // Placeholders <name> or [flags]
    if (/^[<\[]/.test(tok)) return `<span class="hl-ph">${e(tok)}</span>`;

    // Resource type (third token in kubectl get/describe/delete …)
    if (i === 2 && /^[a-z]/.test(tok) && !tok.startsWith("'") && !tok.startsWith('"') && !tok.startsWith('{')) {
      return `<span class="hl-res">${e(tok)}</span>`;
    }

    // Quoted strings / JSON / jsonpath
    if (/^['"{]/.test(tok)) return `<span class="hl-str">${e(tok)}</span>`;

    return `<span class="hl-val">${e(tok)}</span>`;
  }
}

// ── Search helpers ────────────────────────────────────────────
function escapeRe(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function applyMark(el, q) {
  const re = new RegExp('(' + escapeRe(q) + ')', 'gi');
  const walk = (node) => {
    if (node.nodeType === 3) {
      const text = node.textContent;
      if (!text.toLowerCase().includes(q)) return;
      const parts = text.split(re);
      if (parts.length <= 1) return;
      const frag = document.createDocumentFragment();
      parts.forEach((part, i) => {
        if (i % 2 === 1) {
          const mark = document.createElement('mark');
          mark.textContent = part;
          frag.appendChild(mark);
        } else if (part) {
          frag.appendChild(document.createTextNode(part));
        }
      });
      node.parentNode.replaceChild(frag, node);
    } else if (node.nodeType === 1 && node.tagName !== 'MARK') {
      [...node.childNodes].forEach(walk);
    }
  };
  walk(el);
}

// ── Navigation data ───────────────────────────────────────────
const GROUPS = {
  kubernetes:      ['installation', 'cluster', 'workloads'],
  tools:           ['helm', 'kustomize', 'k9s'],
  troubleshooting: ['troubleshooting-kubernetes', 'troubleshooting-tools'],
  starred:         [], // pseudo-group: no categories, filtered per-command
};

const CATEGORIES = {
  installation: ['install-kubeadm','install-k3s','install-k3d','install-kind','install-minikube'],
  cluster:      ['cluster-health','node','crd','context'],
  workloads:    ['pod','deployment','statefulset','daemonset','service','config','job','volume','network','rbac','namespace'],
  helm:         ['helm-releases', 'helm-charts'],
  kustomize:    ['kustomize-manage', 'kustomize-edit'],
  k9s:          ['k9s-cli', 'k9s-ui'],
  'troubleshooting-kubernetes': ['troubleshooting-installation','troubleshooting-cluster','troubleshooting-network','troubleshooting-storage','troubleshooting-resources','troubleshooting-scheduling'],
  'troubleshooting-tools':      ['troubleshooting-helm','troubleshooting-kustomize','troubleshooting-k9s'],
};

const GROUP_LABELS = {
  kubernetes:      'Kubernetes',
  tools:           'Tools',
  troubleshooting: 'Troubleshooting',
  starred:         'Starred',
};

const CATEGORY_LABELS = {
  installation: 'Installation',
  cluster:      'Cluster',
  workloads:    'Workloads',
  helm:         'Helm',
  kustomize:    'Kustomize',
  k9s:          'K9s',
  'troubleshooting-kubernetes': 'Debug K8s',
  'troubleshooting-tools':      'Debug Tools',
};

const SUB_LABELS = Object.fromEntries(SECTIONS.map(s => [s.id, s.title]));

function groupOfCategory(cat) {
  for (const [g, cats] of Object.entries(GROUPS)) if (cats.includes(cat)) return g;
  return null;
}
function categoryOfSection(id) {
  for (const [c, ids] of Object.entries(CATEGORIES)) if (ids.includes(id)) return c;
  return null;
}

// A new GitHub issue with the section already named, so a report about a wrong flag or a stale
// command arrives with the place it came from.
function reportUrl(section) {
  const title = `[cli] ${section.title}: `;
  const body = [
    `Section: ${section.title} (${section.sub})`,
    `Link: https://kube.how/cli/#${section.id}`,
    '',
    'Command:',
    '',
    'What is wrong:',
    '',
  ].join('\n');
  return `${ISSUES_URL}?title=${encodeURIComponent(title)}&body=${encodeURIComponent(body)}`;
}

// "New since your last visit" (lib/fresh.js), keyed by a hash of the raw command. A copy clears it.
const fresh = trackFresh('kube-how:cli-seen:v1', SECTIONS.flatMap(s => s.groups.flatMap(g => g.cmds.map(c => hashKey(c.cmd)))));
const isNewCmd = (raw) => fresh.isNew(hashKey(raw));

function newChip(n) {
  return n ? `<span class="section-new" title="New since your last visit">${n} new</span>` : '';
}

// ── Rendering ─────────────────────────────────────────────────
function renderSection(section) {
  const cat   = categoryOfSection(section.id) ?? 'all';
  const group = groupOfCategory(cat) ?? 'all';
  const groups = section.groups
    .map((g, gi) => renderCard(g, gi))
    .join('');
  const total = section.groups.reduce((n, g) => n + g.cmds.length, 0);
  const label = total === 1 ? 'command' : 'commands';
  const freshCount = section.groups.reduce((n, g) => n + g.cmds.filter(c => isNewCmd(c.cmd)).length, 0);

  return `
    <section class="section" data-section="${escapeHtml(section.id)}" data-cat="${cat}" data-group="${group}">
      <div class="section-header">
        <div class="section-icon">${section.icon}</div>
        <h2 class="section-title">${escapeHtml(section.title)}</h2>
        <span class="section-sub">${escapeHtml(section.sub)}</span>
        <span class="section-actions">
          <button class="section-action section-link" type="button" title="Copy link to this section" aria-label="Copy link to the ${escapeHtml(section.title)} section">${LINK_ICON}</button>
          ${section.docs ? `<a class="section-action" href="${escapeHtml(section.docs)}" target="_blank" rel="noopener" title="Official documentation" aria-label="${escapeHtml(section.title)} documentation">${DOCS_ICON}</a>` : ''}
          <a class="section-action" href="${escapeHtml(reportUrl(section))}" target="_blank" rel="noopener" title="Report a problem in this section" aria-label="Report a problem in the ${escapeHtml(section.title)} section">${REPORT_ICON}</a>
        </span>
        <span class="section-meta">
          ${newChip(freshCount)}
          ${section.version ? `<span class="section-version">${escapeHtml(section.version)}</span>` : ''}
          <span class="section-count">${total} ${label}</span>
        </span>
      </div>
      <div class="cards-grid">${groups}</div>
    </section>`;
}

function sortCmds(cmds) {
  const subCmd   = cmd => cmd.split(' ')[1] || '';
  const flagCount = cmd => cmd.split(' ').filter(t => /^--?[a-zA-Z]/.test(t)).length;
  return [...cmds].sort((a, b) => {
    const subDiff  = subCmd(a.cmd).localeCompare(subCmd(b.cmd));
    if (subDiff !== 0) return subDiff;
    const flagDiff = flagCount(a.cmd) - flagCount(b.cmd);
    return flagDiff !== 0 ? flagDiff : a.cmd.localeCompare(b.cmd);
  });
}

function renderCard(group, gi) {
  const desc = group.desc ? `<div class="card-desc">${escapeHtml(group.desc)}</div>` : '';
  const cmds = sortCmds(group.cmds).map(c => renderCmd(c)).join('');
  return `
    <div class="card" data-card="${gi}">
      <div class="card-title">${escapeHtml(group.title)}</div>
      ${desc}
      <div class="cmd-list">${cmds}</div>
    </div>`;
}

function renderCmd(item) {
  const starredCls = isStarred(item.cmd) ? ' starred' : '';
  return `
    <div class="cmd-item${isNewCmd(item.cmd) ? ' is-new' : ''}" data-raw="${escapeHtml(item.cmd)}" data-desc="${escapeHtml(item.desc)}">
      <div class="cmd-code">${hl(item.cmd)}</div>
      <div class="cmd-desc">${escapeHtml(item.desc)}</div>
      <button class="star-btn${starredCls}" title="Toggle star" aria-label="Toggle star" aria-pressed="${isStarred(item.cmd)}">${STAR_ICON}</button>
      <button class="copy-btn" title="Copy command" aria-label="Copy command">${COPY_ICON}</button>
    </div>`;
}

// ── Copy to clipboard ─────────────────────────────────────────
let toastTimer;
let copyTimer;
const toast = document.getElementById('toast');

function showToast() {
  clearTimeout(toastTimer);
  toast.classList.add('show');
  toastTimer = setTimeout(() => toast.classList.remove('show'), TOAST_DURATION);
}

// The clipboard holds one command, so only the button that put it there shows the check: a new copy
// resets whichever command button was still showing one. Its own timer, not the shared `copyTimer`,
// so a wallet copy in the header cannot cancel a command button's reset and leave it stuck.
let cmdCopyTimer;

function resetCmdCopyBtn(btn) {
  btn.innerHTML = COPY_ICON;
  btn.classList.remove('copied');
}

// A copied command is no longer news: its badge goes everywhere it appears, and each section's
// "N new" chip is recounted.
function clearNew(raw) {
  if (!isNewCmd(raw)) return;
  fresh.clear(hashKey(raw));
  document.querySelectorAll(`.cmd-item[data-raw="${escapeAttr(raw)}"]`).forEach(el => {
    el.classList.remove('is-new');
    const sec = el.closest('.section');
    const meta = sec && sec.querySelector('.section-meta');
    if (!meta) return;
    meta.querySelector('.section-new')?.remove();
    meta.insertAdjacentHTML('afterbegin', newChip(sec.querySelectorAll('.cmd-item.is-new').length));
  });
}

function copyCmd(item) {
  const raw = item.dataset.raw;
  clearNew(raw);

  const finish = () => {
    showToast();
    const btn = item.querySelector('.copy-btn');
    clearTimeout(cmdCopyTimer);
    document.querySelectorAll('.cmd-item .copy-btn.copied').forEach(resetCmdCopyBtn);
    btn.innerHTML = CHECK_ICON;
    btn.classList.add('copied');
    cmdCopyTimer = setTimeout(() => resetCmdCopyBtn(btn), COPY_RESET_DELAY);
  };

  if (navigator.clipboard && window.isSecureContext) {
    navigator.clipboard.writeText(raw).then(finish).catch(() => fallbackCopy(raw, finish));
  } else {
    fallbackCopy(raw, finish);
  }
}

// The section ids double as hash routes, so a copied link opens the page filtered to that section.
function copySectionLink(id) {
  const url = `${location.origin}${location.pathname}#${id}`;
  if (navigator.clipboard && window.isSecureContext) {
    navigator.clipboard.writeText(url).then(showToast).catch(() => fallbackCopy(url, showToast));
  } else {
    fallbackCopy(url, showToast);
  }
}

function fallbackCopy(text, callback) {
  const ta = document.createElement('textarea');
  ta.value = text;
  ta.style.cssText = 'position:fixed;top:-9999px;left:-9999px;opacity:0;pointer-events:none';
  document.body.appendChild(ta);
  ta.focus();
  ta.select();
  try { document.execCommand('copy'); callback(); } catch (_) {}
  document.body.removeChild(ta);
}

// ── Three-level navigation ───────────────────────────────────
let activeGroup    = 'all';
let activeCategory = 'all';
let activeSub      = 'all';

function sectionInScope(id) {
  if (activeGroup === 'all' || activeGroup === 'starred') return true;
  const cat = categoryOfSection(id);
  if (!cat || !GROUPS[activeGroup].includes(cat)) return false;
  if (activeCategory !== 'all' && cat !== activeCategory) return false;
  return activeSub === 'all' || activeSub === id;
}

function renderMidNav(group) {
  const navMid = document.getElementById('navMid');
  const inner  = document.getElementById('navMidInner');
  const cats   = GROUPS[group] || [];

  if (!cats.length) { navMid.hidden = true; return; }

  navMid.dataset.group = group;

  // Mid row: leading "All" + separator (mirrors top row), then category buttons.
  const isAllActive = activeCategory === 'all';
  const parts = [
    `<button class="nav-btn cat-btn${isAllActive ? ' active' : ''}" data-cat="all" type="button">All</button>`,
    `<span class="nav-sep"></span>`,
    ...cats.map(c => {
      const isActive = c === activeCategory;
      return `<button class="nav-btn cat-btn${isActive ? ' active' : ''}" data-cat="${c}" type="button">${escapeHtml(CATEGORY_LABELS[c] || c)}</button>`;
    })
  ];
  inner.innerHTML = parts.join('');

  inner.querySelectorAll('.cat-btn').forEach(btn => {
    btn.addEventListener('click', () => applyCategory(btn.dataset.cat));
  });

  navMid.hidden = false;
}

function renderSubNav(cat) {
  const navSub = document.getElementById('navSub');
  const inner  = document.getElementById('navSubInner');
  const ids    = CATEGORIES[cat] || [];

  if (!ids.length) { navSub.hidden = true; return; }

  navSub.dataset.cat = cat;
  inner.innerHTML = ids.map(id => {
    const isActive = id === activeSub;
    return `<button class="nav-btn sec-btn${isActive ? ' active' : ''}" data-sub="${id}" type="button">${escapeHtml(SUB_LABELS[id] || id)}</button>`;
  }).join('');

  inner.querySelectorAll('.sec-btn').forEach(btn => {
    btn.addEventListener('click', () => applySub(btn.dataset.sub));
  });

  navSub.hidden = false;
  // Align sub-row content with the active category button on the row above
  requestAnimationFrame(alignSubNav);
}

/** Indent navSubInner so its first chip lines up under the FIRST category button.
   The reference is fixed (first cat) so the sub row's left edge stays constant
   regardless of which category is active, so sub items always sit under the same X. */
function alignSubNav() {
  const navSub      = document.getElementById('navSub');
  const navMidInner = document.getElementById('navMidInner');
  const navSubInner = document.getElementById('navSubInner');
  if (!navSub || navSub.hidden || !navMidInner || !navSubInner) return;
  const firstCat = navMidInner.querySelector('.cat-btn:not([data-cat="all"])');
  if (!firstCat) { navSubInner.style.paddingLeft = ''; return; }

  const catRect   = firstCat.getBoundingClientRect();
  const innerRect = navMidInner.getBoundingClientRect();
  const SUB_NUDGE = 6; // small extra indent so sub chips don't sit flush with cat-btn left edge
  const offset    = Math.max(0, catRect.left - innerRect.left + SUB_NUDGE);
  navSubInner.style.paddingLeft = offset + 'px';
}
window.addEventListener('resize', alignSubNav);

function applyGroup(group) {
  activeGroup    = group;
  activeCategory = 'all';
  activeSub      = 'all';

  document.body.classList.toggle('starred-mode', group === 'starred');

  document.querySelectorAll('.top-btn').forEach(btn => {
    const isActive = btn.dataset.group === group;
    btn.classList.toggle('active', isActive);
    if (btn.dataset.group !== 'all' && btn.hasAttribute('aria-controls')) {
      btn.setAttribute('aria-expanded', isActive);
    }
    // Switching groups resets the category, so clear any inherited cat tint
    delete btn.dataset.cat;
  });

  const navMid = document.getElementById('navMid');
  const navSub = document.getElementById('navSub');
  if (group !== 'all' && group !== 'starred') {
    renderMidNav(group);
  } else {
    navMid.hidden = true;
    navMid.removeAttribute('data-group');
  }
  navSub.hidden = true;
  navSub.removeAttribute('data-cat');

  applySearch(searchInput.value);
  writeUrl(group === 'all' ? '' : `#${group}`);
}

function applyCategory(cat) {
  // Clicking the active category collapses back to "all of group" (closes sub row)
  if (cat === activeCategory && cat !== 'all') cat = 'all';
  activeCategory = cat;
  activeSub      = 'all';

  document.querySelectorAll('.cat-btn').forEach(btn =>
    btn.classList.toggle('active', btn.dataset.cat === cat)
  );

  // Propagate active category color onto the active top-btn (lavender ↔ category tint)
  const activeTopBtn = document.querySelector('.top-btn.active');
  if (activeTopBtn) {
    if (cat !== 'all') activeTopBtn.dataset.cat = cat;
    else delete activeTopBtn.dataset.cat;
  }

  const navSub = document.getElementById('navSub');
  if (cat !== 'all') {
    renderSubNav(cat);
  } else {
    navSub.hidden = true;
    navSub.removeAttribute('data-cat');
  }

  applySearch(searchInput.value);
  writeUrl(cat === 'all' ? `#${activeGroup}` : `#${cat}`);
}

function applySub(sub) {
  // Clicking the active section collapses back to "all of category"
  if (sub === activeSub && sub !== 'all') sub = 'all';
  activeSub = sub;

  document.querySelectorAll('.sec-btn').forEach(btn =>
    btn.classList.toggle('active', btn.dataset.sub === sub)
  );

  applySearch(searchInput.value);
  const fallback = activeCategory !== 'all' ? activeCategory : activeGroup;
  writeUrl(sub === 'all' ? `#${fallback}` : `#${sub}`);
}

// ── Search ────────────────────────────────────────────────────
function applySearch(query) {
  const q = query.trim().toLowerCase();
  const inStarredMode = activeGroup === 'starred';

  document.querySelectorAll('.section').forEach(sec => {
    if (!sectionInScope(sec.dataset.section)) { sec.hidden = true; return; }

    if (!q && !inStarredMode) {
      sec.hidden = false;
      sec.querySelectorAll('.card').forEach(c => { c.hidden = false; });
      sec.querySelectorAll('.cmd-item').forEach(item => {
        item.hidden = false;
        item.querySelector('.cmd-code').innerHTML = hl(item.dataset.raw);
        item.querySelector('.cmd-desc').textContent = item.dataset.desc;
      });
      return;
    }

    let secMatch = false;
    sec.querySelectorAll('.card').forEach(card => {
      let cardMatch = false;
      card.querySelectorAll('.cmd-item').forEach(item => {
        const raw = item.dataset.raw;
        const matchesText = !q
          || raw.toLowerCase().includes(q)
          || item.dataset.desc.toLowerCase().includes(q);
        const matchesStar = !inStarredMode || starred.has(raw);
        const visible = matchesText && matchesStar;
        item.hidden = !visible;
        if (visible) {
          cardMatch = true;
          const codeEl = item.querySelector('.cmd-code');
          const descEl = item.querySelector('.cmd-desc');
          codeEl.innerHTML = hl(raw, { slashBreaks: !q.includes('/') });
          descEl.textContent = item.dataset.desc;
          if (q) {
            applyMark(codeEl, q);
            applyMark(descEl, q);
          }
        }
      });
      card.hidden = !cardMatch;
      if (cardMatch) secMatch = true;
    });
    sec.hidden = !secMatch;
  });

  const anyVisible = [...document.querySelectorAll('.section')].some(s => !s.hidden);
  let emptyEl = document.getElementById('emptyState');
  if (!anyVisible && (q || inStarredMode)) {
    if (!emptyEl) {
      emptyEl = document.createElement('div');
      emptyEl.id = 'emptyState';
      emptyEl.className = 'empty-state';
      main.appendChild(emptyEl);
    }
    if (inStarredMode && !q) {
      emptyEl.innerHTML = `
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round">
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
        </svg>
        <h3>No starred commands yet</h3>
        <p>Click the star icon next to a command to save it here.</p>`;
    } else {
      emptyEl.innerHTML = `
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
          <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
        </svg>
        <h3></h3>
        <p>Try a different keyword or clear the search.</p>`;
      const scopeName = inStarredMode
        ? 'starred'
        : (activeCategory !== 'all'
            ? CATEGORY_LABELS[activeCategory]
            : (activeGroup !== 'all' ? GROUP_LABELS[activeGroup] : ''));
      const scopeLabel = scopeName ? ` in ${scopeName}` : '';
      emptyEl.querySelector('h3').textContent = `No results for \u201c${query}\u201d${scopeLabel}`;
    }
  } else {
    clearEmptyState();
  }

  const countEl = document.getElementById('searchCount');
  if (countEl) {
    if (q) {
      const n = [...document.querySelectorAll('.cmd-item')].filter(el => !el.hidden).length;
      countEl.textContent = n.toString();
      countEl.classList.toggle('active', true);
    } else {
      countEl.textContent = '';
      countEl.classList.remove('active');
    }
  }
}

function clearEmptyState() {
  document.getElementById('emptyState')?.remove();
}


// ── Scroll to top ─────────────────────────────────────────────
const scrollTopBtn = document.getElementById('scrollTopBtn');
window.addEventListener('scroll', () => {
  scrollTopBtn.classList.toggle('visible', window.scrollY > SCROLL_THRESHOLD);
}, { passive: true });
scrollTopBtn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

// ── Key bindings ──────────────────────────────────────────────
const keysHelp = setupKeysHelp([
  { title: 'Commands', rows: [
    { keys: [['/']], desc: 'Focus search' },
    { keys: [['Esc']], desc: 'Clear search' },
    { keys: [['?']], desc: 'Show this list' },
  ] },
]);
const searchInput = document.getElementById('searchInput');
const searchClear = document.getElementById('searchClear');

document.addEventListener('keydown', e => {
  if (keysHelp.isOpen()) return;
  const typing = ['INPUT','TEXTAREA'].includes(document.activeElement.tagName);
  // `/` jumps to the search field from anywhere on the page, the GitHub / docs-site convention.
  if (isSlash(e) && !typing && !e.ctrlKey && !e.metaKey && !e.altKey) {
    e.preventDefault();
    searchInput.focus();
    searchInput.select();
    return;
  }
  if (e.key === 'Escape' && (typing || searchInput.value)) {
    clearTimeout(searchDebounce);
    searchInput.value = '';
    if (typing) searchInput.blur();
    applySearch('');
    searchClear.classList.remove('visible');
  }
});

let searchDebounce;
searchInput.addEventListener('input', e => {
  clearTimeout(searchDebounce);
  const val = e.target.value;
  searchClear.classList.toggle('visible', val.length > 0);
  searchDebounce = setTimeout(() => applySearch(val), SEARCH_DEBOUNCE);
});

searchClear.addEventListener('click', () => {
  searchInput.value = '';
  searchInput.focus();
  applySearch('');
  searchClear.classList.remove('visible');
});

// ── Event delegation ──────────────────────────────────────────
const main = document.getElementById('main');

main.addEventListener('click', e => {
  const linkBtn = e.target.closest('.section-link');
  if (linkBtn) {
    copySectionLink(linkBtn.closest('.section').dataset.section);
    return;
  }
  const starBtn = e.target.closest('.star-btn');
  if (starBtn) {
    const item = starBtn.closest('.cmd-item');
    if (item) toggleStar(item.dataset.raw);
    return;
  }
  const item = e.target.closest('.cmd-item');
  if (item) copyCmd(item);
});

function toggleStar(rawCmd) {
  const nowOn = !starred.has(rawCmd);
  if (nowOn) starred.add(rawCmd); else starred.delete(rawCmd);
  persistStarred();
  // Sync visual state on every cmd-item with this command (duplicates across sections)
  const sel = `.cmd-item[data-raw="${escapeAttr(rawCmd)}"] .star-btn`;
  document.querySelectorAll(sel).forEach(btn => {
    btn.classList.toggle('starred', nowOn);
    btn.setAttribute('aria-pressed', nowOn);
  });
  // In Starred mode, an unstar should immediately drop the row from view
  if (activeGroup === 'starred') applySearch(searchInput.value);
}

function escapeAttr(s) {
  return String(s).replace(/\\/g, '\\\\').replace(/"/g, '\\"');
}

document.querySelectorAll('.top-btn').forEach(btn => {
  btn.addEventListener('click', () => applyGroup(btn.dataset.group));
});

// ── Init ──────────────────────────────────────────────────────
function init() {
  main.innerHTML = SECTIONS.map(renderSection).join('');
}

init();

// ── URL hash navigation ───────────────────────────────────────
// The section root shows without its trailing slash (/cli), the same way /scheme does. Any state kept
// in the hash goes back to /cli/#..., the form a shared link should carry. A bare /cli reaching the
// server is redirected to /cli/. The path is always written in full: a bare '#...' would resolve
// against /cli and drop the slash.
function writeUrl(hash) {
  const base = location.pathname.replace(/\/$/, '');
  const target = hash ? `${base}/${location.search}${hash}` : base + location.search;
  if (location.pathname + location.search + location.hash !== target) history.replaceState(null, '', target);
}

const HASH_REDIRECTS = {
  'troubleshooting-kubectl': 'troubleshooting-cluster',
};

function restoreFromHash() {
  let hash = location.hash.slice(1);
  if (!hash) return;
  if (HASH_REDIRECTS[hash]) hash = HASH_REDIRECTS[hash];

  if (GROUPS[hash])     { applyGroup(hash); return; }
  if (CATEGORIES[hash]) { applyGroup(groupOfCategory(hash)); applyCategory(hash); return; }
  const cat = categoryOfSection(hash);
  if (cat)              { applyGroup(groupOfCategory(cat)); applyCategory(cat); applySub(hash); return; }
}
restoreFromHash();
if (!location.hash) writeUrl('');
window.addEventListener('hashchange', restoreFromHash);

// ── Align logo icon center over "All" button center ───────────
function alignLogo() {
  const logo = document.querySelector('.logo');
  if (!logo) return;
  if (window.innerWidth <= 900) { logo.style.marginLeft = '0'; return; }
  const allBtn   = document.querySelector('[data-group="all"]');
  const logoIcon = document.querySelector('.logo-icon');
  if (!allBtn || !logoIcon) return;
  // Read phase first (before any writes) to avoid forced layout
  const currentMargin = parseFloat(logo.style.marginLeft) || 0;
  const allCenter  = allBtn.getBoundingClientRect().left  + allBtn.offsetWidth  / 2;
  const iconCenter = logoIcon.getBoundingClientRect().left + logoIcon.offsetWidth / 2;
  logo.style.marginLeft = (currentMargin + allCenter - iconCenter) + 'px';
}
requestAnimationFrame(alignLogo);
window.addEventListener('resize', alignLogo);
document.fonts.ready.then(() => requestAnimationFrame(alignLogo));

// ── Header dropdowns ──────────────────────────────────────────
function renderHeaderActions(CONTACTS, SPONSOR, GITHUB) {
  const container = document.getElementById('headerActions');
  if (!container) return;

  let html = '';

  if (GITHUB && GITHUB.enabled) {
    html += `
      <a class="action-btn action-btn-link" href="${escapeHtml(GITHUB.href)}" target="_blank" rel="noopener" aria-label="${escapeHtml(GITHUB.label)}">
        ${GITHUB.icon}<span class="action-btn-label">${escapeHtml(GITHUB.label)}</span>
      </a>`;
  }

  if (CONTACTS.enabled) {
    const links = CONTACTS.links.map(l => `
      <a class="dropdown-link" href="${escapeHtml(l.href)}" target="_blank" rel="noopener" role="menuitem">
        ${l.icon} ${escapeHtml(l.label)}
      </a>`).join('');
    html += `
      <div class="action-wrap">
        <button class="action-btn" aria-expanded="false" aria-haspopup="true">
          ${CONTACT_ICON}<span class="action-btn-label">Contacts</span>
        </button>
        <div class="action-dropdown" role="menu">${links}</div>
      </div>`;
  }

  if (SPONSOR.enabled) {
    const donate = `
      <a class="dropdown-link" href="${escapeHtml(SPONSOR.donate.href)}" target="_blank" rel="noopener" role="menuitem">
        ${SPONSOR.donate.icon} ${escapeHtml(SPONSOR.donate.label)}
      </a>`;
    const wallets = SPONSOR.wallets.map(w => `
      <div class="dropdown-copy-row">
        <span class="dropdown-coin">${escapeHtml(w.coin)}<span class="dropdown-net">${escapeHtml(w.net)}</span></span>
        <span class="dropdown-addr" data-addr="${escapeHtml(w.addr)}">${escapeHtml(w.addr)}</span>
        <button class="dropdown-copy-btn" aria-label="Copy ${escapeHtml(w.coin)} address">${COPY_ICON}</button>
      </div>`).join('');
    html += `
      <div class="action-wrap">
        <button class="action-btn" aria-expanded="false" aria-haspopup="true">
          ${SPONSOR_ICON}<span class="action-btn-label">Sponsor</span>
        </button>
        <div class="action-dropdown" role="menu">
          ${donate}
          <div class="dropdown-divider"></div>
          ${wallets}
        </div>
      </div>`;
  }

  container.innerHTML = html;

  container.querySelectorAll('.action-wrap').forEach(wrap => {
    wrap.querySelector('.action-btn').addEventListener('click', e => {
      e.stopPropagation();
      const isOpen = wrap.classList.contains('open');
      closeAllDropdowns();
      if (!isOpen) {
        wrap.classList.add('open');
        wrap.querySelector('.action-btn').setAttribute('aria-expanded', 'true');
      }
    });
  });

  container.querySelectorAll('.dropdown-copy-btn').forEach(btn => {
    btn.addEventListener('click', e => {
      e.stopPropagation();
      const addr = btn.closest('.dropdown-copy-row').querySelector('.dropdown-addr').dataset.addr;
      const finish = () => {
        clearTimeout(copyTimer);
        // The clipboard holds one address, so a new copy clears the check on any other wallet.
        container.querySelectorAll('.dropdown-copy-btn.copied').forEach(b => {
          b.innerHTML = COPY_ICON;
          b.classList.remove('copied');
        });
        btn.innerHTML = CHECK_ICON;
        btn.classList.add('copied');
        copyTimer = setTimeout(() => {
          btn.innerHTML = COPY_ICON;
          btn.classList.remove('copied');
        }, COPY_RESET_DELAY);
      };
      if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(addr).then(finish).catch(() => fallbackCopy(addr, finish));
      } else {
        fallbackCopy(addr, finish);
      }
    });
  });
}

function closeAllDropdowns() {
  document.querySelectorAll('#headerActions .action-wrap').forEach(w => {
    w.classList.remove('open');
    w.querySelector('.action-btn').setAttribute('aria-expanded', 'false');
  });
}

document.addEventListener('click', closeAllDropdowns);
document.addEventListener('keydown', e => {
  if (e.key === 'Escape' && document.querySelector('#headerActions .action-wrap.open')) {
    e.stopPropagation();
    closeAllDropdowns();
  }
});

try {
  const mod = await import('./contacts.js');
  renderHeaderActions(mod.CONTACTS, mod.SPONSOR, mod.GITHUB);
} catch (_) {}
