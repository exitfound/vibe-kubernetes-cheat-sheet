import { STAR_ICON, LINK_ICON, DOCS_ICON, SECTIONS } from './data.js';
import { setupSidebar } from './lib/sidebar.js';
import { setupHeader, alignLogo, copyText, escapeHtml, COPY_ICON, CHECK_ICON } from './lib/chrome.js';
import { setupKeysHelp, isSlash } from './lib/keys.js';
import { hl, sortCmds } from './lib/commands.js';
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
// Old command string to its rewrite, so a star saved under the old string follows its command.
const STAR_RENAMES = {
  "apt-get update && apt-get install -y apt-transport-https ca-certificates curl": "apt-get update && apt-get install -y apt-transport-https ca-certificates curl gpg",
  "curl -fsSL https://pkgs.k8s.io/core:/stable:/v1.32/deb/Release.key | gpg --dearmor -o /etc/apt/keyrings/kubernetes-apt-keyring.gpg": "curl -fsSL https://pkgs.k8s.io/core:/stable:/v1.36/deb/Release.key | gpg --dearmor -o /etc/apt/keyrings/kubernetes-apt-keyring.gpg",
  "curl -fsSL https://pkgs.k8s.io/core:/stable:/v1.35/deb/Release.key | gpg --dearmor -o /etc/apt/keyrings/kubernetes-apt-keyring.gpg": "curl -fsSL https://pkgs.k8s.io/core:/stable:/v1.36/deb/Release.key | gpg --dearmor -o /etc/apt/keyrings/kubernetes-apt-keyring.gpg",
  "echo \"deb [signed-by=/etc/apt/keyrings/kubernetes-apt-keyring.gpg] https://pkgs.k8s.io/core:/stable:/v1.32/deb/ /\" | tee /etc/apt/sources.list.d/kubernetes.list": "echo \"deb [signed-by=/etc/apt/keyrings/kubernetes-apt-keyring.gpg] https://pkgs.k8s.io/core:/stable:/v1.36/deb/ /\" | tee /etc/apt/sources.list.d/kubernetes.list",
  "echo \"deb [signed-by=/etc/apt/keyrings/kubernetes-apt-keyring.gpg] https://pkgs.k8s.io/core:/stable:/v1.35/deb/ /\" | tee /etc/apt/sources.list.d/kubernetes.list": "echo \"deb [signed-by=/etc/apt/keyrings/kubernetes-apt-keyring.gpg] https://pkgs.k8s.io/core:/stable:/v1.36/deb/ /\" | tee /etc/apt/sources.list.d/kubernetes.list",
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
        <h2 class="section-title"><a class="section-page" href="/cli/section/${escapeHtml(section.id)}/">${escapeHtml(section.title)}</a></h2>
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
const toast = document.getElementById('toast');

// The text is written on every show and emptied on hide, so the status region announces each copy
// instead of holding a permanent "Copied" in the accessibility tree.
function showToast(msg = 'Copied to clipboard', failed = false) {
  clearTimeout(toastTimer);
  toast.querySelector('.toast-text').textContent = msg;
  toast.classList.toggle('is-error', failed);
  toast.classList.add('show');
  toastTimer = setTimeout(() => {
    toast.classList.remove('show');
    // Emptied once the 0.2s fade is over, so the box does not shrink while it is still visible.
    toastTimer = setTimeout(() => { toast.querySelector('.toast-text').textContent = ''; }, 250);
  }, TOAST_DURATION);
}

const copyFailed = () => showToast('Copy failed', true);

// The clipboard holds one command, so only the button that put it there shows the check: a new copy
// resets whichever command button was still showing one. Its own timer, not the header's wallet timer
// (lib/chrome.js), so a wallet copy cannot cancel a command button's reset and leave it stuck.
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

  const finish = () => {
    clearNew(raw);
    showToast();
    const btn = item.querySelector('.copy-btn');
    clearTimeout(cmdCopyTimer);
    document.querySelectorAll('.cmd-item .copy-btn.copied').forEach(resetCmdCopyBtn);
    btn.innerHTML = CHECK_ICON;
    btn.classList.add('copied');
    cmdCopyTimer = setTimeout(() => resetCmdCopyBtn(btn), COPY_RESET_DELAY);
  };

  copyText(raw, finish, copyFailed);
}

// The copied link is the section's own static page, which every crawler and chat preview can read,
// not the `#` view.
function copySectionLink(id) {
  const url = `${location.origin}/cli/section/${id}/`;
  copyText(url, () => showToast(), copyFailed);
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
      // An out-of-scope section is hidden whole, its items keep their own state, so the test is any
      // hidden ancestor.
      const n = [...document.querySelectorAll('.cmd-item')].filter(el => !el.closest('[hidden]')).length;
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
  if (e.key === 'Escape' && (typing || searchInput.value)
      && !document.querySelector('#headerActions .action-wrap.open')) {
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
// The path is written in full with its trailing slash: a bare '#...' would resolve against /cli and
// drop it, and a slashless address costs a redirect and splits analytics in two.
function writeUrl(hash) {
  const base = location.pathname.replace(/\/?$/, '/');
  const target = base + location.search + (hash || '');
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

// ── Save as PDF ───────────────────────────────────────────────
// The header button prints every command from a hidden frame of A4 sheets laid out here, each numbered
// on a strip at its foot (Firefox draws no @page margin boxes). Ctrl+P prints the view, on paper.
const PDF_ICON = `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><path d="M12 18v-6"/><polyline points="9 15 12 18 15 15"/></svg>`;
const BOOK_FACES = ['400', '500', '600', '700'].flatMap(w => [`${w} 13px "JetBrains Mono"`, `${w} 13px "Space Grotesk"`]);
let bookFrame = null;

// Every group, category, section and card, each a link to its place in the book.
function bookToc() {
  const byId = new Map(SECTIONS.map(s => [s.id, s]));
  const tocSection = (s) => {
    const total = s.groups.reduce((n, g) => n + g.cmds.length, 0);
    const cards = s.groups.map((g, gi) => `<a href="#toc-${s.id}-${gi}">${escapeHtml(g.title)}</a>`).join('');
    return `
      <div class="toc-section">
        <a class="toc-section-link" href="#toc-${s.id}"><span>${escapeHtml(s.title)}</span><span class="toc-count">${total}</span></a>
        <div class="toc-cards">${cards}</div>
      </div>`;
  };
  const groups = Object.entries(GROUPS).filter(([, cats]) => cats.length).map(([g, cats]) => `
    <div class="toc-group">
      <h2 class="toc-group-title">${GROUP_LABELS[g]}</h2>
      ${cats.map(cat => `
        <div class="toc-cat" data-cat="${cat}">
          <h3 class="toc-cat-title">${CATEGORY_LABELS[cat]}</h3>
          ${CATEGORIES[cat].map(id => tocSection(byId.get(id))).join('')}
        </div>`).join('')}
    </div>`).join('');
  return `<nav class="book-toc" aria-label="Contents"><p class="toc-title">Contents</p><div class="toc-columns">${groups}</div></nav>`;
}

// Fills the book one block at a time and moves a block that overflows its sheet on to a new one.
// A card breaks only between commands, and its head never sits alone at a sheet foot.
function layBook(doc) {
  const book = doc.querySelector('.book');
  const el = (html) => {
    const t = doc.createElement('template');
    t.innerHTML = html.trim();
    return t.content.firstElementChild;
  };
  let page;
  const sheet = () => {
    const s = el('<div class="sheet"><div class="sheet-body"></div><div class="sheet-strip"></div></div>');
    book.append(s);
    page = s.firstElementChild;
    return page;
  };
  const fits = () => page.scrollHeight <= page.clientHeight;

  // The contents run on to further sheets a section at a time. A group or category head that would
  // sit alone at a sheet foot moves with its first section, otherwise a headless shell continues it.
  const toc = el(bookToc());
  let cols = toc.querySelector('.toc-columns');
  const tocGroups = [...cols.children];
  cols.replaceChildren();
  sheet().append(el('<p class="book-title">Kubernetes Commands</p>'), toc);
  for (let g of tocGroups) {
    const cats = [...g.querySelectorAll('.toc-cat')];
    cats.forEach(c => c.remove());
    cols.append(g);
    for (let c of cats) {
      const items = [...c.querySelectorAll('.toc-section')];
      items.forEach(item => item.remove());
      g.append(c);
      for (const item of items) {
        c.append(item);
        if (fits()) continue;
        item.remove();
        const nav = el('<nav class="book-toc" aria-label="Contents, continued"><div class="toc-columns"></div></nav>');
        sheet().append(nav);
        cols = nav.firstElementChild;
        if (c.querySelector('.toc-section')) c = c.cloneNode(false); else c.remove();
        if (g.querySelector('.toc-cat')) g = g.cloneNode(false); else g.remove();
        cols.append(g);
        g.append(c);
        c.append(item);
      }
    }
  }

  for (const s of SECTIONS) {
    const cat = categoryOfSection(s.id) ?? 'all';
    const section = el(renderSection(s));
    section.id = `toc-${s.id}`;
    const cards = [...section.querySelectorAll('.card')];
    let grid = section.querySelector('.cards-grid');
    grid.replaceChildren();
    sheet().append(section);
    const runOn = () => {
      const wrap = el(`<section class="section" data-cat="${cat}"><div class="cards-grid"></div></section>`);
      sheet().append(wrap);
      grid = wrap.firstElementChild;
    };
    cards.forEach((card, gi) => {
      card.id = `toc-${s.id}-${gi}`;
      let list = card.querySelector('.cmd-list');
      const items = [...list.children];
      list.replaceChildren();
      grid.append(card);
      for (const item of items) {
        list.append(item);
        if (fits()) continue;
        item.remove();
        runOn();
        if (!list.children.length) {
          grid.append(card);
        } else {
          const piece = el('<div class="card card-cont"><div class="cmd-list"></div></div>');
          grid.append(piece);
          list = piece.firstElementChild;
        }
        list.append(item);
      }
    });
  }

  // The site footer closes the book at the foot of the last sheet. The PDF leaves the site, so the
  // home link carries the domain.
  const foot = document.querySelector('.footer').cloneNode(true);
  foot.classList.add('book-foot');
  foot.querySelector('#year')?.removeAttribute('id');
  foot.querySelectorAll('a[href="/"]').forEach(a => { a.href = 'https://kube.how/'; });
  page.append(doc.importNode(foot, true));
  if (!fits()) { const last = page.lastElementChild; last.remove(); sheet().append(last); }

  const strips = book.querySelectorAll('.sheet-strip');
  strips.forEach((strip, i) => { strip.textContent = `${i + 1} / ${strips.length}`; });
}

// The frame is as wide as an A4 sheet, so the width queries match the printout, takes the page's
// stylesheets (already stamped by the deploy), and lays out once its fonts are in.
async function buildBook() {
  const frame = document.createElement('iframe');
  frame.title = 'PDF layout';
  frame.setAttribute('aria-hidden', 'true');
  frame.inert = true;
  frame.style.cssText = 'position:fixed;top:0;left:-10000px;width:210mm;height:297mm;border:0;visibility:hidden';
  document.body.append(frame);
  const doc = frame.contentDocument;
  const links = [...document.querySelectorAll('link[rel="stylesheet"]')]
    .map(l => `<link rel="stylesheet" href="${escapeHtml(l.href)}">`).join('');
  doc.open();
  doc.write(`<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><title>${escapeHtml(document.title)}</title>${links}
    <style>@page { size: A4; margin: 0; @bottom-left { content: none; } @bottom-right { content: none; } }
    html, body { margin: 0; padding: 0; min-height: 0; background: #110f1f; }</style>
    </head><body class="print-dark"><div class="book"></div></body></html>`);
  doc.close();
  try {
    await Promise.all([...doc.querySelectorAll('link')].map(l => l.sheet ? null : new Promise(r => { l.onload = l.onerror = r; })));
    await Promise.all(BOOK_FACES.map(f => doc.fonts.load(f).catch(() => {})));
    layBook(doc);
  } catch (err) {
    frame.remove();
    throw err;
  }
  return frame;
}

function addPdfButton() {
  const actions = document.getElementById('headerActions');
  if (!actions) return;
  const btn = document.createElement('button');
  btn.type = 'button';
  btn.className = 'action-btn';
  btn.title = 'Save all commands as PDF';
  btn.setAttribute('aria-label', 'Save all commands as PDF');
  btn.innerHTML = `${PDF_ICON}<span class="action-btn-label">PDF</span>`;
  // A failed layout is not cached, so the next click builds the book again.
  btn.addEventListener('click', async () => {
    bookFrame ??= buildBook().catch((err) => { bookFrame = null; throw err; });
    try {
      const frame = await bookFrame;
      frame.contentWindow.focus();
      frame.contentWindow.print();
    } catch (err) {
      console.error('PDF:', err);
    }
  });
  actions.prepend(btn);
}

// Four header buttons leave a narrow phone too little field for the full placeholder, so it
// shortens when it would be cut. The aria-label keeps the full name.
const PLACEHOLDER = searchInput.placeholder;
const measureCtx = document.createElement('canvas').getContext('2d');
function fitPlaceholder() {
  const cs = getComputedStyle(searchInput);
  measureCtx.font = `${cs.fontWeight} ${cs.fontSize} ${cs.fontFamily}`;
  const room = searchInput.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight);
  searchInput.placeholder = measureCtx.measureText(PLACEHOLDER).width <= room ? PLACEHOLDER : 'Search...';
}
// The field itself is watched: the sidebar toggling changes its width with no window resize.
if (window.ResizeObserver) new ResizeObserver(fitPlaceholder).observe(searchInput);
else window.addEventListener('resize', fitPlaceholder);
document.fonts?.ready.then(fitPlaceholder);

alignLogo('[data-group="all"]');
setupHeader().then(() => { addPdfButton(); fitPlaceholder(); });
