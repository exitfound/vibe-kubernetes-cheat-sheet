## network-endpointslice-reconcile

### layout

```
WHAT     The EndpointSlice controller derives a list from live Pods: one endpoint per Pod matching the
         Service selector, its address and its ready condition, in a slice that states the port once,
         and kube-proxy builds Service rules from the ready endpoints.
LAYOUT   A derivation column on CX read bottom to top, then right. Three Pods on one pitch (POD_Y 504,
         bottom 624) are the source, a comb at BUS_Y 480 joins them to the EndpointSlice controller
         (y 376..456), the controller writes UP into the slice frame (y 154..338), and the Service on
         top (y 36..116) names the slice through a relation and lists no Pods. kube-proxy stands right
         of the frame on its vertical centre, the consumer that reads it. The slice frame spans COL_X
         420..780 and is sized by its rows, the NET.L-01 clause for a frame the rows are sized BY. The
         Service, the controller and kube-proxy are actor boxes and take 232 x 80. The frame stands
         exactly midway, COL_GAP 38 up to the Service and 38 down to the controller, so the Service
         relation and the write lane are one length.
         The slice is drawn as an object: a frame box, its name as a standing caption
         (`EndpointSlice web-x9f2`, the generated name `network-service-debugging` also draws) and
         a per-step wire under it for the port and the count, over three endpoint rows. There is no
         client, no flow line and no chip strip, which is what separates it from
         `network-service-clusterip`: that card stands a control column over a packet path, and this
         one stands on a floor of Pods.
PANEL    Deepest at 1100x800 on `readiness`, bottom 254.7, then 213.9 at 1280x860 and 177.4 at
         1600x1000, right edge 396.5 at most. Read with
         `OVERLAY_IDS=network-endpointslice-reconcile node --test report/overlay.test.mjs` from
         `scheme/test/`. Nothing starts left of x=420 above y 504, where Pod A opens 249 below the
         deepest reading.
SIZES    The widest row value is `10.244.3.9 · ready=false`, 147.2 at 1100x800, right-anchored at 754
         in a 332 row whose name `endpoint` ends at 495.1, 111.7 clear between them. The Service, the
         controller and kube-proxy are 232 x 80, the kubelet block of `network-model`, and their
         sublabels are cut to fit it: `selector app=web · lists no Pods` inks 196.3 (17.9 a side) and
         `watches Pods · writes the slice` 190.2 (20.9 a side) at 1100x800. The selector is on the
         Service, so the controller sublabel does not repeat it. The count line `port 8080 · 3 of 100
         endpoints` inks 184 in the 332 between the frame pads.
LANES    Three arrows carry a ball. STATUS_PATH runs from the top face of Pod B up to the controller
         (48 units), WRITE_PATH from the controller top to the slice frame bottom (38), READ_PATH from
         the right face of the frame to kube-proxy (80). Each array feeds its arrow and its ball, and
         all three sit on the 700ms routeDur floor. The comb is one relation U through the tops of Pods
         A and C at BUS_Y 480, crossing the CX trunk: the controller watches all three Pods, and
         only the status of Pod B
         travels on this card. The comb is drawn at full stroke-opacity through `tune`, because at the
         0.45 a relation takes by default it reads fainter than the dashed arrows it meets. The
         Service to slice link is a relation.
         Every write lands on the slice FRAME, never on a row. The slice is the object the controller
         writes, and the row that changed is named by the riding tag and by the row that lights.
MOTION   `selector` and `reconcile` pulse all three Pods, Pod C with the dim variant from
         OPACITY.notready, because all three match and all three are written. `reconcile` obeys P-03:
         rewind holds the rows at (empty) and the count at `0 of 100 endpoints`, and one F.set writes
         the rows and the count on the `write` arrival at 1500, where the slice and the rows light.
         `readiness` is two hops. Pod B blinks, its `Ready=False` rides the trunk at BEAT.afterPulse and
         lights the controller on arrival at 1500, and the write leaves BEAT.afterHop later and flips
         ep2 on its own arrival at 2300, rewind holding ep2 at ready=true until then. `consume` lights
         the slice and the one ready row as senders, the read leaves BEAT.lead later, and kube-proxy
         lights and takes `rules for 10.244.1.5 only` on its arrival at 1500. Live spans 900, 2080,
         2880 and 2080 against durations 2600, 3400, 3600 and 2800.
         Every tag fades in with its ball and fades at arrival (`emergeMode` with no `emerge` offset,
         hold 0, 170ms out). On the two vertical lanes a tag stands with its left end 8 right of the
         232 column boxes (`besideBoxes`, text left at 724), where no box face, string or lane is. The
         write tags ride 14 below the ball, so the ink ends 4 under the slice frame on arrival. The
         watch tag rides 30 above it, so the ink starts 4 over the comb bus it would otherwise cross.
         A tag on the trunk itself is struck through by the dashed lane or by a face at one end. The
         80-unit read gap takes only `slice` (30.7 wide): its left end starts 8 right of the frame face
         and it rides 46 above the lane, the ink 4 over the kube-proxy top on arrival. A probe sampled
         at 21 points per hop at 1100x800 and 1600x1000 finds no tag crossed by a box face, a string
         or a lane.
CONTENT  The port is a field of the SLICE. In the EndpointSlice API `ports` belongs to the slice and an
         endpoint carries `addresses` and `conditions`, so a row reads `address · condition` and the
         port is stated once, in the frame header. A row carrying `ip:port` draws one port per
         endpoint, which the API does not hold.
         Two readiness words for two objects. A Pod carries the `Ready` condition the Kubelet sets,
         `Ready=True` or `Ready=False` on the Pod sublabel and on the watch tag. An endpoint carries
         `conditions.ready`, `ready=true` or `ready=false` on its row. Both are written as a pair, since
         a bare `ready` beside `ready=false` reads as two different fields.
         Pod C reads Ready=False from the first frame, and `selector` says so, so no step shows a dim
         Pod the narration has not explained.
         The claims are read against Kubernetes 1.35, the k8sVersion, on the release-1.35 docs, the
         EndpointSlice API reference and the release-1.35 controller and kube-proxy source.
         One endpoint per Pod WITH AN IP. The controller skips a Pod with no Pod IP and a terminal
         Pod, so `reconcile` says `one endpoint per Pod with an IP`. A bare `one endpoint per Pod`
         is rejected: a Pending Pod with no IP matches the selector and is not written. A dual-stack
         Service gets one slice per address family, each holding one endpoint per Pod, so the one
         slice drawn is single-stack.
         The empty slice on `idle` and `selector` is real. With nothing to write the controller
         keeps a placeholder slice with no ports and no endpoints, and the first write reuses its
         name, so the header reads `0 of 100 endpoints` with no port until `reconcile`.
         The Service box `lists no Pods`, the narration `no list of backends`. `holds no addresses` is
         rejected because a ClusterIP Service holds `spec.clusterIPs`, an address of its own.
         100 is a default. `--max-endpoints-per-slice` on kube-controller-manager moves it, up to
         1000, so the prose and the aria-label say `by default` wherever they state it.
         Readiness flips on thresholds. The Pod turns Ready=False after `failureThreshold` failed
         probes in a row, 3 by default, and back after `successThreshold` passes, 1 by default.
         `starts failing, the Kubelet sets its Ready condition to False` and `turns ready again once
         the probe passes` are rejected: both read one probe result as the flip. The aria-label says a
         Pod `keeps failing its readiness probe` for the same reason, and `fails its readiness probe`
         is rejected there. `readiness` says one passing probe turns `the Pod and its endpoint` ready
         again: `turns both ready again` is rejected because two Pods stand at Ready=False on that
         frame and one probe on 10.244.2.7 readies only its own Pod.
         The Kubelet is narrated and not drawn. It sets the Ready condition through a Pod status
         update to the API server, and the controller sees it through its watch. The one watch lane
         folds both hops, and the DO NOT below keeps the API server off the card.
         kube-proxy writes rules for the ready endpoints. `for the ready endpoints only` is rejected
         as a general statement, because with no ready endpoint left kube-proxy falls back to
         endpoints that are serving and terminating. No endpoint here is terminating, so `10.244.1.5
         alone` holds. The closing line says `what is ready`: `what is healthy` is rejected because
         a Pod failing only its readiness probe is still live, the distinction `readiness` opens
         with.
SCOPE    The PRODUCER side: who watches the Pods, how an endpoint and its condition are derived, and
         what one reconcile commits to the slice. The read hop at the right of this card is the whole
         of the consumer side here, one clause and no timing. When kube-proxy turns that slice into
         kernel rules, how many changes it aggregates behind minSyncPeriod before it writes, and how
         long the rules therefore trail the API server, belong to `network-proxy-rule-resync`.
WHY NOT  A drawn budget meter under the count. `3 of 100` fills 10 units of a 332-unit track, which at
         1100x800 and at 1600x1000 reads as the rounded cap of an empty bar rather than as a quantity.
         The count is words in the frame header.
DO NOT   Pulse a dim Pod with a plain pulse. That pulse ramps the STROKE from the resting tint, which
         on a Pod at 0.40 is close to invisible, so Pod C on `selector` and `reconcile` and Pod B on
         `readiness` take `F.pulse` with `dim: true` and `from: OPACITY.notready`, which adds the
         opacity flash the dim variant exists for.
         Add an API server box to carry the watch. The column then converges on the same API server
         over kube-proxy column that `network-service-clusterip` draws, and the Kubelet to controller
         path is already named in the `readiness` narration.
OPEN     The drawn name `web-x9f2` is shorter than a generated one. The controller names a slice
         through generateName `web-` plus 5 random characters from `bcdfghjklmnpqrstvwxz2456789`, as
         in `web-x9f2k`. The same name is drawn on `network-service-debugging`,
         `network-service-terminating-endpoints` and `network-proxy-rule-resync`, and one object
         keeps one label across cards (T-13), so the name changes in one pass over all four or not
         at all.
```
