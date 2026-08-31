## workloads-image-pull-registry-auth

### layout

```
WHAT     Kubelet pulling an image from a registry, through imagePullPolicy and the backoff that
         follows a failure.
LAYOUT   C (bottom strip). panel bottom 304.4, tied across steps 0, 1, 2 and 4, at 1100x800.
           ladder 660..1140 starting at 176
           chips  two across, 532 wide, at y 548 and 590
           actors two boxes of 232, Kubelet 484..716 centred on CX, Registry 908..1140 on WL.R
         Chips four across is 258 wide, and "container state" runs into
         "Waiting · ContainerCreating".
         232 is the section width: workloads declares none, so the actor row takes CLU.BOX_W, and
         workloads-pod-startup-conditions and workloads-pod-qos-classes draw the identical pair.
         Left box centred on CX for the spine (WL.L-07), right box closing on WL.R where the chip
         strip ends. That leaves 192 between the faces, a length eight cards already run.
         The cloud is one hand-drawn path with its own centre at (685, 85), placed by transform at
         CLOUD_SCALE 1.05 rather than redrawn. Straddling BOTH actor boxes reads as a rendering
         fault. Measured at 1600x1000 it spans 881.6..1167.3 by 12.8..147.6, so it clears the
         Registry by 26.4 left and 27.3 right and the canvas right wall by 32.8.
         The ladder starts at 176, not 150, because the cloud reaches y 147.6.
         The two top arrows cross the cloud outline over their last 26.4 units, which is what
         reaching a box drawn INSIDE a container costs and is not a lane crossing a block: a
         container is not an obstacle, the same reading L-10 gives a Node frame.
         The Registry sublabel is the wall of this row. `OCI Distribution · out-of-cluster` inks
         202.5 at 1100x800 inside 232, so it stands 14.8 off each wall, against 24.0 on
         workloads-pod-qos-classes and 42.4 on workloads-pod-startup-conditions. Nothing in the
         suite measures a box sublabel, so a longer string here has no check to stop it.
LANES    From the Kubelet bottom midpoint down the corridor LEFT of the ladder to the Node FRAME
         face midpoint at y 396, never to the Pod inside it (WL.A-03). The frame spans WL.L..WL.R,
         so its top midpoint is WL.CX by construction and the corridor stays one straight segment.
         The corridor is 276 units, which `pace.mjs` reports as a length no sibling runs. Both
         routes on it sit on the PKT_DUR_MIN floor and glide at 0.394 against the canon PKT_SPEED,
         so moving either end changes the pace and no span until the length passes 315.
         The top pair is REQ_Y out and RESP_Y back (WL.A-01). Both ride on the pull step, so both
         are arrows and neither is a relation. Each is 192 long and sits on the PKT_DUR_MIN floor
         at 700ms, gliding at 0.274 against the canon PKT_SPEED.
WIRE LABELS
         One `req` label for all five steps, at WIRE_X = WL.CX and NOT the midX of the actor gap
         most of the category uses. Four of the five steps caption work that starts inside the
         Kubelet, and the label stands over the box doing it.
         Centred on 600 against a panel reaching x 396.55, so the string is BOUNDED at about 325
         units, which is 52 characters at 1100x800. The widest three measure 300.6 and clear the
         panel by 53.2. At 398.8 one of them cleared by 4.1 and read as touching the panel edge,
         which nothing in the suite measures (`L-19`).
MOTION   Durations 3400 / 3400 / 3400 / 3600 / 3400 against spans 0 / 0 / 1260 / 2060 / 1600.
         The cache step carries NO Pod pulse and that absence is the assertion. ImageStatus asks
         the Node about its own layer store, so the ball lands on the frame and lights the frame,
         and nothing on that step reaches the Pod or its container. Of the three steps that move,
         the Pod is the receiver on start alone: cache answers at the frame and pull at the
         Registry.
         That leaves cache with ONE drawn hop and standing 79 percent still. The hold is bought
         by 373 characters at a mid-pack reading pace rather than by slack, and closing it means
         drawing the answer back up the corridor, which needs a second lane and is a composition
         change not made here.
         Steps 1 and 2 stand 100% still, near the top of the stillness ranking `deadair.mjs`
         prints, and that is the subject rather than a slack duration: reading a field and
         resolving one imagePullSecrets list are both local to the Kubelet and nothing travels.
         The durations are
         what buy 7.8 ms per character, which `timing.mjs` puts around the catalog median. They
         are a floor rather than a preference: the narration on this card is long enough that any
         duration under about 2500 puts every step of it among the most hurried that tool ranks.
         The cloud takes no `lit`. `.scheme-cloud` carries no CSS anywhere in the tree, so a
         highlight class on it is a no-op measured at 0 changed pixels, and the Registry box
         inside it already lights on the GET landing.
CONTENT  Every claim on this card is read against the k8sVersion the catalog entry states, 1.35.
         Step 1 takes the four defaulting rules verbatim from Images, "Default image pull policy":
         a digest gives IfNotPresent, `:latest` gives Always, no tag gives Always, any other tag
         gives IfNotPresent. `which re-resolves the digest on every container start` is the same
         page on Always: the runtime "contacts the registry, resolves the image tag or name to a
         digest, and downloads any layers that are not already cached locally". `ErrImageNeverPull`
         is the kubelet reason string in `pkg/kubelet/images/types.go`. kubernetes.io states the
         behaviour ("otherwise, startup fails") and never names the reason, so the reason is
         sourced upstream and the behaviour is sourced from the docs.
         `Pull is per-container, not per-Pod` stands on two sentences of that page: the policy is
         declared per container, and "the kubelet never pulls multiple images in parallel on behalf
         of one Pod".
         Step 2 credits the ServiceAccount ADMISSION PLUGIN and not the Kubelet, and that is the
         load-bearing word. `getPullSecretsForPod` in `pkg/kubelet/kubelet_pods.go` iterates
         `pod.Spec.ImagePullSecrets` and reads nothing else, and the ServiceAccount list reaches
         that field at Pod CREATE: the ImagePullSecrets source says "Any Pods created with that
         ServiceAccount ... will get their imagePullSecrets field set to that of the service
         account", and the plugin states the condition the docs leave out, "If the pod does not
         contain any ImagePullSecrets, the ImagePullSecrets of the service account are added".
         So it is one list with two possible fillers, never two lists walked at pull time.
         `Kubelet walks two lists: Pod.spec.imagePullSecrets and the imagePullSecrets attached to
         the Pod ServiceAccount` is rejected on both counts, wrong actor and a union that does not
         happen. The ladder row `Pod + ServiceAccount` and the wire `authConfig from Pod +
         ServiceAccount imagePullSecrets` are rejected for the union reading alone: the `+` is what
         a reader takes as a merge, and `Pod spec, or its ServiceAccount` is the either/or.
         The admission clause is paid for by `with per-registry auth`, which the Secret sentence
         drops: `a docker config` still carries the antecedent `the matching entry` needs. The step
         holds at 456 characters, and the panel is the budget this card spends against: measured at
         1100x800 the panel bottom is 304.36 on this step, the same line count as steps 1 and 4.
         `kubernetes.io/dockercfg` is the second legal pull-secret type on that same page and is
         deliberately NOT named. The sentence says what a `kubernetes.io/dockerconfigjson` Secret
         holds and claims no exclusivity, so it is true without the second type, and naming it
         costs about 25 characters on the longest narration of the card. That is the one claim left
         open here.
         Step 3 is exact and the wording is forced by cri-api `api.proto`: "ImageStatus returns the
         status of the image. If the image is not present, returns a response with
         ImageStatusResponse.Image set to nil." `GetImageRef` in `kuberuntime_image.go` returns the
         empty string on that nil and `EnsureImageExists` pulls, so `ImageStatus reports no image
         and the pull goes ahead` is what the call does under a PARTIAL cache. It follows that
         ImageStatus answers about the IMAGE and never about layers, which is why the ladder row
         `which layers are already here` and the wire `CRI ImageStatus · Digest probe · 2 of 4
         cached` are both rejected: each credits the probe with the partial-cache answer the
         narration in the same step says it does not give. The `layers cached` chip carries `2 of
         4` as the state of the Node store, which is SCENARIO, and no string on the card attributes
         that number to a call.
         Step 4 takes the two requests from the OCI Distribution Spec, `GET
         /v2/<name>/manifests/<tag-or-digest>` then `GET /v2/<name>/blobs/<digest>` with "a
         response code that MUST be `200 OK`".
         The backoff numbers `10s, 20s, 40s, capped at 300s` are `imageBackOffPeriod = time.Second
         * 10` and `MaxImageBackOff = 300 * time.Second` in `pkg/kubelet/kubelet.go` on
         release-1.35, doubled by `flowcontrol.Backoff.Next` (`delay := entry.backoff * 2`, clamped
         at the max). kubernetes.io carries only the cap, "a compiled-in limit, which is 300
         seconds (5 minutes)". Image pull holds its OWN pair of constants, separate from the
         crashloop pair that `ReduceDefaultCrashLoopBackOffDecay` and `KubeletCrashLoopBackOffMax`
         move, so nothing between 1.29 and 1.35 changes them and the ladder still matches
         workloads-crashloopbackoff, which draws it as six rungs 10s 20s 40s 80s 160s 300s.
         Step 5 says CreateContainer binds the rootfs and the mounts and says nothing about
         namespaces, because cluster-pod-sandbox-cri owns them: RunPodSandbox "creates a pause
         container that holds the network, IPC, and UTS namespaces every workload container will
         share", and that card draws CreateContainer as "the runtime prepares the rootfs and the
         mounts". `CreateContainer to bind the rootfs and set up namespaces` is rejected as a
         contradiction of the sibling that draws the sandbox.
         The `container state` readings are kubelet reason strings, not prose: `ContainerCreating`
         is the `defaultWaitingState` in `pkg/kubelet/kubelet_pods.go`, and `ErrImagePull` and
         `ImagePullBackOff` are in `pkg/kubelet/images/types.go`.
         The `desc` carries none of the defects above and is verified unchanged: it attributes the
         defaulting to nobody ("which when you leave it unset defaults to") and names
         imagePullSecrets without claiming who reads them.
         `sources` carries CRI Spec because four calls on the canvas (ImageStatus, PullImage,
         CreateContainer, StartContainer) have no other citation, and the href and label are the
         pair cluster-pod-sandbox-cri and workloads-pod-resize already use (T-33).
SCOPE    The container runtime and the layer store are NAMED by three steps and drawn by neither,
         which breaks T-21 as a cession rather than by oversight. cluster-pod-sandbox-cri draws
         the runtime in full, as a `containerd · CRI gRPC server` box the Kubelet calls over CRI,
         and cluster-image-container-gc draws the image store in full, as the segmented bar its
         own sweep deletes from. Drawing either here costs the actor row its third slot, which
         WL.L-02 and WL.L-07 do not have, and would make this card a second CRI diagram.
         What stands in for them is the Node frame: the store is a property of the Node, so the
         probe lands on the frame and the frame answers.
         The backoff is named by the pull step and owned by workloads-crashloopbackoff, which
         draws the same 10s to 300s ladder as six rungs. Here it is one clause and no rung.
```

### poster

```
A registry cloud with a padlock over a four-layer stack, and two dashed pulls of DIFFERENT lengths
ending in dots of different sizes. The unequal lengths are the point: the two pulls do not fetch the
same amount, because layers already on the Node are skipped.
The layer stack ramps 1.0 down to 0.4 so it reads as depth rather than as four equal things. The
padlock is small and unlabelled: auth is a condition on the pull, not the subject.
```
