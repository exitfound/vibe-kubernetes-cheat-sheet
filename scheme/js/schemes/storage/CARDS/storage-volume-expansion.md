## storage-volume-expansion

### layout

```
WHAT     Growing a bound volume, in two phases.
LAYOUT   The centred vertical stack, with tier heights and block footprints taken from
         storage-pvc-protection so the two cards in this subcategory read as one family: the
         vertical pitch is 162 again, measured between midpoints. The spine is the mount ascent and
         balls travel it, so its arrowheads are earned.
         What differs from the sibling is FOUR actors, placed so that not one lane needs more than a
         single turn. The top right slot is SHARED by Kubectl Patch and the StorageClass, which are
         never on stage together (Kubectl acts on the edit and the shrink steps, the class only on
         the gate step), so they occupy one slot and share ONE run between it and the claim, drawn
         as two keyed lanes: `lToPvc` carries kubectl's edit DOWN into the claim, and `lToClass`,
         the same points reversed, carries the gate lookup UP into the class.
         The external-resizer and Kubelet sit level with the disk and mirrored about the spine, so
         the two phases arrive at it from opposite sides at the same height: the controller grows
         the device from one side, the node grows the filesystem from the other, and the disk
         between them is the one object both touch. The 230..310 band in the right column is
         deliberately left empty so the claim lane can drop through it without crossing anybody.
PANEL    Measured bottom lo..hi per viewport: 142.56..160.00 at 1600x1000, 171.42..192.67 at
         1280x860, 204.97..254.66 at 1100x800, the deepest reading on the `node-expand` step at
         1100x800, where every other narrated step stands at 229.82 or less:
         `OVERLAY_IDS=storage-volume-expansion node --test report/overlay.test.mjs` from
         `scheme/test/`.
         At the 900x650 hand row (`STO.L-04`, `L-06`) the panel measures right 386.10, bottom
         430.03, on `gate`, `node-expand` and `no-shrink`.
         Kubelet sits at x=118, well inside the panel's horizontal reach, and clears it only on the
         y axis, at y=392. The blanket `y<=300` is not a measurement: the panel bottom is PER CARD
         and ranges 90 to 379 over the standard viewports (`L-04`). Kubelet is therefore safe only
         while THIS card's own bottom stays under 392, which holds on the three standard viewports
         (137 clear of 254.66) and fails at 900x650, where the 430.03 covers its label.
         The one element placed on a MEASUREMENT is the verdict caption left of the claim, anchored
         end at x=468, y=274, reaching back to about x=290 on its longest string. MEASURE THE
         CAPTION BY ITS RECT, NOT BY ITS BASELINE: y=274 is where the baseline sits, so the 19 units
         that follow from 254.66 are baseline clearance, while the INK starts at 263.0 and the real
         clearance is 8.3, a third of a narration line. A bottom of 231 for this card, and the 43
         units that follow from it, reproduce at no viewport in the list: do not reinstate either
         number.
         The bottom is driven by the TEXT, so it is a per-card number: storage-pvc-protection's same
         caption is shallower purely because its strings are shorter. Every correction to prose here
         is sized against the 254.66 rather than against a sibling. LENGTHENING ANY NARRATION MOVES
         IT.
SIZES    Every actor (the claim, kubectl patch, the StorageClass, the external-resizer, Kubelet) is
         232 by 80 and the Pod 232 by 104 around a 192 by 44 app box (NET.L-01). The tier midpoints
         stay on the 162 pitch, so the claim runs 230..310 and each actor centres on its tier.
         `GAUGE_X = DISK_LEFT, GAUGE_W = DISK_W`: four cells of 5Gi, sized off the disk so the strip
         reads as THAT disk's capacity axis rather than as a fifth chip. 488..516 is the whole
         clearance this band has: the cylinder ends at 475 and the chip strip starts at 545, so a
         taller gauge is bought from one of those two.
MOTION   The two phases are DRAWN. The gauge under the disk is four cells of 5Gi in three layers, a
         track that is always there, a device wash, and a brighter filesystem core inset inside that
         wash. Cell 0 is the original 5Gi and never moves, which is why only three of each layer
         carry a ref.
         controller-expand reveals the device wash on cells 1 to 3, 140ms apart, from the moment the
         call LANDS (`at: 'exp'`, never step entry). node-expand reveals the filesystem core on the
         same beat. The settled frame between the two is the teaching point: three cells holding a
         device and no filesystem. Longest span about 1480ms against a duration of 3200.
CONTENT  The allowVolumeExpansion gate is enforced by the API SERVER on the edit, not by the
         external-resizer afterwards. Raising the request on a claim whose StorageClass does not
         allow expansion is refused at admission with `only dynamically provisioned pvc can be
         resized and the storageclass that provisions the pvc must support resize`, so the resizer
         never sees such a request at all. DO NOT have the resizer consult the class before acting:
         that puts the gate one component too far downstream and makes a rejected edit look like a
         resize that quietly declined to run.
         The second phase is where a FILESYSTEM is grown and a raw block volume has none, but
         skipping it is a DRIVER OPTION, never Kubernetes behaviour. The CSI spec says MAY twice, at
         https://raw.githubusercontent.com/container-storage-interface/spec/master/spec.md : on
         NodeExpandVolumeRequest.volume_capability, "if volume is being used as a block device the
         SP MAY choose to skip expanding the filesystem in NodeExpandVolume implementation but still
         perform rest of the housekeeping needed for expanding the volume", and on
         ControllerExpandVolumeRequest.volume_capability, "the SP MAY set node_expansion_required to
         false in ControllerExpandVolumeResponse to skip invocation of NodeExpandVolume on the node
         by the CO". Kubernetes makes the call either way: pkg/volume/csi/csi_client.go sets
         req.VolumeCapability.AccessType to VolumeCapability_Block inside NodeExpandVolume when
         fsType is the block sentinel, and operation_generator.go runs node expansion out of the
         block MAP path as well (the "MapVolume.NodeExpandVolume failed with %v" log), with no block
         short circuit anywhere in nodeExpandVolume. So all three strings say a driver MAY skip that
         work.
         ONLINE IS A CONDITION, not a given: "File system expansion is either done when a Pod is
         starting up or when a Pod is running and the underlying file system supports online
         expansion", https://kubernetes.io/docs/concepts/storage/persistent-volumes/ , which also
         limits filesystem resize to XFS, Ext3 and Ext4. The desc hedges it ("Where that filesystem
         grows online"), and the pod-sees narration has to hedge it too: it says "because this
         filesystem grows online".
         TWO PHASES IS THE COMMON SHAPE, not the rule. A driver may implement EXPAND_VOLUME on the
         controller, on the node, or both, and the external-resizer sidecar runs either way, doing a
         NO-OP expansion when the driver has no controller capability,
         https://kubernetes-csi.github.io/docs/volume-expansion.html . Judged worth exactly two
         words in the desc, which reads "then one or two phases run" and sits at 469 of the 470
         characters D-04 allows: the node-only NO-OP case is recorded here rather than bought with
         that last character. "The API accepts the edit ... then runs one or two phases" is rejected
         because it makes the API server the subject that runs the phases, where the
         external-resizer and the kubelet do.
         Shrinking: validation refuses any request that is not ABOVE the claim's `status.capacity`,
         "field can not be less than status.capacity" in pkg/apis/core/validation/validation.go at
         release-1.35, and RecoverVolumeExpansionFailure has been GA and locked on since 1.34. What
         that feature allows is walking a pending request back DOWN to a value still above
         status.capacity, which retries a smaller grow. It can never return the request to the old
         size, so the grow is retargeted rather than cancelled, and the no-shrink narration says
         exactly that ("retries a smaller grow, still above the current size"). DO NOT write that it
         cancels the grow.
         THE CLAIM STATUS BY PHASE. After controller-expand the PVC carries the
         FileSystemResizePending condition, allocatedResources 20Gi and status.capacity still 5Gi,
         while the PV already reads 20Gi, which is the `cap` wire. The kubelet writes
         status.capacity 20Gi and clears the condition at the END of node expansion (resize_util.go,
         MarkNodeExpansionFinishedWithRecovery), so the claim sublabel on node-expand is
         `capacity 20Gi` and the pod-sees verdict is `nothing pending`. The external-resizer is a
         sidecar in the driver's controller Pod, not a control plane component, which is why phase
         one "runs on the controller side".
         WHY A SHRINK IS REFUSED is the card's rationale, not an upstream sentence: the docs say
         only "Kubernetes does not support shrinking a PVC to less than its current size". It is
         hedged as "no safe general way" in the desc and the no-shrink narration alike, because
         resize2fs(8) shrinks ext2/3/4 only UNMOUNTED ("It can be used to enlarge or shrink an
         unmounted file system ... If the file system is mounted, it can be used to expand"), while
         xfs_growfs(8) does implement shrinking the last allocation group. The bare "no safe way
         to shrink a live filesystem" is rejected as an absolute that XFS already breaks.
         THE GATE BALL IS A LOOKUP. The API server reads the class while it admits the edit, and the
         API server has no block of its own: it is narrated. So the ball runs FROM the claim, lit at
         entry as the edit under admission, INTO the class, which lights on arrival, and its tag
         says `read at admission`. A ball from the class into the claim is rejected: it draws the
         class as the actor that checks and sends, where the class is only the object being read.
         The admission plugin is PersistentVolumeClaimResize, on by default in the release this card
         targets, and a nil allowVolumeExpansion refuses the same as false
         (plugin/pkg/admission/storage/persistentvolume/resize/admission.go, allowResize).
         Read against 1.35 and holding: the PV doc sections the card cites, validation.go
         ValidatePersistentVolumeClaimUpdate, kube_features.go RecoverVolumeExpansionFailure,
         resize_util.go, the external-resizer resize_status.go and expand_and_recover.go (PV
         capacity is written BEFORE FileSystemResizePending is set), the kubernetes-csi
         volume-expansion page ("NodeExpandVolume is always called by Kubelet on the node", and it
         "*always* requires volume to be published or staged on a node").
NAMING   The five riding tags say what the call CARRIES, never what it is CALLED: the block the
         ball leaves already prints the method name as its sublabel, so a tag copying it verbatim
         prints the method twice. `read at admission` says the class is READ where the gate runs,
         and the two phase tags carry the extent each call moves.
         The mount ascent on pod-sees carries NO tag. The `mount` wire beside the lane already says
         `now 20Gi at /data`, and a `now 20Gi` tag riding the same lane printed through that wire
         mid-flight, then landed on the Pod sublabel `df reads the mount` and sat there about 560ms.
         Every tag is bound through a card-local `makeRidingLabel` at inMs = outMs = 200 and hold 0
         (`M-30a`), so it dissolves with its ball rather than 160ms after it.
         Measured at 1600x1000 at the END of each flight, which is where a block can print through
         it: the two claim-lane tags clear the claim by 1.7 units, `read at admission` ends 41.7
         under the class and 12.7 right of the lane it climbs (CLASS_TAG, dx 64), and the two
         disk-lane tags clear the disk by 4.4, both of which are the DY above and not the text.
         `filesystem 5Gi to 20Gi` ties `requests: 5Gi rejected` as the widest tag, 128.5 units of
         ink and 132.6 by client rect, and at the START of its flight it clears Kubelet by 7.4, as
         `device 5Gi to 20Gi` clears the External-resizer: both tops are at 392 since the actors
         went to 232 by 80. The ink rate is 5.84 units per character on `.scheme-box-sublabel`,
         measured here rather than taken off L-20.
NOTE     The verdict slot reports the state of the CLAIM, which changes kind across the card, so it
         is named for its job rather than for a lane, and it sits hard against the claim instead of
         beside a lane it does not describe.
         The four chips (CHIP_W 252) are the whole lesson: they hold the same number at the start,
         then change ONE AT A TIME in order, so the staggered highlight walking left to right IS the
         two-phase story.
         The six moving gauge cells are filed as scalar refs inside the one `make()` hook, by
         literal assignment. A computed key (`refs['dev' + i]`) is invisible to the ESCAPE_ASSIGN
         regex three test readers share, and every `opacity` and `F.reveal` key on this card
         resolves against that set.
WHY NOT  A card without the gauge: ONE cylinder, and not one of the 7 steps changes its size, so a
         fourfold growth is carried by chip text alone.
         Scaling the cylinder GROUP, measured in the browser at 1600x1000 on the controller-expand
         step. Composed honestly against the group's own translate, `scale(1.6, 1)` stretches the
         label `PV data-vol` from 79.00px to 122.32px wide while its height goes 18.00 to 17.24, so
         the glyphs are distorted rather than scaled. The scale is about the group's local origin,
         so the disk grows to the RIGHT only: its centre travels 80.1px (69 viewBox units), its
         right edge reaches 853 against the External-resizer at x=850, and the mount spine at x=600
         stops landing on the face midpoint L-11 measures it against. Written the way a keyframe
         would write it, as a bare `scale(1.6, 1)`, the CSS transform property REPLACES the SVG
         transform attribute and the disk teleports 483px left, under the narration panel. M-04 as a
         number.
DO NOT   Do not write "a raw block volume skips this phase entirely", in the narration, the desc or
         the aria-label, however natural it reads. It reads like a lost qualification and invites
         being restored, and it is false: the CSI spec says the SP MAY skip the filesystem step and
         MAY answer node_expansion_required false, so the option is the DRIVER's and Kubernetes
         issues NodeExpandVolume for a block volume all the same. The two MAY quotations and the two
         source files that settle it are in the CONTENT block above. The honest verb is "may skip".
         Do not caption the gauge. Its two layers are named by the two chips that move with them
         (`real disk` and `filesystem`), and a caption would be the defect NAMING states for the
         riding tags: a string carrying nothing the reader does not already have two lines away.
         Do not give a cell a class instead of an inline fill: no field writes a fill, and a class
         here is a `diagrams.css` rule owned by one card.
         Do not light the app box on pod-sees. The Pod pulses there, and a lit container outlives
         the blink as a separate bright rectangle (`STO.C-02`): the pulse is the Pod's whole cue.
OPEN     BELOW THE STANDARD SET THIS CARD DOES NOT HOLD, and the cost is per element rather than one
         panel number. At 900x650 the panel measures right 386.10 / bottom 430.03 on `gate`,
         `node-expand` and `no-shrink`, 397.38 on `controller-expand` and `pod-sees`, and 364.74 on
         `idle` and `edit`, re-measured step by step (`overlayProbe`, rects through `__toRoot`):
           verdict caption   y 262.7..277.2, right edge pinned at 468, so its LEFT end is under the
                             panel on every step: 105.1 of the 187 units of `request raised, nothing
                             moved` (56 percent) and 21.3 of the 103.2 of `filesystem grown`.
           Kubelet           x 118..350, y 392..472, so the top 38 units (47 percent of its height) sit
                             under the 430. It is drawn on ONE step, `node-expand` through NODE_ON, and
                             that step is one of the three at 430.
         NO CHEAP CLEARANCE EXISTS. The caption is anchored `end` hard against the claim and its
         only free direction is DOWN, into the disk cap at 389 and the two phase lanes on DISK_MID
         432.
         Kubelet is the LEFT half of the mirrored pair the whole layout is built on (the two phases
         reaching the disk from opposite sides at one height), so moving it right or down says
         something false about which side each phase comes from, and the panel still reaches 430
         whatever it does. The remaining lever is prose, and CONTENT above is why each of these
         narrations is at its floor. 900x650 is a hand sample no check takes (`STO.L-04`, `L-06`),
         which is why this is OPEN rather than a regression: over the three sampled viewports every
         element clears, the caption by 8.3 units.
```
