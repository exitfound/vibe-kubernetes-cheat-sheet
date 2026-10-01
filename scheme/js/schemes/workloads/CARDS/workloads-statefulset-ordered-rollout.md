## workloads-statefulset-ordered-rollout

### layout

```
WHAT     Three ordinal columns, each a Pod over its own claim, filled strictly left to right because
         ordinal N+1 waits on ordinal N being Running and Ready, and emptied right to left when the
         set scales down.
LAYOUT   No LAYOUT preset. A / B / C choose which column holds a ladder and which the chips, and
         this card carries neither: it is three vertical stacks laid across the width, gated in
         sequence, and the gates are what the gap between the stacks is for.
           actors  StatefulSet web 484..716 centred on WL.SPINE_X, API 908..1140, the 232 wide
                   PAIR `workloads-replicaset` and the exemplar draw
           bus     307, split at the centre column, one tap per ordinal
           pods    363..445, three at 300 wide on a pitch of 390 (60 / 450 / 840)
           disks   491..567, 150 wide, centred under their Pod at 210 / 600 / 990
           chips   590..624, three at 300 wide, each on its own column
         The pitch is what makes the composition work: 300 wide at 390 apart spans WL.L..WL.R
         exactly, puts the centre column on WL.CX so the trunk drops straight into it, ends the
         third column on WL.R under the API, and leaves a 90 unit gap for each gate.
         5 numbered steps plus the idle frame the poster shows.
PANEL    x<=397 catalog-wide (`L-02`). Bottom per viewport:
         `OVERLAY_IDS=workloads-statefulset-ordered-rollout node --test report/overlay.test.mjs`.
         Deepest on step 5 at 1100x800, shallowest on steps 0, 1 and 3 at 1600x1000, a swing of
         84.62 on step 5. At the deepest viewport four of the six steps share one reading and only
         `gate` and `scale-down` sit deeper, so the panel is flat there apart from the two longest
         narrations. `gate` sits one line deeper than the flat band at that viewport alone, and the
         line break falls at or below 348 characters: `gate` crosses it at 355 and reads the same at
         367.
         `ordinal-2` is the step that FLOORS the flat band, at 339 characters, and 351 puts it a
         line deeper, so the flat band holds only while it stays under about 350. `PANEL_B` 280 is
         derived from the deepest reading and it pins BAND_Y at 301, which the bus at 307 is the
         first thing to use. That reading is the whole vertical budget: 301 to the 624 the chip
         strip ends on leaves 323 units for a 6 unit drop to the bus, an 82 unit Pod, a 76 unit
         disk, a 34 unit chip and the three gaps between them, which is why the tap is 56 and the
         spine 46 rather than the 74 and 56 a shallower panel allows. A narration longer than
         `scale-down` costs the picture those gaps, in that order.
SIZES    A chip is 300 rather than the WL.L-05 three-across 350.7, because a chip here is the foot
         of its column and has to line up with it. Measured at 1100x800 the tightest pair is `web-1`
         at 30.7 against `next in line` at 73.6, the longest value any chip here carries, each 12
         from its own edge with 171.7 units of clear between them, so the column width is not what
         floors this chip.
         The gate caption is the string the 90 unit gap has to hold: `waits on web-0` measures 85.9
         at 1100x800 and inks 362.1..447.9, 2.1 clear of each Pod face. Its box measures y
         340..354.7 off a baseline at 351, above the Pod tops at 363 and below the bus at 307, so
         those two units either side are clearance it does not need. A longer caption crosses a Pod
         in x and has to move or shorten.
LANES    Trunk down WL.SPINE_X into a bus split at the centre column, one tap per ordinal, an
         ownership spine per column and a gate bridging each gap.
         TWO WEIGHTS, and which one a line takes is decided by whether traffic uses it, not by how
         important it is. Measured in the browser at steps 0, 4 and 5, on every step alike:
         the eight DELIVERY paths, the two actor-row arrows plus the trunk, the two bus halves and
         the three taps, all read `stroke rgb(91, 184, 255)`, `stroke-opacity 1`, `stroke-width
         1.4px`, effective 1.000. The five RELATIONS, three spines and two gates, all read
         `stroke-opacity 0.45` at element opacity 1.000. `workloads-pod-lifecycle-phases` is the
         model for the pair, and its `edgeFail` and `edgeEnter` are the same plain relation.
         The trunk and the two bus halves are LANES with the marker taken off, the
         `workloads-replicaset` form: they carry every ball (A-06), so they take the route weight,
         and `tune` drops only the head, which belongs on the tap that lands on a Pod (A-05).
         A-13 IS OVERRULED, and it is the one override here. `ordinals` carries the Pod and the disk
         ONLY, so no line is ever pinned to a sink's shade: with three ordinals arriving one at a
         time that pin left two thirds of the drawing washed out on every step but the last. Bodies
         keep the lifecycle vocabulary, lines do not. The relation wash is a WEIGHT and the pin was
         a STATE, and dropping the second does not touch the first.
         The gate says open or closed in WORDS, on its caption, and never by rising out of a shade.
         That is not a free reading anyway: a `.highlight` on a path renders nothing, `diagrams.css`
         carries that rule for pods, boxes, cylinders and chips only, so the shade is the only
         visual channel the pin would buy and the caption already carries the sentence on every
         step. The gate dash stays `4 4` against the trunk `5 5`: at `2 6` it inks so little that it
         stops reading as a line at all.
         The one thing that still takes a line down is the far end being GONE (A-14). On
         `scale-down` pod2, tap2, busR, spine2 and the gate12 line all go to 0 while the disk stays
         at full, which is the one picture the step exists to draw: the gate spans two Pod faces and
         one of them is no longer drawn.
MOTION   Each ordinal is two hops: the request across the top row, then the create down the trunk.
         The Pod and its claim both reveal on the CREATE arrival and the claim is CUED there too,
         through `lights` on the route rather than on the request hop: one event, the instant the
         ball reaches the Pod. Cued a hop earlier, on the argument that the controller creates the
         PVC before the Pod, it draws a disk lighting while the ball is still in flight. The API
         order is the mechanism and not a beat the picture stages, so both narrations say the
         controller REQUESTS the claim before the Pod, which is what the request wire carries.
         `gate` rides the ANSWER lane. The controller learns readiness off its watch, so the API is
         the sender cued at entry and the controller lights on arrival. Its live span is 1260
         against a duration of 3400, so it stands still for 2140, 63 percent of the step, and
         `deadair.mjs` prints 79 percent off the SPEC span of 700, which drops the ripple. It is not
         padding: at 367 characters and 9.26ms each it reads FASTER than the catalog median
         `timing.mjs` prints beside it, so the hold is what the reading costs and not slack. It is
         the most hurried step on the card and 367 is where it stops: the panel is already a line
         deeper than the flat band at 1100x800 and the pace is closing on that median, so this step
         is the one with no room left.
         `ordinal-1` holds 3600 against 4200 for the other two ordinals, because the centre column
         is a straight drop of 243 units where the outer creates run 633, and its create hop is
         707ms shorter.
CONTENT  Read against the `k8sVersion` the catalog entry states, on the two pages `sources` cites.
         Every step says Running and Ready rather than Ready alone, because that is the condition
         the guarantee is written in: `Before a scaling operation is applied to a Pod, all of its
         predecessors must be Running and Ready`. `once its readinessProbe passes` is rejected for
         the same sentence: it names one mechanism for a state a Pod also reaches with no probe
         defined at all.
         `never turns Running and Ready` on `gate` is the full condition, not the shorthand: a step
         that names the gate condition names it whole. `ordinal-2` keeps `ordinal 0 was Ready` in
         its closing clause, and that is a MEASURED exception rather than an oversight. The step
         already says `All three replicas are Running and Ready` two sentences earlier, so the
         condition is stated whole in the step, and the twelve characters that would close the
         clause push the 1100x800 panel from 229.82 to 254.66, out of the flat band four of the six
         steps share, which is measured rather than estimated.
         `spec.minReadySeconds` is not narrated. The guarantee continues `If .spec.minReadySeconds
         is set, predecessors must be available`, which refines the gate rather than replacing it,
         and the field defaults to 0, so the sentence is true without the clause.
         `spec.hostname set to web-0` is rejected on both ordinal steps. The controller does set it
         (`pod.Spec.Hostname = pod.Name` in `stateful_set_utils.go`), but the docs file the hostname
         under Stable Network ID and it is only reachable through the headless Service this card
         does not draw, so the steps carry the identity claim the picture supports:
         an identity that sticks to the Pod wherever it is rescheduled.
         `a client can address one exact member of the set` is rejected on `ordinal-2` for the same
         reason: addressing a member by name is DNS. The replacement is the contrast the docs open
         with, Pods that `are not interchangeable` the way Deployment replicas are.
         `The claim is not deleted with the Pod` names the field in full because it asserts a
         DEFAULT: `Retain (default) PVCs from the volumeClaimTemplate are not affected when their
         Pod is deleted`, and `The default for policies is Retain`. The second source is cited for
         that sentence alone. The API defaults the field rather than leaving it unset:
         `SetDefaults_StatefulSet` in `pkg/apis/apps/v1/defaults.go` writes `Retain` into both
         `whenDeleted` and `whenScaled` when each is empty, so `defaults to Retain` is the value a
         reader gets back off the object and not only the behaviour the page describes.
         `requests the claim before the Pod` has no page behind it. The docs are silent on the
         order, and it is controller behaviour: `CreateStatefulPod` in `stateful_pod_control.go`
         creates the PVCs first, with a comment saying they are created prior to the Pod.
         It is written as what the controller does, never as a guarantee, and it rides the REQUEST
         hop, whose wire reads `create PVC data-web-0, then Pod web-0`. It is deliberately not on
         the create hop, because the picture reveals the Pod and its claim on ONE arrival: the
         drawing side of that ruling is MOTION, and both ordinal narrations say REQUESTS for it.
         `data-web-0` is `<template>-<set>-<ordinal>`, which is what `getPersistentVolumeClaimName`
         builds, `fmt.Sprintf("%s-%s-%d", claim.Name, set.Name, ordinal)`, and the same string
         `storage-volumeclaimtemplates` draws for the same claim. `joins the template name to the
         ordinal` is rejected on `ordinal-0`: joining `data` to `0` builds `data-0`, and the set
         name is the middle segment the sentence dropped. The wording is `joins the template name to
         the Pod name`, which is what the sibling says of the same string, `It is the template name
         joined to the Pod name`.
         `Setting the field to Parallel lifts the gate` is rejected on `gate`. It reads as an edit a
         reader can make, and `podManagementPolicy` goes through `ValidateImmutableField` in
         `pkg/apis/apps/validation/validation.go`, so it cannot be patched onto a set that already
         exists. The wording is `Parallel lifts the gate, but the field is immutable`. The docs say
         nothing about it, which is why the validation is what is cited.
         `.spec.ordinals.start` is not narrated, on the `minReadySeconds` argument: the field
         defaults to nil and the Ordinal Index section says pods are assigned ordinals from 0 upward
         by default, so `starts at ordinal 0` is true without the clause.
SCOPE    The disk stands for the claim and the volume behind it as one thing. The template that
         mints one PVC per ordinal, the deterministic `data-web-N` name and the PVC/PV split are
         `storage-volumeclaimtemplates`, and what a non-default retention policy does with a claim
         the set no longer needs is `storage-pvc-retention-policy`: `scale-down` states only the
         default and shows the disk staying.
         Nothing here is network. The headless Service, the one A record per ready Pod and the
         `web-0.web` name a client dials are `network-headless-service`, and the FQDN shape behind
         the short form is `network-dns-records`. No step names any of them, so no Service is drawn
         and the identity this card claims is the ordinal, the name and the claim.
         Where the ordinals RUN is not the subject, so no `node()` frame is drawn: a frame around
         all three would say they share a Node, which a StatefulSet does not promise.
         A Pod that never turns Ready stalls this gate, which `gate` states in one sentence and
         never unsticks. An identity-bound controller refusing to replace a Pod stuck Terminating,
         and what force deletion costs, are `workloads-force-deletion`.
NOT A DEFECT
         `ordinal-1`s create ball runs 243 units, under the 314 where `routeDur` stops clamping,
         so it takes the PKT_DUR_MIN floor of 700 and moves at 0.347 units per ms against 0.450 for
         the outer two. That is M-13 working: the floor is what most short hops in the catalog
         already sit on, `pace.mjs` puts 0.347 in the faster half of the population it prints, and
         an explicit `dur` under the floor would make the shortest hop on the card the hardest one
         to follow.
         The three columns cannot be equalised instead: three columns spanning WL.L..WL.R put the
         middle one on WL.CX by construction, and that is where WL.L-07 needs the trunk.
```
