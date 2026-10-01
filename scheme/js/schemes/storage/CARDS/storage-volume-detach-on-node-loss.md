## storage-volume-detach-on-node-loss

### layout

```
WHAT     Detach on node failure. A node goes NotReady and its kubelet falls silent. The old Pod
         cannot be confirmed dead, so Kubernetes deliberately WILL NOT detach the volume yet:
         detaching while the old Pod might still be writing means two nodes writing one filesystem.
         The stall is a chain of timeouts walked one rung at a time on the ladder, and the
         out-of-service taint is the operator escape hatch that asserts the node is dead.
LAYOUT   TWO vertical stacks side by side, because the story is one disk moving between two nodes.
         The two columns are deliberately IDENTICAL in width: the only thing that differs is which
         one is answering, so anything else that differed would read as a difference the card is not
         about. The node tier width is the ONLY lever on where the diagram sits, and it is solved
         for: 2*192 + 16 = 400 puts CONTENT_CX exactly on 600, and NODE_W then sets POD_W. The
         frames are 192 wide against a tight 16 gap so the pair reads as two substantial machines
         rather than two thin columns, and the disk below is 190 wide, wider than the gap, so it
         still bridges both. That exactness matters because of the bottom band. The node tier is
         symmetric about CONTENT_CX wherever it sits, so on its own it would look fine anywhere. The
         chip strip does not: at 662 units it is more than half again the width of the node tier, so
         it sets the visual centre. WHY NOT nodes at 430..1140: that puts the whole card 186 units
         right of the canvas centre with a dead left third.
         The bottom band does NOT sit inside the chip strip's edges, for a reason a purely
         horizontal reading cannot see: the escape box is a BLOCK, and the only other block below
         the panel is the disk. Two blocks are what the low-content check measures, so an escape box
         parked at 701..931 puts the low half at centre 718 however well the chip strip behaves. It
         stands on the SPINE under the disk it acts on, which also turns its taint lane into a
         straight climb into the disk floor instead of an elbow into its right face. The ladder and
         the chips then take one side each, so the strip still spans 60..1140 and centres on 600.
PANEL    The deepest step is `evict` (384 characters, the longest narration on the card):
         `OVERLAY_IDS=storage-volume-detach-on-node-loss node --test report/overlay.test.mjs` from
         `scheme/test/` prints the reading.
         At the 900x650 hand row, which that command does not sample, `evict` reaches right 398.3,
         bottom 436.3, so x<=398 and y<=437, and `refuse` and `escape` 405.5
         (`extents.mjs --step=N --viewport=900x650`). LEFT_X 400 has about 2 units of slack against
         the 398.3 and cannot move left at all. LAD_Y 448 clears evict by 11.7 at 900x650, which is
         the whole budget: evict at 483 characters reached 497.9 there and took the top rung, and
         one more line on evict, refuse or escape does the same again. DO NOT re-derive either
         number from a single wide-window screenshot.
SIZES    The escape box is 232 by 80 and each Pod 104 tall around a 44 tall app box 26 under the Pod
         label (NET.L-01). The Pods are 168 wide rather than 232, a departure the panel wall forces:
         two 232 columns from LEFT_X 400 would centre on 652, off the 600 every tier holds. POD_W is
         NODE_W less two NODE_PAD, and the app box keeps the catalog 20 unit side pads, 128 wide.
         Measured after fonts.ready at 1100x800, the widest Pod string is the sublabel `marked for
         deletion`, 116.6, 25.7 either side.
         CHIP_W 210 rather than the family 232, measured IN THE BROWSER rather than estimated,
         because the rate under-reads on strings full of wide glyphs:
           Node-1 41 + `NotReady, tainted` 117 = 158     volume 41 + `attached to Node-1` 124 = 165
           new Pod 48 + `ContainerCreating` 117 = 165
         210 clears the worst pair with 21 units, the floor for the two halves reading as separate.
         The LADDER rows carry the longest strings on the card and are the one place a per-character
         estimate is not good enough: the rungs are full of wide glyphs, so the longest renders 338
         units where 6.0 per character predicts 307. MEASURE them. chainList insets its text 10 from
         the row edge, so LAD_W 380 leaves 32 of margin on the worst rung; at 350 it clears the row
         border by 2 and reads as text jammed against the frame. The escape box keeps the catalog
         232: its sublabel `operator asserts node is dead` inks 173.6, 29 either side, and centred on
         the spine it keeps 44 units to the ladder.
LANES    The attach lanes stop at NODE_BOTTOM rather than running up into the Pod: the disk attaches
         to a NODE, and the Pod is what runs once the node has the volume. Both are built
         IDENTICALLY and both are real arrows in the FULL storage colour (dim: false), so the left
         lane does not read as a lesser arrow than the right, and only its OPACITY drops on
         force-detach. WHY NOT elbow the taint lane into the disk's RIGHT flank rather than climbing
         the spine into its floor: the disk caption anchors at x=711 on y=340, inside the disk's own
         282..386 band, and the longest wire string (`do not detach yet`, 17 characters of 11px mono
         at 6.89) reaches x=828, so a side-on approach runs its dashed line through the caption
         before it turns in. Straight up the spine needs no elbow and clears the ladder and both
         node frames. The ladder and the packet lanes do not overlap at all (lanes above 474, ladder
         below 448), so the ladder needs no exemption from the packet layer.
MOTION   DO NOT give the unconfirmed Pod a dim `unknown` state pulsed with pulsePodDim: that stacks
         an opacity swing on the blink and reads as a faster, busier pulse than the same beat
         elsewhere. Not knowing whether a Pod runs is not a phase of its own, so it is carried by
         the sublabel and the chip instead.
         Being MARKED is a phase, and the card walks the old Pod down the vocabulary in the two
         steps that earn it: the sublabel reading `marked for deletion` IS Terminating and drawing
         that at full is a catalog-wide defect. Rung 1 of the ladder is on that same vocabulary and
         says `old Pod marked`, not `old Pod deleted`: on an unreachable Node the deletion is
         exactly what cannot be confirmed, which is the whole reason the disk is still held. The
         fade to terminated STARTS at terminating rather than at 1, because an animation keyframed
         from full brightens a marked Pod back up for one frame before killing it. A Pod at either
         shade never pulses. The replacement Pod is not drawn at all until it EXISTS. DO NOT fade it
         in on the notready step: no controller could do that, because the ReplicaSet
         replaces a Pod only once it carries a deletionTimestamp (CONTENT 1).
         Both Pods carry a sublabel tracking their state, written on EVERY step like the chips: a
         Pod still reading `Running` three steps after its node went silent is a lie the reader
         cannot catch. Same for the chips: unset, the volume chip reads `force-detached` on the step
         that is explaining why nothing has been detached yet.
         The disk does NOT flash on force-detach. It is a static receiver, shown by its highlight
         plus the sublabel and the chip flipping; the severing is carried by the two fades. On the
         closing taint step no Pod acts (the operator does), so there is no pulse and no block
         flash.
WIRE LABELS
         THE COUNTERFACTUAL CAPTION (`T-35`). The escape step plays AFTER the card has ended:
         attachb closes with the volume on Node-2 and the new Pod Running, and escape then draws the
         taint path as real state, chips and lane included. ONE caption, `if instead the taint lands
         first`, is what stops that frame reading as a seventh thing that happened to this cluster.
         It sits in the empty band between the disk floor and the escape box, anchored `start` 20
         right of the spine, so it reads as a condition on the box below it. WHY NOT centred on the
         escape box: the taint lane owns x=600 through that whole band, so a centred caption takes
         the dashed line through its glyphs. WHY NOT anchored `end` left of the spine: 220 units of
         string then reach back to x=380, and on THIS step at 900x650 the panel is x<=398.3 with a
         bottom of 405.5, so the opening words go under it.
         MEASURED IN THE BROWSER at 220.5 / 201.5 / 196.3 units over 1600x1000 / 1280x860 /
         1100x800, and 194.6 at 900x650, so the widest is the widest viewport. Nearest neighbour is
         the taint lane at 20 units, then the escape box top 34.6 below the ink and the disk floor
         42.8 above it. The ink bottom lands at 443.4, which is 4.6 above LAD_Y, and the ladder is
         180 units to the left in any case. Panel clearance on the escape step at 900x650 is 221.7
         units horizontally. The wording stays off the Pod on purpose: this card names the old Pod's
         end three ways across its steps already, and a caption is not the place to add a fourth.
         `TAINT_TAG`: the riding `out-of-service` tag rides dx -51, LEFT of the taint lane and so off
         the caption that starts 20 right of it, and 22 UNDER its ball, so it parks 12 under the disk
         floor rather than inside the disk. It leaves the escape box top and fades in on an emerge of
         250 once clear. Centred above the ball it printed over the opening words of the caption for
         160ms and parked inside the disk for 440ms. Measured every 40ms at the three viewports it
         reads for 640ms and touches no block, caption or lane.
CONTENT  Read against the cited Node Shutdowns page for the 1.35 the card targets.
         1. THE REPLACEMENT IS A DEPLOYMENT MECHANISM. The page: "the pods that are part of a
            StatefulSet will be stuck in terminating status on the shutdown node and cannot move to
            a new running node ... the StatefulSet cannot create a new pod with the same name". The
            `evict` claim that the deletion mark lets a replacement be created is true of a
            ReplicaSet, which stops counting a Pod once it carries a deletionTimestamp, and false of
            a StatefulSet. So `evict` names "the Deployment", and `escape` carries the StatefulSet
            case: "its replacement cannot even be created while the old Pod keeps the name". The
            `web-0` names stay, with `(old)` and `(new)`, the convention storage-multi-attach-error
            uses for its Deployment. "That same deletion mark is what finally lets a replacement be
            created", unqualified, is rejected.
         2. THE FORCE DETACH CAN BE SWITCHED OFF. "In any situation where a pod deletion has not
            succeeded for 6 minutes, kubernetes will force detach volumes being unmounted if the
            node is unhealthy at that instant", and "Force storage detach on timeout can be disabled
            by setting the disable-force-detach-on-timeout config field in kube-controller-manager".
            `forcedetach` says "Unless it is disabled in the controller manager".
         3. Checked TRUE and left: the 300 second default toleration of the unreachable taint; the
            out-of-service taint force-deletes Pods without a matching toleration and detaches their
            volumes immediately; the page tells the operator to confirm the Node is shut down first,
            which `escape` carries as "knows the Node is really dead"; a force detach under a Pod
            that is still writing can corrupt data, the card's two-writers argument.
SCOPE    Held deliberately against storage-multi-attach-error, or the pair reads as one card shown
         twice. Both end with one RWO disk moving between nodes, and the difference is not the
         outcome but what is being waited on. There, node-1 is HEALTHY and the volume is
         legitimately held by a Pod that is legitimately running: an ordering problem with an
         ordering fix. Here NOTHING is contending for the volume. The wait is on DOUBT, because a
         silent kubelet cannot confirm its Pod stopped writing. So THIS card owns the
         unreachable-toleration and force-detach clocks, the roughly six minutes, the
         two-writers-corrupt-one-filesystem argument, and the out-of-service taint. None of those
         appear on the other card.
NOTE     node() puts its own label RELATIVE to the frame group. Use the primitive: hand-rolling
         these out of box() and appending an absolutely positioned caption renders `node-1` at 874,
         on top of the other column's App box, and `node-2` at 1614, past the viewBox edge.
NOT A DEFECT
         W_ATTACH_A is reported as a lane nobody rides, and converting it to a relationPath is
         DECLINED: sinking one half of a deliberately symmetric pair makes the left lane the lesser
         arrow, which is the thing this card goes out of its way not to do. Both halves are
         relationships by nature here, and the card already says which is live through OPACITY.
```
