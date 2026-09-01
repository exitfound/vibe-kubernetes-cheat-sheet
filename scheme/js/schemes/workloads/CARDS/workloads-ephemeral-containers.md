## workloads-ephemeral-containers

### layout

```
WHAT     A Pod that is already running is handed one more container through a door of its own,
         the ephemeralcontainers subresource, and that container arrives with none of the
         guarantees a real container has.
LAYOUT   A (contract left, chips right). PANEL_B 256.
           caption  x 60, baseline 276, the standing name of the column under it
           contract 60..540, 5 rows of 28 + 4 x 8 = 172, so 284..456
           chips    660..1140, 4 x 34 + 3 x 8 = 160, so 284..444
           node     full width, NODE_H 128 on the canvas floor 624
         The left column is a FIELD TABLE, not a pipeline: its rows are the fields of one API
         object rather than stages of one story, which is why it carries a P.tag naming the
         object and why two steps light several rows at once instead of one.
         The actor row is reversed, API on CX and kubectl to its right, so the write descends
         one straight spine (WL.L-07). workloads-pod-resize makes the same trade.
PANEL    Measured over the three viewports, deepest step in brackets:
           1600x1000  x<=290.77  y 160.00..177.44
           1280x860   x<=377.76  y 192.67..213.92
           1100x800   x<=396.55  y 229.82..254.66  (step 2, the longest narration at 351)
         It pins BAND_Y: the caption ink runs 265..279.7 at 1100x800, so 276 as a baseline
         leaves 10.3 units over the deepest panel. A narration longer than step 2 spends that
         clearance (L-08), and the panel swings 77.22 units across the viewport set.
SIZES    Contract rows 28 tall on an 8 gap, not the WL.ROW_H 32 and WL.ROW_GAP 10 every
         pipeline in this category takes: five rows on the house numbers is 200 tall against
         the 192 the caption leaves between 284 and the Node frame at 496.
         The widest row measures 263.8 at 1100x800 inside a 480 wide row.
         Container boxes 210 x 52 with 24 of air on both Pod flanks and 32 between them, so
         the pair reads as one list rather than as a box with a satellite.
LANES    Two, and neither has a partner. REQ_LANE feeds both the drawn arrow and the ball on
         the top row, and nothing ever answers on this card, so there is no WL.A-01 pair.
         SPINE runs from the API bottom face midpoint to the Node FRAME face midpoint at 496
         (WL.A-03), never to the Pod top at 518, and it is drawn downward only.
MOTION   Three balls over five steps. The top-row hop is 56 units, which is under the
         PKT_DUR_MIN floor, so routeDur clamps it to 700ms and it runs at 0.080 u/ms: four
         other cards run that exact length and it is the house reading of M-13, not this card.
         The spine hop is 376 units at 836ms, which is PKT_SPEED exactly.
         Step 4 is the catalog down-arrow order: the ball lands, then the container fades in
         over FADE.in and the Pod pulses at the same arrival, so the blink carries the new box.
CONTENT  Every claim is read off a page this card cites.
           kubectl exec cannot reach a distroless image, which carries no shell and no
             debugging utilities: the Ephemeral Containers concept page, and the
             `executable file not found in $PATH` transcript on the debug page.
           A container cannot be added to a Pod once it exists, and spec.ephemeralContainers
             cannot be set by updating the Pod spec: the concept page and PodSpec in Pod v1.
           The write goes to the ephemeralcontainers subresource, which is why kubectl edit
             cannot do it: the concept page, and the PATCH operation in Pod v1.
           debugger-8xzrl is the name the debug page prints when you name nothing yourself.
           Ports and probes are disallowed BECAUSE an ephemeral container may not have ports,
             which is the concept page reading rather than a joined-up inference.
           Resources are disallowed because it spends spare capacity already allocated to the
             Pod, and restartPolicy cannot be set: both are EphemeralContainer in Pod v1.
           No restart guarantee, and never removed once added: the concept page and Pod v1.
           targetContainerName runs it in the namespaces (IPC, PID and the rest) of the named
             container, and the runtime has to implement that: EphemeralContainer in Pod v1,
             and the --target note on the debug page.
           ps and the /proc link are carried by the Share Process Namespace page, which is why
             that page is a fourth source: neither of the two ephemeral-container pages states
             what a shared PID namespace lets you read.
         The Pod phase is NOT narrated, because this card draws no phase anywhere. What step 4
         claims about the app container is restartCount, and restartCount is a drawn chip.
NAMING   The API box sublabel names the SUBRESOURCE the step is addressing, and the card
         addresses two. Step 1 is a kubectl exec, which goes to pods/exec, so the box reads
         that on step 1 and pods/ephemeralcontainers everywhere else. One sublabel for the
         whole card was a false picture and no check could see it: the ball lands on the API
         face on both of the first two steps, so a fixed pods/ephemeralcontainers drew the
         FAILING exec attempt arriving at the one door this card says exec can never reach,
         and the two steps then differed only by their wire label.
         Dropping the arrival light instead was rejected. It removes the cue and leaves the
         geometry making the same claim: the ball still ends on that face, and a lane that
         lands on nothing is a second defect bought to hide the first.
         The turnover runs idle to step 1 and back on step 2. The resting frame keeps
         pods/ephemeralcontainers because that door is what the card is about.
SCOPE    workloads-container-states owns the post-mortem of a container that already died,
         lastState and restartCount and kubectl logs --previous. This card is the opposite
         case, a container that is alive and cannot be entered, and it says so once.
         workloads-init-containers-and-sidecars owns the init and sidecar slots. An ephemeral
         container is a THIRD list on the Pod and is not a sidecar, which is one line here and
         no drawing at all.
         cluster-pod-sandbox-cri owns the CRI stack. The runtime is named in step 5 because
         namespace targeting depends on it, and nothing of that architecture is drawn.
         workloads-pod-resize owns the resize subresource, which CHANGES a field of a
         container that exists. This card appends a container that never existed, to a list
         no other write path can reach.
NOTE     The contract column is dark on three of the five steps. It is a standing reference
         for the object, not a progress ladder, so it lights only where a step is about the
         object contract: four rows on step 3 and the one allowed field on step 5.
NOTE     Reading pace runs 9.38 to 9.61 ms per character over the five narrated steps, a band
         narrower than either neighbour in this section and sitting inside both of them, so no
         step of this card is in the hurried end. The catalog ranking behind that is printed by
         card-review/tools/timing.mjs and is deliberately not copied here.
WHY NOT  The Pod carries no sublabel. pod() prints one at h - 8, whose ink runs 596.2..608.5
         at 1100x800 and crosses the bottom edge of both container boxes at 600. Both
         neighbours in this section pass an empty string for the same reason.
WHY NOT  A strike through the disallowed field names is rejected. A drawn string is a fixed
         PIXEL size, so its width in viewBox units grows about 36 percent between 1600x1000
         and 1100x800, and a strike length computed off the character count is wrong on two
         viewports out of three. The verdict column carries the refusal in words instead.
DO NOT   Give the two container boxes different roles. They are peers of one Pod and a violet
         box beside a blue one reads as a category difference the palette does not mean.
NOT A DEFECT
         The contract rows do not line up in the render, and the padding in FIELDS does not
         make them. SVG collapses a run of spaces, so every chain string in this category
         renders ragged and the padding aligns the SOURCE only. Removing it would leave this
         card the one chain in the folder written without it.
NOT A DEFECT
         Steps 3 and 5 stand completely still for their whole duration, which puts them at the
         still end of the catalog. Both are packet-less and Pod-less by construction (M-27),
         and both sit in the faster half on reading pace, so the hold is buying reading time
         rather than standing empty. card-review/tools/deadair.mjs prints both rankings, and
         workloads-container-states carries three steps of the same shape.
```

### before `const REQ_LANE = [[KUBECTL_X, TOP_CY], [API_R, TOP_CY]];`

```
One lane on the top row, and it is a deliberate absence rather than an omission. WL.A-01
counts 16 of the cards drawing the request and answer pair, and this card names nothing
coming back: kubectl writes, the API appends, and the object is read off the chip column
instead. An answer lane with nothing on it carries an arrowhead over no traffic (A-05).
```

### before `      tune: (el, refs) => {`

```
buildPod carries exactly one inner box, and this card needs two. The debug container is
appended INSIDE the Pod group rather than beside it, because pulsePod reaches only what the
Pod contains and step 4 blinks the Pod with the new container already in it.

box() defaults its role to the empty string, so the kit binding is not inherited here and
`role: 'workloads'` is written out. It equals the binding and is not a cross-category
override: the app box that buildPod makes takes the same role from the Pod.

The box is built at OPACITY.terminated rather than at 0. C-14: a block that does not exist
yet dims and is never cut out, because cutting it leaves a block-sized hole, and here that
hole is the whole right flank of the Pod on four of the six steps. The sublabel says which
of the two it is, `not in the spec yet` before the write and `ephemeral container` after.
```

### before `    id: 'contract',`

```
The one step with no ball and no Pod acting. Its beat is four contract rows lighting under
the API box that refuses them, which M-27 asks for and which the CSS transition on
.scheme-chip-rect carries over 300ms. chain takes a LIST here, not an index: the four
refusals are one statement and lighting them one at a time would make them four.
```

### poster

```
A closed Pod with one gap in its top edge, and the object coming in through it. The
sentence is that the door is the whole story: the app container sits inside at the loser
opacity of 0.3, the slot beside it is drawn dashed and empty, and the EphemeralContainer
above the Pod carries the brightest fill and the 0.9 accent bar because it is what the card
is about. The Pod outline is an open path rather than a rect, so the gap in the top edge is
the only way in and no arrowhead is needed to say which direction anything travels.
```
