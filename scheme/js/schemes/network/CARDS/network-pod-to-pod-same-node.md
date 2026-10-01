## network-pod-to-pod-same-node

### layout

```
WHAT     Two Pods on one Node reaching each other: same podCIDR so the destination is on-link, ARP
         through the cni0 bridge, an entry written into the forwarding table, then one switched hop
         at layer 2 with no NAT and no encapsulation.
LAYOUT   A mirrored pair about MIRROR 600, the frame centre, with the bridge ON that axis and the
         forwarding table hung directly under it. Every block is placed against MIRROR and none is
         positioned by hand, so the two veth gaps are 102 apiece. They have to be equal: the card's
         claim is that its two halves are one journey reversed, and an unequal pair draws two
         different journeys.
         THE FORWARDING TABLE IS THE COMPOSITION. It is what turns the ARP exchange into a
         consequence the picture can show, and it is the element no sibling in `pod-networking`
         carries. Without it the cast is the cross-node card with a Node removed. `kin.mjs` does not
         see it: an extra box is not one of its levers, so it reports `frame strip deep`, all three
         shared, and an empty `levers no sibling has` line. The signature `box2 pod2 node1 chip4` and
         the four bands `255,315,345,470` are unique in the section and are what carry the answer.
         The frame is NOT centred on the Pod axis. Its top is pinned by `L-03` and its height is
         derived off the table, so it grows DOWNWARD only.
PANEL    Deepest at 1100x800 on step `arp`, 229.82, and shallowest 125.11 at 1600x1000:
         `OVERLAY_IDS=network-pod-to-pod-same-node node --test report/overlay.test.mjs` from
         `scheme/test/`. The Node frame opens at x=80, so `L-03` binds it and NODE_Y 255 stands
         25.18 clear of that deepest reading. The frame label prints at (92, 273) and clears the
         panel on every measured viewport. The band above the frame right of x=420 stays empty and
         cannot be used: that is the house constraint in `scheme/CLAUDE.md`, not a gap in this card.
SIZES    Pods, bridge and table all take 232, the category default (`NET.L-01`), and none of that
         rule's three overrules reaches this card. The 232 Pods leave 102 in each veth gap against a
         wire label measured at 75.8 units, so the label stands 13.1 clear of a block face either
         side, where `network-pod-to-pod-cross-node` ships the same label in a 92 gap on 8.1. The
         forwarding table entry inks 192.9 in the 232 box, 503.5..696.5, so 19.5 clear a side, and
         both rows are 32 characters so neither is wider than the other. The box LABEL carries the
         row count and is therefore three strings: `Forwarding table` inks 99.1, and the longest,
         `Forwarding table · 2 entries`, inks 159.4 at 520.3..679.7, 36.3 clear a side. Nothing in
         the suite measures a wire label (`L-19`), so both
         readings come from `extents.mjs` and are re-taken by hand. The chip strip spans the frame
         edge to edge, 250 250 250 230 with three 20 gaps, each width sized to its own longest
         value.
LANES    The veth pair is TWO directional lanes symmetric about the block centre (POD_MID 380,
         half-gap 12), so A to B (the ARP request and the data frame) and B to A (the ARP reply)
         never share a wire.
         ALL FOUR LEGS TAKE ONE TREATMENT, THE ROUTE, because every one of them carries a ball on at
         least one step: the top pair on the ARP request and again on the data frame, the bottom pair
         on the ARP reply. Each is a `P.arrow` in the category cyan `rgb(79, 229, 255)` at
         stroke-opacity 1, dashed `5 5`, stroke-width 1.4, with the network arrowhead, and identical
         on every step and at every viewport. The axis that quiets them is WEIGHT: `dim` sets the
         1.4 and keeps the hue.
         THE CARD HOLDS NO RELATION, and the forwarding table does not get one either (`NET.A-04`).
         Every line here is ridden, so nothing qualifies for recession: at 0.45 a leg would paint
         `rgb(41, 117, 132)`, contrast 3.36 against the dialog ground `rgb(10, 26, 32)`, where the
         route paints the full `rgb(79, 229, 255)` at contrast 11.84. The hierarchy the card wants
         runs between the LANE and the BALL riding it, not between one lane and another, so every
         lane is the same brightness and the moving packet is what stands above it. What says the
         table belongs to the bridge is the shared x extent 484..716 plus the adjacency, which costs
         no ink at all. No leg resolves `--diag-arrow-dim` `rgb(53, 125, 140)`, contrast 3.78, which
         would drop the hue from the stroke and the arrowhead both (`A-22`). Arrowheads are right
         here on all four (`A-05`): each leg is one-way and a ball crosses it.
MOTION   Five declared steps. `onlink` is the one with no packet: the routing decision happens inside
         A before a frame exists, so both Pods pulse TOGETHER, which is the claim that they are peers
         in one subnet. The ARP exchange is a full round trip, the request A to bridge to B and the
         reply back along the other lane, which is the distinction the lane pair exists to show.
         NO HOP CARRIES AN EXPLICIT `dur`. A leg is 102 units, which `routeDur` would run in 227ms
         and floors at PKT_DUR_MIN 700 instead (`M-13`), so every ball takes the length its geometry
         gives it and the card declares no pacing deviation: it is absent from the `PACING` registry
         in `render/motion.test.mjs`. `pace.mjs` measures all six at 0.146 u/ms, under the
         `PKT_SPEED` canon of 0.45. That is `M-13` catalog-wide rather than this card: most of the
         catalog rides the same floor. `pace.mjs` holds the population and the median, and this
         record does not restate either.
         NOTHING THIS CARD CHANGES IS LIT FROM STEP ENTRY, on any of the four narrated steps. Every
         value a step writes is rewound and played back on the beat that causes it: the datapath chip
         and the first table row when the request is inside the bridge, the second row when the reply
         crosses it, and on the two packet-less steps the value the step concludes with. Lighting any
         of them at entry points at a value the step has not written yet, which is what
         `report/arrival.test.mjs` FORM-B counts. `src` and `dst` are the exception and the reason is
         the opposite one: they are lit from entry on `no-nat` because they have not moved all card,
         and that is the claim.
         A PACKET-LESS STEP CARRIES ITS CONCLUSION AS A BEAT, `SETTLE` 1000ms before the step ends.
         `BEAT.afterPulse` is 800 and a Pod pulse rings for `PULSE_POD.ms` 900, so a value cued at
         `afterPulse` is swallowed by the pulse and the whole step is over at 900ms, which stands
         `onlink` and `no-nat` still for 68 and 65 percent of their length. Landing the conclusion at
         `duration - SETTLE` gives the reader the premise, the beat and a full second holding the
         result, and `deadair.mjs` reads 40 and 37 percent against a catalog median of 42. Neither
         step carries a packet, because neither narrates one.
CONTENT  The MAC drawn in the forwarding table is an EXAMPLE and the card claims nothing about how
         it is formed. `0a:58` plus the four IP octets, the shape commonly attributed to a Pod MAC,
         is not in the bridge plugin: a code search over containernetworking/plugins finds it only as
         one fixed literal in `pkg/ip/link_linux_test.go`, and `bridge.go` takes whatever the kernel
         gives the veth unless CNI args override it. What is drawn is a valid locally administered
         unicast address and nothing more. Both host ends are drawn at eight hex digits,
         `vethb3f8a2c7` for Pod A and `veth7c41d9e8` for Pod B, which is what upstream
         `RandomVethName` produces: `fmt.Sprintf("veth%x", entropy)` over four bytes.
         `network-pod-ip-and-veth` spells Pod A's the same way, so one object has one spelling across
         the section.
         THE CARD RESTS ON THREE SOURCES AND `Cluster Networking` IS NOT ONE OF THEM. That page holds
         no occurrence of veth, bridge, ARP, cni0 or podCIDR, and it redirects the network model to
         `/docs/concepts/services-networking/`, which is where the two sentences the card rests on
         live: `All pods can communicate with all other pods, whether they are on the same node or on
         different nodes` without `proxies or address translation (NAT)`, and `Each pod in a cluster
         gets its own unique cluster-wide IP address`. The veth pair, the `cni0` default and the
         address sitting on the container end come from the CNI bridge plugin page.
         The ARP flood is worded `every port but the one it arrived on`, which is the bridge rule and
         holds whatever the port count. `every other port` overclaims on a Node holding two Pods,
         where there is exactly one other port.
         THE NO-NAT CLAIM IS QUALIFIED BY WHAT THE PACKET IS ADDRESSED TO. `Traffic addressed to a
         Pod IP is never rewritten` takes the qualifier from the counter-case rather than from a
         hedge: a packet sent to a Service ClusterIP on this same Node IS rewritten, which
         `network-service-clusterip` and `network-conntrack-nat` draw. Bare `Same-node traffic is
         never rewritten` is rejected for standing as a false absolute over those two cards
         (`T-19`, `T-20`).
         `The route A finds for it carries no gateway` is the wording step `onlink` takes, because
         the route lookup IS what returns the on-link answer. `A makes no routing decision` is
         rejected: it is false, and it contradicts this record's own MOTION block, which rests the
         packet-less step on that decision happening inside A.
         THE BRIDGE LEARNS TWICE AND THE TABLE SAYS SO. A Linux bridge learns a source MAC off every
         frame it receives, so the request teaches it the port A sits on a beat before the reply
         teaches it B. `arp` therefore writes the table on BOTH arrivals, and the box LABEL carries
         the row count while the sublabel spells out the newest row: `1 entry` with A at the request
         arrival, `2 entries` with B at the reply. Spelling out one row and swapping it for the other
         with no count is rejected: it draws a table that FORGETS an entry, which is a worse claim
         than the one it fixes. A single sublabel holding both rows is rejected on width, one row
         already inking 192.9 of the 232 box.
         A MAC is `6a:c2:0f:91:3d:e4` and the port `vethb3f8a2c7`, which is the host end
         `network-pod-ip-and-veth` draws for the same Pod A at 10.244.1.5, so one object has one
         spelling across the section. Like the row for B it is an example: a valid locally
         administered unicast address and nothing more.
SCOPE    This card owns the PATH between two Pods on one Node. What a veth pair physically is, which
         end holds the address and what the host end attaches to belong to
         `network-pod-ip-and-veth`, and this card draws the pair as two lanes and names it only in
         the wire label. The inter-Node hop, the overlay and the routed plugin belong to
         `network-pod-to-pod-cross-node`, which is why no physical NIC is drawn here even though step
         `forward` names one. Traffic leaving the cluster belongs to `network-pod-egress-snat`, and
         the flat-address promise as a subject of its own to `network-model`.
NOTE     The Node frame carrying the subnet CANNOT be cued. `diagrams.css` has no `.highlight` rule
         for `.scheme-node`, so naming `nodeEl` in a `lit` list renders nothing and fails silently,
         which is the catalog-wide constraint in `scheme/CLAUDE.md`. Step `onlink` rests its subnet
         claim on the two Pod pulses and the datapath chip instead.
WHY NOT  A `src` and `dst` readout that moves. Both chips hold one value each on all five steps, and
         that is the point: the card's last claim is that neither address is ever rewritten, and a
         readout that never moves is what makes `none · src preserved` mean anything when it lands.
         Hoisting the two wire strings into one `wires: WIRES` constant and writing that on every
         step. No other card in the catalog does it, and `statics.mjs` reads the literal rather than
         the reference, so both lanes come back as BLANK-WIRE on every future run: two false findings
         a reviewer has to re-adjudicate, bought for four saved lines.
NOT A DEFECT
         The three `report/arrival.test.mjs` R2-ENTRY rows on the datapath chip are ruled where the
         file that prints them can read the ruling, `test/fixtures/carried.mjs`, and they come back
         marked CARRIED with the reason attached rather than on the queue. One per step that rewinds
         the chip, which is every step that writes it.
         `statics.mjs` reports a double space in the frame label `Node-1   ·   10.244.1.0/24`. The
         three-space padding around the middot is the house spelling: six occurrences catalog-wide,
         this card owning one, and four of the other five are node labels,
         `network-pod-to-pod-cross-node` twice plus `network-pod-egress-snat` and
         `network-packet-classification`.
```
