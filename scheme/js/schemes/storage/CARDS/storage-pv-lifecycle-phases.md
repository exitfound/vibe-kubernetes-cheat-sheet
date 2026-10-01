## storage-pv-lifecycle-phases

### layout

```
WHAT     The phase of a PV is a status field written by ONE controller in response to events. The
         row of four phases is the board, the PV controller band above it is the writer, and every
         transition is drawn as that band writing a phase down its own lane. The one exit that is
         NOT a write, a CSI volume deleted under Delete, comes from the external-provisioner and
         leaves the board without a phase.
LAYOUT   The row stands RIGHT of the panel wall, 400..1138, so the controller band can span exactly
         the row and every write lane is a straight drop onto a box top. Four lanes at 475, 671, 867
         and 1063 are mirrored pairs about the band centre 769 (L-12).
         The actor sending an event sits in ONE slot centred over the band: the claim on `bind` and
         `release`, the administrator on `recover`, each its own block. The external-provisioner
         stands under Failed and reaches the Released floor from the side, because it does not talk
         to the controller at all, which is the point of drawing it outside the band.
         The PV object is a COLUMN of its own fields bottom left, where the full width is free below
         the panel. It is also what balances a row that had to move right: the pooled content reads
         80..1179, centre 630, where the row alone centres on 769.
         The transitions are relations and the way back is a relation under the row, from the
         Released floor to the Available floor. Nothing travels them, so they carry no arrowhead
         (A-06): what travels is the controller writing.
PANEL    `OVERLAY_IDS=storage-pv-lifecycle-phases node --test report/overlay.test.mjs` from
         `scheme/test/`. The band and the slot stand inside the panel band and start at 400, clear of
         the right edge at every viewport. Everything left of 400 is the chip column, whose title
         inks from y 417.4. The deepest standard reading is 229.8 on `recover` at 1100x800, the
         longest narration. The 900x650 hand row (STO.L-04) is the strictest, x 398.3 and y 343.9,
         also on `recover` (`extents.mjs --viewport=900x650`): the row clears it by 1.7 on x and
         the column by 73.5 on y, so the card has no finding at that row either.
SIZES    Every actor is 232 by 80 (NET.L-01): the claim, the administrator and the provisioner. The
         band is sized BY the row it writes to, 738 wide. The phase boxes are the cells of the row,
         150 by 72, sized by the 196 pitch that fits four of them and three 46 gaps between 400 and
         1138. The chip column is 260 wide: `claimRef` plus `default/data stale` is 26 characters,
         about 203 units.
LANES    The event lane runs from the slot floor to the band top, 40 long, and is ridden by the claim
         on `bind` and `release` and by the patch on `recover`. The four write lanes run 70 from the
         band floor to the box tops, and each is ridden on some step. The provisioner lane leaves
         its left face, runs to x 879 and rises into the Released floor, 12 right of the way back,
         which leaves the same floor 12 left.
MOTION   There is no Pod anywhere, so nothing pulses: boxes light. The block that ACTS FIRST is lit
         from entry and sends after `BEAT.lead` (M-18a): the claim, the administrator, the
         provisioner, and on `failed` the band itself, which reads the Released volume before it
         writes Failed. On `release` the claim is lit through `rewind`, the animated path only,
         because it ends the step at zero and a gone block carries no stroke on the static one. A
         phase lights when its write LANDS, never at entry.
         On `delete` the PV object is gone, so the whole board, the four boxes and every line ending
         on one, the provisioner lane included (A-13), dims to OPACITY.notready 400ms after
         the call lands and Released gives up the stroke the call put on it: the narration says the
         volume leaves the row, and a Released box still lit would say it is Released. The cue is an
         F.set rather than `lights`, so the static path never shows a lit phase on that board.
         Every value a write earns waits for it: the phase chip, the claimRef chip and the event
         caption are wound back in `rewind` and turned over by an `F.set` on the arrival. On
         `release` the claim fades on the arrival of its own event, and its lane with it.
WIRE LABELS
         Every riding tag emerges after 400ms, once its ball has cleared the sender: the provisioner
         tag leaves a SIDE face, and at 160 it inked 910..983 over a box whose face is at 947.
         Event names sit under the transition they caused, at y 392. The two counterfactual branches
         each carry an `if` caption (T-35): the Delete one ABOVE the row, starting right of the
         Released write lane, because under the row it would lie across the provisioner lane and the
         way back; the Failed one under the row starting at the Released centre, because centred on
         its gap it starts on the way-back line at 855.
CONTENT  Read against the release in `k8sVersion`. The phase is written by the PV controller: it sets
         Available when claimRef is nil or pre-bound without a UID, Bound when a claim binds,
         Released when the claim is gone, and Failed from its reclaim path (kubernetes/kubernetes,
         pkg/controller/volume/persistentvolume, syncVolume, reclaimVolume, deleteVolumeOperation).
         The Available sublabel is `not bound`, after the docs `not yet bound to a claim`: `no
         claimRef` is rejected because a pre-bound PV carries a claimRef and is still Available.
         For a CSI volume the PV controller does not DELETE: findDeletablePlugin returns no plugin
         when `spec.csi` is set, and the external-provisioner calls DeleteVolume and then deletes
         the PV object (sig-storage-lib-external-provisioner, controller.go). `does not act on a CSI
         volume` is rejected, because the controller still writes Released and schedules the
         reclaim. A failed DeleteVolume there emits VolumeFailedDelete and is retried with the PV
         still Released, so a CSI volume SET TO DELETE does not reach Failed that way. The
         qualifier stays: validation allows Recycle on any PV (supportedReclaimPolicy), and a PV
         whose plugin has no recycler is marked Failed on that path too. `Take that same call and
         let the backend reject it ... it moves to Failed` is rejected on the same ground.
         Failed is `the volume has failed its (automated) reclamation` (Persistent Volumes, Phase),
         so the desc says `reclamation failed, for instance when no plugin can delete it` rather
         than `Failed means no plugin could delete it`. The drawn instance is a hand-made NFS PV
         set to Delete, whose plugin is recyclable but not deletable (pkg/volume/nfs).
         The manual way back is not the only one: the deprecated Recycle policy `performs a basic
         scrub ... and makes it available again for a new claim` (Persistent Volumes, Recycle). So
         the narration, the aria-label and the desc all say `short of` or `apart from` the
         deprecated Recycle, and `The only way back is by hand` is rejected. Clearing claimRef
         returns a Released or a Failed PV to Available because syncVolume writes Available
         whenever claimRef is nil, and binding still needs a MATCHING claim, so `Any claim can now
         bind` is rejected. A Released volume is `not yet available for another claim because the
         previous claimant's data remains on the volume`, which is why the old data is named.
         The docs list four phases. Pending appears only in the Phase transition timestamp note,
         as the phase a newly created volume is set to, which is why the row stays at four.
SCOPE    What happens to the backing DISK under Delete and under Retain, and what a new claim gets
         while a retained volume sits Released, is storage-reclaim-policy. This card draws no disk,
         because its subject is the phase field of the API object. How a claim finds a volume to
         bind is storage-pvc-binding. Handing a Released volume to one named claim, by pointing its
         claimRef at that claim rather than clearing it, is storage-pv-reservation.
NOTE     The claim is DELETED on its step, so it ends at zero rather than as a ghost.
         The main path carries a Retain volume, so the chip reads Retain on `bind`, `release` and
         `recover`, and Delete only on the two branches that are about Delete.
DO NOT   Complete the row with a fifth box. The API type also defines Pending, which the phase list
         in the docs leaves out and a PV passes through only on creation.
         Draw the transitions as arrows with balls. The phase does not travel between boxes: the
         controller writes it, and a ball on the row credits the phase with moving itself.
         Route the provisioner through the band. It never talks to the PV controller.
OPEN     CENTRE and CENTRE-LOW are open here on purpose, one argument for both. The rule counts neither chips nor frames, so it reads the
         content as 400..1179 on 790 and the chip column as a strip on 210. With the column, which
         is the PV object and part of the drawing, the ink spans 80..1179 on 630. Centring the row
         on 600 is not open to this card: the controller band spans exactly the row, and at 231..969
         it would stand under the panel at 1100x800. Carried in test/fixtures/carried.mjs.
```
