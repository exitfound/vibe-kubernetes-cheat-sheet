## cluster-node-drain

### layout

```
WHAT     kubectl drain: cordon, list-and-skip, then eviction through the API with a
         PodDisruptionBudget gating it, a 429 and a retry.
LAYOUT   Layout C, the tallest panel in the category, top row MIRRORED: the API on CX and kubectl
         right of it at 908..1140, flush with the chip strip.
PANEL    x<=397, y<=304 at 1100x800 on the cordon step. Frame top 380, so 76 units of clearance.
BUDGET   NO STEP MAY EXCEED 528 CHARACTERS, and that is a property of the FRAME, not of the current
         text: trims that buy clearance do not raise the ceiling, because 380 is a route length and
         therefore a packet timing. Three narrations grown for accuracy put the panel at 404 at
         1100x800 and 456 at 1024x768, over the frame edge and its NODE-1 label, and
         the OCCLUDED report in `report/geometry-soft.test.mjs` stays CLEAN through all of that: it
         scores occluded AREA and a 25 unit strip off a 152 tall frame is under its bar. Pay for an
         edit inside the same step and do not trust the suite here.
WHY NOT  A bus inside the frame with a tap per Pod. Two lanes crossing the frame and splitting over
         the Pod row read as plumbing rather than as an eviction. WHICH Pod dies is carried by the
         pulse.
NOTE     The lane leaves the API, not kubectl: kubectl POSTs to the eviction subresource and the API
         is what reads the PDB, grants the 200 OK and DELETEs the Pod, which both evict steps say in
         those words. Same shape as workloads-force-deletion.
DO NOT   Put kubectl at 196..428, LEFT of the API: `report/geometry-soft.test.mjs` reports it
         OCCLUDED at 86 percent there. Panel right edge against that slot, measured:
           2560x1440 154, 0% covered      1920x1080 203, 3%      1728x1080 272, 33%
           1600x1000 291, 41%             1440x900 319, 53%      1280x860 378, 78%
           1100x800  397, 86%
         The crossover is around 1920, so the box would read whole on the widest screens alone.
         The mirror is what keeps it closed: OCCLUDED prints 1 finding catalog-wide and none of it
         is here.
         NOTHING ELSE MOVES WITH IT. The API stays on CX so the eviction drop is one straight line, and the
         drop, the ladder, the frame, the Pods and the chips are untouched. The lanes swap
         direction with the boxes, so the request runs right to left and the answer left to right.
         cluster-pod-priority-preemption took the same move for the same reason and its record
         carries the argument at length; cluster-graceful-node-shutdown already holds a requester
         at 908..1140 over the same 192 unit gap, so the mirrored row is the house reading here
         rather than this card's invention.
WHY NOT  Slide the row right without mirroring it. With BOX_W 232 and the panel reaching 397, a box
         LEFT of a centred API has 420..484 to live in, 64 units. The two layouts that close the
         occlusion are the mirror and a much narrower box family, and the mirror costs nothing:
         the spans do not move (MOTION) and every wire label gets wider (WIRE LABELS).
WIRE LABELS
         WIRE_X is the MIDDLE OF THE GAP, 812, centred, so the label sits between the API and
         kubectl rather than over one endpoint, at y=26 above the row: the drop owns below it. The
         mirror opened that gap from 56 units to 192 and took the old **16 CHARACTER CEILING** with
         it, so the five strings carry the call rather than a shorthand of it:
         `PATCH Node-1 · spec.unschedulable=true`, `GET /api/v1/pods · fieldSelector=spec.nodeName=
         Node-1`, `POST .../pods/web-1/eviction`, `POST .../pods/web-2/eviction` and
         `drain complete · DaemonSet Pod stays`.
         MEASURED after document.fonts.ready, the widest string (`GET`) against the panel right edge
         and against the content edge at 1140:
           1600x1000  365.2 wide, 629.4..994.6, clears the panel 290.8 by 338.6, the edge by 145.4
           1280x860   333.7 wide, 645.2..978.8, clears the panel 377.8 by 267.4, the edge by 161.2
           1100x800   325.2 wide, 649.4..974.6, clears the panel 396.5 by 252.9, the edge by 165.4
           1024x768   350.2 wide, 636.9..987.1, clears the panel 397.5 by 239.4, the edge by 152.9
         The binding clearance on the card is therefore 239.4, against the 5.6 units the old
         position at 456 left on a 16 character string. MEASURE PER VIEWPORT, do not reason about it
         from the viewport size: a string's width in viewBox units is NOT monotonic in the viewport,
         and this one is widest at 1600x1000 and second widest at 1024x768. The label renders at
         11px from `.scheme-label.code`, so do not size it off a `font-size` attribute, and nothing
         in the suite measures a wire label (`L-19`).
         Steps 3 and 4 deliberately carry the SAME shape with only the Pod changing, and NO status
         code. That is a TRUTH limit and not a width one, so the wider gap does not reopen it: the
         wire string stands for the whole step, and a label reading `429` would still be up at the
         end of evict-B, where web-2 has gone at 200. The response codes are on `last eviction`,
         which turns over on the beat that earns it.
WHY NOT  Keep the short forms the narrow gap forced (`PATCH Node-1`, `GET Pods Node-1`,
         `POST evict web-1`, `drain complete`). None of them names the call: `POST evict web-1` is
         not a verb the API has, and the eviction SUBRESOURCE is the mechanism the whole card is
         about. The ladder spelling a call the wire could not is what the old ceiling cost, and the
         two now say the same thing at two levels of detail rather than one covering for the other.
MOTION   STILL TIME is the reading this card is tightest on, and it is why `cordon` runs the same
         TWO hops `list` does and settles `spec.unschedulable` at the answer's arrival rather than
         at entry. It animates for 2060 of its 3800ms hold and stands still for 1740, 61 percent of
         the step, over the median still time and the median share `deadair.mjs` prints. Its reading
         pace is ordinary at the same time, 9.60 ms per character, so the hold is not buying unusual
         reading either.
         DO NOT drop the return hop back to one. A single hop costs 800ms of that motion and puts
         the thinnest motion on the card under its joint-longest duration, which is the pair `M-19a`
         asks for and no machine prints, and it settles the chip at entry, which is the R2-ENTRY row
         `report/arrival.test.mjs` reports. The sentence promises the return in its own words
         (`the status shows SchedulingDisabled`), and the answer lane is drawn permanently and used
         by every other step.
         The 1740 that is left is the CATALOGUE'S shape and not this card's: `list` reads exactly
         the same still time off the same 2 hops under the same 3800 hold, and both
         durations are reading-bought (see below). Buying the rest would have to come out of the
         narration, which is a CONTENT decision.
DO NOT   Lower `cordon` or `list` to close the still time. 3800 over 396 characters is 9.60 ms per
         character, mid-catalogue; at 2400 it is 6.06, inside the most hurried tenth the timing
         probe ranks, and neither narration can be read at that pace.
         A duration cut trades a defect nobody has a name for against one this
         record already paid to close.
MOTION   The mirror is the one geometry change here that moved NO timing: `F.top` runs at the fixed
         HOP_MS 700 whatever the distance, so the top hops went 56 units to 192 and every span is
         what it was, 1260 / 2060 / 2700 / 4300 / 900. It is a pacing GAIN. The hop reads 0.274
         u/ms over 192 units, above the catalogue's median ball and the length
         cluster-cpu-throttling, cluster-graceful-node-shutdown and cluster-oom-kill run, against
         the 0.080 u/ms a 56 unit hop crawls at, which is where cluster-static-pods still sits,
         near the bottom of what `pace.mjs` ranks. Both readings are floor-bound on the
         700ms PKT_DUR_MIN, which is M-13 and catalog-wide.
         This card has turned a geometry change into a timing change three times, in both directions.
         The lane went 528 units to 260, which is under PKT_DUR_MIN, so the drop now runs at the
         700ms floor and its length buys no time at all. evict-A spans 2700 (700 request,
         BEAT.afterHop, 700 drop, then POD_FADE 1200) and evict-B 4300, two hops more, so the
         durations are 2800 and 4400: 100ms of margin each, and both move if the fade does.
         The other two durations are set by READING, not by motion. cordon and list carry 396 and
         442 characters over spans of 2060, and at 2000 and 1900 they would read 5.05 and 4.83 ms
         per character, among the two dozen most hurried steps in the catalogue: the step advances
         before the sentence can be read. Both hold
         3800, 9.60 and 8.60 ms per character. evict-A 7.22 and drained 7.56 are inside the
         ordinary cluster band and were left alone.
DO NOT   Fade an evicted Pod to 0: it leaves a block-sized hole in the frame's left third. Pins and
         fade land on OPACITY.terminated, and POD_FADE is 1200 rather than FADE.out 700, because at
         700 the Pod is gone 200ms before its own pulse ends and the eviction reads as a cut.
         Two traps come with it. The static path stands a .highlight on the Pod's inner box in for
         the pulse it cannot show, and a highlight at the terminated shade is `render/opacity.test.mjs`'s LIT on
         one path and `render/reduced.test.mjs`'s HIGHLIGHT on the other, so fadeOut takes the class back in the
         fade's onfinish (the removeAt shape). And `render/opacity.test.mjs`'s ORDER wants the pulse before the
         fade: both hang off evict.arrivalMs.
NOTE     list runs TWO hops, not one. The step narrates work done on what comes back (bucketing
         each Pod, two Deployment-backed ones left for the Eviction API), and a return the
         narration promises and the motion never delivers is the same defect family the comment on
         evict-A's `granted` hop names. The answer rides RESP_Y, the lane the 200 OK and the 429
         already use, and adds 800ms to the span (1260 to 2060).
NOTE     ALL FOUR chips turn over on the beat that earns them, not one. `currentHealthy` is PDB
         status, so it moves when the eviction takes effect on the Pod (evict.arrivalMs).
         `last eviction` is what kubectl KNOWS, so it moves when the answer lands back on kubectl
         (granted.arrivalMs on evict-A, denied.arrivalMs on evict-B). Capturing the return hop is the
         only reason that packet stopped being a bare call.
         evict-B is the harder one, because both its pinned values are TRANSITIONS (`1 of 2 -> 2 of
         2`, `web-2 . 429 -> 200 OK`): showing them at entry announces the 429 and the retry that
         clears it before either is drawn. The played path starts from what evict-A left, puts
         `web-2 . 429` up when the denial reaches kubectl, bumps the count as the RETRY LEAVES (the
         narration has the replacement turning Ready before the retry is granted), and settles on the
         pinned strings at evict.arrivalMs.
         The `drained` step does not write `2 evicted . DS retained` into `last eviction`: that is a
         tally, not a last eviction, which is the chip-name rule. Ladder row 5 and the wire label
         already carry the summary.
SCOPE    The PDB is one chip, one ladder row and one 429 here, and the mechanism under it is
         deliberately left undrawn: minAvailable, maxUnavailable, what status.disruptionsAllowed
         counts and who reads it, unhealthyPodEvictionPolicy, and the line between a voluntary
         disruption the Eviction API gates and an involuntary one it cannot. No card in the
         catalogue draws any of them. What stays here is the 429 and the retry loop, because those
         are the drain behaving, not the budget being explained.
CONTENT  The disruption controller computes status.disruptionsAllowed; the eviction admission path
         only READS and decrements it. Row 4 is `API reads disruptionsAllowed`.
         `the PDB returns 429` is wrong from the other side: the PDB is an object and the API answers.
         The desc had `DaemonSet Pods are skipped only when you pass --ignore-daemonsets`, which says
         that without the flag they would be evicted. The subcommand does not drain them at all; the
         flag exists so the drain does not abort.
         kubectl sleeps a fixed 5 seconds on a 429 and there is no backoff curve. The interval is
         on none of the pages this card cites: disruptions says
         only that the tool "periodically retries all failed requests until all Pods on the target
         node are terminated, or until a configurable timeout is reached", with no interval given.
         It stands on kubectl's own default instead, `EvictErrorRetryDelay: 5 * time.Second` in
         `pkg/cmd/drain/drain.go`, slept by `time.Sleep(d.EvictErrorRetryDelay)` in
         `pkg/drain/drain.go` on `IsTooManyRequests`, and no CLI flag exposes it. That is a
         default rather than a contract, so the number here is kubectl's own behaviour and not a
         promise the doc makes.
         `disruptionsAllowed decrements to 0 under optimistic concurrency` is the eviction handler,
         not a paraphrase: `checkAndDecrement` does `pdb.Status.DisruptionsAllowed--` and then
         `UpdateStatus`, wrapped in `retry.RetryOnConflict`, which re-reads the PDB and repeats on a
         conflict (`pkg/registry/core/pod/storage/eviction.go`).
         `The Scheduler stops placing new Pods on this Node` is false for anything tolerating
         node.kubernetes.io/unschedulable, which is exactly the DaemonSet Pod this card keeps.
         The desc has to make that claim ABOUT THE SCHEDULER and not about the Node, because the
         taint is not the only way past a cordon: safely-drain-node says "If you or another API
         user directly set the nodeName field for a Pod (bypassing the scheduler), then the Pod is
         bound to the specified node and will run there, even though you have drained that node and
         marked it unschedulable". `so nothing new lands there unless it tolerates the unschedulable
         taint` is therefore rejected, because a directly bound Pod lands there and tolerates
         nothing. It reads `so the Scheduler skips it unless a Pod tolerates the unschedulable
         taint`, which the bypass leaves standing, and the characters came out of `command`:
         465 of the 470 the band allows.
         `kubectl refuses to start with any present` is rejected on grammar rather than truth: the
         verb loses its object and the sentence stops parsing. `refuses to start one while any are
         present` keeps `one` pointing back at `A drain`.
         The `aria-label` stopped at the PDB gate, so the one thing a screen reader got for the
         picture ended before the card's own conclusion. It now runs the whole drawing through to
         `the DaemonSet Pod left standing`, which is step 5, the poster's sentence and the desc's
         last claim.
         Read against `k8sVersion` 1.35, every other claim on the card holds. Four are worth
         writing down because a later pass will doubt them.
         The bucket ORDER in `list` (DaemonSet, mirror, emptyDir and bare) is the order kubectl
         applies its filters in, `skipDeletedFilter, daemonSetFilter, mirrorPodFilter,
         localStorageFilter, unreplicatedFilter` (`pkg/drain/filters.go`), so do not reorder that
         sentence for rhythm. The card narrates the last four: `skipDeletedFilter` is not a bucket a
         reader picks a flag for, it drops Pods that are already going away.
         `bare Pods with no owner` is the SOURCE reading and it is deliberately not the reference
         wording. `unreplicatedFilter` reads `controllerRef := metav1.GetControllerOf(&pod)` and
         returns okay whenever that is non-nil, so ANY controller ownerRef is enough. The kubectl
         reference states a closed list instead, "neither mirror pods nor managed by a replication
         controller, replica set, daemon set, stateful set, or job", and rewriting the card to that
         list is REJECTED: a Pod owned by a custom controller is on no part of it and still does not
         abort the drain, so the closed list would make the sentence false.
         `Mirror Pods are skipped because Kubelet would recreate them` keeps the mechanism
         cluster-static-pods teaches. The kubectl reference gives a different reason, "except mirror
         pods (which cannot be deleted through the API server)", which is looser: the API accepts
         the DELETE and the Kubelet puts the record back. `mirrorPodFilter` returns a plain skip
         with no flag behind it.
         `A drain never evicts DaemonSet Pods` takes the absolute the kubectl reference itself
         states, "regardless it will not delete any daemon set-managed pods". The one counter-case
         is an ORPHANED Pod whose DaemonSet is gone, which `--force` will delete, and that is the
         filter's own documented exception rather than a drain evicting a DaemonSet Pod.
         `A drain never evicts DaemonSet Pods and will not proceed without --ignore-daemonsets`
         carries BOTH halves on purpose. The absolute is the reference's own, "regardless it will
         not delete any daemon set-managed pods", and the second half is the reference's own
         sentence too, "If there are daemon set-managed pods, drain will not proceed without
         --ignore-daemonsets". Stating only the first half is REJECTED even though it is true: the
         same step tells the reader that emptyDir and bare Pods `abort the drain until the matching
         flag is passed`, so a DaemonSet bucket with no abort clause beside them reads as the one
         bucket whose flag is optional, which is the opposite of what the flag is for. The desc
         carries the same pairing, and the desc is never seen inside the dialog.
         `SchedulingDisabled` is NOT a field. `printNode` composes it, `if obj.Spec.Unschedulable {
         status = append(status, "SchedulingDisabled") }`
         (`pkg/printers/internalversion/printers.go`), so the string is a direct rendering of the
         one boolean the chip is named after. That is why `spec.unschedulable` carries
         `true · SchedulingDisabled` as one value: splitting them, or promoting `SchedulingDisabled`
         to a field path of its own, is rejected on the source.
         THE FIVE WIRE LABELS are calls, read against the reference. `POST .../pods/web-1/eviction`
         and its web-2 twin are the ellipsis of the path api-eviction itself prints,
         `/api/v1/namespaces/default/pods/quux/eviction`, and the Eviction body is `policy/v1` since
         1.22 while the PATH stays on `api/v1`, which is why the card names no group on them.
         `GET /api/v1/pods · fieldSelector=spec.nodeName=Node-1` is the all-namespace list endpoint
         with the field selector the narration states. `PATCH Node-1 · spec.unschedulable=true` and
         `drain complete · DaemonSet Pod stays` restate their own steps and add no claim.
         `evicts the Pods through the Eviction API rather than deleting them` (desc) is the
         mechanism and NOT an unqualified absolute, and the two paths to a plain DELETE are
         deliberately unstated here. The reference reads "drain evicts the pods if the API server
         supports eviction. Otherwise, it will use normal DELETE to delete the pods", which is a
         legacy fallback rather than a 1.35 path, and `--disable-eviction` is the other,
         "Force drain to use delete, even if eviction is supported. This will bypass checking
         PodDisruptionBudgets, use with caution". Neither path is drawn anywhere in the
         catalogue, so leaving them out here is a SCOPE decision and not an omission.
         SOURCES carry a fourth entry, the `kubectl drain` reference. The card states the shape of
         a COMMAND (three flags on ladder row 2, the abort clause on `list`, `kubectl uncordon
         Node-1` on `drained`) and the three kubernetes.io concept pages it cites cover none of
         that: safely-drain-node names `--ignore-daemonsets` alone and never mentions
         `--delete-emptydir-data`, `--force`, mirror Pods or a retry interval.
         The 5 second retry is bounded by `--timeout`, "The length of time to wait before giving
         up, zero means infinite", and zero is the default, so `retries every 5 seconds` is exact
         for the default drain and the card owes no qualifier there.
         `PATCHes Node-1 with spec.unschedulable=true` is the verb kubectl uses: `CordonHelper`
         builds a two-way strategic merge patch and calls `Patch`, falling back to `Update` only
         when the patch itself fails. The list call is exact too, all namespaces with
         `FieldSelector spec.nodeName`.
NOTE     200 OK on a granted eviction is SETTLED, and there is no 201 to weigh against it. The
         api-eviction page reads "200 OK: the eviction is allowed, the Eviction subresource is
         created, and the Pod is deleted, similar to sending a DELETE request to the Pod URL", and
         the handler agrees rather than differing from it: the success path returns
         `&metav1.Status{Status: metav1.StatusSuccess}`, which is 200
         (`pkg/registry/core/pod/storage/eviction.go`). A 201 reading is wrong on both sources and
         must not be introduced, and the pull toward it is REAL rather than hypothetical: this
         catalogue teaches `POST 201 Created` on cluster-object-create-path and
         cluster-leader-election, so an eviction POST looks like it should answer the same way. It
         does not, because the eviction subresource returns a Status and not a created object.
         The refusal comes from the same handler,
         `errors.NewTooManyRequests(...)`, which is the 429 the card draws.
         `web-1` and `web-2` are named like StatefulSet members while their sublabel says Deployment.
         Legibility wins and the naming is consistent across every step, chip and wire label.
NOT A DEFECT
         `currentHealthy` ends evict-A on the post-eviction reading `1 of 2` and evict-B on the
         pre-eviction one `1 of 2 . 2 of 2`, and the two parallel steps therefore settle on
         different halves of the same beat. Making them symmetric costs more than it buys: the
         played path would have to turn the chip back to `1 of 2` at evict.arrivalMs, which lands
         it on the string it opened with, and the STATIC path (prev, reset, reduced) would then
         show evict-A and evict-B ending identically, with the 429 and the recovery that are the
         whole subject of evict-B readable nowhere. The climb is what that step is about and the
         final tally is on `drained`.
OPEN     `The Scheduler` (steps 1 and 5) and `The owning ReplicaSet` (evict-A) are named and not
         drawn, which is T-21. It STAYS OPEN and the reason is the WHY NOT above: with the panel
         reaching 397 a box left of a centred API has 420..484 to live in, 64 units, and the mirror
         spent the room on the other side on kubectl, so the top row is now full at 484..1140. Both are consequences rather than actors here, the
         ReplicaSet is explicitly deferred to the Deployment rolling update card in the sentence
         that names it, and neither ever acts on screen.
```

### poster

```
Sentence: a drain empties a Node of everything except its DaemonSet Pod.

Two Node frames, the drained one left and the destination right, with three Pod slots left and two
right.

The two UPPER slots are the ghosts and the bottom slot, the DaemonSet Pod, carries the single
brightest fill at 0.16, because it is what the sentence is about.

DO NOT put two solid slots on the left and two on the right. That says one Pod left and two arrived,
on a card where two leave and one stays.
```
