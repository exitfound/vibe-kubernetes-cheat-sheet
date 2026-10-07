## workloads-pod-restart-policy

### layout

```
WHAT     restartPolicy Always, OnFailure and Never against the same exit, enforced in place by the
         Kubelet.
DEVIATES WL.L-07: Kubelet comes first in the actor row, centred on CX, so the relation down to the
         Node leaves a box midpoint inside the corridor. Swapped, the first hop leaves the API.
         L-08: the `policy` step is a character budget. Past about 574 characters the panel
         covers the `Node-1` frame label, and OCCLUDED does not score so thin a strip.
         M-10: the exit steps send one ball, the status PATCH. Nothing answers a status write, so
         the return lane rides on `policy` alone and `fit` draws no flow.
CONTENT  Sources: Pod Lifecycle (restart policy, container restart rules, Pod phase), Feature Gates,
         apps validation (v1.35). The Pod field is a default a container may override
         (ContainerRestartRules is beta at 1.35), in rung 1 and in the desc. The first restart is
         immediate and only later ones back off. A regular init container rides the Pod value, and
         the sidecar keeps its own sentence. A Never Pod `whose containers set no policy of their
         own` never restarts. `long-running apps`, not `services`. The 5 minute cap is `by default`.
```
