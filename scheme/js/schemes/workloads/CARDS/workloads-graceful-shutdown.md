## workloads-graceful-shutdown

### layout

```
WHAT     One delete starts two tracks that never wait for each other: the control plane pulls the
         endpoint out of the Service while the Node spends one 30s window on preStop, the stop
         signal and, if the app outlives it, SIGKILL. The preStop pause is the only thing that lines
         the two up.
LAYOUT   A FORK out of one actor into two zones, and no A / B / C preset: the card carries no ladder
         and no flanking chip column for a preset to choose between.
           actor row  40..120: API 484..716 centred on CX (both legs leave its bottom face,
                      WL.L-07), ETCD cylinder 1000..1140 x 30..130, the overhang
                      cluster-cascading-deletion gives the same block
           bus        y=300, from x=300 to x=900, off the spine at 600
           left zone  EndpointSlice controller 120..480 x 330..390, kube-proxy 120..480 x
                      434..494, both 360 wide and centred on the tap at 300
           chips      60..540, two rows 510..544 and 552..586, under the left zone
           right zone Node frame 660..1140 x 330..598 with the Kubelet INSIDE it at 780..1020 x
                      358..410 and the Pod at 700..1100 x 452..574, inner box 750..1050 x 482..546
         The fork is the composition: two taps of equal length, 30 each, because both watchers see
         the same write at the same moment, and the two zones are not alike on purpose. The left is
         two control-plane boxes over a chip column, the right is a frame holding a process. A
         symmetric pair of frames would say the two tracks are the same mechanism twice, which is
         what the card exists to deny.
         The Kubelet sits inside the frame the way workloads-crashloopbackoff draws it, because from
         the fork on every Node-side action is local: the tap ends on the frame face (WL.A-03) and
         the Kubelet lights on that arrival.
         The ETCD cylinder is the one lever no sibling in pods-lifecycle carries (kin.mjs). It is
         here because the mechanism is a STORED field: Terminating is the presence of
         deletionTimestamp on the object in the store, not a phase, and the last beat of the card is
         that object leaving the store. kube-proxy keeps its rules and conntrack on the canvas as
         one box, so the traffic lane has a source that is on every Node.
         Signature box4 pod1 node1 chip2 cyl1 chain0 raw0, unique in the section. Six body bands
         (30, 40, 330, 358, 434, 452), which kin.mjs reads as deep.
         THE LEFT BOXES ARE 360 AND NOT THE 232 ACTOR WIDTH because the content bbox is what centres
         the card. `L-17` drops chips, so the column under the left zone is invisible to it, and at
         232 the bodies span 184..1140 on 662, past the 600 +-40 window. At 360 they span
         120..1140 on 630 and the five low blocks 120..1100 on 610, so neither CENTRE nor CENTRE-LOW
         reads the content as leaning, and the boxes stand inside the 480 chip column under them.
PANEL    x<=397 catalog-wide (`L-02`). Bottom per viewport: `OVERLAY_IDS=workloads-graceful-shutdown
         node --test report/overlay.test.mjs`. Deepest on step 0 at 1100x800, the poster frame
         previewing the 384 character delete narration, and the swing across the set is 102.07
         units. It pins BUS_Y: the bus at 300 stands 20.49 clear of the deepest panel, and the whole
         left zone at x 184..416 is legal only because it starts at 330, under that bottom (`L-03`).
         A narration longer than the delete step spends the 20 unit gap first (`L-08`). The bus is
         the one number the panel pins. Both zones hang 30 under it and every left-zone y follows
         from it, so a narration that pushes the panel past 280 moves the whole picture down by the
         same amount, and the chips, ending at 586, have 38 of floor to give.
SIZES    Left boxes 360 x 60, the width LAYOUT gives the reason for, and the shortest height a
         label plus sublabel pair takes in this category. Kubelet 240 x 52. Pod 400 x 122 with a 300 x 64 inner box, the
         sublabel baseline 12 under it. Frame 480 x 268: the frame label row, the Kubelet, a 42 unit
         signal lane, the Pod and 24 of foot. It is the second tallest node() frame in the category
         after workloads-termination-order at 244 plus what a Kubelet inside it costs. Chips 480
         wide. The widest pair is `endpoint 10.244.1.7` against `terminating · ready=false` at
         172.3, measured at 1600x1000, the WIDER reading.
         Wire strings, at 1600x1000: `slice: terminating, ready=false` 213.6 inking 312..525.6,
         past the box wall at 480, in the gap between the two boxes and 14.6 above the kube-proxy
         top edge at 434. The traffic captions sit in the 180 unit corridor between the kube-proxy
         wall at 480 and the frame at 660, and the widest, `established flows only`, inks 151.6 on
         494.2..645.8, 14.2 clear of each wall, the binding clearance: a left box any wider runs
         into it.
         `if alive at 0s: SIGKILL` 158.5 inking 912..1070.5, 69.5 short of the frame wall. The
         longer form `if still alive at 0s: SIGKILL, every process` inked to 1181.9 at 1100x800,
         past the frame and 18 short of the canvas edge, so the caption is the short one and the
         narration carries `every process`. `write · deletionTimestamp, grace 30s` 248.1 on the
         WL.A-02 row between the API and the store, and `terminal phase · DELETE grace 0` 213.6
         beside the trunk.
LANES    Seven. WRITE is a single lane on TOP_CY from the API right face to the ETCD left face, 284
         units, ridden twice (the stamp, the removal) and never answered, so it draws no pair
         (WL.A-01). FORK_L and FORK_R share the trunk 600 x 120..300 and the bus, then tap down to
         the controller top and the frame top, 510 units each. REPORT_UP is FORK_R reversed and is
         the corridor pair of the right tap. It is visible only while the report climbs, and FORK_L
         is out for exactly that stretch: the two run the 180 units of trunk in opposite directions,
         and two dash patterns of one period on one segment fall on each other's gaps, so drawn
         together the trunk renders as a solid line.
         LINK, 44 units from the controller bottom to the kube-proxy top, carries the slice change.
         It COMPRESSES the round trip through the API that the change really takes, the controller
         writing the slice and kube-proxy reading it on its own watch, and the narration states that
         trip in words. TRAFFIC, 180 units on the frame centre line 464 from the kube-proxy right
         face to the frame left face, is why kube-proxy is centred on the frame centre and not on
         the controller.
         SIGNAL, 42 units from the Kubelet bottom to the Pod top, is the one lane inside the frame,
         drawn above its fill with TRAFFIC, and carries preStop, the stop signal and the kill under
         a label that names each.
         Every ball is narrated traffic (M-10): the connection that still lands on step 1, the write
         and the two watch events, the slice change, the in-flight request on step 3, the three
         signals, the report, the removal and the last slice change.
MOTION   Spans against durations: delete 3293/4600, deregister 2200/3400, prestop 3900/4800, sigterm
         2400/3200, expiry 3000/3800, gone 5326/5600.
         The API is lit at entry on delete and sources every ball of that step (M-18a). The write
         waits BEAT.lead, both watch events leave `after` it, and a connection lands on the Pod at
         delay 0 first, because the two tracks have not started yet.
         The fork balls run 510 units at 0.45 u/ms, 1133ms, the canon speed. The write is 284,
         floored to 700 at 0.406, which workloads-pod-qos-classes also runs. LINK and SIGNAL are 44 and 42, floored to 700 at 0.06, the length
         network-ipam-pod-cidr, network-pod-ip-and-veth and storage-csi-capacity-tracking also run.
         TRAFFIC is 180, floored to 700 at 0.257, the length cluster-etcd-raft,
         storage-csi-ephemeral-volume and storage-volume-snapshot also run.
         Down-arrow on every signal: the ball lands, then the Pod blinks (M-16). On expiry the blink
         comes first and the Pod, the traffic lane and the signal lane fade to OPACITY.terminated
         together one beat later (M-08, A-13), and the same shades are pinned in the static block
         (S-13, S-15).
         The traffic lane stays at 1 while the Pod is alive. It is not dimmed at the slice arrival:
         an established flow still rides it on prestop and a lane at 0.4 under a ball reads as the
         ball fading, so what says no new connection is routed is the label `established flows only`
         and not the shade.
         gone opens with the fork wound to the report shape (`rewind`: forkLeft 0, forkRight 0,
         reportUp 1) and turns it back at the report arrival, reportUp out over FADE.out and both
         down legs in over FADE.in, done by 2633 against the next ball leaving the API at 2833
         (A-15). The two balls that follow LEAVE the API, and a head still pointing at it would draw
         the report arriving twice. The static block pins the down fork, so prev and reset show the
         end state.
         Every chip that changes is wound back in `rewind` and turned over in an F.set on the
         arrival that earns it: the endpoint on the slice arrival, the window on the in-flight
         arrival of prestop, `closed` on the report, `removed` on the last slice change. The expiry
         value alone is written at entry, because the timer reaching 0 is the premise of that step
         and no arrival produces it.
         gone is the longest step by construction: four chained hops, report, removal, watch, slice,
         and it stands still for 274ms of its 5600. One factory for the Pod and the two lanes whose
         shade follows it, plus the fork at rest, in the shape A-16 asks for. The traffic lane is
         the min of its ends (A-13): it stays at 1 while the Pod is alive, whatever the endpoint
         says, and drops with the Pod on expiry.
CONTENT  Read against Termination of Pods on the Pod Lifecycle page, the EndpointSlice conditions
         page and Traffic to terminating endpoints on the Virtual IPs reference, k8sVersion 1.35.
         The two tracks are the doc's own: `At the same time as the kubelet is starting graceful
         shutdown of the Pod, the control plane evaluates whether to remove that shutting-down Pod
         from EndpointSlice objects`. The card names the EndpointSlice controller as that control
         plane, and draws it.
         `Terminating endpoints always have their ready status as false`, and `ready` is a shortcut
         for serving and not terminating (EndpointSlice conditions), so the chip reads `terminating
         · ready=false` from the slice arrival on, never `ready · serving`. The narration adds
         `serving still true` because serving maps to the Pod readiness and the app is still passing
         its probe.
         The in-flight connection is kept alive by its CONNTRACK entry, not by kube-proxy choosing a
         terminating endpoint: with the Cluster traffic policy and ready endpoints elsewhere,
         kube-proxy never selects a terminating one (Traffic to terminating endpoints, and the
         record of network-service-terminating-endpoints). The deregister narration says `on their
         conntrack entries`, and the kube-proxy sublabel names conntrack beside the rules for that
         reason.
         The Kubelet ASKS, the runtime SIGNALS, in every string on the card and not only in the
         narrations: `The kubelet triggers the container runtime to send a TERM signal to process 1
         inside each container` and `The container runtime sends SIGKILL to any processes still
         running in any container in the Pod`. So the desc reads `has the runtime send the stop
         signal` and the aria-label `running preStop and having the runtime send the stop signal`,
         matching workloads-termination-order (`has the runtime send the stop signal`) and
         workloads-poststart-prestop-hooks (`Kubelet ask the runtime for StopContainer`). The
         compressed forms `sends the stop signal` and `then the stop signal, then SIGKILL` are
         rejected: they credit the Kubelet with work the runtime does, and they contradicted the
         sigterm and expiry narrations of this same card.
         SIGTERM and SIGKILL have DIFFERENT targets. The stop signal goes to `process 1 inside each
         container`, SIGKILL `to any processes still running in any container in the Pod`. The
         sigterm step says PID 1, the expiry step says `every process still alive in any container
         of the Pod, not just to PID 1`, and the caption on the lane is the short form. SIGTERM is
         the runtime DEFAULT, not a rule: `SIGTERM unless the image sets a different STOPSIGNAL` is
         the doc wording, and `lifecycle.stopSignal` stays off the card because ContainerStopSignals
         is Alpha and off by default at 1.35 (T-23).
         The window is one budget: preStop and the drain both spend it, and the prestop step says
         `come out of the same 30s window`. Container Lifecycle Hooks states both halves, `The Pod's
         termination grace period countdown begins before the PreStop hook is executed` and `This
         grace period applies to the total time it takes for both the PreStop hook to execute and
         for the Container to stop normally`, which is also why the sigterm step says the timer
         keeps running. The 2 second one-off extension the Kubelet grants a preStop still running at
         expiry is not drawn: this scenario has the hook returning on step 3, and the expiry
         narration says a hook that sleeps longer `only delays the kill`, which is true of the
         extension as well.
         The terminal phase after a forced shutdown is `Failed or Succeeded depending on the end
         state of its containers`, and the gone narration keeps the pair. The phase belongs to the
         GONE step and to nowhere else, because the doc numbers it between the two beats this card
         draws either side of it: `The container runtime sends SIGKILL to any processes still
         running in any container in the Pod`, then `The kubelet transitions the Pod into a terminal
         phase`, then
         `The kubelet triggers forcible removal of the Pod object from the API server, by setting
         grace period to 0`. So the Pod sublabel on expiry reads `killed · exit non-zero`, which is
         what a SIGKILL leaves behind and what makes the phase Failed one step later. `killed ·
         phase Failed` is rejected there: it states the phase on the SIGKILL beat, one step ahead of
         the sentence that has the Kubelet set it, and a reader who has already seen `phase Failed`
         reads the gone narration as repeating itself. The pairing with `Terminating · phase
         Running` on delete survives it: that sublabel carries the phase claim on its own. `The
         kubelet triggers forcible removal of the Pod object from the API server, by setting grace
         period to 0`, then `The API server deletes the Pod's API object`: the report rides up the
         trunk, the API writes the removal to the store, and the wire reads `DELETE · grace 0,
         object removed`.
         kubectl prints Terminating from deletionTimestamp while status.phase stays Running, so the
         Pod sublabel carries `Terminating · phase Running` from the stamp on and the narration says
         both. Pod Lifecycle: `Make sure not to confuse Status, a kubectl display field for user
         intuition, with the pod's phase`.
         The grace the API records is `deletionGracePeriodSeconds` on ObjectMeta: `Number of seconds
         allowed for this object to gracefully terminate before it will be removed from the system.
         Only set when deletionTimestamp is also set`. The store lane on delete reads `write ·
         deletionTimestamp, grace 30s`, and `PUT` is rejected there: the request that reached the
         API was a DELETE, and what rides the lane is the update the API makes to the stored object,
         not a client verb.
         kube-proxy stops choosing the address `while the Service has other ready endpoints`, and
         the flat form is rejected: the proxy-terminating-endpoints KEP says `When the traffic
         policy is Cluster and all endpoints are terminating, then traffic should be routed to any
         terminating endpoint that is ready`, and the same for Local within one node, so a
         terminating endpoint that is still serving keeps receiving new connections when it is the
         last one. EndpointSlice conditions states the same bound in one sentence and is the
         citation the card uses:
         `Service proxies will normally ignore endpoints that are terminating, but they may route
         traffic to endpoints that are both serving and terminating if all available endpoints are
         terminating`. So the qualifier is carried EVERYWHERE the claim is made, the narration, the
         aria-label and the desc: `stops choosing it while others stay ready` in the desc, `while
         other endpoints stay ready` in the aria-label. The flat form (`so kube-proxy stops routing
         new connections`) is rejected in all three, and in the desc it is rejected against the
         character band as well (T-20): the clause was paid for by shortening the opening question
         to `Why does a deleted Pod still take traffic for a moment` and dropping `at once` from the
         second sentence, which `Neither waits for the other` already carries. The desc holds at 466
         of its 470.
         The preStop sleep is `the usual way to line the two tracks up`, and `the only thing` is
         rejected (T-19): an app that keeps serving after SIGTERM until its own drain completes
         lines them up without a hook. What makes the sleep WORK is the hook contract, from
         Container Lifecycle Hooks: `the hook must complete before the TERM signal to stop the
         container can be sent`, so the hook is the one place a Pod can hold PID 1 while the
         endpoint track catches up, which is the need Pod Lifecycle states as `Pods that shut down
         slowly should not continue to serve regular traffic and should start terminating and finish
         processing open connections`. `If the order of shutdowns matters, consider using a preStop
         hook to synchronize` is NOT the support for this claim and is rejected as the citation:
         that sentence is about the order across the containers of one Pod, which is
         workloads-termination-order, not about the endpoint track against the signal track.
         A hook that outlives the window `is cut short after a 2s extension, not waited for`, from
         `If the preStop hook is still running after the grace period expires, the kubelet requests
         a small, one-off grace period extension of 2 seconds`. `only delays the kill` is rejected:
         it lets a reader take the hook length as the delay, where the delay is two seconds whatever
         the hook does.
         The store lane on gone reads `remove · object gone` and the trunk `terminal phase · DELETE
         grace 0`, so each label names the traffic on its own lane (T-22): the Kubelet's DELETE with
         grace 0 rides the trunk to the API, and the removal from the store rides the store lane.
NAMING   The chip is `grace window`, not `grace remaining`: the last step has no remaining value to
         state whichever way the containers stopped, and `closed` is a state of a window where
         `closed` is not a value of a remainder. Its values are `30s left`, `25s left`, `0s ·
         expired`, `closed`.
         The API sublabel reads `stamps first, removes last`. `stamps, never removes` is rejected as
         a contradiction of the card's own last step, where the API removes the object from ETCD:
         the sublabel has to be true on every step, and the order is the claim. The kube-proxy
         sublabel is `Service web · rules, conntrack`: the traffic lane leaves this box on every
         step that carries a connection, and the second word is what carries the in-flight one
         (CONTENT).
SCOPE    workloads-poststart-prestop-hooks owns the preStop slot and how a handler is executed.
         preStop is one ball and one chip turnover here, and the handler kinds are named nowhere.
         workloads-termination-order owns the order across containers of one Pod. This card draws
         ONE app container, so no sentence here names a plural of containers being signalled.
         network-service-terminating-endpoints owns the routing choice among backends while one of
         them terminates, the client, and the two-backend fan. This card draws no client and no
         second backend, and the traffic lane leaves kube-proxy as the one box standing for the
         Service path on the Node.
         workloads-force-deletion owns grace 0 issued by an operator and what a Pod does on a
         partitioned Node. The grace 0 here is the Kubelet's own, after the containers stopped.
         cluster-graceful-node-shutdown owns shutdown by priority when the NODE goes down.
         The container runtime is named by the sigterm and expiry steps and drawn by neither, as on
         workloads-pod-startup-conditions: the Kubelet asks, the runtime signals, and the lane
         carries the signal from the box that asks.
NOT A DEFECT
         The trunk band 120..300 holds the trunk and one wire label and nothing else, and at
         1600x1000 the left half of it stands empty under a panel that ends at 177. That is the band
         the panel gives back at a wide viewport and cannot be filled (scheme/CLAUDE.md): the bus is
         pinned by the 279.51 the same panel reaches at 1100x800.
OPEN     `CENTRE` on the chip strip: the two chips span 60..540, centre 300, against a want of 600
         +-6 (`L-13`). It stays open because the strip has nowhere to go that keeps the fork. The
         Node frame owns 660..1140 x 330..598, so a strip straddling 600 at the chip rows 510..586
         runs into it, and under the frame there are 32 units of canvas for a 34 unit chip. The band
         above the bus is the only free width, and there the trunk runs down x 600 from 120 to 300,
         so a strip on 600 is crossed by it (`L-10`), and two chips either side of the trunk get at
         most 199 units each between the 396.55 panel and the trunk, where the endpoint pair inks
         172.3 plus 24 of chip padding and the 4 chipfit asks for. The
         column is the left zone of the fork, two control-plane boxes over their readouts, and
         moving it is a composition change. The content bbox centres and is not reported.
```
