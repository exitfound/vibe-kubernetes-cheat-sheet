// D-16, the hash contract in a real browser: section, search, card, step, and the scroll offset each
// leaves behind. Section, card and query are derived from the catalog. Scroll axes run with motion on
// (reduced motion disables smooth scroll), card axes reduced (no auto-play moving the step).

// Setup scrolls are instant and verified, and scroll is read immediately after the write, never after a
// settle: either mistake passes on the exact defect being watched.

import { test, after } from 'node:test';
import assert from 'node:assert/strict';
import { schemes, subcategories } from '../fixtures/catalog.mjs';
import { DEFAULT_BASE, launch, SELECTOR_TIMEOUT_MS } from '../fixtures/render.mjs';

const SCHEME = `${DEFAULT_BASE}/scheme/`;
const CARDS = await schemes();
const SUBS = await subcategories();

const CAT = Object.keys(SUBS).find(k => (SUBS[k] || []).length);
assert.ok(CAT, 'no category declares a subcategory: there is no section for D-16 to hold');
const SUB = SUBS[CAT][0].key;
const SECTION = CARDS.filter(c => c.category === CAT && c.subcategory === SUB);
assert.ok(SECTION.length > 0, `${CAT}/${SUB} is declared and empty: nothing to filter to`);
const CARD = SECTION[0];

// A term the section really matches, so the grid narrows instead of emptying.
const QUERY = CARD.title.split(' ')[0].toLowerCase();
// `&` and `#` would break a raw `q=`.
const ODD_QUERY = 'a&b#c';

const browser = await launch();
after(() => browser.close());

const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const page = await context.newPage();

const stillContext = await browser.newContext({ viewport: { width: 1440, height: 900 }, reducedMotion: 'reduce' });
const still = await stillContext.newPage();

const state = (p) => p.evaluate(() => ({
  hash: location.hash,
  y: Math.round(window.scrollY),
  cat: document.querySelector('.cat-btn.active')?.dataset.cat || null,
  sub: document.querySelector('.subcat-btn.active')?.dataset.sub || null,
  q: document.getElementById('searchInput')?.value ?? null,
  cards: document.querySelectorAll('article.card').length,
  dialog: !!document.querySelector('dialog.scheme-dialog'),
}));

// Prove the page got there, or the reset axes are vacuous.
async function scrollDown(p, top) {
  await p.evaluate((y) => window.scrollTo({ top: y, behavior: 'instant' }), top);
  const at = await p.evaluate(() => Math.round(window.scrollY));
  assert.ok(at > 200,
    `the setup scroll left the page at y=${at}: this axis would then assert that a reset moved a ` +
    'page which was already at the top, and pass on any build');
  return at;
}

async function openGrid(p, hash = '') {
  await p.goto(`${SCHEME}${hash}`, { waitUntil: 'domcontentloaded' });
  await p.waitForSelector('article.card', { timeout: SELECTOR_TIMEOUT_MS });
}

// Two clicks from the bottom of a long grid, as a reader does it.
async function selectSection(p) {
  await p.click(`.cat-btn[data-cat="${CAT}"]`);
  await scrollDown(p, 3000);
  await p.click(`.subcat-btn[data-sub="${SUB}"]`);
}

test(`D-16 a section click writes #at= and lands at the top (${CAT}/${SUB})`, async (t) => {
  await openGrid(page);
  await selectSection(page);
  const s = await state(page);           // read on the click, NOT after a settle
  t.diagnostic(`section ${CAT}/${SUB}: ${SECTION.length} card(s), hash ${s.hash}`);
  assert.equal(s.hash, `#at=${SUB}`, 'the section is not in the URL: a reload would lose it');
  assert.equal(s.sub, SUB, 'the sub-nav does not show the section it filtered to');
  assert.equal(s.cards, SECTION.length, 'the grid holds cards the section does not');
  assert.equal(s.y, 0,
    `scrollY is ${s.y} on the click. Either the reset is gone, or it asks for behavior: 'auto', ` +
    "which DEFERS to scroll-behavior: smooth rather than overruling it. Only 'instant' does.");
});

test('D-16 a reload keeps the section and lands at the top', async () => {
  await openGrid(page, `#at=${SUB}`);
  await scrollDown(page, 900);
  await page.reload({ waitUntil: 'domcontentloaded' });
  await page.waitForSelector('article.card', { timeout: SELECTOR_TIMEOUT_MS });
  const s = await state(page);
  assert.equal(s.hash, `#at=${SUB}`, 'the hash did not survive the reload');
  assert.equal(s.sub, SUB, 'the section came back in the URL and not in the nav');
  assert.equal(s.cards, SECTION.length, 'the reload rebuilt a different grid');
  assert.equal(s.y, 0,
    `scrollY is ${s.y} after the reload: history.scrollRestoration is restoring an offset measured ` +
    'against the unfiltered grid, which is a different document height');
});

test('D-16 a search writes q=, resets the scroll, and comes back on a reload', async () => {
  await openGrid(page, `#at=${SUB}`);
  await scrollDown(page, 600);
  await page.fill('#searchInput', QUERY);
  await page.waitForFunction(() => location.hash.includes('q='), null, { timeout: SELECTOR_TIMEOUT_MS });
  const typed = await state(page);
  assert.equal(typed.hash, `#at=${SUB}&q=${encodeURIComponent(QUERY)}`,
    'the search is not in the URL beside the section');
  assert.equal(typed.y, 0, `scrollY is ${typed.y} after a search: the result was not scrolled to`);
  assert.ok(typed.cards > 0 && typed.cards <= SECTION.length,
    `the search matched ${typed.cards} of ${SECTION.length}: it filtered nothing or emptied the grid`);

  await page.reload({ waitUntil: 'domcontentloaded' });
  await page.waitForSelector('article.card', { timeout: SELECTOR_TIMEOUT_MS });
  const back = await state(page);
  assert.equal(back.hash, typed.hash, 'the search did not survive the reload');
  assert.equal(back.q, QUERY,
    'the query came back in the URL and not in the search box: the grid is now filtered by ' +
    'something the reader can neither see nor clear');
  assert.equal(back.cards, typed.cards, 'the restored search matched a different set');
});

test('D-16 a query carrying & and # survives the round trip', async () => {
  await openGrid(page);
  await page.fill('#searchInput', ODD_QUERY);
  await page.waitForFunction(() => location.hash.includes('q='), null, { timeout: SELECTOR_TIMEOUT_MS });
  const raw = await page.evaluate(() => location.hash);
  assert.equal(raw, `#q=${encodeURIComponent(ODD_QUERY)}`,
    'the query is written raw: an & reads back as a second parameter and a # ends the fragment');
  await page.reload({ waitUntil: 'domcontentloaded' });
  await page.waitForSelector('.search-input', { timeout: SELECTOR_TIMEOUT_MS });
  assert.equal((await state(page)).q, ODD_QUERY, 'the decoded query is not what was typed');
});

test('D-16 a bare key still reads and is rewritten to the named form', async () => {
  // The bare form /cli/ writes.
  await openGrid(page, `#${SUB}`);
  const s = await state(page);
  assert.equal(s.sub, SUB, 'a bare section key no longer resolves: every older link is dead');
  assert.equal(s.hash, `#at=${SUB}`, 'the bare key was not normalised to the named form');
});

test('D-16 a hash naming neither a card nor a section is cleaned out of the URL', async () => {
  await openGrid(page, '#not-a-section-key');
  const s = await state(page);
  assert.equal(s.hash, '', 'an unreadable hash is left in the URL, looking like state');
  assert.equal(s.cat, 'all', 'an unreadable hash filtered the grid to something');
});

test('D-16 an open card carries the grid state, and closing it lands back on that grid', async () => {
  await openGrid(page, `#at=${SUB}&q=${encodeURIComponent(QUERY)}`);
  const grid = (await state(page)).hash;
  await page.click('article.card');
  await page.waitForSelector('dialog.scheme-dialog', { timeout: SELECTOR_TIMEOUT_MS });
  await page.waitForFunction(() => location.hash.startsWith('#scheme='), null, { timeout: SELECTOR_TIMEOUT_MS });
  const open = await page.evaluate(() => location.hash);
  assert.ok(open.includes(`&at=${SUB}`), `the open card dropped the section: ${open}`);
  assert.ok(open.includes(`&q=${encodeURIComponent(QUERY)}`), `the open card dropped the search: ${open}`);

  await page.keyboard.press('Escape');
  await page.waitForFunction(() => !document.querySelector('dialog.scheme-dialog'), null, { timeout: SELECTOR_TIMEOUT_MS });
  const closed = await state(page);
  assert.equal(closed.hash, grid, 'closing the card did not land back on the grid it was opened from');
  assert.equal(closed.sub, SUB, 'the grid behind the card was not holding the section');
});

// Read off the narration: a two-step card cannot demonstrate a restart.
async function openCardAt(hash) {
  await still.goto(`${SCHEME}${hash}`, { waitUntil: 'domcontentloaded' });
  await still.waitForSelector('dialog.scheme-dialog .narration-step', { timeout: SELECTOR_TIMEOUT_MS });
  await still.waitForFunction(() => /\d+\s*\/\s*\d+/.test(document.querySelector('.narration-step')?.textContent || ''),
    null, { timeout: SELECTOR_TIMEOUT_MS });
  return still.evaluate(() => ({
    hash: location.hash,
    label: document.querySelector('.narration-step').textContent.trim(),
  }));
}

test(`D-16 a link into a step opens on that step (${CARD.id})`, async (t) => {
  const first = await openCardAt(`#scheme=${CARD.id}`);
  const total = Number(/\/\s*(\d+)/.exec(first.label)[1]);
  t.diagnostic(`${CARD.id}: ${total} step(s), opened at "${first.label}"`);
  assert.ok(total >= 2, `${CARD.id} has ${total} step(s): too few to tell a restart from a resume`);

  const target = Math.min(3, total);
  const at = await openCardAt(`#scheme=${CARD.id}&step=${target}`);
  assert.equal(at.hash, `#scheme=${CARD.id}&step=${target}`,
    'a fresh navigation did not honour the step in the link');
});

test('D-16 a reload of an open card restarts it instead of resuming', async () => {
  const total = Number(/\/\s*(\d+)/.exec((await openCardAt(`#scheme=${CARD.id}`)).label)[1]);
  const target = Math.min(3, total);
  await openCardAt(`#scheme=${CARD.id}&step=${target}`);

  await still.reload({ waitUntil: 'domcontentloaded' });
  await still.waitForSelector('dialog.scheme-dialog .narration-step', { timeout: SELECTOR_TIMEOUT_MS });
  await still.waitForFunction(() => /step=\d/.test(location.hash), null, { timeout: SELECTOR_TIMEOUT_MS });
  const after = await still.evaluate(() => location.hash);
  assert.equal(after, `#scheme=${CARD.id}&step=1`,
    `the reload came back on ${after}: the step in the hash records how far the animation GOT, and ` +
    'restoring it drops the reader onto a frozen middle frame of something they were watching play');
});
