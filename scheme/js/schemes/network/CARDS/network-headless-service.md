## network-headless-service

### layout

```
WHAT     clusterIP None moves discovery into DNS: the Service name resolves to the ready Pods
         themselves, the client picks and connects on its own, and each StatefulSet Pod keeps a name
         of its own while its address changes.
LAYOUT   Three bands. The discovery column (Service nginx, its EndpointSlice, CoreDNS) stands at
         x 444 right of the panel, joined by two relations, because the answer is derived from that
         chain and nothing else. The answer column beside it is FOUR chips stacked in one column,
         the one composition in DNS & Service Discovery that carries one: a headless answer is a SET
         of records, so the card draws the set as rows that fill, drop a member and change a value.
         The StatefulSet Pods run along the bottom, and the client reaches them from below over a
         shared bus.
PANEL    Deepest at 1100x800 on `query`, `pod-name`, `new-ip` and the poster frame:
         `OVERLAY_IDS=network-headless-service node --test report/overlay.test.mjs` from
         `scheme/test/`. Bottom lo..hi per viewport: 125.11..142.56 at 1600x1000, 150.17..171.42 at
         1280x860, 180.12..204.97 at 1100x800. The client Pod is the only block left of x=420 and
         opens at y 268, 63 under the deepest reading.
SIZES    Every block is 232 by 80 and every Pod 232 by 104 with a 192 by 44 app box (`NET.L-01`). The
         Pod row spans 300..1160 with a gap of 82. The answer chips are 400 wide so the longest row,
         `query  web-0.nginx.default.svc`, fits one line.
LANES    Seven lines. Two RELATIONS on the discovery spine, x 560, carry no head and no ball: the
         control plane keeps the slice for the Service, and CoreDNS watches the slice. The lookup
         pair runs between the client right face and the CoreDNS left face at 308 and 332. The three
         data lanes leave the client bottom at x 176, run along BUS_Y 596 and climb into each Pod
         bottom face, one lane per Pod (`NET.A-03`). No line joins CoreDNS to a Pod: CoreDNS never
         calls one.
MOTION   `answer` and `direct` start from a lit block: CoreDNS answers after `BEAT.lead`, the client
         pulses before it connects. The connection carries the address it picked as a tag riding 20
         under and 40 left of the ball: at dx 0 both vertical legs run through the text, and under
         the ball it clears the bus, the client above the trunk and the Pod it climbs into.
         `not-ready` and `new-ip` open on a change to a Pod (a fade to notready, a fade out and
         back) and only then run the lookup, so the reader sees the cause before the answer shrinks
         or changes. On `not-ready` the EndpointSlice lights as its count turns to 2 of 3, 1700ms
         before the query lights it again. Every chip turns on the arrival that produces it: the
         query row when the query lands, the record rows when the answer lands. The eight 152 unit
         lookup legs take HOP_MS 595 rather than the 700 floor their length clamps to, where they
         run 0.217 units per ms against the 0.45 canon. The two data routes are long enough to take
         the canon speed and carry no dur, so PACING records 8 explicit durs, 8 of them under the
         floor. Durations follow that motion: every step stands still for about 1100ms.
CONTENT  Read against k8s 1.35: the Service page, `DNS for Services and Pods`, the StatefulSet
         page, the CoreDNS kubernetes plugin README and the kubeadm Corefile on release-1.35.
         `kube-proxy writes no rules for it` because the Service page says `a cluster IP is not
         allocated, kube-proxy does not handle these Services, and the platform does not provide
         load balancing or proxying for them`. The desc says `no kube-proxy rules and no load
         balancing from the platform`, and not `nothing balancing for it`: the kubeadm Corefile runs
         the `loadbalance` plugin, which shuffles the order of the A records it returns.
         `For a headless Service with a selector the control plane still keeps an EndpointSlice`,
         and not the bare `for a headless Service`: the page says `For headless Services that do not
         define selectors, the control plane does not create EndpointSlice objects`.
         `one A record for every ready Pod` because a headless name `resolves to the set of IPs of all
         of the Pods selected by the Service`, and `The Pod needs to be ready in order to have a
         record unless publishNotReadyAddresses=True is set on the Service`, which is the `not-ready`
         step and its last sentence. The Service page adds `By default this field is set to false`.
         `Under the default ClusterFirst DNS policy the lookup ... still goes to CoreDNS through the
         kube-dns Service`: headless removes the VIP from the DATA path only, and the resolv.conf
         the Kubelet writes names the DNS Service as nameserver. The qualifier stays because
         `dnsPolicy` Default or None, and NodeLocal DNSCache, send the query elsewhere. `no DNAT
         anywhere in the path` is rejected for the same reason.
         `the client chooses from the set itself and kube-proxy has no say` because the DNS page
         says `Clients are expected to consume the set or else use standard round-robin selection
         from the set`. `decided by the client and its resolver` is rejected: CoreDNS shuffles the
         order (`loadbalance`), so a resolver that takes the first record is not deciding alone.
         `no Service rule rewrites the destination`, and not `no rule`: a CNI or a policy engine
         may still program rules on that path, none of them for this Service.
         The Pod name is `web-0.nginx.default.svc.cluster.local`, Pod name under the SERVICE name,
         and the Service is `nginx` while the StatefulSet is `web` so the two segments cannot be
         confused. The StatefulSet page: `$(podname).$(governing service domain), where the
         governing service is defined by the serviceName field on the StatefulSet`.
         `Once it is ready the same lookup returns 10.244.3.8: the name is stable, the address is
         not`, and not `always resolves to that exact replica`: the record exists only while the Pod
         is ready. `here with a new IP` stays hedged because no page promises a recreated Pod a new
         address or the old one: the network plugin assigns it.
         `A cache can serve the old answer until its TTL runs out, 30 seconds in the kubeadm
         Corefile`. `30 seconds by default in CoreDNS` is rejected: the kubernetes plugin README says
         `ttl allows you to set a custom TTL for responses. The default is 5 seconds`, and the 30 is
         the `ttl 30` line kubeadm writes into the Corefile. The StatefulSet page says only that the
         CoreDNS config map `currently caches for 30 seconds`. The same Corefile disables the cache
         plugin for the cluster domain (`disable success` and `disable denial`), so the cache that
         holds the answer is the client side one, a node cache or the application.
         Negative caching is not claimed: the StatefulSet page gives it only as `at least a few
         seconds`.
         The chip names read `A web-0` as the record that points at web-0: on `answer` all three
         records carry the Service name, on `pod-name` the record carries the Pod name. They stay,
         because `fixtures/carried.mjs` keys this card by those names. The query chip shows
         `nginx.default.svc`, a name the search list completes, while the narration spells the FQDN.
         A headless Service with a named port also publishes SRV, one answer per Pod. This card draws
         A records only, and the SRV record kind is `network-dns-records`.
         `Nothing balances the traffic, and the whole set comes back for the client to choose from`,
         and not `Nothing in the cluster picks one for the client`: the kubeadm Corefile runs
         `loadbalance`, which the plugin page describes as a round-robin that acts `by randomizing the
         order of A, AAAA, and MX records in the answer`. It balances nothing, but it does decide the
         order a client reading the first address sees.
         `until the record TTL expires, 30 seconds under kubeadm`, and not `30 seconds by default in
         CoreDNS`: the 30 is `ttl 30` inside the `kubernetes` plugin of the kubeadm Corefile, whose
         `cache 30` block carries `disable success <cluster domain>` and `disable denial <cluster
         domain>`, so CoreDNS itself caches no cluster name there. What holds the stale answer is the
         client. The CoreDNS kubernetes plugin README gives 5 seconds as its own default ttl, which is
         why the number is attributed to kubeadm rather than to CoreDNS.
SCOPE    clusterIP None and what it hands the client: a SET of addresses, a name per Pod, and the
         choice of backend. The Service type stack this variant sits in is `network-service-types`.
         Record shapes in general, SRV included, are `network-dns-records`. How ready endpoints are
         derived from Pods is `network-endpointslice-reconcile`. The ClusterIP round trip and its
         DNAT are `network-service-clusterip`. The per-replica disk behind a stable name is
         `storage-volumeclaimtemplates`, and the order replicas are created in is
         `workloads-statefulset-ordered-rollout`.
DO NOT   Draw a line from CoreDNS to a Pod. CoreDNS reads the EndpointSlice, and a fan from CoreDNS
         into the Pods reads as CoreDNS forwarding traffic to them.
NOT A DEFECT
         A seek frame of `not-ready`, `pod-name` or `new-ip` shows the EndpointSlice count, the Pod
         sublabel and the `A web-0` row at their previous values: `seekStep` never fires the deferred
         `F.set` that writes them (`M-35`). Real playback through `tools/settled-dump.mjs` shows every
         one of them turned over, `A web-0` at 10.244.3.8 on `new-ip` included.
         TO_POD[2], the lane to web-2, rides nothing. N destinations get N wires so the reader can
         see the client picked one of three (`NET.A-03`).
         web-2 stays at notready on `pod-name` and `new-ip`: nothing on those steps makes it ready
         again, and its lane stays at full stroke because a lane is never dimmed.
```
