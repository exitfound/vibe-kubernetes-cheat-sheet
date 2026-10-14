## storage-multi-attach-error

### layout

```
WHAT     An RWO volume attaches to one Node at a time: a one-replica rollout starts the new Pod on
         Node-2 while the old one still holds the volume on Node-1, the attach and detach controller
         writes no second VolumeAttachment but a Waiting for detach warning on the new Pod, and the
         new Pod hangs in ContainerCreating.
DEVIATES STO.L-05: the Pods are 148 wide (104 tall), since two 232 Pods in padded frames from LEFT_X
         400 would centre the card on 684, off the 600 the chip strip sets.
         C-14: Node-2 and the request lane are absent at rest, the event lane until the warning
         rides it.
CONTENT  Sources: v1.36.5 attachdetach reconciler.go, IsMultiAttachAllowed, csi_attacher.go,
         deployment rolling.go and recreate.go, Deployments strategy (v1.36). No doc names the
         event. reportMultiAttachError records it on each scheduled Pod: Warning,
         FailedAttachVolume. Event `Waiting for detach` from 1.36.4 and 1.35.9 (PR 138837),
         `Multi-Attach error` before. Deleting the old Pod alone is ruled out: maxScaledDown is 0,
         its ReplicaSet recreates it. Default maxUnavailable is 0 at 1 to 3 replicas. Delete is a
         mark (`marked for deletion`), and `attached: false` is the real two-beat state. Node
         failure: storage-detach-on-node-failure.
```
