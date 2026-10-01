## storage-volumeclaimtemplates

### layout

```
WHAT     StatefulSet volumeClaimTemplates, angled at the PVC OBJECT: how it is named, minted, bound,
         retained and mounted again by a recreated Pod.
LAYOUT   THREE HORIZONTAL ORDINAL ROWS, one per replica. The claim is the subject of the card, so it
         sits in the CENTRE of every row on the canvas spine, with its consumer Pod and its backing
         disk mirrored either side, and the three claims stack into one central column the StatefulSet
         mints straight DOWN. Every connector is a straight axis run, so no ball ever travels a bent
         corridor. Identity (Pod, claim and disk are one object under one name data-web-N) is read
         ACROSS a row rather than DOWN a column, carried by the shared name in the three block labels
         plus the row alignment.
         Each Pod is a full window like the rest of the storage cards, its shell fill knocked back so
         the inner container reads as nested inside it.
PANEL    Read with `OVERLAY_IDS=storage-volumeclaimtemplates node --test report/overlay.test.mjs`
         from `scheme/test/`. The deepest reading is 204.97 at 1100x800, shared by `mint`, `bind`,
         `rebind` and `scale` (and `idle`, which previews the mint text). `mount` alone sits one line
         shallower, at 180.12.
         ROW_CY IS SET AGAINST THAT DEEPEST READING, not against the shallower ones. At [261, 395,
         529] the row-0 Pod label `web-0` is the one thing under the panel column, and it clears
         the deepest bottom by 7.7 units. The source box spans x 460..740, clear of the x<=397 band
         at any depth.
SIZES    Each claim is the catalog actor block, 232 by 80, and each Pod 232 by 104 around a 192 by 44
         app box 26 under the Pod label (NET.L-01). The disks are cylinders and keep 150 by 76.
         The source box is 80 tall and 280 wide rather than 232: its sublabel
         `replicas: 3, volumeClaimTemplates: data` inks 239.3 after fonts.ready at 1100x800, wider
         than the catalog block itself, so the box takes it plus about 20 a side.
         With FLANK 295 the mount lane is 63 long (Pod 189..421, claim 484..716) and the bind lane
         104 (claim to the disk at 820).
         Family CHIP_W 232: worst case is `on scale-down` + `retained` at 21 characters, so
         21 * 6.89 + 24 of padding is 169 against the 232 available.
         The intermediate counter values are shorter than the final one, so the strip is unaffected:
         `1 minted` measures under `3 (1 idle)`, which is this chip's own worst case.
LANES    The mint spine relays the deterministic name into each claim in turn (data-web-0, then -1,
         then -2). The two horizontal lanes per row point INWARD toward the consumer. All nine lanes
         stand at full opacity on every step, the spine included, and a claim or Pod that is not
         created yet says so with its dim block and its `not created yet` sublabel, never with a
         faint lane.
         The one lane that ever fades is a mount lane leaving with its removed Pod (MOTION).
         THE THREE FAMILIES ARE BUILT ONCE PER ROW, as `TRUNK` / `BIND` / `MOUNT`, and the `P.lane`
         and every `F.route` over them read the SAME array (`A-02`).
         THE MINT TAG RIDES RIGHT OF THE CLAIM COLUMN, 40 past its edge and 16 below the ball. A trunk
         hop (54 units between claims) is shorter than the claim it leaves, so a tag beside the spine
         would wait and fade in INSIDE that claim, over its sublabel.
         Every tag rides the card-local `tagFn` (inMs 200, outMs 200, hold 0, `M-30a`): shown from
         the moment its ball leaves and gone as it lands. No leg carries an explicit `dur`.
MOTION   ONE ORDINAL AT A TIME ON `mint`, the controller order: the name rides the spine into claim N,
         Pod N is revealed from the placeholder shade a beat after that claim lands, and the next
         mint leaves only once the reveal ends (`after: r<N>`), which stands for OrderedReady. Claims
         land at 1500, 2900 and 4300, Pods finish appearing at 2100, 3500 and 4900. Span 4900
         against a duration of 5300. On `idle` all three Pods sit at `OPACITY.pending` under a
         `not created yet` sublabel, which turns to `mounts /data` as each one appears. From `bind`
         on they sit at FULL opacity and never dim between steps. Mounting is shown by the Pod pulse
         on the arrival of the mount ball, the whole Pod blinking as one: nothing inside a Pod is lit
         (`STO.C-02`), and the app boxes are not in `reset.keys` because no step lights them. The
         ONLY Pods that fade OUT are the ones genuinely removed, so a fade-out means a Pod left:
         web-1 goes out and back on the rebind step, web-2 fades to a ghost on scale-down.
         EVERY REMOVED POD BLINKS BEFORE IT GOES (`M-08`), on both steps: the Pod pulses at 0 and it
         and its mount lane fade from `GO` = `BEAT.afterPulse`, so the blink is spent before the
         shade moves. On `rebind` the fade is slower than the FADE tokens, with a real HOLD at the
         ghost (OUT 850, HOLD 550, IN 800), so the delete and the recreate read as two distinct
         beats. The mount lane returns exactly as the recreate finishes at REBORN + IN, 3000, which
         is when the rebind ball starts riding it. Span 5400 against a duration of 5700. The claim
         and its disk stay at full opacity throughout: not being deleted is the whole point.
         A claim that has not been minted yet is drawn dim rather than hidden. Removing it leaves a
         claim-sized hole in the row that reads as a rendering fault, and it leaves the mount arrowhead
         aimed at nothing for the whole flight.
         A GHOST GOES THROUGH `stage()`, never over it (`A-16`). `scale` passes the shade in as
         `pods: [1, 1, GONE]`, and a mount lane takes the shade of its Pod, so the lane fades with it
         (0.12 settled). The one exception is the placeholder shade: a lane into a Pod not created
         yet stays at 1, since an arrow is never dimmed to say not yet.
         EVERY STATE LINE TURNS OVER ON THE EVENT IT REPORTS, not at step entry (`P-03`, `P-04`), and
         `rewind` winds each back first so the cue waits for it. `mint`: the counter steps 1, 2, 3
         and each claim takes `Pending` on its own arrival (1500, 2900, 4300). `bind`: each claim
         turns `Bound` and the counter reads `3 bound` as the three simultaneous balls land (1500).
         `mount`: `3 in use` once the three Pods have mounted (2300). `scale`: `3 (1 idle)`,
         `kept, no Pod` and the wire `kept with its claim` once web-2 has gone (1500). The `rebind`
         wire `same name, same disk` waits for the remount ball to leave the disk (3000). The static
         fields carry the end state, so the reduced path and a mid-step cancel land on it.
         THE LIT SET IS THE ACTORS OF THE STEP: the disk that sends on `rebind` (`d1` alone), and on
         `scale` the claim and disk left behind (`v2`, `d2`), lit by an `F.light` at 1500 rather
         than at entry, because nothing has been left behind while web-2 still stands. The rows a
         step does not touch stand unlit.
         The `scale` wire beside PV web-2 is never `retained`: beside a disk that reads as the PV
         reclaimPolicy, which the StatefulSet PVC Retention card keeps apart from this policy.
CONTENT  Read against the StatefulSet and PersistentVolume concept pages at the card's k8sVersion.
         NAME: `data-web-0` is the template name joined to the Pod name. The controller builds it as
         `<template>-<set>-<ordinal>` (`getPersistentVolumeClaimName` in stateful_set_utils.go),
         and the StatefulSet basics tutorial lists `www-web-0` for template `www` and Pod `web-0`.
         STORAGECLASS: no narration names one. A class such as `gp3` is rejected: it is an AWS EBS
         volume type, the card draws no StorageClass, and the docs say "If no StorageClass is
         specified, then the default StorageClass will be used".
         ORDER: `One ordinal at a time, the StatefulSet creates the claim and then its Pod`, and
         `Under the default OrderedReady policy, web-1 waits until web-0 is Running and Ready`. The
         controller source says "Create the Pod's PVCs prior to creating the Pod"
         (stateful_pod_control.go), and the docs say "Before a scaling operation is applied to a
         Pod, all of its predecessors must be Running and Ready". The card draws exactly that on
         `mint`. `bind` and `mount` stay one phase across the three rows, and `bind` says so:
         `Drawn as one phase here, by default each ordinal binds and mounts before the next is
         created`. `Now each Pod starts` is rejected on `mount`, as it reads as all at once.
         EXCLUSIVITY: `Each replica names a different claim and a claim binds exactly one PV, so no
         two replicas share a disk`. `The bind is exclusive, so no two Pods ever land on the same
         disk` is rejected: exclusivity is claim to PV ("A PVC to PV binding is a one-to-one
         mapping"), and two Pods can mount one claim ("ReadWriteOnce access mode still can allow
         multiple pods to access ... that volume when the pods are running on the same node").
         `data-web-0 alone` on the same step is rejected for the same reason.
         RECREATE: `possibly on another Node that can reach PV web-1`. A bare `perhaps on another
         Node` is rejected: "Pods that use a PV will only be scheduled to nodes that are selected
         by the node affinity", which is what pins a zonal disk. The claim never unbinds, so the
         new Pod MOUNTS it: `rebinds`, and the tag `data-web-1 rebound`, are rejected beside a
         claim that stays Bound in the same narration. The tag is `data-web-1 again`. The wire
         `same name, same disk` stands: same Pod name, same claim name, same bound PV.
         RETENTION: the chip is `on scale-down`. `on delete` is rejected because it could name a
         Pod delete, where no policy applies ("these policies only apply when Pods are being
         removed due to the StatefulSet being deleted or scaled down"), a scale-down or a
         StatefulSet delete. The card states only the DEFAULT, "The default for policies is
         `Retain`" (StatefulSetAutoDeletePVC, stable since 1.32), and names the StatefulSet PVC
         Retention card for the whenScaled and whenDeleted knobs. `silently leaks disks` is
         rejected: a retained claim is listed by `kubectl get pvc`, and the docs say only that
         removing it "must be done manually". Scale-down takes web-2 first: the docs terminate
         Pods "in reverse order", highest ordinal first.
         DEPLOYMENT: `Deployment replicas that name a claim all share that one` in the desc.
         `a Deployment shares one` is rejected: a Deployment has no disk unless its Pod template
         names a claim, and then every replica names that same one.
         PV NAMES: the disks are labelled `PV web-N` as row names, so a row reads as one identity
         (LAYOUT), while a dynamically provisioned PV is named `pvc-<uid>`: only the CLAIM name is
         deterministic, and no narration says the PV name is.
BUDGET   The 7.7 units of label clearance under PANEL is 0.31 of a narration LINE at 1100x800, where
         one line measures 24.85 (180.12 short against 204.97 long). LENGTHENING `mint`, `bind`,
         `rebind` OR `scale` BY ONE LINE BURIES `web-0` AGAIN, and there is no further vertical
         room to buy: the next move would have to come out of the 19 units between the row-2 Pod
         and the chip strip.
NOTE     The pitch is 134 rather than 140 because row 2 is held in place: the clearance is bought at
         the top of the stack and nothing at the bottom gets tighter (the row-2 Pod ends at 581
         against the chip strip at 600). All three trunk segments (89 / 54 / 54 units) stay under the
         314 unit flat-pace band, so every mint hop floors at the 700ms `routeDur` minimum (`M-13`)
         and the row geometry does not reach the timing (`A-11`, `M-20`). The 30 units left between
         rows hold the row tag: TAG_DY puts its baseline 3 above the Pod top and it is 13 tall.
WHY NOT  One column PER ORDINAL with the mints fanned in through bent side corridors: three claims then
         sit side by side and the mint routes enter each claim from the corner. Turning each ordinal on
         its side makes the claim the centred hub of its own row, the mint a single vertical spine, and
         the mount and bind pure horizontal runs.
         Row centres at [245, 385, 525]: the row-0 Pod LABEL `web-0` spans y 198.7..214.7 there
         (`__toRoot`, x 286.6..323.4, well inside the panel's 396.55 right edge), so its top 6.3 units
         sit under the panel on both long steps.
         Moving the Pod column right instead: a Pod whose label cleared x=397 would be centred at 416
         at least, and a 232 Pod there ends at 532, inside the claim at 484..716. There is no
         horizontal escape on this card, only a vertical one.
DO NOT   Make the three lane families factories called once for the lane and again for the ball, which
         returns two equal copies of one set of numbers: 14 routes across mint, bind, mount and
         rebind, every one of them a copy that would survive any check until the day somebody moved a
         row.
         Fade a Pod up from a dim resting state on each mount: that up-and-down flicker on every step
         reads as noise.
         Spread the `stage()` factory on `scale` and then override `p2` after it: `mount2` keeps the
         value the factory computed from a live Pod, and measured at t=1500 the row-3 Pod group stands
         at 0.12 with its mount lane at 1.0, a full-strength arrow into a ghost. Nor fade `p1` alone on
         `rebind`: for the whole 550ms ghost hold the mount lane then stands at 1 over a Pod at 0.12.
```
