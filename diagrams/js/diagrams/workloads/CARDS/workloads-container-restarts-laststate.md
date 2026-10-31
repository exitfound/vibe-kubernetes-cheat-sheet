## workloads-container-restarts-laststate

### layout

```
WHAT     A restart does not erase a death: the Terminated record of the instance that died rolls
         from state into lastState, the dead instance stays on the Node for one generation, and both
         survive exactly one more restart.
DEVIATES WL.L-02: the Node frame is 90..1110, not full width, a row under the narrower slot row.
         WL.A-03: the Kubelet sits inside the frame and WRITE_LANE leaves the interior upward. It is
         the Node reporting out, and nothing from the actor row enters the frame.
         A-13: the ground lane pair is pinned at 1 on every step. At the Pod's notready shade the
         exit report would ride a faded lane while the Kubelet at its far end stands at 1.
         C-07: the previous instance rests at 0.4 while the Pod is at 1 and rises to 1 while the
         Pod is at notready, so the product never drops to 0.16 and loses its sublabel.
CONTENT  Sources (v1.36): Pod lifecycle, core/v1 ContainerStatus, Determine the Reason for Pod
         Failure, Logging Architecture, Assign Memory Resources, containerd CRI. The message is part
         of Terminated, not a slot. FallbackToLogsOnError needs an empty file AND an error exit. One
         dead container is kept `by default`. The record leaves the live slot when the Kubelet turns
         to the restart. The Kubelet `spots` the death. Codes above 128 `usually` carry a signal,
         the code narrows and the reason names. App #3 starts past the 10 minute backoff reset.
```
