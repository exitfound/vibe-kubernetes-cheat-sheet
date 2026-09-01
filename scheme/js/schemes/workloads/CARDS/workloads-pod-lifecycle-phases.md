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
         The census that forced the redesign: the card previously carried the signature
         `box1 pod1 node1 chip4 cyl0 chain1 raw0`, byte for byte the signature of
         workloads-container-states, the sibling it sits beside in the grid AND the one it is most
         confusable with. Two cards teaching the difference between a phase and a container state
         looked like one card.
           machine  420..1120, y 100..310, clear of the panel on X so its geometry is not pinned to
                    the panel depth at all. Pending 420..580, Running 680..900 (150 tall, because
                    CrashLoopBackOff is drawn INSIDE it), fork trunk at x 927, Succeeded 955..1120
                    at y 100..158 and Failed at y 252..310, both on the machine centre line's fork.
           register 156..1044 below the panel: Kubelet 156..388 at y 435..515, Pod 644..1044 at
                    420..530, and the three chips on the same 156..1044 at y 570..604.
         The register is measured off the STRIP, and the strip is centred on CX because that is the
         only placement geometry-soft accepts: its CENTRE rule holds a chip strip on 600 to +-6,
         against a CENTRE_TOL of 40 for everything else. Kubelet, the Pod and the container box then
         span 156..1044 and centre on 600 exactly, so CENTRE-LOW is closed by construction rather
         than by the aligned right edge that used to close it.
         The machine's right edge is what CENTRE has left to spend: content spans 156..1120 and
         centres on 638, which is 2 units inside the 40. 1120 is therefore a CEILING and the machine
         cannot move right again while the register sits on CX.
         Pending starts ON 420 and not 20 clear of it. That is the whole leftward move L-03 allows
         and it is what pays for the ceiling above. The other route, cutting the 100 unit edgeRun
         gap, is refused as a PACE change: M-13 clamps everything under 315 units to 700ms, so a
         shorter path is the same duration at a visibly slower ball.
LAYOUT   TWO registers, and neither ever carries the other's ball. That pairing is the lever no
         sibling in workloads/pods-lifecycle carries:
           the CONTAINER register is horizontal and low: Kubelet -> Pod, ridden on `schedule`,
           `crashloop` and `recover`, the three steps where the phase does not move.
           the PHASE register is the machine's own edges, ridden on `running` and `terminal` only.
         A reader who watches the machine sees it stand still through the entire crash loop while
         Kubelet is visibly busy underneath it, which is the sentence of the card drawn rather than
         narrated. Every one of those five steps says the same thing again in its `pwire`.
PANEL    Measured 194.89 / 235.17 / 279.51 at 1600x1000, 1280x860 and 1100x800, so x<=397 and
         y<=279.51 at the worst of the three viewports report/overlay.test.mjs walks. It
         binds NOTHING here: the machine clears it on X (x>=420, L-03) and the register band clears
         it on Y (y>=400), so no y in this card is derived from PANEL_B and the constant is not
         carried. The card it replaced measured 504 and was the deepest panel in the catalog, which
         is what left it with 136 units of full width and forced Layout C on it. The narration was
         cut to three sentences a step to buy that back, and the paragraph that went is the one on
         an unreachable Node, Terminating and DisruptionTarget: that is cluster-node-failure's, and
         a pointer is not duplication.
SIZES    Kubelet is 232, the pair width workloads-pod-startup-conditions and
         workloads-pod-pending-init-states both draw their actor boxes at, and the reason this card
         carries it too: its longest string, `syncs the container`, inks 116.6 at 1100x800, so 232
         leaves 57.7 a side. The Pod is 400 around a 300 container box, 50 a side, and its two
         longest strings, `restartPolicy: OnFailure` at 147.2 and `Waiting · ContainerCreating` at
         165.6, are both centred on 844 and both well inside 644..1044.
SIZES    The chip cells are UNEQUAL, 260 / 340 / 260, which is a deviation from WL.L-05's equal
         three-across strip and the only thing that lets this strip narrow at all. Measured with
         render/chipfit.test.mjs, which prints the gap it has: at an equal 300 the cells failed by
         13 and 7 units on `Waiting · ContainerCreating` and `Waiting · CrashLoopBackOff`, so
         `container state` needs 317 for MIN_GAP 4 and takes 340 for a 27 unit gap, while the other
         two need 182 and 114 and are given 260. An EQUAL strip clearing 317 would be 1009 wide and
         would narrow the register by 6 percent where the unequal one narrows it by 18.
SIZES    Every state box is 58 tall but Running, which is 150 so the CrashLoopBackOff box fits
         inside it with a 25 inset on each side and 20 of clear floor. box() optically centres its
         label, which lands the word Running on that inner box, so the card's one `part.tune` moves
         the label's `y` attribute to 26. No step field reaches an SVG attribute, which is what
         `tune` is for.
LANES    Five, and all five carry ONE weight: dim, dashed, cluster hue, arrowhead only where a ball
         rides. The machine edges went in solid and non-dim, on the argument that a phase transition
         should be the brightest line on the card. That was wrong and it is the kind of wrong no
         check here can see: `dashed` has no canon row, no folder rule and no test, and `kin.mjs`
         counts lanes rather than their style. The measurement that settles it: 384 of the catalog's
         414 lanes are dashed, and of the 30 that are not, 7 of the 9 in workloads are one idiom, a
         short controller tap into a Pod row. Two solid state-machine edges were the only members of
         their own family. render/palette.test.mjs saw the deviation as a new combination,
         `workloads|scheme-arrow|cluster|rest`, and it went away with it.
         `edgeFail` carries NO arrowhead (A-05): this Pod exits 0, the Failed leg is drawn and never
         ridden, and it is the counterfactual `terminal` names in words.
         `edgeEnter` carries no arrowhead for the same reason, and that one IS a compromise the
         record has to name. It is drawn as an edge into the Pending face, which reads as the entry
         TRANSITION, and a transition wants a head. It has no ball only because the entry sits on
         `admit`, the poster step, which draws nothing by S-09. Giving it a head honestly means a
         narrated `admit` step and a 7-entry spine. Weighed and DECLINED 2026-09-01: the beat is not
         worth a step, and A-06 reads the line as a relationship the moment no step names traffic on
         it. Do not re-open it by putting a marker on a line nothing rides, which A-05 fails in the
         gate.
         `edgeEnter` takes `role: 'cluster'` with every other lane here even though it is the Pod's
         own field pointer. The ruling above EXPECTED_COMBINATIONS says why and it was measured: a
         role-less lane paints no category blue, there is no `.scheme-arrow-workloads` rule in
         diagrams.css at all, and it falls to rgb(63, 93, 138) against the rgb(91, 184, 255) beside
         it. It went in role-less on the first build and that check is what caught it.
LANES    EVERY lane and both lane captions stand at opacity 1 on all six steps, and nothing here
         animates one. That is the card's open deviation from A-13 and it is a ruling, not an
         oversight: a lane draws a RELATIONSHIP that does not stop being true because one of its
         ends is having a bad step. Three separate attempts to make lane shade carry meaning all
         produced the same defect. `min(source, sink)` on the register put a four-value swing on the
         only arrowhead here, 0.55 / 1 / 0.4 / 1 / 0.12, three of them while the lane was carrying a
         ball and Kubelet at its far end was lit. Naming the machine edge per step lit `edgeRun` on
         `running` alone and left it at 0.55 on the other five. Fading the register out with the Pod
         on `terminal` blacked out three lanes on the step a reader is looking hardest at. A reader
         sees an arrow flickering, never a phase.
         `dim: true` is what keeps them quiet: it is a WEIGHT class, not a state, so full opacity
         does not make a lane shout. Nothing on this card reads a lane's brightness for meaning,
         and the two things that used to (whether Kubelet is working, which edge is live) are both
         said by the blocks and by the two wire labels instead.
WIRE LABELS
         All three captions sit DIRECTLY over the thing they name, and each is derived from that
         thing rather than typed, so none of them can drift when the geometry moves.
           pwire      x 790, y 114: centred on Running and 12.6 above its top face, measured at
                      1600x1000 on the longest string, `phase stays Pending` at 130.9.
           cwire      x 516, y 455: centred on the sync lane and 16.6 above it, in the 256 unit
                      corridor between the Kubelet right wall and the Pod left wall.
           fieldTag   x 672, y 338: the MIDPOINT of the relation's horizontal run, 500 to 844, and
                      8.6 above it. It was hung off the Pod's own vertical at `POD_CX + 12` with
                      `anchor: 'start'`, which put it beside one leg of the path rather than over
                      the run, and it is centred now.
BUDGET   The cwire has a hard ceiling of 256 units, the corridor between Kubelet and the Pod, and a
         caption over the lane has to clear both walls. At 6.89 units per character (1600x1000, the
         widest reading, JetBrains Mono) that is 30 characters for a 24.5 unit gap each side.
         Two strings were cut to it and both keep their verb: `SyncPod · image pull · create sandbox`
         at 37 characters and 255 units cleared each wall by 0.5 and reads as touching them, and
         `backoff elapsed · StartContainer` at 32 and 220 left 18. They are 30 and 29 now, 206.7 and
         199.8. Nothing else on the card constrains a caption: pwire has the whole band above
         Running and fieldTag the whole band above the relation run.
LANES    The chip strip sits at the FLOOR, y 570, and not one panel gap below the panel where the
         category's C layout puts it. A full-width strip anywhere higher cuts the only corridor
         between the Pod and the machine it belongs to, and `edgeEnter` would then cross a chip.
MOTION   ONE choreography, seven rules, and every step is an instance of it. Nothing here is decided
         per step, which is what the card was repaired for: the beats used to be 0, 400 and an
         arrival in no particular pattern, and two of them contradicted each other.
           SENDER   the block a ball LEAVES is `lit` when the step opens, so the cue is on screen
                    before the send: Kubelet on the three DOWN steps, `pending` on `running` and
                    `running` on `terminal`, and NESTING takes `clbo` with the last of those. The
                    sender keeps the cue while it dims, so both ends of a transition end the step
                    lit, one bright and one at OFF, and what reads is the edge that was taken.
                    `unlight` on the fade was tried and refused: the static path has no fade to hang
                    an onfinish on, so it kept the class the played path had dropped, and
                    render/reduced.test.mjs named all three boxes on its HIGHLIGHT axis.
           ARRIVAL  a receiver is cued when the ball LANDS and never before: `lights` for a box,
                    `F.pulse` for a Pod.
           NESTING  a box drawn INSIDE another box is never lit or dimmed apart from it, in either
                    direction. A sub-block cued alone reads as a rendering fault, not as a state.
                    Two pairs here, and each is one unit by CONSTRUCTION rather than by a rule
                    somebody has to remember: `clbo` takes `running`'s shade in `machine()` and
                    rides its `lights` list, and the Pod's container box is never in a `lights` list
                    at all, because `pulsePod` already animates the shell rect AND the inner box.
                    That is why `containerBox` moved to `reducedLit`: the static path is the one
                    path with no pulse to carry the pair, and lighting the inner box alone THERE is
                    the shape 22 other steps in this category take.
           SHADE    every shade a step MOVES is animated on the beat that moves it, and `opacity:`
                    states only where the step SETTLES (S-13). The field arrives when the ball does,
                    so `pending` dims and `running` lifts on the `running` arrival, and `running`
                    dims and `succeeded` lifts on the `terminal` one, each with the sub-block inside
                    it. Pinning them at t=0 drew the destination at full strength through the whole
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
                    to `F.light` on their own arrival put five rows on report/arrival R2-ENTRY and
                    left the card the only member of that class in workloads.
           BEAT     HOP is BEAT.afterPulse and is the card's ONLY beat. Every delay is 0, an
                    arrival, or an arrival plus HOP.
MOTION   Two directions, and which one a step is in is the direction of its cause.
           DOWN     Kubelet acts on the container: the ball leaves at 0 and everything lands at its
                    arrival. `schedule`, `crashloop`, `recover`.
           UP       the container's state moves the machine: the Pod acts at 0 and the edge leaves at
                    HOP, so the cause is on screen before the consequence. `running`, `terminal`.
         `terminal` is the only step where the Pod both blinks and dies, and it is the shape
         report/pod-fade.test.mjs names as correct: the pulse at 0, the fade at HOP.
         NOTHING is cued in the machine on `crashloop`, and that is the step rather than an
         omission: the phase does not move, so the news is drawn where it happens, in the container
         box, the two chips and the cwire. Lighting `clbo` there was tried and it drags `running`
         with it by NESTING, which puts a cue on the one row the card exists to leave alone.
MOTION   Every hop is under routeDur's 315-unit floor, so all five balls are 700ms, the sync lane at
         256 units with the rest. Spans run 1600 to 2200, and the two 2200s are `crashloop` and
         `terminal`, where a fade hangs off an arrival plus HOP.
         `terminal` holds 2900 where its four siblings hold 2200 and 2400. It is the LAST step, so
         its hold is the end of the card rather than a gap before the next one, and at 2400 the 200
         it had left over read as the loop cutting the picture off. The 500 buys two things at once:
         `deadair.mjs` puts the still time at 700 instead of 200, and `timing.mjs` moves the step off
         6.14 ms per character, rank 21 of 617 and the second most hurried step in the catalog, to
         7.42 at rank 54. Raising duration is also the only sanctioned repair here (M-19).
         `fill: both` holds every fade at `from` through its delay, which keeps a state box dark
         until its own ball arrives. A-15 is free here: no lane ever leaves 1.
         The Pod's SHADE is its container's health and not the phase, which is the whole point: it is
         OPACITY.pending on `idle` and `schedule`, 1 on `running` and `recover`, OPACITY.notready on
         `crashloop` and OPACITY.terminated on `terminal`.
SIZES    The Pod is BUILT with its sublabel string rather than with `sublabel: ''`. `pod()` appends
         the text node only `if (sublabel)`, so with an empty one there is nothing for
         `setPodSublabel` to write into and every `podSublabels` entry is dropped in silence. Six
         steps stated `restartPolicy: OnFailure` and none of them drew it, and nothing in the suite
         can see that: it was found by looking at the frame.
MOTION   Every chip that MOVES is on the rewind form, on all five narrated steps: `chips` carries the
         settled end value the static path needs (S-13), `rewind` puts it back where the previous
         step left it, and an `F.set` bound to that step's own ball writes it again on arrival. Nine
         rows on the P-03 FORM-B queue closed with it, the whole of this card's share, and the
         catalog queue went 348 to 339. Verified with `tools/settled-dump.mjs`, which plays each step
         in REAL TIME: the six settled frames read Pending / Pending / Running / Running / Running /
         Succeeded and none / Creating / Running / CrashLoopBackOff / Running / Terminated.
         `report/geometry` frames cannot show this and it is not a defect of the card: `at()` hangs
         its write on the onfinish of an empty animation, and the frame tool pauses every animation,
         so a paused one never fires. The frozen instruments are the wrong ones for this construct.
         The price is two rows on R2-ENTRY, `3 status.phase` and `5 restartCount`, both filed in
         test/fixtures/carried.mjs with the reason. That axis reads two frames frozen at t=0, so it
         never sees a mid-step turnover and attributes it to the NEXT step, where the chip is
         correctly unlit. R2-STEP, the reading the canon actually asks for, holds this card on
         neither list, and `cluster-etcd-raft` rules the identical trade on the identical form.
SCOPE    The backoff ladder and its ceiling are workloads-crashloopbackoff's: this card names no
         number for the timer. restartPolicy is workloads-restart-policy's and therefore is NOT a
         chip here, only a standing value in the Pod sublabel, which is what freed the fourth chip
         slot and let the strip run three across instead of four. Container state as a subject is
         workloads-container-states's: this card draws it only to show it moving while the phase
         does not. An unreachable Node, Terminating and DisruptionTarget are cluster-node-failure's.
CONTENT  Pending is what a WAITING container forces, and one container starting is not enough to
         leave it. `schedule` must NOT read "The status.phase field is still Pending until at least
         one container has started", a necessary condition stated as the whole rule. The doc gives
         Running as "The Pod has been bound to a node, and all of the containers have been created.
         At least one container is still running, or is in the process of starting or restarting",
         and `getPhase` in `pkg/kubelet/kubelet_pods.go` evaluates `case waiting > 0: return
         v1.PodPending` BEFORE `case running > 0 && unknown == 0: return v1.PodRunning`, so on a
         multi-container Pod one container running does not move the phase. The step reads "stays
         Pending while any container is still waiting". The `desc` and the `running` step carry the
         same reading.
         https://kubernetes.io/docs/concepts/workloads/pods/pod-lifecycle/#pod-phase
CONTENT  Three defects the offline fact pass caught on the first build, all invisible to the gate:
         `Pending` carried the sublabel `accepted, not placed`, which the card's OWN `schedule` step
         contradicts, since that Pod IS placed and still Pending. The doc scopes Pending by the
         CONTAINERS, "one or more of the containers has not been set up and made ready to run", so
         the box reads `containers not up yet`.
         `Failed` read `a non-zero exit`, where the doc is "all containers terminated, and at least
         one terminated in failure": it reads `one exited non-zero`.
         `terminal` said the other edge is taken when a container ends non-zero "with no restart
         left", which is vague and wrong at the policy this card draws: under OnFailure a non-zero
         exit IS restarted. It names restartPolicy Never, which is what actually ends at Failed.
         restartPolicy stands in the Pod sublabel on all six steps for the same reason: steps 3 and
         5 both argue from it, and a value a narration reasons from is drawn.
CONTENT  `crashloop` names NO number: a backoff starts, status.phase stays Running. The ladder and
         its 300s ceiling are workloads-crashloopbackoff's, and a pointer is not duplication, a
         paragraph is (CANON.md:411). Bring it back and `by default` comes with it, since
         KubeletCrashLoopBackOffMax makes 300s a per-node default at 1.35.
         https://kubernetes.io/docs/concepts/workloads/pods/pod-lifecycle/
```

### before `const machine = ({ pending = OFF, running = OFF, succeeded = OFF, pod }) => ({`

```
MOTION   `machine()` states the SETTLED shade of every part, which is what the static and the reduced
         paths need (S-13), and every difference between two of them is animated on the arrival that
         causes it. A state a step is not in is drawn at OPACITY.pending and never removed (C-14):
         the reader has to see the values the field is not carrying for the one it is to mean
         anything, and a machine that hides its unvisited states is a list.
         `failed` is OFF on every one of the six steps. This Pod exits 0, so the leg it did not take
         stays the counterfactual, and `terminal` is the step that says so in words.
         `terminalTag` is the one caption that is NOT pinned at 1 with the lanes, because it labels
         two BOXES rather than a lane. It is `max(succeeded, OFF)`, so the caption at the fork is exactly as bright as
         the brighter of the two boxes it names and never brighter, and it lifts on the `terminal`
         arrival with `succeeded` rather than at t=0. A full-strength caption over two boxes at 0.55
         labels something that is not drawn, which is the `fieldTag` ruling applied to the one tag it
         had been left off. Caught by opening s05-0 at 1280x860, where the caption was the brightest
         string on the card while the box under it was still dim.
```

### poster

```
A state row on top, Pending to Running to the Succeeded/Failed fork, with Running at 0.20, by far
the brightest thing on the canvas. Below it the Pod it describes, joined by one dashed drop. The
sentence is that a single FIELD tracks the Pod, so the row and the Pod are two views of one thing.
The fork carries a tick and a cross, the only two glyphs, and the failed branch is dashed at 0.55
so the pair reads as one taken outcome and one alternative rather than as two events.
```
