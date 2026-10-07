## storage-configmap-secret-mount

### layout

```
WHAT     A ConfigMap or Secret volume is a folder of symlinks, and an update is one pointer move:
         Kubelet writes the next version into its own timestamped directory, renames ..data_tmp
         over ..data, then deletes the old directory, so a reader opens all of v1 or all of v2.
DEVIATES NET.L-01: the listing rows are 232 by 56, entries of one directory and not actors. At 80
         the five slots push app.conf and the Pod beside it into the chips.
         M-12: every ball rides its own length at 0.14 units per ms, on the PACING list. routeDur
         puts the 102 and 254 legs on one 700 floor, so one step moves at two speeds.
CONTENT  Sources: ConfigMaps, Secrets, Volumes, Windows security (v1.35), kubelet atomic_writer.go.
         "On Linux": Windows removes and recreates ..data, and writes Secrets to local storage.
         "By default" Kubelet watches: Get and Cache are the other detection strategies.
         "A minute or so later", not "up to a minute": the pod worker resync is jittered by 0.5.
         "Every key or only the ones the volume lists in items". `mode 0644` is defaultMode.
         The next open reads v2: an fd already held keeps the v1 inode after the delete.
OPEN     The two directory names are seven minutes apart while the narration says "a minute or so
         later". Closing it means `..2026_09_19_10_01` here and on storage-subpath at once.
```
