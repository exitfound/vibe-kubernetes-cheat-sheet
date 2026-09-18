## network-externalname

### layout

```
WHAT     Two ways a Service without a selector points outside the cluster, from ONE client.
         Service api is type ExternalName: CoreDNS answers a CNAME, the client connects to
         api.partner.example itself through no Service rule, and its SNI and Host still say
         api.default.svc, which the certificate does not match. Service pg keeps ClusterIP
         10.96.0.40: a hand-written EndpointSlice pg-ext names it by label, kube-proxy writes
         Service rules from it, and the Node dataplane DNATs to 203.0.113.5:5432.
LAYOUT   A sandwich of three columns, C1 60, C2 484, C3 908, each 232 wide. The DNS row on top
         at y 20..100 (CoreDNS in C2, Service api in C3), the one Client Pod in C2 under it at
         180..290, then the dataplane row at 400..480 (kube-proxy C1, Node dataplane C2, database
         203.0.113.5 C3), then the EndpointSlice frame on C2 at 500..616 with Service pg in C3.
         The ExternalName host stands in C3 level with the client at 195..275, with the TLS chip
         pair under it at 295 and 339. Each Service object stands beside the component that
         reads it, so the upper half is the DNS path, the lower half is the dataplane path, and
         the client is the one block both halves share. The half a step does not use sits at
         `OPACITY.notready` through the `stage()` opacity field from step entry: its boxes,
         chips, slice text and relations, while the seven headed lanes read 1 in that field on
         every step. Idle draws both halves at full weight.
PANEL    `OVERLAY_IDS=network-externalname node --test report/overlay.test.mjs`: deepest 279.5
         at 1100x800 on `lookup`, 205 on `mismatch` and `slice`, 180.1 on `connect` and `vip`.
         235.2 / 171.4 / 150.2 at 1280x860, 194.9 / 142.6 / 125.1 at 1600x1000, right edge
         396.5. kube-proxy at y 400 is the only block left of x 420 and clears the deepest
         reading by 120.5. The watch tag is the one tag inking left of x 420, at y 486 and below.
SIZES    The slice frame is 320, not 232: `kubernetes.io/service-name: pg` inks 188.9 at
         1280x860, and the endpoint chip inside needs `endpoint` plus `203.0.113.5` with the
         frame padding. In 232, `ExternalName api.partner.example` inks 201.5 at 1280x860, 15.3
         a side, and `database · outside the cluster` 188.9. The TLS chip name is `cert`:
         `certificate` with `api.partner.example` leaves a gap of 1 in a 232 chip against
         MIN_GAP 4, and `cert` leaves 50. Every actor box is 232x80, the 60 unit rows grown by
         20 each with no gap cut: the DNS row stands at y 20, the client, host and chips 10
         higher than a 60 unit DNS row would put them, and the dataplane row keeps y 400 and
         grows down to 480, over a 20 unit gap to the slice. The two gaps a tag rides in keep
         their size, 20 between the host and the SNI chip and 27 between the cert chip and the
         dataplane row. The frame bottom is 616 in the 640 viewBox, 20 of margin on top.
LANES    Seven lanes carry a ball: the query and answer pair at x 584 / 616 between the client
         top and CoreDNS, the out and back pair at y 223 / 247 from the client right face to the
         host, the 110 unit drop from the client to the dataplane, the dataplane to the
         database, and the watch from the slice left face round to the kube-proxy floor. The out
         and back pair runs from the client face straight to the host and never touches the
         dataplane box, so the ExternalName connection reads as matching no Service rule rather
         than as DNAT. Three relations carry none: CoreDNS to Service api, kube-proxy to the
         dataplane (it writes rules, never forwards), and the slice to Service pg, which is the
         label reference.
MOTION   `lookup`, `connect` and `vip` open on a client pulse and send at `BEAT.afterPulse`.
         `connect` lights the host and the SNI chip on the hello arrival, where SNI turns from
         `none` to api.default.svc. `mismatch` lights the host in `lit` and sends the
         certificate at `BEAT.lead`, and the SNI and cert chips light on its arrival, where `cert`
         turns from `none` to api.partner.example. `slice` lights the slice and sends the watch at
         `BEAT.lead`, kube-proxy lights on arrival, and 100ms later the dataplane lights and its
         sublabel becomes `10.96.0.40 -> 203.0.113.5` with no ball. Every tag fades in over the
         150ms before its ball leaves and crosses no face, lane or tag at 1100x800, 1280x860 or
         1600x1000. The three vertical tags lead their ball on the outer side of the lane and
         fade out over 170ms that end with the ink at least 4 short of the far face on all three
         viewports, 1280x860 the tightest. The query tag rides at dx -54, 12 above, ink
         484..576, 8 left of the lane, 9.5 over the client top at departure, gone at 465 of
         700ms with its ink top 5.1 under CoreDNS, 4.4 at 1280x860. The answer tag rides at dx
         86, 16 below, ink 625.3..778.7, 9.3 right of the lane, gone at 495 with 4.9 to the
         client top, 4.3 at 1280x860. The query tag is gone 185ms before the answer tag starts to
         appear. The drop tag rides at dx -65, 18 below, ink 476.7..593.3, 6.7 left of the lane
         and away from the exit tag, gone at 540 with 4.7 to the dataplane top, 4.0 at 1280x860,
         never near kube-proxy or the relation. The horizontal tags fade out over the 170ms after
         their ball lands, each out of both face bands. The SNI tag leads by 64 and rides 36
         above, 5.7 right of the client face and 5.5 over the host top. The cert tag rides 41
         below and 80 behind in the 20 unit gap under the host, 3.2 and 4.5 clear, 2.5 and 3.9 at
         1280x860, where the string is 13.6 tall and centred in 20 would get 3.2 a side. The
         exit tag rides 48 above in the gap over
         the dataplane row, 9.2 and 5.5 clear. The watch tag leads by 70 and rides 16 below, 8.7
         left of the slice and of the x 176 trunk and 6.2 under kube-proxy. Spans 3200 / 2060 /
         2400 / 2120 / 2860 against durations 4000 / 3400 / 3600 / 3600 / 3600, reading pace
         9.88 to 14.85 ms per character, ranked 235 to 611 of 681. The 80, 110 and 192 unit hops
         are floor-bound at 700ms, lengths other cards run, and the 342 unit watch runs 760ms, a
         length `cluster-pod-cgroup-hierarchy` shares.
CONTENT  Read against the release in `k8sVersion`, 1.35: the v1.35 Service, EndpointSlice and DNS
         pages, the ServiceSpec and EndpointSlice v1 references, and release-1.35 source.
         `externalName` must be a lowercase RFC 1123 hostname, and a `clusterIP` set on create
         "will fail" for ExternalName, so Service api draws a name and no ClusterIP. kube-proxy
         skips the type (`ShouldSkipService`, `pkg/proxy/util/utils.go`), and the EndpointSlice
         controller returns early for ExternalName and for a nil selector, so no slice exists for
         api and none is written for pg ("not created automatically", Service page).
         The answer is the CNAME PLUS the address of its target: the Kubernetes DNS specification
         2.5 answer example carries both records, and CoreDNS `backend_lookup.go` follows an
         out-of-zone CNAME back through its own plugin chain. "The client resolves
         api.partner.example" is rejected because it narrates a second lookup that does not happen,
         so `connect` opens "With that address". CoreDNS wires `upstream.New()` into the plugin
         unconditionally (`setup.go`), and `upstream.go` serves the target "via CoreDNS itself",
         so the address comes from whatever the server block forwards to.
         `api.default.svc` has 2 dots, under `ndots:5`, so the resolver tries the search list
         first, `<ns>.svc.cluster.local svc.cluster.local cluster.local` (DNS for Services and
         Pods): `api.default.svc.<ns>.svc.cluster.local` and `api.default.svc.svc.cluster.local`
         return NXDOMAIN, and the third candidate, `api.default.svc.cluster.local`, matches.
         "the search list expands it to api.default.svc.cluster.local" is rejected because it
         reads as one round trip where there are three, so `lookup` says "after two misses" and
         the one exchange drawn is the match. The walk itself is `network-dns-ndots`, which says
         every miss "is a full round trip that ends in NXDOMAIN".
         "Plain HTTP fails the same way" is rejected: the page says HTTP requests "will have a
         Host: header that the origin server does not recognize" and hedges the whole caution as
         "may lead to errors or unexpected responses", so the step says HTTP "has the same
         problem". The TLS half keeps "rejects the handshake": "TLS servers will not be able to
         provide a certificate matching the hostname that the client connected to".
         The slice is tied by its label alone: "You link an EndpointSlice to a Service by setting
         the kubernetes.io/service-name label", which kube-proxy reads (`endpointslicecache.go`).
         kube-proxy filters its informers only on the absence of two labels,
         `service.kubernetes.io/service-proxy-name` and `service.kubernetes.io/headless`
         (`cmd/kube-proxy/app/server.go`), so a slice with no `managed-by` label is proxied.
         `slice` says "and the EndpointSlice controller writes no slice for it" and then opens a new
         sentence on "So EndpointSlice pg-ext is written by hand". Running the two together, with
         "so" continuing the first sentence instead, breaks `pg-|ext` and `service-|name` at the
         line end at 1600x1000 and 1280x860, where the shipped wording wraps at a space on all three.
         The endpoint row carries no condition and counts as ready: "A nil value should be
         interpreted as true" (EndpointSlice v1). 203.0.113.5 is a legal endpoint: the page bars
         only loopback, link-local and the cluster IPs of other Services. "exactly as a Pod-backed
         Service would" rests on "Accessing a Service without a selector works the same as if it
         had a selector". Egress SNAT is neither drawn nor claimed, and "only ever sees the Service
         address" is the conntrack reverse NAT `network-service-clusterip` settles.
NAMING   The ExternalName half is an HTTPS call because SNI and Host are what a hostname
         mismatch breaks, and the selectorless half is a database so the two halves carry
         different jobs. The host is api.partner.example, not api.example.com, which
         `network-service-types` draws.
SCOPE    The Service type stack and the short ExternalName tour belong to
         `network-service-types`. How the EndpointSlice controller derives endpoints from a
         selector belongs to `network-endpointslice-reconcile`, and a Service whose selector
         matches nothing to `network-service-debugging`. CNAME and record shapes in general
         are `network-dns-records`.
NOT A DEFECT
         `endpointslice.kubernetes.io/managed-by` is not drawn on the slice. The Service page says
         a hand-written slice "should also pick a value" for it, such as "staff", which names
         the manager and changes no routing, and the frame keeps its one label line for the key
         kube-proxy reads. The slice port shows no name because Service pg shows none: `ports.name`
         "corresponds to the Service.ports[].name" and defaults to the empty string.
         The `SNI · Host` chip names the one dialled name both carry. Over HTTPS the Host header
         never leaves a rejected handshake, which is why `mismatch` gives Host to plain HTTP.
         `connect` stands still 1340ms after its motion and `slice` 1480ms, against a catalog
         median of 1298ms, ranked 509 and 534 of 695, and their narration reads at 14.85 and
         12.59 ms per character against a median of 10.46. Neither is an outlier on stillness
         (`M-19a`). Each step narrates one exchange and draws it, so a second ball would be
         traffic the step does not name, and a shorter duration alone is what `M-19a` rules out.
         The query tag reads `api.default.svc`, the name the client looks up and the name its
         SNI and Host carry, while the name that matches is `api.default.svc.cluster.local`.
         `lookup` names both, in that order, so the tag and the narration agree. The full name
         cannot ride this lane: it inks 178.0 at 1100x800, 182.6 at 1280x860 and 174.8 at
         1600x1000, so held 8 left of the query lane it starts at 398.0 / 393.4 / 401.2, left of
         x 420 above the panel bottom on every viewport (`L-03`), and right of the lane it would
         cross the answer lane 32 units away.
OPEN     CENTRE: the report reads the three chips as one strip spanning 454..1140, centre 797.
         They are two placements, not a strip: the SNI and cert pair stands under the host it
         describes and the endpoint row is a field inside the slice frame. Centring them breaks
         both bindings.
```
