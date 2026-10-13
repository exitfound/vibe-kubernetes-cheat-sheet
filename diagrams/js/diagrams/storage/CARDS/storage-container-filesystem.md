## storage-container-filesystem

### layout

```
WHAT     A container's root filesystem is one overlay mount: a read takes the highest layer holding
         the path, every change lands in the per-container upperdir, the upperdir is deleted when
         the container is removed, and a volume mounted over the merged tree skips it. No container
         is drawn: the merged row IS the container, since no Kubernetes object acts in any beat.
DEVIATES NET.L-01: grid cells are 126 wide so four columns fit beside a 208 row header sized by its
         widest string, between the panel wall at 420 and 1180.
         STO.L-02: the volume label sits at h/2 + 12, level with the shaft entering its side face.
CONTENT  Sources (v1.36): kernel Overlay Filesystem, containerd 2.3 LTS overlay snapshotter and CRI
         RemoveContainer, Volumes, Garbage collection. Name containerd: overlayfs is its Linux default.
         "A file lookup takes the highest layer holding the path": a directory merges every layer, and
         a copied-up file beats the image. "Every change to that mount": other mounts skip the upperdir.
         No whiteout on-disk form. An upper-only file copies nothing up. The upperdir goes when the old
         container is removed (container GC, after the replacement starts), not when it exits.
```
