## workloads-rolling-update

### layout

```
WHAT     A rolling update is a window of live Pods sliding from the old ReplicaSet to the new one,
         and it never leaves the band the two dials define.
LAYOUT   TWO OWNER REGIONS side by side and no A / B / C preset. The presets choose which house
         column holds a ladder and which holds a chip column, and this card carries neither.
           actor row  y 40..120, API 484..716 centred on CX (WL.L-07), Deployment 908..1140
           regions    y 270..536, one over each house column, 60..540 and 660..1140
           owner row  SIX Pod slots on one line, 430..518, three inside each region, inset 18
           dial strip y 574..608, two chips 532 across (WL.L-05)
         A REGION AND NOT A NODE FRAME, and this is the whole layout argument. The axis of this card
         is OWNER, so the box a Pod stands in has to be the ReplicaSet that owns it. A `node()`
         frame around a column would say the split is by Node, two frames sharing one Node name
         would say the replacement lands where the old Pod ran, which no rollout promises, and
         WL.A-03 would then force every drop to stop on the frame face instead of reaching the Pod,
         which is exactly the per-slot arrow this card is built on. `workloads-replicaset` draws its
         two ownership bands the same way and for the same reason.
         Each region holds its own per-step header, so the counts belong to the box that owns them
         rather than floating over it. The header is centred in the region at y=286.
         The RS-v2 region is NOT drawn on `idle`, and it arrives on the `spec` write that creates
         the ReplicaSet: a box drawn around an object whose own caption reads `not created yet` is
         the picture contradicting its words. Its header IS drawn on `idle`, because that caption is
         the statement that the object does not exist, and it turns over on the same `patch` arrival
         the region does: a caption reading `replicas 0` beside no box is the same contradiction in
         the mirror, and `spec` is the step where it would stand for the whole 1500ms of the write.
         The fleet caption is rewound and re-written on that beat too, for the same reason: `spec`
         opens on `rollout idle` because the rollout begins with the PATCH this step narrates.
         `slots()` states both regions on every step so none of the seven inherits one by luck, and
         `idle` overrides that one value rather than the whole map: a bare `opacity:` after the
         spread replaces it and every slot goes to undefined.
         The 540..660 corridor between the two regions is the ownership boundary, and the trunk
         comes down it, so every write visibly crosses from the actor row into one owner or the
         other. Slot xs 78 / 230 / 382 and 678 / 830 / 982 at 140 wide, from `strip` over each
         PADDED house column at gap 12. Centres 148 / 300 / 452 and 748 / 900 / 1052, none on CX.
         SIX slots and never four. A Pod does not change version, so a v1 slot is never reused by a
         v2 Pod: position carries the OWNER, the inner box label carries the image and its sublabel
         carries the state, and no two of the three can contradict each other.
         The live Pods therefore occupy a contiguous window that slides right, 1-2-3 then 1-2-3-4,
         then 2-3-4, 3-4-5 and 4-5-6 as the two compressed cycles run it to the end, and maxSurge is
         how far its leading edge may run ahead while maxUnavailable is how narrow it may get. TWO
         DIAL CHIPS AND NO COUNT CHIP. The dials were one 123 character standing tag, the widest
         string the card would draw at 847.6 units. As chips they are a name and a value each, which
         is what they are. The ban that stands is on a chip carrying a COUNT: the six slots and the
         three captions already draw every count, and two homes for one number is two places for it
         to be wrong. `P-01` therefore has all seven steps state both chips, unchanged.
PANEL    x<=397 catalog-wide (`L-02`). Bottom per viewport: `OVERLAY_IDS=workloads-rolling-update
         node --test report/overlay.test.mjs`. UNIFORM, so there is no deepest step to name: the
         narrations sit in a 7 character band, 262 to 268, which wraps to the same line count at
         every viewport and gives one reading per viewport across all seven steps. A narration that
         leaves that band moves the panel.
         NO CONSTANT CARRIES THAT BOTTOM (`L-07`): nothing is derived from it, so the card holds no
         `PANEL_B`, and nothing hangs off the panel either. The owner header sits at y=286 inside
         its region, top ink 275.0 at 1100x800 and 274.8 at 1600x1000, so it clears the panel by
         70.0 on the smallest viewport and by 132.2 on the largest. The panel column is free of
         drawn content below the bottom and left of 397 on every step.
SIZES    Pod 140 wide, which is the house column LESS the region padding, divided by three at gap
         12, rather than a chosen number. Inner box 92, floored by `terminating`, which measures
         66.3 at 1600x1000 and leaves 25.7 inside it.
         REGION PADDING 18, and it is what the region is FOR. The region keeps the house column,
         because the chip strip below and the Deployment box above end on the same 60 and 1140, and
         a region reaching past them is the one edge on the card that is not flush. So the clearance
         is bought inside: at padding 0 the outer Pod of each three stood its border ON the region
         border, and two dashed rules on one x read as one heavier rule rather than as a box holding
         a Pod. 18 is also what the Pod row leaves under the region floor.
         Region 480 by 266, the house column by the band from 16 above the header to 18 below the
         Pod row. The widest string on the card is now the fleet caption at 385.9 units, against the
         847.6 of the tag it replaced, so no string comes near a margin: it inks 407.1..792.9 on a
         1200 canvas. The widest owner header is `RS-v1 (old) · v1.0 · replicas 0 · retained` at
         289.4, inking 155.3..444.7 inside a region running 60..540.
         Chips 532 wide, two across (`LAYOUT.C.strip.two`), at x 60 and 608. Measured at 1600x1000
         the wider pair is `maxUnavailable` at 96.5 with `0 · 25% of 3 rounds down` at 165.4, which
         leaves 246.1 units of gap inside one chip and 12 to its right edge. The name and the value
         are set from opposite ends, so that gap is the budget they share: 35 characters of slack at
         6.891 units each before they meet.
LANES    Trunk leaving the API bottom midpoint, which IS WL.CX, so it runs straight down the
         540..660 corridor with no jog (A-09: the Deployment PUTs .spec.replicas on the ReplicaSet
         and what appears in a column is that write taking effect). That is what decides WHICH box
         is centred: WL.L-07 wants the trunk to leave a face MIDPOINT, so the API takes CX and the
         Deployment takes the right edge, in the 232 actor pair of `workloads-replicaset`.
         The bus is SPLIT at the trunk and at every slot centre, six segments, and a segment stands
         between the trunk and every slot BEYOND it, so its shade is the max of those and not of the
         one it ends on. `SEG_SERVES` is that map and nothing else reads it. Unsplit the bar runs
         148..1052 and stands with a dangling end on every step where the far slots are empty. SIX
         drops, one per slot, because every slot is addressed: each RS-v2 slot takes a create ball
         and each RS-v1 slot takes a delete ball. A drop into a slot no step narrates is a lane
         nothing rides (A-05) and `unit/lane-shared.test.mjs` reddens on it, so a seventh drop would
         have to earn a seventh ball.
         A FEED IS 0 OR 1 AND NEVER A SHADE. A-13 makes a lane min(source, sink), which would put
         the feed into a terminating Pod at 0.25, and what that draws is a half-finished line rather
         than a state: every dashed run on this card stands at one strength on every step, and the
         Pod alone carries the lifecycle shade. The cost is paid knowingly on `drain`, where a full
         feed hangs over a Pod at OPACITY.terminating.
         The feed into a slot ABOUT TO BE FILLED opens on the scale write, through `F.reveal` at the
         `patch` arrival on all three filling steps, and the feed of a slot a step EMPTIES goes down
         with the Pod on the delete arrival. Settled values are still 0 or 1 and `slots()` pins them
         above the guard, so A-15 holds and the reduced path draws both outright.
         The trunk and the six bus segments are LANES with the marker dropped in `tune`, not
         relations. They carry every ball on the card, and `relationPath` paints at stroke-opacity
         0.45, which reads half-dark beside the drops and the actor arrows: this is the
         `workloads-pod-qos-classes` reason, at seven sites here rather than two.
         The answer lane is an ARROW here, not a relation: `ready` names the Ready count reaching
         the Deployment, so it earns a ball and a head. A segment takes the max of the slots BEYOND
         it and never the state of the one it ends on, which is what `some` says: busL1 stands
         between the trunk and slots 3, 2 and 1, so it survives until the last of the three is gone.
         Written per segment instead, every step that empties a slot would leave the run to it
         hanging over two empty ones. The other half is that a feed is 0 or 1 and never a shade.
         Derived from the Pod through `A-13`, min(source, sink), the slot 1 feed settles at 0.25 on
         `drain` beside a trunk `relationPath` is already painting at 0.45. Two half-strengths on
         one run of dashes read as a line that failed to draw rather than as a state, and the
         terminating Pod under it says the same thing better on its own. A-13 is therefore not met
         on this card by decision, at one site: `drain`, where a full feed hangs over a Pod at 0.25.
         Nothing in the suite sees either reading. `test:opacity/PHASE` checks the VOCABULARY, and 1
         is in it, so the derived shade and this one are equally green.
MOTION   The FIRST cycle is animated across three steps, `surge`, `ready` and `drain`, and the two
         that follow are ONE COMPRESSED step each: the scale-up write, the create ball into the
         RS-v2 slot, the Ready beat, and then the delete ball into the RS-v1 slot. Three full trios
         would cost two more steps of the same three-step shape and draw the same beat three times.
         A single closing step that states the rest in words is the other failure and the one this
         card had: three replicas appeared at once with nothing seen crossing.
         EVERY POD THAT LEAVES IS REACHED BY A BALL, which is what makes the compression honest and
         what pays for it. The delete leaves one hop after the Ready beat, `at: create` plus
         BEAT.afterPulse plus BEAT.afterHop, so nothing goes before its replacement is available:
         that ordering IS maxUnavailable 0 and it is the reason both steps run past 6000ms.
         The scale-down of RS-v1 carries no SECOND top hop. It is drawn where it takes effect, in
         the column, and a second Deployment-to-API ball plus its beat costs about 1500ms per step
         to redraw a hop the reader watched in full on `drain`, so the wire label names the write
         its own ball carried.
         Route lengths off the straight trunk are 458 into slots 4 and 3, 610 into slots 5 and 2,
         and 762 into slot 6 and the drained slot 1, all at the canon 0.45 u/ms. Spans against
         durations: `surge` 3518 of 3900, `drain` 4193 of 4500, `repeat` 6112 of 6600, `converged`
         6111 of 6600. The two compressed steps hold 488 and 489ms of still time, which puts them
         among the least still steps in the catalog (`card-review/tools/deadair.mjs` prints the
         ranking): at the 6200 they were first written to they held 88, and the picture reached its
         end state and advanced in the same breath. A build-time sublabel is load-bearing and not a
         placeholder. `box()` appends the sublabel `<text>` only when the string is non-empty, and
         `setBoxSublabel` is `if (sub)`, a silent no-op against a box that has none. Built with '',
         every `Ready`, `starting` and `terminating` this card writes lands nowhere and the Pods
         read `app v1.0` for the whole run. Nothing in the suite sees it: the played path and the
         reduced path both write into the same absent element, so `render/reduced.test.mjs` compares
         two identical blanks and stays green. Only `tools/settled-dump.mjs`, which reads the glyphs
         a real playthrough leaves, prints the missing line.
CONTENT  Read against k8s 1.35 and the page this card cites,
         kubernetes.io/docs/concepts/workloads/controllers/deployment/ The card draws the DEFAULT
         rollout and not a configured one. At `.spec.replicas` 3 the 25% defaults resolve to
         maxSurge 1 and maxUnavailable 0, because a surge percentage is "calculated from the
         percentage by rounding up" while an unavailable percentage is calculated "from percentage
         by rounding down", both defaulting to 25%.
         `maxUnavailable 1` is rejected on every string here, tag and aria-label and narration
         alike, because the card DRAWS the maxUnavailable 0 choreography: surge, wait for Ready,
         drain, with available never under 3. At maxUnavailable 1 an old Pod may go in the same sync
         as the surge, "the old ReplicaSet can be scaled down to 70% of desired Pods immediately
         when the rolling update starts", so declaring 1 and drawing a wait states two rollouts at
         once. The aria-label may not say that maxUnavailable lets an old Pod go once the new one is
         Ready: that is what maxUnavailable 0 does, and the sentence inverts the dial it names. The
         aria-label states the MECHANISM and not the block cast, which is why neither actor box is
         named in it:
         `workloads-replicaset`, `workloads-deployment-strategy` and `workloads-deployment-rollback`
         all leave their actor rows out of theirs, and adding this one back is a catalog decision
         rather than a card one.
         `available` is a second reading and not a synonym for Ready. `.spec.minReadySeconds`
         defaults to 0, "the Pod will be considered available as soon as it is ready", which is the
         only reason `ready` moves available 3 to 4 in the same beat as Ready 0 to 1. The `drain`
         caption reads `live 3` over four drawn bodies because the docs do not count terminating
         Pods "when calculating the number of availableReplicas", and the narration says so rather
         than leaving the arithmetic to the reader.
         The API box writes `PUT .spec.replicas` and never `PATCH .scale`. The Deployment controller
         calls `ReplicaSets(ns).Update(...)` on the ReplicaSet object rather than the scale
         subresource, and `workloads-replicaset` states the same in prose: "it updates spec.replicas
         on the ReplicaSet".
         A ReplicaSet creates and deletes the Pods, so the narration credits RS-v2 with the create
         and RS-v1 with the delete and never the API: "A ReplicaSet then fulfills its purpose by
         creating and deleting Pods as needed to reach the desired number". The API keeps the ball
         and the lit box, because A-09 makes what appears in a column that write taking effect.
         `retained` is bounded in the prose by `revisionHistoryLimit` and its default 10 is NOT
         stated here. The number is `workloads-deployment-rollback`, one card later, and two cards
         may not both own one default.
         `rollout complete` is lowercase because there is no Complete condition. The docs mark a
         Deployment complete and the condition then set is Progressing=True with reason
         NewReplicaSetAvailable, which is the pair `converged` names beside Available=True.
         `app=v2.0` stands as a bare image name: the kubectl reference itself prints `kubectl set
         image deployment/nginx busybox=busybox`, and a registry-qualified ref would disagree with
         the `app v2.0` the inner boxes draw. `set image` sends a StrategicMergePatch, so `PATCHes
         .spec.template` is the right verb.
         The `spec` WIRE names only the create. `PATCH .spec.template · create RS-v2` is rejected
         because that label sits over the Deployment to API lane and T-22 lets a wire name only the
         traffic riding it: `kubectl set image` sends the template PATCH and the Deployment
         controller sends the create, and one label over one ball may not carry two senders. The
         second clause is the hash because the create is the write that carries it,
         `pod-template-hash` being "added by the Deployment controller to every ReplicaSet that a
         Deployment creates or adopts". The PATCH stays in the narration, which names kubectl as its
         sender, and `workloads-deployment-rollback` splits the same moment the same way, with
         `create ReplicaSet · annotate revision 4` on the wire and set image in the prose.
         `spec` at `replicas 0` and `surge` at 0 to 1 is the CITED PAGE reading and not the source
         one. The docs walk this rollout as "it created a new ReplicaSet
         (nginx-deployment-1564180365) and scaled it up to 1 and waited for it to come up", which is
         these two steps. In the controller the create already carries the surge count, so the
         single POST leaves at replicas 1 and no ReplicaSet is ever persisted at 0. The docs do not
         say that, it is an implementation detail rather than a contract, and drawing it costs a
         step merge, so the split stands on the page the card cites. No step names the Pod picked
         for deletion and none may. "The controller picks the oldest Pod" is rejected twice over:
         the ranking prefers the NEWER Pod among otherwise equal candidates ("newer pods < older
         pods"), and the victim ordering belongs to `workloads-replicaset`, which states it and
         qualifies it as best effort. The Service is in the `desc` and in no narration. A step
         naming it names an actor this card does not draw (T-21), and the drawn counts carry the
         same point.
NAMING   Random suffixes web-a1..web-f6, as a Deployment really gives them. An ordinal implies an
         age order the drawing never establishes, and this card names no Pod as the one the
         controller picks.
         The state words are `Ready`, `starting` and `terminating`, and they are the only thing the
         inner sublabel ever says: the image is in the label and the owner is the column.
SCOPE    `.spec.strategy.type` is named nowhere. This card draws the RollingUpdate value and only
         that value. The field itself, its other value Recreate and the terminate-before-create
         order are `workloads-deployment-strategy`, which sits immediately after this card.
         Revisions, `revisionHistoryLimit` and `kubectl rollout undo` are
         `workloads-deployment-rollback`, and they are one clause on the last step. That clause is
         the handover: this card ends with RS-v1 retained at replicas 0, and what a retained
         ReplicaSet is FOR is the next card.
         The reconcile loop, `ownerReferences`, adoption and release are `workloads-replicaset`.
         Both ReplicaSets here are scaled by a number and neither is drawn owning anything.
         `preStop`, SIGTERM and the grace period are `workloads-graceful-shutdown`. The `drain` step
         says graceful termination in three words and the drain is one fade: no signal, no window
         and no second track is drawn.
         `startupProbe`, `livenessProbe`, `failureThreshold` and what a failing probe acts on are
         `workloads-probes`. `readinessProbe` is one step here, as the gate the drain waits on.
NOT A DEFECT
         `drain` settles on four drawn bodies and a caption reading `live 3`. The fourth is at
         OPACITY.terminating with `terminating` in its box, and a terminating Pod is not a live one.
         `repeat` and `converged` settle with the replaced Pod gone rather than left at
         OPACITY.terminating the way `drain` leaves its own. `drain` stops MID-termination on
         purpose, to show that a terminating Pod is drawn and not counted. On the compressed cycles
         the whole crossing including the deletion completes inside the step, which is what empties
         the left column one slot at a time instead of all at once at the end, and `converged` may
         not say `rollout complete` over an old Pod still running: that caption is written only
         after the last fade, at `create` plus BEAT.afterPulse plus FADE.out.
         The three filling steps still show an arrowhead over an empty slot, for the FLIGHT and no
         longer for the lead: the feed opens on the `patch` arrival at 1500 and the Pod lands at
         2618 on `surge`, 2956 on `repeat` and 3293 on `converged`. A lane carrying a ball has to be
         visible for the whole flight (A-15), so that residue cannot be removed without a ball
         riding an invisible lane. The 500ms reveal is over before the ball reaches the bus, which
         is 2067 at the earliest.
         Everywhere else a feed hangs on OCCUPANCY and not on a ball, so all three RS-v1 feeds are
         drawn from the first frame, over the Pods standing there, and each goes with its own.
         `converged` at 24.91 ms per character, `repeat` at 24.63 and `drain` at 17.18 sit at the
         unhurried end of the catalog reading-PACE ranking and not the hurried one
         (`card-review/tools/deadair.mjs` prints it). The holds are bought by MOTION and not by dead
         air: 489, 488 and 307ms of still time put them among the least still steps in the catalog,
         so M-19a does not reach them. Shortening any of them means shortening a route, and every
         route here is a Pod being created or deleted.
         `idle` writes the three captions, which S-09 reads as a slot-0 draw. They are this card's
         chip column, and 28 of the other 29 cards here write their own chips on slot 0 for the same
         reason: a count that appears only once the first step plays reads as a value the step
         produced. The three strings state the resting fleet, so the poster is true of the picture
         it shows and not of the step-1 text previewed beside it.
```
