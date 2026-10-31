// The header every page shares: GitHub, Contacts and Sponsor (data in ../contacts.js), the language
// switch, the copy helper and its icons, and the logo centred over the nav's "All" button. The one
// copy, imported by the hub, /cli/, /diagrams/, 404.html and the static pages.

import { getLang, setLang, LANG_EVENT } from './lang.js';

export const COPY_ICON  = `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>`;
export const CHECK_ICON = `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>`;
const CONTACT_ICON = `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>`;
const SPONSOR_ICON = `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>`;
const COPY_RESET_DELAY = 1500;

export const escapeHtml = (s) => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);

function fallbackCopy(text, callback, failed) {
  const ta = document.createElement('textarea');
  ta.value = text;
  ta.style.cssText = 'position:fixed;top:-9999px;left:-9999px;opacity:0;pointer-events:none';
  document.body.appendChild(ta);
  ta.focus();
  ta.select();
  // execCommand reports a refused copy by returning false, so the check shows only on a real copy.
  let ok = false;
  try { ok = document.execCommand('copy'); } catch (_) {}
  document.body.removeChild(ta);
  if (ok) callback();
  else if (failed) failed();
}

// The one copy path: the async clipboard where the context allows it, the textarea fallback on
// plain http or a refused permission. `done` runs once the text is on the clipboard, `failed` when
// both paths refused.
export function copyText(text, done, failed) {
  if (navigator.clipboard && window.isSecureContext) {
    navigator.clipboard.writeText(text).then(done, () => fallbackCopy(text, done, failed));
  } else {
    fallbackCopy(text, done, failed);
  }
}

// Logo
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

// Search placeholder
// Shortens the placeholder when a narrow field would cut it, the aria-label keeps the full name.
// `data-ru-placeholder` and `data-ru-short` give the Russian pair. Returns the refit.
export function fitSearchPlaceholder(input) {
  const enFull = input.dataset.enPlaceholder || input.placeholder;
  const ctx = document.createElement('canvas').getContext('2d');
  const fit = () => {
    const ru = getLang() === 'ru';
    const full = (ru && input.dataset.ruPlaceholder) || enFull;
    const short = (ru && input.dataset.ruShort) || 'Search...';
    const cs = getComputedStyle(input);
    ctx.font = `${cs.fontWeight} ${cs.fontSize} ${cs.fontFamily}`;
    const room = input.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight);
    // Under even the short one, the field shows no placeholder: its magnifier and aria-label still name it.
    input.placeholder = ctx.measureText(full).width <= room ? full : ctx.measureText(short).width <= room ? short : '';
  };
  window.addEventListener(LANG_EVENT, fit);
  // The field itself is watched: the sidebar toggling changes its width with no window resize.
  if (window.ResizeObserver) new ResizeObserver(fit).observe(input);
  else window.addEventListener('resize', fit);
  // Onest arrives after the first switch to Russian, so every later font load refits too.
  document.fonts?.ready.then(fit);
  document.fonts?.addEventListener?.('loadingdone', fit);
  return fit;
}

// Nav fade
// The right-edge fade on a scrolling nav row shows only while buttons sit past that edge, as
// [data-more] on the row and its parent. Rows rebuilt by script are watched for new buttons.
export function watchNavFade(scrollers) {
  for (const el of scrollers) {
    if (!el) continue;
    const sync = () => {
      const more = el.scrollLeft + el.clientWidth < el.scrollWidth - 1;
      el.toggleAttribute('data-more', more);
      el.parentElement.toggleAttribute('data-more', more);
    };
    el.addEventListener('scroll', sync, { passive: true });
    if (window.ResizeObserver) new ResizeObserver(sync).observe(el);
    else window.addEventListener('resize', sync);
    new MutationObserver(sync).observe(el, { childList: true, subtree: true });
    document.fonts?.ready.then(sync);
    sync();
  }
}

// Header actions
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
      <a class="dropdown-link" href="${escapeHtml(l.href)}" target="_blank" rel="noopener">
        ${l.icon} ${escapeHtml(l.label)}
      </a>`).join('');
    html += `
      <div class="action-wrap" data-anchor="contacts">
        <button class="action-btn" aria-label="Contacts" aria-expanded="false">
          ${CONTACT_ICON}<span class="action-btn-label">Contacts</span>
        </button>
        <div class="action-dropdown">${links}</div>
      </div>`;
  }

  if (SPONSOR && SPONSOR.enabled) {
    const donate = `
      <a class="dropdown-copy-row dropdown-donate" href="${escapeHtml(SPONSOR.donate.href)}" target="_blank" rel="noopener" aria-label="${escapeHtml(SPONSOR.donate.label)}">
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
        <button class="action-btn" aria-label="Sponsor" aria-expanded="false">
          ${SPONSOR_ICON}<span class="action-btn-label">Sponsor</span>
        </button>
        <div class="action-dropdown">
          ${donate}
          <div class="dropdown-divider"></div>
          ${wallets}
        </div>
      </div>`;
  }

  container.innerHTML = html;
  const menuLabels = [...container.querySelectorAll('.action-wrap > .action-btn')].map(btn => ({
    btn, span: btn.querySelector('.action-btn-label'), en: btn.getAttribute('aria-label'),
  }));
  // The rows of the Sponsor menu speak only through aria-label: their visible text is a code or an address.
  const rowLabels = [...container.querySelectorAll('.dropdown-donate, .dropdown-copy-btn')].map(el => ({
    el, en: el.getAttribute('aria-label'),
  }));
  const relabel = () => {
    const ru = getLang() === 'ru';
    for (const { btn, span, en } of menuLabels) {
      const text = ru ? MENU_RU[en] || en : en;
      btn.setAttribute('aria-label', text);
      span.textContent = text;
      if (text !== en) btn.lang = 'ru'; else btn.removeAttribute('lang');
    }
    for (const { el, en } of rowLabels) {
      const text = ru ? rowRu(en) : en;
      el.setAttribute('aria-label', text);
      if (text !== en) el.lang = 'ru'; else el.removeAttribute('lang');
    }
  };
  relabel();
  window.addEventListener(LANG_EVENT, relabel);

  container.querySelectorAll('.action-wrap').forEach(wrap => {
    wrap.querySelector('.action-btn').addEventListener('click', e => {
      e.stopPropagation();
      if (wrap.classList.contains('open')) closeAllDropdowns();
      else openDropdown(wrap);
    });
    // Tabbing past the last row closes the dropdown instead of leaving it open behind the focus.
    wrap.addEventListener('focusout', e => {
      if (wrap.classList.contains('open') && e.relatedTarget && !wrap.contains(e.relatedTarget)) closeAllDropdowns();
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

// Anchored to its button's right edge, a dropdown on a narrow screen can start left of the viewport,
// or under the sidebar when it is shown (the sidebar sits above the header), so it is shifted right
// by the overhang and narrowed to the room left beside the sidebar.
const EDGE = 14;
function clampDropdown(wrap) {
  const drop = wrap.querySelector('.action-dropdown');
  drop.style.right = '';
  drop.style.maxWidth = '';
  const side = document.querySelector('.sidebar');
  const minLeft = Math.max(0, side ? side.getBoundingClientRect().right : 0) + EDGE;
  const room = window.innerWidth - minLeft - EDGE;
  if (drop.offsetWidth > room) drop.style.maxWidth = `${room}px`;
  const overhang = minLeft - drop.getBoundingClientRect().left;
  if (overhang > 0) drop.style.right = `${parseFloat(getComputedStyle(drop).right) - overhang}px`;
}

function openDropdown(wrap) {
  closeAllDropdowns();
  clampDropdown(wrap);
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

// The rightmost header button: EN and RU side by side, the current one lit, a click switches.
function renderLangSwitch(container) {
  const btn = document.createElement('button');
  btn.type = 'button';
  btn.className = 'action-btn lang-btn';
  btn.innerHTML = '<span class="lang-opt" data-lang="en">EN</span><span class="lang-opt" data-lang="ru" lang="ru">RU</span>';
  const sync = () => {
    const lang = getLang();
    btn.dataset.lang = lang;
    // The name starts with the visible "EN RU", so voice control can find the button by what it shows.
    const label = lang === 'ru' ? 'Switch to English' : 'Switch to Russian';
    btn.title = label;
    btn.setAttribute('aria-label', `EN RU, ${label[0].toLowerCase()}${label.slice(1)}`);
  };
  btn.addEventListener('click', () => setLang(getLang() === 'ru' ? 'en' : 'ru'));
  window.addEventListener(LANG_EVENT, sync);
  sync();
  container.append(btn);
}

// The two menu buttons follow the language switch, GitHub is a name.
const MENU_RU = {
  'Contacts': 'Контакты',
  'Sponsor': 'Поддержать',
};
const rowRu = (en) => en.replace(/^Copy (\S+) address$/, 'Копировать адрес $1').replace(/^Donate via /, 'Поддержать через ');

// Fills #headerActions. Deleting ../contacts.js leaves the header without its actions but the
// language switch.
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
    // The page's own Esc (clear the search) skips itself while a dropdown is open.
    const open = document.querySelector('#headerActions .action-wrap.open');
    if (e.key === 'Escape' && open) {
      // Focus inside the dropdown would fall to <body> once it hides, so it goes back to the button.
      const inside = open.contains(document.activeElement);
      closeAllDropdowns();
      if (inside) open.querySelector('.action-btn').focus();
    }
  });
  window.addEventListener('resize', () => {
    const open = document.querySelector('#headerActions .action-wrap.open');
    if (open) clampDropdown(open);
  });
  try {
    const mod = await import('../contacts.js');
    renderHeaderActions(container, mod.CONTACTS, mod.SPONSOR, mod.GITHUB);
    openFromHash(initial);
  } catch (_) {}
  renderLangSwitch(container);
}
