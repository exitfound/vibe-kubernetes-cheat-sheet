## workloads-force-deletion

### layout

```
WHAT     The Pod object and the running container are two different things, kept equal by the
         Kubelet acknowledgement alone. A force delete completes the record half without it, so one
         identity ends up with two live writers.
LAYOUT   RECORD OVER REALITY, and no A / B / C preset for the pipeline: there is no ladder to place.
         Four tiers down the canvas, and the vertical axis IS the argument.
           actors  kubectl 420..640 and API server 700..920 on WL.TOP_Y, right of the panel wall
           record  the identity slot 420..780 x 170..280, centred on WL.SPINE_X, holding the stored
                   object 460..740 x 210..266
           chips   LAYOUT.B.chips, 60..540, four rows 300..460
           reality TWO Node frames 60..580 and 620..1140, NODE_H 134, Pods centred on 320 and 880
         The slot carries NO box label. box() centres a label on the whole box, which is where the
         occupant sits, so the caption is a P.tag: it takes the slot's horizontal centre and the
         slot's own top band, 600 x 194, and the occupant keeps the middle. Anchored `middle` and
         not `start`: a caption offset to the corner reads as a frame legend, and this one names
         what the box HOLDS. Measured 498.8..701.2, 78.8 clear of each slot wall, 13 below the WRITE
         arrowhead landing on 600 and 12.3 above the object at 210.
         NODE_H is 134 rather than 140 to open the 30 unit corridor between the chip column's bottom
         at 460 and the frames, which is what the dead channel crosses.
PANEL    x<=397 catalog-wide (`L-02`). Bottom per viewport: `OVERLAY_IDS=workloads-force-deletion
         node --test report/overlay.test.mjs`. Deepest on `stuck` at 1100x800, the longest narration
         at 371 characters. `PANEL_B` 280 is derived from that reading, and it pins the chip column
         top at 300 with 20 units of clearance and nothing else: the slot at x>=420 and the frames
         at y>=490 clear the panel by position rather than by that reading.
LANES    FOUR channels, and no two of them share a corridor, because the two halves of the card must
         never be read as one line.
           CALL      kubectl right face 640 -> API left face 700, on the row midline 80. A P.arrow
                     rather than a P.lane because it is one straight segment. ONE `CALL` pair of
                     points feeds both the drawn arrow and the `F.top` hop on it (A-02): the ball
                     and the line cannot drift apart, and a top hop with nothing drawn under it is
                     a ball crossing blank canvas (A-01).
           WRITE     API bottom midpoint 810 -> jog at y=145 -> down into the slot top midpoint 600.
                     Rides on `terminating` and on `force`. kubectl stops at the API (A-09), so this
                     is the write reaching the store rather than an operator reaching past it.
           ACK       slot bottom 600 -> the bus at NODE_Y-15 -> Node-1 FRAME face at 320 (WL.A-03).
                     A RELATION and not a lane: nothing rides it on any step, which is the subject.
                     A-06 admits it because the narration names the acknowledgement as the thing
                     that does NOT arrive, and A-05 is why it carries no arrowhead.
           RECREATE  slot RIGHT face 780 at y=225 -> across to 880 -> down into Node-2's frame face.
                     Leaving the right face rather than the bottom is what keeps it off the ACK
                     corridor: the replacement and the thing that never came must not run one line.
         The break is a P.raw CROSS on the ACK line, centred 600 x 373 with arms of 11, beside the
         two P.tag lines that name what the channel was for. It is born at opacity 0 and fades in on
         `silent`. A cross and not a pair of ticks: on a vertical the ticks read as a rung or as an
         equals sign, and equals is the one word this card means the opposite of. L-09 does not
         reach it, because both of that rule's checks read lane geometry, DIAGONAL off
         `.scheme-arrow` in `render/geometry.test.mjs` and off the declared points in
         `unit/spec-scene.test.mjs`, and this is a MARK carrying the label class drawn over a lane
         rather than a segment of one.
MOTION   Reading pace per step, ms per character: silent 9.36, terminating 9.76, stuck 8.63, force
         9.66, split 9.62. The yardstick they are picked against is printed beside them by
         `card-review/tools/timing.mjs`, which is its one home: a catalog-wide figure copied in here
         goes stale the day a card lands anywhere in the tree.
         The two steps that write to the record hold past their own motion rather than ending on it:
         `terminating` runs 3200 against a span of 2860 and `force` 3400 against 3000. Each ends on
         three values turning over at one arrival, and that turn is the moment on this card a reader
         has to sit with, so the step stands still for it. Measured still time 340ms and 400ms, by
         `card-review/tools/deadair.mjs`.
         Node-1, the Pod inside it and the ACK relation move as ONE through `node1At(v)`, because a
         lane's shade is the min of its two ends (A-13) and Node-1 is the lower end of that one. Pod
         A moves ONCE, down, on `silent`, and never again. That is the card: the reality band is
         untouched by everything the record does after it. `flowLights` derives the reduced path's
         highlight set from every `lights` list in `flow`, and it reads `lights` ALONE. A highlight
         applied inside an `F.set` at an arrival is invisible to it, so the played path lights the
         chip and the static path does not, which lands on the HIGHLIGHT axis of
         render/reduced.test.mjs (S-16, S-17). Four steps here turn a chip over on a beat and light
         it in the same `F.set`, so four carry the names by hand. The same field is what keeps that
         cue OFF the played path at t=0. `writeStatics` applies a step's `lit` before its `rewind`,
         so a chip named in the static `lit` and turned over later glows over the value the step
         before it left, and glows a second time when it actually changes. Only a block that SENDS a
         ball stays in `lit`, which is `kubectl` on the two write steps and `slot` on `split`, both
         owed it by M-18a. Every chip on this card is cued at its arrival and named here for the
         other path. Node-1 is a FRAME, the Pod is a sibling element and the ACK relation ends on
         the frame face, so all three are one lifecycle state written once. Writing them separately
         is how the catalog came to draw a full-strength arrow out of a Pod that was a ghost (A-13),
         and here it would also let the frame and the Pod inside it disagree. The factory takes a
         value rather than a stage name because Node-1 has exactly two states on this card, and it
         never comes back up: `notready` is reached on `silent` and held to the end.
CONTENT  Read against the `k8sVersion` the entry carries.
         `status.phase stays Running` on the `stuck` step, against the Pod lifecycle page saying `If
         a node dies or is disconnected from the rest of the cluster, Kubernetes applies a policy
         for setting the phase of all Pods on the lost node to Failed`. The two do not meet, because
         that policy is `podgc` and BOTH of its paths are shut on the state this card draws.
         `gcOrphaned` reaches only Pods bound to a Node that no longer exists, and this Node object
         is still there, unreachable rather than deleted. `gcTerminating` needs two conditions and
         has only one: `!nodeutil.IsNodeReady(node)` holds, and
         `taints.TaintKeyExists(node.Spec.Taints, v1.TaintNodeOutOfService)` does not, because
         nothing has applied `node.kubernetes.io/out-of-service`. `gcUnscheduledTerminating` takes
         only an empty `NodeName`. So `markFailedAndDeletePodWithCondition`, the one writer of
         `newStatus.Phase = v1.PodFailed`, is never reached and the Pod keeps the last phase its
         Kubelet reported.
         The card already names the escape rather than hiding it: `delete the Node object and let
         the garbage collector clear its Pods` on the `split` step IS `gcOrphaned`, stated as the
         safe route. The doc sentence describes what happens once an operator takes that route or
         taints the Node out of service, and this card is the interval BEFORE either.
         The card's own cited task page is the loose one and must not be copied from: it says the
         Pods `enter the Terminating or Unknown state`, which mixes the kubectl display with the
         phase. `Unknown` is rejected as the chip value for the same reason.
NAMING   `ETCD` in every drawn string, not `etcd`. The catalog majority is 25 to 6 and T-06 enforces
         it in narration and aria-label only, so the three drawn strings here (the slot caption, the
         `ETCD record` chip name, the `remove from ETCD` wire) follow it by hand or the card
         contradicts its own narration.
         `Pod A` and `Pod B` are INSTANCE labels, not object names: a StatefulSet replacement
         carries the same name as the Pod it replaces (`web-0`, the identity chip), so naming either
         one by its real name makes the two indistinguishable at exactly the step that compares
         them. The stored object in the slot therefore reads `Pod A` as well, and lowercase `pod-a`
         survives only inside the literal command and the API path, where it is a resource name
         rather than a label. Drawing the object `pod-a` beside a Pod called `Pod A` opened a new
         T-13 DRIFT pair, `"Pod A" x8 vs "pod-a" x1`, and read as a typo rather than as the
         distinction it was. The chip pair `ETCD record` and `containers running` counts ONE
         quantity from two sides, and it is the card's instrument. It is stated in chips and nowhere
         else: a bar drawn beside a chip carrying the same number is the way an instrument panel
         goes wrong.
         `containers running` carries its confidence inside the value on every step it has none, up
         to and including `split`, where it reads `2 · Node-2 live, Node-1 unconfirmed`. Dropping
         the qualifier at the count of two would state as fact what that step's own sentence states
         as a condition, and the condition IS the hazard the step is named for.
         Both `req` strings name an API request rather than a command line, because the lane runs
         kubectl to the API server and T-22 admits only what rides it: `DELETE .../pods/pod-a`, once
         bare and once carrying `gracePeriodSeconds=0`. The kubectl flags that produce the second
         one belong to the narration, and putting them on the lane makes one lane speak two
         vocabularies on two steps.
SCOPE    The Node going silent and the eviction clocks that follow belong to `cluster-node-failure`
         and `cluster-node-eviction-rate`, and the volume half of the same partition to
         `storage-volume-detach-on-node-loss`, where the wait is on DOUBT rather than on a missing
         acknowledgement. The ORDINARY delete, where both tracks are alive and the ack does arrive,
         is `workloads-graceful-shutdown`. This card owns only the interval where the record cannot
         be completed and what force does to it.
NOTE     `T-21` costs this card two rewordings, because the cast is deliberately small. Neither the
         node controller nor the StatefulSet controller has a block, so no step names one as an
         actor: `silent` says the Ready condition GOES to Unknown rather than who sets it, and
         `terminating` says the delete is issued by hand here and automatically once a lost Node is
         written off. The StatefulSet itself IS on the canvas, as the owner named in the slot
         caption `ETCD · StatefulSet identity web-0` and in the `identity web-0` chip, which is what
         lets `stuck` and `split` name it. Adding a controller block instead costs the actor row a
         third box and buys a block that acts on one step.
NOT A DEFECT
         `statics.mjs` reports `word repeated: "pod pod"` on `delete pod pod-a` and on the
         `force` narration. It is the literal kubectl command and the resource name, not a doubled
         word.
OPEN     `CENTRE`: the chip strip spans 60..540, centre 300 against a want of 600 +-6. It is a
         COLUMN, which is what LAYOUT.B means, and the finding is what every column-chip card in
         this category reports. Closing it means a bottom strip, and the strip cannot hold four
         values of this length two across (WL.L-05, the 79 collisions).
```

---
