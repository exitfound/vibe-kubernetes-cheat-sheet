## workloads-poststart-prestop-hooks

### layout

```
WHAT     A container has two slots where Kubernetes runs code of yours, one bolted to its start and
         one to its stop, and the two are not mirror images: postStart opens on the same tick as the
         ENTRYPOINT, which never waits for it, preStop is waited for and spends the window the stop
         itself has to finish in.
LAYOUT   An INSTRUMENT, and no `LAYOUT` preset: A / B / C choose which column holds a ladder and
         which a chip stack, and this card draws neither.
           actor row 40..120, a 232 pair: Runtime centred on WL.CX, Kubelet on WL.R
           Pod       280..380, 460 wide, centred on WL.CX
           frame     404..554, 60..1140, the wall around the rail, label at 72 on 422
           rail      436..535.7 of ink inside it, raw, 150..1050
           chips     588..622, one full-width row of three at 350.67
         Every row above is a geometric constant except the rail's own ink, whose bottom is TEXT:
         the tick words end at 535.7 at 1100x800, where the glyphs are tallest in viewBox units, and
         the frame wall stands 18.3 below that.
         Three body bands, 40, 280 and 404, which `kin.mjs` reads as `shallow` and no sibling in
         pods-lifecycle carries. The signature is `box2 pod1 node1 chip3 cyl0 chain0 raw13`.
         THE FRAME IS NOT A NODE, and no Pod stands in it. It is the enclosure this catalog already
         uses for a region that is not a Node (`Control plane`, `Storage backend`, `zone
         us-east-1a`), and it exists because the rail without it was two rows of bars, an axis and
         four ticks on open canvas: nothing said where the instrument began, where it ended or what
         it was. The `node()` label prints at (x+12, y+18) and that IS the caption, which is the
         whole trade against a free tag at (150, 474): one string in the top-left corner of a wall
         and the instrument names itself.
         WL.A-03 does not reach the frame: the corridor stops on the Pod at 280, 124 above the wall,
         so no lane crosses this frame face at all and `report/frame-face.test.mjs` counts the card
         in none of its three shapes. The catalog frame total moves 100 to 101.
         NO chain. Six rows restating six narrations is what the rail replaces, and the band the
         ladder held is what the rail is drawn in.
PANEL    x<=397 catalog-wide (`L-02`). Bottom per viewport:
         `OVERLAY_IDS=workloads-poststart-prestop-hooks node --test report/overlay.test.mjs`.
         Deepest at 1100x800 on the poster frame, shallowest at 1600x1000, and the swing across the
         set is 77.22 units.
         That pins the Pod: at y=280 it stands 25.34 clear of the deepest narration the card can
         draw, and only on the 26.55 units of its left edge that stand in the panel column at all,
         the other 433 being right of the panel on every viewport. Everything left of x=420 is the
         frame and what it holds, which starts at 404, so the `L-03` wall is met by a band and not
         by a clearance.
         The frame label inks 72..369.6 and the band label 775.1..974.9, both on 410.8..425.4, so
         the frame header carries two strings 405 apart. Those are the 1600x1000 readings, the WIDER
         ones: a drawn string is a fixed pixel size, so it spends more viewBox units on the larger
         dialog, the lane labels measuring 69.1..138 against 76.7..138 at 1100x800.
SIZES    Actor box 232, the family width, in the arrangement of the WL exemplar
         workloads-pod-startup-conditions: the box the corridor leaves is centred on WL.CX (WL.L-07)
         and the other is right aligned on WL.R, where the chip strip below also ends. The centred
         box is the RUNTIME here and not the Kubelet, which is the one place the pair differs from
         workloads-init-containers-and-sidecars beside it, and it follows from the corridor rather
         than from taste: the lane into the container leaves the runtime. A 150 wide pair is
         symmetric about CX and a 232 pair cannot be: symmetric it would start at x=292, left of the
         `WL.L-02` wall at 420 and under a panel that reaches 396.55. The asymmetry that follows
         would be a CENTRE finding on its own, the block bbox reading 370..1140 on centre 755. The
         frame closes it: CENTRE counts `node()` frames (`L-17`) and a full-width wall puts the bbox
         back on 60..1140, centre 600, so `test/fixtures/carried.mjs` holds no ruling for it.
         Frame 1080 x 150. The height is the sum of what it holds and nothing else: 40 to the first
         bar (the node() label prints its own baseline at +18 and inks to +21.4), 46 of two 18 unit
         lanes and their 10 gap, 10 to the axis, then 35.7 of tick word, then 18.3 of wall.
         CENTRE-LOW is unmoved because it EXCLUDES frames and the Pod is then the only block below
         the panel, one short of the two a composition needs.
         Both hook slots are SLOT_W 170. Chips 350.67, and the widest string either half of a chip
         draws is 124 at 1600x1000, the value `Running (draining)` that `stop` settles on, against
         103.4 for the name `container state` beside it, so the widest pair spends 227.4 of the
         350.67. The same pair measures 110.4 and 92 at 1100x800, and quoting one viewport against
         the other is how a chip reads roomier than it is.
LANES    One corridor, `SPINE`, one straight segment from the Runtime bottom face midpoint on
         WL.SPINE_X down to the Pod top face midpoint on the same x. It leaves the RUNTIME and not
         Kubelet, because Kubelet is a CRI client and never touches a container, which is half the
         subject, and that is what decides which of the two holds WL.CX. 160 units after the Pod
         rose to 280, under the 315 where routeDur floors, so every ball on it still runs the 700ms
         hop and no span in MOTION moved.
         The actor lane pair is 192 units, floored at the same 700ms, so widening the pair from 60
         to 192 is not a timing change.
         TWO wire labels, not one. `req` sits above the actor row on the WL.A-02 constant and names
         only the top-row traffic. `via` sits at x=614 beside the corridor, on the MIDDLE of it
         rather than near an end: y is derived from WL.TOP_BOTTOM and POD_Y and reads 204, where the
         ink runs 193..207.7 and centres on the segment midpoint 200. At 250 it stands 30 off the
         Pod against 130 off the Runtime and reads as a caption on the Pod instead of a name for the
         lane. It names only what rides the corridor, which is never the
         same string: T-22 lets a label name the traffic on its own lane and no other. Both are
         blank on the steps where nothing rides them.
         The two are in two REGISTERS, which is what stops either being rewritten into the other.
         `req` names the CRI call Kubelet makes to the Runtime. `via` names what that arrival DOES
         once it reaches the container, because the corridor carries the runtime acting inside the
         Pod rather than a protocol: `ENTRYPOINT starts, postStart runs beside it` on `start`,
         `preStop handler runs in the container` on `delete`, and on `stop` the two registers
         coincide, since a signal is both the traffic and its effect.
         T-22 is an EXCLUSIVITY rule, the shape of T-21 beside it: a label may name no traffic but
         its own lane's. It prescribes no register, and an effect-form `via` meets it. A CRI-form
         `via` is REJECTED twice over: on `start` it would restate `CRI StartContainer · ExecSync
         postStart`, the label already on the actor row, and it would cost `beside it`, the only
         words on the card that deny an order between the ENTRYPOINT and postStart. A protocol pair
         read left to right supplies one. The same holds on `delete` against its own `req`. That
         `req` reads `CRI ExecSync · preStop` and carries no third token: `· Sync` after it is
         rejected because a reader takes it as part of the call name, and `ExecSync` already says
         the call is synchronous, which the narration then states as the wait.
MOTION   Ask, deliver, draw, in that order, on the two steps where Kubelet reaches the container.
         The answer steps invert it: the handler finishes INSIDE the container, so the Pod blinks at
         0 and the result leaves on BEAT.afterPulse, which is M-15 rather than a chosen delay. THE
         SENDER IS LIT AT ENTRY, one box per step, and it is whichever of the two ACTS FIRST:
         Kubelet on `start` and `delete`, the Runtime on `settled` and `stop`. A ball leaving a dark
         box has no sender, and the receiver's own cue then lands on the only lit thing on the row.
         R3 exempts a source that sends no later than it receives, which both of them do: the
         Runtime sends its return at 800 on `stop` against a receive at 1600, and on `settled` it
         receives nothing at all.
         The self-initiated ask waits BEAT.lead (M-18), so the lit Kubelet stands as the sender for
         800ms before its own ball leaves. The answer steps need no lead: the Pod blink at 0 is
         already the beat the reader watches, and the Runtime has been lit through it.
         Measured span against duration: slots 500/3600, start 3200/4000, settled 2060/3000, delete
         3200/4200, stop 4000/4500. `start` and `delete` carry BEAT.lead in those spans and their
         durations rose with it: at 3600 and 3800 the hold left was 400 and 600, which is not a
         payoff frame.
         `slots` stands still for 86 percent of itself and reads 9.60 ms per character. Where that
         pace sits against the catalog is read from `timing.mjs`, never copied here. That stillness
         is what a declaration beat costs: the two slots are declared TOGETHER, so staggering their
         reveal to buy motion would draw an order between them that the spec does not have.
         `stop` carries three hops (the return, the stop request, the signal) and is the longest
         step by construction. 4500 leaves 500ms after the SIGTERM lands, where 4200 left 156 and
         made the payoff frame the one nobody gets to look at. Every rail segment is drawn by the
         arrival that earns it, and every chip that changes is written back to its starting value in
         `rewind` and turned over in an `F.set` on the same arrival. Nothing on this card states its
         answer before the ball that delivers it lands. Writing all five chips to their new value and
         lighting them at step ENTRY puts the answer on screen 700ms ahead of the packet, thirteen
         times over. `railAt(n)` is the other half of the same
         discipline: every step pins EVERY rail element rather than the ones it moves, so a seek, a
         step back or a reduced replay can never leave a segment of the timeline behind. The ack
         never goes first on a step that asks. There it reports the handler complete before the
         handler has been exec-ed, and the answer arrives before the thing it answers.
CONTENT  Every claim below is read against `k8sVersion` 1.35, against Container Lifecycle Hooks and
         Pod Lifecycle, both cited, and against the v1.35 API reference for the field shapes.
         postStart fires CONCURRENTLY with the ENTRYPOINT with no ordering guarantee, so nothing on
         the rail draws an order between `postStartBar` and `entryBar`: one reveal opens both, and
         no arrow, number or stagger stands between them. The hooks page is the source: `It runs
         concurrently with the container ENTRYPOINT (main process), meaning the hook may run before,
         during, or after the main process starts`.
         The container reports Running only after the handler returns, which is why `stateChip`
         holds `Waiting` through `start` and turns over on the ack in `settled`. The two sentences
         are not in tension because one is about the PROCESS and the other about the reported
         STATUS: Pod Lifecycle states the second flatly under the Running container state, `If there
         was a postStart hook configured, it has already executed and finished`, and the hooks page
         carries the mechanism, `it can delay container status updates`. The `T-19` absolute in
         `Only now does the container report Running` therefore stands, and its counter-case, a
         container that declares no postStart, is one this card does not draw. A hook FAILURE kills
         the container (`If either a PostStart or PreStop hook fails, it kills the Container`), a
         hook TIMEOUT does not: `A non-zero exit or a timeout makes Kubelet kill the container` is
         rejected because no hook timeout exists to kill on. The exec handler is run with a zero
         timeout and an open `TODO(tallclair): Pass a proper timeout value` in
         `pkg/kubelet/lifecycle/handlers.go`, and the docs give a hanging postStart the opposite
         outcome, holding the container out of Running rather than killing it, which is what the
         same step already says one clause earlier.
         `stateChip` reads `Running (draining)` from the SIGTERM arrival to the end of `stop`.
         `Terminated` is rejected there: Pod Lifecycle gives that state an exit code and a finish
         time (`began execution and then either ran to completion or failed`), and `drainBar` on the
         same frame is PID 1 still executing, so the chip would contradict the bar beside it. The
         three handler kinds are the API set: LifecycleHandler v1 says `One and only one of the
         fields, except TCPSocket must be specified`. `tcpSocket` is deliberately absent from
         `slots` because the same page marks it `Deprecated. TCPSocket is NOT supported as a
         LifecycleHandler`. `sleep` carries no maturity word because `PodLifecycleSleepAction` is
         Stable from 1.34.
         httpGet says `against the Pod IP by default`, never bare: `host` on HTTPGetAction reads
         `Host name to connect to, defaults to the pod IP`, so the Pod IP is a default a field
         overrides and not the mechanism.
         `terminationGracePeriodSeconds: 30` is the POD sublabel and never a container sublabel: the
         field is on PodSpec (`Optional duration in seconds the pod needs to terminate gracefully
         ... Defaults to 30 seconds`) and no container carries it.
         SIGTERM is the DEFAULT stop signal, so `stop` writes `unless the image defines a different
         STOPSIGNAL`, which is the wording `workloads-graceful-shutdown` already uses for the same
         fact. The `lifecycle.stopSignal` route stays off the card: `ContainerStopSignals` is Alpha
         and off by default at 1.35, and `T-23` would make the card mark it.
         The SIGKILL is conditional, and `stop` says so in the one clause it hands over.
         One spelling of one thing: `exit 0` is lowercase in the wire, the tag and the chip alike.
         The Kubelet sublabel is `hook runner`. `hook handler` is rejected because the card already
         uses that word for the thing Kubelet RUNS: `slots` says `Each handler is one of exec ...
         httpGet ... or sleep`, and the API type is `LifecycleHandler`. The kubelet type that runs
         them is `handlerRunner` in `pkg/kubelet/lifecycle/handlers.go`, so a box named handler
         contradicts the step that defines the word.
         `settled` says Kubelet READS the exit code. `records` is rejected because nothing is
         stored: on success the ExecSync exit code goes nowhere, and on failure the
         `FailedPostStartHook` event carries the fixed text `PostStartHook failed`, the message
         being withheld `so that secrets won't leak from the server` in `startContainer`.
         `delete` waits `until it returns or the window runs out`, and the `T-19` absolute `waits
         for it to return` is rejected: a preStop still running at grace expiry is abandoned, not
         waited for. The hooks page: `If a PreStop hook hangs during execution, the Pod's phase will
         be Terminating and remain there until the Pod is killed after its
         terminationGracePeriodSeconds expires`, and `executePreStopHook` selects on
         `time.After(gracePeriod)` before `StopContainer` is called with the
         `minimumGracePeriodInSeconds = 2` floor. The desc and the aria-label keep the flat form
         because it is the doc's own: `the hook must complete its execution before the TERM signal
         can be sent`.
         The same step says `the signal comes after this handler, where the ENTRYPOINT never waited
         for postStart`. `so this handler is synchronous where postStart was not` is rejected
         because postStart blocks Kubelet just as preStop does: the API reference on `postStart`
         says `Other management of the container blocks until the hook completes`, and the card
         itself holds `stateChip` at `Waiting` until the handler returns. What runs beside postStart
         is the ENTRYPOINT, so that is the actor the contrast names. The sentence is sized to the
         panel: at 394 characters the `delete` panel reached 279.51 at 1100x800, 0.49 off the Pod at
         280, and at 349 the poster frame is the deepest again at 254.66.
         Deliberately not drawn, and not contradicted by any sentence: preStop is skipped when
         `terminationGracePeriodSeconds` is 0 (`gracePeriod > 0` guards the call, and Pod Lifecycle
         says `and the terminationGracePeriodSeconds in the Pod spec is not set to 0`) and `is not
         called if the container crashes or exits`. A stop always keeps at least the 2 second floor,
         which the page states as `a small, one-off grace period extension of 2 seconds`.
         postStart has no deadline in either handler kind: the exec path passes `0` to
         `RunInContainer`, and the http client Kubelet hands `NewHandlerRunner` carries no timeout.
         The feature-gates table reads `ContainerStopSignals false Alpha 1.33`, so
         `lifecycle.stopSignal` stays off the card, and `PodLifecycleSleepAction true Stable 1.34`
         is why `sleep` carries no maturity word. Both cited pages still carry every sentence the
         card leans on, and `workloads-graceful-shutdown` agrees on every shared claim: the
         synchronous preStop before any signal, `SIGTERM unless the image defines a different
         STOPSIGNAL`, and the window counting from the delete.
NAMING   The frame label reads `container lifetime   ·   order, not duration`, in the separator the
         catalog's other frame labels use. Without it a reader measures the bars, and the only
         quantity this card states is the 30s window. It is a LABEL and no longer a tag because the
         frame gives it a corner to sit in: the string is unchanged in substance and it is now
         attached to the thing it describes rather than floating above it.
         The tick words hang at AXIS_Y + 32 and not the + 26 the rail carried on open canvas: at 26
         they ink from 515 and the grace band's own bottom edge at 516 ruled through their
         ascenders, which is the one text-over-ink collision the wall introduced.
         BOTH HALVES OF THE RAIL ARE NAMED, on one header row, and only one of them is BOXED. The
         stop half carries `termination grace window: 30s` over the band, the start half carries `no
         window: postStart has no deadline` over open rail, start anchored at 420 and inking
         420..668.1 at 1600x1000: 50.4 clear of the frame label and 31.9 short of the seam at
         T_DELETE, so nothing meets at the junction of the two halves.
         A second RECT there is REFUSED. The box is the card's word for a bounded budget, and the
         one thing the start side has to say is that no budget bounds it, which is also what the
         poster spends its whole composition on. Two rects of unequal width would additionally
         invite the reading DO NOT forbids: a reader compares 550 against 350 and takes a duration
         off a card whose own title says order and not duration. Naming the half without boxing it
         is what makes the asymmetry read as the claim rather than as an omission.
         The band label names that WINDOW and never the field: `termination grace window: 30s`.
         `terminationGracePeriodSeconds` takes an integer of seconds, the Pod sublabel already
         writes `terminationGracePeriodSeconds: 30`, and a second reading of the same field as `30s`
         puts a value the API would reject beside the one it accepts, on one screen from `delete`
         onward. The phrase is the narration's own: `delete` opens on `A delete opens the
         termination grace window`.
SCOPE    workloads-graceful-shutdown owns the grace window. This card draws the window because the
         containment IS the claim that preStop and the drain spend one budget, and it states only
         what it draws: the delete, the hook run to completion, the signal at the hook end, the
         drain. The countdown, the EndpointSlice, and the SIGKILL at zero go over in one clause.
DO NOT   Do not attach a number to a bar length, and do not make the two hook slots different
         widths. A 30s label on the band plus a preStop bar at some fraction of it draws an
         eight-second handler this card never claims, which is the failure the Instrument family is
         named for: a value written in a chip AND drawn as a bar, disagreeing at some step. It is
         also why the card carries no `grace remaining` chip. A dashed outline is this card's word
         for a slot that has NOT run. `drainBar` is therefore a filled bar at a lower weight and
         never dashed: dashed says the app is waiting to start draining rather than draining under a
         signal it already has.
```
