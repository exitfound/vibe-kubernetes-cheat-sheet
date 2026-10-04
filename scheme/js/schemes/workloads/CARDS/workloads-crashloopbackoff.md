## workloads-crashloopbackoff

### layout

```
WHAT     The delay Kubelet inserts before each restart, drawn as a bar that doubles until it
         flattens against the 300s ceiling, and the healthy run that puts the next crash back at
         10s.
LAYOUT   Instrument panel over a Node floor, not the ladder-and-chip-column default of this section,
         because the subject is a QUANTITY (a wait that doubles) and a ladder of stages says a
         sequence rather than a size. The frame is sized off the instrument and centred on WL.CX,
         98..1102 rather than the full WL width (WL.L-02): nine bars on one 58 pitch are 506 wide,
         and a full-width frame would either open a gap before the ghost bar or widen the chip
         column past its strings. Chips take the left band 98..540 below the panel, the instrument
         the right band 580..1102 with its baseline on the chip column's bottom edge (y 400), so the
         chip column stands on the frame's left wall and the axis on its right, and the Node frame
         is the floor (440..600). Kubelet sits INSIDE the frame at 138..378, 40 in from the wall,
         rather than in an actor row: the backoff and its cap are per-node kubelet state, and the
         picture says so. No vertical corridor exists, so WL.L-07 and WL.A-03 have nothing to bind.
PANEL    x<=397 catalog-wide (`L-02`). Bottom per viewport: `OVERLAY_IDS=workloads-crashloopbackoff
         node --test report/overlay.test.mjs`. Deepest on `backoff-named` at 1100x800, shallowest at
         1600x1000. 225 is the floor the chip column (240) and the ceiling line (160, right of x
         580) are laid against.
SIZES    Bars 42 wide on a 58 pitch, nine of them from 596, the ninth on the same pitch as the rest
         so it ends on 1102 with the axis, the ceiling and the frame edge, all four on one vertical.
         The Pod is 640..1062, 40 in from the wall, and gives up width before the bars do: the
         instrument is the subject and the Pod is where it lands. Heights are 0.8 units per second:
         10s is 8, 300s is 240, and the ratio is the lesson, so the scale is not to be raised to
         make the small bars comfortable. The 0s bar is a 3.5 mark at the graduation weight, or the
         immediate first restart is invisible. Bar labels sit 8 above the bar top, and the two
         capped bars carry theirs above the ceiling line.
LANES    A horizontal pair between the Kubelet right face (378) and the Pod left face (640), on 508
         and 532 around the shared centre 520: the restart order rides right on the upper lane, the
         exit report rides left on the lower one. LANE_RESTART and LANE_EXIT feed both the drawn
         arrow and the segment ball. The restart lane carries a ball on `first-crash` alone, and its
         emptiness on `backoff-named`, `doubling` and `cap` IS the content: those are the steps
         where Kubelet is HOLDING THE RESTART OFF, which each narration says in words, and the
         restart it is holding is exactly what would travel right. The exit report goes left and is
         animated on `first-crash`, `backoff-named` and `reset`. A restart ball on any of the three
         would assert the restart happened on the step whose subject is that it has not. The other
         lane in the catalog whose emptiness is the lesson is `W_RET_WIPE` on
         storage-reclaim-policy.
MOTION   `first-crash` is the one step where both lanes carry a ball: pulse, exit report, restart
         order, then a second pulse and the 0s mark on its arrival. The three hold steps grow their
         bars from AHEAD (OPACITY.terminating) to 1 through revealAt, 400 apart, and the reset step
         raises the ghost only to OPACITY.pending because that crash has not happened. Every bar is
         pinned in `opacity` on every step, all nine.
         Every chip turns over on the arrival that earns it, through a `rewind` and one F.set: the
         three on `first-crash` on the restart, the four on `backoff-named` on the exit report, and
         the backoff on `reset` on the healthy report. On `backoff-named` the Pod dims on that same
         exit arrival rather than with the crash blink, so it never goes dark under a state still
         reading Running.
WIRE LABELS
         `out` above the restart lane at 496 and `in` below the exit lane at 550, both centred on
         509, the gap midpoint. `next`, the T-35 counterfactual of the reset step, sits UNDER the
         axis at (1102, 418) anchor end, because every place above the ghost bar is inside the two
         capped bars.
CONTENT  The FIRST restart is immediate and only the ones after it wait, which the `first-crash`
         narration says ("Kubelet restarts it immediately the first time"), so the `aria-label` says
         it too rather than promising a delay before EACH restart.
         restartCount reads 8 on `reset`, not 7. `cap` leaves it at 7 with the container Waiting,
         and `reset` narrates a NEW container running stably, so the counter has to have moved with
         it, and the step lights it for the same reason the other three chips it changes are lit.
         restartCount reads 2 on `backoff-named`, not 1, and the narration counts both restarts out
         loud. The step holds a 20s wait (`delayChip` `20s · doubled`, bars 0s / 10s / 20s raised),
         and a 20s wait only exists once the 10s one has run out and restarted the container: the
         doc ladder is "Initial crash: Kubernetes attempts an immediate restart" and then
         "exponential backoff delay (10s, 20s, 40s, …)" (pod-lifecycle, `#container-restarts` and
         `#restart-policy`), and `restartCount` "holds the number of times the container has been
         restarted" (core/v1 types). So two restarts are done and the third is held. `1` is
         rejected because it contradicts the 20s on the same frame: it is only true while the 10s
         wait is held, which this card never draws as a frame of its own. `This restart is the one
         that waits, and each further crash doubles the delay` is rejected because it never says the
         10s restart HAPPENED, so a reader counting restarts in the panel reaches 1 against a chip
         reading 2. The narration says `This second restart is the one that waits 10s, and the next
         crash doubles the delay to 20s` and `holds off the third restart`, at 284 characters, the
         length it replaced.
         The 300s ceiling is a per-node DEFAULT, not a constant, and `cap` says so in five words ("a
         per-node default since 1.35"). KubeletCrashLoopBackOffMax is beta and enabled by default at
         this card's declared 1.35: "With the feature gate KubeletCrashLoopBackOffMax enabled, you
         can reconfigure the maximum delay between container start retries from the default of 300s
         (5 minutes). This configuration is set per node using kubelet configuration." "clamped at
         the 300s ceiling and stays there" is REJECTED: it states a version-scoped default as a
         property of Kubernetes.
         https://kubernetes.io/docs/concepts/workloads/pods/pod-lifecycle/ The `desc` says "a 5
         minute ceiling" flat, and it stands as written. It is not FALSE: 300s is the default and
         the only value a default cluster ever uses, and the desc sits at 464 of a hard 400..470
         band with four sentences already carrying more load than a version-scoped qualifier is
         worth. "up to a 5 minute per-node default ceiling" measures 481 and does not fit. The
         nuance belongs on the one step whose whole subject is the ceiling, and `cap` carries it, as
         does the standing caption of the ceiling line on the instrument, "300s cap · per-node
         default", which is on screen from the poster frame on.
         The 10s base, the doubling, the 300s value, the 10 minute reset and the immediate first
         restart in the `aria-label` are the raw doc verbatim. Do not "correct" any of them.
         https://kubernetes.io/docs/concepts/workloads/pods/pod-lifecycle/ A reset makes the next
         crash a FIRST crash again, so `reset` says "a new crash counts as a first one, restarted at
         once, and the ladder starts over from 10s" and the T-35 caption reads "if it crashes again:
         starts over at 10s". "The next crash would start over from the 10s base" is rejected: it
         reads as the next crash WAITING 10s, where the doc has "Backoff reset: If a container runs
         successfully for a certain duration (e.g., 10 minutes), Kubernetes resets the backoff
         delay, treating any new crash as the first one", and the first one is "Initial crash:
         Kubernetes attempts an immediate restart". The ghost bar is therefore the first WAIT of the
         new ladder, not the next restart. The `desc` carries the same reading and states the
         CONSEQUENCE of the reset rather than a delay value: "a clean 10 minutes resets the backoff,
         so a new crash counts as a first one, restarted at once". "only a clean run of 10 minutes
         resets the delay to the 10s base" is rejected for the same reason plus one this card owns:
         the `delayChip` on `reset` reads "0s · reset to base", so a desc naming 10s as the delay
         after a reset contradicts the chip the reader sees on that step. The clause takes the desc
         to 464 of 400..470, which spends the whole remaining headroom, and it drops the "only" that
         T-19 flags. The narration holds at 284 characters because 315 pushes the panel to 229.82 at
         1100x800 against the 240 chip column, and 284 keeps the 204.97 worst case of
         `backoff-named`.
         https://kubernetes.io/docs/concepts/workloads/pods/pod-lifecycle/#container-restarts Read
         against the declared 1.35: KubeletCrashLoopBackOffMax is beta and on by default from 1.35
         (feature-gate reference, `stage: beta, defaultValue: true, fromVersion: "1.35"`), and
         ReduceDefaultCrashLoopBackOffDecay is alpha and off (`stage: alpha, defaultValue: false`),
         so 10s and 300s are the defaults every bar and chip on this card states. The cited
         `#restart-policy` anchor resolves to "Container restarts" and carries the 10s, 300s and 10
         minute sentences. `restartCount` "holds the number of times the container has been
         restarted" (core/v1 types), which is why it reads one less than the bars raised on a hold
         step and equals them on `reset`.
SCOPE    workloads-pod-restart-policy owns the policy and its three values, and names this card for
         the rung by rung walk. workloads-container-states owns Waiting and Terminated as states.
         workloads-image-pull-registry-auth owns the image pull backoff, which shares the numbers
         and none of the mechanism.
NOTE     The lane pair and the packet layer sit ABOVE the Node frame in `parts`: the pair runs
         inside the frame, and under its translucent fill both the lanes and the ball grey out. Bars
         that have not happened DIM at OPACITY.terminating rather than vanishing (C-14): the
         staircase then reads as a scale from the poster frame on, and a step raises the bars it
         names. The ghost bar is stroke only and dashed, so it is a different species from the eight
         that happened even at the same opacity. The last raised bar is always the value in the
         `current backoff` chip: a bar is the wait Kubelet is holding on that step, so
         `restartCount` reads one less than the bars raised on every hold step.
OPEN     CENTRE reports the chip strip at 98..540, centre 319. The strip the metric pools is the
         four value chips alone: the bars are naked rects, so nothing right of 540 is a
         `.scheme-chip`. The picture centres (frame 98..1102 on WL.CX by construction, instrument
         580..1102 against the column), and a chip strip straddling 600 under a panel reaching
         396.55 is the collision shape WL.L-05 refuses. Carried in test/fixtures/carried.mjs.
```
