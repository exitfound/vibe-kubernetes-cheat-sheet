import { COPY_ICON, CHECK_ICON, STAR_ICON, CONTACT_ICON, SPONSOR_ICON, SECTIONS } from './data.js';
import { schemeUrl } from './lib/env.js';
import { setupSidebar } from './lib/sidebar.js';

{
  const sideScheme = document.getElementById('sideScheme');
  if (sideScheme) sideScheme.href = schemeUrl();
  setupSidebar();
}

document.getElementById('year').textContent = new Date().getFullYear();

// ── Constants ────────────────────────────────────────────────
const SCROLL_THRESHOLD = 300;
const TOAST_DURATION   = 2000;
const COPY_RESET_DELAY = 1500;
const SEARCH_DEBOUNCE  = 80;
const STARRED_KEY      = 'kube-how:starred:v1';

// ── Starred commands (persisted) ─────────────────────────────
const starred = (() => {
  try {
    const raw = localStorage.getItem(STARRED_KEY);
    return new Set(raw ? JSON.parse(raw) : []);
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
function hl(raw) {
  const e = s => s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

  const tokens = raw.split(' ').filter(Boolean);

  return tokens.map((tok, i) => {
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
  }).join(' ');
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

// ── Rendering ─────────────────────────────────────────────────
function renderSection(section) {
  const cat   = categoryOfSection(section.id) ?? 'all';
  const group = groupOfCategory(cat) ?? 'all';
  const groups = section.groups
    .map((g, gi) => renderCard(g, gi))
    .join('');
  const total = section.groups.reduce((n, g) => n + g.cmds.length, 0);
  const label = total === 1 ? 'command' : 'commands';

  return `
    <section class="section" data-section="${escapeHtml(section.id)}" data-cat="${cat}" data-group="${group}">
      <div class="section-header">
        <div class="section-icon">${section.icon}</div>
        <h2 class="section-title">${escapeHtml(section.title)}</h2>
        <span class="section-sub">${escapeHtml(section.sub)}</span>
        <span class="section-count">${total} ${label}</span>
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
    <div class="cmd-item" data-raw="${escapeHtml(item.cmd)}" data-desc="${escapeHtml(item.desc)}">
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

function copyCmd(item) {
  const raw = item.dataset.raw;

  const finish = () => {
    showToast();
    const btn = item.querySelector('.copy-btn');
    clearTimeout(copyTimer);
    btn.innerHTML = CHECK_ICON;
    btn.classList.add('copied');
    copyTimer = setTimeout(() => {
      btn.innerHTML = COPY_ICON;
      btn.classList.remove('copied');
    }, COPY_RESET_DELAY);
  };

  if (navigator.clipboard && window.isSecureContext) {
    navigator.clipboard.writeText(raw).then(finish).catch(() => fallbackCopy(raw, finish));
  } else {
    fallbackCopy(raw, finish);
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
   regardless of which category is active — sub items always sit under the same X. */
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
  history.replaceState(null, '', group === 'all' ? location.pathname : `#${group}`);
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
  history.replaceState(null, '', cat === 'all' ? `#${activeGroup}` : `#${cat}`);
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
  history.replaceState(null, '', sub === 'all' ? `#${fallback}` : `#${sub}`);
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
          codeEl.innerHTML = hl(raw);
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
const searchInput = document.getElementById('searchInput');
const searchClear = document.getElementById('searchClear');

document.addEventListener('keydown', e => {
  const typing = ['INPUT','TEXTAREA'].includes(document.activeElement.tagName);
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
