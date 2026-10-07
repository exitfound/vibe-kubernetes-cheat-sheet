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
         A-13: the traffic lane stays at 1 while the Pod is alive, not dimmed at the slice arrival.
         Established flows still ride it, and the label `established flows only` carries the fact.
         T-21: the container runtime is named by the sigterm and expiry steps and not drawn.
CONTENT  Sources: Pod Lifecycle (Termination of Pods), EndpointSlices, Virtual IPs (terminating
         endpoints), Container Lifecycle Hooks (v1.35), upstream kubelet and endpointslice code.
         The Kubelet ASKS and the runtime SIGNALS, in every string. SIGTERM goes to PID 1, SIGKILL
         to every process. The chip reads `terminating · ready=false`. kube-proxy stops choosing it
         `while others stay ready`. preStop is `the usual way`, not the only one. A hook past expiry
         is cut short after a 2s extension. The phase belongs to the gone step alone.
OPEN     CENTRE on the chip strip (192..536 against 600, L-13): the Node frame and the trunk own
         every place a strip on 600 could stand, and moving the column breaks the fork.
```
