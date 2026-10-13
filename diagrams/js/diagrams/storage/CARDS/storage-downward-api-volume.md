## storage-downward-api-volume

### layout

```
WHAT     A downwardAPI volume turns metadata.labels into /etc/podinfo/labels, one line per label,
         and Kubelet rewrites it when a label changes, while the zone handed in as an env var keeps
         its start value. Object rows and file lines stand level, and an env-only field is drawn
         as an empty slot under the labels file, outside its frame: no file in the volume holds it.
DEVIATES NET.L-01: rows are 196 by 44 inside 232 wide frames (object 256 tall, file 202) with an
         18 inset. At 56 the frames grow to 304 and the chip floor drops to 604, and at a 12 inset
         the get and the write read as hitting the rack row.
         T-11: `spec.nodeName: Node-1` keeps the catalog capital, or it reads as a second Node.
CONTENT  Sources (1.36): Downward API, Expose Pod Information through Files, v1.36.5 validation.go
         env and volume fieldRef sets, fieldpath.go FormatMap (keys sorted), volume_manager.go.
         "Fields such as": six env-only fields, four named. A single key goes either way. "No file
         in the volume can hold them", not "the file has no line": nodeName is no label anyway.
         Same writer as a ConfigMap, own ..data. No delay stated: a Pod update resyncs the volume.
         A subPath mount keeps the old file until its container restarts. No status.podIP row.
```
