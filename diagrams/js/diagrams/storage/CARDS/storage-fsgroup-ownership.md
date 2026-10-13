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
         The write lane enters the tree from the right on its own bypass, never through Kubelet.
         The fsgroup step carries no tag: any tag repeats the securityContext sublabel it leaves.
CONTENT  Sources: Configure a Security Context, PodSecurityContext and CSIDriver API (v1.36),
         v1.36.5 pkg/volume/volume_linux.go and csi/csi_mounter.go. OnRootMismatch checks the root
         dir GROUP, its rw/x bits AND setgid, never the owner. Always re-chowns, it does not check.
         Default CSI policy: fsType plus ReadWriteOnce or ReadWriteOncePod, read-only mounts never.
         VOLUME_MOUNT_GROUP scopes the narration, desc and aria-label, the Kubelet sublabel stays.
         "fast no matter how many files" is ruled out: only the ownership walk is skipped.
```
