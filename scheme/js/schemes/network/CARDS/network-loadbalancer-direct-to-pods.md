## network-loadbalancer-direct-to-pods

### layout

```
WHAT     A balancer targets Pods only because its implementation does: its controller reads the
         EndpointSlice of the Service and registers each Pod IP and port as a target, so a
         connection reaches the Pod through one Node with no Node SNAT, and a replaced Pod is registered
         again at its new address. allocateLoadBalancerNodePorts false only stops allocating the
         Node ports such a balancer never uses, and frees none that exist.
LAYOUT   One spine on x 600 carries both flows, so each reads in one direction. Traffic comes DOWN:
         the external client, the balancer and, flush under it, the target ladder. Control comes UP:
         the EndpointSlice at the bottom, the balancer controller over it, and the REGISTER lane into
         the ladder bottom. Every spine BLOCK is 232 by 80 (NET.L-01) with one GAP of 36 to the next
         thing on the spine: the client at 16, the balancer at 132, the controller at 388 and the
         EndpointSlice at 504..584. The ladder is not one of those blocks. It is four 28 tall rows at
         a 6 gap, flush under the balancer at 10 rather than at the GAP, so it spans 222..352, and
         the controller takes its GAP from the ladder bottom rather than from the balancer.
         Two equal Node frames, 340 wide, flank the spine mirrored about x 600 at a FRAME_GAP of 64:
         Node-1 at 80..420, Node-2 at 780..1120. Their top is LEG_DROP 28 under the leg run at the
         ladder bottom, 380, and their bottom is the EndpointSlice bottom, 584. Each frame holds its
         Pod, 232 by 104 at 34 under the frame top, and the nodePort chip of the same width 12 under
         it, 20 over the frame bottom.
         The two readout chips stand in the top right corner, the one corner the panel leaves free.
         The lever no sibling in `external-traffic` carries is the ladder, a P.chain of four target
         rows under the balancer: two Node:31000 rows and two Pod IP rows. Which rows are lit IS the
         target list, so the subject change reads as rows turning over rather than as a relabel,
         and `kin.mjs --id` prints `levers no sibling has: chain`.
PANEL    Deepest at 1100x800 on `register`: `OVERLAY_IDS=network-loadbalancer-direct-to-pods node
         --test report/overlay.test.mjs` from `scheme/test/`. The reading is 319.08 at 1100x800,
         235.17 at 1280x860, 194.89 at 1600x1000, shallowest 160.00 on `direct` at 1600x1000. The
         Node-1 frame is the only block left of x=420 and its top at 380 is 60.92 under the deepest
         reading. The legs drop down the corridor beside the spine BEFORE they run out over the
         frames because a run at the balancer height would cross x<=397 above the panel bottom: the
         run is at y 352, 32.92 under it, and a leg tag riding 18 over it inks below the panel too.
         The panel right edge measures 396.55 and the spine starts at 484.
SIZES    The readout chips are 340 wide, the frame width, because `allocateLoadBalancerNodePorts`
         inks 177.9 at 1100x800 and `false` has to stand right of it. The ladder rows are 28 tall at
         a 6 gap and their longest text, `target 10.244.2.7:8080`, inks 135 of 232. The Pod is 104
         tall with its app box 44 at dy 26, the house Pod size in this section.
LANES    Six lanes, all at full opacity on every step, and each ridden on at least one step. TRUNK
         carries the external client on `nodeports` and `direct`. TO_N1 and TO_N2 are a mirrored
         pair, 442 units each: out of a balancer side face at y 172, down the middle of the 64 wide
         corridor at x 452 or 748 to the ladder bottom level, out over the frame to its centre, and
         down 28 onto the frame top (NET.A-02). TO_N2 carries the Node port connection on
         `nodeports` and the check of the new target on `replace`, TO_N1 the Pod-targeted
         connection on `direct`.
         UNDER runs from the Node-2 bottom face down to y 612, under the whole spine, and up into
         the Node-1 bottom face. It carries the SNAT hop on `nodeports` only and is drawn on every
         step as the path a Node port target would still take (NET.A-03). WATCH (EndpointSlice top
         face to controller bottom face) and REGISTER (controller top face to the ladder bottom)
         carry the read and the registration on `register` and `replace`. Nothing is keyed, so no
         step dims a lane: what is not in use is said by the ladder rows. The one `stage()` factory
         states both Pod shades, both Pod sublabels and all four row shades (A-16).
MOTION   Every ladder turnover is an outcome of the registration, so `rewind` holds the previous rows
         and an F.set writes the new ones where the REGISTER ball lands, lighting the balancer on
         that arrival. `register` and `replace` light the EndpointSlice in `lit`, since it is the
         sender, and the controller lights on the WATCH arrival, so each ball leaves a lit block
         (M-18a). On `replace` the check leaves the balancer 100 after the registration lit it.
         The `path through Nodes` readout on `nodeports` and `direct` turns over where its last hop
         lands. Every ball carries a tag. The three 36 unit spine hops, TRUNK, WATCH and REGISTER,
         carry theirs 76 right of the ball in the gap beside the spine. `src Node-2 (SNAT)` rides
         16 under the underlay. A balancer leg rides LEG_DUR 1800, 0.246 u/ms, under the catalog
         median `pace.mjs` prints, because at routeDur the reader cannot follow it, and it is
         registered in `PACING` in `render/motion.test.mjs`. Its tag rides 18 over the ball and 70
         to the outside of it, so in the corridor it clears its own lane by 7 or more and never
         reaches the spine, on the run it leads the ball, and on the last 28 into the frame it
         stands off the run line. The Node-2 tag shows from the balancer face, emerge 60. The Node-1
         tag cannot: for the first 84 units down the corridor its outer third would ink under the
         panel, so it fades in at LEFT_TAG_IN 600, a third of the way along the leg.
         Spans against durations: 6053 of 6400, 2860 of 4400, 4300 of 4600, 5100 of 5400, and
         `no-nodeports` 0 of 3800. The paces are 18.18, 10.92, 15.65, 15.30 and 10.00 ms per
         character (`timing.mjs`): the three steps with a leg are slow on purpose.
CONTENT  Read against Kubernetes 1.35, raw pages and release-1.35 source. The Node port half rests
         on the Service page anchor `load-balancer-nodeport-allocation`: "This should only be used
         for load balancer implementations that route traffic directly to pods", existing ports
         "will not be de-allocated automatically", and "You must explicitly remove the `nodePorts`
         entry in every Service port". The ServiceSpec reference adds that a requested nodePort is
         kept: "those requests will be respected, regardless of this field". `nodeports` keeps
         "DNATs it and, under the default externalTrafficPolicy Cluster, SNATs it", from the
         source-ip tutorial: "the system proxies it to a node with an endpoint, replacing the source
         IP". The aria-label carries the same Cluster qualifier. On `direct`, "Node port 31000 is
         still open on both Nodes" rests on the Service page, "Each node proxies that port", and on
         kube-proxy, which writes its Node port rules whenever a Service port carries a nodePort
         (`if svcInfo.NodePort() != 0` in the iptables and nftables proxiers), whatever the field
         says. The controller sublabel is `registers Node ports` on `idle` and `nodeports`, and
         `watches EndpointSlices` from `register` on. `targets Node ports` is rejected because the
         Service page gives the forwarding to the balancer: "The cloud-controller-manager component
         then configures the external load balancer to forward traffic to that assigned node port",
         and its service controller passes the Node list in `EnsureLoadBalancer(ctx, clusterName,
         service, nodes)`. How a Pod-target implementation learns its endpoints is up to that
         implementation. So the desc says "reads the Service endpoints, here an EndpointSlice",
         `register` says "Here its controller watches", and "has its controller read the
         EndpointSlices" is rejected as a stated mechanism. The health check on `replace` reads "How
         it health checks the new target, here a probe of 10.244.2.7:8080, is up to the
         implementation: the Kubernetes API does not define it". "checks the new target itself, on
         the Pod IP and port" is rejected because the Service page says "The Kubernetes APIs do not
         define how health checks have to be implemented". No step says only ready endpoints get
         registered. The EndpointSlice page says `serving` "should be used as a target for Service
         traffic", which tells consumers what to do and promises nothing about a balancer, and every
         Pod the card sends a connection to is drawn running. The readout is `path through Nodes`.
         `hops to Pod` is rejected because the value counts the Nodes a connection crosses, 2 then
         1, not network hops, and it leaves out the client to balancer leg. `direct` says Node-2 "is
         not on its path at all". "is not a target at all" is rejected because neither Node port row
         is a target on that step, so naming only Node-2 implies Node-1 still is one. The desc says
         "frees none already allocated", because a bare "frees none" reads as if the field might
         free a port later.
SCOPE    ipMode, status.loadBalancer.ingress.ipMode and what kube-proxy does with the balancer
         address for in-cluster clients are drawn on no card, and this card does not speak of
         them. The Node port range and the fan across Node ports are
         `network-nodeport-loadbalancer`. Cluster against Local and healthCheckNodePort are
         `network-external-traffic-policy`, which is why `nodeports` names the Cluster policy and does
         not explain it. How the EndpointSlice itself is derived from Pods is
         `network-endpointslice-reconcile`: this card only reads it. What the backend sees as the
         client address is `network-client-ip-preservation`, so this card says no Node SNAT and
         never that the client IP is preserved.
NOTE     The frame labels are neutral, `Node-1` and `Node-2`, because Node-2 gains a backend on
         `replace`: the Pods carry the state instead. Pod web-2 stands at OPACITY.pending with
         `not created yet` until `replace`, and Pod web-1 then drops to pending with
         `10.244.1.5 · deleted`, so no label is false on any step. A ladder row outside the target
         list stands unlit at OPACITY.pending, the same shade: `target 10.244.2.7:8080` until
         `replace`, `target 10.244.1.5:8080` before `register` and from `replace` on, and the two
         Node port rows from `register` on. Lit and unshaded alone differ by a 1.8 stroke and a
         glow, which reads as one list at true size. The rows reach `opacity` through the one
         `tune`, `rowRefs`, since a chain keys no row. The two chips carry two captions because they
         are two kinds of row: a real Service field, and a readout of the last external connection
         that is not an API field.
NOT A DEFECT
         `no-nodeports` stands still for its 3800ms because it moves no packet: a field changes and
         the chips it leaves standing carry the beat, and its pace, 10.00 ms per character, is under
         the catalog median `timing.mjs` prints. The in-frame nodePort chips read 31000 at full on
         every step, and on that step they light with the field, because the port stays allocated.
         `statics.mjs` prints IDLE-CHAIN for this card. Its pattern wants a literal number, list or
         string after `chain:`, and here the rows arrive through `stage()` and `targets()` as a
         named list, while `settled-dump.mjs` shows them turning over on `register` and `replace`.
         `path through Nodes` stays 1 on `replace` and `no-nodeports`: it reads the last external
         connection, the one on `direct`, and the check on `replace` is not one.
OPEN     CENTRE. The report pools the two nodePort chips under the Pods, 134..366 and 834..1066,
         with the two readouts in the top right corner, 780..1120, into one strip on centre 627
         (L-17). The drawn extent measures 80..1120, centred on 600 by construction. The row is
         carried in `test/fixtures/carried.mjs`. Closing it would mean mirroring the readouts into
         the top left corner, which the narration panel covers.
```
