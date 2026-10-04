## storage-pvc-retention-policy

### layout

```
WHAT     persistentVolumeClaimRetentionPolicy is two independent switches, whenScaled for a
         scale-down and whenDeleted for deleting the set, each Retain or Delete. A field at Retain
         adds no ownerReference, so its event deletes no claim. Delete gives the claim an ownerReference, to the removed Pod or to the
         StatefulSet, so the garbage collector deletes it after its owner, and the disk goes too
         only if the PV reclaimPolicy is Delete.
LAYOUT   A 2x2 POLICY MATRIX. One ROW per field, the two ways a replica leaves: whenScaled on top,
         whenDeleted below. One COLUMN per position, `if Retain` left and `if Delete` right. Each
         cell is a dashed frame around the three ordinal claims, each claim over its disk, and the
         owner that leaves in that row stands in the middle column between its two cells: Pod
         web-2 in row 0, StatefulSet web in row 1, with the one lane web -> Pod between them.
         Each row varies ONE field and holds the other at its default Retain, and the standing row
         captions say so (`whenScaled flips, whenDeleted stays Retain`), so no cell stands for a
         combination it does not draw. That is also why row 0 does nothing on `set-delete`: both
         of its cells hold whenDeleted at Retain.
         The Retain cell counts ordinals 0, 1, 2 away from the panel and the Delete cell mirrors
         it, so in both cells the claim of the ordinal a scale-down removes stands next to its
         owner.
         The garbage collector is the one actor that deletes, and only in the Delete column, so it
         stands in the free band above that column, centred on the row 0 claim it deletes.
         Why a matrix and not the section default: the subject is two switches with two positions
         each, and the answer is which claims survive in which cell. Both cells of a row play under
         the same event in the same beat, so Retain and Delete are read side by side, and the matrix
         is the readout: there is no chip. storage-volumeclaimtemplates draws ordinal ROWS and
         storage-generic-ephemeral-volume a claim-centred cross with a Pod owner and the collector,
         and this card uses neither.
PANEL    `OVERLAY_IDS=storage-pvc-retention-policy node --test report/overlay.test.mjs` from
         `scheme/test/`. Deepest at 1100x800 on `mark`, `scale-up` and `set-delete`, six lines each, 204.97, with
         the poster preview of `mark` on `idle` level with them. The Retain column stands
         under the panel column, and what sits nearest it is the `if Retain` caption: its ink
         starts at y 249 at 1100x800, 44 under the deepest reading. The cells start at 272.
         The matrix inks 249..588 at 1100x800, so it stands centred in the 205..640 band under
         the deepest panel, 44 above and 52 below, with the collector 56 from the canvas top.
         A narration one line longer than those three (24.85 a line at 1100x800) clears the
         caption by 19.2, and two lines put it under the panel. Cut prose rather than move the
         matrix.
SIZES    The owners and the collector are the catalog sizes (NET.L-01): Pod web-2 232 by 104 around
         a 192 by 44 app box 26 under its label, StatefulSet web and the garbage collector 232 by 80.
         A claim is 116 by 44 and its disk a 116 by 40 cylinder, a cell slot rather than an actor:
         three slots, two 8 gaps and a 10 frame pad make the 384 cell, and two cells, the 232 owner
         and two 40 gaps span 60..1140 on 600. The worst claim string, `PVC data-web-2` at 12px,
         inks 93.3 after fonts.ready at 1100x800, 11.4 clear a side (10.6 at 1600x1000, on
         `PVC data-web-0`). Every sublabel (`Bound`, `owner: web`, `owner: web-2`) is shorter.
         No verdict wire, caption or row caption touches a frame, a block or another string on any
         step at any of the three viewports (measured on the static path of every step).
         The row pitch is 184: a row 0 Delete verdict inks down to 403.7 at 1100x800 and the
         caption over the row 1 Delete cell starts at 433, 29.3 apart, while that caption stands
         8.3 over its own frame, so it reads as the row 1 header and not as a second verdict line.
         A tag on the Pod lane hugs its ball, 34 right of the lane and 16 below the ball, and
         emerges 250 after departure, once it has cleared the StatefulSet top: shown from the
         start it would print over `StatefulSet web`. It lands under the Pod bottom, clear of
         `mounts data-web-2`.
LANES    Three lanes, each array built ONCE and read by the lane and the ball (A-02): web -> Pod up
         the centre, stopping on the Pod shell; GC -> the row 0 Delete frame top, level with the
         data-web-2 slot; GC -> the row 1 Delete frame right face, round a gutter 30 right of the
         matrix. The gutter crosses no block, frame or caption. Both GC lanes end on a cell FRAME
         face, because a ball there deletes what the frame holds, one claim or three.
         The ownerReference is a RELATION, no arrowhead and never a ball: it lives on the claims and
         names the owner, so it is drawn from the owner to its Delete cell only, revealed when it is
         written. The Retain cells have no line at all, and that absence is the lesson.
         The GC_D ball rides untagged. Its vertical leg runs a 30 wide gutter: a tag centred on it
         sits on the dashed lane, one to its right runs past the 1200 canvas edge, and one to its
         left crosses the Delete cells. The GC_S ball on `scale-down` names the verb.
         Every other tag rides right of its vertical lane and trails its ball, below it up the Pod
         lane and above it down the collector lane, so none lands on the text of the block its
         ball reaches. The GC_S tag starts 5.0 under the collector sublabel and lands on the
         caption row, 44.0 left of `if Delete`, where it dies with its ball (1100x800).
MOTION   Balls ride routeDur with no explicit dur, and every tag lives exactly as long as its ball
         (inMs 200, outMs 200, hold 0). Every ball is literal traffic: the controller deleting and
         creating Pod web-2, the collector deleting claims.
         `mark`: the relation from web reveals at 800 and the three row 1 Delete claims light and
         read `owner: web` as it lands. `scale-down`: the relation to Pod web-2 is written first
         (300..800) and data-web-2 lights as it lands and reads `owner: web-2`, the same cue the
         mark claims take, then the delete ball, the Pod blinks, and it fades with its lane and
         relation. The collector sends once the Pod is gone, the claim fades after a 260 hold, and
         the disk lights 600 after the claim, while the claim is a third into its fade, so the two
         read as a sequence: the PV reclaims the disk, not the collector. The Retain cell does
         nothing at all.
         `scale-up`: the fresh claim rises first (the controller creates claims before the Pod),
         then the create ball, the Pod blinks as it lands and rises from the pending shade, the
         same arrival the delete ball gets on `scale-down`, then the new disk. The Pod waits at
         0.55 under a full lane from the step entry (M-24): `replicas: 3` is already written.
         `set-delete`: web fades at 800, Pod web-2 blinks once web is gone, and the collector sends
         once the Pod has faded, the claims then the disks going as on `scale-down`.
         `disk`: only the three row 1 Delete claims are replayed, from full, and deleted again. The
         disks stand, lit as the thing the step is about. Nothing else moves from where `set-delete`
         left it.
         A lane or relation takes the MIN of its two ends (A-13) through `stage()`, and nothing is
         dimmed to say unaffected: the cell that does nothing holds full opacity.
WIRE LABELS
         One verdict under each cell, and one caption over the row 1 Delete cell, `pvCap`: the PV
         reclaimPolicy the narration speaks, `the PVs say Delete` from `scale-down` to
         `set-delete`, which `disk` turns into the T-35 counterfactual `if the PVs say Retain`
         in the same place, over the branch it replays.
CONTENT  Read, for the release `k8sVersion` names, against the StatefulSet concept page
         (PersistentVolumeClaim retention, Limitations), Garbage Collection (cascading deletion),
         Persistent Volumes (Reclaiming), Storage Classes (Volume binding mode), the
         StatefulSetAutoDeletePVC gate page, and pkg/controller/statefulset: stateful_set_utils.go
         `updateClaimOwnerRefForSetAndPod`, stateful_pod_control.go `CreateStatefulPod` and
         `UpdateStatefulPod`, stateful_set_control.go `processCondemned`.
         Stage: the gate is stable from 1.32, and "The default for policies is `Retain`" for both.
         The ownerReference is a CONTROLLER reference (`metav1.NewControllerRef`, so
         blockOwnerDeletion too). Claims are CREATED without one: the controller writes it right
         after it creates the Pod, and on any later reconcile whose claims disagree with the policy,
         which is how existing claims get it when the policy is set later. `mark` therefore says
         "the controller writes an ownerReference to web on every claim, existing or new".
         "every claim carries an ownerReference to web from the start" is rejected: nothing is on
         the claim at creation, and a policy set on a running set reaches claims made before it.
         A field at Retain writes no reference for its event, and the controller scrubs its own
         references when both fields are Retain. "Retain never touches a claim" is rejected on
         both counts: the scrub touches it, and in the whenDeleted Delete cell whenScaled is also
         Retain while the claims carry `owner: web`. The card and the aria-label say "A field at
         Retain adds no ownerReference, so its event deletes no claim".
         whenScaled Delete puts the reference to the POD on condemned ordinals only, before the Pod
         is deleted ("the condemned Pods are first set as owners ... before the Pod is deleted"),
         so the claims go "after only the condemned Pods have terminated". With BOTH fields Delete
         a scaled-down claim carries the Pod reference only (the set reference is scrubbed) and an
         in-range claim the set reference only. The card draws neither combination: each row
         flips one field.
         `set-delete` names the cascade: "Delete web with the default background cascade and its
         Pods go too". "Now delete StatefulSet web and its Pods go first" is rejected: the Pods go
         only in a cascading delete, background is the default ("By default, Kubernetes uses
         background cascading deletion"), and the canvas draws background, web gone at once. "after
         its Pod" is the doc's own order ("all PVCs from the volumeClaimTemplate are deleted after
         their Pods have been deleted"). `kubectl delete --cascade=orphan` sets the orphan
         finalizer and the garbage collector's `orphanDependents` patches the owner reference off
         every dependent (source, the docs say only that dependents are left), so Pods and claims
         both survive even under whenDeleted Delete. CONTENT only, never on the canvas.
         Retain cleanup: "until deleted by hand" matches the page ("This must be done manually").
         `scale-up` states the binding mode it draws: the new disk appears after the Pod, which is
         the WaitForFirstConsumer order ("delay the binding and provisioning of a PersistentVolume
         until a Pod using the PersistentVolumeClaim is created"). Under Immediate, the unset
         default, it would be provisioned as the claim is created, so the narration says "with
         WaitForFirstConsumer binding its empty volume is provisioned once the Pod is created"
         rather than "on a new empty volume" with an order the reader cannot place. The fresh PV is
         a new object: the disk keeps the display name `PV web-2` the sibling cards use for the
         ordinal, and the verdict `fresh claim, empty disk` carries the difference.
         reclaimPolicy lives on the PV, and a dynamically provisioned PV inherits its StorageClass
         policy, which defaults to Delete. So `the PVs say Delete` is the ordinary case and `if the
         PVs say Retain` the counterfactual: under Retain "the PersistentVolume still exists and
         the volume is considered released", data still on it, which `claims deleted, disks
         Released` says.
         Consistency with storage-volumeclaimtemplates, whose scale-down leaves data-web-2 Bound
         with its data under the default Retain: the Retain column here draws exactly that.
SCOPE    The volumeClaimTemplate itself, the data-web-N name and the default Retain on a scale-down
         are storage-volumeclaimtemplates, which names this card for the two fields. What a PV
         reclaimPolicy does to a disk, and the Released phase, are storage-reclaim-policy and
         storage-pv-lifecycle-phases: this card only says the claim policy never reaches the disk.
DO NOT   Make a lane family a factory called once for the lane and again for the ball: the routes
         then ride an equal COPY of the numbers under them, which comes apart the first time a
         block moves.
         Leave the .highlight on a deleted claim or disk. `vanish` lights it through an `F.set`
         carrying `lit` rather than a `lights` cue, so the static path never shows it, and fades it
         with `unlight`, so the class comes off when the fade finishes: otherwise the block ends its
         step lit at the terminated shade, which the static path never reproduces, and the defect
         shows as reduced-motion findings rather than as a drawing complaint.
         Draw an arrowhead or run a ball on an ownerReference: it would read as traffic from the
         owner to the claims, which is the wrong way round.
```
