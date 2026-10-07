## storage-subpath

### layout

```
WHAT     A subPath mount resolves to one file inside the volume when the container starts and is
         bind-mounted there, so the ..data flip that updates the volume never reaches it until the
         container restarts. The volume row sits inside the Pod, which owns spec.volumes, with no
         frame of its own.
DEVIATES NET.L-01: a 1000 by 250 Pod along the bottom holds the volume row and two 232 by 80
         containers. The row entries are 48 tall, ..data 140 and the directories 164, not actors.
         M-12: the tagged balls ride LEG_DUR 1500, on the PACING list, or the 56 and 62 legs sit
         on the 700 floor.
CONTENT  Sources: Volumes, ConfigMaps, Projected Volumes (v1.35), kubelet subpath_linux.go.
         "Resolves that path when the container starts", not "once": it runs on every start.
         "Sees v2 once its container restarts", not "never picks up an update".
         After the flip the v1 box reads `deleted, bind holds it`: AtomicWriter removes the old
         directory after the rename, and only the bound file is left.
         Step 5 names all four sources: each page states the no-update rule for its own.
OPEN     The two directory names are seven minutes apart, as on storage-configmap-secret-mount,
         whose narration says "a minute or so later". Fix both cards in one edit.
```
