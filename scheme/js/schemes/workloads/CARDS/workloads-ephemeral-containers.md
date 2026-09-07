## workloads-ephemeral-containers

### layout

```
WHAT     A running Pod has two ordinary doors closed on it, exec by the image and the spec by the
         update rules, so a third list with a subresource of its own lets one more container in, and
         what comes through it is a guest in the PID namespace of the container it targets, with
         none of the guarantees a real container has.
LAYOUT   Fan to N over a Node floor, with a nested namespace region inside the Pod. Not the
         ladder-and-chip-column default of this section: the subject is WHICH of three write paths
         reaches a running Pod, and a ladder of stages says a sequence where the card says a choice.
         Three DOOR boxes stack on CX (460..740, 52 tall on a 12 gap, so 40..220), kubectl sits to
         their right (848..1080, 90..170, centred on the middle door) and the write that goes
         through descends one straight spine from the bottom door (WL.L-07). The actor row is
         reversed for the reason workloads-pod-resize reverses it. The content span is 120..1080,
         not WL.L..WL.R (WL.L-02): the widest chip pair needs 269 of a column, so at the full 1080
         the frame and both columns stood a quarter empty on each flank, and at 840 they read
         cramped. kubectl is flush with SPAN_R, so its right face, the state column and the frame
         share one edge, and the columns keep the 540 / 660 inner edges so the spine corridor is
         untouched.
           captions  x 120 and x 660, baseline 276, one per column
           contract  120..540, 4 chips of 34 on an 8 gap, 284..444
           state     660..1080, the same four rows
           node      120..1080, 460..624, so 164 tall against the 128 the section runs:
                     the Pod holds a region with its own caption and two boxes in it
           pod       190..1010 x 482..612, region 212..988 x 508..600, boxes 230..590 and
                     610..970 at 530..582
         The Pod is 820 wide rather than the 500 of its neighbours because the CENTRE bbox (L-13) is
         doors, kubectl and Pod: at 700 the union is 250..1080 and the centre sits 665, at 820 it is
         190..1080 and the centre sits 635, inside the 40 unit band.
         The census signature is box4 pod1 node1 chip8 cyl0 chain0 raw0, shared by no card in the
         section, and the two levers no sibling carries are the fan (three drawn doors, one taken
         per step) and the boundary drawn inside the Pod.
PANEL    x<=397 catalog-wide (`L-02`). Bottom per viewport:
         `OVERLAY_IDS=workloads-ephemeral-containers node --test report/overlay.test.mjs`. Deepest
         on steps 2 and 3 at 1100x800, the longest narrations at 358 characters each, and the swing
         across the viewport set is 77.22 units. It pins BAND_Y: the caption ink runs 265..279.7 at
         the deepest reading, so 276 as a baseline leaves 10.3 units over the panel. A narration
         longer than step 3 spends that clearance (`L-08`): at 386 characters step 3 wraps one more
         line and the panel bottom lands under the caption, which is why the static Pod refusal is a
         CONTENT entry and not a clause.
SIZES    Doors 280 wide, not the 232 of the kubectl box: pods/ephemeralcontainers as a LABEL
         measures 159.5 at 1100x800 and its longest sublabel, containers cannot be added, 159.5, and
         both want air inside the box rather than fitting it. The fan corridor between the doors and
         kubectl is 108, so a tap is 54 long.
         Container boxes 360 x 52 with 18 of pad on both flanks of the region and 20 between them,
         so the pair reads as one list inside one boundary rather than as a box with a satellite.
         The region caption measures 325.2 inside a 776 wide region.
         The widest chip name is status.ephemeralContainerStatuses at 202.5, the widest value 61.3,
         inside 420 wide chips. The kubectl sublabel debug -it --image … --target app measures 196.3
         inside the 232 box, 17.8 of wall on each side, the tightest string on the card: --image
         stays because kubectl debug refuses the command without it, and the image name is elided
         because a real one does not fit the box.
LANES    Six drawn, none with a partner: nothing ever answers on this card, so there is no WL.A-01
         pair and a closed door says its verdict in its sublabel rather than sending anything back
         (A-06). The trunk (kubectl left face to the bus at 794) and the bus (794, 66..194) carry
         every fan ball and drop their marker, one tap per door carries the head. LANE(i) is the
         whole run from the kubectl face to the door face, from the same numbers as the three drawn
         pieces (WL.S-01). SPINE runs from the bottom door bottom face midpoint at 220 to the Node
         FRAME face midpoint at 460 (WL.A-03), never to the Pod top at 482, and it is drawn downward
         only. The trunk and the bus CARRY every fan ball, so they are route wires and not
         relations, and a lane always takes the arrowhead pathArrow attaches. The marker comes off
         here because one head per run belongs on the tap that reaches the door, and a head at the
         bus corner would point at nothing. Three doors and one source, drawn as the fan
         workloads-pod-qos-classes draws its Node fan, in the other direction: every door has its
         own drawn tap even though a step knocks at one, so the reader sees the choice made among
         drawn alternatives (A-04). The run is one ball from the kubectl face to the door face, and
         on the outer doors it turns on the bus. The lengths are 172 and 108, both under the 700ms
         floor, and the record has the pace reading.
MOTION   Four balls over six steps. The two outer fan runs are 172 units and the middle one 108, all
         three under the PKT_DUR_MIN floor, so routeDur clamps each to 700ms: the 108 hop runs at
         0.154 u/ms and the 172 at 0.246, which is the house reading of M-13 and
         card-review/tools/pace.mjs ranks them. The spine is 240 units, also clamped, at 0.343 u/ms.
         Step 5 is the catalog down-arrow order: the ball lands, then the region and the debug box
         fade up over FADE.in together and the Pod pulses at the same arrival, so the blink carries
         the new box already inside the boundary.
         `contract` is the one step with no ball and no Pod acting. Its beat is four contract chips
         lighting under the door that refuses them, which `M-27` asks for
         and which the CSS transition on .scheme-chip-rect carries over 300ms. The four light as a
         LIST rather than one at a time: the refusals are one statement, and lighting them in turn
         would make them four.
CONTENT  Every claim is read off a page this card cites.
           kubectl exec cannot reach a distroless image, which carries no shell and no
             debugging utilities: the Ephemeral Containers concept page, and the
             `executable file not found in $PATH` transcript on the debug page.
           A container cannot be added to a Pod once it exists: the Pod Update and Replacement
             section of the Pods concept page (kubernetes.io/docs/concepts/workloads/pods/,
             not in `sources`, see BUDGET), `Pod updates may not change fields other than
             spec.containers[*].image, spec.initContainers[*].image, ...`. That sentence is why
             step 2 says a Pod update THROUGH THAT DOOR may change nothing in the list but the
             images, and why `immutable` is rejected as the word for it: the image field in that
             list is not. The bare form without the door is rejected too: the Pod subresources
             section of the same page says the resize subresource updates
             spec.containers[*].resources, and workloads-pod-resize draws exactly that.
           spec.ephemeralContainers cannot be set by updating the Pod spec: PodSpec in Pod v1,
             `it cannot be modified by updating the pod spec. In order to add an ephemeral
             container to an existing pod, use the pod's ephemeralcontainers subresource`.
           The write goes to the ephemeralcontainers subresource, which is why kubectl edit
             cannot do it: the concept page, and the PATCH operation in Pod v1.
           debugger-8xzrl is one draw of the default name, debugger- plus a random five character
             suffix (kubectl debug.go, release-1.35), so step 3 names the rule and keeps the
             transcript name as the example.
           The kubectl sublabel carries --image because debug.go refuses the command without it
             unless --copy-to is set.
           exec is closed by the IMAGE and not by the Pod: the Share Process Namespace page opens
             the same image with shareProcessNamespace and a shell container through
             /proc/$pid/root, so step 1 and the aria-label scope the closed door to a SHELL
             exec into app: an exec of a binary the image ships still passes pods/exec, and the
             concept page says only that exec alone is difficult.
           Ports and probes are disallowed BECAUSE an ephemeral container may not have ports,
             which is the concept page reading rather than a joined-up inference.
           Resources are disallowed because it spends spare capacity already allocated to the
             Pod, and restartPolicy cannot be set: both are EphemeralContainer in Pod v1.
           Never restarted, not merely unguaranteed, and never removed once added: EphemeralContainer
             in Pod v1, `may not be removed or restarted`, which is the wording the desc and the
             aria-label carry. Step 4 states it too, as the consequence of restartPolicy being
             unsettable, because the desc reaches no dialog reader.
           Static Pods refuse the subresource: the Note on the concept page, and
             ValidatePodEphemeralContainersUpdate in validation.go forbids it on the mirror
             annotation. It lives here and not in step 3, see PANEL.
           kubectl debug sends a strategic merge PATCH to the ephemeralcontainers subresource
             (debug.go), which is the verb on the wire. The subresource exposes get, patch and put
             and no delete (Pod v1 operations), which is the API surface reading of never removed.
           Without targetContainerName the container uses the namespaces configured in the Pod
             spec (Pod v1). The drawn region is the targeted case only, and the caption names the
             field for that reason.
           The debug box sublabel is in the spec · not started on the two steps between the PATCH
             and the start: the entry exists from step 3, where spec.ephemeralContainers already
             reads 1, and the container from step 5. not in the spec yet past step 2 is rejected
             as a contradiction of the chip beside it.
           Every claim above is read against 1.35.
           targetContainerName runs it in the namespaces (IPC, PID and the rest) of the named
             container, and the runtime has to implement that: EphemeralContainer in Pod v1,
             and the --target note on the debug page.
           ps and the /proc link are carried by the Share Process Namespace page, which is why
             that page is a fourth source: neither of the two ephemeral-container pages states
             what a shared PID namespace lets you read.
         The Pod phase is NOT narrated, because this card draws no phase anywhere. What step 5
         claims about the app container is restartCount, and restartCount is the app box sublabel
         from that step on.
BUDGET   Four sources, not five. The dialog footer lists them on one line at 1100x800, and a fifth
         label wraps it to two, which shrinks the whole diagram and drops the panel bottom from
         254.66 to 294.23 in viewBox units, under the caption at 265. A fifth page is cited from
         CONTENT instead.
NAMING   Each door box is labelled with what it IS, pods/exec, Pod spec and
         pods/ephemeralcontainers, so the ball lands on the door the step actually knocks at and no
         sublabel has to turn over to say which one. The middle door is the resource itself rather
         than a path, and its label takes a capital because a block label is a heading (T-09) where
         the two subresource paths are read as paths. Its resting sublabel names the pods resource
         in words. A door states its verdict in its sublabel on the step that knocks and nothing
         else, and every step states all three sublabels, because a verdict left unsaid survives
         into the next step through prev.
         The region caption names the namespace AND the field that joins it, so the boundary reads
         as the meaning of targetContainerName rather than as a second Pod outline.
         The status chip is spelled status.ephemeralContainerStatuses, prefix included, so the four
         object chips and the narration spell every field one way.
SCOPE    workloads-container-states owns the post-mortem of a container that already died, lastState
         and restartCount and kubectl logs --previous. This card is the opposite case, a container
         that is alive and cannot be entered, and it says so once.
         workloads-init-containers-and-sidecars owns the init and sidecar slots. An ephemeral
         container is a THIRD list on the Pod and is not a sidecar, which is one line here and no
         drawing at all.
         cluster-pod-sandbox-cri owns the CRI stack. The runtime is named in step 6 because
         namespace targeting depends on it, and nothing of that architecture is drawn.
         workloads-pod-resize owns the resize subresource, which CHANGES a field of a container that
         exists. This card appends a container that never existed, to a list no other write path can
         reach.
NOTE     The contract column is dark on five of the six steps. It is a standing reference for the
         object, not a progress ladder, so it lights only on the step that is about the object
         contract, all four chips at once under the door that refuses them. Reading pace runs 8.66
         to 9.88 ms per character over the six narrated steps, under the catalog median, so no step
         of this card is in the hurried end. The median and the ranking behind that are printed by
         card-review/tools/timing.mjs and are deliberately not copied here. buildPod carries exactly
         one inner box, and this card needs two boxes and a boundary around them. All three are
         appended INSIDE the Pod group rather than beside it, because pulsePod reaches only what the
         Pod contains and step 5 blinks the Pod with the new container already in it. The wrapper
         carries no transform of its own, so the region is placed at POD_X + NS_DX and the debug box
         at POD_X + DBG_DX, absolute, and every other offset in the header is Pod-relative. The
         region goes in UNDER the app box (insertBefore) so its dashed stroke never crosses a box
         edge, and it is a group so its caption fades with it. It rests at OPACITY.notready and
         rises to 1 on the write landing. box() defaults its role to the empty string, so the kit
         binding is not inherited here and `role: 'workloads'` is written out. It equals the binding
         and is not a cross-category override: the app box that buildPod makes takes the same role
         from the Pod. The debug box is built at OPACITY.terminated rather than at 0. C-14: a block
         that does not exist yet dims and is never cut out, because cutting it leaves a block-sized
         hole, and here that hole is the whole right half of the region on five of the seven steps.
         The sublabel says which of the three it is: `not in the spec yet` before the PATCH, `in the
         spec · not started` between the PATCH and the start, and `ephemeral container` once it
         runs.
WHY NOT  The Pod carries no sublabel. pod() prints one at h - 8, which at POD_H 130 is 604 and inks
         across the region floor at 600. A strike through the disallowed field names is rejected. A
         drawn string is a fixed PIXEL size, so its width in viewBox units grows about 36 percent
         between 1600x1000 and 1100x800, and a strike length computed off the character count is
         wrong on two viewports out of three. The chip value carries the refusal in a word instead.
         Answer lanes for the two refusals are rejected. A refusal from pods/exec is the container
         failing to start sh and a refusal from pods is a validation error, and drawing both as
         balls coming home puts two hops of about 800ms each on steps whose beat is a door staying
         shut. The verdict is the door's own sublabel.
DO NOT   Give the two container boxes different roles. They are peers of one Pod and a violet box
         beside a blue one reads as a category difference the palette does not mean. Light the
         region at step entry on the start step. The boundary and the box inside it come up on the
         ball landing, and a boundary already bright before the write arrives says the container was
         in the namespace before it existed.
NOT A DEFECT
         Steps 4 and 6 stand completely still for their whole duration, which puts them at the
         still end of the catalog. Both are packet-less and Pod-less by construction (M-27), and
         both sit under the catalog median on reading pace, so the hold is buying reading time
         rather than standing empty. card-review/tools/deadair.mjs prints both rankings. The region
         rect is a naked dashed rect with no data-role and no painted class, so probePaint never
         walks it and the geometry probe never scores it as a block, which is what a boundary drawn
         AROUND two blocks wants: scored as a block it would be crossed by nothing and centred on
         nothing, and counted as a body it would be a third box.
```
