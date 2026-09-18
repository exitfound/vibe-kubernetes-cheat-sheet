## network-nodeport-loadbalancer

### layout

```
WHAT     A NodePort opens one port on every Node, so any Node answers, even Node-2 which runs no
         Pod and passes the request on to the Pod on Node-3, and a LoadBalancer puts one address in
         front of those Nodes. Two entries reach one Node row: the client dials Node-2 directly, and
         later dials the balancer, which picks Node-1.
LAYOUT   Three equal Node columns on an even grid, NODE_X derived from SCHEME_L 80, SCHEME_R 1120 and
         NODE_W 300, so the row centres on x 600 by construction. The backend Pods sit on the OUTER
         Nodes and Node-2 stays empty in the middle, which is the Node the `direct` step dials.
         The client stands BESIDE the balancer, not above it. The balancer fans to all three Nodes,
         and a lane from a client outside that fan reaches Node-2 only by crossing one of its legs,
         so the client sits inside the wedge between the Node-2 leg and the Node-3 leg: the Node-3
         leg leaves the balancer right face above the client lane and passes 20 over the client top,
         and the direct lane drops into Node-2 beside the trunk. A client on top with the direct
         lane crossing the fan bus is the alternative, and two dashed lanes crossing read as a
         junction. The cloud-controller-manager stands straight above the balancer, on LB_CX.
         The ccm, the balancer and the client are one size, 232 by 80, and the client stands
         FACE_PAIR 30 under the balancer, its bottom at 246 against 216. Bottoms flush at one height
         put the client across the whole balancer right face, and the Node-3 leg then has no exit:
         out of the bottom face it crosses the direct lane, and out of the top face it stands alone
         off the midpoint (`L-11`), as does a client lane moved off the client midpoint to pair
         with it. So the client centres on its own lane at LB_CY + 30, the leg leaves at LB_CY - 30,
         10 under the balancer top, and the direct lane drops 30 from the client to the bus.
         The Service fields are a captioned row under the Nodes, `Service web`: five chips of one
         size, 200 by 34 at a 10 gap, spanning SCHEME_L..SCHEME_R, so the strip centres on x 600 and
         reads as one object and not as a value per Node.
PANEL    Deepest at 1100x800, 229.82 on every step: `OVERLAY_IDS=network-nodeport-loadbalancer node
         --test report/overlay.test.mjs` from `scheme/test/`. It reads 192.67..213.92 at 1280x860 and
         160.00..177.44 at 1600x1000. The only content left of x 420 is the Node-1 leg of the fan,
         whose bus at BUS_Y 276 clears the deepest reading by 46.18, and NODE_Y 320 by 90.18. The
         `to Node-1:31000` tag rides that bus in real play, its top 22.4 under the deepest reading
         at 1100x800 and 91.7 at 1600x1000. The ccm, the balancer and the client all start at
         x >= 420 and stand beside the panel.
SIZES    Every actor is NET.L-01 232 by 80. The two-line ccm and balancer ink 24.5 above and 24.8
         below their text at 1100x800, the one-line client 32 either side. The per-Node rule chip is
         280 wide for `chain KUBE-NODEPORTS` and `:31000`, which ink 122.7 and 36.8 at 1100x800.
         The Service chips are one width, 200, set by the widest pair the row ever writes,
         `loadBalancer` and `203.0.113.7`: they ink 82.7 and 75.8 at 1600x1000, where the mono face
         inks widest, and leave 17.5 between name and value there, 31.1 at 1280x860 and 34.9 at
         1100x800. The field takes its ServiceStatus name, `loadBalancer`, the way `port` and
         `targetPort` drop `spec.ports`: five chips at `status.loadBalancer` want 231 each at
         1600x1000 against a row of 1040, and a second row of 34 at the 10 gap wants 78, which
         with its caption does not fit the 94 between the Node bottom at 546 and the canvas bottom
         at 640. POD_Y sits 36 under the rule chip, so the DNAT hop is 36 long:
         at 26 it would be the slowest ball in the catalog (`pace.mjs`, 0.037 u/ms, a length no
         other card runs), and at 36 it shares its length with three cards.
LANES    Ridden: `DIRECT` and `CROSS` on `direct`, `PROVISION` on `lb-provision`, `C_TO_LB` and
         `TO_N1` on `client-hit`, `NP_TO_POD` on `dnat`. One points array feeds each wire and its
         ball. Node-2 top face takes the trunk at 536 and the direct lane at 664, a mirrored pair
         about 600 (`L-12`), and the balancer right face takes the Node-3 leg at 146 and the client
         lane at 206, a pair about LB_CY 176. `CROSS` runs frame face to frame face across the 70
         unit gap at NODE_CY: the direct ball fades into Node-2 on its top face and re-emerges on its
         right face, which is where the DNAT is drawn (`NET.A-01`).
MOTION   Every ball that starts a step waits BEAT.lead behind a lit sender: the client on `direct`
         and `client-hit`, the ccm on `lb-provision`, the Node-1 rule chip on `dnat` (`M-18a`). The
         direct ball lights `np2` as it lands, `CROSS` leaves `after` that arrival, and the Pod on
         Node-3 pulses. The `loadBalancer` chip reads none until the provisioning hop lands, then the
         address: `rewind` holds none and one `F.set` writes 203.0.113.7 at that arrival. The
         balancer does not exist before `lb-provision`, so on `idle`, `nodeport` and `direct` the
         box stands at OPACITY.pending with the sublabel `not provisioned`. Every lane stays at full
         on every step, the shade the section cards give their arrows, so no step dims a lane. That
         same `F.set` brings the box to full and writes the sublabel `203.0.113.7:80`, and `rewind`
         winds both back, so prev and reset agree with play. The
         sublabel is the address the balancer answers on and the chip is the Service status
         recording it, which are two facts, so both are drawn from `lb-provision` on. The sublabel
         carries no `VIP`, the word `client-hit` gives to ipMode.
         Durations sit on the catalog reading pace, 10.49 to 10.63 ms per character against a
         median of 10.53 (`timing.mjs`), except `client-hit` at 3900, 11.37 per character, which
         the slower Node-1 leg below binds (span 3660).
         The Node-1 leg on `client-hit` is the one explicit ball duration: 410 units at LEG_DUR
         1500, 0.273 u/ms, the catalog median. routeDur would give 911, near the fastest ball in the
         catalog, and the tag `to Node-1:31000` would retire before it is read. It is registered in
         `PACING` in `render/motion.test.mjs`.
WIRE LABELS
         There are none, the hops are named by riding tags only (`NET.T-01`): `to Node-2:31000` on the
         direct lane and `to Node-1:31000` on the Node-1 leg. Both legs end in a vertical drop onto a
         Node top face, so each tag rides dx -54, 8 left of its lane at the 92 ink it takes at
         1100x800: centred on the ball, the lane runs through the text and the landing ball and
         ripple touch it. The Node-1 tag emerges 180 in, 10.1 under the balancer bottom at 216 as it
         fades in. The client bottom is 246, and at 180 the direct ball is already on the bus with
         its tag 6.2 under the client (5.7 at 1600x1000), so the Node-2 tag emerges 420 in, once its
         right edge has passed the client left face: in real play it then clears the client by 20.6
         at 1100x800 and 29.2 at 1600x1000, and the Node-2 top face by 11.4.
         `C_TO_LB` is a 48 unit horizontal lane between two blocks, so a tag on it prints across
         both, and the address and port it would carry are drawn anyway, on the balancer sublabel
         and the `port` chip.
CONTENT  The claims are read against release-1.35 of the Service page, Virtual IPs and Service
         Proxies, the Using Source IP tutorial, and `pkg/proxy/iptables/proxier.go` with
         `pkg/proxy/serviceport.go`.
         `nodeport` keeps `every Node proxies that same port`, which is the Service page verbatim:
         `Each node proxies that port (the same port number on every Node)`. `--nodeport-addresses`
         filters which Node ADDRESSES answer and defaults to all interfaces, so it takes no
         qualifier here. The default range is not drawn, so it is not spoken. KUBE-NODEPORTS is
         named `In its default iptables mode` (`Users who want to switch from the default iptables
         mode`, `kubeNodePortsChain`), and the card makes no claim about the other modes. `so Node-2
         answers on 31000 too` is rejected: under Local a Node with no local endpoint `does not
         forward any traffic`, so the step says only that Node-2 has the rule, which holds under
         both policies.
         `direct` puts `under the default externalTrafficPolicy Cluster` in front of the DNAT and the
         forward, not after them: the cross-Node hop is Cluster-only as much as the SNAT is. The
         tutorial lists `node2 replaces the source IP address (SNAT)` before `node2 replaces the
         destination IP on the packet with the pod IP`, while netfilter applies DNAT in PREROUTING
         and MASQUERADE in POSTROUTING, so the step states no order: `Node-2 SNATs it as well`. The
         SNAT has no drawn value and stays one trailing sentence.
         `lb-provision` says the balancer is `typically pointed at port 31000 on every Node`, the
         Service page qualifier (`Kubernetes typically starts off by making the changes that are
         equivalent to you requesting a Service of type: NodePort`), and it is what the three static
         legs show. `configures it to forward to port 31000` is rejected: no Node leg lights on that
         step. `keeps that Node port by default` is `spec.allocateLoadBalancerNodePorts`, `By default
         ... is true`. `stays empty until 203.0.113.7 is published` is `The actual creation of the
         load balancer happens asynchronously, and information about the provisioned balancer is
         published in the Service's .status.loadBalancer field.`
         `client-hit` draws the balancer that targets node ports, and names the other kind as a
         conditional, `would deliver`, tied to `ipMode VIP`: `traffic is delivered to the node with
         the destination set to the load-balancer's IP and port`. The `loadbalancer IP` rule in
         KUBE-SERVICES is written only for ingress IPs that pass `proxyutil.IsVIPMode`, so the rule
         and the mode are one claim. Release-1.35 defaulting writes VIP into any ingress that has an
         ip and no ipMode, which agrees.
         `dnat` says `under the default Cluster policy the rule picks from every ready Pod`, from
         `Cluster to route external traffic to all ready endpoints`, and names 10.244.3.9, the Pod
         drawn on Node-3, as what it could have picked. `local Pod 10.244.1.5:8080` takes the
         address and port without `a ready backend`, which the next clause says of every Pod.
         `reached across the cluster network the way the direct
         connection was` is rejected: the drawn cross lane runs Node-2 to Node-3, and no lane leaves
         Node-1. `the KUBE-NODEPORTS rule for 31000 DNATs` compresses a jump through KUBE-EXT and
         KUBE-SVC to the KUBE-SEP DNAT, the same compression the `direct` step makes.
         The desc and the aria-label carry the same two qualifiers, `by default` on a Node with no
         backend forwarding, and `typically` on the balancer targeting the Node port.
SCOPE    What the SNAT costs and Cluster against Local are `network-external-traffic-policy`, so
         `direct` names the SNAT in one clause and stops. A balancer delivering straight to Pods is
         `network-loadbalancer-direct-to-pods`. ipMode VIP against Proxy is drawn on no card, so
         `client-hit` names the load balancer IP rule in one clause. A LoadBalancer with no cloud is
         `network-loadbalancer-bare-metal`.
NOT A DEFECT
         The balancer legs `TO_N2` and `TO_N3` carry no ball. The balancer targets the node port on
         EVERY Node, so all three legs exist for the reader to see that it picked Node-1 among drawn
         alternatives (`NET.A-03`). Node-2 is still reached by a ridden lane, the direct one.
         `lb-provision` turns `type` over at entry while `loadBalancer` waits for the arrival,
         carried on FORM-E: the type is the request the controller answers, and no arrival produces
         it.
```
