## cluster-pod-cgroup-hierarchy

### layout

```
WHAT     The cgroup v2 tree one Node carries, from /sys/fs/cgroup through kubepods.slice, the QoS
         slices and one Pod slice, to the container leaf where cpu.max and memory.max are written.
DEVIATES A-09: the qos and Pod-slice balls ride the tree edges, not lanes out of the Kubelet. The
         Kubelet is lit as the actor, and three hops back to it re-narrate steps 2 and 3.
         No Node frame around the tree: it has to start below the panel and would enclose three
         tiers of five.
CONTENT  Sources: About cgroup v2, Reserve Compute Resources, Pod QoS Classes, the Memory QoS blog,
         kubelet `qos_container_manager_linux.go` at release-1.35, the kernel cgroup v2 doc.
         enforceNodeAllocatable enforces by evicting, never a cap on kubepods.slice. The blog stays
         for the slice paths it prints, and the card takes only what the 1.35 source also builds.
         The spec is cluster-cpu-throttling's, 250m against 500m, so the weight `35` matches and the
         Pod is Burstable: equal requests and limits contradict the drawn path. memory.max is bytes.
```
