## workloads-pod-pending-init-states

### layout

```
WHAT     The five values the STATUS column takes before Running, which component is still holding
         the Pod at each of them, and the columns beside it that turn a value into a diagnosis.
LAYOUT   C. Panel bottom 255, kept in the header comment and in no constant, because nothing here
         derives from it (L-07). The subject is a kubectl row, so the ROW takes the floor and the
         machine band moves up to meet it. No ladder and no raw instrument: of the seven cards in
         this section this is the only one carrying neither, and its whole content band is the
         table.
           actors 484..716 (Scheduler, centred on CX) and 778..1010 (Kubelet), 40..120, both 232
           node   190..1010 at 316..456, centred on CX. NODE_H 140 is the workloads frame family
           pod    370..830 at 338..434, app container 450..750 at 368..412
           chips  the kubectl get pods -o wide row, THREE across at 340 wrapped onto two
                  rows, 76..1124 at 500..576
         Both actor boxes take the 232 that workloads-pod-startup-conditions draws its pair at,
         and its arrangement: the left box centred on CX, the right right-aligned. It aligns on
         the FRAME and not on WL.R, which is the paragraph below.
         `holds it while Pending` inks 135 and `holds it after that` 116.6, so 232 leaves 97 and
         115.4.
         The frame is 820 and not the WL.L-02 full width. 1080 around a 460 Pod left the band 57
         percent empty and 820 leaves 44. WL.A-03 is what fixes the centring: a narrowed frame is
         centred on WL.CX so its top face midpoint still equals the spine the corridor lands on.
         820 rather than less is set by the ACTOR ROW. report/geometry-soft measures the content
         box off the blocks and the frame and never off the chips, so once the frame stops being
         full width the frame is the left edge of that box and the Kubelet is the right edge. The
         two balance on CX only while the Kubelet is right-aligned on the frame, and a frame under
         816 then pushes the Kubelet inside the house 60 unit gap from the Scheduler. At 820 the
         gap is 62 and the content box is 190..1010, centre 600.
         The strip is 340 a cell and not the 350.67 of LAYOUT.C.strip.three, which is the whole
         reduction the row has. chipfit measures the gap between the name and the VALUE PILL, not
         between the two texts: at 350.67 that gap is 23.7 against a MIN_GAP of 4, so 330 collides
         on three steps and 340 leaves 13. The row sits within 24 units a cell of its own floor.
         Reading across then down IS the order kubectl prints, READY STATUS RESTARTS then AGE
         NODE, and the one cell that is not a kubectl column sits last, off the end of the row.
         A single six-across row was measured and REFUSED. Six cells leave 168.3 units each,
         narrower than the 205 WL.L-05 already rejects, and STATUS plus Init:CrashLoopBackOff
         inks 165.6 at 1100x800, which valChip turns into 189.6 with its 24 of padding. Two
         across by three rows was refused for a different reason: six pills stacked two wide read
         as six pills, and a card whose claim is read ONE column has to look like a row.
PANEL    The deepest reading is step 5 at 1100x800, 254.66, and the Node frame starts at 316, so
         61.34 units stand clear. That head room is bought deliberately: the frame starts at 190
         and the panel reaches 397, so it is still inside the panel column and has no L-03 escape
         even at 820 wide, and the panel travels 77.22 units across the viewport set on step 5
         alone. A frame at 296 would have left 41, which one longer sentence eats. Narrowing the
         frame buys no head room at all: only a frame starting right of 420 would, and that is not
         a frame WL.A-03 can centre on the spine. The extent per viewport is printed on demand by
         `OVERLAY_IDS=workloads-pod-pending-init-states node --test report/overlay.test.mjs`.
LANES    ONE corridor is drawn, the Kubelet's, down and up. The Scheduler carries no path to the
         Pod: it holds the Pod while it is Pending and sends it nothing, and a line drawn to a Pod
         that no Node has been chosen for asserts the relationship step 1 exists to deny. A-10
         does not bind here, because only one actor ever reaches the slot.
         DROP_Y is the MIDPOINT of the 120..316 band, 218, and not the `WL.TOP_BOTTOM + 20` of 140
         that seven cards in this category share: it centres the jog between the actor row and
         the frame. The corridor measures 490 units at any DROP_Y, because the vertical legs sum
         to 196 whatever the jog height, so the jog moves without touching routeDur. What DOES
         move it is the Kubelet box: at 778..1010 its midpoint is 894, and the jog is 294.
         The corridor is a PAIR and BOTH halves are drawn on every step, which is where this card
         leaves the exemplar workloads-probes: that one draws the corridor twice and swaps which
         half is visible, through a corridor() field pair. Here the two arrowheads stand the whole
         time and the STEP picks which one the ball takes, so the reader sees that the traffic can
         run either way before any of it does.
         The halves are mirrored by WL.LANE_DY about the two face midpoints they touch: 588 and
         612 on the frame top face at 316, 882 and 906 on the Kubelet bottom face at 120. A
         mirrored pair is L-12, and OFFEDGE scores an endpoint only when it is ALONE on its face,
         so straddling the midpoint is the sanctioned shape rather than a tolerated one. Each
         segment is offset perpendicular to itself, so both paths measure 490 and the ball takes
         the same routeDur whichever way it runs.
         Neither reaches the Pod inside the frame, which is WL.A-03 and is what holds this card
         off the queue report/frame-face.test.mjs prints.
         The top row is a RELATION and not the WL.A-01 pair: the Scheduler and the Kubelet never
         talk to each other on this card, and nothing rides it, so it carries no arrowhead (A-05).
MOTION   Step 1 has no packet and no Pod, so its beat is a static highlight alone (M-27): the
         Scheduler lights because it is the answer to the step, not because anything arrives.
         Steps 2, 4 and 5 are down-arrows on the Kubelet lane, step 3 is the one up-arrow, the
         Pod reporting a failure, and it blinks first at BEAT.afterPulse (M-15).
         Step 5 pulses WITHOUT dim, because pulsePodDim fills opacity forward to OPACITY.pending
         and that step ends at full.
         The Kubelet lane is 490 units, so the spans measure 1989 / 2449 / 1989 / 1989 on steps 2
         to 5 against durations 2800 / 3300 / 2800 / 3200. The durations do not track the spans
         down: the spare is reading time, and how long a step stands still has no machine at all
         (M-19a). The two shortest holds are 811ms, 29 percent of the step, and the slowest step
         reads at 10.44ms per character while the other four run faster. Both sit at the brisk end
         deliberately, and where they rank is printed by `deadair.mjs` and `timing.mjs`, which are
         the one home of the catalog figures they rank against.
         The Node band is OPACITY.notready on the idle step and on step 1 and full from step 2,
         because NODE reads <none> until a Node is bound and a fully lit Node-1 under a <none>
         cell is the card contradicting itself. C-14 is what makes it dim rather than absent.
CONTENT  Every STATUS value on this card is taken from the status table on the debug-init-
         containers page: Init:N/M is M init containers with N completed, Init:Error is one that
         failed to execute, Init:CrashLoopBackOff is one that failed repeatedly, Pending is a Pod
         that has not begun executing init containers, and PodInitializing is one that has
         finished them. That table gives the last row as `PodInitializing` or `Running`, which is
         why step 5 reaches Running without leaving the page the card cites.
         Init:Error is NAMED in step 3 and drawn nowhere, and it earns the mention by being the
         value the drawn one follows. The same page prints an init container Waiting under reason
         CrashLoopBackOff over a Last State of Terminated reason Error, so the two are ONE
         container at two moments, and the narration says so. `Init:Error means an init container
         has failed to execute, and Init:CrashLoopBackOff means it has failed repeatedly` is
         rejected for standing them side by side as two unrelated rows, which sends a reader
         hunting the canvas for a value that is not on it.
         Three values are OUT because no upstream page owns them: InvalidImageName,
         ErrImageNeverPull and CreateContainerConfigError. The images page does not name the first
         two and nothing names the third, and a card built on recalled strings is exactly what
         T-26 refuses.
         The row is FIVE of the kubectl get pods -o wide columns and not all of them. printPod
         appends podIP, nodeName, nominatedNodeName and readinessGates under `if options.Wide`, so
         IP sits between the drawn AGE and the drawn NODE. What the card draws is a SUBSEQUENCE of
         the real order and never a contiguous run, and the aria-label reads `five columns` for
         that reason rather than naming the whole row.
         Three cells are NOT STATUS values but those columns, and they are the claims card-facts
         weighs first.
         NODE reads <none> until a Node is bound. printPod writes that literal only inside the
         Wide branch, so the cell is itself the evidence that the row is -o wide.
         AGE is `translateTimestampSince(pod.CreationTimestamp)`, the age of the POD. Reading it
         as time spent on one init container is a category error, and `four minutes on the same
         init container is a stall` is rejected on that ground. What the card says instead is that
         an Init: value still on the row at four minutes is a stall, which is a claim the Pod age
         can carry on its own.
         AGE never zero-pads. duration.HumanDuration formats under 120 seconds as `%ds` and 2 to
         10 minutes as `%dm%ds`, so `15s`, `50s`, `4m10s`, `4m40s` and `5m10s` are all printable
         and `5m02s` is a string kubectl cannot produce.
         RESTARTS reads `3 (20s ago)` on the backoff step and 0 from PodInitializing on, because
         printPod resets it to the restartable init containers plus the app containers the moment
         initialization finishes: pkg/printers/internalversion/printers.go, where the reset sits
         under `if !initializing || isPodInitializedConditionTrue`, and printers_test.go `test11`
         expects `4 (20s ago)` for an init container that restarted twice under an app container
         that restarted four times. That reset is stated in the step 4 caption and not in the
         narration, because the panel is a character budget here (L-08): the clause measured 25 of
         the 61.34 units of head room the PANEL block buys.
         RESTARTABLE init containers keep their count THROUGH that reset, which is why the step 4
         caption reads `regular init containers done` and not `init containers done`. The
         unqualified form is rejected as true only of the two regular init containers this card
         draws, and `regular init containers` is upstream wording: the init-containers page writes
         `Regular init containers (in other words: excluding sidecar containers)`.
         The `(Xs ago)` suffix is DRAWN rather than simplified away. printPod appends it whenever
         restarts is non-zero AND a last termination time exists, so the five cells reading 0 are
         literally exact and only a non-zero cell can carry it. `test10` is the direct analogue of
         the backoff step and expects `5 (10s ago)` beside Init:1/2. Drawing it also supplies the
         one datum step 3 used to take from AGE, which is how long the loop has been live.
         Step 5 answers `who is holding it` with `the app, readiness is next`. `nobody` is
         rejected: the Pod is Running and not serving, so something holds it, and the frame read
         without the panel would say the Pod is unblocked.
         Two narration absolutes are rejected on their counter-cases. `READY cannot move until
         every app container is ready` is false because READY is readyContainers over
         totalContainers and rises one container at a time. `No value in the STATUS column reports
         it` is false because printPod prints NotReady when a Completed container sits beside a
         running one that is not ready. What the card says instead is that Running here is the Pod
         phase, which is what `reason := string(podPhase)` makes it when nothing overrides it.
         `nothing on any Node is wrong` is rejected as well. A Pod that no Node fits is usually
         unschedulable BECAUSE of Node-side facts, capacity and taints among them. What is true is
         that no Kubelet has seen the Pod, so no Kubelet log holds anything about it, and that is
         the actionable half the sentence was reaching for.
         Step 4 keeps `the app image or its mounts` and not a superlative. `On a healthy Pod it is
         the shortest lived value in this column` is rejected as unsourceable. What replaces it is
         the mechanism: kubelet_pods.go sets the app containers default waiting reason to
         PodInitializing whenever the Pod HAS init containers, and to ContainerCreating when it
         does not, so the value stands until the runtime reports on a container.
NAMING   The sixth cell is `who is holding it` and it is the thesis: the other five are literal
         kubectl columns, and this one is what the row is FOR. It is the only cell whose name is
         lower-case prose, which is what tells a reader it is not a column.
SCOPE    ImagePullBackOff is workloads-image-pull-registry-auth and is deliberately not a rung here, even
         though it belongs to the same column: that card owns the pull and its backoff.
         The restart backoff itself is workloads-crashloopbackoff. Step 3 names it in one clause
         and plays no doubling.
         The readiness half is workloads-pod-startup-conditions, and the last step hands off to it
         by name rather than teaching it: READY at 0/1 against a finished STATUS is that card.
         Pod phase is workloads-pod-lifecycle-phases. This card reads the kubectl STATUS column,
         which is not status.phase, and the two differ on exactly the Init: values.
         A restartable init container keeps its restarts in the RESTARTS column, so the step 4
         caption is true of the two regular init containers this card draws and no wider. Sidecars
         are workloads-init-containers-and-sidecars.
OPEN     THE MIDDLE BAND IS SPARSER THAN THE TWO CARDS IT IS READ AGAINST AND THAT IS THE
         PRICE OF THE TABLE.
         The FRAME half of this is closed: at 820 around a 460 Pod the frame is 44 percent empty
         against the 57 it carried at full width, and the band no longer holds a second actor leg.
         What stays open is the BAND, 120 to 316, which carries one corridor and its jog at 218
         and nothing else. Two cards of this section fill that region,
         workloads-pod-startup-conditions with a five-row ladder and
         workloads-init-containers-and-sidecars with a Pod holding four peer container boxes.
         It stays open on three measurements. Moving the frame UP to fill the void spends the
         head room PANEL states, and 41 units is what the panel eats on one longer sentence: the
         RESTARTS clause that went to a caption instead measures 25 of them. Narrowing the frame
         further does not reach it either, because the void is vertical and the frame top is
         pinned by the panel. Widening the Pod toward the frame walls is the L-16 move: it closes
         nothing a reader feels and makes a Pod that holds one container box look emptier still.
         What is NOT in question is whether the picture reads: covered-panel against both of
         them at 1100x800, the three silhouettes are ladder-right, table-across-the-floor
         and rising-staircase, and the card is identifiable without a word of narration.
```

### poster

```
THE EMPTY DESTINATION. A wide dashed frame at 28..292, 12..108 holding a Pod-shaped slot that is
EMPTY, and the real Pod standing outside it below at 120..200, 128..168, solid at stroke 2. The
sentence is step 1 of the card: NODE reads <none>, there is a place for this Pod and it is not in
it. The 20 units of clear air between the frame floor and the block top ARE the sentence, which is
why there is no leg and no arrow between them.
The slot inside the frame is the same 80x40 footprint as the live block and carries the same two
bars, so the void is Pod-SHAPED rather than merely empty: a reader sees what is missing and not
just that something is. Both the slot and its bars sit in a `g opacity 0.45`, which dims them
while the literal fill stays 0.3, so the canvas keeps exactly two currentColor tiers and R-07
reads one accent.
Accent: the live Pod's top bar, the only 0.9 on the canvas.
Not a miniature: the card draws an actor pair, a corridor pair and a six-cell kubectl row, and
none of those is here. The poster draws one place and one object.
THE COMPOSITION IS `ghost zone to solid zone` TURNED AROUND. The library ghosts the LOSING side
and solidifies the winner; here the ghost is the DESTINATION and the solid is the thing that has
not reached it. reference/patterns.md does not carry that use, and extending the library is the
user's call.
The scale contrast is the point and it is what the category lacks: every other workloads poster
is same-size peers, and this is one large void against one small dense object. The other dashed
users in the category put a dashed frame BESIDE a solid one as a peer, workloads-force-deletion,
workloads-statefulset-ordered-rollout and workloads-container-restarts-and-laststate. None of
them makes the dashed shape the container.
TWO CONCEPTS WERE DRAWN AND REJECTED BEFORE THIS ONE, and both failed the same way: they were a
STACK OF BARS, which is the default vocabulary of the whole category.
`One slot, many readings`, five ragged lines with an aperture band on the middle one, failed on
its own stated guard. Its note argued that accenting the longest line would make width read as
rank, then accented Init:CrashLoopBackOff, which IS the longest line by 42 units, so at true size
it read as a bar chart with the biggest bar picked out. It also rhymed with the grid neighbour on
its right, workloads-pod-startup-conditions, five slots in a row with one lit.
`Two columns of five`, STATUS ragged against READY identical inside a frame, said a true thing
about the card, that one column keeps answering while the other never moves. It was rejected as a
third stack of bars rather than on a measurement.
Rejected earlier, each because a sibling already says it at 200px: a hub with one live spoke,
because workloads-probes draws three dashed legs converging on one framed container with the
accent on the live one. A row of holders with one lit, because workloads-pod-qos-classes is three
84x80 blocks on one baseline. A horizontal chain of the STATUS values, because
workloads-pod-startup-conditions is that and is the neighbour on the right. A small table of the
row, on R-10. Flatline into a wait, because the card refuses duration as its subject: AGE is the
age of the POD. Two frames holding one object, because its frames were congruent at 126x116
(R-10) and one was 25.4 percent of the canvas holding nothing (R-06).
THIS POSTER IS ALSO MOSTLY EMPTY AND THAT IS NOT THE R-06 DEFECT. There the emptiness was the
residue of a congruent twin nobody had filled. Here the sizes are deliberately unequal, the void
is the subject, and the union box covers 71 percent of the canvas against the 22 percent floor
poster-lint measures.
A grip, the Pod between two heavy brackets, was offered alongside this one and not taken: it says
HELD but not WHERE, and a bracket is a shape with no technical meaning in this catalog.
```
