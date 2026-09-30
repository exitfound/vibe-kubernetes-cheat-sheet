## network-dns-coredns

### layout

```
WHAT     A name resolved through the CoreDNS plugin chain: which stage answers it, where that stage
         gets its answers, and the fact that the answer comes back out through cache.
LAYOUT   ONE READING AXIS, which is what the composition is for. The client and the stage that
         answers it share FLOW_Y 340, so the query runs dead straight into the face of the first
         stage, and everything after that happens on the vertical the three stages stand on: down
         the seam to `kubernetes`, back up it to `cache`, out the way it came. A vertical plugin
         ladder crossed by horizontal traffic turns the eye 90 degrees inside the box and back out
         again, and it scatters the readouts and resolv.conf into corners of their own: four groups
         in four corners against the one axis here.
         The TOP BAND carries the API server, which `L-01` leaves free right of x=420 whatever the
         panel does, and which the card needs rather than merely fits: the `climb` narration turns
         on the kubernetes plugin answering from its own watch, which without that block is a
         sentence with nothing on the canvas (`T-21`). The block also carries the composition out to
         x=1130, which is what keeps the content bbox off a CENTRE finding.
         CoreDNS is drawn as three boxes under a caption rather than as a Pod, which is what
         `NET.S-01` asks for and what both sibling DNS cards already do.
PANEL    Measured bottom lo..hi per viewport: 125.11..160.00 at 1600x1000, 150.17..192.67 at
         1280x860, 194.85..244.54 at 1100x800, the deepest reading on the answer step:
         `OVERLAY_IDS=network-dns-coredns node --test report/overlay.test.mjs` from `scheme/test/`.
         The client Pod stands at x=114 rather than on the left margin, so it centres over the
         resolv.conf column under it: 232 against 320 puts it 44 in, and the two centres measure
         241.5 against 241.6. The file reads as that Pod's own file that way, rather than as a
         second column that happens to start on the same edge.
         The client column is the only content left of x=420, it opens at y=288, and stands 43.46
         clear of the deepest reading, 244.54. That clearance is what the narration LENGTH leaves,
         so it is spent by prose and not by geometry: a fourth sentence on the chain step measures
         304.36 there and leaves none.
SIZES    Every actor is `NET.L-01`: 232 by 80 for a box, 232 by 104 for the Pod with a 192 by 44 app
         box inside. The three readouts take the same 232 and stand in the API block column, so the
         right edge is one line at 1130.
         The resolv.conf chips are the one departure, 320 wide, and a measured one: `search` plus
         `default.svc.cluster.local +2` inks about 225 of a 232 chip before padding, which leaves
         the name and the value touching. They are a FILE rather than an actor row, so the width
         answers to the string and not to the grid.
LANES    The query and the answer are ONE PAIR on the `cache` left face, out at 328 and home at 352
         about the face midpoint 340, which is the mirrored pair `L-12` names and not two strays.
         The seam between `cache` and `kubernetes` carries the same idea vertically: the request
         falls on x 724 and the answer climbs on x 748, both 12 off the face midpoint 736, so the
         two directions never share a line.
         Two lines carry no ball ever. The leg down to `forward` is the path a name outside the
         cluster zone would take (`NET.A-03`). The watch from the API server leaves its left face
         midpoint, runs down x=876 and enters the `kubernetes` right face midpoint: it goes AROUND
         rather than straight down, because a straight line from the API block to that plugin would
         cross the `cache` box between them, which is `L-10`.
MOTION   The query lane is 274 units and the step carries 2800ms: 800 of pulse beat, 700 of travel,
         then `cache` LIGHTS on the arrival at 1500 (a box lights, it does not pulse) and 1300 hold.
         700 is MEASURED and not the quotient: 274 units at the
         canon 0.45 u/ms would finish in 609, so `routeDur` clamps to the `M-13` floor and the ball
         reads slower than its length says. `pace.mjs` puts it at 0.391 u/ms. The two seam hops are
         40 units each and floor at the
         short-hop minimum, which is the point of them: a fall through the chain costs nothing next
         to the round trip that reached it, and the two are drawn at the same speed so the reader
         sees the difference in LENGTH rather than in pace.
WIRE LABELS
         Four, and each one names the line it stands beside rather than repeating a chip. MEASURED
         at 1600x1000, with the rail each clears: `request` inks 647.9..696.1, 27.9 clear of the
         descent rail at x=724, and `answer` 779.3..820.7, 31.3 clear of the ascent rail at x=748
         and 31.3 inside the box edge at 852. Both sit at 392.8..407.4, inside the 380..420 seam
         band, because the seam itself is 24 wide and holds no text at all.
         The two standing captions are `P.tag` and not step labels, since both lines are true on
         every step: `outside the zone` inks 604.9..715.1, 20.9 clear of the fall leg at x=736, and
         `watch` 826.8..861.2, 14.8 clear of the watch rail at x=876. Both sit in the SAME BAND as
         their line and 15 to 21 off it, which is the only distance that works on a long rail:
         centred on the rail the text lies across its own line, and past about 30 the caption reads
         as belonging to nothing, since a 360 unit rail gives the eye no other anchor.
         `request` and `answer` are deliberately NOT the words the chips carry. The cache chip on
         the same step reads `miss` and then `stores the answer`, so a label repeating it would put
         one fact on the canvas twice and leave the seam itself unnamed. Nothing in the suite
         measures a wire label (`L-19`), so a longer string here is re-measured at 1600x1000, where
         the ink is widest.
CONTENT  Every claim is read off the source and not recalled. The chain order is
         `plugin.cfg` and not the Corefile: coredns.io/manual/plugins states it outright, `The
         ordering of the Plugins in the Corefile does not determine the order of the plugin chain.
         The order in which the plugins are executed is determined by the ordering in plugin.cfg`.
         In that file cache stands ahead of kubernetes and kubernetes ahead of forward (entries 39,
         51 and 57 on master, read 2026-09-18), which is the order the three boxes stand in.
         It is NOT the first stage: `prometheus`, `errors` and `loadbalance`, all in the default
         Kubernetes Corefile, run ahead of it and answer nothing, so the cache sublabel, the query
         step and the aria-label say `the first stage that can answer`.
         The kubernetes plugin `watches Endpoints via the discovery.
         EndpointSlices API`, which is what the API block and the watch line draw and what lets the
         card say it never queries the API per lookup: the same page says CoreDNS `will delay
         serving DNS for up to 5 seconds until it can connect to the Kubernetes API and synchronize
         all object watches`.
         SERVICES is the half the documentation does not spell out, and the card says it anyway on
         the plugin SOURCE, which is where the docs are silent: `plugin/kubernetes/controller.go`
         builds informers for `&api.Service{}`, `&api.Pod{}`, `&discovery.EndpointSlice{}` and
         `&api.Namespace{}`. A record answer for a Service is impossible without the first of those,
         so `its own watch of Services and EndpointSlices` stands, sourced one level below the docs.
         The cache sublabel `answers within TTL` takes
         the plugin page, which caches both positive and denial answers under a maximum TTL of 3600
         and 1800. Each CoreDNS replica keeps its own cache, so the answer step scopes the cache
         hit to `the next lookup of this name that lands on this Pod`.
         The answer step says the answer leaves `the way the query came in`, and `leaves the chain
         at the stage that stored it` is rejected: the stages ahead of cache wrap its response
         writer, so the answer passes back out through them, `loadbalance` shuffling its records.
         The resolv step and the desc say the Kubelet CONFIGURED the file, the documentation verb:
         `kubelet configures this file for each Pod` (dns-pod-service). `written by the Kubelet at
         startup` is rejected: under CRI the Kubelet hands the DNS config to the runtime in the
         sandbox config and the runtime writes the file, and `at startup` reads as the Kubelet
         starting rather than the Pod. Read against 1.35: the ndots:5 example, the kubernetes
         plugin default TTL of 5 seconds, and a name outside the plugin zones passing down the
         chain.
         The `search` chip reads `default.svc.cluster.local +2` and not the older
         `default.svc / svc / cluster.local`: the real list is
         `default.svc.cluster.local svc.cluster.local cluster.local`, and the compressed form names
         three domains that do not exist.
         `rcNS`, `rcSearch` and `rcNdots` are CONSTANTS OF THE DIAGRAM. The three chips are a FILE,
         and the resolv step says so in words: the Kubelet configured it when the Pod started,
         before anything on this card happens, so no step can produce one of its lines. Every step
         states all three, which puts them inside `P-01` at the values the scene was built with.
SCOPE    WHO ANSWERS, and the chain the request runs down and back up. What a short name costs
         before any of this, the search list and the walk, is `network-dns-ndots`, so the query step
         names the expansion rule in one clause and stops. The SHAPES the answer can take, A against
         SRV against a Pod record, are `network-dns-records`. An agent answering on the Node before
         the query ever reaches this path is `network-nodelocal-dnscache`. The kube-dns ClusterIP the
         query is sent to is a Service like any other, and the DNAT that carries it to a CoreDNS Pod
         is `network-service-clusterip`. How the Services and EndpointSlices behind the API block
         come to exist is `network-endpointslice-reconcile`: this card draws the watch and not the
         write. A headless answer is `network-headless-service`. `dnsPolicy` and a Pod `dnsConfig`
         are drawn on no card, so the resolv step states the file the Kubelet configured and does
         not say what else could write it.
NOTE     `forward` stands at `OPACITY.notready` on every step, which is the shade for a block
         outside the path (`C-14`). No step of this card reaches it: the name asked for is inside
         the cluster zone, so the stage is real, drawn, and never taken. At full weight it reads as
         a third working stage, and the picture then says nothing about which road the story takes.
         `clientBox` is listed by key in `SCENE.reset` (`NET.S-02`), or the highlight a reduced
         replay sets leaks from one step into the next.
         `pCache` stands in the `lit` list of the fall-through step because it is the SENDER there:
         a ball must not leave a dark block (`M-18a`), which `report/arrival.test.mjs` R4 reports
         if the list drops it.
WHY NOT  A Pod shell around the three stages. Measured: the shell runs 297..591, so its left face
         midpoint is 444 and the lane pair landing beside the `cache` row reads 86.0 and 62.0 off
         it, which `test:geometry/OFFEDGE` reports as two strays rather than as a pair. A shell
         costs either a query bent into a corner to reach the Pod midpoint, which breaks the one
         reading axis LAYOUT is built on, or an entry at the row the Pod centre happens to land on,
         which is not the first stage.
DO NOT   Capitalise the three stage labels. They are the literal plugin names as `plugin.cfg` and
         every Corefile spell them, and `forward` is carried in `KNOWN_CASING` in
         `render/inline.test.mjs` for exactly that reason.
```
