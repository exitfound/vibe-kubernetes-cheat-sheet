## network-policy

### layout

```
WHAT     The one legitimate exception to the flat promise this section opens with: nothing restricts
         a Pod until a NetworkPolicy selects it, and from that moment a connection has to clear a
         checkpoint at each end, the egress of the sender and the ingress of the receiver, taken
         independently and knowing nothing about each other.
LAYOUT   One road, dead straight, from web-1 to db-1, with a BAR standing on it at each end and a
         branch to cache-1 leaving it before the first bar. A bar is a labelless block 44 x 100
         drawn ON the road, and the ball that a bar refuses dies INSIDE it: the two refusals happen
         at two different x on one line, which is what the card is about and what no sibling here
         draws. The nearest named relative is the fan, run for what a fan usually hides: the two
         legs exist so one destination can be refused at the receiver and the other at the sender.
         cache-1 carries no bar on any step, which is the drawing of a Pod no policy ever selected.
         A bar stands OUTSIDE the Pod face, on the road, and that placement is the card: it is what
         gives a refusal a visible size, and no reader has to find a mark inside a block to see the
         thing the title names.
PANEL    `OVERLAY_IDS=network-policy node --test report/overlay.test.mjs` from `scheme/test/`.
         1600x1000 right 290.77, bottom 142.56..177.44. 1280x860 377.76, bottom 171.42..213.92.
         1100x800 396.55, bottom 204.97..254.66, deepest on `implementer`, whose narration is the
         longest at 357 characters. Nothing at all is drawn left of x=420 above y=330, so the panel
         pins exactly one number, the web-1 top face at SRC_Y 330, clearing the deepest bottom by
         75.34 (`L-08`).
SIZES    Every Pod and the plugin take the 232 of `NET.L-01`. A bar is 44 x 100: POD_H tall because
         it stands across the whole road rather than beside it, 44 wide because that is a ball plus
         clearance either side so a ball dying in it reads as stopped rather than as parked, and
         labelless because the road runs through the middle and `box()` centres its strings there.
         What names a bar is a caption riding 14 above it, written on exactly the steps the bar is
         drawn on. The two policies take 180: at 232 the ingress object would run past SCHEME_R,
         and the two match each other because two objects of one kind at two widths read as rank.
LANES    BAR_RUNUP 100 is the one number here that was measured against motion rather than against
         ink. Flush on the sender face the egress refusal is 22 units of travel, which reads as a
         ball that never fired. At 100 it is 122 units, floor-bound by `M-13` to PKT_DUR_MIN 700ms,
         which is the house reading for a short hop and shared with `workloads-container-states`.
         The two lanes leave the web-1 right face as an L-12 mirrored pair at FLOW_Y plus and minus
         12, and db-1 sits 12 low so the road lands on its face midpoint with no jog anywhere on
         it. LANE_DB is 656 units, LANE_CACHE 496.
         Both roads carry a point at the CENTRE of every bar they meet. The points are collinear
         so the drawn line does not move by a unit, and L-10 then reads the road as terminating
         on each checkpoint instead of running past one. This is not a dodge of the rule:
         `crosses()` stops at an endpoint inside the rect because an endpoint inside a block is
         an arrival, and a checkpoint IS what the traffic arrives at. Without them the road is
         three crossings, and the render check carries no exemption table, only the unit one.
MOTION   Two of the six steps end with the receiver NOT pulsing, and that absence is the verdict. On
         `isolate` the ball reaches IN_CX 806, ripples inside the bar and no further ball leaves. On
         `either-side` the ball dies at EG_CX 394, 122 units out, and cache-1 is never touched even
         though cache-1 is the Pod that would have taken it. `implementer` is `open` again to the
         pixel under the two objects that stayed bright, which is the whole claim of the step.
         `either-side` runs 2060ms of motion inside a 3400ms hold, and the run-up is what buys the
         refusal a journey long enough to read.
         On `isolate`, `allow`, `both-ends` and `either-side` the verdict reads `in flight` from
         entry and turns over with one `F.set` on the arrival or the drop that decides it: `send`
         on the first three, `stop` on the fourth. The rule chips stand from entry, because the
         policy object is applied before the call leaves and the bar is drawn from entry too.
CONTENT  Every claim here is read against k8s 1.35 and the two pages the catalog entry cites.
         `db-ingress` is the upstream default-deny example, `podSelector: {}` with Ingress in
         policyTypes and no ingress rules, narrowed here to role=db so one Pod is isolated and its
         neighbour is not. Narrowed, it is a deny-all for role=db and not a namespace default, which
         is why nothing on the canvas calls it one. `allow` then adds ONE rule to that same object
         rather than landing a second policy, because the union across policies is a different
         subject and SCOPE puts it outside this card.
         The absolute `everything the policy does not explicitly allow is dropped` is carried rather
         than qualified, in the desc, in `isolate` and in the aria-label. Its one counter-case is
         upstream and is the traffic SCOPE puts outside this card: `the only allowed connections
         into the pod are those from the pod's node and those allowed by the ingress list`. The
         closing summary the page itself reaches for is `deny by default, with only the ability to
         add allow rules`.
         `either-side` says the call dies in the boundary it has to leave through. The page rules on
         whether the connection happens and not on where a plugin enforces it, so the sentence is
         written about the verdict and not about a hook. A sentence saying the packet never reaches
         a wire has no support on either cited page and is not written.
SCOPE    The verdict, and not the selector menu. namespaceSelector, ipBlock, ports and the
         always-allowed traffic to and from the Node a Pod runs on are named nowhere and drawn
         nowhere. Owned by nothing in this section: that policies are additive, never conflict, and
         that evaluation order cannot change the result. It is a real absence in this
         section and the candidate 13th card, not something a sibling covers. The flat promise is
         `network-model`, the FORWARD hook an iptables implementation drops in is
         `network-netfilter-path`, and the dataplane that would do it without iptables is
         `network-ebpf-dataplane`. No address appears on this card at all: a NetworkPolicy is
         evaluated on labels and directions, and `network-ipam-pod-cidr` owns the addresses.
NOTE     The plugin reaches each bar with one short dashed link and neither link detours. PROG_EGRESS
         is a 40 unit riser at EG_CX off the plugin top face. PROG_INGRESS leaves the SIDE face and
         runs at PLUG_CY 512 from 524 to 806 before rising, because the corridor at that height is
         empty and the corridor between the road floor at 430 and the bottom band at 476 is empty
         too. Each link is the MIN of the plugin and the bar it programs, so on `open` there are no
         links at all: a link into a bar that does not exist points at nothing.
WHY NOT  A verdict drawn INSIDE the Pod face, as a 10 unit labelless sliver at each end. Ten units is
         under the ball diameter, so at true size neither sliver reads as a thing the traffic meets,
         and the card loses the one event its title names. The bar on the road is 44 x 100 for that
         reason.
         A `rewind` that holds the PREVIOUS verdict, which is what the category exemplar does. It
         stands beside a rule chip that changed at entry, so on `isolate` the strip would read
         `allows nothing` and `allowed` at once for the 2.2 seconds the ball travels. `in flight`
         is the neutral value that contradicts no rule chip while the call is still on the road.
         A string inside a bar. The road runs through the middle of it and `box()` centres its label
         and sublabel there, so any string would be cut by the lane. Moving the road off centre
         needs a 170 tall bar to clear the ink, which collides with the bottom band.
         Two disks, the one composition lever this section has never used. The subject has no
         persistence in it, so taking it would be decoration. This section has exhausted its lever
         vocabulary at twelve cards and every other lever is carried by a sibling, so the bar as
         written can only be met by making the picture worse, and it is left unmet. What carries the
         differentiation instead is a ball dying inside a drawn block that is not its destination,
         at two different points of one road, which no sibling here does. The signature
         `box5 pod3 node0 chip3 cyl0 chain0 raw0` is shared with nothing in the catalog.
DO NOT   Close BAR_RUNUP to put a bar flush on the face it belongs to. It looks tidier and it costs
         the egress refusal its entire journey: 22 units is under the ball diameter.
         Remove either lane waypoint at a bar centre. The line does not move and the render geometry
         check goes red with no exemption table to file it in.
OPEN     R3 fires twice, on `isolate` and `either-side`, and both are filed in
         `test/fixtures/carried.mjs`. A bar is lit on all four steps it is drawn on, including
         the two where a packet passes through it and nothing lands. R3 sees only the two where a
         route ENDS at it, and going dark on exactly those would dim the subject at the one
         moment it acts. P-03 lists six rows on this card in `report/chip-beat.test.mjs`, all
         carried in `test/fixtures/carried.mjs`: the three absences on `implementer` under FORM-B,
         and the three rule chips on `isolate`, `allow` and `both-ends` under FORM-E, since each
         stands at entry beside the verdict that waits for its arrival.
```
