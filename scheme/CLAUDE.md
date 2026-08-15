# CLAUDE.md `/scheme/` (Animated architecture diagrams)

The contract for the `scheme/` sub-app: what it is, where everything lives, what a folder and a
module owe, and where to go for the rest. The root `../CLAUDE.md` has the repo overview, running,
shipping, the chrome this page inherits, and the working discipline that applies to all three
sub-apps.

**The rules are not here. `./CANON.md` is the rulebook**: every rule true of a card catalog-wide,
one row each, with a stable id and a column saying which check (if any) enforces it. Load it before
you design, build, review or repair a card. This file routes you; the canon rules you. Where a
sentence below would restate a canon row, it cites the id instead, because the row IS the text.

A card grid of Kubernetes architecture concepts. Click a card, a native `<dialog>` opens, an SVG
diagram plays a step-by-step animation with narration and play/pause/prev/next/reset/speed controls.
Static only: ES modules + Web Animations API + native `<dialog>`. Deliberately **not** used:
React/Vue/Svelte, D3, Three.js, Canvas/WebGL, Mermaid, GSAP, Lottie, Rive. SVG is hand-built through
a tiny `createElementNS` helper.

## Where to look

Every command below runs from `scheme/test/`. **The old `gate` chain no longer exists**: the harness
is a `node:test` suite, `npm test` must be green and `npm run report` is advisory.

| Task | Read | Edit | Verify |
|---|---|---|---|
| add a card | `./CANON.md`, then `js/schemes/<cat>/CLAUDE.md` | `cards.js`, `<id>.js`, `posters.js`, `./CARDS.md` | `npm test` |
| add a category | "Adding a category" below | see that checklist | `npm test` |
| change a card's geometry | `./CANON.md` L and A, then that card's section in `./CARDS.md` | `<id>.js` | `npm test`, then **the rendered frames** |
| change motion or timing | `./CANON.md` M | `<id>.js` | `npm test` (`duration` is seen by ONE file, see below) |
| change narration or a label | `./CANON.md` T | `<id>.js` | `npm test`, plus `npm run report` for the panel extent |
| touch a shared helper | the JSDoc beside it | `js/lib/*` | `npm test`, then `tools/settled-dump.mjs` against a snapshot of the tree before the change |
| retint a category | `./CANON.md` C, "Catalog and categories" below | `css/tokens.css`, `css/styles.css`, the kit | `npm test` (`render/palette.test.mjs`) |
| draw a poster | `./CANON.md` R | `js/schemes/<cat>/posters.js` | montage against two siblings |
| write or debug a check | the test file itself, `test/fixtures/*` | `test/{unit,render,report}/*.test.mjs` | that file alone: `node --test '<path>'` |

**Verification ends at the rendered frames, never at the suite.** Most of what goes wrong here (a
lane ending in empty space, a composition pushed off centre, a tag drifting off its ball) is
invisible to every rule in it. The root `../CLAUDE.md` records what assuming otherwise cost.

**A step's declared `duration` reaches neither WAAPI nor the DOM.** It is the `Timeline` hold
before auto-advance, so no dump of animations or of serialised markup can see it, and a clean run of
either is not evidence the timings survived: `render/duration.test.mjs` is the only guard. The same
applies to a step `id`, its `narration`, and the key order of `STEPS`.

## Directory layout

```
scheme/
  index.html  favicon.svg
  CANON.md      the card rulebook: every catalog-wide rule, with ids
  css/        tokens.css (category colors), styles.css (layout/dialog), diagrams.css (SVG classes)
  js/
    app.js    router, grid, modal lifecycle, keyboard, hash routing
    data.js   barrel: CATEGORIES registry + the four manifests as SCHEMES / SUBCATEGORIES
    posters.js  barrel: the four poster maps merged into POSTERS
    lib/      svg, primitives, timeline, motion, sidebar, inspector,
              tokens.js       magnitudes: PULSE_POD, PULSE_BLOCK, OPACITY, BEAT, FADE
              scheme-kit.js   the shared BASE kit, carries no category and no card imports it
              layout.js       geometry formulas: laneY, ladder, strip, spread, midX
              scene-spec.js   the scene as data: makePartKinds, buildScene, makeScene, makeResetStep
              step-spec.js    the steps as data: makeFlowKinds, makeSteps, flowLights, defineCardWith
    schemes/<category>/       one folder per category, the unit of context
      CLAUDE.md               what is true of THIS category only, as <CAT>.* rules
      CARDS.md                the design record for THIS category's cards
      cards.js posters.js     that category's SCHEMES + SUBCATEGORIES, and its grid thumbnails
      <category>-kit.js       the tint, pulsePod/pulsePodDim, the P / F / defineCard bindings
      <id>.js                 one module per diagram
  test/       the harness: unit/ render/ report/ hold the checks, fixtures/ feeds them, and
              tools/ holds two text probes the checks do not contain. Never shipped (S-41)
```

**A record lives in the folder it describes.** One category's card notes are its `CARDS.md`.
Anything that is NOT one card (the barrels, `js/lib/`, the kits, the CSS) is a JSDoc note beside the
code, and what a check catches and is blind to is in that test file's own header.

## The folder contract

`js/schemes/<category>/` is the unit of context. Adding a card is a one-folder operation.

A folder may hold exactly four kinds of `.js`: its cards, its `<category>-kit.js`, its `cards.js`
and its `posters.js` (`S-20`). A module no entry lists is a module no check reads and no grid
renders, which is why `D-03` reports it rather than ignoring it.

**A card imports its own kit and nothing past it** (`S-21`): `../../lib/svg.js`,
`../../lib/primitives.js`, `./<category>-kit.js`. `lib/` holds only what every category shares, and
the kit is what binds it to a category.

Each folder's `CLAUDE.md` carries what is true of that category ALONE, as `<CAT>.*` rules that
`./CANON.md` indexes by id and subject label only. The rule that keeps those four files from
becoming four copies of this one: **anything that would be a DEFECT if it differed between two
categories belongs in the canon, not there.** A pointer is not duplication; a paragraph is.

On top of the shared re-export list every kit adds the SAME own set: `P`, `F`, `defineCard`,
`POD_VIOLET`, the six `lib/layout.js` formulas, its `<CAT>_TINT` and the two pulses bound to that
tint. The column below is what a kit carries beyond even that.

| Folder | Cards | Tint | Kit surface beyond the common set |
|---|---|---|---|
| `cluster/` | 21 | violet `rgb(192, 176, 255)` | `CLU`, `LAYOUT` |
| `workloads/` | 19 | sky blue `rgb(91, 184, 255)` | `WL`, the X layout canon |
| `network/` | 37 | cyan `rgb(79, 229, 255)` | none |
| `storage/` | 31 | jade `rgb(94, 202, 148)` | `setCylinderLabel`, `STO`, `chipStrip` |

The size of the SHARED list is deliberately written down nowhere: `S-22` makes the four kits
compared against each other the source of truth, in `unit/module.test.mjs`.

## Catalog and categories

`js/data.js` exports `SCHEMES` (108 entries), `CATEGORIES`, and `SUBCATEGORIES`. An entry's fields
are `D-01`, the id-to-folder convention is `D-02`, the key and label constraints are `D-07`, and the
three `CATEGORY_*` maps are projections of one registry (`D-08`, `D-09`).

| Label | key | color | cards | subcategories (`key` to label) |
|---|---|---|---|---|
| Cluster | `cluster` | `#7d86ff` indigo | 21 | `control-plane`, `node-runtime`, `node-lifecycle` |
| Workloads | `workloads` | `#5bb8ff` sky blue | 19 | `pods-bootstrap`, `pods-lifecycle`, `controllers` |
| Networking | `network` | `#4fe5ff` cyan | 37 | `network-foundations`, `pod-networking`, `services-endpoints`, `external-traffic`, `dns-service-discovery` |
| Storage | `storage` | `#5eca94` jade | 31 | `volume-foundations`, `volumes-claims`, `csi-mount-path`, `stateful-data` |

Labels for the subcategory keys live in each folder's `cards.js` and `CLAUDE.md`. The ORDER of each
list is an editorial argument, not a set (`D-10`), and it is recorded beside the list it orders.

## Scheme module contract

Each `js/schemes/<category>/<id>.js` is lazy-imported on dialog open. **There are exactly two legal
export surfaces and nothing between them** (`S-02`), and the split between them is the migration
counter `unit/module.test.mjs` prints on every run: **108 migrated, 0 legacy**. All four categories
are through, so the second surface below describes no card in the tree and is kept only because
`S-02` still admits it.

### The declarative form, which every card uses

The card states its scene and its steps as DATA, and the kit turns them into the `Scene` class and
`STEPS` array the runtime wants:

```js
export const SCENE = { 'aria-label': '...', parts: [ /* ordered */ ], reset: { keys: [...] } };
export const STEPS_SPEC = [ { id, duration, narration, /* ... */ }, /* ... */ ];
export const init = defineCard(SCENE, STEPS_SPEC, { posterFirst: true });
// init returns { play, pause, reset, step('next'|'prev'), setSpeed, isPlaying, destroy }
```

`P`, `F` and `defineCard` come from the category kit, which binds the category role, the Pod role
and the Pod tint ONCE. That is why a card writes no `role:` anywhere and cannot pick up a
neighbouring category's colour by default, which is the narrow reading of `S-42` that holds.

**`SCENE.parts` is an ordered list, and the order is the append order, which is the z-order**: what
a hand-written `build()` said by where a line sat, the list says by position. Groups nest, so a
wrapper is a part like any other and not an escape. The part kinds are `defs group box cylinder node
chip tag chain arrow lane relation wire packets raw pod`, and `P.pod` builds the whole tinted Pod
block in the byte order the hand-written copies used.

`reset.keys`, `reset.pods` and `reset.extra` are written out and never inferred. Inferring pods adds
a `clearPodHighlight` that wipes inline styles the picture depends on.

A step is data plus one ordered motion PROGRAM:

```js
{
  id, duration, narration,
  chips: {}, chipsCued: {}, wires: {}, labels: {}, sublabels: {}, podSublabels: {},
  opacity: {}, lit: [], chain: 0 | [0,1] | 'all' | -1,
  enter(s, ctx) {},        // escape, runs on BOTH paths, last in the static block
  reducedLit: [],          // a highlight the reduced path shows INSTEAD of motion it cannot show
  rewind: {},              // winds a key back before the flow runs, animated path only
  flow: [ ... ],           // F.route / segment / top / pulse / fade / reveal / set / light / anim / run
  motion(s, ctx) {},       // escape, animated path only, after flow
}
```

Everything above the reduced-motion guard is written on BOTH paths, so "a step that does not change
a chip still writes it" (`P-01`) becomes the shape of the data instead of a habit.

`flow` entries emit strictly in list order, with no batching, no sorting and no de-duplication,
because that order is observable: `getAnimations()` hands it back in creation order and the
`onfinish` callbacks fire in it. Delays are a small closed vocabulary: `after: '<name>'` is that
entry's arrival plus `BEAT.afterHop`, `at: '<name>'` is the arrival itself, `delay: N` is a literal,
and `plus: N` adds to whichever of the three was used. An entry earns a name with `name:`, and
`lights: [...]` cues a receiver at whatever arrival the entry just computed.

**The reduced-motion guard is derived.** `flowLights(flow)` collects the ordered union of every
`lights` list, so a card writes no `if (ctx.reduced)` at all. What it cannot derive is a highlight
the static path shows INSTEAD of a pulse, because no `lightBoxAt` names it: that is `reducedLit`,
declared on **111 steps** (network 89, workloads 20, cluster 2, storage 0). It is the ordinary shape
of the static path wherever a Pod pulses instead of lighting, not an exception. A wrong derivation
lands on the HIGHLIGHT axis of `render/reduced.test.mjs`, which is enforced along with the other
three (`S-16`), so `npm test` is what catches it.

Two chip fields, because there are two writers that draw differently: `chips` goes through `setVal`
(the value is replaced and nothing lights), `chipsCued` through `setChip` (`setVal` plus `.highlight`
when the value CHANGED). **The two are written in one FIXED order, `chips` first and `chipsCued`
second**, so a key named by both lands on the cued write whatever order the author typed the fields
in. Do not reorder those two lines in `writeStatics`: a step is free to state a key in both fields,
and without a fixed order the picture would depend on the shape of the literal. Which writer a card
uses is inherited from the primitive it already called and swapping them is a VISIBLE change
(`P-09`), so the split runs per CATEGORY rather than per card: cluster, workloads and network are
`chips` throughout, and storage is the sole `chipsCued` category, with `storage-pvc-binding` the one
file mixing both. Read off the migrated data: **429 steps carry `chips` and 191 carry `chipsCued`**,
because every step states every chip (`P-01`).

`chips` is the state after the STATIC block, which is not the end of the
step: `rewind` and an `F.set` inside `flow` can both carry a key past it, so a reader after a final
value plays `chips`, then `enter`, then `rewind`, then every `F.set` in flow order.

`rewind` and `duration` are the two things deliberately not derived. `rewind` would need the
previous step's values, which `S-13` forbids. `duration` is copied verbatim, and only
`render/duration.test.mjs` can see it at all.

**The escapes, and how narrow they are.** **75 of the 108 cards are fully declarative**; 33 carry at
least one hook, **174 hooks in all** (`part.tune` 74, `part.raw` 43, `step.enter` 42, `F.run` 13,
`reset.extra` 2, `step.motion` 0), and each exists for something with no honest general verb:
`part.tune` captures a ref off an element the builder already made or writes an SVG *attribute* on
it, `part.raw` draws a bare `<rect>` or a free text node, `step.enter` writes text or an attribute no
field reaches, and `F.run` at delay 0 is an imperative beat standing inside the flow order. Ten of
the thirteen `F.run` are that delay-0 form; the three on `cluster-cpu-throttling` carry a real delay
and are genuine deferred callbacks, the only ones in the catalogue.
Storage carries the highest share, 16 of 31, and its folder `CLAUDE.md` says why one by one. If a
card looks like it needs a new VERB, stop and say so: three categories out of four grew the DSL zero
times, and network's two additions (`F.tag`, `F.ripple`) were serialised through the coordinator.

### The legacy form, which no card is on any more

A hand-written `class Scene` with `build()` and `reset()` (`S-01`), a copied `resetStep(s)`
prologue, a hand-written `STEPS` array whose every `enter(s, ctx)` splits on `ctx.reduced` by hand,
and `export const init = makeInit(Scene, STEPS, { posterFirst: true });`. `defineCard` produces
exactly that shape, so `makeInit`, `Timeline` and `app.js` cannot tell the two apart: **there was no
compatibility layer to build and there is none to remove** now that the last card has moved. Writing
a new card in this form is a regression, not a choice.

Both forms share `ctx`: `ctx.reduced` is true under `prefers-reduced-motion` and when prev or reset
replays a step, `ctx.speed` is the current multiplier, `ctx.register(animation)` tracks a WAAPI
animation for cancel-on-step-change. `Scene.build()` paints the idle / step-0 visual state, and
going prev calls `scene.reset()` then replays steps 0..target with `ctx.reduced = true` so they snap
to their final state without animating.

The shape rules for both forms are the `S-` block of `./CANON.md`, and `unit/skeleton.test.mjs`
reads them off the spec with no browser. The poster-first model is `D-14`, and the search, hash
routing and in-dialog keys are `D-15`.

## Adding a card

1. Read `./CANON.md`, then the folder's `CLAUDE.md` for its `<CAT>.*` rules and its exemplar. Copy
   the exemplar's shape rather than inventing one.
2. Create `js/schemes/<category>/<id>.js` in the declarative form above, importing only the three
   paths `S-21` allows. The id MUST start with the category, which is the folder name (`D-02`).
3. Add the `SCHEMES` entry in that folder's `cards.js` (`D-01`). Target **410-460 characters, 3
   sentences**; `D-04` and `D-05` fail outside 400-470 and 2-4.
4. Add the poster to that folder's `posters.js` (`D-06`). Get the concept signed off first (`R-01`).
5. Put the design record in `js/schemes/<category>/CARDS.md` under `## <id>`, and leave the single
   pointer comment under the card's imports (`S-36`).
6. Add a `<url>` to the repo-root `sitemap.xml` if it should be deep-linkable (`D-12`).
7. `cd test && npm test`, then open the rendered frames.

## Adding a category

`D-13` names what a fifth category touches. What follows is the ORDER that makes them all land, and
the half nothing checks.

1. `js/schemes/<cat>/` folder.
2. `<cat>-kit.js`: the re-export block copied from a sibling kit **unchanged** (`S-22`), plus
   `<CAT>_TINT`, the two `pulsePod` wrappers, and the `P` / `F` / `defineCard` bindings built from
   `makePartKinds`, `makeFlowKinds` and `defineCardWith` with this category's role and tint.
3. `cards.js`, then `posters.js`, then `CLAUDE.md` on the shared template, then `CARDS.md` with the
   standard preamble.
4. `js/data.js` (the `CATEGORIES` entry) and `js/posters.js` (import and merge the poster map).
5. `css/tokens.css`, then the tint block in `css/styles.css`: four opaque colours as channel lists
   and nothing else (`C-16`).
6. `js/app.js` `POSTER_COLORS`, the `<CAT>.*` block in `./CANON.md`, and this file's two tables.

`unit/catalog.test.mjs` and `unit/module.test.mjs` cover steps 1 to 4. **Nothing covers step 5 or
step 6**, so re-read them before calling it done.

## Where the record lives

A card file carries code, not prose. The comment budget is `S-34` and where everything longer than
it goes is `S-35`; the table below is the same split from the other side.

| Material | Home |
|---|---|
| a rule true of the whole catalog | `./CANON.md`, as a numbered row |
| a rule true of one category | that folder's `CLAUDE.md`, as a `<CAT>.*` row, indexed by the canon |
| a measurement, a rejected alternative with the number that kills it, a `DO NOT` with the defect it prevents | that card's section in `js/schemes/<category>/CARDS.md` |
| a note on anything that is not one card | a JSDoc block beside the code it describes |
| what a check catches, and what it is blind to | the header of that test file |
| how a number was derived, in two lines | a trailing comment on the constant |
| history: dates, "used to", reverted decisions, review vocabulary | deleted |

Card-scoped notes (posters included, since `POSTERS` is keyed by card id) go to that category's
`CARDS.md`, keyed by card id. Each card links to its section with one pointer under its imports:

```js
// Design notes for this card: ./CARDS.md#storage-multi-attach-error
```

**The record holds what the code cannot say**: measured overlay extents per viewport, why a width is
what it is, which numbers are hard floors and what binds them, which alternatives were tried and
dropped. Deleting a note deletes a measurement someone took with a browser. `unit/docs.test.mjs`
anchors each note to a line of code with ``### before `<line>` ``, so **an anchor is DATA: never
reword one**, and when a card is renamed, rename its heading too.

The label vocabulary a `### layout` block uses (`WHAT`, `LAYOUT`, `LANES`, `MOTION` and the rest) is
one list for all four records, in `./CANON.md` under "The record vocabulary".

## The checks

The harness is a `node:test` suite in `test/`, and each test file carries its own header saying what
it asserts and what it is BLIND to. There is no separate reference document: the test IS the
reference, and a rule with no test says so in `./CANON.md`'s `Check` column.

```
cd scheme/test
npm test        must be green before a change lands
npm run report  advisory: the soft geometry rules, the panel extent, arrival cues, link liveness
```

Two levels, deliberately. `npm test` is what cannot land broken. `npm run report` prints findings a
human rules on, including the ones `L-16` keeps open on purpose. **A report file never fails on a
finding, so it must announce its own invalidity**: no network, a fallback font, a short walk.

**`test/tools/` holds two probes, and neither is a check.** They print a card's state as text so
two trees can be diffed against each other, which is what a refactor needs and no assertion gives:

```
cd scheme/test
node tools/settled-dump.mjs --all --out=DIR --base=http://localhost:8888
node tools/buildframe.mjs   --all --out=DIR --base=http://localhost:8888
```

`settled-dump` plays every step in REAL TIME and reads the frame it leaves behind: glyphs, the
`.highlight` set, the opacities. Freezing a card hides a deferred callback (`at()` schedules its
work as the onfinish of an empty animation, and a paused animation never fires one), so this is the
only thing that sees WHAT such a callback wrote. `buildframe` reads the frame BEFORE step 0, the
poster the reader looks at for the first second, which nothing else in the tree opens.

Two cautions, both paid for. An element is named by its ref KEY, so renaming a ref reddens every
line it appears on with the picture unmoved: compare the VALUES before believing the names. And
`BASE` is not cosmetic: the container on `:8080` serves the tree as it was at build time, so a run
against it reads stale content and agrees with itself. Serve the live tree with
`python3 -m http.server 8888`, and a second tree (a `git archive` of some commit) on its own port.

The `Check` column of `./CANON.md` is the same information from the other side: given a rule, which
test (if any) would notice it breaking, as `test:<file>/<name>` or `report:<file>/<name>`.

## The findings that are left open

**The `OPEN` findings in the four card records are not to be closed without a reason**: **18** today
(cluster 9, storage 5, workloads 3, network 1). Each carries its own measurement and an explanation
of why the rule can only be satisfied by making the picture worse (`L-16`).

**That is not the same population as the soft geometry findings, which number 8** (CENTRE 2,
CENTRE-LOW 4, OCCLUDED 2, printed by `report/geometry-soft.test.mjs`). The `OPEN` entries cover more
than geometry, and one number was used for both for months. Count them separately. The full list of
deliberate exceptions, including the ones that are not `OPEN` findings, is the last section of
`./CANON.md`.
