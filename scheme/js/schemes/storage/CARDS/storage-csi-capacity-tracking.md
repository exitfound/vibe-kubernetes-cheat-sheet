## storage-csi-capacity-tracking

### layout

```
WHAT     The Scheduler checks a claim against published free space before it picks a Node, instead
         of finding out from a failed provision. The CSI controller writes one CSIStorageCapacity
         object per StorageClass and topology segment into the API server, and the Scheduler reads
         them in its filter phase.
LAYOUT   A writer, a ledger and a reader along the bottom row, and the two Nodes they act on along
         the top. Left to right: the Scheduler, the API server frame holding the capacity objects,
         the CSI controller. The objects live in the API, so they are drawn there and not inside the
         Nodes, and the writer is drawn, so no ball leaves a pool.
         Each object is a GAUGE row, track and fill at 6 units per Gi, with the claim drawn as one
         `claim 20Gi` threshold across both rows: the filter decision is a comparison of two
         quantities against one, and a gauge says that without a sentence.
         `storage-topology-aware-provisioning`, the card beside this one, stacks two actors on the
         centre line over two Node frames. This card puts its actors UNDER the Nodes and reaches
         them through the frame floors, so the two read apart with the panel covered.
         The Nodes start at x 430 and the bottom row sits under the panel, so the Scheduler may
         start at x 60: the drawn extent is 60..1160.
PANEL    `OVERLAY_IDS=storage-csi-capacity-tracking node --test report/overlay.test.mjs` from
         `scheme/test/`. Deepest on the `success` step at 1100x800, 229.82. The first thing left of
         x 397 is the Scheduler, top at 400, so 170 units of clearance, and nothing above y 400
         starts left of x 420.
SIZES    The Scheduler and the CSI controller are 232 by 80, the two Pods 232 by 104 around a 192 by
         44 app box (NET.L-01). The Node frames are 350 wide with a 30 gap, a 27 header and a 40
         foot: the foot is there so a tag riding 14 over a ball that lands on the frame floor stays
         inside the frame, off the edge. The pools keep 168 by 84, `h/2 + 10` (`STO.L-02`). The API
         server frame is 460 by 152, centred on the bottom row's y.
         Chips `STO.L-03`, worst pair `capacity objects` 110.3 + `2 published` 75.8 = 186.1.
LANES    Six lanes, each ridden on one step. The Scheduler reaches each Node through the frame floor
         at its centre minus 12 and the controller at its centre plus 12, a mirrored pair per face
         (`L-12`). Both horizontal runs sit in the gap between the Node floors (307) and the API
         frame top (364): the Scheduler at its centre, 335.5, derived from the two edges, and the
         controller at 336. No step shows a Scheduler run and a controller run that overlap: on
         `success` the Scheduler run ends at x 973, short of the controller rise at 997.
         The write enters the API frame from the controller side and the read leaves it towards
         the Scheduler, both at the row's mid height, 440.
MOTION   Every ball rides routeDur, so the card is off the `PACING` map of `render/motion.test.mjs`.
         A chip a ball earns does not run ahead of it (`P-03`): each is wound back in `rewind` and set
         by `F.set` on that ball's arrival. A seeked frame (`frames.mjs`) shows the wound-back value
         because the turnover is an `onfinish` a paused animation never fires: `settled-dump.mjs` is
         the reading.
         The Pod appears in the Node its `selected-node` names, dim, when that ball lands, and on
         `success` goes full and pulses when CreateVolume lands (down-arrow order). The Node-1 Pod
         takes the dim pulse with an opacity lift on `blind-fail`, then fades out as `selected-node`
         turns back to `none`, pulse first (`M-08`), so the chip and the frame agree.
         On `success` a dashed relation from Pod app-0 down to the Node-2 pool (`volLink`, 16 units,
         the whole gap between them) fades in when CreateVolume lands, because the volume the Pod
         mounts exists from that arrival. Node-1 carries none: no volume is ever created there.
         On `filter` the claim line fades in at step entry, the read carries both rows to the
         Scheduler, and Node-1 with its pool and its gauge row dims on that arrival.
         The sender is lit from entry (`M-18a`): the Scheduler on `blind-pick`, the controller on
         `blind-fail` and `publish`, both on `success`. On `filter` the API frame sends and takes no
         cue, as no `node()` frame does, and the Scheduler lights only when the read lands.
WIRE LABELS
         The two riding tags leave the Scheduler and the controller from their top face, 14 above
         the ball. The corridors sit far enough under the frame floor (307) that they clear it on
         the horizontal run. The write and read hops are 61 and 68 units, too short for a tag, and
         the gauges they fill or read say what travelled.
CONTENT  Read against the release in `k8sVersion`, from the three pages in `sources`.
         One object per StorageClass AND topology segment, never per segment alone: the API
         reference says an object is "the result of one CSI GetCapacity call. For a given
         StorageClass, this describes the available capacity in a particular topology segment".
         Publishing and consuming are two switches, so `publish` credits the external-provisioner
         started with --enable-capacity and `filter` credits storageCapacity true on the CSIDriver.
         "Turn on capacity tracking with storageCapacity true on the CSIDriver" as the cause of the
         publish is rejected: the external-provisioner README says without that field it "will
         publish information, but the Kubernetes scheduler will ignore it".
         Without the objects the Scheduler judges Nodes "on CPU, memory, affinity and the rest, but
         not on free storage". "CPU and memory alone" and "CPU, memory and affinity only" are
         rejected as absolutes the scheduler does not keep (taints, ports, volume topology).
         `success` keeps the qualifier "capacity that changes after it was published can still
         force a retry", from the concept page: tracking "increases the chance that scheduling
         works on the first try, but cannot guarantee this".
         `blind-fail` keeps "can land on Node-1 again", not "does": the concept page says only
         "the node selection is then reset and the Kubernetes scheduler tries again", and
         `selected-node` reads `none` after the failure, because the external-provisioner "removes
         the selected node annotation" on ResourceExhausted.
         Checked and unchanged: the three conditions for the Scheduler to use the objects (a volume
         not yet created, a CSI class with WaitForFirstConsumer, storageCapacity true), the
         comparison as a filter before scoring, and the chip and label names.
SCOPE    Why the claim waits for a Node at all belongs to `storage-topology-aware-provisioning`, and
         what the CSI controller is to `storage-csi-architecture`.
WHY NOT  The capacity objects inside the Node frames: they are API objects, and drawn on the Node
         they read as something the Node holds.
         The actors on the centre line above the Nodes: that is `storage-topology-aware-provisioning`
         at the same size.
OPEN     `report/arrival.test.mjs` R2-ENTRY prints the turnovers as uncued at the next step's entry,
         because a frozen t=0 sample reads the `rewind` value. They are carried in
         `test/fixtures/carried.mjs`, and R2-STEP reports none.
```
