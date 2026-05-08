import { SCHEMES, CATEGORIES, CATEGORY_LABEL, CATEGORY_ICONS, CATEGORY_SUB, SUBCATEGORIES } from './data.js';
import { POSTERS } from './posters.js';
import { reducedMotion, onReducedMotionChange } from './lib/motion.js';
import { mainUrl } from './lib/env.js';
import { setupSidebar } from './lib/sidebar.js';

const MAIN_URL = mainUrl();

{
  const sideCli = document.getElementById('sideCli');
  if (sideCli) sideCli.href = MAIN_URL;
  const footerHomeLink = document.getElementById('footerHomeLink');
  if (footerHomeLink) footerHomeLink.href = MAIN_URL;
  setupSidebar();
}

const COPY_ICON    = `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>`;
const CHECK_ICON   = `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>`;
const CONTACT_ICON = `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>`;
const SPONSOR_ICON = `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>`;
const COPY_RESET_DELAY = 1500;
let copyTimer;

const SPEED_KEY = 'kube-how:scheme-speed:v1';
const LOOP_KEY  = 'kube-how:scheme-loop:v1';
const ALLOWED_SPEEDS = [0.5, 1, 2];

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
        <button class="action-btn" aria-expanded="false" aria-haspopup="true">
          ${CONTACT_ICON}<span class="action-btn-label">Contacts</span>
        </button>
        <div class="action-dropdown" role="menu">${links}</div>
      </div>`;
  }

  if (SPONSOR && SPONSOR.enabled) {
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
  search:  '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="11" cy="11" r="7"/><line x1="20" y1="20" x2="16.65" y2="16.65"/></svg>',
  searchClear: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>',
};

function escapeHtml(s) { return String(s).replace(/[&<>"']/g, c => ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' })[c]); }

let activeCat = 'all';
let activeSub = null;
let searchQuery = '';
let activeController = null;
let activeDialogScheme = null;

function init() {
  if (reducedMotion()) document.body.classList.add('reduced-motion');
  onReducedMotionChange(() => document.body.classList.toggle('reduced-motion', reducedMotion()));
  document.getElementById('year').textContent = new Date().getFullYear();
  setupSearch();
  renderCatNav();
  renderSubNav();
  renderGrid();
  setupHashRouting();
  setupGlobalKeys();
}

function setupSearch() {
  const input = document.getElementById('searchInput');
  const clear = document.getElementById('searchClear');
  let timer = null;
  input.addEventListener('input', () => {
    clearTimeout(timer);
    timer = setTimeout(() => {
      searchQuery = input.value.trim().toLowerCase();
      renderGrid();
    }, 80);
  });
  clear.addEventListener('click', () => {
    input.value = '';
    searchQuery = '';
    renderGrid();
    input.focus();
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && document.activeElement === input) {
      input.value = '';
      searchQuery = '';
      renderGrid();
    }
  });
}

function renderCatNav() {
  const inner = document.getElementById('catNavInner');
  const parts = CATEGORIES.map((c, i) => {
    const btn = `<button class="cat-btn ${c.key === activeCat ? 'active' : ''}" data-cat="${c.key}">${escapeHtml(c.label)}</button>`;
    return c.key === 'all' ? `${btn}<span class="nav-sep"></span>` : btn;
  });
  inner.innerHTML = parts.join('');
  inner.querySelectorAll('.cat-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const next = btn.dataset.cat;
      if (next === activeCat) return;
      activeCat = next;
      activeSub = null;
      renderCatNav();
      renderSubNav();
      renderGrid();
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
        if (activeSub === null) return;
        activeSub = null;
      } else if (activeSub === sub) {
        activeSub = null;
      } else {
        activeSub = sub;
      }
      renderSubNav();
      renderGrid();
    });
  });
}

function filteredSchemes() {
  return SCHEMES.filter(s => {
    if (activeCat !== 'all' && s.category !== activeCat) return false;
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
    <article class="card" data-id="${escapeHtml(s.id)}" data-cat="${escapeHtml(s.category)}" tabindex="0" role="button" aria-label="${escapeHtml(s.title)}">
      <div class="card-poster">${renderPoster(s)}</div>
      <div class="card-body">
        <div class="card-title">${escapeHtml(s.title)}</div>
        <div class="card-desc">${escapeHtml(s.desc)}</div>
        <div class="card-meta">
          <span class="card-cat">${escapeHtml(CATEGORY_LABEL[s.category] || s.category)}</span>
          <span class="card-version">k8s ${escapeHtml(s.k8sVersion)}</span>
        </div>
      </div>
    </article>
  `;
}

function renderSection(unit) {
  const { catKey, subKey, label, sub, schemes } = unit;
  const icon = CATEGORY_ICONS[catKey] || '';
  const total = schemes.length;
  const word = total === 1 ? 'scheme' : 'schemes';
  const subAttr = subKey ? ` data-subcat="${escapeHtml(subKey)}"` : '';
  return `
    <section class="section" data-cat="${escapeHtml(catKey)}"${subAttr}>
      <div class="section-header">
        <div class="section-icon">${icon}</div>
        <h2 class="section-title">${escapeHtml(label)}</h2>
        <span class="section-sub">${escapeHtml(sub)}</span>
        <span class="section-count">${total} ${word}</span>
      </div>
      <div class="cards-grid">${schemes.map(renderCard).join('')}</div>
    </section>`;
}

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
          sub:    sc.sub || CATEGORY_LABEL[catKey] || catKey,
          schemes: subSchemes,
        });
      }
      const orphans = catSchemes.filter(s => !s.subcategory || !subs.find(x => x.key === s.subcategory));
      if (orphans.length) {
        units.push({
          catKey,
          subKey: '_other',
          label:  CATEGORY_LABEL[catKey] || catKey,
          sub:    CATEGORY_SUB[catKey] || '',
          schemes: orphans,
        });
      }
    } else {
      units.push({
        catKey,
        subKey: null,
        label:  CATEGORY_LABEL[catKey] || catKey,
        sub:    CATEGORY_SUB[catKey] || '',
        schemes: catSchemes,
      });
    }
  }
  return units;
}

function renderGrid() {
  const grid = document.getElementById('grid');
  const list = filteredSchemes();
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
    card.addEventListener('click', () => openScheme(card.dataset.id));
    card.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        openScheme(card.dataset.id);
      }
    });
  });
}

const POSTER_COLORS = {
  network:   '#4fe5ff',
  storage:   '#4fd5a3',
  workloads: '#5cb1ff',
  scaling:   '#ffa04d',
  control:   '#7d86ff',
  security:  '#ff5757',
  lifecycle: '#ff668c',
};

const FALLBACK_POSTER = `
  <g stroke="currentColor" stroke-width="1.4" fill="none" opacity="0.9">
    <rect x="48"  y="58" width="74" height="64" rx="8"/>
    <rect x="198" y="58" width="74" height="64" rx="8"/>
    <line x1="122" y1="90" x2="198" y2="90" stroke-dasharray="4 4"/>
  </g>
  <circle cx="160" cy="90" r="5" fill="currentColor" opacity="0.95"/>
`;

function renderPoster(scheme) {
  const color = POSTER_COLORS[scheme.category] || '#e0cdff';
  const gid = 'pg-' + scheme.id;
  const fg = POSTERS[scheme.id] || FALLBACK_POSTER;
  return `
    <svg viewBox="0 0 320 180" preserveAspectRatio="xMidYMid meet" aria-hidden="true">
      <defs>
        <linearGradient id="${escapeHtml(gid)}" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stop-color="${color}" stop-opacity="0.22"/>
          <stop offset="1" stop-color="${color}" stop-opacity="0"/>
        </linearGradient>
      </defs>
      <rect x="0" y="0" width="320" height="180" fill="url(#${escapeHtml(gid)})"/>
      <g style="color:${color}">${fg}</g>
    </svg>
  `;
}

async function openScheme(id, initialStep = null) {
  const scheme = SCHEMES.find(s => s.id === id);
  if (!scheme) return;
  if (activeController || activeDialogScheme || document.querySelector('dialog.scheme-dialog')) {
    closeDialog({ updateHash: false });
  }
  const dialog = buildDialog(scheme);
  document.body.appendChild(dialog);
  if (typeof dialog.showModal === 'function') {
    dialog.showModal();
  } else {
    dialog.setAttribute('open', '');
  }
  activeDialogScheme = scheme;
  const baseHash = `#scheme=${id}`;
  const wantedHash = initialStep != null ? `${baseHash}&step=${initialStep + 1}` : baseHash;
  if (location.hash !== wantedHash) {
    history.replaceState(null, '', wantedHash);
  }

  let mod;
  try {
    mod = await import(scheme.module);
  } catch (e) {
    console.error('Failed to load scheme:', e);
    showLoadError(dialog);
    return;
  }
  if (activeDialogScheme !== scheme) return;
  const root = dialog.querySelector('.dialog-canvas');
  root.replaceChildren();
  const ctrl = mod.init(root, {
    onStepChange: (idx, step, total) => {
      updateNarration(dialog, idx, step, total);
      if (activeDialogScheme && activeDialogScheme.id === scheme.id) {
        const newHash = `#scheme=${scheme.id}&step=${idx + 1}`;
        if (location.hash !== newHash) history.replaceState(null, '', newHash);
      }
    },
    onPlayingChange: (playing) => updatePlayBtn(dialog, playing),
  });
  activeController = ctrl;

  ctrl.setSpeed(getSavedSpeed());
  ctrl.setLoop(getSavedLoop());

  if (initialStep != null && ctrl.gotoStep) {
    ctrl.gotoStep(initialStep);
  } else {
    ctrl.gotoStep(0);
    if (!reducedMotion()) {
      setTimeout(() => {
        if (activeController === ctrl) ctrl.play();
      }, 500);
    }
  }
}

function buildDialog(scheme) {
  const dlg = document.createElement('dialog');
  dlg.className = 'scheme-dialog';
  dlg.setAttribute('data-cat', scheme.category);
  dlg.setAttribute('aria-labelledby', 'dialogTitle');
  const sourceLink = scheme.sources && scheme.sources[0]
    ? `<span class="ctl-source">Source: <a href="${escapeHtml(scheme.sources[0].href)}" target="_blank" rel="noopener">${escapeHtml(scheme.sources[0].label)}</a></span>`
    : '';
  const initialLoop  = getSavedLoop();
  const initialSpeed = getSavedSpeed();
  const speedActive = (v) => initialSpeed === v ? ' class="active"' : '';
  dlg.innerHTML = `
    <div class="dialog-inner">
      <header class="dialog-header">
        <h2 id="dialogTitle" class="dialog-title">${escapeHtml(scheme.title)}</h2>
        <div class="dialog-meta">
          <span class="card-cat">${escapeHtml(CATEGORY_LABEL[scheme.category] || scheme.category)}</span>
          <span>k8s ${escapeHtml(scheme.k8sVersion)}</span>
        </div>
        <button class="dialog-close" aria-label="Close">${ICON.close}</button>
      </header>
      <div class="dialog-body">
        <div class="dialog-stage">
          <div class="dialog-canvas" aria-live="polite"></div>
          <aside class="narration-overlay" aria-live="polite">
            <div class="narration-step">Loading…</div>
            <div class="narration-text">Loading scheme…</div>
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
        ${sourceLink}
      </div>
    </div>
  `;

  dlg.querySelector('.dialog-close').addEventListener('click', () => closeDialog());
  dlg.addEventListener('cancel', (e) => { e.preventDefault(); closeDialog(); });

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

function updateNarration(dialog, idx, step, total) {
  const stepEl = dialog.querySelector('.narration-step');
  const textEl = dialog.querySelector('.narration-text');
  if (!step) { stepEl.textContent = ''; textEl.textContent = ''; return; }
  stepEl.textContent = `Step ${idx + 1}${total ? ' / ' + total : ''}`;
  textEl.textContent = step.narration || '';
  const prevBtn = dialog.querySelector('[data-act="prev"]');
  const nextBtn = dialog.querySelector('[data-act="next"]');
  prevBtn.disabled = idx <= 0;
  nextBtn.disabled = total ? idx >= total - 1 : false;
  const fill = dialog.querySelector('.dialog-progress-fill');
  if (fill && total) {
    const pct = total > 1 ? (idx / (total - 1)) * 100 : 100;
    fill.style.width = pct + '%';
  }
  const dotsWrap = dialog.querySelector('.dialog-step-dots');
  if (dotsWrap && total) {
    if (dotsWrap.children.length !== total) {
      let html = '';
      for (let i = 0; i < total; i++) {
        html += `<button class="step-dot" data-step="${i}" aria-label="Go to step ${i + 1}"></button>`;
      }
      dotsWrap.innerHTML = html;
      dotsWrap.querySelectorAll('.step-dot').forEach(dot => {
        dot.addEventListener('click', () => {
          const target = parseInt(dot.dataset.step, 10);
          if (activeController && activeController.gotoStep) activeController.gotoStep(target);
        });
      });
    }
    dotsWrap.querySelectorAll('.step-dot').forEach((dot, i) => {
      dot.classList.toggle('active', i === idx);
      dot.classList.toggle('passed', i < idx);
    });
  }
}

function updatePlayBtn(dialog, playing) {
  const btn = dialog.querySelector('[data-act="play"]');
  btn.innerHTML = playing ? ICON.pause : ICON.play;
  btn.setAttribute('aria-label', playing ? 'Pause' : 'Play');
}

function showLoadError(dialog) {
  const text = dialog.querySelector('.narration-text');
  text.textContent = 'Failed to load this scheme. Check the console for details.';
}

function closeDialog({ updateHash = true } = {}) {
  const dlg = document.querySelector('dialog.scheme-dialog');
  if (activeController) {
    try { activeController.destroy(); } catch (_) {}
    activeController = null;
  }
  activeDialogScheme = null;
  if (dlg) {
    if (typeof dlg.close === 'function') {
      try { dlg.close(); } catch (_) {}
    }
    dlg.remove();
  }
  if (updateHash && location.hash) {
    history.replaceState(null, '', location.pathname + location.search);
  }
}

function parseSchemeHash() {
  const m = location.hash.match(/^#scheme=([\w-]+)(?:&step=(\d+))?/);
  if (!m) return null;
  const stepNum = m[2] ? parseInt(m[2], 10) : null;
  const stepIdx = stepNum != null && stepNum > 0 ? stepNum - 1 : null;
  return { id: m[1], step: stepIdx };
}

function setupHashRouting() {
  const apply = () => {
    const parsed = parseSchemeHash();
    if (parsed) {
      if (!activeDialogScheme || activeDialogScheme.id !== parsed.id) {
        openScheme(parsed.id, parsed.step);
      } else if (parsed.step != null && activeController && activeController.gotoStep) {
        activeController.gotoStep(parsed.step);
      }
    } else if (activeController) {
      closeDialog({ updateHash: false });
    }
  };
  window.addEventListener('hashchange', apply);
  apply();
}

function setupGlobalKeys() {
  document.addEventListener('keydown', (e) => {
    if (!activeController) return;
    if (e.target && /^(input|textarea|select)$/i.test(e.target.tagName)) return;
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
    } else if (e.key === 'r' || e.key === 'R') {
      e.preventDefault();
      activeController.restart();
    } else if (e.key === 'l' || e.key === 'L') {
      e.preventDefault();
      const next = !(activeController.isLooping && activeController.isLooping());
      activeController.setLoop(next);
      const btn = document.querySelector('dialog.scheme-dialog .ctl-btn[data-act="loop"]');
      if (btn) btn.setAttribute('aria-pressed', next ? 'true' : 'false');
      setSavedLoop(next);
    }
  });
}

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
