## workloads-deployment-rollback

### layout

```
WHAT     A revision is not a snapshot stored on the Deployment, it is a ReplicaSet with a revision
         annotation, kept at zero once it is old, so the list rollout history prints is a rendering
         of those objects and a rollback renumbers one of them forward instead of rewinding
         anything.
LAYOUT   TWO REGISTERS OF ONE SET, drawn one above the other so a reader can see them disagree. The
         upper band is what EXISTS, four ReplicaSets in creation order. The lower band is what
         `kubectl rollout history` PRINTS, one narrow cell per live revision, in revision order. One
         connector per live revision joins a row to the object that carries its annotation.
           actor row  y 40..120, Deployment 484..716, 232 wide, centred on WL.SPINE_X (WL.L-07)
           rail       y 272, `created first` and `created last` as end caps outside the bus
           read       the one upward route, x 425 from 330 to 80, into the owner's LEFT face
           shelf      FOUR objects 330..402, 246 wide, xs 60 / 338 / 616 / 894 from `spread`
           band       402..528, the connectors, corridors at 438, 462 and 486
           register   FOUR cells 528..570, 150 wide, centred on the slot centres
           caption    `kubectl rollout history` centred at (600, 516)
           chips      TWO across at 532 (LAYOUT.C.strip.two), 590..624
         THE COMPOSITION IS THE ARGUMENT. Everything else on this card was already true of the shape
         it replaces, an object board of four boxes in a row, and that shape could not say the one
         thing the card exists for. Its own record stated the intent, that the slots run in creation
         order and never in revision order, and the drawing had no way to carry it: four identical
         boxes left to right read as a sorted list, and the only signal that the sort key was
         creation was a label changing on the fourth step of five, so a reader who watched the whole
         card could not say what its subject was.
         `Object board, no Pod` names this exact failure in the composition reference: it fails when
         the objects are laid out in one row because there are four of them.
         WHAT THE SECOND REGISTER BUYS is a baseline that can break. While the two orders agree
         every connector is a plain vertical, so there is nothing to read and nothing to explain.
         The rollback permutes one of them and three connectors go sideways and cross. The lesson is
         then geometry rather than a string a reader has to notice changing.
         A ReplicaSet is NAMED BY ITS HASH here, `web-5f2j`, which is what `kubectl get rs` prints
         and the reason a rollback can find the object again. The revision number is nowhere on the
         object: it is in the register, because that is where it lives in the API, as an annotation.
         `nopod` is the lever no other card in workloads/controllers carries. `relations`, three or
         more relationship lines, is the second, and in this section only
         `workloads-statefulset-ordered-rollout` carries that one as well.
PANEL    x<=397 catalog-wide (`L-02`). Bottom per viewport:
         `OVERLAY_IDS=workloads-deployment-rollback node --test report/overlay.test.mjs`. Deepest on
         `reuse`, the longest narration at 323 characters, with `roll` at 316 taking the same
         readings and `bad` at 287 taking the deepest at 1100x800 alone. Shallowest on `undo` and
         `prune` at every viewport. The panel follows the PROSE and the spine does not move it.
         `PANEL_B` is derived from the deepest reading rounded to 230, and the rail hangs off it at
         +42: the register and its connector band need the 44 units, and the rail is the only thing
         `PANEL_B` pins.
SIZES    Object 246 wide, derived by `spread` over WL.L..WL.R at four across, gap 32. Register cell
         150, chosen against the object rather than measured off its own string: `Revision 1` inks
         58.6 and `Revision 4` 61.2 at 1600x1000, so 150 leaves 44 clear each side, and the point of
         the number is that a row of the list must not read as a second shelf. 150 against 246 and
         42 tall against 72 is what separates them.
         The widest string in an object is the SUBLABEL, `replicas 0 · app:v1.0` at 126.6, against
         `web-6b8d` at 59.4, so 59.7 of the 246 stands clear on each side.
         A hash is four characters of a real `pod-template-hash`, drawn from the alphabet
         `SafeEncodeString` maps into, `bcdfghjklmnpqrstvwxz2456789`, which holds no `a`, no `e` and
         no `0`, `1` or `3`. The object name is `web-` plus that hash, which is what the controller
         builds from the Deployment name.
         Chips at 532, the WL.L-05 two-across width. The floor is `revisionHistoryLimit` against `2
         on this Deployment, 10 by default`: 137.8 plus 241.2 plus the two 12 unit insets leaves 129
         clear at 1600x1000, the narrower of the two.
LANES    ONE trunk from the Deployment bottom midpoint to the rail, one bus spanning the outer slot
         centres 183..1017, and FOUR taps, all feeding the SHELF. Every write this card draws lands
         on a ReplicaSet, so nothing is ever delivered to the register: reading a list is not
         traffic (A-06), and the connectors below carry no arrowhead and no ball.
         ONE ASCENDING ROUTE, and it is the only traffic on the card that does not leave the owner:
         `undo` READS the template `web-5f2j` froze and patches it into the Deployment. It is drawn
         as ONE polyline, 425 up from 330 to 80 and right to 450, because a single step rides it and
         its single arrowhead therefore belongs at the end, on the Deployment.
         IT SHARES NO CORRIDOR WITH THE DELIVERY GRAMMAR, and that is the whole placement. It rises
         in the band between the narration panel and the owner and enters the owner on its LEFT FACE
         MIDPOINT, exactly, where nothing else on this card arrives: every write leaves the BOTTOM
         face. Measured clearances: 28.5 from the panel right edge at 1100x800, its worst of 396.55
         / 377.76 / 290.77, and 47.2 and 134.2 at the two wider ones. 25 from `DEP_X`. 36 from tap
         2, over the 58 units where both exist. 175 from the trunk. The exit sits 36 left of the
         slot centre, 14.6 percent of a 246 face. It crosses one thing, the bus at (425, 272), and
         nothing reaches the owner from the shelf without crossing that bus: the bus spans 183..1017
         and the two bands sit on opposite sides of it.
         A LANE AT `WL.LANE_DY` OFF THE TRUNK IS NOT A LANE OF ITS OWN HERE, and this is the
         measurement that placed it. A-03 asks a return to be offset by the card's lane delta, and
         12 gives two dashed verticals of one weight, one dash pattern and one colour running
         together over the whole 152-unit band from 120 to 272, plus a second doubled run, the rail
         at 284 under the bus at 272 over 115 units. At true size and at 4x both read as one doubled
         rail rather than as two exchanges, and on this step the trunk carries NOTHING, so the pair
         made indistinguishable is the inert line and the card's only ascending one.
         What the trunk's own face can offer is bounded: an endpoint on it stays inside `FACE_FRAC`
         only within 54 of 600, and 616..654 of that band is under the `act` label, which inks from
         616. So the widest honest separation in the trunk corridor is 54, against the 175 the left
         band gives for free.
         275 units at `PKT_SPEED` 0.45 is 611ms, under the 700ms `PKT_DUR_MIN`, so `routeDur` clamps
         and the ball runs at 0.393 u/ms. That is the house reading rather than this card's: most of
         the catalog's balls are floor-bound, which `pace.mjs` prints.
         IT IS DRAWN ON `undo` ALONE. Standing on every step it would point an arrowhead at the
         Deployment on four steps with nothing riding it, and it would say that one object of the
         four has a way back, where any kept revision has one.
         SEVEN CONNECTORS DRAWN, three or four alive per step. Four are the aligned pairings, one
         per position, and three are what the rollback leaves: cell 2 to slot 3, cell 3 to slot 4,
         cell 4 to slot 2. Every one is a pairing some step actually reaches, so none is decoration.
         A CROSSING STEPS OFF CENTRE AT BOTH ENDS AND IN OPPOSITE DIRECTIONS, 24 left of the object
         it leaves and 18 right of the row it reaches. The four aligned pairings stay dead on the
         centre and stay plain verticals, so the baseline the rollback breaks is untouched. What
         forces it is written out below, because the offsets read as untidy and are not. A cell and
         its object share a column. After the rollback the pairing is a THREE-CYCLE, cell 2 to slot
         3, cell 3 to slot 4, cell 4 to slot 2, so with both ends centred three columns each carry
         TWO descents: a source running from the shelf down to its corridor, and a sink running from
         another corridor down to the register. Writing c23, c34 and c42 for the three corridors,
         column 461 needs c42 < c23, column 739 needs c23 < c34, and column 1017 needs c34 < c42.
         The three together say c42 < c42. There is no assignment. Equal corridors are the
         degenerate case and are worse: the three horizontal runs then lie on one line and the
         longest contains the other two, so the correspondence is erased. Stacking two descents on
         one x is worse still, and not by taste: two dashed segments on one x draw a single
         continuous line from the object to the row below it, which is a pairing the step denies.
         OPPOSITE SIGNS ARE WHAT DISSOLVE THE CYCLE, and one offset cannot. Exit at cx-24 and entry
         at cx+18 put the six descents on 437 / 479 / 715 / 757 / 993 / 1035: SIX DISTINCT COLUMNS,
         42 apart in each braided pair, so no column carries two descents at all and the corridor
         inequalities have nothing to constrain. One offset frees ONE column and leaves the other
         two stacked 24 apart in y, which is the reading this pairing has to deny.
         THE SIGNS ARE UNIFORM RATHER THAN PER CONNECTOR, exits left and entries right. Following
         the travel direction instead needs e(m) different from n(m) on every column and prefers
         e(1)=+, n(1)=+ and e(3)=-, n(3)=-, which collides twice, so two endpoints have to be
         flipped whichever assignment is taken. Uniform puts both flips on ONE connector, `k42`, the
         one that runs rightward, and buys a rule with no exception in it.
         THE TWO NUMBERS DIFFER BECAUSE THE FACES DO, 246 against 150. 24 is 9.8 percent of an
         object and 18 is 12 percent of a cell, both inside the 18 percent `FACE_FRAC` band, where
         an equal 24 would be 16 percent of a cell and would leave the `kubectl rollout history`
         caption 44.4 clear on its left instead of 50.4. Eight of the fourteen endpoints sit dead on
         a midpoint and six are systematic. CORRIDORS AT 438, 462 AND 486, one per crossing
         connector. What is left is TWO crossings, and they are the point of the card rather than a
         cost: a line reaching back over the others is what `the newest revision points at an object
         created long before it` looks like.
         L-09 FORBIDS A DIAGONAL, which is why a connector is an elbow and not a slant. Drawn
         straight the three are three diagonal segments, which `unit/spec-scene.test.mjs` reports.
         The elbow is better anyway: at 126 units of band against a 598 unit run a straight line
         sits 12 degrees off horizontal, and three of those cross at angles nobody can follow. A tap
         and a connector stay at 1 while their object is merely idle and follow it only BELOW
         `notready`, which is `laneOp`. A-13 is kept where it protects something, a lane into a sink
         that is GONE, and dropped where it only said twice what the replica count already says. A
         tap and a connector stay at full strength while their object is merely idle, and follow it
         only BELOW `notready`, where the sink is GONE rather than quiet. A-13 asks for min(source,
         sink) and A-14 is the case it protects, an arrow into nothing, so the threshold keeps the
         second and drops the first. The reading behind it: the two OUTER objects sit at zero
         replicas on five of the six steps, so under a strict min their two arrows stand at
         `notready` almost end to end while the two middle ones run bright, and the row reads as a
         shelf drawn with its ends faded out. What states that a ReplicaSet is not serving is the
         replica count printed on it. A connector is a RELATION and never a lane. Nothing travels
         it: it says which object carries which revision annotation, and reading a list is not
         traffic (A-06). That is also why the register is never a delivery target, and why all four
         taps stop on the shelf above it. Seven are declared and three or four are alive per step,
         switched by opacity out of `board`. The four aligned pairings are plain verticals with no
         corridor at all, which is deliberate: while the two orders agree the band has nothing in it
         to read, and every mark that appears later is the rollback. `mid` exists only on the three
         the rollback leaves. DO NOT centre `DX_OUT` and `DX_IN` to put every endpoint on a
         midpoint, and do not give the two the same sign. Eight of the fourteen endpoints already
         sit dead on one and the other six cannot: the pairing after the rollback is a three-cycle,
         so with both ends centred every braided column carries a descent leaving the shelf AND a
         descent reaching the register, and the corridor inequalities that would separate them
         reduce to c42 < c42. Opposite signs put the six descents on six distinct columns, 42 apart
         in each pair, and the question stops being asked. The record LANES block carries the proof,
         the rejected uniform offset, and why 24 and 18 are not the same number. The trunk and the
         bus carry every ball, so they are lanes and not relations, and `pathArrow` attaches a
         marker to each. `tune` drops it, because one head per run belongs on the tap that reaches
         an object. This is the `workloads-pod-qos-classes` idiom at two sites.
MOTION   Four steps carry balls and one does not. `reuse` sends THREE at once because the rollback
         is ONE act on this card and the surge-and-drain cadence belongs to
         `workloads-rolling-update`, so they leave together and the two short taps land at 776ms
         while the long one lands at 1393ms. Those are 349 and 627 units at the PKT_SPEED 0.45 the
         canon sets, which `pace.mjs` reads back on every ball of the card. The reading that the
         three are ONE controller sync is FALSE and the narration must not carry it:
         `rolloutRolling` returns after a scale-up, so a scale up and a scale down never land in one
         pass. The CONTENT block sources that.
         THE RENUMBER IS ONE BEAT, and that is the whole choreography of this card. Annotating the
         object revision 5 and scaling it back up are the one act of adopting it as the new
         ReplicaSet, so the entire register turns over on the `up` arrival and the six connector
         fades run on it together. Split across the three arrivals the list reads as shuffling,
         which is the one thing it must not look like: nothing moves between rows, one number is
         overwritten and the list re-sorts.
         What hands over on that beat is the SERVING COUNT and not the shade. Slot 2 already stands
         bright from `undo`, so the exchange a reader watches is `replicas 0 -> replicas 3` against
         `replicas 3 -> replicas 0` on slot 3, which is the fact, plus slot 3 falling to `notready`.
         Slot 2 does NOT rise from `OPACITY.pending` here: a rise needs `undo` to leave the object
         dim, and a dim object cannot carry the highlight that step puts on it. Winding slot 2 back
         at entry only to raise it 776ms later is a blink at the step boundary, which is the other
         half of why the rise is refused rather than merely moved to another beat.
         On `prune` the row and its connector go with the OBJECT, at the same arrival and over the
         same duration as the object itself. That is what `a pruned ReplicaSet takes its revision
         with it` means, and it is the second thing the register buys: the history shortening is
         drawn instead of being a string in a chip.
         `undo` IS THE ONE BEAT THAT RUNS UPWARD, and the reason is the sentence: the command copies
         the template a ReplicaSet froze back into `.spec.template`, so the object is the source and
         the owner is the receiver. The ball leaves at `BEAT.lead`, which is the M-18 wait for a
         block that acts first and also puts the flight under the clause that narrates it: the first
         sentence is the command, the second is this ball. It lands at 1500ms and the Deployment
         sublabel turns over on the arrival rather than at step entry, so the copy is drawn instead
         of standing done. Measured after: span 1500, live 2060, still 1140ms, 53 percent of the
         step, against 3200ms and 100 percent while it stood still, at an unchanged 11.19ms per
         character. The duration is untouched at 3200 because the reading load is what earns it, and
         `deadair.mjs` says the cure for a still step is motion and never `duration`. Its object
         stands at FULL strength although it runs no Pod, for two reasons that agree: it carries
         this step's highlight, and a highlight on a dimmed block is two cues arguing, and a ball
         may not leave a block that is dark (M-18a). What says it is not serving is `replicas 0`
         printed on it, which is a number and not a shade.
         `bad` is the one step carrying no ball at all. M-27 gives a packet-less, pod-less step
         `.highlight` alone and forbids the flash.
         `bad` dims slot 4 in place on a literal `delay: 600`. No `BEAT` token fits: every one of
         the three is measured off a pulse or a hop and this step has neither, and 600 is the pause
         that lets a reader reach `never reaches its Ready count` before the slot goes dim under it.
         Durations 1500 / 2800 / 2700 / 3200 / 3600 / 2800. `reuse` is the longest at 3600 because
         the register turnover and six connector fades land on one beat, and the braid is the thing
         a reader has to be given time to read.
         M-35 bites this card harder than most: a SEEK fires no `onfinish`, so every frame
         `frames.mjs` hands back on a ball step shows the fades done and the numbers still wound
         back, and the register stands with the OLD numbers under the NEW connectors.
         `tools/settled-dump.mjs` and a `gotoStep` read are the two paths that show what plays.
         EVERY ARRIVAL MARKS ITS RECEIVER AND THE MARK STAYS, dim or not. A ball landing on an
         unmarked block draws a write with no target, and on `reuse` three balls land: `rs2` rises
         under its mark, `rs3` and `rs4` keep theirs at `notready`, and on `prune` `rs1` keeps its
         own at `terminated`. The mark is what says the write HIT that object. The shade beside it
         is a different fact, how many Pods it runs, and the two are not in competition.
         A MARK COVERS THE OBJECT AND THE ROW THAT NAMES IT, always the pair, because on this card
         the pair is one fact and the connector between them is drawn to say so. `roll` lights `rs4`
         with `reg4`, `bad` lights `rs3` with `reg3`, and `undo` lights `rs2` with `reg2` at ENTRY
         rather than on an arrival, because there the pair is the SENDER. On `reuse` the pairing is
         the one the RENUMBER leaves, which lands on the same beat: `rs2` is revision 5 and takes
         `reg4`, `rs3` is revision 3 and takes `reg2`, `rs4` is revision 4 and takes `reg3`. Reading
         the row keys off the slot index there would light the rows the list held BEFORE the
         re-sort, which is the one thing this step exists to deny.
         `prune` is the exception and it is not an oversight: the row it would pair with is `reg1`,
         which fades to 0 on that same arrival, so a mark on it would be a highlight on nothing.
         What carries the pair there is the `gone` wire standing in the emptied cell.
         EVERY RECEIVER IS CUED BY `lights` ON THE ROUTE, never by `F.set({ at, lit })` plus
         `unlight`: `flowLights` copies a `lights` list onto the reduced path, which is exactly
         right when the highlight is part of the settled state, and it is here on all six routes.
         What is cued by the static `lit` instead is a SENDER, `rs2` and `reg2` on `undo`, and the
         one step with no ball at all, `bad`.
         WHAT IS NOT ALLOWED is a highlight on a block held dim while it is the step's SUBJECT,
         which is a different thing. On `undo` the object is not receiving anything, it is being
         compared with the Deployment and it is sending the read, so it is LIFTED to full strength
         instead of being marked at `pending`. The rule in one line: an arrival marks, a subject is
         lit AND bright. THE WHOLE REGISTER TURNS OVER ON ONE ARRIVAL, and the six connector fades
         hang off the same name. DO NOT spread these across the three arrivals of the step. The
         three balls are three separate scale writes drawn together, but the RENUMBER is a single
         annotation write, and a register that re-sorts in three instalments reads as rows moving
         between positions. Nothing moves: one number is overwritten and the list is re-read. The
         `up` arrival is the right one of the three because it is the ball that carries the
         annotation. `zero3` and `zero4` carry scale writes only, and each turns over its own
         object's count and nothing else. A pruned ReplicaSet needs a POSITIVE mark and not only a
         lower opacity. `OPACITY.terminated` is a WEIGHT in this catalog and 0.12 alone reads as
         "not this step's business" rather than as gone, which is the same finding
         `workloads-deployment-strategy` answered with a drawn void mark. `sub` replaces the replica
         count outright rather than setting it to zero. A deleted object has no count, and `replicas
         0` beside it would say it is still one of the ReplicaSets the limit is counting, which is
         the opposite of what the step just did. THE THIRD MARK IS THE ONE THE REGISTER ADDED: the
         row leaves the list. That is the consequence a reader actually cares about, and the `gone`
         wire states it at full strength inside the emptied cell, `revision 1 unreachable`, which is
         the only thing left down there a reader can see. Both marks are written in the STATIC block
         so prev and reset show them (T-30), and both are wound back on the animated path and
         restated by one `F.set` on the delete arrival. Written in `flow` alone they would come back
         blank on prev and on reset. Left in the static block alone they would call the object
         deleted 1393ms before the ball that deletes it arrives. The delete also MARKS the object,
         through `lights` on its own route, and the mark stays at 0.12. A terminated block with no
         cue on it reads as one that quietly went away rather than one that was deleted, and the
         mark is what ties the ball to what it hit. ONE writer for the whole board, and the reason
         is a defect this construction produces silently. A step is an object literal, so a
         `sublabels: { dep: ... }` field written BESIDE the `...board(...)` spread is overwritten by
         it: the Deployment template then never turns over on any step, and nothing in the suite
         sees it. Only `tools/settled-dump.mjs` does, by reading the frame each step leaves behind.
         Every value that could collide with the spread goes through here. The deeper reason is the
         subject. The two registers and the connectors between them are ONE fact per step, and
         stating them apart is exactly how they come to disagree: a row could name a revision no
         object carries, or an object could be joined to two rows, and no check in the suite would
         see either. `rows` is the history in revision order and its `slot` field is the only place
         the pairing is written down, so the connector opacity is derived from it and never typed.
         `read` is here for the first reason rather than the second. It is one lane on one step, but
         its opacity is an `opacity` key like any other, and written beside the spread it would be
         eaten by it and the lane would stand on every step at whatever the previous one left.
CONTENT  Read against k8s 1.35 and the page this card cites, on the two anchors `sources` names:
         kubernetes.io/docs/concepts/workloads/controllers/deployment/ at
         `#rolling-back-a-deployment` and at `#clean-up-policy`. The second is there because the
         limit and the gate on the cleanup are half of what the card claims, and neither is under
         the rollback heading.
         The card lives on the claim that an undo REUSES a ReplicaSet and renumbers it forward, and
         the docs SHOW that renumber rather than describing it. After an undo to revision 2 over a
         shelf of revisions 1, 2 and 3, the describe output reads `Annotations:
         deployment.kubernetes.io/revision=4` and `NewReplicaSet` names the ReplicaSet that already
         carried revision 2. Where the number moves is `SetNewReplicaSetAnnotations`, which
         overwrites `deployment.kubernetes.io/revision` whenever the old value is lower than the new
         one: "we are rolling back to this replica set".
         `rev 2` therefore LEAVES the list and `rev 5` appears. The reading where both numbers show
         is rejected on kubectl's own reader: `DeploymentHistoryViewer.ViewHistory` keys one row per
         ReplicaSet off `deploymentutil.Revision(rs)`, which reads the `revision` annotation alone
         and never `deployment.kubernetes.io/revision-history`, the annotation that preserves the
         old number on the object. One ReplicaSet is one row and the row is its CURRENT number. THAT
         READER IS WHY THE REGISTER IS ONE CELL PER OBJECT and never one cell per number ever
         issued. The register is not a log. It is `ViewHistory` walking the live ReplicaSets, which
         is exactly what the connectors draw.
         `rollout undo --to-revision=1 no longer resolves` is the same reader from the other side.
         `deploymentRevision` matches `toRevision` against the live ReplicaSets and answers
         `revisionNotFoundErr` when none carries it, so a deleted ReplicaSet takes its revision out
         of reach. With no flag that function takes the SECOND NEWEST revision, which is what `steps
         back one revision by default` states, and `--to-revision` is what this card needs to reach
         revision 2 across the one still serving.
         `undo` says nothing is created or deleted because the command is one PATCH: kubectl writes
         the stored template into `.spec.template` and stops, and the reuse is the controller's next
         sync. `DeploymentRollbacker.Rollback` does one `Patch` and `delete`s the
         `pod-template-hash` label from the template first, which is why the recomputed hash matches
         the ReplicaSet that froze that template. That same reading is what the wire label `rollout
         undo · patch .spec.template` states and what the one upward ball draws: the command is the
         actor, the write is a patch, and the field it lands in is `.spec.template`. It names no
         controller, because on this step none has run yet.
         `reuse` MAY NOT SAY ONE CONTROLLER SYNC, and this is the strongest ruling on the card. `one
         controller sync scales that object up, scales the two newer ones to zero and annotates it
         revision 5` is rejected as FALSE: `rolloutRolling` runs `reconcileNewReplicaSet` and then
         `if scaledUp { return dc.syncRolloutStatus(...) }` before it ever reaches
         `reconcileOldReplicaSets`, so a scale up and a scale down cannot land in the same pass. The
         docs draw the same picture from outside, one `ScalingReplicaSet` event per step under
         `#rolling-back-a-deployment`. What ships is `The controller annotates that object revision
         5, scales it up and the two newer ones to zero`: three verbs of one subject, which claims
         an order and no atomicity, and which the three simultaneous balls illustrate without
         asserting. The annotation and the adoption ARE one pass, which is what the wire label
         `scale writes · annotate revision 5` and the one-beat renumber rest on:
         `getAllReplicaSetsAndSyncRevision` calls `SetNewReplicaSetAnnotations` at the top of
         `rolloutRolling`, before either reconcile.
         THE LIMIT COUNTS OLD ReplicaSets AND NOT ZERO-REPLICA ONES. `Three ReplicaSets now sit at
         zero, one more than revisionHistoryLimit allows` is rejected: the API reference defines
         `.spec.revisionHistoryLimit` as "The number of old ReplicaSets to retain to allow
         rollback", and `cleanupDeployment` takes `diff` from `len(cleanableRSes)` over the OLD sets
         whatever their replica count, then skips a non-zero one at the delete rather than at the
         count. `Three old ReplicaSets now sit at zero` ships instead. The two readings give the
         same number here and only here: at `prune` the old sets are `rs1`, `rs3` and `rs4` and all
         three stand at zero, so the sentence that was true of this frame stated a rule that is
         false of a rollout in flight.
         `prune` waits for the rollout rather than firing at `roll`, because "the cleanup only
         starts after a Deployment reaches a complete state". That gate is what `once the rollout
         completes` says and what the `condition` chip carries there:
         `Progressing=True · NewReplicaSetAvailable` is the marker the docs set on a complete
         rollout. `Available=True` is rejected on that step, because it stands across the whole card
         and names no gate, and `workloads-rolling-update` rules the same pair the same way.
         `the oldest` is the LOWEST revision. `ReplicaSetsByRevision` sorts on the revision
         annotation with the creation timestamp as tie breaker, and on this shelf the two agree.
         `progressDeadlineSeconds` is named with no number although it "defaults to 600". The card
         draws no deadline and the beat of `bad` is the condition pair quoted whole, "type:
         Progressing, status: False, reason: ProgressDeadlineExceeded". A number the picture does
         not carry buys the reader nothing and costs the step a duration.
         `replicas 1` on the new object is the surge the DEFAULT dials allow, and no dial is named
         here. At three replicas the 25 percent defaults resolve to maxSurge 1, "rounding up", and
         maxUnavailable 0, "rounding down", which is why `web-6b8d` keeps its three until the
         rollback takes them.
         THE `old ReplicaSets at zero` CHIP IS GONE, and the reason is the composition rather than
         the fact. Its values counted the ReplicaSets at zero replicas, which the shelf now draws:
         four objects each printing its own count, three of them reading `replicas 0` on `prune`. A
         chip restating a number the picture already draws is the instrument-panel failure, and the
         count against the limit is what the narration says in words on the step that needs it. The
         `desc` carries BOTH readings of the limit, 2 on this Deployment and 10 by default. It is
         the one surface a dialog reader never sees, so dropping either half there leaves the pair
         stated nowhere the grid can reach, and at 468 characters it sits inside `D-04` with two to
         spare.
         A REVISION IS NOT ONLY AN OLD ReplicaSet. `it is an old ReplicaSet kept at zero replicas
         with a revision annotation` is rejected as over-narrow: the newest revision is a ReplicaSet
         with the same annotation and it is the one serving, and `ViewHistory` prints it in the same
         list. `it is a ReplicaSet with a revision annotation, kept at zero once it is old` ships,
         which costs two of the four characters `D-04` had left and states the definition and the
         zero separately. Spending more is refused rather than paid for out of the limit clause
         (`T-20`): every other clause in the sentence is itself a qualifier.
         THE HASH ON THE Deployment SUBLABEL IS THE HASH OF THE TEMPLATE AND NOT A FIELD OF ITS OWN,
         and it stays. `template app:v2.0 · hash 6b8d` opens on the word `template`, so the two
         facets are the template and the hash OF it, which is what the docs define: the label "is
         generated by hashing the `PodTemplate`". A Deployment stores no `pod-template-hash` and the
         card never says it does: the label "is added by the Deployment controller to every
         ReplicaSet that a Deployment creates or adopts", which is why only the four objects are
         NAMED by it. `roll` and `reuse` both attribute the hash to the template in words, `the
         template hash changes` and `the restored hash matches`. Rewriting the sublabel as a field
         path is rejected on the same reading, and so is dropping the hash: without it `undo` has no
         second string to compare and the card loses its beat.
         SEVEN ABSOLUTES STAND AND EACH NAMES ITS COUNTER-CASE ON THE CARD ITSELF (`T-19`). `no
         ReplicaSet carries that hash` on `roll` and `no fifth one is made` on `reuse` are the two
         branches of one test, so each is the counter-case of the other two steps away. `never
         reaches its Ready count` and `makes no progress` on `bad` describe this example rather than
         a rule.
         `Nothing is created or deleted` on `undo` is about the COMMAND and the next clause hands
         the reuse to the controller. `names any revision still in the list` carries its own
         qualifier: naming the CURRENT revision returns `skipped rollback (current template already
         matches revision %d)` and does nothing, which is why the verb is `names`. `revision 1 can
         no longer be reached` is `revisionNotFoundErr` on a deleted object.
         The `aria-label` states the TWO orders and the crossing, because that is what the picture
         draws and no other surface can say it. `get back under revisionHistoryLimit` is kept
         although the cleanup lands the count exactly ON the limit rather than below it, because
         `cleanupDeployment` deletes `diff` and stops: `under the limit` reads as "no longer over
         it", which is the state the delete reaches.
SCOPE    `maxSurge`, `maxUnavailable` and the surge-and-drain cycle are `workloads-rolling-update`.
         This card draws no Pod at all and narrates no cycle: `roll` surges once and the old
         ReplicaSet keeps its three replicas until the rollback takes them.
         `.spec.strategy.type` and the choice between the two orders are
         `workloads-deployment-strategy`, and neither RollingUpdate nor Recreate is named here. Why
         revision 4 never becomes Ready is `workloads-crashloopbackoff` and `workloads-probes`.
         `bad` says only that the ReplicaSet never reaches its Ready count, which is all the
         rollback needs from it.
         One ReplicaSet reconciling its own replica count is `workloads-replicaset`. Here a
         ReplicaSet is a record with a number on it and its reconcile loop is never drawn.
OPEN     THE POSTER IS THE OPEN ITEM. It draws the LIMIT, a segmented budget bar under a span
         bracket, and the card draws the RENUMBER, so the two say different things and the braid is
         the one a thumbnail could carry. Closing it is a redraw against the sibling montage, which
         is its own piece of work.
         THREE FORM-B ROWS ON `report/chip-beat.test.mjs`, one per ball step, all the same chip:
         `condition` reads its new value at entry while the first ball is 776 or 1393ms out. The
         reason is unchanged and is carried in `test/fixtures/carried.mjs`: a Deployment status
         condition is the PREMISE that sends the ball rather than something the ball earns, and
         binding it to the delete arrival would say a rollout completes because its oldest revision
         was pruned, which inverts the one dependency `prune` rests on. NO STEP HERE IS FORM-E, and
         that is a consequence of the composition rather than a gap. FORM-E is the strongest class
         the data can name and it needs OTHER chips on the step that DO wait for their arrival. This
         card carries neither: `kubectl rollout history` is a drawn register and the count of old
         ReplicaSets at zero is what the shelf prints, so what binds to an arrival binds as geometry
         and no axis that reads chips can see it. `carried.mjs` holds no R2-ENTRY row for this card
         for the same reason: there is no chip to name.
         An empty band between the register at 570 and the chip strip at 590 is 20 units. The band
         the panel gives back at 1600x1000 is unchanged and still unfillable, which is the house
         constraint in `scheme/CLAUDE.md` and not this card's to close.
         THE CAPTION STANDS 50.4 CLEAR ON ITS LEFT and 86.4 on its right once the braid is drawn,
         against 68.4 each side while the orders agree. `kubectl rollout history` inks 529.4..670.6
         at 1100x800, its worst viewport, and the two descents beside it move from the slot centres
         to 479 and 757. It is not re-centred on the braided reading: it belongs on `WL.CX` with the
         rest of the card, and the tighter of the two clearances is still 36 percent of the caption
         it protects.
```
