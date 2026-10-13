## storage-hostpath

### layout

```
WHAT     A hostPath hands a Pod a directory of the Node it lands on: the Kubelet checks the type,
         the runtime bind-mounts the path, the bytes sit outside the Pod ephemeral-storage
         accounting and outlive the Pod, and the same path on another Node is a different directory
         or none. No cylinder is drawn: the path cells are a layer of the Node, not a Pod volume.
DEVIATES NET.L-01: the three system path cells are 120 by 80, what is left of Node-1 beside the
         Pod column on one 16 gap.
         STO.L-03: the three outcome chips are 168 wide so the outcome row stays 536 wide.
         L-23: each frame top is pinned 16 under the outcome row, which must sit below the panel.
CONTENT  Sources: Volumes (hostPath), Pod Security Standards, Ephemeral storage (v1.36), hostpath plugin v1.36.5.
         Directory needs a directory (IsDir, a file fails), unset checks nothing, DirectoryOrCreate makes it.
         The runtime binds at start, the delete tag is StopContainer (RemoveContainer is GC), TearDown is a no-op.
         "The hostPath spec limits no path" (only `..` is rejected), not "nothing limits": admission and PSS can.
         "Nothing stops it" is ruled out: Node-pressure eviction can. `counted` is the hostPath share only.
         Privileged is the one PSS level that admits hostPath. FailedMount is the Kubelet event reason.
```
