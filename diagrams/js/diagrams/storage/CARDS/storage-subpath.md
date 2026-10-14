## storage-subpath

### layout

```
WHAT     A subPath mount resolves to one file inside the volume when the container starts and is
         bind-mounted there, so the ..data flip that updates the volume never reaches it until the
         container restarts.
DEVIATES STO.L-05: a 1000 by 250 Pod along the bottom holds the volume row and two 232 by 80
         containers. The row entries are 48 tall and ..data 140 wide, not actors.
CONTENT  Sources: Volumes, ConfigMaps, Projected Volumes (v1.36), kubelet subpath_linux.go.
         "Resolves that path when the container starts", not "once": a restart rebinds a new file.
         "Sees v2 once its container restarts", not "never picks up an update".
         `deleted, bind holds it`: AtomicWriter removes the old directory after the rename.
         The directory labels are full AtomicWriter names, ..<UTC time to the second>.<MkdirTemp
         suffix>, the same two as storage-configmap-secret-mount.
         Step 5 names all four sources: each page states the no-update rule for its own.
```
