## network-service-types

### layout

```
WHAT     The three proxy types as one path that grows outward, drawn as a descent: LoadBalancer over
         NodePort over ClusterIP over a Node holding two backend Pods, with each type's own client
         entering at its own layer, while ExternalName and headless stand left of the stack and are
         answered by CoreDNS without ever entering it.
LAYOUT   Nested-layer descent, three columns. The stack stands on CX 600 (x 484..716) at y 40 / 180 /
         320, STEP_Y 140 apart, over a `Node` frame at 350..850 x 470..624. The outside clients and
         the chip column stand right of it at x 908. CoreDNS, the client Pod and the external host
         stand left of it at x 60, under the panel. Each layer is one `P.group` holding its box, its
         client and the lanes that feed and leave it, so a step that does not use a layer recedes it
         as one piece through the `layers()` factory: LoadBalancer and NodePort sit at
         `OPACITY.notready` on `clusterip`, LoadBalancer alone on `nodeport`, all three on
         `externalname` and `headless`, where the dim stack reads as the path those two skip. The
         same field recedes what the left column and the backends take no part in: CoreDNS, the
         external host and all four left-column lanes on the three stack steps, the headless lane
         and both Pods on `externalname`, the host and its lane on `headless`. The client Pod stays
         full on every step, because its ClusterIP lane belongs to the ClusterIP layer.
PANEL    `OVERLAY_IDS=network-service-types node --test report/overlay.test.mjs` from `scheme/test/`.
         Bottom 125.11 / 150.17 / 180.12 at 1600x1000 / 1280x860 / 1100x800, right edge 396.55 at
         1100x800. Every step reads the same at the two wider viewports. At 1100x800 `nodeport`,
         `loadbalancer` and `externalname` are deepest, while `clusterip` and `headless` wrap one
         line shorter and read 155.3 (`extents.mjs`). CoreDNS at y 190 is the only block left of
         x 420 near it and clears the deepest reading by 9.88. The stack and the right column start
         right of x 420, so the LoadBalancer row at y 40 stands beside the panel, not under it.
         The sources footer holds one line at 1100x800 with the four entries it carries. Six wrap it
         to two, which shrinks the viewBox and puts the deepest panel at 194.8, past CoreDNS.
SIZES    Every actor box is 232 x 80, the kubelet block of `network-model` (`NET.L-01` for the width).
         The backend Pods are 210 so two fit the 500 frame with a 40 gap for the spine to land in.
         CoreDNS takes the same 80, which leaves its query and answer lanes 50.
LANES    Ten wires, and a ball rides every one. The spine is x 600: LoadBalancer to NodePort, NodePort
         to ClusterIP, ClusterIP to the Node frame top between the two Pods (`NET.A-02`). The two
         outside clients enter their layer on its row centre. The client Pod right face carries an
         `L-12` pair about its centre 375: the ClusterIP lane at 360, level with the ClusterIP row,
         and the headless lane at 390, which runs right to x 320, down, and ends on the Node frame
         left face at Pod A centre 548. Query and answer are a pair at x 160 / 192 about the column
         centre 176, and the external host hop is the column centre itself. Every hop is one points
         array feeding its wire, its ball and its tag.
MOTION   A Pod sender pulses first and sends at `BEAT.afterPulse` (clusterip, externalname,
         headless). A box sender is lit in `lit` and sends at `BEAT.lead` (nodeport, loadbalancer).
         Every tag lives exactly as long as its ball (M-30a): the segment tags on
         `inMs: 100, outMs: 100, hold: 0`, the headless tag on a route binding at 200, so each one is
         placed where no block stands when the ball leaves. A horizontal tag rides centred over its ball, lifted by `liftOver` to 6
         above the taller of the two rows it runs between: dy -46 on all three hops, since
         every box is 80 tall. The spine and DNS tags ride BESIDE their lane with the left
         end 8 to 10 past the right face of the column the lane runs through (`besideRight`: 724 to
         726 against 716, 300 to 302 against 292, at 1100x800 and 1600x1000), because any closer
         offset prints over the block the ball leaves or lands on. `SIDE_DY` -4 keeps the last spine
         tag 2 above the Node frame top. The host hop has the headless lane at x 320 on its right,
         so its tag leads the ball beside the lane at dx 90 and dissolves with it on arrival, over
         the host box for 100ms, which is accepted. The headless tag rides left of its lane at dx -36 and crosses the
         Client Pod right face and the app box corner for its first 280 to 350ms, 150 of them
         fading in: the lane leaves through a 28 unit run beside the Pod and a 58 unit gap to the
         Node frame, which a 61 unit tag cannot clear, and a fade-in held back until it clears the
         Pod reads as a tag appearing mid-flight. Every other tag crosses no block edge and no
         string at 1100x800 or 1600x1000. Spans 3200 / 4000 / 4800 / 4360 / 4700 against durations
         3600 / 4400 / 5200 / 4800 / 5100, reading pace 16.36 to 23.18 ms per character, among the
         least hurried in the catalog. The 50 to 70 unit hops are floor-bound at
         700ms, 0.071 to 0.100 units per ms.
CONTENT  Claims read against the 1.35 docs. Chips carry field values, never prose. Headless is
         `type ClusterIP` with `clusterIP None`, and ExternalName reads `clusterIP not set`: the
         ServiceSpec says ExternalName "requires this field to be blank", and the Service page says
         None "is not the same as leaving the .spec.clusterIP field unset". `nodePort 31000` and
         `LB ingress 203.0.113.7` equal the tags the balls carry on the same step. The NodePort to
         ClusterIP tag reads `same Service rules`, never the VIP, because the nodePort rule jumps
         into the Service chain the ClusterIP uses and no packet is ever sent to 10.96.0.20. Both
         backends sit on one Node, so both take the Node CIDR 10.244.2.x. Headless is never called a
         type.
         The balancer "typically" forwards to the node port, never "by default": the Service page
         says Kubernetes "typically starts off" with a NodePort that the cloud-controller-manager
         points the balancer at, and `allocateLoadBalancerNodePorts: false` is for "load balancer
         implementations that route traffic directly to pods". "Underneath it is still a NodePort"
         is rejected for that exception, and the narration states the exception instead. The
         aria-label carries the same "typically" before "feeds the Node port", and an unqualified
         "feeds" is rejected there for the same exception. ExternalName "has no selector" reads the
         ServiceSpec selector as it applies: "Ignored if type is ExternalName".
         No narration names kube-proxy, which is not drawn (`T-21`). "The Service rules on every
         Node" also holds where "your own alternative component in place of kube-proxy" writes them
         (Virtual IPs and Service Proxies). Headless has "no Service rules for it", which is the
         Service page's "kube-proxy does not handle these Services" in this card's vocabulary.
         The desc and the aria-label never say ExternalName and headless work "through DNS alone":
         DNS answers with a CNAME or the Pod IPs and the client then connects by itself, which the
         host and headless lanes draw. "Only the first three program anything into kube-proxy" is
         rejected twice over: kube-proxy writes the rules rather than being programmed, and headless
         is itself type ClusterIP. The bare-metal clause lives inside the LoadBalancer clause as "a
         balancer from a cloud or an add-on", after "Kubernetes does not directly offer a load
         balancing component". The short names `ext.default.svc` and `web-hl.default.svc` resolve
         through the Pod search list `default.svc.cluster.local svc.cluster.local cluster.local`
         (DNS for Services and Pods), on its last entry. The four sources carry those claims: the
         Service page holds the type table, the LoadBalancer node port passage and headless,
         Virtual IPs and Service Proxies the rules, DNS for Services and Pods the search list, and
         ServiceSpec the clusterIP and `allocateLoadBalancerNodePorts` fields. Section anchors on
         the Service page are left out because a fifth entry wraps the footer (PANEL).
SCOPE    The client round trip, DNAT and conntrack belong to `network-service-clusterip`, the
         balancer fanning across several Nodes to `network-nodeport-loadbalancer`, a LoadBalancer
         with no cloud to `network-loadbalancer-bare-metal`, the CNAME and selectorless Service to
         `network-externalname`, and the per-Pod records a headless Service publishes to
         `network-headless-service`.
NOT A DEFECT
         `statics.mjs` reports `ciLayer`, `npLayer` and `lbLayer` as never addressed. All three are
         written on every step through the `layers()` spread, which the sweep does not resolve.
         The FORM-B queue lists the twelve chip writes on `clusterip` to `headless` that stand lit
         1500ms before the first ball lands. Each chip is a field that exists before any packet:
         type, clusterIP and nodePort are spec fields set when the Service is created, and LB ingress
         is `status.loadBalancer.ingress`, published once the balancer is provisioned and so before
         any client can dial that address. The ball reads the rules they produced and writes none.
         All twelve are carried on FORM-B in `test/fixtures/carried.mjs` with that reason.
OPEN     CENTRE: the chip column spans 908..1140, centre 1024 against 600. It is a column beside the
         stack on purpose, reading the Service fields next to the layers they describe. Centring it
         puts it on the spine, and a bottom strip has no room because the Node frame reaches 624.
```
