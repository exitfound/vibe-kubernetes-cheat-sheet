## cluster-static-pods

### layout

```
WHAT     A file on disk against its API shadow: the Kubelet runs the static Pod, the mirror Pod is
         only a record, and deleting the record changes nothing.
DEVIATES A-13: every lane, the API to mirror relation included, stays at full on every step, idle
         too, against fainter ends. An absent end says so in its sublabel.
         M-21: DISSOLVE is 1200, not FADE.out 700. At 700 a Pod is gone before its own pulse
         ends, and the deletion reads as a cut.
CONTENT  Sources (v1.36): Static Pods, Create static Pods, kubeadm HA topology, and kubelet.go,
         config/common.go, kubectl drain filters.go at v1.36.0. ETCD is a static Pod only `in the
         default stacked topology` (T-19). The mirror returns on the next sync loop pass, never a
         scan. Step 3 says `creates` without `tries to`: hedge only with the refusal drawn. The
         mirror is `static-web-Node-1`. An edited file gets a new UID: the Pod is `replaced`, never
         "restarts the container". The edit is `picked up`, never `on its next scan`: on Linux
         inotify sees it well before the 20s rescan (config/file_linux.go). The mirror is replaced
         only after the old Pod stops (pod_workers.go allowStaticPodStart, tryReconcileMirrorPods).
         The desc says `except dot files`. The drain gives the mechanism. No `other API objects such
         as` the three.
```
