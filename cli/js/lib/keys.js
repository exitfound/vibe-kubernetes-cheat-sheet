// The shortcuts sheet, opened by `?` or the sidebar keyboard button. The one copy, /diagrams/ imports it too.
// groups: [{ title, rows: [{ keys: [['Shift', '←'], ['Shift', '→']], desc }] }]
// `keys` is a list of alternatives, each one a combination pressed together.
import { escapeHtml as esc } from './chrome.js';
import { getLang, LANG_EVENT } from './lang.js';

const CLOSE_ICON = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>';

// `e.key` is what the layout typed (a Russian layout types "." for `/` and "а" for F), so a non-Latin
// result falls back to the physical key (`e.code`). A Latin one is trusted, so a Dvorak or AZERTY
// reader still presses the letter printed on the key.
export const isSlash = (e) => e.key === '/' || (e.code === 'Slash' && e.key === '.');
export const isQuestion = (e) => e.key === '?' || (e.code === 'Slash' && e.key === ',');
export const isLetter = (e, ch) => {
  const k = e.key || '';
  return k.toLowerCase() === ch || (!/^[a-z]$/i.test(k) && e.code === `Key${ch.toUpperCase()}`);
};


// The sheet follows the language switch. Keyed by the English of both apps' groups, so a new row
// missing here shows in English. Key names printed on the keyboard stay as they are.
const RU = {
  'Keyboard shortcuts': 'Сочетания клавиш',
  'Close': 'Закрыть',
  'Commands': 'Команды',
  'Catalog': 'Каталог',
  'Inside a card': 'Внутри карточки',
  'Focus search': 'Перейти к поиску',
  'Clear search': 'Очистить поиск',
  'Show this list': 'Показать этот список',
  'Open the focused card': 'Открыть карточку в фокусе',
  'Play or pause': 'Пуск или пауза',
  'Previous or next step': 'Предыдущий или следующий шаг',
  'Previous or next card': 'Предыдущая или следующая карточка',
  'Restart': 'Начать заново',
  'Replay the step': 'Повторить шаг',
  'Slower or faster': 'Медленнее или быстрее',
  'Loop on or off': 'Включить или выключить повтор',
  'Fullscreen': 'Полноэкранный режим',
  'Space': 'Пробел',
};
const t = (en) => (getLang() === 'ru' && RU[en]) || en;

function renderKeys(alts) {
  return alts
    .map(combo => combo.map(k => `<kbd>${esc(t(k))}</kbd>`).join('<span class="keys-plus">+</span>'))
    .join('<span class="keys-or">/</span>');
}

export function setupKeysHelp(groups) {
  let dlg = null;

  const build = () => {
    dlg = document.createElement('dialog');
    dlg.className = 'keys-dialog';
    dlg.setAttribute('aria-labelledby', 'keysTitle');
    if (getLang() === 'ru') dlg.lang = 'ru';
    dlg.innerHTML = `
      <div class="keys-inner">
        <header class="keys-head">
          <h2 id="keysTitle">${esc(t('Keyboard shortcuts'))}</h2>
          <button class="keys-close" type="button" aria-label="${esc(t('Close'))}">${CLOSE_ICON}</button>
        </header>
        ${groups.map(g => `
          <section class="keys-group">
            <h3>${esc(t(g.title))}</h3>
            <dl>${g.rows.map(r => `<div class="keys-row"><dt>${esc(t(r.desc))}</dt><dd>${renderKeys(r.keys)}</dd></div>`).join('')}</dl>
          </section>`).join('')}
      </div>`;
    dlg.querySelector('.keys-close').addEventListener('click', () => dlg.close());
    // The dialog box itself is the transparent area around .keys-inner, so a click that lands on
    // the dialog and not inside the panel is a click on the backdrop.
    dlg.addEventListener('click', (e) => { if (e.target === dlg) dlg.close(); });
    document.body.appendChild(dlg);
  };

  const open = () => {
    if (!dlg) build();
    if (!dlg.open) dlg.showModal();
  };
  const toggle = () => (dlg && dlg.open ? dlg.close() : open());
  // Built lazily, so a language switch only drops the old sheet and the next open builds it anew.
  window.addEventListener(LANG_EVENT, () => {
    if (dlg && !dlg.open) { dlg.remove(); dlg = null; }
  });

  document.getElementById('sideKeys')?.addEventListener('click', open);
  document.addEventListener('keydown', (e) => {
    if (!isQuestion(e) || e.ctrlKey || e.metaKey || e.altKey) return;
    if (/^(input|textarea|select)$/i.test(document.activeElement?.tagName || '')) return;
    e.preventDefault();
    toggle();
  });

  return { open, isOpen: () => !!(dlg && dlg.open) };
}
