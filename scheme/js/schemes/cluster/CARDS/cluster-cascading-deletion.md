## cluster-cascading-deletion

### layout

```
WHAT     A cascading delete: deletionTimestamp and a finalizer instead of removal, the Garbage
         collector walking ownerReferences, and the finalizers clearing up the chain.
LAYOUT   ONE grid with cluster-object-create-path, to the unit: both frames 150..1050, the control
         plane 90..440 and the Node 475..628, the top row at 140, tier 2 at 328, the Node row at
         NODE_Y + 41. Every block is the catalog 220 x 80 except the two 130 wide flanks, ETCD and
         the client. The two cards run the same shapes at the same lengths and every ball on this
         card has cluster-object-create-path in its `pace.mjs` siblings column.
LAYOUT   The client is the ONE block outside a frame, in the 150 unit band the control plane leaves
         on the right, 10 clear of each side. Its lanes therefore address the FRAME, climbing over
         the top at 50 and 70 and entering the wall at CX +/- 10, which is what takes it out of the
         panel column entirely.
LAYOUT   Architecture's centre tier-2 column is left EMPTY, and that empty slot is what keeps the
         Node pair two straight verticals down the spine.
PANEL    Right 290.77 / 377.76 / 396.55 and bottom 177.44 / 213.92 / 254.66 over the standard set
         1600x1000 / 1280x860 / 1100x800, deepest on gc-cascade at 1100x800. The right edge ties the
         catalog worst L-02 records. The bottom swings 77.22 units between viewports on that one
         step, so nothing here may be measured on 1600x1000 alone.
PANEL    254.66 is a FLOOR that the tier-2 lane band sets, not a free number. JOG_DOWN sits at 264,
         and at 279.51 the panel covered the turn of TO_CM and the top of its drop into the
         controller-manager, so the arrowhead and its ripple appeared with no lane feeding them. The
         gc-cascade narration is what buys the 9.3 units of clearance: it is the longest on the pair
         and any growth there walks the panel back onto that lane.
SIZES    Every block on the card is one of two widths, 220 or 130, and one height, 80. The Pod is
         the exception the catalog allows, 220 x 106, centred on the Kubelet line so the two share
         LANE_Y by construction.
MOTION   The durations are sized off READING LOAD, not off the motion: 3000 / 2500 / 3000 / 4000 /
         2500 / 4100 / 3200 against narrations of 217 / 245 / 200 / 356 / 228 / 329 / 316
         characters, a band of 10.13 to 15.00 ms per character, the whole of it above the catalog
         median (`report/baselines.test.mjs`).
         `delete-request` and `ack-response` are floored by MOTION rather than by reading: the
         client lane is 760 units and its return 680, so both spans run past 2200 and `M-19` sets
         3000, which is the number cluster-object-create-path reaches for the same two shapes.
         DO NOT drop any step under 10: the sister card holds 9.87 to 16.30 and a step below that
         floor is one this pair has nowhere to hide. `purge` is the tightest on the card at 10.13
         and stands 0.13 clear of it, so it is the step any further prose growth has to buy time for.
LANES    ONE lane pitch, LANE_DY 10, on all four pairs: the ETCD row at 170 / 190, the client pair
         at the frame wall, the tier-2 jogs at 264 / 284, the Node pair at CX +/- 10.
NOTE     WHICH LANE GETS WHICH SLOT on the API's bottom face (540 / 590 / 610 / 630 / 660) is FORCED,
         not chosen. TO_CM and TO_GC turn and run horizontally through the band, so each has to leave
         the face OUTSIDE the Node pair or it cuts across one of the two verticals dropping to the
         Node frame. The Node pair therefore takes the two innermost slots, at CX +/- LANE_DY.
         Verified by a probe intersecting every horizontal segment against every vertical one: ZERO
         lane crossings.
NOTE     The lone RETURN takes 630, which is not a mirror of anything. OFFEDGE exempts an endpoint
         within 18% of a face midpoint, and 18% of a 220 wide API is 39.6 units, so 590 / 610 / 630
         are out of its reach while 540 / 660 pass as a mirrored pair. cluster-object-create-path has
         no such slot because BOTH of its tier-2 boxes write back, giving it 560 / 640 as a second
         pair. Here the controller-manager only reads: step 4 has it stop issuing rollouts, so a
         return lane out of it would be an arrowhead with no traffic (`A-05`).
WHY NOT  FROM_GC on the midpoint at 600. The Garbage collector is on the RIGHT, so its return runs
         leftwards to reach 600 and crosses the Node return descending at 610.
NOTE     The Node pair addresses the Node frame's TOP face, not the Kubelet's. A watch stream arrives
         at a Node and a status report leaves one, and what the Kubelet does about it is drawn INSIDE
         the frame on its own step, along STOP_POD. The API, both frames and the canvas share one
         centre, so a pair straddling it by LANE_DY is vertical at BOTH ends.
WIRE LABELS
         FOUR registers, and which one a label takes is decided by the panel first and by the lane
         second. Measured at 1600x1000, the widest case for a drawn string.
         The two CLIENT labels share ONE register at y 34, centred at 862 on the level run they
         ride, and they can share it because they never share a step: the DELETE is step 1 and the
         202 is step 3. `DELETE /apis/apps/v1/.../deployments/my-app` inks 714.3..1010.7, 12.6 above
         the out lane at 50 and 39 inside the frame wall at 1050.
         The two ETCD labels sit BETWEEN their blocks in the 190 unit gap, the request above its out
         lane at 158 and the ack below its return at 208. Both requests ink 158.5 on 725.8..884.2,
         so each clears the API at 710 and the cylinder at 900 by 15.8. That gap is the BUDGET
         below.
         The two WATCH labels take T2_BELOW 428, centred under the box each event reaches: they ink
         187..373 and 827..1013 on y 416.8..431.4, 8.6 clear of the frame floor at 440 and 17 inside
         each column wall. Both carry the SAME string, because one MODIFIED event reaches two
         watchers and a label on a lane names the traffic on THAT lane.
         The Garbage collector RETURN cannot share T2_BELOW with its own watch label, so it sits 14
         below the JOG_UP lane it names, centred on that run: `DELETE replicasets . pods` inks
         683.9..856.1 on y 286.8..301.4, 2.8 under the lane at 284 and 26.6 above tier 2 at 328.
         DO NOT move it up to join the watch pair. A reader who takes that string off the TO_GC lane
         reads the API as issuing the DELETEs to the Garbage collector, which is backwards.
BUDGET   The ETCD request register holds 190 units between the API right face and the cylinder, so
         27 characters at 6.89 is its ceiling. `patch deletionTimestamp . rv=843` was 32 characters
         at 220.5 and inked 694.7..915.3, 15.3 of it over the cylinder cap, which stands at
         y 130..240 and so shares the register's own band. The rv belongs to the ack register on the
         step after it, which is where cluster-object-create-path puts the same number.
NOTE     The Garbage collector carries the sublabel `in controller-manager`. Two same-size boxes on
         one tier assert that it is a PEER of the controller-manager, and it is a controller inside
         it. The sublabel inks 126.6 against the block 220, so it costs the drawing nothing.
CONTENT  Step 2 says the Deployment is "marked for deletion", not "Terminating": Terminating is a Pod
         PHASE word and a Deployment carrying a deletionTimestamp has no such phase.
         Step 4 calls the ReplicaSet DELETE the foreground one and does NOT extend that word to the
         Pod. The collector picks the policy on one test, whether the item has dependents of its own:
         `attemptToDeleteItem` takes the Foreground branch under the comment "at least one owner of
         item has FinalizerDeletingDependents, and the item itself has dependents", and a leaf falls
         through to the default branch, which is Background because no finalizer stands on it. The
         ReplicaSet owns Pods and takes Foreground, the Pod owns nothing and takes Background, so the
         Pod never carries foregroundDeletion at all. The step also ORDERS the two DELETEs rather
         than fanning them out, because the Pod only becomes the dependent of a deleting owner once
         the ReplicaSet itself is stamped. No kubernetes.io page carries any of this, so it is
         checked against `pkg/controller/garbagecollector/garbagecollector.go`.
         Step 5 streams the event "down that watch to Node-1", so the sentence ends where the lane
         does.
         Step 6 anchors the grace budget on the POD being stamped, which is step 4 on this card, and
         never on the kubectl delete of step 1. Pod Lifecycle starts the countdown "when the API
         server records the Pod deletion", and step 2 stamps the Deployment rather than the Pod, so
         a budget counting from step 2 runs two steps early. A budget the Kubelet STARTS is the other
         error and runs it late: the Graceful Pod Shutdown card this step points at says it "counts
         down from the moment of deletion", and that card deletes the Pod itself on its first step.
         Step 7 clears the finalizer off the ReplicaSet and then the Deployment rather than "up the
         chain": the Pod never carried foregroundDeletion, and its own record leaves ETCD on the
         grace period completing rather than on a finalizer.
         Step 7 has the API COMPLETE the delete it accepted five steps ago rather than issue a new
         one. Step 3 already returned 202 Accepted for it, and storage-pvc-protection settles the
         same mechanism the same way: "the API server completes the delete it accepted five steps
         ago and the record leaves ETCD". A second DELETE would need a second caller.
         Checked against the reference and standing unchanged, so a later pass need not re-fetch
         them: `--cascade=foreground` as a real flag value against a `background` default,
         `propagationPolicy=Foreground` carried in the DELETE body with that spelling, the
         `/apis/apps/v1/...` path, the `foregroundDeletion` finalizer name, the 202 the API returns
         on an object that carries finalizers, the automatic delete once that list empties,
         terminationGracePeriodSeconds defaulting to 30, and the Deployment controller returning
         `syncStatusOnly` the moment a deletionTimestamp appears, which is what "stops issuing
         rollouts" states. All three cited sources were opened and each still carries the sentence
         it is cited for.
         The desc leaves `blockOwnerDeletion` UNQUALIFIED where Garbage Collection adds "and are in
         the garbage collection controller cache". That caveat is a Note about resource types the
         cache cannot list or watch, the desc stands at 438 of 470 characters, and the clause does
         not fit without breaking a sentence that is already true (`T-20`).
NAMING   Titled `Cascading Deletion and Finalizers`; `cascading deletion` is the term kubernetes.io
         uses. The desc opens "You run kubectl delete and the prompt returns at once, so why is the
         object still there?" because app.js searches title + desc and the old title was the only
         place `kubectl delete` appeared. The id carries the TITLE, `D-02` keeps the category
         prefix, and `control-plane-delete-flow` and `cluster-delete-flow` resolve through
         `SCHEME_ALIASES` (`D-11`).
SCOPE    What the grace budget is SPENT on is workloads-graceful-shutdown's, and step 6 says so in
         words rather than drawing a preStop hook this card has no room for.
NOT A DEFECT
         The desc names `blockOwnerDeletion` and no step, label or wire on the card does. The term
         is the field that makes a dependent BLOCKING in foreground deletion, so it belongs in the
         summary, and drawing it would cost gc-cascade characters the PANEL floor above will not
         give back.
NOT A DEFECT
         `kubelet-stops` pulses the placedPod WRAPPER and declares no `reducedLit`, unlike the
         otherwise identical `create-pod` on cluster-object-create-path. The static path here
         already changes: `opacity` pins placedPod to OPACITY.terminating above the guard, so the
         Pod visibly dims. DO NOT add `placedPodBox` to close the symmetry, and note that this is
         why `placedPodBox` is not in `reset.keys` either: nothing on the card ever lights it.
NOTE     `purge` pins placedPod and kubeletPodArrow to 0 above the guard, which is the state a
         cancel or a replay must land on, and winds BOTH back through `rewind` to 0.25 and 1 on the
         animated path. Without the wind-back the pin hid the Pod and its arrow the instant the step
         opened, and the two `fill: forwards` fades then popped them back to full at `del` and faded
         them out again, so the last step read as a Pod appearing after it had already gone. The
         wind-back is what holds step 6 dimmed picture standing until the ball lands on ETCD at
         1662ms, which is where the delete actually removes the record.
OPEN     CENTRE 150..1190 centred on 670 and CENTRE-LOW 170..1190 centred on 680, the identical two
         numbers `cluster-object-create-path` reports for the identical reason. That record carries
         the reading and the DO NOT for both, because the two cards share one grid. What is this
         card's own: the re-centring it forbids would drag the frames off 600, which is what keeps
         the Node pair two straight verticals, and CENTRE-LOW judges against the panel bottom of ONE
         viewport, 177 at 1600x1000, where the worst-of-three bottom of 255 drops the finding.
         The pair stands against an OCCLUDED finding that would score the kubectl block 100% under
         the panel, and the trade is the point: a composition that leans 70 units off centre costs a
         reader less than an actor block the panel deletes on six steps of eight.
OPEN     The CONTROL PLANE frame label at (162, 108) is covered by the panel on every step and every
         measured viewport, exactly as on cluster-object-create-path and cluster-architecture, and
         for the same reason: the panel is 290.77 wide at its narrowest and the label inks from 162.
         It is the ONLY string on the card the panel touches, over 24 step and viewport samples.
         OCCLUDED cannot report it because the rule excludes node frames, and the instruction is the
         same as on the two sister cards: do not fix it by cutting narrations.
```

### poster

```
Sentence: the object is stamped for deletion and stays until the last entry holding it clears.

Two 120 x 120 blocks either side of one centre. LEFT is the object: an 88 x 88 solid block at fill
0.10 and stroke 2, standing INSIDE a dashed 120 x 120 stamp at opacity 0.55. Solid inside dashed is
the whole of it, marked but present, which is the question the desc opens with. RIGHT is the
finalizer list, a frame holding three 96 x 26 rows: the top and bottom ghosted, dashed and struck
through with one horizontal line, the MIDDLE one solid and carrying the single accent bar at 0.9.
One short dashed leg runs between the two outer faces at y=90.

Everything lands on that one line. Both outer blocks span y 30..150, so y=90 is the middle of each
of them, of the ink and of the canvas. The live row is the middle row FOR THAT REASON, not by
reading order: the leg then points at the one finalizer still holding the object, and the accent
sits at the strongest position on the right. The object carries the loser's bar at 0.3 on the same
band, so a single horizontal spine crosses the whole poster.

REPLACES a one-over-three cascade of fading: a ghosted owner block on top, three dashed legs in the
L form, three dependents below with bars falling 0.9 / 0.22 / 0.12 left to right. Closed on two
counts and not to be rebuilt.
  1. It drew the wrong half of the card. The desc asks why the object is STILL THERE and the answer
     is the finalizer, while that poster said the owner goes first and the dependents follow, which
     is the background cascade. Its ghosted owner said the object was already gone, the opposite of
     the hook.
  2. A bar gradient across a row is the catalog's grammar for RANK, not for time. The same ramp
     carries winner-against-losers on `cluster-scheduler-decision` and on
     `cluster-pod-priority-preemption`, and in grid order those two sit at one and two cards before
     this one, so the row read as `the first one won` rather than as deletion travelling.
The old note defended the skeleton reuse on MEANING, that scheduler-decision is about choosing and
this about disappearing. At 200px a reader sorts by silhouette, and the silhouette was the same.

WHAT IS LOST, deliberately: the dependents. Nothing in the frame now says ownerReferences or the
cascade the title names first. A poster says one sentence, the card's question is the finalizer, and
the cascade is what the seven steps are for. Do not add a dependent row back to cover the title.

The retired 0.12 measurement is not carried forward because nothing here is drawn at it. If a ghost
that faint is ever wanted again, it was checked on the grid at 100% rather than on a montage.
```

### before `    P.cylinder({ key: 'etcd', x: ETCD_X, y: TOP_Y - 10, w: FLANK_W, h: BOX_H + ETCD_OVER, label: 'ETCD' }),`

```
ETCD is FLANK_W 130, the same width as the client, so the two blocks flanking the frame read at one
scale and the label is not lost in a squat-wide cylinder. Top and height (y=130, h=110) come from
architecture's ETCD_OVER 30 and are byte for byte cluster-object-create-path's, which is what puts
the cap above the request register at 158 and the base below the ack register at 208.
```

### before `    lane(DELETE),`

```
Every lane is drawn here, each from the SAME points array its ball rides.

`unit/docs.test.mjs` verifies that an anchor points at code that still exists, NEVER that the sentence under
it is about that code. This anchor and its twin on cluster-object-create-path both carried a note about a
different lane for exactly that reason.
```
