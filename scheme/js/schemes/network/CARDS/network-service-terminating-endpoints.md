## network-service-terminating-endpoints

### layout

```
WHAT     A rolling update retires web-c without dropping a request: web-d is Ready first, the
         endpoint of web-c flips to ready=false with serving and terminating true, the Service rules
         stop picking it for new connections, its established flow finishes on its conntrack entry,
         and it exits at 14s inside a 30s grace period.
LAYOUT   Three bands. The traffic line at FLOW_Y 300 runs Client Pod, Node dataplane, then a column
         of three Pods: web-a at y 130, web-c at 300 on the straight leg, web-d at 470. kube-proxy
         stands UNDER the dataplane in the same 232 column, joined to it by a relation, and reads the
         slice frame on its left: `EndpointSlice web-x9f2` holding ONE endpoint as three condition
         chips. Under both, the grace clock spans the full content width at 36 units per second, so
         the window is a length the reader compares rather than a string. kube-proxy sits below the
         path and not above it, so the card does not repeat the T of `network-service-clusterip`, and
         its slice holds one endpoint with three conditions where `network-endpointslice-reconcile`
         holds three endpoints with one. Both actors are 232x80 (`NET.L-01`): the dataplane centred
         on FLOW_Y at 260..340, kube-proxy at 429..509 centred on the slice face at 469, so the
         relation between them runs 89. The slice frame keeps its 320x178, sized by its chip rows.
         The Client Pod stands centred over the slice frame, x 125..315 on its centre 220, so the
         left column reads as one stack and the client lane runs 155 to the dataplane.
PANEL    Deepest at 1100x800, bottom 180.1 on every step, six lines each (`extents.mjs`, or
         `OVERLAY_IDS=network-service-terminating-endpoints node --test report/overlay.test.mjs`
         from `scheme/test/`). The Client Pod is the one block left of 420 above the slice frame and
         opens at y=245, 64.9 clear of it. The slice frame starts at 380 and the ruler caption at
         584. No narration breaks a Pod name at its hyphen at any of the three viewports, which is
         why `drain` reads `and Pod web-c takes until 14s`: bare `web-c` there broke to `web-` and
         `c` at 1600x1000 and 1280x860.
LANES    Every traffic ball rides the client lane, then one of three legs off the dataplane face at
         x 702: the web-a leg leaves at y 274 and the web-d leg at 326, both turning on BUS_X 816, and
         the web-c leg runs straight at 300. The watch arrow from the slice frame to kube-proxy carries
         the only ball that ever reaches kube-proxy, and the link from kube-proxy up to the dataplane
         is a relation nothing rides. web-d and its leg are one group, at opacity 0 before `surge`, so
         no arrowhead points at a Pod that does not exist yet (`A-14`). On `gone` the web-c leg goes
         to 0 while web-c keeps the terminated shade (`A-14`). Every other headed line is at 1 on
         every step, the leg to a terminating web-c included.
MOTION   `steady` and `drain` send TWO rides off one client pulse, `CONN_GAP` 540 apart, and each ride
         names itself on the leg where the two part: `long request` and `new conn` on `steady`,
         `established` and `new conn` on `drain`. The watch ball on `reprogram` runs 90 units on the
         700ms floor. The two ruler spans light by opacity, `segPre` from `delete` and `segDrain` from
         `drain`, both stated by the one `stage()` factory, so prev and reset replay the elapsed state.
         Every riding tag finishes its 150ms fade-in as its ball leaves and fades out over 170ms from
         arrival. On the two bus legs it trails its ball by 50 and clears the dataplane as the ball
         leaves: 22 above its ball on the web-a leg, ink 5.5 over the dataplane top, and 30 below it
         on the web-d leg, ink 6.2 under the dataplane bottom, so it passes under the corner where
         that leg turns toward web-d. It runs the x 816 trunk 25.5 units left of it and stops 25.5
         short of the Pod face. The web-c leg tag trails by 24 and is an OPEN below. `surge` lights
         the slice frame on the Ready beat, where the endpoint of web-d turns ready=true, and `gone`
         lights the frame with its three emptied rows.
CONTENT  The deletion starts two things at once, and `delete` draws both in one step: the preStop sleep
         and the endpoint flip. `reprogram` stays inside the same 0s to 5s span, before the SIGTERM
         tick, so nothing on the canvas says the flip waits for the signal. Every number the narration
         states is a drawn tick: 0s, 5s, 14s and 30s. On `gone` the endpoint leaves the slice, drawn as
         the header `endpoint 10.244.3.9 removed` over three `(empty)` rows, never as a condition value
         the API does not have. Every claim below is read against release 1.35.
         `steady` says the slice `lists endpoints for web-a and web-c, drawn here for web-c`. The
         frame holds one endpoint of a slice that lists every Pod behind the Service, and `the slice
         lists web-c as ready=true` is rejected: it reads the one-endpoint frame as the whole slice,
         which `surge` contradicts by lighting that frame for the endpoint of web-d.
         `gone` says `Once the Pod reaches a terminal phase, its endpoint leaves the slice and the Pod
         object is removed`, and the aria-label says the same. `The Pod is deleted and its endpoint
         leaves the slice` and `exits at 14s so its endpoint leaves the slice` are rejected: the
         deletion started at 0s, and exiting alone does not drop the endpoint. The kubelet `transitions
         the Pod into a terminal phase` and then removes the object (Termination of Pods), and the
         controller drops a Pod once `isPodTerminal(pod)` holds (`ShouldPodBeInEndpoints`,
         staging/src/k8s.io/endpointslice/util/controller_utils.go). Neither the kubelet nor the
         controller is drawn, so the sentence names neither (`T-21`).
         `delete`: the endpoint `turns ready=false and terminating=true, while serving follows readiness
         and stays true`. `serving and terminating stay true` is rejected: terminating flips on deletion
         (`terminating := pod.DeletionTimestamp != nil`, staging/src/k8s.io/endpointslice/utils.go), and
         serving `maps to the Pod's Ready condition` (EndpointSlices), which the kubelet keeps probing
         through shutdown: only liveness and startup stop on deletion (pkg/kubelet/prober/worker.go).
         The sleep is `the 5s preStop sleep web-c declares`: preStop is optional, and the `sleep` handler
         is GA since 1.34 (`PodLifecycleSleepAction`). The flip and the hook both start from the deletion
         (`At the same time as the kubelet is starting graceful shutdown of the Pod, the control plane
         evaluates whether to remove that shutting-down Pod from EndpointSlice objects`), and SIGTERM
         waits for the hook (`the hook must complete before the TERM signal`, Container Lifecycle Hooks).
         `surge` states the fencepost: on two replicas maxUnavailable 25% rounds down to 0 and maxSurge
         25% rounds up to 1 (Deployment, Max Unavailable and Max Surge), so web-c stays until web-d is
         Ready. `web-d joins the slice as a ready endpoint` is rejected: a Pod with an IP is listed
         before it is Ready, as ready=false (`ShouldPodBeInEndpoints`), so its endpoint TURNS ready=true.
         `reprogram` keeps `as ready endpoints remain`: kube-proxy uses serving terminating endpoints
         only when no endpoint is ready (`CategorizeEndpoints`, pkg/proxy/topology.go).
         `drain` keeps `established TCP conntrack entry, which the rule change does not touch`:
         kube-proxy
         clears stale entries for UDP alone (`we are only interested in UDP services`,
         pkg/proxy/conntrack/cleanup.go), and a NAT decision `will apply to all future packets on that
         connection` (netfilter NAT-HOWTO). web-c `takes until 14s` there because the span to 14s fills
         on that step.
         The 30s tick reads `30s SIGKILL if still running`: the KILL signal goes only to what is still
         running when the grace period expires, and that period counts the preStop time (`applies to the
         total time it takes for both the PreStop hook to execute and for the Container to stop`).
         `gone` says `no request was dropped`, never that the rollout dropped none: on two replicas the
         rollout goes on to replace web-a, which the card does not draw.
SCOPE    How the slice is written from Pod readiness is `network-endpointslice-reconcile`. How a backend
         is picked among ready endpoints is `network-traffic-distribution`. The fallback to serving
         terminating endpoints, when no ready endpoint is left, is not drawn here.
WHY NOT  kube-proxy on the flow line with the fan leaving it. That draws kube-proxy forwarding packets,
         which `network-service-clusterip` states it never does, and it puts conntrack, the thing the
         drain rests on, in the wrong box.
         The replacement named in words only. The closing step then names a Pod the canvas does not
         hold, and the reason the drain is safe, spare capacity already Ready, stays invisible.
DO NOT   Write `ready=true` beside `terminating=true`. `ready` is serving AND NOT terminating (the
         EndpointSlice reference), so that pair is a combination the API cannot produce.
         Credit the terminating-endpoint fallback with keeping the long request alive. Ready endpoints
         remain here, so no fallback applies: the established flow survives on its CONNTRACK entry,
         which already maps it to web-c, and web-c keeps answering because a Pod shutting down
         `should start terminating and finish processing open connections`
         (https://kubernetes.io/docs/concepts/workloads/pods/pod-lifecycle/#pod-termination).
         Fire both rides at one delay off one client hop. That draws one connection splitting across
         two Pods, the one thing a connection cannot do.
         Put the flip after the SIGTERM tick, or narrate it as following the signal. Both start from
         the deletion and race, which is the reason a preStop sleep exists at all.
NOT A DEFECT
         The R2-ENTRY rows on `reprogram`: `ready=false` and `terminating=true` stand unlit at its
         t=0 because they turned over at 450ms on `delete`, which lights both.
         The watch ball runs 90 units on the 700ms floor, 0.129 units per ms, the same length
         `cluster-scheduler-decision` runs (`M-13`).
         The tick labels ink to y 633.7 of the 640 viewBox at all three viewports and render whole.
         `surge` draws no watch hop to kube-proxy although the rules change there too. The rule
         rewrite is drawn once, on `reprogram`, and `surge` spends its hold on the maxUnavailable
         fencepost: a second hop would add about 800ms to a step already at 21.1 ms per character.
OPEN     CENTRE on the condition column: `report/geometry-soft.test.mjs` reads the three chips as a
         strip spanning 74..366, centre 220 against 600. They are the rows of the slice frame and take
         its column. Centring them means moving the slice off the line kube-proxy reads it on or
         stretching the rows past their frame, and both make the picture worse (`L-16`). The ruler
         under them spans 60..1140 and centres on 600.
         `delete` and `gone` stand still 1800 of 3400ms (53 percent) at 15.0 and 15.7 ms per
         character. Every event their narration names is drawn, so more motion would be decoration
         (`M-10`), and a shorter duration alone is what `M-19a` rules out.
         The web-c leg tag inks across both faces it runs between. Between the two trunks the tag must
         stay inside y 274..326, which the dataplane (260..340) and web-c (250..350) both span, so a
         fixed offset on a 228 unit ride clears the dataplane as the ball leaves or web-c as it lands,
         never both. At dx -24 it inks no text and no inner box: at 1100x800 `long request` (73.6)
         starts 8.6 right of the dataplane label and ends 7.2 left of the app box, over the dataplane
         face by 12.8 at departure and over the web-c face by 12.8 on arrival. Hiding it for the first
         part of the ride instead is the late tag the reader sees as text arriving mid-flight.
         At departure it shares the line of the dataplane label (ink y 282.2..294.5 against
         284.5..300.5), so for that instant the two read as one string. The corridor from the label
         end at 632.6 to the app box at 950 is 317.4 against the 301.6 the ride and the tag need, and
         dx -24 already splits the 15.8 of slack. The web-a leg at y 274 bounds any lift.
```
