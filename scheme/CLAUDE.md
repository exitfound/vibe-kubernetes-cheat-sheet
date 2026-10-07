# CLAUDE.md `/scheme/` (Animated architecture diagrams)

A card grid of Kubernetes concepts. Clicking a card opens a native `<dialog>` that plays an SVG
diagram step by step, with narration, play/pause, prev/next, restart, loop and speed. Plain ES
modules, the Web Animations API and SVG built through a small `createElementNS` helper. No
framework, no D3, no GSAP, no canvas.

The root `../CLAUDE.md` covers running, shipping, the shared chrome and the working discipline.
**The rules live in `./CANON.md`**, one row per rule with a stable id: load it before designing,
reviewing or repairing a card. This file says where things are and how to verify.

## Where to look

Every command runs from `scheme/test/`.

| Task | Read | Edit | Verify |
|---|---|---|---|
| add a card | `./CANON.md`, the category `CLAUDE.md` | `<id>.js`, `cards.js`, `posters.js`, `CARDS/<id>.md` | `npm test`, then the frames |
| change geometry | CANON `L`, `A` | `<id>.js` | `npm test`, then the frames |
| change motion or timing | CANON `M` | `<id>.js` | `npm test`, then the frames |
| change narration or a label | CANON `T` | `<id>.js` | `npm test` |
| touch a shared helper | the comment beside it | `js/lib/*` | `npm test`, then `tools/settled-dump.mjs` against the tree before |
| draw a poster | CANON `R` | `js/schemes/<cat>/posters.js` | a montage beside two siblings |
| write or debug a check | the test file header | `test/{unit,render,report}/*.test.mjs` | `node --test '<path>'` |

**Verification ends at the rendered frames, never at the suite.** A lane ending in empty space, a
composition off centre or a tag drifting off its ball is invisible to every check. A step's
`duration` reaches neither WAAPI nor the DOM: only `render/duration.test.mjs` sees it.

## Directory layout

```
scheme/
  index.html  CANON.md
  card/        generated static page per card (tools/pages/build.mjs), never edited by hand
  css/         tokens.css (category colours), styles.css (layout, dialog, chrome copy),
               diagrams.css (SVG classes), page.css (static card pages)
  js/
    app.js       router, grid, dialog, keyboard, hash routing (card and filter, D-16)
    data.js      CATEGORIES + the four manifests as SCHEMES / SUBCATEGORIES
    posters.js   the four poster maps merged
    contacts.js  header GitHub / Contacts / Sponsor config
    lib/         svg, primitives, timeline, motion, sidebar, keys, fresh, poster, inspector,
                 tokens.js (PULSE_POD, PULSE_BLOCK, OPACITY, FADE, BEAT),
                 layout.js (LANE_DY, GRID, LAYOUT, laneY, ladder, strip, spread, midX, shade),
                 scheme-kit.js (the shared base kit), scene-spec.js, step-spec.js
    schemes/<category>/
      CLAUDE.md          rules true of this category only, as <CAT>.* ids
      CARDS.md           record preamble and index
      CARDS/<id>.md      one record per card
      cards.js           SCHEMES + SUBCATEGORIES for the category
      posters.js         grid thumbnails
      <category>-kit.js  tint, pulses, the P / F / defineCard bindings
      <id>.js            one module per card
  test/        the harness, never shipped (S-41)
```

## The folder contract

`js/schemes/<category>/` is the unit of context: adding a card is a one-folder change. A folder
holds only its cards, its kit, `cards.js` and `posters.js` (`S-20`). A card imports its own kit and
nothing past it, plus `lib/svg.js` or `lib/primitives.js` for raw elements (`S-21`). The kit
re-export list is the card-facing API (`S-22`). Anything that would be a defect if it differed
between two categories belongs in CANON, not in a category `CLAUDE.md`.

| Folder | Tint | Kit adds |
|---|---|---|
| `cluster/` | violet | `CLU` (shared GRID plus BOX_W and NODE), `LAYOUT` |
| `workloads/` | sky blue | `WL` (the shared GRID), `LAYOUT` |
| `network/` | cyan | `BRISK_HOP_MS` |
| `storage/` | jade | `STO`, `chipStrip`, `setCylinderLabel` |

`js/data.js` exports `SCHEMES`, `CATEGORIES` and `SUBCATEGORIES`. Entry fields are `D-01`, the id
convention `D-02`, keys and labels `D-07`, the three `CATEGORY_*` maps are projections of one
registry (`D-08`, `D-09`), and the order of each list is editorial (`D-10`).

## The card module

Each `<id>.js` is lazy-imported when its dialog opens and has one export surface (`S-02`):

```js
export const SCENE = { 'aria-label': '...', parts: [ /* ordered */ ], reset: { keys: [...], pods: [...] } };
export const STEPS_SPEC = [ { id, duration, narration, /* ... */ } ];
export const init = defineCard(SCENE, STEPS_SPEC, { posterFirst: true });
```

`P`, `F` and `defineCard` come from the category kit, which binds the role, Pod role and tint once,
so a card never writes `role:`.

**`SCENE.parts` is ordered, and the order is the z-order.** Part kinds: `defs group box cylinder
node chip tag chain arrow lane relation wire packets raw pod`. `reset.keys`, `reset.pods` and
`reset.extra` are written out, never inferred.

A step is data plus one ordered motion program:

```js
{
  id, duration, narration,
  chips: {}, chipsCued: {}, wires: {}, labels: {}, sublabels: {}, podSublabels: {},
  opacity: {}, lit: [], chain: 0 | [0, 1] | 'all' | -1,
  enter(s, ctx) {},   // escape, both paths, last in the static block
  reducedLit: [],     // a highlight the reduced path shows instead of motion
  rewind: {},         // winds a key back before the flow, animated path only
  flow: [ ... ],      // F.route segment top pulse fade reveal set light anim run tag ripple flash
}
```

- The static fields are written on both paths, so every step states every chip (`P-01`).
  `chips` writes through `setVal`, `chipsCued` through `setChip` (lights on change), always in that
  order.
- `flow` runs strictly in list order: creation order is observable through `getAnimations()`.
- Delays: `delay: N`, `at: '<name>'` (that entry's arrival), `after: '<name>'` (arrival plus
  `BEAT.afterHop`), `plus: N` on top. `name:` labels an entry, `lights: [...]` cues a box on arrival.
- **A ball carries its tag and its landing pulse:** `F.route({ points, tag: { text, dx, dy },
  pulse: 'podKey' })`, the same on `F.segment` and `F.top`. `expandFlow` in `lib/step-spec.js` turns
  them into a plain `F.tag` with the ball's path, start and travel time, and an `F.pulse` at the
  ball's arrival. Every ball and tag fades 200ms. A standalone `F.tag` is for a tag that emerges
  from a block (`emerge`) or a deliberate mismatch.
- Ball speed comes from path length (`routeDur`, 0.45 units per ms, floor 700, ceiling 2600). An
  explicit `dur` needs a reason at the call site (`M-12`).
- The reduced-motion path is derived from `lights` lists. `reducedLit` covers what a pulse shows.
- Escape hooks (`part.raw`, `part.tune`, `step.enter`, `F.run`) exist for what no field reaches. A
  card that seems to need a new verb is a reason to stop and ask.

`ctx.reduced` is true under `prefers-reduced-motion` and when prev or reset replays a step,
`ctx.register(animation)` tracks an animation for cancel on step change. Prev resets the scene and
replays steps 0..n reduced.

**The page around the cards** lives in `js/app.js`: the dialog header (title, section, position,
star, report link, fullscreen), the grid with its detailed and compact views
(`kube-how:scheme-view:v1`), the `NEW` badges (`lib/fresh.js`), the hash contract (`D-16`), the keys
(`D-15`) and the poster-first model (`D-14`). Fullscreen goes on the page, not the dialog: Chrome
refuses `requestFullscreen()` on a `<dialog>`, so `syncFullscreenBtn()` re-opens the modal on top.

## Adding a card

1. Read `./CANON.md` and the category `CLAUDE.md`. Copy the category exemplar's shape.
2. Write `js/schemes/<category>/<id>.js`. The id starts with the category (`D-02`).
3. Add the entry to `cards.js`: 410-460 characters, 3 sentences (`D-04`, `D-05`).
4. Add the poster to `posters.js` (`D-06`) after the concept is signed off (`R-01`).
5. Write `CARDS/<id>.md` (`WHAT`, and `DEVIATES` / `CONTENT` / `OPEN` when they apply), add its row
   to `CARDS.md`, and leave the pointer comment under the card's imports (`S-36`).
6. `npm run pages` here, which writes the static page and the sitemap entry (`D-12`).
7. `npm test`, then open the rendered frames at 1600x1000, 1280x860 and 1100x800.

## Adding a category

`D-13` lists what a fifth category touches. Order: folder, kit (shared re-export block unchanged,
tint, pulses, bindings), `cards.js`, `posters.js`, `CLAUDE.md`, `CARDS.md`, then `js/data.js` and
`js/posters.js`, then `css/tokens.css` and the tint block in `css/styles.css` (`C-16`), then
`POSTER_COLORS` in `js/lib/poster.js` and the `<CAT>.*` index in CANON. Nothing checks the CSS and
poster steps: re-read them.

## Where notes live

| Material | Home |
|---|---|
| a rule true of the whole catalog | `./CANON.md` |
| a rule true of one category | that folder's `CLAUDE.md`, as a `<CAT>.*` row |
| a deliberate rule break, a forced wording, an open defect | `CARDS/<id>.md` |
| a poster's design note | the comment above that poster in `posters.js` (`R-12`) |
| anything about shared code | a comment beside it, at most 3 lines |
| what a check catches and misses | the header of that test file |
| history, dates, counts | nowhere |

## The checks

```
cd scheme/test
npm test         the gate: unit + render over one browser walk, must be green
npm run report   advisory findings a human rules on
npm run all      both over one walk
npm run test:unit  the no-browser half, seconds
```

The browser tiers need `python3 -m http.server 8888` from the repo root (the container on `:8080`
serves a snapshot, never test against it). `SCHEME_IDS=<id>[,<id>]` narrows the walk to some cards
and turns the catalog floors off: that is not the gate.

`test/tools/` holds the scripts that are not checks: `walk.mjs` (the one browser walk every render
and report file asserts over), `docs-sync.mjs` (rewrites the README headline counts),
`settled-dump.mjs` and `buildframe.mjs` (print a card's settled state or its poster frame, for
diffing two trees), `canon.mjs` (queries CANON, `--check=review` for the rows only a human checks)
and `mutate.mjs` (`npm run selftest`: breaks a card one known defect at a time and requires the
named check to go red, run it after editing a check).

## Constraints a card cannot close

- The narration panel covers the top left (`x<=397`, `L-02`) and its depth changes with the
  viewport. A card is laid out against its deepest panel, so the band a wide viewport frees stays
  empty.
- A `node()` frame label prints at `x: 12, y: 18` inside the frame, so a frame starting left of
  about 385 above the panel bottom loses its label under the panel.
