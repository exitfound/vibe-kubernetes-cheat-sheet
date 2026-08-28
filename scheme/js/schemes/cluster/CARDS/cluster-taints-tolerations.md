## cluster-taints-tolerations

### layout

```
WHAT     The gate and the eviction in one frame: a taint on Node-1, the toleration on one of the
         three Pods it holds, the Scheduler first refusing and then merely scoring down a Pod that
         tolerates nothing, and the taint-eviction-controller deleting the two Pods that carry no
         matching toleration once the taint turns NoExecute.
LAYOUT   Layout C with NO ladder. The right column that `LAYOUT.C` reserves is spent on a single
         mid-band block instead, on the LEFT of the spine at 304..536 by 252..332, and the six chips
         take a three-across strip under the frame. Top row is the API centred on the frame at
         484..716 and the Scheduler right-aligned to the content edge at 908..1140, so the row ends
         on the same vertical as the chip strip and the Node frame. Frame family is `CLU.L-01` read
         off `CLU.NODE`: NODE_H 152, POD_H 106, POD_Y = NODE_Y + 34, three 300-wide Pods on
         84 / 450 / 816.
PANEL    MEASURED over the standard viewport set, right edge then bottom range across the 7 steps:
         1600x1000 290.77 / 142.56..160.00, 1280x860 377.76 / 171.42..192.67, 1100x800 396.55 /
         204.97..229.82. Frame top 372, so the worst case clears it by 142.18. Nothing on the card
         starts left of 420 ABOVE 229.82 (`L-03`), and what holds that line is the EVICT_REQ riser
         at 420, 23.45 clear of the deepest right edge. Everything left of 420 is below the line
         instead: the mid-band block, whose top face at 252 is 22.18 under the deepest panel bottom,
         and then the frame, the taint header and the Pods.
BUDGET   The header pins 309 characters, which is the longest narration on the card (`seconds`) and
         not a geometric limit. MEASURED: at 309 the panel bottom is 229.82 at 1100x800 and the
         first thing under it is the taint header glyph box at 381.8, so there are 151.98 units of
         headroom, about eight wrapped lines at the 17.44 line height. The cap stands as the
         measured maximum rather than as a wall.
         `Any Pod that sets none of its own` in `seconds` IS NOT SPENDABLE (`T-20`). Cutting it
         leaves `a Pod is given 300 for the built-in taints`, which is false for every Pod that
         writes its own tolerationSeconds for those two keys, and the sentence would still measure
         inside every band. The other qualifier that has to stay is `for the built-in not-ready and
         unreachable taints`: without it the 300 reads as a default on any NoExecute taint.
SIZES    Chips 350.67 wide, three across, which is `LAYOUT.C.strip.three` reached through
         `strip()` rather than typed. Two rows at CHIPS_Y 540, the second ending on 616, 24 under
         the frame bottom at 524. MEASURED after document.fonts.ready, tightest pair on the card:
         `effect in force` against `PreferNoSchedule · scores` with 51 units of clear space, and
         `Node-1 taints` against `PreferNoSchedule, NoExecute` with the same 51. Every value on
         those two chips is a shortened form for that reason: the effect chip reports the effect
         and a three-word verdict, never the whole taint, and the whole taint is the frame header
         instead.
LANES    THREE. NODE_LANE carries a ball on three steps, the top lane on two, EVICT_REQ on one.
         ONE top lane on the box centre line y=80, Scheduler left face 908 to API right face 716,
         dim and dashed. There is no return half: every step sends the Scheduler to the API and no
         step names an answer coming back, so a second lane would carry nothing on any step
         (`A-03` read the other way).
         EVICT_REQ is ONE right angle: evictor top face midpoint 420 up to the box centre line
         `TOP_CY` 80, then right into the API LEFT face at 484. Both legs sit on a vertical the card
         already owns, the riser on the block spine and the leg on the line the top lane rides, so
         the two lanes meet the top row on ONE midline, one on each face. 236 units long, and at
         x=420 the riser stands 64 left of the API and 180 left of the drop.
         NODE_LANE is a straight vertical drop, API bottom face 600 to the Node frame top face 372.
         It is addressed to the FRAME and not to a Pod inside it, on purpose: the three steps that
         ride it are about the Node itself, about web-2, and about web-1 and web-2 together, so no
         single Pod endpoint is right for all three, and which Pod a step is about comes from the
         pulse. The frame it lands on is drawn on every step, so the lane never points at something
         that goes away under it (`A-14`). Same array feeds the wire and the ball (`A-02`).
         The API bottom face carries ONE endpoint, so it takes the spine and both ends of the drop
         are midpoints by construction: 600 is the API bottom midpoint because the box is centred on
         the frame, and the frame top midpoint because the frame runs 60..1140. There is no `L-12`
         pair on this card any more, because the eviction request arrives on the LEFT face.
MOTION   `taint` and `noschedule` self-initiate and wait `BEAT.lead` 800 before the ball leaves,
         then one hop each: span 2060 of 2600. `prefer` is `M-16` down-arrow, top hop 700 plus
         `BEAT.afterHop` 100 plus the 700 drop, and Pod web-2 materialises and pulses on the same
         arrival: span 2400 of 2800. `noexecute` is the same chain over EVICT_REQ, and both dying
         Pods pulse and fade from ONE delay so neither pulse sits behind its own fade (`M-08`):
         span 2400 of 2800. Both routes are under the `routeDur` floor (NODE_LANE 252 units,
         EVICT_REQ 236) so both run at the 700 clamp and their lengths buy no time (`M-13`).
         `match` and `seconds` are packet-less and Pod-less and carry their beat with `.highlight`
         alone (`M-27`).
WIRE LABELS
         FOUR registers, one per lane plus the frame header, because no lane may carry a caption
         for traffic it does not take (`T-22`). MEASURED in content coordinates after
         document.fonts.ready, widest string first, at 1600x1000 then 1100x800.
         `req` is centred on the 192 unit gap at 812 and sits at y=26, ABOVE the row: the drop owns
         everything below it. Widest is the FailedScheduling string, 622.5..1001.5 (379.0 wide) and
         643.3..980.7 (337.4), box y 14.8..29.4, so 10.6 clear of the top row at 40. It overhangs
         both boxes horizontally and neither vertically.
         `evict` takes the DEFAULT middle anchor on the block spine at 420, so it is centred under
         the block it captions rather than beside the riser: widest 285.6..554.4 (268.7) and
         300.4..539.6 (239.3), box y 344.8..359.4. 12.8 under the evictor bottom at 332 and 12.6
         over the frame top at 372, 45.6 clear of the drop at 600 at the worst viewport, and it
         overhangs its own block by 18.4 a side at 1600x1000 and 3.6 at 1100x800.
         `drop` is anchored START at 614, 14 right of the lane at 600, widest 614..862.1 (248.1)
         and 614..767.4 (153.4). Its glyph box is CENTRED on the band the lane crosses: y
         238.8..253.4, centre 246.1 against the 246 midpoint of API bottom 120 to frame top 372, so
         118.8 above and 118.6 below. It runs beside the evictor, 78 clear of that block's right
         edge at 536.
         `taint` is anchored START at 140 and reads as the frame HEADER rather than as a caption on
         anything: it is state, not traffic. Box y 381.8..396.4 against the `Node-1` frame label at
         378.8..393.4, so the two sit on ONE row, 9.8 under the frame top and 9.6 over the Pod row
         at 406. Widest 140..436.3 (296.3) and 140..403.8 (263.8), which leaves 123.7 clear of the
         drop at 560 at the worst viewport. Nothing in the suite measures a wire label (`L-19`), so
         re-measure after any edit to one.
CONTENT  The matching rule is the doc's own, in the doc's own order: a toleration matches when the
         keys are the same and the effects are the same, and then the operator decides the value,
         Equal comparing it and Exists ignoring it, with Equal as the default
         (taint-and-toleration, the paragraph under the two operator examples). `db-1` leaves the
         effect EMPTY, which that same paragraph says matches all effects on that key, and that is
         why its chip reads `dedicated · any effect` rather than naming one.
         The three effects are drawn as two kinds and not three: NoSchedule and PreferNoSchedule
         are both gates on the way in and neither touches a bound Pod, NoExecute is the only one
         that reaches inside. That is the card, and the desc says it in the same two halves.
         `TaintToleration filter + score` on the Scheduler is the plugin's real extension points:
         the scheduler configuration reference lists filter, preScore and score for it. preScore is
         not drawn, because nothing on the card distinguishes it from score.
         The 300 seconds is the default toleration the admission controller adds for
         `node.kubernetes.io/not-ready` and `node.kubernetes.io/unreachable`, and only to a Pod that
         sets none of its own. Both halves are in the narration and neither may be dropped.
         The Gt and Lt operators are alpha behind `TaintTolerationComparisonOperators` and disabled
         by default at the release `k8sVersion` names, so `operator` reports `defaults to Equal, or
         Exists` and the card draws neither. A card drawing an alpha operator behind a feature gate
         would teach a comparison most clusters reject.
CONTENT  `prefer` says the plugin marks Node-1 DOWN and that the control plane tries to avoid the
         Node without guaranteeing it. `ranks Node-1 last among the Nodes that fit ... binds here
         once nothing better is free` IS REJECTED: taint-and-toleration says of PreferNoSchedule
         `The control plane will try to avoid placing a Pod that does not tolerate the taint on the
         node, but it is not guaranteed`, and the TaintToleration score is one weighted signal among
         the enabled score plugins rather than a final ordering, so a Pod can land on the tainted
         Node while a better one is free. The rejected wording also contradicted this card's own
         aria-label, which reads `merely scoring it down under PreferNoSchedule`. The wire label
         moved with it, `bound · Node-1 scored down` rather than `scored last`.
CONTENT  `noexecute` says the taint never evicts Pod db-1. `it stays bound for as long as the taint
         lasts` IS REJECTED: the reference reads `Pods that tolerate the taint without specifying
         tolerationSeconds in their toleration specification remain bound forever`, and the rejected
         wording ties the binding to the taint's lifetime, which no source does. Removing the taint
         does not unbind the Pod either.
CONTENT  The `desc` says what a taint does to a Pod carrying no matching toleration is decided by
         the EFFECT. `a Pod lands there only if it carries a toleration matching that key and that
         effect` IS REJECTED as a false absolute (`T-19`) that the same `desc` then contradicts two
         clauses later by calling PreferNoSchedule a score penalty. Only NoSchedule makes the
         toleration a condition of landing: PreferNoSchedule is `not guaranteed` to keep an
         untolerating Pod off, and a Pod with `.spec.nodeName` set bypasses the scheduler entirely,
         which the same page states.
CONTENT  AN API PATH CARRIES THE OBJECT NAME, SO IT IS LOWERCASE. The `drop` caption reads
         `PATCH .../nodes/node-1 · spec.taints`: RFC 1123 allows lowercase alphanumerics and dashes
         only, so a path with a capital in it states a name the API would reject. The frame LABEL
         stays `Node-1`, which `T-12` renders uppercase anyway, and so does every prose mention.
         `cluster-node-failure` draws the same call and carries the same spelling.
         Read against the release `k8sVersion` names and found TRUE with no edit: the three taint
         fields and the three effects, NoSchedule and PreferNoSchedule leaving a bound Pod alone,
         NoExecute being the only effect that reaches one, the match rule and the Equal default, the
         empty effect matching every effect on the key, `TaintToleration` implementing filter,
         preScore and score, filter running before score, the 300 second toleration added for
         not-ready and unreachable only to a Pod that sets none of its own, `taint-eviction-controller`
         being the component since 1.29, and the binding subresource `POST .../pods/web-2/binding`.
NAMING   Titled `Taints and Tolerations`, the upstream page title, because the card is about the
         PAIR and neither half is a subject on its own.
         The mid-band block is `Taint-eviction controller`, its own component since 1.29, with the
         sublabel `deletes Pods on NoExecute` so the block says what it does rather than only what
         it is. cluster-node-failure draws the same component inside a box labelled
         `node-lifecycle + taint-eviction`, which is that card's pairing and not a second name for
         this one.
         The chips name the object they hold and nothing else (`P-02`): `Node-1 taints` is what the
         Node carries, `db-1 tolerates` is what the one tolerating Pod carries, `effect in force`
         is the effect the current step turns on, and `Pod web-2` is the phase of the Pod the card
         moves. The frame header carries the WHOLE taint and the chip above carries only the part
         that changes, so the two are not two spellings of one value.
         A URL spells the object NAME alone: the binding goes to `.../pods/web-2/binding`, because
         `Pod` in the block label `Pod web-2` is the type and not part of the name (`T-11a`). The
         drop caption on the next step names the same two Pods the same way, `web-1 and web-2`.
SCOPE    The Scheduler's own cycle, queue to filter to score to bind, is
         cluster-scheduler-decision's. Here it is one hop and one wire label, and the filter and
         score verdicts are chips rather than a plugin ladder.
         Preemption is cluster-pod-priority-preemption's: this card never says a Pod is removed to
         make room, only that it is refused entry or evicted by an effect.
         `node.kubernetes.io/unreachable`, the not-ready taint and the 300 second default belong to
         cluster-node-failure as ITS case. This card owns the general mechanism, states the 300
         once in `seconds`, and points at that card by title rather than drawing either built-in
         taint.
         The Eviction API and PodDisruptionBudget are neither drawn nor named: a NoExecute eviction
         is a DELETE by a controller and never passes the eviction subresource, which is the
         reason no 429 can appear here.
NOTE     Pod web-2 is drawn from the first step at opacity 0 and materialises on `prefer`. It is
         not cut out and re-added: the slot is held so the frame does not reflow, and `STANDING`
         states all three Pod shades on every step so a cancel between steps lands on the right
         one.
NOTE     Pod db-1 takes NEITHER a pulse nor a fade on `noexecute`, and that absence is the whole
         sentence of the step. `M-08` orders a pulse before a fade and never requires one, and a
         Pod that is not being evicted has no beat to carry.
NOTE     `taint` pulses nothing at all, for the same reason: NoSchedule reaching a bound Pod is
         exactly what the step denies. The ball lands on the frame, the frame lights, and no Pod
         moves.
NOTE     The chip and the frame header spell the taint set two ways, and the two mean different
         things. `Node-1 taints` reads `PreferNoSchedule, NoExecute`, a LIST of the entries in
         spec.taints, and the header reads `dedicated=db · PreferNoSchedule + NoExecute`, ONE key
         carrying two effects. The comma separates entries and the plus is what those entries
         share, so collapsing both onto one mark would lose the difference.
NOTE     `taintsChip` and `effectChip` light at ENTRY on `prefer` and on `noexecute`. The rewrite and
         the second taint are the PREMISE of those two steps, each of them the opening sentence of
         its own narration, and a chip cue belongs at entry where no arrival produces the value
         (`P-06`). The four FORM-E records that creates are carried with their reason in `E_CARRIED`
         (`test/fixtures/chip-beat.mjs`), which is where a value no arrival can earn is filed.
NOTE     The `evict` anchor is about the DROP and not about the riser. The riser band, x=420 by
         y 80..252, has no room for a caption: MEASURED at 1600x1000 the DELETE string is 268.7
         wide, so anchored START 14 right of the riser it would run 434..702.7 and be crossed by
         the drop at 600, and anchored END 14 left of it, 137.3..406, it would sit inside the panel
         column, which reaches 396.55 at 1100x800. What is left is the 40 unit band between the
         evictor bottom and the frame top, which is where the label went, and there it is under the
         component doing the work rather than beside the lane carrying it. It sits on the block
         SPINE 420 on the default middle anchor: the string is wider than its own block on the wide
         viewport, so a flush left edge read as a caption sliding out from under the block.
NOTE     The evictor sits LEFT of the API and the drop is on the spine, and the two are one change.
         DO NOT put it at 660..892 by 190..270, right of the spine, with the drop at 560 and the
         eviction request at 640: that is a mirrored `L-12` pair on the API bottom face, and an
         elbow with a jog at y=152 to reach the second endpoint. The request on the API LEFT face
         empties the bottom face, and a face with one endpoint on it takes its midpoint, so the drop
         is 600 at both ends and the elbow has no jog. MEASURED: the block's own left half at 304 is
         legal only because its top face at 252 is 22.18 below the deepest panel bottom (229.82 at
         1100x800), and the riser is at 420, which is the L-03 floor and 23.45 clear of the deepest
         panel right edge. EVICT_REQ measures 236 units against the 206 of that alternative and buys no time either way, both
         being under the `routeDur` 700 floor (`M-13`).
WHY NOT  Leaving those two chips dark and letting the frame header carry the change alone. It costs
         four findings in `report/arrival.test.mjs` R2-STEP, and they would be the only entries left
         in that queue catalogue-wide, against one lit chip beside them still reading the previous
         step's value (`P-04`). Step 1 lights the same two chips for the same class of event.
WHY NOT  Running the drop vertically THROUGH the evictor block. The first layout put the evictor on
         the spine at 484..716 and let NODE_LANE fall from the API through it to the frame, which
         is an `L-10` THROUGH violation and a GATE rule rather than a report finding. Arithmetic
         does not see it: a vertical segment has zero width, so a crossing test written on
         rectangles overlapping the segment's bounding box reports nothing. Only an axis-aware
         probe, one that treats a zero-width span as a span, names it. The evictor sits off the
         spine and the drop is straight, 64 clear of the block's right edge.
WHY NOT  The block in the band 190..270, moved left only. At
         232 wide a block whose right edge clears the API at 484 has to start at 252, and 252 by 190
         is inside the panel column: 396.55 by 229.82 at 1100x800. Anything left of the API ABOVE
         the panel bottom is unreachable on this frame, which is why the block went down as well as
         across, and why 252 is a floor rather than a taste.
WHY NOT  Leaving the block centred where its right edge would clear the API. Centred on 420 it runs
         304..536, so 52 units of it stand under the API column. The alternative is to hold the
         right edge at 484 and move the riser off the spine to 420, 32 from the block's own right
         corner, which trades a clean overlap-free silhouette for a lane leaving a face near its
         corner. The riser has no freedom, since 420 is the panel floor, so the choice is only where
         the block sits under it, and the midpoint exit was worth 52 units of overlap.
WHY NOT  A second Node, so the refused Pod visibly lands somewhere else. Two 520-wide frames put
         their top face midpoints at 320 and 880, neither under the API, so the binding drop would
         need a jog through the panel or through the chip strip. What the card does instead is bind
         web-2 to Node-1 under PreferNoSchedule, which is the more useful half of the same fact.
OPEN     THE CARD IS A VARIATION ON ITS OWN NEIGHBOURS, AND TWO AND A HALF OF ITS THREE CLAIMED
         DISTINCTIONS SURVIVE. Opened next to cluster-scheduler-decision and
         cluster-pod-priority-preemption, the top row reads as a REPEAT rather than as a variation:
         all three carry a control-plane pair on the y=80 centre line with the Node frame below,
         and two of the three put the Scheduler on the right. A mid-band block between the row and
         the frame is a device both siblings already use. What is genuinely this card's own is the
         frame HEADER carrying state on the Node label row, the six-chip three-across strip where
         both siblings run a ladder, and the eviction lane arriving on the API's LEFT face, so the
         top row is fed from both sides on one midline where a sibling feeds it from one.
         It stays as drawn because every alternative measured worse. Moving the top row off the
         centre line breaks the one grammar the category has. Putting the evictor under the panel
         loses it, and putting it left of the spine ABOVE the panel bottom is not a placement the
         frame has. Dropping the top row entirely
         leaves the filter and the binding with no actor, which `T-21` forbids while the narration
         names the plugin on two steps. The repetition is the cost of the category grammar
         being worth having, and it is written down here rather than sold as novelty.
NOT A DEFECT
         Pod web-2's slot is EMPTY on the poster and on steps 1 to 3 rather than drawn dim. `C-14`
         asks for a dim block instead of a hole, and the remedy is refused here for a reason the
         rule cannot see: the block would sit INSIDE the Node-1 frame, and `noschedule` says
         nothing reaches that Node. A dim Pod web-2 in that slot draws the Pod on the Node the
         sentence has just refused it. What carries the absence instead is the `Pod web-2` chip,
         `unscheduled` from `match` and `Pending · FailedScheduling` on `noschedule`, so the reader
         is told where the Pod is without being shown it in the wrong place. MEASURED on the
         rendered frames at all three viewports: the gap is the right third of a 1080 wide frame
         and reads as room on the Node, which is what the next step then uses.
NOT A DEFECT
         `report/geometry-soft.test.mjs` sees a content bbox and a chip strip both centred on 600
         to the unit, because the frame and the strip both run 60..1140. Nothing is open on
         `CENTRE` or `CENTRE-LOW` here.
NOT A DEFECT
         `seconds` lights `api` and `evictor` while naming neither block label. Each is anchored in
         that sentence by a string of its own that the block draws: `tolerationSeconds` and `A
         NoExecute toleration` are the `spec.taints + spec.tolerations` on the API sublabel, and
         `lets the eviction through` is what `Taint-eviction controller` and `deletes Pods on
         NoExecute` say between them. That is the test `match` fails, where no word of the sentence
         reaches `Scheduler` or `TaintToleration filter + score`. The two steps are therefore not
         one case, and lighting or darkening a block on the strength of the OTHER one is `P-04` read
         the wrong way round.
DO NOT   Trim a narration to a character band. See BUDGET: the two qualifiers in `seconds` are what
         make the sentence true, and the panel has 151.98 units of headroom at the worst viewport.
DO NOT   Light `sched` on `match`. The step lights four chips and no block, which is the whole of
         its beat (`M-27`): nothing in that sentence reaches either drawn Scheduler string, so the
         highlight would credit an actor the step does not mention and spend a step early the cue
         that `noschedule` earns with `the TaintToleration filter plugin`. The matching rule the
         step states is not the Scheduler's alone either, and the card says so three steps on, where
         `noexecute` applies the same rule through the taint-eviction-controller with no Scheduler
         in it. MEASURED on the rendered frames: `match` differs by 0 pixels between its resting
         frame and half span at all three viewports, so the four chips are what a reader has, and
         they are enough.
DO NOT   Light `nodeEl` expecting a frame highlight to show. There is no `.scheme-node.highlight`
         rule in `css/diagrams.css`. `taint` lists it in `lights:` so the ARRIVAL has a receiver
         and the reduced path derives the same set, and the visible cue on that step is the frame
         header turning over and the two chips lighting, not the frame itself.
```

### before `const EV_CX = 420;`

420 is a MEASURED floor, not a round number. The panel reaches 396.55 at 1100x800 and `L-03` puts
everything above the panel bottom right of 420, so 420 is the leftmost x a riser out of the mid
band may take. The block is CENTRED on it rather than placed beside it, so the riser leaves the top
face midpoint: a 232 wide box centred on 420 runs 304..536, whose own left half sits under the
panel column and is legal there only because `EV_Y` 252 is 22.18 below the deepest panel bottom.

### before `const EVICT_REQ = [[EV_CX, EV_Y], [EV_CX, TOP_CY], [API_X, TOP_CY]];`

ONE right angle, and the two legs are what put it there. The riser is on the block spine at 420,
the only x that clears the panel, and the leg is on `TOP_CY` 80, the box centre line the top lane
already rides, so the lane meets the API left face at 484 on the same midline the Scheduler meets
its right face at 716. The lane crosses nothing: at x=420 it is 64 left of the API and 180 left of
the drop, and at y=80 it stands 172 above the evictor.

### poster

```
Sentence: one taint, and three different answers to it.

Branch. One taint block on the left carrying three dim rows (a key, a shorter one for the optional
value, an effect), a dashed bus out of its right face, and three outcome cells on the right. Each
cell is the SAME skeleton, one short vertical Node boundary and one block, and the only thing that
moves is where the block sits: left of the boundary and dashed on the top row, right of it and
dashed on the middle row, straddling it solid at 0.10 with stroke 2 and the one 0.9 accent on the
bottom row. Sentence: one taint, three effects, and only the third reaches a Pod already running.

Branch is the family because the corrected sentence is one input with alternative outcomes, and it
is the one shape that cannot restate a pass-or-fail gate. Neither neighbour uses it:
cluster-scheduler-decision is hub and spokes, cluster-pod-priority-preemption is a rank ladder.
The middle row's leg is the only one that CROSSES a boundary mark, which is how PreferNoSchedule
letting an untolerating Pod in is said without an arrowhead (`R-08`).

The gaps are asymmetric on purpose. The refused block stands 18 off its boundary and the admitted
one 10 inside it: a wider gap is what says stopped short, where an equal pair would read as two
positions of one thing rather than two different outcomes.

DELIBERATE DEVIATION: the outcome blocks are 64 by 34, under the 76 to 80 house long side. Three
cells that each need an outside position, a boundary and an inside position do not fit at 76 across
320 units. MEASURED: the union box is x 20..308 by y 22..166, 72% of the canvas against the catalog
median of 51%, and the smallest drawn element is a 36 by 6 bar, well over the 20 unit floor where a
mark disappears at 200px.

WHY NOT the key and slot it replaces: a tall Node whose left face carried a rectangular socket, one
plain block stopped in front of it and one keyed block sitting in the socket. Its stated sentence
was `a Pod gets in only if it carries the matching toleration`, which is the false absolute the
`CONTENT` block records being cut from the `desc`: only NoSchedule makes the toleration a condition
of landing. A key that fits or does not fit can say nothing about PreferNoSchedule letting the Pod
in anyway, and nothing at all about a Pod already running. Its composition failed separately, and
both failures were read off the actual-size montage rather than the source: the Node interior was a
hollow rounded box over about 40% of the canvas, and at 200px the tab and the notch fused into one
silhouette, so the socket that carried the whole idea was the part that did not survive the size.
```
