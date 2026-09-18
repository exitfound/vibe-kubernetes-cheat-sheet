## network-traffic-distribution

### layout

```
WHAT     Which ready endpoint a connection to a Service reaches, and the two independent fields that
         bend that pick: sessionAffinity ClientIP, per client and at runtime, where the dataplane
         pins a source IP to one Pod for a 10800s window that each new connection from it
         restarts, and trafficDistribution PreferSameZone,
         per zone and at programming time, where kube-proxy writes only the endpoints hinted for its
         own zone and falls back to every ready endpoint when that zone has none.
LAYOUT   The flow line runs Client Pod > Node dataplane > a fan over one rail into two zone frames
         stacked on the right, two Pods each. kube-proxy stands under the dataplane on a relation,
         so the two mechanisms sit in two places: the pin in the box on the flow line, the zone
         choice in the box that writes it. Under, not above, because the source-IP tag rides the
         up legs from departure: 92 wide at 1100x800, it fits neither the 48 between a column at
         the `L-03` wall and the rail nor the 40 between the rail and the frames, so with the
         column at the wall a box above the dataplane is inked over on every a1 ride, and with
         the column at 356 that box opens at y 156, 73.8 above the deepest panel bottom, inside
         the panel column. The zones are stacked, not side by side, because the next card,
         `network-internal-traffic-policy`, lays its two Node frames side by side in a low
         band: with the panel covered the two read as different pictures. The
         client and its Node carry `zone-a` in their labels, the origin PreferSameZone is
         relative to.
PANEL    `OVERLAY_IDS=network-traffic-distribution node --test report/overlay.test.mjs` from
         `scheme/test/`: deepest 229.82 at 1100x800, 192.67 at 1280x860 and 160 at 1600x1000. Three
         blocks stand left of x=420, all under the deepest reading: the Client Pod opens at y 265,
         35.2 under it, the dataplane at y 280, 50.2 under, and kube-proxy at y 404.
SIZES    The control column is two 232x80 boxes (`NET.L-01`), the dataplane at y 280 and
         kube-proxy at y 404, at x 356, which puts the fan origin at 588. Its right edge is set by
         the tag: on the rail the tag inks 596.8..691.2 at 1280x860, 8.8 clear of the column and
         8.8 of the rail, and 598..690 at 1100x800. The widest string,
         `reads zone hints · writes rules`, inks 195.2 at 1280x860 (190.2 at 1100x800, 186.9 at
         1600x1000), 18.4 a side at worst. The client arrow is 96 long and floor-bound at 700.
         The Pods stand at 832, 92 in from the frame face and 68 from its right edge, because the
         frame label `in zone-a` inks from 752 to 819 at 1600x1000 (812.2 at 1100x800) on the
         Pod top row: centred at 820 it clears the Pod by 1 unit, at 832 by 13.
         The client inner box is inset 20, so the ball leaving the shell face at x 260 stands 20
         off it, past the 16 `report/arrival.test.mjs` R4 tolerance: the sender is the Pod, which
         pulses.
         The two chips are 530 each across SCHEME_L..SCHEME_R, so the strip centres on 600.
LANES    The client arrow and all four fan legs are dim dashed lanes, and every leg ends on its
         zone frame face at x 740, never on a Pod inside it (`A-21`), mirrored +-56 about the face
         midpoints y 180 and y 460 (`L-12`). One points array feeds each wire and its ball.
         kube-proxy to the dataplane is a `P.relation` at x 472, 44 long, with no head and no ball:
         kube-proxy writes the rules and forwards nothing. An endpoint left out of the rules dims
         in one `stage()` field (`A-16`), so on `topology` and `fallback` the reader sees which
         endpoints the rules hold, while all four headed legs stay at full opacity on every step.
         Taken legs: a1 on `default`, `session-affinity` and `topology`, b2 on `default`, b1 on
         `fallback`.
MOTION   Every ball takes plain routeDur and the card carries no `PACING` entry in
         `render/motion.test.mjs`: the outer legs a1 and b2 are 348 units at 773ms, the b1 leg 236
         at 700, and the tag rides its ball on the same dur and easing (`M-30`).
         The `src 10.244.2.50` tag fades in over the 160ms BEFORE its ball departs and trails 56
         LEFT of the rail: `TAG_UP` 52 above the ball, so it leaves 9.5 over the dataplane top at
         1100x800, and `TAG_DOWN` 60 below it, leaving 10.2 under the dataplane, 21.5 over
         kube-proxy and 14 right of the relation. Both park past the rail end, a1 10 short of the
         frame face at 740 and b2 13.5 over the chip strip, hold 260 and fade over 200. Sampled
         every 20ms at all three viewports, no tag touches a block, a frame edge or a lane on any
         step.
         The default step runs TWO client hops, the second staggered by 540, because two
         connections from one client landing in two zones is what having no zone preference looks
         like: span 3813 against duration 4600. `session-affinity` sends both rides to a1 and
         holds them `SAME_POD_GAP` 900 apart, one whole `PULSE_POD.ms`: arrivals 2373 and 3273,
         the second blink ending at 4173 against duration 4900. `topology` spans 3273 of 4000 and
         `fallback` 3200 of 3800.
         The two kinds of change are drawn as two kinds of beat. The pin is runtime state: `rewind`
         holds `ClientIP · 10800s` and one `F.set` turns the chip to the pin on the `arr` arrival
         at the dataplane, where the first connection is DNATed (CONTENT), and a real-time
         settled dump reads the pin at the end of the step. The zone choice is
         programming time: the dim, the lit kube-proxy and the trafficDistribution value all stand
         from entry, before the client pulses. On `topology` the sessionAffinity chip is lit with
         them, because it reads None again after the pinned value of the step before.
CONTENT  Read against release-1.35: website `virtual-ips.md` and `service.md`, and in
         kubernetes/kubernetes `pkg/proxy/topology.go`, the iptables and nftables proxiers,
         `endpointslice/trafficdist/trafficdist.go`, core/v1 `types.go`, `defaults.go` and
         `kube_features.go`.
         The sticky window is `sessionAffinityConfig.clientIP.timeoutSeconds`, which API
         defaulting sets to 10800 when sessionAffinity is ClientIP. It counts from the LAST new
         connection, not the first: iptables jumps on `recent --rcheck --seconds 10800 --reap`
         and the endpoint chain runs `recent --set` on every new connection, which updates the
         entry, and nftables runs `update` into a per-endpoint set carrying that timeout. So the
         narration says `the client reconnects within the sticky window`. `for the sticky window`
         is rejected: with the docs calling it the `maximum session sticky time` it reads as a
         fixed span from the first connection. IPVS persistence is not read here.
         The pin is written as the dataplane DNATs the first connection, because `--set` and
         `update` sit in the endpoint chain ahead of the DNAT rule. So the narration says `the
         Pod it picked`, and `the Pod it reached` is rejected. The affinity match is written only
         for endpoints in the rules, so `while that Pod stays in the rules` stays.
         `PreferSameZone` is GA in 1.35 (`PreferSameTrafficDistribution`: alpha 1.33, beta 1.34).
         `PreferClose` is its deprecated alias with the same meaning and still validates, so
         `(PreferClose is its deprecated alias)` ships and `older clusters spell it PreferClose`
         is rejected: it reads as if 1.35 no longer accepts it.
         The EndpointSlice controller hints READY endpoints only, so `Each ready endpoint`, not
         `Each endpoint`. kube-proxy filters by zone only while every ready endpoint carries a
         zone hint and at least one is hinted for its own zone, and otherwise writes every ready
         endpoint (`topologyModeFromHints`). On `fallback` the zone-a endpoints are not ready, so
         none is hinted for zone-a. A Node with no zone label or one unhinted ready endpoint also
         turns the filter off, and neither is drawn.
         `which can cut latency and cross-zone costs` ships because the docs say the field `can
         help optimize for performance, cost, or reliability`, and `cutting latency and
         cross-zone data charges` is rejected as an unqualified promise. `Load spreads evenly`
         stays: `the default strategy is to distribute traffic evenly to all endpoints`.
         Step 1 says `The dataplane picks`, never `The rules pick`: kube-proxy writes, the kernel
         picks. The first source is `virtual-ips/#traffic-distribution`, which carries the hints,
         the fallback and the alias, where `service/#traffic-distribution` lists only the values.
         The `aria-label` and the `desc` carry the same condition as step 2, `while that Pod stays
         in the rules`: once the Pod leaves the rules its affinity match is gone, so a pin stated
         only against the window is a false absolute. `pins a client IP to one Pod while it
         reconnects within a window` is rejected for that, and for an `it` that can read as the
         Pod. The desc fits `D-04` at 468 by saying `a Service connection` and `the dataplane`,
         never by dropping the condition.
         `PreferClose` still validates in release-1.36 and on master, and `topologyModeFromHints`
         is unchanged there, so every claim above holds past the 1.35 badge.
         The affinity rules are written only for the endpoints the zone filter kept, so the two
         fields combine. The `topology` chip reading None stages one lever at a time and claims
         no exclusion. `Pod web` on all four backends is the catalog label for a replica of the
         app, as on `network-service-clusterip`, and the IPs tell them apart.
NAMING   The title says Traffic Distribution and never Topology, which is the name of the older
         annotation-driven feature (DO NOT below). The zone frames read `in zone-a` and `in
         zone-b`: each holds the endpoints in that zone, not the whole zone, which is why the
         zone-a client and its Node stand outside the zone-a frame and a connection that stays in
         zone-a still crosses into it. The fallback chip reads `fallback to all zones`: kube-proxy
         falls back to every ready endpoint in the cluster, and zone-b is simply where the ready
         ones are. The pin chip abbreviates `.2.50` and `.2.7` because both full addresses are on
         the canvas, on the Client Pod and on the first zone-a Pod.
SCOPE    How the slice and its zone hints are written is `network-endpointslice-reconcile`. The
         Node scope, a hard filter with no fallback, is `network-internal-traffic-policy`. The
         fallback to serving terminating endpoints is `network-service-terminating-endpoints`.
         PreferSameNode and the `service.kubernetes.io/topology-mode` annotation are not drawn.
NOTE     `report/chip-beat.test.mjs` lists `modeChip` on `topology` and `fallback` as already
         reading its new value and lit at entry. That is the programming-time premise above, on
         purpose: the rules exist before the connection, and binding the chip to the arrival would
         leave it naming the old setting over a picture whose zone is already dimmed.
WHY NOT  The client inside the zone-a frame. The legs to zone-b would then leave that frame
         through its border, which `NET.A-02` forbids, and nesting the client Node in a zone frame
         converges on the two-frame band of `network-internal-traffic-policy`.
         The frame label `zone-a endpoints`. It inks about 107 at 1100x800 from x 752, which puts
         the Pods at 872 or further, 132 in from the face against 28 on the right.
         A tag on the b1 ride. The rail runs on to y 516 past the b1 stub, so a tag parked at the
         b1 face is struck by it through the hold: at dx -56 it inks 638..730 across the rail at
         700 at 1100x800. Clearing the rail by the 10 the outer legs keep takes dx -96, which on
         the way down puts its left edge at 558, 30 into the kube-proxy column. `fallback` riding
         b2 instead leaves FAN_B1 with no ball on any step.
         A 210 control column kept inside 420..630. The kube-proxy sublabel inks 195.2 at
         1280x860, 7.4 a side, and the right edge at 630 leaves 70 to the rail against the 92
         the tag inks at 1100x800.
         The setting chips stacked under the client. That puts the strip at 120..440 and centres
         it on 280, and no arrangement in that left band can reach x=600, because the zone frames
         own everything right of 740 from y340 down.
         Dropping the second Pod pulse on `session-affinity` instead of widening the gap. It leaves
         the second ball landing on a1 with nothing acknowledging it, which reads as a connection
         that was not served, and that arrival is the one that proves the pin.
DO NOT   Put kube-proxy on the flow line or start the fan from it. That draws kube-proxy forwarding
         packets, which `network-service-clusterip` states it never does.
         Word the fallback as a switch to zone-b. It is a fallback to all ready endpoints.
         Fire both fans at the identical delay off ONE client hop. That reads as a single
         connection being split across two backends, which is the one thing a connection cannot do.
         Land two rides on ONE Pod less than 900 apart. Two blinks inside one pulse length
         composite on the same element.
         Call `trafficDistribution` topology-aware routing. That is the proper name of a DIFFERENT
         and older feature, the `service.kubernetes.io/topology-mode: Auto` annotation, which the
         docs explicitly contrast with this field: `there is a key difference in their approaches`,
         the annotation spreading traffic proportionally by allocatable CPU while
         `trafficDistribution: PreferSameZone aims to be simpler and more predictable`. The
         annotation also takes PRECEDENCE over the field.
NOT A DEFECT
         `FAN_A2` carries no ball on its step. It is the endpoint the traffic distribution did NOT
         pick, and the point of the card is that the choice was made among the drawn candidates
         rather than forced (`NET.A-03`). Same basis as the nodeport fan.
         The legs to endpoints left out of the rules stand at full opacity on `topology` and
         `fallback` while their Pods dim. A headed line is never muted, so the Pods alone say
         which endpoints the rules hold, and the drawn alternatives stay whole (`NET.A-03`).
         The a1 tag parks on the line of the frame label: it inks 638..730 on y 62.2..74.5 and
         `in zone-a` from 752 on y 67..81.7 at 1100x800, 22 apart, for the 460 of hold and fade.
         Its dy is bound by the dataplane top at departure and its dx by the rail, and `src
         10.244.2.50 in zone-a` reads true of the client.
         At departure each tag stands over the dataplane edge it leaves, 9.5 above or 10.2 under
         it, on the same two bounds.
         The step id `topology` stays. A step id reaches neither the DOM nor the hash, which routes
         on the step INDEX, so no reader ever sees it.
```
