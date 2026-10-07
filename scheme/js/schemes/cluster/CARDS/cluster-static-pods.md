## cluster-static-pods

### layout

```
WHAT     A file on disk against its API shadow: the Kubelet runs the static Pod, the mirror Pod is
         only a record, and deleting the record changes nothing.
DEVIATES L-03: kubectl stands right of the API at 772..1004, so the top row reads right to left.
         The API is centred so the mirror hangs straight below it, leaving 64 units on the left.
         A-13: on the delete step the Kubelet create lane stays at full, against its fainter end.
         The recreate rides it a beat later.
         M-21: MIRROR_FADE is 1200, not FADE.out 700. At 700 the mirror is gone before its own
         pulse ends, and the deletion reads as a cut.
         The fileLane and the podLane carry balls and no wire label: 100 units hold about 14
         characters, and the two boxes each lane joins name what rides.
CONTENT  Sources: Static Pods, Create static Pods, kubeadm HA topology, kubelet `syncPod`.
         ETCD runs as a static Pod only `in the default stacked topology` (T-19). The mirror comes
         back on the next sync loop pass, never a directory scan. Step 3 says `creates` without the
         docs' `tries to`: add the hedge only with the refusal drawn. The mirror is
         `static-web-Node-1`. The drain step gives the mechanism, and the static Pod spec may not
         refer to `other API objects such as` the three it names.
```
