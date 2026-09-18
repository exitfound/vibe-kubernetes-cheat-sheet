## network-loadbalancer-bare-metal

### layout

```
WHAT     With no cloud to provision a balancer, an in-cluster implementation first ALLOCATES the
         address and then has to ANNOUNCE it. The MetalLB controller writes 203.0.113.9 into the
         Service status, and the speakers on the Nodes tell the upstream router where it lives,
         by ARP in layer 2 mode and by BGP in BGP mode, before any client traffic comes down.
LAYOUT   Two sources on the top row and a LOW router over the Node row. The clients stand on x 600,
         204 over the router. The MetalLB controller stands straight over Node-3, x 854..1086, and
         what MetalLB holds for Service web hangs under it as a column captioned `for Service web`,
         so the write is a 40 unit drop from the controller onto `loadBalancer`. The caption starts
         at 854 and has to end before the write arrow at x 970, which `Service web and MetalLB
         config` runs through. Control plane on the right, data path down the middle.
         The lever no sibling in `external-traffic` carries: announcements travel UP from the Nodes
         to the router before traffic comes DOWN. Every Node reaches the router by its own lane
         PAIR, the down leg entering its top face at NODE_CX - 12 and the announcement leaving at
         NODE_CX + 12, so no stretch of lane is shared and no vertical is drawn twice. `kin.mjs
         --id` prints this card and `network-nodeport-loadbalancer` with one lever set (frames tag
         fan chiprow strip grid deep) and cannot see the difference: that sibling fans DOWN from a
         balancer on top, and nothing in it rises.
         The router stands low so its SIDE faces can take the Node-1 and Node-3 pairs as elbows on
         two rails, UPPER 328 and LOWER 352, and its bottom face the straight Node-2 pair at 588
         and 612. Every pair is 24 apart, the half-gap of 12 every paired request and reply in the
         section uses (`LANE_DY`): at 50 and 60 the two lanes of one pair read as two routes. The
         outer elbow of each pair takes the upper rail and the inner one the lower rail, the one
         nesting in which no two lanes cross. A router on the top tier puts all six lanes on its
         bottom face 40 apart, where the riding tag of any one crosses the next.
         Three equal Node frames on the NODE_X grid of `network-nodeport-loadbalancer`, 300 wide at
         a 70 gap across 80..1120, each holding a `speaker` chip, since the speaker is a DaemonSet
         on every Node, and a Pod web. The chip column spans 854..1086 and the speaker chips
         114..1086, so the chips centre on x 600 (`L-13`).
PANEL    Deepest at 1100x800 on `l2`, `failover` and `bgp`, 279.51, from
         `OVERLAY_IDS=network-loadbalancer-bare-metal node --test report/overlay.test.mjs` in
         `scheme/test/`. The poster frame and `pool` read 254.66 there. 1280x860 reads 235.17 and
         1600x1000 194.89 on every step. The only content left of x 420 is the Node-1 pair: the down
         rail at UPPER 328 clears the deepest reading by 48.49, and the Node-1 frame top at 440 by
         160.49. The `ARP reply` tag rides under the lower rail on `l2`. The clients and the router
         start at x 484 and the controller at 854. The `bgp` narration is at its line budget: at 425
         characters it takes an eleventh line at 1100x800, 304.36, which leaves the upper rail 23.64
         clear.
SIZES    Every actor is NET.L-01 232 by 80, and every chip on the card is 232 wide, 34 tall in the
         chip column and 32 inside the Nodes. The widest pair the column writes is `address pool`
         and `203.0.113.0/24`, 82.7 and 96.5 at 1600x1000, which leaves 28.8 between them. The
         widest router sublabel is `203.0.113.9 at Node-1`, 126.6 at 1600x1000, 52.7 inside either
         wall. NODE_H 184 puts the frame bottom at 624, mirroring the top row at 16: the speaker
         chip sits 30 under the frame top, clear of the frame label, and the Pod 12 under the chip.
LANES    Ridden: `CTRL_WRITE` on `pool`, `UP[0]`, `C_LANE` and `DOWN[0]` on `l2`, `UP[1]`, `C_LANE`
         and `DOWN[1]` on `failover`, and every lane but `CTRL_WRITE` on `bgp`, so each arrowhead
         carries a ball on some step and none is carried on `A-05`. One points array feeds each wire
         and its ball. Pairs about a face midpoint (`L-12`): the router left and right faces at 328
         and 352 about ROUTER_CY 340, the router bottom at 588 and 612, and each Node top face at
         NODE_CX +-12. Every lane stays at full on every step.
MOTION   Every ball that starts a step waits BEAT.lead behind a lit sender (`M-18a`): the controller
         on `pool` and the speaker chip of the announcing Node on `l2`, `failover` and `bgp`. The
         clients are lit at entry on those three and send only once the announcement has landed.
         No ball lands on the clients, so they are not a mid-chain block and `lit` is the only cue
         `M-18a` allows them: naming them in the `lights` of the announcement hop instead is the
         third shape it rules out, and `report:arrival/R4` flags all three steps for it.
         The `loadBalancer` chip reads pending while the write is in flight: `rewind` holds pending
         and one `F.set` writes 203.0.113.9 on the `alloc` arrival. The router sublabel is the
         router table and turns over the same way: `no entry` until the `l2` ARP reply lands,
         `203.0.113.9 at Node-1` held on `failover` until the gratuitous ARP lands, and `no route`
         on `bgp` until the last UPDATE lands, then `ECMP: 3 next hops`.
         On `l2` Node-1 takes the connection and its own Pod pulses while the Pods on Node-2 and
         Node-3 stay at full: the narration says kube-proxy spreads connections across all ready
         Pods, and a dimmed Pod would deny it.
         On `failover` Node-1 stands at OPACITY.pending, frame, speaker chip and Pod, with
         `unreachable` on its label row and the speaker reading `down`, lit at entry like every
         speaker chip whose value changes on a step (`P-05`). Node-3 is healthy, `idle` and at full,
         so the failed Node is drawn apart from the Node that simply does not own the address.
         `bgp` sends the three UPDATEs together at BEAT.lead. Node-2 lands at 1500, Node-1 at 1533 and
         Node-3 at 1640, on three different router faces. Three client flows follow 180 apart, each
         hashed
         onto its own Node, and only the first lights the router. Their rings on the router top face
         are the STAGGERED tier of `report/ripple-double.test.mjs`.
         Durations sit at 10.85 to 12.32 ms per character, over the catalog median `timing.mjs`
         prints: `l2` is bound by its span of 4840, `failover` by 4000 and `bgp` by 4533.
         The ARP reply is the one explicit ball duration: 330 units at ARP_DUR 1400, 0.236 u/ms,
         under the catalog median `pace.mjs` prints. routeDur gives it 733ms, and the `ARP reply` tag
         would retire before it is read. It is registered in `PACING` in `render/motion.test.mjs`.
WIRE LABELS
         One wire, `n1state`, right-aligned on the Node-1 label row: `unreachable` on `failover` and
         blank on every other step, written statically so prev and reset show it (`T-30`). The one
         riding tag is `ARP reply` on `l2`. It rides dx -45 and dy 22, trailing the ball UNDER the
         lower rail, so it never enters the router at the arrival and never prints across the upper
         rail 24 above. It emerges 750 in, once the ball is far enough along the lower rail that the
         text clears the Node-1 announcement vertical at x 242, and reads for about 650ms. The
         address is not on the tag: the router sublabel carries it the moment the reply lands.
CONTENT  The claims are read against kubernetes.io for release 1.35 (the Service page) and against
         metallb.io: the concepts, layer 2, BGP, installation, configuration, advanced BGP and usage
         pages, plus `speaker/layer2_controller.go` and `speaker/bgp_controller.go` in
         metallb/metallb where the pages are silent.
         `pool` says no cloud provider implements load balancers: the Service page has `Kubernetes
         does not directly offer a load balancing component, you must provide one, or you can
         integrate your Kubernetes cluster with a cloud provider`. `the IPAddressPool the operator
         declared` is `you do have to give it pools of IP addresses that it can use`. The
         controller allocates and the speaker announces: `the cluster-wide controller that handles
         IP address assignments` and `the component that speaks the protocol(s) of your choice to
         make the services reachable`. `An allocated address is not a reachable one` is `After
         MetalLB has assigned an external IP address to a service, it needs to make the network
         beyond the cluster aware that the IP lives in the cluster`.
         The column caption is `for Service web`. `Service web` alone is rejected because only
         `loadBalancer` is a Service field: the pool is an IPAddressPool (`MetalLB must be instructed
         to do so via the IPAddressPool CR`) and the mode is an L2Advertisement or BGPAdvertisement
         (`an L2Advertisement instance must be associated to the IPAddressPool`). A Service names a
         pool at most through the `metallb.io/address-pool` annotation.
         `l2` says `sorts the eligible Nodes by a hash of Node and address`. `hashes Node and address
         the same way` is rejected because the hash runs over candidates only: `each speaker
         collects the list of the potential announcers of a given IP, taking into account active
         speakers, external traffic policy, active endpoints, node selectors and other things`, then
         `gets a sorted list of a hash of node+VIP elements and announces the service if it is the
         first item of the list`. The source sorts by sha256 of node and IP after an optional
         per-Node preference score, and under Local keeps only Nodes with a ready local endpoint,
         which SCOPE hands on. The step names no election beyond that.
         `kube-proxy, under the default Cluster policy, spreads connections across all ready Pods`
         is `kube-proxy spreads the traffic to all the service's pods`, and the clause is required:
         `With the Local traffic policy, kube-proxy on the node that received the traffic sends it
         only to the service's pod(s) that are on the same node` (usage page).
         `failover` says the other speakers `detect it through memberlist and drop it from the
         candidates`. `drop it from the hash` is rejected: what shrinks is the candidate list, and
         `the failed node is detected using memberlist, at which point new nodes take over
         ownership`. The wire reads `unreachable`, and `NotReady` is rejected because MetalLB
         `relies on memberlist to know when a node in the cluster is no longer reachable`, not on
         the Node Ready condition: both controllers and `internal/k8s/nodes` read only the
         NetworkUnavailable condition and the exclude-from-external-load-balancers label.
         It keeps `usually` in front of the few seconds, because the page conditions it: `Most
         operating systems handle gratuitous packets correctly ... In that case, failover happens
         within a few seconds`. The bandwidth sentence takes the page verb, `limits ... to that of
         a single Node`, from `your service's ingress bandwidth is limited to the bandwidth of a
         single node`. `connections that went through Node-1 are lost` is quoted from no page: it is
         the drawn failure itself, since Node-1 was the Node forwarding them.
         `bgp` says `a router with multipath on` because `Assuming your routers are configured to
         support multipath, this enables true load balancing`, and `typically hashes` because `The
         exact behavior of the load balancing depends on your specific router model and
         configuration, but the common behavior is to balance per-connection, based on a packet
         hash`. `Per-connection means that all the packets for a single TCP or UDP session will be
         directed to a single machine` is why it hashes each connection, not each packet. It takes
         `you should expect all active connections to your service to be broken` and `resilient
         ECMP` from the BGP page, so it carries no softer quantifier.
         The router sublabel reads `no route` before the UPDATEs, a missing BGP route, and `no entry`
         on `idle`, `pool` and `l2`, a missing neighbour entry. `ECMP: 3 next hops` is `the routes
         published by MetalLB are equivalent to each other, except for their nexthop`. The card
         states no prefix length: MetalLB `will advertise each IP as a /32` by default.
         Every speaker advertising is true of this drawing under either policy: both controllers
         need a ready endpoint somewhere, and under Local the Node needs its own (`Local && there's
         a ready local endpoint`), and every Node here runs a Pod web. The desc `every Node
         advertises it` is the concepts page `all machines in the cluster establish BGP peering
         sessions with nearby routers`.
SCOPE    What externalTrafficPolicy Local does to a Node with no local endpoint, and the health check
         that steers a balancer off it, is `network-external-traffic-policy`. MetalLB announcing only
         from Nodes with a ready local endpoint under Local is drawn on neither card. A LoadBalancer
         the cloud provisions is `network-nodeport-loadbalancer`. A balancer delivering straight to
         Pods is `network-loadbalancer-direct-to-pods`, and ipMode is drawn on no card.
NOT A DEFECT
         `pool` stands still for about 2040ms after its one hop (`deadair.mjs`) at an ordinary 10.85
         ms per character. The step carries the premise of the whole card, and a second hop would be
         a ball for traffic nothing narrates (`M-10`).
         The `address pool` chip reads 203.0.113.0/24 from `idle` on. The operator declares the pool
         before MetalLB allocates from it, and turning it over at `pool` entry while `loadBalancer`
         waits for the arrival is the FORM-E shape for a value no arrival produces.
         The Node-2 pair and the `pool` write are 60 and 40 units and floor at 700ms, 0.086 and 0.057
         u/ms: nine and three other cards run those lengths (`pace.mjs`), which is `M-13`.
         A frozen frame shows no `F.set` write, so the router sublabel reads `no entry` on the `l2`
         -50 frame and the entry value on the -95 frames of `failover` and `bgp`. Real play turns it
         over on each arrival and `gotoStep`, prev and reset land on the step value
         (`settled-dump.mjs`). `report:arrival/R2-ENTRY` lists `loadBalancer` on `pool` for the same
         reason: its t=0 sample precedes the `alloc` arrival that cues it, and R2-STEP is clear.
```
