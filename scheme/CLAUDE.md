# CLAUDE.md `/scheme/` (Animated architecture diagrams)

The contract for the `scheme/` sub-app: what it is, where everything lives, what a folder and a
module owe, and where to go for the rest. The root `../CLAUDE.md` has the repo overview, running,
shipping and the chrome this page inherits.

**The rules are not here. `./CANON.md` is the rulebook**: every rule true of a card catalog-wide,
one row each, with a stable id and a column saying which check (if any) enforces it. Load it before
you design, build, review or repair a card. This file routes you; the canon rules you.

A card grid of Kubernetes architecture concepts. Click a card, a native `<dialog>` opens, an SVG
diagram plays a step-by-step animation with narration and play/pause/prev/next/reset/speed controls.
Static only: ES modules + Web Animations API + native `<dialog>`. Deliberately **not** used:
React/Vue/Svelte, D3, Three.js, Canvas/WebGL, Mermaid, GSAP, Lottie, Rive. SVG is hand-built through
a tiny `createElementNS` helper.

## Where to look

| Task | Read | Edit | Verify |
|---|---|---|---|
| add a card | `./CANON.md`, then `js/schemes/<cat>/CLAUDE.md` | `cards.js`, `<id>.js`, `posters.js`, `./CARDS.md` | `npm run gate` |
| add a category | "Adding a category" below | see that checklist | `npm run gate` |
| change a card's geometry | `./CANON.md` L and A, then that card's section in `./CARDS.md` | `<id>.js` | `anim-dump`, rendered frames, gate |
| change motion or timing | `./CANON.md` M | `<id>.js` | `anim-dump`, `check-duration`, gate |
| change narration or a label | `./CANON.md` T | `<id>.js` | `check-terms`, `overlay-measure` |
| touch a shared helper | `INTERNALS.md` | `js/lib/*` | `npm run oracle:diff`, then gate |
| retint a category | `./CANON.md` C, "Catalog and categories" below | `css/tokens.css`, `css/styles.css`, the kit | `check-palette` |
| draw a poster | `./CANON.md` R | `js/schemes/<cat>/posters.js` | montage against two siblings |
| write or debug a check | `tools/CLAUDE.md`, then `tools/README.md` | `tools/*.mjs` | the check itself |

**A green check is not a looked-at card.** Most of what can go wrong here (a lane ending in empty
space, a composition pushed off centre, a tag drifting off its ball) is invisible to every rule in
the gate. Open the rendered frames of every card you touched, not a sample.

## Directory layout

```
scheme/
  index.html  favicon.svg
  CANON.md      the card rulebook: every catalog-wide rule, with ids
  INTERNALS.md  the design record for everything that is NOT one card
  css/        tokens.css (category colors), styles.css (layout/dialog), diagrams.css (SVG classes)
  js/
    app.js    router, grid, modal lifecycle, keyboard, hash routing
    data.js   barrel: CATEGORIES registry + the four manifests as SCHEMES / SUBCATEGORIES
    posters.js  barrel: the four poster maps merged into POSTERS
    lib/      svg, primitives, timeline, motion, sidebar, inspector,
              tokens.js       magnitudes: PULSE_POD, PULSE_BLOCK, OPACITY, BEAT, FADE
              scheme-kit.js   the shared BASE kit, carries no category and no card imports it
    schemes/<category>/       one folder per category, the unit of context
      CLAUDE.md               what is true of THIS category only, as <CAT>.* rules
      CARDS.md                the design record for THIS category's cards
      cards.js posters.js     that category's SCHEMES + SUBCATEGORIES, and its grid thumbnails
      <category>-kit.js       the tint, pulsePod/pulsePodDim, any category-only helper
      <id>.js                 one module per diagram
  tools/      dev harness. CLAUDE.md is the way in, README.md is the reference for every check
```

**A record lives in the folder it describes.** One category's card notes are its `CARDS.md`;
anything that is not one card (the barrels, `js/lib/`, the kits, the CSS) is in `INTERNALS.md`.
`tools/`, and every `CLAUDE.md`, `CARDS.md`, `INTERNALS.md` and `CANON.md`, are stripped from both
shipping artifacts.

## The folder contract

`js/schemes/<category>/` is the unit of context. Adding a card is a one-folder operation.

A folder may hold exactly four kinds of `.js`: its cards, its `<category>-kit.js`, its `cards.js`
and its `posters.js` (`S-20`). `R-modulepath` reports anything else as unclaimed and it means it: a
module no entry lists is a module no linter reads and no grid renders.

**A card imports its own kit and nothing past it** (`S-21`): `../../lib/svg.js`,
`../../lib/primitives.js`, `./<category>-kit.js`. `lib/` holds only what every category shares.

Each folder's `CLAUDE.md` carries what is true of that category ALONE, as `<CAT>.*` rules that
`./CANON.md` indexes. The rule that keeps those four files from becoming four copies of this one:
**anything that would be a DEFECT if it differed between two categories belongs in the canon, not
there.** A pointer is not duplication; a paragraph is.

| Folder | Cards | Tint | Kit surface beyond the shared list |
|---|---|---|---|
| `cluster/` | 21 | violet `rgb(192, 176, 255)` | none |
| `workloads/` | 19 | sky blue `rgb(91, 184, 255)` | `WL`, the X layout canon |
| `network/` | 37 | cyan `rgb(79, 229, 255)` | none |
| `storage/` | 31 | jade `rgb(94, 202, 148)` | `setCylinderLabel` |

The size of the SHARED list is deliberately written down nowhere: `R-kitparity` compares the four
kits to each other and is the source of truth (`S-22`).

## Catalog and categories

`js/data.js` exports `SCHEMES` (108 entries), `CATEGORIES`, and `SUBCATEGORIES`. `CATEGORY_LABEL`,
`CATEGORY_ICONS` and `CATEGORY_TAGLINE` are **projections** of `CATEGORIES` through one `byKey(field)`
helper, so a category is added in one place only.

**Every category key matches its label 1:1, and no subcategory key is shared between categories**
(`D-07`). Otherwise a `subcategory` value cannot be read without also reading `category`.

| Label | key | color | cards | subcategories (`key` to label) |
|---|---|---|---|---|
| Cluster | `cluster` | `#7d86ff` indigo | 21 | `control-plane`, `node-runtime`, `node-lifecycle` |
| Workloads | `workloads` | `#5bb8ff` sky blue | 19 | `pods-bootstrap`, `pods-lifecycle`, `controllers` |
| Networking | `network` | `#4fe5ff` cyan | 37 | `network-foundations`, `pod-networking`, `services-endpoints`, `external-traffic`, `dns-service-discovery` |
| Storage | `storage` | `#5eca94` jade | 31 | `volume-foundations`, `volumes-claims`, `csi-mount-path`, `stateful-data` |

Labels for the subcategory keys live in each folder's `cards.js` and `CLAUDE.md`, and the ORDER of
each list is an argument recorded in `INTERNALS.md`. `CATEGORY_TAGLINE` renders nowhere today: both
readers are fallbacks for shapes no category currently has (an orphan row, a category with no
subcategories). The code stays, do not expect a new tagline to appear.

Each `SCHEMES` entry: `id`, `title`, `category`, `subcategory`, `desc`, `k8sVersion`, `tinted: true`,
`sources: [{ label, href }]`. There is no path field: `app.js` imports
``./schemes/${category}/${id}.js``, and `R-modulepath` holds both halves of that convention.

Renaming a card id is fine as long as `SCHEME_ALIASES` in `app.js` keeps the old one resolving.

## Scheme module contract

Each `js/schemes/<category>/<id>.js` is lazy-imported on dialog open and exports `init(root, cb)`:

```js
export const init = makeInit(Scene, STEPS, { posterFirst: true });
// returns { play, pause, reset, step('next'|'prev'), setSpeed, isPlaying, destroy }
```

```js
{
  id: 'string',
  duration: 1500,            // ms at 1x speed
  narration: 'Text shown in the narration panel.',
  enter(s, ctx) {
    // ctx.reduced: true under prefers-reduced-motion or when prev/reset replays
    // ctx.speed:   current speed multiplier
    // ctx.register(animation): track a WAAPI animation for cancel-on-step-change
  },
}
```

`Scene.build()` paints the idle / step-0 visual state. Going prev calls `scene.reset()` then replays
steps 0..target with `ctx.reduced = true` so they snap to their final state without animating.

The shape of the module (the class, the `resetStep` prologue, the reduced-motion split, the z-order)
is the `S-` block of `./CANON.md`, and `R-skeleton` prints a census of it on every gate run. Cards
are not byte-identical, but they share one skeleton: match it rather than inventing a shape, and
copy the exemplar each category names in its own `CLAUDE.md`.

**Poster-first model.** Idle is a static poster, a deliberate beat before anything moves. After about
1s the card auto-plays step 1 through the cancellable `Timeline.autoPlay`. The poster previews step
1's TEXT immediately (animation is delayed, text is not). `Next` from the last step wraps to poster,
then step 1. On all 108 cards.

**Keyboard and routing.** `#scheme=<id>` opens that dialog on load or via a direct link; browser back
closes it; closing clears the hash. Search filters `title + desc + category`, debounced 80ms. Inside
a dialog: `Space` play/pause, arrows prev/next, `R` reset, `Esc` close.

## Adding a card

1. Read `./CANON.md`, then the folder's `CLAUDE.md` for its `<CAT>.*` rules and its exemplar.
2. Create `js/schemes/<category>/<id>.js` following the module contract, composing `primitives.js`
   plus the category kit. The id MUST start with the category, which is the folder name.
3. Add the `SCHEMES` entry in that folder's `cards.js`. Target **410-460 characters, 3 sentences**;
   `R-desc` fails the gate outside 400-470.
4. Add the poster to that folder's `posters.js`. Get the concept signed off first (`R-01`).
5. Put the design record in `js/schemes/<category>/CARDS.md` under `## <id>` and leave a single
   pointer comment under the card's imports.
6. Add a `<url>` to the repo-root `sitemap.xml` if it should be deep-linkable.
7. `npm run gate`, then open the rendered frames.

## Adding a category

A fifth category is thirteen edits and they all have to land, because nothing checks most of them.
In this order:

1. `js/schemes/<cat>/` folder.
2. `js/schemes/<cat>/<cat>-kit.js`: the re-export block copied from a sibling kit **unchanged**
   (`R-kitparity` compares all four), plus `<CAT>_TINT` and the two `pulsePod` wrappers.
3. `js/schemes/<cat>/cards.js`: `SCHEMES` and `SUBCATEGORIES` for the category.
4. `js/schemes/<cat>/posters.js`: one poster per card id.
5. `js/schemes/<cat>/CLAUDE.md` on the shared template (folder, tint, kit surface, subcategories,
   exemplar, `<CAT>.*` rules).
6. `js/schemes/<cat>/CARDS.md` with the standard preamble.
7. `js/data.js`: the `CATEGORIES` entry (key, label, colour, icon, tagline).
8. `js/posters.js`: import and merge the new poster map.
9. `css/tokens.css`: `--<cat>-color` and its companions.
10. `css/styles.css`: the `.scheme-dialog[data-tinted="true"][data-cat="<cat>"]` block, four opaque
    colours as channel lists and nothing else (`C-16`).
11. `js/app.js`: the `POSTER_COLORS` entry.
12. `./CANON.md`: a `<CAT>.*` block in the category index.
13. This file: the folder table, the category table, and the counts.

Then `npm run gate`. `R-modulepath`, `R-poster` and `R-kitparity` cover steps 2, 3, 4 and 8; nothing
covers 9 to 13, so re-read them.

## Where the record lives

**A card file carries code, not prose. A comment is at most TWO lines** (`S-34`). It says WHAT the
line beside it does or where a number came from. It does not describe a problem, does not reference
a past defect, carries no date, and does not explain why an earlier version was different.

| Material | Home |
|---|---|
| a rule true of the whole catalog | `./CANON.md`, as a numbered row |
| a rule true of one category | that folder's `CLAUDE.md`, as a `<CAT>.*` row, indexed by the canon |
| a measurement, a rejected alternative with the number that kills it, a `DO NOT` with the defect it prevents | that card's section in `js/schemes/<category>/CARDS.md` |
| a note on anything that is not one card | `INTERNALS.md`, under a `## <file path>` heading |
| how a number was derived, in two lines | a trailing comment on the constant |
| history: dates, "used to", reverted decisions, review vocabulary | deleted |

Card-scoped notes (posters included, since `POSTERS` is keyed by card id) go to that category's
`CARDS.md`, keyed by card id. Each card links to its section with one pointer under its imports:

```js
// Design notes for this card: ./CARDS.md#storage-multi-attach-error
```

`scheme/tools/` does not relocate, because a standalone script's header is how you learn to run it,
but it is capped at the same two lines.

**The record holds what the code cannot say**: measured overlay extents per viewport, why a width is
what it is, which numbers are hard floors and what binds them, which alternatives were tried and
dropped. Deleting a note deletes a measurement someone took with a browser. `check-notes` anchors
each note to a line of code with ``### before `<line>` ``, so **an anchor is DATA: never reword
one**, and when a card is renamed, rename its heading too.

The label vocabulary a `### layout` block uses (`WHAT`, `LAYOUT`, `LANES`, `MOTION` and the rest) is
one list for all four records, in `./CANON.md` under "The record vocabulary".

## The checks

`npm run gate` must be green before a change lands. **`tools/README.md` is the reference**: what each
check catches, what it is BLIND to, the readers (`anim-dump`, `frame-strip`, `inline-dump`,
`overlay-measure`), the `oracle:base` / `oracle:diff` pair for a refactor that must not change the
picture, and how to write a new check. The chain itself is defined in `tools/package.json`.

Two things worth knowing before you trust a green run:

- **The container serves a SNAPSHOT** (`Dockerfile` is `COPY . .` with no mounts), so after editing
  anything under `scheme/` the tools silently check stale content and pass. Point them at the live
  tree with `BASE=http://localhost:8888 npm run gate`, or rebuild first.
- **The blind-spot column is the point of that table.** A green gate means these rules hold, not that
  the card is right.

The `Check` column of `./CANON.md` is the same information from the other side: given a rule, which
tool (if any) would notice it breaking.

## The findings that are left open

**The `OPEN` findings in the four card records are not to be closed without a reason** (17 today:
8 cluster, 5 storage, 3 workloads, 1 network). Each carries its own measurement and an explanation
of why the rule can only be satisfied by making the picture worse (`L-16`). The full list of
deliberate exceptions, including the ones that are not `OPEN` findings, is the last section of
`./CANON.md`.
