## cluster-etcd-raft

### layout

```
WHAT     One write through Raft: proposal to the Leader, replication to the Followers, quorum,
         apply, and what happens when the majority is gone.
DEVIATES L-12: the two arcs are concentric, not mirrored. Mirrored, the ack lane crosses the
         outbound lane above ETCD-3, so ETCD-3 sends and receives with the same hand as ETCD-1.
CONTENT  Sources (v1.36, etcd 3.6.8): Raft, the Raft paper, etcd v3.6 API guarantees and FAQ,
         Operating etcd clusters for Kubernetes, etcd `server.go`, `bootstrap.go`, raft `raft.go`.
         Acks count, the quorum chip judges: Leader plus one Follower. `the Leader counts as one`,
         never "a majority also". The API is the only client by policy. "next heartbeat" is ruled
         out: a commit is sent at once in an empty AppendEntries. On quorum loss entry 10 "cannot"
         commit, the Leader steps down before `request timed out`, serializable reads may be stale.
         Forwarding alone does not stop a split view: the read waits on the Leader quorum check
         (ReadIndex). CheckQuorum runs once per election timeout, so the step-down lands `within
         two`. A Follower checks the term of its entry 8 against the one the Leader sent for it.
```
