## network-nodelocal-dnscache

### layout

```
WHAT     One lookup from a Pod to the kube-dns ClusterIP, first DNAT-ed across to CoreDNS on another
         Node, then held on its own Node by the node-local-dns agent, which fetches cluster names from
         CoreDNS over TCP and every other name from the Node resolvers.
LAYOUT   Two Node frames, the one composition in DNS & Service Discovery that carries two: the first
         motivation the docs give for the cache is a query that no longer has to reach another Node,
         so the other Node is drawn rather than named. Node-1 holds two rows, the client Pod and the
         Node-1 dataplane on the query row, the agent straight under the dataplane. Node-2 holds only
         CoreDNS on the query row, and the upstream resolver stands outside both frames on the agent
         row, so both off-Node legs of the agent leave one face. The dataplane is on the path because
         the card is about what happens THERE: kube-proxy DNAT on `before` and on the upstream leg,
         NOTRACK and local delivery on every other query.
PANEL    Deepest at 1100x800 on `before`, `agent` and the poster frame that previews `before`:
         `OVERLAY_IDS=network-nodelocal-dnscache node --test report/overlay.test.mjs` from
         `scheme/test/`. Bottom lo..hi per viewport: 125.11..177.44 at 1600x1000, 150.17..213.92 at
         1280x860, 180.12..229.82 at 1100x800, right edge 396.55. Node-1 opens at x=40, so `L-03` puts
         its top under 229.82: NODE_Y 250 keeps the 20 of clearance `network-dns-coredns` keeps, and
         the frame label inks from about 257.
SIZES    Every block is 232 by 80 and the Pod 232 by 104 with a 192 by 44 app box (`NET.L-01`). Node-1
         is 680 wide: Pod 24 in from the left face, 160 of query pair, dataplane and agent 32 in from
         the right face. Node-2 is 320, CoreDNS centred in it, with 120 between the frames for the
         cross pair. Node-1 is 312 tall because its right face carries two lane pairs, the cross pair
         at 326/350 and the resolver pair at 462/486, and L-12 accepts them only as mirrors about the
         face midpoint 406, so the frame height is derived from the two row centres and closes 48
         under the agent. That is where the empty lower-left of Node-1 comes from.
LANES    Eight arrows in four pairs, each array feeding its wire and its ball (`A-02`): ASK/REPLY
         between the Pod and the dataplane, TO_AGENT/FROM_AGENT down and up between the dataplane
         bottom and the agent top at x 560/584, TO_N2/FROM_N2 between the Node-1 right face and the
         Node-2 left face, TO_EXT/FROM_EXT between the Node-1 right face and the resolver. No lane
         crosses a frame (`NET.A-02`): a ball into the dataplane or the agent fades on that face and the
         off-Node leg re-emerges on the Node-1 frame face, which is `NET.A-01` for the DNAT inside the
         dataplane. The agent upstream leg rides FROM_AGENT into the dataplane before it leaves, since
         that connection is DNAT-ed there too, while the resolver leg leaves the frame straight from
         the agent row, since nothing rewrites it. Every lane is ridden on some step.
MOTION   Two legs carry a riding tag and ride LEG_DUR 1275 (`M-12`), over four steps in all: the
         client ask, tagged `10.96.0.10` on `before`, `agent` and `hit`, so the same address reads
         before and after the agent exists, and the resolver leg on `external`, tagged `10.0.0.2`.
         Neither tag carries `dst`: the ask gap is 160 and `dst 10.96.0.10` inks 84, so it runs into
         the Pod and into the dataplane. Both tags ride ABOVE the row instead of on the lane, which
         is what lets them stay lit for the whole flight: retiring one early so it clears the box
         ahead takes the address off the screen before the ball arrives. The ask tag at dy -56 inks
         y 260..273, over the Pod top at 286 and the dataplane top at 298, and the resolver tag at
         dy -40 inks y 412..425, between the Node-2 frame bottom at 402 and the resolver top at 434.
         Measured in real playback at 1600x1000 and 1100x800 over all four tagged steps: zero frames
         touch a block or another string.
         Every other hop takes HOP_MS 595, the same 15 percent off, rather than the 700 floor its 56
         to 164 units clamp to: at the floor those balls run 0.08 to 0.23 units per ms against the
         0.45 canon and read as crawling. All 20 balls therefore carry an explicit dur, which
         `render/motion.test.mjs` PACING records as 20 with 16 under the floor. Durations follow the
         faster motion and leave about 1500ms still after it ends. `miss` is the longest step, six
         hops from a lit agent (up, across, back, down, up, home), because the narration promises the
         answer is cached at the agent BEFORE it reaches the Pod. `miss` and `external` start at the
         agent with `BEAT.lead`: their query reaches it on the step before or is named as arriving
         the same way, so the sender is the agent (`M-18a`).
WIRE LABELS
         Each pair names what the LANE carries, under its return lane, so a tag riding above the
         query lane never meets it. The local pair names itself to the right of its two verticals,
         `not installed` while the agent stands at notready on `before` and `NOTRACK` after. The cross
         pair reads `UDP 53` on `before` and `TCP 53` once the agent exists, because after that the
         only traffic crossing it is the agent upstream connection.
CONTENT  Checked against k8s 1.35, the NodeLocal DNSCache task page and `nodelocaldns.yaml`.
         The card is drawn in kube-proxy iptables mode, the mode the docs give first: the agent listens
         on both `<node-local-address>` and the kube-dns ClusterIP and the kubelet `--cluster-dns` flag
         is not changed, so the Pod keeps `nameserver 10.96.0.10`. IPVS mode, where the agent listens
         only on the link-local address and the kubelet setting must change, is one sentence on
         `agent` rather than a second picture.
         In that mode the agent cannot forward to 10.96.0.10, which it now answers itself: the
         manifest creates Service `kube-dns-upstream` selecting the same CoreDNS Pods, and the
         cluster-domain server block forwards to it with `force_tcp`. The CoreDNS box is therefore
         labelled with its Pod IP and not with the kube-dns ClusterIP, which on this card belongs to
         the agent.
         The cluster-domain block caps `success 9984 30` and `denial 9984 5`, which is the `at most 30
         seconds` and `at most 5` on `hit`. The `.:53` block forwards to `__PILLAR__UPSTREAM__SERVERS__`,
         filled from the resolv.conf the agent Pod gets under `dnsPolicy: Default` on the host network,
         which is the `external` step. The in-addr.arpa and ip6.arpa blocks also forward to CoreDNS,
         hence `the cluster domain and the reverse zones`.
         `the flow opens a conntrack entry`, one per lookup, and not `every query gets its own`: the
         A and AAAA
         queries of one glibc lookup leave from one socket and share an entry, and that shared entry
         is the race. The docs cite kubernetes/kubernetes#56903, `DNS intermittent delays of 5s`,
         where the lost AAAA packets stop with `single-request-reopen`, which per resolv.conf(5)
         reopens the socket between the A and AAAA requests. The `five second timeout` is RES_TIMEOUT,
         `currently 5 seconds` in resolv.conf(5).
         `IPVS mode binds only 169.254.20.10 and needs the Kubelet clusterDNS changed`, and not
         `the Kubelet clusterDNS points Pods at 169.254.20.10`: the docs say the flag `needs to be
         modified` in that mode, which is a setup step, not something that happens by itself.
         `kept for its record TTL, held between 5 and 30 seconds, and a negative one for 5`, and not
         `at most 30 seconds, less if its TTL is shorter`: the cache plugin reads `TTL overrides the
         cache maximum TTL` and `MINTTL overrides the cache minimum TTL (default 5)`, so a record
         with a 2 second TTL is still held for 5. `success 9984 30` and `denial 9984 5` give both
         numbers, and the manifest sets neither prefetch nor serve_stale, which is why an expired
         name `goes to CoreDNS again`.
         `By default only the cluster domain and the reverse zones go to CoreDNS`: stubDomains in the
         kube-dns ConfigMap add server blocks of their own, which the task page documents.
         The dataplane sublabel is `iptables rules` and not `kube-proxy iptables rules`: from `agent`
         on, the NOTRACK rules in that box are written by node-local-dns, not by kube-proxy.
         The `desc` says `In iptables mode NodeLocal DNSCache answers that ClusterIP`, because in IPVS
         mode it does not bind the ClusterIP at all.
         The TCP benefit is stated the way the docs state it, `a TCP entry is removed when the connection
         closes`, and not as `one long-lived connection`: the forward plugin pools connections, and
         how many it holds is not a number the card can draw. The upstream leg is DNAT-ed and tracked,
         so `conntrack` never reads `no entry` on a step whose ball crosses the dataplane to Node-2.
         `five second DNS stalls` is the symptom of the conntrack races the task page links to, and the
         `before` narration names the races as the cause and the stalls as what a reader sees.
BUDGET   Eight lines at 1100x800. `before` at 342 characters and `agent` at 337 both read 229.82, and
         at 355 characters `agent` reads 254.66, a ninth line that puts the panel over the Node-1
         frame.
         A longer narration on either step costs NODE_Y, and NODE_Y has no room: the chip strip already
         ends at 620 of 640.
SCOPE    The agent, the dataplane decision in front of it, and where a miss goes. The plugin chain
         inside CoreDNS is `network-dns-coredns`. The two tuples of a conntrack entry and the DNAT that
         writes them are `network-conntrack-nat`, and the kube-dns ClusterIP as a Service is
         `network-service-clusterip`. How many round trips a short name costs before any cache is
         `network-dns-ndots`. How a DaemonSet places one agent per Node is `workloads-daemonset`.
DO NOT   Point the upstream lane at `kube-dns 10.96.0.10`. In the mode this card draws, that address is
         bound on Node-1 by the agent itself, and a query to it would come straight back to the agent.
NOT A DEFECT
         The resolver pair TO_EXT/FROM_EXT is drawn on `before`, `agent`, `miss` and `hit`, where nothing
         rides it: it is the second destination the agent can pick (`NET.A-03`), and on `before` the
         local pair beside it says `not installed`.
         `report/arrival.test.mjs` prints twelve CUE LANDS LATER rows on `agent`, `miss` and `hit`.
         Each chip is wound back in `rewind` and turns over, cued, on the arrival where its fact
         happens: the rewrite and the conntrack reading when the query reaches the dataplane, the
         cache and upstream reading when it reaches the agent (`P-03`). Turning them at entry instead
         states a cache hit before the query has left the Pod.
```
