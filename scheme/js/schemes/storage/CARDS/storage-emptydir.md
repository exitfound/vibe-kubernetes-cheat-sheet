## storage-emptydir

### layout

```
WHAT     One emptyDir across three lifetime boundaries: created empty when Pod web-a lands on
         Node-1, shared by both containers, kept across an app restart, deleted with the eviction,
         and new and empty for the replacement web-b on Node-2. The last step is `medium: Memory`.
DEVIATES NET.L-01: Pods are 480 by 104, two 192 by 44 containers side by side.
         A-23: the write and read pair enters the two side faces of the 176 wide cylinder, so it
         stands 224 apart. At 24 apart the lanes would run down through the cylinder.
         M-15: each app ball leaves at afterPulse + 500, since the 900 pulse masks the lit app.
         M-18a: on `replace` the app lights when its new directory lands, not at entry, because
         lit at entry it glows before the emptyDir exists.
CONTENT  Sources: Volumes, Resource Management for Pods and Containers, kubectl drain (v1.35),
         kubelet source (SyncPod, calculateEmptyDirMemorySize).
         Memory pages count against "the container that wrote them", not the Pod limit.
         The tmpfs is "capped at the 256Mi sizeLimit, or at the Pod memory limit if lower".
         The default medium is Node storage, never "the Node-1 disk". The drain names
         --delete-emptydir-data. Sharing is scoped to "every container that mounts it".
OPEN     A seventh narration line on drain, replace, memory or create puts the panel 17 units from
         the Node-1 frame top: cut prose rather than move the frame.
```
