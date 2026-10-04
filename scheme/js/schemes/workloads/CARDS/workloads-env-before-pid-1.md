## workloads-env-before-pid-1

### layout

```
WHAT     The three KINDS of place a container environment is assembled from, the moment the whole
         set crosses into the container, and why editing a source afterwards moves nothing.
LAYOUT   An instrument, not the A / B / C column preset. The preset is a ladder and a chip column
         flanking a spine over a Node frame, and four cards of this section carry that exact scene.
         kin.mjs reads `box4 pod1 node0 chip3 cyl0 chain0 raw2` off this card and finds no sibling
         in the section on the signature, and the three levers no sibling has are `noframe group
         strip`. The arrangement is a funnel through a one-way line, four bands deep and all of it
         on ONE spine at x=600. EVERY BAND ENDS ON THE SAME TWO X, 254 and 946:
           sources  40..120, three peers at 254..474 / 490..710 / 726..946 (spread, w 220)
           merge    302..364, ONE box the width of the source row, 254..946
           line     388..422, a 34 unit rule at 254..946 with a 60 doorway on 600
           Pod      446..578 at 360..840, container 420..780, env strip 594..628 at 254..946
         Three things the section has never used carry it, and each is the subject asking:
           no node() frame. The Node is where this happens and no step of this card has anything
           to say about it, so a frame here is a block nothing narrates (T-21). 7 of 7 cards in
           the section draw one.
           no chain. 6 of 7 draw one. The Kubelet box carries a per-step `sublabels` line instead,
           which is the same position-in-the-story a lit rung gives and costs no band.
           chips as a wide strip rather than a flanking column. 5 of 7 stack a column.
         THE SPINE IS 600, WHICH IS WL.SPINE_X, and the row starting at 254 is what delivers it: a
         leg dropping straight out of its own source lands 364 / 600 / 836, a midpoint plus an L-12
         mirrored pair about 600 alone.
         Held to the L-03 floor of 420 the row midpoint would be 766 and no band under it could sit
         on WL.CX without a dogleg.
         600 IS UNREACHABLE, AND THE ARITHMETIC IS SHORT. A row symmetric about 600 that starts at
         420 has to end at 780, which is 360 units for three boxes plus two gaps. The widest of the
         six strings the boxes carry is `status.podIP 10.244.1.5`, measured 138.7 at 1600x1000, so a
         box under about 155 cannot hold its own text. No width closes it.
         The spine is a function of the row LEFT EDGE, ROW_L + (3w + 2g) / 2, so 254 is chosen to
         put it on 600 rather than the other way round. Straight legs and a merge box on 600 are
         then both on the canvas, where a row held to 420 gives one or the other.
         ONE SPAN CARRIES EVERY BAND, 254..946, and it is the merge box span. The rule and the env
         strip take it too, so nothing on the card overruns anything else, and because the spine is
         the midpoint of that span the rule's two halves come out EQUAL at 316. A band wider than
         the merge box is what a reader sees as a defect: the rule and the strip then stand out past
         the row, the Kubelet and the Pod on both sides at once.
         L-13 IS THEN MET BY CONSTRUCTION, blocks and chip strip alike centring on 600 exactly, and
         CENTRE / CENTRE-LOW report 0 findings. What it costs is the OPEN entry below.
PANEL    x<=397 catalog-wide (`L-02`). Bottom per viewport: `OVERLAY_IDS=workloads-env-before-pid-1
         node --test report/overlay.test.mjs`. Deepest at 1100x800 on the poster frame, which
         previews step 1 (`D-14`). That reading is what the whole card hangs off: the merge box
         starts at 302, so 22.49 units is the entire clearance. Step 1 holds 353 characters and buys
         that band: at 424 it leaves nothing at all, which is `L-08` in one edit.
SIZES    The source boxes are 220 wide, and the number is set by the ENV STRIP rather than by these
         six strings: the strip takes this row's span, and 3 chips across it must hold 179.2 of name
         plus value. At w 200 the chip is 201.33 and the widest pair overflows by 1.87, at 220 it is
         221.33 and clears by 18.13. Measured at 1600x1000 the padding left is then 43.7 on
         `ConfigMap app-config`, 40.65 on `status.podIP 10.244.1.5` and 49.7 on `clusterIP
         10.96.0.42`, and the middle of those three is the narrowest the row carries. The rule is 34
         tall with a 4 corner radius, which is WL.CHIP_H and the height of the phase rail of
         workloads-pod-startup-conditions: at 18 it reads as a pair of empty squashed chips beside a
         34 tall env strip drawn in the same stroke. The captions sit INSIDE it on the baseline
         WALL_Y + WALL_H / 2 + 4, measured ink 397.8..412.4 against a rect of 388..422, which leaves
         9.8 over the glyph and 9.6 under it. The band itself is 24 clear of the merge box above and
         24 clear of the Pod below.
         The container box is 360 x 68 and the strip starts at 594, not tight under the shell: pod()
         puts the Pod sublabel on the baseline h - 8 and its ink reads 559.7..572.6 at 1600x1000, so
         594 leaves 21.4 to the first chip rect.
         The env chips are 221.33 wide, which is NOT a LAYOUT.C.strip width: this strip takes the
         merge box span, not L..R. `render/chipfit.test.mjs` measures the widest pair,
         `WEB_SERVICE_HOST` at 110.3 against `10.96.0.42` at 68.9, and the name-to-value gap is
         18.13 against a MIN_GAP of 4. That is the binding constraint on the whole card: it is what
         sets SRC_W, which sets the spine, which sets every band under it.
LANES    Three legs into one bar, ONE trunk out of it, and NOT A SINGLE TURN on the card. Every leg
         drops straight out of the source that feeds it onto the bar top face at 364 / 600 / 836,
         which is that face midpoint plus an L-12 mirrored pair at 236, and the trunk leaves the
         same midpoint straight down through the doorway to the Pod top midpoint.
         The legs are 182 units each, identical because they are parallel, all three floor-bound by
         PKT_DUR_MIN at 700ms and running 0.260 u/ms against a catalog median of 0.229.
         A turn is what the geometry costs elsewhere: the merge box has to sit on the row midpoint
         for the drops to be legal, so the row midpoint has to BE the spine. Putting the row on the
         L-03 floor of 420 and the bands under it on 600 is the version with three doglegs, one per
         leg. Straight everywhere is the reason the row starts at 254.
         Nothing on this card travels upward, so there is no down/up lane pair and no corridor()
         helper: the exemplar carries one because its Pod reports back and this card has no step
         that does.
         The trunk carries exactly ONE ball on the whole card and it goes through the doorway. That
         scarcity is the argument: on the last step the update dies at the Kubelet and the empty
         doorway under it is the picture.
MOTION   Step 1 has no packet and no Pod, so its beat is a static highlight alone (M-27).
         Step 2 is the only two-ball step: leg 1 at 0 and leg 2 at 300, because both reads happen at
         launch and staging them by a full BEAT would claim an order that is not there.
         Steps 3 and 5 are self-initiated and wait BEAT.lead.
         Step 4 is a down-arrow: the ball lands, THEN the Pod blinks and lifts (M-16), and the strip
         lifts with it as ONE group, because the set is handed over as one thing.
         The trunk is 82 units and routeDur clamps it to the PKT_DUR_MIN floor of 700, so that ball
         runs at 0.117 u/ms against a catalog median of 0.229. It is floor-bound like 579 of the 779
         balls in the catalog (M-13), and here the slowness is welcome: the one crossing of the card
         is the one ball a reader has time to follow through the gap.
CONTENT  Every claim is a quoted upstream sentence rather than a derivation, and the one claim the
         doc pages do not settle is marked below as resting on the kubelet source.
         The ConfigMap page states that the kubelet uses the data from the ConfigMap when it
         LAUNCHES the container, and that ConfigMaps consumed as environment variables are not
         updated automatically and require a Pod restart.
         The container-environment page states that the Service variables cover the Services that
         existed WHEN THE CONTAINER WAS CREATED, which is the ordering trap step 3 is about.
         The downward API page states that metadata.labels and metadata.annotations as a WHOLE are
         available only as volume files and never as variables, and that after a resize the
         downwardAPI volume updates while the variables do not unless the container restarts.
         That last sentence is why step 5 can name a resize without drawing one.
         THE RIGHT WALL CAPTION CARRIES THE RESTART, and `no later call ever rewrites it` is
         rejected for leaving it out. The CRI proto is what makes the LEFT caption true:
         CreateContainerRequest carries `repeated KeyValue envs` inside its ContainerConfig,
         StartContainerRequest carries a container id alone, and UpdateContainerResourcesRequest
         carries resources alone, so no call in the interface mutates a running container
         environment. What the absolute leaves out is that a RESTART is another CreateContainer with
         a freshly resolved set, `generateContainerConfig(container, pod, restartCount, ...)`
         calling GenerateRunContainerOptions on every start, which is the sentence step 5 itself
         ends on. A caption is read on EVERY step including the poster, where step 5 is not on
         screen to qualify it, so the exception has to travel with the rule (T-19).
         THE STEP 1 WIRE NAMES TWO PLACES AND NOT THREE. `env, envFrom and valueFrom name three
         different places` is rejected because the third drawn source is the Service, and the same
         step narrates WEB_SERVICE_HOST as never asked for at all. The spec fields name the
         ConfigMap and the Pod field, and the Kubelet adds the Service pair unasked.
         STEP 3 SAYS `has a cluster IP` BECAUSE `every Service` IS FALSE OF A HEADLESS ONE. The
         Service page says the kubelet adds the variables "for each active Service" and never
         defines active, and the kubelet makes it concrete: `ignore services where ClusterIP is
         "None" or empty` guards the loop in getServiceEnvVarMap, which is the SOURCE-level half of
         the claim and the only one on this card. The Service page is the fourth citation for that
         sentence and for the DNS escape the step ends on, neither of which the other three carry.
         The clause is paid for inside the same sentence by `unless enableServiceLinks is set to
         false` shortening to `is false`, which the PodSpec field comment supports as it stands:
         "Optional: Defaults to true."
         THE DESC CARRIES enableServiceLinks AND NOT THE CLUSTER IP, at 461 of the 470 D-04 allows.
         One condition is what a grid summary holds, and the switch that turns the whole injection
         off is the larger of the two.
         A PAIR IS THE FLOOR AND NOT THE CEILING, and the two Service pages differ on how much it
         covers. Container Environment defines exactly FOO_SERVICE_HOST and FOO_SERVICE_PORT, and
         the Service page adds the Docker legacy link set on top of them
         (REDIS_PRIMARY_PORT_6379_TCP_ADDR and its four siblings). `a pair` is true of what the card
         draws and undercounts what a reader finds in `env`, and naming the link set costs step 3 a
         line it does not have: its panel is the DEEPEST on the card at 279.51 against a merge box
         at 302.
         THE STEP 2 WIRE SAYS GET AND STEP 5 SAYS WATCH, one mechanism seen twice.
         configMapAndSecretChangeDetectionStrategy defaults to Watch, so the read at launch comes
         out of a watched cache and not off a literal GET. GET is the honest shape of "the Kubelet
         fetches it now" at the only moment the card draws a read, and no card here owns the
         manager.
NAMING   THE TWO WALL HALVES CARRY TWO CAPTIONS, NOT ONE SENTENCE HALVED. `one call carries the
         whole set over` and `nothing rewrites it short of a restart` each state a rule of the line
         and neither is a fragment of the other, so each is CENTRED in its own 316 half:
         measured at 1600x1000 they ink 291.4..532.6 in 254..570 and 657.1..918.9 in 630..946, which
         is 37.4 and 27.1 of padding a side. A halved sentence forces an end-anchored pair instead,
         which reads as one caption with its tail in the next box. Neither string repeats the step 4
         wire label above it, which already says `CreateContainer` and `the set crosses`, and the
         right one carries its own exception because it stands on all six steps and on the poster,
         where step 5 is not there to qualify it (T-19).
         STEP 3 QUALIFIES IN BOTH PLACES. The Kubelet sublabel reads `adds a pair per Service with a
         cluster IP` rather than `per Service that exists now`, because the sublabel is what a
         reader has when the panel is covered and the narration is not there to bound it.
         STEP 2 NAMES WHAT ITS TWO BALLS ARE, not two requests. Both legs carry a VALUE down into
         the merge, and only the ConfigMap one costs a read, so the wire reads `GET ConfigMap
         app-config · status.podIP needs no read` and the Kubelet sublabel `reads the ConfigMap,
         holds the Pod object`. Naming a `GET Secret db-auth` there put a request on the frame with
         no ball and no block under it, and the reader mapped it onto the Pod object leg, which the
         narration of that same step denies in its third sentence.
         The three sources are three KINDS and not three objects, which is why they are peers of one
         width: an object somebody else owns, the Pod itself, and the state of the namespace. The
         last of the three is the odd one and the card says so in words rather than in geometry,
         because the Kubelet adds those variables without being asked.
         The source sublabel is stated by EVERY step, for the same reason a chip value is: nothing
         in the reset restores a sublabel, so a step that leaves it unsaid shows the edited value on
         the way back from step 5.
         On step 5 the three variables are deliberately NOT lit and NOT changed. The contradiction
         is `DB_HOST db.staging.svc` above the line against `DB_HOST db.prod.svc` below it, in one
         frame, and lighting the copies would say they had reacted.
SCOPE    Files are not this card. storage-configmap-secret-mount owns the atomic ..data flip and the
         sync period, and storage-projected-volume owns the assembled mount. The contrast is one
         clause of step 5 and no volume is drawn.
         The resize itself is workloads-pod-resize. It is named once, as the second case of the same
         freeze, and no resize plays.
         The Secret is read on step 2 and never opened: workloads-image-pull-registry-auth owns
         registry credentials and no card in this catalogue draws Secret encoding.
         The literal `env:` pair, the fourth way a variable is written, is named in the narration
         and given no block. A fourth box costs the row 236 units of width, 118 of it on each side
         of a spine that has to stay on 600, which puts the row at 136..1064 and the first box
         entirely inside the panel column on every viewport.
NOT A DEFECT
         Six rows are CARRIED in test/fixtures/carried.mjs, three on R2-ENTRY and three on
         R2-STEP, all on step 4: the three chips change from `unset` and carry no .highlight. The
         cue is there and it is not a per-chip one. The strip is a `P.group` and the group lifts
         from OPACITY.notready to 1 on the arrival of the single ball, so the whole set appears at
         once, which is the mechanism. Three separate highlights would say three things arrived, and
         P-09 binds workloads to `chips` rather than `chipsCued` in any case. No R3 row stands here:
         the bar is a RECEIVER on steps 2, 3 and 5 and lights on arrival through `lights`, never in
         `lit`. Lighting it in `lit` puts the Kubelet up at step entry with a packet still 1500ms
         out.
OPEN     L-03 IS DELIBERATELY BROKEN AND THE FIRST SOURCE BOX PAYS FOR IT.
         `report/geometry-soft.test.mjs` reports `"ConfigMap app-config" [254..474 x 40..120] is 65%
         under the narration panel at its worst (x<=397, y<=255)`. Measured per viewport, the box
         loses 36.77 of its 220 at 1600x1000, 123.76 at 1280x860 and 142.55 at 1100x800. The LABEL
         survives only on the widest: `ConfigMap app-config` inks 297.65..430.35 against a panel
         edge of 290.77 at 1600x1000, 377.76 at 1280x860 which cuts 61% of it, and 396.55 at
         1100x800 which cuts 75%. `DB_HOST db.prod.svc` under it loses 62% at 1280x860.
         Held to the L-03 floor of 420 the row midpoint is 766 and the whole card leans 166 right of
         WL.CX, which is the trade this card takes the other way round: a centred composition at
         every viewport against one label the panel eats on the two narrow ones. Reordering the
         three sources does not help, because any label centred in the first box inks from about 298
         whatever it says. The lever that would close it is clamping the panel height in CSS, which
         is catalog-wide and not a change one card makes. CARRIED in `test/fixtures/carried.mjs`.
```
