## storage-emptydir

### layout

```
WHAT     One emptyDir across three lifetime boundaries: created empty when Pod web-a lands on
         Node-1, shared by both containers, kept across an app restart, deleted with the eviction
         from the cordoned Node-1, which carries a `SchedulingDisabled` tag from then on, and new
         and empty for the replacement web-b on Node-2.
DEVIATES STO.L-05: Pods are 480 by 104, two 192 by 44 containers side by side.
         A-23: the write and read pair enters the two side faces of the 176 wide cylinder, so it
         stands 224 apart. At 24 apart the lanes would run down through the cylinder.
CONTENT  Sources: Volumes, Resource Management for Pods and Containers (release-1.36), kubectl
         drain and kubelet SyncPod, calculateEmptyDirMemorySize (v1.36.5). Memory pages count
         against "the container that wrote them". DOC-VS-CODE: Volumes scopes sizeLimit to the
         default medium, code caps a tmpfs at min(sizeLimit, Pod memory limit, node allocatable).
         Default medium is Node storage, never "the Node-1 disk". Cordon is "marked unschedulable".
         "A claim-backed volume would be found again" is ruled out: an ephemeral claim dies too.
```
