## storage-access-modes

### layout

```
WHAT     Which Node, and which Pod, may hold the volume at once: a single-attach block disk against
         a shared filesystem, with the part that refuses named on every step.
DEVIATES NET.L-01: the three Pods are 128 by 104 around a 100 by 44 container, because three 232
         Pods with their pads overrun the 588 node row. The driver band is sized by that row.
         STO.L-04: at 900x650 the driver band's left 92 units sit behind the panel.
         The disks hold everything below it, so the band has nowhere to go.
         M-07: a refused Pod stays dim and blinks dim. A Pod that has not mounted yet stays full.
CONTENT  Sources: Persistent Volumes (Access Modes) (v1.35), the attachdetach reconciler.go, the
         csidriver manifests of csi-driver-nfs and ceph-csi, the ReadWriteOncePod GA post.
         `enforced by` names who refuses: attach controller on RWO, Kubernetes on RWOP, CSI driver
         on RWX. The mode attaches nothing. `this block disk`, never all raw block: multi-attach
         block disks exist. `used on`, never `attached to`, on `rwx-nfs`: NFS needs no attach.
OPEN     The node row's left end sits behind the panel at 1280x860 and 1100x800 (Pod app-1, the
         Node-1 label). It is the price of the row standing flush over the driver band.
         The three `mount rwx` tags cross their neighbour fan lanes, 16 apart: the fan cannot widen
         without leaving the disk top.
```
