# CANON.md: the card rulebook

Every rule true of a scheme card catalog-wide, one row each, with a stable id. Load it before you
design, build, review or repair a card. Process lives in the root `CLAUDE.md`, and what a check sees
or misses lives in the header of that test file.

A card may break a row on purpose. It then records the reason as a `DEVIATES` line in its record
(`js/schemes/<cat>/CARDS/<id>.md`). Breaking one by accident is the defect.

No row is retired. A rule whose subject disappears is reworded onto whatever still holds its job.
`cd scheme/test && node tools/canon.mjs --check=review` prints the rows no machine covers.

## How to read a row

| Column | Means |
|---|---|
| `ID` | stable. Cite it in a review, a record or a commit message. Ids are never reused |
| `Rule` | ONE line, stated as the thing that must be true |
| `Check` | who enforces it, see below |
| `Source` | where the measurement or the implementation lives. A file, never a line number |

The `Check` column takes exactly five value shapes:

| Value | Means |
|---|---|
| `test:<file>/<name>` | `cd scheme/test && npm test` fails. Cannot land broken |
| `report:<file>/<name>` | a test measures and prints it and does not fail on it. Read a finding against the card record before calling it a regression |
| `skill:<tool>/<name>` | a tool under `.claude/skills/*/tools/` decides it and emits a finding. It runs only when a human or a skill invokes it |
| `hook` | `.claude/hooks/check-js.sh` fires on write and can hard-fail the edit with exit code 2 |
| `review` | no machine anywhere. A human is the only thing between this rule and a defect |

`<file>` is the test file's basename without `.test.mjs`, unique across `unit/`, `render/` and
`report/`. `<tool>` is the tool's basename without `.mjs`, and the kind before the colon picks the
namespace. `<name>` is the axis the run prints, or the rule id where the file has no axis. A row may
carry several values, comma separated, and may name a file with no `/<name>` when the whole file is
the answer. `skill:` or `test:` paired with `review` means the machine sees one half of the rule. A
tool that only prints numbers is not a `skill:` value. `R-01` to `R-12` are poster rows, while
`R-<word>` (`R-dash`, `R-srcdup`, `R-poster`) names an axis a test prints, never a row.
`unit/docs.test.mjs` group E resolves every value.

---

## L: layout and the narration panel

| ID | Rule | Check | Source |
|---|---|---|---|
| L-01 | The safe-zone is an L, not a forbidden box: the overlay covers the top-left quadrant only, so the usable area is the full width below its bottom PLUS the full height right of its right edge | review | this file |
| L-02 | The narration panel's RIGHT edge is `x<=397` on every card, on every viewport | report:overlay/L-02 | `test/report/overlay.test.mjs` |
| L-03 | Nothing starts left of x=420 unless it also sits below that card's own panel bottom | review | L-02 |
| L-04 | The panel BOTTOM is per card and ranges about 90 to 379 over the standard viewport set. The shallow end is a cluster many cards share: read the value the report prints, never the card id beside it | report:overlay/L-04 | `test/report/overlay.test.mjs` |
| L-05 | The panel moves NON-MONOTONICALLY against the PICTURE and one way only against the VIEWPORT (a wider dialog wraps into fewer lines), so it is never measured on one viewport | report:overlay/L-05 | `test/report/overlay.test.mjs` |
| L-05a | **The panel's movement is a TYPOGRAPHY problem, not a height problem**: clamping the height does not touch it, and closing it needs type that scales with the diagram | report:overlay/L-05a | `scheme/css/styles.css` under `.narration-overlay` |
| L-05b | The panel ALSO changes height between the STEPS of one card. Pinning `min-height` to the tallest narration is not done: it leaves an empty strip inside a drawn border, which reads as a fault | review | `scheme/css/styles.css` under `.narration-overlay` |
| L-06 | The standard viewport set is `1600x1000`, `1280x860`, `1100x800`. A card may pin a stricter row of its own (storage cards carry `900x650`), and where the two disagree the card takes the stricter number and says so | review | `test/report/geometry-soft.test.mjs`, `VIEWPORTS` |
| L-07 | A card's measured panel extent is never a constant: the reserved corner is a fact about the panel, not an input to the layout | review | this file |
| L-08 | The panel bottom is often a CHARACTER BUDGET, and editing prose for accuracy spends it silently. Re-measure after any prose edit on such a card (`OCCLUDED` will not tell you) | report:overlay/L-08 | `test/report/overlay.test.mjs` |
| L-08a | **A card that carries a two-column X grammar picks the first of `A` / `B` / `C` that fits above its OWN measured panel bottom**, and reads the columns out of its kit's `LAYOUT` rather than typing them | test:module/L-08a | `js/schemes/workloads/CLAUDE.md` `WL.L-06`, `js/schemes/cluster/cluster-kit.js` |
| L-09 | A segment is horizontal or vertical. Nothing runs diagonally | test:geometry/DIAGONAL, test:spec-scene/DIAGONAL | `test/render/geometry.test.mjs` |
| L-10 | No segment crosses a block it does not terminate on | test:geometry/THROUGH, test:spec-scene/THROUGH | `test/render/geometry.test.mjs` |
| L-11 | An endpoint sits on a block FACE MIDPOINT, never a hand-typed coordinate near one, or on a Node FRAME face level with the block inside it that the lane addresses | test:geometry/OFFEDGE, test:spec-scene/OFFEDGE | `test/render/geometry.test.mjs` |
| L-12 | Two endpoints on ONE face at mirrored offsets (`+d` and `-d`, any `d`) are a deliberate lane pair and not a finding, pooled across all steps because a pair whose halves live in different steps is still a pair | test:geometry/OFFEDGE, test:spec-scene/OFFEDGE | `test/render/geometry.test.mjs` |
| L-13 | The content bbox centres within 40 units of x=600, and the chip strip within 6 | report:geometry-soft/CENTRE | `test/report/geometry-soft.test.mjs` |
| L-14 | Blocks sitting BELOW the overlay centre on x=600 too: the full width is free there | report:geometry-soft/CENTRE-LOW | `test/report/geometry-soft.test.mjs` |
| L-15 | No block sits substantially under the narration panel | report:geometry-soft/OCCLUDED | `test/report/geometry-soft.test.mjs` |
| L-16 | **Do not close a `CENTRE` finding by stretching a strip or widening a frame.** If a finding can only be closed by making the picture worse, leave it OPEN and write the reason into the card's record | review | the `OPEN` lines of each category's records (`CARDS.md` indexes them), and `test/report/geometry-soft.test.mjs` for the findings |
| L-17 | `CENTRE` and `CENTRE-LOW` count neither `node()` frames nor chips, so a card balanced by a frame full of chip rows still reports. Read a finding against the card record before treating it as a regression | report:geometry-soft/L-17 | `test/report/geometry-soft.test.mjs` |
| L-18 | Never set `font-size` as a presentation attribute on a label: the class rule outranks it, so it never renders and a clearance budget sized off it is wrong. Add a class in `diagrams.css` instead | test:files/L-18 | `scheme/css/diagrams.css` |
| L-19 | Nothing in the suite measures WIRE-LABEL width. `render/chipfit.test.mjs` measures chips only | review | `test/render/chipfit.test.mjs` |
| L-20 | Text rates are PER CLASS and MEASURED: a sublabel is 6.03 units per character, chip text 6.89, and a box label is proportional, so measure the string | review | `js/schemes/storage/CLAUDE.md` |
| L-21 | **Await `document.fonts.ready` before measuring anything in the DOM**, or you measure the fallback, which is about 20 percent narrower and flatters you. Never eyeball a width off a screenshot | test:geometry/L-21, test:chipfit/L-21 | root `CLAUDE.md` |
| L-22 | A card that needs room should check L-01 first: on a cramped card the room is usually already there | review | this file |
| L-23 | **Every `node()` frame pads what it holds by 34 under its top and 12 over its floor, in every category**, measured to the outermost lane, tag or label. A frame departs only where that is impossible, as a `DEVIATES` line | review | each category `CLAUDE.md` lists its departures |
| L-24 | Growing a Node frame to the `L-23` padding grows it UPWARD if the bottom stays at 624, so re-check the gap to whatever sits above | review | L-23 |

## A: arrows, lanes, wires, connectors

| ID | Rule | Check | Source |
|---|---|---|---|
| A-01 | Every ball rides a DRAWN wire. No ball travels over blank canvas | review | this file |
| A-02 | The SAME points array feeds the static wire and the packet route, so the two cannot drift | test:lane-shared/A02-SHARED, report:lane-traffic/A-02 | `test/unit/lane-shared.test.mjs` |
| A-03 | Return traffic gets its OWN lane, offset by the card's lane delta. A return re-using the outbound arrow reads as the query bouncing, not as an answer coming home | review | this file |
| A-04 | One wire per destination. N destinations get N wires, drawn even when a step takes one, so the reader sees the choice was made among drawn alternatives | review | `js/schemes/network/CLAUDE.md` |
| A-05 | **A wire nothing rides carries no arrowhead.** Use `relationPath({ points, d, role, dash })`: both `arrow()` and `pathArrow()` always attach a marker, and a marker with no traffic under it reads as traffic | test:lane-shared/A05-CARRIED, report:lane-traffic/A-05 | `lib/scheme-kit.js`, `relationPath` |
| A-06 | **Which of the two a lane IS is decided by the step's own words**: if a step NAMES something travelling that way it earns a ball, otherwise it is a relationship | review | `js/schemes/workloads/CLAUDE.md` |
| A-07 | Audit lane style by grepping `class: '...scheme-arrow`, not `arrow(`: a copy spelled with `line()` loses the dash and the dim and draws brighter than the lanes that carry balls | review | this file |
| A-08 | `relationPath` carries `scheme-arrow-relation`, which the CSS gives `stroke-opacity: 0.45` rather than a darker literal, so it multiplies with the card's own fades | review | `scheme/css/diagrams.css`, the relation note |
| A-09 | **A lane leaves the box that ACTS**, which on a control-plane card is almost never the leftmost box: a controller writes to the API, so the lane into the Node band leaves the API | review | `js/schemes/workloads/CLAUDE.md`. `workloads-force-deletion` is the model |
| A-10 | Where two actors reach one slot, draw TWO lanes over a shared drop rather than picking a winner | review | `js/schemes/workloads/CLAUDE.md` |
| A-11 | Moving a lane is a TIMING change, because `routeDur` is length-based: moving a start 300 to 400 units right adds 250 to 870ms per ball. Raise the duration, never shorten the motion | test:duration/OVERRUN, review | `lib/scheme-kit.js`, `HOP_MS` note |
| A-12 | A box can be DERIVED FROM a lane (`KUBECTL_X = SPINE_X - BOX_W / 2`), so redefining the spine moves the box instead of the lane. Such a card needs its own constant | review | `js/schemes/workloads/CLAUDE.md` |
| A-13 | **A lane's shade is `min(source, sink)`**, never one end alone: deriving from one end draws a full-strength arrow out of a ghost Pod at 0.12 | test:opacity/PHASE | `lib/scheme-kit.js`, `laneOf` |
| A-14 | A lane whose far end is GONE goes to 0, not to a dim shade: a block leaves a hole when it vanishes so it dims instead, but an arrow into nothing leaves no hole and reads as a rendering fault | review | `lib/tokens.js`, `OPACITY` note |
| A-15 | **A lane carrying a ball must be visible for the whole flight**: pin its final value statically, then animate the fade with `fill: 'both'` at the fade's delay, so it holds full through the delay window | test:reduced/OPACITY-OWN | `lib/tokens.js`, `OPACITY` note, rule 3 |
| A-16 | A block's opacity and its lanes' opacity are stated in ONE place: a card-local `stage()` factory returning the whole `opacity` field, never two independent entries | review | `lib/tokens.js`, `OPACITY` note, rule 1 |
| A-17 | `arrow()` and `pathArrow()` take `role` explicitly. Arrows carry `data-role` and are colour-checked | test:palette/SPREAD | `lib/primitives.js` |
| A-18 | `dim` on an arrow is a stroke WEIGHT, not a lifecycle state: the role wins the stroke and `dim` survives as `stroke-width: 1.4` | review | `scheme/css/diagrams.css`, the `dim` decision note |
| A-19 | A ball never travels under or over a block: every endpoint sits on an EDGE, so a rewrite INSIDE a box (DNAT, SNAT, port remap, conntrack) is drawn as a fade at one edge and a re-emergence at the far edge | review | `js/schemes/network/CLAUDE.md` (`NET.A-01`) |
| A-21 | A lane from the actor row into a Node band ends on the FRAME FACE, never on a Pod inside the frame: an endpoint on the Pod pierces the frame and draws the actor reaching THROUGH the Node rather than acting on it | report:frame-face/WL.A-03 | `js/schemes/workloads/CLAUDE.md` (`WL.A-03`), and `test/report/frame-face.test.mjs` for the queue |
| A-20 | **A relation is DASHED whether it says so or not, and takes a role it never asked for**: `relationPath` classes every one `scheme-arrow-dashed`, so `dash` only OVERRIDES that pattern, and `P.relation` fills `role` from the kit binding | review | `lib/scheme-kit.js` `relationPath`, `lib/scene-spec.js` `roledPart`, `css/diagrams.css` |
| A-22 | **Every drawn line takes its category ROLE, and `role: ''` says nothing.** Suppressing it drops the hue from the stroke AND the arrowhead. Weight is `dim`, recession is `.scheme-arrow-relation` at 0.45, and both of those KEEP the hue | review | `css/diagrams.css`, the note above `.scheme-arrow-dim`, and `A-20` for the mechanism |
| A-23 | **An out-and-back lane pair sits 12 either side of its centre line, 24 apart, in every category.** A tag that would ride between the two rides outside them. A pair departs only where 24 would run it through a block | review | `lib/layout.js` (`laneY`), `CLU.LANE_DY` and `WL.LANE_DY` |

## M: motion

| ID | Rule | Check | Source |
|---|---|---|---|
| M-01 | **Only Pods pulse.** Block auto-pulse is off catalog-wide (`autoPulse: false` is the `makeInit` default). Infrastructure lights through `.highlight` or `lightBoxAt` and never pulses. **This row outranks `M-27`** | test:motion/PULSE-POD | `lib/timeline.js`, `lib/scheme-kit.js` |
| M-02 | A card never calls `pulse(` from `primitives.js` directly. Pods pulse through the kit's `pulsePod` | test:motion/PULSE-KIT | `test/render/motion.test.mjs` |
| M-03 | **A Pod pulses with everything inside it.** The pulsed element is always the `g` holding the shell AND its inner boxes | test:motion/PULSE-WHOLE, test:motion/PULSE-TOGETHER | `lib/scheme-kit.js`, `pulsePodWithTint` |
| M-04 | Pulse is `filter: brightness(...)`, never `transform: scale(...)`: diagram elements carry a `translate` a scale would compose-clobber | review | `lib/scheme-kit.js` |
| M-05 | The pulse names only its PEAK (`<CAT>_TINT.bright`) and starts and ends on the rect's own stroke, lit or unlit. Measure a resting stroke under `reducedMotion` | test:palette | `lib/tokens.js`, `PULSE_POD` |
| M-06 | Pod pulse is 900ms (450 up, 450 down), bright 1.4, dim peak 0.8. One length, catalog-wide, with no per-card override | test:motion/PULSE-SHAPE | `lib/tokens.js` `PULSE_POD` |
| M-07 | A DIM Pod needs `pulsePodDim`: the ordinary pulse plus an opacity lift to `PULSE_POD.dimPeak` and back, or the blink is invisible against the 0.55 it sits at | review | `lib/scheme-kit.js`, `pulsePodDimWithTint` |
| M-08 | **Where a Pod both pulses and fades out in one step, the pulse comes FIRST**: pulse delay `<=` fade delay, or the two read as one event. A Pod that fades without a pulse owes a reason | test:opacity/ORDER, report:pod-fade/M-08 | `test/render/opacity.test.mjs`, `test/report/pod-fade.test.mjs` |
| M-09 | **Packets animate `transform: translate(Xpx, Ypx)`** on a `cx=0, cy=0` circle, never SVG `cx`/`cy` | test:motion/TRANSFORM | `lib/scheme-kit.js`, `packetAlong` |
| M-10 | **Each packet must represent literal traffic the step narrates**, not decoration on a connector | review | this file |
| M-11 | Three packet flavours and no fourth: in-diagram hops `segmentPacket` (linear), right-angle routes `routePacket` (eased, distance-normalized), top-row request/ack hops `topPacket` (eased) | review | `lib/scheme-kit.js` |
| M-12 | **Routes take no explicit `dur`.** Travel time comes from path length at 0.45 units per ms, so a ball moves at one speed everywhere. An explicit `dur` is reserved for narrative pacing and needs a one-line justification at the call site | test:motion/SPEED | `lib/scheme-kit.js`, the `HOP_MS` speed-canon note |
| M-13 | `routeDur` clamps to `[700, 2600]`: a route under about 315 units takes the 700ms floor and one over about 1170 the 2600ms ceiling, so only between them is the pace 0.45. Tune pacing there, in one place | test:motion/CLAMP | `lib/scheme-kit.js` |
| M-14 | Every packet ripples at its destination. The delivered cue is part of the arrival canon with no per-call opt-in, and the ripple carries `.scheme-ripple` rather than `.scheme-packet` so anything counting packets sees ONE ball per hop | test:motion/ARRIVE, test:ripple-single/RING-SINGLE, report:ripple-double/SIMULTANEOUS | `lib/scheme-kit.js`, `arrivalRipple` |
| M-15 | **Up-arrow (Pod to infra): the Pod pulses at 0 and its ball leaves at `BEAT.afterPulse`** (800, just under the 900 blink) | report:motion/BEAT | `lib/tokens.js`, `BEAT` |
| M-16 | **Down-arrow (infra to Pod): ball first, Pod pulse at its arrival**, declared as `pulse: '<podKey>'` on the ball, which `expandFlow` turns into an `F.pulse` at the ball's arrival | report:motion/BEAT | `lib/tokens.js`, `BEAT` |
| M-17 | Chained hops: `delay: prevHop.arrivalMs + BEAT.afterHop` (100), written as `after: '<name>'`. **Never hard-code a delay** | report:motion/BEAT | `lib/tokens.js`, `BEAT` |
| M-18 | A controller that self-initiates with no preceding hop or pulse waits `BEAT.lead` (800), so the lit source registers before the ball leaves. `lead` and `afterPulse` are one number, so no probe tells M-15 to M-18 apart | report:motion/BEAT | `lib/tokens.js`, `BEAT` |
| M-18a | **The SENDER is cued before its ball leaves**, in one of two shapes and no third: a block that ACTS FIRST is named in that step's `lit`, a MID-CHAIN block is named in the `lights` of the hop before it | report:arrival/R4 | `test/report/arrival.test.mjs` |
| M-19 | A step must OUTLAST its own motion: `span <= duration`. Fix an overrun by raising `duration`, never by shortening motion | test:duration/OVERRUN, test:spec-steps/M-19 | `test/render/duration.test.mjs` |
| M-19a | The OTHER side of M-19: a step also stands STILL for `duration - span`. A step far more still than its siblings and unremarkable on ms per character needs more motion or less narration, never `duration` alone | review | `.claude/skills/card-review/tools/deadair.mjs` |
| M-20 | **Geometry changes are timing changes**, because `routeDur` is length-based. After ANY geometry change re-check the span of EVERY step, not just the one you moved | test:duration/OVERRUN, review | `test/render/duration.test.mjs` |
| M-21 | A Pod materialises over `FADE.in` (600, ease-out) and dissolves over `FADE.out` (700, ease-in). A narrative-slow fade keeps an explicit duration with a justification at the call | report:motion/FADE | `lib/tokens.js`, `FADE` |
| M-22 | A newborn construction reveals over `REVEAL_MS` (500), which runs BEFORE the ball leaves (`BEAT.lead` is 800), so a block and its lanes are fully present by the time anything is sent down them | report:motion/FADE | `lib/scheme-kit.js`, `REVEAL_MS` |
| M-23 | `revealAt` must not short-circuit on `delay <= 0` straight to opacity 1, which plays no fade AND throws `from` away. Under `ctx.reduced` it snaps to full, never otherwise | review | `lib/scheme-kit.js`, `revealAt` |
| M-24 | `revealAt`'s `from` is the shade an object rests at while a lane already points AT it. Hiding it outright aims the arrowhead at blank canvas for the whole flight | review | `lib/scheme-kit.js`, `revealAt` |
| M-25 | `animateAlong` honors `options.delay`. Dropping it makes packets teleport invisibly during the delay window | report:motion/BEAT | `lib/primitives.js` |
| M-26 | **Value chips NEVER flash**, and neither does the block a value is about: a changed value is cued as a STATIC highlight (`P-05`) | test:spec-steps/M-26 | this file, P-05. `test/render/motion.test.mjs`, `test/unit/spec-steps.test.mjs` |
| M-27 | A packet-less, pod-less step carries its beat with `.highlight` ALONE. **`F.flash` is not a second option**: `flashChips` animates `filter: brightness`, which `M-04` calls a pulse and `M-01` forbids on infrastructure | test:spec-steps/M-26 | `lib/step-spec.js`, `flash`. `lib/scheme-kit.js`, `flashChips` |
| M-28 | **`lightBoxAt` and `at` use an EMPTY keyframe list, and that is load-bearing.** Naming `opacity` composites the target for the whole delay window, and promotion cascades to whatever overlaps it | test:motion/TIMER | `lib/scheme-kit.js`, `lightBoxAt`. Verify with CDP LayerTree, never by pixel diff: headless software rendering shows nothing |
| M-29 | Grep for `animate([{ opacity: 1 }, { opacity: 1 }]` to check M-28 has not come back | test:motion/TIMER | `lib/scheme-kit.js`, `lightBoxAt` |
| M-30 | **A tag is declared on its ball** as `tag:` in `F.route`, `F.segment` or `F.top`, and `expandFlow` gives it the ball's path, start, easing and travel time. A standalone `F.tag` is only for a tag that emerges from a block | test:motion/RIDE | `lib/scheme-kit.js`, `makeRidingLabel` |
| M-30a | **A tag lives exactly as long as its ball**: every ball and every tag fades 200ms, in before departure and out on arrival, `hold: 0` and never negative. A clash with the landing block moves the TAG, never its fade | review | `network-dualstack`, `storage-emptydir` |
| M-31 | A riding label is pinned at the route START at build, or it sits at the SVG origin until `animateAlong`'s delay elapses and its fade-in plays in the top-left corner under the narration panel | test:motion/RIDE | `lib/scheme-kit.js` |
| M-32 | `ridingLabel` binds its per-card constants ONCE at module scope through `makeRidingLabel({ role, dy, dx, easing, inMs, outMs, hold, emergeMode })`. Never write a local copy of it, of `lightBoxAt` or of `at` | review | `lib/scheme-kit.js` |
| M-33 | Every animation goes through `ctx.register(...)`, so a step change cancels it | review | `lib/timeline.js` |
| M-34 | An added hop costs about 800ms (a short gap sits on the 700 floor plus `BEAT.afterHop`), so `duration` usually has to rise and `render/duration.test.mjs` says by how much | test:duration/OVERRUN, review | `lib/tokens.js`, `BEAT` |
| M-35 | **A SEEK cannot see a deferred effect**: `seekStep` sets `currentTime` and never fires `onfinish`, so every `at(...)` turnover, `lightBoxAt` arrival class and deferred `setWire` is missing. Verify a turnover with `tools/settled-dump.mjs` | review | `test/fixtures/render.mjs`, `seekStep` |

## C: colour, roles and the opacity vocabulary

| ID | Rule | Check | Source |
|---|---|---|---|
| C-01 | **`role` is a palette slot, not the card's category.** A workloads card writes `role: 'cluster'` on its kubelet box on purpose | test:palette/UNKNOWN | `test/fixtures/palette.mjs` |
| C-02 | **`role` is bound ONCE, in the category kit, and writing one at a call site is an OVERRIDE rather than a default.** An explicit `''` or `null` paints the generic fallback. See S-42 | test:palette/UNPAINTED | `lib/scheme-kit.js`, `valChip` |
| C-03 | One `(category, element class, role, state)` tuple resolves to ONE colour. `render/palette.test.mjs` catches a role that resolves inconsistently, NEVER a role that was the wrong one to ask for | test:palette/SPREAD, report:palette-steps/CONFLICTING | `test/render/palette.test.mjs` |
| C-04 | Every opacity between 0 and 1 comes from `OPACITY` in `tokens.js`, so a shade learned on one card reads correctly on the next. A bare `0` or `1` is fine | test:opacity/PHASE, test:skeleton/C-04 | `lib/tokens.js` |
| C-05 | `OPACITY.running` 1.00: in focus and working | test:opacity/PHASE | `lib/tokens.js` |
| C-06 | `OPACITY.pending` 0.55: declared, not working yet | test:opacity/PHASE | `lib/tokens.js` |
| C-07 | `OPACITY.notready` 0.40: alive but not serving, not observed, or outside this path | test:opacity/PHASE | `lib/tokens.js` |
| C-08 | `OPACITY.terminating` 0.25: `deletionTimestamp` set, eviction or shutdown under way | test:opacity/PHASE | `lib/tokens.js` |
| C-09 | `OPACITY.terminated` 0.12: gone from the API, or finished | test:opacity/PHASE | `lib/tokens.js` |
| C-10 | A pulse peak (`PULSE_POD.dimPeak`) is a motion magnitude and a presentation shade belongs in CSS. Neither is a phase: do not force them into the vocabulary | test:opacity/PHASE | `lib/tokens.js` |
| C-11 | Nothing holds `.highlight` while it sits at the terminated shade | test:opacity/LIT | `test/render/opacity.test.mjs` |
| C-12 | `render/opacity.test.mjs` judges the RESOLVED value in the browser rather than the source expression, so a named constant cannot smuggle a shade past it | test:opacity/PHASE | `test/render/opacity.test.mjs` |
| C-13 | A LANE has no phase of its own and is not in the vocabulary. See A-13 | test:opacity/PHASE | `lib/tokens.js` |
| C-14 | **A block that does not exist yet DIMS, it is not cut out.** Cutting an absent block leaves a block-sized hole that reads as a rendering fault, so draw it dim with a sublabel saying so | review | this file |
| C-15 | **`data-cat` is chrome, `data-role` is diagram. Never merge them back.** `styles.css` selects the former, `diagrams.css` the latter, and the two files do not cross | review | `scheme/css/` |
| C-16 | A tinted category declares FOUR opaque colours as CHANNEL LISTS (`--tint-deep-rgb` / `-base-rgb` / `-bright-rgb` / `-canvas-rgb`) plus three hand-mixed surface fills, and nothing else | review | `scheme/css/styles.css` |
| C-17 | Channel lists rather than hex, because `rgba()` cannot take a hex through a `var()` | review | `scheme/css/styles.css` |
| C-18 | **Every shade WITH an alpha is derived ONCE in the shared `[data-tinted="true"]` block.** Adding a shade is one line there, never four. Restating alpha per category lets a `--tint-glow` disagree with its own `--tint-base` | review | `scheme/css/styles.css`, the tinted dialog block |
| C-19 | **Do not re-add a per-category `.narration-overlay` background.** Retint through `--tint-canvas-rgb` and the panel follows | review | `scheme/css/styles.css`, `.narration-overlay` |
| C-20 | `color-mix` is deliberately unused, so colour resolution stays fully deterministic | test:files/C-20 | `scheme/css/styles.css`, the tinted dialog block |
| C-21 | Networking is the one category whose colour appears as a LITERAL in `diagrams.css`: `.scheme-packet` and `.scheme-ripple` pin `#4fe5ff` because the tint stop washed the ball out. Do not fold those into tokens | review | `scheme/css/diagrams.css` (`NET.C-01`) |
| C-22 | Retinting a category touches the kit's `<CAT>_TINT`, `css/tokens.css`, the tinted block in `css/styles.css`, `POSTER_COLORS` and the folder `CLAUDE.md`. **All categories agree across all five. A mismatch is a regression** | review | this file, D-13 |
| C-23 | A green above roughly 50 percent saturation goes acid on this canvas. If a new green shade is needed, move LIGHTNESS, not saturation | review | `js/schemes/storage/CLAUDE.md` (`STO.C-01`) |
| C-24 | The Lifecycle coral `#ff668c` is NOT reserved anywhere in `scheme/`, `tokens.css` included. Outside it, `--ts-tools-color` in `cli/css/styles.css` and the root `404.html` game palette carry it, unrelated slots | test:files/C-24 | `test/unit/files.test.mjs` |

## T: text, narration and terminology

| ID | Rule | Check | Source |
|---|---|---|---|
| T-01 | **No apostrophes** in narration, wire or chain strings: they are single-quoted JS and an apostrophe breaks the module load. Reword | hook, test:inline/T-01 | `.claude/hooks/check-js.sh` |
| T-02 | Verify T-01 with a browser smoke, not just `node --check`: the hook catches the syntax error, `render/smoke.test.mjs` catches the ReferenceError class it does not | test:smoke, test:inline/T-02 | `test/render/smoke.test.mjs` |
| T-02a | **Plain `node --check` and the browser do not agree, the hook's module parse does.** Never derive an identifier from data (a chip name, a label) without checking it against the reserved-word list | test:smoke | `.claude/hooks/check-js.sh` |
| T-03 | **No semicolons** in narration prose: use a comma, or a period plus a capital | test:text/T-03, test:inline/T-03 | this file |
| T-04 | **Neither an em-dash nor an en-dash, anywhere.** The prose says "no em-dashes", the rule bans both | test:text/T-04, test:inline/T-04 | `test/unit/text.test.mjs` |
| T-05 | `R-dash` scans the card modules, the manifests, the kits, this file, and the named root and `cli/` files. The records are deliberately OUTSIDE its area, because a record quotes what a card must not write | test:text/T-05 | `test/unit/text.test.mjs`, `dashTargets` |
| T-06 | **Terminology is a dictionary, not taste.** `test/fixtures/terms.json` is the source of truth: hard and hard-lowercase terms and range exceptions fail, soft terms are reported only | test:text/T-06, test:inline/T-06 | `test/fixtures/terms.json` |
| T-07 | Two dictionary decisions are deliberately NOT the upstream ones: the catalogue majority wins (`Kubelet`, `ETCD`, `Node-1` keep their capitals), and `Node`, `Pod`, `Service` are ALWAYS capitalised. `kubectl` is always lowercase | test:text/T-07, test:inline/T-07 | `test/fixtures/terms.json` |
| T-08 | Between them `unit/text.test.mjs` (`desc`) and `render/inline.test.mjs` (every `narration` and every `aria-label`) read all of the prose. Neither can read MEANING | test:inline | `test/render/inline.test.mjs` |
| T-09 | **System A for strings drawn ON the diagram**: a BLOCK LABEL is a heading and takes a capital, everything else on the canvas is body text and stays lowercase | test:inline/T-09 | `test/render/inline.test.mjs` |
| T-10 | Block labels capitalize the FIRST word only. A later word takes a capital only when it is an API object, an acronym or an identifier: `Routing decision` and `CSI controller`, but `ConfigMap app` and `Pod A bind mount` | review | `test/render/inline.test.mjs` |
| T-11 | Hyphenated names capitalize only the first segment, and bare identifiers keep their real casing | review | `test/render/inline.test.mjs` |
| T-11a | **A named API object is drawn as its TYPE, a space, then its own lowercase name**: `PVC data-claim`, `Pod web-0`, `PV x73a`. Never glue the two with a hyphen. A quoted YAML field takes the bare name | review | `js/schemes/storage/CLAUDE.md` |
| T-12 | A node frame label is the exception you cannot fix in the string: `.scheme-node-label` is uppercase catalog-wide by CSS | review | `scheme/css/diagrams.css` |
| T-13 | **One object, one label, across cards.** Strings are only compared inside the same POSITION CLASS, because a heading and a chip name are supposed to differ | test:inline/T-13 | `test/render/inline.test.mjs` |
| T-14 | The value class never fails: an API literal and an English word wear the same letters, so ambiguous pairs are reported for a human to judge and are not findings | report:inline/T-14 | `test/render/inline.test.mjs` |
| T-15 | **A run that reads fewer strings than the last green one has checked less, and it must be red** | test:inline | `test/render/inline.test.mjs` |
| T-16 | **Do not put a SOURCE resolver back into `prose.mjs`.** It carries one sentence splitter and one term matcher and nothing else, because a source resolver collapses silently at exit 0 | review | `test/fixtures/prose.mjs`, which deliberately does not carry the resolver |
| T-17 | **There is no such thing as an unread chip write: a string drawn on the canvas either is there or is not** | test:inline | `test/render/inline.test.mjs` |
| T-17a | **An unreadable chip write is not a category of anything.** What can SEE a chip is the whole of the difference | test:inline | `test/render/inline.test.mjs` |
| T-18 | Two different Pods must not carry the same address, and a request must not exceed its own limit | test:inline/T-18 | `test/render/inline.test.mjs` |
| T-19 | **An absolute in a narration is a defect waiting to be found**, and the counter-case is usually a sibling card. Grep for `only`, `never`, `always`, `the whole of`, `all`, `nothing` before shipping a sentence | report:text/T-19 | this file |
| T-20 | The fix for T-19 is a CLAUSE, not a rewrite. **If a sentence needs a condition to be true, spend the characters**: cutting a condition to fit a band leaves a true sentence standing as a false absolute | review | this file |
| T-21 | **If a step NAMES an actor, that actor has to be on the card** | review | this file |
| T-22 | Same test for a WIRE LABEL: it may only name traffic that rides THAT lane | review | this file |
| T-23 | A component the docs mark `(optional)` must say so on the card: on the BLOCK when it is genuinely absent in a large share of clusters, in the NARRATION when it is near-universal but replaceable | review | this file |
| T-24 | **Any edit that changes or adds a technical claim gets the internal-contradiction check before it lands**: read what the card's other steps, chips, labels and `aria-label` already assert | review | root `CLAUDE.md` |
| T-25 | **Matching the narration is a PROXY for being true.** A sentence can be silent about something real (check the `aria-label` too, it often says what the steps left out) and a sentence can be loose | review | this file |
| T-26 | **When checking against kubernetes.io, read the RAW page, not a summary.** `curl -sL` and strip the tags | review | `test/report/sources.test.mjs` |
| T-27 | The highest-yield part of an upstream page is its OPENING paragraphs, because that is where the doc puts what distinguishes the feature, and it is exactly what a card built from knowledge omits | review | this file |
| T-28 | A card's `aria-label` describes the WHOLE drawing, not the current step, and is the only text a screen reader gets for the picture. Full sentences or a headline with a colon and a list of stages: match the neighbours | test:inline/T-28 | `scheme/CLAUDE.md` |
| T-29 | Wire labels are dim `text` at fixed positions, blank (`' '`) at build, filled per step with `setWire` | test:reduced/WIRE-TEXT | `lib/scheme-kit.js` |
| T-30 | **A wire label the ANIMATED path alone writes shows a blank lane on prev and reset.** State it in `wires`, wind it back blank in `rewind`, and let an `F.set` fill it on the beat | test:reduced/WIRE-TEXT | `test/render/reduced.test.mjs` |
| T-31 | **A mass automated pass over prose must be followed by READING it.** A regex sweep leaves the linters green and the meaning broken, and an assertion that a pattern matches once does not protect a prefix-style edit from a second run | review | root `CLAUDE.md` |
| T-32 | Sources: two sources on one card must not share a label | test:catalog/R-srcdup | `test/unit/catalog.test.mjs` |
| T-33 | One href is labelled ONE way across the catalog | test:catalog/R-srclabel | `test/unit/catalog.test.mjs` |
| T-34 | Source liveness (DEAD, SOFT, MOVED, ANCHOR) is checkable but can never be mandatory, because it hits the network | report:sources/DEAD | `test/report/sources.test.mjs` |
| T-35 | **A step that plays a COUNTERFACTUAL says so on the canvas, with a caption above the branch**: a `P.wire` caption above the branching group, written per step, opening `if instead` or `if ` plus the condition | review | `storage-pv-lifecycle-phases`, `storage-detach-on-node-failure`, and `T-29` for the mechanism |

## P: value chips

| ID | Rule | Check | Source |
|---|---|---|---|
| P-01 | **Every step states EVERY chip** in its `chips` or `chipsCued` field, not only the ones it narrates. An unset chip keeps the previous step's value and silently lies | test:spec-steps/P-01, test:chip-written/CHIP-WRITTEN, report:chip-unwritten/LIT-NOT-WRITTEN | this file. The convention is machine-checked, whether a carried-over value is still TRUE stays a human's job |
| P-01a | **The chip half of the rule is CLOSED and machine-checked, the label half is not**: labels, sublabels and pod sublabels may still carry over, and a hidden slot has no text to write | review, test:spec-steps/P-01 | the spec data. A carried-over value that is still TRUE as drawn is not a defect, which is why the label half stays a human's call |
| P-11 | **A value a step writes belongs in a writer FIELD, never in the `enter` escape**, where every static reader is blind to it. Do not pin a field's exact SHAPE so a source reader can match it: T-16 bans that | review | `test/fixtures/prose.mjs` |
| P-12 | **`chips` and `chipsCued` hold the step-entry state only.** A value that turns over on a later BEAT (`P-03`) goes in an `F.set` inside `flow`, and folding it into the field moves when the value appears | review | this file |
| P-13 | A chip key may NOT be spelled `label`, `sublabel`, `ip` or `sub`. Use `podIp` | test:spec-steps/P-13 | `test/render/inline.test.mjs` |
| P-14 | Nor may a key be a RESERVED WORD. See T-02a | test:smoke | T-02a |
| P-02 | **A chip always means what its name says.** If a step needs to report something else, that is a second chip, not a reused one | review | this file |
| P-03 | **A chip must not run ahead of the motion that produces its value.** State the end value in the field, wind it back in `rewind` to what the step STARTS from, and turn it over with an `F.set` at the ball's arrival | test:chip-beat-e/FORM-E, report:chip-beat/FORM-B | `test/unit/chip-beat-e.test.mjs` gates FORM-E off `test/fixtures/chip-beat.mjs`, and `test/report/chip-beat.test.mjs` prints the FORM-A and FORM-B queue |
| P-04 | Picking the beat is the whole job, and **doing this to one chip and not its neighbour is worse than doing it to neither**. What a component KNOWS moves when the answer reaches it, what it DID moves when the call lands | review | this file |
| P-05 | A chip whose value CHANGED this step lights as a STATIC highlight, never a flash | report:arrival/R2 | `lib/scheme-kit.js`, `setChip` |
| P-05a | **The cue does not have to be a highlight on the chip**: a Pod pulse or a helper walking a listing row by row is a cue too | report:arrival/R2-ENTRY | `test/report/arrival.test.mjs` |
| P-06 | Value chips are deliberately OUT of the arrival rule: they light at step ENTRY with the text change, while boxes, pods and cylinders light on ARRIVAL | report:arrival/R3 | `test/report/arrival.test.mjs` |
| P-07 | A chip's NAME must not collide with its longest VALUE, measured RENDERED on every step. A chip needs name + value + 24 plus a gap. Shorten the VALUE rather than widening the chip | test:chipfit/COLLISION | `test/render/chipfit.test.mjs` |
| P-08 | `valChip` has NO category default for `role`: a default of `cluster` paints workloads chips with the cluster palette, and a tinted dialog hides that by collapsing every role onto one tint | test:palette/UNPAINTED | `lib/scheme-kit.js`, `valChip` |
| P-15 | **A chip's value has to be READABLE by something**: declare the chip as a `P.chip` part and write its value through the `chips` or `chipsCued` field. **A card-local chip factory is NOT banned** | review | `test/fixtures/prose.mjs`, and `network-nodeport-loadbalancer` |
| P-16 | **A chip is 34 tall in every category.** Its width follows the strip it stands in, its height does not. A chip departs only where 34 would break a row it lines up with or push the stack off the canvas, as a `DEVIATES` line | review | each category `CLAUDE.md`, where the chips are described |
| P-09 | `setChip` highlights a chip whose value changed, `setVal` writes without the highlight. **Moving a chip between `chips` and `chipsCued` swaps the two, and that is a VISIBLE change** | review | `lib/scheme-kit.js`, `setChip` and `setVal` |
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
| D-06 | Card and poster are an exact BIJECTION. A card with no poster draws `FALLBACK_POSTER`, a poster with no card is never rendered | test:catalog/D-06 | `test/unit/catalog.test.mjs` |
| D-07 | **Every category key matches its label 1:1, and no subcategory key is shared between categories**, or a `subcategory` value cannot be read without also reading `category` | test:catalog/D-07 | `js/data.js` |
| D-08 | `CATEGORY_LABEL`, `CATEGORY_ICONS` and `CATEGORY_TAGLINE` are PROJECTIONS of `CATEGORIES` through one `byKey(field)` helper, so a category is added in one place only | test:catalog/D-08 | `js/data.js` |
| D-09 | `CATEGORY_TAGLINE` renders nowhere: both readers are fallbacks for shapes no category has. The code stays, do not expect a new tagline to appear | review | `js/data.js` |
| D-10 | Each category's `SUBCATEGORIES` list is an ORDER, not a set: the sequence is an editorial argument about what a reader has to know first, never alphabetical and never a merge artefact, and it is recorded beside the list it orders | review | `js/data.js`, and the `SUBCATEGORIES` note in each `cards.js` |
| D-11 | A card id is STABLE. There is NO alias map: `app.js` resolves a hash to a card by exact id, so renaming a shipped id breaks every external link (bookmark, indexed URL) to the old one. Rename an id only while the card has no audience | review | `js/app.js` |
| D-12 | Every card has a static page `/scheme/card/<id>/` (every command section `/cli/section/<id>/`), written by `tools/pages/build.mjs` and listed in `sitemap.xml`. `npm test` fails while one is stale | test:catalog/D-12 | `tools/pages/build.mjs`, `sitemap.xml` |
| D-13 | Adding a CATEGORY touches the folder, kit, `cards.js`, `posters.js`, `CLAUDE.md`, records, `CATEGORIES`, the tint in `tokens.css` and `styles.css`, `POSTER_COLORS` and a `<CAT>.*` block here, in the order `scheme/CLAUDE.md` gives | review | `scheme/CLAUDE.md`, new-category checklist |
| D-14 | The poster-first model applies to every card: idle is a static poster, step 1 auto-plays after about 1s, the poster previews step 1's TEXT immediately, and `Next` from the last step wraps to poster then step 1 | test:skeleton/D-14 | `lib/timeline.js` |
| D-15 | Search reads `title + desc + category + subcategory`, debounced 80ms. Grid keys: `/`, `Esc`, `Enter`, `?`. Dialog keys: `Space`, arrows, `Shift`+arrows, `R`, `L`, `F`, `Esc`. Letters, `/` and `?` use `lib/keys.js`. Each key has a sheet row | review | `js/app.js`, `js/lib/keys.js` |
| D-16 | The hash holds the GRID as well as the card: `#at=<key>&q=<search>` is the grid's state, and `#scheme=<id>&step=<n>&at=<key>&q=<search>` carries it through an open card. A filter or search change resets the scroll | test:hash/D-16 | `js/app.js`, root `index.html` |

## R: posters

| ID | Rule | Check | Source |
|---|---|---|---|
| R-01 | **Describe the intended abstract concept in one line and get sign-off BEFORE rendering a full poster** | review | root `CLAUDE.md` |
| R-02 | **A poster is one sentence, not a small diagram.** It renders about 200px wide, so a faithful miniature is unreadable. Decide the sentence first, keep only the elements that carry it, drop the rest even when they are on the card | skill:poster-lint/R-02, review | this file |
| R-03 | Give the brightest fill to the one element the poster is about | skill:poster-lint/R-03, review | this file |
| R-03b | **Something in the drawing has to be BRIGHT.** The brightest mark, measured through every `<g>` above it, reaches 0.55, or the poster reads as absent on the grid whatever its composition says | skill:poster-lint/R-03b | `.claude/skills/card-poster/tools/poster-lint.mjs` |
| R-04 | viewBox `0 0 320 180`, `stroke="currentColor"`, fills as literal `rgba(255,255,255,...)`, **never** `var(--token)`: SVG presentation attributes do not reliably resolve CSS variables | skill:poster-lint/R-04 | `js/schemes/<cat>/posters.js` |
| R-05 | **A poster is judged next to its SIBLINGS, not on its own.** Build a montage of the card plus two neighbours at about 260 percent before deciding. The lint signs each poster by silhouette and names a neighbour that shares it | skill:poster-lint/R-05, review | this file |
| R-06 | Siblings are 76 to 80 unit blocks with fills between 0.03 and 0.10. Specks at 200px, a track dimmed below its siblings and a quarter of the canvas left as empty air are all invisible on the file and obvious on the montage | skill:poster-lint/R-06, review | this file |
| R-07 | House idiom one: the accent is a `rect` with `fill="currentColor"` at `opacity="0.9"` INSIDE the block it belongs to, with the losers carrying the same bar at 0.3. Never a bright fill on a whole shape | skill:poster-lint/R-07, review | this file |
| R-08 | House idiom two: **a poster carries no arrowhead by default.** Direction comes from the composition being closed, or from a dashed leg, or from a fill ramp. The posters that do carry one are the `R-08a` allowlist | skill:poster-lint/R-08 | `.claude/skills/card-poster/tools/poster-lint.mjs` |
| R-08a | **A chevron is allowed only to a poster on the registry in `poster-lint.mjs`**, earned when the sentence IS a direction composition cannot say. A poster redrawn without its chevron leaves the registry | skill:poster-lint/R-08a | `.claude/skills/card-poster/tools/poster-lint.mjs` |
| R-09 | **A poster carries no packet dot**: a ball frozen on a wire reads as a paused animation | skill:poster-lint/R-09 | this file |
| R-10 | No literal copy of the card diagram, no reused two-box layout, no plain "dumb circles" | review | root `CLAUDE.md` |
| R-11 | `FALLBACK_POSTER` in `js/lib/poster.js` breaks R-08 and R-09 on purpose. Do not "fix" it into canon and do not delete it: it is the failure mode made visible | test:catalog/D-06 | `js/lib/poster.js` |
| R-12 | A poster is drawn once against the sibling montage, so its note is a comment above that poster in the folder's `posters.js` and never a block in the record | test:docs/G1, skill:poster-lint/R-12 | `test/unit/docs.test.mjs` |

## S: module structure

| ID | Rule | Check | Source |
|---|---|---|---|
| S-01 | **A scene has exactly ONE construction path.** `makeScene(SCENE)` is the only producer of a `Scene` class, its prototype is closed to `constructor`, `build` and `reset` | test:skeleton/S-01 | `test/unit/skeleton.test.mjs` |
| S-02 | **A card module has exactly ONE legal export surface**: `SCENE`, `STEPS_SPEC` and `init`, from `defineCard(SCENE, STEPS_SPEC, { posterFirst: true })`. The comparison is set EQUALITY per card, never containment | test:module/S-02 | `test/unit/module.test.mjs` |
| S-03 | **A build starts from an empty host and a fresh `refs`**, and nothing else may append to the host | review | `lib/scene-spec.js`, `buildScene` |
| S-04 | The root svg carries `viewBox: '0 0 1200 640'`, no exceptions. **Re-centre the content, do not move the camera.** A card builds it with `diagramRoot({ 'aria-label': '...' })` | test:skeleton/S-04 | `lib/scheme-kit.js`, `diagramRoot` |
| S-05 | **No card owns the camera.** One `diagramRoot` serves the whole catalog: a card declares no viewBox and no camera key anywhere in its parts, and feeds the camera exactly one thing, its `aria-label` | test:skeleton/S-05 | `lib/scheme-kit.js`, `diagramRoot` |
| S-06 | `preserveAspectRatio: 'xMidYMid meet'` and `data-style: 'outline'` come with `diagramRoot`. `arrowDefs()` stays in the card, appended first, because one card puts it on a content group rather than the root | review | `lib/scheme-kit.js` |
| S-07 | **Z-order**: body blocks, then wires and wire labels, then chips, then the packet layer on top, stated in a comment. Blocks that must sit above packets are appended after the packet layer | review | `scheme/CLAUDE.md` |
| S-08 | Pods are a `podShell()` plus inner `box()`es wrapped in a `g`, and the pulse target is that `g`. See M-03 | review | `lib/primitives.js` |
| S-08a | **`P.pod` is the ONE thing that builds a Pod.** A card-local Pod factory keeping its own GEOMETRY and wrapping a shell plus its inner boxes by hand is a second construction path (`S-01`, `S-02`) | review | `lib/scene-spec.js`, `buildPod` |
| S-08b | A category kit binds its tint with `export const { pulsePod, pulsePodDim } = makeTintedPulses(<CAT>_TINT);`. The two bodies live once, in `scheme-kit.js` | test:module/S-08b, review | `lib/scheme-kit.js`, `makeTintedPulses` |
| S-08c | **The `aria-label` stays an object key at the `diagramRoot` call site** | review | `lib/scheme-kit.js`, `diagramRoot` |
| S-09 | **Step 0 is `id: 'idle'`, a pure reset, carries no `narration` and must not DRAW**: whatever it draws sits under the panel text of the step after it | test:spec-steps/S-09 | `scheme/CLAUDE.md` |
| S-10 | **Every step opens with the reset prologue and nothing before it**, generated once by `makeSteps` instead of promised per card | test:skeleton/S-10 | `test/unit/skeleton.test.mjs` |
| S-11 | **The prologue is generated once, out of `SCENE.reset`, and its order is fixed**: `packetLayer.replaceChildren()` FIRST, then `clearHighlights` over `reset.keys` and `reset.pods`, then `clearWires`, then `reset.extra` LAST | test:skeleton/S-11 | `test/unit/skeleton.test.mjs` |
| S-12 | No card declares `clearHL(s)`: the generated prologue is what clears | report:skeleton-census/S-12 | `test/report/skeleton-census.test.mjs`, Q3 |
| S-13 | A step's static fields set ALL chip values, wire labels and `.highlight` classes and **pin final opacities inline**, so a cancel mid-step lands on the right value | test:reduced | `scheme/CLAUDE.md` |
| S-14 | **The reduced-motion split is the load-bearing line.** The static fields and `enter` are the complete end state, written on both paths. `rewind` and `flow` are motion and run on the animated path only | test:reduced | `test/render/reduced.test.mjs` |
| S-15 | **Never animate state that is not also pinned statically** | test:reduced | `test/render/reduced.test.mjs` |
| S-16 | `render/reduced.test.mjs` compares five axes and **all five are enforced**: own opacity, INHERITED (effective) opacity multiplied down the ancestor chain, drawn wire text, the drawn text inside a block, and the `.highlight` set | test:reduced | `test/render/reduced.test.mjs` |
| S-17 | Whatever lights on ARRIVAL must also light on the REDUCED path. `flowLights` DERIVES that from every `lights` list in `flow`, and `reducedLit` names what the static path shows INSTEAD of a pulse | test:reduced/HIGHLIGHT | `lib/step-spec.js`, `flowLights` |
| S-18 | **When a block dies mid-step, take its highlight back in the fade's `onfinish`** rather than mirroring it onto the static path | test:spec-steps/S-18 | `lib/step-spec.js` |
| S-19 | A `.highlight` put on a Pod INNER BOX has to be cleared BY NAME in `clearHighlights`'s keys list. The `pods` argument runs `clearPodHighlight`, which resets inline stroke styles and touches NO class | test:spec-steps/S-19 | `lib/scheme-kit.js`, `clearHighlights` |
| S-20 | **A folder holds exactly four kinds of `.js`**: its cards, its `<category>-kit.js`, its `cards.js`, its `posters.js` | test:catalog/D-03 | `test/unit/catalog.test.mjs` |
| S-21 | **A card imports its own kit and nothing past it**: `../../lib/svg.js`, `../../lib/primitives.js`, `./<category>-kit.js`. `lib/` holds only what every category shares | test:module/S-21 | `scheme/CLAUDE.md`, the folder contract |
| S-22 | The kits re-export the SAME list of names from `scheme-kit`, and **that list is the CARD-FACING API rather than a mirror of the library**: a name earns its place by being imported by at least one card | test:module/S-22, review | `test/unit/module.test.mjs` |
| S-23 | Adding a name to the kit surface is ONE edit across every kit. The lists are formatted differently enough that a single find-and-replace does not work | test:module/S-23 | `lib/scheme-kit.js`, the kit header |
| S-24 | `export * from './scheme-kit.js'` stays REJECTED. It would work and save lines, but the explicit list is what documents what a kit offers, and a card must never reach past its kit | review | this file |
| S-25 | `flashChips` is in the kit surface and is **the mechanism behind `F.flash`**: the ONE name on that surface no card imports, which is the exception `S-22` allows | test:module/S-22, review | `lib/scheme-kit.js`, `flashChips`. `lib/step-spec.js`, `flash` |
| S-25a | **`step.motion` is a live field with no use, and it STAYS.** Do not delete it, and do not reach for it either: `F.run` at delay 0 is the sanctioned imperative beat inside flow order | review | `lib/step-spec.js`, `spec.motion` |
| S-25b | **`F.ripple` is a live flow verb with no call site, and it STAYS.** Do not delete it, and do not reach for it either: check first whether a packet already lands there | test:ripple-single/RING-SINGLE | `lib/step-spec.js`, `ripple` |
| S-25c | **`F.flash` is a live flow verb with no call site, and it STAYS.** Do not delete it, and do not reach for it either: `M-27` is why no card calls it, and `test:spec-steps/M-26` is what watches the door | test:spec-steps/M-26 | `lib/step-spec.js`, `flash` |
| S-26 | **`defineCard` is the ONE producer of a card's `init`**: a card writes `export const init = defineCard(SCENE, STEPS_SPEC, { posterFirst: true });` and never calls `makeInit` itself | review | `scheme/CLAUDE.md` |
| S-27 | **Take S-26 further only on a COUNT.** A new `P` or `F` verb has to name the cards that need it before it is added | review | `scheme/CLAUDE.md` |
| S-28 | **No top-level browser globals at module load**, except in `motion.js` and `app.js`. `svg.js`, `primitives.js`, `timeline.js` and `data.js` must parse cleanly in Node so the tools can read them | test:module/S-28 | `test/unit/module.test.mjs` |
| S-29 | `svg.js` exports names nothing imports and they STAY: it is a library surface, not accumulated code. Do not read their absence from the import graph as a finding | review | `lib/svg.js` |
| S-30 | `lib/sidebar.js` is DUPLICATED with the `cli/` copy, not symlinked. Change one, change the other | review | root `CLAUDE.md` |
| S-31 | A card module must parse as an ES module (`node --input-type=module --check`, file on stdin) the moment it is written. The hook exits 2 and hard-fails the edit | hook | `.claude/hooks/check-js.sh` |
| S-32 | Every step is walked twice by the smoke, statically and really PLAYED, with zero console or page errors | test:smoke | `test/render/smoke.test.mjs` |
| S-33 | A missing import in a card throws a `ReferenceError` that `Timeline` swallows into `console.error`, so the step plays its first packet and silently stops. **Run `render/smoke.test.mjs` after touching any card's imports** | test:smoke | `lib/timeline.js` |
| S-34 | **A comment is at most THREE lines, in a card and in every script.** It states an invariant, a non-obvious reason or a rule id. It carries no date, no past defect, no account of an earlier version, no number the code already computes | test:files/S-34 | `scheme/CLAUDE.md`, where the record lives |
| S-35 | Anything longer than S-34 is not a comment, and each length has one home. **A reason for one constant is a comment ON that constant**, never a note in the record pointing at it | review | `scheme/CLAUDE.md` |
| S-36 | Each card carries exactly ONE pointer comment under its imports, in the shape its category's record is in: `./CARDS.md#<id>` for one file per category, `./CARDS/<id>.md` for one file per card | test:files/S-36 | `test/unit/files.test.mjs` |
| S-37 | Notes on anything that is NOT one card go to the JSDoc BESIDE THE CODE they describe: `lib/*`, the kits, `app.js`, `data.js`, and a comment block in the CSS for a rule about a CSS rule | review | `scheme/CLAUDE.md`, where the record lives |
| S-48 | **A comment and a record state what IS, never what CHANGED.** No date on an edit, no `used to`, no `renamed on`: a reader needs the constraint and the number behind it, and the repository is not a diary | review | `scheme/CLAUDE.md`, the "Where the record lives" table, which already sends history to the bin |
| S-49 | **A count a document states is MEASURED, not typed**, and a sentence reworded past its pattern fails as loudly as a wrong number | test:docs-census/CENSUS, report:baselines/BASELINES | `test/unit/docs-census.test.mjs`, `test/report/baselines.test.mjs` |
| S-50 | **A card skill CITES a rule and never restates it.** The skills under `.claude/skills/` read this file from outside `scheme/` | test:docs/D1 | `.claude/skills/card-review/SKILL.md` |
| S-38 | **A record carries no `### before` anchor** (`S-51`). A reason for one line of code is a comment ON that line, and an anchor that does appear must still resolve in its own card | test:docs/A2 | `test/unit/docs.test.mjs` |
| S-39 | When a card is renamed, rename its record heading too, and the record FILE with it where the category is split | test:docs/A4 | `test/unit/docs.test.mjs` |
| S-40 | A test file under `scheme/test/` keeps what it asserts and what it cannot see in its OWN HEADER, inside the `S-34` cap | review | `scheme/test/`, and every test file header |
| S-41 | **Internal markdown never ships.** Three filenames (`CLAUDE.md`, `CARDS.md`, `CANON.md`), the `CARDS/` record folder, plus `scheme/test/`, excluded BY NAME in three places that must agree: `deploy.yml`, `release.yml`, `.dockerignore` | test:files/S-41 | root `CLAUDE.md` |
| S-42 | Do not unify what VARIES between cards: the kit, block size, geometry, step count, connector style. **The `role` passed to primitives and the Pod tint are the one exception, and only when the binding is made IN THE CATEGORY KIT** | test:spec-scene/S-42 | `scheme/CLAUDE.md`, and C-02 / P-08 for the cost of the cross-category default |

---

## The record vocabulary

A record holds only what the code and this rulebook cannot say. Labels in this order, each at most
once, `WHAT` first, present tense, no dates:

| Label | Holds |
|---|---|
| `WHAT` | what the card shows, in one sentence |
| `DEVIATES` | each rule this card breaks on purpose: the id, what differs, why, one line each |
| `CONTENT` | the sources the text was checked against, and the wording a fact forced |
| `OPEN` | a known defect left open, one line each, with the reason it stays |

Structural rules for a record file, all of them enforced by `unit/docs.test.mjs`: group A for the
first four, group E for `S-47` and group G for the FORM the last three state.

| ID | Rule | Check | Source |
|---|---|---|---|
| S-43 | Every `## ` heading in a record is a CARD ID and nothing else, in either shape. A second-level heading anywhere else is reported as an orphan, which is why the preamble headings are bold text rather than `##` | test:docs/A4 | `test/unit/docs.test.mjs` |
| S-44 | A card's section must be in ITS OWN category's file. A section filed in the wrong one is named as `MISFILED`, not as a missing file | test:docs/A5 | `test/unit/docs.test.mjs` |
| S-45 | Every card has a section. A card with no design record is how a measurement gets lost | test:docs/A3 | `test/unit/docs.test.mjs` |
| S-46 | **A record the walk cannot OPEN is a failure, never a shorter run.** Nothing may be read with a `continue` on absence | test:docs | `test/unit/docs.test.mjs`, `readDoc` |
| S-47 | **This file has to tell the truth about itself**: every Check value resolves, every Source path exists, no id repeats and no id block skips a number | test:docs/E1, test:docs/C4, test:docs/C5 | `test/unit/docs.test.mjs`, groups C and E |
| S-51 | **A record section is ONE `### layout` heading and nothing else**: no poster note, no per-line anchor, no second heading. A note that would have taken an anchor goes under the label it belongs to | test:docs/G1 | `test/unit/docs.test.mjs` |
| S-52 | **A record's labels come from "The record vocabulary" above, in that order, each at most once, `WHAT` first.** A note that fits none of them does not belong in the record | test:docs/G2 | `test/unit/docs.test.mjs` |
| S-53 | **A line in the label column carries a label and no other word.** `S-52` ranks the labels it knows, so a word outside the vocabulary is invisible to it: this is the half that sees one. Prose belongs at the column at 9 | test:docs/G3 | `test/unit/docs.test.mjs` |

`S-51`, `S-52` and `S-53` hold at zero in every category, so a record off the form fails the gate.

---

## Category-scoped rules

Category rules do NOT live here. The folder is the unit of context, so each rule lives in that
folder's `CLAUDE.md` with a category prefix, and this is their index.

**The test for where a rule belongs: anything that would be a DEFECT if it differed between two
categories is catalog-wide and belongs above. A pointer is not duplication, a paragraph is.**

A row below carries NO rule text, only a subject label for finding it. Where a folder and this
index disagree, the FOLDER wins. If you are about to read a number or a `DO NOT` out of a label,
you are in the wrong file.

### `CLU.*` cluster, `js/schemes/cluster/CLAUDE.md`

| ID | Subject |
|---|---|
| `CLU.C-01` | the tint against the chrome colour |
| `CLU.S-01` | what a cluster card's own record states |
| `CLU.S-02` | the exemplar card |
| `CLU.S-03` | what a record is for at the margin, and its length band |
| `CLU.L-01` | the Cluster Node frame family, and the cards that deviate |
| `CLU.D-01` | the subcategory split |

### `WL.*` workloads, `js/schemes/workloads/CLAUDE.md`

| ID | Subject |
|---|---|
| `WL.C-01` | the tint |
| `WL.L-01` | the `WL` X grammar |
| `WL.L-02` | the two columns |
| `WL.L-03` | layout A |
| `WL.L-04` | layout B |
| `WL.L-05` | layout C, and its chip strip |
| `WL.L-06` | which of A / B / C a card picks |
| `WL.L-07` | the trunk corridor |
| `WL.A-01` | the top-row lane pair |
| `WL.A-02` | where the top-row wire label sits |
| `WL.A-03` | where a lane into the Node band ends, and why the frame is centred |
| `WL.S-01` | the per-card `SPINE` array, and why there is no shared connector helper |
| `WL.S-02` | the exemplar, and the deviation a copy must not take |
| `WL.S-03` | what a record carries, and the order its labels run in |
| `WL.D-01` | the subcategory split |

### `NET.*` networking, `js/schemes/network/CLAUDE.md`

| ID | Subject |
|---|---|
| `NET.C-01` | the tint, and the one category colour that is a literal in `diagrams.css` |
| `NET.L-01` | 232 by 80 is the actor-block size, 232 by 104 for a Pod, and what may overrule it |
| `NET.S-01` | what a Pod is built from here |
| `NET.A-01` | endpoints on a block edge |
| `NET.A-02` | traffic delivered to a Node |
| `NET.A-03` | N destinations, N wires |
| `NET.A-04` | no line suppresses its role |
| `NET.T-01` | addresses ride the ball |
| `NET.S-02` | the inner app boxes named in `reset.keys` |
| `NET.S-03` | the exemplar card |
| `NET.S-04` | the two things a record here has to name that no check sees |
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
| `STO.S-05` | the per-card record and the size line it owes |
| `STO.D-01` | the subcategory split |

---

## Known deliberate exceptions

Not defects. Each is a rule broken on purpose, with the reason.

| What | Why it stands |
|---|---|
| `FALLBACK_POSTER` breaks R-08 and R-09 | R-11 |
| `dim` losing to `role` on an arrow | A-18. Making `dim` outrank `role` greys out every dim lane that carries a ball |
| `flashChips` exported with no card importing it | S-25. `F.flash` is its one caller |
| `F.flash`, `F.ripple` and `step.motion` live with no call site | S-25c, S-25b, S-25a. `M-27` is why the `F.flash` zero is a ban rather than a gap |
| Narrated steps that register no animation, printed by `test/report/baselines.test.mjs` | M-27. The alternative is a brightness pulse on infrastructure, which `M-01` forbids and no still frame can show |
| `svg.js` exports with no importer | S-29 |
| Header chrome duplicated in `cli/js/app.js`, `scheme/js/app.js` and the root `index.html` | Each path prefix stays self-contained |
| `cli/css/styles.css` and `scheme/css/styles.css` share selectors, some with different bodies | Cascade order decides, so merging is a real visual risk |
| `OPEN` lines in the card records | L-16. Each says why the rule can only be met by making the picture worse |
| Ambiguous label pairs in the value class | T-14 |
