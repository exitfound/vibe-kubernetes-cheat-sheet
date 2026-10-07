## cluster-oom-kill

### layout

```
WHAT     A container exceeding memory.max: the kernel's cgroup OOM killer, the SIGKILL, and the
         Kubelet learning about it through PLEG.
DEVIATES CLU.L-01: the frame is 156/110/34. The Pod is 4 taller than 106 for an inner sublabel that
         changes on every step.
         T-22: the one wire slot is a row caption on `allocate`, `cgroup` and `oomkill`, where no
         ball rides. Blank, it leaves the top row silent through the whole kill.
         T-21: the container runtime is named and not drawn. The card is about who kills, and the
         CRI stack is cluster-pod-sandbox-cri.
CONTENT  Sources: Resource Management, Pod QoS Classes, Node-pressure Eviction, kubelet
         `qos/policy.go` and `kuberuntime_container_linux.go`, kubectl `describe.go`.
         The oom_score_adj floor is 3, as the kubelet returns, though the eviction page prints 2.
         The value is `applied` from the QoS class, never `by memory request`. The runtime SET
         memory.oom.group at container start, and the group kill keeps its cgroup v2 condition.
         `lastState.terminated` is ceded to workloads-container-restarts-laststate. `near 0`, not 0.
```
