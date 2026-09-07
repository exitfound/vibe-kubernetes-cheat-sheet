## workloads-pod-lifecycle-phases

### layout

```
WHAT     status.phase is a coarse SUMMARY field with two absorbing terminal states, so it says where
         a Pod is in its life and never whether the Pod is healthy.
LAYOUT   A state machine BOARD, and the section's only card carrying no node() frame and no chain.
         Both are deliberate and both are the subject talking:
           the phase is a field on the API object, and a Node appears in it exactly once, as the
           value of spec.nodeName. A frame around the Pod makes the phase read as a property of the
           Node, which is the one thing the card exists to deny.
           a chain of six rows restating six narrations gives a reader nothing the panel already
           gave them, and the machine IS the sequence: it is drawn, not listed.
         The census is what holds both. This card signs `box6 pod1 node0 chip3 cyl0 chain0 raw0`,
         and taking back the frame and the chain would put it on `box1 pod1 node1 chip4 cyl0 chain1
         raw0`, byte for byte the signature of workloads-container-states, the sibling it sits
         beside in the grid AND the one it is most confusable with. Two cards teaching the
         difference between a phase and a container state must not look like one card.
           machine  176..1024, y 100..310, the strip minus 20 a side, so the board sits INSIDE the
                    Kubelet..Pod width. Pending 176..366 (190), edgeRun gap 100, Running 466..726
                    (260, 150 tall, because CrashLoopBackOff is drawn INSIDE it at 491..701), fork
                    trunk at x 776 with 50 to each wall, Succeeded 826..1024 at y 100..158 and
                    Failed at y 252..310, both on the machine centre line's fork.
                    Running is EQUIDISTANT: 100 from the Pending wall and 100 from the terminal
                    pair, so the row reads as one measure. A 130 / 70 split reads as pushed right.
           register 156..1044 below the panel: Kubelet 156..388 at y 435..515, Pod 644..1044 at
                    420..530, and the three chips on the same 156..1044 at y 570..604.
         BOTH bands are measured off the STRIP, and the strip is centred on CX because that is the
         only placement geometry-soft accepts: its CENTRE rule holds a chip strip on 600 to +-6,
         against a CENTRE_TOL of 40 for everything else. Kubelet, the Pod, the container box and the
         machine then centre on 600 exactly, so CENTRE and CENTRE-LOW are closed by construction
         rather than by an aligned edge, which a later move of any one block would take away.
         Content spans 156..1044.
         The machine is inside the strip rather than on the L-03 line by decision: at 420..1120 it
         read as pushed into the right half of the canvas with its terminal boxes 76 past the Pod,
         and the reader wanted the two bands to line up. Every x of the machine is a share of the
         848 span (MACH_L, MACH_R), so the board moves as one piece if the inset changes. TWO
         registers, and neither ever carries the other's ball. That pairing is the lever no sibling
         in workloads/pods-lifecycle carries:
           the CONTAINER register is horizontal and low: Kubelet -> Pod, ridden on `schedule`,
           `crashloop` and `recover`, the three steps where the phase does not move.
           the PHASE register is the machine's own edges, ridden on `running` and `terminal` only.
         A reader who watches the machine sees it stand still through the entire crash loop while
         Kubelet is visibly busy underneath it, which is the sentence of the card drawn rather than
         narrated. Every one of those five steps says the same thing again in its `pwire`.
PANEL    x<=397 catalog-wide (`L-02`). Bottom per viewport:
         `OVERLAY_IDS=workloads-pod-lifecycle-phases node --test report/overlay.test.mjs`. Deepest
         at 1100x800, shallowest at 1600x1000. It binds the machine's LEFT end, which the OPEN block
         states, and nothing else: the register band clears it on Y (y>=400), so no y in this card
         is derived from `PANEL_B` and the constant is not carried. The narration is held to three
         sentences a step, and that is what keeps the panel off 504, the depth at which only 136
         units of full width are left and Layout C is forced. The fourth paragraph a step could take
         is the one on an unreachable Node, Terminating and DisruptionTarget, and it belongs to
         `cluster-node-failure`: a pointer is not duplication.
SIZES    Kubelet is 232, the pair width workloads-pod-startup-conditions and
         workloads-pod-pending-init-states both draw their actor boxes at, and the reason this card
         carries it too: its longest string, `syncs the container`, inks 116.6 at 1100x800, so 232
         leaves 57.7 a side. The Pod is 400 around a 300 container box, 50 a side, and its two
         longest strings, `restartPolicy: OnFailure` at 147.2 and `Waiting · ContainerCreating` at
         165.6, are both centred on 844 and both well inside 644..1044. The chip cells are UNEQUAL,
         260 / 340 / 260, which is a deviation from WL.L-05's equal three-across strip and the only
         thing that lets this strip narrow at all. Measured with render/chipfit.test.mjs, which
         prints the gap it has: at an equal 300 the cells failed by 13 and 7 units on `Waiting ·
         ContainerCreating` and `Waiting · CrashLoopBackOff`, so `container state` needs 317 for
         MIN_GAP 4 and takes 340 for a 27 unit gap, while the other two need 182 and 114 and are
         given 260. An EQUAL strip clearing 317 would be 1009 wide and would narrow the register by
         6 percent where the unequal one narrows it by 18. Every state box is 58 tall but Running,
         which is 150 so the CrashLoopBackOff box fits inside it with a 25 inset on each side and 20
         of clear floor. box() optically centres its label, which lands the word Running on that
         inner box, so the card's one `part.tune` moves the label's `y` attribute to 26. No step
         field reaches an SVG attribute, which is what `tune` is for. The Pod is BUILT with its
         sublabel string rather than with `sublabel: ''`. `pod()` appends the text node only `if
         (sublabel)`, so with an empty one there is nothing for `setPodSublabel` to write into and
         every `podSublabels` entry is dropped in silence. With an empty one the six entries stating
         `restartPolicy: OnFailure` all draw nothing, and nothing in the suite can see that: only
         the frame can.
LANES    Five, and they carry TWO weights, which is what separates a route from a relationship here.
         All five share the rest: dashed `5 5`, `dim` at stroke-width 1.4, cluster hue rgb(91, 184,
         255). Measured at 1600x1000:
           `edgeRun`, `edgeSucc`, `syncLane` are `P.lane`, each carries a ball on some step, and each
           draws at stroke-opacity 1 with an arrowhead.
           `edgeEnter` and `edgeFail` are `P.relation`, neither carries a ball on any step, and
           `relationPath` classes them `scheme-arrow-relation`, which css/diagrams.css holds at
           stroke-opacity 0.45, with no head.
         0.45 against 1 is the reading, and levelling them is refused: A-08 sinks a relationship
         behind the live wires on purpose, and a solid non-dim machine edge is a family of one in
         this catalog. `dashed` has no canon row, no folder rule and no test, and `kin.mjs` counts
         lanes rather than their style, so nothing here would catch a lane that went solid. The
         dashed share of the catalog is printed by report/baselines.test.mjs and is not copied here.
         NEITHER relation passes a `dash` argument, and neither needs one: `relationPath` puts
         `scheme-arrow-dashed` on every relation it builds and css/diagrams.css gives that class
         `stroke-dasharray: 5 5`. Canon A-20 reads the other way and is wrong about this call.
         `edgeFail` carries NO arrowhead (A-05): this Pod exits 0, the Failed leg is drawn and never
         ridden, and it is the counterfactual `terminal` names in words.
         `edgeEnter` carries no arrowhead for the same reason, and that one IS a compromise the
         record has to name. It is drawn as an edge into the Pending face, which reads as the entry
         TRANSITION, and a transition wants a head. It has no ball only because the entry belongs to
         `idle`, the poster step, which draws nothing by S-09. Giving it a head honestly costs a
         narrated entry step and a 7-entry spine, and that beat is not worth a step: A-06 reads the
         line as a relationship the moment no step names traffic on it. Do not close the gap by
         putting a marker on a line nothing rides, which A-05 fails in the gate.
         `edgeEnter` takes `role: 'cluster'` with every other lane here even though it is the Pod's
         own field pointer. The ruling above EXPECTED_COMBINATIONS carries the measurement: a
         role-less lane paints no category blue, there is no `.scheme-arrow-workloads` rule in
         diagrams.css at all, and it falls to rgb(63, 93, 138) against the rgb(91, 184, 255) beside
         it. Dropping the role here is a colour fault, and that check is the one that names it.
         EVERY lane and the `fieldTag` caption stand at opacity 1 on all six steps, and nothing here
         animates one. `terminalTag` is the exception and MOTION says why. This is
         the card's open deviation from A-13 and it is a ruling, not an oversight: a lane draws a
         RELATIONSHIP that does not stop being true because one of its ends is having a bad step.
         Three ways of making lane shade carry meaning are refused, each on its own reading:
           `min(source, sink)` on the register puts a four-value swing on the only arrowhead here,
           0.55 / 1 / 0.4 / 1 / 0.12, three of them while the lane is carrying a ball and Kubelet at
           its far end is lit.
           naming the machine edge per step lights `edgeRun` on `running` alone and leaves it at
           0.55 on the other five.
           fading the register out with the Pod on `terminal` blacks out three lanes on the step a
           reader is looking hardest at.
         A reader then sees an arrow flickering, never a phase.
         `dim: true` is what keeps them quiet: it is a WEIGHT class, not a state, so full opacity
         does not make a lane shout. Nothing on this card reads a lane's brightness for meaning, and
         the two things a reader might look to a lane for, whether Kubelet is working and which edge
         is live, are both said by the blocks and by the two wire labels instead. The chip strip
         sits at the FLOOR, y 570, and not one panel gap below the panel where the category's C
         layout puts it. A full-width strip anywhere higher cuts the only corridor between the Pod
         and the machine it belongs to, and `edgeEnter` would then cross a chip.
MOTION   ONE choreography, seven rules, and every step is an instance of it. Nothing here is decided
         per step, and that is the constraint: a spread of raw beats (0, 400, an arrival) chosen per
         step lets two of them contradict each other with every check green.
           SENDER   the block a ball LEAVES is `lit` when the step opens, so the cue is on screen
                    before the send: Kubelet on the three DOWN steps, `pending` on `running` and
                    `running` on `terminal`, and NESTING takes `clbo` with the last of those. The
                    sender keeps the cue while it dims, so both ends of a transition end the step
                    lit, one bright and one at OFF, and what reads is the edge that was taken.
                    `unlight` on the fade is refused: the static path has no fade to hang an
                    onfinish on, so it keeps the class the played path drops, and
                    render/reduced.test.mjs names all three boxes on its HIGHLIGHT axis.
           ARRIVAL  a receiver is cued when the ball LANDS and never before: `lights` for a box,
                    `F.pulse` for a Pod.
           NESTING  a box drawn INSIDE another box is never lit or dimmed apart from it, in either
                    direction. A sub-block cued alone reads as a rendering fault, not as a state.
                    Two pairs here, and each is one unit by CONSTRUCTION rather than by a rule
                    somebody has to remember: `clbo` takes `running`'s shade in `machine()` and
                    rides its `lights` list, and the Pod's container box is never in a `lights` list
                    at all, because `pulsePod` already animates the shell rect AND the inner box.
                    `containerBox` therefore belongs in `reducedLit` and nowhere else: the static
                    path is the one path with no pulse to carry the pair, and lighting the inner box
                    alone THERE is the shape 22 other steps in this category take.
           SHADE    every shade a step MOVES is animated on the beat that moves it, and `opacity:`
                    states only where the step SETTLES (S-13). The field arrives when the ball does,
                    so `pending` dims and `running` lifts on the `running` arrival, and `running`
                    dims and `succeeded` lifts on the `terminal` one, each with the sub-block inside
                    it. Pinning them at t=0 draws the destination at full strength through the whole
                    flight, which is the same defect as pre-lighting it.
           POD      cued once a step and always by a PULSE, on the arrival that reaches it. The full
                    pulse and not `pulsePodDim` wherever a fade runs in the same step: the dim one
                    animates the same opacity the fade does and the two fight for 900ms. `running`
                    is the one step with no Pod cue at all, and correctly: no ball reaches the Pod
                    there, its rise from 0.55 to 1 is the whole event, and a blink would be a second
                    cue for one thing.
           CHIP     a chip whose value changes is `lit` from the step's open, which is the opposite
                    of the block rule and is deliberate: a chip is a READOUT the step tells you to
                    watch, so the cue goes up first and the value lands under it. Moving the three
                    to `F.light` on their own arrival puts five rows on report/arrival R2-ENTRY and
                    leaves the card the only member of that class in workloads.
           BEAT     HOP is BEAT.afterPulse and is the card's ONLY beat. Every delay is 0, an
                    arrival, or an arrival plus HOP.
         Two directions, and which one a step is in is the direction of its cause.
           DOWN     Kubelet acts on the container: the ball leaves at 0 and everything lands at its
                    arrival. `schedule`, `crashloop`, `recover`.
           UP       the container's state moves the machine: the Pod acts at 0 and the edge leaves at
                    HOP, so the cause is on screen before the consequence. `running`, `terminal`.
         `terminal` is the only step where the Pod both blinks and dies, and it is the shape
         report/pod-fade.test.mjs names as correct: the pulse at 0, the fade at HOP.
         NOTHING is cued in the machine on `crashloop`, and that is the step rather than an
         omission: the phase does not move, so the news is drawn where it happens, in the container
         box, the two chips and the cwire. Lighting `clbo` there drags `running` with it by NESTING,
         which puts a cue on the one row the card exists to leave alone. Every hop is under
         routeDur's 315-unit floor, so all five balls are 700ms, the sync lane at 256 units with the
         rest. Spans are 1600 on `schedule` and `recover`, where the last beat is the arrival, and
         2200 on `running`, `crashloop` and `terminal`, where a fade hangs off an arrival plus HOP.
         DURATION here is set by READING LOAD and not by the motion: M-19 is satisfied on every step
         with room to spare, and nothing bounds the hold from above (M-19a). The two long narrations
         are what buy their own holds: `crashloop` takes 2800 for 370 characters and `terminal` 2900
         for 391, against 2300 on `schedule` and 2400 on the other two. That holds all five between
         7.42 and 7.87 ms per character, which is the band a new narration has to stay inside, and
         `timing.mjs` prints the figure and its catalog rank so neither is copied here. `terminal`
         keeps the longest hold of the five whatever else moves: it is the LAST step, so its still
         time is the end of the card rather than a gap before the next one, and 200ms of it reads as
         the loop cutting the picture off. Raising duration is the only sanctioned repair for a
         hurried step (M-19).
         `fill: both` holds every fade at `from` through its delay, which keeps a state box dark
         until its own ball arrives. A-15 is free here: no lane ever leaves 1.
         The Pod's SHADE is its container's health and not the phase, which is the whole point: it
         is OPACITY.pending on `idle` and `schedule`, 1 on `running` and `recover`, OPACITY.notready
         on `crashloop` and OPACITY.terminated on `terminal`. Every READOUT that moves is on the
         rewind form, on all five narrated steps: `chips` carries the settled end value the static
         path needs (S-13), `rewind` puts it back where the previous step left it, and an `F.set`
         bound to that step's own ball writes it again on arrival. That keeps this card off the P-03
         FORM-B queue entirely.
         The `containerBox` SUBLABEL rides the same three fields as the `container state` chip, and
         it has to: the two are one fact drawn twice, so a sublabel left on the plain `sublabels`
         write turns over at t=0 while its own chip waits for the ball, and the two readouts then
         disagree on screen for 700ms on the DOWN steps and 1500 on `running` and `terminal`. The
         other repair, moving the CHIP to t=0 on the two UP steps where the container is the cause,
         is refused on the gate: `phaseChip` turns over on a beat in those same steps, which makes a
         t=0 `stateChip` a FORM-E record, and FORM-E is promoted into unit/chip-beat-e.test.mjs.
         Verified with `tools/settled-dump.mjs`, which plays each step in REAL TIME: the six settled
         frames read Pending / Pending / Running / Running / Running / Succeeded, and the chip and
         the box agree on every one of them.
         `report/geometry` frames cannot show this and it is not a defect of the card: `at()` hangs
         its write on the onfinish of an empty animation, and the frame tool pauses every animation,
         so a paused one never fires. The frozen instruments are the wrong ones for this construct.
         The price is two rows on R2-ENTRY, `3 status.phase` and `5 restartCount`, both filed in
         test/fixtures/carried.mjs with the reason. That axis reads two frames frozen at t=0, so it
         never sees a mid-step turnover and attributes it to the NEXT step, where the chip is
         correctly unlit. R2-STEP, the reading the canon actually asks for, holds this card on
         neither list, and `cluster-etcd-raft` rules the identical trade on the identical form.
         `machine()` states the SETTLED shade of every part, which is what the static and the
         reduced paths need (S-13), and every difference between two of them is animated on the
         arrival that causes it. A state a step is not in is drawn at OPACITY.pending and never
         removed (C-14): the reader has to see the values the field is not carrying for the one it
         is to mean anything, and a machine that hides its unvisited states is a list.
         `failed` is OFF on every one of the six steps. This Pod exits 0, so the leg it did not take
         stays the counterfactual, and `terminal` is the step that says so in words.
         `terminalTag` is the one caption that is NOT pinned at 1 with the lanes, because it labels
         two BOXES rather than a lane. It is `max(succeeded, OFF)`, so the caption at the fork is
         exactly as bright as the brighter of the two boxes it names and never brighter, and it
         lifts on the `terminal` arrival with `succeeded` rather than at t=0. A full-strength
         caption over two boxes at 0.55 labels something that is not drawn, which is the `fieldTag`
         ruling applied to a tag naming two boxes. Pinning it at 1 makes it the brightest string on
         the card while the box under it is still dim, and s05-0 at 1280x860 is the frame that shows
         it.
WIRE LABELS
         All three captions sit DIRECTLY over the thing they name, and each is derived from that
         thing rather than typed, so none of them can drift when the geometry moves.
           pwire      x 596, y 114: centred on Running and 12.6 above its top face, measured at
                      1600x1000 on the longest string, `phase stays Pending` at 130.9.
           cwire      x 516, y 455: centred on the sync lane and 16.6 above it, in the 256 unit
                      corridor between the Kubelet right wall and the Pod left wall.
           fieldTag   x 557.5, y 338: the MIDPOINT of the relation's horizontal run, 271 to 844, and
                      8.6 above it. Hanging it off the Pod's own vertical at `POD_CX + 12` with
                      `anchor: 'start'` puts it beside one LEG of the path rather than over the run,
                      which is why the midpoint is derived rather than typed.
CONTENT  Pending is what a WAITING container forces, and one container starting is not enough to
         leave it. `schedule` must NOT read "The status.phase field is still Pending until at least
         one container has started", a necessary condition stated as the whole rule. The doc gives
         Running as "The Pod has been bound to a node, and all of the containers have been created.
         At least one container is still running, or is in the process of starting or restarting",
         and `getPhase` in `pkg/kubelet/kubelet_pods.go` evaluates `case waiting > 0: return
         v1.PodPending` BEFORE `case running > 0 && unknown == 0: return v1.PodRunning`, so on a
         multi-container Pod one container running does not move the phase. The step reads "stays
         Pending while any container is still waiting for its first start", and the last four words
         are load-bearing: `getPhase` counts a Waiting container with a
         `LastTerminationState.Terminated` as `stopped`, not `waiting`, so the CrashLoopBackOff
         container this card draws on `crashloop` is in Waiting while the phase reads Running.
         "while any container is still waiting" is rejected because step 3 of this very card
         contradicts it. The `desc` and the `running` step carry the same reading.
         https://kubernetes.io/docs/concepts/workloads/pods/pod-lifecycle/#pod-phase A terminal
         phase needs every container exited AND no restart owed, and the `desc` says both: "once
         they have all exited and none will be restarted". "when they all exit" is rejected because
         under restartPolicy Always, the default, `getPhase` returns Running when every container is
         stopped ("All containers are in the process of restarting"), and the doc gives Succeeded as
         "terminated in success, and will not be restarted". 445 of the 470 the band allows, so the
         clause has room. `schedule` orders the Kubelet's work as "creates the sandbox and pulls the
         image", and the cwire follows it, `SyncPod · sandbox · image pull`. "pulls the images and
         creates the sandbox" is rejected: `kuberuntime_manager.go` `SyncPod` runs "4. Create
         sandbox if necessary" before "8. Create normal containers", and `startContainer` opens on
         "Step 1: pull the image", so the app image is pulled after the sandbox exists. The
         container reads ContainerCreating through both: `convertToAPIContainerStatuses` gives every
         container the `defaultWaitingState` with that reason until the runtime reports it. The
         aria-label says status.phase is "drawn as a coarse state machine", never that it IS one.
         The doc: "nor is it intended to be a comprehensive state machine", so the machine on this
         board is the card's rendering of a summary field, and the label says so. Pending has a
         second exit the board does not draw: `getPhase` returns Failed for a failed init container
         under restartPolicy Never BEFORE it tests `waiting > 0`, the doc sets every Pod on a lost
         Node to Failed, and since 1.27 a deleted Pending Pod is moved to a terminal phase before it
         leaves the API. The `running` narration allows for it, "its one healthy edge", and the
         board stays two-edged: a Pending to Failed lane is a composition change and is not taken
         inside a fact check. "the fifth value Unknown was deprecated in 1.22" is read against the
         API type: `types.go` in release-1.21 carries no marker on `PodUnknown` and release-1.22
         adds "Deprecated: It isn't being set since 2015
         (74da3b14b0c0f658b3bb8d2def5094686d0e9095)", which the Pod API reference repeats under the
         enum. The concept page still lists Unknown as a possible value with no note, which is why
         the PodStatus reference is the card's second source: it is the page that carries this
         sentence.
         `Terminated · Completed` is the runtime's string, not the Kubelet's: containerd fills an
         empty reason on a CONTAINER_EXITED status with `completeExitReason` for exit 0 and
         `errorExitReason` otherwise. `Waiting · ContainerCreating` is the Kubelet's
         `defaultWaitingState`. `Never` ending at Failed and `OnFailure` not restarting exit 0 are
         the doc's restart table, and the exit 0 and exit non-zero steps of
         `workloads-pod-restart-policy` say the same. Three wordings the gate cannot see, each
         pinned to the doc and each with a plausible alternative that is wrong: `Pending` reads
         `containers not up yet`, because the doc scopes Pending by the CONTAINERS, "one or more of
         the containers has not been set up and made ready to run". `accepted, not placed` is the
         wrong scope and the card's OWN `schedule` step contradicts it: that Pod IS placed and still
         Pending. `Failed` reads `one exited non-zero`, against the doc's "all containers
         terminated, and at least one terminated in failure". `a non-zero exit` drops the ALL.
         `terminal` names restartPolicy Never as the branch that ends at Failed. "with no restart
         left" is vague and wrong at the policy this card draws: under OnFailure a non-zero exit IS
         restarted. restartPolicy stands in the Pod sublabel on all six steps for the same reason:
         steps 3 and 5 both argue from it, and a value a narration reasons from is drawn. The
         container's terminal state is `Terminated · Completed` in BOTH the chip and the box, and
         one constant serves the pair. `containerStatuses[].state.terminated` carries `reason` and
         `exitCode` both, so `Terminated · exit 0` is equally valid and is refused only because two
         readouts of one fact must not word it two ways (P-04). `crashloop` names NO number: a
         backoff starts, status.phase stays Running. The ladder and its 300s ceiling are
         workloads-crashloopbackoff's, and a pointer is not duplication, a paragraph is
         (CANON.md:411). Bring it back and `by default` comes with it, since
         KubeletCrashLoopBackOffMax makes 300s a per-node default at 1.35.
         https://kubernetes.io/docs/concepts/workloads/pods/pod-lifecycle/
BUDGET   The cwire has a hard ceiling of 256 units, the corridor between Kubelet and the Pod, and a
         caption over the lane has to clear both walls. At 6.89 units per character (1600x1000, the
         widest reading, JetBrains Mono) that is 30 characters for a 24.5 unit gap each side.
         The two longest cwires stand at 30 and 29 characters and both keep their verb:
         `SyncPod · sandbox · image pull` inks 206.7 and clears each wall by 24.6, and `backoff over
         · StartContainer` inks 199.8 and clears each wall by 28.1. A caption at 37 characters inks
         255 and leaves 0.5 a side, which reads as touching both walls, so 30 is the ceiling and not
         a preference. Nothing else on the card constrains a caption: pwire has the whole band above
         Running and fieldTag the whole band above the relation run.
SCOPE    The backoff ladder and its ceiling are workloads-crashloopbackoff's: this card names no
         number for the timer. restartPolicy is workloads-pod-restart-policy's and therefore is NOT
         a chip here, only a standing value in the Pod sublabel, which is what freed the fourth chip
         slot and let the strip run three across instead of four. Container state as a subject is
         workloads-container-states's: this card draws it only to show it moving while the phase
         does not. An unreachable Node, Terminating and DisruptionTarget are cluster-node-failure's.
OPEN     Pending 176..366 at y 176..234 lies inside the panel's band on every viewport: at 1600x1000
         the panel (x<=290.77, y<=194.89) covers its top-left corner, at 1280x860 (377.76, 235.17)
         its whole left half, and at 1100x800 (396.55, 279.51) all of it but the right 30 units, so
         the word Pending is not on screen there. Known, accepted with the move, to be closed
         separately: a lower machine (which costs the status.phase corridor) or a narrower panel are
         the two candidates.
```
