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
CONTENT  Sources (1.36): Resource Management, Pod QoS, Node-pressure Eviction, Pods, Pod Lifecycle,
         kubelet `singleProcessOOMKill`, kernel cgroup-v2, `qos/policy.go`, `oom_kill.c`. Score floor 3
         in code (eviction page: 2), `applied`, not `by memory request`. memory.oom.group SET at start,
         cgroup v2 `by default`. `not inside one cgroup` ruled out: a memcg OOM ranks by score, the
         group kill moots it. `every byte` ruled out: the kernel tracks listed types. `near 0`, not 0.
         Only sandbox namespaces outlive a restart. lastState: workloads-container-restarts-laststate.
```
