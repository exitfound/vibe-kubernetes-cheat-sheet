// The header every page shares: GitHub, Contacts and Sponsor (data in ../contacts.js), the copy
// helper and its icons, and the logo centred over the nav's "All" button. The one copy, imported by
// the hub, /cli/, /diagrams/, 404.html and the static pages.

export const COPY_ICON  = `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>`;
export const CHECK_ICON = `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>`;
const CONTACT_ICON = `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>`;
const SPONSOR_ICON = `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>`;
const COPY_RESET_DELAY = 1500;

export const escapeHtml = (s) => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);

export function fallbackCopy(text, callback) {
  const ta = document.createElement('textarea');
  ta.value = text;
  ta.style.cssText = 'position:fixed;top:-9999px;left:-9999px;opacity:0;pointer-events:none';
  document.body.appendChild(ta);
  ta.focus();
  ta.select();
  // execCommand reports a refused copy by returning false, so the check shows only on a real copy.
  try { if (document.execCommand('copy')) callback(); } catch (_) {}
  document.body.removeChild(ta);
}

// The one copy path: the async clipboard where the context allows it, the textarea fallback on
// plain http or a refused permission. `done` runs once the text is on the clipboard.
export function copyText(text, done) {
  if (navigator.clipboard && window.isSecureContext) {
    navigator.clipboard.writeText(text).then(done, () => fallbackCopy(text, done));
  } else {
    fallbackCopy(text, done);
  }
}

// ── Logo ──────────────────────────────────────────────────────
// Centres the logo icon over the nav's "All" button, named by `allSelector` (the hub and 404.html
// measure an invisible ruler nav). Skipped at <=900px, where the nav wraps.
export function alignLogo(allSelector) {
  const align = () => {
    const logo = document.querySelector('.logo');
    if (!logo) return;
    if (window.innerWidth <= 900) { logo.style.marginLeft = '0'; return; }
    const allBtn   = document.querySelector(allSelector);
    const logoIcon = document.querySelector('.logo-icon');
    if (!allBtn || !logoIcon) return;
    // Read phase first (before any writes) to avoid forced layout
    const currentMargin = parseFloat(logo.style.marginLeft) || 0;
    const allCenter  = allBtn.getBoundingClientRect().left  + allBtn.offsetWidth  / 2;
    const iconCenter = logoIcon.getBoundingClientRect().left + logoIcon.offsetWidth / 2;
    logo.style.marginLeft = (currentMargin + allCenter - iconCenter) + 'px';
  };
  requestAnimationFrame(align);
  window.addEventListener('resize', align);
  document.fonts?.ready.then(() => requestAnimationFrame(align));
}

// ── Header actions ────────────────────────────────────────────
let copyTimer;

function renderHeaderActions(container, CONTACTS, SPONSOR, GITHUB) {
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
      <div class="action-wrap" data-anchor="contacts">
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
      <div class="action-wrap" data-anchor="sponsor">
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
      if (wrap.classList.contains('open')) closeAllDropdowns();
      else openDropdown(wrap);
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
      copyText(addr, finish);
    });
  });
}

// An open dropdown is written into the address as #contacts or #sponsor, so the link can be shared,
// and a page opened with one opens it. Closing puts back the hash the page had, unless the app has
// written its own since.
const ANCHORS = ['contacts', 'sponsor'];
let hashBeforeOpen = '';

function writeHash(hash) {
  const target = location.pathname + location.search + hash;
  if (location.pathname + location.search + location.hash !== target) history.replaceState(null, '', target);
}

function openDropdown(wrap) {
  closeAllDropdowns();
  wrap.classList.add('open');
  wrap.querySelector('.action-btn').setAttribute('aria-expanded', 'true');
  hashBeforeOpen = ANCHORS.includes(location.hash.slice(1)) ? '' : location.hash;
  writeHash(`#${wrap.dataset.anchor}`);
}

function openFromHash(anchor) {
  if (!ANCHORS.includes(anchor)) return;
  const wrap = document.querySelector(`#headerActions .action-wrap[data-anchor="${anchor}"]`);
  if (wrap && !wrap.classList.contains('open')) openDropdown(wrap);
}

function closeAllDropdowns() {
  const open = document.querySelector('#headerActions .action-wrap.open');
  document.querySelectorAll('#headerActions .action-wrap').forEach(w => {
    w.classList.remove('open');
    w.querySelector('.action-btn').setAttribute('aria-expanded', 'false');
  });
  if (open && location.hash === `#${open.dataset.anchor}`) writeHash(hashBeforeOpen);
}

// Fills #headerActions. Deleting ../contacts.js leaves the header without its actions.
export async function setupHeader() {
  const container = document.getElementById('headerActions');
  if (!container) return;
  // Both read before /diagrams/ normalises an unknown hash away: the first before the dynamic import
  // below resolves, the second in a listener added ahead of the app's, opening once that has run.
  const initial = location.hash.slice(1);
  window.addEventListener('hashchange', () => {
    const anchor = location.hash.slice(1);
    setTimeout(() => openFromHash(anchor));
  });
  document.addEventListener('click', closeAllDropdowns);
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && document.querySelector('#headerActions .action-wrap.open')) {
      e.stopPropagation();
      closeAllDropdowns();
    }
  });
  try {
    const mod = await import('../contacts.js');
    renderHeaderActions(container, mod.CONTACTS, mod.SPONSOR, mod.GITHUB);
    openFromHash(initial);
  } catch (_) {}
}
