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
         tile's own sublabel and by step 3 in words: `the phase holds that 800m whichever of the two
         is running, which is why init-b stands as tall as init-a`. Without that clause the argument
         for a full-height tile lives only in this record, and a reader meets a 300m label on an 800m
         tile with nothing on the card explaining it. A graduation inside the tile
         at y=436 marking that level is REJECTED: at 3.5 units across a 120 wide tile it does not
         read as a level, it reads as a rule cutting the tile in two, which is an artefact in a
         mosaic.
         init-b at its own 78 units with a dashed idle cell filling the room above it is REJECTED
         too: it reads as an unfinished corner patched over, and a mosaic wants a tile there, not a
         hole with a lid.
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
PANEL    x<=397 catalog-wide (`L-02`). Bottom per viewport:
         `OVERLAY_IDS=workloads-effective-pod-requests node --test report/overlay.test.mjs`. Deepest
         at 1100x800 on step 6, the one ten-line step. `L-08` makes the bottom a function of the
         narration, so every reading here moves with the prose.
         The topmost ink left of x=420 is the init graduation, whose rect starts at y=304.25, so the
         deepest panel stands 49.59 units clear, and the two wider viewports leave more. TEN LINES
         AT THE DEEPEST VIEWPORT IS THE CEILING of this composition and nine is the budget: steps 1
         to 5 run 311 to 335 characters and read nine lines, and step 6 at 360 characters reads ten.
         A 450 character step 4 puts the panel bottom ON the init tile top, twelve lines against a
         chart hung 75 under nine, so a sentence added to one step is paid for by a sentence cut
         from the same step, and an eleventh line anywhere is the panel on the tile.
         The one per-step readout sits at x=600 on y=28, above the actor row and above anything the
         panel reaches on any viewport.
SIZES    Every height is DERIVED from REQ through CPU(), so the drawing and the arithmetic cannot
         disagree: 800m is 208 units, 300m is 78, 200m is 52, 450m is 117, 250m is 65, and the
         reservation at 1050m is 273.
         RESERVE_Y is the anchor and BASE_Y hangs off it, not the other way round. 306 is the
         measured floor the panel leaves, so the chart is built DOWN from the level the card is
         about and cpu zero falls where the scale puts it.
         SCALE 0.26 is the largest value under 0.28 whose five requests are all whole units, and the
         shortest bar it produces is the sidecar at 52 against the 38.75 floor `box()` is proven to
         carry a label and a sublabel at. 0.24 also divides evenly and is REFUSED: it leaves 64
         units of empty floor under the tags where 0.26 leaves 43. The chart is 900 wide and not the
         full 1080. At full width the four cells run about 80 percent empty ink, and 900 costs 17
         percent of the width against 7 of the height, because the height is bounded below by the
         sidecar bar and the floor and the width is not.
         The narrowest tile is init-b at 120 wide against `init cpu 300m`. That sublabel inks 92.0
         units at 1100x800 and 90.4 at 1600x1000, so 14.0 stand clear on each side at the worst of
         the two, and that is the floor: this string does not fit anything narrower. The tile reads
         120 by 208 against init-a's 180 by 208, so it is the slim one by the only measure a full
         height mosaic leaves, which is width.
         CENTRING, measured rather than assumed, because the whole lower block being off centre was
         a live question. The content bbox is 150..1050 on every one of the three viewports, the
         centre is 600.00 exactly and the two margins are 150.0 and 150.0. `CENTRE` (L-13) wants 600
         +- 40 and prints nothing for this card. The actor row inside it runs 420..1050 and is NOT
         centred, which is `WL.L-07` pinning the Scheduler to the spine and the panel taking the top
         left: that asymmetry is above the chart, not in it.
         Text is WIDER in viewBox units at the WIDE viewport and not at the narrow one, which is the
         opposite of the obvious assumption: the widest readout inks 263.8 at 1100x800 and 296.3 at
         1600x1000, and 6.89 units per character is the rate to estimate with.
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
         each other: the pair is mirrored on WL.CX, so its left edge is 600 - gap/2 - width and
         every unit of gap comes off both boxes. 170 puts that edge on 400, which still clears the
         measured panel by 3.45, and anything wider walks the box behind it.
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
         60..540 and 660..1140. This card draws neither column, so there is no corridor left for the
         rule to protect, and pinning one of two readers to the spine is exactly what made the pair
         lean 135 units right of centre.
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
         as the answer to the two tiles rather than as one more edge arriving with them. WHAT A
         LIGHT COSTS AGAINST A FADE, measured: steps 1 and 2 stand 56 and 69 percent still on a
         light where a fade holds them at 41 and 50, because a light beat is shorter. What it buys
         is step 4, which carries a beat at all rather than standing 100 percent still. The
         durations answer to the prose. Step 2 holds 3000: at 2600 its 8.18 ms per character is rank
         97 of 618, the most hurried step of the card by a margin, and at 3000 it reads 9.43 and
         stands 73 percent still. Steps 3, 4 and 5 hold 3000, 3200 and 3000 for the same reason, so
         every narrated step reads between 9.4 and 10.8 ms per character against the catalog median
         of 10.04, and step 6 holds 3600, which its 360 characters read at exactly 10.00.
         Every rank behind those three numbers comes from `tools/deadair.mjs` and is deliberately
         not copied here: a catalog rank goes stale when any card in any category lands.
         BLIND SPOT the frame tool has on this card. `frames.mjs` samples at 0, 50 and 95 percent of
         the SPAN, and every light lands at BEAT.lead 800 which IS the span on steps 2 and 4, so
         those three frames all sit before the highlight. The rendered frames are not evidence for
         what a step looks like here. `tools/settled-dump.mjs`, which plays in real time, is: it
         reads profile all four, overhead ovhBand, init-max the two init tiles, run-sum sidecar and
         app, reserve init-a, held the two readers.
         Step 4 carries no packet, no reveal and no Pod. The run envelope IS the top edge of the run
         column, so a rule drawn on it is a level nothing can see: a graduation there is REJECTED,
         and the beat is the lit pair plus the readout (`M-27`).
         MARK_H is 3.5 and not the 1.4 a box stroke draws. A graduation lands ON a bar top where it
         caps one, and at box-stroke weight it is read as that bar's own edge instead of as a level.
         Step 6 blanks its held caption on the animated path and lands it on the band it names once
         that band is fully in: the reveal runs 2.4s to 2.9s and the turnover fires at 2.9s, so the
         caption never sits over a band still fading up. prev and reset keep the static text (T-30).
CONTENT  The formula is quoted rather than derived. The sidecar-containers page states that the
         effective init request is the HIGHEST of any resource over ALL init containers, that a
         resource with no limit specified counts as the highest limit, and that the Pod effective
         request is the sum of pod overhead and the HIGHER of the non-init sum and that init
         maximum. It also states that scheduling is done on effective requests, so an init container
         can reserve what it does not use for the life of the Pod, and that ON LINUX the Pod cgroup
         is sized from the same number, which is the word step 6 spends `Linux` on. The pod-overhead
         page makes the cgroup claim without that qualifier, so the narration takes the narrower of
         the two sources and the Kubelet sublabel keeps the wider. `all init containers` INCLUDES
         the sidecar. The same page opens by calling a sidecar a special case of an init container
         and reserves `regular init containers` for the startup-only ones, which is where step 3,
         the aria-label and the desc get that adjective. A desc that drops it contradicts its own
         next clause, which sums the sidecar with the app containers it has just said runs one at a
         time. So step 4 may not say the sidecar is NEVER in the init maximum: it is weighed there
         and loses to 800m, which is what it says, and that is what makes step 3 and step 4 agree
         rather than contradict each other. The DECLARED order of the init array is load bearing for
         every number on the canvas, and the docs do not state the rule.
         `k8s.io/component-helpers/resource` scores each init container as its own request plus the
         sum of the RESTARTABLE ones declared before it, and adds every restartable one to the
         non-init sum as well, citing the sidecar containers KEP for it rather than either cited
         page. The sidecar is declared LAST here, which the bars draw by starting it at the run
         window, so it puts 200m in the sum and 200m in the max and 800m stands. Declared FIRST it
         would score init-a at 1000m and reserve the Pod 1250m. Step 4 says so in one sentence,
         `Declared before init-a it would run beside it and lift that maximum to 1000m: array order
         is part of the number`, because a card silent on it is true of the drawn order only and a
         reader has no way to know the order was chosen. The docs page is not a source for that
         sentence: the 1000m is init-a plus the sidecar declared before it, the per-container score
         of `k8s.io/component-helpers/resource`, and the citation is the sidecar containers KEP. THE
         NO-LIMIT CLAUSE IS NOT ON STEP 3. It is a limits rule on a requests card and nothing drawn
         carries a limit, so it reads as a detour there. What the card carries instead is one
         sentence on step 5, `Limits follow the same max and sum`, which is the same page pairing
         request and limit in every rule it states. `Memory is counted the same way` closes step 6.
         The page states every rule `for a resource`, and a card drawing cpu alone never said the
         other resource goes through the same max and sum independently. THE ONE COUNTER-CASE THE
         FORMULA HAS is pod-level resources, and step 6 names it in one clause: `a Pod that sets
         pod-level spec.resources replaces this number with its own`. The assign-pod-level-resources
         task page states `When both are present, the pod-level requests take precedence`, the
         server must be 1.34 or later and the PodLevelResources gate is beta there, so at the 1.35
         the catalog targets the override is live by default and a card stating the container
         formula as the whole mechanism is a T-19 absolute. The clause is deliberately stageless: a
         maturity word would date faster than the sentence, and the card that owes the mechanism its
         own drawing is a sibling this section does not have yet. It is NOT written as `overrides
         the formula`, because with pod-level requests set the container aggregate is not overridden
         but unused. CLAIMS READ AGAINST 1.35, every one with the page it rests on, so none needs
         re-verifying without a source that overturns it:
           the max over init containers, the sum over non-init, the higher of the two plus pod
             overhead, `request/limit` in every rule, scheduling on the effective number, the
             Linux Pod cgroup sized from it: the sidecar-containers page, `Resource sharing
             within containers` and `Sidecar containers and Linux cgroups`
           regular init containers run sequentially, each must succeed before the next: the
             init-containers page, `Understanding init containers`
           `overhead.podFixed` as the field path: the RuntimeClass API reference, `Overhead`,
             `podFixed represents the fixed resource overhead associated with running a pod`
           250m cpu as a sandboxed-runtime figure, the RuntimeClass admission controller writing
             the overhead into the PodSpec at admission, the scheduler adding overhead to the
             requests, the kubelet including it in the Pod cgroup, `Stable since Kubernetes
             v1.24`: the pod-overhead page
           `a Pod on the default runtime has no floor at all`: the pod-overhead page, `the Pod
             overhead is set at admission time according to the overhead associated with the Pod
             RuntimeClass`, so a Pod naming no RuntimeClass carries none
           `Declared before init-a ... lift that maximum to 1000m`: the sidecar containers KEP
             (enhancements 753), `InitContainerUse(i)
             = Sum(sidecar containers with index < i) + InitContainer(i)`, and the same rule as a
             comment in `k8s.io/component-helpers/resource/helpers.go`,
             `aggregateContainerResourcesByFn`. No kubernetes.io page states it
         THE TWO CITED PAGES DISAGREE on overhead, and the card follows the fuller one. The
         init-containers page states the Pod effective request as `the higher of` the app sum and
         the init maximum with no overhead term, while the sidecar-containers page states `the sum
         of pod overhead and the higher of`, and the pod-overhead page confirms the scheduler `adds
         the requests and the overhead`. Both pages stay cited: the init page is the source for
         sequential execution, not for the formula.
         The pod-overhead page says the kubelet sets `cpu.shares based on the sum of container
         requests plus the overhead`, a `sum` where the sidecar page says `effective`. Step 6
         follows the sidecar page and the init page (`the same as the scheduler`): the cgroup is
         sized from the number the scheduler used, and `sum` on the overhead page is that page
         describing a Pod with no init containers.
         `only the highest of them counts` in the desc and `counts only its tallest single
         container` in the aria-label are rejected: both are absolutes true of the drawn order only,
         and the desc is the one text a grid reader sees, so the counter-case on step 4 does not
         reach them. Both now carry `plus any sidecar declared before it`, the KEP rule in six
         words. The desc paid for it with `bins on it` for `bins on that number`, `the app and the
         sidecar` for `the app and sidecar containers`, and no `actually`, and stands at 460 of 470.
         `how much does the Node actually set aside` is rejected for `how much does the Scheduler
         reserve`: nothing on a Node reserves cpu for a request, the Scheduler accounts for it and
         the Kubelet weights the cgroup by it, and the desc names those two as the actors in its own
         next sentence.
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
         They are also chosen so no two DERIVED numbers collide. The held room is init_max minus the
         non-init sum, so an app container at 400m makes it 200m, which is the sidecar request and
         draws a band the exact height of the sidecar bar standing beside it. At 450m the held room
         is 150m and matches nothing else on the canvas.
BUDGET   The readout no longer sits between the lanes. It rides ABOVE the actor row on the WL.A-02
         constant, y = WL.TOP_Y - 12 = 28, centred on WL.CX, and there is no cap on it any more: the
         band up there is free from x=420 to the right edge and the widest string drawn inks 296.3
         units over 451.8..748.2 at 1600x1000, clear of the panel by 161 at its widest.
         IT HAD TO MOVE, and the arithmetic is worth keeping because it closes the question. A
         symmetric pair puts the lanes at 600 +- d. The panel wall holds the left box at x>=420, so
         d <= 180 - TOP_W/2 and the gap between the lanes is at most 360 - TOP_W. Even a 100 wide
         box leaves 260, and the widest readout is 296.3 before any clearance. There is no box width
         at which a symmetric pair and a between-the-lanes readout both fit. The Scheduler sublabel
         is `bins on this request` for the same reason, against `bins on the effective request` at
         177.9 and `bins on effective request` at 153.4. That inks 122.7, exactly what `sizes the
         Pod cgroup` inks, so the two readers carry strings of equal width in boxes of equal width
         and both clear their walls by 23.65. The word `effective` survives in three readouts, in
         the aria-label and in the desc, and `this` points at the number the chart below is
         computing.
NAMING   The sidecar box says `always cpu 200m` and not `init cpu 200m`, because its slot is the
         init array and its accounting is the app side, and that split is step 4.
         Step 3 and the aria-label both say REGULAR init containers run one at a time, and the word
         is load bearing rather than padding. Unqualified, the sentence is contradicted by step 4 on
         this same card, which puts the sidecar in the initContainers array and still runs it beside
         the app. Do not trim it back to a cleaner absolute.
         Step 2 reads `pod overhead, the floor, not a container` rather than repeating the band's
         own label: the band already says RuntimeClass overhead.podFixed and 250m, and a readout
         that restates the thing under it is the failure a chip strip would have been.
SCOPE    The ordering of init containers is workloads-init-containers-and-sidecars, which owns the
         exit-0 gate and the Started flag. Time is the X AXIS here and never a subject: no step
         plays a start, a gate or a Started flag, and the axis exists only because sequential and
         concurrent are what make one window a max and the other a sum.
         Allocatable and what is left of the Node is cluster-node-allocatable. This card produces a
         number and never compares it to a capacity, which is also why it draws no Node.
         The cgroup tree and the CFS quota are cluster-pod-cgroup-hierarchy and
         cluster-cpu-throttling. The Kubelet sizing the Pod cgroup is one clause of step 6.
         The QoS class is workloads-pod-qos-classes. The effective tier covers init, sidecar and app
         alike, which is true and is deliberately not drawn: it needs a second comparison. No
         autoscaler appears anywhere, the same clause workloads-pod-resize carries.
NOT A DEFECT
         The reader relation is a painted element `EXPECTED_PAINTED` in `render/palette.test.mjs`
         counts, and the reason is written beside it there. SPREAD is clean: the relation resolves to
         the cluster violet every other control-plane relation in this category resolves to.
OPEN     TWO RULE shades still hard copy the workloads channel list 91, 184, 255, down from four:
         the axis and the graduation mark. A category retint reaches the five places C-22 names and
         misses those two. It stays open because a raw part is styled
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
