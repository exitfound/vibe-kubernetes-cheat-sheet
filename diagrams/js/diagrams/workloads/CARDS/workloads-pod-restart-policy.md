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
CONTENT  Sources: Pod Lifecycle, Feature Gates, apps validation, ContainerShouldRestart (v1.36). The
         Pod field is a default a container overrides with restartPolicy and restartPolicyRules
         (beta since 1.35), in rung 1 and the desc. `app` container, never `main`. Regular init
         rides the Pod value, the sidecar has its own sentence. First restart immediate. A Never Pod
         `whose containers set no policy of their own` never restarts. `long-running apps`, not
         `services`. The 5 minute cap is `by default` (KubeletCrashLoopBackOffMax). Backoff per
         container, not `shared`.
```
