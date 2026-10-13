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
CONTENT  Sources (1.36): Resource Management, Pod QoS Classes, Node-pressure Eviction, Pod Lifecycle,
         kubelet `qos/policy.go`, `kuberuntime_container_linux.go`, `types.go`, kernel `oom_kill.c`.
         The oom_score_adj floor is 3 in code (eviction page: 2), `applied`, not `by memory request`.
         memory.oom.group is SET at container start, cgroup v2 `by default` (`singleProcessOOMKill`).
         `not inside one cgroup` is ruled out: a memcg OOM ranks by the score, the group kill moots it.
         `lastState.terminated` is ceded to workloads-container-restarts-laststate. `near 0`, not 0.
```
