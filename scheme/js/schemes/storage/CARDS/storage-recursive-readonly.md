## storage-recursive-readonly

### layout

```
WHAT     A volumeMount with readOnly true makes only that one mount read-only: a tmpfs mounted
         read-write under the host directory stays writable at /data/tmpfs in the container, and
         recursiveReadOnly Enabled closes it only when five requirements hold, while IfPossible
         falls back to Disabled with the status field as the only sign on the Pod.
LAYOUT   Two zones compared, stacked: the container view of the tree (the views /data and
         /data/tmpfs under Pod rro) above the host tree (Node-1, /mnt and /mnt/tmpfs), column for
         column, one column per tree level on 470 and 790. The tree centres on 630, not 600: the
         left drop runs down x 470 through the panel band, and its tag, 30 left of it, then clears
         the panel edge (396.55 at 1100x800) by 21. The catalog Pod stands centred between the
         columns, and the view row starts at y 272, under the deepest panel floor, because /data
         starts at x 354 (L-03). Below the panel on the left, a five-row P.chain holds the Enabled
         requirements, the one lever no sibling in volume-foundations carries: the subject IS a
         conjunction, so the rows light per step as what holds (none, all five, then 1 and 2). The
         spec and status chips stand stacked beside the Pod whose fields they are, mirrored to the
         ladder about 600 (40..296 against 928..1160), so the strip, which counts the ladder rows as
         chips, centres on 600 and the blocks on 630 (L-13, L-14). Step 5 is a counterfactual Node,
         signed by a `P.wire` caption (T-35) centred on the tree at y 586, 28 under the Node frame.
PANEL    `OVERLAY_IDS=storage-recursive-readonly node --test report/overlay.test.mjs` from
         `scheme/test/` prints the reading. The deepest is 254.66 at 1100x800 on the poster, which
         previews the `mount` narration. The ladder caption sits at 318 and its rows at 330, 63
         below it, and the view row at 272, 17 below it, so a longer narration on the mount step
         reaches the views first.
SIZES    Every block is the catalog size (NET.L-01): the four tree boxes 232 by 80, the Pod 232 by
         104 around a 192 by 44 app box 26 under its label. Chips `STO.L-03`, 232 by 34, 12 apart,
         the widest pair `recursiveReadOnly` plus `IfPossible`. The ladder rows take the chip
         height, 34, with a gap of 8, so the five rows end at 532, 26 over the Node frame floor. The
         ladder is 256 wide because its caption inks 251.5 at 1100x800, and the widest row 208.6.
LANES    Five arrays, each feeding its wire and its ball. The Pod sends by its SIDE faces, a
         mirrored L with 44 units of run into the top face of each view, so no lane passes a block
         and none runs inside the Pod. The two drops toward the host tree end on the Node frame face
         at y 408 (A-21), each on the column of the host box it names. They are asymmetric on
         purpose: /data to Node-1 is a relation (`bindRel`) no ball rides on any step, /data/tmpfs
         to Node-1 is the one lane a write passes down, on every step whose write is accepted (3 and
         5): an accepted write that stopped at the view would contradict step 3. /mnt to /mnt/tmpfs
         is a relation saying where the tmpfs is mounted, both ends inside the frame.
MOTION   The Pod is the sender and blinks before every write, which leaves BEAT.afterPulse after it
         (M-18a). Every tagged write rides LEG_DUR 1500 over its 224 units, registered in the motion
         PACING list at 4. The untagged drop to the Node keeps routeDur on the 700ms floor, 56 units.
         Tags trail 14 above the ball on the side of the vertical run away from the Pod (dx -30 and
         +30), so they stop over the view roof and live exactly as long as their ball (M-30a). The
         mount step blinks the Pod and lights each mount as its sentence names it: /data with /mnt
         after the blink, /data/tmpfs with /mnt/tmpfs at 2000. On the two recreate steps the blink
         is the new Pod starting, so the chips and the ladder turn over one beat after it (`start`,
         F.set plus F.light) and the write that tests the verdict leaves one beat later. A view
         sublabel lands with its ball, the host sublabel on the drop. Spans against durations:
         2001/4200, 2860/4000, 3660/4800, 3660/5000, 4460/5600.
CONTENT  Claims read against k8sVersion 1.35: volumes.md "Read-only mounts" and "Recursive
         read-only mounts", the RecursiveReadOnlyMounts gate page (stable and locked since 1.33,
         which is why the card names no gate), KEP 3857, the VolumeMount and VolumeMountStatus
         types, and where the docs are silent, validation.go and kubelet_pods.go.
         Checks 1 and 2 hold for IfPossible too: validateMountRecursiveReadOnly forbids Enabled AND
         IfPossible unless readOnly is true and mountPropagation is None or not specified, so step
         5 lights rows 1 and 2 as holding. Step 5 says `Checks 1 and 2 hold but not all of 3 to 5`:
         `Only checks 1 and 2 hold` is rejected because it asserts that all three of 3 to 5 fail,
         while the counterfactual names any one of them, and the kubelet reads the three as the one
         runtime handler flag (runtimeHandlerSupportsRecursiveReadOnlyMounts), not row by row.
         Rows 3 to 5 stay dark as not known to hold. On steps 1 to 3 the ladder is dark because no
         check applies with the field unset (resolveRecursiveReadOnly returns false on nil), not
         because readOnly is false. Row 2 reads `None or unset` because the page says
         "mountPropagation is unset, or set to None" and step 4 leaves it unset: a bare `None` row
         beside that narration is rejected.
         The status chip reads Disabled on steps 1 to 3 with the spec field unset: the kubelet sets
         status recursiveReadOnly to Disabled on every readOnly mount it cannot resolve to Enabled,
         and VolumeMountStatus allows only Disabled or Enabled, IfPossible translated by the result.
         What fails when Enabled cannot be honoured is container creation (`the container would not
         start`): makeMounts returns an error and the container waits in CreateContainerConfigError,
         as the VolumeMount comment says "the pod will not be started and an error will be
         generated". `it would fail` is rejected as naming no failing thing, and admission is wrong:
         the API server accepts the Pod.
         `the only sign on the Pod`, never `the only sign`: the Node also reports
         status.runtimeHandlers[*].features.recursiveReadOnlyMounts, and IfPossible falling back
         raises no event.
         `A Pod cannot change its volumeMounts`: ValidatePodUpdate allows only images,
         activeDeadlineSeconds, tolerations additions and terminationGracePeriodSeconds, so
         `running` is rejected as narrower than the rule.
         The container sees the Node tmpfs at /data/tmpfs because the CRI runtime bind mounts the
         volume recursively (containerd passes `rbind`), which the page states as the effect ("will
         also have a writeable /mnt/<SUBMOUNT>"); the card narrates the effect and owes no rbind
         sentence. `bind mount` on the /data to /mnt relation holds: the mount type is bind.
         `refused as a read-only file system` is the EROFS text, and the fallback write lands in the
         host tmpfs because a Disabled mount shares that filesystem.
         The desc says `a tmpfs` as the instance and not the class: the page names tmpfs, NFS or USB
         storage, and the band has no room for all three.
SCOPE    What hostPath is and why it is dangerous is storage-hostpath, the volume model is
         storage-volume-model, subPath bind mounts storage-subpath, mount namespaces and
         propagation storage-mount-path-chain. The mountPropagation modes are named only as the one
         requirement row, never explained: storage-mount-path-chain explains them.
NOTE     The poster note lives in the comment above this card entry in posters.js, not in this record.
         The poster there is a frameless mount tree: capped leaves under readOnly, one uncapped deeper.
NOT A DEFECT
         report/arrival.test.mjs prints two R2-ENTRY rows on step 5 (`ifpossible`), both chips
         changing as CUE LANDS LATER. The Enabled is what step 4 (`enabled`) turns over once the
         recreated Pod starts and cues with an F.light there, the frozen entry of `ifpossible` reads
         its rewind Enabled, and the later cue the report finds is ifpossible turning the pair over
         again. R2-STEP reads 0. Carried in test/fixtures/carried.mjs.
```
