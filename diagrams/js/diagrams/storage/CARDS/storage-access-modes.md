## storage-access-modes

### layout

```
WHAT     Which Node, and which Pod, may hold the volume at once: a single-attach block disk against
         a shared filesystem, with the part that refuses named on every step, and ReadOnlyMany,
         which nothing enforces after binding.
DEVIATES NET.L-01: the three Pods are 128 by 104 around a 100 by 44 container, because three 232
         Pods with their pads overrun the 588 node row. The driver band is sized by that row.
         STO.L-04: at 900x650 the driver band's left 92 units sit behind the panel.
         The disks hold everything below it, so the band has nowhere to go.
         M-07: a refused Pod stays dim and blinks dim. A Pod that has not mounted yet stays full.
CONTENT  Sources: Persistent Volumes (Access Modes) v1.36, and at v1.36.5 IsMultiAttachAllowed, the
         attachdetach reconciler, VolumeRestrictions, operation_generator, csi-driver-nfs, ceph-csi.
         `enforced by`: attach controller on RWO, Kubernetes on RWOP (Scheduler with preemption,
         Kubelet at mount), CSI driver on RWX. "RWO limits a volume to one Node" is ruled out: no
         attach, no limit, so `this block disk`, never all raw block. NFS: `used on`, not `attached`.
         RWX block: binding first. Event `Waiting for detach` since 1.36.4 (PR 138837), was Multi-Attach.
         ROX: the Access Modes note (no write protection once mounted). `enforced by: binding only`
         and `mount rw`: the Pod sets no readOnly, Kubelet passes ROX as MULTI_NODE_READER_ONLY and
         readonly false to NodePublishVolume, csi-driver-nfs mounts `ro` only on readonly. Read-only
         comes from persistentVolumeClaim.readOnly (forces every volumeMount) or volumeMounts.readOnly.
OPEN     The node row's left end sits behind the panel at 1280x860 and 1100x800 (Pod app-1, the
         Node-1 label). It is the price of the row standing flush over the driver band.
         The middle `mount rwx` tag on PV nfs ends on the app-1 fan lane, 16 apart: the fan cannot
         widen without leaving the disk top.
```
