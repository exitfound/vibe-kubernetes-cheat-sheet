## storage-volume-attach-limits

### layout

```
WHAT     The one CSI failure that happens BEFORE anything is bound, attached or mounted: the Pod
         never gets a node at all. Every node has a hard ceiling on how many volumes one CSI driver
         may have attached at once, and running out puts the Pod in Pending reporting "node(s) exceed
         max volume count" while every node still has spare CPU and spare memory.
LAYOUT   A vertical stack of the claimant, the decider, then the ceiling stated TWICE: as an API
         object (CSINode holding allocatable.count) and as reality (three node frames, each an 8-slot
         attachment strip). Those two tiers are deliberately adjacent, because the mechanism is that
         the number in the object has to agree with how many disks really hang off a machine, and the
         card asks the reader to compare the two rows.
         CONTENT_W puts CONTENT_CX exactly on 600, forced by the chip strip: at 976 units it is far
         wider than anything above it and is therefore the tier that sets the visual centre. On 600 it
         spans 112..1088 and the two margins agree.
         The upper three tiers all live inside 400..800 because they sit ABOVE 406, the 900x650
         bottom on `cap`, where the L is still closed. Only the node row (frame tops at 426) and the
         chip strip cross to the left, and both are below it.
         That is the whole reason the report lanes CONVERGE instead of running straight up: the row
         underneath is wider than the object it reports into, and the object cannot grow to meet it.
         ONE CSINode box spans the full node tier, not three stacked over three columns (WHY NOT
         below).
PANEL    The deepest step on every viewport is `cap` (and the poster, which previews it):
         `OVERLAY_IDS=storage-volume-attach-limits node --test report/overlay.test.mjs` from
         `scheme/test/` prints the reading.
         At the 900x650 hand row the same step reaches right 398.3, bottom 405.5, so x<=398 and
         y<=406, and the bound is an L: above 406 nothing may sit left of 400, below it the full
         width is free. On `cap` the `cap 8` tag (ink x 318.8..349.2, y 401.4..415) does not hold
         that: it lies under the panel at 900x650, while over the standard viewports it clears the
         deepest reading by 171.
SIZES    The Scheduler and CSINode are 232 by 80 and the Pod 232 by 104 around a 192 by 44 PVC box
         26 under the Pod label (NET.L-01). Measured after fonts.ready at 1100x800, the widest string
         in a block is the CSINode label `CSINode (one per node)` at 137.4, 47 either side, then the
         Scheduler sublabel `NodeVolumeLimits filter` at 141.1.
         The node row is deliberately WIDER than the tiers above and hangs outside CONTENT_W on both
         flanks. The node frames are 140 tall and the counters sit 8 off their floor, which with the
         Pod-to-Scheduler gap at 46 keeps the stack at 18 above and below.
         The catalog width is what gives the two outer report lanes somewhere to travel: they rise on
         their own node centres, 350 and 850, and run IN to a side wall, so every unit the box gives
         up on each flank is a unit of visible horizontal run. At 232 the box is 484..716 and each
         run is 134 units; at 400 it would reach 400..800, the run would drop to 50 and the turn all
         but collapse onto the rise.
         CHIP_W 232 clears the worst pair with ~22 units between the halves:
           allocatable.count 117 + `8 per node` 69 = 186    Pod web-0 62 + `placed on node-3` 110 = 172
           blocked by 69 + `max volume count` 110 = 179     attached 55 + `24 of 24` 55 = 110
LANES    Each report lane leaves its node dead centre of the top face, so the three read as rising
         straight out of the three machines, and takes ONE 90 degree turn at most.
         The filter read runs dead down the spine, which is also where node-2 reports in from below,
         so the CSINode box has ONE vertical axis through it rather than two near-misses.
         The Pod and the Scheduler talk BOTH ways, each direction on its own lane. LANE_DX 40 is not
         cosmetic: the return lane carries a riding tag that comes to rest in the corridor, and at 14
         that tag (about 96 units) prints straight over the outbound lane.
         The FailedScheduling answer comes back DOWN its own lane rather than up the request lane,
         because that event is a thing the scheduler PRODUCES, not the request bouncing.
MOTION   ONE duration for all three report balls, so they leave together and LAND together. Their
         paths differ (222 units on the flanks against 48 up the spine) and routeDur is length-based,
         so left alone the centre ball arrives first and the object lights before two thirds of the
         report has got there. Both lengths fall under the PKT_DUR_MIN floor and coincide anyway,
         which is precisely why it is pinned: a tier moving far enough to push a flank past 315 units
         would otherwise silently desync the three. REPORT_DUR is the max of the three routeDurs, so
         today no ball flies at a speed its route does not explain and the card needs no entry in the
         `PACING` map of `render/motion.test.mjs`. Past 315 the spine ball would, and that map would
         turn red.
         The riding label takes the SAME dur, or it drifts off its ball and rejoins at the endpoints.
         All three fire together rather than in sequence: three copies of one mechanism, and walking
         them would suggest an ordering that does not exist.
         The placement on `detachlag` is ONE number, PLACE_MS 2000: the freed slot is retaken at 1600
         plus a 400 fade, the Pod blinks on that instant, and the Pod chip, the Pod sublabel and the
         PVC sublabel all turn over on it as one family (`P-04`). Stated at t=0 the three read
         `placed on node-3` while the reader is still watching the slot free at about 900ms. Same
         shape as `fill` two steps up, whose chip waits for FILL_END.
         The newly taken slots fade in one after another, left to right and node by node, so the
         strip reads as FILLING rather than cutting to a full state. Pinned full above the guard
         first, so a cancel mid-fill lands on eight of eight. `seq` is a running counter across ALL
         THREE nodes: computing the delay from i and the node's own starting count double-counts
         node-1 and pushes the last slot past the step's duration, so auto-advance cuts the fill off.
         The last step's transient (slot empties, counter reads seven of eight, slot comes back
         bright) is OPACITY ONLY, never fill. The counter text is the one thing that still rides
         onfinish, and it self-heals because the next step rewrites every counter.
         The Pod is ABSENT at rest, not dim: a ghost Pod from the first frame says the scheduling
         attempt is already under way, the opposite of the setup. The three report lanes stand at full
         from the first frame, unlike every other lane here, because what they carry is a standing
         relationship that is true before the card starts.
WIRE LABELS
         `CAP_TAG_DX` [-16, 0, 16]: the two outer report lanes end on the CSINode side faces, so a
         centred tag straddles them for 400ms. Each outer tag steps 16 further out, mirrored, which is
         the least that clears on all four viewports. The middle entry stays 0 on x: that lane enters
         the box floor dead centre, where `allocatable.count: 8` sits, and the only clear band on x
         is 74 units away, far past the offset ceiling. It takes CAP_TAG_DY instead and rides BELOW
         its ball.
         `CAP_TAG_DY` [-14, 22, -14], because the three lanes do not land on the same face. The outer
         two arrive at the side faces and keep the family offset. The middle one arrives at the
         FLOOR, where -14 parks it on `allocatable.count: 8` (31.5 x 7.8 of ink, 400ms at a baseline
         gap of 1.22) and inside the box for 500ms more. At 22 it parks 14 clear of the floor, in the
         corridor above node-2, and 22 rather than 16 because the ball is r=5 with a 6 unit glow and
         at 16 it prints on the line.
         `read allocatable.count` on the filter step, drawn from t=0, is the widest text-on-text pair
         in the catalogue (138.5 x 5.8, 200ms), and no offset can close it: the Scheduler sublabel and
         the tag are both centred on 600, so they overlap on x at every dx, and the read lane is only
         50 units long. Shortening the string does not help for the same reason. It is closed by
         TIME: READ_TAG_EMERGE 300 is what the ball needs to put 22 units between its tag and the
         Scheduler floor, and the same emergence removes a 100ms cut on that tag.
         `schedule web-0` on `ask` starts on the Pod sublabel `Pending` for the same reason the read
         tag starts on the Scheduler sublabel: both are centred near the lane and the lane is 46 long.
         It takes the same `emergeTag` and READ_TAG_EMERGE 300, which puts the ball 20 units below
         the Pod floor before the tag shows.
         The FailedScheduling tag rides BELOW the ball: pod() puts the sublabel 8 units above the
         shell bottom, and a tag at the default -14 prints on top of it for the last beat of the
         flight.
CONTENT  Three points checked against source, each a claim that is easy to get wrong:
         1. The node-driver-registrar does NOT write CSINode. It runs a registration socket naming
            the driver and its endpoint, and nothing more. KUBELET calls NodeGetInfo
            (pkg/volume/csi/csi_plugin.go, RegistrationHandler.RegisterPlugin) and hands
            maxVolumePerNode to the node info manager, which writes
            spec.drivers[].allocatable.count.
         2. NodeVolumeLimits does NOT run on every scheduling attempt: PreFilter returns Skip when
            the Pod has no PVC, no generic ephemeral volume and nothing inline-migratable, which
            suppresses Filter for that Pod entirely. Verbatim, from
            pkg/scheduler/framework/plugins/nodevolumelimits/csi.go at release-1.35:
            `if vol.PersistentVolumeClaim != nil || vol.Ephemeral != nil ||
            pl.translator.IsInlineMigratable(vol) { return nil, nil }` over pod.Spec.Volumes, and
            `fwk.NewStatus(fwk.Skip)` when the loop finds none. The `ask` narration says "a Pod that
            claims no volume is skipped", keyed on the claim the way the code is (DO NOT below).
         3. What Filter counts changed upstream in 1.32 (PR 127757, issue 126502). Before 1.32 it
            counts only the volumes of Pods assigned to the node, so deleting a Pod frees its slot
            instantly and the replacement lands in ContainerCreating with FailedAttachVolume. Since
            1.32 the count is the de-duplicated union of those Pod volumes AND every live
            VolumeAttachment for the node, so the slot is held until the VolumeAttachment is deleted:
            "released by a detach, not by a Pod dying". A QueueingHint on VolumeAttachment delete
            requeues it when the slot really opens. This card targets 1.35, so the `filter` step
            names both terms of the sum.
         4. THE FILTER REJECTS ON THE SUM, NOT ON "AT THE CEILING". The `fill` step calls a Node at
            its ceiling healthy, and the Filter in the same csi.go rejects only when the volumes the
            Pod would ADD plus the ones already counted exceed allocatable.count. So `filter` reads
            "Eight plus the one web-0 needs is over a ceiling of eight", and the desc "rejects any
            Node the Pod would push past it". "Eight against a ceiling of eight" is rejected: it
            reads as the Node being refused for being full, which `fill` has just denied.
         5. PLACED IS NOT RUNNING. At PLACE_MS the Scheduler has bound web-0 to node-3, and its
            phase is still Pending: the attach of data-web-0, the mount and the container start all
            come after. `detachlag` and `fix` therefore state `placed on node-3` on the Pod chip and
            sublabel and `attaching to node-3` on the PVC. `Running on node-3` and `attached on
            node-3` are rejected: no step narrates the attach or the start, and the slot that fills
            back in is the Scheduler counting the claim, not a finished attach.
         6. `Node-3` in the `detachlag` narration stays capitalised, against the `node-3` drawn on the
            frame and the chip: that is the T-06 house spelling of a node NAME in prose, enforced by
            render/inline.test.mjs, not a slip.
         Checked TRUE and left: the CSI NodeGetInfo field is max_volumes_per_node; the event text
         "0/3 nodes are available: 3 node(s) exceed max volume count"; `FailedScheduling` on the Pod
         chip and sublabel is the event reason a reader meets in kubectl describe, and the narration
         calls it the event. MutableCSINodeAllocatableCount (first available in 1.33, stable in 1.36) lets
         Kubelet REWRITE allocatable.count later, which the `cap` narration does not contradict: it
         says who writes the number, not that it is written once.
         Node-specific volume limits, checked: the DEFAULTS are EBS 39, GCE PD 16, Azure Disk 16, but
         with dynamic limits the real ceiling is per instance type: EBS 25 on M5/C5/R5/T3/Z1D and 39
         elsewhere, Azure up to 64, GCE up to 127. Not 128 for GCE, the off-by-one everyone makes.
BUDGET   ~300 characters, and that ceiling is BOUGHT: it is what pays for the node row being wide.
         At up to 470 characters the bottom lands at 498 and the node tier has to squeeze inside
         400..800. Held at ~300 the 900x650 panel reaches 405.5 on `cap`, the node frame tops at 426
         clear it by 20.5, and the row can spread to 720 units, though the `cap 8` tag riding above
         the left frame does not clear it. Overrun and the widest node goes back under the
         panel.
SCOPE    The only card in the csi row whose subject is SCHEDULING. Its six siblings all begin with a
         Pod that already has a node, so the whole vocabulary of the section (VolumeAttachment,
         stage, publish, fsGroup, force-detach) is downstream of a decision this card is about.
NOTE     The slots are plain rects, not box() primitives: they are not blocks that can act, so they
         must never take .highlight, pulse or receive a packet. They are a gauge, and the only thing
         they ever do is change fill.
         Every step calls setSlots with all three nodes, for the same reason every step writes every
         chip: a node left unset keeps the previous reading, and a counter disagreeing with its own
         slot strip is the one error on this card a reader cannot catch.
WHY NOT  Pack the node row inside CONTENT_W at 120 per node: that makes a whole machine the smallest
         object on a card whose subject is what a machine can hold.
         Three CSINode boxes over three columns: they are identical in every field that matters, so
         the row reads as a repetition the card never uses, and the story is about that number
         against the slots. Spanning the tier also lets all three report lanes converge into one face.
         Two turns on the outer report pair along a shared mid-corridor: a zigzag, three segments to
         say one thing, and the corridor between the tiers then reads as plumbing.
DO NOT   Sit the PVC low against the Pod sublabel: the box is then pinned against the Pod floor with
         all the slack on top, which reads as the Pod being mis-drawn. It takes the catalog 26.
         Drive the slot fill through onfinish: the step's END state then depends on a callback
         firing, so a seek or early cancel leaves the slot showing the transient instead of the
         pinned `fresh`.
         Add a `detaching` fill: the detach that frees a slot is a transient, and a resting colour
         invites the reader to look for it in the end state.
         Put a wire caption in the Scheduler-to-CSINode corridor. It carries nothing the narration and
         the chip strip do not already say, and it sits off to one side of the one corridor that
         should read as a single clean axis. `wires` stays an empty map so the family clearWires
         prologue is still valid if a caption is ever wanted.
         Let the `ask` narration close on "it skips Pods that ask for no volumes", which contradicts
         CONTENT point 2: a Pod carrying only an emptyDir, a configMap or a secret ASKS for volumes
         and is skipped anyway.
NOT A DEFECT
         report/arrival.test.mjs prints two R2-ENTRY rows, `attached` on step 3 and `Pod web-0` on
         step 7. Both are the waits MOTION describes: `fill` turns `attached` over at FILL_END and
         `detachlag` turns `Pod web-0` over at PLACE_MS, each by a cued F.set behind a `rewind`, so
         a frame frozen at t=0 first sees the value a step late. R2-STEP reads 0. Carried in
         test/fixtures/carried.mjs.
```
