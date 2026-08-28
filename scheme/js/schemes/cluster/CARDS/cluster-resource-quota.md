## cluster-resource-quota

### layout

```
WHAT     A namespace budget that ACCUMULATES, which separates it from cluster-node-allocatable next
         door: there a Node capacity is carved into pieces taken AWAY, here the bar IS spec.hard and
         the slots fill it left to right, so the refused request is drawn PAST the bar edge.
LAYOUT   ONE grid for the BUDGET half: three equal 360 columns over the content band, at 60, 420 and
         780, centres 240, 600 and 960. Every element below the ladder is centred on a column or
         spans a whole number of them.
LAYOUT   The ACTOR row is the one thing off that grid, and deliberately. The two are taken as a PAIR
         at the family 232 with the family 56 between them, and the GAP straddles x 600, so each
         block stands 28 + 232 from the canvas centre: 340..572 and 628..860. The `req` and `ack`
         registers land on 600 as a consequence, which is the rail the whole lower half centres on.
LAYOUT   The LimitRange does NOT take the ReplicaSet's rail any more, it takes the `L-03` floor at
         420..652. On the actor rail its sublabel `defaultRequest.cpu 500m` inked 385.4..526.6 at
         1100x800 against a panel reaching 396.5, so 11.1 units of its first character sat behind
         the panel. At 420 it inks 465.4..606.6 and clears by 68.9.
LAYOUT   Column 0 is the PANEL'S column above and the first budget slot below. The panel reaches
         x 396.55 at 1100x800, which ties the catalog worst L-02 records, and bottom 254.66, also at
         1100x800 and on step 4 rather than step 3. Nothing may stand in column 0 in the actor band,
         and below y 255 the whole band is free: the same column that is empty above carries web-1
         below. The void under the panel is that fact drawn, not space left over.
LAYOUT   Each column carries one desired replica, read top to bottom: the block says what that Pod
         asked for and the cell under it says what it became. That vertical pairing IS the payload,
         and it is what makes the last column legible as one sentence, the request past the ceiling
         over the row kubectl never prints.
LAYOUT   The bottom is ONE stack, not three rows with air between them: bar 406..470, the status row
         478..512 at the same CHIP_VGAP 8 the chip rows use, the refusal reason on the +20 register
         under it (ink 520.8..535.4 at 1600x1000, 521..535.7 at 1100x800), and the chip strip from
         548. That leaves 8 between bar and cells and 12.3 between the reason and the chips, against
         the 34 of dead band a listing caption row would cost.
LAYOUT   The reason is a FOOTNOTE to its column, under the `No Pod object` cell rather than between
         the two rows, and it stays centred on 960: widest case 1600x1000 it inks 839.4..1080.6, so
         it sits 59.4 clear of both walls of column 2 and touches neither neighbour column.
LAYOUT   There is no node() frame: a quota is a namespace fact and namespaces have no frame
         primitive, so the bar caption carries the namespace instead.
PANEL    x<=397 catalog-wide (`L-02`). Bottom 254.66 at 1100x800 step 4, shallowest 142.56 at
         1600x1000 step 2, a swing of 77.22 units on step 4 alone. The bar row at y 406 clears the
         deepest bottom by 151.3. What does NOT clear it is the ReplicaSet box at x 340, which is
         the OPEN below.
SIZES    The LimitRange is the family 80 tall and centred on the ladder's mid line, 212..292. A
         height of 74, `ROW_H * 2 + ROW_GAP`, derives from a block standing against rows 1 and 2
         alone. Centred on all five rows there is no such pairing to derive from, so the number
         comes from the family rather than from a relationship the card does not draw.
SIZES    Bar 60..780 at 64 tall, one column per 500m, so CPU_W is 720 and the refused request is
         the 360 of column 2. Cells 348 wide at 34 tall, centred on their column: the 12 between
         them separates OBJECTS, while the slots carving the bar take no gap at all, because they
         are portions of one length rather than three things.
LANES    WHERE IT POINTS is the whole reason the LimitRange box left the actor row, and what it now
         points at is a BRACE rather than the ladder's left wall. The brace is a `P.relation` with a
         hand-built `d`: ends at 768, 12 clear of the rows, corner radius 30, so the spine sits at
         738 and the nose at 708, on the ladder's own mid line 252. `geometry.test.mjs` skips any
         `d` carrying a curve command, so DIAGONAL, THROUGH and OFFEDGE have nothing to say about
         it by construction rather than by exemption.
LANES    The stub from the LimitRange is 56 long, the family gap, from its right face midpoint at
         (652, 252) to the nose. It is not a line into the ladder's side: it terminates on a
         drawn mark. Block, stub and brace all take their shade from `budget()` rather than from
         three separate entries, which is what `A-16` asks for even though every step pins them to 1.
LANES    The API tie is an L, not a drop: out of the API's RIGHT face midpoint at (860, 80), 100
         units right to the ladder centre, then 72 down onto (960, 152). Once the pair centred on
         600 the API does not stand over the pipeline, and a drop from its own centre would land
         at 744, which is 36 LEFT of the ladder entirely. That is why the card has no `API_CX`.
MOTION   Nothing on this card stands before the beat that earns it. On the quota step the two chips,
         both verdict wires, slot1 and the refused block wind back and turn over on their own Pod's
         arrival, so the sum grows per ADMISSION rather than per step, which is the half of the
         sentence that is the point. TWO packets ride that step, web-2 and web-3: slot0 reveals at
         delay 0 with no ball, because web-1 is the request steps 1 to 3 already walked down the
         chain and this is where it lands. The refused block comes up on the second ball.
         spec.hard never changes, and that is what the field is.
MOTION   On persist the two writes and the ReplicaSet condition are separate beats: the cells that
         were written turn Pending at entry, the third goes to `No Pod object` at REVEAL_MS with the
         answer packet departing on the same delay, and only the 403 wire and the ReplicaFailure
         chip wait for that packet to reach the ReplicaSet.
MOTION   Every chip whose value CHANGES is named in that step's `lit`, `last admission` on all five
         included. It changes on all five and on three of them it is the only thing that does: the
         limits and policies steps register no animation at all (`M-27`), so the cue on that chip and
         the ladder row are the whole beat. `report/arrival.test.mjs` scores the axis: the three
         steps here were the only unexplained R2-STEP findings in the catalog.
NOTE     The LimitRange block is lit on the mutating and limits steps and dark on the other three,
         which is not an omission: LimitRanger sits at rows 1 and 2 and nothing later reads a
         LimitRange. The brace saying otherwise is the OPEN below.
NAMING   A cell carries the STATUS alone and never a name: the name is on the block directly above
         it, so no column prints one name twice, and the refused block keeps an identity of its own
         to spend, which is what lets the refused block read as web-3 while the cell under it says
         only that no object exists. Statuses are title case because `.scheme-box-label` is a title
         slot (T-09), and a kubectl STATUS column is capitalised in any case.
CONTENT  The ReplicaSet chip counts what admission PRODUCES, so it reads `N created` and never
         `N ready`. The reference defines `status.readyReplicas` as "the number of non-terminating
         pods targeted by this ReplicaSet with a Ready Condition", and a Pod admission has just
         written is Pending and carries no such condition. What the write produces is
         `status.replicas`, "the most recently observed number of non-terminating pods", and the
         chip turns over on the admission beat, so readiness is the one thing it may not claim.
CONTENT  The kubectl cells read `Pending` on persist for the SAME reason, and `Running` is what they
         may not say. Pod Lifecycle defines Running as "the Pod has been bound to a node, and all of
         the containers have been created", and this card draws no Node, no scheduler and no Kubelet,
         so the write it does draw cannot produce that state. Pending is the phase that covers it:
         "the Pod has been accepted by the Kubernetes cluster, but one or more of the containers has
         not been set up and made ready to run. This includes time a Pod spends waiting to be
         scheduled." Both words are 7 characters, so the cell geometry is untouched by the choice.
CONTENT  `admission itself adds that 500m to used` is the quota step's load-bearing claim and it is
         the reference's own: Admission Controllers says admission controllers "may sometimes have
         side effects, that is, mutate related resources as part of request processing. Incrementing
         quota usage is the canonical example of why this is necessary". The same paragraph is why
         the card must not say the increment is the whole story, since it continues "any such
         side-effect needs a corresponding reclamation or reconciliation process": kube-controller-
         manager runs a resourcequota controller that recalculates usage on its own period. The step
         states the admission increment and claims no exclusivity, so no clause is owed.
CONTENT  The 403 chip and the ack wire QUOTE the API rather than paraphrasing it. `exceeded quota`
         is the apiserver's own `fmt.Errorf("exceeded quota: %s, requested: %s, used: %s, limited:
         %s")`, and Resource Quotas gives the status: "the control plane rejects that request with
         HTTP status code 403 Forbidden". The other refusal the quota system can answer,
         `must specify %s` from the Pod quota evaluator, is NOT on this card: it belonged to the
         missing-request branch, and step 1 carries that argument in prose instead.
CONTENT  `ResourceQuota runs after every other validating plugin` is true and NO kubernetes.io page
         says so. The order is the apiserver's own `AllOrderedPlugins`, which ends
         MutatingAdmissionWebhook, ValidatingAdmissionPolicy, ValidatingAdmissionWebhook,
         ResourceQuota, AlwaysDeny, under the comment "webhook, resourcequota, and deny plugins must
         go at the end". Admission Controllers carries only the other half, that the
         `--enable-admission-plugins` order does not matter. The single thing after ResourceQuota is
         AlwaysDeny, a deprecated plugin that refuses every request and is never enabled, so the
         absolute ships without a qualifier rather than spending a clause naming it. The tail of the
         list is MutatingAdmissionPolicy, MutatingAdmissionWebhook, ValidatingAdmissionPolicy,
         ValidatingAdmissionWebhook, ResourceQuota, AlwaysDeny, and LimitRanger sits sixth from the
         top, which is what puts ladder row 2 ahead of row 3. `cluster-admission-chain` states
         the same order in prose and the two cards agree.
CONTENT  Every drawn value re-checked against the reference. LimitRanger is typed "Mutating and
         Validating" and ResourceQuota "Validating", which is the whole of why one appears on two
         ladder rows and the other on one. `default`, `defaultRequest`, `max`, `maxLimitRequestRatio`,
         `min` and `type` are the complete `LimitRangeItem` field set, and `defaultRequest` is
         defined as "the default resource requirement request value by resource name if resource
         request is omitted", which is step 1 exactly. The ReplicaSet condition is `ReplicaFailure`
         with reason `FailedCreate`, both set in `replica_set_utils.go` when a create is refused.
         `web-2 lands the sum exactly on the ceiling` and is ADMITTED because the quota table reads
         "the sum of CPU requests cannot exceed this value", so equality passes.
CONTENT  Step 1 argues the injection per POD rather than per container, which is the docs' own
         framing: "you and other clients, must specify either requests or limits for that resource,
         for every new Pod you submit. If you don't, the control plane may reject admission for that
         Pod." The card says `cannot count` rather than `is rejected`, which keeps the docs' hedge
         and gives the reason. It is also correctly narrow: the same page says that for resources
         OTHER than cpu and memory a quota simply ignores a Pod that sets neither.
NOT A DEFECT  The `ReplicaSet web` chip reports a COUNT on four steps and a CONDITION on the fifth,
         `3 desired · 0 created` then `3 desired · 2 created` then `ReplicaFailure · FailedCreate`.
         `P-02` is not broken by it: this chip is named for the OBJECT, not for a field, the way
         `spec.hard` and `last admission` are named for theirs, so both readings are news about that
         ReplicaSet. What it costs is real and is paid on purpose: the final frame does not show
         `2 created`. The alternatives both fail on measurement. A fifth chip breaks the 2 x 2 grid,
         whose second row already ends on the 624 rail the category shares, and one value carrying
         both runs `3 desired · 2 created · ReplicaFailure` at 41 characters against a 532 chip whose
         name already spends 14, which `P-07` will not take.
NOT A DEFECT  On the quota step the cue is on screen before the value it announces. `lit` puts
         `.highlight` on the two chips at entry while `rewind` has just set them back to what step 3
         left, so for the first 500ms `status.used` reads `requests.cpu 0` under a highlight, and
         `last admission` until 2000ms. That is the shape `P-03` asks for (pin the end value, wind it
         back, turn it over on the ball) meeting a cue that has no beat of its own: an `F.set` can
         carry `lit`, but `flowLights` derives only a `lights` list, so a deferred cue would light
         nothing on the reduced, prev and reset paths. `report/arrival.test.mjs` prints it as the one
         R2-ENTRY row this card still carries.
NOT A DEFECT  The ladder names webhooks only on its validating row and does not draw mutating
         webhooks at all. The phase column carries the qualifier, and cluster-admission-chain owns
         the whole chain and agrees word for word: `ResourceQuota runs after all of them`.
NOT A DEFECT  The `desc` opens on a Deployment no step draws. It is grid and search text that no
         dialog reader ever sees, and the ReplicaSet on the card is the one a Deployment owns.
NOTE     Why hard is requests.cpu 1 and every Pod asks 500m: the numbers come off the LimitRange
         page's own worked example, so the injected default IS the arithmetic and step 2 is
         load-bearing. Two 500m Pods land exactly on the ceiling, which is why admit animates TWO
         beats. There is no set of equal requests that rejects on the second Pod without leaving the
         first short of the ceiling.
NOTE     The gap between the two actors is the family 56, so `A-11` has no duration to raise: 56 at
         PKT_SPEED 0.45 is 124ms, under the 700ms PKT_DUR_MIN floor, and every packet reads at 700.
         Measured spans: 1260, 0, 0, 2560 and 1760 against durations of 3200, 2600, 2600, 5600, 4200.
NOT A DEFECT  The ball is SLOW, and the number is the floor rather than this card. 56 units in 700ms
         is 0.080 units per ms against the PKT_SPEED canon of 0.45, and `cluster-static-pods` and
         `storage-configmap-secret-mount` run the identical 56 at the identical 0.080.
         `cluster-node-drain` and `cluster-graceful-node-shutdown` are NOT on that list: both
         right-align their far block on CONTENT_R and their top hops read 192 at 0.274.
         `cluster-leader-election` is not one either, it runs 130 at 0.186. Most of the catalogue's
         balls are floor-bound the same way, and `pace.mjs` prints that share beside the median ball
         speed. Raising it here alone would make this card faster than the two siblings still on
         56, and raising `PKT_DUR_MIN` moves every one of them (`M-13`).
NOTE     The ladder IS column 2, 780..1140, rather than the family 480 or the 400 it carried while
         the top had a grid of its own. DEVIATION, deliberate: its longest row inks 337.7 units at
         1600x1000 and the rows start at 790, so 12.3 of trailing space where 400 left 52. Rendered
         at all three viewports before it was kept: the longest row reads as filling its box rather
         than as overflowing it. It does not buy the API a shared centre, because the actor pair
         left the column grid, and the L-shaped tie is what pays for that instead.
NOTE     The ladder is the admission ORDER and the steps walk it, one row per step in turn. The
         anchored note on the STEPS_SPEC header carries the telling this rejects and where each
         piece of its payload sits instead.
NOTE     The three request blocks carry STROKES only, fill overridden to transparent so the soft box
         fill does not double up over the bar. Every block takes the bar's own rx 6.
WHY NOT  rx 0 on the slots, which is what they carried while the row was read as ONE bar filling up:
         square slots inside a rounded bar make the first slot borrow a rounded left end off the bar
         behind it and keep a square right one, so the same block had two different corners depending
         on where it stood. The row is now read as three blocks against a ceiling, which is what the
         cell under each of them already said.
NOTE     The refused block is the only dashed one, because it is a request that never became an
         object, and its position past the bar edge means "did not get into the budget". It lands on
         OPACITY.pending, not 1, which is why it comes up through an `F.fade` from 0 to
         OPACITY.pending over REVEAL_MS rather than through `F.reveal`: `revealAt` always ends at 1
         by construction, and a thing never created must not.
DO NOT   Draw the ResourceQuota object as a second box. It IS the bar, captioned with its own name,
         because a quota is a budget and a budget is a length. A block plus a bar puts two
         representations of one object on the same card.
DO NOT   Tie the kubectl cells to each other, or to the caption, with a relation. Three were drawn
         for exactly that once, to hold a column rhythm, and a relation standing for no relation is
         not a lane: terminal output is a list, and rows of it joined by dashed connectors read as
         flow. Adjacency to the block above says everything those three ties were reaching for.
WHY NOT  Three actors at the family 232 in the top row: 3 x 232 + 2 x 56 is 808 against the 720 units
         right of the panel. The fix was not to shrink the family. LimitRange is an OBJECT, nothing
         travels to or from it on any step, so it left the row and the two that remain are at 232.
OPEN     The brace spans all five ladder rows, so it says the LimitRange is read by all five. Only
         rows 1 and 2 read it: they are the LimitRanger plugin, at its two positions in the chain,
         and they are exactly the two steps that light the block. Rows 3, 4 and 5 are policies,
         ResourceQuota and the ETCD write, and none of them looks at a LimitRange, so the picture and
         the highlight disagree for three steps out of five. Held open as a deliberate choice of
         grouping over precision.
         Closing it is NOT the two brace arguments alone. `braceD` needs `y2 - y1` of at least
         `4 * q`, and rows 1 and 2 are 74 against the 120 that `BRACE_Q` 30 demands, so
         `braceD(768, 152, 226, 30)` emits `v -23` twice and folds the brace back through itself.
         `BRACE_Q` has to come down to 18 or under, and with the nose then on 189 rather than 252,
         `LR_CY` and the stub move with it or the stub ends 63 below the nose on blank canvas. The
         real price is `BRACE_Q`, `LR_CY`, `LR_Y` at 149..229, and every SIZES number re-measured.
OPEN     The ReplicaSet box starts at 340 and the panel reaches 396.55 at 1100x800 and 377.76 at
         1280x860, so its left BORDER is behind the panel on the two smaller viewports, by 56.55 and
         37.76 of a 232 box. `report/geometry-soft.test.mjs` scores it OCCLUDED at 24 percent, one
         of the three the whole catalog carries, and the cost is visible rather than numerical: at
         1280x860 and 1100x800 the box reads as clipped by the panel. No TEXT is lost, both its
         strings being centred on 456 and inking 411.2 at the earliest. Held open rather than closed
         because centring the pair exactly is the requirement and the panel is the thing in the way:
         `RS_X` is `600 - 28 - 232` and there is no term in it to move. Closing it means giving up
         either the exact centre or the family 232.
WHY NOT  Pushing the pair right until the ReplicaSet clears `L-03` at 420. That is what it carried
         for one pass and it centres the pair on 680 against the canvas 600, which is 80 of the
         right-lean the move was made to remove.
WHY NOT  Shrinking the two actors so a centred pair clears the panel. `RS_X` is `572 - BOX_W`, so
         clearing 396.55 needs BOX_W under 175.45 and clearing the `L-03` 420 needs 152. At 152 the
         widest actor string, `admission pipeline` at 108.5, keeps 21.75 a side, but the row would
         then stand 80 narrower than the LimitRange under it, which is the same family 232.
WHY NOT  Filling the band x 60..420, y 255..384, the void the panel leaves under itself. The ladder
         fixes the floor of everything above the bar at y 352 and the LimitRange is deliberately only
         as tall as the two rows it feeds. The band held a counterfactual caption until that whole
         step left the card, and nothing has been put back: the void under the panel is the panel
         drawn, not space waiting to be filled.
WHY NOT  A namespace drawn with node(): the frame class is .scheme-node and .scheme-node-label is
         uppercase catalog-wide, so it renders NAMESPACE TEAM-A on a frame the geometry rules treat
         as a Node.
WHY NOT  A relationPath from the ladder down to the bar: the bar's top face midpoint is 420, exactly
         the seam between slot0 and slot1, so the lane would land on a join rather than on a face.
WHY NOT  Drawing `kubectl get pods -n team-a` on the canvas at all. It was a boxed chip first, which
         put a FOURTH thing in a row of three, then a tag on a caption register of its own, which
         bought 30 units of height for one string that names the row rather than saying anything
         about it. The persist step speaks the command, so the row is identified in prose and the
         height goes to closing the gap the chips stood over.
WHY NOT  Spending the freed 30 units below the chips instead of above the bar. The cluster chip strip
         ends on 624 catalog-wide (`L-24` measures Node frames against that same rail), so the strip
         cannot move down and the whole budget group moved DOWN by 20 instead. What grew is the band
         at y 226..396, which is the void the panel leaves under itself, and it is the one band on
         this card where a bigger gap costs nothing.
```

### before `// Five steps over five ladder rows, in the pipeline's own order: step N lights row N. The card`

```
THE STEPS ARE THE LADDER. Five steps walk the five admission rows in the pipeline's own order, so
step N lights row N and every row is used: mutating, LimitRanger validating, policies, ResourceQuota,
persist. `cluster-admission-chain` is the card this shape is copied from, and it does the same
thing with `chain: [0]` through `chain: [4]`.

WHY NOT tell a quota STORY over five steps of its own: the quota
object, the LimitRange, the admit, the reject, and a counterfactual with no LimitRange. Against a
ladder that is the admission ORDER that story lights row 4 four times, rows 3 and 5 never, and jumps
back up to rows 1 and 2 in the middle. Two rows are then drawn and dead, and the numbering reads as
though it counted the card's own steps.

WHERE THE PAYLOAD SITS, because none of it is dropped. The ceiling and the running sum are step 4,
which is the row that owns them. Both admissions and the refusal are step 4 as well, because row 4 is
where all three verdicts happen: `F.reveal` on slot0, then a packet per Pod, then an `F.fade` to
OPACITY.pending on the refused block. Step 5 is persist, and it is what splits ADMISSION from
EXISTENCE: the budget is charged at row 4 and the kubectl row only fills at row 5, so the two cells
that were written turn Pending there and the third goes to `No Pod object` on the same beat.

WHAT WAS LOST. The counterfactual step, and with it the card's only `T-35` sign. It played a state
that never happened (both slots gone, used back to 0, the whole row absent, the LimitRange ghosted)
to argue that a LimitRange is structural rather than convenient. That argument is now one clause in
step 1, `once a quota constrains requests.cpu, a Pod naming neither requests nor limits is a Pod the
quota cannot count`, on the row where LimitRanger actually acts. The card draws no
counterfactual, so `T-35` has nothing to say about it either way.

WHY NOT a sixth step carrying the counterfactual and lighting row 1 again. It restores the argument
and costs the property the rebuild was for: five steps against five rows, one to one, with no step
left over and no row lit twice out of turn.
```

### poster

```
Sentence: two requests fill the ceiling exactly, and the one past it is refused. A segmented
budget bar carries the premise and a break carries the payload. The track spans 20..196 and is
divided at 108 into the two 500m that land exactly on spec.hard, so it is drawn FULL rather than
part filled: being full is why the third is refused. The ceiling tick sits on the track's right edge
and runs 36..144, overshooting the 76 unit track top and bottom so it reads as a ceiling rather than
as another internal rule. Past it, one dashed block of the same height, crossed by an X.

The two occupied slots carry the house 0.3 bar and the refused block carries no bar at all. The
accent is the break, which is the family's own way of saying refused, and an empty block is what
that request produced. One accent, and it is a shape rather than a fill. No arrowheads, no text, no
actors, no ladder: direction is not part of the sentence, the tick and the X are.

DEVIATION, deliberate. The category draws a break at `opacity="0.55"` and the inherited 1.4, on
`cluster-pod-priority-preemption` and `cluster-node-pressure-eviction`. This one is 2.4 at full
strength, because on both of those the X is a supporting mark beside a bright accent bar elsewhere,
and here it IS the only accent: at 0.55 the two 0.3 slot bars would outweigh it and the poster would
land on the budget rather than on the refusal. The vocabulary is the same and the weight is not.

WHY NOT a bar over a row of cells, which is what the card itself now draws: that is the literal
miniature `R-10` forbids, it makes the poster redundant with the card, and a second row of three
cells is unreadable at 200px. WHY NOT a 0.9 accent bar inside the refused block: it says "this one
matters most" where the card says "this one never existed", and it leaves the refusal expressed by
position alone, which the eye reads as "further right" rather than as "denied". WHY NOT 0.14 on the
occupied slots: measured on the true-size render they disappear, and with no visible occupants there
is no budget and the ceiling is an arbitrary line.
```
