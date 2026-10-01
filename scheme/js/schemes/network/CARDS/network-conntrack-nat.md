## network-conntrack-nat

### layout

```
WHAT     The conntrack ENTRY as the protagonist: what it holds, what it costs to create, and what it
         saves every packet after the first.
LAYOUT   netfilter is the hinge, with the COST above it and the MEMORY below, and both bands centred
         on NF_CX 600 so their ownership stubs are straight verticals, 73 units each way, so
         the hinge reaches equally far up and down. Both band captions sit on that same spine, and
         neither is left-aligned to the band it names. Four bands: the NAT rule ladder at 102..214, the
         client-netfilter-server corridor at 268..378, the conntrack entry at 432..512, the chip
         strip at 566..600. The entry is two rows read as one record rather
         than a summary line, because the two tuples ARE the data structure the card is about, and
         the two relations leaving them say whose view each tuple is: `original` is what the client
         sent, `reply` is what the backend sends back. That is the lever no sibling in this section
         carries, four `P.relation` lines with no traffic on any of them.
PANEL    Deepest 229.82 at 1100x800 on `fastpath`, the longest narration: `OVERLAY_IDS=network-
         conntrack-nat node --test report/overlay.test.mjs` from `scheme/test/`. POD_Y 268 clears it
         by 38.18, and the ladder is clear of the panel horizontally instead, RULE_X 475 against a
         right edge of 396.55. The panel travels 105.78 units across the viewport set on this card
         and swings 69.82 within `fastpath` alone, which is why the corridor is pinned to the
         narrowest reading and not to the widest.
SIZES    netfilter is 232 by 80: 232 is NET.L-01, and 80 is the Kubelet box on `network-model`, the
         other block in this section standing alone over a band. Both Pod shells are 232 too. The
         ladder takes the strip cell exactly, CHIP_W by CHIP_H, so the rows above netfilter and the
         readout below it are one family at one size, and the rungs are worded to fit that cell
         rather than the cell widened to fit them. MEASURED with `getBBox` at 1600x1000, which is
         where the diagram text inks widest because it does not scale with the viewBox the way the
         panel does: right clearance 12.6, 47.1 and 26.4 units inside the 250 cell, against a
         `render/chipfit.test.mjs` MIN_GAP of 4 and the card's own tightest strip pair at 12
         (`backend` against `10.244.2.7:8080 · pinned`). Never measure this off a screenshot or off
         a client rect: a CSS-pixel reading scaled by the viewBox ratio reads 253 for a rung that
         inks 234, because `xMidYMid meet` letterboxes the root. The entry is 480, wide enough that
         a row cannot be mistaken for a strip chip, and the strip is four even 250 cells spanning
         70..1130 with the corridor.
LANES    Two lanes per gap about FLOW_Y 323 through `laneY`, request at 307 and reply at 339, so
         every ball has a matching arrow and the reply never rides the outbound one. LANE_DY is 16
         and not 12 because a riding tag rests 14 above its ball: a reply-lane tag sits at 325 and
         clears the request lane at 307 by 18, where a LANE_DY of 12 would leave 10.
MOTION   Every sending Pod blinks BEFORE its packet leaves and sends at `BEAT.afterPulse`, the client
         on `send` and `fastpath` and the server on `reply`, so no Pod on this card answers cold.
         `reply` costs 3600 for it, the same as `fastpath`, the other two-hop step: both run a span
         of 3200 and stand still for 400.
         Every value this card writes lands on a packet arrival or a rung, through `rewind` plus an
         `F.set`, so nothing is already true when a step opens. The cost is that a FROZEN frame
         shows the rewound state: `frames.mjs` seeks rather than plays, and a paused animation never
         fires the `onfinish` an `at()` hangs its write on, so three of the five narrated steps read
         as their previous step in every image it produces. `tools/settled-dump.mjs <id> <n>` plays
         in real time and is the only thing that sees what those callbacks wrote.
         `walk` is the one step with no packet, on purpose: the packet is held inside netfilter
         while the ladder is read, which is the cost the whole card is about, and the three rungs
         light 600ms apart through `F.set({ chain })`. `fastpath` leaves the ladder DARK, and that
         darkness against `walk` is the lesson of the step rather than an absence, and it is the one
         step showing no address at all, because nothing is in flight to carry one.
WIRE LABELS
         There are none. Every address RIDES its ball as an `F.tag` (`NET.T-01`), so the four gaps
         carry no standing text and the corridor reads clean between beats. Neither the packet nor
         its tag states a `dur`: both fall to `routeDur` over the same points and cannot drift
         apart, and the tag takes the linear easing `segmentPacket` uses for the same reason
         (`M-30`). The tag overlaps the receiving block for the last of its flight, which is the
         exemplar shape on `network-service-clusterip` and clears before the step settles.
CONTENT  Read against `k8sVersion` 1.35 and the two cited pages. The mechanism is the nat table
         itself: only the first packet of a new connection traverses it and the result is applied to
         every later packet of the flow, which is what makes the rule walk a first-packet cost and
         `Not one NAT rule is read on the way back` an unqualified truth rather than an absolute.
         `NEW` and `ESTABLISHED` are the `ctstate` values, where ESTABLISHED means a connection that
         has seen packets in BOTH directions, so `the reply is what flips it to ESTABLISHED` is
         exact and must not be softened to a handshake.
         Two sentences are qualified against the card's OWN last clause and may not be un-qualified:
         `no later packet of it pays again while the entry lives` and `stays on one backend for as
         long as its entry lives`. `the only time this flow will pay it` and `for its whole life` are
         rejected because an entry that ages out or is evicted from a full table sends the next
         packet back through the walk, which is the very failure the same step narrates. The verb is
         `dropping` and not `refusing`: a full table drops the packet.
         The ladder is the iptables chain in order, KUBE-SERVICES matching the ClusterIP and port,
         KUBE-SVC picking one endpoint, KUBE-SEP carrying the DNAT, which is the only chain of the
         three that rewrites anything. iptables is the kube-proxy default the docs still name, so
         the caption scopes the ladder rather than apologising for it.
         The state chip is `ct state` and not `conntrack`, which is what four sibling cards call
         theirs: this card already draws a `conntrack entry`, so a chip of that name would compete
         with it, and the values here are literally ctstate values.
         `Cluster Networking` is rejected as a source. It carries nothing this card claims, no
         conntrack, no NAT and no rule walk. The kube-proxy reference replaces it because the
         conntrack table this card says a Node can fill is sized by kube-proxy itself, through
         `--conntrack-max-per-core` and `--conntrack-min`.
SCOPE    The ENTRY and what it costs. Where in the kernel each hook runs belongs to
         `network-netfilter-path`, which draws the same table as a one-line summary under its hook
         row. How a backend is chosen and what the rules are shaped like belongs to
         `network-service-clusterip` and `network-kube-proxy-modes`, which is why the ladder is
         captioned `iptables mode` and its rungs are a COST rather than a selection. MASQUERADE and
         the egress mapping belong to `network-pod-egress-snat`, and when the rules were written to
         `network-proxy-rule-resync`.
WHY NOT  Hiding the entry until `insert` and fading it in from nothing. It reads as a thing
         appearing rather than as a slot being filled, and it leaves the band 432..512 empty for
         three of the six steps. The record stands from the first frame at `OPACITY.pending` with
         both rows blank and goes to 1 on the write.
DO NOT   Give the `rule walk` chip a value on `insert`. The walk happened on the step before and
         does not happen again, so a fourth value there is a change with nothing behind it, and
         `report:arrival/R2-STEP` is the axis it lands on: a chip reading `read once` on `insert` is
         exactly that finding.
```
