## cluster-node-failure

### layout

```
WHAT     A Node going unreachable: the Lease going stale, the NotReady condition, the unreachable
         taint, and the eviction timer that finally moves the Pods.
DEVIATES CLU.L-01: the frame is 134/106/16, the one exception to the top padding. Six chips wrap to
         two rows and Node-2 stands under the ladder, so at 34 the second chip row ends on 648.
         L-11: the reschedule takes the controller's bottom midpoint 600, the eviction drop steps 24
         aside. Node-2's top face sits under the ladder, so the reschedule enters its left face.
         C-07: the Node-1 frame and its lanes hold full strength until `reschedule`. Dimmed on
         `kubelet-stops`, the picture announces a state the `Ready True (Stale Lease)` chip denies.
         M-21: the Node-1 side fades over HANDOVER_MS 300, not FADE.out 700. At 700 the fade and the
         bind flight read as one beat.
         The reschedule lane crosses the heartbeat return leg: no step puts a ball on both.
CONTENT  Sources: Node Status (`#heartbeats`), Node Taints, Taint-Based Evictions, Force Delete
         StatefulSet Pods, the node-lifecycle, taint-eviction and lease controllers.
         The status flip is a PUT, the taint a PATCH, the Lease a PUT. The grace period is 50s, the
         page's 40s is stale. The DELETE bypasses PDBs, never "evicts". A Terminating entry clears
         on the Kubelet, a Node delete or a force (T-19). `3. NotReady` is kubectl's display of
         Unknown. Paths read `node-1`.
```
