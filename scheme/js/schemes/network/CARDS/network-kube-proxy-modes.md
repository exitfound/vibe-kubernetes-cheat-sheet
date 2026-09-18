## network-kube-proxy-modes

### layout

```
WHAT     The same connection to a ClusterIP resolved two ways. The TOP route is iptables, a chain
         (KUBE-SERVICES to KUBE-SVC to KUBE-SEP) the packet WALKS box by box, stopping at each, O(n).
         The BOTTOM route is IPVS, one in-kernel hash hop, O(1).
LAYOUT   Mirror-symmetric about the flow axis: the chain row and the equally wide hash box sit at equal
         distance above and below, each delivering to its own backend Pod through a centred turn, the
         chain DOWN to the upper Pod and IPVS UP to the lower Pod, so neither arrow curves back.
         The chain row does NOT centre on 600: its boxes sit ABOVE the panel bottom, so the row has to
         start right of the panel edge and ENGINE_L is pinned at 420. That asymmetry is paid for by the
         client on the left and the backend column on the right, which is what puts the CONTENT bbox
         on 600.
         THE BAND BETWEEN THE TWO LANES BELONGS TO THE PILE. `scale` reveals three fading copies of
         the chain row on the SAME three x segments, hanging off the row at 236 with a 16 gap and
         closing at 346, so 106 units are left over the hash box and the two lanes stay separate.
         They are bare rects in a `P.raw`, not boxes: they are the same row AGAIN and not new actors,
         so they carry no label, no key of their own and no `.scheme-box` semantics, and their cyan
         is literal for the reason `netns-stack-band` is literal, since a bare rect resolves no role
         token. `STACK_FADE` halves at each step, 0.52 to 0.26 to 0.13, so the pile RECEDES rather
         than reading as three more rows of equal weight.
         BOTH WIRE TAGS PRINT ABOVE THEIR OWN ELEMENT, `ipt` at `TOP_Y - ROW_H / 2 - 14` and `ipvs`
         at `BOT_Y - IPVS_H / 2 - 14`. That is what leaves the whole band under the chain row to the
         pile, and it makes the pair symmetric about the axis instead of one above and one below.
PANEL    Deepest at 1100x800 on `scale`: `OVERLAY_IDS=network-kube-proxy-modes node --test
         report/overlay.test.mjs` from `scheme/test/`. AXIS 352 is what clears it: the Client Pod
         shell is 128 tall and centred on the axis, so its top stands at 288 and leaves 8.5 units of
         clearance under the deepest reading. Both numbers move together, so lowering AXIS spends
         that margin and ENGINE_L 420 is the other half of the same constraint.
LANES    EVERY ARRAY A BALL RIDES IS HELD BY THE LANE THAT DRAWS IT (`A-02`), the two 24 unit chain
         gaps included. They are `P.lane` on a two point array rather than `P.arrow` on the same two
         points: `pathArrow` is what both kinds resolve to, so the line is identical to the pixel,
         and holding the array in the lane is what keeps `report/lane-traffic.test.mjs` from filing
         them as `OTHER-PART`.
MOTION   The inactive lane dims on each mode step.
         THE TWO CHAIN GAPS TAKE AN EXPLICIT `GAP_MS` 200 AND THE CARD IS ON THE `M-12` REGISTRY FOR
         IT, at `{ speed: 2, clamp: 2 }` in `render/motion.test.mjs`. The row is three boxes across
         492 units, so each gap is 24, shorter than any other ball in the catalog. `routeDur` floors
         every ball at 700ms, which on 24 units is 0.034 u/ms against the `PKT_SPEED` canon of 0.45
         and made these the two SLOWEST balls in the catalog: the packet oozed across the gap while
         the reader waited. Geometry cannot close it, since reaching the floor honestly wants a 315
         unit gap inside a 492 unit row, so the sanctioned explicit `dur` is the only fix. At 200
         they measure 0.120 u/ms, which `.claude/skills/card-review/tools/pace.mjs` ranks in the
         populated middle of the distribution, and `PAUSE` 240 is what goes on saying `stopping
         at each`, which is the step's actual subject. MEASURED on a real play at 1280x860, sampling
         every 150ms: the ball lands on 420, holds, crosses to 594, holds, crosses to 768, holds,
         then glides out through the turn, which is the walk the narration describes.
         `pickChip` TURNS OVER ON THE BEAT THAT MAKES THE PICK, on both mode steps and in one shape.
         Each enters on `NO_PICK`, the neutral `one backend` that `idle` states, and produces its own
         answer on the arrival that decides it: `h2`, where the ball reaches KUBE-SVC, and `v1`,
         where it reaches the hash table. The chip lights on that same arrival rather than at entry,
         so `lit` carries only the mode chip. MEASURED on a real play at 1280x860, sampling every
         220ms: the chip reads `one backend` unlit for 2424ms while the ball walks KUBE-SERVICES,
         then reads `statistic random` and lit from 2645ms. Entering on the OTHER mode's answer is
         rejected: it makes each step inherit a pick it did not make, and `P-04` is why both steps
         take the same rewind rather than one taking a neutral value and the other an inherited one.
         `scale` IS THE STEP THAT CARRIES THE CARD AND IT DRAWS ITS OWN ARGUMENT. The pile reveals at
         260 and the two verdicts fade in at 860 and 1100 off that arrival, so the picture makes the
         case before the words do: the chain repeats itself down the band while the hash box does not
         move. Span 1540. The pile stands above the guard and `rewind` puts it back down, the same
         shape the two tags use, so the reduced path shows all three standing.
         ITS `duration` IS 4200 AND THE NUMBER IS MEASURED. Its 400 characters at 4200 read at 10.50
         ms/char, which is the catalog median that `.claude/skills/card-review/tools/timing.mjs`
         prints beside every step, and the 63 percent
         still time it buys is the price of a 400 character narration rather than slack. At 2600 the
         same narration reads at 6.50, hurried, on the step that carries the whole reason for the
         card.
         THE TWO MODE STEPS ARE THE OPPOSITE SHAPE AND STAY THAT WAY: 8 and 4 percent still, because
         their reading time is bought by the ball walking rather than by a hold. A high still rank is
         a finding only when the pace is ALSO slow, and at 14.47 and 10.84 ms/char neither is.
         `iptables` HOLDS 4600 AND THE NUMBER IS ITS SPAN PLUS A BEAT. The walk is 900 of pulse, 729
         across the entry, three dwell-plus-hop beats and 700 down to the Pod, landing at 3349 with
         the arrival pulse closing at 4249. With the two gaps back on the 700ms floor the same walk
         runs 5400.
CONTENT  THE CHAIN NAMES AND `statistic random` COME FROM THE PROXIER, NOT FROM THE DOCS, and that is
         why `sources` carries two entries. `Virtual IPs and Service Proxies` says only "For each
         endpoint, it installs iptables rules which, by default, select a backend Pod at random" and
         carries no occurrence of KUBE-SERVICES, KUBE-SVC, KUBE-SEP or statistic, so it supports no
         part of the top lane. `pkg/proxy/iptables/proxier.go` is exact:
         `kubeServicesChain = "KUBE-SERVICES"`, `servicePortPolicyClusterChainNamePrefix =
         "KUBE-SVC-"`, `servicePortEndpointChainNamePrefix = "KUBE-SEP-"`, and the per-endpoint rule
         appends `"-m", "statistic", "--mode", "random", "--probability"` under the comment "Each
         rule is a probabilistic match". Upstream source is the last resort the order of authority
         allows, and it is named as such because these are chain names rather than a contract.
         THE DEPRECATION CARRIES ITS TIMELINE, because `deprecated` alone tells a reader nothing
         about urgency. The source is exact: "Deprecated since Kubernetes v1.35 ... Support for ipvs
         mode will be disabled by default from Kubernetes v1.40 (you can re-enable it with the
         KubeProxyIPVS feature gate); ipvs mode will be fully removed in Kubernetes v1.43." `scale`
         names all three versions. The feature gate is left out for room, and `in favour of nftables`
         is not a link this card invents: the same page says nftables "is essentially a replacement
         for both the iptables and ipvs modes ... and is recommended as a replacement for ipvs".
         `scheduler rr / lc` USES THE ABBREVIATIONS THE SOURCE USES, "rr (Round Robin)" and "lc
         (Least Connection)", which are two of the eight it lists. `in-kernel hash table` is its
         sentence too: IPVS "uses a hash table as the underlying data structure and works in the
         kernel space".
         `scale` HAS A PANEL CEILING AND NOT ONLY A PACE ONE. At 400 characters the panel bottom
         holds at 279.51 on 1100x800, which is the reading `PANEL` is built on. One line more
         measures 304.36 and covers the Client Pod at 288. A narration edit here is re-measured
         after a fresh `npm run walk`, never estimated
         from a character count, and never read off a stale walk.
         Two things this card may NOT say. It must not claim the two modes select the same way: the
         iptables step says `statistic random` and the IPVS step says round-robin and
         least-connection, so the scale step names the LOOKUP as what scale exposes and stops there.
         And nothing here draws conntrack, not as a block, a chip or a narration, so the `desc` in
         `cards.js` closes on the shared outcome (`Either mode turns the ClusterIP into one chosen
         backend`) instead of on a mechanism the reader cannot find on the card.
         `nftables` IS A NARRATED SUCCESSOR WITH NO BLOCK, which this catalog admits. `scale` closes
         on "though Kubernetes deprecated it in v1.35, disables it by default in v1.40 and removes
         it in v1.43 in favour of nftables", and nftables acts in no beat of this card: it is what
         the deprecation points AT, so drawing it
         would put a third dataplane on a canvas whose whole argument is a pair.
WHY NOT  Giving the IPVS lane a pile of its own on `scale`. It balances the composition and it says
         the opposite of the card: the hash box NOT moving while the chain repeats is the argument,
         and a symmetric drawing of an asymmetric mechanism argues against its own sentence.
         Drawing the pile at rest instead of revealing it. It costs `scale` its only beat and it
         clutters the two mode steps, whose subject is one packet on one route.
```
