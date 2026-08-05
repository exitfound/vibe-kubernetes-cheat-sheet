# CLAUDE.md `/scheme/` (Animated architecture diagrams)

Source of truth for the `scheme/` sub-app. The root `../CLAUDE.md` has the repo overview, running,
shipping and the chrome this page inherits.

A card grid of Kubernetes architecture concepts. Click a card, a native `<dialog>` opens, an SVG
diagram plays a step-by-step animation with narration and play/pause/prev/next/reset/speed controls.
Static only: ES modules + Web Animations API + native `<dialog>`. Deliberately **not** used:
React/Vue/Svelte, D3, Three.js, Canvas/WebGL, Mermaid, GSAP, Lottie, Rive. SVG is hand-built through
a tiny `createElementNS` helper.

## Where to look

| Task | Read | Edit | Verify |
|---|---|---|---|
| add a card | `js/schemes/<cat>/CLAUDE.md` | `cards.js`, `<id>.js`, `posters.js`, `./CARDS.md` | `npm run gate` |
| change a card's geometry | that card's section in `./CARDS.md` | `<id>.js` | `anim-dump`, rendered frames, gate |
| change narration or a label | "Writing rules" below | `<id>.js` | `check-terms`, `overlay-measure` |
| touch a shared helper | `scheme/INTERNALS.md` | `js/lib/*` | `npm run oracle:diff`, then gate |
| retint a category | "Catalog and categories" below | `css/tokens.css`, `css/styles.css`, the kit | `check-palette` |
| draw a poster | "Posters" below | `js/schemes/<cat>/posters.js` | montage against two siblings |

**A green check is not a looked-at card.** Most of what can go wrong here (a lane ending in empty
space, a composition pushed off centre, a tag drifting off its ball) is invisible to every rule in
the gate. Open the rendered frames of every card you touched, not a sample.

## Directory layout

```
scheme/
  index.html  favicon.svg
  css/        tokens.css (category colors), styles.css (layout/dialog), diagrams.css (SVG classes)
  INTERNALS.md  the design record for everything that is NOT one card
  js/
    app.js    router, grid, modal lifecycle, keyboard, hash routing
    data.js   barrel: CATEGORIES registry + the four manifests as SCHEMES / SUBCATEGORIES
    posters.js  barrel: the four poster maps merged into POSTERS
    lib/      svg, primitives, timeline, motion, sidebar, inspector,
              tokens.js       magnitudes: PULSE_POD, PULSE_BLOCK, OPACITY, BEAT, FADE
              scheme-kit.js   the shared BASE kit, carries no category and no card imports it
    schemes/<category>/       one folder per category, the unit of context
      CLAUDE.md               what is true of THIS category only
      CARDS.md                the design record for THIS category's cards
      cards.js posters.js     that category's SCHEMES + SUBCATEGORIES, and its grid thumbnails
      <category>-kit.js       the tint, pulsePod/pulsePodDim, any category-only helper
      <id>.js                 one module per diagram
  tools/      dev harness, README.md is the reference for every check and what it cannot see
```

**A record lives in the folder it describes.** One category's card notes are its `CARDS.md`;
anything that is not one card (the barrels, `js/lib/`, the kits, the CSS) is in `scheme/INTERNALS.md`.
`tools/`, and every `CLAUDE.md`, `CARDS.md` and `INTERNALS.md`, are stripped from both shipping
artifacts.

## The folder contract

`js/schemes/<category>/` is the unit of context. Adding a card is a one-folder operation.

A folder may hold exactly four kinds of `.js`: its cards, its `<category>-kit.js`, its `cards.js`
and its `posters.js`. `R-modulepath` reports anything else as unclaimed and it means it: a module no
entry lists is a module no linter reads and no grid renders.

**A card imports its own kit and nothing past it**: `../../lib/svg.js`, `../../lib/primitives.js`,
`./<category>-kit.js`. `lib/` holds only what every category shares.

Each folder's `CLAUDE.md` carries what is true of that category ALONE. The rule that keeps those
four files from becoming four copies of this one: **anything that would be a DEFECT if it differed
between two categories belongs here, not there.** A pointer is not duplication; a paragraph is.

| Folder | Cards | Tint | Kit surface beyond the shared list |
|---|---|---|---|
| `cluster/` | 21 | violet `rgb(192, 176, 255)` | none |
| `workloads/` | 19 | sky blue `rgb(91, 184, 255)` | `WL`, the X layout canon |
| `network/` | 37 | cyan `rgb(79, 229, 255)` | none |
| `storage/` | 31 | jade `rgb(94, 202, 148)` | `setCylinderLabel` |

## Catalog and categories

`js/data.js` exports `SCHEMES` (108 entries), `CATEGORIES`, and `SUBCATEGORIES`. `CATEGORY_LABEL`,
`CATEGORY_ICONS` and `CATEGORY_TAGLINE` are **projections** of `CATEGORIES` through one `byKey(field)`
helper, so a category is added in one place only.

**Every category key matches its label 1:1, and no subcategory key is shared between categories.**
Otherwise a `subcategory` value cannot be read without also reading `category`.

| Label | key | color | cards | subcategories (`key` to label) |
|---|---|---|---|---|
| Cluster | `cluster` | `#7d86ff` indigo | 21 | `control-plane`, `node-runtime`, `node-lifecycle` |
| Workloads | `workloads` | `#5bb8ff` sky blue | 19 | `pods-bootstrap`, `pods-lifecycle`, `controllers` |
| Networking | `network` | `#4fe5ff` cyan | 37 | `network-foundations`, `pod-networking`, `services-endpoints`, `external-traffic`, `dns-service-discovery` |
| Storage | `storage` | `#5eca94` jade | 31 | `volume-foundations`, `volumes-claims`, `csi-mount-path`, `stateful-data` |

Labels for the subcategory keys live in each folder's `cards.js` and `CLAUDE.md`. The retired
Lifecycle category (coral `#ff668c`) is reserved in `tokens.css`, not active. `CATEGORY_TAGLINE`
renders nowhere today: both readers are fallbacks for shapes no category currently has (an orphan
row, a category with no subcategories). The code stays, do not expect a new tagline to appear.

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

**Poster-first model.** Idle is a static poster, a deliberate beat before anything moves. After about
1s the card auto-plays step 1 through the cancellable `Timeline.autoPlay`. The poster previews step
1's TEXT immediately (animation is delayed, text is not). `Next` from the last step wraps to poster,
then step 1. On all 108 cards.

**Keyboard and routing.** `#scheme=<id>` opens that dialog on load or via a direct link; browser back
closes it; closing clears the hash. Search filters `title + desc + category`, debounced 80ms. Inside
a dialog: `Space` play/pause, arrows prev/next, `R` reset, `Esc` close.

## Card construction standard

Cards are not byte-identical, but they share one skeleton. Match it rather than inventing a shape.
Each category names its own exemplar to copy from, in its folder's `CLAUDE.md`.

1. **Module skeleton.** `class Scene { constructor(host){ this.host=host; this.refs={}; this.build(); }
   build(){...} reset(){ this.build(); } }`, then `const STEPS = [...]`, then the `makeInit` export.
2. **`build()` shape.** `this.host.replaceChildren(); this.refs = {};` then a root `svg` with
   `viewBox: '0 0 1200 640'` (`R-viewbox`, no exceptions), `preserveAspectRatio: 'xMidYMid meet'`, a
   full-sentence `aria-label`, `data-style: 'outline'`, and `arrowDefs()` appended first.
3. **Z-order discipline.** Body blocks, then wires and wire labels, then chips, then
   `packetLayer = g({ id: 'packetLayer' })` on top. Blocks that must sit above packets (top-row
   infra, the chain ladder) are appended **after** the packet layer. State the z-order in a comment.
4. **Building blocks.** Pods are a `pod()` shell plus inner `box()`es wrapped in a `g`. State shows
   as a `valChip()` strip updated with `setVal`. Wire labels are dim `text` at fixed positions, blank
   (`' '`) at build, filled per step with `setWire`. Connectors are `arrow` / `pathArrow`, and the
   **same points array** feeds both the static wire and the packet route so they cannot drift.
5. **Step 0 is `id: 'idle'`, a pure reset, carries no `narration` and must not DRAW.** The poster
   shows step 1's text, so a slot-0 string is read by nobody and a slot-0 wire label or lit block
   sits under the panel text of the step AFTER it. Nothing checks this: if a slot-0 `enter()` is
   longer than the prologue plus its chip resets, look at what it puts on screen.
6. **Every `enter()` repaints from scratch**, opening with
   `s.refs.packetLayer.replaceChildren(); clearHL(s); clearWires(s);`. Then it sets all chip values,
   wire labels, `.highlight` classes and **pins final opacities inline**, so a cancel mid-step lands
   on the right value.
7. **The reduced-motion split is the load-bearing line.** Everything **above** `if (ctx.reduced)
   return;` is the complete static end-state; everything **below** is motion, and every animation
   goes through `ctx.register(...)`. Never animate state that is not also pinned statically above it.

Do not try to unify what varies: the kit and pod tint, the `role` passed to primitives, block size,
geometry, step count, connector style.

**`role` is a palette slot, not the card's category**: a workloads card writes `role: 'cluster'` on
its kubelet box on purpose. **Pass it explicitly, always**, because the kit defaults it to nothing
(`role || null`). A tinted dialog collapses most roles onto the one tint, so a wrong role is usually
invisible, but `.scheme-packet` and `.scheme-ripple` hold literal colours and will show it.
`check-palette` catches a role that resolves inconsistently, never a role that was the wrong one to
ask for.

## Motion and design canon

- **Only Pods pulse.** Block auto-pulse is off catalog-wide (`autoPulse: false` is the `makeInit`
  default). Infrastructure lights through `.highlight` or `lightBoxAt` and never pulses. Value chips
  never flash. A packet-less, pod-less step carries its beat with `.highlight`.
- **A Pod pulses with everything inside it.** The pulsed element is always the `g` holding the shell
  AND its inner boxes. `pulsePod` finds targets with `querySelectorAll`, which matches descendants
  only and never the element itself, so pulsing a bare `pod()` fires at half strength. The
  `anim-dump` symptom is `strokeOpacity` rows with no `filter` row.
- **Pulse uses `filter: brightness(...)`, never `transform: scale(...)`**: diagram elements carry a
  `translate` a scale would compose-clobber. The pulse `base` must equal the Pod's RESTING stroke, so
  measure it under `reducedMotion` or a forwards-filled pulse hands you its own end state.
- **Packets animate `transform: translate(Xpx, Ypx)`** on a `cx=0, cy=0` circle, never SVG `cx`/`cy`.
  Each packet must represent literal traffic the step narrates, not decoration on a connector.
  In-diagram hops use `segmentPacket` (linear), right-angle routes `routePacket` (eased,
  distance-normalized), top-row request/ack hops `topPacket` (eased). Routes take no explicit `dur`.
- **Packet vs pulse ordering.** Up-arrow (Pod to infra): `pulsePod(..., 0)` first, packet leaves at
  `BEAT.afterPulse`. Down-arrow: packet first, `pulsePod(..., pkt.arrivalMs)` on arrival. Chained
  hops: `delay: prevHop.arrivalMs + BEAT.afterHop`. Never hard-code a delay. Dim Pods need an
  opacity lift (`pulsePodDim`) or the blink is invisible against the 0.55 they sit at.
- **Every ball rides a drawn wire, and return traffic gets its own lane** offset by `LANE_DY`. One
  wire per destination. A return re-using the outbound arrow reads as the query bouncing, not as an
  answer coming home.
- **A wire nothing rides carries no arrowhead**, so use `relationPath({ points, d, role, dash })`
  (`arrow()` always attaches a marker). **Which of the two a lane IS is decided by the step's own
  words**: if a step NAMES something travelling that way it earns a ball, otherwise it is a
  relationship. Do not read an arrow on one card and a relation line on the next as drift. Audit by
  grepping `class: '...scheme-arrow`, not `arrow(`: a copy spelled with `line()` loses the dash and
  the dim and draws brighter than the lanes that carry balls.
- **A lane leaves the box that ACTS**, which on a control-plane card is almost never the leftmost
  box. A controller writes to the API and stops there; what then happens on a Node is that write
  taking effect, so the lane into the Node band leaves the API.
- **A block that does not exist yet dims, its lanes pin to 0.** Cutting an absent block out leaves a
  block-sized hole that reads as a rendering fault, so draw it dim with a sublabel saying so. A lane
  leaves no hole and an arrow into nothing points at nothing. **A lane's shade is `min(source,
  sink)`**, never one end alone, and Pod opacity and lane opacity are pinned in ONE helper
  (`setLanes` / `setPods`): two independent assignments drift the moment a step is added.
- **A lane carrying a ball must be visible during the flight**: pin its final value above the guard,
  then animate `[{opacity:1},{opacity:0}]` with `fill: 'both'` and the same delay/duration as the
  fade below it, so keyframe one holds through the delay window.
- **Geometry changes are timing changes**, because `routeDur` is length-based. After ANY geometry
  change re-run `anim-dump` on every step, not just the one you moved, and check that each step's
  `span=` still fits its `duration`. Fix an overrun by raising `duration`, never by shortening
  motion: the pace is `routeLength / 0.45` and a longer arrow takes longer on purpose. `routeDur`
  clamps to `[700, 2600]` and most packets sit on the floor, so from 24 to 314 units it is flat.
- **Fade phases.** Every opacity between 0 and 1 comes from `OPACITY` in `tokens.js`, so a shade
  learned on one card reads correctly on the next. A bare `0` or `1` (drawn or not) is fine.

  | Token | Value | Means |
  |---|---|---|
  | `OPACITY.running` | 1.00 | in focus and working |
  | `OPACITY.pending` | 0.55 | declared, not working yet |
  | `OPACITY.notready` | 0.40 | alive but not serving, not observed, or outside this path |
  | `OPACITY.terminating` | 0.25 | `deletionTimestamp` set, eviction or shutdown under way |
  | `OPACITY.terminated` | 0.12 | gone from the API, or finished |

  A pulse peak is a motion magnitude (`PULSE_POD.dimPeak`) and a presentation shade belongs in CSS.
  Neither is a phase, do not force them into the vocabulary.

### Riding labels, `lightBoxAt` and `at`

All three live in `scheme-kit.js` and are re-exported by every kit. **Never write a local copy.**

- **`ridingLabel(s, ctx, txt, points, { delay, dur, easing })`** paints an address tag that travels
  with the ball. Bind the card's constants once at module scope with
  `makeRidingLabel({ role, dy, dx, easing, inMs, outMs, hold, emergeMode })`. **The easing and any
  explicit `dur` must match the ball it rides** (`segmentPacket` is linear, routes are eased), or the
  tag drifts off mid-flight and rejoins only at the endpoints and the midpoint, which no static
  screenshot shows. Compare the two `easing` columns in `anim-dump`.
- **`lightBoxAt(boxEl, ctx, delay)`** adds `.highlight` on packet ARRIVAL rather than at step entry.
  **Whatever lights on arrival must also light on the reduced path**, so the class goes in the guard
  body: `if (ctx.reduced) { s.refs.api.classList.add('highlight'); return; }` above,
  `lightBoxAt(s.refs.api, ctx, pkt.arrivalMs)` below. **When a block dies mid-step, take its
  highlight back in the fade's `onfinish`** rather than mirroring it onto the static path.
- **`at(s, ctx, delay, fn)`** is the same shape for anything else deferred. Both are a 1ms animation
  with an EMPTY keyframe list, and **it has to stay empty**: naming `opacity` composites the target
  for the whole delay window, and on `at` the target is the SVG root, so every block fill visibly
  shifts tone for the length of the ball's flight.

### Layout and the narration panel

- **The safe-zone is an L, not a forbidden box.** The overlay covers the top-left quadrant only, so
  the usable area is the full width below its bottom PLUS the full height right of its right edge.
  When a card feels cramped, check this first: the room is usually already there.
- **The panel is measured per card, and never on one viewport.** Its RIGHT edge is `x<=397` on every
  card, so nothing starts left of 420 unless it also sits below that card's panel bottom. Its BOTTOM
  is per card and ranges 171 to 504, and it moves **non-monotonically**: the panel is HTML at a
  fraction of the dialog width while the diagram scales with it, so a WIDER dialog gives a WIDER
  panel that wraps into FEWER lines and is therefore SHORTER. Sample the whole viewport set.
- **The panel bottom is often a CHARACTER BUDGET**, and on a tight card that number belongs in the
  header comment. Editing prose for accuracy spends it silently and
  `check-geometry --rules=occluded` will not tell you, because it scores occluded AREA and a 25 unit
  strip off a 152 unit frame is under its bar. Re-measure with
  `VW=1100 VH=800 node overlay-measure.mjs <id>` after any prose edit on such a card.
- **That measurement lives in the header comment, not in a constant**: the reserved corner is a fact
  about the panel, not an input to the layout. Do not re-add a `PANEL_R` nothing reads.
- **Do not close a `CENTRE` finding by stretching a strip or widening a frame.** If a finding can
  only be closed by making the picture worse, leave it open and write the reason into the card note.
- **Never set `font-size` as a presentation attribute on a label**: specificity 0 loses to the
  `.scheme-label.code` class rule, so the value never renders and a clearance budget sized off it is
  wrong by 10 to 22 percent. If a label needs another size, add a class in `diagrams.css`. Nothing in
  the gate measures wire-label width.

### Chips

- **Every `enter()` sets EVERY chip**, not only the ones the step narrates, through one
  `setChips(s, {...})`. An unset chip keeps the previous step's value and silently lies. This is
  review-enforced on purpose: a machine can test the convention, not whether a carried-over value is
  still true.
- **A chip always means what its name says.** If a step needs to report something else, that is a
  second chip, not a reused one. Naming a chip for the thing it holds is also what stops it competing
  with a riding tag for the same word on screen.
- **A chip must not run ahead of the motion that produces its value.** Pin the end value above the
  guard, then on the played path set the chip back to what the step STARTS from and turn it over on
  `pkt.arrivalMs` through `at(...)`. Picking the beat is the whole job: what a component KNOWS moves
  when the answer reaches it, what a component DID moves when the call lands, object state moves when
  the write reaches whatever stores it. Where a step is a SEQUENCE, the chip steps through it.
  **Doing this to one chip and not its neighbour is worse than doing it to neither.**
- **`frame-strip` cannot see a deferred effect.** Seeking sets `currentTime` and never fires
  `onfinish`, so every `at(...)` turnover, every `lightBoxAt` arrival class and every deferred
  `setWire` is missing from its frames and the end frame shows the value the played path was ROLLED
  BACK to. Do not read that as a chip stuck at its start value: `check-reduced` passing IS the proof
  the turnover lands. Verify a turnover by sampling a real-time playthrough.

## Posters

- **A poster is one sentence, not a small diagram.** It renders about 200px wide, so a faithful
  miniature is unreadable. Decide the sentence first, keep only the elements that carry it, and drop
  the rest even when they are on the card. Give the brightest fill to the one element it is about.
- viewBox `0 0 320 180`, `stroke="currentColor"`, fills as literal `rgba(255,255,255,...)`, **never**
  `var(--token)`: SVG presentation attributes do not reliably resolve CSS variables.
- **A poster is judged next to its siblings, not on its own.** Build a montage of the card plus two
  neighbours at about 260% before deciding. Siblings are 76 to 80 unit blocks with fills between 0.03
  and 0.10. Specks at 200px, a track dimmed below its siblings and a quarter of the canvas left as
  empty air are all invisible on the file and obvious on the montage.
- **Two house idioms.** The accent is a `rect` with `fill="currentColor"` at `opacity="0.9"` inside
  the block it belongs to, with the losers carrying the same bar at 0.3, never a bright fill on a
  whole shape. And **no poster uses an arrowhead**: direction comes from the composition being closed
  or from a dashed leg.
- A poster carries **no packet dot**: a ball frozen on a wire reads as a paused animation.

## Adding a scheme

1. Create `js/schemes/<category>/<id>.js` following the contract, composing `primitives.js` plus the
   category kit.
2. Add the `SCHEMES` entry in that folder's `cards.js`. The id MUST start with the category, which is
   the folder name. Target **410-460 characters, 3 sentences**; `R-desc` fails the gate outside
   400-470. **If a sentence needs a condition to be true, spend the characters**: cutting a condition
   to fit a band leaves a true sentence standing as a false absolute.
3. Add the poster to that folder's `posters.js` (see "Posters").
4. Put the design record in `js/schemes/<category>/CARDS.md` under `## <id>` and leave a single pointer
   comment under the card's imports (see "Where the record lives").
5. Add a `<url>` to the repo-root `sitemap.xml` if it should be deep-linkable.

## Where the record lives, and how long a comment may be

**A card file carries code, not prose. A comment is at most TWO lines.** It says WHAT the line beside
it does or where a number came from. It does not describe a problem, does not reference a past
defect, carries no date, and does not explain why an earlier version was different. Anything longer
is not a comment:

| Material | Home |
|---|---|
| a rule true of one category | that folder's `CLAUDE.md` |
| a rule true of two or more categories | this file, and the folder points at it |
| a measurement, a rejected alternative with the number that kills it, a `DO NOT` with the defect it prevents | that card's section in `js/schemes/<category>/CARDS.md` |
| how a number was derived, in two lines | a trailing comment on the constant |
| history: dates, "used to", reverted decisions, review vocabulary | deleted |

Card-scoped notes (posters included, since `POSTERS` is keyed by card id) go to that category's
`CARDS.md`, keyed by card id. Notes on everything else go to `scheme/INTERNALS.md` under a
`## <file path>` heading. Each card links to its section with one pointer under its imports:

```js
// Design notes for this card: ./CARDS.md#storage-multi-attach-error
```

`scheme/tools/` does not relocate, because a standalone script's header is how you learn to run it,
but it is capped at the same two lines.

**The record holds what the code cannot say**: measured overlay extents per viewport, why a width is
what it is, which numbers are hard floors and what binds them, which alternatives were tried and
dropped. Deleting a note deletes a measurement someone took with a browser. `check-notes` anchors
each note to a line of code with ``### before `<line>` ``, so **an anchor is DATA: never reword
one**, and when a card is renamed, rename its heading too. Neither markdown ever ships (three
exclusions have to agree, see the root `CLAUDE.md`).

## Writing rules

- **No apostrophes** in narration/wire/chain strings: they are single-quoted JS and an apostrophe
  breaks the module load. Reword. Verify with a browser smoke, not just `node --check`.
- **No semicolons** in narration prose: use a comma, or a period plus a capital.
- **No em-dashes** anywhere (`R-dash`).
- **Terminology is a dictionary, not taste.** `tools/terms.json` is the source of truth and
  `check-terms` enforces it. Two decisions there are deliberately NOT the upstream ones: the
  catalogue majority wins (`Kubelet`, `ETCD`, `Node-1` keep their capitals), and `Node`, `Pod`,
  `Service` are ALWAYS capitalised. `kubectl` is always lowercase.
- **One object, one label, across cards** (`check-labels`). Block labels capitalize the FIRST word
  only; a later word takes a capital only when it is an API object, an acronym or an identifier, so
  `Routing decision` and `CSI controller`, but `ConfigMap app` and `Pod A bind mount`. Hyphenated
  names capitalize only the first segment; bare identifiers keep their real casing. A node frame is
  the exception you cannot fix in the string: `.scheme-node-label` is uppercase catalog-wide.
- **An absolute in a narration is a defect waiting to be found**, and the counter-case is usually a
  sibling card. Grep for `only`, `never`, `always`, `the whole of`, `all`, `nothing` before shipping
  a sentence. The fix is a clause, not a rewrite: a condition gets dropped for length and a true
  statement becomes a false one.
- **If a step NAMES an actor, that actor has to be on the card.** Same test for a WIRE LABEL: it may
  only name traffic that rides THAT lane.
- **A component the docs mark `(optional)` must say so on the card.** Put it on the BLOCK when the
  component is genuinely absent in a large share of clusters, and in the NARRATION when it is
  near-universal but replaceable. Two `optional` sublabels in one drawing read as a pattern.
- **Any edit that changes or adds a technical claim gets the internal-contradiction check before it
  lands**: grep the claim's keywords across the whole card and read what its other steps, its chips,
  its block labels and its `aria-label` already assert. Matching one sentence is not the test.
  (The general form of this rule, and the no-regex-over-prose rule, are in the root `CLAUDE.md`.)
- **Matching the narration is a PROXY for being true.** A sentence can be silent about something real
  (check the `aria-label` too, it often says what the steps left out) and a sentence can be loose
  (one phrase read as licence produced a chip contradicting two earlier steps of its own card).
- **When checking against kubernetes.io, read the RAW page, not a summary of it.** A summariser will
  return a confident invention and nothing will contradict it. `curl -sL` and strip the tags, or read
  the copies `check-sources` leaves under `tools/.cache/pages`, which is offline and free. **The
  highest-yield part is the page's own opening paragraphs**, because that is where the doc puts what
  distinguishes the feature, and it is exactly what a card built from knowledge omits.

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

## Known constraints

- **No top-level browser globals at module load**, except in `motion.js` and `app.js`. `svg.js`,
  `primitives.js`, `timeline.js` and `data.js` parse cleanly in Node so tools can read them.
- **`data-cat` is chrome, `data-role` is diagram. Never merge them back.** `styles.css` selects the
  former, `diagrams.css` the latter, and the two files do not cross.
- **A tinted category declares four opaque colours, never an alpha shade.** Each
  `.scheme-dialog[data-tinted="true"][data-cat="..."]` block carries `--tint-*-rgb` as channel lists
  (`rgba()` cannot take a hex through a `var()`). Every shade WITH an alpha is derived once in the
  shared `[data-tinted="true"]` block, so a category cannot disagree with itself. Adding a shade is
  one line in the shared block, never four. **Do not re-add a per-category `.narration-overlay`
  background**: retint through `--tint-canvas-rgb` and the panel follows.
- **The four kits re-export the same 30 names from `scheme-kit`, duplicated on purpose.** Collapsing
  them into `export * from './scheme-kit.js'` would work and save 28 lines, but the list is what
  documents what a kit offers, and a card must never reach past its kit. `R-kitparity` keeps them
  aligned. `flashChips` is in that list with zero callers: do not call it, and do not drop the export
  without updating all four kits together.
- **`lib/sidebar.js` is duplicated, not symlinked** with the cli copy. Change one, change the other.
- **`animateAlong` honors `options.delay`.** A bug dropping it made packets teleport invisibly during
  the delay window. Do not regress it.
- **The card skeleton is deliberately not refactored.** `defineCard` was rejected; `class Scene`,
  `clearHL` and the step prologue stay duplicated in every card. This is the one large remaining
  source of duplication in the JS, and it is a decision, not an oversight.
- **The `OPEN` findings in the four card records are not to be closed without a reason** (17 today:
  8 cluster, 5 storage, 3 workloads, 1 network). Each carries its own measurement and an explanation
  of why the rule can only be satisfied by making the picture worse.
