## storage-container-filesystem

### layout

```
WHAT     A container's root filesystem is one overlay mount: a read takes the highest layer holding
         the path, every change lands in the per-container upperdir, the upperdir dies with the
         container, and only a volume mounted over the merged tree skips all of it. No container
         is drawn: the merged row IS the container, since no Kubernetes object acts in any beat.
DEVIATES NET.L-01: grid cells are 126 wide so four columns fit beside a 208 row header sized by its
         widest string, between the panel wall at 420 and 1180.
         STO.L-02: the volume label sits at h/2 + 12, level with the shaft entering its side face.
         M-12: every ball runs PACE 1.15 faster than its base pace, registered in the PACING list.
CONTENT  Sources: Overlay Filesystem (kernel docs), containerd CRI source, Volumes (v1.35).
         "With the default overlayfs snapshotter": overlayfs is containerd's default, not the only.
         "The highest layer holding the path", not the highest image layer: a copied-up file wins.
         The whiteout's on-disk form is not drawn or named. An upper-only file copies nothing up.
         "The old upperdir is deleted once the old container is removed", after the replacement
         starts: the dead container stays until container garbage collection.
```
