// Grid, filtering, poster rendering, hash routing and the shared chrome. The card dialog is dialog.js.
// With dialog.js and lib/motion.js, one of the modules allowed to touch a browser global at load.
import { DIAGRAMS, CATEGORIES, CATEGORY_LABEL, CATEGORY_ICONS, CATEGORY_TAGLINE, SUBCATEGORIES } from './data.js';
import { renderPoster } from './lib/poster.js';
import { reducedMotion, onReducedMotionChange } from './lib/motion.js';
import { MOBILE_STUB, activeController, activeDialogDiagram, setupDialog, setupDialogKeys, openDiagram, closeDialog, syncDialogStar, refreshDialogNav } from './dialog.js';
import { setupSidebar } from '../../cli/js/lib/sidebar.js';
import { setupKeysHelp, isSlash } from '../../cli/js/lib/keys.js';
import { trackFresh } from '../../cli/js/lib/fresh.js';
import { REV } from './revisions.js';
import { setupHeader, alignLogo, copyText, escapeHtml } from '../../cli/js/lib/chrome.js';

setupSidebar();

const COPY_RESET_DELAY = 1500;

const STARRED_KEY = 'kube-how:diagram-starred:v1';
const VIEW_KEY  = 'kube-how:diagram-view:v1';

// One-time move of the keys this app wrote as kube-how:scheme-*:v1, before anything reads them.
for (const k of ['speed', 'starred', 'loop', 'view', 'seen']) {
  try {
    const from = `kube-how:scheme-${k}:v1`, to = `kube-how:diagram-${k}:v1`, v = localStorage.getItem(from);
    if (v !== null && localStorage.getItem(to) === null) localStorage.setItem(to, v);
    localStorage.removeItem(from);
  } catch (_) {}
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

setupHeader();

const ICON = {
  link:    '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>',
  linkDone: '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="20 6 9 17 4 12"/></svg>',
  viewFull: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="3" width="7" height="7" rx="1.5"/><line x1="14" y1="5" x2="21" y2="5"/><line x1="14" y1="9" x2="19" y2="9"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><line x1="14" y1="16" x2="21" y2="16"/><line x1="14" y1="20" x2="19" y2="20"/></svg>',
  viewCompact: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/></svg>',
  star:    '<svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round" aria-hidden="true"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>',
};

let activeCat = 'all';
let activeSub = null;
// TWO values, and the reason is the round trip: `searchQuery` is what the filter matches against
// (trimmed, folded to lower case) and `searchText` is what the reader actually typed, which is what
// the hash carries and what goes back into the input on a reload.
let searchText = '';
let searchQuery = '';
// Routing: `#at=<key>&q=<search>` is grid state, `#diagram=<id>&step=<n>&at=..&q=..` a card plus the grid
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
// path is written in full with its trailing slash: a bare '#...' would resolve against /diagrams and
// drop it, and a slashless address costs a redirect and splits analytics in two.
function writeHash(hash) {
  const base = location.pathname.replace(/\/?$/, '/');
  const target = base + location.search + (hash || '');
  if (location.pathname + location.search + location.hash !== target) history.replaceState(null, '', target);
}

function diagramHash(id, stepIdx) {
  let hash = `#diagram=${id}`;
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
  setupDialog({
    writeHash, diagramHash, gridHash, clearNew, toggleStar,
    isStarred: (id) => starred.has(id),
    viewOrder: () => buildUnits(filteredDiagrams()).flatMap(u => u.diagrams),
    catalogOrder: () => buildUnits(DIAGRAMS).flatMap(u => u.diagrams),
  });
  if (reducedMotion()) document.body.classList.add('reduced-motion');
  onReducedMotionChange(() => document.body.classList.toggle('reduced-motion', reducedMotion()));
  document.getElementById('year').textContent = new Date().getFullYear();
  // The browser would restore a scroll offset measured against the grid it had BEFORE the filter
  // was applied, which is a different document height and lands nowhere in particular.
  if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
  document.body.classList.toggle('view-compact', getSavedView() === 'compact');
  const parsed = parseHash();
  // A phone cannot play a card, but every card is also a readable page: a shared deep link lands
  // there, on the same step, instead of on the stub.
  if (MOBILE_STUB.matches && DIAGRAMS.some(s => s.id === parsed.id)) {
    // parsed.step is the player index, which is also the page's step-<n> anchor. 0 is the poster.
    location.replace(`/diagrams/card/${parsed.id}/${parsed.step ? `#step-${parsed.step}` : ''}`);
    return;
  }
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
  setupDialogKeys(() => keysHelp.isOpen());
  setupScrollTop();
  setupMobileStub();
}

// The stub's copy button hands over the current URL, deep link and all, so a reader can send the
// card to their computer. A rotation or a resize into the stub closes an open dialog.
function setupMobileStub() {
  MOBILE_STUB.addEventListener('change', (e) => {
    if (e.matches && activeDialogDiagram) closeDialog({ updateHash: false });
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
    copyText(url, finish);
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

function filteredDiagrams() {
  return DIAGRAMS.filter(s => {
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
      <div class="card-poster">${renderPoster(s)}${fresh.isNew(freshKey(s.id)) ? '<span class="new-pill card-new" title="New or updated since your last visit">NEW</span>' : ''}</div>
      <div class="card-body">
        <div class="card-title"><a class="card-link" href="/diagrams/card/${escapeHtml(s.id)}/">${escapeHtml(s.title)}</a></div>
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

// "New or changed since your last visit" (cli/js/lib/fresh.js). Keyed by id@revision, so any edit to
// a card reads NEW again. Opening a card clears it.
const freshKey = (id) => `${id}@${REV[id] || ''}`;
const fresh = trackFresh('kube-how:diagram-seen:v1', DIAGRAMS.map(s => freshKey(s.id)));

function newChip(n) {
  return n ? `<span class="section-new" title="New since your last visit">${n} new</span>` : '';
}

function clearNew(id) {
  if (!fresh.isNew(freshKey(id))) return;
  fresh.clear(freshKey(id));
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
    refreshDialogNav();
    return;
  }
  document.querySelectorAll(`.card[data-id="${id}"] .star-btn`).forEach(btn => {
    btn.classList.toggle('starred', nowOn);
    btn.setAttribute('aria-pressed', nowOn);
  });
}

function renderSection(unit) {
  const { catKey, subKey, label, tagline, diagrams } = unit;
  const icon = CATEGORY_ICONS[catKey] || '';
  const total = diagrams.length;
  const word = total === 1 ? 'diagram' : 'diagrams';
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
        ${newChip(diagrams.filter(s => fresh.isNew(freshKey(s.id))).length)}
        <span class="section-count">${total} ${word}</span>
      </div>
      <div class="cards-grid">${diagrams.map(renderCard).join('')}</div>
    </section>`;
}

// The grid is built as UNITS (a category, or a subcategory inside one) and not as a flat list, so a
// header carries its own count and tagline and the manifests keep one category's own order.
function buildUnits(list) {
  const order = CATEGORIES.filter(c => c.key !== 'all').map(c => c.key);
  const units = [];
  for (const catKey of order) {
    const catDiagrams = list.filter(s => s.category === catKey);
    if (catDiagrams.length === 0) continue;
    const subs = SUBCATEGORIES[catKey];
    if (subs && subs.length) {
      for (const sc of subs) {
        const subDiagrams = catDiagrams.filter(s => s.subcategory === sc.key);
        if (subDiagrams.length === 0) continue;
        units.push({
          catKey,
          subKey: sc.key,
          label:  sc.label,
          // A subcategory row is titled by the subcategory and subtitled by its
          // category. Subcategories carry no tagline of their own.
          tagline: CATEGORY_LABEL[catKey] || catKey,
          diagrams: subDiagrams,
        });
      }
      const orphans = catDiagrams.filter(s => !s.subcategory || !subs.find(x => x.key === s.subcategory));
      if (orphans.length) {
        units.push({
          catKey,
          subKey: '_other',
          label:  CATEGORY_LABEL[catKey] || catKey,
          tagline: CATEGORY_TAGLINE[catKey] || '',
          diagrams: orphans,
        });
      }
    } else {
      units.push({
        catKey,
        subKey: null,
        label:  CATEGORY_LABEL[catKey] || catKey,
        tagline: CATEGORY_TAGLINE[catKey] || '',
        diagrams: catDiagrams,
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
    copyText(url, finish);
  });
}

function renderGrid() {
  const grid = document.getElementById('grid');
  const list = filteredDiagrams();
  if (list.length === 0 && activeCat === STARRED && !searchQuery) {
    grid.innerHTML = `
      <div class="empty">
        <div class="empty-icon">${ICON.star}</div>
        <div class="empty-title">No starred diagrams yet.</div>
        <div class="empty-desc">Click the star on a card to save it here.</div>
      </div>
    `;
    return;
  }
  if (list.length === 0) {
    grid.innerHTML = `
      <div class="empty">
        <div class="empty-title">No diagrams match.</div>
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
      // The title is a real link to the card's static page (/diagrams/card/<id>/), which is what crawlers
      // follow. A plain click still opens the dialog. A modified click is left to the browser, so
      // Ctrl/Cmd+click opens the page in a new tab.
      if (e.target.closest('.card-link') && (e.ctrlKey || e.metaKey || e.shiftKey || e.altKey)) return;
      e.preventDefault();
      openDiagram(card.dataset.id);
    });
    // The link is the card's one focus stop: Enter clicks it, and Space opens the card too.
    card.querySelector('.card-link').addEventListener('keydown', (e) => {
      if (e.key === ' ') {
        e.preventDefault();
        openDiagram(card.dataset.id);
      }
    });
  });
}

// Order-free, so `#diagram=x&step=2&at=storage` and a bare `#storage` go through one reader. An
// unknown token or card id is ignored rather than kept: a stale link opens the full catalog.
function parseHash() {
  const out = { id: null, step: null, filter: null, q: '' };
  const raw = location.hash.slice(1);
  if (!raw) return out;
  for (const part of raw.split('&')) {
    let m;
    if ((m = /^(?:diagram|scheme)=([\w-]+)$/.exec(part))) {   // scheme= is the old name, still read
      if (DIAGRAMS.some(d => d.id === m[1])) out.id = m[1];
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
      if (!activeDialogDiagram || activeDialogDiagram.id !== parsed.id) {
        openDiagram(parsed.id, step);
      } else if (step != null && activeController) {
        activeController.gotoStep(step);
      }
      return;
    }
    if (activeDialogDiagram) closeDialog({ updateHash: false });
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

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => { init(); alignLogo('[data-cat="all"]'); });
} else {
  init();
  alignLogo('[data-cat="all"]');
}
