## storage-default-storageclass

### layout

```
WHAT     Four claims in creation order, the two writers that can put a class into a claim that left
         it out, and the class catalog whose lit rows say which classes carry is-default-class. The
         one claim that set storageClassName to "" is the one no writing lane reaches: its only line
         goes down to the classless PV nfs-01.
LAYOUT   An object board with no Pod and no frame, in three bands, which leaves the stack of
         STO.L-01 on purpose: nothing here is owned by a Pod, and the subject is WHO writes a field
         into a claim, so the writers sit on the band above and below the claims rather than on one
         spine. The admission plugin is on top because it acts at creation, on the way in. The PV
         binding controller is underneath because it acts afterwards, on a stored claim.
         The claims run left to right in the order they are created, centres 204 / 468 / 732 / 996,
         mirrored about 600, so the admission pair reaches data-a and data-d over two buses of equal
         length and the bbox centres on 600.
         The class catalog is a P.chain: three rows ordered by creation date, a lit row meaning the
         class carries the annotation. Which class is default is state, so it is the chain's lit set
         per step ([0], [0], [], [1], [1, 2]), and "the most recently created wins" reads straight
         down the list. The standing caption above it names what a lit row means.
         No chip strip: the value that changes is a field ON a claim, so it is that claim's own
         sublabel, and a strip would restate the four sublabels.
PANEL    `OVERLAY_IDS=storage-default-storageclass node --test report/overlay.test.mjs` from
         `scheme/test/`. The deepest reading is the `omitted` narration at 1100x800, 204.97, shown
         on the idle step as the poster preview. Everything in the top band starts at x 484 or right
         of it. The first thing left of x 420 is the left admission bus at y 318, 113 under the
         deepest reading and below y 300, so no lane or riding tag enters the x<=380, y<=300
         corner, then data-a at y 380.
SIZES    Every actor is 232 by 80 (NET.L-01): the admission box, the four claims and the controller.
         PV nfs-01 is a 180 by 86 cylinder with its spec line 62 under its top, the pvc-binding form,
         so it does not re-centre its label (STO.L-02). The chain is 296 wide: its widest row,
         `StorageClass standard, created 2024-05`, inks 233.1 at 1100x800, 239.2 at 1280x860 and
         261.9 at 1600x1000, which leaves 24 to the row's right edge at the widest. The widest
         sublabel, `storageClassName: standard`, inks 163.7 at 1280x860 inside 232.
LANES    Three lanes, one per claim a writer reaches, each carrying a ball on exactly one step:
         `W_ADM_TO_A` (omitted), `W_CTRL_TO_C` (retro), `W_ADM_TO_D` (overlap). The two admission
         lanes leave the admission floor as a mirrored pair at CX -12 and +12 (L-12) and turn on
         BUS_Y 318.
         Two relations carry nothing. The read line from the admission box meets a bracket spanning
         all three chain rows, because the plugin reads the flags of every class and a line into the
         face of the middle row reads as the plugin reading fast alone. The Bound link from data-b to
         PV nfs-01 is a relation at 0 until the `empty` step fades it in, and at full after that.
         Every lane and relation is pinned at full on every step through `stage()`: a claim not
         created yet stands at pending, and its lane keeps full opacity (no dimmed arrow).
MOTION   Every writer is lit from the step entry and its ball leaves one BEAT.lead later (M-18a), so
         the admission ball on `omitted` leaves at 800. On `empty` nothing travels: data-b is stored
         as written, and at BOUND_AT 1400 the controller and PV nfs-01 light as the Bound link fades
         in, because the controller is the actor that makes the pairing.
         Steps 3 to 5 open with the admin editing an annotation: the chain's lit set turns over at
         FLAG_AT 300, and whatever reads the new flags acts at AFTER_FLAG 1100, one BEAT.lead later.
         `rewind` puts the previous lit set back for the animated path, so the static path lands on
         the end state.
         The admission ball rides routeDur, 588 units in 1307 ms. The controller hop is 80 units and
         rides LEG_DUR 1500 (registered in `PACING`, `render/motion.test.mjs`): on routeDur it sits
         on the 700 ms floor and its tag retires unread.
         Each claim comes up from pending to full on the beat that stores it: the admission ball's
         arrival on data-a and data-d, delay 0 on data-b, AFTER_FLAG on data-c.
         Durations 3200 / 3200 / 3200 / 3600 / 3400 put every step between 12.0 and 12.9 ms per
         character, a deliberately unhurried read for the section's easy way in:
         `timing.mjs storage-default-storageclass` ranks them against the catalog.
WIRE LABELS
         The admission tags stand 34 off the trunk on the side away from the twin lane, and emerge
         300 ms in, once the ball has cleared the admission floor. The controller tag `fast` rides
         16 under and 26 beside its ball and emerges 700 ms in: earlier, the ease-in start leaves it
         on the controller top edge, and above the ball it would end inside data-c over its
         sublabel. Both live exactly as long as their ball (M-30a): in 200, out 200, hold 0.
         `Bound` stands 12 right of the relation, midway between data-b and the cylinder.
CONTENT  Claims read against 1.35, sources: the Storage Classes page (Default StorageClass), the
         Persistent Volumes page (Class, Retroactive default StorageClass assignment), the Admission
         Controllers page (DefaultStorageClass), and upstream where the docs are silent:
         `setdefault/admission.go`, `pv_controller.go` syncUnboundClaim and
         assignDefaultStorageClass, `GetDefaultClass` in `pkg/volume/util/storageclass.go`, and
         ValidatePersistentVolumeClaimUpdate in `pkg/apis/core/validation/validation.go`.
         The writer at creation is the DefaultStorageClass admission plugin, a mutating plugin on
         the default-enabled list, and it acts on CREATE only
         (`admission.NewHandler(admission.Create)`).
         The retroactive writer is the PV binding controller, `assignDefaultStorageClass`, which
         skips a claim that `PersistentVolumeClaimHasClass`. That helper is true for any non-nil
         storageClassName, the empty string included, which is why `An empty string is a value, so
         the plugin leaves it alone` ships.
         `A claim like it could still bind a volume that has no class, but nfs-01 is already bound`
         ships on `gap`: a nil class reads as "" in `GetPersistentVolumeClaimClass`, so
         FindMatchingVolume can pair such a claim with a classless PV, and syncUnboundClaim tries
         the default only when no volume matched. A bare `data-c waits Pending` would hide that. The
         step 4 sentence keeps the docs wording (`finds unbound claims that still have no
         storageClassName`) and the desc says `into the still unbound claim`: `writes it in once one
         appears` with no qualifier is rejected, a claim that bound to a classless PV first keeps no
         class.
         `a class, once written, does not follow the default` rests on validation, since the docs
         are silent: the update check lets storageClassName change only from nil to a value
         (`validateStorageClassUpgradeFromNil`), and otherwise "spec is immutable after creation".
         `the most recently created of the two` ships and `the one annotated last` is rejected:
         `GetDefaultClass` sorts by creationTimestamp, newest first, and the docs say "uses the most
         recently created default StorageClass". The drawn dates (2024-05, 2025-02, 2026-03) are
         what makes ultra the newer, and the narration speaks no date.
         `Outside a migration, keep just one default` carries the docs' own advice: "You should try
         to only have one StorageClass in your cluster that is marked as the default. The reason
         that Kubernetes allows you to have multiple default StorageClasses is to allow for seamless
         migration." The `gap` order is the one the Persistent Volumes page names, "removing the old
         one first and then creating or setting another one".
         Verified and unchanged: the annotation key `storageclass.kubernetes.io/is-default-class:
         "true"`, "A PVC with its storageClassName set equal to "" is always interpreted to be
         requesting a PV with no class", and the claim staying Pending with a FailedBinding event
         when nothing matches and no class is set.
SCOPE    The disk the class then builds is `storage-dynamic-provisioning`, how the binder matches a
         claim to a volume is `storage-pvc-binding`, `volumeBindingMode` is
         `storage-topology-aware-provisioning`, `allowVolumeExpansion` is `storage-volume-expansion`,
         and `reclaimPolicy` is `storage-reclaim-policy`. data-a, c and d are not followed past the
         moment their class is written.
NOT A DEFECT
         A seek frame (frames.mjs) of steps 1 and 3 to 5 shows the sublabel and the chain rows as
         `rewind` left them: the turnovers are arrival `F.set` writes, which a seek never fires
         (M-35). `tools/settled-dump.mjs` reads the real playthrough and shows every step ending on
         the four values the aria-label states.
OPEN     `report/geometry-soft.test.mjs` CENTRE: the class catalog is a P.chain, so the rule reads it
         as a chip strip spanning 772..1068 on centre 920. It carries no chip: it is the list the
         admission plugin reads, on that box's mid height and right of it. The blocks span 88..1112
         on 600. Centring the chain on 600 lays it over the admission box, and moving it below the
         claims takes it away from the plugin that reads it, so the finding stays open and is
         carried in `test/fixtures/carried.mjs`.
```
