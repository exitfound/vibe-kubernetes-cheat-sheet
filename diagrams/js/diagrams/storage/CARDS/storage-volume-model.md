## storage-volume-model

### layout

```
WHAT     One Pod declares a volume once under spec.volumes, three containers opt in through their
         own volumeMounts, and a lifetime row per object shows the volume outliving every container.
DEVIATES STO.L-01: the volume sits inside the Pod shell, because the subject is ownership, not
         location.
         STO.L-05: containers are 200 by 80, three peers in a 736 wide Pod shell right of the panel.
         At 232 the row needs 832 and the shell runs past the canvas edge.
         M-18a: a sending container is cued by the Pod pulse, never lit (STO.C-02), so R4 reads
         seed and app as dark senders. Carried in fixtures/carried.mjs.
CONTENT  Sources: Volumes, Init Containers, Pod Lifecycle, Pod API (v1.36), unchanged by 1.36.
         The narration names emptyDir: "created empty" and "until the Pod leaves its Node" hold
         for that type only. "Leaves its Node", not "deleting the Pod": eviction also deletes it.
         The restart "starts clean outside the volume", since app.log survives inside the mount.
         readOnly is the VolumeMount field, not recursiveReadOnly, so no container sublabel says it.
         "The usual way" containers share files: a shared process namespace is another path.
OPEN     CENTRE and CENTRE-LOW: the rule reads the ladder as a chip strip on 212 and skips the
         timeline row labels, while the whole ink centres on 600. Carried in fixtures/carried.mjs.
```
