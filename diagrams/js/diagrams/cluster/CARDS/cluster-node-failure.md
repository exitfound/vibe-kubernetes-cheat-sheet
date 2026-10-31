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
         S-09: step 0 is `healthy`, not `idle`. It is static and silent like every poster, and its
         id names what it draws: Node-1 Ready on a fresh Lease, the state the six steps take apart.
CONTENT  Sources (v1.36): the four cited pages, node-lifecycle, taint-eviction, lease, podgc code
         at v1.36.0. Flip PUT, taint PATCH, Lease PUT, grace 50s (the page has 40s). DELETE after a
         DisruptionTarget PATCH, bypasses PDBs, never "evicts". Status PATCHes on change or every 5
         min, either resets the probe. ReplicaSet, not Deployment, recreates. Terminating clears
         three ways (T-19). "Still holds the container" is ruled out: a panicked Node runs none.
         `3. NotReady` is kubectl's Unknown. Paths `node-1`, controller `node-lifecycle-controller`.
```
