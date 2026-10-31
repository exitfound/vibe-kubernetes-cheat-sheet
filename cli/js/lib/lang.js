// The site language, English unless picked Russian with the header switch: the /cli/ descriptions,
// the hub texts, sidebar, footer, header menus and shortcuts sheet. Commands, kinds and app controls
// stay English. Stored per browser, a change is announced as a `kube-how:lang` event on window.

const LANG_KEY = 'kube-how:lang:v1';
export const LANG_EVENT = 'kube-how:lang';

export function getLang() {
  try { return localStorage.getItem(LANG_KEY) === 'ru' ? 'ru' : 'en'; } catch (_) { return 'en'; }
}

export function setLang(lang) {
  try {
    if (lang === 'ru') localStorage.setItem(LANG_KEY, 'ru');
    else localStorage.removeItem(LANG_KEY);
  } catch (_) {}
  if (lang === 'ru') loadCyrillicFont();
  window.dispatchEvent(new CustomEvent(LANG_EVENT, { detail: lang }));
}

// Space Grotesk has no Cyrillic, so Russian text takes Onest, a grotesque of the same build. Its
// stylesheet loads only once Russian is on, and Latin glyphs still come from Space Grotesk.
export const CYRILLIC_CSS = 'https://fonts.googleapis.com/css2?family=Onest:wght@400;500;600;700&display=swap';
export function loadCyrillicFont() {
  if (document.querySelector(`link[href="${CYRILLIC_CSS}"]`)) return;
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = CYRILLIC_CSS;
  document.head.append(link);
}
// No load at import: the four pages with a header ask for it in their first-paint snippet, and the
// English static pages that import chrome.js for copyText never need it.

// The "N new" pill of the hub and both apps, one wording in both languages. `cls` is the page's class.
export function newPill(n, cls, lang = getLang()) {
  if (!n) return '';
  const ru = lang === 'ru';
  const title = ru ? 'Новое с вашего прошлого визита' : 'New since your last visit';
  return `<span class="${cls}"${ru ? ' lang="ru"' : ''} title="${title}">${counted(n, ['new', 'new', 'новая', 'новые', 'новых'], lang)}</span>`;
}

// A count with its noun: `forms` is the English singular and plural, then the three Russian forms.
const ruPlural = new Intl.PluralRules('ru');
export function counted(n, [one, many, ...ru], lang = getLang()) {
  return lang === 'ru'
    ? `${n} ${ru[{ one: 0, few: 1 }[ruPlural.select(n)] ?? 2]}`
    : `${n} ${n === 1 ? one : many}`;
}
