## storage-volume-binding-mode

### layout

```
WHAT     WaitForFirstConsumer: under Immediate one claim gets a disk in a zone its Pod cannot
         reach, under WaitForFirstConsumer the Scheduler picks the Node first and the disk follows.
DEVIATES STO.L-01: two zones mirrored about the centre under one class and one claim on the centre
         line, because the subject is which of two zones one claim resolves into.
         L-23: node-1 keeps the row height of its peer node-2, so its box stands 36 over its floor.
         A-13: the cross-zone reach stays full while its frame is 0.4. It is a relation whose ends
         are the Pod and the zone-a disk, and it is the subject of that step.
         Both frames take the 0.4 shade on the Immediate steps, because the narration rejects both.
CONTENT  Sources: Storage Classes (Volume Binding Mode, Allowed Topologies) (v1.35), the scheduler
         VolumeBinding plugin, kubernetes-csi external-provisioner and topology docs.
         `did not match the PersistentVolume node affinity`, never `volume node affinity conflict`.
         `stays Pending until a zone-a Node has room`, never `forever`. `a common multi-zone
         failure`, never `the most common`. The Scheduler records the Node on the claim and binds
         the Pod once the volume is bound. The External-provisioner, not the class, calls.
```
