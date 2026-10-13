## storage-configmap-secret-mount

### layout

```
WHAT     A ConfigMap or Secret volume is a folder of symlinks, and an update is one pointer move:
         Kubelet writes the next version into its own timestamped directory, renames ..data_tmp
         over ..data, then deletes the old directory, so a reader opens all of v1 or all of v2.
DEVIATES NET.L-01: the listing rows are 232 by 56, entries of one directory and not actors. At 80
         the five slots push app.conf and the Pod beside it into the chips.
CONTENT  Sources: ConfigMaps, Secrets, Volumes, Windows security (v1.36), kubelet v1.36.5 code.
         "On Linux": Windows recreates ..data and writes Secrets to disk. `mode 0644` is defaultMode.
         "By default" Kubelet watches: Get and Cache are the others, an immutable object stops it.
         "Up to about 90 seconds": resync is 1m jittered by 0.5. DOC-VS-CODE: pages say up to the
         sync period, pod_workers.go waits up to 1.5 of it. Names keep the ..Y_M_D_h_m_s.<rand> shape.
         An fd already held keeps the v1 inode. subPath keeps v1 "until its container restarts".
```
