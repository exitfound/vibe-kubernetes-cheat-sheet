## cluster-node-allocatable

### layout

```
WHAT     An arithmetic, not a sequence: Capacity carved by kubeReserved, systemReserved and
         evictionHard into Allocatable, and a request that does not fit what is left.
DEVIATES L-08a: the ladder is 400 wide at 410, trimmed to its longest row, not a LAYOUT column.
         Layout C governs the chips alone.
         L-10: the Kubelet residency line runs behind the ladder on x 600. L-11 pins both ends to
         face midpoints, and the rows are repainted solid so the line shows only in the gaps.
         The three narrow bar segments carry no caption. At 56 and 28 units none can hold one, and
         the ladder names all three budgets on the same beat.
CONTENT  Sources (v1.36): Reserve Compute Resources, Node Status, Resource Management, Pod Overhead,
         Node-pressure Eviction, `fit.go`, `setters.go`, `describe.go`, `node_container_manager_linux.go`.
         Code over docs: capacity is MemTotal, hugepages leave memory Allocatable. Above Allocatable:
         daemons OR margin, `100Mi on a Linux Node`. Requests plus Pod overhead may not PASS it.
         kubeReserved "such as". evictionHard evicts below it. systemReserved SHOULD cover the kernel.
         Caps need enforceNodeAllocatable AND cgroup. `Insufficient memory`. MemoryQoS: same sums.
OPEN     CENTRE-LOW passes only while step 2's narration keeps the panel below the Scheduler top at
         1600x1000. Shortened near 450 characters, the Scheduler joins the count and fails it.
```
