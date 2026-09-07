## workloads-probes

### layout

```
WHAT     Three probes ask three independent questions of one container on three independent
         periodSeconds, startupProbe holds the other two shut until it passes, and the two failures
         do different things: liveness restarts the container, readiness only flips the endpoint.
LAYOUT   THREE PARALLEL PROBE LANES, and no A / B / C preset. This card was the section default
         (ladder left, five chips right, one corridor) and the default argued AGAINST its own
         sentence: three probes on three periods drawn as one corridor and three rows of text says
         `Kubelet talks to a container`, which is true of a dozen cards here. kin.mjs printed the
         cost exactly, `levers no sibling has: (none)`, on a signature one box away from
         workloads-poststart-prestop-hooks and workloads-graceful-shutdown. The lever taken instead
         is THREE OR MORE RELATIONSHIP LINES, which this section had never used and the catalog uses
         on 10 cards.
           actors  Kubelet 460..740 at 40..120, centred on CX so the middle lane leaves a face
                   midpoint (WL.L-07). EndpointSlice 850..1060, right-aligned on the NODE FRAME
           chips   LEFT, 140..450 at 276..436, four rows of CHIP_H on an 8 gap
           lanes   528 / 600 / 672, from the Kubelet bottom face to the Node frame top face
           node    920 wide at 140..1060, y 476..616, Pod 370..830 at 498..594, app 450..750
         THREE BANDS SHARE TWO EDGES, and that is the whole horizontal argument. The frame is 920
         and not the WL.L-02 full width, centred on WL.CX so its top face midpoint is still the
         spine (WL.A-03). The chip column starts on the same 140 rather than on the WL.L margin, and
         the EndpointSlice ends on the same 1060 rather than on WL.R: the bands line up on the frame
         instead of one starting outside it, and the content box is 140..1060, centre 600 exactly,
         margins 80 and 80.
         820 WAS MEASURED FIRST AND REFUSED BY THE AUTHOR as too narrow: around a Pod of 460 it left
         180 of frame either side, where 920 leaves 230. The right-hand alignment is not cosmetic
         either. At 908..1140 around the narrowed frame, `report/geometry-soft.test.mjs` read
         `content spans 190..1140, centre 665` against a 600 +-40 window, which is a CENTRE finding
         the full-width frame did not have: narrowing the frame without moving the actor row with it
         buys a defect.
         THE CHIP COLUMN IS 310 AND THE ENDPOINTSLICE 210, and both are floors set by text rather
         than by taste. `extents.mjs` at 1100x800 reads `readinessProbe` at 96.5 against `passing
         1/1` at 75.8, leaving 113.7 of gap in 310, and `10.244.1.5 ready=true` at 126.6 in 210,
         leaving 41.7 either side. Neither WIDTH moves when the frame does: widening the frame
         slides both bands outward and resizes nothing, so these two measurements survive it.
         THE LANES ARE 72 APART AND SYMMETRIC ABOUT WL.SPINE_X, which is not decoration: L-11 wants
         a lane endpoint on a face midpoint unless L-12 pairs it, and 528 / 600 / 672 is the
         mirrored trio, one ON the midpoint and two straddling it. Any other spacing is legal, any
         other CENTRE is not.
         THE ENDPOINTSLICE IS A BLOCK AND NOT A CHIP, and that is the whole argument for the second
         actor. As a fifth row of the chip column it sits beside three probe states as if it were a
         fourth probe. A readiness failure moves a different OBJECT, and a picture that cannot show
         that has to spend a sentence saying it.
         The band right of the chips at 450..1060 between 276 and 476 is deliberately CLEAR. Nothing
         can stand at 528..672 there, because the three lanes cross it and L-10 forbids a segment
         crossing a block it does not terminate on, and a block pushed right of 700 to dodge them
         would be an object with no lane reaching it. The emptiness is what the three lanes need to
         read as three.
PANEL    x<=397 catalog-wide (`L-02`). Bottom per viewport:
         `OVERLAY_IDS=workloads-probes node --test report/overlay.test.mjs`. Deepest at 1100x800,
         shallowest at 1600x1000. `PANEL_B` is 255, that deepest reading rounded up, and BAND_Y
         stands 21.34 clear of it. THERE IS NO HEAD ROOM, and one step is why: `startup-gating`
         reads one line deeper than the other five, and the poster frame reads with it because
         `posterFirst` shows that step text. It carries the sentence `A startupProbe that exhausts
         failureThreshold kills the container per restartPolicy`, which is one line of panel bought
         to close a false absolute (T-19): without it the step ended on `nothing restarts the
         container`, and a startupProbe that runs out of attempts does exactly that. The clause is
         worth its line. A step growing past about 320 characters is paid for inside that step and
         never by moving the band.
LANES    TEN paths, and the rule that arranges them is ONE PER STEP PER DIRECTION. FOUR are
         RELATIONS, drawn only where something is TRUE and nothing MOVES. SIX are LANES, drawn only
         where a ball rides them this step. `lanes(...keys)` states the whole set per step in one
         place.
         A RELATION IS NEVER DRAWN BESIDE AN ARROWHEAD. A first version kept every probe on the
         canvas on every step, twelve paths, so a step whose ball rode one lane also carried an
         arrowless copy of another probe beside it, and the pair reads as two things happening where
         one is. Every step that moves something now shows the moving path and nothing else.
         THE SPINE CARRIES EVERY SINGLE-BALL STEP, down at WL.SPINE_X on 1 and 6 and up on 3, 4 and
         5. Which probe is acting is said by the lit chip and by the wire label, not by a second x.
         The three-x fan is left to ONE step, gate-opens, which is the only step where three probes
         act at once and therefore the only one that needs three positions.
         THE THREE HELD RELATIONS STAND ON THE POSTER FRAME AND NOWHERE ELSE. That frame is the
         card's opening statement, three probes and two of them shut, and every step after it is
         about one probe at a time. epRel is the fourth: on liveness-fails the endpoint goes
         ready=false with the container and no ball runs to the slice, so the relationship is drawn
         rather than left blank. Four relations keeps the `relations` lever kin.mjs reports, which
         no sibling in this section carries.
         The down lanes end on the Node FRAME face at the spine and not on the Pod inside it, which
         reads as an arrow into the Pod because the Pod is centred under that point, and keeps the
         card off the WL.A-03 queue.
         Every one ends on the Node FRAME face at 476 and never on the Pod inside it, which is
         `WL.A-03`, so the card is off the queue `report/frame-face.test.mjs` prints. That is also
         why this record carries no do-not-copy clause: an exemplar that has to tell every copy to
         do one thing differently is a broken exemplar.
         THE GATE IS DRAWN, not narrated: HELD is a dashed relation, RELEASED is a solid one, and
         the difference between the two is the whole mechanism. Each is a relation and not a lane
         because nothing rides it on the step it shows, and an arrowhead on a path nothing travels
         is A-05. STARTUP DISAPPEARS ON STEPS 3 TO 5 and no other card here deletes a path. It is
         retired for the lifetime of the container instance, so a line standing there would assert a
         probe that cannot run. It comes back on step 6 with the fresh container, and the two others
         go dashed again with it, which is the loop closing in the geometry.
         THE EIGHTH LANE IS THE TOP ROW, from the Kubelet right face midpoint to the EndpointSlice
         left face midpoint, and it is where the two answers part. Both climb to Kubelet and only
         the readiness one travels on.
         A first version ran that lane from the frame top face straight up to the EndpointSlice
         bottom face and was REJECTED at the rendered frame: its x is the readiness lane's x, so
         every step showing both drew a down arrow and an up arrow on one segment and the pair read
         as a T. `L-11` refuses the other route too, at 1024 alone on a 1080 face, 424.0 off the
         midpoint.
MOTION   Seven steps over two beat shapes. The up-arrow steps put the Pod first and the report
         leaves at BEAT.afterPulse (M-15). The down-arrow steps send the probe first and pulse `at:
         'probe'`.
         `dim` follows the Pod opacity at the moment the pulse fires and never the step subject:
         startup-gating and gate-opens take it because the Pod is still OPACITY.pending, the other
         four take the plain pulse.
         GATE-OPENS IS THE ONE STEP THIS COMPOSITION EXISTS FOR and it is three routes: the startup
         answer climbs, and on its arrival the two released probes descend TOGETHER on their own
         lanes. The release is MOTION rather than a chip going from `not running` to `running`,
         which is what the three-lane composition buys. Duration is 3600 for it, the longest on the
         card, and it carries TWO Pod pulses, at d0 for the report leaving and at d2482 for the two
         released probes landing. Both are required: without the second the step ends with two balls
         arriving on a Pod that does not react, which is the `M-15` down-arrow shape unwritten, and
         `motion.mjs` is what shows it since a seeked frame cannot.
         PACE, from `timing.mjs` against a catalog median of 10.04 ms per character over 619 steps:
         9.32 / 9.63 / 10.18 / 10.51 / 10.58 / 12.29, so every step reads within about two ms of the
         median and gate-opens is the only slow one, which is what three hops buys. `startup-gating`
         carries the longest narration on the card at 334 characters and holds 3400 for it: at 2600
         it reads 7.78 ms per character and ranks 75 of 619, the most hurried step here by a wide
         margin. `deadair.mjs` reads 23 to 47 percent still against a catalog median of 43, so
         nothing on this card is holding an empty screen.
         liveness-fails carries the one LITERAL fade delay, BEAT.afterPulse + BEAT.afterHop: the
         kill hangs off the pulse and not off the report arriving, because the container dies when
         Kubelet decides and the report is what it sends afterwards. READINESS AND LIVENESS FAILING
         ARE TWO STEPS AND NEVER ONE. One step narrating `livenessProbe fails ... readinessProbe
         fails too` fuses the two outcomes a reader opens this card to tell apart. Split, step 4 is
         readiness failing ALONE (endpoint ready=false, nothing restarted, restartCount still 0) and
         step 5 is liveness failing (container replaced, restartCount 1), and the two differ in the
         PICTURE as well: step 4 sends its answer past Kubelet to the EndpointSlice and step 5 stops
         at Kubelet and acts downward. `CATALOG_BASELINE` counts the seventh step, which is how a
         step is acknowledged on purpose.
CONTENT  The `ready` step carries the readinessGates qualifier, and it is there because the sentence
         without it is a false absolute. Pod Lifecycle, Pod readiness, feature state Stable since
         Kubernetes v1.14: a Pod that declares `spec.readinessGates` is evaluated ready only when
         ALL its containers are ready AND every condition listed there is True, and a listed
         condition the API cannot find in `status.conditions` defaults to False.
         While one is outstanding the Kubelet sets ContainersReady and NOT Ready, so `Kubelet flips
         the Pod Ready condition to True` on a passing probe alone is untrue of any Pod carrying a
         gate. `workloads-pod-startup-conditions` states the same fact from the condition side and
         its desc already named readinessGates, so this step was the one place in the pair still
         claiming the unconditional version.
         The clause is one sentence and no more: gates are a writer-side subject, and the card
         teaches neither how to declare one nor how to PATCH the condition. NO ACTOR IS NAMED THAT
         IS NOT DRAWN (`T-21`). Nothing on the canvas stands for the EndpointSlice controller, so
         the endpoint steps say the endpoint flips rather than naming the controller that flips it.
         A NOT-READY ENDPOINT IS FLAGGED AND NEVER ABSENT, which is why the EndpointSlice carries
         `10.244.1.5 ready=false` from the poster frame on and why the `ready` step says the
         endpoint FLIPS to ready=true. `EndpointSlice: Ready` is the shortcut for `serving and not
         terminating`, and `serving` maps to the Pod Ready condition, so an endpoint of a Pod that
         has an IP and is not yet ready exists with that condition False. `empty` on the three
         pre-ready steps and `the Pod IP joins the EndpointSlice` on the `ready` step are both
         rejected: they say the endpoint is created by readiness, which is exactly what the
         `readiness-fails` step denies when it says the slice marks the endpoint ready=false rather
         than removing it. `network-endpointslice-reconcile` draws the same fact from the slice
         side, `The third Pod is recorded too, but flagged notReady, so it stays out of the serving
         set`. A PROBE KILLS AND restartPolicy DECIDES, on every step that mentions a restart. Pod
         Lifecycle: `If the startup probe never succeeds, the container is killed and subject to the
         pod restartPolicy`, and the same for liveness. So `A startupProbe that exhausts
         failureThreshold does restart the container` is rejected as an absolute that the
         `liveness-fails` step already qualifies two steps later, and the desc carries `per
         restartPolicy` for the same reason: under `restartPolicy: Never` nothing restarts.
         restartCount IS CUMULATIVE. `The restartCount stays 1 for the life of the Pod` is rejected
         because the clause riding on it, `which is how a restart loop is read off a running one`,
         needs a number that CLIMBS: a count frozen at 1 cannot distinguish a loop from a single
         restart. It never resets, which is the fact the clause actually rests on.
         kube-proxy ROUTES AND DOES NOT DIAL. `kube-proxy stops opening new connections to it` is
         rejected: kube-proxy programs the dataplane and the client opens the connection, so the
         verb is `stops sending new connections to it`, which is also what
         `network-endpointslice-reconcile` says (`no new traffic is sent to it`).
         THE TWO PROBES THAT DID NOT FAIL READ `reset` ON THE KILL, not `failed 3/3`. A container
         that Kubelet kills takes its probe workers with it, so readinessProbe never counted to
         failureThreshold on that step, and a drawn `3/3` beside livenessProbe `3/3` claims two
         independent thresholds are reached where one is. Both read the same as startupProbe,
         `reset`, for that reason.
         VERIFIED AND UNCHANGED, read against k8sVersion 1.35: a startupProbe disables BOTH other
         probes until it succeeds (Pod Lifecycle, `If a probe is defined, all other probes are
         disabled until it succeeds`), Kubelet never runs it again for that container instance, the
         four handlers are exec, grpc, httpGet and tcpSocket, and the chip counters match the
         defaults the API reference states, failureThreshold 3 and successThreshold 1. `probing
         4/30` is the docs example threshold for a slow starter and not a default, and nothing on
         the card calls it one.
SCOPE    Probe HANDLERS are named and not taught: httpGet, tcpSocket, grpc and exec appear once, in
         step 1, and how to write one is not on the canvas. The Ready CONDITION and the rest of
         status.conditions are workloads-pod-startup-conditions, which states the same
         readinessGates fact from the condition side. What a restart does to the container and to
         lastState is workloads-container-states and workloads-pod-restart-policy. The EndpointSlice
         as an object, and who else writes it, is network-endpointslice-reconcile.
OPEN     CENTRE, `report/geometry-soft.test.mjs`: `chip strip spans 140..450, centre 295 (want 600
         +-6)`. It can only be closed by making the picture worse, which is L-16, and both routes
         were measured.
         Centring the strip on 600 puts it at 445..755, and the three probe lanes run at 528 / 600 /
         672 from y 120 to y 476 straight through that band: L-10 forbids a segment crossing a block
         it does not terminate on, so the fix trades a soft finding for a hard one.
         Spreading it full width instead makes it a four-across bottom strip at 270 a cell, and
         WL.L-05 has already refused 258 and 205 on this category and counted what the second one
         cost, 79 chip collisions. The longest pair here is `readinessProbe` against `held
         (startupProbe)`.
         The strip stays left. What the metric measures is the CHIP STRIP alone: the content bbox of
         the card is 140..1060 and centres on 600 exactly. R2-ENTRY and R2-STEP,
         `report/arrival.test.mjs`: five chip values change with no `.highlight`, on steps 3, 5 and
         6. CARRIED, and the reason is what the cue is FOR. Workloads is a `chips` category and not
         a `chipsCued` one (P-09, P-10), so a cue here is the step field `lit` and nothing else, and
         `lit` says what the step is ABOUT. All five are background state: livenessProbe reaching
         `passing` on the step whose subject is readiness, startupProbe and readinessProbe both
         going to `reset` on the step whose subject is the kill, and the two probes recovering on
         the step whose subject is the fresh container. Lighting them closes the finding by pointing
         the reader at the wrong chip.
         The count of uncued changes here is DELIBERATELY high: lighting five chips of five on a
         liveness step is the same as lighting none. Fewer lit chips per step buys more uncued
         changes per card, and the trade is taken in that direction on purpose.
```
