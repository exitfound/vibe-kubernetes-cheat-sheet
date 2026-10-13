## storage-where-volume-data-lives

### layout

```
WHAT     One Pod mounts five volumes, drawn as a depth map: tiers say where each volume's bytes live
         (Pod, homes on the Node, homes off it) and a ledger column says how long each one lasts.
         The writable layer is a home on the Node, since its bytes sit on the Node disk.
DEVIATES NET.L-01: the four Node homes are 120 wide, each centred on a lane of a mirrored six-lane
         grid, and the Pod is 720 by 120 because all six lanes leave its floor.
         L-13: the ledger chips stand as a column at the left, the second axis. On 600 they would
         sit under the Pod.
         STO.L-03: the ledger chips are 320 wide and 10 apart in that column, since 'API object'
         beside 'ConfigMap, PVC data kept' overflows 232.
         L-23: the frame is 424 tall, held by the ledger relation whose caption must clear the
         panel. Its content keeps the catalog padding, and it closes 12 under the disk caption.
         A-13: lanes into the ghosted Pod stay full until node-lost, where every lane fades with the
         Node. A faint lane before that reads as a rendering fault.
CONTENT  Sources: Volumes, Ephemeral Volumes, Persistent Volumes, Local Ephemeral Storage,
         ConfigMaps, Secrets, Resource Management for Pods and Containers (v1.36), no 1.36 change.
         A Memory emptyDir counts against the limit of the container that writes it, not the Pod.
         "On its storage, here its disk" holds for emptyDir and the writable layer in every layout.
         The writable layer goes when its container is removed, not at exit. A Secret is prose only.
         API server serves, ETCD stores the ConfigMap. Claim data outlives the PVC under Retain.
OPEN     CENTRE and CENTRE-LOW: the report counts neither frame nor chips, while the whole ink
         centres on 615. Moving the tiers left puts the Pod under the panel. Carried in
         fixtures/carried.mjs.
```
