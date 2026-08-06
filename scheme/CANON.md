# CANON.md: the card rulebook

Every rule that is true of a scheme card CATALOG-WIDE, one row each, with a stable id. Load it when
you design, build, review or repair a card. It is **not** auto-loaded: `scheme/CLAUDE.md` is the
contract a folder hands you, this is the rulebook that contract points at.

This file holds RULES ABOUT A CARD. Two neighbouring bodies of knowledge live elsewhere and are not
repeated here:

- **Process**: working discipline, commit cadence, scope discipline, how a mass text pass is
  verified, what the container does and does not prove. Root `CLAUDE.md`.
- **The harness**: what each check catches, what it is BLIND to, the readers, the oracle pair, and
  how to write a new check. `scheme/tools/README.md`, and the chain itself in `tools/package.json`.

A rule here is a rule you should KNOW, not a rule you must obey. The concept of a card is not
constrained: a new card may break a row deliberately, and the way to do that is to write the reason
into its section of `js/schemes/<category>/CARDS.md`. What is not allowed is breaking one by
accident.

## How to read a row

| Column | Means |
|---|---|
| `ID` | stable. Cite it in a review, a card note or a commit message. Ids are never reused |
| `Rule` | one line, stated as the thing that must be true |
| `Check` | who enforces it, see below |
| `Source` | where the long form, the measurement or the implementation lives |

The `Check` column takes exactly four values, and it is the most useful column in the file:

| Value | Means |
|---|---|
| `gate:<check>` | `npm run gate` fails. Cannot land broken |
| `report:<check>` | a tool sees it, but it is not in the gate. Run it by hand, read a finding against the card note before calling it a regression |
| `hook` | `.claude/hooks/check-js.sh` fires on write and can hard-fail the edit with exit code 2 |
| `review` | no machine anywhere. A human is the only thing between this rule and a defect |

Poster rules are `R-01` to `R-12`, two digits. The lint rules inside `check-canon` are `R-<word>`
(`R-desc`, `R-dash`, `R-viewbox`). Different namespaces, told apart by the shape of the suffix.

## The numbers this file is written against

108 cards: cluster 21, workloads 19, network 37, storage 31. 650 steps. Re-measure before trusting
any figure below that carries a date-free absolute, and if you change one, change it here.

---

## L: layout and the narration panel

| ID | Rule | Check | Source |
|---|---|---|---|
| L-01 | The safe-zone is an L, not a forbidden box: the overlay covers the top-left quadrant only, so the usable area is the full width below its bottom PLUS the full height right of its right edge | review | this file |
| L-02 | The narration panel's RIGHT edge is `x<=397` on every card, on every viewport. Measured: worst 396.55, `cluster-architecture` at 1100x800 | report:overlay-measure | `tools/overlay-measure.mjs` |
| L-03 | Nothing starts left of x=420 unless it also sits below that card's own panel bottom | review | L-02 |
| L-04 | The panel BOTTOM is per card and ranges 90 to 504 over the standard viewport set. Worst 503.13 (`workloads-pod-phase-machine`, 1100x800, step 5), shallowest 90.23 (`cluster-admission-webhooks`, 1600x1000, step 3) | report:overlay-measure | measured 2026-08-06 over all 108 cards |
| L-05 | The panel moves NON-MONOTONICALLY with the viewport: the panel is HTML at a fraction of the dialog width while the diagram scales with it, so a WIDER dialog gives a WIDER panel that wraps into FEWER lines and is therefore SHORTER. Never measure on one viewport | report:check-geometry OCCLUDED | `tools/check-geometry.mjs:33` |
| L-05a | **It is a TYPOGRAPHY problem, not a height problem, and clamping the height does not touch it.** The panel's WIDTH in viewBox units is already constant (right edge `x<=397` everywhere); the font is a fixed pixel size, so a wider viewport wraps the same text into fewer lines AND divides by a larger scale, and the panel shrinks in units twice over, by up to 186. Closing it needs type that scales with the diagram, which resizes every narration on every card | review | measured 2026-08-06, `INTERNALS.md` under `css/styles.css` |
| L-05b | The panel ALSO changes height between the STEPS of one card, on 209 of 216 card+viewport pairs, so the diagram area under it moves while the card plays. Pinning `min-height` to the tallest narration fixes that completely and was still REVERTED: it leaves a visible empty strip inside a drawn border (about 100px on `workloads-pod-phase-machine`), and an empty strip inside a border reads as a fault where empty canvas reads as space | review | built and measured 2026-08-06, see `INTERNALS.md` |
| L-06 | The standard viewport set is `1600x1000`, `1280x860`, `1100x800`. A card may pin a stricter row of its own (storage cards carry `900x650`), and where the two disagree the card takes the stricter number and says so | report:check-geometry | `tools/check-geometry.mjs:37` |
| L-07 | A card's measured panel extent lives in its HEADER COMMENT, never in a constant: the reserved corner is a fact about the panel, not an input to the layout | review | this file, X4 |
| L-08 | The panel bottom is often a CHARACTER BUDGET. Editing prose for accuracy spends it silently, and `OCCLUDED` will not tell you because it scores occluded AREA and a 25 unit strip off a 152 unit frame is under its bar. Re-measure with `VW=1100 VH=800 node overlay-measure.mjs <id>` after any prose edit on such a card | review | `tools/overlay-measure.mjs` |
| L-09 | A segment is horizontal or vertical. Nothing runs diagonally | gate:check-geometry DIAGONAL | `tools/check-geometry.mjs:203` |
| L-10 | No segment crosses a block it does not terminate on | gate:check-geometry THROUGH | `tools/check-geometry.mjs:209` |
| L-11 | An endpoint sits on a block FACE MIDPOINT, never a hand-typed coordinate near one | gate:check-geometry OFFEDGE | `tools/check-geometry.mjs:258`, in the gate since 2026-08-06 |
| L-12 | Two endpoints on ONE face at mirrored offsets (`+d` and `-d`, any `d`) are a deliberate lane pair and not a finding, pooled across all steps because a pair whose halves live in different steps is still a pair | report:check-geometry OFFEDGE | `tools/check-geometry.mjs:15` |
| L-13 | The content bbox centres within 40 units of x=600, and the chip strip within 6 | report:check-geometry CENTRE | `tools/check-geometry.mjs:299` |
| L-14 | Blocks sitting BELOW the overlay centre on x=600 too: the full width is free there | report:check-geometry CENTRE-LOW | `tools/check-geometry.mjs:310` |
| L-15 | No block sits substantially under the narration panel | report:check-geometry OCCLUDED | `tools/check-geometry.mjs:290` |
| L-16 | **Do not close a `CENTRE` finding by stretching a strip or widening a frame.** If a finding can only be closed by making the picture worse, leave it OPEN and write the reason into the card's record. 17 are left that way today (8 cluster, 5 storage, 3 workloads, 1 network) | review | the four `CARDS.md` |
| L-17 | `CENTRE` and `CENTRE-LOW` count neither `node()` frames nor chips, so a card balanced by a frame full of chip rows still reports. Read a finding against the card note before treating it as a regression | report:check-geometry | `tools/README.md` |
| L-18 | Never set `font-size` as a presentation attribute on a label: specificity 0 loses to the `.scheme-label.code` class rule, so the value never renders and a clearance budget sized off it is wrong by 10 to 22 percent. Add a class in `diagrams.css` instead | review | `scheme/css/diagrams.css` |
| L-19 | Nothing in the gate measures WIRE-LABEL width. `check-chipfit` measures chips only | review | `tools/README.md` |
| L-20 | Text rates are PER CLASS and are MEASURED, never estimated: `.scheme-box-sublabel` is 10px JetBrains Mono at 6.03 viewBox units per character, `.scheme-chip-text` and `.scheme-label code` are 11px at 6.89, box labels are 12px Space Grotesk and proportional so they vary by string | review | `js/schemes/storage/CLAUDE.md` |
| L-21 | **Await `document.fonts.ready` before measuring anything in the DOM**, or you measure the fallback, which is about 20 percent narrower and flatters you. Never eyeball a width off a screenshot | review | root `CLAUDE.md` |
| L-22 | A card that needs room should check L-01 first: on a cramped card the room is usually already there | review | this file |
| L-23 | **A card drawing a Node frame around Pods uses the family geometry** `POD_Y = NODE_Y + 34`, `POD_H = 106`, `NODE_H = 152`: 34 of label padding, 106 of Pod, 12 of floor. `node()` prints its own label at `NODE_Y + 18`, so less padding puts the frame label inside the first Pod. `cluster-node-drain.js` is the card to copy it from | review | recorded catalog-wide 2026-08-06, previously in `schemes/cluster/CLAUDE.md` |
| L-24 | Growing a Node frame to fix L-23 grows it UPWARD if the bottom stays at 624, so re-check the gap to whatever sits above | review | L-23 |

## A: arrows, lanes, wires, connectors

| ID | Rule | Check | Source |
|---|---|---|---|
| A-01 | Every ball rides a DRAWN wire. No ball travels over blank canvas | review | this file |
| A-02 | The SAME points array feeds the static wire and the packet route, so the two cannot drift | review | `scheme/CLAUDE.md`, card construction standard |
| A-03 | Return traffic gets its OWN lane, offset by the card's lane delta. A return re-using the outbound arrow reads as the query bouncing, not as an answer coming home | review | this file |
| A-04 | One wire per destination. N destinations get N wires, drawn even when a step takes one, so the reader sees the choice was made among drawn alternatives | review | `js/schemes/network/CLAUDE.md` |
| A-05 | **A wire nothing rides carries no arrowhead.** Use `relationPath({ points, d, role, dash })`: both `arrow()` and `pathArrow()` always attach a marker, and a marker with no traffic under it reads as traffic | review | `lib/scheme-kit.js`, `relationPath` |
| A-06 | **Which of the two a lane IS is decided by the step's own words**: if a step NAMES something travelling that way it earns a ball, otherwise it is a relationship. Do not read an arrow on one card and a relation line on the next as drift, the difference IS the content | review | `INTERNALS.md`, `workloads-kit.js` note |
| A-07 | Audit lane style by grepping `class: '...scheme-arrow`, not `arrow(`: a copy spelled with `line()` loses the dash and the dim and draws brighter than the lanes that carry balls | review | this file |
| A-08 | `relationPath` carries `scheme-arrow-relation`, which the CSS gives `stroke-opacity: 0.45`. `stroke-opacity` rather than a darker literal is deliberate: it keeps ONE colour token per category and MULTIPLIES with any element opacity a card pins | review | `INTERNALS.md`, `scheme/css/diagrams.css` |
| A-09 | **A lane leaves the box that ACTS**, which on a control-plane card is almost never the leftmost box. A controller writes to the API and stops there; what then happens on a Node is that write taking effect, so the lane into the Node band leaves the API | review | `INTERNALS.md`, `workloads-kit.js` note. `workloads-force-deletion` is the model |
| A-10 | Where two actors reach one slot, draw TWO lanes over a shared drop rather than picking a winner | review | `INTERNALS.md`, `workloads-kit.js` note |
| A-11 | Moving a lane is a TIMING change, because `routeDur` is length-based: moving a start 300 to 400 units right adds 250 to 870ms per ball. Raise the duration, never shorten the motion | gate:check-duration | `lib/scheme-kit.js`, `HOP_MS` note |
| A-12 | A box can be DERIVED FROM a lane (`KUBECTL_X = SPINE_X - BOX_W / 2`), so redefining the spine moves the box instead of the lane. Such a card needs its own constant | review | `INTERNALS.md`, `workloads-kit.js` note |
| A-13 | **A lane's shade is `min(source, sink)`**, never one end alone. Deriving from one end is how the catalog came to draw a full-strength arrow out of a Pod that was a ghost at 0.12 | gate:check-opacity | `lib/scheme-kit.js`, `laneOf` |
| A-14 | A lane whose far end is GONE goes to 0, not to a dim shade: a block leaves a hole when it vanishes so it dims instead, but an arrow into nothing leaves no hole and reads as a rendering fault | review | `lib/tokens.js`, `OPACITY` note |
| A-15 | **A lane carrying a ball must be visible for the whole flight**: pin its final value above the `ctx.reduced` guard, then animate `[{opacity:1},{opacity:0}]` with `fill: 'both'` and the same delay and duration as the fade below it, so keyframe one holds through the delay window | gate:check-reduced | `lib/tokens.js`, `OPACITY` note, rule 3 |
| A-16 | A block's opacity and its lanes' opacity are pinned in ONE helper (`setLanes` / `setPods` / `setStage`). Two independent assignments drift the moment a step is added, and the drift is invisible to every check in the gate | review | `lib/tokens.js`, `OPACITY` note, rule 1 |
| A-17 | `arrow()` and `pathArrow()` take `role` explicitly. Arrows carry `data-role` and are colour-checked | gate:check-palette | `lib/primitives.js` |
| A-18 | `dim` on an arrow is a stroke WEIGHT, not a lifecycle state. `.scheme-arrow-dim` sits above the role rules at equal specificity so the role wins the stroke and `dim` survives as `stroke-width: 1.4`. That is deliberate: 601 dim lanes across the catalog carry a packet, and making `dim` outrank `role` greys them out | review | `INTERNALS.md`, the diagrams.css decision note |
| A-19 | A ball never travels under or over a block: every endpoint sits on an EDGE, so a rewrite INSIDE a box (DNAT, SNAT, port remap, conntrack) is drawn as a fade at one edge and a re-emergence at the far edge | review | `js/schemes/network/CLAUDE.md` (`NET.A-01`) |

## M: motion

| ID | Rule | Check | Source |
|---|---|---|---|
| M-01 | **Only Pods pulse.** Block auto-pulse is off catalog-wide (`autoPulse: false` is the `makeInit` default). Infrastructure lights through `.highlight` or `lightBoxAt` and never pulses | gate:check-canon R-rawpulse | `lib/timeline.js`, `lib/scheme-kit.js` |
| M-02 | A card never calls `pulse(` from `primitives.js` directly. Pods pulse through the kit's `pulsePod` | gate:check-canon R-rawpulse | `tools/check-canon.mjs:229` |
| M-03 | **A Pod pulses with everything inside it.** The pulsed element is always the `g` holding the shell AND its inner boxes: `pulsePod` finds targets with `querySelectorAll`, which matches descendants only and never the element itself, so pulsing a bare `pod()` fires at half strength. The `anim-dump` symptom is `strokeOpacity` rows with no `filter` row | review | `lib/scheme-kit.js`, `pulsePodWithTint` |
| M-04 | Pulse is `filter: brightness(...)`, never `transform: scale(...)`: diagram elements carry a `translate` a scale would compose-clobber | review | `lib/scheme-kit.js` |
| M-05 | The pulse `base` must equal the Pod's RESTING stroke. Measure it under `reducedMotion`, or a forwards-filled pulse hands you back its own end state | gate:check-palette | `lib/tokens.js`, `PULSE_POD` |
| M-06 | Pod pulse is 900ms (450 up, 450 down), bright 1.4, dim peak 0.8. One length, catalog-wide, with no per-card override | review | `lib/tokens.js` `PULSE_POD` |
| M-07 | A DIM Pod needs `pulsePodDim`: the ordinary pulse plus an opacity lift to `PULSE_POD.dimPeak` and back, or the blink is invisible against the 0.55 it sits at | review | `lib/scheme-kit.js`, `pulsePodDimWithTint` |
| M-08 | A Pod that FADES OUT in a step must PULSE FIRST: pulse delay `<=` fade delay. Fading a Pod while it is still blinking reads as two events at once | gate:check-opacity ORDER | `tools/check-opacity.mjs` |
| M-09 | **Packets animate `transform: translate(Xpx, Ypx)`** on a `cx=0, cy=0` circle, never SVG `cx`/`cy` | review | `lib/scheme-kit.js`, `packetAlong` |
| M-10 | **Each packet must represent literal traffic the step narrates**, not decoration on a connector | review | this file |
| M-11 | Three packet flavours and no fourth: in-diagram hops `segmentPacket` (linear), right-angle routes `routePacket` (eased, distance-normalized), top-row request/ack hops `topPacket` (eased) | review | `lib/scheme-kit.js` |
| M-12 | **Routes take no explicit `dur`.** Travel time comes from path length at 0.45 units per ms, so a ball moves at one speed everywhere. An explicit `dur` is reserved for narrative pacing and needs a one-line justification at the call site | review | `lib/scheme-kit.js`, the `HOP_MS` speed-canon note |
| M-13 | `routeDur` clamps to `[700, 2600]`. `HOP_MS` 700 is both `topPacket`'s fixed duration and `routeDur`'s FLOOR, so from about 24 to 314 units the pace is flat: below that a 220 unit arrow would finish in 489ms and read as a dart next to the long glide. Tune pacing there, in one place | review | `lib/scheme-kit.js` |
| M-14 | Every packet ripples at its destination. The delivered cue is part of the arrival canon with no per-call opt-in, and the ripple carries `.scheme-ripple` rather than `.scheme-packet` so anything counting packets sees ONE ball per hop | review | `lib/scheme-kit.js`, `arrivalRipple` |
| M-15 | **Up-arrow (Pod to infra): `pulsePod(..., 0)` first, packet leaves at `BEAT.afterPulse`** (800, just under the 900 blink) | review | `lib/tokens.js`, `BEAT` |
| M-16 | **Down-arrow (infra to Pod): packet first, `pulsePod(..., pkt.arrivalMs)` on arrival** | review | `lib/tokens.js`, `BEAT` |
| M-17 | Chained hops: `delay: prevHop.arrivalMs + BEAT.afterHop` (100). **Never hard-code a delay** | review | `lib/tokens.js`, `BEAT` |
| M-18 | A controller that self-initiates with no preceding hop or pulse waits `BEAT.lead` (800), so the lit source registers before the ball leaves | review | `lib/tokens.js`, `BEAT` |
| M-19 | A step must OUTLAST its own motion: `span <= duration`. Fix an overrun by raising `duration`, never by shortening motion | gate:check-duration | `tools/check-duration.mjs` |
| M-20 | **Geometry changes are timing changes.** After ANY geometry change re-run `anim-dump` on every step, not just the one you moved | gate:check-duration | `tools/README.md` |
| M-21 | A Pod materialises over `FADE.in` (600, ease-out) and dissolves over `FADE.out` (700, ease-in). A narrative-slow fade keeps an explicit duration with a justification at the call | review | `lib/tokens.js`, `FADE` |
| M-22 | A newborn construction reveals over `REVEAL_MS` (500), which runs BEFORE the ball leaves (`BEAT.lead` is 800), so a block and its lanes are fully present by the time anything is sent down them. It is exported precisely so three cards can sequence the next beat off it rather than keeping private copies | review | `lib/scheme-kit.js`, `REVEAL_MS` |
| M-23 | `revealAt` must not short-circuit on `delay <= 0` straight to opacity 1: nine card-local copies did, which silently played no fade AND threw `from` away. Under `ctx.reduced` it snaps to full, never otherwise | review | `lib/scheme-kit.js`, `revealAt` |
| M-24 | `revealAt`'s `from` is the shade an object rests at while a lane already points AT it. Hiding it outright aims the arrowhead at blank canvas for the whole flight | review | `lib/scheme-kit.js`, `revealAt` |
| M-25 | `animateAlong` honors `options.delay`. A bug dropping it made packets teleport invisibly during the delay window. Do not regress it | review | `lib/primitives.js` |
| M-26 | Value chips NEVER flash | review | this file, P-05 |
| M-27 | A packet-less, pod-less step carries its beat with `.highlight`, or with `flashChips`, which is the ONLY sanctioned block flash | review | `lib/scheme-kit.js`, `flashChips` |
| M-28 | **`lightBoxAt` and `at` use an EMPTY keyframe list, and that is load-bearing.** Naming `opacity` composites the target for the whole delay window: Chrome promotes an element for as long as an opacity animation is attached to it, DELAY PHASE INCLUDED, so every block about to light shifts tone for the flight of the ball and snaps back. On `at` the target is the SVG ROOT, so every block on the card shifts | review | `INTERNALS.md`, `lightBoxAt` |
| M-29 | Grep for `animate([{ opacity: 1 }, { opacity: 1 }]` to check M-28 has not come back | review | `INTERNALS.md` |
| M-30 | **A riding label's easing and any explicit `dur` must match the ball it rides** (`segmentPacket` is linear, routes are eased, `animateAlong` defaults to ease-in-out). Get it wrong and the tag drifts off mid-flight, rejoining only at the endpoints and the midpoint, which no static screenshot shows. Compare the two `easing` columns in `anim-dump` | gate:check-canon R-ridinglabel | `lib/scheme-kit.js`, `makeRidingLabel` |
| M-31 | A riding label is pinned at the route START at build, or it sits at the SVG origin until `animateAlong`'s delay elapses and its fade-in plays in the top-left corner under the narration panel | review | `lib/scheme-kit.js` |
| M-32 | `ridingLabel` binds its per-card constants ONCE at module scope through `makeRidingLabel({ role, dy, dx, easing, inMs, outMs, hold, emergeMode })`. Never write a local copy of it, of `lightBoxAt` or of `at` | review | `lib/scheme-kit.js` |
| M-33 | Every animation goes through `ctx.register(...)`, so a step change cancels it | review | `lib/timeline.js` |
| M-34 | An added hop costs about 800ms (a short gap sits on the 700 floor plus `BEAT.afterHop`), so `duration` usually has to rise and `check-duration` says by how much | gate:check-duration | `INTERNALS.md`, `workloads-kit.js` note |
| M-35 | `frame-strip` cannot see a deferred effect: seeking sets `currentTime` and never fires `onfinish`, so every `at(...)` turnover, every `lightBoxAt` arrival class and every deferred `setWire` is missing from its frames. Verify a turnover by sampling a real-time playthrough, and read `check-reduced` passing as the proof it lands | review | `tools/README.md` |

## C: colour, roles and the opacity vocabulary

| ID | Rule | Check | Source |
|---|---|---|---|
| C-01 | **`role` is a palette slot, not the card's category.** A workloads card writes `role: 'cluster'` on its kubelet box on purpose | gate:check-palette | `scheme/CLAUDE.md` |
| C-02 | **Pass `role` explicitly, always.** The kit defaults it to nothing (`role \|\| null`) and a tinted dialog collapses most roles onto the one tint, so a wrong role is usually invisible | gate:check-palette | `lib/scheme-kit.js`, `valChip` |
| C-03 | One `(category, element class, role, state)` tuple resolves to ONE colour. `check-palette` catches a role that resolves inconsistently, NEVER a role that was the wrong one to ask for | gate:check-palette | `tools/check-palette.mjs` |
| C-04 | Every opacity between 0 and 1 comes from `OPACITY` in `tokens.js`, so a shade learned on one card reads correctly on the next. A bare `0` or `1` is fine | gate:check-opacity PHASE, gate:check-canon R-opacity | `lib/tokens.js` |
| C-05 | `OPACITY.running` 1.00: in focus and working | gate:check-opacity | `lib/tokens.js` |
| C-06 | `OPACITY.pending` 0.55: declared, not working yet | gate:check-opacity | `lib/tokens.js` |
| C-07 | `OPACITY.notready` 0.40: alive but not serving, not observed, or outside this path | gate:check-opacity | `lib/tokens.js` |
| C-08 | `OPACITY.terminating` 0.25: `deletionTimestamp` set, eviction or shutdown under way | gate:check-opacity | `lib/tokens.js` |
| C-09 | `OPACITY.terminated` 0.12: gone from the API, or finished | gate:check-opacity | `lib/tokens.js` |
| C-10 | A pulse peak (`PULSE_POD.dimPeak`) is a motion magnitude and a presentation shade belongs in CSS. Neither is a phase: do not force them into the vocabulary | gate:check-opacity | `lib/tokens.js` |
| C-11 | Nothing holds `.highlight` while it sits at the terminated shade | gate:check-opacity LIT | `tools/check-opacity.mjs` |
| C-12 | `check-opacity` judges the EXPRESSION, not the number, so a named constant cannot smuggle a shade past it | gate:check-opacity | `tools/check-opacity.mjs` |
| C-13 | A LANE has no phase of its own and is not in the vocabulary. See A-13 | gate:check-opacity | `lib/tokens.js` |
| C-14 | **A block that does not exist yet DIMS, it is not cut out.** Cutting an absent block leaves a block-sized hole that reads as a rendering fault, so draw it dim with a sublabel saying so | review | this file |
| C-15 | **`data-cat` is chrome, `data-role` is diagram. Never merge them back.** `styles.css` selects the former, `diagrams.css` the latter, and the two files do not cross | review | `scheme/css/` |
| C-16 | A tinted category declares FOUR opaque colours as CHANNEL LISTS (`--tint-deep-rgb` / `-base-rgb` / `-bright-rgb` / `-canvas-rgb`) plus three hand-mixed surface fills, and nothing else | review | `scheme/css/styles.css` |
| C-17 | Channel lists rather than hex, because `rgba()` cannot take a hex through a `var()` | review | `scheme/css/styles.css` |
| C-18 | **Every shade WITH an alpha is derived ONCE in the shared `[data-tinted="true"]` block.** Adding a shade is one line there, never four. Restating alpha per category is how a `--tint-glow` came to disagree with its own `--tint-base` | review | `INTERNALS.md`, tinted dialog |
| C-19 | **Do not re-add a per-category `.narration-overlay` background.** Retint through `--tint-canvas-rgb` and the panel follows. A hand-copied override per category is how a violet card carried a navy panel for as long as the category had existed | review | `INTERNALS.md` |
| C-20 | `color-mix` is deliberately unused, so colour resolution stays fully deterministic | review | `INTERNALS.md` |
| C-21 | Networking is the one category whose colour appears as a LITERAL in `diagrams.css`: `.scheme-packet` and `.scheme-ripple` pin `#4fe5ff` because the tint stop washed the ball out. Do not fold those into tokens | review | `scheme/css/diagrams.css` (`NET.C-01`) |
| C-22 | Retinting a category touches five places: the kit's `<CAT>_TINT`, `css/tokens.css`, the tinted block in `css/styles.css`, `POSTER_COLORS` in `js/app.js`, and the folder `CLAUDE.md`. **All four categories agree across all five since 2026-08-06**, so a mismatch is now a regression rather than a known exception | review | this file, D-13 |
| C-23 | A green above roughly 50 percent saturation goes acid on this canvas. If a new green shade is needed, move LIGHTNESS, not saturation | review | `js/schemes/storage/CLAUDE.md` (`STO.C-01`) |
| C-24 | The retired Lifecycle category (coral `#ff668c`) is NOT reserved anywhere in `scheme/`. `tokens.css` does not carry it, and the only live `#ff668c` in the repo is `--ts-tools-color` in `cli/css/styles.css`, an unrelated slot | review | measured 2026-08-06 |

## T: text, narration and terminology

| ID | Rule | Check | Source |
|---|---|---|---|
| T-01 | **No apostrophes** in narration, wire or chain strings: they are single-quoted JS and an apostrophe breaks the module load. Reword | hook | `.claude/hooks/check-js.sh` |
| T-02 | Verify T-01 with a browser smoke, not just `node --check`: the hook catches the syntax error, `smoke-all` catches the ReferenceError class it does not | gate:smoke-all | `tools/smoke-all.mjs` |
| T-02a | **`node --check` and the browser do not agree.** On a file whose first statement is an `import`, Node takes the ESM path and ACCEPTS a reserved word as a destructured binding (`function f(s, { cond, new, grace })`). The browser rejects it, the module never loads, and the card renders nothing. Never derive an identifier from data (a chip name, a label) without checking it against the reserved-word list | gate:smoke-all | measured 2026-08-06, `.claude/hooks/check-js.sh` |
| T-03 | **No semicolons** in narration prose: use a comma, or a period plus a capital | review | this file |
| T-04 | **Neither an em-dash nor an en-dash, anywhere.** The prose says "no em-dashes", the rule bans both | gate:check-canon R-dash | `tools/check-canon.mjs:142` |
| T-05 | `R-dash` scans the card modules, the four manifests, the kits, this file, and the named root and `cli/` files. The four `CARDS.md` and `INTERNALS.md` are deliberately OUTSIDE its area | gate:check-canon R-dash | `tools/check-canon.mjs`, `dashTargets` |
| T-06 | **Terminology is a dictionary, not taste.** `tools/terms.json` is the source of truth: 70 hard terms, 13 hard-lowercase, 11 range exceptions, 8 soft terms reported only | gate:check-terms | `tools/terms.json` |
| T-07 | Two dictionary decisions are deliberately NOT the upstream ones: the catalogue majority wins (`Kubelet`, `ETCD`, `Node-1` keep their capitals), and `Node`, `Pod`, `Service` are ALWAYS capitalised. `kubectl` is always lowercase | gate:check-terms | `tools/terms.json` |
| T-08 | `check-terms` reads `desc`, every `narration` and every `aria-label`. It cannot read MEANING | gate:check-terms | `tools/check-terms.mjs` |
| T-09 | **System A for strings drawn ON the diagram**: a BLOCK LABEL is a heading and takes a capital, everything else on the canvas is body text and stays lowercase | gate:check-inline | `tools/check-inline.mjs` |
| T-10 | Block labels capitalize the FIRST word only. A later word takes a capital only when it is an API object, an acronym or an identifier: `Routing decision` and `CSI controller`, but `ConfigMap app` and `Pod A bind mount` | gate:check-labels | `tools/check-labels.mjs` |
| T-11 | Hyphenated names capitalize only the first segment; bare identifiers keep their real casing | gate:check-labels | `tools/check-labels.mjs` |
| T-12 | A node frame label is the exception you cannot fix in the string: `.scheme-node-label` is uppercase catalog-wide by CSS | gate:check-palette | `scheme/css/diagrams.css` |
| T-13 | **One object, one label, across cards.** Strings are only compared inside the same POSITION CLASS, because a heading and a chip name are supposed to differ | gate:check-labels | `tools/check-labels.mjs` |
| T-14 | The value class never fails: an API literal and an English word wear the same letters, so 11 ambiguous pairs are reported for a human to judge and are not findings | report:check-labels | `tools/check-labels.mjs` |
| T-15 | Indirect coverage (a string reaching the canvas through a card-local wrapper) has a FLOOR of 321 strings, and it is enforced. A refactor that drops it fails even at zero findings. It stands at **702** since the chip fold | gate:check-inline | `tools/check-inline.mjs` |
| T-16 | Two distinct ways to collapse T-15, both at exit 0. Renaming `setChip` without renaming its seed in `prose.mjs` drops the resolver from 321 to **114**. Moving `setChips` out of a line-initial `function` declaration makes it invisible to `prose.mjs` entirely and drops it from 321 to **6** | gate:check-inline | `tools/prose.mjs:253`, `tools/check-inline.mjs:169` |
| T-17 | The unresolvable-write CEILING is **8** and it is enforced. They are not findings, they are chip writes the resolver could not read, so a value they put on the canvas was never classified. **Lower the ceiling when a card stops hiding values behind a factory, never raise it to make a run pass** | gate:check-inline | `tools/check-inline.mjs` |
| T-17a | Those 8 are the irreducible floor: a template literal doing arithmetic, a bare variable, a run-time `s.refs[k]`, a `String(i + 1)`, a ternary, and one `valChip` whose name and value come from a data array. Making any of them literal means unrolling a loop or hard-coding a computed number, which is worse than being unread | review | measured after the factory expansions, 18 to 8 |
| T-18 | Two different Pods must not carry the same address, and a request must not exceed its own limit | gate:check-figures | `tools/check-figures.mjs` |
| T-19 | **An absolute in a narration is a defect waiting to be found**, and the counter-case is usually a sibling card. Grep for `only`, `never`, `always`, `the whole of`, `all`, `nothing` before shipping a sentence | review | this file |
| T-20 | The fix for T-19 is a CLAUSE, not a rewrite. **If a sentence needs a condition to be true, spend the characters**: cutting a condition to fit a band leaves a true sentence standing as a false absolute | gate:check-canon R-desc | this file |
| T-21 | **If a step NAMES an actor, that actor has to be on the card** | review | this file |
| T-22 | Same test for a WIRE LABEL: it may only name traffic that rides THAT lane | review | this file |
| T-23 | A component the docs mark `(optional)` must say so on the card: on the BLOCK when it is genuinely absent in a large share of clusters, in the NARRATION when it is near-universal but replaceable. Two `optional` sublabels in one drawing read as a pattern | review | this file |
| T-24 | **Any edit that changes or adds a technical claim gets the internal-contradiction check before it lands**: grep the claim's keywords across the whole card and read what its other steps, its chips, its block labels and its `aria-label` already assert. Matching one sentence is not the test | review | root `CLAUDE.md` |
| T-25 | **Matching the narration is a PROXY for being true.** A sentence can be silent about something real (check the `aria-label` too, it often says what the steps left out) and a sentence can be loose | review | this file |
| T-26 | **When checking against kubernetes.io, read the RAW page, not a summary.** A summariser returns a confident invention and nothing contradicts it. `curl -sL` and strip the tags, or read the offline copies `check-sources` leaves under `tools/.cache/pages` | review | `tools/check-sources.mjs` |
| T-27 | The highest-yield part of an upstream page is its OPENING paragraphs, because that is where the doc puts what distinguishes the feature, and it is exactly what a card built from knowledge omits | review | this file |
| T-28 | A card's `aria-label` is a FULL SENTENCE describing the whole drawing | review | `scheme/CLAUDE.md` |
| T-29 | Wire labels are dim `text` at fixed positions, blank (`' '`) at build, filled per step with `setWire` | gate:check-reduced WIRE-TEXT | `lib/scheme-kit.js` |
| T-30 | A card whose `setWire` runs only below the `ctx.reduced` guard shows blank lanes on prev and reset while the narration names the exact string that should be there | gate:check-reduced WIRE-TEXT | `tools/check-reduced.mjs` |
| T-31 | **A mass automated pass over prose must be followed by READING it.** A regex sweep leaves the linters green and the meaning broken, and an assertion that a pattern matches once does not protect a prefix-style edit from a second run | review | root `CLAUDE.md` |
| T-32 | Sources: two sources on one card must not share a label | gate:check-canon R-srcdup | `tools/check-canon.mjs:408` |
| T-33 | One href is labelled ONE way across the catalog | gate:check-canon R-srclabel | `tools/check-canon.mjs:417` |
| T-34 | Source liveness (DEAD, SOFT, MOVED, ANCHOR) is checkable but not in the gate, because it hits the network. **Run it `--refresh`**: a warm cache makes it report 0 findings without fetching anything. 149 unique urls, all alive on 2026-08-06 | report:check-sources | `tools/check-sources.mjs` |

## P: value chips

| ID | Rule | Check | Source |
|---|---|---|---|
| P-01 | **Every `enter()` sets EVERY chip**, not only the ones the step narrates, through ONE `setChips(s, {...})` call. An unset chip keeps the previous step's value and silently lies | review | this file. Deliberately review-enforced: a machine can test the convention, not whether a carried-over value is still true |
| P-01a | **Closed catalog-wide on 2026-08-06: 0 steps leave a chip unstated.** 101 of 108 cards carry the wrapper; the other 7 hold no chip or exactly one and state it directly. A step that carries a value now SAYS so, so the value is reviewable instead of being an accident of which step last touched it | review | measured, and the oracle proved the fold moved nothing |
| P-11 | The wrapper is a LINE-INITIAL `function setChips(s, { ... })` declaration with a DESTRUCTURED second parameter, and each call passes an OBJECT LITERAL. Any other form (an arrow, a method, an `Object.entries` loop, a spread at the call site) is invisible to `prose.mjs`. See T-16 | gate:check-inline | `tools/prose.mjs` |
| P-12 | **Only TOP-LEVEL chip writes belong in `setChips`.** A write inside a `ctx.reduced` branch or inside an `at(...)` turnover is a different BEAT (`P-03`), and folding it into the step-entry call moves when the value appears. This is why 23 cards could be folded mechanically and the rest could not | review | measured 2026-08-06 |
| P-13 | A `setChips` key may NOT be spelled `label`, `sublabel`, `ip` or `sub`. `check-figures` reads `ip: '...'` in an object literal as a Pod ADDRESS written where a block is built, so a chip key of that name makes a chip value look like a second block carrying the same address, and a real DUP-IP look like a duplicate of itself. Use `podIp` | gate:check-figures | `tools/check-figures.mjs:16` |
| P-14 | Nor may a key be a RESERVED WORD. See T-02a | gate:smoke-all | 2026-08-06 |
| P-02 | **A chip always means what its name says.** If a step needs to report something else, that is a second chip, not a reused one. Naming a chip for the thing it holds is also what stops it competing with a riding tag for the same word on screen | review | this file |
| P-03 | **A chip must not run ahead of the motion that produces its value.** Pin the end value above the guard, then on the played path set the chip back to what the step STARTS from and turn it over on `pkt.arrivalMs` through `at(...)` | report:check-arrival R2 | `tools/check-arrival.mjs`. Since the chip fold, that start value is written out at the call site, so the pattern reads off the step |
| P-04 | Picking the beat is the whole job: what a component KNOWS moves when the answer reaches it, what a component DID moves when the call lands, object state moves when the write reaches whatever stores it. Where a step is a SEQUENCE, the chip steps through it. **Doing this to one chip and not its neighbour is worse than doing it to neither** | review | this file |
| P-05 | A chip whose value CHANGED this step lights as a STATIC highlight, never a flash | report:check-arrival R2 | `lib/scheme-kit.js`, `setChip` |
| P-05a | **The cue does not have to be a highlight on the chip.** A Pod pulse, or a helper walking a listing row by row, is the cue on four cards, and one card leaves a panel deliberately unlit because the value went back to `none`. R2 sees none of that: its 29 findings hold ZERO true positives, read one by one on 2026-08-06 | report:check-arrival R2 | `tools/README.md` |
| P-06 | Value chips are deliberately OUT of the arrival rule: they light at step ENTRY with the text change, while boxes, pods and cylinders light on ARRIVAL | report:check-arrival R3 | `tools/check-arrival.mjs` |
| P-07 | A chip's NAME must not collide with its longest VALUE, measured RENDERED on every step. `valChip` anchors the name 12 from the left and the value 12 from the right, so a chip needs name + value + 24 plus a readable gap. Shorten the VALUE rather than widening the chip | gate:check-chipfit | `tools/check-chipfit.mjs` |
| P-08 | `valChip` has NO category default for `role`. It used to default to `cluster`, which tagged 82 workloads chips with the cluster palette, invisible only because a tinted dialog collapses every role onto one tint | gate:check-palette | `lib/scheme-kit.js`, `valChip` |
| P-15 | **Declare a chip with a literal `valChip({ ... name: '...', value: '...' })`, not through a card-local factory.** `prose.mjs` seeds on that literal, so a factory hides every value the chip ever shows from `check-inline` and `check-labels` while both keep printing zero findings | gate:check-inline | `tools/prose.mjs`, and `network-nodeport-loadbalancer` where it was undone |
| P-09 | `setChip` highlights a chip whose value changed; `setVal` writes without the highlight. **A card converging on a `setChips` wrapper keeps whichever primitive it already called**: swapping `setVal` for `setChip` is a VISIBLE change | review | 2026-08-06, stage 5.3 |
| P-10 | `setChip` must not be renamed without renaming its seed in `prose.mjs`. See T-16 | gate:check-inline | `lib/scheme-kit.js`, `setChip` |

## D: card metadata and the catalog

| ID | Rule | Check | Source |
|---|---|---|---|
| D-01 | A `SCHEMES` entry is `id`, `title`, `category`, `subcategory`, `desc`, `k8sVersion`, `tinted: true`, `sources: [{ label, href }]`. There is no path field | gate:check-canon R-modulepath | `js/schemes/<cat>/cards.js` |
| D-02 | `app.js` imports ``./schemes/${category}/${id}.js``, so **the id MUST start with the category, which is the folder name** | gate:check-canon R-modulepath | `tools/check-canon.mjs:346` |
| D-03 | A module on disk that no `SCHEMES` entry claims is unclaimed: nothing lints it and the grid never shows it | gate:check-canon R-modulepath | `tools/check-canon.mjs:358` |
| D-04 | `desc` is 400 to 470 characters hard, 410 to 460 target | gate:check-canon R-desc | `tools/check-canon.mjs:388` |
| D-05 | `desc` is 2 to 4 sentences, 3 target | gate:check-canon R-desc | `tools/check-canon.mjs:389` |
| D-06 | Card and poster are an exact BIJECTION. A card with no poster draws `FALLBACK_POSTER`; a poster with no card is never rendered | gate:check-canon R-poster | `tools/check-canon.mjs:373` |
| D-07 | **Every category key matches its label 1:1, and no subcategory key is shared between categories**, or a `subcategory` value cannot be read without also reading `category` | review | `js/data.js` |
| D-08 | `CATEGORY_LABEL`, `CATEGORY_ICONS` and `CATEGORY_TAGLINE` are PROJECTIONS of `CATEGORIES` through one `byKey(field)` helper, so a category is added in one place only | review | `js/data.js` |
| D-09 | `CATEGORY_TAGLINE` renders nowhere today: both readers are fallbacks for shapes no category currently has. The code stays, do not expect a new tagline to appear | review | `js/data.js` |
| D-10 | Each category's `SUBCATEGORIES` list is an ORDER, not a set, and the order is an argument recorded in `INTERNALS.md` | review | `INTERNALS.md`, subcategory ordering |
| D-11 | Renaming a card id is fine as long as `SCHEME_ALIASES` in `app.js` keeps the old one resolving | review | `js/app.js:433` |
| D-12 | A deep-linkable card gets a `<url>` in the repo-root `sitemap.xml` | review | `sitemap.xml` |
| D-13 | Adding a CATEGORY touches: the folder, `cards.js`, `posters.js`, `<cat>-kit.js`, `CLAUDE.md`, `CARDS.md`, `CATEGORIES` in `js/data.js`, the tint block in `css/styles.css`, the colour in `css/tokens.css`, `POSTER_COLORS` in `js/app.js`, the row in `tools/README.md` if a check needs it, and a `<CAT>.*` block in this file | review | `scheme/CLAUDE.md`, new-category checklist |
| D-14 | The poster-first model applies to all 108 cards: idle is a static poster, step 1 auto-plays after about 1s through the cancellable `Timeline.autoPlay`, the poster previews step 1's TEXT immediately, and `Next` from the last step wraps to poster then step 1 | gate:check-canon R-skeleton | `lib/timeline.js` |
| D-15 | Search filters `title + desc + category`, debounced 80ms. Inside a dialog: `Space` play/pause, arrows prev/next, `R` reset, `Esc` close | review | `js/app.js` |

## R: posters

| ID | Rule | Check | Source |
|---|---|---|---|
| R-01 | **Describe the intended abstract concept in one line and get sign-off BEFORE rendering a full poster.** Posters are the single biggest source of rework in this project | review | root `CLAUDE.md` |
| R-02 | **A poster is one sentence, not a small diagram.** It renders about 200px wide, so a faithful miniature is unreadable. Decide the sentence first, keep only the elements that carry it, drop the rest even when they are on the card | review | this file |
| R-03 | Give the brightest fill to the one element the poster is about | review | this file |
| R-04 | viewBox `0 0 320 180`, `stroke="currentColor"`, fills as literal `rgba(255,255,255,...)`, **never** `var(--token)`: SVG presentation attributes do not reliably resolve CSS variables | review | `js/schemes/<cat>/posters.js` |
| R-05 | **A poster is judged next to its SIBLINGS, not on its own.** Build a montage of the card plus two neighbours at about 260 percent before deciding | review | this file |
| R-06 | Siblings are 76 to 80 unit blocks with fills between 0.03 and 0.10. Specks at 200px, a track dimmed below its siblings and a quarter of the canvas left as empty air are all invisible on the file and obvious on the montage | review | this file |
| R-07 | House idiom one: the accent is a `rect` with `fill="currentColor"` at `opacity="0.9"` INSIDE the block it belongs to, with the losers carrying the same bar at 0.3. Never a bright fill on a whole shape | review | this file |
| R-08 | House idiom two: **a poster carries no arrowhead by default.** Direction comes from the composition being closed, or from a dashed leg, or from a fill ramp. 97 of 108 have none | review | measured 2026-08-06 |
| R-08a | The exception, and it is earned rather than tolerated: **11 posters carry one light chevron or filled triangle, on the ones whose whole sentence IS a direction** that composition cannot say. 8 workloads (`rolling-update`, `graceful-shutdown`, `restart-policy`, `crashloopbackoff`, `statefulset-ordered-startup`, `pvc-stickiness`, `deployment-rollback`, `cronjob`) and 3 storage (`volume-attach-limits`, `volumeclaimtemplates`, `pvc-retention-policy`). A broken loop, a mirrored ramp and a follow-the-Pod are the three shapes that need it | review | measured 2026-08-06 |
| R-09 | **A poster carries no packet dot**: a ball frozen on a wire reads as a paused animation | review | this file |
| R-10 | No literal copy of the card diagram, no reused two-box layout, no plain "dumb circles" | review | root `CLAUDE.md` |
| R-11 | `FALLBACK_POSTER` in `js/app.js` breaks R-08 and R-09 on purpose. It is the shape shown when a card has no poster, `R-poster` guarantees that never happens, and nothing renders it today. Do not "fix" it into canon and do not delete it: it is the failure mode made visible | gate:check-canon R-poster | `js/app.js:404` |
| R-12 | Poster notes go to that category's `CARDS.md` under the card id as a `### poster` subsection, because `POSTERS` is keyed by card id. **Coverage is 108 of 108**, so a missing one is now a regression | review | the four `CARDS.md` |

## S: module structure

| ID | Rule | Check | Source |
|---|---|---|---|
| S-01 | `class Scene { constructor(host){ this.host=host; this.refs={}; this.build(); } build(){...} reset(){ this.build(); } }`, exactly once per card | gate:check-canon R-skeleton | `tools/check-canon.mjs:262` |
| S-02 | `export const init = makeInit(Scene, STEPS, { posterFirst: true });`, exactly once, in that exact form | gate:check-canon R-skeleton | `tools/check-canon.mjs:265` |
| S-03 | `build()` opens `this.host.replaceChildren(); this.refs = {};` | review | `scheme/CLAUDE.md` |
| S-04 | The root svg carries `viewBox: '0 0 1200 640'`, no exceptions. **Re-centre the content, do not move the camera.** A card builds it with `diagramRoot({ 'aria-label': '...' })` | gate:check-canon R-viewbox | `lib/scheme-kit.js`, `diagramRoot` |
| S-05 | `R-viewbox` REQUIRES a match: either a `diagramRoot(` call or a literal canon viewBox, and a card with neither is a finding. It used to check a literal only IF it found one, which would have retired the rule the day the root was hoisted, at exit 0. **A rule that is silent when its subject disappears is not a rule** | gate:check-canon R-viewbox | rewritten 2026-08-06 before the hoist, not after |
| S-06 | `preserveAspectRatio: 'xMidYMid meet'` and `data-style: 'outline'` come with `diagramRoot`. `arrowDefs()` stays in the card, appended first, because one card puts it on a content group rather than the root | review | `lib/scheme-kit.js` |
| S-07 | **Z-order**: body blocks, then wires and wire labels, then chips, then `packetLayer = g({ id: 'packetLayer' })` on top. Blocks that must sit above packets (top-row infra, the chain ladder) are appended AFTER the packet layer, and the z-order is stated in a comment | review | `scheme/CLAUDE.md` |
| S-08 | Pods are a `podShell()` plus inner `box()`es wrapped in a `g`, and the pulse target is that `g`. See M-03 | review | `lib/primitives.js` |
| S-08a | A card-local `podBlock(...)` keeps its GEOMETRY (48 cards, 39 different bodies) and ends with `return wrapPod(shell, innerBox);`. Two cards are out by construction: `storage-fsgroup-ownership` wraps three children, `storage-container-filesystem` wraps a shell wrapper | review | `lib/scheme-kit.js`, `wrapPod` |
| S-08b | A category kit binds its tint with `export const { pulsePod, pulsePodDim } = makeTintedPulses(<CAT>_TINT);`. The two bodies live once, in `scheme-kit.js` | gate:check-canon R-kitparity | `lib/scheme-kit.js`, `makeTintedPulses` |
| S-08c | **The `aria-label` stays an object key at the `diagramRoot` call site.** `check-terms` finds that prose by matching `'aria-label': '...'` in the SOURCE, so a positional argument would have taken all 108 sentences out of its input with no finding and no error. Verified across the hoist: 758 prose strings before and after | gate:check-terms | `tools/check-terms.mjs:50` |
| S-09 | **Step 0 is `id: 'idle'`, a pure reset, carries no `narration` and must not DRAW.** The poster shows step 1's text, so a slot-0 string is read by nobody and a slot-0 wire label or lit block sits under the panel text of the step AFTER it. Nothing checks this: if a slot-0 `enter()` is longer than the prologue plus its chip resets, look at what it puts on screen | review | `scheme/CLAUDE.md` |
| S-10 | **Every `enter()` opens with `resetStep(s);` and nothing before it** | gate:check-canon R-skeleton | `tools/check-canon.mjs:283` |
| S-11 | `resetStep(s)` is declared once per card as a line-initial `function`, and its body is fixed in shape: `s.refs.packetLayer.replaceChildren()` FIRST, then the card's own `clearHighlights(...)` and extras, then `clearWires(s)` LAST. Only the middle varies, which is why it stays per card | gate:check-canon R-skeleton | `tools/check-canon.mjs:270` |
| S-12 | No card declares `clearHL(s)`: the prologue fold replaced it | gate:check-canon R-skeleton | `tools/check-canon.mjs:271` |
| S-13 | After `resetStep` a step sets ALL chip values, wire labels and `.highlight` classes, and **pins final opacities inline**, so a cancel mid-step lands on the right value | gate:check-reduced | `scheme/CLAUDE.md` |
| S-14 | **The reduced-motion split is the load-bearing line.** Everything ABOVE `if (ctx.reduced) return;` is the complete static end-state; everything BELOW is motion | gate:check-reduced | `tools/check-reduced.mjs` |
| S-15 | **Never animate state that is not also pinned statically above the guard** | gate:check-reduced | `tools/check-reduced.mjs` |
| S-16 | `check-reduced` compares four axes: own opacity, INHERITED (effective) opacity multiplied down the ancestor chain, drawn wire text, and the `.highlight` set | gate:check-reduced | `tools/check-reduced.mjs` |
| S-17 | Whatever lights on ARRIVAL must also light on the REDUCED path, so the class goes in the guard body: `if (ctx.reduced) { s.refs.api.classList.add('highlight'); return; }` above, `lightBoxAt(s.refs.api, ctx, pkt.arrivalMs)` below | gate:check-reduced | `lib/scheme-kit.js`, `lightBoxAt` |
| S-18 | **When a block dies mid-step, take its highlight back in the fade's `onfinish`** rather than mirroring it onto the static path | review | `scheme/CLAUDE.md` |
| S-19 | A `.highlight` put on a Pod INNER BOX has to be cleared BY NAME in `clearHighlights`'s keys list. The `pods` argument runs `clearPodHighlight`, which resets inline stroke styles and touches NO class. Confusing the two is a leak no check in the gate sees | review | `INTERNALS.md`, `clearHighlights` |
| S-20 | **A folder holds exactly four kinds of `.js`**: its cards, its `<category>-kit.js`, its `cards.js`, its `posters.js` | gate:check-canon R-modulepath | `tools/check-canon.mjs:358` |
| S-21 | **A card imports its own kit and nothing past it**: `../../lib/svg.js`, `../../lib/primitives.js`, `./<category>-kit.js`. `lib/` holds only what every category shares | review | `scheme/CLAUDE.md`, listed under `check-canon`'s blind spots |
| S-22 | The four kits re-export the SAME list of names from `scheme-kit`. **The size of that list is not written down anywhere on purpose: `R-kitparity` is the source of truth.** It compares the four to each other, so a name added to one and not the rest fails immediately | gate:check-canon R-kitparity | `tools/check-canon.mjs:287` |
| S-23 | Adding a name to the kit surface is ONE edit across all four kits. The four lists are formatted differently enough that a single find-and-replace does not work | gate:check-canon R-kitparity | `INTERNALS.md`, `laneOf` |
| S-24 | `export * from './scheme-kit.js'` stays REJECTED. It would work and save lines, but the explicit list is what documents what a kit offers, and a card must never reach past its kit | review | `scheme/CLAUDE.md` |
| S-25 | `flashChips` is in the kit surface with zero callers. Do not call it, and do not drop the export without updating all four kits together | gate:check-canon R-kitparity | `INTERNALS.md`, `flashChips` |
| S-26 | **`defineCard` stays rejected.** What is left of the skeleton is four lines a card wrapping `build()` and `STEPS`, which are 100 percent per card. A factory would wrap 99 percent unique content to share a 1 percent frame, and it costs T-16 | review | `scheme/CLAUDE.md` |
| S-27 | Revisit S-26 only if `build()` stops being per card, or if `prose.mjs` learns to read a chip wrapper in another shape with a CONFIRMED count of 321 or better | review | `scheme/CLAUDE.md` |
| S-28 | **No top-level browser globals at module load**, except in `motion.js` and `app.js`. `svg.js`, `primitives.js`, `timeline.js` and `data.js` must parse cleanly in Node so the tools can read them | review | `scheme/CLAUDE.md` |
| S-29 | `svg.js` exports six names nothing imports today and they STAY: it is a library surface, not accumulated code. Do not read their absence from the import graph as a finding | review | `lib/svg.js:1` |
| S-30 | `lib/sidebar.js` is DUPLICATED with the `cli/` copy, not symlinked. Change one, change the other | review | `scheme/CLAUDE.md` |
| S-31 | A card module must pass `node --check` the moment it is written. The hook exits 2 and hard-fails the edit | hook | `.claude/hooks/check-js.sh` |
| S-32 | Every step is walked twice by the smoke, statically and really PLAYED, with zero console or page errors | gate:smoke-all | `tools/smoke-all.mjs` |
| S-33 | A missing import in a card throws a `ReferenceError` that `Timeline` swallows into `console.error`, so the step plays its first packet and silently stops. **Only `smoke-all` sees it. Run it after touching any card's imports** | gate:smoke-all | `INTERNALS.md`, `workloads-kit.js` note |
| S-34 | **A comment in a card is at most TWO lines.** It says WHAT the line beside it does or where a number came from. It carries no date, no past defect, no account of an earlier version | review | `scheme/CLAUDE.md`, where the record lives |
| S-35 | Anything longer than S-34 is not a comment: a rule true of one category goes to that folder's `CLAUDE.md`, a rule true of two or more goes here, a measurement or a rejected alternative goes to that card's `CARDS.md` section, and history goes to the bin | review | `scheme/CLAUDE.md` |
| S-36 | Each card carries exactly ONE pointer comment under its imports: `// Design notes for this card: ./CARDS.md#<id>` | gate:check-notes | `tools/check-notes.mjs` |
| S-37 | Notes on anything that is NOT one card go to `scheme/INTERNALS.md` under a `## <file path>` heading, and that file links back with one pointer near its top | gate:check-notes | `scheme/INTERNALS.md` |
| S-38 | **A note anchor is DATA: never reword one.** `check-notes` anchors each note to a line of code with ``### before `<line>` ``, 169 anchors today | gate:check-notes | `tools/check-notes.mjs` |
| S-39 | When a card is renamed, rename its `CARDS.md` heading too | gate:check-notes | `tools/check-notes.mjs` |
| S-40 | `scheme/tools/` scripts keep their headers rather than moving them to a record, because a standalone script's header is how you learn to run it. Capped at the same two to three lines | review | `tools/README.md` |
| S-41 | **Internal markdown never ships.** Four filenames (`CLAUDE.md`, `CARDS.md`, `INTERNALS.md`, `CANON.md`) plus `scheme/tools/`, excluded BY NAME in three places that must agree: `deploy.yml`, `release.yml`, `.dockerignore` | review | root `CLAUDE.md` |
| S-42 | Do not unify what VARIES between cards: the kit and pod tint, the `role` passed to primitives, block size, geometry, step count, connector style | review | `scheme/CLAUDE.md` |

---

## The record vocabulary

One list for all four `CARDS.md` files, so a label cannot mean one thing in `cluster/` and another
in `storage/`. A record uses the ones that apply, in this order, and adds none of its own.

| Label | Holds |
|---|---|
| `WHAT` | what the card draws, in one sentence |
| `LAYOUT` | the geometry that follows from the panel: tiers, columns, which `WL` layout |
| `PANEL` | the measured overlay extent for THIS card, per viewport, and what it pins |
| `SIZES` | a block or chip width, and the string that floors it |
| `LANES` | wire topology, and which array feeds both the wire and the ball |
| `MOTION` | pulse and packet order, durations where they were sized deliberately |
| `WIRE LABELS` | where a label may sit, when that is not obvious from the lanes |
| `CONTENT` | a technical claim checked against the reference, and the wording it forced |
| `BUDGET` | the narration or caption ceiling this card's geometry imposes |
| `NAMING` | why a block, a card or a string carries the wording it does |
| `SCOPE` | what this card deliberately leaves to a named sibling |
| `NOTE` | a placement or a value whose reason is not visible from the code |
| `WHY NOT` | an alternative that was measured and fails, with the number that kills it |
| `DO NOT` | a constraint, with the defect it prevents |
| `NOT A DEFECT` | something a lint or a reader reports that is correct as drawn |
| `OPEN` | known and unresolved, with the measurement and the reason it stays open |

Structural rules for a record file, all of them enforced by `check-notes`:

| ID | Rule | Check | Source |
|---|---|---|---|
| S-43 | Every `## ` heading in a `CARDS.md` is a CARD ID and nothing else. A second-level heading anywhere else is reported as an orphan, which is why the preamble headings are bold text rather than `##` | gate:check-notes | `tools/check-notes.mjs:63` |
| S-44 | A card's section must be in ITS OWN category's file. A section filed in the wrong one is named as `MISFILED`, not as a missing file | gate:check-notes | `tools/check-notes.mjs:59` |
| S-45 | Every card has a section. A card with no design record is how a measurement gets lost | gate:check-notes | `tools/check-notes.mjs:80` |
| S-46 | A `## <path>` section in `INTERNALS.md` resolves to a real file under `scheme/`, and each of its ``### before `<line>` `` anchors must still occur in that file | gate:check-notes | `tools/check-notes.mjs:34` |
| S-47 | **This file has to tell the truth about itself.** A row claiming `gate:<check>` names a check the chain really runs, no id is used twice, no id block skips a number, and every check in the gate is cited by at least one rule. Otherwise the rulebook drifts from the harness the way one number once drifted across six files | gate:check-canonrows | `tools/check-canonrows.mjs` |

---

## Category-scoped rules

Category rules do NOT live here. The folder is the unit of context and splitting it would break that.
They keep the same id shape with a category prefix, and this is their index.

**The test for where a rule belongs: anything that would be a DEFECT if it differed between two
categories is catalog-wide and belongs above. A pointer is not duplication, a paragraph is.**

### `CLU.*` cluster, `js/schemes/cluster/CLAUDE.md`

| ID | Rule |
|---|---|
| `CLU.C-01` | Violet tint `rgb(192, 176, 255)` / `rgb(224, 214, 255)`. Chrome colour `#7d86ff` indigo is a different value for a different job |
| `CLU.S-01` | Exemplar `cluster-scheduler-decision.js`: a top-row request/persist arrow strip over the control-plane actors, Node frame below |
| `CLU.L-01` | The Node frame family geometry (L-23) is used by more cluster cards than by any other category, and `cluster-node-drain.js` is the reference for it |
| `CLU.D-01` | Subcategory split: `control-plane` (API server, scheduler, controller-manager, ETCD behaviour), `node-runtime` (Kubelet and runtime in steady state), `node-lifecycle` (a Node changing state under pressure or command). The line between the last two is "is the Node still healthy" |

### `WL.*` workloads, `js/schemes/workloads/CLAUDE.md`

| ID | Rule |
|---|---|
| `WL.C-01` | Sky blue tint `rgb(91, 184, 255)` / `rgb(142, 198, 247)` |
| `WL.L-01` | The `WL` X grammar all 19 cards share, exported from `workloads-kit.js`. Y values stay per card |
| `WL.L-02` | Columns are left `60..540` and right `660..1140`, both 480 wide. Node frame full width, actor row centred on `CX` and starting no further left than 420 |
| `WL.L-03` | A / B / C: pick the first that fits vertically against THAT card's measured panel bottom. **B (chips left, ladder right) is the common case, not A** |
| `WL.L-04` | C puts chips in a full-width bottom strip **two or three per row** (532 or 350.7 wide). Never four or five: 258 and 205 are narrower than the strings, and that produced 79 chip collisions |
| `WL.L-05` | The trunk runs in the `540..660` corridor, so the actor box it leaves is centred on `WL.SPINE_X`. That is why several cards carry a first actor box of `420..780` |
| `WL.A-01` | The top-row lane PAIR: `REQ_Y = TOP_CY - LANE_DY` out, `RESP_Y = TOP_CY + LANE_DY` back. 17 cards draw the pair, 6 ride the answer. Whether the answer lane is an arrow or a relation is A-06 |
| `WL.A-02` | The top-row wire label sits ABOVE the actor row at `WL.TOP_Y - 12`, never below, where it lands on the lane and across the spine's step. Nine cards carry the constant identically |
| `WL.S-01` | Exemplar `workloads-probes.js`: a vertical down/up connector driven with `setConnectorDir`. Each card owns its own `SPINE` points array, and there must be no shared connector helper |
| `WL.D-01` | Subcategory split: `pods-bootstrap`, `pods-lifecycle`, `controllers`. The line between the first two is whether the app container has started |

### `NET.*` networking, `js/schemes/network/CLAUDE.md`

| ID | Rule |
|---|---|
| `NET.C-01` | Cyan tint `rgb(79, 229, 255)` / `rgb(158, 234, 247)`, and the one category colour that is a LITERAL in `diagrams.css`. See C-21 |
| `NET.S-01` | A Pod is `podShell(...)` plus an inner `box(...)` (app, eth0) in one `g`. Client, kube-proxy, CoreDNS, a bridge and a NIC are infrastructure: they light, they do not pulse |
| `NET.A-01` | Every endpoint sits on a block EDGE. See A-19 |
| `NET.A-02` | **Traffic is delivered TO A NODE.** A ball stops on the Node frame edge and the Pod inside pulses to show it was served. No wire and no ball crosses a Node border |
| `NET.A-03` | N destinations get N wires, and the unridden legs are NOT a defect. See A-04 |
| `NET.T-01` | Addresses ride the ball (`ridingLabel`), never as inline wire text: a dst like `203.0.113.9:443` overflows an 80 unit gap and prints through a block border |
| `NET.S-02` | `resetStep` must list the inner app boxes BY KEY. See S-19 |
| `NET.S-03` | Exemplar `network-service-clusterip.js`: parallel forward and return flow lanes plus a right-angle fan |
| `NET.D-01` | Subcategory split: `network-foundations`, `pod-networking`, `services-endpoints`, `external-traffic`, `dns-service-discovery`. The line between the middle two of the last three is WHERE THE CLIENT IS, not which object appears |

### `STO.*` storage, `js/schemes/storage/CLAUDE.md`

| ID | Rule |
|---|---|
| `STO.C-01` | Jade tint `rgb(94, 202, 148)` / `rgb(174, 224, 199)`, hue 150 at 50 percent saturation. See C-23 |
| `STO.L-01` | The grammar is a VERTICAL STACK on a spine, not the left-to-right pipeline the other three use: Pod on top, backing volume below as a `cylinder()` disk |
| `STO.L-02` | A cylinder's label is re-centred on the visible front face by setting `y: 64` on `.scheme-cylinder-label`. Derive the offset from the cylinder height rather than typing the literal |
| `STO.L-03` | `CHIP_W 232` is the family default with `CHIP_GAP 16` |
| `STO.A-01` | A dim, arrowhead-less IDENTITY SPINE at the centre x. Nothing travels it |
| `STO.A-02` | One L-shaped MOUNT LANE per container, dropping from the container into the cylinder SIDE, written in its one traffic direction. One-way gets one lane, a round trip gets a lane each way |
| `STO.C-02` | **No `.highlight` on an inner CONTAINER box inside a Pod**, or the Pod keeps a lit rectangle after its blink decays. This is the storage reading of S-19: cylinders, bands, frames, controllers and claims are infrastructure and do light |
| `STO.S-01` | `setStage` / `setBorn` pins EVERY element born or removed mid-story, and every lane, exactly as `setChips` pins every chip. **A block and its lanes are ONE construction and appear together** |
| `STO.S-02` | Z-order bottom to top: frames, blocks and disks, Pods (so they sit above their own frame), lanes and captions, chip strip, packet layer |
| `STO.S-03` | Exemplar `storage-volume-model.js`, the anchor card, including the Pod pulse model |
| `STO.D-01` | Subcategory split: `volume-foundations`, `volumes-claims`, `csi-mount-path`, `stateful-data`. The line between the middle two is whether the card's subject is an API object or a Node-side action |

---

## Known deliberate exceptions

Not defects. Each is a rule broken on purpose, with the reason and the number that made the call.

| What | Why it stands |
|---|---|
| `FALLBACK_POSTER` breaks R-08 and R-09 | R-11 |
| `dim` losing to `role` on an arrow | A-18. Implemented and reverted the same day: 94 of 103 cards changed and the networking exemplar's fan went grey |
| `flashChips` exported with zero callers | S-25 |
| Six `svg.js` exports with no importer | S-29 |
| No module constant declares a number nothing reads. **Zero, catalog-wide** | 47 were removed on 2026-08-06. The last five were named by a neighbouring comment or by their card's record, so each deletion also reworded the referent: an axis is stated as the literal 600, a pitch as a two-line comment on the block it spaces. A dangling name is worse than a dead line, so the two always move together |
| Header chrome duplicated three ways (`cli/js/app.js`, `scheme/js/app.js`, inline in the root `index.html`): `renderHeaderActions` at 86 lines, plus `fallbackCopy`, `closeAllDropdowns` and the icons, about 240 lines | Deliberate. Each path prefix stays self-contained, which is the reason the duplication exists |
| `cli/css/styles.css` (227 rules) and `scheme/css/styles.css` (217 rules) share 63 selectors with a byte-identical body | 22 more share a SELECTOR with a DIFFERENT body (`html`, `body`, `.card`, `.footer`, `.cat-btn`, `.logo`, `.section-header` and others), so cascade order decides. Merging is a real visual risk. Measured 2026-08-06 |
| 17 `OPEN` findings across the four records | L-16. Each carries its own measurement and the reason the rule can only be satisfied by making the picture worse |
| 11 ambiguous label pairs | T-14 |
| 18 unresolvable chip writes | T-17 |
