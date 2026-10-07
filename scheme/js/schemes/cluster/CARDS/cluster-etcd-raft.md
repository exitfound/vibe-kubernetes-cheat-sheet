## cluster-etcd-raft

### layout

```
WHAT     One write through Raft: proposal to the Leader, replication to the Followers, quorum,
         apply, and what happens when the majority is gone.
DEVIATES L-12: the two arcs are concentric, not mirrored. Mirrored, the ack lane crosses the
         outbound lane above ETCD-3, so ETCD-3 sends and receives with the same hand as ETCD-1.
         The margin is 40, not CLU.M 60: it buys the proposal label its gap without narrowing the
         API off 232, and the bbox stays centred on 600.
CONTENT  Sources: Raft, the Raft paper, etcd API guarantees, Operating etcd clusters for Kubernetes,
         etcd `bootstrap.go` and `rpctypes/error.go`.
         The acks chip counts and the quorum chip judges: the Leader plus one Follower is the
         majority. On quorum loss the Leader steps down, writes fail with `etcdserver: request timed
         out`, and only serializable reads are served. The API is the only client by policy. `the
         Leader counts as one`, never "a majority also".
```
