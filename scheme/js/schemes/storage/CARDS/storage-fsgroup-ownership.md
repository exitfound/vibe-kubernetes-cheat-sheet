## storage-fsgroup-ownership

### layout

```
WHAT     A volume mounts owned by root, so a non-root container cannot write. fsGroup makes Kubelet
         chown and setgid the tree to that GID before start, and fsGroupChangePolicy decides whether
         it walks the whole tree every start (Always) or checks only the top directory.
DEVIATES NET.L-01: the Pod is 232 by 130, holding two peer inner boxes (app, securityContext).
         STO.L-03: CHIP_W 300, the worst pair `fsGroupChangePolicy Always (default)` needs 265.
         STO.L-03: the three listing rows are P.chip at 24, not 34. At 34 the centred stack runs to
         3 units off each canvas edge. The volume tree is a listing sized by its rows.
         STO.S-01: no opacity field, since no step changes an element's opacity.
         M-12: the walk rides WALK_SPEED on a linear F.segment, not routeDur. A walk is work, and
         both sweeps share one speed, so OnRootMismatch reads as a walk that stops after one entry.
         The write lane enters the tree from the right on its own bypass, never through Kubelet.
         The fsgroup step carries no tag: any tag repeats the securityContext sublabel it leaves.
CONTENT  Sources: Configure a Security Context (v1.35), kubernetes-csi Support for fsGroup.
         OnRootMismatch checks ownership AND permission bits of the root directory.
         A CSI driver with VOLUME_MOUNT_GROUP applies fsGroup itself, so the chown narration, desc
         and aria-label scope the mechanism. The Kubelet sublabel stays unqualified.
         Not every volume is chowned: by default a CSI volume only if ReadWriteOnce with an fsType.
         `done once per mount`, not `once at mount time`. `makes it group writable` is required.
```
