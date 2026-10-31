## workloads-termination-order

### layout

```
WHAT     Shutting a Pod down runs its declaration backwards with a gate in the middle: regular
         containers are signalled first in no reliable order, then the sidecars in reverse order.
DEVIATES WL.L-06: no LAYOUT preset. The chips are a 2 x 2 grid on the frame margins 98 and 1102,
         and the centre gutter is 92, the floor at which the widest left pair keeps a gap.
         WL.L-02: the frame is 1004 wide, not full width, so the frame, both chip columns and the
         second actor share one pair of margins and the chips read as the frame's caption.
         A-13: the last step fades the SHELL, not the Pod group. A group fade multiplies over
         containers already at 0.12 and would cut the Pod out (C-14).
         M-10: step 2 sends ONE ball for two StopContainer calls. Two staggered balls would draw an
         order between web and redis, which the narration says nobody can rely on.
CONTENT  Sources: Pod Lifecycle (termination flow, sidecar shutdown), Sidecar Containers (v1.36),
         kuberuntime_termination_order.go. Regulars go first in arbitrary order, sidecars in reverse
         definition order once the last regular one has terminated. Only the signal waits: a sidecar
         preStop runs at once, so "no sidecar touched" is ruled out. On grace expiry only the sidecars
         not yet signalled stop at once, 2s floor (1.36 code, the docs say all). "The gate holds
         because" sidecars serve is ruled out: it waits on exits. No feature stage is spoken, the
         sidecar declaration belongs to workloads-init-containers-and-sidecars.
```
