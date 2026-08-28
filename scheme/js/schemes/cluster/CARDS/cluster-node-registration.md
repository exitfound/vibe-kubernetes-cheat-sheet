## cluster-node-registration

### layout

```
WHAT     A machine becoming a Node object, and the gap between the object existing and the Node
         being able to take a Pod: self-registration, the status the Kubelet publishes, Ready
         False under the not-ready taint, Ready True, and the Lease heartbeat.
LAYOUT   Layout C, ladder right at 660..1140, one FULL-WIDTH Node frame at 402..528, chips as two
         rows of three under it. The API is centred on CX so both
         lanes between it and the frame are straight drops, and the Lease takes the 820..950 slot
         cluster-node-failure holds it in, which is the same top row one card later.
         THE FRAME IS THE MACHINE, not the object. It rests at OPACITY.notready until the create
         lands and comes to full there, which is C-14 read literally: the machine is alive and the
         cluster has not observed it. Measured at 1600x1000, mean pixel value of the frame label
         and of a 1250x4 strip of its top border: 22.23 / 21.44 dim against 33.43 / 31.63 full, so
         the reveal is a 50 percent lift and reads on screen rather than only in the dump.
PANEL    x<=396.55, bottom 142.56..177.44 at 1600x1000, 171.42..213.92 at 1280x860 and
         204.97..254.66 at 1100x800, deepest on `status`. Frame top 402, so the binding
         clearance is 147.34 units.
BUDGET   THERE IS NO CHARACTER CEILING FROM THE GEOMETRY, and that is a measurement rather than an
         omission. The panel is line-quantized: at 1100x800 the deepest step (358 characters,
         `status`) reaches 254.66 and the shortest sit on 204.97, so 147 units of headroom is
         roughly 270 more characters and a narration would have to pass 620 before it touched the
         frame. What binds here is the canon 360, and TWO steps now sit within 11 of it: `status`
         at 358 and `not-ready` at 349, both because T-20 spent the characters on a clause.
SIZES    The vertical budget, exact: 40 of top margin, the 80 top row, 28, six ladder rows at the
         folder CLU.ROW_GAP 10 ending on 390, 12, the 126 frame, 14, two chip rows at 34 with an 8
         gap ending on 618, 22 of bottom margin.
         THE FRAME IS 126, NOT THE CLU.L-01 152, and the 26 comes out of the SLOT: 34 of label
         padding and 12 of floor are the family untouched, the Pod band is 80 rather than 106.
         Two of the three slots are plain boxes carrying a label and a sublabel, and a 106 shell
         around that pair leaves 60 units of nothing, which is 4 of the 6 steps reading as an
         oversized empty frame because the third slot is a Pod that has not arrived yet. The Pod
         inner box comes with it, 26/44 rather than 28/52.
         cluster-node-failure met the same 640 wall and paid it out of the paddings, 132 with 16
         of floor. Here the paddings are the family and the CONTENT is what was wrong.
WHY NOT  Chips two across at 532, which cluster-node-drain uses. Six chips would then need three
         rows at 34 with two 8 gaps, 118 units, so a strip ending on 618 would start at 500
         against a frame bottom of 528, and the 126 frame does not buy that back either. Three
         across at 350.67 fits the widest pair on the card by 23.5 (`Taint` ends 835.8 and
         `node.kubernetes.io/not-ready:NoSchedule` starts 859.3, measured at 1600x1000).
LANES    THREE LANES, ALL ON THE FRAME TOP FACE, and none of them on a box inside it. The two
         between the frame and the API are a mirrored LANE_DX pair at 588 and 612, which is a
         deliberate pair on BOTH faces under L-12: the Kubelet writes going up, the placement
         write coming down. The Lease riser leaves at 640, 40 off the 1080 face midpoint, 3.7
         percent and well inside the 18 percent a lone endpoint is allowed.
         640 IS THE ONLY CORRIDOR THERE IS. The ladder owns 660..1140 from y 148, the panel owns
         everything left of 397, and the one free horizontal band is 120..148 between the top row
         and the ladder, which is why the riser turns at UNDER_TOP_Y 134 and crosses to the Lease
         bottom midpoint. cluster-node-failure routes its heartbeat over the identical corridor at
         the identical x, and for the same reason: everything else is occupied.
         THE HEARTBEAT LEAVES THE FRAME, NOT THE KUBELET BOX, which is the reading
         cluster-node-failure states in words: a Lease is renewed by the Kubelet and the Kubelet
         is the Node. The Kubelet box is drawn so T-21 is met and so the reader can see WHO acts,
         and it is centred at 450..750 under both drops for exactly that reason.
MOTION   Six beats and no two alike: a reveal, three single risers with different payloads, a
         riser chained to a drop with a Pod materialising on it, and one long riser to the Lease.
         The three Kubelet writes ride the SAME 282 unit riser, and 282 is under the roughly 315
         units at which routeDur leaves its 700ms floor, so all three run at 700ms and the length
         buys no time at all (M-13). The Lease leg is 527 and runs 1171ms, which is the one ball on
         the card whose geometry sets its pace.
         MOVING THE FRAME IS A TIMING CHANGE (A-11) AND THIS ONE COST NOTHING. The frame dropped 20
         when the ladder relaxed to CLU.ROW_GAP, so the riser grew 262 to 282 and the Lease leg 507
         to 527. The riser is still floor-bound at 700ms, and the only span that moved is
         heartbeat, 2487 to 2531 against a 2900 duration.
         STILL TIME, measured live: boot 1300, register 940, status 940, not-ready 1040, ready 400,
         heartbeat 369, against the catalog medians `deadair.mjs` prints. `boot` is the one step
         whose whole motion is a 500ms reveal, and its duration is 2600 rather than 2900 for it:
         that lands the still time on 1300, which is beside the catalog median. Its pace of 8.70 ms
         per character sits between the 8.38 of `status` and the 8.88 of `not-ready` on the same card. Cutting
         further would make it one of the most hurried steps in the catalog to buy a number no rule
         asks for. The other five are 11 to 52 percent still and every one of them reads faster
         than the catalog median pace, so the hold is buying reading rather than standing idle
         (M-19a).
WIRE LABELS
         TWO REGISTERS. `call` sits at 768, the midpoint of the 104 unit gap between the API and
         the Lease, at y 26 above the top row, and captions the call the Kubelet makes on FIVE
         steps, the heartbeat included, so every ball on the card is captioned. `PUT lease
         renewTime · every 10s` is the string cluster-node-failure already writes on its own
         heartbeat lane, which is the same agree-by-construction the PATCH note below records. It is deliberately NOT named `api`, because that key is the API box: the two live
         in different ref buckets (`refs.wires` against `refs`) so both would work, and a READER
         reads it as one name used twice. The sweep does not, it buckets the two kinds apart.
         `bind` is the exception: the placement drop is the one payload the Kubelet did not send,
         so it gets its own register at 624, anchored START 12 right of the drop, at y 422 INSIDE
         the frame label band. That band is where it has to go: the corridor beside the drop is 28
         units wide and the ladder owns everything past 660. Measured at 1600x1000, the string
         runs 624..761.8 at y 410.8..425.4, 8.8 below the frame top and 10.6 above the Kubelet box,
         and the frame's own label sits at 72..116.7 two units higher, 507.3 units away.
         The five `call` strings measured against the panel, worst case 1100x800 where the panel
         reaches 396.55: `POST /api/v1/nodes · Node-1` 685.2..850.8, `PATCH /api/v1/nodes/node-1/
         status` 666.8..869.2, the two Ready strings 636.1..899.9 and 639.2..896.8, and `PUT lease
         renewTime · every 10s` 672.9..863.1. The nearest any of them comes to the panel is 239.6
         units.
CONTENT  Every claim here is read off the four sources, and the ones a later pass will doubt are
         written out.
         `--register-node left at its default of true` and `how most distributions bring a Node
         in` are the Nodes page twice over: "When the kubelet flag --register-node is true (the
         default), the kubelet will attempt to register itself with the API server. This is the
         preferred pattern, used by most distros."
         The name claim is that page too, whole: "The name identifies a Node. Two Nodes cannot
         have the same name at the same time. Kubernetes also assumes that a resource with the
         same name is the same object ... it is implicitly assumed that an instance using the same
         name will have the same state (e.g. network settings, root disk contents)".
         THE DNS SUBDOMAIN RULE IS DELIBERATELY UNSTATED, though the same page carries it. The
         card draws `Node-1` on the frame, in the chip and in every narration, which is T-07 and
         the catalog majority, and `Node-1` is not a valid DNS subdomain name. Stating the rule
         beside the drawing would make the card contradict itself, so the rule is left to the doc
         and the URL paths carry the real lowercase `node-1` instead, which is what
         cluster-node-failure already does on the same object.
         The four parts of status are the Node Status page: Addresses, Conditions, Capacity and
         Allocatable, Info, with "The kubelet gathers this information from the node and publishes
         it into the Kubernetes API". `naming the kernel, the runtime and its own version` is that
         page's Info list, "kernel version, Kubernetes version (kubelet and kube-proxy version),
         container runtime details, and which operating system the node uses".
         The label clause is two sources at once. The list a Kubelet may set is the
         NodeRestriction row of the admission page, which allows `kubernetes.io/hostname`,
         `kubernetes.io/arch`, `kubernetes.io/os`, `node.kubernetes.io/instance-type` and
         `topology.kubernetes.io/region` and `zone`, and forbids anything under
         `node-role.kubernetes.io/`, "restricted to prevent unprivileged nodes from self-declaring
         cluster roles". The Node Labels page is the other half, the preset list the Kubelet fills
         in. `hostname or a zone but never with a node-role` is one example from each side.
         `Its own labels sit on the object, not the status` IS THE CLAUSE THAT KEEPS STEP 3 FROM
         CONTRADICTING ITS OWN WIRE. The step draws one ball captioned `PATCH /api/v1/nodes/node-1/
         status`, and labels are `metadata.labels` rather than a status field, so a sentence
         reading `it sets its own labels too` under that caption credits them to the status write.
         The clause costs 22 characters and takes the step to 358 of the canon 360.
         `Ready False · KubeletNotReady` against `True · KubeletReady`. The documented half is the
         second: the Node Status page prints a healthy condition as `"reason": "KubeletReady",
         "message": "kubelet is posting ready status"`. `KubeletNotReady` is the Kubelet own
         counterpart reason and is NOT on any of the four pages, so it is the one string on this
         card taken from the implementation rather than from a doc.
         `healthy means everything a Pod needs on it is up, the runtime included` is the
         Nodes page, "If the node is healthy (i.e. all necessary services are running), then it is
         eligible to run a Pod", plus its own component list, "The components on a node include
         the kubelet, a container runtime, and the kube-proxy". The word `services` is avoided on
         purpose: the dictionary capitalises Service always, and the sentence is not about the API
         kind.
         `Ready False is what puts node.kubernetes.io/not-ready on the Node` is the taint page,
         "node.kubernetes.io/not-ready: Node is not ready. This corresponds to the NodeCondition
         Ready being False", and the NoSchedule effect on the chip is the same page under Taint
         Nodes by Condition, "The control plane, using the node controller, automatically creates
         taints with a NoSchedule effect for node conditions".
         `scheduling reads taints and not conditions` is that section verbatim in substance, "The
         scheduler checks taints, not node conditions, when it makes scheduling decisions. This
         ensures that node conditions do not directly affect scheduling".
         `takes no ordinary Pod yet` and `only a Pod that tolerates it lands here` are one clause
         paid for under T-20, and the counter-case is the reason the section exists at all: a
         DaemonSet Pod is created with a NoExecute toleration for `node.kubernetes.io/not-ready`
         with no tolerationSeconds, which is how a CNI plugin reaches a Node that is not Ready yet.
DO NOT   Write `holds every Pod off` anywhere on this card. It is a false absolute against the
         DaemonSet toleration above: the desc reads `keeps ordinary Pods off` and the ladder row
         reads `gates Pods`, and both are load-bearing.
DO NOT   Write `the status only it can see` either. The card claims nothing about who else may
         write those fields, because with an external cloud provider a cloud-controller-manager
         sets addresses and labels on the same object.
         `the not-ready taint is taken back off the Node` is PASSIVE on purpose. The taint page
         says "the kubelet or node controller can remove the relevant taint(s)", while the
         admission page says "kubelets are not allowed to update or remove taints from their Node
         API object". Naming either actor picks a side the sources do not agree on, and the Node
         object is where the taint sits either way.
         The two heartbeat intervals are the Node Status page, and the narration says `both of them
         defaults` because the page does: "The default interval for .status updates to Nodes is 5
         minutes" and "The kubelet creates and then updates its Lease object every 10 seconds (the
         default update interval)".
         `Alive is a separate question from Ready, and the Kubelet answers it on two clocks` makes
         NO claim about when the clocks start, and that is deliberate. The Lease is created at
         registration rather than at Ready, so a sentence putting the heartbeat after step 5 would
         be false, and the chip grid carries no Lease register for the same reason.
         `PUT lease renewTime · every 10s` is Update rather than Patch, the verb the kubelet
         nodelease controller uses, and it is the string cluster-node-failure already writes on the
         same renewal. The interval is the Node Status page default quoted above.
         `POST /api/v1/nodes` is the Node create endpoint from the API reference and not from any
         of the four cited pages, which name no verb at all. `PATCH .../nodes/node-1/status` is
         the verb the Kubelet really uses and the verb cluster-node-failure already narrates for
         the same write, "PATCHes Node.status every 5 min": the two cards agree by construction.
NAMING   `metadata.name` reads `not registered` and not `none`, because `none` on that chip would
         say the object exists with an empty name. Every other chip opens on `none`, which is the
         field being absent from an object that is absent too.
SCOPE    This card is the ENTRANCE to the section and hands off five subjects by name.
         The heartbeat STOPPING is cluster-node-failure: the unreachable taint, the grace period,
         the 300 second default toleration and the eviction that follows. Here the heartbeat only
         STARTS, in one step, and the last narration names that card.
         The Capacity minus reserved arithmetic is cluster-node-allocatable. Here `status.capacity`
         is one field the Kubelet publishes and nothing is subtracted from it.
         Taint effect semantics are cluster-taints-tolerations: NoSchedule against PreferNoSchedule
         against NoExecute, how a toleration matches, and tolerationSeconds. Here
         `node.kubernetes.io/not-ready` is one taint that is present and then gone.
         What the Kubelet does once it HAS Pods is cluster-kubelet-reconcile-loop. The Pod that lands on
         the last-but-one step is the payoff of Ready turning True and nothing more: no sync, no
         CRI call, no probe.
         Manual Node administration with `--register-node=false` gets no step and no clause. The
         card states the default and says what it means (`rather than waiting for an operator to
         create the object`), which is the whole of what a reader needs to know here.
WHY NOT  A Scheduler box, so the taint step could say what reads the taint. There is nowhere to
         put one: the API is pinned on CX at 484..716 for the straight drops, the Lease holds
         820..950, and what is left in the top row is 397..484, 87 units. The narrations are
         written so that no undrawn actor is ever named, which is what T-21 asks for and is why
         step 4 reads `scheduling reads taints` rather than naming the component.
WHY NOT  The Lease dropped into the free 420..640 column at a second tier, with a straight riser
         from the frame. It fits and it costs the top row its second block, leaving an API alone
         over a full-width frame, and it puts a cylinder 23 units off the panel edge at its widest
         viewport. The 820..950 slot is where the sibling that finishes this story keeps it.
NOT A DEFECT
         `regLane`, `bindLane` and `leaseLane` are addressed by nothing that names them: their keys
         are built inside the `shades()` factory body, which no source scan follows. `chain` is
         addressed by the `chain:` field, which `step-spec.js` resolves as `s.refs.chain`. The
         sweep reports none of the four, it lists them as kinds not addressed by key.
NOT A DEFECT
         The `call` register is written at step ENTRY while its ball is still in flight, unlike the
         chips beside it, which are wound back and turned over on arrival. A wire label names the
         payload the lane is CARRYING, which is true for the whole flight, where a chip reports a
         value the object does not hold until the write lands. That is the catalog form, and the
         one card that winds a wire back (cluster-image-container-gc) does it because its
         label holds a reading that has been REPORTED, which is an arrival and not a payload.
```

### poster

```
Sentence: nothing knows this machine until it writes itself into the API.

GHOST ZONE TO SOLID, redrawn 2026-08-28. Left, an 80 x 76 block dashed 4 3 at fill 0.02 and opacity
0.6, EMPTY: the machine the cluster has not heard of, and the emptiness is the sentence rather than an
unfinished block. One dashed leg at 0.55 crosses the 48 unit gap on the shared midline y 90. Right, the
Node object at 146 x 100, the heaviest thing on the canvas at fill 0.10 and stroke 2, holding three
field bars of 112, 88 and 64 wide, the newest at the 0.9 accent and the two under it at 0.3. The falling
widths read as a record being written rather than as a row of slots, and the accent on the TOP bar is
what makes the frame a thing being filled in rather than a thing that was always there.

WHY the sentence moved. The poster this replaced was THE WALL: the Pod, an upright 0.9 bar and the Node
object, saying that the object exists and one bar still stands between it and a Pod. That is the second
half of the desc and it needs the reader to already know the taint is there, so the tile asked its
question in a vocabulary only the card teaches. The desc OPENS on how a machine turns into a Node, which
is what this draws, and `R-02` puts the poster on the question.

THE ADJACENCY ARGUMENT IN THE OLD NOTE IS DEAD, and it is worth saying so rather than deleting it: every
line of it turned on `cluster-node-drain` sitting beside this card in the grid, which it no longer does.
The neighbours are `cluster-image-container-gc` and `cluster-node-conditions` (2026-08-28), and the
comparison to make now is against those two. The dashed block here holds NOTHING, where
`image-container-gc`'s dashed tile holds an X and `node-conditions`'s holds a bar, so the three dashed
rectangles in this corner of the grid each say a different thing: deleted, refused, unknown.

DASHES ARE SPENT ON THE MACHINE AND ON THE LEG, and nowhere else. The old note banned them outright
because a dashed Pod would have read as dying beside `node-drain`. With that neighbour gone the dash goes
back to its house meaning, not real yet (`R-06`), which is exactly what a machine no object names is.

REJECTED, and both were offered against this one. The self-loop: the machine low and centre with one leg
up into the API and a second back down into itself, the newest row in the API accented. It says the
better known half of the card, that the registrar and the registered are the same machine, and it is a
good picture of it. It lost because the loop needs three elements and two turns to say what the straight
leg says with one, and at 200px the two legs read as routing. The form with one line blank: four field
rows, three filled and the fourth an empty slot, with the not-ready taint clipped to the frame as the
accent. It draws the SAME sentence the wall drew and inherits the same problem, that the blank line is
the subject and a blank cannot carry an accent.

STILL REJECTED from the earlier pass, do not rebuild any of them to find out. A row of three peers
gaining a dashed fourth: `cluster-image-container-gc` owns the row grammar in this grid and is now the
tile directly above. A four bar stack with the top layer missing: that is
`cluster-pod-cgroup-hierarchy`'s indent ramp in the same category. Two zones compared, the same Node
drawn twice with the bar and then without: it says the wall's sentence at twice the cost.
```

