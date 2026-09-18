## network-netfilter-path

### layout

```
WHAT     The missing floor under every other packet-path card in Network. Those name an OPERATION on
         a packet (kube-proxy DNATs, conntrack pins the flow, egress MASQUERADEs) without saying WHERE
         in the kernel it runs. This is the stations in order, with the packet walking them, and the
         routing decision drawn as what it is: a FORK, with INPUT on one leg and FORWARD,
         POSTROUTING and eth0 on the other.
LAYOUT   The Client Pod is the only block above the row, so it stands on the SCHEME's centre line
         (SCHEME_CX 600, derived rather than typed) and not over any block below it: the row runs
         40..1160 and the strip spans the same, so the one thing above them reads as centred on both.
         The order is the lesson, so the through path is one left-to-right row and the packet never
         doubles back on it. What the row cannot say is that the path BRANCHES, so the second leg
         hangs below the routing decision instead of standing in the row: a packet that takes it has
         left the through path and never reaches anything to the right of that box. Three classes of
         thing are drawn as three widths rather than as one row of equals: PREROUTING at 290 because
         the conntrack table shares its column, the three middle stations at their own label widths,
         and eth0 at 120 because it is an interface and not a hook.
         There is NO Node frame. The boundary of the host namespace is named by its two interfaces
         instead, the veth wire label on the way in and eth0 on the way out. A frame would have to
         start at x=40 to hold the row, which puts its top-left corner in the panel column, and
         `NET.A-02` would then forbid the entry lane from crossing it: every ball would have to land
         on one face midpoint at x=600 and walk back left inside the frame.
PANEL    Deepest at 1100x800 on `reply`: `OVERLAY_IDS=network-netfilter-path node --test
         report/overlay.test.mjs` from `scheme/test/`. 254.66 there, 213.92 at 1280x860 and 177.44 at
         1600x1000, against a row top of 380 and an entry lane at 336: 81 units of clearance on the
         worst viewport, so this card has no panel wall. That clearance is what the prose LENGTH
         leaves, and it is what the fork stands in: a reading of 304.36 clears a row top of 380 by
         under a unit. `reply` is the longest narration and the one to re-measure after any prose
         edit.
SIZES    PREROUTING and the conntrack table share one column, 40..330, because the table is written
         and read back at that hook and nowhere else on this card. 290 is what the flow row needs:
         `10.244.1.5 -> 10.244.2.7:8080` inks 177.9 units at 1100x800, which leaves 56 a side. The
         table takes ROW_H rather than a height of its own, so every block on the card is 70 deep
         and the lower band reads as one band: its bottom and INPUT's both land on 560, 26 above the
         chip strip. INPUT keeps the category 232 (230 here, so its centre lands on 715 and
         the leg is a clean drop and slide).
LANES    The reply rides its own lane (RETURN_LANE_Y 360) above the row, and the request rides the
         one above it (ENTRY_LANE_Y 336), so neither retraces a forward wire. They land on
         PREROUTING's top face as a deliberate PAIR at +-55 about its midpoint (`L-12`), which is
         what keeps the two arrivals legible as two different packets.
         RT_TO_IN is the fork's second leg and is drawn on every step while carrying a ball on ONE
         (`NET.A-03`). It is a lane and not a relation because traffic really does travel it.
         CT_LINK is an ownership marker and carries no arrowhead: PREROUTING bottom-edge midpoint
         straight down to the table's own top-edge midpoint, both at x=185, which is what sharing the
         column buys: a bracket around four hooks would claim the table belongs to all of them.
MOTION   `enter` obeys `P-03`. A packet is not AT a hook until it arrives there, and conntrack has no
         flow to record until it does: `chips` keeps the end state, `rewind` holds the idle none on
         both chips and `no flow yet` on the table, and an `F.set` writes all three on the `inb`
         arrival at 2311ms (the Pod pulses at 0, the ball leaves at BEAT.afterPulse 800 and the 680
         unit entry route takes 1511ms).
         `reply` and `local` obey it on all four chips at once, because each reversal is ONE act. On
         `reply` the strip carries what `out` left until the ball lands at 2800ms. On `local` it
         carries what `reply` left, so the ball leaves PREROUTING while `hook` still reads
         `PREROUTING, POSTROUTING`, the pair that pass ended on: the previous state read correctly
         rather than a lag. The conntrack row travels with the chips on
         both, because the row IS the conntrack chip written long and `P-04` wants one family on one
         beat.
         eth0 on `reply` and PREROUTING on `local` are the SENDERS, so each is named in that step's
         `lit` and its ball waits `BEAT.lead` (`M-18a`). Without that the ball leaves a dark block,
         which is what `report:arrival/R4` reports.
         Durations are floored by motion on three steps and by reading pace on the other three:
         `enter` spans 2871 against 3200, `reply` 3360 against 3800, `local` 2860 against 3300.
         `reply` carries the longest narration on the card BECAUSE of that floor: the return lane is
         900 units and the sender takes BEAT.lead, so 3800 is the shortest legal hold, and its 348
         characters spend it at 10.92 ms per character, just off the catalog median `timing.mjs`
         prints. The last 80 of those characters close the loop in words, and they are what turns
         the hold from air into reading.
         `dnat` and `fork` stand still for 77 and 74 percent of their span against a catalog median
         of 41: their hop is a 40 unit gap, which `routeDur` clamps to the 700ms floor (`M-13`), and
         both read at 9.65 and 9.96 ms per character against that median. The stillness is the
         price of a short hop on a correctly paced step, and widening the gap would narrow a hook.
WIRE LABELS
         `veth` sits at (650, 252), beside the entry lane's vertical rather than on it, in the band
         between the Pod bottom (170) and the entry lane (336). It is the only place on the card that
         names the namespace boundary, so it is written on `enter` and blank elsewhere.
CONTENT  The reply reversal lands at POSTROUTING, not at PREROUTING where the ball stops. What
         PREROUTING does to a reply is the conntrack MATCH, and the rewrite it implies is a change
         to the SOURCE, which the NAT HOWTO pins: `Source NAT is always done post-routing, just
         before the packet goes out onto the wire. Destination NAT is always done before routing,
         when the packet first comes off the wire`. So the `reply` step names both hooks in `hook`,
         the way `out` already does, and the narration says where the reversal lands. Writing it as
         `At PREROUTING conntrack ... reverses the stored translation` is rejected: it puts a source
         rewrite at a destination-NAT hook, and it is the one claim on this card no sibling makes,
         because `network-conntrack-nat` and `network-pod-egress-snat` both state the reversal with
         no hook at all.
         `KUBE-SERVICES` is the chain name of ONE proxy mode. kube-proxy also has `ipvs` and
         `nftables`, and `Virtual IPs and Service Proxies` says the default `is iptables, but a
         future version of Kubernetes will change the default to nftables`, so the step names the
         mode rather than the chain alone. `network-conntrack-nat` captions its rule ladder the same
         way.
         The masquerade exclusion is a DEFAULT and is written as one. `masqueradeAll` is false out of
         the box, and with it set kube-proxy marks all Service traffic and the Pod source does not
         survive, so `Cluster traffic is excluded` unqualified states a configuration as the
         mechanism.
         A hook is not a table. `FORWARD is the filter table` is rejected for the same reason the
         routing decision carries `not a hook`: the card's whole argument is that the hooks are
         places and the tables are what runs at them, and `dnat` already says `the nat table runs`
         inside a hook.
         The conntrack row is a FLOW, one grammar the whole way down: source then destination, the
         same pair the `src` and `dst` chips carry, with the DNAT visible as the destination half
         changing. Writing the post-DNAT row as the translation instead (`10.96.0.20:80 ->
         10.244.2.7:8080`) makes the arrow mean two different things on two adjacent steps, and the
         narration already says the translation was stored.
         The packet from a Pod on this Node reaches PREROUTING rather than OUTPUT because it crosses
         the veth into the host namespace, which is an INGRESS for the host. That is why the veth is
         named on the canvas at all.
SCOPE    The hooks and the order they run in. The conntrack ENTRY and what a first packet costs
         belong to `network-conntrack-nat`, which is why the table here is one row rather than a
         structure. The dataplane implementations belong to `network-kube-proxy-modes` and
         `network-ebpf-dataplane`, and the egress mapping to `network-pod-egress-snat`.
NOTE     hook is where the packet is right now, dst and src are what it carries there, and conntrack
         is what the kernel remembers about it. All four are outcomes of a packet in flight, so they
         read the values it starts with and the steps rewrite them exactly where the kernel does.
         The routing decision carries the sublabel `not a hook`, which is the one place on the canvas
         that separates a kernel decision from the four netfilter hooks beside it.
WHY NOT  A sixth station in the row for the local branch. Six labels of this length do not fit
         1120 units at any gap, and standing INPUT in the row would also say the packet passes
         through it on the way to FORWARD, which is the opposite of what a fork means.
         Carrying the reply on to the Pod. The delivery leg would leave POSTROUTING and cross the
         return lane on its way back up to the Pod at any height, because the return lane spans
         240..1100 and the Pod sits above it: the loop closes in the narration instead.
         An eBPF comparison as the closing step. It dims every station to say the chain is not
         walked, spends a sixth of the card on a subject `network-ebpf-dataplane` owns two rows away
         in the same section, and names a socket hook that has no place on this canvas.
NOT A DEFECT
         `dnat`, `fork` and `out` deliberately do NOT take a `P-03` repair, and
         `report/chip-beat.test.mjs` lists their six values as FORM-B at 700ms. The direction of the
         motion is the reason. On `enter`, `reply` and `local` a ball travels TO the place that makes
         the value, so the value waits for the arrival. On these three the ball LEAVES the place that
         already made it: the nat table runs inside PREROUTING, where the packet stands at entry, and
         the hook a step opens at is the hook the previous arrival delivered it to. Binding
         `dst 10.244.2.7:8080` to the routing arrival would put the strip 700ms behind the tag on its
         own ball and behind the conntrack row, which writes the DNAT-ed flow at entry too. `P-06`
         puts a value chip turning over at step entry inside the rules, and these are that case.
         The `-95` frame of `enter`, `reply` and `local` shows the strip still rewound. Those steps
         turn their chips over in an `at()` callback, which is the onfinish of an empty animation and
         never fires under a seeked probe: `tools/settled-dump.mjs <id> <step>` plays in real time
         and is what shows the turnover.
```
