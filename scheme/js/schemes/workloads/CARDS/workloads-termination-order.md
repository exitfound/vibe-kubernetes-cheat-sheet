## workloads-termination-order

### layout

```
WHAT     Shutting a Pod down runs its declaration backwards, and there is a gate in the middle of
         it: every container in spec.containers is signalled first and in no order anyone can rely
         on, and only once the last of them has terminated do the sidecars follow, in the reverse of
         the order they are declared in.
LAYOUT   No A / B / C preset. PANEL_B 230, and it is a live floor rather than a documented number:
         BAND_Y is `Math.max(PANEL_B + PANEL_GAP, NODE_Y - CHIP_TO_NODE - CHIPS_H)`, so the band
         hangs off the frame while the panel stays the ceiling it may not cross (L-03). The frame
         wins today at 284 against 250, and a narration deep enough to push the panel past 264 takes
         the band back.
           chips   a 2 x 2 GRID on the FRAME margins, 98..554 and 646..1102, 2 x 34 + 8 = 76, so
                   284..360. `declared order` and `stop order` are STACKED in the left column
                   because one is the other read backwards, and the right column carries the gate
                   and the budget the whole sequence is spent from
           node    FR_W 1004 centred on CX, so 98..1102, NODE_H 244 on the canvas floor 624, so
                   380..624
           pod     196..1004 x 396..608, centred on CX, holding TWO ZONES of containers split by
                   the gate: initContainers 216..984 across three boxes, containers 216..724
                   across two, both rows starting on the same zone edge
         The two zones ARE the composition. They sit in declaration order, initContainers above
         containers, so the path a reader takes through the Pod (down the left margin, left to right
         along each row) is the path the shutdown takes in reverse: up from the bottom zone, then
         right to left along the top one. The gate is what makes the turn legible rather than merely
         true, and it is the one element on the canvas that is neither an actor nor an object: a
         dashed rule with the sentence it enforces printed above it.
         Both rows start at Z_X and the shorter one leaves air on the right. The alternative,
         centring the row of two on CX, put its `spec.containers` caption 130 units left of the box
         it names and broke the one left margin the Pod is read down.
         The actor row is reversed against
         workloads-init-containers-and-sidecars: the Runtime sits on CX and the Kubelet to its
         right, because the Kubelet asks and the RUNTIME is what sends the signal, so the spine
         leaves the box that acts (A-09). WHICH slot each box takes is that ruling. WHERE the second
         slot sits is a construction the catalog has already settled three times.
         cluster-node-drain, cluster-pod-priority-preemption and cluster-graceful-node-shutdown each
         stand a right-hand top box on the right-hand edges under it rather than on `first box +
         56`, and the last of them writes the reason in one line: a fixed 56 `puts it at 772..1004,
         136 short of the content edge and flush with nothing, while 908..1140 lands it on the chip
         column, the ladder and the Node frame at once`. What lands under it here is not the wall
         but FR_R, because the frame and the right chip column both end on 1102, so the construction
         gives `FR_R - TOP_W` = 870..1102. The peer cards in this section write it as `WL.R - TOP_W`
         only because their frames are full width and their wall and their frame edge are one line.
         The inset bought ONE margin down each side instead of three competing ones: FR_L 98 carries
         the frame and the left chip column, FR_R 1102 carries the frame, the right chip column and
         the second actor. That is the whole of what it bought.
         There is no P.chain, and that is the section MAJORITY rather than a deviation: 2 of the 10
         other pods-lifecycle cards carry one, workloads-init-containers-and-sidecars and
         workloads-pod-pending-init-states. The reason it is absent here is still the card's own.
         Four chips and a five box Pod fill the canvas, and a ladder would restate the six
         narrations. The columns are not read off WL at all, neither straight nor through LAYOUT.A /
         .B / .C. The preset picks which column holds the ladder and which the chips, and this card
         has no ladder: the chip grid takes both columns, so there is nothing for WL.L-06 to choose
         between. It is the seventh card in this category to read no preset, and the reason is the
         same one the other six give. What it takes INSTEAD of WL.COL_L / WL.COL_R is the frame: the
         band and the frame share one pair of margins, so the chips read as the caption of the Node
         they sit on. That costs the WL centre gutter, 120 down to 92, and 92 is a floor rather than
         a taste: the widest LEFT pair is `declared order` 96.5 against `mesh-proxy, log-agent,
         otel-agent, web, redis` 310.1, and 24 of chip padding leaves 25.4 of reading gutter in the
         456 that a 92 centre buys. A 120 centre gives 442 and 11.4, which is the two strings
         touching, measured. The spine keeps 46 of clear air a side.
PANEL    x<=397 catalog-wide (`L-02`). Bottom per viewport: `OVERLAY_IDS=workloads-termination-order
         node --test report/overlay.test.mjs`. Deepest on step 0 at 1100x800, which previews the
         step 1 narration, and the swing across the set is 69.82 units. The panel is a CEILING here
         rather than the anchor. BAND_Y hangs off NODE_Y instead, 20 above the frame at 284, because
         the air that has to be constant is the one BELOW the chips: anchored on the panel the band
         sits at 250 and leaves 54 units of nothing between the last chip and the frame it captions.
         The left column at x=98 is legal only because it sits under the panel bottom (`L-03`), and
         the clearance is 54.18 at the worst viewport. A narration longer than the 307 characters of
         step 6 spends the 20 unit gap first (`L-08`).
SIZES    Chips 456 wide, which is a FLOOR and not a size. The binding pair is `declared order` at
         96.5 against `mesh-proxy, log-agent, otel-agent, web, redis` at 310.1, measured at
         1600x1000: 24 of chip padding leaves 25.4 of reading gutter. `stop order` against `web and
         redis, otel-agent, log-agent, mesh-proxy` at 330.8 is the next tightest at 32.3. 480 is
         rejected because the chips would then overhang the frame they caption by 38 a side, and
         442, which is what the WL 120 centre gutter buys inside FR_W, is rejected on a measurement:
         it leaves 11.4 and the two strings touch. The centre gutter takes the difference, 120 down
         to 92. This card measures WIDEST at the widest viewport rather than the narrowest, which is
         the reverse of the usual reading.
         Container boxes 248 x 40, one width for all five. The row of three fills the zone (216..984
         on a 12 gap) and the row of two takes the first two of the same three slots. A wider box on
         the row of two would read as rank where the only difference is how many the array holds.
         The widest container sublabel is `initContainers[N] · sidecar` at 162.8 inside 248, and the
         zone caption `spec.initContainers · restartPolicy: Always` measures 296.3 from x=216, so it
         ends at 512.3 with the whole right half of its row clear.
         The gate caption measures 454.8 and centres on CX at 372.6..827.4, inside a rail that runs
         the zone width 216..984, so the rule shows on both flanks of the sentence it carries.
         POD_H 212 is derived rather than chosen: it is the last y offset inside the Pod plus the
         foot, and NODE_H is that plus 16 of frame air a side. One box width for all five and both
         rows on the same left edge. The row of three fills the zone and the row of two takes the
         first two of the same three slots, so the missing slot is air on the right and says which
         array is shorter. Centring the row of two on CX is REJECTED: it puts the `spec.containers`
         caption at x=216 and the box it names at x=346, 130 units apart, and it breaks the single
         left margin that makes the Pod read as the two fields of a spec rather than as two
         unrelated rows. The frame is DERIVED from the Pod rather than chosen for the band: the Pod
         holds two zones and a gate, POD_H falls out of the last offset inside it, and 32 is the
         frame air a side. Writing the frame height first and fitting the Pod into it is how a card
         ends up with a zone that cannot hold its own caption. At 244 it is the tallest node() frame
         in this category against a 134 to 158 spread, and the band is affordable because the chip
         grid is 76 tall over both columns rather than 118 over three rows. The frame label prints
         at x + 12, y + 18, so it inks from 72 at y 386.8..401.4 and the Pod starts at x 196: the
         label has the whole left flank of the frame to itself.
LANES    Three, and the top two are a WL.A-01 pair. REQ carries StopContainer from the Kubelet to
         the Runtime, RESP carries the exit report back, and 3 of the 6 narrated steps ride the
         answer. SPINE runs from the Runtime bottom face midpoint to the Node FRAME face midpoint at
         380 (WL.A-03), never to the Pod top at 396, and it is drawn downward only.
         No lane reaches a container: the ball lands on the frame and the container it is addressed
         to lights on that arrival, which is what every peer-container card here does.
MOTION   Eight balls over four steps. The top hop is 154 units and the widening is a pacing GAIN,
         which is what the three cluster cards that made the same move call it: the hop runs 0.220
         u/ms against the 0.080 a 56 unit hop runs at, and the DURATION does not move, because both
         readings are floor-bound on the 700ms PKT_DUR_MIN (M-13). Every span is byte-identical to
         before the move, measured. The spine is 260 units, also under the floor, at 0.371 u/ms. The
         wire label rides with it, centred at WIRE_X 793 rather than 744. Steps 4, 5 and 6 are three
         chained hops, report then call then signal, and the first of the three leaves on BEAT.lead
         because the RUNTIME is the block that acts first and is lit at entry rather than sending
         out of the dark (M-18a). Spans against durations: 900/3000, 2400/3100, 700/3000, 4000/4800,
         4000/4800, 4000/4800. EVERY spine arrival blinks the Pod, on all four steps that ride the
         corridor. The spine is a down-arrow, so the shape is M-16 exactly: the ball lands and the
         Pod blinks on `pkt.arrivalMs`, never before it. Step 1 blinks with no ball because the Pod
         itself is what changed. Only step 3 has no blink, and only because no ball reaches the
         frame on it: it is the still frame the gate is drawn for. The blink is the arrival cue the
         container highlight cannot be, because a container lights on the same beat and the reader
         has to see WHERE the signal landed before reading WHICH box it was for. The three sweep
         steps are one beat played three times, so they hold ONE shape: 4000 of motion and 800 of
         stillness, 17%, which is what step 6 already held. 4000/4000 is rejected: it satisfies M-19
         and ranks both steps 1 of 629 on deadair, the least still steps in the whole catalog, with
         the pulse ending on the step boundary and the frame never settling (M-19a). The price is
         paid in pace, 17.84 and 17.91 ms/char against a 10.09 median, and that is the structure of
         the step rather than the duration: three chained hops and a blink over a 269 character
         narration. The combination deadair calls a finding is a high STILLNESS rank with a slow
         pace, and the stillness rank here is 168 of 629. Step 2 sends ONE ball for TWO
         StopContainer calls, and it lights both boxes on the same arrival. Two balls staggered down
         the corridor would draw an order between web and redis, which is the one thing the
         narration says a reader must not rely on. A container drops in TWO stages, which is what
         the gate needs: web and redis fall to OPACITY.terminating on step 3, where they are
         draining and the sidecars are still at full weight, and to OPACITY.terminated on step 4,
         where the report of their exit is what opens the gate. Every sidecar takes the single drop
         to terminated on the step after the one that signals it. All the fades run over FADE.out,
         at delay 0 except the last, and every shade is pinned in the static block as well so the
         reduced path lands on the same picture (S-13, S-15). Step 1 holds 3000 for 302 characters,
         which is 9.93 ms/char against a catalog median of 10.10. At 2700 it reads 8.94 and sits in
         the hurried third of the catalog.
         `gate-holds` is the step the composition exists for, and the only still frame that carries
         the whole argument with the panel covered: the row below at the draining shade, the row
         above at full weight, and the gate between them holding. It is the one step with no ball and
         no Pod acting, and its two fades are what keep it off the dead-air ranking rather than a
         flash.
         One factory for the shell, the five containers and the gate together,
         in the shape A-16 asks for. The gate is in the list because it is SPENT as well: once the
         row below is empty it stops holding anything, so it retires on the step that opens it
         rather than standing at full weight over a sequence it no longer governs. The last step
         fades the SHELL and not the group. The containers are already at 0.12 and a group fade
         multiplies, which would take the whole Pod to 0.014 and cut it out of the picture entirely
         (C-14). Fading the shell and mesh-proxy separately lands the whole block on one shade.
CONTENT  Every claim is read off a page this card cites.
           Regular containers are terminated FIRST, and the Kubelet delays the TERM signal to
             sidecar containers until the last of them has fully terminated: Pod shutdown and
             sidecar containers.
           Those regular containers are signalled at different times and in an arbitrary order,
             so nothing may be inferred from which of the two goes first: the same section.
           Sidecars are terminated in the REVERSE order they are defined in the Pod spec: the
             same section, and the Sidecar Containers concept page in the same words.
           A sidecar is an init container with restartPolicy Always: both pages. The card names
             the slot in each container sublabel and in the zone caption, and teaches the
             declaration nowhere.
           The default terminationGracePeriodSeconds is 30 and one budget covers the Pod: the
             Pod Termination Flow section of the same page.
           If the grace period expires while containers are still terminating, the Pod may enter
             forced termination and all remaining containers are stopped simultaneously with a
             short grace period: Pod shutdown and sidecar containers.
         No feature-stage or version number appears in any narration: the sidecar GA version is a
         fact about the declaration, which belongs to the sibling that owns it, and a number spoken
         here would be drawn nowhere.
BUDGET   The longest narration is 307 characters and the deepest panel is 229.82. The chip grid
         starts at 250, so 20 units of clearance is the whole budget a longer narration has.
SCOPE    workloads-graceful-shutdown owns the grace budget itself, the endpoint deregistration and
         the SIGKILL at zero, and its record says this card owns the plural of containers because it
         draws only one. This card SPENDS that budget and never runs it: the grace chip states the
         field and its default on every step and never ticks, and no step here narrates SIGKILL.
         workloads-poststart-prestop-hooks owns the preStop slot and how the Kubelet executes a
         handler. preStop is one clause of one narration here and carries no chip, no box and no
         drawn state.
         workloads-init-containers-and-sidecars owns the START order and the sidecar declaration.
         This card owns the reverse, and it points at the declaration through the zone caption and
         the container sublabels rather than explaining it.
         cluster-graceful-node-shutdown owns shutdown ordering by priority when the NODE goes down.
         That is a different sequencer over different objects and nothing of it is drawn.
NOTE     `declared order` and `stop order` are written from one step literal each, and the second
         list is the first read backwards with the two regular containers collapsed into one term.
         Those two chips are the only place on the canvas where the sequence exists AS a sequence,
         and stacking them in one column is what lets a reader check the claim without moving their
         eyes across the canvas. buildPod carries exactly ONE inner box and this Pod holds five
         containers, two zone captions and the gate between them. They are appended INSIDE the Pod
         group rather than beside it, because pulsePod reaches only what the Pod contains and the
         step that marks the Pod terminating blinks the whole assembly with it. box() defaults its
         role to the empty string, so the kit binding is not inherited here and `role: 'workloads'`
         is written out in the one `container` factory. It equals the binding and is not a
         cross-category override. The gate is the one instrument this card draws and it carries no
         quantity: a dashed rule with the sentence it enforces above it, no fill, no tick, no
         number. That is deliberate against the Instrument panel family, which draws budgets and
         countdowns: the gate is a RULE, and drawing it as a measure would put a second reading of
         terminationGracePeriodSeconds on a canvas whose grace chip already states the field and
         never ticks. The ink is the slot shade `workloads-poststart-prestop-hooks` uses for a drawn
         outline that is not a block, and P.raw carries no role by construction, so probePaint never
         walks it.
WHY NOT  The dependency graph is not drawn. The reverse order exists to keep each container alive
         for the ones that needed it, which is a line per relationship: web and redis out through
         mesh-proxy, both into the file log-agent tails, both emitting what otel-agent ships. Every
         route for them crosses the Pod shell, the gate or a container box between the two ends
         (L-10), so the dependencies are carried by the narration instead. The Pod carries no
         sublabel. pod() prints one at h - 8, which lands on the bottom edge of the containers row,
         and both neighbours in this section pass an empty string for the same reason.
DO NOT   Give the five container boxes different roles, or the two zones different box widths. They
         are peers of one Pod, and a size or a colour difference reads as rank where the only
         difference is which array declares them. Move the two orders into different columns. They
         are stacked so a reader can hold both lists on one line of sight, which is the whole claim
         of the card.
NOT A DEFECT
         NODE_H 244 against the 134 / 140 the rest of this category draws. There is no
         catalog-wide frame family (L-23) and the number is the Pod it holds: 212 of Pod plus 16 of
         frame air a side. The alternative is one row of five containers, which is 148 wide a box
         and loses both the zone split and the sublabels. Every ball on this card is FLOOR-BOUND.
         Both lengths, 56 on the top row and 260 on the corridor, finish under PKT_DUR_MIN, so
         routeDur clamps them to 700ms and the balls run slower than PKT_SPEED. Four other cards run
         the 260 and three run the 56. The last step cues `stopChip` on the signal arrival and NOT
         the container it is addressed to, against every other step here. mesh-proxy is retired ON
         that arrival because there is no next step to retire it on, and a highlight taken straight
         back off by the fade leaves the reduced path standing lit on a block the played path has
         already ghosted. The box going to the terminated shade is its cue, which is the argument
         `report/arrival` carries for this card elsewhere. The `declared order` chip never changes
         value over the seven steps. It is the reference the `stop order` chip below it is read
         against, and a spec order that moved would be a different Pod.
```
