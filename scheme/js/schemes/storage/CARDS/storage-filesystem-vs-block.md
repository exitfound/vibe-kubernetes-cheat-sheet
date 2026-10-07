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
CONTENT  Sources: Persistent Volumes (Volume Mode, Binding Block Volumes) (v1.35), kubelet
         GenerateMapVolumeFunc, the PVC update validation.
         The Pod carries no volumeMode: it lives on the claim and the volume, as the disk captions.
         `Block skips both of those steps` names mkfs and the mount, never the CSI RPCs: kubelet
         still calls NodeStageVolume and NodePublishVolume. `the fsType set on the volume`, never
         `the fsType the StorageClass names`. `have something to act on`, never `all work here`.
```
