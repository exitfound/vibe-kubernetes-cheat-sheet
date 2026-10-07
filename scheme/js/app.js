// Grid, filtering, poster rendering, dialog lifecycle, hash routing and the shared chrome. With
// lib/motion.js, one of only two modules allowed to touch a browser global at module load.
import { SCHEMES, CATEGORIES, CATEGORY_LABEL, CATEGORY_ICONS, CATEGORY_TAGLINE, SUBCATEGORIES } from './data.js';
import { renderPoster } from './lib/poster.js';
import { reducedMotion, onReducedMotionChange } from './lib/motion.js';
import { setupSidebar } from './lib/sidebar.js';
import { setupKeysHelp, isSlash, isLetter } from './lib/keys.js';
import { trackFresh } from './lib/fresh.js';
import { isInspectActive, attachInspector } from './lib/inspector.js';

setupSidebar();

const COPY_ICON    = `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>`;
const CHECK_ICON   = `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>`;
const CONTACT_ICON = `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>`;
const SPONSOR_ICON = `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>`;
const COPY_RESET_DELAY = 1500;
let copyTimer;

// Phones get a stub instead of the catalog (css/styles.css, "MOBILE STUB", holds the same query).
// Here it only keeps a deep link or a hash change from opening a dialog behind that stub.
const MOBILE_STUB = window.matchMedia('(hover: none) and (pointer: coarse) and (max-width: 600px), (hover: none) and (pointer: coarse) and (max-height: 500px)');

const SPEED_KEY = 'kube-how:scheme-speed:v1';
const STARRED_KEY = 'kube-how:scheme-starred:v1';
const LOOP_KEY  = 'kube-how:scheme-loop:v1';
const VIEW_KEY  = 'kube-how:scheme-view:v1';
const ALLOWED_SPEEDS = [0.5, 1, 2];
const ISSUES_URL = 'https://github.com/exitfound/vibe-kubernetes-cheat-sheet/issues/new';

function getSavedSpeed() {
  try {
    const v = parseFloat(localStorage.getItem(SPEED_KEY));
    if (ALLOWED_SPEEDS.includes(v)) return v;
  } catch (_) {}
  return 1;
}

function setSavedSpeed(v) {
  try { localStorage.setItem(SPEED_KEY, String(v)); } catch (_) {}
}

function getSavedLoop() {
  try {
    const v = localStorage.getItem(LOOP_KEY);
    if (v === '0') return false;
    if (v === '1') return true;
  } catch (_) {}
  return true;
}

function setSavedLoop(v) {
  try { localStorage.setItem(LOOP_KEY, v ? '1' : '0'); } catch (_) {}
}

// The grid has two views: `full` (poster, title, description, tags) and `compact` (poster and title,
// about twice as many cards per screen, the description as a hover tooltip). The choice is a
// body class, so it survives every renderGrid(), and it is remembered like the speed and the loop.
function getSavedView() {
  try { return localStorage.getItem(VIEW_KEY) === 'compact' ? 'compact' : 'full'; } catch (_) { return 'full'; }
}
function setSavedView(v) {
  try { localStorage.setItem(VIEW_KEY, v); } catch (_) {}
}
const isCompact = () => document.body.classList.contains('view-compact');

// Starred cards, the same mechanic /cli/ keeps for commands: a Set of ids in localStorage, a star on
// every card, and a `starred` pseudo-section in the nav that narrows the grid to them. An id a rename
// left behind matches no card and is simply never shown.
const starred = (() => {
  try {
    const raw = localStorage.getItem(STARRED_KEY);
    return new Set(raw ? JSON.parse(raw) : []);
  } catch (_) { return new Set(); }
})();

function persistStarred() {
  try { localStorage.setItem(STARRED_KEY, JSON.stringify([...starred])); } catch (_) {}
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

// KNOWN DUPLICATION, kept on purpose: this, `fallbackCopy`, `closeAllDropdowns` and the icons also
// live in cli/js/app.js and root index.html. Sharing them would couple the paths.
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

  if (CONTACTS && CONTACTS.enabled) {
    const links = CONTACTS.links.map(l => `
      <a class="dropdown-link" href="${escapeHtml(l.href)}" target="_blank" rel="noopener" role="menuitem">
        ${l.icon} ${escapeHtml(l.label)}
      </a>`).join('');
    html += `
      <div class="action-wrap">
        <button class="action-btn" aria-label="Contacts" aria-expanded="false" aria-haspopup="true">
          ${CONTACT_ICON}<span class="action-btn-label">Contacts</span>
        </button>
        <div class="action-dropdown" role="menu">${links}</div>
      </div>`;
  }

  if (SPONSOR && SPONSOR.enabled) {
    const donate = `
      <a class="dropdown-copy-row dropdown-donate" href="${escapeHtml(SPONSOR.donate.href)}" target="_blank" rel="noopener" role="menuitem" aria-label="${escapeHtml(SPONSOR.donate.label)}">
        <span class="dropdown-coin">${escapeHtml(SPONSOR.donate.coin)}<span class="dropdown-net">${escapeHtml(SPONSOR.donate.net)}</span></span>
        <span class="dropdown-addr">${escapeHtml(SPONSOR.donate.addr)}</span>
        <span class="dropdown-go">${SPONSOR.donate.icon}</span>
      </a>`;
    const wallets = SPONSOR.wallets.map(w => `
      <div class="dropdown-copy-row">
        <span class="dropdown-coin">${escapeHtml(w.coin)}<span class="dropdown-net">${escapeHtml(w.net)}</span></span>
        <span class="dropdown-addr" data-addr="${escapeHtml(w.addr)}">${escapeHtml(w.addr)}</span>
        <button class="dropdown-copy-btn" aria-label="Copy ${escapeHtml(w.coin)} address">${COPY_ICON}</button>
      </div>`).join('');
    html += `
      <div class="action-wrap">
        <button class="action-btn" aria-label="Sponsor" aria-expanded="false" aria-haspopup="true">
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

(async () => {
  try {
    const mod = await import('./contacts.js');
    renderHeaderActions(mod.CONTACTS, mod.SPONSOR, mod.GITHUB);
  } catch (_) {}
})();

const ICON = {
  play:    '<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M8 5v14l11-7z"/></svg>',
  pause:   '<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><rect x="6" y="5" width="4" height="14" rx="1"/><rect x="14" y="5" width="4" height="14" rx="1"/></svg>',
  prev:    '<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M6 6h2v12H6zM9 12l9-6v12z"/></svg>',
  next:    '<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M16 6h2v12h-2zM6 6v12l9-6z"/></svg>',
  reset:   '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"/></svg>',
  restart: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"/></svg>',
  loop:    '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="17 1 21 5 17 9"/><path d="M3 11V9a4 4 0 0 1 4-4h14"/><polyline points="7 23 3 19 7 15"/><path d="M21 13v2a4 4 0 0 1-4 4H3"/></svg>',
  close:   '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>',
  cli:     '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="4 17 10 11 4 5"/><line x1="12" y1="19" x2="20" y2="19"/></svg>',
  link:    '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>',
  linkDone: '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="20 6 9 17 4 12"/></svg>',
  search:  '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="11" cy="11" r="7"/><line x1="20" y1="20" x2="16.65" y2="16.65"/></svg>',
  viewFull: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="3" width="7" height="7" rx="1.5"/><line x1="14" y1="5" x2="21" y2="5"/><line x1="14" y1="9" x2="19" y2="9"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><line x1="14" y1="16" x2="21" y2="16"/><line x1="14" y1="20" x2="19" y2="20"/></svg>',
  viewCompact: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/></svg>',
  star:    '<svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round" aria-hidden="true"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>',
  report:  '<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 22V4"/><path d="M4 4h13l-2 4.5L17 13H4"/></svg>',
  expand:  '<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="15 3 21 3 21 9"/><polyline points="9 21 3 21 3 15"/><line x1="21" y1="3" x2="14" y2="10"/><line x1="3" y1="21" x2="10" y2="14"/></svg>',
  shrink:  '<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="4 14 10 14 10 20"/><polyline points="20 10 14 10 14 4"/><line x1="14" y1="10" x2="21" y2="3"/><line x1="3" y1="21" x2="10" y2="14"/></svg>',
  searchClear: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>',
};

function escapeHtml(s) { return String(s).replace(/[&<>"']/g, c => ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' })[c]); }

let activeCat = 'all';
let activeSub = null;
// TWO values, and the reason is the round trip: `searchQuery` is what the filter matches against
// (trimmed, folded to lower case) and `searchText` is what the reader actually typed, which is what
// the hash carries and what goes back into the input on a reload.
let searchText = '';
let searchQuery = '';
let activeController = null;
let activeDialogScheme = null;

// Routing: `#at=<key>&q=<search>` is grid state, `#scheme=<id>&step=<n>&at=..&q=..` a card plus the grid
// behind it (keys stay unambiguous by D-07). The key is NAMED because the hub forwards bare hashes to
// /cli/, but a bare key is still read, so an older `#csi-mount-path` resolves.
const FILTER_KEYS = new Map();
for (const c of CATEGORIES) {
  if (c.key === 'all') continue;
  FILTER_KEYS.set(c.key, { cat: c.key, sub: null });
  for (const sc of (SUBCATEGORIES[c.key] || [])) FILTER_KEYS.set(sc.key, { cat: c.key, sub: sc.key });
}
// The starred view is a pseudo-section: no category owns it, but it is a grid state like any other,
// so it rides `at=` and survives a reload.
const STARRED = 'starred';
FILTER_KEYS.set(STARRED, { cat: STARRED, sub: null });

function filterKey() {
  if (activeCat === 'all') return '';
  return activeSub || activeCat;
}

// Both halves of the grid state, in a fixed order so the URL does not churn. The search is
// percent-encoded, which is what keeps a space, an `&` or a `#` inside a query from being read back
// as a second parameter.
function gridHash() {
  const parts = [];
  const key = filterKey();
  if (key) parts.push(`at=${key}`);
  if (searchQuery) parts.push(`q=${encodeURIComponent(searchText)}`);
  return parts.length ? `#${parts.join('&')}` : '';
}

// Every write is a replaceState, which never fires hashchange, so `apply` cannot be re-entered. The
// path is written in full with its trailing slash: a bare '#...' would resolve against /scheme and
// drop it, and a slashless address costs a redirect and splits analytics in two.
function writeHash(hash) {
  const base = location.pathname.replace(/\/?$/, '/');
  const target = base + location.search + (hash || '');
  if (location.pathname + location.search + location.hash !== target) history.replaceState(null, '', target);
}

function schemeHash(id, stepIdx) {
  let hash = `#scheme=${id}`;
  if (stepIdx != null) hash += `&step=${stepIdx + 1}`;
  const grid = gridHash();
  if (grid) hash += `&${grid.slice(1)}`;
  return hash;
}

// `html` carries scroll-behavior: smooth, and `behavior: 'auto'` DEFERS to it. `instant` is the only
// value that overrules the stylesheet.
function scrollToTop() {
  window.scrollTo({ top: 0, behavior: 'instant' });
}

// The search-side twin of applyFilter and the only writer of the two search values. Returns whether
// anything moved. It owns the input too: a query restored from the hash must appear in the box.
function applySearch(text, { render = true } = {}) {
  const next = text || '';
  const query = next.trim().toLowerCase();
  if (query === searchQuery && next === searchText) return false;
  searchText = next;
  searchQuery = query;
  const input = document.getElementById('searchInput');
  if (input && input.value !== next) input.value = next;
  if (render) renderGrid();
  return true;
}

function applyFilter(key, { render = true } = {}) {
  const spec = key ? FILTER_KEYS.get(key) : null;
  const cat = spec ? spec.cat : 'all';
  const sub = spec ? spec.sub : null;
  if (cat === activeCat && sub === activeSub) return false;
  activeCat = cat;
  activeSub = sub;
  if (render) {
    renderCatNav();
    renderSubNav();
    renderGrid();
  }
  return true;
}

function init() {
  if (reducedMotion()) document.body.classList.add('reduced-motion');
  onReducedMotionChange(() => document.body.classList.toggle('reduced-motion', reducedMotion()));
  document.getElementById('year').textContent = new Date().getFullYear();
  // The browser would restore a scroll offset measured against the grid it had BEFORE the filter
  // was applied, which is a different document height and lands nowhere in particular.
  if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
  document.body.classList.toggle('view-compact', getSavedView() === 'compact');
  const parsed = parseHash();
  applyFilter(parsed.filter, { render: false });
  applySearch(parsed.q, { render: false });
  setupSearch();
  setupSectionLinks();
  renderCatNav();
  renderSubNav();
  renderGrid();
  // A hash that names no card and no section (a typo, a renamed key, a link from elsewhere) is
  // cleaned out of the URL rather than left to look like state the page is holding.
  if (!parsed.id) writeHash(gridHash());
  setupHashRouting();
  setupGlobalKeys();
  setupScrollTop();
  setupMobileStub();
}

// The stub's copy button hands over the current URL, deep link and all, so a reader can send the
// card to their computer. A rotation or a resize into the stub closes an open dialog.
function setupMobileStub() {
  MOBILE_STUB.addEventListener('change', (e) => {
    if (e.matches && activeDialogScheme) closeDialog({ updateHash: false });
  });
  const btn = document.getElementById('mobileStubCopy');
  if (!btn) return;
  let timer;
  btn.addEventListener('click', () => {
    const url = location.href;
    const finish = () => {
      clearTimeout(timer);
      btn.textContent = 'Link copied';
      btn.classList.add('copied');
      timer = setTimeout(() => {
        btn.textContent = 'Copy link';
        btn.classList.remove('copied');
      }, COPY_RESET_DELAY);
    };
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(url).then(finish).catch(() => fallbackCopy(url, finish));
    } else {
      fallbackCopy(url, finish);
    }
  });
}

function setupSearch() {
  const input = document.getElementById('searchInput');
  const clear = document.getElementById('searchClear');
  let timer = null;
  // A search narrows the grid the same way a section does, so it lands the reader at the top of the
  // result and in a URL that survives a reload. Debounced per D-15.
  const commit = () => {
    if (!applySearch(input.value)) return;
    writeHash(gridHash());
    scrollToTop();
  };
  const clearSearch = () => {
    clearTimeout(timer);
    input.value = '';
    commit();
  };
  input.addEventListener('input', () => {
    clearTimeout(timer);
    timer = setTimeout(commit, 80);
  });
  clear.addEventListener('click', () => {
    clearSearch();
    input.focus();
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && document.activeElement === input) clearSearch();
    // `/` jumps to the search field, as on /cli/. Not while typing or while a card dialog is open.
    const typing = ['INPUT', 'TEXTAREA'].includes(document.activeElement.tagName);
    if (isSlash(e) && !typing && !e.ctrlKey && !e.metaKey && !e.altKey && !document.querySelector('dialog[open]')) {
      e.preventDefault();
      input.focus();
      input.select();
    }
  });
}

function renderCatNav() {
  const inner = document.getElementById('catNavInner');
  const parts = CATEGORIES.map((c, i) => {
    const btn = `<button class="cat-btn ${c.key === activeCat ? 'active' : ''}" data-cat="${escapeHtml(c.key)}">${escapeHtml(c.label)}</button>`;
    return c.key === 'all' ? `${btn}<span class="nav-sep"></span>` : btn;
  });
  parts.push(`<button class="cat-btn cat-starred ${activeCat === STARRED ? 'active' : ''}" data-cat="${STARRED}">Starred</button>`);
  const compact = isCompact();
  parts.push(`<span class="view-toggle" role="group" aria-label="Grid view">
    <button class="view-btn${compact ? '' : ' active'}" type="button" data-view="full" title="Detailed cards" aria-label="Detailed cards" aria-pressed="${!compact}">${ICON.viewFull}</button>
    <button class="view-btn${compact ? ' active' : ''}" type="button" data-view="compact" title="Compact cards" aria-label="Compact cards" aria-pressed="${compact}">${ICON.viewCompact}</button>
  </span>`);
  inner.innerHTML = parts.join('');
  inner.querySelectorAll('.view-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const view = btn.dataset.view;
      if ((view === 'compact') === isCompact()) return;
      document.body.classList.toggle('view-compact', view === 'compact');
      setSavedView(view);
      renderCatNav();
      renderGrid();
    });
  });
  inner.querySelectorAll('.cat-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const next = btn.dataset.cat;
      if (next === activeCat) { writeHash(gridHash()); return; }
      activeCat = next;
      activeSub = null;
      renderCatNav();
      renderSubNav();
      renderGrid();
      writeHash(gridHash());
      scrollToTop();
    });
  });
}

function renderSubNav() {
  const wrap  = document.getElementById('catNavSub');
  const inner = document.getElementById('catNavSubInner');
  if (!wrap || !inner) return;
  const subs = SUBCATEGORIES[activeCat];
  if (!subs || activeCat === 'all') {
    wrap.hidden = true;
    wrap.removeAttribute('data-cat');
    inner.innerHTML = '';
    return;
  }
  wrap.hidden = false;
  wrap.dataset.cat = activeCat;
  const allActive = activeSub === null;
  const parts = [
    `<button class="subcat-btn ${allActive ? 'active' : ''}" data-sub="all">All</button>`,
    '<span class="nav-sep"></span>',
    ...subs.map(sc => `<button class="subcat-btn ${activeSub === sc.key ? 'active' : ''}" data-sub="${escapeHtml(sc.key)}">${escapeHtml(sc.label)}</button>`),
  ];
  inner.innerHTML = parts.join('');
  inner.querySelectorAll('.subcat-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const sub = btn.dataset.sub;
      if (sub === 'all') {
        if (activeSub === null) { writeHash(gridHash()); return; }
        activeSub = null;
      } else if (activeSub === sub) {
        activeSub = null;
      } else {
        activeSub = sub;
      }
      renderSubNav();
      renderGrid();
      writeHash(gridHash());
      scrollToTop();
    });
  });
}

function filteredSchemes() {
  return SCHEMES.filter(s => {
    if (activeCat === STARRED) {
      if (!starred.has(s.id)) return false;
    } else if (activeCat !== 'all' && s.category !== activeCat) return false;
    if (activeSub && s.subcategory !== activeSub) return false;
    if (searchQuery) {
      const hay = `${s.title} ${s.desc} ${s.category} ${s.subcategory || ''}`.toLowerCase();
      if (!hay.includes(searchQuery)) return false;
    }
    return true;
  });
}

function renderCard(s) {
  return `
    <article class="card" data-id="${escapeHtml(s.id)}" data-cat="${escapeHtml(s.category)}"${isCompact() ? ` title="${escapeHtml(s.desc)}"` : ''}>
      <div class="card-poster">${renderPoster(s)}${fresh.isNew(s.id) ? '<span class="new-pill card-new" title="New since your last visit">NEW</span>' : ''}</div>
      <div class="card-body">
        <div class="card-title"><a class="card-link" href="/scheme/card/${escapeHtml(s.id)}/">${escapeHtml(s.title)}</a></div>
        <div class="card-desc">${escapeHtml(s.desc)}</div>
        <div class="card-meta">
          <span class="card-cat">${escapeHtml(CATEGORY_LABEL[s.category] || s.category)}</span>
          <span class="card-version">k8s ${escapeHtml(s.k8sVersion)}</span>
          ${renderStarBtn(s.id)}
        </div>
      </div>
    </article>
  `;
}

// "New since your last visit" (lib/fresh.js). Opening a card clears it.
const fresh = trackFresh('kube-how:scheme-seen:v1', SCHEMES.map(s => s.id));

function newChip(n) {
  return n ? `<span class="section-new" title="New since your last visit">${n} new</span>` : '';
}

function clearNew(id) {
  if (!fresh.isNew(id)) return;
  fresh.clear(id);
  const card = document.querySelector(`.card[data-id="${id}"]`);
  if (!card) return;
  card.querySelector('.card-new')?.remove();
  const sec = card.closest('.section');
  sec.querySelector('.section-new')?.remove();
  sec.querySelector('.section-count').insertAdjacentHTML('beforebegin', newChip(sec.querySelectorAll('.card-new').length));
}

function renderStarBtn(id) {
  const on = starred.has(id);
  return `<button class="star-btn${on ? ' starred' : ''}" type="button" title="Toggle star" aria-label="Toggle star" aria-pressed="${on}">${ICON.star}</button>`;
}

function toggleStar(id) {
  const nowOn = !starred.has(id);
  if (nowOn) starred.add(id); else starred.delete(id);
  persistStarred();
  syncDialogStar();
  // In the starred view an unstar drops the card at once, exactly as /cli/ drops the row. An open
  // dialog flips through that view, so its counter and arrows are recounted with it.
  if (activeCat === STARRED) {
    renderGrid();
    const dlg = document.querySelector('dialog.scheme-dialog');
    if (dlg && activeDialogScheme) updateNavUi(dlg);
    return;
  }
  document.querySelectorAll(`.card[data-id="${id}"] .star-btn`).forEach(btn => {
    btn.classList.toggle('starred', nowOn);
    btn.setAttribute('aria-pressed', nowOn);
  });
}

// The dialog carries its own star for the card it shows, the same state as the star on the grid.
function syncDialogStar() {
  const btn = document.querySelector('dialog.scheme-dialog .dialog-star');
  if (!btn || !activeDialogScheme) return;
  const on = starred.has(activeDialogScheme.id);
  btn.classList.toggle('starred', on);
  btn.setAttribute('aria-pressed', on);
  btn.title = on ? 'Remove from Starred' : 'Add to Starred';
}

// A new GitHub issue with the card, the step and a link to that step already filled in, so a report
// arrives pointing at the exact frame it is about.
function reportUrl(scheme, stepLabel, stepIdx) {
  const link = `https://kube.how/scheme/#scheme=${scheme.id}${stepIdx ? `&step=${stepIdx}` : ''}`;
  const body = [
    `Card: ${scheme.title} (${scheme.id})`,
    stepLabel ? `Step: ${stepLabel}` : null,
    `Link: ${link}`,
    '',
    'What is wrong:',
    '',
  ].filter(l => l !== null).join('\n');
  return `${ISSUES_URL}?title=${encodeURIComponent(`[scheme] ${scheme.title}: `)}&body=${encodeURIComponent(body)}`;
}

function setReportLink(dialog, stepLabel = '', stepIdx = 0) {
  if (!activeDialogScheme) return;
  dialog.querySelector('.dialog-report').href = reportUrl(activeDialogScheme, stepLabel, stepIdx);
}

// Fullscreen goes on the PAGE, not on the dialog: Chrome refuses requestFullscreen() on a <dialog>.
// `dialog.is-fullscreen` stretches the panel, and a flip stays fullscreen because the dialog is reused.
function toggleFullscreen() {
  if (!document.querySelector('dialog.scheme-dialog') || !document.fullscreenEnabled) return;
  if (document.fullscreenElement) document.exitFullscreen().catch(() => {});
  else document.documentElement.requestFullscreen().catch(() => {});
}

function syncFullscreenBtn() {
  const dlg = document.querySelector('dialog.scheme-dialog');
  if (!dlg) return;
  const on = !!document.fullscreenElement;
  // The fullscreen page joins the top layer ABOVE the modal that was already there, and would paint
  // the grid over the card. Reopening the modal puts it back on top. Nothing listens for `close`,
  // and the DOM is not moved, so the running animation is untouched.
  if (on && dlg.open && typeof dlg.showModal === 'function') {
    const focused = document.activeElement;
    dlg.close();
    dlg.showModal();
    if (focused && dlg.contains(focused)) focused.focus();
  }
  dlg.classList.toggle('is-fullscreen', on);
  const btn = dlg.querySelector('.dialog-full');
  btn.innerHTML = on ? ICON.shrink : ICON.expand;
  btn.title = on ? 'Exit fullscreen (F)' : 'Fullscreen (F)';
  btn.setAttribute('aria-label', on ? 'Exit fullscreen' : 'Fullscreen');
}
document.addEventListener('fullscreenchange', syncFullscreenBtn);

function renderSection(unit) {
  const { catKey, subKey, label, tagline, schemes } = unit;
  const icon = CATEGORY_ICONS[catKey] || '';
  const total = schemes.length;
  const word = total === 1 ? 'scheme' : 'schemes';
  const subAttr = subKey ? ` data-subcat="${escapeHtml(subKey)}"` : '';
  // The `at=` key this section is reached by. The `_other` bucket is no filter of its own, so its
  // link opens the whole category.
  const linkKey = subKey && subKey !== '_other' ? subKey : catKey;
  return `
    <section class="section" data-cat="${escapeHtml(catKey)}"${subAttr}>
      <div class="section-header">
        <div class="section-icon">${icon}</div>
        <h2 class="section-title">${escapeHtml(label)}</h2>
        <span class="section-sub">${escapeHtml(tagline)}</span>
        <span class="section-actions">
          <button class="section-action section-link" type="button" data-at="${escapeHtml(linkKey)}" title="Copy link to this section" aria-label="Copy link to the ${escapeHtml(label)} section">${ICON.link}</button>
        </span>
        ${newChip(schemes.filter(s => fresh.isNew(s.id)).length)}
        <span class="section-count">${total} ${word}</span>
      </div>
      <div class="cards-grid">${schemes.map(renderCard).join('')}</div>
    </section>`;
}

// The grid is built as UNITS (a category, or a subcategory inside one) and not as a flat list, so a
// header carries its own count and tagline and the manifests keep one category's own order.
function buildUnits(list) {
  const order = CATEGORIES.filter(c => c.key !== 'all').map(c => c.key);
  const units = [];
  for (const catKey of order) {
    const catSchemes = list.filter(s => s.category === catKey);
    if (catSchemes.length === 0) continue;
    const subs = SUBCATEGORIES[catKey];
    if (subs && subs.length) {
      for (const sc of subs) {
        const subSchemes = catSchemes.filter(s => s.subcategory === sc.key);
        if (subSchemes.length === 0) continue;
        units.push({
          catKey,
          subKey: sc.key,
          label:  sc.label,
          // A subcategory row is titled by the subcategory and subtitled by its
          // category. Subcategories carry no tagline of their own.
          tagline: CATEGORY_LABEL[catKey] || catKey,
          schemes: subSchemes,
        });
      }
      const orphans = catSchemes.filter(s => !s.subcategory || !subs.find(x => x.key === s.subcategory));
      if (orphans.length) {
        units.push({
          catKey,
          subKey: '_other',
          label:  CATEGORY_LABEL[catKey] || catKey,
          tagline: CATEGORY_TAGLINE[catKey] || '',
          schemes: orphans,
        });
      }
    } else {
      units.push({
        catKey,
        subKey: null,
        label:  CATEGORY_LABEL[catKey] || catKey,
        tagline: CATEGORY_TAGLINE[catKey] || '',
        schemes: catSchemes,
      });
    }
  }
  return units;
}

// The section ids double as `#at=` routes, the same as /cli/, so a copied link opens the grid
// filtered to that section. Delegated once on #grid, which renderGrid() rewrites.
function setupSectionLinks() {
  document.getElementById('grid').addEventListener('click', (e) => {
    const btn = e.target.closest('.section-link');
    if (!btn) return;
    const url = `${location.origin}${location.pathname.replace(/\/?$/, '/')}#at=${btn.dataset.at}`;
    const finish = () => {
      clearTimeout(btn._timer);
      btn.innerHTML = ICON.linkDone;
      btn.classList.add('copied');
      btn._timer = setTimeout(() => {
        btn.innerHTML = ICON.link;
        btn.classList.remove('copied');
      }, COPY_RESET_DELAY);
    };
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(url).then(finish).catch(() => fallbackCopy(url, finish));
    } else {
      fallbackCopy(url, finish);
    }
  });
}

function renderGrid() {
  const grid = document.getElementById('grid');
  const list = filteredSchemes();
  if (list.length === 0 && activeCat === STARRED && !searchQuery) {
    grid.innerHTML = `
      <div class="empty">
        <div class="empty-icon">${ICON.star}</div>
        <div class="empty-title">No starred schemes yet.</div>
        <div class="empty-desc">Click the star on a card to save it here.</div>
      </div>
    `;
    return;
  }
  if (list.length === 0) {
    grid.innerHTML = `
      <div class="empty">
        <div class="empty-title">No schemes match.</div>
        <div class="empty-desc">Try a different category or search term.</div>
      </div>
    `;
    return;
  }
  const units = buildUnits(list);
  grid.innerHTML = units.map(renderSection).join('');
  grid.querySelectorAll('.card').forEach(card => {
    card.addEventListener('click', (e) => {
      // The star sits inside the card, so its click must not also open the dialog.
      if (e.target.closest('.star-btn')) {
        toggleStar(card.dataset.id);
        return;
      }
      // The title is a real link to the card's static page (/scheme/card/<id>/), which is what crawlers
      // follow. A plain click still opens the dialog. A modified click is left to the browser, so
      // Ctrl/Cmd+click opens the page in a new tab.
      if (e.target.closest('.card-link') && (e.ctrlKey || e.metaKey || e.shiftKey || e.altKey)) return;
      e.preventDefault();
      openScheme(card.dataset.id);
    });
    // The link is the card's one focus stop: Enter clicks it, and Space opens the card too.
    card.querySelector('.card-link').addEventListener('keydown', (e) => {
      if (e.key === ' ') {
        e.preventDefault();
        openScheme(card.dataset.id);
      }
    });
  });
}

// Card modules are lazy-imported, never all in memory. A live controller is torn down first, or its
// animations land on the next canvas. An open dialog is REUSED for the next card (shell, backdrop and
// inspector stay), so a flip never flashes the page behind.
async function openScheme(id, initialStep = null, { dir = 0 } = {}) {
  const scheme = SCHEMES.find(s => s.id === id);
  if (!scheme || MOBILE_STUB.matches) return;
  let dialog = document.querySelector('dialog.scheme-dialog');
  if (dialog) {
    teardownController();
  } else {
    dialog = buildDialog();
    document.body.appendChild(dialog);
    if (typeof dialog.showModal === 'function') {
      dialog.showModal();
    } else {
      dialog.setAttribute('open', '');
    }
    if (isInspectActive()) {
      dialog._inspectCleanup = attachInspector(dialog);
    }
  }
  fillDialog(dialog, scheme);
  activeDialogScheme = scheme;
  clearNew(id);
  updateNavUi(dialog);
  syncDialogStar();
  setReportLink(dialog);
  syncFullscreenBtn();
  writeHash(schemeHash(id, initialStep));

  let mod;
  try {
    // A card lives at js/schemes/<category>/<id>.js and its id starts with its category, so the path
    // is DERIVED rather than stored. R-modulepath holds both halves of that convention.
    mod = await import(schemeModulePath(scheme));
  } catch (e) {
    console.error('Failed to load scheme:', e);
    showLoadError(dialog);
    return;
  }
  if (activeDialogScheme !== scheme) return;
  const root = dialog.querySelector('.dialog-canvas');
  root.replaceChildren();
  const ctrl = mod.init(root, {
    onStepChange: (idx, step, total, meta) => {
      updateNarration(dialog, idx, step, total, meta);
      if (activeDialogScheme && activeDialogScheme.id === scheme.id) {
        writeHash(schemeHash(scheme.id, idx));
      }
    },
    onPlayingChange: (playing) => updatePlayBtn(dialog, playing),
  });
  activeController = ctrl;
  // `window.__schemeCtl` is the ENTIRE contract with the test harness (`gotoStep`, `total`,
  // `_timeline`). Renaming anything on it breaks the whole suite at once, as a TIMEOUT, not an error.
  if (isInspectActive()) {
    window.__schemeCtl = ctrl;
    window.__schemeId = scheme.id;
  }
  if (dir) slideIn(root, dir);

  ctrl.setSpeed(getSavedSpeed());
  ctrl.setLoop(getSavedLoop());

  if (initialStep != null && ctrl.gotoStep) {
    ctrl.gotoStep(initialStep);
  } else {
    ctrl.gotoStep(0);
    if (!reducedMotion()) {
      const dwell = ctrl.posterFirst ? 1000 : 500;
      // A cancellable dwell, stopped by any manual interaction or by closing the dialog, with a
      // plain timer as the fallback.
      if (ctrl.autoPlay) {
        ctrl.autoPlay(dwell);
      } else {
        setTimeout(() => { if (activeController === ctrl) ctrl.play(); }, dwell);
      }
    }
  }
  prefetchNeighbours();
}

function schemeModulePath(scheme) {
  return `./schemes/${scheme.category}/${scheme.id}.js`;
}

function teardownController() {
  if (activeController) {
    try { activeController.destroy(); } catch (_) {}
    activeController = null;
  }
  if (window.__schemeCtl) { try { delete window.__schemeCtl; } catch (_) { window.__schemeCtl = null; } }
}

// ── Flipping between cards ────────────────────────────────────
// A flip stays inside the grid view the reader came from. A card opened from outside it flips
// through the whole catalog, so the arrows never strand it. Both ends wrap.
function navList() {
  const view = buildUnits(filteredSchemes()).flatMap(u => u.schemes);
  if (activeDialogScheme && view.some(s => s.id === activeDialogScheme.id)) return view;
  return buildUnits(SCHEMES).flatMap(u => u.schemes);
}

function neighbour(list, dir) {
  const i = list.findIndex(s => s.id === activeDialogScheme.id);
  return list[(i + dir + list.length) % list.length];
}

function navigateScheme(dir) {
  if (!activeDialogScheme) return;
  const list = navList();
  if (list.length < 2) return;
  pressNavBtn(dir);
  openScheme(neighbour(list, dir).id, null, { dir });
}

function updateNavUi(dialog) {
  const list = navList();
  const i = list.findIndex(s => s.id === activeDialogScheme.id);
  const pos = dialog.querySelector('.dialog-pos');
  pos.textContent = `${i + 1} / ${list.length}`;
  const multi = list.length > 1;
  dialog.querySelectorAll('.dialog-nav').forEach(btn => {
    btn.hidden = !multi;
    if (!multi) return;
    const dir = Number(btn.dataset.nav);
    const name = dir < 0 ? 'Previous' : 'Next';
    const t = neighbour(list, dir).title;
    btn.title = `${name}: ${t} (Shift+${dir < 0 ? '←' : '→'})`;
    btn.setAttribute('aria-label', `${name} scheme: ${t}`);
  });
}

// A keyboard flip lights the arrow it stands for, so the reader sees which way the catalog moved.
function pressNavBtn(dir) {
  const btn = document.querySelector(`dialog.scheme-dialog .dialog-nav[data-nav="${dir}"]`);
  if (!btn) return;
  btn.classList.remove('pressed');
  void btn.offsetWidth;
  btn.classList.add('pressed');
  clearTimeout(btn._pressTimer);
  btn._pressTimer = setTimeout(() => btn.classList.remove('pressed'), 180);
}

function slideIn(el, dir) {
  if (reducedMotion()) return;
  el.classList.remove('slide-next', 'slide-prev');
  void el.offsetWidth;
  el.classList.add(dir > 0 ? 'slide-next' : 'slide-prev');
  el.addEventListener('animationend', () => el.classList.remove('slide-next', 'slide-prev'), { once: true });
}

// The two neighbours are fetched while the reader is still on this card, so a flip waits on
// nothing but the card's own init.
function prefetchNeighbours() {
  const list = navList();
  if (list.length < 2) return;
  const idle = window.requestIdleCallback || ((fn) => setTimeout(fn, 300));
  idle(() => {
    if (!activeDialogScheme) return;
    for (const dir of [1, -1]) import(schemeModulePath(neighbour(list, dir))).catch(() => {});
  });
}

// A horizontal swipe on the stage flips, touch only: a mouse drag is a text selection, not a turn.
function setupSwipe(dialog) {
  const stage = dialog.querySelector('.dialog-stage');
  let start = null;
  stage.addEventListener('pointerdown', (e) => {
    start = e.pointerType === 'touch' ? { x: e.clientX, y: e.clientY } : null;
  });
  stage.addEventListener('pointercancel', () => { start = null; });
  stage.addEventListener('pointerup', (e) => {
    if (!start) return;
    const dx = e.clientX - start.x;
    const dy = e.clientY - start.y;
    start = null;
    if (Math.abs(dx) < 60 || Math.abs(dx) < Math.abs(dy) * 1.5) return;
    navigateScheme(dx < 0 ? 1 : -1);
  });
}

const NAV_ICON = {
  prev: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="15 18 9 12 15 6"/></svg>',
  next: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="9 6 15 12 9 18"/></svg>',
};

// The shell: everything that is the same for every card. The <dialog> itself covers the viewport
// and is transparent, so the two flip arrows can sit in the gutters beside the panel and still be
// clickable (a modal leaves everything outside the dialog inert). `.dialog-inner` is the panel.
function buildDialog() {
  const dlg = document.createElement('dialog');
  dlg.className = 'scheme-dialog';
  dlg.setAttribute('aria-labelledby', 'dialogTitle');
  const initialLoop  = getSavedLoop();
  const initialSpeed = getSavedSpeed();
  const speedActive = (v) => initialSpeed === v ? ' class="active"' : '';
  dlg.innerHTML = `
    <button class="dialog-nav dialog-nav-prev" data-nav="-1" type="button">${NAV_ICON.prev}</button>
    <div class="dialog-inner">
      <header class="dialog-header">
        <h2 id="dialogTitle" class="dialog-title"></h2>
        <div class="dialog-meta">
          <span class="card-cat"></span>
          <span class="dialog-section"></span>
        </div>
        <span class="dialog-pos" title="Position in the current view"></span>
        <button class="dialog-tool dialog-star" type="button" aria-label="Star this card" aria-pressed="false">${ICON.star}</button>
        <a class="dialog-tool dialog-report" href="${ISSUES_URL}" target="_blank" rel="noopener" title="Report a problem with this card" aria-label="Report a problem with this card">${ICON.report}</a>
        <button class="dialog-tool dialog-full" type="button" title="Fullscreen (F)" aria-label="Fullscreen"${document.fullscreenEnabled ? '' : ' hidden'}>${ICON.expand}</button>
        <button class="dialog-close" aria-label="Close">${ICON.close}</button>
      </header>
      <div class="dialog-body">
        <div class="dialog-stage">
          <div class="dialog-canvas" aria-live="polite"></div>
          <aside class="narration-overlay is-poster" aria-live="polite">
            <div class="narration-step"></div>
            <div class="narration-text"></div>
          </aside>
        </div>
        <div class="reduced-notice">Reduced motion is on. Use the ◀ ▶ Step buttons to advance manually.</div>
        <div class="dialog-progress" aria-hidden="true"><div class="dialog-progress-fill"></div></div>
        <div class="dialog-step-dots" aria-hidden="true"></div>
      </div>
      <div class="dialog-controls">
        <button class="ctl-btn" data-act="restart" aria-label="Restart from start">${ICON.restart}</button>
        <button class="ctl-btn" data-act="prev"    aria-label="Previous step">${ICON.prev}</button>
        <button class="ctl-btn primary" data-act="play" aria-label="Play / Pause">${ICON.play}</button>
        <button class="ctl-btn" data-act="next"    aria-label="Next step">${ICON.next}</button>
        <button class="ctl-btn" data-act="loop"    aria-label="Loop" aria-pressed="${initialLoop ? 'true' : 'false'}">${ICON.loop}</button>
        <div class="ctl-speed" role="group" aria-label="Speed">
          <button data-speed="0.5"${speedActive(0.5)}>0.5×</button>
          <button data-speed="1"${speedActive(1)}>1×</button>
          <button data-speed="2"${speedActive(2)}>2×</button>
        </div>
        <span class="ctl-spacer"></span>
        <span class="ctl-source"></span>
      </div>
    </div>
    <button class="dialog-nav dialog-nav-next" data-nav="1" type="button">${NAV_ICON.next}</button>
  `;

  dlg.querySelector('.dialog-close').addEventListener('click', () => closeDialog());
  dlg.querySelector('.dialog-star').addEventListener('click', () => {
    if (activeDialogScheme) toggleStar(activeDialogScheme.id);
  });
  dlg.querySelector('.dialog-full').addEventListener('click', toggleFullscreen);
  dlg.addEventListener('cancel', (e) => { e.preventDefault(); closeDialog(); });
  dlg.querySelectorAll('.dialog-nav').forEach(btn => {
    btn.addEventListener('click', () => navigateScheme(Number(btn.dataset.nav)));
  });
  setupSwipe(dlg);

  dlg.querySelectorAll('.ctl-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      if (!activeController) return;
      const act = btn.dataset.act;
      if (act === 'play') {
        if (activeController.isPlaying && activeController.isPlaying()) activeController.pause();
        else activeController.play();
      } else if (act === 'prev') {
        activeController.step('prev');
      } else if (act === 'next') {
        activeController.step('next');
      } else if (act === 'restart') {
        activeController.restart();
      } else if (act === 'loop') {
        const next = !(activeController.isLooping && activeController.isLooping());
        activeController.setLoop(next);
        btn.setAttribute('aria-pressed', next ? 'true' : 'false');
        setSavedLoop(next);
      }
    });
  });
  dlg.querySelectorAll('.ctl-speed button').forEach(btn => {
    btn.addEventListener('click', () => {
      const r = parseFloat(btn.dataset.speed);
      dlg.querySelectorAll('.ctl-speed button').forEach(b => b.classList.toggle('active', b === btn));
      if (activeController) activeController.setSpeed(r);
      setSavedSpeed(r);
    });
  });
  return dlg;
}

// Everything that belongs to ONE card, written on open and again on every flip, so a field left
// out here would carry the previous card's value into the next.
function fillDialog(dlg, scheme) {
  dlg.setAttribute('data-cat', scheme.category);
  dlg.setAttribute('data-scheme', scheme.id);
  if (scheme.tinted) dlg.setAttribute('data-tinted', 'true');
  else dlg.removeAttribute('data-tinted');
  dlg.querySelector('.dialog-title').textContent = scheme.title;
  dlg.querySelector('.dialog-meta .card-cat').textContent = CATEGORY_LABEL[scheme.category] || scheme.category;
  const sub = (SUBCATEGORIES[scheme.category] || []).find(sc => sc.key === scheme.subcategory);
  const section = dlg.querySelector('.dialog-section');
  section.textContent = sub ? sub.label : '';
  section.hidden = !sub;
  // Every source, not just the first.
  const srcs = scheme.sources || [];
  const source = dlg.querySelector('.ctl-source');
  source.innerHTML = srcs.length
    ? `${srcs.length > 1 ? 'Sources' : 'Source'}: ` +
      srcs.map(s => `<a href="${escapeHtml(s.href)}" target="_blank" rel="noopener">${escapeHtml(s.label)}</a>`).join('<span class="ctl-source-sep">·</span>')
    : '';
  source.hidden = !srcs.length;
  // The player resets to the state a fresh dialog opens in, so nothing of the last card's run
  // (its step count, its progress, its narration) shows over the next card while it loads.
  dlg.querySelector('.narration-overlay').classList.add('is-poster');
  dlg.querySelector('.narration-step').textContent = '';
  dlg.querySelector('.narration-text').textContent = '';
  dlg.querySelector('.dialog-progress-fill').style.width = '0%';
  dlg.querySelector('.dialog-step-dots').innerHTML = '';
  updatePlayBtn(dlg, false);
}

function updateNarration(dialog, idx, step, total, meta) {
  const overlay = dialog.querySelector('.narration-overlay');
  const stepEl = dialog.querySelector('.narration-step');
  const textEl = dialog.querySelector('.narration-text');
  const prevBtn = dialog.querySelector('[data-act="prev"]');
  const nextBtn = dialog.querySelector('[data-act="next"]');
  const fill = dialog.querySelector('.dialog-progress-fill');
  const dotsWrap = dialog.querySelector('.dialog-step-dots');

  // With a poster, step 0 is the rest frame and the narrated steps are 1..N
  // (N = total-1); without it every step is narrated (1..total).
  const posterFirst = !!(meta && meta.posterFirst);
  const onPoster = posterFirst && idx === 0;
  const dotCount   = posterFirst ? Math.max(0, total - 1) : total;
  const displayTot = posterFirst ? total - 1 : total;
  // The poster previews the FIRST action step: its text shows immediately on open so
  // the box is never empty/dull, only the diagram animation waits for the dwell.
  const displayStep = onPoster ? 1 : (posterFirst ? idx : idx + 1);
  const activeDot   = onPoster ? 0 : (posterFirst ? idx - 1 : idx);
  const narration   = onPoster ? ((meta && meta.posterText) || '') : (step ? (step.narration || '') : '');

  if (overlay) overlay.classList.remove('is-poster');  // the text is always present
  if (!step && !onPoster) {
    stepEl.textContent = '';
    textEl.textContent = '';
  } else {
    stepEl.textContent = `Step ${displayStep}${displayTot ? ' / ' + displayTot : ''}`;
    textEl.textContent = narration;
  }

  setReportLink(dialog, (step || onPoster) && displayTot ? `${displayStep} / ${displayTot}` : '', idx);

  prevBtn.disabled = idx <= 0;
  // With a poster, Next wraps the last step back to the poster, so it is never disabled.
  nextBtn.disabled = posterFirst ? false : (total ? idx >= total - 1 : false);

  if (fill) {
    const pct = displayTot ? (displayTot > 1 ? (activeDot / (displayTot - 1)) * 100 : 100) : 0;
    fill.style.width = pct + '%';
  }

  if (dotsWrap && dotCount) {
    if (dotsWrap.children.length !== dotCount) {
      let html = '';
      for (let i = 0; i < dotCount; i++) {
        const target = posterFirst ? i + 1 : i;
        html += `<button class="step-dot" data-step="${target}" aria-label="Go to step ${i + 1}"></button>`;
      }
      dotsWrap.innerHTML = html;
      dotsWrap.querySelectorAll('.step-dot').forEach(dot => {
        dot.addEventListener('click', () => {
          const t = parseInt(dot.dataset.step, 10);
          if (activeController && activeController.gotoStep) activeController.gotoStep(t);
        });
      });
    }
    dotsWrap.querySelectorAll('.step-dot').forEach((dot, i) => {
      dot.classList.toggle('active', i === activeDot);
      dot.classList.toggle('passed', i < activeDot);
    });
  }
}

function updatePlayBtn(dialog, playing) {
  const btn = dialog.querySelector('[data-act="play"]');
  btn.innerHTML = playing ? ICON.pause : ICON.play;
  btn.setAttribute('aria-label', playing ? 'Pause' : 'Play');
}

function showLoadError(dialog) {
  const overlay = dialog.querySelector('.narration-overlay');
  if (overlay) overlay.classList.remove('is-poster');
  const text = dialog.querySelector('.narration-text');
  text.textContent = 'Failed to load this scheme. Check the console for details.';
}

function closeDialog({ updateHash = true } = {}) {
  const dlg = document.querySelector('dialog.scheme-dialog');
  teardownController();
  activeDialogScheme = null;
  if (dlg) {
    if (document.fullscreenElement) document.exitFullscreen().catch(() => {});
    if (typeof dlg._inspectCleanup === 'function') {
      try { dlg._inspectCleanup(); } catch (_) {}
    }
    if (typeof dlg.close === 'function') {
      try { dlg.close(); } catch (_) {}
    }
    dlg.remove();
  }
  if (updateHash) writeHash(gridHash());
}

// Order-free, so `#scheme=x&step=2&at=storage` and a bare `#storage` go through one reader. An
// unknown token is ignored rather than treated as a filter: a stale link opens the full catalog.
function parseHash() {
  const out = { id: null, step: null, filter: null, q: '' };
  const raw = location.hash.slice(1);
  if (!raw) return out;
  for (const part of raw.split('&')) {
    let m;
    if ((m = /^scheme=([\w-]+)$/.exec(part))) {
      out.id = m[1];
    } else if ((m = /^step=(\d+)$/.exec(part))) {
      const n = parseInt(m[1], 10);
      out.step = n > 0 ? n - 1 : null;
    } else if ((m = /^at=([\w-]+)$/.exec(part))) {
      if (FILTER_KEYS.has(m[1])) out.filter = m[1];
    } else if ((m = /^q=(.*)$/.exec(part))) {
      // A hand-edited hash can carry a stray percent, which throws rather than returning anything.
      try { out.q = decodeURIComponent(m[1]); } catch (_) { out.q = m[1]; }
    } else if (FILTER_KEYS.has(part)) {
      out.filter = part;
    }
  }
  return out;
}

// A RELOAD restarts the card: the hashed step only records how far the animation got, and restoring
// it lands on a frozen middle frame. A link, a bookmark or a back keeps its step, and
// `navigation.type` tells the two apart.
function isReload() {
  try {
    const nav = performance.getEntriesByType('navigation')[0];
    return !!nav && nav.type === 'reload';
  } catch (_) {
    return false;
  }
}

function setupHashRouting() {
  const reloaded = isReload();
  let first = true;
  const apply = () => {
    const parsed = parseHash();
    // Only the OPENING pass, and only after a reload: a hashchange that arrives later is a
    // navigation of its own and means what it says.
    const step = first && reloaded ? null : parsed.step;
    first = false;
    // Grid state arriving through the hash (a shared link, an edited URL) rebuilds the grid. Init
    // has already applied the first one, so this is a no-op on the opening call. Both halves are
    // applied before either renders, or a hash carrying a section AND a search renders twice.
    const filterMoved = applyFilter(parsed.filter, { render: false });
    const searchMoved = applySearch(parsed.q, { render: false });
    if (filterMoved || searchMoved) {
      renderCatNav();
      renderSubNav();
      renderGrid();
      scrollToTop();
    }
    if (parsed.id) {
      if (!activeDialogScheme || activeDialogScheme.id !== parsed.id) {
        openScheme(parsed.id, step);
      } else if (step != null && activeController && activeController.gotoStep) {
        activeController.gotoStep(step);
      }
      return;
    }
    if (activeController) closeDialog({ updateHash: false });
    // Same normalisation init does, for a hash that arrives without a reload: a fragment link into
    // the open page is a hashchange, not a fresh load, so init never sees it.
    writeHash(gridHash());
  };
  window.addEventListener('hashchange', apply);
  apply();
}

// The scroll-to-top button, wired as cli/js/app.js wires its own. Its smooth glide is wanted, unlike
// the instant filter reset (D-16).
const SCROLL_THRESHOLD = 300;

function setupScrollTop() {
  const btn = document.getElementById('scrollTopBtn');
  if (!btn) return;
  window.addEventListener('scroll', () => {
    btn.classList.toggle('visible', window.scrollY > SCROLL_THRESHOLD);
  }, { passive: true });
  btn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
}

const keysHelp = setupKeysHelp([
  { title: 'Catalog', rows: [
    { keys: [['/']], desc: 'Focus search' },
    { keys: [['Esc']], desc: 'Clear search' },
    { keys: [['Enter']], desc: 'Open the focused card' },
    { keys: [['?']], desc: 'Show this list' },
  ] },
  { title: 'Inside a card', rows: [
    { keys: [['Space']], desc: 'Play or pause' },
    { keys: [['←'], ['→']], desc: 'Previous or next step' },
    { keys: [['Shift', '←'], ['Shift', '→']], desc: 'Previous or next card' },
    { keys: [['R']], desc: 'Restart' },
    { keys: [['L']], desc: 'Loop on or off' },
    { keys: [['F']], desc: 'Fullscreen' },
    { keys: [['Esc']], desc: 'Close' },
  ] },
]);

function setupGlobalKeys() {
  document.addEventListener('keydown', (e) => {
    if (e.target && /^(input|textarea|select)$/i.test(e.target.tagName)) return;
    if (keysHelp.isOpen()) return;
    if (activeDialogScheme && isLetter(e, 'f') && !e.ctrlKey && !e.metaKey && !e.altKey) {
      e.preventDefault();
      toggleFullscreen();
      return;
    }
    // Shift+arrows flip to the neighbouring card, plain arrows step inside this one. A flip is
    // keyed off the open card rather than its controller, so presses landing while the next module
    // is still loading are not dropped.
    if (activeDialogScheme && e.shiftKey && (e.key === 'ArrowLeft' || e.key === 'ArrowRight')) {
      e.preventDefault();
      navigateScheme(e.key === 'ArrowLeft' ? -1 : 1);
      return;
    }
    if (!activeController) return;
    if (e.key === ' ' || e.code === 'Space') {
      e.preventDefault();
      if (activeController.isPlaying && activeController.isPlaying()) activeController.pause();
      else activeController.play();
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      activeController.step('prev');
    } else if (e.key === 'ArrowRight') {
      e.preventDefault();
      activeController.step('next');
    } else if (isLetter(e, 'r') && !e.ctrlKey && !e.metaKey && !e.altKey) {
      e.preventDefault();
      activeController.restart();
    } else if (isLetter(e, 'l') && !e.ctrlKey && !e.metaKey && !e.altKey) {
      e.preventDefault();
      const next = !(activeController.isLooping && activeController.isLooping());
      activeController.setLoop(next);
      const btn = document.querySelector('dialog.scheme-dialog .ctl-btn[data-act="loop"]');
      if (btn) btn.setAttribute('aria-pressed', next ? 'true' : 'false');
      setSavedLoop(next);
    }
  });
}

// Chrome parity: the logo is centred over the nav's "All" button, and every page runs its own copy
// (the hub carries a ghost-ruler nav to measure against). Skipped at <=900px, where the nav wraps.
function alignLogo() {
  const logo = document.querySelector('.logo');
  if (!logo) return;
  if (window.innerWidth <= 900) { logo.style.marginLeft = '0'; return; }
  const allBtn   = document.querySelector('[data-cat="all"]');
  const logoIcon = document.querySelector('.logo-icon');
  if (!allBtn || !logoIcon) return;
  const currentMargin = parseFloat(logo.style.marginLeft) || 0;
  const allCenter  = allBtn.getBoundingClientRect().left  + allBtn.offsetWidth  / 2;
  const iconCenter = logoIcon.getBoundingClientRect().left + logoIcon.offsetWidth / 2;
  logo.style.marginLeft = (currentMargin + allCenter - iconCenter) + 'px';
}
window.addEventListener('resize', alignLogo);
if (document.fonts && document.fonts.ready) {
  document.fonts.ready.then(() => requestAnimationFrame(alignLogo));
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => { init(); requestAnimationFrame(alignLogo); });
} else {
  init();
  requestAnimationFrame(alignLogo);
}
