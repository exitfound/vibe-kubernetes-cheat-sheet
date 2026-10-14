## storage-volume-binding-mode

### layout

```
WHAT     WaitForFirstConsumer: under Immediate one claim gets a disk in a zone its Pod cannot
         reach, under WaitForFirstConsumer the Scheduler picks the Node first and the disk follows.
DEVIATES STO.L-01: two zones mirrored about the centre under one class and one claim on the centre
         line, because the subject is which of two zones one claim resolves into.
         L-23: node-1 keeps the row height of its peer node-2, so its box stands 36 over its floor.
         A-13: the cross-zone reach stays full while both frames are 0.4 on imm-schedule and
         imm-fail. It is a relation whose ends are the Pod and the zone-a disk, the step subject.
CONTENT  Sources (v1.36): Storage Classes, scheduler VolumeBinding and PV controller at v1.36.5,
         external-provisioner v6.3.0. `did not match the PersistentVolume node affinity`, never
         `volume node affinity conflict`. `stays Pending until a zone-a Node has room`, never
         `forever`. The External-provisioner, not the class, calls. volumeBindingMode is immutable:
         `a new class`. `a common multi-zone failure`, never `the most common`. PreBind waits
         bindTimeoutSeconds, 600. DOC-VS-CODE: page says WFFC waits for the Pod to be created, code
         waits for selected-node.
```
