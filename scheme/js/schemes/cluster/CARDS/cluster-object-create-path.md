## cluster-object-create-path

### layout

```
WHAT     A manifest becoming a running Pod. Every handoff AFTER the write is one component reacting
         to a change on its own watch rather than a call, UNTIL the Kubelet drives the Runtime over
         CRI, which is a call and is drawn as one. The clause is not optional: without it the
         sentence is an absolute the card's own last step contradicts, and the `CONTENT` line below
         keeps the Kubelet the caller of every CRI call.
PANEL    x 291 / 378 / 397, bottom 160 / 193 / 230 on the worst step, which is `post` at 1100x800,
         measured against the current narration. The first block under it is the controller-manager
         at 328, so 98.2 units of slack at the worst viewport. The narrowest viewport is the one
         that does NOT move when the `post` narration grows: it already wraps to the same line
         count, so a prose edit shows up on the two WIDER heights first. Re-measure on all three heights after
         any narration edit: the bottom swings with the line count and the line count swings with
         the viewport WIDTH.
MOTION   The durations are sized off READING LOAD, not off the motion: 3000 / 2200 / 3000 / 4400 /
         2900 / 2400 / 3300 against narrations of 304 / 202 / 195 / 270 / 265 / 183 / 251
         characters, a band of 9.9 to 16.3 ms per character. Only `span <= duration` has a machine
         (`M-19`) and it is not the constraint here: the longest chain, `controller`, ends 180 ms
         before its step does. `persist` sits at 2200 and reads at 10.9. DO NOT drop it back to
         1700, where it reads at 8.4 against the 16.3 of the step beside it, the widest spread the
         card can carry. NOT HARMONISED with cluster-architecture, which holds 8.2 to 9.4. The two
         sisters agree on rows and columns and not on pace. Re-timing all seven to the tighter band
         is available and costs nothing but the floor each step's span sets.
DO NOT   Swap which side of each face the client pair takes. The out lane runs on the upper level 50
         and the return on the lower 70, so an out vertical standing LEFT of where the return turns
         down cuts through the return horizontal. At the client the out lane takes the OUTER slot and
         the return the inner one; at the frame it is the mirror. Both pairs straddle their own face
         midpoint.
NOTE     The lanes are addressed to the CONTROL PLANE, not to the API, exactly as the Node lane is
         addressed to the Node. What receives the POST inside is still the API, which is why it
         lights on arrival: it is the door rather than a stop along the way.
NOTE     The Node lane is TWO points with no turn: [[CX, TOP_BOTTOM], [CX, NODE_Y]], leaving
         the API bottom face midpoint and landing on the Node frame TOP face midpoint, both 600 for
         free. Any jog reads as addressed to the KUBELET, where what it carries is a watch stream
         arriving at the NODE.
NOTE     `create-pod` is one of only TWO steps in the whole category that declare `reducedLit`. Its
         animated path pulses the placedPod WRAPPER and lights no inner block, so `flowLights` has
         nothing to derive from it and the static path would show the step with no cue at all:
         `placedPodBox` is what the reduced branch says instead of the pulse it cannot show.
         The census that makes this a deviation rather than a habit, measured over the 23 cards of
         this category: 152 steps, 110 of them carry a `flow`, and on 26 of those 110 the
         derived guard lights NOTHING. Only two of those steps need a stand-in, this one and `rank`
         on cluster-node-pressure-eviction. So a derived guard that lights nothing is the ordinary
         case and is not by itself a finding: the question is only whether the step carries a cue
         the reduced path has no other way to show.
WHY NOT  Giving the client the API's 220 width. The band outside the wall is 150 units and 130 is
         that band minus two 10 unit margins. Widening needs the frames moved, which carries the
         centring, or a wider viewBox: the viewBox width available is 1200 at 1280x860 and below, so
         there is slack only while the dialog is wider than about 1.88:1, 39 units at 1600x1000. +90
         shrinks the whole card by 7% at 1280x860, and R-viewbox holds every card on 0 0 1200 640.
OPEN     CENTRE reports content 150..1190 centred on 670, CENTRE-LOW 170..1190 centred on 680: the
         same complaint with the frame walls left out. Both are the client hanging off the right of
         a composition centred on the frames. DO NOT close them by re-centring: it drags the frames
         off 600, which is what keeps the Node lane one straight segment. CENTRE-LOW judges against
         the panel bottom of ONE viewport, 143 at 1600x1000, and the report says so itself: at the
         worst-of-three bottom, 230, the finding drops.
OPEN     The stack sits low and nothing pays for it: no block on either card stands in the panel's
         column, which is the only thing a low stack buys, so the drop is unpaid for
         on BOTH cards. What it still buys is that the two cards agree in both axes. Raising the rows
         is available and is a TIMING change, because routeDur is length-based.
NOTE     The row INSIDE the Node frame is `NODE_Y + 41`, which gives architecture's two watch labels
         tier 2's 20 unit gap, and THREE cards hold it: this one, cluster-architecture and
         cluster-cascading-deletion, all on NODE_Y 475 and NODE_H 153. Nothing here is timed off it: every
         hop in the Node band is horizontal, so no span moved. Restoring 47 on one card only is what
         breaks the set.
         Of the three, the two that also place a Pod inside the frame share the whole triple, 153 of
         frame, 106 of Pod and 28 between their tops. `CLU.L-01` names that as the one Cluster frame
         reading outside the 152/106/34 family whose reason is written down, and this is where it is
         written: the two cards are one grid, so the frame is one measurement and not two.
CONTENT  Server-side Apply is `the same PATCH under its own content type`, not `a verb of its own`.
         Server-Side Apply names the operations in field-management scope as `Server-Side Apply
         (HTTP PATCH, with content type application/apply-patch+yaml)`, so there is no APPLY method
         at the protocol level, and `cluster-server-side-apply` opens on that exact wording: `a
         PATCH sent with the content type application/apply-patch+yaml`. The two cards sit two
         apart and have to tell one story.
         `checks RBAC` names the default authorizer where the mechanism is authorization. The
         counter-cases are real (Node, webhook, ABAC) and the wording is KEPT anyway: RBAC is on in
         every cluster a reader of this card has, and `cluster-admission-chain` owns the generic
         chain. DO NOT widen it to `checks authorization`, which says less than the card knows.
         The Pod is NAMED from `controller` on and DRAWN from `create-pod`. That is not a gap: the
         block is the Pod RUNNING on Node-1, and the API reference is explicit that a Pod with an
         empty `spec.nodeName` `is a candidate for scheduling`, so drawing it inside the Node frame
         before the Binding lands would state a placement that has not happened.
         The HTTP mechanics: POST to the collection path on a create, 201 Created back, a THREE-WAY
         MERGE PATCH on an object that already exists (which is client-side apply, and naming it
         that way is what keeps the pointer to Server-side Apply from reading as the same verb), the
         field selector spec.nodeName, the binding subresource, watch event type ADDED, and the name
         chain my-app -> my-app-7d4 -> my-app-7d4-abc.
         The controller step animates FOUR balls, not one out-and-back: watch the Deployment, create
         the ReplicaSet, watch the ReplicaSet, create the Pod. The narration names TWO handoffs by
         TWO controllers and the desc makes it the card's whole point.
         The create-pod step draws the Runtime as a block and takes TWO hops, CRI from the Kubelet
         then the container coming up into the Pod. One ball Kubelet-to-Pod reads as the Kubelet
         creating the container itself. The narration keeps the KUBELET the caller of every CRI
         call, which is what cluster-pod-sandbox-cri spells out call by call: a Runtime that pulls
         and starts on its own contradicts that card.
BUDGET   The tier-2 label slots are floored by the two COLUMN walls at 170 and 1030, so a label
         centred on 280 or on 920 may run 110 either way: 220 units, and at 6.89 per character that
         is a ceiling of 31, with a 32nd touching the wall. MEASURED at 1600x1000, their widest:
         `POST .../binding . node=Node-1` is 206.7 on 816.6..1023.4, 6.6 inside the right wall at
         30 characters. The controller-manager slot is over that ceiling: `watch ADDED Deployment
         my-app` is 199.8 on 180.1..379.9, but the string the `F.set` TURNS IT OVER TO,
         `watch ADDED ReplicaSet my-app-7d4`, is 227.4 on 166.3..393.7 at 33 characters, so it
         overhangs the column wall by 3.7 a side. No repair is called for: it is still 16.3 inside
         the FRAME wall at 150 and reads clean. The number is here because the slot is already over
         its ceiling, so the next string put in it starts from 33 and not from zero.
         **No frame shows that string.** `frames.mjs` seeks the animated path, which applies
         `rewind` and never fires the turnover (`M-35`), so every rendered frame of step 4 carries
         the SHORTER label while a reader watching the step sees the longer one for 2.5 of its 4.4
         seconds. Measure this slot on the REDUCED path (`gotoStep(4)`), where `wires` states the
         end value above the guard, and nowhere else.
NOTE     ETCD is drawn ONCE, as one round trip over the `persist` and `etcd-response` steps, and is
         dark for the four steps after it. Every later write lands there too, the ReplicaSet, the
         Pod and the Binding, so the `schedule` step says that in WORDS. Four more round trips to
         the right-hand cylinder is a picture about storage, and the card is about who reacts to
         whom.
NOTE     The two client labels share ONE register, `KCTL_LABEL_Y`, over the OUT lane, while the ETCD
         pair splits its own, the request above the out lane and the ack below the back one. That
         asymmetry is forced: under the client return lane there are 20 units to the frame top at
         90, so an ack register there would sit on the frame. The two never show on one step.
OPEN     The CONTROL PLANE frame label at (162, 108) is covered by the panel on every measured
         viewport, exactly as on cluster-architecture, and for the same reason: the panel is 291
         wide at its narrowest and the label starts at 162. Same author decision, same reason
         OCCLUDED cannot report it, and the same instruction not to fix it by cutting narrations.
DO NOT   Promise a status report back from the Node. The card draws no lane from the Node to the API,
         and adding one means splitting the straight API-to-Node spine into a mirrored pair.
NAMING   Titled `Object Create Path`. A CLI verb names one step of seven, and
         `Kubectl Apply` beside `Server-side Apply` two cards away invites the reader to guess which
         is which. `Watch` or `Reconcile` was rejected: the catalog already holds `List-Watch and
         Informers` and `Kubelet Reconcile Loop`. app.js searches title + desc, so the desc keeps
         "between kubectl apply and a running Pod".
         The id carries the title and not the CLI verb, for the reason above: the id is the name a
         reader meets in the file tree and in a deep link. `D-02` is why the category prefix stays.
         `control-plane-apply-flow` and `cluster-apply-flow` both resolve through `SCHEME_ALIASES`,
         which is two of the 37 the census in `unit/catalog.test.mjs` pins.
```

### poster

```
Sentence: two things come in, one Pod comes out.

This block describes what posters.js draws. Four 76 x 44 blocks: two on the left at
(14, 22) and (14, 114), one at (122, 68), one at (230, 68). Each left block sends a dashed leg out
of its right face at its own middle (44 and 136), turns at x=106 onto the centre line y=90 and
enters the middle block, so the two legs MERGE. A straight dashed leg then runs 198 to 230 into the
last block. Only that last block is lit (0.10 against 0.04) and only it carries its accent bar at
0.9, the other three at 0.14: the sentence is about what the chain PRODUCES.

Do not read the geometry of a poster out of this file without opening posters.js.

DO NOT go back to a row of boxes on one horizontal axis. That version was indistinguishable from
cluster-cascading-deletion on the grid, and the mirror-of-delete-flow idea behind it (fills rising against
fills falling) is invisible at grid size.
```

### before `    P.box({ key: 'client', x: KCTL_X, y: KCTL_Y, w: KCTL_W, h: BOX_H, label: 'kubectl' }),`

```
The only block not in a frame, and both of its numbers are solved rather than chosen. KCTL_X is
FRAME_R + 10, KCTL_W is the band minus two such margins (130, also ETCD's width, so the two blocks
flanking the frame read at one scale), KCTL_Y is CP_CY - BOX_H / 2 so the block is centred on the
wall its lanes address. DO NOT hardcode either: a literal would survive the next frame move.
```

### before `const WIRE_REQ_Y = OUT_Y - 12, WIRE_ACK_Y = BACK_Y + 18;     // 158 / 208`

```
Two registers for the ETCD pair, both BETWEEN the blocks: the request above its out lane at 158, the
ack below its return lane at 208, both centred on ETCD_GAP_CX 805, the middle of the 190 unit gap.
MEASURED at 1600x1000 after document.fonts.ready, `write Deployment my-app` is 158.5 on 725.8..884.2
and `ack . rv=842` is 82.7 on 763.7..846.3, so the wider of the two clears the API on 710 and the
cylinder on 900 by 15.8 a side. Both are 6.89 per character to the decimal, which is the `L-20`
rate. MEASURE AFTER document.fonts.ready: a read taken in the fallback face comes back about 3.5
percent low and reproduces on no viewport.

The CLIENT pair cannot use this register: its lanes are 100 units above the row, in the band over the
frame. Its two labels share ONE register at y=34, centred at 862 on the level run they ride, and they
can share it because they never share a step (POST is step 1, the 201 is step 3). WHY NOT inside the
frame at the lane heights: they cross the two Scheduler lanes turning at 264 and 284. WHY NOT hugging
the client's own faces: the climbing verticals cross them. Both were wrong on the render, not in the
source.
```

### before `const { out: JOG_DOWN, back: JOG_UP } = laneY(BAND_CY, D10);   // 264 / 284`

```
Each tier-2 box carries a mirrored pair on its top face: watch out on the outer lane at JOG_DOWN,
write back on the inner lane at JOG_UP, so the two never cross.

BOTH LEVELS ARE DERIVED FROM THE BAND, not offset from the row above. BAND_CY is the exact middle of
the gap, so the pair re-centres whenever either row moves. The band is 108 units, half again the 80
architecture carries, and at that depth a fixed +40 / +60 glues both lanes to the API and leaves dead
air under them.

BOTH halves of the controller-manager pair are drawn. The `controller` step narrates two creates back
to the API, so a watch with no write would teach a different rule from the very next step, which
draws both halves of the identical shape for the Scheduler.
```
