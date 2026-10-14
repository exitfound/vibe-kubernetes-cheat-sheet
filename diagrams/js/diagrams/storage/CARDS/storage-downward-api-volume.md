## storage-downward-api-volume

### layout

```
WHAT     A downwardAPI volume turns metadata.labels into /etc/podinfo/labels, one line per label,
         and Kubelet rewrites it when a label changes, while the zone handed in as an env var keeps
         its start value.
DEVIATES T-11: `spec.nodeName: Node-1` keeps the catalog capital, or it reads as a second Node.
CONTENT  Sources (1.36): Downward API, Expose Pod Information through Files, v1.36.5 validation.go
         env and volume fieldRef sets, fieldpath.go FormatMap (keys sorted), volume_manager.go.
         "Fields such as": six env-only fields, four named. A single key goes either way. "No file
         in the volume can hold them", not "the file has no line": nodeName is no label anyway.
         Same writer as a ConfigMap, own ..data. No delay stated: a Pod update resyncs the volume.
         A subPath mount keeps the old file until its container restarts. No status.podIP row.
```
