## workloads-container-states

### layout

```
WHAT     A restart does not erase a death: the Terminated record of the instance that died rolls
         from state into lastState, the dead instance stays on the Node for one generation, and both
         survive exactly one more restart.
LAYOUT   Own geometry, no A / B / C preset: there is no ladder and no flanking chip column, so the
         two columns the presets choose between do not exist. Three tiers.
           actor row   kubectl 484..716 on TOP_Y, the family actor width, the one actor that is
                       outside the Node
           board       three record slots 248 wide on y 250..330, spread 106..1094 so the slot
                       centres stay 230, 600 and 970: state, lastState, and a standing sign that
                       nothing older is stored, at OPACITY.notready
           Node band   on the floor 484..624 and on 90..1110, NOT the full WL.L..WL.R: the frame
                       is a row under a row and states that span itself, since the slots above it
                       are narrower than it is. The Pod at 110..590 holds the live instance and
                       the previous one, the Kubelet at 850..1090 sits inside the frame, both
                       inset FRAME_PAD 20 from its edges
         The composition is a shift register drawn twice: the slots are ROLES, and so are the two
         container boxes, whose sublabels change per step while the boxes stay put. The live
         instance is centred on 235 under the state slot (230), so the record above it is the record
         about it. The previous instance, centred on 465, sits under nothing: centring it on 600
         under lastState needs a 670 wide Pod, and that mapping is given up for the Pod at the size
         its siblings draw (`workloads-ephemeral-containers`, 500 x 96). Under the third slot there
         is no container at all, because what that slot describes is a container that is gone. No
         relation line ties a slot to its box: a line into an inner box crosses the Pod shell, which
         L-10 counts as a block.
         The frame is appended FIRST, before the lanes: its fill dims whatever it covers, and with
         the lanes under it the ground pair and the WRITE_LANE leg inside the frame read darker than
         the corridor and the rolls, which nothing in the suite can see.
         The previous instance is dead and kept, so it reads at notready: its OWN shade is 0.4 while
         the Pod is at 1 and rises to 1 while the Pod is at notready, because the product 0.4 x 0.4
         is 0.16 and the sublabel vanishes on crash and message. Both dead boxes then sit at one
         shade, which is what they are.
         The Kubelet sits inside the frame as the agent of that Node, the shape
         workloads-crashloopbackoff carries, and NOT in the actor row where six siblings of this
         section put it: the reads are what come from outside, the writes come from the Node.
PANEL    x<=397 catalog-wide (`L-02`). Bottom per viewport: `OVERLAY_IDS=workloads-container-states
         node --test report/overlay.test.mjs`. Deepest on `message` at 1100x800, shallowest at
         1600x1000, and BAND_Y 250 is the source of that deepest reading rounded up plus 20, so the
         whole card carries 20 units of clearance above the board. The caption on y 238 is anchored
         to the RIGHT end of the board (inks 841..1110) because at 1100x800 its baseline sits under
         the panel bottom and the panel reaches x 397: a left-anchored caption would run under the
         panel edge.
SIZES    Slot 248 and not the 232 the actor row takes: the widest sublabel, `Terminated · exitCode
         137 · OOMKilled`, inks 223.1 wide, so 232 would leave 4.5 a side and 248 leaves 12.5.
         Container box 210 x 52: `app #2 · exited 137 · kept` inks 156.8, leaving 26 a side. Pod
         480 x 96 (three 20 pads around two boxes), Kubelet 240 x 80 with `writes
         containerStatuses[]` inside it.
         The chip is the slot width, centred under the middle slot, so the strip centre is 600. The
         frame label `Node-1` inks to y 505.4 from x 102, and the Pod starts at x 110: the Pod top
         is at 512 (NODE_Y + 28) rather than centred in the frame, or the label crosses its edge.
         The Kubelet sits at the Pod's vertical centre (520..600) for the same reason.
LANES    Six arrays, five feeding a drawn lane and its ball, one a relation (WL.S-01).
           CORRIDOR    kubectl bottom (600,120) to the middle slot top (600,250): the reads
           WRITE_LANE  Kubelet top (970,520) up to y 434, left to x 230, down onto the state slot
                       bottom (230,330): the status write. 930 units, 2067ms per ball at
                       PKT_SPEED, ridden twice (crash, restart). The horizontal sits midway
                       between the chip bottom 384 and the frame top 484, 50 clear of each
           ROLL_1      slot to slot on y 290, 90 units: the record ageing one slot along
           roll2       the same 90 on y 290, a RELATION (no head, no ball): nothing is delivered
                       to a sign that says nothing is kept. The sign lights when ROLL_1 lands
           LANE_OUT    Kubelet left face (850) to Pod right face (590) on y 548: restart, and
                       the log read. 260 units, on the 700ms floor, a length three cluster
                       cards also run
           LANE_EXIT   the mirror on y 572: the exit report
         The ground pair is pinned at 1 on every step and is the card's deliberate exception to
         min(source, sink) (`A-13`): at the Pod's `notready` on `crash` and `message` the pair would
         fall to 0.4, and the exit report would ride a faded lane under a faded head while the
         Kubelet at its far end stands at 1. The pair and the ball on it read at full strength on
         every step instead. WRITE_LANE leaves the frame interior upward. report/frame-face.test.mjs
         prints it apart as "into the interior" rather than queuing it: the rule is about the actor
         row reaching THROUGH a Node, and this lane is the Node reporting outward. The card is out
         of the WL.A-03 queue: nothing from the actor row enters the frame.
MOTION   crash: pulse, fade to notready, exit report at BEAT.afterPulse, then the write chained
         after it and the state slot lit on landing. restart: the order after BEAT.lead (M-18), Pod
         fade in and pulse on its arrival, both container sublabels turned over on the same beat,
         the write after that, the chip and the state slot turned over on its arrival, then the roll
         leaves after the write, and lastState turns over and the sign lights when it lands. Spans
         4227 and 5027 against durations 4500 and 5300. Two mute steps (message, exitcodes) sit
         between moving ones, so the card never stands still twice running, and it closes on motion:
         logs is a corridor ball then a ground ball. The corridor ball lights lastState on landing,
         the same cue `read` gives that lane (P-04), and the Kubelet lights on the same beat (the
         API to Kubelet leg is not drawn), not when its own ball reaches the Pod: it is the sender
         of that one. The ground ball is a down-arrow into the Pod, so the Pod pulses and the dead
         instance lights on its arrival (M-16).
WIRE LABELS
         The ground gap is 260 (590..850), centred on 720: `restart` 46, `read log` 50, `exit
         137` 52 all sit clear of both faces.
         The corridor label hangs off the right of the spine at (614, 189), as on
         workloads-ephemeral-containers, and the write label sits centred 10 above its horizontal.
CONTENT  The termination message is a MEMBER of the Terminated record, not a peer of state /
         lastState / restartCount, which is why `message` lights the state slot and adds no slot of
         its own. Read against the Container schema of Pod v1 and against Determine the Reason for
         Pod Failure, both cited: `terminationMessagePath` defaults to `/dev/termination-log`,
         `terminationMessagePolicy` defaults to `File`, and `FallbackToLogsOnError` uses the last
         chunk of container log output only when the message file is EMPTY AND the container exited
         with an ERROR. Both conditions are spelled out (T-20).
         The byte limits (4096 per container, 12KiB across the Pod, 2048 bytes or 80 lines for the
         log fallback) are deliberately NOT drawn: the card is about which field holds the cause of
         death.
         The previous instance stays on the Node because container garbage collection keeps one dead
         container per container by default (`MaxPerPodContainer` 1, on the cited Garbage Collection
         page), which is what `kubectl logs --previous` reads. The narration says `by default`
         because the number is a kubelet setting. The Logging Architecture concept states the same
         default in one sentence: "By default, if a container restarts, the kubelet keeps one
         terminated container with its logs."
         The Terminated record leaves the live slot when Kubelet TURNS TO the restart, not when the
         new container runs: `until the container is started again` is rejected because on a backoff
         wait the describe output on Debug Running Pods shows `State: Waiting / Reason:
         CrashLoopBackOff` beside `Last State: Terminated / Exit Code: 1` at the same moment. The
         drawn path restarts at once (the instance ran four minutes, so no backoff window is open),
         and the Waiting state itself is workloads-crashloopbackoff, so the clause names the moment
         and not the state.
         Kubelet `spots` the dead container rather than the runtime `reports` it: the Kubelet polls
         the runtime (cluster-oom-kill: "PLEG spots the dead container on its next relist of the
         container runtime", workloads-crashloopbackoff: "Kubelet observes the termination"), and
         `reports` credits the runtime with a push it does not make.
         Codes above 128 `usually` carry a signal: Kubernetes assigns no meaning to an exit code
         (`ContainerStateTerminated.exitCode` is "Exit status from the last termination"), 128 plus
         the signal number is the shell and OCI convention, and a process can exit 200 on its own.
         The bare absolute is rejected under T-19. The reason strings are read off the docs: exit
         137 with OOMKilled on Assign Memory Resources, exit 1 with Error on Debug Running Pods, and
         `describe` printing both `State` and `Last State` on the same page.
BUDGET   A narration past about 316 characters at 1100x800 drops a line onto the board caption. The
         longest today are `read` and `exitcodes` at 314.
NAMING   The slot labels are `.state` and `.lastState`, a leading dot because they are paths under
         the caption `Pod.status.containerStatuses[app]`, and because a bare `state` is an English
         word System A would capitalise (T-09) while the field is lowercase. The two container boxes
         are named by ROLE (`Live instance`, `Previous instance`) and carry the generation in the
         sublabel (`app #2`), so the shift reads as contents moving through fixed slots on both
         rows.
SCOPE    When a crashing container is restarted, and how the wait grows, is
         workloads-crashloopbackoff. Whether it is restarted at all is workloads-pod-restart-policy.
         How container garbage collection is tuned is cluster-image-container-gc: this card names
         the one default it depends on and nothing else about it. The termination message has no
         card of its own: it is one clause of an existing record, with no second actor, no traffic
         and no state machine to draw.
NOT A DEFECT
         The `Older terminations` slot rests at OPACITY.notready on every step and is lit when
         the roll lands on lastState (F.light at that arrival, since no ball reaches it). It is a
         sign, not an absent object: cutting it out would leave the third column empty above an
         empty column, and the two empties would read as one accident rather than as the sentence.
```
