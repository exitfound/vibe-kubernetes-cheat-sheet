## workloads-termination-order

### layout

```
WHAT     Shutting a Pod down runs its declaration backwards with a gate in the middle: regular
         containers are signalled first in no reliable order, then the sidecars in reverse order.
DEVIATES WL.L-06: no LAYOUT preset. The chips are a 2 x 2 grid on the frame margins 98 and 1102,
         and the centre gutter is 92, the floor at which the widest left pair keeps a gap.
         WL.L-02: the frame is 1004 wide, not full width, so the frame, both chip columns and the
         second actor share one pair of margins and the chips read as the frame's caption.
         A-09: the Runtime sits on WL.CX and the Kubelet right of it, at FR_R - TOP_W.
         The Runtime sends the signal, so the spine leaves the box that acts.
         A-13: the last step fades the SHELL, not the Pod group. A group fade multiplies over
         containers already at 0.12 and would cut the Pod out (C-14).
         Step 2 sends ONE ball for two StopContainer calls: two staggered balls would draw an order
         between web and redis, which the narration says nobody can rely on.
CONTENT  Sources: Pod Lifecycle (Pod shutdown and sidecar containers, termination flow), Sidecar
         Containers (v1.35). Regular containers go first and in arbitrary order, sidecars follow in
         reverse definition order once the last regular one has terminated. On grace expiry the
         remaining containers stop together. No feature stage or version is spoken: the sidecar
         declaration belongs to workloads-init-containers-and-sidecars.
```
