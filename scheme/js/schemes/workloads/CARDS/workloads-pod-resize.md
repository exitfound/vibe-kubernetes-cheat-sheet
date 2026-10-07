## workloads-pod-resize

### layout

```
WHAT     CPU and memory changed on a Pod that stays up: the patch through the resize subresource,
         the Kubelet allocating it or raising PodResizePending, and the new limit landing on the
         container that never stopped running.
DEVIATES WL.L-02: the actor row is reversed and centres on 812. The API is on CX so the write drops
         one straight spine, and kubectl is right-aligned on 1140 with the frame and the verdicts.
         WL.A-02: the top wire label sits at `WIRE_TOP_Y = TOP_Y - 14`, 26, the cluster mode
         register `cluster-static-pods` carries, still above the row.
         WL.L-05: the C ladder band 840..1140 holds the Deferred and Infeasible verdict pair, not a
         ladder. The three-outcome decision is the subject.
         L-19: the `spec` wire slot holds 33 characters before it runs into `branch`, so it carries
         the field without the `watch ·` prefix.
         L-08: the bottom steps by whole lines. About 490 characters is the ceiling the frame at
         380 allows, and every prose edit is re-measured.
         C-01: the two verdict boxes are Pod conditions drawn in cluster indigo, because they are
         the Kubelet output in the Kubelet band.
         T-21: the `apply` step names the container runtime and nothing draws it. The rpc name
         carries the fact, and cluster-pod-sandbox-cri draws the CRI stack.
CONTENT  Sources: Resize CPU and Memory Resources, Pod QoS Classes, KEP 1287, cri-api, upstream
         kubelet (v1.35). The desc says `stable in 1.35`, never `since 1.35 you can`. The card plays
         a CPU-only resize: with memory on RestartContainer, moving both restarts the container.
         Restart wins when two resources with DIFFERENT policies change. A QoS change is `refused by
         the API server`, never `by admission`. The memory skip clause keeps `under NotRequired`.
         `resources` is not called immutable, the Pod v1 `Cannot be updated` line is stale.
OPEN     L-14: CENTRE-LOW reads the blocks below the panel at 390..1140, centre 765. The reversal
         leaves 60..484 empty, and both alternatives move the hole (L-16).
```
