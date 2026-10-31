// The card dialog: the player shell, its controls, flips between cards, fullscreen, the PNG and GIF saves
// and the keys inside a card. app.js owns the grid and the hash, and lends the five things the
// dialog needs from them through setupDialog(). Touches browser globals at module load, as app.js does.
import { DIAGRAMS, CATEGORY_LABEL, SUBCATEGORIES } from './data.js';
import { reducedMotion } from './lib/motion.js';
import { isLetter } from '../../cli/js/lib/keys.js';
import { escapeHtml } from '../../cli/js/lib/chrome.js';
import { isInspectActive } from './lib/inspect-mode.js';
import { getLang } from '../../cli/js/lib/lang.js';

// Phones get a stub instead of the catalog (css/styles.css, "MOBILE STUB", holds the same query).
// Here it only keeps a deep link or a hash change from opening a dialog behind that stub.
export const MOBILE_STUB = window.matchMedia('(hover: none) and (pointer: coarse) and (max-width: 600px), (hover: none) and (pointer: coarse) and (max-height: 500px)');

const SPEED_KEY = 'kube-how:diagram-speed:v1';
const LOOP_KEY  = 'kube-how:diagram-loop:v1';
const ALLOWED_SPEEDS = [0.5, 1, 1.5];
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

// - and + by the typed character, which every layout has (a German one types - on the Slash key).
// = is the unshifted + key, so 1.5x needs no Shift.
const speedStep = (e) => (e.key === '-' ? -1 : e.key === '+' || e.key === '=' ? 1 : 0);

// The speed in force, read from storage once: with storage blocked the session still remembers it.
let speed = getSavedSpeed();

// One speed for the player, its buttons and the next open, from a click or the - and + keys.
function applySpeed(r) {
  document.querySelectorAll('dialog.diagram-dialog .ctl-speed button').forEach(b => {
    const on = parseFloat(b.dataset.speed) === r;
    b.classList.toggle('active', on);
    b.setAttribute('aria-pressed', on ? 'true' : 'false');
  });
  speed = r;
  if (activeController) activeController.setSpeed(r);
  setSavedSpeed(r);
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

// The dialog chrome follows the language switch, and so do the narration and the diagram's aria
// sentence (lang/steps/<id>.js). The title and everything drawn stay English. Read at every open, as the header switch sits behind the modal while a card is shown.
const UI_RU = {
  'Step': 'Шаг',
  'Add to Starred': 'Добавить в избранное',
  'Remove from Starred': 'Убрать из избранного',
  'Star this card': 'Избранное',
  'Position in the current view': 'Позиция в текущем списке',
  'Report a problem with this card': 'Сообщить о проблеме в карточке',
  'Save as an image': 'Сохранить картинкой',
  'Step image': 'Картинка шага',
  'Whole animation': 'Вся анимация',
  'Fullscreen (F)': 'Полноэкранный режим (F)',
  'Exit fullscreen (F)': 'Выйти из полноэкранного режима (F)',
  'Fullscreen': 'Полноэкранный режим',
  'Exit fullscreen': 'Выйти из полноэкранного режима',
  'Close': 'Закрыть',
  'Restart': 'Начать заново',
  'Replay the step': 'Повторить шаг',
  'Steps': 'Шаги',
  'Previous step': 'Предыдущий шаг',
  'Next step': 'Следующий шаг',
  'Play': 'Пуск',
  'Pause': 'Пауза',
  'Loop': 'Повтор',
  'Speed': 'Скорость',
  'Previous': 'Предыдущая',
  'Next': 'Следующая',
  'Previous diagram': 'Предыдущая диаграмма',
  'Next diagram': 'Следующая диаграмма',
  'Go to step': 'Перейти к шагу',
  'Source': 'Источник',
  'Sources': 'Источники',
  'Reduced motion is on. Steps change without animation.': 'Включено уменьшение движения. Шаги меняются без анимации.',
  'This diagram did not load. Check the connection and try again.': 'Диаграмма не загрузилась. Проверьте соединение и попробуйте ещё раз.',
  'Try again': 'Попробовать ещё раз',
};
const t = (en) => (getLang() === 'ru' && UI_RU[en]) || en;
// A control whose label is Russian says so, or a screen reader voices it in English.
const markLang = (el) => (getLang() === 'ru' ? el.setAttribute('lang', 'ru') : el.removeAttribute('lang'));
const PORTRAIT_HINT = {
  en: 'Turn the screen sideways for a larger diagram, or <a class="portrait-hint-link" href="/diagrams/card/">read this card as a page</a>.',
  ru: 'Поверните экран, чтобы диаграмма стала крупнее, или <a class="portrait-hint-link" href="/diagrams/card/">откройте карточку как страницу</a>.',
};

const ICON = {
  play:    '<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M8 5v14l11-7z"/></svg>',
  pause:   '<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><rect x="6" y="5" width="4" height="14" rx="1"/><rect x="14" y="5" width="4" height="14" rx="1"/></svg>',
  prev:    '<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M6 6h2v12H6zM9 12l9-6v12z"/></svg>',
  next:    '<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M16 6h2v12h-2zM6 6v12l9-6z"/></svg>',
  restart: '<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M4 6h2v12H4zM7 12l6.5-6v12zM13.5 12l6.5-6v12z"/></svg>',
  replay:  '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"/></svg>',
  loop:    '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="17 1 21 5 17 9"/><path d="M3 11V9a4 4 0 0 1 4-4h14"/><polyline points="7 23 3 19 7 15"/><path d="M21 13v2a4 4 0 0 1-4 4H3"/></svg>',
  close:   '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>',
  star:    '<svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round" aria-hidden="true"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>',
  report:  '<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 22V4"/><path d="M4 4h13l-2 4.5L17 13H4"/></svg>',
  save:    '<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 3v12"/><polyline points="7 10 12 15 17 10"/><path d="M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2"/></svg>',
  expand:  '<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="15 3 21 3 21 9"/><polyline points="9 21 3 21 3 15"/><line x1="21" y1="3" x2="14" y2="10"/><line x1="3" y1="21" x2="10" y2="14"/></svg>',
  shrink:  '<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="4 14 10 14 10 20"/><polyline points="20 10 14 10 14 4"/><line x1="14" y1="10" x2="21" y2="3"/><line x1="3" y1="21" x2="10" y2="14"/></svg>',
};

// Read live by app.js (hash routing, the mobile stub), written only here.
export let activeController = null;
export let activeDialogDiagram = null;
let openSeq = 0;   // bumped by every open and close, so a module that resolves late knows it is stale
let activeFrameName = 'step-1';   // the saved PNG suffix, kept by the step-change callback: the step shown, or `poster`

// writeHash, diagramHash, gridHash, clearNew, toggleStar, isStarred, viewOrder, catalogOrder.
let host = null;
export function setupDialog(h) { host = h; }

// The dialog carries its own star for the card it shows, the same state as the star on the grid.
export function syncDialogStar() {
  const btn = document.querySelector('dialog.diagram-dialog .dialog-star');
  if (!btn || !activeDialogDiagram) return;
  const on = host.isStarred(activeDialogDiagram.id);
  btn.classList.toggle('starred', on);
  btn.setAttribute('aria-pressed', on);
  btn.title = t(on ? 'Remove from Starred' : 'Add to Starred');
  markLang(btn);
}

// A new GitHub issue with the card, the step and a link to that step already filled in, so a report
// arrives pointing at the exact frame it is about.
function reportUrl(diagram, stepLabel, stepIdx) {
  const link = `https://kube.how/diagrams/#diagram=${diagram.id}${stepIdx ? `&step=${stepIdx + 1}` : ''}`;
  const body = [
    `Card: ${diagram.title} (${diagram.id})`,
    stepLabel ? `Step: ${stepLabel}` : null,
    `Link: ${link}`,
    '',
    'What is wrong:',
    '',
  ].filter(l => l !== null).join('\n');
  return `${ISSUES_URL}?title=${encodeURIComponent(`[diagram] ${diagram.title}: `)}&body=${encodeURIComponent(body)}`;
}

function setReportLink(dialog, stepLabel = '', stepIdx = 0) {
  if (!activeDialogDiagram) return;
  dialog.querySelector('.dialog-report').href = reportUrl(activeDialogDiagram, stepLabel, stepIdx);
}

// Fullscreen goes on the PAGE, not on the dialog: Chrome refuses requestFullscreen() on a <dialog>.
// `dialog.is-fullscreen` stretches the panel, and a flip stays fullscreen because the dialog is reused.
function toggleFullscreen() {
  if (!document.querySelector('dialog.diagram-dialog') || !document.fullscreenEnabled) return;
  if (document.fullscreenElement) document.exitFullscreen().catch(() => {});
  else document.documentElement.requestFullscreen().catch(() => {});
}

function syncFullscreenBtn() {
  const dlg = document.querySelector('dialog.diagram-dialog');
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
  btn.title = t(on ? 'Exit fullscreen (F)' : 'Fullscreen (F)');
  btn.setAttribute('aria-label', t(on ? 'Exit fullscreen' : 'Fullscreen'));
  markLang(btn);
}
document.addEventListener('fullscreenchange', syncFullscreenBtn);

// In the starred view an unstar drops the card from the view the dialog flips through.
export function refreshDialogNav() {
  const dlg = document.querySelector('dialog.diagram-dialog');
  if (dlg && activeDialogDiagram) updateNavUi(dlg);
}

// Card modules are lazy-imported, never all in memory. A live controller is torn down first, or its
// animations land on the next canvas. An open dialog is REUSED for the next card (shell, backdrop and
// inspector stay), so a flip never flashes the page behind.
export async function openDiagram(id, initialStep = null, { dir = 0 } = {}) {
  const diagram = DIAGRAMS.find(s => s.id === id);
  if (!diagram || MOBILE_STUB.matches) return;
  const seq = ++openSeq;
  // A card lives at js/diagrams/<category>/<id>.js and its id starts with its category, so the path
  // is DERIVED rather than stored. R-modulepath holds both halves of that convention. The fetch starts
  // before the dialog is built, which is time the network can use.
  const modLoad = import(diagramModulePath(diagram) + retryTag(id));
  const ruLoad = loadSteps(diagram);
  let dialog = document.querySelector('dialog.diagram-dialog');
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
    // The panel takes the opening focus: left to itself, showModal focuses the first button, the
    // flip arrow, where Enter or Space would leave the card.
    dialog.querySelector('.dialog-inner').focus({ preventScroll: true });
    // The inspector is a dev tool, fetched only in inspect mode. The card waits for it below.
    if (isInspectActive()) {
      const dlg = dialog;
      dlg._inspectorLoad = import(`./lib/inspector.js${ASSET_V}`).then(({ attachInspector }) => {
        if (dlg.isConnected) dlg._inspectCleanup = attachInspector(dlg);
      });
    }
  }
  fillDialog(dialog, diagram);
  activeDialogDiagram = diagram;
  host.clearNew(id);
  updateNavUi(dialog);
  syncDialogStar();
  setReportLink(dialog);
  syncFullscreenBtn();
  host.writeHash(host.diagramHash(id, initialStep));

  let mod, ru;
  try {
    mod = await modLoad;
    ru = await ruLoad;
    await dialog._inspectorLoad;
  } catch (e) {
    console.error('Failed to load diagram:', e);
    noteFailure(id);
    if (seq === openSeq && dialog.isConnected) showLoadError(dialog, () => openDiagram(id, initialStep));
    return;
  }
  if (seq !== openSeq || !dialog.isConnected) return;
  setPlayerEnabled(dialog, true);
  const root = dialog.querySelector('.dialog-canvas');
  root.replaceChildren();
  const say = sayer(ru);
  // A reset rebuilds the svg with its English aria sentence, so the Russian one goes back on each step.
  const aria = mod.SCENE?.['aria-label'];
  const sayAria = () => { if (say(aria) !== aria) root.querySelector('svg.diagram')?.setAttribute('aria-label', say(aria)); };
  const ctrl = mod.init(root, {
    narrationOf: (step) => say(step.narration || ''),
    onStepChange: (idx, step, total, meta) => {
      sayAria();
      updateNarration(dialog, idx, step, total, meta, say);
      if (activeDialogDiagram && activeDialogDiagram.id === diagram.id) {
        host.writeHash(host.diagramHash(diagram.id, idx));
      }
    },
    onPlayingChange: (playing) => updatePlayBtn(dialog, playing),
  });
  activeController = ctrl;
  sayAria();
  // `window.__diagramCtl` is the ENTIRE contract with the test harness (`gotoStep`, `total`,
  // `_timeline`). Renaming anything on it breaks the whole suite at once, as a TIMEOUT, not an error.
  if (isInspectActive()) {
    window.__diagramCtl = ctrl;
    window.__diagramId = diagram.id;
  }
  if (dir) slideIn(root, dir);

  ctrl.setSpeed(speed);
  ctrl.setLoop(getSavedLoop());

  if (initialStep != null) {
    ctrl.gotoStep(initialStep);
  } else {
    ctrl.gotoStep(0);
    if (!reducedMotion()) {
      // A cancellable dwell, stopped by any manual interaction or by closing the dialog.
      ctrl.autoPlay(ctrl.posterFirst ? 700 : 500);
    }
  }
  prefetchNeighbours();
}

// The deploy stamps every module URL with `?v=<sha>` (tools/deploy/version.mjs). A computed path is
// the one import it cannot rewrite, so it carries this module's own stamp: empty in development.
const ASSET_V = new URL(import.meta.url).search;

// The diagram as it stands, step and all, as a PNG for slides. The exporter loads on the first click.
async function saveFrame() {
  const dlg = document.querySelector('dialog.diagram-dialog');
  const svg = dlg && dlg.querySelector('.dialog-canvas svg.diagram');
  if (!svg || !activeDialogDiagram) return;
  try {
    const { savePng } = await import(`./lib/export.js${ASSET_V}`);
    await savePng(svg, {
      background: getComputedStyle(dlg.querySelector('.dialog-canvas')).backgroundColor,
      name: `${activeDialogDiagram.id}-${activeFrameName}`,
    });
  } catch (e) {
    console.error('Save frame:', e);
  }
}

// Every step played through as a GIF, recorded on a second, hidden copy of the card so the one on
// screen keeps its step. The save button shows the progress, and a flip or a close stops the recording.
async function saveAnimation() {
  const dlg = document.querySelector('dialog.diagram-dialog');
  const diagram = activeDialogDiagram;
  const btn = dlg && dlg.querySelector('.dialog-save');
  if (!diagram || !btn || btn.getAttribute('aria-busy') === 'true') return;
  btn.setAttribute('aria-busy', 'true');
  btn.textContent = '0%';
  const root = document.createElement('div');
  root.className = 'dialog-canvas gif-canvas';
  root.setAttribute('aria-hidden', 'true');
  root.inert = true;
  dlg.querySelector('.dialog-stage').appendChild(root);
  let ctrl = null;
  try {
    const [mod, { saveGif }, ru] = await Promise.all([
      import(diagramModulePath(diagram) + retryTag(diagram.id)),
      import(`./lib/export.js${ASSET_V}`),
      loadSteps(diagram),
    ]);
    // The Russian narration holds a step longer or shorter than the English, as in the dialog.
    const say = sayer(ru);
    ctrl = mod.init(root, { narrationOf: (step) => say(step.narration || '') });
    await saveGif(ctrl._timeline, root, {
      background: getComputedStyle(dlg.querySelector('.dialog-canvas')).backgroundColor,
      name: diagram.id,
      onProgress: (p) => { btn.textContent = `${Math.min(99, Math.floor(p * 100))}%`; },
      cancelled: () => activeDialogDiagram !== diagram || !dlg.isConnected,
    });
  } catch (e) {
    console.error('Save GIF:', e);
  } finally {
    if (ctrl) { try { ctrl.destroy(); } catch (_) {} }
    root.remove();
    btn.removeAttribute('aria-busy');
    btn.innerHTML = ICON.save;
  }
}

// One save button, a disclosure like the header's Contacts and Sponsor: the step on screen as a PNG,
// or every step as a GIF. Esc closes it without closing the dialog, and so does focus leaving it.
function setupSaveMenu(dlg) {
  const wrap = dlg.querySelector('.save-wrap');
  const btn = wrap.querySelector('.dialog-save');
  const menu = wrap.querySelector('.save-menu');
  const setOpen = (open) => {
    menu.hidden = !open;
    btn.setAttribute('aria-expanded', open ? 'true' : 'false');
  };
  btn.addEventListener('click', () => {
    if (btn.getAttribute('aria-busy') === 'true') return;
    setOpen(menu.hidden);
  });
  menu.addEventListener('click', (e) => {
    const opt = e.target.closest('.save-opt');
    if (!opt) return;
    setOpen(false);
    btn.focus();
    if (opt.dataset.save === 'gif') saveAnimation();
    else saveFrame();
  });
  wrap.addEventListener('keydown', (e) => {
    if (e.key !== 'Escape' || menu.hidden) return;
    e.preventDefault();
    e.stopPropagation();
    setOpen(false);
    btn.focus();
  });
  wrap.addEventListener('focusout', (e) => {
    if (e.relatedTarget && !wrap.contains(e.relatedTarget)) setOpen(false);
  });
  dlg.addEventListener('click', (e) => { if (!wrap.contains(e.target)) setOpen(false); });
}

function diagramModulePath(diagram) {
  return `./diagrams/${diagram.category}/${diagram.id}.js${ASSET_V}`;
}

// Firefox and Safari keep a failed module fetch in the module map, so importing the same URL again
// rejects without a request. After a failure the card is asked for under a URL of its own.
const loadFailures = new Map();
const noteFailure = (id) => loadFailures.set(id, (loadFailures.get(id) || 0) + 1);
function retryTag(id) {
  const n = loadFailures.get(id);
  return n ? `${ASSET_V ? '&' : '?'}retry=${n}` : '';
}

// A card's Russian narration, fetched beside its module only while Russian is on. A missing file
// leaves the card in English.
function loadSteps(diagram) {
  if (getLang() !== 'ru') return Promise.resolve(null);
  return import(`./lang/steps/${diagram.id}.js${ASSET_V}`).then(m => m.RU, () => null);
}

// Russian keyed by the English text, so a sentence changed since its translation shows in English.
const sayer = (ru) => (en) => (ru && en && ru[en]) || en;

function teardownController() {
  if (activeController) {
    try { activeController.destroy(); } catch (_) {}
    activeController = null;
  }
  if (window.__diagramCtl) { try { delete window.__diagramCtl; } catch (_) { window.__diagramCtl = null; } }
}

// Flipping between cards
// A flip stays inside the grid view the reader came from. A card opened from outside it flips
// through the whole catalog, so the arrows never strand it. Both ends wrap.
function navList() {
  const view = host.viewOrder();
  if (activeDialogDiagram && view.some(s => s.id === activeDialogDiagram.id)) return view;
  return host.catalogOrder();
}

function neighbour(list, dir) {
  const i = list.findIndex(s => s.id === activeDialogDiagram.id);
  return list[(i + dir + list.length) % list.length];
}

function navigateDiagram(dir) {
  if (!activeDialogDiagram) return;
  const list = navList();
  if (list.length < 2) return;
  pressNavBtn(dir);
  openDiagram(neighbour(list, dir).id, null, { dir });
}

function updateNavUi(dialog) {
  const list = navList();
  const i = list.findIndex(s => s.id === activeDialogDiagram.id);
  const pos = dialog.querySelector('.dialog-pos');
  pos.textContent = `${i + 1} / ${list.length}`;
  const multi = list.length > 1;
  dialog.querySelectorAll('.dialog-nav').forEach(btn => {
    btn.hidden = !multi;
    if (!multi) return;
    const dir = Number(btn.dataset.nav);
    const name = dir < 0 ? 'Previous' : 'Next';
    const title = neighbour(list, dir).title;
    btn.title = `${t(name)}: ${title} (Shift+${dir < 0 ? '←' : '→'})`;
    btn.setAttribute('aria-label', `${t(`${name} diagram`)}: ${title}`);
    markLang(btn);
  });
}

// A keyboard flip lights the arrow it stands for, so the reader sees which way the catalog moved.
function pressNavBtn(dir) {
  const btn = document.querySelector(`dialog.diagram-dialog .dialog-nav[data-nav="${dir}"]`);
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
    if (!activeDialogDiagram) return;
    for (const dir of [1, -1]) prefetch(neighbour(list, dir));
  });
}

// A grid card is fetched on hover, focus or press, so the click that follows finds it in the module
// map. Once per card: a failed fetch is retried by the open itself, under a new URL (retryTag).
const prefetched = new Set();
export function prefetchDiagram(id) {
  if (prefetched.has(id) || MOBILE_STUB.matches) return;
  const diagram = DIAGRAMS.find(s => s.id === id);
  if (!diagram) return;
  prefetched.add(id);
  prefetch(diagram);
}

function prefetch(diagram) {
  const id = diagram.id;
  import(diagramModulePath(diagram) + retryTag(id)).catch(() => noteFailure(id));
  loadSteps(diagram);
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
    navigateDiagram(dx < 0 ? 1 : -1);
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
  dlg.className = 'diagram-dialog';
  dlg.setAttribute('aria-labelledby', 'dialogTitle');
  const initialLoop  = getSavedLoop();
  const speedActive = (v) => speed === v ? ' class="active" aria-pressed="true"' : ' aria-pressed="false"';
  dlg.innerHTML = `
    <button class="dialog-nav dialog-nav-prev" data-nav="-1" type="button">${NAV_ICON.prev}</button>
    <div class="dialog-inner" tabindex="-1">
      <header class="dialog-header">
        <h2 id="dialogTitle" class="dialog-title"></h2>
        <div class="dialog-meta">
          <span class="card-cat"></span>
          <span class="dialog-section"></span>
        </div>
        <span class="dialog-pos" title="Position in the current view"></span>
        <button class="dialog-tool dialog-star" type="button" aria-label="Star this card" aria-pressed="false">${ICON.star}</button>
        <a class="dialog-tool dialog-report" href="${ISSUES_URL}" target="_blank" rel="noopener" title="Report a problem with this card" aria-label="Report a problem with this card">${ICON.report}</a>
        <div class="save-wrap">
          <button class="dialog-tool dialog-save" type="button" title="Save as an image" aria-label="Save as an image" aria-expanded="false" aria-controls="saveMenu">${ICON.save}</button>
          <div class="save-menu" id="saveMenu" hidden>
            <button class="save-opt" type="button" data-save="png"><span class="save-opt-label">Step image</span><span class="save-opt-fmt">PNG</span></button>
            <button class="save-opt" type="button" data-save="gif"><span class="save-opt-label">Whole animation</span><span class="save-opt-fmt">GIF</span></button>
          </div>
        </div>
        <button class="dialog-tool dialog-full" type="button" title="Fullscreen (F)" aria-label="Fullscreen"${document.fullscreenEnabled ? '' : ' hidden'}>${ICON.expand}</button>
        <button class="dialog-close" aria-label="Close">${ICON.close}</button>
      </header>
      <div class="dialog-body">
        <div class="dialog-stage">
          <div class="dialog-canvas"></div>
          <aside class="narration-overlay is-poster" aria-live="polite">
            <div class="narration-step"></div>
            <div class="narration-text"></div>
          </aside>
          <p class="portrait-hint">${PORTRAIT_HINT.en}</p>
        </div>
        <div class="reduced-notice">Reduced motion is on. Steps change without animation.</div>
        <div class="dialog-progress" aria-hidden="true"><div class="dialog-progress-fill"></div></div>
        <div class="dialog-step-dots" role="group" aria-label="Steps"></div>
      </div>
      <div class="dialog-controls">
        <button class="ctl-btn" data-act="restart" aria-label="Restart">${ICON.restart}</button>
        <button class="ctl-btn" data-act="prev"    aria-label="Previous step">${ICON.prev}</button>
        <button class="ctl-btn primary" data-act="play" aria-label="Play / Pause">${ICON.play}</button>
        <button class="ctl-btn" data-act="next"    aria-label="Next step">${ICON.next}</button>
        <button class="ctl-btn" data-act="replay"  aria-label="Replay the step">${ICON.replay}</button>
        <button class="ctl-btn" data-act="loop"    aria-label="Loop" aria-pressed="${initialLoop ? 'true' : 'false'}">${ICON.loop}</button>
        <div class="ctl-speed" role="group" aria-label="Speed">
          <button data-speed="0.5"${speedActive(0.5)}>0.5×</button>
          <button data-speed="1"${speedActive(1)}>1×</button>
          <button data-speed="1.5"${speedActive(1.5)}>1.5×</button>
        </div>
        <span class="ctl-spacer"></span>
        <span class="ctl-source"></span>
      </div>
    </div>
    <button class="dialog-nav dialog-nav-next" data-nav="1" type="button">${NAV_ICON.next}</button>
  `;

  dlg.querySelector('.dialog-close').addEventListener('click', () => closeDialog());
  dlg.querySelector('.dialog-star').addEventListener('click', () => {
    if (activeDialogDiagram) host.toggleStar(activeDialogDiagram.id);
  });
  dlg.querySelector('.dialog-full').addEventListener('click', toggleFullscreen);
  setupSaveMenu(dlg);
  dlg.addEventListener('cancel', (e) => { e.preventDefault(); closeDialog(); });
  dlg.querySelectorAll('.dialog-nav').forEach(btn => {
    btn.addEventListener('click', () => navigateDiagram(Number(btn.dataset.nav)));
  });
  setupSwipe(dlg);

  dlg.querySelectorAll('.ctl-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      if (!activeController) return;
      const act = btn.dataset.act;
      if (act === 'play') {
        if (activeController.isPlaying()) activeController.pause();
        else activeController.play();
      } else if (act === 'prev') {
        activeController.step('prev');
      } else if (act === 'next') {
        activeController.step('next');
      } else if (act === 'replay') {
        activeController.replay();
      } else if (act === 'restart') {
        activeController.restart();
      } else if (act === 'loop') {
        const next = !activeController.isLooping();
        activeController.setLoop(next);
        btn.setAttribute('aria-pressed', next ? 'true' : 'false');
        setSavedLoop(next);
      }
    });
  });
  dlg.querySelectorAll('.ctl-speed button').forEach(btn => {
    btn.addEventListener('click', () => applySpeed(parseFloat(btn.dataset.speed)));
  });
  return dlg;
}

// The shell's fixed labels in the language of this open. The play button and the dots are written
// by the step-change callback, the star title by syncDialogStar.
function localizeShell(dlg) {
  const ru = getLang() === 'ru';
  const set = (sel, attrs) => {
    const el = dlg.querySelector(sel);
    for (const [a, en] of Object.entries(attrs)) el.setAttribute(a, t(en));
    markLang(el);
  };
  set('.dialog-pos', { title: 'Position in the current view' });
  set('.dialog-star', { 'aria-label': 'Star this card' });
  set('.dialog-report', { title: 'Report a problem with this card', 'aria-label': 'Report a problem with this card' });
  set('.dialog-save', { title: 'Save as an image', 'aria-label': 'Save as an image' });
  for (const opt of dlg.querySelectorAll('.save-opt-label')) {
    opt.textContent = t(opt.dataset.en || (opt.dataset.en = opt.textContent));
    markLang(opt);
  }
  set('.dialog-close', { 'aria-label': 'Close' });
  set('[data-act="restart"]', { 'aria-label': 'Restart' });
  set('[data-act="prev"]', { 'aria-label': 'Previous step' });
  set('[data-act="next"]', { 'aria-label': 'Next step' });
  set('[data-act="replay"]', { 'aria-label': 'Replay the step' });
  set('.dialog-step-dots', { 'aria-label': 'Steps' });
  set('[data-act="loop"]', { 'aria-label': 'Loop' });
  set('.ctl-speed', { 'aria-label': 'Speed' });
  const hint = dlg.querySelector('.portrait-hint');
  hint.innerHTML = ru ? PORTRAIT_HINT.ru : PORTRAIT_HINT.en;
  const notice = dlg.querySelector('.reduced-notice');
  notice.textContent = t('Reduced motion is on. Steps change without animation.');
  for (const el of [hint, notice]) ru ? el.setAttribute('lang', 'ru') : el.removeAttribute('lang');
  const full = !!document.fullscreenElement;
  set('.dialog-full', { title: full ? 'Exit fullscreen (F)' : 'Fullscreen (F)', 'aria-label': full ? 'Exit fullscreen' : 'Fullscreen' });
}

// Everything that belongs to ONE card, written on open and again on every flip, so a field left
// out here would carry the previous card's value into the next.
function fillDialog(dlg, diagram) {
  dlg.setAttribute('data-cat', diagram.category);
  dlg.setAttribute('data-diagram', diagram.id);
  if (diagram.tinted) dlg.setAttribute('data-tinted', 'true');
  else dlg.removeAttribute('data-tinted');
  localizeShell(dlg);
  dlg.querySelector('.dialog-title').textContent = diagram.title;
  dlg.querySelector('.portrait-hint-link').href = `/diagrams/card/${diagram.id}/`;
  dlg.querySelector('.dialog-meta .card-cat').textContent = CATEGORY_LABEL[diagram.category] || diagram.category;
  const sub = (SUBCATEGORIES[diagram.category] || []).find(sc => sc.key === diagram.subcategory);
  const section = dlg.querySelector('.dialog-section');
  section.textContent = sub ? sub.label : '';
  section.hidden = !sub;
  // Every source, not just the first.
  const srcs = diagram.sources || [];
  const source = dlg.querySelector('.ctl-source');
  source.innerHTML = srcs.length
    ? `${t(srcs.length > 1 ? 'Sources' : 'Source')}: ` +
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

function updateNarration(dialog, idx, step, total, meta, say) {
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
  const narration   = onPoster ? ((meta && meta.posterText) || '') : (step ? say(step.narration || '') : '');

  if (overlay) overlay.classList.remove('is-poster');  // the text is always present
  if (!step && !onPoster) {
    stepEl.textContent = '';
    textEl.textContent = '';
  } else {
    stepEl.textContent = `${t('Step')} ${displayStep}${displayTot ? ' / ' + displayTot : ''}`;
    textEl.textContent = narration;
    // The label is translated by the switch, the narration only where its Russian line exists.
    markLang(stepEl);
    /[а-яё]/i.test(narration) ? textEl.setAttribute('lang', 'ru') : textEl.removeAttribute('lang');
  }

  activeFrameName = onPoster ? 'poster' : `step-${displayStep}`;
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
        html += `<button class="step-dot" data-step="${target}" aria-label="${t('Go to step')} ${i + 1}"></button>`;
      }
      dotsWrap.innerHTML = html;
      dotsWrap.querySelectorAll('.step-dot').forEach(dot => {
        dot.addEventListener('click', () => {
          const t = parseInt(dot.dataset.step, 10);
          if (activeController) activeController.playStep(t);
        });
      });
    }
    dotsWrap.querySelectorAll('.step-dot').forEach((dot, i) => {
      dot.classList.toggle('active', i === activeDot);
      if (i === activeDot && !onPoster) dot.setAttribute('aria-current', 'step');
      else dot.removeAttribute('aria-current');
      dot.classList.toggle('passed', i < activeDot);
      dot.setAttribute('aria-label', `${t('Go to step')} ${i + 1}`);
      markLang(dot);
    });
  }
}

function updatePlayBtn(dialog, playing) {
  const btn = dialog.querySelector('[data-act="play"]');
  btn.innerHTML = playing ? ICON.pause : ICON.play;
  btn.setAttribute('aria-label', t(playing ? 'Pause' : 'Play'));
  markLang(btn);
}

// The player controls have nothing to drive while a card failed to load.
function setPlayerEnabled(dialog, on) {
  dialog.querySelectorAll('.ctl-btn, .ctl-speed button, .dialog-save').forEach(b => { b.disabled = !on; });
}

function showLoadError(dialog, retry) {
  setPlayerEnabled(dialog, false);
  const overlay = dialog.querySelector('.narration-overlay');
  if (overlay) overlay.classList.remove('is-poster');
  const text = dialog.querySelector('.narration-text');
  text.textContent = t('This diagram did not load. Check the connection and try again.');
  const btn = document.createElement('button');
  btn.type = 'button';
  btn.className = 'ctl-btn primary load-retry';
  btn.textContent = t('Try again');
  btn.addEventListener('click', retry);
  text.append(btn);
  markLang(text);
  btn.focus({ preventScroll: true });
}

export function closeDialog({ updateHash = true } = {}) {
  const dlg = document.querySelector('dialog.diagram-dialog');
  const shownId = activeDialogDiagram?.id;
  openSeq++;
  teardownController();
  activeDialogDiagram = null;
  if (dlg) {
    if (document.fullscreenElement) document.exitFullscreen().catch(() => {});
    if (typeof dlg._inspectCleanup === 'function') {
      try { dlg._inspectCleanup(); } catch (_) {}
    }
    if (typeof dlg.close === 'function') {
      try { dlg.close(); } catch (_) {}
    }
    dlg.remove();
    // close() hands focus back to whatever had it before the dialog. A deep link had nothing there,
    // so focus would drop to the body: it goes to the card that was showing instead.
    const card = shownId && document.querySelector(`.card[data-id="${shownId}"] .card-link`);
    if (card && (!document.activeElement || document.activeElement === document.body)) card.focus({ preventScroll: true });
  }
  if (updateHash) host.writeHash(host.gridHash());
}

export function setupDialogKeys(sheetOpen) {
  document.addEventListener('keydown', (e) => {
    if (e.target && /^(input|textarea|select)$/i.test(e.target.tagName)) return;
    if (sheetOpen()) return;
    if (activeDialogDiagram && isLetter(e, 'f') && !e.ctrlKey && !e.metaKey && !e.altKey) {
      e.preventDefault();
      toggleFullscreen();
      return;
    }
    // Shift+arrows flip to the neighbouring card, plain arrows step inside this one. A flip is
    // keyed off the open card rather than its controller, so presses landing while the next module
    // is still loading are not dropped.
    if (activeDialogDiagram && e.shiftKey && (e.key === 'ArrowLeft' || e.key === 'ArrowRight')) {
      e.preventDefault();
      navigateDiagram(e.key === 'ArrowLeft' ? -1 : 1);
      return;
    }
    if (!activeController) return;
    if (e.key === ' ' || e.code === 'Space') {
      // A focused control keeps its Space, which presses it. Only the play button and the panel
      // itself hand Space to play and pause.
      const ctl = e.target.closest && e.target.closest('button, a');
      if (ctl && !ctl.matches('[data-act="play"]')) return;
      e.preventDefault();
      if (activeController.isPlaying()) activeController.pause();
      else activeController.play();
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      activeController.step('prev');
    } else if (e.key === 'ArrowRight') {
      e.preventDefault();
      activeController.step('next');
    } else if (isLetter(e, 'r') && !e.ctrlKey && !e.metaKey && !e.altKey) {
      e.preventDefault();
      if (e.shiftKey) activeController.restart();
      else activeController.replay();
    } else if (speedStep(e) && !e.ctrlKey && !e.metaKey && !e.altKey) {
      e.preventDefault();
      const i = ALLOWED_SPEEDS.indexOf(speed) + speedStep(e);
      if (i >= 0 && i < ALLOWED_SPEEDS.length) applySpeed(ALLOWED_SPEEDS[i]);
    } else if (isLetter(e, 'l') && !e.ctrlKey && !e.metaKey && !e.altKey) {
      e.preventDefault();
      const next = !activeController.isLooping();
      activeController.setLoop(next);
      const btn = document.querySelector('dialog.diagram-dialog .ctl-btn[data-act="loop"]');
      if (btn) btn.setAttribute('aria-pressed', next ? 'true' : 'false');
      setSavedLoop(next);
    }
  });
}
