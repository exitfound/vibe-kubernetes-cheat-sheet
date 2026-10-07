## cluster-leader-election

### layout

```
WHAT     Three replicas racing for one Lease, and the renewals and failover that follow.
DEVIATES L-13: the band centres on 360, 40 low. `REP_Y` is the panel bottom plus 15, and every
         narration holds four lines. A fifth line puts the panel into the replica row.
         C-14: the Lease is drawn at idle before it exists. The poster takes that step, and the
         create is said in words.
         P-09a: `holderChip` lights on `expire` while it does not change. The holder still naming a
         gone replica, beside a stale `renewTime age`, is the step's whole statement.
         Wire slots carry the status code on `acquire` and `failover` and the call name on `renew`:
         on a renewal no code is news. The reason word tells AlreadyExists from Conflict.
CONTENT  Sources: Leases, Lease v1, Coordinated Leader Election, kube-controller-manager (flag
         defaults read off the kube-scheduler page), the API conventions, client-go leaderelection.
         The first acquisition is a CREATE (201 or `409 AlreadyExists`), failover a CAS PUT (200 or
         `409 Conflict`). Standbys GET the Lease every retry period, never watch it. `2s` is the
         retry period. A partitioned leader stands down at its 10s renew deadline. `holderIdentity`
         carries no marker.
```
