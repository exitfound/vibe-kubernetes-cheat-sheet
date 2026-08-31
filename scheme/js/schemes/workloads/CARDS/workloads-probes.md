## workloads-probes

### layout

```
WHAT     startupProbe, readinessProbe and livenessProbe against one container, and what each
         failure does to the EndpointSlice.
LAYOUT   A, and THE WORKLOADS EXEMPLAR (`WL.S-02`). New workloads cards copy this shape, with the
         one exception LANES names below. Both columns start on one line at
         `BAND_Y = PANEL_B + PANEL_GAP`, 276, and the panel reading it is derived from is PANEL.
           ladder left  60..540 (LAYOUT.A.ladder)
           chips  right 660..1140 (LAYOUT.A.chips), 5 x 34, gap 8
           node   full width, 496..624
         The ladder is not in the RIGHT column with the chips as a five-across bottom strip: at
         205 wide three chip names overlap their values ("EndpointSlice" against
         "10.244.1.5 ready=false" by 60 units), and the whole left band under the panel is left
         empty.
PANEL    x<=397 catalog-wide (`L-02`). Bottom per viewport, from `scheme/test`:
         `OVERLAY_IDS=workloads-probes node --test report/overlay.test.mjs`.
         Deepest on step 0 at 1100x800, shallowest on step 2 at 1600x1000, a swing of 129.55 units
         across the set. `PANEL_B 255` in the header is that deepest reading rounded up, and what
         stands under it is BAND_Y, where BOTH columns start: the measured clearance is 21.34, which
         is `PANEL_GAP` and nothing more. There is no head room here to spend, so a longer narration
         on any step is paid for inside that step and never by moving the band.
LANES    Down the corridor between the two columns at WL.SPINE_X. SPINE_UP is its reverse, so the
         report hop and the probe hop cannot drift apart.
         THE ONE THING NOT TO COPY FROM THE EXEMPLAR. Both ends land on the Pod top midpoint at
         y 518 and not on the Node frame face at 496, which is the shape `WL.A-03` puts in the
         queue `report/frame-face.test.mjs` prints, and this card is on that queue. A new card
         copying this one takes `SPINE` to the frame face instead: `[[WL.SPINE_X, WL.TOP_BOTTOM],
         [WL.SPINE_X, NODE_Y]]`. The frame here is already full width, so its top midpoint is
         `WL.SPINE_X` and nothing else has to move. It IS a timing change, because `routeDur` is
         length-based (`A-11`), so the two spans are re-read after it.
MOTION   Six steps and two beat shapes, which is why this card is the one to copy. The three
         UP-arrow steps put the Pod first: `startup-success`, `ready` and `liveness-fail` pulse at
         delay 0 and the report leaves at `BEAT.afterPulse` (M-15). The two DOWN-arrow steps invert
         it: `startup-running` and `recovery` send the probe first and pulse `at: 'probe'`, on its
         arrival, so the container blinks because something reached it.
         Which pulse is dim follows the Pod's opacity at the moment it fires, never the step's
         subject: `startup-running` and `startup-success` take `dim: true` because the Pod is still
         `OPACITY.pending` and a full pulse would fill it forward to a brightness the step has not
         earned. `ready`, `liveness-fail` and `recovery` take the plain pulse.
         The opacity ladder over the six steps is pending, pending, pending, 1, notready, 1, and
         each move is a separate `F.fade` rather than a step field, because the reader has to see it
         travel: readiness lifts it on `ready`, the kill drops it on `liveness-fail`, the fresh
         container lifts it again on `recovery`.
         `liveness-fail` is the one place a fade carries a LITERAL delay,
         `BEAT.afterPulse + BEAT.afterHop`, rather than riding `at:` the hop. The kill hangs off the
         PULSE and not off the report arriving at the Kubelet: the container dies when Kubelet
         decides, and the report is what it sends afterwards. `recovery` is the opposite case and
         says so by riding `at: 'probe'` with the pulse, one arrival, two things.
         One corridor is drawn twice, `connectorDown` and `connectorUp`, and exactly one is visible
         per step. The pair is written ONCE in the `corridor(dir)` helper, which returns the two
         opacity fields together, so no step can leave both on or neither.
```

### poster

```
Three dashed legs into one container, and the three circles at their far ends are empty, half filled
and solid. Three probes, one target, and the fill ramp is the only difference between them.
They are deliberately NOT labelled and NOT ordered top to bottom by importance: the card is about
three independent questions on their own periods, so a numbered stack would be the wrong sentence.
```
