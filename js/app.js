import { COPY_ICON, CHECK_ICON, SECTIONS } from './data.js';

document.getElementById('year').textContent = new Date().getFullYear();

// ── Constants ────────────────────────────────────────────────
const SCROLL_THRESHOLD = 300;
const TOAST_DURATION   = 2000;
const COPY_RESET_DELAY = 1500;
const SEARCH_DEBOUNCE  = 80;

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
const CATEGORIES = {
  cluster:      ['cluster-health','node','context'],
  workloads:    ['pod','deployment','statefulset','daemonset','service','config','job','volume','network','rbac','namespace'],
  helm:         ['helm-releases', 'helm-charts'],
  kustomize:    ['kustomize-build', 'kustomize-edit'],
  k9s:          ['k9s-cli', 'k9s-ui'],
  local:        ['install-kubeadm','install-k3s','install-k3d','install-kind','install-minikube'],
  troubleshoot: ['troubleshoot-local','troubleshoot-kubectl','troubleshoot-helm','troubleshoot-kustomize','troubleshoot-k9s'],
};

const SUB_LABELS = Object.fromEntries(SECTIONS.map(s => [s.id, s.title]));

// ── Rendering ─────────────────────────────────────────────────
function renderSection(section) {
  const cat = Object.entries(CATEGORIES).find(([, ids]) => ids.includes(section.id))?.[0] ?? 'all';
  const groups = section.groups
    .map((g, gi) => renderCard(g, gi))
    .join('');

  return `
    <section class="section" data-section="${escapeHtml(section.id)}" data-cat="${cat}">
      <div class="section-header">
        <div class="section-icon">${section.icon}</div>
        <h2 class="section-title">${escapeHtml(section.title)}</h2>
        <span class="section-sub">${escapeHtml(section.sub)}</span>
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
  return `
    <div class="cmd-item" data-raw="${escapeHtml(item.cmd)}" data-desc="${escapeHtml(item.desc)}">
      <div class="cmd-code">${hl(item.cmd)}</div>
      <div class="cmd-desc">${escapeHtml(item.desc)}</div>
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

// ── Two-level navigation ─────────────────────────────────────
let activeTop = 'all';
let activeSub = 'all';

function sectionInScope(id) {
  if (activeTop === 'all') return true;
  const ids = CATEGORIES[activeTop] || [];
  if (!ids.includes(id)) return false;
  return activeSub === 'all' || activeSub === id;
}

function updateSectionVisibility() {
  document.querySelectorAll('.section').forEach(sec => {
    sec.hidden = !sectionInScope(sec.dataset.section);
  });
}

function renderSubNav(top) {
  const navSub  = document.getElementById('navSub');
  const inner   = document.getElementById('navSubInner');
  const ids     = CATEGORIES[top] || [];

  if (!ids.length) { navSub.hidden = true; return; }

  navSub.dataset.cat = top;
  inner.innerHTML =
    `<button class="nav-btn sub-btn active" data-sub="all">All</button>` +
    ids.map(id => `<button class="nav-btn sub-btn" data-sub="${id}">${SUB_LABELS[id]}</button>`).join('');

  inner.querySelectorAll('.sub-btn').forEach(btn => {
    btn.addEventListener('click', () => applySub(btn.dataset.sub));
  });

  navSub.hidden = false;
}

function applyTop(top) {
  activeTop = top;
  activeSub = 'all';

  document.querySelectorAll('.top-btn').forEach(btn => {
    const isActive = btn.dataset.top === top;
    btn.classList.toggle('active', isActive);
    if (btn.dataset.top !== 'all') btn.setAttribute('aria-expanded', isActive);
  });

  const navSub = document.getElementById('navSub');
  if (top !== 'all') {
    renderSubNav(top);
  } else {
    navSub.hidden = true;
  }

  searchInput.value = '';
  applySearch('');
  history.replaceState(null, '', top === 'all' ? location.pathname : `#${top}`);
}

function applySub(sub) {
  activeSub = sub;
  document.querySelectorAll('.sub-btn').forEach(btn =>
    btn.classList.toggle('active', btn.dataset.sub === sub)
  );
  searchInput.value = '';
  applySearch('');
  history.replaceState(null, '', sub === 'all' ? `#${activeTop}` : `#${sub}`);
}

// ── Search ────────────────────────────────────────────────────
function applySearch(query) {
  const q = query.trim().toLowerCase();

  document.querySelectorAll('.section').forEach(sec => {
    if (!sectionInScope(sec.dataset.section)) { sec.hidden = true; return; }

    if (!q) {
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
        const hit = item.dataset.raw.toLowerCase().includes(q)
                 || item.dataset.desc.toLowerCase().includes(q);
        item.hidden = !hit;
        if (hit) {
          cardMatch = true;
          const codeEl = item.querySelector('.cmd-code');
          const descEl = item.querySelector('.cmd-desc');
          codeEl.innerHTML = hl(item.dataset.raw);
          descEl.textContent = item.dataset.desc;
          applyMark(codeEl, q);
          applyMark(descEl, q);
        }
      });
      card.hidden = !cardMatch;
      if (cardMatch) secMatch = true;
    });
    sec.hidden = !secMatch;
  });

  const anyVisible = [...document.querySelectorAll('.section')].some(s => !s.hidden);
  let emptyEl = document.getElementById('emptyState');
  if (!anyVisible && q) {
    if (!emptyEl) {
      emptyEl = document.createElement('div');
      emptyEl.id = 'emptyState';
      emptyEl.className = 'empty-state';
      emptyEl.innerHTML = `
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
          <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
        </svg>
        <h3></h3>
        <p>Try a different keyword or clear the search.</p>`;
      main.appendChild(emptyEl);
    }
    emptyEl.querySelector('h3').textContent = `No results for \u201c${query}\u201d`;
  } else {
    clearEmptyState();
  }

  const countEl = document.getElementById('searchCount');
  if (countEl) {
    countEl.textContent = '';
    countEl.classList.remove('active');
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

// ── Keyboard shortcuts ────────────────────────────────────────
const TOP_KEYS  = { '1': 'all', '2': 'local', '3': 'cluster', '4': 'workloads', '5': 'helm', '6': 'kustomize', '7': 'k9s', '8': 'troubleshoot' };
const searchInput    = document.getElementById('searchInput');
const searchShortcut = document.getElementById('searchShortcut');
const searchClear    = document.getElementById('searchClear');

document.addEventListener('keydown', e => {
  const typing = ['INPUT','TEXTAREA'].includes(document.activeElement.tagName);

  if (e.key === 'Escape' && typing) { searchInput.value = ''; searchInput.blur(); applySearch(''); searchClear.classList.remove('visible'); return; }
  if (e.key === '/' && !typing) { e.preventDefault(); searchInput.focus(); searchInput.select(); return; }
  if (!typing && TOP_KEYS[e.key]) applyTop(TOP_KEYS[e.key]);
});

searchInput.addEventListener('focus', () => searchShortcut.style.opacity = '0');
searchInput.addEventListener('blur',  () => searchShortcut.style.opacity = '');
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
  const item = e.target.closest('.cmd-item');
  if (item) copyCmd(item);
});

document.querySelectorAll('.top-btn').forEach(btn => {
  btn.addEventListener('click', () => applyTop(btn.dataset.top));
});

// ── Init ──────────────────────────────────────────────────────
function init() {
  main.innerHTML = SECTIONS.map(renderSection).join('');
}

init();

// ── URL hash navigation ───────────────────────────────────────
function restoreFromHash() {
  const hash = location.hash.slice(1);
  if (!hash) return;
  if (CATEGORIES[hash]) {
    applyTop(hash);
    return;
  }
  for (const [cat, ids] of Object.entries(CATEGORIES)) {
    if (ids.includes(hash)) {
      applyTop(cat);
      applySub(hash);
      return;
    }
  }
}
restoreFromHash();
window.addEventListener('hashchange', restoreFromHash);

// ── Align logo icon center over "All" button center ───────────
function alignLogo() {
  const logo = document.querySelector('.logo');
  if (!logo) return;
  if (window.innerWidth <= 680) { logo.style.marginLeft = '0'; return; }
  const allBtn   = document.querySelector('[data-top="all"]');
  const logoIcon = document.querySelector('.logo-icon');
  if (!allBtn || !logoIcon) return;
  // Read phase first (before any writes) to avoid forced layout
  const currentMargin = parseFloat(logo.style.marginLeft) || 0;
  const allCenter  = allBtn.getBoundingClientRect().left  + allBtn.offsetWidth  / 2;
  const iconCenter = logoIcon.getBoundingClientRect().left + logoIcon.offsetWidth / 2;
  logo.style.marginLeft = (currentMargin + allCenter - iconCenter) + 'px';
}
alignLogo();
window.addEventListener('resize', alignLogo);
document.fonts.ready.then(alignLogo);
