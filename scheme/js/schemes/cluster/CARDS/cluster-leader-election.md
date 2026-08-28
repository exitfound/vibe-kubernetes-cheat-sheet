## cluster-leader-election

### layout

```
WHAT     Three replicas racing for one Lease, and the renewals and failover that follow.
PANEL    x<=397 catalog-wide (`L-02`). Bottom 130.43 at 1100x800 step 0, shallowest 90.23 at
         1600x1000 step 2, which is the SHALLOWEST panel in the catalogue (`L-04`) and the reason
         this card is the one that reaches the floor of the band. Replica row 1 at y 145 clears the
         deepest bottom by 14.57.
LANES    One request lane and one answer lane per replica, on that replica's own axis. `PUT` and
         `ACK` are built ONCE, one array per replica, and the `P.lane` and the `F.route` both index
         them, so the drawn wire and the ball it carries are the same array (A-02 SHARED). All 16
         routes on this card read them and none is carried.
         The six lanes are KEYED `put1..put3` / `ack1..ack3` so a step can shade them. `stage(r1)` is
         the single factory for the whole `opacity` field, blocks and lanes together (A-16), and it
         gives replica 1 its pair through `laneOf(r1, 1)` (A-13). Without the keys nothing can address
         a lane at all, and an unreachable replica keeps two full-strength arrows into the Lease.
DO NOT   Turn them back into `f(cx)` factories that build the points at the call site. The lane and
         the route are then two equal copies, and the first geometry edit moves one of them: that is
         exactly the defect the DO NOT below names, one level further up.
MOTION   On `expire` the dead leader and its two lanes fade on ONE timing, `FADE.out` at delay 0, so
         the three read as a single event. Pinning the lanes statically while the box fades snaps them
         dim 700ms before it and reads as two separate failures.
MOTION   `LANE_RUN` 130 is a PACING number, not a spacing one. All 16 balls run 130 units at 0.186
         units per ms, under the catalogue's median ball, which `pace.mjs` prints and ranks. The run is
         still under `routeDur`'s 315 unit floor (`M-13`), so every ball takes the 700ms minimum and
         no span moves with the geometry (`M-20`): 2060 / 2060 / 700 / 2060 against durations
         2700 / 2700 / 2200 / 2700.
MOTION   Every Lease field the winning write produces turns over ON that write landing, at the same
         `wins` arrival that lights the box. `rewind` holds the record the step opens on and one
         `F.set` settles the lot together: `holderIdentity`, `renewTime age`, `leaseTransitions`,
         the role chip of each survivor and the winner sublabel. On `renew` the one field the PUT
         produces is `renewTime age`, at `renewal`. The cue is separate from the turnover and lands
         at entry through `lit`, because `flowLights` derives only a `lights` list and a deferred
         cue would light nothing on the reduced, prev and reset paths.
WIRE LABELS
         One slot per replica at mid-run, and it serves BOTH lanes of that pair, so what it carries is
         whatever the exchange RESOLVED to. That is deliberately not one grammar: on `acquire` and
         `failover` the news is the status code, because it is what says who won the race
         (`POST 201 Created` / `POST 409 AlreadyExists`, `PUT 200 OK` / `PUT 409 Conflict`), and on
         `renew` no code is news, so the slot names the call instead (`PUT renewTime`, `GET Lease`).
         Do not normalise the two.
         The REASON word is load-bearing and not decoration. The two 409s are different errors: on
         `acquire` it is `AlreadyExists`, a duplicate CREATE, and on `failover` it is `Conflict`, a
         `resourceVersion` mismatch on an UPDATE. A bare `409` in both slots draws one error twice.
         MEASURED at 1100x800: `POST 409 AlreadyExists` inks 135 units, `w2` running 622..757 and `w3`
         872..1007 against a content edge of 1140 and the mgr-3 lane pair at 840 and 860.
WHY NOT  One shared horizontal corridor for all six CAS routes. Every PUT then lies on top of its own
         answer and it is unreadable which answer belongs to which replica.
WHY NOT  A replica row at 420..1140 while the Lease and its chips span 60..1140: the bottom then reads
         as a different object from the top, and the drawing centres on 780.
WHY NOT  Moving the three Lease field chips into the free bottom-left as a column: it destroys
         "fields grouped directly under their object", which is the entire bottom half of the card.
NOTE     The replica row clears the PANEL, not the canvas centre. `REP_Y` is 145 against a measured
         panel bottom of 130.43 at 1100x800, a clearance of 14.57, so the band is 145..575 and its
         centre 360 against the canvas centre of 320. The four-line narrations under BUDGET are what
         buy that top: at five lines the panel measures 155.28 and `REP_Y` can only be 170.
WHY NOT  Raising it further on its own. `REP_Y` is panel bottom + 15 and the row is centred, so its
         left third stands in the panel column (right edge 396.55). A band centred on the canvas
         needs its top at 105, which is under the panel on EVERY viewport: this card's shallowest
         measured panel is 90.23 at 1600x1000 and 130.43 at 1100x800. Strictly centred and
         horizontally centred cannot both hold with a band this deep.
WHY NOT  Clearing the panel column instead, `STACK_L` 240 to 400 with `REP_Y` 105. It is the one
         arrangement that reaches the canvas centre exactly, and it pays with the horizontal one: the
         drawing then spans 400..1120, 340 of margin on the left against 20 on the right, and the
         bottom left is a 340 x 430 void. The numbers are off a render of that arrangement.
WHY NOT  Buying it back by shrinking the Lease bar from `LEASE_H` 80 to 60. It recovers 20 of the 74
         the longer lane spends and moves the centre 360 to 350, and it costs the card its anchor: the
         Lease is what the drawing is about and would become the one block shorter than the three
         replicas it serves.
WHY NOT  `LANE_RUN` 150, which takes the band to 145..595 and the balls to 0.214 units per ms, still
         under the catalogue median ball. It buys 0.028 units per ms for 10 more units of centre
         drift, 360 to 370, and leaves 45 units under the band where 130 leaves 65.
WHY NOT  A dog-leg route per replica, lengthening the path without moving the Lease. `L-09` allows
         horizontal and vertical segments only, so the extra length is a horizontal jog on each axis,
         which is the shared-corridor defect the WHY NOT above names, one lane at a time.
BUDGET   THE VERTICAL IS A TRADE WITH THE NARRATION, and the arithmetic is the point. With the column
         centred the row sits under the panel, so the band top is panel bottom + 15 and every
         narration line costs 25 units of viewBox at 1100x800. The band is a fixed 430 deep below that
         top (80 box, 12, 34 role chip, 130 lane, 80 Lease, 16, 34 holder chip, 10, 34 field row), so
         it TRANSLATES and its centre is `REP_Y + 215`, one line being worth a full 25:
           7 lines  panel 205  REP_Y 220  band 220..650  centre 435, off the canvas
           6 lines  panel 180  REP_Y 195  band 195..625  centre 410, 90 low
           5 lines  panel 155  REP_Y 170  band 170..600  centre 385, 65 low
           4 lines  panel 130  REP_Y 145  band 145..575  centre 360, 40 low   <- shipped
         All four narrations are written to hold four lines (150 to 165 characters), and the LINE COUNT
         is the limit while the character count only tracks it: see the panel entry under CONTENT, where
         a 205 character clause took step 3 onto a sixth line. Three lines is NOT taken. Getting from
         five to four spent what the DRAWING already carries: the two 409 answers on `w2` and `w3`, the
         loop list in the `r1` sublabel, and the `holderIdentity` and `leaseTransitions` turnovers,
         both of them chips with a cue. Nothing redundant is left, so the next line comes out of a
         qualifier, which is the failure this project has already paid for once, and it buys 25 units
         of centre.
         40 low is the price of the lane length under MOTION and it is inside the house reading.
         Measured over every card scene as the min and the max of every part `y` and `y + h`, the
         content bottoms sit near 620 and the vertical centres near 330, so a band
         ending at 575 with 65 clear and a centre of 360 sits just above the one and just below the
         other. Both are catalog-wide walks and both move with the catalog, so re-measure rather
         than trust the two figures here. State the METHOD beside any number taken this way, because
         a walk that also counts node frames and lane endpoints reads the extremes differently.
DO NOT   Let a narration grow past four lines. It silently pushes the panel onto the replica row, and
         nothing in the gate checks it: OCCLUDED would report the overlap but is not in the gate
         profile. At `REP_Y` 145 a fifth line takes the panel to 155.28, 10 units INTO the row.
DO NOT   Give a packet its own centre. The lane pair sits at `cx - 10` and `cx + 10`, so a ball built
         on `REP_CXS[i]` flies 10 units beside BOTH of its own dashed lanes and no check in the tree
         sees it. `PUT` and `ACK` are the only source of a route's points, and `exchange(i, name)` is
         the only thing that builds one.
CONTENT  The first acquisition is a CREATE, not a PUT. client-go Gets the lock and on NotFound
         CREATEs it, so the winner takes a 201 and the losers an AlreadyExists 409.
         Compare-and-swap on resourceVersion is the UPDATE path, which every renewal and the failover
         race use: `POST 201 Created` / `POST 409 AlreadyExists` on acquire against `PUT 200 OK` /
         `PUT 409 Conflict` on failover. The API conventions table gives 409 both readings, "the
         resource you are creating already exists" and "the requested update operation cannot be
         completed due to a conflict", so the code alone does not say which one the step drew.
         The standbys do NOT watch the Lease, they GET it: client-go calls Get on the lock every retry
         period (2s against a 15s lease), and there is no watch in that loop.
         failover lights BOTH survivors: mgr-3 races in that step too, sends a CAS-PUT, reports its
         409 and changes its role chip.
         renew answers as well: mgr-1's PUT rides its answer lane home like every other write here,
         because a replica on this card acts on the ANSWER rather than on the write, and leaving that
         one lane idle beside its loaded twin says the renewal was never acknowledged.
         The `renewTime age` chip is named for the AGE and not for the field. Lease v1 makes `renewTime`
         a MicroTime, so `fresh` and `stale` are not values it can hold, and the age is the quantity
         `leaseDurationSeconds` is measured against: `none`, `0s`, `2s`, `> 15s`, `0s`.
         That `2s` on `renew` is the RETRY PERIOD, not half the lease. Coordinated Leader Election
         gives the cadence as an example, "performing renewal every leaseDurationSeconds / 2, in order
         to avoid conflicts when the Lease is about to expire", which reads 7.5s against this card's
         15s. What client-go runs is a renewal attempt every `--leader-elect-retry-period`, default 2s,
         repeated until `--leader-elect-renew-deadline`, so on a healthy holder the last successful
         renewal is about 2s old. Both readings sit well inside `leaseDurationSeconds`, which is all
         the narration claims, and 2s is the one the defaults this card draws actually produce. A
         reader following the cited page to 7.5s is the reason this is written down.
         Every replica box reports what it RUNS in its sublabel, because the card's whole claim is that
         only the holder runs the loops and a role chip leaves that said in words and never drawn
         (T-21). There are THREE states, not two: `no control loops` on a standby, `control loops
         starting` on the step a replica wins the Lease, and `Deployment · ReplicaSet · Job` once it is
         holding it. `acquire` and `failover` are the same event and read the same, and each agrees with
         the role chip directly under it, which reads `leader` on the winning step and
         `leader · reconciling` only once the loops are running. Nobody runs them on `expire`, which is
         what a lease duration of downtime costs.
         expire carries the RENEW DEADLINE, and that is the safety half of leader election: `A
         partitioned leader stands down at its renew deadline (10s)`. The kube-controller-manager
         reference is the page that states both numbers and their relation, `--leader-elect-renew-deadline`
         default 10s, "the interval between attempts by the acting master to renew a leadership slot
         before it stops leading. This must be less than the lease duration", against
         `--leader-elect-lease-duration` default 15s and `--leader-elect-retry-period` default 2s, and it
         is cited for exactly that. The word `partitioned` is load-bearing: a leader that CRASHED is
         simply gone and has no deadline to observe, so an unscoped `it stops leading after 10s` would
         be false of half the sentence it sits in.
         What that clause displaced, and why neither is a loss: `with no new renewTime` is on screen as
         the lit `renewTime age > 15s` chip, and `the Lease counts as expired` is what
         `after leaseDurationSeconds` already says. What it replaced IS a defect: `any replica may
         CAS-acquire it` contradicted this card's own `v1` chip, which reads `unreachable` on this step.
         The four-line wordings decline three clauses the DRAWING already carries, and none of the three
         is a loss. `so renewals stop` is the whole picture of `expire`, the dead leader fading with its
         two lanes over a lit `renewTime age > 15s`. `CAS-acquire` is `acquire` because the CAS is what
         the NEXT step names and draws (`PUT 200 OK` against `PUT 409 Conflict`). `the other two get
         409` is on `w2` and `w3` as `POST 409 AlreadyExists`.
         `crashes or is partitioned`, not `crashes or partitions`: a replica does not partition, its
         network does, and the passive keeps the subject the next clause needs (`A partitioned leader`).
         `crashes or its network partitions` says the same at 9 more characters and is declined only
         because the band above is 165.
         `the control loops resume there`, not `its control loops resume`. Controller-mgr-2 has never
         run them, which its own sublabel says on this very step (`control loops starting`), so `resume`
         is true of the CLUSTER and needs the `there`. `start` is rejected the other way: the loops
         coming back is what a lease duration of downtime costs, and that is the sentence's subject.
         The wording is PANEL-BOUND, not character-bound, and the two are different limits. The clause
         first shipped at 205 characters and took the panel to 180.12 at 1100x800, a SIXTH line, 10
         units past the `REP_Y` of 170 it had then and onto the replica row. The gate stayed green.
         The wording now measures 155 characters and 130.43, the same four lines as the other three
         steps. Re-measure the panel after any edit here, never the character count.
         The `desc` does NOT carry the renew deadline. It stands at 460 of the 470 hard ceiling (D-04),
         and the clause does not fit: this is a bounded summary declining a secondary fact the narration
         states in full, not a qualifier cut to fit a band (T-20).
         `holderIdentity` draws the replica name. client-go writes `hostname_uuid` there and the Leases
         page shows that shape, but the field takes any string and the card owns its replica names, so
         the honest identity would name a host this drawing does not have.
         What the chip may NOT carry is a marker. `Controller-mgr-1 (stale)` is rejected for the reason
         `renewTime age` exists one row down: a chip named for a field states what the FIELD holds, and
         `holderIdentity` is a string the API never decorates. Staleness is the neighbouring chip's job,
         `renewTime age` reading `> 15s` against `leaseDurationSeconds` 15s, and both are lit together.
         `POST 409 AlreadyExists` on the two losers is the SIMULTANEOUS race, which the step draws and says
         (`All three replicas race`). In the staggered case a loser Gets a live Lease and never writes at
         all, so it takes no status code: that is a different picture, not a correction to this one.
         Read against the release `k8sVersion` declares. `leaseDurationSeconds` is "a duration that
         candidates for a lease need to wait to force acquire it. This is measured against the time of
         last observed renewTime" and `leaseTransitions` is "the number of transitions of a lease
         between holders" (so 0 on create and 1 on failover), both off Lease v1, where `renewTime` is a
         MicroTime. Acquisition is optimistic concurrency on `resourceVersion`, "only one update
         succeeds due to version mismatch on concurrent attempts", and a Lease is expired when
         "current time > renewTime + leaseDurationSeconds" (Coordinated Leader Election). The status
         codes are Lease v1's own operation lists, create 201 and replace 200, against the API
         conventions table where 409 covers BOTH "the resource you are creating already exists"
         (AlreadyExists) and "the requested update operation cannot be completed due to a conflict"
         (Conflict).
         The 15s / 10s / 2s defaults are `--leader-elect-lease-duration`, `--leader-elect-renew-deadline`
         and `--leader-elect-retry-period`, with `--leader-elect-resource-lock` `lease`,
         `--leader-elect-resource-namespace` `kube-system` and `--leader-elect-resource-name` the
         component name. The kube-controller-manager reference page truncates before its flag table on
         a plain fetch, so the values are read off the kube-scheduler page, which carries the identical
         component-base flags and defaults, and the component name there is `kube-scheduler`.
NOTE     The Lease box is drawn at idle although the object does not exist yet, deliberately. Dimming
         it and its four field chips for one step a reader never sees on its own (the poster occupies
         that position) would cost the card its anchor: the Lease is what the drawing is about. The
         create is said in words instead.
NOTE     A replica role chip and `holderIdentity` are ONE fact seen from two sides, so the winning
         arrival turns both over on the same beat instead of standing one of them at entry: `P-04`
         calls doing this to one and not its neighbour worse than doing it to neither. The winner
         sublabel is that same fact a third time, in the box 12 units over its own role chip, so it
         travels with the pair. MEASURED: the winning write lands at 700 on `acquire` and on
         `failover`, every ball here sitting on the `routeDur` floor, so a split anywhere in that
         group holds two readings of one fact on screen for 700ms.
NAMING   The lane helper is not called `casPut` or `leaseWrite`. WHICH call rides it varies by step:
         acquire is a create (201, or AlreadyExists 409 for the losers), renew and failover are
         compare-and-swap on resourceVersion (200, or Conflict 409), and the standby poll is a plain
         GET. Each of those names excludes at least one of the three.
WHY NOT  `Deployment · ReplicaSet · Job` on the `failover` winner, so the card ends on a replica visibly
         working. It disagrees with three things the same card already draws: the `leader` role chip 12
         units under that box, which is this card's not-yet-reconciling reading, the narration giving the
         loops about a lease duration to come back, and `acquire`, where the identical event reads
         `control loops starting`. The running state is not lost by declining it, `renew` holds it for a
         full 2700ms. The two strings also measure differently in the 220 box, 135 against 177.9 at
         1100x800, so the starting reading is the one with room to spare.
WHY NOT  Settling the Lease fields alone on `wins` and leaving the three role chips and the winner
         sublabel at entry. MEASURED off the specs: the card then carries 6 FORM-E records instead
         of 3, and the 3 it gains are unread, which is what `unit/chip-beat-e.test.mjs` fails on and
         prints as `3 FORM-E finding(s), P-03 and P-04`. Catalogue-wide it reads FORM-A 495 against
         492, FORM-B 333 against 330 and FORM-E 22 against 19, which is also the number of entries
         `E_CARRIED` holds. Quarantining the three new records there buys the green run back and
         buys nothing on the canvas: for the 700ms of the winning write the role chip under the
         winner reads `leader` over a `holderIdentity` still reading `none` on `acquire` and
         `Controller-mgr-1` on `failover`. Splitting the group the other way, the sublabel
         at entry with the role chip on the beat, reads `control loops starting` in the box over a
         role chip that still reads `standby`.
NOT A DEFECT
         `holderChip` is cued on `expire` while `holderIdentity` does not change at all: it reads
         `Controller-mgr-1` before the step and after it. The cue is not a change marker here, it is the
         READ SET. `expire` runs no packet and no Pod, so its five `.highlight` targets are the entire
         beat the step has (M-27), and the whole statement of the step is the pair `holderIdentity`
         still naming a replica that is gone over a `renewTime age` past `leaseDurationSeconds`.
         `durChip` and `transChip` are unchanged too and are NOT lit, so the set reads as what the step
         is about rather than as what moved, which is the reading `P-04` asks for consistency in.
         Do not strip the cue to make the set mean "changed": the step then lights `renewChip` alone and
         the holder half of the sentence goes unmarked.
NOT A DEFECT
         `renew` states all three role chips at entry while `renewChip` waits for the PUT to land, which
         is the split `report/chip-beat.test.mjs` prints as FORM-E and `unit/chip-beat-e.test.mjs`
         gates. All three are carried in `E_CARRIED` with the reason, which lives there and not here:
         the reconciling and the polling are what SEND the balls of the step, so they stand before
         anything departs, and the Lease record is what an arrival produces.
NOT A DEFECT
         `report/arrival.test.mjs` prints one R2-ENTRY row for this card, `holderIdentity` changing at
         `renew` with no highlight. It is the artefact that file documents in its own comment: the axis
         compares two frames frozen at t=0, so a value turned over MID-step is first seen at the step
         AFTER it, where the cue has legitimately already been shown and cleared. `cluster-etcd-raft` and
         `cluster-server-side-apply` carry the identical row for the identical idiom. R2-STEP, the axis
         that answers the canon question, holds 7 findings and none of them is here.
```

### poster

```
Sentence: three want it, one has it.

Three 80 x 46 replica blocks across the top, the middle one lit (0.10 against 0.04) and carrying the
accent bar at 0.9 while the other two carry it at 0.3. Below them one 240 x 52 Lease block holding a
row of FIVE 34 x 24 slots of which exactly ONE is filled, sitting under the middle replica. All
three legs stop on the Lease top edge at y=112, and the holder is told apart from the standbys by
WEIGHT rather than by reach: its leg is the one SOLID line at full opacity, the two standbys drop
dashed at 0.4.

Every leg stops on that face and none runs inside the block: a line crossing a frame it is not a
member of reads as a lane threaded through the Lease rather than as a claim on it, and every other
leg in the catalog terminates on the face it addresses. Do not run the holder's leg down to y=126,
the top of its slot, to strengthen it. Two signals separate the holder without it, solid against
dashed and 1.0 against 0.4, which is what the two side legs already carry and enough at 200px, and
the filled slot under that leg is the third and loudest.

Five slots rather than three on purpose: three would sit one under each replica and assert that every
replica has a slot of its own, which is the opposite of what a Lease is.

The bright block is the MIDDLE one while the card elects the leftmost replica. Deliberate: the poster
blocks carry no names, and handing the win to the left block would put the one bright element on the
edge and send the solid leg across two other legs to reach the slot.
```
