## storage-filesystem-vs-block

### layout

```
WHAT     Two claims one field apart and what the Node puts between each disk and its container:
         Filesystem adds mkfs and a staging mount, Block adds nothing and the raw device arrives.
DEVIATES STO.L-01: two rows through one Node frame, because a stack shows an absent layer only as
         an empty tier, and a row shows it as distance the ball crosses.
         NET.L-01: the stations are 160 by 80, two of them and the Pod sharing the 860 of a Node
         frame that starts under the panel. At 232 the entry run drops under 20.
         L-13: the chip row runs along the top of the frame it reports on. Centred, its left end
         lies over the disk corridor and under the panel.
CONTENT  Sources: Persistent Volumes (Volume Mode, Binding Block Volumes) (v1.36), kubelet csi_attacher,
         csi_block and the PV and PVC update validation (v1.36.5), CSI spec, external-provisioner v6.3.0.
         The Pod carries no volumeMode, the disk captions do. `have something to act on`, never `all work here`.
         `no mkfs and no filesystem mount`, never the CSI RPCs: kubelet still calls both, fsGroup nil.
         Staging is a driver capability: without it kubelet skips NodeStageVolume, said in mount.
         `the fsType set on the volume or else the driver default`: an empty fsType is the driver's.
```
