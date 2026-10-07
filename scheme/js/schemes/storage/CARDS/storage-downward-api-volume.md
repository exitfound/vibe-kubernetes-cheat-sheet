## storage-downward-api-volume

### layout

```
WHAT     A downwardAPI volume turns metadata.labels into /etc/podinfo/labels, one line per label,
         and Kubelet rewrites it when a label changes, while the zone handed in as an env var keeps
         its start value. Object rows and file lines stand level, and the empty fourth slot is how
         an env-only field is drawn.
DEVIATES NET.L-01: rows are 196 by 44 inside 232 by 256 frames with an 18 inset. At 56 the frames
         grow to 304 and the chip floor drops to 604, and at a 12 inset the get and the write
         read as hitting the rack row.
         T-11: `spec.nodeName: Node-1` keeps the catalog capital, or it reads as a second Node.
CONTENT  Sources: Downward API, Expose Pod Information through Files (v1.35), kubelet fieldpath.go.
         "Fields such as" spec.nodeName: the page lists six env-only fields and the card draws four.
         A single label key goes either way, only the whole map is volume-only. Lines sort by key.
         "The way a ConfigMap volume is updated": each volume has its own ..data, only the writer
         is shared. "A read after the swap", not "the next read": no page states the delay.
         No status.podIP row: the Pod object Kubelet gets on `get` has no IP yet.
```
