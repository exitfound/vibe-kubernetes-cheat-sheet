## workloads-pod-restart-policy

### layout

```
WHAT     restartPolicy Always, OnFailure and Never against the same exit, enforced in place by the
         Kubelet.
DEVIATES M-10: the exit steps send one ball, the status PATCH. Nothing answers a status write, so
         the return lane rides on `policy` alone and `fit` draws no flow.
CONTENT  Sources: Pod Lifecycle, Feature Gates, apps validation, ContainerShouldRestart (v1.36). The
         Pod field is a default a container overrides with restartPolicy and restartPolicyRules
         (beta since 1.35), in rung 1. `app` container, never `main`. Regular init
         rides the Pod value, the sidecar has its own sentence. First restart immediate. A Never Pod
         `whose containers set no policy of their own` never restarts. `long-running apps`, not
         `services`. The 5 minute cap is `by default` (KubeletCrashLoopBackOffMax). Backoff per
         container, not `shared`.
```
