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
         M-12: the two writes ride LEG_DUR 1200, on the PACING list, or the 132 leg sits on 700.
         M-15: a lit Pod does not also pulse. The pulse ramps from the unlit base and reads as a
         flicker, so Pod app blinks only where it is not lit.
CONTENT  Sources: Volumes (hostPath), Pod Security Standards (v1.35), kubelet hostpath plugin.
         Not "only checks the type": DirectoryOrCreate has the Kubelet make the directory.
         The container "starts with /data/app bind-mounted": the runtime binds it at start.
         The delete tag is StopContainer: RemoveContainer comes later, from garbage collection.
         "The hostPath spec limits no path", not "nothing limits": admission and PSS can.
         `counted` is the hostPath share only: the writable layer and logs still count.
```
