## network-pod-to-pod-cross-node

### layout

```
WHAT     A packet from a Pod on one Node to a Pod on another, over the physical underlay.
LAYOUT   The Pod and dataplane blocks are spaced so the veth wire label fits in the gap without
         touching a block, while the dataplane box stays inside the Node: the gap is 92 units
         against a label that inks 75.8 at 1600x1000, 69.3 at 1280x860 and 67.5 at 1100x800, so
         the string stands 8.1 clear of a block face either side at its tightest. Quote the widest
         reading: a glyph inks MORE viewBox units the wider the dialog gets, so the narrow
         viewport is the flattering one, and the sibling `network-pod-to-pod-same-node` records
         this same string at 75.8. The two Node frames are mirrored about x=600 and so are the two
         drop points, CNI1_X 445 and CNI2_X 755.
         POD_W 180 and CNI_W 150 depart from the 232 of `NET.L-01` under its third overrule, the
         row the blocks are SIZED BY, and the arithmetic is the frame. The mirrored pair leaves
         each Node 470 wide (70..540 and 660..1130 about x=600, with 120 between them for the
         underlay to cross), and the actor row inside one frame is Pod + 92 + dataplane: 232 + 92
         + 232 is 556, and even 232 + 92 + 150 is 474, both wider than the 470 the frame has.
         180 + 92 + 150 is 422, which leaves 28 inside the frame at the Pod end and 20 at the
         dataplane end.
PANEL    Deepest at 1100x800 on `routed`: `OVERLAY_IDS=network-pod-to-pod-cross-node node --test
         report/overlay.test.mjs` from `scheme/test/`. It reads 254.66 there, against 213.92 at
         1280x860 and 177.44 at 1600x1000, and the right edge is 396.55. NODE_Y 255 is a measured
         literal against that reading and not a derivation: both frames open at x=70, left of the
         x=420 that `L-03` guards, so the frame label at NODE_Y + 18 inks from y=262 and clears the
         panel by 7.34 units. Pod A opens at y=315 and clears it by 60.34, and everything the flow
         touches sits at VETH_Y 373 or below.
LANES    The dataplane-to-dataplane link is ONE continuous turning path (cni1 bottom to underlay to
         cni2 bottom), not three arrows, and both ends sit on block bottom EDGES so the ball never
         travels under a dataplane box. The short veth hops are linear `F.segment`s, while the
         cross-underlay leg is an `F.route` over the SAME UNDERLAY_PATH array that drew the lane.
         THIS LANE BREAKS `NET.A-02` ON PURPOSE. The rule says no wire and no ball crosses a Node
         border: a ball stops on the frame edge and the Pod inside pulses. UNDERLAY_PATH starts at
         the dataplane bottom edge INSIDE Node-1, drops through the Node-1 frame floor to y 530,
         crosses, and climbs back through the Node-2 floor into the remote dataplane, so it cuts
         TWO borders on one lane, which nothing else in the category does. It is not the only
         crossing here: `network-ipam-pod-cidr` runs ridden allocation lanes from the controller
         down into all three of its Node frames, and `report/frame-face.test.mjs` prints two of
         them under INTO THE INTERIOR. That report never names THIS lane, because it reads a lane
         that starts outside a frame and ends inside one, and this one starts inside: the break is
         invisible to every machine in the tree and lives or dies on this block.
         `network-internal-traffic-policy` draws the compliant version of the same journey, with its
         cross-node leg leaving the Node-1 BOTTOM EDGE and landing on the Node-2 bottom edge, and
         that shape is wrong HERE: the subject of this card is which component wraps and unwraps
         the frame, so the two dataplane boxes have to be the endpoints. Stopping at the frame
         would leave the encap and decap steps pointing at a border.
MOTION   The journey is three wire-only hops, each ending on a block face with the next starting
         from ANOTHER face of the same block, so the ball visibly enters a dataplane box and
         re-emerges where the next leg leaves it: the veth lands on the left face of cni1 and the
         underlay leaves its bottom, and on Node-2 the underlay lands on the bottom of cni2 and
         the veth leaves its right. It is never the opposite face, because the journey does not
         use it, and what the rule is actually holding is that nothing is drawn travelling under
         a box. No hop carries an explicit `dur`: a veth leg is 92 units, floored to 700ms by
         `M-13`, and the 560 unit underlay leg runs the canon 0.45 units per ms.
         `route` 2900 and `encap` 3200 are sized on READING and not on their motion, which needs 2060
         and 1804. Held to their motion they would read 7.25 and 5.73 ms per character, which
         `.claude/skills/card-review/tools/timing.mjs` places among the most hurried steps in the
         catalogue. At 2900 and 3200 they read 10.21 and 10.16 and stand still for 840 and 1396ms
         once the ball has landed. Where those two readings sit against every other step is a
         question for that tool and for `deadair.mjs` beside it, which are their one home.
WIRE LABELS
         Both veth lanes are DRAWN on every step, so both name themselves on every step, poster
         included, through the one `VETH` constant. They label what the LANE is and not what any
         step sends over it: a lane named on two steps of five reads as a lane that stops being a
         veth on the other three. The underlay wire is the opposite kind and is written per step,
         because what rides it is exactly what changes between `encap`, `decap` and `routed`.
CONTENT  Every claim on the card is read against k8s 1.35 and the four pages the entry cites.
         The two boxes are `CNI dataplane` and NOT `cni0`. The bridge plugin creates cni0 so that
         "All containers (on the same host) are plugged into a bridge (virtual switch) that resides
         in the host network namespace", and a virtual switch neither wraps a frame nor reaches a
         second Node. What wraps it is the in-kernel overlay device the plugin adds beside the
         bridge ("Use in-kernel VXLAN to encapsulate the packets"), and a routed Calico install
         draws no bridge at all, so one box standing for the whole Node dataplane is the only label
         true on all five steps. `cni0` is rejected HERE even though the same-node sibling draws
         what looks like the same block as `cni0 / L2 bridge`: there the box IS the bridge.
         The route step says the frame leaves because the destination is OFF-SUBNET and never
         because the bridge has no port for it. The Pod default route points at the bridge address
         (`isDefaultGateway` "makes the assigned IP the default route"), so the route lookup decides
         an off-subnet destination and the bridge forwarding table is never consulted for it. The
         port wording is rejected in the `desc` for the same reason it would be rejected in a step.
         The decap step reads `the same last hop a same-node frame takes` and not `exactly as a
         same-node frame would be delivered`: only the last hop is shared, because a same-node frame
         is switched inside the bridge with no route lookup while this one is routed out of the
         overlay device into the bridge first.
         The `outer` and `encap` chips TRACK the packet, so both read `none` until the wrap exists,
         decap flips them to `stripped` and `none`, and `routed` returns `outer` to `none`: an outer
         header named on a step whose own `encap` chip reads `none` states a header the packet does
         not have, in either direction. `pod IPs routed` in that slot is rejected for stating an
         outer header on the one step whose own wire label reads `no outer headers`. `stripped` and
         `none` stay two values on purpose: one says a wrap was removed, the other that none was
         ever made.
         A chip is CUED on the step where the fact it reports moves, and on no other. `inner src/dst`
         therefore never lights: reading the same string from the poster to the last step is the one
         thing every narration on the card says about it.
         `.1.5 -> .2.7` is an abbreviation the chip forces and not a style. The chip is 250 wide and
         `inner src/dst` beside `10.244.1.5 -> 10.244.2.7` inks past what `P-07` leaves, so the full
         pair cannot stand there. Both prefixes are drawn twice over anyway, on the two Node frame
         labels and on the two Pod sublabels.
         `Node-1 -> Node-2` in the `outer` slot names the Nodes and not their addresses because no
         Node IP is drawn anywhere: the frame label carries the podCIDR, and the narration one line
         away says the outer headers are Node IPs.
         `dport 8472 for flannel` names the plugin because the port is a plugin choice. Flannel documents
         it as "On Linux, defaults to kernel default, currently 8472, but on Windows, must be 4789",
         against the 4789 IANA registers for VXLAN.
         The routed step advertises `the Pod subnet of each Node` and not `each Node podCIDR`:
         Calico allocates its own IPAM blocks and advertises those, so naming the `spec.podCIDR`
         field would claim a mechanism only a `usePodCidr` install uses.
         The underlay wire label on `decap` describes the packet that arrived over that lane rather
         than a ride of its own, and that step is the one where the lane carries no ball.
WHY NOT  Dropping the two Node frames alone to clear the panel fails on the underlay. At NODE_Y 255
         the frame floor is 485, and with UNDERLAY_Y left at 495 the horizontal underlay run would
         sit 10 units below that floor, close enough to read as a second frame edge rather than as
         the physical network. Pinning the frame tops and shrinking the frames instead costs height
         the two Pods and the dataplane row inside them are using. The whole stack therefore moves
         together, all six bands on one 35-unit offset, which puts the chip strip at 607 on a 640
         canvas against the 612 the same-node sibling ends at.
NOT A DEFECT
         `report/chip-beat.test.mjs` lists six FORM-B rows for this card, on `encap`, `decap` and
         `routed`. Each of those values is a PREMISE of its step and not a product of the ball drawn
         in it: the wrap and the strip both happen inside a dataplane box before anything departs
         it, and the routed mode is the condition the last step opens with. Binding them to an
         arrival would post the header change after the packet that already carries it. All six are
         filed under axis `FORM-B` in `test/fixtures/carried.mjs`, one entry per row with the
         measurement behind it, so the report prints them marked CARRIED and keeps them out of the
         by-card tally. That file is the ruling, this block is only the pointer to it.

         The `physical network` tag sits at `UNDERLAY_Y - 14` and its ink is widest at 1600x1000,
         544.9..655.1 x 504.8..519.4, and lowest at 1100x800, 550.9..649.1 x 505..519.7. The lane
         runs at y 530 and the packet radius is 5, so at the worst of the three viewports the ball
         passes 5.3 units clear of the tag ink and never touches it. The tag names the medium
         the lane IS rather than a block standing on it, which is why it rides that close, and it is
         placed off `UNDERLAY_Y` so the tag and the lane never separate.
```
