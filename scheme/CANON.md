# CANON.md: the card rulebook

Every rule that is true of a scheme card CATALOG-WIDE, one row each, with a stable id. Load it when
you design, build, review or repair a card. It is **not** auto-loaded: `scheme/CLAUDE.md` is the
contract a folder hands you, this is the rulebook that contract points at.

This file holds RULES ABOUT A CARD. Two neighbouring bodies of knowledge live elsewhere and are not
repeated here:

- **Process**: working discipline, commit cadence, scope discipline, how a mass text pass is
  verified, what the container does and does not prove. Root `CLAUDE.md`.
- **The harness**: what each test catches and what it is BLIND to. That lives in the HEADER of the
  test file itself, which is the only copy: `scheme/test/unit/`, `render/` and `report/`. What runs
  is `scheme/test/package.json`, where it executes. `scheme/test/tools/` holds three probes that
  are NOT checks: `settled-dump.mjs`, `buildframe.mjs` and `canon.mjs`, each documented in its own
  header. `canon.mjs` queries THIS file: `--check=review` is the subset a human is the only machine
  for, which is what a card review is for.

A rule here is a rule you should KNOW, not a rule you must obey. The concept of a card is not
constrained: a new card may break a row deliberately, and the way to do that is to write the reason
into its section of that category's record. What is not allowed is breaking one by
accident.

## How to read a row

| Column | Means |
|---|---|
| `ID` | stable. Cite it in a review, a card note or a commit message. Ids are never reused |
| `Rule` | ONE line, stated as the thing that must be true. Where the argument behind it runs longer, the row keeps the rule and the argument moves to "The long form" at the end of this file, under the same id |
| `Check` | who enforces it, see below |
| `Source` | where the long form, the measurement or the implementation lives. **A file, never a line number**, because line numbers drift. Both columns are machine-read: the `Check` column by group E, and every repo path cited here by `C4`, which resolves all 202 of them |

The `Check` column takes exactly four values, and it is the most useful column in the file. It
names a TEST, not a tool: the script harness is gone and `scheme/test/` replaced it.

| Value | Means |
|---|---|
| `test:<file>/<name>` | `cd scheme/test && npm test` fails. Cannot land broken |
| `report:<file>/<name>` | a test measures it and prints it, and does not fail on it. Read a finding against the card note before calling it a regression |
| `hook` | `.claude/hooks/check-js.sh` fires on write and can hard-fail the edit with exit code 2 |
| `review` | no machine anywhere. A human is the only thing between this rule and a defect |

`<file>` is the test file's basename without `.test.mjs`, and the basenames are unique across the
three directories: `unit/` and `render/` are what `npm test` runs, `report/` is what `npm run report`
runs and it never fails. `<name>` is the label that run PRINTS for this rule: an axis (`DIAGONAL`,
`PHASE`, `SPREAD`) where the file has one, otherwise the rule id, which is how the file's own header
names it. A row may carry more than one value, comma separated, and may name a file with no `/<name>`
when the whole file is the answer.

**`report:` on a `render/` or `unit/` file is not a contradiction**, it is the honest reading, and
11 rows use it. Seven belong to the `M` block: `render/motion.test.mjs` measures and PRINTS them on
a green run and asserts nothing, because the data cannot carry the claim (`BEAT.afterPulse` and
`BEAT.lead` are the same number, so no probe can say which of the two a delay came from). A census
that is printed and a rule that is enforced are different things, and the column says which is which.

`unit/docs.test.mjs` group E is what keeps this column honest: every `test:` and `report:` value has
to name a file that exists, a `test:` value has to name a file `npm test` really runs, the name has
to occur in that file, and every test file has to be cited by at least one rule.

Poster rules are `R-01` to `R-12`, two digits. `R-<word>` is a different namespace, told apart by
the shape of the suffix: it names an AXIS a test prints, never a rule row in this file. The suite
prints eleven of them, and the five cited here resolve to `unit/catalog.test.mjs` (`R-srcdup`,
`R-srclabel`, `R-poster`), `unit/module.test.mjs` (`R-kitparity`) and BOTH `unit/catalog.test.mjs`
and `unit/text.test.mjs` for `R-dash`, which runs over two different inputs: the catalog's own
strings, and the file list `dashTargets` names.

## The numbers this file is written against

116 cards: cluster 28, workloads 20, network 37, storage 31. 704 steps. Re-measure before trusting
any figure below that carries a date-free absolute, and if you change one, change it here.

---

## L: layout and the narration panel

| ID | Rule | Check | Source |
|---|---|---|---|
| L-01 | The safe-zone is an L, not a forbidden box: the overlay covers the top-left quadrant only, so the usable area is the full width below its bottom PLUS the full height right of its right edge | review | this file |
| L-02 | The narration panel's RIGHT edge is `x<=397` on every card, on every viewport. Measured: worst 396.55, `cluster-architecture` at 1100x800 | report:overlay/L-02 | `test/report/overlay.test.mjs` |
| L-03 | Nothing starts left of x=420 unless it also sits below that card's own panel bottom | review | L-02 |
| L-04 | The panel BOTTOM is per card and ranges 90 to 504 over the standard viewport set. Deepest 503.13 (`workloads-pod-phase-machine`, 1100x800, step 5). The shallow end is a CLUSTER many cards share, not one card | report:overlay/L-04 | measured over all 110 cards |
| L-05 | The panel moves NON-MONOTONICALLY against the PICTURE and one way only against the VIEWPORT, so it is never measured on one viewport | report:overlay/L-05 | `test/report/overlay.test.mjs` |
| L-05a | **It is a TYPOGRAPHY problem, not a height problem**: clamping the height does not touch it, and closing it needs type that scales with the diagram | report:overlay/L-05a | measured 2026-08-07, `scheme/css/styles.css` under `.narration-overlay` |
| L-05b | The panel ALSO changes height between the STEPS of one card, so the diagram area under it moves while the card plays. Pinning `min-height` to the tallest narration is DECLINED | review | measured 2026-08-06, `scheme/css/styles.css` under `.narration-overlay` |
| L-06 | The standard viewport set is `1600x1000`, `1280x860`, `1100x800`. A card may pin a stricter row of its own (storage cards carry `900x650`), and where the two disagree the card takes the stricter number and says so | report:geometry-soft/L-06 | `test/report/geometry-soft.test.mjs`, `VIEWPORTS` |
| L-07 | A card's measured panel extent lives in its HEADER COMMENT, never in a constant: the reserved corner is a fact about the panel, not an input to the layout | review | this file, X4 |
| L-08 | The panel bottom is often a CHARACTER BUDGET, and editing prose for accuracy spends it silently. Re-measure after any prose edit on such a card | report:overlay/L-08 | `test/report/overlay.test.mjs` |
| L-08a | **A card that carries a two-column X grammar picks the first of `A` / `B` / `C` that fits above its OWN measured panel bottom**, and reads the columns out of its kit's `LAYOUT` rather than typing them | test:module/L-08a | `js/schemes/workloads/CLAUDE.md` `WL.L-06`, `js/schemes/cluster/cluster-kit.js` |
| L-09 | A segment is horizontal or vertical. Nothing runs diagonally | test:geometry/DIAGONAL, test:spec-scene/DIAGONAL | `test/render/geometry.test.mjs` |
| L-10 | No segment crosses a block it does not terminate on | test:geometry/THROUGH, test:spec-scene/THROUGH | `test/render/geometry.test.mjs` |
| L-11 | An endpoint sits on a block FACE MIDPOINT, never a hand-typed coordinate near one | test:geometry/OFFEDGE, test:spec-scene/OFFEDGE | `test/render/geometry.test.mjs` |
| L-12 | Two endpoints on ONE face at mirrored offsets (`+d` and `-d`, any `d`) are a deliberate lane pair and not a finding, pooled across all steps because a pair whose halves live in different steps is still a pair | test:geometry/OFFEDGE, test:spec-scene/OFFEDGE | `test/render/geometry.test.mjs` |
| L-13 | The content bbox centres within 40 units of x=600, and the chip strip within 6 | report:geometry-soft/CENTRE | `test/report/geometry-soft.test.mjs` |
| L-14 | Blocks sitting BELOW the overlay centre on x=600 too: the full width is free there | report:geometry-soft/CENTRE-LOW | `test/report/geometry-soft.test.mjs` |
| L-15 | No block sits substantially under the narration panel | report:geometry-soft/OCCLUDED | `test/report/geometry-soft.test.mjs` |
| L-16 | **Do not close a `CENTRE` finding by stretching a strip or widening a frame.** If a finding can only be closed by making the picture worse, leave it OPEN and write the reason into the card's record | review | the four `CARDS.md`, and `test/report/geometry-soft.test.mjs` for the finding count. Soft geometry counted 2026-08-07. The `OPEN` census is counted from the four records |
| L-17 | `CENTRE` and `CENTRE-LOW` count neither `node()` frames nor chips, so a card balanced by a frame full of chip rows still reports. Read a finding against the card note before treating it as a regression | report:geometry-soft/L-17 | `test/report/geometry-soft.test.mjs` |
| L-18 | Never set `font-size` as a presentation attribute on a label: it never renders, so a clearance budget sized off it is wrong. Add a class in `diagrams.css` instead | test:files/L-18 | `scheme/css/diagrams.css` |
| L-19 | Nothing in the suite measures WIRE-LABEL width. `render/chipfit.test.mjs` measures chips only | review | `test/render/chipfit.test.mjs` |
| L-20 | Text rates are PER CLASS and are MEASURED, never estimated | review | `js/schemes/storage/CLAUDE.md` |
| L-21 | **Await `document.fonts.ready` before measuring anything in the DOM**, or you measure the fallback, which is about 20 percent narrower and flatters you. Never eyeball a width off a screenshot | test:geometry/L-21, test:chipfit/L-21 | root `CLAUDE.md` |
| L-22 | A card that needs room should check L-01 first: on a cramped card the room is usually already there | review | this file |
| L-23 | **A Node frame around Pods is sized per CATEGORY, and there is no catalog-wide family.** Take the numbers from the category record, and clear the frame label whatever they are | review | measured catalog-wide 2026-08-27, 75 frames on 59 cards |
| L-24 | Growing a Node frame to match its category family grows it UPWARD if the bottom stays at 624, so re-check the gap to whatever sits above | review | L-23 |

## A: arrows, lanes, wires, connectors

| ID | Rule | Check | Source |
|---|---|---|---|
| A-01 | Every ball rides a DRAWN wire. No ball travels over blank canvas | review | this file |
| A-02 | The SAME points array feeds the static wire and the packet route, so the two cannot drift | test:lane-shared/A02-SHARED, report:lane-traffic/A-02 | `scheme/CLAUDE.md`, card construction standard |
| A-03 | Return traffic gets its OWN lane, offset by the card's lane delta. A return re-using the outbound arrow reads as the query bouncing, not as an answer coming home | review | this file |
| A-04 | One wire per destination. N destinations get N wires, drawn even when a step takes one, so the reader sees the choice was made among drawn alternatives | review | `js/schemes/network/CLAUDE.md` |
| A-05 | **A wire nothing rides carries no arrowhead.** Use `relationPath({ points, d, role, dash })`: both `arrow()` and `pathArrow()` always attach a marker, and a marker with no traffic under it reads as traffic | test:lane-shared/A05-CARRIED, report:lane-traffic/A-05 | `lib/scheme-kit.js`, `relationPath` |
| A-06 | **Which of the two a lane IS is decided by the step's own words**: if a step NAMES something travelling that way it earns a ball, otherwise it is a relationship | review | `js/schemes/workloads/CLAUDE.md` |
| A-07 | Audit lane style by grepping `class: '...scheme-arrow`, not `arrow(`: a copy spelled with `line()` loses the dash and the dim and draws brighter than the lanes that carry balls | review | this file |
| A-08 | `relationPath` carries `scheme-arrow-relation`, which the CSS gives `stroke-opacity: 0.45` rather than a darker literal | review | `scheme/css/diagrams.css`, the relation note |
| A-09 | **A lane leaves the box that ACTS**, which on a control-plane card is almost never the leftmost box | review | `js/schemes/workloads/CLAUDE.md`. `workloads-force-deletion` is the model |
| A-10 | Where two actors reach one slot, draw TWO lanes over a shared drop rather than picking a winner | review | `js/schemes/workloads/CLAUDE.md` |
| A-11 | Moving a lane is a TIMING change, because `routeDur` is length-based: moving a start 300 to 400 units right adds 250 to 870ms per ball. Raise the duration, never shorten the motion | test:duration/A-11 | `lib/scheme-kit.js`, `HOP_MS` note |
| A-12 | A box can be DERIVED FROM a lane (`KUBECTL_X = SPINE_X - BOX_W / 2`), so redefining the spine moves the box instead of the lane. Such a card needs its own constant | review | `js/schemes/workloads/CLAUDE.md` |
| A-13 | **A lane's shade is `min(source, sink)`**, never one end alone. Deriving from one end is how the catalog came to draw a full-strength arrow out of a Pod that was a ghost at 0.12 | test:opacity/PHASE | `lib/scheme-kit.js`, `laneOf` |
| A-14 | A lane whose far end is GONE goes to 0, not to a dim shade: a block leaves a hole when it vanishes so it dims instead, but an arrow into nothing leaves no hole and reads as a rendering fault | review | `lib/tokens.js`, `OPACITY` note |
| A-15 | **A lane carrying a ball must be visible for the whole flight**: pin its final value above the `ctx.reduced` guard, then animate the fade below it | test:reduced/OPACITY-OWN | `lib/tokens.js`, `OPACITY` note, rule 3 |
| A-16 | A block's opacity and its lanes' opacity are stated in ONE place: a card-local `stage()` factory returning the whole `opacity` field, never two independent entries | review | `lib/tokens.js`, `OPACITY` note, rule 1 |
| A-17 | `arrow()` and `pathArrow()` take `role` explicitly. Arrows carry `data-role` and are colour-checked | test:palette/SPREAD | `lib/primitives.js` |
| A-18 | `dim` on an arrow is a stroke WEIGHT, not a lifecycle state: the role wins the stroke and `dim` survives as `stroke-width: 1.4` | review | `scheme/css/diagrams.css`, the `dim` decision note |
| A-19 | A ball never travels under or over a block: every endpoint sits on an EDGE, so a rewrite INSIDE a box (DNAT, SNAT, port remap, conntrack) is drawn as a fade at one edge and a re-emergence at the far edge | review | `js/schemes/network/CLAUDE.md` (`NET.A-01`) |
| A-20 | **`relationPath` defaults NEITHER `role` NOR `dash`**, so a call that omits one renders without it: no role suffix drops the stroke to the generic fallback instead of the category hue, and no `dash` draws a solid relation | review | `lib/scheme-kit.js`, `relationPath` |

## M: motion

| ID | Rule | Check | Source |
|---|---|---|---|
| M-01 | **Only Pods pulse.** Block auto-pulse is off catalog-wide (`autoPulse: false` is the `makeInit` default). Infrastructure lights through `.highlight` or `lightBoxAt` and never pulses. **This row outranks `M-27`**, and the long form says why | test:motion/PULSE-POD | `lib/timeline.js`, `lib/scheme-kit.js` |
| M-02 | A card never calls `pulse(` from `primitives.js` directly. Pods pulse through the kit's `pulsePod` | test:motion/PULSE-KIT | `test/render/motion.test.mjs` |
| M-03 | **A Pod pulses with everything inside it.** The pulsed element is always the `g` holding the shell AND its inner boxes | test:motion/PULSE-WHOLE, test:motion/PULSE-TOGETHER | `lib/scheme-kit.js`, `pulsePodWithTint` |
| M-04 | Pulse is `filter: brightness(...)`, never `transform: scale(...)`: diagram elements carry a `translate` a scale would compose-clobber | review | `lib/scheme-kit.js` |
| M-05 | The pulse `base` must equal the Pod's RESTING stroke. Measure it under `reducedMotion`, or a forwards-filled pulse hands you back its own end state | test:palette | `lib/tokens.js`, `PULSE_POD` |
| M-06 | Pod pulse is 900ms (450 up, 450 down), bright 1.4, dim peak 0.8. One length, catalog-wide, with no per-card override | test:motion/PULSE-SHAPE | `lib/tokens.js` `PULSE_POD` |
| M-07 | A DIM Pod needs `pulsePodDim`: the ordinary pulse plus an opacity lift to `PULSE_POD.dimPeak` and back, or the blink is invisible against the 0.55 it sits at | review | `lib/scheme-kit.js`, `pulsePodDimWithTint` |
| M-08 | **Where a Pod both pulses and fades out in one step, the pulse comes FIRST**: pulse delay `<=` fade delay, or the two read as one event | test:opacity/ORDER, report:pod-fade/M-08 | `test/render/opacity.test.mjs`, `test/report/pod-fade.test.mjs` |
| M-09 | **Packets animate `transform: translate(Xpx, Ypx)`** on a `cx=0, cy=0` circle, never SVG `cx`/`cy` | test:motion/TRANSFORM | `lib/scheme-kit.js`, `packetAlong` |
| M-10 | **Each packet must represent literal traffic the step narrates**, not decoration on a connector | review | this file |
| M-11 | Three packet flavours and no fourth: in-diagram hops `segmentPacket` (linear), right-angle routes `routePacket` (eased, distance-normalized), top-row request/ack hops `topPacket` (eased) | review | `lib/scheme-kit.js` |
| M-12 | **Routes take no explicit `dur`.** Travel time comes from path length at 0.45 units per ms, so a ball moves at one speed everywhere. An explicit `dur` is reserved for narrative pacing and needs a one-line justification at the call site | test:motion/SPEED | `lib/scheme-kit.js`, the `HOP_MS` speed-canon note |
| M-13 | `routeDur` clamps to `[700, 2600]`, so from about 24 to 314 units the pace is flat. Tune pacing there, in one place | test:motion/CLAMP | `lib/scheme-kit.js` |
| M-14 | Every packet ripples at its destination. The delivered cue is part of the arrival canon with no per-call opt-in, and the ripple carries `.scheme-ripple` rather than `.scheme-packet` so anything counting packets sees ONE ball per hop | test:motion/ARRIVE, test:ripple-single/RING-SINGLE, report:ripple-double/SIMULTANEOUS | `lib/scheme-kit.js`, `arrivalRipple` |
| M-15 | **Up-arrow (Pod to infra): `pulsePod(..., 0)` first, packet leaves at `BEAT.afterPulse`** (800, just under the 900 blink). That 800 is the same number as `BEAT.lead`, which is why M-18 says no probe can tell the two apart | report:motion/BEAT | `lib/tokens.js`, `BEAT` |
| M-16 | **Down-arrow (infra to Pod): packet first, `pulsePod(..., pkt.arrivalMs)` on arrival** | report:motion/BEAT | `lib/tokens.js`, `BEAT` |
| M-17 | Chained hops: `delay: prevHop.arrivalMs + BEAT.afterHop` (100). **Never hard-code a delay** | report:motion/BEAT | `lib/tokens.js`, `BEAT` |
| M-18 | A controller that self-initiates with no preceding hop or pulse waits `BEAT.lead` (800), so the lit source registers before the ball leaves | report:motion/BEAT | `lib/tokens.js`, `BEAT` |
| M-19 | A step must OUTLAST its own motion: `span <= duration`. Fix an overrun by raising `duration`, never by shortening motion | test:duration/M-19, test:spec-steps/M-19 | `test/render/duration.test.mjs` |
| M-19a | The OTHER side of M-19: a step also stands STILL for `duration - span`, and that is not a free variable either | review | `.claude/skills/card-review/tools/deadair.mjs` |
| M-20 | **Geometry changes are timing changes**, because `routeDur` is length-based. After ANY geometry change re-check the span of EVERY step, not just the one you moved | test:duration/M-20 | `test/render/duration.test.mjs` |
| M-21 | A Pod materialises over `FADE.in` (600, ease-out) and dissolves over `FADE.out` (700, ease-in). A narrative-slow fade keeps an explicit duration with a justification at the call | report:motion/FADE | `lib/tokens.js`, `FADE` |
| M-22 | A newborn construction reveals over `REVEAL_MS` (500), which runs BEFORE the ball leaves (`BEAT.lead` is 800), so a block and its lanes are fully present by the time anything is sent down them | report:motion/FADE | `lib/scheme-kit.js`, `REVEAL_MS` |
| M-23 | `revealAt` must not short-circuit on `delay <= 0` straight to opacity 1: nine card-local copies did, which silently played no fade AND threw `from` away. Under `ctx.reduced` it snaps to full, never otherwise | review | `lib/scheme-kit.js`, `revealAt` |
| M-24 | `revealAt`'s `from` is the shade an object rests at while a lane already points AT it. Hiding it outright aims the arrowhead at blank canvas for the whole flight | review | `lib/scheme-kit.js`, `revealAt` |
| M-25 | `animateAlong` honors `options.delay`. A bug dropping it made packets teleport invisibly during the delay window. Do not regress it | report:motion/BEAT | `lib/primitives.js` |
| M-26 | **Value chips NEVER flash**, and neither does the block a value is about: a changed value is cued as a STATIC highlight (`P-05`) | test:spec-steps/M-26 | this file, P-05. `test/render/motion.test.mjs`, `test/unit/spec-steps.test.mjs` |
| M-27 | A packet-less, pod-less step carries its beat with `.highlight` ALONE. **`F.flash` is not a second option**: `flashChips` animates `filter: brightness`, which `M-04` calls a pulse and `M-01` forbids on infrastructure | test:spec-steps/M-26 | `lib/step-spec.js`, `flash`. `lib/scheme-kit.js`, `flashChips` |
| M-28 | **`lightBoxAt` and `at` use an EMPTY keyframe list, and that is load-bearing.** Naming `opacity` composites the target for the whole delay window | test:motion/TIMER | `lib/scheme-kit.js`, `lightBoxAt`. Confirmed with CDP LayerTree, where `g.scheme-box 222x82` enters the layer list mid-flight and is gone after, and NEVER by pixel diff: headless software rendering blends both ways identically and shows nothing |
| M-29 | Grep for `animate([{ opacity: 1 }, { opacity: 1 }]` to check M-28 has not come back | test:motion/TIMER | `lib/scheme-kit.js`, `lightBoxAt` |
| M-30 | **A riding label's easing and any explicit `dur` must match the ball it rides.** Compare the two animations' `easing` | test:motion/RIDE | `lib/scheme-kit.js`, `makeRidingLabel` |
| M-31 | A riding label is pinned at the route START at build, or it sits at the SVG origin until `animateAlong`'s delay elapses and its fade-in plays in the top-left corner under the narration panel | test:motion/RIDE | `lib/scheme-kit.js` |
| M-32 | `ridingLabel` binds its per-card constants ONCE at module scope through `makeRidingLabel({ role, dy, dx, easing, inMs, outMs, hold, emergeMode })`. Never write a local copy of it, of `lightBoxAt` or of `at` | review | `lib/scheme-kit.js` |
| M-33 | Every animation goes through `ctx.register(...)`, so a step change cancels it | review | `lib/timeline.js` |
| M-34 | An added hop costs about 800ms (a short gap sits on the 700 floor plus `BEAT.afterHop`), so `duration` usually has to rise and `render/duration.test.mjs` says by how much | test:duration/M-34 | `lib/tokens.js`, `BEAT` |
| M-35 | **A SEEK cannot see a deferred effect**: `seekStep` sets `currentTime` and never fires `onfinish`, so every `at(...)` turnover, every `lightBoxAt` arrival class and every deferred `setWire` is missing from any frame it hands back | review | `test/fixtures/render.mjs`, `seekStep` |

## C: colour, roles and the opacity vocabulary

| ID | Rule | Check | Source |
|---|---|---|---|
| C-01 | **`role` is a palette slot, not the card's category.** A workloads card writes `role: 'cluster'` on its kubelet box on purpose | test:palette/UNKNOWN | `scheme/CLAUDE.md` |
| C-02 | **`role` is bound ONCE, in the category kit, and writing one at a call site is an OVERRIDE rather than a default.** See S-42 | test:palette/UNPAINTED | `lib/scheme-kit.js`, `valChip` |
| C-03 | One `(category, element class, role, state)` tuple resolves to ONE colour. `render/palette.test.mjs` catches a role that resolves inconsistently, NEVER a role that was the wrong one to ask for | test:palette/SPREAD, report:palette-steps/CONFLICTING | `test/render/palette.test.mjs` |
| C-04 | Every opacity between 0 and 1 comes from `OPACITY` in `tokens.js`, so a shade learned on one card reads correctly on the next. A bare `0` or `1` is fine | test:opacity/PHASE, test:skeleton/C-04 | `lib/tokens.js` |
| C-05 | `OPACITY.running` 1.00: in focus and working | test:opacity/PHASE | `lib/tokens.js` |
| C-06 | `OPACITY.pending` 0.55: declared, not working yet | test:opacity/PHASE | `lib/tokens.js` |
| C-07 | `OPACITY.notready` 0.40: alive but not serving, not observed, or outside this path | test:opacity/PHASE | `lib/tokens.js` |
| C-08 | `OPACITY.terminating` 0.25: `deletionTimestamp` set, eviction or shutdown under way | test:opacity/PHASE | `lib/tokens.js` |
| C-09 | `OPACITY.terminated` 0.12: gone from the API, or finished | test:opacity/PHASE | `lib/tokens.js` |
| C-10 | A pulse peak (`PULSE_POD.dimPeak`) is a motion magnitude and a presentation shade belongs in CSS. Neither is a phase: do not force them into the vocabulary | test:opacity/PHASE | `lib/tokens.js` |
| C-11 | Nothing holds `.highlight` while it sits at the terminated shade | test:opacity/LIT | `test/render/opacity.test.mjs` |
| C-12 | `render/opacity.test.mjs` judges the RESOLVED value in the browser rather than the source expression | test:opacity/PHASE | `test/render/opacity.test.mjs` |
| C-13 | A LANE has no phase of its own and is not in the vocabulary. See A-13 | test:opacity/PHASE | `lib/tokens.js` |
| C-14 | **A block that does not exist yet DIMS, it is not cut out.** Cutting an absent block leaves a block-sized hole that reads as a rendering fault, so draw it dim with a sublabel saying so | review | this file |
| C-15 | **`data-cat` is chrome, `data-role` is diagram. Never merge them back.** `styles.css` selects the former, `diagrams.css` the latter, and the two files do not cross | review | `scheme/css/` |
| C-16 | A tinted category declares FOUR opaque colours as CHANNEL LISTS (`--tint-deep-rgb` / `-base-rgb` / `-bright-rgb` / `-canvas-rgb`) plus three hand-mixed surface fills, and nothing else | review | `scheme/css/styles.css` |
| C-17 | Channel lists rather than hex, because `rgba()` cannot take a hex through a `var()` | review | `scheme/css/styles.css` |
| C-18 | **Every shade WITH an alpha is derived ONCE in the shared `[data-tinted="true"]` block.** Adding a shade is one line there, never four. Restating alpha per category is how a `--tint-glow` came to disagree with its own `--tint-base` | review | `scheme/css/styles.css`, the tinted dialog block |
| C-19 | **Do not re-add a per-category `.narration-overlay` background.** Retint through `--tint-canvas-rgb` and the panel follows | review | `scheme/css/styles.css`, `.narration-overlay` |
| C-20 | `color-mix` is deliberately unused, so colour resolution stays fully deterministic | test:files/C-20 | `scheme/css/styles.css`, the tinted dialog block |
| C-21 | Networking is the one category whose colour appears as a LITERAL in `diagrams.css`: `.scheme-packet` and `.scheme-ripple` pin `#4fe5ff` because the tint stop washed the ball out. Do not fold those into tokens | review | `scheme/css/diagrams.css` (`NET.C-01`) |
| C-22 | Retinting a category touches five places, and **all four categories agree across all five. A mismatch is a regression** | review | this file, D-13 |
| C-23 | A green above roughly 50 percent saturation goes acid on this canvas. If a new green shade is needed, move LIGHTNESS, not saturation | review | `js/schemes/storage/CLAUDE.md` (`STO.C-01`) |
| C-24 | The retired Lifecycle category (coral `#ff668c`) is NOT reserved anywhere in `scheme/`. `tokens.css` does not carry it, and the only live `#ff668c` in the repo is `--ts-tools-color` in `cli/css/styles.css`, an unrelated slot | test:files/C-24 | measured 2026-08-06 |

## T: text, narration and terminology

| ID | Rule | Check | Source |
|---|---|---|---|
| T-01 | **No apostrophes** in narration, wire or chain strings: they are single-quoted JS and an apostrophe breaks the module load. Reword | hook, test:inline/T-01 | `.claude/hooks/check-js.sh` |
| T-02 | Verify T-01 with a browser smoke, not just `node --check`: the hook catches the syntax error, `render/smoke.test.mjs` catches the ReferenceError class it does not | test:smoke, test:inline/T-02 | `test/render/smoke.test.mjs` |
| T-02a | **`node --check` and the browser do not agree.** Never derive an identifier from data (a chip name, a label) without checking it against the reserved-word list | test:smoke | measured 2026-08-06, `.claude/hooks/check-js.sh` |
| T-03 | **No semicolons** in narration prose: use a comma, or a period plus a capital | test:text/T-03, test:inline/T-03 | this file |
| T-04 | **Neither an em-dash nor an en-dash, anywhere.** The prose says "no em-dashes", the rule bans both | test:text/T-04, test:inline/T-04 | `test/unit/text.test.mjs` |
| T-05 | `R-dash` scans the card modules, the four manifests, the kits, this file, and the named root and `cli/` files. The four records are deliberately OUTSIDE its area, because a design record quotes what a card must not write | test:text/T-05 | `test/unit/text.test.mjs`, `dashTargets` |
| T-06 | **Terminology is a dictionary, not taste.** `test/fixtures/terms.json` is the source of truth: 71 hard terms, 13 hard-lowercase, 11 range exceptions, 8 soft terms reported only | test:text/T-06, test:inline/T-06 | `test/fixtures/terms.json` |
| T-07 | Two dictionary decisions are deliberately NOT the upstream ones: the catalogue majority wins (`Kubelet`, `ETCD`, `Node-1` keep their capitals), and `Node`, `Pod`, `Service` are ALWAYS capitalised. `kubectl` is always lowercase | test:text/T-07, test:inline/T-07 | `test/fixtures/terms.json` |
| T-08 | Between them `unit/text.test.mjs` (`desc`) and `render/inline.test.mjs` (every `narration` and every `aria-label`) read all of the prose. Neither can read MEANING | test:inline/T-08 | `test/render/inline.test.mjs` |
| T-09 | **System A for strings drawn ON the diagram**: a BLOCK LABEL is a heading and takes a capital, everything else on the canvas is body text and stays lowercase | test:inline/T-09 | `test/render/inline.test.mjs` |
| T-10 | Block labels capitalize the FIRST word only. A later word takes a capital only when it is an API object, an acronym or an identifier: `Routing decision` and `CSI controller`, but `ConfigMap app` and `Pod A bind mount` | test:inline/T-10 | `test/render/inline.test.mjs` |
| T-11 | Hyphenated names capitalize only the first segment; bare identifiers keep their real casing | test:inline/T-11 | `test/render/inline.test.mjs` |
| T-11a | **A named API object is drawn as its TYPE, a space, then its own lowercase name**: `PVC data-claim`, `Pod web-0`, `PV x73a`. Never glue the two with a hyphen | review | `js/schemes/storage/CLAUDE.md` |
| T-12 | A node frame label is the exception you cannot fix in the string: `.scheme-node-label` is uppercase catalog-wide by CSS | test:inline/T-12 | `scheme/css/diagrams.css` |
| T-13 | **One object, one label, across cards.** Strings are only compared inside the same POSITION CLASS, because a heading and a chip name are supposed to differ | test:inline/T-13 | `test/render/inline.test.mjs` |
| T-14 | The value class never fails: an API literal and an English word wear the same letters, so 11 ambiguous pairs are reported for a human to judge and are not findings | report:inline/T-14 | `test/render/inline.test.mjs` |
| T-15 | **A run that reads fewer strings than the last green one has checked less, and it must be red** | test:inline | `test/render/inline.test.mjs` |
| T-16 | **Do not put a SOURCE resolver back into `prose.mjs`.** It carries one sentence splitter and one term matcher and nothing else | review | `test/fixtures/prose.mjs`, which deliberately does not carry the resolver |
| T-17 | **There is no such thing as an unread chip write: a string drawn on the canvas either is there or is not** | test:inline | `test/render/inline.test.mjs` |
| T-17a | **An unreadable chip write is not a category of anything.** What can SEE a chip is the whole of the difference | test:inline | `test/render/inline.test.mjs` |
| T-18 | Two different Pods must not carry the same address, and a request must not exceed its own limit | test:inline/T-18 | `test/render/inline.test.mjs` |
| T-19 | **An absolute in a narration is a defect waiting to be found**, and the counter-case is usually a sibling card. Grep for `only`, `never`, `always`, `the whole of`, `all`, `nothing` before shipping a sentence | report:text/T-19 | this file |
| T-20 | The fix for T-19 is a CLAUSE, not a rewrite. **If a sentence needs a condition to be true, spend the characters**: cutting a condition to fit a band leaves a true sentence standing as a false absolute | test:catalog/D-04 | this file |
| T-21 | **If a step NAMES an actor, that actor has to be on the card** | review | this file |
| T-22 | Same test for a WIRE LABEL: it may only name traffic that rides THAT lane | review | this file |
| T-23 | A component the docs mark `(optional)` must say so on the card: on the BLOCK when it is genuinely absent in a large share of clusters, in the NARRATION when it is near-universal but replaceable | review | this file |
| T-24 | **Any edit that changes or adds a technical claim gets the internal-contradiction check before it lands.** Matching one sentence is not the test | review | root `CLAUDE.md` |
| T-25 | **Matching the narration is a PROXY for being true.** A sentence can be silent about something real (check the `aria-label` too, it often says what the steps left out) and a sentence can be loose | review | this file |
| T-26 | **When checking against kubernetes.io, read the RAW page, not a summary.** `curl -sL` and strip the tags | review | `test/report/sources.test.mjs` |
| T-27 | The highest-yield part of an upstream page is its OPENING paragraphs, because that is where the doc puts what distinguishes the feature, and it is exactly what a card built from knowledge omits | review | this file |
| T-28 | A card's `aria-label` describes the WHOLE drawing, not the current step, and it is the only text a screen reader gets for the picture. Never leave it stating only the first step | test:inline/T-28 | `scheme/CLAUDE.md`, measured 2026-08-12 off the imported SCENE data |
| T-29 | Wire labels are dim `text` at fixed positions, blank (`' '`) at build, filled per step with `setWire` | test:reduced/WIRE-TEXT | `lib/scheme-kit.js` |
| T-30 | **A wire label the ANIMATED path alone writes shows a blank lane on prev and reset**, while the narration names the exact string that should be there | test:reduced/WIRE-TEXT | `test/render/reduced.test.mjs` |
| T-31 | **A mass automated pass over prose must be followed by READING it.** A regex sweep leaves the linters green and the meaning broken, and an assertion that a pattern matches once does not protect a prefix-style edit from a second run | review | root `CLAUDE.md` |
| T-32 | Sources: two sources on one card must not share a label | test:catalog/R-srcdup | `test/unit/catalog.test.mjs` |
| T-33 | One href is labelled ONE way across the catalog | test:catalog/R-srclabel | `test/unit/catalog.test.mjs` |
| T-34 | Source liveness (DEAD, SOFT, MOVED, ANCHOR) is checkable but can never be mandatory, because it hits the network | report:sources/DEAD | `test/report/sources.test.mjs` |
| T-35 | **A step that plays a COUNTERFACTUAL says so on the canvas, with a caption above the branch**: a `P.wire` caption sitting above the branching group, written per step, opening `if instead` or `if ` plus the condition | review | the four cards named, and `T-29` for the mechanism |

## P: value chips

| ID | Rule | Check | Source |
|---|---|---|---|
| P-01 | **Every step states EVERY chip**, not only the ones it narrates: a legacy card through ONE `setChips(s, {...})` call, a migrated card through its `chips` field. An unset chip keeps the previous step's value and silently lies | test:spec-steps/P-01, test:chip-written/CHIP-WRITTEN, report:chip-unwritten/LIT-NOT-WRITTEN | this file. The CONVENTION is machine-checked on every migrated card, whether a carried-over value is still TRUE stays a human's job |
| P-01a | **The chip half of the rule is CLOSED and machine-checked; the label half is not** | review, test:spec-steps/P-01 | measured over the spec data after the storage migration. A carried-over value that is still TRUE as drawn is not a defect, which is why the label half stays a human's call |
| P-11 | **A value a step writes belongs in a writer FIELD, never in the `enter` escape.** Do not restate this rule as the exact SHAPE of a `setChips` wrapper: a shape pinned because a source reader can match it is what T-16 bans | review | `test/fixtures/prose.mjs` |
| P-12 | **Only TOP-LEVEL chip writes belong in `setChips`.** A write inside a `ctx.reduced` branch or inside an `at(...)` turnover is a different BEAT (`P-03`), and folding it into the step-entry call moves when the value appears | review | measured 2026-08-06 |
| P-13 | A `setChips` key may NOT be spelled `label`, `sublabel`, `ip` or `sub`. Use `podIp` | test:spec-steps/P-13 | `test/render/inline.test.mjs` |
| P-14 | Nor may a key be a RESERVED WORD. See T-02a | test:smoke | 2026-08-06 |
| P-02 | **A chip always means what its name says.** If a step needs to report something else, that is a second chip, not a reused one | review | this file |
| P-03 | **A chip must not run ahead of the motion that produces its value.** Pin the end value above the guard, then on the played path set the chip back to what the step STARTS from and turn it over on `pkt.arrivalMs` through `at(...)` | test:chip-beat-e/FORM-E, report:chip-beat/FORM-B | FORM-E, the narrowest class (this step turns ANOTHER chip over on a beat), was triaged to nineteen findings all carried with a reason and is now a red gate: `test/unit/chip-beat-e.test.mjs`, off the shared walk in `test/fixtures/chip-beat.mjs`. FORM-A and FORM-B stay a queue in `test/report/chip-beat.test.mjs`, which reads this off the spec with no browser and ranks it by how long the value stands on screen before the first ball lands. `report:arrival/R2` was cited here and asks the OTHER half: whether a changed value is CUED, never whether the arrival that earns it has happened |
| P-04 | Picking the beat is the whole job, and **doing this to one chip and not its neighbour is worse than doing it to neither** | review | this file |
| P-05 | A chip whose value CHANGED this step lights as a STATIC highlight, never a flash | report:arrival/R2 | `lib/scheme-kit.js`, `setChip` |
| P-05a | **The cue does not have to be a highlight on the chip** | report:arrival/R2-ENTRY | `test/report/arrival.test.mjs` |
| P-06 | Value chips are deliberately OUT of the arrival rule: they light at step ENTRY with the text change, while boxes, pods and cylinders light on ARRIVAL | report:arrival/R3 | `test/report/arrival.test.mjs` |
| P-07 | A chip's NAME must not collide with its longest VALUE, measured RENDERED on every step. Shorten the VALUE rather than widening the chip | test:chipfit/P-07 | `test/render/chipfit.test.mjs` |
| P-08 | `valChip` has NO category default for `role`, because a default of `cluster` tags 82 workloads chips with the cluster palette and a tinted dialog hides that by collapsing every role onto one tint | test:palette/UNPAINTED | `lib/scheme-kit.js`, `valChip` |
| P-15 | **A chip's value has to be READABLE by something**: declare the chip as a `P.chip` part and write its value through the `chips` or `chipsCued` field. **A card-local chip factory is NOT banned** | review | `test/fixtures/prose.mjs`, and `network-nodeport-loadbalancer` |
| P-09 | `setChip` highlights a chip whose value changed; `setVal` writes without the highlight. **A card converging on a `setChips` wrapper keeps whichever primitive it already called**: swapping `setVal` for `setChip` is a VISIBLE change | review | `lib/scheme-kit.js`, `setChip` and `setVal` |
| P-09a | **The cue answers a change of FACT, not a change of TEXT.** A chip whose string moves while what it reports does not takes no highlight | report:arrival/R2-STEP | `test/report/arrival.test.mjs`, `R2_STEP_CARRIED` |
| P-10 | **The two chip writers are bound to two FIELD NAMES inside `writeStatics`, and no import graph shows that coupling**: `chips` reaches `setVal`, `chipsCued` reaches `setChip`, in that fixed order. See P-09 | review | `lib/scheme-kit.js`, `setChip` |

## D: card metadata and the catalog

| ID | Rule | Check | Source |
|---|---|---|---|
| D-01 | A `SCHEMES` entry is `id`, `title`, `category`, `subcategory`, `desc`, `k8sVersion`, `tinted: true`, `sources: [{ label, href }]`. There is no path field | test:catalog/D-01 | `js/schemes/<cat>/cards.js` |
| D-02 | `app.js` imports ``./schemes/${category}/${id}.js``, so **the id MUST start with the category, which is the folder name** | test:catalog/D-02 | `test/unit/catalog.test.mjs` |
| D-03 | A module on disk that no `SCHEMES` entry claims is unclaimed: nothing lints it and the grid never shows it | test:catalog/D-03 | `test/unit/catalog.test.mjs` |
| D-04 | `desc` is 400 to 470 characters hard, 410 to 460 target | test:catalog/D-04 | `test/unit/catalog.test.mjs` |
| D-05 | `desc` is 2 to 4 sentences, 3 target | test:catalog/D-05 | `test/unit/catalog.test.mjs` |
| D-06 | Card and poster are an exact BIJECTION. A card with no poster draws `FALLBACK_POSTER`; a poster with no card is never rendered | test:catalog/D-06 | `test/unit/catalog.test.mjs` |
| D-07 | **Every category key matches its label 1:1, and no subcategory key is shared between categories**, or a `subcategory` value cannot be read without also reading `category` | test:catalog/D-07 | `js/data.js` |
| D-08 | `CATEGORY_LABEL`, `CATEGORY_ICONS` and `CATEGORY_TAGLINE` are PROJECTIONS of `CATEGORIES` through one `byKey(field)` helper, so a category is added in one place only | test:catalog/D-08 | `js/data.js` |
| D-09 | `CATEGORY_TAGLINE` renders nowhere today: both readers are fallbacks for shapes no category currently has. The code stays, do not expect a new tagline to appear | review | `js/data.js` |
| D-10 | Each category's `SUBCATEGORIES` list is an ORDER, not a set: the sequence is an editorial argument about what a reader has to know first, never alphabetical and never a merge artefact, and it is recorded beside the list it orders | review | `js/data.js`, and the `SUBCATEGORIES` note in each `cards.js` |
| D-11 | Renaming a card id is fine as long as `SCHEME_ALIASES` in `app.js` keeps the old one resolving | test:catalog/D-11 | `js/app.js` |
| D-12 | A deep-linkable card gets a `<url>` in the repo-root `sitemap.xml` | test:catalog/D-12 | `sitemap.xml` |
| D-13 | Adding a CATEGORY touches twelve places, and the ORDER that makes them land is the checklist in `scheme/CLAUDE.md` | review | `scheme/CLAUDE.md`, new-category checklist |
| D-14 | The poster-first model applies to every card: idle is a static poster, step 1 auto-plays after about 1s, the poster previews step 1's TEXT immediately, and `Next` from the last step wraps to poster then step 1 | test:skeleton/D-14 | `lib/timeline.js` |
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
| R-08 | House idiom two: **a poster carries no arrowhead by default.** Direction comes from the composition being closed, or from a dashed leg, or from a fill ramp. 99 of 110 have none | review | measured 2026-08-23 |
| R-08a | The exception, and it is earned rather than tolerated: **11 posters carry one light chevron or filled triangle, on the ones whose whole sentence IS a direction** that composition cannot say | review | measured 2026-08-06 |
| R-09 | **A poster carries no packet dot**: a ball frozen on a wire reads as a paused animation | review | this file |
| R-10 | No literal copy of the card diagram, no reused two-box layout, no plain "dumb circles" | review | root `CLAUDE.md` |
| R-11 | `FALLBACK_POSTER` in `js/app.js` breaks R-08 and R-09 on purpose. Do not "fix" it into canon and do not delete it: it is the failure mode made visible | test:catalog/D-06 | `js/app.js` |
| R-12 | Poster notes go to that category's record under the card id as a `### poster` subsection, because `POSTERS` is keyed by card id. **Coverage is 116 of 116**, so a missing one is now a regression | review | the four `CARDS.md` |

## S: module structure

| ID | Rule | Check | Source |
|---|---|---|---|
| S-01 | **A scene has exactly ONE construction path.** `makeScene(SCENE)` is the only producer of a `Scene` class, its prototype is closed to `constructor`, `build` and `reset` | test:skeleton/S-01 | `test/unit/skeleton.test.mjs` |
| S-02 | **A card module has exactly ONE legal export surface**: `SCENE`, `STEPS_SPEC` and `init`, from `defineCard(SCENE, STEPS_SPEC, { posterFirst: true })`. The comparison is set EQUALITY per card, never containment | test:module/S-02 | `test/unit/module.test.mjs` |
| S-03 | **A build starts from an empty host and a fresh `refs`**, and nothing else may append to the host | review | `scheme/CLAUDE.md` |
| S-04 | The root svg carries `viewBox: '0 0 1200 640'`, no exceptions. **Re-centre the content, do not move the camera.** A card builds it with `diagramRoot({ 'aria-label': '...' })` | test:skeleton/S-04 | `lib/scheme-kit.js`, `diagramRoot` |
| S-05 | **No card owns the camera.** One `diagramRoot` serves the whole catalog: a card declares no viewBox and no camera key anywhere in its parts, and feeds the camera exactly one thing, its `aria-label` | test:skeleton/S-05 | `lib/scheme-kit.js`, `diagramRoot` |
| S-06 | `preserveAspectRatio: 'xMidYMid meet'` and `data-style: 'outline'` come with `diagramRoot`. `arrowDefs()` stays in the card, appended first, because one card puts it on a content group rather than the root | review | `lib/scheme-kit.js` |
| S-07 | **Z-order**: body blocks, then wires and wire labels, then chips, then `packetLayer = g({ id: 'packetLayer' })` on top, and the z-order is stated in a comment | review | `scheme/CLAUDE.md` |
| S-08 | Pods are a `podShell()` plus inner `box()`es wrapped in a `g`, and the pulse target is that `g`. See M-03 | review | `lib/primitives.js` |
| S-08a | **`P.pod` is the ONE thing that builds a Pod.** A card-local Pod factory keeping its own GEOMETRY and wrapping a shell plus its inner boxes by hand is a second construction path (`S-01`, `S-02`), and no card is on that form | review | `lib/scene-spec.js`, `buildPod` |
| S-08b | A category kit binds its tint with `export const { pulsePod, pulsePodDim } = makeTintedPulses(<CAT>_TINT);`. The two bodies live once, in `scheme-kit.js` | test:module/S-08b | `lib/scheme-kit.js`, `makeTintedPulses` |
| S-08c | **The `aria-label` stays an object key at the `diagramRoot` call site** | review | `lib/scheme-kit.js`, `diagramRoot` |
| S-09 | **Step 0 is `id: 'idle'`, a pure reset, carries no `narration` and must not DRAW** | test:spec-steps/S-09 | `scheme/CLAUDE.md` |
| S-10 | **Every step's `enter()` opens with the prologue and nothing before it**, so the reset is generated once instead of promised per card | test:skeleton/S-10 | `test/unit/skeleton.test.mjs` |
| S-11 | **The prologue is generated once, out of `SCENE.reset`, and its order is fixed**: `packetLayer.replaceChildren()` FIRST, then `clearHighlights` over `reset.keys` and `reset.pods`, then `clearWires`, then `reset.extra` LAST | test:skeleton/S-11 | `test/unit/skeleton.test.mjs` |
| S-12 | No card declares `clearHL(s)`: the generated prologue is what clears | report:skeleton-census/S-12 | `test/report/skeleton-census.test.mjs`, Q3 |
| S-13 | Above the reduced guard a step sets ALL chip values, wire labels and `.highlight` classes, and **pins final opacities inline**, so a cancel mid-step lands on the right value | test:reduced | `scheme/CLAUDE.md` |
| S-14 | **The reduced-motion split is the load-bearing line.** Everything ABOVE `if (ctx.reduced) return;` is the complete static end-state; everything BELOW is motion | test:reduced | `test/render/reduced.test.mjs` |
| S-15 | **Never animate state that is not also pinned statically above the guard** | test:reduced | `test/render/reduced.test.mjs` |
| S-16 | `render/reduced.test.mjs` compares four axes and **all four are enforced**: own opacity, INHERITED (effective) opacity multiplied down the ancestor chain, drawn wire text, and the `.highlight` set | test:reduced | `test/render/reduced.test.mjs` |
| S-17 | Whatever lights on ARRIVAL must also light on the REDUCED path, and `flowLights` DERIVES that from every `lights` list in `flow`, so a card writes nothing | test:reduced/HIGHLIGHT | `lib/step-spec.js`, `flowLights` |
| S-18 | **When a block dies mid-step, take its highlight back in the fade's `onfinish`** rather than mirroring it onto the static path | test:spec-steps/S-18 | `scheme/CLAUDE.md` |
| S-19 | A `.highlight` put on a Pod INNER BOX has to be cleared BY NAME in `clearHighlights`'s keys list. The `pods` argument runs `clearPodHighlight`, which resets inline stroke styles and touches NO class | test:spec-steps/S-19 | `lib/scheme-kit.js`, `clearHighlights` |
| S-20 | **A folder holds exactly four kinds of `.js`**: its cards, its `<category>-kit.js`, its `cards.js`, its `posters.js` | test:catalog/D-03 | `test/unit/catalog.test.mjs` |
| S-21 | **A card imports its own kit and nothing past it**: `../../lib/svg.js`, `../../lib/primitives.js`, `./<category>-kit.js`. `lib/` holds only what every category shares | test:module/S-21 | `scheme/CLAUDE.md`, the folder contract |
| S-22 | The four kits re-export the SAME list of names from `scheme-kit`, and **that list is the CARD-FACING API rather than a mirror of the library**: a name earns its place by being imported by at least one card | test:module/S-22 | `test/unit/module.test.mjs` |
| S-23 | Adding a name to the kit surface is ONE edit across all four kits. The four lists are formatted differently enough that a single find-and-replace does not work | test:module/S-23 | `lib/scheme-kit.js`, the kit header |
| S-24 | `export * from './scheme-kit.js'` stays REJECTED. It would work and save lines, but the explicit list is what documents what a kit offers, and a card must never reach past its kit | review | `scheme/CLAUDE.md` |
| S-25 | `flashChips` is in the kit surface and is **the mechanism behind `F.flash`**: the ONE name on that surface no card imports, which is the exception `S-22` allows | test:module/S-22 | `lib/scheme-kit.js`, `flashChips`. `lib/step-spec.js`, `flash` |
| S-25a | **`step.motion` is a live field with ZERO uses across the catalog, and it STAYS.** Do not delete it, and do not reach for it either: `F.run` at delay 0 is the sanctioned imperative beat inside flow order | review | `lib/step-spec.js`, `spec.motion` |
| S-25b | **`F.ripple` is a live flow verb with ZERO call sites, and it STAYS.** Do not delete it, and do not reach for it either: check first whether a packet already lands there | test:ripple-single/RING-SINGLE | `lib/step-spec.js`, `ripple` |
| S-25c | **`F.flash` is a live flow verb with ZERO call sites, and it STAYS.** Do not delete it, and do not reach for it either: `M-27` is why no card calls it, and `test:spec-steps/M-26` is what watches the door | test:spec-steps/M-26 | `lib/step-spec.js`, `flash` |
| S-26 | **`defineCard` is the ONE producer of a card's `init`**: a card writes `export const init = defineCard(SCENE, STEPS_SPEC, { posterFirst: true });` and never calls `makeInit` itself | review | `scheme/CLAUDE.md` |
| S-27 | **Take S-26 further only on a COUNT.** A new `P` or `F` verb has to name the cards that need it before it is added | review | `scheme/CLAUDE.md` |
| S-28 | **No top-level browser globals at module load**, except in `motion.js` and `app.js`. `svg.js`, `primitives.js`, `timeline.js` and `data.js` must parse cleanly in Node so the tools can read them | test:module/S-28 | `scheme/CLAUDE.md` |
| S-29 | `svg.js` exports six names nothing imports today and they STAY: it is a library surface, not accumulated code. Do not read their absence from the import graph as a finding | review | `lib/svg.js` |
| S-30 | `lib/sidebar.js` is DUPLICATED with the `cli/` copy, not symlinked. Change one, change the other | review | `scheme/CLAUDE.md` |
| S-31 | A card module must pass `node --check` the moment it is written. The hook exits 2 and hard-fails the edit | hook | `.claude/hooks/check-js.sh` |
| S-32 | Every step is walked twice by the smoke, statically and really PLAYED, with zero console or page errors | test:smoke | `test/render/smoke.test.mjs` |
| S-33 | A missing import in a card throws a `ReferenceError` that `Timeline` swallows into `console.error`, so the step plays its first packet and silently stops. **Run `render/smoke.test.mjs` after touching any card's imports** | test:smoke | `lib/timeline.js` |
| S-34 | **A comment in a card is at most TWO lines.** It says WHAT the line beside it does or where a number came from. It carries no date, no past defect, no account of an earlier version | test:files/S-34 | `scheme/CLAUDE.md`, where the record lives |
| S-35 | Anything longer than S-34 is not a comment, and each length has one home | review | `scheme/CLAUDE.md` |
| S-36 | Each card carries exactly ONE pointer comment under its imports, in the shape its category's record is in: `./CARDS.md#<id>` for one file per category, `./CARDS/<id>.md` for one file per card | test:files/S-36 | `test/unit/docs.test.mjs` |
| S-37 | Notes on anything that is NOT one card go to the JSDoc BESIDE THE CODE they describe: `lib/*`, the four kits, `app.js`, `data.js`, and a comment block in the CSS for a rule about a CSS rule | review | `scheme/CLAUDE.md`, where the record lives |
| S-48 | **A comment and a record state what IS, never what CHANGED.** No date on an edit, no `used to`, no `renamed on`, no `this block carried`: a reader needs the constraint and the number behind it, and the repository is not a diary | review | `scheme/CLAUDE.md`, the "Where the record lives" table, which already sends history to the bin |
| S-49 | **A count a document states is MEASURED, not typed**, and a sentence reworded past its pattern fails as loudly as a wrong number | test:docs-census/CENSUS, report:baselines/BASELINES | `test/unit/docs-census.test.mjs`, `test/report/baselines.test.mjs` |
| S-50 | **A card skill CITES a rule and never restates it.** The skills under `.claude/skills/` are the fifth reader of this file and the only one outside `scheme/` | test:docs/D1 | `.claude/skills/card-review/SKILL.md` |
| S-38 | **A note anchor is DATA: never reword one.** MOVING a note to another card needs a NEW anchor taken off the destination card, because the old text will resolve there against the wrong code or vanish with no finding | test:docs/A2 | `test/unit/docs.test.mjs`, counted 2026-08-07 |
| S-39 | When a card is renamed, rename its record heading too, and the record FILE with it where the category is split | test:docs/A4 | `test/unit/docs.test.mjs` |
| S-40 | A test file under `scheme/test/` keeps its knowledge in its OWN HEADER rather than moving it to a record, and the two-line cap on a card comment does not apply there | review | `scheme/test/`, and every test file header |
| S-41 | **Internal markdown never ships.** Three filenames (`CLAUDE.md`, `CARDS.md`, `CANON.md`), the `CARDS/` record folder, plus `scheme/test/`, excluded BY NAME in three places that must agree: `deploy.yml`, `release.yml`, `.dockerignore` | test:files/S-41 | root `CLAUDE.md` |
| S-42 | Do not unify what VARIES between cards: the kit, block size, geometry, step count, connector style. **The `role` passed to primitives and the Pod tint are the one exception, and only when the binding is made IN THE CATEGORY KIT** | test:spec-scene/S-42 | `scheme/CLAUDE.md`, and C-02 / P-08 for the cost of the cross-category default |

---

## The record vocabulary

One list for all four records, so a label cannot mean one thing in `cluster/` and another
in `storage/`. A record uses the ones that apply, in this order, and adds none of its own.

**Every one of them is written in the present tense** (`S-48`). A block says what the card does and what
was measured, never what an edit did to it: `WHY NOT` and `DO NOT` are where a rejected alternative lives,
as a constraint with its number, and not as an account of the day it was rejected.

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

Structural rules for a record file, all of them enforced by `unit/docs.test.mjs`, group A for the
first four and group E for the last:

| ID | Rule | Check | Source |
|---|---|---|---|
| S-43 | Every `## ` heading in a record is a CARD ID and nothing else, in either shape. A second-level heading anywhere else is reported as an orphan, which is why the preamble headings are bold text rather than `##` | test:docs/A4 | `test/unit/docs.test.mjs` |
| S-44 | A card's section must be in ITS OWN category's file. A section filed in the wrong one is named as `MISFILED`, not as a missing file | test:docs/A5 | `test/unit/docs.test.mjs` |
| S-45 | Every card has a section. A card with no design record is how a measurement gets lost | test:docs/A3 | `test/unit/docs.test.mjs` |
| S-46 | **A record the walk cannot OPEN is a failure, never a shorter run.** Nothing may be read with a `continue` on absence | test:docs | `test/unit/docs.test.mjs`, `readDoc` |
| S-47 | **This file has to tell the truth about itself**, or it drifts from the harness the way one number once drifted across six files | test:docs/E1, test:docs/C4, test:docs/C5 | `test/unit/docs.test.mjs`, groups C and E |

---

## Category-scoped rules

Category rules do NOT live here. The folder is the unit of context and splitting it would break that.
They keep the same id shape with a category prefix, and this is their index.

**The test for where a rule belongs: anything that would be a DEFECT if it differed between two
categories is catalog-wide and belongs above. A pointer is not duplication, a paragraph is.**

**A row below carries NO rule text, and that is the point.** The text lives in that folder's
`CLAUDE.md` and nowhere else, because two copies of a rule drift and nothing sees it happen. **Where
a folder and this index disagree, the FOLDER wins**, because the folder is what a card author has
open. Where two meanings cannot both keep one id, the version that is not the folder's takes a NEW
id there and no id is reused. The second column below is a subject label for finding the row, never
a statement of the rule: if you are about to read a number or a `DO NOT` out of it, you are in the
wrong file.

### `CLU.*` cluster, `js/schemes/cluster/CLAUDE.md`

| ID | Subject |
|---|---|
| `CLU.C-01` | the tint against the chrome colour |
| `CLU.S-01` | what a cluster card's own record states |
| `CLU.S-02` | the exemplar card |
| `CLU.S-03` | what a record is for at the margin, and the measured length band |
| `CLU.L-01` | the Cluster Node frame family, and the six cards that deviate |
| `CLU.D-01` | the subcategory split |

### `WL.*` workloads, `js/schemes/workloads/CLAUDE.md`

| ID | Subject |
|---|---|
| `WL.C-01` | the tint |
| `WL.L-01` | the `WL` X grammar |
| `WL.L-02` | the two columns |
| `WL.L-03` | layout A |
| `WL.L-04` | layout B |
| `WL.L-05` | layout C, and the chip strip that cost 79 collisions |
| `WL.L-06` | which of A / B / C a card picks |
| `WL.L-07` | the trunk corridor |
| `WL.A-01` | the top-row lane pair |
| `WL.A-02` | where the top-row wire label sits |
| `WL.S-01` | the per-card `SPINE` array, and why there is no shared connector helper |
| `WL.D-01` | the subcategory split |

### `NET.*` networking, `js/schemes/network/CLAUDE.md`

| ID | Subject |
|---|---|
| `NET.C-01` | the tint, and the one category colour that is a literal in `diagrams.css` |
| `NET.S-01` | what a Pod is built from here |
| `NET.A-01` | endpoints on a block edge |
| `NET.A-02` | traffic delivered to a Node |
| `NET.A-03` | N destinations, N wires |
| `NET.T-01` | addresses ride the ball |
| `NET.S-02` | the inner app boxes named in `resetStep` |
| `NET.S-03` | the exemplar card |
| `NET.D-01` | the subcategory split |

### `STO.*` storage, `js/schemes/storage/CLAUDE.md`

| ID | Subject |
|---|---|
| `STO.C-01` | the tint and its saturation ceiling |
| `STO.L-01` | the vertical-stack grammar |
| `STO.L-02` | the cylinder label offset |
| `STO.L-03` | the family chip width |
| `STO.L-04` | a card's own viewport row, where it is stricter |
| `STO.A-01` | the identity spine |
| `STO.A-02` | the mount lane |
| `STO.C-02` | no highlight on an inner container box |
| `STO.S-01` | what a step's `opacity` field has to pin |
| `STO.S-02` | a block and its lanes as one construction |
| `STO.S-03` | the z-order |
| `STO.S-04` | the exemplar card |
| `STO.D-01` | the subcategory split |

---

## Rewriting a rule whose subject disappears

**No row is retired, and none may be.** A rule that stays true while NAMING a thing that has
disappeared needs REWORDING, not retirement: read the row for what it PROTECTED, and rewrite it onto
whatever still holds that job. A rule retired before its subject is gone leaves a live defect
unwritten, and this is the file that has to tell the truth about itself (`S-47`).

`D-10`, `S-37`, `S-40` and `S-46` are the pattern to copy. Each names a live subject where the
obvious wording would have named a file that no longer exists: the subcategory order sits beside the
list it orders, a note beside the code it describes, a test's knowledge in its own header, and a
walk that may not skip what it cannot open.

## Known deliberate exceptions

Not defects. Each is a rule broken on purpose, with the reason and the number that made the call.

| What | Why it stands |
|---|---|
| `FALLBACK_POSTER` breaks R-08 and R-09 | R-11 |
| `dim` losing to `role` on an arrow | A-18. Making `dim` outrank `role` reaches almost the whole catalog (101 of 110 cards declare a dim arrow or lane carrying a role) and greys the networking exemplar's fan |
| `flashChips` exported with no card importing it | S-25. `F.flash` is its one caller |
| `F.flash` a live flow verb with zero call sites on 665 steps | S-25c, and `M-27` is why the zero is a ban rather than a gap |
| 78 of 590 narrated steps register no animation at all, 191.9 seconds | M-27. A packet-less, pod-less step is STILL on purpose: the alternative was a brightness pulse on infrastructure that `M-01` forbids and no still frame can show |
| `step.motion` a live field with zero uses on 665 steps | S-25a |
| Six `svg.js` exports with no importer | S-29 |
| No module constant declares a number nothing reads. **Zero, catalog-wide** | A dangling name is worse than a dead line: a constant and the comment naming it always move together. An axis is stated as the literal 600, a pitch as a two-line comment on the block it spaces |
| Header chrome duplicated three ways (`cli/js/app.js`, `scheme/js/app.js`, inline in the root `index.html`): `renderHeaderActions` at 86 lines, plus `fallbackCopy`, `closeAllDropdowns` and the icons, about 240 lines | Deliberate. Each path prefix stays self-contained, which is the reason the duplication exists |
| `cli/css/styles.css` (227 rules) and `scheme/css/styles.css` (217 rules) share 63 selectors with a byte-identical body | 22 more share a SELECTOR with a DIFFERENT body (`html`, `body`, `.card`, `.footer`, `.cat-btn`, `.logo`, `.section-header` and others), so cascade order decides. Merging is a real visual risk. Measured 2026-08-06 |
| 54 `OPEN` findings across the four records, against 10 findings in the soft geometry report | L-16, and the two counts are not one count. Each `OPEN` entry carries its own measurement and the reason the rule can only be satisfied by making the picture worse |
| 11 ambiguous label pairs | T-14 |

---

## The long form

A row states the RULE. The argument behind it (the measurement that fixed the number, the
alternative that was tried, what it cost the day it was missed) is what makes a rule obeyable rather
than merely known, and where it does not fit one line it sits here under the same id.

Read this section the way you read a footnote: never instead of the row, and only for the rule you
are about to apply. `cd scheme/test && node tools/canon.mjs --id=<id>` prints the row and its long
form together, and `--check=review` prints the subset a human is the only machine for.

**Nothing here is a second rule.** If a sentence below reads like an instruction its row does not
carry, the row is the one that is wrong and the row is what gets fixed. Every heading is an id that
`unit/docs.test.mjs` group F resolves against the tables above, so a long form for a rule that does
not exist, or two for one rule, is a failure and not a stray paragraph.

### L-04

**The two ends of this range are not the same kind of number, and treating them alike is what makes
the shallow one look stale every time somebody edits a narration.**

The deep end is a card. 503.13 belongs to `workloads-pod-phase-machine` at 1100x800 on step 5,
because that step has the longest narration in the catalog and the narrowest viewport wraps it into
the most lines. Move that prose and the number moves with it, which is what the report's attribution
line is for.

The shallow end is a CLUSTER, and one card now sits a line below it. Panel bottoms are quantized by
the line height, about 17.44 units at 1600x1000, so the measured set clusters on 90.23, 107.67,
125.11, 142.56, 160.00 and 177.44 rather than spreading. **15 cards sit on 107.67**, so the id the
report prints beside that value is whichever the walk reaches first, and an `attribution DIFFERS`
there says nothing about the tree. Read the VALUE, never the name.

90.23 is one line shallower and one card reaches it, `cluster-leader-election` on step 2, which
carries the shortest narrations in the catalog so that its diagram clears the panel. 107.67 is
therefore not a panel of ONE line and not the fewest a narrated step can have: it is FOUR narration
lines at 1600x1000, and the shallow end is only ever the shortest prose anyone has written.

### L-05

The difference between the two is what a reader gets wrong. The panel is HTML at a fraction of the
dialog width while the diagram scales past it, so a WIDER dialog gives a WIDER panel that wraps into
FEWER lines and is therefore SHORTER in viewBox units, while every drawn thing around it grows.

Against the viewport the bottom is orderly: **665 of 665 comparable steps** fall as the viewport
widens, 0 break that order.

### L-05a

The panel's WIDTH in viewBox units is BOUNDED, not constant. `x<=397` holds everywhere and the right
edge still travels **105.78 units** across the standard set (`cluster-architecture`, 290.77 at
1600x1000 against 396.55 at 1100x800), so the ceiling is reached only at the narrowest viewport.

The font is a fixed pixel size, so a wider viewport wraps the same text into fewer lines AND divides
by a larger scale: the panel shrinks in units twice over, by up to 186. The fix that would close it
resizes every narration on every card, which is why it stands.

### L-05b

Measured on 209 of 216 card+viewport pairs, so it is the ordinary case rather than a few cards.

The `min-height` pin fixes it completely and is still declined: it leaves a visible empty strip
inside a drawn border, about 100px on `workloads-pod-phase-machine`, and an empty strip inside a
border reads as a fault where empty canvas reads as space.

### L-08

`OCCLUDED` will not tell you, because it scores occluded AREA and a 25 unit strip off a 152 unit
frame is under its bar.

The measurement: `npm run report` from `scheme/test/`, then read that card's `1100x800` column in the
overlay table.

### L-08a

True of the two categories that HAVE such a grammar, and their objects are identical where they
overlap: `CLU` and `WL` agree on all 17 shared keys and their `LAYOUT` is byte for byte the same, so
a divergence between them would be a defect rather than a choice.

The other two have nothing to pick with. Networking carries no grammar at all (measured: of its 37
cards, 17 name a content band across six different literal pairs and the other 20 hang off a `node()`
frame), and storage's `STO` is a different object, overlapping `CLU` on two keys only.

### L-16

**Count the two populations separately, because 17 was neither of them.** The soft geometry report
prints its findings (CENTRE, CENTRE-LOW, OCCLUDED) and the four records carry `OPEN` entries. The
`OPEN` set covers more than geometry and is not the same list. Both counts are stated, and machine
compared, in `scheme/CLAUDE.md` (`S-49`).

### L-18

Specificity 0 loses to the `.scheme-label.code` class rule, so the attribute is inert and the text
keeps the class's size. A budget sized off the attribute is wrong by 10 to 22 percent.

### L-20

`.scheme-box-sublabel` is 10px JetBrains Mono at 6.03 viewBox units per character.
`.scheme-chip-text` and `.scheme-label code` are 11px at 6.89.
Box labels are 12px Space Grotesk and proportional, so they vary by string and no single rate fits
them: measure the string.

### L-23

Measured over the 58 cards that draw a Node frame with Pods inside it, 74 frames in all. Only two
readings are shared by more than a handful: `POD_H = 106` on 21 cards and `POD_Y = NODE_Y + 34` on
17. `NODE_H` has no plurality worth the name, 152 on 9 cards against 140 on 8, and 41 distinct
`NODE_H / POD_H / POD_Y-NODE_Y` triples cover the 58. The largest single family is `152 / 106 / 34`
on 9 cards, and all nine are Cluster, which is why the numbers live in `CLU.L-01` and not here.

What IS catalog-wide is the floor under the top padding: `node()` prints its own label at `x: 12,
y: 18` (`primitives.js`), whose box measures `NODE_Y + 6.8` to `NODE_Y + 21.4` and `NODE_X + 12` to
about `NODE_X + 57` at 1600x1000. A Pod row starting above that band has to clear the label
horizontally instead, which is what the cards at `POD_Y - NODE_Y` of 14 to 22 rely on.

### A-06

Do not read an arrow on one card and a relation line on the next as drift. The difference IS the
content.

### A-08

`stroke-opacity` keeps ONE colour token per category and MULTIPLIES with any element opacity a card
pins. A darker literal would be a second token that stops tracking the card's own fades.

### A-09

A controller writes to the API and stops there. What then happens on a Node is that write taking
effect, so the lane into the Node band leaves the API and not the controller.

### A-15

`[{opacity:1},{opacity:0}]` with `fill: 'both'`, and the same delay and duration as the fade below
it, so keyframe one holds through the delay window instead of the lane vanishing under the ball.

### A-16

Two assignments drift the moment a step is added, and the drift is invisible to every check.

### A-18

`.scheme-arrow-dim` sits above the role rules at equal specificity, which is what makes the role win.

That order is deliberate: 601 dim lanes across the catalog carry a packet, and making `dim` outrank
`role` greys every one of them out.

### A-20

Deliberate rather than an oversight, and the spread is inherited: normalising it is an undeclared
visual change, not a tidy-up.

Measured 2026-08-08: 41 calls, 6 with no role, 19 with no dash, and of the 22 that pass one, 19 are
`5 5`, 2 are `4 6` (both on `storage-ephemeral-vs-persistent`) and 1 is `4 4`.

A migrated card is outside that population: `P.relation` takes the role its kit binds (`S-42`), so
only `dash` is still per call.

### M-03

`pulsePod` finds targets with `querySelectorAll`, which matches descendants only and never the
element itself, so pulsing a bare `pod()` fires at half strength. The symptom in `getAnimations()`
is `strokeOpacity` tracks with no `filter` track.

### M-08

**A fading Pod does not have to pulse, and NOTHING sees one that does not.** `test:opacity/ORDER`
opens with `if (!mine.length) continue`, so a Pod that fades with NO pulse is skipped in silence:
this half is a blind spot rather than a check.

Measured 2026-08-17: 8 such steps, 2 of which earn a pulse (`storage-generic-ephemeral-volume` gc,
`storage-volumeattachment` detach) and **6 are CORRECT unbeaten**: a Pod on an unreachable Node
cannot acknowledge a DELETE, a card whose Pod SHADE is the phase, an orphan that keeps running, a
second fade after the beat is spent.

A Pod that fades unbeaten owes a REASON, not a pulse, which is why the population is printed with its
verdicts rather than asserted.

### M-13

`HOP_MS` 700 is both `topPacket`'s fixed duration and `routeDur`'s FLOOR. Below the floor a 220 unit
arrow would finish in 489ms and read as a dart next to the long glide.

### M-18

**`lead` and `afterPulse` are ONE number, so M-15 to M-18 are indistinguishable in the data**:
nothing can say a given 800 was one rather than the other. `render/motion.test.mjs` therefore prints
the vocabulary as a CENSUS (it explains 671 of 714 balls) and asserts none of the four.

### M-19a

A step holds for `duration` and animates for `span`, so it also stands STILL for the difference.
`M-19` bounds that difference below and nothing bounds it above, so a ball can land a third of the
way in and leave the viewer at a picture that has stopped changing. The hold is READING time, so
still time is what a long narration charges a short motion and a high reading alone is not a
defect. It is a finding when a step is an outlier on BOTH readings at once: far more still than its
siblings AND unremarkable on ms per character, which means the hold is not buying reading either.
The fix is then the MOTION (a narrated exchange the picture never draws is the usual cause) or the
narration, never `duration` alone, because `M-19` still has to hold.
`tools/deadair.mjs` prints both readings with the catalog distribution behind them.

### M-22

`REVEAL_MS` is exported precisely so three cards can sequence the next beat off it rather than
keeping private copies of the number.

### M-26

The magnitude walk finds zero `PULSE_BLOCK` tracks on a chip, and the emptiness is ASSERTED rather
than only measured: `F.flash` is named for chips, takes any ref and is the one way the population
could open, so the check reads the part KIND behind every target.

### M-27

**This is the row `M-01` outranks, and the collision was real rather than a reading**: `M-04` defines
a pulse as `filter: brightness(...)`, and `flashChips` is exactly `brightness(1) -> 1.55 -> 1` over
600ms, so the flash one row sanctioned was the motion the other row bans. It also peaks HARDER than
the thing `M-01` reserves the mechanism for: 1.55 against the Pod pulse's 1.4.

The cost is a frozen step, and it is paid on purpose. Measured over all 115 cards: **77 of the 585
narrated steps (700 total less the 115 poster slots), 188.8 seconds, register no animation at all.**
That is the same population the verb used to move, 58 already still plus the 11 it flashed.

Three things buy it back, and none of them is a pulse. The step still CHANGES on entry: a `.highlight`
lands, a chain row lights, a chip value turns over, and the CSS transition on `.scheme-box-rect`
carries all three over 300ms. The narration panel is new text. And a step nobody is chasing is a step
a reader can finish, which is what the reading-load ranking beside `M-19` is for.

The clinching argument is that the flash could not be REVIEWED. Its 600ms equalled the whole span of
every step carrying it, so a frame frozen at half span sat at peak brightness and one at 95 percent
was still lit: both read as an ordinary static highlight, and a full card review filed three of them
as correct. A beat no still frame can distinguish from a static state is not a beat.

### M-28

Chrome promotes an element for as long as an opacity animation is attached to it, DELAY PHASE
INCLUDED, so every block about to light shifts tone for the flight of the ball and snaps back. On
`at` the target is the SVG ROOT, so every block on the card shifts.

**Promotion CASCADES**: anything painted above a composited layer and overlapping it is promoted with
it, which took three lanes and a wire label along.

Empty costs nothing in return, because the animation stays a first-class WAAPI object at the same
delay and duration, still listed by `getAnimations()` and still firing `onfinish`.

### M-30

`segmentPacket` is linear, routes are eased, and `animateAlong` defaults to ease-in-out.

Get it wrong and the tag drifts off mid-flight, rejoining only at the endpoints and the midpoint,
which no static screenshot shows.

### M-35

Verify a turnover by sampling a REAL-TIME playthrough: `tools/settled-dump.mjs` plays every step at
speed. Read `render/reduced.test.mjs` passing as the proof it lands.

### C-02

`makePartKinds` stamps the bound role on every roled part whose `role` is `undefined`, so an explicit
`''` or `null` survives, drops `data-role` (the primitives write `role \|\| null`) and paints the
generic fallback instead of the category hue.

A tinted dialog collapses most roles onto the one tint, so a wrong role is usually invisible.
`UNPAINTED` is the only thing that sees a role that resolved no colour.

### C-12

A shade reaching an element through a helper, a parameter or a ternary is judged like any other, so a
named constant cannot smuggle one past it.

### C-19

A hand-copied override per category is how a violet card comes to carry a navy panel, unnoticed for
as long as the category exists.

### C-22

The kit's `<CAT>_TINT`, `css/tokens.css`, the tinted block in `css/styles.css`, `POSTER_COLORS` in
`js/app.js`, and the folder `CLAUDE.md`.

### T-02a

On a file whose first statement is an `import`, Node takes the ESM path and ACCEPTS a reserved word
as a destructured binding (`function f(s, { cond, new, grace })`). The browser rejects it, the module
never loads, and the card renders nothing.

### T-11a

`PV-x73a` states a name RFC 1123 forbids.

A YAML field quoted in a tag takes the BARE name (`volumeName: x73a`), because that is what the field
holds.

### T-15

The input is the rendered canvas, so there is no SOURCE resolver to go quiet, and the insurance is a
CENSUS with floors: narration off the controller, one `aria-label` per card, distinct drawn strings,
block-owned strings. The numbers live in the test, where they execute, and are not restated here.

### T-16

`unit/catalog`, `unit/text` and `render/inline` all read prose through it, so a change there moves
every prose verdict at once.

The ban exists because a source resolver collapses SILENTLY at exit 0, in two distinct ways: a
renamed writer takes its coverage from 321 to **114**, and a `setChips` moved out of a line-initial
`function` declaration takes it to **6**. The input is the rendered canvas, and T-15's census is the
insurance.

### T-17

What holds the line is a CLOSED INVENTORY rather than a ceiling on a count: exactly the listed text
classes may draw a string, and a string under any other class is a finding **even when the count goes
UP**, which is the failure a count cannot see.

### T-17a

A template literal doing arithmetic, a bare variable, a run-time `s.refs[k]`, a `String(i + 1)`, a
ternary, and a `valChip` whose name and value come from a data array are the six shapes a SOURCE
resolver cannot read.

Every one of them is an ordinary text node on a CANVAS, so all six are read, classified and judged
like every other string.

### T-23

Two `optional` sublabels in one drawing read as a pattern rather than as a fact about either.

### T-24

Grep the claim's keywords across the whole card and read what its other steps, its chips, its block
labels and its `aria-label` already assert.

### T-26

A summariser returns a confident invention and nothing contradicts it.

There is no offline copy to fall back on: the liveness report writes no page cache, deliberately.

### T-28

**Two shapes are in use and both are legitimate**, measured over all 110: **24 end in a full stop**
and are two to four sentences of description, **86 do not** and are a headline phrase with a colon
and a list of stages.

Match your own card's neighbours rather than converging the catalogue.

### T-30

The `wires` field runs above the guard on both paths, so the defect now takes a wire written only by
an `F.set` inside `flow`, by a `motion` escape or by a deferred turnover.

The idiom that keeps both paths right: state the label in `wires`, wind it back blank in `rewind`,
and let the `F.set` fill it on the beat.

### T-34

**Nothing is cached**, deliberately: a green run means the links were alive at the moment it ran, and
a run with no route out fails every url. The size of the bibliography is stated where it EXECUTES,
in `report/sources.test.mjs`, which prints the live census beside the recorded one on every run: a
number restated here goes stale the next time a card is added and nothing sees it happen.

### T-35

Three cards show an alternative path as real state: `storage-pv-lifecycle-phases` deletes a PV that
exists again a step later, `storage-volume-detach-on-node-loss` plays a branch AFTER its own ending,
and `network-dns-ndots` answers NOERROR on the name its next step gets NXDOMAIN for.

A reader looking at the frame without the panel sees a state that never happened, and no rule caught
it because every check reads one step at a time.

The sign is ONE grammar catalog-wide, and the two alternatives are ruled out rather than untried: the
ghost shades already mean `terminating` and `notready` on 94 cards, and a dashed frame does not fit
the two cards whose branch spans the width.

**All three carry it as a `P.wire` caption**, so the grammar has no deviation in the catalogue
today: `if the policy is Delete`, `if instead the taint lands first`, `if instead that first guess
misses`. A card that argues an alternative in PROSE alone is outside this row rather than a
deviation from it, because there is no counterfactual state on the canvas for a caption to sign.

### P-01a

Read off the migrated data over all 115 cards: **2 703 chip writes over 700 steps, one identical chip
set per card, zero unstated steps.**

What the rule does NOT reach is the other text axes. Labels, sublabels and pod sublabels are still
inherited on **57 step/axis pairs across 13 cards** (cluster 16, workloads 18, network 23), and part
of that is deliberate: a hidden slot has no text to write.

Closing them in one sweep would repeat the mass-autoedit mistake the root `CLAUDE.md` records.

### P-11

The vocabulary is closed (`chips`, `chipsCued`, `wires`, `labels`, `sublabels`, `podSublabels`,
`opacity`, `lit`, `chain`) and a name outside it draws nothing, throws nothing and reads in a diff as
a plausible line.

A write hidden inside `enter(s, ctx)` is a function body every static reader is blind to, and it
drops out of P-01's chip set with no finding.

### P-13

A SOURCE reader matching `ip: '...'` in an object literal reads it as a Pod ADDRESS written where a
block is built, so a chip key of that name makes a chip value look like a second block carrying the
same address, and makes a real DUP-IP look like a duplicate of itself.

`render/inline.test.mjs` takes the addresses off the RENDERED frames instead, so its DUP-IP reads no
source key at all.

### P-02

Naming a chip for the thing it holds is also what stops it competing with a riding tag for the same
word on screen.

### P-04

What a component KNOWS moves when the answer reaches it. What a component DID moves when the call
lands. Object state moves when the write reaches whatever stores it. Where a step is a SEQUENCE, the
chip steps through it.

### P-05a

A Pod pulse, or a helper walking a listing row by row, is the cue on four cards, and one card leaves
a panel deliberately unlit because the value went back to `none`.

R2 sees none of that: its 29 findings hold ZERO true positives, read one by one on 2026-08-06.

### P-07

`valChip` anchors the name 12 from the left and the value 12 from the right, so a chip needs
name + value + 24 plus a readable gap.

### P-15

The declared form is what lets the spec reader see the value as data and `render/inline.test.mjs`
see the string as drawn.

What makes a ban on a factory arguable is a source-scraping reader: a factory hides every value a
chip shows from one, and zero findings is what that hiding looks like. Nothing can hide that way from
a reader whose input is the rendered diagram.

### P-09a

`report/arrival.test.mjs` carries all seven of those in `R2_STEP_CARRIED` with the reason on each: a
value RETURNING to the steady state after a conditional aside (`cluster-list-watch-informers` crd x3,
`cluster-static-pods` edit-file), a panel emptying because THIS MODE has no such field
(`network-client-ip-preservation` passthrough x2), and a suffix explaining an unchanged state
(`cluster-oom-kill` oomkill, where the state really is still Running).

Cueing any of them announces an event that did not happen, and each is written down in its own
record section as well.

### P-10

Renaming a writer, or swapping which field reaches which, moves the highlight on 191 steps with
nothing failing to resolve.

A `prose.mjs` seed on a writer's NAME is the same coupling one layer out, and `T-16` bans it.

### D-13

The folder, `cards.js`, `posters.js`, `<cat>-kit.js`, `CLAUDE.md`, the record, `CATEGORIES` in
`js/data.js`, the tint block in `css/styles.css`, the colour in `css/tokens.css`, `POSTER_COLORS` in
`js/app.js`, the header of any test that has to know about it, and a `<CAT>.*` block in this file.

### D-14

**Only the first half has a machine.** A step 0 that draws nothing is readable as data, while
`posterFirst: true` is an ARGUMENT inside `defineCard`'s closure and is statically unreachable, so
the rest of the row is a human's.

### R-08a

8 workloads (`rolling-update`, `graceful-shutdown`, `restart-policy`, `crashloopbackoff`,
`statefulset-ordered-startup`, `pvc-stickiness`, `deployment-rollback`, `cronjob`) and 3 storage
(`volume-attach-limits`, `volumeclaimtemplates`, `pvc-retention-policy`).

A broken loop, a mirrored ramp and a follow-the-Pod are the three shapes that need it.

### R-11

It is the shape shown when a card has no poster, `R-poster` guarantees that never happens, and
nothing renders it today.

### S-01

The constructor paints, and `reset()` repaints from scratch rather than undoing anything.

A card that writes a class literal of its own is a second construction path nothing else in the layer
knows about.

### S-02

The legacy surface (`init` alone, from `makeInit`) is NOT a second legal form: writing one is a
regression rather than a choice, and `LEGACY_EXPORTS` stays in the fixture as the DETECTOR that names
it.

### S-03

`buildScene` opens with `host.replaceChildren()` and builds `refs` from nothing, so a replay inherits
no element and no ref from the pass before it.

### S-05

The rule is stated so that a card with NEITHER is a finding. A check that reads a literal only where
it finds one retires itself at exit 0 the day the literal is hoisted out, and **a rule that is silent
when its subject disappears is not a rule**.

### S-07

Blocks that must sit above packets (top-row infra, the chain ladder) are appended AFTER the packet
layer.

### S-08a

The two shapes that read as exceptions are ordinary escapes rather than a second factory:
`storage-fsgroup-ownership` wraps three children through `part.tune`, and
`storage-container-filesystem` wraps a shell wrapper through `part.raw`.

### S-08c

A SOURCE reader finds that prose by matching `'aria-label': '...'`, so a positional argument takes
every one of those sentences out of its input with no finding and no error.

`render/inline.test.mjs` reads the attribute off the rendered diagram instead, over a population of
758 prose strings.

### S-09

The poster shows step 1's text, so a slot-0 string is read by nobody and a slot-0 wire label or lit
block sits under the panel text of the step AFTER it.

Nothing checks this: if a slot-0 `enter()` is longer than the prologue plus its chip resets, look at
what it puts on screen.

### S-10

`makeSteps` generates that order once and runs it on BOTH paths: prologue, the static block, the
card's `enter` escape, then the reduced guard. An escape therefore runs INSIDE the static block and
can never precede the reset.

### S-11

Only the middle is per card, and it is DECLARED (`keys`, `pods`, `extra`) rather than written.

**`reset.extra` running LAST is load-bearing, and an extra put before `clearWires` fails silently.**
The one extra in the catalog (`network-pod-ip-and-veth`) writes `style.strokeOpacity` on a lane and
nothing a wire label owns, so an extra that wrote a wire label would be wiped by the clear that
follows it. No cluster card declares one, and `js/schemes/cluster/CLAUDE.md` records why the
candidate there cannot want one: `dashed: true` writes the dash as an ATTRIBUTE, which an inline
style never touches.

### S-12

**The rule has no successor as a statement about DATA, and that is established rather than assumed**:
a card writes no prologue at all and `clearHL` is on no kit, so a count over the sources is the only
form the rule has.

### S-16

The last of the four is where a wrong `reducedLit` derivation lands.

### S-17

What it cannot derive is a highlight the static path shows INSTEAD of a pulse, and that is
`reducedLit`.

### S-19

**Confusing the two leaks a class that ACCUMULATES.** Prev and reset replay 0..n, so the box stays
lit for the rest of the card and gathers one more with every step, which is how FIVE networking cards
carried it at once.

Nothing in the suite can see it: `render/reduced.test.mjs` compares the two paths against each other
and both accumulate identically (its `HIGHLIGHT` axis reports rather than fails in any case), arrival
looks at receivers, and palette reads a lit element as a legal state. Only a per-step dump of the
whole class set shows it.

### S-22

A helper only `lib/` calls (`scene-spec.js`, `step-spec.js`) stays in `lib/` unexported, and taking a
name off all four removes no behaviour, since the callers inside `lib/` are untouched.

**The size of the list is not written down anywhere on purpose: `R-kitparity` is the source of
truth.** It compares the four to each other, so a name added to one and not the rest fails
immediately.

### S-25

A card reaches it through the verb, never through an import, so the magnitude stays in `PULSE_BLOCK`
instead of being retyped as keyframes.

**No calls is not proof of dead code**, and this row is where that argument is paid for: it carries
no card importer of any kind and is load-bearing all the same.

Do not drop it from one kit, because the four re-export lists only move together.

### S-25a

Same reasoning as `S-25`: no calls is not proof of dead code. It is the animated-path half of a pair,
where `step.enter` is the both-paths half and 42 steps use that one.

Removing it would leave a card needing an imperative beat in motion ALONE with no door, which is how
a DSL grows a verb it does not need (`S-27`). `F.run` at delay 0 covers ten of its thirteen sites.

### S-25b

Third of its family, after `S-25` and `S-25a`, and the family has its proven case in `flashChips`.

Zero is what the verb SHOULD read while every ring the catalog draws lands under a ball: a call
naming the last point of a route in its own step at that route's own arrival is redundant, because
`packetAlong` already fires `arrivalRipple` there and the verb draws a second ring on top of the
first.

That makes such a site redundant, not the verb: a ring on a point NO ball lands on is a thing `M-14`
cannot express and only this verb can.

### S-25c

Fourth of the family, and the only one whose zero is a BAN rather than an absence of a use case:
`S-25`, `S-25a` and `S-25b` all read "nobody has needed it yet", this one reads "`M-27` says do not".

It stays for two reasons that have nothing to do with a card wanting it. `S-25` keeps `flashChips`
on the four kit surfaces and names this verb as the one caller that justifies the export, so deleting
the verb would leave that row defending an export nothing reaches. And `unit/spec-steps.test.mjs`
asks what KIND of part sits behind every flash target, which is the door `M-26` is watched through:
a check whose subject is deleted stops failing at exit 0, and the population it guards can reopen
the day somebody adds the first call back.

### S-26

A factory is correct here because the scene and the steps are DATA, and that frame is the whole of
the skeleton.

### S-27

What is left per card is the escapes, counted by hook kind in `scheme/CLAUDE.md`, which is where
`unit/docs-census.test.mjs` compares that census against the tree. Three categories out of four grew
the DSL zero times, and network's two additions were serialised through the coordinator.

### S-33

Only the browser smoke sees it.

### S-35

A rule true of one category goes to that folder's `CLAUDE.md`. A rule true of two or more goes here.
A measurement or a rejected alternative goes to that card's record section. History goes to the
bin.

### S-37

There is no separate design record and one is not coming back, so a note with nowhere to sit means
the code it describes has no owner yet.

### S-48

**The distinction is what the date is ATTACHED to.** A date on a MEASUREMENT is provenance for a
figure someone can re-measure and is legal (`measured 2026-08-06 over the whole catalog`). A date on an EDIT
is a changelog and is not (`renamed 2026-08-19`, `the 153 this block carried until`).

Where a rejected attempt still has to bind, it binds as a `DO NOT` or a `WHY NOT` carrying the number
that kills it, with no story around it.

`S-34` says this for a card comment and caps it at two lines. This row says it for EVERY comment in
the tree and EVERY block of a record.

### S-49

The absolutes in this file, in `scheme/CLAUDE.md` and in the four folder contracts are compared
against a census computed off the specs and the records.

**A CATALOG-WIDE quantity is not stated in a card record at all.** A record explains ONE card, and
a card's own measurement stays true until that card is edited. A population, a catalog median or a
rank against either belongs to the CATALOG: it goes stale the moment a card lands in any category,
including a category the record has nothing to do with. One card arriving in `cluster/` invalidated
37 such numbers across 15 cluster records at once.

So a record names the EXECUTING HOME instead of copying the answer, which is the same rule the root
`CLAUDE.md` states for the count of checks the suite runs. The homes are
`report/baselines.test.mjs` for the reading-pace baseline, the long-narration cohort, the per
category duration shape and the `M-27` population, `card-review/tools/deadair.mjs` for still time,
`card-review/tools/pace.mjs` for ball speed, `report/overlay.test.mjs` for panel extents and
`card-poster/tools/poster-lint.mjs` for the poster medians. Section 7 of `baselines` prints which
records still carry a copy. The cluster record is the worked example.

### S-50

They name 55 distinct ids between them and carry no copy of a rule text, which is what keeps a skill
short and what stops it drifting from the rulebook it drives.

### S-38

`unit/docs.test.mjs` anchors each note to a line of code with ``### before `<line>` ``. **205 anchors
today**, all four records (cluster 19, workloads 41, network 80, storage 65). **The walk fails on a
record it cannot read instead of running shorter** (`S-46`).

**A RECORD HAS TWO SHAPES and the walk reads both.** One `CARDS.md` holding every `## <card id>`
section, or a `CARDS/<card-id>.md` per card with `CARDS.md` keeping the preamble and the index.
`recordFiles` in `test/fixtures/catalog.mjs` decides which by looking for the folder, so a category
choosing either is covered without a reader knowing its name, and a `CARDS/` that exists and reads
empty is a failure rather than a shorter walk. Cluster is split, the other three are not.

**An anchor is unique only WITHIN its `## <card id>` section, never across a record.** The resolver
looks the line up in that card alone, so duplicates are legal where they sit: 13 anchor texts are
duplicated today (network 5, storage 8), worst ``const CX = 600;`` in 12 sections catalog-wide and
``const LEFT_X = 400;`` in 7.

### S-40

What it asserts, and what it is BLIND to, is how you learn to read its output, and that header is the
only copy.

### S-41

All three also still exclude the two deleted paths, the old harness directory and the old record, and
those entries STAY: an exclusion whose target is gone costs nothing and covers anyone who recreates
the path.

**The container has two files of its own that no allowlist has an opinion about**, because neither
workflow copies them and only the blanket `COPY . .` does. Found by opening the running container
rather than by reading a list: `/configs/nginx.conf` and `/.dockerignore` both answered 200. Nothing
on kube.how is affected, since `deploy.yml` stages `_site` by name and neither is on it, but the
release zip ships `configs/` on purpose so the image can be built, and everyone who runs it served
both. The two closures are asymmetric, which is why `unit/files.test.mjs` asserts each separately:
`.dockerignore` excludes ITSELF (it is read before the context is assembled), while `configs/` cannot
be excluded at all (the `COPY configs/nginx.conf` two lines above needs it IN the context, and an
ignore rule applies to the whole context whatever the COPY order), so the Dockerfile removes it from
the web root after the copy.

The blanket `COPY . .` is asserted with them, and it is not a detail: it is what makes the local
container the cheapest detector of a file the two allowlists would have shipped by accident. A
selective copy would satisfy every list-comparison in that file and retire the detector in silence.

### S-42

The failure `P-08` records was CROSS-category (one shared helper defaulted every caller to `cluster`
and put 82 workloads chips on the cluster palette), and a binding a category kit makes cannot reach
another category, so that path does not exist.

The permission is void without all four conditions: a `node()` part takes no role at all, Pod parts
take a SEPARATE `podRole`, any part may override the bound role explicitly at its own call, and
`render/palette.test.mjs` stays the guard on the result.

### S-46

`if (!existsSync(md)) continue;` walks past a record it cannot open and stops checking that record's
anchors at exit 0, with no finding and no error.

### S-47

A row claiming `test:<file>/<name>` names a file `npm test` really runs and a name that file really
prints, no id is used twice, no id block skips a number, and every test file is cited by at least one
rule.

The same holds for the `Source` column: every repo path it cites has to resolve, or the rulebook
points at a file that no longer exists.
