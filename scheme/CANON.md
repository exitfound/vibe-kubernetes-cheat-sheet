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
  is `scheme/test/package.json`, where it executes. `scheme/test/tools/` holds two text probes that
  are NOT checks: `settled-dump.mjs` and `buildframe.mjs`, each documented in its own header.

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
| `Source` | where the long form, the measurement or the implementation lives. **A file, never a line number**: on 2026-08-07 fifteen of the sixteen citations into the old `check-canon.mjs` missed their line by 9 to 12 and landed in a comment. Rewritten on 2026-08-07 off the deleted script harness onto the test, the code file or the measurement that holds each answer now. Both columns are machine-read today: the `Check` column by group E, and every repo path cited here by `C4`, which resolves all 202 of them |

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
the shape of the suffix: those were the lint rules inside `check-canon`, and the two that survived
the move (`R-srcdup`, `R-srclabel`) are now axis names inside `unit/catalog.test.mjs`.

## The numbers this file is written against

108 cards: cluster 21, workloads 19, network 37, storage 31. 650 steps. Re-measure before trusting
any figure below that carries a date-free absolute, and if you change one, change it here.

---

## L: layout and the narration panel

| ID | Rule | Check | Source |
|---|---|---|---|
| L-01 | The safe-zone is an L, not a forbidden box: the overlay covers the top-left quadrant only, so the usable area is the full width below its bottom PLUS the full height right of its right edge | review | this file |
| L-02 | The narration panel's RIGHT edge is `x<=397` on every card, on every viewport. Measured: worst 396.55, `cluster-architecture` at 1100x800 | report:overlay/L-02 | `test/report/overlay.test.mjs` |
| L-03 | Nothing starts left of x=420 unless it also sits below that card's own panel bottom | review | L-02 |
| L-04 | The panel BOTTOM is per card and ranges 90 to 504 over the standard viewport set. Worst 503.13 (`workloads-pod-phase-machine`, 1100x800, step 5), shallowest 90.23 (`cluster-admission-webhooks`, 1600x1000, step 3) | report:overlay/L-04 | measured 2026-08-06 over all 108 cards |
| L-05 | The panel moves NON-MONOTONICALLY against the PICTURE, not against the viewport, and the difference is what a reader gets wrong: the panel is HTML at a fraction of the dialog width while the diagram scales past it, so a WIDER dialog gives a WIDER panel that wraps into FEWER lines and is therefore SHORTER in viewBox units, while every drawn thing around it grows. Against the viewport the bottom is orderly and runs one way only: **650 of 650 comparable steps** fall as the viewport widens, 0 break that order. Never measure on one viewport | report:overlay/L-05 | `test/report/overlay.test.mjs` |
| L-05a | **It is a TYPOGRAPHY problem, not a height problem, and clamping the height does not touch it.** The panel's WIDTH in viewBox units is BOUNDED, not constant: `x<=397` holds everywhere and the right edge still travels **105.78 units** across the standard set (`cluster-architecture`, 290.77 at 1600x1000 against 396.55 at 1100x800), so the ceiling is reached only at the narrowest viewport. The font is a fixed pixel size, so a wider viewport wraps the same text into fewer lines AND divides by a larger scale, and the panel shrinks in units twice over, by up to 186. Closing it needs type that scales with the diagram, which resizes every narration on every card | report:overlay/L-05a | measured 2026-08-07, `scheme/css/styles.css` under `.narration-overlay` |
| L-05b | The panel ALSO changes height between the STEPS of one card, on 209 of 216 card+viewport pairs, so the diagram area under it moves while the card plays. Pinning `min-height` to the tallest narration fixes that completely and was still REVERTED: it leaves a visible empty strip inside a drawn border (about 100px on `workloads-pod-phase-machine`), and an empty strip inside a border reads as a fault where empty canvas reads as space | review | built and measured 2026-08-06, `scheme/css/styles.css` under `.narration-overlay` |
| L-06 | The standard viewport set is `1600x1000`, `1280x860`, `1100x800`. A card may pin a stricter row of its own (storage cards carry `900x650`), and where the two disagree the card takes the stricter number and says so | report:geometry-soft/L-06 | `test/report/geometry-soft.test.mjs`, `VIEWPORTS` |
| L-07 | A card's measured panel extent lives in its HEADER COMMENT, never in a constant: the reserved corner is a fact about the panel, not an input to the layout | review | this file, X4 |
| L-08 | The panel bottom is often a CHARACTER BUDGET. Editing prose for accuracy spends it silently, and `OCCLUDED` will not tell you because it scores occluded AREA and a 25 unit strip off a 152 unit frame is under its bar. Re-measure after any prose edit on such a card: `npm run report`, then read that card's `1100x800` column in the overlay table | report:overlay/L-08 | `test/report/overlay.test.mjs` |
| L-08a | **A card that carries a two-column X grammar picks the first of `A` / `B` / `C` that fits above its OWN measured panel bottom**, and reads the columns out of its kit's `LAYOUT` rather than typing them. True of the two categories that HAVE such a grammar, and their objects are identical where they overlap: `CLU` and `WL` agree on all 17 shared keys and their `LAYOUT` is byte for byte the same, so a divergence between them would be a defect rather than a choice. Networking has no grammar to pick with (measured: of its 37 cards, 17 name a content band across six different literal pairs and the other 20 hang off a `node()` frame), and storage's `STO` is a different object, overlapping `CLU` on two keys only | test:module/L-08a | `js/schemes/workloads/CLAUDE.md` `WL.L-06`, `js/schemes/cluster/cluster-kit.js` |
| L-09 | A segment is horizontal or vertical. Nothing runs diagonally | test:geometry/DIAGONAL, test:spec-scene/DIAGONAL | `test/render/geometry.test.mjs` |
| L-10 | No segment crosses a block it does not terminate on | test:geometry/THROUGH, test:spec-scene/THROUGH | `test/render/geometry.test.mjs` |
| L-11 | An endpoint sits on a block FACE MIDPOINT, never a hand-typed coordinate near one | test:geometry/OFFEDGE, test:spec-scene/OFFEDGE | `test/render/geometry.test.mjs`, mandatory since 2026-08-06 |
| L-12 | Two endpoints on ONE face at mirrored offsets (`+d` and `-d`, any `d`) are a deliberate lane pair and not a finding, pooled across all steps because a pair whose halves live in different steps is still a pair | test:geometry/OFFEDGE, test:spec-scene/OFFEDGE | `test/render/geometry.test.mjs` |
| L-13 | The content bbox centres within 40 units of x=600, and the chip strip within 6 | report:geometry-soft/CENTRE | `test/report/geometry-soft.test.mjs` |
| L-14 | Blocks sitting BELOW the overlay centre on x=600 too: the full width is free there | report:geometry-soft/CENTRE-LOW | `test/report/geometry-soft.test.mjs` |
| L-15 | No block sits substantially under the narration panel | report:geometry-soft/OCCLUDED | `test/report/geometry-soft.test.mjs` |
| L-16 | **Do not close a `CENTRE` finding by stretching a strip or widening a frame.** If a finding can only be closed by making the picture worse, leave it OPEN and write the reason into the card's record. **Count the two populations separately, because 17 was neither of them**: the soft geometry report prints **8** findings (CENTRE 2, CENTRE-LOW 4, OCCLUDED 2), and the four records carry **18** `OPEN` entries (cluster 9, storage 5, workloads 3, network 1), which cover more than geometry and are not the same list | review | the four `CARDS.md`, and `test/report/geometry-soft.test.mjs` for the finding count. Both counted 2026-08-07 |
| L-17 | `CENTRE` and `CENTRE-LOW` count neither `node()` frames nor chips, so a card balanced by a frame full of chip rows still reports. Read a finding against the card note before treating it as a regression | report:geometry-soft/L-17 | `test/report/geometry-soft.test.mjs` |
| L-18 | Never set `font-size` as a presentation attribute on a label: specificity 0 loses to the `.scheme-label.code` class rule, so the value never renders and a clearance budget sized off it is wrong by 10 to 22 percent. Add a class in `diagrams.css` instead | test:files/L-18 | `scheme/css/diagrams.css` |
| L-19 | Nothing in the suite measures WIRE-LABEL width. `render/chipfit.test.mjs` measures chips only | review | `test/render/chipfit.test.mjs` |
| L-20 | Text rates are PER CLASS and are MEASURED, never estimated: `.scheme-box-sublabel` is 10px JetBrains Mono at 6.03 viewBox units per character, `.scheme-chip-text` and `.scheme-label code` are 11px at 6.89, box labels are 12px Space Grotesk and proportional so they vary by string | review | `js/schemes/storage/CLAUDE.md` |
| L-21 | **Await `document.fonts.ready` before measuring anything in the DOM**, or you measure the fallback, which is about 20 percent narrower and flatters you. Never eyeball a width off a screenshot | test:geometry/L-21, test:chipfit/L-21 | root `CLAUDE.md` |
| L-22 | A card that needs room should check L-01 first: on a cramped card the room is usually already there | review | this file |
| L-23 | **A card drawing a Node frame around Pods uses the family geometry** `POD_Y = NODE_Y + 34`, `POD_H = 106`, `NODE_H = 152`: 34 of label padding, 106 of Pod, 12 of floor. `node()` prints its own label at `NODE_Y + 18`, so less padding puts the frame label inside the first Pod. `cluster-node-drain.js` is the card to copy it from | review | recorded catalog-wide 2026-08-06, previously in `schemes/cluster/CLAUDE.md` |
| L-24 | Growing a Node frame to fix L-23 grows it UPWARD if the bottom stays at 624, so re-check the gap to whatever sits above | review | L-23 |

## A: arrows, lanes, wires, connectors

| ID | Rule | Check | Source |
|---|---|---|---|
| A-01 | Every ball rides a DRAWN wire. No ball travels over blank canvas | review | this file |
| A-02 | The SAME points array feeds the static wire and the packet route, so the two cannot drift | report:lane-traffic/A-02 | `scheme/CLAUDE.md`, card construction standard |
| A-03 | Return traffic gets its OWN lane, offset by the card's lane delta. A return re-using the outbound arrow reads as the query bouncing, not as an answer coming home | review | this file |
| A-04 | One wire per destination. N destinations get N wires, drawn even when a step takes one, so the reader sees the choice was made among drawn alternatives | review | `js/schemes/network/CLAUDE.md` |
| A-05 | **A wire nothing rides carries no arrowhead.** Use `relationPath({ points, d, role, dash })`: both `arrow()` and `pathArrow()` always attach a marker, and a marker with no traffic under it reads as traffic | report:lane-traffic/A-05 | `lib/scheme-kit.js`, `relationPath` |
| A-06 | **Which of the two a lane IS is decided by the step's own words**: if a step NAMES something travelling that way it earns a ball, otherwise it is a relationship. Do not read an arrow on one card and a relation line on the next as drift, the difference IS the content | review | `js/schemes/workloads/CLAUDE.md` |
| A-07 | Audit lane style by grepping `class: '...scheme-arrow`, not `arrow(`: a copy spelled with `line()` loses the dash and the dim and draws brighter than the lanes that carry balls | review | this file |
| A-08 | `relationPath` carries `scheme-arrow-relation`, which the CSS gives `stroke-opacity: 0.45`. `stroke-opacity` rather than a darker literal is deliberate: it keeps ONE colour token per category and MULTIPLIES with any element opacity a card pins | review | `scheme/css/diagrams.css`, the relation note |
| A-09 | **A lane leaves the box that ACTS**, which on a control-plane card is almost never the leftmost box. A controller writes to the API and stops there; what then happens on a Node is that write taking effect, so the lane into the Node band leaves the API | review | `js/schemes/workloads/CLAUDE.md`. `workloads-force-deletion` is the model |
| A-10 | Where two actors reach one slot, draw TWO lanes over a shared drop rather than picking a winner | review | `js/schemes/workloads/CLAUDE.md` |
| A-11 | Moving a lane is a TIMING change, because `routeDur` is length-based: moving a start 300 to 400 units right adds 250 to 870ms per ball. Raise the duration, never shorten the motion | test:duration/A-11 | `lib/scheme-kit.js`, `HOP_MS` note |
| A-12 | A box can be DERIVED FROM a lane (`KUBECTL_X = SPINE_X - BOX_W / 2`), so redefining the spine moves the box instead of the lane. Such a card needs its own constant | review | `js/schemes/workloads/CLAUDE.md` |
| A-13 | **A lane's shade is `min(source, sink)`**, never one end alone. Deriving from one end is how the catalog came to draw a full-strength arrow out of a Pod that was a ghost at 0.12 | test:opacity/PHASE | `lib/scheme-kit.js`, `laneOf` |
| A-14 | A lane whose far end is GONE goes to 0, not to a dim shade: a block leaves a hole when it vanishes so it dims instead, but an arrow into nothing leaves no hole and reads as a rendering fault | review | `lib/tokens.js`, `OPACITY` note |
| A-15 | **A lane carrying a ball must be visible for the whole flight**: pin its final value above the `ctx.reduced` guard, then animate `[{opacity:1},{opacity:0}]` with `fill: 'both'` and the same delay and duration as the fade below it, so keyframe one holds through the delay window | test:reduced/OPACITY-OWN | `lib/tokens.js`, `OPACITY` note, rule 3 |
| A-16 | A block's opacity and its lanes' opacity are stated in ONE place: a card-local `stage()` factory returning the whole `opacity` field, never two independent entries. Two assignments drift the moment a step is added, and the drift is invisible to every check | review | `lib/tokens.js`, `OPACITY` note, rule 1 |
| A-17 | `arrow()` and `pathArrow()` take `role` explicitly. Arrows carry `data-role` and are colour-checked | test:palette/SPREAD | `lib/primitives.js` |
| A-18 | `dim` on an arrow is a stroke WEIGHT, not a lifecycle state. `.scheme-arrow-dim` sits above the role rules at equal specificity so the role wins the stroke and `dim` survives as `stroke-width: 1.4`. That is deliberate: 601 dim lanes across the catalog carry a packet, and making `dim` outrank `role` greys them out | review | `scheme/css/diagrams.css`, the `dim` decision note |
| A-19 | A ball never travels under or over a block: every endpoint sits on an EDGE, so a rewrite INSIDE a box (DNAT, SNAT, port remap, conntrack) is drawn as a fade at one edge and a re-emergence at the far edge | review | `js/schemes/network/CLAUDE.md` (`NET.A-01`) |
| A-20 | **`relationPath` defaults NEITHER `role` NOR `dash`**, so a call that omits one renders without it: no role suffix drops the stroke to the generic fallback instead of the category hue, and no `dash` draws a solid relation. That is deliberate rather than an oversight. The hand-rolled lines it replaced were carried across AS THEY RENDER, because normalising them would have been an undeclared visual change to 29 lines in one pass, so the spread is inherited and NOT a convention to converge on quietly. Measured 2026-08-08: 41 calls, 6 with no role, 19 with no dash, and of the 22 that pass one, 19 are `5 5`, 2 are `4 6` (both on `storage-ephemeral-vs-persistent`) and 1 is `4 4`. A migrated card is outside that population: `P.relation` takes the role its kit binds (`S-42`), so only `dash` is still per call | review | `lib/scheme-kit.js`, `relationPath` |

## M: motion

| ID | Rule | Check | Source |
|---|---|---|---|
| M-01 | **Only Pods pulse.** Block auto-pulse is off catalog-wide (`autoPulse: false` is the `makeInit` default). Infrastructure lights through `.highlight` or `lightBoxAt` and never pulses | test:motion/PULSE-POD | `lib/timeline.js`, `lib/scheme-kit.js` |
| M-02 | A card never calls `pulse(` from `primitives.js` directly. Pods pulse through the kit's `pulsePod` | test:motion/PULSE-KIT | `test/render/motion.test.mjs` |
| M-03 | **A Pod pulses with everything inside it.** The pulsed element is always the `g` holding the shell AND its inner boxes: `pulsePod` finds targets with `querySelectorAll`, which matches descendants only and never the element itself, so pulsing a bare `pod()` fires at half strength. The symptom in `getAnimations()` is `strokeOpacity` tracks with no `filter` track | test:motion/PULSE-WHOLE, test:motion/PULSE-TOGETHER | `lib/scheme-kit.js`, `pulsePodWithTint` |
| M-04 | Pulse is `filter: brightness(...)`, never `transform: scale(...)`: diagram elements carry a `translate` a scale would compose-clobber | review | `lib/scheme-kit.js` |
| M-05 | The pulse `base` must equal the Pod's RESTING stroke. Measure it under `reducedMotion`, or a forwards-filled pulse hands you back its own end state | test:palette | `lib/tokens.js`, `PULSE_POD` |
| M-06 | Pod pulse is 900ms (450 up, 450 down), bright 1.4, dim peak 0.8. One length, catalog-wide, with no per-card override | test:motion/PULSE-SHAPE | `lib/tokens.js` `PULSE_POD` |
| M-07 | A DIM Pod needs `pulsePodDim`: the ordinary pulse plus an opacity lift to `PULSE_POD.dimPeak` and back, or the blink is invisible against the 0.55 it sits at | review | `lib/scheme-kit.js`, `pulsePodDimWithTint` |
| M-08 | A Pod that FADES OUT in a step must PULSE FIRST: pulse delay `<=` fade delay. Fading a Pod while it is still blinking reads as two events at once | test:opacity/ORDER | `test/render/opacity.test.mjs` |
| M-09 | **Packets animate `transform: translate(Xpx, Ypx)`** on a `cx=0, cy=0` circle, never SVG `cx`/`cy` | test:motion/TRANSFORM | `lib/scheme-kit.js`, `packetAlong` |
| M-10 | **Each packet must represent literal traffic the step narrates**, not decoration on a connector | review | this file |
| M-11 | Three packet flavours and no fourth: in-diagram hops `segmentPacket` (linear), right-angle routes `routePacket` (eased, distance-normalized), top-row request/ack hops `topPacket` (eased) | review | `lib/scheme-kit.js` |
| M-12 | **Routes take no explicit `dur`.** Travel time comes from path length at 0.45 units per ms, so a ball moves at one speed everywhere. An explicit `dur` is reserved for narrative pacing and needs a one-line justification at the call site | test:motion/SPEED | `lib/scheme-kit.js`, the `HOP_MS` speed-canon note |
| M-13 | `routeDur` clamps to `[700, 2600]`. `HOP_MS` 700 is both `topPacket`'s fixed duration and `routeDur`'s FLOOR, so from about 24 to 314 units the pace is flat: below that a 220 unit arrow would finish in 489ms and read as a dart next to the long glide. Tune pacing there, in one place | test:motion/CLAMP | `lib/scheme-kit.js` |
| M-14 | Every packet ripples at its destination. The delivered cue is part of the arrival canon with no per-call opt-in, and the ripple carries `.scheme-ripple` rather than `.scheme-packet` so anything counting packets sees ONE ball per hop | test:motion/ARRIVE, report:ripple-double/SIMULTANEOUS | `lib/scheme-kit.js`, `arrivalRipple` |
| M-15 | **Up-arrow (Pod to infra): `pulsePod(..., 0)` first, packet leaves at `BEAT.afterPulse`** (800, just under the 900 blink). That 800 is the same number as `BEAT.lead`, which is why M-18 says no probe can tell the two apart | report:motion/BEAT | `lib/tokens.js`, `BEAT` |
| M-16 | **Down-arrow (infra to Pod): packet first, `pulsePod(..., pkt.arrivalMs)` on arrival** | report:motion/BEAT | `lib/tokens.js`, `BEAT` |
| M-17 | Chained hops: `delay: prevHop.arrivalMs + BEAT.afterHop` (100). **Never hard-code a delay** | report:motion/BEAT | `lib/tokens.js`, `BEAT` |
| M-18 | A controller that self-initiates with no preceding hop or pulse waits `BEAT.lead` (800), so the lit source registers before the ball leaves. **`lead` and `afterPulse` are ONE number, so M-15 to M-18 are indistinguishable in the data**: nothing can say a given 800 was one rather than the other, and `render/motion.test.mjs` therefore prints the vocabulary as a CENSUS (it explains 671 of 714 balls) and asserts none of the four | report:motion/BEAT | `lib/tokens.js`, `BEAT` |
| M-19 | A step must OUTLAST its own motion: `span <= duration`. Fix an overrun by raising `duration`, never by shortening motion | test:duration/M-19, test:spec-steps/M-19 | `test/render/duration.test.mjs` |
| M-20 | **Geometry changes are timing changes**, because `routeDur` is length-based. After ANY geometry change re-check the span of EVERY step, not just the one you moved | test:duration/M-20 | `test/render/duration.test.mjs` |
| M-21 | A Pod materialises over `FADE.in` (600, ease-out) and dissolves over `FADE.out` (700, ease-in). A narrative-slow fade keeps an explicit duration with a justification at the call | report:motion/FADE | `lib/tokens.js`, `FADE` |
| M-22 | A newborn construction reveals over `REVEAL_MS` (500), which runs BEFORE the ball leaves (`BEAT.lead` is 800), so a block and its lanes are fully present by the time anything is sent down them. It is exported precisely so three cards can sequence the next beat off it rather than keeping private copies | report:motion/FADE | `lib/scheme-kit.js`, `REVEAL_MS` |
| M-23 | `revealAt` must not short-circuit on `delay <= 0` straight to opacity 1: nine card-local copies did, which silently played no fade AND threw `from` away. Under `ctx.reduced` it snaps to full, never otherwise | review | `lib/scheme-kit.js`, `revealAt` |
| M-24 | `revealAt`'s `from` is the shade an object rests at while a lane already points AT it. Hiding it outright aims the arrowhead at blank canvas for the whole flight | review | `lib/scheme-kit.js`, `revealAt` |
| M-25 | `animateAlong` honors `options.delay`. A bug dropping it made packets teleport invisibly during the delay window. Do not regress it | report:motion/BEAT | `lib/primitives.js` |
| M-26 | Value chips NEVER flash. **The population is EMPTY**: the walk finds zero `PULSE_BLOCK`-magnitude tracks anywhere in the catalog, on a chip or on anything else, so a green run says nothing about this row and never has | review | this file, P-05. Population measured 2026-08-07, `test/render/motion.test.mjs` |
| M-27 | A packet-less, pod-less step carries its beat with `.highlight`, or with `flashChips`, which is the ONLY sanctioned block flash. **Nobody uses the second half**: zero of the 108 cards call `flashChips`, so the sanctioned flash is a mechanism with no callers. It stays exported anyway, see S-25 | review | `lib/scheme-kit.js`, `flashChips`. Counted 2026-08-07 |
| M-28 | **`lightBoxAt` and `at` use an EMPTY keyframe list, and that is load-bearing.** Naming `opacity` composites the target for the whole delay window: Chrome promotes an element for as long as an opacity animation is attached to it, DELAY PHASE INCLUDED, so every block about to light shifts tone for the flight of the ball and snaps back. On `at` the target is the SVG ROOT, so every block on the card shifts. **Promotion CASCADES**: anything painted above a composited layer and overlapping it is promoted with it, which took three lanes and a wire label along. Empty costs nothing in return, because the animation stays a first-class WAAPI object at the same delay and duration, still listed by `getAnimations()` and still firing `onfinish` | test:motion/TIMER | `lib/scheme-kit.js`, `lightBoxAt`. Confirmed with CDP LayerTree, where `g.scheme-box 222x82` enters the layer list mid-flight and is gone after, and NEVER by pixel diff: headless software rendering blends both ways identically and shows nothing |
| M-29 | Grep for `animate([{ opacity: 1 }, { opacity: 1 }]` to check M-28 has not come back | test:motion/TIMER | `lib/scheme-kit.js`, `lightBoxAt` |
| M-30 | **A riding label's easing and any explicit `dur` must match the ball it rides** (`segmentPacket` is linear, routes are eased, `animateAlong` defaults to ease-in-out). Get it wrong and the tag drifts off mid-flight, rejoining only at the endpoints and the midpoint, which no static screenshot shows. Compare the two animations' `easing` | test:motion/RIDE | `lib/scheme-kit.js`, `makeRidingLabel` |
| M-31 | A riding label is pinned at the route START at build, or it sits at the SVG origin until `animateAlong`'s delay elapses and its fade-in plays in the top-left corner under the narration panel | test:motion/RIDE | `lib/scheme-kit.js` |
| M-32 | `ridingLabel` binds its per-card constants ONCE at module scope through `makeRidingLabel({ role, dy, dx, easing, inMs, outMs, hold, emergeMode })`. Never write a local copy of it, of `lightBoxAt` or of `at` | review | `lib/scheme-kit.js` |
| M-33 | Every animation goes through `ctx.register(...)`, so a step change cancels it | review | `lib/timeline.js` |
| M-34 | An added hop costs about 800ms (a short gap sits on the 700 floor plus `BEAT.afterHop`), so `duration` usually has to rise and `render/duration.test.mjs` says by how much | test:duration/M-34 | `lib/tokens.js`, `BEAT` |
| M-35 | **A SEEK cannot see a deferred effect**: `seekStep` sets `currentTime` and never fires `onfinish`, so every `at(...)` turnover, every `lightBoxAt` arrival class and every deferred `setWire` is missing from any frame it hands back. The deleted `frame-strip` reader had the same blind spot, and the mechanism is all that survived it, in the seek helper the render fixture carries. Verify a turnover by sampling a REAL-TIME playthrough (`tools/settled-dump.mjs` plays every step at speed), and read `render/reduced.test.mjs` passing as the proof it lands | review | `test/fixtures/render.mjs`, `seekStep` |

## C: colour, roles and the opacity vocabulary

| ID | Rule | Check | Source |
|---|---|---|---|
| C-01 | **`role` is a palette slot, not the card's category.** A workloads card writes `role: 'cluster'` on its kubelet box on purpose | test:palette/UNKNOWN | `scheme/CLAUDE.md` |
| C-02 | **`role` is bound ONCE, in the category kit, and writing one at a call site is an OVERRIDE rather than a default.** `makePartKinds` stamps the bound role on every roled part whose `role` is `undefined`, so an explicit `''` or `null` survives, drops `data-role` (the primitives write `role \|\| null`) and paints the generic fallback instead of the category hue. A tinted dialog collapses most roles onto the one tint, so a wrong role is usually invisible: `UNPAINTED` is the only thing that sees a role that resolved no colour. See S-42 | test:palette/UNPAINTED | `lib/scheme-kit.js`, `valChip` |
| C-03 | One `(category, element class, role, state)` tuple resolves to ONE colour. `render/palette.test.mjs` catches a role that resolves inconsistently, NEVER a role that was the wrong one to ask for | test:palette/SPREAD, report:palette-steps/CONFLICTING | `test/render/palette.test.mjs` |
| C-04 | Every opacity between 0 and 1 comes from `OPACITY` in `tokens.js`, so a shade learned on one card reads correctly on the next. A bare `0` or `1` is fine | test:opacity/PHASE, test:skeleton/C-04 | `lib/tokens.js` |
| C-05 | `OPACITY.running` 1.00: in focus and working | test:opacity/PHASE | `lib/tokens.js` |
| C-06 | `OPACITY.pending` 0.55: declared, not working yet | test:opacity/PHASE | `lib/tokens.js` |
| C-07 | `OPACITY.notready` 0.40: alive but not serving, not observed, or outside this path | test:opacity/PHASE | `lib/tokens.js` |
| C-08 | `OPACITY.terminating` 0.25: `deletionTimestamp` set, eviction or shutdown under way | test:opacity/PHASE | `lib/tokens.js` |
| C-09 | `OPACITY.terminated` 0.12: gone from the API, or finished | test:opacity/PHASE | `lib/tokens.js` |
| C-10 | A pulse peak (`PULSE_POD.dimPeak`) is a motion magnitude and a presentation shade belongs in CSS. Neither is a phase: do not force them into the vocabulary | test:opacity/PHASE | `lib/tokens.js` |
| C-11 | Nothing holds `.highlight` while it sits at the terminated shade | test:opacity/LIT | `test/render/opacity.test.mjs` |
| C-12 | `render/opacity.test.mjs` judges the RESOLVED value in the browser rather than the source expression, so a shade reaching an element through a helper, a parameter or a ternary is judged like any other and a named constant cannot smuggle one past it | test:opacity/PHASE | `test/render/opacity.test.mjs` |
| C-13 | A LANE has no phase of its own and is not in the vocabulary. See A-13 | test:opacity/PHASE | `lib/tokens.js` |
| C-14 | **A block that does not exist yet DIMS, it is not cut out.** Cutting an absent block leaves a block-sized hole that reads as a rendering fault, so draw it dim with a sublabel saying so | review | this file |
| C-15 | **`data-cat` is chrome, `data-role` is diagram. Never merge them back.** `styles.css` selects the former, `diagrams.css` the latter, and the two files do not cross | review | `scheme/css/` |
| C-16 | A tinted category declares FOUR opaque colours as CHANNEL LISTS (`--tint-deep-rgb` / `-base-rgb` / `-bright-rgb` / `-canvas-rgb`) plus three hand-mixed surface fills, and nothing else | review | `scheme/css/styles.css` |
| C-17 | Channel lists rather than hex, because `rgba()` cannot take a hex through a `var()` | review | `scheme/css/styles.css` |
| C-18 | **Every shade WITH an alpha is derived ONCE in the shared `[data-tinted="true"]` block.** Adding a shade is one line there, never four. Restating alpha per category is how a `--tint-glow` came to disagree with its own `--tint-base` | review | `scheme/css/styles.css`, the tinted dialog block |
| C-19 | **Do not re-add a per-category `.narration-overlay` background.** Retint through `--tint-canvas-rgb` and the panel follows. A hand-copied override per category is how a violet card carried a navy panel for as long as the category had existed | review | `scheme/css/styles.css`, `.narration-overlay` |
| C-20 | `color-mix` is deliberately unused, so colour resolution stays fully deterministic | test:files/C-20 | `scheme/css/styles.css`, the tinted dialog block |
| C-21 | Networking is the one category whose colour appears as a LITERAL in `diagrams.css`: `.scheme-packet` and `.scheme-ripple` pin `#4fe5ff` because the tint stop washed the ball out. Do not fold those into tokens | review | `scheme/css/diagrams.css` (`NET.C-01`) |
| C-22 | Retinting a category touches five places: the kit's `<CAT>_TINT`, `css/tokens.css`, the tinted block in `css/styles.css`, `POSTER_COLORS` in `js/app.js`, and the folder `CLAUDE.md`. **All four categories agree across all five since 2026-08-06**, so a mismatch is now a regression rather than a known exception | review | this file, D-13 |
| C-23 | A green above roughly 50 percent saturation goes acid on this canvas. If a new green shade is needed, move LIGHTNESS, not saturation | review | `js/schemes/storage/CLAUDE.md` (`STO.C-01`) |
| C-24 | The retired Lifecycle category (coral `#ff668c`) is NOT reserved anywhere in `scheme/`. `tokens.css` does not carry it, and the only live `#ff668c` in the repo is `--ts-tools-color` in `cli/css/styles.css`, an unrelated slot | test:files/C-24 | measured 2026-08-06 |

## T: text, narration and terminology

| ID | Rule | Check | Source |
|---|---|---|---|
| T-01 | **No apostrophes** in narration, wire or chain strings: they are single-quoted JS and an apostrophe breaks the module load. Reword | hook, test:inline/T-01 | `.claude/hooks/check-js.sh` |
| T-02 | Verify T-01 with a browser smoke, not just `node --check`: the hook catches the syntax error, `render/smoke.test.mjs` catches the ReferenceError class it does not | test:smoke, test:inline/T-02 | `test/render/smoke.test.mjs` |
| T-02a | **`node --check` and the browser do not agree.** On a file whose first statement is an `import`, Node takes the ESM path and ACCEPTS a reserved word as a destructured binding (`function f(s, { cond, new, grace })`). The browser rejects it, the module never loads, and the card renders nothing. Never derive an identifier from data (a chip name, a label) without checking it against the reserved-word list | test:smoke | measured 2026-08-06, `.claude/hooks/check-js.sh` |
| T-03 | **No semicolons** in narration prose: use a comma, or a period plus a capital | test:text/T-03, test:inline/T-03 | this file |
| T-04 | **Neither an em-dash nor an en-dash, anywhere.** The prose says "no em-dashes", the rule bans both | test:text/T-04, test:inline/T-04 | `test/unit/text.test.mjs` |
| T-05 | `R-dash` scans the card modules, the four manifests, the kits, this file, and the named root and `cli/` files. The four `CARDS.md` are deliberately OUTSIDE its area, because a design record quotes what a card must not write | test:text/T-05 | `test/unit/text.test.mjs`, `dashTargets` |
| T-06 | **Terminology is a dictionary, not taste.** `test/fixtures/terms.json` is the source of truth: 70 hard terms, 13 hard-lowercase, 11 range exceptions, 8 soft terms reported only | test:text/T-06, test:inline/T-06 | `test/fixtures/terms.json` |
| T-07 | Two dictionary decisions are deliberately NOT the upstream ones: the catalogue majority wins (`Kubelet`, `ETCD`, `Node-1` keep their capitals), and `Node`, `Pod`, `Service` are ALWAYS capitalised. `kubectl` is always lowercase | test:text/T-07, test:inline/T-07 | `test/fixtures/terms.json` |
| T-08 | Between them `unit/text.test.mjs` (`desc`) and `render/inline.test.mjs` (every `narration` and every `aria-label`) read all of the prose. Neither can read MEANING | test:inline/T-08 | `test/render/inline.test.mjs` |
| T-09 | **System A for strings drawn ON the diagram**: a BLOCK LABEL is a heading and takes a capital, everything else on the canvas is body text and stays lowercase | test:inline/T-09 | `test/render/inline.test.mjs` |
| T-10 | Block labels capitalize the FIRST word only. A later word takes a capital only when it is an API object, an acronym or an identifier: `Routing decision` and `CSI controller`, but `ConfigMap app` and `Pod A bind mount` | test:inline/T-10 | `test/render/inline.test.mjs` |
| T-11 | Hyphenated names capitalize only the first segment; bare identifiers keep their real casing | test:inline/T-11 | `test/render/inline.test.mjs` |
| T-11a | **A named API object is drawn as its TYPE, a space, then its own lowercase name**: `PVC data-claim`, `Pod web-0`, `PV x73a`. Never glue the two with a hyphen. `PV-x73a` states a name RFC 1123 forbids, and it sat beside a correctly written `PVC data-claim` on the same card until 2026-08-14, when 51 strings over 12 storage cards were brought onto the claim's grammar. Storage was the only category out of line: `workloads-pvc-stickiness` was already drawing `PV cloud-vol-x`. A YAML field quoted in a tag takes the BARE name (`volumeName: x73a`), because that is what the field holds | review | `js/schemes/storage/CLAUDE.md`, measured 2026-08-14 |
| T-12 | A node frame label is the exception you cannot fix in the string: `.scheme-node-label` is uppercase catalog-wide by CSS | test:inline/T-12 | `scheme/css/diagrams.css` |
| T-13 | **One object, one label, across cards.** Strings are only compared inside the same POSITION CLASS, because a heading and a chip name are supposed to differ | test:inline/T-13 | `test/render/inline.test.mjs` |
| T-14 | The value class never fails: an API literal and an English word wear the same letters, so 11 ambiguous pairs are reported for a human to judge and are not findings | report:inline/T-14 | `test/render/inline.test.mjs` |
| T-15 | **A run that reads fewer strings than the last green one has checked less, and it must be red.** The old form of this was an indirect-coverage FLOOR (321, then 702 after the chip fold) insuring a SOURCE resolver that could stop matching. The input is the canvas now, so there is no resolver to go quiet, and the insurance is a CENSUS with floors instead: narration off the controller, one `aria-label` per card, distinct drawn strings, block-owned strings. The numbers live in the test, where they execute, and are not restated here | test:inline | `test/render/inline.test.mjs` |
| T-16 | **Do not put a SOURCE resolver back into `prose.mjs`.** It carries one sentence splitter and one term matcher and nothing else, and `unit/catalog`, `unit/text` and `render/inline` all read prose through it, so a change there moves every prose verdict at once. The resolver it used to carry is why the ban exists: it collapsed two distinct ways at exit 0, a renamed `setChip` taking its coverage from 321 to **114** and a `setChips` moved out of a line-initial `function` declaration taking it to **6**. The input is the rendered canvas now, and T-15's census is the insurance | review | `test/fixtures/prose.mjs`, which deliberately does not carry the resolver |
| T-17 | **There is no such thing as an unread chip write any more, and the ceiling of 8 is retired with the class it counted.** A string drawn on the canvas either is there or is not. What replaces the ceiling is the sharper half of the same idea and it is a CLOSED INVENTORY rather than a number: exactly the listed text classes may draw a string, and a string under any other class is a finding **even when the count went UP**, which is the failure a count cannot see | test:inline | `test/render/inline.test.mjs` |
| T-17a | **The 8 writes that list enumerated are not a category of anything now.** A template literal doing arithmetic, a bare variable, a run-time `s.refs[k]`, a `String(i + 1)`, a ternary, and one `valChip` whose name and value come from a data array were unreadable to a SOURCE resolver and are ordinary text nodes on a CANVAS: all six shapes are read, classified and judged like every other string. Nothing about those chips changed, only what can see them | test:inline | `test/render/inline.test.mjs`, 18 to 8 to no such class |
| T-18 | Two different Pods must not carry the same address, and a request must not exceed its own limit | test:inline/T-18 | `test/render/inline.test.mjs` |
| T-19 | **An absolute in a narration is a defect waiting to be found**, and the counter-case is usually a sibling card. Grep for `only`, `never`, `always`, `the whole of`, `all`, `nothing` before shipping a sentence | report:text/T-19 | this file |
| T-20 | The fix for T-19 is a CLAUSE, not a rewrite. **If a sentence needs a condition to be true, spend the characters**: cutting a condition to fit a band leaves a true sentence standing as a false absolute | test:catalog/D-04 | this file |
| T-21 | **If a step NAMES an actor, that actor has to be on the card** | review | this file |
| T-22 | Same test for a WIRE LABEL: it may only name traffic that rides THAT lane | review | this file |
| T-23 | A component the docs mark `(optional)` must say so on the card: on the BLOCK when it is genuinely absent in a large share of clusters, in the NARRATION when it is near-universal but replaceable. Two `optional` sublabels in one drawing read as a pattern | review | this file |
| T-24 | **Any edit that changes or adds a technical claim gets the internal-contradiction check before it lands**: grep the claim's keywords across the whole card and read what its other steps, its chips, its block labels and its `aria-label` already assert. Matching one sentence is not the test | review | root `CLAUDE.md` |
| T-25 | **Matching the narration is a PROXY for being true.** A sentence can be silent about something real (check the `aria-label` too, it often says what the steps left out) and a sentence can be loose | review | this file |
| T-26 | **When checking against kubernetes.io, read the RAW page, not a summary.** A summariser returns a confident invention and nothing contradicts it. `curl -sL` and strip the tags. There is no offline copy to fall back on: the liveness report writes no page cache, deliberately | review | `test/report/sources.test.mjs` |
| T-27 | The highest-yield part of an upstream page is its OPENING paragraphs, because that is where the doc puts what distinguishes the feature, and it is exactly what a card built from knowledge omits | review | this file |
| T-28 | A card's `aria-label` describes the WHOLE drawing, not the current step, and it is the only text a screen reader gets for the picture. **Two shapes are in use and both are legitimate**, measured over all 108: **24 end in a full stop** and are two to four sentences of description, **84 do not** and are a headline phrase with a colon and a list of stages. Match your own card's neighbours rather than converging the catalogue, and never leave it stating only the first step | test:inline/T-28 | `scheme/CLAUDE.md`, measured 2026-08-12 off the imported SCENE data |
| T-29 | Wire labels are dim `text` at fixed positions, blank (`' '`) at build, filled per step with `setWire` | test:reduced/WIRE-TEXT | `lib/scheme-kit.js` |
| T-30 | **A wire label the ANIMATED path alone writes shows a blank lane on prev and reset**, while the narration names the exact string that should be there. The `wires` field runs above the guard on both paths, so the defect now takes a wire written only by an `F.set` inside `flow`, by a `motion` escape or by a deferred turnover. The idiom that keeps both paths right: state the label in `wires`, wind it back blank in `rewind`, and let the `F.set` fill it on the beat | test:reduced/WIRE-TEXT | `test/render/reduced.test.mjs` |
| T-31 | **A mass automated pass over prose must be followed by READING it.** A regex sweep leaves the linters green and the meaning broken, and an assertion that a pattern matches once does not protect a prefix-style edit from a second run | review | root `CLAUDE.md` |
| T-32 | Sources: two sources on one card must not share a label | test:catalog/R-srcdup | `test/unit/catalog.test.mjs` |
| T-33 | One href is labelled ONE way across the catalog | test:catalog/R-srclabel | `test/unit/catalog.test.mjs` |
| T-34 | Source liveness (DEAD, SOFT, MOVED, ANCHOR) is checkable but can never be mandatory, because it hits the network. **Nothing is cached**, deliberately: the ancestor's warm cache let it report 0 findings without fetching anything, so a green run now means the links were alive at the moment it ran and a run with no route out fails every url. 149 unique urls, all alive on 2026-08-06 | report:sources/DEAD | `test/report/sources.test.mjs` |

## P: value chips

| ID | Rule | Check | Source |
|---|---|---|---|
| P-01 | **Every step states EVERY chip**, not only the ones it narrates: a legacy card through ONE `setChips(s, {...})` call, a migrated card through its `chips` field. An unset chip keeps the previous step's value and silently lies | test:spec-steps/P-01, report:chip-unwritten/LIT-NOT-WRITTEN | this file. The CONVENTION is machine-checked on every migrated card, whether a carried-over value is still TRUE stays a human's job |
| P-01a | **The chip half of the rule is CLOSED and machine-checked; the label half is not.** Read off the migrated data over all 108 cards: **2 361 chip writes over 650 steps, one identical chip set per card, zero unstated steps.** What the rule does NOT reach is the other text axes: labels, sublabels and pod sublabels are still inherited on **57 step/axis pairs across 13 cards** (cluster 16, workloads 18, network 23), and part of that is deliberate, a hidden slot with no text to write. Closing them in one sweep would repeat the mass-autoedit mistake the root `CLAUDE.md` records | review, test:spec-steps/P-01 | measured over the spec data after the storage migration. A carried-over value that is still TRUE as drawn is not a defect, which is why the label half stays a human's call |
| P-11 | **A value a step writes belongs in a writer FIELD, never in the `enter` escape.** The vocabulary is closed (`chips`, `chipsCued`, `wires`, `labels`, `sublabels`, `podSublabels`, `opacity`, `lit`, `chain`) and a name outside it draws nothing, throws nothing and reads in a diff as a plausible line, while a write hidden inside `enter(s, ctx)` is a function body every static reader is blind to and drops out of P-01's chip set with no finding. The old form of this rule pinned the exact shape of a `setChips` wrapper, because that shape was what `prose.mjs` could read. See T-16 | review | `test/fixtures/prose.mjs` |
| P-12 | **Only TOP-LEVEL chip writes belong in `setChips`.** A write inside a `ctx.reduced` branch or inside an `at(...)` turnover is a different BEAT (`P-03`), and folding it into the step-entry call moves when the value appears. This is why 23 cards could be folded mechanically and the rest could not | review | measured 2026-08-06 |
| P-13 | A `setChips` key may NOT be spelled `label`, `sublabel`, `ip` or `sub`. `check-figures` READ `ip: '...'` in an object literal as a Pod ADDRESS written where a block is built, so a chip key of that name made a chip value look like a second block carrying the same address, and a real DUP-IP look like a duplicate of itself. `render/inline.test.mjs` takes the addresses off the RENDERED frames instead, so its DUP-IP no longer reads a source key at all. Use `podIp` | test:spec-steps/P-13 | `test/render/inline.test.mjs` |
| P-14 | Nor may a key be a RESERVED WORD. See T-02a | test:smoke | 2026-08-06 |
| P-02 | **A chip always means what its name says.** If a step needs to report something else, that is a second chip, not a reused one. Naming a chip for the thing it holds is also what stops it competing with a riding tag for the same word on screen | review | this file |
| P-03 | **A chip must not run ahead of the motion that produces its value.** Pin the end value above the guard, then on the played path set the chip back to what the step STARTS from and turn it over on `pkt.arrivalMs` through `at(...)` | report:chip-beat/FORM-B, report:chip-beat/FORM-E | `test/report/chip-beat.test.mjs`, which reads this off the spec with no browser and ranks the queue by how long the value stands on screen before the first ball lands. `report:arrival/R2` was cited here and asks the OTHER half: whether a changed value is CUED, never whether the arrival that earns it has happened |
| P-04 | Picking the beat is the whole job: what a component KNOWS moves when the answer reaches it, what a component DID moves when the call lands, object state moves when the write reaches whatever stores it. Where a step is a SEQUENCE, the chip steps through it. **Doing this to one chip and not its neighbour is worse than doing it to neither** | review | this file |
| P-05 | A chip whose value CHANGED this step lights as a STATIC highlight, never a flash | report:arrival/R2 | `lib/scheme-kit.js`, `setChip` |
| P-05a | **The cue does not have to be a highlight on the chip.** A Pod pulse, or a helper walking a listing row by row, is the cue on four cards, and one card leaves a panel deliberately unlit because the value went back to `none`. R2 sees none of that: its 29 findings hold ZERO true positives, read one by one on 2026-08-06 | report:arrival/R2-ENTRY | `test/report/arrival.test.mjs` |
| P-06 | Value chips are deliberately OUT of the arrival rule: they light at step ENTRY with the text change, while boxes, pods and cylinders light on ARRIVAL | report:arrival/R3 | `test/report/arrival.test.mjs` |
| P-07 | A chip's NAME must not collide with its longest VALUE, measured RENDERED on every step. `valChip` anchors the name 12 from the left and the value 12 from the right, so a chip needs name + value + 24 plus a readable gap. Shorten the VALUE rather than widening the chip | test:chipfit/P-07 | `test/render/chipfit.test.mjs` |
| P-08 | `valChip` has NO category default for `role`. It used to default to `cluster`, which tagged 82 workloads chips with the cluster palette, invisible only because a tinted dialog collapses every role onto one tint | test:palette/UNPAINTED | `lib/scheme-kit.js`, `valChip` |
| P-15 | **A chip's value has to be READABLE by something.** Declare the chip as a `P.chip` part and write its value through the `chips` or `chipsCued` field, so the spec reader sees the value as data and `render/inline.test.mjs` sees the string as drawn. The ban this row used to carry (never build a chip through a card-local factory) is LIFTED with the source-scraping resolver that justified it: a factory once hid every value a chip ever showed while `check-inline` and `check-labels` kept printing zero findings, and nothing can hide that way from a reader whose input is the rendered diagram | review | `test/fixtures/prose.mjs`, and `network-nodeport-loadbalancer` where it was undone |
| P-09 | `setChip` highlights a chip whose value changed; `setVal` writes without the highlight. **A card converging on a `setChips` wrapper keeps whichever primitive it already called**: swapping `setVal` for `setChip` is a VISIBLE change | review | 2026-08-06, stage 5.3 |
| P-09a | **The cue answers a change of FACT, not a change of TEXT.** A chip whose string moves while what it reports does not takes no highlight, and `report/arrival.test.mjs` carries all seven of those in R2_STEP_CARRIED with the reason on each: a value RETURNING to the steady state after a conditional aside (`cluster-api-structure` crd x3, `cluster-static-pods` edit-file), a panel emptying because THIS MODE has no such field (`network-client-ip-preservation` passthrough x2), and a suffix explaining an unchanged state (`cluster-oom-kill` oomkill, where the state really is still Running). Cueing any of them announces an event that did not happen, and each is written down in its own `CARDS.md` section as well | report:arrival/R2-STEP | `test/report/arrival.test.mjs`, `R2_STEP_CARRIED` |
| P-10 | **The two chip writers are bound to two FIELD NAMES inside `writeStatics`, and no import graph shows that coupling**: `chips` reaches `setVal`, `chipsCued` reaches `setChip`, in that fixed order. Renaming a writer, or swapping which field reaches which, moves the highlight on 191 steps with nothing failing to resolve. The old form of the rule guarded the same kind of coupling one layer out, a `prose.mjs` seed on the name. See P-09 | review | `lib/scheme-kit.js`, `setChip` |

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
| D-13 | Adding a CATEGORY touches: the folder, `cards.js`, `posters.js`, `<cat>-kit.js`, `CLAUDE.md`, `CARDS.md`, `CATEGORIES` in `js/data.js`, the tint block in `css/styles.css`, the colour in `css/tokens.css`, `POSTER_COLORS` in `js/app.js`, the header of any test that has to know about it, and a `<CAT>.*` block in this file | review | `scheme/CLAUDE.md`, new-category checklist |
| D-14 | The poster-first model applies to all 108 cards: idle is a static poster, step 1 auto-plays after about 1s through the cancellable `Timeline.autoPlay`, the poster previews step 1's TEXT immediately, and `Next` from the last step wraps to poster then step 1. **Only the first half has a machine**: a step 0 that draws nothing is readable as data, while `posterFirst: true` is an ARGUMENT inside `defineCard`'s closure and is statically unreachable, so the rest of the row is a human's | test:skeleton/D-14 | `lib/timeline.js` |
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
| R-11 | `FALLBACK_POSTER` in `js/app.js` breaks R-08 and R-09 on purpose. It is the shape shown when a card has no poster, `R-poster` guarantees that never happens, and nothing renders it today. Do not "fix" it into canon and do not delete it: it is the failure mode made visible | test:catalog/D-06 | `js/app.js` |
| R-12 | Poster notes go to that category's `CARDS.md` under the card id as a `### poster` subsection, because `POSTERS` is keyed by card id. **Coverage is 108 of 108**, so a missing one is now a regression | review | the four `CARDS.md` |

## S: module structure

| ID | Rule | Check | Source |
|---|---|---|---|
| S-01 | **A scene has exactly ONE construction path.** `makeScene(SCENE)` is the only producer of a `Scene` class, its prototype is closed to `constructor`, `build` and `reset`, the constructor paints, and `reset()` repaints from scratch rather than undoing anything. The rule used to name the class literal a card copied; a card that writes one of its own now is a second construction path nothing else in the layer knows about | test:skeleton/S-01 | `test/unit/skeleton.test.mjs` |
| S-02 | **A card module has exactly ONE legal export surface**: `SCENE`, `STEPS_SPEC` and `init`, from `defineCard(SCENE, STEPS_SPEC, { posterFirst: true })`. The comparison is set EQUALITY per card, never containment. The legacy surface (`init` alone, from `makeInit`) was RETIRED 2026-08-15 with 0 cards on it: `scheme/CLAUDE.md` already called writing one a regression rather than a choice, so a rule admitting it contradicted the contract. `LEGACY_EXPORTS` stays in the fixture as the DETECTOR that names the regression, not as a second legal form | test:module/S-02 | `test/unit/module.test.mjs` |
| S-03 | **A build starts from an empty host and a fresh `refs`.** `buildScene` opens with `host.replaceChildren()` and builds `refs` from nothing, so a replay inherits no element and no ref from the pass before it, and nothing else may append to the host | review | `scheme/CLAUDE.md` |
| S-04 | The root svg carries `viewBox: '0 0 1200 640'`, no exceptions. **Re-centre the content, do not move the camera.** A card builds it with `diagramRoot({ 'aria-label': '...' })` | test:skeleton/S-04 | `lib/scheme-kit.js`, `diagramRoot` |
| S-05 | **No card owns the camera.** One `diagramRoot` serves all 108: a card declares no viewBox and no camera key anywhere in its parts, and feeds the camera exactly one thing, its `aria-label`. The rule is stated so that a card with NEITHER is a finding, which is what its ancestor got wrong by checking a literal only if it found one, and would have retired itself at exit 0 the day the root was hoisted. **A rule that is silent when its subject disappears is not a rule** | test:skeleton/S-05 | rewritten 2026-08-06 before the hoist, not after |
| S-06 | `preserveAspectRatio: 'xMidYMid meet'` and `data-style: 'outline'` come with `diagramRoot`. `arrowDefs()` stays in the card, appended first, because one card puts it on a content group rather than the root | review | `lib/scheme-kit.js` |
| S-07 | **Z-order**: body blocks, then wires and wire labels, then chips, then `packetLayer = g({ id: 'packetLayer' })` on top. Blocks that must sit above packets (top-row infra, the chain ladder) are appended AFTER the packet layer, and the z-order is stated in a comment | review | `scheme/CLAUDE.md` |
| S-08 | Pods are a `podShell()` plus inner `box()`es wrapped in a `g`, and the pulse target is that `g`. See M-03 | review | `lib/primitives.js` |
| S-08a | **RETIRED 2026-08-15 with `S-02`.** It described the hand-written form: a card-local `podBlock(...)` keeping its GEOMETRY and ending in `return wrapPod(shell, innerBox);`. No card is on that form, and `wrapPod` was deleted the same day for having zero callers. `P.pod` is what builds a Pod now, and the two shapes the row called exceptions (`storage-fsgroup-ownership` wrapping three children, `storage-container-filesystem` wrapping a shell wrapper) are ordinary `part.tune` and `part.raw` today | review | `lib/scene-spec.js`, `buildPod` |
| S-08b | A category kit binds its tint with `export const { pulsePod, pulsePodDim } = makeTintedPulses(<CAT>_TINT);`. The two bodies live once, in `scheme-kit.js` | test:module/S-08b | `lib/scheme-kit.js`, `makeTintedPulses` |
| S-08c | **The `aria-label` stays an object key at the `diagramRoot` call site.** `check-terms` FOUND that prose by matching `'aria-label': '...'` in the SOURCE, so a positional argument would have taken all 108 sentences out of its input with no finding and no error. `render/inline.test.mjs` reads the attribute off the rendered diagram instead. Verified across the hoist: 758 prose strings before and after | review | `lib/scheme-kit.js`, `diagramRoot` |
| S-09 | **Step 0 is `id: 'idle'`, a pure reset, carries no `narration` and must not DRAW.** The poster shows step 1's text, so a slot-0 string is read by nobody and a slot-0 wire label or lit block sits under the panel text of the step AFTER it. Nothing checks this: if a slot-0 `enter()` is longer than the prologue plus its chip resets, look at what it puts on screen | test:spec-steps/S-09 | `scheme/CLAUDE.md` |
| S-10 | **Every step's `enter()` opens with the prologue and nothing before it.** `makeSteps` generates that order once and runs it on BOTH paths: prologue, the static block, the card's `enter` escape, then the reduced guard. An escape therefore runs INSIDE the static block and can never precede the reset, which 108 hand-copied `resetStep(s);` first lines used to promise one card at a time | test:skeleton/S-10 | `test/unit/skeleton.test.mjs` |
| S-11 | **The prologue is generated once, out of `SCENE.reset`, and its order is fixed**: `packetLayer.replaceChildren()` FIRST, then `clearHighlights` over `reset.keys` and `reset.pods`, then `clearWires`, then `reset.extra` LAST. Only the middle is per card, and it is DECLARED (`keys`, `pods`, `extra`) rather than written. **The hand-written copies ran their extras BEFORE `clearWires`, and the change of order is unnoticed rather than fine**: the one extra in the catalog (`cluster-api-structure`) touches `strokeDasharray` and nothing a wire label owns, so an extra that wrote a wire label would be wiped by the clear that now follows it | test:skeleton/S-11 | `test/unit/skeleton.test.mjs` |
| S-12 | No card declares `clearHL(s)`: the prologue fold replaced it. **It has no successor as a statement about DATA, and that is established rather than assumed**: a migrated card writes no prologue at all and `clearHL` is on no kit, so a count over the sources is the only form the rule has left | report:skeleton-census/S-12 | `test/report/skeleton-census.test.mjs`, Q3 |
| S-13 | Above the reduced guard a step sets ALL chip values, wire labels and `.highlight` classes, and **pins final opacities inline**, so a cancel mid-step lands on the right value | test:reduced | `scheme/CLAUDE.md` |
| S-14 | **The reduced-motion split is the load-bearing line.** Everything ABOVE `if (ctx.reduced) return;` is the complete static end-state; everything BELOW is motion | test:reduced | `test/render/reduced.test.mjs` |
| S-15 | **Never animate state that is not also pinned statically above the guard** | test:reduced | `test/render/reduced.test.mjs` |
| S-16 | `render/reduced.test.mjs` compares four axes and **all four are enforced**: own opacity, INHERITED (effective) opacity multiplied down the ancestor chain, drawn wire text, and the `.highlight` set. The last is where a wrong `reducedLit` derivation lands | test:reduced | `test/render/reduced.test.mjs` |
| S-17 | Whatever lights on ARRIVAL must also light on the REDUCED path. `flowLights` DERIVES that from every `lights` list in `flow`, so a card writes nothing; what it cannot derive is a highlight the static path shows INSTEAD of a pulse, and that is `reducedLit` | test:reduced/HIGHLIGHT | `lib/step-spec.js`, `flowLights` |
| S-18 | **When a block dies mid-step, take its highlight back in the fade's `onfinish`** rather than mirroring it onto the static path | test:spec-steps/S-18 | `scheme/CLAUDE.md` |
| S-19 | A `.highlight` put on a Pod INNER BOX has to be cleared BY NAME in `clearHighlights`'s keys list. The `pods` argument runs `clearPodHighlight`, which resets inline stroke styles and touches NO class. **Confusing the two leaks a class that ACCUMULATES**: prev and reset replay 0..n, so the box stays lit for the rest of the card and gathers one more with every step, which is how FIVE networking cards carried it at once. Nothing in the suite can see it: `render/reduced.test.mjs` compares the two paths against each other and both accumulate identically (its `HIGHLIGHT` axis reports rather than fails in any case), arrival looks at receivers, and palette reads a lit element as a legal state. Only a per-step dump of the whole class set shows it | test:spec-steps/S-19 | `lib/scheme-kit.js`, `clearHighlights` |
| S-20 | **A folder holds exactly four kinds of `.js`**: its cards, its `<category>-kit.js`, its `cards.js`, its `posters.js` | test:catalog/D-03 | `test/unit/catalog.test.mjs` |
| S-21 | **A card imports its own kit and nothing past it**: `../../lib/svg.js`, `../../lib/primitives.js`, `./<category>-kit.js`. `lib/` holds only what every category shares | test:module/S-21 | `scheme/CLAUDE.md`, the folder contract |
| S-22 | The four kits re-export the SAME list of names from `scheme-kit`, and **that list is the CARD-FACING API rather than a mirror of the library**: a name earns its place by being imported by at least one card, and a helper only `lib/` calls (`scene-spec.js`, `step-spec.js`) stays in `lib/` unexported. Taking a name off all four removes no behaviour, since the callers inside `lib/` are untouched. **The size of the list is not written down anywhere on purpose: `R-kitparity` is the source of truth.** It compares the four to each other, so a name added to one and not the rest fails immediately | test:module/S-22 | `test/unit/module.test.mjs` |
| S-23 | Adding a name to the kit surface is ONE edit across all four kits. The four lists are formatted differently enough that a single find-and-replace does not work | test:module/S-23 | `lib/scheme-kit.js`, the kit header |
| S-24 | `export * from './scheme-kit.js'` stays REJECTED. It would work and save lines, but the explicit list is what documents what a kit offers, and a card must never reach past its kit | review | `scheme/CLAUDE.md` |
| S-25 | `flashChips` is in the kit surface with zero callers, and **the decision to delete it was taken and then REVERSED**: no calls is not proof of dead code, and this export stays. It is now the ONE name on that surface no card imports, which is the exception `S-22` allows and not a second class. Do not call it, and do not drop it from one kit, because the four re-export lists only move together | test:module/S-22 | `lib/scheme-kit.js`, `flashChips` |
| S-25a | **`step.motion` is a live field with ZERO uses across all 650 steps, and it STAYS.** Same reasoning as `S-25`: no calls is not proof of dead code. It is the animated-path half of a pair, where `step.enter` is the both-paths half, and 42 steps use that one. Removing it would leave a card needing an imperative beat in motion ALONE with no door, which is how a DSL grows a verb it does not need: three categories out of four grew the DSL zero times (`S-27`). Do not delete it, and do not reach for it either: `F.run` at delay 0 is the sanctioned imperative beat inside flow order, and it covers ten of its thirteen sites | review | `lib/step-spec.js`, `spec.motion` |
| S-26 | **`defineCard` is the ONE producer of a card's `init`**: a card writes `export const init = defineCard(SCENE, STEPS_SPEC, { posterFirst: true });` and never calls `makeInit` itself. The factory was REJECTED for as long as `build()` and `STEPS` were per-card code, because it would have wrapped 99 percent unique content to share a 1 percent frame; once the scene and the steps are DATA that frame is the whole of the skeleton, which is what reversed the call | review | `scheme/CLAUDE.md` |
| S-27 | **Take S-26 further only on a COUNT, the way it was reversed.** What is left per card is the escapes, 132 hooks on 31 cards, so a new `P` or `F` verb has to name the cards that need it before it is added: three categories out of four grew the DSL zero times, and network's two additions were serialised through the coordinator. The old revisit condition (`build()` stops being per card) was met, and meeting it is what made the factory correct | review | `scheme/CLAUDE.md` |
| S-28 | **No top-level browser globals at module load**, except in `motion.js` and `app.js`. `svg.js`, `primitives.js`, `timeline.js` and `data.js` must parse cleanly in Node so the tools can read them | test:module/S-28 | `scheme/CLAUDE.md` |
| S-29 | `svg.js` exports six names nothing imports today and they STAY: it is a library surface, not accumulated code. Do not read their absence from the import graph as a finding | review | `lib/svg.js` |
| S-30 | `lib/sidebar.js` is DUPLICATED with the `cli/` copy, not symlinked. Change one, change the other | review | `scheme/CLAUDE.md` |
| S-31 | A card module must pass `node --check` the moment it is written. The hook exits 2 and hard-fails the edit | hook | `.claude/hooks/check-js.sh` |
| S-32 | Every step is walked twice by the smoke, statically and really PLAYED, with zero console or page errors | test:smoke | `test/render/smoke.test.mjs` |
| S-33 | A missing import in a card throws a `ReferenceError` that `Timeline` swallows into `console.error`, so the step plays its first packet and silently stops. **Only the browser smoke sees it. Run `render/smoke.test.mjs` after touching any card's imports** | test:smoke | `lib/timeline.js` |
| S-34 | **A comment in a card is at most TWO lines.** It says WHAT the line beside it does or where a number came from. It carries no date, no past defect, no account of an earlier version | test:files/S-34 | `scheme/CLAUDE.md`, where the record lives |
| S-35 | Anything longer than S-34 is not a comment: a rule true of one category goes to that folder's `CLAUDE.md`, a rule true of two or more goes here, a measurement or a rejected alternative goes to that card's `CARDS.md` section, and history goes to the bin | review | `scheme/CLAUDE.md` |
| S-36 | Each card carries exactly ONE pointer comment under its imports: `// Design notes for this card: ./CARDS.md#<id>` | test:files/S-36 | `test/unit/docs.test.mjs` |
| S-37 | Notes on anything that is NOT one card go to the JSDoc BESIDE THE CODE they describe: `lib/*`, the four kits, `app.js`, `data.js`, and a comment block in the CSS for a rule about a CSS rule. There is no separate design record and one is not coming back, so a note with nowhere to sit means the code it describes has no owner yet | review | `scheme/CLAUDE.md`, where the record lives |
| S-38 | **A note anchor is DATA: never reword one.** `unit/docs.test.mjs` anchors each note to a line of code with ``### before `<line>` ``. **124 anchors today**, all four `CARDS.md` (cluster 15, workloads 24, network 41, storage 44). The 169 this row used to claim matched nothing. **61 more anchors lived in a record that was deleted, and the old walk skipped a file it could not open SILENTLY at exit 0** (`if (!existsSync(md)) continue;`), so the count fell 185 to 124 with no finding and no error. It fails on a record it cannot read instead of running shorter. **An anchor is unique only WITHIN its `## <card id>` section, never across a record**: the resolver looks the line up in that card alone, so duplicates are legal where they sit and 13 anchor texts are duplicated today (network 5, storage 8), worst ``const CX = 600;`` in 12 sections catalog-wide and ``const LEFT_X = 400;`` in 7. MOVING a note to another card therefore needs a NEW anchor taken off the destination card, because the old text will resolve there against the wrong code or vanish with no finding | test:docs/A2 | `test/unit/docs.test.mjs`, counted 2026-08-07 |
| S-39 | When a card is renamed, rename its `CARDS.md` heading too | test:docs/A4 | `test/unit/docs.test.mjs` |
| S-40 | A test file under `scheme/test/` keeps its knowledge in its OWN HEADER rather than moving it to a record: what it asserts, and what it is BLIND to, is how you learn to read its output, and that header is the only copy. The two-line cap on a card comment does not apply there | review | `scheme/test/`, and every test file header |
| S-41 | **Internal markdown never ships.** Three filenames (`CLAUDE.md`, `CARDS.md`, `CANON.md`) plus `scheme/test/`, excluded BY NAME in three places that must agree: `deploy.yml`, `release.yml`, `.dockerignore`. All three also still exclude the two deleted paths, the old harness directory and the old record, and those entries STAY: an exclusion whose target is gone costs nothing and covers anyone who recreates the path | test:files/S-41 | root `CLAUDE.md` |
| S-42 | Do not unify what VARIES between cards: the kit, block size, geometry, step count, connector style. **The `role` passed to primitives and the Pod tint are the one exception, and only when the binding is made IN THE CATEGORY KIT.** The failure `P-08` records was CROSS-category (one shared helper defaulted every caller to `cluster` and put 82 workloads chips on the cluster palette), and a binding a category kit makes cannot reach another category, so that path does not exist. The permission is void without all four conditions: a `node()` part takes no role at all, Pod parts take a SEPARATE `podRole`, any part may override the bound role explicitly at its own call, and `render/palette.test.mjs` stays the guard on the result | test:spec-scene/S-42 | `scheme/CLAUDE.md`, and C-02 / P-08 for the cost of the cross-category default |

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

Structural rules for a record file, all of them enforced by `unit/docs.test.mjs`, group A for the
first four and group E for the last:

| ID | Rule | Check | Source |
|---|---|---|---|
| S-43 | Every `## ` heading in a `CARDS.md` is a CARD ID and nothing else. A second-level heading anywhere else is reported as an orphan, which is why the preamble headings are bold text rather than `##` | test:docs/A4 | `test/unit/docs.test.mjs` |
| S-44 | A card's section must be in ITS OWN category's file. A section filed in the wrong one is named as `MISFILED`, not as a missing file | test:docs/A5 | `test/unit/docs.test.mjs` |
| S-45 | Every card has a section. A card with no design record is how a measurement gets lost | test:docs/A3 | `test/unit/docs.test.mjs` |
| S-46 | **A record the walk cannot OPEN is a failure, never a shorter run.** The rule this id used to carry was the second leg of the anchor walk, over a design record that no longer exists, and the way it ended is the rule that replaced it: the walker skipped the missing file with `if (!existsSync(md)) continue;` and stopped checking 61 anchors at exit 0. Nothing may be read with a `continue` on absence | test:docs | `test/unit/docs.test.mjs`, `readDoc` |
| S-47 | **This file has to tell the truth about itself.** A row claiming `test:<file>/<name>` names a file `npm test` really runs and a name that file really prints, no id is used twice, no id block skips a number, and every test file is cited by at least one rule. The same holds for the `Source` column: every repo path it cites has to resolve, or the rulebook points at a file that no longer exists. Otherwise the rulebook drifts from the harness the way one number once drifted across six files | test:docs/E1, test:docs/C4, test:docs/C5 | `test/unit/docs.test.mjs`, groups C and E |

---

## Category-scoped rules

Category rules do NOT live here. The folder is the unit of context and splitting it would break that.
They keep the same id shape with a category prefix, and this is their index.

**The test for where a rule belongs: anything that would be a DEFECT if it differed between two
categories is catalog-wide and belongs above. A pointer is not duplication, a paragraph is.**

**A row below carries NO rule text, and that is the point.** The text lives in that folder's
`CLAUDE.md` and nowhere else. Two copies is what this index used to be, and by 2026-08-07 they had
drifted apart: six ids named DIFFERENT rules in the two files (`CLU.S-01`, `WL.L-03`, `WL.L-04`,
`WL.L-05`, `STO.S-02`, `STO.S-03`), five more disagreed on how much the rule said, six ids the index
carried did not exist in the folder at all, and three the folder carried were missing here. **The
folder won every one of those**, because the folder is what a card author has open. Where the two
meanings could not both keep the id, the version that was here took a NEW id in the folder
(`CLU.S-02`, `STO.S-04`) and no id was reused. The second column below is a subject label for
finding the row, never a statement of the rule: if you are about to read a number or a `DO NOT` out
of it, you are in the wrong file.

### `CLU.*` cluster, `js/schemes/cluster/CLAUDE.md`

| ID | Subject |
|---|---|
| `CLU.C-01` | the tint against the chrome colour |
| `CLU.S-01` | what a cluster card's own record states |
| `CLU.S-02` | the exemplar card |
| `CLU.L-01` | the Node frame family geometry |
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

## What the declarative refactor changed in this rulebook

This section used to be a to-do list. Taken from the 2026-08-07 inventory of all 235 rows, it named
the nineteen rules whose SUBJECT the refactor was going to destroy, under a banner saying every one
of them was still true until then and must not be retired ahead of the work. That work has landed:
all 108 cards are `SCENE` plus `STEPS_SPEC`, the script harness is `scheme/test/`, and the deleted
design record stayed deleted. The list is spent, so what is left here is the record of it, which no
other file holds.

**No row was retired, and none may be.** Each of the nineteen was read for what it PROTECTED and
rewritten onto whatever still holds that job: a scene's one construction path, the generated
prologue and its fixed order, the single camera, the closed writer vocabulary, the chip whose value
something has to be able to read. Five needed no edit at all, because they had already been written
onto their live subject (`T-15`, `T-17`, `T-17a`, `T-34` and `S-12`). A rule retired before its
subject is gone leaves a live defect unwritten, and this is the file that has to tell the truth
about itself (`S-47`).

**The method came from four rows that were done first**, on 2026-08-07. `D-10`, `S-37`, `S-40` and
`S-46` each named a deleted file rather than a superseded idea, so each was rewritten onto its live
subject and none was retired: the subcategory order beside the list it orders, a note beside the
code it describes, a test header, and a walk that may not skip what it cannot open. That is the
pattern the nineteen followed, and it generalises: **a rule that stays true while NAMING a thing
that disappeared needs rewording, not retirement.**

**Three rules were expected on the list and did NOT belong.** `S-13` and `S-14` stay TRUE: the
static-first split survives, it only moves from a line of source into the generated `enter`. `S-25`
stays true because the decision to delete `flashChips` was taken and then reversed, which is what
`S-25` itself asks for.

## Known deliberate exceptions

Not defects. Each is a rule broken on purpose, with the reason and the number that made the call.

| What | Why it stands |
|---|---|
| `FALLBACK_POSTER` breaks R-08 and R-09 | R-11 |
| `dim` losing to `role` on an arrow | A-18. Implemented and reverted the same day: 94 of 103 cards changed and the networking exemplar's fan went grey |
| `flashChips` exported with zero callers | S-25 |
| `step.motion` a live field with zero uses on 650 steps | S-25a |
| Six `svg.js` exports with no importer | S-29 |
| No module constant declares a number nothing reads. **Zero, catalog-wide** | 47 were removed on 2026-08-06. The last five were named by a neighbouring comment or by their card's record, so each deletion also reworded the referent: an axis is stated as the literal 600, a pitch as a two-line comment on the block it spaces. A dangling name is worse than a dead line, so the two always move together |
| Header chrome duplicated three ways (`cli/js/app.js`, `scheme/js/app.js`, inline in the root `index.html`): `renderHeaderActions` at 86 lines, plus `fallbackCopy`, `closeAllDropdowns` and the icons, about 240 lines | Deliberate. Each path prefix stays self-contained, which is the reason the duplication exists |
| `cli/css/styles.css` (227 rules) and `scheme/css/styles.css` (217 rules) share 63 selectors with a byte-identical body | 22 more share a SELECTOR with a DIFFERENT body (`html`, `body`, `.card`, `.footer`, `.cat-btn`, `.logo`, `.section-header` and others), so cascade order decides. Merging is a real visual risk. Measured 2026-08-06 |
| 18 `OPEN` findings across the four records, against 8 findings in the soft geometry report | L-16, and the two counts are not one count. Each `OPEN` entry carries its own measurement and the reason the rule can only be satisfied by making the picture worse |
| 11 ambiguous label pairs | T-14 |
| ~~8 unresolvable chip writes, at a ceiling of 8, on 6 cards~~ RETIRED | T-17, T-17a. The exception existed because a regex over the source could not read those writes. Reading the canvas reads all eight, so there is nothing left to except |
