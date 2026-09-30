## storage-image-volume

### layout

```
WHAT     An image volume puts a second OCI image from the same registry, model weights llm:v1 beside
         the small app image app:v3, into the Pod as one read-only directory: Kubelet resolves it at
         Pod startup by its pullPolicy, it is pulled like a container image, and no container starts
         until it has resolved.
LAYOUT   Two places and one object moving between them, drawn as TWO node() frames: the Registry
         left of x 332 and CENTRED on the Node, holding app:v3 over llm:v1, and the Node right of
         x 440, holding Kubelet over the container runtime in the left column and the Pod over the
         image volume in the right one. The pull is traffic between the two PLACES and touches no
         inner block at either end: it runs face midpoint to face midpoint on the midline the two
         frames share, `FRAME_MID` 365, 332 to 440. WHICH image leaves is said by the lit llm:v1
         block and by the tag its ball carries, and by nothing drawn: a relation zigzag from that
         block up the 20-unit corridor to the contour was drawn and removed, because a second
         dashed line 10 units inside the frame face reads as a doubled frame edge. The subject
         wants the second frame because pullPolicy is a question of WHERE the object already is,
         the registry or the host, and because the model standing in the registry as its own image
         beside the app image is the not-baked-in sentence without a word. No sibling in the
         section carries two frames (the `frames` lever), and the volume is a box, not a cylinder:
         it is an image mounted read-only, and a disk would draw the wrong thing. app:v3 is on the
         Node from the poster on (store sublabel `on disk: app:v3`), so the pull lane is ridden
         once, by llm:v1 alone.
         ONE PADDING, 24, holds inside EACH frame and `PAD` is the constant: each stands 24 above
         its bottom row and puts its top row 24 under the band its node() label occupies. The
         Registry does NOT share the Node floor: `REG_Y` is derived from `FRAME_MID` so the two
         frames share a midline instead, and each frame derives its own rows, the Node from
         `NODE_Y` and the Registry from `REG_Y`, so neither moves the other. The two frames sit 60
         off each canvas edge, so the ink spans 60..1140 and centres on 600 with the chip strip.
         Inside the Node the two columns are 42 off each frame face at 482 and 866, so their
         centres straddle the frame centre evenly.
PANEL    Measured bottom lo..hi per viewport: 125.11..142.56 at 1600x1000, 150.17..171.42 at
         1280x860, 155.28..204.97 at 1100x800, the deepest reading on the `read` step, which at the
         two wider viewports ties with `mount`:
         `OVERLAY_IDS=storage-image-volume node --test report/overlay.test.mjs` from `scheme/test/`.
         The Registry frame top is 238 and its label runs 245..259.7 at 1100x800, so the frame top
         stands 33 below the deepest reading and the label 40. That clearance is what the centring
         spends: the frame used to sit 121 below it. Everything above it starts at x>=440 (the Node
         frame).
SIZES    Every block is the catalog 232 by 80, the Pod 232 by 104 with a 192 by 44 app box. The
         widest sublabel, `OCI image, model weights`, measures 147.2 at 1100x800, as does
         `image volume, unresolved`. Three chips at the STO default 232 / 16: the tightest pair,
         `llm:v1 on Node` plus `not present`, leaves 54.6 between name and value at 1100x800. The
         mount caption `/models, read-only` ends at 1108.4, 31.6 inside the Node frame.
LANES    Five one-way lanes, each ridden by exactly one ball on exactly one step and pinned at 1 on
         every step: Kubelet down to the runtime, the Registry frame across to the Node frame, the
         runtime across to the volume, Kubelet across to the Pod, the volume up to the Pod. Nothing
         else is drawn between blocks: no relation, no identity spine. The mount caption is
         stated from the mount step on, so prev and reset show it, and on play it is blanked until
         the mount ball lands, with the volume sublabel and the /models chip.
MOTION   ONE BEAT FOR EVERY BALL and no explicit `dur` anywhere, the storage-emptydir grammar: all
         five ride routeDur, and the five leg lengths (152, 108, 170, 176, 188) are all under the
         315 routeDur needs, so every one lands on the 700ms PKT_DUR_MIN floor (M-13). The pull is
         the shortest at 108, the gap between the two frame faces, and four other cards run a ball
         that length (`pace.mjs`), so it is the house reading and not this card on its own. That is why
         the card is NOT in the `render/motion.test.mjs` PACING registry, where it stood at speed 5
         while its legs rode a LEG_DUR of 1500. The two
         vertical legs carry their tag beside the lane, because centred on the ball the dashes run
         through the text, and TRAILING the ball on the side away from the block it heads for, so it
         lands in the gap: dx 52 and 14 above on the Kubelet leg, dx -40 and 20 below on the read
         leg. Trailing, each would start inside the block its ball leaves, so it emerges 170 into
         the leg, once clear of that face: the 360 of 1500 this card measured, carried across to the
         700ms flight at the same fraction. The three level legs carry theirs 48 above the ball (dy
         -48), over the box tops at both ends, and 56 above it on the start leg (dy -56), where the
         Pod top stands 52 over the lane. So every tag lives exactly as long as its ball (M-30a), 43
         to 60 units off it. The pull tag takes the storage-emptydir grammar rather than the
         trailing one: no `emergeMode`, a small two-axis offset instead, so it fades in 200 BEFORE
         the ball leaves and dies with it. Its leg has no box top at either end, only frame faces,
         so the only thing to clear is app:v3 at departure, which `dx` 16 does: probed every 50ms at
         1100x800, where a drawn string is widest in viewBox units, the box is 36.8 wide and comes
         no closer than 17.6 to app:v3, at first paint, and 19.2 to Kubelet at the landing.
         The two VERTICAL legs CANNOT take that grammar and keep their tag near the ball, which
         is why they alone still emerge. Each runs down the centre line of two stacked 232-wide
         blocks, so a constant offset has to clear the column either sideways or lengthways, and
         both are measured: `resolve llm:v1` inks 85.9, so its box clears x 482..714 only at
         `dx` >= 159, and `weights` inks 42.9, so it clears x 866..1098 only at `dx` <= -137.5, each
         a tag standing further from its ball than the leg is long. Lengthways is a contradiction:
         clearing the block it leaves needs the tag BELOW the ball, clearing the block it enters
         needs it ABOVE. storage-emptydir escapes this because its vertical run sits 112 off the Pod
         centre as a mirrored pair (L-12) while the cylinder under it is only 176 wide, so the
         corridor beside the lane is empty; here the two blocks are the same width. Probed over time
         at the three viewports, no tag box meets a block while above 0.05 opacity. Every ball
         leaves a lit sender on BEAT.lead: Kubelet on resolve and start, llm:v1 on pull (the frame
         takes no cue, so the BLOCK lights), the runtime on mount, the volume on read. Every value a
         step earns turns over as its ball lands (P-03): the runtime sublabel and `llm:v1 on Node`
         on pull, the volume sublabel, `/models` and the caption on mount, Running and `app
         container` on start, where the Pod blinks. On start and on read the Pod pulse IS the
         arrival cue and it is the only one: pulsePod brightens every rect inside the shell, the app
         box included, so neither route carries a `lights`. Each chip lights at entry on its old value
         (P-06), the storage-pvc-binding shape, which report:arrival R2-ENTRY lists 3 times here
         as its documented frozen-sampling artefact. R2-STEP is 0. Live spans against durations, which follow from the one beat: 2060 / 3000 on the
         three one-hop steps and 2400 / 3400 and 2400 / 3600 on the two that also blink the Pod.
CONTENT  Read against the raw kubernetes/website source for volumes.md (`### image`),
         image-volumes.md and the ImageVolume feature-gate file (main and release-1.36 identical),
         which gives stable and enabled by default from 1.36: hence k8sVersion 1.36, the one
         storage card not on 1.35. Where the page is silent or contradicts itself, KEP 4639 and
         kubelet `kuberuntime_manager.go` on release-1.36 decide. Claimed: the reference behaves
         like the container image field and uses the same pull secrets (worded `pull
         credentials`, since the catalog capitalises Secret as an API kind, and the page
         assembles them from node credentials too), the volume is resolved at Pod startup by
         pullPolicy through the runtime, the object is mounted in one directory at mountPath and read-only, the
         mountable kinds are up to the runtime but at least every type the container image field
         accepts, and a recreated Pod resolves the volume again. The mount is worded `As Kubelet
         creates the app container, the runtime mounts`, because the KEP mounts the object inside
         CreateContainer, and a bare `The runtime mounts` is rejected as crediting the runtime with a
         step it takes on Kubelet's request. A failed pull is worded `the app container, which
         mounts it, would not start`: `no container would start` is rejected because kubelet
         fails the start per container, only for containers whose volumeMounts name the image
         volume. Re-resolution is worded with the IfNotPresent qualifier (a Node already holding
         llm:v1 does not pull it again, so new weights need a new tag or pullPolicy Always): the
         page's unqualified `new remote content will become available on Pod recreation` is
         rejected because its own IfNotPresent row pulls only if the reference is not on disk.
         the two balls are TWO CRI calls and not one: the resolve ball is Kubelet asking the runtime
         whether the reference is on disk, the pull ball is PullImage. So resolve names the runtime,
         `Kubelet asks the container runtime to resolve it`, on the narration and on the aria-label
         both. `Kubelet resolves it` alone is rejected: the ball lands on a block the sentence never
         mentions, and the reader is left crediting Kubelet with a lookup the runtime answers.
         stage: the ImageVolume gate reads alpha false 1.31 to 1.32, beta false 1.33 to 1.34, beta
         true 1.35, stable true from 1.36, which is what pins k8sVersion at 1.36.
         pullPolicy: the three rows are `Always` (pulls every time, and a failed pull sets the Pod
         Failed), `Never` (local only) and the drawn `IfNotPresent`, which `pulls if the reference
         isn't already present on disk`. The Failed phase belongs to the Always row alone, so the
         card, which draws IfNotPresent, says only that the container does not start.
         NOT claimed: noexec (the page does not state it), how the runtime stores the artifact,
         and the Pod phase after a failed pull. The page says the kubelet sets the Pod Failed
         and also that failures are retried with volume backoff, while kubelet source records the
         error on the container start result (ErrImagePull, ImagePullBackOff) and retries on the
         next sync, so the card says only that the container does not start and the Pod reports
         why.
SCOPE    Image layers, the writable layer, overlayfs and copy-up belong to
         storage-container-filesystem, which this card follows: here app:v3 is only named as the
         container image, never taken apart. volumeMounts basics belong to storage-volume-model,
         subPath (supported on image volumes from 1.33) to storage-subpath, fsGroupChangePolicy
         (no effect on this volume type) to storage-fsgroup-ownership. The ImageVolumeWithDigest
         status field and the AlwaysPullImages admission controller are not on this card.
NOTE     The poster note lives in the comment above this card entry in posters.js, not in this
         record.
DO NOT   Do not put a ball on the pull lane for app:v3: it is on the Node before step 1. Do not
         draw the volume as a cylinder. Do not light a node() frame as a sender: it takes no cue.
         Do not give the pull lane an endpoint on an inner block at either end: it is traffic
         between two places, and the accent on llm:v1 is the lit block plus its tag. Do not put a
         relation back in the 20-unit Registry corridor. Do not add a `lights` on the
         app box beside the Pod pulse on start or read: the pulse already brightens it, and the
         highlight the cue leaves then stands until the step ends.
         Do not claim noexec or a Failed phase without a source that states it.
NOT A DEFECT
         report/arrival.test.mjs prints three R2-ENTRY rows, `llm:v1 on Node` on step 3, `/models`
         on step 4 and `app container` on step 5. Each is the frozen-entry artefact: the value is
         wound back in `rewind` and turned over by the cued F.set on the arrival that earns it one
         step earlier (`pull`, `mount`, `start`), so a frame frozen at t=0 first sees it a step
         late. R2-STEP reads 0. Carried in test/fixtures/carried.mjs.
```
