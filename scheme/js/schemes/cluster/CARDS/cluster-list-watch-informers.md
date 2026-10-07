## cluster-list-watch-informers

### layout

```
WHAT     How a controller sees the cluster: discovery, an initial LIST served from the API's watch
         cache, then a watch stream filling an informer and its indexer.
DEVIATES M-17: on `list` the answer chain is not gated on the ETCD round trip. Gating it draws the
         quorum read the panel denies, so the two chains leave independently.
         T-22: the `req` register names a LIST and a re-LIST on steps with no ball on the Client
         lane. That lane is the process's one outbound channel, and `list` animates the answer only.
         The Indexer is a box with an `in-memory cache` sublabel, never a cylinder: the cylinder
         means a durable store, and ETCD stands on the same card.
         FEED_LANE carries no wire label: a centred one overlaps the `req` register, both ends name
         the feed.
CONTENT  Sources: API Concepts, Kubernetes API, KEP 3157, client-go `known_features.go` and the
         apiserver cacher delegator at release-1.35.
         The initial LIST at rv=0 is served from the watch cache, and `no quorum read` is said of
         that path only. WatchListClient is on by default at 1.35, so the coda calls list-then-watch
         the guaranteed fallback, not the only path, and the desc keeps that qualifier. Client
         libraries "typically" offer the pattern (T-19). The rv ladder needs `k8sVersion` 1.35.
```
