## network-internal-traffic-policy

### layout

```
WHAT     internalTrafficPolicy decides which endpoints kube-proxy on each Node writes into that
         Node's Service rules. Cluster writes every ready endpoint, so a call can be DNAT-ed to the
         agent on another Node. Local writes only the endpoints on the caller's own Node, which is
         what lets a Pod reach its node-local DaemonSet agent. It never falls back to another Node:
         in iptables mode a Node whose own agent is ready=false drops the call although the agent
         on the other Node is ready.
LAYOUT   Two peer Node frames, 540 wide, mirrored about x=600 (40..580 and 620..1160), each holding
         the SAME row: Client Pod > Node dataplane > agent-N, with kube-proxy standing above the
         row, centred over the dataplane on a relation. Service node-agent stands centred over the
         frame gap, and its relation bus
         lands on each frame top above kube-proxy. The two frames are peers because the subject is
         one rule set PER NODE, and a second caller is what makes a Node with no ready local
         endpoint visible. The four chips are a bottom strip: the policy, then the two rule sets,
         then the result.
PANEL    `OVERLAY_IDS=network-internal-traffic-policy node --test report/overlay.test.mjs` from
         `scheme/test/`, read per step: deepest 229.8 at 1100x800 on `local` and 205 on `cluster` and
         `no-local-backend`, 192.7 at 1280x860 on `local` and `no-local-backend` and 171.4 on
         `cluster`, 160 and 142.6 at 1600x1000. The Service bus at BUS_Y 240 is the highest line
         left of x=420 and clears the deepest reading by 10.2, the frame tops at 254 by 24.2, and
         the `Node-1` frame label, inking from y 260.5, by 30.7. A panel line is about 25 units at
         1100x800, where `local` takes eight lines and the other two seven: no narration can grow
         past eight lines there without the panel reaching the bus.
SIZES    The row is sized BY the frame (`NET.L-01` third clause): 14 + Pod 140 + 38 + dataplane 156
         + 38 + Pod 140 + 14 = 540, so the dataplane takes 156x80 and not 232x80. 232 wants a 616
         frame, and 588 even with both Pods narrowed to 126 around `node-agent`, while two frames
         at the 40 margins and the 40 gap are 540 each. kube-proxy is not in the row: it stands
         above the Pods, 232x80 over 194..426 at y 274..354, exactly client right edge to agent
         left edge, with a 30 relation down to the dataplane at 384..464. The frame top stands 20
         over kube-proxy and the Pod tops 20 under it, so kube-proxy reads as the head of the
         dataplane column rather than a lid on the row. Pod tops at 12 under it would put the
         `Client Pod` label 15.7 under its bottom edge and cut the relation to two dashes. The
         Service is 232x80 at
         y 112..192. The flow line stays at 424, so the room comes from raising the frames to 254,
         and the Pods, notes, legs and chips below the flow line do not move. Measured at
         1280x860, where the monospace sublabels ink widest: `Node dataplane` inks 93.4, 31.3 a
         side, `writes rules` 75.6 in kube-proxy, 78.2 a side, `ClusterIP 10.96.0.30:80` 144.8 in
         the Service, 43.6 a side, the Pod IP 63, 38.5 a side. Both inner boxes sit 18 inside their
         Pod, 104 wide, and
         `node-agent` inks 69.9 at 1100x800, 17 a side. An inset of 16 puts the client `app` box
         exactly on the `report/arrival.test.mjs` hit tolerance of the ball leaving the Pod edge,
         so R4 reads it as a dark sender. The chips are `strip` over 40..1160 at a 20 gap, 265
         each, and the widest pair is `Node-1 rules` 75.6 with `agent-1 · agent-2` 107.
LANES    Every lane carries a ball on some step. Both client hops ride on `cluster` and `local` and
         the Node-2 hop again on `no-local-backend`, the local legs on `local`, the cross legs on
         `cluster`.
         A cross leg re-emerges on the frame bottom under the dataplane where the DNAT happened
         (`NET.A-01`) and stops on the other frame bottom (`NET.A-02`). Each frame bottom holds an
         `L-12` pair about its dataplane axis, out at -70 and in at +70, 8 inside the dataplane
         edges, so Node-1 carries 240 out and 380 in and Node-2 carries 820 out and 960 in. The 140
         between the two verticals of a frame bottom is what holds a riding tag at departure (MOTION). The legs
         are nested: 820..380 runs on the inner lane at 530, 240..960 on the outer lane at 562, so
         neither vertical crosses the other horizontal.
         Every headed lane stands at full opacity on every step, whether its endpoint is in the
         rules or not: `stage()` shades only the agent Pods.
         The kube-proxy to dataplane links and the Service bus are `P.relation`: kube-proxy writes
         the rules and never forwards, and the Service is read, never travelled.
MOTION   Programming comes before traffic on every step. The policy chip and the dims stand from
         entry, each rule set flips at RULES_MS 300 with its kube-proxy lighting on the same beat,
         the calls start at CALL_MS 600, and only `result` waits for a ball: it reads `none` from
         entry until that ball lands. On `cluster` the rule sets are already written, so both
         kube-proxies stand lit from entry beside the two rule chips they wrote. `cluster` runs both
         calls at once: dataplanes lit at 1500, the inner leg (484 units, 1076ms) lands 2676, the
         outer (828 units, 1840ms) 3440, the agent-2 pulse ends 4340, duration 4800. `local`:
         dataplanes at 2100, local legs land 2900,
         pulses end 3800, duration 4200. `no-local-backend`: the Node-2 ball lands on its dataplane
         at 2100 and nothing leaves it, span 2660 with the arrival ripple, duration 3300. A
         real-time playthrough (`tools/settled-dump.mjs`) reads the settled strip as Cluster /
         both / both / crossed Nodes, Local / agent-1 / agent-2 / stayed on its Node, and Local /
         agent-1 / drop / dropped on Node-2.
         The four client hops are 38 units and run on the 700ms floor at 0.054 u/ms.
         The riding tags ride the cross legs only, dy 18 below the ball and TWIN 70 behind it, and
         live exactly as long as their route ball (M-30a, `inMs: 200, outMs: 200, hold: 0`). At departure each stands centred on its
         dataplane axis between the two verticals of that frame bottom: at 1280x860, where it inks
         widest, 830.2..949.8 and 110.2..229.8, 10.2 clear of both, and 7.5 under the frame bottom.
         Trailing is the only side clear at departure: a tag leading its ball stands over its own
         lane as the ball drops. Trailing, it crosses that lane as the ball rises and stays up to
         the arrival, which is accepted: a tag never retires before its ball lands. On the
         outer lane the tag inks 569.5..583.1, 12.9 clear of the chip tops at 596, and on the inner
         lane 537.5..551.1, 10.9 clear of the outer lane.
WIRE LABELS
         The readiness notes sit at NOTE_Y 494, between the agent bottom at 474 and the frame bottom
         at 508, and ink 483..497.7 at 1100x800. They carry the endpoint condition spelling
         `ready=true` and `ready=false`.
CONTENT  Read against release-1.35: website `service-traffic-policy.md` and `virtual-ips.md`, and
         in kubernetes/kubernetes `pkg/proxy/topology.go`, the iptables, nftables and IPVS
         proxiers, `cmd/kube-proxy/app/server_linux.go`, core/v1 and discovery/v1 `types.go` and
         `staging/src/k8s.io/endpointslice/utils.go`, plus the KEP for this field (2086).
         Cluster is the default and writes every ready endpoint, Local only the ready node-local
         ones (`virtual-ips.md`, Internal traffic policy). With no usable local endpoint the
         iptables proxier writes a filter rule on the ClusterIP and port, `-j DROP` commented
         `has no local endpoints`, and nftables a `drop` verdict. `REJECT` is only for a Service
         with no endpoints anywhere. A DROP answers nothing, so a TCP connect waits out its own
         timeout instead of being refused at once. So the narration says `writes a DROP rule for
         the ClusterIP` and `hangs until it times out`, the aria-label says the rules `drop its
         call`, and the `Node-2 rules` chip reads `drop`. `writes an empty rule set`, `the Node-2
         rules are empty` and the value `none` are rejected: a rule is written, and it drops.
         kube-proxy programs the rules from a control loop that keeps them `reliably synchronized`
         with the API (`virtual-ips.md`), batched by `minSyncPeriod`, so a call made between the
         field change and a Node's sync still runs the old rules. So `local` says `On the next
         sync, kube-proxy on each Node rewrites its rules`, and `each kube-proxy rewrites its rules
         before any call` is rejected: it states the staged order of the picture as a guarantee.
         The sync clause opens its own sentence because `each kube-proxy` and `and kube-proxy`
         both break the name at its hyphen at a line end, at 1280x860 and 1600x1000 or at 1100x800.
         An empty `mode` defaults to iptables on Linux (`platformApplyDefaults`), and the docs say
         `the default iptables mode`. The IPVS proxier gives the ClusterIP every cluster endpoint
         when Local has none locally (`syncEndpoint`), and IPVS mode is deprecated in 1.35. So the
         drop is stated `in the default iptables mode`, and the desc says `in iptables mode`.
         Local does fall back, to serving and terminating endpoints on the SAME Node, when no
         local endpoint is ready (`CategorizeEndpoints`, and `Traffic to terminating endpoints` in
         the docs). So the card says `never falls back to another Node`, and `Local has no
         fallback` is rejected. agent-2 is ready=false and not terminating: `ready` is `serving
         && !terminating` and the fallback takes only `serving && terminating`, so it leaves
         every rule set.
         `types.go` gives both policies the same two values, Cluster and Local, but the external
         Local also keeps the client IP and gets a health check port. `the east-west twin of
         externalTrafficPolicy` is rejected as more than the values share.
         A DaemonSet runs on `all (or some)` Nodes, and a Pod on a Node with no local endpoint sees
         the Service as having none. So `while every Node with callers runs a ready agent` ships,
         and `while every Node runs a ready agent` is rejected. The KEP for this field (2086) names
         a logging daemon or a metrics agent as its user story, so `a log shipper or a metrics
         agent` ships and `a per-node cache` is rejected: `network-nodelocal-dnscache` reaches its
         agent on a link-local address, not through this field. `This is how a Pod reaches` is
         rejected as an absolute.
         `ClusterIP 10.96.0.30:80` and the tags `dst ...:8080` are a Service port and its
         targetPort, the same pairing `network-service-clusterip` draws.
SCOPE    Zone hints and the fallback to every ready endpoint are `network-traffic-distribution`. The
         external twin, with its health check, is `network-external-traffic-policy`. Serving
         terminating endpoints is `network-service-terminating-endpoints`, and a Service with no
         endpoint anywhere is `network-service-debugging`.
NOTE     `policyChip` on `local` stands from entry and is carried as FORM-E in
         `test/fixtures/carried.mjs`: the field is set before anything is dialled. The two rule
         chips are not carried: they turn over on the kube-proxy beat, which is the actor that
         writes them. The two R2-ENTRY rows on `no-local-backend` (`Node-1 rules`, `Node-2 rules`)
         compare its entry against the REWOUND entry of `local`, where both chips still read both
         agents for 300ms. The settled `local` already reads `agent-1` and `agent-2`.
         A seek frame of `local` or `no-local-backend` shows the rule chips unwritten and kube-proxy
         dark at every freeze point: the RULES_MS write and light are deferred callbacks (`M-35`).
         Played in real time both read written and lit by 450ms.
         `SCENE.reset` lists the inner boxes by key (`NET.S-02`), and every step states all six
         dimmable keys through `stage()`, so a dim set by one policy cannot leak into the next.
         The four lanes in that field read 1 on every step, so the cross legs under Local and
         `loc2` beside the dimmed agent-2 stay full while the agent itself dims.
WHY NOT  A riding tag on the 38 unit hops inside a frame. Above the hop kube-proxy fills the band,
         and below it the clear band starts 80 units off the default offset, past the ceiling.
         Cross legs landing under the agent, at 496 and 1076. Each is then alone on its frame
         bottom, 186 off the midpoint (34% of the face), which `unit/spec-scene.test.mjs` OFFEDGE
         and `render/geometry.test.mjs` both fail.
         The rule chips written at entry. `unit/chip-beat-e.test.mjs` fails three FORM-E records
         against the `result` beat on the same steps.
DO NOT   Put kube-proxy on the flow line or let a ball enter it. It writes the rules the dataplane
         runs, and a ball through it teaches the userspace proxy that no longer exists.
         Draw a lane out of the Node-2 dataplane on `no-local-backend`. The absent second hop is
         the drop.
```
