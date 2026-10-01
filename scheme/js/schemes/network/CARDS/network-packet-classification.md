## network-packet-classification

### layout

```
WHAT     The fork every packet meets and nobody else in this section draws: a Pod sends to ONE address
         and picks no mechanism, because two stations on the Node decide, in a fixed order. The nat
         table owns the Service range and rewrites what falls in it, the route lookup sees only what
         the nat table handed on, and three ranges come out as three verdicts.
LAYOUT   Branch, three legs, inside the section's ONLY `node()` frame. The frame is the argument and
         not scenery: both stations are on one Node and every destination is off it, so the border is
         the line the ranges are sorted across, and one of the three verdicts never crosses it.
         Two stations and not a three-row table. A ClusterIP belongs to no interface, so it is not a
         row in any routing table, and a table whose first row is the Service CIDR is a fiction that
         passes every check in the suite. The order is the one `network-netfilter-path` teaches, DNAT
         then routing, and each station is traversed once.
         The trunk is one horizontal row on TRUNK_Y 358, which is the frame's own mid-line, so the two
         exits are a mirrored pair on ONE face. The fork opens INSIDE the frame at FORK_X 852: the
         choice is visibly made on the Node, and only then does anything leave it.
         The two outside destinations are NEXT HOPS and not Nodes. A second `node()` frame would put
         this card on `frames`, which `network-model` and `network-ipam-pod-cidr` both carry, and
         would open an interior this card cedes.
PANEL    Deepest at 1100x800 on `default`: `OVERLAY_IDS=network-packet-classification node --test
         report/overlay.test.mjs` from `scheme/test/`. 180.12 there, 150.17 at 1280x860 and 125.11 at
         1600x1000, against a frame top of NODE_Y 216: 35.88 units of clearance on the worst
         viewport. The frame top-left corner is the only thing this card puts in the panel column,
         and that clearance is what keeps it out. Re-measure after any narration edit: `default` is
         the longest at 218 characters and it is what sets the number.
SIZES    Both stations take the category 232 (`NET.L-01`) and so do both next hops, which sit OUTSIDE
         the frame and take it whatever the trunk does. The widths close on the frame with nothing
         typed twice: 28 of left pad, then 200 + 44 + 232 + 44 + 232, then 40 of fork room before the
         border, which is exactly NODE_W 820. The client Pod is 200 and not 232, the width this
         category's own client Pods already run at (`network-pod-egress-snat` 200, the exemplar 190).
         SCHEME_L 52 and SCHEME_R 1148 are mirrored about x=600, so the chip strip and the whole
         silhouette centre on it: all three of CENTRE, CENTRE-LOW and OCCLUDED report zero findings.
LANES    Seven wires, and every one of them carries a ball on some step. The trunk is two arrows,
         Pod to nat and nat to route. The fork is two `P.lane` legs leaving the route box right face
         at a mirrored pair (`laneY(TRUNK_Y, 20)`, `L-12`), splitting on one vertical bus at FORK_X
         and landing on the Node border as a second mirrored pair at `laneY(TRUNK_Y, 90)`. Two more
         arrows carry each leg from the border to its next hop.
         Every exit lane STARTS on the frame face rather than inside it, so no wire and no ball
         crosses a Node border and `NET.A-02` needs no exception here. That is the compliant shape
         `network-pod-to-pod-cross-node` names in its own record, and `report/frame-face` prints this
         card nowhere.
MOTION   The rewrite happens INSIDE the nat box, so on `service` the ball EMERGES from its far face
         already carrying the new address (`NET.A-01`) and the dst chip is true from entry. nat is
         the sender on that step and route is the sender on `podcidr`, so each is named in its own
         `lit` and its ball waits `BEAT.lead` (`M-18a`).
         `default` turns all three chips over, each on the arrival that earns it, so the strip reads
         the PREVIOUS packet correctly until this one gets there (`P-03`). dst at the first station
         (1500ms), verdict at the route lookup (2300ms), src at the border, which is where MASQUERADE
         runs. Stating the verdict at entry instead announces a lookup the picture has not drawn yet.
         `direct` cues NOTHING. Every value is what `podcidr` left, and the uncued strip IS the
         sentence: same two stations, same order, same verdict, only the history differs (`P-05`).
         The dst rides as far as the Node border and stops there, so the fork leg carries the tag on
         `podcidr` and `direct` and the 44 unit hop past the border carries none. A second copy on
         that hop settles 6.2 units short of `Next hop · Node-2` at 1100x800 and reads as one line
         with it. `default` is the one step that tags the hop past the border, with
         `src 192.168.1.20`, because the border is where MASQUERADE rewrote it, and the one step
         whose fork leg carries no tag, because the dst is stale there and the src is not written
         yet.
CONTENT  Read against `k8sVersion` 1.35 and the three pages the card cites. `Cluster Networking` carries
         the premise the whole fork rests on, `Kubernetes clusters require to allocate non-overlapping
         IP addresses for Pods, Services and Nodes`: that is WHY a destination alone can decide, and
         without it the card would be asserting a lookup order rather than a partition.
         The two-station ORDER is cited and not inherited. `Virtual IPs and Service Proxies` says
         `Unlike Pod IP addresses, which actually route to a fixed destination, Service IPs are not
         actually answered by a single host`, so a ClusterIP is no row in any routing table and the nat
         table is the only station that ever sees one. netfilter puts DNAT in PREROUTING, where
         `anything else on the Linux box itself (routing, packet filtering) will see the packet going to
         its real destination` (`NAT-HOWTO` 6.2), and a forwarded packet takes prerouting, forward,
         postrouting, so the route lookup runs once and on the rewritten address.
         The MASQUERADE clause is what the third source is for. `IP Masquerade Agent User Guide` gives
         the default as `Traffic to 10.0.0.0/8, 172.16.0.0/12 and 192.168.0.0/16 ranges will NOT be
         masqueraded. Any other traffic (assumed to be internet) will be masqueraded`, which is the
         card's 10.244 and 10.96 legs against 1.1.1.1 exactly. That sentence is load-bearing TWICE
         here: it is why `podcidr` rewrites nothing and why `default` rewrites the source, so the two
         legs differ by a default rather than by two unrelated mechanisms.
         The Service range is `10.96.0.0/16`, the number `network-service-cidr` declares in its
         narration, its `desc` and its `aria-label`, and `10.96.0.20:80` sits in the static band that
         card draws. Every address here is reused rather than minted: `10.244.1.5` and `10.244.2.7`
         from `network-model` and the exemplar, `1.1.1.1:443` and `192.168.1.20` from
         `network-pod-egress-snat`.
         Three wordings are held against the card's own canvas. `stations` has the packet naming no
         machinery, and `carrying one destination and nothing else` is rejected because the strip under
         it draws a src as well as a dst. `podcidr` reads `with no further rewrite` and the `aria-label`
         leg reads the same, because `with neither address rewritten` contradicts `service`, which
         rewrote the destination two steps earlier. `default` has the address falling in no cluster
         RANGE, because the default route is itself an entry in the second station and the verdict chip
         reads `no match, default route` about ranges rather than about stations.
         `direct` carries its uncued strip on the subject of its own first sentence, `A Pod addressing a
         Pod directly`. Naming the address there is rejected: the riding tag already inks
         `dst 10.244.2.7:8080` on all four hops, so the strip is anchored to the picture without it.
NAMING   `nat table` and not `nat station`: the block label is what the canvas says,
         `fixtures/terms.json`
         carries `nat table` as the one lowercase exception to the NAT acronym, and prose that said
         `station` disagreed with the box a reader was looking at.
         That label is also this card's one System A exception, carried in `KNOWN_CASING` in
         `render/inline.test.mjs`: `nat` is the literal netfilter table name, so a capital prints a
         table that does not exist, and the only capital this catalog spells for it is the acronym
         NAT, which names the operation and not the table. The other three block labels take the
         heading capital, `Route lookup`, `Next hop · Node-2` and `Default route`, which is the
         reading `network-netfilter-path` already draws in `Routing decision` and `Conntrack table`.
SCOPE    The FORK, and not one of its branches. The DNAT rule itself belongs to
         `network-kube-proxy-modes` and `network-conntrack-nat`, the inter-Node hop to
         `network-pod-to-pod-cross-node`, and MASQUERADE to `network-pod-egress-snat`. Each is named
         in a word and none is drawn: no chain, no conntrack table, no veth, no underlay, no
         encapsulation. `network-netfilter-path` is the precedent for a card owning an ORDER and
         ceding every implementation, and it also owns WHERE in the kernel each station sits, which
         is why no hook is named here.
         Which range is carved by whom is not this card either: `network-service-cidr` owns the
         Service address space and `network-ipam-pod-cidr` the Pod one with its per-Node slices. This
         card asks only which of them an address falls in.
NOTE     `direct` is the beat that makes this a fork rather than a summary of three siblings. It is
         the one claim no sibling makes: the address DNAT produced is itself a Pod-range address, so
         the route lookup decides it exactly as it decides a packet a Pod addressed to a Pod
         directly, and the two journeys end on the same next hop by the same rule.
NOT A DEFECT
         A seeked frame of `default` shows all three chips still holding the rewound values at -95,
         with the ball already landed. A seek never fires `onfinish`, so no `F.set` bound to an
         arrival appears in any frame (`M-35`). `tools/settled-dump.mjs` plays it for real and the
         settled frame reads `dst 1.1.1.1:443` with all three chips highlighted.
         Nine of the twelve balls run a 44 unit hop at 0.063 units per ms, which is near the slow
         end of everything `pace.mjs` ranks. `routeDur` clamps anything under 315 units to the 700ms
         floor (`M-13`), and most of the catalog's balls are floor-bound for the same reason. 44 is
         a length three other cards run, so it is the house reading and not this card: no gap inside
         an 820 unit frame holding
         three blocks could clear the floor, which would need 315 units of its own.
         `direct` and `default` read at 22.71 and 21.10 ms per character, the two slowest readings
         on the card and near the slow end of what `timing.mjs` ranks. Both are MOTION-bound and not
         air: they stand still for 17 and 15 percent of their span against a catalog median of 41
         percent. The hold buys watching a four hop
         journey, which is the shortest the `direct` comparison can be made in: the ball has to pass
         through the nat table for a reader to see it do nothing there.
OPEN     The riding tags overhang the block faces on the trunk hops. `dst 10.244.2.7:8080` inks 116.6
         units at 1100x800 (6.135 units per character on `.scheme-box-sublabel`, measured off
         `Service range 10.96.0.0/16` at 159.5 over 26 characters) and rides a 44 unit gap, so it
         overhangs 36.3 units into the nat face and the route face at once. Seen on the `service` and
         `direct` mid-flight frames, not inferred. Lifting the tag to clear the box tops needs about
         dy -44, which puts it at y 298..314 and inside the Client Pod shell on the first hop, a
         worse picture than the one it fixes. Widening the gap costs a station its 232. The exemplar
         carries the same finding in its own record for the same reason, that the faces are where the
         rewrites happen (`NET.A-01`), so the tags cannot leave them without moving the story.
         At true size on the 1100x800 mid-flight frames of the four steps that run a trunk hop the
         tag crosses box borders over empty interior and touches no other drawn string. The nearest is
         `Service range 10.96.0.0/16`, which ends at x 519.8 on the band y 361..373.2 against the
         tag band 334.2..346.5. 36.3 is the symmetric worst at mid-gap, and at rest the tag sits
         58.3 units inside the nat face and 14.3 inside the route face. `NET.T-01` states this cost
         in the rule itself, so the finding stays open rather than being closed: every way of
         closing it moves the story or costs a station its 232.
```
