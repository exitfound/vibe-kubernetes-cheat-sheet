## cluster-pod-cgroup-hierarchy

### layout

```
WHAT     The cgroup v2 tree one Node carries, from /sys/fs/cgroup through kubepods.slice, the QoS
         slices and one Pod slice, to the container leaf where cpu.max and memory.max are written.
DEVIATES A-09: the qos and Pod-slice balls ride the tree edges, not lanes out of the Kubelet. The
         Kubelet is lit as the actor, and three hops back to it re-narrate steps 2 and 3.
         No Node frame around the tree: it has to start below the panel and would enclose three
         tiers of five.
CONTENT  Sources (v1.36): About cgroup v2, Reserve Compute Resources, Pod QoS, Container Runtimes,
         Memory QoS and CPU weight blogs, runc 1.3.2, crun 1.23, kernel cgroup v2, `pkg/kubelet/cm` and
         `kube_features.go` at v1.36.0. Allocatable is enforced by evicting, kubepods memory.max is not
         it. MemoryQoS is alpha and off: no memory.min or low. Spec is cluster-cpu-throttling's. `35`
         needs runc 1.3.2 or crun 1.23 (older give 10), said in the leaf step. "cgroupDriver systemd"
         is ruled out: the runtime supplies it. The Pod slice holds summed limits too. memory.max: bytes.
```
