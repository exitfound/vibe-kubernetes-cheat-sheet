## workloads-graceful-shutdown

### layout

```
WHAT     One delete starts two tracks that never wait for each other: the endpoint leaves the
         Service while the Node spends one 30s window on preStop, the stop signal and SIGKILL.
DEVIATES WL.L-06: no LAYOUT preset. The card is a fork out of one actor into two zones that differ
         on purpose (control-plane boxes over chips, a frame holding a process).
         L-23: the frame pads to the Kubelet inside it. Its top is the line both taps land on and
         its floor is 624, so the 4 spare units go into the signal lane, not a 290 frame.
         L-13: the content centres on 630, held by NODE_W 352 with taps mirrored about the spine.
         L-13: the chip strip stands under the endpoint track it reports, 192..536, not on 600: a
         strip on 600 crosses the fork and the in-flight lane.
         A-13: the traffic lane stays at 1 while the Pod is alive, not dimmed at the slice arrival.
         Established flows still ride it, and the label `established flows only` carries the fact.
         T-21: the container runtime is named by the sigterm and expiry steps and not drawn.
CONTENT  Sources (v1.36): Pod Lifecycle, EndpointSlices, Virtual IPs, Lifecycle Hooks, kubelet code.
         The Kubelet ASKS, the runtime SIGNALS. SIGTERM to PID 1, SIGKILL to all. The grace 0 DELETE
         follows Node cleanup, the phase is on gone alone. Chip `terminating · ready=false`, preStop
         is `the usual way`, kube-proxy stops `while others stay ready`, a late hook gets 2s more.
         Doc vs code: docs say terminating endpoints are always ready=false and a hung preStop makes
         the phase Terminating, code keeps ready under publishNotReadyAddresses and phase Running.
```
