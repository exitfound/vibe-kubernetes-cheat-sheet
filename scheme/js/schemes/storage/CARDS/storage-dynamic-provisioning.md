## storage-dynamic-provisioning

### layout

```
WHAT     Same grammar as storage-pvc-binding: the IDENTITY COLUMN is the spine (PVC on top, the PV that
         ends up bound to it directly below, both the same width and x), and the machinery sits in a
         column to the RIGHT. The difference is that here the disk does not exist yet: the cylinder is
         invisible until CreateVolume returns, and the Bound link is drawn only once the PV object has
         been written.
LAYOUT   The drawing's centre is NOT the canvas centre and cannot be, and the chip strip is the one
         exception, centring on CANVAS_CX because it sits below everything with the full width.
         The two columns come out at 400..880, centre 640, the edge of what L-13 accepts. The centre
         is set by the RIGHT edge: two columns and the 40 elbow channel may span 480 from LEFT_X, so
         `BOX_W` is derived from that bound rather than typed.
PANEL    Measured bottom lo..hi per viewport: 142.56..142.56 at 1600x1000, 171.42..171.42 at
         1280x860, 180.12..204.97 at 1100x800, the deepest reading on the `provision`,
         `createvolume` and `bind` steps:
         `OVERLAY_IDS=storage-dynamic-provisioning node --test report/overlay.test.mjs` from
         `scheme/test/`.
         The right edge is 396.55 at 1100x800, and LEFT_X 400 clears it by 3.45.
         The Bound caption is anchored to the RIGHT of the spine, growing away from the panel: left
         anchored it reaches back to x=286 at its current length, into the panel column.
SIZES    Every block is 80 tall (NET.L-01), and 220 wide rather than 232, a departure the panel wall
         forces: two 232 columns and the 40 channel from x=400 centre on 652, which is a CENTRE and a
         CENTRE-LOW finding. The widest string in either column, `provisioner: ebs.csi.aws.com`,
         inks 171.8, so 220 still leaves 24 a side. The cylinder takes the identity column's 220.
         The chip strip is `chipStrip` on CANVAS_CX: four equal chips at the family 232 and 16
         (`STO.L-03`), the same strip `storage-pvc-binding` draws. The tightest pair is `PV` +
         `pvc-a7f2 created`, 84 clear where `P-07` asks 4.
LANES    The descent (CreateVolume) and the ascent (the volume handle coming back) take SEPARATE lanes
         so the round trip reads as a loop.
         The identity spine and the PV write BOTH run down the centre of the identity column. They can
         share that x because they are never on screen together: the write arrow shows only while the
         PV is being created, the spine only once it is bound. Any other arrangement puts one of them
         off centre.
         ELBOW_X is the ONE vertical channel between the two columns, derived from the gap so it stays
         centred if either column is resized. The claim descending into the provisioner and the PV
         write leaving it both turn on this x, and their vertical runs do not overlap in y (122..274
         above, 306..396 below), so sharing it reads as one clean lane. Those four y values are
         MIRRORED lane offsets, not free numbers: two lanes meet the claim's right face at 110 +/- 12
         and two meet the provisioner's left face at 290 +/- 16.
         The Bound link is a `P.relation` dashed 5 5, the same mark as the class reference: nothing
         travels either one. A bare solid `<line>` there reads as a heavy lane beside the dashed ones.
         The provisioner-to-PV wire is hidden until the step that writes the PV: it points AT the
         cylinder, and the cylinder does not exist until CreateVolume has returned, so drawing it from
         step 0 is an arrow aimed at blank canvas. It appears at the ENTRY of that step (the ball has
         to have a wire to ride) while the cylinder appears later, on the ball landing.
MOTION   This card has no Pod at all, so NOTHING pulses or blinks. The packet-less first step is fully
         static by design and its read is carried by the .highlight outline alone: a box flash would be
         canon-legal there but is wrong, because the StorageClass is being READ, not acting.
         Both values a ball EARNS wait for that ball (`P-03`). The `disk` chip holds the `none` the
         provision step left and takes vol-0abc123 when the handle comes back up (`back`, 1500ms),
         which is the arrival of the ball whose riding tag carries that same string. The `PV` chip and
         the `backed by vol-0abc123` caption hold what createvolume left until the write lands in the
         cylinder (`write`, 700ms), the beat that reveals the cylinder itself, so the caption never
         describes a link that is not on screen yet. Both use the `rewind` form and leave `chipsCued`
         and `wires` carrying the END value, so the static path lands on the end state unchanged.
WIRE LABELS
         `RETURN_TAG_DX` -30: the call tag parks on the backend top where the return tag leaves 100ms
         later, so the pair needs to be apart on x. At 18 units of ink the call tag needs no offset at
         all: on its own lane it clears the wire, which starts 22 right of that lane, by 13, and the
         return tag beside it by 16.4 at 1280x860. Only the return tag keeps an offset, which is why
         the constant is named for it.
         `PARAMS_TAG_DY` -6 keeps the params tag inside the class box instead of astride its bottom
         edge, and `PV_TAG_DX` -17 clears the provisioner edge by 1.6 to 3.8 on
         the vertical run at the three viewports, where `PV pvc-a7f2` inks about 66.
         The `claimRef: data-claim` caption stands 16 right of the spine at y 380, inking 369..384,
         between the provisioner floor at 330 and the cylinder top at 430, where nothing else is
         drawn on the `bind` step. Its ink is not one width: 122.7 at 1100x800, 125.9 at 1280x860,
         137.8 at 1600x1000.
CONTENT  The PV is named `pvc-a7f2`, and a bare `a7f2` is rejected: the external-provisioner names
         what it creates `pvc-<claim UID>` (`getProvisionedVolumeNameForClaim` in
         sig-storage-lib-external-provisioner, and the README: `--volume-name-prefix` defaults to
         "pvc"), so `a7f2` stands for the claim UID, shortened.
         The `bind` narration names the binding controller, "it writes volumeName on the claim", and
         `There is nothing to search for ... so the pair goes straight to Bound` with no actor is
         rejected: the provisioner only sets the claimRef, under the upstream comment "Set ClaimRef
         and the PV controller will bind and set annBoundByController for us", and pv_controller.go
         finds the pre-bound volume ("volume already bound, finishing the binding") and runs the
         same bind() `storage-pvc-binding` draws. The controller is narrated, not drawn: this card
         has no block for it and its subject is the provisioner.
         `watches for Pending claims whose class names it` ships, `a class it owns` is rejected: a
         StorageClass names its provisioner in `provisioner` and nothing owns a class. The PV
         controller hands the claim over through the `volume.kubernetes.io/storage-provisioner`
         annotation, which carries that name.
         The ball from the class carries `type: gp3`, a parameter, and `ebs.csi.aws.com` is rejected
         there: the narration says the provisioner reads "the settings the class carries", and the
         provisioner name is already the class sublabel.
         Verified and unchanged, read against 1.35: "Without dynamic provisioning, cluster
         administrators have to manually make calls to their cloud or storage provider to create new
         storage volumes, and then create PersistentVolume objects to represent them" (`nomatch`),
         a StorageClass "specifying a volume plugin (aka provisioner) that provisions a volume and
         the set of parameters to pass to that provisioner" (`provision`), CreateVolume handing back
         the volume id the PV then carries (`createvolume`, `createpv`), and the PV written already
         carrying the claimRef (the desc).
NAMING   The backend sublabel names the CSI driver because the narration says CreateVolume is called ON
         the driver, and the driver has no box of its own: the ball lands here, so this box has to
         admit it is the driver plus the backend behind it, or the text names an actor the picture does
         not have.
         The riding tag says what the ball CARRIES, the wire says what the lane IS. A call tag of
         `CreateVolume 5Gi` says both, and the wire beside it already says the verb, so the two print
         the word `CreateVolume` twice within 58 units of each other. The tag is `5Gi`, which is the
         size the claim asked for and the one thing on that ball the wire does not name.
WHY NOT  A 4 unit lane offset on the shared faces: far too small to register as a deliberate lane
         split (those use LANE_DY, 15), so it just looks like a misalignment, and a single lane off a
         face midpoint on its own reads as a slip.
         A machinery column of 240 and an elbow channel of 80: the bbox runs 400..920, off centre by 60.
         Both columns at 232 with the 40 channel: 400..904, centre 652, a CENTRE finding. At 232 with
         a 16 channel the centre is 640, but the elbow stubs shrink to 8, the arrowheads sit on the
         turns, and the claimRef caption runs into the provisioner face.
         Hand-placed chip x values: the strip spans 90..1080, a centre of 585.
         The Bound caption level with the provisioner, at y 296: at 1600x1000 it inks 526..663.8,
         3.8 into the provisioner face at 660, though it clears that face by 11.3 at 1100x800.
         A call tag of 101 units of ink (`CreateVolume 5Gi`) beside the 69 of the return tag at dx 0:
         the two print as `voCr@ate1V2i5lume 5Gi` for 200ms at a baseline gap of 0.00. Offsets of
         +-30 clear that but put the call tag across the static `CreateVolume` wire over 58 units of x.
DO NOT   Light the backend on `createpv`: nothing reaches it on that step and the narration does
         not name it, so a lit box there credits it with the PV write.
         Slide LEFT_X leftward after measuring the panel at your own window size: a left edge picked
         from a single wide-window measurement looks centred on the machine it was tuned on and slides
         under the panel on a laptop.
         Rebuild the class reference and the Bound link from hand-copied coordinates. Both are driven
         FROM their points arrays, and with W_SC_REF and W_BOUND left unused, editing either constant
         moves nothing and the two silently drift apart. The class reference carries no arrowhead:
         nothing travels it, the claim only NAMES its class.
NOT A DEFECT
         `report/arrival.test.mjs` prints R2-ENTRY `NO CUE IN STEP` on step 4 for `disk`, CARRIED in
         `test/fixtures/carried.mjs`. It is the frozen-sampling artefact: createvolume winds the chip back
         to none in `rewind` and turns it to the volume id with a cued F.set when the CreateVolume answer
         lands, so a t=0 frame first sees the turnover one step late. R2-STEP lists nothing.
```
