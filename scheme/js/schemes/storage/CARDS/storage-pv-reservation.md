## storage-pv-reservation

### layout

```
WHAT     A retained volume full of data is handed to ONE named claim by pointing its claimRef at
         that claim, name and namespace with no UID. The reservation is what keeps every other claim
         out, and the claim naming the volume in volumeName is the other half of the pairing, which
         on its own reserves nothing.
LAYOUT   An object board with no Pod and no frame, in TWO body bands and no third, which leaves the
         stack of STO.L-01 on purpose: nothing here is owned by anything, and the subject is two
         objects pointing at each other at one level. The writers stand on the upper band, the two
         objects the reservation pairs on the lower one.
         The lock is the gap between PV pv-data and PVC app/restore, 144 wide, holding the two
         references as a pair of relations 24 apart: claimRef above (the PV names the claim) and
         volumeName below (the claim names the PV), each captioned per step. The two lines are what
         the card is about, so they stand between the two blocks they join rather than on a spine.
         The rival PVC app/scratch stands on the UPPER band beside the controller, with no line to
         the PV on any step: its only lane is the controller answering it. That it can never reach
         the volume is drawn as distance, not narrated alone.
         The controller forks down from a mirrored pair on its floor (CTRL_CX -12 and +12, L-12) to
         the PV top and the claim top over FORK_Y 285, halfway between the bands. The administrator
         stands left of the PV below the panel and reaches its left face straight.
         The six chips are two columns of fields, three under each object, so a row reads across as
         the two halves of the reservation: claimRef against volumeName, claimRef.uid against
         storageClassName, the PV phase against the claim phase.
PANEL    `OVERLAY_IDS=storage-pv-reservation node --test report/overlay.test.mjs` from
         `scheme/test/`. The deepest reading is `bind` at 1100x800, 254.66. Everything on the upper
         band starts at x 420 or right of it, and the first thing left of x 420 is the administrator
         at y 400, 145 under the deepest reading, so nothing enters the x<=380, y<=300 corner.
SIZES    Every actor is 232 by 80 (NET.L-01): the rival, the controller, the administrator and the
         claim. PV pv-data is a 232 by 80 cylinder, the actor height so both lock lines run level
         from its side to the claim face at 428 and 452. Its spec line stands 14 under the name
         cylinder() prints at h/2 + 5, so it does not re-centre its label (STO.L-02). The chips are
         the family 232 by 34 with an 8 gap (STO.L-03). The tightest pair is `storageClassName`
         against `no claim yet`, 15.0 apart at 1600x1000 (982.3 against 997.3).
LANES    Four lanes, each ridden on some step. `W_ADMIN`, 128, carries the patch on `reserve`.
         `W_ARM_PV`, 514, carries Available, the rival check, the UID write and the counterfactual
         take. `W_ARM_RES`, 298, carries Bound on `bind` and FailedBinding on `named-only`.
         `W_SCRATCH`, 128, carries the two verdicts on the rival. It is born with the rival on
         `rival` and is at zero before it, as the rival is (STO.S-02).
         The two references are relations and carry nothing: a field is written by the controller
         or the administrator, it does not travel (A-06). claimRef is at zero while it names the
         deleted claim and on the counterfactual, when it names the rival, and at full while it names
         app/restore. volumeName is at full from the claim's creation.
MOTION   There is no Pod, so nothing pulses: boxes light. The block that acts first is lit from entry
         and sends after BEAT.lead (M-18a): the administrator on `reserve`, the controller on the
         other three. On `reserve` the controller lights when the patch lands, because it acts on
         the change.
         The two 128 lanes ride SHORT_DUR 1200 rather than routeDur, where both sit on the 700 ms
         floor and the tag retires unread, registered in `PACING` (`render/motion.test.mjs`). The
         two arms ride routeDur, 1142 and 700.
         Every value a ball earns waits for it: chips are wound back in `rewind` and turned over by an
         F.set on the arrival. The rival comes up from zero and the claim from pending on the step
         that creates each, over 500 ms from delay 0.
         On `named-only` the PV phase and the claim phase light through `lights` on their arrivals,
         because the static path compares against `bind` (Bound to Bound, Bound to Pending) while
         the animated path compares against the rewound start, and the two highlight sets must
         agree (S-16).
         Durations 4200 / 4200 / 4400 / 4400 hold every step between 13.1 and 13.9 ms per
         character: `timing.mjs storage-pv-reservation` ranks them against the catalog.
WIRE LABELS
         Riding tags live exactly as long as their ball (M-30a: in 200, out 200, hold 0) and emerge
         300 ms in, once clear of the box they leave. The counterfactual caption stands above the
         branch between the two arms (T-35) and starts 84 right of the PV drop: centred on the lock
         it lay under the `claimRef: app/scratch` tag landing on the PV top. It inks 684..935.5 at
         1100x800 and 684..939 at 1600x1000, clear of the right arm at 976.
CONTENT  Read against the release in `k8sVersion`. Sources: Persistent Volumes, sections Reserving a
         PersistentVolume, Retain and Lifecycle of a Volume and Claim, and upstream where the docs
         are silent: `pkg/controller/volume/persistentvolume/pv_controller.go` (syncVolume,
         syncUnboundClaim, checkVolumeSatisfyClaim, bind), `component-helpers/storage/volume/
         pv_helpers.go` (IsVolumeBoundToClaim, FindMatchingVolume, GetBindVolumeToClaim), the
         DefaultStorageClass plugin `setdefault/admission.go`, and `binder_test.go`.
         The starting state: under Retain a Released PV keeps its claimRef, UID included, and is
         `not yet available for another claim` (Retain). No claim can bind it: FindMatchingVolume
         skips any PV whose claimRef names another claim, and a claim naming it in volumeName is
         refused because IsVolumeBoundToClaim fails on a UID that is set and differs. That holds even
         for a new claim with the old name (binder_test 1-7), which is why the patch drops the UID.
         The reservation: syncVolume writes Available when claimRef.uid is empty, `The PV is reserved
         for a PVC; that PVC has not yet been bound to this PV`, and never looks the claim up, so the
         claim does not have to exist yet. The binder skips the PV for every other claim, the
         docs' `so that other PVCs can not bind to it`. `every other claim skips it` is rejected: the
         binder skips, a claim does nothing.
         The rival: with class "" and no match, syncUnboundClaim assigns no default class (an empty
         string counts as a class), provisions nothing, and records FailedBinding, `no persistent
         volumes available for this claim and no storage class is set`, leaving it Pending.
         The bind: a claim whose volumeName names a PV pre-bound to it is bound directly, the PV
         first with the claim UID written into its claimRef (GetBindVolumeToClaim), then the claim.
         THE DOCS AND THE SOURCE DIFFER HERE, and the card says nothing about checks on this path.
         The docs write `The control plane still checks that storage class, access modes, and
         requested storage size are valid` in the paragraph about volumeName alone, and there the
         source agrees: checkVolumeSatisfyClaim tests size, class, volumeMode, access modes and
         the VolumeAttributesClass, and not node affinity. On the claimRef plus volumeName path the
         source calls bind without that check, and on the claimRef-only path FindMatchingVolume
         returns the pre-bound PV before its class test. So the check is narrated only on the
         counterfactual, the one path both sources agree on.
         storageClassName "": the docs' `Empty string must be explicitly set otherwise default
         StorageClass will be set`, and the plugin writes the default into a claim with no class
         whether or not volumeName is set. The card gives that reason and states no consequence for
         the bind, since on the reserved path the source binds regardless. `Left unset, the bind
         would fail` is rejected on that ground.
         volumeName alone: `This method does not guarantee any binding privileges to the
         PersistentVolume`. With the claimRef only cleared, syncVolume writes Available and a rival
         the binder matches first is bound, and the named claim then gets FailedBinding, `volume
         already bound to a different claim`. `Available to any claim` is rejected for `any claim
         that fits it`: a claim still has to match.
         Not claimed: that both halves are required. A claimRef alone reserves AND binds a matching
         claim with no volumeName (binder_test 1-5), so the card calls volumeName the other half of
         the pairing and never the key.
         The claimRef.uid chip reads `of app/restore` rather than a made-up UUID: the value names
         whose UID is stored, which is the fact the step teaches.
SCOPE    What happens to the disk under Delete and under Retain is storage-reclaim-policy. The phase
         field and its transitions, and clearing the claimRef by hand as the way back to Available,
         are storage-pv-lifecycle-phases: this card owns the targeted reuse, pointing the claimRef at
         one named claim. The binder's ordinary matching scan is storage-pvc-binding. How a claim
         with no class gets one written in is storage-default-storageclass, cited in one clause on
         `bind` and not re-taught.
OPEN     CENTRE is open on purpose. The rule reads the six chips as one strip on 788, where they are
         two columns standing under the two objects they belong to. The blocks span 124..1092 on
         608. Centring the grid on 600 lifts every chip off its object, and moving the pair left onto
         600 leaves no room for the administrator lane into the PV. Carried in
         test/fixtures/carried.mjs.
```
