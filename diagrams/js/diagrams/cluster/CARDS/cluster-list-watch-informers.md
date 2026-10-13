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
CONTENT  Sources (v1.36): API Concepts, Kubernetes API, KEP 3157, client-go `known_features.go`,
         `reflector.go`, `controller.go` at release-1.36. The rv=0 LIST comes from the watch cache,
         `no quorum read` is said of that path only. WatchListClient is still on by default, so the
         coda keeps list-then-watch the fallback, not the only path. Informers run RealFIFO: they
         queue the event in order, never "enqueue the object key". A 410 relist keeps the rv, never
         `reset`. Other watch errors relist too: no "only". The rv ladder needs 1.35+ orderability.
```
