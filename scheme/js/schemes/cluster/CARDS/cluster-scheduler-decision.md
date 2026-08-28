## cluster-scheduler-decision

### layout

```
WHAT     THE CLUSTER EXEMPLAR. One scheduling cycle: watch, filter, score, bind, and the Kubelet on
         the chosen Node picking the Pod up. The Kubelet is DRAWN, and the write reaching it rides
         two lanes, because a step that narrates an arrival has to show one (T-21).
PANEL    x<=290.77, bottom 125.11..142.56 at 1600x1000. x<=377.76, bottom 150.17..171.42 at
         1280x860. x<=396.55, bottom 155.28..180.12 at 1100x800, deepest on `filter` and held by
         every step after it. That right edge TIES the catalog worst case, which L-02 records
         against cluster-architecture at the same 396.55.
LAYOUT   The value-chip column is 270 wide, NOT the 480 of LAYOUT.A. The last 210 units of the
         preset column are the only channel from the control-plane band down to the Node band: the
         chips stop at 930, the Kubelet stands at 955..1085 x 240..320 and both of its lanes are
         straight drops on NODE4_CX 1020. Its y is DERIVED from the chip band: the three chips span
         220..340, and KUBELET_Y is that middle 280 less half the block height, so the block reads
         as centred against the column beside it rather than against anything else. Chip floor is 171.2, the widest name plus value plus the 24 of
         valChip padding, so 270 leaves 98.8 of gap.
LANES    Two lanes leave the API bottom face as a MIRRORED PAIR at +-30 (L-12), so neither is
         off-midpoint on its own: the relation down to the ladder at 780, the watch stream out to
         the Node at 840, both turning on ONE horizontal so the pair reads as a single bus under
         the API rather than as two legs that missed each other.
         Api.bottom -> Kubelet.top -> Node-4.top, 290 units then 80, the first
         ball at 0.414 u/ms against the 0.45 canon and the second on the 700ms floor (M-13).
MOTION   `placed` runs two hops and then hands the slot over. The watch event lands on the Kubelet
         at 700, the start hop lands on Node-4 at 1500, Node-4 own label and sublabel fade out over
         HANDOVER_MS 200, and the Pod fades in over FADE.in and pulses on that same delay, so the
         two still share one delay as the workloads canon asks. Span 2600 against a duration of 2800.
NOTE     The Kubelet stands at full strength on every step, like Node-4 and unlike the two filtered
         Nodes. DO NOT hold it at OPACITY.pending until `placed`: it reads as a
         block that is not there yet, when a Kubelet on every Node is exactly what IS always there.
         Its lanes take the same shade, since a lane is min(source, sink) and both ends are 1 (A-13).
WIRE LABELS
         THREE, not four. The Kubelet -> Node-4 drop carries a ball and NO label, which is the one
         place this card leaves an exchange unnamed on the canvas: the narration says the Kubelet
         pulls the image and starts the containers, the Pod appearing in the slot IS that sentence,
         and a caption in the 90 units between the two blocks crowded the arrival it labels.
         `resp` and `watch` share WIRE_RESP_Y 169, so the two strings in that band read as one row.
         `watch` is anchored START at 854 rather than centred: centred on its own leg the 234.3 wide
         string ran back over the WATCH_X drop at 840, and centred on NODE4_CX it reached 1137.1,
         2.9 off the content edge. Measured at 1600x1000, 854..1088.3 clears both.
NOT A DEFECT
         `report/arrival.test.mjs` R3 names Node-4 lit at entry while a packet reaches it at 1500,
         and it STAYS. Node-4 is lit on `score`, on `bind` and on `placed`, and dropping it for the
         1500ms of the two hops reads as the winner being un-chosen, which is the same argument the
         v4 note below records. The arrival still has a receiver: the Kubelet lights on its own hop.

WHY NOT  Neither of the one-beat forms works, and both fail on the same geometry: Node-4 label sits
         on the Pod INNER label baseline and its sublabel on the Pod inner sublabel baseline.
         Pinning the two strings to 0 at step entry leaves the winning frame standing EMPTY and lit
         for the whole 600ms of the Pod fade. Fading them out simultaneously with the Pod puts both
         pairs on screen legible on top of each other, measured on seeked frames at 150 and 250 into
         the step.
NOTE     The `aria-label` names the Node row and the placed Pod, not the four ladder stages alone.
         The bottom half of the drawing is where the decision lands, and this string is all a screen
         reader gets for the picture (T-28).
NOTE     CENTRE passes because the chip strip pools EVERY .scheme-chip: the ladder rows (60..540) and
         the verdict chips (60..1140) keep the strip centred on 600, so narrowing the value chips to
         660..930 for the kubelet channel does not move it. Re-measured, still 0 findings.
NOTE     JOG_Y is 190, NOT the 180 midpoint of the 140..220 band, and BOTH horizontal legs sit on
         it. Two things forced it. The panel bottom measures 180.12 at 1100x800, so on the midpoint
         the leftmost ~97 units of the left leg and its corner turn passed behind the panel and the
         line read as emerging from under the panel bottom-left edge. And the kubelet leg had been
         placed at 190 while the relation stayed at 180, so two legs off ONE face ran 10 apart.
         190 buys both: 9.88 of clearance under the worst panel, and one shared horizontal. The band
         split is 50/30 rather than 40/40, which is the whole cost.
BUDGET   Narration length is LOAD-BEARING here. Panel bottom at 1100x800 goes 155 -> 180 -> 205 in
         one-line steps, and 205 swallows the turn entirely. `bind` was drafted at 275 characters,
         measured 205, and ships at 241. Measure at 1100x800 after ANY narration edit, not at the
         default 1600.
NOTE     The ETCD -> Api return lane wore an arrowhead no ball had ever ridden. It was NOT demoted to
         a relationPath: the four top-row lanes are two mirrored request/answer pairs, and sinking
         half of a pair leaves the survivor reading as the senior lane. The answer was DRAWN instead:
         bind runs three hops, POST -> persist -> commit ack, chained on arrivalMs + BEAT.afterHop.
         rv=903 on the persist wire was always etcd ANSWERING, so the ball carries a value the card
         already showed.
NOTE     `reset` on this card carries `keys` ALONE: there is no `pods` list, and its absence is the
         decision rather than an omission (no card in the catalogue writes an empty one, so the
         absence is how the decision is spelled). The card pulses `placedPod` and never takes that
         pulse back, and the `pods` argument of `clearHighlights` runs `clearPodHighlight`, which
         clears four inline properties
         per matched rect (stroke, stroke-opacity, stroke-width, transition) and no class at all. So
         inferring pods from the parts list, which is otherwise the obvious generalisation, would
         wipe the styles the placed Pod's final look depends on. Nothing in `npm test` reads inline
         stroke styles, so the only way to see that difference is to serialise the tree and diff it.
         The mirror of this defect is a `.highlight` on a Pod inner box that was NOT named in the
         keys list and therefore leaks (`S-19`), and the two are why neither argument is derived.
NOTE     `score` lights the Scheduler, as `filter` does. Both are equally the Scheduler's own internal
         work and neither moves a packet, and on a step with no motion the highlight is the ENTIRE
         beat, so an unlit Scheduler reads as going idle to do its scoring.
CONTENT  Node-2 reads `mem unreserved 200Mi`, NOT `mem free`. The Scheduler measures the SUM OF
         REQUESTS against Allocatable, never against memory that happens to be free, and the two
         siblings that own the distinction both say so: cluster-node-allocatable (`the sum of Pod
         requests on a Node may not pass Allocatable`) and cluster-pod-priority-preemption
         (`requests against allocatable`). NodeResourcesFit `checks if the node has all the
         resources that the Pod is requesting`. A reader arriving from either sibling met the one
         word those cards exist to unteach.
CONTENT  `score` says `the weighted sum of all of them ranks the Nodes`, not `the weighted sum is
         the final score`. Both halves of the old wording were true on their own (MaxScore 100 and
         MinScore 0 in kube-scheduler/framework/interface.go, and the framework doc says the
         scheduler `will combine node scores from all plugins according to the configured plugin
         weights`), but together with three named plugins they implied a total on the same 0 to 100
         scale. TotalScore has no such ceiling. The replacement is the same 250 characters, which
         is what the panel budget above allows.
CONTENT  The `aria-label` ends on `the Kubelet on Node-4 picking the Pod up and running it`. The
         Kubelet is a drawn block, and the string a screen reader gets for the picture may not omit
         the actor that performs the last step (T-28).
CONTENT  `reaches the Scheduler on its watch ... pops it off the active queue and runs one scheduling
         cycle`. `per-pod cycle` was invented vocabulary, and cluster-pod-priority-preemption already
         says `runs the scheduling cycle`, which is also the upstream name.
         `filter` names percentageOfNodesToScore: a large cluster stops filtering once enough Nodes
         fit, so `evaluate every Node` was a naked absolute only true at this card's four-Node scale.
         The desc says `filters out THE Nodes that cannot fit it`, not EVERY Node, caught by the
         internal-contradiction pass the moment the filter step grew its early-stop clause.
         `The Kubelet on Node-4 watches ...`, not `Node-4 sees the Pod`: a Node does not watch
         anything, its Kubelet does, and the Scheduler box one row up is the card's own example.
         The desc is what CONVICTED that one: it had said "the Kubelet on the chosen Node picks the
         Pod up on its own watch" since it was written. Two carriers of one fact, one of them wrong,
         and reading them side by side is the whole technique.
NOTE     Chain row 2 keeps `fail predicates`. It is legacy vocabulary next to Filter plugins, but
         cluster-pod-priority-preemption uses the same word and kubernetes.io still glosses Filter
         plugins as the successor to predicates, so changing it here alone buys cross-card drift.
NOTE     `score` names the preemption card (`See the Pod Priority and Preemption card.`), which sits
         one stage further on. It went on score rather than on filter, where PostFilter belongs by
         subject, purely for the character ceiling: filter is at 248 characters and score at 250
         WITH the pointer already in it, and both land on the same five-line panel bottom of 180,
         which is the card worst case. The pointer sentence is another 41 characters and filter has
         no room for it: one more line takes the panel from 180 to 205, which swallows the turn.
```

### poster

```
Sentence: the Pod is scored against every candidate and bound to the one that wins.

The Pod scored against three candidate nodes, then BOUND to the highest-scoring winner (a bright
dashed link) while the passed-over nodes get the same links dim, with shorter score bars.

The three links are orthogonal, not diagonals: both losing lanes leave their own Node top face at
its centre, rise clear of the Node band and turn 90 degrees into the Pod SIDE face on its midline at
y=43, while the winner runs straight down between the two faces they left. The two verticals stand
outside the Pod column at x=64 and x=256, so neither horizontal crosses a block on its way in.
Every lane meets a face exactly, the Node top edge at 104 and the Pod side edges at 128 and 192.

Three Nodes with the MIDDLE one winning while the card binds to the rightmost. Deliberate, same
reasoning as the leader-election poster: the boxes are unnamed, and moving the win to an edge box
sends the straight lane to a loser and the turning lane to the winner.
```
