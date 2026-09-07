## workloads-deployment-strategy

### layout

```
WHAT     One field decides the ORDER of the two orders a Deployment issues, and the order decides
         whether the handover window holds both Pods or nobody. Each track plays BOTH of its orders,
         one per step, so the sequence is watched rather than read off a tile.
LAYOUT   TWO STACKED STRATEGY TRACKS, and NO `LAYOUT` preset at all. The presets choose which house
         column holds a ladder and which holds a chip column, and this card carries neither, so it
         states its own geometry and takes its strip from `strip({from: WL.L, to: WL.R, count: 3})`,
         which lands on the same 350.67 `LAYOUT.C.strip.three` spells. The card imports no `LAYOUT`
         at all: `WL.L-06` counts it among the five that name a preset in a comment only, and an
         import read by nothing is what makes that count and the code disagree.
           actor      40..120, one box 484..716 centred on CX, 232 wide as on `rolling-update`
           jog        340, the trunk corner, forking to BUS_L 350 and BUS_R 850
           track A    RollingUpdate, Pods 366..438, tiles 380..424, caption line 354
           track B    Recreate, Pods 474..546, tiles 488..532, caption line 462
           per track  tile 60..320, window 380..820, tile 880..1140
           Pods       380..590 and 610..820, 210 by 72, filling the window edge to edge
           chips      566..600, THREE across at 350.67 (WL.L-05 three-across)
         BOTH ANSWERS STAND AT ONCE, one above the other, and that is the whole deviation. A card
         whose subject is a COMPARISON cannot re-decide one column and ask the reader to remember
         what it said two steps ago: the y axis here is WHICH STRATEGY and the x axis is WHICH
         MOMENT, so the reader compares straight down one x and the settled frame of every step
         carries both readings. X IS TIME ON BOTH TRACKS. The order issued FIRST is the left tile
         and reaches the LEFT Pod, the order issued SECOND is the right tile and reaches the RIGHT
         Pod, on both rows. That is what makes the Recreate track the RollingUpdate track MIRRORED,
         Pods and tiles together: track A reads Create web-b2, web-b2, web-a1, Terminate web-a1 and
         track B reads the same four right to left. The alternative, the same Pod at the same x on
         both rows, was rejected on the lanes: the first order of one track would then reach the far
         Pod, and a lane from the left tile to the right slot crosses the Pod between them. With the
         mirror no lane crosses a block it does not land on, one bus per side reaches both rows, and
         a reader covering the panel still sees a first order on the left of both tracks. The mirror
         is not symmetry applied to an asymmetric mechanism. What is symmetric is the PAIR OF
         ORDERS, which really is the same create and the same terminate either way round, and the
         asymmetry is the consequence, which is exactly what the two windows draw apart. THE SPINE
         IS SEVEN STEPS, two per track: each order is a step, because a step that fires both orders
         of one track draws a sequence as a simultaneity, and the wait BETWEEN them (for Ready on
         one track, for the removal on the other) is the mechanism. One order per track in one step
         each leaves the second order as a lit tile that never executes, which reads as no
         difference between the steps and no sense of the sequence. `field` opens with no ball and
         `converged` closes with no ball: the four animated steps between them are one order each.
         THE OUTAGE IS DRAWN AND NOT LEFT AS AN ABSENCE. A slot that merely loses its Pod reads as a
         half nobody finished, because a missing body is the same ink as one that is not built yet
         and dim is a WEIGHT rather than a state. So the slot Recreate empties carries `gapMark`, a
         fill-less dashed hollow the exact size of the ONE Pod it stands in for, with `no Pod
         serving` inside it, and web-a1 on that track goes to 0 rather than dim when it rises. It is
         one slot and not the whole window because web-b2 is still drawn beside it as a not-created
         ghost until the next step creates it, and the mark dies on the blink that makes that Pod
         Ready, which is when the outage ends. After that the left slot of track B stands empty with
         no mark, exactly as the right slot of track A does after its terminate: an update that is
         done leaves one Pod, and the caption over the window says so. BOTH TRACKS RUN THE FULL
         WIDTH, and they have to. Read with the chips in a 320 wide left column instead,
         `report/geometry-soft.test.mjs` returns three findings: the chip strip centres on 220
         against 600, the content spans 420..1140 and centres on 780, and the twelve blocks below
         the panel centre on 795. A chip is not content to that rule, so a chip column cannot
         balance a drawing however full it looks. Full width and a bottom strip reads 0 on all
         three. NO Node frame. The subject is which order the controller issues and not where a Pod
         runs, which is the argument `workloads-replicaset` and `workloads-rolling-update` share,
         and a frame spanning both tracks would say the split is by Node.
PANEL    x<=397 catalog-wide (`L-02`). Bottom per viewport:
         `OVERLAY_IDS=workloads-deployment-strategy node --test report/overlay.test.mjs`. The panel
         pins the JOG and nothing else, and the jog at 340 is derived from the deepest reading
         rather than typed, leaving 35.64 units. Deepest on step 0 at 1100x800, shallowest at
         1600x1000, a swing of 92.03 units on step 0 and the widest the card has. Step 0 is the
         deepest because the poster previews `field` (`D-14`), whose narration is the longest at 445
         characters. `converged` is next at 442 and reads level with the poster at 1600x1000.
         The left jog is the ONE horizontal reaching into the panel column: it runs 600 to 350 at
         y=340, and only its 350..397 stretch is under the panel at all. The right jog runs 600 to
         850 and is never under it. Every other segment of both buses and all four taps sit right of
         x=350 and below y=402, so L-03 does not reach them.
         The first tile of each track opens at y=380, 75.64 under the deepest panel, and the two
         standing tags ink from 342.8 at 1600x1000, where the panel bottom is 212.33. Both halves of
         that clearance are read at ONE viewport: a drawn string is a fixed PIXEL size, so pairing a
         tag reading from one viewport with the panel of another gives a gap no viewport actually
         renders.
         The band the panel vacates at 1600x1000 stands empty between the actor row and track A.
         That is the house constraint written up in `scheme/CLAUDE.md` rather than this card's
         defect: the geometry is pinned to the deepest panel and no card fills the difference.
SIZES    The actor box is 232 by WL.BOX_H, which is the `workloads-rolling-update` Deployment box to
         the unit: the same object on the sibling card, and an owner drawn at two sizes reads as two
         kinds of owner. It was 420..780, the full WL.L-07 corridor box, which made the one block on
         the card that is not part of a track the widest thing above the tracks. Centred on CX it
         runs 484..716, so the trunk still leaves a face midpoint at 600 (WL.L-07) and the row still
         starts right of 420 (WL.L-02). Measured at 1600x1000 the label `Deployment web` inks 99.1
         and the sublabel `.spec.replicas 1` 96.5, both inside a 232 box.
         A COUNT NAMES ITS TRACK, and that is what the `serving` values are shaped by. Both readings
         stand on the canvas at once, so `0, nobody` settled under a lit Ready web-b2 on the other
         track and read as a contradiction rather than as the Recreate window: the values are now
         `1, web-a1 on both tracks`, `RollingUpdate 2, web-a1 and web-b2`, `RollingUpdate 1,
         web-b2`, `Recreate 0, nobody`, `Recreate 1, web-b2` and `1, web-b2 on both tracks`, so each
         says whose count it is and the two that hold everywhere say that instead. The keys carry
         the track for the same reason the strings do: `aTwo`, `aFresh`, `bNone`, `bFresh`. A STEP
         READS ITS OWN TRACK, and only the three steps that are ABOUT both say `on both tracks`:
         idle, `field` and `converged`. `recreateCreate` settles on `Recreate 1, web-b2` even though
         both windows hold web-b2 by then, because the both-tracks reading is the summary
         `converged` exists to make: given to step 5 it leaves `converged` cueing a chip whose value
         did not change, which is the P-09a cue for a change that never happened.
         THE ORDER CHIP TAKES NO SUCH PREFIX and does not need one. Measured at 1600x1000 its name
         inks 82.7 and its longest value `2 of 2, terminate web-a1` 165, and a `RollingUpdate `
         prefix adds about 96, which is 344 against the 326.67 the strip leaves: it does not fit. It
         also has nothing to disambiguate, because it NAMES the order it is counting and the
         strategy chip beside it names the track. A bare number was the whole problem.
         Measured after the change at 1600x1000: `RollingUpdate 1, web-b2` inks 158.5 and `Recreate
         0, nobody` 124 against a `serving` name of 48.2, so the widest of them leaves about 120 of
         air in the 326.67.
         The chip strip is 350.67 wide, which is 326.67 between the insets `valChip` leaves.
         Measured at 1600x1000, where a string is widest in viewBox units, on `converged`, the one
         step whose every chip value is written at entry and so stands on a seek frame: the tightest
         pair is `.spec.strategy.type` at 130.9 over `RollingUpdate or Recreate` at 172.3, which
         leaves 23.5 of air between 202.9 and 226.4, and the other two read `order issued` 82.7 over
         `2 of 2 on both tracks` 144.7 and `serving` 48.2 over `1, web-b2 on both tracks` 165.4. The
         longest per-step values, `2 of 2, terminate web-a1` and `2, web-a1 and web-b2`, are written
         by an `F.set` and stand on no seek frame: they are three and one characters shorter than
         the two measured values beside them in the same face, so they clear by construction, and
         the settled dump is where their text is read.
         An order tile is 260 against a longest label of `Terminate web-a1` at 102.5, so it clears
         78 each side. The sublabels `first` and `then` are 30.1 and 24.1 and bind nothing.
         A Pod is 210 by 72 with a 150 inner box, floored by `not created` at 66.3. The Pod pair is
         deliberately louder than the tiles that bracket it: 440 of Pod against 260 of tile, which
         is what makes the window rather than the caption the thing a reader lands on.
         The void caption `no Pod serving` is 96.5 inside a 210 slot, centred on 485.
         `web-b2 serves alone, update done` inks 489.7..710.3 at 1600x1000, centred on the window at
         600, against the `RollingUpdate` tag ending at 149.6: 340.1 of air. It is the longest
         caption that stands on a seek frame. `web-b2 starting, nobody serving yet` is three
         characters longer and is written only by an `F.set`, so it is measured nowhere: at the same
         face it runs about 241 and gives back about 330 against the shorter `Recreate` tag ending
         at 115.1. Nothing in the suite measures a wire label (L-19).
LANES    NINE, and each ball rides three of them as one route. `trunk` is a LANE with its marker
         dropped by `tune`, leaving the Deployment bottom face midpoint at CX and stopping at the
         jog. It carries balls, so it cannot be a relation: `relationPath` pins stroke-opacity at
         0.45 and drew the ball's own road at half the strength of the tap it feeds, which is the
         `workloads-deployment-rollback` reading of A-05 and A-07. Every bus segment is the same
         shape for the same reason.
         `busLHigh` corners left to 350 and runs down to track A, `busLLow` carries on to track B,
         and `busRHigh` and `busRLow` are the same pair on the right at 850. `tapA1`, `tapA2`,
         `tapB1` and `tapB2` are the 30 unit arrows into the Pod each order acts on, at its near
         face midpoint, and the heads belong there rather than on a bus, which is the
         `workloads-pod-qos-classes` reading of A-05. The left bus carries every FIRST order and the
         right bus every SECOND, which is what puts the two orders of one track on the two sides of
         one window.
         BOTH BUSES ARE SPLIT at track A for the `workloads-pod-garbage-collection` reason.
         Unsplit, the leg below track A stands with a dangling end on the step that empties the slot
         it feeds on track B, which is the shape A-14 calls a rendering fault rather than a dim
         relationship: it has to die with the tap it feeds, and `busLLow` does, on the same beat as
         `tapB1` and web-a1 on `recreateTerminate`.
         Nothing crosses a block it does not terminate on: BUS_L 350 sits in the 320..380 corridor
         both tracks leave between the first tile and the window, BUS_R 850 in the 820..880 corridor
         between the window and the second tile.
         562 and 670 units on each side, all clear of the 314 where `routeDur` stops clamping, so
         every ball runs at the canon PKT_SPEED 0.45 and none is floor-bound: 1249 and 1489ms, and
         `pace.mjs` reads 0.450 on all four.
         `stage()` states each block's shade and its lane's in one place (A-16). EVERY LANE IS LIT
         WHOLE OR IT IS GONE, road and tap alike: all nine take `tiles` while anything they still
         reach EXISTS, and 0 once every sink of one has left, which is the `road()` helper. A LANE
         TAKES NO THIRD SHADE off the block it points at. A Pod that is not created yet is not gone,
         it is a block the card is going to fill, and the 0.4 saying so belongs to the BLOCK: drawn
         on the line as well it made a lit road end in a half-dark 30 unit stub, which reads as a
         line that failed to render rather than as a Pod that is not there yet.
         Chaining min(source, sink) down the spine instead is REJECTED, and it costs two defects
         rather than one. `busRHigh` takes the 0.4 of the not-created web-b2 it still reaches on
         track B, so on `rollingTerminate` and `recreateTerminate` the jog left of CX stands at 1
         and the jog right of it at 0.4, ONE horizontal line at y=340 in two shades, with the same
         break again down the 850 vertical. And `tapA1` and `tapB2` stand at 0.4 on the POSTER, so
         the picture a reader opens has two of its nine lanes half-dark before anything has
         happened. A-14 is about a lane ending in NOTHING, and the dangle it does name is still
         drawn: `busLLow` and `tapB1` go to 0 together on `recreateTerminate` when web-a1 leaves
         track B, which is why both buses are split at track A at all.
         Read with the Deployment as the source instead, the poster draws a 0.4 spine that turns 1.0
         at a track midline, the same fault from the other end.
         Every rewind holds the lane a ball is about to ride at 1 for the whole flight (A-15):
         `tapA2` on `rollingTerminate`, `tapB1` and `busLLow` on `recreateTerminate`. The two create
         steps ride lanes already at 1 in their static block, so no rewind is owed there, and no
         rewind is owed for a bus that no longer moves.
MOTION   3100 / 4400 / 5200 / 5000 / 5400 / 4600 against spans of 801 / 2949 / 3749 / 3589 / 4689 /
         0, and `timing.mjs` prints the per-character pace beside each. `field` holds 3100. It cues
         once at BEAT.lead and then stands still, so the whole hold is pure reading time: over its
         445 characters 4200 reads 9.44 ms/char, generous even against the pace the catalog gives
         its LONG narrations, 3600 reads 8.09, and 3100 reads 6.97, inside that population rather
         than at its edge (`card-review/tools/timing.mjs` prints the pace and the rank, and
         `report/baselines.test.mjs` the population). The floor is the span, 801, and long before
         that floor the step stops being readable: this is the longest narration on the card, so the
         next cut has to come out of the PROSE and not out of the hold.
         `field` fires no ball, and that is the step rather than a gap in it: nothing has been
         ordered yet. What it does is present the four orders AS ONE SET, a single `F.light` over
         all four tiles at BEAT.lead: the step's sentence is that both tracks issue the same create
         and the same terminate, and the four cues arrive together because that pair is one fact. A
         walk tile by tile is REJECTED: it draws a SEQUENCE, which is what the four animated steps
         after it are for, and on a step whose point is that the two orderings hold the same two
         orders it says the opposite. The tiles are already at full strength when the card opens, so
         nothing on the step brightens either. It is the packet-less pod-less step a box cue belongs
         on.
         THE TILE IS THE ORDER, SO IT LIGHTS WHEN THE BALL LEAVES, not when it lands: the Deployment
         issues Create web-b2 and the ball carries it to the Pod it names. On every animated step
         the `F.light` on the tile shares the delay of the `F.route`, BEAT.lead on a self-initiated
         order and the Ready blink plus BEAT.afterPulse on the released one.
         THE SECOND ORDER IS RELEASED BY A BLINK, and the gap between the blink and the ball is the
         mechanism. On `rollingTerminate` web-b2 blinks Ready at BEAT.lead, the serving count goes
         to two on that blink, and the terminate leaves BEAT.afterPulse later: that is the wait for
         Ready drawn as a beat. On `recreateCreate` the removal has already succeeded at entry (the
         void is standing), so the create leaves at BEAT.lead with nothing to wait for, and the
         Ready blink comes FADE.out + BEAT.afterPulse past its arrival, which is the cold start. The
         void dies on that blink and not on the arrival, because a Pod that is starting is not one
         that is serving, and the caption says so for the span between them.
         A TERMINATED POD BLINKS ON THE ARRIVAL AND THEN FADES, the `workloads-rolling-update`
         `drain` shape: `F.pulse` and the `F.fade` to 0 are both `at: 'terminate'`, so the Pod
         acknowledges the order it is leaving on (M-08) and the tap and bus segment that fed it fade
         with it (A-14). The void rises and the count drops FADE.out past that arrival, once the
         body is gone, because a Pod still fading is not yet removed and the outage the chip states
         begins when the removal has succeeded.
         `.spec.strategy.type` TURNS OVER ON THE DEPARTURE BEAT of `recreateTerminate`, BEAT.lead
         into the step, cued by that same `F.set` and NOT in the step's `lit`: cued at entry it
         would stand on the wound-back `RollingUpdate` for 800ms, which is the cue-before-the-change
         P-05 refuses, and doing it to this chip and not to its two neighbours on their own beats is
         what P-04 refuses. `converged` is the one step that cues all three chips at entry, because
         nothing on it arrives to cue them later and each of the three changes there.
         The structure stands at FULL STRENGTH on the poster, the four orders and every line of the
         road together, and `field` changes not one shade: it only cues. At 0.4, with the tiles
         brightening on the turn into step 1, the opening frame carries a transition and the poster
         reads as a dimmed draft of the picture step 1 talks about. `gapMark` is the one
         part born at 0, because it is the only thing on the canvas that is not yet true, and the
         two not-created Pods are the only 0.4 left: the BLOCK carries that shade and no line does
         (C-14).
         A POD IS CUED WHOLE. `converged` lights `podAnewShell` and `podAnewBox` together, and the
         same pair on track B, which is why those two Pods declare a `shellKey` and the two that
         leave do not. The inner box alone lit a container inside a Pod that stayed dark, so the cue
         pointed at the wrong object, and the shell alone leaves a flat app box inside a lit frame.
         Both keys are in `reset.keys`, or the class accumulates (S-19).
         Nothing needs `reducedLit`, and stating it is a defect here rather than a belt:
         `flowLights` derives the whole cue list from the five `F.light` calls and the `lights` of
         every `F.set`, and `unit/spec-steps.test.mjs` fails a key stated by hand that it can
         already derive.
WIRE LABELS
         Two, one over each window at that track's caption line, and they carry what THAT window
         holds this step. THE POSTER STATES THEM TOO, the way `workloads-rolling-update` states its
         three: both windows hold web-a1 alone before anything is ordered, so `web-a1 serves alone`
         is already true on the idle step, and leaving `wires` off it made two labels APPEAR on the
         turn into step 1 on a frame that is otherwise complete. S-09 forbids the poster a `flow`, a
         `motion` and a `rewind`, not a static string, and ten cards state one there.
         The vocabulary is one `CAP` list: `web-a1 serves alone`, `web-b2 starting beside web-a1`,
         `both are up across this window`, `web-b2 serves alone, update done`, `nobody is up across
         this window` and `web-b2 starting, nobody serving yet`. Every step states both statically,
         so prev and reset show the settled string (T-30), and on the played path a caption that
         moves is wound back and put forward by the `F.set` on its beat. There is no `req` wire
         above the actor row (WL.A-02): the order is already the label of the tile the ball leaves
         under, so a top-row wire would restate it.
         The two standing `P.tag`s are a different job and not per-step captions: `RollingUpdate`
         and `Recreate` name the two tracks on every step, which is what lets a reader compare down
         one x without tracing a lane back to a chip.
CONTENT  Every claim below is read against `k8sVersion` 1.35, off the raw Deployment concept page
         and the `apps/v1` Deployment API reference, and both cited sources carry the sentences they
         are cited for.
         `.spec.strategy.type can be "Recreate" or "RollingUpdate". "RollingUpdate" is the default
         value` is the Strategy section verbatim in substance, which is where `two values and no
         third` comes from. The API reference says it twice over, as an enum of exactly those two
         and as `Default is RollingUpdate`, and that second half is what carries `a Deployment
         written with no strategy at all gets RollingUpdate`.
         `All existing Pods are killed before new ones are created when .spec.strategy.type==
         Recreate` is the Recreate Deployment section. Its Note, `This will only guarantee Pod
         termination previous to creation for upgrades`, is why `recreateTerminate` says `on an
         upgrade` rather than stating the guarantee flat: a Pod deleted by hand is replaced
         `immediately (even if the old Pod is still in a Terminating state)`, so the unscoped
         sentence would be a false absolute (T-19).
         THE GAP IS BOUNDED BY THE REMOVAL AND NOT BY THE CALL, which is the same Note: `Successful
         removal is awaited before any Pod of the new revision is created`. So `recreateTerminate`
         says `until the removal has succeeded`, `recreateCreate` opens `Only once web-a1 is gone`,
         and the create ball leaves only on the step AFTER the void is standing.
         THE OUTAGE IS THE REMOVAL PLUS THE COLD START, and `recreateCreate` says so in those words:
         the create waits on the removal succeeding, so the removal is inside the window being
         measured and a reader handed the start alone is handed the smaller half of it. The void
         stands from the removal to the Ready blink, which is that whole span drawn.
         THE REPLICA COUNT IS STATED, and it has to be. `.spec.replicas 1` is the Deployment
         sublabel and the two first-order steps name it, because Recreate terminates EVERY old Pod
         and a reader assuming a fleet would read one drawn Pod leaving as the whole claim.
         `recreateTerminate` says it inside the sentence that makes the claim: at 1 it means web-a1
         alone and at any larger count it means all of them.
         The overlap claim is pinned to a dial rather than left unqualified. At `.spec.replicas` 1
         the 25% defaults resolve to maxSurge 1 and maxUnavailable 0, the API reference giving
         `Absolute number is calculated from percentage by rounding up` for the one and `rounding
         down` for the other against a `Defaults to 25%` on both, so the arithmetic at 1 replica is
         a ceiling of 1 and a floor of 0. `rollingCreate` spells the consequence in words, `may run
         one Pod above the count and may not lose the one it has`, because that pair is the reason
         the create comes first. At maxSurge 0 the order inverts, so the unqualified sentence would
         contradict its own sibling `workloads-rolling-update`.
         THE PIN IS SPENT ON ALL THREE SURFACES and not on the narration alone, because the
         `aria-label` and the `desc` each state the RollingUpdate ORDER on their own and neither
         reader ever reaches step 2. The `aria-label` carries `under the default maxSurge 1`. The
         `desc` spends its pin as a VERB, `surges to create the replacement`, rather than as a
         clause it has no room for (T-20).
         READINESS RELEASES THE SECOND ORDER, which is `maxUnavailable 0` read from the other side:
         the Deployment may not remove web-a1 until a replacement counts as available, and the API
         reference gives `minReadySeconds` a `Default: 0 (pod will be considered available as soon
         as it is ready)`. `rollingTerminate` therefore says `at the default minReadySeconds 0 that
         readiness alone releases the second order`, and `only that readiness releases the second
         order` is rejected: at any larger minReadySeconds the Pod has to stay Ready for that long
         first, so the unpinned sentence is a false absolute (T-19). The blink that precedes the
         ball is that readiness. The probe that produces Ready is not drawn and not named:
         `workloads-probes`.
         THE ADVICE ON `converged` CARRIES NO `only`. `Pick Recreate only when the two versions must
         never run at once` is rejected: it is guidance and not a documented rule, and a reader with
         a reason of their own is told they are wrong by a card that cannot know it. The sentence
         ships as `Pick Recreate when ...` with `keep the default otherwise`, which states the
         default without forbidding the exception.
         THE 25% DEFAULT IS THE FIELD, AND 1 IS WHAT IT RESOLVES TO. The `aria-label` reads `where
         the 25% maxSurge default resolves to 1 at this single replica`. `under the default maxSurge
         1` is rejected: the API reference gives `Defaults to 25%` on both dials, so a bare `default
         maxSurge 1` states a default the field does not have, and the reader who carries it away
         reads every Deployment as surging by exactly one Pod. The narration of `rollingCreate`
         already spells the arithmetic and the label now agrees with it.
         THE FIELD CHANGES THE RESULT WHEN THE UPDATE DOES NOT COMPLETE, so `converged` reads `on an
         update that completes the field changes the path and not the result`. `the field never
         changes the result, only the path` is rejected under T-19: at `maxUnavailable` 0 a
         RollingUpdate whose new Pod never reports Ready leaves the old Pod serving, while Recreate
         has already killed it, `All existing Pods are killed before new ones are created`. The two
         end states differ exactly where the choice matters most, so the absolute told a reader the
         choice cannot cost them anything.
         `.spec.template has just been changed to v2.0` on `field` is what makes the two tracks an
         upgrade at all: the concept page says a rollout `is triggered if and only if the
         Deployment's Pod template (that is, .spec.template) is changed`, so a card that opened on a
         replica change would be describing a scale, where neither strategy is consulted.
         `starting` is the Pod sublabel between the create arrival and the Ready blink, the same
         word `workloads-rolling-update` uses, and it is not a phase or a condition: it stands for
         the whole of ContainerCreating and the readiness wait, which
         `workloads-pod-startup-conditions` owns. `25%` and not `25 percent`:
         `workloads-rolling-update` owns both dials and spells the defaults that way in its own
         narration and its own `desc`. THE ReadWriteOnce CLAUSE IS SCOPED TO A NODE CHANGE and sits
         on `converged`, the step about choosing. `which is what a ReadWriteOnce volume needs` is
         rejected: the access mode is `the volume can be mounted as read-write by a single node` and
         `still can allow multiple pods to access that volume when the pods are running on the same
         node`, so a replacement landing on the SAME Node needs no clean cut at all, and
         `storage-multi-attach-error`, the card this one pays the debt to, states the same condition
         as `whenever the replacement Pod lands on another Node`. `what lets a ReadWriteOnce volume
         change Nodes` carries that condition inside the claim instead of beside it.
NAMING   The two Pods are `web-a1` and `web-b2` rather than ordinals, matching the sibling
         `workloads-rolling-update`: an ordinal implies an age order this drawing never establishes,
         and here the two are drawn in opposite x order on the two tracks.
         An order tile is labelled `Create web-b2` and `Terminate web-a1`, capitalised, because a
         block label opening on a lowercase identifier is a System A finding (T-09). `Pod` is
         dropped from the tile and kept on the Pod, where the label is the object rather than the
         order acting on it. The same rule reaches the narration: a sentence opens `Pod web-b2
         reports Ready`, never `web-b2 reports Ready`, because the sentence-capital check reads the
         first character and an identifier has none.
         The chip names are `order issued` and `serving`, lowercase, because a chip name is body
         text (T-09): `Pods serving` was reported DOWN by the gate and `serving` says the same
         thing. `order issued` counts, `1 of 2, create web-b2`, so a reader sees where in the
         sequence the track stands without re-reading the tiles.
         `handover window` is the name both narrations and the captions use, so the reader has one
         word for the span the whole card is about.
SCOPE    `maxSurge`, `maxUnavailable`, the surge-and-drain cycle over a fleet and the readiness
         gating of the NEXT slot are `workloads-rolling-update`. This card says only that
         RollingUpdate OVERLAPS and hands the width of the overlap over in one clause. It re-walks
         no rollout: there is one create and one terminate per track here, not a cycle, and no Pod
         count moves.
         The probe that produces Ready is `workloads-probes`, and what a Pod is doing while it is
         `starting` is `workloads-pod-startup-conditions`: here readiness is one blink and starting
         is one word.
         Revisions, `revisionHistoryLimit` and `kubectl rollout undo` are
         `workloads-deployment-rollback`, and none of the three is named.
         The Multi-Attach deadlock is `storage-multi-attach-error`, which is the card this one pays
         a debt to: its resolution step already tells a reader to set the strategy to Recreate and
         `Recreate` appears nowhere else in the catalogue. The consequence is named here in ONE
         clause on the last step, that a ReadWriteOnce volume attaches to one Node at a time, and no
         volume, no attach and no CSI component is drawn. A `cylinder()` is the one lever this
         section has never used that this subject could reach for, and it is refused on that ruling:
         a drawn disk makes the card teach the volume rather than the field.
         `podManagementPolicy` and StatefulSet ordering are `workloads-statefulset-ordered-rollout`.
         A StatefulSet is not a value of this field, so it is not named anywhere on the card.
         The ReplicaSet the Deployment works through is `workloads-replicaset`. The narration says
         `the controller` and never names a ReplicaSet, because T-21 would then put one on the
         canvas and this card has room for one actor.
NOT A DEFECT
         The two tracks are near twins on steps 0 and 1, and that is the true picture of those
         steps: until an order is issued the only thing separating the two orderings IS the mirror.
         From `rollingCreate` on, every step changes exactly one slot, and the settled frame of
         every step from `rollingTerminate` on holds the two windows in different states.
         `report/arrival.test.mjs` R2-ENTRY prints six rows against this card and all six are
         carried in `test/fixtures/carried.mjs`. They are the frozen-sampling class that axis
         documents: every chip that moves on an animated step moves on a beat, so at t=0 both frames
         read the wound-back string. R2-STEP, which reads the settled frame, prints nothing here.
         The right bus and `tapA2` stand at 1 from `field` on, before any order has gone that way,
         and so does the left tap into the not-created web-b2. Dimming a lane to say "no order yet"
         or "the Pod at the end is not built" would spend the shade vocabulary on states the Pod
         itself already states.
         NO LANE ON THIS CARD IS EVER AT A PARTIAL SHADE, on any step: each is 1 or 0. Checked by
         playing all seven steps through `tools/settled-dump.mjs`, whose opacity line lists only
         what is off 1, and the whole of it is `podAnew` and `podBnew` at 0.4 while each is not
         created, `gapMark`, and `tapA2`, `tapB1`, `busLLow` at 0 once the Pod they fed has gone.
         `podAnew` and `podAold` stand at full strength through the two Recreate steps, the steps
         about the other track. That is the composition rather than a missed cue: both readings
         stand at once and the `.highlight` set says which one the step is about, so dimming the
         settled answer to mark focus would spend the shade vocabulary on something it does not
         mean.
         `.spec.strategy.type` reads `RollingUpdate or Recreate` on `converged`. The chip means the
         field, the step is about both values of it at once, and a chip that kept `Recreate` would
         say the summary belongs to one track.
```
