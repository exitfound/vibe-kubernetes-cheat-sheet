## network-external-traffic-policy

### layout

```
WHAT     externalTrafficPolicy decides whether a Node may hand external traffic to a Pod on another
         Node. Cluster spreads over every ready Pod but SNATs the client away on every connection,
         even one the Node serves itself. Local keeps the client IP and serves only local Pods, so a
         Node with none drops the traffic until a health check steers the balancer off it, and a
         balancer that cannot weight its targets then spreads load per Node rather than per Pod.
LAYOUT   A cloud balancer fanning onto an UNEVEN Node row: Pod web-1 and web-2 on Node-1, web-3 on
         Node-2, and nothing on Node-3. The client stands on x 600 over the balancer, both right of
         the panel wall, and three equal Node frames sit on the NODE_X grid of
         `network-nodeport-loadbalancer`, 300 wide at a 70 gap across 80..1120.
         The lever is the `share` readout under every Pod: what each Pod takes of the connections
         the balancer sends, 33/33/33 under Cluster, 17/17/33 under Local before the health check,
         25/25/50 after it. No sibling in `external-traffic` draws a per-Pod proportion, and the
         uneven cast is what makes it move: a drop needs a Node with no Pod, and an imbalance needs
         two Nodes that run different counts. `kin.mjs --id` prints `levers no sibling has: (none)`
         because it counts chips and Pods, not what a chip reads, so the lever is argued here.
         With the panel covered, `nodeport-loadbalancer` is a client BESIDE the balancer with Pods on
         the outer Nodes and a Service row, and `loadbalancer-bare-metal` is a low router with lane
         pairs rising from every Node. This card is a vertical client over balancer, a row of Pods
         2/1/0, and a percentage under each.
         Every Node leg leaves the balancer bottom on its OWN exit, x 530, 600 and 670, so no stretch
         of lane is shared and no vertical is drawn twice. The Node-3 to Node-2 hop runs frame face
         to frame face across the gap at NODE_CY 451.
PANEL    Deepest at 1100x800 on `imbalance`, 254.66: `OVERLAY_IDS=network-external-traffic-policy node
         --test report/overlay.test.mjs` from `scheme/test/`. It reads 229.82..254.66 at 1100x800,
         192.67..213.92 at 1280x860 and 160.00..177.44 at 1600x1000, right edge 396.55 at 1100x800.
         The only content left of x 420 is Node-1: its bus at BUS_Y 300 clears the deepest reading by
         45.34. The `src 198.51.100.9` tag riding over that bus inks from 276.2 and rides it on
         `cluster-snat` and `local`, which read 229.82, 46.38 clear. The Node-1 note inks
         335.0..349.7 and the frame top is 356. Client and balancer start at 484.
         Every narration is 294 to 345 characters. Every step but `imbalance` reads 229.82 at
         1100x800, and a longer narration on `cluster-snat` or `local` deepens the panel toward
         that tag.
SIZES    The client and the balancer are NET.L-01 232 by 80. The widest string either carries is
         `healthy: Node-1, Node-2`, 138.7 at 1600x1000, 46.6 inside each wall.
         A Pod is 128 wide because Node-1 holds two: (300 - 2 x 14 - 16) / 2, the row sizing the
         block (NET.L-01 third clause). Its share chip is the Pod width, 128 by 30, one size on all
         three: `share` and `33%` ink 34.5 and 20.7 at 1600x1000, 48.8 apart.
         The Service strip is four chips of one size, 232 by 34 at a 16 gap across 112..1088. The
         tightest pair is `externalTrafficPolicy` and `Cluster`, 144.7 and 48.2 at 1600x1000, 15.1
         apart. `client src IP` against `lost (SNAT)` and `healthCheckNodePort` against `32021`
         leave 42.6 each.
         NODE_H 190: the Pod stands 34 under the frame top, its share chip 12 under the Pod and 10
         over the frame bottom at 546. The strip bottom at 624 mirrors the client top at 16.
         Node-3 carries its emptiness as a caption centred in the frame, `no Pod web runs here`,
         137.8 at 1600x1000.
LANES    Ridden: `C_LANE` on `cluster`, `cluster-snat`, `local` twice and `imbalance` four times.
         `TO_N1` on `cluster-snat`, `local`, `healthcheck` and twice on `imbalance`. `TO_N2` on
         `healthcheck` and twice on `imbalance`. `TO_N3` on `cluster`, `local` and `healthcheck`.
         `CROSS` on `cluster`. Every arrowhead carries a ball on some step, so nothing is carried on
         `A-05`, and one points array feeds each wire and its ball.
         The outer exits at 530 and 670 are a mirrored pair about the balancer bottom midpoint, with
         the middle leg on it (`L-12`). They are three alternatives 70 apart, not an out and back
         pair: no reply travels on this card, so no lane pair and no `LANE_DY` is drawn.
         Every lane stays at full opacity on every step, and no step carries an `opacity` field. On
         `local`, `healthcheck` and `imbalance` the policy forbids the cross-Node hop, and that is
         said by not riding it and by the narration, never by a faded lane. No block is dimmed:
         every block on the card exists on every step.
         A ball stops on the frame face it is delivered to and the Pod inside pulses (`NET.A-02`).
         The `cluster` ball fades into Node-3 on its top face and re-emerges on its left face, which
         is where the SNAT is drawn (`NET.A-01`).
MOTION   The sender is lit before its ball (`M-18a`): the client in `lit` on the four client steps,
         each first ball at BEAT.lead, and the balancer lighting on the client lane arrival as the
         mid-chain block. On `healthcheck` the balancer is the one in `lit` and sends the probes.
         `cluster`: client lane 800..1500, Node-3 leg 1600..3100 and its note, cross hop 3200..3900,
         Pod web-3 pulse to 4800. `client src IP`, `extra hop` and the three shares are what web-3
         receives, so `rewind` holds the idle `none` and one `F.set` writes them on the hop arrival.
         Duration 5200.
         `cluster-snat`: Node-1 leg 1600..3100, Pod web-1 pulse to 4000, `extra hop` turning yes to
         no and the note `SNAT · served locally` on that arrival. Duration 4300.
         `local`: the served connection lands on Node-1 at 3100 (Pod web-2 pulses, `client src IP`
         turns preserved). The dropped one leaves the client 700 behind the first, at 2300, and dies
         on the Node-3 top face at 4600 with nothing leaving it, which writes 17/17/33 and
         `no local Pod · dropped`. Its ring ends at 5160. Duration 5400.
         `healthcheck`: probes leave PROBE_GAP 500 apart at 800, 1300 and 1800 and land at 1778, 2000
         and 2778, each answer written where it lands, and the balancer sublabel retargets on the
         last. The ring ends at 3338. Duration 3800.
         `imbalance`: four connections leave SPREAD 600 apart from 800, alternating Node-1 and Node-2,
         landing at 2578, 2900, 3778 and 4100. Node-1 hands one to web-1 and one to web-2, Node-2
         both to web-3, and the shares turn to 25/25/50 on the last arrival. Pulse ends at 5000.
         Duration 5400.
         Paces run 12.91 to 15.74 ms per character against a catalog median of 10.56 (`timing.mjs`),
         and still time is only 7 to 15 percent of each step, 27 on `healthcheck` (`deadair.mjs`).
         The steps are bound by their motion, not by a hold.
         Four balls carry an explicit duration: every ball on an outer leg that carries a tag,
         440 units at LEG_DUR 1500, 0.293 u/ms against the catalog median 0.274. routeDur gives
         978ms and the tag retires before it is read. The untagged probe and imbalance balls on the
         same legs keep routeDur. `PACING` in `render/motion.test.mjs` carries the four.
WIRE LABELS
         Three notes, `n1`, `n2` and `n3`, on baseline NODE_Y - 10, inking 335.0..349.7: 35 under the
         bus and 6.3 over the frame tops. `n1` and `n2` start NOTE_DX 20 right of their lane, `n3`
         ends 20 left of its lane, which is the side of each lane no tag rides. At 12 the arrival
         ring, r 9 scaled to 27, sweeps the first or last glyph of the note it has just written at
         about 60 percent opacity. The widest is `200 · localEndpoints 1`, 620..771.6 at 1600x1000,
         and `503 · localEndpoints 0` starts 798.4 there.
         Each note is stated in `wires`, blanked in `rewind` and written by an `F.set` on the arrival
         that produces it, so prev and reset show it (`T-30`). `503 · unhealthy` on `imbalance` is
         stated at entry: no ball of that step lands on Node-3.
         One riding tag, `src 198.51.100.9`, on the tagged outer legs. It inks 98.2 at 1100x800, so
         at dx -54 on the Node-1 leg and +54 on the Node-3 leg its near edge stands 4.9 off the
         vertical. It emerges 300 in, clear of the balancer bottom, and retires on arrival (hold 0).
         There is no tag on the middle leg, whose left side is the Node-1 exit 70 away, on the probes,
         which the balancer sublabel and the answers name, or on the 70 unit cross hop between two
         frames, which the `SNAT · forwarded` note names.
CONTENT  Read against release-1.35 of the Virtual IPs and Service Proxies page (External traffic
         policy, Traffic to terminating endpoints), the Using Source IP tutorial and the Create an
         External Load Balancer task (Preserving the client source IP, Caveats and limitations), and
         where the pages are silent against `pkg/proxy/iptables/proxier.go`,
         `pkg/proxy/nftables/proxier.go`, `pkg/proxy/topology.go`,
         `pkg/proxy/healthcheck/service_health.go`, `pkg/api/service/util.go` and
         `pkg/registry/core/service/storage/alloc.go`.
         `every Node accepts its traffic` is `Cluster to route external traffic to all ready
         endpoints`. `Spread at random over all ready Pods, each takes about a third` is the same
         sentence, and `at random` and `about` stay because kube-proxy picks the endpoint per
         connection by probability, so a third is the expected share: `each Pod takes a third` is
         rejected as an exact split no rule makes. `SNATs the connection to its own address` is the
         tutorial `node2 replaces the source IP address (SNAT) in the packet with its own IP address`.
         `cluster-snat` rests on `Packets sent to Services with Type=LoadBalancer are source NAT'd by
         default` and on both proxiers, where the external chain of a Service whose policy is not
         Local jumps to the masquerade mark before any endpoint is picked (`If we are using non-local
         endpoints we need to masquerade, in case we cross nodes`), so the local connection is marked
         too. Node port, load balancer IP and external IP traffic all enter that one chain, so it
         holds whichever address the balancer delivers to. It says `a Node-1 address` and not the
         Node IP: masquerade takes the address of the outgoing interface, and the tutorial output
         returns a Pod network address from the Node that runs the Pod.
         `local`: `serves only its own Pods, forwards nothing to other Nodes and does no SNAT` is
         `kube-proxy only proxies proxy requests to local endpoints, and does not forward traffic to
         other nodes. This approach preserves the original source IP address`, and `drops them` is
         `If there are no local endpoints, packets sent to the node are dropped`, a filter DROP
         commented `has no local endpoints` in the iptables proxier. `The API server allocates
         healthCheckNodePort 32021` is `NeedsHealthCheck`, type LoadBalancer and policy Local,
         calling `allocHealthCheckNodePort` in the Service registry, which keeps a value the user set
         and otherwise takes the next free node port. `The field also allocates` is rejected because
         a field allocates nothing, and the task page `the service controller allocates a port` is
         rejected because the allocation is in the registry code. `until the balancer acts on it`
         is `Wait about 10 seconds for the 2 nodes without endpoints to fail health checks`. 32021
         sits in the default Node port range. `Pods web-1 and web-2 split a third` is what the 17%
         chips state: Node-1 still receives a third, halved over two Pods, and 17% is one sixth
         rounded. The third Node-3 receives is the `no local Pod · dropped` note, which is why the
         shares on this step sum to 67.
         `healthcheck`: the tutorial `points to a port on every node serving the health check at
         /healthz`, and the handler has no path of its own, so any path answers the same. `A healthy
         kube-proxy answers from its count of ready local endpoints` is `hcHandler.ServeHTTP`,
         `if count != 0 && kubeProxyHealthy` writing `http.StatusOK` and otherwise
         `http.StatusServiceUnavailable`, with the count from `LocalReadyEndpoints`, and the Virtual
         IPs page `For Local Services: kube-proxy will return 200 if kube-proxy is healthy/ready, and
         has a local endpoint on the node in question`. `kube-proxy answers with the count of local
         endpoints` is rejected for dropping both `healthy` and `ready`. The body carries
         `localEndpoints` and `serviceProxyHealthy`, and the notes quote the first. The answers are
         notes written where each probe lands, not reply balls, because the card draws no return
         lane. `marks Node-3 unhealthy`, the sublabel `healthy: Node-1, Node-2` and the note
         `503 · unhealthy` on `imbalance` are the tutorial `nodes without endpoints to fail health
         checks` and `remove themselves from the list of nodes eligible for loadbalanced traffic by
         deliberately failing health checks`. `takes Node-3 out of its targets`, `targets Node-1,
         Node-2` and `503 · not targeted` are rejected: the controller configures every Node as a
         target with `HTTP health checks pointing to this port/path on each node`, and a failing
         Node stays configured and probed.
         `imbalance` says `A balancer that cannot weight its targets` because the task page says
         `Load balancing services from some cloud providers do not let you configure different
         weights for each target`, and the handler also sends `X-Load-Balancing-Endpoint-Weight`,
         which a weighting balancer can use. `per Node, not per Pod` is `The external load balancer
         is unaware of the number of Pods on each node`. `about half each` carries the same hedge as
         `about a third`. `Spreading Pods evenly across Nodes` is derived: equal counts per Node make
         a per-Node split a per-Pod one, which the page states for its limiting cases. It `reduces`
         the imbalance, and `avoids it` is rejected because topology spread constraints bound the
         skew between Nodes rather than make the counts equal.
         The `desc` says `an unweighted balancer splits load per Node` and the aria-label `a balancer
         that cannot weight its targets`: `spreads load per Node rather than per Pod` with no
         balancer named is rejected as true only of a balancer that cannot weight.
SCOPE    What the backend sees behind a proxy that terminates the connection, X-Forwarded-For,
         Forwarded and the PROXY protocol, is `network-client-ip-preservation`: this card assumes a
         balancer that forwards packets and keeps their source. The node port allocation and the
         KUBE-NODEPORTS DNAT are `network-nodeport-loadbalancer`. A balancer that targets Pods
         instead of node ports is `network-loadbalancer-direct-to-pods`, and ipMode is drawn on no
         card. The internal twin is
         `network-internal-traffic-policy`, and a LoadBalancer with no cloud is
         `network-loadbalancer-bare-metal`.
         Under Local a Node with no ready local endpoint still forwards to its local endpoints that
         are serving and terminating (`CategorizeEndpoints` in `pkg/proxy/topology.go`, the page
         `If there are local endpoints and all of them are terminating`), so connections drain
         between health checks, while its health check already answers 503 because it counts ready
         endpoints only. This card draws only ready Pods, and no card draws that fallback. Serving
         and terminating endpoint conditions in general are `network-service-terminating-endpoints`.
NOTE     The shares are the balancer split divided over the Pods that receive it. Under Cluster
         kube-proxy picks from all three ready Pods whatever Node the balancer chose. Under Local
         before the health check each Node still gets a third, Node-1 halves its third over two Pods
         and Node-3 drops its own, so 17/17/33 sums to 67 and the missing third is the drop. After
         the check each healthy Node gets half.
WHY NOT  One trunk out of the balancer bottom splitting onto a bus, the fan every sibling draws. Two
         or three lanes then share the first stretch and draw it twice, so that vertical reads
         brighter than every other lane on the card.
         A frame label `Node-3   ·   no Pod web`. At 1600x1000 its text runs into the arrowhead at
         x 970 and the ring a ball leaves there, which is why the emptiness is a caption in the
         middle of the frame.
DO NOT   Fade the cross-Node lane, or any lane, on the Local steps. Every lane stays at full on
         every step: a path the policy switches off is said by the narration and by no ball riding
         it, and a faded lane is the one thing that is not allowed.
         Give Node-3 a Pod or a share chip to balance the row. Node-3 running nothing is both the
         drop and half of the imbalance.
NOT A DEFECT
         A frozen frame shows no `F.set` write, so every `-50` and `-95` frame reads the rewound
         readouts, notes and sublabel (`M-35`). Real play writes each on its arrival
         (`tools/settled-dump.mjs`), and prev and reset land on the step values.
         `local` turns `externalTrafficPolicy` and `healthCheckNodePort` over at entry while
         `client src IP` and the shares wait: carried on FORM-E in `test/fixtures/carried.mjs`, the
         field and the port it allocates are the premise of the step.
         Node-3 sends the cross hop on `cluster` uncued: a `node()` frame takes no highlight, the
         constraint `scheme/CLAUDE.md` names under the constraints a card cannot close.
OPEN     CENTRE and CENTRE-LOW, both carried in `test/fixtures/carried.mjs`. The strip reads 94..1088
         on centre 591 because `L-17` pools the share chips with the Service strip, which itself is
         112..1088 on centre 600. The blocks below the panel are the three Pods, 94..664 on centre
         379, because Node-3 runs none. Centring them means a Pod on Node-3, which removes both the
         drop and the imbalance the card exists for.
```
