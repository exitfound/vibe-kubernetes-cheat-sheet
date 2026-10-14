# CLAUDE.md `/diagrams/` (Animated architecture diagrams)

A card grid of Kubernetes concepts. Clicking a card opens a native `<dialog>` that plays an SVG
diagram step by step, with narration, play/pause, prev/next, restart, loop and speed. Plain ES
modules, the Web Animations API and SVG built through a small `createElementNS` helper. No
framework, no D3, no GSAP, no canvas.

The root `../CLAUDE.md` covers running, shipping, the shared chrome and the working discipline.
**The rules live in `./CANON.md`**, one row per rule with a stable id: load it before designing,
reviewing or repairing a card. This file says where things are and how to verify.

## Where to look

Every command runs from `diagrams/test/`.

| Task | Read | Edit | Verify |
|---|---|---|---|
| add a card | `./CANON.md`, the category `CLAUDE.md` | `<id>.js`, `cards.js`, `posters.js`, `CARDS/<id>.md` | `npm test`, then the frames |
| change geometry | CANON `L`, `A` | `<id>.js` | `npm test`, then the frames |
| change motion or timing | CANON `M` | `<id>.js` | `npm test`, then the frames |
| change narration or a label | CANON `T` | `<id>.js` | `npm test` |
| touch a shared helper | the comment beside it | `js/lib/*` | `npm test`, then `tools/settled-dump.mjs` against the tree before |
| draw a poster | CANON `R` | `js/diagrams/<cat>/posters.js` | a montage beside two siblings |
| write or debug a check | the test file header | `test/{unit,render,report}/*.test.mjs` | `node --test '<path>'`, after `npm run walk` for `render/` and `report/` |

**Verification ends at the rendered frames, never at the suite.** A lane ending in empty space, a
composition off centre or a tag drifting off its ball is invisible to every check. A step's
`duration` reaches neither WAAPI nor the DOM: only `render/duration.test.mjs` sees it.

## Directory layout

```
diagrams/
  index.html  CANON.md  README.md  favicon.svg
  card/        generated static page and diagram SVG per card (tools/pages/build.mjs), gitignored build output
  css/         tokens.css (category colours), styles.css (layout and dialog, the chrome is
               /cli/css/chrome.css), diagrams.css (SVG classes), page.css (static card pages)
  js/
    app.js       router, grid, hash routing (card and filter, D-16)
    dialog.js    the card dialog: player, flips, fullscreen, PNG save, the keys inside a card
    data.js      CATEGORIES + the category manifests as DIAGRAMS / SUBCATEGORIES
    posters.js   the poster maps merged
    revisions.js generated content fingerprint per card (committed, read by app.js and the hub)
    lib/         svg, primitives, timeline, motion, poster, inspector (+ inspect-mode),
                 export.js (the dialog's PNG save, loaded on demand),
                 tokens.js (PULSE_POD, PULSE_BLOCK, OPACITY, FADE, BEAT, HOLD, playedHold),
                 layout.js (LANE_DY, GRID, LAYOUT, laneY, ladder, strip, spread, midX, shade),
                 diagram-kit.js (the shared base kit), scene-spec.js, step-spec.js
    diagrams/<category>/
      CLAUDE.md          rules true of this category only, as <CAT>.* ids
      CARDS.md           record preamble and index
      CARDS/<id>.md      one record per card
      cards.js           CARDS + SUBCATEGORIES for the category
      posters.js         grid thumbnails
      <category>-kit.js  tint, pulses, the P / F / defineCard bindings
      <id>.js            one module per card
  test/        the harness, never shipped (S-41)
```

## The folder contract

`js/diagrams/<category>/` is the unit of context: adding a card is a one-folder change. A folder
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

`js/data.js` exports `DIAGRAMS`, `CATEGORIES` and `SUBCATEGORIES`. Entry fields are `D-01`, the id
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
  explicit `dur` needs a reason at the call site (`M-12`). Balls fanning out of one trunk take
  `dur` and `offsets` from `fanTiming`, so they ride the trunk as one ball.
- The reduced-motion path is derived from `lights` lists. `reducedLit` covers what a pulse shows.
- Escape hooks (`part.raw`, `part.tune`, `step.enter`, `F.run`) exist for what no field reaches. A
  card that seems to need a new verb is a reason to stop and ask.

`ctx.reduced` is true under `prefers-reduced-motion` and when prev or reset replays a step,
`ctx.register(animation)` tracks an animation for cancel on step change. Prev resets the scene and
replays steps 0..n reduced.

**The page around the cards** lives in `js/app.js` (grid, routing) and `js/dialog.js`: the dialog header (title, section, position,
star, report link, PNG save, fullscreen), the grid with its detailed and compact views, the `NEW`
badges (`cli/js/lib/fresh.js`, keyed by `id@revision`), the hash contract (`D-16`), the keys
(`D-15`) and the poster-first model (`D-14`). Per-browser choices persist in `localStorage` as
`kube-how:diagram-{view,loop,speed,starred}:v1`. Fullscreen goes on the page, not the dialog:
Chrome refuses `requestFullscreen()` on a `<dialog>`, so `syncFullscreenBtn()` re-opens the modal
on top. On a phone the page shows a desktop-only stub (`.mobile-stub` in `index.html`) that links
the static card pages instead of the grid. A tablet held upright (touch, portrait, 601 to 900 wide)
gets the dialog, with a `.portrait-hint` line under the drawing that points to landscape or the
card's page.

## Card work

Card work runs through the skills in `.claude/skills/`, each of which reads CANON itself. The tools
below need the dev server and Playwright from `diagrams/test/`, and run from that folder.

| Lane | Skill | Tool |
|---|---|---|
| a new card, or a new composition for one | `card-new` | |
| review a card, or change a detail of one | `card-review` | frames: `node ../../.claude/skills/card-review/tools/frames.mjs <id> --out=DIR` |
| the truth of its prose | `card-facts` | |
| its poster | `card-poster` | montage: `node ../../.claude/skills/card-poster/tools/montage.mjs <id> --out=DIR` |
| all four over a set of cards | `card-cycle` | |
| a section as a curriculum | `section-review` | |

Adding or removing a card, with a skill or without one, also takes `npm run docs:sync` (the README
headline counts) and `npm run pages` (the static page and its sitemap entry, `D-12`).

## Adding a category

`D-13` lists what a new category touches. Order: folder, kit (shared re-export block unchanged,
tint, pulses, bindings), `cards.js`, `posters.js`, `CLAUDE.md`, `CARDS.md`, then `js/data.js` and
`js/posters.js`, then `css/tokens.css` and the tint block in `css/styles.css` (`C-16`), then
`POSTER_COLORS` in `js/lib/poster.js`, `ROLES` in `test/fixtures/palette.mjs`, the `<CAT>.*` index
in CANON, the table in `diagrams/README.md`, and `npm run docs:sync`. Nothing checks the CSS, poster
and README steps: re-read them.

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
cd diagrams/test
npm test         the gate: unit + render over one browser walk, must be green
npm run report   advisory findings a human rules on
npm run all      both over one walk
npm run test:unit  the no-browser half, seconds
```

The browser tiers need `python3 -m http.server 8888` from the repo root (the container on `:8080`
serves a snapshot, never test against it). `DIAGRAM_IDS=<id>[,<id>]` narrows the walk to some cards
and turns the catalog floors off: that is not the gate.

`test/tools/` holds the scripts that are not checks: `walk.mjs` (the one browser walk every render
and report file asserts over), `docs-sync.mjs` (rewrites the README headline counts),
`settled-dump.mjs` and `buildframe.mjs` (print a card's settled state or its poster frame, for
diffing two trees), `canon.mjs` (queries CANON, `--check=review` for the rows only a human checks)
and `mutate.mjs` (`npm run selftest`: breaks a card one known defect at a time and requires the
named check to go red, run it after editing a check).

## Constraints a card cannot close

- The narration panel covers the top left (`x<=361`, `L-02`). It scales with the diagram, but its
  depth still moves a line or two with the empty gutter beside the drawing (`L-05`) and grows under
  its 11px text floor (1100x800). A card is laid out against its deepest panel.
- A `node()` frame label prints at `x: 12, y: 18` inside the frame, so a frame starting left of
  about 350 above the panel bottom loses its label under the panel at 1100x800, and left of about
  310 on every viewport.
