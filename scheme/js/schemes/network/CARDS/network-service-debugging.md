## network-service-debugging

### layout

```
WHAT     A Service whose name resolves but whose call never reaches the app, and the three links that
         decide it: the selector against the Pod labels, readiness against the serving set, and
         targetPort against the port the container listens on.
LAYOUT   An object board with a data path, not the section's flow-and-fan. One flow row on FLOW_Y
         350 (client Pod, Service web, Pod web), the EndpointSlice on CX above the Service, and a
         2x3 chip grid under it. The grid rows ARE the diagnosis: the top row carries the two
         empty-slice causes, the bottom row the port cause, so which row lights says which kind of
         failure the step is. The three links are relations because the card is about bindings
         that hold or break, and a binding carries no traffic.
PANEL    Deepest at 1100x800 on `no-match`: `OVERLAY_IDS=network-service-debugging node --test
         report/overlay.test.mjs` from `scheme/test/`. Deepest readings 229.82 at 1100x800, 192.67 at
         1280x860, 160.00 at 1600x1000. The client Pod is the highest block left of x=420 and opens
         at POD_TOP 290, clearing the deepest reading by 60.18. The slice at y 60..140 stands beside
         the panel at x 484..716.
SIZES    Service and EndpointSlice are 232 x 80, the kubelet block of `network-model`. Both Pods are
         210, the backend width the
         section already draws, so the inner sublabel `declares http :8080` inks 116.6 in a 170 box
         at 1100x800 with 26.7 a side. The chips are 340, three across 70..1130 at a 20 gap. Every
         value ends 12 short of its chip edge, and the widest, `10.244.2.7:9376`, inks 92 at
         1100x800 and stands 181.1 clear of its name `serving`.
LANES    TWO lanes carry the ball, LANE_IN (client to Service) and LANE_OUT (Service to Pod), each
         array feeding its wire and its ball. The three relations (slice to Service, the selector
         under the row, readiness over the top) never carry a ball. A broken link drops to
         OPACITY.terminated and its caption to OPACITY.notready, stated together in `stage()`, so no
         caption asserts a link the picture shows as gone.
MOTION   Every step opens with the same dial: client pulse, then one hop into the Service at
         BEAT.afterPulse, which lights on arrival. On `no-match` and `not-ready` nothing leaves the
         Service. On `wrong-port` the ball rides on to the Pod edge and the Pod neither pulses nor
         lights, which is the whole statement. Both address tags fade in with their
         ball and fade at arrival (`emergeMode` with no `emerge` offset, hold 0, 170ms out), lifted
         by `TAG_DY` -66 so their ink stands 4 above the Pod top. No block, string or lane crosses
         either at 1100x800 or 1600x1000, where a tag centred on its ball prints half inside the
         Service box at each end of the hop. The arrival ripple still plays at the Pod edge on
         `wrong-port`: every packet
         ripples by kit canon with no opt-out, the ring says the ball reached that edge, which it
         does, and it is the same ring `no-match` and `not-ready` show at the Service edge while
         nothing leaves it. The missing pulse and the unlit app box carry "nothing answers".
CONTENT  Read against the Kubernetes 1.35 docs and the kubernetes/kubernetes source, raw.
         A numeric targetPort goes into the endpoint unchanged. `FindPort` in k8s.io/endpointslice:
         "If the targetPort is a number, use that", so `wrong-port` serves 10.244.2.7:9376 while the
         container listens on 8080. A named targetPort resolves to the containerPort the Pod
         DECLARES under that name, and a declaration says nothing about what listens: core/v1
         `Container.ports` reads "Not specifying a port here DOES NOT prevent that port from being
         exposed". So `desc` says a named targetPort "follows the port the Pod declares", and
         `named-port` says the declaration has to move with the process. "which a named targetPort
         avoids" is rejected: a Pod declaring http on the wrong number fails the same way.
         "reaches a Pod" is false on `wrong-port`, where the endpoint exists and the packet reaches
         the Pod IP on a port nothing listens on. The `desc`, aria-label and `healthy`
         therefore say "the app", and the title names the task rather than an outcome. `no-match`
         and `not-ready` keep "never reaches a Pod", true there.
         Readiness gating has one counter-case, publishNotReadyAddresses. endpoint-slices.md: ready
         "will also always be `true` for Services with `spec.publishNotReadyAddresses` set to
         `true`", and kube-proxy routes on ready (`topology.go` filters on `IsReady`). `not-ready`
         names it in a clause and `desc` in a parenthesis. `healthy` states the three links for this
         Service without it, and the clause two steps later carries the exception. The aria-label
         carries no later clause, so it names the exception in place: "the Pod is Ready, unless the
         Service sets publishNotReadyAddresses", and an unqualified "only while the Pod is Ready" is
         rejected there.
         `1 endpoint, not ready` is the `ready` condition of a non-terminating Pod, where `serving`
         is false as well: "For endpoints backed by a Pod, this maps to the Pod's `Ready`
         condition". On `no-match` the Pod stays Ready while the readiness link drops, because the
         controller lists only Pods the selector matches, and the narration says "not listed even
         though it is Ready". A Service with nothing selected keeps a placeholder slice with no
         endpoints (`reconciler.go`, "we need to add a placeholder"), so the slice box stays.
         The slice is `EndpointSlice web-x9f2` because its name is generated and only the
         `kubernetes.io/service-name` label carries `web`, the name `network-proxy-rule-resync`
         draws. The tags carry what the packet carries, `dst 10.96.0.20:80` then
         `dst 10.244.2.7:<port>`, the strings `network-service-clusterip` rides. `web:80` is rejected
         because a name never rides a packet (`NET.T-01`).
         What the client sees is unstated on purpose. The iptables proxier writes REJECT with the
         comment "has no endpoints", the nftables one a map "to drop or reject packets to services
         with no endpoints", and the IPVS proxier carries no per-Service no-endpoints rule, so any
         outcome named would be mode-dependent. A wrong targetPort is a closed port and the card
         stays at "nothing listens". "hang" and "503" are rejected: no page read says either.
SCOPE    How the EndpointSlice controller flips an endpoint to not ready belongs to
         `network-endpointslice-reconcile`, and this card names readiness in one clause. The DNAT
         and conntrack rewrite belong to `network-service-clusterip`, the rule write path to
         `network-proxy-rule-resync`, and name resolution to the DNS section. What the client itself
         sees is deliberately unstated, for the reason in CONTENT: the card says only that the call
         never reaches the app.
NOT A DEFECT
         The lit chips name the link under test, not every value that moved. Each failure step is
         an aside from the healthy state, so a value going back to it stays unlit: `Pod labels`
         back to app=web on `not-ready`, and `Pod Ready` back to True and `serving` back to
         10.244.2.7:9376 on `wrong-port`, which `report/arrival.test.mjs` R2-STEP lists. Lighting
         them lights both chip rows on `wrong-port` and erases the one signal saying which kind of
         failure the step is.
         `healthy` names all three links and lights only the port row. The selector and readiness
         links stand at full opacity with their captions, and the port row carries the three
         numbers the narration quotes.
```
