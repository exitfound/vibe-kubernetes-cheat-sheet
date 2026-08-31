## workloads-effective-pod-requests

### layout

```
WHAT     Init containers run one after another and the app and sidecar run together, so the cpu a
         Pod is charged is the tallest single instant of its life plus its overhead, and never the
         four requests added up.
LAYOUT   An INSTRUMENT: cpu up the page against ONE Pod life across it, so max and sum stop being
         two rules to remember and become one operation read over two differently shaped windows.
         The section default is a chip column beside a five row ladder over a Node floor, and three
         cards in this subcategory share that composition. This one takes none of it: no ladder, no
         chip, no Node frame and no Pod, because the subject is a number computed from a spec and
         the Pod is read rather than heard from.
         It takes no LAYOUT preset either. A / B / C choose which column holds the ladder and which
         the chips, and with neither on the canvas there is nothing for them to choose, so the card
         states its own geometry and WL.L-06 does not apply to it.
         The chart is a MOSAIC of solid tiles, and what carries cpu is the ROW, not every tile in
         it. The init row is 208 units tall, which is 800m, and it is divided by TIME into two
         full-height tiles standing side by side: init-a and init-b each hold the phase for their
         own slice, and the phase reserves 800m throughout whichever one is holding it. The run row
         is 169 units, which is 650m, and it is divided by CPU into two tiles stacked on each other,
         117 for the app on 52 for the sidecar. Sequential against concurrent is therefore drawn by
         the DIVISION rather than only narrated: that is the whole argument of the card in the
         geometry.
         The one number the division cannot show is init-b's own 300m, and it is carried by the
         tile's own sublabel. A graduation was drawn inside the tile at y=436 to mark that level and
         REJECTED by the author: at 3.5 units across a 120 wide tile it does not read as a level, it
         reads as a rule cutting the tile in two, which is an artefact in a mosaic.
         An earlier version drew init-b at its own 78 units with a dashed idle cell filling the room
         above it. Also REJECTED: it reads as an unfinished corner patched over, and a mosaic wants
         a tile there, not a hole with a lid.
           readers  EQUAL and mirrored across WL.CX, 170 wide each with a 60 gap: Scheduler
                    400..570, Kubelet 630..800, both on WL.TOP_Y, tied by a relation on y=80
           chart    x 150..1050 (CH_L / CH_R), 900 wide and centred on WL.CX, SCALE 0.26
           windows  init-a 150..330, init-b 330..450, the run window 450..1050
           rows     init row 306..514 (800m), run row 345..514 (650m), overhead floor 514..579
           levels   reserve line and init maximum 306, run envelope 345, sidecar top 462,
                    cpu zero and the time axis on BASE_Y 579
           idle     one band only, the run cell 450..1050 x 306..345, which is the 150m held. It is
                    a TILE like the others, not a ghost: same fill, stroke, width and radius,
                    verified by reading both computed styles and finding them identical
PANEL    Worst 396.55 wide and 229.82 deep, at 1100x800 step 0. Re-measured on this card's own
         prose: the 254.66 the previous composition recorded belongs to prose that no longer
         exists, and L-08 makes the bottom a function of the narration.
         The topmost ink left of x=420 is the init graduation, whose rect starts at y=304.25, so the
         deepest panel stands 74.43 units clear. At the two wider viewports the bottom is 192.67 and
         160.00, so the clearance never falls below that.
         The one per-step readout sits at x=600 on y=28, above the actor row and above anything the
         panel reaches on any viewport.
         `OVERLAY_IDS=workloads-effective-pod-requests node --test report/overlay.test.mjs` reprints it.
BASELINE The reader relation is the one painted element this card added to the catalog, so
         `EXPECTED_PAINTED` in `render/palette.test.mjs` moved by exactly one and the reason is
         written beside it there. SPREAD stayed clean: the relation resolves to the cluster violet
         every other control-plane relation in this category resolves to.
SIZES    Every height is DERIVED from REQ through CPU(), so the drawing and the arithmetic cannot
         disagree: 800m is 208 units, 300m is 78, 200m is 52, 450m is 117, 250m is 65, and the
         reservation at 1050m is 273.
         RESERVE_Y is the anchor and BASE_Y hangs off it, not the other way round. 306 is the
         measured floor the panel leaves, so the chart is built DOWN from the level the card is
         about and cpu zero falls where the scale puts it.
         SCALE 0.26 is the largest value under 0.28 whose five requests are all whole units, and
         the shortest bar it produces is the sidecar at 52 against the 38.75 floor `box()` is proven
         to carry a label and a sublabel at. 0.24 also divides evenly and was refused: it leaves 64
         units of empty floor under the tags where 0.26 leaves 43.
         The chart was 1080 wide and is 900. At full width the four cells were about 80 percent
         empty ink, and the reduction is 17 percent of the width against 7 of the height because
         the height is bounded below by the sidecar bar and the floor, and the width is not.
         The narrowest tile is init-b at 120 wide against `init cpu 300m`. That sublabel inks 92.0
         units at 1100x800 and 90.4 at 1600x1000, so 14.0 stand clear on each side at the worst of
         the two, and that is the floor: this string does not fit anything narrower. The tile reads
         120 by 208 against init-a's 180 by 208, so it is the slim one by the only measure a full
         height mosaic leaves, which is width.
         CENTRING, measured rather than assumed, because the whole lower block being off centre was
         a live question. The content bbox is 150..1050 on every one of the three viewports, the
         centre is 600.00 exactly and the two margins are 150.0 and 150.0. `CENTRE` (L-13) wants
         600 +- 40 and prints nothing for this card. The actor row inside it runs 420..1050 and is
         NOT centred, which is `WL.L-07` pinning the Scheduler to the spine and the panel taking
         the top left: that asymmetry is above the chart, not in it.
         Text is WIDER in viewBox units at the WIDE viewport, not the narrow one, which is the
         opposite of the assumption an earlier version of this note carried: the widest readout inks
         263.8 at 1100x800 and 296.3 at 1600x1000, and 6.89 units per character is the rate to
         estimate with.
LANES    Two, and both run UP. The chart PRODUCES the number and the control plane READS it, so
         nothing on this card travels down and there is no WL.A-01 pair. Each starts on the
         reservation and ends on the bottom face midpoint of the reader it serves, and the same
         object feeds the drawn arrow and its ball.
         Both stand at 0 until step 5: a lane drawn before the number exists aims its arrowhead at
         blank canvas (M-24). Both carry a ball on step 6, which is what earns them an arrowhead.
         Each is 186 units long and that number did not move when the chart shrank, because
         RESERVE_Y stayed on 306 and WL.TOP_BOTTOM is fixed. `routeDur` is length-based (A-11), so
         narrowing the card cost no timing at all: both balls still run 700ms at 0.266 u/ms.
         WL.A-03 does not reach this card. With no Node frame and no Pod there is no frame for a
         lane to pierce, which is why it leaves that queue.
         Neither lane carries a wire label of its own, and that is the readout doing the job for
         both: it stands at y=290, between the reservation the lanes leave and the readers they
         reach, and names the one number that rides them. A label per lane would have to sit on the
         corridor the readout already occupies.
         The lanes ride at 485 and 715, the face midpoints of a symmetric reader pair.
         A third line joins the two readers, and it is a RELATION rather than a lane: they read ONE
         number, which is what step 6 says in words, and nothing travels between them. No arrowhead,
         no ball, no wire label, true on every step including the poster (A-06). It runs on y=80,
         the side-face midpoint of both boxes, so it lands on a face at each end.
         170 by 60 is the CEILING of a symmetric pair on this card, and the two numbers move against
         each other: the pair is mirrored on WL.CX, so its left edge is 600 - gap/2 - width and every
         unit of gap comes off both boxes. 170 puts that edge on 400, which still clears the measured
         panel by 3.45, and anything wider walks the box behind it.
         WL.L-02 SAYS THE ACTOR ROW STARTS NO FURTHER LEFT THAN 420, and 400 is a deliberate 20 unit
         departure taken to buy the width. The convention carries 23.45 units of slack over the
         physical wall, which is the measured 396.55, and this spends 20 of them. Nothing is lost to
         the panel: the box has zero area behind it, and the sublabel inks 422..548 at its widest,
         clearing the deepest panel by 27.2.
         232, THE SIZE `workloads-pod-startup-conditions` GIVES ITS TWO ACTORS, WAS ASKED FOR AND IS
         REFUSED BY ARITHMETIC, so nobody re-derives it. A symmetric 232 pair puts the left edge at
         368 - gap/2, which is behind the 396.55 panel on every gap: at 20 the box loses 38.6 units
         of its border on the narrowest viewport, and past a 22 gap the sublabel itself goes behind
         the panel. That sibling can carry 232 because its pair is NOT centred: it hangs one box off
         WL.R and the other on the spine.
         WL.L-07 DOES NOT REACH THIS CARD, and that is a deliberate departure with a reason. The
         rule pins the trunk box to WL.SPINE_X so the trunk clears the two 480 wide columns at
         60..540 and 660..1140. This card draws neither column, so there is no corridor left for
         the rule to protect, and pinning one of two readers to the spine is exactly what made the
         pair lean 135 units right of centre.
MOTION   ONE PALETTE, and it is the rule this card is held to hardest. Every block stands at full
         weight on every step including the poster, and a step says what it is about ONLY by
         LIGHTING it. The opacity field carries just the ink that does not exist yet, and that moves
         0 to 1 with nothing in between, so the canvas is never showing two weights of the same blue
         at once. `OPACITY.pending` is deliberately NOT imported here: on this card it was doing
         reveal work rather than naming a Kubernetes state, and three grey levels across six steps
         read as three palettes. C-04 allows a bare 0 and 1, so nothing is being bent.
         Step 1 lights the two init tiles one after the other, 350ms apart, and the sidecar and the
         app TOGETHER on one delay. That simultaneity is the fact the whole card is built on, so it
         is drawn rather than only narrated. No step carries a static `lit` list: a list lands at
         step entry and eats the stagger, and `flowLights` derives the reduced path from the same
         targets anyway.
         Step 3 lights the pair first and lands the 800m rule on top 300ms later, so the rule reads
         as the answer to the two tiles rather than as one more edge arriving with them.
         COST, measured, so nobody reads it as a regression: dropping the reveals took step 1 from
         41 to 56 percent still and step 2 from 50 to 69, because a light beat is shorter than a
         fade. It bought step 4 the beat it never had, which stood at 100 percent still before and
         now stands at 73. Durations were left alone: step 2 reads at 8.18 ms per character, which
         is hurried against the catalog, so its hold is buying reading time and not standing idle.
         Every rank behind those three numbers comes from `tools/deadair.mjs` and is deliberately
         not copied here: a catalog rank goes stale when any card in any category lands.
         BLIND SPOT the frame tool has on this card now. `frames.mjs` samples at 0, 50 and 95
         percent of the SPAN, and every light lands at BEAT.lead 800 which IS the span on steps 2
         and 4, so those three frames all sit before the highlight. The rendered frames are not
         evidence for what a step looks like here. `tools/settled-dump.mjs`, which plays in real
         time, is: it reads profile all four, overhead ovhBand, init-max the two init tiles, run-sum
         sidecar and app, reserve init-a, held the two readers.
         Step 4 carries no packet, no reveal and no Pod. The run envelope IS the top edge of the run
         column, so a rule drawn on it is a level nothing can see: a graduation was built there and
         removed, and the beat is the lit pair plus the readout (M-27).
         MARK_H is 3.5 and not the 1.4 a box stroke draws. A graduation lands ON a bar top where it
         caps one, and at box-stroke weight it is read as that bar's own edge instead of as a level.
         Step 6 blanks its held caption on the animated path and lands it on the band it names once
         that band is fully in: the reveal runs 2.4s to 2.9s and the turnover fires at 2.9s, so the
         caption never sits over a band still fading up. prev and reset keep the static text (T-30).
CONTENT  The formula is quoted rather than derived. The sidecar-containers page states that the
         effective init request is the HIGHEST of any resource over ALL init containers, that a
         resource with no limit specified counts as the highest limit, and that the Pod effective
         request is the sum of pod overhead and the HIGHER of the non-init sum and that init
         maximum. It also states that scheduling is done on effective requests, so an init
         container can reserve what it does not use for the life of the Pod, and that ON LINUX the
         Pod cgroup is sized from the same number, which is the word step 6 spends `Linux` on. The
         pod-overhead page makes the cgroup claim without that qualifier, so the narration takes
         the narrower of the two sources and the Kubelet sublabel keeps the wider.
         `all init containers` INCLUDES the sidecar. The same page opens by calling a sidecar a
         special case of an init container and reserves `regular init containers` for the
         startup-only ones, which is where step 3, the aria-label and the desc get that adjective.
         A desc that drops it contradicts its own next clause, which sums the sidecar with the app
         containers it has just said runs one at a time. So step 4
         may not say the sidecar is NEVER in the init maximum: it is weighed there and loses to
         800m, which is what it now says, and that is what makes step 3 and step 4 agree rather
         than contradict each other.
         The DECLARED order of the init array is load bearing for every number on the canvas, and
         the docs do not state the rule. `k8s.io/component-helpers/resource` scores each init
         container as its own request plus the sum of the RESTARTABLE ones declared before it, and
         adds every restartable one to the non-init sum as well, citing the sidecar containers
         KEP for it rather than either cited page. The sidecar is
         declared LAST here, which the bars draw by starting it at the run window, so it puts 200m
         in the sum and 200m in the max and 800m stands. Declared FIRST it would score init-a at
         1000m and reserve the Pod 1250m. The card is true of the drawn order, not of any order.
         `restartPolicy=Always` in step 4 is the only place the drawn sublabel `always` is
         explained, and the sibling card spells it the same way. A step 4 saying only `declared in
         the initContainers array` is rejected: that is true of a regular init container too.
         `the one number Kubernetes never uses` is rejected for `the one number this Pod is never
         charged`. Four app containers ARE summed, so the unscoped form teaches that a sum is never
         used, which is the opposite of the rule.
         Pod overhead comes from RuntimeClass.overhead.podFixed and is stable since 1.24, and its
         250m of cpu is the Kata example on the pod-overhead page rather than an invented figure.
         SidecarContainers is stable and locked from 1.33, so at 1.35, the release the catalog
         targets, the sidecar carries no stage caveat and needs none.
         The numbers are chosen so the two branches DISAGREE: max 800 against sum 650, so the init
         branch wins and the naive 1750 is wrong twice over.
         They are also chosen so no two DERIVED numbers collide. The held room is init_max minus
         the non-init sum, so an app container at 400m makes it 200m, which is the sidecar request
         and draws a band the exact height of the sidecar bar standing beside it. At 450m the held
         room is 150m and matches nothing else on the canvas.
BUDGET   The readout no longer sits between the lanes. It rides ABOVE the actor row on the WL.A-02
         constant, y = WL.TOP_Y - 12 = 28, centred on WL.CX, and there is no cap on it any more:
         the band up there is free from x=420 to the right edge and the widest string drawn inks
         296.3 units over 451.8..748.2 at 1600x1000, clear of the panel by 161 at its widest.
         IT HAD TO MOVE, and the arithmetic is worth keeping because it closes the question. A
         symmetric pair puts the lanes at 600 +- d. The panel wall holds the left box at x>=420, so
         d <= 180 - TOP_W/2 and the gap between the lanes is at most 360 - TOP_W. Even a 100 wide
         box leaves 260, and the widest readout is 296.3 before any clearance. There is no box
         width at which a symmetric pair and a between-the-lanes readout both fit.
         The Scheduler sublabel was cut twice for the same reason, `bins on the effective request`
         at 177.9 then `bins on effective request` at 153.4, and it is now `bins on this request`.
         That inks 122.7, exactly what `sizes the Pod cgroup` inks, so the two readers carry strings
         of equal width in boxes of equal width and both clear their walls by 23.65. The word
         `effective` survives in three readouts, in the aria-label and in the desc, and `this`
         points at the number the chart below is computing.
NAMING   The sidecar box says `always cpu 200m` and not `init cpu 200m`, because its slot is the
         init array and its accounting is the app side, and that split is step 4.
         Step 3 and the aria-label both say REGULAR init containers run one at a time, and the word
         is load bearing rather than padding. Unqualified, the sentence is contradicted by step 4 on
         this same card, which puts the sidecar in the initContainers array and still runs it beside
         the app. Do not trim it back to a cleaner absolute.
         Step 2 reads `pod overhead, the floor, not a container` rather than repeating the band's own
         label: the band already says RuntimeClass overhead.podFixed and 250m, and a readout that
         restates the thing under it is the failure a chip strip would have been.
SCOPE    The ordering of init containers is workloads-init-containers-and-sidecars, which owns the
         exit-0 gate and the Started flag. Time is the X AXIS here and never a subject: no step
         plays a start, a gate or a Started flag, and the axis exists only because sequential and
         concurrent are what make one window a max and the other a sum.
         Allocatable and what is left of the Node is cluster-node-allocatable. This card produces a
         number and never compares it to a capacity, which is also why it draws no Node.
         The cgroup tree and the CFS quota are cluster-pod-cgroup-hierarchy and
         cluster-cpu-throttling. The Kubelet sizing the Pod cgroup is one clause of step 6.
         The QoS class is workloads-pod-qos-classes. The effective tier covers init, sidecar and
         app alike, which is true and is deliberately not drawn: it needs a second comparison.
         No autoscaler appears anywhere, the same clause workloads-pod-resize carries.
OPEN     TWO RULE shades still hard copy the workloads channel list 91, 184, 255, down from four:
         the axis and the graduation mark. A category retint reaches the five places C-22 names and
         misses those two. It stays open for the same reason as before, that a raw part is styled
         through an inline property and C-17 says a presentation attribute cannot resolve a token,
         and a var() that is mistyped or out of scope fails SILENTLY to no fill, which would delete
         the level the whole card is read off.
         The held tile shows the way OUT of it and is the reason the count halved. It wears the
         `scheme-box-rect` CLASS and takes its two colours from `var(--tint-fill)` and
         `rgb(var(--tint-base-rgb))`, which the dialog declares and every descendant inherits, so a
         retint reaches it for free. It stays a naked rect rather than a `box()` because a real box
         is a BLOCK: the two lanes leaving the reserve level would then be scored as arrivals
         landing 245 units off its 600 wide face midpoint, 41 percent, which is an OFFEDGE failure
         in the gate rather than a report finding. Measured, not assumed: both computed styles read
         `rgba(22, 34, 66, 0.72)` fill, `rgb(91, 184, 255)` stroke, 1.2px and rx 6.
```

### poster

```
The same four requests read two ways, and the Node sets aside whichever reading came out higher.
A FAN, many into one, drawn as a symmetric Y about x=160: one block at the top carrying the whole
accent, two frames of identical size below it, and two legs of identical length between them. The
legs are ORTHOGONAL and turn once, down 13 from the block face, across to the frame axis, then down
13 onto it, which is the house wire idiom rather than a free diagonal and keeps the two of them
mirror-exact about the axis. The LEG is what says who won, solid from the left frame and dashed at
0.55 from the right, so the result is stated by the composition rather than by a second bright
thing.
THE TWO FRAMES ARE THE SAME OBJECT, 128 by 82, mirror-placed at 20 and 172 with equal 20 unit
margins, each holding its bodies centred on its own axis and standing on its own inner ground line at
y=158. What differs between them is only the ARRANGEMENT: init bodies stand SIDE BY SIDE, which is a
group read as a maximum, and app stands ON sidecar, which is a group read as a sum. Every body is 42
wide, so nothing in the picture varies except height and placement, and the two ground lines sit at
one y, so the heights stay comparable across the gap.
Heights are 0.075 units per milli exactly: 60 for 800m, 22 for 300m, 34 for 450m, 15 for 200m, and
the right stack closes at 49 for 650m against the left frame's 60.
THE TOP BLOCK MAKES NO HEIGHT CLAIM, deliberately. It is a result and not a bar: it stands on no
ground line, it is wider than it is tall, and its 44 is the house block size rather than a measured
value. Giving it the reserved height would drag the RuntimeClass overhead into a still that has no
room to explain it, and a measured block among measured bars would be read as a fifth quantity.
ONE ACCENT, the 56 by 10 bar at 0.9 inside the top block, with all four bodies carrying the same bar
at 0.3. The winner is NOT given a second 0.9: two saturated things is the R-07 failure, and the
solid leg plus the 0.09 fill on the 800m body already say it twice.
REJECTED, with the reason each time.
TWO ZONES COMPARED on one ground line with a floating vertical rule, which is what this poster was
for one pass on 2026-08-31. The reading was right and the drawing was not: bodies of three different
widths, a divider hanging in mid-air between them, and an off-centre mass that left the composition
looking assembled rather than laid out.
TWO QUANTITY COLUMNS, the naive 1750m sum beside the 1050m reserve, which is what it was before
that. It said only that the reserve is shorter than the sum and never why 800m, and its bright 100
by 51.2 tile was a saturated fill on a whole shape rather than a bar inside a block.
A GAUGE, 1050 filled inside a 1750 frame, because a fill inside a frame asserts containment and 1050
is not part of 1750. A RANK LADDER, because that family fails exactly when a height is read as a
resource, and here it genuinely is one. A SINGLE SEGMENTED BAR with the winning 800m segment lit: it
teaches that the other three requests are discarded, and step 4 is careful that the sidecar is
weighed in the init maximum and LOSES to 800m. A BRANCH from the spec downward into the two
readings, which puts the accent in a lower corner and leaves the subject of the sentence off the
centre of the composition.
A TIME AXIS, the card's own instrument with the short init tile setting a level that holds for the
whole life of the Pod. It is the sharpest sentence available and it is the card's own mosaic at
200px, which is R-10.
THE NEAREST SIBLING IS THE LEFT NEIGHBOUR, workloads-env-before-pid-1, also boxes joined by legs to
one block carrying the bright bar. They are differentiated by direction and by rhythm rather than by
family: that one fans DOWNWARD into a receiver at the bottom and its cast is small equal boxes on
long dashed legs, this one converges UPWARD into a block at the top and its cast is two large frames
with measured bodies inside them. Checked on the true-size strip, not on the 3x.
```
