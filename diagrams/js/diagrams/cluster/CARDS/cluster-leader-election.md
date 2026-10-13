## cluster-leader-election

### layout

```
WHAT     Three replicas racing for one Lease, and the renewals and failover that follow.
DEVIATES L-13: the band centres on 360, 40 low. `REP_Y` is the panel bottom plus 15, and every
         narration holds four lines. A fifth line puts the panel into the replica row.
         C-14: the Lease is drawn at idle before it exists. The poster takes that step, and the
         create is said in words.
         P-09a: `holderChip` lights on `expire` while it does not change. The holder still naming a
         gone replica, beside `renewTime unchanged for > 15s`, is the step's whole statement.
         Wire slots carry the status code on `acquire` and `failover` and the call name on `renew`:
         on a renewal no code is news. The reason word tells AlreadyExists from Conflict.
CONTENT  Sources (v1.36): Leases, Lease v1, Coordinated Leader Election, kcm flags, API conventions,
         client-go leaderelection v1.36.0. CREATE (201, `409 AlreadyExists`) first, CAS PUT (200,
         `409 Conflict`) on failover. Standbys only GET, every 2s to 4.4s (jitter 1.2): code wins
         over "watch or periodically read". Expiry runs on the standby clock from the last change it
         saw (`observedTime`): "renewTime age" and "within a lease duration" are ruled out. Renew
         deadline 10s. `holderIdentity` has no marker. Coordinated election, lock release not drawn.
```
